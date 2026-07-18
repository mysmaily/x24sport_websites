#!/usr/bin/env python3
"""Idempotently publish X24-PB-500 to the x24sport Payload tenant."""

from __future__ import annotations

import argparse
import hashlib
import json
import mimetypes
import subprocess
import urllib.error
import urllib.parse
import urllib.request
import uuid
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parent
IMAGE_PATH = ROOT / "final" / "x24-pb-500-clean.webp"
SECRET_HOST = "root@10.10.0.28"
SECRET_PATH = "/root/sports-cms/x24sport-rest-api.env"
TENANT_SLUG = "x24sport"
SKU = "X24-PB-500"
PRODUCT_SLUG = "bo-quan-ao-pickleball-x24-pb-500-noi-bat"
SOURCE_IMAGE_URL = (
    "https://cdn.mayaopickleball.vn/wp-content/uploads/2026/07/"
    "bo-quan-ao-pickleball-x24-pb-500-noi-bat-nang-dong-ao-co-tay-co-co.webp"
)


def load_remote_env() -> dict[str, str]:
    result = subprocess.run(
        ["ssh", SECRET_HOST, "cat", SECRET_PATH],
        check=True,
        capture_output=True,
        text=True,
    )
    values: dict[str, str] = {}
    for line in result.stdout.splitlines():
        if "=" in line:
            key, value = line.split("=", 1)
            values[key] = value
    if not values.get("CMS_API_URL") or not values.get("PAYLOAD_API_KEY"):
        raise RuntimeError("REST credential file is incomplete")
    return values


class PayloadClient:
    def __init__(self, base_url: str, api_key: str) -> None:
        self.base_url = base_url.rstrip("/")
        self.headers = {
            "Accept": "application/json",
            "Authorization": f"users API-Key {api_key}",
        }

    def request(
        self,
        method: str,
        path: str,
        payload: dict[str, Any] | None = None,
        body: bytes | None = None,
        content_type: str | None = None,
    ) -> tuple[int, dict[str, Any]]:
        headers = dict(self.headers)
        if payload is not None:
            body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
            content_type = "application/json"
        if content_type:
            headers["Content-Type"] = content_type
        request = urllib.request.Request(
            self.base_url + path,
            data=body,
            headers=headers,
            method=method,
        )
        try:
            with urllib.request.urlopen(request, timeout=60) as response:
                data = json.load(response)
                return response.status, data
        except urllib.error.HTTPError as error:
            detail = error.read().decode("utf-8", errors="replace")
            raise RuntimeError(f"{method} {path} returned {error.code}: {detail[:800]}") from error

    def find_one(self, collection: str, where: dict[str, str], depth: int = 1) -> dict[str, Any] | None:
        query: dict[str, str] = {"limit": "1", "depth": str(depth)}
        for field, value in where.items():
            query[f"where[{field}][equals]"] = value
        _, result = self.request("GET", f"/api/{collection}?{urllib.parse.urlencode(query)}")
        docs = result.get("docs") or []
        return docs[0] if docs else None

    def upload(self, collection: str, fields: dict[str, Any], file_path: Path) -> dict[str, Any]:
        boundary = f"----x24sport-{uuid.uuid4().hex}"
        chunks: list[bytes] = []

        def add(value: bytes) -> None:
            chunks.append(value)

        add(f"--{boundary}\r\n".encode())
        add(b'Content-Disposition: form-data; name="_payload"\r\n')
        add(b"Content-Type: application/json; charset=utf-8\r\n\r\n")
        add(json.dumps(fields, ensure_ascii=False).encode("utf-8"))
        add(b"\r\n")
        add(f"--{boundary}\r\n".encode())
        add(
            f'Content-Disposition: form-data; name="file"; filename="{file_path.name}"\r\n'.encode()
        )
        add(f"Content-Type: {mimetypes.guess_type(file_path.name)[0] or 'application/octet-stream'}\r\n\r\n".encode())
        add(file_path.read_bytes())
        add(b"\r\n")
        add(f"--{boundary}--\r\n".encode())
        _, result = self.request(
            "POST",
            f"/api/{collection}",
            body=b"".join(chunks),
            content_type=f"multipart/form-data; boundary={boundary}",
        )
        return unwrap(result)


