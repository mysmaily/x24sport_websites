---
name: create-tenant-product
description: Create or update X24Sport Payload CMS products for a specified tenant from one or more product images, optionally consuming a validated upstream product-handoff manifest and falling back to full image analysis when no usable manifest exists. Use when the user asks to đăng sản phẩm, tạo sản phẩm, upload product, import product, create product listing, or publish sportswear/catalog products to tenants such as mayaobongda.vn, mayaocaulong.vn, mayaopickleball.vn, mayaobongchuyen.vn, mayaobongro.vn, mayaochaybo.vn, x24sport.vn, or rynosport.vn using REST API, image analysis, SEO copy, media search tags, categories, and tenant-scoped verification.
---

# Create Tenant Product

## Purpose

Create a reusable, tenant-safe product publishing workflow for the X24Sport multi-tenant Payload CMS. The user normally specifies the target tenant/domain and category. A validated handoff may supply those values and publication intent; when it does, use them without asking again.

## Required Context

Read these before acting:

- Root `/Users/hoang/hacado/x24sport_websites/AGENTS.md`.
- Target domain profile: `/Users/hoang/hacado/x24sport_websites/<domain>/AGENTS.md`.
- `/Users/hoang/hacado/x24sport_websites/PAYLOAD-REST-API-GUIDE.md`.
- For copy quality, use `$copywriting` at `/Users/hoang/.agents/skills/copywriting/SKILL.md`. If the product copy is mostly polishing an existing listing, use `copy-editing` after drafting; if the product needs a stronger offer angle, use `offers` before final copy.
- Read `references/seo-copy-tags.md` when drafting title, descriptions, content, attributes, and tags.
- Read `references/rest-product-publishing.md` before running a REST mutation.
- When an upstream `product-handoff.json` is supplied or discoverable beside the input images, read its producer-specific contract before using it. For V4 outdoor uniform outputs, read `/Users/hoang/hacado/x24sport_websites/.codex/skills/create-outdoor-uniform-images-v4/references/product-handoff.md`; for legacy outputs, read `/Users/hoang/hacado/x24sport_websites/.codex/skills/create-outdoor-uniform-images/references/product-handoff.md`.
- For `create-mayaodongphuc-outdoor-product-images`, read `/Users/hoang/hacado/x24sport_websites/.codex/skills/create-mayaodongphuc-outdoor-product-images/references/product-handoff.md` and validate with that producer's `scripts/validate_product_handoff.py`. For `create-mayaodongphuc-outdoor-product-images-v2`, read `/Users/hoang/hacado/x24sport_websites/.codex/skills/create-mayaodongphuc-outdoor-product-images-v2/references/product-handoff.md` and validate with its v2 validator. Do not send either Mayaodongphuc producer through a legacy validator.

## Workflow

1. Confirm scope:
   - Tenant/domain and tenant slug.
   - Category slug/name; resolve it inside the same tenant.
   - Input images: local paths or URLs; support one or many.
   - Optional handoff: an explicitly supplied manifest, or `product-handoff.json` beside the local input images.
   - Extra requirements: gender/audience, product type, price, SKU/source identity, publish vs draft, badges, attributes, brand restrictions, reuse/update behavior.
   - Validated Mayaodongphuc handoff exception: when `publishingIntent` supplies the tenant, domain, category and action, treat those as confirmed scope. `action=publish` authorizes immediate CMS publication, `draft` authorizes draft creation, and `images-only` forbids CMS mutation. Do not ask for missing optional requirements when the documented defaults cover them.

