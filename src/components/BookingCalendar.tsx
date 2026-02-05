import { motion } from 'framer-motion'
import { Calendar, Clock, Shield, CheckCircle, ExternalLink, MessageCircle, Video, Phone } from 'lucide-react'

// Cal.com username - update this with your actual Cal.com username once set up
const CAL_USERNAME = 'mindful-qalb'

// Event type slugs - update these after creating event types in Cal.com
const EVENT_TYPES = {
  consultation: 'free-consultation',
  individual: 'individual-therapy',
  couples: 'couples-therapy',
}

interface BookingCalendarProps {
  eventType?: keyof typeof EVENT_TYPES
  className?: string
}

const BookingCalendar = ({ className = '' }: BookingCalendarProps) => {
  const calLink = `https://cal.com/${CAL_USERNAME}`

  // Session types for booking
  const sessionTypes = [
    {
      title: 'Free Consultation',
      duration: '15-20 min',
      price: 'Free',
      description: 'A brief call to understand your needs',
      icon: Phone,
      link: `https://cal.com/${CAL_USERNAME}/${EVENT_TYPES.consultation}`,
    },
    {
      title: 'Individual Therapy',
      duration: '50-60 min',
      price: '₹1,500',
      description: 'One-on-one personalized session',
      icon: Video,
      link: `https://cal.com/${CAL_USERNAME}/${EVENT_TYPES.individual}`,
    },
    {
      title: 'Couples Therapy',
      duration: '60-75 min',
      price: '₹2,000',
      description: 'Joint session for couples',
      icon: MessageCircle,
      link: `https://cal.com/${CAL_USERNAME}/${EVENT_TYPES.couples}`,
    },
  ]

  // Trust indicators
  const trustIndicators = [
    { icon: Shield, text: '100% Confidential' },
    { icon: Clock, text: 'Flexible Scheduling' },
    { icon: CheckCircle, text: 'Online Sessions' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
      className={`bg-gradient-to-br from-white/95 to-lavender-50/80 rounded-3xl p-8 md:p-10 border border-lavender-100/50 shadow-soft ${className}`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          className="w-12 h-12 rounded-xl bg-lavender-100/80 flex items-center justify-center shadow-soft"
        >
          <Calendar className="w-6 h-6 text-lavender-600" />
        </motion.div>
        <div>
          <h3 className="font-display text-xl md:text-2xl font-semibold text-gray-800">
            Book a Session
          </h3>
          <p className="text-sm text-gray-600">Choose your session type</p>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="flex flex-wrap gap-3 mb-6">
        {trustIndicators.map((item, index) => {
          const Icon = item.icon
          return (
            <div key={index} className="flex items-center gap-1.5 text-xs text-gray-600">
              <Icon className="w-3.5 h-3.5 text-lavender-500" />
              <span>{item.text}</span>
            </div>
          )
        })}
      </div>

      {/* Session Types */}
      <div className="space-y-3 mb-6">
        {sessionTypes.map((session, index) => {
          const Icon = session.icon
          return (
            <motion.a
              key={index}
              href={session.link}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-lavender-100/50 hover:border-lavender-300 hover:shadow-md transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-lavender-100 to-lavender-50 flex items-center justify-center flex-shrink-0 group-hover:from-lavender-200 group-hover:to-lavender-100 transition-colors">
                <Icon className="w-5 h-5 text-lavender-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-semibold text-gray-800 text-sm">{session.title}</h4>
                  <span className="text-lavender-600 font-bold text-sm">{session.price}</span>
                </div>
                <p className="text-gray-500 text-xs mt-0.5">{session.description}</p>
                <p className="text-gray-400 text-xs mt-1">{session.duration}</p>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-lavender-500 transition-colors flex-shrink-0" />
            </motion.a>
          )
        })}
      </div>

      {/* Main CTA */}
      <motion.a
        href={calLink}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        <Calendar className="w-5 h-5" />
        View All Available Slots
        <ExternalLink className="w-4 h-4" />
      </motion.a>

      {/* Info Note */}
      <p className="text-xs text-gray-500 mt-6 text-center">
        All bookings require confirmation. You'll receive an email once your session is approved.
      </p>
    </motion.div>
  )
}

export default BookingCalendar
