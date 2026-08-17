# Product handoff contract

Use this contract to pass accepted outdoor-uniform images into `create-tenant-product` without duplicating visual analysis or transferring unsupported commercial claims.

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
  "producerSkill": "create-outdoor-uniform-images",
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
      "role": "catalog hero",
      "aspectRatio": "1:1",
      "modelCount": 4,
      "altSeed": "Factual visual description without sales claims",
      "visualTags": ["polo", "trắng vàng", "mặt trước", "nhóm bốn người"],
      "overlay": {
        "logo": "mayaodongphuc-vertical.png",
        "layout": "grid",
        "corner": "bottom-right",
        "theme": "dark",
        "hotline": "0989 353 247"
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

## Consumer fallback

Treat the handoff as unusable and perform full image analysis when any of these is true:

- no manifest is supplied or discoverable;
- JSON cannot be parsed or `schemaVersion` is unsupported;
- producer identity or required sections are missing;
- an input image is omitted, missing on disk, or has a checksum mismatch;
- manifest facts conflict with the final image or current user brief.

Do not fail product creation merely because a handoff is absent. Fail or create a draft only for an actual product uncertainty, unsafe branding, missing target scope, or publishing validation problem.
