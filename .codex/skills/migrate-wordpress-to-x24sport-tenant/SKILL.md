---
name: migrate-wordpress-to-x24sport-tenant
description: Plan and execute a mayao WordPress migration to the shared Next.js and Payload cms-api platform. Use for URL-preserving replatforms, tenant onboarding, WordPress data extraction, Payload schema preparation, catalog migration, staging, proxy cutover, reconciliation, or rollback. Especially use when product slugs, legacy paths, media URLs, SEO signals, or zero-downtime cutover must be preserved.
---

# Migrate WordPress to X24Sport Tenant

Migrate one WordPress website into a distinct `cms-api` tenant and a production
Next.js frontend without silently changing its public URL or content contract.
Treat migration as a reversible data and routing program, not a bulk copy script.

## Resolve scope first

1. Read root `AGENTS.md`, the source domain's `AGENTS.md`, and `cms-api/AGENTS.md`.
2. Load `develop-x24sport-websites` when the public frontend is in scope.
3. Read [references/url-preservation.md](references/url-preservation.md) for any
   route, slug, canonical, sitemap, redirect, or cutover work.
4. Read [references/data-contract.md](references/data-contract.md) for schema,
   extractor, importer, media, or reconciliation work.
5. For `mayaobongro.vn`, read
   [references/mayaobongro-plan.md](references/mayaobongro-plan.md).
6. For `mayaochaybo.vn`, read
   [references/mayaochaybo-plan.md](references/mayaochaybo-plan.md).
7. For `mayaobongda.vn`, read
   [references/mayaobongda-plan.md](references/mayaobongda-plan.md).

Do not treat `WORDPRESS-TO-NEXTJS-MIGRATION-GUIDE.md` as an executable runbook.
It is historical design material; this skill's direct-URL and gate requirements
control where the documents differ.

## Non-negotiable guarantees

- Preserve every accepted public URL path byte-for-byte when technically
  possible. Preserve product `slug` and full legacy `path` as separate fields.
- An unchanged URL returns the final page with `200`; it must not redirect to a
  newly preferred Next.js path.
- Use a one-hop permanent `301` or `308` only for an intentional, reviewed URL
  change. Never redirect many old URLs to the homepage or a broad category.
- Scope slugs, source IDs, SKUs, categories, routes, and importer lookups by
  tenant. Never rely on global identity for tenant content.
- Keep WordPress read-only and rollback-ready until post-cutover monitoring is
  complete. Do not expose an old admin or origin through a public fallback.
- Imports must be idempotent, resumable, attributable to a migration run, and
  reconcilable by counts and checksums.
- Never place WordPress, Payload, database, Cloudflare, or R2 secrets in source,
  manifests, logs, command output, fixtures, or handoff text.
- Do not invent ratings, sales counts, stock, testimonials, prices, guarantees,
  or business claims when the source does not contain them.
- Migration reduces the public WordPress/PHP attack surface; it does not make the
  new stack secure automatically. Apply least privilege, tenant isolation,
  backups, rate limits, dependency maintenance, and observability.

## Workflow and mandatory gates

### 0. Baseline and freeze

- Confirm source domain, source environment, target tenant, target host, public
  proxy/CDN, order/lead integrations, and allowed maintenance window.
- Back up the exact WordPress files, database, web/proxy configuration, and
  current Payload database state before mutation.
- Record source versions, counts, headers, robots, sitemap, canonical behavior,
  redirects, cache behavior, and representative desktop/mobile screenshots.
- Define a content-freeze or delta-sync policy before the first import.

Gate: backups are restorable, sources are identified, and no credential appears
in an artifact.

### 1. Build the source-of-truth manifests

- Inventory URLs from WordPress database/API, every sitemap, navigation and body
  links, redirects, access logs, and Search Console exports when available.
- Classify each URL by content type, source ID, slug, current status, canonical,
  indexability, last modified date, traffic importance, and intended target.
- Inventory products, variations, taxonomy terms, pages, posts, media, menus,
  settings, forms, redirects, and SEO metadata separately.
