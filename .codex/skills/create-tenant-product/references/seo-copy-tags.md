# SEO Copy And Tagging

## Product Copy Contract

Write for Vietnamese buyers choosing sportswear for a team, club, class, company, event, or shop catalog. Be factual, compact, and commerce-first.

Recommended fields:

- `name`: 45-85 characters when possible. Start with the product type and sport. Include dominant color/style/audience when useful.
- `slug`: stable Vietnamese ASCII slug from the product name; avoid date noise unless the season/model is core.
- `shortDescription`: 130-220 characters. Include product type, sport/use case, key visual cue, customization/order value, and price/contact cue if known.
- `description`: 5-8 short paragraphs in Lexical rich text. Cover visual design, suitable users, customization, material/fit only if known or expressed as consultation, printing/personalization, ordering process, and FAQ/objections.
- `seoTitle`: `<Product name> | <Brand/domain>` or shorter when the name is long.
- `metaDescription`: 140-158 characters; must read naturally and include the main keyword plus customization/order intent.

Avoid:

- Claims like official/licensed/authentic, performance guarantees, named fabric, free printing, or fixed delivery time unless the user provides them.
- Stuffed lists of keywords.
- CMS/API/AI/process language in public copy.
- Competitor branding unless it is part of a factual source migration and allowed by the tenant scope.

## Title Patterns

Use one of these patterns, adapted to tenant category:

- `Áo bóng đá <màu/phong cách> đặt may cho đội bóng`
- `Áo cầu lông <màu/phong cách> cho câu lạc bộ`
- `Áo pickleball <form/polo/cổ> <màu> thiết kế riêng`
- `Áo bóng chuyền <nam/nữ/libero> <màu/phối> đặt đội`
- `Áo bóng rổ jersey <màu/phong cách> in tên số`
- `Áo chạy bộ <singlet/có tay/sự kiện> <màu> đặt may`
- `Áo gaming/esports <màu/phong cách> cho team`
- `Áo bi-a/polo bi-a <màu/phong cách> cho câu lạc bộ`

For team/club-inspired products, use “lấy cảm hứng”, “phong cách”, or “mẫu phối” unless the listing is authorized to use the team/brand directly.

## Image Analysis Checklist

Capture:

- Sport/use case: football, badminton, volleyball, basketball, running, pickleball, gaming/esports, billiards, outdoor uniform, other.
- Garment: jersey, polo, singlet, set áo-quần, training shirt, tank, jacket, skirt/dress if relevant.
- Audience: nam, nữ, unisex, trẻ em, đội bóng, câu lạc bộ, công ty, trường/lớp, giải đấu.
- Visuals: dominant colors, accent colors, gradient, stripes, geometric pattern, abstract waves, lightning, camo, sponsor/logo placeholders, front/back/detail.
- Fit and construction visible: cổ tròn, cổ polo, cổ tim, tay ngắn, sát nách, raglan, form suông, form ôm.
- Context: flat mockup, model, team group, field/court/studio, front/back views.

## Search Tags

Normalize tags as short Vietnamese phrases. Include synonyms buyers may type, but keep each tag meaningful.

Product-level tags:

- Sport and category: `áo bóng đá`, `đồng phục bóng đá`, `áo câu lạc bộ`.
- Garment/type: `áo polo thể thao`, `áo thi đấu`, `set áo quần`, `áo sát nách`.
- Buyer/use case: `đặt may áo đội`, `áo công ty`, `áo lớp`, `áo giải đấu`, `in tên số`, `in logo`.
- Audience: `áo nam`, `áo nữ`, `unisex`, `trẻ em`.
- Color family: `màu đỏ`, `màu xanh navy`, `màu trắng`, `gradient xanh hồng`.
- Style: `geometric`, `sọc`, `tối giản`, `nổi bật`, `hiện đại`.

Media-level tags:

- Include all product-level visual tags that apply to that exact image.
- Add viewpoint/context: `mặt trước`, `mặt sau`, `chi tiết cổ áo`, `mockup áo`, `người mẫu nam`, `nhóm mặc áo`, `trên sân`.
- Add exact colors and pattern: `xanh ngọc`, `đen đỏ`, `trắng xanh`, `gradient`, `họa tiết tia sét`.

## Contextual Images Below Product Copy

- Keep gallery order intentional: image 1 is the hero; images 2 onward are contextual views.
- Reuse images 2 onward below the long description instead of uploading duplicate media.
- Render each contextual image as `<figure>` containing a normal indexable `<img>` and a visible `<figcaption>`.
- Write `alt` and visible `figcaption` for different jobs:
  - `alt`: concise accessibility text that describes the image accurately; include count, model type, pose, or setting only when useful for understanding the image.
  - `figcaption`: natural storefront copy that helps shoppers understand the use case, styling, or ordering angle. It should sound like something a brand would publish below an image, not like an image-analysis sentence.
- Avoid visible captions that start with inventory phrasing such as “Ba người mẫu Việt Nam...”, “Nhóm năm người mẫu...”, or “Ảnh chụp...”. Prefer lines such as “Mẫu áo trắng xanh dễ nổi bật khi chụp ảnh nhóm ngoài trời.” or “Set áo cổ tròn tay ngắn phù hợp picnic và team building công ty.”
- Lazy-load contextual images, preserve intrinsic dimensions/aspect ratio, and keep them full-width within the copy column on mobile.
- Do not repeat image 1 below the description. If only one image exists, render no contextual figure.

Mayaobongda and several tenant UIs search `name`, `gallery.searchTags.value`, then `searchTags.value`; keep high-value visual tags on the media record so filtered catalog pages can show the matching image.

## Default Commercial Values

Use tenant/profile/user values first. If missing:

- `productType`: `simple`.
- `publicationStatus`: `draft` until reviewed; `publish` only when user asks or all facts are certain.
- `stockStatus`: `instock` for orderable custom products unless profile says otherwise.
- `isPurchasable`: `false` for consultation/order-by-contact products.
- `currency`: `VND`.
- Price fields: do not invent; leave absent or use tenant-proven defaults only when the user or existing workflow establishes them.
