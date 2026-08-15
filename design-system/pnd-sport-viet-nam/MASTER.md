# PND Sport Việt Nam — Pattern Room System

> Source: UI/UX Pro Max synthesis, adapted to the supplied PND orange identity.
> The generated green/event defaults were rejected as brand-incompatible.

## Direction

PND should feel like a sportswear design room: technical, editorial, tactile and
precise. The interface borrows from garment pattern sheets, cutting tables,
measurement notation and specimen catalogs—not generic dark sports landing
pages. Preserve the approved information architecture and conversion flow.

Design dials: variance 9/10, motion 4/10, density 9/10.

## Tokens

| Role | Value |
|---|---|
| Ink | `#11100e` |
| Pattern paper | `#f2ead9` |
| Sheet | `#fffdf7` |
| PND orange | `#f4511e` |
| Blueprint | `#173f5f` |
| Measurement lime | `#d7f344` |
| Rule line | `#1b1a17` |
| Muted ink | `#615f58` |

- Display: Barlow Condensed, uppercase only for short labels/headlines.
- Body: Be Vietnam Pro, 16px on mobile, 14–16px desktop.
- Prices and specimen numbers use tabular figures.
- Corners: 0px. No gradient cards, glass, soft floating shadows or pill soup.
- Depth comes from hard `3px 3px 0` ink shadows and deliberate overlaps.
- Spacing: 4 / 8 / 12 / 16 / 24 / 32px. Ordinary component padding ≤20px.

## Signature devices

1. Pattern-paper dot grid and ruled measurement lines.
2. Specimen numbers (`PND / 01`, `CAT.02`) occupying a stable vertical rail.
3. Clipped garment-card corner and registration cross marks.
4. Blueprint panels for technical information; lime is annotation only.
5. Alternating sheet/ink/blue sections instead of repeated white card grids.
6. One primary orange CTA per screen; secondary CTA is ink-outline.

## Page behavior

- Header resembles a compact production ticket: wordmark, search, quote action.
- Homepage hero is a two-sheet composition, not a centered banner.
- Category cards form an asymmetric catalog index.
- Product cards are specimen sheets with border rules and bottom metadata band.
- Product detail resembles a technical product dossier.
- Blog archive is a numbered editorial index; article uses readable measure.
- SEO landing combines a brief, recommended products and FAQ without becoming
  a wall of text.

## Interaction and accessibility

- All actionable targets are at least 44×44px on touch layouts.
- Visible `:focus-visible` ring: 3px measurement lime with 2px ink offset.
- Hover/press uses color inversion or hard-shadow compression within 180–220ms;
  never shift surrounding layout.
- Keep skip link, semantic headings, breadcrumbs and descriptive image alts.
- Respect `prefers-reduced-motion` and never rely on color alone.
- No horizontal page overflow at 375, 390, 768, 1024 or 1440 widths.

## Explicit avoid list

- Generic black/orange gym theme; neon gaming glow; glassmorphism.
- Rounded cards, large whitespace, giant hero type, marketing-stat claims.
- Decorative parallax or GSAP dependency for this prototype.
- `p-6` or larger Tailwind utilities; 100px type; fake customer proof.
