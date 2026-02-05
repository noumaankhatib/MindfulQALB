import { motion } from 'framer-motion'
import { ArrowRight, Calendar, Heart, Sparkles } from 'lucide-react'

const Programs = () => {
  const programs = [
    {
      badge: '6-8 Weeks',
      title: 'Couples Program',
      description: 'Guided track for relationship improvement',
      items: ['Weekly sessions', 'Structured exercises', 'Progress tracking'],
      icon: Heart,
      color: 'accent',
      delay: 0.1
    },
    {
      badge: '6-8 Weeks',
      title: 'Self Growth Journey',
      description: 'Personal development and self-awareness',
      items: ['Goal setting', 'Skill building', 'Reflection exercises'],
      icon: Sparkles,
      color: 'lavender',
      delay: 0.15
    },
    {
      badge: '6-8 Weeks',
      title: 'Wellness Journey',
      description: 'Holistic approach to health and wellness',
      items: ['Mindful eating', 'Behavioral change', 'Support community'],
      icon: Calendar,
      color: 'lavender',
      delay: 0.2
    },
  ]

  const colorClasses = {
    accent: { gradient: 'from-accent-50 to-cream-50/50', iconBg: 'bg-accent-100/80', icon: 'text-accent-600', badge: 'bg-accent-100/80 text-accent-700', bullet: 'text-accent-500' },
    lavender: { gradient: 'from-lavender-50 to-lavender-50/30', iconBg: 'bg-lavender-100/80', icon: 'text-lavender-600', badge: 'bg-lavender-100/80 text-lavender-700', bullet: 'text-lavender-500' },
    sage: { gradient: 'from-lavender-50 to-lavender-50/30', iconBg: 'bg-lavender-100/80', icon: 'text-lavender-600', badge: 'bg-lavender-100/80 text-lavender-700', bullet: 'text-lavender-500' },
  }

  return (
    <section className="py-16 md:py-20 lg:py-24 relative overflow-hidden px-4 sm:px-6 lg:px-8">
      {/* Background */}
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
            Structured Programs
          </h2>
          <div className="section-divider mb-6" />
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Comprehensive programs designed for lasting transformation
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {programs.map((program) => {
            const Icon = program.icon
            const colors = colorClasses[program.color as keyof typeof colorClasses]
            return (
              <motion.div
                key={program.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.7,
                  delay: program.delay,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
                whileHover={{ y: -6, scale: 1.01 }}
                className={`group bg-gradient-to-br ${colors.gradient} rounded-3xl p-8 border border-white/60 shadow-soft hover:shadow-card-hover transition-all duration-500 ease-gentle`}
              >
                <div className="flex items-center justify-between mb-5">
                  <span className={`${colors.badge} px-4 py-1.5 rounded-full text-sm font-medium`}>
                    {program.badge}
                  </span>
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    className={`w-10 h-10 rounded-xl ${colors.iconBg} flex items-center justify-center shadow-soft`}
                  >
                    <Icon className={`w-5 h-5 ${colors.icon}`} />
                  </motion.div>
                </div>
                <h3 className="font-display text-xl md:text-2xl font-semibold text-gray-800 mb-3">
                  {program.title}
                </h3>
                <p className="text-gray-600 mb-5 leading-relaxed">
                  {program.description}
                </p>
                <ul className="space-y-2.5 mb-6">
                  {program.items.map((item) => (
                    <li key={item} className="text-gray-600 flex items-center gap-2.5 text-sm md:text-base">
                      <span className={`${colors.bullet}`}>→</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <a 
                  href="#get-help" 
                  className="inline-flex items-center gap-2 text-lavender-600 hover:text-lavender-700 font-medium text-sm transition-all duration-300 group-hover:gap-3"
                >
                  Learn More
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default Programs
