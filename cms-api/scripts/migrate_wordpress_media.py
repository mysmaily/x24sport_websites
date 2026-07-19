#!/usr/bin/env python3
"""Snapshot and idempotently migrate WordPress media into tenant-scoped Payload R2 storage."""

from __future__ import annotations

import argparse
import hashlib
import json
import mimetypes
import re
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Any
from urllib.parse import urlsplit

import requests

from migrate_wordpress_tenant import api_session, plain_text, text_value
from migrate_x24sport_catalog import Payload, canonical_json, fetch_pages, parse_credentials


SOURCE_SYSTEM = "wordpress-media"


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(canonical_json(value) + b"\n")


def snapshot(source_url: str, output: Path) -> list[dict[str, Any]]:
    if output.exists():
        return json.loads(output.read_text(encoding="utf-8"))
    records = fetch_pages(
        api_session(),
        f"{source_url.rstrip('/')}/wp-json/wp/v2/media",
        {
            "orderby": "id",
            "order": "asc",
            "_fields": (
                "id,date_gmt,modified_gmt,slug,status,link,title,caption,alt_text,"
                "media_type,mime_type,media_details,source_url"
            ),
        },
    )
    write_json(output, records)
    return records


def safe_filename(record: dict[str, Any], content_type: str) -> str:
    source_name = Path(urlsplit(str(record["source_url"])).path).name
    source_name = re.sub(r"[^A-Za-z0-9._-]+", "-", source_name).strip("-.")
    if not source_name:
        extension = mimetypes.guess_extension(content_type) or ".bin"
        source_name = f"media{extension}"
    return f"wp-{record['id']}-{source_name}"[:180]


def migrate_one(target: Payload, tenant_id: Any, record: dict[str, Any]) -> dict[str, Any]:
    source_id = int(record["id"])
    identity = f"{tenant_id}:{SOURCE_SYSTEM}:{source_id}"
    existing = target.find("media", "tenantSourceKey", identity)
    if existing:
        return {
            "sourceId": source_id,
            "sourceUrl": record["source_url"],
            "targetUrl": existing.get("url"),
            "mediaId": existing["id"],
            "outcome": "unchanged",
        }

    response = requests.get(
        record["source_url"],
        timeout=120,
        headers={"User-Agent": "X24Sport-WordPress-Media-Migrator/1.0"},
    )
    response.raise_for_status()
    content_type = (
        response.headers.get("Content-Type", "").split(";", 1)[0]
        or record.get("mime_type")
        or "application/octet-stream"
    )
    title = plain_text(text_value(record.get("title")))
    alt = str(record.get("alt_text") or "").strip() or title or f"Media {source_id}"
    payload = {
        "tenant": tenant_id,
        "alt": alt,
        "sourceSystem": SOURCE_SYSTEM,
        "sourceId": str(source_id),
        "sourceUrl": record["source_url"],
        "sourceChecksum": hashlib.sha256(response.content).hexdigest(),
    }
    upload = requests.post(
        f"{target.base_url}/api/media",
        headers={"Authorization": f"Bearer {target.token}"},
        data={"_payload": json.dumps(payload, ensure_ascii=False)},
        files={"file": (safe_filename(record, content_type), response.content, content_type)},
        timeout=180,
    )
    upload.raise_for_status()
    body = upload.json()
    doc = body.get("doc", body)
    return {
        "sourceId": source_id,
        "sourceUrl": record["source_url"],
        "targetUrl": doc.get("url"),
        "mediaId": doc["id"],
        "outcome": "created",
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-url", required=True)
    parser.add_argument("--cms-api", default="http://10.10.0.28:3001")
    parser.add_argument("--tenant-slug", required=True)
    parser.add_argument("--credentials", type=Path, required=True)
    parser.add_argument("--snapshot", type=Path, required=True)
    parser.add_argument("--output-map", type=Path, required=True)
    parser.add_argument("--workers", type=int, default=4)
    parser.add_argument("--limit", type=int)
    args = parser.parse_args()

    records = [item for item in snapshot(args.source_url, args.snapshot) if item.get("source_url")]
    if args.limit:
        records = records[: args.limit]
    email, password = parse_credentials(args.credentials)
    target = Payload(args.cms_api, email, password, False)
    tenant = target.find("tenants", "slug", args.tenant_slug)
    if not tenant:
        raise SystemExit(f"Tenant does not exist: {args.tenant_slug}")

    results: list[dict[str, Any]] = []
    errors: list[dict[str, Any]] = []
    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        futures = {pool.submit(migrate_one, target, tenant["id"], record): record for record in records}
        for index, future in enumerate(as_completed(futures), start=1):
            record = futures[future]
            try:
                results.append(future.result())
            except Exception as error:
                errors.append({"sourceId": record.get("id"), "error": str(error)[:500]})
            if index % 50 == 0 or index == len(futures):
                print(f"media progress={index}/{len(futures)} errors={len(errors)}")

    results.sort(key=lambda item: int(item["sourceId"]))
    write_json(args.output_map, results)
    if errors:
        write_json(args.output_map.with_suffix(".errors.json"), errors)
    print(json.dumps({"records": len(records), "migrated": len(results), "errors": len(errors)}))
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
