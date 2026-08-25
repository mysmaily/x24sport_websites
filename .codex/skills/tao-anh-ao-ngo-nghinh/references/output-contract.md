# Output Contract

## Một sản phẩm, hai ảnh gốc và một preview website

| Role | File | Yêu cầu |
|---|---|---|
| Print master | `<SKU>.png` | PNG RGB, nền `#FFFFFF`, 4500×4500 px, 300 DPI, artwork và exact text, không áo/đạo cụ/watermark |
| Marketing | `<SKU>-marketing.webp` | WebP Q100, vuông ≥1200 px, ảnh chụp áo thật nền đơn sắc, sử dụng đúng artwork master, có mã mẫu, dấu Mayaodongphuc và contact chuẩn |
| Website print preview | `<SKU>-print-preview.webp` | WebP Q100, đúng 500×500 px, crop/resize từ print master, không áo/branding/contact |

Ảnh master là nguồn thiết kế. Ảnh marketing là phần trình bày thương mại của cùng thiết kế, không phải biến thể sáng tạo thứ hai. Preview 500px là derivative dành riêng cho gallery website.

CMS chỉ được nhận marketing và website print preview. Không upload print master PNG 4500px.

## Bản lưu kho theo danh mục

- Sau khi hoàn tất kiểm tra, copy print master tới `/Volumes/Data/x24_project/mayaodongphuc.vn/<category-slug>/<SKU>.png`.
- `<category-slug>` phải là slug danh mục thật của website; sản phẩm có nhiều danh mục thì copy vào tất cả folder tương ứng.
- Kho chỉ nhận file exact `X24-DP-[0-9]{6}.png`; không nhận marketing, JPG/WebP, tên concept hoặc hậu tố khác.
- Cùng SKU và cùng bytes là thao tác idempotent. Cùng SKU nhưng bytes khác là conflict và phải dừng, không ghi đè.
- Không lưu kho nếu validator hoặc visual gate chưa đạt. Không tạo đường dẫn dưới `/Volumes/Data` khi volume chưa được mount.

## SKU gate

- SKU exact format: `X24-DP-HHSSMM`, regex `^X24-DP-[0-9]{6}$`.
- `HH` = giờ, `SS` = giây, `MM` = phút theo `Asia/Ho_Chi_Minh`; không diễn giải thành `HHMMSS`.
- Hai file của một sản phẩm phải dùng cùng SKU: `<SKU>.png` và `<SKU>-marketing.webp`.
- Ảnh marketing phải đọc rõ exact text `MÃ MẪU: <SKU>`.
- Tiêu đề và mô tả sản phẩm phải dùng cùng SKU, không cấp mã mới khi publish.

## Text gate

- So sánh từng chữ với exact text đã khóa.
- Kiểm tra dấu tiếng Việt, mã lớp, chữ số và khoảng trắng.
- Không chấp nhận chữ gần giống, thiếu dấu hoặc thêm ký tự trang trí thành chữ.
- Text trên marketing phải khớp master. Nếu tool làm drift, correction pass từ master là bắt buộc.

## Print gate

- Bốn góc và nền ngoài artwork phải trắng thuần.
- Artwork không bị crop, không có áo hoặc scene.
- Không tự gọi file raster là vector. Nếu cần SVG/PDF vector thật, đó là deliverable bổ sung và phải được yêu cầu riêng.
- 4500 px ở 300 DPI tương đương vùng vuông 15 inch; kích thước này phù hợp cho nhiều bố cục ngực áo nhưng xưởng in vẫn quyết định khổ in cuối.

## Marketing gate

- Đây phải là ảnh chụp sản phẩm chân thực, không phải hình minh họa chiếc áo. Áo cổ tròn tay ngắn, một màu nền, nhìn đủ thân áo và hai tay.
- Phải nhìn thấy cấu trúc vật lý của áo: texture vải dệt, bo cổ rib-knit, đường may vai/lai tay, mép thân, nếp vải và bóng tiếp xúc tự nhiên.
- Artwork thường chiếm 35-48% bề ngang thân áo, không chạm đường may.
- Mực in nhận texture, bóng, nếp và phối cảnh của vải.
- Không có khung nền trắng ngoài ý muốn.
- Đạo cụ và background hỗ trợ chủ đề nhưng không che áo.
- Hard reject nếu áo là silhouette/vector/paper-cut/template/3D icon, lỗ cổ là elip trắng rỗng, artwork nổi như sticker, canvas không vuông hoặc bố cục giống poster.
- Không sửa áo 2D bằng noise/texture giả; regenerate ảnh áo nền theo hướng `photorealistic ecommerce product photography`.

## Dấu thương hiệu và contact trên marketing

- Logo chuẩn: `../../tao-anh-dong-phuc-tre-em/assets/mayaodongphuc-logo.png`.
- Mã mẫu exact text: `MÃ MẪU: <SKU>`.
- Hotline exact text: `0982 254 458`.
- Website exact text: `mayaodongphuc.com.vn`.
- Dấu campaign chỉ xuất hiện một lần ngoài áo; không được in lên áo, bóp méo, đổi màu hoặc tự vẽ lại logo.
- Hotline và website phải rõ ở kích thước listing, không thiếu số, sai khoảng trắng, sai chính tả hoặc đổi domain.
- Đặt branding/contact trong khoảng trống bằng contact chip, corner panel, micro footer hoặc partial rail; tổng vùng này không quá 12% diện tích ảnh.
- Không che thân áo, tay áo, artwork hoặc biến nền ảnh thành poster quảng cáo nặng chữ.
- Luân phiên vị trí, hình dạng và màu treatment theo palette từng mẫu; tránh lặp thanh footer toàn chiều ngang cho cả batch.
- Nếu image generation làm sai logo hoặc contact, sửa riêng vùng branding hoặc composite bằng asset logo thật và font rõ; không regenerate thiết kế áo đã duyệt.
- Mặc định tạo và duyệt ảnh áo chưa branding trước, sau đó composite logo thật cùng exact SKU/hotline/website bằng công cụ raster deterministic. Không nhờ imagegen tự vẽ lại logo hoặc tự đánh máy chuỗi thương mại.

## Conversion

Ví dụ với ImageMagick:

```bash
magick source.png \
  -background white -alpha remove -alpha off \
  -filter Lanczos -resize 4500x4500 \
  -units PixelsPerInch -density 300 \
  -fuzz 3% -fill white -draw 'color 0,0 floodfill' -alpha off \
  X24-DP-HHSSMM.png

magick marketing-source.png -quality 100 X24-DP-HHSSMM-marketing.webp
```

Flood-fill từ góc chỉ chuẩn hóa vùng nền trắng liền mạch; sau conversion phải kiểm tra lại bốn góc và artwork. Giữ ảnh nguồn của tool ngoài thư mục xuất bản nếu cần truy vết; thư mục sản phẩm chỉ chứa hai deliverable cuối.
