# Layout presets — v3

The catalog should feel art-directed, not templated. Randomize among these presets with anti-repeat. The random choice changes composition only; garment fidelity, typography quality, brand identity, and information hierarchy never become random.

## A. single-hero — weight 45
One coherent outdoor scene. 3–5 models, shirt-first framing. Keep one quiet edge for a light translucent feature treatment. Use this when the garment itself is visually busy or fidelity is difficult.

## B. campaign-composite-3 — weight 35
Preferred premium editorial poster option. One canvas contains three views from the same campaign:
- hero scene: about 62–68% of the visual area, 3–5 people, strongest product view;
- bonding/detail scene: about 16–20%, same garment and visual world;
- walking/activity scene: about 16–20%, same garment and visual world.

The three scenes must feel like frames from one professional photoshoot: same location family, daylight, color grade, wardrobe, garment design, and casting direction. Do not create three unrelated stock-photo tiles. Rounded or clean separators are acceptable; avoid thick borders and scrapbook collage effects.

When the board will receive a bottom feature band, reserve the lower 10–12% of the canvas as a footer-safe lane during generation. The two supporting scenes should sit fully above that lane, or have enough internal bottom padding that the band covers only noncritical empty ground/table texture. Reject composites where the footer band covers the supporting scenes' faces, collars, chest crests, sleeve cuffs, important torso design, or the main action. If needed, move the two supporting frames upward and slightly reduce their height so they read as complete photos above the footer.

When the back is commercially useful, include one natural back-facing wearer in the hero so the designed shirt slogan can be seen. Do not force every wearer to display readable text.

## C. front-back-showcase — weight 20
One coherent scene emphasizing product comparison. Show multiple front views plus one or two natural back/three-quarter views. Best for garments with important back artwork or a slogan. Keep the composition photographic, not a mannequin lineup.

## Campaign information system
For `campaign-composite-3`, prefer the information architecture used by a professional sportswear campaign poster:

1. **Editorial slogan zone** — a generous translucent/gradient field on a quiet edge, usually left or right. It may occupy roughly 20–30% of width where the generated composition deliberately leaves breathing room. It should inherit the garment's dominant/accent color rather than default orange/navy.
2. **Feature stack** — four features may sit vertically inside that field with generous spacing, small consistent outline icons, bold title + smaller supporting line. Do not put each feature in a separate heavy box.
3. **Bottom feature band** — production default. Use one continuous translucent band tinted from the garment palette, normally 10% of the shorter image edge. Divide it with subtle separators; do not use four disconnected dark cards or place text directly on busy photo detail.
4. **Slogan** — may be displayed editorially in the information field in addition to being designed onto a back shirt. Treat it as campaign typography: 2–3 lines, strong hierarchy, optical alignment, optional restrained vector sweep/stripe derived from the garment artwork.
5. **Logo** — one crisp bundled Mayaodongphuc logo in the upper corner. Never AI-redraw it when deterministic placement is possible.
6. **Hotline** — one phone icon + exact `0989 353 247`, subordinate to the features. Website may be included only when the workflow explicitly asks for it.

### Visual treatment
- Use a translucent wash, frosted/soft gradient, or transparent color field derived from the shirt/accent color.
- Typical opacity: visually around 55–82% for light fields and 45–72% for dark/tinted bands; preserve enough of the photo to feel integrated.
- Prefer one large coherent surface over many little cards.
- Use whitespace aggressively. The overlay is allowed to occupy real canvas area when the composition was planned for it.
- Match accent lines, icons, separators, and headline color to the garment palette.
- Avoid generic dashboard UI, pill badges, glassmorphism clutter, equal little cards, random orange accents, thick borders, or floating labels.
- Information should read in this order: garment/team → slogan → feature titles → feature details → hotline.

## Production bottom band

Use `scripts/apply_catalog_overlay.py --layout bottom-band` only when the composition does not already provide a usable editorial field. The bottom band is deterministic and intentionally simple:

- height: default `0.10` of the shorter image edge;
- surface: one full-width translucent color layer, no individual cards;
- default color: burgundy `#740e26`, or another dominant/accent garment color supplied by the design lock;
- text: white title/detail copy, orange outline icons, subtle vertical separators;
- placement: lower 10% only, on a reserved footer-safe lane, never across faces, collars, chest graphics, sleeve/cuff artwork, back slogan artwork, hands, or the important part of a supporting scene;
- hotline: exact `0989 353 247`, with one phone icon and no second number.

For catalog boards with multiple subframes, the bottom band is a designed label/footer area below the photo story, not a tinted overlay that submerges the lower frames. If the lower frames look hidden, generate a revised board composition with those frames moved upward before applying the deterministic band.

## Default deliverable set

For website/product work, keep the image roles separate by default:

- `clean-gallery-1`: standalone lifestyle or hero product image, no feature/hotline footer;
- `clean-gallery-2`: standalone variation/detail/context/front-back image, no feature/hotline footer;
- `catalog-board`: composite or campaign image with one bundled logo, four supported features, and hotline.

Only the `catalog-board` should receive the full information system unless the user explicitly asks for every image to be branded. This keeps the product gallery visually useful while still producing one sales-ready catalog image.

## Production editorial feature panel

When the generated campaign board leaves a large white or quiet editorial field, that field must earn its space. Put the slogan, four product features, and hotline there, then omit the bottom feature band. This is the preferred fix for a large blank left/right panel.

- Keep the panel unframed or use only a barely visible wash; avoid a card pasted onto a card.
- Use a real type hierarchy: logo, large slogan, support line, feature stack, hotline.
- Keep features compact and useful; do not repeat the same information in a footer.
- Validate with `scripts/validate_catalog_composition.py --require-left-panel-features --forbid-footer-band`.
- Reject layouts where more than half of the editorial field below the slogan remains visually empty.

## Composition-first rule
Never generate a normal centered group photo and then discover there is nowhere to place a large campaign panel. When a campaign preset is selected, plan the photo for the layout before generation: leave intentional negative space and place the group so the information field looks designed into the campaign rather than pasted over people afterward.
