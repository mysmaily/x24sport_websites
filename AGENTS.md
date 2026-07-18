# X24Sport Websites — Coding Agent Guide

## Purpose

This repository is the dedicated workspace for operating the X24Sport
`mayao*.vn` websites. Migrated websites use Next.js tenant frontends backed by
the shared Payload CMS in `cms-api/`; websites without Next.js source remain on
their active WordPress runtime. Coding agents must:

- use infrastructure data only from the website currently in scope;
- make safe, backed-up, verifiable, and reversible changes;
- avoid affecting sibling websites that share servers, proxies, databases, or containers;
- follow the routing mode defined by the website folder name.

## Repository structure

```text
x24sport_websites/
├── AGENTS.md                         # Shared routing, safety, and workflow rules
├── CLAUDE.md                         # Imports AGENTS.md
├── PAYLOAD-REST-API-GUIDE.md         # Shared tenant-safe Payload REST runbook
├── WEBSITE-OPTIMIZATION-GUIDE.md     # Lazily loaded criteria for triggered requests
├── .codex/skills/develop-x24sport-websites/ # Website development skill
├── .codex/skills/migrate-wordpress-to-x24sport-tenant/ # Migration skill
├── cms-api/                         # Shared Payload CMS for Next.js tenants
├── docker-compose.yml               # Shared CMS and tenant frontend services
├── scripts/                         # Registry and operational utilities
└── mayao*.vn/                      # Website-specific source and operations
```

Every `CLAUDE.md` is only a loader. It must not duplicate instructions or website data.

## Shared Payload REST API

For any tenant content operation through the shared Payload REST API, read
`PAYLOAD-REST-API-GUIDE.md` after this file and the target domain's `AGENTS.md`.
The root guide defines the common request, authentication, media, idempotency,
backup, and verification contract. The target profile remains authoritative for
the tenant slug, service-account secret location, frontend cache behavior, and
site-specific restrictions. Never reuse credentials or numeric relationship IDs
between tenants.

## Platform identity and runtime inventory

Every website profile must state its tenant slug near the top of the file and
must include the operational inventory needed to manage that tenant:

- application SSH host and deployed source path;
- Docker Compose project/file and service name, or the exact standalone
  container name and run method;
- container port and published host port;
- proxy SSH host, Nginx config path, and upstream origin;
- shared CMS host, service, and public/internal origins;
- current public cutover state when it differs from the intended platform.

Never infer a Next.js runtime from a WordPress registry block. Verify platform
and runtime values from the source tree, Docker labels/environment, deployed
Compose file, Nginx configuration, and—only for migrated sites—the Payload
tenant API before documenting or using them.

Tenant identities used by this repository are:

| Domain | Payload tenant slug | Status |
|---|---|---|
| `x24sport.vn` | `x24sport` | Active |
| `mayaocaulong.vn` | `mayaocaulong` | Active |
| `mayaobongchuyen.vn` | `mayaobongchuyen` | Active |
| `mayaopickleball.vn` | `mayaopickleball` | Active |
| `mayaobongro.vn` | `mayaobongro` | Active |
| `mayaobongda.vn` | None | Active WordPress website; no Next.js source and no Payload tenant |
| `mayaochaybo.vn` | None | Active WordPress website; no Next.js source and no Payload tenant |

Determine the active platform from the website folder:

- If the folder contains the Next.js application source and the local profile
  documents its deployed runtime, use Next.js + Payload. WordPress information
  for that website is legacy/restore only.
- If the folder does not contain Next.js application source, the website remains
  an active WordPress website. Use its documented WordPress server, containers,
  database, and proxy; do not invent a Payload tenant slug.

Do not infer migration completion from a planned slug, a registry flag, or a
public HTTP 200 response. Migration is established by the presence of the
Next.js source plus its deployed runtime and tenant record.

## Website routing modes

### Managed optimization site: `<domain>/`

A website folder whose name does not start with `_` is a managed optimization site.

For these sites:

1. Read root `AGENTS.md`.
2. Read `<domain>/AGENTS.md`.
3. Check the user's current request for a guide-loading trigger.
4. Load `WEBSITE-OPTIMIZATION-GUIDE.md` only when a trigger matches.
5. If no trigger matches, do not read or apply the guide. Work independently from
   the local profile and perform only the requested task.

Guide-loading triggers are matched case-insensitively against the user's request:

- `SEO`
- `Performance`
- `hiệu năng`
- `đánh giá`

Trigger matching is literal. Do not load the guide merely because a task might
benefit from optimization criteria, resembles previous optimization work, or
could be interpreted as an audit.

| Target/request example | Load guide? |
|------------------------|-------------|
| `example.com`: "Update the homepage button" | No |
| `example.com`: "Fix this PHP error" | No |
| `example.com`: "Review SEO" | Yes |
| `example.com`: "Đánh giá hiệu năng website" | Yes |
| `_example.com`: "Review SEO" | No; isolated mode always wins |

