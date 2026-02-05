import { motion } from 'framer-motion'
import { Shield, Award, FlaskConical, Scale } from 'lucide-react'

const TrustSignals = () => {
  const signals = [
    {
      icon: Award,
      title: 'Licensed Therapists',
      description: 'All therapists are verified, licensed, and continuously credentialed',
      color: 'lavender',
      delay: 0.1
    },
    {
      icon: Shield,
      title: 'Privacy-First',
      description: 'End-to-end encryption, HIPAA compliance, and strict confidentiality',
      color: 'lavender',
      delay: 0.15
    },
    {
      icon: FlaskConical,
      title: 'Evidence-Based',
      description: 'Approaches backed by research: CBT, EFT, Gottman, Trauma-informed',
      color: 'lavender',
      delay: 0.2
    },
    {
      icon: Scale,
      title: 'Ethical Practice',
      description: 'Transparent policies, no dark patterns, clear limitations',
      color: 'accent',
      delay: 0.25
    },
  ]

  const colorClasses = {
    primary: { bg: 'bg-lavender-100/60', icon: 'text-lavender-600', ring: 'ring-lavender-200/50' },
    lavender: { bg: 'bg-lavender-100/60', icon: 'text-lavender-600', ring: 'ring-lavender-200/50' },
    sage: { bg: 'bg-lavender-100/60', icon: 'text-lavender-600', ring: 'ring-lavender-200/50' },
    accent: { bg: 'bg-accent-100/60', icon: 'text-accent-600', ring: 'ring-accent-200/50' },
  }

  return (
    <section className="py-16 md:py-20 lg:py-24 relative overflow-hidden px-4 sm:px-6 lg:px-8">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-lavender-50/20 to-white" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-800 mb-5">
            Why Trust Us
          </h2>
          <div className="section-divider" />
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {signals.map((signal) => {
            const Icon = signal.icon
            const colors = colorClasses[signal.color as keyof typeof colorClasses]
            return (
              <motion.div
                key={signal.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.7,
                  delay: signal.delay,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
                whileHover={{ y: -4 }}
                className="text-center group"
              >
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                  className={`w-16 h-16 rounded-2xl ${colors.bg} ring-4 ${colors.ring} flex items-center justify-center mx-auto mb-5 shadow-soft group-hover:shadow-gentle transition-all duration-400`}
                >
                  <Icon className={`w-8 h-8 ${colors.icon}`} />
                </motion.div>
                <h3 className="font-display text-lg md:text-xl font-semibold text-gray-800 mb-3">
                  {signal.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm md:text-base max-w-xs mx-auto">
                  {signal.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default TrustSignals
