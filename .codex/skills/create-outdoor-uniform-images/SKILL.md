---
name: create-outdoor-uniform-images
description: Create and iterate branded photorealistic group model images for the “Đồng phục dã ngoại” catalog of mayaodongphuc.com.vn from one or more supplied garment/design references. Use when the user asks to turn T-shirt or uniform artwork, mockups, flat lays, or product photos into Vietnamese adult or explicitly requested child model photos for picnic, company outing, team-building, park, resort, studio, catalog, banner, or social use, with 3–7 varied models, sleeves on every shirt, exactly one Mayaodongphuc corner logo, strict design fidelity, and rejection of plastic-looking people, anatomy defects, wrong prints, watermarks, and competitor branding.
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

- five-image website set;
- Vietnamese/Southeast Asian adults aged approximately 20–35;
- randomly choose 3–7 models per image, with mixed gender, distinct faces, and natural height/body variation;
- outdoor picnic, green park, resort lawn, or company outing;
- one square hero plus portrait and landscape supporting images;
- tasteful casual bottoms and clean footwear; keep the shirts dominant.

Use children only when the user explicitly requests children or a clearly child-focused product. Keep child styling, poses, activities, and framing age-appropriate; never sexualize or make children look like small adults.

## Apply non-negotiable catalog rules

- Always render shirts with sleeves. Preserve a supplied short-sleeve or long-sleeve construction. If the input is sleeveless or has deeply cut armholes, convert it to a practical short-sleeve uniform while extending the shoulder/side artwork naturally onto the new sleeves. Never output tank tops, singlets, sleeveless jerseys, cap sleeves that expose the armpit, or oversized armholes.
- Randomly choose 3–7 models for each image. For a set, vary counts, formation, camera distance, pose, and activity; do not reuse one five-person triangular template. Never repeat the same group count in consecutive images when alternatives exist.
- Create a variant plan with `scripts/plan_variant.py` when producing one or more outputs. Treat its corner as a preference only; actual face/body occupancy decides the safe corner.
- Add exactly one Mayaodongphuc logo from `assets/branding/` to every accepted image. Randomly select either the horizontal or vertical asset; never combine both.
- Stop the branding pass after placing the logo. Do not add a hotline, feature callouts, badges, specification rails, promotional copy, or other text overlays unless the user explicitly requests them in a future task.

## Build the design lock

Before generation, write a compact internal design lock for each shirt:

1. base and accent colors;
2. collar, sleeve, cuff, hem, and panel construction;
3. front/back artwork, exact relative placement, scale, and readable text;
4. fabric type, weave, sheen, seams, stitching, and intended fit;
5. details not visible in the references and therefore not safe to invent.

When several design images describe one garment, combine them into one lock. When they are different garments, label them A/B/C and explicitly assign each model. Do not merge motifs between garments.

If a critical side or detail is missing, avoid exposing it prominently or state the minimum assumption. Do not fabricate a detailed back print from a front-only reference.

Sleeves override exact silhouette fidelity: when a source garment is sleeveless, preserve its neckline, torso artwork, colors, and proportions while converting it to a conventional short-sleeve uniform.

## Generate proof first

Generate one clean, unbranded proof image before producing the complete set. Attach every required design/material reference through `referenced_image_paths`; use `num_last_images_to_include` only when a needed conversational image has no local path. Never use both mechanisms. Reserve one safe logo corner, but do not ask image generation to draw the Mayaodongphuc logo.

Write the prompt in this order:

1. commercial photo objective, requested crop, and randomized model count from 3–7;
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

## Add the logo

Reserve intentional negative space during base generation, then composite one approved logo PNG deterministically with `scripts/apply_logo_overlay.py`:

1. Inspect all four corners and reject any placement that covers or visually touches a face, hair, hand, garment artwork, or important activity.
2. Use the selected horizontal or vertical PNG with its transparent background, original colors, aspect ratio, and exact lettering. Place it fully inside one safe corner with 3–5% edge margin; switch corners or use the other logo asset if necessary.
3. Keep the logo subordinate to the models: approximately 14–24% of image width for the horizontal logo or 10–17% for the vertical logo.
4. Run the overlay script only after the unbranded photo passes garment/anatomy validation. Choose the safe corner by visual inspection; the script does not detect faces.
5. Inspect the composite again. Reject any overlap, low contrast, excessive scale, or clipping; change the corner or scale and rerun without regenerating the photo.

Example:

```bash
python3 /Users/hoang/.codex/skills/create-outdoor-uniform-images/scripts/apply_logo_overlay.py \
  /absolute/path/base.png /absolute/path/branded.png \
  --logo-asset /Users/hoang/.codex/skills/create-outdoor-uniform-images/assets/branding/mayaodongphuc-vertical.png \
  --logo-corner bottom-right --logo-width 0.12
```

Treat branding as an output requirement, not part of the garment design. Do not print the website logo onto the models' shirts. Do not use image generation to recreate the bundled logo asset.

## Validate and iterate

Read [references/quality-gates.md](references/quality-gates.md) before judging outputs. Inspect every generated image with `view_image`; never accept from tool completion alone.

Apply hard gates in this order:

1. design fidelity;
2. face, hands, anatomy, and age correctness;
3. fabric and print realism;
4. group consistency and scene physics;
5. sleeves, randomized group variation, exactly one correct corner logo, commercial cleanliness, composition, and requested crop.

Reject an image if any hard gate fails. Use one targeted correction per iteration, preserve everything that already works, and inspect again. Regenerate rather than claiming a wrong logo, unreadable important text, or impossible anatomy is acceptable.

If the proof cannot preserve dense typography or a tiny logo after two focused iterations, disclose the limitation and propose a safer composition with a larger, more front-facing print area or a later production retouch. Never claim exact fidelity when it is visibly wrong.

After the proof passes, generate the remaining set using [references/shot-plan.md](references/shot-plan.md). Keep garment identity, casting direction, skin treatment, color grade, season, and location family coherent while varying pose and crop. Do not make every image a near-duplicate.

Run the optional file preflight after saving a set:

```bash
python3 /Users/hoang/.codex/skills/create-outdoor-uniform-images/scripts/validate_output_files.py --expected 5 /absolute/path/to/output-*.png
```

Treat this script as file-level validation only; it never replaces visual inspection.

## Deliver

Return the accepted images with absolute paths so the app can render them. Summarize:

- which input image defined each garment;
- model age choice and setting;
- chosen model count, logo variant, and logo corner;
- output roles and aspect ratios;
- validation result and any honest remaining fidelity caveat.

Do not publish to the CMS or mutate mayaodongphuc.com.vn unless the user separately requests publishing.
