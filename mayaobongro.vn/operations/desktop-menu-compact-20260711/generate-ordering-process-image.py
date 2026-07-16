from __future__ import annotations

import io
import math
import os
import urllib.request
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


OUT_DIR = Path("mayaobongro.vn/tmp-generated/ordering-process-20260711")
OUT_DIR.mkdir(parents=True, exist_ok=True)
OUT_PATH = OUT_DIR / "mayaobongro-quy-trinh-dat-may-ao-bong-ro-20260711.png"

ASSET_URLS = {
    "product_adults": "https://cdn.mayaobongro.vn/wp-content/uploads/2026/07/home-adults-basketball-20260708.webp",
    "product_kids": "https://cdn.mayaobongro.vn/wp-content/uploads/2026/07/home-kids-basketball-20260708.webp",
    "product_eco": "https://cdn.mayaobongro.vn/wp-content/uploads/2026/07/eco-retreat-tieu-hoc.webp",
}
LOGO_PATH = Path("mayaobongro.vn/tmp-generated/header-logo-20260707/mayaobongro-header-logo-20260708-v4.png")


def fetch_image(url: str) -> Image.Image:
    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X) AppleWebKit/537.36 Chrome Safari",
            "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        },
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        data = response.read()
    return Image.open(io.BytesIO(data)).convert("RGBA")


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    candidates = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/Library/Fonts/Arial Unicode.ttf",
    ]
    for candidate in candidates:
        if candidate and os.path.exists(candidate):
            return ImageFont.truetype(candidate, size=size)
    return ImageFont.load_default()


def rounded_rect(draw: ImageDraw.ImageDraw, xy: tuple[int, int, int, int], radius: int, fill, outline=None, width: int = 1) -> None:
    draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=width)


def fit_cover(img: Image.Image, size: tuple[int, int]) -> Image.Image:
    target_w, target_h = size
    scale = max(target_w / img.width, target_h / img.height)
    resized = img.resize((int(img.width * scale), int(img.height * scale)), Image.Resampling.LANCZOS)
    left = (resized.width - target_w) // 2
    top = (resized.height - target_h) // 2
    return resized.crop((left, top, left + target_w, top + target_h))


def paste_round(base: Image.Image, img: Image.Image, box: tuple[int, int, int, int], radius: int) -> None:
    x1, y1, x2, y2 = box
    fitted = fit_cover(img, (x2 - x1, y2 - y1))
    mask = Image.new("L", fitted.size, 0)
    mdraw = ImageDraw.Draw(mask)
    mdraw.rounded_rectangle((0, 0, fitted.width, fitted.height), radius=radius, fill=255)
    base.paste(fitted, (x1, y1), mask)


def wrap_text(draw: ImageDraw.ImageDraw, text: str, max_width: int, font_obj: ImageFont.FreeTypeFont) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        trial = f"{current} {word}".strip()
        if draw.textbbox((0, 0), trial, font=font_obj)[2] <= max_width:
            current = trial
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def draw_centered_text(draw: ImageDraw.ImageDraw, center_x: int, y: int, text: str, font_obj, fill, max_width: int, line_gap: int = 6) -> int:
    lines = wrap_text(draw, text, max_width, font_obj)
    for line in lines:
        bbox = draw.textbbox((0, 0), line, font=font_obj)
        draw.text((center_x - (bbox[2] - bbox[0]) / 2, y), line, font=font_obj, fill=fill)
        y += bbox[3] - bbox[1] + line_gap
    return y


def draw_arrow(draw: ImageDraw.ImageDraw, start: tuple[int, int], end: tuple[int, int], fill: tuple[int, int, int, int], width: int = 5) -> None:
    draw.line((start, end), fill=fill, width=width)
    angle = math.atan2(end[1] - start[1], end[0] - start[0])
    arrow_len = 18
    points = [
        end,
        (int(end[0] - arrow_len * math.cos(angle - 0.45)), int(end[1] - arrow_len * math.sin(angle - 0.45))),
        (int(end[0] - arrow_len * math.cos(angle + 0.45)), int(end[1] - arrow_len * math.sin(angle + 0.45))),
    ]
    draw.polygon(points, fill=fill)


