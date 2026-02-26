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

// Fallback slots when Cal.com API is unavailable
const getFallbackSlots = (): TimeSlot[] => [
  { time: '9:00 AM', available: true },
  { time: '10:00 AM', available: true },
  { time: '5:00 PM', available: true },
  { time: '6:00 PM', available: true },
  { time: '7:00 PM', available: true },
  { time: '8:00 PM', available: true },
];

// Use a single canonical event type so slots are common for all session types (one therapist, one calendar).
const CANONICAL_AVAILABILITY_SLUG = 'individual-therapy-video';

const fetchCalComAvailability = async (date: string, _sessionType?: string, requestId?: string): Promise<{ slots: TimeSlot[]; source: 'calcom' | 'fallback'; error?: string }> => {
  const apiKey = process.env.CALCOM_API_KEY?.trim();
  const username = process.env.CALCOM_USERNAME || 'mindfulqalb';
  
  if (!apiKey) {
    console.warn(`[${requestId}] CALCOM_API_KEY not set – returning fallback slots`);
    return { slots: getFallbackSlots(), source: 'fallback', error: 'CALCOM_API_KEY not configured' };
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
      return { slots: getFallbackSlots(), source: 'fallback', error: `Cal.com API returned ${response.status}` };
    }

    const data = await response.json();
    const dateSlots = data.slots?.[date] || [];
    
    console.log(`[${requestId}] Cal.com returned ${dateSlots.length} raw slots for ${date}`);

    const slots: TimeSlot[] = dateSlots.map((slot: CalComSlot) => {
      const time = new Date(slot.time);
      return {
        time: time.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
          timeZone: 'Asia/Kolkata',
        }),
        available: true,
      };
    });

    return { slots, source: 'calcom' };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[${requestId}] Cal.com availability fetch failed:`, msg);
    return { slots: getFallbackSlots(), source: 'fallback', error: msg };
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
