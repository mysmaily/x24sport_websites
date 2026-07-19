# mayaobongda.vn Migration Plan

## Contents

1. Objective and acceptance boundary
2. Verified baseline and unresolved infrastructure checks
3. Architecture and server decision
4. Data, media, URL, and integration contracts
5. Delivery phases
6. Go/no-go thresholds
7. Stop and rollback conditions

## 1. Objective and acceptance boundary

Migrate `mayaobongda.vn` from WordPress/WooCommerce to a new, isolated
`mayaobongda` tenant in the shared Payload `cms-api`, served by a full
request-time SSR Next.js frontend. Publish and reconcile the application first
at `next.mayaobongda.vn`; keep production WordPress unchanged until every
content, URL, media, business-flow, backup, and rollback gate passes.

Copy all products, required posts/pages, taxonomies, navigation, factual SEO
metadata, and referenced media into tenant-scoped structures. Preserve source
IDs, original timestamps, publication states, relationships, and accepted
legacy paths. Expose publicly only records whose source status and reviewed URL
disposition permit indexing.

Do not migrate customer accounts, orders, leads, form submissions, payment data,
sessions, or authentication secrets under “copy all products and posts.” Those
records require separate authorization, retention policy, encryption review,
and a defined replacement transaction flow.

Success means the platform changes without breaking accepted host/path/query
behavior, factual product identity, media, crawlability, paid landing pages,
phone/Zalo actions, or approved conversion events. A successful build or bulk
import alone is not a successful migration.

## 2. Verified baseline and unresolved infrastructure checks — July 19, 2026

### Public baseline verified from the live edge

- Production is WordPress/WooCommerce behind Cloudflare and the site-specific
  proxy. The homepage returns `200`, PHP `8.2.30`, `X-FastCGI-Cache: MISS`, and
  Cloudflare `DYNAMIC` in the measured response.
- Public WordPress REST reports 250 published products, 2 posts, 78 pages, 379
  media records, 9 product categories, 38 product tags, and 6 post categories.
- Yoast sitemaps expose 251 product entries including `/shop/`, 3 post entries,
  77 page entries, 1 post-category entry, 2 product-category entries, 37
  product-tag entries, and 1 author entry.
- Public REST and sitemap counts cover only public discovery. Authenticated,
  immutable source snapshots remain authoritative for all statuses, variations,
  attachments, relationships, redirects, and unsupported content.
- Products use root-level paths such as
  `/ao-bong-da-thiet-ke-vintage-mabd-62/`. Indexable product categories are also
  root-level (`/ao-khong-logo/`, `/ao-thiet-ke/`), while product tags use
  `/tu-khoa/<slug>/`.
- Media is referenced through both `https://cdn.mayaobongda.vn/wp-content/...`
  and `https://mayaobongda.vn/wp-content/...`. Both accepted URL families require
  an exact source-to-R2 mapping or direct compatibility route.
- The page sitemap includes many Flatsome demo, test, account, checkout, and
  system URLs. Do not migrate or index them indiscriminately; classify each URL
  as required content, retained-noindex, redirect, `404`, or reviewed `410`.
- Rendered homepage HTML contains the verified phone/Zalo destinations but no
  detected `GTM-*` or `AW-*` ID. Absence from one HTML response does not prove
  analytics or Ads are unused; inspect WordPress options/plugins, Cloudflare,
  tag-manager configuration, active campaign URLs, and browser network events.
- One rendered WooCommerce search form points to `phuchaidang.com.vn`. Treat it
  as a source defect requiring explicit correction or retirement; never copy the
  cross-domain action into the new frontend by default.
- `next.mayaobongda.vn` had no public A, AAAA, or CNAME answer during this
  baseline. `cdn.mayaobongda.vn` resolves through Cloudflare.

### Operational inventory from the site profile

- WordPress application: `root@10.10.0.58`,
  `/root/websites/sites/mayaobongda.vn`, upstream `10.10.0.58:80`.
- Public proxy: `root@10.10.0.56`, config
  `/etc/nginx/conf.d/mayaobongda.vn.conf`.
- Shared database host: `10.10.0.52`; shared CMS origin:
  `http://10.10.0.28:3001`.
- The site is not currently a Payload tenant and has no Next.js source in its
  website folder.

### Unresolved Phase 0 checks

Private SSH probes to `10.10.0.58`, `10.10.0.28`, and `10.10.0.56` were not
reachable from the planning session. Therefore disk/RAM, current Docker
inventory, CMS free space, source size, candidate path, port availability,
proxy contents, database size, and CMS latency are not verified by this plan.
Do not reserve or deploy port `3012` merely because it is proposed below.

