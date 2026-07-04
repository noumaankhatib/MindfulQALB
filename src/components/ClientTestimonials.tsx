import { motion } from 'framer-motion'
import { Quote, Star, ArrowRight } from 'lucide-react'
import { clientTestimonials } from '../data/testimonials'

const ease = [0.25, 0.1, 0.25, 1] as const

const ClientTestimonials = () => {
  return (
    <section
      id="testimonials"
      className="py-12 sm:py-16 md:py-20 relative overflow-hidden px-4 sm:px-6 lg:px-8"
    >
      <div className="absolute inset-0 section-gradient-lavender" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease }}
          className="text-center mb-8 sm:mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-lavender-200/50 mb-4 shadow-soft">
            <Quote className="w-4 h-4 text-lavender-600" />
            <span className="text-sm font-medium text-lavender-700">Real Stories, Real Results</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-800 mb-3">
            What Clients Say
          </h2>
          <div className="section-divider mb-4" />
          <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto">
            Hear from people who found a safe space and meaningful change through therapy.
          </p>
          <div className="flex items-center justify-center gap-1 mt-4" aria-label="5 out of 5 stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="w-4 h-4 text-amber-400 fill-amber-400" />
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {clientTestimonials.map((testimonial, index) => (
            <motion.article
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: index * 0.1, duration: 0.6, ease }}
              whileHover={{ y: -4 }}
              className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-lavender-100/50 shadow-soft hover:shadow-card-hover transition-all duration-300"
            >
              <div className="absolute -top-2.5 left-4">
                <span className="bg-gradient-to-r from-lavender-500 to-lavender-600 text-white text-xs font-medium px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full">
                  {testimonial.highlight}
                </span>
              </div>

              <div className="pt-3 sm:pt-4">
                <Quote className="w-6 h-6 sm:w-8 sm:h-8 text-lavender-200 mb-2 sm:mb-3" aria-hidden />
                <p className="text-gray-600 leading-relaxed text-sm line-clamp-4 sm:line-clamp-5 mb-4 sm:mb-6">
                  &ldquo;{testimonial.text}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-3 sm:pt-4 border-t border-lavender-100/50">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-lavender-400 to-lavender-500 flex items-center justify-center shrink-0">
                    <span className="text-white font-semibold text-xs sm:text-sm">
                      {testimonial.author}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 text-sm truncate">{testimonial.name}</p>
                    <p className="text-xs text-gray-500">{testimonial.details}</p>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="text-center mt-8 sm:mt-10"
        >
          <a
            href="#get-help"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-lavender-600 hover:text-lavender-700 transition-colors"
          >
            Ready to start? Book a free consultation
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}

export default ClientTestimonials
