# Google Search requirements for X24Sport ecommerce

Checked against official Google documentation on 2026-07-16. Recheck the linked
page before relying on a changeable feature, supported schema field, or metric.

## Contents

1. Evidence levels
2. Search eligibility and crawlability
3. People-first ecommerce content
4. Page presentation and images
5. Ecommerce architecture and pagination
6. Structured data
7. Mobile-first indexing and JavaScript
8. Core Web Vitals
9. Myths and prohibited shortcuts
10. Official sources

## 1. Evidence levels

- **Requirement**: needed for eligibility, correct crawling/indexing, valid
  structured data, or safe operation.
- **Google best practice**: recommended by Google but not a guarantee of crawling,
  indexing, rich results, or ranking.
- **Project quality gate**: an X24Sport engineering standard for usability,
  accessibility, maintainability, or conversion. Do not mislabel it as a Google
  ranking factor.

Google explicitly does not guarantee indexing or rich results even when a page
meets documented requirements.

## 2. Search eligibility and crawlability

An indexable page must be publicly accessible, return HTTP 200, contain indexable
content, and not block Googlebot. Check the final response after redirects.

- Use crawlable `<a href>` links. Googlebot generally does not submit search
  forms or click load-more buttons.
- Keep robots.txt crawl controls separate from `noindex` indexing controls.
  Google must be able to crawl a page to see a robots meta directive.
- Use `X-Robots-Tag` for non-HTML resources when indexing control is needed.
- Put canonical URLs in rendered HTML or HTTP headers and keep signals consistent.
- Include only canonical URLs intended for Search in XML sitemaps. A sitemap is a
  hint, not a command.
- Use stable, human-readable URLs. Avoid session IDs, volatile parameters, and
  unnecessarily duplicated filter/sort URL spaces.

## 3. People-first ecommerce content

Create pages to help shoppers choose, size, customize, order, and care for sports
apparel. Base claims on verified product or business facts.

- Provide original value: real materials, fit, size guidance, customization
  options, production process, delivery constraints, care, and ordering steps.
- Keep page title and main heading descriptive rather than exaggerated.
- Show who the business is and how customers can verify or contact it.
- Review content for accuracy, freshness, duplication, and usefulness.
- Automation and AI are not inherently prohibited. Generating many unoriginal
  pages primarily to manipulate rankings is scaled content abuse.
- Do not create near-duplicate pages across the six domains by merely swapping
  sport names or keywords. Each site and page must serve its real audience.

## 4. Page presentation and images

- Write a unique, clear, concise `<title>` that accurately describes the page.
- A meta description is a candidate for the snippet, not a guaranteed snippet.
  Make it page-specific and useful; Google can select visible page text instead.
- Place important terms naturally in titles, main headings, alt text, link text,
  and visible content. Do not repeat them mechanically.
- Embed indexable images with `<img>` or `<picture>` and always provide fallback
  `src`; Google does not index CSS background images as page images.
- Put high-quality images near relevant visible text. Use descriptive filenames
  when practical, stable CDN URLs, responsive variants, and contextual alt text.
- Do not keyword-stuff alt text. Use `alt=""` for decorative images.
- Keep primary/LCP images discoverable in initial HTML and avoid lazy-loading
  them. Specify dimensions or aspect ratios to prevent layout shifts.

## 5. Ecommerce architecture and pagination

Build a crawlable hierarchy:

`home -> sport/category -> subcategory or filter landing page -> product`

- Link every indexable product from a crawlable category path or a sitemap/feed.
- Promote genuinely important categories and products through contextual internal
  links; Google infers relative importance from link relationships, not URL depth
  alone.
- For pagination, use unique URLs such as `?page=2`, sequential `<a href>` links,
  and a self-referencing canonical on every page.
- Do not canonicalize all pages in a sequence to page one.
- Google no longer uses `rel=next` and `rel=prev` for pagination.
- Do not use URL fragments for page numbers.
- Prevent unwanted filter and alternate-sort combinations from becoming an
  unbounded crawl/index space. Choose deliberately among crawl controls,
  `noindex`, canonicalization, and curated indexable filter landing pages.

## 6. Structured data

Structured data must describe visible page content and use Google-supported
types and properties. It does not create content or override contradictory page
facts.

For X24Sport, evaluate:

- `Product` with a factual `Offer`/merchant listing for a purchasable product.
- `ProductGroup` plus `Product` variants when color, size, material, or style
  variants have real selectable offers and stable URLs.
- `BreadcrumbList` that reflects a normal user path, not merely the URL string.
- One factual `OnlineStore` or suitable `Organization` entity on the home or
  about page, with real name, URL, logo, and contact/business details.
