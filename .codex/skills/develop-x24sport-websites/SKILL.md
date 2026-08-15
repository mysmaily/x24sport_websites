---
name: develop-x24sport-websites
description: >-
  Build, materially change, or diagnose the dynamic X24Sport Next.js/Payload
  tenant storefronts. Use when a request explicitly involves page or
  shared-component development, navigation/catalog architecture, SEO or
  structured data, accessibility, responsive behavior, conversion flows, Core
  Web Vitals, or production readiness; also use when inspection shows that an
  apparently small change can materially affect those concerns, shared behavior,
  or multiple tenants. Do not trigger solely because the target is public
  content. Routine tenant-scoped product/content CRUD, copy or image replacement,
  and isolated cosmetic edits stay under repository/domain guidance unless
  impact inspection reveals one of these risks.
---

# Develop X24Sport Websites

Build user-first ecommerce experiences that are visually coherent, crawlable,
accessible, fast, and verifiable. Treat Google eligibility and best practices as
engineering constraints, never as a promise of ranking.

## Load context

1. Read the repository `AGENTS.md` and the target website's `AGENTS.md` in full.
2. Identify exactly one target domain unless the user explicitly requests a
   cross-site component or rollout.
3. Inspect the current implementation only to locate the code and data involved
   in the requested outcome. Do not treat another site or a prior implementation
   as a reference design unless the user explicitly requests it.
4. Read the references required by the task:
   - Public UI, SEO, content, crawlability, or indexing: read
     `references/google-search-requirements.md`.
   - Category filters, product variants, structured commerce data, policies,
     sitemaps, or Merchant Center consistency: read
     `references/ecommerce-search-contract.md`.
   - Performance diagnosis, Core Web Vitals, Lighthouse, CrUX, or Chrome
     Performance Insights: read `references/performance-insights-workflow.md`.
   - Next.js or Payload implementation: read
     `references/implementation-adapters.md`.
   - Any change that will be handed off as complete: read
     `references/quality-gates.md`.
5. Recheck current official documentation when a rule, API, supported rich
   result, or metric may have changed. Prefer Google Search Central and web.dev
   for Google requirements, and primary framework documentation for APIs.

## Classify the task

- **Impact first**: classify by probable effect, not by the number of edited lines
  or records. A small edit can require this workflow when it changes LCP media,
  contrast, responsive layout, semantic meaning, crawlable links, metadata,
  structured data, shared CSS/components, or cross-tenant behavior.
- **Routine scoped change**: for isolated product/content CRUD, copy, image, or
  cosmetic edits, use repository/domain instructions and the relevant content or
  implementation guide. Inspect the affected render/data path, but do not load
  unrelated SEO or performance references or run the full workflow when the
  change cannot plausibly affect them.
- **Escalation**: if inspection reveals a material SEO, performance,
  accessibility, responsive, conversion, shared-code, or tenant-isolation impact,
  continue with this workflow and load only the references relevant to that
  impact.
- **Dynamic Next.js tenant**: resolve the target from Payload by domain, use App
  Router and Server Components by default, and read `<domain>/AGENTS.md` for its
  business scope and visual override. Current tenants include X24Sport,
  RynoSport and all specialist `mayao*.vn` websites.
- **Shared CMS change**: trace every affected tenant and verify tenant isolation.
  A shared collection or API change is not site-local merely because one site
  requested it.

## Execute the workflow

### 1. Define the outcome

- Translate the request into observable user outcomes and acceptance criteria.
- Identify the key page types and user journeys affected: home, category,
  product, article, quote/order, cart, checkout, contact, and search.
- Record only the current evidence required to verify the requested change.
- Separate facts from assumptions. Do not invent product claims, prices,
  availability, reviews, policies, addresses, or business credentials.

### 2. Design the experience

- Preserve the site's brand while creating a clear visual hierarchy, predictable
  navigation, readable typography, and purposeful calls to action.
- Keep every customer-visible word shopper-facing. Do not place technical,
  internal, staging, preview, CMS, AI, SEO, QA, or
  developer-process language in rendered UI copy unless the user explicitly asks
  for that wording on the page.
