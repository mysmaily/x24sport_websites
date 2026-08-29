---
name: tao-anh-gia-dinh
description: "Tạo một hoặc nhiều mẫu áo đồng phục gia đình Mayaodongphuc theo bộ: print-master nền trắng, ảnh áo thành phẩm có mã mẫu/contact, ảnh gia đình Việt Nam mặc đúng mẫu áo và preview website. Dùng cho áo gia đình, họp mặt, du lịch gia đình, ba thế hệ; không dùng cho áo lớp/học sinh hoặc đồng phục công ty."
---

# Tạo Ảnh Gia Đình

Tạo bốn deliverable cho mỗi sản phẩm:

1. `print-master`: artwork in nền trắng, tên file theo SKU.
2. `marketing`: ảnh chụp áo thật dùng đúng `print-master`, có brand signature Mayaodongphuc.
3. `family-lifestyle`: gia đình Việt Nam mặc đúng mẫu áo.
4. `print-preview`: WebP 500x500 crop/resize từ master để làm gallery website.

Workflow mặc định là `images-only`: tạo ảnh và `product-handoff.json`, không đăng CMS trừ khi người dùng yêu cầu rõ. Khi đăng, sản phẩm thuộc danh mục **Đồng phục gia đình** với slug mặc định `dong-phuc-gia-dinh`; nếu category chưa có trong CMS, phải tạo/ensure category tenant-scoped trước khi publish, không đổi sang danh mục khác cho tiện.

## Trước Khi Tạo

- Xác định số sản phẩm, dịp sử dụng, text người dùng đã cung cấp và gia đình thường hay ba thế hệ.
- Nếu chưa có text, tự chọn slogan/identity generic về gia đình; không bịa họ tên thật, địa chỉ, tên gia tộc cụ thể hoặc sự kiện có thật.
- Đọc [references/output-contract.md](references/output-contract.md) trước khi xuất file.
- Đọc [references/product-handoff.md](references/product-handoff.md) trước khi tạo manifest hoặc handoff sang `create-tenant-product`.
- Trước khi đóng logo/contact lên ảnh marketing, dùng `scripts/apply_marketing_brand_signature.py`; không giao imagegen tự vẽ logo, số điện thoại, website hoặc SKU.

## Khóa Concept

Mỗi sản phẩm phải khóa trước:

- `sku`, `productSlug`, `productTitle`, `skuLabel`, `productDescription`;
- slogan chính, identity generic, exact text có dấu;
- `categorySlugs`, mặc định `["dong-phuc-gia-dinh"]`;
- kiểu gia đình: `gia-dinh-hat-nhan` hoặc `ba-the-he`;
- họ chủ thể, phong cách minh họa, bố cục, palette và màu áo;
- `familyVariant` từ `scripts/choose_family_variant.py --sku <SKU> [--generations normal|three]`;
- `uniquenessSignature = familyType|subject|style|layout|slogan|identity|palette|shirtColor`.

Không dùng nhân vật, logo, huy hiệu, tài sản có bản quyền/thương hiệu, ảnh người thật nhận diện được hoặc họ tên thật của khách hàng nếu người dùng chưa cung cấp.

## SKU Và Copy

- SKU exact format `X24-DP-NNNNNN`, cấp bằng script:

```bash
python3 scripts/allocate_sku.py \
  --registry=/absolute/path/to/batch-registry.jsonl \
  --root=/absolute/path/to/generated/tao-anh-gia-dinh
```

- Dùng cùng SKU cho mọi file, label mã mẫu, description và manifest; không tự gõ SKU bằng thời gian.
- `productTitle` là H1 sạch, ví dụ `Áo Gia Đình Nhà Mình`; không chứa SKU.
- `skuLabel` exact `Mã mẫu: <SKU>`.
- `productDescription` bắt đầu bằng `Mã mẫu: <SKU>.`, rồi mô tả màu áo, slogan, đối tượng gia đình và khả năng tùy chỉnh.

## Print-Master

Dùng `imagegen` tạo artwork vuông:

- nền trắng thuần `#FFFFFF`, không áo/người thật/đạo cụ/watermark/logo;
- phong cách screen-print/vector-like raster, cạnh sạch, palette có chủ đích;
- slogan và identity là một phần của artwork, prompt ghi exact text verbatim và yêu cầu đúng dấu tiếng Việt;
- chủ đề gia đình đọc rõ qua biểu tượng an toàn: nhà, trái tim, album ảnh, chuyến đi, bữa cơm, cây gia đình, hoặc nhân vật hoạt hình generic;
- chừa lề trắng, không crop artwork.

Kiểm tra full-size. Sai chữ, sai dấu, thừa text, lỗi tay/mặt nghiêm trọng hoặc nền không trắng thì correction pass.

## Marketing

Sau khi master đạt:

