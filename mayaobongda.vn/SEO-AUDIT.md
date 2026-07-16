# mayaobongda.vn SEO & Performance Audit

Date: 2026-07-03 15:10 GMT+7
Scope: read-only audit of public/origin behavior, homepage, one product URL, one product category URL, robots/sitemap, headers, and Lighthouse lab data.

## Scores

| Area | Score | Evidence |
|---|---:|---|
| SEO | 72/100 | Good Yoast basics, but host canonical defects, missing H1s, sitemap thin/demo entries, missing product meta descriptions. |
| Performance mobile | 62/100 | Lighthouse mobile: FCP 4.9s, LCP 7.6s, TBT 50ms, CLS 0, total payload 10,743 KiB. |
| Performance desktop | 89/100 | Lighthouse desktop: FCP 1.2s, LCP 1.8s, TBT 0ms, CLS 0.027, total payload 11,007 KiB. |
| Accessibility | 76/100 mobile, 80/100 desktop | Missing alt/access names, contrast issues, heading order, small touch targets. |
| Best practices | 92/100 | Console JS error and missing security headers remain. |

## URL Matrix

| URL/template | Evidence | Expected | Actual | Priority | Status |
|---|---|---|---|---|---|
| Homepage `https://mayaobongda.vn/` | HTTP 200, canonical self, robots index, Lighthouse SEO 92 | Indexable HTTPS canonical with one H1 | Indexable and cached, but `h1_count=0` | P1 | Open |
| HTTP homepage `http://mayaobongda.vn/` | `curl -I` returns 200 | 301 to HTTPS canonical | HTTP remains 200 | P0 | Open |
| WWW homepage `https://www.mayaobongda.vn/` | `curl -I` returns 301 to `https://338vietnam.com/` | 301 to `https://mayaobongda.vn/` | Redirects to another domain | P0 | Open |
| Product `https://mayaobongda.vn/ao-bong-da-thiet-ke-vintage-mabd-62/` | HTTP 200, canonical self, H1 present, Product schema present | Indexable product with description, price, availability schema | Product page lacks meta description; schema has Product/Offer | P1 | Open |
| Product category `https://mayaobongda.vn/ao-thiet-ke/` | HTTP 200, canonical self, robots index | Category should have clear H1 and crawlable product links | `h1_count=0`; otherwise indexable | P1 | Open |
| Robots/sitemap | `robots.txt` 200; `sitemap_index.xml` 200 | Sitemap declares canonical indexable URLs only | Includes `blocks`, `featured_item`, `featured_item_category`, author and product_tag sitemaps requiring audit | P1 | Open |
| Static CDN image | `cdn.mayaobongda.vn` sample image 200, `cache-control: max-age=14400`, `cf-cache-status: MISS` | Long browser cache and repeat edge HIT for static assets | TTL short for immutable product image; edge MISS observed | P1 | Open |

## Key Findings

1. P0: `http://mayaobongda.vn/` does not redirect to HTTPS. This creates duplicate URL variants.
2. P0: `https://www.mayaobongda.vn/` redirects to `https://338vietnam.com/`, which is a cross-domain canonical/routing defect.
3. P1: Homepage and product category pages have no H1.
4. P1: Mobile performance is weak because LCP is 7.6s and transferred payload is over 10MB.
5. P1: CDN/static image cache policy is weak for immutable-looking uploaded assets: sample image uses `max-age=14400` and returned `cf-cache-status: MISS`.
6. P1: Sitemap includes likely thin/demo post types and taxonomies: `blocks`, `featured_item`, `featured_item_category`, plus author/product_tag need value-based audit.
7. P1: Security headers are missing on the homepage response: HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, and Permissions-Policy were not observed.
8. P2: Homepage schema uses dummy primary image `dummy-1.jpg`; replace with a real crawlable brand/homepage image.
9. P2: Product sample has Product schema and Offer data, but no meta description.
10. P2: Accessibility issues include missing alt on Zalo icon, social links with `href="#"` and no accessible names, insufficient contrast, heading order issues, and unsized footer/payment images.

## Measurements

| Check | Result |
|---|---|
| Homepage public HTML size | 233,814 bytes |
| Homepage curl cold/warm | TTFB 0.374s/0.223s, total 0.524s/0.351s |
| Product sample curl | TTFB 1.430s, total 1.517s, 123,533 bytes |
| Category sample curl | TTFB 1.472s, total 1.625s, 168,334 bytes |
| Homepage cache | `x-fastcgi-cache: HIT`, `cf-cache-status: DYNAMIC` |
| Compression | Brotli present with `Accept-Encoding: gzip, br` |
| WordPress records | 250 published products, 77 published pages, 2 published posts, 10 `blocks`, 8 `featured_item` |

## Recommended Order

