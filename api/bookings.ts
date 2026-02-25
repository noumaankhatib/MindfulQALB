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

// Duration in minutes by format (matches frontend config)
const DURATION_BY_FORMAT: Record<string, number> = {
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

const CALCOM_V2_VERSION = '2024-08-13';

// Create Cal.com booking via v2 API (v1 deprecated). Session type + format → event type key e.g. "individual-video"
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
    return { success: false, error: 'Cal.com API key not set. Add CALCOM_API_KEY in environment.' };
  }

  const eventTypeId = eventTypeIds[combinedKey] ?? eventTypeIds[sessionType];
  if (!eventTypeId) {
    return { success: false, error: `Cal.com event type missing for "${combinedKey}". Set CALCOM_EVENT_TYPE_IDS (e.g. {"individual-video":"123"}).` };
  }

  try {
    const startTime = parseTimeToUTCISO(date, time);
    const url = 'https://api.cal.com/v2/bookings';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'cal-api-version': CALCOM_V2_VERSION,
      },
      body: JSON.stringify({
        eventTypeId: parseInt(eventTypeId, 10),
        start: startTime,
        attendee: {
          name: sanitizeString(customer.name),
          email: customer.email.toLowerCase().trim(),
          timeZone: 'Asia/Kolkata',
          language: 'en',
          ...(customer.phone ? { phoneNumber: customer.phone } : {}),
        },
        metadata: { requestId },
      }),
    });

    const json = await response.json().catch(() => ({})) as { status?: string; data?: { uid?: string; id?: number }; message?: string };
    if (!response.ok) {
      const msg = json.message ?? (typeof json === 'object' && json !== null && 'error' in json ? String((json as { error?: string }).error) : null) ?? `Cal.com API ${response.status}`;
      throw new Error(msg);
    }
    if (json.status === 'error') {
      throw new Error(json.message || 'Cal.com returned error');
    }

    const data = json.data;
    const uid = (data?.uid ?? data?.id != null ? String(data.id) : null) ?? `CAL-${Date.now()}`;
    return { success: true, bookingId: uid, calComUid: data?.uid ?? (data?.id != null ? String(data.id) : null) ?? undefined };
  } catch (error) {
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

  const session_type = toDbSessionType(sessionType);
  const session_format = toDbFormat(format);
  const duration_minutes = DURATION_BY_FORMAT[format] ?? 60;
  const now = new Date().toISOString();

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
    notes: customer.notes ? sanitizeString(customer.notes) : null,
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
      console.error(`[${requestId}] Cal.com booking failed (booking saved to DB):`, result.error);
      // Still return 200 if we saved to Supabase so user sees confirmation and booking in admin
      if (dbRow) {
        return res.json({
          success: true,
          bookingId: dbRow.id,
          databaseId: dbRow.id,
          message: 'Booking saved. Calendar sync may follow.',
          requestId,
        });
      }
      return res.status(500).json({
        success: false,
        error: 'Failed to create booking. Please try again or contact support.',
        requestId,
      });
    }

    res.json({
      success: true,
      bookingId,
      databaseId: dbRow?.id ?? undefined,
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
