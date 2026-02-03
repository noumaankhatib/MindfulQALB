import { motion } from 'framer-motion'
import { Heart, Users, Wrench, ArrowRight } from 'lucide-react'

// Couples/relationship therapy images from Unsplash (royalty-free)
const couplesImages = {
  hero: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&q=80', // Couple holding hands
  support: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=600&q=80', // Supportive connection
}

const CouplesRelationships = () => {
  const counsellingTopics = [
    { title: 'Communication Breakdown', desc: 'Rebuild healthy communication patterns' },
    { title: 'Conflict Resolution', desc: 'Learn constructive conflict management' },
    { title: 'Infidelity Recovery', desc: 'Navigate trust rebuilding after betrayal' },
    { title: 'Emotional Intimacy', desc: 'Deepen emotional connection and understanding' },
    { title: 'Sexual Health & Intimacy', desc: 'Address sexual concerns and enhance intimacy' },
    { title: 'Pre-Marital Counselling', desc: 'Prepare for a healthy, lasting partnership' },
  ]

  const relationshipTypes = [
    'Married couples',
    'Long-term partners',
    'Long-distance',
    'LGBTQ+ couples',
    'Co-parenting / Separated',
    'Engaged couples',
    'Blended families',
  ]

  const tools = [
    { title: 'Communication exercises', icon: '💬' },
    { title: 'Conflict style assessments', icon: '📋' },
    { title: 'Weekly check-in prompts', icon: '📅' },
    { title: 'Attachment style quizzes', icon: '❤️' },
  ]

  return (
    <section id="couples" className="py-28 md:py-36 relative overflow-hidden px-4 sm:px-6 lg:px-8">
      {/* Background */}
      <div className="absolute inset-0 section-gradient-cream" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header with Image */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-20">
          {/* Text Section */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-center lg:text-left"
          >
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-lavender-100 to-lavender-50 border border-lavender-200/50 mb-6 shadow-soft"
            >
              <Heart className="w-8 h-8 text-lavender-600" fill="currentColor" />
            </motion.div>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-800 mb-5">
              Couples & Relationships
            </h2>
            <div className="section-divider lg:mx-0 mb-6" />
            <p className="text-lg md:text-xl text-gray-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Evidence-based couples counseling for all relationship types and challenges.
            </p>
          </motion.div>

          {/* Image Section */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative hidden lg:block"
          >
            <div className="relative">
              {/* Decorative background */}
              <div className="absolute -inset-4 bg-gradient-to-br from-lavender-200/30 to-lavender-100/20 rounded-[2rem] blur-xl" />
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.4 }}
                className="relative rounded-[1.5rem] overflow-hidden shadow-xl shadow-lavender-500/15 border border-lavender-100/50"
              >
                <img
                  src={couplesImages.hero}
                  alt="Couple supporting each other through relationship counseling"
                  className="w-full h-[380px] object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-lavender-900/15 via-transparent to-transparent" />
              </motion.div>

              {/* Floating badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="absolute -bottom-4 -left-4 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg shadow-lavender-500/10 border border-lavender-100/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-lavender-500 to-lavender-600 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-white" fill="white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Rebuild Connection</p>
                    <p className="text-xs text-gray-500">Strengthen your bond</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Couples Counselling */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          className="mb-24"
        >
          <div className="flex items-center gap-4 mb-12">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-12 h-12 rounded-xl bg-accent-100/80 border border-accent-200/50 flex items-center justify-center shadow-soft"
            >
              <Heart className="w-6 h-6 text-accent-600" fill="currentColor" />
            </motion.div>
            <h3 className="font-display text-2xl md:text-3xl font-semibold text-gray-800">
              Couples Counselling
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {counsellingTopics.map((topic, index) => (
              <motion.div
                key={topic.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.7,
                  delay: index * 0.08,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
                whileHover={{ y: -6, scale: 1.01 }}
                className="group bg-gradient-to-br from-white/90 to-cream-50/80 rounded-3xl p-8 border border-accent-100/50 shadow-soft hover:shadow-card-hover transition-all duration-500 ease-gentle"
              >
                <h4 className="font-display text-lg md:text-xl font-semibold text-gray-800 mb-3">
                  {topic.title}
                </h4>
                <p className="text-gray-600 leading-relaxed mb-6 text-sm md:text-base">
                  {topic.desc}
                </p>
                <a
                  href="#get-help"
                  className="inline-flex items-center gap-2 text-lavender-600 hover:text-lavender-700 font-medium text-sm transition-all duration-300 group-hover:gap-3"
                >
                  Learn more
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Relationship Types */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          className="mb-24"
        >
          <div className="flex items-center gap-4 mb-12">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-12 h-12 rounded-xl bg-lavender-100/80 border border-lavender-200/50 flex items-center justify-center shadow-soft"
            >
              <Users className="w-6 h-6 text-lavender-600" />
            </motion.div>
            <h3 className="font-display text-2xl md:text-3xl font-semibold text-gray-800">
              Relationship Types
            </h3>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="bg-gradient-to-br from-white/95 to-lavender-50/80 rounded-3xl p-8 md:p-10 lg:p-12 border border-lavender-100/50 shadow-soft"
          >
            <p className="text-base md:text-lg text-gray-600 mb-8 max-w-3xl leading-relaxed">
              We welcome and support all relationship structures and orientations. Our therapists are trained to work with diverse couples and relationship dynamics.
            </p>
            <div className="flex flex-wrap gap-3 md:gap-4">
              {relationshipTypes.map((type, index) => (
                <motion.span
                  key={type}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  whileHover={{ scale: 1.05, y: -3 }}
                  className="badge-pill cursor-default"
                >
                  {type}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Tools for Couples */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div className="flex items-center gap-4 mb-12">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-12 h-12 rounded-xl bg-lavender-100/80 border border-lavender-200/50 flex items-center justify-center shadow-soft"
            >
              <Wrench className="w-6 h-6 text-lavender-600" />
            </motion.div>
            <h3 className="font-display text-2xl md:text-3xl font-semibold text-gray-800">
              Tools for Couples
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tools.map((tool, index) => (
              <motion.div
                key={tool.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.7,
                  delay: index * 0.08,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="group bg-gradient-to-br from-white/90 to-lavender-50/50 rounded-3xl p-8 border border-lavender-100/50 shadow-soft hover:shadow-card-hover transition-all duration-500 ease-gentle text-center"
              >
                <motion.div 
                  whileHover={{ scale: 1.15, rotate: 10 }}
                  className="text-5xl mb-5 inline-block"
                >
                  {tool.icon}
                </motion.div>
                <h4 className="font-display text-base md:text-lg font-semibold text-gray-800 leading-snug">
                  {tool.title}
                </h4>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default CouplesRelationships
