# Product Handoff Contract

Manifest chuyển accepted images vào `create-tenant-product`. Dùng `schemaVersion: "1.0"`, `producerSkill: "tao-anh-dong-phuc-cong-ty-doanh-nghiep"`, absolute WebP paths và SHA-256 của đúng file WebP Q100.

`publishingIntent` cố định `tenantSlug: "mayaodongphuc"`, `domain: "mayaodongphuc.com.vn"`, `categorySlug: "dong-phuc-cong-ty"`, `pricingMode: "quote-only"`, `isPurchasable: false`, `stockStatus: "instock"`, `currency: "VND"`; chỉ `action` thay đổi giữa `publish`, `draft`, `images-only`.

Default `acceptedImages` có chính xác ba ảnh theo thứ tự: `product hero` (1:1, gallery), `content-inline lifestyle` (1:1, gallery + content order 1), `content-inline catalog` (5:4, gallery + content order 2). Mỗi image cần path, sha256, role, aspectRatio, modelCount, shopper-meaningful `altSeed`, distinct buyer-facing `captionSeed`, visualTags, productPlacement, overlay.

`garmentFacts` phải nêu productType, collar, sleeves, fit, colors, pattern, approvedArtwork, removedArtwork và visibleSides. `sourceTransformations` rỗng trừ áo sát nách: ghi chuyển từ `áo ba lỗ hoặc khoét nách sâu` sang `tay ngắn set-in`, reason `chuẩn hóa đồng phục công ty/doanh nghiệp`.

`altSeed` mô tả áo và workplace/service context; `captionSeed` giải thích lợi ích mua hàng. Không mở đầu bằng `Ảnh chụp`, `Hình ảnh`, `Bảng catalog`, `Poster`, model count hoặc copy y nguyên alt. Không nêu công ty thật nếu chưa được người dùng cấp phép. `featureLock` chỉ dùng facts/claims đã cho phép trong output contract; `unsupportedClaims` phải gồm composition, GSM, named print process, wash count, fixed delivery time và fixed price. `consumerPolicy.visualInspection` luôn là `not-required-after-validation`.
