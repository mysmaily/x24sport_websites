---
name: update-shop-tenant
description: >-
  Build, materially change, or diagnose an existing brand/shop tenant for a
  bounded outcome. Use for page or shared-component development,
  navigation/catalog architecture, SEO or structured data, accessibility,
  responsive behavior, conversion flows, Core Web Vitals, CMS implementation, or
  production readiness on identified pages. Do not use for creating, rebuilding,
  or completing a whole tenant.
---

# Update Shop Tenant

Build user-first ecommerce experiences that are visually coherent, crawlable,
accessible, fast, and verifiable. Treat search eligibility and performance best
practices as engineering constraints, never as a promise of ranking.

## Route whole-tenant requests

If the requested outcome is to add, launch, rebuild, or complete a tenant as a
whole, stop this workflow and use only `$create-shop-tenant`. Continue here only
when the requested outcome is bounded to identified pages, components, routes,
shared behavior, content records, or technical concerns.

## Load context

1. Read root `AGENTS.md` and the target website's `AGENTS.md` in full when the
   profile exists.
2. Identify exactly one target domain unless the user explicitly requests a
   cross-site component or rollout.
3. Inspect the current implementation only to locate the code and data involved
   in the requested outcome. Do not treat another shop or prior implementation
   as a reference design unless the user explicitly requests it.
4. Read only the references required by the task:
   - Public UI, SEO, content, crawlability, or indexing:
     `references/google-search-requirements.md`
   - Category filters, product variants, structured commerce data, policies,
     sitemaps, or Merchant Center consistency:
     `references/ecommerce-search-contract.md`
   - Performance diagnosis, Core Web Vitals, Lighthouse, CrUX, or Chrome
     Performance Insights: `references/performance-insights-workflow.md`
   - Next.js or Payload implementation: `references/implementation-adapters.md`
   - Any change handed off as complete: `references/quality-gates.md`
5. Recheck current official documentation when a rule, API, supported rich
   result, metric, library, or framework behavior may have changed.

## Classify the task

- Impact first: classify by probable effect, not by edited-line count. A small
  edit can require this workflow when it changes LCP media, contrast, responsive
  layout, semantic meaning, crawlable links, metadata, structured data, shared
  CSS/components, or cross-tenant behavior.
- Routine scoped change: for isolated product/content CRUD, copy, image, or
  cosmetic edits, use repository/domain instructions and load only the render or
  data path needed to verify the change.
- Escalation: if inspection reveals material SEO, performance, accessibility,
  responsive, conversion, shared-code, or tenant-isolation impact, continue with
  this workflow and load only the relevant references.
- Dynamic tenant: resolve the target from the request host or tenant profile,
  use App Router and Server Components by default, and verify tenant isolation
  for shared CMS or data-layer changes.

## Execute the workflow

### 1. Define the outcome

- Translate the request into observable user outcomes and acceptance criteria.
- Identify affected page types and journeys: home, category, product, article,
  quote/order, cart, checkout, contact, and search.
- Record only the current evidence required to verify the requested change.
- Separate facts from assumptions. Do not invent product claims, prices,
  availability, reviews, policies, addresses, or business credentials.

### 2. Design the experience

- Preserve the shop's brand while creating clear hierarchy, predictable
  navigation, readable typography, and purposeful calls to action.
- Keep every customer-visible word shopper-facing. Do not place technical,
  internal, staging, preview, CMS, AI, SEO, QA, or developer-process language in
  rendered UI copy unless the user explicitly asks for that wording.
- Design mobile-first without reducing primary content or metadata relative to
  desktop.
- Make product discovery possible through crawlable category and product links.
- Specify empty, loading, error, unavailable-product, validation, success, and
  focus states before calling a flow complete.
- Use semantic HTML, keyboard-operable controls, visible focus, labeled forms,
  useful errors, adequate target sizes, and meaningful image alternatives.
- Reuse existing tokens, components, templates, data functions, and CMS fields
  before adding new abstractions.

### 3. Implement minimally

- Render primary page content and metadata on the server when the platform
  supports it. Limit client JavaScript to real interaction needs.
- Use crawlable `<a href>` links for navigation. Buttons perform actions; links
  navigate.
- Reserve dimensions or aspect ratio for images and embeds. Make the LCP
  resource discoverable in initial HTML and avoid lazy-loading it.
- Give every interactive control explicit foreground, background, border,
  hover, focus-visible, disabled, and loading treatment where applicable.
- Constrain text deliberately so long Vietnamese names, two-line labels, badges,
  and prices do not collide or overflow.

### 4. Apply ecommerce search contract

- Ensure every indexable page returns a successful HTTP response, is crawlable,
  and contains indexable user-visible content.
- Provide page-specific title, main heading, canonical URL, and useful meta
  description where a summary helps users choose the result.
- Keep canonical, internal links, sitemap URLs, metadata, structured data, and
  commerce data consistent.
- Classify every filter, sort, search, pagination, and variant URL before
  implementation. Curate useful indexable landing pages; prevent transient or
  combinatorial URL spaces from consuming crawl resources.
- Add only supported structured data that matches visible facts. Never fabricate
  reviews, offers, stock, shipping, or return data.

### 5. Protect performance and accessibility

- Measure field data first when available; use Lighthouse and local traces for
  diagnosis, not as substitutes for field data.
- Diagnose before prescribing: identify the actual tenant, page state, affected
  metric, dominant metric subpart, element, request, task, or layout-shift
  culprit.
- Test keyboard navigation, focus order, zoom/reflow, form labels and errors,
  contrast, reduced motion, screen-size extremes, and touch interactions.
- Never trade core functionality, content, or accessibility for a synthetic
  performance score.

### 6. Verify before handoff

1. Run syntax, type, unit, and production build checks appropriate to the stack.
2. Inspect rendered HTML, not only source code: metadata, canonical, robots,
   headings, links, image alternatives, and JSON-LD.
3. Check HTTP status, redirects, sitemap, robots.txt, desktop/mobile UI, browser
   console, logs, forms, product/catalog navigation, and affected conversion
   flow.
4. For material UI work, inspect fresh rendered screenshots at 390x844 and
   1440x900, plus affected breakpoints.
5. Confirm the requested outcome from fresh post-change evidence.

## Report the result

State the target domain, page types, user outcome, completed scope, changed
files/CMS records/schema types, cache/services touched, exact verification
commands and observed results, deployment status, and remaining risks. Label
evidence as `verified`, `inferred`, `not measured`, or `requires field data`.
