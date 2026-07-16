---
name: pickleball-transfer
description: Update existing mayaopickleball.vn WooCommerce products from running-shirt legacy content into pickleball apparel product pages. Use when Codex is given @pickleball-transfer, a mayaopickleball.vn product URL, or a request to scan/update running products into pickleball products with local image generation, branding overlays, manifest tracking, backup, upload, and verification.
---

# OpenAI Running-to-Pickleball Existing Product Update Pipeline

> Status: `v0.4-safe — compact basketball-style runbook`
>
> Target: update existing `mayaopickleball.vn` WooCommerce products that still contain running-shirt names, content, media, or visuals into credible pickleball apparel product pages.

This is intentionally written as a **single agent-facing runbook**. It follows the simpler basketball skill style: fixed destination constants are declared here, the runner does not ask the user for logo paths/contact lines/color dots per product, and every selected product is updated in place.

## User-facing contract

For a demo/single product, the user only needs to mention this skill and paste one destination product URL:

```text
@pickleball-transfer https://mayaopickleball.vn/san-pham/example/
```

For production, the user may ask:

```text
@pickleball-transfer scan all running products
```

Do **not** ask the user to pass logo, hotline, website, color dots, destination site, WooCommerce endpoint, or operation mode per run. These values are fixed below.

## Fixed destination constants

```yaml
destination_site: mayaopickleball.vn
operation_mode: update_existing_product
source_legacy_site: mayaochaybo.vn

logo_svg_primary: image-references/logo.svg
logo_png_fallback: image-references/logo.png
plain_text_logo_fallback: forbidden

contact_overlay_text: "mayaopickleball.vn | Hotline/Zalo: 0989.353.247"
contact_overlay_required: true

logo_badge_shape: perfect_circle
color_dots_required: true
color_dots: ["Trắng", "Đen", "Hồng", "Đỏ", "Vàng", "Xanh Blue", "Green", "+"]

model_reference_mode: random_from_local_pool
female_model_reference_pool: model-references/female/
male_model_reference_pool: model-references/male/
model_reference_selector: scripts/select_model_reference.py

product_code_format: X24-PB-###
default_image_size: 1200x1200
upload_format: webp
upload_quality: 80-86
```

The optional file `profiles/mayaopickleball.vn.yml` may mirror these values for implementation convenience, but this `SKILL.md` is the source of truth. If a profile file conflicts with this section, stop and fix the profile before running.

## Non-negotiable outcome

For every selected existing destination product:

1. Update the **same existing WooCommerce product ID**. Never create a new product.
2. Produce two replacement pickleball product images by default. Randomize which style appears in Image A vs Image B; do not hard-code A as short-sleeve and B as tank/no-sleeve.
3. The two images must use different garment styles and different pose/crop/background composition. They may both be no-sleeve/tank variants only when their collar/cut/pose/crop are clearly different.
4. Both images must sell the apparel, not a pickleball lesson, drill, match highlight, or technical stance.
5. Preserve the usable source design map: base color, panel placement, diagonal direction, splatter/texture density, accent placement, and chest-mark location.
6. Remove all running terms/cues, old site branding, old contact text, watermarks, mockup frames, race cues, road/trail cues, old model/layout, and old logos unless the user explicitly approves one exact phrase.
7. Use only a small `X24` chest mark on visible shirt fronts. Do not print `mayaopickleball.vn` on garments, backs, shorts, or paddle faces.
8. Every final uploaded image must include:
   - the official `mayaopickleball.vn` logo watermark from `image-references/logo.svg`;
   - fallback to `image-references/logo.png` only if SVG rendering is unavailable or fails;
   - a true circular logo badge/watermark, not a pill or rounded rectangle;
   - the bottom contact pill: `mayaopickleball.vn | Hotline/Zalo: 0989.353.247`;
   - the vertical color-dot column: `Trắng`, `Đen`, `Hồng`, `Đỏ`, `Vàng`, `Xanh Blue`, `Green`, `+`.
