import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, Leaf, BookOpen, ClipboardList, MessageSquare, Shield, ChevronDown, Clock, Target, CheckCircle, Sparkles } from 'lucide-react'

const SelfHelpTools = () => {
  const [expandedTool, setExpandedTool] = useState<string | null>(null)

  const tools = [
    {
      icon: TrendingUp,
      title: 'Mood Tracking',
      description: 'Track your emotional patterns and identify triggers',
      color: 'lavender',
      delay: 0.1,
      details: {
        duration: '5-10 min daily',
        goal: 'Pattern recognition',
        benefits: [
          'Identify emotional triggers and patterns',
          'Track progress over time with visual charts',
          'Recognize early warning signs',
          'Build emotional vocabulary'
        ],
        howItWorks: 'Log your mood multiple times daily using our simple scale. Over time, you\'ll see patterns emerge that help you understand what affects your emotional well-being.',
        image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&q=80'
      }
    },
    {
      icon: Leaf,
      title: 'Anxiety Grounding',
      description: 'Guided exercises for anxiety and panic management',
      color: 'lavender',
      delay: 0.15,
      details: {
        duration: '3-15 min',
        goal: 'Calm nervous system',
        benefits: [
          '5-4-3-2-1 sensory grounding technique',
          'Progressive muscle relaxation',
          'Box breathing exercises',
          'Emergency panic relief tools'
        ],
        howItWorks: 'When anxiety strikes, these techniques help bring you back to the present moment. They work by engaging your senses and calming your nervous system naturally.',
        image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&q=80'
      }
    },
    {
      icon: BookOpen,
      title: 'Guided Journaling',
      description: 'Structured prompts for reflection and growth',
      color: 'lavender',
      delay: 0.2,
      details: {
        duration: '10-20 min',
        goal: 'Self-awareness',
        benefits: [
          'Daily reflection prompts tailored to your needs',
          'Gratitude and positive focus exercises',
          'Processing difficult emotions safely',
          'Goal setting and progress tracking'
        ],
        howItWorks: 'Our AI-guided prompts adapt to your emotional state and goals. Write freely in a private, secure space designed for healing and growth.',
        image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&q=80'
      }
    },
    {
      icon: ClipboardList,
      title: 'CBT Worksheets',
      description: 'Evidence-based cognitive behavioral therapy exercises',
      color: 'lavender',
      delay: 0.25,
      details: {
        duration: '15-30 min',
        goal: 'Challenge negative thoughts',
        benefits: [
          'Thought record templates',
          'Cognitive distortion identification',
          'Behavioral activation planning',
          'Evidence-based restructuring'
        ],
        howItWorks: 'CBT is one of the most effective therapies for anxiety and depression. These worksheets guide you through the process of identifying and changing unhelpful thought patterns.',
        image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&q=80'
      }
    },
    {
      icon: MessageSquare,
      title: 'Communication Scripts',
      description: 'Couples communication templates and guides',
      color: 'lavender',
      delay: 0.3,
      details: {
        duration: '5-10 min prep',
        goal: 'Better conversations',
        benefits: [
          'I-statement templates for difficult topics',
          'Active listening guidelines',
          'Conflict de-escalation phrases',
          'Appreciation and validation scripts'
        ],
        howItWorks: 'Learn to express your needs without blame. These scripts provide a framework for having productive conversations, especially during conflicts or when discussing sensitive topics.',
        image: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&q=80'
      }
    },
    {
      icon: Shield,
      title: 'Values & Boundaries',
      description: 'Exercises to identify values and set healthy boundaries',
      color: 'lavender',
      delay: 0.35,
      details: {
        duration: '20-30 min',
        goal: 'Self-protection',
        benefits: [
          'Core values identification exercise',
          'Boundary-setting templates',
          'Scripts for saying no gracefully',
          'Relationship health assessment'
        ],
        howItWorks: 'Understanding your values helps you make aligned decisions. Setting boundaries protects your energy and creates healthier relationships.',
        image: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400&q=80'
      }
    },
  ]

  const handleToggle = (title: string) => {
    setExpandedTool(expandedTool === title ? null : title)
  }

  return (
    <section id="self-help" className="py-28 md:py-36 relative overflow-hidden px-4 sm:px-6 lg:px-8">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-lavender-50/20 to-white" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center mb-20"
        >
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-lavender-100 to-lavender-50 border border-lavender-200/50 mb-6 shadow-soft"
          >
            <Sparkles className="w-8 h-8 text-lavender-600" />
          </motion.div>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-800 mb-5">
            Self-Help Tools
          </h2>
          <div className="section-divider mb-6" />
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Evidence-based tools to support your mental health journey. Click on any tool to explore how it can help you.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => {
            const Icon = tool.icon
            const isExpanded = expandedTool === tool.title
            
            return (
              <motion.div
                key={tool.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.7,
                  delay: tool.delay,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
                layout
                className={`group bg-gradient-to-br from-lavender-50 to-lavender-50/50 rounded-3xl border border-lavender-100/60 shadow-soft hover:shadow-card-hover transition-all duration-500 ease-gentle overflow-hidden ${isExpanded ? 'md:col-span-2 lg:col-span-2' : ''}`}
              >
                {/* Main Card Content */}
                <div 
                  className="p-8 cursor-pointer"
                  onClick={() => handleToggle(tool.title)}
                >
                  <div className="flex items-start justify-between">
                    <motion.div 
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.3 }}
                      className="w-16 h-16 rounded-2xl bg-lavender-100/80 backdrop-blur-sm flex items-center justify-center mb-5 shadow-soft"
                    >
                      <Icon className="w-8 h-8 text-lavender-600" />
                    </motion.div>
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="w-8 h-8 rounded-full bg-lavender-100/60 flex items-center justify-center"
                    >
                      <ChevronDown className="w-5 h-5 text-lavender-600" />
                    </motion.div>
                  </div>
                  
                  <h3 className="font-display text-xl md:text-2xl font-semibold text-gray-800 mb-3">
                    {tool.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {tool.description}
                  </p>

                  {/* Quick Info Pills */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-lavender-100/60 text-lavender-700 text-xs font-medium">
                      <Clock className="w-3 h-3" />
                      {tool.details.duration}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-lavender-100/60 text-lavender-700 text-xs font-medium">
                      <Target className="w-3 h-3" />
                      {tool.details.goal}
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
                      <div className="px-8 pb-8 pt-0">
                        <div className="border-t border-lavender-200/50 pt-6">
                          <div className="grid md:grid-cols-2 gap-6">
                            {/* Image */}
                            <div className="relative rounded-2xl overflow-hidden h-48 md:h-full">
                              <img 
                                src={tool.details.image} 
                                alt={tool.title}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-lavender-900/20 via-transparent to-transparent" />
                            </div>

                            {/* Details */}
                            <div>
                              <h4 className="font-semibold text-gray-800 mb-3 text-lg">How It Works</h4>
                              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                                {tool.details.howItWorks}
                              </p>

                              <h4 className="font-semibold text-gray-800 mb-3">What You'll Learn</h4>
                              <ul className="space-y-2">
                                {tool.details.benefits.map((benefit, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                                    <CheckCircle className="w-4 h-4 text-lavender-500 mt-0.5 flex-shrink-0" />
                                    <span>{benefit}</span>
                                  </li>
                                ))}
                              </ul>

                              <motion.a
                                href="#get-help"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="mt-6 inline-flex items-center justify-center w-full px-6 py-3 rounded-xl bg-gradient-to-r from-lavender-600 to-lavender-700 text-white font-medium shadow-lg shadow-lavender-500/20 hover:shadow-lavender-500/30 transition-all duration-300"
                              >
                                Start This Exercise
                              </motion.a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>

        {/* Disclaimer */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-gray-500 mt-12 max-w-2xl mx-auto"
        >
          These self-help tools complement professional therapy but should not replace it. 
          If you're experiencing a mental health crisis, please contact a professional immediately.
        </motion.p>
      </div>
    </section>
  )
}

export default SelfHelpTools
