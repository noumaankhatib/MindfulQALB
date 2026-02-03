import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { ChevronDown, HelpCircle } from 'lucide-react'

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs = [
    {
      question: 'What types of therapy do you offer?',
      answer: 'We offer individual therapy, couples therapy, support groups, and self-help tools. All services are evidence-based and provided by licensed therapists.',
    },
    {
      question: 'Is online therapy effective?',
      answer: 'Yes, research shows that online therapy can be as effective as in-person therapy for many conditions. We use secure, HIPAA-compliant platforms to ensure privacy and confidentiality.',
    },
    {
      question: 'How do I get started?',
      answer: 'You can request a session through our booking form, or use our quick access buttons to find immediate support. We\'ll match you with a therapist who specializes in your needs.',
    },
    {
      question: 'What is your approach to couples therapy?',
      answer: 'We use evidence-based approaches including EFT (Emotionally Focused Therapy), Gottman Method, and trauma-informed care. Our therapists are trained to work with all relationship types and orientations.',
    },
    {
      question: 'Is my information confidential?',
      answer: 'Absolutely. We use end-to-end encryption, HIPAA-compliant platforms, and strict confidentiality protocols. Your privacy is our top priority.',
    },
    {
      question: 'Do you accept insurance?',
      answer: 'We work with various insurance providers. Please contact us to verify your coverage. We also offer sliding scale options for those who qualify.',
    },
    {
      question: 'What if I need immediate help?',
      answer: 'If you are experiencing a mental health emergency, please call 911 or your local crisis hotline immediately. Our platform is not a crisis service, but we can help connect you with ongoing support.',
    },
  ]

  return (
    <section className="py-28 md:py-36 relative overflow-hidden px-4 sm:px-6 lg:px-8">
      {/* Background */}
      <div className="absolute inset-0 section-gradient-light" />
      
      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center mb-16"
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
          <div className="section-divider" />
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
      </div>
    </section>
  )
}

export default FAQ
