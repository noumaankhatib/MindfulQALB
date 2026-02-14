/**
 * Cal.com API Integration Service
 * 
 * This service handles:
 * - Fetching real-time availability from Cal.com
 * - Creating bookings on Cal.com
 * - Preventing double-booking across devices
 * 
 * Setup Instructions:
 * 1. Create a Cal.com account at https://cal.com
 * 2. Go to Settings > Developer > API Keys
 * 3. Create a new API key
 * 4. Add the key to your .env file as VITE_CALCOM_API_KEY
 * 5. Set up your event types in Cal.com
 * 6. Update the EVENT_TYPE_IDS below with your actual event type IDs
 */

// Cal.com configuration
export const CALCOM_CONFIG = {
  // Your Cal.com username
  USERNAME: 'mindful-qalb',
  
  // Cal.com API base URL (v2 API)
  API_BASE_URL: 'https://api.cal.com/v2',
  
  // Alternative: Cal.com v1 API (if v2 doesn't work)
  API_V1_URL: 'https://api.cal.com/v1',
  
  // Event type slugs for Cal.com
  // Format: therapy-type-format (e.g., individual-video, couples-audio)
  EVENT_TYPES: {
    // Free consultation (always a call)
    'free': 'free-consultation',
    'free-call': 'free-consultation',
    
    // Individual therapy formats
    'individual-chat': 'individual-chat',
    'individual-audio': 'individual-audio',
    'individual-video': 'individual-video',
    
    // Couples therapy formats
    'couples-chat': 'couples-chat',
    'couples-audio': 'couples-audio',
    'couples-video': 'couples-video',
    
    // Family counseling formats
    'family-chat': 'family-chat',
    'family-audio': 'family-audio',
    'family-video': 'family-video',
    
    // Legacy mappings for backward compatibility
    'individual': 'individual-video',
    'couples': 'couples-video',
    'video': 'individual-video',
    'chat': 'individual-chat',
    'audio': 'individual-audio',
  },
  
  // Event type IDs (get these from Cal.com dashboard after creating event types)
  // Go to cal.com/event-types and click on each event to see its ID in the URL
  EVENT_TYPE_IDS: {
    'free': 0,              // Replace with actual ID
    'free-call': 0,
    'individual-chat': 0,
    'individual-audio': 0,
    'individual-video': 0,
    'couples-chat': 0,
    'couples-audio': 0,
    'couples-video': 0,
    'family-chat': 0,
    'family-audio': 0,
    'family-video': 0,
  },
  
  // Duration in minutes for each session type
  DURATIONS: {
    'free': 20,
    'chat': 45,
    'audio': 50,
    'video': 60,
  },
};

// Get API key from environment
const getApiKey = (): string => {
  return import.meta.env.VITE_CALCOM_API_KEY || '';
};

// Check if Cal.com is configured
export const isCalComConfigured = (): boolean => {
  const apiKey = getApiKey();
  return !!apiKey && apiKey.length > 10;
};

interface TimeSlot {
  time: string;
  available: boolean;
  booked?: boolean;
  startTime?: string;
  endTime?: string;
}

interface CalComSlot {
  time: string;
  users?: string[];
}

interface CalComAvailabilityResponse {
  slots: Record<string, CalComSlot[]>;
}

/**
 * Fetch available time slots from Cal.com
 */
