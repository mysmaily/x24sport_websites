# Product ImageGen Workflow

Use this workflow when refreshing or adding product images for `mayaobongda.vn`.
The user will usually provide a shop page URL, product/source image links, or a
set of existing product images.

## Goal

Create football-focused product images that sell the jersey clearly:

- realistic Vietnamese male football models;
- shirt design visible and not blocked;
- football context with varied sport environments;
- old product images preserved unless the user explicitly asks to replace them.

## Image Direction

Default hero composition:

- 1-3 main models face front, standing upright from upper thigh/knee upward.
- At least one front-facing shirt is large, flat, clear, and unobstructed.
- 1 teammate shows the back shirt with a number and the name `Your Team`.
- The back-view teammate may face fully backward or turn at a three-quarter angle,
  as long as the name and number remain readable.
- 1-3 supporting teammates may appear behind or to the side.
- Supporting teammates should be active: dribbling, passing, jogging, warming up,
  or moving through cones.
- Background action must not cover the main shirt.
- Vary the scene across a batch: outdoor football pitch, school field, stadium
  stands, indoor futsal court, training ground, or small-sided artificial turf.

Acceptable supporting variants:

- solo model holding a football low at the hip;
- light dribble/run pose if the shirt remains readable;
- team of 3-5 players with 1-3 front shirts clearly visible;
- a front trio with one back/side-back player showing `Your Team`;
- a studio-like sport setup only when it still feels like football training.

Avoid:

- fashion-only lookbook mood with no sport activity;
- a single static model repeated across many products;
- background players standing stiffly like mannequins;
- football covering the chest/design;
- bent or twisted poses that distort the shirt;
- big center `X24` logo;
- club crests, shield badges, QR codes, prices, poster text, watermarks.

Branding:

- small `X24` chest mark is okay;
- no large logo in the center chest;
- `Your Team` appears on the back only, above/around the number.

Model and quality:

- handsome Vietnamese male models;
- fair-to-medium complexion;
- athletic build;
- realistic fabric weave, seams, collar, sleeve cuffs, folds, sweat sheen, and
  natural body shadows;
- balanced lighting, commercial product quality;
- square WebP output, normally `1200x1200`.

## Prompt Template

```text
Create a realistic 1:1 square football team catalog product photo using the
referenced jersey design and colors as exact garment inspiration.

Foreground: 1-3 sharp Vietnamese male football players face the camera from
upper thigh/knee upward. At least one front-facing player stands upright with
the full front shirt design clear, flat, and unobstructed. Add one teammate
showing the back of the shirt, either fully turned around or three-quarter
turned, with number 10 and the name "Your Team" readable on the back.

Scene: choose a football environment that fits the jersey and varies the batch:
outdoor pitch, school field, stadium stands, indoor futsal court, training
ground, or small-sided artificial turf. Background teammates in matching kit may
actively train: dribbling, passing, jogging through orange cones, warming up, or
moving naturally. Keep all action behind or to the side so it does not cover the
front jersey.

Front chest has only a small X24 mark; no club crest, no shield badge, no
"Your Team" on front, no big center logo. Real jersey fabric weave, seams,
collar/cuffs, folds, sport sweat highlights, natural body shadows. Balanced
sports lighting, commercial product quality. No poster text, price, QR,
watermark.
```

## Execution Steps

1. Fetch the products from the provided shop page or source list.
2. Back up the affected product records before mutation.
3. Download existing/reference images into an operation folder.
4. Generate one new image per product using ImageGen and the reference image.
5. Save generated images as WebP in `generated/`.
6. Upload each WebP to Payload CMS media with tenant `mayaobongda`.
7. Update product gallery according to the user request:
   - add-only request: prepend new media, keep all old gallery images behind it;
   - replace request: replace old gallery only when explicitly instructed;
   - mixed request: follow the user-specified product ranges exactly.
8. Do not edit `contentHtml` or `legacyImages` unless requested or needed to
   remove replaced old images from product descriptions.

## Verification

After upload/update:

- CMS product count matches the target product count.
- Each updated product has the new media first in `gallery`.
- Existing gallery media IDs are still present for add-only requests.
- Every new media URL returns `200` and `image/webp`.
- Public shop page HTML contains the new media URLs.
- Capture desktop and mobile screenshots when practical.
- Do not restart services for media/gallery-only updates.

## Reporting

Report:

- target page/products;
- number of images generated and uploaded;
- media ID range or list;
- gallery behavior applied;
- backup/log folder;
- verification results;
- whether cache/services were touched.
