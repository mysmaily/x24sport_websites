# mayaodongphuc.com.vn — Website Profile

Read `../AGENTS.md` first.

## Identity and business

- Tenant: `mayaodongphuc`; canonical domain: `mayaodongphuc.com.vn`.
- Role: specialist website for made-to-order uniforms, led by three primary
  commercial and search segments in this order: companies/businesses first,
  then class/school groups, followed by outdoor/team-building groups.
- F&B, light workwear, healthcare/services and other industry uniforms are
  secondary supporting segments. They must not displace the three primary
  segments in homepage positioning, primary navigation or keyword ownership.
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
- The approved V2 design now lives only in the production tenant override; V1/V2/V3 preview routes and trial design-system documents are intentionally removed after selection.
- Assets: `../cms-frontend/public/images/mayaodongphuc/`.
- CMS/API: `https://cms.x24sport.vn/api`; tenant filter `mayaodongphuc`; revalidation: 180 seconds.
- Frontend runtime: `root@10.10.0.58:/root/websites/cms-frontend`, container `cms-frontend:3010`.
- Proxy target: `root@10.10.0.56:/etc/nginx/conf.d/mayaodongphuc.com.vn.conf` → `10.10.0.58:3010`.
- TLS: Let's Encrypt certificate at `/etc/letsencrypt/live/mayaodongphuc.com.vn/`, covering apex and `www`; HTTP and `www` redirect to the canonical HTTPS apex domain. Renewal is managed by Certbot.

REST service account contract:

- User: `mayaodongphuc-rest@internal.invalid`, role `tenant_admin`.
- Secret: `root@10.10.0.28:/root/sports-cms/mayaodongphuc-rest-api.env`, mode `0600`.
- Allowed scope: this tenant's categories, products, media, pages/posts and Store Settings.

Planning and business references:

- `README.md` is the folder entry point and initialization status.
- `research/market-keywords-operations-2026-08-20.md` defines the market,
  buyer, competitor and keyword hypotheses. It intentionally does not invent
  search volume or keyword difficulty.
- `BUSINESS-OPERATIONS.md` defines the quote-ready brief, approval gates,
  spec/version control, QC, delivery and reorder contract.
- `SITE-ARCHITECTURE.md` defines the target URL ownership and internal-link
  roadmap. Proposed routes are not public requirements until implemented and
  validated.
- `content-strategy/` contains the current editorial plan and article batches.

Do not publish a fixed price, MOQ, delivery promise, warranty, material
performance claim or compliance claim unless it has a named internal owner,
current evidence, conditions of use and an approval/review date. Competitor
prices and lead times are research inputs only, never Mayaodongphuc terms.

The consultation form renders only after this tenant's Store Settings has a
verified `telegramChatId`. Do not borrow a sibling tenant's phone, Zalo, address,
analytics ID or Telegram destination. Verify canonical URLs, product gallery,
metadata, sitemap, robots, public host routing and sibling isolation after every
production batch.
