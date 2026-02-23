import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Calendar,
  CreditCard,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Clock,
  Loader2,
  AlertCircle,
  User,
  Phone,
  Video,
  Users,
  FileText,
  CalendarPlus,
  MessageSquare,
  Headphones,
  Shield,
  Lock,
} from 'lucide-react';
import { SessionRecommendation } from '../data/chatbotFlow';
import { useGeolocation, formatPrice } from '../hooks/useGeolocation';
import { useAuth } from '../contexts/AuthContext';
import { processPayment, isPaymentConfigured, isTestMode } from '../services/paymentService';
import { AVAILABILITY_CONFIG } from '../config/paymentConfig';
import { getPricing, isFormatEnabled, getDuration } from '../config/pricingConfig';
import { fetchCalComAvailability, createCalComBooking, isCalComConfigured, getCalComBookingLink } from '../services/calcomService';
import { storeConsent, linkPaymentToBooking } from '../services/apiService';
import ConsentModal from './ConsentModal';
import { ConsentRecord } from '../data/consentForm';

// Therapy types (Step 1)
interface TherapyType {
  id: string;
  title: string;
  description: string;
  icon: typeof User;
  isFree: boolean;
}

const therapyTypes: TherapyType[] = [
  {
    id: 'free',
    title: 'Free Consultation',
    description: 'A brief introductory call to understand your needs',
    icon: Phone,
    isFree: true,
  },
  {
    id: 'individual',
    title: 'Individual Therapy',
    description: 'One-on-one personalized therapy sessions',
    icon: User,
    isFree: false,
  },
  {
    id: 'couples',
    title: 'Couples Therapy',
    description: 'Joint sessions for relationship support',
    icon: Users,
    isFree: false,
  },
  {
    id: 'family',
    title: 'Family Counseling',
    description: 'Sessions for family dynamics and healing',
    icon: Users,
    isFree: false,
  },
];

// Session formats (Step 2) - Base templates, pricing comes from config
interface SessionFormat {
  id: string;
  title: string;
  description: string;
  duration: string;
  priceINR: number;
  priceUSD: number;
  icon: typeof Video;
  features: string[];
  enabled: boolean;
  isPopular?: boolean;
}

// Base format templates - prices are overridden by therapy-specific pricing
const baseSessionFormats = [
  {
    id: 'chat',
    title: 'Chat Session',
    description: 'Text-based therapy via secure chat',
    icon: MessageSquare,
    features: ['Text-based communication', 'Take your time to respond', 'Written record'],
  },
  {
    id: 'audio',
    title: 'Audio Call',
    description: 'Voice-only therapy session',
    icon: Headphones,
    features: ['Voice conversation', 'No video required', 'Comfortable & private'],
  },
  {
    id: 'video',
    title: 'Video Call',
    description: 'Face-to-face video therapy',
    icon: Video,
    features: ['Face-to-face interaction', 'Full engagement', 'Most effective'],
    isPopular: true,
  },
];

// Helper function to get session formats with therapy-specific pricing
const getSessionFormatsForTherapy = (therapyTypeId: string): SessionFormat[] => {
  return baseSessionFormats.map(format => {
    const pricing = getPricing(therapyTypeId, format.id);
    const enabled = isFormatEnabled(therapyTypeId, format.id);
    const duration = getDuration(therapyTypeId, format.id);
    
    return {
      ...format,
      duration,
      priceINR: pricing?.priceINR || 0,
      priceUSD: pricing?.priceUSD || 0,
      enabled,
      isPopular: format.isPopular,
    };
  });
};

// Free consultation format (fixed) - uses 'video' to match Cal.com event type
const freeConsultationFormat: SessionFormat = {
  id: 'video',
  title: 'Introductory Call',
  description: 'Brief phone/video consultation',
  duration: '15-20 min',
  priceINR: 0,
  priceUSD: 0,
  icon: Phone,
  features: ['Brief introductory call', 'Understand your needs', 'No commitment required'],
  enabled: true,
};

// Combined session type for booking
interface SessionType {
  id: string;
  therapyType: TherapyType;
  format: SessionFormat;
  title: string;
  description: string;
  duration: string;
  priceINR: number;
  priceUSD: number;
  icon: typeof Phone;
  isFree: boolean;
  features: string[];
}

interface BookingFlowProps {
  session?: SessionRecommendation;
  isOpen: boolean;
  onClose: () => void;
}

type BookingStep = 'therapy' | 'format' | 'datetime' | 'consent' | 'details' | 'payment' | 'confirmation';

interface TimeSlot {
  time: string;
  available: boolean;
  booked?: boolean;
}

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  notes: string;
}

