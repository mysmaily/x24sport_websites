---
name: create-outdoor-uniform-images
description: Create and iterate up to two square branded photorealistic group model images for the “Đồng phục dã ngoại” catalog of mayaodongphuc.com.vn from one or more supplied garment/design references. Use when the user asks to turn T-shirt or uniform artwork, mockups, flat lays, or product photos into Vietnamese adult or explicitly requested child model photos for picnic, company outing, team-building, park, resort, studio, catalog, banner, or social use, with 3–7 varied models, 1:1 outputs, sleeves on every shirt, one vertical Mayaodongphuc logo, readable professional icon-led garment feature callouts on natural paint-swash or diagonal-gradient treatments with auto light/dark text contrast, hotline 0989 353 247, strict design fidelity, optional product-handoff manifests for downstream publishing, and rejection of plastic-looking people, anatomy defects, wrong prints, watermarks, and competitor branding.
---

# Create Outdoor Uniform Images

Generate a coherent ecommerce image set in which the supplied uniform is the product identity, not loose inspiration. Optimize for credible Vietnamese group photography, attractive natural faces, fabric realism, and strict visual validation.

Use the built-in `image_gen` tool. Do not require an API key or use a CLI image API. Load the general `$imagegen` skill when its tool instructions are not already available.

## Resolve the brief

Inspect every local input with `view_image` before generating. Classify each image as one of:

- `exact design`: preserve garment silhouette, collar, sleeves, panels, colors, approved on-garment artwork, logo/text placement, and print scale;
- `front/back design`: map the correct side to people whose shirt side is visible;
- `material reference`: preserve fabric weave, weight, sheen, drape, seams, and stitching;
- `mood/composition reference`: use only for group size, pose, crop, location, and energy; never copy its logo, watermark, text, faces, or brand.

Distinguish approved garment artwork from source-vendor branding. Preserve a customer/team logo that is visibly part of an exact design. Remove photographer watermarks, uniform-vendor logos, URLs, corner marks, and branding that belongs only to a mood/reference photo. If a mark on the garment is ambiguous, do not generate until its role is resolved.

Resolve model age, group mix, setting, output count, and aspect ratio from the request. Use these defaults when absent:

- maximum two-image website set;
- Vietnamese/Southeast Asian adults aged approximately 20–35;
- randomly choose 3–7 models per image, with mixed gender, distinct faces, and natural height/body variation;
- outdoor picnic, green park, resort lawn, or company outing;
- square 1:1 output for every accepted image; never produce portrait, landscape, banner, or non-square final assets for this skill;
- tasteful casual bottoms and clean footwear; keep the shirts dominant.
- shirt-first framing for catalog heroes: favor head-to-mid-thigh or head-to-knee crops so collars, sleeves, chest artwork, fabric, and fit occupy most of the frame; reserve full-body framing for supporting shots.

Use children only when the user explicitly requests children or a clearly child-focused product. Keep child styling, poses, activities, and framing age-appropriate; never sexualize or make children look like small adults.

## Apply non-negotiable catalog rules

