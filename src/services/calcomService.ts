import { safeParseJson } from '../utils/safeJson';
import { logWarn, logError } from '../lib/logger';

/**
 * Cal.com Integration Service
 * 
 * SECURITY: All Cal.com API calls are routed through the backend.
 * The API key is never exposed in the frontend.
 * 
 * This service handles:
 * - Fetching real-time availability via backend API
 * - Creating bookings via backend API
 * - Preventing double-booking
 */

// Cal.com configuration (public info only - no secrets)
export const CALCOM_CONFIG = {
  // Your Cal.com username (public)
  USERNAME: 'mindful-qalb',
  
  // Event type slugs for Cal.com
  EVENT_TYPES: {
    'free': 'free-consultation',
    'free-call': 'free-consultation',
    'individual-chat': 'individual-chat',
    'individual-audio': 'individual-audio',
    'individual-video': 'individual-video',
    'couples-chat': 'couples-chat',
    'couples-audio': 'couples-audio',
    'couples-video': 'couples-video',
    'family-chat': 'family-chat',
    'family-audio': 'family-audio',
    'family-video': 'family-video',
    'individual': 'individual-video',
    'couples': 'couples-video',
    'video': 'individual-video',
    'chat': 'individual-chat',
    'audio': 'individual-audio',
  },
  
  // Duration in minutes for each session type
  DURATIONS: {
    'free': 15,
    'call': 15,
    'chat': 45,
    'audio': 50,
    'video': 60,
  },
};

interface TimeSlot {
  time: string;
  available: boolean;
  booked?: boolean;
  startTime?: string;
  endTime?: string;
}

interface BookingResult {
  success: boolean;
  bookingId?: string;
  error?: string;
  message?: string;
}

// Check if backend API is available
export const isCalComConfigured = (): boolean => {
  // Always return true - we use backend API which handles configuration
  return true;
};

/**
 * Get fallback slots when API is unavailable
 * Only allowed times: 9 AM, 10 AM, 5 PM, 6 PM, 7 PM, 8 PM
 */
const getFallbackSlots = (): TimeSlot[] => [
  { time: '9:00 AM', available: true },
  { time: '10:00 AM', available: true },
  { time: '5:00 PM', available: true },
  { time: '6:00 PM', available: true },
  { time: '7:00 PM', available: true },
  { time: '8:00 PM', available: true },
];

/**
 * Fetch available time slots via backend API
 * SECURITY: Uses backend to keep API key secure
 */
export const fetchCalComAvailability = async (
  date: Date,
  sessionType: string = 'individual'
): Promise<TimeSlot[]> => {
  try {
    const response = await fetch(`/api/availability`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: date.toISOString().split('T')[0],
        sessionType,
      }),
    });
    
    if (response.ok) {
      const data = await safeParseJson<{ slots?: TimeSlot[] }>(response);
      return data.slots || getFallbackSlots();
    }
    logWarn('Availability API error, using fallback slots');
    return getFallbackSlots();
  } catch (error) {
    logError('Failed to fetch availability', error);
    return getFallbackSlots();
  }
};

/**
 * Create a booking via backend API
 * SECURITY: Uses backend to keep API key secure
 * 
 * @param sessionTypeId - Combined session type ID (e.g., "individual-video")
 * @param date - Date object or string
 * @param time - Time slot string (e.g., "10:00 AM")
 * @param customerInfo - Customer details
 */
export const createCalComBooking = async (
  sessionTypeId: string,
  date: Date | string,
  time: string,
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    notes?: string;
  },
  options?: { userId?: string | null }
): Promise<BookingResult> => {
  try {
    // Parse session type and format from combined ID
    const parts = sessionTypeId.split('-');
    const sessionType = parts[0] || 'individual';
    const format = parts[1] || 'video';

    // Format date as local YYYY-MM-DD (avoid UTC shift from toISOString)
    const dateStr = date instanceof Date
      ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      : date;

    const body: Record<string, unknown> = {
      sessionType,
      format,
      date: dateStr,
      time,
      customer: {
        name: customerInfo.name,
        email: customerInfo.email,
        phone: customerInfo.phone,
        notes: customerInfo.notes || '',
      },
    };
    if (options?.userId) {
      body.user_id = options.userId;
    }

    const response = await fetch(`/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await safeParseJson<{ success?: boolean; bookingId?: string; message?: string; error?: string }>(response);

    if (response.ok && data.success) {
      return {
        success: true,
        bookingId: data.bookingId,
        message: data.message || 'Booking created successfully',
      };
    }
    return {
      success: false,
      error: data.error || 'Failed to create booking',
    };
  } catch (error) {
    logError('Booking creation error', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Booking failed',
    };
  }
};

/**
 * Get Cal.com booking link (for fallback/direct booking)
 */
export const getCalComBookingLink = (sessionTypeId: string): string => {
  const slug = getEventTypeSlug(sessionTypeId);
  return `https://cal.com/${CALCOM_CONFIG.USERNAME}/${slug}`;
};

/**
 * Get event type slug for a session
 */
export const getEventTypeSlug = (sessionType: string, format?: string): string => {
  if (format) {
    const key = `${sessionType}-${format}`;
    return CALCOM_CONFIG.EVENT_TYPES[key as keyof typeof CALCOM_CONFIG.EVENT_TYPES] || 'individual-video';
  }
  return CALCOM_CONFIG.EVENT_TYPES[sessionType as keyof typeof CALCOM_CONFIG.EVENT_TYPES] || 'individual-video';
};

/**
 * Get session duration in minutes
 */
export const getSessionDuration = (format: string): number => {
  return CALCOM_CONFIG.DURATIONS[format as keyof typeof CALCOM_CONFIG.DURATIONS] || 60;
};

/**
 * Check if a specific slot is available
 */
export const checkSlotAvailability = async (
  date: Date,
  time: string,
  sessionType: string = 'individual'
): Promise<boolean> => {
  const slots = await fetchCalComAvailability(date, sessionType);
  const slot = slots.find(s => s.time === time);
  return slot?.available ?? false;
};

/**
 * Format date for display
 */
export const formatDateForDisplay = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format time for API calls
 */
export const formatTimeForApi = (time: string, date: Date): string => {
  const match = time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return date.toISOString();

  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const period = match[3].toUpperCase();

  if (period === 'PM' && hours !== 12) hours += 12;
  else if (period === 'AM' && hours === 12) hours = 0;

  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  return result.toISOString();
};

export default {
  fetchCalComAvailability,
  createCalComBooking,
  isCalComConfigured,
  getEventTypeSlug,
  getSessionDuration,
  checkSlotAvailability,
  formatDateForDisplay,
  formatTimeForApi,
  CALCOM_CONFIG,
};
