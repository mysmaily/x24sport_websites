---
name: convert-pickleball-to-billiards
description: Use when converting pickleball apparel reference images into X24Sport billiards / bi-a catalog products for next.x24sport.vn. Supports image analysis, AI image generation/editing, the mandatory long-pants rule for all visible models, Vietnamese SEO product content, Payload CMS media/product import, category assignment to bi-a, backup, idempotency checks, and public verification.
---

# Convert Pickleball To Billiards

## Purpose

Create new X24Sport billiards apparel products from pickleball apparel images.
Treat the source image as a garment design reference only: preserve the shirt
colorway, polo shape, collar, short sleeves, and commercial catalog composition,
but convert the scene, props, graphics, copy, and catalog data to bi-a.

## Fixed Scope

```yaml
destination_site: next.x24sport.vn
tenant_slug: x24sport
category_slug: bi-a
cms_origin: http://10.10.0.28:3001
public_media_base: https://static.x24sport.vn
product_collection: products
media_collection: media
image_output_rule: save_generated_assets_in_operation_folder
pricing_rule: use_contact_price_when_no_price_is_provided
required_clothing_rule: all_visible_models_wear_long_black_pants
```

Also load and follow `develop-x24sport-websites` when the request includes
public catalog, product content, SEO, or production verification.

## Workflow

1. Establish scope.
   - Target only `x24sport.vn` / `next.x24sport.vn` unless the user explicitly
     names another tenant.
   - Read root `AGENTS.md`, `x24sport.vn/AGENTS.md`, and `cms-api/AGENTS.md`.
   - If the request mentions SEO, load the optimization guide according to repo
     rules.

2. Create an operation folder.

```bash
mkdir -p x24sport.vn/operations/bi-a-batch-YYYYMMDD/{sources,generated,backups,reports}
```

3. Download every source URL into `sources/`.
   - Preserve the original order.
   - Derive the source product code from the filename, for example
     `x24-pb-541` becomes `BA-541`.
   - Record failures instead of silently skipping images.

4. Generate or edit images using the built-in `imagegen` skill.
   - Use each source image as the edit target / design reference.
   - Save every accepted output into `generated/x24-ba-###.png`.
   - Inspect outputs before import. Reject and regenerate if any visible model
     wears shorts, a skirt, or a dress.

Prompt invariants:

```text
Convert this pickleball apparel photo into a billiards / pool apparel product image.
Preserve the shirt color palette, pattern placement, collar polo silhouette,
short sleeves, and X24-style chest mark from the source image.
Scene: modern billiards club interior with green felt pool table, overhead table
lights, dark wood and matte black details.
Mandatory clothing rule: every visible model must wear long black athletic
trousers/pants down to the ankles. No shorts, no skirt, no dress.
Replace pickleball paddles/court/net with natural billiards cues and
billiards-table elements.
Add subtle premium billiards graphics on the shirt only: cue ball / 8-ball line
motif, slim cue-stick diagonal accents, tiny green-felt piping.
No website text, hotline, watermark, or promotional overlay.
Avoid pickleball references, tennis/padel court, paddles, net, distorted
hands/faces/cues, extra people, unreadable text.
```

5. Write product content.
   - Use Vietnamese shopper-facing names: `Áo bi-a X24 BA-### <Màu>`.
   - Use stable ASCII slugs: `ao-bi-a-x24-ba-###-<mau-ascii>`.
   - Use `sku: X24-BA-###`.
   - Use `sport: other` until the CMS schema supports a dedicated billiards
     sport option; category relation to `bi-a` is the catalog signal.
   - Do not invent price, reviews, shipping, stock claims, fabric specs, or
     guarantees. If no price is supplied, leave price fields empty so the page
     displays contact pricing.
   - See `references/content-and-import.md` for content fields and import
     checks.

6. Import into Payload CMS.
   - Start from `scripts/import_billiards_batch.py`.
   - Patch `SPECS` and `SOURCE_TIMESTAMP` for the current batch.
   - Run dry-run first.
   - Run `--apply` only after dry-run succeeds.
   - Rerun once to confirm all media/products become `unchanged`.

Example:

```bash
python .codex/skills/convert-pickleball-to-billiards/scripts/import_billiards_batch.py \
  --cms-api http://10.10.0.28:3001 \
  --base-dir x24sport.vn/operations/bi-a-batch-YYYYMMDD

python .codex/skills/convert-pickleball-to-billiards/scripts/import_billiards_batch.py \
  --cms-api http://10.10.0.28:3001 \
  --base-dir x24sport.vn/operations/bi-a-batch-YYYYMMDD \
  --apply
```

7. Verify public output.
   - API: products filtered by tenant `x24sport`, category `bi-a`, and the batch
     source system return the expected count.
   - Public category: `https://next.x24sport.vn/danh-muc/bi-a/` renders the
     expected product count after revalidation.
   - Sample product pages return 200 and show H1, title, meta description,
     gallery image, content section, and Product JSON-LD.
   - Run the page audit. Use `--allow-noindex` for product pages on
     `next.x24sport.vn` because preview intentionally sends `X-Robots-Tag:
     noindex, nofollow`.

Useful checks:

```bash
python .codex/skills/develop-x24sport-websites/scripts/audit_page.py \
  --allow-noindex https://next.x24sport.vn/ao-bi-a-x24-ba-541-trang-den-xam/

python .codex/skills/develop-x24sport-websites/scripts/audit_page.py \
  --allow-noindex https://next.x24sport.vn/danh-muc/bi-a/
```

## Reporting

Report:

- number of source images, generated images, uploaded media, and products;
- created/updated product IDs and representative URLs;
- backup and report files under the operation folder;
- verification commands and observed results;
- whether `next.x24sport.vn` noindex was intentional;
- cache/service impact. Do not report secrets.

## Resources

- `scripts/import_billiards_batch.py`: proven import template for uploading
  generated images and creating/updating Payload products.
- `references/content-and-import.md`: naming, SEO copy, Payload fields, and
  verification notes.
