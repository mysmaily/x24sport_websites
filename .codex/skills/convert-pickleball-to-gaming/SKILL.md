---
name: convert-pickleball-to-gaming
description: Use when converting user-supplied mayaopickleball.vn apparel images or pickleball product gallery images into X24Sport gaming/esports team jersey products through Payload CMS. Supports source-image registration, garment-guided esports squad image generation, varied team pose direction, 1000x1000 square high-quality WebP output, optional overlays, Vietnamese SEO product copy, media upload, and verified product publishing.
---

# Convert Pickleball To Gaming

## Purpose

Create new gaming/esports jersey products from pickleball apparel references.
Treat the source image as a garment-design reference only: preserve the colorway,
graphic layout, collar/sleeve construction, seams, and selling composition, then
regenerate it as a dramatic esports team photo with players wearing the jersey.

## Fixed Scope

```yaml
source_site: mayaopickleball.vn or user-supplied apparel image
destination_site: x24sport.vn / next.x24sport.vn by default
api_backend: Payload CMS in /Users/hoang/hacado/x24sport_websites/cms-api
operation_mode: create_reserved_product_then_update
destination_sport_field: other
destination_intent: gaming/esports apparel
product_code_format: X24-GM-###
default_image_provider: manual-imagegen
default_conversion_strategy: full-regeneration-garment-guided-esports-squad-with-varied-poses
final_image_shape: square 1000x1000
final_upload_format: webp_only
default_branding_overlay: none
```

`Products.sport` currently has no `gaming` option, so publish these products
with `sport=other` and express gaming intent through `name`, `slug`,
`shortDescription`, `description`, `searchTags`, and categories when available.
Do not change the CMS schema unless the user explicitly asks.

## Runtime Setup

Work from this skill directory:

```bash
cd /Users/hoang/hacado/x24sport_websites/.codex/skills/convert-pickleball-to-gaming
```

Use `scripts/gaming_transfer.py` for normal operation. It accepts an optional
Payload env file. Do not print, commit, or summarize secret values.

Expected environment variables:

```text
PAYLOAD_BASE_URL=http://localhost:3001
PAYLOAD_TOKEN=...
PAYLOAD_EMAIL=...
PAYLOAD_PASSWORD=...
PAYLOAD_SEED_EMAIL=...
PAYLOAD_SEED_PASSWORD=...
PAYLOAD_TENANT_ID=...
X24SPORT_PUBLIC_BASE_URL=https://next.x24sport.vn
GAMING_TRANSFER_PRICE=165000
GAMING_TRANSFER_COMPARE_AT_PRICE=240000
```

Overlay assets live in `assets/` and are optional:

- `badge-logo.png`
- `dot-color.png`

By default, publish gaming product images without logo, hotline, product-code,
or color-dot overlays. Use overlays only when the user explicitly asks for them.
Before any overlayed production upload, verify `badge-logo.png` is the exact
official logo the user wants on gaming products. Replace this file when switching
brand, tenant, or campaign; do not publish with a borrowed sport-site logo by
accident.

The runner renders the hotline pill dynamically:

```text
Hotline: 0989 353 247
```

## Workflow For User-Supplied Images

1. Save or download the user's source image into an operation folder. If the
   user gives a URL, download it first and keep the original file.

2. Create source JSONL from one or more local source images:

```bash
python3 scripts/gaming_transfer.py source-images \
  --images /path/to/source.webp \
  --source-key x24-pb-525-gaming \
  --source-name "X24 PB 525 gaming jersey reference" \
  --out /Users/hoang/hacado/x24sport_websites/x24sport.vn/operations/pickleball-to-gaming/source-images.jsonl
```

3. Initialize a resumable manifest:

```bash
python3 scripts/gaming_transfer.py init \
  --wave-dir /Users/hoang/hacado/x24sport_websites/x24sport.vn/operations/pickleball-to-gaming \
  --source-jsonl /Users/hoang/hacado/x24sport_websites/x24sport.vn/operations/pickleball-to-gaming/source-images.jsonl \
  --product-code-start 1
```

4. Dry-run before live API calls:

```bash
python3 scripts/gaming_transfer.py run \
  --wave-dir /Users/hoang/hacado/x24sport_websites/x24sport.vn/operations/pickleball-to-gaming \
  --max-items 1 \
  --dry-run
```

5. Reserve the Payload product and write image prompts:

```bash
python3 scripts/gaming_transfer.py run \
  --wave-dir /Users/hoang/hacado/x24sport_websites/x24sport.vn/operations/pickleball-to-gaming \
  --source-key <source_product_key> \
  --max-items 1 \
  --env-file /path/to/payload.env
```

The runner creates a placeholder product, copies the source image, writes prompt
files, marks the item `analyzed`, and exits. Use Codex image generation with the
source image and the generated prompt file.

6. Generate the base image with this art direction:

