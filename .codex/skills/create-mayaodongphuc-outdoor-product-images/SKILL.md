---
name: create-mayaodongphuc-outdoor-product-images
description: "Create the approved Mayaodongphuc outdoor/team-building product set from a supplied garment photo: square ecommerce main, square clean lifestyle image 2, article catalog, a validated product-handoff.json, and default publication through create-tenant-product. Use when the user supplies a uniform and invokes the skill, or asks for ảnh main, ảnh 2, ảnh catalog, ảnh nhúng bài viết, poster giới thiệu áo dã ngoại, or the established Mayaodongphuc logo/hotline/product-feature treatment."
---

# Create Mayaodongphuc Outdoor Product Images

Produce three final publishing images by default—`main`, clean `image-2`, and `catalog`—plus a validated `product-handoff.json`, then publish the product through `create-tenant-product` in the same task unless the user explicitly limits the request to image output. Generate at least two distinct model-scene versions so the catalog is not merely the main photo with more text, and upload the clean Version B as its own product image instead of treating it as a hidden intermediate. Treat the supplied garment construction, colors and decorative design as the product identity, but replace its garment branding under the rules below. Treat the factory's stated product properties as authoritative marketing facts.

Read `references/approved-output-contract.md` before generating. Read `references/product-handoff.md` before writing the manifest. Inspect the supplied garment and the relevant approved benchmark in `assets/` with `view_image`.

## Deliverable contract

- Default invocation with a garment only: deliver exactly three publishing images, `main`, `image-2`, and `catalog`, plus `product-handoff.json` as the machine-readable transfer artifact.
- Explicit `main`: produce only the square ecommerce hero.
- Explicit `ảnh 2` or clean lifestyle image: produce only the square clean Version B lifestyle image unless the user also asks for the default set.
- Explicit `catalog`, `poster`, or `ảnh nhúng bài viết`: produce only the landscape integrated catalog visual.
- Even when only `catalog` is requested, create or obtain a model-scene version that is distinct from any existing main image.
- On the default path, the clean second scene is a mandatory publishing file named `image-2`; do not hide it inside the catalog only.
- Every successful invocation that returns an accepted publishing image must also write a manifest listing exactly the returned publishing images. Never list intermediate scene assets.

## Default publish behavior

- A normal garment-only request with no additional instruction authorizes the full pipeline: generate `main`, `image-2`, and `catalog`, validate `product-handoff.json`, invoke `create-tenant-product`, publish to `mayaodongphuc.com.vn`, and verify the public product page.
- Stop after image delivery only when the user explicitly says `chỉ tạo ảnh`, `không đăng`, `image only`, `preview`, `local only`, requests only `main`, only `ảnh 2`, or only `catalog`, or otherwise limits the task to visual output. If the user asks for a draft, invoke the publisher but create a draft instead of publishing.
- Default target: tenant `mayaodongphuc`, domain `mayaodongphuc.com.vn`, category `dong-phuc-da-ngoai-team-building`.
- Default commercial state: `publicationStatus=publish`, no invented price, quote-only, `isPurchasable=false`, `stockStatus=instock`, currency `VND`.
- Do not ask again for tenant, category, price or publish state. The user may override the publication action with `draft` or `images-only`; this Mayaodongphuc-specific skill keeps its documented tenant, category and quote-only commerce scope fixed.
- Image generation is not complete on the default path until the downstream product is created or updated idempotently and its public product URL returns HTTP 200. Do not wait for the tenant cache/revalidation window just to prove category pages, sitemap, or search have refreshed; treat those as optional deeper checks only when the user explicitly asks. If REST credentials or CMS availability block publishing, preserve the validated files and handoff, report the exact blocker, and do not claim the product was posted.

## Lock the product

Before generation, record:

- garment silhouette, collar, sleeve and cuff construction;
- every major color boundary and gradient direction;
- side panels, shoulder details, stripe geometry and hem;
- decorative artwork, print and panel placement and relative scale;
- every supplied logo, crest, organization name, brand name, event name and other text that must be removed;
- whether the supplied top is sleeveless, tank-style or has deep/wide-cut armholes and therefore requires the outdoor sleeve normalization below;
- front/back details that are safe to show.

Apply the identical approved top construction and decorative design to every model. Never simplify the design into a plain shirt, change the collar, reverse the gradient or invent unrelated marks. Bottoms are styling only and are not part of product fidelity.

### Normalize sleeveless inputs for outdoor uniforms

