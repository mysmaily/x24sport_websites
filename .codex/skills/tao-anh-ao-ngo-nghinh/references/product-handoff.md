# Product Handoff Contract

Use this manifest to transfer an accepted playful-shirt product into `create-tenant-product` without uploading the full-resolution print master.

## Placement and publishing set

- Name the manifest exactly `product-handoff.json` and place it beside the three product images.
- Use absolute paths and SHA-256 checksums from final saved bytes.
- `acceptedImages` contains exactly two WebP files in order: marketing hero, then 500px print preview.
- The 4500px PNG belongs only in `sourceAssets.printMaster`; the consumer must never upload it.

## Schema

```json
{
  "schemaVersion": "1.0",
  "producerSkill": "tao-anh-ao-ngo-nghinh",
  "createdAt": "2026-08-25T12:00:00+07:00",
  "consumerPolicy": {
    "visualInspection": "not-required-after-validation",
    "uploadSourceAssets": false
  },
  "publishingIntent": {
    "action": "images-only",
    "tenantSlug": "mayaodongphuc",
    "domain": "mayaodongphuc.com.vn",
    "categorySlugs": ["dong-phuc-ngo-nghinh", "dong-phuc-truong-hoc"],
    "pricingMode": "quote-only",
    "isPurchasable": false,
    "stockStatus": "instock",
    "currency": "VND"
  },
  "productIdentity": {
    "sku": "X24-DP-HHSSMM",
    "sourceSystem": "tao-anh-ao-ngo-nghinh",
    "sourceId": "X24-DP-HHSSMM",
    "productTitle": "Tên mẫu - mã X24-DP-HHSSMM",
    "productDescription": "Mã mẫu: X24-DP-HHSSMM. Mô tả ngắn theo concept đã khóa."
  },
  "sourceAssets": {
    "printMaster": {
      "path": "/absolute/path/X24-DP-HHSSMM.png",
      "sha256": "64 lowercase hexadecimal characters",
      "archivePaths": [
        "/Volumes/Data/x24_project/mayaodongphuc.vn/dong-phuc-ngo-nghinh/X24-DP-HHSSMM.png"
      ]
    }
  },
  "acceptedImages": [
    {
      "path": "/absolute/path/X24-DP-HHSSMM-marketing.webp",
      "sha256": "64 lowercase hexadecimal characters",
      "role": "product hero",
      "aspectRatio": "1:1",
      "width": 1254,
      "height": 1254,
      "altSeed": "Áo lớp màu xanh với artwork vui nhộn và mã mẫu X24-DP-HHSSMM.",
      "captionSeed": "Mẫu áo nổi bật để tập thể dễ chọn thiết kế và gửi yêu cầu tùy chỉnh.",
      "visualTags": ["áo lớp", "màu xanh", "hoạt hình", "mặt trước"],
      "productPlacement": {"gallery": true, "contentEmbed": false, "contentOrder": null}
    },
    {
      "path": "/absolute/path/X24-DP-HHSSMM-print-preview.webp",
      "sha256": "64 lowercase hexadecimal characters",
      "role": "print artwork preview",
      "aspectRatio": "1:1",
      "width": 500,
      "height": 500,
      "altSeed": "Artwork in áo nền trắng của mẫu X24-DP-HHSSMM.",
      "captionSeed": "Xem riêng artwork giúp khách đối chiếu rõ slogan, tên lớp và bố cục trước khi đặt may.",
      "visualTags": ["artwork in áo", "nền trắng", "slogan", "mã mẫu"],
      "productPlacement": {"gallery": true, "contentEmbed": true, "contentOrder": 1}
    }
  ],
  "artworkFacts": {
    "slogan": "Exact slogan",
    "identity": "Exact tên lớp, CLB hoặc nhóm",
    "subject": "Chủ thể minh họa",
    "style": "Phong cách minh họa",
    "palette": ["màu chính", "màu phụ"],
    "shirtColor": "màu áo",
    "approvedText": ["Exact slogan", "Exact identity"]
  },
  "audiences": ["lớp học", "nhóm bạn"],
  "useCases": ["áo lớp", "đồng phục trường học"],
  "unsupportedClaims": ["fabric composition", "GSM", "named printing process", "fixed price", "fixed delivery time"],
  "suggestedCategories": [
    {"name": "Đồng phục ngộ nghĩnh", "slug": "dong-phuc-ngo-nghinh"}
  ],
  "copySeeds": ["áo lớp ngộ nghĩnh", "đặt may theo yêu cầu"]
}
```

`publishingIntent.action` defaults to `images-only`. Use `publish` or `draft` only with user authorization. The consumer preserves `productIdentity.sku` exactly and may refine title/copy without removing that SKU.

## Consumer fallback

The consumer must reject the fast path and perform full analysis when the schema is unsupported, validation fails, a checksum differs, either publishing image is missing, the 500px preview has another size/format, or the PNG master appears in `acceptedImages`.
