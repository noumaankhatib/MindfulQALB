import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, MessageCircle, AlertTriangle, ExternalLink, IndianRupee, Clock, Shield, CheckCircle, Video, Headphones, Users, Calendar, ChevronDown, Sparkles } from 'lucide-react'
// BookingCalendar removed - using BookingFlow modal instead
import BookingFlow from './BookingFlow'
import PackageBookingFlow, { type SessionPackageDef } from './PackageBookingFlow'
import { sessionTypes, SessionRecommendation } from '../data/chatbotFlow'
import { useGeolocation, formatPrice } from '../hooks/useGeolocation'
import feeStructureImage from '../assets/images/fee/fee-structure.png'

interface SessionPackage extends SessionPackageDef {
  badge?: string
  badgeColor?: string
  highlight?: boolean
}

const sessionPackages: SessionPackage[] = [
  {
    id: 'chat_bundle',
    title: 'Chat Bundle',
    subtitle: 'Great for beginners',
    sessionCount: 4,
    sessionFormat: 'chat',
    sessionLabel: 'Chat Sessions',
    durationPerSession: '30 min each',
    originalPriceINR: 1996,
    discountedPriceINR: 1697,
    originalPriceUSD: 24,
    discountedPriceUSD: 20,
    discountPercent: 15,
    perks: ['Text-based, low-pressure format', 'Use at your own pace', 'Valid for 6 months', 'No camera needed'],
  },
  {
    id: 'starter_pack',
    title: 'Starter Pack',
    subtitle: 'Most popular choice',
    sessionCount: 4,
    sessionFormat: 'audio',
    sessionLabel: 'Audio Sessions',
    durationPerSession: '45 min each',
    originalPriceINR: 3596,
    discountedPriceINR: 3057,
    originalPriceUSD: 44,
    discountedPriceUSD: 37,
    discountPercent: 15,
    badge: 'Most Popular',
    badgeColor: 'from-lavender-500 to-lavender-600',
    highlight: true,
    perks: ['Voice sessions, no camera needed', 'Aligns with a standard therapy arc', 'Valid for 6 months', 'Save ₹539 vs single sessions'],
  },
  {
    id: 'growth_pack',
    title: 'Growth Pack',
    subtitle: 'Best value for deeper work',
    sessionCount: 8,
    sessionFormat: 'video',
    sessionLabel: 'Video Sessions',
    durationPerSession: '60 min each',
    originalPriceINR: 10392,
    discountedPriceINR: 8314,
    originalPriceUSD: 128,
    discountedPriceUSD: 102,
    discountPercent: 20,
    badge: 'Best Value',
    badgeColor: 'from-emerald-500 to-teal-600',
    perks: ['Full video — deepest connection', 'Covers a complete therapy program', 'Valid for 6 months', 'Save ₹2,078 vs single sessions'],
  },
]

