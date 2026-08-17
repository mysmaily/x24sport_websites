---
name: create-tenant-product
description: Create or update X24Sport Payload CMS products for a specified tenant from one or more product images. Use when the user asks to đăng sản phẩm, tạo sản phẩm, upload product, import product, create product listing, or publish sportswear/catalog products to tenants such as mayaobongda.vn, mayaocaulong.vn, mayaopickleball.vn, mayaobongchuyen.vn, mayaobongro.vn, mayaochaybo.vn, x24sport.vn, or rynosport.vn using REST API, image analysis, SEO copy, media search tags, categories, and tenant-scoped verification.
---

# Create Tenant Product

## Purpose

Create a reusable, tenant-safe product publishing workflow for the X24Sport multi-tenant Payload CMS. The user must specify the target tenant/domain, product category, and any extra requirements; if one of those is missing, ask only for the missing item before mutating CMS data.

## Required Context

Read these before acting:

- Root `/Users/hoang/hacado/x24sport_websites/AGENTS.md`.
- Target domain profile: `/Users/hoang/hacado/x24sport_websites/<domain>/AGENTS.md`.
- `/Users/hoang/hacado/x24sport_websites/PAYLOAD-REST-API-GUIDE.md`.
- For copy quality, use `$copywriting` at `/Users/hoang/.agents/skills/copywriting/SKILL.md`. If the product copy is mostly polishing an existing listing, use `copy-editing` after drafting; if the product needs a stronger offer angle, use `offers` before final copy.
- Read `references/seo-copy-tags.md` when drafting title, descriptions, content, attributes, and tags.
- Read `references/rest-product-publishing.md` before running a REST mutation.

## Workflow

1. Confirm scope:
   - Tenant/domain and tenant slug.
   - Category slug/name; resolve it inside the same tenant.
   - Input images: local paths or URLs; support one or many.
   - Extra requirements: gender/audience, product type, price, SKU/source identity, publish vs draft, badges, attributes, brand restrictions, reuse/update behavior.

2. Analyze every image:
   - Identify sport, garment type, collar/sleeve/form, gender/audience, dominant colors, accent colors, pattern/graphic style, logos/text visible, pose/mockup/model context, and likely use case.
   - Do not invent claims about fabric, technology, discounts, stock, sponsorship, or licensed teams unless provided or visually obvious.
   - If image quality or rights are uncertain, create as `draft` and report the factual gap.

3. Draft the product package:
   - Create SEO title/product name, slug, short description, full product content, meta description, attributes, badges, product search tags, media alt text, and per-image media search tags.
   - Product search tags should cover commercial discovery: sport, garment type, audience, use case, color family, style, and category.
   - Media search tags should be more visual: exact color, gradient/pattern, pose, front/back/detail, collar/sleeve, model/team/context, and sport.
   - Use Vietnamese shopping language, compact and factual. Prioritize phrases buyers search for.

4. Prepare REST payload:
   - Use tenant-scoped category and media IDs only.
   - Use stable idempotency: `sourceSystem + sourceId`, SKU, or checksum. Query before creating.
   - Create missing/uncertain listings as `draft`; publish only after factual title, category, price/contact state, media, SEO, and tenant ownership are verified.
   - Optional helper: write a JSON input file and run `scripts/upsert-product.mjs` from this skill folder.

5. Upload media and create/update product:
   - Load only the requested tenant's REST secret from its profile.
   - Upload each image with `POST /api/media`, `_payload.tenant`, factual `alt`, `searchTags`, `sourceSystem`, `sourceId`, `sourceChecksum`.
   - Create or patch `/api/products` with `gallery` as all uploaded media IDs in desired order.
   - Recalculate affected category `productCount` from tenant-scoped published products when a category membership changes.

6. Verify:
   - API product is unique and belongs to the intended tenant.
   - Categories are from the intended tenant.
   - Gallery media belongs to the tenant or is explicitly shared with it.
   - Media URLs return 200.
   - Public product URL returns 200 after the tenant revalidation window.
   - Rendered H1/title, meta description, canonical, price/contact state, gallery alt text, category page inclusion, sitemap inclusion for published products, and search/tag behavior are correct.
   - Run a sibling-tenant isolation query when doing batch or cross-tenant work.

## Helper Script

Use `scripts/upsert-product.mjs` for routine REST publishing after the copy and tags are ready.

Example:

```bash
set +x
source <(ssh root@10.10.0.28 'cat /root/sports-cms/<tenant>-rest-api.env')
node /Users/hoang/hacado/x24sport_websites/.codex/skills/create-tenant-product/scripts/upsert-product.mjs \
  --input /absolute/path/product-input.json \
  --dry-run
node /Users/hoang/hacado/x24sport_websites/.codex/skills/create-tenant-product/scripts/upsert-product.mjs \
  --input /absolute/path/product-input.json \
  --apply
unset PAYLOAD_API_KEY PAYLOAD_API_USER PAYLOAD_AUTH_COLLECTION
```

The input JSON format is documented in `references/rest-product-publishing.md`.

## Output Report

Report:

- Tenant/domain and category.
- Product action: created, updated, or draft only.
- Product ID, slug, SKU/source identity, media IDs, and public URL.
- Verification evidence, including API ownership and public URL status.
- Any remaining factual gaps or manual review items.

Never print API keys or secret values.
