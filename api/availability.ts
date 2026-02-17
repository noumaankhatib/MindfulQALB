import type { VercelRequest, VercelResponse } from '@vercel/node';

interface TimeSlot {
  time: string;
  available: boolean;
}

interface CalComSlot {
  time: string;
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Get mock slots for development/fallback
const getMockSlots = (): TimeSlot[] => [
  { time: '10:00 AM', available: true },
  { time: '11:00 AM', available: true },
  { time: '12:00 PM', available: false },
  { time: '2:00 PM', available: true },
  { time: '3:00 PM', available: true },
  { time: '4:00 PM', available: true },
  { time: '5:00 PM', available: true },
];

// Fetch from Cal.com
const fetchCalComAvailability = async (date: string, sessionType: string): Promise<TimeSlot[]> => {
  const apiKey = process.env.CALCOM_API_KEY;
  const username = process.env.CALCOM_USERNAME || 'mindfulqalb';
  
  if (!apiKey) {
    return getMockSlots();
  }

  try {
    const eventTypeSlug = getEventTypeSlug(sessionType);
    const url = `https://api.cal.com/v1/slots?` + new URLSearchParams({
      apiKey,
      eventTypeSlug,
      username,
      startTime: `${date}T00:00:00.000Z`,
      endTime: `${date}T23:59:59.999Z`,
    });

    const response = await fetch(url);
    
    if (!response.ok) {
      return getMockSlots();
    }

    const data = await response.json();
    const dateSlots = data.slots?.[date] || [];
    
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

    return slots.length > 0 ? slots : getMockSlots();
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
  // Set CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { date, sessionType } = req.body;
    
    if (!date || !sessionType) {
      return res.status(400).json({ error: 'Date and sessionType are required' });
    }

    const slots = await fetchCalComAvailability(date, sessionType);
    
    res.json({
      success: true,
      date,
      slots,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch availability',
    });
  }
}