2. Resolve the handoff or analyze from scratch:
   - Prefer a manifest only when its schema is supported, every publishing image is listed, paths resolve, and checksums match. Select the validator from `producerSkill`: use the matching producer skill's `scripts/validate_product_handoff.py` and pass every input image. Never substitute a validator that rejects or weakens the declared producer contract.
   - Validated-handoff fast path: when the producer-specific validator passes for every publishing image and the manifest declares `consumerPolicy.visualInspection=not-required-after-validation`, do not call `view_image`, OCR, image search, or any other pixel-analysis tool. Trust the producer's accepted visual facts, roles, tags, `altSeed`, `captionSeed`, caveats and unsupported-claim boundary. The matching checksums prove that the handed-off facts refer to the exact bytes being published.
   - On the fast path, the user's explicit non-visual brief still overrides manifest suggestions such as audience or commercial positioning. Do not invent a pixel conflict or reopen the images merely to double-check the producer.
   - Treat handoff `sourceTransformations` as private production provenance. Use `garmentFacts` for the final listing and do not tell shoppers that a sleeveless source was converted. For this Mayaodongphuc producer, a sleeve normalization means the published garment is an ordinary short-sleeve shirt.
   - For a validated Mayaodongphuc handoff with `publishingIntent.action=publish`, continue through REST mutation and fast public verification in the same task. Use quote-only commerce defaults, derive stable `sourceId` from `producerSkill + acceptedImages[0].sha256`, and query existing tenant products before allocating a SKU. Use the next available `MDP-DN-###` SKU for the original Mayaodongphuc producer, but use the separate `MDP-DN-V2-###` range for `create-mayaodongphuc-outdoor-product-images-v2` so v2 products do not collide with batch imports using the legacy numeric range. A retry must update the existing product rather than consume another SKU.
   - If no manifest exists, it is unreadable, validation fails, its schema is unsupported, it omits an input image, or a checksum differs, do not block solely because of the manifest. Perform the complete image analysis below and record that fallback was used.
   - Full analysis must identify sport/use case, garment type, collar/sleeve/form, gender/audience, dominant and accent colors, pattern/graphic style, approved logos/text, pose/view/context, and likely buyer use case for every image.
   - Never infer fabric composition, named printing technology, durability metrics, discounts, stock, sponsorship, or licensing from either pixels or a `restrained-default` overlay claim.
   - If image quality, design fidelity, approved branding, or rights remain uncertain after analysis, create as `draft` and report the factual gap.

3. Draft the product package:
   - Create SEO title/product name, slug, short description, full product content, meta description, attributes, badges, product search tags, media alt text, optional per-image visible captions, and per-image media search tags.
   - Treat the first gallery image as the primary hero. When a handoff marks images with `productPlacement.contentEmbed=true`, prepare exactly those images for contextual reuse below the long description as real `<img>` content, in `contentOrder`. Without placement hints, prepare every image after the first for contextual reuse below the long description with a factual, buyer-natural caption. Captions must read like storefront merchandising copy, not like raw alt text or image-analysis notes.
   - Keep `alt` and visible `figcaption` distinct when the CMS/storefront supports it. Alt text should be concise accessibility text describing the image; captions should be shorter, more natural, and commerce-aware, e.g. “Mẫu áo trắng xanh dễ nổi bật khi chụp ảnh nhóm ngoài trời.” Never use inventory or artifact phrasing such as “Ba người mẫu Việt Nam...”, “Nhóm năm người mẫu...”, “Bảng catalog...”, “Ảnh chụp...”, or “Hình ảnh...” as storefront copy.
   - Never copy a handoff `altSeed` into the visible caption. Use `captionSeed` for the caption after checking it against the validated manifest facts. For the current Mayaodongphuc storefront, which renders `media.alt` as the contextual figcaption, write one buyer-natural hybrid media alt derived primarily from `captionSeed` while retaining the essential garment/scene subject. It must not start with a model count, nationality, image role, or artifact label.
   - Product search tags should cover commercial discovery: sport, garment type, audience, use case, color family, style, and category.
   - Describe and sell the shirt only. Shorts, skirts/skorts and trousers visible on models are scene styling unless the user explicitly defines a set; do not add them to the product name, attributes, badges or included-items copy.
   - Media search tags should be more visual: exact color, gradient/pattern, pose, front/back/detail, collar/sleeve, model/team/context, and sport.
   - Use Vietnamese shopping language, compact and factual. Prioritize phrases buyers search for.
   - This skill owns the final product name, slug, SKU/source identity, descriptions, SEO metadata, attributes, badges, product/media tags, commercial state, and REST payload. Upstream copy seeds are suggestions only.

4. Prepare REST payload:
   - Use tenant-scoped category and media IDs only.
   - Use stable idempotency: `sourceSystem + sourceId`, SKU, or checksum. Query before creating.
   - Create missing/uncertain listings as `draft`; publish only after factual title, category, price/contact state, media, SEO, and tenant ownership are verified.
   - Optional helper: write a JSON input file and run `scripts/upsert-product.mjs` from this skill folder.

