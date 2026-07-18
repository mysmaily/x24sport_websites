#!/usr/bin/env python3
"""Convert source apparel images into Payload gaming jersey products."""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
ASSETS_DIR = ROOT / "assets"
RUNTIME_VENV_PYTHON = ROOT / ".runtime-venv" / "bin" / "python"
LOGO_BADGE = ASSETS_DIR / "badge-logo.png"
DOT_COLOR = ASSETS_DIR / "dot-color.png"
CONTACT_PILL_TEXT = "Hotline: 0989 353 247"
DEFAULT_SOURCE_ROOT = Path("/Users/hoang/hacado/x24sport_websites/mayaopickleball.vn/transfer-running-image-to-pickleball-v5/operations")
DEFAULT_SOURCE_API_URL = "https://mayaopickleball.vn/wp-json/wc/store/v1/products"
DEFAULT_SOURCE_PAYLOAD_URL = "https://cms.x24sport.vn/api/products"
DEFAULT_SOURCE_PAYLOAD_TENANT = "mayaopickleball"
DEFAULT_WAVE = Path("/Users/hoang/hacado/x24sport_websites/x24sport.vn/operations/pickleball-to-gaming")
DEFAULT_ENV_FILE = Path("/Users/hoang/hacado/x24sport_websites/x24sport.vn/.payload-api.env")
DEFAULT_PRICE = 165000
DEFAULT_COMPARE_AT_PRICE = 240000
TERMINAL_STATUSES = {"verified", "skipped_duplicate"}
STATUS_ORDER = {
    "source_discovered": 10,
    "reserved": 20,
    "source_copied": 30,
    "analyzed": 40,
    "images_generated": 50,
    "media_uploaded": 60,
    "product_updated": 70,
    "verified": 80,
    "skipped_duplicate": 90,
}
FORBIDDEN = [
    "pickleball",
    "running",
    "runner",
    "chạy bộ",
    "mayaochaybo",
    "mayaopickleball",
    "prompt",
    "render",
    "watermark",
    "metadata",
]
UNSUPPORTED_PRODUCT_CLAIMS = [
    "thấm hút mồ hôi",
    "thoáng khí",
    "nhanh khô",
    "co giãn 4 chiều",
    "chống tia uv",
    "kháng khuẩn",
    "bền màu",
    "không nhăn",
]


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def load_env(path: Path | None) -> dict[str, str]:
    env = os.environ.copy()
    selected_path = path or DEFAULT_ENV_FILE
    if selected_path.exists():
        for line in selected_path.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            env.setdefault(key.strip(), value.strip().strip("'\""))
    env.setdefault("PAYLOAD_BASE_URL", "http://localhost:3001")
    env.setdefault("X24SPORT_PUBLIC_BASE_URL", "https://next.x24sport.vn")
    return env


def read_jsonl(path: Path) -> list[dict[str, Any]]:
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


