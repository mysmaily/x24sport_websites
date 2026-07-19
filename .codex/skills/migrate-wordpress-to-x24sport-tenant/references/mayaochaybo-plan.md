# mayaochaybo.vn Migration Plan

## Contents

1. Objective and acceptance boundary
2. Verified baseline
3. Architecture and server decision
4. Data and URL contracts
5. Delivery phases
6. Go/no-go thresholds
7. Stop and rollback conditions

## 1. Objective and acceptance boundary

Migrate `mayaochaybo.vn` from WordPress/WooCommerce to a distinct `mayaochaybo`
tenant in the shared Payload `cms-api`, backed by a full request-time SSR Next.js
frontend. First publish the new application at `next.mayaochaybo.vn`; keep the
production WordPress origin unchanged until all reconciliation and cutover gates
pass.

Copy all products, posts, required pages, taxonomies, navigation, SEO metadata,
and referenced media into tenant-scoped structures. Preserve drafts, private
records, original timestamps, and publication state in the CMS, but expose only
records whose source state and reviewed URL disposition permit public access.

Do not migrate customer accounts, orders, leads, form submissions, payment data,
or authentication secrets under the phrase “copy all products and posts.” These
contain private or transactional data and require a separate explicit scope,
retention policy, encryption review, and business-flow decision.

Success means the platform changes while the accepted public host/path/query
contract, visible factual content, landing-page behavior, and measured conversion
events remain equivalent. A successful build or bulk import alone is not a
successful migration.

## 2. Verified baseline — July 19, 2026

- Active production is WordPress on `10.10.0.26`, through proxy `10.10.0.56` and
  Cloudflare. The source host has only about 3.5 GB free and must not hold large
  migration snapshots or a second frontend runtime.
- Public REST reports 603 published products, 24 posts, 78 pages, 5 product
  categories, 6 post categories, 4 post tags, and 1,218 media records.
- Yoast sitemaps expose 604 product entries including `/shop/`, 25 post entries
  including `/blog/`, 18 page entries, 4 post-category entries, 5 product-category
  entries, and 9 color-attribute entries.
- Products use root-level URLs such as
  `/ao-chay-bo-singlet-lux-phoi-mau-gradient-noi-bat/`. Product categories such
  as `/ao-chay-bo-sat-nach/` are also root-level, while colors use
  `/mau-sac/<slug>/` and post categories use `/category/<slug>/`.
- Sitemap and public REST counts cover only public discovery. Final counts must
  come from an authenticated, immutable database/API snapshot and include every
  source status, variation, taxonomy relationship, attachment, and redirect.
- The shared CMS host `10.10.0.28` currently has a full root filesystem (100%).
  Do not import, rebuild, upload media, or apply schema migrations there until a
  backed-up capacity remediation leaves a documented safety margin.
- Candidate frontend host `10.10.0.58` has about 18 GB disk free and 4.3 GiB RAM
  available, already runs a health-checked Next.js Docker service, and reaches
  `http://10.10.0.28:3001` successfully in about 19 ms from the measured request.
- Port `3011` and `/root/websites/next.mayaochaybo.vn` were unused during the
  baseline check. Recheck both immediately before deployment.
- The root `.env` contains a Cloudflare account ID and API token. A read-only API
  check can access the `mayaochaybo.vn` zone; `next.mayaochaybo.vn` had no DNS
  record at baseline. Values are secrets and must never enter artifacts or logs.

## 3. Architecture and server decision

Use a separate frontend runtime on `10.10.0.58`, not the full CMS host or the
nearly-full WordPress source host:

```text
Cloudflare
  -> proxy 10.10.0.56
     -> next.mayaochaybo.vn: 10.10.0.58:3011 during preview
     -> mayaochaybo.vn:      10.10.0.26:80 until cutover

Next.js SSR frontend 10.10.0.58:3011
  -> Payload API 10.10.0.28:3001, tenant=mayaochaybo
  -> R2/static.x24sport.vn, tenant prefix=mayaochaybo
```

Deploy under `/root/websites/next.mayaochaybo.vn` with a site-local Compose file,
service `web`, container `next-mayaochaybo`, healthcheck, `restart: unless-stopped`,
and explicit resource/log limits. Bind port `3011`; permit proxy access and avoid
exposing admin credentials to the frontend container.

