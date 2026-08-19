# Product Handoff Contract

Use this manifest to transfer accepted Mayaodongphuc school/class uniform images into `create-tenant-product`. The producer owns visual garment facts, accepted file identity, image roles, visual tags, safe seed copy and explicit uncertainty. The publishing skill owns final product name, SKU/source identity, category resolution, commercial copy, SEO fields and CMS mutation.

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
  "producerSkill": "tao-anh-dong-phuc-lop-truong-hoc",
  "createdAt": "2026-08-19T12:00:00+07:00",
  "consumerPolicy": {
    "visualInspection": "not-required-after-validation"
  },
  "publishingIntent": {
    "action": "publish",
    "tenantSlug": "mayaodongphuc",
    "domain": "mayaodongphuc.com.vn",
    "categorySlug": "dong-phuc-truong-hoc",
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
      "path": "/absolute/path/generated/tao-anh-dong-phuc-lop-truong-hoc/mayaodongphuc-product/mayaodongphuc-product-main.png",
      "sha256": "64 lowercase hexadecimal characters",
      "role": "product hero",
      "aspectRatio": "1:1",
      "modelCount": 4,
      "altSeed": "Áo lớp phối xanh trắng nổi bật trong bối cảnh sân trường.",
      "captionSeed": "Thiết kế xanh trắng giúp tập thể lớp dễ đồng bộ khi chụp ảnh và tham gia sự kiện trường.",
      "visualTags": ["đồng phục lớp", "xanh trắng", "cổ tròn", "tay ngắn", "sân trường"],
      "productPlacement": {
        "gallery": true,
        "contentEmbed": false,
        "contentOrder": null
      },
      "overlay": {
        "campaignLogo": "mayaodongphuc-logo.png",
        "garmentText": "CHỈ CÓ THỂ LÀ 12A1",
        "hotline": "0982 254 458"
      }
    },
    {
      "path": "/absolute/path/generated/tao-anh-dong-phuc-lop-truong-hoc/mayaodongphuc-product/mayaodongphuc-product-image-2.png",
      "sha256": "64 lowercase hexadecimal characters",
      "role": "content-inline lifestyle",
      "aspectRatio": "1:1",
      "modelCount": 6,
      "altSeed": "Mẫu áo lớp xuất hiện rõ trong hoạt động CLB tại khuôn viên trường.",
      "captionSeed": "Bối cảnh CLB giúp mẫu áo thể hiện đúng tinh thần trẻ trung của lớp và trường học.",
      "visualTags": ["áo lớp", "CLB trường học", "tay ngắn", "khuôn viên trường"],
      "productPlacement": {
        "gallery": true,
        "contentEmbed": true,
        "contentOrder": 1
      },
      "overlay": {
        "campaignLogo": "mayaodongphuc-logo.png",
        "garmentText": "CHỈ CÓ THỂ LÀ 12A1"
      }
    },
    {
      "path": "/absolute/path/generated/tao-anh-dong-phuc-lop-truong-hoc/mayaodongphuc-product/mayaodongphuc-product-catalog.png",
      "sha256": "64 lowercase hexadecimal characters",
      "role": "content-inline catalog",
      "aspectRatio": "5:4",
      "modelCount": 6,
      "altSeed": "Thiết kế áo lớp xanh trắng trong bối cảnh trường học kèm thông tin tư vấn đặt may.",
      "captionSeed": "Mẫu áo lớp xanh trắng phù hợp chụp ảnh tập thể, sinh hoạt CLB và sự kiện trường.",
      "visualTags": ["catalog đồng phục lớp", "áo lớp xanh trắng", "hotline", "trường học"],
      "productPlacement": {
        "gallery": true,
        "contentEmbed": true,
        "contentOrder": 2
      },
      "overlay": {
        "campaignLogo": "mayaodongphuc-logo.png",
        "garmentText": "CHỈ CÓ THỂ LÀ 12A1",
        "title": "ĐỒNG PHỤC / LỚP HỌC",
        "slogan": "Chung màu áo - Chung kỷ niệm",
        "hotline": "0982 254 458",
        "website": "mayaodongphuc.com.vn"
      }
    }
  ],
  "garmentFacts": {
    "productType": "áo thun đồng phục lớp",
    "collar": "cổ tròn",
    "sleeves": "tay ngắn",
    "fit": "form dễ mặc nhìn thấy trong ảnh",
    "colors": ["xanh", "trắng"],
    "pattern": "phối màu xanh trắng theo thiết kế nguồn",
    "approvedArtwork": ["text áo lớp ngắn đặt trong vùng in chính, ví dụ CHỈ CÓ THỂ LÀ 12A1"],
    "removedArtwork": ["mọi logo, tên lớp, tên trường, thương hiệu và chữ gốc trên áo tham chiếu"],
    "visibleSides": ["front"]
  },
  "audiences": ["lớp học", "trường học", "câu lạc bộ học sinh", "sinh viên"],
  "useCases": ["áo lớp", "đồng phục trường học", "sự kiện trường", "CLB", "kỷ yếu"],
  "featureLock": {
    "fabric": {"copy": "Thoáng mát, dễ mặc", "evidenceLevel": "provided"},
    "design": {"copy": "In tên - logo lớp theo yêu cầu", "evidenceLevel": "provided"},
    "durability": {"copy": "Bền màu, dễ bảo quản", "evidenceLevel": "provided"},
    "printing": {"copy": "Text áo lớp ngắn in trong vùng chính", "evidenceLevel": "visible"}
  },
  "unsupportedClaims": ["fabric composition", "GSM", "named printing process", "wash-cycle count", "fixed delivery time", "fixed price"],
  "fidelityCaveats": ["Mặt sau không được suy diễn nếu ảnh tham chiếu không cung cấp thiết kế lưng."],
  "suggestedCategory": {
    "name": "Đồng phục trường học",
    "slug": "dong-phuc-truong-hoc"
  },
  "copySeeds": ["đồng phục lớp", "áo lớp thiết kế riêng", "đồng phục trường học", "đặt may theo yêu cầu"]
}
```

For a sleeveless input, replace the empty `sourceTransformations` array with:

```json
"sourceTransformations": [
  {
    "field": "sleeves",
    "from": "áo ba lỗ hoặc khoét nách sâu",
    "to": "tay ngắn set-in",
    "reason": "chuẩn hóa đồng phục lớp/trường học"
  }
]
```

## Publishing Intent

- Use `action: publish` for the default garment-only workflow.
- Use `action: draft` when the user requests draft.
- Use `action: images-only` when the user explicitly disables CMS mutation.
- Keep tenant, domain, category and quote-only values fixed. Only `action` varies.

## Alt And Caption Boundary

- `altSeed` describes the garment and meaningful school/class scene.
- `captionSeed` is buyer-facing merchandising copy.
- Do not start either field with inventory language such as `Ảnh chụp`, `Hình ảnh`, `Bảng catalog`, `Poster`, `Ba người mẫu`, `Nhóm năm người`, or a model count.
- Do not copy `altSeed` into `captionSeed` by default.
- Avoid naming real schools/classes unless supplied and approved by the user for publication.

## Consumer Fallback

The consumer must reject the manifest and perform full analysis when parsing fails, the producer/schema is unsupported, a checksum differs, or an accepted image is absent. A validated handoff should use the no-view fast path.
