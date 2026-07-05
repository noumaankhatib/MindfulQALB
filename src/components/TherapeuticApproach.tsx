import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Target, Compass, Lightbulb, Sparkles, ChevronDown } from 'lucide-react'

const ease = [0.25, 0.1, 0.25, 1] as const

const approaches = [
  {
    name: 'Cognitive Behaviour Therapy (CBT)',
    shortName: 'CBT',
    description: 'Practical tools to manage anxious thoughts and change unhelpful patterns.',
    icon: Brain,
    color: 'from-violet-500 to-purple-600',
  },
  {
    name: 'Acceptance and Commitment Therapy (ACT)',
    shortName: 'ACT',
    description: 'Accept difficult feelings while taking steps aligned with your values.',
    icon: Compass,
    color: 'from-blue-500 to-indigo-600',
  },
  {
    name: 'Gestalt Therapy',
    shortName: 'Gestalt',
    description: 'Build self-awareness and resolve unfinished business from the past.',
    icon: Target,
    color: 'from-emerald-500 to-teal-600',
  },
  {
    name: 'Solution-Focused Therapy',
    shortName: 'Solution-Focused',
    description: 'Build on your strengths to create practical change efficiently.',
    icon: Lightbulb,
    color: 'from-amber-500 to-orange-600',
  },
]

const TherapeuticApproach = () => {
  const [expanded, setExpanded] = useState<number | null>(null)

  return (
    <section id="approach" className="py-12 sm:py-16 md:py-20 lg:py-24 relative overflow-hidden px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 section-gradient-lavender" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease }}
          className="text-center mb-6 sm:mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-lavender-100/60 border border-lavender-200/50 mb-4 sm:mb-6">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-lavender-600" />
            <span className="text-xs sm:text-sm font-medium text-lavender-700">Evidence-Based Methods</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-800 mb-3 sm:mb-5">
            My Therapeutic Approach
          </h2>
          <div className="section-divider mb-3 sm:mb-6" />
          <p className="hidden sm:block text-base md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Proven methods tailored to what will help you most — warm, collaborative, and never one-size-fits-all.
          </p>
        </motion.div>

        {/* Mobile: compact 2×2 grid, tap to expand detail */}
        <div className="md:hidden grid grid-cols-2 gap-2.5">
          {approaches.map((approach, index) => {
            const Icon = approach.icon
            const isOpen = expanded === index
            return (
              <motion.button
                key={approach.shortName}
                type="button"
                onClick={() => setExpanded(isOpen ? null : index)}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05, duration: 0.45, ease }}
                aria-expanded={isOpen}
                className={`text-left bg-white/90 backdrop-blur-sm rounded-xl p-3 border shadow-soft transition-all duration-300 ${
                  isOpen ? 'border-lavender-300 col-span-2' : 'border-lavender-100/50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-lg bg-gradient-to-br ${approach.color} flex items-center justify-center shrink-0 shadow-md`}
                  >
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-sm font-semibold text-gray-800 leading-tight">
                      {approach.shortName}
                    </h3>
                    {!isOpen && (
                      <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{approach.description}</p>
                    )}
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-lavender-400 shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </div>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.p
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease }}
                      className="text-xs text-gray-600 leading-relaxed mt-2 pt-2 border-t border-lavender-100/60 overflow-hidden"
                    >
                      {approach.description}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.button>
            )
          })}
        </div>

        {/* Tablet & desktop: full cards */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {approaches.map((approach, index) => {
            const Icon = approach.icon
            return (
              <motion.div
                key={approach.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6, ease }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-lavender-100/50 shadow-soft hover:shadow-card-hover transition-all duration-300"
              >
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${approach.color} flex items-center justify-center mb-4 shadow-lg`}
                >
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-display text-lg font-semibold text-gray-800 mb-3">{approach.name}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{approach.description}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default TherapeuticApproach
