#!/bin/zsh
set -euo pipefail

ROOT="/Users/hoang/hacado/wordpress_websites/mayaopickleball.vn/operations/pickleball-single-product-20260709/do-cam-noi-bat-674"
GEN="$ROOT/generated"
FINAL="$ROOT/final"
TMP="$ROOT/tmp"
LOGO_SVG="/Users/hoang/hacado/wordpress_websites/mayaopickleball.vn/image-references/logo.svg"

mkdir -p "$FINAL" "$TMP"

magick -background none "$LOGO_SVG" -resize 240x240 "$TMP/watermark-logo.png"

build_badge() {
  magick -size 286x96 xc:none \
    -fill 'rgba(255,255,255,0.42)' -draw 'roundrectangle 2,2 284,94 46,46' \
    -stroke 'rgba(255,255,255,0.88)' -strokewidth 2 -fill none -draw 'roundrectangle 2,2 284,94 46,46' \
    "$TMP/watermark-badge.png"
}

process_image() {
  local input="$1"
  local output="$2"
  local dots_side="$3"
  local dot_x="54"

  if [[ "$dots_side" == "right" ]]; then
    dot_x="1096"
  fi

  build_badge

  magick "$input" "$TMP/watermark-badge.png" \
    -gravity southeast -geometry +32+30 -composite \
    "$TMP/step1.png"

  magick "$TMP/step1.png" "$TMP/watermark-logo.png" \
    -gravity southeast -geometry +55+50 -composite \
    "$TMP/step2.png"

  magick "$TMP/step2.png" \
    -fill white -stroke 'rgba(60,60,60,0.45)' -strokewidth 2 \
    -draw "circle ${dot_x},270 ${dot_x},286" \
    -fill black -draw "circle ${dot_x},320 ${dot_x},336" \
    -fill '#ff7cab' -draw "circle ${dot_x},370 ${dot_x},386" \
    -fill '#e53b3b' -draw "circle ${dot_x},420 ${dot_x},436" \
    -fill '#f2d03b' -draw "circle ${dot_x},470 ${dot_x},486" \
    -fill '#2b6fff' -draw "circle ${dot_x},520 ${dot_x},536" \
    -fill '#20a65a' -draw "circle ${dot_x},570 ${dot_x},586" \
    -fill 'rgba(255,255,255,0.84)' -draw "circle ${dot_x},620 ${dot_x},636" \
    -fill '#202020' -stroke none \
    -draw "rectangle $((dot_x-10)),618 $((dot_x+10)),622" \
    -draw "rectangle $((dot_x-2)),610 $((dot_x+2)),630" \
    -resize 1200x1200^ -gravity center -extent 1200x1200 \
    -quality 84 "$output"
}

process_image "$GEN/x24-pb-015-image-a.png" "$FINAL/x24-pb-015-ao-pickleball-nam-nu-co-co-tay-ngan-xanh-la-vang.webp" right
process_image "$GEN/x24-pb-015-image-b.png" "$FINAL/x24-pb-015-ao-pickleball-nam-3-lo-nu-khong-tay-co-co-xanh-la-vang.webp" left
