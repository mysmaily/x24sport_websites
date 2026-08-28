---
name: upscale-print-artwork
description: "Recreate a supplied apparel/artwork reference into standalone, high-resolution raster print art, removing text and logos by default. Use for print-ready design output, not garment mockups or vector redraws."
---

# Upscale Print Artwork

Create one print-delivery artwork from a user-supplied design image: a clean, standalone raster asset at the requested physical size. The result is for the print operator, not a product photo, T-shirt mockup, social image, or vector source file.

Use this skill when a user wants to turn a design found in a reference image—including a design shown on a garment—into a large bitmap they can print. Do not use it merely to make a lifestyle/product mockup, or where the user needs an editable vector master. Internal procedural or vector construction is allowed when it is needed to rasterize precise geometric artwork; the delivery remains a raster file unless the user asks for a vector source.

Default surface treatment is flat and clean. Treat texture visible in a reference photo as untrusted unless the user explicitly asks to retain it and the source is sharp enough to prove that it is authored design texture. Never recreate fabric weave, camera grain, JPEG/PNG artifacts, blur, sharpening halos, lighting, shadows, dithering, or accidental gradients from a low-quality source.

## Inputs and scope

- Treat the supplied image as a reference or edit target, and inspect it before generating. Identify the printed artwork separately from the garment, model, seams, lighting, shadows, background, watermarks, and page UI.
- Apply a source-quality gate before generation. If the image is low-resolution, blurred, compressed, or its apparent texture cannot be separated confidently from the print design, use flat-reconstruction mode: keep only clearly supported shapes, edges, layout, and palette; discard uncertain texture.
- Before making an exact reproduction of a public design, logo, character, or other third-party artwork, obtain a brief confirmation that the user has the right to reproduce it for print. Do not use this workflow to remove a watermark or ownership notice.
- Remove all text and logos from the recreated artwork by default: brand or sponsor names, taglines, player names and numbers, crests, badges, marks, and word-based graphics. Preserve them only when the user explicitly asks to retain a named element. When removing an element, rebuild the underlying pattern or leave intentional clear space; never leave a blurred, erased-looking patch. A source watermark remains excluded from the newly recreated artwork, but must never be erased from the source image itself.
- For a multi-side garment reference, evaluate each side after those default removals. Do not create a delivery panel for a side that is only one uniform base colour with no remaining visual pattern or graphic; report the base colour instead. Create only the sides that still have print artwork.
- Separate authored geometry from accidental surface texture before recreating the design. Dot bands, grids, line lattices, stripes, repeats, and hard-edged gradients are construction-critical geometry, not decorative noise. For these elements, read [the geometric-pattern reference](references/geometric-patterns.md) and rebuild them deterministically. Do not reproduce soft photo gradients or uncertain tonal noise; in flat-reconstruction mode, use solid fills.
- Ask for the final print width/height, printing process, background, and delivery format only when those details materially affect the result. If they are absent, preserve the artwork aspect ratio, use a transparent PNG when the artwork does not have its own background, target 300 PPI, and state the assumed physical size before handoff. PNG is the default; produce TIFF when the user or print vendor requests it.
- The source controls the non-text visual design. Do not add slogans, logos, decorative elements, garment contours, background scenes, or stylistic changes unless the user requests them.

## Recreate the artwork

Use `$imagegen` in built-in edit mode by default. Load a local source image into the conversation first when needed. Prompt for the **artwork only**, with the reference image explicitly labelled as the source design.

Choose the least destructive path:

- For a clean original artwork file, retain the source composition and use deterministic enlargement where possible. Remove text and logos unless the user has explicitly asked to retain them.
- For an artwork embedded in a garment or screenshot, recreate the printed graphic on a flat canvas. Lock its supported palette, geometry, and placement while removing text, logos, the garment, folds, lighting, model, frame, UI, and unrelated background. Do not copy source-photo texture by default.
- For photographic or painterly designs, preserve meaningful grain or texture only when the user explicitly requests it or it is unambiguously authored and sufficiently resolved. Otherwise simplify to clean shapes and supported colours; do not let a poor reference force a noisy or overworked result.
- For artwork that combines irregular visual elements with regular geometry, use image generation only for the irregular base, composition, or colour reference. Build repeated dots, grids, stripes, and other construction-critical geometry as clean procedural/vector layers, then rasterize and composite them into the delivery artwork. Do not ask the image model to approximate those regular primitives as texture.

Use a focused spec such as:

