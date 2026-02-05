import { motion } from 'framer-motion'
import { Check, Heart, Shield, AlertCircle } from 'lucide-react'

const AboutEthics = () => {
  const values = [
    'Evidence-based care',
    'Privacy and confidentiality',
    'Ethical, non-exploitative practices',
    'Accessibility and inclusivity',
    'Transparency and trust',
  ]

  return (
    <section id="ethics" className="py-16 md:py-20 lg:py-24 relative overflow-hidden px-4 sm:px-6 lg:px-8">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-lavender-50/20 to-white" />
      
      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center mb-10"
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-800 mb-5">
            About / Ethics
          </h2>
          <div className="section-divider" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
          className="bg-gradient-to-br from-white/95 to-lavender-50/80 rounded-3xl p-8 md:p-12 border border-lavender-100/50 shadow-soft space-y-10"
        >
          {/* Mission */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-10 h-10 rounded-xl bg-lavender-100/80 flex items-center justify-center shadow-soft"
              >
                <Heart className="w-5 h-5 text-lavender-600" />
              </motion.div>
              <h3 className="font-display text-xl md:text-2xl font-semibold text-gray-800">
                Our Mission
              </h3>
            </div>
            <p className="text-gray-600 leading-relaxed pl-13 md:pl-0">
              We are a mental health platform that educates, supports, and connects. We're not just a content site—we're a care ecosystem built on evidence-based practices, ethical standards, and genuine human connection.
            </p>
          </div>

          {/* Values */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-10 h-10 rounded-xl bg-lavender-100/80 flex items-center justify-center shadow-soft"
              >
                <Shield className="w-5 h-5 text-lavender-600" />
              </motion.div>
              <h3 className="font-display text-xl md:text-2xl font-semibold text-gray-800">
                Our Values
              </h3>
            </div>
            <ul className="space-y-3 pl-13 md:pl-0">
              {values.map((value, index) => (
                <motion.li 
                  key={value} 
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="flex items-center gap-3 text-gray-600"
                >
                  <span className="w-6 h-6 rounded-full bg-lavender-100 flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-lavender-600" />
                  </span>
                  {value}
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Disclaimers */}
          <div className="bg-gradient-to-br from-lavender-50/80 to-cream-50/50 rounded-2xl p-6 md:p-8 border border-lavender-100/50">
            <div className="flex items-center gap-3 mb-5">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-10 h-10 rounded-xl bg-lavender-100/80 flex items-center justify-center shadow-soft"
              >
                <AlertCircle className="w-5 h-5 text-lavender-600" />
              </motion.div>
              <h3 className="font-display text-xl font-semibold text-gray-800">
                Important Disclaimers
              </h3>
            </div>
            <div className="space-y-4 text-gray-600 pl-13 md:pl-0">
              <p className="leading-relaxed">
                <strong className="text-gray-800">This platform is not a crisis service.</strong> If you are experiencing a mental health emergency, please contact your local emergency services or crisis hotline immediately.
              </p>
              <p className="leading-relaxed">
                <strong className="text-gray-800">No AI pretending to be a therapist.</strong> All therapy is provided by licensed human therapists.
              </p>
              <p className="leading-relaxed">
                <strong className="text-gray-800">Self-help tools complement but never replace therapy.</strong> Always seek professional help for serious concerns.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default AboutEthics
