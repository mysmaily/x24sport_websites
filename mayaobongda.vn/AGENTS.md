# mayaobongda.vn — Website Profile

Read `../AGENTS.md` first.

## Identity and business

- Tenant: `mayaobongda`; domain: `mayaobongda.vn`.
- Role: specialist satellite for football shirts, kits and team uniforms.
- Customers: football teams, clubs, schools, companies, banks and amateur tournaments.
- Core needs: shirt/short kit, team colors, crest, sponsor, player name/number, size and quantity.
- Do not publish basketball, running, badminton, volleyball or pickleball products here.
- X24Sport may carry selected football products only through explicit distribution.

## Source and operations

- Tenant UI: `../cms-frontend/src/app/[tenant]/_mayaobongda/`.
- CSS/assets: `../cms-frontend/src/app/mayaobongda.css`, `mayaobongda-audience.css`, `../cms-frontend/public/images/mayaobongda/`.
- Local production-image workflows remain under this domain folder; they create inputs, not a separate frontend.
- API tenant filter: `mayaobongda`; revalidation: 180 seconds.
- Frontend runtime: `root@10.10.0.53:/root/websites/cms-frontend`, blue/green ports `3010` and `3011`.
- Proxy: `root@10.10.0.56:/etc/nginx/conf.d/mayaobongda.vn.conf` → shared `cms_frontend_active` upstream.

For UI changes edit the tenant UI/CSS/assets, test `cms-frontend`, then deploy the
shared frontend. For products, categories, pages, posts, Store Settings or
images, use REST with `mayaobongda-rest@internal.invalid` and secret
`root@10.10.0.28:/root/sports-cms/mayaobongda-rest-api.env` (mode `0600`).
Preserve intentional root-level product paths. Verify football-only scope,
ownership, path, product gallery and metadata after three minutes.