def write_jsonl(path: Path, records: list[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")
    tmp.write_text("".join(json.dumps(record, ensure_ascii=False, sort_keys=True) + "\n" for record in records), encoding="utf-8")
    tmp.replace(path)


def manifest_path(wave_dir: Path) -> Path:
    return wave_dir / "manifest.jsonl"


def converted_path(wave_dir: Path) -> Path:
    return wave_dir / "converted-sources.jsonl"


def global_converted_path(wave_dir: Path) -> Path:
    return wave_dir.parent / "pickleball-to-gaming-converted-sources.jsonl"


def converted_records(wave_dir: Path) -> list[dict[str, Any]]:
    records: list[dict[str, Any]] = []
    seen: set[tuple[Any, Any, Any]] = set()
    for path in dict.fromkeys((global_converted_path(wave_dir), converted_path(wave_dir))):
        for record in read_jsonl(path):
            marker = (
                record.get("source_product_id"),
                record.get("source_signature"),
                record.get("destination_product_id"),
            )
            if marker not in seen:
                seen.add(marker)
                records.append(record)
    return records


def sibling_manifest_records(wave_dir: Path) -> list[dict[str, Any]]:
    records: list[dict[str, Any]] = []
    for path in wave_dir.parent.glob("*/manifest.jsonl"):
        if path.resolve() != manifest_path(wave_dir).resolve():
            records.extend(read_jsonl(path))
    return records


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def slugify_ascii(value: str) -> str:
    replacements = {
        "đ": "d",
        "á": "a", "à": "a", "ả": "a", "ã": "a", "ạ": "a",
        "ă": "a", "ắ": "a", "ằ": "a", "ẳ": "a", "ẵ": "a", "ặ": "a",
        "â": "a", "ấ": "a", "ầ": "a", "ẩ": "a", "ẫ": "a", "ậ": "a",
        "é": "e", "è": "e", "ẻ": "e", "ẽ": "e", "ẹ": "e",
        "ê": "e", "ế": "e", "ề": "e", "ể": "e", "ễ": "e", "ệ": "e",
        "í": "i", "ì": "i", "ỉ": "i", "ĩ": "i", "ị": "i",
        "ó": "o", "ò": "o", "ỏ": "o", "õ": "o", "ọ": "o",
        "ô": "o", "ố": "o", "ồ": "o", "ổ": "o", "ỗ": "o", "ộ": "o",
        "ơ": "o", "ớ": "o", "ờ": "o", "ở": "o", "ỡ": "o", "ợ": "o",
        "ú": "u", "ù": "u", "ủ": "u", "ũ": "u", "ụ": "u",
        "ư": "u", "ứ": "u", "ừ": "u", "ử": "u", "ữ": "u", "ự": "u",
        "ý": "y", "ỳ": "y", "ỷ": "y", "ỹ": "y", "ỵ": "y",
    }
    text = value.lower()
    for src, dest in replacements.items():
        text = text.replace(src, dest)
    return re.sub(r"[^a-z0-9]+", "-", text).strip("-")


def source_key_for_path(path: Path) -> str:
    parts = path.parts
    if "operations" in parts:
        idx = parts.index("operations")
        if idx + 1 < len(parts):
            op_name = slugify_ascii(parts[idx + 1])
            if op_name:
                return op_name
    return slugify_ascii(path.stem)


def variant_kind_for_name(value: str) -> str:
    name = slugify_ascii(value)
    collared_markers = (
        "ao-co-tay-co-co", "co-co-tay", "co-be-tay", "collared-short-sleeve",
        "co-co-ngan-tay", "image-a", "anh-1",
    )
    crew_markers = (
        "ao-khong-tay", "khong-tay", "ba-lo", "3-lo", "sat-nach",
        "round-neck", "crew", "crew-short-sleeve", "no-sleeve", "nosleeve", "image-b", "anh-2",
    )
    if any(marker in name for marker in collared_markers):
        return "collared"
    if any(marker in name for marker in crew_markers):
        return "crew"
    return "other"


def variant_label(kind: str) -> str:
    if kind == "collared":
        return "áo có cổ, tay ngắn"
    if kind == "crew":
        return "áo không tay, giữ đúng kiểu cổ trong ảnh nguồn"
    return "kiểu áo thể thao"


def source_variants_for_record(record: dict[str, Any]) -> list[dict[str, Any]]:
    variants = record.get("source_variants")
    if isinstance(variants, list) and variants:
        return [
            dict(item)
            for item in variants
            if isinstance(item, dict) and (item.get("path") or item.get("url"))
        ]
    path = record.get("source_path")
    if not path:
        return []
    filename = str(record.get("source_filename") or Path(str(path)).name)
    kind = variant_kind_for_name(filename)
    return [{
        "kind": kind,
        "label": variant_label(kind),
        "path": str(path),
        "filename": filename,
        "signature": record.get("source_signature"),
    }]


def source_text_for_record(record: dict[str, Any]) -> str:
    parts = [str(record.get("source_product_key") or "")]
    for variant in source_variants_for_record(record):
        parts.extend([
            str(variant.get("path") or variant.get("url") or ""),
            str(variant.get("filename") or ""),
            str(variant.get("alt") or ""),
        ])
    return " ".join(parts)


def source_sku_keys_for_record(record: dict[str, Any]) -> set[str]:
    keys: set[str] = set()
    explicit = slugify_ascii(str(record.get("source_sku") or ""))
    if explicit:
        keys.add(explicit)
    searchable = slugify_ascii(source_text_for_record(record))
    keys.update(re.findall(r"x24-pb-\d+", searchable))
    return keys


def choose_source_variants(paths: list[Path]) -> list[Path]:
    usable = sorted(
        path for path in paths
        if path.suffix.lower() == ".webp"
        and "contact" not in slugify_ascii(path.name)
        and "sheet" not in slugify_ascii(path.name)
    )
    if len(usable) <= 1:
        return usable
    collared = [path for path in usable if variant_kind_for_name(path.name) == "collared"]
    crew = [path for path in usable if variant_kind_for_name(path.name) == "crew"]
    if collared and crew:
        return [collared[0], crew[0]]
    numbered = sorted(
        (path for path in usable if re.search(r"(?:anh|image)-[12](?:\D|$)", slugify_ascii(path.name))),
        key=lambda path: slugify_ascii(path.name),
    )
    if len(numbered) >= 2:
        return numbered[:2]
    return usable[:2]


def choose_api_image_variants(images: list[dict[str, Any]]) -> list[dict[str, Any]]:
    usable = [
        dict(image)
        for image in images
        if isinstance(image, dict) and str(image.get("src") or "").lower().endswith(".webp")
    ]
    if len(usable) < 2:
        return []
    classified: list[tuple[dict[str, Any], str]] = []
    for image in usable:
        classified.append((image, api_image_variant_kind(image)))
    collared = [image for image, kind in classified if kind == "collared"]
    crew = [image for image, kind in classified if kind == "crew"]
    if collared and crew:
        return [collared[0], crew[0]]
    if len(usable) == 2:
        if collared:
            other = usable[0] if usable[1] is collared[0] else usable[1]
            return [collared[0], other]
        if crew:
            other = usable[0] if usable[1] is crew[0] else usable[1]
            return [other, crew[0]]
        return usable
    return []


def choose_payload_gallery_variants(gallery: list[Any]) -> list[dict[str, Any]]:
    normalized = []
    for item in gallery:
        if isinstance(item, dict):
            media = item
        else:
            continue
        url = str(media.get("url") or "")
        if url.lower().endswith(".webp"):
            normalized.append({
                "id": media.get("id"),
                "src": url,
                "name": media.get("filename") or Path(urllib.parse.urlparse(url).path).name,
                "alt": media.get("alt") or "",
            })
    return choose_api_image_variants(normalized)


def api_image_variant_kind(image: dict[str, Any]) -> str:
    filename_metadata = " ".join(str(image.get(key) or "") for key in ("name", "src"))
    detected = variant_kind_for_name(filename_metadata)
    if detected != "other":
        return detected
    return variant_kind_for_name(str(image.get("alt") or ""))


def source_record_from_api_product(
    product: dict[str, Any], index: int, api_url: str = DEFAULT_SOURCE_API_URL
) -> dict[str, Any] | None:
    product_id = product.get("id")
    if product_id is None:
        return None
    selected = choose_api_image_variants(product.get("images") or [])
    if len(selected) != 2:
        return None
    variants: list[dict[str, Any]] = []
    signature_parts: list[str] = [f"product:{product_id}"]
    for position, image in enumerate(selected):
        src = str(image.get("src") or "")
        filename = Path(urllib.parse.urlparse(src).path).name
        detected = api_image_variant_kind(image)
        kind = detected if detected != "other" else ("collared" if position == 0 else "crew")
        image_signature = hashlib.sha256(
            f"{image.get('id')}|{src}|{kind}".encode("utf-8")
        ).hexdigest()
        variants.append({
            "kind": kind,
            "label": variant_label(kind),
            "url": src,
            "filename": filename,
            "alt": str(image.get("alt") or ""),
            "media_id": image.get("id"),
            "signature": image_signature,
        })
        signature_parts.append(image_signature)
    group_signature = hashlib.sha256("|".join(signature_parts).encode("utf-8")).hexdigest()
    first = variants[0]
    return {
        "schema_version": "1.2-source-product-api",
        "source_index": index,
        "source_site": "mayaopickleball.vn",
        "source_api": api_url,
        "source_product_id": int(product_id),
        "source_product_key": f"product-{product_id}",
        "source_product_name": str(product.get("name") or ""),
        "source_product_slug": str(product.get("slug") or ""),
        "source_product_url": str(product.get("permalink") or ""),
        "source_sku": str(product.get("sku") or ""),
        "source_path": first["url"],
        "source_filename": first["filename"],
        "source_signature": group_signature,
        "source_signatures": [item["signature"] for item in variants],
        "source_size": None,
        "source_variants": variants,
    }


def source_record_from_payload_product(
    product: dict[str, Any], index: int, api_url: str, public_base_url: str
) -> dict[str, Any] | None:
    product_id = product.get("id")
    if product_id is None:
        return None
    selected = choose_payload_gallery_variants(product.get("gallery") or [])
    if len(selected) != 2:
        return None
    variants: list[dict[str, Any]] = []
    signature_parts: list[str] = [f"payload-product:{product_id}"]
    for position, image in enumerate(selected):
        src = str(image.get("src") or "")
        filename = Path(urllib.parse.urlparse(src).path).name
        detected = api_image_variant_kind(image)
        kind = detected if detected != "other" else ("collared" if position == 0 else "crew")
        image_signature = hashlib.sha256(
            f"{image.get('id')}|{src}|{kind}".encode("utf-8")
        ).hexdigest()
        variants.append({
            "kind": kind,
            "label": variant_label(kind),
            "url": src,
            "filename": filename,
            "alt": str(image.get("alt") or ""),
            "media_id": image.get("id"),
            "signature": image_signature,
        })
        signature_parts.append(image_signature)
    group_signature = hashlib.sha256("|".join(signature_parts).encode("utf-8")).hexdigest()
    first = variants[0]
    slug = str(product.get("slug") or "")
    return {
        "schema_version": "1.3-source-product-payload",
        "source_index": index,
        "source_site": "mayaopickleball.vn",
        "source_api": api_url,
        "source_product_id": int(product_id),
        "source_product_key": f"payload-product-{product_id}",
        "source_product_name": str(product.get("name") or ""),
        "source_product_slug": slug,
        "source_product_url": f"{public_base_url.rstrip('/')}/san-pham/{slug}" if slug else "",
        "source_sku": str(product.get("sku") or ""),
        "source_path": first["url"],
        "source_filename": first["filename"],
        "source_signature": group_signature,
        "source_signatures": [item["signature"] for item in variants],
        "source_size": None,
        "source_variants": variants,
    }


def fetch_store_products(api_url: str, limit: int | None = None, page_size: int = 100) -> list[dict[str, Any]]:
    products: list[dict[str, Any]] = []
    page = 1
    page_size = max(1, min(page_size, 100))
    while limit is None or len(products) < limit:
        wanted = page_size if limit is None else min(page_size, limit - len(products))
        query = urllib.parse.urlencode({"per_page": wanted, "page": page})
        separator = "&" if "?" in api_url else "?"
        req = urllib.request.Request(
            f"{api_url}{separator}{query}",
            headers={"Accept": "application/json", "User-Agent": "gaming-transfer/1.2"},
        )
        try:
            with urllib.request.urlopen(req, timeout=60) as response:
                batch = json.loads(response.read().decode("utf-8"))
                total_pages = int(response.headers.get("X-WP-TotalPages") or page)
        except urllib.error.HTTPError as exc:
            if exc.code == 400 and page > 1:
                break
            raise
        if not isinstance(batch, list) or not batch:
            break
        products.extend(item for item in batch if isinstance(item, dict))
        if page >= total_pages:
            break
        page += 1
    return products[:limit] if limit is not None else products


def fetch_payload_products(
    api_url: str,
    tenant_slug: str,
    limit: int | None = None,
    page_size: int = 100,
) -> list[dict[str, Any]]:
    products: list[dict[str, Any]] = []
    page = 1
    page_size = max(1, min(page_size, 100))
    while limit is None or len(products) < limit:
        wanted = page_size if limit is None else min(page_size, limit - len(products))
        params = {
            "where[tenant.slug][equals]": tenant_slug,
            "depth": "2",
            "limit": str(wanted),
            "page": str(page),
            "sort": "-createdAt",
        }
        separator = "&" if "?" in api_url else "?"
        req = urllib.request.Request(
            f"{api_url}{separator}{urllib.parse.urlencode(params)}",
            headers={"Accept": "application/json", "User-Agent": "gaming-transfer/1.3"},
        )
        with urllib.request.urlopen(req, timeout=90) as response:
            data = json.loads(response.read().decode("utf-8"))
        batch = data.get("docs") if isinstance(data, dict) else None
        if not isinstance(batch, list) or not batch:
            break
        products.extend(item for item in batch if isinstance(item, dict))
        if not data.get("hasNextPage") or page >= int(data.get("totalPages") or page):
            break
        page += 1
    return products[:limit] if limit is not None else products


def download_source_url(url: str, destination: Path) -> None:
    req = urllib.request.Request(url, headers={"User-Agent": "gaming-transfer/1.2"})
    with urllib.request.urlopen(req, timeout=120) as response, destination.open("wb") as handle:
        shutil.copyfileobj(response, handle)


def infer_colors(text: str) -> list[str]:
    lower = slugify_ascii(text)
    mapping = [
        ("hong", "hồng"),
        ("do", "đỏ"),
        ("den", "đen"),
        ("trang", "trắng"),
        ("vang", "vàng"),
        ("cam", "cam"),
        ("tim", "tím"),
        ("xanh-ngoc", "xanh ngọc"),
        ("xanh", "xanh"),
    ]
    colors: list[str] = []
    for needle, color in mapping:
        if needle in lower and color not in colors:
            colors.append(color)
    return colors[:3] or ["nổi bật"]


def infer_product_shape(text: str) -> str:
    lower = slugify_ascii(text)
    if "3-lo" in lower or "ba-lo" in lower:
        return "ba lỗ"
    if "khong-tay" in lower or "co-co-khong-tay" in lower or "collared-no-sleeve" in lower:
        return "không tay"
    return "cổ bẻ tay ngắn"


def infer_gradient_terms(text: str, colors: list[str]) -> list[str]:
    lower = slugify_ascii(text)
    terms: list[str] = []
    if "gradient" in lower:
        terms.append("gradient thể thao")
    if "fade" in lower or "dots" in lower or "circle" in lower:
        terms.append("gradient chấm chuyển sắc")
    if "splash" in lower:
        terms.append("gradient vệt sơn")
    color_set = set(colors)
    if {"trắng", "đỏ", "cam"} & color_set and "gradient trắng đỏ cam" not in terms:
        terms.append("gradient trắng đỏ cam")
    if {"xanh", "trắng"} <= color_set or {"xanh ngọc", "trắng"} <= color_set:
        terms.append("gradient xanh trắng")
    if not terms:
        if len(colors) >= 2:
            terms.append(f"gradient {' '.join(colors[:2])}")
        else:
            terms.append(f"gradient {colors[0]}")
    return terms[:3]


def search_tags_for_record(record: dict[str, Any]) -> list[str]:
    source_text = source_text_for_record(record)
    colors = infer_colors(source_text)
    gradients = infer_gradient_terms(source_text, colors)
    kinds = {str(variant.get("kind") or "other") for variant in source_variants_for_record(record)}
    shape_tags: list[str] = []
    if "collared" in kinds:
        shape_tags.append("cổ bẻ tay ngắn")
    if "crew" in kinds:
        shape_tags.append("không tay")
    if len(kinds & {"collared", "crew"}) == 2:
        shape_tags.append("hai kiểu cổ áo")
    if not shape_tags:
        shape_tags.append(infer_product_shape(source_text))
    analysis = record.get("visual_analysis") or {}
    verified_colors = analysis.get("main_colors") if isinstance(analysis, dict) else None
    if isinstance(verified_colors, list) and verified_colors:
        colors = [str(value) for value in verified_colors]
    verified_gradient = analysis.get("gradient") if isinstance(analysis, dict) else None
    if verified_gradient:
        gradients = [str(verified_gradient)]
    base_tags = [
        "áo thi đấu gaming",
        "áo gaming",
        "đồng phục gaming",
        "áo esports",
        "đồng phục esports",
        "gaming team jersey",
        "esports jersey",
        *shape_tags,
        *colors,
        *gradients,
    ]
    verified_pattern = analysis.get("pattern") if isinstance(analysis, dict) else None
    if verified_pattern:
        base_tags.append(str(verified_pattern))
    seen: set[str] = set()
    tags: list[str] = []
    for tag in base_tags:
        norm = slugify_ascii(tag)
        if norm and norm not in seen:
            seen.add(norm)
            tags.append(tag)
    return tags


def product_code(prefix: str, number: int) -> str:
    return f"{prefix}{number:03d}"


def reservation_sku(signature: str) -> str:
    return f"x24-gm-transfer-{signature[:18]}"


class PayloadClient:
    def __init__(self, env: dict[str, str]):
        self.base_url = env["PAYLOAD_BASE_URL"].rstrip("/")
        self.env = env
        self.token = env.get("PAYLOAD_TOKEN") or self.login(env)

    def login(self, env: dict[str, str]) -> str:
        email = env.get("PAYLOAD_EMAIL") or env.get("PAYLOAD_SEED_EMAIL")
        password = env.get("PAYLOAD_PASSWORD") or env.get("PAYLOAD_SEED_PASSWORD")
        if not email or not password:
            raise RuntimeError("missing PAYLOAD_TOKEN or PAYLOAD_EMAIL/PAYLOAD_PASSWORD")
        data = self.request("/api/users/login", method="POST", payload={"email": email, "password": password}, auth=False)
        token = data.get("token")
        if not token:
            raise RuntimeError("Payload login response did not include token")
        return str(token)

    def request(self, path: str, method: str = "GET", payload: dict[str, Any] | None = None, auth: bool = True) -> Any:
        data = None if payload is None else json.dumps(payload, ensure_ascii=False).encode("utf-8")
        req = urllib.request.Request(
            self.base_url + path,
            data=data,
            method=method,
            headers={"Accept": "application/json", "User-Agent": "gaming-transfer/1.0"},
        )
        if payload is not None:
            req.add_header("Content-Type", "application/json")
        if auth:
            req.add_header("Authorization", f"Bearer {self.token}")
        try:
            with urllib.request.urlopen(req, timeout=60) as response:
                raw = response.read().decode("utf-8")
                return json.loads(raw) if raw else {}
        except urllib.error.HTTPError as exc:
            body = exc.read().decode("utf-8", errors="ignore")
            detail = body[:1000] if body else exc.reason
            raise RuntimeError(f"Payload API {method} {path} failed with HTTP {exc.code}: {detail}") from exc

    def product_by_sku(self, sku: str) -> dict[str, Any] | None:
        query = urllib.parse.urlencode({"where[sku][equals]": sku})
        data = self.request(f"/api/products?{query}")
        docs = data.get("docs") if isinstance(data, dict) else None
        if docs:
            return docs[0]
        return None

    @staticmethod
    def unwrap_doc(data: Any) -> dict[str, Any]:
        if isinstance(data, dict) and isinstance(data.get("doc"), dict):
            return data["doc"]
        if isinstance(data, dict):
            return data
        raise RuntimeError(f"unexpected Payload document response: {type(data)!r}")

    def create_product(self, payload: dict[str, Any]) -> dict[str, Any]:
        return self.unwrap_doc(self.request("/api/products", method="POST", payload=payload))

    def update_product(self, product_id: str | int, payload: dict[str, Any]) -> dict[str, Any]:
        return self.unwrap_doc(self.request(f"/api/products/{product_id}", method="PATCH", payload=payload))

    def get_product(self, product_id: str | int) -> dict[str, Any]:
        return self.unwrap_doc(self.request(f"/api/products/{product_id}"))

    def upload_media(self, path: Path, alt: str, search_tags: list[str] | None = None) -> dict[str, Any]:
        payload: dict[str, Any] = {"alt": alt}
        if search_tags:
            payload["searchTags"] = [{"value": tag} for tag in search_tags]
        if self.env.get("PAYLOAD_TENANT_ID"):
            payload["tenant"] = self.env["PAYLOAD_TENANT_ID"]
        cmd = [
            "curl", "-sS", "--fail", "--max-time", "120",
            "-H", f"Authorization: Bearer {self.token}",
            "-F", f"file=@{path}",
            "-F", "_payload=" + json.dumps(payload, ensure_ascii=False),
            f"{self.base_url}/api/media",
        ]
        display = ["curl", "-sS", "--fail", "--max-time", "120", "-H", "Authorization: Bearer ***REDACTED***", "-F", f"file=@{path}", "-F", "_payload=***", f"{self.base_url}/api/media"]
        print("+ " + " ".join(display), flush=True)
        result = subprocess.run(cmd, text=True, capture_output=True, check=True)
        return self.unwrap_doc(json.loads(result.stdout))


def maybe_tenant(env: dict[str, str]) -> dict[str, Any]:
    return {"tenant": env["PAYLOAD_TENANT_ID"]} if env.get("PAYLOAD_TENANT_ID") else {}


def lexical_doc(paragraphs: list[str]) -> dict[str, Any]:
    children = []
    for paragraph in paragraphs:
        children.append({
            "type": "paragraph",
            "children": [{"text": paragraph, "type": "text", "version": 1}],
            "direction": "ltr",
            "format": "",
            "indent": 0,
            "version": 1,
        })
    return {"root": {"type": "root", "children": children, "direction": "ltr", "format": "", "indent": 0, "version": 1}}


def product_facts_for_record(record: dict[str, Any]) -> dict[str, Any]:
    source_text = source_text_for_record(record)
    analysis = record.get("visual_analysis") or {}
    inferred_colors = infer_colors(source_text)
    colors = analysis.get("main_colors") if isinstance(analysis, dict) else None
    if not isinstance(colors, list) or not colors:
        colors = inferred_colors
    colors = [str(value) for value in colors]
    gradients = infer_gradient_terms(source_text, colors)
    gradient = analysis.get("gradient") if isinstance(analysis, dict) else None
    if not gradient:
        gradient = gradients[0]
    pattern = analysis.get("pattern") if isinstance(analysis, dict) else None
    kinds = {str(item.get("kind") or "other") for item in source_variants_for_record(record)}
    paired = "collared" in kinds and "crew" in kinds
    if paired:
        shape = "hai kiểu áo: có cổ tay ngắn và không tay theo đúng kiểu cổ trong ảnh"
        title_shape = "Có Cổ & Không Tay"
    elif "crew" in kinds:
        shape = "không tay theo đúng kiểu cổ trong ảnh"
        title_shape = "Không Tay"
    elif "collared" in kinds:
        shape = "có cổ tay ngắn"
        title_shape = "Có Cổ Tay Ngắn"
    else:
        shape = infer_product_shape(source_text)
        title_shape = shape.title()
    return {
        "colors": colors,
        "gradient": str(gradient),
        "pattern": str(pattern) if pattern else None,
        "paired": paired,
        "shape": shape,
        "title_shape": title_shape,
    }


def assert_responsible_product_payload(payload: dict[str, Any], paired: bool) -> None:
    text = json.dumps(payload, ensure_ascii=False).casefold()
    unsupported = [claim for claim in UNSUPPORTED_PRODUCT_CLAIMS if claim in text]
    if unsupported:
        raise RuntimeError("unsupported product claims: " + ", ".join(unsupported))
    name = str(payload.get("name") or "")
    sku = str(payload.get("sku") or "")
    short = str(payload.get("shortDescription") or "")
    if "áo gaming" not in name.casefold() or sku not in name:
        raise RuntimeError("SEO name must contain the product category and SKU")
    if not 90 <= len(short) <= 230:
        raise RuntimeError(f"shortDescription must be concise and useful; got {len(short)} characters")
    gallery = payload.get("gallery") or []
    if paired and len(gallery) != 2:
        raise RuntimeError(f"paired collar product requires exactly 2 gallery images; got {len(gallery)}")


def placeholder_payload(record: dict[str, Any], env: dict[str, str]) -> dict[str, Any]:
    key = str(record["source_product_key"])
    sku = reservation_sku(str(record["source_signature"]))
    payload = {
        "name": f"[Đang tạo] {record['product_code']} từ {key}",
        "slug": f"dang-tao-ao-gaming-{slugify_ascii(key)}-{str(record['source_signature'])[:8]}",
        "sku": sku,
        "sport": "other",
        "price": 0,
        "shortDescription": "Sản phẩm đang được hệ thống tạo ảnh và nội dung.",
        "badges": [{"label": "Đang tạo"}],
        "featured": False,
    }
    payload.update(maybe_tenant(env))
    return payload


def final_product_payload(record: dict[str, Any], media_ids: list[int], env: dict[str, str]) -> dict[str, Any]:
    code = str(record["product_code"])
    facts = product_facts_for_record(record)
    colors = facts["colors"]
    if colors == ["nổi bật"]:
        raise RuntimeError(
            "verified main garment colors are required before publishing; "
            "rerun mark-generated with --colors"
        )
    gradient = facts["gradient"]
    pattern = facts["pattern"]
    shape = facts["shape"]
    search_tags = search_tags_for_record(record)
    color_copy = ", ".join(colors)
    color_title = " ".join(color.title() for color in colors if color != "nổi bật") or "Nổi Bật"
    slug_color = "-".join(slugify_ascii(color) for color in colors if color != "nổi bật") or "noi-bat"
    name = f"Áo Gaming {code} {color_title} – {facts['title_shape']}"
    design_copy = f"{gradient}"
    if pattern:
        design_copy += f", {pattern}"
    short = (
        f"Áo thi đấu gaming đặt may {code} tông {color_copy}, {design_copy}; "
        f"{shape}, nhận in tên, số, nickname và logo team."
    )
    if len(short) > 230:
        short = (
            f"Áo thi đấu gaming đặt may {code} tông {color_copy}; "
            f"{shape}, nhận in tên số và logo team."
        )
    paragraphs = [
        f"{name} sử dụng tông màu chính {color_copy} với {design_copy}. Nội dung mô tả bám theo màu sắc, họa tiết và kiểu áo thể hiện trong bộ ảnh sản phẩm.",
        (
            f"Mẫu được giới thiệu theo {shape}. Hai ảnh trong cùng sản phẩm giúp đội nhóm đối chiếu trực tiếp kiểu cổ và tay áo trước khi chọn phương án đặt may."
            if facts["paired"]
            else f"Mẫu được giới thiệu theo kiểu {shape}; khách hàng có thể dùng hình ảnh để đối chiếu kiểu cổ và tay áo trước khi đặt may."
        ),
        "X24 nhận tùy chỉnh màu nhận diện, in tên, số, nickname, logo team và vị trí sponsor cho đội tuyển gaming, clan, phòng máy hoặc sự kiện esports theo nội dung khách hàng xác nhận.",
        "Trước khi chốt đơn, khách hàng nên xác nhận chất liệu, bảng size, số lượng, vị trí in và thời gian sản xuất. Các đặc tính kỹ thuật của vải chỉ được áp dụng khi có thông số được xác nhận riêng.",
    ]
    payload = {
        "name": name,
        "slug": f"ao-thi-dau-gaming-dat-may-{code.lower()}-{slug_color}",
        "sku": code,
        "sport": "other",
        "price": int(env.get("GAMING_TRANSFER_PRICE", DEFAULT_PRICE)),
        "compareAtPrice": int(env.get("GAMING_TRANSFER_COMPARE_AT_PRICE", DEFAULT_COMPARE_AT_PRICE)),
        "shortDescription": short,
        "description": lexical_doc(paragraphs),
        "searchTags": [{"value": tag} for tag in search_tags],
        "gallery": media_ids,
        "badges": [{"label": "Mới"}],
        "featured": False,
    }
    payload.update(maybe_tenant(env))
    shopper = json.dumps(payload, ensure_ascii=False).casefold()
    hits = [term for term in FORBIDDEN if term in shopper]
    if hits:
        raise RuntimeError("forbidden shopper terms: " + ", ".join(hits))
    assert_responsible_product_payload(payload, bool(facts["paired"]))
    return payload


def load_manifest(wave_dir: Path) -> list[dict[str, Any]]:
    return read_jsonl(manifest_path(wave_dir))


def save_manifest(wave_dir: Path, records: list[dict[str, Any]]) -> None:
    write_jsonl(manifest_path(wave_dir), records)


def find_record(records: list[dict[str, Any]], source_key: str) -> dict[str, Any]:
    for record in records:
        if str(record.get("source_product_key")) == source_key:
            return record
    raise SystemExit(f"source_product_key not found: {source_key}")


def mark_record(wave_dir: Path, source_key: str, status: str, patch: dict[str, Any] | None = None, error: str | None = None) -> None:
    records = load_manifest(wave_dir)
    record = find_record(records, source_key)
    record["status"] = status
    record["updated_at"] = utc_now()
    if error is not None:
        record["last_error"] = error or None
        if error:
            record["attempt_count"] = int(record.get("attempt_count") or 0) + 1
    if patch:
        record.update(patch)
    save_manifest(wave_dir, records)


def pending(records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    items = [record for record in records if record.get("status") not in TERMINAL_STATUSES]
    items.sort(key=lambda record: (STATUS_ORDER.get(str(record.get("status")), 999), int(record.get("source_index") or 0)))
    return items


def seeded_choice(options: list[str], seed: str) -> str:
    digest = hashlib.sha256(seed.encode("utf-8")).hexdigest()
    return options[int(digest[:8], 16) % len(options)]


def seeded_weighted_choice(options: list[tuple[str, int]], seed: str) -> str:
    total = sum(weight for _, weight in options)
    if total <= 0 or any(weight <= 0 for _, weight in options):
        raise ValueError("seeded weighted options must use positive weights")
    digest = hashlib.sha256(seed.encode("utf-8")).hexdigest()
    selected = int(digest[:8], 16) % total
    for value, weight in options:
        if selected < weight:
            return value
        selected -= weight
    raise AssertionError("unreachable weighted choice")


def pose_direction_for_record(record: dict[str, Any]) -> str:
    key = str(record.get("source_product_key") or record.get("source_signature") or record["product_code"])
    pose_family = seeded_choice(
        ["captain-hands-pockets", "headset-shoulder", "controller-low", "female-back-look", "asymmetric-roster"],
        f"{key}:pose-family",
    )
    camera = seeded_weighted_choice(
        [
            ("tight square hero crop from upper thigh upward, with the central jersey front fully readable", 45),
            ("medium squad poster crop from knees upward, keeping depth and staggered spacing readable", 40),
            ("slightly wider full-team reveal crop with clean negative space around the squad", 15),
        ],
        f"{key}:camera",
    )
    if pose_family == "female-back-look":
        pose = (
            "Squad reveal with one side player in a three-quarter back-look so the rear jersey panel is partly visible, "
            "while the central captain remains front-facing with relaxed open arms or hands in pockets. Keep faces intense, composed, and intimidating. "
            "Do not add random names, numbers, or invented graphics to the shirt back; continue only the source garment pattern naturally."
        )
    elif pose_family == "headset-shoulder":
        pose = (
            "Dynamic esports roster pose: central captain stands front-facing with one hand in a pocket and the other relaxed, "
            "one nearby teammate holds a headset at shoulder level, another stands three-quarter with arms relaxed, and only one or two side players may cross arms."
        )
    elif pose_family == "controller-low":
        pose = (
            "Team reveal with varied hand language: central player holds a controller low near the waist or keeps both hands relaxed by the pockets, "
            "two teammates angle their shoulders inward, one adjusts a headset, and at most two background players cross arms."
        )
    elif pose_family == "asymmetric-roster":
        pose = (
            "Asymmetric pro roster composition: stagger the five players in depth with different shoulder angles and hand positions. "
            "The central jersey front must remain unobstructed; one side player may cross arms, another rests a hand near a headset, and another keeps arms at sides."
        )
    else:
        pose = (
            "Captain-led esports team pose: five players stand in a powerful but natural roster arrangement with the central captain slightly forward, "
            "hands in pockets or relaxed at sides so the jersey body is visible. Side teammates vary between headset, low controller, angled shoulders, and only limited crossed arms."
        )
    return (
        "Fallback full-regeneration composition only; do not apply this to a successful localized edit. "
        "Hard rule: never make all five players cross their arms, never line everyone up evenly like repeated copies, "
        "and always keep at least one front/central model's full shirt graphic unobstructed. "
        f"Deterministic seeded pose family: {pose_family}. {pose} Camera: {camera}."
    )


def lighting_direction_for_record(record: dict[str, Any]) -> str:
    key = str(record.get("source_product_key") or record.get("source_signature") or record["product_code"])
    lighting = seeded_choice(
        [
            "dark esports arena lighting with blue and yellow rim lights, light haze, and crisp highlights on the jersey fabric",
            "cyber gaming stage lighting with LED wall accents, dramatic shadows, and clean frontal fill on faces",
            "premium team reveal lighting with smoky background, cool blue key light, warm yellow edge light, and high-contrast fabric detail",
        ],
        f"{key}:lighting",
    )
    return (
        f"Seeded lighting: {lighting}. Keep the arena background darker than the models, with controlled saturation and "
        "no clutter competing with the apparel. Preserve clean faces, believable skin, and sharp jersey details."
    )


def prompt_for_record(record: dict[str, Any]) -> str:
    colors = ", ".join(infer_colors(str(record.get("source_path") or record.get("source_filename") or "")))
    code = str(record["product_code"])
    source_variant_label = str(record.get("source_variant_label") or "kiểu áo trong ảnh nguồn")
    pose_direction = pose_direction_for_record(record)
    lighting_direction = lighting_direction_for_record(record)
    return f"""Create a photorealistic square 1:1 web product image for x24sport.vn.

Default conversion strategy: full regeneration guided by the source garment. Use the provided pickleball product image only as a garment-design reference, not as an edit target. Preserve the source garment facts: colorway ({colors}), gradient, pattern map, diagonal/vertical accent placement, chest-mark placement, neckline, collar or sleeve construction, seams, hems, fabric texture, folds, and how the print follows the body. Do not preserve pickleball paddles, court, old overlays, color dots, phone number, website watermark, or source-site cues.

Output requirement: Vietnamese esports/gaming apparel campaign image for product {code}, source variant: {source_variant_label}. Generate 5 Vietnamese/Asian esports players wearing matching jerseys derived from the source design. Use a powerful team reveal, championship poster, or pro gaming roster photoshoot. Keep the central captain slightly forward and the squad staggered behind with natural depth, not a perfectly even row. The mood should feel dangerous, intense, confident, and high-status, while still looking like a real commercial apparel photo.

Jersey requirements: convert the shirt into a modern short-sleeve esports jersey with athletic fit, gaming-friendly crew neck or source-faithful collar where appropriate, black gaming pants, and subtle tactical/sport styling. Preserve the original color and graphic language clearly enough that the source design is recognizable. Add only blank abstract crest/sponsor patch areas; no readable text, fake words, team names, or real brands.

Models and pose: use 5 fictional Vietnamese/Asian esports players, mixed male and female when natural. At least one front or central player must not cross arms; use hands in pockets, hands relaxed by sides, headset on shoulder, controller held low only if hands are clean, or a relaxed open confident stance. Only one or two side/background players may cross arms. Vary heights, shoulder angles, depth, hand poses, and gaze direction subtly so the team does not look like repeated copies. Keep faces sharp, intense, and directed toward camera. Keep jersey fronts readable on most players and avoid hiding the torso print, especially on the central model. Use this seeded composition guidance: {pose_direction}

Scene: dark esports arena, cyber gaming stage, LED wall, blue/yellow rim lights, light smoke, cinematic shadows, and clean frontal fill. The background must support the squad and jersey, not overpower them. No sports court, no pickleball, no tennis, no badminton, no rackets, no balls.

Garment realism: the outfit must look like real sewn performance sportswear worn by the players, not a pasted graphic. Show believable seams, collar, sleeve openings, hems, fabric folds, body curvature, shadows, wrinkles, and natural light response. The pattern should bend with the body and fabric tension while preserving the source design map.

Branding/text: do not generate logo badges, product-code labels, hotline pills, color dots, random foreground signage, old website text, or watermarks inside the base image. Leave the image clean unless an explicit campaign overlay is requested after generation.

Style: premium esports team photoshoot, high-end advertising quality, sharp faces, accurate anatomy and hands, realistic garment texture, apparel in sharp focus, background secondary and cinematic. {lighting_direction} Visual priority must be: jersey color/pattern and sewn construction first; squad faces and pose second; esports stage third. Keep seams, neckline binding, fabric weave, folds, hem, and pattern flow sharper than the background.

Avoid: all five players crossing arms, cemetery-straight repeated lineup, identical poses, pickleball paddles, sports courts, rackets, balls, shuttlecocks, readable random text, real logos, fake team names, giant sponsor boards, phone numbers, website watermarks, deformed hands, duplicated faces, cartoon style, over-airbrushed skin, garment color/pattern drift, collar or sleeve changes, flat pasted shirt print, harsh cutout artifacts, and any shopper-facing old-source branding."""


def assert_webp(path: Path) -> None:
    if path.suffix.lower() != ".webp":
        raise SystemExit(
            f"generated image must be .webp before mark-generated/upload: {path}"
        )


def load_pillow() -> tuple[Any, Any]:
    try:
        from PIL import Image, ImageDraw, ImageFont  # type: ignore
    except ModuleNotFoundError as exc:
        if (
            os.environ.get("GAMING_TRANSFER_REEXEC") != "1"
            and RUNTIME_VENV_PYTHON.exists()
        ):
            env = os.environ.copy()
            env["GAMING_TRANSFER_REEXEC"] = "1"
            os.execve(
                str(RUNTIME_VENV_PYTHON),
                [str(RUNTIME_VENV_PYTHON), __file__, *sys.argv[1:]],
                env,
            )
        raise SystemExit(
            "mark-generated requires Pillow for branding overlays. "
            f"Install it in the active Python env with: pip install pillow, "
            f"or create {RUNTIME_VENV_PYTHON}"
        ) from exc
    return Image, ImageDraw, ImageFont, Image.LANCZOS


def load_contact_font(image_font: Any, target_size: int) -> Any:
    candidates = [
        "DejaVuSans-Bold.ttf",
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        "/System/Library/Fonts/Supplemental/Arial.ttf",
    ]
    for candidate in candidates:
        try:
            return image_font.truetype(candidate, target_size)
        except OSError:
            continue
    return image_font.load_default()


def build_contact_pill(image_module: Any, image_draw: Any, image_font: Any, width: int) -> Any:
    font = load_contact_font(image_font, max(24, int(width * 0.033)))
    probe = image_module.new("RGBA", (10, 10), (0, 0, 0, 0))
    draw = image_draw.Draw(probe)
    bbox = draw.textbbox((0, 0), CONTACT_PILL_TEXT, font=font)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]
    pad_x = max(18, int(width * 0.018))
    pad_y = max(10, int(width * 0.01))
    stroke = max(3, int(width * 0.004))
    pill_w = text_w + pad_x * 2
    pill_h = text_h + pad_y * 2
    pill = image_module.new("RGBA", (pill_w, pill_h), (0, 0, 0, 0))
    pill_draw = image_draw.Draw(pill)
    radius = pill_h // 2
    pill_draw.rounded_rectangle(
        (0, 0, pill_w - 1, pill_h - 1),
        radius=radius,
        fill=(0, 0, 0, 168),
        outline=(255, 255, 255, 235),
        width=stroke,
    )
    pill_draw.text(
        ((pill_w - text_w) / 2, (pill_h - text_h) / 2 - bbox[1]),
        CONTACT_PILL_TEXT,
        font=font,
        fill=(255, 255, 255, 255),
    )
    return pill


def draw_product_code_label(
    canvas: Any,
    image_module: Any,
    image_draw: Any,
    image_font: Any,
    product_code: str,
    anchor: str,
    margin: int,
) -> None:
    if not product_code:
        return
    width, _height = canvas.size
    draw = image_draw.Draw(canvas)
    font = load_contact_font(image_font, max(18, int(width * 0.022)))
    stroke = max(1, int(width * 0.0015))
    bbox = draw.textbbox((0, 0), product_code, font=font, stroke_width=stroke)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]
    pad_x = max(10, int(width * 0.01))
    pad_y = max(5, int(width * 0.006))
    panel_w = text_w + pad_x * 2
    panel_h = text_h + pad_y * 2
    x = margin if anchor == "left" else width - panel_w - margin
    y = margin
    gradient = image_module.new("RGBA", (panel_w, panel_h), (0, 0, 0, 0))
    pixels = gradient.load()
    for px in range(panel_w):
        if anchor == "left":
            t = 1 - (px / max(1, panel_w - 1))
        else:
            t = px / max(1, panel_w - 1)
        alpha = int(95 + 140 * t)
        for py in range(panel_h):
            pixels[px, py] = (0, 0, 0, alpha)
    mask = image_module.new("L", (panel_w, panel_h), 0)
    mask_draw = image_draw.Draw(mask)
    mask_draw.rounded_rectangle(
        (0, 0, panel_w - 1, panel_h - 1),
        radius=max(8, panel_h // 4),
        fill=255,
    )
    panel = image_module.new("RGBA", (panel_w, panel_h), (0, 0, 0, 0))
    panel.alpha_composite(gradient)
    panel.putalpha(mask)
    canvas.alpha_composite(panel, (x, y))
    draw.text(
        (x + pad_x - bbox[0], y + pad_y - bbox[1]),
        product_code,
        font=font,
        fill=(255, 255, 255, 255),
        stroke_width=stroke,
        stroke_fill=(0, 0, 0, 230),
    )


def branded_webp_for_generated(source_path: Path, dest_path: Path, index: int, product_code: str) -> None:
    for asset in (LOGO_BADGE, DOT_COLOR):
        if not asset.exists():
            raise SystemExit(f"required branding asset missing: {asset}")

    Image, ImageDraw, ImageFont, lanczos = load_pillow()
    base = Image.open(source_path).convert("RGBA")
    logo = Image.open(LOGO_BADGE).convert("RGBA")
    dots = Image.open(DOT_COLOR).convert("RGBA")
    width, height = base.size
    margin = max(18, int(width * 0.028))

    logo_w = max(120, int(width * 0.16))
    logo_h = max(1, int(logo.height * (logo_w / logo.width)))
    logo = logo.resize((logo_w, logo_h), lanczos)

    contact = build_contact_pill(Image, ImageDraw, ImageFont, width)

    dots_h = max(180, int(height * 0.34))
    dots_w = max(1, int(dots.width * (dots_h / dots.height)))
    dots = dots.resize((dots_w, dots_h), lanczos)

    canvas = base.copy()

    use_logo_left = index % 2 == 1
    logo_x = margin if use_logo_left else width - logo.width - margin
    logo_y = margin
    canvas.alpha_composite(logo, (logo_x, logo_y))

    code_anchor = "right" if use_logo_left else "left"
    draw_product_code_label(canvas, Image, ImageDraw, ImageFont, product_code, code_anchor, margin)

    contact_x = (width - contact.width) // 2
    contact_y = height - contact.height - margin
    canvas.alpha_composite(contact, (contact_x, contact_y))

    use_dots_right = index % 2 == 1
    dots_x = width - dots.width - margin if use_dots_right else margin
    dots_y = max(margin, int(height * 0.32))
    canvas.alpha_composite(dots, (dots_x, dots_y))

    dest_path.parent.mkdir(parents=True, exist_ok=True)
    canvas.convert("RGB").save(dest_path, "WEBP", quality=92, method=6)


def clean_webp_for_generated(source_path: Path, dest_path: Path) -> None:
    Image, _ImageDraw, _ImageFont, lanczos = load_pillow()
    base = Image.open(source_path).convert("RGB")
    width, height = base.size
    side = min(width, height)
    left = max(0, (width - side) // 2)
    top = max(0, (height - side) // 2)
    base = base.crop((left, top, left + side, top + side)).resize((1000, 1000), lanczos)
    dest_path.parent.mkdir(parents=True, exist_ok=True)
    base.save(dest_path, "WEBP", quality=98, method=6)


def append_converted(wave_dir: Path, record: dict[str, Any]) -> None:
    variants = source_variants_for_record(record)
    entry = {
        "schema_version": "1.2-api-product-paired-gallery",
        "source_site": "mayaopickleball.vn",
        "destination_site": "x24sport.vn",
        "source_product_id": record.get("source_product_id"),
        "source_product_key": record.get("source_product_key"),
        "source_product_url": record.get("source_product_url"),
        "source_sku": record.get("source_sku"),
        "source_path": record.get("source_path"),
        "source_signature": record.get("source_signature"),
        "source_paths": [item.get("path") or item.get("url") for item in variants],
        "source_signatures": [item.get("signature") for item in variants],
        "destination_product_id": record.get("product_id"),
        "destination_sku": record.get("product_code"),
        "destination_media_ids": record.get("media_ids") or [],
        "converted_at": utc_now(),
    }
    marker = (entry["source_product_id"], entry["source_signature"], entry["destination_product_id"])
    for path in dict.fromkeys((global_converted_path(wave_dir), converted_path(wave_dir))):
        existing = read_jsonl(path)
        seen = {
            (item.get("source_product_id"), item.get("source_signature"), item.get("destination_product_id"))
            for item in existing
        }
        if marker not in seen:
            path.parent.mkdir(parents=True, exist_ok=True)
            with path.open("a", encoding="utf-8") as handle:
                handle.write(json.dumps(entry, ensure_ascii=False, sort_keys=True) + "\n")


def source_record_from_image_paths(paths: list[Path], source_key: str, source_name: str | None = None) -> dict[str, Any]:
    variants: list[dict[str, Any]] = []
    signature_parts: list[str] = []
    for index, path in enumerate(paths, start=1):
        if not path.exists():
            raise SystemExit(f"source image not found: {path}")
        signature = sha256_file(path)
        kind = variant_kind_for_name(path.name)
        if kind == "other" and len(paths) == 1:
            kind = "collared"
        variants.append({
            "kind": kind,
            "label": variant_label(kind),
            "path": str(path),
            "filename": path.name,
            "signature": signature,
            "size": path.stat().st_size,
        })
        signature_parts.append(f"{kind}:{signature}")
    group_signature = hashlib.sha256("|".join(signature_parts).encode("utf-8")).hexdigest()
    first = variants[0]
    return {
        "schema_version": "1.0-user-source-images",
        "source_index": 1,
        "source_site": "user-supplied",
        "source_product_id": None,
        "source_product_key": slugify_ascii(source_key),
        "source_product_name": source_name or source_key,
        "source_product_url": "",
        "source_sku": "",
        "source_path": first["path"],
        "source_filename": first["filename"],
        "source_signature": group_signature,
        "source_signatures": [item["signature"] for item in variants],
        "source_size": sum(int(item["size"]) for item in variants),
        "source_variants": variants,
    }


def cmd_source_images(args: argparse.Namespace) -> int:
    key = args.source_key or "-".join(path.stem for path in args.images)
    record = source_record_from_image_paths(args.images, key, args.source_name)
    write_jsonl(args.out, [record])
    print(json.dumps({
        "source_mode": "user-images",
        "out": str(args.out),
        "source_product_key": record["source_product_key"],
        "count": 1,
        "images": len(args.images),
    }, ensure_ascii=False, indent=2))
    return 0


def cmd_discover(args: argparse.Namespace) -> int:
    source_mode = getattr(args, "source_mode", "local")
    if source_mode == "payload":
        api_url = str(getattr(args, "source_payload_url", DEFAULT_SOURCE_PAYLOAD_URL))
        tenant_slug = str(getattr(args, "source_payload_tenant", DEFAULT_SOURCE_PAYLOAD_TENANT))
        products = fetch_payload_products(
            api_url,
            tenant_slug=tenant_slug,
            limit=args.limit,
            page_size=int(getattr(args, "page_size", 100)),
        )
        records: list[dict[str, Any]] = []
        skipped = 0
        public_base = str(getattr(args, "source_public_base_url", "https://mayaopickleball.vn"))
        for product in products:
            record = source_record_from_payload_product(product, len(records) + 1, api_url, public_base)
            if record is None:
                skipped += 1
                continue
            records.append(record)
            if args.limit and len(records) >= args.limit:
                break
        write_jsonl(args.out, records)
        print(json.dumps({
            "source_mode": "payload",
            "source_api": api_url,
            "tenant_slug": tenant_slug,
            "fetched_products": len(products),
            "skipped_without_two_images": skipped,
            "out": str(args.out),
            "count": len(records),
        }, ensure_ascii=False, indent=2))
        return 0

    if source_mode == "api":
        api_url = str(getattr(args, "source_api_url", DEFAULT_SOURCE_API_URL))
        products = fetch_store_products(
            api_url,
            limit=args.limit,
            page_size=int(getattr(args, "page_size", 100)),
        )
        records: list[dict[str, Any]] = []
        skipped = 0
        for product in products:
            record = source_record_from_api_product(product, len(records) + 1, api_url)
            if record is None:
                skipped += 1
                continue
            records.append(record)
            if args.limit and len(records) >= args.limit:
                break
        write_jsonl(args.out, records)
        print(json.dumps({
            "source_mode": "api",
            "source_api": api_url,
            "fetched_products": len(products),
            "skipped_without_two_images": skipped,
            "out": str(args.out),
            "count": len(records),
        }, ensure_ascii=False, indent=2))
        return 0

    root = args.source_root
    final_dirs = sorted({
        path.parent.resolve()
        for path in root.glob("**/final/*.webp")
        if path.is_file() and "backups" not in {part.casefold() for part in path.parts}
    })
    if args.limit:
        final_dirs = final_dirs[: args.limit]
    records = []
    for index, final_dir in enumerate(final_dirs, start=1):
        paths = choose_source_variants(list(final_dir.glob("*.webp")))
        if not paths:
            continue
        variants: list[dict[str, Any]] = []
        signature_parts: list[str] = []
        for path in paths:
            signature = sha256_file(path)
            kind = variant_kind_for_name(path.name)
            variants.append({
                "kind": kind,
                "label": variant_label(kind),
                "path": str(path),
                "filename": path.name,
                "signature": signature,
                "size": path.stat().st_size,
            })
            signature_parts.append(f"{kind}:{signature}")
        group_signature = hashlib.sha256("|".join(signature_parts).encode("utf-8")).hexdigest()
        try:
            relative_key = final_dir.parent.relative_to(root.resolve())
            key = slugify_ascii("-".join(relative_key.parts)) or slugify_ascii(final_dir.parent.name)
        except ValueError:
            key = slugify_ascii(final_dir.parent.name)
        first = variants[0]
        records.append({
            "schema_version": "1.1-source-product-pair",
            "source_index": index,
            "source_site": "mayaopickleball.vn",
            "source_path": first["path"],
            "source_filename": first["filename"],
            "source_product_key": key,
            "source_signature": group_signature,
            "source_signatures": [item["signature"] for item in variants],
            "source_size": sum(int(item["size"]) for item in variants),
            "source_variants": variants,
        })
    write_jsonl(args.out, records)
    print(json.dumps({"source_mode": "local", "out": str(args.out), "count": len(records)}, ensure_ascii=False, indent=2))
    return 0


def cmd_init(args: argparse.Namespace) -> int:
    wave_dir = args.wave_dir
    source_records = read_jsonl(args.source_jsonl)
    existing = load_manifest(wave_dir)
    completed = converted_records(wave_dir)
    active_elsewhere = sibling_manifest_records(wave_dir)
    seen_signatures = {
        str(record.get("source_signature"))
        for record in [*existing, *active_elsewhere, *completed]
        if record.get("source_signature")
    }
    seen_product_ids = {
        str(record.get("source_product_id"))
        for record in [*existing, *active_elsewhere, *completed]
        if record.get("source_product_id") is not None
    }
    seen_source_skus = set().union(*(
        source_sku_keys_for_record(record)
        for record in [*existing, *active_elsewhere, *completed]
    )) if [*existing, *active_elsewhere, *completed] else set()
    code_no = args.product_code_start
    added = 0
    for source in source_records:
        source_id = source.get("source_product_id")
        source_skus = source_sku_keys_for_record(source)
        if (
            str(source.get("source_signature")) in seen_signatures
            or (source_id is not None and str(source_id) in seen_product_ids)
            or bool(source_skus & seen_source_skus)
        ):
            continue
        while any(record.get("product_code") == product_code(args.product_code_prefix, code_no) for record in existing):
            code_no += 1
        key = str(source["source_product_key"])
        record = dict(source)
        record.update({
            "schema_version": "1.0-manifest",
            "destination_site": "x24sport.vn",
            "product_code": product_code(args.product_code_prefix, code_no),
            "reservation_sku": reservation_sku(str(source["source_signature"])),
            "status": "source_discovered",
            "attempt_count": 0,
            "last_error": None,
            "product_id": None,
            "media_ids": [],
            "artifacts": {
                "item_dir": f"products/{key}",
                "source": None,
                "generated": [],
                "prompts": [],
            },
            "created_at": utc_now(),
            "updated_at": utc_now(),
        })
        existing.append(record)
        seen_signatures.add(str(source["source_signature"]))
        if source_id is not None:
            seen_product_ids.add(str(source_id))
        seen_source_skus.update(source_skus)
        code_no += 1
        added += 1
    save_manifest(wave_dir, existing)
    print(json.dumps({
        "manifest": str(manifest_path(wave_dir)),
        "global_converted_ledger": str(global_converted_path(wave_dir)),
        "total": len(existing),
        "added": added,
        "skipped_known": len(source_records) - added,
    }, ensure_ascii=False, indent=2))
    return 0


def cmd_summary(args: argparse.Namespace) -> int:
    counts: dict[str, int] = {}
    records = load_manifest(args.wave_dir)
    for record in records:
        status = str(record.get("status") or "unknown")
        counts[status] = counts.get(status, 0) + 1
    print(json.dumps({"manifest": str(manifest_path(args.wave_dir)), "total": len(records), "counts": counts}, ensure_ascii=False, indent=2))
    return 0


def cmd_next(args: argparse.Namespace) -> int:
    items = pending(load_manifest(args.wave_dir))
    print(json.dumps({"done": not items, "record": None if not items else items[0]}, ensure_ascii=False, indent=2))
    return 0


def cmd_list_imagegen_ready(args: argparse.Namespace) -> int:
    ready = []
    for record in load_manifest(args.wave_dir):
        if record.get("status") == "analyzed":
            ready.append({
                "source_product_key": record.get("source_product_key"),
                "product_id": record.get("product_id"),
                "source": (record.get("artifacts") or {}).get("source"),
                "sources": (record.get("artifacts") or {}).get("sources") or [],
                "prompts": (record.get("artifacts") or {}).get("prompts") or [],
                "generated_dir": str(args.wave_dir / "products" / str(record.get("source_product_key")) / "generated"),
            })
    print(json.dumps({"ready": ready}, ensure_ascii=False, indent=2))
    return 0


def cmd_mark_generated(args: argparse.Namespace) -> int:
    records = load_manifest(args.wave_dir)
    record = find_record(records, args.source_key)
    item_dir = args.wave_dir / "products" / str(record["source_product_key"])
    generated_dir = item_dir / "generated"
    generated_dir.mkdir(parents=True, exist_ok=True)
    source_variants = source_variants_for_record(record)
    if len(source_variants) > 1 and len(args.images) != len(source_variants):
        raise SystemExit(
            f"paired source requires {len(source_variants)} generated images in source order; got {len(args.images)}"
        )
    generated: list[str] = []
    generated_variants: list[dict[str, Any]] = []
    for idx, image in enumerate(args.images, start=1):
        if not image.exists():
            raise SystemExit(f"generated image not found: {image}")
        dest = generated_dir / f"{str(record['product_code']).lower()}-gaming-{idx}.webp"
        if args.no_overlays:
            clean_webp_for_generated(image, dest)
        else:
            branded_webp_for_generated(image, dest, idx, str(record["product_code"]))
        relative_dest = str(dest.relative_to(args.wave_dir))
        generated.append(relative_dest)
        source_variant = source_variants[idx - 1] if idx <= len(source_variants) else {}
        generated_variants.append({
            "kind": source_variant.get("kind") or "other",
            "label": source_variant.get("label") or f"ảnh sản phẩm {idx}",
            "source_signature": source_variant.get("signature"),
            "path": relative_dest,
        })
    artifacts = dict(record.get("artifacts") or {})
    artifacts["generated"] = generated
    artifacts["generated_variants"] = generated_variants
    patch: dict[str, Any] = {"artifacts": artifacts}
    analysis = dict(record.get("visual_analysis") or {})
    if args.colors:
        analysis["main_colors"] = list(dict.fromkeys(args.colors))
    if args.gradient:
        analysis["gradient"] = args.gradient
    if args.pattern:
        analysis["pattern"] = args.pattern
    if analysis:
        patch["visual_analysis"] = analysis
    mark_record(args.wave_dir, args.source_key, "images_generated", patch)
    print(json.dumps({"source_product_key": args.source_key, "generated": generated}, ensure_ascii=False, indent=2))
    return 0


def process_record(record: dict[str, Any], wave_dir: Path, env: dict[str, str], client: PayloadClient | None, dry_run: bool) -> None:
    key = str(record["source_product_key"])
    item_dir = wave_dir / "products" / key
    source_dir = item_dir / "source"
    prompt_dir = item_dir / "prompts"
    generated_dir = item_dir / "generated"
    source_dir.mkdir(parents=True, exist_ok=True)
    prompt_dir.mkdir(parents=True, exist_ok=True)
    generated_dir.mkdir(parents=True, exist_ok=True)
    source_variants = source_variants_for_record(record)
    if not source_variants:
        raise RuntimeError(f"{key} has no source variants")
    source_locator = str(source_variants[0].get("path") or source_variants[0].get("url") or "")
    local_sources = []
    for index, item in enumerate(source_variants, start=1):
        locator = str(item.get("path") or item.get("url") or "")
        filename = str(item.get("filename") or Path(urllib.parse.urlparse(locator).path).name)
        if not filename:
            filename = f"source-{index}.webp"
        local_sources.append(source_dir / filename)
    local_source = local_sources[0]

    if dry_run:
        print(json.dumps({
            "dry_run_next": key,
            "product_code": record.get("product_code"),
            "reservation_sku": record.get("reservation_sku"),
            "source_path": source_locator,
            "source_product_id": record.get("source_product_id"),
        }, ensure_ascii=False, indent=2))
        return
    if client is None:
        raise RuntimeError("live run requires Payload credentials")

    if record["status"] == "source_discovered":
        existing = client.product_by_sku(str(record["reservation_sku"]))
        if existing:
            patch = {
                "product_id": existing.get("id"),
                "api_duplicate_attached": True,
                "processing_started_at": record.get("processing_started_at") or utc_now(),
            }
            mark_record(wave_dir, key, "reserved", patch)
        else:
            created = client.create_product(placeholder_payload(record, env))
            mark_record(wave_dir, key, "reserved", {
                "product_id": created.get("id"),
                "processing_started_at": utc_now(),
            })
        record = find_record(load_manifest(wave_dir), key)

    if record["status"] == "reserved":
        for variant, local_path in zip(source_variants, local_sources):
            if variant.get("path"):
                variant_path = Path(str(variant["path"]))
                if not variant_path.exists():
                    raise RuntimeError(f"source image missing: {variant_path}")
                shutil.copy2(variant_path, local_path)
            elif variant.get("url"):
                download_source_url(str(variant["url"]), local_path)
            else:
                raise RuntimeError(f"source variant has no path or URL: {variant}")
        artifacts = dict(record.get("artifacts") or {})
        artifacts["source"] = str(local_source.relative_to(wave_dir))
        artifacts["sources"] = [str(path.relative_to(wave_dir)) for path in local_sources]
        mark_record(wave_dir, key, "source_copied", {"artifacts": artifacts})
        record = find_record(load_manifest(wave_dir), key)

    if record["status"] == "source_copied":
        prompt_paths: list[Path] = []
        for idx, variant in enumerate(source_variants_for_record(record), start=1):
            variant_record = dict(record)
            variant_record["source_path"] = variant.get("path") or variant.get("url")
            variant_record["source_filename"] = variant.get("filename")
            variant_record["source_variant_kind"] = variant.get("kind")
            variant_record["source_variant_label"] = variant.get("label")
            prompt_path = prompt_dir / f"{str(record['product_code']).lower()}-gaming-{idx}-{variant.get('kind') or 'variant'}.txt"
            prompt_path.write_text(prompt_for_record(variant_record), encoding="utf-8")
            prompt_paths.append(prompt_path)
        artifacts = dict(record.get("artifacts") or {})
        artifacts["prompts"] = [str(path.relative_to(wave_dir)) for path in prompt_paths]
        mark_record(wave_dir, key, "analyzed", {"artifacts": artifacts})
        print(json.dumps({
            "analyzed": key,
            "sources": [str(path) for path in local_sources],
            "prompts": [str(path) for path in prompt_paths],
            "generated_dir": str(generated_dir),
            "next": "Convert each source with its matching prompt in order, then run mark-generated with both outputs plus verified color/gradient facts.",
        }, ensure_ascii=False, indent=2))
        return

    if record["status"] == "analyzed":
        print(json.dumps({"waiting_for_generated_images": key, "generated_dir": str(generated_dir)}, ensure_ascii=False, indent=2))
        return

    if record["status"] == "images_generated":
        generated = [wave_dir / path for path in (record.get("artifacts") or {}).get("generated", [])]
        if not generated:
            raise RuntimeError(f"{key} has no generated images")
        existing_media_ids = [int(i) for i in (record.get("media_ids") or [])]
        expected_gallery_count = len(source_variants_for_record(record))
        if existing_media_ids and len(existing_media_ids) >= expected_gallery_count:
            mark_record(wave_dir, key, "media_uploaded", {"media_ids": existing_media_ids[:expected_gallery_count]})
            record = find_record(load_manifest(wave_dir), key)
        else:
            media_ids: list[int] = []
            media_search_tags = search_tags_for_record(record)
            generated_variants = (record.get("artifacts") or {}).get("generated_variants") or []
            for idx, path in enumerate(generated, start=1):
                assert_webp(path)
                variant_copy = ""
                if idx <= len(generated_variants):
                    variant_copy = f" {generated_variants[idx - 1].get('label') or ''}".rstrip()
                colors = product_facts_for_record(record)["colors"]
                alt = (
                    f"Áo gaming đặt may {record['product_code']} "
                    f"{', '.join(colors)}{variant_copy} - ảnh sản phẩm {idx}"
                )
                media = client.upload_media(path, alt, media_search_tags)
                media_ids.append(int(media["id"]))
            mark_record(wave_dir, key, "media_uploaded", {"media_ids": media_ids})
            record = find_record(load_manifest(wave_dir), key)

    if record["status"] == "media_uploaded":
        product_id = record.get("product_id")
        if not product_id:
            existing = client.product_by_sku(str(record["reservation_sku"]))
            if existing and existing.get("id") is not None:
                product_id = existing.get("id")
                mark_record(wave_dir, key, "media_uploaded", {"product_id": product_id})
                record = find_record(load_manifest(wave_dir), key)
                product_id = record.get("product_id")
        if not product_id:
            raise RuntimeError(f"{key} is missing product_id")
        payload = final_product_payload(record, [int(i) for i in record.get("media_ids", [])], env)
        updated = client.update_product(product_id, payload)
        mark_record(wave_dir, key, "product_updated", {"product_id": updated.get("id")})
        record = find_record(load_manifest(wave_dir), key)

    if record["status"] == "product_updated":
        product_id = record.get("product_id")
        product = client.get_product(product_id)
        expected_gallery_count = len(source_variants_for_record(record))
        gallery = product.get("gallery") or []
        ok = (
            product.get("sport") == "other"
            and product.get("sku") == record.get("product_code")
            and (expected_gallery_count <= 1 or len(gallery) == expected_gallery_count)
        )
        if not ok:
            raise RuntimeError(
                f"verification failed for {key}: sport={product.get('sport')} "
                f"sku={product.get('sku')} gallery={len(gallery)}/{expected_gallery_count}"
            )
        public_base = env.get("X24SPORT_PUBLIC_BASE_URL", "").rstrip("/")
        product_url = f"{public_base}/san-pham/{product.get('slug')}" if public_base and product.get("slug") else None
        mark_record(wave_dir, key, "verified", {"product_url": product_url})
        append_converted(wave_dir, find_record(load_manifest(wave_dir), key))
        print(json.dumps({"verified": key, "product_id": product_id, "product_url": product_url}, ensure_ascii=False, indent=2))


def cmd_run(args: argparse.Namespace) -> int:
    env = load_env(args.env_file)
    client = None if args.dry_run else PayloadClient(env)
    records = load_manifest(args.wave_dir)
    source_key = getattr(args, "source_key", None)
    if source_key:
        selected = find_record(records, source_key)
        items = [] if selected.get("status") in TERMINAL_STATUSES else [selected]
    else:
        items = pending(records)[: args.max_items]
    if not items:
        print(json.dumps({"done": True}, ensure_ascii=False))
        return 0
    for record in items:
        try:
            process_record(record, args.wave_dir, env, client, args.dry_run)
        except Exception as exc:
            mark_record(args.wave_dir, str(record["source_product_key"]), str(record.get("status") or "source_discovered"), error=str(exc))
            raise
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)

    source_images = sub.add_parser("source-images")
    source_images.add_argument("--images", type=Path, nargs="+", required=True)
    source_images.add_argument("--out", type=Path, required=True)
    source_images.add_argument("--source-key", help="Stable source key; defaults to image stems")
    source_images.add_argument("--source-name", help="Optional human-readable source name")
    source_images.set_defaults(func=cmd_source_images)

    discover = sub.add_parser("discover")
    discover.add_argument("--source-mode", choices=("api", "payload", "local"), default="api")
    discover.add_argument("--source-api-url", default=DEFAULT_SOURCE_API_URL)
    discover.add_argument("--source-payload-url", default=DEFAULT_SOURCE_PAYLOAD_URL)
    discover.add_argument("--source-payload-tenant", default=DEFAULT_SOURCE_PAYLOAD_TENANT)
    discover.add_argument("--source-public-base-url", default="https://mayaopickleball.vn")
    discover.add_argument("--page-size", type=int, default=100)
    discover.add_argument("--source-root", type=Path, default=DEFAULT_SOURCE_ROOT)
    discover.add_argument("--out", type=Path, required=True)
    discover.add_argument("--limit", type=int)
    discover.set_defaults(func=cmd_discover)

    init = sub.add_parser("init")
    init.add_argument("--wave-dir", type=Path, default=DEFAULT_WAVE)
    init.add_argument("--source-jsonl", type=Path, required=True)
    init.add_argument("--product-code-prefix", default="X24-GM-")
    init.add_argument("--product-code-start", type=int, default=1)
    init.set_defaults(func=cmd_init)

    run = sub.add_parser("run")
    run.add_argument("--wave-dir", type=Path, default=DEFAULT_WAVE)
    run.add_argument(
        "--env-file",
        type=Path,
        help=f"Payload credential env file (default: {DEFAULT_ENV_FILE})",
    )
    run.add_argument("--max-items", type=int, default=1)
    run.add_argument("--source-key", help="Process only this manifest source_product_key")
    run.add_argument("--dry-run", action="store_true")
    run.set_defaults(func=cmd_run)

    mark_generated = sub.add_parser("mark-generated")
    mark_generated.add_argument("--wave-dir", type=Path, default=DEFAULT_WAVE)
    mark_generated.add_argument("--source-key", required=True)
    mark_generated.add_argument("--images", type=Path, nargs="+", required=True)
    mark_generated.add_argument("--colors", nargs="+", help="Verified main garment colors from approved outputs")
    mark_generated.add_argument("--gradient", help="Verified gradient description from approved outputs")
    mark_generated.add_argument("--pattern", help="Verified visible garment pattern; omit when none is visible")
    mark_generated.add_argument("--no-overlays", action="store_true", help="Export clean 1000x1000 WebP without logo, hotline, product code, or color dots")
    mark_generated.set_defaults(func=cmd_mark_generated)

    summary = sub.add_parser("summary")
    summary.add_argument("--wave-dir", type=Path, default=DEFAULT_WAVE)
    summary.set_defaults(func=cmd_summary)

    next_cmd = sub.add_parser("next")
    next_cmd.add_argument("--wave-dir", type=Path, default=DEFAULT_WAVE)
    next_cmd.set_defaults(func=cmd_next)

    ready = sub.add_parser("list-imagegen-ready")
    ready.add_argument("--wave-dir", type=Path, default=DEFAULT_WAVE)
    ready.set_defaults(func=cmd_list_imagegen_ready)

    args = parser.parse_args()
    return args.func(args)


if __name__ == "__main__":
    raise SystemExit(main())
