import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleCorsPrelight, validateMethod } from './_utils/cors.js';
import {
  validateSessionType,
  validateFormat,
  validateDate,
  validateTime,
  validateCustomer,
  sanitizeString,
  validateNotes,
} from './_utils/validation.js';
import { rateLimiters } from './_utils/rateLimit.js';
import { getSupabaseServer } from './_utils/supabase.js';
import { requireAdmin } from './_utils/adminAuth.js';
import { isGoogleCalendarConfigured, createCalendarEvent } from './_utils/googleCalendar.js';

const DURATION_BY_RAW_FORMAT: Record<string, number> = {
  call: 15,
  chat: 30,
  audio: 45,
  video: 60,
};

const toDbSessionType = (sessionType: string): 'individual' | 'couples' | 'family' => {
  const t = sessionType.toLowerCase();
  if (t === 'couples' || t === 'family') return t;
  return 'individual';
};

const toDbFormat = (format: string): 'chat' | 'audio' | 'video' => {
  const f = format.toLowerCase();
  if (f === 'chat' || f === 'audio') return f;
  return 'video';
};

/**
 * Parse "5:00 PM" on a date string into a UTC ISO string (treating input as IST).
 */
const parseTimeToUTCISO = (dateString: string, timeString: string): string => {
  const match = timeString.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) throw new Error('Invalid time format');

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  if (period === 'PM' && hours !== 12) hours += 12;
  else if (period === 'AM' && hours === 12) hours = 0;

  const time24 = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
  const isoInKolkata = `${dateString}T${time24}+05:30`;
  return new Date(isoInKolkata).toISOString();
};

// ─── POST: Create booking (Supabase only, status = pending) ─────────────────

