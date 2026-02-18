import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleCorsPrelight, validateMethod } from './_utils/cors.js';
import { validateSessionType, validateDate } from './_utils/validation.js';
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

// Fetch from Cal.com using Authorization header (not URL params)
const fetchCalComAvailability = async (date: string, sessionType: string): Promise<TimeSlot[]> => {
  const apiKey = process.env.CALCOM_API_KEY;
  const username = process.env.CALCOM_USERNAME || 'mindfulqalb';
  
  if (!apiKey) {
    return getMockSlots();
  }

  try {
    const eventTypeSlug = getEventTypeSlug(sessionType);
    const url = `https://api.cal.com/v1/slots?` + new URLSearchParams({
      eventTypeSlug,
      username,
      startTime: `${date}T00:00:00.000Z`,
      endTime: `${date}T23:59:59.999Z`,
    });

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      return getMockSlots();
    }

    const data = await response.json();
    const dateSlots = data.slots?.[date] || [];
    
    // Map Cal.com slots to our format
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

    // Filter to only allowed time slots
    const filteredSlots = filterAllowedSlots(slots);
    
    // If Cal.com returned slots but none match our allowed times,
    // return mock slots with all marked as unavailable (booked on Cal.com)
    if (slots.length > 0 && filteredSlots.length === 0) {
      return getMockSlots().map(slot => ({ ...slot, available: false }));
    }
    
    // Mark slots that are NOT in Cal.com response as unavailable (booked)
    const calComAvailableTimes = filteredSlots.map(s => s.time.toLowerCase());
    const allSlots = getMockSlots().map(slot => ({
      ...slot,
      available: calComAvailableTimes.some(t => 
        t === slot.time.toLowerCase() || 
        t.replace(':00', '') === slot.time.toLowerCase().replace(':00', '')
      ),
    }));

    return allSlots;
  } catch {
    return getMockSlots();
  }
};

const getEventTypeSlug = (sessionType: string): string => {
  const slugMap: Record<string, string> = {
    individual: 'individual-therapy',
    couples: 'couples-therapy',
    family: 'family-therapy',
    free: 'free-consultation',
  };
  return slugMap[sessionType] || 'individual-therapy';
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
    const { date, sessionType } = req.body;
    
    // Validate inputs
    const sessionTypeResult = validateSessionType(sessionType);
    if (!sessionTypeResult.valid) {
      return res.status(400).json({ error: sessionTypeResult.error, requestId });
    }
    
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

    const slots = await fetchCalComAvailability(date, sessionType);
    
    res.json({
      success: true,
      date,
      slots,
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
