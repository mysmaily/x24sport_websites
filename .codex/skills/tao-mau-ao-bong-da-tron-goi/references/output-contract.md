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
  print/
    <SKU>-front-print.png
    <SKU>-back-print.png
  marketing/
    <SKU>-mockup-base.webp
    <SKU>-catalog-base.webp           # only for catalog-reference
    <SKU>-sales.webp
  delivery-manifest.json
```

`work/` chứa nguồn sinh ảnh và không phải file xưởng. Hai PNG trong `print/` là master raster giao xưởng. Hai WebP trong `marketing/` chỉ dùng duyệt/chào hàng.

## Manifest tối thiểu

```json
{
  "schemaVersion": "1.0",
  "sku": "X24-BD-000001",
  "productSlug": "velocity-contour-blue",
  "inputMode": "original-design",
  "salesLayout": "catalog-reference",
  "designSpec": "/absolute/path/design-spec.json",
  "productionAssumptions": {
    "process": "dye-sublimation on polyester",
    "colorSpace": "sRGB",
    "physicalMm": [700, 850],
    "ppi": 300,
    "factoryPatternIncluded": false,
    "vectorIncluded": false
  },
  "files": [
    {
      "role": "front print master",
      "path": "/absolute/path/print/X24-BD-000001-front-print.png",
      "sha256": "...",
      "pixels": [8268, 10039],
      "sourcePixels": [1536, 1536],
      "scaleFactor": 6.54,
      "resampled": true
    },
    {
      "role": "back print master",
      "path": "/absolute/path/print/X24-BD-000001-back-print.png",
      "sha256": "...",
      "pixels": [8268, 10039],
      "sourcePixels": [1536, 1536],
      "scaleFactor": 6.54,
      "resampled": true
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
    }
  ],
  "visualApproval": {
    "frontFlatArtworkOnly": true,
    "backFlatArtworkOnly": true,
    "frontBackCoherent": true,
    "mockupMatchesFront": true,
    "mockupMatchesBack": true,
    "commercialTextExact": true
  }
}
```

Tạo manifest và SHA-256 từ bytes cuối bằng `build_delivery_manifest.py`. Ghi đúng `inputMode` và `salesLayout`; với conversion, thêm source analysis/reference vào spec nhưng không đưa ảnh seller vào gallery. Chỉ truyền `--approve-visual` sau khi đã xem full-size cả bốn ảnh và xác nhận đủ gate. `validate_delivery.py` yêu cầu đúng bốn role và kiểm tra file nằm trong product folder, tên SKU đồng nhất, PNG/WebP đúng loại, master đúng pixel/PPI, mockup vuông tối thiểu 1200 px, checksum khớp và sáu cờ visual đều `true`.

Không đặt master PNG vào gallery website. Nếu sau này publish, tạo preview WebP riêng từ master; không dùng master 300 PPI làm ảnh web.
