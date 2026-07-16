---
name: transfer-running-image-to-pickleball-v6
description: Use when creating new mayaopickleball.vn WooCommerce pickleball products from mayaochaybo.vn running-shirt product images or source image lists. Supports image-only transfer, prompt preparation, optional OpenAI image generation when explicitly authorized, postprocessing, tag/category assignment, product creation, resumable batch waves, and verification without updating existing products.
---

# Running Image To Pickleball V6

## Purpose

Create new `mayaopickleball.vn` WooCommerce products from `mayaochaybo.vn`
source images. Treat the source site as image/design reference only. Never copy
source titles, descriptions, prices, stock, tags, categories, SEO fields, product
IDs, or media metadata into shopper-facing destination content.

## Fixed Scope

```yaml
source_site: mayaochaybo.vn
destination_site: mayaopickleball.vn
operation_mode: create_new_product
source_policy: image_only
backup_required: false_for_new_products
default_image_provider: manual-imagegen
openai_api_allowed: only_when_user_explicitly_authorizes
logo_badge_png: image-references/logo-badge.png
dot_color_png: image-references/dot-color.png
contact_pill_png: image-references/contact-pill.png
model_reference_mode: fictional_only
female_model_reference_pool: disabled
male_model_reference_mode: fictional
product_code_format: X24-PB-###
image_rules_source: openai-running-to-student-basketball-product-pipeline.md adapted for pickleball plus this V6 file
```

## Non-Negotiables

1. Create a new product. Do not update an existing product unless the user asks.
2. Use `mayaochaybo.vn` only for source image URLs/files and visual design cues.
3. Analyze the source image visually: colors, garment cut, panel map, graphics,
   readable text, accents, and design mood.
4. Generate exactly two product-selling pickleball images by default. Both
   images must include one attractive fictional adult Vietnamese male model and
   one attractive fictional adult Vietnamese female model, an authentic
   Vietnamese pickleball court context, and no running cues.
5. Add the official logo/contact/color-dot overlay only through postprocess with
   prebuilt PNG assets. Do not ask AI to draw these overlays.
6. Write new Vietnamese title, slug, descriptions, media alt text, tags,
   categories, and Yoast metadata from the converted pickleball product.
7. Assign the next unused `X24-PB-###` SKU before upload/create.
8. Reject shopper-facing content containing forbidden running terms.
9. Verify REST product fields, media, public product page, and category page
   before reporting completion.

## Runtime Setup

Work from this directory:

```bash
cd /Users/hoang/hacado/wordpress_websites/mayaopickleball.vn/transfer-running-image-to-pickleball-v6
```

`run-all.sh` loads destination credentials from:

```text
../.runtime/wordpress-api.env
```

Do not print, commit, or summarize secret values. Required destination variables
are `WORDPRESS_BASE_URL`, `WORDPRESS_USERNAME`,
`WORDPRESS_APPLICATION_PASSWORD`, `WOOCOMMERCE_CONSUMER_KEY`, and
`WOOCOMMERCE_CONSUMER_SECRET`. `OPENAI_API_KEY` is required only for
`--image-provider openai-api`.

Run local checks before live work:

```bash
python scripts/check_fixed_assets.py
python scripts/check_runtime_env.py --env-file ../.runtime/wordpress-api.env
./run-all.sh --dry-run --max-items 1
```

## Scripts

- `scripts/list_source_products.py`: discover source WooCommerce products from
  public Woo Store API and write one JSONL row per source product.
- `scripts/list_source_images.py`: legacy media-based discovery helper; do not
  use for full product cloning.
- `scripts/v6_wave.py`: initialize, inspect, and mark resumable manifest records.
- `scripts/v6_run_all.py`: one-command runner for download, prompt/image step,
  postprocess, tags, upload, product create, and verification.
- `scripts/pickleball_postprocess_pillow.py`: composite prebuilt
  `logo-badge.png`, `dot-color.png`, and `contact-pill.png` overlays.
- `scripts/ensure_product_tags.py`: create or resolve destination tag IDs.
- `scripts/select_model_reference.py`: legacy utility only; do not use in the
  normal v6 workflow.
- `scripts/check_fixed_assets.py` and `scripts/check_runtime_env.py`: preflight.

Prefer `./run-all.sh` for normal operation. Use individual scripts only for
inspection, repair, or targeted retries.

## Source Discovery

For bulk runs, discover source products before generation. Product discovery is
the default because full cloning must be product-based, not media-size-based:

```bash
python scripts/list_source_products.py \
  --base-url https://mayaochaybo.vn \
  --limit 10000 \
  --out ../operations/transfer-running-image-to-pickleball-v6-batch-YYYYMMDD/source-images.jsonl
```