9. A plain text `X24` badge is never an acceptable logo fallback. Missing official logo means the postprocess phase fails.
10. Assign or preserve a sequential `X24-PB-###` SKU:
   - preserve an existing valid `X24-PB-###` SKU when present;
   - otherwise assign the next unused destination code before mutation.
11. Update title, slug, excerpt, long content, image alt/caption/title/description, categories, tags, SEO metadata, featured image, gallery images, and embedded description images to pickleball-only content.
12. Back up the full old product state before mutation.
13. Verify WooCommerce REST, WordPress media REST, public product HTML, image URLs, category pages, forbidden running terms, and same product ID after update/cache clear.

## Scope and safety

- Mutation target: `mayaopickleball.vn` only.
- The production source of truth is the existing destination product being updated.
- `mayaochaybo.vn` is read-only and only historical design/reference context when needed.
- Never write to `mayaochaybo.vn`.
- Never reuse source credentials, database names, cache paths, category IDs, media IDs, or commands for the destination site.
- Generate, compress, QA, and postprocess images locally.
- Do not mutate WordPress until the local demo/pilot contact sheet is approved.
- Never delete old media by default. Replace product references; leave old media unreferenced unless the user explicitly asks to delete it.
- Never store OpenAI keys, WordPress passwords, WooCommerce keys, application passwords, cookies, or tokens in this skill, manifests, logs, commits, reports, or final messages.

## Runtime secret loading

Secrets are loaded from local uncommitted env only:

```text
.runtime/wordpress-api.env
```

Required variables:

```bash
WORDPRESS_BASE_URL=https://mayaopickleball.vn
WORDPRESS_USERNAME=...
WORDPRESS_APPLICATION_PASSWORD=...
WOOCOMMERCE_CONSUMER_KEY=ck_...
WOOCOMMERCE_CONSUMER_SECRET=cs_...
OPENAI_API_KEY=...
```

Accepted local aliases for older env files:

```text
WooCommerce_KEY         -> WOOCOMMERCE_CONSUMER_KEY
WooCommerce_KEY_SECRET  -> WOOCOMMERCE_CONSUMER_SECRET
APPLICATION_PASSWORD    -> WORDPRESS_APPLICATION_PASSWORD
```

Before any WordPress/WooCommerce call:

```bash
set -a
source ./.runtime/wordpress-api.env
set +a
python scripts/check_runtime_env.py --target destination
```

## Mandatory fixed-asset preflight

Before image generation, postprocess, upload, update, or verify:

```bash
python scripts/check_fixed_assets.py
```

Preflight must fail if:

- `image-references/logo.svg` is missing and `image-references/logo.png` is also missing;
- contact text is empty or changed from `mayaopickleball.vn | Hotline/Zalo: 0989.353.247` without explicit user approval;
- color dots differ from `Trắng`, `Đen`, `Hồng`, `Đỏ`, `Vàng`, `Xanh Blue`, `Green`, `+`;
- any implementation attempts to use a generated/plain-text `X24` watermark badge instead of official logo assets.

## Product selection

### Demo / single URL

When the user provides one product URL:

1. Confirm the URL belongs to `mayaopickleball.vn`.
2. Resolve it to an existing WooCommerce product ID through REST/permalink lookup.
3. Read full product fields, media metadata, categories, tags, SKU, SEO metadata, price, stock, attributes, and variations.
4. Classify running legacy signals.
5. Create one manifest record with `selection_mode: single_url` and `operation_mode: update_existing_product`.
6. Generate local outputs and contact sheet first.
7. Wait for user approval before backup/upload/update.

If the URL cannot resolve to an existing product ID, mark `product_resolution_failed`. Do not create a product.

### Production / bulk scan

Production scan selects existing destination products with running legacy signals in:

