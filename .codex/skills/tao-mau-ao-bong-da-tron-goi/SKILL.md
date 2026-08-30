---
name: tao-mau-ao-bong-da-tron-goi
description: "Tạo đúng một bộ 4 ảnh áo bóng đá từ ý tưởng hoặc ảnh tham khảo: 2 print master trước–sau sinh trực tiếp bằng built-in imagegen, 1 ảnh marketing bán hàng và 1 ảnh chụp team; validate rồi giao nguyên byte hai print master sang volume mayaobongda.vn. Không dùng khi chỉ chỉnh một ảnh có sẵn hoặc khi người dùng yêu cầu thêm deliverable khác."
---

# Tạo bộ áo bóng đá 4 ảnh

## Hợp đồng kết quả

Mỗi SKU có đúng bốn ảnh bàn giao:

```text
print/<SKU>-front-print.png
print/<SKU>-back-print.png
marketing/<SKU>-sales.png
marketing/<SKU>-team-photo.png
```

`design-spec.json` và `delivery-manifest.json` là metadata, không phải ảnh bàn
giao. Không tạo mockup base, preview, contact sheet, WebP song song, ảnh source
nhỏ hoặc biến thể phụ nếu người dùng không yêu cầu rõ.

Hai PNG trong `print/` là output gốc từ lần tạo thành công đầu tiên của built-in
`imagegen`. Chúng được dùng để in và làm reference cho hai ảnh còn lại. Không
resize, upscale, crop, enhance, resample, re-encode hoặc tái tạo bản lớn hơn.

## Quy tắc công cụ và chi phí

- Chỉ dùng built-in `imagegen`/`image_gen`; không gọi API ảnh bằng shell, SDK hay
  HTTP.
- Không hỏi, đọc hoặc yêu cầu `OPENAI_API_KEY`. Không chuyển sang workflow trả
  phí riêng và không gọi file print là preview chỉ vì kích thước native của
  built-in imagegen khác một con số đặt trước.
- Happy path có bốn lần tạo ảnh: front, back, sales, team. Front và back mỗi bên
  đúng một lần tạo thành công; không correction pass và không regeneration.
- Nếu một tool call lỗi trước khi trả ảnh thì có thể gọi lại chính call đó. Khi
  đã có ảnh output, ảnh đó là master của side tương ứng.

## 1. Khóa SKU và brief tối thiểu

Cấp một SKU cho cả bốn ảnh:

```bash
python3 scripts/allocate_sku.py \
  --registry /absolute/path/to/batch-registry.jsonl \
  --scan-root /absolute/path/to/generated/tao-mau-ao-bong-da-tron-goi
```

SKU mới có format `X24-BD-FFMMHHDD`: `FF` là hai chữ số phần trăm giây, `MM`
là phút, `HH` là giờ và `DD` là ngày theo múi giờ `Asia/Ho_Chi_Minh`. Allocator
khóa registry local bằng `flock` và không truy vấn dữ liệu server. Đây là format
SKU duy nhất được allocator và toàn bộ validator của skill chấp nhận.

Xác định `original-design` hoặc `reference-conversion`, màu chính/phụ, cổ áo và
đối tượng sử dụng. Tự suy luận các chi tiết còn thiếu theo hướng thương mại, gọn
và dễ bán; không dừng để hỏi những lựa chọn có thể suy luận an toàn.

Với mẫu mới, có thể dùng `scripts/choose_creative_direction.py` để khóa tên,
palette, bố cục team và logo. Với ảnh nguồn, chỉ đọc
[reference-conversion.md](references/reference-conversion.md) để bóc thiết kế;
không sao chép logo, sponsor, watermark hoặc chữ của nguồn vào print master.

Tạo `design-spec.json` ngắn gọn trước khi generate. Phần bắt buộc:

```json
{
  "sku": "<SKU>",
  "inputMode": "original-design",
  "print": {
    "masterPolicy": "builtin-imagegen-original",
    "singleGenerationPerSide": true,
    "resamplingAllowed": false,
    "regenerationAllowed": false
  },
  "logoSource": {
    "path": "assets/logo-references/logo-white-1.png",
    "absolutePath": "/absolute/path/to/logo-white-1.png"
  },
  "teamPhoto": {"playerCount": 7}
}
```

Không khóa pixel trước khi gọi imagegen. Sau khi có front/back, ghi kích thước
thật vào manifest; kích thước thật của output gốc là kích thước được chấp nhận.

## 2. Tạo hai print master đúng một lần

Đọc [print-master-contract.md](references/print-master-contract.md).

### Front

Gọi built-in imagegen tạo artwork phẳng, full-bleed, portrait gần tỷ lệ `2:3`
cho thân áo in chuyển nhiệt. Canvas chỉ có màu và pattern: không áo, cổ, tay,
rập, đường may, model, nếp vải, ánh sáng, text, số, logo, crest, sponsor,
watermark, website hoặc hotline.

Lưu trực tiếp output gốc vào `print/<SKU>-front-print.png`. Không tạo một source
trung gian rồi xử lý thành file print.