## 3. Architecture and server decision

Use a site-local frontend container on `10.10.0.58` only if Phase 0 verifies
sufficient independent capacity and confirms that co-locating the preview does
not endanger the active WordPress runtime. The candidate topology is:

```text
Cloudflare
  -> proxy 10.10.0.56
     -> next.mayaobongda.vn: 10.10.0.58:3012 during preview
     -> mayaobongda.vn:      10.10.0.58:80 until cutover

Next.js SSR frontend 10.10.0.58:3012 (candidate)
  -> Payload API 10.10.0.28:3001, tenant=mayaobongda
  -> R2/static.x24sport.vn, tenant prefix=mayaobongda
```

Candidate deployment values are `/root/websites/next.mayaobongda.vn`, service
`web`, container `next-mayaobongda`, and host/container port `3012`. Recheck all
of them immediately before mutation. Require a healthcheck,
`restart: unless-stopped`, bounded logs/resources, and no frontend access to
WordPress, database, Payload admin, Cloudflare, or R2 credentials.

If the host lacks a documented safety margin after accounting for WordPress,
Docker build layers, logs, snapshots, and expected media traffic, stop and obtain
an approved frontend host. Do not free space by deleting the only WordPress or
CMS rollback artifacts.

### Full SSR contract

- Use Next.js 16 App Router and Server Components by default.
- Render every CMS-backed page at request time with `dynamic = 'force-dynamic'`
  and uncached/no-store tenant reads.
- Do not use static export, `generateStaticParams`, ISR, route `revalidate`, or
  demo/fallback production content.
- Return primary content, metadata, canonical, links, images, pagination, and
  factual structured data in initial HTML. Limit client components to real
  interaction islands.
- Keep preview HTML out of Cloudflare/Nginx caches. Cache only fingerprinted
  assets and immutable R2 media as reviewed.
- Make preview responses non-indexable at the proxy and keep their canonicals on
  `https://mayaobongda.vn`. Never include preview URLs in sitemaps.

Any later ISR, static rendering, or HTML microcache requires explicit approval
and fresh URL, freshness, Ads, and SEO validation.

## 4. Data, media, URL, and integration contracts

### Immutable source snapshot

Create versioned snapshots outside the active WordPress filesystem. Export:

- every product and variation in all statuses, including SKU, prices/sale
  windows, stock/backorders, attributes/defaults, dimensions/weight, ordering,
  featured state, categories, tags, gallery order, and product type;
- posts and reviewed pages in all statuses, hierarchy, timestamps, excerpts,
  content, featured media, authorship policy, categories, and tags;
- terms, menus, blocks/widgets, shortcodes, redirects, relevant options, and
  WooCommerce display/search behavior;
- every attachment and inline asset with source ID, all accepted URLs, checksum,
  MIME, byte size, dimensions, alt, title, caption, parent, and gallery position;
- Yoast title, description, canonical override, robots, Open Graph, and only
  factual schema inputs;
- active Ads landing URLs, query parameters, GTM/GA/Ads configuration, consent
  behavior, form/order success events, phone/Zalo clicks, and server integrations.

Exclude credentials and personal order/customer data. Encrypt and access-control
any separately authorized private-data snapshot.

### CMS readiness and tenant isolation

Create `mayaobongda` only after a restorable PostgreSQL backup, safe CMS disk
margin, and a tenant/domain collision check. Proposed domains are
`mayaobongda.vn` and `next.mayaobongda.vn`.

Audit the current post-`mayaochaybo` CMS schema and migrator instead of assuming
the older plan's schema gaps still exist. Reuse proven generic migration code,
but remove running-site copy, categories, routes, media prefixes, IDs, and
settings. Before import, prove support for:

- tenant-scoped source identity and exact `legacyPath` uniqueness;
- products/variations, stock, price, attributes, categories/tags, gallery order,
  publication state, SEO/social metadata, and migration-run attribution;
- page/post hierarchy, timestamps, taxonomies, featured media, unsupported-block
  quarantine, and reviewed indexability;
- media provenance, dual legacy URL families, checksum/dimensions/MIME, target
  R2 key, retry and verification state;
- direct, redirect, gone, and retained-noindex route dispositions;
- idempotent checkpoints, dry run, bounded retries/concurrency, delta sync,
  reconciliation, and rollback by migration run.

Use upserts keyed by `(tenant, sourceSystem, sourceType, sourceId)` and enforce
tenant-scoped path/identity constraints. A repeated pilot must create zero
duplicates and zero unexplained mutations.

### URL authority

Build the URL manifest from authenticated database/API snapshots, all sitemaps,
navigation/body links, redirects, access logs, active Ads final URLs, analytics
landing pages, and Search Console exports when available. Sitemaps alone are not
complete inventory.