### Isolated site: `_<domain>/`

A website folder whose name starts with `_` is an isolated site.

For these sites:

- read root `AGENTS.md` only for routing, safety, secrets, backup, verification,
  and reporting rules;
- read `_<domain>/AGENTS.md`;
- **do not read, apply, cite, or infer requirements from
  `WEBSITE-OPTIMIZATION-GUIDE.md`;**
- remain within the isolated website folder and the remote resources explicitly
  listed in its local profile;
- do not inspect, compare, read, or modify sibling website folders;
- do not perform unsolicited SEO, performance, security, content, plugin, theme,
  infrastructure, or database audits;
- answer only the question asked;
- perform only the change explicitly requested;
- do not broaden the task into cleanup, refactoring, upgrades, recommendations, or
  preventive work unless the user asks;
- if information or authority is missing, ask one concise question instead of
  borrowing assumptions from another site or the optimization guide.

The underscore changes workflow scope, not safety standards. Backups, least-impact
changes, secret handling, verification, and accurate reporting still apply.

## Context and conflict rules

If the target website is unclear, stop and ask for the domain. Never guess from
the current directory or reuse another site's credentials, paths, cache zone,
database, IDs, or commands.

Instruction priority:

1. The user's latest explicit request.
2. Safety warnings and verified facts in the target website's local `AGENTS.md`.
3. Routing and safety rules in root `AGENTS.md`.
4. For website-development requests, the scoped workflow and quality gates in
   `.codex/skills/develop-x24sport-websites/SKILL.md`.
5. For WordPress-to-Next.js/Payload migrations, the URL, data, cutover, and
   rollback gates in
   `.codex/skills/migrate-wordpress-to-x24sport-tenant/SKILL.md`.
6. For a managed site with a matching guide trigger only, criteria in
   `WEBSITE-OPTIMIZATION-GUIDE.md`.

Guide values are placeholders unless the target website profile confirms them.

## Required website development skill

For any `mayao*.vn` request that builds, redesigns, extends, or reviews public
UI/UX, navigation, page templates, product or category experiences, content
architecture, technical or on-page SEO, structured data, accessibility,
responsive behavior, Core Web Vitals, or production readiness, load and follow:

```text
.codex/skills/develop-x24sport-websites/SKILL.md
```

Use the skill after reading this file and the target website's `AGENTS.md`, and
before designing or implementing the change. Load only the skill references
routed by `SKILL.md`.

- The skill complements the target website profile; it does not override
  site-specific safety, access, backup, cache, deployment, or rollback rules.
- Apply only quality gates relevant to the user's exact scope. The skill does not
  authorize an unsolicited full-site audit or cross-site rollout.
- When a request also matches an optimization-guide trigger, use both the skill
  and `WEBSITE-OPTIMIZATION-GUIDE.md`. Prefer current official Google Search
  Central or web.dev documentation for changeable Google requirements, while
  preserving the instruction priority and site-specific facts defined here.
- Distinguish Google requirements, Google recommendations, and project quality
  gates. Never promise ranking, indexing, rich results, conversion improvement,
  or Core Web Vitals success without corresponding evidence.
- Do not apply the skill to product-image generation or catalog migration alone
  unless the request also changes a public website experience, content, or SEO.

## Required WordPress migration skill

For any request that migrates a `mayao*.vn` WordPress website to the shared
Next.js and Payload CMS platform, load and follow:

```text
.codex/skills/migrate-wordpress-to-x24sport-tenant/SKILL.md
```

Use it together with `develop-x24sport-websites` when the migration includes the
public frontend. The migration skill is authoritative for URL preservation,
tenant-scoped identity, source-data reconciliation, cutover, and rollback.

- Preserve the complete public path and query contract, not only product slug
  strings. A same-domain platform migration should serve unchanged URLs directly
  whenever the route can be reproduced.
- Do not delete, overwrite, or expose the WordPress source during migration.
- Do not perform production import or traffic cutover without the phase-specific
  backup, validation, and rollback gates defined by the skill.

## Shared execution workflow

For managed requests without a guide trigger and for all isolated-site requests,
perform only the parts required to complete and verify the exact request. Do not
expand the task into an optimization audit.

### 1. Establish scope and baseline

- Confirm the website, environment, and requested outcome.
- Check relevant files, configuration, plugins, themes, database records, and services.
- Record current behavior with appropriate evidence.
- Find existing implementations before adding hooks, functions, selectors,
  plugins, cache rules, or schema.

### 2. Assess risk

- Identify shared resources and possible cross-site impact.
- Prefer the smallest change that solves the requested problem.
- Do not restart a shared service when a reload or site-local action is sufficient.
- Do not perform destructive bulk updates or change credentials, DNS, SSL,
  firewall, or billing without explicit authorization.

### 3. Back up before mutation

- Back up each file or configuration that will change while preserving ownership
  and permissions.