### Back

Gọi built-in imagegen một lần với front canonical trong
`referenced_image_paths`. Tạo artwork back cùng palette/motif/stroke scale,
không mirror front, có vùng tên/số yên và hai mép edge-coherent.

Lưu trực tiếp output gốc vào `print/<SKU>-back-print.png`. Từ đây tuyệt đối không
sửa hoặc sinh lại hai master.

## 3. Chọn và đóng logo thật từ asset local

Logo không nằm trong print master; nó chỉ xuất hiện như badge ngực trên ảnh sales
và ảnh team.

1. Scan `assets/logo-references/`. Vùng ngực sáng dùng `logo-dark-*`; vùng ngực
   tối hoặc bão hòa dùng `logo-white-*`.
2. Resolve file được chọn thành `design-spec.json.logoSource.absolutePath` và
   mở file bằng công cụ xem ảnh trước khi generate.
3. Khi gọi imagegen cho sales hoặc team, **bắt buộc truyền chính file logo qua
   `referenced_image_paths`**. Chỉ nhắc tên/path trong prompt không được tính là
   đã dùng logo.
4. Thứ tự reference cố định:

```text
Image 1 = front print master
Image 2 = back print master
Image 3 = exact local logo asset
```

Prompt phải yêu cầu giữ đúng hình dáng, chi tiết trong logo và tương phản màu;
đặt logo nhỏ trên ngực trái, warp theo vải như badge in/ép thật. Không thay bằng
crest tự bịa. Nếu brief có logo khách hàng được phép dùng, file đó thay Image 3.

## 4. Tạo một ảnh marketing bán hàng

Gọi imagegen với đúng ba reference trên. Ảnh phải cho thấy rõ mặt trước và sau
của bộ áo, form/vải thể thao chân thực, logo Image 3 nhận ra được trên ngực áo
front, bố cục gọn để bán hàng. Dùng copy tối thiểu: tên mẫu hoặc SKU,
`mayaobongda.vn`, `0989 353 247` và `IN TÊN + SỐ MIỄN PHÍ`; không giá, không CTA
và không nhồi selector/feature nếu người dùng không yêu cầu.

Lưu duy nhất output cuối vào `marketing/<SKU>-sales.png`.

## 5. Tạo một ảnh chụp team

Gọi imagegen với ba reference cố định; có thể thêm sales image làm Image 4 để giữ
form áo. Tạo một đội bóng người Việt trên sân thật, ánh sáng tự nhiên, đúng số
người trong spec (mặc định 5–11), cùng một bộ kit. Logo local phải nhận ra được
trên các áo nhìn chính diện. Thêm một contact overlay nhỏ, rõ, không che người
hoặc áo, với đúng `mayaobongda.vn` và `0989 353 247`. Không sponsor lạ, logo CLB
nổi tiếng, watermark, poster title, giá hoặc CTA khác.

Lưu duy nhất output cuối vào `marketing/<SKU>-team-photo.png`.

## 6. Validate rồi giao đúng hai print master

Đọc [output-contract.md](references/output-contract.md).

Xem cả bốn ảnh ở full size. Chỉ approve khi:

- front/back là artwork phẳng, cùng hệ, khác nhau và không chứa logo/text/mockup;
- hai print master là output imagegen gốc, cùng kích thước, chưa resample;
- sales và team bám đúng palette/pattern của hai master;
- logo trên sales và team nhận ra là đúng Image 3, không phải logo tự bịa;
- ảnh sales và team đều dùng đúng website/hotline; ảnh team đúng số người và
  không có branding lạ.

Tạo và kiểm manifest:

```bash
python3 scripts/build_delivery_manifest.py /absolute/path/to/product-folder \
  --sku <SKU> --product-slug <slug> \
  --input-mode <original-design|reference-conversion> --approve-visual

python3 scripts/validate_delivery.py /absolute/path/to/product-folder
```

Validator chỉ kiểm đúng bốn role ảnh, pixel/hash thật, chính sách không resample,
logo reference và visual approval. Nó không áp một pixel floor tùy ý.

Chỉ sau khi validator pass, copy byte-identical đúng hai print master:

```bash
python3 scripts/deliver_print_masters.py /absolute/path/to/product-folder \
  --sku <SKU> \
  --destination-root /Volumes/Data/x24_project/mayaobongda.vn
```

Đích bắt buộc:

```text
/Volumes/Data/x24_project/mayaobongda.vn/<SKU>_truoc.png
/Volumes/Data/x24_project/mayaobongda.vn/<SKU>_sau.png
```

Không chuyển sales/team vào volume này. Sau copy, SHA-256 nguồn và đích phải
giống nhau. Không ghi đè file khác nội dung nếu người dùng chưa yêu cầu rõ.

## Batch

Xử lý từng SKU đủ bốn ảnh rồi validate/deliver trước SKU tiếp theo. Không tạo
thêm concept, mockup hoặc variant ngoài bốn ảnh đã khóa.
