#!/usr/bin/env python3
"""Import generated X24Sport billiards products into Payload.

Dry-run is the default. Pass --apply to create/update records.
"""

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
PRODUCT_SOURCE = "x24-billiards-batch"
MEDIA_SOURCE = "x24-billiards-imagegen"
SOURCE_TIMESTAMP = "2026-07-17T07:15:00+00:00"

SPECS = [
    ("541", "Trắng Đen Xám", "trang-den-xam", "Polo bi-a sáng màu với mảng trắng chủ đạo, điểm nhấn đen, xám và cam cho đội câu lạc bộ thích phong cách gọn gàng."),
    ("534", "Đen Trắng Cam", "den-trang-cam", "Polo bi-a phối trắng đen cùng dải cam nổi bật, hợp làm đồng phục thi đấu câu lạc bộ và giải phong trào."),
    ("119", "Đen Đỏ Xanh", "den-do-xanh", "Áo bi-a nền đen với mảng đỏ, xanh và trắng sắc nét, tạo cảm giác mạnh mẽ nhưng vẫn lịch sự khi lên bàn đấu."),
    ("051", "Đen Xanh Vàng Tím", "den-xanh-vang-tim", "Áo bi-a nền đen chuyển sắc xanh, vàng và tím, phù hợp đội nhóm muốn mẫu áo nổi bật dưới ánh đèn phòng bi-a."),
    ("126", "Đen Cam Xám", "den-cam-xam", "Polo bi-a đen cam với họa tiết chuyển động, dễ phối quần dài đen cho luyện tập và thi đấu."),
    ("171", "Đen Vàng Cam", "den-vang-cam", "Áo bi-a đen vàng cam mang năng lượng thi đấu rõ nét, phù hợp đồng phục câu lạc bộ và đội giải."),
    ("175", "Đen Cam Xanh", "den-cam-xanh", "Mẫu áo bi-a nền đen với mảng cam, xanh và vàng, tạo điểm nhấn hiện đại khi đứng cạnh bàn xanh."),
    ("176", "Đen Trắng Cam", "den-trang-cam-2", "Polo bi-a phối đen, trắng và cam với đường nét thể thao, hợp đội nam nữ mặc đồng bộ quần dài."),
    ("217", "Đen Xám Xanh", "den-xam-xanh", "Áo bi-a tông đen xám điểm xanh, tối giản và lịch sự cho câu lạc bộ, đội thi đấu hoặc nhân sự phòng bi-a."),
    ("406", "Đen Tím", "den-tim", "Polo bi-a đen tím với phom gọn, tạo vẻ lịch lãm và khác biệt cho đội nhóm khi thi đấu."),
    ("327", "Đen Đỏ", "den-do", "Áo bi-a đen đỏ thiên tối, dễ mặc, phù hợp đội cần đồng phục có điểm nhấn nhưng không quá rực."),
    ("493", "Hồng Đen", "hong-den", "Polo bi-a hồng đen chuyển sắc, nổi bật vừa đủ cho đội nam nữ muốn hình ảnh trẻ trung trong phòng bi-a."),
    ("507", "Trắng Xanh Mint Xanh Ve Chai", "trang-xanh-mint-xanh-ve-chai", "Áo bi-a trắng xanh mint và xanh ve chai, sáng sạch, hợp đội nhóm thích phong cách tươi nhưng vẫn chuyên nghiệp."),
    ("509", "Trắng Hồng Nhạt Đỏ", "trang-hong-nhat-do", "Polo bi-a trắng hồng nhạt chuyển đỏ, mềm mắt và nổi bật trong ảnh đội, giải đấu hoặc sự kiện câu lạc bộ."),
    ("551", "Tím Than Xanh Dương Trắng", "tim-than-xanh-duong-trang", "Áo bi-a tím than xanh dương chuyển trắng, cảm giác mát, sạch và hiện đại khi phối quần dài đen."),
]


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
        email = data.get("email")
        password = data.get("password")
    except json.JSONDecodeError:
        fields: dict[str, str] = {}
        for line in raw.splitlines():
            match = re.match(r"\s*(email|password)\s*[:=]\s*(.+?)\s*$", line, re.I)
            if match:
                fields[match.group(1).lower()] = match.group(2)
        email = fields.get("email")
        password = fields.get("password")
    if not email or not password:
        raise RuntimeError("Could not parse CMS credentials")
    return str(email), str(password)