def unwrap(result: dict[str, Any]) -> dict[str, Any]:
    return result.get("doc", result)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="Create/update CMS records")
    args = parser.parse_args()

    if not IMAGE_PATH.is_file():
        raise SystemExit(f"Missing image: {IMAGE_PATH}")

    env = load_remote_env()
    client = PayloadClient(env["CMS_API_URL"], env["PAYLOAD_API_KEY"])
    tenant = client.find_one("tenants", {"slug": TENANT_SLUG}, depth=0)
    if not tenant:
        raise SystemExit("x24sport tenant not found")

    categories: dict[str, dict[str, Any] | None] = {
        slug: client.find_one(
            "product-categories",
            {"tenant.slug": TENANT_SLUG, "slug": slug},
            depth=1,
        )
        for slug in ("pickleball", "do-pickleball", "ao-pickleball")
    }
    if not categories["pickleball"] or not categories["do-pickleball"]:
        raise SystemExit("Required Pickleball parent categories are missing")

    existing_product = client.find_one(
        "products", {"tenant.slug": TENANT_SLUG, "sku": SKU}, depth=1
    )
    existing_media = client.find_one(
        "media",
        {"tenant.slug": TENANT_SLUG, "sourceId": "x24-pb-500-primary"},
        depth=0,
    )

    plan = {
        "tenant_id": tenant["id"],
        "category_action": "update" if categories["ao-pickleball"] else "create",
        "media_action": "reuse" if existing_media else "upload",
        "product_action": "update" if existing_product else "create",
        "sku": SKU,
        "image_sha256": hashlib.sha256(IMAGE_PATH.read_bytes()).hexdigest(),
    }
    if not args.apply:
        print(json.dumps({"dry_run": True, **plan}, ensure_ascii=False, indent=2))
        return

    category_payload = {
        "tenant": tenant["id"],
        "name": "Áo Pickleball",
        "slug": "ao-pickleball",
        "parent": categories["do-pickleball"]["id"],
        "group": "type",
        "description": (
            "Áo pickleball nam nữ, polo pickleball, áo thi đấu và đồng phục "
            "câu lạc bộ thiết kế theo yêu cầu."
        ),
        "legacyPath": "/do-pickleball/ao-pickleball/",
        "sourceSystem": "manual",
        "sourceId": "x24-category-ao-pickleball",
        "order": 2023,
    }
    if categories["ao-pickleball"]:
        _, result = client.request(
            "PATCH",
            f"/api/product-categories/{categories['ao-pickleball']['id']}",
            category_payload,
        )
        áo_pickleball = unwrap(result)
    else:
        category_payload["productCount"] = 0
        _, result = client.request("POST", "/api/product-categories", category_payload)
        áo_pickleball = unwrap(result)

    if existing_media:
        media = existing_media
    else:
        media = client.upload(
            "media",
            {
                "tenant": tenant["id"],
                "alt": "Bộ quần áo pickleball X24-PB-500 áo có tay có cổ cho nam nữ",
                "sourceSystem": "manual-cleanup",
                "sourceId": "x24-pb-500-primary",
                "sourceUrl": SOURCE_IMAGE_URL,
                "sourceChecksum": plan["image_sha256"],
                "searchTags": [
                    {"value": "pickleball"},
                    {"value": "áo có cổ"},
                    {"value": "đỏ xanh"},
                ],
            },
            IMAGE_PATH,
        )

    media_url = media.get("url")
    if not media_url:
        raise RuntimeError("Uploaded media has no public URL")

    content_html = f"""
<p><strong>Bộ Quần Áo Pickleball X24-PB-500 Nổi Bật</strong> sử dụng tông đỏ, vàng, xanh dương và xanh ngọc, tạo nhận diện rõ ràng cho đội nhóm trên sân.</p>
<figure><img src="{media_url}" alt="Bộ quần áo pickleball X24-PB-500 áo có tay có cổ cho nam nữ" width="1254" height="1254" /></figure>
<h2>Thiết kế áo pickleball có tay, có cổ</h2>
<p>Mẫu áo polo có tay và có cổ dành cho cả nam và nữ, phối cùng quần short hoặc chân váy thể thao. Kiểu dáng phù hợp luyện tập, câu lạc bộ, đội phong trào và đồng phục giải đấu.</p>
<h2>Tùy chỉnh cho đội nhóm</h2>
<p>X24Sport hỗ trợ tư vấn phối size nam nữ, thêm tên đội, số áo hoặc logo để tạo bộ trang phục đồng nhất theo nhu cầu thực tế.</p>
""".strip()

    product_payload = {
        "tenant": tenant["id"],
        "name": "Bộ Quần Áo Pickleball X24-PB-500 Nổi Bật",
        "slug": PRODUCT_SLUG,
        "sku": SKU,
        "sport": "pickleball",
        "productType": "simple",
        "publicationStatus": "publish",
        "featured": True,
        "categories": [
            categories["pickleball"]["id"],
            categories["do-pickleball"]["id"],
            áo_pickleball["id"],
        ],
        "price": 129000,
        "compareAtPrice": 159000,
        "currency": "VND",
        "stockStatus": "instock",
        "isPurchasable": False,
        "isOnBackorder": False,
        "shortDescription": (
            "Bộ quần áo pickleball X24-PB-500 phối màu nổi bật, áo polo có tay "
            "có cổ cho nam nữ, phù hợp câu lạc bộ và đồng phục đội nhóm."
        ),
        "contentHtml": content_html,
        "legacyPath": f"/{PRODUCT_SLUG}/",
        "gallery": [media["id"]],
        "badges": [{"label": "Đặt may"}, {"label": "In tên số"}],
        "searchTags": [
            {"value": "nổi bật"},
            {"value": "áo pickleball có cổ"},
            {"value": "đồng phục pickleball"},
        ],
        "seoTitle": "Bộ Quần Áo Pickleball X24-PB-500 Nổi Bật",
        "metaDescription": (
            "Mẫu X24-PB-500 phối màu nổi bật, áo pickleball có tay có cổ cho "
            "nam nữ, phù hợp câu lạc bộ và đồng phục đội nhóm."
        ),
        "sourceSystem": "cms-copy",
        "sourceId": "mayaopickleball:1166",
    }
    if existing_product:
        _, result = client.request(
            "PATCH", f"/api/products/{existing_product['id']}", product_payload
        )
        product = unwrap(result)
    else:
        _, result = client.request("POST", "/api/products", product_payload)
        product = unwrap(result)

    count_query = urllib.parse.urlencode(
        {
            "where[tenant.slug][equals]": TENANT_SLUG,
            "where[categories.slug][equals]": "ao-pickleball",
            "limit": "1",
            "depth": "0",
        }
    )
    _, count_result = client.request("GET", f"/api/products?{count_query}")
    product_count = int(count_result.get("totalDocs") or 0)
    client.request(
        "PATCH",
        f"/api/product-categories/{áo_pickleball['id']}",
        {"productCount": product_count},
    )

    print(
        json.dumps(
            {
                "dry_run": False,
                **plan,
                "category_id": áo_pickleball["id"],
                "media_id": media["id"],
                "media_url": media_url,
                "product_id": product["id"],
                "product_slug": product["slug"],
                "category_product_count": product_count,
            },
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
