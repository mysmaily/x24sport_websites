#!/usr/bin/env bash
set -euo pipefail

# Deterministic post-processing placeholder for final WooCommerce upload assets.
#
# Usage:
#   scripts/pickleball_postprocess.sh INPUT.png OUTPUT.webp left [CONTACT_TEXT]
#   scripts/pickleball_postprocess.sh INPUT.png OUTPUT.webp right [CONTACT_TEXT]
#
# Notes:
# - Run only on newly generated pickleball base images that already passed QA.
# - Do not run this directly on old mayaochaybo.vn/running catalog images.
# - CONTACT_TEXT is optional and must be verified for mayaopickleball.vn before use.
# - Requires ImageMagick. SVG logo rendering is attempted with rsvg-convert when available.

INPUT="${1:-}"
OUTPUT="${2:-}"
DOT_SIDE="${3:-right}"
CONTACT_TEXT="${4:-}"
DEFAULT_FONT_BOLD="/System/Library/Fonts/Supplemental/Verdana Bold.ttf"
DEFAULT_FONT_REGULAR="/System/Library/Fonts/Helvetica.ttc"

if [[ -z "$INPUT" || -z "$OUTPUT" ]]; then
  echo "Usage: $0 INPUT.png OUTPUT.webp left|right [CONTACT_TEXT]" >&2
  exit 2
fi

if [[ "$DOT_SIDE" != "left" && "$DOT_SIDE" != "right" ]]; then
  echo "DOT_SIDE must be left or right" >&2
  exit 2
fi

if [[ ! -f "$INPUT" ]]; then
  echo "Input not found: $INPUT" >&2
  exit 1
fi

if ! command -v magick >/dev/null 2>&1; then
  echo "ImageMagick 'magick' command is required" >&2
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOGO_SVG="$ROOT_DIR/image-references/logo.svg"
LOGO_PNG="$ROOT_DIR/image-references/logo.png"
WORK_DIR="$(mktemp -d)"
trap 'rm -rf "$WORK_DIR"' EXIT

BASE="$WORK_DIR/base.png"
LOGO_RENDERED="$WORK_DIR/logo.png"
DOTS="$WORK_DIR/dots.png"
CONTACT="$WORK_DIR/contact.png"

# Normalize square output baseline. Keep source crop; resize to 1200x1200 for upload candidate.
magick "$INPUT" -auto-orient -resize 1200x1200^ -gravity center -extent 1200x1200 "$BASE"

# Render/find logo.
if [[ -f "$LOGO_SVG" ]] && command -v rsvg-convert >/dev/null 2>&1; then
  rsvg-convert -w 768 "$LOGO_SVG" -o "$LOGO_RENDERED"
elif [[ -f "$LOGO_PNG" ]]; then
  magick "$LOGO_PNG" -resize 768x "$LOGO_RENDERED"
else
  # Fallback text badge if no logo source is available in a local test environment.
  magick -size 768x240 xc:none -gravity center -font "$DEFAULT_FONT_BOLD" -pointsize 96 -fill black -annotate +0+0 'X24' "$LOGO_RENDERED"
fi

# Watermark badge.
BADGE="$WORK_DIR/badge.png"
magick -size 270x120 xc:none \
  -fill 'rgba(255,255,255,0.45)' -stroke 'rgba(255,255,255,0.85)' -strokewidth 2 \
  -draw 'roundrectangle 0,0 270,120 60,60' \
  "$BADGE"
magick "$LOGO_RENDERED" -resize 210x90 -alpha set -channel A -evaluate multiply 0.9 +channel "$WORK_DIR/logo_small.png"
magick "$BADGE" "$WORK_DIR/logo_small.png" -gravity center -composite "$BADGE"

# Color dots: Trắng, Đen, Hồng, Đỏ, Vàng, Xanh Blue, Green, +
magick -size 64x520 xc:none \
  -fill white -stroke '#555555' -strokewidth 2 -draw 'circle 32,32 32,12' \
  -fill black -stroke white -draw 'circle 32,96 32,76' \
  -fill '#ff8fbd' -stroke white -draw 'circle 32,160 32,140' \
  -fill '#e53935' -stroke white -draw 'circle 32,224 32,204' \
  -fill '#ffd43b' -stroke '#777777' -draw 'circle 32,288 32,268' \
  -fill '#1e88e5' -stroke white -draw 'circle 32,352 32,332' \
  -fill '#43a047' -stroke white -draw 'circle 32,416 32,396' \
  -fill white -stroke '#555555' -strokewidth 2 -draw 'roundrectangle 12,468 52,508 14,14' \
  -fill '#222222' -stroke none -font "$DEFAULT_FONT_BOLD" -pointsize 34 -gravity NorthWest -annotate +22+468 '+' \
  "$DOTS"

# Optional contact pill.
COMPOSE_ARGS=("$BASE")
if [[ -n "$CONTACT_TEXT" ]]; then
  magick -size 620x58 xc:none \
    -fill 'rgba(255,255,255,0.55)' -stroke 'rgba(255,255,255,0.85)' -strokewidth 2 \
    -draw 'roundrectangle 0,0 620,58 29,29' \
    -fill '#111111' -font "$DEFAULT_FONT_REGULAR" -pointsize 28 -gravity center -annotate +0+0 "$CONTACT_TEXT" \
    "$CONTACT"
fi

# Composite positions.
if [[ "$DOT_SIDE" == "left" ]]; then
  DOT_GRAVITY="West"
  DOT_OFFSET="+28+0"
  BADGE_GRAVITY="NorthEast"
  BADGE_OFFSET="+28+28"
else
  DOT_GRAVITY="East"
  DOT_OFFSET="+28+0"
  BADGE_GRAVITY="NorthWest"
  BADGE_OFFSET="+28+28"
fi

magick "$BASE" \
  "$DOTS" -gravity "$DOT_GRAVITY" -geometry "$DOT_OFFSET" -composite \
  "$BADGE" -gravity "$BADGE_GRAVITY" -geometry "$BADGE_OFFSET" -composite \
  "$WORK_DIR/with_brand.png"

if [[ -n "$CONTACT_TEXT" ]]; then
  magick "$WORK_DIR/with_brand.png" "$CONTACT" -gravity South -geometry +0+28 -composite -quality 84 "$OUTPUT"
else
  magick "$WORK_DIR/with_brand.png" -quality 84 "$OUTPUT"
fi

echo "Wrote $OUTPUT"
