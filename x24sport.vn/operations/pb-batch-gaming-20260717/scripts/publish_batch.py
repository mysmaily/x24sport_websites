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
RECORDS = ROOT / "records.json"
BACKUP_DIR = ROOT / "backups"
CATEGORY_SLUG = "ao-gaming"
SOURCE_SYSTEM = "mayaopickleball-to-gaming"

FACTS = {
    "516": {
        "colors": ["Xanh cyan", "Hồng magenta", "Xanh tím nhạt"],
        "slug_tail": "xanh-cyan-hong-magenta-xanh-tim-nhat",
        "pattern": "nền xanh cyan chuyển hồng magenta, phần thân dưới có hiệu ứng gradient và mảng đồ họa sáng",
    },
    "403": {
        "colors": ["Trắng", "Xanh biển nhạt"],
        "slug_tail": "trang-xanh-bien-nhat",
        "pattern": "nền trắng phối xanh biển nhạt, họa tiết chấm và sọc chéo nhẹ trên thân áo",
    },
    "525": {
        "colors": ["Xanh bích", "Vàng", "Xám bạc"],
        "slug_tail": "xanh-bich-vang-xam-bac",
        "pattern": "nền xanh bích với cụm sọc vàng và đường chéo xám bạc",
    },
    "527": {
        "colors": ["Đỏ ruby", "Đỏ burgundy"],
        "slug_tail": "do-ruby-do-burgundy",
        "pattern": "nền đỏ ruby phối burgundy, họa tiết góc cạnh cùng các mảng đỏ đậm trên thân áo",
    },
    "536": {
        "colors": ["Xanh dương", "Trắng", "Xanh lá nhạt"],
        "slug_tail": "xanh-duong-trang-xanh-la-nhat",
        "pattern": "nền xanh dương với cụm sọc trắng và xanh lá nhạt chạy dọc thân áo",
    },
    "537": {
        "colors": ["Xanh ngọc", "Vàng", "Trắng"],
        "slug_tail": "xanh-ngoc-vang-trang",
        "pattern": "nền xanh ngọc phối sọc vàng trắng, mảng đồ họa chéo nổi bật ở thân áo",
    },
    "555": {
        "colors": ["Tím", "Trắng", "Xám nhạt"],
        "slug_tail": "tim-trang-xam-nhat",
        "pattern": "nền tím chuyển trắng xám nhạt, họa tiết đường nét hình học góc cạnh",
    },
    "554": {
        "colors": ["Xanh ngọc", "Trắng", "Xám nhạt"],
        "slug_tail": "xanh-ngoc-trang-xam-nhat",
        "pattern": "nền xanh ngọc chuyển trắng xám nhạt, phối các đường hình học chéo trên thân áo",
    },
    "583": {
        "colors": ["Xanh cyan", "Hồng nhạt", "Trắng"],
        "slug_tail": "xanh-cyan-hong-nhat-trang",
        "pattern": "nền xanh cyan chuyển hồng nhạt và trắng, phần thân dưới có cụm sọc mảnh dạng gradient",
    },
}


def stamp() -> str:
    return datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")


def env(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        raise SystemExit(f"missing environment variable: {name}")
    return value


def api_base() -> str:
    return env("CMS_API_URL").rstrip("/") + "/api"


def headers(extra: dict[str, str] | None = None) -> dict[str, str]:
    out = {
        "Authorization": f"users API-Key {env('PAYLOAD_API_KEY')}",
        "Accept": "application/json",
    }
    if extra:
        out.update(extra)
    return out


def q(value: str) -> str:
    return urllib.parse.quote(value, safe="")


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


def unwrap(data: Any) -> dict[str, Any]:
    if isinstance(data, dict) and isinstance(data.get("doc"), dict):
        return data["doc"]
    if isinstance(data, dict):
        return data
    raise RuntimeError(f"unexpected response type: {type(data)!r}")


def docs(path: str) -> list[dict[str, Any]]:
    return list((request_json(path).get("docs") or []))


def one(path: str, label: str) -> dict[str, Any]:
    found = docs(path)
    if len(found) != 1:
        raise SystemExit(f"expected one {label}, got {len(found)}")
    return found[0]


def backup(name: str, data: Any) -> Path:
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    path = BACKUP_DIR / f"{stamp()}-{name}.json"
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2, sort_keys=True), encoding="utf-8")
    return path


