---
name: create-mayaodongphuc-outdoor-product-images-v2
description: "Fast production skill for Mayaodongphuc outdoor/team-building product imagery. From one garment reference, create a square ecommerce main, a distinct landscape catalog, deterministic branding/copy overlays, and a validated product-handoff.json. Optimized to minimize image-generation retries and repeated visual inspection."
---

# Mayaodongphuc Outdoor Product Images V2 — Fast Path

Create two publishing images by default: `main` and `catalog`, plus `product-handoff.json`. Optimize for **two image-generation jobs, one QA pass, and zero text-driven regeneration**.

Read `references/runtime-contract.md`. Read `references/product-handoff.md` only when writing the manifest. **Do not inspect `assets/approved-main.png` or `assets/approved-catalog.png` during a normal run.** They are troubleshooting references only.

## Fast-path pipeline

1. Inspect the supplied garment **once** and create a compact garment lock.
2. Generate `main-base`: square lifestyle photography with integrated empty graphic zones.
3. Generate `catalog-base`: a genuinely different 5:4 lifestyle scene with an integrated empty translucent information field and detail-friendly composition.
4. Main and catalog are independent; generate them in parallel when the runtime supports parallel image jobs.
5. Add campaign logo and exact marketing copy **deterministically** with Pillow/SVG/HTML or another reliable compositor. Do not ask the image model to spell long overlay copy.
6. Perform **one visual QA pass** on the two composed finals.
7. Allow at most **one targeted image correction per output**, and only for a hard visual failure. Overlay/copy errors must be fixed by the compositor, never by regenerating the photograph.
8. Write the manifest from the garment lock + final file metadata, calculate SHA-256, then run `scripts/validate_product_handoff.py`.

Do not create an intermediate Version B. **The catalog scene itself is the second photographic version.**

## Garment lock

Record only facts needed to preserve the product: product type/silhouette/collar/sleeves, major colors/gradients/panels/stripes/artwork, visible front/back details, and source logos/text to remove.

Apply the same approved top to every model. Preserve color boundaries, gradient direction, collar, panel geometry and decorative artwork. Bottoms are neutral styling, not the product.

### Sleeveless normalization

If the input is sleeveless, tank-style, áo ba lỗ, áo sát nách, or has deep/wide armholes, normalize every output shirt to conventional set-in short sleeves. Preserve the original collar and extend adjacent color/artwork naturally onto the sleeves. Record the transformation in the handoff. No clarification is needed.

### Garment branding

Remove all source branding/text while preserving non-brand artwork. Put the exact wordmark `Đồng Phục X24` centered across each clear shirt front, about 20–30% of visible front width, in a low-contrast tonal ink. Keep placement/treatment consistent. Never print the Mayaodongphuc campaign logo on the garment.

## Image-generation prompts

Keep prompts short. The image model owns **people, garment fidelity, environment, action, lighting, composition, tonal wordmark on garment, and empty integrated graphic fields**. The compositor owns campaign logo, feature text, title, slogan, hotline and website.

Use only these prompt blocks: `ROLE`, `PRODUCT LOCK`, `SCENE`, `LAYOUT`, `DO NOT`. Explicitly request **no generated marketing text in reserved graphic zones**. Never paste handoff/schema/business rules into image prompts.

## Main base

- Full-bleed square commercial lifestyle photo; favor five believable Vietnamese adults.
- Product recognition first; shirts clearly visible.
- Natural outdoor/team-building action. Avoid default high-five, prayer/clapping/fist-circle/synchronized-raised-hands poses.
- Reserve a clean top corner for campaign logo and slim translucent bottom rail <=14% height for deterministic features/hotline.
- Keep torso artwork above rail.
- Majority direct gaze is preferred when natural, but never retry solely for gaze count.

## Catalog base

Generate directly as the second scene; never recrop main.

- 5:4 landscape; photography >=60% visual weight.
- Differ from main in at least three of: group count, formation, action, camera distance, camera angle, standing/seated balance, environment.
- Prefer a different environment family.
- Use a mini-story: picnic/tent setup, lawn/beach games, carrying outdoor gear, warm-up, or post-activity conversation. Do not default to map-reading.
- Integrate a soft translucent information field from the side with negative space; never a hard opaque sidebar.
- Keep the field free of generated marketing text. Reserve room for title, slogan, four features, four detail callouts, compact footer and contact.
- Detail callouts may use crops from accepted main/catalog photography; do not generate extra scenes for them.

## Deterministic overlay

Use `assets/mayaodongphuc-logo.png` and exact copy in `references/runtime-contract.md`.

- Main: campaign logo + four compact features + hotline only. No website.
- Catalog: logo, title, slogan, four features, four product-detail captions, factory footer, hotline and website.
- Match transparency/accent treatment to garment palette and preserve the integrated field.
- Use a Vietnamese-capable sans-serif font available in runtime.
- If text wraps poorly, resize/reflow it. **Never regenerate the photo for typography.**

## QA

### Hard failure — correction allowed once

1. garment construction/design clearly wrong;
2. normalized sleeveless input remains sleeveless or sleeves vary;
3. source branding remains prominently visible;
4. `Đồng Phục X24` absent/garbled on most clear shirt fronts;
5. major anatomy/face defect damages commercial usability;
6. main and catalog are effectively the same scene/recrop;
7. campaign logo materially corrupted after composition;
8. required overlay/contact missing or incorrect.

For 7–8, fix compositor only. For 1–6, allow one targeted edit/regeneration of the affected output while preserving everything else. After that, return the best commercially usable result unless the user explicitly requests further correction.

### Soft preferences — never retry only for these

Direct-gaze count, exact pose variety, left/right logo alternation, ideal model count, perfect environmental novelty, minor background-hand ambiguity, or other non-material stylistic preferences.

## Output and handoff

Default output directory contains only:

- `mayaodongphuc-product-main.png`
- `mayaodongphuc-product-catalog.png`
- `product-handoff.json`

Do not deliver base/intermediate generations unless requested. Build manifest from the already-recorded garment lock; do not reopen accepted images solely for copy or checksums. SHA-256 and validator remain mandatory.

## Troubleshooting mode

Only when visual style drifts or repeatedly misses the approved composition, inspect `assets/approved-main.png` and `assets/approved-catalog.png`. Use them for hierarchy/information density/integration, not fixed pose, scenery, palette or layout. Return to fast path afterward.