- Do not explain SEO or route mechanics to shoppers. Terms and ideas such as URL
  structure, canonical, indexable, crawlable, schema, route mapping, shareable
  pages, generated collections, and per-page uniqueness must stay in metadata,
  structured data, internal notes, or handoff text, not rendered helper copy.
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
- Strip internal rationale from public copy. Put implementation notes in code
  comments, task handoff, or runbooks instead of helper text, captions, menu
  headings, or empty states seen by shoppers.
- Before handoff, search changed customer-facing files for technical SEO,
  routing, CMS, QA, and developer-process wording; remove it unless it is the
  user's requested public wording.
- Render primary page content and metadata on the server when the platform
  supports it. Limit client JavaScript to real interaction needs.
- Use crawlable `<a href>` links for navigation. Buttons perform actions; links
  navigate.
- Reserve dimensions or aspect ratio for images and embeds. Make the LCP resource
  discoverable in initial HTML, do not lazy-load it, and give it appropriate
  loading priority.
- Keep generated image outputs outside Git according to the repository
  `.gitignore`; only publish optimized, intentional website assets.
- Do not create rollback copies, dumps, snapshots, archives, cloned containers,
  copied images, or renamed resources during deployment or mutation work.

### 4. Apply Google-aligned SEO

- Ensure every indexable page returns a successful HTTP response, is not blocked
  from Googlebot, and contains indexable user-visible content.
- Provide a descriptive, page-specific title, useful main heading, canonical URL,
  and a concise unique meta description where a summary helps users choose the
  result.
- Keep canonical, internal links, sitemap URLs, metadata, structured data, and
  Merchant Center data consistent.
- Classify every filter, sort, search, pagination, and variant URL before
  implementation. Curate useful indexable landing pages; prevent transient or
  combinatorial URL spaces from consuming crawl resources.
- Use self-referencing canonicals for unique pages. Give each paginated page its
  own URL and canonical; do not canonicalize the whole sequence to page one.
- Add only Google-supported structured data that matches visible facts. Validate
  required properties and never fabricate reviews, offers, stock, shipping, or
  return data.
- For purchasable apparel, evaluate `Product`/merchant listing and
  `ProductGroup` variants. Also evaluate `BreadcrumbList` and a single factual
  `OnlineStore`/`Organization` entity.
- Treat Payload, visible content, JSON-LD, sitemap, Merchant Center data, and
  ordering behavior as one commerce-data contract. Do not publish contradictory
  price, availability, variant, shipping, or return facts.
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
- Diagnose before prescribing: identify the actual tenant, page state, affected
  metric, dominant metric subpart, element, request, task, or layout-shift culprit.
- Record reproducible load traces and the affected commerce interactions. Compare
  before and after under equivalent conditions; never optimize from a score alone.
- Reduce TTFB and dependency chains, ship the least client JavaScript practical,
  defer non-critical third parties, optimize fonts and images, and avoid layout
  shifts according to the measured bottleneck.
- Test keyboard navigation, focus order, zoom/reflow, form labels and errors,
  contrast, reduced motion, screen-size extremes, and touch interactions.
- Never trade core functionality, content, or accessibility for a synthetic
  performance score.

### 6. Verify before handoff

1. Run syntax, type, unit, and production build checks appropriate to the stack.
   Note that Next.js 16 does not run a linter as part of `next build`.
2. Inspect rendered HTML, not only source code: metadata, canonical, robots,
   headings, links, image alternatives, and JSON-LD.
3. Validate structured data with Google's Rich Results Test and representative
   URLs with URL Inspection when connected access is available.
4. Check HTTP status, redirects, sitemap, robots.txt, desktop/mobile UI, browser
   console, logs, forms, product/catalog navigation, and any affected conversion
   flow.
5. For performance work, record the tested URL and tenant, field-data scope and
   period when available, device/network/cache conditions, metric subparts,
   culprit, and equivalent before/after evidence.
6. Confirm the requested outcome from fresh post-change evidence. Do not claim a
   ranking gain or Core Web Vitals pass without the corresponding data.

## Report the result

- State the target domain, page types, user outcome, and completed scope.
- List changed files, CMS records, schema types, and cache/services touched.
- Report exact verification commands and observed results.
- Distinguish `verified`, `inferred`, `not measured`, and `requires field data`.
- Link the official source when explaining a Google requirement.
- State remaining risks and manual follow-up without presenting recommendations
  as completed work.
