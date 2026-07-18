# mayaobongro.vn Migration Plan

## Objective

Replace the public WordPress runtime for `mayaobongro.vn` with a Next.js tenant
frontend backed by the shared Payload `cms-api`, preserving public URLs, product
slugs, content fidelity, business flows, and a rapid proxy-level rollback.

The security objective is to remove public dependency on WordPress/PHP after a
successful retention period. The new Next.js/Payload system still requires normal
application, tenant, secret, dependency, backup, and monitoring controls.

## Verified baseline — July 16, 2026

- Production homepage responds `200` through Cloudflare and exposes a WordPress
  REST link; the current origin runtime reports PHP 8.2.
- The public sitemap contains 713 unique URLs: 665 product-priority URLs, 47
  content-priority URLs, and the homepage.
- WordPress REST reports 665 published product records and 89 page records.
- Product URLs are root-level, for example
  `/bo-quan-ao-bong-ro-...-x24-br-302/`; they are not under `/san-pham/`.
- Target platform is the shared Payload 3 `cms-api` on `10.10.0.28`, with tenant
  media on R2 and existing tenant frontends on the same host.
- The existing generic migration code is not a production-safe source of truth;
  schema and importer gaps are listed in `data-contract.md`.

These are discovery counts, not final acceptance counts. The database, all REST
statuses, redirects, logs, and Search Console may reveal additional URLs/content.

## Architecture decision

Use a tenant-scoped route registry as the single URL authority:

```text
Cloudflare / public proxy
          |
          v
mayaobongro Next.js frontend (new verified port)
          |
          +--> cms-api, filtered by tenant=mayaobongro
          +--> legacy route resolver: exact path -> content/redirect/gone
          +--> R2 media, with exact legacy-media mapping
```

Static operational paths win before dynamic routes. Root-level product paths are
resolved directly from `legacyPath`. Do not redesign catalog URLs during this
replatform. Choose the frontend port only after checking the live port registry;
do not assume `3004` is free from this plan.

## Delivery phases

### Phase A — Read-only discovery and recovery proof

1. Export and verify WordPress database/files, proxy config, Cloudflare behavior,
   current redirects, sitemap, robots, and source media inventory.
2. Build URL and content manifests from DB, REST/Woo APIs, sitemap, internal link
   crawl, access logs, and Search Console exports.
3. Map checkout/cart/contact/search/forms and any integration that writes to
   WordPress. Decide replacement or deliberate retirement per flow.
4. Test restoring the WordPress backup in an isolated environment.

Exit gate: complete reviewed dispositions, no unresolved high-traffic routes, and
a proven source rollback.

### Phase B — Shared CMS schema and isolation

1. Add tenant-scoped source identity, legacy routes, migration runs, redirects,
   SEO, publication state, taxonomies, product variations/attributes/stock, media
   provenance, and original timestamps.
2. Replace global slug assumptions with tenant-scoped constraints/resolution.
3. Create the `mayaobongro` tenant and domain mapping through a recorded migration.
4. Add integration tests for cross-tenant read/write, route, SKU, slug, category,
   media, and cache isolation.

Exit gate: reversible database migration and zero cross-tenant leakage/collision.

### Phase C — Versioned migration pipeline

1. Implement snapshot, normalize, validate, dry-run, import, delta, reconcile, and
   rollback commands; store no secrets in arguments that may enter shell history.
2. Preserve product slugs exactly and import full `legacyPath` independently.
3. Convert content with a parser that preserves supported structure; quarantine
   unsupported shortcodes/blocks.
4. Copy and checksum media to tenant-scoped storage while retaining exact legacy
   URL resolution.
5. Pilot representative simple/variable products, deep content, taxonomies,
   pages/posts, large galleries, missing fields, Unicode, and redirects.

Exit gate: two pilot imports are idempotent and source/target fields reconcile.

### Phase D — Next.js tenant frontend

1. Build the site in the existing `mayaobongro.vn` workspace without deleting its
   operational history; share proven platform components where appropriate.
2. Implement exact root product routes plus the complete route manifest, complete
   catalog pagination, real filters, content pages, posts, menus, search, forms,
   404/410 behavior, and tenant settings.
3. Generate metadata, self-canonical, sitemap, robots, breadcrumbs and valid
   Product/Organization/Breadcrumb schema from factual CMS data.
4. Remove production demo fallbacks and fabricated rating, sales, stock,
   countdown, location, or guarantee claims.
5. Meet the applicable quality gates in `develop-x24sport-websites`.

Exit gate: build/type/lint, accessibility, responsive, structured-data, business
flow, pagination, and tenant tests pass.

### Phase E — Full staging reconciliation

1. Run full import and delta import on isolated staging; protect it from public
   indexing and authentication leakage.
2. Verify every URL manifest row against the staging origin with the production
   Host header and `verify_url_contract.py`.
3. Crawl source and target; compare status, canonical, robots, headings, links,
   product identity/price/stock, media, schema, and forms.
4. Load-test representative cached/uncached routes and confirm the shared CMS and
   sibling tenants remain healthy.

Exit gate: all go/no-go thresholds below pass and rollback rehearsal succeeds.

### Phase F — Cutover

1. Announce/freeze source writes or start the approved final delta window.
2. Take fresh source, target database, frontend, and proxy backups.
3. Run final delta and reconciliation; record the exact migration run.
4. Switch only the proxy/upstream route for `mayaobongro.vn`; keep host, HTTPS,
   paths, and canonical unchanged. Purge only its documented cache scope.
5. Run public edge smoke tests and the critical URL/business-flow subset.
6. Roll back the upstream immediately if a stop condition occurs.

Exit gate: public edge checks pass, no broad 404/5xx/canonical regression, and
orders/leads or approved replacement flows work.

### Phase G — Monitor and retire WordPress

1. Monitor continuously during cutover, then review at 24 hours, 72 hours, one
   week, and the agreed retention endpoint.
2. Track 404/410/5xx, redirects, crawl/indexing, Core Web Vitals, media errors,
   CMS latency/errors, tenant leakage, and business events.
3. Keep WordPress private, patched enough for retention, backed up, and excluded
   from public search. Do not expose `wp-admin`, `wp-login.php`, or the old origin.
4. Retire it only after explicit approval, zero required rollback traffic, and a
   successful final archive/restore test.

## Go/no-go thresholds

- 100% of published source products retain exact slug and full path.
- 100% of manifest URLs have a reviewed disposition and automated result.
- 100% of direct URLs return expected `200` with the expected canonical.
- Zero unintended redirects, redirect chains, loops, soft 404s, cross-tenant
  resolutions, or launch-time `noindex` on indexable pages.
- Source/target counts reconcile by type and status; every mismatch is approved.
- Critical product fields, taxonomy relations, media checksums, SEO fields, and
  timestamps reconcile or have documented exceptions.
- Complete catalog is reachable through crawlable links and paginated APIs.
- Product schema uses factual price/availability and passes validation.
- Production build and critical browser flows pass on mobile and desktop.
- Backups and both traffic/data rollback procedures are successfully rehearsed.

## Immediate stop and rollback conditions

- widespread 404/5xx or broken root-level product routes;
- wrong tenant data, cache, media, settings, or credentials exposed;
- price/stock/product identity corruption or missing catalog pages;
- orders/leads/forms lost or sent to the wrong destination;
- robots/canonical/sitemap points at staging, another tenant, or the wrong paths;
- shared `cms-api`, database, proxy, or sibling tenant health degrades materially.

Rollback means restore the previous proxy upstream and its cache behavior first,
then investigate offline. Keep migration-run identifiers so target records can be
reverted without guessing.
