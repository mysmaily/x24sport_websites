#!/usr/bin/env python3
"""Validate playful-shirt handoff structure, checksums, roles, and image dimensions."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import shutil
import subprocess
from pathlib import Path


PRODUCER = "tao-anh-ao-ngo-nghinh"
SKU_RE = re.compile(r"^X24-DP-[0-9]{6}$")
SLUG_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
SHA_RE = re.compile(r"^[0-9a-f]{64}$")
INVENTORY_PREFIX = re.compile(r"^(?:ảnh chụp|hình ảnh|poster|bảng catalog|catalog)\b", re.IGNORECASE)


def fail(message: str) -> None:
    raise SystemExit(f"ERROR: {message}")


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def image_info(path: Path) -> tuple[str, int, int]:
    magick = shutil.which("magick")
    if not magick:
        fail("ImageMagick `magick` is required")
    result = subprocess.run(
        [magick, "identify", "-format", "%m|%w|%h", str(path)],
        check=False,
        capture_output=True,
        text=True,
    )
    if result.returncode:
        fail(f"cannot inspect {path}: {result.stderr.strip()}")
    fmt, width, height = result.stdout.split("|")
    return fmt, int(width), int(height)


def checked_file(item: dict, location: str) -> Path:
    path = Path(str(item.get("path", "")))
    if not path.is_absolute():
        fail(f"{location}.path must be absolute")
    path = path.resolve()
    if not path.is_file():
        fail(f"file not found: {path}")
    expected = str(item.get("sha256", "")).lower()
    if not SHA_RE.fullmatch(expected):
        fail(f"{location}.sha256 must be 64 lowercase hex characters")
    actual = sha256(path)
    if actual != expected:
        fail(f"checksum mismatch for {path}: expected {expected}, got {actual}")
    return path


def required_copy(item: dict, key: str, location: str) -> str:
    value = str(item.get(key, "")).strip()
    if not value:
        fail(f"{location}.{key} is required")
    if INVENTORY_PREFIX.search(value):
        fail(f"{location}.{key} uses inventory-style copy")
    return value


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", required=True, type=Path)
    parser.add_argument("--image", action="append", default=[], type=Path)
    parser.add_argument("--require-publishing-set", action="store_true")
    args = parser.parse_args()

    if not args.manifest.is_file():
        fail(f"manifest not found: {args.manifest}")
    try:
        data = json.loads(args.manifest.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        fail(f"cannot parse manifest: {error}")

    required = {
        "schemaVersion", "producerSkill", "createdAt", "consumerPolicy", "publishingIntent",
        "productIdentity", "sourceAssets", "acceptedImages", "artworkFacts", "audiences",
        "useCases", "unsupportedClaims", "suggestedCategories", "copySeeds",
    }
    missing = required - data.keys()
    if missing:
        fail(f"missing top-level fields: {sorted(missing)}")
    schema_version = data["schemaVersion"]
    if schema_version not in {"1.0", "1.1"} or data["producerSkill"] != PRODUCER:
        fail("unsupported schemaVersion or producerSkill")
    policy = data["consumerPolicy"]
    if policy.get("visualInspection") != "not-required-after-validation" or policy.get("uploadSourceAssets") is not False:
        fail("consumerPolicy must disable source-asset uploads and allow checksum fast path")

    intent = data["publishingIntent"]
    if intent.get("action") not in {"publish", "draft", "images-only"}:
        fail("publishingIntent.action must be publish, draft, or images-only")
    expected = {
        "tenantSlug": "mayaodongphuc",
        "domain": "mayaodongphuc.com.vn",
        "pricingMode": "quote-only",
        "isPurchasable": False,
        "stockStatus": "instock",
        "currency": "VND",
    }
    for key, value in expected.items():
        if intent.get(key) != value:
            fail(f"publishingIntent.{key} must be {value!r}")
    categories = intent.get("categorySlugs")
    if not isinstance(categories, list) or not categories or any(not SLUG_RE.fullmatch(str(x)) for x in categories):
        fail("publishingIntent.categorySlugs must contain website category slugs")

    identity = data["productIdentity"]
    sku = str(identity.get("sku", ""))
    if not SKU_RE.fullmatch(sku):
        fail("productIdentity.sku must match X24-DP-NNNNNN")
    if identity.get("sourceSystem") != PRODUCER or identity.get("sourceId") != sku:
        fail("productIdentity sourceSystem/sourceId must preserve producer and SKU")
    product_title = str(identity.get("productTitle", "")).strip()
    if not product_title:
        fail("productIdentity.productTitle is required")
    if sku in product_title:
        fail("productIdentity.productTitle must be a clean H1 and must not contain the SKU")
    if str(identity.get("skuLabel", "")).strip() != f"Mã mẫu: {sku}":
        fail("productIdentity.skuLabel must be exact text: Mã mẫu: <SKU>")
    if not str(identity.get("productDescription", "")).startswith(f"Mã mẫu: {sku}."):
        fail("productIdentity.productDescription must begin with exact SKU sentence")

    student_variant = data.get("studentVariant")
    if schema_version == "1.1":
        if not isinstance(student_variant, dict):
            fail("schema 1.1 requires studentVariant")
        grade = student_variant.get("grade")
        expected_ages = {8: "13-14", 9: "14-15", 10: "15-16", 11: "16-17", 12: "17-18"}
        if grade not in expected_ages:
            fail("studentVariant.grade must be an integer from 8 to 12")
        if student_variant.get("ageRange") != expected_ages[grade]:
            fail("studentVariant.ageRange does not match grade")
        if student_variant.get("castCount") not in {4, 5}:
            fail("studentVariant.castCount must be 4 or 5")
        for key in ("scene", "action"):
            if not str(student_variant.get(key, "")).strip():
                fail(f"studentVariant.{key} is required")
        if student_variant.get("selection") != "stable-sha256":
            fail("studentVariant.selection must be stable-sha256")

    source_assets = data["sourceAssets"]
    master_item = source_assets.get("printMaster") if isinstance(source_assets, dict) else None
    if not isinstance(master_item, dict):
        fail("sourceAssets.printMaster is required")
    master_path = checked_file(master_item, "sourceAssets.printMaster")
    if master_path.name != f"{sku}.png":
        fail("print master filename must be exact SKU.png")
    master_fmt, master_width, master_height = image_info(master_path)
    if (master_fmt, master_width, master_height) != ("PNG", 4500, 4500):
        fail("print master must be PNG 4500x4500")

    images = data["acceptedImages"]
    expected_count = 3 if schema_version == "1.1" else 2
    if not isinstance(images, list) or len(images) != expected_count:
        fail(f"schema {schema_version} acceptedImages must contain exactly {expected_count} publishing images")
    paths: list[Path] = []
    roles: list[str] = []
    for index, item in enumerate(images):
        location = f"acceptedImages[{index}]"
        if not isinstance(item, dict):
            fail(f"{location} must be an object")
        path = checked_file(item, location)
        if path == master_path or path.suffix.lower() == ".png":
            fail("print master PNG must not appear in acceptedImages")
        paths.append(path)
        roles.append(str(item.get("role", "")))
        required_copy(item, "altSeed", location)
        required_copy(item, "captionSeed", location)
        if not isinstance(item.get("visualTags"), list) or not item["visualTags"]:
            fail(f"{location}.visualTags must be a non-empty array")
        placement = item.get("productPlacement")
        if not isinstance(placement, dict) or placement.get("gallery") is not True:
            fail(f"{location}.productPlacement.gallery must be true")

    expected_roles = (
        ["product hero", "content-inline lifestyle", "print artwork preview"]
        if schema_version == "1.1"
        else ["product hero", "print artwork preview"]
    )
    if roles != expected_roles:
        fail(f"acceptedImages roles/order must be {expected_roles}")
    if paths[0].name != f"{sku}-marketing.webp":
        fail("hero filename must be SKU-marketing.webp")
    lifestyle_index = 1 if schema_version == "1.1" else None
    preview_index = 2 if schema_version == "1.1" else 1
    if lifestyle_index is not None and paths[lifestyle_index].name != f"{sku}-student-lifestyle.webp":
        fail("student lifestyle filename must be SKU-student-lifestyle.webp")
    if paths[preview_index].name != f"{sku}-print-preview.webp":
        fail("preview filename must be SKU-print-preview.webp")
    hero_fmt, hero_width, hero_height = image_info(paths[0])
    preview_fmt, preview_width, preview_height = image_info(paths[preview_index])
    if hero_fmt != "WEBP" or hero_width != hero_height or hero_width < 1200:
        fail("marketing hero must be square WebP at least 1200px")
    if lifestyle_index is not None:
        lifestyle_fmt, lifestyle_width, lifestyle_height = image_info(paths[lifestyle_index])
        if lifestyle_fmt != "WEBP" or lifestyle_width != lifestyle_height or lifestyle_width < 1200:
            fail("student lifestyle must be square WebP at least 1200px")
    if (preview_fmt, preview_width, preview_height) != ("WEBP", 500, 500):
        fail("print preview must be exact 500x500 WebP")
    if images[0]["productPlacement"].get("contentEmbed") is not False:
        fail("hero must not be embedded below product copy")
    if lifestyle_index is not None:
        lifestyle_placement = images[lifestyle_index]["productPlacement"]
        if lifestyle_placement.get("contentEmbed") is not True or lifestyle_placement.get("contentOrder") != 1:
            fail("student lifestyle must be contentEmbed=true with contentOrder=1")
    preview_placement = images[preview_index]["productPlacement"]
    expected_preview_order = 2 if schema_version == "1.1" else 1
    if preview_placement.get("contentEmbed") is not True or preview_placement.get("contentOrder") != expected_preview_order:
        fail(f"print preview must be contentEmbed=true with contentOrder={expected_preview_order}")

    requested = {path.resolve() for path in args.image}
    manifest_paths = set(paths)
    if requested - manifest_paths:
        fail("one or more requested publishing images are missing from manifest")
    if args.require_publishing_set and requested != manifest_paths:
        fail("publishing-set validation must pass exactly both accepted images")

    print(
        f"PASS manifest={args.manifest.resolve()} producer={PRODUCER} "
        f"schema={schema_version} sku={sku} images={expected_count} preview=500x500"
    )


if __name__ == "__main__":
    main()