### Full SSR contract

- Use Next.js 16 App Router and React Server Components by default.
- Mark every page/route segment that reads tenant content as request-time dynamic
  (`dynamic = 'force-dynamic'`) and use uncached/no-store CMS reads.
- Do not use `generateStaticParams`, static export, ISR, route-level `revalidate`,
  or demo/fallback production content.
- Return the page's primary content, metadata, canonical, links, image markup,
  and structured data in the initial HTML. Use client components only for small
  interactive boundaries such as menus, galleries, filters, or forms.
- Bypass Cloudflare and Nginx caching for HTML and dynamic route responses during
  preview. Cache fingerprinted `/_next/static/` assets and immutable media.
- Keep preview responses `noindex` and canonicalized to the matching
  `https://mayaochaybo.vn` URL. Do not let preview URLs enter public sitemaps.

This is an explicit freshness/caching decision. Any later HTML microcache, ISR,
or static rendering change requires user approval and fresh URL/ads/SEO checks.

## 4. Data and URL contracts

### Source snapshot

Create immutable, versioned raw snapshots outside `10.10.0.26`. Export WordPress
database records plus source files/media manifests without modifying the source.
Capture at least:

- all WooCommerce products and variations in every status, prices, sale windows,
  SKU, stock/backorder rules, attributes/defaults, dimensions, weight, ordering,
  featured state, categories, tags, and galleries;
- posts and required pages in every status, hierarchy, authorship policy,
  timestamps, excerpts, full content, featured media, categories, and tags;
- product categories, attributes/terms, post taxonomies, menus, widgets/blocks,
  shortcode usage, redirects, and relevant site/store settings;
- every attachment and inline media URL with source ID, checksum, MIME, size,
  dimensions, alt, title, caption, credit, parent, and all accepted legacy URLs;
- Yoast title, description, canonical override, robots, Open Graph and factual
  schema inputs; never copy malformed cross-domain schema blindly;
- Google Ads landing pages, GTM/GA/Ads tags and triggers, consent mode, form/order
  success events, phone/Zalo actions, and meaningful campaign query parameters.

Store no credentials or personal order/customer data in snapshots. Encrypt and
access-control any separately approved private-data export.

### CMS readiness

Create the tenant only after the CMS filesystem-capacity gate passes and a
PostgreSQL backup is restorable. Use slug `mayaochaybo` and domains
`mayaochaybo.vn` plus `next.mayaochaybo.vn`.

Before import, close these verified gaps in the existing collections/migrator:

- add tenant-scoped `legacy-routes` resolution for direct, redirect, gone, and
  retained-noindex actions;
- complete product variations, default attributes, stock quantity/manage-stock,
  backorder policy, dimensions/weight, source taxonomy relations, gallery order,
  SEO/robots/social metadata, and migration-run attribution;
- complete web-content hierarchy, author policy, created timestamp, featured
  media, taxonomies, SEO/robots/social metadata, and unsupported-block state;
- add category/attribute SEO and exact paths; add media legacy URLs, provenance,
  checksums, dimensions, MIME/size, target key, and verification state;
- expand migration runs with snapshot/schema/code versions, checkpoints, per-type
  counts, rollback state, and error artifacts that contain no secrets;
- remove hard-coded basketball name, copy, sport, and colors from
  `migrate_wordpress_tenant.py`; set running-specific facts only from verified
  source/tenant settings;
- replace its published-only, featured-image-only normalization with complete
  authenticated extraction, taxonomies, galleries, prices, stock, variations,
  Yoast fields, dry-run collision reports, bounded retries, delta sync, and
  rollback-by-run.

Use upserts keyed by `(tenant, sourceSystem, sourceType, sourceId)` where source
ID namespaces differ, plus database-enforced `(tenant, legacyPath)` uniqueness.
The second identical pilot import must produce zero duplicates and zero
unexplained mutations.

### URL authority

Build the URL manifest from database/API, every sitemap, navigation/body links,
redirect rules, proxy/access logs, Google Ads final URLs, analytics landing pages,
and Search Console exports when available. A sitemap is not complete inventory.

