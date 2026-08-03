# MayAoChayBo.vn conversion and SEO fix report

Date: 2026-08-03

| Issue | Before evidence | Fix | After evidence | Status |
|---|---|---|---|---|
| Product detail mobile buries product image under breadcrumb and long H1 | Playwright mobile snapshot at 390x844 showed breadcrumb, long H1, then product media | Breadcrumb is shortened on mobile; H1 is clamped to 2 lines with tighter spacing | Requires local/prod screenshot after deploy at 390x844 | Fixed in code |
| Product detail CTA block was too tall | Snapshot showed post-gallery buying column around 983px high, including form and long copy | CTA is compact 2-column Zalo/Goi; short description is clamped; form and details move into collapsible sections | Requires local/prod screenshot after deploy | Fixed in code |
| Product list filter overflow had weak affordance | Product filter chips extended outside the viewport with no strong hint | Added mobile fade hint and retained horizontal chip scroll | Requires local/prod screenshot after deploy | Fixed in code |
| Product cards made CTA secondary and showed bad zero-price cases | HTML/card audit showed repeated small "Xem mau" and risk of 0d display for logo/reference products | Cards prioritize image, reduce title/padding, add compact Zalo action, and show "Mau tham khao" when price is missing or <= 0 | Local rendered HTML showed compact Zalo action and fallback copy in product card code path | Fixed in code |
| Product metadata too long/truncated | Live product title included long suffix and descriptions used `...` | Added SEO cleanup helpers, shorter title/description templates, ellipsis normalization, and word-boundary clipping | Local HTML title/meta use cleaned templates; `pnpm run typecheck` passes | Fixed in code |
| Product rich results were thin | Product detail only conditionally emitted Product JSON-LD | Product JSON-LD now always emits Product with id, image, brand, description, URL, and Offer when price exists | Local product HTML contains updated Product JSON-LD script; JSON-LD parse still should be validated after deploy | Fixed in code |
| Category/list pages lacked ItemList schema | Catalog audit showed only breadcrumb-level structured data | Catalog emits ItemList for the current product page with stable positions and URLs | Local `/san-pham/` HTML contains ItemList schema | Fixed in code |
| Homepage organization/search schema incomplete | Homepage had OnlineStore only | Homepage emits Organization, OnlineStore, and WebSite SearchAction graph | `pnpm run build` completed with updated homepage schema | Fixed in code |
| Public pages were forced dynamic/no-store | Live headers showed `cache-control: private, no-cache, no-store`; code used `cache: 'no-store'` and `dynamic = 'force-dynamic'` | CMS fetches now use `next.revalidate=300`; public MayAoChayBo routes export `revalidate=300` | Local `next start` still showed no-store under tenant routing/standalone warning; production headers need re-check after deploy | Partially fixed, needs deploy verification |
| Sitemap static/category URLs lacked freshness and may use generic category paths | Sitemap had no `lastmod` for main static URLs; category mapping did not prefer MayAoChayBo legacy paths | Static URLs now include `lastModified`; MayAoChayBo categories prefer `legacyPath` | Build passed; fetch `/sitemap.xml` after deploy for final confirmation | Fixed in code |
| Form loading copy used ASCII ellipsis | UI guideline audit flags `...` in loading/placeholder copy | Replaced visible search/form `...` with `…` | `pnpm run typecheck` passes | Fixed in code |

## Verification checklist

- `pnpm run typecheck` passed.
- `pnpm run build` passed.
- Playwright screenshots at `390x844`, `768x1024`, and `1440x900` for `/`, `/san-pham/`, and three product detail pages.
- HTML checks after deploy: no unintended `Click me`, no product card `0đ`, JSON-LD parses, and title/description are not truncated with `...`.
- Header checks after deploy: public routes should no longer return `private, no-cache, no-store` because of page-level dynamic rendering.
