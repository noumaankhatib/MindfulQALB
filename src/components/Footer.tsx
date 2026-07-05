import { Instagram, Linkedin, Calendar, ArrowRight, Phone, Mail } from 'lucide-react'
import { motion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import Logo from './Logo'

const socialLinks = [
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/mindfulqalb',
    icon: Instagram,
    ariaLabel: 'Follow MindfulQalb on Instagram',
    hoverBg: 'hover:bg-gradient-to-br hover:from-purple-600 hover:via-pink-500 hover:to-orange-400',
    hoverShadow: 'hover:shadow-pink-500/40',
    iconColor: 'text-pink-600',
  },
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/in/aqsa-khatib-0a9b6218b',
    icon: Linkedin,
    ariaLabel: 'Connect with Aqsa Khatib on LinkedIn',
    hoverBg: 'hover:bg-[#0A66C2]',
    hoverShadow: 'hover:shadow-blue-500/40',
    iconColor: 'text-[#0A66C2]',
  },
]

type FooterLink = {
  href: string
  label: string
  isRoute?: boolean
  external?: boolean
}

const quickLinks: FooterLink[] = [
  { href: '#services', label: 'Services' },
  { href: '#about', label: 'About Aqsa' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#get-help', label: 'Book a Session' },
]

const resourceLinks: FooterLink[] = [
  { href: '/blog', label: 'Blog', isRoute: true },
  { href: '#faq', label: 'FAQs' },
  { href: '/sitemap.xml', label: 'Sitemap', external: true },
  { href: '/robots.txt', label: 'Robots.txt', external: true },
  { href: '/llms.txt', label: 'LLMs.txt', external: true },
  { href: '/privacy', label: 'Privacy Policy', isRoute: true },
  { href: '/terms', label: 'Terms of Service', isRoute: true },
]

const contactLinks: FooterLink[] = [
  { href: '#get-help', label: 'Get Help Now' },
  { href: 'mailto:mindfulqalb@gmail.com', label: 'mindfulqalb@gmail.com', external: true },
  { href: '#get-help', label: 'Crisis Resources' },
]

const mobileLinks: FooterLink[] = [
  { href: '#services', label: 'Services' },
  { href: '#about', label: 'About' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#get-help', label: 'Book Session' },
  { href: '#faq', label: 'FAQs' },
  { href: '/blog', label: 'Blog', isRoute: true },
  { href: '/privacy', label: 'Privacy', isRoute: true },
  { href: '/terms', label: 'Terms', isRoute: true },
  { href: '/contact', label: 'Contact', isRoute: true },
  { href: '#get-help', label: 'Crisis Helplines' },
]

const DeveloperCredit = ({ className = '' }: { className?: string }) => (
  <p className={`text-gray-400 text-[11px] sm:text-xs leading-relaxed ${className}`}>
    Designed &amp; developed by{' '}
    <a
      href="mailto:noumankhatib@gmail.com"
      className="text-lavender-700 hover:text-lavender-800 transition-colors font-medium"
    >
      Nouman Khatib
    </a>
  </p>
)

const Footer = () => {
  const location = useLocation()
  const isHomePage = location.pathname === '/'

  const renderLink = (link: FooterLink, className = '') => {
    const cls = `text-gray-600 hover:text-lavender-600 transition-colors duration-300 ${className}`

    if (link.external || link.href.startsWith('mailto:')) {
      return (
        <a href={link.href} className={cls}>
          {link.label}
        </a>
      )
    }
    if (link.isRoute) {
      return (
        <Link to={link.href} className={cls}>
          {link.label}
        </Link>
      )
    }
    if (isHomePage) {
      return (
        <a href={link.href} className={cls}>
          {link.label}
        </a>
      )
    }
    return (
      <Link to={`/${link.href}`} className={cls}>
        {link.label}
      </Link>
    )
  }

  return (
    <footer className="relative overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-lavender-400 via-lavender-400 to-accent-400" />

      <div className="bg-gradient-to-b from-white to-cream-50/50 py-8 sm:py-12 md:py-16 px-4 sm:px-6 lg:px-8 pb-28 md:pb-16">
        <div className="max-w-7xl mx-auto">
          {/* Mobile */}
          <div className="md:hidden">
            <div className="text-center mb-5">
              {isHomePage ? (
                <a href="#home" className="inline-block mb-3">
                  <Logo size="md" showText={true} />
                </a>
              ) : (
                <Link to="/" className="inline-block mb-3">
                  <Logo size="md" showText={true} />
                </Link>
              )}
              <p className="text-gray-600 text-xs leading-relaxed max-w-xs mx-auto">
                Licensed online therapy — confidential, evidence-based, English &amp; Hindi.
              </p>
            </div>

            <a
              href={isHomePage ? '#get-help' : '/#get-help'}
              className="btn-primary w-full py-3 text-sm font-medium mb-5"
            >
              <span className="inline-flex items-center justify-center gap-2">
                <Calendar className="w-4 h-4" />
                Book Free Consultation
                <ArrowRight className="w-4 h-4" />
              </span>
            </a>

            <div className="grid grid-cols-2 gap-x-3 gap-y-1 mb-5">
              {mobileLinks.map((link) => (
                <div key={`${link.label}-${link.href}`} className="min-w-0">
                  {renderLink(link, 'block py-2 text-xs font-medium')}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-3 mb-5">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.ariaLabel}
                    whileTap={{ scale: 0.95 }}
                    className={`w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center transition-all duration-300 ${social.hoverBg} ${social.hoverShadow}`}
                  >
                    <Icon className={`w-4 h-4 ${social.iconColor}`} strokeWidth={2} />
                  </motion.a>
                )
              })}
            </div>

            <div className="bg-lavender-50/80 rounded-xl p-3 border border-lavender-100/60 mb-4">
              <p className="text-[11px] text-gray-600 text-center leading-relaxed mb-2">
                Not a crisis service. For emergencies:
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <a
                  href="tel:112"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200/70 text-xs font-semibold text-amber-800"
                >
                  <Phone className="w-3 h-3" />
                  112
                </a>
                <a
                  href="tel:9152987821"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-lavender-200/60 text-xs font-semibold text-lavender-700"
                >
                  iCall 9152987821
                </a>
              </div>
            </div>

            <div className="text-center space-y-1.5">
              <a
                href="mailto:mindfulqalb@gmail.com"
                className="inline-flex items-center gap-1.5 text-xs text-lavender-600 font-medium"
              >
                <Mail className="w-3.5 h-3.5" />
                mindfulqalb@gmail.com
              </a>
              <p className="text-gray-500 text-[11px]">
                © {new Date().getFullYear()} Mindful QALB · Confidential &amp; Ethical Practice
              </p>
              <DeveloperCredit className="mt-2" />
            </div>
          </div>

          {/* Desktop */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            <div>
              {isHomePage ? (
                <a href="#home" className="inline-block mb-5">
                  <Logo size="lg" showText={true} />
                </a>
              ) : (
                <Link to="/" className="inline-block mb-5">
                  <Logo size="lg" showText={true} />
                </Link>
              )}
              <p className="text-gray-600 leading-relaxed text-sm break-words mb-4">
                Evidence-based mental health care for individuals and couples — accessible, human,
                and private.
              </p>
              <a
                href={isHomePage ? '#get-help' : '/#get-help'}
                className="btn-primary px-5 py-2.5 text-sm font-medium"
              >
                <span className="inline-flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Book Free Consultation
                </span>
              </a>
            </div>

            <div>
              <h4 className="font-display text-base font-semibold mb-4 text-gray-800">Quick Links</h4>
              <ul className="space-y-2.5">
                {quickLinks.map((link) => (
                  <li key={link.label}>{renderLink(link, 'text-sm link-underline inline-block')}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-display text-base font-semibold mb-4 text-gray-800">Resources</h4>
              <ul className="space-y-2.5">
                {resourceLinks.map((link) => (
                  <li key={link.label}>{renderLink(link, 'text-sm link-underline inline-block')}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-display text-base font-semibold mb-4 text-gray-800">Contact</h4>
              <ul className="space-y-2.5 mb-4">
                {contactLinks.map((link) => (
                  <li key={link.label}>{renderLink(link, 'text-sm link-underline inline-block')}</li>
                ))}
              </ul>
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
                      className={`group w-11 h-11 rounded-full bg-gray-50 border-2 border-gray-200 flex items-center justify-center transition-all duration-300 hover:border-transparent hover:shadow-lg ${social.hoverBg} ${social.hoverShadow}`}
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
                <span className="font-medium text-pink-700">@mindfulqalb</span>
              </p>
            </div>
          </div>

          <div className="hidden md:block pt-8 border-t border-gray-200/60">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <p className="text-gray-500 text-sm">
                  © {new Date().getFullYear()} Mindful QALB · Confidential &amp; Ethical Practice
                </p>
                <DeveloperCredit className="mt-1.5" />
              </div>
              <div className="flex items-center gap-4 text-sm">
                <Link to="/privacy" className="text-gray-500 hover:text-lavender-600 transition-colors">
                  Privacy Policy
                </Link>
                <span className="text-gray-300">|</span>
                <Link to="/terms" className="text-gray-500 hover:text-lavender-600 transition-colors">
                  Terms of Service
                </Link>
              </div>
              <p className="text-gray-500 text-xs lg:max-w-sm lg:text-right">
                Not a crisis service. Emergencies: call{' '}
                <a href="tel:112" className="text-lavender-600 font-medium">
                  112
                </a>{' '}
                or iCall{' '}
                <a href="tel:9152987821" className="text-lavender-600 font-medium">
                  9152987821
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
