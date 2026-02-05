import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Heart, Users, ChevronDown, CheckCircle, Clock, Shield, ArrowRight, Sparkles, Quote } from 'lucide-react'

// Emotional therapy-themed images - showing real connection and healing moments
const categoryImages = {
  // Person in moment of reflection/breakthrough - warm, hopeful
  individuals: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&q=80',
  // Couple holding hands, reconnecting - intimate, warm lighting
  couples: 'https://images.unsplash.com/photo-1494774157365-9e04c6720e47?w=600&q=80',
  // Family embracing, united - warm, authentic moment
  families: 'https://images.unsplash.com/photo-1609220136736-443140cffec6?w=600&q=80',
}

// Emotional story snippets for each category
const emotionalStories = {
  individuals: {
    story: "I used to wake up every morning with a weight on my chest. The anxiety was so overwhelming that even simple tasks felt impossible. I thought I had to fight this battle alone...",
    resolution: "After just a few sessions, I learned I wasn't broken—I just needed someone to help me see my own strength. Today, I finally feel like myself again.",
    name: "Priya, 28"
  },
  couples: {
    story: "We'd been married for 12 years, but somewhere along the way, we forgot how to talk to each other. Every conversation turned into an argument. We felt like strangers sharing a home...",
    resolution: "Therapy didn't just save our marriage—it gave us a completely new one. We're more connected now than in our honeymoon phase.",
    name: "Rahul & Meera"
  },
  families: {
    story: "When our son turned 15, he stopped talking to us. Doors slammed. Silence at dinner. We were losing him and didn't know why...",
    resolution: "Family therapy helped us understand each other's worlds. Now we have real conversations again. My son even said 'I love you' last week—unprompted.",
    name: "The Sharma Family"
  }
}

const WhoWeHelp = () => {
  const [expandedCard, setExpandedCard] = useState<string | null>(null)

  const cards = [
    {
      icon: User,
      title: 'Individuals',
      subtitle: 'Your healing journey starts here',
      description: 'Personalized support for anxiety, depression, trauma, and life transitions',
      iconColor: 'text-lavender-600',
      image: categoryImages.individuals,
      emotionalStory: emotionalStories.individuals,
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
      subtitle: 'Reconnect with the one you love',
      description: 'Relationship counseling, communication, conflict resolution, and intimacy',
      iconColor: 'text-rose-500',
      image: categoryImages.couples,
      emotionalStory: emotionalStories.couples,
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
          duration: '30-45 minutes',
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
      subtitle: 'Heal together, grow together',
      description: 'Family therapy and support for parenting challenges and transitions',
      iconColor: 'text-emerald-500',
      image: categoryImages.families,
      emotionalStory: emotionalStories.families,
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
    <section className="py-16 md:py-20 lg:py-24 relative overflow-hidden px-4 sm:px-6 lg:px-8">
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
            Who I Help
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
                          <p className="text-lavender-600 font-medium">{card.subtitle}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleToggle(card.title)}
                        className="w-10 h-10 rounded-full bg-lavender-100/60 flex items-center justify-center hover:bg-lavender-200/60 transition-colors"
                      >
                        <ChevronDown className="w-5 h-5 text-lavender-600 rotate-180" />
                      </button>
                    </div>

                    {/* Full Emotional Story Section */}
                    <div className="mb-8 bg-gradient-to-r from-lavender-50 via-white to-green-50 rounded-2xl p-6 border border-lavender-100/50">
                      <div className="flex items-center gap-2 mb-4">
                        <Quote className="w-5 h-5 text-lavender-500" />
                        <span className="text-sm font-semibold text-lavender-700">A Real Story of Healing</span>
                      </div>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <p className="text-gray-600 italic mb-3 leading-relaxed">
                            "{card.emotionalStory.story}"
                          </p>
                        </div>
                        <div className="bg-white/60 rounded-xl p-4 border border-green-100">
                          <p className="text-sm font-medium text-green-700 mb-2">After working together:</p>
                          <p className="text-gray-700 leading-relaxed">
                            "{card.emotionalStory.resolution}"
                          </p>
                          <p className="mt-3 text-sm font-semibold text-gray-800">— {card.emotionalStory.name}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Image Section */}
                      <div className="relative rounded-2xl overflow-hidden h-64 md:h-full min-h-[280px]">
                        <img 
                          src={card.image} 
                          alt={`${card.title} therapy`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent" />
                        
                        {/* Testimonial Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-4">
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
                  // Collapsed View - Emotional Story Card
                  <div 
                    className="cursor-pointer"
                    onClick={() => handleToggle(card.title)}
                  >
                    {/* Card Image with Emotional Overlay */}
                    <div className="relative h-52 overflow-hidden">
                      <img 
                        src={card.image} 
                        alt={`${card.title} therapy support`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                      />
                      {/* Gradient overlay for readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/40 to-transparent" />
                      
                      {/* Icon badge */}
                      <div className="absolute top-4 left-4 w-12 h-12 rounded-xl bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-lg">
                        <Icon className={`w-6 h-6 ${card.iconColor}`} />
                      </div>
                      
                      {/* Story preview on image */}
                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <div className="flex items-start gap-2 mb-2">
                          <Quote className="w-4 h-4 text-white/60 flex-shrink-0 mt-1" />
                          <p className="text-white/90 text-sm italic leading-relaxed line-clamp-2">
                            {card.emotionalStory.story.substring(0, 100)}...
                          </p>
                        </div>
                        <p className="text-white/70 text-xs">— {card.emotionalStory.name}</p>
                      </div>
                    </div>

                    {/* Content Area */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-display text-xl md:text-2xl font-semibold text-gray-800">
                            {card.title}
                          </h3>
                          <p className="text-sm text-lavender-600 font-medium">{card.subtitle}</p>
                        </div>
                        <motion.div
                          className="w-8 h-8 rounded-full bg-lavender-100/60 flex items-center justify-center group-hover:bg-lavender-200 transition-colors"
                        >
                          <ChevronDown className="w-5 h-5 text-lavender-600" />
                        </motion.div>
                      </div>
                      
                      <p className="text-gray-600 leading-relaxed mb-4 text-sm">
                        {card.description}
                      </p>
                      
                      {/* Emotional Resolution Preview */}
                      <div className="bg-gradient-to-r from-lavender-50 to-green-50 rounded-xl p-4 mb-4 border border-lavender-100/50">
                        <p className="text-sm text-gray-700 italic">
                          "{card.emotionalStory.resolution.substring(0, 80)}..."
                        </p>
                      </div>
                      
                      {/* Preview Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {card.details.conditions.slice(0, 3).map((condition, idx) => (
                          <span key={idx} className="px-2.5 py-1 rounded-full bg-lavender-100/60 text-lavender-700 text-xs font-medium">
                            {condition}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex items-center gap-2 text-lavender-600 font-medium text-sm group-hover:text-lavender-700 transition-colors">
                        <span>Read their full story & learn more</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
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