- Always render shirts with sleeves. Preserve a supplied short-sleeve or long-sleeve construction. If the input is sleeveless or has deeply cut armholes, convert it to a practical short-sleeve uniform while extending the shoulder/side artwork naturally onto the new sleeves. Never output tank tops, singlets, sleeveless jerseys, cap sleeves that expose the armpit, or oversized armholes.
- Cap the accepted set at two images, even when the user asks for more. Both accepted images must be square 1:1. If the user requests a banner or social portrait, reinterpret it as a square crop with the same commercial role.
- Treat the shirt as the primary product. For hero and core catalog images, crop naturally around mid-thigh or the knee and minimize lower legs, shoes, and empty ground. Show footwear or full bodies only when the shot's activity, comparison role, or user request requires them. Never crop exactly through a knee or other joint.
- Randomly choose 3–7 models for each image. For a set, vary counts, formation, camera distance, pose, and activity; do not reuse one five-person triangular template. Never repeat the same group count in consecutive images when alternatives exist.
- Create a variant plan with `scripts/plan_variant.py` when producing one or more outputs. Treat its overlay corner and light/dark card theme as preferences only; actual face/body occupancy and background contrast decide placement.
- Add exactly one `assets/branding/mayaodongphuc-vertical.png` logo to every accepted image. Never redraw it with AI, rotate it, stretch it, or substitute another logo treatment.
- Add four concise icon-led feature callouts covering fabric, design, durability, and printing, plus a phone-call icon and the exact hotline `0989 353 247`. Use a clean rounded paint swash or soft ink-like patch behind the callouts; if the swash does not look polished, fall back to a simple evenly rounded translucent shape rather than forcing a decorative blob. Default to `--surface paint --backdrop none --theme auto`. Do not use outlined/bordered text. The script samples the placement region so bright regions get dark text and dark regions get light text. Choose the layout dynamically from a horizontal row, compact 2x2 cluster, or vertical feature rail; do not force every image into one template. Rail and side layouts should align close to the image edge margin, like shop graphics, rather than floating deep inside the photo. Use `--auto-position` first, then `--position-x`/`--position-y` for designer override after inspecting the auto result. Keep feature text large enough to read at catalog thumbnail size. Use `--surface card` only as a last-resort fallback when the paint treatment fails visual validation. It is acceptable for feature callouts to overlap plain fabric on one or two secondary shirts when needed; never cover faces, hair, hands, collars, primary chest artwork, customer/team marks, or the main garment details being sold.
- Derive claims from the supplied garment/material brief. When evidence is incomplete, use restrained, non-technical wording such as “Vải mềm nhẹ”, “Thiết kế đồng bộ”, “Bền màu, giữ form”, and “Hình in sắc nét”; never invent fabric composition, GSM, certifications, wash-cycle counts, or a named printing process.

## Build the design lock

Before generation, write a compact internal design lock for each shirt:

1. base and accent colors;
2. collar, sleeve, cuff, hem, and panel construction;
3. front/back artwork, exact relative placement, scale, and readable text;
4. fabric type, weave, sheen, seams, stitching, and intended fit;
5. details not visible in the references and therefore not safe to invent.

Also create a compact feature lock with one supported claim for each category:

1. `Vải áo`: material, hand feel, ventilation, or moisture behavior;
2. `Thiết kế`: cut, fit, collar/sleeve construction, or team consistency;
3. `Độ bền`: color retention, shape retention, seam strength, or everyday durability;
4. `Công nghệ in`: the named process only when supplied; otherwise describe the visible result without naming a process.

Keep each title and supporting line short enough for an ecommerce graphic. Use Vietnamese sentence case and avoid hype, absolutes, or unverifiable superlatives.

When several design images describe one garment, combine them into one lock. When they are different garments, label them A/B/C and explicitly assign each model. Do not merge motifs between garments.

If a critical side or detail is missing, avoid exposing it prominently or state the minimum assumption. Do not fabricate a detailed back print from a front-only reference.

Sleeves override exact silhouette fidelity: when a source garment is sleeveless, preserve its neckline, torso artwork, colors, and proportions while converting it to a conventional short-sleeve uniform.

## Generate proof first

Generate one clean, unbranded proof image before producing the complete set. Attach every required design/material reference through `referenced_image_paths`; use `num_last_images_to_include` only when a needed conversational image has no local path. Never use both mechanisms. Compose the group naturally for the photograph; do not push or compress the models to one side to manufacture a large text zone. Leave enough visual calm near an edge, corner, or side band for designer-quality icon + text overlay, but do not over-reserve empty background. The final overlay may sit partly over noncritical plain shirt fabric if that creates a stronger catalog graphic. Do not ask image generation to draw the Mayaodongphuc logo, icons, feature text, or hotline.

Write the prompt in this order:

1. commercial photo objective, shirt-first crop, and randomized model count from 3–7;
2. exact group demographics, age, expressions, varied formation, and activity;
3. exact garment design lock and per-person assignment;
4. fabric physics, fit, wrinkles, print deformation, lighting, lens, and environment;
5. hard exclusions and competitor/watermark prohibition.

Include these constraints in every prompt:

