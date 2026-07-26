#!/usr/bin/env python3
"""Import Dropbox basketball apparel images into the mayaobongro Payload catalog."""

from __future__ import annotations

import argparse
import hashlib
import html
import json
import mimetypes
import re
import subprocess
import sys
import time
import unicodedata
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import requests
from PIL import Image


TENANT_SLUG = "mayaobongro"
SOURCE_SYSTEM = "dropbox-basketball-products-20260724"
MEDIA_SOURCE_SYSTEM = "dropbox-basketball-media-20260724"
IMPORT_TIMESTAMP = "2026-07-24T06:50:00.000Z"

ROOT = Path("/Volumes/Data/x24_project/dropbox_downloads/mayaobongro_anhdongdau_dangweb")
FOLDERS = [
    ("tre-em", "Trẻ em", ROOT / "TRẺ EM", "KID"),
    ("nguoi-lon", "Người lớn", ROOT / "NGƯỜI LỚN", "ADULT"),
]

BASE_CATEGORIES = [
    {
        "name": "Bóng rổ",
        "slug": "bong-ro",
        "group": "sport",
        "description": "Danh mục sản phẩm bóng rổ cho luyện tập, thi đấu, đội nhóm, trường học và câu lạc bộ.",
        "order": 10,
    },
    {
        "name": "Áo bóng rổ",
        "slug": "ao-bong-ro",
        "group": "type",
        "description": "Mẫu áo bóng rổ jersey, áo ba lỗ bóng rổ và đồng phục bóng rổ có thể tùy chỉnh theo đội.",
        "order": 20,
    },
    {
        "name": "Bộ quần áo bóng rổ",
        "slug": "bo-quan-ao-bong-ro",
        "group": "type",
        "description": "Danh mục catalog chính cho các mẫu bộ quần áo bóng rổ, jersey bóng rổ và đồng phục bóng rổ thiết kế theo yêu cầu.",
        "order": 25,
    },
]

AGE_CATEGORIES = [
    {
        "name": "Trẻ em",
        "slug": "tre-em",
        "group": "tag",
        "description": "Các mẫu áo bóng rổ cho trẻ em, học sinh, lớp học, đội tuyển trường và trung tâm đào tạo.",
        "order": 100,
    },
    {
        "name": "Người lớn",
        "slug": "nguoi-lon",
        "group": "tag",
        "description": "Các mẫu áo bóng rổ cho người lớn, đội phong trào, câu lạc bộ, công ty và giải đấu nội bộ.",
        "order": 110,
    },
]

COLOR_CATEGORIES = [
    ("den", "Đen", "Các mẫu áo bóng rổ có màu đen chiếm tỷ lệ đáng kể trên thân áo.", 300),
    ("trang", "Trắng", "Các mẫu áo bóng rổ có màu trắng chiếm tỷ lệ đáng kể trên thân áo.", 310),
    ("do", "Đỏ", "Các mẫu áo bóng rổ có màu đỏ chiếm tỷ lệ đáng kể trên thân áo.", 320),
    ("do-do", "Đỏ đô", "Các mẫu áo bóng rổ có tông đỏ đô hoặc burgundy làm màu chủ đạo.", 321),
    ("cam", "Cam", "Các mẫu áo bóng rổ có màu cam chiếm tỷ lệ đáng kể trên thân áo.", 330),
    ("vang", "Vàng", "Các mẫu áo bóng rổ có màu vàng chiếm tỷ lệ đáng kể trên thân áo, không tính viền nhỏ.", 340),
    ("xanh-bich", "Xanh bích", "Các mẫu áo bóng rổ có tông xanh bích hoặc cyan chiếm tỷ lệ đáng kể.", 350),
    ("xanh-duong", "Xanh dương", "Các mẫu áo bóng rổ có tông xanh dương chiếm tỷ lệ đáng kể.", 351),
    ("xanh-ngoc", "Xanh ngọc", "Các mẫu áo bóng rổ có tông xanh ngọc hoặc mint chiếm tỷ lệ đáng kể.", 352),
    ("xanh-ve-chai", "Xanh ve chai", "Các mẫu áo bóng rổ có tông xanh ve chai hoặc teal đậm làm màu chính.", 353),
    ("xanh-la", "Xanh lá", "Các mẫu áo bóng rổ có màu xanh lá chiếm tỷ lệ đáng kể trên thân áo.", 354),
    ("tim", "Tím", "Các mẫu áo bóng rổ có màu tím chiếm tỷ lệ đáng kể trên thân áo.", 360),
    ("tim-than", "Tím than", "Các mẫu áo bóng rổ có tông tím than hoặc tím đậm làm màu chính.", 361),
    ("hong", "Hồng", "Các mẫu áo bóng rổ có màu hồng chiếm tỷ lệ đáng kể trên thân áo.", 370),
    ("xam", "Xám", "Các mẫu áo bóng rổ có màu xám chiếm tỷ lệ đáng kể trên thân áo.", 380),
    ("kem", "Kem", "Các mẫu áo bóng rổ có màu kem hoặc be sáng chiếm tỷ lệ đáng kể trên thân áo.", 390),
]