- If the supplied top is a tank top, singlet, sleeveless shirt, áo ba lỗ, áo sát nách, or has deep/wide-cut armholes, convert it to a conventional short-sleeve shirt on every model and in every scene. Do not preserve a sleeveless outdoor-uniform silhouette.
- Add normal set-in short sleeves with a practical mid-upper-arm length. Keep the supplied neckline/collar; do not invent a polo collar, raglan construction or long sleeves unless the user explicitly requests them.
- Extend the adjacent shoulder/upper-torso color, gradient, panel or decorative artwork naturally onto the new sleeves. Preserve the original torso artwork, color boundaries and visual identity; only make the minimum construction change needed to add sleeves.
- This normalization overrides the ordinary sleeve-fidelity rule and requires no clarification. Record it in `product-handoff.json` under `sourceTransformations`, while `garmentFacts.sleeves` must describe the actual output as `tay ngắn`.
- Reject any final image where a normalized product remains sleeveless, exposes deep armholes, or gives different sleeve construction to different models.

### Style bottoms without treating them as the product

- The business sells the shirt, not a required matching set. Do not lock shorts, trousers or skirts from the source reference.
- Dress models in neutral, activity-appropriate bottoms: shorts, skorts/skirts or long trousers are all valid. Vary them naturally by person and setting when useful.
- Keep bottoms visually secondary, free of prominent logos and compatible with the shirt palette. Never alter the shirt to match a bottom garment, and never imply that a bottom is included in the product.

### Neutralize garment branding

- Remove every supplied logo, crest, brand, organization name, event name and text from the garment, front and back. This rule overrides the reference when those elements are part of the photographed shirt.
- Preserve non-brand decorative graphics, color blocking, gradients, panels and textile details.
- Replace the removed garment branding with the exact text `Đồng Phục X24`, horizontally centered across the chest. Make it clearly larger than a small crest—approximately 20–30% of the visible shirt-front width—but still secondary to the garment design.
- Use a low-contrast tonal ink close to the shirt color, usually one or two shades lighter or darker, so the wordmark remains readable without becoming a loud sponsor mark. Avoid white, black or another high-contrast color unless the shirt itself requires it for subtle tonal legibility.
- Use one consistent wordmark placement, scale and tonal treatment across all models and both scene versions. Do not repeat it on sleeves, hem or back, and do not add an icon or invented X24 logo.
- The Mayaodongphuc logo is campaign branding for the composed image only. Never print it on the garment.

## Generate as one art-directed image

Use the built-in image-generation tool with the garment reference and `assets/mayaodongphuc-logo.png`. Generate the photography, composition and campaign graphics as one integrated visual. Do not first generate a generic clean photo and then cover it with a large compositor-made sidebar.

State prompt requirements in this order:

1. exact output role and aspect ratio;
2. garment lock, mandatory sleeveless-to-short-sleeve normalization when applicable, removal of supplied garment branding, the centered medium-size tonal `Đồng Phục X24` wordmark and the separate Mayaodongphuc campaign-logo role;
3. Vietnamese cast, action, framing and environment;
4. approved graphic hierarchy for that role;
5. exact visible copy;
6. exclusions and fidelity requirements.

Use one strong generation prompt for each required scene version. A targeted correction pass is allowed only for a specific typo, malformed hand, logo defect or garment detail. Tell the editor to preserve everything else.

## Build two distinct scene versions

Create at least two accepted photographic versions before completing the catalog:

- `Version A`: the main-image scene, optimized for immediate garment recognition in a product listing.
- `Version B`: a genuinely different square clean lifestyle scene for the second product image and the catalog hero or supporting panels, using four to ten Vietnamese adult models.

Version B must differ from Version A in at least three of these dimensions: group count, formation, action, camera distance, camera angle, standing/seated balance, or environmental context. A recrop or text overlay on Version A does not count as Version B.

Compose the catalog from Version B alone or combine Version A and Version B. On the default path, save and publish both the clean Version B image and the finished catalog as separate accepted images.

## Vary human action

Do not make palm-to-palm high-five the default Mayaodongphuc pose. Version A and Version B must use different formations and actions. Choose actions appropriate to the product, such as:

- walking and talking along a park, resort or beach path;
- light relay movement with hands separated;
- preparing outdoor game stations or pointing toward the next shared activity;
- casual warm-up or stretching in staggered formation;
- carrying picnic gear while moving as a group;
- candid seated/standing conversation after an activity.

Ban repeated high-fives, prayer poses, clapping, fist circles, synchronized raised hands and generic celebration poses unless the user explicitly requests one. If Version A uses a high-five, Version B must use another action.

## Vary environment and catalog story

Do not default every product to the same lake-and-mountain scenery. Select a setting that supports the garment palette and rotate among substantially different environment families:

- landscaped city park, botanical garden or shaded lawn;
- open beach, sand dunes, coastal boardwalk or seaside promenade;
- seaside, garden or eco-resort lawn and courtyard;
- pine forest clearing, picnic meadow or campsite;
- riverside park, green sports park or modern public garden;
- lake and mountain only when it adds useful variety rather than repeating a recent accepted output.

