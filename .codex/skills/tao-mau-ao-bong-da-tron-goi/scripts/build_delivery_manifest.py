#!/usr/bin/env python3
"""Build the manifest for the four-image built-in imagegen delivery."""

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


SKU_RE = re.compile(r"^X24-BD-[0-9]{2}(?:[0-5][0-9])?(?:[01][0-9]|2[0-3])(?:0[1-9]|[12][0-9]|3[01])$")
MASTER_POLICY = "builtin-imagegen-original"
VISUAL_FLAGS = (
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
)


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


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("folder", type=Path)
    parser.add_argument("--sku", required=True)
    parser.add_argument("--product-slug", required=True)
    parser.add_argument(
        "--input-mode",
        choices=("original-design", "reference-conversion"),
        default="original-design",
    )
    parser.add_argument("--approve-visual", action="store_true")
    parser.add_argument("--overwrite", action="store_true")
    return parser.parse_args()


def validate_spec(spec_path: Path) -> tuple[dict[str, object], Path, int]:
    spec = json.loads(spec_path.read_text(encoding="utf-8"))
    print_spec = spec.get("print")
    if not isinstance(print_spec, dict):
        raise SystemExit("design-spec.json must contain print")
    expected = {
        "masterPolicy": MASTER_POLICY,
        "singleGenerationPerSide": True,
        "resamplingAllowed": False,
        "regenerationAllowed": False,
    }
    for key, value in expected.items():
        if print_spec.get(key) != value:
            raise SystemExit(f"design-spec.json print.{key} must be {value!r}")

    logo_source = spec.get("logoSource")
    if not isinstance(logo_source, dict):
        raise SystemExit("design-spec.json must contain logoSource")
    logo_path_value = logo_source.get("absolutePath")
    if not isinstance(logo_path_value, str) or not Path(logo_path_value).is_absolute():
        raise SystemExit("design-spec.json logoSource.absolutePath must be an absolute local path")
    logo_path = Path(logo_path_value).resolve()
    if not logo_path.is_file():
        raise SystemExit(f"logoSource.absolutePath does not exist: {logo_path}")

    team_photo = spec.get("teamPhoto")
    if not isinstance(team_photo, dict):
        raise SystemExit("design-spec.json must contain teamPhoto")
    player_count = team_photo.get("playerCount")
    if not isinstance(player_count, int) or not 5 <= player_count <= 11:
        raise SystemExit("design-spec.json teamPhoto.playerCount must be an integer from 5 to 11")
    return spec, logo_path, player_count


def file_record(role: str, path: Path, **extra: object) -> dict[str, object]:
    pixels, _ = image_info(path)
    return {
        "role": role,
        "path": str(path),
        "sha256": checksum(path),
        "pixels": pixels,
        **extra,
    }


def generation_record(path: Path) -> dict[str, object]:
    pixels, _ = image_info(path)
    return {
        "canonicalPath": str(path),
        "sha256": checksum(path),
        "pixels": pixels,
        "resampled": False,
    }


def main() -> None:
    args = parse_args()
    if not SKU_RE.fullmatch(args.sku):
        raise SystemExit("--sku must match X24-BD-FFMMHHDD or legacy X24-BD-FFHHDD")

    folder = args.folder.expanduser().resolve()
    spec_path = folder / "design-spec.json"
    output = folder / "delivery-manifest.json"
    if not folder.is_dir() or not spec_path.is_file():
        raise SystemExit("Product folder and design-spec.json are required")
    if output.exists() and not args.overwrite:
        raise SystemExit(f"Refusing to overwrite: {output}")

    front = folder / "print" / f"{args.sku}-front-print.png"
    back = folder / "print" / f"{args.sku}-back-print.png"
    sales = folder / "marketing" / f"{args.sku}-sales.png"
    team = folder / "marketing" / f"{args.sku}-team-photo.png"
    required = [front, back, sales, team]
    missing = [str(path) for path in required if not path.is_file()]
    if missing:
        raise SystemExit("Missing required files: " + ", ".join(missing))
    image_suffixes = {".png", ".jpg", ".jpeg", ".webp"}
    found_images = {
        path.resolve()
        for output_dir in (folder / "print", folder / "marketing")
        if output_dir.is_dir()
        for path in output_dir.iterdir()
        if path.is_file() and path.suffix.lower() in image_suffixes
    }
    if found_images != {path.resolve() for path in required}:
        extras = sorted(str(path) for path in found_images - {path.resolve() for path in required})
        raise SystemExit(
            "print/ and marketing/ must contain exactly the four required images"
            + (": " + ", ".join(extras) if extras else "")
        )

    for path in required:
        _, image_format = image_info(path)
        if image_format != "PNG":
            raise SystemExit(f"All four original imagegen outputs must be PNG: {path}")

    front_pixels, _ = image_info(front)
    back_pixels, _ = image_info(back)
    if front_pixels != back_pixels:
        raise SystemExit("Front and back print masters must have the same original pixel dimensions")
    aspect_ratio = front_pixels[0] / front_pixels[1]
    if not 0.60 <= aspect_ratio <= 0.75:
        raise SystemExit("Print masters must use a portrait canvas near the factory body ratio (0.60-0.75)")

    spec, logo_path, player_count = validate_spec(spec_path)
    if spec.get("sku") != args.sku:
        raise SystemExit("design-spec.json sku must match --sku")
    if spec.get("inputMode") != args.input_mode:
        raise SystemExit("design-spec.json inputMode must match --input-mode")
    approved = bool(args.approve_visual)
    references = [str(front), str(back), str(logo_path)]
    manifest = {
        "schemaVersion": "2.0",
        "sku": args.sku,
        "productSlug": args.product_slug,
        "inputMode": args.input_mode,
        "designSpec": str(spec_path),
        "productionAssumptions": {
            "masterPolicy": MASTER_POLICY,
            "actualPrintPixels": front_pixels,
            "actualPrintAspectRatio": round(aspect_ratio, 6),
            "singleGenerationPerSide": True,
            "resamplingAllowed": False,
            "regenerationAllowed": False,
            "colorSpace": "sRGB",
        },
        "logoReference": {
            "path": str(logo_path),
            "sha256": checksum(logo_path),
        },
        "files": [
            file_record(
                "front print master",
                front,
                originalImagegenOutput=True,
                resampled=False,
            ),
            file_record(
                "back print master",
                back,
                originalImagegenOutput=True,
                resampled=False,
            ),
            file_record("sales image", sales, originalImagegenOutput=True),
            file_record(
                "team photo",
                team,
                originalImagegenOutput=True,
                playerCount=player_count,
            ),
        ],
        "masterGeneration": {
            "mode": MASTER_POLICY,
            "singleGenerationPerSide": True,
            "postProcessingApplied": False,
            "front": generation_record(front),
            "back": generation_record(back),
        },
        "salesGeneration": {
            "mode": "builtin-imagegen-original",
            "postProcessingApplied": False,
            "referencedImagePaths": references,
        },
        "teamPhotoGeneration": {
            "mode": "builtin-imagegen-original",
            "postProcessingApplied": False,
            "referencedImagePaths": references + [str(sales)],
            "playerCount": player_count,
        },
        "visualApproval": {flag: approved for flag in VISUAL_FLAGS},
    }
    output.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(output)


if __name__ == "__main__":
    main()
