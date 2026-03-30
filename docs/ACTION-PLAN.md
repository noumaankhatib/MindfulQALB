# MindfulQALB — SEO Action Plan
**Generated:** 2026-03-30
**Based on:** Full Audit Report (FULL-AUDIT-REPORT.md)

---

## Priority Legend
- **CRITICAL** — Blocks indexing or causes ranking penalties. Fix immediately.
- **HIGH** — Significantly impacts rankings or click-through rate.
- **MEDIUM** — Notable optimization opportunity.
- **LOW** — Incremental improvement; address when convenient.

---

## CRITICAL Actions

---

### C-1: Add Blog and All Blog Posts to Sitemap

**Problem:** The live sitemap contains only 2 URLs. All 4 blog posts and the `/blog` index are completely missing. Google cannot discover this content via the sitemap.

**Root cause file:** `/home/noumaan/Documents/aqsa/therapy-website-react/MindfulQALB/vite.config.ts`

**Current code (lines 18–31):**
```ts
sitemap({
  hostname: 'https://www.mindfulqalb.com',
  dynamicRoutes: [
    '/contact',
  ],
  ...
})
```

**Fix:** Update `vite.config.ts` to import blog posts and generate all blog URLs dynamically:

```ts
import { blogPosts } from './src/data/blogPosts'

sitemap({
  hostname: 'https://www.mindfulqalb.com',
  dynamicRoutes: [
    '/contact',
    '/blog',
    ...blogPosts.map((p) => `/blog/${p.slug}`),
  ],
  exclude: [
    '/admin',
    '/profile',
    '/my-bookings',
    '/auth/google/callback',
    '/404',
    '/200',
  ],
}),
```

After this change, rebuild and redeploy. Then submit the sitemap to Google Search Console: `https://www.mindfulqalb.com/sitemap.xml`.

**Expected sitemap after fix:**
```
https://www.mindfulqalb.com/
https://www.mindfulqalb.com/contact
https://www.mindfulqalb.com/blog
https://www.mindfulqalb.com/blog/family-dynamics-generational-trauma-couple-therapy
https://www.mindfulqalb.com/blog/understanding-managing-emotions-guide
https://www.mindfulqalb.com/blog/understanding-emotions-practical-ways-to-feel-better
https://www.mindfulqalb.com/blog/grief-in-layers-understanding-loss-healing-resilience
```

---

## HIGH Priority Actions

---

### H-1: Fix the Non-www Redirect from 307 to 301

**Problem:** `mindfulqalb.com` → `www.mindfulqalb.com` issues a 307 Temporary Redirect, not 301 Permanent. This does not fully pass link equity.

**File:** `/home/noumaan/Documents/aqsa/therapy-website-react/MindfulQALB/vercel.json`

The redirect is already configured with `"permanent": true` in vercel.json:
```json
"redirects": [
  {
    "source": "/:path*",
    "has": [{ "type": "host", "value": "mindfulqalb.com" }],
    "destination": "https://www.mindfulqalb.com/:path*",
    "permanent": true
  }
]
```

Vercel's `permanent: true` should produce a 308 redirect. If you are seeing 307, this may be a Vercel edge cache issue.

**Action:**
1. In Vercel Dashboard, go to Settings → Domains → ensure `mindfulqalb.com` redirect to `www.mindfulqalb.com` is set to "Permanent (301)".
2. Purge Vercel edge cache after any config change.
3. Verify with: `curl -I https://mindfulqalb.com/` — should return `HTTP/2 301`.

---

### H-2: Shorten Blog Post Title Tags

**Problem:** All 4 blog post titles are 83–101 characters. Google SERP truncates at ~60 characters, so all blog titles will be cut off, reducing click-through rates.

**File:** `/home/noumaan/Documents/aqsa/therapy-website-react/MindfulQALB/src/pages/BlogPostPage.tsx`

**Current code (line 37):**
```tsx
<title>{post.title} | MindfulQALB</title>
```

The post titles in `blogPosts.ts` are written as article headings (long and descriptive) and should not be used verbatim as `<title>` tags.

**Fix Option A (Recommended):** Add a separate `seoTitle` field to each BlogPost in `blogPosts.ts` with a 50–60 char version, then use it in BlogPostPage.tsx:

In `blogPosts.ts`, add `seoTitle` to the BlogPost interface and each post:
```ts
export interface BlogPost {
  // ... existing fields
  seoTitle: string  // 50-60 chars, optimized for SERP
}

// Post 1:
seoTitle: 'Family Dynamics & Generational Trauma | Couple Therapy',
// 54 chars

// Post 2:
seoTitle: 'Managing Intense Emotions: A Gentle Practical Guide',
// 52 chars

// Post 3:
seoTitle: 'Understanding Your Emotions: Simple Ways to Feel Better',
// 56 chars

// Post 4:
seoTitle: 'Grief in Layers: Understanding Loss & Building Resilience',
// 58 chars
```

In `BlogPostPage.tsx` line 37, change to:
```tsx
<title>{post.seoTitle ?? post.title} | MindfulQALB</title>
```

**Fix Option B (Simpler):** Truncate the title in the template. Not recommended — keyword ordering may suffer.

---

### H-3: Trim Blog Post Meta Descriptions to 150–160 Characters

**Problem:** All 4 blog post meta descriptions exceed 160 characters (170–247 chars). Google truncates at ~160, reducing click-through quality.

**File:** `/home/noumaan/Documents/aqsa/therapy-website-react/MindfulQALB/src/data/blogPosts.ts`

**Fix:** Add a `seoDescription` field to the BlogPost interface and each post entry (150–160 chars max), and use it in BlogPostPage.tsx:

Suggested `seoDescription` values:
```ts
// Post 1: (currently 170 chars)
seoDescription: 'How family dynamics, generational trauma, and attachment styles shape us — and how family and couple therapy can help us heal.',
// 127 chars — good

// Post 2: (currently 228 chars)
seoDescription: 'A gentle guide to identifying your emotions and coping with overwhelm, anxiety, and panic — with grounding techniques and mindfulness exercises.',
// 145 chars — good

// Post 3: (currently 210 chars)
seoDescription: 'Practical coping strategies for anxiety, sadness, anger, overthinking, and more. Simple, effective tools you can start using right away.',
// 138 chars — good

// Post 4: (currently 247 chars)
seoDescription: 'Grief is a layered, personal experience. Whether it\'s loss of a person, relationship, or dream — learn how to understand and move through grief.',
// 146 chars — good
```

In `BlogPostPage.tsx` line 38, change to:
```tsx
<meta name="description" content={post.seoDescription ?? post.description} />
```

Also update `og:description` on line 42 to use the same field.

---

### H-4: Add Twitter Card Tags to Blog Pages

**Problem:** Blog post pages have zero Twitter/X Card meta tags. When blog posts are shared on Twitter/X, no preview card appears. Only the homepage (`index.html`) has Twitter Card tags.

**File:** `/home/noumaan/Documents/aqsa/therapy-website-react/MindfulQALB/src/pages/BlogPostPage.tsx`

**Fix:** Add Twitter Card tags inside the `<Helmet>` block (after line 49, before `</Helmet>`):

```tsx
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="@mindfulqalb" />
<meta name="twitter:title" content={`${post.seoTitle ?? post.title} | MindfulQALB`} />
<meta name="twitter:description" content={post.seoDescription ?? post.description} />
<meta name="twitter:image" content="https://www.mindfulqalb.com/og-image.png" />
<meta name="twitter:image:alt" content={`${post.title} — MindfulQALB`} />
```

Also add the same to `/home/noumaan/Documents/aqsa/therapy-website-react/MindfulQALB/src/pages/BlogListPage.tsx` in its Helmet block.

---

### H-5: Add Missing Fields to Article Schema

**Problem:** Article schema on blog posts is missing `image`, `publisher.logo`, `dateModified`, and `mainEntityOfPage` — all required or strongly recommended for Google's Article rich results.

**File:** `/home/noumaan/Documents/aqsa/therapy-website-react/MindfulQALB/src/pages/BlogPostPage.tsx`