- title/name;
- slug;
- excerpt/short description;
- long content/body;
- tags/categories;
- SEO title, focus keyword, and meta description;
- featured/gallery image filename, title, alt text, caption, description;
- public product HTML;
- visible image content when metadata is insufficient.

Strong running terms include:

```text
chạy bộ
runner
running
marathon
race
5k
10k
half marathon
trail
đường chạy
giải chạy
finisher
Just Keep Running
RUN
```

Ambiguous sponsor/team names go to `manual_text_review` or `manual_visual_review`. Never silently transform a likely proper noun.

## Running-to-pickleball language map

| Running term or concept | Pickleball replacement |
|---|---|
| áo chạy bộ | áo pickleball / bộ quần áo pickleball |
| áo runner / running shirt | áo pickleball / pickleball jersey |
| áo ba lỗ chạy bộ / singlet | áo pickleball nam 3 lỗ / áo pickleball nam sát nách / áo pickleball tank top / áo pickleball nữ không tay |
| runner / vận động viên chạy | người chơi pickleball / vận động viên pickleball |
| running team / running club | đội pickleball / câu lạc bộ pickleball |
| marathon / race / giải chạy | giải pickleball / trận đấu / giao hữu pickleball |
| 5K / 10K / half marathon | remove, or replace with a pickleball-specific team phrase |
| road / trail / đường chạy | sân pickleball / cụm sân / nhà thi đấu |
| chạy bộ / bứt tốc / chinh phục đường chạy | thi đấu / di chuyển linh hoạt / phối hợp đồng đội |
| form ôm chạy bộ | form thể thao thoải mái, dễ xoay trở |
| Just Keep Running | Pickleball Club / Play Pickleball / Keep Playing |
| RUN | PLAY / PICKLEBALL / CLUB |
| finisher | player / team / champion only when context supports it |

Garment text needs per-product decisions:

1. OCR or manually record exact visible source text.
2. Classify each phrase as `preserve`, `replace`, `remove`, or `manual_review`.
3. Include the decision and exact replacement in the manifest.
4. Reject output if forbidden running text remains legible.

## Garment conversion specification

The result must look like court-sport pickleball apparel, not a running singlet placed on a pickleball court.

Required form:

- breathable court-sport fabric, realistic folds, production-friendly print;
- shoulder/armhole shape suited to paddle swings;
- relaxed athletic torso with room for rotation and lateral movement;
- hem length appropriate for court movement, not cropped;
- coordinated shorts/skirt/skort only when the sold product includes a set;
- source palette and graphic hierarchy preserved naturally across the converted garment cuts.

## Variant selection

Select two distinct variants per product and assign them randomly to Image A and Image B.

Do not repeat the same style pair, pose, crop, focal length, or background placement across both images.

Allowed variant families:

- collared short-sleeve shirts for both models;
- crew/round-neck short-sleeve shirts for both models;
- male `áo 3 lỗ` / tank top plus female no-sleeve pickleball top;
- female collared no-sleeve / `áo pickleball nữ không tay có cổ` tops paired with a male no-collar `áo 3 lỗ`;
- mixed team set where one model has a collar and the other has a clean sport crew neck, only when the pair still looks like one product family.

No-sleeve/tank collar weighting:

- male wears production-realistic `áo 3 lỗ` / tank-top pickleball top;
- male no-sleeve/tank top must never have a collar. Reject any generated image where the male model wears a collared no-sleeve shirt, collared tank, or `3 lỗ có cổ`;
- female wears a production-realistic no-sleeve pickleball top;
- when a female no-sleeve top is used, choose a neat sport collar about 80% of the time and a clean no-collar sport neckline about 20% of the time;
- female no-sleeve armhole is shallow and close to the natural armpit line;
- no exposed side bust, bra line, low fashion tank, deep inward scoop, bikini/underwear styling, glamour/pin-up posing, or body-display content;
- female shoulder fabric should sit close to the shoulder cap/deltoid, like a sports shirt with only the sleeve tube removed;
- image-level tags, filenames, alt/caption/media title, and shopper copy must match the actual visible variant, not the A/B slot name.

