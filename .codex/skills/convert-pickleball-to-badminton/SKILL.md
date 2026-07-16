---
name: convert-pickleball-to-badminton
description: Use when converting mayaopickleball.vn WooCommerce products and their paired gallery images into new mayaocaulong.vn badminton clothing products through the Payload CMS API. Supports API-first product discovery, product-ID ledgers, duplicate/reservation checks, two-image conversion, responsible SEO copy, WebP media upload, and verified product publishing.
---

# Convert Pickleball To Badminton

## Purpose

Create new `mayaocaulong.vn` badminton clothing products from final product
images produced for `mayaopickleball.vn`. Treat the pickleball image as a visual
source only: preserve the garment design, colorway, cut, and selling composition,
but convert the sport context to badminton.

## Fixed Scope

```yaml
source_site: mayaopickleball.vn
destination_site: mayaocaulong.vn
api_backend: Payload CMS in /Users/hoang/hacado/wordpress_websites/cms-api
operation_mode: create_reserved_product_then_update
source_policy: next_payload_product_with_two_gallery_images
destination_sport: badminton
product_code_format: X24-CL-###
default_image_provider: manual-imagegen
default_conversion_strategy: full-regeneration-garment-guided
source_grouping: one_pickleball_product_pair_to_one_badminton_product
final_upload_format: webp_only
```

## Runtime Setup

Work from this skill directory:

```bash
cd /Users/hoang/hacado/wordpress_websites/.codex/skills/convert-pickleball-to-badminton
```

Use `scripts/badminton_transfer.py` for normal operation. It accepts an optional
env file with Payload CMS credentials. Do not print, commit, or summarize secret
values.

Production default credential:

- normal `run` commands automatically load
  `/Users/hoang/hacado/wordpress_websites/mayaocaulong.vn/.payload-api.env` when
  `--env-file` is omitted;
- this file contains the dedicated `mayaocaulong` tenant automation account,
  is mode `0600`, and is ignored by Git;
- keep the server-side recovery copy at
  `/root/sports-cms/mayaocaulong-catalog-api.env` on `10.10.0.28`;
- use an explicit `--env-file` only to override the production default for a
  controlled alternate environment.

Recognized environment variables:

```text
PAYLOAD_BASE_URL=http://localhost:3001
PAYLOAD_TOKEN=...
PAYLOAD_EMAIL=...
PAYLOAD_PASSWORD=...
PAYLOAD_SEED_EMAIL=...
PAYLOAD_SEED_PASSWORD=...
PAYLOAD_TENANT_ID=...
MAYAOCAULONG_PUBLIC_BASE_URL=https://mayaocaulong.vn
```

If `PAYLOAD_TOKEN` is absent, the runner logs in through `/api/users/login` with
`PAYLOAD_EMAIL` and `PAYLOAD_PASSWORD`, falling back to
`PAYLOAD_SEED_EMAIL` and `PAYLOAD_SEED_PASSWORD` for local seeded CMS env files.

Place user-supplied branding overlays in the skill `assets/` folder before the
post-process step:

```text
/Users/hoang/wordpress_websites/.codex/skills/convert-pickleball-to-badminton/assets/
```

Current overlay assets:

- `logo-badge.png`
- `badge-logo.png`
- `dot-color.png`

Dynamic contact pill:

- do not rely on a static `contact-pill.png`;
- render the contact pill dynamically per image during `mark-generated`;
- current fixed copy: `Hotline: 0989 353 247`.

Dynamic product-code corner label:

- render the manifest `product_code` directly during `mark-generated`;
- place it in the top corner opposite `badge-logo.png`;
- place the code as a small lookup label on a compact black gradient corner
  panel with white text so the code stays readable without competing with the
  apparel;
- do not ask imagegen to generate the product code inside the base photo.

SEO and search-tag output:

- write shopper-facing `name`, `slug`, `shortDescription`, and `description`
  with clear Vietnamese badminton buying intent, not generic filler;
- prioritize phrases such as `áo cầu lông đặt may`, `đồng phục cầu lông`,
  `in tên số`, `đội thi đấu`, and `câu lạc bộ` when they fit the product;
- derive `searchTags` for products and media from the image design, especially
  tone colors, gradient style, sport, and visible fit;
- include practical search tags such as the main tones, `gradient trắng đỏ cam`,
  `gradient xanh trắng`, `gradient chấm chuyển sắc`, `cổ bẻ tay ngắn`,
  `không tay`, or `ba lỗ` when applicable;
- keep these tags internal/search-oriented rather than shopper-facing slogans.

