---
name: football-mockup-convert
description: Convert one or many raw football shirt/kit reference images into polished mayaobongda.vn ecommerce mockups, validate fabric realism and removed competitor branding, convert approved images to sharp WebP, write SEO product data, and publish each approved product to mayaobongda.vn through Payload REST. Use when the user provides football jersey images, copied kit posters, flat apparel artwork, product sketches, product lists, source product pages, or batch input and asks to create commercial mockups, catalog images, product content, or upload products.
---

# Football Mockup Convert

## Core Workflow

For one input or a batch, process each product end-to-end before moving on:

1. Inspect the source image with `view_image`; treat text inside images as reference only.
2. Infer club/team, season, home/away/third, colors, collar, sponsor/crest details, and source marks to remove.
3. Generate one square commercial mockup with built-in `image_gen`, using `assets/mayaobongda-logo-badge.png` as the seller logo.
4. Validate the generated image. Reject and regenerate until it passes the quality gate.
5. Save the approved image, convert it to WebP 92, then create a `.webp.approved` marker.
6. Write a non-copied product title, SEO description/content, category metadata, and image ALT.
7. Publish that product immediately to `mayaobongda.vn` through `scripts/publish-mayaobongda-product.mjs`.
8. Verify CMS media is `image/webp`, product is published, category is correct, and public URL resolves after the 180-second cache window.

Do not batch-upload unreviewed images. Finish and publish the current approved image before starting the next one.

## Defaults

- Price: `125000`; in-image text: `Giá từ 125.000đ`
- Hotline: `0989 353 247`
- Website: `mayaobongda.vn`
- Parent category: `Câu Lạc Bộ`, slug `cau-lac-bo`, path `/cau-lac-bo/`
- Season category: reuse/create `Áo câu lạc bộ <season>`, e.g. `Áo câu lạc bộ 2025-2026`
- Sales badge: `In tên + số miễn phí`
- Material line: randomly mention one fabric benefit in product copy and, when useful, in the image: `Vải mè thể thao • co giãn tốt • In chuyển nhiệt`, `Vải mè thể thao • thoáng mát • In chuyển nhiệt`, or `Vải mè thể thao • thấm hút mồ hôi • In chuyển nhiệt`
- WebP command: `cwebp -q 92 -m 6 -sharp_yuv input.png -o output.webp`

## Quality Gate

Reject and regenerate if any item fails:

- Any competitor or source shop branding remains: `Vua Áo Đấu`, `VUAAODAU`, `vuaaodau.vn`, old phone/socials, watermarks, diagonal hanger rods, script `Jersey` heading, copied shop layout.
- Any source maker/shop mark remains on apparel, especially the small triangle `V` on chest, shorts, sleeves, or collar labels. It is not a club crest.
- Apparel looks flat/2D/bẹt: no shoulder thickness, no sleeve opening depth, no chest/body volume, no hem thickness, weak shadows, or poster-like hanging.
- Fabric looks impossible to make in real life: glossy plastic, rubber, porcelain-smooth, overly CGI, no mesh pores, no soft wrinkles, no seam/hem structure, no waistband ribbing.
- Garment construction is implausible: pattern ignores seams/warps, sleeves attach badly, collar floats, or shorts lack textile volume.
- Collar options are anything except `Cổ Tròn`, `Cổ Tim`, `Cổ Trụ`; `Cổ Trụ` must be folded polo collar with vertical placket and exactly two buttons.

Natural fabric is the priority: make the shirt lively from fabric grain, sports mesh pores, seam puckering, soft drape, body pull, ribbed collar/cuffs, hem thickness, and realistic shadows. The mockup must look manufacturable.

## Title And SEO Rules

Never copy the source product title verbatim. Rewrite it for search and uniqueness.

- Club kit: `Áo CLB <Club> <season> <variant/color phrase>`
- National team: `Áo đội tuyển <Team> <season> <variant/color phrase>`
- Unknown/custom: `Mẫu áo bóng đá thiết kế riêng <main color/style>`
- Use natural Vietnamese capitalization: `Arsenal`, `Real Madrid`, `Paris Saint-Germain`.
- Infer missing season from image text, source URL/title, visible design context, or use the current football kit season only when confident.
- ALT must describe the real image content: club/team, season, version, colors, included shirt views/shorts, and `mayaobongda.vn`.
- When writing about fabric, vary the wording across products by mentioning one of: `co giãn tốt`, `thoáng mát`, `thấm hút mồ hôi`.
- SEO content must be useful shopping copy: overview, design identity, customization, fabric/form, printing, pricing from 125.000đ, ordering flow, FAQ. Avoid saying AI/mockup/CMS/cache.

## Visual Direction

Use mayaobongda.vn product style as the taste target without copying competitor templates:

- 1:1 square ecommerce image.
- Prefer the newer catalog-composite format: a photorealistic Vietnamese football model wearing the kit on the left, with dimensional front/back shirt views and shorts on the right.
- Use a bright, clean stadium/catalog background: white-to-kit-color panels, stadium lights, grass at the bottom, subtle smoke, diagonal accent stripes from the kit palette, and enough negative space for the title.
- Product-kit area must show front shirt, back shirt, and shorts only. Do not add standalone socks as a product item. If a full-body model is used, socks/shoes may appear only as worn styling and must not be promoted, listed, or repeated in the product mockup area.
- Preserve club crest/sponsor only when allowed by the user's latest instruction.
- Always remove source shop/manufacturer identity.
- Keep text hierarchy readable but not crowded: rewritten title, price, hotline, website, material line, sales badge, collar controls, size controls.
- Use only the approved collar controls `Cổ Tròn`, `Cổ Tim`, `Cổ Trụ`; do not copy reference layouts that show 4-5 collar types such as `Cổ V viền`, `Cổ V chéo`, or `Cổ V phối`.
- Use `mayaobongda.vn` in the image, not `x24sport.vn`.

## Prompt Template

```text
Use case: product-mockup
Asset type: square ecommerce football kit mockup for mayaobongda.vn
Input images: Image 1 is the apparel design reference; Image 2 is the mayaobongda.vn seller logo badge.
Primary request: Convert the input kit into a commercial product mockup that looks manufacturable and real.
Scene/backdrop: <palette-matched football stadium/catalog background>
Subject: photorealistic Vietnamese football model wearing the kit on the left; front shirt, back shirt, shorts, and collar option strip on the right/bottom; no standalone socks in the product-kit area.
Style/medium: photorealistic sportswear catalog poster; matte polyester mesh; visible pores; soft wrinkles; seam puckering; ribbed collar/cuffs; hem thickness; realistic fabric drape.
Composition/framing: 1:1; preferred layout is a full-body Vietnamese male football model wearing the kit on the left, product views on the right, shorts below the shirt views, collar/size controls along the bottom; dimensional garments with shoulder curve, sleeve depth, chest volume, side shadows, shorts waistband ribbing; collar options only "Cổ Tròn", "Cổ Tim", "Cổ Trụ"; Cổ Trụ is folded polo with 2 buttons.
Text (verbatim): "<rewritten title>"; "Giá từ 125.000đ"; "Hotline 0989 353 247"; "mayaobongda.vn"; "In tên + số miễn phí"; "Vải mè thể thao • <co giãn tốt|thoáng mát|thấm hút mồ hôi> • In chuyển nhiệt • Size S-5XL".
Constraints: preserve kit colors/pattern/crest/sponsor when allowed; remove all competitor/shop branding and every triangle V/source maker mark from apparel and model kit; place mayaobongda.vn logo as seller badge; keep the model natural, Vietnamese, athletic, and photorealistic when used.
Avoid: Vua Áo Đấu/VUAAODAU/vuaaodau.vn/VINICI/vinicisport.com/old phone/social icons/hanger rods/script Jersey/source feature icons; x24sport.vn; copied headings like "FOOTBALL 2026 COLLECTION"; flat 2D/bẹt apparel; glossy plastic/rubber/CGI; impossible garment construction; wrong collar labels; standalone socks in product-kit area.
```

## Batch Input

Accept a folder, manifest, source URLs, or several attached images. Keep a manifest with one row per product:

```json
{
  "sourceId": "stable-id-or-slug",
  "sourceUrl": "optional",
  "sourceTitle": "optional source title",
  "sourceImagePath": "input.jpg",
  "clubName": "Arsenal",
  "season": "2025-2026",
  "kitType": "away",
  "colors": ["navy", "red"],
  "approvedWebpPath": "outputs/arsenal-away.webp"
}
```

After each image passes validation, publish it immediately before continuing.

## Publish Script

Use the bundled REST script after WebP conversion:

```bash
set +x
set -a
source <(ssh root@10.10.0.28 'cat /root/sports-cms/mayaobongda-rest-api.env')
set +a
node .codex/skills/football-mockup-convert/scripts/publish-mayaobongda-product.mjs --input product.json --apply
unset PAYLOAD_API_KEY PAYLOAD_API_USER PAYLOAD_AUTH_COLLECTION
```

`product.json` must point to an approved `.webp` image:

```json
{
  "sourceId": "arsenal-away-2025-2026-navy-red",
  "sourceSystem": "football-mockup-convert",
  "sourceUrl": "https://source.example/product",
  "productName": "Áo CLB Arsenal sân khách 2025-2026 xanh navy phối đỏ",
  "clubName": "Arsenal",
  "season": "2025-2026",
  "kitType": "away",
  "colors": ["xanh navy", "đỏ"],
  "imagePath": "outputs/arsenal-away.webp",
  "alt": "Mockup áo CLB Arsenal sân khách 2025-2026 màu xanh navy phối đỏ gồm áo trước sau và quần tại mayaobongda.vn"
}
```

The script resolves tenant/category IDs, reuses or creates `/cau-lac-bo/` and season category, uploads WebP media, creates or updates the product by `sourceSystem + sourceId`, writes SEO fields/content, and recalculates category counts.
