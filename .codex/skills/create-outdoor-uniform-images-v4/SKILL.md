---
name: create-outdoor-uniform-images-v4
description: Turn one or more uniform product references into two accepted outdoor uniform scene images plus one premium 3:2 Mayaodongphuc catalog board, with exact garment fidelity, product-colored information panel, campaign slogan, four feature callouts, footer/contact treatment, and product handoff rules for embedding image 2 and catalog in product content.
---

# Create Outdoor Uniform Images — V4

Create **two finished outdoor uniform scene images plus one ecommerce/catalog board**. The supplied garment is the exact product identity. The default visual target for the board is the V4 reference composition: a wide 3:2 board with a quiet information zone on the left, a large lifestyle hero on the right/top, two supporting scene insets across the lower middle/right, and a compact brand-colored footer.

Inspect every supplied image first. Treat product images as `exact design` unless the user explicitly says they are only inspiration.

## 1. Default deliverable

Unless the user overrides it, produce **exactly 3 final publishing images total**:

1. `Image 1` — accepted outdoor lifestyle/product image, suitable as the product hero/gallery image.
2. `Image 2` — accepted outdoor lifestyle/context image, suitable for embedding inside product content.
3. `Catalog` — one final landscape catalog board at 3:2, preferably 1536×1024 or larger.

Generate **no more than 2 AI scene images** by default. The catalog is composed deterministically from those two accepted scene images plus typography/UI assets; it does not count as a third AI-generated scene. Do not default to two square images.

The final board should feel like one art-directed catalog page with several views of the same garment:

- left information panel: about 24–30% of width;
- main hero/lifestyle scene: upper/right, about 55–70% of visual emphasis;
- two supporting scene windows: lower middle/right, each showing a genuinely different context/pose;
- bottom footer band: about 9–12% of height;
- optional small environmental micro-copy/signage only when it looks natural and does not compete with the product.

Read `references/v4-layout.md` before generation/compositing. When product publishing follows, read `references/product-handoff.md` and mark `Image 2` and `Catalog` for content `<img>` embedding.

## 2. Product/design lock

Before generating, record the garment lock:

- base color and accent colors;
- collar type/color, sleeve/cuff treatment, hem and side panels;
- front artwork/logo placement and scale;
- back artwork/text if supplied;
- fabric appearance, fit, seams and print behavior;
- shorts/pants color if clearly part of the set;
- details that are **not safe to invent**.

The supplied garment defines the exact product, not inspiration. Across all V4 panels, preserve the same design. Never mutate the crest, print geometry, collar, sleeve trim, color boundaries, or front/back assignment just to make a prettier scene.

## 3. Derive the visual system from the garment

V4 should visually belong to the product. Sample/estimate one dominant accent from the garment and use it for the information/footer system. For a burgundy uniform, use a restrained burgundy family; for navy, use navy; etc.

The **left information area should usually be a pale/transparent tint of the garment accent**, fading softly into the photo rather than looking like a hard generic sidebar. White or near-white remains the reading surface. The footer may use a deeper version of the same accent.

Do not blindly reuse orange/navy from the bundled logo as the page palette. Product color leads; brand colors are secondary.

## 4. Campaign slogan and copy

Create a short, apparel/team-oriented slogan only when the user has not supplied one. Prefer 2–4 short lines with strong hierarchy, for example:

`ONE TEAM`  
`ONE DREAM`  
`TOGETHER WE WIN`

The slogan belongs in the **left information panel**, not necessarily printed on the shirt. If the source garment already has back text/artwork, preserve it exactly and do not replace it with the campaign slogan.

Use concise Vietnamese feature copy. Default safe feature set when the source supports it:

- `VẢI THOÁNG MÁT` — `Bề mặt vải gọn, mềm nhẹ, thấm hút mồ hôi tốt`
- `FORM ĐỒNG BỘ` — `Dáng áo dễ mặc, tôn dáng, thoải mái vận động`
- `ĐƯỜNG MAY RÕ` — `Bo cổ và tay chắc nét, bền đẹp theo thời gian`
- `HÌNH IN SẮC NÉT` — `Công nghệ in hiện đại, bền màu, không bong tróc`

If the image does not support a claim, soften it to visually supportable wording. Never invent GSM, fiber composition, certification, wash count, UV rating, antimicrobial properties, or a specific print process.

## 5. Generate scene images first

Generate clean photographic scene images before typography/UI. Do **not** ask the image model to typeset the whole catalog board. Stop at two accepted scene images unless the user explicitly asks for more.

Default image plan:

1. **Image 1 / Hero** — 4 people preferred; outdoor picnic/team-building/lakeside/resort setting; clear shirt fronts; one person may naturally show the back if a back design exists.
2. **Image 2 / Content context** — 4–6 people; a different formation, camera distance, or activity such as closer friendly interaction, walking, light activity, or picnic/team moment; clear garments.

