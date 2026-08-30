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
SCHEMA_VERSION = "1.1"
COLLAR_LABELS = ["Cổ tròn", "Cổ Tim", "Cổ polo"]
WEBSITE = "mayaobongda.vn"
HOTLINE = "0989 353 247"
EXPECTED_ROLES = {
    "front print master": ("PNG", "master"),
    "back print master": ("PNG", "master"),
    "mockup base": ("WEBP", "square"),
    "sales image": ("WEBP", "square"),
    "team photo": ("WEBP", "team-photo"),
}
VISUAL_FLAGS = {
    "frontFlatArtworkOnly", "backFlatArtworkOnly", "frontBackCoherent",
    "mockupMatchesFront", "mockupMatchesBack", "commercialTextExact",
    "collarOptionsExact", "mockupContactExact", "teamPhotoMatchesKit",
    "teamPhotoContactExact",
}
REQUIRED_SALES_SPEC_FIELDS = {
    "collection", "offer", "modelNumber", "frontNumber",
    "playerName", "playerNumber", "teamName", "materialLine",
    "website", "hotline", "sizes", "collarHeading", "collarLabels",
    "selectedCollar",
}
FORBIDDEN_SALES_SPEC_FIELDS = {"price", "cta"}
SAFE_LANCZOS_SCALE = 2.0
MAX_TOTAL_UPSCALE = 8.0


def fail(message: str) -> None:
    print(f"ERROR: {message}", file=sys.stderr)
    raise SystemExit(1)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def validate_native_pixel_identity(
    *,
    folder: Path,
    sku: str,
    generation: object,
    generation_name: str,
    native_folder: Path,
    native_suffix: str,
    web_path: Path,
) -> dict[str, object]:
    if not isinstance(generation, dict):
        fail(f"manifest {generation_name} is required")
    if generation.get("mode") != "imagegen-native" or generation.get("postCompositeApplied") is not False:
        fail(f"{generation_name} must be imagegen-native with no post-generation composite")
    native_record = generation.get("nativeSource")
    if not isinstance(native_record, dict):
        fail(f"{generation_name}.nativeSource is required")
    native_path = Path(native_record.get("path", "")).expanduser().resolve()
    try:
        native_path.relative_to(native_folder)
    except ValueError:
        fail(f"{generation_name} native source must be inside {native_folder.relative_to(folder)}")
    if not native_path.is_file() or sku not in native_path.name or not native_path.name.endswith(native_suffix):
        fail(f"{generation_name} native source is missing or has a mismatched SKU/name")
    if native_record.get("sha256") != sha256(native_path):
        fail(f"{generation_name} native source checksum mismatch")
    with Image.open(native_path) as native_image, Image.open(web_path) as web_image:
        native_rgb = native_image.convert("RGB")
        web_rgb = web_image.convert("RGB")
        if native_rgb.size != web_rgb.size or native_rgb.tobytes() != web_rgb.tobytes():
            fail(f"{generation_name} WebP pixels differ from the imagegen-native source; post-generation editing is forbidden")
        if native_record.get("pixels") != list(native_rgb.size):
            fail(f"{generation_name} native source pixel size does not match manifest")
    return native_record


