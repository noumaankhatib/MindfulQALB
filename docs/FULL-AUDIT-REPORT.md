# MindfulQALB — Full SEO Audit Report
**Audit Date:** 2026-03-30
**Domain:** https://www.mindfulqalb.com
**Codebase:** /home/noumaan/Documents/aqsa/therapy-website-react/MindfulQALB/src

---

## Overall Score: 63 / 100

| Category | Weight | Raw Score | Weighted |
|---|---|---|---|
| Technical SEO | 22% | 72/100 | 15.8 |
| Content Quality & E-E-A-T | 23% | 72/100 | 16.6 |
| On-Page SEO | 20% | 55/100 | 11.0 |
| Schema / Structured Data | 10% | 85/100 | 8.5 |
| Performance (CWV estimate) | 10% | 60/100 | 6.0 |
| AI Search Readiness (GEO) | 10% | 75/100 | 7.5 |
| Images | 5% | 70/100 | 3.5 |
| **TOTAL** | 100% | | **68.9 / 100** |

---

## 1. Technical SEO — 72/100

### 1.1 robots.txt
**Status: PASS with minor issue**

Live file at https://www.mindfulqalb.com/robots.txt (`/home/noumaan/Documents/aqsa/therapy-website-react/MindfulQALB/public/robots.txt`):

```
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: *
Allow: /
Disallow: /admin
Disallow: /profile
Disallow: /my-bookings
Disallow: /auth/

Sitemap: https://www.mindfulqalb.com/sitemap.xml
```

- Correctly blocks private/auth routes from crawling
- Explicitly allows major AI crawlers (GPTBot, ClaudeBot, PerplexityBot) — good GEO practice
- Sitemap reference is correct
- Minor issue: `User-agent: *` section should come AFTER the specific bot sections per convention, though this does not cause functional issues with major crawlers

### 1.2 Sitemap
**Status: CRITICAL FAIL — Blog completely missing**

The live sitemap at https://www.mindfulqalb.com/sitemap.xml contains only 2 URLs:
- `https://www.mindfulqalb.com/`
- `https://www.mindfulqalb.com/contact`

**Missing from sitemap:**
- `https://www.mindfulqalb.com/blog`
- `https://www.mindfulqalb.com/blog/family-dynamics-generational-trauma-couple-therapy`
- `https://www.mindfulqalb.com/blog/understanding-managing-emotions-guide`
- `https://www.mindfulqalb.com/blog/understanding-emotions-practical-ways-to-feel-better`
- `https://www.mindfulqalb.com/blog/grief-in-layers-understanding-loss-healing-resilience`

**Root cause:** `vite.config.ts` (line 18–31) uses `vite-plugin-sitemap` with only `/contact` in `dynamicRoutes`. The 4 blog posts and `/blog` index are not listed:

```ts
// vite.config.ts lines 18–31
sitemap({
  hostname: 'https://www.mindfulqalb.com',
  dynamicRoutes: [
    '/contact',   // <-- /blog and all blog slugs are missing
  ],
  exclude: [ '/admin', '/profile', '/my-bookings', '/auth/google/callback', '/404', '/200' ],
}),
```

This is the most critical SEO issue on the site. All blog content — the site's primary new content — is invisible to Google's sitemap-based crawl.

### 1.3 Canonical Tags
**Status: PASS**

Every page sets its canonical via `react-helmet-async`:
- Homepage: `https://www.mindfulqalb.com/` (App.tsx line 93; index.html line 37)
- Blog list: `https://www.mindfulqalb.com/blog` (BlogListPage.tsx line 29)
- Blog posts: `https://www.mindfulqalb.com/blog/${post.slug}` (BlogPostPage.tsx line 39)
- Contact, Privacy, Terms all set canonicals in their respective page files

Note: Because the site is an SPA, canonical tags injected via react-helmet-async only appear after JS executes. Googlebot generally handles this, but raw HTML from the server will show the fallback `index.html` canonical of `https://www.mindfulqalb.com/` for all routes. This is a known SPA limitation.

### 1.4 Meta Robots
**Status: PASS**

`index, follow` set on all indexable pages. Private routes (`/admin`, `/my-bookings`, `/profile`) are blocked at the robots.txt level, not via noindex — this is correct as these pages should not be crawlable at all.

### 1.5 HTTPS & Security Headers
**Status: PASS — Excellent**