1. Xem master bằng `view_image`.
2. Gọi `imagegen` với master làm reference để tạo ảnh chụp sản phẩm áo thật, chưa branding.
3. Kiểm tra áo nền. Chỉ khi đạt gate mới chạy:

```bash
python3 scripts/apply_marketing_brand_signature.py \
  --input /absolute/path/to/approved-unbranded.webp \
  --output /absolute/path/to/<SKU>-marketing.webp \
  --sku <SKU> \
  --position bottom-right
```

Gate marketing:

- vuông 1:1, WebP tối thiểu 1200px;
- áo thật, cổ bo rib-knit, đường vai/lai tay, texture vải, nếp và bóng tiếp xúc rõ;
- artwork đúng master, không có khung nền trắng, nằm khoảng 35-48% bề ngang thân áo;
- logo/contact/SKU đúng một lần ngoài áo: `MÃ MẪU: <SKU>`, `0982 254 458`, `mayaodongphuc.com.vn`;
- signature tinh gọn, không như tem quảng cáo, không che áo.

## Family Lifestyle

Chọn biến thể gia đình ổn định:

```bash
python3 scripts/choose_family_variant.py --sku <SKU>
python3 scripts/choose_family_variant.py --sku <SKU> --generations three
```

Mặc định random 3-5 người. Nếu concept là ba thế hệ thì random 5-7 người. Ghi nguyên JSON vào `familyVariant`.

Prompt lifestyle:

- use case `ads-marketing`, ảnh vuông 1:1, photorealistic family campaign;
- gia đình Việt Nam đúng `familyVariant.castCount`, gồm các vai hợp lý theo `familyType`;
- bối cảnh đọc rõ là gia đình: phòng khách, bếp/bàn ăn, sân nhà, công viên cuối tuần, chuyến du lịch gia đình, buổi họp mặt;
- tránh bối cảnh trường học, công ty/team-building, nightlife hoặc editorial thời trang;
- tất cả áo giữ cùng màu, cổ, tay, form và exact artwork; ít nhất hai mặt trước đọc rõ;
- hình in bám phối cảnh, độ cong, texture, nếp và ánh sáng riêng của từng áo;
- logo Mayaodongphuc đúng asset xuất hiện một lần ở góc trên ngoài áo;
- bottom rail cao không quá 14%, chỉ có exact copy `THOÁNG MÁT`, `DỄ MẶC`, `IN TÊN - LOGO NHÓM`, `MAY NHANH SỐ LƯỢNG LỚN`, `0982 254 458`.

Hard reject nếu cast không phải gia đình, sai số người, trẻ em bị thể hiện không phù hợp, anatomy/tay lỗi rõ, áo khác nhau, artwork sai chữ, hình in nổi như sticker, logo in lên áo, rail sai hotline/copy hoặc scene đọc thành học sinh/công ty.

## Xuất File

Xuất dưới:

```text
generated/tao-anh-gia-dinh/<batch-id>/<product-slug>/
  <SKU>.png
  <SKU>-marketing.webp
  <SKU>-family-lifestyle.webp
  <SKU>-print-preview.webp
  product-handoff.json
```

Tạo preview:

```bash
python3 scripts/create_print_preview.py /absolute/path/to/<SKU>.png
```

Chạy validator:

```bash
python3 scripts/validate_product_pair.py \
  /absolute/path/to/product-folder \
  --require-family-lifestyle

python3 scripts/validate_product_handoff.py \
  --manifest /absolute/path/to/product-handoff.json \
  --image /absolute/path/to/<SKU>-marketing.webp \
  --image /absolute/path/to/<SKU>-family-lifestyle.webp \
  --image /absolute/path/to/<SKU>-print-preview.webp \
  --require-publishing-set
```

## Lưu Kho Và Publish

Sau khi validator và visual gate đều đạt, copy chỉ print master vào:

```text
/Volumes/Data/x24_project/mayaodongphuc.com.vn/dong-phuc-gia-dinh/<SKU>.png
```

Dùng:

```bash
python3 scripts/archive_print_master.py \
  /absolute/path/to/<SKU>.png \
  --category dong-phuc-gia-dinh
```

Nếu `/Volumes/Data` chưa mount hoặc không ghi được, không tạo giả đường dẫn; giữ bản workspace và báo rõ chưa lưu kho.

Khi người dùng yêu cầu đăng, invoke `create-tenant-product` bằng manifest đã validate. Publisher upload đúng ba WebP theo thứ tự: marketing hero, family lifestyle, print preview; không upload master PNG. Category publish là `dong-phuc-gia-dinh`.

## Báo Cáo

Báo SKU, `productTitle`, `skuLabel`, `productDescription`, `familyVariant`, đường dẫn bốn ảnh, manifest, đường dẫn kho print master, kích thước, kiểm tra chữ, logo/contact/mã mẫu, visual gate và trạng thái publish/CMS nếu có.
