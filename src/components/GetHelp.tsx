import { motion } from 'framer-motion'
import { useState } from 'react'
import { Send, Phone, MessageCircle, AlertTriangle, ExternalLink, Loader2 } from 'lucide-react'

const GetHelp = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    sessionType: '',
    concern: '',
    privacy: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    console.log('Form submitted:', formData)
    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  const crisisResources = [
    {
      title: 'iCall - TISS Helpline',
      contact: '9152987821',
      availability: 'Mon-Sat, 8 AM - 10 PM',
      icon: Phone,
    },
    {
      title: 'Vandrevala Foundation',
      contact: '1860-2662-345',
      availability: 'Available 24/7 (Hindi, English)',
      icon: MessageCircle,
    },
    {
      title: 'NIMHANS Helpline',
      contact: '080-46110007',
      availability: 'Available 24/7',
      icon: Phone,
    },
    {
      title: 'Emergency Services',
      contact: '112',
      availability: 'India Emergency Number',
      icon: AlertTriangle,
    },
  ]

  return (
    <section id="get-help" className="py-28 md:py-36 relative overflow-hidden px-4 sm:px-6 lg:px-8">
      {/* Background */}
      <div className="absolute inset-0 section-gradient-cream" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center mb-20"
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-800 mb-5">
            Get Help Now
          </h2>
          <div className="section-divider mb-6" />
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Request a session or reach out for immediate support.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Booking Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
            className="bg-gradient-to-br from-white/95 to-lavender-50/80 rounded-3xl p-8 md:p-10 border border-lavender-100/50 shadow-soft"
          >
            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 rounded-full bg-lavender-100 flex items-center justify-center mx-auto mb-6">
                  <Send className="w-8 h-8 text-lavender-600" />
                </div>
                <h3 className="font-display text-2xl font-semibold text-gray-800 mb-3">
                  Request Received!
                </h3>
                <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                  Thank you for reaching out. We'll be in touch within 24-48 hours to schedule your session.
                </p>
                <button
                  onClick={() => {
                    setIsSubmitted(false)
                    setFormData({ name: '', email: '', phone: '', sessionType: '', concern: '', privacy: false })
                  }}
                  className="text-lavender-600 hover:text-lavender-700 font-medium text-sm"
                >
                  Submit another request
                </button>
              </motion.div>
            ) : (
              <>
                <h3 className="font-display text-xl md:text-2xl font-semibold text-gray-800 mb-6">
                  Request a Session
                </h3>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Name
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white/80 backdrop-blur-sm border border-lavender-200/50 focus:border-lavender-400 focus:ring-2 focus:ring-lavender-400/30 outline-none transition-all duration-300 text-gray-800 placeholder-gray-400"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white/80 backdrop-blur-sm border border-lavender-200/50 focus:border-lavender-400 focus:ring-2 focus:ring-lavender-400/30 outline-none transition-all duration-300 text-gray-800 placeholder-gray-400"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number <span className="text-gray-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="tel"
                        className="w-full px-4 py-3 rounded-xl bg-white/80 backdrop-blur-sm border border-lavender-200/50 focus:border-lavender-400 focus:ring-2 focus:ring-lavender-400/30 outline-none transition-all duration-300 text-gray-800 placeholder-gray-400"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Session Type
                      </label>
                      <select
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white/80 backdrop-blur-sm border border-lavender-200/50 focus:border-lavender-400 focus:ring-2 focus:ring-lavender-400/30 outline-none transition-all duration-300 text-gray-800 appearance-none cursor-pointer"
                        value={formData.sessionType}
                        onChange={(e) => setFormData({ ...formData, sessionType: e.target.value })}
                      >
                        <option value="">Select session type</option>
                        <option>Individual Therapy</option>
                        <option>Couples Therapy</option>
                        <option>Family Counseling</option>
                        <option>Islamic Psychology</option>
                        <option>Support Group</option>
                        <option>Not Sure - Need Guidance</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Briefly describe your concern
                    </label>
                    <textarea
                      rows={4}
                        className="w-full px-4 py-3 rounded-xl bg-white/80 backdrop-blur-sm border border-lavender-200/50 focus:border-lavender-400 focus:ring-2 focus:ring-lavender-400/30 outline-none transition-all duration-300 text-gray-800 placeholder-gray-400 resize-none"
                      value={formData.concern}
                      onChange={(e) => setFormData({ ...formData, concern: e.target.value })}
                      placeholder="Tell us what brings you here..."
                    ></textarea>
                  </div>
                  <div>
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        required
                        className="w-5 h-5 rounded border-lavender-300 text-lavender-600 focus:ring-lavender-500/50 mt-0.5 cursor-pointer"
                        checked={formData.privacy}
                        onChange={(e) => setFormData({ ...formData, privacy: e.target.checked })}
                      />
                      <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                        I agree to the privacy policy and understand this is not a crisis service
                      </span>
                    </label>
                  </div>
                  <motion.button 
                    type="submit" 
                    disabled={isSubmitting}
                    whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                    whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                    className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send Request
                      </>
                    )}
                  </motion.button>
                </form>
                <p className="text-xs text-gray-500 mt-5 text-center">
                  All sessions are private, confidential, and conducted online. For emergencies, call 112 or your local crisis line.
                </p>
              </>
            )}
          </motion.div>

          {/* Crisis Resources */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
            className="bg-gradient-to-br from-lavender-50/80 to-cream-50/60 rounded-3xl p-8 md:p-10 border border-lavender-100/50 shadow-soft"
          >
            <div className="flex items-center gap-3 mb-8">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-12 h-12 rounded-xl bg-lavender-100/80 flex items-center justify-center shadow-soft"
              >
                <Phone className="w-6 h-6 text-lavender-600" />
              </motion.div>
              <h3 className="font-display text-xl md:text-2xl font-semibold text-gray-800">
                Crisis Resources
              </h3>
            </div>
            
            <div className="space-y-4">
              {crisisResources.map((resource, index) => {
                const Icon = resource.icon
                return (
                  <motion.div
                    key={resource.title}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ x: 4 }}
                    className="flex items-start gap-4 p-5 bg-white/70 backdrop-blur-sm rounded-2xl border border-white/60 shadow-soft hover:shadow-gentle transition-all duration-300"
                  >
                    <div className="w-10 h-10 rounded-xl bg-lavender-100/80 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-lavender-600" />
                    </div>
                    <div>
                      <strong className="text-base md:text-lg text-gray-800 block mb-1">
                        {resource.title}
                      </strong>
                      <p className="text-lavender-600 font-semibold mb-0.5">{resource.contact}</p>
                      <p className="text-gray-500 text-sm">{resource.availability}</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            <div className="mt-6 p-5 bg-white/70 backdrop-blur-sm rounded-2xl border border-white/60">
              <strong className="text-base md:text-lg text-gray-800 block mb-2">
                Additional Resources
              </strong>
              <p className="text-gray-600 text-sm">
                Find more mental health resources at{' '}
                <a 
                  href="https://www.thelivelovelaughfoundation.org" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-lavender-600 hover:text-lavender-700 font-medium inline-flex items-center gap-1 transition-colors"
                >
                  The Live Love Laugh Foundation
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default GetHelp