FILENAME_COLOR_PATTERNS = [
    (re.compile(r"tim\s*than|timthan", re.I), "tim-than"),
    (re.compile(r"xanh\s*ve\s*chai|xanhvechai", re.I), "xanh-ve-chai"),
    (re.compile(r"xanh\s*bich|xanhbich", re.I), "xanh-bich"),
    (re.compile(r"xanh\s*ngoc|xanhngoc|xanh\s*mint|xanhmint", re.I), "xanh-ngoc"),
    (re.compile(r"xanh\s*la|xanhly|xanh\s*ly", re.I), "xanh-la"),
    (re.compile(r"xanh\s*ya|xanhya|xanh\s*mc|xanhmc", re.I), "xanh-duong"),
    (re.compile(r"do\s*do|dodo|đỏ\s*đô", re.I), "do-do"),
    (re.compile(r"\bden\b|đen", re.I), "den"),
    (re.compile(r"\btrang\b|trăng|trắng", re.I), "trang"),
    (re.compile(r"\bdo\b|đỏ", re.I), "do"),
    (re.compile(r"\bcam\b", re.I), "cam"),
    (re.compile(r"\bvang\b|vàng", re.I), "vang"),
    (re.compile(r"\btim\b|tím", re.I), "tim"),
    (re.compile(r"\bhong\b|hồng", re.I), "hong"),
    (re.compile(r"\bxam\b|xám", re.I), "xam"),
    (re.compile(r"\bkem\b|kêm|beo|be\b", re.I), "kem"),
]

COLOR_META = {slug: {"name": name, "description": description, "order": order} for slug, name, description, order in COLOR_CATEGORIES}


@dataclass
class ProductAsset:
    index: int
    age_slug: str
    age_label: str
    sku_prefix: str
    path: Path
    source_id: str
    sku: str
    slug: str
    design_code: str
    design_label: str
    color_slugs: list[str]
    color_names: list[str]
    checksum: str


def now_ms() -> int:
    return int(time.time() * 1000)


