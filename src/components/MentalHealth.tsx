import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Brain, AlertTriangle, Hand, Sprout, ChevronDown, CheckCircle, Users, Clock, Shield } from 'lucide-react'

// Mental health themed images from Unsplash (royalty-free)
const mentalHealthImages = {
  hero: 'https://images.unsplash.com/photo-1493836512294-502baa1986e2?w=800&q=80',
  emotional: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=400&q=80',
  cognitive: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
  trauma: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400&q=80',
  behavioral: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&q=80',
  identity: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=400&q=80',
}

const MentalHealth = () => {
  const [expandedDomain, setExpandedDomain] = useState<string | null>(null)

  const domains = [
    {
      icon: Heart,
      title: 'Emotional Health',
      description: 'Understanding and managing your emotional well-being',
      items: ['Anxiety disorders', 'Depression', 'Mood regulation', 'Emotional numbness'],
      iconColor: 'text-lavender-600',
      gradient: 'from-lavender-50 to-lavender-100/50',
      iconBg: 'bg-lavender-100/80',
      borderColor: 'border-lavender-100/60',
      bulletColor: 'bg-lavender-400',
      delay: 0.1,
      image: mentalHealthImages.emotional,
      details: {
        overview: 'Emotional health is about understanding, expressing, and managing your feelings in healthy ways. It affects every aspect of your life.',
        signs: ['Persistent feelings of sadness or hopelessness', 'Difficulty managing stress', 'Withdrawal from activities you once enjoyed', 'Changes in sleep or appetite'],
        approach: 'We use evidence-based therapies like CBT, DBT, and mindfulness-based approaches to help you develop emotional awareness and regulation skills.',
        duration: '8-16 sessions typical'
      }
    },
    {
      icon: Brain,
      title: 'Cognitive Health',
      description: 'Clarity of mind and healthy thought patterns',
      items: ['ADHD', 'Overthinking', 'OCD', 'Intrusive thoughts'],
      iconColor: 'text-lavender-600',
      gradient: 'from-lavender-50 to-lavender-50/30',
      iconBg: 'bg-lavender-100/80',
      borderColor: 'border-lavender-100/60',
      bulletColor: 'bg-lavender-400',
      delay: 0.15,
      image: mentalHealthImages.cognitive,
      details: {
        overview: 'Cognitive health involves how we think, learn, and remember. When our thought patterns become unhelpful, it affects our daily functioning.',
        signs: ['Racing or intrusive thoughts', 'Difficulty concentrating', 'Perfectionism or rumination', 'Compulsive behaviors'],
        approach: 'Our therapists specialize in CBT, ERP (for OCD), and ADHD coaching to help you regain mental clarity and peace.',
        duration: '12-24 sessions typical'
      }
    },
    {
      icon: AlertTriangle,
      title: 'Trauma & Stress',
      description: 'Healing from past experiences and building resilience',
      items: ['PTSD', 'Childhood trauma', 'Burnout', 'Acute stress'],
      iconColor: 'text-lavender-600',
      gradient: 'from-lavender-50 to-lavender-50/50',
      iconBg: 'bg-lavender-100/80',
      borderColor: 'border-lavender-100/60',
      bulletColor: 'bg-lavender-400',
      delay: 0.2,
      image: mentalHealthImages.trauma,
      details: {
        overview: 'Trauma affects how we see ourselves and the world. Healing is possible with the right support and therapeutic approach.',
        signs: ['Flashbacks or nightmares', 'Hypervigilance or feeling on edge', 'Avoidance of reminders', 'Emotional numbness'],
        approach: 'We offer trauma-informed care including EMDR, Somatic Experiencing, and trauma-focused CBT in a safe, supportive environment.',
        duration: '16-32 sessions typical'
      }
    },
    {
      icon: Hand,
      title: 'Behavioral Health',
      description: 'Breaking unhealthy patterns and building new habits',
      items: ['Addiction', 'Sleep disorders', 'Eating disorders', 'Self-harm support'],
      iconColor: 'text-lavender-600',
      gradient: 'from-lavender-50 to-lavender-50/30',
      iconBg: 'bg-lavender-100/80',
      borderColor: 'border-lavender-100/60',
      bulletColor: 'bg-lavender-400',
      delay: 0.25,
      image: mentalHealthImages.behavioral,
      details: {
        overview: 'Behavioral health addresses patterns of action that may be harmful. Change is possible with compassionate, specialized support.',
        signs: ['Difficulty controlling behaviors', 'Using substances to cope', 'Disrupted eating or sleep', 'Self-destructive patterns'],
        approach: 'We combine motivational interviewing, DBT skills training, and harm reduction approaches tailored to your needs.',
        duration: 'Ongoing support recommended'
      }
    },
    {
      icon: Sprout,
      title: 'Identity & Life Transitions',
      description: 'Navigating change and discovering your authentic self',
      items: ['Grief', 'Self-esteem', 'Gender & sexuality', 'Career stress'],
      iconColor: 'text-lavender-600',
      gradient: 'from-lavender-50 to-lavender-100/30',
      iconBg: 'bg-lavender-100/80',
      borderColor: 'border-lavender-200/60',
      bulletColor: 'bg-lavender-500',
      delay: 0.3,
      image: mentalHealthImages.identity,
      details: {
        overview: 'Life transitions and identity questions are natural parts of growth. Therapy provides a space to explore and integrate these experiences.',
        signs: ['Feeling lost or uncertain', 'Questioning your identity', 'Struggling with major life changes', 'Low self-worth'],
        approach: 'We offer affirming, exploratory therapy that honors your unique journey and helps you build a coherent sense of self.',
        duration: '8-20 sessions typical'
      }
    },
  ]

  const handleToggle = (title: string) => {
    setExpandedDomain(expandedDomain === title ? null : title)
  }

  return (
    <section id="mental-health" className="py-28 md:py-36 relative overflow-hidden px-4 sm:px-6 lg:px-8">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-lavender-50/20 to-white" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Hero Section with Image */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-20">
          {/* Image Section */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative hidden lg:block order-1"
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-lavender-200/30 to-lavender-100/20 rounded-[2rem] blur-xl" />
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.4 }}
                className="relative rounded-[1.5rem] overflow-hidden shadow-xl shadow-lavender-500/15 border border-lavender-100/50"
              >
                <img
                  src={mentalHealthImages.hero}
                  alt="Finding peace and calm through mental health support"
                  className="w-full h-[400px] object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-lavender-900/10 via-transparent to-transparent" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="absolute -bottom-4 -right-4 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg shadow-lavender-500/10 border border-lavender-100/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-lavender-500 to-lavender-600 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Expert Care</p>
                    <p className="text-xs text-gray-500">Evidence-based approach</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Text Section */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-center lg:text-left order-2"
          >
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-800 mb-5">
              Mental Health
            </h2>
            <div className="section-divider lg:mx-0 mb-6" />
            <p className="text-lg md:text-xl text-gray-600 max-w-xl mx-auto lg:mx-0 leading-relaxed mb-6">
              Explore evidence-based information about mental health concerns. Click any area to learn more about our approach and how we can help.
            </p>
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield className="w-4 h-4 text-lavender-500" />
                <span>Confidential</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="w-4 h-4 text-lavender-500" />
                <span>Licensed Therapists</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4 text-lavender-500" />
                <span>Flexible Scheduling</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Domains Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {domains.map((domain) => {
            const Icon = domain.icon
            const isExpanded = expandedDomain === domain.title
            
            return (
              <motion.div
                key={domain.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.7,
                  delay: domain.delay,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
                layout
                className={`group bg-gradient-to-br ${domain.gradient} rounded-3xl border ${domain.borderColor} shadow-soft hover:shadow-card-hover transition-all duration-500 ease-gentle overflow-hidden`}
              >
                {/* Card Header - Clickable */}
                <div 
                  className="p-7 cursor-pointer"
                  onClick={() => handleToggle(domain.title)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <motion.div 
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.3 }}
                      className={`w-14 h-14 rounded-2xl ${domain.iconBg} backdrop-blur-sm flex items-center justify-center shadow-soft`}
                    >
                      <Icon className={`w-7 h-7 ${domain.iconColor}`} />
                    </motion.div>
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="w-8 h-8 rounded-full bg-lavender-100/60 flex items-center justify-center"
                    >
                      <ChevronDown className="w-5 h-5 text-lavender-600" />
                    </motion.div>
                  </div>
                  
                  <h3 className="font-display text-xl md:text-2xl font-semibold text-gray-800 mb-2">
                    {domain.title}
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    {domain.description}
                  </p>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {domain.items.map((item) => (
                      <span
                        key={item}
                        className="px-3 py-1 rounded-full bg-white/60 text-gray-700 text-xs font-medium"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Expandable Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-7 pb-7 pt-0">
                        <div className="border-t border-lavender-200/50 pt-6">
                          <div className="grid md:grid-cols-2 gap-6">
                            {/* Image */}
                            <div className="relative rounded-2xl overflow-hidden h-48">
                              <img 
                                src={domain.image} 
                                alt={domain.title}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-lavender-900/20 via-transparent to-transparent" />
                              <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-lg">
                                <span className="text-xs font-medium text-lavender-700">{domain.details.duration}</span>
                              </div>
                            </div>

                            {/* Details */}
                            <div>
                              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                                {domain.details.overview}
                              </p>

                              <h4 className="font-semibold text-gray-800 mb-2 text-sm">Common Signs</h4>
                              <ul className="space-y-1.5 mb-4">
                                {domain.details.signs.slice(0, 3).map((sign, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-xs text-gray-600">
                                    <CheckCircle className="w-3.5 h-3.5 text-lavender-500 mt-0.5 flex-shrink-0" />
                                    <span>{sign}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <div className="mt-4 p-4 bg-lavender-100/40 rounded-xl">
                            <h4 className="font-semibold text-gray-800 mb-2 text-sm">Our Approach</h4>
                            <p className="text-xs text-gray-600 leading-relaxed">
                              {domain.details.approach}
                            </p>
                          </div>

                          <motion.a
                            href="#get-help"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="mt-4 inline-flex items-center justify-center w-full px-6 py-3 rounded-xl bg-gradient-to-r from-lavender-600 to-lavender-700 text-white font-medium shadow-lg shadow-lavender-500/20 hover:shadow-lavender-500/30 transition-all duration-300"
                          >
                            Get Support for {domain.title}
                          </motion.a>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default MentalHealth