Keep one row per source WooCommerce product. Do not discover by WordPress media
dimensions, square images, filenames, or inferred design codes when the goal is
to clone enough products without missing or adding products. Each source row
should contain `source_product_id`, `source_product_slug`, `source_product_url`,
`source_image_url`, and `source_gallery`; the wave scripts add local paths and
destination product codes.

## Batch Workflow

Use a persistent wave directory under:

```text
../operations/transfer-running-image-to-pickleball-v6-batch-YYYYMMDD/
```

Wave files:

- `source-images.jsonl`: immutable source product discovery list. The filename
  is legacy; each row represents one source product, not one arbitrary media
  image.
- `manifest.jsonl`: mutable one-record-per-new-product status ledger.
- `products/<source_product_key>/`: source, prompt, generated, final, payload,
  response, and verification artifacts.
- `tag-cache.json`: wave-level destination tag cache.

Cross-machine converted-source ledger:

```text
../operations/transfer-running-image-to-pickleball-converted-sources.jsonl
```

The runner appends to this shared ledger after a product reaches `verified`, and
also syncs existing `verified` manifest rows into it on non-dry runs. It was
seeded from the previous v5 converted-source ledger so v6 can skip sources that
were already converted before this stricter image rule was introduced.
`v6_wave.py init` uses the ledger to skip already converted
`source_product_key`, exact source image URL, or source URL hash, and to avoid
reusing destination SKUs recorded in `destination_sku`. Keep this file synced
with the workspace when moving to another machine.

For two-machine operation, both machines must share or sync this ledger and avoid
working the same pending manifest record at the same time. Without a shared
ledger/manifest sync, two machines can still race by initializing from stale
state before either machine writes the converted marker.

Common commands:

```bash
./run-all.sh --dry-run --max-items 1
./run-all.sh --max-items 1
./run-all.sh --max-items 5
./run-all.sh --refresh-source --dry-run --max-items 1
./run-all.sh --image-provider openai-api --concurrency 2
python scripts/v6_wave.py summary --wave-dir ../operations/transfer-running-image-to-pickleball-v6-batch-YYYYMMDD
python scripts/v6_wave.py next --wave-dir ../operations/transfer-running-image-to-pickleball-v6-batch-YYYYMMDD
```

Source discovery is one-shot per wave. If `source-images.jsonl` already exists,
the runner reuses it and does not call source discovery again. Use
`--refresh-source` only when the user explicitly wants to fetch the source list
again; the previous source list is renamed to `source-images.previous-<ts>.jsonl`
before refresh.

Default `manual-imagegen` mode downloads the source image, writes prompt files,
marks the record `prompts_ready`, and exits softly. Use Codex image generation
with the source image only, then place outputs in the record's `generated/`
folder and mark `images_generated`.

Before any manual Codex imagegen call, run:

```bash
./run-all.sh --list-imagegen-ready
```

Use only records listed under `ready`. If the command reports
`unsafe_unclaimed`, do not open those prompt files and do not generate images
for them; run `./run-all.sh --max-items 1` until the runner either reserves a
draft placeholder product for the source or marks the source as
`skipped_duplicate`. A `prompts_ready` record without `new_product_id` is an
old/unclaimed prompt and is not safe for manual imagegen.

Only use `--image-provider openai-api` when the user explicitly authorizes API
image generation. In that mode, the runner sends only the source garment image
to the OpenAI image edit endpoint.

OpenAI API image generation now stops at `images_generated` by default. Review
the two generated images before publishing. Continue only after either:

```bash
python3 scripts/v6_wave.py mark --wave-dir ../operations/transfer-running-image-to-pickleball-v6-batch-20260710 --source-product-key <key> --status visual_approved
```

or rerun with `--auto-approve-generated-images` when the user explicitly accepts
fully automatic publishing for that batch. If images are wrong, mark
`visual_rejected` and do not publish.

Status flow:

```text
source_discovered -> reserved -> source_downloaded -> analyzed -> prompts_ready
-> images_generated -> visual_approved -> postprocessed -> media_uploaded
-> product_created -> verified
```

Resume rules:

- Never delete or reorder `manifest.jsonl`.
- Continue non-`verified` records only.
- Keep returned media/product IDs after side effects; reuse them on retry.
- Before downloading/generating, create a draft hidden placeholder product on
  `mayaopickleball.vn` with transfer metadata and a temporary reservation SKU
  `x24-transfer-<source-hash>`. If a product already has the same transfer
  metadata, or the reservation SKU collides, mark the source
  `skipped_duplicate` and move to the next source.
- After media upload, update the reserved product with final name, slug, SKU,
  content, images, tags, categories, Yoast fields, `status=publish`, and
  `catalog_visibility=visible`. Do not create a second product for that source.
