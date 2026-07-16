# Mayaobongro.vn production readiness handoff

Date: 2026-07-11

## Scope completed

- Corrected homepage/schema identity from running apparel to basketball apparel.
- Added a single homepage H1 for the production front page.
- Noindexed demo/test pages while preserving the real homepage.
- Generated a clean static `sitemap.xml` with 713 crawlable URLs.
- Reduced bad legacy sitemap crawl paths by returning `410` for numbered sitemap files.
- Redirected common sitemap index URLs to the canonical HTTPS sitemap.
- Hardened sensitive WordPress endpoints: `readme.html`, `wp-admin/install.php`, `wp-config.php`, `.git`, `.htaccess`.
- Added FastCGI cache visibility through `X-FastCGI-Cache`.
- Added WooCommerce cache bypass rules for cart, checkout, account, Woo cookies, and API paths.
- Enabled Cloudflare Always Use HTTPS through the Cloudflare API.
- Created Cloudflare Cache Rules ruleset `fd481d55d6c6479ab3574522c231ffc9`.
- Added Cloudflare cache bypass rule for WooCommerce dynamic paths, admin/login, AJAX, and session cookies.
- Added Cloudflare static asset cache rule for common image, CSS, JS, font, video, and PDF extensions with 30-day edge/browser TTL.
- Purged Cloudflare cache after sitemap/robots and HTTPS changes.
- Restricted local `.env` secret file permissions to `600`.

## Backups

- Theme backup on server: `/root/websites/sites/mayaobongro.vn/wp-content/themes/flatsome-child/functions.php.bak-production-readiness-`
- Nginx backup on server: `/root/websites/nginx/sites/mayaobongro.vn.conf.bak-production-readiness-`
- DB/options backup: `/var/www/mayaobongro.vn/wp-content/uploads/codex-ops/production-readiness-20260711/backups/20260711-081830`
- Static sitemap/robots backup: `/var/www/mayaobongro.vn/wp-content/uploads/codex-ops/production-readiness-20260711/backups/static-sitemap-20260711-083236`

## Verification snapshot

- Homepage: `200`, `X-FastCGI-Cache: HIT`, warm TTFB about `0.24s`.
- Shop: `200`, `X-FastCGI-Cache: HIT`, warm TTFB about `0.25s`.
- Cart: `200`, `X-FastCGI-Cache: BYPASS`, private/no-store cache headers.
- Checkout: `302` to cart when empty, `X-FastCGI-Cache: BYPASS`.
- Cloudflare Cache Rules: static `.webp` and CSS requests warm from `cf-cache-status: MISS` to `HIT`.
- Cloudflare Cache Rules: cart, checkout, and login remain `cf-cache-status: DYNAMIC` with `X-FastCGI-Cache: BYPASS`.
- `sitemap.xml`: `200`, 713 `<loc>` entries, no `/shops/`, `/demos/`, `/elements/`, `/test/`, `/trang-mau/`.
- `sitemap1.xml` and `sitemap_1.xml`: `410`.
- `sitemap_index.xml`: `301` to `https://mayaobongro.vn/sitemap.xml`.
- `readme.html` and `wp-admin/install.php`: `403`.
- `http://mayaobongro.vn/`: `301` redirect to HTTPS.
- Cloudflare settings confirmed: SSL `full`, Brotli `on`, HTTP/3 `on`, Automatic HTTPS Rewrites `on`, Always Use HTTPS `on`.
- Homepage HTML still heavy: about 659 KB, 350 images, 100 style blocks.

## Remaining production blockers

1. Cloudflare Managed robots.txt still prepends AI bot blocks for `GPTBot`, `ClaudeBot`, `Google-Extended`, and others on the public `robots.txt`.
2. The new Cloudflare API token can edit standard zone settings, purge cache, and read the zone, but Cloudflare's public zone settings API does not expose the Managed robots.txt toggle as a normal `/settings` value. The setting still needs to be turned off in the Cloudflare dashboard unless a product-specific endpoint becomes available.
3. Homepage weight remains too high for aggressive Core Web Vitals wins; image and page-builder cleanup should be the next implementation phase.

## Keyword plan

### Priority money pages

- `may áo bóng rổ`
- `áo bóng rổ thiết kế`
- `áo bóng rổ thiết kế theo yêu cầu`
- `đồng phục bóng rổ`
- `đặt áo bóng rổ`
- `xưởng may áo bóng rổ`
- `quần áo bóng rổ thiết kế`
- `bộ quần áo bóng rổ`

### Supporting commercial clusters

- `may áo bóng rổ tphcm`
- `may áo bóng rổ hà nội`
- `in áo bóng rổ theo yêu cầu`
- `may đồng phục bóng rổ cho trường học`
- `may áo bóng rổ cho clb`
- `áo bóng rổ 3x3`
- `áo bóng rổ trẻ em`
- `áo bóng rổ học sinh`
- `áo bóng rổ sát nách`
- `áo bóng rổ có tay`

### Image visibility plan

- Every product image needs descriptive alt text with product type, color, code, and use case.
- Create indexable gallery/category pages for: mẫu áo bóng rổ đẹp, áo bóng rổ gradient, áo bóng rổ trẻ em, áo bóng rổ học sinh, áo bóng rổ 3x3, logo đội bóng rổ.
- Use real product images, not repeated placeholders, and avoid overloading the homepage with all images at once.
- Add image sitemap entries once image filenames/alt text are cleaned.

## Suggested next sequence

1. Fix Cloudflare Managed robots.txt.
2. Optimize homepage weight: remove duplicate sections, lazyload/offscreen images, reduce inline style blocks, compress/resize priority images.
3. Build/strengthen 8 priority landing pages mapped to money keywords.
4. Bulk audit product image alt text and filenames, then regenerate image sitemap.
5. Run Search Console submission for `sitemap.xml` and request indexing for priority pages.