- Export the exact affected database tables or records.
- Record the backup path and timestamp.
- Do not overwrite older backups until the new backup is verified.

### 4. Implement

- Replace placeholders only with data verified in the target website profile.
- Keep changes idempotent where practical.
- Do not edit WordPress core or a parent theme when a child theme, site-specific
  plugin, or operational configuration can solve the issue.
- Store credentials only in the local profile or an approved secret store. Never
  copy secrets into code, logs, or summaries.
- Implement and verify multi-part work incrementally.

### 5. Cache and services

- Use only cache-clearing commands documented by the target website.
- Reload or restart services only when required.
- State the impact before touching a shared resource.

### 6. Verify

Use checks proportional to the change. At minimum, consider:

- syntax or configuration validation before reload;
- HTTP status, redirects, HTTPS, and affected pages or functions;
- browser console and relevant server, PHP, and Nginx logs;
- desktop and mobile behavior for interface changes;
- cache headers and cache status for performance changes;
- canonical, robots, sitemap, metadata, and structured data for SEO changes;
- cart, checkout, login, forms, and admin flows when relevant.

Do not claim completion merely because an edit command succeeded. Completion
requires fresh post-change evidence.

## Using the optimization guide

This section applies only when both conditions are true:

1. The target is a managed optimization site.
2. The current user request contains at least one configured guide-loading trigger.

Otherwise, do not open, read, cite, or apply the guide.

- Treat the guide as a checklist and solution library, not a script to run blindly.
- Compare each module with the site's actual stack and configuration.
- Skip non-applicable items and state why.
- Prioritize availability and security, technical SEO, Core Web Vitals, cache/CDN,
  on-page SEO, then minor tuning.
- Do not install a plugin or add a snippet when equivalent functionality exists.
- Verify both origin and public responses for Cloudflare, R2, SSL, and cache changes.

## Result reporting

The handoff must state:

- target website and completed scope;
- changed files, configuration, or database records;
- backups created;
- verification commands and observed results;
- cache or services touched;
- skipped work, remaining risk, or manual follow-up.

Never display passwords, API keys, access keys, secret keys, or other sensitive values.

## Central website registry

Website profiles are synchronized from the central PostgreSQL registry:

- local connection: `.website-registry.env` (git-ignored, mode `0600`);
- safe template: `.website-registry.env.example`;
- synchronization utility: `scripts/website_registry.rb`.

Do not run unscoped batch synchronization in this repository because it can
create profiles for websites outside the X24Sport `mayao*.vn` scope.

Refresh or create only one website folder, regardless of the batch WordPress
filter:

```bash
ruby scripts/website_registry.rb sync domain=<domain>
```

The utility writes only approved non-secret fields and credential-availability
flags between `WEBSITE_REGISTRY_START` and `WEBSITE_REGISTRY_END` markers. It
preserves local notes outside the markers. If `_<domain>/` exists, synchronization
updates that isolated folder instead of recreating `<domain>/`.

Retrieve a Cloudflare API token only when an explicit task requires it:

```bash
cd <domain>
ruby ../scripts/website_registry.rb cloudflare-token <domain>
```

The command returns the token at runtime. Never write its output to documentation,
source files, logs, commits, shell history, or handoff messages.

## Adding a website

### Managed optimization site

1. Create `<domain>/`.
2. Create `<domain>/AGENTS.md` with the website profile.
3. Create `<domain>/CLAUDE.md` containing only `@AGENTS.md`.
4. Verify all access and operational data.

### Isolated site

1. Create `_<domain>/`.
2. Create `_<domain>/AGENTS.md` with the website profile and local constraints.
3. Create `_<domain>/CLAUDE.md` containing only `@AGENTS.md`.
4. Do not copy or reference `WEBSITE-OPTIMIZATION-GUIDE.md`.

Every profile should contain only site-specific information:

- WordPress, PHP, web server, and theme overview;
- SSH, proxy, credentials or credential source, and access scope;
- database host, name, user, password, and table prefix;
- site root, Nginx configuration, logs, and backup paths;
- containers, services, and shared-resource impact;
- cache, CDN, SSL, and site-specific cache-clearing commands;
- important plugins, themes, and integrations;
- warnings, exceptions, and cross-site risks;
- site-specific validation, reload, and rollback commands.

Managed profile header:

```markdown
# example.com — Managed Website Profile

> Scope: This file contains only data and runbooks specific to `example.com`.
> Shared workflow is defined in `../AGENTS.md`. Optimization criteria are available
> in `../WEBSITE-OPTIMIZATION-GUIDE.md` only when the current request matches a
> guide-loading trigger defined by the root instructions.
```

Isolated profile header:

```markdown
# _example.com — Isolated Website Profile

> Scope: This website uses isolated mode. Read `../AGENTS.md` for routing and
> safety, then use only this local profile. Do not apply
> `../WEBSITE-OPTIMIZATION-GUIDE.md`.
```
