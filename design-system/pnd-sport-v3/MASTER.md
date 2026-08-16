# PND Sport V3: Precision Performance

Source: `design-taste-frontend` redesign-preserve workflow.

Design Read: sports-commerce redesign for Vietnamese team buyers, using a
premium-performance language with a native CSS system and restrained motion.

## Dials

- `DESIGN_VARIANCE: 6`
- `MOTION_INTENSITY: 3`
- `VISUAL_DENSITY: 8`

## Direction

Cool monochrome retail interface with PND orange as the only accent. Real
photography carries the brand expression. Product grids use sparse dividers
instead of repeated floating cards.

- Light surface: `#f1f2f3` and `#fafafa`
- Dark surface: `#15171a` and `#1c1f23`
- Accent: PND orange `#e94b1b`
- Type: existing Vietnamese-capable sans stack, tighter weight hierarchy
- Surfaces: 14px radius; controls: 8-10px radius
- Theme: one coherent light system with a token-driven system-dark equivalent

## Preservation audit

- IA and SEO routes remain unchanged
- Navigation labels and conversion intent remain unchanged
- Existing catalog photography remains authoritative
- New V3 hero is a brand-safe, unbranded Vietnamese team campaign image
- Focus, skip link, breadcrumbs, touch sizing and reduced-motion remain intact

## Pre-flight constraints

- No em dash in visible V3 content
- One orange accent and no section-level theme inversion
- Hero has four text elements maximum and CTA remains above the fold
- Section eyebrow labels are hidden except where hierarchy genuinely needs them
- Product image labels are removed in V3
- No scroll listener, GSAP, custom cursor or unnecessary motion dependency
