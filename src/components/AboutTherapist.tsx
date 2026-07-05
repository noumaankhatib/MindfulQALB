import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Clock, ArrowRight, Star, Quote, Sparkles, ChevronDown, GraduationCap, Briefcase, Award, Globe, BookOpen, Lightbulb, Users, Brain, Shield, FileText } from 'lucide-react'
import profileImage from '../assets/images/profile_final_optimized.jpg'

const AboutTherapist = () => {
  const [showMoreDetails, setShowMoreDetails] = useState(false)

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
          <p className="text-lg md:text-xl text-lavender-600 font-medium mb-2">
            Counseling Psychologist & Therapist
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Master's in Counseling Psychology · CBT · NLP · Trauma-Informed · 3,000+ clinical hours
          </p>
          <motion.a
            href="#get-help"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm font-medium"
          >
            Book a Free Consultation
            <ArrowRight className="w-4 h-4" />
          </motion.a>
          <p className="text-xs text-gray-500 mt-3">
            Online sessions · India &amp; international clients · English &amp; Hindi
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
            className="lg:col-span-2 flex justify-center px-4 sm:px-0"
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
                  alt="Aqsa Khatib - Counseling Psychologist and Therapist at MindfulQALB"
                  className="w-full h-auto object-cover"
                  width={600}
                  height={800}
                  style={{ maxHeight: '800px', objectPosition: 'top' }}
                  loading="lazy"
                  decoding="async"
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
                    <p className="text-xs text-gray-500">Hours</p>
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

            {/* Credential pills — always visible */}
            <div className="flex flex-wrap gap-2 mb-5">
              {[
                { icon: GraduationCap, label: "Master's in Counseling Psychology" },
                { icon: Brain, label: "CBT Certified" },
                { icon: Users, label: "Family & Couple Therapy" },
                { icon: Sparkles, label: "NLP Practitioner" },
                { icon: Heart, label: "Trauma-Informed Care" },
              ].map(({ icon: Icon, label }) => (
                <span key={label} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-lavender-50 border border-lavender-200 text-lavender-700 text-xs font-semibold rounded-full">
                  <Icon className="w-3 h-3" />
                  {label}
                </span>
              ))}
            </div>

            {/* Stats row — always visible */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { value: '3000+', label: 'Clinical Hours', icon: Clock, color: 'text-lavender-600', bg: 'bg-lavender-50', border: 'border-lavender-200' },
                { value: '6+', label: 'Certifications', icon: Award, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
                { value: '3', label: 'Countries Reached', icon: Globe, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
              ].map(({ value, label, icon: Icon, color, bg, border }) => (
                <div key={label} className={`${bg} ${border} border rounded-xl p-3 text-center`}>
                  <Icon className={`w-4 h-4 ${color} mx-auto mb-1`} />
                  <p className={`text-lg font-bold ${color}`}>{value}</p>
                  <p className="text-xs text-gray-500 leading-tight">{label}</p>
                </div>
              ))}
            </div>

            {/* More Details Expandable */}
            <motion.button
              onClick={() => setShowMoreDetails(!showMoreDetails)}
              aria-expanded={showMoreDetails}
              aria-controls="about-more-details"
              className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-lavender-50 hover:bg-lavender-100 border border-lavender-200 text-lavender-700 font-semibold rounded-xl mb-4 transition-colors"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <span className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                {showMoreDetails ? 'Hide Full Profile' : 'View Full Profile'}
              </span>
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
                  id="about-more-details"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="space-y-4 mb-6">

                    {/* Education & Certifications */}
                    <div className="rounded-2xl overflow-hidden border border-lavender-100 shadow-sm">
                      <div className="bg-gradient-to-r from-lavender-500 to-purple-600 px-5 py-3 flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-white" />
                        <span className="text-white text-sm font-semibold">Education & Certifications</span>
                      </div>
                      <div className="bg-white p-4 space-y-2">
                        <div className="flex items-center gap-3 p-3 bg-lavender-50 rounded-xl border border-lavender-100">
                          <div className="w-8 h-8 rounded-full bg-lavender-500 flex items-center justify-center flex-shrink-0">
                            <GraduationCap className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-800">Master's in Counseling Psychology</p>
                            <p className="text-xs text-lavender-600">Postgraduate Degree</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          {[
                            { cert: "CBT", icon: Brain },
                            { cert: "Family & Couple Therapy", icon: Users },
                            { cert: "Psycho-oncology", icon: Heart },
                            { cert: "NLP Practitioner", icon: Sparkles },
                            { cert: "EFT & TFT Tapping", icon: Lightbulb },
                            { cert: "Trauma-Informed Care", icon: Shield },
                          ].map(({ cert, icon: CIcon }) => (
                            <div key={cert} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
                              <CIcon className="w-3.5 h-3.5 text-lavender-500 flex-shrink-0" />
                              <span className="text-xs text-gray-700 font-medium">{cert}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Professional Experience — timeline style */}
                    <div className="rounded-2xl overflow-hidden border border-amber-100 shadow-sm">
                      <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3 flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-white" />
                        <span className="text-white text-sm font-semibold">Professional Experience</span>
                      </div>
                      <div className="bg-white p-4">
                        <div className="relative pl-5">
                          {/* Vertical connector line */}
                          <div className="absolute left-1.5 top-2 bottom-2 w-0.5 bg-amber-200 rounded-full" />
                          <div className="space-y-4">
                            {[
                              { title: "Consultant Psychologist", desc: "Active clinical practice — individual, couple & family therapy", dot: "bg-amber-500" },
                              { title: "Supervisor & Mentor", desc: "Guiding junior therapists in their professional growth", dot: "bg-orange-400" },
                              { title: "Workshop Facilitator", desc: "Mental health bootcamps & corporate wellness training", dot: "bg-amber-400" },
                              { title: "US Startup Collaborator", desc: "Developing mental health modules & wellness programs", dot: "bg-orange-500" },
                            ].map(({ title, desc, dot }) => (
                              <div key={title} className="relative">
                                <div className={`absolute -left-5 top-1.5 w-3 h-3 rounded-full ${dot} border-2 border-white shadow-sm`} />
                                <p className="text-sm font-semibold text-gray-800">{title}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Recognition & Outreach */}
                    <div className="rounded-2xl overflow-hidden border border-emerald-100 shadow-sm">
                      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3 flex items-center gap-2">
                        <Award className="w-4 h-4 text-white" />
                        <span className="text-white text-sm font-semibold">Recognition & Outreach</span>
                      </div>
                      <div className="bg-white p-4 space-y-3">
                        {[
                          { icon: BookOpen, label: "PRESS", badge: "bg-rose-100 text-rose-700", title: "Featured in Inquilab Newspaper", desc: "Promoting unconventional career paths & youth guidance" },
                          { icon: Globe, label: "BERLIN UNIVERSITY", badge: "bg-blue-100 text-blue-700", title: "International Webinars", desc: "Career Guidance · Interview Prep · Emotional Regulation" },
                          { icon: FileText, label: "VHEALTHY", badge: "bg-teal-100 text-teal-700", title: "Published Author", desc: "Articles on mental wellness & psychological frameworks" },
                        ].map(({ icon: IIcon, label, badge, title, desc }) => (
                          <div key={title} className="flex gap-3 items-start p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <IIcon className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                <p className="text-sm font-semibold text-gray-800">{title}</p>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${badge}`}>{label}</span>
                              </div>
                              <p className="text-xs text-gray-500">{desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Philosophy */}
                    <div className="relative bg-gradient-to-br from-lavender-50 to-purple-50 rounded-2xl p-5 overflow-hidden border border-lavender-200">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-lavender-100/40 rounded-full -translate-y-10 translate-x-10" />
                      <div className="absolute bottom-0 left-0 w-20 h-20 bg-purple-100/40 rounded-full translate-y-8 -translate-x-6" />
                      <div className="relative">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-7 h-7 rounded-lg bg-lavender-100 flex items-center justify-center">
                            <Quote className="w-4 h-4 text-lavender-600" />
                          </div>
                          <span className="text-lavender-700 text-xs font-bold uppercase tracking-wider">My Philosophy</span>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed mb-4">
                          I bring <strong className="text-lavender-700">versatility, creativity, and depth</strong> into my practice. Therapy should not feel clinical — it should feel <strong className="text-lavender-700">human, safe, and transformative.</strong>
                        </p>
                        <blockquote className="border-l-2 border-lavender-400 pl-3">
                          <p className="text-lavender-600 text-xs leading-relaxed italic">
                            "Creativity and insight are not just encouraged — they are essential for growth."
                          </p>
                        </blockquote>
                      </div>
                    </div>

                    {/* Areas of Focus */}
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                      <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Areas of Focus</h5>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { text: 'Anxiety & Overthinking', bg: 'bg-blue-50', border: 'border-blue-200', color: 'text-blue-700' },
                          { text: 'Grief & Trauma', bg: 'bg-purple-50', border: 'border-purple-200', color: 'text-purple-700' },
                          { text: 'Career Stress & Burnout', bg: 'bg-amber-50', border: 'border-amber-200', color: 'text-amber-700' },
                          { text: 'Relationships & Family', bg: 'bg-rose-50', border: 'border-rose-200', color: 'text-rose-700' },
                          { text: 'Self-Esteem & Growth', bg: 'bg-emerald-50', border: 'border-emerald-200', color: 'text-emerald-700' },
                          { text: 'Psycho-oncology', bg: 'bg-teal-50', border: 'border-teal-200', color: 'text-teal-700' },
                          { text: 'Emotional Regulation', bg: 'bg-indigo-50', border: 'border-indigo-200', color: 'text-indigo-700' },
                        ].map(({ text, bg, border, color }) => (
                          <span key={text} className={`px-3 py-1.5 ${bg} ${border} border ${color} text-xs font-semibold rounded-full`}>
                            {text}
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

        {/* Pricing teaser — full details in Get Help */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-br from-lavender-50/80 to-white rounded-2xl p-6 md:p-8 border border-lavender-100/50 text-center max-w-2xl mx-auto">
            <p className="text-gray-700 mb-2">
              Sessions from <strong className="text-lavender-600">₹499</strong> · Free 15-minute consultation
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Chat, audio, and video formats · Couples sessions available · Transparent pricing, no hidden fees
            </p>
            <motion.a
              href="#get-help"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="btn-secondary inline-flex items-center gap-2"
            >
              View pricing &amp; book
              <ArrowRight className="w-4 h-4" />
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default AboutTherapist