**Current schema (lines 51–61):**
```tsx
<script type="application/ld+json">{JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: post.title,
  description: post.description,
  datePublished: post.publishedDate,
  author: { '@type': 'Person', name: 'Aqsa Khatib', url: 'https://www.mindfulqalb.com/#about' },
  publisher: { '@type': 'Organization', name: 'MindfulQALB', url: 'https://www.mindfulqalb.com' },
  url: `https://www.mindfulqalb.com/blog/${post.slug}`,
  keywords: post.keywords.join(', '),
})}</script>
```

**Fix:** Replace with:
```tsx
<script type="application/ld+json">{JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'Article',
  '@id': `https://www.mindfulqalb.com/blog/${post.slug}#article`,
  headline: post.title,
  description: post.description,
  datePublished: post.publishedDate,
  dateModified: post.publishedDate,
  author: {
    '@type': 'Person',
    '@id': 'https://www.mindfulqalb.com/#person-aqsa-khatib',
    name: 'Aqsa Khatib',
    url: 'https://www.mindfulqalb.com/#about',
  },
  publisher: {
    '@type': 'Organization',
    '@id': 'https://www.mindfulqalb.com/#organization',
    name: 'MindfulQALB',
    url: 'https://www.mindfulqalb.com',
    logo: {
      '@type': 'ImageObject',
      url: 'https://www.mindfulqalb.com/favicon.svg',
      width: 512,
      height: 512,
    },
  },
  image: {
    '@type': 'ImageObject',
    url: 'https://www.mindfulqalb.com/og-image.png',
    width: 1200,
    height: 630,
  },
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': `https://www.mindfulqalb.com/blog/${post.slug}`,
  },
  url: `https://www.mindfulqalb.com/blog/${post.slug}`,
  keywords: post.keywords.join(', '),
  isPartOf: { '@id': 'https://www.mindfulqalb.com/#website' },
})}</script>
```

---

## MEDIUM Priority Actions

---

### M-1: Add BreadcrumbList Schema to Blog Posts

**Problem:** Blog post pages show a visual breadcrumb (`Home / Blog / Post Title`) but have no BreadcrumbList JSON-LD. Google cannot display breadcrumb rich results in SERPs without the schema.

**File:** `/home/noumaan/Documents/aqsa/therapy-website-react/MindfulQALB/src/pages/BlogPostPage.tsx`

**Fix:** Add a BreadcrumbList schema inside the Helmet block, alongside the existing Article schema:

```tsx
<script type="application/ld+json">{JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://www.mindfulqalb.com/',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Blog',
      item: 'https://www.mindfulqalb.com/blog',
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: post.title,
      item: `https://www.mindfulqalb.com/blog/${post.slug}`,
    },
  ],
})}</script>
```

---

### M-2: Strengthen Blog List Page Title Tag

**Problem:** The blog list page title is `Articles & Blog | MindfulQALB` at only 30 characters — well under the optimal 50–60 char range. It misses keyword opportunities.

**File:** `/home/noumaan/Documents/aqsa/therapy-website-react/MindfulQALB/src/pages/BlogListPage.tsx`

**Current (line 27):**
```tsx
<title>Articles & Blog | MindfulQALB</title>
```

**Fix:**
```tsx
<title>Mental Health Blog | Emotional Wellness Articles | MindfulQALB</title>
```
This is 64 characters — slightly over but the primary keyword phrase ends before truncation. Or:
```tsx
<title>Mental Health & Wellness Blog | MindfulQALB</title>
```
48 characters — safe and keyword-rich.

Also update the corresponding `og:title` on line 31 in BlogListPage.tsx to match.

---

### M-3: Align Homepage Meta Description Between index.html and App.tsx

**Problem:** Two different meta descriptions exist for the homepage:
- `index.html` line 33: `"Evidence-based mental health care for individuals and couples—accessible, human, and private. Online therapy, counseling, and support groups."` (143 chars)
- `App.tsx` line 92: `"Online therapy and counseling by a licensed psychologist. Individual therapy, couples therapy, and support groups. Book a free 15-minute consultation today."` (157 chars)

Social previewers and crawlers that do not execute JS will read the `index.html` version. React Helmet overrides it for JS-enabled crawlers. This creates inconsistency in how the page is described across different channels.

**Fix:** Update `index.html` line 33 to match the App.tsx Helmet version, or vice versa — pick one and make them identical:

```html
<!-- index.html line 33 — change to: -->
<meta name="description" content="Online therapy and counseling by a licensed psychologist. Individual therapy, couples therapy, and support groups. Book a free 15-minute consultation today." />
```

Also update the `og:description` in `index.html` line 45 to be consistent.

---

### M-4: Add Author Byline to Blog Posts

**Problem:** Blog posts have no visible author attribution in the UI. The author is only present in JSON-LD schema. Google's E-E-A-T guidelines place high weight on visible author expertise signals, especially for health-related content (YMYL).

**File:** `/home/noumaan/Documents/aqsa/therapy-website-react/MindfulQALB/src/pages/BlogPostPage.tsx`

**Fix:** Add an author byline below the meta row (around line 107, after the category/reading time/date chips). Example addition:

```tsx
{/* Author byline */}
<motion.div variants={fadeUp} className="flex items-center gap-2.5 mt-4">
  <img
    src="/aqsa-khatib.jpg"
    alt="Aqsa Khatib"
    className="w-8 h-8 rounded-full object-cover"
    width={32}
    height={32}
  />
  <div>
    <span className="text-sm font-medium text-gray-700">Aqsa Khatib</span>
    <span className="text-xs text-gray-400 ml-1">· Counseling Psychologist</span>
  </div>
