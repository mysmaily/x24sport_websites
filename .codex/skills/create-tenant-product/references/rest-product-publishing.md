# REST Product Publishing

## Input JSON For `scripts/upsert-product.mjs`

```json
{
  "tenantSlug": "mayaobongda",
  "domain": "mayaobongda.vn",
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
      "sourceUrl": "https://optional-source.example/front.webp"
    }
  ]
}
```

`descriptionParagraphs` is converted to Payload Lexical rich text. `attributes[].values`, `badges`, `searchTags`, and media `searchTags` are converted to Payload array-row objects. Local media files may be PNG, JPEG, or WebP in the input JSON, but the helper converts every upload to WebP quality 92 before `POST /api/media`; uploaded filenames, MIME type, and `sourceChecksum` refer to the converted WebP bytes.

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

It searches media by:

1. `tenant.slug + sourceSystem + media.sourceId`.
2. `tenant.slug + sourceChecksum`.

Retries should update existing records rather than create duplicates.

## Required Verification After Apply

Run API checks:

- Product by `tenant.slug + slug`, depth 2.
- Media URLs with `curl -I`.
- Category counts for every affected category.

Run public checks after the tenant revalidation window:

- Product URL `https://<domain>/san-pham/<slug>/` or profile-specific path.
- Category URL contains/loads the product.
- Search URL finds the product by one media tag and one product tag.
- Published products appear in sitemap; drafts should not be public.
