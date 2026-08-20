# Brand shop implementation adapters

## Contents

1. Repository map
2. Shared design and content rules
3. Next.js 16 and Payload adapter
4. Ecommerce page contracts
5. Official framework sources

## 1. Repository map

| Layer | Primary stack | Tenant behavior |
|---|---|---|
| Public websites | Next.js 16 App Router | Host resolves dynamically from Payload; optional slug-specific visual overrides |
| Content/admin | Payload CMS 3 | Tenant-scoped collections, users and media |
| Brand portfolio | Brand domains configured in Payload | One shared `cms-frontend` runtime |

Treat `PRODUCTION-DEPLOYMENT-RUNBOOK.md` as the authority for deployment. Use the
local `AGENTS.md` for tenant identity, cache behavior, access scope, and
shared-resource risks.

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
  becomes a committed `public` or Payload media asset.
- Keep visual copy, CMS data, metadata, schema, and transaction behavior
  consistent with each other.

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

## 4. Ecommerce page contracts

All product-detail and product-list implementations must follow the repository
commerce UI rules in `AGENTS.md`. Treat heading hierarchy, stable media sizing,
readable product names, and single-line price treatment as cross-platform
requirements, not optional visual guidance.

Catalog, category, collection, and search-results implementations must also
follow the repository catalog density and filtering rules. Reuse compact
primary filters and a bounded secondary filter pattern across platform adapters
rather than rebuilding unbounded filter clouds per site.

### Home

- State the sport, product/service, differentiator, and next action above the
  fold without requiring a carousel interaction.
- Link to important categories, representative products, ordering guidance,
  materials/sizing, proof, and contact information.

### Category/catalog

- Provide a descriptive heading and useful context, crawlable product links,
  usable filters, explicit result state, and crawlable pagination.
- Keep product discovery above the fold by combining a horizontally scrollable
  primary filter row with a compact secondary dropdown; both must retain real
  crawlable landing-page links.
- Decide which filter combinations deserve indexable landing pages. Do not expose
  every UI state as an indexable URL.

### Product

- Show factual name, media, price or quote state, availability, variants,
  material/fit, sizing, customization, fulfillment, returns, and next action as
  applicable.
- Keep selected variant state shareable and understandable when distinct variants
  have their own URLs.
- Make gallery controls keyboard/touch accessible and prevent image layout shift.
  Product-detail media must also follow the repository **Shared product media
  gallery contract**.
- Keep visible facts synchronized with Product/ProductGroup JSON-LD.

#### Shared Next.js product media gallery

For shared Next.js/Payload tenants, prefer the reusable product gallery over
tenant-local interaction logic:

```tsx
import {
  ProductMediaGallery,
  type ProductMediaGalleryImage,
} from '../../../../_components/product-media-gallery'

type ProductGalleryProps = {
  discountPercent?: number
  images: ProductMediaGalleryImage[]
  productName: string
}

export function ProductGallery({ discountPercent = 0, images, productName }: ProductGalleryProps) {
  return (
    <ProductMediaGallery
      discountPercent={discountPercent}
      images={images}
      productName={productName}
    />
  )
}
```

Use the correct relative import path for the tenant component location. Add a
tenant-local wrapper only when the cloned brand repo intentionally introduces a
slug-specific visual override.

The shared component accepts:

- `images`: CMS/media objects with `url`, `alt`, `width`, `height`, and optional
  `id`.
- `productName`: fallback alt and accessible gallery label.
- `discountPercent`: optional sale badge for product-detail pages.
- `label`: optional small media label used by tenants that need one.
- `fallbackText`: optional fallback shown when a product has no images.
- `variant`: `css` for tenants with existing `.product-detail-gallery` styles,
  or `utility` for newer utility-styled tenants.

Implementation requirements:

- Keep `photoswipe` in `cms-frontend/package.json` and import
  `photoswipe/style.css` once in `cms-frontend/src/app/layout.tsx`.
- Keep PhotoSwipe anchors as real `<a href>` elements with
  `data-pswp-width`/`data-pswp-height`. Do not replace them with button-only
  markup; the anchor contract supports progressive navigation and PhotoSwipe
  dimension reservation.
- Keep the square stage and `object-fit: contain` behavior in the shared
  component. Tenant CSS may style borders, background, thumbnails, and controls,
  but must not make the product-detail image frame vertical or crop the product
  image.
- Preserve the `.pswp img.pswp__img { max-width: none !important; }` override in
  shared CSS because tenant/Tailwind resets commonly apply `max-width: 100%` to
  all images and can collapse PhotoSwipe images to zero width.

Verification checklist for product-detail media changes:

- `pnpm typecheck` and `pnpm build` pass in `cms-frontend`.
- At `390x844` and a desktop viewport, `.product-gallery-stage` renders square.
- The active `.product-media-image` computes `object-fit: contain`.
- Main-image click/tap and the zoom control open `.pswp`.
- Preview images inside `.pswp` have non-zero rendered width and height.
- Previous/next controls and thumbnails update the active image with a visible
  slide transition.
- PhotoSwipe zoom is available through the preview zoom button; on touch devices
  tap/click-to-zoom and double-tap zoom should be exercised when browser
  automation supports real touch gestures.

### Content/article

- Answer a real shopper question with original expertise, clear authorship or
  business context, useful internal links, and an honest update date.
- Do not publish cross-domain paraphrases solely to target keyword variants.

### Form/order/contact

- Use persistent labels, correct input types and autocomplete, clear validation,
  keyboard focus on errors, a real success state, spam protection, and server-side
  validation.
- Do not expose secrets or trust client validation.

## 5. Official framework sources

- [Next.js production checklist](https://nextjs.org/docs/app/guides/production-checklist)
- [Next.js Metadata and OG images](https://nextjs.org/docs/app/getting-started/metadata-and-og-images)
- [Next.js generateMetadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Next.js sitemap convention](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap)
- [Next.js Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [Next.js accessibility](https://nextjs.org/docs/architecture/accessibility)
