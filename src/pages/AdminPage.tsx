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
  RefreshCw,
  Mail,
  Phone,
  Video,
  Headphones,
  MessageSquare,
  FileCheck,
  Pencil,
  Trash2,
  Tag,
  Plus,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { logError } from '../lib/logger';
import { requestRefund, updateUserAdmin, deleteUserAdmin } from '../services/apiService';
import { formatPrice } from '../hooks/useGeolocation';
import type { Booking as DbBooking, Payment as DbPayment, ConsentRecord as DbConsentRecord, Profile as DbProfile } from '../types/database';

interface Booking {
  id: string;
  user_id?: string | null;
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
  booking_id: string | null;
  amount_paise: number;
  status: string;
  created_at: string;
  paid_at: string | null;
}

interface ConsentRecordRow {
  id: string;
  email: string;
  consent_version: string;
  session_type: string;
  acknowledgments: string[];
  consented_at: string;
}

interface ProfileRow {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  role: string;
  created_at: string;
}

interface CouponRow {
  id: string;
  code: string;
  discount_type: 'percent' | 'fixed';
  discount_value: number;
  min_amount_paise: number;
  valid_from: string | null;
  valid_until: string | null;
  max_uses: number | null;
  used_count: number;
  is_active: boolean;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface DashboardStats {
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  totalRefunded: number;
  todayBookings: number;
  totalConsents: number;
  totalUsers: number;
}

const AdminPage = () => {
  const { user, profile, session, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'bookings' | 'payments' | 'consent' | 'users' | 'coupons'>('dashboard');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [consentRecords, setConsentRecords] = useState<ConsentRecordRow[]>([]);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [coupons, setCoupons] = useState<CouponRow[]>([]);
  const [couponsLoadError, setCouponsLoadError] = useState<string | null>(null);
  const [couponForm, setCouponForm] = useState<CouponRow | null>(null);
  const [couponSaving, setCouponSaving] = useState(false);
  const [couponFormError, setCouponFormError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [accessDenied, setAccessDenied] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [refundingPaymentId, setRefundingPaymentId] = useState<string | null>(null);
  const [consentLoadError, setConsentLoadError] = useState<string | null>(null);
  const [paymentsLoadError, setPaymentsLoadError] = useState<string | null>(null);
  const [profilesLoadError, setProfilesLoadError] = useState<string | null>(null);
  const [bookingsLoadError, setBookingsLoadError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<ProfileRow | null>(null);
  const [editForm, setEditForm] = useState<{ full_name: string; email: string; phone: string; role: string }>({ full_name: '', email: '', phone: '', role: 'user' });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [bookingForm, setBookingForm] = useState<Partial<Booking>>({});
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [paymentFormStatus, setPaymentFormStatus] = useState<string>('pending');
  const [editingConsent, setEditingConsent] = useState<ConsentRecordRow | null>(null);
  const [consentForm, setConsentForm] = useState<{ email: string; session_type: string; consent_version: string }>({ email: '', session_type: 'individual', consent_version: '' });
  const [savingEntity, setSavingEntity] = useState<string | null>(null);
  const [deletingBookingId, setDeletingBookingId] = useState<string | null>(null);
  const [deletingPaymentId, setDeletingPaymentId] = useState<string | null>(null);
  const [deletingConsentId, setDeletingConsentId] = useState<string | null>(null);
  const [entityError, setEntityError] = useState<string | null>(null);
  const [deletingCouponId, setDeletingCouponId] = useState<string | null>(null);
  const [selectedBookingIds, setSelectedBookingIds] = useState<Set<string>>(new Set());
  const [selectedPaymentIds, setSelectedPaymentIds] = useState<Set<string>>(new Set());
  const [selectedCouponIds, setSelectedCouponIds] = useState<Set<string>>(new Set());
  const [selectedConsentIds, setSelectedConsentIds] = useState<Set<string>>(new Set());
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState<'bookings' | 'payments' | 'coupons' | 'consent' | 'users' | null>(null);

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

  // Security: Access control is enforced by Supabase RLS. See docs/SECURITY.md.
  const fetchData = async () => {
    setLoading(true);
    try {
      const [bookingsRes, paymentsRes, consentRes, profilesRes, couponsRes] = await Promise.all([
        supabase.from('bookings').select('*').order('created_at', { ascending: false }),
        supabase.from('payments').select('*').order('created_at', { ascending: false }),
        supabase.from('consent_records').select('id, email, consent_version, session_type, acknowledgments, consented_at').order('consented_at', { ascending: false }),
        supabase.from('profiles').select('id, email, full_name, phone, role, created_at').order('created_at', { ascending: false }),
        supabase.from('coupons').select('*').order('created_at', { ascending: false }),
      ]);

      const bookingsData = (bookingsRes.error ? [] : (bookingsRes.data ?? [])) as DbBooking[];
      const paymentsData = (paymentsRes.error ? [] : (paymentsRes.data ?? [])) as DbPayment[];
      const consentData = (consentRes.error ? [] : (consentRes.data ?? [])) as DbConsentRecord[];
      const profilesData = (profilesRes.error ? [] : (profilesRes.data ?? [])) as DbProfile[];

      setBookingsLoadError(bookingsRes.error ? bookingsRes.error.message : null);
      setConsentLoadError(consentRes.error ? consentRes.error.message : null);
      setPaymentsLoadError(paymentsRes.error ? paymentsRes.error.message : null);
      setProfilesLoadError(profilesRes.error ? profilesRes.error.message : null);
      setCouponsLoadError(couponsRes.error ? couponsRes.error.message : null);

      setBookings(bookingsData as unknown as Booking[]);
      setPayments(paymentsData as unknown as Payment[]);
      setCoupons((couponsRes.error ? [] : (couponsRes.data ?? [])) as CouponRow[]);
      setConsentRecords(consentData.map(c => {
        const acks = Array.isArray(c.acknowledgments) ? c.acknowledgments : [];
        return {
          id: c.id,
          email: c.email,
          consent_version: c.consent_version,
          session_type: c.session_type,
          acknowledgments: acks.map((a): string => (typeof a === 'string' ? a : String(a ?? ''))),
          consented_at: c.consented_at,
        };
      }));
      setProfiles(profilesData.map(p => ({
        id: p.id,
        email: p.email ?? null,
        full_name: p.full_name ?? null,
        phone: p.phone ?? null,
        role: p.role,
        created_at: p.created_at,
      })));

      const today = new Date().toISOString().split('T')[0];
      const confirmed = bookingsData.filter(b => b.status === 'confirmed').length;
      const pending = bookingsData.filter(b => b.status === 'pending').length;
      const cancelled = bookingsData.filter(b => b.status === 'cancelled').length;
      const todayCount = bookingsData.filter(b => b.scheduled_date === today).length;
      const paidSum = paymentsData.filter((p: DbPayment) => p.status === 'paid').reduce((sum: number, p: DbPayment) => sum + p.amount_paise, 0) || 0;
      const refundedSum = paymentsData.filter((p: DbPayment) => p.status === 'refunded').reduce((sum: number, p: DbPayment) => sum + p.amount_paise, 0) || 0;
      const revenue = paidSum - refundedSum;
      setStats({
        totalBookings: bookingsData.length,
        confirmedBookings: confirmed,
        pendingBookings: pending,
        cancelledBookings: cancelled,
        totalRevenue: revenue,
        totalRefunded: refundedSum,
        todayBookings: todayCount,
        totalConsents: consentData.length,
        totalUsers: profilesData.length,
      });
    } catch (error) {
      logError('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const payload: Record<string, unknown> = {
        status: newStatus as DbBooking['status'],
        updated_at: new Date().toISOString(),
      };
      if (newStatus === 'cancelled') {
        payload.cancelled_at = new Date().toISOString();
      }
      const { error } = await supabase.from('bookings').update(payload as never).eq('id', bookingId);

      if (!error) {
        fetchData();
      }
    } catch (error) {
      logError('Error updating booking:', error);
    }
  };

  const openEditUser = (p: ProfileRow) => {
    setEditingUser(p);
    setEditForm({
      full_name: p.full_name ?? '',
      email: p.email ?? '',
      phone: p.phone ?? '',
      role: p.role ?? 'user',
    });
    setEditError(null);
  };

  const saveEditUser = async () => {
    if (!editingUser || !session?.access_token) return;
    setEditSaving(true);
    setEditError(null);
    const res = await updateUserAdmin(session.access_token, {
      userId: editingUser.id,
      full_name: editForm.full_name || undefined,
      email: editForm.email?.trim() || undefined,
      phone: editForm.phone || undefined,
      role: editForm.role as 'user' | 'admin' | 'therapist',
    });
    setEditSaving(false);
    if (res.success) {
      setEditingUser(null);
      fetchData();
    } else {
      setEditError(res.error ?? 'Update failed');
    }
  };

  const confirmDeleteUser = (p: ProfileRow) => {
    if (p.id === user?.id) {
      setDeleteError('You cannot delete your own account.');
      return;
    }
    const bookingCount = bookings.filter((b) => b.user_id === p.id || (p.email && b.customer_email?.toLowerCase() === p.email.toLowerCase())).length;
    const msg = bookingCount > 0
      ? `Permanently delete "${p.full_name || p.email || p.id}"? This will remove the user, their ${bookingCount} booking(s), all related payments, consent records, and profile. This cannot be undone.`
      : `Permanently delete "${p.full_name || p.email || p.id}"? This will remove the user and all related data. This cannot be undone.`;
    if (!window.confirm(msg)) return;
    setDeleteError(null);
    setDeletingUserId(p.id);
    deleteUserAdmin(session?.access_token ?? '', p.id).then((res) => {
      setDeletingUserId(null);
      if (res.success) fetchData();
      else setDeleteError(res.error ?? 'Delete failed');
    });
  };

  const cancelAndRefund = async (bookingId: string) => {
    if (!window.confirm('Cancel this booking and process refund? (24+ hours before session: full refund; less: 50%)')) return;
    setCancelError(null);
    setCancellingId(bookingId);
    try {
      const refundRes = await requestRefund({ booking_id: bookingId });
      if (!refundRes.success && refundRes.error && !refundRes.error.includes('No paid payment')) {
        setCancelError(refundRes.error);
        setCancellingId(null);
        return;
      }
      await updateBookingStatus(bookingId, 'cancelled');
    } catch (e) {
      setCancelError(e instanceof Error ? e.message : 'Cancel/refund failed');
    } finally {
      setCancellingId(null);
    }
  };

  const refundPayment = async (razorpayPaymentId: string) => {
    if (!window.confirm('Process refund for this payment? (24+ hours before linked session: full; else 50%)')) return;
    setRefundingPaymentId(razorpayPaymentId);
    try {
      const res = await requestRefund({ razorpay_payment_id: razorpayPaymentId });
      if (res.success) fetchData();
    } finally {
      setRefundingPaymentId(null);
    }
  };

  const openEditBooking = (b: Booking) => {
    setEditingBooking(b);
    setBookingForm({
      customer_name: b.customer_name,
      customer_email: b.customer_email,
      customer_phone: b.customer_phone ?? '',
      session_type: b.session_type,
      session_format: b.session_format,
      scheduled_date: b.scheduled_date,
      scheduled_time: b.scheduled_time,
      status: b.status,
      notes: b.notes ?? '',
    });
    setEntityError(null);
  };

  const saveBookingEdit = async () => {
    if (!editingBooking) return;
    setSavingEntity('booking');
    setEntityError(null);
    const { error } = await supabase.from('bookings').update({
      customer_name: bookingForm.customer_name,
      customer_email: bookingForm.customer_email,
      customer_phone: bookingForm.customer_phone || null,
      session_type: bookingForm.session_type as DbBooking['session_type'],
      session_format: bookingForm.session_format as DbBooking['session_format'],
      scheduled_date: bookingForm.scheduled_date,
      scheduled_time: bookingForm.scheduled_time,
      status: bookingForm.status as DbBooking['status'],
      notes: bookingForm.notes || null,
      updated_at: new Date().toISOString(),
    }).eq('id', editingBooking.id);
    setSavingEntity(null);
    if (error) {
      setEntityError(error.message);
    } else {
      setEditingBooking(null);
      fetchData();
    }
  };

  const deleteBooking = async (id: string) => {
    if (!window.confirm('Permanently delete this booking? Linked payments will be unlinked. This cannot be undone.')) return;
    setDeletingBookingId(id);
    setEntityError(null);
    const { error } = await supabase.from('bookings').delete().eq('id', id);
    setDeletingBookingId(null);
    if (error) {
      setEntityError(error.message);
      alert(`Delete failed: ${error.message}\n\nIf you see "row-level security" or "policy", run the admin RLS policies in Supabase (docs/supabase-admin-edit-delete-policies.sql or docs/supabase-full-setup.sql) and ensure your profile has role = 'admin'.`);
    } else fetchData();
  };

  const openEditPayment = (p: Payment) => {
    setEditingPayment(p);
    setPaymentFormStatus(p.status);
    setEntityError(null);
  };

  const savePaymentEdit = async () => {
    if (!editingPayment) return;
    setSavingEntity('payment');
    setEntityError(null);
    const { error } = await supabase.from('payments').update({
      status: paymentFormStatus as DbPayment['status'],
    }).eq('id', editingPayment.id);
    setSavingEntity(null);
    if (error) {
      setEntityError(error.message);
    } else {
      setEditingPayment(null);
      fetchData();
    }
  };

  const deletePayment = async (id: string) => {
    if (!window.confirm('Permanently delete this payment record? This does not process a refund. Cannot be undone.')) return;
    setDeletingPaymentId(id);
    setEntityError(null);
    const { error } = await supabase.from('payments').delete().eq('id', id);
    setDeletingPaymentId(null);
    if (error) {
      setEntityError(error.message);
      alert(`Delete failed: ${error.message}\n\nIf you see "row-level security" or "policy", run the admin RLS policies in Supabase (docs/supabase-admin-edit-delete-policies.sql or docs/supabase-full-setup.sql) and ensure your profile has role = 'admin'.`);
    } else fetchData();
  };

  const openEditConsent = (c: ConsentRecordRow) => {
    setEditingConsent(c);
    setConsentForm({
      email: c.email,
      session_type: c.session_type,
      consent_version: c.consent_version,
    });
    setEntityError(null);
  };

  const saveConsentEdit = async () => {
    if (!editingConsent) return;
    setSavingEntity('consent');
    setEntityError(null);
    const { error } = await supabase.from('consent_records').update({
      email: consentForm.email,
      session_type: consentForm.session_type,
      consent_version: consentForm.consent_version,
    }).eq('id', editingConsent.id);
    setSavingEntity(null);
    if (error) {
      setEntityError(error.message);
    } else {
      setEditingConsent(null);
      fetchData();
    }
  };

  const deleteConsent = async (id: string) => {
    if (!window.confirm('Permanently delete this consent record? Cannot be undone.')) return;
    setDeletingConsentId(id);
    setEntityError(null);
    const { error } = await supabase.from('consent_records').delete().eq('id', id);
    setDeletingConsentId(null);
    if (error) {
      setEntityError(error.message);
      alert(`Delete failed: ${error.message}\n\nIf you see "row-level security" or "policy", run the admin RLS policies in Supabase (docs/supabase-admin-edit-delete-policies.sql or docs/supabase-full-setup.sql) and ensure your profile has role = 'admin'.`);
    } else fetchData();
  };

  const deleteCoupon = async (id: string) => {
    if (!window.confirm('Permanently delete this coupon? It cannot be used again. Cannot be undone.')) return;
    setDeletingCouponId(id);
    setEntityError(null);
    const { error } = await supabase.from('coupons').delete().eq('id', id);
    setDeletingCouponId(null);
    if (error) {
      setEntityError(error.message);
      alert(`Delete failed: ${error.message}`);
    } else fetchData();
  };

  const deleteSelectedBookings = async () => {
    const ids = Array.from(selectedBookingIds);
    if (ids.length === 0) return;
    if (!window.confirm(`Permanently delete ${ids.length} booking(s)? Linked payments will be unlinked. This cannot be undone.`)) return;
    setBulkDeleting('bookings');
    setEntityError(null);
    const { error } = await supabase.from('bookings').delete().in('id', ids);
    setBulkDeleting(null);
    setSelectedBookingIds(new Set());
    if (error) {
      setEntityError(error.message);
      alert(`Delete failed: ${error.message}`);
    } else fetchData();
  };

  const deleteSelectedPayments = async () => {
    const ids = Array.from(selectedPaymentIds);
    if (ids.length === 0) return;
    if (!window.confirm(`Permanently delete ${ids.length} payment(s)? This does not process refunds. Cannot be undone.`)) return;
    setBulkDeleting('payments');
    setEntityError(null);
    const { error } = await supabase.from('payments').delete().in('id', ids);
    setBulkDeleting(null);
    setSelectedPaymentIds(new Set());
    if (error) {
      setEntityError(error.message);
      alert(`Delete failed: ${error.message}`);
    } else fetchData();
  };

  const deleteSelectedCoupons = async () => {
    const ids = Array.from(selectedCouponIds);
    if (ids.length === 0) return;
    if (!window.confirm(`Permanently delete ${ids.length} coupon(s)? Cannot be undone.`)) return;
    setBulkDeleting('coupons');
    setEntityError(null);
    const { error } = await supabase.from('coupons').delete().in('id', ids);
    setBulkDeleting(null);
    setSelectedCouponIds(new Set());
    if (error) {
      setEntityError(error.message);
      alert(`Delete failed: ${error.message}`);
    } else fetchData();
  };

  const deleteSelectedConsent = async () => {
    const ids = Array.from(selectedConsentIds);
    if (ids.length === 0) return;
    if (!window.confirm(`Permanently delete ${ids.length} consent record(s)? Cannot be undone.`)) return;
    setBulkDeleting('consent');
    setEntityError(null);
    const { error } = await supabase.from('consent_records').delete().in('id', ids);
    setBulkDeleting(null);
    setSelectedConsentIds(new Set());
    if (error) {
      setEntityError(error.message);
      alert(`Delete failed: ${error.message}`);
    } else fetchData();
  };

  const deleteSelectedUsers = async () => {
    const ids = Array.from(selectedUserIds).filter((id) => id !== user?.id);
    if (ids.length === 0) {
      if (selectedUserIds.has(user?.id ?? '')) setDeleteError('You cannot delete your own account.');
      return;
    }
    if (!window.confirm(`Permanently delete ${ids.length} user(s) and their related data? This cannot be undone.`)) return;
    setBulkDeleting('users');
    setDeleteError(null);
    const token = session?.access_token ?? '';
    let lastError: string | null = null;
    for (const id of ids) {
      const res = await deleteUserAdmin(token, id);
      if (!res.success) lastError = res.error ?? 'Delete failed';
    }
    setBulkDeleting(null);
    setSelectedUserIds(new Set());
    if (lastError) setDeleteError(lastError);
    fetchData();
  };

  const openCouponForm = (coupon?: CouponRow | null) => {
    setCouponFormError(null);
    if (coupon) {
      setCouponForm({
        ...coupon,
        valid_from: coupon.valid_from ? coupon.valid_from.slice(0, 16) : '',
        valid_until: coupon.valid_until ? coupon.valid_until.slice(0, 16) : '',
      } as CouponRow);
    } else {
      setCouponForm({
        id: '',
        code: '',
        discount_type: 'percent',
        discount_value: 10,
        min_amount_paise: 0,
        valid_from: '',
        valid_until: '',
        max_uses: null,
        used_count: 0,
        is_active: true,
        description: '',
        created_at: '',
        updated_at: '',
      } as CouponRow);
    }
  };

  const closeCouponForm = () => {
    setCouponForm(null);
    setCouponFormError(null);
  };

  const saveCoupon = async () => {
    if (!couponForm) return;
    const code = couponForm.code.trim().toUpperCase();
    if (!code) {
      setCouponFormError('Code is required');
      return;
    }
    if (couponForm.discount_value <= 0 || (couponForm.discount_type === 'percent' && couponForm.discount_value > 100)) {
      setCouponFormError('Invalid discount value (1–100 for percent, positive for fixed ₹)');
      return;
    }
    setCouponFormError(null);
    setCouponSaving(true);
    try {
      const base = {
        code,
        discount_type: couponForm.discount_type,
        discount_value: couponForm.discount_value,
        min_amount_paise: Math.max(0, Math.floor(Number(couponForm.min_amount_paise) || 0)),
        valid_from: couponForm.valid_from ? new Date(couponForm.valid_from).toISOString() : null,
        valid_until: couponForm.valid_until ? new Date(couponForm.valid_until).toISOString() : null,
        max_uses: (couponForm.max_uses != null && String(couponForm.max_uses).trim() !== '') ? Math.max(0, Math.floor(Number(couponForm.max_uses))) : null,
        is_active: couponForm.is_active,
        description: couponForm.description?.trim() || null,
      };
      if (couponForm.id) {
        const { error } = await supabase.from('coupons').update({ ...base, updated_at: new Date().toISOString() }).eq('id', couponForm.id);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabase.from('coupons').insert(base);
        if (error) throw new Error(error.message);
      }
      closeCouponForm();
      fetchData();
    } catch (e) {
      setCouponFormError(e instanceof Error ? e.message : 'Failed to save coupon');
    } finally {
      setCouponSaving(false);
    }
  };

  const toggleCouponActive = async (c: CouponRow) => {
    try {
      const { error } = await supabase.from('coupons').update({ is_active: !c.is_active, updated_at: new Date().toISOString() }).eq('id', c.id);
      if (error) throw new Error(error.message);
      fetchData();
    } catch (e) {
      console.error(e);
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
      refunded: 'bg-gray-100 text-gray-700',
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'audio': return <Headphones className="w-4 h-4" />;
      case 'chat': return <MessageSquare className="w-4 h-4" />;
      case 'call': return <Phone className="w-4 h-4" />;
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
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 mb-8">
            <div className="flex gap-1 p-1 bg-white/80 rounded-2xl border border-lavender-100 shadow-sm w-fit min-w-0">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                { id: 'bookings', label: 'Bookings', icon: Calendar },
                { id: 'payments', label: 'Payments', icon: CreditCard },
                { id: 'coupons', label: 'Coupons', icon: Tag },
                { id: 'consent', label: 'Consent', icon: FileCheck },
                { id: 'users', label: 'Users', icon: Users },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
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
                  { label: 'Revenue (net)', value: formatPrice(stats.totalRevenue / 100, true), icon: CreditCard, bg: 'bg-lavender-100', iconColor: 'text-lavender-600' },
                  { label: 'Refunded', value: formatPrice(stats.totalRefunded / 100, true), icon: XCircle, bg: 'bg-gray-100', iconColor: 'text-gray-600' },
                  { label: 'Today', value: stats.todayBookings, icon: Users, bg: 'bg-lavender-50', iconColor: 'text-lavender-600' },
                  { label: 'Consents', value: stats.totalConsents, icon: FileCheck, bg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
                  { label: 'Users', value: stats.totalUsers, icon: Users, bg: 'bg-lavender-50', iconColor: 'text-lavender-600' },
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

              {!bookingsLoadError && stats.totalBookings === 0 && (
                <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sky-800">No bookings loaded</p>
                    <p className="text-sm text-sky-700 mt-1">If you expect bookings, run <code className="bg-sky-100 px-1 rounded">docs/supabase-full-setup.sql</code> in Supabase (creates <code className="bg-sky-100 px-1 rounded">is_admin()</code> and RLS). Then set your user’s <code className="bg-sky-100 px-1 rounded">profiles.role</code> to <code className="bg-sky-100 px-1 rounded">admin</code> and refresh.</p>
                  </div>
                </div>
              )}

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
                      {bookings.slice(0, 5).map((booking) => {
                        const isFreeBooking = booking.notes?.includes('[FREE_CONSULTATION]') || false;
                        return (
                        <tr key={booking.id} className="hover:bg-lavender-50/30 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-medium text-gray-900">{booking.customer_name}</p>
                            <p className="text-sm text-gray-500">{booking.customer_email}</p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-gray-700">
                              {isFreeBooking ? <Phone className="w-4 h-4" /> : getFormatIcon(booking.session_format)}
                              <span className="text-sm capitalize">{isFreeBooking ? 'Free Consultation' : booking.session_type}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(booking.scheduled_date + 'T00:00:00').toLocaleDateString()} at {booking.scheduled_time}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(booking.status)}`}>
                              {booking.status}
                            </span>
                          </td>
                        </tr>
                        );
                      })}
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

              {cancelError && (
                <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-red-800">Cancel/refund issue</p>
                    <p className="text-sm text-red-700 mt-1">{cancelError}</p>
                  </div>
                  <button type="button" onClick={() => setCancelError(null)} className="text-red-600 hover:text-red-800">Dismiss</button>
                </div>
              )}

              {entityError && (
                <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-red-800">Error</p>
                    <p className="text-sm text-red-700 mt-1">{entityError}</p>
                  </div>
                  <button type="button" onClick={() => setEntityError(null)} className="text-red-600 hover:text-red-800">Dismiss</button>
                </div>
              )}

              {bookingsLoadError && (
                <div className="mb-4 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">Could not load bookings</p>
                    <p className="text-sm text-amber-700 mt-1">Run the <code className="bg-amber-100 px-1 rounded">is_admin()</code> function and admin RLS policies in Supabase (see <code className="bg-amber-100 px-1 rounded">docs/SUPABASE_SETUP.md</code> or run <code className="bg-amber-100 px-1 rounded">docs/supabase-full-setup.sql</code>). Ensure your user has <code className="bg-amber-100 px-1 rounded">profiles.role = &#39;admin&#39;</code>.</p>
                  </div>
                </div>
              )}

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
                {selectedBookingIds.size > 0 && (
                  <div className="px-6 py-3 bg-lavender-50 border-b border-lavender-200 flex items-center justify-between gap-4">
                    <span className="text-sm font-medium text-lavender-800">{selectedBookingIds.size} selected</span>
                    <button
                      type="button"
                      onClick={deleteSelectedBookings}
                      disabled={bulkDeleting === 'bookings'}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      {bulkDeleting === 'bookings' ? 'Deleting…' : `Delete selected (${selectedBookingIds.size})`}
                    </button>
                  </div>
                )}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-lavender-50 to-lavender-50/50 border-b border-lavender-200">
                        <th className="px-4 py-4 w-12 text-left">
                          <input
                            type="checkbox"
                            checked={filteredBookings.length > 0 && filteredBookings.every((b) => selectedBookingIds.has(b.id))}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedBookingIds((s) => new Set([...s, ...filteredBookings.map((b) => b.id)]));
                              else setSelectedBookingIds((s) => { const n = new Set(s); filteredBookings.forEach((b) => n.delete(b.id)); return n; });
                            }}
                            className="rounded border-gray-300 text-lavender-600 focus:ring-lavender-500"
                            aria-label="Select all bookings"
                          />
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-lavender-700 uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-lavender-700 uppercase tracking-wider">Contact</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-lavender-700 uppercase tracking-wider">Session</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-lavender-700 uppercase tracking-wider">Date & Time</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-lavender-700 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-lavender-700 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-lavender-100">
                      {filteredBookings.map((booking) => {
                        const isFreeBooking = booking.notes?.includes('[FREE_CONSULTATION]') || false;
                        return (
                        <tr key={booking.id} className="hover:bg-lavender-50/30 transition-colors">
                          <td className="px-4 py-4 w-12">
                            <input
                              type="checkbox"
                              checked={selectedBookingIds.has(booking.id)}
                              onChange={() => setSelectedBookingIds((s) => { const n = new Set(s); if (n.has(booking.id)) n.delete(booking.id); else n.add(booking.id); return n; })}
                              className="rounded border-gray-300 text-lavender-600 focus:ring-lavender-500"
                              aria-label={`Select ${booking.customer_name}`}
                            />
                          </td>
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
                              <span className="text-lavender-500">{isFreeBooking ? <Phone className="w-4 h-4" /> : getFormatIcon(booking.session_format)}</span>
                              <span className="text-sm capitalize">{isFreeBooking ? 'Free Consultation' : booking.session_type}</span>
                              <span className="text-gray-400 text-xs">({isFreeBooking ? 'call' : booking.session_format})</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-medium text-gray-900">{new Date(booking.scheduled_date + 'T00:00:00').toLocaleDateString()}</p>
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
                                    onClick={() => cancelAndRefund(booking.id)}
                                    disabled={cancellingId === booking.id}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                                    title="Cancel & refund (per policy)"
                                  >
                                    <XCircle className="w-5 h-5" />
                                  </button>
                                </>
                              )}
                              {booking.status === 'confirmed' && (
                                <>
                                  <button
                                    onClick={() => updateBookingStatus(booking.id, 'completed')}
                                    className="p-2 text-lavender-600 hover:bg-lavender-50 rounded-xl transition-colors"
                                    title="Mark Complete"
                                  >
                                    <CheckCircle className="w-5 h-5" />
                                  </button>
                                  <button
                                    onClick={() => cancelAndRefund(booking.id)}
                                    disabled={cancellingId === booking.id}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                                    title="Cancel & refund (per policy)"
                                  >
                                    <XCircle className="w-5 h-5" />
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => openEditBooking(booking)}
                                className="p-2 text-lavender-600 hover:bg-lavender-50 rounded-xl transition-colors"
                                title="Edit booking"
                              >
                                <Pencil className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => deleteBooking(booking.id)}
                                disabled={deletingBookingId === booking.id}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                                title="Delete booking"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {filteredBookings.length === 0 && (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-lavender-100 flex items-center justify-center">
                      <Calendar className="w-8 h-8 text-lavender-500" />
                    </div>
                    <p className="text-gray-600 font-medium">No bookings found</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {!bookingsLoadError && bookings.length === 0
                        ? 'Run docs/supabase-full-setup.sql in Supabase and set your profile role to admin, then refresh.'
                        : 'Try adjusting your search or filters'}
                    </p>
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

              {paymentsLoadError && (
                <div className="mb-4 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">Could not load payments</p>
                    <p className="text-sm text-amber-700 mt-1">Create the <code className="bg-amber-100 px-1 rounded">payments</code> table and add the RLS policy &quot;Admins can read payments&quot; in Supabase (see <code className="bg-amber-100 px-1 rounded">docs/SUPABASE_SETUP.md</code>). Revenue and counts will then update.</p>
                  </div>
                </div>
              )}

              {entityError && (
                <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-red-800">Error</p>
                    <p className="text-sm text-red-700 mt-1">{entityError}</p>
                  </div>
                  <button type="button" onClick={() => setEntityError(null)} className="text-red-600 hover:text-red-800">Dismiss</button>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-lavender-100 shadow-gentle overflow-hidden">
                {selectedPaymentIds.size > 0 && (
                  <div className="px-6 py-3 bg-lavender-50 border-b border-lavender-200 flex items-center justify-between gap-4">
                    <span className="text-sm font-medium text-lavender-800">{selectedPaymentIds.size} selected</span>
                    <button
                      type="button"
                      onClick={deleteSelectedPayments}
                      disabled={bulkDeleting === 'payments'}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      {bulkDeleting === 'payments' ? 'Deleting…' : `Delete selected (${selectedPaymentIds.size})`}
                    </button>
                  </div>
                )}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-lavender-50 to-lavender-50/50 border-b border-lavender-200">
                        <th className="px-4 py-4 w-12 text-left">
                          <input
                            type="checkbox"
                            checked={payments.length > 0 && payments.every((p) => selectedPaymentIds.has(p.id))}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedPaymentIds((s) => new Set([...s, ...payments.map((p) => p.id)]));
                              else setSelectedPaymentIds(new Set());
                            }}
                            className="rounded border-gray-300 text-lavender-600 focus:ring-lavender-500"
                            aria-label="Select all payments"
                          />
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-lavender-700 uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-lavender-700 uppercase tracking-wider">Order ID</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-lavender-700 uppercase tracking-wider">Payment ID</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-lavender-700 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-lavender-700 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-lavender-700 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-lavender-700 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-lavender-100">
                      {payments.map((payment) => {
                        const linkedBooking = payment.booking_id ? bookings.find((b) => b.id === payment.booking_id) : null;
                        const meta = (payment as unknown as Record<string, unknown>).metadata as Record<string, unknown> | undefined;
                        const customerName = linkedBooking?.customer_name ?? (typeof meta?.customer_name === 'string' ? meta.customer_name : '–');
                        const customerEmail = linkedBooking?.customer_email ?? (typeof meta?.customer_email === 'string' ? meta.customer_email : '');
                        return (
                        <tr key={payment.id} className="hover:bg-lavender-50/30 transition-colors">
                          <td className="px-4 py-4 w-12">
                            <input
                              type="checkbox"
                              checked={selectedPaymentIds.has(payment.id)}
                              onChange={() => setSelectedPaymentIds((s) => { const n = new Set(s); if (n.has(payment.id)) n.delete(payment.id); else n.add(payment.id); return n; })}
                              className="rounded border-gray-300 text-lavender-600 focus:ring-lavender-500"
                              aria-label={`Select payment ${payment.razorpay_order_id}`}
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-gray-900">{customerName}</p>
                              {customerEmail && (
                                <p className="text-xs text-gray-500 truncate max-w-[180px]" title={customerEmail}>{customerEmail}</p>
                              )}
                            </div>
                          </td>
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
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {payment.status === 'paid' && payment.razorpay_payment_id && (
                                <button
                                  type="button"
                                  onClick={() => refundPayment(payment.razorpay_payment_id!)}
                                  disabled={refundingPaymentId === payment.razorpay_payment_id}
                                  className="text-sm text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
                                >
                                  Refund
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => openEditPayment(payment)}
                                className="p-2 text-lavender-600 hover:bg-lavender-50 rounded-xl transition-colors"
                                title="Edit payment"
                              >
                                <Pencil className="w-5 h-5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => deletePayment(payment.id)}
                                disabled={deletingPaymentId === payment.id}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                                title="Delete payment"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                      })}
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

          {/* Coupons Tab */}
          {activeTab === 'coupons' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-lavender-100 shadow-sm overflow-hidden"
            >
              <div className="px-6 py-5 border-b border-lavender-100 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 font-display">Coupons</h2>
                  <p className="text-gray-600 mt-0.5">Discount codes for special offers. Customers enter the code at checkout.</p>
                </div>
                <button
                  type="button"
                  onClick={() => openCouponForm(null)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm bg-lavender-600 text-white hover:bg-lavender-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add coupon
                </button>
              </div>
              {couponsLoadError && (
                <div className="mx-6 mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200">
                  <p className="font-medium text-amber-800">Could not load coupons</p>
                  <p className="text-sm text-amber-700 mt-1">{couponsLoadError}. Run <code className="bg-amber-100 px-1 rounded">docs/supabase-coupons-migration.sql</code> in Supabase if the table is missing.</p>
                </div>
              )}
              {entityError && (
                <div className="mx-6 mt-4 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-red-800">Error</p>
                    <p className="text-sm text-red-700 mt-1">{entityError}</p>
                  </div>
                  <button type="button" onClick={() => setEntityError(null)} className="text-red-600 hover:text-red-800">Dismiss</button>
                </div>
              )}
              <div className="overflow-x-auto">
                {selectedCouponIds.size > 0 && (
                  <div className="mx-6 mt-4 py-3 flex items-center justify-between gap-4">
                    <span className="text-sm font-medium text-lavender-800">{selectedCouponIds.size} selected</span>
                    <button
                      type="button"
                      onClick={deleteSelectedCoupons}
                      disabled={bulkDeleting === 'coupons'}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      {bulkDeleting === 'coupons' ? 'Deleting…' : `Delete selected (${selectedCouponIds.size})`}
                    </button>
                  </div>
                )}
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 w-12 text-left">
                        <input
                          type="checkbox"
                          checked={coupons.length > 0 && coupons.every((c) => selectedCouponIds.has(c.id))}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedCouponIds((s) => new Set([...s, ...coupons.map((c) => c.id)]));
                            else setSelectedCouponIds(new Set());
                          }}
                          className="rounded border-gray-300 text-lavender-600 focus:ring-lavender-500"
                          aria-label="Select all coupons"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Min (₹)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valid</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uses</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Active</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {coupons.map((c) => (
                      <tr key={c.id}>
                        <td className="px-4 py-4 w-12">
                          <input
                            type="checkbox"
                            checked={selectedCouponIds.has(c.id)}
                            onChange={() => setSelectedCouponIds((s) => { const n = new Set(s); if (n.has(c.id)) n.delete(c.id); else n.add(c.id); return n; })}
                            className="rounded border-gray-300 text-lavender-600 focus:ring-lavender-500"
                            aria-label={`Select ${c.code}`}
                          />
                        </td>
                        <td className="px-6 py-4 text-sm font-mono font-medium text-gray-900">{c.code}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{c.discount_type}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {c.discount_type === 'percent' ? `${c.discount_value}%` : `₹${c.discount_value}`}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{c.min_amount_paise ? `₹${Math.round(c.min_amount_paise / 100)}` : '—'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {c.valid_from || c.valid_until
                            ? `${c.valid_from ? new Date(c.valid_from).toLocaleDateString() : '—'} – ${c.valid_until ? new Date(c.valid_until).toLocaleDateString() : '—'}`
                            : '—'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{c.used_count}{c.max_uses != null ? ` / ${c.max_uses}` : ''}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {c.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button type="button" onClick={() => openCouponForm(c)} className="p-2 text-lavender-600 hover:bg-lavender-50 rounded-xl transition-colors" title="Edit">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button type="button" onClick={() => toggleCouponActive(c)} className="text-sm font-medium text-gray-600 hover:text-gray-800">
                              {c.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteCoupon(c.id)}
                              disabled={deletingCouponId === c.id}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                              title="Delete coupon"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {coupons.length === 0 && !couponsLoadError && (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-lavender-100 flex items-center justify-center">
                      <Tag className="w-8 h-8 text-lavender-500" />
                    </div>
                    <p className="text-gray-600 font-medium">No coupons yet</p>
                    <p className="text-sm text-gray-500 mt-1">Add a coupon to offer discounts at checkout</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Consent Tab – users who have given consent */}
          {activeTab === 'consent' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 font-display">Consent records</h2>
                </div>
                <p className="text-gray-600 ml-12">Users who have given informed consent before booking (for compliance)</p>
              </div>

              {consentLoadError && (
                <div className="mb-4 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">Could not load consent records</p>
                    <p className="text-sm text-amber-700 mt-1">Add the RLS policy so admins can read this table: in Supabase SQL Editor run the &quot;Admins can read consent records&quot; block from <code className="bg-amber-100 px-1 rounded">docs/SUPABASE_SETUP.md</code>. Ensure your user has <code className="bg-amber-100 px-1 rounded">profiles.role = &#39;admin&#39;</code>.</p>
                  </div>
                </div>
              )}

              {entityError && (
                <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-red-800">Error</p>
                    <p className="text-sm text-red-700 mt-1">{entityError}</p>
                  </div>
                  <button type="button" onClick={() => setEntityError(null)} className="text-red-600 hover:text-red-800">Dismiss</button>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-lavender-100 shadow-gentle overflow-hidden">
                {selectedConsentIds.size > 0 && (
                  <div className="px-6 py-3 bg-lavender-50 border-b border-lavender-200 flex items-center justify-between gap-4">
                    <span className="text-sm font-medium text-lavender-800">{selectedConsentIds.size} selected</span>
                    <button
                      type="button"
                      onClick={deleteSelectedConsent}
                      disabled={bulkDeleting === 'consent'}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      {bulkDeleting === 'consent' ? 'Deleting…' : `Delete selected (${selectedConsentIds.size})`}
                    </button>
                  </div>
                )}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-emerald-50 to-lavender-50 border-b border-lavender-200">
                        <th className="px-4 py-4 w-12 text-left">
                          <input
                            type="checkbox"
                            checked={consentRecords.length > 0 && consentRecords.every((r) => selectedConsentIds.has(r.id))}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedConsentIds((s) => new Set([...s, ...consentRecords.map((r) => r.id)]));
                              else setSelectedConsentIds(new Set());
                            }}
                            className="rounded border-gray-300 text-lavender-600 focus:ring-lavender-500"
                            aria-label="Select all consent records"
                          />
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-lavender-700 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-lavender-700 uppercase tracking-wider">Session type</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-lavender-700 uppercase tracking-wider">Version</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-lavender-700 uppercase tracking-wider">Acknowledgments</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-lavender-700 uppercase tracking-wider">Consented at</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-lavender-700 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-lavender-100">
                      {consentRecords.map((record) => (
                        <tr key={record.id} className="hover:bg-lavender-50/30 transition-colors">
                          <td className="px-4 py-4 w-12">
                            <input
                              type="checkbox"
                              checked={selectedConsentIds.has(record.id)}
                              onChange={() => setSelectedConsentIds((s) => { const n = new Set(s); if (n.has(record.id)) n.delete(record.id); else n.add(record.id); return n; })}
                              className="rounded border-gray-300 text-lavender-600 focus:ring-lavender-500"
                              aria-label={`Select ${record.email}`}
                            />
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-medium text-gray-900">{record.email}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className="capitalize text-gray-700">{record.session_type}</span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{record.consent_version}</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                              {record.acknowledgments.length} items
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(record.consented_at).toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => openEditConsent(record)}
                                className="p-2 text-lavender-600 hover:bg-lavender-50 rounded-xl transition-colors"
                                title="Edit consent"
                              >
                                <Pencil className="w-5 h-5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteConsent(record.id)}
                                disabled={deletingConsentId === record.id}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                                title="Delete consent"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {consentRecords.length === 0 && (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-100 flex items-center justify-center">
                      <FileCheck className="w-8 h-8 text-emerald-500" />
                    </div>
                    <p className="text-gray-600 font-medium">No consent records yet</p>
                    <p className="text-sm text-gray-500 mt-1">Consent is recorded when users complete the booking flow and accept the consent form</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Users Tab – all registered users (profiles) */}
          {activeTab === 'users' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl bg-lavender-100 text-lavender-600">
                    <Users className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 font-display">Users</h2>
                </div>
                <p className="text-gray-600 ml-12">All registered users (profiles). Bookings and consents are derived from existing data.</p>
              </div>

              {profilesLoadError && (
                <div className="mb-4 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">Could not load users</p>
                    <p className="text-sm text-amber-700 mt-1">Create the <code className="bg-amber-100 px-1 rounded">profiles</code> table and add RLS so admins can read (see <code className="bg-amber-100 px-1 rounded">docs/SUPABASE_SETUP.md</code>).</p>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-lavender-100 shadow-gentle overflow-hidden">
                {selectedUserIds.size > 0 && (
                  <div className="px-6 py-3 bg-lavender-50 border-b border-lavender-200 flex items-center justify-between gap-4">
                    <span className="text-sm font-medium text-lavender-800">{selectedUserIds.size} selected</span>
                    <button
                      type="button"
                      onClick={deleteSelectedUsers}
                      disabled={bulkDeleting === 'users'}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      {bulkDeleting === 'users' ? 'Deleting…' : `Delete selected (${selectedUserIds.size})`}
                    </button>
                  </div>
                )}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-lavender-50 to-lavender-50/50 border-b border-lavender-200">
                        <th className="px-4 py-4 w-12 text-left">
                          <input
                            type="checkbox"
                            checked={profiles.length > 0 && profiles.filter((p) => p.id !== user?.id).every((p) => selectedUserIds.has(p.id))}
                            onChange={(e) => {
                              const ids = profiles.filter((p) => p.id !== user?.id).map((p) => p.id);
                              if (e.target.checked) setSelectedUserIds((s) => new Set([...s, ...ids]));
                              else setSelectedUserIds((s) => { const n = new Set(s); ids.forEach((id) => n.delete(id)); return n; });
                            }}
                            className="rounded border-gray-300 text-lavender-600 focus:ring-lavender-500"
                            aria-label="Select all users"
                          />
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-lavender-700 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-lavender-700 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-lavender-700 uppercase tracking-wider">Phone</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-lavender-700 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-lavender-700 uppercase tracking-wider">Bookings</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-lavender-700 uppercase tracking-wider">Consents</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-lavender-700 uppercase tracking-wider">Joined</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-lavender-700 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-lavender-100">
                      {profiles.map((p) => {
                        const profileEmail = p.email?.toLowerCase();
                        const bookingCount = bookings.filter(
                          (b) => b.user_id === p.id || (profileEmail && b.customer_email?.toLowerCase() === profileEmail)
                        ).length;
                        const consentCount = consentRecords.filter(
                          (c) => p.email && c.email && c.email.toLowerCase() === p.email.toLowerCase()
                        ).length;
                        const isSelf = p.id === user?.id;
                        return (
                          <tr key={p.id} className="hover:bg-lavender-50/30 transition-colors">
                            <td className="px-4 py-4 w-12">
                              <input
                                type="checkbox"
                                checked={selectedUserIds.has(p.id)}
                                onChange={() => setSelectedUserIds((s) => { const n = new Set(s); if (n.has(p.id)) n.delete(p.id); else n.add(p.id); return n; })}
                                disabled={isSelf}
                                className="rounded border-gray-300 text-lavender-600 focus:ring-lavender-500 disabled:opacity-50"
                                aria-label={isSelf ? 'Cannot select yourself' : `Select ${p.email ?? p.id}`}
                              />
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm font-medium text-gray-900">{p.email ?? '–'}</p>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700">{p.full_name ?? '–'}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{p.phone ?? '–'}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                                p.role === 'admin' ? 'bg-purple-100 text-purple-800' : p.role === 'therapist' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {p.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{bookingCount}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{consentCount}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {new Date(p.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => openEditUser(p)}
                                  className="p-2 text-lavender-600 hover:bg-lavender-50 rounded-xl transition-colors"
                                  title="Edit user"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => confirmDeleteUser(p)}
                                  disabled={isSelf || deletingUserId === p.id}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  title={isSelf ? 'Cannot delete yourself' : 'Delete user and all related data'}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {profiles.length === 0 && !profilesLoadError && (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-lavender-100 flex items-center justify-center">
                      <Users className="w-8 h-8 text-lavender-500" />
                    </div>
                    <p className="text-gray-600 font-medium">No users yet</p>
                    <p className="text-sm text-gray-500 mt-1">Users appear here after they sign up (Google or email)</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => !editSaving && setEditingUser(null)}>
          <div className="bg-white rounded-2xl border border-lavender-200 shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit user</h3>
            {editError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800">{editError}</div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editForm.full_name}
                  onChange={(e) => setEditForm((f) => ({ ...f, full_name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-lavender-500 focus:ring-0"
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-lavender-500 focus:ring-0"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-lavender-500 focus:ring-0"
                  placeholder="Phone"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-lavender-500 focus:ring-0"
                >
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                  <option value="therapist">therapist</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => !editSaving && setEditingUser(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveEditUser}
                disabled={editSaving}
                className="px-4 py-2 bg-lavender-600 text-white rounded-xl hover:bg-lavender-700 disabled:opacity-50"
              >
                {editSaving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Booking Modal */}
      {editingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => !savingEntity && setEditingBooking(null)}>
          <div className="bg-white rounded-2xl border border-lavender-200 shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit booking</h3>
            {entityError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800">{entityError}</div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer name</label>
                <input
                  type="text"
                  value={bookingForm.customer_name ?? ''}
                  onChange={(e) => setBookingForm((f) => ({ ...f, customer_name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-lavender-500 focus:ring-0"
                  placeholder="Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={bookingForm.customer_email ?? ''}
                  onChange={(e) => setBookingForm((f) => ({ ...f, customer_email: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-lavender-500 focus:ring-0"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={bookingForm.customer_phone ?? ''}
                  onChange={(e) => setBookingForm((f) => ({ ...f, customer_phone: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-lavender-500 focus:ring-0"
                  placeholder="Phone"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Session type</label>
                  <select
                    value={bookingForm.session_type ?? 'individual'}
                    onChange={(e) => setBookingForm((f) => ({ ...f, session_type: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-lavender-500 focus:ring-0"
                  >
                    <option value="individual">Individual</option>
                    <option value="couples">Couples</option>
                    <option value="family">Family</option>
                    <option value="free">Free Consultation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
                  <select
                    value={bookingForm.session_format ?? 'video'}
                    onChange={(e) => setBookingForm((f) => ({ ...f, session_format: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-lavender-500 focus:ring-0"
                  >
                    <option value="video">Video</option>
                    <option value="audio">Audio</option>
                    <option value="chat">Chat</option>
                    <option value="call">Call</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={bookingForm.scheduled_date ?? ''}
                    onChange={(e) => setBookingForm((f) => ({ ...f, scheduled_date: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-lavender-500 focus:ring-0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input
                    type="text"
                    value={bookingForm.scheduled_time ?? ''}
                    onChange={(e) => setBookingForm((f) => ({ ...f, scheduled_time: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-lavender-500 focus:ring-0"
                    placeholder="e.g. 10:00"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={bookingForm.status ?? 'pending'}
                  onChange={(e) => setBookingForm((f) => ({ ...f, status: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-lavender-500 focus:ring-0"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="no_show">No show</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={bookingForm.notes ?? ''}
                  onChange={(e) => setBookingForm((f) => ({ ...f, notes: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-lavender-500 focus:ring-0"
                  rows={2}
                  placeholder="Notes"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => !savingEntity && setEditingBooking(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl">Cancel</button>
              <button type="button" onClick={saveBookingEdit} disabled={savingEntity === 'booking'} className="px-4 py-2 bg-lavender-600 text-white rounded-xl hover:bg-lavender-700 disabled:opacity-50">{savingEntity === 'booking' ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Payment Modal */}
      {editingPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => !savingEntity && setEditingPayment(null)}>
          <div className="bg-white rounded-2xl border border-lavender-200 shadow-xl max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit payment</h3>
            {entityError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800">{entityError}</div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={paymentFormStatus}
                  onChange={(e) => setPaymentFormStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-lavender-500 focus:ring-0"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => !savingEntity && setEditingPayment(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl">Cancel</button>
              <button type="button" onClick={savePaymentEdit} disabled={savingEntity === 'payment'} className="px-4 py-2 bg-lavender-600 text-white rounded-xl hover:bg-lavender-700 disabled:opacity-50">{savingEntity === 'payment' ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Consent Modal */}
      {editingConsent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => !savingEntity && setEditingConsent(null)}>
          <div className="bg-white rounded-2xl border border-lavender-200 shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit consent record</h3>
            {entityError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800">{entityError}</div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={consentForm.email}
                  onChange={(e) => setConsentForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-lavender-500 focus:ring-0"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Session type</label>
                <select
                  value={consentForm.session_type}
                  onChange={(e) => setConsentForm((f) => ({ ...f, session_type: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-lavender-500 focus:ring-0"
                >
                  <option value="individual">Individual</option>
                  <option value="couples">Couples</option>
                  <option value="family">Family</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Consent version</label>
                <input
                  type="text"
                  value={consentForm.consent_version}
                  onChange={(e) => setConsentForm((f) => ({ ...f, consent_version: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-lavender-500 focus:ring-0"
                  placeholder="e.g. 1.0"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => !savingEntity && setEditingConsent(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl">Cancel</button>
              <button type="button" onClick={saveConsentEdit} disabled={savingEntity === 'consent'} className="px-4 py-2 bg-lavender-600 text-white rounded-xl hover:bg-lavender-700 disabled:opacity-50">{savingEntity === 'consent' ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Coupon create/edit modal */}
      {couponForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={closeCouponForm}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">{couponForm.id ? 'Edit coupon' : 'Add coupon'}</h3>
            </div>
            <div className="px-6 py-4 space-y-4">
              {couponFormError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800">{couponFormError}</div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Code</label>
                <input
                  type="text"
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })}
                  placeholder="e.g. WELCOME10"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-lavender-500 focus:border-lavender-500 uppercase text-gray-900 placeholder:text-gray-500"
                  disabled={!!couponForm.id}
                />
                {couponForm.id && <p className="text-xs text-gray-700 mt-1">Code cannot be changed after creation.</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Type</label>
                  <select
                    value={couponForm.discount_type}
                    onChange={(e) => setCouponForm({ ...couponForm, discount_type: e.target.value as 'percent' | 'fixed' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-lavender-500 text-gray-900"
                  >
                    <option value="percent">Percent</option>
                    <option value="fixed">Fixed (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">{couponForm.discount_type === 'percent' ? 'Percent (1–100)' : 'Amount (₹)'}</label>
                  <input
                    type="number"
                    min={1}
                    max={couponForm.discount_type === 'percent' ? 100 : undefined}
                    value={couponForm.discount_value}
                    onChange={(e) => setCouponForm({ ...couponForm, discount_value: Number(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-lavender-500 text-gray-900"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Min order (₹) – optional</label>
                <input
                  type="number"
                  min={0}
                  value={couponForm.min_amount_paise ? couponForm.min_amount_paise / 100 : ''}
                  onChange={(e) => setCouponForm({ ...couponForm, min_amount_paise: Math.max(0, Math.floor(Number(e.target.value) || 0) * 100) })}
                  placeholder="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-lavender-500 text-gray-900 placeholder:text-gray-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Valid from (optional)</label>
                  <input
                    type="datetime-local"
                    value={typeof couponForm.valid_from === 'string' ? couponForm.valid_from : ''}
                    onChange={(e) => setCouponForm({ ...couponForm, valid_from: e.target.value || '' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-lavender-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Valid until (optional)</label>
                  <input
                    type="datetime-local"
                    value={typeof couponForm.valid_until === 'string' ? couponForm.valid_until : ''}
                    onChange={(e) => setCouponForm({ ...couponForm, valid_until: e.target.value || '' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-lavender-500 text-gray-900"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Max uses (optional, leave empty for unlimited)</label>
                <input
                  type="number"
                  min={0}
                  value={couponForm.max_uses ?? ''}
                  onChange={(e) => setCouponForm({ ...couponForm, max_uses: e.target.value === '' ? null : Math.max(0, Math.floor(Number(e.target.value))) })}
                  placeholder="Unlimited"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-lavender-500 text-gray-900 placeholder:text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Description (optional)</label>
                <input
                  type="text"
                  value={couponForm.description ?? ''}
                  onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                  placeholder="e.g. Launch offer"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-lavender-500 text-gray-900 placeholder:text-gray-500"
                />
              </div>
              {couponForm.id && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="coupon-active"
                    checked={couponForm.is_active}
                    onChange={(e) => setCouponForm({ ...couponForm, is_active: e.target.checked })}
                    className="rounded border-gray-300 text-lavender-600 focus:ring-lavender-500"
                  />
                  <label htmlFor="coupon-active" className="text-sm text-gray-900 font-medium">Active</label>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button type="button" onClick={closeCouponForm} className="px-4 py-2 text-gray-800 hover:bg-gray-100 rounded-xl font-medium">Cancel</button>
              <button type="button" onClick={saveCoupon} disabled={couponSaving} className="px-4 py-2 bg-lavender-600 text-white rounded-xl hover:bg-lavender-700 disabled:opacity-50">
                {couponSaving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteError && (
        <div className="fixed bottom-4 left-4 right-4 z-50 flex justify-center">
          <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl shadow-lg text-red-800 max-w-md">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{deleteError}</span>
            <button type="button" onClick={() => setDeleteError(null)} className="text-red-600 hover:text-red-800 ml-2">Dismiss</button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default AdminPage;
