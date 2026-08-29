---
name: tao-anh-ao-that-tinh
description: "Tạo một hoặc nhiều mẫu áo đồng phục/couple/nhóm bạn chủ đề thất tình theo bộ ảnh sản phẩm Mayaodongphuc: print-master nền trắng, ảnh áo thành phẩm có mã mẫu, ảnh lifestyle học sinh/nhóm bạn mặc đúng mẫu và preview website. Dùng cho concept thất tình hài hước, chữa lành, tự trào an toàn; không dùng cho nội dung bi lụy độc hại, công kích người thật, tình dục hóa học sinh hoặc nhắc tự hại."
---

# Tạo ảnh áo thất tình

Tạo ba ảnh gốc và một derivative website cho mỗi sản phẩm:

1. `print-master`: artwork và exact text trên nền trắng, sẵn sàng tái sử dụng để in.
2. `marketing`: ảnh chụp áo thành phẩm dùng chính `print-master`, có brand signature Mayaodongphuc và mã mẫu.
3. `lifestyle`: học sinh Việt Nam lớp 8-12 hoặc nhóm bạn trẻ mặc đúng mẫu áo, tùy đối tượng đã khóa.
4. `print-preview`: WebP 500x500 crop/resize deterministic từ print master để làm ảnh gallery website.

Đây là workflow `images-only` mặc định. Luôn chuẩn bị handoff cho `create-tenant-product`, nhưng không đăng CMS, không tạo sản phẩm và không triển khai website trừ khi người dùng yêu cầu rõ ở một bước riêng.

## Trước khi tạo

- Xác định số sản phẩm, đối tượng dùng áo, mức độ cảm xúc và text người dùng đã cung cấp.
- Nếu chưa có text, tự chọn slogan thất tình theo hướng hài, duyên, chữa lành hoặc tự trào nhẹ; không bịa tên trường, lớp, cặp đôi, người yêu cũ hoặc đơn vị có thật.
- Với hơn 10 sản phẩm, đọc [references/creative-system.md](references/creative-system.md), lập `batch-plan.json`, rồi tạo theo đợt 10-25 sản phẩm. Không tạo hàng trăm mẫu mà không có checkpoint kiểm tra.
- Đọc [references/output-contract.md](references/output-contract.md) trước khi xuất file hoặc khi cần quyết định kích thước, định dạng và tên file.
- Trước khi đóng logo/contact lên ảnh marketing, đọc [references/brand-signature.md](references/brand-signature.md) và dùng script composite của skill; không tự thiết kế tem contact mới cho từng batch.
- Đọc [references/product-handoff.md](references/product-handoff.md) trước khi tạo preview website hoặc handoff sang `create-tenant-product`.
- Khi tạo lifestyle học sinh, đọc [skill đồng phục lớp - trường học](../tao-anh-dong-phuc-lop-truong-hoc/SKILL.md) và [approved output contract](../tao-anh-dong-phuc-lop-truong-hoc/references/approved-output-contract.md); chỉ lấy contract cast, bối cảnh học đường, logo và rail, không thay workflow SKU/artwork của skill này.

## Khóa concept

Mỗi sản phẩm phải khóa trước:

- `sku`, `productSlug`, slogan chính và identity generic của lớp/CLB/nhóm;
- `categorySlugs` theo đúng slug danh mục của Mayaodongphuc; mặc định `dong-phuc-ngo-nghinh`, thêm `dong-phuc-truong-hoc` hoặc `dong-phuc-da-ngoai-team-building` chỉ khi concept thật sự dùng cho lớp/nhóm dã ngoại;
- loại cảm xúc: `tu-trao`, `chua-lanh`, `vui-nhon`, `toi-gian`, `meme-sach`, hoặc `ban-than-truoc-tinh-yeu`;
- chủ thể minh họa, phong cách, bố cục, palette và màu áo;
- exact text có dấu;
- `lifestyleVariant` hoặc `studentVariant` gồm tuổi/khối lớp, số người, scene và action ổn định theo SKU;
- `uniquenessSignature = heartbreakMood|subject|style|layout|slogan|identity|palette|shirtColor`.

