import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleCorsPrelight, validateMethod } from './_utils/cors.js';
import { validateDate } from './_utils/validation.js';
import { rateLimiters } from './_utils/rateLimit.js';

interface TimeSlot {
  time: string;
  available: boolean;
}

interface CalComSlot {
  time: string;
}

// Check if a date is a weekend (Saturday = 6, Sunday = 0)
const isWeekend = (dateString: string): boolean => {
  const date = new Date(dateString);
  const day = date.getDay();
  return day === 0 || day === 6;
};

// Only these time slots are offered to users (therapist's preferred hours)
const ALLOWED_SLOTS = ['9:00 AM', '10:00 AM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'];

const getAllowedSlots = (allAvailable: boolean): TimeSlot[] =>
  ALLOWED_SLOTS.map(time => ({ time, available: allAvailable }));

// Use the shortest event type for availability checking so we get the most granular
// slot start times. This ensures :00 marks appear (e.g. 9:00 AM, 5:00 PM) which
// align with ALLOWED_SLOTS. Longer events may only show :30 marks due to IST offset.
const CANONICAL_AVAILABILITY_SLUG = 'free-consultation';

const normalize = (t: string) => t.replace(/\s+/g, ' ').trim().toLowerCase();

const fetchCalComAvailability = async (date: string, _sessionType?: string, requestId?: string): Promise<{ slots: TimeSlot[]; source: 'calcom' | 'fallback'; error?: string }> => {
  const apiKey = process.env.CALCOM_API_KEY?.trim();
  const username = process.env.CALCOM_USERNAME || 'mindfulqalb';
  
  if (!apiKey) {
    console.warn(`[${requestId}] CALCOM_API_KEY not set – returning fallback slots`);
    return { slots: getAllowedSlots(true), source: 'fallback', error: 'CALCOM_API_KEY not configured' };
  }

  try {
    const eventTypeSlug = process.env.CALCOM_AVAILABILITY_SLUG || CANONICAL_AVAILABILITY_SLUG;
    const url = `https://api.cal.com/v1/slots?` + new URLSearchParams({
      apiKey,
      eventTypeSlug,
      usernameList: username,
      startTime: `${date}T00:00:00.000Z`,
      endTime: `${date}T23:59:59.999Z`,
    });

    console.log(`[${requestId}] Cal.com availability: username=${username}, slug=${eventTypeSlug}, date=${date}`);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    
    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      console.error(`[${requestId}] Cal.com slots API error ${response.status}: ${errorBody}`);
      return { slots: getAllowedSlots(true), source: 'fallback', error: `Cal.com API returned ${response.status}` };
    }

    const data = await response.json();
    const dateSlots = data.slots?.[date] || [];
    
    console.log(`[${requestId}] Cal.com returned ${dateSlots.length} raw slots for ${date}`);

    // Convert Cal.com UTC times to IST display strings
    const calcomTimes = new Set(
      dateSlots.map((slot: CalComSlot) =>
        normalize(new Date(slot.time).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
          timeZone: 'Asia/Kolkata',
        }))
      )
    );

    // Filter ALLOWED_SLOTS: mark available only when Cal.com has a matching slot
    const slots: TimeSlot[] = ALLOWED_SLOTS.map(time => ({
      time,
      available: calcomTimes.has(normalize(time)),
    }));

    console.log(`[${requestId}] Filtered slots: ${slots.filter(s => s.available).map(s => s.time).join(', ') || 'none'}`);

    return { slots, source: 'calcom' };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[${requestId}] Cal.com availability fetch failed:`, msg);
    return { slots: getAllowedSlots(true), source: 'fallback', error: msg };
  }
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
    const { date } = req.body;
    // sessionType is accepted but ignored – one set of slots for all types
    const dateResult = validateDate(date);
    if (!dateResult.valid) {
      return res.status(400).json({ error: dateResult.error, requestId });
    }

    // Check if date is a weekend
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

    const result = await fetchCalComAvailability(date, undefined, requestId);
    
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
    res.json({
      success: true,
      date,
      slots: result.slots,
      source: result.source,
      ...(result.error ? { calcomError: result.error } : {}),
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
