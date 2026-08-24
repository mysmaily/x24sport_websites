# mayaobongro.vn — Website Profile

Read `../AGENTS.md` first.

## Identity and business

- Tenant: `mayaobongro`; domain: `mayaobongro.vn`.
- Role: specialist satellite for basketball uniforms.
- Customers: clubs, school teams, companies, leagues and youth/adult teams.
- Core needs: jersey/short set, team colors, logo, player name/number, fit, size and quantity.
- X24Sport may carry selected basketball products only through explicit distribution.

## Source and operations

- Tenant UI: `../cms-frontend/src/app/[tenant]/_mayaobongro/`.
- CSS/assets: `../cms-frontend/src/app/mayaobongro.css`, `../cms-frontend/public/images/mayaobongro/`.
- API tenant filter: `mayaobongro`; revalidation: 300 seconds.
- Frontend runtime: `root@10.10.0.53:/root/websites/cms-frontend`, blue/green ports `3010` and `3011`.
- Proxy: `root@10.10.0.56:/etc/nginx/conf.d/mayaobongro.vn.conf` → shared `cms_frontend_active` upstream.

For UI changes edit the tenant UI/CSS/assets, test `cms-frontend`, then deploy the
shared frontend. For products, categories, pages, posts, Store Settings or
images, use REST with `mayaobongro-rest@internal.invalid` and secret
`root@10.10.0.28:/root/sports-cms/mayaobongro-rest-api.env` (mode `0600`).
Preserve intentional root-level product paths where present. Verify ownership,
basketball scope, public path, gallery and metadata after five minutes.
