# MayAoBongRo.vn — Design System

## Direction

- Product: custom basketball uniform ecommerce and lead generation.
- Family resemblance: use the same clean sports-storefront language as MayAoPickleball.vn—compact sticky navigation, image-led hero, clear CTA hierarchy, trust strip, practical product cards, dark process section, and persistent mobile contact actions.
- Basketball identity: energetic orange-red, deep navy/black, bright white surfaces, court imagery, and Barlow Condensed display typography.
- Tone: athletic, direct, trustworthy, and useful. Avoid generic SaaS cards, beige editorial styling, oversized decorative type, unverifiable claims, and ornamental animation.
- Density: compact mode is the website default. Prioritize products and actions above decorative whitespace; every gap must separate hierarchy or improve scanning.

## Tokens

| Role | Value |
|---|---|
| Brand / primary action | `#D1432D` (4.61:1 against white) |
| Brand hover | `#BF321F` |
| Primary ink | `#10131A` |
| Secondary text | `#647084` |
| Page surface | `#F6F7F5` |
| Card surface | `#FFFFFF` |
| Border | `#DCE1E6` |
| Heading font | Barlow Condensed, 600–700 |
| Body font | Be Vietnam Pro, 400–700 |
| Small radius | 8px |
| Card radius | 16px |
| Feature radius | 24px |
| Container | max 1360px, responsive 16/24/32px gutters |
| Section spacing | 32–56px desktop, 24–40px mobile |
| Tight section spacing | 24–40px desktop, 20–32px mobile |
| Content block gap | 16–24px |

## Component Rules

- Header: one row, 72px minimum height, task-focused navigation, phone and consultation CTA; mobile menu must expose `aria-expanded` and preserve 44px targets.
- Hero: reuse the legacy responsive banner media. Keep one visible headline, a short factual description, one primary CTA, one secondary CTA, and explicit carousel controls.
- Owner preference: on pricing, quote, catalog, product, and other intent-heavy pages, never let a banner or hero delay the actual thing the visitor came to see. The first viewport must reveal the primary content (price table, products, order form, or product facts) enough that shoppers understand the page is useful and continue scrolling. Keep hero copy compact, practical, and subordinate to the task.
- Buttons: one primary action per section. Primary uses brand fill and white text; secondary uses a high-contrast border or neutral dark fill.
- Product cards: 4:5 reserved media, real product title, factual customization note, and a clear detail link. Do not invent price, rating, stock, or delivery claims.
- Sections: use a compact 32–56px vertical rhythm and 16–24px internal block gaps. Use the tighter end of the scale for catalog, search, utility, and text-heavy screens. Larger gaps require a clear content or interaction reason.
- Page intros: breadcrumb, kicker, heading, description, and primary control should normally fit within the first viewport together. Default to 24–40px top/bottom padding; never create near-empty hero space on utility or catalog pages.
- Typography: body copy is 14–16px; secondary/meta text is 12–14px; display headings normally cap near 52px. Reserve larger type for a campaign hero with supporting imagery, not catalog or service utility pages.
- Search and filters: controls may be visually compact but interactive targets remain at least 44px high. Keep catalog search to the useful content width rather than stretching it decoratively across the viewport.
- Chips: use short labels, 44px targets, 8px gaps, visible selected/focus states, and real links for shareable catalog searches.
- Footer: brand CTA band followed by a dark information footer; persistent call/Zalo bar on mobile only.

## Accessibility and Responsive Gates

- Text contrast at least WCAG AA; focus rings remain visible.
- Touch targets at least 44×44px with 8px separation.
- One `h1` per rendered page and sequential section headings.
- Informative images require contextual alt text; decorative icons use `aria-hidden`.
- No horizontal overflow at 375, 768, 1024, and 1440px.
- Respect `prefers-reduced-motion`; carousel remains manually operable without autoplay.
- Mobile and desktop retain the same primary content and actions.

## Motion

- 150–250ms state transitions only for hover, focus, and menu feedback.
- Carousel interval: 6.5 seconds, paused on hover/focus and disabled for reduced motion.
- Do not hide primary content behind scroll-reveal animations.