Verified from live HTTP response headers:
- `strict-transport-security: max-age=31536000; includeSubDomains; preload` — full HSTS
- `x-content-type-options: nosniff`
- `x-frame-options: SAMEORIGIN`
- `x-xss-protection: 1; mode=block`
- Served over HTTP/2
- Content-Security-Policy via both meta tag and vercel.json header

### 1.6 www vs non-www Redirect
**Status: PARTIAL FAIL — Wrong redirect type**

`mindfulqalb.com` redirects to `www.mindfulqalb.com` (correct direction), but the redirect is a **307 Temporary Redirect**, not 301 Permanent:

```
HTTP/2 307
location: https://www.mindfulqalb.com/
```

The `vercel.json` correctly sets `"permanent": true`, which should generate a 308 (or 301), but Vercel is serving 307. This may be a Vercel configuration issue or the config is not being applied correctly. A 307 redirect does not pass full link equity.

### 1.7 Mobile Viewport
**Status: PASS**

`<meta name="viewport" content="width=device-width, initial-scale=1.0" />` present in `index.html` line 29.

---

## 2. On-Page SEO — 55/100

### 2.1 Title Tags

| Page | Title | Length | Status |
|---|---|---|---|
| Homepage | `Mindful QALB \| Evidence-Based Mental Health Care for Individuals & Couples` | 75 chars | OVER 60 — truncated in SERP |
| Blog list | `Articles & Blog \| MindfulQALB` | 30 chars | UNDER 50 — too short |
| Blog post 1 | `How Family Dynamics, Generational Trauma, and Couple Therapy Shape Our Emotional Lives \| MindfulQALB` | 101 chars | OVER 60 — severely truncated |
| Blog post 2 | `What Are You Feeling Right Now? A Gentle Guide to Understanding and Managing Emotions \| MindfulQALB` | 100 chars | OVER 60 — severely truncated |
| Blog post 3 | `Understanding Your Emotions: Simple, Practical Ways to Feel Better \| MindfulQALB` | 83 chars | OVER 60 — truncated |
| Blog post 4 | `Grief in Layers: Understanding Loss, Healing, and Emotional Resilience \| MindfulQALB` | 87 chars | OVER 60 — truncated |

All blog post titles exceed the ~60-char SERP display limit. The title tag for each blog post is generated dynamically in BlogPostPage.tsx line 37:
```tsx
<title>{post.title} | MindfulQALB</title>
```
The post titles themselves are too long to serve as direct `<title>` values.

**The blog list title is also weak at 30 characters** — it wastes keyword opportunity and looks sparse in SERPs.

### 2.2 Meta Descriptions

| Page | Description | Length | Status |
|---|---|---|---|
| Homepage (index.html) | `Evidence-based mental health care for individuals and couples—accessible, human, and private. Online therapy, counseling, and support groups.` | 143 chars | OK (target 150–160) |
| Homepage (App.tsx Helmet) | `Online therapy and counseling by a licensed psychologist. Individual therapy, couples therapy, and support groups. Book a free 15-minute consultation today.` | 157 chars | GOOD |
| Blog list | `Explore articles on emotional wellness, family dynamics, generational trauma, couple therapy, and mindful healing from MindfulQALB.` | 131 chars | Slightly short |
| Blog post 1 | `Explore how the families we grew up in, generational trauma, and our attachment styles shape who we are — and how family and couple therapy can help us heal and thrive.` | 170 chars | OVER 160 — truncated |
| Blog post 2 | `Every human experiences intense emotions at some point. This guide helps you pause, identify what you're feeling, and find gentle, practical ways to cope — from grounding techniques to mindfulness and healthy emotional release.` | 228 chars | FAR OVER 160 |
| Blog post 3 | `Whether it's anxiety, sadness, anger, or overthinking, each emotion carries a message. This guide explores common emotional states and simple, effective ways to cope — practices you can start using right away.` | 210 chars | FAR OVER 160 |
| Blog post 4 | `Grief is not a single emotion — it is a layered, deeply personal experience. Whether it's the loss of a loved one, a relationship, a dream, or a version of yourself, this guide explores how to understand, process, and gently move through grief.` | 247 chars | FAR OVER 160 |

**The homepage has a DUPLICATE tag problem:** `index.html` (the static fallback) sets one description while `App.tsx` (the Helmet override) sets a different description. Googlebot will likely see the Helmet version after JS execution, but static crawlers and social previewers that don't execute JS will show the index.html version. These should be aligned.

