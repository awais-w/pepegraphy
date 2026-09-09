# SEO Optimization Guide — Pepegraphy

This document captures the SEO baseline now in place plus a prioritized backlog for improving search-engine ranking. It assumes the site is deployed at `https://pepegraphy.com`.

---

## ✅ Current State (Implemented)

> See the commits and the files below for what is already live.

### Core metadata (`index.html`)
- Unique, keyword-rich `<title>` and `description` per section.
- `canonical` tag pointing to the root href.
- `geo.*` meta tags + `ICBM` for local SEO (London-based UK service).
- `viewport` + `theme-color` for mobile friendliness.
- `robots`: `index, follow` with image-preview directives.

### Social / OG
- Complete Open Graph block (title, description, image, site_name, locale + alternate locale `hu_HU`).
- Twitter Card (`summary_large_image`) with creator handle.
- OG image dimensions tagged (`1200×630`).

### Structured data (`application/ld+json`)
- `Photographer` schema (name, founder Person, areaServed, price range, contact, sameAs).
- `WebSite` schema with `SearchAction` potential for sitelinks searchbox.

### Technical / accessibility
- Semantic `<section>` landmarks with `aria-labelledby` + explicit `id` + `id`-tagged headings.
- Footer nav exposed with `aria-label="Footer navigation"`.
- Hero background image marked `aria-hidden` to avoid noise; first image is `loading="eager"` + `decoding="async"`.
- Portfolio images `loading="lazy"` + `decoding="async"`.
- `banned: /admin` in `robots.txt`; `Crawl-delay` for polite crawling.
- `manifest.webmanifest` (PWA install signal — indirect SEO benefit: engagement).

### Sitemap / robots
- `sitemap.xml` now includes image entries (`xmlns:image`) for the hero + key portfolio shots.
- `robots.txt` references the sitemap and explicitly allows `/gallery/`.

---

## 📋 Ranking Guideline — Actionable Backlog

### Tier 1 — High impact, low effort (do first)
1. **PageSpeed / Core Web Vitals**
   - Run `lighthouse` against the live site; record LCP, FID, CLS.
   - Hero carousel is a large LCP candidate. The current hero image is not optimized (single 768×1024 PNG). Consider generating a properly-sized, compressed JPEG/WEBP hero and serving it via `<img srcset>` or a `<picture>` with `sizes`.
   - Gallery images are 3000–6000 px originals. Serve responsive thumbnails (`srcset` with 400/800/1600 px) rather than full originals for the grid — this is the largest potential win for LCP/CLS.

2. **Location + service keywords**
   - The `description`/`keywords` already say "London" — add one dedicated **Service-area page** per major category if/when more content is added (e.g. `/portrait-photography-london`). The About/Hero text should naturally mention "London wedding / event photographer" when relevant.

3. **Social presence**
   - Confirm `sameAs` links in schema are live and verified.
   - The `twitter:creator` is `@pepegraphy` — confirm that account exists or update.

4. **Image `alt` audit**
   - Verify every gallery image has a meaningful, unique `alt` (currently pulled from `data/portfolioData.js`). None should be generic like "Gallery photo".

### Tier 2 — Medium effort, medium impact
5. **Multilingual URLs + hreflang**
   - Currently content switches in-place via React (no URL change). This is fine for UX but **hurts SEO for the Hungarian version**: Hungarian pages are never indexed because there is no `hu/` route.
   - Recommendation: implement localized routes (`/`, `/hu`) and `hreflang="en-GB hu-HU"` with a self-referencing canonical per page. This is an architectural change — plan as a follow-up.

6. **Dedicated content / blog**
   - Photography SEO rewards fresh, location-tagged content (e.g. "Best Spring Photo Walks in London", session recaps). Add a `/journal` route with markdown posts. Each post should be indexed (add to `sitemap.xml` with a `lastmod`).

7. **Reviews / testimonials**
   - Add `Review` schema (aggregate + individual) once social proof content exists. High trust signals for local + commercial queries.

8. **Contact-form SEO**
   - The contact form is JS-driven; the `mailto:` fallback is the indexable path. Ensure the email/phone are visible as plain HTML too (already done in the markup).

### Tier 3 — High effort, long-tail impact
9. **Per-image landing pages**
   - Consider a `/gallery/[id]` detail page with `ImageObject` schema for every photo — enables Google Images traffic + rich results. Only worth it if the portfolio grows significantly.

10. **Structured data for portfolio items**
    - Add `ImageObject` / `CreativeWork` entries to the JSON-LD graph for featured portfolio pieces.

11. **Google Search Console + Analytics**
    - Wire up GSC (free) and GA4. Verify coverage, fix 404s/redirects, and monitor "coverage → excluded" for the `/admin` path.

12. **Performance budget**
    - Add a `vite-plugin-compression` step for gzip/Brotli, and set `build.rollupOptions.output.manualChunks` to split vendor (framer-motion, lightgallery) from content. Currently the JS bundle is ~786 KB minified.

---

## 📏 How to Keep This Updated

- After major content edits, bump the `<meta name="description">` and the matching JSON-LD `description`.
- When adding a new photo category, add it to `sitemap.xml` image entries.
- When the Hungarian route ships, add an `alternate` hreflang entry here and remove the `og:locale:alternate` single-value hack.

---

## 🔍 Quick checklist for ranking checks

| Item | Tool | Frequency |
|------|------|-----------|
| Lighthouse score + Core Web Vitals | Chrome DevTools / PSI | Monthly |
| Indexed page count | `site:pepegraphy.com` | Monthly |
| Rich result status | Google Search Console | Monthly |
| Image-index impressions | Google Images search console | Monthly |
| Broken-backlink audit | Ahrefs / free: `site:linkedin.com "pepegraphy"` | Quarterly |

---

*File generated as part of the SEO optimization pass. Treat the backlog as a living doc — tick items off as they ship.*