- Shipping and return properties only when the displayed policies and operational
  data exist and match.

Rules:

- Never fabricate ratings, reviews, price, stock, brand, identifiers, shipping,
  or return policies.
- Keep structured price, currency, availability, and variant data synchronized
  with visible content, checkout behavior, and Merchant Center feeds.
- Include required properties, add relevant recommended properties, and validate
  representative pages in Rich Results Test.
- A valid test result establishes technical eligibility, not that Google will
  display a rich result.

## 7. Mobile-first indexing and JavaScript

Google uses the mobile version for indexing and ranking.

- Prefer responsive design on the same URL.
- Keep primary content, meaningful headings, metadata, image alt text, and
  structured data equivalent on mobile and desktop.
- Content may live in tabs or accordions, but must not require interaction before
  it exists in rendered HTML.
- Do not lazy-load primary content only after click, swipe, typing, or scrolling
  logic that a crawler may not trigger.
- Server-render or statically render critical Next.js content and metadata.
- A page initially marked `noindex` may not be rendered, so do not depend on
  JavaScript to remove `noindex` later.
- Ensure Google can fetch required JavaScript, CSS, image, and font resources.

## 8. Core Web Vitals

Assess field data at the 75th percentile, separately for mobile and desktop:

| Metric | Good | Needs improvement | Poor |
|---|---:|---:|---:|
| LCP | `<= 2.5 s` | `> 2.5 s` to `4.0 s` | `> 4.0 s` |
| INP | `<= 200 ms` | `> 200 ms` to `500 ms` | `> 500 ms` |
| CLS | `<= 0.1` | `> 0.1` to `0.25` | `> 0.25` |

Use CrUX, PageSpeed Insights field data, and Search Console for user experience.
Use Lighthouse, DevTools, and local traces to diagnose reproducible causes.

Prioritize:

- LCP: fast HTML/TTFB, early discovery and priority of the LCP resource, short
  resource load time, and no render-blocking delay after it arrives.
- INP: short main-thread tasks, minimal client JavaScript, fast event handlers,
  and immediate visual feedback for navigation, gallery, filters, and ordering.
- CLS: explicit image/embed dimensions, reserved dynamic space, stable banners,
  and well-managed font loading.

## 9. Myths and prohibited shortcuts

- Google does not use the meta keywords tag.
- There is no Google-prescribed minimum word count.
- There is no magical heading count or heading order for ranking. Use semantic
  order for people and assistive technology.
- E-E-A-T is not a single ranking factor. Demonstrate real trust and experience
  because it helps users and aligns with people-first evaluation.
- Duplicate content does not automatically cause a “duplicate content penalty,”
  but duplication wastes crawl resources and weakens page value and canonical
  clarity.
- Keyword domains, keyword repetition, or schema volume do not guarantee ranking.
- Never doorway-page, cloak, scrape, spin, or mass-generate thin cross-domain
  pages.

## 10. Official sources

Google Search Central:

- [Search Essentials](https://developers.google.com/search/docs/essentials)
- [SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [Helpful, reliable, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- [Spam policies](https://developers.google.com/search/docs/essentials/spam-policies)
- [JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [Mobile-first indexing](https://developers.google.com/search/docs/crawling-indexing/mobile/mobile-sites-mobile-first-indexing)
- [Canonical URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Robots meta and X-Robots-Tag](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag)
- [Image SEO](https://developers.google.com/search/docs/appearance/google-images)
- [Ecommerce SEO](https://developers.google.com/search/docs/specialty/ecommerce)
- [Ecommerce site structure](https://developers.google.com/search/docs/specialty/ecommerce/help-google-understand-your-ecommerce-site-structure)
- [Pagination and incremental loading](https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading)
- [Product structured data](https://developers.google.com/search/docs/appearance/structured-data/product)
- [Product variants](https://developers.google.com/search/docs/appearance/structured-data/product-variants)
- [Breadcrumb structured data](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb)
- [Organization structured data](https://developers.google.com/search/docs/appearance/structured-data/organization)
- [General structured data guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)

Google web.dev:

- [Web Vitals](https://web.dev/articles/vitals)
- [Optimize LCP](https://web.dev/articles/optimize-lcp)
- [Interaction to Next Paint](https://web.dev/articles/inp)
- [Optimize CLS](https://web.dev/articles/optimize-cls)
- [Core Web Vitals tools](https://web.dev/articles/vitals-tools)
- [Learn Accessibility](https://web.dev/learn/accessibility/)
- [Accessible forms](https://web.dev/learn/accessibility/forms)
