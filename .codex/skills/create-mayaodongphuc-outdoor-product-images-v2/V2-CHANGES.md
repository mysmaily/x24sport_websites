# V2 optimization notes
- Two image generations by default: main + catalog. No intermediate Version B.
- Main/catalog independent and may run in parallel.
- Benchmark PNGs troubleshooting-only.
- Marketing typography/contact moved to deterministic composition.
- One QA pass; max one visual correction per output.
- Hard failures limited to material defects; soft preferences never trigger retries.
- Handoff generated from initial garment lock; no redundant visual re-analysis.
- SHA-256 + validator retained.
- Runtime instructions substantially deduplicated.
