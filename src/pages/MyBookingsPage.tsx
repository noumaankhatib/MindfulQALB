import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  ArrowLeft,
  Clock,
  Video,
  Headphones,
  MessageSquare,
  CreditCard,
  ChevronRight,
  CalendarPlus,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { formatPrice } from '../hooks/useGeolocation';
import type { Payment as DbPayment } from '../types/database';

interface BookingRow {
  id: string;
  session_type: string;
  session_format: string;
  duration_minutes: number;
  scheduled_date: string;
  scheduled_time: string;
  status: string;
  customer_name: string;
  customer_email: string;
  created_at: string;
}

interface PaymentRow {
  id: string;
  booking_id: string | null;
  amount_paise: number;
  status: string;
  paid_at: string | null;
}

const MyBookingsPage = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [paymentsByBooking, setPaymentsByBooking] = useState<Record<string, PaymentRow>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
      return;
    }
    if (user) {
      fetchMyBookings();
    }
  }, [user, authLoading, navigate]);

  const fetchMyBookings = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('id, session_type, session_format, duration_minutes, scheduled_date, scheduled_time, status, customer_name, customer_email, created_at')
        .eq('user_id', user.id)
        .order('scheduled_date', { ascending: false })
        .order('scheduled_time', { ascending: false });

      if (bookingsError) {
        console.error('Error fetching bookings:', bookingsError);
        setBookings([]);
        setLoading(false);
        return;
      }

      const bookingsList = (bookingsData ?? []) as BookingRow[];
      setBookings(bookingsList);

      if (bookingsList.length > 0) {
        const bookingIds = bookingsList.map((b) => b.id);
        const { data: paymentsData } = await supabase
          .from('payments')
          .select('id, booking_id, amount_paise, status, paid_at')
          .in('booking_id', bookingIds);

        const paymentsList = (paymentsData ?? []) as DbPayment[];
        const map: Record<string, PaymentRow> = {};
        paymentsList.forEach((p) => {
          if (p.booking_id) map[p.booking_id] = { id: p.id, booking_id: p.booking_id, amount_paise: p.amount_paise, status: p.status, paid_at: p.paid_at };
        });
        setPaymentsByBooking(map);
      } else {
        setPaymentsByBooking({});
      }
    } catch (err) {
      console.error(err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'video':
        return <Video className="w-5 h-5 text-lavender-500" />;
      case 'audio':
        return <Headphones className="w-5 h-5 text-lavender-500" />;
      case 'chat':
        return <MessageSquare className="w-5 h-5 text-lavender-500" />;
      default:
        return <Video className="w-5 h-5 text-lavender-500" />;
    }
  };

  const getStatusStyle = (status: string) => {
    const styles: Record<string, string> = {
      confirmed: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      completed: 'bg-blue-100 text-blue-700',
      cancelled: 'bg-red-100 text-red-700',
      no_show: 'bg-gray-100 text-gray-700',
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
  };

  if (authLoading || (!user && !loading)) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-lavender-50/50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lavender-600" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-lavender-50/50 to-white">
      <Navigation />

      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-lavender-600 hover:text-lavender-700 mb-6 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-lavender-100 text-lavender-600">
                <Calendar className="w-5 h-5" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 font-display">My Bookings</h1>
            </div>
            <p className="text-gray-600 ml-12">
              {profile?.full_name ? `Welcome back, ${profile.full_name}. ` : ''}
              Here are your therapy session bookings and payment details.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-lavender-600" />
            </div>
          ) : bookings.length === 0 ? (
            /* Empty state – no empty details, just CTA to main booking page */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-lavender-100 shadow-gentle p-10 md:p-12 text-center"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-lavender-100 flex items-center justify-center">
                <Calendar className="w-10 h-10 text-lavender-500" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No bookings yet</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                You haven’t booked a session yet. Book your first session and it will show here with details and payment info.
              </p>
              <a
                href="/#get-help"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-lavender-600 to-purple-600 text-white rounded-xl font-semibold hover:from-lavender-700 hover:to-purple-700 transition-all shadow-lg shadow-lavender-500/25"
              >
                <CalendarPlus className="w-5 h-5" />
                Book a Session
              </a>
            </motion.div>
          ) : (
            /* List of user's bookings with details and payment */
            <div className="space-y-4">
              {bookings.map((booking) => {
                const payment = paymentsByBooking[booking.id];
                return (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border border-lavender-100 shadow-gentle overflow-hidden hover:border-lavender-200/60 transition-colors"
                  >
                    <div className="p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="p-2.5 rounded-xl bg-lavender-50 text-lavender-600 flex-shrink-0">
                            {getFormatIcon(booking.session_format)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 capitalize">
                              {booking.session_type} · {booking.session_format}
                            </p>
                            <p className="text-sm text-gray-500 mt-0.5">
                              {new Date(booking.scheduled_date).toLocaleDateString(undefined, {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}{' '}
                              at {booking.scheduled_time}
                            </p>
                            <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {booking.duration_minutes} min
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-start sm:items-end gap-2">
                          <span
                            className={`inline-flex px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusStyle(booking.status)}`}
                          >
                            {booking.status}
                          </span>
                          {payment && (
                            <div className="flex items-center gap-2 text-sm">
                              <CreditCard className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-600">
                                {formatPrice(payment.amount_paise / 100, true)}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-xs font-medium ${
                                  payment.status === 'paid'
                                    ? 'bg-green-100 text-green-700'
                                    : payment.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {payment.status}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              <div className="pt-4 text-center">
                <a
                  href="/#get-help"
                  className="inline-flex items-center gap-2 text-lavender-600 hover:text-lavender-700 font-medium"
                >
                  <CalendarPlus className="w-4 h-4" />
                  Book another session
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MyBookingsPage;