def stable_json(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def slugify(value: str) -> str:
    normalized = unicodedata.normalize("NFD", value)
    ascii_value = normalized.encode("ascii", "ignore").decode("ascii")
    return re.sub(r"[^a-z0-9]+", "-", ascii_value.lower()).strip("-")


def source_id_for(path: Path) -> str:
    rel = path.relative_to(ROOT).as_posix()
    digest = hashlib.sha1(rel.encode("utf-8")).hexdigest()[:12]
    return f"{rel}|{digest}"


def parse_design_code(path: Path) -> tuple[str, str]:
    name = path.stem
    match = re.search(r"(X24[-_. ]?BR[-_. ]?\d+)", name, re.I)
    if match:
        code = re.sub(r"[-_. ]+", "-", match.group(1).upper())
        label = code
    else:
        match = re.search(r"BR[-_. ]?(\d+)", name, re.I)
        if match:
            code = f"X24-BR-{int(match.group(1)):02d}"
            label = code
        else:
            short = hashlib.sha1(name.encode("utf-8")).hexdigest()[:6].upper()
            code = f"X24-BR-{short}"
            label = "mẫu thiết kế riêng"
    nickname = re.search(r"\(([^)]+)\)", name)
    if nickname:
        label = f"{label} {nickname.group(1).strip()}"
    return code, label


def filename_color_slugs(path: Path) -> list[str]:
    text = unicodedata.normalize("NFC", path.stem)
    found: list[str] = []
    for pattern, slug in FILENAME_COLOR_PATTERNS:
        if pattern.search(text) and slug not in found:
            found.append(slug)
    return found


def rgb_to_color_slug(r: int, g: int, b: int) -> str | None:
    mx, mn = max(r, g, b), min(r, g, b)
    sat = 0 if mx == 0 else (mx - mn) / mx
    if mx < 45:
        return "den"
    if mx > 220 and sat < 0.16:
        return "trang"
    if sat < 0.14 and 70 <= mx <= 210:
        return "xam"
    if r > 170 and g < 105 and b < 110:
        return "do-do" if r < 205 and b > 45 else "do"
    if r > 180 and 95 <= g <= 170 and b < 85:
        return "cam"
    if r > 175 and g > 155 and b < 95:
        return "vang"
    if b > 140 and g > 115 and r < 105:
        return "xanh-bich"
    if b > 120 and g > 80 and r < 115:
        return "xanh-duong"
    if g > 135 and b > 105 and r < 125:
        return "xanh-ngoc"
    if g > 95 and b < 125 and r < 120:
        return "xanh-la"
    if g > 75 and b > 70 and r < 80:
        return "xanh-ve-chai"
    if b > 105 and r > 95 and g < 100:
        return "tim-than" if mx < 155 else "tim"
    if r > 175 and b > 130 and g < 135:
        return "hong"
    if r > 185 and g > 165 and b > 120 and sat < 0.35:
        return "kem"
    return None


def dominant_image_colors(path: Path) -> list[str]:
    counts: dict[str, int] = {}
    with Image.open(path) as image:
        image = image.convert("RGB")
        image.thumbnail((220, 220))
        width, height = image.size
        pixels = image.load()
        total = 0
        for y in range(height):
            for x in range(width):
                r, g, b = pixels[x, y]
                mx, mn = max(r, g, b), min(r, g, b)
                # Skip mostly white studio backgrounds and faint shadows.
                if mx > 238 and mx - mn < 22:
                    continue
                slug = rgb_to_color_slug(r, g, b)
                if not slug:
                    continue
                counts[slug] = counts.get(slug, 0) + 1
                total += 1
    if total == 0:
        return []
    ranked = sorted(counts.items(), key=lambda item: item[1], reverse=True)
    # A color must occupy a meaningful part of the non-background image.
    return [slug for slug, count in ranked if count / total >= 0.12][:3]


def choose_color_slugs(path: Path) -> list[str]:
    from_name = filename_color_slugs(path)
    # Dropbox filenames come from the product design catalog and usually carry
    # the intended jersey color. Use that as the primary signal so skin,
    # mannequin shadows, gray studio backgrounds, and thin trim lines do not
    # become shopper-facing color tags.
    if from_name:
        return from_name[:3]

    from_image = dominant_image_colors(path)
    return [slug for slug in from_image if slug not in {"xam", "kem"}][:3]


def discover_assets() -> list[ProductAsset]:
    assets: list[ProductAsset] = []
    for age_slug, age_label, folder, sku_prefix in FOLDERS:
        if not folder.exists():
            raise RuntimeError(f"Folder does not exist: {folder}")
        files = sorted(
            path for path in folder.iterdir()
            if path.is_file() and path.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}
        )
        for index, path in enumerate(files, 1):
            design_code, design_label = parse_design_code(path)
            source_id = source_id_for(path)
            color_slugs = choose_color_slugs(path)
            color_names = [COLOR_META[slug]["name"] for slug in color_slugs if slug in COLOR_META]
            color_part = "-".join(color_slugs) if color_slugs else "nhieu-mau"
            sku = f"X24-BR-DBX-{sku_prefix}-{index:03d}"
            slug_age_part = f"{age_label}-" if age_slug == "tre-em" else ""
            slug = slugify(f"ao-bong-ro-{slug_age_part}{design_code}-{color_part}-{index:03d}")
            assets.append(
                ProductAsset(
                    index=index,
                    age_slug=age_slug,
                    age_label=age_label,
                    sku_prefix=sku_prefix,
                    path=path,
                    source_id=source_id,
                    sku=sku,
                    slug=slug,
                    design_code=design_code,
                    design_label=design_label,
                    color_slugs=color_slugs,
                    color_names=color_names,
                    checksum=sha256_file(path),
                )
            )
    return assets


def read_credentials(command: str | None, path: Path | None) -> tuple[str, str]:
    if command:
        raw = subprocess.check_output(command, shell=True, text=True)
    elif path:
        raw = path.read_text(encoding="utf-8")
    else:
        raise RuntimeError("Provide --credentials-command or --credentials")

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


