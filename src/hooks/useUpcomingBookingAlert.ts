import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export interface UpcomingBooking {
  id: string;
  session_type: string;
  session_format: string;
  scheduled_date: string;
  scheduled_time: string;
  status: string;
  minutesUntil: number;
  isToday: boolean;
}

/** Alert thresholds: show banner when a confirmed booking is within these minutes */
const ALERT_WITHIN_MINUTES = 90; // e.g. show "in 90 min", "in 60 min", "in 15 min"
const POLL_INTERVAL_MS = 60 * 1000; // re-check every 1 min so "when it comes to time" we update

/** Parse time string (e.g. "10:00 AM", "14:30") to minutes from midnight; dateStr YYYY-MM-DD */
function parseTimeToMinutes(dateStr: string, timeStr: string): number {
  const s = String(timeStr).trim();
  const match = s.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  let hours: number;
  let minutes: number;
  if (match) {
    hours = parseInt(match[1], 10);
    minutes = parseInt(match[2], 10);
    const period = (match[3] || '').toUpperCase();
    if (period === 'PM' && hours !== 12) hours += 12;
    else if (period === 'AM' && hours === 12) hours = 0;
  } else {
    const [h, m] = s.split(':').map(Number);
    hours = isNaN(h) ? 0 : h;
    minutes = isNaN(m) ? 0 : m;
  }
  const [y, mo, d] = dateStr.split('-').map(Number);
  const booking = new Date(y, mo - 1, d, hours, minutes, 0);
  return Math.floor((booking.getTime() - Date.now()) / (60 * 1000));
}

export function useUpcomingBookingAlert() {
  const { user } = useAuth();
  const [upcomingList, setUpcomingList] = useState<UpcomingBooking[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const fetchUpcoming = useCallback(async () => {
    if (!user) {
      setUpcomingList([]);
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    const { data: byUser } = await supabase
      .from('bookings')
      .select('id, session_type, session_format, scheduled_date, scheduled_time, status')
      .eq('user_id', user.id)
      .in('status', ['confirmed', 'pending'])
      .gte('scheduled_date', today)
      .order('scheduled_date', { ascending: true })
      .order('scheduled_time', { ascending: true })
      .limit(10);

    const byEmail = user.email
      ? await supabase
          .from('bookings')
          .select('id, session_type, session_format, scheduled_date, scheduled_time, status')
          .ilike('customer_email', user.email)
          .in('status', ['confirmed', 'pending'])
          .gte('scheduled_date', today)
          .order('scheduled_date', { ascending: true })
          .order('scheduled_time', { ascending: true })
          .limit(10)
      : { data: [] };

    const seen = new Set((byUser ?? []).map((b) => b.id));
    const combined = [...(byUser ?? [])];
    (byEmail.data ?? []).forEach((b) => {
      if (!seen.has(b.id)) {
        seen.add(b.id);
        combined.push(b);
      }
    });

    const list: UpcomingBooking[] = [];
    for (const b of combined) {
      const minutesUntil = parseTimeToMinutes(b.scheduled_date, b.scheduled_time);
      if (minutesUntil < 0) continue;
      if (minutesUntil > ALERT_WITHIN_MINUTES) continue;
      if (dismissedIds.has(b.id)) continue;
      const isToday = b.scheduled_date === today;
      list.push({
        id: b.id,
        session_type: b.session_type,
        session_format: b.session_format,
        scheduled_date: b.scheduled_date,
        scheduled_time: b.scheduled_time,
        status: b.status,
        minutesUntil,
        isToday,
      });
    }
    setUpcomingList(list);
  }, [user, dismissedIds]);

  useEffect(() => {
    fetchUpcoming();
    const id = setInterval(fetchUpcoming, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchUpcoming]);

  const dismiss = useCallback((bookingId: string) => {
    setDismissedIds((prev) => new Set(prev).add(bookingId));
    setUpcomingList((prev) => prev.filter((u) => u.id !== bookingId));
  }, []);

  /** First upcoming (for backward compatibility); use upcomingList for full list */
  const upcoming = upcomingList[0] ?? null;
  return { upcoming, upcomingList, dismiss };
}
