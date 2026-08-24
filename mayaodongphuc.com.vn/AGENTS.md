# mayaodongphuc.com.vn — Website Profile

Read `../AGENTS.md` first.

## Identity and business

- Tenant: `mayaodongphuc`; canonical domain: `mayaodongphuc.com.vn`.
- Role: direct workshop for made-to-order uniforms. The public story starts
  with receiving a brief, developing the specification and sample, producing,
  checking and handing over the agreed order.
- Customers: organizations and teams that need a manufacturing partner and a
  coherent uniform system, rather than one-off retail garments.
- Primary journey: send a production brief, align the specification and sample,
  confirm sizes and quantity, then follow the order through QC and handover.
- Company, school, event, F&B, service and light-workwear requirements remain
  valid production contexts. They are not competing search verticals here;
  `dongphucx24.vn` owns market-facing discovery and solution content.
- Public prices are not assumed. Products use a quotation state until verified pricing and commercial terms are supplied.
- Do not publish sports-team catalog items from sibling tenants here unless the user explicitly approves distribution.

## Brand and customer experience

- Approved visual direction: V2 “Uniform Workshop”.
- Palette: charcoal `#1c1917`, stone neutrals, canvas `#fafaf9`, ochre accent `#a16207`.
- Typography: Be Vietnam Pro headings and Noto Sans body copy.
- Experience: compact workshop gateway, high-density bento composition, clear
  production-stage language and restrained motion.
- Avoid copying the visual signatures, navigation or sport taxonomy of the existing portfolio tenants.
- Product imagery and initial catalog records under source system `mayaodongphuc-v2-launch` are approved starting compositions; exact commercial claims remain quote-only.

## Source and operations

- Tenant UI: `../cms-frontend/src/app/[tenant]/_mayaodongphuc/`.
- The approved V2 design now lives only in the production tenant override; V1/V2/V3 preview routes and trial design-system documents are intentionally removed after selection.
- Assets: `../cms-frontend/public/images/mayaodongphuc/`.
- CMS/API: `https://cms.x24sport.vn/api`; tenant filter `mayaodongphuc`; revalidation: 180 seconds.
- Frontend runtime: `root@10.10.0.53:/root/websites/cms-frontend`, blue/green ports `3010` and `3011`.
- Proxy target: `root@10.10.0.56:/etc/nginx/conf.d/mayaodongphuc.com.vn.conf` → shared `cms_frontend_active` upstream.
- TLS: Let's Encrypt certificate at `/etc/letsencrypt/live/mayaodongphuc.com.vn/`, covering apex and `www`; HTTP and `www` redirect to the canonical HTTPS apex domain. Renewal is managed by Certbot.

REST service account contract:

- User: `mayaodongphuc-rest@internal.invalid`, role `tenant_admin`.
- Secret: `root@10.10.0.28:/root/sports-cms/mayaodongphuc-rest-api.env`, mode `0600`.
- Allowed scope: this tenant's categories, products, media, pages/posts and Store Settings.

Planning and business references:

- `README.md` is the folder entry point and initialization status.
- `research/market-keywords-operations-2026-08-20.md` is retained as a
  historical research input. Market-facing keyword and editorial decisions now
  belong to `dongphucx24.vn`; do not use this file to reposition the workshop.
- `BUSINESS-OPERATIONS.md` defines the quote-ready brief, approval gates,
  spec/version control, QC, delivery and reorder contract.
- `SITE-ARCHITECTURE.md` defines the target URL ownership and internal-link
  roadmap. Proposed routes are not public requirements until implemented and
  validated.
- `content-strategy/` is legacy planning material. New Maya content must help a
  buyer prepare a production brief, understand approval/QC handoffs, or manage
  a reorder; broad market-discovery content belongs to `dongphucx24.vn`.

Do not publish a fixed price, MOQ, delivery promise, warranty, material
performance claim or compliance claim unless it has a named internal owner,
current evidence, conditions of use and an approval/review date. Competitor
prices and lead times are research inputs only, never Mayaodongphuc terms.

The consultation form renders only after this tenant's Store Settings has a
verified `telegramChatId`. Do not borrow a sibling tenant's phone, Zalo, address,
analytics ID or Telegram destination. Verify canonical URLs, product gallery,
metadata, sitemap, robots, public host routing and sibling isolation after every
production batch.