Không dùng người thật, nhân vật có bản quyền, logo/huy hiệu thương hiệu, ảnh cặp đôi nhận diện được, tên người yêu cũ, tên trường thật, hoặc nội dung nhắm vào một cá nhân cụ thể.

### Ranh giới nội dung thất tình

Chủ đề thất tình phải đọc là dí dỏm hoặc chữa lành, không cổ vũ đau khổ nguy hiểm.

- Được dùng: tự trào nhẹ, độc thân vui tính, trái tim băng bó, ly trà sữa chữa lành, lịch "move on", đồ vật hoạt hình buồn cười, câu chữ "hết duyên vẫn đẹp", "tạm biệt drama".
- Tránh: đe dọa, trả thù, miệt thị ngoại hình/giới tính, body shaming, ám chỉ theo dõi người cũ, chiếm hữu, uống say như giải pháp, bạo lực, tự hại, hoặc câu chữ tuyệt vọng cực đoan.
- Với học sinh, không tình dục hóa, không cảnh hẹn hò nhạy cảm, không biểu hiện quá trưởng thành; giữ bối cảnh trường học, nhóm bạn, kỷ yếu, CLB hoặc hoạt động tập thể.
- Nếu người dùng đưa text rủi ro, chuyển thành phiên bản an toàn hơn trong cùng tinh thần và báo rõ ở handoff.

### Khóa SKU và copy sản phẩm

- SKU có dạng exact `X24-DP-NNNNNN`, trong đó `NNNNNN` là số thứ tự 6 chữ số do script cấp phát. Không tự ghép giờ/phút/giây/millisecond bằng tay.
- Cấp và giữ chỗ SKU bằng:

```bash
python3 scripts/allocate_sku.py \
  --registry=/absolute/path/to/batch-registry.jsonl \
  --root=/absolute/path/to/generated/tao-anh-ao-that-tinh
```

- Dùng chung registry hoặc truyền đủ `--scan-root` lịch sử để chống trùng; allocator cũng quét kho print-master `/Volumes/Data/x24_project/mayaodongphuc.com.vn` nếu volume đang mount.
- Cùng một SKU phải được dùng nguyên vẹn ở tên file thiết kế, ảnh marketing, label mã mẫu và mô tả sản phẩm; không cấp lại SKU ở bước publish.
- `productTitle` là tên mẫu sạch, ví dụ `Áo nhóm Hết Duyên Vẫn Đẹp`; không đưa `- mã <SKU>` hoặc SKU vào title.
- `skuLabel` dùng exact text `Mã mẫu: <SKU>`.
- `productDescription` phải bắt đầu bằng `Mã mẫu: <SKU>.`, rồi mô tả màu áo, slogan, đối tượng và khả năng tùy chỉnh.

## Tạo ảnh 1: print-master

Dùng `imagegen` tích hợp và tạo mới một ảnh vuông:

- artwork nguyên bản, bố cục gọn, nền trắng thuần `#FFFFFF`;
- không có áo, người mẫu thật, đạo cụ ngoài artwork, watermark hoặc logo;
- slogan và identity là một phần của artwork;
- prompt phải ghi exact text verbatim và yêu cầu đúng dấu tiếng Việt;
- phong cách screen-print/vector-like raster, cạnh sạch, palette có chủ đích;
- chủ đề thất tình thể hiện bằng biểu tượng an toàn: trái tim băng bó, điện thoại im lặng, lịch move-on, playlist buồn cười, đồ ăn/đồ vật có cảm xúc, nhân vật hoạt hình generic;
- chừa lề trắng và giữ toàn bộ artwork trong khung.

Kiểm tra ảnh full-size. Sai một ký tự, dấu, tay, mặt hoặc chi tiết quan trọng thì correction pass có mục tiêu; không chấp nhận lỗi chữ vì ảnh còn lại đẹp.

## Tạo ảnh 2: marketing

Sau khi duyệt `print-master`:

