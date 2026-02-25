import { motion } from 'framer-motion'
import { Bird, Baby, HeartPulse, ArrowRight } from 'lucide-react'

const SupportGroups = () => {
  const groups = [
    {
      icon: Bird,
      title: 'Grief Support',
      items: [
        'Loss of parent',
        'Loss of partner/spouse',
        'Miscarriage & pregnancy loss',
        'Sudden vs anticipated loss',
        'Anniversary grief',
      ],
      format: 'Weekly 90-minute sessions',
      color: 'lavender',
      delay: 0.1
    },
    {
      icon: Baby,
      title: 'Parenting Support',
      items: [
        'New parents (0–2 years)',
        'Parenting burnout',
        'Children with special needs',
        'Single parenting',
        'Co-parenting after separation',
      ],
      format: 'Attachment-based approach',
      color: 'primary',
      delay: 0.15
    },
    {
      icon: HeartPulse,
      title: 'Pregnancy & Infertility',
      items: [
        'Infertility emotional support',
        'IVF/IUI journey',
        'Pregnancy anxiety',
        'Postpartum adjustment',
        'Pregnancy loss recovery',
      ],
      format: 'Trauma-informed facilitators',
      color: 'accent',
      delay: 0.2
    },
  ]

  const colorClasses = {
    lavender: { gradient: 'from-lavender-50 to-lavender-50/30', iconBg: 'bg-lavender-100/80', icon: 'text-lavender-600', bullet: 'bg-lavender-400', badge: 'bg-lavender-100 text-lavender-700' },
    primary: { gradient: 'from-lavender-50 to-lavender-50/50', iconBg: 'bg-lavender-100/80', icon: 'text-lavender-600', bullet: 'bg-lavender-400', badge: 'bg-lavender-100 text-lavender-700' },
    accent: { gradient: 'from-accent-50 to-cream-50/50', iconBg: 'bg-accent-100/80', icon: 'text-accent-600', bullet: 'bg-accent-400', badge: 'bg-accent-100 text-accent-700' },
  }

  return (
    <section id="groups" className="py-16 md:py-20 lg:py-24 relative overflow-hidden px-4 sm:px-6 lg:px-8">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-cream-50/20 to-white" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-800 mb-5">
            Support Groups & Coaching
          </h2>
          <div className="section-divider mb-6" />
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Therapist-led, structured, and safe support groups—not open forums.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {groups.map((group) => {
            const Icon = group.icon
            const colors = colorClasses[group.color as keyof typeof colorClasses]
            return (
              <motion.div
                key={group.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.7,
                  delay: group.delay,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
                whileHover={{ y: -6, scale: 1.01 }}
                className={`group bg-gradient-to-br ${colors.gradient} rounded-3xl p-5 sm:p-8 border border-white/60 shadow-soft hover:shadow-card-hover transition-all duration-500 ease-gentle`}
              >
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                  className={`w-16 h-16 rounded-2xl ${colors.iconBg} backdrop-blur-sm flex items-center justify-center mb-6 shadow-soft`}
                >
                  <Icon className={`w-8 h-8 ${colors.icon}`} />
                </motion.div>
                <h3 className="font-display text-xl md:text-2xl font-semibold text-gray-800 mb-5">
                  {group.title}
                </h3>
                <ul className="space-y-3 mb-6">
                  {group.items.map((item) => (
                    <li key={item} className="text-gray-600 flex items-start gap-3 text-sm md:text-base">
                      <span className={`w-2 h-2 rounded-full ${colors.bullet} mt-2 flex-shrink-0`}></span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-5 border-t border-gray-200/50 flex items-center justify-between">
                  <span className={`${colors.badge} px-3 py-1.5 rounded-full text-xs font-medium`}>
                    {group.format}
                  </span>
                  <a 
                    href="#get-help" 
                    className="inline-flex items-center gap-1 text-lavender-600 hover:text-lavender-700 font-medium text-sm transition-all duration-300 opacity-0 group-hover:opacity-100"
                  >
                    Join <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default SupportGroups
