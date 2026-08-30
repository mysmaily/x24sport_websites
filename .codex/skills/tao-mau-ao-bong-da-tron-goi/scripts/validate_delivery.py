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
SCHEMA_VERSION = "1.2"
MASTER_POLICY = "native-large-single-source"
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
    if assumptions.get("masterPolicy") != MASTER_POLICY:
        fail(f"productionAssumptions.masterPolicy must be {MASTER_POLICY}")
    if assumptions.get("resamplingAllowed") is not False:
        fail("productionAssumptions.resamplingAllowed must be false")
    if assumptions.get("regenerationAfterMasterLock") is not False:
        fail("productionAssumptions.regenerationAfterMasterLock must be false")
    min_native_long_edge = assumptions.get("minNativeLongEdgePx")
    if not isinstance(min_native_long_edge, int) or min_native_long_edge <= 0:
        fail("productionAssumptions.minNativeLongEdgePx must be a positive integer")
    explicit_target_pixels = assumptions.get("targetPixels")
    if not (
        isinstance(explicit_target_pixels, list)
        and len(explicit_target_pixels) == 2
        and all(isinstance(v, int) and v > 0 for v in explicit_target_pixels)
    ):
        fail("productionAssumptions.targetPixels must contain two positive integers")
    expected_pixels = explicit_target_pixels
    if max(expected_pixels) < min_native_long_edge:
        fail("productionAssumptions.targetPixels is below minNativeLongEdgePx")

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
            if item.get("sourcePixels") != pixels:
                fail(f"{role} sourcePixels must equal canonical master pixels")
            if item.get("scaleFactor") != 1.0:
                fail(f"{role} scaleFactor must be exactly 1.0; enlargement is forbidden")
            if item.get("resampled") is not False:
                fail(f"{role} resampled must be false")
            if item.get("nativeLarge") is not True:
                fail(f"{role} nativeLarge must be true")
            if item.get("masterPolicy") != MASTER_POLICY:
                fail(f"{role} masterPolicy must be {MASTER_POLICY}")
        elif validation_kind == "team-photo":
            if max(pixels) < 1200:
                fail("team photo must have a long edge of at least 1200 px")
            player_count = item.get("playerCount")
            if not isinstance(player_count, int) or not 5 <= player_count <= 11:
                fail("team photo manifest record must contain playerCount from 5 to 11")
        else:
            fail(f"unknown validation kind for {role}")
        report.append({"role": role, "file": path.name, "format": image_format, "pixels": pixels})

    master_generation = manifest.get("masterGeneration")
    if not isinstance(master_generation, dict) or master_generation.get("mode") != "imagegen-native-large-single-source":
        fail("masterGeneration.mode must be imagegen-native-large-single-source")
    for side, role in (("front", "front print master"), ("back", "back print master")):
        record = master_generation.get(side)
        if not isinstance(record, dict):
            fail(f"masterGeneration.{side} is required")
        canonical_path = Path(record.get("canonicalPath", "")).expanduser().resolve()
        expected_path = Path(by_role[role]["path"]).expanduser().resolve()
        if canonical_path != expected_path:
            fail(f"masterGeneration.{side}.canonicalPath must be the print master path")
        if record.get("sha256") != sha256(expected_path):
            fail(f"masterGeneration.{side} checksum does not match the canonical master")
        if record.get("pixels") != expected_pixels:
            fail(f"masterGeneration.{side} pixels do not match targetPixels")
        if record.get("scaleFactor") != 1.0 or record.get("resampled") is not False:
            fail(f"masterGeneration.{side} must record scaleFactor=1.0 and resampled=false")

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
    print_spec = spec.get("print")
    if not isinstance(print_spec, dict):
        fail("design spec print contract is required")
    if print_spec.get("masterPolicy") != MASTER_POLICY:
        fail(f"design spec print.masterPolicy must be {MASTER_POLICY}")
    if print_spec.get("nativeTargetPixels") != expected_pixels:
        fail("design spec print.nativeTargetPixels must match manifest targetPixels")
    if print_spec.get("minNativeLongEdgePx") != min_native_long_edge:
        fail("design spec print.minNativeLongEdgePx must match manifest")
    if print_spec.get("resamplingAllowed") is not False:
        fail("design spec print.resamplingAllowed must be false")
    if print_spec.get("regenerationAfterMasterLock") is not False:
        fail("design spec print.regenerationAfterMasterLock must be false")
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
        "masterPolicyValidated": MASTER_POLICY,
        "masterScaleFactorValidated": 1.0,
        "masterResamplingValidated": False,
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
