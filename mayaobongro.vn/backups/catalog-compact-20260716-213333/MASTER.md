# MayAoBongRo.vn — Design System

## Direction

- Product: custom basketball uniform ecommerce and lead generation.
- Family resemblance: use the same clean sports-storefront language as MayAoPickleball.vn—compact sticky navigation, image-led hero, clear CTA hierarchy, trust strip, practical product cards, dark process section, and persistent mobile contact actions.
- Basketball identity: energetic orange-red, deep navy/black, bright white surfaces, court imagery, and Barlow Condensed display typography.
- Tone: athletic, direct, trustworthy, and useful. Avoid generic SaaS cards, beige editorial styling, oversized decorative type, unverifiable claims, and ornamental animation.

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

## Component Rules

- Header: one row, 72px minimum height, task-focused navigation, phone and consultation CTA; mobile menu must expose `aria-expanded` and preserve 44px targets.
- Hero: reuse the legacy responsive banner media. Keep one visible headline, a short factual description, one primary CTA, one secondary CTA, and explicit carousel controls.
- Buttons: one primary action per section. Primary uses brand fill and white text; secondary uses a high-contrast border or neutral dark fill.
- Product cards: 4:5 reserved media, real product title, factual customization note, and a clear detail link. Do not invent price, rating, stock, or delivery claims.
- Sections: use 64–88px vertical rhythm, clear headings, and controlled line length. Avoid nested card-on-card decoration.
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
