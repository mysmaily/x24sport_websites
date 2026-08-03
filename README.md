# X24Sport Websites

Dynamic multi-tenant commerce platform for X24Sport, RynoSport and the specialist
`mayao*.vn` satellite websites.

- Shared Next.js storefront: `cms-frontend/`
- Shared Payload CMS/API: `cms-api/`
- Shared agent and business rules: `AGENTS.md`
- Per-domain profiles: `<domain>/AGENTS.md`
- Production deployment: `PRODUCTION-DEPLOYMENT-RUNBOOK.md`
- Product/media/content operations: `PAYLOAD-REST-API-GUIDE.md`

Tenant/domain resolution is database-driven. Creating a Payload tenant and its
domain record makes the generic storefront resolvable once DNS/Nginx routes the
domain to the shared frontend. Existing tenants may keep slug-specific visual
overrides under `cms-frontend/src/app/[tenant]/_<slug>/`.
