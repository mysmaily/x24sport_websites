# PND Sport Việt Nam — Compact Sports Commerce

> UI/UX Pro Max was used for product, style, UX and Next.js guidance. Its
> Aurora/blue-purple generated palette was rejected because it conflicts with
> PND's supplied identity and the sports-commerce brief.

## Direction

PND is a modern Vietnamese sportswear storefront: energetic, credible and easy
to shop. The interface should feel familiar enough for immediate browsing while
remaining distinct through disciplined orange branding, clean typography,
compact density and photography—not a decorative visual concept.

Design dials: variance 4/10, motion 2/10, density 9/10.

## Tokens

| Role | Value |
|---|---|
| PND orange / primary CTA | `#f4511e` |
| Orange hover | `#d93d0d` |
| Primary ink | `#171717` |
| Dark surface | `#252525` |
| Page background | `#f5f5f3` |
| Card surface | `#ffffff` |
| Border | `#e5e5e2` |
| Muted text | `#686868` |

- Type scale: 10 / 12 / 14 / 16 / 18 / 22 / 28 / 34 / 40 / 52px.
- Product names stay 18px desktop and 16px mobile; product-detail H1 is 22/20px.
- Corners: 5–10px according to component size; no pill soup.
- Shadows: only subtle elevation (`0 10px 28px rgba(0,0,0,.08)`) on hover.
- Spacing: 4 / 8 / 12 / 16 / 20 / 28 / 36 / 48px. Ordinary padding ≤22px.

## Page system

- Compact dark utility strip, clean white header, accessible search and one
  orange quote CTA.
- Hero uses a dark editorial split with real sports imagery; no giant type.
- Categories are image-led; product cards prioritize image, name and starting
  price without technical decorations.
- Catalog uses a quiet sidebar, horizontal primary filters and dense product
  grid. First row must remain inside the initial viewport.
- Product detail is a clean two-column commerce layout with clear quote/design
  actions, restrained specs and related products.
- Blog/article uses readable editorial measure. SEO landing uses ordinary content
  surfaces, FAQ and product links rather than visually artificial keyword blocks.

## Interaction and accessibility

- All mobile targets are at least 44×44px and separated sufficiently.
- Visible orange-tinted focus ring; keyboard order follows document order.
- Interaction motion is 150–250ms and limited to opacity, color and transform.
- Preserve skip link, breadcrumbs, semantic headings and descriptive image alts.
- Respect `prefers-reduced-motion`; do not rely on color alone.
- No horizontal page overflow at 375, 768, 1024 or 1440 widths.

## Explicit avoid list

- Brutalism, Windows-98 chrome, hard offset shadows, thick black borders.
- Pattern-paper dots, specimen numbers, blueprint panels, neon lime.
- Gradients as a style, glassmorphism, clip-path card corners or decorative grids.
- Oversized whitespace, 100px display type, `p-6` or larger Tailwind utilities.
- Fake reviews, fake production claims or unverified business facts.
