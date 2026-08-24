# mayaobongchuyen.vn — Website Profile

Read `../AGENTS.md` first.

## Identity and business

- Tenant: `mayaobongchuyen`; domain: `mayaobongchuyen.vn`.
- Role: specialist satellite for volleyball uniforms.
- Customers: volleyball clubs, schools, companies, teams and tournaments.
- Core needs: team model, colors, logo, names/numbers, fit, size and quantity.
- X24Sport may carry selected volleyball products only through explicit distribution.

## Source and operations

- Tenant UI: `../cms-frontend/src/app/[tenant]/_mayaobongchuyen/`.
- CSS/assets: `../cms-frontend/src/app/mayaobongchuyen.css`, `../cms-frontend/public/images/mayaobongchuyen/`.
- API tenant filter: `mayaobongchuyen`; current content fetch policy: `no-store`.
- Frontend runtime: `root@10.10.0.53:/root/websites/cms-frontend`, blue/green ports `3010` and `3011`.
- Proxy: `root@10.10.0.56:/etc/nginx/conf.d/mayaobongchuyen.vn.conf` → shared `cms_frontend_active` upstream.

For UI changes edit the tenant UI/CSS/assets, test `cms-frontend`, then deploy the
shared frontend. For products, categories, pages, posts, Store Settings or
images, use REST with `mayaobongchuyen-rest@internal.invalid` and secret
`root@10.10.0.28:/root/sports-cms/mayaobongchuyen-rest-api.env` (mode `0600`).
Content should be visible on the next fresh request; verify tenant ownership,
volleyball scope, product URL, gallery and metadata.
