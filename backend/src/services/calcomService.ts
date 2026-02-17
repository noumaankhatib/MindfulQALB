import { CALCOM_CONFIG, isCalComConfigured } from '../utils/config';
import { TimeSlot, CalComAvailabilityResponse, CustomerInfo } from '../types';

/**
 * Fetch available time slots from Cal.com
 */
export const fetchAvailability = async (
  date: string,
  sessionType: string
): Promise<TimeSlot[]> => {
  if (!isCalComConfigured()) {
    console.warn('Cal.com not configured, returning mock slots');
    return getMockSlots();
  }

  try {
    const eventTypeSlug = getEventTypeSlug(sessionType);
    const url = new URL(`${CALCOM_CONFIG.API_URL}/slots`);
    url.searchParams.append('apiKey', CALCOM_CONFIG.API_KEY);
    url.searchParams.append('eventTypeSlug', eventTypeSlug);
    url.searchParams.append('username', CALCOM_CONFIG.USERNAME);
    url.searchParams.append('startTime', `${date}T00:00:00.000Z`);
    url.searchParams.append('endTime', `${date}T23:59:59.999Z`);
    url.searchParams.append('timeZone', 'Asia/Kolkata');

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`Cal.com API error: ${response.status}`);
    }

    const data = await response.json() as CalComAvailabilityResponse;
    
    // Parse slots from response
    const slots: TimeSlot[] = [];
    const dateSlots = data.slots?.[date] || [];
    
    dateSlots.forEach((slot) => {
      const time = new Date(slot.time);
      const formattedTime = time.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata',
      });
      
      slots.push({
        time: formattedTime,
        available: true,
      });
    });

    return slots.length > 0 ? slots : getMockSlots();
  } catch (error) {
    console.error('Error fetching Cal.com availability:', error);
    return getMockSlots();
  }
};

/**
 * Create a booking on Cal.com
 */
export const createBooking = async (
  sessionType: string,
  date: string,
  time: string,
  customer: CustomerInfo
): Promise<{ success: boolean; bookingId?: string; error?: string }> => {
  if (!isCalComConfigured()) {
    // Return mock booking for development
    return {
      success: true,
      bookingId: `mock_${Date.now()}`,
    };
  }

  try {
    const eventTypeId = CALCOM_CONFIG.EVENT_TYPE_IDS[sessionType];
    
    if (!eventTypeId) {
      return { success: false, error: 'Event type not configured' };
    }

    // Parse time and create ISO datetime
    const startTime = parseTimeToISO(date, time);
    
    const url = `${CALCOM_CONFIG.API_URL}/bookings?apiKey=${CALCOM_CONFIG.API_KEY}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventTypeId: parseInt(eventTypeId),
        start: startTime,
        responses: {
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          notes: customer.notes || '',
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
    
    return {
      success: true,
      bookingId: bookingData.uid || `CAL-${Date.now()}`,
    };
  } catch (error) {
    console.error('Error creating Cal.com booking:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Booking failed',
    };
  }
};

/**
 * Get event type slug for session type
 */
const getEventTypeSlug = (sessionType: string): string => {
  const slugMap: Record<string, string> = {
    individual: 'individual-therapy',
    couples: 'couples-therapy',
    family: 'family-therapy',
    free: 'free-consultation',
  };
  return slugMap[sessionType] || 'individual-therapy';
};

/**
 * Parse time string to ISO format
 */
const parseTimeToISO = (dateString: string, timeString: string): string => {
  const match = timeString.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) {
    throw new Error('Invalid time format');
  }

  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const period = match[3].toUpperCase();

  if (period === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }

  const date = new Date(dateString);
  date.setHours(hours, minutes, 0, 0);
  
  return date.toISOString();
};

/**
 * Get mock slots for development/fallback
 */
const getMockSlots = (): TimeSlot[] => {
  return [
    { time: '10:00 AM', available: true },
    { time: '11:00 AM', available: true },
    { time: '12:00 PM', available: false },
    { time: '2:00 PM', available: true },
    { time: '3:00 PM', available: true },
    { time: '4:00 PM', available: true },
    { time: '5:00 PM', available: true },
  ];
};