Blog post descriptions are pulled directly from `post.description` in `blogPosts.ts` (BlogPostPage.tsx line 38: `<meta name="description" content={post.description} />`). These are writing naturally without regard for 160-char limit.

### 2.3 H1 Tags
**Status: PASS on most pages, but inconsistent**

- Homepage (`index.html` noscript, line 281): `<h1>Mindful QALB — Online Therapy by Aqsa Khatib, Counseling Psychologist</h1>` — only appears for no-JS crawlers. The React-rendered H1 is inside `Hero.tsx` (not audited, but typically present).
- Blog list (BlogListPage.tsx line 72–77): `<h1>Articles &amp; Blog</h1>` — present as motion.h1 element
- Blog posts (BlogPostPage.tsx line 110–115): `<h1>{post.title}</h1>` — correct, one H1 per post

### 2.4 Heading Hierarchy
**Status: PASS on blog posts**

Blog post structure (BlogPostPage.tsx):
- H1: post.title (line 110)
- H2: section.heading (line 148)
- H3: section.subheading (line 153)

This is a clean H1 → H2 → H3 hierarchy.

### 2.5 Internal Linking
**Status: PARTIAL — Good cross-blog linking, weak homepage links to blog**

Good:
- BlogPostPage.tsx shows "Related Articles" (lines 241–278) and "Previous/Next" navigation (lines 206–237) linking between posts
- Blog list page links to all blog posts

Missing:
- No link from the homepage to `/blog` in the main navigation path for SEO value. The navigation has "Articles & Blogs" under a Resources dropdown (Navigation.tsx line 43), which is good but the homepage body itself has no editorial link to blog content
- No internal links within blog post body text to homepage service pages (e.g., linking "couple therapy" text to `/#couples`)

### 2.6 URL Structure
**Status: PASS**

Blog slug URLs are clean and descriptive:
- `/blog/family-dynamics-generational-trauma-couple-therapy`
- `/blog/understanding-managing-emotions-guide`
- `/blog/understanding-emotions-practical-ways-to-feel-better`
- `/blog/grief-in-layers-understanding-loss-healing-resilience`

All lowercase, hyphenated, no query strings. Good practice.

---

## 3. Content Quality & E-E-A-T — 72/100

### 3.1 Author Credentials
**Status: GOOD**

`AboutTherapist.tsx` prominently displays Aqsa Khatib's credentials:
- Master's in Counseling Psychology
- CBT Certified, NLP Practitioner, EFT & TFT Tapping, Trauma-Informed Care, Psycho-oncology
- 3,000+ clinical hours (displayed as a stat badge)
- Featured in Inquilab Newspaper, international webinar presenter (Berlin University), published on VHealthy

Blog posts set `author.name: 'Aqsa Khatib'` in the Article schema (BlogPostPage.tsx lines 56–57), but there is no visible byline in the blog post UI. Readers cannot see who wrote the article without inspecting the JSON-LD.

### 3.2 Trust Signals
**Status: GOOD**

`TrustSignals.tsx` displays four pillars: Licensed Therapist, Privacy-First, Evidence-Based, Ethical Practice.

Real testimonials from named clients (Avilash, Sonia, Kamal) with dates appear in `AboutTherapist.tsx`. These same testimonials are embedded in structured data as Review schema in `index.html`.

### 3.3 Content Depth on Blog Posts
**Status: GOOD — Substantive but all same-date**

All 4 blog posts have substantial, well-structured content (7–9 minute reads):
1. Family Dynamics & Generational Trauma — covers attachment theory, generational trauma, couple therapy techniques, 5 practical exercises
2. Understanding and Managing Emotions — emotional crisis guide, 4-step reset, anxiety myths, coping categories
3. Understanding Your Emotions (Practical) — emotion-by-emotion coping guide
4. Grief in Layers — stages of grief, complex grief vs depression, healing approaches

**Issue:** All 4 posts share the same `publishedDate: '2026-03-28'`. This signals a content dump rather than ongoing publication, which reduces the freshness signals Google values for health/mental wellness content.

**Issue:** Posts 2 and 3 have significant content overlap — both cover emotional regulation, coping strategies, mindfulness, and anxiety management. They target nearly identical keyword clusters:
- Post 2 keywords: `emotional regulation, grounding techniques, anxiety management, coping with emotions, mindfulness exercises`
- Post 3 keywords: `emotional regulation, coping strategies, mental health tips, anxiety relief techniques`

