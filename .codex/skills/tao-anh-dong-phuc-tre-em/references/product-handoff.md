# Product Handoff Contract

Use this manifest to transfer accepted Mayaodongphuc children's uniform images into `create-tenant-product`. The producer owns visual garment facts, accepted file identity, image roles, visual tags, safe seed copy and explicit uncertainty. The publishing skill owns final product name, SKU/source identity, category resolution, commercial copy, SEO fields and CMS mutation.

## Placement And Discovery

- Name the file exactly `product-handoff.json`.
- Put it beside the accepted publishing images in a product-specific output directory.
- Use absolute paths and SHA-256 checksums from the final saved bytes.
- List every delivered publishing image and no intermediate asset.
- The default set contains exactly one `product hero`, followed by one clean `content-inline lifestyle`, followed by one `content-inline catalog`.

## Schema

```json
{
  "schemaVersion": "1.0",
  "producerSkill": "tao-anh-dong-phuc-tre-em",
  "createdAt": "2026-08-24T12:00:00+07:00",
  "consumerPolicy": {
    "visualInspection": "not-required-after-validation"
  },
  "publishingIntent": {
    "action": "publish",
    "tenantSlug": "mayaodongphuc",
    "domain": "mayaodongphuc.com.vn",
    "categorySlug": "dong-phuc-tre-em",
    "pricingMode": "quote-only",
    "isPurchasable": false,
    "stockStatus": "instock",
    "currency": "VND"
  },
  "sourceTransformations": [],
  "sourceReferences": [
    {
      "path": "/absolute/path/reference.png",
      "classification": "exact garment design with source branding removed"
    }
  ],
  "acceptedImages": [
    {
      "path": "/absolute/path/generated/tao-anh-dong-phuc-tre-em/mayaodongphuc-product/mayaodongphuc-product-main.webp",
      "sha256": "64 lowercase hexadecimal characters",
      "role": "product hero",
      "aspectRatio": "1:1",
      "modelCount": 4,
      "altSeed": "Đồng phục trẻ em phối xanh trắng trong bối cảnh sân trường tiểu học.",
      "captionSeed": "Mẫu áo trẻ em phối xanh trắng phù hợp hoạt động lớp học, ngày hội trường và dã ngoại.",
      "visualTags": ["đồng phục trẻ em", "xanh trắng", "cổ tròn", "tay ngắn", "sân trường"],
      "productPlacement": {
        "gallery": true,
        "contentEmbed": false,
        "contentOrder": null
      },
      "overlay": {
        "campaignLogo": "mayaodongphuc-logo.png",
        "garmentText": "VUI ĐẾN TRƯỜNG",
        "hotline": "0982 254 458"
      }
    },
    {
      "path": "/absolute/path/generated/tao-anh-dong-phuc-tre-em/mayaodongphuc-product/mayaodongphuc-product-image-2.webp",
      "sha256": "64 lowercase hexadecimal characters",
      "role": "content-inline lifestyle",
      "aspectRatio": "1:1",
      "modelCount": 6,
      "altSeed": "Mẫu áo đồng phục trẻ em xuất hiện rõ trong hoạt động dã ngoại an toàn.",
      "captionSeed": "Bối cảnh dã ngoại giúp mẫu áo thể hiện sự thoải mái khi trẻ học tập và vui chơi.",
      "visualTags": ["áo đồng phục trẻ em", "dã ngoại", "tay ngắn", "vui chơi an toàn"],
      "productPlacement": {
        "gallery": true,
        "contentEmbed": true,
        "contentOrder": 1
      },
      "overlay": {
        "campaignLogo": "mayaodongphuc-logo.png",
        "garmentText": "VUI ĐẾN TRƯỜNG"
      }
    },
    {
      "path": "/absolute/path/generated/tao-anh-dong-phuc-tre-em/mayaodongphuc-product/mayaodongphuc-product-catalog.webp",
      "sha256": "64 lowercase hexadecimal characters",
      "role": "content-inline catalog",
      "aspectRatio": "5:4",
      "modelCount": 6,
      "altSeed": "Thiết kế đồng phục trẻ em xanh trắng trong bối cảnh dã ngoại kèm thông tin tư vấn đặt may.",
      "captionSeed": "Mẫu áo trẻ em xanh trắng phù hợp lớp mầm non, tiểu học và hoạt động ngoại khóa.",
      "visualTags": ["catalog đồng phục trẻ em", "áo trẻ em xanh trắng", "hotline", "dã ngoại"],
      "productPlacement": {
        "gallery": true,
        "contentEmbed": true,
        "contentOrder": 2
      },
      "overlay": {
        "campaignLogo": "mayaodongphuc-logo.png",
        "garmentText": "VUI ĐẾN TRƯỜNG",
        "title": "ĐỒNG PHỤC / TRẺ EM",
        "slogan": "Vui đến trường - Dễ vận động",
        "hotline": "0982 254 458",
        "website": "mayaodongphuc.com.vn"
      }
    }
  ],
  "garmentFacts": {
    "productType": "áo thun đồng phục trẻ em",
    "collar": "cổ tròn",
    "sleeves": "tay ngắn",
    "fit": "form dễ vận động nhìn thấy trong ảnh",
    "colors": ["xanh", "trắng"],
    "pattern": "phối màu xanh trắng theo thiết kế nguồn",
    "approvedArtwork": ["text trẻ em ngắn đặt trong vùng in chính, ví dụ VUI ĐẾN TRƯỜNG"],
    "removedArtwork": ["mọi logo, tên lớp, tên trường, thương hiệu và chữ gốc trên áo tham chiếu"],
    "visibleSides": ["front"]
  },
  "audiences": ["trẻ em", "mầm non", "tiểu học", "lớp ngoại khóa", "nhóm dã ngoại"],
  "useCases": ["đồng phục trẻ em", "đồng phục mầm non", "đồng phục tiểu học", "ngày hội trường", "dã ngoại"],
  "featureLock": {
    "fabric": {"copy": "Mềm mại, thoáng mát", "evidenceLevel": "provided"},
    "design": {"copy": "In tên lớp, logo trường hoặc hình minh họa theo yêu cầu", "evidenceLevel": "provided"},
    "durability": {"copy": "Bền màu, dễ bảo quản", "evidenceLevel": "provided"},
    "printing": {"copy": "Text trẻ em ngắn in trong vùng chính", "evidenceLevel": "visible"}
  },
  "unsupportedClaims": ["fabric composition", "GSM", "named printing process", "safety certification", "wash-cycle count", "fixed delivery time", "fixed price"],
  "fidelityCaveats": ["Mặt sau không được suy diễn nếu ảnh tham chiếu không cung cấp thiết kế lưng."],
  "suggestedCategory": {
    "name": "Đồng phục trẻ em",
    "slug": "dong-phuc-tre-em"
  },
  "copySeeds": ["đồng phục trẻ em", "đồng phục mầm non", "đồng phục tiểu học", "áo nhóm dã ngoại cho bé", "đặt may theo yêu cầu"]
}
```

