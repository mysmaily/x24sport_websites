# mayaobongchuyen.vn — Next.js Tenant Frontend Profile

> Scope: This folder contains the Next.js frontend for the volleyball apparel
> tenant `mayaobongchuyen`. Use this profile when changing layout, visual design,
> copy, SEO metadata, or frontend data fetching for `mayaobongchuyen.vn`.

## Current Stack

- Framework: Next.js app router.
- Tenant slug: `mayaobongchuyen`.
- CMS/API source: sibling folder `../cms-api`.
- Docker application host: `10.10.0.28`.
- Deployed path: `/opt/sports-cms/mayaobongchuyen.vn`.
- Compose project path: `/opt/sports-cms`.
- Container service: `mayaobongchuyen`.
- Internal frontend origin: `http://10.10.0.28:3003`.
- Internal CMS origin from container network: `http://cms-api:3001`.
- Public site: `https://mayaobongchuyen.vn`.

Use private IPs for SSH and service access. Do not use public IPs for SSH from
this profile.

## SSH And Runtime Access

```bash
ssh root@10.10.0.28
cd /opt/sports-cms
docker compose ps
docker compose logs --tail=120 mayaobongchuyen
```

Useful checks:

```bash
curl -I http://10.10.0.28:3003
curl -I https://mayaobongchuyen.vn
```

## Local Development

```bash
cd mayaobongchuyen.vn
pnpm install
pnpm dev
```

Local env template:

- `mayaobongchuyen.vn/.env.example`

Default local CMS URL is `http://localhost:3001`; production uses
`PAYLOAD_API_URL=http://cms-api:3001` through Docker Compose.

Local development and production must use the same Payload/PostgreSQL data.
When developing locally, run the local frontend against the local or remote CMS
that is connected to the production database on `10.10.0.17`. Do not invent a
separate local-only content dataset unless the user explicitly requests an
isolated experiment.

Development workflow:

1. Update needed content in the shared CMS first: pages, products, posts, media,
   tenant brand settings, and store settings.
2. Develop or adjust the local frontend against that shared production data.
3. Test the real pages, tenant filtering, media URLs, SEO metadata, and mobile
   layout locally.
4. Deploy the frontend only after the local result matches the intended
   production behavior.

This project prefers debugging with local code plus production data, rather than
debugging directly on the production frontend.

## Deployment

Back up before remote mutation:

```bash
ssh root@10.10.0.28 'ts=$(date +%Y%m%d-%H%M%S); mkdir -p /root/sports-cms/backups; tar -C /opt -czf /root/sports-cms/backups/mayaobongchuyen-before-change-$ts.tgz sports-cms/mayaobongchuyen.vn sports-cms/docker-compose.yml'
```

Deploy source:

```bash
rsync -az --delete \
  --exclude node_modules \
  --exclude .next \
  --exclude .env \
  --exclude .env.local \
  mayaobongchuyen.vn/ root@10.10.0.28:/opt/sports-cms/mayaobongchuyen.vn/

ssh root@10.10.0.28 'cd /opt/sports-cms && docker compose up -d --build mayaobongchuyen'
```

Verify:

```bash
curl -I http://10.10.0.28:3003
curl -I https://mayaobongchuyen.vn
ssh root@10.10.0.28 'cd /opt/sports-cms && docker compose logs --tail=120 mayaobongchuyen'
```

## Frontend Files

- `src/app/page.tsx`: homepage UI.
- `src/app/layout.tsx`: root layout and metadata.
- `src/app/styles.css`: tenant visual system and responsive styling.
- `src/lib/content.ts`: CMS data fetching, tenant detection, fallbacks.

`getTenantSlug()` must keep returning `mayaobongchuyen` for this domain. Do not
mix content from other tenants.

## Data Model Used By This Frontend

Homepage currently reads:

- tenant brand data from `/api/tenants`
- featured products from `/api/products`
- latest posts from `/api/posts`

Expected tenant filter:

```text
where[tenant.slug][equals]=mayaobongchuyen
```

Keep fallback content present so the frontend still renders if CMS is
temporarily unavailable, but production content should come from Payload.

## Adding Or Updating Content

Use the shared CMS admin:

1. Open `https://cms.x24sport.vn/admin/login`.
2. Select or filter tenant `mayaobongchuyen`.
3. Add media first if the product/page needs images.
4. Add or update products, pages, posts, and store settings.
5. Check public page after save.

Do not hard-code normal product/blog content in the frontend unless it is a
temporary fallback. Real catalog and article data belongs in Payload.

## Design Direction

This tenant is volleyball-focused and currently uses a darker, energetic visual
direction inspired by performance sportswear:

- high contrast
- strong section rhythm
- bold volleyball/team-uniform language
- accent color around yellow/gold
- product cards designed for scanning

When changing UI:

- Keep the first viewport useful, not a marketing-only splash.
- Show product/category signals quickly.
- Use real product/media assets from CMS when available.
- Keep CTAs clear: quote, customize, view products, read guide.
- Test mobile widths so text and buttons do not overlap.
- Avoid generic one-color layouts, oversized decorative gradients, or nested
  cards.

## SEO Standards

For this tenant, use Vietnamese volleyball apparel intent:

- `ao bong chuyen dat may`
- `dong phuc bong chuyen`
- `ao bong chuyen in ten so`
- `ao bong chuyen cho cau lac bo`
- `thiet ke ao bong chuyen`

Page guidance:

- One H1 per page.
- H1 should describe the offer or page topic directly.
- Title should include the page topic and brand/site where natural.
- Meta description should be useful, human-written, and under about 160 chars.
- Use semantic headings for buyer questions: fabric, form, customization,
  printing, size collection, order process.
- Images need descriptive alt text.
- Avoid duplicate blog/product copy from `mayaocaulong`.

Structured data can be added later for products/articles if the frontend starts
rendering detail pages.

## Adding New Pages

For code pages:

1. Add a route under `src/app`.
2. Fetch tenant-scoped data from Payload.
3. Add metadata in the route or layout.
4. Keep fallback behavior for CMS outages.
5. Run `pnpm run build`.

For CMS-managed pages:

1. Add the page in Payload `pages` collection with tenant `mayaobongchuyen`.
2. If the frontend does not yet render that route, add a dynamic Next route.
3. Keep slugs stable once indexed.

## Safety Notes

- Keep changes scoped to this tenant frontend unless the user asks for shared
  changes.
- Do not edit `../cms-api` unless the requested frontend work needs schema/API
  changes.
- Do not use sibling WordPress profiles or old WordPress credentials.
- Report changed files, backup paths, commands run, and verification results.
