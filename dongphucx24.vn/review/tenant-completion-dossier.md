# Dongphucx24 launch dossier

## Identity

- Domain: `dongphucx24.vn`
- Tenant slug: `dongphucx24`
- Classification: new
- Business role: made-to-order uniforms for companies, F&B, schools, events/team building, light workwear, healthcare and service teams
- Primary audiences: business owners, HR/procurement, class and club representatives, event organizers
- Primary conversion: choose a representative sample, then request configuration and quotation guidance
- Production mutation authorized: yes; deployment requested on 2026-08-21

## Decisions

| Topic | Decision | Status |
|---|---|---|
| Visual direction | “X24 Uniform Studio”: bright, compact, product-rich, orange `#fe590d` as action/wayfinding accent | implemented locally |
| Public pricing | Quote-only; no price, MOQ or lead-time claims | implemented |
| Product source | Bounded representative catalog based on the approved Mayaodongphuc source | implemented locally |
| Media ownership | The approved storefront uses public reference media; future CMS-backed products require explicit `sharedWithTenants` authorization | storefront ready; CMS population deferred |
| Consultation | Render the form only when this tenant has a verified `telegramChatId` | implemented; currently hidden |
| Programmatic SEO | Deferred; no location or combinatorial landing pages until unique data, demand and service facts exist | approved local decision |

## Taxonomy and inventory

| Node | URL | Purpose | Index policy | Local status |
|---|---|---|---|---|
| Home | `/` | Positioning, discovery, catalog preview, process | indexable after launch | implemented |
| Catalog | `/san-pham/` | Browse all representative samples | indexable after launch | implemented |
| Company uniforms | `/danh-muc/dong-phuc-cong-ty/` | Office, showroom and service teams | indexable after launch | implemented |
| F&B uniforms | `/danh-muc/dong-phuc-nha-hang-fnb/` | Cafe, restaurant, bakery and kitchen roles | indexable after launch | implemented |
| School/class uniforms | `/danh-muc/ao-lop-truong-hoc/` | Classes, clubs and education centers | indexable after launch | implemented |
| Team building/events | `/danh-muc/team-building-su-kien/` | Outing and event apparel | indexable after launch | implemented |
| Workwear | `/danh-muc/dong-phuc-bao-ho-ky-thuat/` | Light workwear discovery | draft until populated |
| Healthcare/services | `/danh-muc/dong-phuc-y-te-dich-vu/` | Clinic, spa and service roles | draft until populated |
| Product detail | `/san-pham/{slug}/` | Sample configuration and next action | indexable only after CMS ownership/media review | implemented locally |

## Validation status

- TypeScript: verified
- Production build: verified after the final visual-density, icon and radius fixes
- Browser: homepage, catalog and product checked at 390×844 and 1440×900
- Tenant isolation: contact fallback leak found and fixed; no quick-contact widget or consultation form renders without tenant settings
- CMS tenant, Store Settings and scoped REST service account: created and API-verified
- CMS products and media sharing: deferred; the approved storefront catalog remains quote-only and code-backed
- DNS/Cloudflare proxy: provisioned by the domain owner
- Nginx: dedicated apex/`www` vhost installed and configuration test passed
- TLS: Let's Encrypt certificate issued for apex and `www`; expiry 2026-11-19 with automatic renewal enabled
- Analytics and external contact channels: intentionally unset pending verified business-owned values
- Shared frontend: deployed with image `sha256:ccad6351c2f850132bc6bf3813d6e82520a93553e872018562591b9e63d34cac`; container reported `running healthy`
- Public verification: homepage, catalog, company category, representative product, robots and sitemap returned 200; `www` returned 301 to apex
- Responsive production review: passed at 1440×900 and 390×844 with no horizontal overflow, visible broken images or browser console warnings/errors
- Sibling verification: all ten shared storefront domains in the production runbook returned 200 after replacement
- Commit, push and production launch: completed on 2026-08-21
