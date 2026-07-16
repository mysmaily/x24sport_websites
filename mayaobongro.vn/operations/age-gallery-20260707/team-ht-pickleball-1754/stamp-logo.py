#!/usr/bin/env python3
from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image
from PIL import ImageDraw, ImageFont


CONTACT_TEXT = "mayaobongro.vn | Hotline/Zalo: 0989.353.247"


def trim_logo(logo: Image.Image) -> Image.Image:
    rgba = logo.convert("RGBA")
    pixels = rgba.load()
    width, height = rgba.size

    min_x, min_y = width, height
    max_x, max_y = 0, 0
    for y in range(height):
        for x in range(width):
            red, green, blue, alpha = pixels[x, y]
            is_white_bg = red > 244 and green > 244 and blue > 244
            if is_white_bg:
                pixels[x, y] = (red, green, blue, 0)
                continue
            if alpha > 0:
                min_x = min(min_x, x)
                min_y = min(min_y, y)
                max_x = max(max_x, x)
                max_y = max(max_y, y)

    if min_x > max_x or min_y > max_y:
        return rgba

    pad = 12
    box = (
        max(0, min_x - pad),
        max(0, min_y - pad),
        min(width, max_x + pad + 1),
        min(height, max_y + pad + 1),
    )
    return rgba.crop(box)


def stamp(source_path: Path, logo_path: Path, output_path: Path) -> None:
    base = Image.open(source_path).convert("RGBA")
    logo = trim_logo(Image.open(logo_path))

    target_width = round(base.width * 0.20)
    target_height = round(logo.height * (target_width / logo.width))
    logo = logo.resize((target_width, target_height), Image.Resampling.LANCZOS)

    alpha = logo.getchannel("A")
    alpha = alpha.point(lambda value: int(value * 0.88))
    logo.putalpha(alpha)

    margin = round(base.width * 0.035)
    position = (margin, margin)
    base.alpha_composite(logo, position)

    font_size = round(base.width * 0.028)
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", font_size)
    except OSError:
        try:
            font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", font_size)
        except OSError:
            font = ImageFont.load_default()

    draw = ImageDraw.Draw(base, "RGBA")
    bbox = draw.textbbox((0, 0), CONTACT_TEXT, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    pad_x = round(base.width * 0.024)
    pad_y = round(base.height * 0.010)
    pill_width = text_width + pad_x * 2
    pill_height = text_height + pad_y * 2
    pill_x = round((base.width - pill_width) / 2)
    pill_y = base.height - pill_height - round(base.height * 0.026)
    radius = round(pill_height * 0.28)
    pill_box = (pill_x, pill_y, pill_x + pill_width, pill_y + pill_height)

    draw.rounded_rectangle(
        pill_box,
        radius=radius,
        fill=(42, 45, 49, 145),
        outline=(245, 245, 245, 210),
        width=max(2, round(base.width * 0.002)),
    )
    text_x = pill_x + pad_x
    text_y = pill_y + round((pill_height - text_height) / 2) - 2
    draw.text((text_x + 2, text_y + 2), CONTACT_TEXT, font=font, fill=(0, 0, 0, 150))
    draw.text((text_x, text_y), CONTACT_TEXT, font=font, fill=(255, 255, 255, 245))

    output_path.parent.mkdir(parents=True, exist_ok=True)
    base.convert("RGB").save(output_path, "WEBP", quality=88, method=6)


def main() -> None:
    parser = argparse.ArgumentParser(description="Stamp mayaobongro.vn logo on product imagery.")
    parser.add_argument("--logo", required=True, type=Path)
    parser.add_argument("--source", required=True, action="append", type=Path)
    parser.add_argument("--out-dir", required=True, type=Path)
    args = parser.parse_args()

    for source in args.source:
        output = args.out_dir / f"{source.stem}-branded-contact.webp"
        stamp(source, args.logo, output)
        print(output)


if __name__ == "__main__":
    main()
