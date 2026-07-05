import { motion } from 'framer-motion'
import { User, Heart, Users, Video, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const services = [
  {
    icon: User,
    title: 'Individual Therapy',
    shortTitle: 'Individual',
    description: 'Anxiety, stress, burnout, grief, and life transitions — one-on-one support tailored to you.',
    shortDescription: 'Anxiety, stress, grief & life transitions',
    href: '#get-help',
    blogHref: '/blog/understanding-managing-emotions-guide',
    color: 'lavender',
  },
  {
    icon: Heart,
    title: 'Couples Therapy',
    shortTitle: 'Couples',
    description: 'Rebuild trust, improve communication, and navigate conflict together.',
    shortDescription: 'Trust, communication & conflict',
    href: '#get-help',
    blogHref: '/blog/family-dynamics-generational-trauma-couple-therapy',
    color: 'accent',
  },
  {
    icon: Users,
    title: 'Family Counseling',
    shortTitle: 'Family',
    description: 'Heal family patterns, improve dynamics, and support each other through change.',
    shortDescription: 'Family patterns & dynamics',
    href: '#get-help',
    blogHref: '/blog/family-dynamics-generational-trauma-couple-therapy',
    color: 'sage',
  },
  {
    icon: Video,
    title: 'Online Sessions',
    shortTitle: 'Online',
    description: 'Video, audio, or chat — flexible formats from anywhere in the world.',
    shortDescription: 'Video, audio or chat — worldwide',
    href: '#get-help',
    blogHref: null,
    color: 'primary',
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

const ease = [0.25, 0.1, 0.25, 1] as const

const Services = () => {
  return (
    <section id="services" className="py-12 sm:py-16 md:py-20 lg:py-24 relative overflow-hidden px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 section-gradient-lavender" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease }}
          className="text-center mb-6 sm:mb-10 md:mb-12"
        >
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-800 mb-3 sm:mb-5">
            How I Can Help
          </h2>
          <div className="section-divider mb-3 sm:mb-6" />
          <p className="hidden sm:block text-base md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Individual, couples, and family therapy — online, confidential, and evidence-based.
          </p>
        </motion.div>

        {/* 2×2 on mobile — half the scroll height vs stacked cards */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {services.map((service, index) => {
            const Icon = service.icon
            const colors = colorClasses[service.color as keyof typeof colorClasses]
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: index * 0.06, ease }}
                whileHover={{ y: -4, scale: 1.02 }}
                className={`group relative ${colors.bg} rounded-2xl sm:rounded-3xl p-3.5 sm:p-7 border ${colors.border} shadow-soft hover:shadow-card-hover transition-all duration-300 backdrop-blur-sm flex flex-col h-full active:scale-[0.98]`}
              >
                <a
                  href={service.href}
                  className="sm:hidden absolute inset-0 z-[1] rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-lavender-400/60"
                  aria-label={`Book ${service.title}`}
                />
                <div className={`relative z-[2] pointer-events-none sm:pointer-events-auto w-9 h-9 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl ${colors.iconBg} flex items-center justify-center mb-2 sm:mb-5 shadow-soft`}>
                  <Icon className={`w-4 h-4 sm:w-7 sm:h-7 ${colors.icon}`} />
                </div>
                <h3 className="relative z-[2] pointer-events-none sm:pointer-events-auto font-display text-sm sm:text-lg md:text-xl font-semibold text-gray-800 mb-1 sm:mb-3 leading-tight">
                  <span className="sm:hidden">{service.shortTitle}</span>
                  <span className="hidden sm:inline">{service.title}</span>
                </h3>
                <p className="relative z-[2] pointer-events-none sm:pointer-events-auto text-gray-600 text-xs sm:text-sm md:text-base leading-snug sm:leading-relaxed mb-0 sm:mb-5 flex-1">
                  <span className="sm:hidden">{service.shortDescription}</span>
                  <span className="hidden sm:inline">{service.description}</span>
                </p>
                <div className="hidden sm:flex flex-col gap-2 mt-auto relative z-[2]">
                  <a
                    href={service.href}
                    className="inline-flex items-center gap-2 text-lavender-600 hover:text-lavender-700 font-medium text-sm transition-colors"
                  >
                    Book a session
                    <ArrowRight className="w-4 h-4" />
                  </a>
                  {service.blogHref && (
                    <Link
                      to={service.blogHref}
                      className="inline-flex items-center gap-2 text-gray-500 hover:text-lavender-600 font-medium text-xs transition-colors"
                    >
                      Read more on the blog
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="sm:hidden text-center mt-4"
        >
          <a
            href="#get-help"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-lavender-600"
          >
            Book a session
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-xs sm:text-sm text-gray-500 mt-4 sm:mt-8 leading-relaxed px-2"
        >
          <span className="sm:hidden">Anxiety · Relationships · Grief · Burnout · More</span>
          <span className="hidden sm:inline">
            Anxiety · Relationships · Grief · Trauma · Burnout · Self-esteem · Life transitions
          </span>
        </motion.p>
      </div>
    </section>
  )
}

export default Services
