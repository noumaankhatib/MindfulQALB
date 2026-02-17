import { Instagram, Linkedin } from 'lucide-react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Logo from './Logo'

// Social media links with actual brand colors
const socialLinks = [
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/mindfulqalb',
    icon: Instagram,
    ariaLabel: 'Follow MindfulQalb on Instagram',
    // Instagram gradient: purple -> pink -> orange
    hoverBg: 'hover:bg-gradient-to-br hover:from-purple-600 hover:via-pink-500 hover:to-orange-400',
    hoverShadow: 'hover:shadow-pink-500/40',
    iconColor: 'text-pink-600',
  },
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/in/aqsa-khatib-0a9b6218b',
    icon: Linkedin,
    ariaLabel: 'Connect with Aqsa Khatib on LinkedIn',
    // LinkedIn blue
    hoverBg: 'hover:bg-[#0A66C2]',
    hoverShadow: 'hover:shadow-blue-500/40',
    iconColor: 'text-[#0A66C2]',
  },
]

const Footer = () => {
  const footerLinks = {
    quickLinks: [
      { href: '#mental-health', label: 'Mental Health' },
      { href: '#couples', label: 'Couples & Relationships' },
      { href: '#therapy', label: 'Therapy & Support' },
      { href: '#self-help', label: 'Self-Help Tools' },
    ],
    resources: [
      { href: '#ethics', label: 'About / Ethics', isExternal: false },
      { href: '#about', label: 'About Aqsa', isExternal: false },
      { href: '#self-help', label: 'Self-Help Tools', isExternal: false },
      { href: '/privacy', label: 'Privacy Policy', isRoute: true },
      { href: '/terms', label: 'Terms of Service', isRoute: true },
    ],
    contact: [
      { href: '#get-help', label: 'Get Help Now' },
      { href: 'mailto:mindfulqalb@gmail.com', label: 'mindfulqalb@gmail.com' },
      { href: '#', label: 'Crisis Resources' },
    ],
  }

  return (
    <footer className="relative overflow-hidden">
      {/* Top gradient border */}
      <div className="h-1 bg-gradient-to-r from-lavender-400 via-lavender-400 to-accent-400" />
      
      <div className="bg-gradient-to-b from-white to-cream-50/50 py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Newsletter Section */}
          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-lavender-50 to-lavender-50/50 rounded-3xl p-6 md:p-8 mb-10 border border-lavender-100/50 shadow-soft"
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
          </motion.div> */}

          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            {/* Brand */}
            <div>
              <a href="#home" className="inline-block mb-5">
                <Logo size="lg" showText={true} />
              </a>
              <p className="text-gray-600 leading-relaxed text-sm">
                Evidence-based mental health care for individuals and couples—accessible, human, and private.
              </p>
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
                    {link.isRoute ? (
                      <Link 
                        to={link.href} 
                        className="text-gray-600 hover:text-lavender-600 transition-colors duration-300 text-sm link-underline inline-block"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a 
                        href={link.href} 
                        className="text-gray-600 hover:text-lavender-600 transition-colors duration-300 text-sm link-underline inline-block"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-display text-base font-semibold mb-5 text-gray-800">Contact</h4>
              <ul className="space-y-3 mb-5">
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
              
              {/* Social Media Icons */}
              <div className="flex items-center gap-3">
                {socialLinks.map((social) => {
                  const Icon = social.icon
                  return (
                    <motion.a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.ariaLabel}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className={`group relative w-11 h-11 rounded-full bg-gray-50 border-2 border-gray-200 flex items-center justify-center transition-all duration-300 ease-out hover:border-transparent hover:shadow-lg ${social.hoverBg} ${social.hoverShadow} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lavender-500`}
                    >
                      <Icon 
                        className={`w-5 h-5 ${social.iconColor} transition-all duration-300 group-hover:text-white`}
                        strokeWidth={2}
                      />
                    </motion.a>
                  )
                })}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                <span className="font-medium text-pink-600">@mindfulqalb</span>
              </p>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-gray-200/60">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-center md:text-left">
              {/* Copyright */}
              <p className="text-gray-500 text-sm">
                © {new Date().getFullYear()} Mindful QALB · Confidential & Ethical Practice
              </p>
              
              {/* Legal Links - Industry Standard Placement */}
              <div className="flex items-center justify-center gap-4 text-sm">
                <Link 
                  to="/privacy" 
                  className="text-gray-500 hover:text-lavender-600 transition-colors"
                >
                  Privacy Policy
                </Link>
                <span className="text-gray-300">|</span>
                <Link 
                  to="/terms" 
                  className="text-gray-500 hover:text-lavender-600 transition-colors"
                >
                  Terms of Service
                </Link>
              </div>
              
              {/* Disclaimer */}
              <p className="text-gray-400 text-xs max-w-sm">
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
