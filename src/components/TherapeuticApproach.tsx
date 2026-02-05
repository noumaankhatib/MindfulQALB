import { motion } from 'framer-motion'
import { Brain, Target, Compass, Lightbulb, MessageSquare, Sparkles } from 'lucide-react'

const TherapeuticApproach = () => {
  const approaches = [
    {
      name: 'Cognitive Behaviour Therapy (CBT)',
      description: 'Identify and transform negative thought patterns into positive, constructive thinking. CBT helps you recognize how thoughts influence emotions and behaviors, giving you practical tools to manage anxiety, depression, and stress.',
      icon: Brain,
      color: 'from-violet-500 to-purple-600',
    },
    {
      name: 'Acceptance and Commitment Therapy (ACT)',
      description: 'Embrace your experiences while committing to actions aligned with your values. ACT teaches psychological flexibility—accepting difficult emotions while taking meaningful steps toward the life you want.',
      icon: Compass,
      color: 'from-blue-500 to-indigo-600',
    },
    {
      name: 'Gestalt Therapy',
      description: 'Focus on the present moment and develop self-awareness for personal growth. Gestalt emphasizes the "here and now," helping you understand unfinished business from the past and integrate all aspects of yourself.',
      icon: Target,
      color: 'from-emerald-500 to-teal-600',
    },
    {
      name: 'Solution-Focused Therapy',
      description: 'Build on your strengths to create practical solutions for current challenges. Rather than dwelling on problems, we focus on what\'s working and how to do more of it—creating positive change efficiently.',
      icon: Lightbulb,
      color: 'from-amber-500 to-orange-600',
    },
    {
      name: 'Neuro-Linguistic Programming (NLP)',
      description: 'Reprogram thought patterns for better communication and personal excellence. NLP techniques help you change limiting beliefs, improve relationships, and achieve your goals through understanding how language shapes experience.',
      icon: MessageSquare,
      color: 'from-rose-500 to-pink-600',
    },
  ]

  return (
    <section id="approach" className="py-16 md:py-20 lg:py-24 relative overflow-hidden px-4 sm:px-6 lg:px-8">
      {/* Background */}
      <div className="absolute inset-0 section-gradient-lavender" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-lavender-100/60 border border-lavender-200/50 mb-6">
            <Sparkles className="w-4 h-4 text-lavender-600" />
            <span className="text-sm font-medium text-lavender-700">Evidence-Based Methods</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-800 mb-5">
            My Therapeutic Approach
          </h2>
          <div className="section-divider mb-6" />
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            I use <strong>proven, science-backed methods</strong> tailored to your unique needs. 
            Each approach is selected based on what will help you most effectively.
          </p>
        </motion.div>

        {/* Approaches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {approaches.map((approach, index) => {
            const Icon = approach.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-lavender-100/50 shadow-soft hover:shadow-card-hover transition-all duration-300"
              >
                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${approach.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                
                {/* Content */}
                <h3 className="font-display text-lg font-semibold text-gray-800 mb-3">
                  {approach.name}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {approach.description}
                </p>
              </motion.div>
            )
          })}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-lavender-500 to-lavender-600 rounded-2xl p-8 md:p-10 text-center shadow-xl"
        >
          <h3 className="font-display text-xl md:text-2xl font-semibold text-white mb-4">
            A Personalized Approach Just for You
          </h3>
          <p className="text-lavender-100 leading-relaxed max-w-2xl mx-auto mb-6">
            My approach is warm, eclectic, and collaborative. I don't believe in one-size-fits-all solutions. 
            Together, we'll find what works best for your unique situation, goals, and pace.
          </p>
          <motion.a
            href="#get-help"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-lavender-600 rounded-full font-semibold hover:bg-lavender-50 transition-colors"
          >
            Start Your Journey
          </motion.a>
        </motion.div>
      </div>
    </section>
  )
}

export default TherapeuticApproach
