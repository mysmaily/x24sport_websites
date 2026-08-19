# Product handoff contract

Use this manifest to transfer accepted Mayaodongphuc outdoor product images into `create-tenant-product`. The v2 image skill owns visible garment facts, accepted file identity, image roles, visual tags, safe seed copy and explicit uncertainty. The publishing skill owns the final product name, SKU/source identity, category resolution, commercial state, SEO copy and CMS mutation.

The producer performs the full-size visual inspection and rejects defects before calculating checksums. Once this manifest validates against the exact delivered bytes, the consumer must not reopen or re-analyze the images. The user's explicit non-visual brief may still override audience, positioning or other publishing suggestions.

## Placement and discovery

- Name the file exactly `product-handoff.json`.
- Put it beside the accepted publishing images in a product-specific output directory.
- Use absolute paths and SHA-256 checksums from the final saved bytes.
- List every delivered publishing image and no intermediate generation asset.
- The default set contains exactly one `product hero` followed by one `content-inline catalog`.

## Schema

```json
{
  "schemaVersion": "1.0",
  "producerSkill": "create-mayaodongphuc-outdoor-product-images-v2",
  "createdAt": "2026-08-19T12:00:00+07:00",
  "consumerPolicy": {
    "visualInspection": "not-required-after-validation"
  },
  "publishingIntent": {
    "action": "publish",
    "tenantSlug": "mayaodongphuc",
    "domain": "mayaodongphuc.com.vn",
    "categorySlug": "dong-phuc-da-ngoai-team-building",
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
      "path": "/absolute/path/generated/mayaodongphuc-outdoor-product-images-v2/mayaodongphuc-product/mayaodongphuc-product-main.png",
      "sha256": "64 lowercase hexadecimal characters",
      "role": "product hero",
      "aspectRatio": "1:1",
      "modelCount": 5,
      "altSeed": "Đội nhóm mặc áo ombre xanh tím hồng đồng bộ trong hoạt động ngoài trời tại công viên.",
      "captionSeed": "Mẫu ombre xanh tím hồng tạo điểm nhấn trẻ trung khi cả đội hoạt động ngoài trời.",
      "visualTags": ["đồng phục dã ngoại", "ombre xanh tím hồng", "cổ tròn", "tay ngắn", "công viên"],
      "productPlacement": {
        "gallery": true,
        "contentEmbed": false,
        "contentOrder": null
      },
      "overlay": {
        "campaignLogo": "mayaodongphuc-logo.png",
        "garmentWordmark": "Đồng Phục X24",
        "hotline": "0982 254 458"
      }
    },
    {
      "path": "/absolute/path/generated/mayaodongphuc-outdoor-product-images-v2/mayaodongphuc-product/mayaodongphuc-product-catalog.png",
      "sha256": "64 lowercase hexadecimal characters",
      "role": "content-inline catalog",
      "aspectRatio": "5:4",
      "modelCount": 6,
      "altSeed": "Thiết kế áo ombre xanh tím hồng trong hoạt động team building ngoài trời, kèm thông tin tư vấn đặt may.",
      "captionSeed": "Phối ombre xanh tím hồng giúp đội nhóm nổi bật trong trò chơi team building ngoài trời.",
      "visualTags": ["catalog đồng phục", "ombre xanh tím hồng", "team building", "hotline", "công viên"],
      "productPlacement": {
        "gallery": true,
        "contentEmbed": true,
        "contentOrder": 1
      },
      "overlay": {
        "campaignLogo": "mayaodongphuc-logo.png",
        "garmentWordmark": "Đồng Phục X24",
        "title": "ĐỒNG PHỤC / DÃ NGOẠI",
        "slogan": "Bứt phá cùng đội nhóm",
        "hotline": "0982 254 458",
        "website": "mayaodongphuc.com.vn"
      }
    }
  ],
  "garmentFacts": {
    "productType": "áo thun đồng phục dã ngoại",
    "collar": "cổ tròn",
    "sleeves": "tay ngắn",
    "fit": "form thể thao nhìn thấy trong ảnh",
    "colors": ["xanh dương", "tím", "hồng"],
    "pattern": "ombre xanh dương qua tím xuống hồng",
    "approvedArtwork": ["Đồng Phục X24 đặt giữa ngực bằng màu tonal"],
    "removedArtwork": ["mọi logo, thương hiệu và chữ gốc trên áo tham chiếu"],
    "visibleSides": ["front"]
  },
  "audiences": ["doanh nghiệp", "đội nhóm", "câu lạc bộ", "lớp học"],
  "useCases": ["dã ngoại", "picnic", "team building", "sự kiện nhóm"],
  "featureLock": {
    "fabric": {"copy": "Thoáng mát", "evidenceLevel": "provided"},
    "design": {"copy": "Co giãn linh hoạt", "evidenceLevel": "provided"},
    "durability": {"copy": "Bền màu, dễ bảo quản", "evidenceLevel": "provided"},
    "printing": {"copy": "Đồng Phục X24 in tonal giữa ngực", "evidenceLevel": "visible"}
  },
  "unsupportedClaims": ["fabric composition", "GSM", "named printing process", "wash-cycle count", "fixed delivery time", "fixed price"],
  "fidelityCaveats": ["Mặt sau không được suy diễn nếu ảnh tham chiếu không cung cấp thiết kế lưng."],
  "suggestedCategory": {
    "name": "Đồng phục dã ngoại - team building",
    "slug": "dong-phuc-da-ngoai-team-building"
  },
  "copySeeds": ["đồng phục dã ngoại", "áo team building", "ombre xanh tím hồng", "đặt may theo yêu cầu"]
}
```