class PayloadClient:
    def __init__(self, base_url: str, email: str, password: str, dry_run: bool) -> None:
        self.base_url = base_url.rstrip("/")
        self.session = requests.Session()
        self.session.headers.update({"Accept": "application/json", "User-Agent": "X24Sport-Dropbox-Importer/1.0"})
        response = self.session.post(f"{self.base_url}/api/users/login", json={"email": email, "password": password}, timeout=45)
        response.raise_for_status()
        self.session.headers["Authorization"] = f"Bearer {response.json()['token']}"
        self.dry_run = dry_run

    def find_one(self, collection: str, params: dict[str, Any]) -> dict[str, Any] | None:
        response = self.session.get(f"{self.base_url}/api/{collection}", params={**params, "limit": 1, "depth": 0}, timeout=45)
        response.raise_for_status()
        docs = response.json().get("docs", [])
        return docs[0] if docs else None

    def count(self, collection: str, params: dict[str, Any]) -> int:
        response = self.session.get(f"{self.base_url}/api/{collection}", params={**params, "limit": 1, "depth": 0}, timeout=45)
        response.raise_for_status()
        return int(response.json().get("totalDocs") or 0)

    def create_or_update(self, collection: str, data: dict[str, Any], existing: dict[str, Any] | None) -> tuple[str, dict[str, Any]]:
        if existing and existing.get("sourceChecksum") == data.get("sourceChecksum"):
            return "unchanged", existing
        if self.dry_run:
            action = "updated" if existing else "created"
            return action, existing or {"id": f"dry-{collection}-{slugify(data.get('slug') or data.get('sourceId') or collection)}"}
        if existing:
            response = self.session.patch(f"{self.base_url}/api/{collection}/{existing['id']}", json=data, timeout=90)
            action = "updated"
        else:
            response = self.session.post(f"{self.base_url}/api/{collection}", json=data, timeout=90)
            action = "created"
        response.raise_for_status()
        body = response.json()
        return action, body.get("doc", body)

    def upload_media(self, asset: ProductAsset, tenant_id: Any) -> tuple[str, dict[str, Any]]:
        identity = f"{tenant_id}:{MEDIA_SOURCE_SYSTEM}:{asset.source_id}"
        existing = self.find_one("media", {"where[tenantSourceKey][equals]": identity})
        payload = build_media_payload(asset, tenant_id)
        if existing and existing.get("sourceChecksum") == asset.checksum:
            if media_metadata_current(existing, payload):
                return "unchanged", existing
            if self.dry_run:
                return "updated", existing
            response = self.session.patch(f"{self.base_url}/api/media/{existing['id']}", json=payload, timeout=45)
            response.raise_for_status()
            body = response.json()
            return "updated", body.get("doc", body)
        if self.dry_run:
            return ("updated" if existing else "created"), existing or {"id": f"dry-media-{asset.sku}", "url": str(asset.path)}

        content_type = mimetypes.guess_type(asset.path.name)[0] or "image/jpeg"
        with asset.path.open("rb") as handle:
            files = {"file": (f"{asset.slug}{asset.path.suffix.lower()}", handle, content_type)}
            data = {"_payload": json.dumps(payload, ensure_ascii=False)}
            if existing:
                response = self.session.patch(f"{self.base_url}/api/media/{existing['id']}", data=data, files=files, timeout=180)
                action = "updated"
            else:
                response = self.session.post(f"{self.base_url}/api/media", data=data, files=files, timeout=180)
                action = "created"
        response.raise_for_status()
        body = response.json()
        return action, body.get("doc", body)


def category_checksum(data: dict[str, Any]) -> str:
    return hashlib.sha256(stable_json({key: value for key, value in data.items() if key != "tenant"}).encode()).hexdigest()


def build_category_data(tenant_id: Any, category: dict[str, Any]) -> dict[str, Any]:
    data = {
        "tenant": tenant_id,
        "name": category["name"],
        "slug": category["slug"],
        "group": category["group"],
        "description": category["description"],
        "order": category["order"],
        "sourceSystem": SOURCE_SYSTEM,
        "sourceId": f"category:{category['slug']}",
    }
    data["sourceChecksum"] = category_checksum(data)
    return data


def build_alt(asset: ProductAsset) -> str:
    color = ", ".join(asset.color_names) if asset.color_names else "nhiều màu"
    age_part = " trẻ em" if asset.age_slug == "tre-em" else ""
    return f"Mẫu áo bóng rổ{age_part} {asset.design_label} màu {color} tại X24 Sport"