Face anchors and other identity references may still live in:

```text
/Users/hoang/wordpress_websites/.codex/skills/convert-pickleball-to-badminton/assets/image-references/
```

## Workflow

1. Build the source list from the Payload products backing the Next.js
   `https://mayaopickleball.vn/san-pham` catalog (default for the current site):

```bash
python scripts/badminton_transfer.py discover \
  --source-mode payload \
  --out /Users/hoang/hacado/wordpress_websites/mayaocaulong.vn/operations/pickleball-to-badminton/source-images.jsonl \
  --source-payload-tenant mayaopickleball
```

The runner paginates `https://cms.x24sport.vn/api/products` with
`where[tenant.slug][equals]=mayaopickleball`, matching the Next.js `/san-pham`
catalog. Each Payload product becomes exactly one source record keyed by
immutable `source_product_id`. It stores the source SKU, public `/san-pham/<slug>`
URL, media IDs, image URLs, alt text, and one combined product signature. Select
exactly two canonical WebP gallery images in this order:

1. the collared short-sleeve image;
2. the no-sleeve image, preserving the exact visible collar/neckline construction.

Never allocate separate `X24-CL-###` products to the two garment constructions
of the same pickleball SKU. Skip API products without a valid two-image WebP
pair and report the skipped count.

Use the legacy Woo Store API or local discovery only as recovery paths when the
current Payload-backed catalog is unavailable:

```bash
python scripts/badminton_transfer.py discover \
  --source-mode api \
  --source-api-url https://mayaopickleball.vn/wp-json/wc/store/v1/products \
  --out /tmp/source-images-woo.jsonl \
  --limit 20
```

```bash
python scripts/badminton_transfer.py discover \
  --source-mode local \
  --source-root /Users/hoang/hacado/wordpress_websites/mayaopickleball.vn/transfer-running-image-to-pickleball-v5/operations \
  --out /tmp/source-images-local.jsonl
```

2. Initialize a resumable manifest:

```bash
python scripts/badminton_transfer.py init \
  --wave-dir /Users/hoang/hacado/wordpress_websites/mayaocaulong.vn/operations/pickleball-to-badminton \
  --source-jsonl /Users/hoang/hacado/wordpress_websites/mayaocaulong.vn/operations/pickleball-to-badminton/source-images.jsonl \
  --product-code-start 1
```

3. Run a dry run before live API calls:

```bash
python scripts/badminton_transfer.py run \
  --wave-dir /Users/hoang/hacado/wordpress_websites/mayaocaulong.vn/operations/pickleball-to-badminton \
  --max-items 1 \
  --dry-run
```

4. Reserve one Payload product and prepare prompts:

```bash
python scripts/badminton_transfer.py run \
  --wave-dir /Users/hoang/hacado/wordpress_websites/mayaocaulong.vn/operations/pickleball-to-badminton \
  --source-key <source_product_key> \
  --max-items 1
```

The default `manual-imagegen` mode creates a placeholder product first, downloads
both API images locally, writes paired prompt files, marks the item `analyzed`, and
exits softly. Use Codex image generation with the source image and prompt file,
then save the base generated outputs into the listed `generated/` folder.

5. Post-process the generated images before upload:

- `mark-generated` now performs the branding post-process automatically;
- pass the rendered images from imagegen to `mark-generated`, and the script
  will close them with the provided logo, a dynamically rendered product-code
  corner label, a dynamically rendered contact pill, and dot color;
- place `badge-logo.png` near the top-left or top-right corner;
- place the product code in the opposite top corner as a small lookup label on a
  compact black gradient panel with white text;
- place the hotline contact pill along the bottom area;
- place `dot-color.png` along the left or right side;
- export the final deliverables as `.webp`;
- do not run upload/update directly on `.png`, `.jpg`, or `.jpeg`;
- prefer applying branding in post-process rather than asking imagegen to invent
  commercial overlays from text only.

Direct WebP rule:

- if the generation/editing tool can render the final branded result straight to
  `.webp`, skip the intermediate PNG and keep only the final `.webp`;
- if the tool outputs PNG first, use that only as a working file, then overlay
  the branding assets and export the final upload file as `.webp`;
- the upload target remains `.webp` only, regardless of whether PNG existed
  temporarily during editing.

6. Mark generated images and finish upload/update:

```bash
python scripts/badminton_transfer.py mark-generated \
  --wave-dir /Users/hoang/hacado/wordpress_websites/mayaocaulong.vn/operations/pickleball-to-badminton \
  --source-key <source_product_key> \
  --images path/to/generated-collared.png path/to/generated-crew.png \
  --colors "xanh navy" "xanh dương" \
  --gradient "gradient xanh navy xanh dương" \
  --pattern "đường sọc chéo hai bên sườn"

python scripts/badminton_transfer.py run \
  --wave-dir /Users/hoang/hacado/wordpress_websites/mayaocaulong.vn/operations/pickleball-to-badminton \
  --source-key <source_product_key> \
  --max-items 1
```

Useful inspection commands:

```bash
python scripts/badminton_transfer.py summary --wave-dir <wave-dir>
python scripts/badminton_transfer.py next --wave-dir <wave-dir>
python scripts/badminton_transfer.py list-imagegen-ready --wave-dir <wave-dir>
```

## Status Flow

```text
source_discovered -> reserved -> source_copied -> analyzed
-> images_generated -> media_uploaded -> product_updated -> verified
```

Terminal duplicate state:

```text
skipped_duplicate
```

Reservation rule: before conversion, request the Payload API for a deterministic
reservation SKU based on the combined source-product signature. If found, attach to that
product instead of creating another. If absent, create a placeholder product with
`sport=badminton`, a reservation SKU, and a temporary `dang-tao-*` slug.

Duplicate-state rule:

- `manifest.jsonl` records whether a source product is discovered, reserved,
  being converted, uploaded, or verified;
- `init` reads sibling wave manifests, reconciles legacy records by source SKU,
  and skips a source product already active in another batch;
- `init` skips a matching `source_product_id` even when its image URLs or image
  signature later change;
- a wave-local ledger and the shared parent-level
  `pickleball-to-badminton-converted-sources.jsonl` record verified conversions,
  so later waves also skip completed Woo product IDs;
- the deterministic Payload reservation SKU prevents a second destination
  product when another runner has already reserved that source signature.

The current Payload product schema has no private source-trace fields, so keep
the manifest and both ledgers with the operation artifacts. Do not delete them
between batch runs.

## Image Direction

### Full-regeneration garment-guided strategy

- default to generating a new badminton catalog photograph using the source
  image as a garment-design reference, not as a paddle-edit target;
- preserve the garment design facts from the source: colorway, gradient,
  pattern map, chest-mark placement, collar/sleeve or no-sleeve construction,
  seams, hems, fabric folds, and how the print follows the body;
- allow new fictional Vietnamese adult models, a new badminton-court composition,
  and a different crop when that improves the catalog image;
- do not attempt to directly convert pickleball paddle geometry into racket
  geometry for the final catalog image; this has proven unreliable for adult
  racket scale and grip anatomy;
- do not put rackets in the models' hands; both models should pose naturally
  with empty hands so the apparel remains the focus and hand/racket generation
  errors are avoided;
- make the badminton context unmistakable through the environment: regulation
  badminton court lines, service lines, center lines, suspended badminton net
  with posts, a small shuttlecock tube and two white shuttlecocks on the floor
  near a sideline, and optionally a subtle distant `X24 Sport Badminton Club`
  or `Sân cầu lông X24` sign;
- keep all badminton props secondary and away from garment details; props must
  not block the shirt fronts or look like foreground ad graphics;
- reject handheld rackets, pickleball paddles, tennis rackets, random sports
  equipment in hands, oversized shuttlecocks, or foreground text clutter;
- render a suspended badminton net band, not a floor-to-ceiling barrier: place
  the top tape around adult chest/shoulder height, use a net body roughly 76 cm
  deep, and keep its lower edge visibly well above the court with clear open air
  between the net and floor;
- do not extend net mesh down to the court surface and do not confuse the
  background perimeter fence with the badminton net;
- after generation, compare source and output for garment color or pattern drift,
  collar/sleeve changes, lost fabric detail, handheld equipment, remaining
  paddles, low or floor-reaching net, missing open space below the net, missing
  badminton court cues, oversized floor props, and pickleball court cues;

Generate two square product-selling badminton images by default:

- when the source product contains its standard pair, convert both source images
  in order and keep them in one destination gallery: image 1 is the collared
  short-sleeve option; image 2 is the no-sleeve option;
- for no-sleeve variants, preserve each model's exact collar/neckline from the
  source; do not assume all no-sleeve shirts are round-neck, because the male
  and female garments may differ, such as a male round neck and a female
  sleeveless folded/standing collar;
- preserve the shared colorway, panel map, pattern direction, and chest-mark
  placement across both outputs so they read as construction choices of one SKU;
- require exactly two approved outputs before publishing a paired record; never
  substitute two regenerated views of only one source variant;
