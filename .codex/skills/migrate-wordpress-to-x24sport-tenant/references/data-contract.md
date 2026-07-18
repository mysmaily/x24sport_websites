# WordPress to Payload Data Contract

## Identity and tenancy

All migrated records need these identities where applicable:

| Target field | Rule |
|---|---|
| `tenant` | Required relationship; included in every lookup and unique key |
| `sourceSystem` | Stable value such as `wordpress` |
| `sourceId` | Original numeric WordPress/WooCommerce ID, stored as a string |
| `sourceModifiedAt` | Original GMT modification timestamp |
| `sourceChecksum` | Checksum of normalized source fields |
| `migrationRun` | Import run that last created or changed the record |
| `slug` | Original slug, never regenerated during migration |
| `legacyPath` | Exact accepted public route, independently unique per tenant |

Enforce uniqueness for `(tenant, sourceSystem, sourceId)` and
`(tenant, legacyPath)`. Slug uniqueness, when required by a collection, must be
tenant-scoped. The same applies to SKUs and taxonomy slugs when business rules
permit reuse across tenants.

## Minimum collection coverage

### Products

- title/name, exact slug and path, publication status, created/modified dates;
- SKU, product type, regular/sale/current prices with explicit semantics;
- stock status, quantity, backorders, manage-stock behavior;
- short and full descriptions without lossy regex-only conversion;
- attributes, variation records, default attributes, dimensions and weight;
- categories, tags, badges only when factual, ordering and featured state;
- gallery order, featured image, alt/caption/title, source media identity;
- SEO title, meta description, canonical override, robots directives, social image;
- review aggregate only when valid source reviews are migrated and reconciled.

### Pages, posts, and navigation

- title, slug, full legacy path, hierarchy/parent, status and timestamps;
- structured content, author policy, featured media, excerpt, taxonomies and SEO;
- menus with label, destination, order, nesting, external-link behavior;
- reusable blocks/widgets/shortcodes converted or explicitly quarantined.

### Taxonomies and media

- source identity, hierarchy, exact slug/path, descriptions, ordering, SEO;
- media checksum, original URL, exact legacy URL, MIME, dimensions, file size,
  alt, caption, title, credit, target R2 key, upload and verification state.

### Operational collections

- `legacy-routes`: tenant, path, content relation or redirect/gone action;
- `migration-runs`: mode, source snapshot, code/schema version, start/end,
  counts, checksums, errors, rollback status;
- tenant store settings: brand/contact/navigation/social/business facts;
- forms or leads only after confirming privacy, consent, retention, and target flow.

## Extract, normalize, load

1. Export immutable raw snapshots. Never transform the only copy.
2. Normalize into versioned JSONL records with deterministic ordering/checksums.
3. Validate schemas and relations before network writes.
4. Dry-run resolution and collision checks.
5. Import parents/media/taxonomies before dependent content.
6. Upsert by tenant plus source identity and record per-item outcomes.
7. Re-run unchanged input; it must produce zero duplicate records and zero
   unexplained mutations.
8. Delta-sync records changed after the snapshot boundary.
9. Reconcile counts by type/status and checksums by source ID.

## Known cms-api gaps to resolve before mayaobongro import

At the July 16, 2026 baseline, the existing collections and migration script need
review for these blockers:

- product and product-category slugs are globally unique although content is
  tenant-scoped;
- importer existence checks are not consistently tenant-scoped;
- source identity, full legacy route, migration run, and redirect models are absent;
- variations, attributes, stock, publication state, source timestamps, SEO fields,
  and media provenance are incomplete;
- HTML-to-Lexical conversion can silently discard structured content;
- fixed frontend API limits can omit a catalog larger than one page;
- sample frontend data contains claims that must not enter production unless
  backed by migrated source data.

Do not work around these issues with filename, SKU, or slug guessing. Fix the
schema and importer contract first, with migrations and isolation tests.