## Model and scene direction

Every required image must contain one fictional Vietnamese adult male and one fictional Vietnamese adult female together.

- Before prompt construction, select model identity references from the local pools:
  - female: `python scripts/select_model_reference.py --gender female --seed <wave-id-or-product-code>`;
  - male: `python scripts/select_model_reference.py --gender male --seed <wave-id-or-product-code>` when the male pool is non-empty.
- By default, use the selected female reference as an identity reference for the female model. If the male pool has a selected reference, use it for the male model too.
- Random selection is the default, but use a stable seed per wave/product so reruns are reproducible. Record selected reference paths in the manifest.
- If a pool is empty, generate a new fictional adult Vietnamese model for that gender and record `model_reference_missing_<gender>` in QA. Do not borrow faces from unrelated sites or public figures.
- New face references may be added by placing approved generated face crops under `model-references/female/` or `model-references/male/`.
- Model references are identity anchors only. They must not force the old outfit, pose, background, crop, logo overlay, or product design.
- Male: athletic, strong, confident, upright, broad-shouldered without bodybuilder exaggeration.
- Female: athletic, graceful, tasteful, tied-up sporty hair, confident posture, sport-appropriate styling.
- Poses: product-selling standing/walking/casual paddle poses, not crouched technical drills or active hitting mechanics.
- Paddles must be blank or have only subtle generic texture, with no readable logo/text.
- Pickleball context must be unmistakable, with plausible court geometry.
- Background must feel Vietnamese: nearby street edge, scooters/motorbikes, local storefronts, court-side service/kitchen area, or a small `X24 Sport` shop/sign may appear behind the court.
- The `X24 Sport` sign should feel like it accidentally wandered into the frame, not like a centered advertisement or hero element.
- Render `X24 Sport` with a red `X` when possible; `24 Sport` may be white, black, or neutral depending on the sign background.
- Readable background text is allowed only when it is exactly `X24 Sport`; keep it on signs, shopfronts, or court-side advertising boards, never on garments, paddles, court lines, or random banners.
- Background details must stay secondary and slightly out of focus so the apparel remains the product focus.
- No running pose, race bib, medal, marathon sign, finish line, road/trail scene, old mockup frame, size strip, checkerboard, or old source footer.

## Image prompt construction

Use an image-edit/reference-image flow when available. The source/destination legacy image is a **garment-design reference only**, not the target layout/background/model.

Use one request per required output image. Do not ask for Image A and Image B in one ambiguous generation request. Regenerate only the failed image.

Shared prompt block:

```text
Use case: identity-preserve
Asset type: square WooCommerce product image for mayaopickleball.vn

Image 1 is a garment-design reference only. Preserve only the actual shirt design language: palette, gradients, abstract pattern, panel placement, color-block geometry, garment cut, and approved text decisions. Do not preserve the old adult running model, running pose, running environment, promotional frame, header, footer, hotline, website, source logo, source domain, size strip, color label, watermark, contact icons, decorative borders, grey mockup background, or any old readable word unless explicitly approved in the per-product text decisions.

Model identity references:
[SELECTED_MODEL_REFERENCE_BLOCK]

Design fidelity requirement: preserve the source shirt's graphic map closely. Keep the same dominant base color, major side-panel positions, diagonal stripe direction, white slash placement, splatter/texture clusters, accent triangle placement, and small X24 chest-mark area. Do not turn the source into a generic same-color pickleball shirt.

Convert the garment into authentic pickleball apparel for two fictional Vietnamese adult models, one male and one female. The image must sell the apparel, not show a lesson, drill, or match-action pose.

Garment style:
[SELECTED_VARIANT_STYLE_BLOCK]

Scene:
[PICKLEBALL_COURT_VARIANT]

Pose/crop:
[POSE_AND_CROP_SLOT]

Text/logo decisions:
[EXACT PER-PRODUCT PRESERVE/REPLACE/REMOVE LIST]
Add only a small X24 chest mark to visible shirt fronts. Do not add logos or readable text to shirt backs, paddles, or court lines. Background signage may contain exactly `X24 Sport` on a shopfront, court-side ad board, or service/kitchen area sign; it should be incidental, slightly off to the side or partly softened by depth of field, with a red `X` when possible.

Style:
Photorealistic commercial Vietnamese pickleball sportswear photography, realistic breathable fabric, natural folds, correct anatomy, plausible daylight, square 1:1.

Constraints:
No running terminology, no marathon/race cues, no real person identity, no old logos, no copied mockup frame, no old catalog footer/header/size strip/contact line/color label, no paddle text. The only allowed readable background text is `X24 Sport`. The official mayaopickleball.vn logo/contact/color dots are added later in post-processing, not generated by the model.

Avoid:
running pose, road race, finish line, medals, race bib, distorted text, distorted hands, copied mockup frame, third-party watermark, childlike face, oversexualized pose, deep fashion tank, impossible pickleball court geometry.
```

