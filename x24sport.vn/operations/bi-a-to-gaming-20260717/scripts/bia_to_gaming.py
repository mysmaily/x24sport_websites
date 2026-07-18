#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import subprocess
import sys
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "source"
GENERATED_DIR = ROOT / "generated"
FINAL_DIR = ROOT / "final"
BACKUP_DIR = ROOT / "backups"
LOGO_PATH = ROOT / "logo-x24sport.png"
SOURCE_JSON = ROOT / "source-products.json"
MANIFEST_JSON = ROOT / "manifest.json"
DEFAULT_PUBLIC_BASE = "https://next.x24sport.vn"
SOURCE_CATEGORY_SLUG = "ao-bi-a"
DEST_CATEGORY_SLUG = "ao-gaming"
SOURCE_SYSTEM = "x24-billiards-to-gaming"


def now_stamp() -> str:
    return datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")


def require_env(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        raise SystemExit(f"missing environment variable: {name}")
    return value


def api_base() -> str:
    return require_env("CMS_API_URL").rstrip("/") + "/api"


def auth_headers(extra: dict[str, str] | None = None) -> dict[str, str]:
    headers = {
        "Authorization": f"users API-Key {require_env('PAYLOAD_API_KEY')}",
        "Accept": "application/json",
    }
    if extra:
        headers.update(extra)
    return headers


def request_json(path: str, method: str = "GET", payload: dict[str, Any] | None = None) -> Any:
    body = None if payload is None else json.dumps(payload, ensure_ascii=False).encode("utf-8")
    headers = auth_headers({"Content-Type": "application/json"} if payload is not None else None)
    req = urllib.request.Request(api_base() + path, method=method, headers=headers, data=body)
    try:
        with urllib.request.urlopen(req, timeout=90) as response:
            raw = response.read().decode("utf-8")
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="ignore")[:1200]
        raise RuntimeError(f"API {method} {path} failed HTTP {exc.code}: {detail}") from exc


def unwrap_doc(data: Any) -> dict[str, Any]:
    if isinstance(data, dict) and isinstance(data.get("doc"), dict):
        return data["doc"]
    if isinstance(data, dict):
        return data
    raise RuntimeError(f"unexpected response: {type(data)!r}")


def qs(params: dict[str, Any]) -> str:
    return urllib.parse.urlencode({k: str(v) for k, v in params.items()})


def resolve_tenant() -> dict[str, Any]:
    data = request_json("/tenants?" + qs({"where[slug][equals]": "x24sport", "limit": 1, "depth": 0}))
    docs = data.get("docs") or []
    if len(docs) != 1:
        raise RuntimeError(f"expected exactly one x24sport tenant, got {len(docs)}")
    return docs[0]


def resolve_category(slug: str) -> dict[str, Any]:
    data = request_json("/product-categories?" + qs({
        "where[tenant.slug][equals]": "x24sport",
        "where[slug][equals]": slug,
        "limit": 1,
        "depth": 0,
    }))
    docs = data.get("docs") or []
    if len(docs) != 1:
        raise RuntimeError(f"expected one category {slug}, got {len(docs)}")
    return docs[0]


def source_products(source_category_id: int) -> list[dict[str, Any]]:
    data = request_json("/products?" + qs({
        "where[tenant.slug][equals]": "x24sport",
        "where[categories][contains]": source_category_id,
        "limit": 100,
        "depth": 2,
        "sort": "-createdAt",
    }))
    return data.get("docs") or []


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def slugify(value: str) -> str:
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


def code_number(sku: str, slug: str) -> str:
    text = f"{sku} {slug}"
    match = re.search(r"(?:BA|ba)-?(\d{3})", text)
    if not match:
        match = re.search(r"(\d{3})", text)
    if not match:
        raise RuntimeError(f"cannot infer product code number from {sku} / {slug}")
    return match.group(1)


def colors_from_name(name: str) -> list[str]:
    color_words = [
        "Tím Than", "Xanh Dương", "Hồng Nhạt", "Xanh Mint", "Xanh Ve Chai",
        "Đen", "Trắng", "Hồng", "Đỏ", "Tím", "Xám", "Xanh", "Cam", "Vàng",
    ]
    found: list[str] = []
    lower = name.casefold()
    for color in color_words:
        if color.casefold() in lower and color not in found:
            found.append(color)
    return found[:4] or ["Thiết Kế Đội"]


