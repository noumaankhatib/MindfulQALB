import { motion } from 'framer-motion'
import { BookOpen, Video, Hand, LifeBuoy, ArrowRight } from 'lucide-react'

const WhatWeOffer = () => {
  const services = [
    {
      icon: BookOpen,
      title: 'Self-Guided Tools',
      description: 'Mood tracking, journaling, CBT worksheets, and evidence-based exercises',
      color: 'primary',
      delay: 0.1
    },
    {
      icon: Video,
      title: 'Therapy Sessions',
      description: '1-on-1 and couples therapy with licensed, specialized therapists',
      color: 'lavender',
      delay: 0.15
    },
    {
      icon: Hand,
      title: 'Couples Counselling',
      description: 'Evidence-based approaches: EFT, Gottman Method, and trauma-informed care',
      color: 'accent',
      delay: 0.2
    },
    {
      icon: LifeBuoy,
      title: 'Crisis Resources',
      description: '24/7 crisis support, emergency resources, and immediate help access',
      color: 'sage',
      delay: 0.25
    },
  ]

  const colorClasses = {
    primary: {
      bg: 'bg-gradient-to-br from-lavender-50 to-lavender-50/50',
      iconBg: 'bg-lavender-100/80',
      icon: 'text-lavender-600',
      border: 'border-lavender-100/60',
    },
    lavender: {
      bg: 'bg-gradient-to-br from-lavender-50 to-lavender-50/30',
      iconBg: 'bg-lavender-100/80',
      icon: 'text-lavender-600',
      border: 'border-lavender-100/60',
    },
    accent: {
      bg: 'bg-gradient-to-br from-accent-50 to-cream-50/50',
      iconBg: 'bg-accent-100/80',
      icon: 'text-accent-600',
      border: 'border-accent-100/60',
    },
    sage: {
      bg: 'bg-gradient-to-br from-lavender-50 to-lavender-50/30',
      iconBg: 'bg-lavender-100/80',
      icon: 'text-lavender-600',
      border: 'border-lavender-100/60',
    },
  }

  return (
    <section className="py-28 md:py-36 relative overflow-hidden px-4 sm:px-6 lg:px-8">
      {/* Background */}
      <div className="absolute inset-0 section-gradient-lavender" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center mb-20"
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-800 mb-5">
            What We Offer
          </h2>
          <div className="section-divider mb-6" />
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Comprehensive solutions to support your mental health journey
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => {
            const Icon = service.icon
            const colors = colorClasses[service.color as keyof typeof colorClasses]
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.7,
                  delay: service.delay,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
                whileHover={{ y: -6, scale: 1.02 }}
                className={`group ${colors.bg} rounded-3xl p-7 border ${colors.border} shadow-soft hover:shadow-card-hover transition-all duration-500 ease-gentle backdrop-blur-sm`}
              >
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                  className={`w-14 h-14 rounded-2xl ${colors.iconBg} backdrop-blur-sm flex items-center justify-center mb-5 shadow-soft`}
                >
                  <Icon className={`w-7 h-7 ${colors.icon}`} />
                </motion.div>
                <h3 className="font-display text-lg md:text-xl font-semibold text-gray-800 mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm md:text-base mb-5">
                  {service.description}
                </p>
                <a 
                  href="#get-help" 
                  className="inline-flex items-center gap-2 text-lavender-600 hover:text-lavender-700 font-medium text-sm transition-all duration-300 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
                >
                  Learn more
                  <ArrowRight className="w-4 h-4" />
                </a>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default WhatWeOffer