For a sleeveless input, replace the empty `sourceTransformations` array with a factual normalization record:

```json
"sourceTransformations": [
  {
    "field": "sleeves",
    "from": "áo ba lỗ hoặc khoét nách sâu",
    "to": "tay ngắn set-in",
    "reason": "chuẩn hóa đồng phục dã ngoại"
  }
]
```

In that case, `garmentFacts.sleeves` must be `tay ngắn` and all visual tags, alt/caption seeds and downstream attributes must describe the accepted short-sleeve output. The transformation is provenance, not storefront copy. For an input that already has suitable sleeves, use an empty array.

## Publishing intent

- Use `action: publish` for the default garment-only workflow. This instructs `create-tenant-product` to continue immediately without asking for tenant, category, price or publication state.
- Use `action: draft` only when the user requests a draft.
- Use `action: images-only` when the user explicitly requests local/preview/image-only output or only one image role. Do not invoke the CMS publisher for this action.
- Keep the Mayaodongphuc tenant, domain, outdoor category and quote-only values shown in the schema fixed. Only `action` varies between the three supported workflow modes.
- The consumer derives stable source identity from the producer plus the accepted main-image checksum. It allocates the next available tenant-scoped `MDP-DN-###` SKU only when no existing source identity, SKU or slug matches.

## Alt and caption boundary

- `altSeed` describes the garment and meaningful scene for accessibility. It must be factual, concise and useful without counting people unless the count is genuinely necessary to understand the image.
- `captionSeed` is buyer-facing merchandising copy. It should explain styling, group visibility or use case in natural Vietnamese.
- Never start either field with inventory language such as `Ảnh chụp`, `Hình ảnh`, `Bảng catalog`, `Poster`, `Ba người mẫu`, `Nhóm năm người`, or a numeric model count.
- Never use `catalog`, `ảnh chính`, `ảnh số 2`, model nationality, or the generation artifact as the sentence's subject.
- Do not copy `altSeed` into `captionSeed` by default. They have different jobs.

The current Mayaodongphuc storefront uses `media.alt` as the visible caption for contextual gallery images. Until the storefront has a separate caption field, `create-tenant-product` must derive a hybrid final `media.alt` from `captionSeed` plus the essential visual subject. The handoff still preserves both seeds so a future storefront can separate them without re-analysis.

## Consumer fallback

The consumer must reject the manifest and perform full analysis when parsing fails, the producer or schema is unsupported, `consumerPolicy` is missing or unsupported, an accepted image is absent, a checksum differs, or an input image is omitted. A missing handoff alone must not block product creation. A validated handoff must use the no-view fast path; do not spend image tokens repeating the producer's completed visual analysis.
