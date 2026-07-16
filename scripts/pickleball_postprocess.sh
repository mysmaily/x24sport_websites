#!/bin/zsh
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  scripts/pickleball_postprocess.sh INPUT OUTPUT [left|right] [contact_text]

Example:
  scripts/pickleball_postprocess.sh \
    operations/demo/generated/look-a.png \
    operations/demo/final/look-a.webp \
    right \
    "Zalo/Hotline 0989.353.247"

Notes:
  - Requires ImageMagick (`magick`) in PATH.
  - Adds a corner logo badge, optional contact pill, and the required
    vertical color-dot column.
EOF
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

if [[ $# -lt 3 || $# -gt 4 ]]; then
  usage >&2
  exit 1
fi

INPUT="$1"
OUTPUT="$2"
DOTS_SIDE="$3"
CONTACT_TEXT="${4:-}"

if [[ ! -f "$INPUT" ]]; then
  echo "Input not found: $INPUT" >&2
  exit 1
fi

case "$DOTS_SIDE" in
  left|right) ;;
  *)
    echo "dots side must be 'left' or 'right'" >&2
    exit 1
    ;;
esac

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
LOGO_SVG="$REPO_ROOT/mayaopickleball.vn/image-references/logo.svg"
LOGO_PNG="$REPO_ROOT/mayaopickleball.vn/image-references/logo.png"
CONTACT_FONT_FILE="/System/Library/Fonts/Supplemental/Arial.ttf"

if [[ ! -f "$LOGO_SVG" && ! -f "$LOGO_PNG" ]]; then
  echo "No logo asset found in mayaopickleball.vn/image-references" >&2
  exit 1
fi

if [[ ! -f "$CONTACT_FONT_FILE" ]]; then
  echo "Missing contact font: $CONTACT_FONT_FILE" >&2
  exit 1
fi

TMP_DIR="$(mktemp -d "${TMPDIR:-/tmp}/pickleball-postprocess.XXXXXX")"
cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

mkdir -p "$(dirname "$OUTPUT")"

WIDTH="$(magick identify -format '%w' "$INPUT")"
HEIGHT="$(magick identify -format '%h' "$INPUT")"
CANVAS="$([[ "$WIDTH" -lt "$HEIGHT" ]] && echo "$WIDTH" || echo "$HEIGHT")"

BADGE_W=$(( CANVAS * 24 / 100 ))
if (( BADGE_W < 220 )); then BADGE_W=220; fi
if (( BADGE_W > 320 )); then BADGE_W=320; fi
BADGE_H=$(( BADGE_W * 34 / 100 ))
if (( BADGE_H < 84 )); then BADGE_H=84; fi
BADGE_RADIUS=$(( BADGE_H / 2 - 2 ))
BADGE_BORDER=2
BADGE_OFFSET_X=$(( CANVAS * 3 / 100 ))
BADGE_OFFSET_Y=$(( CANVAS * 3 / 100 ))

LOGO_RENDER_W=$(( BADGE_W * 78 / 100 ))
if (( LOGO_RENDER_W < 180 )); then LOGO_RENDER_W=180; fi

DOT_R=$(( CANVAS * 14 / 1000 ))
if (( DOT_R < 14 )); then DOT_R=14; fi
if (( DOT_R > 18 )); then DOT_R=18; fi
DOT_STEP=$(( DOT_R * 3 ))
DOT_TOP=$(( CANVAS * 23 / 100 ))
if (( DOT_TOP < 220 )); then DOT_TOP=220; fi
DOT_X_LEFT=$(( BADGE_OFFSET_X + DOT_R + 10 ))
DOT_X_RIGHT=$(( WIDTH - BADGE_OFFSET_X - DOT_R - 10 ))
DOT_X="$DOT_X_RIGHT"
if [[ "$DOTS_SIDE" == "left" ]]; then
  DOT_X="$DOT_X_LEFT"
fi

CONTACT_W=$(( CANVAS * 34 / 100 ))
if (( CONTACT_W < 320 )); then CONTACT_W=320; fi
if (( CONTACT_W > 520 )); then CONTACT_W=520; fi
CONTACT_H=$(( CANVAS * 7 / 100 ))
if (( CONTACT_H < 56 )); then CONTACT_H=56; fi
CONTACT_FONT=$(( CONTACT_H * 42 / 100 ))
if (( CONTACT_FONT < 20 )); then CONTACT_FONT=20; fi

if [[ -f "$LOGO_SVG" ]]; then
  magick -background none "$LOGO_SVG" -resize "${LOGO_RENDER_W}x${LOGO_RENDER_W}" "$TMP_DIR/logo.png"
else
  magick "$LOGO_PNG" -resize "${LOGO_RENDER_W}x${LOGO_RENDER_W}" "$TMP_DIR/logo.png"