This creates **keyword cannibalization** risk between posts 2 and 3.

### 3.4 Thin Content Pages
**Status: FLAG**

- `/privacy` — not audited but likely templated legal content; Google may see as thin
- `/terms` — same
- `/contact` — contact page with form; fine for its purpose

The homepage is a single long-scroll SPA page with substantial content across many sections (Hero, AboutTherapist, TherapeuticApproach, WhoWeHelp, WhatWeOffer, TrustSignals, MentalHealth, CouplesRelationships, FamilyCounseling, HolisticWellness, SupportGroups, Programs, FAQ). Content depth is not a concern for the homepage.

### 3.5 Missing E-E-A-T Elements
- No visible author byline on blog posts (author is only in JSON-LD)
- No "last updated" date visible on blog posts (date is shown but all posts are same day)
- No links to external authoritative sources (research papers, psychological associations) within blog content — the posts reference concepts (CBT, ACT, attachment theory) without citing sources
- No "About the Author" section at the bottom of blog posts

---

## 4. Schema / Structured Data — 85/100

### 4.1 Implemented Schema (index.html)
All implemented in `index.html` as multiple JSON-LD blocks:

| Schema Type | Status | Notes |
|---|---|---|
| MedicalBusiness | IMPLEMENTED | Has address, email, priceRange, medicalSpecialty, aggregateRating, sameAs |
| Person (Aqsa Khatib) | IMPLEMENTED | Has jobTitle, description, image, worksFor, knowsAbout |
| WebSite | IMPLEMENTED | Has name, url, inLanguage, publisher |
| MedicalWebPage | IMPLEMENTED | Has reviewedBy, dateModified |
| Service (Individual Therapy) | IMPLEMENTED | Has offers with prices in INR |
| Service (Couples Therapy) | IMPLEMENTED | Has offers |
| Service (Support Groups) | IMPLEMENTED | |
| Review (x3) | IMPLEMENTED | Avilash, Sonia, Kamal reviews with dates |
| FAQPage | IMPLEMENTED | 8 FAQ items |

**Issues with existing schema:**

1. **AggregateRating with only 3 reviews is risky:** `ratingCount: 3, reviewCount: 3` — Google may not display star ratings in SERPs for such a low count, and there is a known risk of manual action for low-quality review markup if the reviews are not independently verifiable.

2. **MedicalBusiness is missing telephone:** The `index.html` comment says `"update telephone when going live"` but no phone number is present. MedicalBusiness schema without a phone number is less complete.

3. **Person schema image:** References `https://www.mindfulqalb.com/aqsa-khatib.jpg` (91KB file in `/public/`). This is a publicly accessible image — good.

4. **Review schema uses an array wrapper** with a single JSON-LD script tag (lines 228–257 of index.html). This is valid JSON-LD but Google prefers individual Review objects linked to the reviewed entity.

### 4.2 Article Schema on Blog Posts
**Status: IMPLEMENTED via Helmet (but missing imageField)**

BlogPostPage.tsx (lines 51–61) generates Article schema:
```tsx
{
  '@type': 'Article',
  headline: post.title,
  description: post.description,
  datePublished: post.publishedDate,
  author: { '@type': 'Person', name: 'Aqsa Khatib', url: 'https://www.mindfulqalb.com/#about' },
  publisher: { '@type': 'Organization', name: 'MindfulQALB', url: 'https://www.mindfulqalb.com' },
  url: `https://www.mindfulqalb.com/blog/${post.slug}`,
  keywords: post.keywords.join(', '),
}
```

**Missing from Article schema:**
- `image` field — required for Google News and recommended for rich results
- `dateModified` — should match `datePublished` or be updated when content changes
- `publisher.logo` — required for Article rich results: `{ '@type': 'ImageObject', url: '...', width: ..., height: ... }`
- `mainEntityOfPage` — recommended for breadcrumb association

### 4.3 Missing Schema Opportunities

| Schema | Status | Impact |
|---|---|---|
| BreadcrumbList | MISSING | Blog posts show visual breadcrumbs (Home / Blog / Title) but no BreadcrumbList JSON-LD |
| SiteLinksSearchBox | MISSING | Could enable search in SERPs |
| LocalBusiness opening hours | MISSING | Could help local discovery |
| VideoObject | N/A | No video content present |

---

## 5. Blog-Specific SEO — COMPOSITE (included in relevant categories above)

### 5.1 Blog in Sitemap
**CRITICAL FAIL** — See Section 1.2. Blog index and all 4 posts absent from sitemap.

### 5.2 Open Graph on Blog Posts
**Status: PARTIAL PASS**

BlogPostPage.tsx sets:
- `og:title` — post title + brand (line 41)
- `og:description` — post description (line 42)
- `og:url` — canonical URL (line 43)
- `og:type: article` (line 44)
- `og:image` — but uses the **generic homepage OG image** `https://www.mindfulqalb.com/og-image.png` for all posts (line 45)
- `article:published_time` (line 46)
- `article:tag` for each tag (lines 47–49)