def main() -> None:
    width, height = 1600, 900
    base = Image.new("RGBA", (width, height), (8, 9, 11, 255))
    draw = ImageDraw.Draw(base)

    # Background bands and subtle court lines.
    for y in range(height):
        red = int(8 + y / height * 20)
        draw.line((0, y, width, y), fill=(red, 10, 13, 255))
    draw.rectangle((0, 0, width, 86), fill=(14, 15, 17, 245))
    draw.rectangle((0, 86, width, 94), fill=(227, 27, 35, 255))
    draw.line((88, 700, 1512, 700), fill=(227, 27, 35, 80), width=3)
    draw.arc((1120, 155, 1780, 815), 112, 252, fill=(255, 255, 255, 22), width=4)
    draw.arc((-170, 300, 470, 940), 292, 72, fill=(255, 255, 255, 18), width=4)

    logo = Image.open(LOGO_PATH).convert("RGBA")
    logo.thumbnail((480, 78), Image.Resampling.LANCZOS)
    base.alpha_composite(logo, (56, 18))

    title_font = font(56, bold=True)
    sub_font = font(25)
    draw.text((64, 132), "QUY TRÌNH ĐẶT MAY ÁO BÓNG RỔ", font=title_font, fill=(255, 255, 255, 255))
    draw.text((68, 200), "Từ ý tưởng đội bóng đến bộ áo hoàn thiện, rõ việc - rõ thời gian - dễ chốt đơn.", font=sub_font, fill=(214, 218, 224, 245))

    adults = fetch_image(ASSET_URLS["product_adults"])
    kids = fetch_image(ASSET_URLS["product_kids"])
    eco = fetch_image(ASSET_URLS["product_eco"])

    shadow = Image.new("RGBA", (500, 500), (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(shadow)
    sdraw.rounded_rectangle((24, 24, 476, 476), radius=30, fill=(0, 0, 0, 125))
    shadow = shadow.filter(ImageFilter.GaussianBlur(20))
    base.alpha_composite(shadow, (1030, 120))
    paste_round(base, adults, (1060, 142, 1510, 472), 28)
    draw.rounded_rectangle((1060, 142, 1510, 472), radius=28, outline=(255, 255, 255, 55), width=2)
    rounded_rect(draw, (1088, 392, 1468, 448), 14, (8, 9, 11, 210))
    draw.text((1112, 405), "Xem mẫu thật -> chọn hướng thiết kế", font=font(22, bold=True), fill=(255, 255, 255, 255))

    paste_round(base, kids, (1180, 488, 1510, 725), 24)
    draw.rounded_rectangle((1180, 488, 1510, 725), radius=24, outline=(227, 27, 35, 150), width=3)
    paste_round(base, eco, (990, 508, 1164, 725), 24)
    draw.rounded_rectangle((990, 508, 1164, 725), radius=24, outline=(255, 255, 255, 45), width=2)

    steps = [
        ("01", "Gửi yêu cầu", "Số lượng, thời gian cần nhận, mẫu bạn thích."),
        ("02", "Tư vấn mẫu", "Chọn kiểu áo, chất liệu, form mặc và ngân sách."),
        ("03", "Lên thiết kế", "Logo, màu đội, tên và số áo."),
        ("04", "Chốt size & giá", "Kiểm tra danh sách size, báo giá và thời gian giao."),
        ("05", "Sản xuất", "May/in theo mẫu đã duyệt, kiểm soát chi tiết."),
        ("06", "Giao hàng", "Bàn giao áo cho đội và hỗ trợ chỉnh đơn sau đó."),
    ]

    card_w, card_h = 280, 172
    x_positions = [70, 378, 686, 70, 378, 686]
    y_positions = [318, 318, 318, 560, 560, 560]
    number_font = font(28, bold=True)
    step_title_font = font(26, bold=True)
    body_font = font(19)

    for i, (num, heading, body) in enumerate(steps):
        x, y = x_positions[i], y_positions[i]
        # Card shadow
        shadow_card = Image.new("RGBA", (card_w + 26, card_h + 26), (0, 0, 0, 0))
        sd = ImageDraw.Draw(shadow_card)
        sd.rounded_rectangle((13, 13, card_w + 13, card_h + 13), radius=22, fill=(0, 0, 0, 110))
        shadow_card = shadow_card.filter(ImageFilter.GaussianBlur(14))
        base.alpha_composite(shadow_card, (x - 13, y - 9))

        rounded_rect(draw, (x, y, x + card_w, y + card_h), 22, (24, 27, 32, 245), (255, 255, 255, 34), 1)
        rounded_rect(draw, (x + 18, y + 18, x + 74, y + 74), 17, (227, 27, 35, 255))
        draw.text((x + 29, y + 30), num, font=number_font, fill=(255, 255, 255, 255))
        draw.text((x + 92, y + 24), heading, font=step_title_font, fill=(255, 255, 255, 255))
        draw_centered_text(draw, x + card_w // 2, y + 94, body, body_font, (207, 212, 219, 255), card_w - 40, 5)

    arrow_color = (227, 27, 35, 210)
    draw_arrow(draw, (350, 404), (372, 404), arrow_color)
    draw_arrow(draw, (658, 404), (680, 404), arrow_color)
    draw_arrow(draw, (826, 498), (826, 552), arrow_color)
    draw_arrow(draw, (686, 646), (664, 646), arrow_color)
    draw_arrow(draw, (378, 646), (356, 646), arrow_color)

    rounded_rect(draw, (70, 778, 935, 842), 18, (227, 27, 35, 255))
    draw.text((102, 796), "Sẵn sàng đặt may? Gửi logo, số lượng và deadline qua Zalo 0989.353.247", font=font(25, bold=True), fill=(255, 255, 255, 255))
    rounded_rect(draw, (1010, 778, 1510, 842), 18, (15, 18, 23, 238), (255, 255, 255, 45), 1)
    draw.text((1042, 796), "Mayaobongro.vn - thiết kế riêng cho đội bóng", font=font(24, bold=True), fill=(242, 244, 247, 255))

    base = base.convert("RGB")
    base.save(OUT_PATH, optimize=True, quality=95)
    print(OUT_PATH)


if __name__ == "__main__":
    main()
