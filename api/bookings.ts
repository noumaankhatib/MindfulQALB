import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleCorsPrelight, validateMethod } from './_utils/cors';
import { 
  validateSessionType, 
  validateDate, 
  validateTime, 
  validateCustomer,
  sanitizeString 
} from './_utils/validation';

// Parse time to ISO
const parseTimeToISO = (dateString: string, timeString: string): string => {
  const match = timeString.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) throw new Error('Invalid time format');

  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const period = match[3].toUpperCase();

  if (period === 'PM' && hours !== 12) hours += 12;
  else if (period === 'AM' && hours === 12) hours = 0;

  const date = new Date(dateString);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
};

// Create Cal.com booking
const createCalComBooking = async (
  sessionType: string,
  date: string,
  time: string,
  customer: { name: string; email: string; phone: string; notes?: string }
): Promise<{ success: boolean; bookingId?: string; error?: string }> => {
  const apiKey = process.env.CALCOM_API_KEY;
  const eventTypeIds = JSON.parse(process.env.CALCOM_EVENT_TYPE_IDS || '{}');

  if (!apiKey) {
    // Return mock booking ID for development
    return { success: true, bookingId: `dev_${Date.now()}` };
  }

  try {
    const eventTypeId = eventTypeIds[sessionType];
    if (!eventTypeId) {
      return { success: true, bookingId: `local_${Date.now()}` };
    }

    const startTime = parseTimeToISO(date, time);
    const url = `https://api.cal.com/v1/bookings?apiKey=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventTypeId: parseInt(eventTypeId),
        start: startTime,
        responses: {
          name: sanitizeString(customer.name),
          email: customer.email.toLowerCase().trim(),
          phone: customer.phone,
          notes: customer.notes ? sanitizeString(customer.notes) : '',
        },
        timeZone: 'Asia/Kolkata',
        language: 'en',
        metadata: {},
      }),
    });

    if (!response.ok) {
      const errorData = await response.json() as { message?: string };
      throw new Error(errorData.message || 'Booking failed');
    }

    const bookingData = await response.json() as { uid?: string };
    return { success: true, bookingId: bookingData.uid || `CAL-${Date.now()}` };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Booking failed',
    };
  }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  if (handleCorsPrelight(req, res)) return;
  if (!validateMethod(req, res, ['POST'])) return;

  try {
    const { sessionType, date, time, customer } = req.body;

    // Validate all inputs
    const sessionTypeResult = validateSessionType(sessionType);
    if (!sessionTypeResult.valid) {
      return res.status(400).json({ error: sessionTypeResult.error });
    }
    
    const dateResult = validateDate(date);
    if (!dateResult.valid) {
      return res.status(400).json({ error: dateResult.error });
    }
    
    const timeResult = validateTime(time);
    if (!timeResult.valid) {
      return res.status(400).json({ error: timeResult.error });
    }
    
    const customerResult = validateCustomer(customer);
    if (!customerResult.valid) {
      return res.status(400).json({ error: customerResult.error });
    }

    // Create booking
    const result = await createCalComBooking(sessionType, date, time, customer);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to create booking',
      });
    }

    res.json({
      success: true,
      bookingId: result.bookingId,
      message: 'Booking created successfully',
    });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create booking',
    });
  }
}