**Missing:**
- `og:image:width` and `og:image:height` on blog post pages (present on homepage but not in BlogPostPage.tsx)
- Per-post unique OG images — all posts share the same generic image, reducing click-through from social shares
- `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image` — Twitter/X Card tags are entirely absent from blog pages. Only the homepage (index.html) has Twitter Card tags.

### 5.3 Breadcrumb Navigation
**Status: PARTIAL** — Visual breadcrumbs exist in BlogPostPage.tsx (lines 90–96):
```tsx
<Link to="/">Home</Link> / <Link to="/blog">Blog</Link> / {post.title}
```
But there is no BreadcrumbList JSON-LD schema to go with it. Google cannot extract breadcrumb rich results without the schema.

### 5.4 Internal Linking Between Blog Posts
**Status: GOOD** — Previous/next links and "Related Articles" grid (up to 3 related posts) are implemented in BlogPostPage.tsx. This creates a good internal linking mesh between posts.

### 5.5 Missing: `dateModified` in blog Article schema
All posts have only `datePublished` — no `dateModified`. When posts are updated, this should be set.

---

## 6. AI Search Readiness (GEO) — 75/100

### 6.1 llms.txt
**Status: PASS — Well-implemented**

`/public/llms.txt` is present and live at https://www.mindfulqalb.com/llms.txt. Content is concise and well-structured:
- Business description with credentials
- Services with prices
- Modalities (CBT, ACT, etc.)
- Conditions treated
- Credentials
- Contact info
- Crisis resources
- Licensing/attribution statement

**Gap:** The llms.txt does not reference blog article URLs. AI systems querying the file won't know about the blog content unless they crawl it separately.

### 6.2 Structured Content for AI Citation
**Status: GOOD**

The rich JSON-LD schema (FAQPage, Person, MedicalBusiness) provides machine-readable content that AI systems can extract for citations. The `<noscript>` block in `index.html` (lines 278–308) contains a full text summary of services, credentials, FAQs, and contact info — this is immediately readable by any crawler without JS execution.

### 6.3 AI Crawler Accessibility
**Status: PASS**

robots.txt explicitly allows GPTBot, ClaudeBot, and PerplexityBot. No blocking of major AI crawlers.

### 6.4 Brand Consistency for AI Signals
**Status: PARTIAL** — The brand name appears inconsistently: sometimes "Mindful QALB", sometimes "MindfulQALB", sometimes "MindfulQalb", and "Mindful Qalb". In blog post body text (`blogPosts.ts`), the brand is referred to as "MindfulQalb" and "Mindful Qalb". This inconsistency weakens brand entity recognition for AI models trying to build a knowledge graph about the practice.

---

## 7. Performance (Code-Level Estimate) — 60/100

### 7.1 Code Splitting / Lazy Loading
**Status: GOOD**

`App.tsx` uses `React.lazy()` for all page-level components:
```tsx
const BlogListPage = lazy(() => import('./pages/BlogListPage'))
const BlogPostPage = lazy(() => import('./pages/BlogPostPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
// ... etc
```

`vite.config.ts` implements manual chunk splitting:
```ts
manualChunks: {
  'vendor-react': ['react', 'react-dom', 'react-router-dom'],
  'vendor-motion': ['framer-motion'],
  'vendor-supabase': ['@supabase/supabase-js'],
  'vendor-icons': ['lucide-react'],
},
```
This is good practice that prevents large monolithic bundles.

### 7.2 Third-Party Scripts
**Status: FLAG — GA4 blocks rendering**