const GetHelp = () => {
  const [showBookingFlow, setShowBookingFlow] = useState(false)
  const [selectedSession, setSelectedSession] = useState<SessionRecommendation | null>(null)
  const [showPackages, setShowPackages] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<SessionPackage | null>(null)
  const { isIndia } = useGeolocation()

  const handleBookSession = (session: SessionRecommendation | null = null) => {
    setSelectedSession(session)
    setShowBookingFlow(true)
  }

  // Session cards for quick booking
  const sessionCards = [
    { ...sessionTypes.chat, icon: MessageCircle, color: 'from-blue-400 to-blue-500' },
    { ...sessionTypes.audio, icon: Headphones, color: 'from-green-400 to-green-500' },
    { ...sessionTypes.video, icon: Video, color: 'from-purple-400 to-purple-500' },
    { ...sessionTypes.couple, icon: Users, color: 'from-rose-400 to-rose-500' },
  ]
  const crisisResources = [
    {
      title: 'iCall - TISS Helpline',
      contact: '9152987821',
      availability: 'Mon-Sat, 8 AM - 10 PM',
      icon: Phone,
    },
    {
      title: 'Vandrevala Foundation',
      contact: '1860-2662-345',
      availability: 'Available 24/7 (Hindi, English)',
      icon: MessageCircle,
    },
    {
      title: 'NIMHANS Helpline',
      contact: '080-46110007',
      availability: 'Available 24/7',
      icon: Phone,
    },
    {
      title: 'Emergency Services',
      contact: '112',
      availability: 'India Emergency Number',
      icon: AlertTriangle,
    },
  ]

  return (
    <section id="get-help" className="py-16 md:py-20 lg:py-24 relative overflow-hidden px-4 sm:px-6 lg:px-8">
      {/* Background */}
      <div className="absolute inset-0 section-gradient-cream" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center mb-10"
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-800 mb-5">
            Book Your Session
          </h2>
          <div className="section-divider mb-6" />
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Schedule a session directly on the calendar or review the fee structure below.
          </p>
        </motion.div>

        {/* Main Booking Section */}
        <div className="max-w-3xl mx-auto mb-16">
          {/* Pricing Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
            className="bg-gradient-to-br from-white/95 to-lavender-50/80 rounded-3xl p-8 md:p-10 border border-lavender-100/50 shadow-soft"
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-12 h-12 rounded-xl bg-lavender-100/80 flex items-center justify-center shadow-soft"
              >
                <IndianRupee className="w-6 h-6 text-lavender-600" />
              </motion.div>
              <div>
                <h3 className="font-display text-xl md:text-2xl font-semibold text-gray-800">
                  Session Fees
                </h3>
                <p className="text-sm text-gray-600">Transparent pricing for all services</p>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-3 mb-6">
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <Shield className="w-3.5 h-3.5 text-lavender-500" />
                <span>100% Confidential</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <Clock className="w-3.5 h-3.5 text-lavender-500" />
                <span>Flexible scheduling</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <CheckCircle className="w-3.5 h-3.5 text-lavender-500" />
                <span>Free initial consultation</span>
              </div>
            </div>

            {/* Fee Structure Image */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl overflow-hidden border border-lavender-100/50 shadow-soft bg-white"
            >
              <img
                src={feeStructureImage}
                alt="Session fee structure - Individual, Couples, and Family therapy pricing"
                className="w-full h-auto object-contain"
                width={1024}
                height={1536}
                loading="lazy"
                decoding="async"
              />
            </motion.div>


{/* Primary Book Now Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleBookSession(null)}
              className="mt-6 w-full py-4 px-6 bg-gradient-to-r from-lavender-500 to-lavender-600 text-white rounded-xl font-semibold text-lg shadow-lg shadow-lavender-500/25 hover:shadow-lavender-500/40 transition-all flex items-center justify-center gap-3"
            >
              <Calendar className="w-6 h-6" />
              Book a Session
            </motion.button>
            <p className="mt-2 text-xs text-gray-500 text-center flex items-center justify-center gap-1">
              <Shield className="w-3.5 h-3.5 text-lavender-400 flex-shrink-0" />
              Your information is kept strictly confidential. No data is shared with third parties.
            </p>

            {/* Quick Book Buttons */}
            <div className="mt-4 grid grid-cols-1 min-[420px]:grid-cols-2 gap-3">
              {sessionCards.map((session) => {
                const Icon = session.icon
                return (
                  <motion.button
                    key={session.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleBookSession(session)}
                    className="flex items-center gap-3 p-4 bg-white/80 rounded-xl border border-lavender-100/50 hover:border-lavender-300 hover:shadow-soft transition-all text-left group min-h-[56px]"
                  >
                    <div className={`w-10 h-10 flex-shrink-0 rounded-lg bg-gradient-to-br ${session.color} flex items-center justify-center shadow-sm`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{session.title}</p>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs text-gray-500 whitespace-nowrap">{session.duration}</span>
                        <span className="text-xs font-semibold text-lavender-600 whitespace-nowrap">
                          {formatPrice(session.priceINR, session.priceUSD, isIndia)}
                        </span>
                      </div>
                    </div>
                    <Calendar className="w-4 h-4 flex-shrink-0 text-lavender-400 group-hover:text-lavender-600 transition-colors" />
                  </motion.button>
                )
              })}
            </div>

            {/* Session Packages Toggle */}
            <div className="mt-6">
              <button
                onClick={() => setShowPackages(!showPackages)}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-lavender-50 to-purple-50 rounded-xl border border-lavender-200/60 hover:border-lavender-300 transition-all"
                aria-expanded={showPackages}
                aria-controls="session-packages"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-lavender-100 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-lavender-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-800">Session Packages — Save up to 20%</p>
                    <p className="text-xs text-gray-500">Bundle sessions for better value · Valid 6 months</p>
                  </div>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-lavender-500 transition-transform duration-300 ${showPackages ? 'rotate-180' : ''}`}
                />
              </button>

              <AnimatePresence>
                {showPackages && (
                  <motion.div
                    id="session-packages"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="pt-3 grid grid-cols-1 gap-3">
                      {sessionPackages.map((pkg) => (
                        <motion.div
                          key={pkg.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`relative rounded-2xl border p-4 transition-all ${
                            pkg.highlight
                              ? 'bg-gradient-to-br from-lavender-50 to-purple-50 border-lavender-300 shadow-soft'
                              : 'bg-white/80 border-lavender-100/70 hover:border-lavender-200'
                          }`}
                        >
                          {pkg.badge && (
                            <span className={`absolute -top-2.5 left-4 px-3 py-0.5 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${pkg.badgeColor}`}>
                              {pkg.badge}
                            </span>
                          )}

                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                <p className="font-semibold text-gray-800 text-sm">{pkg.title}</p>
                                <span className="text-xs text-gray-400">·</span>
                                <span className="text-xs text-gray-500">{pkg.subtitle}</span>
                              </div>
                              <p className="text-xs text-gray-500 mb-2">
                                {pkg.sessionCount} × {pkg.sessionLabel} · {pkg.durationPerSession}
                              </p>
                              <ul className="space-y-0.5">
                                {pkg.perks.map((perk) => (
                                  <li key={perk} className="flex items-center gap-1.5 text-xs text-gray-600">
                                    <CheckCircle className="w-3 h-3 text-lavender-400 flex-shrink-0" />
                                    {perk}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="flex flex-col items-end gap-2 flex-shrink-0">
                              <div className="text-right">
                                <p className="text-xs text-gray-400 line-through">
                                  {isIndia ? `₹${pkg.originalPriceINR.toLocaleString('en-IN')}` : `$${pkg.originalPriceUSD}`}
                                </p>
                                <p className="text-lg font-bold text-lavender-700">
                                  {isIndia ? `₹${pkg.discountedPriceINR.toLocaleString('en-IN')}` : `$${pkg.discountedPriceUSD}`}
                                </p>
                                <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                  {pkg.discountPercent}% off
                                </span>
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => setSelectedPackage(pkg)}
                                className="px-4 py-2 bg-gradient-to-r from-lavender-500 to-lavender-600 text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                Enquire
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <p className="mt-3 text-xs text-gray-500 text-center flex items-center justify-center gap-1.5">
                      <Shield className="w-3 h-3 text-lavender-400 flex-shrink-0" />
                      No commitment until you're ready · Sessions valid 6 months · Rescheduling with 24h notice
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Additional Info */}
            <div className="mt-6 p-4 bg-lavender-50/50 rounded-xl border border-lavender-100/30">
              <p className="text-sm text-gray-600 leading-relaxed">
                <strong className="text-gray-800">Payment Options:</strong> UPI, Bank Transfer, or Cash.
                Package pricing is finalised after a brief consultation with Aqsa. Rescheduling available with 24-hour notice.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Crisis Resources - Condensed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
          className="bg-gradient-to-br from-lavender-50/60 to-cream-50/40 rounded-3xl p-8 md:p-10 border border-lavender-100/50 shadow-soft"
        >
          <div className="text-center mb-8">
            <h3 className="font-display text-xl md:text-2xl font-semibold text-gray-800 mb-2">
              Need Immediate Support?
            </h3>
            <p className="text-gray-600 text-sm">
              If you're in crisis, please reach out to these helplines immediately.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {crisisResources.map((resource, index) => {
              const Icon = resource.icon
              return (
                <motion.div
                  key={resource.title}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="flex flex-col items-center text-center p-5 bg-white/70 backdrop-blur-sm rounded-2xl border border-white/60 shadow-soft hover:shadow-gentle transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-xl bg-lavender-100/80 flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-lavender-600" />
                  </div>
                  <strong className="text-sm text-gray-800 block mb-1">
                    {resource.title}
                  </strong>
                  <a
                    href={`tel:${resource.contact.replace(/[^0-9+]/g, '')}`}
                    className="text-lavender-600 font-semibold text-base mb-0.5 hover:text-lavender-700 transition-colors"
                  >
                    {resource.contact}
                  </a>
                  <p className="text-gray-500 text-xs">{resource.availability}</p>
                </motion.div>
              )
            })}
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              More resources at{' '}
              <a 
                href="https://www.thelivelovelaughfoundation.org" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-lavender-600 hover:text-lavender-700 font-medium inline-flex items-center gap-1 transition-colors"
              >
                The Live Love Laugh Foundation
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Booking Flow Modal */}
      {showBookingFlow && (
        <BookingFlow
          session={selectedSession || undefined}
          isOpen={showBookingFlow}
          onClose={() => {
            setShowBookingFlow(false)
            setSelectedSession(null)
          }}
        />
      )}

      {/* Package Purchase Flow Modal */}
      <AnimatePresence>
        {selectedPackage && (
          <PackageBookingFlow
            pkg={selectedPackage}
            onClose={() => setSelectedPackage(null)}
            isIndia={isIndia}
          />
        )}
      </AnimatePresence>
    </section>
  )
}

export default GetHelp
