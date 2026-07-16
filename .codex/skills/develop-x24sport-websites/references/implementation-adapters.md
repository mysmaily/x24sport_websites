# X24Sport implementation adapters

## Contents

1. Repository map
2. Shared design and content rules
3. Next.js 16 and Payload adapter
4. WordPress and Flatsome adapter
5. Ecommerce page contracts
6. Official framework sources

## 1. Repository map

| Site | Primary stack | Shared dependency |
|---|---|---|
| `mayaocaulong.vn` | Next.js 16 App Router | `cms-api` / Payload tenant data |
| `mayaobongchuyen.vn` | Next.js 16 App Router | `cms-api` / Payload tenant data |
| `mayaopickleball.vn` | Next.js 16 App Router | `cms-api` / Payload tenant data |
| `mayaobongro.vn` | WordPress | Shared infrastructure in local profile |
| `mayaochaybo.vn` | WordPress / Flatsome child | Shared infrastructure in local profile |
| `mayaobongda.vn` | WordPress | Shared infrastructure in local profile |

Treat the local `AGENTS.md` as the authority for deployment paths, cache clearing,
backups, access scope, and shared-resource risks.

## 2. Shared design and content rules

- Derive the visual direction from the existing brand, product photography,
  audience, and page objective. Do not impose a generic “AI landing page” style.
- Define or reuse tokens for color, type, spacing, radius, border, elevation,
  containers, and breakpoints. Use consistent component states.
- Keep primary navigation compact and task-oriented: browse products, understand
  customization, check size/material/price, and order or contact.
- Make the main CTA specific to the next action. Avoid competing CTAs with equal
  visual weight.
- Use real product media and factual copy. Optimize generated media before it
  becomes a committed `public` or WordPress media asset.
- Preserve parity between visual copy, CMS data, metadata, schema, and transaction
  behavior.

## 3. Next.js 16 and Payload adapter

### Rendering

- Keep layouts and pages as Server Components by default.
- Add `"use client"` only at the smallest interactive boundary: gallery controls,
  quick-order validation, menu state, or similar behavior.
- Fetch Payload data directly in Server Components through the established data
  layer. Do not call an internal Route Handler from a Server Component.
- Parallelize independent data fetches and avoid sequential request waterfalls.
- Choose static, cached, revalidated, or dynamic rendering intentionally based on
  content freshness. Verify behavior instead of assuming framework defaults.

### Metadata and indexing

- Set `metadataBase` in the root layout.
- Use static `metadata` for fixed pages and `generateMetadata` for CMS/product
  routes. Metadata exports belong to Server Components.
- Return `notFound()` and appropriate metadata/status for missing products; do not
  render a soft 404 with HTTP 200.
- Implement `app/robots.ts` and `app/sitemap.ts` or equivalent metadata files.
- Build sitemaps from canonical public CMS records, excluding drafts, redirects,
  noncanonical filters, and intentionally noindexed pages.
- Generate stable canonical and Open Graph URLs from the target domain, never a
  shared internal CMS origin.
- Render JSON-LD with data serialized safely from trusted structured objects.
  Do not copy arbitrary rich text into a script block.

### Images, fonts, and interaction

- Prefer `next/image` for content images when its optimization path is compatible
  with the CDN. Supply accurate `sizes`; use `priority`/high fetch priority only
  for the actual above-fold LCP candidate.
- Use `next/font` or stable self-hosted fonts to reduce external requests and
  layout shift.
- Use `next/link` or semantic anchors for navigation.
- Avoid hydrating large catalogs or product descriptions only to provide a small
  client interaction.
- Validate focus handling and accessible names for mobile menus, dialogs,
  galleries, filters, and order forms.

### Build gates

Run from every changed Next.js package:

```bash
pnpm build
```

Next.js 16 no longer runs lint during `next build`; run the configured linter or
type/accessibility checks separately when the package provides them. Inspect the
production output and exercise `next start` for performance checks.

For `cms-api` changes, also run the relevant type generation or tests and verify
tenant isolation using representative records from every affected tenant.

## 4. WordPress and Flatsome adapter

- Find existing hooks, templates, shortcodes, schema generators, SEO plugins,
  cache layers, and child-theme overrides before adding anything.
- Prefer a child theme or site-specific plugin. Never edit WordPress core or the
  Flatsome parent theme.
- Avoid duplicate metadata or schema from multiple plugins/custom hooks. Choose
  one owner per output and inspect rendered HTML.
- Use WordPress APIs for escaping, sanitization, nonces, capability checks,
  queries, media, metadata, and URLs.
- Preserve WooCommerce product, variation, price, stock, cart, checkout, and
  account behavior. Test simple and variable products relevant to the change.
- Use real WordPress attachment alt text; do not use filenames or keyword lists
  as automatic alt text.
- Back up affected files and exact database records before remote changes.
- Validate PHP syntax, then use only the site profile's documented deployment,
  cache purge, service reload, and rollback procedures.

## 5. Ecommerce page contracts

### Home

- State the sport, product/service, differentiator, and next action above the
  fold without requiring a carousel interaction.
- Link to important categories, representative products, ordering guidance,
  materials/sizing, proof, and contact information.

### Category/catalog

- Provide a descriptive heading and useful context, crawlable product links,
  usable filters, explicit result state, and crawlable pagination.
- Decide which filter combinations deserve indexable landing pages. Do not expose
  every UI state as an indexable URL.

### Product

- Show factual name, media, price or quote state, availability, variants,
  material/fit, sizing, customization, fulfillment, returns, and next action as
  applicable.
- Keep selected variant state shareable and understandable when distinct variants
  have their own URLs.
- Make gallery controls keyboard/touch accessible and prevent image layout shift.
- Keep visible facts synchronized with Product/ProductGroup JSON-LD.

### Content/article

- Answer a real shopper question with original expertise, clear authorship or
  business context, useful internal links, and an honest update date.
- Do not publish cross-domain paraphrases solely to target keyword variants.

### Form/order/contact

- Use persistent labels, correct input types and autocomplete, clear validation,
  keyboard focus on errors, a real success state, spam protection, and server-side
  validation.
- Do not expose secrets or trust client validation.

## 6. Official framework sources

- [Next.js production checklist](https://nextjs.org/docs/app/guides/production-checklist)
- [Next.js Metadata and OG images](https://nextjs.org/docs/app/getting-started/metadata-and-og-images)
- [Next.js generateMetadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Next.js sitemap convention](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap)
- [Next.js Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [Next.js accessibility](https://nextjs.org/docs/architecture/accessibility)
- [WordPress coding standards](https://developer.wordpress.org/coding-standards/wordpress-coding-standards/)
- [WordPress theme handbook](https://developer.wordpress.org/themes/)
- [WooCommerce developer documentation](https://developer.woocommerce.com/docs/)
