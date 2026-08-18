# Quality Gates

A hard-gate failure rejects the proof or final image.

## Design Fidelity

- Match shirt color, collar, sleeve length, panels, trims, hems, and fit.
- Match artwork/logo/text placement, orientation, scale, and count.
- Keep front/back design assignments correct.
- Reject random text, mirrored text, invented marks, unrelated brands, vendor watermarks, and changed garment construction.
- Keep the same garment design across all wearers unless the brief assigns variants.

## People And Scene

- Require believable Vietnamese/Southeast Asian people with distinct faces.
- Reject waxy skin, cloned identities, malformed hands, extra/fused fingers, distorted limbs, floating feet, and impossible overlaps.
- Ground everyone in one coherent scene with consistent light direction and contact shadows.
- Keep picnic/team-building props secondary and brand-free.

## Fabric And Print

- Require tactile cotton jersey or performance-knit fabric, unless the input clearly shows another material.
- Show seams, sleeve edges, collar thickness, hem, gravity wrinkles, and natural fit variation.
- Make print follow folds, torso curvature, lighting, and occlusion.
- Reject plastic shine, pasted-on graphics, melting artwork, or flat vector fabric.

## Commerce Composition

- Shirt design must be the first read.
- Prefer 3-5 people for complex shirts; accept 6-8 only if the product remains clear.
- Reject awkward crops through joints, excessive empty lawn, clutter, or props covering torso design.
- Keep all generated text/UI out of the clean photo before deterministic overlay.

## Branding And Features

- Use exactly one bundled `mayaodongphuc-vertical.png` logo.
- Pin the logo to a top corner; keep it crisp, undistorted, and fully visible.
- Use 3-4 concise feature callouts with one coherent alignment system.
- Keep feature overlays readable but secondary to the garment.
- Reject overlays covering faces, hands, collars, main artwork, or important product detail.
- The default hotline is exactly `0989 353 247`; use `--skip-hotline` if not wanted.

## Acceptance Score

After hard gates pass, score each 0-2:

- Design fidelity
- People/anatomy
- Fabric/print realism
- Outdoor scene coherence
- Commerce/readability

Accept only 9/10 or 10/10.