Random variation is welcome, but keep the two generated images meaningfully different. Do not force every run into the same scene pattern.

Default casting: believable Vietnamese/Southeast Asian adults around 20–35, mixed gender, distinct faces, natural anatomy, realistic skin and fabric. Keep the campaign coherent without requiring identical identities across panels unless reference faces are provided.

For the catalog board, use `Image 1` as the hero field and use `Image 2` plus an intelligently different crop of `Image 1` or `Image 2` for the two support windows. Because only two scene images are generated by default, this reuse is allowed when the two support windows are cropped and framed to feel distinct.

## 6. Scene prompt order

For every generated image, state in this order:

1. commercial objective, crop, model count;
2. casting, formation, pose/activity;
3. exact garment design lock and per-person front/back assignment;
4. fabric texture, folds, seams and print deformation;
5. natural light, lens/perspective, environment;
6. exclusions.

Hard exclusions: garment redesign, wrong crest, random typography, competitor branding, watermarks, cloned faces, malformed hands, plastic skin, floating props, impossible overlaps, excessive HDR, oversaturation, and text gibberish.

## 7. Compose the V4 board deterministically

After the two scene images pass quality checks, build the final board with deterministic layout tools (Pillow/HTML/CSS/other available compositor). Do not rely on generative AI for exact feature text, phone digits, footer alignment, or logo rendering.

Composition order:

1. place `Image 1` full-bleed in the upper/right visual field;
2. create the left pale/translucent product-color panel with a soft fade into the photo;
3. place the bundled Mayaodongphuc logo near the top-left with clear breathing room; never print it on the garment;
4. typeset the campaign slogan large, condensed/bold, in the product accent + dark neutral;
5. add a restrained decorative sport motif (curves/ball/linework) only if it supports the composition;
6. stack four feature callouts with a consistent icon family and short body copy;
7. place two lower supporting scene windows using `Image 2` and a distinct crop from one accepted scene image, with a thin light border and softly rounded corners; avoid giant card shadows;
8. add a full-width deep product-color footer with the same four features repeated in compact icon/title/body form;
9. at footer right, add phone icon, exact hotline `0989 353 247`, and `mayaodongphuc.com.vn`;
10. check all alignment, margins, line breaks and thumbnail readability.

The repeated features in the footer are intentional in V4: the left panel explains; the footer summarizes.

## 8. Product handoff for publishing

When the request includes creating or updating a Payload product, create or update `product-handoff.json` beside the accepted images:

- list exactly 3 accepted publishing images by default: `Image 1`, `Image 2`, and `Catalog`;
- set `Image 1` role to `product hero` or `gallery hero`;
- set `Image 2` role to `content-inline lifestyle` and mark it for content embedding;
- set `Catalog` role to `content-inline catalog` and mark it for content embedding;
- include factual `altSeed` and natural Vietnamese `captionSeed` for each image;
- do not ask the publishing skill to re-generate or reinterpret the design if the manifest checksums match.

For product content, `Image 2` and `Catalog` should be uploaded and inserted in the product description/content as actual HTML image tags, for example:

```html
<img src="PUBLIC_MEDIA_URL_FOR_IMAGE_2" alt="..." />
<img src="PUBLIC_MEDIA_URL_FOR_CATALOG" alt="..." />
```

Do not embed `Image 1` in content by default; it remains the primary gallery/hero asset unless the user asks otherwise.

## 9. Typography rules

Use Vietnamese-capable fonts available in the runtime. Favor a strong condensed/bold display face for the slogan and feature headings, and a clean sans-serif for descriptions. Keep type hierarchy obvious at thumbnail size.

Never use visible text outlines. Avoid tiny copy. Do not let text touch the edges. Keep hotline digits exact. Do not generate fake URLs or a second phone number.

## 10. Acceptance gates

Read `references/quality-gates.md`. Reject the final if any of these occur:

- garment differs materially between panels;
- the board looks like unrelated photos pasted together;
- left panel is an opaque generic block rather than product-toned/lightly translucent/faded treatment;
- slogan dominates more than the product;
- text is misspelled, clipped, or unreadable;
- logo/hotline/domain are malformed;
- support windows repeat the exact same crop/context without reason;
- footer is too tall/heavy or covers important garment content;
- people/anatomy/fabric fail realism checks.

## 11. Output naming

Use clear filenames such as `mayaodongphuc-v4-<product>-image-1.png`, `mayaodongphuc-v4-<product>-image-2.png`, and `mayaodongphuc-v4-<product>-catalog.png`. Keep intermediate rejected plates only when useful; the primary deliverable set is the two accepted scene images plus the single finished V4 catalog board.
