---
name: web-design-guidelines
description: Review UI code for Web Interface Guidelines compliance. Use for UI, UX, accessibility, responsive behavior, interaction states, forms, media, performance-sensitive UI, or visual QA reviews.
metadata:
  author: vercel
  version: "1.0.0"
  argument-hint: <file-or-pattern>
---

# Web Interface Guidelines

Review changed UI files against the bundled Web Interface Guidelines before a
customer-facing UI change is called complete.

## Load Rules

1. Read `references/web-interface-guidelines.md`.
2. If internet access is available and the user explicitly asks for the latest
   guideline version, recheck the upstream source and apply the newer rule when
   it does not conflict with repository instructions:
   `https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md`
3. Read the specified files or patterns. If no files are specified, infer the
   changed UI files from the current task or ask for the target files.

## Review Output

Use the output format in the bundled reference:

```text
## path/to/File.tsx

path/to/File.tsx:42 - concise finding
```

Report `pass` only for files you actually inspected. Prioritize actionable UI,
accessibility, state, responsive, media, performance, and copy defects. For this
starter kit, also flag customer-facing text that exposes CMS, AI, SEO, QA,
staging, route, or developer-process language unless the user explicitly asked
for that wording.
