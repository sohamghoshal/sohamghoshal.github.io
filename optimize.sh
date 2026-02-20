#!/bin/bash
# optimize.sh — compress + resize all album JPGs for web (uses macOS sips)
set -u
IMAGES="/Users/soham/Desktop/portfolio-website/images"
OPT="$IMAGES/opt"

SLUGS=(
  "acadia-maine"
  "amsterdam-netherlands"
  "ciudad-de-mexico-mexico"
  "connecticut"
  "grand-teton-np-wyoming"
  "joshua-tree-np-california"
  "kyoto-osaka-japan"
  "manila-philippines"
  "paris-france"
  "philadelphia-pennsylvania"
  "portraits"
  "provincetown-cape-cod"
  "san-diego-california"
  "tokyo-japan"
  "tokyo-pt-2-japan"
  "white-mountains-new-hampshire"
  "yellowstone-np-wyoming"
  "yosemite-california"
)

mkdir -p "$OPT/covers"

for slug in "${SLUGS[@]}"; do
  mkdir -p "$OPT/$slug"
  echo "[$slug]"
  n=1
  while IFS= read -r jpg; do
    num=$(printf "%02d" $n)
    sips -Z 1920 --setProperty formatOptions 80 "$jpg" --out "$OPT/$slug/$num.jpg" 2>/dev/null
    echo "  $num.jpg"
    ((n++))
  done < <(find "$IMAGES/$slug" -maxdepth 1 \( -iname "*.jpg" -o -iname "*.jpeg" \) | sort)

  # Cover: first photo at 1200px max, slightly higher quality for grid display
  first=$(find "$IMAGES/$slug" -maxdepth 1 \( -iname "*.jpg" -o -iname "*.jpeg" \) | sort | head -1)
  if [ -n "$first" ]; then
    sips -Z 1200 --setProperty formatOptions 82 "$first" --out "$OPT/covers/$slug.jpg" 2>/dev/null
    echo "  cover → $slug.jpg"
  fi
done

# Music pics
mkdir -p "$OPT/music"
echo "[music]"
n=1
while IFS= read -r jpg; do
  num=$(printf "%02d" $n)
  sips -Z 1200 --setProperty formatOptions 82 "$jpg" --out "$OPT/music/$num.jpg" 2>/dev/null
  echo "  $num.jpg"
  ((n++))
done < <(find "$IMAGES/Music pics" -maxdepth 1 \( -iname "*.jpg" -o -iname "*.jpeg" \) | sort)

echo ""
echo "Done! Optimized files are in images/opt/"
