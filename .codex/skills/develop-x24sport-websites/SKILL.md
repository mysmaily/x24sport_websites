---
name: develop-x24sport-websites
description: Build, redesign, extend, or audit the X24Sport mayao*.vn websites across Next.js/Payload and WordPress. Use for public UI/UX, layouts, navigation, product and category pages, content architecture, technical or on-page SEO, structured data, accessibility, responsive behavior, Core Web Vitals, conversion flows, and production-readiness work on mayaocaulong.vn, mayaobongchuyen.vn, mayaopickleball.vn, mayaobongro.vn, mayaochaybo.vn, or mayaobongda.vn.
---

# Develop X24Sport Websites

Build user-first ecommerce experiences that are visually coherent, crawlable,
accessible, fast, and verifiable. Treat Google eligibility and best practices as
engineering constraints, never as a promise of ranking.

## Load context

1. Read the repository `AGENTS.md` and the target website's `AGENTS.md` in full.
2. Identify exactly one target domain unless the user explicitly requests a
   cross-site component or rollout.
3. Inspect the existing implementation before proposing architecture or adding
   components, plugins, schema, routes, or content.
4. Read the references required by the task:
   - Public UI, SEO, content, crawlability, or indexing: read
     `references/google-search-requirements.md`.
   - Next.js, Payload, or WordPress implementation: read
     `references/implementation-adapters.md`.
   - Any change that will be handed off as complete: read
     `references/quality-gates.md`.
5. Recheck current official documentation when a rule, API, supported rich
   result, or metric may have changed. Prefer Google Search Central and web.dev
   for Google requirements, and primary framework documentation for APIs.

## Classify the task

- **Next.js tenant**: `mayaocaulong.vn`, `mayaobongchuyen.vn`, and
  `mayaopickleball.vn`; use App Router, Server Components by default, Payload
  tenant data, and the shared `cms-api`.
- **WordPress site**: `mayaobongro.vn`, `mayaochaybo.vn`, and
  `mayaobongda.vn`; use the child theme, site-specific plugin, or documented
  operational mechanism. Never edit WordPress core or a parent theme.
- **Shared CMS change**: trace every affected tenant and verify tenant isolation.
  A shared collection or API change is not site-local merely because one site
  requested it.

## Execute the workflow

### 1. Define the outcome

- Translate the request into observable user outcomes and acceptance criteria.
- Identify the key page types and user journeys affected: home, category,
  product, article, quote/order, cart, checkout, contact, and search.
- Record the pre-change baseline with screenshots, HTML/HTTP evidence, relevant
  analytics or Search Console data when available, and field Core Web Vitals
  when performance is in scope.
- Separate facts from assumptions. Do not invent product claims, prices,
  availability, reviews, policies, addresses, or business credentials.

### 2. Design the experience

- Preserve the site's brand while creating a clear visual hierarchy, predictable
  navigation, readable typography, and purposeful calls to action.
- Design mobile-first without reducing primary content or metadata relative to
  desktop. Responsive layout may differ; meaning and capability must remain.
- Make product discovery possible through crawlable category and product links.
- Keep critical content and navigation available without requiring a click,
  swipe, search submission, or client-only state initialization.
- Specify empty, loading, error, unavailable-product, validation, success, and
  focus states before calling a flow complete.
- Use semantic HTML, keyboard-operable controls, visible focus, labeled forms,
  useful errors, adequate target sizes, and meaningful image alternatives.

### 3. Implement minimally

- Reuse existing tokens, components, templates, data functions, and CMS fields
  before adding new abstractions.
- Render primary page content and metadata on the server when the platform
  supports it. Limit client JavaScript to real interaction needs.
- Use crawlable `<a href>` links for navigation. Buttons perform actions; links
  navigate.
- Reserve dimensions or aspect ratio for images and embeds. Make the LCP resource
  discoverable in initial HTML, do not lazy-load it, and give it appropriate
  loading priority.
- Keep generated image outputs outside Git according to the repository
  `.gitignore`; only publish optimized, intentional website assets.
- Back up every remote file, configuration, or database record before mutation.

### 4. Apply Google-aligned SEO

- Ensure every indexable page returns a successful HTTP response, is not blocked
  from Googlebot, and contains indexable user-visible content.
- Provide a descriptive, page-specific title, useful main heading, canonical URL,
  and a concise unique meta description where a summary helps users choose the
  result.
- Keep canonical, internal links, sitemap URLs, metadata, structured data, and
  Merchant Center data consistent.
- Use self-referencing canonicals for unique pages. Give each paginated page its
  own URL and canonical; do not canonicalize the whole sequence to page one.
- Add only Google-supported structured data that matches visible facts. Validate
  required properties and never fabricate reviews, offers, stock, shipping, or
  return data.
- For purchasable apparel, evaluate `Product`/merchant listing and
  `ProductGroup` variants. Also evaluate `BreadcrumbList` and a single factual
  `OnlineStore`/`Organization` entity.
- Write original, useful Vietnamese content from real product and business facts.
  Do not keyword-stuff, mass-produce thin pages, or create content primarily to
  manipulate rankings.
- Use standard `<img>`/`picture` markup with a fallback `src`, descriptive
  filenames where practical, responsive sources, relevant nearby text, and
  contextual alt text. Decorative images use `alt=""`.

### 5. Protect performance and accessibility

- Measure field data first when available; use Lighthouse and local traces for
  diagnosis, not as substitutes for field data.
- Target good Core Web Vitals at the 75th percentile separately for mobile and
  desktop: LCP at most 2.5 s, INP at most 200 ms, and CLS at most 0.1.
- Reduce TTFB and waterfalls, ship the least client JavaScript practical, defer
  non-critical third parties, optimize fonts and images, and avoid layout shifts.
- Test keyboard navigation, focus order, zoom/reflow, form labels and errors,
  contrast, reduced motion, screen-size extremes, and touch interactions.
- Never trade core functionality, content, or accessibility for a synthetic
  performance score.

### 6. Verify before handoff

1. Run syntax, type, unit, and production build checks appropriate to the stack.
   Note that Next.js 16 does not run a linter as part of `next build`.
2. Run `scripts/audit_page.py` against representative public or local production
   pages after rendering them.
3. Inspect rendered HTML, not only source code: metadata, canonical, robots,
   headings, links, image alternatives, and JSON-LD.
4. Validate structured data with Google's Rich Results Test and representative
   URLs with URL Inspection when connected access is available.
5. Check HTTP status, redirects, sitemap, robots.txt, desktop/mobile UI, browser
   console, logs, forms, product/catalog navigation, and any affected conversion
   flow.
6. Compare post-change evidence with the baseline. Do not claim a ranking gain or
   Core Web Vitals pass without the corresponding data.

## Run the page audit

```bash
python3 .codex/skills/develop-x24sport-websites/scripts/audit_page.py \
  https://mayaocaulong.vn/san-pham/example
```

Use `--allow-noindex` only for an intentionally non-indexable page. Treat the
script as a fast deterministic gate; it does not replace Search Console, Rich
Results Test, browser accessibility testing, or field performance data.

## Report the result

- State the target domain, page types, user outcome, and completed scope.
- List changed files, CMS records, schema types, backups, and cache/services
  touched.
- Report exact verification commands and observed results.
- Distinguish `verified`, `inferred`, `not measured`, and `requires field data`.
- Link the official source when explaining a Google requirement.
- State remaining risks and manual follow-up without presenting recommendations
  as completed work.
