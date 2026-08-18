---
name: create-mayaodongphuc-outdoor-product-images
description: "Create the approved two-file Mayaodongphuc outdoor/team-building product set from a supplied garment photo: one square ecommerce main and one article catalog, built from at least two distinct model-scene versions. Use when the user supplies a uniform and invokes the skill, or asks for ảnh main, ảnh catalog, ảnh nhúng bài viết, poster giới thiệu áo dã ngoại, or the established Mayaodongphuc logo/hotline/product-feature treatment."
---

# Create Mayaodongphuc Outdoor Product Images

Produce two final publishing files by default: `main` and `catalog`. Generate at least two distinct model-scene versions internally so the catalog is not merely the main photo with more text. Treat the supplied garment construction, colors and decorative design as the product identity, but replace its garment branding under the rules below. Treat the factory's stated product properties as authoritative marketing facts.

Read `references/approved-output-contract.md` before generating. Inspect the supplied garment and the relevant approved benchmark in `assets/` with `view_image`.

## Deliverable contract

- Default invocation with a garment only: deliver exactly `main` and `catalog`.
- Explicit `main`: produce only the square ecommerce hero.
- Explicit `catalog`, `poster`, or `ảnh nhúng bài viết`: produce only the landscape integrated catalog visual.
- Even when only `catalog` is requested, create or obtain a model-scene version that is distinct from any existing main image.
- A clean second scene is an internal source asset, not a mandatory third publishing file. Deliver it separately only when the user explicitly asks for `ảnh 2` or a clean lifestyle image.

## Lock the product

Before generation, record:

- garment silhouette, collar, sleeve and cuff construction;
- every major color boundary and gradient direction;
- side panels, shoulder details, stripe geometry and hem;
- decorative artwork, print and panel placement and relative scale;
- every supplied logo, crest, organization name, brand name, event name and other text that must be removed;
- matching shorts/pants when visible;
- front/back details that are safe to show.

Apply the identical garment construction and decorative design to every model. Never simplify the design into a plain shirt, change the collar, reverse the gradient or invent unrelated marks.

### Neutralize garment branding

- Remove every supplied logo, crest, brand, organization name, event name and text from the garment, front and back. This rule overrides the reference when those elements are part of the photographed shirt.
- Preserve non-brand decorative graphics, color blocking, gradients, panels and textile details.
- Replace the removed garment branding with the exact text `Đồng Phục X24`, set as one small, refined wordmark on the upper chest. Keep it near the visual scale of a tasteful club crest, not a sponsor banner.
- Use one consistent wordmark placement and scale across all models and both scene versions. Do not repeat it on sleeves, hem or back, and do not add an icon or invented X24 logo.
- The Mayaodongphuc logo is campaign branding for the composed image only. Never print it on the garment.

## Generate as one art-directed image

Use the built-in image-generation tool with the garment reference and `assets/mayaodongphuc-logo.png`. Generate the photography, composition and campaign graphics as one integrated visual. Do not first generate a generic clean photo and then cover it with a large compositor-made sidebar.

State prompt requirements in this order:

1. exact output role and aspect ratio;
2. garment lock, removal of supplied garment branding, the restrained `Đồng Phục X24` wordmark and the separate Mayaodongphuc campaign-logo role;
3. Vietnamese cast, action, framing and environment;
4. approved graphic hierarchy for that role;
5. exact visible copy;
6. exclusions and fidelity requirements.

Use one strong generation prompt for each required scene version. A targeted correction pass is allowed only for a specific typo, malformed hand, logo defect or garment detail. Tell the editor to preserve everything else.

## Build two distinct scene versions

Create at least two accepted photographic versions before completing the catalog:

- `Version A`: the main-image scene, optimized for immediate garment recognition in a product listing.
- `Version B`: a genuinely different group scene for the catalog hero or supporting panels.

Version B must differ from Version A in at least three of these dimensions: group count, formation, action, camera distance, camera angle, standing/seated balance, or environmental context. A recrop or text overlay on Version A does not count as Version B.

Compose the catalog from Version B alone or combine Version A and Version B. The catalog itself is the second final output; Version B remains an intermediate unless separately requested.

## Vary human action