def paragraph(text: str) -> dict[str, Any]:
    return {
        "type": "paragraph",
        "format": "",
        "indent": 0,
        "version": 1,
        "children": [{"text": text, "type": "text", "version": 1}],
        "direction": "ltr",
    }


def rich_text(paragraphs: list[str]) -> dict[str, Any]:
    return {
        "root": {
            "type": "root",
            "format": "",
            "indent": 0,
            "version": 1,
            "children": [paragraph(text) for text in paragraphs],
            "direction": "ltr",
        }
    }


def slug_for(record: dict[str, Any]) -> str:
    return f"ao-thi-dau-gaming-x24-gm-{record['code']}-{FACTS[record['code']]['slug_tail']}"


def product_payload(record: dict[str, Any], tenant_id: int, category_id: int, media_id: int) -> dict[str, Any]:
    facts = FACTS[record["code"]]
    colors = facts["colors"]
    color_text = ", ".join(colors)
    name = f"Áo Gaming {record['sku']} {color_text}"
    return {
        "tenant": tenant_id,
        "name": name,
        "slug": slug_for(record),
        "sku": record["sku"],
        "sport": "other",
        "price": None,
        "compareAtPrice": None,
        "shortDescription": (
            f"Áo thi đấu gaming đặt may {record['sku']} tông {color_text}, "
            f"{facts['pattern']}; nhận tùy chỉnh nickname, số áo và logo team."
        ),
        "description": rich_text([
            f"{name} sử dụng {facts['pattern']}, được trình bày theo phong cách đồng phục đội tuyển gaming/esports.",
            "Hình ảnh sản phẩm thể hiện nhóm game thủ mặc jersey đồng đội trong bối cảnh sân khấu esports, giúp đội nhóm dễ hình dung khi đặt may áo thi đấu hoặc áo sự kiện.",
            "X24 nhận tùy chỉnh nickname, số áo, logo team, vị trí sponsor và màu nhận diện theo file thiết kế khách hàng xác nhận.",
            "Trước khi chốt đơn, khách hàng nên xác nhận chất liệu, bảng size, số lượng, vị trí in và thời gian sản xuất. Các đặc tính kỹ thuật của vải chỉ áp dụng khi có thông số được xác nhận riêng.",
        ]),
        "categories": [category_id],
        "badges": [{"label": "Gaming"}, {"label": "Jersey team"}],
        "gallery": [media_id],
        "searchTags": [
            {"value": "áo thi đấu gaming"},
            {"value": "áo esports"},
            {"value": "đồng phục gaming"},
            {"value": "gaming team jersey"},
            {"value": "áo gaming cổ polo"},
            *[{"value": color} for color in colors],
        ],
        "publicationStatus": "publish",
        "stockStatus": "instock",
        "featured": False,
        "sourceSystem": SOURCE_SYSTEM,
        "sourceId": f"x24-pb-{record['code']}",
        "sourceUrl": record["sourceUrl"],
    }


def checksum(path: Path) -> str:
    return subprocess.check_output(["shasum", "-a", "256", str(path)], text=True).split()[0]


def upload_media(record: dict[str, Any], tenant_id: int) -> dict[str, Any]:
    path = Path(record["finalPath"])
    facts = FACTS[record["code"]]
    payload = {
        "tenant": tenant_id,
        "alt": f"Áo thi đấu gaming {record['sku']} {', '.join(facts['colors'])} - đội game thủ mặc áo đồng đội",
        "sourceSystem": SOURCE_SYSTEM,
        "sourceId": f"x24-pb-{record['code']}:hq-no-logo",
        "sourceUrl": record["sourceUrl"],
        "sourceChecksum": checksum(path),
    }
    cmd = [
        "curl", "-fsS", "--max-time", "240",
        "-H", f"Authorization: users API-Key {env('PAYLOAD_API_KEY')}",
        "-F", f"file=@{path}",
        "-F", "_payload=" + json.dumps(payload, ensure_ascii=False),
        api_base() + "/media",
    ]
    result = subprocess.run(cmd, text=True, capture_output=True, check=True)
    return unwrap(json.loads(result.stdout))