1. Dùng `view_image` để đưa file artwork vào ngữ cảnh.
2. Gọi `imagegen` với `print-master` làm reference để tạo ảnh chụp sản phẩm áo thật, chưa cần nhờ model viết SKU/contact. Use case phải là `product-mockup`; prompt phải nói rõ `photorealistic ecommerce product photography`.
3. Kiểm tra riêng ảnh áo nền bằng `view_image`. Chỉ khi áo vượt visual gate mới đóng brand signature bằng `scripts/apply_marketing_brand_signature.py`.

Ví dụ:

```bash
python3 scripts/apply_marketing_brand_signature.py \
  --input /absolute/path/to/approved-unbranded.webp \
  --output /absolute/path/to/<SKU>-marketing.webp \
  --sku <SKU> \
  --position bottom-right
```

Prompt ảnh áo phải khóa các dấu hiệu vật lý: áo phông thật đặt flat-lay hoặc chụp studio, vải dệt nhìn thấy được, cổ bo rib-knit có đường may, đường vai và lai tay rõ, thân áo có mép thật, nếp nhăn và bóng đổ tự nhiên. Áo phải nhìn như sản phẩm có thể cầm lên, không phải hình chiếc áo được vẽ.

Hard reject nếu áo là silhouette/vector/paper-cut/template/3D icon, canvas không vuông, lỗ cổ là elip trắng rỗng, thiếu texture/đường may, artwork nổi như sticker, artwork quá 48% thân áo, contact footer lớn, hoặc branding che áo.

Sau composite, dùng `view_image` kiểm tra file marketing cuối và tự xác nhận đủ 6 câu: `vuông 1:1?`, `áo là ảnh chụp thật?`, `thấy cấu trúc vải/cổ/đường may?`, `artwork đúng master và nằm trong 35-48% thân áo?`, `logo/contact/SKU đúng và không che áo?`, `signature tinh gọn và không tranh sự chú ý với áo?`. Chỉ xuất bản khi cả 6 câu đều là `có`.

## Tạo ảnh 3: lifestyle mặc áo

Nếu concept dành cho lớp học, chọn biến thể học sinh ổn định theo SKU:

```bash
python3 scripts/choose_student_variant.py --sku <SKU>
```

Dùng kết quả làm `studentVariant`. Với nhóm bạn/người trẻ ngoài trường học, vẫn dùng SKU để khóa cast/scene trong `lifestyleVariant` và giữ tuổi trưởng thành phù hợp, nhưng không dùng bối cảnh quán bar, nightlife hoặc cảnh riêng tư nhạy cảm.

Với lifestyle học sinh:

- use case `ads-marketing`, ảnh vuông 1:1, photorealistic school campaign;
- 3-5 học sinh Việt Nam đúng lớp/dải tuổi, mixed gender khi phù hợp;
- scene đọc rõ là trường học: sân trường, hành lang, lớp học, thư viện, phòng CLB hoặc sân thể thao trường;
- tất cả áo giữ cùng màu, cổ, tay, form và exact artwork; ưu tiên ít nhất hai mặt trước rõ;
- logo Mayaodongphuc đúng asset xuất hiện một lần ở góc trên, ngoài áo;
- bottom rail cao không quá 14%, chỉ có exact copy `THOÁNG MÁT`, `DỄ MẶC`, `IN TÊN - LOGO LỚP`, `MAY NHANH SỐ LƯỢNG LỚN`, `0982 254 458`.

Hard reject nếu cast sai tuổi, dưới 3 người, anatomy/tay lỗi, áo khác nhau, artwork sai chữ, hình in nổi như decal, logo in lên áo, rail sai hotline/copy, scene không phù hợp, hoặc tình huống thất tình bị thể hiện độc hại/không phù hợp lứa tuổi.

Sau khi xuất WebP, dùng `view_image` kiểm tra full-size và xác nhận: `vuông 1:1?`, `đúng cast/tuổi?`, `ít nhất hai mặt áo đọc rõ?`, `artwork bám vải và nhất quán?`, `logo/rail/hotline đúng?`, `chủ đề thất tình an toàn?`.

