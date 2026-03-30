import { useEffect } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Clock, ArrowRight, BookOpen } from 'lucide-react'
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

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>()
  const post = blogPosts.find((p) => p.slug === slug)
  const postIndex = blogPosts.findIndex((p) => p.slug === slug)
  const prevPost = postIndex > 0 ? blogPosts[postIndex - 1] : null
  const nextPost = postIndex < blogPosts.length - 1 ? blogPosts[postIndex + 1] : null
  const related = blogPosts.filter((p) => p.slug !== slug).slice(0, 3)

  useEffect(() => { window.scrollTo(0, 0) }, [slug])

  if (!post) return <Navigate to="/blog" replace />

  const formattedDate = new Date(post.publishedDate).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #FEFCFF 0%, #F7F4FF 60%, #F0EDFF 100%)' }}>
      <Helmet>
        <title>{post.seoTitle}</title>
        <meta name="description" content={post.seoDescription} />
        <link rel="canonical" href={`https://www.mindfulqalb.com/blog/${post.slug}`} />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content={post.seoTitle} />
        <meta property="og:description" content={post.seoDescription} />
        <meta property="og:url" content={`https://www.mindfulqalb.com/blog/${post.slug}`} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content="https://www.mindfulqalb.com/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="article:published_time" content={post.publishedDate} />
        {post.lastModified && <meta property="article:modified_time" content={post.lastModified} />}
        <meta property="article:author" content="Aqsa Khatib" />
        {post.tags.map((tag) => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}
        <meta name="keywords" content={[...post.keywords, ...post.tags].join(', ')} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@mindfulqalb" />
        <meta name="twitter:title" content={post.seoTitle} />
        <meta name="twitter:description" content={post.seoDescription} />
        <meta name="twitter:image" content="https://www.mindfulqalb.com/og-image.png" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Article',
          '@id': `https://www.mindfulqalb.com/blog/${post.slug}#article`,
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `https://www.mindfulqalb.com/blog/${post.slug}`,
          },
          headline: post.seoTitle,
          description: post.seoDescription,
          image: {
            '@type': 'ImageObject',
            url: 'https://www.mindfulqalb.com/og-image.png',
            width: 1200,
            height: 630,
          },
          datePublished: post.publishedDate,
          dateModified: post.lastModified || post.publishedDate,
          author: {
            '@type': 'Person',
            '@id': 'https://www.mindfulqalb.com/#person-aqsa-khatib',
            name: 'Aqsa Khatib',
            url: 'https://www.mindfulqalb.com/#about',
          },
          publisher: {
            '@type': 'Organization',
            '@id': 'https://www.mindfulqalb.com/#organization',
            name: 'Mindful QALB',
            url: 'https://www.mindfulqalb.com',
            logo: {
              '@type': 'ImageObject',
              url: 'https://www.mindfulqalb.com/favicon.svg',
            },
          },
          isPartOf: { '@id': 'https://www.mindfulqalb.com/#website' },
          keywords: post.keywords.join(', '),
          url: `https://www.mindfulqalb.com/blog/${post.slug}`,
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.mindfulqalb.com/' },
            { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://www.mindfulqalb.com/blog' },
            { '@type': 'ListItem', position: 3, name: post.title, item: `https://www.mindfulqalb.com/blog/${post.slug}` },
          ],
        })}</script>
      </Helmet>

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-lavender-100/80"
        style={{ boxShadow: '0 1px 0 rgba(139,92,246,0.06)' }}>
        <div className="section-container py-3.5 flex items-center justify-between">
          <Link to="/"><Logo size="md" showText={true} /></Link>
          <Link to="/blog" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-lavender-600 transition-colors duration-200">
            <ArrowLeft className="w-3.5 h-3.5" />
            All Articles
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        {/* full-width lavender band */}
        <div className="absolute inset-0 bg-gradient-to-br from-lavender-50/90 via-white to-lavender-100/20 pointer-events-none" />
        <div className="floating-shape floating-shape-lavender w-80 h-80 opacity-25 -top-20 -right-16 animate-float-slow" />
        <div className="floating-shape floating-shape-primary w-56 h-56 opacity-15 bottom-0 -left-12 animate-float-medium" />

        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-12 pb-10 relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
          >
            {/* breadcrumb */}
            <motion.div variants={fadeUp} className="flex items-center gap-2 text-xs text-gray-400 mb-6">
              <Link to="/" className="hover:text-lavender-600 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/blog" className="hover:text-lavender-600 transition-colors">Blog</Link>
              <span>/</span>
              <span className="text-gray-500 truncate max-w-[160px]">{post.title}</span>
            </motion.div>

            {/* meta */}
            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-2.5 mb-6">
              <span className="inline-flex items-center text-[11px] font-bold text-lavender-700 bg-lavender-100 border border-lavender-200/80 px-3 py-1.5 rounded-full uppercase tracking-wide">
                {post.category}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-gray-400 bg-white/80 border border-gray-100 px-2.5 py-1.5 rounded-full">
                <Clock className="w-3 h-3" /> {post.readingTime} min read
              </span>
              <span className="text-xs text-gray-400">{formattedDate}</span>
            </motion.div>

            {/* title */}
            <motion.h1
              variants={fadeUp}
              className="font-display text-3xl md:text-4xl lg:text-[2.6rem] font-semibold text-gray-900 leading-[1.18] mb-6"
            >
              {post.title}
            </motion.h1>

            {/* description — lead paragraph style */}
            <motion.div
              variants={fadeUp}
              className="relative pl-5"
            >
              <div className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full bg-gradient-to-b from-lavender-400 to-lavender-300" />
              <p className="text-base md:text-lg text-gray-500 leading-relaxed italic">
                {post.description}
              </p>
            </motion.div>

            {/* author byline */}
            <motion.div variants={fadeUp} className="flex items-center gap-3 mt-6 pt-5 border-t border-lavender-100/60">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-lavender-400 to-lavender-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">AK</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Aqsa Khatib</p>
                <p className="text-xs text-gray-400">Counseling Psychologist · {formattedDate} · {post.readingTime} min read</p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* bottom fade */}
        <div className="h-px bg-gradient-to-r from-transparent via-lavender-200/50 to-transparent" />
      </section>

      {/* ── Article body ── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <article className="space-y-0">
          {post.sections.map((section, i) => (
            <motion.div
              key={i}
              custom={i * 0.05}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={fadeUp}
              className="mb-9"
            >
              {section.heading && (
                <h2 className="font-display text-xl md:text-2xl font-semibold text-gray-900 mt-10 mb-4 pb-2 border-b border-lavender-100/60">
                  {section.heading}
                </h2>
              )}
              {section.subheading && (
                <h3 className="font-display text-base md:text-lg font-semibold text-gray-800 mt-6 mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-lavender-500 inline-block flex-shrink-0" />
                  {section.subheading}
                </h3>
              )}
              {section.body && (
                <div className="text-gray-600 leading-[1.9] whitespace-pre-line text-base md:text-[1.0625rem]">
                  {section.body}
                </div>
              )}
              {section.list && (
                <ul className="mt-4 space-y-2.5">
                  {section.list.map((item, j) => (
                    <li key={j} className="flex items-start gap-3 text-gray-600 text-base md:text-[1.0625rem] leading-relaxed">
                      <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-lavender-400 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
              {section.numberedList && (
                <ol className="mt-5 space-y-5">
                  {section.numberedList.map((item, j) => (
                    <li key={j} className="flex gap-4">
                      <span
                        className="flex-shrink-0 w-8 h-8 rounded-full text-lavender-700 font-bold text-sm flex items-center justify-center border border-lavender-200"
                        style={{ background: 'linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%)' }}
                      >
                        {j + 1}
                      </span>
                      <div className="pt-1">
                        <p className="font-semibold text-gray-900 mb-1.5 text-base md:text-[1.0625rem]">{item.title}</p>
                        <p className="text-gray-500 leading-relaxed text-sm md:text-base">{item.body}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
              {section.tip && (
                <div className="mt-5 relative rounded-2xl overflow-hidden border border-lavender-200/60"
                  style={{ background: 'linear-gradient(135deg, rgba(250,248,255,0.9) 0%, rgba(237,233,254,0.5) 100%)' }}>
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-lavender-400 to-lavender-600 rounded-l-2xl" />
                  <div className="pl-6 pr-5 py-4 flex gap-3 items-start">
                    <span className="text-lavender-500 mt-0.5 flex-shrink-0">✦</span>
                    <p className="text-sm md:text-base text-lavender-800 leading-relaxed italic">{section.tip}</p>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </article>

        {/* ── Prev / Next ── */}
        {(prevPost || nextPost) && (
          <div className="mt-10 pt-8 border-t border-lavender-100/60 grid sm:grid-cols-2 gap-4">
            {prevPost ? (
              <Link
                to={`/blog/${prevPost.slug}`}
                className="group flex flex-col gap-2 rounded-2xl bg-white border border-lavender-100 p-5 hover:border-lavender-300/70 hover:-translate-y-1 transition-all duration-300"
                style={{ boxShadow: '0 1px 8px rgba(139,92,246,0.05)' }}
              >
                <span className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                  <ArrowLeft className="w-3.5 h-3.5" /> Previous
                </span>
                <span className="font-display text-sm font-semibold text-gray-800 group-hover:text-lavender-700 leading-snug transition-colors line-clamp-2">
                  {prevPost.title}
                </span>
              </Link>
            ) : <div />}
            {nextPost && (
              <Link
                to={`/blog/${nextPost.slug}`}
                className="group flex flex-col gap-2 rounded-2xl bg-white border border-lavender-100 p-5 hover:border-lavender-300/70 hover:-translate-y-1 transition-all duration-300 sm:text-right"
                style={{ boxShadow: '0 1px 8px rgba(139,92,246,0.05)' }}
              >
                <span className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wide sm:justify-end">
                  Next <ArrowRight className="w-3.5 h-3.5" />
                </span>
                <span className="font-display text-sm font-semibold text-gray-800 group-hover:text-lavender-700 leading-snug transition-colors line-clamp-2">
                  {nextPost.title}
                </span>
              </Link>
            )}
          </div>
        )}

        {/* ── Related articles ── */}
        {related.length > 0 && (
          <motion.div
            className="mt-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px flex-1 bg-gradient-to-r from-lavender-200 to-transparent" />
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-lavender-500 uppercase tracking-[0.12em]">
                <BookOpen className="w-3.5 h-3.5" /> More Articles
              </span>
              <div className="h-px flex-1 bg-gradient-to-l from-lavender-200 to-transparent" />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {related.map((p, i) => (
                <motion.div key={p.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                  <Link
                    to={`/blog/${p.slug}`}
                    className="group flex flex-col h-full rounded-2xl bg-white border border-lavender-100/80 p-5 hover:border-lavender-300/70 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                    style={{ boxShadow: '0 1px 8px rgba(139,92,246,0.05)' }}
                  >
                    <div className="h-0.5 w-0 bg-gradient-to-r from-lavender-400 to-lavender-600 group-hover:w-full transition-all duration-500 rounded mb-4 -mx-5 px-0" style={{ marginTop: '-20px', marginLeft: '-20px', marginRight: '-20px', paddingLeft: 0 }} />
                    <span className="text-[11px] font-bold text-lavender-600 uppercase tracking-wide mb-2 block">
                      {p.category.split('|')[0].trim()}
                    </span>
                    <h3 className="font-display text-sm font-semibold text-gray-800 group-hover:text-lavender-700 leading-snug flex-1 mb-3 line-clamp-3 transition-colors duration-200">
                      {p.title}
                    </h3>
                    <span className="flex items-center gap-1.5 text-[11px] text-gray-400 mt-auto">
                      <Clock className="w-3 h-3" /> {p.readingTime} min read
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── CTA ── */}
        <motion.div
          className="mt-16 pt-14 border-t border-lavender-100/60 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <span className="inline-block text-[11px] font-bold text-lavender-500 uppercase tracking-[0.14em] mb-4">Take the next step</span>
          <h2 className="font-display text-xl md:text-2xl font-semibold text-gray-900 mb-3">Ready to begin your journey?</h2>
          <p className="text-gray-500 mb-7 max-w-sm mx-auto text-sm leading-relaxed">
            Speak with Aqsa Khatib — licensed therapist offering individual, couple, and family sessions online.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/#get-help" className="btn-primary inline-flex items-center justify-center gap-2">
              <span className="relative z-10 flex items-center gap-2">
                Book a Free Consultation <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
            <Link
              to="/blog"
              className="inline-flex items-center justify-center gap-2 border border-lavender-200 text-lavender-700 bg-white px-6 py-3 rounded-xl font-medium text-sm hover:bg-lavender-50 hover:border-lavender-300 transition-all duration-300"
            >
              <BookOpen className="w-4 h-4" /> More Articles
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default BlogPostPage
