# x24sport.vn — Website Profile

Read `../AGENTS.md` first. This file contains only X24Sport-specific business and operational rules.

## Identity and business

| Field | Value |
|---|---|
| Domain | `x24sport.vn` |
| Tenant slug | `x24sport` |
| Brand | X24Sport |
| Portfolio role | Master website and multi-sport marketplace |
| Customer promise | One destination for football, badminton, pickleball, volleyball, basketball, running and other teamwear |

X24Sport is the portfolio's master catalog. Specialist `mayao*.vn` products may
be distributed here only through an explicit tenant-scoped clone/sync and media
sharing workflow. Do not silently query sibling tenant products at render time.
RynoSport is an independent peer brand, not an X24Sport satellite.

## Source and runtime

- Frontend: `../cms-frontend/`; generic X24 pages and shared components.
- Tenant assets: `../cms-frontend/public/images/brand/` and shared catalog media.
- CMS/API: `https://cms.x24sport.vn/api`; tenant filter `x24sport`.
- Production: `root@10.10.0.58:/root/websites/cms-frontend`, container `cms-frontend`, port `3010`.
- Proxy: `root@10.10.0.56:/etc/nginx/conf.d/x24sport.vn.conf` → `10.10.0.58:3010`.
- Frontend content revalidation: normally 60 seconds.

## How to act

| Request | Action |
|---|---|
| UI, route, metadata, component | Edit `../cms-frontend/`, test, commit and deploy with `../PRODUCTION-DEPLOYMENT-RUNBOOK.md`. |
| Product/category/post/page/settings | Use tenant-scoped Payload REST following `../PAYLOAD-REST-API-GUIDE.md`. No frontend deployment. |
| Product image/gallery | Upload to `POST /api/media` as tenant `x24sport`, then update the product gallery. |
| Bring a specialist product into X24Sport | Use the matching idempotent `../cms-api/scripts/clone-<source>-to-x24sport.ts` workflow; preserve source media ownership and explicitly share media. |
| CMS schema/access/storage | Edit `../cms-api/`, verify all tenants, deploy only the CMS service. |

REST service account:

- User: `x24sport-rest@internal.invalid`, role `tenant_admin`.
- Secret: `root@10.10.0.28:/root/sports-cms/x24sport-rest-api.env`, mode `0600`.
- Allowed scope: X24Sport products, categories, media, posts, pages and Store Settings.

Verify the public product/category URL, X24Sport ownership, shared media access,
metadata and catalog visibility after the cache window.
