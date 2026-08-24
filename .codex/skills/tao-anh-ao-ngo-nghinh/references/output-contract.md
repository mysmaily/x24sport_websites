# Output Contract

## Một sản phẩm, hai ảnh

| Role | File | Yêu cầu |
|---|---|---|
| Print master | `<slug>-print-master.png` | PNG RGB, nền `#FFFFFF`, 4500×4500 px, 300 DPI, artwork và exact text, không áo/đạo cụ/watermark |
| Marketing | `<slug>-marketing.webp` | WebP Q100, vuông ≥1200 px, một áo nền đơn sắc, sử dụng đúng artwork master |

Ảnh master là nguồn thiết kế. Ảnh marketing là phần trình bày thương mại của cùng thiết kế, không phải biến thể sáng tạo thứ hai.

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

- Áo cổ tròn tay ngắn, một màu nền, nhìn đủ thân áo và hai tay.
- Artwork thường chiếm 35-48% bề ngang thân áo, không chạm đường may.
- Mực in nhận texture, bóng, nếp và phối cảnh của vải.
- Không có khung nền trắng ngoài ý muốn.
- Đạo cụ và background hỗ trợ chủ đề nhưng không che áo.

## Conversion

Ví dụ với ImageMagick:

```bash
magick source.png \
  -background white -alpha remove -alpha off \
  -filter Lanczos -resize 4500x4500 \
  -units PixelsPerInch -density 300 \
  -fuzz 3% -fill white -draw 'color 0,0 floodfill' -alpha off \
  product-print-master.png

magick marketing-source.png -quality 100 product-marketing.webp
```

Flood-fill từ góc chỉ chuẩn hóa vùng nền trắng liền mạch; sau conversion phải kiểm tra lại bốn góc và artwork. Giữ ảnh nguồn của tool ngoài thư mục xuất bản nếu cần truy vết; thư mục sản phẩm chỉ chứa hai deliverable cuối.