const BookingFlow = ({ session, isOpen, onClose }: BookingFlowProps) => {
  const { isIndia } = useGeolocation();
  const { user } = useAuth();
  
  // Flow state
  const [currentStep, setCurrentStep] = useState<BookingStep>('therapy');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Therapy type selection (Step 1)
  const [selectedTherapyType, setSelectedTherapyType] = useState<TherapyType | null>(null);
  
  // Session format selection (Step 2)
  const [selectedFormat, setSelectedFormat] = useState<SessionFormat | null>(null);
  
  // Combined session type for booking
  const [selectedSessionType, setSelectedSessionType] = useState<SessionType | null>(
    session ? {
      id: session.id,
      therapyType: therapyTypes.find(t => t.id === 'individual') || therapyTypes[1],
      format: getSessionFormatsForTherapy('individual').find(f => f.id === 'video') || {
        id: 'video',
        title: 'Video Call',
        description: 'Face-to-face video therapy',
        duration: session.duration,
        priceINR: session.priceINR,
        priceUSD: session.priceUSD,
        icon: Video,
        features: session.features,
        enabled: true,
      },
      title: session.title,
      description: session.description,
      duration: session.duration,
      priceINR: session.priceINR,
      priceUSD: session.priceUSD,
      icon: Video,
      isFree: session.priceINR === 0,
      features: session.features,
    } : null
  );
  
  // Booking data
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [consentRecord, setConsentRecord] = useState<ConsentRecord | null>(null);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    email: '',
    phone: '',
    notes: '',
  });
  const [paymentResult, setPaymentResult] = useState<{
    success: boolean;
    paymentId?: string;
    bookingId?: string;
  } | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Generate next 14 days for date selection, filtering out weekends
  const availableDates = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i + 1);
    return date;
  }).filter(date => AVAILABILITY_CONFIG.isDateAvailable(date)).slice(0, 7);

  // Define steps based on whether session is free
  const getSteps = () => {
    // For free consultation, skip format step (it's always a call)
    if (selectedTherapyType?.isFree) {
      return [
        { id: 'therapy', label: 'Therapy Type', number: 1 },
        { id: 'datetime', label: 'Date & Time', number: 2 },
        { id: 'consent', label: 'Consent', number: 3 },
        { id: 'details', label: 'Details', number: 4 },
        { id: 'confirmation', label: 'Confirmed', number: 5 },
      ];
    }
    
    // For paid sessions, include format selection
    return [
      { id: 'therapy', label: 'Therapy Type', number: 1 },
      { id: 'format', label: 'Format', number: 2 },
      { id: 'datetime', label: 'Date & Time', number: 3 },
      { id: 'consent', label: 'Consent', number: 4 },
      { id: 'details', label: 'Details', number: 5 },
      { id: 'payment', label: 'Payment', number: 6 },
      { id: 'confirmation', label: 'Confirmed', number: 7 },
    ];
  };

  const steps = getSteps();
  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      if (session) {
        // If session is pre-selected, try to map to therapy type
        const matchedTherapy = therapyTypes.find(t => session.id.includes(t.id)) || therapyTypes[1];
        const therapyFormats = getSessionFormatsForTherapy(matchedTherapy.id);
        const matchedFormat = therapyFormats.find(f => session.id.includes(f.id) && f.enabled) || 
                              therapyFormats.find(f => f.enabled) ||
                              therapyFormats[0];
        
        setSelectedTherapyType(matchedTherapy);
        setSelectedFormat(matchedFormat);
        setSelectedSessionType({
          id: `${matchedTherapy.id}-${matchedFormat.id}`,
          therapyType: matchedTherapy,
          format: matchedFormat,
          title: `${matchedTherapy.title} - ${matchedFormat.title}`,
          description: session.description,
          duration: matchedFormat.duration,
          priceINR: matchedFormat.priceINR,
          priceUSD: matchedFormat.priceUSD,
          icon: matchedFormat.icon,
          isFree: matchedTherapy.isFree,
          features: matchedFormat.features,
        });
        setCurrentStep('datetime');
      } else {
        setCurrentStep('therapy');
        setSelectedTherapyType(null);
        setSelectedFormat(null);
        setSelectedSessionType(null);
      }
      setSelectedDate(null);
      setSelectedSlot(null);
      setConsentRecord(null);
      setConsentAccepted(false);
      setPaymentResult(null);
      setError(null);
      setCustomerInfo({ name: '', email: '', phone: '', notes: '' });
      setFormErrors({});
    }
  }, [isOpen, session]);

  // Load available slots when date is selected
  useEffect(() => {
    if (selectedDate) {
      loadAvailableSlots();
    }
  }, [selectedDate]);

  // Get booked slots from sessionStorage (for local fallback)
  const getLocalBookedSlots = (date: Date): string[] => {
    try {
      const existingBookings = JSON.parse(sessionStorage.getItem('mq_bookingRefs') || '[]');
      const dateString = date.toDateString();
      
      return existingBookings
        .filter((booking: { date?: string }) => {
          if (!booking.date) return false;
          return new Date(booking.date).toDateString() === dateString;
        })
        .map((booking: { time?: string }) => booking.time)
        .filter(Boolean);
    } catch {
      return [];
    }
  };

  const loadAvailableSlots = async () => {
    if (!selectedDate || !selectedTherapyType) return;
    
    setIsProcessing(true);
    setError(null);

    const sessionId = selectedTherapyType.isFree ? 'free' : (selectedFormat?.id || 'video');

    try {
      // Check if Cal.com is configured
      if (isCalComConfigured()) {
        // Fetch real availability from Cal.com
        const calSlots = await fetchCalComAvailability(selectedDate, sessionId);
        
        // Also check local bookings as backup
        const localBookedSlots = getLocalBookedSlots(selectedDate);
        
        const slotsWithAvailability = calSlots.map(slot => ({
          ...slot,
          available: slot.available && !localBookedSlots.includes(slot.time),
          booked: localBookedSlots.includes(slot.time),
        }));
        
        setAvailableSlots(slotsWithAvailability);
      } else if (AVAILABILITY_CONFIG.USE_MOCK_AVAILABILITY) {
        // Use mock slots when Cal.com is not configured
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        const localBookedSlots = getLocalBookedSlots(selectedDate);
        
        const slotsWithAvailability = AVAILABILITY_CONFIG.MOCK_SLOTS.map(slot => ({
          ...slot,
          available: slot.available && !localBookedSlots.includes(slot.time),
          booked: localBookedSlots.includes(slot.time),
        }));
        
        setAvailableSlots(slotsWithAvailability);
      } else {
        // Fallback to mock slots
        const localBookedSlots = getLocalBookedSlots(selectedDate);
        const slotsWithAvailability = AVAILABILITY_CONFIG.MOCK_SLOTS.map(slot => ({
          ...slot,
          available: slot.available && !localBookedSlots.includes(slot.time),
          booked: localBookedSlots.includes(slot.time),
        }));
        setAvailableSlots(slotsWithAvailability);
      }
    } catch {
      setError('Failed to load available slots. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const validateCustomerInfo = (): boolean => {
    const errors: Record<string, string> = {};

    if (!customerInfo.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!customerInfo.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email)) {
      errors.email = 'Please enter a valid email';
    }

    if (!customerInfo.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^[+]?[\d\s-]{10,}$/.test(customerInfo.phone.replace(/\D/g, ''))) {
      errors.phone = 'Please enter a valid phone number';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle therapy type selection (Step 1)
  const handleTherapyTypeSelect = (therapy: TherapyType) => {
    setSelectedTherapyType(therapy);
    
    if (therapy.isFree) {
      // For free consultation, auto-select the free format
      setSelectedFormat(freeConsultationFormat);
      setSelectedSessionType({
        id: `${therapy.id}-video`,
        therapyType: therapy,
        format: freeConsultationFormat,
        title: therapy.title,
        description: therapy.description,
        duration: freeConsultationFormat.duration,
        priceINR: 0,
        priceUSD: 0,
        icon: freeConsultationFormat.icon,
        isFree: true,
        features: freeConsultationFormat.features,
      });
    } else {
      // Reset format for paid sessions
      setSelectedFormat(null);
      setSelectedSessionType(null);
    }
  };

  // Handle format selection (Step 2)
  const handleFormatSelect = (format: SessionFormat) => {
    if (!selectedTherapyType) return;
    if (!format.enabled) return; // Don't allow selection of disabled formats
    
    setSelectedFormat(format);
    setSelectedSessionType({
      id: `${selectedTherapyType.id}-${format.id}`,
      therapyType: selectedTherapyType,
      format: format,
      title: `${selectedTherapyType.title} - ${format.title}`,
      description: `${selectedTherapyType.description} via ${format.title.toLowerCase()}`,
      duration: format.duration,
      priceINR: format.priceINR,
      priceUSD: format.priceUSD,
      icon: format.icon,
      isFree: false,
      features: format.features,
    });
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot: string) => {
    setSelectedSlot(slot);
    setError(null);
  };

  const handleConsentAccept = (record: ConsentRecord) => {
    setConsentRecord(record);
    setConsentAccepted(true);
    setShowConsentModal(false);
  };

  const handleProceedFromDetails = async () => {
    if (!validateCustomerInfo()) return;

    setError(null); // Clear any previous errors
    
    if (selectedSessionType?.isFree) {
      // Skip payment for free sessions
      await completeBooking();
    } else {
      setCurrentStep('payment');
    }
  };

  const handlePayment = async () => {
    if (!validateCustomerInfo()) return;
    if (!consentRecord) {
      setError('Consent is required to proceed');
      return;
    }
    if (!selectedSessionType) return;

    setIsProcessing(true);
    setError(null);

    try {
      const sessionForPayment: SessionRecommendation = {
        id: selectedSessionType.id,
        title: selectedSessionType.title,
        duration: selectedSessionType.duration,
        priceINR: selectedSessionType.priceINR,
        priceUSD: selectedSessionType.priceUSD,
        description: selectedSessionType.description,
        features: selectedSessionType.features,
      };

      const result = await processPayment(sessionForPayment, isIndia, customerInfo);

      if (result.success) {
        await completeBooking(result.paymentId, result.orderId);
      } else {
        setError(result.error || 'Payment failed. Please try again.');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const completeBooking = async (paymentId?: string, orderId?: string) => {
    if (!selectedDate || !selectedSlot || !selectedSessionType) {
      setError('Missing booking information. Please try again.');
      return;
    }
    if (!consentRecord) {
      setError('Consent is required to complete the booking.');
      return;
    }

    setIsProcessing(true);

    try {
      // Store consent in database (for compliance) before creating the booking
      const sessionTypeForApi = selectedSessionType.id.split('-')[0] || 'individual';
      const consentResult = await storeConsent({
        sessionType: sessionTypeForApi === 'free' ? 'individual' : sessionTypeForApi,
        email: customerInfo.email,
        consentVersion: consentRecord.consentVersion,
        acknowledgments: consentRecord.acknowledgments,
      });
      if (!consentResult.success) {
        setError(consentResult.error || 'Failed to record consent. Please try again.');
        setIsProcessing(false);
        return;
      }

      // Create booking on Cal.com and persist to Supabase (for Admin + My Bookings)
      const bookingResult = await createCalComBooking(
        selectedSessionType.id,
        selectedDate,
        selectedSlot,
        {
          name: customerInfo.name,
          email: customerInfo.email,
          phone: customerInfo.phone,
          notes: customerInfo.notes,
        },
        { userId: user?.id ?? undefined }
      );
      
      if (!bookingResult.success) {
        throw new Error(bookingResult.error || 'Booking failed');
      }
      
      const bookingId = bookingResult.bookingId || `BK${Date.now().toString(36).toUpperCase()}`;

      // Link payment to booking so refunds can be processed by booking_id (e.g. on cancel)
      if (orderId && !selectedSessionType.isFree) {
        try {
          await linkPaymentToBooking(bookingId, orderId);
        } catch {
          // Non-blocking: booking is created; refund-by-booking may not work for this one
        }
      }
      
      setPaymentResult({
        success: true,
        paymentId: paymentId || 'FREE',
        bookingId,
      });

      // Store minimal booking reference in sessionStorage (not full PII)
      // Full booking data is stored on Cal.com backend or sent to server
      const bookingReference = {
        bookingId,
        session: selectedSessionType.id,
        sessionTitle: selectedSessionType.title,
        isFree: selectedSessionType.isFree,
        date: selectedDate.toISOString(),
        time: selectedSlot,
        firstName: customerInfo.name.split(' ')[0], // Only first name for display
        calComBooked: isCalComConfigured(),
        timestamp: new Date().toISOString(),
      };
      
      try {
        const existingBookings = JSON.parse(sessionStorage.getItem('mq_bookingRefs') || '[]');
        existingBookings.push(bookingReference);
        sessionStorage.setItem('mq_bookingRefs', JSON.stringify(existingBookings));
      } catch {
        // Storage failed - continue without local storage
      }

      setCurrentStep('confirmation');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete booking. Please try again.';
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const goToNextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setError(null); // Clear any previous errors when moving forward
      setCurrentStep(steps[nextIndex].id as BookingStep);
    }
  };

  const goToPrevStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setError(null); // Clear any previous errors when going back
      setCurrentStep(steps[prevIndex].id as BookingStep);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'therapy':
        return !!selectedTherapyType;
      case 'format':
        return !!selectedFormat;
      case 'datetime':
        return !!selectedDate && !!selectedSlot;
      case 'consent':
        return consentAccepted;
      case 'details':
        return customerInfo.name && customerInfo.email && customerInfo.phone;
      default:
        return true;
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-5xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
              role="dialog"
              aria-modal="true"
              aria-labelledby="booking-dialog-title"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-lavender-500 to-lavender-600 text-white p-4 flex-shrink-0">
                <h2 id="booking-dialog-title" className="sr-only">Book Your Therapy Session</h2>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm text-white/80">
                      <span className="flex items-center gap-1">
                        <Shield className="w-3.5 h-3.5" /> 100% Confidential
                      </span>
                      <span className="flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5" /> Secure
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Test Mode Indicator */}
                    {isTestMode() && (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-400/20 border border-amber-300/50 rounded-full text-amber-100 text-xs font-medium">
                        <span>🧪</span>
                        <span>Test Mode - Payments are simulated</span>
                      </div>
                    )}
                    <button
                      onClick={onClose}
                      className="p-2 hover:bg-white/20 rounded-full transition-colors"
                      aria-label="Close booking dialog"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Enhanced Progress Steps */}
                <div className="flex items-center justify-between gap-1 px-2">
                  {steps.map((step, index) => {
                    const isActive = step.id === currentStep;
                    const isCompleted = index < currentStepIndex;
                    
                    return (
                      <div key={step.id} className="flex-1 flex items-center">
                        <div className="flex flex-col items-center flex-1">
                          <motion.div
                            initial={false}
                            animate={{
                              scale: isActive ? 1.1 : 1,
                              backgroundColor: isCompleted 
                                ? 'rgba(255, 255, 255, 1)' 
                                : isActive 
                                ? 'rgba(255, 255, 255, 0.3)' 
                                : 'rgba(255, 255, 255, 0.1)',
                            }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                              isCompleted
                                ? 'text-lavender-600'
                                : isActive
                                ? 'text-white border-2 border-white shadow-lg'
                                : 'text-white/50'
                            }`}
                          >
                            {isCompleted ? (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                              >
                                <CheckCircle className="w-5 h-5" />
                              </motion.div>
                            ) : (
                              step.number
                            )}
                          </motion.div>
                          <motion.span 
                            initial={false}
                            animate={{ 
                              opacity: isActive ? 1 : 0.6,
                              fontWeight: isActive ? 600 : 400,
                            }}
                            className={`text-xs mt-1.5 hidden sm:block text-white whitespace-nowrap`}
                          >
                            {step.label}
                          </motion.span>
                        </div>
                        {index < steps.length - 1 && (
                          <div className="flex-shrink-0 w-4 sm:w-8 h-0.5 bg-white/20 relative overflow-hidden">
                            <motion.div
                              initial={false}
                              animate={{ width: isCompleted ? '100%' : '0%' }}
                              transition={{ duration: 0.4, ease: 'easeOut' }}
                              className="absolute inset-y-0 left-0 bg-white"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

              </div>

              {/* Main Content - Two Column Layout */}
              <div className="flex-1 overflow-hidden flex">
                {/* Left Side - Fee Structure Image */}
                <div className="hidden md:flex w-80 bg-gradient-to-br from-lavender-50 to-purple-50 border-r border-lavender-100 flex-col p-6 overflow-y-auto">
                  <div className="sticky top-0">
                    <h3 className="font-display text-lg font-semibold text-gray-800 mb-4">Session Fee Structure</h3>
                    
                    {/* Fee Structure Table */}
                    <div className="bg-white rounded-xl border border-lavender-100 overflow-hidden shadow-sm">
                      <div className="bg-lavender-500 text-white px-4 py-2">
                        <div className="grid grid-cols-3 gap-2 text-xs font-medium">
                          <span>Service</span>
                          <span className="text-center">Duration</span>
                          <span className="text-right">Fee (INR)</span>
                        </div>
                      </div>
                      <div className="divide-y divide-lavender-50">
                        <div className="grid grid-cols-3 gap-2 px-4 py-3 text-sm">
                          <span className="text-gray-700 flex items-center gap-1.5">
                            <MessageSquare className="w-3.5 h-3.5 text-lavender-500" />
                            Chat
                          </span>
                          <span className="text-center text-gray-500">30 min</span>
                          <span className="text-right font-semibold text-gray-800">₹499</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 px-4 py-3 text-sm">
                          <span className="text-gray-700 flex items-center gap-1.5">
                            <Headphones className="w-3.5 h-3.5 text-lavender-500" />
                            Audio
                          </span>
                          <span className="text-center text-gray-500">45 min</span>
                          <span className="text-right font-semibold text-gray-800">₹899</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 px-4 py-3 text-sm">
                          <span className="text-gray-700 flex items-center gap-1.5">
                            <Video className="w-3.5 h-3.5 text-lavender-500" />
                            Video
                          </span>
                          <span className="text-center text-gray-500">60 min</span>
                          <span className="text-right font-semibold text-gray-800">₹1,299</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 px-4 py-3 text-sm bg-lavender-50">
                          <span className="text-gray-700 flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-lavender-500" />
                            Couples
                          </span>
                          <span className="text-center text-gray-500">90 min</span>
                          <span className="text-right font-semibold text-lavender-600">₹1,999</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Note */}
                    <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-100">
                      <p className="text-xs text-amber-700 leading-relaxed">
                        <span className="font-medium">Note:</span> Chat consultation is not an ideal form of therapy – it is only recommended for discussing minor concerns or if hesitant about audio or video consultation.
                      </p>
                    </div>
                    
                    {/* Trust Badges */}
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Shield className="w-4 h-4 text-green-500" />
                        <span>100% Confidential</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Lock className="w-4 h-4 text-blue-500" />
                        <span>Secure & Encrypted</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <CheckCircle className="w-4 h-4 text-lavender-500" />
                        <span>Personalized Sessions</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side - Booking Process */}
                <div className="flex-1 overflow-y-auto p-5">
                  <AnimatePresence mode="wait">
                    {/* Step 1: Select Therapy Type */}
                  {currentStep === 'therapy' && (
                    <motion.div
                      key="therapy"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-full bg-lavender-100 flex items-center justify-center text-lavender-600 font-semibold text-sm">1</div>
                        <h4 className="font-semibold text-gray-800 text-lg">Select Therapy Type</h4>
                      </div>

                      {/* Trust Signal Banner */}
                      <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <Shield className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-green-800">Your Privacy is Protected</p>
                          <p className="text-xs text-green-600">All sessions are 100% confidential and HIPAA-compliant</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {therapyTypes.map((therapy) => {
                          const Icon = therapy.icon;
                          const isSelected = selectedTherapyType?.id === therapy.id;
                          
                          return (
                            <motion.button
                              key={therapy.id}
                              onClick={() => handleTherapyTypeSelect(therapy)}
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                              className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-4 ${
                                isSelected
                                  ? 'border-lavender-500 bg-lavender-50'
                                  : 'border-gray-200 hover:border-lavender-300 bg-white'
                              }`}
                            >
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                isSelected ? 'bg-lavender-500 text-white' : 'bg-lavender-100 text-lavender-600'
                              }`}>
                                <Icon className="w-6 h-6" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h5 className="font-semibold text-gray-800">{therapy.title}</h5>
                                  {therapy.isFree && (
                                    <span className="text-green-600 font-bold text-sm">Free</span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-500">{therapy.description}</p>
                              </div>
                              <ChevronRight className={`w-5 h-5 ${isSelected ? 'text-lavender-500' : 'text-gray-300'}`} />
                            </motion.button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Select Session Format */}
                  {currentStep === 'format' && (
                    <motion.div
                      key="format"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-full bg-lavender-100 flex items-center justify-center text-lavender-600 font-semibold text-sm">2</div>
                        <h4 className="font-semibold text-gray-800 text-lg">Choose Session Format</h4>
                      </div>

                      {/* Selected therapy reminder */}
                      {selectedTherapyType && (
                        <div className="mb-4 p-3 bg-lavender-50 rounded-lg border border-lavender-100">
                          <p className="text-sm text-lavender-700">
                            <span className="font-medium">{selectedTherapyType.title}</span> - Choose how you'd like to connect
                          </p>
                        </div>
                      )}

                      <div className="space-y-3">
                        {selectedTherapyType && getSessionFormatsForTherapy(selectedTherapyType.id).map((format) => {
                          const Icon = format.icon;
                          const isSelected = selectedFormat?.id === format.id;
                          const isDisabled = !format.enabled;
                          
                          return (
                            <motion.button
                              key={format.id}
                              onClick={() => handleFormatSelect(format)}
                              whileHover={isDisabled ? {} : { scale: 1.01 }}
                              whileTap={isDisabled ? {} : { scale: 0.99 }}
                              disabled={isDisabled}
                              className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-4 relative ${
                                isDisabled
                                  ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                                  : isSelected
                                  ? 'border-lavender-500 bg-lavender-50'
                                  : 'border-gray-200 hover:border-lavender-300 bg-white'
                              }`}
                            >
                              {/* Most Popular Badge */}
                              {format.isPopular && format.enabled && (
                                <div className="absolute -top-2 right-4 bg-gradient-to-r from-lavender-500 to-purple-500 text-white text-xs font-medium px-3 py-0.5 rounded-full shadow-sm">
                                  Most Popular
                                </div>
                              )}
                              
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                isDisabled
                                  ? 'bg-gray-200 text-gray-400'
                                  : isSelected 
                                  ? 'bg-lavender-500 text-white' 
                                  : 'bg-lavender-100 text-lavender-600'
                              }`}>
                                <Icon className="w-6 h-6" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h5 className={`font-semibold ${isDisabled ? 'text-gray-400' : 'text-gray-800'}`}>
                                    {format.title}
                                  </h5>
                                  {isDisabled ? (
                                    <span className="text-gray-400 text-sm">Not available</span>
                                  ) : (
                                    <span className="text-lavender-600 font-bold">
                                      {formatPrice(format.priceINR, format.priceUSD, isIndia)}
                                    </span>
                                  )}
                                </div>
                                {isDisabled ? (
                                  <p className="text-sm text-gray-400">
                                    Not available for {selectedTherapyType?.title.toLowerCase()}
                                  </p>
                                ) : (
                                  <>
                                    <p className="text-sm text-gray-500">{format.description}</p>
                                    <p className="text-xs text-gray-400 mt-1">{format.duration}</p>
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {format.features.map((feature, idx) => (
                                        <span key={idx} className="text-xs bg-lavender-100 text-lavender-600 px-2 py-0.5 rounded-full">
                                          {feature}
                                        </span>
                                      ))}
                                    </div>
                                  </>
                                )}
                              </div>
                              {!isDisabled && (
                                <ChevronRight className={`w-5 h-5 ${isSelected ? 'text-lavender-500' : 'text-gray-300'}`} />
                              )}
                            </motion.button>
                          );
                        })}
                      </div>

                      {/* Chat Session Note */}
                      {selectedTherapyType && !selectedTherapyType.isFree && isFormatEnabled(selectedTherapyType.id, 'chat') && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                          <p className="text-xs text-gray-500 leading-relaxed">
                            <span className="font-medium text-gray-600">Note:</span> Chat consultation is not an ideal form of therapy – it is only recommended for discussing minor concerns or if hesitant about audio or video consultation.
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Step 3: Select Date & Time */}
                  {currentStep === 'datetime' && (
                    <motion.div
                      key="datetime"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-full bg-lavender-100 flex items-center justify-center text-lavender-600 font-semibold text-sm">
                          {currentStepIndex + 1}
                        </div>
                        <h4 className="font-semibold text-gray-800 text-lg">Select Date & Time</h4>
                      </div>

                      {/* Cal.com Integration Status */}
                      <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-lavender-50 to-purple-50 border border-lavender-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-2.5 h-2.5 rounded-full ${isCalComConfigured() ? 'bg-green-500' : 'bg-amber-500'}`} />
                            <span className="text-sm text-gray-600">
                              {isCalComConfigured() 
                                ? 'Live availability synced' 
                                : 'Using local availability (connect Cal.com for multi-device sync)'}
                            </span>
                          </div>
                          {selectedSessionType && (
                            <a
                              href={getCalComBookingLink(selectedSessionType.id)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-lavender-600 hover:text-lavender-700 underline flex items-center gap-1"
                            >
                              <Calendar className="w-3 h-3" />
                              Open Cal.com
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Date Selection */}
                      <div className="mb-6">
                        <p className="text-sm text-gray-600 mb-3">Choose a date:</p>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {availableDates.map((date) => {
                            const isSelected = selectedDate?.toDateString() === date.toDateString();
                            return (
                              <button
                                key={date.toISOString()}
                                onClick={() => handleDateSelect(date)}
                                className={`group flex-shrink-0 px-4 py-3 rounded-xl border-2 transition-all min-w-[80px] ${
                                  isSelected
                                    ? 'bg-gradient-to-br from-lavender-500 to-purple-600 text-white border-lavender-500 shadow-lg shadow-lavender-500/30'
                                    : 'bg-white border-lavender-200 hover:bg-gradient-to-br hover:from-lavender-500 hover:to-purple-600 hover:border-lavender-500 hover:shadow-lg'
                                }`}
                              >
                                <span className={`block text-xs font-medium transition-colors ${
                                  isSelected
                                    ? 'text-white/90'
                                    : 'text-lavender-600 group-hover:text-white/90'
                                }`}>
                                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                                </span>
                                <span className={`block text-xs transition-colors ${
                                  isSelected
                                    ? 'text-white/80'
                                    : 'text-purple-500 group-hover:text-white/80'
                                }`}>
                                  {date.toLocaleDateString('en-US', { month: 'short' })}
                                </span>
                                <span className={`block text-lg font-bold transition-colors ${
                                  isSelected
                                    ? 'text-white'
                                    : 'text-purple-700 group-hover:text-white'
                                }`}>
                                  {date.getDate()}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Time Slots */}
                      {selectedDate && (
                        <div>
                          <p className="text-sm text-gray-600 mb-3">
                            Available times for {formatDate(selectedDate)}:
                          </p>
                          
                          {isProcessing ? (
                            <div className="flex items-center justify-center py-8">
                              <Loader2 className="w-6 h-6 text-lavender-500 animate-spin" />
                              <span className="ml-2 text-gray-600">Loading slots...</span>
                            </div>
                          ) : (
                            <div className="grid grid-cols-3 gap-2">
                              {availableSlots.map((slot) => (
                                <button
                                  key={slot.time}
                                  onClick={() => slot.available && handleSlotSelect(slot.time)}
                                  disabled={!slot.available}
                                  className={`px-3 py-3 rounded-xl border-2 text-sm font-medium transition-all flex flex-col items-center justify-center gap-1 ${
                                    selectedSlot === slot.time
                                      ? 'bg-lavender-500 text-white border-lavender-500'
                                      : slot.available
                                      ? 'bg-white border-gray-200 hover:border-lavender-300 text-gray-700'
                                      : slot.booked
                                      ? 'bg-red-50 border-red-200 text-red-400 cursor-not-allowed'
                                      : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    <span>{slot.time}</span>
                                  </div>
                                  {slot.booked ? (
                                    <span className="text-xs text-red-500 font-medium">Booked</span>
                                  ) : selectedSessionType?.isFree && slot.available ? (
                                    <span className="text-xs text-green-600 font-medium">Free</span>
                                  ) : null}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Step 3: Consent Form */}
                  {currentStep === 'consent' && (
                    <motion.div
                      key="consent"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-full bg-lavender-100 flex items-center justify-center text-lavender-600 font-semibold text-sm">
                          {currentStepIndex + 1}
                        </div>
                        <h4 className="font-semibold text-gray-800 text-lg">Consent & Agreement</h4>
                      </div>

                      {/* Compliance Notice */}
                      <div className="mb-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-amber-800">Required for All Sessions</p>
                          <p className="text-xs text-amber-600">Please review and accept to continue</p>
                        </div>
                      </div>

                      {/* Single Comprehensive Consent Checkbox */}
                      <label 
                        className={`flex items-start gap-4 p-5 rounded-xl cursor-pointer transition-all border-2 ${
                          consentAccepted 
                            ? 'bg-green-50 border-green-300' 
                            : 'bg-white border-gray-200 hover:border-lavender-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={consentAccepted}
                          onChange={(e) => {
                            setConsentAccepted(e.target.checked);
                            if (e.target.checked) {
                              // Create consent record immediately
                              const record: ConsentRecord = {
                                timestamp: new Date().toISOString(),
                                consentVersion: '1.0',
                                sessionType: selectedSessionType?.title || 'Therapy Session',
                                email: customerInfo.email || 'pending',
                                signature: customerInfo.name || 'Client',
                                ipAddress: 'recorded',
                                acknowledgments: [
                                  'read_understood',
                                  'questions_answered', 
                                  'consent_services',
                                  'confidentiality_understood',
                                  'payment_policies',
                                  'voluntary_consent'
                                ],
                              };
                              setConsentRecord(record);
                            } else {
                              setConsentRecord(null);
                            }
                          }}
                          className="w-6 h-6 rounded border-gray-300 text-green-600 focus:ring-green-500 mt-0.5 flex-shrink-0"
                        />
                        <div className="flex-1">
                          <p className={`text-sm leading-relaxed ${consentAccepted ? 'text-green-800' : 'text-gray-700'}`}>
                            I confirm that I have read and understood the information provided and voluntarily consent to receive psychological services, acknowledging the{' '}
                            <button 
                              onClick={(e) => { e.preventDefault(); setShowConsentModal(true); }}
                              className="text-lavender-600 underline hover:text-lavender-700 font-medium"
                            >
                              confidentiality, payment, and cancellation policies
                            </button>.
                          </p>
                          
                          {consentAccepted && (
                            <motion.div 
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex items-center gap-2 mt-3 text-sm text-green-600"
                            >
                              <CheckCircle className="w-5 h-5" />
                              <span className="font-medium">Consent accepted</span>
                            </motion.div>
                          )}
                        </div>
                      </label>

                      {/* Quick Summary of What You're Agreeing To */}
                      <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <p className="text-xs font-medium text-gray-600 mb-2">By accepting, you acknowledge:</p>
                        <ul className="text-xs text-gray-500 space-y-1">
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-lavender-400" />
                            Understanding of psychological services provided
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-lavender-400" />
                            Confidentiality policies and their limitations
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-lavender-400" />
                            Payment and cancellation terms
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-lavender-400" />
                            Voluntary participation in services
                          </li>
                        </ul>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 4: Enter Your Details */}
                  {currentStep === 'details' && (
                    <motion.div
                      key="details"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-full bg-lavender-100 flex items-center justify-center text-lavender-600 font-semibold text-sm">
                          {currentStepIndex + 1}
                        </div>
                        <h4 className="font-semibold text-gray-800 text-lg">Enter Your Details</h4>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label htmlFor="booking-name" className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name *
                          </label>
                          <input
                            id="booking-name"
                            type="text"
                            value={customerInfo.name}
                            onChange={(e) =>
                              setCustomerInfo((prev) => ({ ...prev, name: e.target.value }))
                            }
                            className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-lavender-300 focus:border-lavender-400 transition-colors bg-white text-gray-900 placeholder-gray-400 ${
                              formErrors.name ? 'border-red-300' : 'border-gray-200'
                            }`}
                            placeholder="Jane Doe"
                            aria-invalid={formErrors.name ? 'true' : 'false'}
                            aria-describedby={formErrors.name ? 'name-error' : undefined}
                          />
                          {formErrors.name && (
                            <p id="name-error" className="mt-1 text-xs text-red-500" role="alert">{formErrors.name}</p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="booking-email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address *
                          </label>
                          <input
                            id="booking-email"
                            type="email"
                            value={customerInfo.email}
                            onChange={(e) =>
                              setCustomerInfo((prev) => ({ ...prev, email: e.target.value }))
                            }
                            className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-lavender-300 focus:border-lavender-400 transition-colors bg-white text-gray-900 placeholder-gray-400 ${
                              formErrors.email ? 'border-red-300' : 'border-gray-200'
                            }`}
                            placeholder="jane.doe@example.com"
                            aria-invalid={formErrors.email ? 'true' : 'false'}
                            aria-describedby={formErrors.email ? 'email-error' : undefined}
                          />
                          {formErrors.email && (
                            <p id="email-error" className="mt-1 text-xs text-red-500" role="alert">{formErrors.email}</p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="booking-phone" className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number *
                          </label>
                          <input
                            id="booking-phone"
                            type="tel"
                            value={customerInfo.phone}
                            onChange={(e) =>
                              setCustomerInfo((prev) => ({ ...prev, phone: e.target.value }))
                            }
                            className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-lavender-300 focus:border-lavender-400 transition-colors bg-white text-gray-900 placeholder-gray-400 ${
                              formErrors.phone ? 'border-red-300' : 'border-gray-200'
                            }`}
                            placeholder="+91 9876543210"
                            aria-invalid={formErrors.phone ? 'true' : 'false'}
                            aria-describedby={formErrors.phone ? 'phone-error' : undefined}
                          />
                          {formErrors.phone && (
                            <p id="phone-error" className="mt-1 text-xs text-red-500" role="alert">{formErrors.phone}</p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="booking-notes" className="block text-sm font-medium text-gray-700 mb-1">
                            Optional Notes
                          </label>
                          <textarea
                            id="booking-notes"
                            value={customerInfo.notes}
                            onChange={(e) =>
                              setCustomerInfo((prev) => ({ ...prev, notes: e.target.value }))
                            }
                            rows={3}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-lavender-300 focus:border-lavender-400 transition-colors resize-none bg-white text-gray-900 placeholder-gray-400"
                            placeholder="Any specific concerns or topics you'd like to discuss..."
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 5: Payment (only for paid sessions) */}
                  {currentStep === 'payment' && selectedSessionType && !selectedSessionType.isFree && (
                    <motion.div
                      key="payment"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-full bg-lavender-100 flex items-center justify-center text-lavender-600 font-semibold text-sm">
                          {currentStepIndex + 1}
                        </div>
                        <h4 className="font-semibold text-gray-800 text-lg">Complete Payment</h4>
                      </div>

                      {/* Secure Payment Banner */}
                      <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <Lock className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-blue-800">Secure Payment</p>
                          <p className="text-xs text-blue-600">256-bit SSL encryption • Your data is protected</p>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-blue-600">
                          <Shield className="w-3.5 h-3.5" />
                          <span>Verified</span>
                        </div>
                      </div>

                      {/* Booking Summary */}
                      <div className="bg-lavender-50/50 rounded-xl p-4 mb-5 border border-lavender-100">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-lg bg-lavender-100 flex items-center justify-center">
                            <User className="w-5 h-5 text-lavender-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{customerInfo.name}</p>
                            <p className="text-xs text-gray-500">{customerInfo.phone}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 mb-3 pb-3 border-b border-lavender-200">
                          <div className="w-10 h-10 rounded-lg bg-lavender-100 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-lavender-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{selectedSessionType.title}</p>
                            <p className="text-xs text-gray-500">
                              {selectedDate && formatDate(selectedDate)} at {selectedSlot}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-800">Total Amount</span>
                          <span className="text-xl font-bold text-lavender-600">
                            {formatPrice(selectedSessionType.priceINR, selectedSessionType.priceUSD, isIndia)}
                          </span>
                        </div>
                      </div>

                      {/* Payment Methods */}
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-3">Payment Method:</p>
                        <div className="flex gap-2">
                          {isIndia ? (
                            <>
                              <button className="flex-1 px-4 py-2.5 border-2 border-lavender-300 bg-lavender-50 rounded-lg text-sm font-medium text-lavender-700">
                                UPI
                              </button>
                              <button className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:border-lavender-300">
                                Bank Transfer
                              </button>
                              <button className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:border-lavender-300 flex items-center justify-center gap-1">
                                <CreditCard className="w-4 h-4" />
                                Debit/Credit Card
                              </button>
                            </>
                          ) : (
                            <>
                              <button className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:border-lavender-300">
                                Bank Transfer
                              </button>
                              <button className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:border-lavender-300 flex items-center justify-center gap-1">
                                <CreditCard className="w-4 h-4" />
                                Debit/Credit Card
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Payment Info */}
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <p className="text-xs text-gray-600 text-center">
                          {isTestMode() ? (
                            <>Payment is in <strong>Test Mode</strong> - No real charges</>
                          ) : (
                            <>Secure payment via <strong>Razorpay</strong></>
                          )}
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 6: Confirmation */}
                  {currentStep === 'confirmation' && paymentResult?.success && (
                    <motion.div
                      key="confirmation"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-4"
                    >
                      <div className="flex items-center gap-2 justify-center mb-4">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-semibold text-sm">
                          <CheckCircle className="w-5 h-5" />
                        </div>
                        <h4 className="font-semibold text-gray-800 text-lg">Booking Confirmed</h4>
                      </div>

                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring' }}
                        className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center"
                      >
                        <CheckCircle className="w-10 h-10 text-green-600" />
                      </motion.div>
                      
                      <h4 className="text-xl font-semibold text-gray-800 mb-2">
                        Session Confirmed!
                      </h4>
                      <p className="text-gray-600 text-sm mb-4">
                        Your session has been successfully booked.<br />
                        A confirmation email has been sent to <strong>{customerInfo.email}</strong>.
                      </p>

                      <div className="bg-lavender-50/50 rounded-xl p-4 text-left mb-4 border border-lavender-100">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Booking ID</span>
                            <span className="font-mono font-medium text-gray-800">
                              {paymentResult.bookingId}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Session</span>
                            <span className="font-medium text-gray-800">{selectedSessionType?.title}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Date & Time</span>
                            <span className="font-medium text-gray-800">
                              {selectedDate && formatDate(selectedDate)} at {selectedSlot}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">{selectedSessionType?.isFree ? 'Price' : 'Amount Paid'}</span>
                            <span className={`font-semibold ${selectedSessionType?.isFree ? 'text-green-600' : 'text-lavender-600'}`}>
                              {selectedSessionType?.isFree ? 'Free' : formatPrice(selectedSessionType?.priceINR || 0, selectedSessionType?.priceUSD || 0, isIndia)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            // Generate Google Calendar URL
                            if (selectedDate && selectedSessionType) {
                              const startTime = selectedDate.toISOString().replace(/-|:|\.\d+/g, '');
                              const title = encodeURIComponent(`Therapy Session - ${selectedSessionType.title}`);
                              const details = encodeURIComponent('Your therapy session with MindfulQALB');
                              const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startTime}/${startTime}&details=${details}`;
                              window.open(calendarUrl, '_blank');
                            }
                          }}
                          className="flex-1 px-4 py-3 bg-lavender-100 text-lavender-700 rounded-lg hover:bg-lavender-200 transition-colors font-medium flex items-center justify-center gap-2"
                        >
                          <CalendarPlus className="w-5 h-5" />
                          Add to Calendar
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                  {/* Error Message */}
                  {error && currentStep !== 'confirmation' && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Navigation */}
              {currentStep !== 'confirmation' && (
                <div className="p-5 bg-gray-50 border-t border-gray-100 flex-shrink-0">
                  <div className="flex gap-3">
                    {currentStepIndex > 0 && (
                      <button
                        onClick={goToPrevStep}
                        disabled={isProcessing}
                        className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors font-medium flex items-center justify-center gap-2"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Back
                      </button>
                    )}

                    {currentStep === 'therapy' && (
                      <button
                        onClick={goToNextStep}
                        disabled={!canProceed()}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-lavender-500 to-lavender-600 text-white rounded-xl hover:from-lavender-600 hover:to-lavender-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center gap-2"
                      >
                        {selectedTherapyType?.isFree ? 'Select Date & Time' : 'Choose Format'}
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}

                    {currentStep === 'format' && (
                      <button
                        onClick={goToNextStep}
                        disabled={!canProceed()}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-lavender-500 to-lavender-600 text-white rounded-xl hover:from-lavender-600 hover:to-lavender-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center gap-2"
                      >
                        Select Date & Time
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}

                    {currentStep === 'datetime' && (
                      <button
                        onClick={goToNextStep}
                        disabled={!canProceed() || isProcessing}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-lavender-500 to-lavender-600 text-white rounded-xl hover:from-lavender-600 hover:to-lavender-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center gap-2"
                      >
                        Confirm Slot
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}

                    {currentStep === 'consent' && (
                      <button
                        onClick={goToNextStep}
                        disabled={!canProceed()}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-lavender-500 to-lavender-600 text-white rounded-xl hover:from-lavender-600 hover:to-lavender-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        Next
                      </button>
                    )}

                    {currentStep === 'details' && (
                      <button
                        onClick={handleProceedFromDetails}
                        disabled={isProcessing}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-lavender-500 to-lavender-600 text-white rounded-xl hover:from-lavender-600 hover:to-lavender-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center gap-2"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Processing...
                          </>
                        ) : selectedSessionType?.isFree ? (
                          <>
                            Confirm Booking
                            <CheckCircle className="w-4 h-4" />
                          </>
                        ) : (
                          <>
                            Proceed to Payment
                            <ChevronRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    )}

                    {currentStep === 'payment' && (
                      <button
                        onClick={handlePayment}
                        disabled={isProcessing || !isPaymentConfigured(isIndia)}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-lavender-500 to-lavender-600 text-white rounded-xl hover:from-lavender-600 hover:to-lavender-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center gap-2"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-5 h-5" />
                            Pay & Confirm Booking
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Consent Modal */}
      <ConsentModal
        isOpen={showConsentModal}
        onClose={() => setShowConsentModal(false)}
        onAccept={handleConsentAccept}
        sessionType={selectedSessionType?.title || 'Therapy Session'}
        customerEmail={customerInfo.email || 'client@email.com'}
        preSelectAll={consentAccepted}
      />
    </>
  );
};

export default BookingFlow;