def recalc_category_count(category_id: int) -> int:
    data = request_json(
        f"/products?where[tenant.slug][equals]={q(env('TENANT_SLUG'))}"
        f"&where[categories][in]={category_id}&limit=1&depth=0"
    )
    count = int(data.get("totalDocs") or 0)
    request_json(f"/product-categories/{category_id}", method="PATCH", payload={"productCount": count})
    return count


def cmd_publish(args: argparse.Namespace) -> int:
    records = json.loads(RECORDS.read_text(encoding="utf-8"))
    tenant = one(f"/tenants?where[slug][equals]={q(env('TENANT_SLUG'))}&limit=1&depth=0", "tenant")
    category = one(f"/product-categories?where[slug][equals]={q(CATEGORY_SLUG)}&limit=1&depth=1", "category")
    before: dict[str, Any] = {"tenant": tenant, "category": category, "records": []}
    selected: list[dict[str, Any]] = []
    for record in records:
        sku_matches = docs(
            f"/products?where[tenant.slug][equals]={q(env('TENANT_SLUG'))}&where[sku][equals]={q(record['sku'])}&limit=5&depth=1"
        )
        slug_matches = docs(
            f"/products?where[tenant.slug][equals]={q(env('TENANT_SLUG'))}&where[slug][equals]={q(slug_for(record))}&limit=5&depth=1"
        )
        media_matches = docs(
            f"/media?where[tenant.slug][equals]={q(env('TENANT_SLUG'))}"
            f"&where[sourceSystem][equals]={q(SOURCE_SYSTEM)}"
            f"&where[sourceId][equals]={q('x24-pb-' + record['code'] + ':hq-no-logo')}&limit=5&depth=0"
        )
        entry = {
            "sku": record["sku"],
            "slug": slug_for(record),
            "skuMatches": sku_matches,
            "slugMatches": slug_matches,
            "mediaMatches": media_matches,
        }
        before["records"].append(entry)
        if sku_matches or slug_matches:
            record["skipReason"] = "existing_product"
        else:
            record["existingMedia"] = media_matches[0] if media_matches else None
            selected.append(record)
    backup_path = backup("before-publish-pb-batch-gaming", before)
    if args.dry_run:
        print(json.dumps({
            "dryRun": True,
            "backup": str(backup_path),
            "wouldCreate": [{"sku": r["sku"], "slug": slug_for(r), "image": r["finalPath"]} for r in selected],
            "wouldSkip": [{"sku": r["sku"], "reason": r.get("skipReason")} for r in records if r.get("skipReason")],
        }, ensure_ascii=False, indent=2))
        return 0

    created: list[dict[str, Any]] = []
    for record in selected:
        media = record["existingMedia"] or upload_media(record, int(tenant["id"]))
        product = unwrap(request_json(
            "/products",
            method="POST",
            payload=product_payload(record, int(tenant["id"]), int(category["id"]), int(media["id"])),
        ))
        record["mediaId"] = media.get("id")
        record["mediaUrl"] = media.get("url")
        record["productId"] = product.get("id")
        record["productUrl"] = f"https://next.x24sport.vn/{product.get('slug')}/"
        created.append({
            "sku": record["sku"],
            "productId": product.get("id"),
            "mediaId": media.get("id"),
            "mediaUrl": media.get("url"),
            "productUrl": record["productUrl"],
        })
        RECORDS.write_text(json.dumps(records, ensure_ascii=False, indent=2), encoding="utf-8")
    category_count = recalc_category_count(int(category["id"]))
    print(json.dumps({
        "created": created,
        "skipped": [{"sku": r["sku"], "reason": r.get("skipReason")} for r in records if r.get("skipReason")],
        "categoryProductCount": category_count,
        "backup": str(backup_path),
    }, ensure_ascii=False, indent=2))
    return 0


def main() -> int:
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest="command", required=True)
    publish = sub.add_parser("publish")
    publish.add_argument("--dry-run", action="store_true")
    publish.set_defaults(func=cmd_publish)
    args = parser.parse_args()
    return args.func(args)


if __name__ == "__main__":
    raise SystemExit(main())