fi

magick -size "${BADGE_W}x${BADGE_H}" xc:none \
  -fill 'rgba(255,255,255,0.42)' \
  -draw "roundrectangle 2,2 $((BADGE_W-2)),$((BADGE_H-2)) ${BADGE_RADIUS},${BADGE_RADIUS}" \
  -stroke 'rgba(255,255,255,0.88)' -strokewidth "$BADGE_BORDER" -fill none \
  -draw "roundrectangle 2,2 $((BADGE_W-2)),$((BADGE_H-2)) ${BADGE_RADIUS},${BADGE_RADIUS}" \
  "$TMP_DIR/watermark-badge.png"

magick "$INPUT" "$TMP_DIR/watermark-badge.png" \
  -gravity southeast -geometry "+${BADGE_OFFSET_X}+${BADGE_OFFSET_Y}" -composite \
  "$TMP_DIR/step1.png"

magick "$TMP_DIR/step1.png" "$TMP_DIR/logo.png" \
  -gravity southeast -geometry "+$((BADGE_OFFSET_X + BADGE_W / 10))+${BADGE_OFFSET_Y}" -composite \
  "$TMP_DIR/step2.png"

CURRENT="$TMP_DIR/step2.png"

if [[ -n "$CONTACT_TEXT" ]]; then
  magick -size "${CONTACT_W}x${CONTACT_H}" xc:none \
    -fill 'rgba(255,255,255,0.34)' \
    -draw "roundrectangle 2,2 $((CONTACT_W-2)),$((CONTACT_H-2)) $((CONTACT_H/2)),$((CONTACT_H/2))" \
    -stroke 'rgba(255,255,255,0.82)' -strokewidth 2 -fill none \
    -draw "roundrectangle 2,2 $((CONTACT_W-2)),$((CONTACT_H-2)) $((CONTACT_H/2)),$((CONTACT_H/2))" \
    -fill 'rgba(28,28,28,0.96)' -stroke none \
    -font "$CONTACT_FONT_FILE" -gravity center -pointsize "$CONTACT_FONT" \
    -annotate +0+0 "$CONTACT_TEXT" \
    "$TMP_DIR/contact-pill.png"

  magick "$CURRENT" "$TMP_DIR/contact-pill.png" \
    -gravity south -geometry "+0+${BADGE_OFFSET_Y}" -composite \
    "$TMP_DIR/step3.png"
  CURRENT="$TMP_DIR/step3.png"
fi

magick "$CURRENT" \
  -fill white -stroke 'rgba(60,60,60,0.45)' -strokewidth 2 \
  -draw "circle ${DOT_X},${DOT_TOP} ${DOT_X},$((DOT_TOP + DOT_R))" \
  -fill black -draw "circle ${DOT_X},$((DOT_TOP + DOT_STEP)) ${DOT_X},$((DOT_TOP + DOT_STEP + DOT_R))" \
  -fill '#ff7cab' -draw "circle ${DOT_X},$((DOT_TOP + DOT_STEP * 2)) ${DOT_X},$((DOT_TOP + DOT_STEP * 2 + DOT_R))" \
  -fill '#e53b3b' -draw "circle ${DOT_X},$((DOT_TOP + DOT_STEP * 3)) ${DOT_X},$((DOT_TOP + DOT_STEP * 3 + DOT_R))" \
  -fill '#f2d03b' -draw "circle ${DOT_X},$((DOT_TOP + DOT_STEP * 4)) ${DOT_X},$((DOT_TOP + DOT_STEP * 4 + DOT_R))" \
  -fill '#2b6fff' -draw "circle ${DOT_X},$((DOT_TOP + DOT_STEP * 5)) ${DOT_X},$((DOT_TOP + DOT_STEP * 5 + DOT_R))" \
  -fill '#20a65a' -draw "circle ${DOT_X},$((DOT_TOP + DOT_STEP * 6)) ${DOT_X},$((DOT_TOP + DOT_STEP * 6 + DOT_R))" \
  -fill 'rgba(255,255,255,0.84)' -draw "circle ${DOT_X},$((DOT_TOP + DOT_STEP * 7)) ${DOT_X},$((DOT_TOP + DOT_STEP * 7 + DOT_R))" \
  -fill '#202020' -stroke none \
  -draw "rectangle $((DOT_X - DOT_R / 2)),$((DOT_TOP + DOT_STEP * 7 - 2)) $((DOT_X + DOT_R / 2)),$((DOT_TOP + DOT_STEP * 7 + 2))" \
  -draw "rectangle $((DOT_X - 2)),$((DOT_TOP + DOT_STEP * 7 - DOT_R / 2)) $((DOT_X + 2)),$((DOT_TOP + DOT_STEP * 7 + DOT_R / 2))" \
  -quality 84 "$OUTPUT"
