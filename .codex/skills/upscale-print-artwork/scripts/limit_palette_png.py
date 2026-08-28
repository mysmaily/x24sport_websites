#!/usr/bin/env python3
"""Map a PNG artwork to an explicit flat palette without dithering."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError as error:
    raise SystemExit(
        "limit_palette_png.py needs Pillow. Install it in the active Python environment, "
        "then rerun this command."
    ) from error


def parse_hex(value: str) -> tuple[int, int, int]:
    text = value.strip().removeprefix("#")
    if len(text) != 6:
        raise argparse.ArgumentTypeError("palette colours must be six-digit hex values")
    try:
        rgb = tuple(int(text[index : index + 2], 16) for index in (0, 2, 4))
    except ValueError as error:
        raise argparse.ArgumentTypeError(f"invalid palette colour: {value}") from error
    return rgb  # type: ignore[return-value]


def parser() -> argparse.ArgumentParser:
    command = argparse.ArgumentParser(
        description="Map a PNG artwork to an explicit flat palette without dithering."
    )
    command.add_argument("source", type=Path, help="Input artwork PNG")
    command.add_argument("output", type=Path, help="Output artwork PNG")
    command.add_argument(
        "--palette",
        action="append",
        type=parse_hex,
        required=True,
        help="Flat RGB palette colour as #RRGGBB; repeat for each allowed colour",
    )
    command.add_argument("--ppi", type=int, default=300)
    command.add_argument("--overwrite", action="store_true")
    return command


def main() -> None:
    args = parser().parse_args()
    if not args.source.is_file():
        raise SystemExit(f"Source image does not exist: {args.source}")
    if args.output.suffix.lower() != ".png":
        raise SystemExit("Output must end in .png for a lossless print delivery.")
    if args.output.exists() and not args.overwrite:
        raise SystemExit(f"Refusing to overwrite existing file: {args.output}")
    if not 2 <= len(args.palette) <= 16:
        raise SystemExit("Provide between 2 and 16 palette colours.")
    if args.ppi <= 0:
        raise SystemExit("PPI must be positive.")

    with Image.open(args.source) as opened:
        image = opened.convert("RGBA")

    # Pillow's fixed-palette quantizer may select an unused palette slot for
    # transparent RGB data. Fill unused slots with the first valid colour and
    # remap any such index so no extra visible colour reaches the delivery.
    palette = Image.new("P", (1, 1))
    flat_palette = [channel for colour in args.palette for channel in colour]
    flat_palette += list(args.palette[0]) * (256 - len(args.palette))
    palette.putpalette(flat_palette)
    indexed = image.convert("RGB").quantize(
        palette=palette,
        dither=Image.Dither.NONE,
    )
    remap = list(range(len(args.palette))) + [0] * (256 - len(args.palette))
    indexed = indexed.point(remap)
    rgb = indexed.convert("RGB")
    result = Image.merge("RGBA", (*rgb.split(), image.getchannel("A")))

    args.output.parent.mkdir(parents=True, exist_ok=True)
    result.save(
        args.output,
        format="PNG",
        dpi=(args.ppi, args.ppi),
        compress_level=6,
    )
    print(
        json.dumps(
            {
                "output": str(args.output),
                "size": [result.width, result.height],
                "palette": ["#%02X%02X%02X" % colour for colour in args.palette],
                "ppi": args.ppi,
                "alpha_preserved": True,
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
