# Output Contract Cho Áo Thất Tình

## Một sản phẩm, ba ảnh gốc và một preview website

| Role | File | Yêu cầu |
|---|---|---|
| Print master | `<SKU>.png` | PNG RGB, nền `#FFFFFF`, 4500x4500 px, 300 DPI, artwork thất tình an toàn và exact text, không áo/đạo cụ/watermark |
| Marketing | `<SKU>-marketing.webp` | WebP Q100, vuông ≥1200 px, ảnh chụp áo thật nền đơn sắc, sử dụng đúng artwork master, có mã mẫu, dấu Mayaodongphuc và contact chuẩn |
| Student lifestyle | `<SKU>-student-lifestyle.webp` | WebP Q100, vuông >=1200 px, 3-5 học sinh Việt Nam thuộc một khối ổn định từ lớp 8-12 hoặc nhóm bạn trẻ mặc đúng mẫu áo trong bối cảnh an toàn |
| Website print preview | `<SKU>-print-preview.webp` | WebP Q100, đúng 500×500 px, crop/resize từ print master, không áo/branding/contact |

Ảnh master là nguồn thiết kế. Marketing và student lifestyle là hai cách trình bày thương mại của cùng thiết kế, không phải biến thể artwork. Preview 500px là derivative dành riêng cho gallery website.

CMS chỉ được nhận marketing, student lifestyle và website print preview theo thứ tự đó. Không upload print master PNG 4500px.

## Bản lưu kho theo danh mục

- Sau khi hoàn tất kiểm tra, copy print master tới `/Volumes/Data/x24_project/mayaodongphuc.com.vn/<category-slug>/<SKU>.png`.
- `<category-slug>` phải là slug danh mục thật của website; sản phẩm có nhiều danh mục thì copy vào tất cả folder tương ứng.
- Kho chỉ nhận file exact `X24-DP-[0-9]{6}.png`; không nhận marketing, JPG/WebP, tên concept hoặc hậu tố khác.
- Cùng SKU và cùng bytes là thao tác idempotent. Cùng SKU nhưng bytes khác là conflict và phải dừng, không ghi đè.
- Không lưu kho nếu validator hoặc visual gate chưa đạt. Không tạo đường dẫn dưới `/Volumes/Data` khi volume chưa được mount.

## SKU gate

- SKU exact format: `X24-DP-NNNNNN`, regex `^X24-DP-[0-9]{6}$`.
- `NNNNNN` là số thứ tự 6 chữ số do `scripts/allocate_sku.py` cấp phát và giữ chỗ trong registry. Không tự ghép từ giờ/phút/giây/millisecond vì các format thời gian vẫn có thể lặp.
- Để chống trùng giữa nhiều batch, dùng chung registry hoặc truyền đủ thư mục lịch sử bằng `--scan-root`; allocator cũng tự quét kho print-master `/Volumes/Data/x24_project/mayaodongphuc.com.vn` nếu volume đang mount.
- Bốn file của một sản phẩm phải dùng cùng SKU: `<SKU>.png`, `<SKU>-marketing.webp`, `<SKU>-student-lifestyle.webp` và `<SKU>-print-preview.webp`.
- Ảnh marketing phải đọc rõ exact text `MÃ MẪU: <SKU>`.
- `productTitle` là tên mẫu sạch để làm H1 và không chứa SKU.
- `skuLabel` dùng exact text `Mã mẫu: <SKU>` để hiển thị gần H1 khi publish.
- Mô tả sản phẩm phải bắt đầu bằng `Mã mẫu: <SKU>.`; không cấp mã mới khi publish.

## Text gate

