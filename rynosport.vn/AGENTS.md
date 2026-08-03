# rynosport.vn — Website Profile

Read `../AGENTS.md` first. This file contains only RynoSport-specific business and operational rules.

## Identity and business

| Field | Value |
|---|---|
| Domain | `rynosport.vn` |
| Tenant slug | `rynosport` |
| Brand | RynoSport |
| Portfolio role | Independent peer brand to X24Sport |
| Product scope | Multi-sport teamwear for teams, clubs, schools and events |

RynoSport owns its brand voice, catalog and customer experience. It is not a
satellite of X24Sport. Never relabel X24Sport content as RynoSport without an
explicit distribution request and tenant-scoped content review.

## Source and runtime

- Frontend: `../cms-frontend/src/app/[tenant]/page.tsx`, `ryno-catalog.tsx`, `ryno-shell.tsx`.
- Assets: `../cms-frontend/public/images/rynosport/`.
- CMS/API: `https://cms.x24sport.vn/api`; tenant filter `rynosport`.
- Production: `root@10.10.0.58:/root/websites/cms-frontend`, container `cms-frontend`, port `3010`.
- Proxy: `root@10.10.0.56:/etc/nginx/conf.d/rynosport.vn.conf` → `10.10.0.58:3010`.
- Frontend content revalidation: normally 60 seconds.

## How to act

| Request | Action |
|---|---|
| Ryno UI/brand page | Edit the Ryno files above and Ryno assets; test the shared frontend, then deploy it. |
| Product/category/post/page/settings | Use Payload REST for `rynosport`; do not use X24Sport IDs or credentials. |
| Product image/gallery | Upload media owned by `rynosport`, then relate it to the Ryno product. |
| Shared frontend component | Verify RynoSport and every affected sibling tenant before deployment. |

REST service account contract:

- User: `rynosport-rest@internal.invalid`, role `tenant_admin`.
- Secret: `root@10.10.0.28:/root/sports-cms/rynosport-rest-api.env`, mode `0600`.
- Allowed scope: RynoSport products, categories, media, posts, pages and Store Settings.

Verify brand name, tenant ownership, product/category URLs, images and metadata.
