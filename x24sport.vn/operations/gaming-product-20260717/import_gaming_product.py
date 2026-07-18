#!/usr/bin/env python3
"""Import one X24Sport gaming jersey product into Payload."""

from __future__ import annotations

import argparse
import hashlib
import json
import mimetypes
import os
import re
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import requests


TENANT_SLUG = "x24sport"
CATEGORY_SLUG = "gaming"
PRODUCT_SOURCE = "x24-gaming-single"
MEDIA_SOURCE = "x24-gaming-imagegen"
PRODUCT_CODE = "001"
SOURCE_TIMESTAMP = "2026-07-17T08:45:00+00:00"


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def checksum(value: Any) -> str:
    raw = json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()
    return hashlib.sha256(raw).hexdigest()


def file_checksum(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def parse_credentials(raw: str) -> tuple[str, str]:
    raw = raw.strip()
    try:
        data = json.loads(raw)
        email, password = data.get("email"), data.get("password")
    except json.JSONDecodeError:
        fields: dict[str, str] = {}
        for line in raw.splitlines():
            match = re.match(r"\s*(email|password)\s*[:=]\s*(.+?)\s*$", line, re.I)
            if match:
                fields[match.group(1).lower()] = match.group(2)
        email, password = fields.get("email"), fields.get("password")
    if not email or not password:
        raise RuntimeError("Could not parse CMS credentials")
    return str(email), str(password)


def load_credentials(args: argparse.Namespace) -> tuple[str, str]:
    if os.environ.get("CMS_EMAIL") and os.environ.get("CMS_PASSWORD"):
        return os.environ["CMS_EMAIL"], os.environ["CMS_PASSWORD"]
    if args.credentials:
        return parse_credentials(Path(args.credentials).read_text(encoding="utf-8"))
    result = subprocess.run(
        ["ssh", args.remote_credentials_host, "cat", args.remote_credentials_path],
        check=True,
        capture_output=True,
        text=True,
    )
    return parse_credentials(result.stdout)


class PayloadClient:
    def __init__(self, base_url: str, email: str, password: str) -> None:
        self.base_url = base_url.rstrip("/")
        self.session = requests.Session()
        response = self.session.post(
            f"{self.base_url}/api/users/login",
            json={"email": email, "password": password},
            timeout=30,
        )
        response.raise_for_status()
        token = response.json().get("token")
        if not token:
            raise RuntimeError("Payload login did not return token")
        self.token = token
        self.session.headers["Authorization"] = f"Bearer {token}"

    def list(self, collection: str, params: dict[str, Any]) -> dict[str, Any]:
        response = self.session.get(f"{self.base_url}/api/{collection}", params=params, timeout=60)
        response.raise_for_status()
        return response.json()

    def all(self, collection: str, params: dict[str, Any]) -> list[dict[str, Any]]:
        docs: list[dict[str, Any]] = []
        page = 1
        while True:
            result = self.list(collection, {**params, "page": page, "limit": 100})
            docs.extend(result.get("docs", []))
            if page >= int(result.get("totalPages") or 1):
                return docs
            page += 1

    def find(self, collection: str, field: str, value: Any, depth: int = 0) -> dict[str, Any] | None:
        result = self.list(collection, {f"where[{field}][equals]": value, "limit": 1, "depth": depth})
        docs = result.get("docs", [])
        return docs[0] if docs else None

    def create(self, collection: str, data: dict[str, Any]) -> dict[str, Any]:
        response = self.session.post(f"{self.base_url}/api/{collection}", json=data, timeout=90)
        response.raise_for_status()
        return response.json().get("doc", response.json())

    def update(self, collection: str, doc_id: Any, data: dict[str, Any]) -> dict[str, Any]:
        response = self.session.patch(f"{self.base_url}/api/{collection}/{doc_id}", json=data, timeout=90)
        response.raise_for_status()
        return response.json().get("doc", response.json())

    def upload_media(self, path: Path, payload: dict[str, Any]) -> dict[str, Any]:
        mime = mimetypes.guess_type(path.name)[0] or "image/png"
        with path.open("rb") as handle:
            response = requests.post(
                f"{self.base_url}/api/media",
                headers={"Authorization": f"Bearer {self.token}"},
                data={"_payload": json.dumps(payload, ensure_ascii=False)},
                files={"file": (path.name, handle, mime)},
                timeout=180,
            )
        response.raise_for_status()
        return response.json().get("doc", response.json())


def gaming_category_payload(tenant_id: Any) -> dict[str, Any]:
    data = {
        "tenant": tenant_id,
        "name": "Gaming",
        "slug": CATEGORY_SLUG,
        "group": "sport",
        "description": "Áo gaming và esports thiết kế theo màu sắc, logo và nhận diện riêng của đội tuyển.",
        "legacyPath": "/danh-muc/gaming/",
        "sourceSystem": "manual",
        "sourceId": "x24-home-gaming",
        "productCount": 1,
        "order": 80,
    }
    data["sourceChecksum"] = checksum(data)
    return data


def product_content_html() -> str:
    return """
<p><strong>Áo gaming X24 GM-001 Xanh Dương Vàng</strong> là mẫu jersey esports dành cho đội tuyển, câu lạc bộ gaming và nhóm thi đấu muốn có hình ảnh đồng bộ khi lên sân khấu, livestream hoặc chụp ảnh team.</p>
<h2>Điểm nổi bật của mẫu GM-001</h2>
<ul>
  <li>Phối xanh dương chủ đạo với điểm nhấn vàng và xám, tạo cảm giác công nghệ, mạnh và dễ nhận diện đội.</li>
  <li>Phom áo cổ polo thể thao, tay ngắn, phù hợp mặc team trong sự kiện, giải đấu và nội dung truyền thông.</li>
  <li>Hình ảnh đội 5 người giúp khách dễ hình dung khi đặt đồng phục esports theo nhóm.</li>
  <li>Có thể tư vấn thêm logo đội, tên thành viên, số áo và biến thể màu theo nhận diện riêng.</li>
</ul>
<h2>Gợi ý đặt áo gaming</h2>
<p>Mẫu phù hợp cho team esports, câu lạc bộ game, giải đấu nội bộ, trường học hoặc cộng đồng streamer cần áo đồng phục có phong cách hiện đại và nổi bật trên nền ánh sáng sân khấu.</p>
""".strip()


def product_payload(tenant_id: Any, category_id: Any, media_id: Any) -> dict[str, Any]:
    name = "Áo gaming X24 GM-001 Xanh Dương Vàng"
    slug = "ao-gaming-x24-gm-001-xanh-duong-vang"
    short = "Jersey gaming xanh dương phối vàng cho đội esports, câu lạc bộ game và nhóm thi đấu cần đồng phục nổi bật, hiện đại."
    data: dict[str, Any] = {
        "tenant": tenant_id,
        "name": name,
        "slug": slug,
        "sku": "X24-GM-001",
        "sport": "other",
        "productType": "simple",
        "price": None,
        "compareAtPrice": None,
        "regularPrice": None,
        "salePrice": None,
        "currency": "VND",
        "stockStatus": "instock",
        "isPurchasable": False,
        "isOnBackorder": False,
        "shortDescription": short,
        "contentHtml": product_content_html(),
        "legacyPath": f"/{slug}/",
        "publicationStatus": "publish",
        "sourceSystem": PRODUCT_SOURCE,
        "sourceId": PRODUCT_CODE,
        "sourceModifiedAt": SOURCE_TIMESTAMP,
        "sourceCreatedAt": SOURCE_TIMESTAMP,
        "seoTitle": f"{name} | Jersey esports team X24Sport",
        "metaDescription": "Áo gaming X24 GM-001 xanh dương vàng cho đội esports, câu lạc bộ game và nhóm thi đấu. Phom polo thể thao, dễ tùy biến logo, tên thành viên.",
        "searchTags": [
            {"value": "gaming"},
            {"value": "esports"},
            {"value": "áo gaming"},
            {"value": "jersey esports"},
            {"value": "xanh dương vàng"},
        ],
        "sourceTags": [
            {"name": "Áo gaming", "slug": "ao-gaming"},
            {"name": "Đồng phục esports", "slug": "dong-phuc-esports"},
        ],
        "attributes": [
            {"name": "Bộ môn", "values": [{"value": "Gaming / Esports"}]},
            {"name": "Màu sắc", "values": [{"value": "Xanh dương, vàng, xám"}]},
            {"name": "Dành cho", "values": [{"value": "Đội tuyển, câu lạc bộ, nhóm thi đấu"}]},
        ],
        "categories": [category_id],
        "gallery": [media_id],
        "badges": [{"label": "Gaming"}, {"label": "Esports"}],
        "featured": False,
    }
    data["sourceChecksum"] = checksum({key: value for key, value in data.items() if key != "tenant"})
    return data


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--cms-api", default="http://10.10.0.28:3001")
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--credentials")
    parser.add_argument("--remote-credentials-host", default="root@10.10.0.28")
    parser.add_argument("--remote-credentials-path", default="/root/sports-cms/admin-credentials.txt")
    parser.add_argument("--base-dir", type=Path, default=Path(__file__).resolve().parent)
    args = parser.parse_args()

    email, password = load_credentials(args)
    client = PayloadClient(args.cms_api, email, password)
    tenant = client.find("tenants", "slug", TENANT_SLUG)
    if not tenant:
        raise RuntimeError(f"Tenant not found: {TENANT_SLUG}")
    tenant_id = tenant["id"]

    backup = {
        "createdAt": now_iso(),
        "tenant": tenant,
        "existingCategory": client.find("product-categories", "tenantSlugKey", f"{tenant_id}:{CATEGORY_SLUG}"),
        "existingProducts": client.all("products", {
            "where[tenant.slug][equals]": TENANT_SLUG,
            "where[sourceSystem][equals]": PRODUCT_SOURCE,
            "depth": 1,
        }),
        "existingMedia": client.all("media", {
            "where[tenant.slug][equals]": TENANT_SLUG,
            "where[sourceSystem][equals]": MEDIA_SOURCE,
            "depth": 0,
        }),
    }
    write_json(args.base_dir / "backups" / f"before-import-{datetime.now().strftime('%Y%m%d-%H%M%S')}.json", backup)

    category = backup["existingCategory"]
    category_data = gaming_category_payload(tenant_id)
    if category and category.get("sourceChecksum") == category_data["sourceChecksum"]:
        category_action = "unchanged"
    elif args.apply:
        category = client.update("product-categories", category["id"], category_data) if category else client.create("product-categories", category_data)
        category_action = "updated" if backup["existingCategory"] else "created"
    else:
        category = category or {"id": "dry-category-gaming", **category_data}
        category_action = "updated" if backup["existingCategory"] else "created"

    image_path = args.base_dir / "generated" / "x24-gm-001.png"
    if not image_path.exists():
        raise RuntimeError(f"Missing image: {image_path}")
    media_identity = f"{tenant_id}:{MEDIA_SOURCE}:x24-gm-001"
    media = client.find("media", "tenantSourceKey", media_identity)
    if media:
        media_action = "unchanged"
    else:
        media_payload = {
            "tenant": tenant_id,
            "alt": "Áo gaming X24 GM-001 xanh dương vàng cho đội esports",
            "sourceSystem": MEDIA_SOURCE,
            "sourceId": "x24-gm-001",
            "sourceUrl": f"local-generated:{image_path.name}",
            "sourceChecksum": file_checksum(image_path),
            "searchTags": [
                {"value": "gaming"},
                {"value": "esports"},
                {"value": "xanh dương vàng"},
            ],
        }
        media = client.upload_media(image_path, media_payload) if args.apply else {"id": "dry-media-gm-001", **media_payload}
        media_action = "created"

    product_data = product_payload(tenant_id, category["id"], media["id"])
    existing = client.find("products", "tenantSourceKey", f"{tenant_id}:{PRODUCT_SOURCE}:{PRODUCT_CODE}")
    if not existing:
        existing = client.find("products", "tenantSlugKey", f"{tenant_id}:{product_data['slug']}")
    if existing and existing.get("sourceChecksum") == product_data["sourceChecksum"]:
        product = existing
        product_action = "unchanged"
    elif args.apply:
        product = client.update("products", existing["id"], product_data) if existing else client.create("products", product_data)
        product_action = "updated" if existing else "created"
    else:
        product = existing or {"id": "dry-product-gm-001", **product_data}
        product_action = "updated" if existing else "created"

    report = {
        "apply": args.apply,
        "category": {"action": category_action, "id": category.get("id"), "slug": CATEGORY_SLUG},
        "media": {"action": media_action, "id": media.get("id"), "url": media.get("url")},
        "product": {
            "action": product_action,
            "id": product.get("id"),
            "slug": product_data["slug"],
            "name": product_data["name"],
        },
        "errors": [],
    }
    write_json(args.base_dir / "reports" / f"import-report-{datetime.now().strftime('%Y%m%d-%H%M%S')}.json", report)
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except requests.HTTPError as error:
        detail = error.response.text[:800] if error.response is not None else ""
        print(f"HTTP error: {error} {detail}", file=sys.stderr)
        raise SystemExit(1)
