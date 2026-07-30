# Pickleball Mockup Workflow

Use this when the user asks to convert one source image or a list/page of
products into pickleball apparel mockups.

## Default Intent

Create polished pickleball product/lifestyle images from existing sportswear
designs without asking for repeated confirmation.

Default output:

- one male and one female adult Vietnamese/Asian model;
- both wearing the converted pickleball outfit;
- posed on a real outdoor pickleball court;
- paddles in hand, net and court lines visible;
- shirt front clearly visible;
- 1:1 square product/campaign image;
- preserve the source design map, not just the color mood.

## Source Reading

Treat every source image as a design reference.

Extract and preserve:

- dominant colors and accent colors;
- collar type, sleeve trim, side panels, seam lines;
- gradient placement and direction;
- geometric/brush/splatter/texture patterns;
- chest mark positions;
- front/back details if visible;
- product code or source identifier for tracking.

Remove or ignore:

- football/soccer cues;
- balls, stadium-only context, player numbers unless essential;
- old website/contact text;
- watermarks, QR codes, price strips, size bars;
- exact source logos unless explicitly approved.

## Prompt Shape

Use a structured prompt:

```text
Use case: product-mockup
Asset type: square pickleball apparel product/lifestyle image
Primary request: Convert the referenced sportswear design into pickleball apparel.
Input image role: design reference only. Preserve the design map closely.
Scene: bright outdoor pickleball court, visible net and court lines.
Subjects: one adult male and one adult female Vietnamese/Asian model wearing matching apparel.
Pose: confident commercial pose, full-body or 3/4 full-body, shirt fronts visible.
Garment: breathable court-sport fabric, realistic folds, coordinated shorts/skirt/skort.
Avoid: football cues, exact old logos/text, large numbers, distorted hands, warped paddles, extra people, cartoon style.
```

## Quality Defaults

- Generate with the image tool using the source image as reference.
- For batches, generate one image per product/source in one scripted run.
- Do not preview or wait for approval after each image in a batch.
- Use batch-first, review-after: run all jobs, then create a final contact sheet.
- Default batch concurrency: `2`; use `3` only when the API is stable and the
  user is prioritizing speed over lower retry risk.
- Retry only failed jobs or visibly bad images after reviewing the contact sheet.
- Export WebP at high quality, around `q96`; do not over-compress.
- Keep PNG/source generation files when available.
- Build a contact sheet for quick review.

## Metadata To Preserve

For every product or image, record:

- source code or source URL;
- source image URL/path;
- color palette;
- primary colors;
- style/mood;
- pattern/hoa văn;
- garment cut;
- checksum when uploading.

For Payload CMS products, store metadata in:

- `attributes`: `Màu chủ đạo`, `Phối màu`, `Phong cách`, `Hoa văn`, `Dáng áo`, `Nguồn thiết kế`;
- `products.searchTags`;
- `media.searchTags`;
- `sourceSystem`, `sourceId`, `sourceChecksum`.

## Batch Workflow

1. Fetch product list/page and source images.
2. Create `inventory.json` with code, title/slug, URL, source image, output path.
3. Download source images locally.
4. Generate a source contact sheet.
5. Create `jobs.json` for every product/source.
6. Generate all pickleball mockups in a scripted batch, without per-image preview.
7. Export high-quality WebP.
8. Generate final contact sheet.
9. Review the contact sheet and retry only failed or visibly bad items.
10. If the user asked to publish, dry-run CMS import first.
11. Back up affected CMS records before apply.
12. Upload media/create or update products.
13. Verify API, media URLs, product pages, categories, and filters.

## Confirmation Policy

Do not ask for confirmation when:

- the user provides one image and asks to convert it;
- the user provides a product list/page and asks to convert all;
- output is local files only;
- the destination tenant/site is clear from context.

Ask one concise question only when:

- the destination site/tenant is unclear;
- publishing would mutate CMS and credentials/access are missing;
- a source design contains text/logos that may need legal or brand approval;
- the user asks for an unusual format, model style, or non-default scene.

## Reporting

Final report should include:

- count completed and failed;
- output folder/contact sheet/zip paths;
- CMS product IDs/media IDs/SKU range if published;
- metadata fields preserved;
- verification evidence;
- backups created;
- services/cache touched, if any.
