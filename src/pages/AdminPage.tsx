import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Calendar, 
  Users, 
  CreditCard, 
  BarChart3, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Mail,
  Phone,
  Video,
  Headphones,
  MessageSquare
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { formatPrice } from '../hooks/useGeolocation';

interface Booking {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  session_type: string;
  session_format: string;
  scheduled_date: string;
  scheduled_time: string;
  status: string;
  created_at: string;
  notes: string | null;
}

interface Payment {
  id: string;
  razorpay_order_id: string;
  razorpay_payment_id: string | null;
  amount_paise: number;
  status: string;
  created_at: string;
  paid_at: string | null;
}

interface DashboardStats {
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  todayBookings: number;
}

const AdminPage = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'bookings' | 'payments'>('dashboard');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [accessDenied, setAccessDenied] = useState(false);

  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        setAccessDenied(true);
        setLoading(false);
      } else if (profile && profile.role !== 'admin') {
        setAccessDenied(true);
        setLoading(false);
      } else if (profile && profile.role === 'admin') {
        setAccessDenied(false);
        fetchData();
      }
    }
  }, [user, profile, authLoading]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bookingsRes, paymentsRes] = await Promise.all([
        supabase.from('bookings').select('*').order('created_at', { ascending: false }),
        supabase.from('payments').select('*').order('created_at', { ascending: false }),
      ]);

      if (bookingsRes.data) {
        setBookings(bookingsRes.data);
        
        const today = new Date().toISOString().split('T')[0];
        const confirmed = bookingsRes.data.filter(b => b.status === 'confirmed').length;
        const pending = bookingsRes.data.filter(b => b.status === 'pending').length;
        const cancelled = bookingsRes.data.filter(b => b.status === 'cancelled').length;
        const todayCount = bookingsRes.data.filter(b => b.scheduled_date === today).length;

        setStats({
          totalBookings: bookingsRes.data.length,
          confirmedBookings: confirmed,
          pendingBookings: pending,
          cancelledBookings: cancelled,
          totalRevenue: paymentsRes.data?.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount_paise, 0) || 0,
          todayBookings: todayCount,
        });
      }

      if (paymentsRes.data) {
        setPayments(paymentsRes.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', bookingId);

      if (!error) {
        fetchData();
      }
    } catch (error) {
      console.error('Error updating booking:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      confirmed: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      cancelled: 'bg-red-100 text-red-700',
      completed: 'bg-blue-100 text-blue-700',
      paid: 'bg-green-100 text-green-700',
      failed: 'bg-red-100 text-red-700',
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'audio': return <Headphones className="w-4 h-4" />;
      case 'chat': return <MessageSquare className="w-4 h-4" />;
      default: return <Video className="w-4 h-4" />;
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customer_email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lavender-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking access...</p>
        </div>
      </div>
    );
  }

  if (accessDenied || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="pt-24 pb-16 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-6">
              {!user 
                ? "Please sign in to access the admin dashboard." 
                : "You don't have admin privileges to access this page."}
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-lavender-600 text-white rounded-lg hover:bg-lavender-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Go to Homepage
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lavender-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-lavender-50/50 to-white">
      <Navigation />
      
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-10">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-lavender-600 hover:text-lavender-700 mb-6 transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 font-display">Admin Dashboard</h1>
                <p className="text-lg text-gray-600 mt-1">Manage bookings, payments, and view analytics</p>
              </div>
              <button
                onClick={fetchData}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm bg-white border-2 border-lavender-200 text-lavender-700 hover:bg-lavender-50 hover:border-lavender-300 transition-all shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-8 p-1 bg-white/80 rounded-2xl border border-lavender-100 shadow-sm w-fit">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'bookings', label: 'My Bookings', icon: Calendar },
              { id: 'payments', label: 'Payments', icon: CreditCard },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-lavender-600 to-purple-600 text-white shadow-lg shadow-lavender-500/25'
                    : 'text-gray-600 hover:bg-lavender-50 hover:text-lavender-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && stats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Stats Grid - Match Book a Session card style */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { label: 'Total Bookings', value: stats.totalBookings, icon: Calendar, bg: 'bg-lavender-100', iconColor: 'text-lavender-600' },
                  { label: 'Confirmed', value: stats.confirmedBookings, icon: CheckCircle, bg: 'bg-green-100', iconColor: 'text-green-600' },
                  { label: 'Pending', value: stats.pendingBookings, icon: Clock, bg: 'bg-yellow-100', iconColor: 'text-yellow-600' },
                  { label: 'Cancelled', value: stats.cancelledBookings, icon: XCircle, bg: 'bg-red-100', iconColor: 'text-red-600' },
                  { label: 'Revenue', value: formatPrice(stats.totalRevenue / 100, true), icon: CreditCard, bg: 'bg-lavender-100', iconColor: 'text-lavender-600' },
                  { label: 'Today', value: stats.todayBookings, icon: Users, bg: 'bg-lavender-50', iconColor: 'text-lavender-600' },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-white rounded-2xl p-5 border border-lavender-100 shadow-gentle hover:shadow-card-hover hover:border-lavender-200/60 transition-all"
                  >
                    <div className={`p-2.5 rounded-xl ${stat.bg} w-fit mb-3`}>
                      <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Recent Bookings */}
              <div className="bg-white rounded-2xl border border-lavender-100 shadow-gentle overflow-hidden">
                <div className="px-6 py-4 border-b border-lavender-100 bg-gradient-to-r from-lavender-50/50 to-white">
                  <h3 className="font-semibold text-gray-900 text-lg">Recent Bookings</h3>
                  <p className="text-sm text-gray-500 mt-0.5">Latest 5 bookings</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-lavender-50/50 border-b border-lavender-100">
                        <th className="px-6 py-4 text-left text-xs font-semibold text-lavender-700 uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-lavender-700 uppercase tracking-wider">Session</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-lavender-700 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-lavender-700 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-lavender-100">
                      {bookings.slice(0, 5).map((booking) => (
                        <tr key={booking.id} className="hover:bg-lavender-50/30 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-medium text-gray-900">{booking.customer_name}</p>
                            <p className="text-sm text-gray-500">{booking.customer_email}</p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-gray-700">
                              {getFormatIcon(booking.session_format)}
                              <span className="text-sm capitalize">{booking.session_type}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(booking.scheduled_date).toLocaleDateString()} at {booking.scheduled_time}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(booking.status)}`}>
                              {booking.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* Bookings Tab - My Bookings */}
          {activeTab === 'bookings' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Section header - match Book a Session page */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl bg-lavender-100 text-lavender-600">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 font-display">My Bookings</h2>
                </div>
                <p className="text-gray-600 ml-12">View and manage all therapy session bookings</p>
              </div>

              {/* Filters - match site input styling */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-lavender-500 focus:bg-white focus:ring-0 transition-all text-gray-900 placeholder-gray-400"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-5 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-lavender-500 focus:ring-0 font-medium text-gray-700 transition-all"
                >
                  <option value="all">All Status</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Bookings Table - card style like Book a Session */}
              <div className="bg-white rounded-2xl border border-lavender-100 shadow-gentle overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-lavender-50 to-lavender-50/50 border-b border-lavender-200">
                        <th className="px-6 py-4 text-left text-xs font-semibold text-lavender-700 uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-lavender-700 uppercase tracking-wider">Contact</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-lavender-700 uppercase tracking-wider">Session</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-lavender-700 uppercase tracking-wider">Date & Time</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-lavender-700 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-lavender-700 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-lavender-100">
                      {filteredBookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-lavender-50/30 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-semibold text-gray-900">{booking.customer_name}</p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1.5">
                              <p className="text-sm text-gray-600 flex items-center gap-2">
                                <Mail className="w-4 h-4 text-lavender-500 flex-shrink-0" />
                                {booking.customer_email}
                              </p>
                              {booking.customer_phone && (
                                <p className="text-sm text-gray-600 flex items-center gap-2">
                                  <Phone className="w-4 h-4 text-lavender-500 flex-shrink-0" />
                                  {booking.customer_phone}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-gray-700">
                              <span className="text-lavender-500">{getFormatIcon(booking.session_format)}</span>
                              <span className="text-sm capitalize">{booking.session_type}</span>
                              <span className="text-gray-400 text-xs">({booking.session_format})</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-medium text-gray-900">{new Date(booking.scheduled_date).toLocaleDateString()}</p>
                            <p className="text-sm text-gray-500">{booking.scheduled_time}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusBadge(booking.status)}`}>
                              {booking.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {booking.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                                    className="p-2 text-green-600 hover:bg-green-50 rounded-xl transition-colors"
                                    title="Confirm"
                                  >
                                    <CheckCircle className="w-5 h-5" />
                                  </button>
                                  <button
                                    onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                    title="Cancel"
                                  >
                                    <XCircle className="w-5 h-5" />
                                  </button>
                                </>
                              )}
                              {booking.status === 'confirmed' && (
                                <button
                                  onClick={() => updateBookingStatus(booking.id, 'completed')}
                                  className="p-2 text-lavender-600 hover:bg-lavender-50 rounded-xl transition-colors"
                                  title="Mark Complete"
                                >
                                  <CheckCircle className="w-5 h-5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredBookings.length === 0 && (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-lavender-100 flex items-center justify-center">
                      <Calendar className="w-8 h-8 text-lavender-500" />
                    </div>
                    <p className="text-gray-600 font-medium">No bookings found</p>
                    <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filters</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl bg-lavender-100 text-lavender-600">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 font-display">Payments</h2>
                </div>
                <p className="text-gray-600 ml-12">Payment history and transaction details</p>
              </div>

              <div className="bg-white rounded-2xl border border-lavender-100 shadow-gentle overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-lavender-50 to-lavender-50/50 border-b border-lavender-200">
                        <th className="px-6 py-4 text-left text-xs font-semibold text-lavender-700 uppercase tracking-wider">Order ID</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-lavender-700 uppercase tracking-wider">Payment ID</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-lavender-700 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-lavender-700 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-lavender-700 uppercase tracking-wider">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-lavender-100">
                      {payments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-lavender-50/30 transition-colors">
                          <td className="px-6 py-4 font-mono text-sm text-gray-700">{payment.razorpay_order_id}</td>
                          <td className="px-6 py-4 font-mono text-sm text-gray-600">
                            {payment.razorpay_payment_id || '–'}
                          </td>
                          <td className="px-6 py-4 font-semibold text-gray-900">
                            {formatPrice(payment.amount_paise / 100, true)}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusBadge(payment.status)}`}>
                              {payment.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(payment.created_at).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {payments.length === 0 && (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-lavender-100 flex items-center justify-center">
                      <CreditCard className="w-8 h-8 text-lavender-500" />
                    </div>
                    <p className="text-gray-600 font-medium">No payments found</p>
                    <p className="text-sm text-gray-500 mt-1">Payments will appear here once customers complete checkout</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminPage;
