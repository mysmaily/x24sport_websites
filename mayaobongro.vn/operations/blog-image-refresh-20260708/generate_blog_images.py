from pathlib import Path
import math
import textwrap

from PIL import Image, ImageDraw, ImageFont


BASE_DIR = Path(__file__).resolve().parent
OUT_DIR = BASE_DIR / "generated"
LOGO_PATH = BASE_DIR.parent.parent / "image-references" / "logo.png"
FONT_REGULAR = "/System/Library/Fonts/Supplemental/Arial Unicode.ttf"
FONT_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"


COVER_POSTS = [
    (1041, "article-1041-ao-bong-ro-dep.jpg", "Ao Bong Ro Dep", "Mau dep cho doi nhom va CLB"),
    (1043, "article-1043-ao-bong-ro-ca-nhan.jpg", "Ao Bong Ro Ca Nhan", "In ten, so ao va mau sac theo yeu cau"),
    (1048, "article-1048-ao-bong-ro-nhom.jpg", "Ao Bong Ro Nhom", "Dong bo nhan dien cho team"),
    (1051, "article-1051-ao-bong-ro-giai-dau.jpg", "Ao Bong Ro Giai Dau", "Form thi dau, thoang mat, noi bat"),
    (1054, "article-1054-ao-bong-ro-team-building.jpg", "Ao Bong Ro Team Building", "Gon dep cho su kien noi bo"),
    (1057, "article-1057-ao-bong-ro-thi-dau.jpg", "Ao Bong Ro Thi Dau", "Toi uu van dong tren san"),
    (1060, "article-1060-ao-bong-ro-thi-dau-doi.jpg", "Ao Bong Ro Thi Dau", "Lua chon dong phuc dung cho doi"),
    (1066, "article-1066-dong-phuc-bong-ro-cong-ty.jpg", "Dong Phuc Bong Ro Cong Ty", "Gan ket doi nhom va thuong hieu"),
    (1073, "article-1073-thiet-ke-ao-bong-ro-dep.jpg", "Thiet Ke Ao Bong Ro Dep", "Tao dau an rieng cho nhom"),
    (1077, "article-1077-xuong-may-ao-bong-ro.jpg", "Xuong May Ao Bong Ro", "Nhan tu van, len mau va san xuat"),
    (1080, "article-1080-may-ao-bong-ro-so-luong-lon.jpg", "May Ao Bong Ro So Luong Lon", "Dong bo chat luong cho doanh nghiep"),
    (1084, "article-1084-ao-bong-ro-sat-nach.jpg", "Ao Bong Ro Sat Nach", "Nhe, thoang, linh hoat cho tran dau"),
    (1090, "article-1090-cach-thiet-ke-mau-ao-bong-ro.jpg", "Cach Thiet Ke Mau Ao Bong Ro", "Chot y tuong, mau sac va bo cuc"),
    (2274, "article-2274-ao-bong-ro-zenix.jpg", "Mau Ao Bong Ro Zenix", "Ra mat doc quyen tai MAYAOBONGRO.VN"),
]


def load_font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size=size)


def wrap_lines(draw: ImageDraw.ImageDraw, text: str, font, max_width: int):
    words = text.split()
    lines = []
    current = ""
    for word in words:
        trial = f"{current} {word}".strip()
        if draw.textbbox((0, 0), trial, font=font)[2] <= max_width:
            current = trial
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def draw_basketball(draw: ImageDraw.ImageDraw, center, radius, fill, line):
    x, y = center
    draw.ellipse((x - radius, y - radius, x + radius, y + radius), fill=fill, outline=line, width=6)
    draw.arc((x - radius, y - radius, x + radius, y + radius), 65, 115, fill=line, width=5)
    draw.arc((x - radius, y - radius, x + radius, y + radius), 245, 295, fill=line, width=5)
    draw.arc((x - radius * 0.65, y - radius, x + radius * 0.65, y + radius), 90, 270, fill=line, width=5)
    draw.arc((x - radius * 0.65, y - radius, x + radius * 0.65, y + radius), -90, 90, fill=line, width=5)
    draw.line((x - radius, y, x + radius, y), fill=line, width=5)


def add_logo(canvas: Image.Image, width: int):
    if not LOGO_PATH.exists():
        return
    logo = Image.open(LOGO_PATH).convert("RGBA")
    logo.thumbnail((260, 120))
    canvas.alpha_composite(logo, (width - logo.width - 40, 30))


