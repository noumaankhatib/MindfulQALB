import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Heart, Users, ChevronDown, CheckCircle, Clock, Shield, ArrowRight, Sparkles } from 'lucide-react'

// Therapy-themed images for each category from Unsplash
const categoryImages = {
  individuals: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=600&q=80',
  couples: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=600&q=80',
  families: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&q=80',
}

const WhoWeHelp = () => {
  const [expandedCard, setExpandedCard] = useState<string | null>(null)

  const cards = [
    {
      icon: User,
      title: 'Individuals',
      description: 'Personalized support for anxiety, depression, trauma, and life transitions',
      iconColor: 'text-lavender-600',
      image: categoryImages.individuals,
      delay: 0.1,
      details: {
        overview: 'Our individual therapy provides a safe, confidential space where you can explore your thoughts, feelings, and behaviors with a trained professional who truly listens.',
        conditions: [
          'Anxiety & Panic Disorders',
          'Depression & Mood Issues',
          'Trauma & PTSD',
          'Life Transitions & Stress',
          'Self-Esteem & Identity',
          'Grief & Loss',
          'Work & Career Concerns',
          'Relationship Patterns'
        ],
        approaches: ['CBT', 'EMDR', 'Mindfulness', 'Psychodynamic', 'ACT'],
        sessionInfo: {
          duration: '50-60 minutes',
          frequency: 'Weekly or bi-weekly',
          format: 'Video, phone, or in-person'
        },
        testimonial: {
          quote: "For the first time, I felt truly understood. My therapist helped me see patterns I never noticed before.",
          author: "Client, Individual Therapy"
        }
      }
    },
    {
      icon: Heart,
      title: 'Couples',
      description: 'Relationship counseling, communication, conflict resolution, and intimacy',
      iconColor: 'text-lavender-600',
      image: categoryImages.couples,
      delay: 0.2,
      details: {
        overview: 'Whether you\'re navigating a rough patch or wanting to strengthen your bond, our couples therapists provide expert guidance using proven relationship science.',
        conditions: [
          'Communication Breakdown',
          'Trust & Infidelity Issues',
          'Intimacy Concerns',
          'Conflict Resolution',
          'Pre-Marital Preparation',
          'Parenting Disagreements',
          'Life Stage Transitions',
          'Reconnection After Distance'
        ],
        approaches: ['Gottman Method', 'EFT', 'Imago', 'Attachment-Based'],
        sessionInfo: {
          duration: '75-90 minutes',
          frequency: 'Weekly recommended',
          format: 'Both partners together'
        },
        testimonial: {
          quote: "We were on the brink of separation. Couples therapy gave us tools to truly hear each other again.",
          author: "Married Couple, 8 Years"
        }
      }
    },
    {
      icon: Users,
      title: 'Families',
      description: 'Family therapy and support for parenting challenges and transitions',
      iconColor: 'text-lavender-600',
      image: categoryImages.families,
      delay: 0.3,
      details: {
        overview: 'Family dynamics are complex. Our family therapists help improve communication, resolve conflicts, and strengthen bonds across generations.',
        conditions: [
          'Parent-Child Conflicts',
          'Blended Family Challenges',
          'Adolescent Issues',
          'Divorce & Co-Parenting',
          'Sibling Relationships',
          'Generational Trauma',
          'Family Communication',
          'Major Life Transitions'
        ],
        approaches: ['Structural Family Therapy', 'Strategic', 'Narrative', 'Bowenian'],
        sessionInfo: {
          duration: '60-90 minutes',
          frequency: 'Weekly or bi-weekly',
          format: 'Flexible participation'
        },
        testimonial: {
          quote: "Our teenager was shutting us out. Family therapy helped us rebuild the connection we thought we'd lost.",
          author: "Parent of Teen"
        }
      }
    },
  ]

  const handleToggle = (title: string) => {
    setExpandedCard(expandedCard === title ? null : title)
  }

  return (
    <section className="py-28 md:py-36 relative overflow-hidden px-4 sm:px-6 lg:px-8">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-lavender-50/30 to-white" />
      
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
            <Sparkles className="w-8 h-8 text-lavender-600" />
          </motion.div>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-800 mb-5">
            Who We Help
          </h2>
          <div className="section-divider mb-6" />
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Professional support tailored to your unique needs. Click on any category to learn more about how we can help.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {cards.map((card) => {
            const Icon = card.icon
            const isExpanded = expandedCard === card.title
            
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.7,
                  delay: card.delay,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
                layout
                className={`group bg-gradient-to-br from-lavender-50 to-white rounded-3xl border border-lavender-100/60 shadow-soft hover:shadow-lg transition-all duration-500 ease-gentle overflow-hidden ${
                  isExpanded ? 'lg:col-span-3' : ''
                }`}
              >
                {isExpanded ? (
                  // Expanded View
                  <div className="p-6 md:p-8">
                    {/* Header with close */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-lavender-100/80 flex items-center justify-center shadow-soft">
                          <Icon className={`w-7 h-7 ${card.iconColor}`} />
                        </div>
                        <div>
                          <h3 className="font-display text-2xl md:text-3xl font-semibold text-gray-800">
                            {card.title}
                          </h3>
                          <p className="text-gray-600">{card.description}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleToggle(card.title)}
                        className="w-10 h-10 rounded-full bg-lavender-100/60 flex items-center justify-center hover:bg-lavender-200/60 transition-colors"
                      >
                        <ChevronDown className="w-5 h-5 text-lavender-600 rotate-180" />
                      </button>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Image Section */}
                      <div className="relative rounded-2xl overflow-hidden h-64 md:h-full">
                        <img 
                          src={card.image} 
                          alt={`${card.title} therapy`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-lavender-900/30 via-transparent to-transparent" />
                        
                        {/* Testimonial Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                          <p className="text-white text-sm italic mb-2">"{card.details.testimonial.quote}"</p>
                          <p className="text-white/80 text-xs">— {card.details.testimonial.author}</p>
                        </div>
                      </div>

                      {/* What We Address */}
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-lavender-500" />
                          What We Address
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {card.details.conditions.map((condition, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                              <span className="w-1.5 h-1.5 rounded-full bg-lavender-400 flex-shrink-0" />
                              {condition}
                            </div>
                          ))}
                        </div>

                        {/* Approaches */}
                        <h4 className="font-semibold text-gray-800 mt-6 mb-3">Our Approaches</h4>
                        <div className="flex flex-wrap gap-2">
                          {card.details.approaches.map((approach, idx) => (
                            <span key={idx} className="px-3 py-1 rounded-full bg-lavender-100/60 text-lavender-700 text-xs font-medium">
                              {approach}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Session Info & CTA */}
                      <div>
                        <div className="bg-lavender-50 rounded-2xl p-5 mb-4">
                          <h4 className="font-semibold text-gray-800 mb-4">Session Details</h4>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <Clock className="w-4 h-4 text-lavender-500" />
                              <div>
                                <p className="text-sm font-medium text-gray-800">{card.details.sessionInfo.duration}</p>
                                <p className="text-xs text-gray-500">Per session</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <ArrowRight className="w-4 h-4 text-lavender-500" />
                              <div>
                                <p className="text-sm font-medium text-gray-800">{card.details.sessionInfo.frequency}</p>
                                <p className="text-xs text-gray-500">Recommended</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Shield className="w-4 h-4 text-lavender-500" />
                              <div>
                                <p className="text-sm font-medium text-gray-800">{card.details.sessionInfo.format}</p>
                                <p className="text-xs text-gray-500">Flexible options</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-4">
                          {card.details.overview}
                        </p>

                        <motion.a
                          href="#get-help"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-xl bg-gradient-to-r from-lavender-600 to-lavender-700 text-white font-medium shadow-lg shadow-lavender-500/20 hover:shadow-lavender-500/30 transition-all duration-300"
                        >
                          Get Started with {card.title} Therapy
                          <ArrowRight className="w-4 h-4" />
                        </motion.a>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Collapsed View
                  <div 
                    className="p-6 cursor-pointer"
                    onClick={() => handleToggle(card.title)}
                  >
                    {/* Card Image */}
                    <div className="relative rounded-2xl overflow-hidden mb-5 h-44">
                      <img 
                        src={card.image} 
                        alt={`${card.title} therapy support`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-lavender-900/30 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-3 w-12 h-12 rounded-xl bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-soft">
                        <Icon className={`w-6 h-6 ${card.iconColor}`} />
                      </div>
                    </div>

                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-display text-xl md:text-2xl font-semibold text-gray-800">
                        {card.title}
                      </h3>
                      <motion.div
                        className="w-8 h-8 rounded-full bg-lavender-100/60 flex items-center justify-center"
                      >
                        <ChevronDown className="w-5 h-5 text-lavender-600" />
                      </motion.div>
                    </div>
                    
                    <p className="text-gray-600 leading-relaxed mb-4">
                      {card.description}
                    </p>
                    
                    {/* Preview Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {card.details.conditions.slice(0, 3).map((condition, idx) => (
                        <span key={idx} className="px-2 py-1 rounded-full bg-lavender-100/60 text-lavender-700 text-xs">
                          {condition}
                        </span>
                      ))}
                      <span className="px-2 py-1 rounded-full bg-lavender-100/60 text-lavender-700 text-xs">
                        +{card.details.conditions.length - 3} more
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-lavender-600 font-medium text-sm">
                      <span>Learn more about {card.title.toLowerCase()} therapy</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-600 mb-4">Not sure which type of support is right for you?</p>
          <a 
            href="#get-help" 
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-lavender-200 text-lavender-700 font-medium hover:bg-lavender-50 transition-colors"
          >
            Take Our Free Assessment
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}

export default WhoWeHelp
