import { Heart, Mail, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'

const Footer = () => {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setSubscribed(true)
      setEmail('')
    }
  }

  const footerLinks = {
    quickLinks: [
      { href: '#mental-health', label: 'Mental Health' },
      { href: '#couples', label: 'Couples & Relationships' },
      { href: '#therapy', label: 'Therapy & Support' },
      { href: '#self-help', label: 'Self-Help Tools' },
    ],
    resources: [
      { href: '#about', label: 'About / Ethics' },
      { href: '#therapists', label: 'For Therapists' },
      { href: '#', label: 'Privacy Policy' },
      { href: '#', label: 'Terms of Service' },
    ],
    contact: [
      { href: '#get-help', label: 'Get Help Now' },
      { href: 'mailto:support@mindfulqalb.com', label: 'support@mindfulqalb.com' },
      { href: '#', label: 'Crisis Resources' },
    ],
  }

  return (
    <footer className="relative overflow-hidden">
      {/* Top gradient border */}
      <div className="h-1 bg-gradient-to-r from-lavender-400 via-lavender-400 to-accent-400" />
      
      <div className="bg-gradient-to-b from-white to-cream-50/50 py-16 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Newsletter Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-lavender-50 to-lavender-50/50 rounded-3xl p-8 md:p-10 mb-16 border border-lavender-100/50 shadow-soft"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h3 className="font-display text-xl md:text-2xl font-semibold text-gray-800 mb-2">
                  Stay Connected
                </h3>
                <p className="text-gray-600 text-sm md:text-base">
                  Receive wellness tips, resources, and updates on new services.
                </p>
              </div>
              {subscribed ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 text-lavender-600 font-medium"
                >
                  <span className="w-6 h-6 rounded-full bg-lavender-100 flex items-center justify-center">✓</span>
                  Thank you for subscribing!
                </motion.div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="flex gap-3 w-full md:w-auto">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="flex-1 md:w-64 px-4 py-3 rounded-xl bg-white/80 backdrop-blur-sm border border-lavender-200/50 focus:border-lavender-400 focus:ring-2 focus:ring-lavender-400/30 outline-none transition-all duration-300 text-gray-800 placeholder-gray-400 text-sm"
                    required
                  />
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-primary px-6 py-3 text-sm flex items-center gap-2"
                  >
                    Subscribe
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </form>
              )}
            </div>
          </motion.div>

          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">
            {/* Brand */}
            <div>
              <a href="#home" className="flex items-center gap-3 mb-5 group">
                <motion.div 
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  className="w-11 h-11 rounded-xl bg-gradient-to-br from-lavender-500 to-lavender-600 flex items-center justify-center shadow-soft"
                >
                  <Heart className="w-6 h-6 text-white" fill="white" />
                </motion.div>
                <span className="font-display text-2xl font-semibold text-gray-800">
                  <span className="text-gradient">Mindful</span>QALB
                </span>
              </a>
              <p className="text-gray-600 leading-relaxed text-sm mb-6">
                Evidence-based mental health care for individuals and couples—accessible, human, and private.
              </p>
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Mail className="w-4 h-4" />
                <a href="mailto:support@mindfulqalb.com" className="hover:text-lavender-600 transition-colors">
                  support@mindfulqalb.com
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-display text-base font-semibold mb-5 text-gray-800">Quick Links</h4>
              <ul className="space-y-3">
                {footerLinks.quickLinks.map((link) => (
                  <li key={link.label}>
                    <a 
                      href={link.href} 
                      className="text-gray-600 hover:text-lavender-600 transition-colors duration-300 text-sm link-underline inline-block"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-display text-base font-semibold mb-5 text-gray-800">Resources</h4>
              <ul className="space-y-3">
                {footerLinks.resources.map((link) => (
                  <li key={link.label}>
                    <a 
                      href={link.href} 
                      className="text-gray-600 hover:text-lavender-600 transition-colors duration-300 text-sm link-underline inline-block"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-display text-base font-semibold mb-5 text-gray-800">Contact</h4>
              <ul className="space-y-3">
                {footerLinks.contact.map((link) => (
                  <li key={link.label}>
                    <a 
                      href={link.href} 
                      className="text-gray-600 hover:text-lavender-600 transition-colors duration-300 text-sm link-underline inline-block"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-gray-200/60">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-center md:text-left">
              <p className="text-gray-500 text-sm">
                © {new Date().getFullYear()} Mindful QALB · Confidential & Ethical Practice
              </p>
              <p className="text-gray-400 text-xs">
                This platform is not a crisis service. For emergencies, call 911 or your local crisis line.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