def load_credentials(args: argparse.Namespace) -> tuple[str, str]:
    if os.environ.get("CMS_EMAIL") and os.environ.get("CMS_PASSWORD"):
        return os.environ["CMS_EMAIL"], os.environ["CMS_PASSWORD"]
    if args.credentials:
        return parse_credentials(Path(args.credentials).read_text(encoding="utf-8"))
    if args.remote_credentials_host:
        result = subprocess.run(
            ["ssh", args.remote_credentials_host, "cat", args.remote_credentials_path],
            check=True,
            capture_output=True,
            text=True,
        )
        return parse_credentials(result.stdout)
    raise RuntimeError("Provide CMS_EMAIL/CMS_PASSWORD, --credentials, or --remote-credentials-host")


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


def product_html(code: str, color_label: str, intro: str) -> str:
    return f"""
<p><strong>Áo bi-a X24 BA-{code}</strong> là mẫu polo thể thao dành cho câu lạc bộ bi-a, đội thi đấu phong trào và nhóm người chơi muốn đồng phục lịch sự khi ra bàn. Thiết kế giữ phom áo có cổ gọn gàng, phối cùng quần dài đen để phù hợp không gian billiards.</p>
<h2>Điểm nổi bật của mẫu BA-{code}</h2>
<ul>
  <li>Phối màu {color_label.lower()} dễ nhận diện, phù hợp chụp ảnh đội và thi đấu câu lạc bộ.</li>
  <li>Họa tiết lấy cảm hứng từ bi-a: đường cơ, bóng 8 và các nét chuyển động tinh tế trên thân áo.</li>
  <li>Phom polo ngắn tay gọn, dễ mặc cho nam và nữ khi kết hợp quần dài đen.</li>
  <li>Phù hợp đặt đồng phục bi-a theo nhóm, câu lạc bộ, giải đấu hoặc nhân sự phòng bi-a.</li>
</ul>
<h2>Gợi ý sử dụng</h2>
<p>{intro} Shop có thể tư vấn thêm size, màu in, tên đội, logo câu lạc bộ và số lượng theo nhu cầu thực tế.</p>
""".strip()


