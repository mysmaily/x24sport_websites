# Contract master in trước–sau

## Master là gì

Mỗi master là một canvas đồ họa full-bleed để xưởng đặt lên rập panel áo. Nó phải độc lập với mockup và không chứa dấu hiệu vật lý của áo.

Hai deliverable bắt buộc:

- `<SKU>-front-print.png`
- `<SKU>-back-print.png`

Mặc định: 700 × 850 mm, 300 PPI, tương ứng 8268 × 10039 px, PNG lossless, sRGB. Nếu xưởng cung cấp kích thước, rập, ICC hoặc yêu cầu TIFF/CMYK, ưu tiên thông số xưởng và ghi rõ thay đổi.

## Nội dung được phép

- màu nền và pattern full-bleed;
- gradient, shape, line, halftone hoặc texture đồ họa có chủ đích và đủ lớn để in;
- vùng thị giác yên để đặt logo/sponsor/tên/số ở bước sau.

## Nội dung cấm

- hình silhouette chiếc áo, cổ, tay, lỗ cổ hoặc đường may;
- người, mannequin, hanger, sân vận động, đạo cụ;
- nếp vải, mesh, bóng đổ, ánh sáng, phối cảnh hoặc độ cong thân;
- text, số, logo, crest, sponsor, watermark, website, hotline, SKU;
- rập, cutline, seam allowance, registration mark nếu xưởng chưa cung cấp template;
- nền trắng ngoài ý muốn do letterbox/contain.

## Quan hệ trước–sau

- Front và back cùng palette, motif family, stroke scale và độ tương phản.
- Back không mirror/copy front. Back giữ vùng giữa lưng dễ đặt số và vùng trên lưng dễ đặt tên.
- Hai mép bên dùng màu/nhịp có khả năng nối. Chỉ tuyên bố “seam-aligned” khi đã kiểm tra trên rập thật; nếu chưa có rập, dùng “edge-coherent”.
- Màu base và accent phải được ghi bằng HEX trong spec. HEX/sRGB là tham chiếu màn hình, không thay proof màu máy in.

## Chất lượng nguồn và upscale

`prepare_print_master.py` dùng Lanczos để đưa ảnh lên kích thước giao. Nó không tạo vector và không khôi phục chi tiết chưa có. Ghi `sourcePixels`, `targetPixels`, `scaleFactor` và `resampled: true|false` trong manifest.

Nếu scale factor lớn hơn 2×:

- kiểm tra edge ở 100% và 200%;
- ưu tiên shape lớn, không chấp nhận artefact/ringing;
- tạo test swatch trước khi in hàng loạt;
- không ghi “native 300 PPI” hoặc “vector-quality”.

## Color handoff

Mặc định lưu sRGB. Không tự chuyển CMYK hoặc gắn ICC ngẫu nhiên. Xưởng phải proof màu trên đúng vải, mực, giấy chuyển và máy ép. Nếu họ cung cấp ICC, dùng workflow màu của xưởng ở bước riêng.
