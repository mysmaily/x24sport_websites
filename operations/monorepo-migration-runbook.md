# X24Sport Monorepo Migration Runbook

## Goal

Move the X24Sport Next.js tenant frontends toward a pnpm monorepo with shared
technical packages while preserving each site's visual identity, public URL
contract, tenant data isolation, analytics behavior, SEO output, and deployment
scope.

This runbook covers:

- `x24sport.vn`
- `mayaocaulong.vn`
- `mayaopickleball.vn`
- `mayaobongchuyen.vn`
- `mayaobongro.vn`
- `mayaochaybo.vn`
- shared `cms-api` only when a package needs to consume or align with Payload
  types; do not rebuild or deploy CMS for frontend-only package work.

Do not include `mayaobongda.vn` in the monorepo frontend migration unless it is
explicitly in scope as a Next.js/Payload frontend. Treat WordPress runtime data
as legacy or site-specific unless the active platform profile says otherwise.

## Non-negotiables

- Follow `../AGENTS.md`, the target website `AGENTS.md`, and
  `../PRODUCTION-DEPLOYMENT-RUNBOOK.md`.
- Keep production deployment per frontend. A shared package change may affect
  multiple apps locally, but production rollout must still build, deploy, and
  verify one target at a time.
- Do not move folders to `apps/` until deployment paths and runbook commands are
  intentionally updated and verified. The first migration phase should add a
  root workspace around current folders.
- Do not create rollback copies, dumps, snapshots, archives, cloned containers,
  copied images, or renamed runtime resources.
- Never rsync `.env*`, `.next`, `node_modules`, `.git`, generated operations
  artifacts, or secrets.
- Do not widen `@x24sport/ui` into a design system for site personality.
  Header, footer, product card layout, homepage sections, landing pages, and
  brand-specific visual systems stay inside each website.
- Shared code must be tenant-safe by construction. Every Payload query must
  require or derive the target tenant scope explicitly.

## Current Inventory

| Site | Package name | Dev port | Build | Typecheck | Notes |
|---|---|---:|---|---|---|
| `x24sport.vn` | `x24sport-frontend` | 3010 | `pnpm build` | `pnpm typecheck` | Next.js app with legacy route catch-all, sitemap, robots, analytics, SEO helpers |
| `mayaocaulong.vn` | `mayaocaulong-frontend` | 3002 | `pnpm build` | add before migration | Next.js app; strong overlap with pickleball; no app sitemap/robots currently found in route inventory |
| `mayaopickleball.vn` | `mayaopickleball-frontend` | 3004 | `pnpm build` | add before migration | Next.js app; has sitemap, robots, analytics, product tracking |
| `mayaobongchuyen.vn` | `mayaobongchuyen-frontend` | 3003 | `pnpm build` | add before migration | Smallest app surface; useful for lightweight build gate, less useful as UI pilot |
| `mayaobongro.vn` | `mayaobongro-frontend` | 3005 | `pnpm build` | `pnpm typecheck` | Larger migrated app; uses component folder and sitemap/robots |
| `mayaochaybo.vn` | `mayaochaybo-frontend` | 3011 | `pnpm build` | `pnpm typecheck` | Larger migrated app; richer legacy routes, blog, audience landing pages |

Current local workspace state before migration:

- Multiple tenant folders already have local `pnpm-workspace.yaml` files.
  Current contents are inconsistent:
  - `x24sport.vn`: `packages: []`, `allowBuilds.sharp: true`
  - `mayaocaulong.vn`: `packages: [.]`, `allowBuilds.sharp: true`
  - `mayaobongro.vn`: `allowBuilds.sharp` placeholder
  - `mayaochaybo.vn`: `allowBuilds.sharp` placeholder
  - `cms-api`: `packages: [.]`, `allowBuilds.esbuild: true`,
    `allowBuilds.sharp: true`
- There is no root `pnpm-workspace.yaml` yet.
- There is no root `package.json` yet.
- Every active Next.js tenant currently has its own `pnpm-lock.yaml`.
- Several apps duplicate analytics script injection, `ProductViewTracker`,
  `JsonLd`, canonical helpers, sitemap/robots helpers, CMS tenant fetchers, and
  price formatting.

