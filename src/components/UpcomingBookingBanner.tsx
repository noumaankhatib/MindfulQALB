import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, X, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUpcomingBookingAlert } from '../hooks/useUpcomingBookingAlert';

function formatMessage(minutesUntil: number, sessionType: string, scheduledTime: string): string {
  if (minutesUntil <= 0) return `Your ${sessionType} session is starting now.`;
  if (minutesUntil <= 15) return `Your ${sessionType} session starts in ${minutesUntil} minutes.`;
  if (minutesUntil <= 60) return `Your ${sessionType} session starts in about ${Math.round(minutesUntil / 15) * 15} minutes.`;
  return `You have a ${sessionType} session today at ${scheduledTime}.`;
}

export function UpcomingBookingBanner() {
  const { upcoming, dismiss } = useUpcomingBookingAlert();

  return (
    <AnimatePresence>
      {upcoming && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="overflow-hidden"
        >
          <div className="bg-gradient-to-r from-lavender-500 via-lavender-600 to-purple-600 text-white shadow-lg border-b border-lavender-700/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-white">
                      {formatMessage(upcoming.minutesUntil, upcoming.session_type, upcoming.scheduled_time)}
                    </p>
                    <p className="text-sm text-lavender-100 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(upcoming.scheduled_date).toLocaleDateString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}{' '}
                      at {upcoming.scheduled_time}
                      <span className="capitalize text-lavender-200"> · {upcoming.session_format}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    to="/my-bookings"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 font-medium text-sm transition-colors"
                  >
                    View details
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => dismiss(upcoming.id)}
                    className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                    aria-label="Dismiss"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