def build_media_payload(asset: ProductAsset, tenant_id: Any) -> dict[str, Any]:
    return {
        "tenant": tenant_id,
        "alt": build_alt(asset),
        "sourceSystem": MEDIA_SOURCE_SYSTEM,
        "sourceId": asset.source_id,
        "sourceChecksum": asset.checksum,
        "sourceUrl": f"dropbox://15. X24 SPORT/4. Website/5. mayaobongro.vn/1. AnhDongDau - DangWeb/{asset.age_label}/{asset.path.name}",
        "searchTags": [{"value": tag} for tag in [asset.age_label, *asset.color_names, asset.design_code]],
    }


def media_metadata_current(existing: dict[str, Any], payload: dict[str, Any]) -> bool:
    current_tags = sorted(
        str(item.get("value") if isinstance(item, dict) else item).strip()
        for item in (existing.get("searchTags") or [])
        if str(item.get("value") if isinstance(item, dict) else item).strip()
    )
    next_tags = sorted(item["value"] for item in payload["searchTags"])
    return (
        existing.get("alt") == payload["alt"]
        and existing.get("sourceUrl") == payload["sourceUrl"]
        and current_tags == next_tags
    )


def build_short_description(asset: ProductAsset) -> str:
    color = ", ".join(asset.color_names).lower() if asset.color_names else "nhiều màu"
    audience = "học sinh, đội lớp, trường học và trung tâm bóng rổ" if asset.age_slug == "tre-em" else "đội phong trào, câu lạc bộ, công ty và giải đấu nội bộ"
    age_part = " trẻ em" if asset.age_slug == "tre-em" else ""
    return (
        f"Mẫu áo bóng rổ{age_part} {asset.design_label} tông {color}, "
        f"phù hợp cho {audience}. Có thể tùy chỉnh màu, logo, tên và số áo theo danh sách đội."
    )


def html_paragraph(text: str) -> str:
    return f"<p>{html.escape(text)}</p>"


def html_list(items: list[str]) -> str:
    return "<ul>\n" + "\n".join(f"  <li>{item}</li>" for item in items) + "\n</ul>"


def html_section(title: str, body: str) -> str:
    return f"<h2>{html.escape(title)}</h2>\n{body}"