## Brand logo and contact post-processing

This section is intentionally explicit and self-contained.

Official watermark source:

```text
Primary: image-references/logo.svg
Fallback: image-references/logo.png
Forbidden: generated plain text X24 badge fallback
```

Postprocess command:

```bash
scripts/pickleball_postprocess.sh input.png output.webp right
```

The script must:

1. render `image-references/logo.svg` to a high-resolution transparent PNG first;
2. fallback to `image-references/logo.png` only if SVG render is unavailable or fails;
3. fail if neither official logo asset can be used;
4. never create a placeholder/text-only `X24` watermark;
5. add a subtle compact logo badge/watermark in a clean corner;
6. add vertical color dots on the left or right side;
7. add a compact bottom contact pill exactly:

```text
mayaopickleball.vn | Hotline/Zalo: 0989.353.247
```

Logo badge style:

- true circle only: equal width and height with a circular border;
- no rounded-rectangle, capsule, pill, oval, or squircle backing for the logo;
- official logo centered inside the circle and scaled large, nearly filling the safe inner area;
- leave only a narrow white/translucent margin so the circle backing exists mainly to make the logo readable;
- subtle translucent white backing and thin light circular border;
- readable at WooCommerce thumbnail size;
- does not cover faces, garment front, paddles, color dots, or important artwork.

Contact pill style:

- compact transparent rounded pill;
- thin light border;
- no full-width opaque black footer band;
- hugs the text closely;
- readable at WooCommerce thumbnail size;
- does not cover faces, garment front, paddles, color dots, or important artwork.

Logo QA:

- official logo visible at thumbnail size;
- logo badge border is a true circle, not a rounded rectangle/pill/oval;
- bottom contact line present and readable;
- color-dot column present with all eight chips;
- logo is not distorted;
- logo does not look like a shirt print;
- color dots and contact pill do not overlap;
- no old/generated/third-party watermark remains.

## SEO and copy policy

Write for shoppers first, search engines second. Avoid keyword stuffing.

Product copy should sell:

- visible design and color palette;
- available garment styles: có cổ, không cổ, có tay, không tay, sát nách, 3 lỗ;
- comfort for pickleball movement;
- breathable sports fabric only when visually/general product context supports it;
- matching men/women team look;
- custom logo/name/number ordering for clubs, teams, companies, and groups;
- use for practice, friendly matches, tournaments, and team uniforms.

Required keyword pool, used naturally across product fields/metadata/tags, not stuffed into every paragraph:

```text
áo pickleball nam
áo pickleball nữ
áo pickleball nam có cổ
áo pickleball nữ có cổ
áo pickleball nam có tay
áo pickleball nữ có tay
áo pickleball nam không tay
áo pickleball nam sát nách
áo pickleball nam 3 lỗ
áo pickleball nữ không tay
áo pickleball nữ sát nách
áo pickleball tank top
bộ quần áo pickleball nam nữ
áo pickleball thiết kế riêng
đồng phục pickleball
áo pickleball câu lạc bộ
áo pickleball cho đội nhóm
```

