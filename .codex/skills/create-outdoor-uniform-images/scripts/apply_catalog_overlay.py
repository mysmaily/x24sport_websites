#!/usr/bin/env python3
"""Add polished logo, feature callouts, and understated hotline to a catalog photo."""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageStat


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


def region_luminance(image: Image.Image, box: tuple[int, int, int, int]) -> float:
    x0, y0, x1, y1 = box
    x0 = max(0, min(image.width, x0))
    y0 = max(0, min(image.height, y0))
    x1 = max(x0 + 1, min(image.width, x1))
    y1 = max(y0 + 1, min(image.height, y1))
    stat = ImageStat.Stat(image.crop((x0, y0, x1, y1)).convert("RGB"))
    r, g, b = stat.mean
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast_palette(image: Image.Image, box: tuple[int, int, int, int], requested_theme: str) -> tuple[tuple[int, int, int, int], tuple[int, int, int, int], tuple[int, int, int, int]]:
    if requested_theme == "auto":
        requested_theme = "light" if region_luminance(image, box) >= 145 else "dark"
    if requested_theme == "dark":
        return (255, 255, 255, 255), (232, 236, 240, 255), (0, 0, 0, 170)
    return NAVY, (44, 61, 76, 255), (255, 255, 255, 185)


def draw_readable_text(
    draw: ImageDraw.ImageDraw,
    xy: tuple[int, int],
    text: str,
    font: ImageFont.FreeTypeFont,
    fill: tuple[int, int, int, int],
    stroke_fill: tuple[int, int, int, int],
    stroke_width: int,
) -> None:
    draw.text(xy, text, font=font, fill=fill, stroke_width=stroke_width, stroke_fill=stroke_fill)


def draw_aligned_text(
    draw: ImageDraw.ImageDraw,
    x: int,
    y: int,
    text: str,
    font: ImageFont.FreeTypeFont,
    fill: tuple[int, int, int, int],
    stroke_fill: tuple[int, int, int, int],
    stroke_width: int,
    align: str,
) -> None:
    if align == "right":
        x -= round(draw.textlength(text, font=font))
    draw_readable_text(draw, (x, y), text, font, fill, stroke_fill, stroke_width)