def lexical_doc(paragraphs: list[str]) -> dict[str, Any]:
    return {
        "root": {
            "type": "root",
            "children": [
                {
                    "type": "paragraph",
                    "children": [{"text": paragraph, "type": "text", "version": 1}],
                    "direction": "ltr",
                    "format": "",
                    "indent": 0,
                    "version": 1,
                }
                for paragraph in paragraphs
            ],
            "direction": "ltr",
            "format": "",
            "indent": 0,
            "version": 1,
        }
    }


def download(url: str, out: Path) -> None:
    out.parent.mkdir(parents=True, exist_ok=True)
    req = urllib.request.Request(url, headers={"User-Agent": "x24-billiards-to-gaming/1.0"})
    with urllib.request.urlopen(req, timeout=120) as response, out.open("wb") as handle:
        handle.write(response.read())


def existing_conversion(source_id: int) -> dict[str, Any] | None:
    data = request_json("/products?" + qs({
        "where[tenant.slug][equals]": "x24sport",
        "where[sourceSystem][equals]": SOURCE_SYSTEM,
        "where[sourceId][equals]": str(source_id),
        "limit": 1,
        "depth": 0,
    }))
    docs = data.get("docs") or []
    return docs[0] if docs else None


def build_manifest(products: list[dict[str, Any]], tenant: dict[str, Any], dest_category: dict[str, Any]) -> list[dict[str, Any]]:
    records = []
    for product in products:
        gallery = product.get("gallery") or []
        media = gallery[0] if gallery and isinstance(gallery[0], dict) else {}
        url = media.get("url")
        if not url:
            continue
        number = code_number(str(product.get("sku") or ""), str(product.get("slug") or ""))
        gm_code = f"X24-GM-{number}"
        colors = colors_from_name(str(product.get("name") or ""))
        local_source = SOURCE_DIR / f"x24-ba-{number}{Path(urllib.parse.urlparse(url).path).suffix or '.png'}"
        records.append({
            "sourceProductId": product["id"],
            "sourceSku": product.get("sku"),
            "sourceSlug": product.get("slug"),
            "sourceName": product.get("name"),
            "sourceImageUrl": url,
            "sourceImageAlt": media.get("alt") or product.get("name"),
            "sourceImagePath": str(local_source),
            "sourceImageChecksum": None,
            "productCode": gm_code,
            "productSlug": f"ao-thi-dau-gaming-{gm_code.lower()}-{'-'.join(slugify(c) for c in colors)}",
            "colors": colors,
            "tenantId": tenant["id"],
            "destCategoryId": dest_category["id"],
            "generatedImagePath": str(GENERATED_DIR / f"{gm_code.lower()}-base.png"),
            "finalImagePath": str(FINAL_DIR / f"{gm_code.lower()}-gaming.webp"),
            "existingProductId": None,
            "createdProductId": None,
            "createdMediaId": None,
            "productUrl": None,
            "status": "source_discovered",
        })
    return records


def save_json(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2, sort_keys=True), encoding="utf-8")


def load_manifest() -> list[dict[str, Any]]:
    return json.loads(MANIFEST_JSON.read_text(encoding="utf-8"))


def save_manifest(records: list[dict[str, Any]]) -> None:
    save_json(MANIFEST_JSON, records)


def cmd_fetch(_args: argparse.Namespace) -> int:
    tenant = resolve_tenant()
    source_category = resolve_category(SOURCE_CATEGORY_SLUG)
    dest_category = resolve_category(DEST_CATEGORY_SLUG)
    products = source_products(int(source_category["id"]))
    stamp = now_stamp()
    save_json(BACKUP_DIR / f"{stamp}-source-category-{SOURCE_CATEGORY_SLUG}.json", source_category)
    save_json(BACKUP_DIR / f"{stamp}-dest-category-{DEST_CATEGORY_SLUG}.json", dest_category)
    save_json(BACKUP_DIR / f"{stamp}-source-products.json", products)
    save_json(SOURCE_JSON, products)
    records = build_manifest(products, tenant, dest_category)
    for record in records:
        existing = existing_conversion(int(record["sourceProductId"]))
        if existing:
            record["existingProductId"] = existing.get("id")
            record["status"] = "already_exists"
        if record["status"] == "source_discovered":
            path = Path(record["sourceImagePath"])
            download(str(record["sourceImageUrl"]), path)
            record["sourceImageChecksum"] = sha256_file(path)
            record["status"] = "source_downloaded"
    save_manifest(records)
    print(json.dumps({
        "sourceProducts": len(products),
        "manifestRecords": len(records),
        "downloaded": sum(1 for r in records if r["status"] == "source_downloaded"),
        "alreadyExists": sum(1 for r in records if r["status"] == "already_exists"),
        "manifest": str(MANIFEST_JSON),
    }, ensure_ascii=False, indent=2))
    return 0


