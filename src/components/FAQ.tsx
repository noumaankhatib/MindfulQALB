import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { ChevronDown, HelpCircle } from 'lucide-react'

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs = [
    {
      question: 'Who can benefit from therapy?',
      answer: 'Anyone going through emotional, relational, or life challenges can benefit from therapy. Whether you\'re dealing with anxiety, stress, relationship difficulties, self-esteem issues, life transitions, or simply seeking personal growth—therapy provides a safe space to explore, heal, and grow. You don\'t need to be in crisis to seek support.',
    },
    {
      question: 'Is online therapy effective?',
      answer: 'Yes, research consistently shows that online therapy can be as effective as in-person therapy for many conditions including anxiety, depression, and relationship issues. Online sessions offer the same quality of care with added convenience—you can attend from the comfort of your home, saving time on commute and maintaining privacy.',
    },
    {
      question: 'How long is each session?',
      answer: 'Individual therapy sessions are typically 50-60 minutes long. Couples therapy sessions are 60-75 minutes to allow adequate time for both partners. The initial free consultation is 15-20 minutes to understand your needs and see if we\'re a good fit for working together.',
    },
    {
      question: 'Is therapy confidential?',
      answer: 'Absolutely. Confidentiality is the foundation of our therapeutic relationship. Everything discussed in sessions remains strictly private. I use secure, encrypted platforms for all online sessions. There are only rare legal exceptions (such as imminent harm to self or others) which I\'ll explain during our first session.',
    },
    {
      question: 'Do you work with NRI / international clients?',
      answer: 'Yes, I work with clients across different time zones including NRIs (Non-Resident Indians) and international clients. All sessions are conducted online, making it convenient regardless of your location. We can schedule sessions at times that work for your time zone.',
    },
    {
      question: 'What happens in the first session?',
      answer: 'The first session is about understanding your story and what brings you to therapy. We\'ll discuss your concerns, goals, and what you hope to achieve. I\'ll explain how therapy works, answer your questions, and together we\'ll create a plan tailored to your needs. It\'s also an opportunity for you to see if you feel comfortable working with me.',
    },
    {
      question: 'What types of therapy do you offer?',
      answer: 'I offer individual therapy, couples therapy, and workshops. My approach is eclectic—I use evidence-based methods like CBT (Cognitive Behaviour Therapy), ACT (Acceptance and Commitment Therapy), Solution-Focused Therapy, Gestalt Therapy, and NLP, tailored to what will help you most effectively.',
    },
    {
      question: 'How do I book a session?',
      answer: 'You can book directly through the calendar on this website. Start with a free 15-20 minute consultation to discuss your needs. Once we determine we\'re a good fit, you can schedule your first full session. All bookings require confirmation, and you\'ll receive an email with session details.',
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
