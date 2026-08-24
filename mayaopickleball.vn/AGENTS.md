# mayaopickleball.vn — Website Profile

Read `../AGENTS.md` first.

## Identity and business

- Tenant: `mayaopickleball`; domain: `mayaopickleball.vn`.
- Role: specialist satellite for pickleball apparel and uniforms.
- Customers: clubs, teams, groups, companies and pickleball tournaments.
- Core needs: model, color, logo, names, fabric, size, sleeves and order quantity.
- X24Sport may carry selected pickleball products only through explicit distribution.

## Source and operations

- Tenant UI: `../cms-frontend/src/app/[tenant]/_mayaopickleball/`.
- CSS/assets: `../cms-frontend/src/app/mayaopickleball.css`, `../cms-frontend/public/images/mayaopickleball/`.
- API tenant filter: `mayaopickleball`; revalidation: 60 seconds.
- Frontend runtime: `root@10.10.0.53:/root/websites/cms-frontend`, blue/green ports `3010` and `3011`.
- Proxy: `root@10.10.0.56:/etc/nginx/conf.d/mayaopickleball.vn.conf` → shared `cms_frontend_active` upstream.

For UI changes edit the tenant UI/CSS/assets, test `cms-frontend`, then deploy the
shared frontend. For products, categories, pages, posts, Store Settings or
images, use REST with `mayaopickleball-rest@internal.invalid` and secret
`root@10.10.0.28:/root/sports-cms/mayaopickleball-rest-api.env` (mode `0600`).
Upload images first, keep variations factual, and verify ownership, public URL,
gallery, filters and metadata.
