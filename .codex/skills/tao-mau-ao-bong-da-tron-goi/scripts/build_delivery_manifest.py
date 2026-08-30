#!/usr/bin/env python3
"""Build a delivery manifest for immutable native-large football print masters."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path

try:
    from PIL import Image
except ImportError as error:
    raise SystemExit("Pillow is required") from error


SKU_RE = re.compile(r"^X24-BD-[0-9]{2}(?:[01][0-9]|2[0-3])(?:0[1-9]|[12][0-9]|3[01])$")
COLLAR_LABELS = ["Cổ tròn", "Cổ Tim", "Cổ polo"]
GALLERY_CONTACT = {"website": "mayaobongda.vn", "hotline": "0989 353 247"}
MASTER_POLICY = "native-large-single-source"


def checksum(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def image_info(path: Path) -> tuple[list[int], str]:
    with Image.open(path) as image:
        image.load()
        return list(image.size), str(image.format)


def validate_design_spec(spec_path: Path, target_pixels: list[int], min_long_edge: int) -> int:
    spec = json.loads(spec_path.read_text(encoding="utf-8"))
    print_spec = spec.get("print")
    if not isinstance(print_spec, dict):
        raise SystemExit("design-spec.json must contain print")
    if print_spec.get("masterPolicy") != MASTER_POLICY:
        raise SystemExit(f"design-spec.json print.masterPolicy must be {MASTER_POLICY}")
    if print_spec.get("nativeTargetPixels") != target_pixels:
        raise SystemExit("design-spec.json print.nativeTargetPixels must equal the locked target pixels")
    if print_spec.get("minNativeLongEdgePx") != min_long_edge:
        raise SystemExit("design-spec.json print.minNativeLongEdgePx must equal the manifest minimum")
    if print_spec.get("resamplingAllowed") is not False:
        raise SystemExit("design-spec.json print.resamplingAllowed must be false")
    if print_spec.get("regenerationAfterMasterLock") is not False:
        raise SystemExit("design-spec.json print.regenerationAfterMasterLock must be false")

    sales = spec.get("sales")
    if not isinstance(sales, dict):
        raise SystemExit("design-spec.json must contain sales")
    if sales.get("collarLabels") != COLLAR_LABELS:
        raise SystemExit(f"design-spec.json sales.collarLabels must be exactly {COLLAR_LABELS}")
    if sales.get("selectedCollar") not in COLLAR_LABELS:
        raise SystemExit(f"design-spec.json sales.selectedCollar must be one of {COLLAR_LABELS}")
    garment = spec.get("garment")
    if not isinstance(garment, dict) or garment.get("collar") != sales.get("selectedCollar"):
        raise SystemExit("design-spec.json garment.collar must equal sales.selectedCollar")
    if sales.get("website") != GALLERY_CONTACT["website"] or sales.get("hotline") != GALLERY_CONTACT["hotline"]:
        raise SystemExit("design-spec.json sales website/hotline do not match the gallery contact lock")
    if spec.get("galleryContact") != GALLERY_CONTACT:
        raise SystemExit(f"design-spec.json galleryContact must be exactly {GALLERY_CONTACT}")
    hard_constraints = spec.get("salesHardConstraints")
    if not isinstance(hard_constraints, dict) or (
        hard_constraints.get("collarLabels") != COLLAR_LABELS
        or hard_constraints.get("collarCount") != 3
        or hard_constraints.get("additionalCollarVariantsAllowed") is not False
        or hard_constraints.get("galleryContact") != GALLERY_CONTACT
        or hard_constraints.get("galleryContactRequiredOn") != ["sales", "mockup", "teamPhoto"]
    ):
        raise SystemExit("design-spec.json salesHardConstraints does not match the locked collar/contact contract")
    team_photo = spec.get("teamPhoto")
    if not isinstance(team_photo, dict):
        raise SystemExit("design-spec.json must contain teamPhoto")
    player_count = team_photo.get("playerCount")
    if not isinstance(player_count, int) or not 5 <= player_count <= 11:
        raise SystemExit("design-spec.json teamPhoto.playerCount must be an integer from 5 to 11")
    return player_count


def file_record(role: str, path: Path, *, native_master: bool = False) -> dict[str, object]:
    pixels, _ = image_info(path)
    record: dict[str, object] = {
        "role": role,
        "path": str(path),
        "sha256": checksum(path),
        "pixels": pixels,
    }
    if native_master:
        record.update({
            "sourcePixels": pixels,
            "scaleFactor": 1.0,
            "resampled": False,
            "nativeLarge": True,
            "masterPolicy": MASTER_POLICY,
        })
    return record


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("folder", type=Path)
    parser.add_argument("--sku", required=True)
    parser.add_argument("--product-slug", required=True)
    parser.add_argument("--input-mode", choices=("original-design", "reference-conversion"), default="original-design")
    parser.add_argument("--sales-layout", choices=("compact", "catalog-reference"), default="compact")
    parser.add_argument("--target-width-px", type=int, default=1024)
    parser.add_argument("--target-height-px", type=int, default=1536)
    parser.add_argument("--target-aspect-ratio", type=float, default=0.67)
    parser.add_argument("--min-native-long-edge-px", type=int, default=1536)
    parser.add_argument("--process", default="dye-sublimation on polyester")
    parser.add_argument("--color-space", default="sRGB")
    parser.add_argument("--approve-visual", action="store_true")
    parser.add_argument("--overwrite", action="store_true")
    return parser.parse_args()


def native_generation_record(path: Path) -> dict[str, object]:
    return {
        "canonicalPath": str(path),
        "sha256": checksum(path),
        "pixels": image_info(path)[0],
        "scaleFactor": 1.0,
        "resampled": False,
    }


def main() -> None:
    args = parse_args()
    if not SKU_RE.fullmatch(args.sku):
        raise SystemExit("--sku must match X24-BD-FFHHDD")
    target_pixels = [args.target_width_px, args.target_height_px]
    if any(value <= 0 for value in target_pixels) or args.min_native_long_edge_px <= 0:
        raise SystemExit("Target pixels and minimum native long edge must be positive")
    actual_aspect = args.target_width_px / args.target_height_px
    if abs(actual_aspect - args.target_aspect_ratio) / args.target_aspect_ratio > 0.015:
        raise SystemExit("Target pixels drift more than 1.5% from --target-aspect-ratio")
    if max(target_pixels) < args.min_native_long_edge_px:
        raise SystemExit("Target long edge is below --min-native-long-edge-px")

    folder = args.folder.expanduser().resolve()
    spec = folder / "design-spec.json"
    output = folder / "delivery-manifest.json"
    if not folder.is_dir() or not spec.is_file():
        raise SystemExit("Product folder and design-spec.json are required")
    if output.exists() and not args.overwrite:
        raise SystemExit(f"Refusing to overwrite: {output}")

    front = folder / "print" / f"{args.sku}-front-print.png"
    back = folder / "print" / f"{args.sku}-back-print.png"
    native_mockup = folder / "work" / f"{args.sku}-mockup-native-source.png"
    native_sales = folder / "work" / f"{args.sku}-sales-native-source.png"
    native_team = folder / "work" / f"{args.sku}-team-photo-native-source.png"
    mockup = folder / "marketing" / f"{args.sku}-mockup-base.webp"
    sales = folder / "marketing" / f"{args.sku}-sales.webp"
    team = folder / "marketing" / f"{args.sku}-team-photo.webp"
    required = [front, back, native_mockup, native_sales, native_team, mockup, sales, team]
    missing = [str(path) for path in required if not path.is_file()]
    if missing:
        raise SystemExit("Missing required files: " + ", ".join(missing))

    for role, path in (("front", front), ("back", back)):
        pixels, image_format = image_info(path)
        if image_format != "PNG" or pixels != target_pixels:
            raise SystemExit(
                f"{role} master must already be native PNG {target_pixels[0]}x{target_pixels[1]}; "
                "do not resize it in the manifest step"
            )

    player_count = validate_design_spec(spec, target_pixels, args.min_native_long_edge_px)
    approved = bool(args.approve_visual)
    manifest = {
        "schemaVersion": "1.2",
        "sku": args.sku,
        "productSlug": args.product_slug,
        "inputMode": args.input_mode,
        "salesLayout": args.sales_layout,
        "designSpec": str(spec),
        "productionAssumptions": {
            "process": args.process,
            "colorSpace": args.color_space,
            "masterPolicy": MASTER_POLICY,
            "targetAspectRatio": round(actual_aspect, 6),
            "targetPixels": target_pixels,
            "minNativeLongEdgePx": args.min_native_long_edge_px,
            "resamplingAllowed": False,
            "regenerationAfterMasterLock": False,
            "factoryPatternIncluded": False,
            "vectorIncluded": False,
        },
        "files": [
            file_record("front print master", front, native_master=True),
            file_record("back print master", back, native_master=True),
            file_record("mockup base", mockup),
            file_record("sales image", sales),
            {**file_record("team photo", team), "playerCount": player_count},
        ],
        "masterGeneration": {
            "mode": "imagegen-native-large-single-source",
            "front": native_generation_record(front),
            "back": native_generation_record(back),
        },
        "mockupGeneration": {
            "mode": "imagegen-native",
            "postCompositeApplied": False,
            "nativeSource": {
                "path": str(native_mockup), "sha256": checksum(native_mockup), "pixels": image_info(native_mockup)[0]
            },
        },
        "salesGeneration": {
            "mode": "imagegen-native",
            "postCompositeApplied": False,
            "nativeSource": {
                "path": str(native_sales), "sha256": checksum(native_sales), "pixels": image_info(native_sales)[0]
            },
        },
        "teamPhotoGeneration": {
            "mode": "imagegen-native",
            "postCompositeApplied": False,
            "nativeSource": {
                "path": str(native_team), "sha256": checksum(native_team), "pixels": image_info(native_team)[0]
            },
            "playerCount": player_count,
        },
        "visualApproval": {
            "frontFlatArtworkOnly": approved,
            "backFlatArtworkOnly": approved,
            "frontBackCoherent": approved,
            "mockupMatchesFront": approved,
            "mockupMatchesBack": approved,
            "commercialTextExact": approved,
            "collarOptionsExact": approved,
            "mockupContactExact": approved,
            "teamPhotoMatchesKit": approved,
            "teamPhotoContactExact": approved,
        },
    }
    output.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(output)


if __name__ == "__main__":
    main()