1. Fix host redirects: force HTTP to HTTPS and fix `www` to canonical `https://mayaobongda.vn/`.
2. Add one meaningful H1 to homepage and product category templates without duplicating hidden titles.
3. Audit and remove/noindex demo/thin sitemap entries only after confirming their value.
4. Optimize mobile LCP and images: identify LCP asset, resize/compress hero/product images, ensure dimensions, and avoid lazy-loading the LCP image.
5. Improve CDN/static cache policy for versioned uploads and verify repeat request HIT.
6. Add missing security headers at the correct proxy/origin layer.
7. Clean up schema primary image, product meta descriptions, image alt/access names, social links, contrast, and heading order.

## Implementation Result - 2026-07-03

### Applied and verified

| Change | Result |
|---|---|
| `www` canonical host | `https://www.mayaobongda.vn/` now returns `301` to `https://mayaobongda.vn/`. |
| Security headers | HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy and Permissions-Policy are present publicly. |
| WooCommerce FastCGI bypass | Cart, checkout, account, login and WooCommerce session cookies now bypass site FastCGI cache. |
| Static origin cache policy | Versionable static extensions now receive one-year immutable browser cache headers at the site origin. |
| Homepage H1 | Homepage now has exactly one visible H1: `May áo bóng đá thiết kế trực tiếp tại xưởng`. |
| Product category H1 | Product category sample now has exactly one H1: `Áo Thiết Kế`. |
| Product meta description | Product sample now receives a 155-character fallback description when Yoast metadata is empty. |
| Sitemap hygiene | `blocks`, `featured_item` and `featured_item_category` sitemaps are removed. |
| Homepage schema image | Dummy `dummy-1.jpg` was replaced by the verified site logo in `thumbnailUrl` and primary `ImageObject`. |
| Footer/accessibility | Iframes have titles; payment/footer images have useful alt text and dimensions; social links use real URLs and accessible names; the Zalo widget image receives alt text. |
| JavaScript error | Category loader now exits safely when its target elements are absent; Lighthouse no longer reports the previous null `innerHTML` exception. |

### Lighthouse comparison

Lighthouse is lab data and varies between runs. The table uses the final comparable run after warming the site cache.

| Metric | Before | After |
|---|---:|---:|
| Mobile Performance | 62 | 64 |
| Mobile SEO | 92 | 100 |
| Mobile Accessibility | 76 | 91 |
| Mobile Best Practices | 92 | 96 |
| Mobile FCP | 4.9s | 4.4s |
| Mobile LCP | 7.6s | 6.3s |
| Desktop Performance | 89 | 91 |
| Desktop SEO | 92 | 100 |
| Desktop Accessibility | 80 | 91 |
| Desktop Best Practices | 92 | 96 |
| Desktop LCP | 1.8s | 1.7s |
| Desktop CLS | 0.027 | 0.012 |

### Still open

1. Public `http://mayaobongda.vn/` can still return cached `200` HTML from Cloudflare. Origin redirect rules were not retained because Cloudflare's cache key can serve the cached HTTP redirect to HTTPS requests and cause a loop. The correct fix is Cloudflare **Always Use HTTPS** plus purge; the token assigned by the registry did not find the `mayaobongda.vn` zone.
2. CDN image responses still use `cache-control: max-age=14400`. The CDN is returning `cf-cache-status: HIT`, but browser TTL remains four hours.
3. Homepage transfer remains about 10.7 MiB. Lighthouse estimates roughly 3.6 MiB mobile image-delivery savings. Many attachment records do not expose smaller derivatives through the CDN, so changing the template image-size name alone had no effect and was reverted.
4. Remaining accessibility findings are mainly heading order (H5 in blog post widget), some contrast rules, and unnamed sticky-widget links not covered by stable plugin classes.

## Implementation Result - 2026-07-04

### Applied and verified

| Change | Result |
|---|---|
| Homepage H1 restored | H1 `May áo bóng đá thiết kế trực tiếp tại xưởng` is present in server-rendered HTML, positioned between header and hero banner. Verified: `h1_count=1`. |
| Transparent header overlap | `padding-top: 116px` added to `.home.has-transparent #main` so the hero banner is no longer hidden behind the transparent header. |
| "Xem toàn bộ" buttons | JavaScript adds `href` to anchor tags styled as buttons: first set links to `ao-khong-logo/`, second set links to `ao-thiet-ke/`. |
| "TÌM HIỂU THÊM" button | JavaScript adds `href` to `quy-trinh-may-ao-bong-da-truc-tiep-tai-xuong/`. |
| "SẢN PHẨM BÁN CHẠY NHẤT" label | JavaScript converts `<a class="button">` to `<h2>` to fix heading hierarchy. |
| Category tab buttons | `href="#"` removed, `role="button"` + `tabindex="0"` added, `preventDefault` on click. |
| Guide updated | Added sections 8.7 (H1 on key pages), 8.8 (Link/button accessibility), 8.9 (Transparent header overlap) to WEBSITE-OPTIMIZATION-GUIDE.md. |

### Lighthouse after 2026-07-04 fixes

| Metric | Before (03/07) | After (04/07) |
|---|---:|---:|
| Mobile SEO | 100 | 100 |
| Mobile Accessibility | 95 | 95 |
| H1 count | 0 | 1 |
