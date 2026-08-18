---
name: create-outdoor-uniform-images
description: Create polished photorealistic outdoor/team-building uniform catalog images from supplied garment references, with strict design fidelity, optional designer-quality slogan typography integrated onto the shirt, Mayaodongphuc branding, supported feature callouts, hotline, quality validation, and optional product handoff.
---

# Create Outdoor Uniform Images

Create ecommerce images in which the supplied uniform is the product identity, not loose inspiration. Prioritize garment fidelity, believable Vietnamese/Southeast Asian group photography, natural anatomy, tactile fabric, and professional graphic design.

Use the image-generation/editing capability available in the current runtime. Attach supplied image references using the runtime's supported image-reference mechanism; do not depend on a specific parameter name. Inspect every supplied reference with the available image-viewing capability before generation.

## 1. Resolve the brief

Classify inputs as `exact design`, `front/back design`, `material reference`, or `mood/composition reference`. Preserve approved garment artwork; never copy vendor watermarks, URLs, unrelated brands, or mood-reference logos.

Resolve age, group mix, setting, output count, aspect ratio, and whether shirt slogan artwork is requested. Defaults:

- website product set: 2 square 1:1 clean lifestyle/product images **plus 1 square 1:1 catalog board**;
- Vietnamese/Southeast Asian adults around 20–35;
- 3–5 people preferred for hero fidelity; 6–7 allowed for wider lifestyle scenes;
- park, picnic, resort lawn, company outing, or team-building setting;
- shirt-first head-to-mid-thigh/head-to-knee framing for hero images.

Keep the deliverables separate by default. The clean lifestyle/product images are standalone gallery assets that should show the garment without heavy feature overlays. The catalog board is the only default output that combines multiple scenes with Mayaodongphuc branding, four feature callouts, and hotline. If the user explicitly asks for only branded images or only clean images, follow that request.

These are workflow defaults, not universal restrictions. Follow an explicit user-requested count/aspect ratio unless the invoking catalog workflow requires otherwise.

Sleeves are a catalog-policy override, not design fidelity. Preserve the supplied construction by default. If this catalog specifically forbids sleeveless garments, flag a sleeveless source or convert it only when the user/workflow authorizes that conversion.

## 2. Build the design lock

Record: colors; collar/sleeve/cuff/hem/panels; front/back artwork and placement; fabric/weave/sheen/seams/fit; and details that are not safe to invent. Combine references only when they describe the same garment.

If adding shirt text, read `references/shirt-typography.md` and create a **typography lock** before generation. The slogan becomes approved garment artwork. It must be composed as a real apparel graphic with hierarchy, type character, spacing, print scale, ink colors, and optical placement—not plain typed text pasted onto the chest.

Default generic slogan choices include `ONE TEAM`, `BETTER TOGETHER`, `WE ARE ONE`, `STRONGER TOGETHER`, `EXPLORE TOGETHER`, `OUTDOOR CREW`, `GO EXPLORE`, `ALL IN`, and `GOOD VIBES`. Prefer user-supplied copy when present.

When the brief includes a campaign slogan reference, back-print reference, or asks for a production/catalog board, do not treat slogan text as optional. Use the supplied slogan as approved garment artwork and show it clearly on at least one natural back-facing wearer when a back reference exists. For the common football/team sample, the preferred lock is:

- front/display campaign slogan: `ONE TEAM ONE DREAM` with support line `TOGETHER WE WIN`;
- back shirt artwork: stacked `ONE TEAM` / `ONE DREAM` / `TOGETHER WE WIN`;
- ink: garment burgundy for the primary lines, dark navy/charcoal for the support line when needed;
- type: condensed athletic sans, bold uppercase, tight but readable tracking;
- composition: centered upper-back lockup with the supplied curved ball/sweep graphic below when provided.

## 3. Plan variants

Read `references/layout-presets.md`, then run `scripts/plan_variant.py` when producing outputs. Randomize composition with anti-repeat using the default mix: about 45% `single-hero`, 35% `campaign-composite-3`, and 20% `front-back-showcase`. These weights are defaults, not quotas. It biases toward 3–5 models because garment design, text fidelity, faces, and hands are more reliable there.

For the default website product set, plan the clean gallery images and the catalog board as different deliverables:

- clean image 1: standalone `single-hero` or natural lifestyle scene, no feature/footer overlay;
- clean image 2: standalone detail/context/front-back variant, no feature/footer overlay;
- catalog board: `campaign-composite-3` or `front-back-showcase` with deterministic logo, feature callouts, and hotline.

For production-ready campaign boards, run `scripts/plan_variant.py --production-campaign`. Pass `--slogan` whenever the user supplied exact words, for example `--slogan 'ONE TEAM ONE DREAM / TOGETHER WE WIN'`. This mode deliberately favors `campaign-composite-3` or `front-back-showcase`, 4–5 models, at least one back view, slogan artwork, and a continuous bottom-band overlay. Use the normal randomized planner only for exploratory website sets where no slogan/back-print campaign is requested.

`campaign-composite-3` is an intentional premium layout, not an accidental collage: one dominant hero scene plus two supporting lifestyle views from the same campaign. Plan negative space for the information system before generation. When using a bottom band, the generated composite must reserve a footer-safe zone: all supporting frames and important garment/face content sit above the future band, so the final overlay does not make the two smaller scenes look submerged or cropped. Treat planner choices as art-direction suggestions, not permission to violate the design lock.

Use relative paths from the skill root in examples and scripts. Never rely on machine-specific paths such as `/Users/...`.

## 4. Generate a clean proof

Generate one clean proof before the full set. For the default website product set, generate and inspect the clean standalone gallery proofs first, then generate the catalog-board proof separately.

