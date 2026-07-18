# Content And Import Reference

## Product naming

Use this pattern:

```text
name: Áo bi-a X24 BA-### <Color Label>
slug: ao-bi-a-x24-ba-###-<color-slug>
sku: X24-BA-###
legacyPath: /<slug>/
```

Examples:

```text
Áo bi-a X24 BA-541 Trắng Đen Xám
ao-bi-a-x24-ba-541-trang-den-xam

Áo bi-a X24 BA-551 Tím Than Xanh Dương Trắng
ao-bi-a-x24-ba-551-tim-than-xanh-duong-trang
```

## SEO copy rules

Write original Vietnamese copy for each colorway. Keep the copy useful and
factual:

- mention `áo bi-a`, `polo bi-a`, `câu lạc bộ`, `đội nhóm`, or `giải đấu` where
  natural;
- mention the actual visible colorway;
- mention long black pants only as styling/coordination, not as a product bundle
  unless pants are included;
- mention custom team/logo/name support only as a consultation option;
- do not invent fabric, price, warranty, stock quantity, shipping, ratings, or
  customer claims.

Short description pattern:

```text
<One sentence describing colorway and use case>. Mẫu polo bi-a nam nữ phối quần
dài đen, phù hợp câu lạc bộ và giải đấu.
```

Content HTML pattern:

```html
<p><strong>Áo bi-a X24 BA-###</strong> là mẫu polo thể thao dành cho câu lạc bộ
bi-a, đội thi đấu phong trào và nhóm người chơi muốn đồng phục lịch sự khi ra
bàn.</p>
<h2>Điểm nổi bật của mẫu BA-###</h2>
<ul>
  <li>Phối màu ...</li>
  <li>Họa tiết lấy cảm hứng từ bi-a: đường cơ, bóng 8 và các nét chuyển động
  tinh tế trên thân áo.</li>
  <li>Phom polo ngắn tay gọn, dễ mặc cho nam và nữ khi kết hợp quần dài đen.</li>
  <li>Phù hợp đặt đồng phục bi-a theo nhóm, câu lạc bộ, giải đấu hoặc nhân sự
  phòng bi-a.</li>
</ul>
```

## Payload fields

Use these product fields unless the user supplies more specific commercial data:

```yaml
tenant: x24sport tenant id
sport: other
productType: simple
price: null
regularPrice: null
salePrice: null
currency: VND
stockStatus: instock
isPurchasable: false
publicationStatus: publish
categories: [bi-a category id]
gallery: [uploaded media id]
sourceSystem: x24-billiards-batch
sourceId: product code without BA prefix, e.g. "541"
```

Media fields:

```yaml
tenant: x24sport tenant id
alt: Áo bi-a X24 BA-### màu <Color Label> phối quần dài đen
sourceSystem: x24-billiards-imagegen
sourceId: x24-ba-###
sourceUrl: local-generated:x24-ba-###.png
```

## Import safety

Before mutation:

- back up existing products and media matching the batch source systems;
- check that category `bi-a` exists in tenant `x24sport`;
- dry-run the import script;
- inspect generated images for the long-pants rule and sport-context correctness.

After mutation:

- rerun the import dry-run and confirm every media/product is `unchanged`;
- verify CMS API count by category and source system;
- wait for Next revalidation before checking the public category if it initially
  renders an old count;
- run representative public page audits.
