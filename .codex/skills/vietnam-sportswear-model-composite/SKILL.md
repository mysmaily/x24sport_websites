---
name: vietnam-sportswear-model-composite
description: Create photorealistic Vietnamese male, female, or group model photos wearing a user-provided sportswear design on bundled X24Sport shop backgrounds. Use when the user provides or references a jersey/shirt design image for football, running, badminton, basketball, volleyball, pickleball, esports, or other sports and asks to generate realistic model photos, shop-background composites, try-on images, catalog images, or AI photos that should look like real Vietnamese models in a sportswear store.
---

# Vietnam Sportswear Model Composite

## Purpose

Generate realistic Vietnamese model photos wearing the user's exact sportswear design, composited into selected X24Sport shop backgrounds. Treat the shop as supporting context; the garment and model must be the main subject.

Use the built-in `image_gen` / default imagegen path. If the user supplies local image files, inspect every input with `view_image` before generation so they are visible as references.

## Tool Mode

Always use the default built-in image generation path for this skill. It must work when `OPENAI_API_KEY` is blank or unset.

- Do not use CLI fallback or direct OpenAI API scripts for normal skill runs.
- Do not require `OPENAI_API_KEY` for this skill.
- If a caller mentions API key is blank, continue with built-in imagegen.
- Use CLI/API fallback only if the user explicitly asks for CLI/API mode and confirms they have configured credentials.

## Bundled Backgrounds

Read `references/backgrounds.md` before choosing a background. Use images from `assets/backgrounds/` as reference images, not as disposable examples.

Default priority:

1. Use `telephoto-narrow-model-zone.png` or `telephoto-horizontal-entrance-soft.png` when the user wants the least AI-looking background and strongest model focus.
2. Use `reception-reverse-wide.png` when the user wants the approved counter-to-entrance shop angle.
3. Use `entrance-inward-fuller-irregular.png` when the user wants a fuller store visible behind the model.
4. Use `telephoto-casual-left-racks.png` when the user wants a busier, lived-in shop feel.

If the user names or attaches a background, use that specific background.

## Inputs To Resolve

Identify these from the user's request:

- Design image: required. It may be a flat jersey mockup, fabric design, product photo, or full kit.
- Sport: football, running, badminton, basketball, volleyball, pickleball, esports, or the user's stated sport.
- Model type: male, female, couple, team/group, child only if explicitly requested and appropriate.
- Pose and crop: full-body, half-body, front/back/side, walking, standing, action-lite, team lineup.
- Output count and orientation: default to one image unless the user asks for several; infer vertical for social/model shots and horizontal for web banners.
- Background: use requested bundled background or choose one from the priority list.

When details are missing, make reasonable choices: Vietnamese adult model, full-body, natural standing pose, front view of the shirt, clean shop background, catalog/social quality.

## Generation Workflow

1. Inspect the shirt design and chosen background images.
2. Use the shirt design as the garment identity reference. Preserve:
   - colors, panels, gradients, sponsor/logo positions, collar and sleeve details;
   - front/back layout if provided;
   - fabric texture and print boundaries;
   - proportions of stripes, trims, numbering, badges, and design motifs.
3. Use the bundled shop background as a background plate reference. Preserve its perspective, lighting direction, cream walls, glossy beige floor, black racks, sports goods, and X24 shop mood.
4. Generate Vietnamese model(s) wearing the design in the chosen shop background.
5. Keep the model naturally grounded on the tile floor with correct scale, contact shadows, reflections, and matching warm indoor light.
6. Validate the output before responding. If defects are obvious, run one targeted iteration.

## Prompt Requirements

Include these constraints in the generation prompt:

- Photorealistic Vietnamese adult model(s), natural face and body proportions.
- The provided shirt design is the exact garment to wear, not inspiration.
- Real sportswear fabric: breathable polyester knit, subtle weave, collar seam, sleeve seam, hem stitching, side panels if present.
- Natural wrinkles and tension: folds at shoulders, chest, waist, elbows, and where the garment hangs.
- Print sits on fabric with mild distortion from body curvature, not pasted flat.
- Lighting matches the shop: warm recessed lights, soft reflections from glossy beige tile, believable contact shadow.
- Camera should feel like a real shop/catalog photo, often 50-70mm or mild telephoto unless the user asks for wide.
- Avoid AI tells: plastic skin, waxy eyes, extra fingers, distorted hands, duplicated logos, garbled large text, impossible seams, warped hangers, floating shoes, fake showroom perfection.

For group/team images, preserve design consistency across every person while allowing natural size differences and slight pose variation.

## Background And Composition Rules

- Keep the model as the focal point; do not turn the image into a showroom showcase.
- Prefer telephoto or medium perspective for realism and easier compositing.
- Keep racks and accessories slightly secondary and naturally imperfect.
- Do not make folded clothes perfectly aligned. Slightly uneven stacks and irregular hangers are desirable.
- Keep the floor around the model clean enough for a professional photo.
- Do not add baseball caps unless the user explicitly asks for caps.
- Use subtle X24 shop cues only; do not make signage the main subject.

## Validation Checklist

Before final response, inspect the generated image and check:

- The model reads as Vietnamese and realistic, not generic synthetic fashion stock.
- The garment matches the input design in color blocking, logos, collar, sleeves, and layout.
- Fabric has plausible wrinkles, weave, seams, stitching, and print deformation.
- Hands, fingers, legs, shoes, face, eyes, and body proportions are normal.
- Light direction, shadows, floor contact, and reflections match the shop.
- Background is believable, not too perfect, not too wide, and not distracting.
- No hats/caps appear unless requested.
- No obvious AI artifacts, random brands, unreadable dominant text, or warped merchandise.

Never promise that an image is impossible to detect as AI. Instead, iterate until the visible result has no obvious AI artifacts and is credible as a real shop/model photo.