def prompt_for(record: dict[str, Any]) -> str:
    colors = ", ".join(record["colors"])
    return f"""Use case: ads-marketing
Asset type: 1000x1000 ecommerce product image for an esports jersey category
Primary request: Transform the source billiards jersey design into a dramatic gaming/esports team jersey product image.
Input image role: garment-design reference only. Preserve the source jersey colorway ({colors}), panel map, line accents, collar/sleeve construction, logo/crest placement logic, sewn hems, and overall design language. Do not preserve billiards cues, pool table, balls, old product context, source text, or any watermarks.
Subject: five Vietnamese/Asian esports players, mixed male and female if natural, wearing matching jerseys derived from the source. Central captain slightly forward, teammates staggered in a powerful V formation. Intense confident expressions, crossed arms or hands near gaming headsets/controllers, championship-ready team reveal.
Scene/backdrop: dark cyber esports arena, LED wall, blue/orange/yellow rim lights adapted to the jersey palette, light smoke, cinematic shadows, premium roster photoshoot.
Jersey requirements: modern short-sleeve gaming jersey, athletic fit, black gaming pants, realistic sublimated fabric, folds, seams, collar and sleeve openings. Add only blank abstract crest/sponsor patch shapes; no readable text, fake words, team names, numbers, or real brands.
Composition: square 1:1, web catalog hero crop, faces and upper bodies clear, jersey front pattern readable on most players, leave modest safe space in top-left/top-right and bottom for post-process logo/product-code/hotline overlays.
Style: photorealistic high-end esports team advertising photo, sharp faces, accurate anatomy and hands, realistic fabric texture, dramatic but clean lighting.
Avoid: billiards cues, pool balls, pool table, sports courts, rackets, readable text, fake logos, phone numbers, watermarks, duplicated faces, deformed hands, cartoon/anime look, flat pasted shirt print, garment color drift, old source branding."""


def cmd_prompts(_args: argparse.Namespace) -> int:
    records = load_manifest()
    prompt_dir = ROOT / "prompts"
    prompt_dir.mkdir(exist_ok=True)
    ready = []
    for record in records:
        if record["status"] in {"source_downloaded", "generated"}:
            path = prompt_dir / f"{record['productCode'].lower()}-prompt.txt"
            path.write_text(prompt_for(record), encoding="utf-8")
            record["promptPath"] = str(path)
            ready.append({"code": record["productCode"], "source": record["sourceImagePath"], "prompt": str(path)})
    save_manifest(records)
    print(json.dumps({"ready": ready}, ensure_ascii=False, indent=2))
    return 0


def load_pillow():
    try:
        from PIL import Image, ImageDraw, ImageFont
    except ModuleNotFoundError as exc:
        raise SystemExit("Pillow is required: python3 -m pip install pillow") from exc
    return Image, ImageDraw, ImageFont


def font(image_font: Any, size: int) -> Any:
    for candidate in [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "DejaVuSans-Bold.ttf",
    ]:
        try:
            return image_font.truetype(candidate, size)
        except OSError:
            pass
    return image_font.load_default()


