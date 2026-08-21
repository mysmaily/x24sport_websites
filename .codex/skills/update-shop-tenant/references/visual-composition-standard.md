# X24 tenant visual composition standard

Use this standard for material customer-facing UI work across X24 tenant
websites. Adapt colors, typefaces, imagery, and copy to the target brand; keep
the composition principles unless the user explicitly approves another
direction.

## Desired character

The storefront should feel complete, commercial, and deliberately art-directed
at first sight. It should be compact enough to scan, but never look like text and
tiny icons were dropped onto a large empty canvas. Product imagery, lifestyle
media, useful iconography, grouping, background treatment, proof, and actions
should work together as one composition.

## Composition rules

- Build every ordinary section around a clear visual unit: media plus content,
  a compact card group, a diagram/process, a proof strip, or a conversion panel.
  A heading and paragraph alone do not justify a tall section.
- If copy is short, reduce the container and card dimensions. Do not stretch
  sparse content to fill the available width or height.
- Prefer compact, balanced card grids. For four short items, test four small
  cards across on wide layouts and a `2 × 2` grid on mobile. Use another layout
  only when copy length or hierarchy genuinely requires it.
- Low-copy cards should be close to square or use a restrained landscape ratio,
  with content vertically centered. Avoid long shallow strips and large square
  cards with most of their surface empty.
- Give cards and composed sections intentional corner treatment. A useful
  default range is `12–18px` for cards and `18–24px` for major panels; adjust to
  the brand system rather than mixing arbitrary radii.
- Use a distinct, semantically relevant icon for each short item when suitable.
  Put icons in a consistent tile or visual anchor. Avoid repeating generic
  checkmarks when more descriptive icons are available.
- Do not use decorative `01 / 02 / 03 / 04` labels to create sophistication.
  Numbers belong only where order, quantity, progress, SKU, price, or another
  real data meaning matters. For non-sequential section labels, use an icon and
  concise shopper-facing label.
- Slightly increase short-card title and body sizes when the card has little
  copy, while retaining clear hierarchy and Vietnamese readability. Do not use
  tiny text merely to create more empty space.
- Use relevant background imagery, product details, fabric/workshop context, or
  lifestyle photography to carry low-copy sections. Apply overlays only to
  preserve contrast and image meaning; do not obscure the product or people.
- Use tonal surfaces, borders, and shadows to establish grouping. Decorative
  shapes or gradients alone do not count as useful visual density.
- Each major homepage composition should contribute at least one of: product
  discovery, selection guidance, process clarity, trust/proof, or conversion.
  Remove decorative sections that do none of these.

## Responsive behavior

- Design the composition at wide desktop, intermediate/tablet width, and
  `390 × 844`; do not assume desktop and mobile checks cover the middle.
- Preserve media and visual hierarchy on mobile through intentional crop,
  stacking, or reordering. Do not delete the visual layer and leave a tall
  text-only block.
- Repeated short cards should usually become `2 × 2` on standard mobile widths;
  switch to one column only when realistic text cannot remain readable.
- Verify no horizontal overflow, clipped text, overlapping floating widgets, or
  cards whose empty area dominates their content at any changed breakpoint.

## Visual acceptance gate

Before handoff, inspect fresh full-page screenshots and focused screenshots of
every newly composed section at `1440 × 900`, around `768–1024px`, and
`390 × 844`.

Reject the result if any ordinary section shows one of these conditions:

- empty surface is the dominant visual element;
- short content sits inside oversized cards or a needlessly tall panel;
- repeated cards lack a consistent size, radius, alignment, or icon system;
- decorative numbering substitutes for useful iconography or real hierarchy;
- typography is too small for the available space, or display type pushes useful
  commerce content below the initial viewport;
- mobile loses the media/background/icon layer that made the desktop composition
  understandable;
- the screenshot looks technically correct but visually unfinished.

Record the responsive screenshots and the concrete defects fixed. Source-code
inspection alone does not pass this gate.
