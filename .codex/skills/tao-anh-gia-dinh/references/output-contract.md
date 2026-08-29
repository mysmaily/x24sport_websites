# Output Contract

## Deliverables

| Role | File | Yêu cầu |
|---|---|---|
| Print master | `<SKU>.png` | PNG RGB, nền `#FFFFFF`, 4500x4500 px, 300 DPI, artwork và exact text, không áo/người thật/watermark |
| Marketing | `<SKU>-marketing.webp` | WebP Q100, vuông >=1200 px, ảnh chụp áo thật có brand signature Mayaodongphuc, SKU/contact đúng |
| Family lifestyle | `<SKU>-family-lifestyle.webp` | WebP Q100, vuông >=1200 px, gia đình Việt Nam mặc đúng mẫu áo |
| Print preview | `<SKU>-print-preview.webp` | WebP Q100, đúng 500x500 px, crop/resize từ print master |

CMS chỉ nhận ba WebP theo thứ tự: marketing, family lifestyle, print preview. Không upload print master PNG 4500px.

## Category

- Danh mục mặc định: `Đồng phục gia đình`.
- Slug mặc định: `dong-phuc-gia-dinh`.
- Lưu kho print master vào `/Volumes/Data/x24_project/mayaodongphuc.com.vn/dong-phuc-gia-dinh/<SKU>.png`.
- Khi publish, nếu category chưa tồn tại trong CMS cho tenant `mayaodongphuc`, phải tạo/ensure category tenant-scoped trước; không thay bằng `dong-phuc-ngo-nghinh` hoặc danh mục học sinh.

## Family Lifestyle Cast

- Gia đình thường: random ổn định 3-5 người.
- Gia đình ba thế hệ: random ổn định 5-7 người.
- Dải tuổi phải hợp bối cảnh gia đình, gồm trẻ em an toàn và người lớn/ông bà khi áp dụng.
- Không tạo ảnh học sinh, lớp học, công ty hoặc team-building cho chủ đề gia đình.

## Visual Gates

Print master phải có bốn góc trắng thuần, đúng text có dấu và không bị crop.

Marketing phải là ảnh áo thật: thấy texture, cổ bo, đường may, nếp vải, bóng tiếp xúc; artwork đúng master, không có khung trắng và không quá 48% thân áo.

Family lifestyle phải là ảnh gia đình rõ vai: cùng áo, cùng màu, cùng artwork, ít nhất hai mặt trước đọc rõ, logo/rail/hotline đúng, không sai số người hoặc sai ngữ cảnh.
