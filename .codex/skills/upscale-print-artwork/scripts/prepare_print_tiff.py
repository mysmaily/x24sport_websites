#!/usr/bin/env python3
"""Place artwork on a print-sized TIFF canvas without distortion."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

try:
    from PIL import Image, ImageCms, ImageOps
except ImportError as error:
    raise SystemExit(
        "prepare_print_tiff.py needs Pillow. Install it in the active Python environment, "
        "then rerun this command."
    ) from error


MM_PER_INCH = 25.4
TIFF_SUFFIXES = {".tif", ".tiff"}


def millimetres_to_pixels(value: float, ppi: int) -> int:
    return round(value / MM_PER_INCH * ppi)


def parser() -> argparse.ArgumentParser:
    command = argparse.ArgumentParser(
        description="Create a non-destructive print-sized, LZW-compressed TIFF."
    )
    command.add_argument("source", type=Path, help="Selected artwork image")
    command.add_argument("output", type=Path, help="New print TIFF path")
    command.add_argument("--width-mm", type=float, required=True)
    command.add_argument("--height-mm", type=float, required=True)
    command.add_argument("--ppi", type=int, default=300)
    command.add_argument(
        "--fit",
        choices=("contain", "cover"),
        default="contain",
        help="contain preserves all artwork; cover crops to fill the canvas",
    )
    command.add_argument(
        "--background",
        default=None,
        help="Optional opaque canvas colour, e.g. '#ffffff'. Default preserves alpha.",
    )
    command.add_argument("--overwrite", action="store_true")
    return command


def default_srgb_profile() -> bytes:
    return ImageCms.ImageCmsProfile(ImageCms.createProfile("sRGB")).tobytes()


def main() -> None:
    args = parser().parse_args()
    if not args.source.is_file():
        raise SystemExit(f"Source image does not exist: {args.source}")
    if args.output.suffix.lower() not in TIFF_SUFFIXES:
        raise SystemExit("Output must end in .tif or .tiff for TIFF delivery.")
    if args.output.exists() and not args.overwrite:
        raise SystemExit(f"Refusing to overwrite existing file: {args.output}")
    if args.width_mm <= 0 or args.height_mm <= 0 or args.ppi <= 0:
        raise SystemExit("Width, height, and PPI must be positive.")

    target_width = millimetres_to_pixels(args.width_mm, args.ppi)
    target_height = millimetres_to_pixels(args.height_mm, args.ppi)
    if max(target_width, target_height) > 30000 or target_width * target_height > 300_000_000:
        raise SystemExit("Requested canvas is too large for this helper; use the print vendor's workflow.")

    with Image.open(args.source) as opened:
        image = ImageOps.exif_transpose(opened)
        icc_profile = image.info.get("icc_profile") or default_srgb_profile()
        source_has_alpha = "A" in image.getbands() or "transparency" in image.info
        image = image.convert("RGBA" if source_has_alpha or args.background is None else "RGB")

    if args.fit == "contain":
        scale = min(target_width / image.width, target_height / image.height)
    else:
        scale = max(target_width / image.width, target_height / image.height)
    resized_size = (
        max(1, round(image.width * scale)),
        max(1, round(image.height * scale)),
    )
    resized = image.resize(resized_size, Image.Resampling.LANCZOS)

    if args.background is None:
        canvas = Image.new("RGBA", (target_width, target_height), (0, 0, 0, 0))
    else:
        canvas = Image.new("RGBA", (target_width, target_height), args.background)

    left = (target_width - resized.width) // 2
    top = (target_width - resized.height) // 2
    canvas.alpha_composite(resized.convert("RGBA"), (left, top))

    if args.background is not None:
        canvas = canvas.convert("RGB")
    args.output.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(
        args.output,
        format="TIFF",
        compression="tiff_lzw",
        dpi=(args.ppi, args.ppi),
        icc_profile=icc_profile,
    )

    print(
        json.dumps(
            {
                "output": str(args.output),
                "format": "TIFF",
                "compression": "LZW",
                "source_pixels": [image.width, image.height],
                "target_pixels": [target_width, target_height],
                "physical_mm": [args.width_mm, args.height_mm],
                "ppi": args.ppi,
                "fit": args.fit,
                "background": args.background or "transparent",
                "source_had_alpha": source_has_alpha,
            },
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError) as error:
        print(f"Error: {error}", file=sys.stderr)
        raise SystemExit(1) from error
