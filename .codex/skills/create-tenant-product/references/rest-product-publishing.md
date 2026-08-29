# REST Product Publishing

## Input JSON For `scripts/upsert-product.mjs`

```json
{
  "tenantSlug": "mayaobongda",
  "domain": "mayaobongda.vn",
  "uploadFormat": "webp",
  "webpQuality": 100,
  "sourceSystem": "manual-product-upload-20260817",
  "sourceId": "stable-product-id-or-sku",
  "categorySlugs": ["ao-bong-da", "ao-bong-da-mau-do"],
  "product": {
    "name": "Áo bóng đá đỏ đen đặt may cho đội bóng",
    "slug": "ao-bong-da-do-den-dat-may-cho-doi-bong",
    "sku": "MBD-MANUAL-001",
    "sport": "football",
    "productType": "simple",
    "publicationStatus": "draft",
    "featured": false,
    "price": 119000,
    "regularPrice": 139000,
    "salePrice": 119000,
    "compareAtPrice": 139000,
    "currency": "VND",
    "stockStatus": "instock",
    "isPurchasable": false,
    "isOnBackorder": false,
    "shortDescription": "Mô tả ngắn...",
    "descriptionParagraphs": ["Đoạn 1", "Đoạn 2"],
    "attributes": [
      { "name": "Dòng áo", "values": ["Áo bóng đá đặt may"] },
      { "name": "Màu sắc", "values": ["Đỏ", "Đen"] }
    ],
    "badges": ["Đặt may", "In tên số"],
    "searchTags": ["áo bóng đá", "đỏ đen", "in tên số"],
    "seoTitle": "Áo bóng đá đỏ đen đặt may cho đội bóng | MayAoBongDa.vn",
    "metaDescription": "Mô tả SEO 140-158 ký tự...",
    "legacyPath": "/san-pham/ao-bong-da-do-den-dat-may-cho-doi-bong/"
  },
  "media": [
    {
      "path": "/absolute/path/front.webp",
      "alt": "Áo bóng đá đỏ đen mặt trước",
      "searchTags": ["áo bóng đá", "đỏ đen", "mặt trước", "mockup áo"],
      "sourceId": "stable-image-front",
      "filenameBase": "ao-bong-da-do-den-dat-may-anh-chinh",
      "sourceUrl": "https://optional-source.example/front.webp"
    }
  ]
}
```

`descriptionParagraphs` is converted to Payload Lexical rich text. `attributes[].values`, `badges`, `searchTags`, and media `searchTags` are converted to Payload array-row objects. Local media files may be PNG, JPEG, or WebP in the input JSON, but the helper always converts them to WebP quality 100 before `POST /api/media`; uploaded filenames, MIME type, and `sourceChecksum` refer to the converted WebP bytes. `uploadFormat` must be `"webp"`; PNG uploads are rejected. By default, upload filenames use the product slug plus `anh-chinh`, `anh-2`, etc. Set media `filenameBase` for a clearer Vietnamese ASCII basename. Use `forceUploadForFilename: true` only for a deliberate one-time media rename migration; normal retries should leave it unset to preserve idempotency.

For storefronts that support contextual product media, including Mayaobongda and Mayaodongphuc, `media[0]` is the gallery hero and `media[1..n]` is reused below the long product description as semantic `<figure><img><figcaption>` content. The helper requires every media item after the first to include buyer-natural `alt` text because those storefronts may also display it as the visible caption. Do not use artifact labels such as "ảnh 2", "mockup", or raw model-count analysis in those fields.

## Environment

The script expects:

- `CMS_API_URL`, default `https://cms.x24sport.vn`.
- `TENANT_SLUG`, optional when `input.tenantSlug` is set.
- `PAYLOAD_API_KEY`, required for `--apply`.

Always source the env file from the target tenant profile. Do not source sibling tenant secrets.

## Commands

Dry run:

```bash
node /Users/hoang/hacado/x24sport_websites/.codex/skills/create-tenant-product/scripts/upsert-product.mjs --input=/absolute/path/product-input.json --dry-run
```

Apply:

```bash
node /Users/hoang/hacado/x24sport_websites/.codex/skills/create-tenant-product/scripts/upsert-product.mjs --input=/absolute/path/product-input.json --apply
```

## Idempotency Rules

The script searches existing products by:

1. `tenant.slug + sourceSystem + sourceId` when both source fields exist.
2. `tenant.slug + sku` when SKU exists.
3. `tenant.slug + slug` as final fallback.

For `mayaodongphuc.com.vn`, new product SKUs must use `X24-DP-DDHHSS`, with `DDHHSS` taken from the local production timezone at allocation time. Always query the tenant by SKU before create. If a same-second collision exists, wait or advance to the next second and query again. Retries must find the existing product by `sourceSystem + sourceId`, SKU, or slug and update it instead of allocating a fresh SKU.

Validated `tao-anh-ao-ngo-nghinh` handoffs are the exception: preserve their preallocated `X24-DP-HHSSMM` SKU, use `sourceSystem=tao-anh-ao-ngo-nghinh` and `sourceId=<SKU>`, and do not allocate a replacement. For schema `1.1`, upload only the three accepted WebP images in order—marketing hero, student lifestyle, exact 500×500 print preview. Legacy schema `1.0` keeps hero plus preview. The 4500×4500 PNG print master is source-only and must not appear in the REST media payload.

It searches media by:

1. `tenant.slug + sourceSystem + media.sourceId`.
2. `tenant.slug + sourceChecksum`.

Retries should update existing records rather than create duplicates.

## Required Verification After Apply

Run API checks:

- Product by `tenant.slug + slug`, depth 2.
- Media URLs with `curl -I`.
- Category counts for every affected category.

Run fast public checks without waiting for the tenant revalidation window:

- Product URL `https://<domain>/san-pham/<slug>/` or profile-specific path.
- The product URL returning HTTP 200 is sufficient for the default publish workflow after the REST create/update succeeds.
- Category URL inclusion, search URL discovery, and sitemap inclusion are cache/revalidation-dependent deeper checks. Run them only when the user explicitly requests full verification or troubleshooting.
- Drafts should not be public when the requested action is draft.
