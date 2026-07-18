#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import os
import subprocess
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "manifest.json"
HQ_DIR = ROOT / "final-hq-no-logo"
BACKUP_DIR = ROOT / "backups"
SOURCE_SYSTEM = "x24-billiards-to-gaming-hq-image"


def stamp() -> str:
    return datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")


def require_env(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        raise SystemExit(f"missing environment variable: {name}")
    return value


def api_base() -> str:
    return require_env("CMS_API_URL").rstrip("/") + "/api"


def headers(extra: dict[str, str] | None = None) -> dict[str, str]:
    base = {
        "Authorization": f"users API-Key {require_env('PAYLOAD_API_KEY')}",
        "Accept": "application/json",
    }
    if extra:
        base.update(extra)
    return base


def request_json(path: str, method: str = "GET", payload: dict[str, Any] | None = None) -> Any:
    body = None if payload is None else json.dumps(payload, ensure_ascii=False).encode("utf-8")
    req = urllib.request.Request(
        api_base() + path,
        method=method,
        headers=headers({"Content-Type": "application/json"} if payload is not None else None),
        data=body,
    )
    with urllib.request.urlopen(req, timeout=120) as response:
        raw = response.read().decode("utf-8")
        return json.loads(raw) if raw else {}


def unwrap_doc(data: Any) -> dict[str, Any]:
    if isinstance(data, dict) and isinstance(data.get("doc"), dict):
        return data["doc"]
    if isinstance(data, dict):
        return data
    raise RuntimeError(f"unexpected response: {type(data)!r}")


def load_records() -> list[dict[str, Any]]:
    return json.loads(MANIFEST.read_text(encoding="utf-8"))


def save_records(records: list[dict[str, Any]]) -> None:
    MANIFEST.write_text(json.dumps(records, ensure_ascii=False, indent=2, sort_keys=True), encoding="utf-8")


def save_backup(name: str, data: Any) -> Path:
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    path = BACKUP_DIR / f"{stamp()}-{name}.json"
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2, sort_keys=True), encoding="utf-8")
    return path


def render_hq_images(records: list[dict[str, Any]]) -> list[Path]:
    from PIL import Image

    HQ_DIR.mkdir(parents=True, exist_ok=True)
    outputs: list[Path] = []
    for record in records:
        source = Path(record["generatedImagePath"])
        if not source.exists():
            raise SystemExit(f"generated base image missing for {record['productCode']}: {source}")
        image = Image.open(source).convert("RGB")
        width, height = image.size
        side = min(width, height)
        left = max(0, (width - side) // 2)
        top = max(0, (height - side) // 2)
        image = image.crop((left, top, left + side, top + side))
        image = image.resize((1000, 1000), Image.Resampling.LANCZOS)
        out = HQ_DIR / f"{record['productCode'].lower()}-gaming-hq.webp"
        image.save(out, "WEBP", quality=98, method=6)
        record["hqNoLogoImagePath"] = str(out)
        record["hqNoLogoBytes"] = out.stat().st_size
        outputs.append(out)
    save_records(records)
    return outputs


def upload_media(path: Path, record: dict[str, Any]) -> dict[str, Any]:
    payload = {
        "tenant": record["tenantId"],
        "alt": f"Áo thi đấu gaming {record['productCode']} {', '.join(record['colors'])}",
        "sourceSystem": SOURCE_SYSTEM,
        "sourceId": f"{record['sourceProductId']}:hq-no-logo",
    }
    cmd = [
        "curl", "-fsS", "--max-time", "240",
        "-H", f"Authorization: users API-Key {require_env('PAYLOAD_API_KEY')}",
        "-F", f"file=@{path}",
        "-F", "_payload=" + json.dumps(payload, ensure_ascii=False),
        api_base() + "/media",
    ]
    result = subprocess.run(cmd, text=True, capture_output=True, check=True)
    return unwrap_doc(json.loads(result.stdout))


def cmd_render(_args: argparse.Namespace) -> int:
    records = load_records()
    outputs = render_hq_images(records)
    print(json.dumps({
        "rendered": len(outputs),
        "dir": str(HQ_DIR),
        "files": [str(path) for path in outputs],
    }, ensure_ascii=False, indent=2))
    return 0


def cmd_apply(args: argparse.Namespace) -> int:
    records = load_records()
    selected = [r for r in records if r.get("createdProductId")]
    if args.code:
        wanted = set(args.code)
        selected = [r for r in selected if r["productCode"] in wanted]
    products_before = []
    for record in selected:
        product = request_json(f"/products/{record['createdProductId']}?depth=2")
        products_before.append(product)
    backup = save_backup("gaming-products-before-hq-image-replace", products_before)
    if args.dry_run:
        print(json.dumps({
            "wouldReplace": [
                {
                    "code": r["productCode"],
                    "productId": r["createdProductId"],
                    "image": r.get("hqNoLogoImagePath"),
                }
                for r in selected
            ],
            "backup": str(backup),
        }, ensure_ascii=False, indent=2))
        return 0
    for record in selected:
        path = Path(record.get("hqNoLogoImagePath") or "")
        if not path.exists():
            raise SystemExit(f"HQ image missing for {record['productCode']}: {path}")
        media = upload_media(path, record)
        updated = unwrap_doc(request_json(
            f"/products/{record['createdProductId']}",
            method="PATCH",
            payload={"gallery": [media["id"]]},
        ))
        record["previousMediaId"] = record.get("createdMediaId")
        record["hqNoLogoMediaId"] = media["id"]
        record["createdMediaId"] = media["id"]
        record["status"] = "published_hq_no_logo"
        record["hqNoLogoMediaUrl"] = media.get("url")
        record["updatedProductId"] = updated.get("id")
        save_records(records)
    print(json.dumps({
        "updated": [
            {
                "code": r["productCode"],
                "productId": r.get("createdProductId"),
                "mediaId": r.get("hqNoLogoMediaId"),
                "mediaUrl": r.get("hqNoLogoMediaUrl"),
            }
            for r in selected
        ],
        "backup": str(backup),
    }, ensure_ascii=False, indent=2))
    return 0


def cmd_summary(_args: argparse.Namespace) -> int:
    records = load_records()
    counts: dict[str, int] = {}
    for record in records:
        counts[record.get("status", "unknown")] = counts.get(record.get("status", "unknown"), 0) + 1
    print(json.dumps({"total": len(records), "counts": counts}, ensure_ascii=False, indent=2))
    return 0


def main() -> int:
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("render").set_defaults(func=cmd_render)
    apply = sub.add_parser("apply")
    apply.add_argument("--dry-run", action="store_true")
    apply.add_argument("--code", action="append")
    apply.set_defaults(func=cmd_apply)
    sub.add_parser("summary").set_defaults(func=cmd_summary)
    args = parser.parse_args()
    return args.func(args)


if __name__ == "__main__":
    raise SystemExit(main())