## Target Workspace Shape

Phase 1 should keep current website folder names:

```text
x24sport_websites/
├── package.json
├── pnpm-workspace.yaml
├── packages/
│   ├── analytics/
│   ├── cms-client/
│   ├── ecommerce/
│   ├── seo/
│   ├── site-config/
│   └── ui/
├── cms-api/
├── x24sport.vn/
├── mayaocaulong.vn/
├── mayaopickleball.vn/
├── mayaobongchuyen.vn/
├── mayaobongro.vn/
└── mayaochaybo.vn/
```

An optional later `apps/` move requires a separate deployment-path change plan.
Do not combine that with initial shared package extraction.

## Shared Package Boundaries

### `@x24sport/site-config`

Owns typed configuration shapes and constants that describe tenant identity,
domain, contact channels, analytics IDs, public media origins, and route labels.

Allowed:

- tenant slug type and map
- public site URL
- sport/product vocabulary
- contact phone/Zalo shape
- analytics config shape
- sitemap/static route config shape

Not allowed:

- rendered site copy that belongs to one brand page
- visual tokens that would force all sites to look alike
- secrets

### `@x24sport/cms-client`

Owns Payload REST request helpers and normalization primitives.

Allowed:

- tenant-scoped request builder
- URLSearchParams helpers for Payload `where[...]`
- product/category/media/post normalization
- pagination result types
- defensive media URL helpers
- fetch error classification

Required safeguards:

- no default tenant that can silently point to the wrong site in production
- every collection query accepts an explicit tenant slug or a site config object
- tests or fixtures proving tenant query parameters are present
- no direct import of website-specific content fallback arrays

### `@x24sport/seo`

Owns deterministic metadata, canonical, robots, sitemap, and structured data
helpers.

Allowed:

- canonical URL builder
- page title and meta description utilities
- safe text truncation/excerpt helpers
- `BreadcrumbList`, `Product`, `Offer`, `OnlineStore`/`Organization` schema
  builders
- sitemap entry helpers
- robots route helper

Required safeguards:

- schema must only describe visible facts passed by the app
- no fabricated reviews, ratings, shipping, returns, stock, or price
- canonical builder must use the target site URL, never CMS origin

### `@x24sport/analytics`

Owns GA4 and Meta Pixel script injection helpers plus event payload builders.

Allowed:

- GA4 measurement ID validation
- Meta Pixel ID validation
- shared `AnalyticsScripts` component
- ecommerce `view_item` payload builder
- duplicate-send guard logic for client trackers

Required safeguards:

- scripts render only when IDs are configured and valid
- event item IDs include tenant scope
- no duplicated page view or product view events after migration

### `@x24sport/ecommerce`

Owns low-level ecommerce formatting and contracts.

Allowed:

- price formatter
- compare-at/sale price state calculation
- breadcrumb item type
- product image selection helpers
- product availability mapping for visible/schema sync
- catalog pagination and filter URL primitives

Not allowed:

- site-specific product card markup
- site-specific category landing copy

### `@x24sport/ui`

Keep this deliberately thin.

Allowed:

- `PriceRow`
- `ImagePreviewModal`
- `ProductViewTracker` if implemented as UI/client boundary rather than pure
  analytics package
- tiny accessible primitives used by multiple sites, such as modal focus
  behavior, pagination primitive, or compact dropdown primitive

Not allowed:

- header
- footer
- product card visual layout
- homepage sections
- hero components
- landing page sections
- brand palette or global visual theme

## Pilot Order

1. `mayaopickleball.vn` and `mayaocaulong.vn` as the first shared extraction
   pair because their structures and business model are very similar.
2. `mayaobongro.vn` after the first pair because it has richer pages but similar
   migrated-product mechanics.
3. `mayaochaybo.vn` after the package contracts settle because it has more
   legacy route and content surfaces.
4. `x24sport.vn` after sport-specific tenant packages are stable because it is
   broader and has more cross-sport routing.
