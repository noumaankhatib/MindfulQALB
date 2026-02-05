import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Clock, CheckCircle, ArrowRight, Star, Quote, FileText, CreditCard, Sparkles, ChevronDown, IndianRupee } from 'lucide-react'
import profileImage from '../assets/images/profile_final.jpg'

const AboutTherapist = () => {
  const [showMoreDetails, setShowMoreDetails] = useState(false)

  const testimonials = [
    {
      text: "My therapy sessions have been extremely helpful. They provide a safe and understanding space, listen without judgment, and give practical guidance that really works. I feel more confident, calmer, and better equipped to handle challenges.",
      author: "AB",
      details: "24, Male",
      highlight: "More confident & calmer",
    },
    {
      text: "After talking to you, I feel like I've been able to open up a bit more about things I couldn't share with others. Your guidance has helped me identify my problems and work through them, and I feel like I can be myself around you. Your support has given me the strength to improve myself, and I'm grateful for that.",
      author: "SA",
      details: "42, Female",
      highlight: "Found strength to improve",
    },
    {
      text: "We had our first session on the night of 20th February, 2025 and it was an audio call and I was mesmerized by her way of putting things into perspective. Out of all the psychologists I consulted, she had the most different approach which I had never experienced before and she is such a lively and kind woman. Just in 3-4 sessions, this woman has completely changed the way I see things.",
      author: "KS",
      details: "23, Male",
      highlight: "Life-changing perspective",
    },
  ]

  const feeStructure = [
    {
      type: 'Initial Consultation',
      duration: '15-20 minutes',
      price: 'Free',
      description: 'A brief call to understand your needs and see if we\'re a good fit',
      features: ['No commitment required', 'Discuss your concerns', 'Ask any questions'],
      popular: false,
    },
    {
      type: 'Individual Therapy',
      duration: '50-60 minutes',
      price: '1,500',
      description: 'One-on-one personalized counseling session',
      features: ['Personalized approach', 'Evidence-based techniques', 'Progress tracking'],
      popular: true,
    },
    {
      type: 'Couple Therapy',
      duration: '60-75 minutes',
      price: '2,000',
      description: 'Joint session for couples seeking stronger bonds',
      features: ['Both partners included', 'Relationship focus', 'Communication tools'],
      popular: false,
    },
  ]

  return (
    <section id="about" className="py-16 md:py-20 lg:py-24 relative overflow-hidden px-4 sm:px-6 lg:px-8">
      {/* Background */}
      <div className="absolute inset-0 section-gradient-light" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header with Logo */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center mb-12"
        >
          {/* <motion.img
            src={logoImage}
            alt="Mindful Qalb Logo"
            className="w-24 h-24 mx-auto mb-6 object-contain drop-shadow-lg"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          /> */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-lavender-100/60 border border-lavender-200/50 mb-6">
            <Heart className="w-4 h-4 text-lavender-600" />
            <span className="text-sm font-medium text-lavender-700">Meet Your Therapist</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-800 mb-3">
            Aqsa Khatib
          </h2>
          <p className="text-lg md:text-xl text-lavender-600 font-medium">
            Counseling Psychologist & Therapist
          </p>
        </motion.div>

        {/* About Section - Two Column Layout */}
        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-start mb-16">
          {/* Profile Image - Smaller Column */}
          <motion.div
            initial={{ opacity: 0, x: -30, scale: 0.95 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="lg:col-span-2 flex justify-center"
          >
            <div className="relative w-full max-w-xs">
              {/* Decorative background */}
              <div className="absolute -inset-3 bg-gradient-to-br from-lavender-200/50 to-lavender-100/30 rounded-2xl blur-xl" />
              
              {/* Profile Image */}
              <motion.div 
                className="relative rounded-2xl overflow-hidden shadow-xl border border-lavender-100/50"
                whileInView={{ y: [15, 0], opacity: [0, 1] }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <img 
                  src={profileImage} 
                  alt="Aqsa Khatib - Counseling Psychologist" 
                  className="w-full h-auto object-cover"
                  style={{ maxHeight: '800px', objectPosition: 'top' }}
                />
                {/* Gradient overlay at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
                
                {/* Name badge */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white font-semibold text-lg">Aqsa Khatib</p>
                  <p className="text-white/80 text-sm">3000+ Clinical Hours</p>
                </div>
              </motion.div>

              {/* Floating badges */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="absolute -bottom-3 -right-3 bg-white rounded-xl p-2.5 shadow-lg border border-lavender-100"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-lavender-500 to-lavender-600 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-lavender-600">3000+</p>
                    <p className="text-[10px] text-gray-500">Hours</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                className="absolute top-3 -right-3 bg-white rounded-xl p-2 shadow-lg border border-lavender-100"
              >
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-3 h-3 text-amber-400 fill-amber-400" />
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* About Content - Larger Column */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
            className="lg:col-span-3"
          >
            <div className="mb-6">
              <h3 className="font-display text-2xl md:text-3xl font-semibold text-gray-800 mb-2">
                About Me
              </h3>
              <p className="text-lavender-600 font-medium italic">
                Warm regards & Greetings,
              </p>
            </div>

            <div className="prose prose-lg text-gray-600 mb-6 space-y-4">
              <p className="leading-relaxed text-base">
                I'm <strong>Aqsa Khatib</strong>, a Counseling Psychologist with <span className="text-lavender-600 font-semibold">3,000+ hours</span> of hands-on clinical experience. I support individuals and couples through emotional, relational, and life challenges—meeting you wherever you are in your journey.
              </p>
              <p className="leading-relaxed text-base">
                I offer <strong>individual counseling</strong>, <strong>couple therapy</strong>, and <strong>workshops</strong>, working with concerns like anxiety, stress, relationship difficulties, self-esteem, emotional regulation, and life transitions.
              </p>
            </div>

            {/* More Details Expandable */}
            <motion.button
              onClick={() => setShowMoreDetails(!showMoreDetails)}
              className="flex items-center gap-2 text-lavender-600 hover:text-lavender-700 font-semibold mb-4 transition-colors group"
              whileHover={{ x: 3 }}
            >
              <span>{showMoreDetails ? 'Show Less' : 'More About My Approach'}</span>
              <motion.span
                animate={{ rotate: showMoreDetails ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className="w-5 h-5" />
              </motion.span>
            </motion.button>

            <AnimatePresence>
              {showMoreDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="bg-lavender-50/60 rounded-xl p-5 mb-6 border border-lavender-100">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-lavender-500" />
                      My Therapeutic Philosophy
                    </h4>
                    <div className="space-y-3 text-gray-600 text-sm">
                      <p>
                        Each session is thoughtfully adapted to <strong>your needs, goals, and pace</strong>—there's no one-size-fits-all here. Whether you're feeling stuck, overwhelmed, or seeking deeper self-understanding, I offer a <strong>safe, respectful, and confidential space</strong> for you to explore, heal, and grow.
                      </p>
                      <p>
                        My approach is <strong>warm, eclectic, and collaborative</strong>. I blend science-backed therapeutic methods with a holistic understanding of your unique circumstances—honoring your values, beliefs, and personal journey.
                      </p>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-lavender-200">
                      <h5 className="font-semibold text-gray-800 mb-2 text-sm">Areas of Expertise:</h5>
                      <div className="flex flex-wrap gap-2">
                        {['Anxiety & Stress', 'Relationships', 'Self-Esteem', 'Emotional Regulation', 'Life Transitions', 'Couples Therapy', 'Personal Growth'].map((area) => (
                          <span key={area} className="px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-600 border border-lavender-200">
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.a
              href="#get-help"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary inline-flex items-center gap-2 px-7 py-3.5 text-base font-medium group"
            >
              Book a Free Consultation
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </motion.a>
          </motion.div>
        </div>

        {/* Support Message - More Impactful */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="bg-gradient-to-r from-lavender-500 to-lavender-600 rounded-2xl p-8 md:p-12 shadow-xl">
            <p className="text-xl md:text-2xl text-white font-medium leading-relaxed mb-4">
              You don't have to carry this alone.
            </p>
            <p className="text-lavender-100 text-lg">
              Here, you'll find confidential support for your mind, your relationships, and your life.
            </p>
            <motion.a
              href="#get-help"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-white text-lavender-600 rounded-full font-semibold hover:bg-lavender-50 transition-colors"
            >
              Take the First Step
              <ArrowRight className="w-5 h-5" />
            </motion.a>
          </div>
        </motion.div>

        {/* Testimonials Section - Enhanced */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-lavender-100/60 border border-lavender-200/50 mb-6">
              <Quote className="w-4 h-4 text-lavender-600" />
              <span className="text-sm font-medium text-lavender-700">Real Stories, Real Results</span>
            </div>
            <h3 className="font-display text-2xl md:text-3xl font-semibold text-gray-800 mb-4">
              What Clients Say
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Hear from people who have experienced meaningful change through therapy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -6 }}
                className="relative bg-white rounded-2xl p-6 border border-lavender-100/50 shadow-soft hover:shadow-card-hover transition-all duration-300"
              >
                {/* Highlight badge */}
                <div className="absolute -top-3 left-4">
                  <span className="bg-gradient-to-r from-lavender-500 to-lavender-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                    {testimonial.highlight}
                  </span>
                </div>
                
                <div className="pt-4">
                  <Quote className="w-8 h-8 text-lavender-200 mb-3" />
                  <p className="text-gray-600 leading-relaxed mb-6 text-sm line-clamp-6">
                    "{testimonial.text}"
                  </p>
                  <div className="flex items-center gap-3 pt-4 border-t border-lavender-100/50">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-lavender-400 to-lavender-500 flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">{testimonial.author}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">Anonymous</p>
                      <p className="text-xs text-gray-500">{testimonial.details}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Fee Structure Section - Professional Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-lavender-100/60 border border-lavender-200/50 mb-6">
              <CreditCard className="w-4 h-4 text-lavender-600" />
              <span className="text-sm font-medium text-lavender-700">Transparent Pricing</span>
            </div>
            <h3 className="font-display text-2xl md:text-3xl font-semibold text-gray-800 mb-4">
              Investment in Your Wellbeing
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Clear, straightforward pricing with no hidden fees. All sessions are conducted online for your convenience and comfort.
            </p>
          </div>

          {/* Fee Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {feeStructure.map((fee, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className={`relative bg-white rounded-2xl overflow-hidden border shadow-soft hover:shadow-xl transition-all duration-300 ${
                  fee.popular 
                    ? 'border-lavender-400 ring-2 ring-lavender-100' 
                    : 'border-lavender-100/50'
                }`}
              >
                {fee.popular && (
                  <div className="bg-gradient-to-r from-lavender-500 to-lavender-600 text-white text-center py-2 text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                <div className="p-6">
                  <h4 className="font-display text-lg font-semibold text-gray-800 mb-1">
                    {fee.type}
                  </h4>
                  <p className="text-sm text-gray-500 mb-4">{fee.duration}</p>
                  
                  <div className="flex items-baseline gap-1 mb-4">
                    {fee.price !== 'Free' && (
                      <IndianRupee className="w-5 h-5 text-lavender-600" />
                    )}
                    <span className="text-4xl font-bold text-lavender-600">{fee.price}</span>
                    {fee.price !== 'Free' && (
                      <span className="text-sm text-gray-500">/session</span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">{fee.description}</p>
                  
                  <ul className="space-y-2 mb-6">
                    {fee.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-lavender-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <motion.a
                    href="#get-help"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className={`block text-center py-3 px-4 rounded-xl font-semibold transition-colors ${
                      fee.popular
                        ? 'bg-gradient-to-r from-lavender-500 to-lavender-600 text-white hover:from-lavender-600 hover:to-lavender-700'
                        : 'bg-lavender-50 text-lavender-600 hover:bg-lavender-100'
                    }`}
                  >
                    {fee.price === 'Free' ? 'Book Free Call' : 'Get Started'}
                  </motion.a>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Getting Started Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-lavender-50/80 to-white rounded-2xl p-8 border border-lavender-100/50"
          >
            <div className="flex flex-col md:flex-row items-start gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-lavender-100 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-lavender-600" />
                  </div>
                  <h4 className="font-display text-xl font-semibold text-gray-800">
                    How to Get Started
                  </h4>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Before your first session, you'll receive a <strong>consent form</strong> outlining the therapeutic process, confidentiality, and your rights. This ensures complete transparency and establishes a foundation of trust for our work together.
                </p>
              </div>
              <div className="flex-1">
                <div className="grid grid-cols-2 gap-3">
                  {['100% Confidential', 'Online Sessions', 'Flexible Scheduling', 'Safe Space'].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 p-3 bg-white rounded-xl border border-lavender-100">
                      <CheckCircle className="w-4 h-4 text-lavender-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default AboutTherapist
