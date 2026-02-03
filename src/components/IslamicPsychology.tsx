import { motion } from 'framer-motion'
import { useState } from 'react'
import { Moon, Heart, BookOpen, Users, ChevronDown, ArrowRight, Sparkles, Shield, HeartHandshake } from 'lucide-react'

const islamicImages = {
  main: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?w=800&q=80', // Peaceful mosque/spiritual
}

const IslamicPsychology = () => {
  const [expandedCard, setExpandedCard] = useState<string | null>(null)

  const services = [
    {
      id: 'faith-integration',
      icon: Moon,
      title: 'Faith-Integrated Counseling',
      description: 'Blend modern psychology with Islamic principles for holistic healing',
      details: {
        overview: 'Our approach honors your faith while providing evidence-based psychological support. We understand that spirituality is central to your identity and wellbeing.',
        benefits: ['Aligns with Islamic values', 'Incorporates spiritual practices', 'Respects religious boundaries', 'Uses Quran and Sunnah as guidance'],
        approach: 'We integrate Islamic principles with CBT, mindfulness, and other proven therapeutic techniques.',
        suitableFor: 'Anyone seeking therapy that honors their Muslim identity',
      },
      color: 'lavender',
      delay: 0.1
    },
    {
      id: 'marriage-prep',
      icon: Heart,
      title: 'Islamic Marriage Preparation',
      description: 'Pre-marital counseling grounded in Islamic teachings',
      details: {
        overview: 'Prepare for a blessed marriage with counseling that covers both practical relationship skills and Islamic rights and responsibilities of spouses.',
        benefits: ['Understanding roles and expectations', 'Communication skills', 'Conflict resolution', 'Financial planning Islamically', 'Intimacy guidance'],
        approach: 'Combines relationship science with Islamic marriage principles from Quran and authentic Hadith.',
        suitableFor: 'Engaged couples and those considering marriage',
      },
      color: 'accent',
      delay: 0.15
    },
    {
      id: 'spiritual-crisis',
      icon: Sparkles,
      title: 'Spiritual Crisis Support',
      description: 'Navigate doubts, faith struggles, and spiritual disconnection',
      details: {
        overview: 'A safe, non-judgmental space to explore your relationship with faith. Address doubts, religious OCD (waswasa), and feelings of spiritual emptiness.',
        benefits: ['Non-judgmental exploration', 'Understanding faith fluctuations', 'Addressing religious anxiety', 'Reconnecting with spirituality'],
        approach: 'Compassionate support that validates your struggles while gently guiding you towards clarity.',
        suitableFor: 'Those experiencing faith doubts or spiritual disconnection',
      },
      color: 'lavender',
      delay: 0.2
    },
    {
      id: 'muslim-women',
      icon: Shield,
      title: 'Muslim Women\'s Wellness',
      description: 'Specialized support for the unique challenges Muslim women face',
      details: {
        overview: 'Address issues specific to Muslim women including identity, cultural expectations, hijab journey, and balancing multiple roles while honoring your faith.',
        benefits: ['Identity exploration', 'Cultural navigation', 'Self-care within Islam', 'Empowerment through faith'],
        approach: 'Female therapist available. Culturally competent care that understands your unique context.',
        suitableFor: 'Muslim women seeking understanding support',
      },
      color: 'accent',
      delay: 0.25
    },
    {
      id: 'family-islamic',
      icon: Users,
      title: 'Islamic Family Counseling',
      description: 'Restore harmony in your family through Islamic guidance',
      details: {
        overview: 'Address family conflicts, parent-child relationships, and generational gaps while honoring Islamic family values and the rights of each family member.',
        benefits: ['Rights of parents (Birr al-Walidayn)', 'Children\'s upbringing (Tarbiyah)', 'In-law relationships', 'Balancing tradition and modernity'],
        approach: 'Family systems therapy enriched with Islamic principles of mercy, justice, and kinship ties.',
        suitableFor: 'Muslim families seeking faith-based guidance',
      },
      color: 'lavender',
      delay: 0.3
    },
    {
      id: 'trauma-islamic',
      icon: HeartHandshake,
      title: 'Trauma with Islamic Healing',
      description: 'Heal from trauma using both psychological and spiritual tools',
      details: {
        overview: 'Process trauma while finding comfort in your faith. Combine evidence-based trauma therapy with Islamic concepts of patience (sabr), trust in Allah (tawakkul), and healing.',
        benefits: ['Trauma processing', 'Spiritual coping tools', 'Finding meaning in hardship', 'Rebuilding trust and hope'],
        approach: 'Trauma-informed care integrated with Islamic spiritual practices and du\'a.',
        suitableFor: 'Those healing from trauma who want faith-based support',
      },
      color: 'accent',
      delay: 0.35
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
    <section id="islamic" className="py-28 md:py-36 relative overflow-hidden px-4 sm:px-6 lg:px-8">
      {/* Background */}
      <div className="absolute inset-0 section-gradient-lavender" />
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url(${islamicImages.main})`,
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
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-lavender-100/60 border border-lavender-200/50 mb-6">
            <Moon className="w-4 h-4 text-lavender-600" />
            <span className="text-sm font-medium text-lavender-700">Islamic Psychology</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-800 mb-5">
            Faith-Integrated Mental Health
          </h2>
          <div className="section-divider mb-6" />
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Healing that honors your faith. Our Islamic psychology services blend evidence-based 
            therapy with the wisdom of Quran and Sunnah for holistic wellbeing.
          </p>
        </motion.div>

        {/* Core Principles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
        >
          {[
            { icon: BookOpen, title: 'Rooted in Quran & Sunnah', desc: 'Every approach is grounded in authentic Islamic sources' },
            { icon: Shield, title: 'Confidential & Private', desc: 'Your sessions are completely confidential and judgment-free' },
            { icon: Heart, title: 'Compassionate Care', desc: 'We meet you where you are in your faith journey' },
          ].map((principle, index) => (
            <div key={index} className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-lavender-100/50">
              <div className="w-12 h-12 rounded-xl bg-lavender-100/80 flex items-center justify-center mx-auto mb-4">
                <principle.icon className="w-6 h-6 text-lavender-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">{principle.title}</h3>
              <p className="text-sm text-gray-600">{principle.desc}</p>
            </div>
          ))}
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
                        
                        <h4 className="font-semibold text-gray-800 mb-2">What We Cover</h4>
                        <ul className="space-y-1 mb-4">
                          {service.details.benefits.map((benefit, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                              <div className={`w-1.5 h-1.5 rounded-full ${colors.iconBg}`} />
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Our Approach</h4>
                        <p className="text-gray-600 text-sm leading-relaxed mb-4">{service.details.approach}</p>
                        
                        <h4 className="font-semibold text-gray-800 mb-2">Suitable For</h4>
                        <p className="text-gray-600 text-sm mb-4">{service.details.suitableFor}</p>
                        
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

        {/* Quote Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative bg-gradient-to-br from-lavender-100/80 to-lavender-100/60 rounded-3xl p-10 md:p-14 border border-lavender-200/50 shadow-soft overflow-hidden text-center"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-lavender-200/30 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-lavender-200/30 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10">
            <Moon className="w-10 h-10 text-lavender-400 mx-auto mb-6" />
            <blockquote className="font-display text-xl md:text-2xl text-gray-800 mb-4 italic">
              "Verily, in the remembrance of Allah do hearts find rest."
            </blockquote>
            <p className="text-lavender-600 font-medium">— Surah Ar-Ra'd (13:28)</p>
            
            <motion.a
              href="#get-help"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary inline-flex items-center gap-2 px-8 py-4 text-base font-medium group mt-8"
            >
              Begin Your Healing Journey
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default IslamicPsychology
