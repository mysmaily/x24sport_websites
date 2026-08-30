#!/usr/bin/env python3
"""Build the delivery manifest from final X24-BD files and their exact bytes."""

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


def print_provenance(path: Path) -> dict[str, object]:
    with Image.open(path) as image:
        info = image.info
        engine = info.get("x24.upscaleEngine")
        if not isinstance(engine, str):
            return {}
        try:
            return {
                "upscaleEngine": engine,
                "upscaleModel": str(info.get("x24.upscaleModel", "none")),
                "superResolutionScale": int(info.get("x24.superResolutionScale", "1")),
                "postResizeScale": round(float(info.get("x24.postResizeScale", "1")), 4),
                "qualityGate": str(info.get("x24.qualityGate", "missing")),
            }
        except (TypeError, ValueError) as error:
            raise SystemExit(f"Invalid embedded print provenance in {path}: {error}") from error


def validate_design_spec(spec_path: Path) -> int:
    spec = json.loads(spec_path.read_text(encoding="utf-8"))
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


def target_pixels_from_aspect(aspect_ratio: float, long_edge_px: int) -> list[int]:
    if aspect_ratio >= 1:
        return [long_edge_px, round(long_edge_px / aspect_ratio)]
    return [round(long_edge_px * aspect_ratio), long_edge_px]


def file_record(role: str, path: Path, source_path: Path | None = None) -> dict[str, object]:
    pixels, _ = image_info(path)
    record: dict[str, object] = {
        "role": role,
        "path": str(path),
        "sha256": checksum(path),
        "pixels": pixels,
    }
    if source_path and source_path.is_file():
        source_pixels, _ = image_info(source_path)
        record["sourcePixels"] = source_pixels
        record["scaleFactor"] = round(max(pixels[0] / source_pixels[0], pixels[1] / source_pixels[1]), 4)
        record["resampled"] = pixels != source_pixels
        record.update(print_provenance(path))
    return record


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("folder", type=Path)
    parser.add_argument("--sku", required=True)
    parser.add_argument("--product-slug", required=True)
    parser.add_argument("--input-mode", choices=("original-design", "reference-conversion"), default="original-design")
    parser.add_argument("--sales-layout", choices=("compact", "catalog-reference"), default="compact")
    parser.add_argument("--width-mm", type=float, default=700)
    parser.add_argument("--height-mm", type=float, default=850)
    parser.add_argument(
        "--target-aspect-ratio",
        type=float,
        help="Record/validate master print pixels by ratio only instead of physical mm.",
    )
    parser.add_argument("--target-long-edge-px", type=int, default=10039)
    parser.add_argument("--ppi", type=int, default=300)
    parser.add_argument("--process", default="dye-sublimation on polyester")
    parser.add_argument("--color-space", default="sRGB")
    parser.add_argument("--approve-visual", action="store_true")
    parser.add_argument("--overwrite", action="store_true")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    if not SKU_RE.fullmatch(args.sku):
        raise SystemExit("--sku must match X24-BD-FFHHDD")
    folder = args.folder.expanduser().resolve()
    spec = folder / "design-spec.json"
    output = folder / "delivery-manifest.json"
    if not folder.is_dir() or not spec.is_file():
        raise SystemExit("Product folder and design-spec.json are required")
    if output.exists() and not args.overwrite:
        raise SystemExit(f"Refusing to overwrite: {output}")
    if args.target_aspect_ratio is not None:
        if args.target_aspect_ratio <= 0:
            raise SystemExit("--target-aspect-ratio must be positive")
        if args.target_long_edge_px <= 0:
            raise SystemExit("--target-long-edge-px must be positive")
        target_pixels = target_pixels_from_aspect(args.target_aspect_ratio, args.target_long_edge_px)
        target_mode = "aspect-ratio"
        physical_mm: list[float] | None = None
    else:
        if args.width_mm <= 0 or args.height_mm <= 0 or args.ppi <= 0:
            raise SystemExit("Physical size and PPI must be positive")
        target_pixels = [round(args.width_mm / 25.4 * args.ppi), round(args.height_mm / 25.4 * args.ppi)]
        target_mode = "physical-mm"
        physical_mm = [args.width_mm, args.height_mm]

    front_source = folder / "work" / f"{args.sku}-front-source.png"
    back_source = folder / "work" / f"{args.sku}-back-source.png"
    native_sales_source = folder / "work" / f"{args.sku}-sales-native-source.png"
    native_mockup_source = folder / "work" / f"{args.sku}-mockup-native-source.png"
    native_team_photo_source = folder / "work" / f"{args.sku}-team-photo-native-source.png"
    player_count = validate_design_spec(spec)
    files = [
        ("front print master", folder / "print" / f"{args.sku}-front-print.png", front_source),
        ("back print master", folder / "print" / f"{args.sku}-back-print.png", back_source),
        ("mockup base", folder / "marketing" / f"{args.sku}-mockup-base.webp", None),
        ("sales image", folder / "marketing" / f"{args.sku}-sales.webp", None),
        ("team photo", folder / "marketing" / f"{args.sku}-team-photo.webp", None),
    ]
    required_support = [
        front_source,
        back_source,
        native_mockup_source,
        native_sales_source,
        native_team_photo_source,
    ]
    missing = [str(path) for path in required_support if not path.is_file()]
    missing.extend(str(path) for _, path, _ in files if not path.is_file())
    if missing:
        raise SystemExit("Missing required files: " + ", ".join(missing))

    approved = bool(args.approve_visual)
    manifest = {
        "schemaVersion": "1.1",
        "sku": args.sku,
        "productSlug": args.product_slug,
        "inputMode": args.input_mode,
        "salesLayout": args.sales_layout,
        "designSpec": str(spec),
        "productionAssumptions": {
            "process": args.process,
            "colorSpace": args.color_space,
            "targetMode": target_mode,
            "targetAspectRatio": round(target_pixels[0] / target_pixels[1], 6),
            "targetPixels": target_pixels,
            "physicalMm": physical_mm,
            "ppi": args.ppi,
            "factoryPatternIncluded": False,
            "vectorIncluded": False,
        },
        "files": [
            {
                **file_record(role, path, source),
                **({"playerCount": player_count} if role == "team photo" else {}),
            }
            for role, path, source in files
        ],
        "mockupGeneration": {
            "mode": "imagegen-native",
            "postCompositeApplied": False,
            "nativeSource": {
                "path": str(native_mockup_source),
                "sha256": checksum(native_mockup_source),
                "pixels": image_info(native_mockup_source)[0],
            },
        },
        "salesGeneration": {
            "mode": "imagegen-native",
            "postCompositeApplied": False,
            "nativeSource": {
                "path": str(native_sales_source),
                "sha256": checksum(native_sales_source),
                "pixels": image_info(native_sales_source)[0],
            },
        },
        "teamPhotoGeneration": {
            "mode": "imagegen-native",
            "postCompositeApplied": False,
            "nativeSource": {
                "path": str(native_team_photo_source),
                "sha256": checksum(native_team_photo_source),
                "pixels": image_info(native_team_photo_source)[0],
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