For a campaign preset, generate the photography/composite with intentional negative space for the later information system; do not fill that space with fake UI or random text. Do not ask image generation to draw the Mayaodongphuc corner logo, feature-callout icons, hotline, or catalog UI overlay; those belong to the deterministic overlay stage. The generated proof may include the campaign scene, subframes, blank editorial field, and garment slogan printed on the shirt, but the Mayaodongphuc logo/features/hotline must remain deterministic overlays.

When the catalog board will use a bottom feature band, reserve the bottom 10–12% as a calm overlay lane and place every subframe above that lane. In `campaign-composite-3`, do not let the lower supporting frames extend behind the future band; move those two frames upward or shorten them before generation so the final footer reads as a label band below the scenes, not as a veil covering them.

The shirt slogan is different: when requested, it is **part of the garment design** and must be rendered into the fabric so it follows torso perspective, folds, lighting, texture, and occlusion.

Prompt order:

1. commercial objective, crop, and model count;
2. demographics, distinct faces, formation, pose, and activity;
3. exact garment design lock and per-person assignment;
4. exact typography lock when applicable;
5. fabric physics, print deformation, lighting, lens, and environment;
6. hard exclusions.

Always state that supplied garment references define the exact product, not inspiration. Reject design drift, plastic skin, malformed hands, cloned faces/poses, random text, watermarks, competitor branding, floating graphics, and inconsistent shirt slogans.

## 5. Inspect and correct

Use `references/quality-gates.md`. All hard gates must pass before acceptance. For shirt typography, verify exact spelling, line breaks, hierarchy, relative scale, ink colors, placement, perspective deformation, and consistency across models.

If text is wrong, make a targeted edit: keep accepted faces, poses, scene, garment construction, colors, lighting, and crop; correct only the shirt artwork. Never accept gibberish because the overall photo looks good.

When exact slogan text is difficult across a large group, reduce prominently front-facing slogan shirts or favor 3–4 models rather than tolerating bad lettering.

## 6. Add catalog branding and feature overlay

After the clean proof passes, add exactly one bundled `assets/branding/mayaodongphuc-vertical.png` logo in a top corner using the overlay scripts. Never redraw it with AI or print it onto the garment.

Add four concise supported feature callouts—fabric, design, construction/durability, printing—plus a phone icon and exact hotline `0989 353 247`. For v3, prefer a **single coherent information surface** instead of four separate cards: either a generous side editorial panel or one continuous bottom band. The surface should be translucent/gradient and derived from the garment's dominant/accent color, with generous whitespace, subtle separators, and one consistent outline-icon family.

Apply the full catalog overlay only to the catalog-board deliverable by default. For clean gallery images, use no overlay unless requested; if branding is needed for gallery images, add only the corner logo and keep feature text/hotline off the photo.

For production catalog output, choose the information surface from the actual composition:

- If the image has a large quiet editorial field, fill that field with the slogan, four feature callouts, and hotline. Do not leave a decorative blank void and do not repeat the same features in a footer.
- If the photo edge is busy or the campaign has no usable editorial field, use the deterministic bottom band.
- Do not use the same overlay layout mechanically across a batch. The overlay must answer the image: left field, right field, bottom band, or minimal logo-only plus separate product card when that is the cleanest composition.

For deterministic bottom-band output:

```bash
python scripts/apply_catalog_overlay.py input.png output.png \
  --logo-asset assets/branding/mayaodongphuc-vertical.png \
  --layout bottom-band \
  --band-height 0.10 \
  --band-color '#740e26' \
  --band-alpha 188 \
  --theme dark \
  --surface none
```

This creates one full-width transparent band at the bottom, roughly 10% of the shorter image edge, with white text and subtle separators. The underlying catalog-board proof must already contain a clear footer-safe lane; do not simply cover the bottom of important subframes, faces, collars, chest artwork, hands, or key product detail. Do not place feature text directly onto grass, shorts, shoes, or other busy photo texture. Do not use disconnected mini-cards for production unless the user explicitly asks for cards.

When using an editorial feature panel instead of the footer, run composition validation:

```bash
python scripts/validate_catalog_composition.py output.png \
  --aspect 3:2 \
  --require-left-panel-features \
  --forbid-footer-band
```

This validation is not a replacement for visual review, but it catches the most common production failures: dead blank panels, accidental footer bands, wrong aspect ratio, and undersized files.

For `campaign-composite-3`, the editorial field may also carry the campaign slogan in large designer typography. This display slogan is separate from shirt artwork: the display version can be deterministic overlay text, while any slogan printed on a shirt must still obey the garment typography lock and fabric physics. Avoid generic dashboard UI, disconnected dark cards, badge strips, and default orange accents when orange is not part of the garment palette. Read `references/layout-presets.md`.

`--auto-position` is only a low-visual-activity heuristic; it does not understand faces or garment semantics. Inspect the result and override placement when it covers faces, hands, collars, approved artwork, slogan graphics, or important product details.

Do not invent composition/GSM/certification/wash-count/printing-process claims. If evidence is incomplete, prefer visually supportable wording such as `Bề mặt vải gọn`, `Form áo đồng bộ`, `Đường may rõ nét`, and `Hình in sắc nét` rather than unsupported durability claims.

## 7. Final acceptance and handoff

Reinspect the branded output. The shirt remains visually dominant; catalog graphics stay secondary. Validate output files with `scripts/validate_output_files.py`. When downstream publishing needs metadata, follow `references/product-handoff.md` and validate with `scripts/validate_product_handoff.py`.

Read `references/layout-presets.md` first for v3 campaign composition, `references/shot-plan.md` for photographic variation, and `references/shirt-typography.md` for apparel graphic direction.
