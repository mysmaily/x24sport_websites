# cms-api — Payload CMS Source Profile

> Scope: This folder contains the shared Payload CMS API/admin source for the X24
> sports multi-tenant stack. Use this profile when changing CMS schema, admin,
> content collections, media upload, seed data, or API behavior.

## Current Stack

- Runtime: Payload CMS 3 + Next.js.
- Database: PostgreSQL on private host `10.10.0.17`.
- Docker application host: `10.10.0.28`.
- Deployed path: `/opt/sports-cms/cms-api`.
- Compose project path: `/opt/sports-cms`.
- Container service: `cms-api`.
- Internal CMS origin: `http://10.10.0.28:3001`.
- Public admin URL: `https://cms.x24sport.vn/admin/login`.
- Public media URL base: `https://static.x24sport.vn`.

Use private IPs for SSH and service access. Do not SSH through public IPs from
this profile. If proxy changes are needed and no private proxy IP is documented,
ask for the private proxy address before changing Nginx.

## SSH And Runtime Access

```bash
ssh root@10.10.0.28
cd /opt/sports-cms
docker compose ps
docker compose logs --tail=120 cms-api
```

Database checks:

```bash
ssh root@10.10.0.17
sudo -u postgres psql -d sports_cms
```

Admin credentials are stored on the app host, not in this repository:

```bash
ssh root@10.10.0.28 'cat /root/sports-cms/admin-credentials.txt'
```

Never paste passwords, API keys, R2 keys, or database secrets into chat,
commits, docs, or logs.

## Local Development

```bash
cd cms-api
pnpm install
pnpm dev
```

Important local env file:

- `cms-api/.env`
- Safe template: `cms-api/.env.example`

Local development and production intentionally use the same PostgreSQL database
on `10.10.0.17`. Do not create a separate local database unless the user
explicitly asks for an isolated experiment. This keeps content, tenants, media
records, pages, products, and settings identical between local testing and
production.

Development workflow:

1. Make code/schema changes locally.
2. If content, tenant settings, pages, products, posts, media records, or schema
   data are needed, update the production database through Payload admin/API or a
   backed-up migration.
3. Test the local CMS/frontend against that shared production database.
4. Verify pages, admin flows, media URLs, tenant filtering, and responsive UI.
5. Deploy only after the local result is correct against production data.

Never debug by making blind live-only edits on production first. Use local code
with the shared production database to reproduce and fix issues before deploy.

Local checks before deploy:

```bash
pnpm exec tsc --noEmit
pnpm payload generate:types
pnpm payload generate:importmap
pnpm run build
```

Run `pnpm payload generate:importmap` after adding or changing Payload plugins,
admin components, rich text features, upload adapters, or anything that injects
admin UI. A missing import map commonly causes a blank admin page.

## Deployment

Back up before remote mutation:

```bash
ssh root@10.10.0.28 'ts=$(date +%Y%m%d-%H%M%S); mkdir -p /root/sports-cms/backups; tar -C /opt -czf /root/sports-cms/backups/sports-cms-before-change-$ts.tgz sports-cms/cms-api sports-cms/docker-compose.yml sports-cms/.env'
```

Deploy source:

```bash
rsync -az --delete \
  --exclude node_modules \
  --exclude .next \
  --exclude .env \
  --exclude .env.local \
  cms-api/ root@10.10.0.28:/opt/sports-cms/cms-api/

ssh root@10.10.0.28 'cd /opt/sports-cms && docker compose up -d --build cms-api'
```

Verify:

```bash
curl -I http://10.10.0.28:3001/admin/login
curl -I https://cms.x24sport.vn/admin/login
curl -fsS 'https://cms.x24sport.vn/api/tenants?limit=1'
ssh root@10.10.0.28 'cd /opt/sports-cms && docker compose logs --tail=120 cms-api'
```

When admin renders blank, check logs for `getFromImportMap` first, regenerate
`src/app/(payload)/admin/importMap.js`, rebuild, and verify with a real browser
or Chrome headless.

## Tenants

Website tenant contract:

- `x24sport` for `x24sport.vn` and preview `next.x24sport.vn`
- `mayaocaulong` for `mayaocaulong.vn`
- `mayaobongchuyen` for `mayaobongchuyen.vn`
- `mayaopickleball` for `mayaopickleball.vn`
- `mayaobongro` for `mayaobongro.vn`

`mayaobongda.vn` and `mayaochaybo.vn` have no Next.js source in this repository
and no Payload tenant record. They remain active WordPress websites and are not
CMS tenants. Do not invent `mayaobongda` or `mayaochaybo` tenant filters.

Tenant records live in `src/collections/Tenants.ts` and include:

- `name`
- `slug`
- `domains`
- `brand.headline`
- `brand.subheadline`
- `brand.primaryColor`
- `brand.accentColor`
- `brand.style`

Use one shared admin dashboard. Do not create separate CMS apps per domain.

## Collections

Primary collections:

- `tenants`: tenant/domain/brand configuration.
- `users`: super admin and tenant users.
- `media`: uploaded images/files; tenant scoped.
- `products`: product catalog.
- `pages`: landing/content pages.
- `posts`: blog posts.
- `store-settings`: tenant-specific global-like settings.

Multi-tenant behavior is configured in `src/payload.config.ts` through
`@payloadcms/plugin-multi-tenant`. When adding a tenant-owned collection, add it
to the plugin config so list filters and tenant access remain consistent.

## Media And Cloudflare R2

Media uploads use one R2 bucket with tenant prefixes:

- `https://static.x24sport.vn/mayaocaulong/...`
- `https://static.x24sport.vn/mayaobongchuyen/...`

Relevant files:

- `src/collections/Media.ts`
- `src/storage/r2.ts`
- `src/payload.config.ts`

R2 env variables are passed through Docker Compose:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_R2_BUCKET_NAME`
- `CLOUDFLARE_R2_ACCESS_KEY_ID`
- `CLOUDFLARE_R2_SECRET_ACCESS_KEY`
- `CLOUDFLARE_R2_PUBLIC_URL`

Do not hard-code credentials. Keep public media URLs stable and prefer new
filenames for changed images so CDN cache can stay long-lived.

## Adding Content

Preferred path is through Payload admin:

1. Open `https://cms.x24sport.vn/admin/login`.
2. Choose or filter the correct tenant.
3. Create or update products, pages, posts, media, and store settings.
4. Confirm records have the right tenant before publishing.

Programmatic content changes should use Payload APIs or seed scripts, not direct
SQL, except for controlled schema fixes with a backup.

Seed script:

```bash
cd cms-api
pnpm seed
```

Only run seeds when it is safe to update sample/demo data.

## SEO Content Standards

For products:

- Use a clear product name with sport and use case.
- Keep slug short, lowercase, ASCII, and stable.
- Include SKU, price, short description, long description, and gallery.
- Add practical keywords naturally: sport, custom jersey, team uniform, club,
  fabric, printing, name/number, order quantity.
- Avoid keyword stuffing and duplicate descriptions across tenants.

For posts:

- Use one focused topic per post.
- Write a useful excerpt.
- Use headings that answer buyer questions.
- Link to relevant products or category pages when available.
- Use original images with descriptive alt text.

For pages:

- One clear H1 per page.
- Use page copy that matches the tenant sport and audience.
- Keep title and meta description specific to the page, not generic.
- Prefer helpful buying guidance over thin landing-page text.

## Schema Changes

Before changing collections:

1. Read the current collection file.
2. Check generated `src/payload-types.ts`.
3. Make the smallest schema change.
4. Run type generation and build.
5. If production DB needs manual migration, back up affected tables first.

For production table backup:

```bash
ssh root@10.10.0.17 'ts=$(date +%Y%m%d-%H%M%S); sudo -u postgres pg_dump -d sports_cms -t media -f /tmp/media-$ts.sql'
```

Move backups from `/tmp` into `/root/sports-cms/backups/` if needed.

## Safety Notes

- Keep work scoped to this CMS source and the documented private hosts.
- Do not restart database services unless explicitly required.
- Do not change public DNS, SSL, firewall, or billing from this profile.
- If changing remote Nginx/proxy is required, ask for the private proxy IP first.
- Always report changed files, backups, commands run, and verification results.
