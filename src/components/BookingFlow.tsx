import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Calendar,
  Shield,
  CreditCard,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  // Clock,
  Loader2,
  AlertCircle,
  CalendarCheck,
  FileCheck,
  Wallet,
  PartyPopper,
} from 'lucide-react';
import { SessionRecommendation } from '../data/chatbotFlow';
import { useGeolocation, formatPrice } from '../hooks/useGeolocation';
import { processPayment, isPaymentConfigured, isTestMode, getPaymentModeLabel } from '../services/paymentService';
import { AVAILABILITY_CONFIG } from '../config/paymentConfig';
import ConsentModal from './ConsentModal';
import { ConsentRecord } from '../data/consentForm';

interface BookingFlowProps {
  session: SessionRecommendation;
  isOpen: boolean;
  onClose: () => void;
}

type BookingStep = 'availability' | 'consent' | 'payment' | 'confirmation';

interface TimeSlot {
  time: string;
  available: boolean;
}

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
}

const BookingFlow = ({ session, isOpen, onClose }: BookingFlowProps) => {
  const { isIndia } = useGeolocation();
  
  // Flow state
  const [currentStep, setCurrentStep] = useState<BookingStep>('availability');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Booking data
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [consentRecord, setConsentRecord] = useState<ConsentRecord | null>(null);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    email: '',
    phone: '',
  });
  const [paymentResult, setPaymentResult] = useState<{
    success: boolean;
    paymentId?: string;
    bookingId?: string;
  } | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Generate next 7 days for date selection
  const availableDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i + 1); // Start from tomorrow
    return date;
  });

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep('availability');
      setSelectedDate(null);
      setSelectedSlot(null);
      setConsentRecord(null);
      setPaymentResult(null);
      setError(null);
      setCustomerInfo({ name: '', email: '', phone: '' });
      setFormErrors({});
    }
  }, [isOpen]);

  // Load available slots when date is selected
  useEffect(() => {
    if (selectedDate) {
      loadAvailableSlots(selectedDate);
    }
  }, [selectedDate]);

  const loadAvailableSlots = async (_date: Date) => {
    setIsProcessing(true);
    setError(null);

    try {
      // In production, this would call your calendar API (Cal.com, etc.)
      // For now, use mock slots
      if (AVAILABILITY_CONFIG.USE_MOCK_AVAILABILITY) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        setAvailableSlots(AVAILABILITY_CONFIG.MOCK_SLOTS);
      } else {
        // TODO: Implement real availability check
        // const response = await fetch(`/api/availability?date=${date.toISOString()}`);
        // const slots = await response.json();
        // setAvailableSlots(slots);
        setAvailableSlots(AVAILABILITY_CONFIG.MOCK_SLOTS);
      }
    } catch (err) {
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

    if (isIndia && !customerInfo.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (isIndia && !/^[6-9]\d{9}$/.test(customerInfo.phone.replace(/\D/g, ''))) {
      errors.phone = 'Please enter a valid 10-digit mobile number';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot: string) => {
    setSelectedSlot(slot);
    setError(null);
  };

  const handleProceedToConsent = () => {
    if (!selectedDate || !selectedSlot) {
      setError('Please select a date and time slot');
      return;
    }
    setCurrentStep('consent');
  };

  const handleConsentAccept = (record: ConsentRecord) => {
    setConsentRecord(record);
    setShowConsentModal(false);
    setCurrentStep('payment');
  };

  const handlePayment = async () => {
    if (!validateCustomerInfo()) return;
    if (!consentRecord) {
      setError('Consent is required to proceed');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const result = await processPayment(session, isIndia, customerInfo);

      if (result.success) {
        // Generate booking ID
        const bookingId = `BK${Date.now().toString(36).toUpperCase()}`;
        
        setPaymentResult({
          success: true,
          paymentId: result.paymentId,
          bookingId,
        });

        // Store booking info
        const bookingRecord = {
          bookingId,
          paymentId: result.paymentId,
          session: session.id,
          date: selectedDate?.toISOString(),
          time: selectedSlot,
          customerInfo,
          consentRecord,
          timestamp: new Date().toISOString(),
        };
        
        const existingBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        existingBookings.push(bookingRecord);
        localStorage.setItem('bookings', JSON.stringify(existingBookings));

        setCurrentStep('confirmation');
      } else {
        setError(result.error || 'Payment failed. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const steps = [
    { id: 'availability', label: 'Select Time', icon: CalendarCheck },
    { id: 'consent', label: 'Consent', icon: FileCheck },
    { id: 'payment', label: 'Payment', icon: Wallet },
    { id: 'confirmation', label: 'Confirmed', icon: PartyPopper },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
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
              className="w-full max-w-lg max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-lavender-500 to-lavender-600 text-white p-5 flex-shrink-0">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{session.title}</h3>
                      <p className="text-sm text-white/80">
                        {session.duration} • {formatPrice(session.priceINR, session.priceUSD, isIndia)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-between">
                  {steps.map((step, index) => {
                    const Icon = step.icon;
                    const isActive = step.id === currentStep;
                    const isCompleted = index < currentStepIndex;
                    
                    return (
                      <div key={step.id} className="flex items-center">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                              isCompleted
                                ? 'bg-white text-lavender-600'
                                : isActive
                                ? 'bg-white/30 text-white'
                                : 'bg-white/10 text-white/50'
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle className="w-5 h-5" />
                            ) : (
                              <Icon className="w-4 h-4" />
                            )}
                          </div>
                          <span className={`text-xs mt-1 ${isActive ? 'text-white' : 'text-white/60'}`}>
                            {step.label}
                          </span>
                        </div>
                        {index < steps.length - 1 && (
                          <div
                            className={`w-8 sm:w-12 h-0.5 mx-1 ${
                              isCompleted ? 'bg-white' : 'bg-white/20'
                            }`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Test Mode Badge */}
                {isTestMode() && (
                  <div className="mt-3 text-center">
                    <span className="text-xs px-2 py-1 bg-amber-400/20 text-amber-100 rounded-full">
                      {getPaymentModeLabel()} - Payments simulated
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-5">
                <AnimatePresence mode="wait">
                  {/* Step 1: Availability */}
                  {currentStep === 'availability' && (
                    <motion.div
                      key="availability"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <h4 className="font-semibold text-gray-800 mb-4">Select Date & Time</h4>

                      {/* Date Selection */}
                      <div className="mb-6">
                        <p className="text-sm text-gray-600 mb-3">Choose a date:</p>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {availableDates.map((date) => (
                            <button
                              key={date.toISOString()}
                              onClick={() => handleDateSelect(date)}
                              className={`flex-shrink-0 px-4 py-3 rounded-xl border transition-all ${
                                selectedDate?.toDateString() === date.toDateString()
                                  ? 'bg-lavender-500 text-white border-lavender-500'
                                  : 'bg-white border-gray-200 hover:border-lavender-300'
                              }`}
                            >
                              <span className="block text-xs opacity-75">
                                {date.toLocaleDateString('en-US', { weekday: 'short' })}
                              </span>
                              <span className="block font-semibold">
                                {date.getDate()}
                              </span>
                            </button>
                          ))}
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
                                  className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                                    selectedSlot === slot.time
                                      ? 'bg-lavender-500 text-white border-lavender-500'
                                      : slot.available
                                      ? 'bg-white border-gray-200 hover:border-lavender-300 text-gray-700'
                                      : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed line-through'
                                  }`}
                                >
                                  {slot.time}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Step 2: Consent (shows modal) */}
                  {currentStep === 'consent' && (
                    <motion.div
                      key="consent"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="text-center py-8"
                    >
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-lavender-100 flex items-center justify-center">
                        <Shield className="w-8 h-8 text-lavender-600" />
                      </div>
                      <h4 className="font-semibold text-gray-800 mb-2">Informed Consent Required</h4>
                      <p className="text-gray-600 text-sm mb-6">
                        Before proceeding with your booking, please read and accept our informed consent form.
                      </p>
                      
                      {consentRecord ? (
                        <div className="p-4 bg-green-50 rounded-xl border border-green-200 mb-4">
                          <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                          <p className="text-sm text-green-800">
                            Consent accepted on{' '}
                            {new Date(consentRecord.timestamp).toLocaleString()}
                          </p>
                          <p className="text-xs text-green-600 mt-1">
                            Signed by: {consentRecord.signature}
                          </p>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowConsentModal(true)}
                          className="px-6 py-3 bg-gradient-to-r from-lavender-500 to-lavender-600 text-white rounded-lg hover:from-lavender-600 hover:to-lavender-700 transition-all font-medium flex items-center justify-center gap-2 mx-auto"
                        >
                          <Shield className="w-5 h-5" />
                          Read & Accept Consent
                        </button>
                      )}
                    </motion.div>
                  )}

                  {/* Step 3: Payment */}
                  {currentStep === 'payment' && (
                    <motion.div
                      key="payment"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <h4 className="font-semibold text-gray-800 mb-4">Complete Payment</h4>

                      {/* Booking Summary */}
                      <div className="bg-lavender-50/50 rounded-xl p-4 mb-5 border border-lavender-100">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Session</span>
                          <span className="font-medium text-gray-800">{session.title}</span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Date & Time</span>
                          <span className="font-medium text-gray-800">
                            {selectedDate && formatDate(selectedDate)} at {selectedSlot}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Duration</span>
                          <span className="font-medium text-gray-800">{session.duration}</span>
                        </div>
                        <div className="border-t border-lavender-200 my-3" />
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-800">Total</span>
                          <span className="text-xl font-bold text-lavender-600">
                            {formatPrice(session.priceINR, session.priceUSD, isIndia)}
                          </span>
                        </div>
                      </div>

                      {/* Customer Form */}
                      <div className="space-y-4 mb-5">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            value={customerInfo.name}
                            onChange={(e) =>
                              setCustomerInfo((prev) => ({ ...prev, name: e.target.value }))
                            }
                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-lavender-300 focus:border-lavender-400 transition-colors ${
                              formErrors.name ? 'border-red-300' : 'border-gray-200'
                            }`}
                            placeholder="Enter your name"
                          />
                          {formErrors.name && (
                            <p className="mt-1 text-xs text-red-500">{formErrors.name}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            value={customerInfo.email}
                            onChange={(e) =>
                              setCustomerInfo((prev) => ({ ...prev, email: e.target.value }))
                            }
                            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-lavender-300 focus:border-lavender-400 transition-colors ${
                              formErrors.email ? 'border-red-300' : 'border-gray-200'
                            }`}
                            placeholder="your@email.com"
                          />
                          {formErrors.email && (
                            <p className="mt-1 text-xs text-red-500">{formErrors.email}</p>
                          )}
                        </div>

                        {isIndia && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Phone Number *
                            </label>
                            <input
                              type="tel"
                              value={customerInfo.phone}
                              onChange={(e) =>
                                setCustomerInfo((prev) => ({ ...prev, phone: e.target.value }))
                              }
                              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-lavender-300 focus:border-lavender-400 transition-colors ${
                                formErrors.phone ? 'border-red-300' : 'border-gray-200'
                              }`}
                              placeholder="9876543210"
                            />
                            {formErrors.phone && (
                              <p className="mt-1 text-xs text-red-500">{formErrors.phone}</p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Payment Gateway Info */}
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <p className="text-xs text-gray-600 text-center">
                          {isTestMode() ? (
                            <>Payment is in <strong>Test Mode</strong> - No real charges</>
                          ) : isIndia ? (
                            <>Paying with <strong>Razorpay</strong> (UPI, Cards, NetBanking)</>
                          ) : (
                            <>Paying with <strong>Stripe</strong> (International Cards)</>
                          )}
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 4: Confirmation */}
                  {currentStep === 'confirmation' && paymentResult?.success && (
                    <motion.div
                      key="confirmation"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-8"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring' }}
                        className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center"
                      >
                        <CheckCircle className="w-10 h-10 text-green-600" />
                      </motion.div>
                      
                      <h4 className="text-xl font-semibold text-gray-800 mb-2">
                        Booking Confirmed!
                      </h4>
                      <p className="text-gray-600 mb-6">
                        Your session has been scheduled successfully.
                      </p>

                      <div className="bg-lavender-50/50 rounded-xl p-5 text-left mb-6 border border-lavender-100">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Booking ID</span>
                            <span className="font-mono font-medium text-gray-800">
                              {paymentResult.bookingId}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Session</span>
                            <span className="font-medium text-gray-800">{session.title}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Date & Time</span>
                            <span className="font-medium text-gray-800">
                              {selectedDate && formatDate(selectedDate)} at {selectedSlot}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Amount Paid</span>
                            <span className="font-semibold text-lavender-600">
                              {formatPrice(session.priceINR, session.priceUSD, isIndia)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-4">
                        A confirmation email has been sent to <strong>{customerInfo.email}</strong>
                      </p>

                      <button
                        onClick={onClose}
                        className="px-8 py-3 bg-gradient-to-r from-lavender-500 to-lavender-600 text-white rounded-lg hover:from-lavender-600 hover:to-lavender-700 transition-all font-medium"
                      >
                        Done
                      </button>
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

              {/* Footer Navigation */}
              {currentStep !== 'confirmation' && (
                <div className="p-5 bg-gray-50 border-t border-gray-100 flex-shrink-0">
                  <div className="flex gap-3">
                    {currentStep !== 'availability' && (
                      <button
                        onClick={() => {
                          const prevStep = steps[currentStepIndex - 1];
                          if (prevStep) setCurrentStep(prevStep.id as BookingStep);
                        }}
                        disabled={isProcessing}
                        className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium flex items-center justify-center gap-2"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Back
                      </button>
                    )}

                    {currentStep === 'availability' && (
                      <button
                        onClick={handleProceedToConsent}
                        disabled={!selectedDate || !selectedSlot || isProcessing}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-lavender-500 to-lavender-600 text-white rounded-lg hover:from-lavender-600 hover:to-lavender-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center gap-2"
                      >
                        Continue
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}

                    {currentStep === 'consent' && (
                      <button
                        onClick={() => {
                          if (consentRecord) {
                            setCurrentStep('payment');
                          } else {
                            setShowConsentModal(true);
                          }
                        }}
                        disabled={!consentRecord && !showConsentModal}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-lavender-500 to-lavender-600 text-white rounded-lg hover:from-lavender-600 hover:to-lavender-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center gap-2"
                      >
                        {consentRecord ? (
                          <>
                            Continue to Payment
                            <ChevronRight className="w-4 h-4" />
                          </>
                        ) : (
                          <>
                            <Shield className="w-4 h-4" />
                            Accept Consent
                          </>
                        )}
                      </button>
                    )}

                    {currentStep === 'payment' && (
                      <button
                        onClick={handlePayment}
                        disabled={isProcessing || !isPaymentConfigured(isIndia)}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-lavender-500 to-lavender-600 text-white rounded-lg hover:from-lavender-600 hover:to-lavender-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center gap-2"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-5 h-5" />
                            Pay {formatPrice(session.priceINR, session.priceUSD, isIndia)}
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
        sessionType={session.title}
        customerEmail={customerInfo.email || 'client@email.com'}
      />
    </>
  );
};

export default BookingFlow;
