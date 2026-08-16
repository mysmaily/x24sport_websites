# May Áo Đồng Phục V3 — Belonging Studio

## North star

Một catalog đồng phục mang cảm giác như tạp chí thiết kế và xưởng may đương đại: giàu nhịp điệu, có chất thủ công, nhưng mua sắm vẫn nhanh và rõ. Không dùng cấu trúc hay dấu hiệu thị giác của tám tenant thể thao hiện tại.

## Design dials

- Density: 4/10 — đủ thoáng cho editorial, vẫn đưa catalog vào viewport đầu.
- Variance: 8/10 — bố cục bất đối xứng có kiểm soát; không dùng ba card bằng nhau.
- Motion: 6/10 — vào trang theo nhịp opacity/transform; hover tiết chế; hỗ trợ reduced motion.

## Color system

- Canvas Bone: `#F4F1EA`
- Surface Paper: `#FBF9F4`
- Ink: `#1A1B18` — tuyệt đối không dùng pure black.
- Muted Ink: `#666861`
- Hairline: `rgba(26, 27, 24, 0.18)`
- Single accent, Oxide Clay: `#A9573B`

Chỉ Oxide Clay được dùng làm màu tương tác/nhấn. Không neon, không tím, không gradient trang trí, không thêm màu accent cạnh tranh.

## Typography

- Display: Instrument Serif — tiêu đề editorial, trọng lượng regular, tracking âm nhẹ.
- Body/UI: Geist — rõ trên màn hình và tiếng Việt.
- Utility: Geist Mono — mã sản phẩm, số chương, chú thích kỹ thuật.
- Hero phải có hình ảnh ngữ cảnh nằm trực tiếp trong dòng tiêu đề ở desktop. Ở mobile, ảnh tách thành khối ngay dưới tiêu đề để giữ khả năng đọc.
- H1 sản phẩm: 20px mobile, 22px desktop, ngay sau breadcrumb.
- Tên product card: 18px.

## Layout grammar

- Khung nội dung tối đa 1440px, lề desktop 32–52px, mobile 14–20px.
- Hero bất đối xứng: dòng chữ là bố cục chính, ảnh inline là chữ ký, chỉ một CTA chính.
- Danh mục dùng nhịp 2 cột lệch và các khối tỷ lệ khác nhau; cấm ba card bằng nhau.
- Catalog giữ hàng filter cao 40px, cuộn ngang trên mobile; hàng sản phẩm đầu xuất hiện trong viewport 390×844 và 1440×900.
- Chi tiết sản phẩm dùng gallery vuông `object-fit: contain`, PhotoSwipe và panel cấu hình gọn.
- Bề mặt phẳng, viền tóc; không glassmorphism, không bóng dày, không bo tròn quá mức.

## Components

- Primary CTA: nền Oxide Clay, chữ Paper, góc 0–2px, cao tối thiểu 46px.
- Links: gạch chân hoặc arrow dịch chuyển bằng transform; focus ring Oxide Clay rõ.
- Cards: nền Paper, border hairline, không shadow; ảnh sản phẩm contain.
- Form: label luôn hiện, required được đánh dấu, trường cao tối thiểu 46px, báo lỗi inline và phản hồi sau submit.
- Mobile controls: vùng chạm tối thiểu 44px.

## Motion

- Chỉ animate `opacity` và `transform`.
- Reveal: 420–620ms, easing `cubic-bezier(.2,.75,.2,1)`, stagger 60ms.
- Status mark có pulse opacity nhẹ; dừng hoàn toàn khi `prefers-reduced-motion: reduce`.
- Không layout shift, không parallax, không scale làm vỡ nhịp.

## Content voice

Ngắn, cụ thể, có chiều sâu. Nói về người mặc, vai trò, cảm giác sử dụng và cách hình ảnh chung được hình thành. Không nói bằng ngôn ngữ CMS, SEO, AI hoặc kỹ thuật nội bộ.

## Accessibility and responsive contract

- Contrast tối thiểu WCAG AA; focus visible; có skip link; điều hướng và form dùng semantic HTML.
- Không che nội dung bằng sticky header; có scroll margin cho anchor.
- Desktop kiểm tra 1440×900; mobile 390×844; không horizontal overflow.
- Tablet collapse từ grid bất đối xứng thành 2 cột; mobile thành một luồng rõ ràng, trừ product grid được phép 2 cột để duyệt nhanh.
