#!/usr/bin/env python3
"""Manage resumable V6 batch migration manifests."""
from __future__ import annotations

import argparse
import contextlib
import fcntl
import hashlib
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


TERMINAL_STATUSES = {"verified", "skipped_duplicate", "visual_rejected"}
STATUS_ORDER = {
    "source_discovered": 10,
    "reserved": 20,
    "source_downloaded": 30,
    "analyzed": 40,
    "prompts_ready": 50,
    "images_generated": 60,
    "visual_approved": 70,
    "visual_rejected": 75,
    "postprocessed": 80,
    "media_uploaded": 90,
    "product_created": 100,
    "verified": 110,
    "skipped_duplicate": 120,
}


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def manifest_path(wave_dir: Path) -> Path:
    return wave_dir / "manifest.jsonl"


@contextlib.contextmanager
def manifest_lock(wave_dir: Path):
    wave_dir.mkdir(parents=True, exist_ok=True)
    lock_path = wave_dir / ".manifest.lock"
    with lock_path.open("w", encoding="utf-8") as lock_file:
        fcntl.flock(lock_file.fileno(), fcntl.LOCK_EX)
        try:
            yield
        finally:
            fcntl.flock(lock_file.fileno(), fcntl.LOCK_UN)


def load_jsonl(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    records: list[dict[str, Any]] = []
    for line_no, line in enumerate(path.read_text(encoding="utf-8").splitlines(), start=1):
        if not line.strip():
            continue
        try:
            records.append(json.loads(line))
        except json.JSONDecodeError as exc:
            raise SystemExit(f"{path}:{line_no}: invalid JSON: {exc}") from exc
    return records


def source_signature(url: str | None) -> str | None:
    if not url:
        return None
    return hashlib.sha256(url.strip().encode("utf-8")).hexdigest()


def converted_source_keys(path: Path | None) -> tuple[set[str], set[str], set[str], set[str], set[str]]:
    if not path or not path.exists():
        return set(), set(), set(), set(), set()
    records = load_jsonl(path)
    keys = {str(record.get("source_product_key")) for record in records if record.get("source_product_key")}
    product_ids = {str(record.get("source_product_id")) for record in records if record.get("source_product_id")}
    urls = {str(record.get("source_image_url")) for record in records if record.get("source_image_url")}
    signatures = {str(record.get("source_signature")) for record in records if record.get("source_signature")}
    skus = {str(record.get("destination_sku")) for record in records if record.get("destination_sku")}
    return keys, product_ids, urls, signatures, skus


def write_jsonl(path: Path, records: list[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")
    tmp.write_text("".join(json.dumps(record, ensure_ascii=False, sort_keys=True) + "\n" for record in records), encoding="utf-8")
    tmp.replace(path)


def source_key(record: dict[str, Any]) -> str:
    key = str(record.get("source_product_key") or "").strip()
    if key:
        return key
    filename = str(record.get("source_filename") or Path(str(record.get("source_image_url") or "")).name)
    stem = Path(filename).stem
    match = re.search(r"(x24[-_ ]?cb[-_ ]?\d+|cb[-_ ]?\d+)", stem, re.I)
    if match:
        return re.sub(r"[^a-z0-9]+", "-", match.group(1).lower()).strip("-")
    return re.sub(r"[^a-z0-9]+", "-", stem.lower()).strip("-")


def new_manifest_record(source: dict[str, Any], index: int, product_code: str | None) -> dict[str, Any]:
    key = source_key(source)
    return {
        "schema_version": "0.5-image-only",
        "operation_mode": "create_new_product",
        "source_site": "mayaochaybo.vn",
        "destination_site": "mayaopickleball.vn",
        "source_index": index,
        "source_product_key": key,
        "source_product_id": source.get("source_product_id"),
        "source_product_slug": source.get("source_product_slug"),
        "source_product_name": source.get("source_product_name"),
        "source_product_url": source.get("source_product_url"),
        "source_product_type": source.get("source_product_type"),
        "source_sku": source.get("source_sku"),
        "source_image_url": source.get("source_image_url"),
        "source_media_id": source.get("source_media_id"),
        "source_filename": source.get("source_filename"),
        "source_gallery": source.get("source_gallery") or [],
        "source_category_slugs": source.get("source_category_slugs") or [],
        "source_tag_slugs": source.get("source_tag_slugs") or [],
        "width": source.get("width"),
        "height": source.get("height"),
        "product_code": product_code,
        "status": "source_discovered",
        "attempt_count": 0,
        "last_error": None,
        "model_references": {},
        "visual_analysis": {},
        "tag_names": [],
        "tag_ids": [],
        "category_ids": [],
        "new_media_ids": [],
        "new_product_id": None,
        "product_url": None,
        "artifacts": {
            "item_dir": f"products/{key}",
            "source": None,
            "generated": [],
            "final": [],
            "payload": None,
            "responses": [],
        },
        "created_at": utc_now(),
        "updated_at": utc_now(),
    }


def assign_codes(existing_records: list[dict[str, Any]], prefix: str, start: int, extra_used: set[str] | None = None) -> list[str]:
    used = {str(record.get("product_code")) for record in existing_records if record.get("product_code")}
    if extra_used:
        used.update(extra_used)
    codes: list[str] = []
    number = start
    while True:
        code = f"{prefix}{number:03d}"
        number += 1
        if code not in used:
            codes.append(code)
        if len(codes) > 10000:
            return codes


def cmd_init(args: argparse.Namespace) -> int:
    wave_dir = args.wave_dir
    with manifest_lock(wave_dir):
        source_records = load_jsonl(args.source_jsonl)
        if not source_records:
            raise SystemExit(f"no source records in {args.source_jsonl}")

        path = manifest_path(wave_dir)
        records = load_jsonl(path)
        by_key = {str(record.get("source_product_key")): record for record in records}
        existing_urls = {str(record.get("source_image_url")) for record in records if record.get("source_image_url")}
        existing_signatures = {source_signature(str(record.get("source_image_url"))) for record in records if record.get("source_image_url")}
        converted_keys, converted_product_ids, converted_urls, converted_signatures, converted_skus = converted_source_keys(args.converted_sources)
        codes = assign_codes(records, args.product_code_prefix, args.product_code_start, converted_skus)
        code_index = 0
        added = 0
        skipped_converted = 0

        for index, source in enumerate(source_records, start=1):
            key = source_key(source)
            product_id = str(source.get("source_product_id") or "")
            source_url = str(source.get("source_image_url") or "")
            signature = source_signature(source_url)
            if key in by_key or source_url in existing_urls or (signature and signature in existing_signatures):
                continue
            if key in converted_keys or (product_id and product_id in converted_product_ids) or source_url in converted_urls or (signature and signature in converted_signatures):
                skipped_converted += 1
                continue
            product_code = None if args.no_assign_codes else codes[code_index]
            if not args.no_assign_codes:
                code_index += 1
            record = new_manifest_record(source, index, product_code)
            records.append(record)
            by_key[key] = record
            added += 1

        write_jsonl(path, records)
    print(json.dumps({"manifest": str(path), "total": len(records), "added": added, "skipped_converted": skipped_converted}, ensure_ascii=False))
    return 0


def cmd_next(args: argparse.Namespace) -> int:
    records = load_jsonl(manifest_path(args.wave_dir))
    if not records:
        raise SystemExit("manifest is empty; run init first")

    pending = [record for record in records if record.get("status") not in TERMINAL_STATUSES]
    if args.include_errors_first:
        pending.sort(key=lambda record: (0 if record.get("last_error") else 1, STATUS_ORDER.get(str(record.get("status")), 999), int(record.get("source_index") or 0)))
    else:
        pending.sort(key=lambda record: (STATUS_ORDER.get(str(record.get("status")), 999), int(record.get("source_index") or 0)))

    if not pending:
        print(json.dumps({"done": True, "message": "all records verified"}, ensure_ascii=False))
        return 0
    print(json.dumps(pending[0], ensure_ascii=False, indent=2))
    return 0


def cmd_mark(args: argparse.Namespace) -> int:
    path = manifest_path(args.wave_dir)
    with manifest_lock(args.wave_dir):
        records = load_jsonl(path)
        found = False
        patch: dict[str, Any] = {}
        if args.patch_json:
            patch = json.loads(args.patch_json.read_text(encoding="utf-8"))
        for record in records:
            if str(record.get("source_product_key")) != args.source_product_key:
                continue
            found = True
            record["status"] = args.status
            record["updated_at"] = utc_now()
            if args.error is not None:
                record["last_error"] = args.error or None
                if args.error:
                    record["attempt_count"] = int(record.get("attempt_count") or 0) + 1
            if patch:
                record.update(patch)
        if not found:
            raise SystemExit(f"source_product_key not found: {args.source_product_key}")
        write_jsonl(path, records)
    print(json.dumps({"manifest": str(path), "source_product_key": args.source_product_key, "status": args.status}, ensure_ascii=False))
    return 0


def cmd_summary(args: argparse.Namespace) -> int:
    records = load_jsonl(manifest_path(args.wave_dir))
    counts: dict[str, int] = {}
    for record in records:
        status = str(record.get("status") or "unknown")
        counts[status] = counts.get(status, 0) + 1
    print(json.dumps({"total": len(records), "counts": counts}, ensure_ascii=False, indent=2))
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)

    init = sub.add_parser("init")
    init.add_argument("--wave-dir", type=Path, required=True)
    init.add_argument("--source-jsonl", type=Path, required=True)
    init.add_argument("--product-code-prefix", default="X24-PB-")
    init.add_argument("--product-code-start", type=int, default=1)
    init.add_argument("--converted-sources", type=Path)
    init.add_argument("--no-assign-codes", action="store_true")
    init.set_defaults(func=cmd_init)

    next_cmd = sub.add_parser("next")
    next_cmd.add_argument("--wave-dir", type=Path, required=True)
    next_cmd.add_argument("--include-errors-first", action="store_true", default=True)
    next_cmd.set_defaults(func=cmd_next)

    mark = sub.add_parser("mark")
    mark.add_argument("--wave-dir", type=Path, required=True)
    mark.add_argument("--source-product-key", required=True)
    mark.add_argument("--status", required=True, choices=sorted(STATUS_ORDER))
    mark.add_argument("--error")
    mark.add_argument("--patch-json", type=Path)
    mark.set_defaults(func=cmd_mark)

    summary = sub.add_parser("summary")
    summary.add_argument("--wave-dir", type=Path, required=True)
    summary.set_defaults(func=cmd_summary)

    args = parser.parse_args()
    return args.func(args)


if __name__ == "__main__":
    raise SystemExit(main())
