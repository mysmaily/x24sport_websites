# pndsport.vn — Website Profile

Read `../AGENTS.md` first. This file contains only PND Sport-specific business and operational rules.

## Identity and business

| Field | Value |
|---|---|
| Domain | `pndsport.vn` |
| Tenant slug | `pndsport` |
| Brand | PND Sport Việt Nam |
| Portfolio role | Multi-sport teamwear brand equivalent in catalog scope to X24Sport |
| Customers | Teams, clubs, schools, companies and event groups |
| Primary conversion | Send a design and quotation request through Zalo or phone |

PND Sport may carry the complete X24Sport catalog because the owner explicitly
approved equivalent product scope. Distribution must still use PND-owned product
records and explicit media sharing; never query X24Sport records directly at
render time. Public prices are the lowest starting prices and final quotations
depend on the confirmed configuration and quantity.

## Brand and customer experience

- Approved visual direction: PND V1, compact clean sports commerce.
- Brand accent: `#5a2f92`; logo assets:
  `../cms-frontend/public/images/pndsport/pnd-main-logo.svg` on white backgrounds
  and `../cms-frontend/public/images/pndsport/pnd-white-logo.svg` on the brand background.
- Avoid oversized display type, excessive whitespace, `p-6`-scale padding and
  clone-like reproduction of the X24Sport visual system.
- Public copy must say `PND Sport` or `PND Sport Việt Nam`, never describe the
  website as a preview, draft, CMS, SEO landing, taxonomy or clone.
- Hotline and Zalo: `0989 353 247` / `https://zalo.me/0989353247`.

## Source and operations

- Tenant UI: `../cms-frontend/src/app/[tenant]/_pndsport/` plus the approved V1
  design primitives under `../cms-frontend/src/app/pndsport-preview/`.
- Assets: `../cms-frontend/public/images/pndsport/`.
- CMS/API: `https://cms.x24sport.vn/api`; tenant filter `pndsport`.
- Production: `root@10.10.0.53:/root/websites/cms-frontend`, blue/green
  containers on ports `3010` and `3011`.
- Proxy: `root@10.10.0.56:/etc/nginx/conf.d/pndsport.vn.conf` to the shared
  `cms_frontend_active` upstream.
- Frontend content revalidation: normally 60 seconds.

REST service account contract:

- User: `pndsport-rest@internal.invalid`, role `tenant_admin`.
- Secret: `root@10.10.0.28:/root/sports-cms/pndsport-rest-api.env`, mode `0600`.
- Allowed scope: PND Sport products, categories, media, posts/pages and Store Settings.

Verify the canonical domain, tenant ownership, shared-media permission, prices,
catalog/category/product routes, metadata, sitemap, robots and sibling isolation
after every production content batch.
