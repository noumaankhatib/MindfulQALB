import { motion } from 'framer-motion'
import { useState } from 'react'
import { Leaf, Heart, Sparkles, Users, ChevronDown, ArrowRight, Shield, HeartHandshake, Sun, Wind } from 'lucide-react'

const HolisticWellness = () => {
  const [expandedCard, setExpandedCard] = useState<string | null>(null)

  const services = [
    {
      id: 'holistic-healing',
      icon: Leaf,
      title: 'Holistic Healing Approach',
      description: 'Integrate mind, body, and spirit for complete wellbeing',
      details: {
        overview: 'Our holistic approach addresses your whole self—mind, emotions, body, and spirit. We believe true healing comes from nurturing all aspects of who you are.',
        benefits: ['Mind-body connection', 'Emotional balance', 'Stress reduction', 'Inner peace & clarity'],
        approach: 'We combine evidence-based psychology with mindfulness, breathwork, and self-compassion practices.',
        suitableFor: 'Anyone seeking comprehensive, whole-person healing',
      },
      color: 'lavender',
      delay: 0.1
    },
    {
      id: 'mindful-relationships',
      icon: Heart,
      title: 'Mindful Relationships',
      description: 'Build deeper, more meaningful connections with loved ones',
      details: {
        overview: 'Learn to communicate with compassion, resolve conflicts peacefully, and create lasting bonds. I help you understand relationship patterns and build healthier dynamics.',
        benefits: ['Deeper emotional intimacy', 'Effective communication', 'Conflict resolution skills', 'Secure attachment building'],
        approach: 'Combines attachment theory, mindful communication, and emotionally focused techniques.',
        suitableFor: 'Couples and individuals wanting healthier relationships',
      },
      color: 'accent',
      delay: 0.15
    },
    {
      id: 'spiritual-wellness',
      icon: Sun,
      title: 'Spiritual Wellness',
      description: 'Explore meaning, purpose, and inner peace',
      details: {
        overview: 'A safe space to explore your spiritual journey—whatever that looks like for you. Find meaning, connect with your values, and cultivate inner peace without religious pressure.',
        benefits: ['Discover your purpose', 'Connect with your values', 'Find inner peace', 'Navigate spiritual questions'],
        approach: 'Respectful, non-judgmental exploration that honors your unique spiritual path.',
        suitableFor: 'Those seeking meaning and spiritual growth',
      },
      color: 'lavender',
      delay: 0.2
    },
    {
      id: 'womens-wellness',
      icon: Shield,
      title: "Women's Wellness",
      description: 'Specialized support for the unique challenges women face',
      details: {
        overview: 'Address issues specific to women including identity, life transitions, self-care, work-life balance, and navigating societal expectations while honoring your authentic self.',
        benefits: ['Identity & self-worth', 'Life transitions support', 'Boundary setting', 'Self-care practices'],
        approach: 'Compassionate, culturally sensitive care that understands your unique context.',
        suitableFor: 'Women seeking understanding and empowering support',
      },
      color: 'accent',
      delay: 0.25
    },
    {
      id: 'family-harmony',
      icon: Users,
      title: 'Family Harmony',
      description: 'Restore peace and understanding within your family',
      details: {
        overview: 'Address family conflicts, improve parent-child relationships, and bridge generational gaps. Create a home environment filled with understanding, respect, and love.',
        benefits: ['Improved communication', 'Conflict resolution', 'Stronger bonds', 'Generational healing'],
        approach: 'Family systems therapy with emphasis on understanding each member\'s needs.',
        suitableFor: 'Families seeking harmony and deeper connection',
      },
      color: 'lavender',
      delay: 0.3
    },
    {
      id: 'trauma-healing',
      icon: HeartHandshake,
      title: 'Gentle Trauma Healing',
      description: 'Heal from past wounds with compassionate, trauma-informed care',
      details: {
        overview: 'Process trauma at your own pace in a safe, supportive environment. Combine evidence-based trauma therapy with grounding, self-compassion, and resilience building.',
        benefits: ['Safe processing space', 'Grounding techniques', 'Resilience building', 'Reclaiming your story'],
        approach: 'Trauma-informed care using EMDR, somatic practices, and compassion-focused therapy.',
        suitableFor: 'Those healing from trauma who need gentle, patient support',
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
    <section id="holistic" className="py-16 md:py-20 lg:py-24 relative overflow-hidden px-4 sm:px-6 lg:px-8">
      {/* Background */}
      <div className="absolute inset-0 section-gradient-lavender" />
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #8B5CF6 1px, transparent 0)`,
          backgroundSize: '32px 32px',
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
            <Leaf className="w-4 h-4 text-lavender-600" />
            <span className="text-sm font-medium text-lavender-700">Holistic Wellness</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-800 mb-5">
            Nurturing Mind, Body & Spirit
          </h2>
          <div className="section-divider mb-6" />
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Experience healing that honors your whole self. Our holistic approach integrates 
            evidence-based therapy with mindfulness and spiritual wellness for complete wellbeing.
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
            { icon: Sparkles, title: 'Whole-Person Approach', desc: 'Addressing mind, body, emotions, and spirit together' },
            { icon: Shield, title: 'Safe & Confidential', desc: 'A judgment-free space for your healing journey' },
            { icon: Heart, title: 'Compassionate Care', desc: 'Meeting you exactly where you are right now' },
          ].map((principle, index) => (
            <motion.div 
              key={index} 
              className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-lavender-100/50"
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-12 h-12 rounded-xl bg-lavender-100/80 flex items-center justify-center mx-auto mb-4">
                <principle.icon className="w-6 h-6 text-lavender-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">{principle.title}</h3>
              <p className="text-sm text-gray-600">{principle.desc}</p>
            </motion.div>
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
                        
                        <h4 className="font-semibold text-gray-800 mb-2">What You'll Gain</h4>
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
                        
                        <h4 className="font-semibold text-gray-800 mb-2">Best For</h4>
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

        {/* Inspirational Quote Section */}
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
            <Wind className="w-10 h-10 text-lavender-400 mx-auto mb-6" />
            <blockquote className="font-display text-xl md:text-2xl text-gray-800 mb-4 italic">
              "The wound is the place where the light enters you."
            </blockquote>
            <p className="text-lavender-600 font-medium">— Rumi</p>
            
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

export default HolisticWellness
