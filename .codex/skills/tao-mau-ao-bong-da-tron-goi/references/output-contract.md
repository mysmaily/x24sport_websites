# Output contract

## Cấu trúc thư mục

```text
generated/tao-mau-ao-bong-da-tron-goi/<batch-id>/<product-slug>/
  design-spec.json
  source-analysis.json                # only for reference-conversion
  source/                             # optional preserved user references
  work/
    <SKU>-front-source.png
    <SKU>-back-source.png
    <SKU>-mockup-native-source.png     # output imagegen mockup, đã có contact
    <SKU>-sales-native-source.png      # output imagegen cuối, đã có typography
    <SKU>-team-photo-native-source.png # output imagegen ảnh tập thể đội bóng
  print/
    <SKU>-front-print.png
    <SKU>-back-print.png
  marketing/
    <SKU>-mockup-base.webp
    <SKU>-sales.webp
    <SKU>-team-photo.webp
  delivery-manifest.json
```

`work/` chứa nguồn sinh ảnh và không phải file xưởng. Hai PNG trong `print/` là
master raster giao xưởng. Các WebP trong `marketing/` chỉ dùng duyệt/chào hàng
và ảnh lifestyle/catalog.

## Đích bàn giao file print

Sau khi validator pass, copy lossless hai master đến:

```text
/Volumes/Data/x24_project/mayaobongda.vn/<SKU>_truoc.png
/Volumes/Data/x24_project/mayaobongda.vn/<SKU>_sau.png
```

Dùng `scripts/deliver_print_masters.py`; không đổi tên thủ công. Script xác minh SHA-256 source/destination, idempotent nếu file đích cùng nội dung và từ chối ghi đè file khác nội dung nếu không có `--overwrite` được người dùng cho phép.

## Manifest tối thiểu

```json
{
  "schemaVersion": "1.1",
  "sku": "X24-BD-000001",
  "productSlug": "velocity-contour-blue",
  "inputMode": "original-design",
  "salesLayout": "catalog-reference",
  "designSpec": "/absolute/path/design-spec.json",
  "productionAssumptions": {
    "process": "dye-sublimation on polyester",
    "colorSpace": "sRGB",
    "targetMode": "aspect-ratio",
    "targetAspectRatio": 0.67,
    "targetPixels": [6726, 10039],
    "physicalMm": null,
    "ppi": 300,
    "factoryPatternIncluded": false,
    "vectorIncluded": false
  },
  "files": [
    {
      "role": "front print master",
      "path": "/absolute/path/print/X24-BD-000001-front-print.png",
      "sha256": "...",
      "pixels": [6726, 10039],
      "sourcePixels": [1024, 1536],
      "scaleFactor": 6.54,
      "resampled": true,
      "upscaleEngine": "realesrgan",
      "upscaleModel": "realesrgan-x4plus",
      "superResolutionScale": 4,
      "postResizeScale": 1.635,
      "qualityGate": "pass-super-resolution"
    },
    {
      "role": "back print master",
      "path": "/absolute/path/print/X24-BD-000001-back-print.png",
      "sha256": "...",
      "pixels": [6726, 10039],
      "sourcePixels": [1024, 1536],
      "scaleFactor": 6.54,
      "resampled": true,
      "upscaleEngine": "realesrgan",
      "upscaleModel": "realesrgan-x4plus",
      "superResolutionScale": 4,
      "postResizeScale": 1.635,
      "qualityGate": "pass-super-resolution"
    },
    {
      "role": "mockup base",
      "path": "/absolute/path/marketing/X24-BD-000001-mockup-base.webp",
      "sha256": "...",
      "pixels": [1536, 1536]
    },
    {
      "role": "sales image",
      "path": "/absolute/path/marketing/X24-BD-000001-sales.webp",
      "sha256": "...",
      "pixels": [1536, 1536]
    },
    {
      "role": "team photo",
      "path": "/absolute/path/marketing/X24-BD-000001-team-photo.webp",
      "sha256": "...",
      "pixels": [1536, 1024],
      "playerCount": 9
    }
  ],
  "salesGeneration": {
    "mode": "imagegen-native",
    "postCompositeApplied": false,
    "nativeSource": {
      "path": "/absolute/path/work/X24-BD-000001-sales-native-source.png",
      "sha256": "...",
      "pixels": [1536, 1536]
    }
  },
  "mockupGeneration": {
    "mode": "imagegen-native",
    "postCompositeApplied": false,
    "nativeSource": {
      "path": "/absolute/path/work/X24-BD-000001-mockup-native-source.png",
      "sha256": "...",
      "pixels": [1536, 1536]
    }
  },
  "teamPhotoGeneration": {
    "mode": "imagegen-native",
    "postCompositeApplied": false,
    "nativeSource": {
      "path": "/absolute/path/work/X24-BD-000001-team-photo-native-source.png",
      "sha256": "...",
      "pixels": [1536, 1024]
    },
    "playerCount": 9
  },
  "visualApproval": {
    "frontFlatArtworkOnly": true,
    "backFlatArtworkOnly": true,
    "frontBackCoherent": true,
    "mockupMatchesFront": true,
    "mockupMatchesBack": true,
    "commercialTextExact": true,
    "collarOptionsExact": true,
    "mockupContactExact": true,
    "teamPhotoMatchesKit": true,
    "teamPhotoContactExact": true
  }
}
```

Tạo manifest và SHA-256 từ bytes cuối bằng `build_delivery_manifest.py`. Ghi đúng
`inputMode` và `salesLayout`; với conversion, thêm source analysis/reference vào
spec nhưng không đưa ảnh seller vào gallery. `design-spec.json` phải có
`teamPhoto.playerCount` là số nguyên `5-11`. Chỉ truyền `--approve-visual` sau
khi đã xem full-size cả năm ảnh và đối chiếu từng chuỗi copy. `validate_delivery.py`
yêu cầu đúng năm role, file nằm trong product folder, SKU đồng nhất, PNG/WebP
đúng loại, master đúng `targetPixels`/PPI, master trên `2×` có provenance
Real-ESRGAN 4× khớp giữa manifest và PNG, không phải Lanczos-only, mockup và sales vuông tối thiểu
1200 px, team photo có cạnh dài tối thiểu 1200 px, checksum khớp và mười cờ
visual đều `true`. Validator còn yêu cầu copy lock trong `design-spec`,
`mockupGeneration.mode=imagegen-native`, `salesGeneration.mode=imagegen-native`,
`teamPhotoGeneration.mode=imagegen-native`, `postCompositeApplied=false`, pixel
RGB của từng WebP marketing giống tuyệt đối với PNG nguồn imagegen tương ứng.
Validator khóa `sales.collarLabels` đúng ba giá trị `Cổ tròn`, `Cổ Tim`,
`Cổ polo`, `selectedCollar` thuộc danh sách và bằng `garment.collar`; đồng thời
khóa website `mayaobongda.vn` và hotline `0989 353 247`. Mọi composite hậu kỳ
làm đổi pixel hoặc mọi spec có loại cổ dư sẽ fail.

Các cờ `collarOptionsExact`, `mockupContactExact` và
`teamPhotoContactExact` chỉ được bật sau khi xem full-size: sales có đúng ba
thumbnail cổ, mockup/team photo đều có đủ hai chuỗi contact và không có
pseudo-text. Validator không tự OCR ảnh nên cờ visual là lời xác nhận bắt buộc,
không được suy ra từ việc spec đúng.

Không đặt master PNG vào gallery website. Nếu sau này publish, tạo preview WebP riêng từ master; không dùng master 300 PPI làm ảnh web.