def build_content_html(asset: ProductAsset) -> str:
    color = ", ".join(asset.color_names).lower() if asset.color_names else "nhiều màu"
    age_part = " trẻ em" if asset.age_slug == "tre-em" else ""
    age_phrase = "trẻ em" if asset.age_slug == "tre-em" else ""
    audience = (
        "trẻ em, học sinh tiểu học, THCS, THPT, đội lớp, đội tuyển trường và các trung tâm bóng rổ"
        if asset.age_slug == "tre-em"
        else "người lớn, sinh viên, đội phong trào, câu lạc bộ, đội công ty và các giải bóng rổ nội bộ"
    )
    fit = (
        "phom mặc nên ưu tiên sự thoải mái, dễ vận động và không gây vướng khi các em chạy, bật nhảy, chuyền bóng hoặc tập kỹ thuật cơ bản"
        if asset.age_slug == "tre-em"
        else "phom mặc nên gọn, khỏe và đủ linh hoạt cho cường độ vận động cao, từ luyện tập hằng tuần đến thi đấu phong trào"
    )
    decision = (
        "phụ huynh, giáo viên thể chất, ban cán sự lớp hoặc huấn luyện viên"
        if asset.age_slug == "tre-em"
        else "đội trưởng, quản lý câu lạc bộ, ban tổ chức giải hoặc đại diện công ty"
    )
    color_note = (
        f"<strong>Tông màu chính:</strong> {html.escape(color)}. Khi phân loại màu, X24 Sport chỉ tính các màu xuất hiện đáng kể trên phần áo; "
        "những đường viền, sọc trang trí hoặc vạch nhấn nhỏ không được xem là màu chủ đạo. Cách phân loại này giúp khách tìm mẫu chính xác hơn, "
        "đặc biệt với các thiết kế có nền đen phối viền vàng, nền trắng phối chỉ màu hoặc các mảng gradient thể thao."
    )
    intro = (
        f"Mẫu áo bóng rổ{age_part} {asset.design_label} là gợi ý phù hợp cho {audience} đang cần một bộ đồng phục nhìn nổi bật, dễ nhận diện và có thể tùy chỉnh theo tinh thần riêng của đội. "
        f"Tông {color} trong ảnh mẫu giúp đội có điểm bắt đầu rõ ràng khi trao đổi thiết kế: giữ màu chính, đổi màu viền, thêm logo, đặt tên cầu thủ, số áo hoặc làm thêm quần đồng bộ. "
        "Thay vì phải mô tả ý tưởng từ đầu, bạn có thể gửi mẫu này cho X24 Sport để đội thiết kế phát triển thành bản mockup sát nhu cầu thực tế hơn."
    )
    main_label = f" áo bóng rổ {age_phrase}" if age_phrase else " áo bóng rổ"
    sections = [
        html_section("Tổng quan mẫu áo", html_paragraph(intro)),
        html_section(
            "Điểm nổi bật",
            html_list([
                f"<strong>Màu chủ đạo:</strong> {html.escape(color)}; phù hợp để tạo nhận diện rõ khi cả đội đứng trên sân hoặc chụp ảnh tập thể.",
                "<strong>Bố cục jersey bóng rổ:</strong> có không gian cho số áo lớn, tên sau lưng, logo đội và các chi tiết nhận diện riêng.",
                f"<strong>Ứng dụng linh hoạt:</strong> dùng được cho luyện tập, thi đấu phong trào, giải nội bộ, đội lớp, câu lạc bộ hoặc sự kiện bóng rổ.",
                "<strong>Dễ phát triển thiết kế:</strong> có thể giữ tinh thần mẫu hiện tại hoặc đổi sang bảng màu riêng của đội, trường, lớp hay nhà tài trợ.",
            ]),
        ),
        html_section(
            "Phù hợp với ai?",
            html_paragraph(
                f"Mẫu{main_label} này đặc biệt hữu ích khi {decision} muốn xem nhanh một hướng thiết kế trước khi chốt concept. "
                f"Với nhóm {asset.age_label.lower()}, {fit}. Thiết kế áo bóng rổ thường cần cảm giác thoáng, dễ vận động, số áo dễ đọc và bố cục không làm chìm logo hoặc tên đội. "
                "Nếu đội có nhiều thành viên với vóc dáng khác nhau, nên chốt danh sách size trước khi sản xuất để việc phát áo nhanh hơn và hạn chế nhầm lẫn."
            ),
        ),
        html_section(
            "Có thể tùy chỉnh những gì?",
            html_list([
                "<strong>Màu áo:</strong> giữ màu như ảnh mẫu hoặc đổi theo màu lớp, màu câu lạc bộ, màu trường học, màu thương hiệu.",
                "<strong>Logo và nhận diện:</strong> thêm logo đội, logo trường, logo nhà tài trợ, slogan hoặc biểu tượng riêng.",
                "<strong>Tên và số:</strong> in số mặt trước, số mặt sau, tên cầu thủ, biệt danh hoặc vai trò trong đội.",
                "<strong>Form và combo:</strong> trao đổi thêm về áo, quần đồng bộ, size theo từng thành viên và yêu cầu sử dụng thực tế.",
            ]),
        ),
        html_section("Cách hiểu đúng về màu sắc", html_paragraph(color_note)),
        html_section(
            "Gợi ý khi đặt may",
            html_paragraph(
                "Để lên mẫu nhanh và ít phải sửa nhiều vòng, bạn nên chuẩn bị số lượng dự kiến, nhóm size, logo nếu có, danh sách tên số và ngày cần nhận áo. "
                "Khi gửi yêu cầu, hãy nói rõ phần nào muốn giữ giống ảnh mẫu và phần nào muốn đổi. Ví dụ: giữ nền áo, đổi màu viền, làm số áo lớn hơn, đổi font chữ, thêm logo ngực trái hoặc thêm tên sau lưng. "
                "Cách trao đổi này giúp X24 Sport tư vấn chính xác hơn về bố cục, màu in, độ nổi bật của số áo và thời gian thực hiện."
            ),
        ),
        html_section(
            "Vì sao nên dùng mẫu này làm điểm bắt đầu?",
            html_paragraph(
                "Một mẫu áo bóng rổ đẹp cần cân bằng giữa thẩm mỹ, nhận diện và tính thực dụng khi vận động. Nếu họa tiết quá phức tạp, số áo có thể khó đọc; nếu màu chính không đủ rõ, cả đội dễ bị nhạt khi lên ảnh. "
                "Mẫu này giúp đội có sẵn một hướng thị giác để thảo luận, từ đó điều chỉnh thành thiết kế riêng mà vẫn giữ được tinh thần bóng rổ mạnh mẽ, gọn gàng và dễ nhận diện. "
                "Sau khi thống nhất ý tưởng, X24 Sport sẽ hỗ trợ dựng mockup theo thông tin đội cung cấp trước khi tiến hành sản xuất."
            ),
        ),
    ]
    text_for_count = re.sub(r"<[^>]+>", " ", " ".join(sections))
    word_count = len(re.findall(r"\w+", text_for_count, re.UNICODE))
    if word_count < 500:
        raise RuntimeError(f"Generated description too short for {asset.path.name}: {word_count} words")
    return "\n\n".join(sections)