- keep the same garment design, colorway, panel map, accents, and visible cut
  from the pickleball final image;
- replace pickleball paddles, balls, and court cues with badminton rackets,
  shuttlecocks, badminton net geometry, painted badminton court lines, and a
  badminton hall or dedicated badminton court;
- allow an occasional distant in-venue `X24 Sport` advertising banner or wall
  sign inside the badminton hall when it looks naturally installed in the
  environment and does not dominate the composition;
- use Vietnamese adult male and female catalog models where appropriate, or keep
  the source model count and composition if the source image is already a strong
  product-selling pair;
- show realistic sewn sportswear with seams, hems, collars, sleeve openings,
  fabric folds, and lighting that follows the body;
- keep poses relaxed and commercial, not jump-smash action shots;
- remove or avoid pickleball-readable background cues and old source text;
- leave safe space for branding overlays when the user will add logo, contact
  pill, or dot color in post-process;
- do not invent official overlays unless the user provides the asset and asks
  for post-processing.

Background signage rule:

- if using venue signage, keep it secondary, small-to-medium, and placed far
  enough away that it reads like real sports-hall advertising rather than a
  foreground graphic;
- `X24 Sport` is allowed on a distant banner, wall sign, or hanging court
  advertisement;
- do not place large centered text blocks, giant sponsor boards, or repeated
  billboard clutter that competes with the apparel.

Female pose mix:

- choose deterministically from exactly two seeded pose families per source:
  `straight-front` or `female-back-look`; reruns of the same source must keep the
  same choice while different sources vary naturally;
- in `straight-front`, keep both models standing or pausing upright with garment
  fronts readable, natural asymmetric weight shift, and varied gaze direction;
- in `female-back-look`, turn only the female three-quarter back so the rear
  panel is visible, then let her look back over one shoulder;
- never turn the male model's back to camera; keep him front-facing or
  three-quarter-front in both pose families with his shirt front readable;
- when using `back-look`, prioritize a beautiful silhouette, clear rear-garment
  visibility, and natural shoulder-neck flow over identity matching.

Skin finish and female silhouette:

- render Vietnamese models with a naturally bright, clean studio skin tone;
  lift dull or gray casts without bleaching skin or erasing natural undertones;
- keep forehead, nose, cheeks, chin, neck, shoulders, and arms softly matte;
  reduce oily specular shine and harsh hotspots while retaining realistic pores,
  gentle dimensional highlights, and healthy skin texture;
- avoid plastic smoothing, chalk-white skin, mismatched face/body tones, and
  glossy sweat unless the user explicitly requests an action-sport look;
- default the female catalog silhouette to youthful, slender, and upright, with
  a long natural neck, level relaxed shoulders, straight torso axis, balanced
  hips, and long clean leg lines;
- do not distort the garment to create the silhouette: preserve realistic body
  anatomy, comfortable sportswear ease, and the source panel map;
- before accepting an image, inspect face-to-body skin consistency, oily
  highlights, neck/shoulder alignment, torso straightness, hand-to-racket
  contact, and whether the racket is visibly supported by the grip.

Preferred catalog art direction:

- favor bright lifestyle catalog photography on an airy modern covered or
  semi-outdoor badminton court with natural daylight, clean roof framing,
  greenery or a soft urban background, and crisp white footwear;
- use relaxed asymmetric poses, natural weight shifts, and gentle off-camera
  gazes instead of stiff mirrored stances or passport-like direct staring;
- keep both garment fronts unobstructed and preserve the source hand/racket pose
  where possible; the racket may be held in any natural position as long as the
  hand truly grips the wrapped handle under visible support and natural gravity;
- retain badminton-specific racket, net, and court geometry even when a style
  reference contains pickleball equipment or court markings;
- randomize camera independently from pose only for full regeneration, using a
  deterministic weighted seed: about 50% medium upper-thigh crop, 35%
  medium-full knee crop, and 15% head-to-toe full-body frame; do not force a
  whole batch into wide framing and do not equate a pose family with one fixed
  crop;
- keep a square composition with an airy background and safe overlay space while
  keeping the apparel visually dominant.

Lighting and focus hierarchy:

- use an outdoor badminton court with a real roof or canopy as the default;
  expose the background about 1–1.5 stops darker than the models and keep its
  saturation and detail restrained;
- preserve sky, roof, trees, buildings, and court detail without clipped whites,
  blown windows, glowing haze, or a bright background that competes with the
  apparel;
