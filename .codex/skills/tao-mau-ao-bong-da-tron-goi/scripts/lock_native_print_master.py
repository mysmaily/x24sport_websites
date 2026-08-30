#!/usr/bin/env python3
"""Lock one native-large generated PNG as a byte-identical canonical print master."""

from __future__ import annotations

import argparse
import hashlib
import json
import shutil
from pathlib import Path

try:
    from PIL import Image
except ImportError as error:
    raise SystemExit("Pillow is required") from error


def checksum(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path, help="Approved native-generation PNG")
    parser.add_argument("output", type=Path, help="Canonical print/<SKU>-*-print.png path")
    parser.add_argument("--width-px", type=int, required=True)
    parser.add_argument("--height-px", type=int, required=True)
    parser.add_argument("--target-aspect-ratio", type=float, default=0.67)
    parser.add_argument("--aspect-tolerance", type=float, default=0.015)
    parser.add_argument("--min-long-edge-px", type=int, default=1536)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    source = args.source.expanduser().resolve()
    output = args.output.expanduser().resolve()
    if not source.is_file():
        raise SystemExit(f"Native source does not exist: {source}")
    if args.width_px <= 0 or args.height_px <= 0 or args.min_long_edge_px <= 0:
        raise SystemExit("Pixel dimensions must be positive")
    if args.target_aspect_ratio <= 0 or args.aspect_tolerance < 0:
        raise SystemExit("Aspect ratio must be positive and tolerance cannot be negative")

    with Image.open(source) as image:
        image.load()
        image_format = image.format
        pixels = list(image.size)
        mode = image.mode
    expected_pixels = [args.width_px, args.height_px]
    if image_format != "PNG":
        raise SystemExit("Native print master must already be PNG; transcoding is forbidden")
    if mode not in {"RGB", "RGBA"}:
        raise SystemExit(f"Native print master must be RGB or RGBA, got {mode}")
    if pixels != expected_pixels:
        raise SystemExit(
            "Native dimensions mismatch: "
            f"got {pixels[0]}x{pixels[1]}, expected {args.width_px}x{args.height_px}. "
            "Do not resize or upscale; generate the master again at the locked native canvas."
        )
    if max(pixels) < args.min_long_edge_px:
        raise SystemExit(
            f"Native long edge {max(pixels)} is below the locked minimum {args.min_long_edge_px}; "
            "generate a larger native master."
        )
    aspect_ratio = pixels[0] / pixels[1]
    relative_drift = abs(aspect_ratio - args.target_aspect_ratio) / args.target_aspect_ratio
    if relative_drift > args.aspect_tolerance:
        raise SystemExit(
            f"Native aspect ratio {aspect_ratio:.6f} drifts {relative_drift:.2%} from "
            f"target {args.target_aspect_ratio:.6f}; generate again at the locked ratio."
        )

    source_hash = checksum(source)
    if output.exists():
        output_hash = checksum(output)
        if output_hash != source_hash:
            raise SystemExit(
                f"Canonical master is immutable and already has different bytes: {output}. "
                "Do not replace it after master lock."
            )
        status = "already-locked"
    else:
        output.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, output)
        output_hash = checksum(output)
        if output_hash != source_hash:
            raise SystemExit(f"Checksum mismatch after byte copy: {output}")
        status = "locked"

    print(json.dumps({
        "ok": True,
        "status": status,
        "masterPolicy": "native-large-single-source",
        "source": str(source),
        "canonicalMaster": str(output),
        "pixels": pixels,
        "aspectRatio": round(aspect_ratio, 6),
        "scaleFactor": 1.0,
        "resampled": False,
        "sha256": source_hash,
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