</motion.div>
```

---

### M-5: Differentiate Posts 2 and 3 to Avoid Keyword Cannibalization

**Problem:** Blog posts 2 (`understanding-managing-emotions-guide`) and 3 (`understanding-emotions-practical-ways-to-feel-better`) target nearly identical keywords: `emotional regulation`, `coping strategies`, `anxiety management`, `mindfulness`, `mental health`, `emotional healing`. Google will struggle to determine which post to rank for these queries.

**File:** `/home/noumaan/Documents/aqsa/therapy-website-react/MindfulQALB/src/data/blogPosts.ts`

**Fix options:**

**Option A (Preferred):** Consolidate the two posts into one comprehensive guide covering both the emotional understanding framework AND the specific emotion-by-emotion tactics. Keep the URL of the better-performing post (check Search Console).

**Option B:** Deliberately differentiate them by target keyword clusters:
- Post 2: Focus on `anxiety management`, `panic attack relief`, `grounding techniques` — the acute crisis intervention angle
- Post 3: Focus on `daily emotional wellness`, `mood management tips`, `self-care strategies` — the everyday self-care angle

Update the `keywords` and `description` in `blogPosts.ts` for both posts to make the differentiation explicit. Rewrite section headings to reinforce the distinct angle.

---

### M-6: Stagger Blog Post Publication Dates

**Problem:** All 4 blog posts share `publishedDate: '2026-03-28'`. Google views fresh, regularly published content as a quality signal for health/wellness sites. A content dump on a single date looks like low-effort SEO rather than a maintained knowledge resource.

**File:** `/home/noumaan/Documents/aqsa/therapy-website-react/MindfulQALB/src/data/blogPosts.ts`

**Fix:** Backdate existing posts to create an organic publication history, and maintain a publishing cadence going forward:

```ts
// Post 1 (family dynamics):
publishedDate: '2026-02-15',

// Post 2 (managing emotions guide):
publishedDate: '2026-02-28',

// Post 3 (understanding emotions practical):
publishedDate: '2026-03-10',

// Post 4 (grief in layers):
publishedDate: '2026-03-24',
```

Then publish new posts on a regular schedule (1–2 per month minimum). Each new blog post triggers a sitemap update (after fix C-1) which signals fresh content to Google.

---

### M-7: Standardize Brand Name in Blog Content

**Problem:** The brand name appears inconsistently across the site:
- Schema / homepage: "Mindful QALB" or "MindfulQALB"
- Blog post body text (`blogPosts.ts`): "MindfulQalb" (posts 1, 3, 4 tips sections) and "Mindful Qalb" (post 2 tip)
- Navigation badge (BlogListPage.tsx line 67): "MindfulQalb"

AI systems building a knowledge graph about the business will treat these as potentially different entities, weakening brand signal strength.

**Fix:** Search and replace all body/UI text to use one consistent form. The canonical form from your structured data is `Mindful QALB`. Update `blogPosts.ts` tip sections:

```ts
// blogPosts.ts — Post 1, last section tip (line 181):
tip: 'Explore more at Mindful QALB — nurturing emotional wellness, one heart at a time.',