The tenant-scoped exact `legacyPath` registry controls route resolution,
canonicals, internal links, breadcrumbs, schema, sitemap, and redirects. Static
operational routes take precedence over catch-all legacy resolution.

- Serve reproducible product, product-category, tag, post, page, pagination,
  media, feed, search, and meaningful-query URLs directly at the same paths.
- Preserve root product/category paths, `/tu-khoa/<slug>/`, trailing slash, case,
  and percent-encoding behavior after measuring accepted variants.
- Keep pagination crawlable with exact legacy `/page/N/` compatibility or one
  reviewed one-hop mapping to self-canonical query pagination.
- Preserve `utm_*`, `gclid`, `gbraid`, `wbraid`, and reviewed campaign parameters
  without creating duplicate canonical pages.
- Use one-hop `301`/`308` only for reviewed exceptions. Never broadly redirect
  missing content to the homepage or an unrelated category.
- Return real `404` or reviewed `410`; never soft-404 with `200`.
- Fail dry run/import/build on path collisions across all content types,
  redirects, reserved routes, and media compatibility paths.

### Media and R2 contract

- Upload into an isolated `mayaobongda` R2 prefix and never reuse another
  tenant's numeric media IDs or target keys.
- Store one exact manifest row per source URL/path and content checksum. Verify
  target byte count/MIME/checksum before marking the row complete.
- Rewrite CMS HTML to R2 only through verified mappings. Preserve every accepted
  `cdn.mayaobongda.vn/wp-content/uploads/...` and
  `mayaobongda.vn/wp-content/uploads/...` URL via direct compatibility route or
  an exact one-hop redirect.
- Quarantine missing, malformed, external, placeholder, and cross-domain assets
  for review rather than silently substituting unrelated media.

### Business and Ads continuity

Before preview approval, compare every active landing URL and conversion journey
between source and target. Verify source tags/options and browser network events
without storing tag values as secrets. Prove that each intended event fires once
with its expected consent state. Correct or intentionally retire the verified
cross-domain search action; do not reproduce it accidentally.

## 5. Delivery phases

### Phase 0 — Capacity, identity, and recovery gates

1. Restore private connectivity and verify actual source/proxy/CMS configs,
   Docker labels/mounts, disk/RAM, source size, database size, CMS latency, and
   Cloudflare records without printing secrets.
2. Confirm `3012` and `/root/websites/next.mayaobongda.vn` are unused; reserve
   them only after capacity and conflict checks pass.
3. Back up and restore-test WordPress database/files, CMS/PostgreSQL, deployed
   CMS code/env, proxy config, DNS/rules, and candidate frontend paths.
4. Require enough free space for retained backups, Docker build layers, full
   import/media manifests, logs, and rollback. Stop if the safety margin is not
   documented.

Exit gate: verified tenant/domain/path/port identity, restorable backups, safe
capacity, and no secret in any artifact.

### Phase 1 — Discovery and immutable manifests

1. Take authenticated snapshots and build content, taxonomy, media, URL,
   redirect, integration, Ads, and conversion manifests.
2. Classify every sitemap demo/system/account/checkout URL and every discovered
   non-sitemap URL as direct, redirect, gone, or retained-noindex.
3. Define a content freeze or timestamped delta-sync boundary.

Exit gate: authoritative counts are known and every high-value URL/business flow
has a reviewed target behavior.

### Phase 2 — CMS schema and tenant isolation

1. Audit current schema/migrator capabilities and implement only missing,
   reversible changes.
2. Create the tenant/settings idempotently after backup and collision checks.
3. Test cross-tenant reads, writes, source IDs, slugs, paths, SKUs, taxonomies,
   media, settings, caches, and rollback against affected tenants.

Exit gate: schema/type generation/build and isolation tests pass; rollback is
rehearsed.

### Phase 3 — Extract, normalize, import, and reconcile

1. Extend the generic migrator with football configuration; do not fork an
   unreviewed hard-coded importer.
2. Run schema validation and collision-only dry run before writes.
3. Pilot representative simple/variable products, galleries, tags, root paths,
   shortcodes, demo/system pages, missing media, and Vietnamese paths twice.
4. Run full import, checksum/media verification, reconciliation, then delta sync.

Exit gate: source/target counts and critical checksums reconcile by type/status;
repeat import is idempotent and every exception is reviewed.

### Phase 4 — Build the SSR frontend

1. Create site-local Next.js source without deleting WordPress history. Reuse
   proven X24Sport components only after removing site-specific sport/copy/data.