Avoid unsupported claims about fabric composition, delivery time, warranty, certification, price, or official affiliation.

Long description target: 300–450 Vietnamese words for normal converted products. Include both final images in the long description as responsive `<figure>` blocks after the opening benefit paragraph.

Never expose workflow language such as `Ảnh 1`, `Ảnh 2`, `prompt`, `render`, `gallery`, `media`, `watermark`, `dot màu`, `form nách cao an toàn`, `SKU metadata`, or `SEO content` to shoppers.

## Manifest

Use one durable JSONL or SQLite record per selected existing destination product.

Minimum record:

```json
{
  "schema_version": "0.4-safe",
  "operation_mode": "update_existing_product",
  "selection_mode": "single_url",
  "destination_site": "mayaopickleball.vn",
  "destination_product_id": 2121,
  "product_url": "https://mayaopickleball.vn/san-pham/example/",
  "old_title": "Áo Chạy Bộ...",
  "new_title": "Bộ Quần Áo Pickleball...",
  "old_slug": "ao-chay-bo...",
  "new_slug": "bo-quan-ao-pickleball...",
  "product_code": "X24-PB-001",
  "model_references": {
    "female": "model-references/female/example-face.png",
    "male": null,
    "selection_seed": "wave-demo-X24-PB-001"
  },
  "legacy_match_reasons": ["title: chạy bộ", "image_alt: running"],
  "text_decisions": [
    {"source": "RUN", "action": "replace", "target": "PLAY"},
    {"source": "Just Keep Running", "action": "remove", "target": ""}
  ],
  "assets": {
    "image_a": {
      "style": "male_tank_no_collar_female_collared_no_sleeve",
      "status": "visual_approved",
      "output": "operations/wave/final/x24-pb-001-nam-3-lo-nu-khong-tay-co-co.webp",
      "media_id": null,
      "image_filter_tags": ["3 lỗ", "không tay", "nam không cổ", "nữ có cổ"],
      "branding": {
        "logo_source": "svg",
        "contact_overlay_present": true,
        "color_dots_present": true
      }
    },
    "image_b": {
      "style": "collared_short_sleeve",
      "status": "visual_approved",
      "output": "operations/wave/final/x24-pb-001-ngan-tay-co-co.webp",
      "media_id": null,
      "image_filter_tags": ["ngắn tay", "có cổ"],
      "branding": {
        "logo_source": "svg",
        "contact_overlay_present": true,
        "color_dots_present": true
      }
    }
  },
  "category_ids": [],
  "old_product_records": {},
  "new_media_ids": [],
  "status": "discovered",
  "attempts": {"image_a": 0, "image_b": 0},
  "qa": {},
  "errors": []
}
```

Allowed product status flow:

```text
discovered
→ normalized
→ prompts_ready
→ images_generated
→ visual_approved
→ postprocessed
→ compressed
→ backed_up
→ media_uploaded
→ product_updated
→ verified
```

Specific failure statuses:

```text
product_resolution_failed
manual_text_review
manual_visual_review
generation_failed_image_a
generation_failed_image_b
visual_rejected_image_a
visual_rejected_image_b
postprocess_failed
media_upload_failed
product_update_failed
verification_failed
```

Never represent partial work as complete. Product cannot advance beyond `visual_approved` until both Image A and Image B pass.

## Execution model

Use one resumable local runner. Do not run the whole migration as a fragile interactive agent session.

Recommended phases:

```text
discover
normalize
generate
qa-export
postprocess
compress
backup
upload
update
verify
report
```

Required CLI controls:

```text
--phase
--limit
--product-url
--product-id
--concurrency
--resume
--dry-run
--no-upload
--retry-failed
--wave-id
```

