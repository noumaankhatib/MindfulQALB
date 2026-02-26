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

// Parse date+time as Asia/Kolkata and return UTC ISO for Cal.com v2 (start must be UTC)
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

// Safely parse event type IDs from environment (keys e.g. "individual-video", "individual-chat")
const parseEventTypeIds = (): Record<string, string> => {
  const raw = process.env.CALCOM_EVENT_TYPE_IDS;
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === 'object' && parsed !== null) {
      return parsed as Record<string, string>;
    }
    return {};
  } catch {
    console.error('Invalid CALCOM_EVENT_TYPE_IDS JSON configuration');
    return {};
  }
};

// Duration in minutes by raw format (matches frontend config)
const DURATION_BY_RAW_FORMAT: Record<string, number> = {
  call: 15,
  chat: 30,
  audio: 45,
  video: 60,
};

// Map session type to DB enum (individual | couples | family)
const toDbSessionType = (sessionType: string): 'individual' | 'couples' | 'family' => {
  const t = sessionType.toLowerCase();
  if (t === 'couples' || t === 'family') return t;
  return 'individual';
};

// Map format to DB enum
const toDbFormat = (format: string): 'chat' | 'audio' | 'video' => {
  const f = format.toLowerCase();
  if (f === 'chat' || f === 'audio') return f;
  return 'video';
};

