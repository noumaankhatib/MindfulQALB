import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleCorsPrelight, validateMethod } from './_utils/cors.js';
import { validateDate } from './_utils/validation.js';
import { rateLimiters } from './_utils/rateLimit.js';
import { isGoogleCalendarConfigured, getFreeBusy } from './_utils/googleCalendar.js';

interface TimeSlot {
  time: string;
  available: boolean;
}

const isWeekend = (dateString: string): boolean => {
  const date = new Date(dateString);
  const day = date.getDay();
  return day === 0 || day === 6;
};

const ALLOWED_SLOTS = ['9:00 AM', '10:00 AM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'];

const getAllowedSlots = (allAvailable: boolean): TimeSlot[] =>
  ALLOWED_SLOTS.map(time => ({ time, available: allAvailable }));

/**
 * Parse a 12-hour time string (e.g. "5:00 PM") on a given date into a UTC Date
 * object, treating the time as Asia/Kolkata.
 */
const slotToDate = (dateStr: string, timeStr: string): Date => {
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) throw new Error(`Invalid time: ${timeStr}`);

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  if (period === 'PM' && hours !== 12) hours += 12;
  else if (period === 'AM' && hours === 12) hours = 0;

  const iso = `${dateStr}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00+05:30`;
  return new Date(iso);
};

const fetchGoogleCalendarAvailability = async (date: string, requestId?: string): Promise<{ slots: TimeSlot[]; source: 'google' | 'fallback'; error?: string }> => {
  if (!isGoogleCalendarConfigured()) {
    console.warn(`[${requestId}] Google Calendar not configured – returning fallback slots`);
    return { slots: getAllowedSlots(true), source: 'fallback', error: 'Google Calendar not configured' };
  }

  try {
    const busyPeriods = await getFreeBusy(date);

    console.log(`[${requestId}] Google Calendar: ${busyPeriods.length} busy periods for ${date}`);

    const slots: TimeSlot[] = ALLOWED_SLOTS.map(time => {
      const slotStart = slotToDate(date, time);
      const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000); // 1 hour window

      const isBusy = busyPeriods.some(bp => {
        const busyStart = new Date(bp.start);
        const busyEnd = new Date(bp.end);
        return slotStart < busyEnd && slotEnd > busyStart;
      });

      return { time, available: !isBusy };
    });

    console.log(`[${requestId}] Available slots: ${slots.filter(s => s.available).map(s => s.time).join(', ') || 'none'}`);

    return { slots, source: 'google' };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[${requestId}] Google Calendar availability error:`, msg);
    return { slots: getAllowedSlots(true), source: 'fallback', error: msg };
  }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const corsResult = handleCorsPrelight(req, res);
  if (corsResult === true) return;
  const requestId = corsResult as string;

  if (rateLimiters.default(req, res)) return;
  if (!validateMethod(req, res, ['POST'])) return;

  try {
    const { date } = req.body;
    const dateResult = validateDate(date);
    if (!dateResult.valid) {
      return res.status(400).json({ error: dateResult.error, requestId });
    }

    if (isWeekend(date)) {
      return res.json({
        success: true,
        date,
        slots: [],
        isWeekend: true,
        message: 'No slots available on weekends',
        requestId,
      });
    }

    const result = await fetchGoogleCalendarAvailability(date, requestId);

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
    res.json({
      success: true,
      date,
      slots: result.slots,
      source: result.source,
      ...(result.error ? { calendarError: result.error } : {}),
      requestId,
    });
  } catch (error) {
    console.error(`[${requestId}] Availability error:`, error instanceof Error ? error.message : 'Unknown error');
    res.status(500).json({
      success: false,
      error: 'Failed to fetch availability',
      requestId,
    });
  }
}
