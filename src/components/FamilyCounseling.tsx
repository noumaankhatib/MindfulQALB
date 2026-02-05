import { motion } from 'framer-motion'
import { useState } from 'react'
import { Users, Heart, ChevronDown, ArrowRight, Home, Baby, GraduationCap, UserMinus } from 'lucide-react'

const familyImages = {
  main: 'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=800&q=80', // Happy family
  parenting: 'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=600&q=80', // Parent and child
}

const FamilyCounseling = () => {
  const [expandedCard, setExpandedCard] = useState<string | null>(null)

  const services = [
    {
      id: 'parent-child',
      icon: Baby,
      title: 'Parent-Child Relationships',
      description: 'Strengthen the bond between parents and children of all ages',
      details: {
        overview: 'Build stronger connections with your children through improved communication and understanding. Address behavioral issues, academic stress, and emotional challenges together.',
        signs: ['Communication breakdown', 'Behavioral issues', 'Academic stress', 'Screen time conflicts', 'Sibling rivalry'],
        approach: 'We use attachment-based therapy and positive parenting techniques to rebuild trust and connection.',
        duration: '8-12 sessions typically',
      },
      color: 'lavender',
      delay: 0.1
    },
    {
      id: 'joint-family',
      icon: Home,
      title: 'Joint Family Dynamics',
      description: 'Navigate the complexities of living in extended family setups',
      details: {
        overview: 'Address the unique challenges of Indian joint family systems including boundary setting, role clarity, and maintaining harmony while respecting individual needs.',
        signs: ['Boundary issues', 'Role conflicts', 'Privacy concerns', 'Decision-making challenges', 'Generation gap'],
        approach: 'Culturally sensitive family systems therapy that honors traditions while addressing modern needs.',
        duration: '10-16 sessions typically',
      },
      color: 'accent',
      delay: 0.15
    },
    {
      id: 'in-laws',
      icon: Users,
      title: 'In-Law Relationships',
      description: 'Build healthy relationships with your extended family',
      details: {
        overview: 'Learn to navigate relationships with in-laws with grace and clear communication. Address expectations, boundaries, and build mutual respect.',
        signs: ['Constant conflicts', 'Feeling unsupported', 'Interference in marriage', 'Cultural clashes', 'Unfair comparisons'],
        approach: 'Focused on communication skills, boundary setting, and developing empathy across generations.',
        duration: '6-10 sessions typically',
      },
      color: 'lavender',
      delay: 0.2
    },
    {
      id: 'adolescent',
      icon: GraduationCap,
      title: 'Adolescent & Teen Issues',
      description: 'Support for families navigating teenage years',
      details: {
        overview: 'Help your teenager thrive during these challenging years. Address academic pressure, peer influence, identity formation, and digital wellbeing.',
        signs: ['Academic stress', 'Social media addiction', 'Peer pressure', 'Identity confusion', 'Rebellion and defiance'],
        approach: 'Adolescent-focused therapy combined with family sessions to improve understanding and connection.',
        duration: '8-14 sessions typically',
      },
      color: 'accent',
      delay: 0.25
    },
    {
      id: 'elder-care',
      icon: UserMinus,
      title: 'Elder Care & Aging Parents',
      description: 'Navigate the challenges of caring for aging family members',
      details: {
        overview: 'Address the emotional and practical challenges of caring for elderly parents. Balance responsibilities among siblings and manage caregiver stress.',
        signs: ['Caregiver burnout', 'Family disagreements', 'Role reversal struggles', 'Financial stress', 'End-of-life decisions'],
        approach: 'Supportive counseling with focus on self-care, family coordination, and emotional processing.',
        duration: '6-12 sessions typically',
      },
      color: 'lavender',
      delay: 0.3
    },
  ]

  const colorClasses = {
    lavender: { 
      gradient: 'from-lavender-50 to-lavender-50/30', 
      iconBg: 'bg-lavender-100/80', 
      icon: 'text-lavender-600',
      border: 'border-lavender-100/50',
      expanded: 'from-lavender-50/90 to-white'
    },
    accent: { 
      gradient: 'from-accent-50 to-cream-50/50', 
      iconBg: 'bg-accent-100/80', 
      icon: 'text-accent-600',
      border: 'border-accent-100/50',
      expanded: 'from-accent-50/90 to-white'
    },
  }

  return (
    <section id="family" className="py-16 md:py-20 lg:py-24 relative overflow-hidden px-4 sm:px-6 lg:px-8">
      {/* Background */}
      <div className="absolute inset-0 section-gradient-light" />
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url(${familyImages.main})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-lavender-100/60 border border-lavender-200/50 mb-6">
            <Home className="w-4 h-4 text-lavender-600" />
            <span className="text-sm font-medium text-lavender-700">Family Counseling</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-800 mb-5">
            Strengthen Your Family Bonds
          </h2>
          <div className="section-divider mb-6" />
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Navigate family challenges with professional guidance. From parent-child relationships to 
            joint family dynamics, I help Indian families thrive together.
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {services.map((service) => {
            const Icon = service.icon
            const colors = colorClasses[service.color as keyof typeof colorClasses]
            const isExpanded = expandedCard === service.id

            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.7,
                  delay: service.delay,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
                layout
                className={`group bg-gradient-to-br ${isExpanded ? colors.expanded : colors.gradient} rounded-3xl p-7 ${colors.border} border shadow-soft hover:shadow-card-hover transition-all duration-500 ease-gentle cursor-pointer ${isExpanded ? 'md:col-span-2 lg:col-span-3' : ''}`}
                onClick={() => setExpandedCard(isExpanded ? null : service.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                    className={`w-14 h-14 rounded-2xl ${colors.iconBg} backdrop-blur-sm flex items-center justify-center shadow-soft`}
                  >
                    <Icon className={`w-7 h-7 ${colors.icon}`} />
                  </motion.div>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className={`w-5 h-5 ${colors.icon}`} />
                  </motion.div>
                </div>
                
                <h3 className="font-display text-lg md:text-xl font-semibold text-gray-800 mb-2">
                  {service.title}
                </h3>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-4">
                  {service.description}
                </p>

                {/* Expanded Content */}
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="pt-4 border-t border-lavender-100/50"
                  >
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Overview</h4>
                        <p className="text-gray-600 text-sm leading-relaxed mb-4">{service.details.overview}</p>
                        
                        <h4 className="font-semibold text-gray-800 mb-2">Common Signs</h4>
                        <ul className="space-y-1 mb-4">
                          {service.details.signs.map((sign, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                              <div className={`w-1.5 h-1.5 rounded-full ${colors.iconBg}`} />
                              {sign}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Our Approach</h4>
                        <p className="text-gray-600 text-sm leading-relaxed mb-4">{service.details.approach}</p>
                        
                        <h4 className="font-semibold text-gray-800 mb-2">Duration</h4>
                        <p className="text-gray-600 text-sm mb-4">{service.details.duration}</p>
                        
                        <motion.a
                          href="#get-help"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="btn-primary inline-flex items-center gap-2 text-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Book a Session
                          <ArrowRight className="w-4 h-4" />
                        </motion.a>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative bg-gradient-to-br from-lavender-100/80 to-lavender-100/60 rounded-3xl p-10 md:p-14 border border-lavender-200/50 shadow-soft overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-lavender-200/30 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10 text-center md:text-left md:flex md:items-center md:justify-between">
            <div className="mb-8 md:mb-0">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                <Heart className="w-5 h-5 text-lavender-600" />
                <span className="text-lavender-700 font-medium text-sm uppercase tracking-wide">Family First</span>
              </div>
              <h3 className="font-display text-2xl md:text-3xl font-semibold text-gray-800 mb-3">
                Ready to Heal Together?
              </h3>
              <p className="text-base md:text-lg text-gray-600 max-w-xl">
                Take the first step towards a healthier, happier family life. Book your consultation today.
              </p>
            </div>
            <motion.a
              href="#get-help"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary inline-flex items-center gap-2 px-8 py-4 text-base font-medium group"
            >
              Book Family Session
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default FamilyCounseling
