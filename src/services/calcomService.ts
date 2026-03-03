/**
 * @deprecated Use calendarService.ts instead. This file re-exports for backward compatibility.
 */
export {
  isCalendarConfigured as isCalComConfigured,
  fetchAvailability as fetchCalComAvailability,
  createBooking as createCalComBooking,
  getSessionDuration,
  checkSlotAvailability,
  formatDateForDisplay,
} from './calendarService';

export { SESSION_DURATIONS as CALCOM_CONFIG } from './calendarService';