- square 1:1, preferably 1000x1000 or larger before post-process;
- five Vietnamese/Asian esports players wearing the same jersey;
- dynamic pro-team roster composition, central captain slightly forward, not a
  rigid clone lineup;
- at least one front/central player must not cross arms; use hands in pockets,
  one hand by side, headset on shoulder, controller held low, or relaxed open
  stance so the shirt front and lower graphic are visible;
- side/back members may cross arms, but never let every team member cross arms;
- vary heights, shoulder angles, depth, hand poses, and gaze direction subtly so
  images do not look like repeated cemetery-straight rows;
- keep the source jersey design readable on the main model's full torso;
- dark esports arena, blue/yellow rim lights, LED panels, smoke, cinematic
  shadows;
- preserve source garment colors, diagonal/vertical accent placement, collar,
  sleeve, seams, and pattern flow;
- no pickleball court, paddles, sports rackets, balls, source watermark,
  hotline, color dots, readable fake words, or real logos.

7. Mark generated images and export final WebP:

```bash
python3 scripts/gaming_transfer.py mark-generated \
  --wave-dir /Users/hoang/hacado/x24sport_websites/x24sport.vn/operations/pickleball-to-gaming \
  --source-key <source_product_key> \
  --images /path/to/generated.png \
  --no-overlays \
  --colors "xanh bích" "vàng" "xám bạc" \
  --gradient "nền xanh bích phối sọc chéo xám bạc" \
  --pattern "sọc chéo thân áo và cụm sọc vàng trước ngực"
```

`mark-generated --no-overlays` exports clean high-quality `1000x1000` WebP files.
Use overlay mode only for campaigns that explicitly require logo, product code,
hotline, or color dots. Upload only WebP output, never raw PNG/JPEG.

8. Upload media, update SEO content, and verify the product:

```bash
python3 scripts/gaming_transfer.py run \
  --wave-dir /Users/hoang/hacado/x24sport_websites/x24sport.vn/operations/pickleball-to-gaming \
  --source-key <source_product_key> \
  --max-items 1 \
  --env-file /path/to/payload.env
```

Useful inspection commands:

```bash
python3 scripts/gaming_transfer.py summary --wave-dir <wave-dir>
python3 scripts/gaming_transfer.py next --wave-dir <wave-dir>
python3 scripts/gaming_transfer.py list-imagegen-ready --wave-dir <wave-dir>
```

## Batch Discovery From Payload

Use Payload-backed discovery when converting existing `mayaopickleball` product
gallery images:

```bash
python3 scripts/gaming_transfer.py discover \
  --source-mode payload \
  --source-payload-tenant mayaopickleball \
  --out /Users/hoang/hacado/x24sport_websites/x24sport.vn/operations/pickleball-to-gaming/source-images.jsonl
```

Use Woo Store API or local discovery only as recovery paths.

## Status Flow

```text
source_discovered -> reserved -> source_copied -> analyzed
-> images_generated -> media_uploaded -> product_updated -> verified
```

Terminal duplicate state:

```text
skipped_duplicate
```

The deterministic reservation SKU prevents a second destination product when a
source signature was already reserved.

## Product Content

Write Vietnamese shopper-facing fields from facts visible in the approved gaming
image. Pass verified `--colors`, `--gradient`, and `--pattern` to
`mark-generated`; do not infer stronger facts from filenames.

- `name`: include `Áo Gaming`, `X24-GM-###`, main colors, and collar/sleeve
  shape without keyword stuffing.
- `slug`: use `ao-thi-dau-gaming-dat-may-...`.
- `shortDescription`: 90-230 characters, include `áo thi đấu gaming đặt may`,
  colors, visible design, and customization availability.
- `description`: describe visible design facts, team/sponsor/nickname printing,
  and buyer checks for material, size chart, quantity, print placement, and lead
  time.
- `searchTags`: include colors, pattern, `áo thi đấu gaming`, `áo esports`,
  `đồng phục gaming`, `gaming team jersey`, and visible fit/collar terms.
- `gallery`: upload branded WebP media IDs only.

Do not claim fabric performance or manufacturing properties from appearance
alone. Reject unverified claims such as `thấm hút mồ hôi`, `thoáng khí`,
`nhanh khô`, `co giãn 4 chiều`, `chống tia UV`, `kháng khuẩn`, `bền màu`, or
`không nhăn` unless an approved material/spec source confirms them.

Forbidden shopper-facing terms: `pickleball`, `running`, `runner`, `chạy bộ`,
`mayaochaybo`, `mayaopickleball`, `prompt`, `render`, `watermark`, `metadata`.

## References

Read `references/payload-api.md` before changing API behavior or debugging
Payload upload/update failures.

## Reporting

Report source image path/signature prefix, product code, reserved/final Payload
product ID, uploaded media IDs, generated branded WebP paths, product URL,
verification result, credential-related skips, and cache/services touched
(normally none). Never display secrets or raw credential values.
