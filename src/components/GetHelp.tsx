import { useState } from 'react'
import { motion } from 'framer-motion'
import { Phone, MessageCircle, AlertTriangle, ExternalLink, IndianRupee, Clock, Shield, CheckCircle, Video, Headphones, Users, Calendar } from 'lucide-react'
import BookingCalendar from './BookingCalendar'
import BookingFlow from './BookingFlow'
import { sessionTypes, SessionRecommendation } from '../data/chatbotFlow'
import { useGeolocation, formatPrice } from '../hooks/useGeolocation'
import { isTestMode } from '../services/paymentService'
import feeStructureImage from '../assets/images/fee/fee-structure.png'

const GetHelp = () => {
  const [showBookingFlow, setShowBookingFlow] = useState(false)
  const [selectedSession, setSelectedSession] = useState<SessionRecommendation | null>(null)
  const { isIndia } = useGeolocation()

  const handleBookSession = (session: SessionRecommendation) => {
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

        {/* Main Booking Section - Pricing + Calendar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Pricing Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
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
                loading="lazy"
              />
            </motion.div>

            {/* Test Mode Indicator */}
            {isTestMode() && (
              <div className="mt-4 p-2 bg-amber-50 rounded-lg border border-amber-200 text-center">
                <span className="text-xs text-amber-700 font-medium">
                  🧪 Test Mode - Payments are simulated
                </span>
              </div>
            )}

            {/* Quick Book Buttons */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              {sessionCards.map((session) => {
                const Icon = session.icon
                return (
                  <motion.button
                    key={session.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleBookSession(session)}
                    className="flex items-center gap-3 p-3 bg-white/80 rounded-xl border border-lavender-100/50 hover:border-lavender-300 hover:shadow-soft transition-all text-left group"
                  >
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${session.color} flex items-center justify-center shadow-sm`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{session.title}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{session.duration}</span>
                        <span className="text-xs font-semibold text-lavender-600">
                          {formatPrice(session.priceINR, session.priceUSD, isIndia)}
                        </span>
                      </div>
                    </div>
                    <Calendar className="w-4 h-4 text-lavender-400 group-hover:text-lavender-600 transition-colors" />
                  </motion.button>
                )
              })}
            </div>

            {/* Additional Info */}
            <div className="mt-6 p-4 bg-lavender-50/50 rounded-xl border border-lavender-100/30">
              <p className="text-sm text-gray-600 leading-relaxed">
                <strong className="text-gray-800">Payment Options:</strong> UPI, Bank Transfer, or Cash. 
                Payment is due at the time of booking. Rescheduling available with 24-hour notice.
              </p>
            </div>
          </motion.div>

          {/* Cal.com Booking Calendar */}
          <BookingCalendar eventType="consultation" />
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
                  <p className="text-lavender-600 font-semibold text-base mb-0.5">{resource.contact}</p>
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
      {showBookingFlow && selectedSession && (
        <BookingFlow
          session={selectedSession}
          isOpen={showBookingFlow}
          onClose={() => {
            setShowBookingFlow(false)
            setSelectedSession(null)
          }}
        />
      )}
    </section>
  )
}

export default GetHelp
