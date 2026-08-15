# Discovery and Design Reference

## Current-state audit

For an incomplete tenant, gather evidence before proposing change:

| Surface | Inspect | Record |
|---|---|---|
| Brand | logo, colors, fonts, imagery, voice | usable, inconsistent, missing |
| Experience | home, catalog, detail, content, conversion | routes, broken states, gaps |
| Responsive | 390x844 and 1440x900 minimum | viewport-specific defects |
| CMS | tenant, settings, categories, products, media, pages, posts | counts, drafts, ownership, quality |
| Search/SEO | status, metadata, canonical, headings, links, JSON-LD, sitemap, robots | pass/fail and evidence |
| Quality | keyboard, contrast, errors, console, performance risks | severity and affected journey |
| Operations | profile, credentials provisioned, DNS/proxy, health, analytics | ready, missing, unauthorized |

Do not confuse record count with content quality. Sample enough records to find
systemic problems, then enumerate the complete affected set before mutation.

## High-value discovery questions

Ask only questions that change strategy or require unavailable facts:

1. What does this tenant sell, to whom, and in what geography?
2. What is the one primary action a qualified visitor should take?
3. Which purchase decisions require consultation, customization, sizing, design,
   quantity, fabric, delivery, or price guidance?
4. What should the brand feel like? Request two or three references and ask what
   the user likes about each, not merely which site to copy.
5. Which brand assets and factual materials are authoritative?
6. Which product families and distinctions matter to buyers?
7. Which operational claims, policies, contact channels, and analytics IDs are
   verified and ready to publish?

Offer a recommendation based on the business model. Include an “avoid” list to
make taste constraints operational.

## Design-direction artifact

For each direction, show or specify:

- a short concept name and one-sentence strategic idea;
- font roles and fallback behavior;
- primary, accent, neutral, surface, text, and semantic colors with contrast;
- density, grid, radius, border, shadow, and image treatment;
- header, hero, category card, product card, detail page, trust, CTA, and footer;
- motion character and reduced-motion behavior;
- mobile adaptation, not merely desktop scaling;
- advantages, risks, and fit with target buyers.

Alternatives must represent different systems. Recommend one; do not make the
user compare an unranked mood-board dump.

## Demo fidelity

Use real or clearly labeled representative content. A demo must be detailed
enough to evaluate hierarchy, density, navigation, product discovery, imagery,
content length, and conversion—not just colors above the fold.

At minimum capture:

- homepage at 390x844 and 1440x900;
- category state with filters and the first product row visible;
- product/detail state with media, decision information, and CTA;
- open navigation/filter/form state where interaction matters.

Review the demo for business fit, not only visual polish. Record every approved
revision as an observable change.
