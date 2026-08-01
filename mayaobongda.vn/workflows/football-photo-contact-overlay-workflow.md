# Football Photo Contact Overlay Workflow

Use this workflow when the user provides football-kit photos that are already
visually strong and asks to keep the original image while adding only contact
information.

This workflow is intentionally separate from
`football-poster-batch-workflow.md`. Do not use the split catalog poster
generator for these source-photo-first jobs.

## Inputs

- One or more local image paths or chat-attached images.
- The source image should already be a football-kit lifestyle, catalog, or field
  photo.
- Required contact text: `X24SPORT.VN | HOTLINE: 0989 353 247`.
- Do not add collar-option text, size rows, front/back mockups, or large
  campaign headlines.

## Agent Flow

1. Treat each provided image as the edit target, not merely a style reference.
2. Keep the original model, face, pose, kit design, proportions, field/stadium
   background, lighting, depth of field, and color mood.
3. Add only a compact, premium contact overlay with the required contact text.
4. Place the contact in open space: slim bottom ribbon, lower corner, or side
   area. Do not cover faces, jersey numbers, team names, logos, product artwork,
   hands, ball contact area, or the strongest visual subject.
5. Save every generated output under
   `mayaobongda.vn/imagegen/outputs/football-photo-contact-overlays/`.
6. Return the saved absolute file paths and render the outputs back to the user.

## Prompt Template

```text
Use case: ads-marketing
Asset type: square football-kit sales photo contact overlay
Input image role: edit target

Primary request: Keep this original football-kit photo almost unchanged. Preserve
the same model(s), face(s), pose, uniform design, field/stadium background,
lighting, shadows, depth of field, and overall color mood. Do not redraw the
scene, do not replace the person, do not add new product mockups, and do not
turn the image into a split catalog poster.

Add only a compact, tasteful contact overlay in open space.

Text to add exactly:
"X24SPORT.VN | HOTLINE: 0989 353 247"

Overlay direction: use a slim bottom ribbon, lower-corner lockup, or small
floating translucent plate with subtle shadow/blur for readability. Match the
overlay accent color to the kit palette. Keep typography clean, sporty, and
premium. Make the overlay secondary to the photo.

Constraints: no collar-option text, no "TÙY CHỌN CỔ ÁO", no size row, no large
title, no top logo, no extra players, no new background, no mockup panel, no
product redraw, no watermarks, no distorted text. Do not cover faces, jersey
artwork, jersey number/name, logos, hands, or the ball. Keep the contact text
readable.
```

## Quality Check

- The result still reads as the same original photo.
- Model identity, pose, kit design, background, and lighting are preserved.
- Contact text is present, readable, and spelled exactly.
- Overlay is compact, elegant, and does not obscure important image details.
- No collar-option strip, size row, front/back mockup panel, or split catalog
  composition was introduced.
