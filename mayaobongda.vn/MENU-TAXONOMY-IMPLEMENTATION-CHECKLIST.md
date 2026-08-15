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
- [ ] Deploy and migrate the shared CMS.
- [ ] Run content dry-run with production credentials.
- [ ] Apply content migration.
- [ ] Run the dry-run again with zero remaining mutations.

## Content and taxonomy coverage

- [ ] `ao-thiet-ke` is labeled `Mẫu thiết kế` and includes the no-logo union.
- [ ] `ao-khong-logo` remains related to its products and becomes a tag.
- [ ] Year categories become collections.
- [ ] Club and national-team labels match the approved wording.
- [ ] Audience categories exist and may be attached to multiple products.
- [ ] The 2026 collection is assigned to team, school, company and tournament audiences.
- [ ] The bank audience retains its curated products.
- [ ] Product and category relationships remain tenant-isolated.

## Frontend and content

- [x] Implement the three-column desktop mega menu.
- [x] Implement the equivalent mobile accordion.
- [x] Derive the featured design year from the newest non-empty collection.
- [x] Hide empty product types from navigation.
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
- [ ] Verify each redirect is one hop in production.
- [ ] Verify `/ao-khong-logo/` remains `200` with a self-canonical.
- [ ] Verify destination landings return `200` with self-canonicals.
- [ ] Verify redirect sources are absent from the production sitemap.

## Responsive, accessibility and production

- [ ] Validate 320, 390x844, 768, 1024, 1440x900 and wide desktop.
- [ ] Validate keyboard focus, Escape and accordion state.
- [ ] Confirm rendered navigation uses crawlable anchors.
- [ ] Confirm no horizontal overflow or clipped header controls.
- [ ] Capture fresh mobile and desktop screenshots.
- [ ] Commit and push only task-scoped files.
- [ ] Deploy the shared frontend with the canonical runbook.
- [ ] Verify origin, public HTTP, container health and logs.
- [ ] Smoke-test every sibling tenant served by the shared frontend.
- [ ] Confirm all required items are complete before handoff.