def cover_square(image: Any, size: int = 1000) -> Any:
    w, h = image.size
    side = min(w, h)
    left = max(0, (w - side) // 2)
    top = max(0, int((h - side) * 0.38))
    return image.crop((left, top, left + side, top + side)).resize((size, size))


def add_overlays(src: Path, dest: Path, code: str) -> None:
    Image, ImageDraw, ImageFont = load_pillow()
    canvas = cover_square(Image.open(src).convert("RGBA"), 1000)
    draw = ImageDraw.Draw(canvas)
    logo = Image.open(LOGO_PATH).convert("RGBA")
    logo_w = 210
    logo_h = max(1, int(logo.height * (logo_w / logo.width)))
    logo = logo.resize((logo_w, logo_h))
    margin = 28
    panel_pad = 12
    draw.rounded_rectangle(
        (margin - panel_pad, margin - panel_pad, margin + logo_w + panel_pad, margin + logo_h + panel_pad),
        radius=18,
        fill=(0, 0, 0, 135),
        outline=(255, 255, 255, 80),
        width=1,
    )
    canvas.alpha_composite(logo, (margin, margin))

    code_font = font(ImageFont, 28)
    bbox = draw.textbbox((0, 0), code, font=code_font)
    cw, ch = bbox[2] - bbox[0], bbox[3] - bbox[1]
    x2 = 1000 - margin
    draw.rounded_rectangle((x2 - cw - 34, margin - 4, x2, margin + ch + 22), radius=14, fill=(0, 0, 0, 185))
    draw.text((x2 - cw - 17, margin + 7), code, fill=(255, 255, 255, 255), font=code_font)

    hotline = "Hotline: 0989 353 247"
    hot_font = font(ImageFont, 34)
    hb = draw.textbbox((0, 0), hotline, font=hot_font)
    hw, hh = hb[2] - hb[0], hb[3] - hb[1]
    hx = (1000 - hw) // 2
    hy = 1000 - hh - 36
    draw.rounded_rectangle((hx - 20, hy - 12, hx + hw + 20, hy + hh + 14), radius=26, fill=(0, 0, 0, 175), outline=(255, 255, 255, 225), width=3)
    draw.text((hx, hy), hotline, fill=(255, 255, 255, 255), font=hot_font)

    dest.parent.mkdir(parents=True, exist_ok=True)
    canvas.convert("RGB").save(dest, "WEBP", quality=92, method=6)


def cmd_postprocess(args: argparse.Namespace) -> int:
    records = load_manifest()
    by_code = {record["productCode"]: record for record in records}
    for item in args.image:
        if "=" not in item:
            raise SystemExit("--image values must use CODE=/path/to/generated.png")
        code, path_value = item.split("=", 1)
        if code not in by_code:
            raise SystemExit(f"unknown product code: {code}")
        src = Path(path_value)
        if not src.exists():
            raise SystemExit(f"generated image missing: {src}")
        record = by_code[code]
        record["generatedImagePath"] = str(src)
        dest = Path(record["finalImagePath"])
        add_overlays(src, dest, code)
        record["finalImageChecksum"] = sha256_file(dest)
        record["status"] = "final_ready"
    save_manifest(records)
    print(json.dumps({"finalReady": [r["productCode"] for r in records if r["status"] == "final_ready"]}, ensure_ascii=False, indent=2))
    return 0


def upload_media(path: Path, alt: str, tenant_id: int, source_id: str, checksum: str) -> dict[str, Any]:
    payload = {
        "tenant": tenant_id,
        "alt": alt,
        "sourceSystem": SOURCE_SYSTEM,
        "sourceId": source_id,
        "sourceChecksum": checksum,
    }
    cmd = [
        "curl", "-fsS", "--max-time", "180",
        "-H", f"Authorization: users API-Key {require_env('PAYLOAD_API_KEY')}",
        "-F", f"file=@{path}",
        "-F", "_payload=" + json.dumps(payload, ensure_ascii=False),
        api_base() + "/media",
    ]
    result = subprocess.run(cmd, text=True, capture_output=True, check=True)
    return unwrap_doc(json.loads(result.stdout))


def product_payload(record: dict[str, Any], media_id: int) -> dict[str, Any]:
    code = record["productCode"]
    colors = ", ".join(record["colors"])
    name = f"Áo Gaming {code} {colors}"
    short = f"Áo thi đấu gaming đặt may {code} tông {colors}, chuyển thể từ thiết kế áo bi-a sang jersey esports, nhận in nickname, số và logo team."
    description = [
        f"{name} giữ tinh thần phối màu {colors} và bố cục đồ họa của mẫu áo gốc, nhưng được trình bày theo phong cách đội tuyển gaming/esports.",
        "Hình ảnh sản phẩm thể hiện nhóm game thủ mặc jersey đồng đội trong bối cảnh sân khấu esports, giúp đội nhóm dễ hình dung khi đặt may áo thi đấu hoặc áo sự kiện.",
        "X24 nhận tùy chỉnh nickname, số áo, logo team, vị trí sponsor và màu nhận diện theo file thiết kế khách hàng xác nhận.",
        "Trước khi chốt đơn, khách hàng nên xác nhận chất liệu, bảng size, số lượng, vị trí in và thời gian sản xuất. Các đặc tính kỹ thuật của vải chỉ áp dụng khi có thông số được xác nhận riêng.",
    ]
    return {
        "tenant": record["tenantId"],
        "name": name,
        "slug": record["productSlug"],
        "sku": code,
        "sport": "other",
        "productType": "simple",
        "price": None,
        "compareAtPrice": None,
        "regularPrice": None,
        "salePrice": None,
        "currency": "VND",
        "stockStatus": "instock",
        "isPurchasable": False,
        "publicationStatus": "publish",
        "shortDescription": short[:230],
        "description": lexical_doc(description),
        "seoTitle": f"{name} | Áo thi đấu gaming đặt may X24Sport",
        "metaDescription": f"{name}: jersey esports đồng đội, phong cách gaming sân khấu, nhận in nickname, số áo, logo team và sponsor theo yêu cầu.",
        "categories": [record["destCategoryId"]],
        "gallery": [media_id],
        "badges": [{"label": "Gaming"}, {"label": "Jersey team"}],
        "featured": False,
        "sourceSystem": SOURCE_SYSTEM,
        "sourceId": str(record["sourceProductId"]),
        "sourceChecksum": record.get("sourceImageChecksum"),
        "searchTags": [{"value": tag} for tag in [
            "áo thi đấu gaming",
            "áo esports",
            "đồng phục gaming",
            "gaming team jersey",
            *record["colors"],
        ]],
    }


def cmd_publish(args: argparse.Namespace) -> int:
    records = load_manifest()
    selected = [r for r in records if r["status"] == "final_ready"]
    if args.code:
        selected = [r for r in selected if r["productCode"] in set(args.code)]
    if args.dry_run:
        print(json.dumps({"wouldPublish": [{"code": r["productCode"], "slug": r["productSlug"]} for r in selected]}, ensure_ascii=False, indent=2))
        return 0
    for record in selected:
        existing = existing_conversion(int(record["sourceProductId"]))
        if existing:
            record["existingProductId"] = existing.get("id")
            record["createdProductId"] = existing.get("id")
            record["status"] = "already_exists"
            continue
        final_path = Path(record["finalImagePath"])
        media = upload_media(
            final_path,
            f"Áo thi đấu gaming {record['productCode']} {', '.join(record['colors'])}",
            int(record["tenantId"]),
            f"{record['sourceProductId']}:image",
            str(record["finalImageChecksum"]),
        )
        record["createdMediaId"] = media["id"]
        created = unwrap_doc(request_json("/products", method="POST", payload=product_payload(record, int(media["id"]))))
        record["createdProductId"] = created["id"]
        base = os.environ.get("X24SPORT_PUBLIC_BASE_URL", DEFAULT_PUBLIC_BASE).rstrip("/")
        record["productUrl"] = f"{base}/{created['slug']}/"
        record["status"] = "published"
        save_manifest(records)
    print(json.dumps({"published": [r["productCode"] for r in records if r["status"] == "published"]}, ensure_ascii=False, indent=2))
    return 0


def cmd_summary(_args: argparse.Namespace) -> int:
    records = load_manifest()
    counts: dict[str, int] = {}
    for record in records:
        counts[record["status"]] = counts.get(record["status"], 0) + 1
    print(json.dumps({"total": len(records), "counts": counts, "manifest": str(MANIFEST_JSON)}, ensure_ascii=False, indent=2))
    return 0


def main() -> int:
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("fetch").set_defaults(func=cmd_fetch)
    sub.add_parser("prompts").set_defaults(func=cmd_prompts)
    post = sub.add_parser("postprocess")
    post.add_argument("--image", action="append", required=True, help="CODE=/path/to/generated.png")
    post.set_defaults(func=cmd_postprocess)
    publish = sub.add_parser("publish")
    publish.add_argument("--code", action="append")
    publish.add_argument("--dry-run", action="store_true")
    publish.set_defaults(func=cmd_publish)
    sub.add_parser("summary").set_defaults(func=cmd_summary)
    args = parser.parse_args()
    return args.func(args)


if __name__ == "__main__":
    raise SystemExit(main())