// Create Cal.com booking via v1 API. Session type + format → event type key e.g. "individual-video"
const createCalComBooking = async (
  sessionType: string,
  format: string,
  date: string,
  time: string,
  customer: { name: string; email: string; phone: string; notes?: string },
  requestId: string
): Promise<{ success: boolean; bookingId?: string; calComUid?: string; error?: string }> => {
  const apiKey = process.env.CALCOM_API_KEY?.trim();
  const eventTypeIds = parseEventTypeIds();
  const combinedKey = `${sessionType}-${format}`;

  if (!apiKey || apiKey.length < 20) {
    console.error(`[${requestId}] CALCOM_API_KEY missing or too short (length: ${apiKey?.length ?? 0})`);
    return { success: false, error: 'Cal.com API key not set. Add CALCOM_API_KEY in environment.' };
  }

  const eventTypeId = eventTypeIds[combinedKey] ?? eventTypeIds[sessionType];
  if (!eventTypeId) {
    console.error(`[${requestId}] No event type ID for "${combinedKey}". Available keys: ${Object.keys(eventTypeIds).join(', ') || '(none – CALCOM_EVENT_TYPE_IDS is empty)'}`);
    return { success: false, error: `Cal.com event type missing for "${combinedKey}". Set CALCOM_EVENT_TYPE_IDS (e.g. {"individual-video":"123"}).` };
  }

  console.log(`[${requestId}] Creating Cal.com booking: eventTypeId=${eventTypeId}, key=${combinedKey}, date=${date}, time=${time}`);

  try {
    const startTime = parseTimeToUTCISO(date, time);
    const durationMinutes = DURATION_BY_RAW_FORMAT[format.toLowerCase()] ?? 60;
    const endTime = new Date(new Date(startTime).getTime() + durationMinutes * 60 * 1000).toISOString();

    const url = `https://api.cal.com/v1/bookings?apiKey=${encodeURIComponent(apiKey)}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventTypeId: parseInt(eventTypeId, 10),
        start: startTime,
        end: endTime,
        responses: {
          name: sanitizeString(customer.name),
          email: customer.email.toLowerCase().trim(),
          phone: customer.phone || undefined,
          notes: customer.notes ? sanitizeString(customer.notes) : undefined,
        },
        timeZone: 'Asia/Kolkata',
        language: 'en',
        metadata: { requestId },
      }),
    });

    const json = await response.json().catch(() => ({})) as Record<string, unknown>;
    console.log(`[${requestId}] Cal.com v1 booking response ${response.status}:`, JSON.stringify(json).substring(0, 500));

    if (!response.ok) {
      const msg = (json.message as string) ?? (json.error as string) ?? `Cal.com API ${response.status}`;
      throw new Error(msg);
    }

    const uid = (json.uid as string) ?? (json.id != null ? String(json.id) : null) ?? `CAL-${Date.now()}`;
    return { success: true, bookingId: uid, calComUid: (json.uid as string) ?? undefined };
  } catch (error) {
    console.error(`[${requestId}] Cal.com booking error:`, error instanceof Error ? error.message : error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Booking failed',
    };
  }
};

// Insert booking into Supabase so it appears in Admin and My Bookings
const insertBookingToSupabase = async (params: {
  sessionType: string;
  format: string;
  date: string;
  time: string;
  customer: { name: string; email: string; phone: string; notes?: string };
  calComBookingId: string | null;
  calComUid: string | null;
  userId?: string | null;
  requestId: string;
}): Promise<{ id: string } | null> => {
  const supabase = getSupabaseServer();
  if (!supabase) return null;

  const {
    sessionType,
    format,
    date,
    time,
    customer,
    calComBookingId,
    calComUid,
    userId,
    requestId,
  } = params;

  const rawFormat = format.toLowerCase();
  const isFreeSession = sessionType.toLowerCase() === 'free';
  const session_type = toDbSessionType(sessionType);
  const session_format = toDbFormat(format);
  const duration_minutes = DURATION_BY_RAW_FORMAT[rawFormat] ?? DURATION_BY_RAW_FORMAT[session_format] ?? 60;
  const now = new Date().toISOString();

  const notesRaw = customer.notes ? sanitizeString(customer.notes) : null;
  const notes = isFreeSession
    ? (notesRaw ? `[FREE_CONSULTATION] ${notesRaw}` : '[FREE_CONSULTATION]')
    : notesRaw;

  const row = {
    user_id: userId ?? null,
    session_type,
    session_format,
    duration_minutes,
    scheduled_date: date,
    scheduled_time: time,
    timezone: 'Asia/Kolkata',
    status: 'pending',
    calcom_booking_id: calComBookingId,
    calcom_booking_uid: calComUid,
    customer_name: sanitizeString(customer.name),
    customer_email: customer.email.toLowerCase().trim(),
    customer_phone: customer.phone?.trim() || null,
    notes,
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await supabase.from('bookings').insert(row).select('id').single();

  if (error) {
    console.error(`[${requestId}] Supabase booking insert failed:`, error.code, error.message, error.details);
    return null;
  }
  return data as { id: string };
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  const corsResult = handleCorsPrelight(req, res);
  if (corsResult === true) return;
  const requestId = corsResult as string;
  
  // Rate limiting
  if (rateLimiters.default(req, res)) return;
  
  if (!validateMethod(req, res, ['POST'])) return;

  try {
    const { sessionType, format, date, time, customer, user_id: userId } = req.body;

    // Validate all inputs
    const sessionTypeResult = validateSessionType(sessionType);
    if (!sessionTypeResult.valid) {
      return res.status(400).json({ error: sessionTypeResult.error, requestId });
    }

    const formatResult = validateFormat(format);
    if (!formatResult.valid) {
      return res.status(400).json({ error: formatResult.error, requestId });
    }

    const dateResult = validateDate(date);
    if (!dateResult.valid) {
      return res.status(400).json({ error: dateResult.error, requestId });
    }

    const timeResult = validateTime(time);
    if (!timeResult.valid) {
      return res.status(400).json({ error: timeResult.error, requestId });
    }

    const customerResult = validateCustomer(customer);
    if (!customerResult.valid) {
      return res.status(400).json({ error: customerResult.error, requestId });
    }

    // Validate notes length if provided
    if (customer?.notes) {
      const notesResult = validateNotes(customer.notes);
      if (!notesResult.valid) {
        return res.status(400).json({ error: notesResult.error, requestId });
      }
    }

    // Create booking on Cal.com
    const result = await createCalComBooking(
      sessionType,
      format,
      date,
      time,
      customer,
      requestId
    );

    // If Cal.com failed, still try to persist to Supabase so the booking shows in Admin/My Bookings
    const bookingId = result.bookingId ?? `local_${Date.now()}`;
    const calComUid = result.calComUid ?? null;

    let dbRow: { id: string } | null = null;
    try {
      dbRow = await insertBookingToSupabase({
        sessionType,
        format,
        date,
        time,
        customer,
        calComBookingId: result.success ? bookingId : null,
        calComUid: result.success ? calComUid : null,
        userId: typeof userId === 'string' ? userId : null,
        requestId,
      });
    } catch (dbErr) {
      console.error(`[${requestId}] Supabase insert error:`, dbErr instanceof Error ? dbErr.message : dbErr);
    }

    if (!result.success) {
      console.error(`[${requestId}] Cal.com booking FAILED: ${result.error}. DB row: ${dbRow ? dbRow.id : 'none'}`);
      if (dbRow) {
        return res.json({
          success: true,
          bookingId: dbRow.id,
          databaseId: dbRow.id,
          calcomSynced: false,
          message: 'Booking saved. Calendar sync failed – please verify on Cal.com dashboard.',
          calcomError: result.error,
          requestId,
        });
      }
      return res.status(500).json({
        success: false,
        error: 'Failed to create booking. Please try again or contact support.',
        requestId,
      });
    }

    console.log(`[${requestId}] Booking created: calcom=${bookingId}, db=${dbRow?.id ?? 'none'}`);
    res.json({
      success: true,
      bookingId,
      databaseId: dbRow?.id ?? undefined,
      calcomSynced: true,
      message: 'Booking created successfully',
      requestId,
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[${requestId}] Booking error:`, errMsg, error instanceof Error ? error.stack : '');
    res.status(500).json({
      success: false,
      error: 'Failed to create booking. Please try again or contact support.',
      requestId,
    });
  }
}