- Detect duplicate paths, reserved-path collisions, orphan URLs, attachment URLs,
  encoded characters, pagination, feeds, search, and meaningful query parameters.

Gate: every discovered URL has exactly one reviewed disposition: direct `200`,
intentional one-hop redirect, `410`, or intentionally retained non-indexable URL.

### 2. Make `cms-api` migration-ready

- Add tenant-scoped route identity and source identity before importing content.
- Resolve global uniqueness conflicts for product/category slugs and all importer
  lookups. Add database-enforced tenant isolation where feasible.
- Model publication state, SEO, taxonomy, variations/attributes, stock, price,
  media provenance, original timestamps, redirect records, and migration runs.
- Test that one tenant cannot read, mutate, collide with, or resolve another
  tenant's records.

Gate: schema migrations are reversible; tenant collision and isolation tests pass.

### 3. Implement the extractor and importer

- Extract immutable raw source snapshots first, then transform into versioned
  normalized records. Retain source IDs and checksums.
- Use upserts keyed by `(tenant, sourceSystem, sourceId)`, not display names or a
  globally searched SKU.
- Convert WordPress HTML losslessly enough for headings, links, lists, tables,
  embeds, shortcodes, captions, and inline media. Quarantine unsupported blocks
  for review instead of dropping them.
- Copy media with an exact source-to-target manifest, checksums, alt text,
  dimensions, MIME type, and retry state. Preserve old media URLs directly or map
  each one explicitly.
- Support dry-run, bounded concurrency, retry/backoff, checkpoints, delta sync,
  per-record errors, and rollback by migration run.

Gate: a representative pilot imports twice without duplicates or drift.

### 4. Build the Next.js tenant frontend

- Resolve routes from the tenant URL manifest; static reserved routes take
  precedence over dynamic legacy routes.
- Render products at their existing full paths, including root-level product
  slugs when that is the WordPress contract.
- Use real CMS data with explicit empty/error behavior. Disable demo fallback
  content in production.
- Implement canonical URLs, metadata, crawlable links, structured data, robots,
  sitemap partitions, image behavior, accessibility, and responsive templates.
- Paginate complete catalogs; do not hide records behind a fixed API limit.

Gate: production build, type checks, accessibility checks, structured-data checks,
tenant isolation tests, and representative browser journeys pass.

### 5. Reconcile and validate staging

- Run full import and a final delta import against staging.
- Reconcile source and target counts per content type and status; compare critical
  field checksums, relations, media, prices, stock, and timestamps.
- Run `scripts/verify_url_contract.py` against the staging origin with the public
  host header. Verify every manifest row, not a sample.
- Compare source and target HTML semantics, canonical, robots, internal links,
  structured data, images, forms, ordering/contact flows, and 404 behavior.

Gate: all go/no-go criteria in the site plan pass with recorded evidence.

### 6. Cut over and roll back safely

- Freeze writes or run the approved final delta; back up both sides again.
- Change only the narrowest routing layer required. For a same-domain move,
  preserve host, scheme, paths, and canonical host.
- Purge only documented cache zones and verify public plus origin responses.
- Keep the WordPress origin private and intact for rollback. Remove public access
  to its login/admin/API unless an explicitly approved integration still needs it.
- Roll back traffic immediately on gate failure; do not attempt live repair while
  users receive corrupt routes or data.

Gate: homepage, product, taxonomy, content, media, robots, sitemap, forms, and
critical business flows pass from the public edge.

### 7. Monitor and retire

- Monitor 404/410/5xx, redirect chains, origin/CDN logs, Search Console, crawl and
  indexing signals, business events, and Core Web Vitals after launch.
- Reconcile a post-launch delta and investigate every high-value URL regression.
- Retire WordPress only after the agreed retention window, stable traffic, tested
  backups, and explicit approval. Archive its URL and media manifests permanently.

## Required handoff

Report source and target, phase reached, backups, schema changes, import run IDs,
record counts, URL-contract results, build/browser results, cache/services touched,
cutover or rollback action, remaining exceptions, and secret-free evidence.
