#!/usr/bin/env bash
set -euo pipefail

# Deterministic post-processing for final WooCommerce upload assets.
# Usage:
#   scripts/pickleball_postprocess.sh INPUT.png OUTPUT.webp [left|right]
#
# Fixed behavior:
# - Uses image-references/logo.svg first.
# - Falls back to image-references/logo.png only if SVG rendering fails/unavailable.
# - Never creates a plain text X24 logo badge.
# - Adds contact pill: mayaopickleball.vn | Hotline/Zalo: 0989.353.247
# - Adds color dots: Trắng, Đen, Hồng, Đỏ, Vàng, Xanh Blue, Green, +

INPUT="${1:-}"
OUTPUT="${2:-}"
DOT_SIDE="${3:-right}"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOGO_SVG="$ROOT_DIR/image-references/logo.svg"
LOGO_PNG="$ROOT_DIR/image-references/logo.png"
CONTACT_TEXT="mayaopickleball.vn | Hotline/Zalo: 0989.353.247"

if [[ -z "$INPUT" || -z "$OUTPUT" ]]; then
  echo "Usage: $0 INPUT.png OUTPUT.webp [left|right]" >&2
  exit 2
fi
if [[ ! -f "$INPUT" ]]; then
  echo "Input not found: $INPUT" >&2
  exit 1
fi
if [[ "$DOT_SIDE" != "left" && "$DOT_SIDE" != "right" ]]; then
  echo "Dot side must be left or right" >&2
  exit 2
fi
if ! command -v magick >/dev/null 2>&1; then
  echo "ImageMagick 'magick' command is required" >&2
  exit 1
fi

WORK_DIR="$(mktemp -d)"
trap 'rm -rf "$WORK_DIR"' EXIT

BASE="$WORK_DIR/base.png"
LOGO_RENDERED="$WORK_DIR/logo.png"
DOTS="$WORK_DIR/dots.png"
CONTACT="$WORK_DIR/contact.png"

magick "$INPUT" -auto-orient -resize 1200x1200^ -gravity center -extent 1200x1200 "$BASE"

LOGO_SOURCE=""
if [[ -f "$LOGO_SVG" ]] && command -v rsvg-convert >/dev/null 2>&1; then
  if rsvg-convert -w 768 "$LOGO_SVG" -o "$LOGO_RENDERED"; then
    LOGO_SOURCE="svg"
  fi
fi

if [[ -z "$LOGO_SOURCE" && -f "$LOGO_PNG" ]]; then
  magick "$LOGO_PNG" -resize 768x "$LOGO_RENDERED"
  LOGO_SOURCE="png"
fi

if [[ -z "$LOGO_SOURCE" ]]; then
  echo "Official logo not available. Expected SVG: $LOGO_SVG or PNG fallback: $LOGO_PNG" >&2
  echo "Plain text X24 badge fallback is forbidden." >&2
  exit 1
fi

# Compact circular watermark badge, using the official logo asset inside a subtle backing.
BADGE="$WORK_DIR/badge.png"
magick -size 184x184 xc:none \
  -fill 'rgba(255,255,255,0.42)' -stroke 'rgba(255,255,255,0.85)' -strokewidth 2 \
  -draw 'circle 92,92 92,4' \
  "$BADGE"
magick "$LOGO_RENDERED" -trim +repage -resize 170x132 -alpha set -channel A -evaluate multiply 0.94 +channel "$WORK_DIR/logo_small.png"
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
  -fill '#222222' -stroke none -font DejaVu-Sans-Bold -pointsize 34 -gravity NorthWest -annotate +22+468 '+' \
  "$DOTS"

# Single-line compact contact pill, matching the basketball-style contract.
magick -size 760x58 xc:none \
  -fill 'rgba(30,30,30,0.54)' -stroke 'rgba(255,255,255,0.82)' -strokewidth 2 \
  -draw 'roundrectangle 0,0 760,58 29,29' \
  -fill white -font DejaVu-Sans-Bold -pointsize 28 -gravity Center -annotate +0+0 "$CONTACT_TEXT" \
  "$CONTACT"

if [[ "$DOT_SIDE" == "left" ]]; then
  DOT_GRAVITY="West"; DOT_OFFSET="+28+0"; BADGE_GRAVITY="NorthEast"; BADGE_OFFSET="+28+28"
else
  DOT_GRAVITY="East"; DOT_OFFSET="+28+0"; BADGE_GRAVITY="NorthWest"; BADGE_OFFSET="+28+28"
fi

magick "$BASE" \
  "$DOTS" -gravity "$DOT_GRAVITY" -geometry "$DOT_OFFSET" -composite \
  "$BADGE" -gravity "$BADGE_GRAVITY" -geometry "$BADGE_OFFSET" -composite \
  "$WORK_DIR/with_brand.png"

magick "$WORK_DIR/with_brand.png" "$CONTACT" -gravity South -geometry +0+28 -composite -quality 84 "$OUTPUT"

echo "Wrote $OUTPUT"
echo "branding.logo_source=$LOGO_SOURCE"
echo "branding.contact_overlay_present=true"
echo "branding.color_dots_present=true"