def draw_gradient_backdrop(
    overlay: Image.Image,
    corner: str,
    layout: str,
    cluster_box: tuple[int, int, int, int],
    theme: str,
    unit: int,
) -> None:
    """Add a soft transparent gradient behind the overlay for legibility."""
    canvas_w, canvas_h = overlay.size
    color = (0, 0, 0) if theme == "dark" else (255, 255, 255)
    alpha_max = 92 if theme == "dark" else 122
    gradient = Image.new("RGBA", overlay.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(gradient)

    if layout == "row":
        band_h = min(canvas_h, round(unit * 0.18))
        for index in range(band_h):
            strength = (1 - index / max(1, band_h - 1)) ** 1.7
            alpha = round(alpha_max * strength)
            if corner.startswith("top"):
                y = index
            else:
                y = canvas_h - 1 - index
            draw.line((0, y, canvas_w, y), fill=(*color, alpha))
    else:
        x0, y0, x1, y1 = cluster_box
        expand = round(unit * 0.035)
        x0 = max(0, x0 - expand)
        y0 = max(0, y0 - expand)
        x1 = min(canvas_w, x1 + expand)
        y1 = min(canvas_h, y1 + expand)
        steps = max(24, round(unit * 0.055))
        for step in range(steps):
            progress = step / max(1, steps - 1)
            inset = round(progress * expand)
            strength = progress**1.6
            alpha = round(alpha_max * 0.78 * strength)
            draw.rounded_rectangle(
                (x0 + inset, y0 + inset, x1 - inset, y1 - inset),
                radius=max(14, round(unit * 0.026)),
                fill=(*color, alpha),
            )

    overlay.alpha_composite(gradient)


def draw_diagonal_backdrop(
    overlay: Image.Image,
    cluster_box: tuple[int, int, int, int],
    theme: str,
    unit: int,
) -> None:
    """Add a compact diagonal wash behind the overlay, not across the photo."""
    canvas_w, canvas_h = overlay.size
    x0, y0, x1, y1 = cluster_box
    expand = round(unit * 0.018)
    x0 = max(0, x0 - expand)
    y0 = max(0, y0 - expand)
    x1 = min(canvas_w, x1 + expand)
    y1 = min(canvas_h, y1 + expand)
    color = (255, 255, 255) if theme == "light" else (0, 0, 0)
    draw = ImageDraw.Draw(overlay)
    alpha = 42 if theme == "light" else 50
    slant = round(unit * 0.055)
    draw.polygon(
        [
            (x0 + slant, y0),
            (x1, y0),
            (x1 - slant, y1),
            (x0, y1),
        ],
        fill=(*color, alpha),
    )


def draw_paint_swatch(
    draw: ImageDraw.ImageDraw,
    box: tuple[int, int, int, int],
    theme: str,
    unit: int,
) -> None:
    """Draw a clean rounded swash behind one callout."""
    x0, y0, x1, y1 = box
    width = x1 - x0
    height = y1 - y0
    base = (255, 255, 255, 132) if theme == "light" else (0, 0, 0, 108)
    accent = (242, 126, 36, 42)
    radius = max(10, round(height * 0.24))
    draw.rounded_rectangle((x0, y0, x1, y1), radius=radius, fill=base)
    draw.line(
        (
            x0 + round(width * 0.06),
            y1 - round(height * 0.14),
            x1 - round(width * 0.12),
            y0 + round(height * 0.14),
        ),
        fill=accent,
        width=max(2, round(unit * 0.0025)),
    )


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


def region_activity(image: Image.Image, box: tuple[int, int, int, int]) -> float:
    x0, y0, x1, y1 = box
    x0 = max(0, min(image.width, x0))
    y0 = max(0, min(image.height, y0))
    x1 = max(x0 + 1, min(image.width, x1))
    y1 = max(y0 + 1, min(image.height, y1))
    crop = image.crop((x0, y0, x1, y1)).convert("L")
    edge_mean = ImageStat.Stat(crop.filter(ImageFilter.FIND_EDGES)).mean[0]
    texture = ImageStat.Stat(crop).stddev[0]
    return edge_mean * 1.35 + texture * 0.45


def auto_position(
    image: Image.Image,
    layout: str,
    item: tuple[int, int],
    margin: int,
) -> tuple[int, int]:
    canvas_w, canvas_h = image.size
    item_w, item_h = item
    candidates: list[tuple[int, int]] = []
    xs = [
        margin,
        round(canvas_w * 0.08),
        round(canvas_w * 0.5 - item_w * 0.5),
        round(canvas_w * 0.92 - item_w),
        canvas_w - margin - item_w,
    ]
    ys = [
        margin,
        round(canvas_h * 0.16),
        round(canvas_h * 0.25),
        round(canvas_h * 0.34),
        round(canvas_h * 0.46),
        canvas_h - margin - item_h,
    ]
    if layout == "rail":
        for x in (margin, round(canvas_w * 0.045), round(canvas_w * 0.71), canvas_w - margin - item_w):
            for y in ys[1:-1]:
                candidates.append((x, y))
    elif layout == "row":
        for y in (margin, round(canvas_h * 0.18), round(canvas_h * 0.72), canvas_h - margin - item_h):
            candidates.append((round(canvas_w * 0.5 - item_w * 0.5), y))
    else:
        for x in xs:
            for y in ys:
                candidates.append((x, y))

    best: tuple[float, int, int] | None = None
    for x, y in candidates:
        x = max(margin, min(x, canvas_w - margin - item_w))
        y = max(margin, min(y, canvas_h - margin - item_h))
        box = (x, y, x + item_w, y + item_h)
        activity = region_activity(image, box)
        # Prefer edge bands over dead center so faces and core garment details stay dominant.
        center_x = x + item_w / 2
        center_y = y + item_h / 2
        centrality = (1 - min(1, abs(center_x - canvas_w / 2) / (canvas_w / 2))) + (1 - min(1, abs(center_y - canvas_h / 2) / (canvas_h / 2)))
        edge_distance = min(x, canvas_w - (x + item_w)) / max(1, canvas_w)
        score = activity + centrality * 10 + edge_distance * 22
        if best is None or score < best[0]:
            best = (score, x, y)
    if best is None:
        return margin, margin
    return best[1], best[2]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--logo-asset", required=True, type=Path)
    parser.add_argument("--skip-logo", action="store_true", help="For testing already-branded images only; final catalog outputs should keep the logo")
    parser.add_argument("--skip-hotline", action="store_true", help="For testing already-branded images only; final catalog outputs should keep the hotline")
    parser.add_argument("--overlay-corner", choices=CORNERS, default="bottom-right")
    parser.add_argument("--position-x", type=float, help="Optional manual x position as 0..1 fraction of canvas width")
    parser.add_argument("--position-y", type=float, help="Optional manual y position as 0..1 fraction of canvas height")
    parser.add_argument("--auto-position", action="store_true", help="Scan candidate edge regions and place the overlay on the quietest detected area")
    parser.add_argument("--theme", choices=("auto", "dark", "light"), default="auto")
    parser.add_argument("--layout", choices=("row", "grid", "rail"), default="row")
    parser.add_argument("--backdrop", choices=("diagonal", "gradient", "none"), default="none")
    parser.add_argument("--surface", choices=("paint", "none", "card"), default="paint")
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
    for option_name in ("position_x", "position_y"):
        option_value = getattr(args, option_name)
        if option_value is not None and not 0 <= option_value <= 1:
            parser.error(f"--{option_name.replace('_', '-')} must be between 0 and 1")

    base = Image.open(args.input).convert("RGBA")
    logo = Image.open(args.logo_asset).convert("RGBA")
    canvas_w, canvas_h = base.size
    unit = min(canvas_w, canvas_h)
    margin = max(10, round(unit * 0.010))
    gap = max(6, round(unit * 0.008))
    show_logo = not args.skip_logo
    show_hotline = not args.skip_hotline
    if args.layout == "row":
        cluster_w = canvas_w - margin * 2
        cluster_h = round(unit * 0.078)
        cluster_x = margin
        cluster_y = margin if args.overlay_corner.startswith("top") else canvas_h - margin - cluster_h
        logo_slot = round(cluster_w * 0.15) if show_logo else 0
        phone_w = round(cluster_w * 0.155) if show_hotline else 0
        visible_items = 4 + int(show_logo) + int(show_hotline)
        card_w = (cluster_w - logo_slot - phone_w - gap * max(0, visible_items - 1)) // 4
        card_h = cluster_h
        header_h = cluster_h
    elif args.layout == "grid":
        cluster_w = round(min(canvas_w * 0.39, unit * 0.46))
        card_w = (cluster_w - gap) // 2
        card_h = round(unit * 0.078)
        header_h = round(unit * 0.082) if show_logo or show_hotline else 0
        cluster_h = header_h + (gap if header_h else 0) + card_h * 2 + gap
        cluster_x, cluster_y = corner_xy(args.overlay_corner, base.size, (cluster_w, cluster_h), margin)
        logo_slot = round(cluster_w * 0.42)
        phone_w = round(cluster_w * 0.48)
    else:
        cluster_w = round(min(canvas_w * 0.305, unit * 0.335))
        card_w = cluster_w
        card_h = round(unit * 0.066)
        header_h = round(unit * 0.076) if show_logo or show_hotline else 0
        cluster_h = header_h + (gap if header_h else 0) + card_h * 4 + gap * 3
        cluster_x, cluster_y = corner_xy(args.overlay_corner, base.size, (cluster_w, cluster_h), margin)
        logo_slot = round(cluster_w * 0.42)
        phone_w = round(cluster_w * 0.52)

    if args.auto_position and args.position_x is None and args.position_y is None:
        cluster_x, cluster_y = auto_position(base, args.layout, (cluster_w, cluster_h), margin)

    if args.position_x is not None:
        cluster_x = round(args.position_x * canvas_w)
        cluster_x = max(margin, min(cluster_x, canvas_w - margin - cluster_w))
    if args.position_y is not None:
        cluster_y = round(args.position_y * canvas_h)
        cluster_y = max(margin, min(cluster_y, canvas_h - margin - cluster_h))

    primary, secondary, stroke_fill = contrast_palette(base, (cluster_x, cluster_y, cluster_x + cluster_w, cluster_y + cluster_h), args.theme)
    if args.theme == "auto":
        resolved_theme = "light" if region_luminance(base, (cluster_x, cluster_y, cluster_x + cluster_w, cluster_y + cluster_h)) >= 145 else "dark"
    else:
        resolved_theme = args.theme
    if resolved_theme == "dark":
        card_fill = (0, 0, 0, 72)
        phone_fill = (0, 0, 0, 140)
    else:
        card_fill = (255, 255, 255, 82)
        phone_fill = (255, 255, 255, 188)

    overlay = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    radius = max(8, round(unit * 0.012))
    if args.backdrop == "gradient":
        draw_gradient_backdrop(
            overlay,
            args.overlay_corner,
            args.layout,
            (cluster_x, cluster_y, cluster_x + cluster_w, cluster_y + cluster_h),
            resolved_theme,
            unit,
        )
    elif args.backdrop == "diagonal":
        draw_diagonal_backdrop(
            overlay,
            (cluster_x, cluster_y, cluster_x + cluster_w, cluster_y + cluster_h),
            resolved_theme,
            unit,
        )
    if show_logo:
        logo_scaled = scaled(logo, min(round(unit * args.logo_width), round(logo_slot * 0.92)))
        logo_x = cluster_x + (logo_slot - logo_scaled.width) // 2
        if args.layout == "row" and args.overlay_corner.startswith("top"):
            logo_y = max(0, round(margin * 0.25))
        elif args.layout == "row":
            logo_y = canvas_h - logo_scaled.height - max(0, round(margin * 0.25))
        else:
            logo_y = cluster_y + (header_h - logo_scaled.height) // 2
        overlay.alpha_composite(logo_scaled, (logo_x, logo_y))

    if show_hotline:
        phone_h = round(unit * 0.04) if args.layout == "row" else round(unit * 0.043)
        phone_x = cluster_x + cluster_w - phone_w
        phone_y = cluster_y + (header_h - phone_h) // 2
        if args.surface == "card":
            draw.rounded_rectangle((phone_x, phone_y, phone_x + phone_w, phone_y + phone_h), radius=phone_h // 2, fill=phone_fill)
        phone_icon = round(phone_h * 0.48)
        phone_icon_x = phone_x + round(phone_h * 0.32)
        phone_icon_y = phone_y + (phone_h - phone_icon) // 2
        draw_icon(draw, "phone", (phone_icon_x, phone_icon_y, phone_icon_x + phone_icon, phone_icon_y + phone_icon), max(2, round(unit * 0.002)))
        phone_text_x = phone_icon_x + phone_icon + round(unit * 0.008)
        phone_font = fit_font(draw, args.hotline, phone_x + phone_w - phone_text_x - round(unit * 0.012), round(unit * 0.018), False, args.font)
        phone_box = draw.textbbox((0, 0), args.hotline, font=phone_font)
        phone_text_y = phone_y + (phone_h - (phone_box[3] - phone_box[1])) // 2 - phone_box[1]
        phone_primary, _, phone_stroke = contrast_palette(base, (phone_x, phone_y, phone_x + phone_w, phone_y + phone_h), args.theme)
        draw_readable_text(draw, (phone_text_x, phone_text_y), args.hotline, phone_font, phone_primary, phone_stroke, 0)

    features = [
        ("fabric", args.fabric_title, args.fabric_detail),
        ("design", args.design_title, args.design_detail),
        ("durability", args.durability_title, args.durability_detail),
        ("printing", args.printing_title, args.printing_detail),
    ]
    cards_y = cluster_y if args.layout == "row" else cluster_y + header_h + (gap if header_h else 0)
    icon_size = round(card_h * 0.38)
    card_pad = round(card_h * 0.16)
    text_gap = round(card_h * 0.12)
    edge_text_pad = max(12, round(unit * 0.014))
    title_size = round(unit * 0.0195)
    detail_size = round(unit * 0.0145)

    for index, (kind, title, detail) in enumerate(features):
        if args.layout == "row":
            x = cluster_x + (logo_slot + gap if show_logo else 0) + index * (card_w + gap)
            y = cards_y
        elif args.layout == "grid":
            col, row = index % 2, index // 2
            x = cluster_x + col * (card_w + gap)
            y = cards_y + row * (card_h + gap)
        else:
            x = cluster_x
            y = cards_y + index * (card_h + gap)
        if args.surface == "paint":
            local_theme = "light" if region_luminance(base, (x, y, x + card_w, y + card_h)) >= 145 else "dark"
            draw_paint_swatch(draw, (x, y, x + card_w, y + card_h), local_theme, unit)
        elif args.surface == "card":
            draw.rounded_rectangle((x, y, x + card_w, y + card_h), radius=radius, fill=card_fill)
        icon_y = y + (card_h - icon_size) // 2
        rail_right_aligned = args.layout == "rail" and x + card_w / 2 >= canvas_w / 2
        rail_left_aligned = args.layout == "rail" and not rail_right_aligned
        if rail_right_aligned:
            icon_x = x + card_pad
            text_anchor_x = x + card_w - edge_text_pad
            text_w = max(32, text_anchor_x - (icon_x + icon_size + text_gap))
            text_align = "right"
        elif rail_left_aligned:
            text_anchor_x = x + edge_text_pad
            icon_x = x + card_w - edge_text_pad - icon_size
            text_w = max(32, icon_x - text_gap - text_anchor_x)
            text_align = "left"
        else:
            icon_x = x + card_pad
            text_anchor_x = x + card_pad + icon_size + text_gap
            text_w = x + card_w - card_pad - text_anchor_x
            text_align = "left"
        draw_icon(draw, kind, (icon_x, icon_y, icon_x + icon_size, icon_y + icon_size), max(2, round(unit * 0.002)))
        title_font = fit_font(draw, title, text_w, title_size, True, args.font_bold)
        detail_font = fit_font(draw, detail, text_w, detail_size, False, args.font)
        title_box = draw.textbbox((0, 0), title, font=title_font)
        detail_box = draw.textbbox((0, 0), detail, font=detail_font)
        block_h = (title_box[3] - title_box[1]) + round(unit * 0.004) + (detail_box[3] - detail_box[1])
        text_y = y + (card_h - block_h) // 2 - title_box[1]
        local_primary, local_secondary, local_stroke = contrast_palette(base, (x, y, x + card_w, y + card_h), args.theme)
        draw_aligned_text(draw, text_anchor_x, text_y, title, title_font, local_primary, local_stroke, 0, text_align)
        detail_y = text_y + (title_box[3] - title_box[1]) + round(unit * 0.004) - detail_box[1]
        draw_aligned_text(draw, text_anchor_x, detail_y, detail, detail_font, local_secondary, local_stroke, 0, text_align)

    result = Image.alpha_composite(base, overlay)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    result.convert("RGB").save(args.output, quality=95)
    print(f"WROTE {args.output} {canvas_w}x{canvas_h} layout={args.layout} corner={args.overlay_corner} theme={args.theme} resolved_theme={resolved_theme} backdrop={args.backdrop} surface={args.surface} hotline={args.hotline}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
