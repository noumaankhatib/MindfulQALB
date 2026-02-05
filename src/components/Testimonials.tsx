import { motion } from 'framer-motion'
import { Quote, Star } from 'lucide-react'

// Wellness/healing themed images from Unsplash
const testimonialsImages = {
  background: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=1200&q=80', // Soft abstract wellness
}

const Testimonials = () => {
  const testimonials = [
    {
      text: "Aqsa madam ne meri zindagi badal di. Anxiety ke saath jeena ab mushkil nahi lagta. Her understanding of both psychology and our cultural context made all the difference.",
      author: "Priya S.",
      role: "Individual Therapy",
      rating: 5,
      color: 'primary',
      delay: 0.1
    },
    {
      text: "After 8 years of marriage, we were on the verge of separation. The couples sessions saved our relationship. Aqsa ji understood our family dynamics perfectly.",
      author: "Rahul & Sneha",
      role: "Couples Therapy",
      rating: 5,
      color: 'accent',
      delay: 0.15
    },
    {
      text: "As a working mother dealing with depression, I needed someone who understands Indian family pressures. The sessions were life-changing. Highly recommend!",
      author: "Meera K.",
      role: "Depression Support",
      rating: 5,
      color: 'lavender',
      delay: 0.2
    },
    {
      text: "The holistic approach was exactly what I needed. Finally someone who understands the importance of healing the whole person—mind, body, and spirit. Truly grateful!",
      author: "Fatima A.",
      role: "Holistic Wellness",
      rating: 5,
      color: 'primary',
      delay: 0.25
    },
    {
      text: "Joint family issues were affecting my mental health badly. Aqsa madam helped me set healthy boundaries while respecting my in-laws. Dhanyavaad!",
      author: "Ananya R.",
      role: "Family Counseling",
      rating: 5,
      color: 'accent',
      delay: 0.3
    },
    {
      text: "My teenage son was struggling with exam stress and phone addiction. The family sessions helped us understand each other better. Very grateful!",
      author: "Suresh P.",
      role: "Adolescent Support",
      rating: 5,
      color: 'lavender',
      delay: 0.35
    },
  ]

  const colorClasses = {
    primary: { gradient: 'from-lavender-50 to-lavender-50/50', quote: 'text-lavender-200', border: 'border-lavender-100/50' },
    accent: { gradient: 'from-accent-50 to-cream-50/50', quote: 'text-accent-200', border: 'border-accent-100/50' },
    lavender: { gradient: 'from-lavender-50 to-lavender-50/30', quote: 'text-lavender-200', border: 'border-lavender-100/50' },
  }

  return (
    <section className="py-16 md:py-20 lg:py-24 relative overflow-hidden px-4 sm:px-6 lg:px-8">
      {/* Background with subtle image overlay */}
      <div className="absolute inset-0 section-gradient-lavender" />
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url(${testimonialsImages.background})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-800 mb-5">
            What Clients Say
          </h2>
          <div className="section-divider mb-6" />
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Real stories from people who've found support on their healing journey
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => {
            const colors = colorClasses[testimonial.color as keyof typeof colorClasses]
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.7,
                  delay: testimonial.delay,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
                whileHover={{ y: -6, scale: 1.01 }}
                className={`group bg-gradient-to-br ${colors.gradient} rounded-3xl p-8 ${colors.border} border shadow-soft hover:shadow-card-hover transition-all duration-500 ease-gentle relative overflow-hidden`}
              >
                {/* Quote decoration */}
                <div className="absolute -top-2 -left-2">
                  <Quote className={`w-20 h-20 ${colors.quote}`} />
                </div>
                
                {/* Rating stars */}
                <div className="flex gap-1 mb-5 relative z-10">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                
                <p className="text-lg text-gray-700 leading-relaxed mb-6 relative z-10 italic">
                  "{testimonial.text}"
                </p>
                
                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm border border-white/60 flex items-center justify-center text-gray-500 text-sm font-semibold shadow-soft">
                    {testimonial.author.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">
                      {testimonial.author}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default Testimonials
