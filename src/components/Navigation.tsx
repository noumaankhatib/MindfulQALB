import { useState, useEffect, useRef, useCallback } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { ChevronDown, Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Logo from './Logo'
import { AuthModal, UserMenu } from './auth'

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
      { label: 'Holistic Wellness', href: '#holistic', description: 'Mind, body & spirit healing', icon: '🌿' },
      { label: 'Online Consultation', href: '#get-help', description: 'Therapy from anywhere', icon: '💻' },
    ],
  },
  {
    label: 'Approach',
    href: '#approach',
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
      { label: 'Therapeutic Approach', href: '#approach', description: 'Evidence-based methods', icon: '🎯' },
      { label: 'Meet Aqsa Khatib', href: '#about', description: 'Your therapist', icon: '👩‍⚕️' },
      { label: 'Ethics & Privacy', href: '#ethics', description: 'Your trust matters', icon: '🔒' },
      { label: 'FAQs', href: '#faq', description: 'Common questions', icon: '❓' },
      { label: 'Contact Me', href: '#get-help', description: 'Get in touch', icon: '📧' },
    ],
  },
]

// Sections to track for active highlighting
const sectionIds = ['home', 'about', 'approach', 'mental-health', 'couples', 'family', 'holistic', 'self-help', 'groups', 'get-help', 'ethics', 'faq']

