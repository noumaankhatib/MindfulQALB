/**
 * PackageBookingFlow
 *
 * A self-contained modal that walks the user through buying a session package:
 *   Step 1 — Package summary (what they're buying)
 *   Step 2 — Their details (name, email, phone)
 *   Step 3 — Consent checkbox
 *   Step 4 — Payment (single Razorpay charge for the full package)
 *   Step 5 — Confirmation ("You have X sessions ready — book the first one")
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  CheckCircle,
  Shield,
  ChevronRight,
  Loader2,
  AlertCircle,
  Sparkles,
  Calendar,
  CreditCard,
  User,
  Mail,
  Phone as PhoneIcon,
} from 'lucide-react'
import { loadRazorpayScript } from '../services/paymentService'
import { useAuth } from '../contexts/AuthContext'
import { useGeolocation } from '../hooks/useGeolocation'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SessionPackageDef {
  id: string              // 'chat_bundle' | 'starter_pack' | 'growth_pack'
  title: string
  subtitle: string
  sessionCount: number
  sessionFormat: 'chat' | 'audio' | 'video'
  sessionLabel: string
  durationPerSession: string
  originalPriceINR: number
  discountedPriceINR: number
  originalPriceUSD: number
  discountedPriceUSD: number
  discountPercent: number
  perks: string[]
}

interface Props {
  pkg: SessionPackageDef
  onClose: () => void
}

type Step = 'summary' | 'details' | 'consent' | 'payment' | 'confirmed'

interface CustomerInfo {
  name: string
  email: string
  phone: string
}

function getApiBase(): string {
  const base = (typeof import.meta.env.VITE_BACKEND_URL === 'string' && import.meta.env.VITE_BACKEND_URL) || '/api'
  return base.replace(/\/$/, '')
}

// ─── Step dots ────────────────────────────────────────────────────────────────

const STEPS: { key: Step; label: string }[] = [
  { key: 'summary', label: 'Package' },
  { key: 'details', label: 'Details' },
  { key: 'consent', label: 'Consent' },
  { key: 'payment', label: 'Payment' },
  { key: 'confirmed', label: 'Done' },
]

const stepIndex = (s: Step) => STEPS.findIndex((x) => x.key === s)

// ─── Component ────────────────────────────────────────────────────────────────

export default function PackageBookingFlow({ pkg, onClose }: Props) {
  const { user } = useAuth()
  const { isIndia } = useGeolocation()

  const [step, setStep] = useState<Step>('summary')
  const [customer, setCustomer] = useState<CustomerInfo>({ name: '', email: user?.email ?? '', phone: '' })
  const [errors, setErrors] = useState<Partial<CustomerInfo>>({})
  const [consentGiven, setConsentGiven] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [sessionsRemaining, setSessionsRemaining] = useState(pkg.sessionCount)

  const price = isIndia ? pkg.discountedPriceINR : pkg.discountedPriceUSD
  const currency = isIndia ? 'INR' : 'USD'
  const priceLabel = isIndia ? `₹${price.toLocaleString('en-IN')}` : `$${price}`
  const origLabel = isIndia
    ? `₹${pkg.originalPriceINR.toLocaleString('en-IN')}`
    : `$${pkg.originalPriceUSD}`

  // ── Validation ──────────────────────────────────────────────────────────────

  const validateDetails = (): boolean => {
    const e: Partial<CustomerInfo> = {}
    if (!customer.name.trim()) e.name = 'Name is required'
    if (!customer.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email))
      e.email = 'Valid email is required'
    if (!customer.phone.trim()) e.phone = 'Phone number is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  // ── Payment ─────────────────────────────────────────────────────────────────

  const handlePayment = async () => {
    setLoading(true)
    setErrorMsg(null)

    try {
      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) {
        setErrorMsg('Failed to load payment gateway. Please try again.')
        setLoading(false)
        return
      }

      const apiBase = getApiBase()

      // 1. Create package order
      const orderRes = await fetch(`${apiBase}/packages/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: pkg.id,
          customerName: customer.name.trim(),
          customerEmail: customer.email.trim().toLowerCase(),
          customerPhone: customer.phone.trim(),
          currency,
          userId: user?.id ?? null,
        }),
      })

      const orderData = await orderRes.json()
      if (!orderRes.ok || !orderData.success) {
        setErrorMsg(orderData.error ?? 'Failed to create order. Please try again.')
        setLoading(false)
        return
      }

      const { orderId, amount, keyId, packageRecordId } = orderData

      // 2. Open Razorpay
      await new Promise<void>((resolve, reject) => {
        const rzp = new window.Razorpay({
          key: keyId,
          amount,
          currency,
          name: 'MindfulQALB',
          description: `${pkg.title} — ${pkg.sessionCount} sessions`,
          order_id: orderId,
          prefill: {
            name: customer.name,
            email: customer.email,
            contact: customer.phone,
          },
          theme: { color: '#8B7EC8' },
          handler: async (response) => {
            try {
              // 3. Activate package after payment
              const activateRes = await fetch(`${apiBase}/packages/activate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  packageRecordId,
                }),
              })
              const activateData = await activateRes.json()
              if (!activateRes.ok || !activateData.success) {
                reject(new Error(activateData.error ?? 'Package activation failed'))
                return
              }
              setSessionsRemaining(pkg.sessionCount)
              resolve()
            } catch (err) {
              reject(err)
            }
          },
          modal: {
            ondismiss: () => {
              reject(new Error('Payment cancelled'))
            },
          },
        })
        rzp.open()
      })

      setStep('confirmed')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Payment failed'
      if (msg === 'Payment cancelled') {
        setErrorMsg(null) // user dismissed, no error needed
      } else {
        setErrorMsg(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92dvh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-lavender-100">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-lavender-600" />
            <span className="font-semibold text-gray-800">{pkg.title}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress dots */}
        {step !== 'confirmed' && (
          <div className="flex items-center justify-center gap-2 px-6 py-3 border-b border-lavender-50">
            {STEPS.filter((s) => s.key !== 'confirmed').map((s, i) => {
              const current = stepIndex(step)
              const done = i < current
              const active = i === current
              return (
                <div key={s.key} className="flex items-center gap-1.5">
                  <div
                    className={`w-2 h-2 rounded-full transition-all ${
                      done
                        ? 'bg-lavender-500'
                        : active
                        ? 'bg-lavender-600 scale-125'
                        : 'bg-lavender-200'
                    }`}
                  />
                  {i < STEPS.filter((s) => s.key !== 'confirmed').length - 1 && (
                    <div className={`w-6 h-0.5 ${done ? 'bg-lavender-400' : 'bg-lavender-100'}`} />
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          <AnimatePresence mode="wait">
            {/* ── STEP 1: Summary ── */}
            {step === 'summary' && (
              <motion.div key="summary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h2 className="font-semibold text-lg text-gray-800 mb-1">{pkg.title}</h2>
                <p className="text-sm text-gray-500 mb-4">{pkg.subtitle}</p>

                <div className="bg-lavender-50 rounded-2xl p-4 mb-4 border border-lavender-100">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    {pkg.sessionCount} × {pkg.sessionLabel} · {pkg.durationPerSession}
                  </p>
                  <ul className="space-y-1.5">
                    {pkg.perks.map((perk) => (
                      <li key={perk} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-lavender-400 flex-shrink-0" />
                        {perk}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-end justify-between mb-2">
                  <div>
                    <p className="text-xs text-gray-400 line-through">{origLabel}</p>
                    <p className="text-2xl font-bold text-lavender-700">{priceLabel}</p>
                    <p className="text-xs text-gray-500">for all {pkg.sessionCount} sessions</p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                    {pkg.discountPercent}% off
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-3">
                  <Shield className="w-3.5 h-3.5 text-lavender-400 flex-shrink-0" />
                  100% confidential · Secure payment via Razorpay
                </div>
              </motion.div>
            )}

            {/* ── STEP 2: Details ── */}
            {step === 'details' && (
              <motion.div key="details" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="space-y-4">
                <h2 className="font-semibold text-gray-800 mb-1">Your details</h2>
                <p className="text-sm text-gray-500 mb-4">We'll use these to confirm your package and send session reminders.</p>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    <User className="w-3.5 h-3.5 inline mr-1.5 text-lavender-500" />Full name
                  </label>
                  <input
                    type="text"
                    value={customer.name}
                    onChange={(e) => setCustomer((c) => ({ ...c, name: e.target.value }))}
                    placeholder="Your full name"
                    className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-lavender-400/40 transition-all ${errors.name ? 'border-red-300 bg-red-50' : 'border-lavender-200 bg-lavender-50/30'}`}
                  />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    <Mail className="w-3.5 h-3.5 inline mr-1.5 text-lavender-500" />Email address
                  </label>
                  <input
                    type="email"
                    value={customer.email}
                    onChange={(e) => setCustomer((c) => ({ ...c, email: e.target.value }))}
                    placeholder="you@example.com"
                    className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-lavender-400/40 transition-all ${errors.email ? 'border-red-300 bg-red-50' : 'border-lavender-200 bg-lavender-50/30'}`}
                  />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    <PhoneIcon className="w-3.5 h-3.5 inline mr-1.5 text-lavender-500" />Phone number
                  </label>
                  <input
                    type="tel"
                    value={customer.phone}
                    onChange={(e) => setCustomer((c) => ({ ...c, phone: e.target.value }))}
                    placeholder="+91 98765 43210"
                    className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-lavender-400/40 transition-all ${errors.phone ? 'border-red-300 bg-red-50' : 'border-lavender-200 bg-lavender-50/30'}`}
                  />
                  {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                </div>
              </motion.div>
            )}

            {/* ── STEP 3: Consent ── */}
            {step === 'consent' && (
              <motion.div key="consent" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h2 className="font-semibold text-gray-800 mb-4">Consent & terms</h2>
                <div className="bg-lavender-50 rounded-2xl p-4 border border-lavender-100 text-sm text-gray-600 space-y-2 mb-5">
                  <p>By purchasing this package you agree to the following:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs text-gray-500 pl-2">
                    <li>Sessions are for personal mental wellness support, not emergency care.</li>
                    <li>Package sessions are valid for 6 months from purchase date.</li>
                    <li>Unused sessions are non-refundable after 7 days of purchase.</li>
                    <li>Rescheduling available with 24-hour notice.</li>
                    <li>Your information is kept strictly confidential.</li>
                  </ul>
                </div>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative mt-0.5 flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={consentGiven}
                      onChange={(e) => setConsentGiven(e.target.checked)}
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                        consentGiven ? 'bg-lavender-600 border-lavender-600' : 'border-lavender-300 bg-white group-hover:border-lavender-400'
                      }`}
                    >
                      {consentGiven && <CheckCircle className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                  <span className="text-sm text-gray-700 leading-relaxed">
                    I have read and agree to the terms above. I understand this is a wellness support service.
                  </span>
                </label>
              </motion.div>
            )}

            {/* ── STEP 4: Payment ── */}
            {step === 'payment' && (
              <motion.div key="payment" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h2 className="font-semibold text-gray-800 mb-4">Review & pay</h2>

                {/* Summary */}
                <div className="bg-lavender-50 rounded-2xl p-4 border border-lavender-100 mb-5 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Package</span>
                    <span className="font-medium text-gray-800">{pkg.title}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Sessions</span>
                    <span className="font-medium text-gray-800">{pkg.sessionCount} × {pkg.sessionLabel}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Duration each</span>
                    <span className="font-medium text-gray-800">{pkg.durationPerSession}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Name</span>
                    <span className="font-medium text-gray-800">{customer.name}</span>
                  </div>
                  <div className="border-t border-lavender-200 pt-2 flex justify-between">
                    <span className="font-semibold text-gray-800">Total</span>
                    <div className="text-right">
                      <span className="text-xs text-gray-400 line-through mr-2">{origLabel}</span>
                      <span className="font-bold text-lavender-700 text-lg">{priceLabel}</span>
                    </div>
                  </div>
                </div>

                {errorMsg && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 rounded-xl border border-red-200 mb-4 text-sm text-red-700">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    {errorMsg}
                  </div>
                )}

                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                  <Shield className="w-3.5 h-3.5 text-lavender-400 flex-shrink-0" />
                  Secure payment powered by Razorpay
                </div>
              </motion.div>
            )}

            {/* ── STEP 5: Confirmed ── */}
            {step === 'confirmed' && (
              <motion.div
                key="confirmed"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-4"
              >
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-9 h-9 text-green-600" />
                </div>
                <h2 className="font-bold text-xl text-gray-800 mb-2">Package activated!</h2>
                <p className="text-gray-600 text-sm mb-1">
                  You have <span className="font-semibold text-lavender-700">{sessionsRemaining} sessions</span> ready to use.
                </p>
                <p className="text-xs text-gray-400 mb-6">Valid for 6 months from today.</p>

                <div className="space-y-3">
                  <a
                    href="/#get-help"
                    onClick={onClose}
                    className="flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-lavender-600 to-lavender-700 text-white rounded-xl font-semibold shadow-md"
                  >
                    <Calendar className="w-5 h-5" />
                    Book my first session
                  </a>
                  <button
                    onClick={onClose}
                    className="w-full py-3 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    I'll book later
                  </button>
                </div>

                <p className="text-xs text-gray-400 mt-4 flex items-center justify-center gap-1">
                  <Shield className="w-3 h-3 text-lavender-300" />
                  Your sessions are saved in My Bookings
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer actions */}
        {step !== 'confirmed' && (
          <div className="px-6 pb-6 pt-3 border-t border-lavender-50">
            {errorMsg && step !== 'payment' && (
              <div className="flex items-start gap-2 p-3 bg-red-50 rounded-xl border border-red-200 mb-3 text-sm text-red-700">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                {errorMsg}
              </div>
            )}

            <div className="flex gap-3">
              {step !== 'summary' && (
                <button
                  onClick={() => {
                    const prev = STEPS[stepIndex(step) - 1]
                    if (prev) setStep(prev.key)
                  }}
                  className="px-4 py-3 rounded-xl border border-lavender-200 text-gray-600 text-sm font-medium hover:bg-lavender-50 transition-colors"
                >
                  Back
                </button>
              )}

              {step === 'summary' && (
                <button
                  onClick={() => setStep('details')}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-lavender-600 to-lavender-700 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              )}

              {step === 'details' && (
                <button
                  onClick={() => {
                    if (validateDetails()) setStep('consent')
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-lavender-600 to-lavender-700 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              )}

              {step === 'consent' && (
                <button
                  onClick={() => {
                    if (!consentGiven) {
                      setErrorMsg('Please accept the terms to continue.')
                      return
                    }
                    setErrorMsg(null)
                    setStep('payment')
                  }}
                  disabled={!consentGiven}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-lavender-600 to-lavender-700 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              )}

              {step === 'payment' && (
                <button
                  onClick={handlePayment}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-lavender-600 to-lavender-700 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing…
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Pay {priceLabel}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
