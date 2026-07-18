# Shared Payload REST API Guide

This is the common REST runbook for every Next.js tenant backed by the shared
Payload CMS. Read the target domain's `AGENTS.md` first: it supplies the tenant
slug, credential source, allowed scope, cache behavior, and any site-specific
exceptions.

## What is shared and what is tenant-specific

| Shared across tenants | Must differ per tenant |
|---|---|
| API base `https://cms.x24sport.vn/api` | Tenant slug and tenant record ID |
| Payload REST routes and JSON shapes | Dedicated service user and API key |
| Header format `users API-Key <key>` | Service user's single tenant assignment |
| Collections such as `products`, `product-categories`, `media`, `posts`, `pages` | Category, product, media, and relationship IDs |
| Backup, dry-run, idempotency, and verification rules | R2/media prefix and public frontend URL |

Do not reuse one tenant's API key, numeric IDs, category relationships, media
records, slugs, or content assumptions for another tenant. The tenant slug is
not merely a request parameter: Payload derives authorization from the service
user's assigned tenant and applies tenant access control to reads and writes.

## Required tenant profile fields

Every tenant using REST automation must document these non-secret values in its
local `AGENTS.md`:

- tenant slug;
- public CMS/API base;
- service account email and role;
- SSH host and absolute path of the mode-`0600` env file containing the key;
- public frontend URL and content revalidation behavior;
- allowed collections and any tenant-specific restrictions.

Never store the actual API key in this guide, a tenant profile, source code,
logs, commits, shell tracing, or handoff output.

## Load credentials safely

Use the secret location from the target tenant profile:

```bash
set +x
source <(ssh <secret-host> 'cat <absolute-secret-env-path>')
```

The env file should provide:

```dotenv
CMS_API_URL=https://cms.x24sport.vn
TENANT_SLUG=<tenant-slug>
PAYLOAD_API_USER=<dedicated-service-user>
PAYLOAD_API_KEY=<secret>
PAYLOAD_AUTH_COLLECTION=users
```

Validate authentication without printing the key:

```bash
curl -fsS \
  -H "Authorization: users API-Key ${PAYLOAD_API_KEY}" \
  "${CMS_API_URL}/api/users/me"
```

Unset secrets when the operation ends:

```bash
unset PAYLOAD_API_KEY PAYLOAD_API_USER PAYLOAD_AUTH_COLLECTION
```

## Resolve the tenant and relationships

Resolve the tenant record at runtime; do not copy a numeric ID from another
site or assume it is stable across environments:

```bash
curl -fsS \
  -H "Authorization: users API-Key ${PAYLOAD_API_KEY}" \
  "${CMS_API_URL}/api/tenants?where[slug][equals]=${TENANT_SLUG}&limit=1&depth=0"
```

Apply both controls to catalog lookups:

1. authenticate with the tenant's dedicated API key;
2. include `where[tenant.slug][equals]=<tenant-slug>` in list queries.

Resolve category and media IDs inside that tenant before building relationship
arrays. A relationship to a sibling tenant's record is invalid even when the
human-readable slug happens to match.

## Common endpoints

| Operation | Method and route |
|---|---|
| Authenticate current key | `GET /api/users/me` |
| Resolve tenant | `GET /api/tenants?where[slug][equals]=...` |
| List/create products | `GET/POST /api/products` |
| Read/update/delete product | `GET/PATCH/DELETE /api/products/:id` |
| List/create categories | `GET/POST /api/product-categories` |
| Update category | `PATCH /api/product-categories/:id` |
| List/upload media | `GET/POST /api/media` |
| Posts | `GET/POST/PATCH /api/posts[/<id>]` |
| Pages | `GET/POST/PATCH /api/pages[/<id>]` |
| Access summary | `GET /api/access` |

Payload collection POST/PATCH responses may contain the record directly or
under `doc`; automation should accept both shapes.

## Read and update example

Find a tenant-scoped product before using its numeric ID:

```bash
curl -fsS \
  -H "Authorization: users API-Key ${PAYLOAD_API_KEY}" \
  "${CMS_API_URL}/api/products?where[tenant.slug][equals]=${TENANT_SLUG}&where[sku][equals]=<SKU>&limit=1&depth=1"
```

Update only the verified record:

```bash
curl -fsS -X PATCH \
  -H "Authorization: users API-Key ${PAYLOAD_API_KEY}" \
  -H 'Content-Type: application/json' \
  -d '{"shortDescription":"Nội dung đã cập nhật"}' \
  "${CMS_API_URL}/api/products/<verified-product-id>"
```

For creates, include the resolved tenant relationship explicitly in JSON:

```json
{
  "tenant": "<resolved-tenant-id>",
  "name": "Tên sản phẩm",
  "slug": "ten-san-pham",
  "publicationStatus": "draft"
}
```

Create as `draft` while validating incomplete data. Publish only after factual
name, stable slug, category, price/contact-price state, stock state, content,
media, alt text, and metadata have been checked.

## Media upload

Upload media through `POST /api/media` as `multipart/form-data` with:

- `file`: the binary file;
- `_payload`: JSON containing the resolved `tenant`, factual `alt`, and optional
  source identity fields.

Example `_payload`:

```json
{
  "tenant": "<resolved-tenant-id>",
  "alt": "Mô tả ảnh hữu ích",
  "sourceSystem": "manual",
  "sourceId": "stable-source-id",
  "sourceUrl": "https://source.example/image.webp",
  "sourceChecksum": "sha256"
}
```

Do not attach a media record owned by another tenant. Reuse an existing media
record only after matching tenant plus stable source identity or checksum.

## Idempotency and safe mutation

- Run a dry-run before every programmatic content mutation.
- Back up the affected records or the `sports_cms` database before `--apply`.
- Prefer a stable tenant-scoped identity: SKU, tenant slug key, legacy path,
  `sourceSystem + sourceId`, or checksum as appropriate.
- Query first, then create or update; a retry must not create duplicates.
- Never use direct SQL for normal content creation or editing.
- Do not update `productCount` with a hard-coded value. Recalculate it from
  tenant-scoped product relationships after the mutation.
- Do not restart CMS, PostgreSQL, proxy, or frontend for a content-only REST
  update.

## Verification gates

After mutation, verify all applicable items:

1. API record belongs to the intended tenant and is unique by the chosen stable
   identity.
2. Category and gallery relationships belong to the same tenant.
3. Media URL returns HTTP 200 with the intended MIME type and dimensions.
4. Public product/category URL returns HTTP 200 after the frontend's documented
   revalidation window.
5. Rendered title, H1, canonical, description, price/contact state, image alt,
   structured data, and visible content match the CMS record.
6. Product is reachable through its category and appears in the sitemap when
   published.
7. A sibling-tenant query with the service key returns no sibling records.
8. Temporary verification records are deleted and logs contain no new errors.

Report created/updated record IDs, backup paths, verification evidence, cache or
services touched, and remaining factual gaps. Never report the key itself.

## Rotation and revocation

Use one service user per tenant. Keep the role tenant-scoped and never promote a
content integration to `super_admin`. To rotate, generate a new key for the same
service user, atomically replace its mode-`0600` env file, retest `/api/users/me`,
then invalidate the old key. To revoke, disable API-key authentication on that
service user and verify authenticated requests fail.

Payload reference: <https://payloadcms.com/docs/authentication/api-keys>