`--dry-run` must perform discovery, normalization, category decisions, and prompt creation without calling the Images API or mutating WordPress.

Recommended waves:

1. Demo: 1 existing product, 2 images, no WordPress mutation until approved.
2. Pilot: 5–10 products, contact-sheet review, canary update/rollback.
3. Wave A: 20–30 products.
4. Wave B onward: repeat 20–30 products per wave.
5. Final verification: script-check every product and spot-check category/product pages.

## API output and performance defaults

Recommended production image defaults:

```text
model: gpt-image-2 or current approved image-edit model
endpoint: image edit/reference-image flow when available
size: 1024x1024 or 1200x1200 final crop
quality: medium for production, high only for hero/problem designs
output format: webp
output compression: 80–86
images per request: 1
```

Start with:

```text
image worker concurrency: 3
per-image retry limit: 2
request timeout: 5 minutes
```

Increase to 5 workers only after a 10-product pilot shows no sustained rate-limit errors, stable generation time, acceptable visual consistency, and no cascade of prompt-correctable errors.

Do not fire unbounded image requests. Do not clear WordPress cache after each product. Do not combine generation and product update into one non-recoverable function.

## Visual QA

Every required generated/postprocessed image must pass:

### Apparel and design

- pickleball apparel form is clear;
- Image A and Image B use different garment variants; either slot may be short-sleeve, no-sleeve, tank, collared, or no-collar according to the selected variant;
- the two images do not repeat the same pose, crop, focal length, or background placement;
- no-sleeve/tank variants look like court-sport apparel, not casual fashion tanks;
- male no-sleeve/tank variants never have a collar;
- female no-sleeve variants use a neat sport collar about 80% of the time across a wave; no-collar female no-sleeve variants remain acceptable minority variation;
- female no-sleeve cut is modest, shallow, production-realistic, and covers side bust/underarm/bra-line areas;
- source palette and major graphic map remain recognizable;
- no running/race/marathon terms or visual cues remain;
- no old mockup frame, size label, source logo/domain/hotline, QR/social/contact icons, decorative border, or watermark remains.

### Subject and scene

- one adult male and one adult female together;
- fictional/non-identifying;
- sport-appropriate, tasteful, non-sexualized;
- product-selling pose, not crouched technical drill;
- plausible pickleball court geometry;
- Vietnamese court-side background is present: street edge, motorbike/scooter, local storefront, court service/kitchen area, or `X24 Sport` shop/sign;
- `X24 Sport` sign feels incidental in the frame rather than staged as the main subject;
- `X24 Sport` sign uses a red `X` when readable enough to judge;
- any readable background sign text is exactly `X24 Sport`;
- hands, paddle, ball, anatomy, fabric, and folds are plausible;
- square crop works at WooCommerce thumbnail size.

### Branding overlay

- official logo is used from SVG or PNG fallback;
- no plain text `X24` badge fallback;
- bottom contact pill exactly says `mayaopickleball.vn | Hotline/Zalo: 0989.353.247`;
- vertical color-dot column includes all eight configured dots;
- logo, dots, and contact pill are visible but unobtrusive;
- overlays do not cover faces, garment front, paddles, key artwork, or each other.

Reject and regenerate/postprocess only the failed image. Do not regenerate the accepted counterpart.

## Copy QA