- So sánh từng chữ với exact text đã khóa.
- Kiểm tra dấu tiếng Việt, mã lớp, chữ số và khoảng trắng.
- Không chấp nhận chữ gần giống, thiếu dấu hoặc thêm ký tự trang trí thành chữ.
- Text trên marketing và student lifestyle phải khớp master. Nếu tool làm drift, correction pass từ master là bắt buộc.
- Text thất tình phải hài hước/chữa lành/tự trào an toàn, không nhắm vào cá nhân thật, không cổ vũ trả thù, tự hại, theo dõi, uống say hoặc bạo lực.

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
- Hotline và website phải rõ khi xem ảnh sản phẩm, không thiếu số, sai khoảng trắng, sai chính tả hoặc đổi domain; không phóng lớn chỉ để đọc được trong thumbnail contact sheet.
- Dùng đúng hệ brand signature trong [brand-signature.md](brand-signature.md): quiet editorial lockup, nền trung tính bán trong suốt, không stroke/outline và không pill.
- Signature rộng tối đa 32% cạnh ảnh, cao tối đa 8% cạnh ảnh, diện tích tối đa 2.5% canvas. Logo nhỏ; SKU và website là metadata; hotline là dòng chính nhưng vẫn dưới artwork và áo trong thứ bậc thị giác.
- Không dùng rounded badge viền xanh/cam, border đôi, shadow nặng, font display siêu đậm, ba dòng cùng cỡ/cùng weight hoặc chữ brand bão hòa trên toàn cụm.
- Không che thân áo, tay áo, artwork hoặc biến nền ảnh thành poster quảng cáo nặng chữ.
- Luân phiên corner có khoảng trống nhưng giữ cùng một hệ signature trong batch; không thay hình dạng/màu treatment theo từng palette và không dùng footer toàn chiều ngang.
- Mặc định tạo và duyệt ảnh áo chưa branding trước, sau đó chạy `scripts/apply_marketing_brand_signature.py`. Không nhờ imagegen tự vẽ lại logo hoặc tự đánh máy chuỗi thương mại.
- Nếu signature sai hoặc đặt nhầm vị trí, chạy lại từ ảnh áo chưa branding; không composite đè lên ảnh đã có branding.

## Student lifestyle gate

- Chạy `scripts/choose_student_variant.py --sku <SKU>` và giữ nguyên kết quả lớp 8-12, dải tuổi, số người, scene và action trong mọi retry.
- Ảnh phải là photography vuông với 3-5 học sinh Việt Nam đúng dải tuổi, bối cảnh trường học rõ và hành động tự nhiên, an toàn.
- Ít nhất hai mặt trước áo phải đọc rõ. Không suy diễn mặt sau nếu nguồn không có thiết kế lưng.
- Màu áo, cổ, tay, form, nhân vật, exact text, palette và layout phải giống master/marketing trên mọi người.
- Mỗi hình in phải nhận phối cảnh, độ cong, nếp, texture và ánh sáng riêng của thân áo; hard reject sticker/decal phẳng hoặc cùng một biến dạng cứng lặp trên nhiều người.
- Logo chuẩn xuất hiện đúng một lần ngoài áo ở góc trên. Bottom rail cao không quá 14%, chỉ có `THOÁNG MÁT`, `DỄ MẶC`, `IN TÊN - LOGO LỚP`, `MAY NHANH SỐ LƯỢNG LỚN`, `0982 254 458` và icon tương ứng.
- Không có website, SKU, giá, tên trường/lớp thật, copy ngoài rail, pose nguy hiểm, corporate team-building, nightlife hoặc thể hiện lứa tuổi không phù hợp.
- Với chủ đề thất tình, biểu cảm nên là vui trở lại, bạn bè động viên, tự trào nhẹ hoặc chữa lành; không dùng cảnh khóc lóc quá mức, hẹn hò nhạy cảm, ghen tuông hoặc cô lập nhân vật.
- Sửa deterministic riêng logo/rail nếu cần; lỗi cast, anatomy, áo hoặc artwork phải correction/regenerate từ reference.

## Conversion

Ví dụ với ImageMagick:

```bash
magick source.png \
  -background white -alpha remove -alpha off \
  -filter Lanczos -resize 4500x4500 \
  -units PixelsPerInch -density 300 \
  -fuzz 3% -fill white -draw 'color 0,0 floodfill' -alpha off \
  X24-DP-NNNNNN.png

magick marketing-source.png -quality 100 X24-DP-NNNNNN-marketing.webp
magick student-source.png -quality 100 X24-DP-NNNNNN-student-lifestyle.webp
```

Flood-fill từ góc chỉ chuẩn hóa vùng nền trắng liền mạch; sau conversion phải kiểm tra lại bốn góc và artwork. Giữ ảnh nguồn của tool ngoài thư mục xuất bản nếu cần truy vết; thư mục sản phẩm chỉ chứa bốn deliverable cuối và manifest.
