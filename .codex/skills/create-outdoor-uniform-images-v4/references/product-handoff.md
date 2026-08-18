# Product handoff contract

Use this contract to pass accepted outdoor-uniform images into `create-tenant-product` without duplicating visual analysis or transferring unsupported commercial claims. For V4, the default publishing set is exactly 3 accepted images: Image 1, Image 2, and Catalog.

## Ownership boundary

The image skill owns visual facts, image quality, overlay facts, file identity, and explicit uncertainty. The publishing skill owns tenant/category resolution, final product copy, SEO, SKU/source identity, commercial state, REST mutation, and public verification.

The publishing skill must still inspect every final image. A valid handoff accelerates analysis; it never overrides visible pixels or the user-provided brief.

## File placement and discovery

- Use the filename `product-handoff.json`.
- Place it beside the accepted images when possible.
- Use absolute paths for local source references and accepted images.
- A consumer may use an explicitly supplied path or discover the file beside local inputs.
- Consume a discovered manifest only when every publishing image is listed and its SHA-256 matches.

## Schema

```json
{
  "schemaVersion": "1.0",
  "producerSkill": "create-outdoor-uniform-images-v4",
  "createdAt": "2026-08-17T12:00:00+07:00",
  "sourceReferences": [
    {
      "path": "/absolute/path/reference.png",
      "classification": "exact design"
    }
  ],
  "acceptedImages": [
    {
      "path": "/absolute/path/hero.png",
      "sha256": "64 lowercase hexadecimal characters",
      "role": "product hero",
      "aspectRatio": "3:2",
      "modelCount": 4,
      "altSeed": "Factual visual description without sales claims",
      "captionSeed": "Natural buyer-facing caption for contextual use when this image appears below product copy",
      "visualTags": ["polo", "trắng vàng", "mặt trước", "nhóm bốn người"],
      "productPlacement": {
        "gallery": true,
        "contentEmbed": false,
        "contentOrder": null
      },
      "overlay": {
        "logo": "mayaodongphuc-vertical.png",
        "layout": "grid",
        "corner": "bottom-right",
        "theme": "dark",
        "hotline": "0989 353 247"
      }
    },
    {
      "path": "/absolute/path/image-2.png",
      "sha256": "64 lowercase hexadecimal characters",
      "role": "content-inline lifestyle",
      "aspectRatio": "3:2",
      "modelCount": 5,
      "altSeed": "Factual visual description for Image 2",
      "captionSeed": "Natural Vietnamese caption for product content",
      "visualTags": ["dã ngoại", "team building", "mặt trước"],
      "productPlacement": {
        "gallery": true,
        "contentEmbed": true,
        "contentOrder": 1,
        "htmlTag": "<img src=\"PUBLIC_MEDIA_URL_FOR_IMAGE_2\" alt=\"ALT_SEED\" />"
      }
    },
    {
      "path": "/absolute/path/catalog.png",
      "sha256": "64 lowercase hexadecimal characters",
      "role": "content-inline catalog",
      "aspectRatio": "3:2",
      "modelCount": 0,
      "altSeed": "Factual visual description for the catalog board",
      "captionSeed": "Natural Vietnamese caption for the catalog board",
      "visualTags": ["catalog", "đồng phục", "tính năng"],
      "productPlacement": {
        "gallery": true,
        "contentEmbed": true,
        "contentOrder": 2,
        "htmlTag": "<img src=\"PUBLIC_MEDIA_URL_FOR_CATALOG\" alt=\"ALT_SEED\" />"
      }
    }
  ],
  "garmentFacts": {
    "productType": "polo",
    "collar": "cổ polo",
    "sleeves": "tay ngắn",
    "fit": "form gọn nhìn thấy trong ảnh",
    "colors": ["trắng", "vàng", "cam"],
    "pattern": "chuyển sắc trắng vàng với nét gạch cam",
    "approvedArtwork": ["logo X24 đỏ nhỏ ở ngực trái"],
    "visibleSides": ["front", "three-quarter-front"]
  },
  "audiences": ["doanh nghiệp", "đội nhóm"],
  "useCases": ["dã ngoại", "picnic", "team building"],
  "featureLock": {
    "fabric": {
      "copy": "Vải mềm nhẹ",
      "evidenceLevel": "restrained-default"
    },
    "design": {
      "copy": "Cổ polo gọn",
      "evidenceLevel": "visible"
    },
    "durability": {
      "copy": "Bền màu, giữ form",
      "evidenceLevel": "restrained-default"
    },
    "printing": {
      "copy": "Hình in sắc nét",
      "evidenceLevel": "visible"
    }
  },
  "unsupportedClaims": [
    "fabric composition",
    "GSM",
    "named printing process",
    "wash-cycle durability",
    "fixed delivery time",
    "fixed price"
  ],
  "fidelityCaveats": ["Only the front design was supplied; no back artwork was invented."],
  "suggestedCategory": {
    "name": "Đồng phục dã ngoại - team building",
    "slug": "dong-phuc-da-ngoai-team-building"
  },
  "copySeeds": ["áo polo đồng phục", "trắng vàng", "họa tiết gạch cam"]
}
```

## Evidence levels

- `provided`: explicitly supplied by the user or material brief; usable as a product fact.
- `visible`: directly supported by accepted pixels; usable only for what is visibly shown.
- `restrained-default`: safe overlay wording used because evidence is incomplete; never promote it into a technical or durability claim in product copy.

## Alt and caption seeds

- `altSeed` describes the image for accessibility and media indexing. Keep it accurate, concise, and factual.
- `captionSeed` is optional for hero images but recommended for supporting/contextual images. It should read like natural Vietnamese storefront copy that helps shoppers picture the use case or styling benefit.
- Avoid caption seeds that merely count models or classify people, such as “Ba người mẫu Việt Nam...” or “Nhóm năm người mẫu...”. Prefer human-facing lines like “Mẫu áo trắng xanh dễ nổi bật khi chụp ảnh nhóm ngoài trời.” or “Set áo cổ tròn tay ngắn phù hợp picnic và team building công ty.”

## Product content embedding

When `productPlacement.contentEmbed` is `true`, the publishing workflow should upload the image to public media, then insert it into product content as an actual HTML image tag using the uploaded public URL. For V4 defaults:

- embed `Image 2` first in the product content;
- embed `Catalog` after Image 2;
- do not embed `Image 1` in content by default because it is the product hero/gallery image;
- preserve the manifest `altSeed` as the `alt` value, adjusted only if the publisher discovers a visible factual mismatch.

## Consumer fallback

Treat the handoff as unusable and perform full image analysis when any of these is true:

- no manifest is supplied or discoverable;
- JSON cannot be parsed or `schemaVersion` is unsupported;
- producer identity or required sections are missing;
- an input image is omitted, missing on disk, or has a checksum mismatch;
- manifest facts conflict with the final image or current user brief.

Do not fail product creation merely because a handoff is absent. Fail or create a draft only for an actual product uncertainty, unsafe branding, missing target scope, or publishing validation problem.