def create_cover(filename: str, title: str, subtitle: str, accent):
    width, height = 1400, 900
    image = Image.new("RGBA", (width, height), (16, 18, 27, 255))
    draw = ImageDraw.Draw(image)

    for y in range(height):
        ratio = y / height
        r = int(16 + (accent[0] - 16) * ratio)
        g = int(18 + (accent[1] - 18) * ratio)
        b = int(27 + (accent[2] - 27) * ratio)
        draw.line((0, y, width, y), fill=(r, g, b, 255))

    draw.rounded_rectangle((60, 80, width - 60, height - 80), radius=42, outline=(255, 255, 255, 28), width=2)
    draw.arc((-180, 120, 660, 960), 300, 60, fill=(255, 120, 40, 180), width=12)
    draw.arc((width - 760, -120, width + 120, 760), 110, 240, fill=(255, 70, 70, 120), width=14)

    basketball_fill = (255, 133, 46, 255)
    basketball_line = (64, 18, 4, 255)
    draw_basketball(draw, (width - 250, height - 250), 120, basketball_fill, basketball_line)

    draw.rounded_rectangle((90, 110, 260, 162), radius=22, fill=(18, 22, 31, 170))
    badge_font = load_font(FONT_BOLD, 24)
    draw.text((115, 120), "BLOG BONG RO", fill=(255, 245, 235, 255), font=badge_font)

    title_font = load_font(FONT_BOLD, 72)
    subtitle_font = load_font(FONT_REGULAR, 34)
    lines = wrap_lines(draw, title.upper(), title_font, 720)

    y = 240
    for line in lines[:3]:
        draw.text((100, y), line, fill=(255, 255, 255, 255), font=title_font)
        y += 88

    draw.text((100, y + 24), subtitle, fill=(242, 230, 218, 255), font=subtitle_font)
    draw.rounded_rectangle((100, height - 180, 760, height - 108), radius=28, fill=(18, 22, 31, 180))
    draw.text((126, height - 160), "MAYAOBONGRO.VN  |  Thiet ke va san xuat theo yeu cau", fill=(255, 248, 240, 255), font=load_font(FONT_BOLD, 24))

    add_logo(image, width)
    image.convert("RGB").save(OUT_DIR / filename, quality=92)


def create_infographic():
    width, height = 1400, 900
    image = Image.new("RGBA", (width, height), (20, 22, 30, 255))
    draw = ImageDraw.Draw(image)

    for y in range(height):
        ratio = y / height
        r = int(20 + (162 - 20) * ratio)
        g = int(22 + (39 - 22) * ratio)
        b = int(30 + (26 - 30) * ratio)
        draw.line((0, y, width, y), fill=(r, g, b, 255))

    title_font = load_font(FONT_BOLD, 68)
    sub_font = load_font(FONT_REGULAR, 28)
    item_font = load_font(FONT_BOLD, 22)
    body_font = load_font(FONT_REGULAR, 20)

    draw.text((90, 76), "Nen In Gi Tren Ao Bong Ro?", fill=(255, 255, 255, 255), font=title_font)
    draw.text((90, 160), "10 goi y giup doi nhom noi bat hon trong thi dau va su kien", fill=(255, 229, 214, 255), font=sub_font)

    ideas = [
        ("01", "Ten doi", "Dong bo nhan dien cho ca team"),
        ("02", "So ao", "De phan biet vi tri thi dau"),
        ("03", "Ten cau thu", "Tao cam giac chuyen nghiep"),
        ("04", "Logo CLB", "Tang muc do nhan dien thuong hieu"),
        ("05", "Khau hieu", "Truyen dong luc va tinh than doi"),
        ("06", "Mau chu dao", "Lam noi bat mau ao tren san"),
        ("07", "Bieu tuong rieng", "Them dau an ca tinh cho nhom"),
        ("08", "Ten giai dau", "Phu hop su kien va ky niem"),
        ("09", "Nha tai tro", "Su dung gon dep va dung vi tri"),
        ("10", "Nam thanh lap", "Tao gia tri ky niem ben lau"),
    ]

    start_x, start_y = 90, 240
    card_w, card_h = 370, 120
    gap_x, gap_y = 36, 26
    for index, (num, head, body) in enumerate(ideas):
        col = index % 3
        row = index // 3
        x = start_x + col * (card_w + gap_x)
        y = start_y + row * (card_h + gap_y)
        draw.rounded_rectangle((x, y, x + card_w, y + card_h), radius=28, fill=(255, 255, 255, 24), outline=(255, 255, 255, 36), width=2)
        draw.ellipse((x + 18, y + 18, x + 78, y + 78), fill=(255, 130, 48, 255))
        draw.text((x + 35, y + 28), num, fill=(31, 18, 12, 255), font=item_font)
        draw.text((x + 94, y + 22), head, fill=(24, 26, 32, 255), font=item_font)
        body_lines = textwrap.wrap(body, width=24)
        yy = y + 58
        for line in body_lines[:2]:
            draw.text((x + 94, yy), line, fill=(86, 74, 68, 255), font=body_font)
            yy += 28

    draw_basketball(draw, (1240, 114), 52, (255, 133, 46, 255), (65, 23, 8, 255))
    add_logo(image, width)
    image.convert("RGB").save(OUT_DIR / "article-2308-infographic.jpg", quality=92)


