# Báo cáo SEO và cutover x24sport.vn

## Cập nhật sau cutover 17/07/2026 22:50 GMT+7

Trạng thái hiện tại: **x24sport.vn đã chạy Next.js/Payload production**.

- `x24sport.vn` đã trỏ proxy về `next-x24sport` tại `10.10.0.58:3010`.
- Build production dùng `NEXT_PUBLIC_SITE_URL=https://x24sport.vn` và `SITE_ENV=production`.
- `robots.txt` production mở crawl và sitemap trỏ `https://x24sport.vn/sitemap.xml`.
- `next.x24sport.vn` vẫn được giữ `X-Robots-Tag: noindex, nofollow`.
- `wp.x24sport.vn` đã có Nginx route về WordPress cũ và trả `X-Robots-Tag: noindex, nofollow`; Cloudflare DNS đã tạo CNAME proxied `wp.x24sport.vn -> x24sport.vn`.
- Favicon/header/schema logo đã đổi sang asset logo X24 tại `/images/brand/x24-logo.png`; `/icon.png` và `/apple-icon.png` đã được tạo từ logo mới.

Các audit representative sau cutover đều PASS bằng
`.codex/skills/develop-x24sport-websites/scripts/audit_page.py`:

- `https://x24sport.vn/`
- `https://x24sport.vn/san-pham/`
- `https://x24sport.vn/danh-muc/bong-da/`
- `https://x24sport.vn/ao-thi-dau-gaming-x24-gm-079-trang-xanh-bien/`
- `https://x24sport.vn/lien-he/`

Lưu ý còn lại: đánh giá Core Web Vitals thực tế vẫn cần field data sau khi site
có traffic production; DNS `wp.x24sport.vn` có thể cần thời gian propagation tùy
resolver.

---

# Báo cáo sẵn sàng next.x24sport.vn

Ngày kiểm tra: 17/07/2026 (Asia/Ho_Chi_Minh)  
Phạm vi: preview `next.x24sport.vn`, tenant Payload `x24sport`, và hợp đồng URL công khai hiện tại của `x24sport.vn`.  
Kết luận: **SẴN SÀNG CÓ ĐIỀU KIỆN (CONDITIONAL GO)**. Preview đã đủ để nghiệm thu, nhưng không được chuyển traffic nguyên trạng vì đang chủ động `noindex`. Trước cutover phải chạy delta dữ liệu và đổi cấu hình hostname/indexing theo checklist cuối báo cáo.

## 1. Tóm tắt kết quả

| Hạng mục | Trạng thái | Bằng chứng chính |
|---|---|---|
| Catalog | PASS | 694/694 sản phẩm nguồn có trong CMS; không thiếu/thừa/đụng slug, legacy path hoặc source ID |
| Danh mục | PASS | 100/100 URL danh mục nguồn trả 200; trang chủ dùng 9 nhóm có URL riêng, gồm Gaming, Bi-a và Đồng Phục |
| Bài viết | PASS | 24/24 bài đã chuyển vào `web-content`; chạy lại migration cho kết quả 24 unchanged, 0 failed |
| Media | PASS | 1.040/1.040 URL media CMS trả 200; không thiếu URL, alt, kích thước hoặc trùng source ID |
| Hợp đồng URL | PASS có chủ đích | 966 URL nguồn: 820 trả 200 trực tiếp, 50 redirect, 96 URL demo/theme/hệ thống cũ trả 404 có chủ đích |
| Technical SEO | PASS cho preview | Canonical, metadata, sitemap, robots, breadcrumb và JSON-LD đã triển khai; preview vẫn bị chặn index đúng chủ đích |
| Accessibility | PASS | Lighthouse: 100/100 trên trang chủ và danh sách blog; không tràn ngang ở viewport mobile/desktop đã kiểm tra |
| Best practices | PASS | Lighthouse 100/100; HTTPS, security headers, không lộ `X-Powered-By` |
| Performance | PASS trong lab / CONDITIONAL ngoài thực tế | Font giảm từ 4,91 MB xuống 383 KB; lượt Lighthouse mobile mới nhất của homepage đạt 99, catalog 96, product 94 và blog 81. Chưa có CrUX field data |
| Cutover | CHƯA THỰC HIỆN | Phải chạy delta, build production hostname, bỏ preview noindex và kiểm tra sau DNS/proxy switch |

## 2. Đối soát dữ liệu

