import { motion } from 'framer-motion'
import { ArrowRight, Shield, Heart, Users, Sparkles } from 'lucide-react'
import heroMainImage from '../assets/images/hero_main_optimized.jpeg'

// Therapy-themed wellness images from Unsplash (royalty-free)
const heroImages = {
  main: heroMainImage,
  secondary: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80',
  accent: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400&q=80',
}

const Hero = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  }

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  }

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 1,
        ease: [0.25, 0.1, 0.25, 1],
        delay: 0.5,
      },
    },
  }

  return (
    <section id="home" className="relative min-h-[90vh] flex items-center overflow-hidden pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      {/* Gradient Background - Soft lavender for calm therapeutic feel */}
      <div className="absolute inset-0 bg-gradient-to-br from-lavender-50/80 via-white to-lavender-100/30" />
      
      {/* Floating Decorative Shapes - All lavender tones for consistency */}
      <motion.div
        variants={floatingVariants}
        animate="animate"
        className="floating-shape floating-shape-lavender w-72 h-72 -top-20 -left-20 animate-float-slow"
      />
      <motion.div
        variants={floatingVariants}
        animate="animate"
        style={{ animationDelay: '2s' }}
        className="floating-shape floating-shape-primary w-96 h-96 -top-40 right-0 animate-float-medium"
      />
      <motion.div
        variants={floatingVariants}
        animate="animate"
        style={{ animationDelay: '4s' }}
        className="floating-shape floating-shape-cream w-80 h-80 bottom-20 -left-40 animate-float-fast"
      />
      
      {/* Subtle Pattern Overlay - Lavender dots */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #8B5CF6 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center lg:text-left"
          >
            {/* Authority Badge - Lavender themed */}
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-lavender-200/60 mb-6 shadow-soft"
            >
              <Sparkles className="w-4 h-4 text-lavender-600" />
              <span className="text-sm font-medium text-lavender-700 tracking-wide">Licensed & Confidential Care</span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              variants={itemVariants}
              className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl font-semibold mb-6 leading-[1.1] tracking-tight text-gray-800 text-soft-shadow"
            >
              Support for your mind,<br />
              <span className="text-gradient">your relationships,</span><br />
              and the challenges you carry.
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={itemVariants}
              className="text-lg sm:text-xl lg:text-lg mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal text-gray-600"
            >
              Evidence-based mental health care for individuals and couples—accessible, human, and private.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start items-center mb-8"
            >
              <motion.a
                href="#get-help"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary px-8 py-4 text-base font-medium glow-breathe group"
              >
                <span className="flex items-center gap-2.5">
                  Begin Your Journey
                  <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </motion.a>
              <motion.a
                href="#approach"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="btn-secondary"
                onClick={(e) => {
                  e.preventDefault()
                  const element = document.getElementById('approach')
                  if (element) {
                    const navHeight = 80
                    const elementPosition = element.getBoundingClientRect().top + window.scrollY
                    window.scrollTo({
                      top: elementPosition - navHeight,
                      behavior: 'smooth'
                    })
                  }
                }}
              >
                Explore My Approach
              </motion.a>
            </motion.div>

            {/* Trust Indicators - All lavender themed for consistency */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap justify-center lg:justify-start gap-4 md:gap-6"
            >
              {[
                { icon: Heart, text: 'Evidence-Based', color: 'text-lavender-600' },
                { icon: Shield, text: 'Confidential', color: 'text-lavender-500' },
                { icon: Users, text: 'Licensed Psychologist', color: 'text-lavender-700' },
              ].map((item) => (
                <motion.div
                  key={item.text}
                  whileHover={{ y: -2 }}
                  className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/70 backdrop-blur-sm border border-lavender-100/60 shadow-soft"
                >
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                  <span className="text-sm font-medium text-gray-700">{item.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Image Section - Therapy Imagery */}
          <motion.div
            variants={imageVariants}
            initial="hidden"
            animate="visible"
            className="relative hidden lg:block"
          >
            {/* Main Image - Therapy/Counseling Session */}
            <div className="relative">
              {/* Decorative lavender gradient behind image */}
              <div className="absolute -inset-4 bg-gradient-to-br from-lavender-200/40 to-lavender-100/20 rounded-[2.5rem] blur-2xl" />
              
              {/* Main therapy image */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.4 }}
                className="relative rounded-[2rem] overflow-hidden shadow-2xl shadow-lavender-500/20 border border-lavender-100/50"
              >
                <img
                  src={heroImages.main}
                  alt="Supportive therapy session - a safe space for healing"
                  className="w-full h-[500px] object-cover"
                  loading="eager"
                />
                {/* Soft overlay for calm feel */}
                <div className="absolute inset-0 bg-gradient-to-t from-lavender-900/10 via-transparent to-lavender-100/10" />
              </motion.div>

              {/* Floating accent image - Mindfulness */}
              <motion.div
                variants={floatingVariants}
                animate="animate"
                className="absolute -bottom-8 -left-12 w-40 h-40 rounded-2xl overflow-hidden shadow-xl shadow-lavender-500/15 border-4 border-white"
              >
                <img
                  src={heroImages.secondary}
                  alt="Mindfulness and meditation practice"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </motion.div>

              {/* Floating accent badge */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1, duration: 0.6 }}
                className="absolute -right-4 top-12 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-lg shadow-lavender-500/10 border border-lavender-100/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-lavender-500 to-lavender-600 flex items-center justify-center">
                    <Heart className="w-6 h-6 text-white" fill="white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">You're Not Alone</p>
                    <p className="text-xs text-gray-500">I'm here for you</p>
                  </div>
                </div>
              </motion.div>

              {/* Stats badge */}
              {/* <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                className="absolute -bottom-4 right-8 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-lg shadow-lavender-500/10 border border-lavender-100/50"
              >
                <div className="text-center">
                  <p className="text-2xl font-bold text-lavender-600">3000+</p>
                  <p className="text-xs text-gray-500">Clinical Hours</p>
                </div>
              </motion.div> */}
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Bottom Gradient Fade - Soft lavender tint */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-lavender-50/60 to-transparent pointer-events-none" />
    </section>
  )
}

export default Hero
