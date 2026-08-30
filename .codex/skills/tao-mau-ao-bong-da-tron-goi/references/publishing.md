# Handoff và đăng sản phẩm

Chỉ đọc khi người dùng yêu cầu tạo nháp hoặc đăng sản phẩm. Workflow mặc định vẫn là `images-only`.

- Đọc profile domain `mayaobongda.vn/AGENTS.md` và `PAYLOAD-REST-API-GUIDE.md`.
- Dùng `create-tenant-product` làm publisher; không gọi legacy publisher của `football-mockup-convert`.
- Resolve tenant bằng slug `mayaobongda` lúc chạy; không hard-code numeric IDs.
- Dùng SKU `X24-BD-FFHHDD` đã cấp, không tạo SKU mới.
- Thứ tự gallery public mặc định: sales image làm hero, mockup/phối áo thứ hai,
  team photo thứ ba. Cả ba ảnh phải hiển thị đúng `mayaobongda.vn` và
  `0989 353 247`; không upload bản mockup/team photo sạch contact.
- Không upload hai PNG print master canonical lên CMS.
- Product title/copy phải viết lại tự nhiên; không sao chép title seller nguồn và không nhắc AI, mockup, CMS hoặc cache trong public copy.
- Mọi upload/create/update phải tenant-scoped, idempotent và được kiểm tra public URL sau cache window của profile.

## Metadata mặc định

- Giá tham khảo: `125000` VND; regular/compare-at `139000` khi tenant vẫn dùng cấu hình này.
- Mẫu original/custom: `Mẫu áo bóng đá thiết kế riêng <tên concept hoặc màu chính>`.
- Club reference khi được phép: `Áo CLB <Club> Sân Nhà|Sân Khách|Mẫu Thứ Ba <season> <màu khi cần phân biệt>`.
- National team: `Áo đội tuyển <Team> <season> <variant/màu>`.
- ALT mô tả nội dung thật: front/back shirts, shorts, màu, season/variant khi có và `mayaobongda.vn`; không nhắc socks nếu chỉ xuất hiện trên model.
- Public copy nên có overview, design identity, khả năng đổi logo/tên/số/màu, chất vải/form, công nghệ in, giá tham khảo, quy trình đặt và FAQ.
- Không tự bịa club, season, sponsor hoặc quyền sử dụng khi source không đủ bằng chứng.

Nếu người dùng chưa yêu cầu publish, chỉ chuẩn bị metadata/handoff và báo `publishingIntent.action = images-only`.
