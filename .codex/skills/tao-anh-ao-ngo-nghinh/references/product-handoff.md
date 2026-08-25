# Product Handoff Contract

Use this manifest to transfer an accepted playful-shirt product into `create-tenant-product` without uploading the full-resolution print master.

## Placement and publishing set

- Name the manifest exactly `product-handoff.json` and place it beside the four product images.
- Use absolute paths and SHA-256 checksums from final saved bytes.
- Schema `1.1` `acceptedImages` contains exactly three WebP files in order: marketing hero, student lifestyle, then 500px print preview.
- The 4500px PNG belongs only in `sourceAssets.printMaster`; the consumer must never upload it.
- Legacy schema `1.0` with only marketing and print preview remains validator-compatible for existing outputs; new work must emit `1.1`.

## Schema

```json
{
  "schemaVersion": "1.1",
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
    "sku": "X24-DP-NNNNNN",
    "sourceSystem": "tao-anh-ao-ngo-nghinh",
    "sourceId": "X24-DP-NNNNNN",
    "productTitle": "Tên mẫu",
    "skuLabel": "Mã mẫu: X24-DP-NNNNNN",
    "productDescription": "Mã mẫu: X24-DP-NNNNNN. Mô tả ngắn theo concept đã khóa."
  },
  "studentVariant": {
    "grade": 10,
    "ageRange": "15-16",
    "castCount": 4,
    "scene": "sân trường sau giờ học",
    "action": "trò chuyện và cười tự nhiên",
    "selection": "stable-sha256"
  },
  "sourceAssets": {
    "printMaster": {
      "path": "/absolute/path/X24-DP-NNNNNN.png",
      "sha256": "64 lowercase hexadecimal characters",
      "archivePaths": [
        "/Volumes/Data/x24_project/mayaodongphuc.vn/dong-phuc-ngo-nghinh/X24-DP-NNNNNN.png"
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
      "altSeed": "Áo lớp màu xanh với artwork vui nhộn và mã mẫu X24-DP-NNNNNN.",
      "captionSeed": "Mẫu áo nổi bật để tập thể dễ chọn thiết kế và gửi yêu cầu tùy chỉnh.",
      "visualTags": ["áo lớp", "màu xanh", "hoạt hình", "mặt trước"],
      "productPlacement": {"gallery": true, "contentEmbed": false, "contentOrder": null}
    },
    {
      "path": "/absolute/path/X24-DP-NNNNNN-student-lifestyle.webp",
      "sha256": "64 lowercase hexadecimal characters",
      "role": "content-inline lifestyle",
      "aspectRatio": "1:1",
      "width": 1254,
      "height": 1254,
      "altSeed": "Áo lớp màu xanh với artwork vui nhộn trong sân trường.",
      "captionSeed": "Mẫu áo giúp tập thể lớp đồng bộ khi học tập, sinh hoạt và chụp ảnh kỷ niệm.",
      "visualTags": ["áo lớp", "học sinh", "sân trường", "màu xanh", "mặt trước"],
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
      "captionSeed": "Xem riêng artwork giúp khách đối chiếu rõ slogan, tên lớp và bố cục trước khi đặt may.",
      "visualTags": ["artwork in áo", "nền trắng", "slogan", "mã mẫu"],
      "productPlacement": {"gallery": true, "contentEmbed": true, "contentOrder": 2}
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

`studentVariant` must be the exact JSON returned by `scripts/choose_student_variant.py --sku <SKU>`. The grade controls cast and age only; it does not replace approved garment text. `publishingIntent.action` defaults to `images-only`. Use `publish` or `draft` only with user authorization. The consumer preserves `productIdentity.sku` and `productIdentity.skuLabel` exactly. `productIdentity.productTitle` is the clean H1 title and must not include the SKU.

## Consumer fallback

The consumer must reject the fast path and perform full analysis when the schema is unsupported, validation fails, a checksum differs, a publishing image is missing, `studentVariant` is inconsistent with the lifestyle image, the 500px preview has another size/format, or the PNG master appears in `acceptedImages`.
