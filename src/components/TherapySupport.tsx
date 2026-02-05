import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Heart, Target, Calendar, Search, ChevronDown, CheckCircle, Clock, Video, Shield, Star } from 'lucide-react'

// Therapy images from Unsplash
const therapyImages = {
  individual: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&q=80',
  couples: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&q=80',
  goal: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&q=80',
  ongoing: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=400&q=80',
}

const TherapySupport = () => {
  const [expandedType, setExpandedType] = useState<string | null>(null)

  const therapyTypes = [
    {
      icon: User,
      title: '1-on-1 Therapy',
      description: 'Individual sessions tailored to your unique needs',
      color: 'lavender',
      delay: 0.1,
      image: therapyImages.individual,
      details: {
        overview: 'Private, confidential sessions with a licensed therapist focused entirely on you. Together, you\'ll explore your concerns and develop personalized strategies for growth.',
        features: [
          '50-60 minute private sessions',
          'Personalized treatment plan',
          'Weekly or bi-weekly scheduling',
          'Video, phone, or in-person options'
        ],
        bestFor: ['Anxiety & depression', 'Personal growth', 'Life transitions', 'Trauma recovery'],
        pricing: 'From $120/session',
        duration: '50-60 min'
      }
    },
    {
      icon: Heart,
      title: 'Couples Therapy',
      description: 'Relationship-focused sessions for couples',
      color: 'lavender',
      delay: 0.15,
      image: therapyImages.couples,
      details: {
        overview: 'Work together with your partner and a specialized couples therapist to strengthen your bond, improve communication, and navigate challenges.',
        features: [
          '75-90 minute couples sessions',
          'Evidence-based approaches (EFT, Gottman)',
          'Communication skills training',
          'Conflict resolution strategies'
        ],
        bestFor: ['Communication issues', 'Trust rebuilding', 'Pre-marital preparation', 'Intimacy concerns'],
        pricing: 'From $180/session',
        duration: '75-90 min'
      }
    },
    {
      icon: Target,
      title: 'Goal-Focused Sessions',
      description: 'Short-term, solution-oriented therapy',
      color: 'lavender',
      delay: 0.2,
      image: therapyImages.goal,
      details: {
        overview: 'Structured, time-limited therapy focused on achieving specific goals. Ideal for those who want targeted support for a particular issue or life challenge.',
        features: [
          '6-12 session packages',
          'Clear goals and milestones',
          'Practical tools and homework',
          'Progress tracking'
        ],
        bestFor: ['Specific phobias', 'Work stress', 'Decision making', 'Habit changes'],
        pricing: 'From $100/session',
        duration: '45-50 min'
      }
    },
    {
      icon: Calendar,
      title: 'Ongoing Therapy Plans',
      description: 'Long-term support and growth',
      color: 'lavender',
      delay: 0.25,
      image: therapyImages.ongoing,
      details: {
        overview: 'Continuous therapeutic support for deeper exploration and lasting change. Build a strong relationship with your therapist over time.',
        features: [
          'Consistent weekly sessions',
          'Deep therapeutic relationship',
          'Comprehensive support',
          'Flexible intensity over time'
        ],
        bestFor: ['Complex trauma', 'Personality exploration', 'Chronic conditions', 'Deep personal growth'],
        pricing: 'Monthly packages available',
        duration: 'Ongoing'
      }
    },
  ]

  const handleToggle = (title: string) => {
    setExpandedType(expandedType === title ? null : title)
  }

  return (
    <section id="therapy" className="py-16 md:py-20 lg:py-24 relative overflow-hidden px-4 sm:px-6 lg:px-8">
      {/* Background */}
      <div className="absolute inset-0 section-gradient-lavender" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center mb-16"
        >
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-lavender-100 to-lavender-50 border border-lavender-200/50 mb-6 shadow-soft"
          >
            <Video className="w-8 h-8 text-lavender-600" />
          </motion.div>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-800 mb-5">
            Therapy & Support
          </h2>
          <div className="section-divider mb-6" />
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Connect with licensed therapists who specialize in your needs. Click any option to explore details.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {therapyTypes.map((type) => {
            const Icon = type.icon
            const isExpanded = expandedType === type.title
            
            return (
              <motion.div
                key={type.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.7,
                  delay: type.delay,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
                layout
                className="group bg-gradient-to-br from-lavender-50 to-lavender-50/50 rounded-3xl border border-lavender-100/60 shadow-soft hover:shadow-card-hover transition-all duration-500 ease-gentle overflow-hidden"
              >
                {/* Card Header - Clickable */}
                <div 
                  className="p-7 cursor-pointer"
                  onClick={() => handleToggle(type.title)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <motion.div 
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.3 }}
                      className="w-14 h-14 rounded-2xl bg-lavender-100/80 backdrop-blur-sm flex items-center justify-center shadow-soft"
                    >
                      <Icon className="w-7 h-7 text-lavender-600" />
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
                    {type.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {type.description}
                  </p>
                  
                  {/* Quick Info */}
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-lavender-100/60 text-lavender-700 text-xs font-medium">
                      <Clock className="w-3 h-3" />
                      {type.details.duration}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-lavender-100/60 text-lavender-700 text-xs font-medium">
                      <Star className="w-3 h-3" />
                      {type.details.pricing}
                    </span>
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
                                src={type.image} 
                                alt={type.title}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-lavender-900/20 via-transparent to-transparent" />
                            </div>

                            {/* Details */}
                            <div>
                              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                                {type.details.overview}
                              </p>

                              <h4 className="font-semibold text-gray-800 mb-2 text-sm">What's Included</h4>
                              <ul className="space-y-1.5 mb-4">
                                {type.details.features.map((feature, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-xs text-gray-600">
                                    <CheckCircle className="w-3.5 h-3.5 text-lavender-500 mt-0.5 flex-shrink-0" />
                                    <span>{feature}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Best For Section */}
                          <div className="mt-4 p-4 bg-lavender-100/40 rounded-xl">
                            <h4 className="font-semibold text-gray-800 mb-2 text-sm">Best For</h4>
                            <div className="flex flex-wrap gap-2">
                              {type.details.bestFor.map((item, idx) => (
                                <span key={idx} className="px-3 py-1 rounded-full bg-white/60 text-gray-700 text-xs font-medium">
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>

                          <motion.a
                            href="#get-help"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="mt-4 inline-flex items-center justify-center w-full px-6 py-3 rounded-xl bg-gradient-to-r from-lavender-600 to-lavender-700 text-white font-medium shadow-lg shadow-lavender-500/20 hover:shadow-lavender-500/30 transition-all duration-300"
                          >
                            Book {type.title}
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

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          className="bg-gradient-to-br from-white/95 to-lavender-50/80 rounded-3xl p-8 md:p-10 border border-lavender-100/50 shadow-soft"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-lavender-100/80 flex items-center justify-center">
              <Search className="w-5 h-5 text-lavender-600" />
            </div>
            <div>
              <h3 className="font-display text-xl md:text-2xl font-semibold text-gray-800">
                Find Your Therapist
              </h3>
              <p className="text-sm text-gray-500">Match with a specialist based on your needs</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <select className="select select-bordered w-full bg-white/80 backdrop-blur-sm border-lavender-200/50 focus:border-lavender-400 focus:ring-2 focus:ring-lavender-400/30 rounded-xl">
              <option>Select Issue</option>
              <option>Anxiety</option>
              <option>Depression</option>
              <option>Relationship Issues</option>
              <option>Trauma</option>
              <option>Life Transitions</option>
              <option>Grief & Loss</option>
            </select>
            <select className="select select-bordered w-full bg-white/80 backdrop-blur-sm border-lavender-200/50 focus:border-lavender-400 focus:ring-2 focus:ring-lavender-400/30 rounded-xl">
              <option>Therapy Approach</option>
              <option>CBT (Cognitive Behavioral)</option>
              <option>EFT (Emotionally Focused)</option>
              <option>Gottman Method</option>
              <option>Trauma-informed</option>
              <option>Psychodynamic</option>
              <option>Mindfulness-based</option>
            </select>
            <select className="select select-bordered w-full bg-white/80 backdrop-blur-sm border-lavender-200/50 focus:border-lavender-400 focus:ring-2 focus:ring-lavender-400/30 rounded-xl">
              <option>Availability</option>
              <option>Mornings</option>
              <option>Afternoons</option>
              <option>Evenings</option>
              <option>Weekends</option>
            </select>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary w-full text-sm"
            >
              Find Therapists
            </motion.button>
          </div>
          
          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-6 mt-6 pt-6 border-t border-lavender-100/50">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Shield className="w-4 h-4 text-lavender-500" />
              <span>HIPAA Compliant</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-lavender-500" />
              <span>Licensed Professionals</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Video className="w-4 h-4 text-lavender-500" />
              <span>Video & In-Person</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default TherapySupport