5. `mayaobongchuyen.vn` can be used as a light build smoke test, but its small
   surface makes it a weaker pilot for UI and catalog contracts.

## Phase Checklist

### Phase 0: Baseline Audit

Complete this before adding the root workspace or shared packages.

For every site:

- [ ] Record current git SHA.
- [ ] Record `package.json` scripts and dependency versions.
- [ ] Run existing local typecheck if present.
- [ ] Run production build.
- [ ] Start the app locally on its documented port or a free alternate port.
- [ ] Capture mobile screenshots at `390x844` for home, catalog, and one product.
- [ ] Capture desktop screenshots at `1440x900` for home, catalog, and one
      product.
- [ ] Save representative rendered HTML for home, catalog, product, sitemap,
      and robots.
- [ ] Run page audit script on representative local or public URLs.
- [ ] Record browser console errors for representative pages.
- [ ] Record sitemap URL count and sample entries.
- [ ] Record robots output.
- [ ] Record analytics scripts detected in rendered layout.
- [ ] Record one product data sample: slug, name, price, compare-at price,
      category, main image URL, stock state, canonical path.
- [ ] Record one category data sample: slug, name, product count, canonical path.
- [ ] Record whether cache or services were touched. Baseline should not touch
      production caches or services.

Baseline evidence directory:

```text
operations/monorepo-baseline/<YYYYMMDD>/<site>/
```

Suggested files per site:

```text
inventory.json
home-390.png
home-1440.png
catalog-390.png
catalog-1440.png
product-390.png
product-1440.png
home.html
catalog.html
product.html
sitemap.xml
robots.txt
audit-home.txt
audit-catalog.txt
audit-product.txt
console.txt
data-samples.json
```

Do not commit screenshots or large HTML captures unless the user explicitly
requests it. Keep generated audit evidence local or under ignored operations
output if configured.

### Phase 1: Root Workspace With No Behavior Change

- [ ] Add root `package.json` with package manager metadata and workspace
      scripts.
- [ ] Add root `pnpm-workspace.yaml` that includes current frontend folders,
      `cms-api`, and `packages/*`.
- [ ] Decide whether to keep or remove nested `pnpm-workspace.yaml` files.
      Prefer removing nested workspace files only after confirming pnpm behavior
      from root and from each site folder.
- [ ] Decide lockfile policy before running install:
      - preferred end state: one root `pnpm-lock.yaml`;
      - temporary acceptable state: root workspace plus existing per-site
        lockfiles during a no-behavior-change transition;
      - do not mix both policies accidentally in one commit.
- [ ] If adopting one root lockfile, commit only workspace metadata and lockfile
      changes in Phase 1; do not include shared package extraction in the same
      commit.
- [ ] Run `pnpm install` from root.
- [ ] Run build/typecheck for all sites from root filters.
- [ ] Verify production deploy runbook remains valid for each site folder.
- [ ] Commit Phase 1 alone.

Acceptance criteria:

- [ ] No source imports changed.
- [ ] Lockfile behavior understood and documented.
- [ ] Every existing site build still passes.
- [ ] Running commands from an individual site folder still works or the new
      root command equivalent is documented before any deployment.

### Phase 1.5: Baseline Helper Automation

Create helper scripts only after Phase 0 has defined evidence expectations.
The scripts should reduce manual drift, not replace human review.

- [ ] Add an ignored evidence output path, such as
      `operations/monorepo-baseline/`, if not already ignored.
- [ ] Add a script that records per-site package metadata, route inventory,
      sitemap/robots output, and representative data samples.
- [ ] Add a browser audit script that captures mobile and desktop screenshots
      for configured URLs.
- [ ] Add computed-style checks for the shared product typography and catalog
      density contracts.
- [ ] Keep scripts tenant-config driven so a new site can be added without
      copying code.

Current baseline helper:

```bash
node operations/scripts/monorepo-baseline.mjs --site mayaopickleball.vn --screenshots
node operations/scripts/monorepo-baseline.mjs --site mayaopickleball.vn --browser-checks
node operations/scripts/monorepo-baseline.mjs --site mayaopickleball.vn --build --typecheck
node operations/scripts/monorepo-baseline.mjs --all
```

