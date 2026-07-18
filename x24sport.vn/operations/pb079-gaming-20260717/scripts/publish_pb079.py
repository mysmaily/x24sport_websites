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
BACKUP_DIR = ROOT / "backups"
IMAGE_PATH = ROOT / "final" / "x24-gm-079-gaming-hq.webp"
SOURCE_IMAGE = ROOT / "source" / "x24-pb-079-anh-1.webp"
SKU = "X24-GM-079"
SLUG = "ao-thi-dau-gaming-x24-gm-079-trang-xanh-bien"
CATEGORY_SLUG = "ao-gaming"
SOURCE_URL = "https://cdn.mayaopickleball.vn/wp-content/uploads/2026/07/x24-pb-079-anh-1.webp"


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


def q(value: str) -> str:
    return urllib.parse.quote(value, safe="")


def docs(path: str) -> list[dict[str, Any]]:
    data = request_json(path)
    return list(data.get("docs") or [])


def one(path: str, label: str) -> dict[str, Any]:
    found = docs(path)
    if len(found) != 1:
        raise SystemExit(f"expected exactly one {label}, got {len(found)}")
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


def product_payload(tenant_id: int, category_id: int, media_id: int) -> dict[str, Any]:
    colors = ["Trắng", "Xanh biển nhạt", "Đen"]
    return {
        "tenant": tenant_id,
        "name": "Áo Gaming X24-GM-079 Trắng Xanh Biển",
        "slug": SLUG,
        "sku": SKU,
        "sport": "other",
        "price": None,
        "compareAtPrice": None,
        "shortDescription": (
            "Áo thi đấu gaming đặt may X24-GM-079 tông trắng phối xanh biển nhạt, "
            "họa tiết chấm, hexagon và sọc chéo; phù hợp đồng phục team esports."
        ),
        "description": rich_text([
            "Áo Gaming X24-GM-079 sử dụng nền trắng phối xanh biển nhạt, cổ polo và bố cục đồ họa gồm mảng chấm, dải hexagon dọc thân áo cùng cụm sọc chéo ở phần bụng áo.",
            "Hình ảnh sản phẩm được chuyển thể theo phong cách đội tuyển gaming/esports, với đội hình game thủ mặc đồng phục đồng bộ để khách hàng dễ hình dung khi đặt may cho team, clan, phòng máy hoặc sự kiện.",
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
            *[{"value": color} for color in colors],
            {"value": "áo gaming trắng xanh"},
            {"value": "áo gaming cổ polo"},
            {"value": "áo team esports trắng"},
        ],
        "publicationStatus": "publish",
        "stockStatus": "instock",
        "featured": False,
        "sourceSystem": "mayaopickleball-to-gaming",
        "sourceId": "x24-pb-079",
        "sourceUrl": SOURCE_URL,
    }


def upload_media(tenant_id: int) -> dict[str, Any]:
    if not IMAGE_PATH.exists():
        raise SystemExit(f"final image missing: {IMAGE_PATH}")
    payload = {
        "tenant": tenant_id,
        "alt": "Áo thi đấu gaming X24-GM-079 trắng xanh biển - đội game thủ mặc áo đồng đội",
        "sourceSystem": "mayaopickleball-to-gaming",
        "sourceId": "x24-pb-079:hq-no-logo",
        "sourceUrl": SOURCE_URL,
        "sourceChecksum": subprocess.check_output(["shasum", "-a", "256", str(IMAGE_PATH)], text=True).split()[0],
    }
    cmd = [
        "curl", "-fsS", "--max-time", "240",
        "-H", f"Authorization: users API-Key {env('PAYLOAD_API_KEY')}",
        "-F", f"file=@{IMAGE_PATH}",
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
    tenant = one(f"/tenants?where[slug][equals]={q(env('TENANT_SLUG'))}&limit=1&depth=0", "tenant")
    category = one(f"/product-categories?where[slug][equals]={q(CATEGORY_SLUG)}&limit=1&depth=1", "category")
    sku_matches = docs(
        f"/products?where[tenant.slug][equals]={q(env('TENANT_SLUG'))}&where[sku][equals]={q(SKU)}&limit=5&depth=1"
    )
    slug_matches = docs(
        f"/products?where[tenant.slug][equals]={q(env('TENANT_SLUG'))}&where[slug][equals]={q(SLUG)}&limit=5&depth=1"
    )
    media_matches = docs(
        f"/media?where[tenant.slug][equals]={q(env('TENANT_SLUG'))}"
        f"&where[sourceSystem][equals]={q('mayaopickleball-to-gaming')}"
        f"&where[sourceId][equals]={q('x24-pb-079:hq-no-logo')}&limit=5&depth=0"
    )
    before = {
        "tenant": tenant,
        "category": category,
        "skuMatches": sku_matches,
        "slugMatches": slug_matches,
        "mediaMatches": media_matches,
        "sourceImage": str(SOURCE_IMAGE),
        "finalImage": str(IMAGE_PATH),
    }
    backup_path = backup("before-publish-x24-gm-079", before)
    if sku_matches or slug_matches:
        raise SystemExit(f"product already exists by SKU/slug; backup={backup_path}")
    if args.dry_run:
        print(json.dumps({
            "dryRun": True,
            "backup": str(backup_path),
            "wouldCreate": {
                "sku": SKU,
                "slug": SLUG,
                "tenantId": tenant["id"],
                "categoryId": category["id"],
                "image": str(IMAGE_PATH),
            },
        }, ensure_ascii=False, indent=2))
        return 0
    media = media_matches[0] if media_matches else upload_media(int(tenant["id"]))
    created = unwrap(request_json(
        "/products",
        method="POST",
        payload=product_payload(int(tenant["id"]), int(category["id"]), int(media["id"])),
    ))
    category_count = recalc_category_count(int(category["id"]))
    print(json.dumps({
        "createdProductId": created.get("id"),
        "sku": created.get("sku"),
        "slug": created.get("slug"),
        "mediaId": media.get("id"),
        "mediaUrl": media.get("url"),
        "categoryId": category.get("id"),
        "categoryProductCount": category_count,
        "productUrl": f"https://next.x24sport.vn/{created.get('slug')}/",
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