Do not make palm-to-palm high-five the default Mayaodongphuc pose. Version A and Version B must use different formations and actions. Choose actions appropriate to the product, such as:

- walking and talking along a lakeside path;
- light relay movement with hands separated;
- examining a route or pointing toward the landscape;
- casual warm-up or stretching in staggered formation;
- carrying picnic gear while moving as a group;
- candid seated/standing conversation after an activity.

Ban repeated high-fives, prayer poses, clapping, fist circles, synchronized raised hands and generic celebration poses unless the user explicitly requests one. If Version A uses a high-five, Version B must use another action.

## Main image contract

Use `assets/approved-main.png` as the benchmark for garment visibility and information density, not as a fixed pose template.

- Square 1:1.
- Five attractive Vietnamese adults, mixed gender, approximately 22–32.
- Scenic outdoor lake/resort/mountain setting with a clean background.
- Use one clear team action selected from the variation rules; candid smiles and distinct faces.
- Frame head to upper knee. Keep at least four shirt fronts clear.
- Models and garments carry at least 85% of the visual emphasis.
- Place the exact Mayaodongphuc logo once in the clearer top corner. Vary left/right anchoring across products when the composition supports it instead of defaulting to top-left every time.
- Add one slim deep-teal translucent rail at the bottom, no more than 14% of image height.
- Rail copy only: `THOÁNG MÁT`, `CO GIÃN`, `CHỐNG NẮNG`, `BỀN MÀU`, and `0989 353 247` with a phone icon.
- Do not add a title, slogan, website, paragraphs, product-detail insets or factory service claims.

## Catalog contract

Use `assets/approved-catalog.png` as the visual benchmark for hierarchy and density.

- Landscape 5:4.
- Five to seven Vietnamese adults in a lively lakeside/campsite scene.
- Use Version B as the hero scene, optionally combining selected crops from Version A.
- Never use the exact main scene/crop as the sole catalog hero.
- Never repeat a high-five or palm-touching pose from Version A.
- Blend a warm light information field into whichever side has usable negative space; left and right are both valid.
- Use the title `ĐỒNG PHỤC DÃ NGOẠI`, a short emotional slogan, four product properties, four close-up product windows, factory capability footer, hotline and website.
- The Mayaodongphuc logo, title and slogan may anchor left or right. Counterbalance them with the group, preserve reading order, and vary placement across products so catalogs do not look mechanically duplicated.
- Keep the group and garments dominant despite the additional information.
- Use the exact copy and layout limits in `references/approved-output-contract.md`.

## Marketing authority

Accept these as factory-provided product claims when requested:

- breathable and sweat-wicking;
- flexible stretch;
- sun/UV protection;
- color durability and easy care;
- custom design;
- quality-controlled production;
- nationwide delivery.

Do not weaken, disclaim or second-guess these claims merely because they are not visible in the reference photo. Ask only when the user requests a different property set or provides conflicting specifications.

## Acceptance gate

Reject or correct the output when any of these occur:

- the garment construction, colors or decorative design differ across models or materially depart from the reference;
- any supplied logo, crest, brand, organization name, event name or original garment text remains visible;
- `Đồng Phục X24` is missing from clear front views, misspelled, oversized, repeated on one garment or inconsistent across models/scenes;
- the group lacks a clear team-building action;
- faces, hands or body overlaps look artificial;
- the exact Mayaodongphuc campaign logo is missing, duplicated, distorted or printed on the garment;
- hotline differs from `0989 353 247`;
- Vietnamese text is misspelled or has malformed diacritics;
- main image contains forbidden extra copy;
- overlays obscure important shirt artwork;
- Version A and Version B repeat the same pose or formation;
- no distinct Version B was created before the catalog;
- the catalog is only the main image with a larger text overlay;
- the result reads as a generic photo with pasted text rather than one campaign image.

Inspect the final at full size. If exact text remains unreliable, deterministically correct only the affected text region using a Vietnamese-capable font while preserving the integrated design.

## Output

Save accepted files in the active workspace, not only the generated-image cache.

- Main: `mayaodongphuc-<product>-main.png`
- Catalog: `mayaodongphuc-<product>-catalog.png`

If explicitly requested, save the clean Version B separately as `mayaodongphuc-<product>-image-2.png`.

Return the rendered image and its absolute clickable path.