Search normalized fields and public HTML case-insensitively for:

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
```

Reject unless the manifest marks the occurrence as an approved proper noun.

Also reject:

- product cannot resolve to same destination product ID;
- default/uncategorized category remains;
- title/slug mismatch;
- old source-domain links in public content;
- unsupported claims about fabric, delivery, warranty, certification, price, or official affiliation;
- image alt/caption/filename/media title whose garment style does not match the visible image;
- any male collared no-sleeve/tank top;
- duplicate garment variant, pose, crop, or focal length across Image A and Image B;
- missing image-level tags that describe the visible variant, such as `ngắn tay`, `có cổ`, `không cổ`, `3 lỗ`, `không tay`, `sát nách`, or `tank top`.

## WordPress and WooCommerce update order

Before mutation, back up:

- product ID, URL, type, status, title, slug, excerpt, content;
- featured image ID;
- gallery image IDs;
- category/tag IDs;
- SKU, price fields, stock fields, attributes, variations;
- SEO metadata;
- existing redirects if slug changes;
- source media URLs and attachment metadata.

Preferred update order:

1. Resolve the existing destination product ID.
2. Generate and QA both base images.
3. Postprocess both images with official logo, contact pill, and color dots.
4. Compress to WebP.
5. Back up old product state and verify backup is parseable.
6. Upload both approved branded images through WordPress REST media endpoint.
7. Verify both attachment URLs return HTTP 200 and image content type.
8. Set media title, alt text, caption, description, and image-level tags.
9. Update the same WooCommerce product ID through REST.
10. Set the strongest product-selling image as featured by default; set the other approved variant as first gallery image. Do not assume Image A is always the featured image.
11. Embed both final images in the long product description with shopper-facing figcaptions.
12. Preserve price, stock, product type, variations, ordering rules, and unrelated metadata unless explicitly requested.
13. Clear destination cache once per wave using only the documented destination command.
14. Verify REST and public HTML after cache clear.

Use single-product update endpoints for demo/canary. Use batch update only after the canary proves auth, schema, media references, categories, and cache behavior.

## Verification

Automated checks for every updated product:

- same WooCommerce product ID before and after;
- intended title, slug, SKU, status, category IDs, featured image ID, gallery image IDs, metadata;
- WordPress media REST shows correct dimensions, mime type, URL, alt text, caption, and image-level tags;
- Image A and Image B have accurate image-level tags for their visible garment variants;
- public product URL returns HTTP 200;
- public product HTML references the new featured and gallery images;
- public product HTML includes both embedded description images and figcaptions;
- category pages show the expected product card and image;
- forbidden running terms are absent from product fields and public HTML;
- old source-domain links are absent;
- default/uncategorized category is absent;
- official logo/contact/color dots are present on uploaded images;
- rollback manifest is present and parseable.

Visual checks per wave:

- contact sheet of all generated images;
- branding overlay check sheet;
- destination category page desktop screenshot;
- destination category page mobile screenshot;
- at least three product-page spot checks.

Completion requires fresh post-update evidence. A successful upload or API response alone is not completion.

## Rollback

Rollback must be possible per product and per wave.

For one product:

1. restore old title, slug, excerpt, content, product type, attributes, price, stock, categories, tags, and metadata;
2. restore old featured image ID and gallery image IDs;
3. restore or remove redirect records as appropriate;
4. leave newly uploaded media unreferenced unless the user explicitly asks to delete it;
5. clear only the destination cache using the documented method;
6. verify the old public product state.

For a wave, iterate only product IDs recorded in the wave manifest. Do not issue a global SQL rollback.

## Failure handling

- Generation failure leaves WordPress unchanged.
- Image A failure does not invalidate accepted Image B, and vice versa, but the product cannot advance to upload until both required images pass or the manifest records an explicit manual exception.
- Postprocess failure leaves WordPress unchanged.
- Media upload failure keeps generated local files and old product state.
- Product update failure restores that product from backup before the wave continues.
- Verification failure marks the job failed and prevents the wave from being reported complete.
- Three repeated failures with the same prompt/input move the product to manual review; do not loop indefinitely.

## Reporting

Each wave report must include:

- target site and scope;
- wave ID and product list;
- products scanned, selected, generated, approved, uploaded, updated, and verified;
- failures and manual-review reasons;
- manifest, backup, output, and contact-sheet paths;
- branding overlay evidence: logo source, contact pill present, color dots present;
- new media IDs and destination product IDs;
- category assignment summary;
- cache action;
- verification evidence;
- rollback status;
- no credentials or secret-bearing commands.
