#!/usr/bin/env python3
"""Reconcile mayaobongro WooCommerce product galleries into Payload legacyImages."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

import requests


def read_credentials(path: Path) -> tuple[str, str]:
    values: dict[str, str] = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        values[key.strip().lower()] = value.strip()
    email = values.get("email")
    password = values.get("password")
    if not email or not password:
        raise RuntimeError("Credential file must contain Email and Password entries")
    return email, password


def load_source(path: Path) -> dict[str, dict[str, Any]]:
    records: dict[str, dict[str, Any]] = {}
    for line_number, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        if not line.strip():
            continue
        record = json.loads(line)
        source_id = str(record["sourceId"])
        if source_id in records:
            raise RuntimeError(f"Duplicate sourceId {source_id} on line {line_number}")
        images = record.get("images") or []
        if not images:
            raise RuntimeError(f"Source product {source_id} has no images")
        records[source_id] = record
    return records


def fetch_all(session: requests.Session, url: str, params: dict[str, Any]) -> list[dict[str, Any]]:
    records: list[dict[str, Any]] = []
    page = 1
    while True:
        response = session.get(url, params={**params, "page": page, "limit": 100}, timeout=30)
        response.raise_for_status()
        payload = response.json()
        records.extend(payload["docs"])
        if not payload.get("hasNextPage"):
            return records
        page += 1


def normalized_images(images: list[dict[str, Any]] | None) -> list[dict[str, Any]]:
    return [
        {
            "url": image["url"],
            "alt": image.get("alt") or None,
            "width": image.get("width") or None,
            "height": image.get("height") or None,
        }
        for image in (images or [])
    ]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--backup", type=Path, required=True)
    parser.add_argument("--credentials", type=Path, required=True)
    parser.add_argument("--cms-api", default="http://127.0.0.1:3001")
    parser.add_argument("--tenant", default="mayaobongro")
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()

    source = load_source(args.source)
    email, password = read_credentials(args.credentials)
    session = requests.Session()
    session.headers.update({"Accept": "application/json"})
    login = session.post(
        f"{args.cms_api}/api/users/login",
        json={"email": email, "password": password},
        timeout=30,
    )
    login.raise_for_status()
    session.headers["Authorization"] = f"Bearer {login.json()['token']}"

    tenants = fetch_all(
        session,
        f"{args.cms_api}/api/tenants",
        {"where[slug][equals]": args.tenant, "depth": 0},
    )
    if len(tenants) != 1:
        raise RuntimeError(f"Expected one tenant named {args.tenant}, found {len(tenants)}")
    tenant_id = tenants[0]["id"]
    target = fetch_all(
        session,
        f"{args.cms_api}/api/products",
        {
            "where[and][0][tenant][equals]": tenant_id,
            "where[and][1][publicationStatus][equals]": "publish",
            "depth": 0,
        },
    )
    target_by_source = {str(record.get("sourceId")): record for record in target}
    if set(source) != set(target_by_source):
        missing_target = sorted(set(source) - set(target_by_source))
        missing_source = sorted(set(target_by_source) - set(source))
        raise RuntimeError(
            f"Source/target IDs differ; missing target={missing_target[:10]}, "
            f"missing source={missing_source[:10]}"
        )

    mismatched_slugs = [
        source_id
        for source_id, record in source.items()
        if record["slug"] != target_by_source[source_id]["slug"]
    ]
    if mismatched_slugs:
        raise RuntimeError(f"Slug mismatch for source IDs: {mismatched_slugs[:10]}")

    args.backup.parent.mkdir(parents=True, exist_ok=True)
    with args.backup.open("w", encoding="utf-8") as handle:
        for record in sorted(target, key=lambda item: int(item["sourceId"])):
            handle.write(json.dumps(record, ensure_ascii=False, sort_keys=True) + "\n")

    changes = []
    for source_id, source_record in source.items():
        before = normalized_images(target_by_source[source_id].get("legacyImages"))
        after = normalized_images(source_record["images"])
        if before != after:
            changes.append((target_by_source[source_id]["id"], source_id, after))

    print(f"source_products={len(source)} target_products={len(target)} changes={len(changes)}")
    print(f"backup={args.backup}")
    if not args.apply:
        print("dry_run=true")
        return

    for index, (target_id, source_id, images) in enumerate(changes, 1):
        response = session.patch(
            f"{args.cms_api}/api/products/{target_id}",
            json={"legacyImages": images},
            timeout=30,
        )
        response.raise_for_status()
        if index % 100 == 0 or index == len(changes):
            print(f"updated={index}/{len(changes)} last_source_id={source_id}")

    refreshed = fetch_all(
        session,
        f"{args.cms_api}/api/products",
        {
            "where[and][0][tenant][equals]": tenant_id,
            "where[and][1][publicationStatus][equals]": "publish",
            "depth": 0,
        },
    )
    refreshed_by_source = {str(record.get("sourceId")): record for record in refreshed}
    failures = [
        source_id
        for source_id, source_record in source.items()
        if normalized_images(source_record["images"])
        != normalized_images(refreshed_by_source[source_id].get("legacyImages"))
    ]
    if failures:
        raise RuntimeError(f"Post-update reconciliation failed for source IDs: {failures[:10]}")
    distribution: dict[int, int] = {}
    for record in refreshed:
        count = len(record.get("legacyImages") or [])
        distribution[count] = distribution.get(count, 0) + 1
    print(f"reconciled={len(refreshed)} image_distribution={dict(sorted(distribution.items()))}")


if __name__ == "__main__":
    main()
