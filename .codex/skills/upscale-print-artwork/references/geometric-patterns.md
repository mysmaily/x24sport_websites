# Precision geometric patterns

Read this reference when the source artwork contains any repeated dot field, grid, lattice, stripe, tiling, hard-edged gradient, or other visibly regular geometry. Treat the garment image only as a measurement and composition reference. The final delivery is still raster artwork, but its regular geometry must be constructed deterministically rather than synthesized as an AI texture.

## Analyse before drawing

Identify each construction-critical layer separately from garment lighting, textile texture, folds, and compression artifacts:

- primitive: circle, equilateral triangle, line, polygon, or another exact shape;
- layout: parallel rows, staggered rows, grid, radial field, or a clipped band;
- geometry: radius or side length, centre spacing, row offset, angle, and taper;
- colour: solid fill, opacity fade, or intentional linear/radial gradient; and
- boundary: the mask or hard edge that clips the pattern.

Use the source to preserve those decisions. Do not infer random distress, blur, or pixel noise where the reference shows regular construction.

## Deterministic construction

Use a procedural image routine, SVG, or another exact shape renderer as an intermediate layer. Rasterize it at the target delivery dimensions before compositing; do not hand off the intermediate vector file unless the user requests it.

Keep each regular pattern as its own layer so that an exact primitive can be corrected without regenerating the whole artwork. Apply gradients through fills, opacity, or masks, not noise filters.

### Repeated circular dots

- Every dot is a closed, filled circle with a single defined centre and radius. Do not accept diamonds, blobs, faceted discs, uneven outlines, or AI-generated stipple.
- Place centres on the measured row/grid system. For a staggered field, alternate the offset consistently; for a taper, vary only the source-observed radius, spacing, opacity, or clip mask.
- Preserve intentional changes in dot scale or density along the field, but make each individual dot geometrically circular.
- Use a flat dark-green fill when the reference calls for it. Softness may come from a deliberate opacity gradient, never from random edge blur.

### Triangular lattices and gradients

- Build the lattice from exact connected equilateral triangles, or from the documented non-equilateral geometry in the source. Shared edges must coincide exactly and repeat with consistent spacing.
- Render straight, clean edges and vertices. Do not introduce wobbles, broken joins, random cell sizes, mottling, or faux fabric noise.
- When the lattice transitions in intensity, use a controlled colour or opacity gradient clipped to the triangular layer or its mask. The gradient may fade through the grid, but the triangles themselves remain clean and recognisable.
- Preserve intentionally incomplete cells only where the source mask clips them. Do not scatter missing triangles to imitate texture.

## Prompt and verification

State the construction rule explicitly whenever image generation is used for the surrounding composition. For example:

```text
Construction-critical geometry: a diagonal band of exact dark forest-green circular dots on a measured staggered grid; every dot is a perfect filled circle, with no diamonds, blobs, texture, or blur. Beneath it, a clean equilateral-triangle lattice with a controlled pale-green opacity gradient; straight shared edges, exact vertices, no noise, no distressed texture, and no random missing cells.
```

At 100% and 200%, inspect the final raster:

- dots remain circular and follow the intended grid or stagger;
- triangle edges meet at clean vertices with no cracks, overlaps, or irregular cells;
- gradients are smooth and controlled, while primitives stay crisp; and
- clips, diagonals, and repeated spacing match the source composition.

If the source is too low-resolution to determine a primitive, request a clearer close-up or state the constructed assumption. Do not conceal uncertainty with a noisy approximation.
