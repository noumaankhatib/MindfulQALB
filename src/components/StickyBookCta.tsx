import { motion } from 'framer-motion'
import { Calendar, ArrowRight } from 'lucide-react'

/** Fixed bottom bar on mobile — visible after scrolling past hero */
const StickyBookCta = () => {
  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 1, duration: 0.4 }}
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden px-4 pb-4 pt-2 pointer-events-none"
      aria-hidden={false}
    >
      <div
        className="pointer-events-auto mx-auto max-w-lg rounded-2xl border border-lavender-200/80 bg-white/95 backdrop-blur-md shadow-lg shadow-lavender-500/10 px-4 py-3 flex items-center justify-between gap-3"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      >
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">Free 15-min consultation</p>
          <p className="text-xs text-gray-500">No commitment · Confidential</p>
        </div>
        <a
          href="#get-help"
          className="btn-primary shrink-0 px-4 py-2.5 text-sm font-medium"
        >
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            Book
            <ArrowRight className="w-4 h-4" />
          </span>
        </a>
      </div>
    </motion.div>
  )
}

export default StickyBookCta