The exact tenant-scoped `legacyPath` registry is the single authority for route
resolution, canonicals, internal links, breadcrumbs, structured data, sitemaps,
and redirects. Static/operational paths win before the catch-all resolver.

- Serve every reproducible current product, product category, attribute, post,
  page, pagination, media, feed, search, and meaningful-query route directly at
  the same path.
- Preserve trailing-slash and percent-encoding behavior after measuring both
  accepted variants. Do not add `/san-pham/` or `/danh-muc/` prefixes.
- Use one-hop `301`/`308` only for reviewed exceptions. Never redirect missing
  items broadly to the homepage or an unrelated category.
- Return a real `404` or reviewed `410` for content with no equivalent. Never
  render a soft 404 with status `200`.
- Fail schema/import/build on duplicate paths across products, categories, posts,
  pages, attributes, redirects, or reserved routes.

### Google Ads continuity

Before preview approval, compare source and target for every active campaign
landing URL and conversion journey. Preserve UTM, `gclid`, `gbraid`, `wbraid`,
and other measured parameters without treating them as separate canonical pages.
Verify tag IDs and event names from the source configuration without recording
secret values in the plan. Use browser/network evidence to prove one intended
conversion event fires once; do not claim parity from script presence alone.

## 5. Delivery phases

### Phase 0 — Capacity and recovery gates

1. Inventory Docker images/build cache/log growth on `10.10.0.28`; back up the
   deployed CMS, Compose/env files, and PostgreSQL before cleanup or expansion.
2. Free or add capacity without deleting the only rollback image. Require at
   least 10 GB free plus room for the full media/import/build workload.
3. Back up and restore-test WordPress database/files, proxy config, current DNS,
   Cloudflare rules, and the future frontend/proxy paths.

Exit gate: both source and target recovery procedures are proven and CMS capacity
is safe. Do not proceed merely because a cleanup command completed.

### Phase 1 — Discovery and immutable manifests

1. Take authenticated raw snapshots and build content, taxonomy, media, URL,
   redirect, integration, and Google Ads landing/conversion manifests.
2. Classify every URL as direct, one-hop redirect, gone, or retained-noindex.
3. Define a content freeze or timestamped delta-sync boundary for products/posts
   edited after the first snapshot.

Exit gate: final source counts are known; every high-value URL and business flow
has an owner and reviewed target behavior.

### Phase 2 — CMS schema and tenant isolation

1. Implement reversible schema migrations and update Payload types/import map.
2. Add `mayaochaybo` and tenant settings through a recorded, idempotent operation.
3. Test cross-tenant reads, writes, slugs, paths, SKUs, taxonomy relations, media,
   migration runs, and caches against every affected tenant.

Exit gate: type generation/build and isolation tests pass; PostgreSQL rollback is
documented and rehearsed.

### Phase 3 — Extract, normalize, import, reconcile

1. Extend the generic migrator rather than create an unreviewed one-off importer.
2. Run schema validation and collision-only dry run before network writes.
3. Pilot representative simple/variable products, nested content, shortcodes,
   complex galleries, missing data, Vietnamese/encoded paths, taxonomies, and
   redirects twice.
4. Run full import, media checksum verification, reconciliation, then delta sync.

Exit gate: counts and critical checksums match by type/status; every exception is
reviewed; the repeated import is idempotent.

### Phase 4 — Build the SSR frontend

1. Create `mayaochaybo.vn` Next.js source without deleting WordPress operational
   history; reuse proven components only after removing tenant-specific claims.
2. Implement exact route resolution, catalog/category/attribute pagination,
   product/post/page templates, search, menus, media, 404/410, metadata, robots,
   sitemaps, canonical, breadcrumbs, and factual structured data.
3. Implement the approved contact/order flow and exact Google Ads/analytics
   events with server-side validation and accessible success/error states.
4. Run typecheck, configured lint/tests, production build, browser journeys,
   accessibility, structured-data, responsive, and applicable quality gates.

Exit gate: all critical content exists in initial HTML, no demo fallback exists,
and source/target journeys are behaviorally equivalent.

### Phase 5 — Deploy `next.mayaochaybo.vn`

1. Recheck host disk/RAM, path, port `3011`, CMS reachability, proxy capacity, and
   current Cloudflare DNS before mutation.
