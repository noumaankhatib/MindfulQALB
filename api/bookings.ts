import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleCorsPrelight, validateMethod } from './_utils/cors.js';
import { 
  validateSessionType, 
  validateDate, 
  validateTime, 
  validateCustomer,
  sanitizeString,
  validateNotes
} from './_utils/validation.js';
import { rateLimiters } from './_utils/rateLimit.js';

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

// Safely parse event type IDs from environment
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

// Create Cal.com booking
const createCalComBooking = async (
  sessionType: string,
  date: string,
  time: string,
  customer: { name: string; email: string; phone: string; notes?: string },
  requestId: string
): Promise<{ success: boolean; bookingId?: string; error?: string }> => {
  const apiKey = process.env.CALCOM_API_KEY;
  const eventTypeIds = parseEventTypeIds();

  if (!apiKey) {
    return { success: true, bookingId: `dev_${Date.now()}` };
  }

  try {
    const eventTypeId = eventTypeIds[sessionType];
    if (!eventTypeId) {
      return { success: true, bookingId: `local_${Date.now()}` };
    }

    const startTime = parseTimeToISO(date, time);
    const url = 'https://api.cal.com/v1/bookings';

    const response = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
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
        metadata: { requestId },
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
  const corsResult = handleCorsPrelight(req, res);
  if (corsResult === true) return;
  const requestId = corsResult as string;
  
  // Rate limiting
  if (rateLimiters.default(req, res)) return;
  
  if (!validateMethod(req, res, ['POST'])) return;

  try {
    const { sessionType, date, time, customer } = req.body;

    // Validate all inputs
    const sessionTypeResult = validateSessionType(sessionType);
    if (!sessionTypeResult.valid) {
      return res.status(400).json({ error: sessionTypeResult.error, requestId });
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

    // Create booking
    const result = await createCalComBooking(sessionType, date, time, customer, requestId);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to create booking',
        requestId,
      });
    }

    res.json({
      success: true,
      bookingId: result.bookingId,
      message: 'Booking created successfully',
      requestId,
    });
  } catch (error) {
    console.error(`[${requestId}] Booking error:`, error instanceof Error ? error.message : 'Unknown error');
    res.status(500).json({
      success: false,
      error: 'Failed to create booking',
      requestId,
    });
  }
}
