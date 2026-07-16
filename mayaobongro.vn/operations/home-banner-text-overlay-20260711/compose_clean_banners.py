from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT / "output"

SIZES = {
    "desktop": (1920, 560),
    "tablet": (1365, 500),
    "mobile": (800, 200),
}


def cover(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    width, height = size
    scale = max(width / image.width, height / image.height)
    resized = image.resize(
        (round(image.width * scale), round(image.height * scale)),
        Image.Resampling.LANCZOS,
    )
    left = (resized.width - width) // 2
    top = (resized.height - height) // 2
    return resized.crop((left, top, left + width, top + height))


def main() -> None:
    OUTPUT.mkdir(exist_ok=True)

    for index in range(1, 4):
        source = Image.open(ROOT / f"slide-{index}-panorama.png").convert("RGB")
        for size_name, size in SIZES.items():
            image = cover(source, size)
            target = OUTPUT / f"mayaobongro-clean-hero-{index}-{size_name}-20260711.webp"
            image.save(target, "WEBP", quality=88, method=6)
            print(target)


if __name__ == "__main__":
    main()
