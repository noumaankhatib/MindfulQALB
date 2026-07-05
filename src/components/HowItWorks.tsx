import { motion } from 'framer-motion'
import { Calendar, MessageSquare, Heart, ArrowRight, Sparkles } from 'lucide-react'

const ease = [0.25, 0.1, 0.25, 1] as const

const steps = [
  {
    number: '01',
    title: 'Book a free call',
    shortDescription: '15-min consultation — no payment, no commitment',
    description: 'Schedule a 15-minute consultation — no payment, no commitment. Just a chance to connect.',
    icon: Calendar,
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    number: '02',
    title: 'Choose your format',
    shortDescription: 'Chat, audio, or video — your comfort first',
    description: 'Pick chat, audio, or video — whatever feels most comfortable for your first session.',
    icon: MessageSquare,
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    number: '03',
    title: 'Start at your pace',
    shortDescription: 'Confidential sessions tailored to your goals',
    description: 'Confidential, evidence-based sessions tailored to your goals — one step at a time.',
    icon: Heart,
    gradient: 'from-emerald-500 to-teal-600',
  },
]

const HowItWorks = () => {
  return (
    <section
      id="how-it-works"
      className="py-10 sm:py-14 md:py-20 relative overflow-hidden px-4 sm:px-6 lg:px-8"
    >
      <div className="absolute inset-0 section-gradient-cream" />

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease }}
          className="text-center mb-6 sm:mb-10 md:mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-lavender-100/60 border border-lavender-200/50 mb-3 sm:mb-5">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-lavender-600" />
            <span className="text-xs sm:text-sm font-medium text-lavender-700">Simple Process</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-800 mb-3 sm:mb-4">
            How It Works
          </h2>
          <div className="section-divider mb-3 sm:mb-4" />
          <p className="hidden sm:block text-base sm:text-lg text-gray-600 max-w-xl mx-auto leading-relaxed">
            Getting started is straightforward — no pressure, no surprises.
          </p>
        </motion.div>

        {/* Mobile: single compact timeline card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.55, ease }}
          className="md:hidden bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-lavender-100/50 shadow-soft mb-5"
        >
          {steps.map((step, index) => {
            const Icon = step.icon
            const isLast = index === steps.length - 1
            return (
              <div
                key={step.number}
                className={`flex gap-3 ${!isLast ? 'pb-3 mb-3 border-b border-lavender-100/60' : ''}`}
              >
                <div className="flex flex-col items-center shrink-0">
                  <div
                    className={`w-9 h-9 rounded-lg bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-md`}
                  >
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="text-[10px] font-bold tracking-widest text-lavender-400 mb-0.5">
                    STEP {step.number}
                  </p>
                  <h3 className="font-display text-sm font-semibold text-gray-800 leading-tight">
                    {step.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5 leading-snug">{step.shortDescription}</p>
                </div>
              </div>
            )
          })}
        </motion.div>

        {/* Tablet & desktop: three cards */}
        <div className="hidden md:grid md:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-10">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: index * 0.12, duration: 0.6, ease }}
                className="relative text-left"
              >
                {index < steps.length - 1 && (
                  <div
                    className="absolute top-10 left-[calc(50%+2.5rem)] w-[calc(100%-5rem)] h-px bg-gradient-to-r from-lavender-300/60 to-lavender-200/30"
                    aria-hidden
                  />
                )}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-lavender-100/50 shadow-soft h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-lg`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs font-bold tracking-widest text-lavender-400">
                      STEP {step.number}
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-semibold text-gray-800 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            )
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6, ease }}
          className="text-center"
        >
          <motion.a
            href="#get-help"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="btn-primary inline-flex items-center gap-2 px-5 py-3 sm:px-7 sm:py-3.5 text-sm sm:text-base font-medium group w-full sm:w-auto justify-center max-w-xs sm:max-w-none mx-auto"
          >
            <span className="sm:hidden">Book Free Consultation</span>
            <span className="hidden sm:inline">Book Your Free Consultation</span>
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:translate-x-1" />
          </motion.a>
          <p className="text-xs text-gray-500 mt-2 sm:mt-3">
            No commitment · 15 minutes · Confidential
          </p>
        </motion.div>
      </div>
    </section>
  )
}

export default HowItWorks
