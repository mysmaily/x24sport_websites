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


SKU_RE = re.compile(r"^X24-BD-[0-9]{6}$")
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
REQUIRED_COPY_FIELDS = {
    "collection", "title", "skuLabel", "price", "offer", "modelNumber", "frontNumber",
    "playerName", "playerNumber", "teamName", "collarHeading",
    "collarLabels", "sizes", "materialLine", "cta", "website", "hotline",
}


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
        fail("manifest sku must match X24-BD-NNNNNN")
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

    validated_copy_fields: list[str] = []
    if manifest.get("salesLayout") == "catalog-reference":
        sales_path = Path(by_role["sales image"]["path"]).resolve()
        proof_record = manifest.get("salesCopyProof")
        if not isinstance(proof_record, dict):
            fail("manifest salesCopyProof is required for catalog-reference")
        proof_path = Path(proof_record.get("path", "")).expanduser().resolve()
        try:
            proof_path.relative_to(folder)
        except ValueError:
            fail("salesCopyProof must be inside product folder")
        if not proof_path.is_file() or proof_record.get("sha256") != sha256(proof_path):
            fail("salesCopyProof is missing or its checksum does not match")
        proof = json.loads(proof_path.read_text(encoding="utf-8"))
        if proof.get("sku") != sku or Path(proof.get("salesImage", "")).resolve() != sales_path:
            fail("salesCopyProof must point to the current SKU sales image")
        if proof.get("salesImageSha256") != sha256(sales_path):
            fail("sales image changed after deterministic copy was rendered")
        rendered = proof.get("renderedText")
        if not isinstance(rendered, dict) or set(rendered) != REQUIRED_COPY_FIELDS:
            fail(f"sales copy proof must contain exactly: {sorted(REQUIRED_COPY_FIELDS)}")
        for key, value in rendered.items():
            if isinstance(value, str) and not value.strip():
                fail(f"sales copy field {key} must not be blank")
            if isinstance(value, list) and (not value or not all(isinstance(item, str) and item.strip() for item in value)):
                fail(f"sales copy field {key} must contain nonblank labels")
        if rendered["skuLabel"] != f"MÃ MẪU: {sku}":
            fail("sales copy SKU label does not match manifest SKU")
        if rendered["collarHeading"] != "TÙY CHỌN CỔ ÁO":
            fail("sales copy collar heading is missing or incorrect")
        if rendered["collarLabels"] != ["Cổ tròn", "Cổ V", "Cổ polo"]:
            fail("sales copy must include all three collar labels")
        validated_copy_fields = sorted(REQUIRED_COPY_FIELDS)

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
        "salesCopyFieldsValidated": validated_copy_fields,
        "visualInspectionRecorded": True,
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, json.JSONDecodeError) as error:
        fail(str(error))
