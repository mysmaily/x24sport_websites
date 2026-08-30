# Output contract

## Cấu trúc thư mục

```text
generated/tao-mau-ao-bong-da-tron-goi/<batch-id>/<product-slug>/
  design-spec.json
  source-analysis.json                # chỉ có ở reference-conversion
  source/                             # optional user references
  print/
    <SKU>-front-print.png             # canonical native-large master
    <SKU>-back-print.png              # canonical native-large master
  work/
    <SKU>-mockup-native-source.png
    <SKU>-sales-native-source.png
    <SKU>-team-photo-native-source.png
  marketing/
    <SKU>-mockup-base.webp
    <SKU>-sales.webp
    <SKU>-team-photo.webp
  delivery-manifest.json
```

Hai PNG trong `print/` là nguồn duy nhất từ lúc master lock đến Data volume.
Không tạo `work/<SKU>-front-source.png` hoặc `back-source.png` làm nguồn nhỏ song
song. Nếu cần giữ output ban đầu ngoài product folder để audit, hash của nó phải
trùng canonical master; workflow không sử dụng lại đường dẫn ngoài đó.

## Native-large single-source contract

`design-spec.json` phải khóa trước khi generate:

```json
{
  "print": {
    "masterPolicy": "native-large-single-source",
    "nativeTargetPixels": [2336, 3504],
    "targetAspectRatio": 0.67,
    "minNativeLongEdgePx": 3504,
    "resamplingAllowed": false,
    "regenerationAfterMasterLock": false
  }
}
```

`2336 x 3504` là native canvas tối thiểu mặc định khi xưởng chưa đưa pixel cụ
thể. Có thể khóa canvas lớn hơn nếu backend tạo trực tiếp được. `1024 x 1536`
phải bị validator từ chối, không được khóa rồi đi tiếp. Kích thước output thật
phải đúng canvas; file nhỏ hơn không được resize/upscale để pass. Dung lượng MB
không phải quality gate vì PNG có thể nén rất khác nhau dù cùng lượng pixel.

Sau visual gate, dùng `lock_native_print_master.py`. Script copy byte-for-byte;
`sourcePixels = targetPixels`, `scaleFactor = 1.0`, `resampled = false` và SHA-256
input/canonical phải bằng nhau. PPI chỉ được ghi nhận nếu output vốn có; không
encode lại master chỉ để thêm metadata 300 PPI.

## Đích bàn giao file print

Sau khi validator pass, dùng `scripts/deliver_print_masters.py` để copy lossless:

```text
/Volumes/Data/x24_project/mayaobongda.vn/<SKU>_truoc.png
/Volumes/Data/x24_project/mayaobongda.vn/<SKU>_sau.png
```

Script xác minh SHA-256 canonical/Data, chạy idempotent nếu cùng nội dung và từ
chối ghi đè file khác nội dung nếu chưa có `--overwrite` do người dùng cho phép.

## Manifest tối thiểu

```json
{
  "schemaVersion": "1.2",
  "sku": "X24-BD-000001",
  "productionAssumptions": {
    "masterPolicy": "native-large-single-source",
    "targetAspectRatio": 0.67,
    "targetPixels": [2336, 3504],
    "minNativeLongEdgePx": 3504,
    "resamplingAllowed": false,
    "regenerationAfterMasterLock": false,
    "colorSpace": "sRGB"
  },
  "files": [
    {
      "role": "front print master",
      "path": "/absolute/path/print/X24-BD-000001-front-print.png",
      "sha256": "...",
      "pixels": [2336, 3504],
      "sourcePixels": [2336, 3504],
      "scaleFactor": 1.0,
      "resampled": false,
      "nativeLarge": true,
      "masterPolicy": "native-large-single-source"
    }
  ],
  "masterGeneration": {
    "mode": "imagegen-native-large-single-source",
    "front": {
      "canonicalPath": "/absolute/path/print/X24-BD-000001-front-print.png",
      "sha256": "...",
      "pixels": [2336, 3504]
    },
    "back": {
      "canonicalPath": "/absolute/path/print/X24-BD-000001-back-print.png",
      "sha256": "...",
      "pixels": [2336, 3504]
    }
  }
}
```

Manifest vẫn phải chứa đúng năm role, ba generation record marketing và mười cờ
visual approval như validator yêu cầu. WebP marketing phải pixel-identical với
PNG imagegen-native tương ứng; không composite text hậu kỳ.

`validate_delivery.py` hard reject khi:

- master sai `targetPixels`, sai tỷ lệ hoặc cạnh dài dưới minimum;
- `sourcePixels != pixels`, `scaleFactor != 1`, `resampled != false`;
- thiếu `masterGeneration` hoặc canonical path/hash/pixels không khớp file;
- design spec cho phép resampling hoặc regeneration sau lock;
- front/back giống hệt nhau;
- checksum, role, contact/collar lock, marketing pixel identity hoặc visual gate
  không hợp lệ.

Không đặt master PNG vào gallery website. Nếu publish, tạo preview WebP riêng và
không thay đổi canonical master.