- Sản phẩm WordPress: 694; sản phẩm tenant CMS: 694; thiếu 0; thừa 0.
- Tất cả sản phẩm ở trạng thái published và có `legacyPath`, gallery, giá/giá liên hệ.
- 175 sản phẩm có giá số bằng 0 được hiển thị **Liên hệ**; không phát `Offer` giả trong Product JSON-LD.
- 1 sản phẩm nguồn chưa có danh mục: source ID 1882, “Quần Áo Bóng Đá Câu Lạc Bộ Inter Milan 24/25”. Đây là lỗi dữ liệu nguồn cần biên tập, không phải lỗi migration.
- Đã tạo 3 danh mục tenant thật, có URL độc lập và quan hệ sản phẩm: Gaming 2 sản phẩm, Bi-a 0 sản phẩm, Đồng Phục 211 sản phẩm. Bi-a giữ empty state thay vì gán nhầm sản phẩm không đúng dữ liệu nguồn.
- 24 bài viết đã nhập vào tenant và giữ nguyên slug công khai. Migration idempotent: `created=0 updated=0 unchanged=24 failed=0` ở lần chạy xác nhận.
- Snapshot nội dung nguồn: `cms-api/artifacts/x24sport-content-20260717/`.

## 3. Hợp đồng URL và thất thoát

Nguồn sitemap có 966 URL. Kết quả crawl HTTP đầy đủ:

| Nhóm | Tổng | 200 | Redirect | 404 có chủ đích |
|---|---:|---:|---:|---:|
| Product | 695 | 694 | 1 (`/shop/`) | 0 |
| Product category | 100 | 100 | 0 | 0 |
| Post/blog | 25 | 25 | 0 | 0 |
| Product tag | 45 | 0 | 45 → `/san-pham/` | 0 |
| Post category + author | 3 | 0 | 3 → `/blog/` | 0 |
| WordPress pages | 77 | 1 | 1 (`/shop/`) | 75 |
| Blocks/featured demo content | 21 | 0 | 0 | 21 |

96 URL 404 là trang demo Flatsome, block/template nội bộ, cart/checkout/account/test cũ; chúng không đại diện cho sản phẩm, danh mục hoặc nội dung kinh doanh thật. Giữ 404 là tín hiệu gỡ bỏ hợp lệ, tránh chuyển hướng hàng loạt không liên quan. Danh sách có thể tái kiểm tra bằng `scripts/readiness_url_audit.rb`.

## 4. SEO checklist

- [x] HTTPS duy nhất; HTTP trả 301 sang HTTPS.
- [x] Canonical tự tham chiếu cho homepage, danh mục, sản phẩm, bài viết và trang phân trang.
- [x] Search/filter nội bộ dùng `noindex,follow` và canonical về catalog chuẩn.
- [x] Title không lặp thương hiệu; description được chuẩn hóa và giới hạn khoảng 155 ký tự.
- [x] Mỗi template có đúng một H1; cấu trúc heading nội dung được giữ lại.
- [x] Sitemap hiện có 730 URL: trang chính, catalog, blog, 9 nhóm bộ môn, 694 sản phẩm và 24 bài viết; 718 URL có `lastmod`.
- [x] Product JSON-LD chỉ phát Offer khi có giá thực; không tạo rating/review giả.
- [x] Article, Organization, WebSite và BreadcrumbList JSON-LD parse hợp lệ.
- [x] Trang phân trang có canonical riêng; trang vượt giới hạn trả 404.
- [x] Preview có cả meta robots, `robots.txt` và `X-Robots-Tag` chặn index.
- [ ] Sau cutover phải xác minh lại canonical/OG/schema/sitemap chỉ dùng `https://x24sport.vn` và mở robots.
- [ ] Gửi sitemap mới trong Google Search Console sau cutover; theo dõi Page Indexing/CWV, không hứa hẹn ranking hoặc rich result.

## 5. Performance checklist

- [x] Subset đủ Vietnamese/Latin cho 5 font SF Pro Display: 4.907.288 B → 382.768 B.
- [x] Ảnh hero/LCP và ảnh đầu catalog có ưu tiên tải; ảnh catalog/product có responsive `srcset`.
- [x] Next static assets cache immutable 1 năm; trang prerender dùng stale-while-revalidate.
- [x] CLS gần 0 và TBT thấp (22–45 ms trong các lượt representative).
- [x] Tổng byte trang giảm còn khoảng 0,5–0,9 MB tùy template.
- [x] Lượt Lighthouse mobile mới nhất của homepage: Performance 99, Accessibility 100, Best Practices 100, FCP 1,24 giây, LCP 2,18 giây, TBT 46 ms, CLS 0,0002.
- [x] Các template representative khác: catalog 96, product 94, blog 81; CLS gần 0 và TBT thấp.
- [ ] Không có dữ liệu người dùng thật CrUX cho preview; đánh giá CWV cuối cùng phải dựa trên field data sau khi có traffic. Các lượt lab có thể biến động theo latency mô phỏng, nên sau cutover vẫn phải theo dõi field LCP 28 ngày.