For a sleeveless input, replace the empty `sourceTransformations` array with:

```json
"sourceTransformations": [
  {
    "field": "sleeves",
    "from": "áo ba lỗ hoặc khoét nách sâu",
    "to": "tay ngắn set-in",
    "reason": "chuẩn hóa đồng phục trẻ em"
  }
]
```

## Publishing Intent

- Use `action: publish` for the default garment-only workflow.
- Use `action: draft` when the user requests draft.
- Use `action: images-only` when the user explicitly disables CMS mutation.
- Keep tenant, domain, category and quote-only values fixed. Only `action` varies.

## Alt And Caption Boundary

- `altSeed` describes the garment and meaningful preschool, primary-school or outing scene.
- `captionSeed` is buyer-facing merchandising copy.
- Do not start either field with inventory language such as `Ảnh chụp`, `Hình ảnh`, `Bảng catalog`, `Poster`, `Ba trẻ`, `Nhóm năm trẻ`, or a model count.
- Do not copy `altSeed` into `captionSeed` by default.
- Avoid naming real schools/classes unless supplied and approved by the user for publication.

## Consumer Fallback

The consumer must reject the manifest and perform full analysis when parsing fails, the producer/schema is unsupported, a checksum differs, or an accepted image is absent. A validated handoff should use the no-view fast path.
