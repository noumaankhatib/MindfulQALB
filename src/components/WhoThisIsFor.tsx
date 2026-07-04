import { motion } from 'framer-motion'
import { ArrowRight, UserCheck } from 'lucide-react'

const concerns = [
  { label: 'Anxiety & stress', tone: 'violet' },
  { label: 'Burnout', tone: 'amber' },
  { label: 'Relationship conflict', tone: 'rose' },
  { label: 'Grief & loss', tone: 'slate' },
  { label: 'Self-esteem', tone: 'purple' },
  { label: 'Life transitions', tone: 'teal' },
  { label: 'Couples therapy', tone: 'pink' },
  { label: 'Family dynamics', tone: 'indigo' },
] as const

const chipTones = {
  violet: {
    bg: 'bg-gradient-to-br from-violet-50 to-purple-50/90',
    border: 'border-violet-200/60',
    text: 'text-violet-800',
    hover: 'hover:border-violet-300 hover:from-violet-100/80 hover:text-violet-900',
  },
  amber: {
    bg: 'bg-gradient-to-br from-amber-50 to-orange-50/80',
    border: 'border-amber-200/60',
    text: 'text-amber-900',
    hover: 'hover:border-amber-300 hover:from-amber-100/80 hover:text-amber-950',
  },
  rose: {
    bg: 'bg-gradient-to-br from-rose-50 to-pink-50/90',
    border: 'border-rose-200/60',
    text: 'text-rose-800',
    hover: 'hover:border-rose-300 hover:from-rose-100/80 hover:text-rose-900',
  },
  slate: {
    bg: 'bg-gradient-to-br from-slate-50 to-gray-50/90',
    border: 'border-slate-200/60',
    text: 'text-slate-700',
    hover: 'hover:border-slate-300 hover:from-slate-100/80 hover:text-slate-900',
  },
  purple: {
    bg: 'bg-gradient-to-br from-lavender-50 to-purple-50/90',
    border: 'border-lavender-200/60',
    text: 'text-lavender-800',
    hover: 'hover:border-lavender-300 hover:from-lavender-100/80 hover:text-lavender-900',
  },
  teal: {
    bg: 'bg-gradient-to-br from-teal-50 to-emerald-50/90',
    border: 'border-teal-200/60',
    text: 'text-teal-800',
    hover: 'hover:border-teal-300 hover:from-teal-100/80 hover:text-teal-900',
  },
  pink: {
    bg: 'bg-gradient-to-br from-pink-50 to-rose-50/80',
    border: 'border-pink-200/60',
    text: 'text-pink-800',
    hover: 'hover:border-pink-300 hover:from-pink-100/80 hover:text-pink-900',
  },
  indigo: {
    bg: 'bg-gradient-to-br from-indigo-50 to-blue-50/90',
    border: 'border-indigo-200/60',
    text: 'text-indigo-800',
    hover: 'hover:border-indigo-300 hover:from-indigo-100/80 hover:text-indigo-900',
  },
}

const ease = [0.25, 0.1, 0.25, 1] as const

const WhoThisIsFor = () => {
  return (
    <section
      id="who-we-help"
      className="py-10 sm:py-12 md:py-14 relative overflow-hidden px-4 sm:px-6 lg:px-8"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-lavender-100/50 via-white to-purple-50/40" />
      <div className="absolute -top-20 right-0 w-72 h-72 bg-lavender-300/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 left-0 w-64 h-64 bg-purple-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease }}
          className="bg-gradient-to-br from-white/95 via-lavender-50/60 to-purple-50/40 rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-lavender-200/50 shadow-soft"
        >
          <div className="text-center mb-6 sm:mb-7">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-gradient-to-r from-lavender-100 to-purple-100 border border-lavender-300/50 mb-4 shadow-soft">
              <UserCheck className="w-4 h-4 text-lavender-600" />
              <span className="text-xs sm:text-sm font-semibold text-lavender-800">Who This Is For</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold mb-2">
              <span className="text-lavender-700">Sound familiar?</span>
            </h2>
            <div className="section-divider mb-3 sm:mb-4" />
            <p className="text-sm sm:text-base text-gray-600 max-w-lg mx-auto leading-relaxed">
              If any of these resonate, you&apos;re in the right place — support is available.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:justify-center gap-2 sm:gap-3 mb-5 sm:mb-6">
            {concerns.map(({ label, tone }, i) => {
              const colors = chipTones[tone]
              return (
                <motion.a
                  key={label}
                  href="#get-help"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-20px' }}
                  transition={{ duration: 0.45, delay: i * 0.04, ease }}
                  className={`concern-chip inline-flex items-center justify-center sm:justify-start px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-full border shadow-soft transition-all duration-300 text-center sm:text-left text-xs sm:text-sm font-semibold select-none ${colors.bg} ${colors.border} ${colors.text} ${colors.hover} active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lavender-400/60`}
                >
                  {label}
                </motion.a>
              )
            })}
          </div>

          <p className="text-center">
            <a
              href="#get-help"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-lavender-600 hover:text-lavender-700 transition-colors group"
            >
              Not sure? Start with a free 15-minute call
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  )
}

export default WhoThisIsFor
