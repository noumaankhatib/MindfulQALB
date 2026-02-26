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

// Allowed time slots (9 AM, 10 AM, 5 PM, 6 PM, 7 PM, 8 PM)
const ALLOWED_SLOTS = ['9:00 AM', '10:00 AM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'];

// Check if a date is a weekend (Saturday = 6, Sunday = 0)
const isWeekend = (dateString: string): boolean => {
  const date = new Date(dateString);
  const day = date.getDay();
  return day === 0 || day === 6;
};

// Get mock slots for development/fallback
const getMockSlots = (): TimeSlot[] => [
  { time: '9:00 AM', available: true },
  { time: '10:00 AM', available: true },
  { time: '5:00 PM', available: true },
  { time: '6:00 PM', available: true },
  { time: '7:00 PM', available: true },
  { time: '8:00 PM', available: true },
];

// Filter slots to only include allowed times
const filterAllowedSlots = (slots: TimeSlot[]): TimeSlot[] => {
  return slots.filter(slot => {
    // Normalize the time format for comparison
    const normalizedTime = slot.time.replace(/\s+/g, ' ').trim();
    return ALLOWED_SLOTS.some(allowed => 
      normalizedTime.toLowerCase() === allowed.toLowerCase() ||
      normalizedTime.replace(':00', '') === allowed.replace(':00', '')
    );
  });
};

// Use a single canonical event type so slots are common for all session types (one therapist, one calendar).
const CANONICAL_AVAILABILITY_SLUG = 'individual-therapy-video';

const fetchCalComAvailability = async (date: string, _sessionType?: string, requestId?: string): Promise<{ slots: TimeSlot[]; source: 'calcom' | 'fallback'; error?: string }> => {
  const apiKey = process.env.CALCOM_API_KEY?.trim();
  const username = process.env.CALCOM_USERNAME || 'mindfulqalb';
  
  if (!apiKey) {
    console.warn(`[${requestId}] CALCOM_API_KEY not set – returning fallback slots`);
    return { slots: getMockSlots(), source: 'fallback', error: 'CALCOM_API_KEY not configured' };
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

    const response = await fetch(url);
    
    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      console.error(`[${requestId}] Cal.com slots API error ${response.status}: ${errorBody}`);
      return { slots: getMockSlots(), source: 'fallback', error: `Cal.com API returned ${response.status}` };
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

    const filteredSlots = filterAllowedSlots(slots);
    
    if (slots.length > 0 && filteredSlots.length === 0) {
      return { slots: getMockSlots().map(slot => ({ ...slot, available: false })), source: 'calcom' };
    }
    
    const calComAvailableTimes = filteredSlots.map(s => s.time.toLowerCase());
    const allSlots = getMockSlots().map(slot => ({
      ...slot,
      available: calComAvailableTimes.some(t => 
        t === slot.time.toLowerCase() || 
        t.replace(':00', '') === slot.time.toLowerCase().replace(':00', '')
      ),
    }));

    return { slots: allSlots, source: 'calcom' };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[${requestId}] Cal.com availability fetch failed:`, msg);
    return { slots: getMockSlots(), source: 'fallback', error: msg };
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
