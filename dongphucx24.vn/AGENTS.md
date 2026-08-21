# dongphucx24.vn — Website Profile

Read `../AGENTS.md` first.

## Identity and business

- Tenant slug: `dongphucx24`; canonical domain: `dongphucx24.vn`.
- Brand display name: Đồng Phục X24.
- Role: market-facing specialist for made-to-order uniforms for companies, F&B,
  schools, events/team building, light workwear, healthcare and service teams.
- Primary journey: browse by working context, choose a representative sample,
  learn the trade-offs, then prepare a quote-ready request.
- This tenant owns the broad market, buyer-intent, category, sample-discovery
  and editorial direction previously researched for Mayaodongphuc. It does not
  make unverified factory-capacity, MOQ, lead-time, warranty or compliance
  claims; those are confirmed only against the responsible workshop.
- Public prices remain quote-only until pricing rules and commercial terms have a named owner and current approval.

## Brand and customer experience

- Direction: “X24 Uniform Studio” — bright, compact, product-rich and operationally clear.
- Primary color: `#fe590d`; ink `#17202a`; warm canvas `#fffdfa`; soft surface `#f6f3ef`.
- Brand accent is used for actions and wayfinding, not as an all-over orange wash.
- Product imagery prioritizes garment construction, credible Vietnamese people and real usage contexts.
- Avoid oversized routine shopping typography, generic gradient landing-page treatments, fabricated proof, and copied visual signatures from sibling tenants.

## Local review and operations

- Tenant UI: `../cms-frontend/src/app/[tenant]/_dongphucx24/`.
- Assets: `../cms-frontend/public/images/dongphucx24/`.
- Local review host: `http://dongphucx24.localhost:3010/`.
- Public CMS/API: `https://cms.x24sport.vn/api`; intended tenant filter: `dongphucx24`.
- Production tenant, Store Settings and the dedicated `tenant_admin` REST account are provisioned; the mode-`0600` credential file is `/root/sports-cms/dongphucx24-rest-api.env` on `10.10.0.28`.
- Cloudflare DNS/proxy, the version-controlled Nginx vhost and Let's Encrypt TLS for apex plus `www` are provisioned. The apex domain is canonical and `www` redirects to it.
- Analytics and external contact channels remain unset until verified business-owned values are supplied; do not fabricate or borrow them from another tenant.

Content direction and business references:

- `CONTENT-DIRECTION.md` is the current market-facing content brief: buyers,
  category ownership, editorial clusters and claim boundaries.
- Mayaodongphuc is the workshop counterpart. Its production process can inform
  quote preparation, but its public wording, internal contacts and tenant data
  must never be copied into this tenant.

The storefront uses a bounded representative catalog and public reference media from the approved Mayaodongphuc product source. Before CMS-backed production population, explicitly authorize media sharing through `sharedWithTenants` and create tenant-scoped product records idempotently; never duplicate or silently reassign sibling media.