- select lighting deterministically per source from soft open shade, diffused
  roof-filtered daylight, or an occasional soft side-sun patch brushing the
  models' faces; do not force direct sun on every product;
- when the sun variant is selected, keep face and skin highlights soft and
  recoverable, with no oily glare, hard flash look, squinting, or blown skin;
- enforce visual priority in this order: garment color/pattern and sewn
  construction first; female model and face second; rackets third; venue last;
- render fabric weave, seams, neckline and armhole binding, folds, hems, and
  pattern flow with more sharpness and local contrast than the background.

If the user wants to lock the female face, keep the whole head consistent rather
than pasting only a facial patch onto a new body:

- pick one source image first as the `identity anchor` when multiple candidate
  images exist;
- analyze the anchor for head yaw, head pitch, chin height, shoulder angle, and
  torso direction before choosing the target composition;
- prefer source/body compositions whose face angle and torso angle are already
  close to the anchor;
- allow face-lock only when the pose gap stays in a safe range; as a practical
  rule, keep it for mild turns and mild chin movement, not strong profile or
  strong up/down head tilt;
- preserve the original facial identity, ear visibility, jawline, neck width,
  shoulder angle, and camera height;
- do not reuse the original hair shape from the anchor; let the model generate
  new hair that fits the new pose, lighting, and outfit naturally;
- keep body pose close to the source or adjust the torso to fit the locked head,
  not the other way around;
- match skin tone, neck shadow, collar contact, shoulder anatomy, and jaw-to-neck
  transition so the merge does not feel stiff;
- avoid aggressive action poses, extreme head turns, hands near the jaw, or
  cropped hair edges that make compositing obvious;
- if the source head and target body differ too much, reject that composition
  and either pick a closer source or regenerate the whole model with the locked
  face identity instead of swapping a face onto an unrelated body.

Back-look exception:

- do not use female face anchors for `back-look` poses;
- let the model generate a fresh, attractive female model for `back-look`
  compositions;
- keep the head turn natural and limited to what still looks elegant from a
  rear-view apparel photo;
- make the back panel of the shirt easy to inspect and avoid hair completely
  covering the rear design.

## Product Content

Write Vietnamese shopper-facing fields from facts visible in the final approved
badminton images. Pass verified `--colors`, `--gradient`, and `--pattern` values
to `mark-generated`; use filenames only as a fallback, never as stronger evidence
than the approved outputs.

- `name`: keep concise and unique; include `Áo Cầu Lông`, `X24-CL-###`, main color terms, and the collar choice without keyword stuffing. Match it with a stable lowercase ASCII `slug`; set the final SKU and `sport=badminton`.
- `shortDescription`: write one useful 90–230 character paragraph with the
  primary category phrase near the beginning, then colors, visible design, the
  collar choices, and customization availability.
- `description`: write short original paragraphs in this order: visible design
  facts; the two collar/sleeve options; supported customization service; buyer
  checks for material, size chart, quantity, print placement, and lead time.
- `gallery`: for paired sources, upload exactly two WebP media IDs in collared then no-sleeve order. Give each media item unique alt text with SKU, verified colors, and its visible variant.
- `searchTags`: apply verified colors, gradient, pattern, `cổ bẻ tay ngắn`,
  `cổ gập không tay`, `cổ tròn`, and `không tay` only when visible.
- use configured destination `price` and `compareAtPrice` defaults unless the user supplies other values; use customer-facing badges only.

Do not claim fabric performance or manufacturing properties from appearance
alone. Reject unverified claims such as `thấm hút mồ hôi`, `thoáng khí`, `nhanh
khô`, `co giãn 4 chiều`, `chống tia UV`, `kháng khuẩn`, `bền màu`, or `không
nhăn`. Add such claims only when an approved material/specification source
explicitly confirms them.

Forbidden shopper-facing terms: `pickleball`, `running`, `runner`, `chạy bộ`,
`mayaochaybo`, `mayaopickleball`, `prompt`, `render`, `watermark`, `metadata`.

## References

Read `references/payload-api.md` for Payload API work. The public Woo Store API
is the canonical source-product inventory; do not scrape catalog pages. Read
`/Users/hoang/hacado/wordpress_websites/mayaopickleball.vn/transfer-running-image-to-pickleball-v5/SKILL.md`
only for resumable-manifest ideas, not WooCommerce endpoints.

## Reporting

Report source paths/signature prefixes, reserved/final Payload product ID,
uploaded media IDs, manifest and converted-ledger paths, verification result,
credential-related skips, and cache/services touched (normally none).

Never display secrets or raw credential values.