def build_product_data(asset: ProductAsset, tenant_id: Any, category_ids: list[Any], media_id: Any) -> dict[str, Any]:
    color_names = asset.color_names or ["Nhiều màu"]
    content_html = build_content_html(asset)
    short_description = build_short_description(asset)
    age_part = " Trẻ em" if asset.age_slug == "tre-em" else ""
    name = f"Áo bóng rổ{age_part} {asset.design_label} màu {', '.join(color_names)}"
    data = {
        "tenant": tenant_id,
        "name": name,
        "slug": asset.slug,
        "sku": asset.sku,
        "sport": "basketball",
        "productType": "simple",
        "publicationStatus": "publish",
        "featured": False,
        "price": None,
        "regularPrice": None,
        "salePrice": None,
        "compareAtPrice": None,
        "currency": "VND",
        "stockStatus": "instock",
        "isPurchasable": False,
        "isOnBackorder": False,
        "shortDescription": short_description,
        "contentHtml": content_html,
        "categories": category_ids,
        "gallery": [media_id],
        "badges": [{"label": asset.age_label}, {"label": "Thiết kế riêng"}],
        "searchTags": [{"value": value} for value in [asset.age_label, *color_names, asset.design_code, "áo bóng rổ"]],
        "attributes": [
            {"name": "Nhóm sử dụng", "values": [{"value": asset.age_label}]},
            {"name": "Màu chính", "values": [{"value": color_name} for color_name in color_names]},
            {"name": "Dịch vụ", "values": [{"value": "May theo yêu cầu"}, {"value": "In tên và số áo"}, {"value": "Tùy chỉnh logo đội"}]},
        ],
        "seoTitle": f"{name} | X24 Sport",
        "metaDescription": short_description[:300],
        "sourceSystem": SOURCE_SYSTEM,
        "sourceId": asset.source_id,
        "sourceCreatedAt": IMPORT_TIMESTAMP,
        "sourceModifiedAt": IMPORT_TIMESTAMP,
        "sourceChecksum": "",
    }
    checksum_payload = {key: value for key, value in data.items() if key not in {"tenant", "sourceChecksum"}}
    checksum_payload["imageChecksum"] = asset.checksum
    data["sourceChecksum"] = hashlib.sha256(stable_json(checksum_payload).encode()).hexdigest()
    return data


def load_manifest(path: Path) -> dict[str, Any]:
    if path.exists():
        return json.loads(path.read_text(encoding="utf-8"))
    return {"createdAtMs": now_ms(), "items": {}}