- Before publishing a reserved product, the runner checks whether the assigned
  `X24-PB-###` SKU already belongs to another WooCommerce product. If it does,
  reassign to the next available SKU and record the reassignment in manifest QA
  instead of failing or creating a duplicate.
- If final product update succeeds but verification fails, verify or update that
  same reserved product. Do not create a duplicate.
- Manifest writes use a lock file; concurrency 2 is the normal upper bound for
  live API/image/upload runs.
- Destination products include private WooCommerce traceability meta:
  `_x24_transfer_source_image_url`, `_x24_transfer_source_product_key`,
  `_x24_transfer_source_signature`, and `_x24_transfer_schema`. Use those fields
  to rebuild or audit the converted-source ledger if a machine is missing it.

## Image Direction

Before prompt construction, read these sections from
`../pickleball-transfer-skill-refactor-4/SKILL.md`:

- `Garment conversion specification`
- `Variant selection`
- `Model and scene direction`
- `Image prompt construction`
- `Brand logo and contact post-processing`
- `Visual QA`

V6 overrides only source-data policy and create/update workflow. The v4 visual
rules remain binding.

Prompt requirements:

- Produce exactly two required images per accepted source product.
- Image A: both male and female wear collared, short-sleeve pickleball shirts.
- Image B: male wears a round-neck no-sleeve pickleball tank top. Female wears
  a collared no-sleeve pickleball tank top. V6 does not allow the older
  optional no-collar female variant.
- Both scenes must be Vietnamese pickleball courts. Include a small `X24 Sport`
  storefront or advertising sign naturally in the background, as if it
  incidentally entered the shot.
- Remove every running or other-sport cue from the garment and scene.
- The only garment logo/text allowed is a small `X24` chest logo on visible
  shirt fronts.
- Preserve the source garment design map: palette, panel placement, diagonals,
  splatter/texture density, accent placement, and small chest-mark position.
- Image A and Image B for one source product must show the same SKU, colorway,
  pattern map, accent placement, and small `X24` chest mark. A/B garment
  construction intentionally differs only by the fixed neckline/sleeve rules:
  Image A uses short-sleeve collared shirts for both models; Image B uses
  no-sleeve tops, with the male in a round neck and the female in a collared
  no-sleeve tanktop. Reject A/B pairs where the pattern design, stripe
  direction, color blocking, or accent placement differs beyond the required
  neckline/sleeve variation.
- Convert to authentic pickleball apparel, not running apparel on a court.
- Use one fictional Vietnamese adult male and one fictional Vietnamese adult
  female.
- Do not use local model face references in normal v6 image generation. Avoid
  real customer, celebrity, employee, or scraped social-media faces.
- Use lightweight seeded scene/pose variation only. Do not compare against prior
  images or regenerate solely because a background composition resembles an
  earlier product.
- Vary model placement across products and between Image A/B: male/female may
  swap left/right positions, stand slightly forward/behind, or stand apart
  along court-line diagonals. Do not always put the male on the same side.
- Vary gaze and head direction naturally: looking toward camera, looking at
  each other, looking slightly off-camera toward the court, or turning the head
  over the shoulder when the pose supports it.
- Only the female model may be three-quarter-back or back-facing. When she turns
  away, keep it tasteful and product-focused, with an optional over-shoulder
  head turn that still shows the garment. The male must remain front-facing or
  three-quarter-front in every required image so the front design and small
  `X24` chest mark stay readable.
- Image B should usually show the female front or three-quarter-front so her
  collared no-sleeve construction is clear; use female back-facing Image B poses
  only when the chosen pose explicitly asks for it.
- Use lightweight seeded camera variation. Most images should remain medium or
  medium-full catalog crops that prioritize shirt details. Occasionally choose a
  wide full-body shot that shows both models from head to shoes, but do not make
  wide shots the default. A product's A/B image pair may contain at most one
  wide full-body shot; if Image A is wide, Image B must use a non-wide crop.
- Include either a sportswear storefront or an advertising sign that clearly
  reads `X24 Sport` as an incidental background element. Keep it natural,
  secondary, and not blocking the apparel.
- Add only a small `X24` chest mark on garments. No other readable garment text.
- Do not generate the official overlay; postprocess adds it later.
- When publishing to WooCommerce, choose the product featured image by seeded
  random order between Image A and Image B. Do not always make Image A the
  representative image. Keep the choice deterministic per source product so
  reruns do not flip the existing product unexpectedly.
- Image A neckline/sleeve rule: both male and female must wear `áo có tay, có
  cổ áo` with real short sleeve tubes, true folded polo collars, and clean short
  plackets. Image A must not use round necks and must not be sleeveless.
- Image B neckline/sleeve rule: male must wear `áo cổ tròn, không có ống tay`.
  Female must wear `áo có cổ, không có ống tay` in a workshop-realistic
  tanktop/sleeveless pickleball form. Do not generate a no-collar female top.
