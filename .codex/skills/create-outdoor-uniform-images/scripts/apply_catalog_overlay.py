#!/usr/bin/env python3
"""Add a compact logo, feature cards, and understated hotline to a catalog photo."""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ORANGE = (242, 126, 36, 255)
NAVY = (8, 35, 62, 255)
CORNERS = ("top-left", "top-right", "bottom-left", "bottom-right")


def font_candidates(bold: bool) -> list[Path]:
    names = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf",
    ]
    return [Path(name) for name in names]


def load_font(size: int, bold: bool, preferred: Path | None) -> ImageFont.FreeTypeFont:
    candidates = ([preferred] if preferred else []) + font_candidates(bold)
    for candidate in candidates:
        if candidate and candidate.exists():
            return ImageFont.truetype(str(candidate), size=size)
    raise SystemExit("No Unicode TrueType font found; pass --font and --font-bold")


def fit_font(
    draw: ImageDraw.ImageDraw,
    text: str,
    max_width: int,
    initial_size: int,
    bold: bool,
    preferred: Path | None,
) -> ImageFont.FreeTypeFont:
    size = initial_size
    while size > 10:
        font = load_font(size, bold, preferred)
        if draw.textlength(text, font=font) <= max_width:
            return font
        size -= 1
    return load_font(10, bold, preferred)


def scaled(asset: Image.Image, target_width: int) -> Image.Image:
    target_height = round(asset.height * target_width / asset.width)
    return asset.resize((target_width, target_height), Image.Resampling.LANCZOS)