## 6. Giao diện và accessibility

- [x] Kiểm tra responsive desktop/mobile, không có horizontal overflow và không có ảnh hỏng.
- [x] Điều hướng desktop/mobile, skip link, focus-visible và target cảm ứng đã có.
- [x] 9 ô bộ môn/sản phẩm trên trang chủ, gồm Gaming, Bi-a và Đồng Phục; không còn hàng 3 sản phẩm nhỏ cũ.
- [x] Empty state, tìm kiếm, sort và pagination hoạt động.
- [x] Giá 0 không hiển thị “0 ₫”; thay bằng “Liên hệ”.
- [x] Lighthouse accessibility 100 cho homepage/blog sau sửa alt ảnh trang trí.
- [ ] Nghiệm thu nội dung cuối cùng với chủ website trên thiết bị iOS/Android thực trước cutover.

## 7. Hạ tầng, an toàn và rollback

- App: `root@10.10.0.58`, `/root/websites/next.x24sport.vn`, container `next-x24sport`, port 3010.
- Proxy: `root@10.10.0.56`, `/etc/nginx/conf.d/next.x24sport.vn.conf`.
- CMS: `root@10.10.0.28`, tenant `x24sport`; database backup nằm trên database host nội bộ.
- Build production trên server thành công; container healthy; không restart CMS hoặc WordPress.
- Header đã xác minh: HSTS, CSP tối thiểu, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, X-Frame-Options.
- Cloudflare Managed `robots.txt` đã tắt và cache URL đã purge; preview hiện chỉ trả đúng `User-Agent: * / Disallow: /`. Cấu hình trước thay đổi đã được lưu cùng backup local.

Backups chính:

- Local source: `x24sport.vn/backups/readiness-20260717-0800/`.
- App trước các vòng deploy: `/root/backups/next.x24sport.vn-readiness-*` trên `10.10.0.58`, gồm round 1–4.
- Proxy: `/root/backups/next.x24sport.vn.conf-readiness-20260717-0815` trên `10.10.0.56`.
- CMS source: `/root/sports-cms/backups/sports-cms-before-x24-content-20260717-0830.tgz` trên `10.10.0.28`.
- DB: `/root/web-content-before-x24-20260717-0830.dump` trên database host.
- App trước cập nhật danh mục/trang chủ: `/root/backups/next.x24sport.vn-home-categories-20260717-0925` trên `10.10.0.58`.
- DB trước khi tạo 3 danh mục mới: `/root/sports-cms-before-x24-categories-20260717-0900.dump` trên database host.

## 8. Checklist cutover bắt buộc

1. Đóng băng nội dung nguồn hoặc ghi mốc thời gian; snapshot lại WordPress và CMS.
2. Chạy **delta reconciliation** từ lần snapshot 17/07/2026 đến thời điểm chuyển đổi; yêu cầu thiếu/thừa/collision = 0.
3. Backup app, proxy, CMS database và cấu hình WordPress ngay trước cutover; kiểm tra file backup đọc được.
4. Build frontend với `NEXT_PUBLIC_SITE_URL=https://x24sport.vn` và `SITE_ENV=production`.
5. Đổi proxy/DNS cho `x24sport.vn`; không xóa hoặc ghi đè WordPress nguồn trong cửa sổ rollback.
6. Bỏ `X-Robots-Tag: noindex`, xác minh `robots.txt` cho crawl và sitemap trỏ hostname production.
7. Crawl lại toàn bộ URL contract: 694 product + 100 category + 24 post phải 200; redirect phải một bước; không có redirect loop/5xx.
8. Kiểm tra canonical, title, description, Open Graph và JSON-LD trên từng template representative.
9. Chạy Lighthouse mobile/desktop ít nhất homepage, catalog, category, product và article; lưu median 3 lượt.
10. Smoke test tìm kiếm, phân trang, hotline/contact, mobile nav, ảnh CDN, 404 và URL tiếng Việt.
11. Gửi sitemap trong Search Console và theo dõi log 404/5xx, index coverage, CWV trong 24 giờ, 7 ngày và 28 ngày.
12. Rollback về proxy/WordPress cũ nếu xuất hiện 5xx diện rộng, mất catalog/dữ liệu, redirect loop hoặc lỗi chức năng chặn người dùng.

## 9. Lệnh xác minh tái sử dụng

```bash
cd /Users/hoang/hacado/x24sport_websites/x24sport.vn
pnpm typecheck
ruby scripts/readiness_url_audit.rb
curl -I http://next.x24sport.vn/
curl -I https://next.x24sport.vn/
curl https://next.x24sport.vn/robots.txt
curl https://next.x24sport.vn/sitemap.xml
```
