#!/usr/bin/env python3
"""Prepare a full-bleed, print-sized PNG master without stretching the source."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

try:
    from PIL import Image, ImageColor, ImageOps
except ImportError as error:
    raise SystemExit("Pillow is required") from error


MM_PER_INCH = 25.4


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--width-mm", type=float, default=700)
    parser.add_argument("--height-mm", type=float, default=850)
    parser.add_argument(
        "--target-aspect-ratio",
        type=float,
        help="Prepare by width/height ratio only. Overrides --width-mm/--height-mm for pixel sizing.",
    )
    parser.add_argument(
        "--target-long-edge-px",
        type=int,
        default=10039,
        help="Long edge in pixels when --target-aspect-ratio is used.",
    )
    parser.add_argument("--ppi", type=int, default=300)
    parser.add_argument("--fit", choices=("cover", "contain"), default="cover")
    parser.add_argument("--background", default="#ffffff", help="Used only with contain")
    parser.add_argument(
        "--max-source-aspect-drift",
        type=float,
        help="Reject source aspect ratios that differ from the target by more than this relative fraction.",
    )
    parser.add_argument("--overwrite", action="store_true")
    return parser.parse_args()


def target_pixels(args: argparse.Namespace) -> tuple[tuple[int, int], str]:
    if args.target_aspect_ratio is not None:
        if args.target_aspect_ratio <= 0:
            raise SystemExit("--target-aspect-ratio must be positive")
        if args.target_long_edge_px <= 0:
            raise SystemExit("--target-long-edge-px must be positive")
        if args.target_aspect_ratio >= 1:
            return (
                (
                    args.target_long_edge_px,
                    round(args.target_long_edge_px / args.target_aspect_ratio),
                ),
                "aspect-ratio",
            )
        return (
            (
                round(args.target_long_edge_px * args.target_aspect_ratio),
                args.target_long_edge_px,
            ),
            "aspect-ratio",
        )
    if args.width_mm <= 0 or args.height_mm <= 0:
        raise SystemExit("Physical size must be positive")
    return (
        (
            round(args.width_mm / MM_PER_INCH * args.ppi),
            round(args.height_mm / MM_PER_INCH * args.ppi),
        ),
        "physical-mm",
    )


def main() -> None:
    args = parse_args()
    source = args.source.expanduser().resolve()
    output = args.output.expanduser().resolve()
    if not source.is_file():
        raise SystemExit(f"Source not found: {source}")
    if output.suffix.lower() != ".png":
        raise SystemExit("Output must be .png")
    if output.exists() and not args.overwrite:
        raise SystemExit(f"Refusing to overwrite: {output}")
    if args.ppi <= 0:
        raise SystemExit("PPI must be positive")

    target, target_mode = target_pixels(args)
    if target[0] * target[1] > 180_000_000:
        raise SystemExit("Requested canvas exceeds the 180 MP safety limit")

    with Image.open(source) as opened:
        opened.load()
        source_image = ImageOps.exif_transpose(opened)
        icc = source_image.info.get("icc_profile")
        source_image = source_image.convert("RGB")
    source_pixels = source_image.size
    source_aspect = source_image.width / source_image.height
    target_aspect = target[0] / target[1]
    aspect_drift = abs(source_aspect - target_aspect) / target_aspect
    if args.max_source_aspect_drift is not None:
        if args.max_source_aspect_drift < 0:
            raise SystemExit("--max-source-aspect-drift must be non-negative")
        if aspect_drift > args.max_source_aspect_drift:
            raise SystemExit(
                "Source aspect ratio drift exceeds limit: "
                f"source={source_aspect:.4f}, target={target_aspect:.4f}, "
                f"drift={aspect_drift:.4f}, limit={args.max_source_aspect_drift:.4f}. "
                "Regenerate or crop-review the source master instead of stretching."
            )

    if args.fit == "cover":
        scale = max(target[0] / source_image.width, target[1] / source_image.height)
    else:
        scale = min(target[0] / source_image.width, target[1] / source_image.height)
    resized_size = (round(source_image.width * scale), round(source_image.height * scale))
    resized = source_image.resize(resized_size, Image.Resampling.LANCZOS)

    if args.fit == "cover":
        left = max(0, (resized.width - target[0]) // 2)
        top = max(0, (resized.height - target[1]) // 2)
        canvas = resized.crop((left, top, left + target[0], top + target[1]))
    else:
        ImageColor.getrgb(args.background)
        canvas = Image.new("RGB", target, args.background)
        canvas.paste(resized, ((target[0] - resized.width) // 2, (target[1] - resized.height) // 2))

    output.parent.mkdir(parents=True, exist_ok=True)
    options: dict[str, object] = {"format": "PNG", "dpi": (args.ppi, args.ppi), "compress_level": 6}
    if icc:
        options["icc_profile"] = icc
    canvas.save(output, **options)
    print(json.dumps({
        "output": str(output),
        "sourcePixels": list(source_pixels),
        "targetPixels": list(target),
        "sourceAspectRatio": round(source_aspect, 6),
        "targetAspectRatio": round(target_aspect, 6),
        "sourceAspectDrift": round(aspect_drift, 6),
        "targetMode": target_mode,
        "physicalMm": None if target_mode == "aspect-ratio" else [args.width_mm, args.height_mm],
        "ppi": args.ppi,
        "fit": args.fit,
        "scaleFactor": round(scale, 4),
        "resampled": abs(scale - 1.0) > 0.01,
        "fidelityWarning": scale > 2.0,
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError) as error:
        print(f"Error: {error}", file=sys.stderr)
        raise SystemExit(1) from error
