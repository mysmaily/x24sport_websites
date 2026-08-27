# Print-output specification

## Decide the print canvas

The final raster needs enough pixels for the *physical area that will be printed*. Calculate each edge independently:

```text
pixels = millimetres / 25.4 × target PPI
```

Use 300 PPI as the normal default for apparel artwork when the printer has not specified otherwise. Do not confuse printer hardware DPI with artwork PPI. A printer may advertise 1,200+ DPI while still accepting a 300-PPI artwork file.

Common canvases at 300 PPI:

| Physical size | Required pixels |
| --- | --- |
| 300 × 400 mm | 3543 × 4724 px |
| 350 × 450 mm | 4134 × 5315 px |
| 400 × 500 mm | 4724 × 5906 px |
| 1000 × 1000 mm | 11811 × 11811 px |

Preserve the artwork's aspect ratio. For an isolated, non-rectangular artwork, set the canvas to the requested maximum print area and leave unused area transparent. For full-bleed artwork, use the exact final trim dimensions and `cover` only if the user approves the crop.

## Background, colour and format

- Use a transparent PNG for DTF, DTG, heat transfer, or screen-print artwork that should appear only where ink is present. TIFF may preserve alpha, but use it only when the printer confirms alpha-bearing TIFF is appropriate.
- Keep a deliberately designed background for a rectangular, full-bleed artwork. Never flatten transparent artwork against white simply because the preview uses a white checkerboard.
- Deliver a lossless PNG by default. If the user or printer requests TIFF, deliver a lossless LZW-compressed TIFF with the intended PPI and an embedded sRGB profile unless the source carries a different required profile. JPEG and WebP are not final print masters.
- Keep the artwork in sRGB unless the printer supplies a required ICC profile or conversion instructions. A guessed CMYK conversion can change brand colors and dark tones.

## Quality gate

The PPI field alone does not add sharpness. It only says how densely the existing pixels should be placed on paper or fabric. The artwork must therefore be visually checked at its actual size, especially:

- readable text and logos;
- thin lines, distressed texture and small gaps;
- clean transparent edge pixels without a white or dark halo; and
- color accuracy through a sample/proof from the production printer.

An AI-created print file can be fit for production after this proof, but it is not an editable vector master. If a logo, exact typeface, code, fine repeat, or legal mark must be exact, obtain that source asset rather than relying on an AI reconstruction.
