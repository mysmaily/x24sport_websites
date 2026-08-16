# Menu & Taxonomy Implementation Checklist

Target: `mayaobongda.vn`  
Started: 2026-08-16  
Completion rule: every required item must be checked and backed by fresh validation evidence.

## CMS and migration

- [x] Add backward-compatible `collection` and `audience` taxonomy groups.
- [x] Preserve the ecommerce meaning of `products.productType`.
- [x] Add an idempotent Payload schema migration.
- [x] Add an idempotent tenant-scoped content migration with `--dry-run` and `--apply`.
- [x] Detect unresolved or cross-tenant category relationships before mutation.
- [x] Recalculate category counts from published products.
- [x] Generate Payload types and import map.
- [x] Pass local CMS TypeScript and production build.
- [x] Deploy and migrate the shared CMS.
- [x] Run content dry-run with production credentials.
- [x] Apply content migration.
- [x] Run the dry-run again with zero remaining mutations.

## Content and taxonomy coverage

- [x] `ao-thiet-ke` is labeled `Mẫu thiết kế` and includes the no-logo union.
- [x] `ao-khong-logo` remains related to its products and becomes a tag.
- [x] Year categories become collections.
- [x] Club and national-team labels match the approved wording.
- [x] Audience categories exist and may be attached to multiple products.
- [x] The 2026 collection is assigned to team, school, company and tournament audiences.
- [x] The bank audience retains its curated products.
- [x] Product and category relationships remain tenant-isolated.

## Frontend and content

- [x] Implement the three-column desktop mega menu.
- [x] Implement the equivalent mobile accordion.
- [x] Derive the featured design year from the newest non-empty collection.
- [x] Keep the approved national-team navigation label while noindexing and omitting its empty page from the sitemap.
- [x] Remove no-logo, price and fabric links from the primary product mega menu.
- [x] Keep price and fabric as ordered top-level links.
- [x] Add the school and student audience landing page.
- [x] Normalize labels on the homepage, header and footer.
- [x] Add `noindex,follow` metadata for empty categories.
- [x] Exclude redirect sources and empty categories from the sitemap.
- [x] Pass local frontend TypeScript and production build.

## Redirects and URLs

- [x] Implement `/cong-ty/` permanent redirect.
- [x] Implement `/ngan-hang/` permanent redirect.
- [x] Replace `/ao-bong-da-cong-ty-ngan-hang/` with a permanent redirect.
- [x] Verify each redirect is one hop in production.
- [x] Verify `/ao-khong-logo/` remains `200` with a self-canonical.
- [x] Verify destination landings return `200` with self-canonicals.
- [x] Verify redirect sources are absent from the production sitemap.

## Responsive, accessibility and production

- [x] Validate 320, 390x844, 768, 1024, 1440x900 and wide desktop.
- [x] Validate keyboard focus, Escape and accordion state.
- [x] Confirm rendered navigation uses crawlable anchors.
- [x] Confirm no horizontal overflow or clipped header controls.
- [x] Capture fresh mobile and desktop screenshots.
- [x] Commit and push only task-scoped files.
- [x] Deploy the shared frontend with the canonical runbook.
- [x] Verify origin, public HTTP, container health and logs.
- [x] Smoke-test every sibling tenant served by the shared frontend.
- [x] Confirm all required items are complete before handoff.

## Final evidence — 2026-08-16

- Final production taxonomy dry-run: 513 products, 0 category creates, 0 category updates, 0 products needing design, 0 products needing audience tags, 0 count mismatches and 0 invalid relations.
- Catalog counts: 440 design, 103 no-logo, 155 current-year and 35 bank products; the no-logo union is fully included in design.
- Retired URLs return one-hop HTTP 301 redirects; their destinations return 200 and the redirect sources are absent from the sitemap.
- Browser checks passed at 320, 390x844, 768, 1024, 1440x900 and 1600x1000 with no horizontal overflow or console warnings/errors.
- Desktop menu renders three columns and 13 crawlable links; mobile renders the same taxonomy as three accordion groups.
- Shared frontend and CMS containers are running; all eight public tenant homepages return HTTP 200.