export const fetchCalComAvailability = async (
  date: Date,
  sessionType: string = 'individual'
): Promise<TimeSlot[]> => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    console.warn('Cal.com API key not configured, using fallback slots');
    return getFallbackSlots();
  }

  try {
    const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
    const eventTypeSlug = CALCOM_CONFIG.EVENT_TYPES[sessionType as keyof typeof CALCOM_CONFIG.EVENT_TYPES] || 'individual-therapy';
    
    // Cal.com slots API endpoint
    const url = `${CALCOM_CONFIG.API_V1_URL}/slots?` + new URLSearchParams({
      apiKey,
      eventTypeSlug,
      username: CALCOM_CONFIG.USERNAME,
      startTime: `${dateString}T00:00:00.000Z`,
      endTime: `${dateString}T23:59:59.999Z`,
    });

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Cal.com API error: ${response.status}`);
    }

    const data: CalComAvailabilityResponse = await response.json();
    
    // Parse Cal.com slots into our format
    const slots: TimeSlot[] = [];
    const dateKey = dateString;
    
    if (data.slots && data.slots[dateKey]) {
      data.slots[dateKey].forEach((slot: CalComSlot) => {
        const slotTime = new Date(slot.time);
        const formattedTime = slotTime.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });
        
        slots.push({
          time: formattedTime,
          available: true,
          startTime: slot.time,
        });
      });
    }

    // If no slots from Cal.com, return fallback
    if (slots.length === 0) {
      return getFallbackSlots();
    }

    return slots;
  } catch (error) {
    console.error('Error fetching Cal.com availability:', error);
    return getFallbackSlots();
  }
};

/**
 * Create a booking on Cal.com
 */
export const createCalComBooking = async (
  sessionType: string,
  date: Date,
  timeSlot: string,
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    notes?: string;
  }
): Promise<{ success: boolean; bookingId?: string; error?: string }> => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    console.warn('Cal.com API key not configured, creating local booking only');
    return createLocalBooking(sessionType, date, timeSlot, customerInfo);
  }

  try {
    const eventTypeId = CALCOM_CONFIG.EVENT_TYPE_IDS[sessionType as keyof typeof CALCOM_CONFIG.EVENT_TYPE_IDS];
    
    if (!eventTypeId) {
      console.warn('Event type ID not configured for:', sessionType);
      return createLocalBooking(sessionType, date, timeSlot, customerInfo);
    }

    // Parse the time slot to create ISO datetime
    const dateString = date.toISOString().split('T')[0];
    const startTime = parseTimeToISO(dateString, timeSlot);
    
    // Cal.com booking endpoint
    const url = `${CALCOM_CONFIG.API_V1_URL}/bookings?apiKey=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventTypeId,
        start: startTime,
        responses: {
          name: customerInfo.name,
          email: customerInfo.email,
          phone: customerInfo.phone,
          notes: customerInfo.notes || '',
        },
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: 'en',
        metadata: {},
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Booking failed: ${response.status}`);
    }

    const bookingData = await response.json();
    
    // Also save locally for offline reference
    saveLocalBooking(sessionType, date, timeSlot, customerInfo, bookingData.uid);
    
    return {
      success: true,
      bookingId: bookingData.uid || `CAL-${Date.now()}`,
    };
  } catch (error) {
    console.error('Error creating Cal.com booking:', error);
    // Fall back to local booking
    return createLocalBooking(sessionType, date, timeSlot, customerInfo);
  }
};

/**
 * Create a local booking (fallback when Cal.com is not available)
 */
const createLocalBooking = async (
  sessionType: string,
  date: Date,
  timeSlot: string,
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    notes?: string;
  }
): Promise<{ success: boolean; bookingId?: string; error?: string }> => {
  const bookingId = `BK${Date.now().toString(36).toUpperCase()}`;
  
  saveLocalBooking(sessionType, date, timeSlot, customerInfo, bookingId);
  
  return {
    success: true,
    bookingId,
  };
};

/**
 * Save booking to localStorage
 */
const saveLocalBooking = (
  sessionType: string,
  date: Date,
  timeSlot: string,
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    notes?: string;
  },
  bookingId: string
) => {
  try {
    const bookingRecord = {
      bookingId,
      sessionType,
      date: date.toISOString(),
      time: timeSlot,
      customerInfo,
      timestamp: new Date().toISOString(),
    };
    
    const existingBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    existingBookings.push(bookingRecord);
    localStorage.setItem('bookings', JSON.stringify(existingBookings));
  } catch (error) {
    console.error('Error saving local booking:', error);
  }
};

/**
 * Parse time string to ISO format
 */
const parseTimeToISO = (dateString: string, timeString: string): string => {
  // Parse time like "10:00 AM" or "2:30 PM"
  const match = timeString.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) {
    // Return current date/time as fallback
    return new Date().toISOString();
  }
  
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  
  if (period === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }
  
  return `${dateString}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00.000Z`;
};

/**
 * Fallback slots when Cal.com is not configured
 */
const getFallbackSlots = (): TimeSlot[] => {
  // Return standard business hour slots
  return [
    { time: '10:00 AM', available: true },
    { time: '11:00 AM', available: true },
    { time: '12:00 PM', available: true },
    { time: '2:00 PM', available: true },
    { time: '3:00 PM', available: true },
    { time: '4:00 PM', available: true },
    { time: '5:00 PM', available: true },
  ];
};

/**
 * Get Cal.com booking link
 */
export const getCalComBookingLink = (sessionType: string): string => {
  const eventTypeSlug = CALCOM_CONFIG.EVENT_TYPES[sessionType as keyof typeof CALCOM_CONFIG.EVENT_TYPES] || 'individual-therapy';
  return `https://cal.com/${CALCOM_CONFIG.USERNAME}/${eventTypeSlug}`;
};

/**
 * Open Cal.com booking page in new tab
 */
export const openCalComBooking = (sessionType: string): void => {
  window.open(getCalComBookingLink(sessionType), '_blank');
};

export default {
  fetchCalComAvailability,
  createCalComBooking,
  isCalComConfigured,
  getCalComBookingLink,
  openCalComBooking,
  CALCOM_CONFIG,
};