const Navigation = () => {
  const location = useLocation()
  const isHomePage = location.pathname === '/'
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [mobileOpenSection, setMobileOpenSection] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<string>('home')
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)

  // Smooth scroll to section (only on home page where sections exist)
  const scrollToSection = useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!isHomePage) {
      // On other pages, let the link navigate to /#section (no preventDefault)
      return
    }
    e.preventDefault()
    const targetId = href.replace('#', '')
    const element = document.getElementById(targetId)
    
    if (element) {
      const navHeight = 80 // Account for fixed nav
      const elementPosition = element.getBoundingClientRect().top + window.scrollY
      const offsetPosition = elementPosition - navHeight

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
      
      window.history.pushState(null, '', href)
      setActiveSection(targetId)
    }
    
    setOpenDropdown(null)
    closeMobileMenu()
  }, [isHomePage])

  // Handle scroll and active section detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
      
      // Detect active section
      const scrollPosition = window.scrollY + 150 // Offset for detection
      
      for (const sectionId of sectionIds) {
        const element = document.getElementById(sectionId)
        if (element) {
          const { offsetTop, offsetHeight } = element
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(sectionId)
            break
          }
        }
      }
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
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          {isHomePage ? (
            <a
              href="#home"
              className="flex items-center group"
              onClick={(e) => { scrollToSection(e, '#home'); closeMobileMenu(); }}
            >
              <Logo size="md" showText={true} />
            </a>
          ) : (
            <Link to="/" className="flex items-center group" onClick={() => closeMobileMenu()}>
              <Logo size="md" showText={true} />
            </Link>
          )}

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1 flex-1 justify-end">
            {navItems.map((item) => {
              // Check if this nav item or any of its dropdown items match the active section
              const isActive = item.href 
                ? activeSection === item.href.replace('#', '')
                : item.dropdown?.some(sub => activeSection === sub.href.replace('#', ''))
              
              return (
                <div key={item.label} className="relative">
                  {item.dropdown ? (
                    <>
                      <button
                        onClick={() => handleDropdownToggle(item.label)}
                        onMouseEnter={() => setOpenDropdown(item.label)}
                        className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                          openDropdown === item.label 
                            ? 'bg-lavender-100 text-lavender-700' 
                            : isActive
                            ? 'bg-lavender-50 text-lavender-700'
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
                              {item.dropdown.map((subItem, index) => {
                                const isSubActive = activeSection === subItem.href.replace('#', '')
                                return (
                                  <Link
                                    key={index}
                                    to={isHomePage ? subItem.href : `/${subItem.href}`}
                                    onClick={(e) => {
                                      scrollToSection(e, subItem.href);
                                      if (!isHomePage) closeMobileMenu();
                                    }}
                                    className={`flex items-start gap-3 px-4 py-3 rounded-xl transition-colors duration-150 group ${
                                      isSubActive ? 'bg-lavender-100' : 'hover:bg-lavender-50'
                                    }`}
                                  >
                                    <span className="text-xl mt-0.5">{subItem.icon}</span>
                                    <div>
                                      <span className={`block font-medium transition-colors ${
                                        isSubActive ? 'text-lavender-700' : 'text-gray-800 group-hover:text-lavender-700'
                                      }`}>
                                        {subItem.label}
                                      </span>
                                      {subItem.description && (
                                        <span className={`block text-xs mt-0.5 ${
                                          isSubActive ? 'text-lavender-600' : 'text-gray-500 group-hover:text-lavender-600'
                                        }`}>
                                          {subItem.description}
                                        </span>
                                      )}
                                    </div>
                                  </Link>
                                )
                              })}
                            </div>
                            
                            {/* Dropdown Footer CTA */}
                            <div className="bg-lavender-50/50 p-3 border-t border-lavender-100">
                              <Link
                                to={isHomePage ? '#get-help' : '/#get-help'}
                                onClick={(e) => scrollToSection(e, '#get-help')}
                                className="block text-center text-sm font-medium text-lavender-700 hover:text-lavender-800 transition-colors"
                              >
                                View All {item.label} →
                              </Link>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <Link
                      to={isHomePage ? (item.href ?? '/') : `/${item.href ?? ''}`}
                      onClick={(e) => scrollToSection(e, item.href!)}
                      className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                        isActive
                          ? 'bg-lavender-100 text-lavender-700'
                          : 'text-gray-700 hover:bg-lavender-50 hover:text-lavender-600'
                      }`}
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              )
            })}
            
            {/* CTA Button - Book Your Session section on homepage */}
            <Link
              to="/#get-help"
              onClick={closeMobileMenu}
              className="ml-4 px-6 py-2.5 rounded-full font-medium text-sm text-white bg-gradient-to-r from-lavender-600 to-lavender-700 shadow-lg shadow-lavender-500/25 hover:shadow-lavender-500/40 hover:-translate-y-0.5 transition-all duration-300"
            >
              Book a Session
            </Link>
            
            {/* User Menu / Auth - Desktop */}
            <div className="ml-3">
              <UserMenu onOpenAuth={() => setIsAuthModalOpen(true)} />
            </div>
          </div>

          {/* Sign In Button - Always visible on all screen sizes */}
          <div className="flex items-center gap-2 lg:hidden">
            <UserMenu onOpenAuth={() => setIsAuthModalOpen(true)} />
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 rounded-xl hover:bg-lavender-50 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>
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
                {navItems.map((item) => {
                  const isActive = item.href 
                    ? activeSection === item.href.replace('#', '')
                    : item.dropdown?.some(sub => activeSection === sub.href.replace('#', ''))
                  
                  return (
                    <div key={item.label}>
                      {item.dropdown ? (
                        <>
                          <button
                            onClick={() => handleMobileSectionToggle(item.label)}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-colors ${
                              isActive ? 'bg-lavender-50 text-lavender-700' : 'text-gray-700 hover:bg-lavender-50'
                            }`}
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
                                  {item.dropdown.map((subItem, index) => {
                                    const isSubActive = activeSection === subItem.href.replace('#', '')
                                    return (
                                      <Link
                                        key={index}
                                        to={isHomePage ? subItem.href : `/${subItem.href}`}
                                        onClick={(e) => {
                                          scrollToSection(e, subItem.href);
                                          if (!isHomePage) closeMobileMenu();
                                        }}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                                          isSubActive 
                                            ? 'bg-lavender-100 text-lavender-700' 
                                            : 'text-gray-600 hover:bg-lavender-50 hover:text-lavender-700'
                                        }`}
                                      >
                                        <span className="text-lg">{subItem.icon}</span>
                                        <div>
                                          <span className="block font-medium text-sm">{subItem.label}</span>
                                          <span className={`block text-xs ${isSubActive ? 'text-lavender-600' : 'text-gray-500'}`}>
                                            {subItem.description}
                                          </span>
                                        </div>
                                      </Link>
                                    )
                                  })}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </>
                      ) : (
                        <Link
                          to={isHomePage ? (item.href ?? '/') : `/${item.href ?? ''}`}
                          onClick={(e) => {
                            scrollToSection(e, item.href!);
                            if (!isHomePage) closeMobileMenu();
                          }}
                          className={`block px-4 py-3 rounded-xl font-medium transition-colors ${
                            isActive ? 'bg-lavender-100 text-lavender-700' : 'text-gray-700 hover:bg-lavender-50'
                          }`}
                        >
                          {item.label}
                        </Link>
                      )}
                    </div>
                  )
                })}
                
                {/* Mobile CTA - Book Your Session section on homepage */}
                <div className="pt-4 px-4 space-y-3">
                  <Link
                    to="/#get-help"
                    onClick={closeMobileMenu}
                    className="block w-full text-center px-6 py-3 rounded-xl font-medium text-white bg-gradient-to-r from-lavender-600 to-lavender-700 shadow-lg shadow-lavender-500/25"
                  >
                    Book a Session
                  </Link>
                  <div className="flex justify-center">
                    <UserMenu onOpenAuth={() => {
                      closeMobileMenu();
                      setIsAuthModalOpen(true);
                    }} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </nav>
  )
}

export default Navigation
