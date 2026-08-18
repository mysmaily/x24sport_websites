---
name: create-mayaodongphuc-outdoor-product-images
description: "Create a complete approved Mayaodongphuc outdoor/team-building product image set from a supplied garment photo: square ecommerce main, distinct landscape image 2, and article-embedded catalog. Use when the user supplies a uniform and invokes the skill without naming a role, or asks for ảnh main, ảnh thứ 2, ảnh nhúng bài viết, catalog, poster giới thiệu áo dã ngoại, or the established Mayaodongphuc logo/hotline/product-feature treatment."
---

# Create Mayaodongphuc Outdoor Product Images

Produce the complete three-image publishing set unless the user explicitly requests only one named role. Treat the supplied garment as the exact product identity and the factory's stated product properties as authoritative marketing facts.

Read `references/approved-output-contract.md` before generating. Inspect the supplied garment and the relevant approved benchmark in `assets/` with `view_image`.

## Select the deliverable

- Default invocation with a garment only: produce exactly `main`, `image-2`, and `catalog`.
- Explicit `main`: produce only the square ecommerce hero.
- Explicit `image-2`: produce only the clean landscape lifestyle/context image.
- Explicit `catalog`, `poster`, or `ảnh nhúng bài viết`: produce only the landscape integrated catalog visual.
- Never treat `image-2` and `catalog` as the same deliverable.

## Lock the product

Before generation, record:

- garment silhouette, collar, sleeve and cuff construction;
- every major color boundary and gradient direction;
- side panels, shoulder details, stripe geometry and hem;
- supplied crest/artwork placement and relative scale;
- matching shorts/pants when visible;
- front/back details that are safe to show.

Apply the identical garment to every model. Never simplify the design into a plain shirt, change the collar, move the crest, reverse the gradient, or invent unrelated marks.

## Generate as one art-directed image

Use the built-in image-generation tool with the garment reference and `assets/mayaodongphuc-logo.png`. Generate the photography, composition and campaign graphics as one integrated visual. Do not first generate a generic clean photo and then cover it with a large compositor-made sidebar.

State prompt requirements in this order:

1. exact output role and aspect ratio;
2. garment lock and logo role;
3. Vietnamese cast, action, framing and environment;
4. approved graphic hierarchy for that role;
5. exact visible copy;
6. exclusions and fidelity requirements.

Use one strong generation prompt per requested final. A targeted correction pass is allowed only for a specific typo, malformed hand, logo defect or garment detail. Tell the editor to preserve everything else.

## Vary human action

Do not make palm-to-palm high-five the default Mayaodongphuc pose. Within one set, every scene must use a different formation and action. Choose actions appropriate to the product, such as:

- walking and talking along a lakeside path;
- light relay movement with hands separated;
- examining a route or pointing toward the landscape;
- casual warm-up or stretching in staggered formation;
- carrying picnic gear while moving as a group;
- candid seated/standing conversation after an activity.

Ban repeated high-fives, prayer poses, clapping, fist circles, synchronized raised hands and generic celebration poses unless the user explicitly requests one. If one requested image uses a high-five, neither remaining image may repeat it.

## Main image contract

- Square 1:1.
- Five attractive Vietnamese adults, mixed gender, approximately 22–32.
- Scenic outdoor lake/resort/mountain setting with a clean background.
- Use one clear team action selected from the variation rules; candid smiles and distinct faces.
- Frame head to upper knee. Keep at least four shirt fronts clear.
- Models and garments carry at least 85% of the visual emphasis.
- Place the exact logo once at top-left.
- Add one slim deep-teal translucent rail at the bottom, no more than 14% of image height.
- Rail copy only: `THOÁNG MÁT`, `CO GIÃN`, `CHỐNG NẮNG`, `BỀN MÀU`, and `0989 353 247` with a phone icon.
- Do not add a title, slogan, website, paragraphs, product-detail insets or factory service claims.

## Image 2 contract

Use `assets/approved-image-2.png` as the visual benchmark for photographic hierarchy, not as a fixed pose template.

- Landscape 3:2.
- Five or six Vietnamese adults in a different formation and action from `main`.
- Favor natural walking, conversation, route-finding or relaxed movement.
- Show at least four shirt fronts and optionally one three-quarter/back view.
- Place the exact logo once at top-left.
- Show no hotline, feature rail, title, slogan, website, paragraphs or product-detail insets.
- Keep this image clean enough for direct embedding in product content.

## Catalog contract

Use `assets/approved-catalog.png` as the visual benchmark for hierarchy and density.

- Landscape 5:4.
- Five to seven Vietnamese adults in a lively lakeside/campsite scene.
- Prefer the accepted `image-2` scene as the hero reference so the campaign stays coherent without generating a third unrelated action.
- Never repeat a high-five or palm-touching pose from `main`.
- Blend a warm light information field into the left of the photograph.
- Use a large product/category title, short emotional slogan, four product properties, four close-up product windows, factory capability footer, hotline and website.
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

- the garment differs across models or materially departs from the reference;
- the group lacks a clear team-building action;
- faces, hands or body overlaps look artificial;
- the exact logo is duplicated, distorted or printed on the garment;
- hotline differs from `0989 353 247`;
- Vietnamese text is misspelled or has malformed diacritics;
- main image contains forbidden extra copy;
- image 2 contains any copy beyond the single logo;
- overlays obscure important shirt artwork;
- two images in one set repeat the same pose or formation;
- the result reads as a generic photo with pasted text rather than one campaign image.

Inspect the final at full size. If exact text remains unreliable, deterministically correct only the affected text region using a Vietnamese-capable font while preserving the integrated design.

## Output

Save accepted files in the active workspace, not only the generated-image cache.

- Main: `mayaodongphuc-<product>-main.png`
- Image 2: `mayaodongphuc-<product>-image-2.png`
- Catalog: `mayaodongphuc-<product>-catalog.png`

Return the rendered image and its absolute clickable path.
