#!/usr/bin/env python3
"""Compare immutable WordPress snapshots with migrated Payload tenant records."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

import requests

from migrate_wordpress_tenant import normalize_record


def read_jsonl(path: Path) -> list[dict[str, Any]]:
    with path.open(encoding="utf-8") as handle:
        return [json.loads(line) for line in handle if line.strip()]


def get_all(base_url: str, collection: str, tenant_id: int) -> list[dict[str, Any]]:
    records: list[dict[str, Any]] = []
    page = 1
    while True:
        response = requests.get(
            f"{base_url.rstrip('/')}/api/{collection}",
            params={
                "where[tenant][equals]": tenant_id,
                "where[sourceSystem][equals]": "wordpress",
                "limit": 100,
                "page": page,
                "depth": 0,
            },
            timeout=60,
        )
        response.raise_for_status()
        payload = response.json()
        records.extend(payload.get("docs", []))
        if not payload.get("hasNextPage"):
            return records
        page += 1


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("snapshot_dir", type=Path)
    parser.add_argument("--cms-api", default="http://10.10.0.28:3001")
    parser.add_argument("--tenant-slug", default="mayaobongro")
    args = parser.parse_args()

    response = requests.get(
        f"{args.cms_api.rstrip('/')}/api/tenants",
        params={"where[slug][equals]": args.tenant_slug, "limit": 1, "depth": 0},
        timeout=30,
    )
    response.raise_for_status()
    tenants = response.json().get("docs", [])
    if len(tenants) != 1:
        raise SystemExit(f"Expected exactly one tenant named {args.tenant_slug}")
    tenant_id = tenants[0]["id"]

    expected_products: dict[str, dict[str, Any]] = {}
    expected_content: dict[str, dict[str, Any]] = {}
    for content_type in ("product", "page", "post"):
        records = read_jsonl(args.snapshot_dir / f"wordpress-{content_type}.jsonl")
        for record in records:
            normalized, _ = normalize_record(record, content_type)
            if content_type == "page" and normalized["legacyPath"] == "/":
                continue
            target = expected_products if content_type == "product" else expected_content
            target[normalized["sourceId"]] = normalized

    actual_products = {
        str(record["sourceId"]): record for record in get_all(args.cms_api, "products", tenant_id)
    }
    actual_content = {
        str(record["sourceId"]): record
        for record in get_all(args.cms_api, "web-content", tenant_id)
    }

    failures: list[str] = []
    for label, expected, actual in (
        ("products", expected_products, actual_products),
        ("web-content", expected_content, actual_content),
    ):
        missing = sorted(set(expected) - set(actual))
        extra = sorted(set(actual) - set(expected))
        mismatched = sorted(
            source_id
            for source_id in set(expected) & set(actual)
            if expected[source_id]["sourceChecksum"] != actual[source_id].get("sourceChecksum")
            or expected[source_id]["slug"] != actual[source_id].get("slug")
            or expected[source_id]["legacyPath"] != actual[source_id].get("legacyPath")
        )
        print(
            f"{label}: expected={len(expected)} actual={len(actual)} "
            f"missing={len(missing)} extra={len(extra)} mismatched={len(mismatched)}"
        )
        if missing:
            failures.append(f"{label} missing source IDs: {missing[:20]}")
        if extra:
            failures.append(f"{label} extra source IDs: {extra[:20]}")
        if mismatched:
            failures.append(f"{label} mismatched source IDs: {mismatched[:20]}")

    for failure in failures:
        print(f"FAIL {failure}")
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
