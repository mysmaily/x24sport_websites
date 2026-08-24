# mayaocaulong.vn — Website Profile

Read `../AGENTS.md` first.

## Identity and business

- Tenant: `mayaocaulong`; domain: `mayaocaulong.vn`.
- Role: specialist satellite for badminton shirts and uniforms.
- Customers: badminton clubs, teams, schools, companies and tournaments.
- Core needs: model selection, team colors, logo, names/numbers, fabric, size and quantity consultation.
- X24Sport may carry selected badminton products only through explicit distribution.

## Source and operations

- Tenant UI: `../cms-frontend/src/app/[tenant]/_mayaocaulong/`.
- CSS/assets: `../cms-frontend/src/app/mayaocaulong.css`, `../cms-frontend/public/images/mayaocaulong/`.
- API tenant filter: `mayaocaulong`; revalidation: 60 seconds.
- Frontend runtime: `root@10.10.0.53:/root/websites/cms-frontend`, blue/green ports `3010` and `3011`.
- Proxy: `root@10.10.0.56:/etc/nginx/conf.d/mayaocaulong.vn.conf` → shared `cms_frontend_active` upstream.

For UI changes edit the tenant UI/CSS/assets, test `cms-frontend`, then deploy the
shared frontend. For products, categories, pages, posts, Store Settings or
images, use REST with `mayaocaulong-rest@internal.invalid` and secret
`root@10.10.0.28:/root/sports-cms/mayaocaulong-rest-api.env` (mode `0600`).
Upload images as tenant-owned media before updating product galleries. Verify
badminton-only scope, ownership, URL, gallery, category and metadata.