def create_process_images():
    title_font = load_font(FONT_BOLD, 64)
    step_font = load_font(FONT_BOLD, 46)
    body_font = load_font(FONT_REGULAR, 28)

    def base_canvas():
        width = height = 1200
        canvas = Image.new("RGBA", (width, height), (248, 244, 239, 255))
        draw = ImageDraw.Draw(canvas)
        draw.rounded_rectangle((40, 40, width - 40, height - 40), radius=40, fill=(255, 255, 255, 255), outline=(230, 93, 43, 120), width=4)
        return canvas, draw

    canvas, draw = base_canvas()
    draw.text((90, 80), "Quy Trinh Dat May Ao Bong Ro", fill=(28, 30, 36, 255), font=title_font)
    draw.text((90, 160), "Chi voi 3 buoc ro rang, nhanh gon va de theo doi", fill=(89, 71, 60, 255), font=body_font)
    steps = [
        ("1", "Gui y tuong", "Chia se mau, mau sac, logo, so luong"),
        ("2", "Len demo", "Duyet bo cuc, ten, so ao va chi tiet"),
        ("3", "Chot san xuat", "Xac nhan so luong, may va giao hang"),
    ]
    for i, (num, head, body) in enumerate(steps):
        x = 85 + i * 345
        draw.rounded_rectangle((x, 300, x + 290, 690), radius=32, fill=(249, 251, 255, 255), outline=(215, 221, 231, 255), width=3)
        draw.ellipse((x + 105, 235, x + 185, 315), fill=(242, 104, 43, 255))
        draw.text((x + 136, 255), num, fill=(255, 255, 255, 255), font=step_font)
        draw.text((x + 32, 352), head, fill=(22, 26, 32, 255), font=step_font)
        y = 435
        for line in textwrap.wrap(body, width=20):
            draw.text((x + 32, y), line, fill=(84, 76, 70, 255), font=body_font)
            y += 40
    draw.rounded_rectangle((90, 780, 1110, 1040), radius=34, fill=(18, 22, 31, 255))
    draw.text((136, 846), "MAYAOBONGRO.VN", fill=(255, 255, 255, 255), font=load_font(FONT_BOLD, 52))
    draw.text((136, 926), "Tu van | Thiet ke | San xuat | Giao hang toan quoc", fill=(255, 213, 188, 255), font=body_font)
    add_logo(canvas, 1200)
    canvas.convert("RGB").save(OUT_DIR / "article-2354-process-overview.jpg", quality=92)

    step_cards = [
        ("article-2354-step-1.jpg", "Buoc 1", "Gui y tuong va thong tin doi nhom", "Ban gui mau tham khao, mau sac, logo, ten doi va so luong can may."),
        ("article-2354-step-2.jpg", "Buoc 2", "Duyet demo thiet ke bong ro", "Chung toi len demo, can chinh ten, so ao va bo cuc de ban chot nhanh."),
        ("article-2354-step-3.jpg", "Buoc 3", "San xuat va giao hang", "Sau khi chot mau, xuong tien hanh may va giao hang dung tien do."),
    ]
    for filename, badge, heading, body in step_cards:
        canvas, draw = base_canvas()
        draw.rounded_rectangle((86, 86, 296, 152), radius=24, fill=(242, 104, 43, 255))
        draw.text((118, 100), badge, fill=(255, 255, 255, 255), font=load_font(FONT_BOLD, 34))
        draw.text((90, 210), heading, fill=(24, 27, 33, 255), font=title_font)
        draw.rounded_rectangle((90, 340, 1110, 880), radius=36, fill=(249, 250, 252, 255), outline=(223, 227, 235, 255), width=3)
        draw_basketball(draw, (960, 610), 120, (255, 133, 46, 255), (66, 28, 10, 255))
        draw.text((148, 456), "Quy trinh ro rang", fill=(242, 104, 43, 255), font=load_font(FONT_BOLD, 32))
        yy = 530
        for line in textwrap.wrap(body, width=28):
            draw.text((148, yy), line, fill=(73, 68, 63, 255), font=body_font)
            yy += 42
        draw.rounded_rectangle((90, 940, 1110, 1060), radius=28, fill=(18, 22, 31, 255))
        draw.text((128, 978), "MAYAOBONGRO.VN  |  Ho tro thiet ke theo yeu cau", fill=(255, 233, 220, 255), font=load_font(FONT_BOLD, 28))
        add_logo(canvas, 1200)
        canvas.convert("RGB").save(OUT_DIR / filename, quality=92)


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    palette = [
        (194, 50, 39),
        (232, 111, 55),
        (203, 60, 52),
        (120, 35, 32),
        (177, 76, 48),
        (149, 42, 30),
        (227, 97, 35),
    ]
    for index, (_, filename, title, subtitle) in enumerate(COVER_POSTS):
        create_cover(filename, title, subtitle, palette[index % len(palette)])
    create_infographic()
    create_process_images()


if __name__ == "__main__":
    main()