2. Implement exact legacy routing, complete catalog/category/tag pagination,
   product/content templates, search, menus, media, `404`/`410`, canonical,
   robots, sitemap, breadcrumbs, and factual schema.
3. Follow the shared product typography and catalog-density/filtering contracts
   in the repository instructions.
4. Implement the approved contact/order flow and verified analytics/Ads events
   with accessible validation and real success/error states.
5. Run typecheck, configured tests, production build, page audit, structured
   data, responsive/accessibility, browser journeys, and log checks.

Exit gate: critical content is in initial HTML, catalogs are complete and
crawlable, no demo fallback exists, and source/target journeys match.

### Phase 5 — Deploy `next.mayaobongda.vn`

1. Recheck host/path/port/CMS/proxy/DNS facts immediately before mutation.
2. Back up the target path; deploy the site-local Compose service and pass its
   origin healthcheck.
3. Back up proxy config; add only the dedicated preview vhost; validate
   `nginx -t` and reload without restarting shared services.
4. Create proxied preview DNS from the approved Cloudflare secret source only
   after origin/proxy health passes.
5. Verify HTTPS, proxy-level noindex, production canonicals, no HTML cache,
   immutable assets, logs, CMS isolation, and sibling-site health.

Exit gate: preview is stable/non-indexable; apex remains WordPress; rollback
removes only preview routing/container/DNS.

### Phase 6 — Full URL and business reconciliation

1. Run final import plus delta and reconcile every source record.
2. Run `scripts/verify_url_contract.py` for every manifest row against staging
   with the production host header; crawl HTML and media separately.
3. Compare status/hops, canonical, robots, title/H1, identity, price/stock,
   taxonomies, links, schema, media, search, contact/order flows, mobile/desktop,
   console/logs, and Ads network behavior.
4. Rehearse traffic rollback and migration-run data rollback.

Exit gate: all thresholds below pass with secret-free evidence.

### Phase 7 — Production cutover and monitoring

1. Obtain explicit cutover approval and maintenance/delta window. Freeze writes
   or run final delta; take fresh source/target/proxy/DNS backups.
2. Switch only the `mayaobongda.vn` proxy upstream from WordPress to the verified
   Next.js origin. Preserve host, HTTPS, every path/query, and Ads final URLs.
3. Purge only this domain's documented cache scope and run public/origin checks.
4. Keep WordPress private and rollback-ready. If an operational archive hostname
   such as `wp.mayaobongda.vn` is explicitly approved, protect it with access
   controls; `noindex` alone is not security. Prevent archive URLs from entering
   canonicals, sitemaps, analytics, or search results.
5. Monitor continuously, then at 24 hours, 72 hours, one week, and the agreed
   retention endpoint: URL errors, crawl/indexing, Ads/conversions, leads/orders,
   CMS latency, media, CWV, logs, and cross-tenant health.

## 6. Go/no-go thresholds

- 100% of source products, variations, required posts/pages, taxonomies, and
  media reconcile by source type/ID/status; every mismatch has an approved
  disposition.
- 100% of published product/category/tag/post URLs retain exact accepted paths
  and expected canonicals unless individually reviewed.
- 100% of URL-manifest rows have automated status, redirect, canonical, and
  indexability results; zero unintended chains, loops, soft 404s, or launch-time
  `noindex`.
- Zero tenant leaks/collisions across records, routes, IDs, SKUs, media, settings,
  caches, users, and migration rollback.
- Complete catalogs/archives remain reachable through crawlable SSR pagination;
  no fixed API limit hides records.
- Product identity, prices, stock, variations, relations, visible content, SEO,
  timestamps, schema, and media checksums match or have reviewed exceptions.
- Every active Ads landing URL preserves intended path/query behavior and every
  critical conversion fires exactly once under expected consent behavior.
- Production build, healthcheck, responsive/accessibility checks, search,
  contact/order journeys, logs, public/origin checks, and sibling health pass.
- WordPress, CMS, proxy, DNS, and migration-run rollbacks are executable and
  restore-tested.

## 7. Stop and rollback conditions

Roll back traffic immediately for broad `404`/`5xx`, root-route failures,
redirect loops, wrong canonicals, sitemap/robots errors, staging URL exposure,
missing/wrong product data or media, broken search/contact/order behavior,
duplicated/lost Ads conversions, tenant leakage, disk exhaustion, unhealthy
containers, sustained CMS timeouts, or secrets in artifacts/logs.

Restore the previous proxy upstream and domain cache behavior first so users and
campaign traffic return to WordPress. Investigate offline, preserve the failed
migration run/evidence, and revert tenant data only through its recorded run or
database backup. Never attempt prolonged live repair while public or paid
traffic receives incorrect content.
