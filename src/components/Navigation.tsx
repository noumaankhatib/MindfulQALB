import { useState, useEffect, useRef } from 'react'
import { Heart, ChevronDown, Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// Navigation data structure with dropdowns
interface DropdownItem {
  label: string
  href: string
  description?: string
  icon?: string
}

interface NavItem {
  label: string
  href?: string
  dropdown?: DropdownItem[]
}

const navItems: NavItem[] = [
  { label: 'Home', href: '#home' },
  {
    label: 'Services',
    dropdown: [
      { label: 'Mental Health Support', href: '#mental-health', description: 'Comprehensive mental wellness care', icon: '🧠' },
      { label: 'Couples & Relationships', href: '#couples', description: 'Strengthen your bond', icon: '💕' },
      { label: 'Individual Therapy', href: '#therapy', description: 'Personal growth journey', icon: '🌱' },
      { label: 'Family Counseling', href: '#family', description: 'Heal together as a family', icon: '👨‍👩‍👧' },
      { label: 'Islamic Psychology', href: '#islamic', description: 'Faith-integrated approach', icon: '🌙' },
      { label: 'Online Consultation', href: '#get-help', description: 'Therapy from anywhere', icon: '💻' },
    ],
  },
  {
    label: 'Therapy',
    dropdown: [
      { label: 'Anxiety & Stress', href: '#mental-health', description: 'Find calm and peace', icon: '😌' },
      { label: 'Depression', href: '#mental-health', description: 'Rediscover hope', icon: '🌤️' },
      { label: 'Trauma & PTSD', href: '#mental-health', description: 'Heal from past wounds', icon: '💪' },
      { label: 'Marriage Counseling', href: '#couples', description: 'Rebuild connection', icon: '💑' },
      { label: 'Addiction Support', href: '#mental-health', description: 'Path to recovery', icon: '🔄' },
      { label: 'Grief & Loss', href: '#mental-health', description: 'Navigate loss with support', icon: '🕊️' },
    ],
  },
  {
    label: 'Resources',
    dropdown: [
      { label: 'Self-Help Tools', href: '#self-help', description: 'Empower your journey', icon: '🛠️' },
      { label: 'Guided Exercises', href: '#self-help', description: 'Practical wellness activities', icon: '🧘' },
      { label: 'Articles & Blogs', href: '#self-help', description: 'Insights and education', icon: '📚' },
      { label: 'Assessments', href: '#self-help', description: 'Understand yourself better', icon: '📋' },
      { label: 'Support Groups', href: '#groups', description: 'Connect with others', icon: '👥' },
    ],
  },
  {
    label: 'About',
    dropdown: [
      { label: 'Our Approach', href: '#about', description: 'Evidence-based care', icon: '🎯' },
      { label: 'Meet Aqsa Khatib', href: '#about', description: 'Your therapist', icon: '👩‍⚕️' },
      { label: 'Ethics & Privacy', href: '#ethics', description: 'Your trust matters', icon: '🔒' },
      { label: 'FAQs', href: '#faq', description: 'Common questions', icon: '❓' },
      { label: 'Contact Us', href: '#get-help', description: 'Get in touch', icon: '📧' },
    ],
  },
]

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [mobileOpenSection, setMobileOpenSection] = useState<string | null>(null)
  const navRef = useRef<HTMLElement>(null)

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false)
        setMobileOpenSection(null)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleDropdownToggle = (label: string) => {
    setOpenDropdown(openDropdown === label ? null : label)
  }

  const handleMobileSectionToggle = (label: string) => {
    setMobileOpenSection(mobileOpenSection === label ? null : label)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
    setMobileOpenSection(null)
  }

  return (
    <nav 
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/90 backdrop-blur-xl shadow-lg border-b border-lavender-100/50' 
          : 'bg-white/70 backdrop-blur-lg'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a 
            href="#home" 
            className="flex items-center gap-3 group"
            onClick={() => closeMobileMenu()}
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-lavender-600 to-lavender-700 flex items-center justify-center shadow-lg shadow-lavender-500/25 group-hover:shadow-lavender-500/40 transition-all duration-300">
              <Heart className="w-6 h-6 text-white" fill="white" />
            </div>
            <span className="font-body text-2xl font-semibold text-gray-800">
              <span className="bg-gradient-to-r from-lavender-700 to-lavender-600 bg-clip-text text-transparent">Mindful</span>QALB
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <div key={item.label} className="relative">
                {item.dropdown ? (
                  <>
                    <button
                      onClick={() => handleDropdownToggle(item.label)}
                      onMouseEnter={() => setOpenDropdown(item.label)}
                      className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                        openDropdown === item.label 
                          ? 'bg-lavender-100 text-lavender-700' 
                          : 'text-gray-700 hover:bg-lavender-50 hover:text-lavender-600'
                      }`}
                    >
                      {item.label}
                      <ChevronDown 
                        className={`w-4 h-4 transition-transform duration-200 ${
                          openDropdown === item.label ? 'rotate-180' : ''
                        }`} 
                      />
                    </button>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {openDropdown === item.label && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          onMouseEnter={() => setOpenDropdown(item.label)}
                          onMouseLeave={() => setOpenDropdown(null)}
                          className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl shadow-lavender-500/15 border border-lavender-100 overflow-hidden z-50"
                        >
                          <div className="p-2">
                            {item.dropdown.map((subItem, index) => (
                              <a
                                key={index}
                                href={subItem.href}
                                onClick={() => setOpenDropdown(null)}
                                className="flex items-start gap-3 px-4 py-3 rounded-xl hover:bg-lavender-50 transition-colors duration-150 group"
                              >
                                <span className="text-xl mt-0.5">{subItem.icon}</span>
                                <div>
                                  <span className="block font-medium text-gray-800 group-hover:text-lavender-700 transition-colors">
                                    {subItem.label}
                                  </span>
                                  {subItem.description && (
                                    <span className="block text-xs text-gray-500 mt-0.5 group-hover:text-lavender-600">
                                      {subItem.description}
                                    </span>
                                  )}
                                </div>
                              </a>
                            ))}
                          </div>
                          
                          {/* Dropdown Footer CTA */}
                          <div className="bg-lavender-50/50 p-3 border-t border-lavender-100">
                            <a 
                              href="#get-help"
                              onClick={() => setOpenDropdown(null)}
                              className="block text-center text-sm font-medium text-lavender-700 hover:text-lavender-800 transition-colors"
                            >
                              View All {item.label} →
                            </a>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <a
                    href={item.href}
                    className="px-4 py-2.5 rounded-xl font-medium text-sm text-gray-700 hover:bg-lavender-50 hover:text-lavender-600 transition-all duration-200"
                  >
                    {item.label}
                  </a>
                )}
              </div>
            ))}
            
            {/* CTA Button */}
            <a
              href="#get-help"
              className="ml-4 px-6 py-2.5 rounded-full font-medium text-sm text-white bg-gradient-to-r from-lavender-600 to-lavender-700 shadow-lg shadow-lavender-500/25 hover:shadow-lavender-500/40 hover:-translate-y-0.5 transition-all duration-300"
            >
              Book a Session
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2.5 rounded-xl hover:bg-lavender-50 transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden overflow-hidden border-t border-lavender-100"
            >
              <div className="py-4 space-y-1">
                {navItems.map((item) => (
                  <div key={item.label}>
                    {item.dropdown ? (
                      <>
                        <button
                          onClick={() => handleMobileSectionToggle(item.label)}
                          className="w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium text-gray-700 hover:bg-lavender-50 transition-colors"
                        >
                          {item.label}
                          <ChevronDown 
                            className={`w-5 h-5 transition-transform duration-200 ${
                              mobileOpenSection === item.label ? 'rotate-180' : ''
                            }`} 
                          />
                        </button>
                        
                        <AnimatePresence>
                          {mobileOpenSection === item.label && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="pl-4 py-2 space-y-1">
                                {item.dropdown.map((subItem, index) => (
                                  <a
                                    key={index}
                                    href={subItem.href}
                                    onClick={closeMobileMenu}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-lavender-50 hover:text-lavender-700 transition-colors"
                                  >
                                    <span className="text-lg">{subItem.icon}</span>
                                    <div>
                                      <span className="block font-medium text-sm">{subItem.label}</span>
                                      <span className="block text-xs text-gray-500">{subItem.description}</span>
                                    </div>
                                  </a>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      <a
                        href={item.href}
                        onClick={closeMobileMenu}
                        className="block px-4 py-3 rounded-xl font-medium text-gray-700 hover:bg-lavender-50 transition-colors"
                      >
                        {item.label}
                      </a>
                    )}
                  </div>
                ))}
                
                {/* Mobile CTA */}
                <div className="pt-4 px-4">
                  <a
                    href="#get-help"
                    onClick={closeMobileMenu}
                    className="block w-full text-center px-6 py-3 rounded-xl font-medium text-white bg-gradient-to-r from-lavender-600 to-lavender-700 shadow-lg shadow-lavender-500/25"
                  >
                    Book a Session
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}

export default Navigation
