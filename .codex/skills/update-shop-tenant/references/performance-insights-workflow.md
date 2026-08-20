# Performance Insights workflow for brand shops

Use this workflow for performance diagnosis, Core Web Vitals work, Lighthouse,
CrUX, PageSpeed Insights, or Chrome DevTools Performance Insights. Treat the
thresholds as Google guidance and the workflow as a starter-kit quality gate.

## Contents

1. Evidence hierarchy
2. Measurement contract
3. Field-data diagnosis
4. LCP workflow
5. INP workflow
6. CLS workflow
7. Supporting insights
8. Brand shop coverage
9. Verification and reporting
10. Official sources

## 1. Evidence hierarchy

1. Use field data to assess real-user Core Web Vitals when sufficient data exists.
2. Use reproducible local traces to identify causes and verify mechanisms.
3. Use Lighthouse audits as diagnostic signals, not proof of field improvement.
4. Use source inspection only to form hypotheses; verify in rendered HTML and a
   browser trace.

Do not interpret missing URL-level CrUX data as a pass. Record whether available
data is URL-level or origin-level and whether it represents the target tenant and
device class.

## 2. Measurement contract

Before comparing results, record:

- public URL, resolved tenant, template, route, and relevant page state;
- mobile or desktop, viewport, browser/tool version, CPU/network profile, and
  whether field data is URL-level or origin-level;
- cold load, warm load, or client navigation; cache, cookies, consent UI, login,
  and extensions that materially affect the run;
- field-data collection period when the tool exposes it;
- actual LCP element and affected user interaction, not only the aggregate score.

Compare before and after under equivalent conditions. Repeat noisy lab runs and
report representative results or a distribution; do not select the best run.
For dynamic tenant routes, send the correct host and verify the returned brand,
canonical, and HTML before accepting a trace.

## 3. Field-data diagnosis

- Start with Search Console Core Web Vitals, PageSpeed Insights, CrUX, or existing
  RUM data to identify affected device class, template group, and metric.
- Compare URL-level and origin-level data; do not attribute an origin-wide issue
  to a single page without supporting evidence.
- When CrUX lacks diagnostic detail, use the `web-vitals` attribution build or an
  existing RUM provider when instrumentation is in scope. Segment by tenant,
  template, viewport/device class, navigation type, and release.
- For INP, capture the interaction target and input, processing, and presentation
  phases. For LCP, capture the element and four LCP subparts. For CLS, capture the
  largest cluster and likely culprit.
- Treat RUM instrumentation as a privacy and analytics change. Do not add it
  without the request or existing project authorization.

## 4. LCP workflow

Break LCP into:

1. time to first byte;
2. resource load delay;
3. resource load duration;
4. element render delay.

Optimize the dominant avoidable subpart:

- **TTFB**: inspect redirects, tenant resolution, server work, cache behavior,
  origin latency, and document response.
- **Resource load delay**: ensure the resource is discoverable in initial HTML;
  inspect lazy loading, CSS backgrounds, client insertion, preload, and priority.
- **Resource load duration**: inspect encoded size, dimensions, format, CDN,
  connection reuse, and bandwidth contention.
- **Element render delay**: inspect render-blocking CSS/fonts, hydration, main
  thread work, visibility/animation, and delayed client state.

Do not assume an image is the bottleneck merely because it is the LCP element.
Reducing bytes may not improve LCP when render delay dominates.

For a homepage hero:

- inspect production HTML and the Network/Performance trace before adding preload;
- preload only the actual first mobile and desktop hero resources with correct
  responsive hints when normal HTML discovery is insufficient;
- keep the true LCP image eager and appropriately prioritized;
- remove competing priority/preload signals from below-fold product media;
- verify that the fix improves discovery without downloading an unused breakpoint
  asset or competing with critical CSS/fonts.

## 5. INP workflow

Reproduce the slow interaction and divide it into:

1. input delay;
2. processing duration;
3. presentation delay.

Inspect the Interactions track and `INP by phase` insight:

- input delay: find startup work, long tasks, timers, third parties, or overlapping
  interactions occupying the main thread;
- processing duration: find expensive handlers, synchronous computation, broad
  state updates, and work that can be removed, deferred, split, or yielded;
- presentation delay: find large DOM updates, style/layout work, forced reflow,
  expensive paint, and unnecessary rendering scope.

Keep immediate visual feedback in the current frame and defer non-critical work
when behavior remains correct. Do not remove keyboard behavior, validation,
content, or accessibility to improve an interaction metric.

## 6. CLS workflow

- Start with the largest layout-shift cluster, not the first individual shift.
- Use screenshots, affected nodes, and `Layout shift culprits` to identify both the
  shifted element and the element that caused the movement.
- Check unsized media, late banners/widgets, injected validation, fonts, sticky
  elements, animations, and content inserted above existing content.
- Exercise post-load flows; consent UI, menus, filters, gallery changes, forms, and
  contact widgets can create CLS that a load-only audit misses.
- Reserve intentional space and prefer transform/opacity animation where suitable.

## 7. Supporting insights

Use Performance Insights to confirm or reject relevant hypotheses:

- document request latency and render-blocking requests;
- LCP request discovery and network dependency chains;
- third-party transfer and main-thread cost;
- image delivery and responsive image waste;
- font display;
- duplicated or legacy JavaScript;
- DOM size, forced reflow, and mobile viewport configuration.

Do not fix every surfaced insight automatically. Prioritize findings connected to
the requested outcome, dominant metric subpart, or measured user journey.

## 8. Brand shop coverage

Choose representative templates affected by the change. For storefront work,
consider home, category/catalog, product, article, and quote/order flows. Exercise
at least the interactions changed or plausibly affected:

- mobile navigation and search;
- primary and secondary category filters;
- pagination or load-more UI backed by crawlable pages;
- product gallery and zoom;
- variant, size, color, and quantity selection;
- consultation/order form open, validation, and submission feedback.

Run mobile and desktop diagnosis when code, media, or layout differs. Do not claim
site-wide results from one template or one tenant.

## 9. Verification and reporting

Report:

- field source, scope, period, percentile, and availability;
- lab setup, run count, page state, and before/after results;
- metric subpart and concrete culprit addressed;
- Performance Insights that failed before and their state after;
- templates, tenant domains, and interactions exercised;
- regressions checked, including transferred bytes, competing preloads, console
  errors, functional behavior, and accessibility;
- whether the conclusion is verified locally, supported by field data, inferred,
  not measured, or awaiting new field data.

A local improvement does not establish a Core Web Vitals field pass. Field data
needs enough new traffic and time before attributing a real-user change.

## 10. Official sources

- [Chrome Performance panel](https://developer.chrome.com/docs/devtools/performance/overview)
- [Performance Insights](https://developer.chrome.com/docs/devtools/performance-insights)
- [Performance features reference](https://developer.chrome.com/docs/devtools/performance/reference)
- [Performance Insights sidebar](https://developer.chrome.com/blog/devtools-insights-sidebar)
- [Core Web Vitals workflows](https://web.dev/articles/vitals-tools)
- [Why lab and field data differ](https://web.dev/articles/lab-and-field-data-differences)
- [Optimize LCP](https://web.dev/articles/optimize-lcp)
- [Optimize INP](https://web.dev/articles/optimize-inp)
- [Optimize CLS](https://web.dev/articles/optimize-cls)
- [Find slow interactions in the field](https://web.dev/articles/find-slow-interactions-in-the-field)
- [Field measurement best practices](https://web.dev/articles/vitals-field-measurement-best-practices)