def draw_icon(draw: ImageDraw.ImageDraw, kind: str, box: tuple[int, int, int, int], width: int) -> None:
    x0, y0, x1, y1 = box
    cx, cy = (x0 + x1) // 2, (y0 + y1) // 2
    pad = max(2, (x1 - x0) // 7)

    if kind == "fabric":
        for offset in (-1, 0, 1):
            y = cy + offset * max(4, (y1 - y0) // 5)
            draw.line([(x0 + pad, y), (cx - pad, y - pad), (cx + pad, y + pad), (x1 - pad, y)], fill=ORANGE, width=width, joint="curve")
    elif kind == "design":
        draw.line((x0 + pad, y1 - pad, x1 - pad, y0 + pad), fill=ORANGE, width=width)
        draw.line((x0 + pad, y1 - pad, x0 + pad * 3, y1 - pad), fill=ORANGE, width=width)
        draw.line((x1 - pad * 3, y0 + pad, x1 - pad, y0 + pad * 3), fill=ORANGE, width=width)
    elif kind == "durability":
        points = [(cx, y0 + pad), (x1 - pad, y0 + pad * 2), (x1 - pad * 2, y1 - pad), (cx, y1), (x0 + pad * 2, y1 - pad), (x0 + pad, y0 + pad * 2), (cx, y0 + pad)]
        draw.line(points, fill=ORANGE, width=width, joint="curve")
        draw.line((cx - pad * 2, cy, cx - pad // 2, cy + pad * 2, cx + pad * 3, cy - pad * 2), fill=ORANGE, width=width, joint="curve")
    elif kind == "printing":
        draw.rounded_rectangle((x0 + pad, cy - pad, x1 - pad, y1 - pad), radius=pad, outline=ORANGE, width=width)
        draw.rectangle((x0 + pad * 2, y0 + pad, x1 - pad * 2, cy), outline=ORANGE, width=width)
        draw.line((x0 + pad * 3, y1 - pad * 2, x1 - pad * 3, y1 - pad * 2), fill=ORANGE, width=width)
    elif kind == "phone":
        draw.arc((x0 + pad, y0 + pad, x1 - pad, y1 - pad), 130, 315, fill=ORANGE, width=width)
        draw.rounded_rectangle((x0 + pad, y1 - pad * 3, x0 + pad * 3, y1 - pad), radius=pad, outline=ORANGE, width=width)
        draw.rounded_rectangle((x1 - pad * 3, y0 + pad, x1 - pad, y0 + pad * 3), radius=pad, outline=ORANGE, width=width)


def corner_xy(corner: str, canvas: tuple[int, int], item: tuple[int, int], margin: int) -> tuple[int, int]:
    canvas_w, canvas_h = canvas
    item_w, item_h = item
    x = margin if corner.endswith("left") else canvas_w - margin - item_w
    y = margin if corner.startswith("top") else canvas_h - margin - item_h
    return x, y


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--logo-asset", required=True, type=Path)
    parser.add_argument("--overlay-corner", choices=CORNERS, default="bottom-right")
    parser.add_argument("--theme", choices=("dark", "light"), default="dark")
    parser.add_argument("--layout", choices=("row", "grid"), default="row")
    parser.add_argument("--logo-width", type=float, default=0.128, help="Logo width as a fraction of the shorter image edge")
    parser.add_argument("--font", type=Path)
    parser.add_argument("--font-bold", type=Path)
    parser.add_argument("--fabric-title", default="Vải mềm nhẹ")
    parser.add_argument("--fabric-detail", default="Thoáng, dễ vận động")
    parser.add_argument("--design-title", default="Thiết kế đồng bộ")
    parser.add_argument("--design-detail", default="Gọn và tôn dáng")
    parser.add_argument("--durability-title", default="Bền màu")
    parser.add_argument("--durability-detail", default="Giữ form tốt")
    parser.add_argument("--printing-title", default="Hình in sắc nét")
    parser.add_argument("--printing-detail", default="Màu in đồng đều")
    parser.add_argument("--hotline", default="0989 353 247")
    args = parser.parse_args()

    if args.hotline != "0989 353 247":
        parser.error("--hotline must be exactly '0989 353 247'")
    if not 0.08 <= args.logo_width <= 0.16:
        parser.error("--logo-width must be between 0.08 and 0.16")

    base = Image.open(args.input).convert("RGBA")
    logo = Image.open(args.logo_asset).convert("RGBA")
    canvas_w, canvas_h = base.size
    unit = min(canvas_w, canvas_h)
    margin = round(unit * 0.025)
    gap = max(6, round(unit * 0.008))
    if args.layout == "row":
        cluster_w = canvas_w - margin * 2
        cluster_h = round(unit * 0.066)
        cluster_x = margin
        cluster_y = margin if args.overlay_corner.startswith("top") else canvas_h - margin - cluster_h
        logo_slot = round(cluster_w * 0.15)
        phone_w = round(cluster_w * 0.155)
        card_w = (cluster_w - logo_slot - phone_w - gap * 5) // 4
        card_h = cluster_h
        header_h = cluster_h
    else:
        cluster_w = round(min(canvas_w * 0.34, unit * 0.40))
        card_w = (cluster_w - gap) // 2
        card_h = round(unit * 0.067)
        header_h = round(unit * 0.072)
        cluster_h = header_h + gap + card_h * 2 + gap
        cluster_x, cluster_y = corner_xy(args.overlay_corner, base.size, (cluster_w, cluster_h), margin)
        logo_slot = round(cluster_w * 0.42)
        phone_w = round(cluster_w * 0.48)

    if args.theme == "dark":
        card_fill = (0, 0, 0, 158)
        phone_fill = (0, 0, 0, 122)
        primary = (255, 255, 255, 255)
        secondary = (232, 236, 240, 255)
    else:
        card_fill = (255, 255, 255, 205)
        phone_fill = (255, 255, 255, 174)
        primary = NAVY
        secondary = (44, 61, 76, 255)

    overlay = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    radius = max(8, round(unit * 0.012))
    logo_scaled = scaled(logo, min(round(unit * args.logo_width), round(logo_slot * 0.92)))
    logo_x = cluster_x + (logo_slot - logo_scaled.width) // 2
    if args.layout == "row" and args.overlay_corner.startswith("top"):
        logo_y = max(0, round(margin * 0.25))
    elif args.layout == "row":
        logo_y = canvas_h - logo_scaled.height - max(0, round(margin * 0.25))
    else:
        logo_y = cluster_y + (header_h - logo_scaled.height) // 2
    overlay.alpha_composite(logo_scaled, (logo_x, logo_y))

    phone_h = round(unit * 0.034) if args.layout == "row" else round(unit * 0.038)
    phone_x = cluster_x + cluster_w - phone_w
    phone_y = cluster_y + (header_h - phone_h) // 2
    draw.rounded_rectangle((phone_x, phone_y, phone_x + phone_w, phone_y + phone_h), radius=phone_h // 2, fill=phone_fill)
    phone_icon = round(phone_h * 0.48)
    phone_icon_x = phone_x + round(phone_h * 0.32)
    phone_icon_y = phone_y + (phone_h - phone_icon) // 2
    draw_icon(draw, "phone", (phone_icon_x, phone_icon_y, phone_icon_x + phone_icon, phone_icon_y + phone_icon), max(2, round(unit * 0.002)))
    phone_text_x = phone_icon_x + phone_icon + round(unit * 0.008)
    phone_font = fit_font(draw, args.hotline, phone_x + phone_w - phone_text_x - round(unit * 0.012), round(unit * 0.016), False, args.font)
    phone_box = draw.textbbox((0, 0), args.hotline, font=phone_font)
    phone_text_y = phone_y + (phone_h - (phone_box[3] - phone_box[1])) // 2 - phone_box[1]
    draw.text((phone_text_x, phone_text_y), args.hotline, font=phone_font, fill=primary)

    features = [
        ("fabric", args.fabric_title, args.fabric_detail),
        ("design", args.design_title, args.design_detail),
        ("durability", args.durability_title, args.durability_detail),
        ("printing", args.printing_title, args.printing_detail),
    ]
    cards_y = cluster_y if args.layout == "row" else cluster_y + header_h + gap
    icon_size = round(card_h * 0.38)
    card_pad = round(card_h * 0.16)
    text_gap = round(card_h * 0.12)
    title_size = round(unit * 0.0145)
    detail_size = round(unit * 0.0115)

    for index, (kind, title, detail) in enumerate(features):
        if args.layout == "row":
            x = cluster_x + logo_slot + gap + index * (card_w + gap)
            y = cards_y
        else:
            col, row = index % 2, index // 2
            x = cluster_x + col * (card_w + gap)
            y = cards_y + row * (card_h + gap)
        draw.rounded_rectangle((x, y, x + card_w, y + card_h), radius=radius, fill=card_fill)
        icon_y = y + (card_h - icon_size) // 2
        draw_icon(draw, kind, (x + card_pad, icon_y, x + card_pad + icon_size, icon_y + icon_size), max(2, round(unit * 0.002)))
        text_x = x + card_pad + icon_size + text_gap
        text_w = x + card_w - card_pad - text_x
        title_font = fit_font(draw, title, text_w, title_size, True, args.font_bold)
        detail_font = fit_font(draw, detail, text_w, detail_size, False, args.font)
        title_box = draw.textbbox((0, 0), title, font=title_font)
        detail_box = draw.textbbox((0, 0), detail, font=detail_font)
        block_h = (title_box[3] - title_box[1]) + round(unit * 0.004) + (detail_box[3] - detail_box[1])
        text_y = y + (card_h - block_h) // 2 - title_box[1]
        draw.text((text_x, text_y), title, font=title_font, fill=primary)
        detail_y = text_y + (title_box[3] - title_box[1]) + round(unit * 0.004) - detail_box[1]
        draw.text((text_x, detail_y), detail, font=detail_font, fill=secondary)

    result = Image.alpha_composite(base, overlay)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    result.convert("RGB").save(args.output, quality=95)
    print(f"WROTE {args.output} {canvas_w}x{canvas_h} layout={args.layout} corner={args.overlay_corner} theme={args.theme} hotline={args.hotline}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
