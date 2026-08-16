# mayaodongphuc.com.vn — Website Profile

Read `../AGENTS.md` first.

## Identity and business

- Tenant: `mayaodongphuc`; canonical domain: `mayaodongphuc.com.vn`.
- Role: specialist website for made-to-order uniforms across companies, F&B, schools, light workwear, healthcare/services and events/teams.
- Customers: organizations and teams that need a coherent uniform system rather than one-off retail garments.
- Primary journey: browse by working context, review a starting design, then request a configuration and quotation.
- Public prices are not assumed. Products use a quotation state until verified pricing and commercial terms are supplied.
- Do not publish sports-team catalog items from sibling tenants here unless the user explicitly approves distribution.

## Brand and customer experience

- Approved visual direction: V2 “Uniform OS”.
- Palette: charcoal `#1c1917`, stone neutrals, canvas `#fafaf9`, ochre accent `#a16207`.
- Typography: Be Vietnam Pro headings and Noto Sans body copy.
- Experience: compact enterprise gateway, high-density bento composition, clear configuration language and restrained motion.
- Avoid copying the visual signatures, navigation or sport taxonomy of the existing portfolio tenants.
- Product imagery and initial catalog records under source system `mayaodongphuc-v2-launch` are approved starting compositions; exact commercial claims remain quote-only.

## Source and operations

- Tenant UI: `../cms-frontend/src/app/[tenant]/_mayaodongphuc/`.
- Approved previews retained at `../cms-frontend/src/app/mayaodongphuc-preview-v2/` and `../cms-frontend/src/app/mayaodongphuc-preview-v3/`.
- Assets: `../cms-frontend/public/images/mayaodongphuc/`.
- CMS/API: `https://cms.x24sport.vn/api`; tenant filter `mayaodongphuc`; revalidation: 180 seconds.
- Frontend runtime: `root@10.10.0.58:/root/websites/cms-frontend`, container `cms-frontend:3010`.
- Proxy target: `root@10.10.0.56:/etc/nginx/conf.d/mayaodongphuc.com.vn.conf` → `10.10.0.58:3010`.

REST service account contract:

- User: `mayaodongphuc-rest@internal.invalid`, role `tenant_admin`.
- Secret: `root@10.10.0.28:/root/sports-cms/mayaodongphuc-rest-api.env`, mode `0600`.
- Allowed scope: this tenant's categories, products, media, pages/posts and Store Settings.

The consultation form renders only after this tenant's Store Settings has a
verified `telegramChatId`. Do not borrow a sibling tenant's phone, Zalo, address,
analytics ID or Telegram destination. Verify canonical URLs, product gallery,
metadata, sitemap, robots, public host routing and sibling isolation after every
production batch.
