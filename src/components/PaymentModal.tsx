import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, CheckCircle, CreditCard, Loader2, AlertCircle, Globe } from 'lucide-react';
import { SessionRecommendation } from '../data/chatbotFlow';
import { useGeolocation, formatPrice } from '../hooks/useGeolocation';
import { processPayment, isPaymentConfigured, PaymentResult } from '../services/paymentService';

interface PaymentModalProps {
  session: SessionRecommendation;
  isOpen: boolean;
  onClose: () => void;
}

const PaymentModal = ({ session, isOpen, onClose }: PaymentModalProps) => {
  const { isIndia, isLoading: geoLoading, country } = useGeolocation();
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
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

  const handlePayment = async () => {
    if (!validateForm()) return;

    setIsProcessing(true);
    setPaymentResult(null);

    try {
      const result = await processPayment(session, isIndia, customerInfo);
      setPaymentResult(result);

      if (result.success) {
        // Store successful payment info
        localStorage.setItem(
          'lastPayment',
          JSON.stringify({
            sessionId: session.id,
            paymentId: result.paymentId,
            timestamp: Date.now(),
          })
        );
      }
    } catch (error) {
      setPaymentResult({
        success: false,
        error: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const paymentConfigured = isPaymentConfigured(isIndia);

  return (
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
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-lavender-500 to-lavender-600 text-white p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Complete Your Booking</h3>
                    <p className="text-sm text-white/80">Secure payment</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-5">
              {/* Success State */}
              {paymentResult?.success ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-800 mb-2">Payment Successful!</h4>
                  <p className="text-gray-600 mb-4">
                    Thank you for booking your {session.title}.
                  </p>
                  <p className="text-sm text-gray-500 mb-6">
                    Payment ID: {paymentResult.paymentId}
                  </p>
                  <p className="text-sm text-gray-600 mb-6">
                    We'll send confirmation and session details to your email shortly.
                  </p>
                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 bg-lavender-500 text-white rounded-lg hover:bg-lavender-600 transition-colors"
                  >
                    Done
                  </button>
                </motion.div>
              ) : (
                <>
                  {/* Session Summary */}
                  <div className="bg-lavender-50/50 rounded-xl p-4 mb-5 border border-lavender-100">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-800">{session.title}</h4>
                      <span className="text-xl font-bold text-lavender-600">
                        {formatPrice(session.priceINR, session.priceUSD, isIndia)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-lavender-500" />
                        {session.duration}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Globe className="w-4 h-4 text-lavender-500" />
                        {geoLoading ? 'Detecting...' : country || 'International'}
                      </span>
                    </div>
                  </div>

                  {/* Payment Gateway Info */}
                  <div className="mb-5 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-xs text-gray-600 text-center">
                      {isIndia ? (
                        <>Paying with <strong>Razorpay</strong> (UPI, Cards, NetBanking)</>
                      ) : (
                        <>Paying with <strong>Stripe</strong> (International Cards)</>
                      )}
                    </p>
                  </div>

                  {/* Customer Form */}
                  <div className="space-y-4 mb-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
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
                        Email Address
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
                          Phone Number
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

                  {/* Error Message */}
                  {paymentResult?.error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700">{paymentResult.error}</p>
                    </div>
                  )}

                  {/* Not Configured Warning */}
                  {!paymentConfigured && (
                    <div className="mb-4 p-3 bg-amber-50 border border-amber-100 rounded-lg flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-amber-700">
                        Payment gateway is not configured. Please contact support or try again later.
                      </p>
                    </div>
                  )}

                  {/* Pay Button */}
                  <button
                    onClick={handlePayment}
                    disabled={isProcessing || !paymentConfigured}
                    className="w-full py-3 bg-gradient-to-r from-lavender-500 to-lavender-600 text-white font-medium rounded-lg hover:from-lavender-600 hover:to-lavender-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
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

                  {/* Security Note */}
                  <p className="mt-4 text-xs text-gray-500 text-center">
                    <span className="inline-flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                      Secure payment powered by {isIndia ? 'Razorpay' : 'Stripe'}
                    </span>
                  </p>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PaymentModal;
