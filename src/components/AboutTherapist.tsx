import { motion } from 'framer-motion'
import { Heart, Award, BookOpen, Users, Clock, Globe, CheckCircle, ArrowRight, GraduationCap, Star, MessageCircle } from 'lucide-react'

const AboutTherapist = () => {
  const qualifications = [
    { icon: GraduationCap, text: 'M.A. in Clinical Psychology' },
    { icon: Award, text: 'Certified Couples & Family Therapist' },
    { icon: BookOpen, text: 'Specialized in Islamic Psychology' },
    { icon: Users, text: '500+ Clients Helped' },
  ]

  const specializations = [
    'Anxiety & Depression',
    'Couples & Marriage Counseling',
    'Family Therapy',
    'Islamic Psychology',
    'Trauma & PTSD',
    'Women\'s Mental Health',
    'Adolescent Issues',
    'Grief & Loss',
  ]

  const approach = [
    {
      title: 'Culturally Sensitive',
      description: 'Understanding Indian family dynamics, joint family systems, and cultural nuances',
      icon: Globe,
    },
    {
      title: 'Faith-Integrated',
      description: 'Blending evidence-based therapy with Islamic principles when requested',
      icon: Heart,
    },
    {
      title: 'Evidence-Based',
      description: 'Using proven techniques like CBT, EFT, and trauma-informed care',
      icon: CheckCircle,
    },
    {
      title: 'Compassionate Care',
      description: 'Creating a safe, non-judgmental space for healing and growth',
      icon: MessageCircle,
    },
  ]

  return (
    <section id="about" className="py-28 md:py-36 relative overflow-hidden px-4 sm:px-6 lg:px-8">
      {/* Background */}
      <div className="absolute inset-0 section-gradient-light" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-lavender-100/60 border border-lavender-200/50 mb-6">
            <Heart className="w-4 h-4 text-lavender-600" />
            <span className="text-sm font-medium text-lavender-700">Meet Your Therapist</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-800 mb-5">
            Aqsa Khatib
          </h2>
          <div className="section-divider mb-6" />
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Clinical Psychologist & Certified Couples Therapist
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start mb-20">
          {/* Therapist Image & Quick Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="relative">
              {/* Decorative background */}
              <div className="absolute -inset-4 bg-gradient-to-br from-lavender-200/40 to-lavender-100/20 rounded-[2.5rem] blur-2xl" />
              
              {/* Image placeholder with gradient */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-lavender-500/20 border border-lavender-100/50 bg-gradient-to-br from-lavender-100 to-lavender-50 aspect-[4/5]">
                {/* Professional female therapist silhouette/avatar */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-40 h-40 rounded-full bg-gradient-to-br from-lavender-300 to-lavender-400 mx-auto mb-6 flex items-center justify-center shadow-lg">
                      <span className="text-6xl font-display font-bold text-white">AK</span>
                    </div>
                    <p className="text-lavender-600 font-medium">Professional Photo Coming Soon</p>
                  </div>
                </div>
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-lavender-900/20 via-transparent to-lavender-100/10" />
              </div>

              {/* Floating badges */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="absolute -bottom-6 -right-6 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-lg shadow-lavender-500/10 border border-lavender-100/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-lavender-500 to-lavender-600 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-lavender-600">5+</p>
                    <p className="text-xs text-gray-500">Years Experience</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="absolute top-8 -right-4 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-lg shadow-lavender-500/10 border border-lavender-100/50"
              >
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">500+ Happy Clients</p>
              </motion.div>
            </div>
          </motion.div>

          {/* About Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <h3 className="font-display text-2xl md:text-3xl font-semibold text-gray-800 mb-6">
              Healing with Compassion & Cultural Understanding
            </h3>
            
            <div className="prose prose-lg text-gray-600 mb-8">
              <p className="leading-relaxed">
                Assalam-u-Alaikum! I'm Aqsa Khatib, a clinical psychologist dedicated to helping 
                individuals, couples, and families navigate life's challenges. With a deep understanding 
                of Indian culture and Islamic values, I provide therapy that resonates with who you are.
              </p>
              <p className="leading-relaxed">
                Whether you're dealing with anxiety, relationship issues, or family conflicts, I create 
                a safe, non-judgmental space where you can heal and grow. My approach combines 
                evidence-based techniques with cultural sensitivity and, when desired, Islamic principles.
              </p>
              <p className="leading-relaxed">
                I believe that mental health is just as important as physical health, and seeking help 
                is a sign of strength. Let's work together towards a healthier, happier you.
              </p>
            </div>

            {/* Qualifications */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {qualifications.map((qual, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 p-3 bg-lavender-50/60 rounded-xl border border-lavender-100/50"
                >
                  <qual.icon className="w-5 h-5 text-lavender-600 flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-700">{qual.text}</span>
                </motion.div>
              ))}
            </div>

            <motion.a
              href="#get-help"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary inline-flex items-center gap-2 px-8 py-4 text-base font-medium group"
            >
              Book a Session with Aqsa
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </motion.a>
          </motion.div>
        </div>

        {/* Specializations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          className="mb-20"
        >
          <h3 className="font-display text-xl md:text-2xl font-semibold text-gray-800 text-center mb-8">
            Areas of Specialization
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {specializations.map((spec, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-lavender-200/50 text-sm font-medium text-gray-700 shadow-soft hover:shadow-gentle transition-all duration-300 hover:border-lavender-300"
              >
                {spec}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* Approach */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <h3 className="font-display text-xl md:text-2xl font-semibold text-gray-800 text-center mb-8">
            My Therapeutic Approach
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {approach.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -6 }}
                className="text-center p-6 bg-gradient-to-br from-lavender-50/80 to-white rounded-2xl border border-lavender-100/50 shadow-soft hover:shadow-card-hover transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-lavender-100/80 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-lavender-600" />
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">{item.title}</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default AboutTherapist
