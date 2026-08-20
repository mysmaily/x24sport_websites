# X24Sport website quality gates

Use only the gates relevant to the requested change, but complete every selected
gate before claiming completion.

## Contents

1. Functional
2. Visual and responsive
3. Accessibility
4. Search and content
5. Structured data
6. Performance
7. Production and reporting

## 1. Functional

- Target page and affected API return the intended status and content.
- Navigation, filters, pagination, galleries, variants, forms, CTA links, and
  contact/order flows work with mouse, touch, and keyboard as applicable.
- Empty, loading, error, validation, unavailable, 404, and success states behave
  intentionally.
- Shared CMS changes do not leak content across tenants.

## 2. Visual and responsive

- Verify representative widths around 320, 375/390, 768, 1024, 1440, and a wide
  desktop; add task-specific breakpoints when the layout changes there.
- On product pages, verify that the product `h1` is immediately below the
  breadcrumb in DOM and visual order, with a computed font size of `20px` below
  the desktop breakpoint and `22px` at and above it.
- In product lists, verify a computed `18px` product-name size. When original and
  discounted prices are both present, verify that they remain on one line and
  that the discounted price computes exactly `2px` larger than the original.
- On catalog and category pages with results, verify that the first product row
  starts inside the initial viewport at `390x844` and `1440x900`.
- Verify that primary filter chips stay in one `40px`-high horizontal scroll row,
  the document itself has no horizontal overflow, and the secondary dropdown is
  closed without adding page height. Open and operate the dropdown with keyboard
  controls and confirm every indexable option remains a real anchor link.
- No horizontal overflow, clipped controls, hidden primary content, unreadable
  line lengths, broken sticky elements, or overlapping contact widgets.
- Images preserve intended crop and subject; text remains legible over media.
- Loading and font swaps do not cause disruptive movement.
- Capture fresh desktop and mobile screenshots for material UI changes.
- **Hard-stop defects:** do not hand off while any of the following is visible:
  accidental large blank space; type that is too large for its shopping context;
  overlapping, clipped, or colliding text; a control whose label blends into its
  fill; text that blends into its surface or image; an unexpected horizontal
  scrollbar; or a control obscured by another element.
- Inspect the actual rendered states, not just the default source state:
  long Vietnamese names/titles, two-line labels, sale prices, empty/error
  messages, hover/focus/disabled controls, and every changed breakpoint. Check
  each CTA and coloured badge for explicit foreground/background contrast.
- When using flex or grid, test its narrowest valid width with realistic long
  content. Resolve collisions by correcting the layout and text-sizing rules;
  never mask the failure with `overflow: hidden`, fixed heights, or arbitrary
  z-index values.

## 3. Accessibility

- Page has a useful language, title, main landmark, and descriptive main heading.
- Semantic elements and accessible names match their behavior.
- Every function is keyboard operable with visible focus and logical focus order.
- Dialogs/menus manage focus, Escape, state, and accessible naming correctly.
- Informative images have contextual alt text; decorative images use empty alt.
- Form controls have persistent labels, instructions, programmatic error
  association, and server-side validation.
- Text and controls meet WCAG AA contrast; meaning is not conveyed by color alone.
- Content reflows under zoom and reduced-motion preferences are respected.

## 4. Search and content

- Indexable page returns 200 and is crawlable; missing content returns a real 404
  or appropriate redirect, not a soft 404.
- Rendered HTML has page-specific title, canonical, main heading, and intended
  robots directives.
- Mobile and desktop contain equivalent primary content, metadata, alt text, and
  structured data.
- Internal navigation uses crawlable anchors and every intended product is
  reachable or included in an appropriate sitemap/feed.
- Sitemap includes canonical indexable URLs only; robots.txt and meta robots do
  not conflict.
- Every filter, sort, pagination, search, and variant URL has an explicit bounded
  policy for crawlability, indexability, canonicalization, links, and sitemap
  membership; equivalent filter states do not create an unbounded URL space.
- Copy is factual, original, useful, natural, and free of keyword stuffing or
  unsupported superlatives.

## 5. Structured data

- Markup describes visible content and uses current Google-supported types.
- Required properties exist and factual optional properties are synchronized.
- Product price, currency, availability, variants, image, shipping, and returns
  match Payload, visible content, Merchant Center data, and transaction behavior.
- Tenant-wide shipping and return entities exist only when backed by visible,
  factual policies; product-level overrides do not contradict the general policy.
- JSON-LD parses successfully and representative pages pass Rich Results Test.

## 6. Performance

- Record whether field data exists. Do not infer field success from Lighthouse.
- Record URL/tenant, template, device and viewport, network/CPU profile, cache and
  page state, tool version, field-data scope/period, and cold/warm navigation.
- Diagnose representative templates on mobile and desktop and compare before and
  after under equivalent conditions.
- Identify the dominant LCP or INP subpart, or the largest CLS cluster, and the
  concrete element, request, task, handler, DOM work, or shift culprit before
  prescribing a fix.
- LCP resource is discoverable early, not lazy-loaded, correctly sized, and not
  delayed by avoidable CSS/JS waterfalls.
- Images and embeds reserve space; dynamic UI and fonts do not create avoidable
  CLS.
- Main-thread long tasks and third-party scripts do not block primary interaction.
- Exercise changed commerce interactions in a trace, including relevant menu,
  filter, gallery, variant, pagination, and form flows; inspect input delay,
  processing duration, presentation delay, forced reflow, and DOM cost.
- Review relevant failed and passed Performance Insights, including document
  latency, render blocking, request discovery, dependency chains, image delivery,
  fonts, third parties, duplicated/legacy JavaScript, DOM size, and layout-shift
  culprits. Fix only findings connected to the measured outcome.
- Cache headers, CDN behavior, compression, and public/origin responses are
  checked when performance or deployment is in scope.

## 7. Production and reporting

- Syntax/type/build/test commands pass for changed packages.
- Browser console and relevant application, PHP, web-server, and container logs
  contain no new errors for tested flows.
- The canonical production runbook is followed without ad-hoc runtime or
  transfer commands.
- Cache/services are touched only when required and their scope is reported.
- Handoff identifies evidence as verified, inferred, not measured, or awaiting
  field data.
- No claim promises ranking, indexing, rich results, conversion lift, or Core Web
  Vitals improvement without measured evidence.