def build_product_payload(tenant_id: Any, category_id: Any, media_id: Any, code: str, color_label: str, color_slug: str, intro: str) -> dict[str, Any]:
    name = f"Áo bi-a X24 BA-{code} {color_label}"
    slug = f"ao-bi-a-x24-ba-{code}-{color_slug}"
    short = f"{intro} Mẫu polo bi-a nam nữ phối quần dài đen, phù hợp câu lạc bộ và giải đấu."
    data: dict[str, Any] = {
        "tenant": tenant_id,
        "name": name,
        "slug": slug,
        "sku": f"X24-BA-{code}",
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
        "shortDescription": short[:4000],
        "contentHtml": product_html(code, color_label, intro),
        "legacyPath": f"/{slug}/",
        "publicationStatus": "publish",
        "sourceSystem": PRODUCT_SOURCE,
        "sourceId": code,
        "sourceModifiedAt": SOURCE_TIMESTAMP,
        "sourceCreatedAt": SOURCE_TIMESTAMP,
        "seoTitle": f"{name} | Polo bi-a nam nữ X24Sport",
        "metaDescription": f"{name}: polo bi-a nam nữ phối quần dài đen, họa tiết bóng 8 và đường cơ tinh tế cho câu lạc bộ, đội nhóm, giải đấu.",
        "searchTags": [
            {"value": "bi-a"},
            {"value": "billiards"},
            {"value": "polo bi-a"},
            {"value": color_label.lower()},
            {"value": "quần dài"},
        ],
        "sourceTags": [
            {"name": "Áo bi-a", "slug": "ao-bi-a"},
            {"name": "Đồng phục bi-a", "slug": "dong-phuc-bi-a"},
        ],
        "attributes": [
            {"name": "Bộ môn", "values": [{"value": "Bi-a"}]},
            {"name": "Màu sắc", "values": [{"value": color_label}]},
            {"name": "Trang phục phối cùng", "values": [{"value": "Quần dài đen"}]},
        ],
        "categories": [category_id],
        "gallery": [media_id],
        "badges": [{"label": "Bi-a"}, {"label": "Polo có cổ"}],
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
    category = client.find("product-categories", "tenantSlugKey", f"{tenant_id}:bi-a")
    if not category:
        category = client.find("product-categories", "slug", "bi-a")
    if not category:
        raise RuntimeError("Category bi-a not found")
    category_id = category["id"]

    backup = {
        "createdAt": now_iso(),
        "tenant": tenant,
        "category": category,
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
    if int(category.get("productCount") or 0) != len(SPECS):
        if args.apply:
            category = client.update("product-categories", category_id, {"productCount": len(SPECS)})
        print(f"category=bi-a productCount {category.get('productCount')} -> {len(SPECS)}")

    generated_dir = args.base_dir / "generated"
    report: dict[str, Any] = {"apply": args.apply, "products": [], "media": [], "errors": []}
    for code, color_label, color_slug, intro in SPECS:
        image_path = generated_dir / f"x24-ba-{code}.png"
        if not image_path.exists():
            raise RuntimeError(f"Generated image is missing: {image_path}")
        media_source_id = f"x24-ba-{code}"
        media_identity = f"{tenant_id}:{MEDIA_SOURCE}:{media_source_id}"
        media = client.find("media", "tenantSourceKey", media_identity)
        if media:
            media_action = "unchanged"
        else:
            media_payload = {
                "tenant": tenant_id,
                "alt": f"Áo bi-a X24 BA-{code} màu {color_label} phối quần dài đen",
                "sourceSystem": MEDIA_SOURCE,
                "sourceId": media_source_id,
                "sourceUrl": f"local-generated:{image_path.name}",
                "sourceChecksum": file_checksum(image_path),
                "searchTags": [
                    {"value": "bi-a"},
                    {"value": "polo bi-a"},
                    {"value": color_label.lower()},
                ],
            }
            if args.apply:
                media = client.upload_media(image_path, media_payload)
            else:
                media = {"id": f"dry-media-{code}", **media_payload}
            media_action = "created"
        report["media"].append({"code": code, "action": media_action, "id": media.get("id")})

        data = build_product_payload(tenant_id, category_id, media["id"], code, color_label, color_slug, intro)
        existing = client.find("products", "tenantSourceKey", f"{tenant_id}:{PRODUCT_SOURCE}:{code}")
        if not existing:
            existing = client.find("products", "tenantSlugKey", f"{tenant_id}:{data['slug']}")
        if existing and existing.get("sourceChecksum") == data.get("sourceChecksum"):
            action = "unchanged"
            product = existing
        elif args.apply:
            if existing:
                product = client.update("products", existing["id"], data)
                action = "updated"
            else:
                product = client.create("products", data)
                action = "created"
        else:
            product = existing or {"id": f"dry-product-{code}", **data}
            action = "updated" if existing else "created"
        report["products"].append({
            "code": code,
            "action": action,
            "id": product.get("id"),
            "slug": data["slug"],
            "name": data["name"],
        })
        print(f"{code}: media={media_action} product={action} slug={data['slug']}")

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
