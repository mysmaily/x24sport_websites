# Payload CMS API Notes

The referenced backend lives at:

```text
/Users/hoang/hacado/x24sport_websites/cms-api
```

Relevant collection files:

```text
src/collections/Products.ts
src/collections/Media.ts
src/collections/Tenants.ts
src/collections/ProductCategories.ts
src/collections/Users.ts
```

## Current Product Fields

`products` requires:

```text
name: text
slug: text, unique
sku: text
sport: select, one of badminton, volleyball, football, basketball, running, pickleball, other
price: number
shortDescription: textarea
```

Optional useful fields:

```text
compareAtPrice: number
description: richText
categories: relationship to product-categories, hasMany
badges: array of { label }
gallery: relationship to media, hasMany
featured: checkbox
tenant: added by multiTenantPlugin
```

## Auth

Admin writes require an authenticated user whose role is `super_admin` or
`tenant_admin`. Use either:

```text
Authorization: Bearer $PAYLOAD_TOKEN
```

or log in:

```http
POST /api/users/login
Content-Type: application/json

{"email":"...","password":"..."}
```

The login response is expected to include `token`.

## Product Endpoints

Typical REST endpoints:

```text
GET    /api/products?where[sku][equals]=...
POST   /api/products
PATCH  /api/products/:id
GET    /api/products/:id
```

When multi-tenant access requires an explicit tenant, include the `tenant` field
in create/update payloads. The runner reads `PAYLOAD_TENANT_ID` and includes it
when present.

## Media Upload

Upload images through Payload's upload collection:

```bash
curl -H "Authorization: Bearer $PAYLOAD_TOKEN" \
  -F 'file=@/path/to/image.webp' \
  -F '_payload={"alt":"...","tenant":"..."}' \
  "$PAYLOAD_BASE_URL/api/media"
```

The runner uses this multipart shape and parses the JSON response for `id`.

## Traceability Limitation

The current `products` schema has no private source-signature or conversion
status fields. The gaming runner publishes with `sport=other` because the enum
has no `gaming` value. The runner therefore uses:

- deterministic reservation SKU: `x24-gm-transfer-<sha-prefix>`;
- local `manifest.jsonl` for status;
- local `converted-sources.jsonl` after verification.

For large-scale or multi-machine runs, add non-shopper fields such as
`transferSourceSignature`, `transferSourcePath`, and `transferStatus` to the
Payload product collection, then update the runner's duplicate checks to query
those fields directly.
