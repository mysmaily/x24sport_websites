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

    front_source = folder / "work" / f"{args.sku}-front-source.png"
    back_source = folder / "work" / f"{args.sku}-back-source.png"
    native_sales_source = folder / "work" / f"{args.sku}-sales-native-source.png"
    files = [
        ("front print master", folder / "print" / f"{args.sku}-front-print.png", front_source),
        ("back print master", folder / "print" / f"{args.sku}-back-print.png", back_source),
        ("mockup base", folder / "marketing" / f"{args.sku}-mockup-base.webp", None),
        ("sales image", folder / "marketing" / f"{args.sku}-sales.webp", None),
    ]
    required_support = [front_source, back_source, native_sales_source]
    missing = [str(path) for path in required_support if not path.is_file()]
    missing.extend(str(path) for _, path, _ in files if not path.is_file())
    if missing:
        raise SystemExit("Missing required files: " + ", ".join(missing))

    approved = bool(args.approve_visual)
    manifest = {
        "schemaVersion": "1.0",
        "sku": args.sku,
        "productSlug": args.product_slug,
        "inputMode": args.input_mode,
        "salesLayout": args.sales_layout,
        "designSpec": str(spec),
        "productionAssumptions": {
            "process": args.process,
            "colorSpace": args.color_space,
            "physicalMm": [args.width_mm, args.height_mm],
            "ppi": args.ppi,
            "factoryPatternIncluded": False,
            "vectorIncluded": False,
        },
        "files": [file_record(role, path, source) for role, path, source in files],
        "salesGeneration": {
            "mode": "imagegen-native",
            "postCompositeApplied": False,
            "nativeSource": {
                "path": str(native_sales_source),
                "sha256": checksum(native_sales_source),
                "pixels": image_info(native_sales_source)[0],
            },
        },
        "visualApproval": {
            "frontFlatArtworkOnly": approved,
            "backFlatArtworkOnly": approved,
            "frontBackCoherent": approved,
            "mockupMatchesFront": approved,
            "mockupMatchesBack": approved,
            "commercialTextExact": approved,
        },
    }
    output.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(output)


if __name__ == "__main__":
    main()
