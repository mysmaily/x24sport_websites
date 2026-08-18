---
name: create-mayaodongphuc-outdoor-product-images
description: Create approved Mayaodongphuc outdoor/team-building product visuals from a supplied garment photo, including a clean square ecommerce main image or a richer article-embedded catalog image. Use when the user asks for ảnh main, ảnh đại diện sản phẩm, ảnh nhóm dã ngoại/teambuilding, ảnh thứ 2 nhúng bài viết, poster giới thiệu áo dã ngoại, or wants the established Mayaodongphuc logo/hotline/product-feature treatment.
---

# Create Mayaodongphuc Outdoor Product Images

Produce one requested final image with the approved Mayaodongphuc visual language. Treat the supplied garment as the exact product identity and the factory's stated product properties as authoritative marketing facts.

Read `references/approved-output-contract.md` before generating. Inspect the supplied garment and the relevant approved benchmark in `assets/` with `view_image`.

## Select the image role

- `main`: Default when the user asks for an image without specifying placement. Produce one square ecommerce hero that sells the garment immediately.
- `content-inline`: Use when the user says ảnh thứ 2, ảnh nhúng bài viết, poster, catalog, or asks for a fuller product story. Produce one landscape 5:4 integrated catalog visual.
- Produce only the requested role. Do not silently create a multi-image set.

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

## Main image contract

Use `assets/approved-main.png` as the visual benchmark.

- Square 1:1.
- Five attractive Vietnamese adults, mixed gender, approximately 22–32.
- Scenic outdoor lake/resort/mountain setting with a clean background.
- Controlled high-five/team interaction; candid smiles and distinct faces.
- Frame head to upper knee. Keep at least four shirt fronts clear.
- Models and garments carry at least 85% of the visual emphasis.
- Place the exact logo once at top-left.
- Add one slim deep-teal translucent rail at the bottom, no more than 14% of image height.
- Rail copy only: `THOÁNG MÁT`, `CO GIÃN`, `CHỐNG NẮNG`, `BỀN MÀU`, and `0989 353 247` with a phone icon.
- Do not add a title, slogan, website, paragraphs, product-detail insets or factory service claims.

## Content-inline contract

Use `assets/approved-content-inline.png` as the visual benchmark.

- Landscape 5:4.
- Seven Vietnamese adults in a lively lakeside campsite/team-building scene.
- Use a high-five as the central action; vary standing, kneeling and seated poses.
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
- overlays obscure important shirt artwork;
- the result reads as a generic photo with pasted text rather than one campaign image.

Inspect the final at full size. If exact text remains unreliable, deterministically correct only the affected text region using a Vietnamese-capable font while preserving the integrated design.

## Output

Save accepted files in the active workspace, not only the generated-image cache.

- Main: `mayaodongphuc-<product>-main.png`
- Content inline: `mayaodongphuc-<product>-content-inline.png`

Return the rendered image and its absolute clickable path.
