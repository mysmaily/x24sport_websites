# mayaobongda.vn conversion, UI, and SEO recovery plan

Audit time: 2026-08-03 13:06 ICT
Target tenant: `mayaobongda`
Frontend source: `cms-frontend/`

## Baseline evidence

| Area | Before evidence | Risk |
|---|---|---|
| HTML caching | `curl -I https://mayaobongda.vn/` returns `cache-control: private, no-cache, no-store, max-age=0, must-revalidate` and `cf-cache-status: DYNAMIC`. | High TTFB and inconsistent mobile browsing despite Next.js migration. |
| App rendering | Homepage, catalog, product, blog, search, and legacy route files export `dynamic = 'force-dynamic'`; tenant CMS fetch defaults to `revalidate = 0`. | Every shopper request re-renders CMS-backed pages. |
| Product discovery | Mobile homepage hero uses `min-h-[720px]`, large H1, audience cards, and full-width CTA block before products. | Shoppers see messaging instead of product images in the first screen. |
| Catalog density | Catalog header, search, filters, and result metadata stack before the grid. | First product row can be pushed below the fold on mobile. |
| Category URLs in sitemap | Generic sitemap maps categories to `/danh-muc/{slug}/` for `mayaobongda`, while UI uses legacy category paths such as `/ao-thiet-ke/`. | Mixed canonical/internal signals and wasted crawl paths. |
| Shop URL | Production has `/shop` -> `/shop/` -> `/san-pham/`, while UI and breadcrumbs linked to `/shop/`. | Redirect hops and mixed product archive signals. |
| Metadata | Homepage title from production is `MayaoBongDa.vn - Áo bóng đá thiết kế riêng`; page metadata title is generic. | Main commercial query `may áo bóng đá` is underweighted in browser/SERP title. |
| Product card CTA | Product cards spend row space on text CTA and separate price row. | Less image/catalog density on mobile. |
| Header mobile menu | Mobile menu repeats product links and includes legacy `/category/chua-phan-loai/`. | Dead-end or low-value navigation can increase bounce. |

## Fix plan

| Priority | Issue | Fix | Scope guard |
|---|---|---|---|
| P0 | Forced dynamic/no-store pages | Remove `force-dynamic` from `mayaobongda` pages and add tenant-local ISR revalidate for CMS fetches. | Tenant-local files only. |
| P0 | Catalog products too low on mobile | Compact homepage hero, category intro, catalog header/search/filter spacing, and product cards. | Tenant-local components/classes only. |
| P1 | Redirecting `/shop/` used as canonical browse path | Route all browse CTAs, breadcrumbs, and schema to `/san-pham/`; keep `/shop/` as redirect only. | Tenant-local links plus guarded shared wrapper. |
| P1 | Sitemap category URL mismatch | For `mayaobongda`, emit category `legacyPath` when present. | Shared `sitemap.ts`, guarded by `tenant.slug === 'mayaobongda'`. |
| P1 | Commercial SEO title/meta | Strengthen homepage/catalog titles and descriptions around `may áo bóng đá`, `áo bóng đá thiết kế`, `áo không logo`. | Tenant-local metadata plus guarded shared metadata branch. |
| P1 | Navigation leakage | Remove duplicate/weak mobile menu links and point news to `/blog/`. | Tenant-local header only. |
| P2 | Product schema detail | Keep schema factual and synchronized with visible content; do not add expiry/shipping/review data not shown on page. | Tenant-local product detail only. |

## Before / after issue table

| Issue | Before | After |
|---|---|---|
| HTML no-store caused by tenant pages | Confirmed in production headers and source exports. | `mayaobongda` home/catalog/blog/search/product/legacy routes now use `revalidate = 180`; tenant CMS fetch defaults to 180 seconds. Production cache header still requires build/deploy verification. |
| Mobile hero takes too much first viewport | `min-h-[720px]`, big H1, cards, CTA before products. | Mobile hero reduced to `min-h-[560px]`, smaller mobile H1/copy, compact audience tiles, and inline CTAs. |
| Catalog controls consume vertical space | Header/search/filter/results all stack with generous margins. | Catalog header/search/filter/result metadata spacing tightened while retaining visible H1, description, crawlable filters, and search. |
| `/shop/` redirect path used in UI/schema | CTAs, breadcrumbs, footer, and audience JSON-LD pointed to `/shop/`. | UI/JSON-LD links now point to `/san-pham/`; `/shop/` route redirects directly to `/san-pham/`. |
| Sitemap category mismatch | `/danh-muc/{slug}/` emitted for generic mayao sitemap. | Sitemap category URLs use `legacyPath` for `mayaobongda`; `/shop/` is not listed. |
| Header mobile duplicate/dead links | Duplicate product links; `/category/chua-phan-loai/`. | Mobile menu points news to `/blog/`, adds `/lien-he/`, removes duplicate product link, and all product-browse links point to `/san-pham/`. |
| Product schema offer fields | Basic Product/Offer only. | Left factual Product/Offer unchanged; did not add unsupported `priceValidUntil` because the page does not show a price expiry date. Breadcrumbs now point to `/san-pham/`. |

## Post-change local evidence

| Check | Result |
|---|---|
| Local homepage rendered via `Host: mayaobongda.vn` | Title is `May Áo Bóng Đá Thiết Kế, Áo Không Logo Giá Xưởng`; meta description updated; 1 H1; 12 images; 0 `/shop/` links; 58 `/san-pham/` links. |
| Local catalog `/san-pham/` | Title is `Mẫu Áo Bóng Đá Thiết Kế`; canonical is `https://mayaobongda.vn/san-pham/`; 1 H1; 26 images; 0 `/shop/` links. |
| Local product sample | Canonical stays on `/san-pham/ao-bong-da-thiet-ke-2026-049/`; 1 H1; JSON-LD present; 0 `/shop/` links. |
| Local `/shop/` | 308 redirect to `/san-pham/`. |
| Production pre-change audit script | `/` and product sample passed basic SEO checks; `/shop/` returned 308 and was therefore removed from canonical UI/sitemap paths. |
| Typecheck/build | Blocked by unrelated existing TypeScript errors in `src/app/[tenant]/_mayaochaybo/components/product-card.tsx`. Compile phase of `pnpm build` succeeded before TypeScript failed. |

## Verification checklist

- `pnpm typecheck`: blocked by unrelated `mayaochaybo` TypeScript errors.
- `pnpm build`: compiled successfully, then blocked by the same unrelated `mayaochaybo` TypeScript errors.
- `python3 .codex/skills/develop-x24sport-websites/scripts/audit_page.py https://mayaobongda.vn/`: pass on production baseline.
- `python3 .codex/skills/develop-x24sport-websites/scripts/audit_page.py https://mayaobongda.vn/san-pham/`: pass on production baseline.
- `python3 .codex/skills/develop-x24sport-websites/scripts/audit_page.py https://mayaobongda.vn/san-pham/ao-bong-da-thiet-ke-2026-049/`: pass on production baseline.
- Production cache header and Cloudflare status still need verification after the unrelated build blocker is cleared and this tenant can be deployed.
