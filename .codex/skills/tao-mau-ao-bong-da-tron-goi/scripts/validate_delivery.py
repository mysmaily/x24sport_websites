#!/usr/bin/env python3
"""Validate the exact four-image built-in imagegen delivery."""

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


SKU_RE = re.compile(r"^X24-BD-[0-9]{2}(?:[0-5][0-9])?(?:[01][0-9]|2[0-3])(?:0[1-9]|[12][0-9]|3[01])$")
SCHEMA_VERSION = "2.0"
MASTER_POLICY = "builtin-imagegen-original"
EXPECTED_ROLES = {
    "front print master",
    "back print master",
    "sales image",
    "team photo",
}
VISUAL_FLAGS = {
    "frontFlatArtworkOnly",
    "backFlatArtworkOnly",
    "frontBackCoherent",
    "marketingMatchesMasters",
    "teamPhotoMatchesMasters",
    "marketingLogoMatchesReference",
    "teamLogoMatchesReference",
    "salesContactExact",
    "teamContactExact",
    "teamPlayerCountExact",
    "noUnexpectedBranding",
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


def image_info(path: Path) -> tuple[list[int], str]:
    with Image.open(path) as image:
        image.load()
        return list(image.size), str(image.format)


def require_inside(path: Path, folder: Path, label: str) -> None:
    try:
        path.relative_to(folder)
    except ValueError:
        fail(f"{label} must be inside the product folder")


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
        fail("manifest sku must match X24-BD-FFMMHHDD or legacy X24-BD-FFHHDD")

    assumptions = manifest.get("productionAssumptions")
    if not isinstance(assumptions, dict):
        fail("productionAssumptions is required")
    expected_assumptions = {
        "masterPolicy": MASTER_POLICY,
        "singleGenerationPerSide": True,
        "resamplingAllowed": False,
        "regenerationAllowed": False,
    }
    for key, value in expected_assumptions.items():
        if assumptions.get(key) != value:
            fail(f"productionAssumptions.{key} must be {value!r}")

    files = manifest.get("files")
    if not isinstance(files, list) or len(files) != 4:
        fail("manifest must contain exactly four image files")
    by_role = {item.get("role"): item for item in files if isinstance(item, dict)}
    if set(by_role) != EXPECTED_ROLES:
        fail(f"manifest must contain exactly these roles: {sorted(EXPECTED_ROLES)}")

    report: list[dict[str, object]] = []
    resolved_paths: dict[str, Path] = {}
    for role in sorted(EXPECTED_ROLES):
        item = by_role[role]
        path = Path(str(item.get("path", ""))).expanduser().resolve()
        require_inside(path, folder, role)
        if not path.is_file() or sku not in path.name:
            fail(f"missing or mismatched SKU file for {role}")
        if item.get("sha256") != sha256(path):
            fail(f"checksum mismatch for {role}")
        pixels, image_format = image_info(path)
        if image_format != "PNG":
            fail(f"{role} must be the original PNG output")
        if item.get("pixels") != pixels:
            fail(f"manifest pixel size mismatch for {role}")
        if item.get("originalImagegenOutput") is not True:
            fail(f"{role} must be marked as the original imagegen output")
        resolved_paths[role] = path
        report.append({"role": role, "file": path.name, "pixels": pixels})

    if len(set(resolved_paths.values())) != 4:
        fail("the four image roles must point to four distinct files")
    image_suffixes = {".png", ".jpg", ".jpeg", ".webp"}
    found_images = {
        path.resolve()
        for output_dir in (folder / "print", folder / "marketing")
        if output_dir.is_dir()
        for path in output_dir.iterdir()
        if path.is_file() and path.suffix.lower() in image_suffixes
    }
    if found_images != set(resolved_paths.values()):
        fail("print/ and marketing/ must contain exactly the four manifest images")

    front = resolved_paths["front print master"]
    back = resolved_paths["back print master"]
    front_pixels, _ = image_info(front)
    back_pixels, _ = image_info(back)
    if front_pixels != back_pixels:
        fail("front and back print masters must have the same original dimensions")
    aspect_ratio = front_pixels[0] / front_pixels[1]
    if not 0.60 <= aspect_ratio <= 0.75:
        fail("print masters must use a portrait canvas with aspect ratio 0.60-0.75")
    if assumptions.get("actualPrintPixels") != front_pixels:
        fail("productionAssumptions.actualPrintPixels must match the print files")
    if assumptions.get("actualPrintAspectRatio") != round(aspect_ratio, 6):
        fail("productionAssumptions.actualPrintAspectRatio must match the print files")
    if by_role["front print master"].get("resampled") is not False:
        fail("front print master resampled must be false")
    if by_role["back print master"].get("resampled") is not False:
        fail("back print master resampled must be false")
    if sha256(front) == sha256(back):
        fail("front and back print masters must not be byte-identical")

    spec = json.loads(spec_path.read_text(encoding="utf-8"))
    if spec.get("sku") != sku:
        fail("design spec sku must match the manifest")
    if spec.get("inputMode") != manifest.get("inputMode"):
        fail("design spec inputMode must match the manifest")
    print_spec = spec.get("print")
    if not isinstance(print_spec, dict):
        fail("design spec print is required")
    for key, value in expected_assumptions.items():
        if print_spec.get(key) != value:
            fail(f"design spec print.{key} must be {value!r}")

    logo_source = spec.get("logoSource")
    if not isinstance(logo_source, dict):
        fail("design spec logoSource is required")
    logo_path_value = logo_source.get("absolutePath")
    if not isinstance(logo_path_value, str) or not Path(logo_path_value).is_absolute():
        fail("design spec logoSource.absolutePath must be an absolute local path")
    logo_path = Path(logo_path_value).resolve()
    if not logo_path.is_file():
        fail("design spec logoSource.absolutePath does not exist")
    logo_reference = manifest.get("logoReference")
    if not isinstance(logo_reference, dict):
        fail("manifest logoReference is required")
    if Path(str(logo_reference.get("path", ""))).resolve() != logo_path:
        fail("manifest logoReference path must match design spec")
    if logo_reference.get("sha256") != sha256(logo_path):
        fail("manifest logoReference checksum mismatch")

    master_generation = manifest.get("masterGeneration")
    if not isinstance(master_generation, dict):
        fail("masterGeneration is required")
    if (
        master_generation.get("mode") != MASTER_POLICY
        or master_generation.get("singleGenerationPerSide") is not True
        or master_generation.get("postProcessingApplied") is not False
    ):
        fail("masterGeneration must record one built-in imagegen generation per side with no post-processing")
    for side, role in (("front", "front print master"), ("back", "back print master")):
        record = master_generation.get(side)
        path = resolved_paths[role]
        if not isinstance(record, dict):
            fail(f"masterGeneration.{side} is required")
        if Path(str(record.get("canonicalPath", ""))).resolve() != path:
            fail(f"masterGeneration.{side}.canonicalPath must be the print file")
        if record.get("sha256") != sha256(path) or record.get("pixels") != image_info(path)[0]:
            fail(f"masterGeneration.{side} does not match the print file")
        if record.get("resampled") is not False:
            fail(f"masterGeneration.{side}.resampled must be false")

    expected_references = [str(front), str(back), str(logo_path)]
    expected_generation_references = {
        "salesGeneration": expected_references,
        "teamPhotoGeneration": expected_references + [str(resolved_paths["sales image"])],
    }
    for name, expected_paths in expected_generation_references.items():
        generation = manifest.get(name)
        if not isinstance(generation, dict):
            fail(f"{name} is required")
        if (
            generation.get("mode") != "builtin-imagegen-original"
            or generation.get("postProcessingApplied") is not False
        ):
            fail(f"{name} must use the original built-in imagegen output")
        references = generation.get("referencedImagePaths")
        if references != expected_paths:
            fail(f"{name} referencedImagePaths do not match the locked image order")

    team_photo = spec.get("teamPhoto")
    player_count = team_photo.get("playerCount") if isinstance(team_photo, dict) else None
    if not isinstance(player_count, int) or not 5 <= player_count <= 11:
        fail("design spec teamPhoto.playerCount must be an integer from 5 to 11")
    if by_role["team photo"].get("playerCount") != player_count:
        fail("team photo playerCount must match the design spec")
    if manifest["teamPhotoGeneration"].get("playerCount") != player_count:
        fail("teamPhotoGeneration.playerCount must match the design spec")

    approval = manifest.get("visualApproval")
    if not isinstance(approval, dict) or set(approval) != VISUAL_FLAGS:
        fail(f"visualApproval must contain exactly {len(VISUAL_FLAGS)} required flags")
    if not all(approval.get(flag) is True for flag in VISUAL_FLAGS):
        fail("all visualApproval flags must be true after full-size inspection")

    print(json.dumps({
        "ok": True,
        "folder": str(folder),
        "sku": sku,
        "imageCount": 4,
        "actualPrintPixels": front_pixels,
        "pixelFloorApplied": False,
        "masterPolicyValidated": MASTER_POLICY,
        "singleGenerationPerSideValidated": True,
        "resamplingValidated": False,
        "logoReferenceValidated": str(logo_path),
        "files": report,
        "visualInspectionRecorded": True,
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, json.JSONDecodeError) as error:
        fail(str(error))
