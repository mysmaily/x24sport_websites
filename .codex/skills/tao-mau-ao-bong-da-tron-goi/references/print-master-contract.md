# Contract master in trước–sau

## Master là gì

Mỗi master là một canvas đồ họa full-bleed để xưởng đặt lên rập panel áo. Nó phải độc lập với mockup và không chứa dấu hiệu vật lý của áo.

Hai deliverable bắt buộc:

- `<SKU>-front-print.png`
- `<SKU>-back-print.png`

Mặc định generic khi chưa có rập: tỷ lệ `700:850`, PNG lossless, sRGB. Tỷ lệ
ngang/dọc và số pixel native là tiêu chí chính; PPI chỉ được ghi nhận nếu output
vốn có, không encode lại master để thêm metadata. Nếu xưởng cung cấp kích thước,
rập, ICC hoặc yêu cầu TIFF/CMYK, ưu tiên thông số xưởng và ghi rõ thay đổi.

Khi dùng rập xưởng thực tế đã lưu trong
`assets/factory-pattern-references/x24-factory-football-sleeveless-front-back-vneck-crew-2026-08-30.png`,
đọc thêm [factory-pattern-ratio.md](factory-pattern-ratio.md). Rập này có tỷ lệ
thân áo khoảng `0.67` rộng/cao. Canvas `700:850` rộng hơn thân rập khoảng 23%,
nên không dùng làm tỷ lệ print master cho rập này trừ khi người dùng yêu cầu rõ
canvas legacy.

## Tỷ lệ source master

Nếu chưa có rập hoặc kích thước xưởng, master source phải được dựng gần tỷ lệ
giao xưởng generic `700:850` (`aspectRatio = 0.8235`). Đây là nền chữ nhật
oversize để xưởng đặt lên rập panel áo, không phải ảnh vuông và không phải mockup.

- Ưu tiên source nằm trong khoảng `0.80-0.85`.
- Tối đa lệch 8% so với `700:850` khi artwork có bleed an toàn ở vùng bị crop.
- Hard reject source vuông `1:1`, source quá cao/hẹp kiểu `2:3`, hoặc source có
  motif quan trọng sát mép bị crop nếu chưa correction/crop-review.
- Phải sinh trực tiếp ở canvas native đã khóa. Không crop/resize một ảnh nhỏ để
  biến nó thành master; không được kéo méo artwork để vừa rập.
- Nếu dùng rập xưởng hiện tại, source/master phải gần `0.67` rộng/cao. Được tạo
  thừa bleed trong chính canvas tỷ lệ này, nhưng không stretch artwork.
- Nếu xưởng cung cấp rập thật hoặc file vector chính xác, dùng rập đó làm
  authority. Khi chưa có rập, chỉ ghi `edge-coherent`, không ghi seam/cutline
  chính xác.

## Nội dung được phép

- màu nền và pattern full-bleed;
- gradient, shape, line, halftone hoặc texture đồ họa có chủ đích và đủ lớn để in;
- vùng thị giác yên để đặt logo/sponsor/tên/số ở bước sau.
- khi có rập xưởng, motif chính nằm trong canvas tỷ lệ khoảng `0.67`, có bleed
  dư để xưởng canh rập.

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

## Chất lượng nguồn native và master lock

Canvas native phải được khóa trong `design-spec.json` trước khi generate. Mặc
định khi chưa có thông số pixel của xưởng là native portrait lớn nhất mà backend
hỗ trợ ở tỷ lệ gần `0.67`; với backend 2:3 thông dụng là `1024 x 1536 px`. Có thể
lớn hơn nếu backend sinh trực tiếp được, nhưng front và back phải cùng canvas.

- Kích thước được đo từ file output thật, không suy ra từ prompt hay dung lượng.
- `sourcePixels` phải bằng `targetPixels`; `scaleFactor` bắt buộc `1.0` và
  `resampled` bắt buộc `false`.
- Không dùng Lanczos, Real-ESRGAN, generative fill, sharpen, denoise hoặc encode
  lại để tạo master lớn hơn.
- `lock_native_print_master.py` chỉ copy bytes và xác minh SHA-256; hash input,
  canonical master và bản ở Data phải giống nhau.
- Correction chỉ được thực hiện trước lock. Sau lock, mockup/sales/team photo
  dùng canonical master làm reference; không sinh lại master từ bất kỳ ảnh nào.
- Nếu backend không trả đúng native canvas, loại output và retry ở bước master
  hoặc dừng. Không dùng file nhỏ làm source tạm cho các bước sau.
- Kiểm tra edge ở 100% và 200%, tile seam, noise, banding và motif nhỏ trước khi
  lock; tạo test swatch trước khi in hàng loạt.

## Color handoff

Mặc định lưu sRGB. Không tự chuyển CMYK hoặc gắn ICC ngẫu nhiên. Xưởng phải proof màu trên đúng vải, mực, giấy chuyển và máy ép. Nếu họ cung cấp ICC, dùng workflow màu của xưởng ở bước riêng.