```text
Use case: precise-object-edit
Asset type: standalone raster artwork for physical apparel printing
Input image: supplied image is the source design; use only the printed artwork as reference
Primary request: recreate the design as a flat, high-resolution print file at the same composition and proportions
Background: transparent [or exact solid/full-bleed background requested]
Surface treatment: flat solid fills by default; ignore fabric weave, grain, blur, compression, dithering, lighting, shadows, and unrequested gradients
Constraints: artwork only; preserve the design's supported colors and layout; no text, lettering, player name or number, logo, crest, badge, sponsor mark, garment, model, seams, hanger, shadows, photo background, web UI, watermark, border, or extra artwork
```

## Low-quality references and texture rejection

When the source is visibly soft, noisy, compressed, or shown on a photographed garment, simplify rather than hallucinate detail:

1. Establish the smallest defensible palette from the source. If it visually contains only a few colours, name them explicitly; if it appears to contain three colours, use exactly three flat colours.
2. Tell image generation to discard all source texture and use crisp flat fills. Do not describe the output as fabric-like, tactile, grainy, distressed, shaded, or painterly unless the user requested that treatment.
3. Treat the generated image as provisional. Inspect the actual raster for unintended texture, tonal drift, gradients, or extra colours. Prompt wording alone is not evidence that the output is texture-free.
4. Before final export, enforce a discrete palette when flat mode or a limited palette was requested. Use `scripts/limit_palette_png.py` after print sizing, then verify that opaque pixels contain only the requested palette. This is a cleanup step, not a substitute for reconstructing the composition.

Only retain texture when it passes both tests: the user asked for it (or clearly approved it), and the source resolution makes it distinguishable from capture/compression artifacts. Otherwise remove it, even if the source visibly contains it.

For fine line art or symmetrical patterns, compare the output closely with the reference at 100% and 200%. If any retained text, badge, or logo is print-critical but cannot be reproduced reliably, say so plainly and request the original asset, a clearer close-up, or the exact text. Do not claim that an AI reconstruction is an exact vector-equivalent master.

For regular geometry, add explicit construction requirements to the prompt and working plan: identify the primitive, repetition direction, spacing, size progression, palette, clip region, and any intentional gradient. Never describe a dot field or triangular lattice merely as “texture.” If flat mode is active, gradients are not allowed unless the user explicitly requests one.

Make one initial version and, at most, two targeted correction attempts. Each correction changes only the identified discrepancy. Stop instead of silently drifting from the reference. If the only discrepancy is unwanted texture or extra tonal variation, flatten or palette-limit the raster; do not regenerate a more detailed texture.

## Prepare the delivery file

Read [the print-output reference](references/print-output.md) before calculating final dimensions or exporting. It explains the pixel-size calculation, background choice, and file checks.

Use `scripts/prepare_print_png.py` for the default non-destructive PNG delivery at the requested physical dimensions and PPI. When TIFF is requested, use `scripts/prepare_print_tiff.py` instead; it embeds an existing source profile or a standard sRGB profile and uses lossless LZW compression. Both helpers set the target canvas, preserve alpha when present, and record PPI metadata; they do not invent missing detail. Prefer `contain` for isolated artwork and `cover` only for deliberate full-bleed art. When flat mode or a limited palette is requested, run `scripts/limit_palette_png.py` after resizing and before verification.

```bash
python3 scripts/prepare_print_png.py artwork-selected.png artwork-print.png \
  --width-mm 300 --height-mm 400 --ppi 300 --fit contain
```

For TIFF requested by the user or printer:

```bash
python3 scripts/prepare_print_tiff.py artwork-selected.png artwork-print.tiff \
  --width-mm 300 --height-mm 400 --ppi 300 --fit contain
```

Never stretch the composition. Do not place a generic white or colored rectangle behind artwork intended to be transparent. Do not add bleed, cut lines, CMYK conversion, or a printer ICC profile unless the user or print vendor specifies them.

## Verification and handoff

Before handing off, inspect the final delivery file and check:

- it contains only the requested artwork, with no mockup or accidental reference-photo elements;
- it has no text, lettering, number, logo, crest, badge, or sponsor mark unless the user explicitly retained that specific element;
- it has the intended background treatment, including real alpha when transparency was requested;
- its pixel dimensions meet the physical-size/PPI calculation and its aspect ratio is not distorted;
- text, fine details, edges, and repeated pattern alignment remain print-usable; and
- regular geometric elements pass the relevant 100% and 200% checks in [the geometric-pattern reference](references/geometric-patterns.md); and
- the final is a lossless PNG by default, or TIFF when specifically requested; never substitute a lossy web export.

Report the saved file path, format, pixel dimensions, physical dimensions, PPI, background mode, and any fidelity issue that still needs the user's approval. For every skipped one-colour side, report its base colour and state that no artwork file was created. Explain that PPI metadata and resampling make the file print-sized, but cannot restore detail absent from the source; printer color should be proofed against that printer's profile before a production run.
