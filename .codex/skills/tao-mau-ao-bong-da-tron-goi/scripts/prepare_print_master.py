#!/usr/bin/env python3
"""Prepare a full-bleed, print-sized PNG master without stretching the source."""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
import tempfile
from pathlib import Path

try:
    from PIL import Image, ImageColor, ImageOps, PngImagePlugin
except ImportError as error:
    raise SystemExit("Pillow is required") from error


MM_PER_INCH = 25.4
SAFE_LANCZOS_SCALE = 2.0
REALESRGAN_NATIVE_SCALE = 4
DEFAULT_MAX_TOTAL_UPSCALE = 8.0


def default_realesrgan_root() -> Path:
    return Path.home() / "Library" / "Caches" / "x24sport" / "realesrgan-ncnn-vulkan-v0.2.5.0"


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
        "--upscale-engine",
        choices=("auto", "lanczos", "realesrgan"),
        default="auto",
        help=(
            "auto uses Real-ESRGAN above 2x and Lanczos otherwise. "
            "Plain Lanczos is rejected above 2x because it cannot restore print detail."
        ),
    )
    parser.add_argument("--realesrgan-root", type=Path, default=default_realesrgan_root())
    parser.add_argument(
        "--realesrgan-model",
        choices=("realesrgan-x4plus", "realesrgan-x4plus-anime", "realesr-animevideov3"),
        default="realesrgan-x4plus",
        help="General x4plus is the print-artwork default; the other models may remove faint geometry.",
    )
    parser.add_argument("--realesrgan-tile", type=int, default=256)
    parser.add_argument("--realesrgan-tta", action="store_true", help="Enable slower test-time augmentation")
    parser.add_argument("--max-total-upscale", type=float, default=DEFAULT_MAX_TOTAL_UPSCALE)
    parser.add_argument(
        "--allow-unsafe-lanczos-upscale",
        action="store_true",
        help="Create a review-only Lanczos enlargement above 2x; delivery validation will reject it.",
    )
    parser.add_argument(
        "--max-source-aspect-drift",
        type=float,
        help="Reject source aspect ratios that differ from the target by more than this relative fraction.",
    )
    parser.add_argument("--overwrite", action="store_true")
    return parser.parse_args()


def crop_to_aspect(image: Image.Image, target_aspect: float) -> Image.Image:
    """Apply the cover crop before expensive restoration, without stretching."""
    source_aspect = image.width / image.height
    if abs(source_aspect - target_aspect) < 1e-9:
        return image
    if source_aspect > target_aspect:
        width = max(1, round(image.height * target_aspect))
        left = (image.width - width) // 2
        return image.crop((left, 0, left + width, image.height))
    height = max(1, round(image.width / target_aspect))
    top = (image.height - height) // 2
    return image.crop((0, top, image.width, top + height))