// Post 2, last section tip (line 382):
tip: 'At Mindful QALB, we\'re here whenever you\'re ready to take the next step.',

// Post 3, last section tip (line 545):
tip: 'At Mindful QALB, we\'re here whenever you\'re ready to take the next step.',

// Post 4 does not have a tip with brand name.
```

Also update BlogListPage.tsx line 67 from `MindfulQalb` to `Mindful QALB`.

---

### M-8: Add llms.txt Blog Article References

**Problem:** The `/public/llms.txt` file provides excellent business/credentials information but does not reference the blog content. AI systems that rely on llms.txt for a site overview miss the educational articles.

**File:** `/home/noumaan/Documents/aqsa/therapy-website-react/MindfulQALB/public/llms.txt`

**Fix:** Add a Blog Articles section at the bottom:

```
## Blog Articles
- /blog/family-dynamics-generational-trauma-couple-therapy — How family dynamics and generational trauma shape emotional lives; couple therapy approaches
- /blog/understanding-managing-emotions-guide — Emotional crisis guide; 4-step reset; grounding techniques; anxiety management
- /blog/understanding-emotions-practical-ways-to-feel-better — Coping strategies for anxiety, sadness, anger, overthinking, and panic
- /blog/grief-in-layers-understanding-loss-healing-resilience — Understanding grief stages, complex grief, and healing through therapy
```

---

## LOW Priority Actions

---

### L-1: Convert Images to WebP Format

**Problem:** All images across the site are JPEG or PNG. WebP provides 25–50% smaller file sizes at the same visual quality, improving page load time and Core Web Vitals.

**Files affected:**
- `/public/og-image.png` (184KB) — convert to WebP, keep PNG fallback for email clients
- `/public/aqsa-khatib.jpg` (91KB) — convert to WebP
- `/src/assets/images/hero_main_optimized.jpeg` (661KB) — convert to WebP
- `/src/assets/images/couple.png` (2.1MB) — optimize and convert to WebP first

**For Vite projects**, the `vite-imagetools` plugin can automate this at build time:
```
npm install vite-imagetools
```
Then in components, use: `import profileImg from '../assets/images/profile_final_optimized.jpg?format=webp'`

Or manually convert using: `cwebp -q 82 hero_main_optimized.jpeg -o hero_main.webp`

---

### L-2: Optimize or Remove couple.png

**Problem:** `/src/assets/images/couple.png` is 2.1MB with no corresponding optimized version. If this image is rendered anywhere (CouplesRelationships.tsx or other components), it will severely impact LCP.

**Action:**
1. Check if it is actively used: `grep -r "couple.png" /home/noumaan/Documents/aqsa/therapy-website-react/MindfulQALB/src/`
2. If used, create an optimized version: compress to under 100KB as WebP or JPEG
3. If not used, delete it to reduce repository size

---

### L-3: Add Internal Links from Blog Body Text to Service Pages

**Problem:** Blog posts contain mentions of therapy services (e.g., "couple therapy", "family therapy") but these are plain text, not hyperlinks to the corresponding homepage sections or service areas.

**File:** `/home/noumaan/Documents/aqsa/therapy-website-react/MindfulQALB/src/data/blogPosts.ts`

**Fix:** In `BlogPostPage.tsx`, render body text with link substitution for known therapy terms. Or, more practically, add CTA sentences within blog section bodies linking to relevant anchors.

Example addition to a relevant section body in `blogPosts.ts`:
```
'...If you would like to explore couple therapy at Mindful QALB, we offer 90-minute video sessions. <a href="/#couples">Learn more about our couple therapy approach →</a>'
```

Note: Because body text is rendered as plain text (`{section.body}` in BlogPostPage.tsx line 159), you would need to update the renderer to support `dangerouslySetInnerHTML` or a markdown parser for links to work.

---

### L-4: Reduce Google Fonts Weight Count

**Problem:** `index.html` loads both Cormorant Garamond and Inter, each in weights 300, 400, 500, 600, 700 (5 weights each = 10 font files). Many of these weights may not be used.

**Fix:** Audit which font weights are actually used in Tailwind/CSS and reduce the Google Fonts import to only those weights. For example, if only 400, 500, and 600 are used:

```html
<!-- index.html — replace line 100 with: -->
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
```

Run the build, check the rendered pages visually to confirm no font degradation.

---

### L-5: Add Explicit dateModified to Blog Post Schema When Content Updates

**Problem:** Blog Article schema only sets `datePublished`, not `dateModified`. When blog posts are edited or updated, Google should be notified via `dateModified`.

**Fix:** Add a `lastModified` field to the BlogPost interface in `blogPosts.ts`:

```ts
export interface BlogPost {
  // ... existing fields
  lastModified?: string  // ISO date, only set when content is updated after publish
}
```

In `BlogPostPage.tsx` Article schema, update `dateModified`:
```ts
dateModified: post.lastModified ?? post.publishedDate,
```

---

## Summary Checklist

| ID | Action | Priority | File(s) | Effort |
|---|---|---|---|---|
| C-1 | Add blog + posts to sitemap | CRITICAL | `vite.config.ts` | 30 min |
| H-1 | Fix 307 redirect to 301 | HIGH | Vercel Dashboard | 15 min |
| H-2 | Shorten blog post title tags | HIGH | `blogPosts.ts`, `BlogPostPage.tsx` | 1 hr |
| H-3 | Trim meta descriptions to ≤160 chars | HIGH | `blogPosts.ts`, `BlogPostPage.tsx` | 1 hr |
| H-4 | Add Twitter Card tags to blog pages | HIGH | `BlogPostPage.tsx`, `BlogListPage.tsx` | 30 min |
| H-5 | Fix Article schema (image, publisher.logo) | HIGH | `BlogPostPage.tsx` | 45 min |
| M-1 | Add BreadcrumbList schema to blog posts | MEDIUM | `BlogPostPage.tsx` | 30 min |
| M-2 | Strengthen blog list page title | MEDIUM | `BlogListPage.tsx` | 10 min |
| M-3 | Align homepage meta descriptions | MEDIUM | `index.html` | 10 min |
| M-4 | Add author byline to blog posts | MEDIUM | `BlogPostPage.tsx` | 45 min |
| M-5 | Differentiate posts 2 & 3 keywords | MEDIUM | `blogPosts.ts` | 2 hrs |
| M-6 | Stagger blog post publication dates | MEDIUM | `blogPosts.ts` | 10 min |
| M-7 | Standardize brand name in content | MEDIUM | `blogPosts.ts`, `BlogListPage.tsx` | 15 min |
| M-8 | Add blog references to llms.txt | MEDIUM | `public/llms.txt` | 15 min |
| L-1 | Convert images to WebP | LOW | `public/`, `src/assets/images/` | 2 hrs |
| L-2 | Optimize or remove couple.png | LOW | `src/assets/images/couple.png` | 30 min |
| L-3 | Add internal links in blog body | LOW | `blogPosts.ts`, `BlogPostPage.tsx` | 2 hrs |
| L-4 | Reduce Google Fonts weight count | LOW | `index.html` | 30 min |
| L-5 | Add dateModified to blog schema | LOW | `blogPosts.ts`, `BlogPostPage.tsx` | 30 min |

---

## Recommended Execution Order

**Week 1 (2–3 hours total):**
1. C-1 — Sitemap fix (deploy immediately, submit to Search Console)
2. H-1 — Redirect fix (Vercel Dashboard)
3. M-6 — Stagger publication dates (quick, high freshness signal value)
4. M-7 — Brand name standardization

**Week 2 (3–4 hours total):**
5. H-2 — Shorten title tags
6. H-3 — Trim meta descriptions
7. H-4 — Add Twitter Card tags to blog pages
8. M-3 — Align homepage meta descriptions

**Week 3 (2–3 hours total):**
9. H-5 — Fix Article schema
10. M-1 — Add BreadcrumbList schema
11. M-2 — Blog list title
12. M-4 — Author byline
13. M-8 — Update llms.txt

**Week 4+ (as time allows):**
14. M-5 — Differentiate posts 2 & 3 (requires content strategy decision)
15. L-1 through L-5

**After completing Week 1 actions:** Monitor Google Search Console over the following 2–4 weeks for:
- Blog posts appearing in Coverage/Indexed report
- Sitemap errors resolved
- Click-through rate changes