5. Upload media and create/update product:
   - Load only the requested tenant's REST secret from its profile.
   - Convert every local input image to WebP quality 92 before upload. Upload only the converted `.webp` bytes with `POST /api/media`, `_payload.tenant`, factual `alt`, `searchTags`, `sourceSystem`, `sourceId`, `sourceChecksum`. The checksum and filename should describe the converted WebP bytes, not the original PNG/JPEG source. Uploaded filenames should be based on the product slug plus an image role such as `anh-chinh` or `anh-2`; use media `filenameBase` only when a clearer product-specific basename is needed.
   - Create or patch `/api/products` with `gallery` as all uploaded media IDs in desired order.
   - Do not upload duplicate files for editorial placement. Reuse gallery media IDs/URLs. On a supporting storefront, render `gallery[1..n]` after the long description as semantic `<figure><img><figcaption>` blocks; keep the primary image only in the gallery/hero area.
   - Give contextual images explicit dimensions or an aspect ratio, `loading="lazy"`, and `decoding="async"`. Use reviewed media facts as the basis for `alt` and caption, but do not blindly reuse alt text as visible caption. If another storefront only renders `media.alt` as the caption, apply the same reviewed hybrid rule and report the limitation. Do not silently expose raw analysis notes.
   - If the target storefront cannot render contextual gallery media, do not inject unsafe raw HTML or silently upload copies. Route the bounded UI change through `develop-x24sport-websites`, then typecheck, build, deploy, and verify it before claiming the product page is complete.
   - Recalculate affected category `productCount` from tenant-scoped published products when a category membership changes.

6. Verify:
   - API product is unique and belongs to the intended tenant.
   - Categories are from the intended tenant.
   - Gallery media belongs to the tenant or is explicitly shared with it.
   - Media URLs return 200.
   - Public product URL returns HTTP 200. Do not wait for the tenant cache/revalidation window once the create/update response and public product URL are both 200.
   - Fast page checks should cover rendered H1/title, canonical, and gallery/media presence when available in the first public product response.
   - Category page inclusion, sitemap inclusion, search/tag behavior, and other cache/revalidation-dependent storefront checks are optional deeper verification. Run them only when the user explicitly requests full verification or troubleshooting.
   - For products with multiple images, check the rendered product page for one contextual `<figure>` for each non-primary gallery image, a visible factual `<figcaption>`, and no duplicate media record when those checks are available in the first public product response. Do not wait solely to prove these refreshed after cache.
   - Run a sibling-tenant isolation query when doing batch or cross-tenant work.
   - Report whether a validated handoff or full-analysis fallback supplied the visual facts.

## Helper Script

Use `scripts/upsert-product.mjs` for routine REST publishing after the copy and tags are ready. The helper converts local media to WebP quality 92 before upload.

Example:

```bash
set +x
source <(ssh root@10.10.0.28 'cat /root/sports-cms/<tenant>-rest-api.env')
node /Users/hoang/hacado/x24sport_websites/.codex/skills/create-tenant-product/scripts/upsert-product.mjs \
  --input=/absolute/path/product-input.json \
  --dry-run
node /Users/hoang/hacado/x24sport_websites/.codex/skills/create-tenant-product/scripts/upsert-product.mjs \
  --input=/absolute/path/product-input.json \
  --apply
unset PAYLOAD_API_KEY PAYLOAD_API_USER PAYLOAD_AUTH_COLLECTION
```

The input JSON format is documented in `references/rest-product-publishing.md`.

## Output Report

Report:

- Tenant/domain and category.
- Product action: created, updated, or draft only.
- Product ID, slug, SKU/source identity, media IDs, and public URL.
- Verification evidence, including API ownership, media URL status, and public product URL status. Note when cache-dependent category, sitemap, or search checks were intentionally skipped.
- Contextual image result for multi-image products: rendered count, caption source, and whether existing media was reused.
- Handoff result: manifest path, schema version, producer skill, validator used, and whether `captionSeed` or full-analysis fallback supplied contextual copy.
- Visual-analysis result: explicitly report `skipped—validated checksum handoff` on the fast path; otherwise report why fallback image analysis was necessary.
- Any remaining factual gaps or manual review items.

Never print API keys or secret values.