def run_realesrgan(
    image: Image.Image,
    *,
    root: Path,
    model: str,
    tile: int,
    tta: bool,
) -> Image.Image:
    root = root.expanduser().resolve()
    binary = root / "realesrgan-ncnn-vulkan"
    models = root / "models"
    model_file_stem = f"{model}-x4" if model == "realesr-animevideov3" else model
    required = [binary, models / f"{model_file_stem}.param", models / f"{model_file_stem}.bin"]
    missing = [str(path) for path in required if not path.is_file()]
    if missing:
        installer = Path(__file__).with_name("install_print_upscaler.py")
        raise SystemExit(
            "Real-ESRGAN print upscaler is not installed. Run: "
            f"{sys.executable} {installer} --destination {root}. Missing: {', '.join(missing)}"
        )
    if tile != 0 and tile < 32:
        raise SystemExit("--realesrgan-tile must be 0 (auto) or at least 32")

    with tempfile.TemporaryDirectory(prefix="x24-print-sr-") as temp_name:
        temp = Path(temp_name)
        sr_input = temp / "input.png"
        sr_output = temp / "output.png"
        image.save(sr_input, format="PNG", compress_level=1)
        command = [
            str(binary),
            "-i", str(sr_input),
            "-o", str(sr_output),
            "-m", str(models),
            "-n", model,
            "-s", str(REALESRGAN_NATIVE_SCALE),
            "-t", str(tile),
            "-f", "png",
        ]
        if tta:
            command.append("-x")
        completed = subprocess.run(command, capture_output=True, text=True, check=False)
        if completed.returncode != 0 or not sr_output.is_file():
            details = (completed.stderr or completed.stdout).strip()
            raise SystemExit(f"Real-ESRGAN failed: {details}")
        with Image.open(sr_output) as restored:
            restored.load()
            return restored.convert("RGB").copy()


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

    if args.max_total_upscale <= 0:
        raise SystemExit("--max-total-upscale must be positive")
    if args.fit == "cover":
        scale = max(target[0] / source_image.width, target[1] / source_image.height)
        prepared_source = crop_to_aspect(source_image, target_aspect)
    else:
        scale = min(target[0] / source_image.width, target[1] / source_image.height)
        prepared_source = source_image
    if scale > args.max_total_upscale:
        raise SystemExit(
            f"Required upscale {scale:.2f}x exceeds the {args.max_total_upscale:.2f}x print-quality limit. "
            "Regenerate a larger native master instead of inventing more raster detail."
        )

    upscale_engine = args.upscale_engine
    if upscale_engine == "auto":
        upscale_engine = "realesrgan" if scale > SAFE_LANCZOS_SCALE else "lanczos"
    if (
        upscale_engine == "lanczos"
        and scale > SAFE_LANCZOS_SCALE
        and not args.allow_unsafe_lanczos_upscale
    ):
        raise SystemExit(
            f"Lanczos-only upscale {scale:.2f}x is not print-safe. "
            "Install/use Real-ESRGAN or regenerate a larger native source."
        )

    sr_applied = upscale_engine == "realesrgan" and scale > 1.0
    if sr_applied:
        intermediate = run_realesrgan(
            prepared_source,
            root=args.realesrgan_root,
            model=args.realesrgan_model,
            tile=args.realesrgan_tile,
            tta=args.realesrgan_tta,
        )
    else:
        intermediate = prepared_source
    if args.fit == "cover":
        post_scale = max(target[0] / intermediate.width, target[1] / intermediate.height)
    else:
        post_scale = min(target[0] / intermediate.width, target[1] / intermediate.height)
    resized_size = (round(intermediate.width * post_scale), round(intermediate.height * post_scale))
    resized = intermediate.resize(resized_size, Image.Resampling.LANCZOS)

    if args.fit == "cover":
        left = max(0, (resized.width - target[0]) // 2)
        top = max(0, (resized.height - target[1]) // 2)
        canvas = resized.crop((left, top, left + target[0], top + target[1]))
    else:
        ImageColor.getrgb(args.background)
        canvas = Image.new("RGB", target, args.background)
        canvas.paste(resized, ((target[0] - resized.width) // 2, (target[1] - resized.height) // 2))

    output.parent.mkdir(parents=True, exist_ok=True)
    quality_gate = (
        "pass-super-resolution"
        if sr_applied
        else "pass-native-or-lanczos-under-2x"
        if scale <= SAFE_LANCZOS_SCALE
        else "review-only-unsafe-lanczos"
    )
    pnginfo = PngImagePlugin.PngInfo()
    pnginfo.add_text("x24.upscaleEngine", upscale_engine)
    pnginfo.add_text("x24.upscaleModel", args.realesrgan_model if sr_applied else "none")
    pnginfo.add_text("x24.sourcePixels", f"{source_pixels[0]}x{source_pixels[1]}")
    pnginfo.add_text("x24.scaleFactor", f"{scale:.6f}")
    pnginfo.add_text("x24.superResolutionScale", str(REALESRGAN_NATIVE_SCALE if sr_applied else 1))
    pnginfo.add_text("x24.postResizeScale", f"{post_scale:.6f}")
    pnginfo.add_text("x24.qualityGate", quality_gate)
    options: dict[str, object] = {
        "format": "PNG",
        "dpi": (args.ppi, args.ppi),
        "compress_level": 6,
        "pnginfo": pnginfo,
    }
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
        "upscaleEngine": upscale_engine,
        "upscaleModel": args.realesrgan_model if sr_applied else None,
        "superResolutionScale": REALESRGAN_NATIVE_SCALE if sr_applied else 1,
        "intermediatePixels": list(intermediate.size),
        "postResizeScale": round(post_scale, 4),
        "qualityGate": quality_gate,
        "fidelityWarning": scale > SAFE_LANCZOS_SCALE and not sr_applied,
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError) as error:
        print(f"Error: {error}", file=sys.stderr)
        raise SystemExit(1) from error