async function handleCreate(req: VercelRequest, res: VercelResponse, requestId: string) {
  const { sessionType, format, date, time, customer, user_id: userId } = req.body;

  const sessionTypeResult = validateSessionType(sessionType);
  if (!sessionTypeResult.valid) return res.status(400).json({ error: sessionTypeResult.error, requestId });

  const formatResult = validateFormat(format);
  if (!formatResult.valid) return res.status(400).json({ error: formatResult.error, requestId });

  const dateResult = validateDate(date);
  if (!dateResult.valid) return res.status(400).json({ error: dateResult.error, requestId });

  const timeResult = validateTime(time);
  if (!timeResult.valid) return res.status(400).json({ error: timeResult.error, requestId });

  const customerResult = validateCustomer(customer);
  if (!customerResult.valid) return res.status(400).json({ error: customerResult.error, requestId });

  if (customer?.notes) {
    const notesResult = validateNotes(customer.notes);
    if (!notesResult.valid) return res.status(400).json({ error: notesResult.error, requestId });
  }

  const supabase = getSupabaseServer();
  if (!supabase) {
    return res.status(503).json({ success: false, error: 'Server configuration error', requestId });
  }

  const rawFormat = format.toLowerCase();
  const isFreeSession = sessionType.toLowerCase() === 'free';
  const session_type = toDbSessionType(sessionType);
  const session_format = toDbFormat(format);
  const duration_minutes = DURATION_BY_RAW_FORMAT[rawFormat] ?? DURATION_BY_RAW_FORMAT[session_format] ?? 60;
  const now = new Date().toISOString();
  const notesRaw = customer.notes ? sanitizeString(customer.notes) : null;
  const notes = isFreeSession ? (notesRaw ? `[FREE_CONSULTATION] ${notesRaw}` : '[FREE_CONSULTATION]') : notesRaw;

  const customerEmail = customer.email.toLowerCase().trim();

  // One booking per user per date+time: no clash across therapy types (free, individual, couples, etc.)
  const { data: existingAtSlot } = await supabase
    .from('bookings')
    .select('id, user_id, customer_email')
    .eq('scheduled_date', date)
    .eq('scheduled_time', time)
    .in('status', ['pending', 'confirmed']);
  const rows = (existingAtSlot ?? []) as { id: string; user_id?: string | null; customer_email?: string | null }[];
  const hasConflict = rows.some(
    (r) =>
      (typeof userId === 'string' && userId.length > 0 && r.user_id === userId) ||
      (r.customer_email && r.customer_email.toLowerCase() === customerEmail)
  );
  if (hasConflict) {
    return res.status(400).json({
      success: false,
      error: 'You already have a booking at this date and time. Please choose a different slot or cancel the existing one.',
      requestId,
    });
  }

  // Set user_id when provided (logged-in user) so My Bookings can show the booking by user_id.
  const row = {
    user_id: typeof userId === 'string' && userId.length > 0 ? userId : null,
    session_type,
    session_format,
    duration_minutes,
    scheduled_date: date,
    scheduled_time: time,
    timezone: 'Asia/Kolkata',
    status: 'pending',
    calendar_event_id: null,
    meeting_url: null,
    customer_name: sanitizeString(customer.name),
    customer_email: customerEmail,
    customer_phone: customer.phone?.trim() || null,
    notes,
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await supabase.from('bookings').insert(row).select('id').single();

  if (error) {
    console.error(`[${requestId}] Supabase booking insert failed:`, error.code, error.message);
    return res.status(500).json({ success: false, error: 'Failed to create booking', requestId });
  }

  console.log(`[${requestId}] Booking created: db=${data.id}`);
  res.json({
    success: true,
    bookingId: data.id,
    databaseId: data.id,
    message: 'Booking created successfully',
    requestId,
  });
}

// ─── PATCH: Confirm booking (admin only) – creates Calendar event + Meet ────

async function handleConfirm(req: VercelRequest, res: VercelResponse, requestId: string) {
  const adminResult = await requireAdmin(req);
  if (!adminResult.ok) {
    return res.status(adminResult.status).json({ ...adminResult.body, requestId });
  }

  const { bookingId } = req.body;
  if (!bookingId || typeof bookingId !== 'string') {
    return res.status(400).json({ error: 'bookingId is required', requestId });
  }

  const supabase = getSupabaseServer();
  if (!supabase) {
    return res.status(503).json({ success: false, error: 'Server configuration error', requestId });
  }

  const { data: booking, error: fetchErr } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .single();

  if (fetchErr || !booking) {
    return res.status(404).json({ success: false, error: 'Booking not found', requestId });
  }

  if (booking.status !== 'pending') {
    return res.status(400).json({ success: false, error: `Booking is already ${booking.status}`, requestId });
  }

  let calendarEventId: string | null = null;
  let meetingUrl: string | null = null;
  const includeMeet = booking.session_format === 'video' || booking.session_format === 'audio';

  // Create Google Calendar event + Meet link for video/audio sessions
  if (isGoogleCalendarConfigured()) {
    const formatLabel = booking.session_format.charAt(0).toUpperCase() + booking.session_format.slice(1);
    const typeLabel = booking.session_type.charAt(0).toUpperCase() + booking.session_type.slice(1);
    const summary = `${typeLabel} Therapy - ${formatLabel} (${booking.customer_name})`;
    const description = [
      `Session: ${typeLabel} ${formatLabel}`,
      `Client: ${booking.customer_name}`,
      `Email: ${booking.customer_email}`,
      booking.customer_phone ? `Phone: ${booking.customer_phone}` : '',
      booking.notes ? `Notes: ${booking.notes}` : '',
      `Duration: ${booking.duration_minutes} min`,
    ].filter(Boolean).join('\n');

    try {
      const startISO = parseTimeToUTCISO(booking.scheduled_date, booking.scheduled_time);
      const endISO = new Date(new Date(startISO).getTime() + booking.duration_minutes * 60_000).toISOString();

      const event = await createCalendarEvent({
        summary,
        description,
        startISO,
        endISO,
        attendeeEmail: booking.customer_email,
        includeMeet,
        requestId: bookingId,
      });

      calendarEventId = event.eventId;
      meetingUrl = event.meetingUrl;
      console.log(`[${requestId}] Calendar event created: ${event.eventId}, meet: ${meetingUrl ?? 'none'}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const is404 = msg.includes('404');
      if (is404) {
        console.warn(`[${requestId}] Google Calendar not found (404). Check GOOGLE_CALENDAR_ID and calendar sharing. Using Jitsi Meet fallback.`);
      } else {
        console.error(`[${requestId}] Google Calendar event creation failed:`, msg);
      }
      // Continue with confirmation even if calendar fails
    }
  }

  // For video/audio, always persist a meeting link (same as createCalendarEvent) so admin and user always see it
  if (includeMeet && !meetingUrl) {
    const slug = (bookingId || '').replace(/-/g, '').substring(0, 12);
    meetingUrl = `https://meet.jit.si/MindfulQALB-${slug}`;
  }

  const updatePayload: Record<string, unknown> = {
    status: 'confirmed',
    updated_at: new Date().toISOString(),
  };
  if (calendarEventId) updatePayload.calendar_event_id = calendarEventId;
  if (meetingUrl) updatePayload.meeting_url = meetingUrl;

  const { error: updateErr } = await supabase
    .from('bookings')
    .update(updatePayload)
    .eq('id', bookingId);

  if (updateErr) {
    console.error(`[${requestId}] Confirm update failed:`, updateErr.message);
    return res.status(500).json({ success: false, error: 'Failed to confirm booking', requestId });
  }

  console.log(`[${requestId}] Booking ${bookingId} confirmed`);
  res.json({
    success: true,
    bookingId,
    calendarEventId,
    meetingUrl,
    message: meetingUrl ? 'Booking confirmed with Google Meet link' : 'Booking confirmed',
    requestId,
  });
}

// ─── Router ──────────────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const corsResult = handleCorsPrelight(req, res);
  if (corsResult === true) return;
  const requestId = corsResult as string;

  if (rateLimiters.default(req, res)) return;
  if (!validateMethod(req, res, ['POST', 'PATCH'])) return;

  try {
    if (req.method === 'PATCH') {
      return handleConfirm(req, res, requestId);
    }
    return handleCreate(req, res, requestId);
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[${requestId}] Booking error:`, errMsg);
    res.status(500).json({
      success: false,
      error: 'Failed to process booking request',
      requestId,
    });
  }
}
