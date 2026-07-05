import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { ChevronDown, HelpCircle } from 'lucide-react'

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs = [
    {
      question: 'How do I book a session?',
      answer: 'Book through the calendar on this page. Start with a free 15-minute consultation — no commitment. Once we confirm we\'re a good fit, schedule your first full session.',
    },
    {
      question: 'How long is each session?',
      answer: 'Individual sessions are 30–60 minutes depending on format (chat, audio, or video). Couples sessions are 90 minutes. The free consultation is 15 minutes.',
    },
    {
      question: 'Is therapy confidential?',
      answer: 'Yes. Everything discussed stays private. Sessions use secure, encrypted platforms. Rare legal exceptions (imminent harm) are explained in your first session.',
    },
    {
      question: 'Is online therapy effective?',
      answer: 'Research shows online therapy works as well as in-person for anxiety, depression, and relationship issues — with the added comfort and privacy of home.',
    },
    {
      question: 'Do you work with international clients?',
      answer: 'Yes. All sessions are online, so location doesn\'t matter. We schedule at times that work for your time zone, including NRIs and clients abroad.',
    },
    {
      question: 'What happens in the first session?',
      answer: 'We discuss what brings you to therapy, your goals, and how sessions work. You\'ll receive a consent form beforehand. It\'s also a chance to see if you feel comfortable working together.',
    },
    {
      question: 'Can I choose video, audio, or chat?',
      answer: 'Yes. Individual sessions are available as chat (30 min), audio (45 min), or video (60 min). Couples sessions are video-only. Pick the format that feels most comfortable for you.',
    },
  ]

  return (
    <section id="faq" className="py-16 md:py-20 lg:py-24 relative overflow-hidden px-4 sm:px-6 lg:px-8">
      {/* Background */}
      <div className="absolute inset-0 section-gradient-light" />
      
      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center mb-10"
        >
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-lavender-100/80 mb-6 shadow-soft"
          >
            <HelpCircle className="w-7 h-7 text-lavender-600" />
          </motion.div>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-800 mb-5">
            Frequently Asked Questions
          </h2>
          <div className="section-divider mb-6" />
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get answers to common questions about therapy, sessions, and how I can help you.
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: index * 0.05, ease: [0.25, 0.1, 0.25, 1] }}
              className={`bg-gradient-to-br from-white/95 to-lavender-50/50 rounded-2xl shadow-soft overflow-hidden border transition-all duration-400 ${
                openIndex === index ? 'border-lavender-200/60 shadow-gentle' : 'border-white/60'
              }`}
            >
              <button
                className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 hover:bg-lavender-50/30 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-lavender-500/50 focus:ring-inset rounded-2xl"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                aria-expanded={openIndex === index}
              >
                <span className="font-semibold text-gray-800 text-base md:text-lg">
                  {faq.question}
                </span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0"
                >
                  <ChevronDown className="w-5 h-5 text-lavender-600" />
                </motion.div>
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-5 pt-0">
                      <div className="h-px w-full bg-gradient-to-r from-lavender-200/50 via-lavender-200/30 to-transparent mb-4" />
                      <p className="text-gray-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* CTA after FAQs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center mt-12"
        >
          <p className="text-gray-600 mb-4">Still have questions?</p>
          <motion.a
            href="#get-help"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="btn-primary inline-flex items-center gap-2"
          >
            Book a Free Consultation
          </motion.a>
        </motion.div>
      </div>
    </section>
  )
}

export default FAQ
