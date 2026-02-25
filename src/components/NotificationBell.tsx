import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Calendar, Clock, ChevronRight, X } from 'lucide-react';
import { useUpcomingBookingAlert, type UpcomingBooking } from '../hooks/useUpcomingBookingAlert';

function formatNotificationMessage(minutesUntil: number, sessionType: string, scheduledTime: string): string {
  if (minutesUntil <= 0) return `Your ${sessionType} session is starting now.`;
  if (minutesUntil <= 15) return `Starts in ${minutesUntil} min`;
  if (minutesUntil <= 60) return `Starts in ~${Math.round(minutesUntil / 15) * 15} min`;
  return `Today at ${scheduledTime}`;
}

function NotificationItem({
  upcoming,
  onDismiss,
  onViewDetails,
}: {
  upcoming: UpcomingBooking;
  onDismiss: () => void;
  onViewDetails: () => void;
}) {
  const msg = formatNotificationMessage(upcoming.minutesUntil, upcoming.session_type, upcoming.scheduled_time);
  return (
    <div className="flex gap-3 p-3 rounded-xl bg-lavender-50/80 border border-lavender-100 hover:bg-lavender-50 transition-colors">
      <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-lavender-200/80 flex items-center justify-center">
        <Calendar className="w-4 h-4 text-lavender-700" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 text-sm">{msg}</p>
        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
          <Clock className="w-3 h-3" />
          {new Date(upcoming.scheduled_date).toLocaleDateString(undefined, {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          })}{' '}
          at {upcoming.scheduled_time}
          <span className="capitalize text-lavender-600"> · {upcoming.session_format}</span>
        </p>
        <div className="flex items-center gap-2 mt-2">
          <Link
            to="/my-bookings"
            onClick={onViewDetails}
            className="inline-flex items-center gap-1 text-sm font-medium text-lavender-600 hover:text-lavender-700"
          >
            View details
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
          <button
            type="button"
            onClick={onDismiss}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Dismiss
          </button>
        </div>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="flex-shrink-0 p-1 rounded-lg hover:bg-lavender-200/50 text-gray-400 hover:text-gray-600"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function NotificationBell() {
  const { upcomingList, dismiss } = useUpcomingBookingAlert();
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const count = upcomingList.length;
  const displayCount = count > 9 ? '9+' : String(count);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleDismiss = (id: string) => {
    dismiss(id);
    if (upcomingList.length <= 1) setIsOpen(false);
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className={`
          relative p-2.5 rounded-xl
          transition-all duration-200 ease-out
          focus:outline-none focus-visible:ring-2 focus-visible:ring-lavender-400 focus-visible:ring-offset-2
          hover:bg-lavender-50 hover:text-lavender-600
          active:scale-95
          ${isOpen
            ? 'bg-lavender-100 text-lavender-700 ring-2 ring-lavender-200 ring-offset-1'
            : 'text-gray-600'
          }
          ${count > 0 ? 'hover:bg-lavender-100' : ''}
        `}
        aria-label={count > 0 ? `${displayCount} notifications` : 'Notifications'}
        aria-expanded={isOpen}
      >
        <motion.span
          className="inline-flex items-center justify-center"
          animate={isOpen ? { rotate: [0, -12, 8, 0] } : { rotate: 0 }}
          transition={{ duration: 0.35, ease: [0.34, 1.2, 0.64, 1] }}
        >
          <Bell className="w-5 h-5 transition-[stroke-width] duration-200" strokeWidth={isOpen ? 2.25 : 2} />
        </motion.span>
        {count > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 18 }}
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-lavender-600 text-white text-xs font-semibold px-1 shadow-md shadow-lavender-600/30 ring-2 ring-white"
            aria-hidden
          >
            {displayCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[59] bg-black/5 backdrop-blur-[2px]"
              aria-hidden
            />
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.92 }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 30,
                mass: 0.8,
              }}
              className="absolute right-0 top-full mt-2 w-[320px] sm:w-[360px] bg-white rounded-2xl shadow-xl shadow-lavender-500/20 border border-lavender-100 overflow-hidden z-[60] origin-top-right"
            >
            <div className="px-4 py-3 border-b border-lavender-100 bg-gradient-to-r from-lavender-50 to-white">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                {count > 0 && (
                  <span className="text-xs font-medium text-lavender-600 bg-lavender-100 px-2 py-0.5 rounded-full">
                    {displayCount} new
                  </span>
                )}
              </div>
            </div>
            <div className="max-h-[320px] overflow-y-auto p-3 space-y-2">
              {upcomingList.length > 0 ? (
                upcomingList.map((upcoming, i) => (
                  <motion.div
                    key={upcoming.id}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i, duration: 0.2 }}
                  >
                    <NotificationItem
                      upcoming={upcoming}
                      onDismiss={() => handleDismiss(upcoming.id)}
                      onViewDetails={() => setIsOpen(false)}
                    />
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.25 }}
                  className="py-8 text-center"
                >
                  <div className="w-12 h-12 mx-auto rounded-full bg-lavender-100 flex items-center justify-center mb-3">
                    <Bell className="w-6 h-6 text-lavender-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-500">No new notifications</p>
                  <p className="text-xs text-gray-400 mt-1">Session reminders will appear here</p>
                </motion.div>
              )}
            </div>
          </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
