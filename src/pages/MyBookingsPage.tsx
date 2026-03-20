import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  ArrowLeft,
  Clock,
  Video,
  Headphones,
  MessageSquare,
  Phone,
  CreditCard,
  CalendarPlus,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  Package,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { logError } from '../lib/logger';
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
  notes: string | null;
  created_at: string;
  meeting_url: string | null;
}

interface PaymentRow {
  id: string;
  booking_id: string | null;
  amount_paise: number;
  status: string;
  paid_at: string | null;
}

interface PackageRow {
  id: string;
  package_id: string;
  package_title: string;
  session_type: string;
  session_format: string;
  duration_minutes: number;
  total_sessions: number;
  sessions_used: number;
  sessions_remaining: number;
  status: string;
  valid_until: string | null;
  amount_paid_paise: number | null;
  currency: string;
  created_at: string;
}

const MyBookingsPage = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'bookings' | 'packages'>('bookings');
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [paymentsByBooking, setPaymentsByBooking] = useState<Record<string, PaymentRow>>({});
  const [packages, setPackages] = useState<PackageRow[]>([]);
  const [packagesLoading, setPackagesLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading, navigate]);

  // Retry once if first load returned empty (session may not have been attached yet on client-side nav)
  const retryEmptyRef = useRef(false);
  useEffect(() => {
    if (!user || loading || bookings.length > 0) return;
    if (retryEmptyRef.current) return;
    retryEmptyRef.current = true;
    const t = setTimeout(() => {
      fetchMyBookings();
    }, 700);
    return () => clearTimeout(t);
  }, [user, loading, bookings.length]);

  const BOOKINGS_SELECT = 'id, session_type, session_format, duration_minutes, scheduled_date, scheduled_time, status, customer_name, customer_email, notes, created_at, meeting_url';

  const fetchMyBookings = async () => {
    if (!user) return;
    setLoading(true);

    const timeout = setTimeout(() => {
      setLoading(false);
      setBookings([]);
    }, 15000);

    try {
      // Parallel queries: by user_id and by customer_email (RLS allows both). Bookings show even when user_id was null at creation.
      const [byUserRes, byEmailRes] = await Promise.all([
        supabase
          .from('bookings')
          .select(BOOKINGS_SELECT)
          .eq('user_id', user.id)
          .order('scheduled_date', { ascending: false })
          .order('scheduled_time', { ascending: false })
          .limit(200),
        user.email
          ? supabase
              .from('bookings')
              .select(BOOKINGS_SELECT)
              .ilike('customer_email', user.email.trim())
              .order('scheduled_date', { ascending: false })
              .order('scheduled_time', { ascending: false })
              .limit(200)
          : { data: [] as BookingRow[], error: null },
      ]);

      if (byUserRes.error) {
        logError('Error fetching bookings by user_id:', byUserRes.error);
      }
      if (byEmailRes.error) {
        logError('Error fetching bookings by email:', byEmailRes.error);
      }

      const byUser = (byUserRes.data ?? []) as BookingRow[];
      const byEmail = (byEmailRes.data ?? []) as BookingRow[];
      const seenIds = new Set(byUser.map((b) => b.id));
      const bookingsList = [...byUser];
      for (const b of byEmail) {
        if (!seenIds.has(b.id)) {
          seenIds.add(b.id);
          bookingsList.push(b);
        }
      }
      bookingsList.sort((a, b) => {
        if (a.scheduled_date !== b.scheduled_date) return b.scheduled_date.localeCompare(a.scheduled_date);
        return (b.scheduled_time || '').localeCompare(a.scheduled_time || '');
      });
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
      logError('My Bookings fetch error', err);
      setBookings([]);
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  };

  const fetchMyPackages = async () => {
    if (!user) return;
    setPackagesLoading(true);
    try {
      const { data, error } = await supabase
        .from('session_packages')
        .select('id, package_id, package_title, session_type, session_format, duration_minutes, total_sessions, sessions_used, sessions_remaining, status, valid_until, amount_paid_paise, currency, created_at')
        .or(`user_id.eq.${user.id},customer_email.ilike.${user.email ?? ''}`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data) setPackages(data as PackageRow[]);
    } catch (err) {
      logError('My Packages fetch error', err);
    } finally {
      setPackagesLoading(false);
    }
  };

  // Load packages when tab switches to packages
  useEffect(() => {
    if (activeTab === 'packages' && user && packages.length === 0 && !packagesLoading) {
      fetchMyPackages();
    }
  }, [activeTab, user]);

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'video':
        return <Video className="w-5 h-5 text-lavender-500" />;
      case 'audio':
        return <Headphones className="w-5 h-5 text-lavender-500" />;
      case 'chat':
        return <MessageSquare className="w-5 h-5 text-lavender-500" />;
      case 'call':
        return <Phone className="w-5 h-5 text-lavender-500" />;
      default:
        return <Video className="w-5 h-5 text-lavender-500" />;
    }
  };

  const getStatusStyle = (status: string) => {
    const styles: Record<string, string> = {
      confirmed: 'bg-green-100 text-green-700',
      pending: 'bg-amber-100 text-amber-800',
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
      <Helmet>
        <title>My Bookings | MindfulQALB</title>
        <meta name="description" content="View and manage your therapy session bookings with MindfulQALB." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
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

          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-lavender-100 text-lavender-600">
                <Calendar className="w-5 h-5" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 font-display">My Sessions</h1>
            </div>
            <p className="text-gray-600 ml-12">
              {profile?.full_name ? `Welcome back, ${profile.full_name}. ` : ''}
              Manage your bookings and session packages.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-lavender-50 p-1 rounded-xl mb-6 w-fit">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'bookings'
                  ? 'bg-white text-lavender-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Bookings
              {bookings.length > 0 && (
                <span className="bg-lavender-100 text-lavender-700 text-xs px-2 py-0.5 rounded-full">{bookings.length}</span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('packages')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'packages'
                  ? 'bg-white text-lavender-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Packages
              {packages.filter(p => p.status === 'active').length > 0 && (
                <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                  {packages.filter(p => p.status === 'active').length} active
                </span>
              )}
            </button>
          </div>

          {/* ── PACKAGES TAB ── */}
          {activeTab === 'packages' && (
            <>
              {packagesLoading ? (
                <div className="flex justify-center py-16">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-lavender-600" />
                </div>
              ) : packages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl border border-lavender-100 shadow-gentle p-10 text-center"
                >
                  <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-lavender-100 flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-lavender-500" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">No packages yet</h2>
                  <p className="text-gray-500 mb-6 max-w-sm mx-auto text-sm">
                    Buy a session bundle to save up to 20% and have sessions ready whenever you need them.
                  </p>
                  <a
                    href="/#get-help"
                    className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-lavender-600 to-lavender-700 text-white rounded-xl font-semibold shadow-md"
                  >
                    <Sparkles className="w-5 h-5" />
                    View Packages
                  </a>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {packages.map((pkg) => {
                    const progress = pkg.total_sessions > 0 ? (pkg.sessions_used / pkg.total_sessions) * 100 : 0;
                    const statusColor: Record<string, string> = {
                      active: 'bg-green-100 text-green-700',
                      exhausted: 'bg-gray-100 text-gray-600',
                      expired: 'bg-red-100 text-red-600',
                      pending_payment: 'bg-amber-100 text-amber-700',
                      refunded: 'bg-blue-100 text-blue-700',
                      cancelled: 'bg-gray-100 text-gray-500',
                    };
                    return (
                      <motion.div
                        key={pkg.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl border border-lavender-100 shadow-gentle p-6"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2.5 rounded-xl bg-lavender-50 flex-shrink-0">
                              <Package className="w-5 h-5 text-lavender-500" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{pkg.package_title}</p>
                              <p className="text-sm text-gray-500 capitalize mt-0.5">
                                {pkg.session_type} · {pkg.session_format} · {pkg.duration_minutes} min/session
                              </p>
                              {pkg.valid_until && (
                                <p className="text-xs text-gray-400 mt-0.5">
                                  Valid until {new Date(pkg.valid_until).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-start sm:items-end gap-1.5 flex-shrink-0">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusColor[pkg.status] ?? 'bg-gray-100 text-gray-600'}`}>
                              {pkg.status.replace('_', ' ')}
                            </span>
                            {pkg.amount_paid_paise != null && (
                              <p className="text-xs text-gray-400">
                                Paid {pkg.currency === 'USD' ? `$${(pkg.amount_paid_paise / 100).toFixed(0)}` : `₹${(pkg.amount_paid_paise / 100).toLocaleString('en-IN')}`}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="mt-4">
                          <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                            <span>{pkg.sessions_used} of {pkg.total_sessions} sessions used</span>
                            <span className="font-medium text-lavender-700">{pkg.sessions_remaining} remaining</span>
                          </div>
                          <div className="h-2 bg-lavender-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-lavender-500 to-lavender-600 rounded-full transition-all"
                              style={{ width: `${Math.min(100, progress)}%` }}
                            />
                          </div>
                        </div>

                        {pkg.status === 'active' && pkg.sessions_remaining > 0 && (
                          <div className="mt-4 pt-4 border-t border-lavender-50">
                            <a
                              href="/#get-help"
                              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-lavender-600 to-lavender-700 text-white rounded-xl font-semibold text-sm shadow-md"
                            >
                              <Calendar className="w-4 h-4" />
                              Book a session from this package
                            </a>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* ── BOOKINGS TAB ── */}
          {activeTab === 'bookings' && (loading ? (
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
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-lavender-600 to-purple-600 text-white rounded-xl font-semibold hover:from-lavender-700 hover:to-purple-700 transition-all shadow-lg shadow-lavender-500/25 focus:outline-none focus:ring-2 focus:ring-lavender-500 focus:ring-offset-2"
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
                const isFree = booking.notes?.includes('[FREE_CONSULTATION]') || false;
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
                            {isFree ? <Phone className="w-5 h-5 text-lavender-500" /> : getFormatIcon(booking.session_format)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 capitalize">
                              {isFree ? 'Free Consultation · Call' : `${booking.session_type} · ${booking.session_format}`}
                            </p>
                            <p className="text-sm text-gray-500 mt-0.5">
                              {new Date(booking.scheduled_date + 'T00:00:00').toLocaleDateString(undefined, {
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
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {payment.status}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Join Session button for confirmed video/audio bookings */}
                      {booking.status === 'confirmed' && booking.meeting_url && (booking.session_format === 'video' || booking.session_format === 'audio') && (
                        <div className="mt-4 pt-4 border-t border-lavender-100 flex flex-wrap items-center gap-3">
                          <a
                            href={booking.meeting_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all shadow-md shadow-green-500/20"
                          >
                            {booking.session_format === 'video' ? <Video className="w-4 h-4" /> : <Headphones className="w-4 h-4" />}
                            Join Session
                            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                          </a>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(booking.meeting_url!);
                              setCopiedId(booking.id);
                              setTimeout(() => setCopiedId(null), 2000);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl text-sm font-medium transition-colors"
                            title="Copy meeting link"
                          >
                            {copiedId === booking.id ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                            {copiedId === booking.id ? 'Copied!' : 'Copy Link'}
                          </button>
                        </div>
                      )}

                      {booking.status === 'pending' && (
                        <div className="mt-4 pt-4 border-t border-lavender-100">
                          <p className="text-sm text-amber-600 font-medium">Awaiting confirmation from therapist</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              <div className="pt-6 text-center">
                <a
                  href="/#get-help"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-lavender-600 to-lavender-700 text-white rounded-xl font-semibold shadow-md shadow-lavender-500/20 hover:from-lavender-700 hover:to-lavender-800 transition-all focus:outline-none focus:ring-2 focus:ring-lavender-500 focus:ring-offset-2"
                >
                  <CalendarPlus className="w-5 h-5" />
                  Book Another Session
                </a>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MyBookingsPage;