```text
The supplied garment images define the exact uniform to wear, not inspiration. Preserve color blocking, collar and sleeve construction, artwork/logo placement, print scale, spelling, and visible front/back details. Apply the same design consistently across the group unless assignments A/B/C are specified.

Use photorealistic Vietnamese people with distinct attractive faces, real skin pores and texture, small natural asymmetries, lively eyes, plausible teeth and hair strands, normal hands and body proportions, and candid interaction. Render real cotton or performance-knit fabric with seams, stitching, gravity, wrinkles, body tension, and ink integrated into the cloth.

Every shirt must have practical sleeves. No tank tops, sleeveless jerseys, exposed armpit cuts, or oversized armholes. No waxy or airbrushed skin, beauty-filter face, doll eyes, rubber/plastic fabric, pasted-flat print, extra or fused fingers, broken limbs, duplicate faces, cloned poses, warped logo, misspelled prominent text, random brand, source-vendor logo, watermark, competitor mark outside the approved exact garment artwork, or fake camera bokeh.
```

Do not ask image generation to reproduce any competitor logo or watermark visible only in a mood reference. Use only the approved bundled Mayaodongphuc logo assets for image-corner branding; do not invent or restyle the brand.

## Add the catalog overlay

Composite the approved vertical logo, four feature callouts, icons, and hotline deterministically with `scripts/apply_catalog_overlay.py`:

1. Inspect all four corners plus top, bottom, left, and right edge bands, then choose the clearest professional placement. Keep the original model formation natural and centered; never regenerate the photo solely to force everyone to the opposite side. Prefer preserving faces, hair, hands, collars, chest artwork, customer/team marks, and key product details. Allow feature cards to overlap plain fabric on one or two secondary shirts when the result is more readable and still commercially clean.
2. Use only `assets/branding/mayaodongphuc-vertical.png`, preserving its transparent background, original colors, aspect ratio, and exact lettering.
   Size the logo at roughly 12–14% of the image's shorter edge so the brand name is immediately readable at normal viewing size. It may extend beyond the feature-card row, but it must stay clear of faces and shirts and remain subordinate to the models.
3. Render each feature as a clean icon-led text lockup on top of a natural paint swash, ink-like wash, or diagonal gradient accent. Avoid generic rounded UI cards and never use text borders/strokes as the primary readability device. Let `--theme auto` sample the placement region and choose dark text on bright zones or white text on dark zones. Use one restrained outline-icon family and minimal orange accents.
4. Arrange the four feature lockups using the layout that best fits the specific image: `row` for a clean top/bottom band, `grid` for a quiet corner, or `rail` for a vertical feature stack along a side edge. A rail may feel like premium sportswear shop art direction, but it must remain airy and secondary to the garment photo. Run `--auto-position` first so the script scans candidate edge regions for lower visual activity; after visual inspection, use `--position-x` and `--position-y` to manually place the overlay by canvas fraction if the detected region still covers a face, hand, collar, logo, SKU, hotline, or key shirt artwork. Keep spacing readable at catalog thumbnail size. Choose readability over excessive caution; covering a small area of plain sleeve or torso fabric is acceptable, but covering faces, hands, collars, artwork, or important garment details is not.
5. Pass the feature lock into the script. Prefer a short title plus a 2–4 word detail. Use a small phone-call icon and regular-size hotline `0989 353 247`; do not treat the number as a headline, CTA button, or promotional badge.
6. Run the overlay only after the unbranded photo passes garment/anatomy validation. The script does not detect faces, so choose the safe corner and light/dark theme by visual inspection.
7. Inspect the composite again at full size and at thumbnail size. Reject clipping, mojibake, weak contrast, crowded typography, mismatched icon style, an oversized hotline, visible text outlines/borders, or overlays that hide the product story. Do not reject merely because a callout overlaps noncritical plain fabric on one or two shirts. Switch placement/layout/theme, use a different paint/diagonal treatment, or shorten copy and rerun without distorting the model composition. Add `--surface card` only if the graphic treatment cannot pass contrast validation.

Example:

```bash
python3 /Users/hoang/hacado/x24sport_websites/.codex/skills/create-outdoor-uniform-images/scripts/apply_catalog_overlay.py \
  /absolute/path/base.png /absolute/path/branded.png \
  --logo-asset /Users/hoang/hacado/x24sport_websites/.codex/skills/create-outdoor-uniform-images/assets/branding/mayaodongphuc-vertical.png \
  --layout rail --auto-position --theme auto --backdrop none --surface paint --logo-width 0.128 \
  --fabric-title "Vải mềm nhẹ" --fabric-detail "Thoáng, dễ vận động" \
  --design-title "Thiết kế đồng bộ" --design-detail "Gọn và tôn dáng" \
  --durability-title "Bền màu" --durability-detail "Giữ form tốt" \
  --printing-title "Hình in sắc nét" --printing-detail "Màu in đồng đều"
```

