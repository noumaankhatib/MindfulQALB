/**
 * PackageBookingFlow
 *
 * Simple enquiry modal for session packages.
 * No payment — user contacts Aqsa directly via WhatsApp or email
 * to finalise the package after a consultation.
 */
import { motion } from 'framer-motion'
import {
  X,
  CheckCircle,
  Shield,
  Sparkles,
  MessageCircle,
  Mail,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SessionPackageDef {
  id: string
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
  isIndia: boolean
}

const WHATSAPP_NUMBER = '923001234567' // replace with Aqsa's actual WhatsApp number
const EMAIL = 'mindfulqalb@gmail.com'

function buildWhatsAppUrl(pkg: SessionPackageDef, isIndia: boolean): string {
  const price = isIndia
    ? `₹${pkg.discountedPriceINR.toLocaleString('en-IN')}`
    : `$${pkg.discountedPriceUSD}`
  const text = `Hi Aqsa! I'm interested in the *${pkg.title}* package — ${pkg.sessionCount} × ${pkg.sessionLabel} (${pkg.durationPerSession}) for ${price}. Could you share more details and help me get started?`
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`
}

function buildEmailUrl(pkg: SessionPackageDef, isIndia: boolean): string {
  const price = isIndia
    ? `₹${pkg.discountedPriceINR.toLocaleString('en-IN')}`
    : `$${pkg.discountedPriceUSD}`
  const subject = `Package Enquiry — ${pkg.title}`
  const body = `Hi Aqsa,\n\nI'm interested in the ${pkg.title} package:\n• ${pkg.sessionCount} × ${pkg.sessionLabel}\n• ${pkg.durationPerSession} each\n• ${price} total\n\nCould you help me get started?\n\nThank you`
  return `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PackageBookingFlow({ pkg, onClose, isIndia }: Props) {
  const priceLabel = isIndia
    ? `₹${pkg.discountedPriceINR.toLocaleString('en-IN')}`
    : `$${pkg.discountedPriceUSD}`
  const origLabel = isIndia
    ? `₹${pkg.originalPriceINR.toLocaleString('en-IN')}`
    : `$${pkg.originalPriceUSD}`

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
        className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92dvh] flex flex-col"
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

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {/* Package summary */}
          <div>
            <p className="text-sm text-gray-500 mb-4">{pkg.subtitle}</p>
            <div className="bg-lavender-50 rounded-2xl p-4 border border-lavender-100">
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

            <div className="flex items-end justify-between mt-4">
              <div>
                <p className="text-xs text-gray-400 line-through">{origLabel}</p>
                <p className="text-2xl font-bold text-lavender-700">{priceLabel}</p>
                <p className="text-xs text-gray-500">for all {pkg.sessionCount} sessions</p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                {pkg.discountPercent}% off
              </span>
            </div>
          </div>

          {/* How it works */}
          <div className="bg-gradient-to-br from-lavender-50 to-purple-50 rounded-2xl p-4 border border-lavender-200">
            <p className="text-xs font-bold text-lavender-700 uppercase tracking-wider mb-2">How it works</p>
            <ol className="space-y-1.5 text-sm text-gray-600 list-none">
              {[
                'Reach out via WhatsApp or email below',
                'Aqsa will confirm availability & answer your questions',
                'Finalise the package together after your consultation',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-lavender-200 text-lavender-700 text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 pb-6 pt-3 border-t border-lavender-50 space-y-3">
          <a
            href={buildWhatsAppUrl(pkg, isIndia)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3.5 bg-[#25D366] hover:bg-[#1ebe5c] text-white rounded-xl font-semibold shadow-md transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            Message on WhatsApp
          </a>
          <a
            href={buildEmailUrl(pkg, isIndia)}
            className="flex items-center justify-center gap-2 w-full py-3 border border-lavender-200 text-lavender-700 rounded-xl font-semibold hover:bg-lavender-50 transition-colors text-sm"
          >
            <Mail className="w-4 h-4" />
            Send an email instead
          </a>
          <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-1">
            <Shield className="w-3 h-3 text-lavender-300" />
            100% confidential · No commitment until you're ready
          </p>
        </div>
      </motion.div>
    </div>
  )
}
