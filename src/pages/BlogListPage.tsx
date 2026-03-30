import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Clock, ArrowRight, BookOpen, Sparkles } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import Logo from '../components/Logo'
import { blogPosts } from '../data/blogPosts'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: [0.25, 0.1, 0.25, 1] },
  }),
}

const BlogListPage = () => {
  useEffect(() => { window.scrollTo(0, 0) }, [])

  const featured = blogPosts[0]
  const rest = blogPosts.slice(1)

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #FEFCFF 0%, #F7F4FF 60%, #F0EDFF 100%)' }}>
      <Helmet>
        <title>Mental Health &amp; Wellness Blog | Mindful QALB</title>
        <meta name="description" content="Explore articles on emotional wellness, family dynamics, generational trauma, couple therapy, and mindful healing — by Aqsa Khatib, Counseling Psychologist." />
        <link rel="canonical" href="https://www.mindfulqalb.com/blog" />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Mental Health &amp; Wellness Blog | Mindful QALB" />
        <meta property="og:description" content="Insights and education on mental health, relationships, and emotional wellness — by Aqsa Khatib, Counseling Psychologist." />
        <meta property="og:url" content="https://www.mindfulqalb.com/blog" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://www.mindfulqalb.com/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@mindfulqalb" />
        <meta name="twitter:title" content="Mental Health &amp; Wellness Blog | Mindful QALB" />
        <meta name="twitter:description" content="Insights and education on mental health, relationships, and emotional wellness." />
        <meta name="twitter:image" content="https://www.mindfulqalb.com/og-image.png" />
      </Helmet>

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-lavender-100/80"
        style={{ boxShadow: '0 1px 0 rgba(139,92,246,0.06)' }}>
        <div className="section-container py-3.5 flex items-center justify-between">
          <Link to="/"><Logo size="md" showText={true} /></Link>
          <Link to="/" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-lavender-600 transition-colors duration-200">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* ── Hero ── compact, punchy */}
      <section className="relative overflow-hidden pt-14 pb-10 px-4 sm:px-6 lg:px-8">
        {/* background blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="floating-shape floating-shape-lavender w-96 h-96 opacity-30 -top-32 -right-20 animate-float-slow" />
          <div className="floating-shape floating-shape-primary w-72 h-72 opacity-20 -bottom-16 -left-16 animate-float-medium" />
        </div>

        <motion.div
          className="section-container relative z-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6"
          initial="hidden"
          animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
        >
          <div>
            <motion.div variants={fadeUp} className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 bg-lavender-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                <Sparkles className="w-3 h-3" />
                Mindful QALB
              </span>
              <span className="text-gray-400 text-xs">·</span>
              <span className="text-gray-400 text-xs font-medium">{blogPosts.length} articles</span>
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="font-display text-4xl md:text-5xl font-semibold text-gray-900 leading-[1.1] mb-3"
            >
              Articles &amp; Blog
            </motion.h1>
            <motion.p variants={fadeUp} className="text-gray-500 text-base md:text-lg max-w-lg leading-relaxed">
              Insights on emotional wellness, relationships, and mindful healing.
            </motion.p>
          </div>

          {/* topic pills */}
          <motion.div variants={fadeUp} className="flex flex-wrap gap-2 md:justify-end">
            {['Emotional Wellness', 'Relationships', 'Grief & Loss', 'Mindfulness'].map((t) => (
              <span key={t} className="text-xs font-medium text-lavender-700 bg-lavender-50 border border-lavender-200/70 px-3 py-1.5 rounded-full whitespace-nowrap">
                {t}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── Divider ── */}
      <div className="h-px mx-4 sm:mx-8 lg:mx-16 bg-gradient-to-r from-transparent via-lavender-200/60 to-transparent mb-10" />

      <div className="section-container pb-24">

        {/* ── Featured post ── */}
        {featured && (
          <motion.section
            className="mb-16"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px flex-1 bg-gradient-to-r from-lavender-200 to-transparent" />
              <span className="text-[11px] font-bold text-lavender-500 uppercase tracking-[0.12em]">Featured Article</span>
              <div className="h-px flex-1 bg-gradient-to-l from-lavender-200 to-transparent" />
            </div>

            <Link
              to={`/blog/${featured.slug}`}
              className="group relative block rounded-3xl overflow-hidden bg-white border border-lavender-100 hover:border-lavender-300/70 transition-all duration-400"
              style={{ boxShadow: '0 2px 20px rgba(139,92,246,0.07)' }}
            >
              {/* coloured left accent bar */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-lavender-400 via-lavender-600 to-lavender-400 rounded-l-3xl" />
              {/* top-right decorative blob */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-lavender-50 to-transparent pointer-events-none" />

              <div className="pl-8 pr-8 md:pr-12 py-8 md:py-10 relative">
                {/* meta row */}
                <div className="flex flex-wrap items-center gap-3 mb-5">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-lavender-700 bg-lavender-50 border border-lavender-200/80 px-3 py-1.5 rounded-full uppercase tracking-wide">
                    {featured.category}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
                    <Clock className="w-3 h-3" />
                    {featured.readingTime} min read
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(featured.publishedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>

                {/* title + description side by side on large */}
                <div className="flex flex-col lg:flex-row lg:items-start lg:gap-12">
                  <div className="flex-1">
                    <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-semibold text-gray-900 leading-[1.2] mb-4 group-hover:text-lavender-700 transition-colors duration-300">
                      {featured.title}
                    </h2>
                  </div>
                  <div className="lg:w-80 xl:w-96 flex-shrink-0">
                    <p className="text-gray-500 leading-relaxed text-sm md:text-base mb-6">
                      {featured.description}
                    </p>
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-lavender-600 group-hover:text-lavender-800 transition-colors duration-200">
                      Read article
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-lavender-100 group-hover:bg-lavender-600 group-hover:text-white transition-all duration-300">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </span>
                  </div>
                </div>

              </div>
            </Link>
          </motion.section>
        )}

        {/* ── Grid ── */}
        {rest.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-7">
              <div className="h-px flex-1 bg-gradient-to-r from-lavender-200 to-transparent" />
              <span className="text-[11px] font-bold text-lavender-500 uppercase tracking-[0.12em]">More Articles</span>
              <div className="h-px flex-1 bg-gradient-to-l from-lavender-200 to-transparent" />
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {rest.map((post, i) => (
                <motion.div
                  key={post.id}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-40px' }}
                  variants={fadeUp}
                >
                  <Link
                    to={`/blog/${post.slug}`}
                    className="group flex flex-col h-full rounded-2xl bg-white border border-lavender-100/80 overflow-hidden hover:border-lavender-300/70 hover:-translate-y-1.5 transition-all duration-300"
                    style={{ boxShadow: '0 1px 12px rgba(139,92,246,0.05)' }}
                  >
                    {/* coloured top strip */}
                    <div className="h-1 w-full bg-gradient-to-r from-lavender-400 to-lavender-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="flex flex-col flex-1 p-6">
                      {/* category + read time */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[11px] font-bold text-lavender-600 uppercase tracking-wide">
                          {post.category.split('|')[0].trim()}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-gray-400">
                          <Clock className="w-3 h-3" />
                          {post.readingTime} min
                        </span>
                      </div>

                      <h3 className="font-display text-base md:text-[1.05rem] font-semibold text-gray-900 leading-snug mb-3 group-hover:text-lavender-700 transition-colors duration-200 flex-1 line-clamp-3">
                        {post.title}
                      </h3>

                      <p className="text-sm text-gray-400 leading-relaxed line-clamp-2 mb-5">
                        {post.description}
                      </p>

                      {/* footer */}
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                        <span className="text-[11px] text-gray-400">
                          {new Date(post.publishedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-lavender-600 group-hover:gap-2.5 transition-all duration-200">
                          Read <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {blogPosts.length === 0 && (
          <div className="text-center py-24 text-gray-400">
            <BookOpen className="w-10 h-10 mx-auto mb-4 opacity-30" />
            <p className="text-lg">No articles yet. Check back soon.</p>
          </div>
        )}

        {/* ── CTA ── */}
        <motion.div
          className="mt-20 text-center py-16 border-t border-lavender-100/60"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <span className="inline-block text-[11px] font-bold text-lavender-500 uppercase tracking-[0.14em] mb-4">Take the next step</span>
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-gray-900 mb-3">Ready to start your healing journey?</h2>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto leading-relaxed text-sm md:text-base">
            Explore therapy options with Aqsa Khatib — individual, couple, and family sessions available online.
          </p>
          <Link to="/#get-help" className="btn-primary inline-flex items-center gap-2">
            <span className="relative z-10 flex items-center gap-2">
              Book a Free Consultation <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        </motion.div>

      </div>
    </div>
  )
}

export default BlogListPage