- For no-sleeve products, specify wide shoulder coverage: no sewn sleeve tube,
  fabric covering the top of each shoulder and the outer deltoid cap, and a high
  minimal arm opening with no exposed armpit. Use a boxy straight-side
  sleeveless jersey silhouette, not a deep-cut tank top. The outer garment edge
  must read as one clean, mostly straight line from lower waist/side seam up to
  the shoulder cap, without curving inward at the armpit.

Neckline QA is strict:

- Image A requires true folded polo collars and short clean plackets on both
  models plus real sleeve tubes.
- Image B requires no sleeve tubes on both models. Male is round neck. Female
  is collared no-sleeve in every V6 output.
- Crew/round necks need a continuous collar band with no zipper, buttons,
  vertical slit, faux placket, mandarin tab, or hybrid opening.
- Polo/collared shirts may have a short clean placket only when a real folded
  collar is visible.
- Zip-neck styling is forbidden unless the user explicitly asks.
- Reject deep tank tops, racerback/stringer cuts, narrow straps, oversized
  armholes, exposed armpits, side torso exposure, or shoulder fabric that looks
  eaten away toward the neckline. Reject any armhole whose side edge bends or
  scoops inward at the armpit instead of continuing straight from waist to
  shoulder. The arm opening should be high and minimal. The target is no sleeve,
  not `3 lỗ`.
- Reject pasted-face artifacts, mismatched face/neck/body skin, broken jawline,
  stiff cutout hair, wrong head scale, distorted hands, running poses, race
  cues, male back-facing poses, both models back-facing at once, and unrelated
  readable background text. Allow `X24 Sport` only as the required incidental
  storefront/signage text.

Postprocess approved PNGs:

```bash
python scripts/pickleball_postprocess_pillow.py input.png output.webp right
```

Postprocess uses fixed PNG overlays from `image-references/` and should not
recreate the badge, color dots, or contact pill with drawing/text operations.
Keep the assets transparent and production-ready so the script only resizes and
alpha-composites them onto the 1200px product canvas.

## Product Content And Tags

Write all shopper-facing fields from the final pickleball images:

- title: Vietnamese product-selling title including `X24 PB-###`, key colors,
  and pickleball category.
- slug: lowercase ASCII Vietnamese slug with no running/source terms.
- short description: one concise paragraph.
- long description: 300-450 Vietnamese words with both final images embedded as
  `<figure>` blocks.
- media alt/caption/title/description: match visible garment variants.
- Yoast focus keyword and meta description.
- categories/tags: existing destination pickleball taxonomy plus created tags.

Do not use shopper-facing workflow words such as `prompt`, `render`,
`watermark`, `dot màu`, `gallery`, `metadata`, or `SEO content`.

Assign tags from the final approved generated garments, not source filenames
alone. The runner currently seeds base/color tags for speed; correct conflicts
before product creation when a generated variant visibly differs.

Use these tag patterns when applicable:

- `áo pickleball có cổ` for true folded collars.
- `áo pickleball cổ tròn` for clean crew/round necks.
- `áo pickleball không tay` for no-sleeve jersey variants with broad shoulders
  and shallow armholes.
- `áo pickleball vai rộng` when the shoulder panel visibly covers the top of
  the shoulder like the production reference.
- Do not use `áo pickleball tank top`, `áo pickleball nam 3 lỗ`, or
  `áo pickleball khoét nách` unless the user explicitly requests a deep-cut
  tank style.
- `màu <color>` and combined color tags such as `trắng xanh`, `đen vàng`,
  `xanh cam`, or `trắng đỏ`.

Reject product creation if tags contradict the visible garment.

Forbidden shopper-facing terms:

```text
chạy bộ
runner
running
marathon
race
trail
5k
10k
half marathon
đường chạy
giải chạy
finisher
mayaochaybo
aochaybo
```

Internal manifests and source URL fields may retain source traceability.

## WordPress Create Order

1. Resolve or confirm the next unused `X24-PB-###`.
2. Upload approved final WebP images.
3. Set image alt text in the WooCommerce product payload.
4. Create a new WooCommerce product with SKU, title, slug, content, categories,
   tags, configured catalog price, Yoast metadata, and new images.
5. Do not copy price/stock from source. Use destination catalog defaults only
   after confirming them from existing destination products or current runner
   configuration.
6. Fast-verify REST product fields and forbidden terms immediately.
7. Verify public product HTML and category page once per processed batch.

## Reporting

Report:

- source image URL(s);
- new product ID and URL;
- new media IDs;
- manifest path;
- verification evidence;
- backups skipped because V6 creates new products only;
- cache/services touched, normally none.

Never display secrets or raw credential values.
