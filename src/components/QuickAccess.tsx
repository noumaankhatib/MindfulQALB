import { motion } from 'framer-motion'
import { Brain, HeartCrack, MessageCircle, ArrowRight } from 'lucide-react'

const QuickAccess = () => {
  const quickLinks = [
    {
      icon: Brain,
      text: "I'm feeling anxious",
      href: '#mental-health',
      gradient: 'from-lavender-50 to-lavender-50',
      iconBg: 'bg-lavender-100/80',
      iconColor: 'text-lavender-600',
      borderColor: 'border-lavender-200/50',
      hoverGlow: 'hover:shadow-glow-primary',
      delay: 0.1
    },
    {
      icon: HeartCrack,
      text: 'My relationship is struggling',
      href: '#couples',
      gradient: 'from-accent-50 to-cream-50',
      iconBg: 'bg-accent-100/80',
      iconColor: 'text-accent-600',
      borderColor: 'border-accent-200/50',
      hoverGlow: 'hover:shadow-glow-accent',
      delay: 0.15
    },
    {
      icon: MessageCircle,
      text: 'I want to talk to a therapist',
      href: '#therapy',
      gradient: 'from-lavender-50 to-lavender-50/50',
      iconBg: 'bg-lavender-100/80',
      iconColor: 'text-lavender-600',
      borderColor: 'border-lavender-200/50',
      hoverGlow: 'hover:shadow-glow-lavender',
      delay: 0.2
    },
  ]

  return (
    <section className="py-28 md:py-36 relative overflow-hidden px-4 sm:px-6 lg:px-8">
      {/* Background */}
      <div className="absolute inset-0 section-gradient-cream" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-800 mb-5">
            Quick Access
          </h2>
          <div className="section-divider mb-6" />
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Find the support you need right now
          </p>
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-stretch max-w-4xl mx-auto">
          {quickLinks.map((link) => {
            const Icon = link.icon
            return (
              <motion.a
                key={link.text}
                href={link.href}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.7,
                  delay: link.delay,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`group flex-1 flex flex-col items-center gap-5 px-8 py-10 bg-gradient-to-br ${link.gradient} border ${link.borderColor} rounded-3xl shadow-soft hover:shadow-card-hover ${link.hoverGlow} transition-all duration-500 ease-gentle focus:outline-none focus:ring-2 focus:ring-lavender-500/50 focus:ring-offset-2`}
              >
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`w-16 h-16 rounded-2xl ${link.iconBg} backdrop-blur-sm flex items-center justify-center shadow-soft`}
                >
                  <Icon className={`w-8 h-8 ${link.iconColor}`} />
                </motion.div>
                <span className="font-semibold text-gray-800 text-lg text-center">{link.text}</span>
                <span className="flex items-center gap-2 text-lavender-600 text-sm font-medium opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                  Get help <ArrowRight className="w-4 h-4" />
                </span>
              </motion.a>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default QuickAccess
