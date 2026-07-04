import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  Shield,
  Award,
  FlaskConical,
  Scale,
  Quote,
  CheckCircle2,
  Lock,
  Heart,
  Globe,
} from 'lucide-react'

const ease = [0.25, 0.1, 0.25, 1] as const

const commitments = [
  {
    icon: Shield,
    label: 'Licensed & credentialed',
    detail: 'Master\'s in Counseling Psychology with verified professional standing',
  },
  {
    icon: Lock,
    label: 'Fully confidential',
    detail: 'Private sessions with strict ethical boundaries and secure communication',
  },
  {
    icon: FlaskConical,
    label: 'Evidence-based methods',
    detail: 'CBT, ACT, Gottman, EFT, and trauma-informed approaches',
  },
  {
    icon: Scale,
    label: 'Ethical & transparent',
    detail: 'Clear policies, informed consent, and client-centred care',
  },
]

const pillars = [
  {
    icon: Award,
    title: 'Qualified Expertise',
    description:
      '3,000+ clinical hours supporting individuals and couples through anxiety, relationships, and life transitions.',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    icon: Shield,
    title: 'Privacy You Can Trust',
    description:
      'Your story stays between us. Sessions are confidential, respectful, and held in a judgment-free space.',
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    icon: FlaskConical,
    title: 'Proven Approaches',
    description:
      'Therapy grounded in research-backed methods — adapted to your goals, pace, and personal context.',
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    icon: Heart,
    title: 'Warm, Human Care',
    description:
      'Collaborative and compassionate — never clinical or cold. You are met with empathy at every step.',
    gradient: 'from-rose-400 to-pink-600',
  },
]

const TrustSignals = () => {
  const sectionRef = useRef<HTMLElement>(null)
  const inView = useInView(sectionRef, { once: true, margin: '-80px' })

  return (
    <section
      ref={sectionRef}
      id="trust"
      className="py-12 sm:py-16 md:py-20 lg:py-24 relative overflow-hidden px-4 sm:px-6 lg:px-8"
    >
      <div className="absolute inset-0 section-gradient-light" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease }}
          className="text-center mb-8 sm:mb-10 md:mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-lavender-100/60 border border-lavender-200/50 mb-4 sm:mb-6">
            <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-lavender-600" />
            <span className="text-xs sm:text-sm font-medium text-lavender-700">Why Trust Us</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-800 mb-3 sm:mb-5">
            Care You Can Count On
          </h2>
          <div className={`section-divider-animated mb-4 sm:mb-6 ${inView ? 'visible' : ''}`} />
          <p className="hidden sm:block text-base md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Professional, confidential therapy with credentials, ethics, and compassion at the centre of
            every session.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease }}
          className="bg-gradient-to-br from-white/95 to-lavender-50/80 rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 lg:p-12 border border-lavender-100/50 shadow-soft mb-6 sm:mb-10 md:mb-12"
        >
          <div className="grid lg:grid-cols-5 gap-5 sm:gap-8 lg:gap-12 items-start">
            <div className="lg:col-span-3 relative">
              <div className="absolute -top-2 -left-1 w-1 h-16 rounded-full bg-gradient-to-b from-lavender-400 to-lavender-600 hidden sm:block" />
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-lavender-100/80 border border-lavender-200/50 mb-3 sm:mb-5 shadow-soft"
              >
                <Quote className="w-4 h-4 sm:w-5 sm:h-5 text-lavender-600" />
              </motion.div>
              <blockquote className="font-display text-base sm:text-xl md:text-2xl lg:text-[1.65rem] text-gray-800 leading-snug sm:leading-relaxed font-medium mb-0 sm:mb-5">
                <span className="sm:hidden">
                  &ldquo;Safe, confidential, compassionate care — tailored to you.&rdquo;
                </span>
                <span className="hidden sm:inline">
                  &ldquo;Feeling safe, seen, and respected is the foundation of effective therapy. Every
                  session is held with compassion, confidentiality, and care tailored to you.&rdquo;
                </span>
              </blockquote>
              <p className="hidden md:block text-gray-600 leading-relaxed max-w-xl mt-5">
                MindfulQALB is built on professional standards you would expect from a licensed
                counseling psychologist — with the warmth and accessibility of a space where you can
                truly open up.
              </p>
              <div className="hidden md:flex flex-wrap gap-2 mt-6">
                {[
                  { icon: Globe, label: 'India & international clients' },
                  { icon: Scale, label: 'Ethical practice standards' },
                ].map(({ icon: Icon, label }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/80 border border-lavender-100 text-gray-600 text-xs font-medium rounded-full"
                  >
                    <Icon className="w-3.5 h-3.5 text-lavender-500" />
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {/* Compact 2×2 on mobile; full list on tablet+ */}
            <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-1 gap-2 sm:gap-3">
              {commitments.map((item, i) => {
                const Icon = item.icon
                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: 16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.15 + i * 0.08, duration: 0.55, ease }}
                    className="flex flex-col sm:flex-row gap-2 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/70 backdrop-blur-sm border border-lavender-100/60 sm:hover:border-lavender-200/80 sm:hover:shadow-soft transition-all duration-300"
                  >
                    <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-lavender-100/80 flex items-center justify-center">
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-lavender-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-800 text-xs sm:text-sm md:text-base leading-tight sm:flex sm:items-center sm:gap-1.5">
                        <CheckCircle2 className="hidden sm:inline w-4 h-4 text-emerald-500 flex-shrink-0" />
                        {item.label}
                      </p>
                      <p className="hidden sm:block text-sm text-gray-500 mt-0.5 leading-relaxed">
                        {item.detail}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </motion.div>

        {/* Pillars hidden on small phones — commitments cover the same points */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon
            return (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: index * 0.1, duration: 0.6, ease }}
                whileHover={{ y: -6 }}
                className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-lavender-100/50 shadow-soft hover:shadow-card-hover transition-all duration-300 h-full flex flex-col"
              >
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${pillar.gradient} flex items-center justify-center mb-4 shadow-lg`}
                >
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-display text-lg font-semibold text-gray-800 mb-2">
                  {pillar.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed flex-1">{pillar.description}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default TrustSignals