def save_manifest(path: Path, manifest: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(".tmp")
    tmp.write_text(json.dumps(manifest, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    tmp.replace(path)


def ensure_categories(client: PayloadClient, tenant_id: Any) -> dict[str, Any]:
    category_ids: dict[str, Any] = {}
    all_categories = BASE_CATEGORIES + AGE_CATEGORIES + [
        {
            "name": data["name"],
            "slug": slug,
            "group": "color",
            "description": data["description"],
            "order": data["order"],
        }
        for slug, data in COLOR_META.items()
    ]
    for category in all_categories:
        data = build_category_data(tenant_id, category)
        existing = client.find_one("product-categories", {"where[tenantSlugKey][equals]": f"{tenant_id}:{category['slug']}"})
        if not existing:
            existing = client.find_one("product-categories", {"where[tenantSourceKey][equals]": f"{tenant_id}:{SOURCE_SYSTEM}:category:{category['slug']}"})
        _, doc = client.create_or_update("product-categories", data, existing)
        category_ids[category["slug"]] = doc["id"]
    return category_ids


def update_product_counts(client: PayloadClient, category_ids: dict[str, Any]) -> dict[str, int]:
    if client.dry_run:
        return {}
    counts: dict[str, int] = {}
    for slug, category_id in category_ids.items():
        count = client.count("products", {"where[categories][contains]": category_id, "where[publicationStatus][equals]": "publish"})
        counts[slug] = count
        if not client.dry_run:
            response = client.session.patch(f"{client.base_url}/api/product-categories/{category_id}", json={"productCount": count}, timeout=45)
            response.raise_for_status()
    return counts


def import_assets(args: argparse.Namespace) -> dict[str, Any]:
    assets = discover_assets()
    email, password = read_credentials(args.credentials_command, args.credentials)
    client = PayloadClient(args.cms_api, email, password, args.dry_run)

    tenant = client.find_one("tenants", {"where[slug][equals]": TENANT_SLUG})
    if not tenant:
        raise RuntimeError(f"Tenant not found: {TENANT_SLUG}")
    tenant_id = tenant["id"]
    category_ids = ensure_categories(client, tenant_id)
    manifest = load_manifest(args.manifest)
    totals = {"media_created": 0, "media_updated": 0, "media_unchanged": 0, "products_created": 0, "products_updated": 0, "products_unchanged": 0, "failed": 0}

    for sequence, asset in enumerate(assets, 1):
        key = asset.source_id
        try:
            media_action, media_doc = client.upload_media(asset, tenant_id)
            product_category_ids = [
                category_ids["bong-ro"],
                category_ids["ao-bong-ro"],
                category_ids["bo-quan-ao-bong-ro"],
                category_ids[asset.age_slug],
                *[category_ids[slug] for slug in asset.color_slugs if slug in category_ids],
            ]
            product_data = build_product_data(asset, tenant_id, list(dict.fromkeys(product_category_ids)), media_doc["id"])
            existing_product = client.find_one("products", {"where[tenantSourceKey][equals]": f"{tenant_id}:{SOURCE_SYSTEM}:{asset.source_id}"})
            if not existing_product:
                existing_product = client.find_one("products", {"where[sku][equals]": asset.sku, "where[tenant][equals]": tenant_id})
            product_action, product_doc = client.create_or_update("products", product_data, existing_product)
            totals[f"media_{media_action}"] += 1
            totals[f"products_{product_action}"] += 1
            manifest["items"][key] = {
                "status": "ok",
                "path": str(asset.path),
                "sku": asset.sku,
                "slug": asset.slug,
                "productId": product_doc["id"],
                "mediaId": media_doc["id"],
                "age": asset.age_label,
                "colors": asset.color_names,
                "updatedAtMs": now_ms(),
            }
        except Exception as error:
            totals["failed"] += 1
            manifest["items"][key] = {
                "status": "failed",
                "path": str(asset.path),
                "sku": asset.sku,
                "age": asset.age_label,
                "colors": asset.color_names,
                "error": str(error)[:800],
                "updatedAtMs": now_ms(),
            }
            print(f"failed sequence={sequence}/{len(assets)} sku={asset.sku} error={error}", file=sys.stderr)
        if sequence % args.progress_every == 0 or sequence == len(assets):
            save_manifest(args.manifest, manifest)
            print(f"progress={sequence}/{len(assets)} totals={json.dumps(totals, ensure_ascii=False, sort_keys=True)}", flush=True)

    category_counts = update_product_counts(client, category_ids)
    save_manifest(args.manifest, manifest)
    report = {
        "mode": "dry-run" if args.dry_run else "apply",
        "tenant": {"id": tenant_id, "slug": TENANT_SLUG},
        "assets": len(assets),
        "folderCounts": {age_label: sum(1 for asset in assets if asset.age_label == age_label) for _, age_label, _, _ in FOLDERS},
        "totals": totals,
        "categoryCounts": category_counts,
        "manifest": str(args.manifest),
    }
    args.report.write_text(json.dumps(report, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, sort_keys=True))
    if totals["failed"]:
        raise SystemExit(1)
    return report


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--cms-api", default="https://cms.x24sport.vn")
    parser.add_argument("--credentials", type=Path)
    parser.add_argument("--credentials-command")
    parser.add_argument("--manifest", type=Path, default=Path("mayaobongro.vn/operations/dropbox-basketball-products-20260724/import-manifest.json"))
    parser.add_argument("--report", type=Path, default=Path("mayaobongro.vn/operations/dropbox-basketball-products-20260724/import-report.json"))
    parser.add_argument("--progress-every", type=int, default=10)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    import_assets(args)


if __name__ == "__main__":
    main()