Treat the catalog overlay as an output requirement, not part of the garment design. Do not print the website logo, feature copy, icons, or hotline onto the models' shirts. Do not use image generation to recreate the bundled logo asset or typeset exact overlay copy.

## Validate and iterate

Read [references/quality-gates.md](references/quality-gates.md) before judging outputs. Inspect every generated image with `view_image`; never accept from tool completion alone.

Apply hard gates in this order:

1. design fidelity;
2. face, hands, anatomy, and age correctness;
3. fabric and print realism;
4. group consistency and scene physics;
5. sleeves, randomized group variation, exactly one correct vertical logo, readable professional icon-led feature callouts with auto light/dark contrast, understated hotline, commercial cleanliness, composition, and requested crop.

Reject an image if any hard gate fails. Use one targeted correction per iteration, preserve everything that already works, and inspect again. Regenerate rather than claiming a wrong logo, unreadable important text, or impossible anatomy is acceptable.

If the proof cannot preserve dense typography or a tiny logo after two focused iterations, disclose the limitation and propose a safer composition with a larger, more front-facing print area or a later production retouch. Never claim exact fidelity when it is visibly wrong.

After the proof passes, generate at most one additional square image using [references/shot-plan.md](references/shot-plan.md). Keep garment identity, casting direction, skin treatment, color grade, season, and location family coherent while varying pose and crop. Do not make the second image a near-duplicate.

Run the optional file preflight after saving a set:

```bash
python3 /Users/hoang/hacado/x24sport_websites/.codex/skills/create-outdoor-uniform-images/scripts/validate_output_files.py --expected 2 /absolute/path/to/output-*.png
```

Treat this script as file-level validation only; it never replaces visual inspection.

## Create the downstream product handoff

When the same request also asks to publish a product, invokes `create-tenant-product`, or explicitly requests reusable publishing metadata, write `product-handoff.json` beside the accepted images after every visual gate passes. For standalone image generation, the handoff is optional unless the user asks for it.

Read [references/product-handoff.md](references/product-handoff.md) before writing the file. The handoff is a factual visual contract, not finished product copy. Include:

- source-reference classifications and the accepted design lock;
- absolute accepted-image paths, roles, aspect ratios, model counts, overlay choices, SHA-256 checksums, factual alt seeds, natural buyer-facing caption seeds for non-primary/contextual images, and visual tags;
- visible garment facts, approved garment artwork, intended audiences/use cases, feature-lock evidence levels, unsupported claims, and fidelity caveats;
- an optional category suggestion and compact copy seeds.

Keep `altSeed` factual and accessibility-oriented, but keep `captionSeed` natural and shopper-facing. Do not make captions sound like raw vision labels; avoid visible lines such as “Ba người mẫu Việt Nam...” unless the model count matters commercially. Prefer concise Vietnamese storefront phrasing such as “Mẫu áo trắng xanh dễ nổi bật khi chụp ảnh nhóm ngoài trời.” or “Set áo cổ tròn tay ngắn phù hợp picnic và team building công ty.”

Do not finalize the product name, slug, SKU, descriptions, SEO metadata, badges, price, stock, or commercial claims here. `create-tenant-product` owns those tenant-aware fields. Never promote a `restrained-default` overlay claim into a verified product fact.

Validate the handoff before delivery:

```bash
python3 scripts/validate_product_handoff.py \
  --manifest /absolute/path/product-handoff.json \
  --image /absolute/path/accepted-hero.png \
  --image /absolute/path/accepted-support.png
```

If validation fails, correct the manifest or image list before invoking the publishing skill.

## Deliver

Return the accepted images with absolute paths so the app can render them. Summarize:

- which input image defined each garment;
- model age choice and setting;
- chosen model count, overlay corner/theme, and feature copy;
- output roles and aspect ratios;
- validation result and any honest remaining fidelity caveat.
- the validated `product-handoff.json` path when a handoff was required.

Do not publish to the CMS or mutate mayaodongphuc.com.vn unless the user separately requests publishing.
