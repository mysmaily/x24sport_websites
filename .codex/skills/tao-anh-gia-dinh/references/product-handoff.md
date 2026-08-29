# Product Handoff Contract

Manifest đặt cạnh bốn ảnh, tên `product-handoff.json`, schema `1.1-family`.

```json
{
  "schemaVersion": "1.1-family",
  "producerSkill": "tao-anh-gia-dinh",
  "createdAt": "2026-08-29T12:00:00+07:00",
  "consumerPolicy": {
    "visualInspection": "not-required-after-validation",
    "uploadSourceAssets": false
  },
  "publishingIntent": {
    "action": "images-only",
    "tenantSlug": "mayaodongphuc",
    "domain": "mayaodongphuc.com.vn",
    "categorySlugs": ["dong-phuc-gia-dinh"],
    "pricingMode": "quote-only",
    "isPurchasable": false,
    "stockStatus": "instock",
    "currency": "VND"
  },
  "productIdentity": {
    "sku": "X24-DP-NNNNNN",
    "sourceSystem": "tao-anh-gia-dinh",
    "sourceId": "X24-DP-NNNNNN",
    "productTitle": "Tên mẫu",
    "skuLabel": "Mã mẫu: X24-DP-NNNNNN",
    "productDescription": "Mã mẫu: X24-DP-NNNNNN. Mô tả ngắn theo concept gia đình đã khóa."
  },
  "familyVariant": {
    "sku": "X24-DP-NNNNNN",
    "familyType": "gia-dinh-hat-nhan",
    "generations": "normal",
    "castCount": 4,
    "roles": ["bố", "mẹ", "con trai", "con gái"],
    "scene": "phòng khách sáng ấm áp",
    "action": "ngồi gần nhau và cười tự nhiên",
    "selection": "stable-sha256"
  },
  "sourceAssets": {
    "printMaster": {
      "path": "/absolute/path/X24-DP-NNNNNN.png",
      "sha256": "64 lowercase hexadecimal characters",
      "archivePaths": [
        "/Volumes/Data/x24_project/mayaodongphuc.com.vn/dong-phuc-gia-dinh/X24-DP-NNNNNN.png"
      ]
    }
  },
  "acceptedImages": [
    {
      "path": "/absolute/path/X24-DP-NNNNNN-marketing.webp",
      "sha256": "64 lowercase hexadecimal characters",
      "role": "product hero",
      "aspectRatio": "1:1",
      "width": 1254,
      "height": 1254,
      "altSeed": "Áo gia đình với artwork vui nhộn và mã mẫu X24-DP-NNNNNN.",
      "captionSeed": "Mẫu áo giúp gia đình mặc đồng bộ trong sinh hoạt, du lịch và chụp ảnh kỷ niệm.",
      "visualTags": ["áo gia đình", "mặt trước"],
      "productPlacement": {"gallery": true, "contentEmbed": false, "contentOrder": null}
    },
    {
      "path": "/absolute/path/X24-DP-NNNNNN-family-lifestyle.webp",
      "sha256": "64 lowercase hexadecimal characters",
      "role": "content-inline family lifestyle",
      "aspectRatio": "1:1",
      "width": 1254,
      "height": 1254,
      "altSeed": "Gia đình Việt Nam mặc đồng phục cùng mẫu áo.",
      "captionSeed": "Ảnh lifestyle cho thấy mẫu áo khi cả gia đình mặc cùng nhau.",
      "visualTags": ["áo gia đình", "gia đình"],
      "productPlacement": {"gallery": true, "contentEmbed": true, "contentOrder": 1}
    },
    {
      "path": "/absolute/path/X24-DP-NNNNNN-print-preview.webp",
      "sha256": "64 lowercase hexadecimal characters",
      "role": "print artwork preview",
      "aspectRatio": "1:1",
      "width": 500,
      "height": 500,
      "altSeed": "Artwork in áo nền trắng của mẫu X24-DP-NNNNNN.",
      "captionSeed": "Xem riêng artwork để đối chiếu slogan và bố cục trước khi đặt may.",
      "visualTags": ["artwork in áo", "nền trắng"],
      "productPlacement": {"gallery": true, "contentEmbed": true, "contentOrder": 2}
    }
  ]
}
```

Các trường `artworkFacts`, `audiences`, `useCases`, `unsupportedClaims`, `suggestedCategories`, `copySeeds` vẫn bắt buộc như skill gốc; `suggestedCategories` phải chứa `{"name": "Đồng phục gia đình", "slug": "dong-phuc-gia-dinh"}`.