The helper writes ignored evidence under:

```text
operations/monorepo-baseline/<YYYYMMDD-HHMMSS>/<site>/
```

It currently records package inventory, route inventory, command results, HTML,
robots, sitemap, page-audit output, sitemap URL samples, representative detail
URL discovery, analytics-script detection, optional Chrome headless screenshots,
and optional Chrome computed-style/layout checks at `390x844` and `1440x900`.
For build/typecheck evidence, it injects each site's tenant-safe
`PAYLOAD_API_URL=https://cms.x24sport.vn` and `TENANT_SLUG` so the baseline does
not depend on a local CMS process listening on `localhost:3001`.

Acceptance criteria:

- [ ] Running baseline helper for one pilot site creates deterministic evidence
      files without touching production state.
- [ ] Evidence paths are excluded from commits unless intentionally included.
- [ ] Helper failures are actionable and site-scoped.
- [ ] Computed-style checks cover product typography, catalog first-row
      position, filter toolbar height, horizontal overflow, and price row
      wrapping where matching page elements exist.

### Phase 2: Low-Risk Shared Utilities

Start with code that has deterministic input/output and low visual blast radius.

- [ ] Create `@x24sport/ecommerce` with price formatting and price state helpers.
- [ ] Create `@x24sport/seo` with text, canonical, breadcrumb schema, and JSON-LD
      serialization helpers.
- [ ] Create `@x24sport/analytics` with ID validators and event payload builders.
- [ ] Add unit tests or executable fixtures for these packages.
- [ ] Convert `mayaopickleball.vn` and `mayaocaulong.vn` first.
- [ ] Run before/after HTML and screenshot comparison for converted pages.
- [ ] Confirm no analytics event duplication.
- [ ] Commit Phase 2 in small package/site pairs.

Acceptance criteria:

- [ ] Rendered prices remain visually equivalent and obey product typography
      contract.
- [ ] Canonical, title, meta description, robots, sitemap, and JSON-LD are
      unchanged unless explicitly intended.
- [ ] Product view event payload is equivalent and tenant-scoped.

### Phase 3: CMS Client Extraction

- [ ] Create `@x24sport/cms-client`.
- [ ] Define tenant slug type and request contract.
- [ ] Port only fetch helpers that are shared by at least two sites.
- [ ] Keep site-specific fallback content local to each site.
- [ ] Add tests or fixtures proving Payload URLs include tenant filters.
- [ ] Convert one pilot site.
- [ ] Compare product/category sample data before and after.
- [ ] Convert remaining sites one at a time.

Acceptance criteria:

- [ ] No query can omit tenant scope accidentally.
- [ ] Product/category counts and sample fields match baseline.
- [ ] Build output does not bundle server-only secrets into client chunks.

### Phase 4: Thin Shared UI

- [ ] Add `@x24sport/ui` only after package boundaries are stable.
- [ ] Start with `PriceRow`.
- [ ] Add `ImagePreviewModal` only if at least two sites need the same modal
      behavior.
- [ ] Add accessible primitives only when they are truly behavior primitives.
- [ ] Keep site-specific product cards rendering local and pass shared primitives
      as children or small subcomponents.

Acceptance criteria:

- [ ] Product cards remain visually site-specific.
- [ ] Header/footer remain site-specific.
- [ ] Product detail and list price contracts pass computed-style checks.
- [ ] Modal focus trap, Escape close, backdrop close policy, and accessible name
      are verified.

### Phase 5: Full Cross-Site Audit

For every converted site, repeat Phase 0 checks and compare results:

- [ ] Build and typecheck pass.
- [ ] Home, catalog, product, and static pages render expected content.
- [ ] Public URL paths are unchanged.
- [ ] Sitemap URL count does not drop unexpectedly.
- [ ] Robots output remains intentional.
- [ ] Canonicals remain self-referencing for indexable pages.
- [ ] Paginated pages keep distinct canonicals.
- [ ] Filter/sort pages keep intended `noindex` or canonical behavior.
- [ ] Product JSON-LD matches visible product facts.
- [ ] Breadcrumb JSON-LD matches visible/crawlable path.
- [ ] OnlineStore/Organization schema appears only where intended.
- [ ] Product data samples match baseline.
- [ ] Category data samples match baseline.
- [ ] GA4 and Meta Pixel scripts render only when configured.
- [ ] Product view events fire once.
- [ ] Browser console has no new errors.
- [ ] No document-level horizontal overflow.
- [ ] Mobile and desktop screenshots show no broken layout or overlap.
- [ ] Product `h1` and product-list name computed font sizes match the shared
      product typography contract.
- [ ] Product rows appear in the initial viewport on catalog pages at `390x844`
      and `1440x900`.

### Phase 6: Production Rollout

Roll out one site at a time.

For each site:

- [ ] Confirm task-scoped commit exists.
- [ ] Run local build/typecheck immediately before deployment.
- [ ] Run rsync dry-run using the production runbook filter.
- [ ] Review every deletion in dry-run output.
- [ ] Deploy only that frontend using its documented runtime command.
- [ ] Verify origin HTTP.
- [ ] Verify public HTTPS.
- [ ] Verify container status and recent logs.
- [ ] Run representative post-deploy page audit.
- [ ] Capture at least one mobile and one desktop post-deploy screenshot.
- [ ] Record cache/services touched, if any.

Do not continue to the next site if the current site has unresolved regression.

## Per-Site Audit Matrix

Use this matrix for both baseline and post-migration evidence.

| Site | Home | Catalog | Product | Static/landing | Sitemap | Robots | Analytics | Data parity | Visual parity | Build |
|---|---|---|---|---|---|---|---|---|---|---|
| `x24sport.vn` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| `mayaocaulong.vn` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| `mayaopickleball.vn` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| `mayaobongchuyen.vn` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| `mayaobongro.vn` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| `mayaochaybo.vn` | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |

## Verification Commands

Run from root after Phase 1:

```bash
pnpm --filter x24sport-frontend typecheck
pnpm --filter x24sport-frontend build
pnpm --filter mayaocaulong-frontend build
pnpm --filter mayaopickleball-frontend build
pnpm --filter mayaobongchuyen-frontend build
pnpm --filter mayaobongro-frontend typecheck
pnpm --filter mayaobongro-frontend build
pnpm --filter mayaochaybo-frontend typecheck
pnpm --filter mayaochaybo-frontend build
```

Add `typecheck` scripts to sites that do not currently expose one before relying
on root-level type gates.

Representative page audit:

```bash
python3 .codex/skills/develop-x24sport-websites/scripts/audit_page.py https://example.vn/
python3 .codex/skills/develop-x24sport-websites/scripts/audit_page.py https://example.vn/san-pham/
python3 .codex/skills/develop-x24sport-websites/scripts/audit_page.py https://example.vn/<representative-product-path>
```

Computed style checks should verify:

- product detail `h1` is immediately below breadcrumb in DOM and visual order
- product detail `h1` font size is `20px` below desktop breakpoint
- product detail `h1` font size is `22px` at and above desktop breakpoint
- product-list product names compute to `18px`
- original and discounted prices stay on one row
- discounted price computes exactly `2px` larger than original price
- closed filter toolbar is one visual row with `40px` controls

## Regression Rules

Stop and fix before continuing if any of these happen:

- build/typecheck fails
- a production URL changes without explicit intent
- sitemap loses canonical product/category URLs unexpectedly
- robots/canonical output blocks an intended indexable page
- Product JSON-LD contradicts visible price, stock, image, or product name
- Payload data from one tenant appears on another site
- GA4 or Meta Pixel fires duplicate product/page events
- catalog first product row drops below initial viewport at required sizes
- product typography contract fails
- header/footer/product card visual identity is replaced by shared generic UI
- deployment dry-run would delete production-only files or secrets

## Reporting Template

For every phase or site handoff, report:

- target site or package
- completed scope
- changed files
- commands run and exact pass/fail result
- screenshots or evidence paths, if captured
- data parity result
- SEO/schema parity result
- analytics parity result
- cache/services touched
- remaining risk or blocked item