## Xuất file

Xuất dưới:

```text
generated/tao-anh-ao-that-tinh/<batch-id>/<product-slug>/
  <SKU>.png
  <SKU>-marketing.webp
  <SKU>-student-lifestyle.webp
  <SKU>-print-preview.webp
  product-handoff.json
```

- `<SKU>.png`: print-master nền trắng, 4500x4500 px, 300 DPI.
- `<SKU>-marketing.webp`: ảnh marketing vuông tối thiểu 1200x1200 px, WebP quality 100.
- `<SKU>-student-lifestyle.webp`: ảnh lifestyle vuông tối thiểu 1200x1200 px, WebP quality 100.
- `<SKU>-print-preview.webp`: đúng 500x500 px, WebP quality 100, tạo từ print master bằng script:

```bash
python3 scripts/create_print_preview.py /absolute/path/to/<SKU>.png
```

Chạy validator sau khi xuất:

```bash
python3 scripts/validate_product_pair.py \
  /absolute/path/to/product-folder \
  --require-student-lifestyle
```

### Lưu kho print master theo danh mục website

Sau khi ảnh vượt validator và visual gate, copy thêm chỉ print master vào:

```text
/Volumes/Data/x24_project/mayaodongphuc.com.vn/<category-slug>/<SKU>.png
```

Dùng script idempotent:

```bash
python3 scripts/archive_print_master.py \
  /absolute/path/to/<SKU>.png \
  --category dong-phuc-ngo-nghinh
```

Nếu `/Volumes/Data` chưa mount hoặc không ghi được, không tạo giả đường dẫn; giữ bản workspace và báo rõ bước lưu kho chưa hoàn tất.

## Handoff sang create-tenant-product

- Tạo `product-handoff.json` theo [references/product-handoff.md](references/product-handoff.md), dùng đường dẫn tuyệt đối và SHA-256 của bytes cuối.
- Với schema `1.1`, `acceptedImages` có đúng ba ảnh theo thứ tự: marketing, student lifestyle, print preview.
- `producerSkill`, `sourceSystem` và `copySeeds` phải dùng `tao-anh-ao-that-tinh`.
- `publishingIntent.action` mặc định là `images-only`; chỉ đổi thành `publish` hoặc `draft` khi người dùng yêu cầu.
- Giữ nguyên SKU trong `productIdentity.sku`, `sourceId`, `skuLabel` và description.

Chạy validator handoff:

```bash
python3 scripts/validate_product_handoff.py \
  --manifest /absolute/path/to/product-handoff.json \
  --image /absolute/path/to/<SKU>-marketing.webp \
  --image /absolute/path/to/<SKU>-student-lifestyle.webp \
  --image /absolute/path/to/<SKU>-print-preview.webp \
  --require-publishing-set
```

Báo SKU, `productTitle`, `skuLabel`, `productDescription`, `studentVariant`/`lifestyleVariant`, đường dẫn bốn ảnh, manifest handoff, đường dẫn kho print master theo từng danh mục, kích thước, trạng thái kiểm tra chữ, logo/contact/mã mẫu, visual gate và xác nhận hai ảnh chụp đều dùng artwork tham chiếu.

## Quy mô lớn

- Mỗi asset riêng biệt dùng một lần gọi `imagegen`; không dùng một ảnh lưới thay cho nhiều deliverable.
- Duy trì `batch-plan.json` và `batch-registry.jsonl` để không lặp `uniquenessSignature`, slogan hoặc palette quá dày.
- Trong cùng 20 sản phẩm liên tiếp, hai concept kề nhau phải khác ít nhất ba trục sáng tạo.
- Sau mỗi đợt, kiểm tra SKU không trùng, file đúng tên, lỗi chữ, trùng concept, mức độ an toàn chủ đề thất tình, màu áo, phân bổ cast, độ trung thành giữa master/marketing/lifestyle, logo đúng asset, mã mẫu/hotline/website đúng tuyệt đối.
