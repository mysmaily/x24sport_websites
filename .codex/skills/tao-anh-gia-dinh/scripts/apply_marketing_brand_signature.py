#!/usr/bin/env python3
"""Apply the locked Mayaodongphuc editorial signature to an approved shirt photo."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


SKU_RE = re.compile(r"^X24-DP-[0-9]{6}$")
POSITIONS = {"top-left", "top-right", "bottom-left", "bottom-right"}
SKILL_DIR = Path(__file__).resolve().parent.parent
DEFAULT_LOGO = SKILL_DIR.parent / "tao-anh-dong-phuc-tre-em" / "assets" / "mayaodongphuc-logo.png"

REGULAR_FONT_CANDIDATES = (
    Path("/System/Library/Fonts/Supplemental/Arial.ttf"),
    Path("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"),
)
BOLD_FONT_CANDIDATES = (
    Path("/System/Library/Fonts/Supplemental/Arial Bold.ttf"),
    Path("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"),
)


def fail(message: str) -> None:
    raise SystemExit(f"ERROR: {message}")


def resolve_font(explicit: Path | None, candidates: tuple[Path, ...], label: str) -> Path:
    if explicit:
        if not explicit.is_file():
            fail(f"{label} font not found: {explicit}")
        return explicit
    for candidate in candidates:
        if candidate.is_file():
            return candidate
    fail(f"no {label} font found; provide --font-{label}")


def text_size(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.FreeTypeFont) -> tuple[int, int]:
    left, top, right, bottom = draw.textbbox((0, 0), text, font=font)
    return right - left, bottom - top


def rounded_mask(size: tuple[int, int], radius: int, fill: int) -> Image.Image:
    mask = Image.new("L", size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, size[0] - 1, size[1] - 1), radius=radius, fill=fill)
    return mask


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, type=Path, help="approved unbranded shirt photo")
    parser.add_argument("--output", required=True, type=Path, help="final SKU-marketing.webp")
    parser.add_argument("--sku", required=True)
    parser.add_argument("--position", choices=sorted(POSITIONS), default="bottom-right")
    parser.add_argument("--logo", type=Path, default=DEFAULT_LOGO)
    parser.add_argument("--font-regular", type=Path)
    parser.add_argument("--font-bold", type=Path)
    args = parser.parse_args()

    if not SKU_RE.fullmatch(args.sku):
        fail("--sku must match X24-DP-NNNNNN")
    if not args.input.is_file():
        fail(f"input not found: {args.input}")
    if not args.logo.is_file():
        fail(f"logo not found: {args.logo}")
    if args.input.resolve() == args.output.resolve():
        fail("input and output must differ; always composite from an unbranded source")
    expected_name = f"{args.sku}-marketing.webp"
    if args.output.name != expected_name:
        fail(f"output filename must be {expected_name}")

    regular_path = resolve_font(args.font_regular, REGULAR_FONT_CANDIDATES, "regular")
    bold_path = resolve_font(args.font_bold, BOLD_FONT_CANDIDATES, "bold")

    base = Image.open(args.input).convert("RGBA")
    width, height = base.size
    if width != height or width < 1200:
        fail("input must be a square image at least 1200px")
    scale = width / 1254.0

    meta_font = ImageFont.truetype(str(regular_path), max(12, round(13 * scale)))
    phone_font = ImageFont.truetype(str(bold_path), max(15, round(17 * scale)))
    site_font = ImageFont.truetype(str(regular_path), max(11, round(12 * scale)))
    meta = f"MÃ MẪU: {args.sku}"
    phone = "0982 254 458"
    site = "mayaodongphuc.com.vn"

    measure = ImageDraw.Draw(Image.new("RGBA", (1, 1)))
    text_width = max(
        text_size(measure, meta, meta_font)[0],
        text_size(measure, phone, phone_font)[0],
        text_size(measure, site, site_font)[0],
    )
    line_heights = (
        text_size(measure, meta, meta_font)[1],
        text_size(measure, phone, phone_font)[1],
        text_size(measure, site, site_font)[1],
    )

    pad_x = round(12 * scale)
    pad_y = round(9 * scale)
    logo_height = round(50 * scale)
    logo_gap = round(12 * scale)
    divider_gap = round(10 * scale)
    divider_width = max(1, round(scale))
    text_gap = round(4 * scale)
    text_height = sum(line_heights) + text_gap * 2
    panel_height = max(logo_height + pad_y * 2, text_height + pad_y * 2)
    logo_width_slot = round(50 * scale)
    panel_width = pad_x * 2 + logo_width_slot + logo_gap + divider_width + divider_gap + text_width

    if panel_width > round(width * 0.32) or panel_height > round(height * 0.08):
        fail("signature exceeds locked 32% width or 8% height; use a compatible font")
    area_fraction = (panel_width * panel_height) / (width * height)
    if area_fraction > 0.025:
        fail("signature exceeds locked 2.5% canvas area")

    margin = round(28 * scale)
    if args.position.endswith("left"):
        x = margin
    else:
        x = width - margin - panel_width
    if args.position.startswith("top"):
        y = margin
    else:
        y = height - margin - panel_height

    shadow_layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    shadow = rounded_mask((panel_width, panel_height), round(12 * scale), 255)
    shadow = shadow.filter(ImageFilter.GaussianBlur(max(2, round(6 * scale))))
    shadow_layer.paste((14, 35, 63, 22), (x, y + max(1, round(3 * scale))), shadow)
    base = Image.alpha_composite(base, shadow_layer)

    panel = Image.new("RGBA", (panel_width, panel_height), (0, 0, 0, 0))
    panel_mask = rounded_mask(panel.size, round(12 * scale), 255)
    panel.paste((255, 255, 255, 224), (0, 0), panel_mask)
    draw = ImageDraw.Draw(panel)

    logo = Image.open(args.logo).convert("RGBA")
    bbox = logo.getbbox()
    if bbox:
        logo = logo.crop(bbox)
    ratio = min(logo_width_slot / logo.width, logo_height / logo.height)
    logo = logo.resize((max(1, round(logo.width * ratio)), max(1, round(logo.height * ratio))), Image.Resampling.LANCZOS)
    logo_x = pad_x + (logo_width_slot - logo.width) // 2
    logo_y = (panel_height - logo.height) // 2
    panel.alpha_composite(logo, (logo_x, logo_y))

    divider_x = pad_x + logo_width_slot + logo_gap
    divider_top = round(13 * scale)
    draw.line(
        (divider_x, divider_top, divider_x, panel_height - divider_top),
        fill=(214, 221, 230, 210),
        width=divider_width,
    )

    text_x = divider_x + divider_width + divider_gap
    text_y = (panel_height - text_height) // 2
    draw.text((text_x, text_y), meta, font=meta_font, fill=(71, 84, 103, 255))
    text_y += line_heights[0] + text_gap
    draw.text((text_x, text_y), phone, font=phone_font, fill=(15, 43, 83, 255))
    text_y += line_heights[1] + text_gap
    draw.text((text_x, text_y), site, font=site_font, fill=(102, 112, 133, 255))

    base.alpha_composite(panel, (x, y))
    args.output.parent.mkdir(parents=True, exist_ok=True)
    base.convert("RGB").save(args.output, "WEBP", quality=100, method=6)
    print(json.dumps({
        "ok": True,
        "output": str(args.output.resolve()),
        "sku": args.sku,
        "position": args.position,
        "canvas": [width, height],
        "signature": [panel_width, panel_height],
        "areaFraction": round(area_fraction, 4),
        "style": "quiet-editorial-no-outline",
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