def main() -> None:
    if len(sys.argv) != 2:
        fail("usage: validate_delivery.py /absolute/path/to/product-folder")
    folder = Path(sys.argv[1]).expanduser().resolve()
    manifest_path = folder / "delivery-manifest.json"
    spec_path = folder / "design-spec.json"
    if not folder.is_dir() or not manifest_path.is_file() or not spec_path.is_file():
        fail("product folder, design-spec.json, and delivery-manifest.json are required")

    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    if manifest.get("schemaVersion") != SCHEMA_VERSION:
        fail(f"manifest schemaVersion must be {SCHEMA_VERSION}")
    sku = manifest.get("sku")
    if not isinstance(sku, str) or not SKU_RE.fullmatch(sku):
        fail("manifest sku must match X24-BD-FFHHDD")
    assumptions = manifest.get("productionAssumptions", {})
    physical = assumptions.get("physicalMm")
    ppi = assumptions.get("ppi")
    if not isinstance(ppi, int) or ppi <= 0:
        fail("productionAssumptions.ppi must be a positive integer")
    explicit_target_pixels = assumptions.get("targetPixels")
    if explicit_target_pixels is not None:
        if not (
            isinstance(explicit_target_pixels, list)
            and len(explicit_target_pixels) == 2
            and all(isinstance(v, int) and v > 0 for v in explicit_target_pixels)
        ):
            fail("productionAssumptions.targetPixels must contain two positive integers")
        expected_pixels = explicit_target_pixels
    else:
        if not (
            isinstance(physical, list)
            and len(physical) == 2
            and all(isinstance(v, (int, float)) and v > 0 for v in physical)
        ):
            fail("productionAssumptions.physicalMm must contain two positive numbers")
        expected_pixels = [round(physical[0] / 25.4 * ppi), round(physical[1] / 25.4 * ppi)]

    files = manifest.get("files")
    if not isinstance(files, list):
        fail("manifest files must be a list")
    by_role = {item.get("role"): item for item in files if isinstance(item, dict)}
    if set(by_role) != set(EXPECTED_ROLES):
        fail(f"manifest must contain exactly these roles: {sorted(EXPECTED_ROLES)}")

    report = []
    for role, (required_format, validation_kind) in EXPECTED_ROLES.items():
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
        if validation_kind == "square":
            if pixels[0] != pixels[1] or pixels[0] < 1200:
                fail(f"{role} must be square and at least 1200 px")
        elif validation_kind == "master":
            if pixels != expected_pixels:
                fail(f"{role} must be {expected_pixels[0]}x{expected_pixels[1]} px")
            if min(float(dpi[0]), float(dpi[1])) < ppi - 1:
                fail(f"{role} must carry at least {ppi} PPI metadata")
            scale_factor = item.get("scaleFactor")
            if not isinstance(scale_factor, (int, float)) or scale_factor <= 0:
                fail(f"{role} must record a positive scaleFactor")
            side = "front" if role.startswith("front") else "back"
            source_path = folder / "work" / f"{sku}-{side}-source.png"
            if not source_path.is_file():
                fail(f"{role} source master is missing: {source_path}")
            with Image.open(source_path) as source_image:
                source_pixels = list(source_image.size)
            expected_scale_factor = max(pixels[0] / source_pixels[0], pixels[1] / source_pixels[1])
            if item.get("sourcePixels") != source_pixels:
                fail(f"{role} sourcePixels do not match the source master")
            if abs(float(scale_factor) - expected_scale_factor) > 0.001:
                fail(f"{role} scaleFactor does not match source and target pixels")
            if expected_scale_factor > MAX_TOTAL_UPSCALE:
                fail(f"{role} exceeds the {MAX_TOTAL_UPSCALE:.0f}x print-quality limit")
            with Image.open(path) as master_image:
                embedded_engine = master_image.info.get("x24.upscaleEngine")
                embedded_model = master_image.info.get("x24.upscaleModel")
                embedded_quality_gate = master_image.info.get("x24.qualityGate")
                try:
                    embedded_sr_scale = int(master_image.info.get("x24.superResolutionScale", "0"))
                    embedded_scale_factor = float(master_image.info.get("x24.scaleFactor", "0"))
                    embedded_post_resize = float(master_image.info.get("x24.postResizeScale", "0"))
                except (TypeError, ValueError):
                    fail(f"{role} has invalid embedded super-resolution provenance")
            if embedded_engine not in {"lanczos", "realesrgan"}:
                fail(f"{role} is missing embedded print-quality provenance")
            if item.get("upscaleEngine") != embedded_engine:
                fail(f"{role} upscale engine does not match embedded provenance")
            if item.get("qualityGate") != embedded_quality_gate:
                fail(f"{role} quality gate does not match embedded provenance")
            if abs(embedded_scale_factor - expected_scale_factor) > 0.001:
                fail(f"{role} embedded scale factor does not match source and target pixels")
            item_post_resize = item.get("postResizeScale")
            if not isinstance(item_post_resize, (int, float)) or abs(float(item_post_resize) - embedded_post_resize) > 0.001:
                fail(f"{role} post-resize scale does not match embedded provenance")
            if scale_factor > SAFE_LANCZOS_SCALE:
                if item.get("upscaleEngine") != "realesrgan" or embedded_engine != "realesrgan":
                    fail(f"{role} above 2x must use Real-ESRGAN; Lanczos-only enlargement is review-only")
                if item.get("upscaleModel") != embedded_model or not isinstance(embedded_model, str):
                    fail(f"{role} upscale model does not match embedded provenance")
                if item.get("superResolutionScale") != 4 or embedded_sr_scale != 4:
                    fail(f"{role} above 2x must record 4x super-resolution restoration")
                if item.get("qualityGate") != "pass-super-resolution" or embedded_quality_gate != "pass-super-resolution":
                    fail(f"{role} did not pass the super-resolution quality gate")
        elif validation_kind == "team-photo":
            if max(pixels) < 1200:
                fail("team photo must have a long edge of at least 1200 px")
            player_count = item.get("playerCount")
            if not isinstance(player_count, int) or not 5 <= player_count <= 11:
                fail("team photo manifest record must contain playerCount from 5 to 11")
        else:
            fail(f"unknown validation kind for {role}")
        report.append({"role": role, "file": path.name, "format": image_format, "pixels": pixels})

    mockup_path = Path(by_role["mockup base"]["path"]).resolve()
    validate_native_pixel_identity(
        folder=folder,
        sku=sku,
        generation=manifest.get("mockupGeneration"),
        generation_name="mockupGeneration",
        native_folder=folder / "work",
        native_suffix="-mockup-native-source.png",
        web_path=mockup_path,
    )
    sales_path = Path(by_role["sales image"]["path"]).resolve()
    validate_native_pixel_identity(
        folder=folder,
        sku=sku,
        generation=manifest.get("salesGeneration"),
        generation_name="salesGeneration",
        native_folder=folder / "work",
        native_suffix="-sales-native-source.png",
        web_path=sales_path,
    )
    team_photo_path = Path(by_role["team photo"]["path"]).resolve()
    team_photo_native = validate_native_pixel_identity(
        folder=folder,
        sku=sku,
        generation=manifest.get("teamPhotoGeneration"),
        generation_name="teamPhotoGeneration",
        native_folder=folder / "work",
        native_suffix="-team-photo-native-source.png",
        web_path=team_photo_path,
    )

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
    if sales_spec["website"] != WEBSITE or sales_spec["hotline"] != HOTLINE:
        fail(f"all gallery images must use website {WEBSITE} and hotline {HOTLINE}")
    if sales_spec["collarLabels"] != COLLAR_LABELS:
        fail(f"sales.collarLabels must be exactly {COLLAR_LABELS}")
    if sales_spec["selectedCollar"] not in COLLAR_LABELS:
        fail(f"sales.selectedCollar must be one of {COLLAR_LABELS}")
    garment_spec = spec.get("garment")
    if not isinstance(garment_spec, dict) or garment_spec.get("collar") != sales_spec["selectedCollar"]:
        fail("design spec garment.collar must equal sales.selectedCollar")
    expected_contact = {"website": WEBSITE, "hotline": HOTLINE}
    if spec.get("galleryContact") != expected_contact:
        fail(f"design spec galleryContact must be exactly {expected_contact}")
    hard_constraints = spec.get("salesHardConstraints")
    if not isinstance(hard_constraints, dict):
        fail("design spec salesHardConstraints is required")
    if (
        hard_constraints.get("collarLabels") != COLLAR_LABELS
        or hard_constraints.get("collarCount") != 3
        or hard_constraints.get("additionalCollarVariantsAllowed") is not False
        or hard_constraints.get("galleryContact") != expected_contact
        or hard_constraints.get("galleryContactRequiredOn") != ["sales", "mockup", "teamPhoto"]
    ):
        fail("design spec salesHardConstraints does not match the locked collar/contact contract")
    team_photo_spec = spec.get("teamPhoto")
    if not isinstance(team_photo_spec, dict):
        fail("design spec teamPhoto is required")
    player_count = team_photo_spec.get("playerCount")
    if not isinstance(player_count, int) or not 5 <= player_count <= 11:
        fail("design spec teamPhoto.playerCount must be an integer from 5 to 11")
    if by_role["team photo"].get("playerCount") != player_count:
        fail("team photo manifest playerCount must match design spec")
    team_generation = manifest.get("teamPhotoGeneration")
    if not isinstance(team_generation, dict) or team_generation.get("playerCount") != player_count:
        fail("teamPhotoGeneration.playerCount must match design spec")
    if team_photo_native.get("pixels") != by_role["team photo"].get("pixels"):
        fail("team photo native source pixels must match the team photo WebP manifest pixels")

    front = Path(by_role["front print master"]["path"]).resolve()
    back = Path(by_role["back print master"]["path"]).resolve()
    if sha256(front) == sha256(back):
        fail("front and back print masters must not be byte-identical")

    approval = manifest.get("visualApproval", {})
    if set(approval) != VISUAL_FLAGS or not all(approval.get(flag) is True for flag in VISUAL_FLAGS):
        fail(f"all {len(VISUAL_FLAGS)} visualApproval flags must exist and be true after visual inspection")

    print(json.dumps({
        "ok": True,
        "folder": str(folder),
        "sku": sku,
        "expectedMasterPixels": expected_pixels,
        "files": report,
        "mockupGenerationValidated": "imagegen-native pixel identity",
        "salesGenerationValidated": "imagegen-native pixel identity",
        "teamPhotoGenerationValidated": "imagegen-native pixel identity",
        "salesSpecFieldsValidated": sorted(REQUIRED_SALES_SPEC_FIELDS),
        "collarLabelsValidated": COLLAR_LABELS,
        "galleryContactValidated": expected_contact,
        "visualInspectionRecorded": True,
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, json.JSONDecodeError) as error:
        fail(str(error))
