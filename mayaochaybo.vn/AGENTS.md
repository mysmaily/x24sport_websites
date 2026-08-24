# mayaochaybo.vn — Website Profile

Read `../AGENTS.md` first.

## Identity and business

- Tenant: `mayaochaybo`; domain: `mayaochaybo.vn`.
- Role: specialist satellite for running shirts and event apparel.
- Customers: running clubs, groups, companies, organizers and race participants.
- Core needs: tee/singlet model, event identity, colors, sponsor/logo placement, size and quantity.
- X24Sport may carry selected running products only through explicit distribution.

## Source and operations

- Tenant UI: `../cms-frontend/src/app/[tenant]/_mayaochaybo/`.
- CSS/assets: `../cms-frontend/src/app/mayaochaybo.css`, `../cms-frontend/public/images/mayaochaybo/`.
- API tenant filter: `mayaochaybo`; revalidation: 300 seconds.
- Frontend runtime: `root@10.10.0.53:/root/websites/cms-frontend`, blue/green ports `3010` and `3011`.
- Proxy: `root@10.10.0.56:/etc/nginx/conf.d/mayaochaybo.vn.conf` → shared `cms_frontend_active` upstream.

For UI changes edit the tenant UI/CSS/assets, test `cms-frontend`, then deploy the
shared frontend. For products, categories, pages, posts, Store Settings or
images, use REST with `mayaochaybo-rest@internal.invalid` and secret
`root@10.10.0.28:/root/sports-cms/mayaochaybo-rest-api.env` (mode `0600`).
Canonical products use `/san-pham/<slug>/`. Verify ownership, running/event
scope, canonical URL, gallery and metadata after five minutes.