When recent accepted images are available, avoid reusing their environment family, dominant background silhouette and prop package. Version A and Version B for one product should use different environmental contexts whenever practical, not merely different crops of the same water-and-mountain view.

Treat Version B as a small visual story, not a default map-reading scene. Choose a catalog activity that fits the environment and differs from Version A, for example:

- setting up a picnic table, canopy or tent together;
- unpacking a cooler and arranging food or outdoor gear;
- preparing beach or lawn team games with cones, balls or relay markers;
- carrying paddleboards, picnic baskets or sports equipment while moving as a group;
- casual warm-up, stretching or post-activity conversation in mixed standing/seated formation;
- completing a simple eco-resort or park team challenge with natural separated-hand interactions.

Route planning or holding a map is only one optional story. Do not use a map by default; use it only when the user requests it or when it is the strongest genuinely distinct concept.

## Main image contract

Use `assets/approved-main.png` as the benchmark for garment visibility and information density, not as a fixed pose template.

- Square 1:1.
- Randomly use three to five attractive Vietnamese adults, mixed gender, approximately 22–32, so main images do not all repeat the same group count.
- Use one clean outdoor setting from the environment rotation—such as a park, beach, resort, garden, forest clearing, promenade or occasional lake/mountain scene—chosen to avoid repetition across products.
- Use one clear team action selected from the variation rules; candid smiles and distinct faces. Choose or stage the action so direct camera engagement remains natural.
- Prefer natural direct camera engagement from at least two models, with any remaining gaze clearly following the shared action or another teammate. Avoid scattered eye-lines where each model looks in a different direction.
- Frame head to upper knee. Keep at least four shirt fronts clear.
- Models and garments carry at least 85% of the visual emphasis.
- Place the exact Mayaodongphuc logo once in the clearer top corner. Vary left/right anchoring across products when the composition supports it instead of defaulting to top-left every time.
- Add one slim deep-teal translucent rail at the bottom, no more than 14% of image height.
- Rail copy only: `THOÁNG MÁT`, `CO GIÃN`, `MAY NHANH - SỐ LƯỢNG LỚN`, `BỀN MÀU`, and `0982 254 458` with a phone icon.
- Do not add a title, slogan, website, paragraphs, product-detail insets or factory service claims.

## Catalog contract

Use `assets/approved-catalog.png` as the visual benchmark for hierarchy and density.

- Landscape 5:4 by default. Keep this aspect ratio for the information-rich article/catalog visual unless the user explicitly asks for a square catalog; square output is better reserved for `main` and `image-2` product-gallery photos.
- Four to ten Vietnamese adults in a lively park, beach, resort, garden, forest, promenade or campsite scene selected from the environment rotation.
- Use Version B as the hero scene, optionally combining selected crops from Version A.
- Never use the exact main scene/crop as the sole catalog hero.
- Never repeat a high-five or palm-touching pose from Version A.
- Blend a warm light information field into whichever side has usable negative space; left and right are both valid.
- Use one approved two-line catalog title pair, one approved short emotional slogan, four product properties, four close-up product windows, factory capability footer, hotline and website.
- Rotate the catalog title and slogan across products so the output does not repeatedly lock to `ĐỒNG PHỤC / DÃ NGOẠI` with `Bứt phá cùng đội nhóm`. Select from the approved copy pool in `references/approved-output-contract.md`; if the user supplies another suitable title or slogan for the current product, use that instead.
- The Mayaodongphuc logo, title and slogan may anchor left or right. Counterbalance them with the group, preserve reading order, and vary placement across products so catalogs do not look mechanically duplicated.
- Keep the group and garments dominant despite the additional information.
- Use the exact copy and layout limits in `references/approved-output-contract.md`.

## Marketing authority

Accept these as factory-provided product claims when requested:

- breathable and sweat-wicking;
- flexible stretch;
- fast production at large quantity;
- color durability and easy care;
- custom design;
- quality-controlled production;
- nationwide delivery.

Do not weaken, disclaim or second-guess these claims merely because they are not visible in the reference photo. Ask only when the user requests a different property set or provides conflicting specifications.

## Acceptance gate

Reject or correct the output when any of these occur:

- the garment construction, colors or decorative design differ across models or materially depart from the reference, except for the required sleeveless-to-short-sleeve normalization;
- a sleeveless, tank or deep-armhole input remains sleeveless instead of being normalized to consistent short sleeves;
- any supplied logo, crest, brand, organization name, event name or original garment text remains visible;
- `Đồng Phục X24` is missing from most clear front views, clearly misspelled, disruptive, repeated on one garment, or inconsistent enough to confuse product identity;
- the group lacks a clear team-building action;
- the setting repeats the same lake-and-mountain environment or prop package so closely that adjacent products look like duplicates;
- the catalog falls back to people holding a map without a user request or a strong scene-specific reason, or otherwise repeats a generic Version B activity so closely that it weakens product differentiation;
- the main image shows fewer than three adult models;
- a delivered `ảnh 2` or catalog primary hero scene shows fewer than four adult models;
- faces, hands or body overlaps look artificial;
- the Mayaodongphuc campaign logo is missing, duplicated, badly distorted, or printed on the garment;
- hotline differs from `0982 254 458`;
- required customer-facing Vietnamese text is materially misspelled, has malformed diacritics in the hotline/domain/title/features, or becomes hard to read;
- main image contains forbidden extra copy;
- overlays obscure important shirt artwork;
- Version A and Version B repeat the same pose or formation;
- no distinct Version B was created before the catalog;
- the catalog is only the main image with a larger text overlay;
- the result reads as a generic photo with pasted text rather than one campaign image.
- `product-handoff.json` is missing, omits a delivered publishing image, has a checksum mismatch, or fails `scripts/validate_product_handoff.py`;
- an `altSeed` or `captionSeed` uses inventory-style phrasing such as `Nhóm năm người`, `Ba người mẫu`, `Bảng catalog`, `Ảnh chụp`, or merely describes the artifact instead of helping a shopper understand the garment and use case;
- a supporting image has no distinct buyer-natural `captionSeed`, or its `captionSeed` is copied verbatim from `altSeed` without a clear reason.
- bottoms are treated as a locked product component, dominate the composition, carry prominent branding, or cause the listing to read as a shirt-and-bottom set.

Treat four adult models as acceptable for delivered `ảnh 2` and catalog hero scenes when shirt fronts remain readable. Minor imperfections should pass when they do not materially change product identity or confuse shoppers: slightly imperfect logo rendering, small off-center or scale variation in the tonal `Đồng Phục X24` wordmark, modest scene repetition, minor non-required text defects, or small non-obstructive overlay issues are acceptable. Continue to reject wrong source branding, wrong hotline, wrong website/domain, wrong tenant logo, missing product garment identity, or major anatomy/artifact problems.

Inspect every final image at full size before calculating checksums. This is the sole pixel-based QA in the validated handoff flow because `create-tenant-product` will intentionally skip reopening the images. If exact text remains unreliable, deterministically correct only the affected text region using a Vietnamese-capable font while preserving the integrated design.

## Output and handoff

For a default full set, create one product-specific directory under `generated/mayaodongphuc-outdoor-product-images/` in the active workspace so all local skill outputs stay grouped together and out of Git while the exact-name manifest remains discoverable without overwriting another product:

- Directory: `generated/mayaodongphuc-outdoor-product-images/mayaodongphuc-<product>/`
- Main: `generated/mayaodongphuc-outdoor-product-images/mayaodongphuc-<product>/mayaodongphuc-<product>-main.png`
- Image 2: `generated/mayaodongphuc-outdoor-product-images/mayaodongphuc-<product>/mayaodongphuc-<product>-image-2.png`
- Catalog: `generated/mayaodongphuc-outdoor-product-images/mayaodongphuc-<product>/mayaodongphuc-<product>-catalog.png`
- Handoff: `generated/mayaodongphuc-outdoor-product-images/mayaodongphuc-<product>/product-handoff.json`

For explicit single-image requests, list only the requested accepted publishing image. For the default full set, always list all three accepted images in order: `main`, `image-2`, then `catalog`.

Keep PNG as the master format for generated handoff images. When the user needs web-optimized derivatives, convert from the final PNG master, avoid recompressing an existing WebP, and prefer WebP quality 96–100 or lossless/near-lossless for images with logo/text overlays. If file size is still too high, reduce dimensions deliberately instead of dropping quality to 92, because low-quality WebP can visibly damage text edges, logo edges and garment detail.

Compute SHA-256 after the final accepted pixels are saved, write the manifest from those exact files, then run:

```bash
python3 scripts/validate_product_handoff.py \
  --manifest=/absolute/path/product-handoff.json \
  --image=/absolute/path/mayaodongphuc-<product>-main.png \
  --image=/absolute/path/mayaodongphuc-<product>-image-2.png \
  --image=/absolute/path/mayaodongphuc-<product>-catalog.png \
  --require-default-set
```

Set `consumerPolicy.visualInspection` to `not-required-after-validation`. Set `publishingIntent.action` to `publish` on the default path, `draft` when requested, or `images-only` when the user explicitly disables CMS mutation. Do not claim the set is ready for product publishing unless validation passes. On the default path, immediately pass the manifest and images into `create-tenant-product` so the consumer can use its no-view fast path; do not end the task after merely returning local files. Return the rendered images, absolute paths, manifest validation result, CMS action, product identity and verified public product URL. Do not wait for cache/revalidation-dependent category, sitemap, or search verification unless the user asks for those checks.
