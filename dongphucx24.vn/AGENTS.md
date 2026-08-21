# dongphucx24.vn — Website Profile

Read `../AGENTS.md` first.

## Identity and business

- Tenant slug: `dongphucx24`; canonical domain: `dongphucx24.vn`.
- Brand display name: Đồng Phục X24.
- Role: specialist tenant for made-to-order uniforms for companies, F&B, schools, events/team building, light workwear, healthcare and service teams.
- Primary journey: browse by working context, choose a representative sample, then request configuration and quotation guidance.
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
- CMS tenant, Store Settings, REST service account, DNS, proxy, TLS, analytics and external contact channels are not provisioned in the local-review phase.
- Do not publish or deploy until these prerequisites are created and verified through the shared runbooks.

The local demo uses a bounded representative catalog and public reference media from the approved Mayaodongphuc product source. Before production population, explicitly authorize media sharing through `sharedWithTenants` and create tenant-scoped product records idempotently; never duplicate or silently reassign sibling media.