2. Back up any existing target path/config, deploy the site-local Compose stack,
   and pass its healthcheck at `10.10.0.58:3011`.
3. Back up proxy config, add a dedicated Nginx vhost/upstream on `10.10.0.56`,
   validate `nginx -t`, and reload without restarting shared services.
4. Source root `.env` without printing values and create the proxied Cloudflare
   DNS record only after proxy/origin health passes.
5. Verify HTTPS, preview noindex, production canonicals, no HTML cache, static
   asset cache, application/proxy logs, and no effect on sibling services.

Exit gate: preview is stable and non-indexable; production still resolves only to
WordPress; rollback removes the preview route without touching the apex.

### Phase 6 — Full URL and business reconciliation

1. Run the final import plus delta and reconcile every source record.
2. Run `scripts/verify_url_contract.py` for every manifest row against the staging
   origin with `Host: mayaochaybo.vn`; crawl rendered HTML and media separately.
3. Compare status, redirect hops, canonical, robots, title/H1, identity, prices,
   stock, taxonomy, links, schema, media, forms, mobile/desktop UI, console/logs,
   and Google Ads event/network behavior.
4. Rehearse traffic rollback and migration-run data rollback.

Exit gate: every go/no-go threshold below passes with secret-free evidence.

### Phase 7 — Production cutover and monitoring

1. Obtain explicit cutover approval and maintenance/delta window. Freeze source
   writes or run the approved final delta; take fresh backups on both sides.
2. Switch only the `mayaochaybo.vn` proxy upstream to `10.10.0.58:3011`. Preserve
   host, HTTPS, path, query, canonical host, and Google Ads final URLs.
3. Purge only the domain's documented cache scope and run public edge checks.
4. Monitor continuously, then at 24 hours, 72 hours, one week, and the agreed
   retention endpoint. Track 404/410/5xx, routes, crawl/indexing, conversions,
   leads/orders, CMS latency, media, CWV, and cross-tenant health.
5. Keep WordPress private and rollback-ready. Retire it only after explicit
   approval, a stable retention window, and a final restore-tested archive.

## 6. Go/no-go thresholds

- 100% of source products, posts, required pages, taxonomies, and media reconcile
  by source type/ID/status; every mismatch has an approved disposition.
- 100% of published product/category/post URLs keep exact accepted paths and
  expected canonicals unless an individually reviewed exception says otherwise.
- 100% of URL-manifest rows have automated status/redirect/canonical/indexability
  results; zero unintended chains, loops, soft 404s, or launch-time `noindex`.
- Zero tenant leaks/collisions in records, routes, SKUs, media, settings, caches,
  users, or migration-run rollback.
- Complete catalogs and archives are reachable through crawlable, SSR pagination;
  no fixed API limit hides products or posts.
- Prices, stock, variations, product relations, visible content, SEO fields,
  structured data, timestamps, and media checksums match or have reviewed
  exceptions. No unsupported block is silently dropped.
- Every active Google Ads landing URL preserves path/query behavior and returns
  the intended page. Every critical conversion fires exactly once with expected
  consent behavior in browser/network verification.
- Production build, healthcheck, responsive/accessibility checks, forms/order
  journeys, application logs, and public/origin HTTP checks pass.
- Backups are restorable; traffic rollback and migration-run rollback have both
  been rehearsed.

## 7. Stop and rollback conditions

Roll back traffic immediately when any of these occurs:

- broad 404/5xx, broken root-level routes, redirect loops, wrong canonicals,
  sitemap/robots errors, or staging URLs exposed as production;
- missing/wrong product identity, price, stock, variation, category, media, or
  content; unsupported source markup silently removed;
- lost, duplicated, or misattributed Google Ads conversions, leads, orders,
  phone/Zalo actions, or consent events;
- cross-tenant data/cache/media/settings exposure or material degradation of
  `cms-api`, PostgreSQL, the proxy, or sibling frontends;
- disk exhaustion, unhealthy container, sustained CMS timeout, or secrets in an
  artifact/log.

Restore the previous proxy upstream and domain cache behavior first so users and
campaign traffic return to WordPress. Investigate offline, preserve the failed
migration run and evidence, and revert target data only through its recorded run
or database backup. Never attempt prolonged live repair while paid landing pages
serve incorrect content.
