import { safeParseJson } from '../utils/safeJson';
import { logWarn, logError } from '../lib/logger';

/**
 * Calendar Integration Service
 *
 * All calendar API calls are routed through the backend (/api/availability, /api/bookings).
 * No secrets are exposed to the frontend.
 */

export const SESSION_DURATIONS: Record<string, number> = {
  free: 15,
  call: 15,
  chat: 45,
  audio: 50,
  video: 60,
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

interface ConfirmResult {
  success: boolean;
  meetingUrl?: string | null;
  calendarEventId?: string | null;
  error?: string;
  message?: string;
}

export const isCalendarConfigured = (): boolean => {
  return true;
};

const getFallbackSlots = (): TimeSlot[] => [
  { time: '9:00 AM', available: true },
  { time: '10:00 AM', available: true },
  { time: '5:00 PM', available: true },
  { time: '6:00 PM', available: true },
  { time: '7:00 PM', available: true },
  { time: '8:00 PM', available: true },
];

export const fetchAvailability = async (
  date: Date,
  sessionType: string = 'individual',
  signal?: AbortSignal
): Promise<TimeSlot[]> => {
  const controller = new AbortController();
  const ownTimeout = setTimeout(() => controller.abort(), 10000);

  // Propagate parent abort to our controller
  const onParentAbort = () => controller.abort();
  signal?.addEventListener('abort', onParentAbort);

  try {
    const response = await fetch(`/api/availability`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: date.toISOString().split('T')[0],
        sessionType,
      }),
      signal: controller.signal,
    });

    if (response.ok) {
      const data = await safeParseJson<{ slots?: TimeSlot[] }>(response);
      return data.slots || getFallbackSlots();
    }
    logWarn('Availability API error, using fallback slots');
    return getFallbackSlots();
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      if (signal?.aborted) throw error;
      logWarn('Availability API timed out, using fallback slots');
      return getFallbackSlots();
    }
    logError('Failed to fetch availability', error);
    return getFallbackSlots();
  } finally {
    clearTimeout(ownTimeout);
    signal?.removeEventListener('abort', onParentAbort);
  }
};

export const createBooking = async (
  sessionTypeId: string,
  date: Date | string,
  time: string,
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    notes?: string;
  },
  options?: { userId?: string | null; accessToken?: string | null }
): Promise<BookingResult> => {
  try {
    const parts = sessionTypeId.split('-');
    const sessionType = parts[0] || 'individual';
    const format = parts[1] || 'video';

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

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (options?.accessToken) {
      headers['Authorization'] = `Bearer ${options.accessToken}`;
    }

    const response = await fetch(`/api/bookings`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const data = await safeParseJson<{ success?: boolean; bookingId?: string; databaseId?: string; message?: string; error?: string }>(response);

    if (response.ok && data.success) {
      return {
        success: true,
        bookingId: data.databaseId || data.bookingId,
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
 * Confirm a booking (admin only). Creates a Google Calendar event with Meet link.
 */
export const confirmBooking = async (
  bookingId: string,
  accessToken: string
): Promise<ConfirmResult> => {
  try {
    const response = await fetch(`/api/bookings`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ bookingId }),
    });

    const data = await safeParseJson<{
      success?: boolean;
      meetingUrl?: string | null;
      calendarEventId?: string | null;
      message?: string;
      error?: string;
    }>(response);

    if (response.ok && data.success) {
      return {
        success: true,
        meetingUrl: data.meetingUrl,
        calendarEventId: data.calendarEventId,
        message: data.message,
      };
    }
    return { success: false, error: data.error || 'Failed to confirm booking' };
  } catch (error) {
    logError('Booking confirmation error', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Confirmation failed',
    };
  }
};

export const checkSlotAvailability = async (
  date: Date,
  time: string,
  sessionType: string = 'individual'
): Promise<boolean> => {
  const slots = await fetchAvailability(date, sessionType);
  const slot = slots.find(s => s.time === time);
  return slot?.available ?? false;
};

export const getSessionDuration = (format: string): number => {
  return SESSION_DURATIONS[format] || 60;
};

export const formatDateForDisplay = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Re-export old names for backward compatibility during migration
export const isCalComConfigured = isCalendarConfigured;
export const fetchCalComAvailability = fetchAvailability;
export const createCalComBooking = createBooking;