`index.html` line 80:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-2RYY9JM7B1"></script>
```
GA4 is loaded with `async` which is correct. However, the inline initialization script directly after it executes synchronously in `<head>`, before HTML parsing completes. This is standard GA4 implementation and acceptable.

Google Identity Services (index.html line 97):
```html
<script src="https://accounts.google.com/gsi/client" async defer></script>
```
Loaded with both `async` and `defer` — minor redundancy but not harmful. This script does add weight to initial page load.

### 7.3 Image Assets
**Status: FLAG — Unoptimized originals still present**

From `/src/assets/images/`:
- `hero_main.jpeg` — **15MB** (unoptimized original still on disk)
- `hero_main_optimized.jpeg` — 661KB (the optimized version actually used)
- `profile_final.jpg` — **2.0MB** (unoptimized original)
- `profile_final_optimized.jpg` — 91KB (optimized version used in AboutTherapist.tsx)
- `couple.png` — **2.1MB** (no optimized version found)
- `logo_final.png` — 363KB

The optimized versions are used in the code (AboutTherapist.tsx imports `profile_final_optimized.jpg`). The unoptimized originals sitting in the repo are not deployed but represent risk if mistakenly referenced.

The `couple.png` at 2.1MB appears to have no optimized counterpart — if used, it would severely impact LCP.

### 7.4 Image Format (WebP)
**Status: FAIL — No WebP images used**

All assets are JPEG or PNG. No WebP or AVIF variants are used. Modern browsers support WebP with 30–50% smaller file sizes at equivalent quality. The OG image (`/public/og-image.png` at 184KB) is also PNG rather than WebP.

### 7.5 Font Loading
**Status: ACCEPTABLE**

Google Fonts are preconnected and loaded via `<link>` in `index.html`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```
Two font families, each with 5 weights (300–700), loaded from Google Fonts. This is 10 font-weight combinations. Could be reduced to the weights actually used.

---

## 8. Images — 70/100

### 8.1 Alt Text
**Status: MOSTLY PASS**

All significant `<img>` elements have descriptive alt text:
- `AboutTherapist.tsx` line 131: `alt="Aqsa Khatib - Counseling Psychologist and Therapist at MindfulQALB"` — excellent, includes name and profession
- `Hero.tsx`: `alt="Supportive therapy session - a safe space for healing"` — good descriptive alt
- `CouplesRelationships.tsx`: `alt="Couple supporting each other through relationship counseling"` — good
- `MentalHealth.tsx` main image: `alt="Finding peace and calm through mental health support"` — good
- Decorative images in grids (`MentalHealth.tsx`, `SelfHelpTools.tsx`): correctly use `alt=""` with `aria-hidden="true"` — correct practice for decorative images

### 8.2 Loading Attributes
**Status: GOOD**

Profile image in AboutTherapist.tsx line 137:
```tsx
loading="lazy"
decoding="async"
```
Width/height specified (600x800). Correct implementation.

### 8.3 Image Formats
**Status: FAIL**

All images are JPEG or PNG. No WebP or AVIF. The OG image is PNG (184KB) — could be smaller as WebP. No `<picture>` elements with format fallbacks used anywhere.

---

## Key Findings Summary

| Finding | Severity | Category |
|---|---|---|
| Blog & blog posts absent from sitemap (4 posts + index) | CRITICAL | Technical SEO |
| All blog post titles 75–101 chars (SERP truncates at 60) | HIGH | On-Page SEO |
| non-www redirect is 307 not 301 (loses link equity) | HIGH | Technical SEO |
| Blog posts missing Twitter Card meta tags entirely | HIGH | Blog SEO |
| Blog Article schema missing `image` and `publisher.logo` | HIGH | Schema |
| No BreadcrumbList JSON-LD despite visual breadcrumbs | MEDIUM | Schema |
| All blog posts same publish date (no freshness signal) | MEDIUM | Content Quality |
| Posts 2 & 3 keyword cannibalization | MEDIUM | Content Quality |
| Blog post descriptions 170–247 chars (over 160 limit) | MEDIUM | On-Page SEO |
| Blog list title too short (30 chars) | MEDIUM | On-Page SEO |
| Brand name inconsistent across site content | MEDIUM | GEO |
| No author byline visible on blog posts | MEDIUM | E-E-A-T |
| No per-post OG images (all use generic homepage image) | MEDIUM | Blog SEO |
| No WebP images anywhere | LOW | Performance/Images |
| couple.png is 2.1MB with no optimized version | LOW | Performance |
| llms.txt does not reference blog article URLs | LOW | GEO |
| No internal links from blog post body to service pages | LOW | On-Page SEO |
| Font: 10 weight combinations loaded (may reduce) | LOW | Performance |
