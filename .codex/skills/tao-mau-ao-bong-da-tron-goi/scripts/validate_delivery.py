#!/usr/bin/env python3
"""Validate a complete front/back print-master and football sales delivery."""

from __future__ import annotations

import hashlib
import json
import re
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError as error:
    raise SystemExit("Pillow is required") from error


SKU_RE = re.compile(r"^X24-BD-[0-9]{2}(?:[01][0-9]|2[0-3])(?:0[1-9]|[12][0-9]|3[01])$")
EXPECTED_ROLES = {
    "front print master": ("PNG", False),
    "back print master": ("PNG", False),
    "mockup base": ("WEBP", True),
    "sales image": ("WEBP", True),
}
VISUAL_FLAGS = {
    "frontFlatArtworkOnly", "backFlatArtworkOnly", "frontBackCoherent",
    "mockupMatchesFront", "mockupMatchesBack", "commercialTextExact",
}
REQUIRED_SALES_SPEC_FIELDS = {
    "collection", "offer", "modelNumber", "frontNumber",
    "playerName", "playerNumber", "teamName", "materialLine",
    "website", "hotline", "sizes", "selectedCollar",
}
FORBIDDEN_SALES_SPEC_FIELDS = {"price", "cta"}


def fail(message: str) -> None:
    print(f"ERROR: {message}", file=sys.stderr)
    raise SystemExit(1)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def main() -> None:
    if len(sys.argv) != 2:
        fail("usage: validate_delivery.py /absolute/path/to/product-folder")
    folder = Path(sys.argv[1]).expanduser().resolve()
    manifest_path = folder / "delivery-manifest.json"
    spec_path = folder / "design-spec.json"
    if not folder.is_dir() or not manifest_path.is_file() or not spec_path.is_file():
        fail("product folder, design-spec.json, and delivery-manifest.json are required")

    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    sku = manifest.get("sku")
    if not isinstance(sku, str) or not SKU_RE.fullmatch(sku):
        fail("manifest sku must match X24-BD-FFHHDD")
    assumptions = manifest.get("productionAssumptions", {})
    physical = assumptions.get("physicalMm")
    ppi = assumptions.get("ppi")
    if not (isinstance(physical, list) and len(physical) == 2 and all(isinstance(v, (int, float)) and v > 0 for v in physical)):
        fail("productionAssumptions.physicalMm must contain two positive numbers")
    if not isinstance(ppi, int) or ppi <= 0:
        fail("productionAssumptions.ppi must be a positive integer")
    expected_pixels = [round(physical[0] / 25.4 * ppi), round(physical[1] / 25.4 * ppi)]

    files = manifest.get("files")
    if not isinstance(files, list):
        fail("manifest files must be a list")
    by_role = {item.get("role"): item for item in files if isinstance(item, dict)}
    if set(by_role) != set(EXPECTED_ROLES):
        fail(f"manifest must contain exactly these roles: {sorted(EXPECTED_ROLES)}")

    report = []
    for role, (required_format, square) in EXPECTED_ROLES.items():
        item = by_role[role]
        path = Path(item.get("path", "")).expanduser().resolve()
        try:
            path.relative_to(folder)
        except ValueError:
            fail(f"{role} must be inside product folder")
        if not path.is_file() or sku not in path.name:
            fail(f"missing or mismatched SKU file for {role}")
        if item.get("sha256") != sha256(path):
            fail(f"checksum mismatch for {role}")
        with Image.open(path) as image:
            image.load()
            image_format = image.format
            pixels = list(image.size)
            dpi = image.info.get("dpi", (0, 0))
        if image_format != required_format:
            fail(f"{role} must be {required_format}")
        if item.get("pixels") != pixels:
            fail(f"manifest pixel size mismatch for {role}")
        if square:
            if pixels[0] != pixels[1] or pixels[0] < 1200:
                fail(f"{role} must be square and at least 1200 px")
        else:
            if pixels != expected_pixels:
                fail(f"{role} must be {expected_pixels[0]}x{expected_pixels[1]} px")
            if min(float(dpi[0]), float(dpi[1])) < ppi - 1:
                fail(f"{role} must carry at least {ppi} PPI metadata")
        report.append({"role": role, "file": path.name, "format": image_format, "pixels": pixels})

    sales_generation = manifest.get("salesGeneration")
    if not isinstance(sales_generation, dict):
        fail("manifest salesGeneration is required")
    if sales_generation.get("mode") != "imagegen-native" or sales_generation.get("postCompositeApplied") is not False:
        fail("sales image must be imagegen-native with no post-generation composite")
    native_record = sales_generation.get("nativeSource")
    if not isinstance(native_record, dict):
        fail("salesGeneration.nativeSource is required")
    native_path = Path(native_record.get("path", "")).expanduser().resolve()
    try:
        native_path.relative_to(folder / "work")
    except ValueError:
        fail("native sales source must be inside the product work folder")
    if not native_path.is_file() or sku not in native_path.name:
        fail("native sales source is missing or has a mismatched SKU")
    if native_record.get("sha256") != sha256(native_path):
        fail("native sales source checksum mismatch")
    sales_path = Path(by_role["sales image"]["path"]).resolve()
    with Image.open(native_path) as native_image, Image.open(sales_path) as sales_image:
        native_rgb = native_image.convert("RGB")
        sales_rgb = sales_image.convert("RGB")
        if native_rgb.size != sales_rgb.size or native_rgb.tobytes() != sales_rgb.tobytes():
            fail("sales image pixels differ from the imagegen-native source; post-generation editing is forbidden")
        if native_record.get("pixels") != list(native_rgb.size):
            fail("native sales source pixel size does not match manifest")

    spec = json.loads(spec_path.read_text(encoding="utf-8"))
    sales_spec = spec.get("sales")
    if not isinstance(sales_spec, dict) or not REQUIRED_SALES_SPEC_FIELDS.issubset(sales_spec):
        fail(f"design spec sales copy must contain: {sorted(REQUIRED_SALES_SPEC_FIELDS)}")
    forbidden_present = FORBIDDEN_SALES_SPEC_FIELDS.intersection(sales_spec)
    if forbidden_present:
        fail(f"design spec sales copy must omit: {sorted(forbidden_present)}")
    for key in REQUIRED_SALES_SPEC_FIELDS:
        value = sales_spec[key]
        if isinstance(value, str) and not value.strip():
            fail(f"design spec sales field {key} must not be blank")
        if isinstance(value, list) and (not value or not all(isinstance(item, str) and item.strip() for item in value)):
            fail(f"design spec sales field {key} must contain nonblank labels")

    front = Path(by_role["front print master"]["path"]).resolve()
    back = Path(by_role["back print master"]["path"]).resolve()
    if sha256(front) == sha256(back):
        fail("front and back print masters must not be byte-identical")

    approval = manifest.get("visualApproval", {})
    if set(approval) != VISUAL_FLAGS or not all(approval.get(flag) is True for flag in VISUAL_FLAGS):
        fail("all six visualApproval flags must exist and be true after visual inspection")

    print(json.dumps({
        "ok": True,
        "folder": str(folder),
        "sku": sku,
        "expectedMasterPixels": expected_pixels,
        "files": report,
        "salesGenerationValidated": "imagegen-native pixel identity",
        "salesSpecFieldsValidated": sorted(REQUIRED_SALES_SPEC_FIELDS),
        "visualInspectionRecorded": True,
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, json.JSONDecodeError) as error:
        fail(str(error))
