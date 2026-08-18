#!/usr/bin/env python3
"""Create varied, catalog-friendly group and overlay preferences."""
from __future__ import annotations
import argparse, json, random

# Weighted toward 3–5 people because garment fidelity and anatomy are more reliable
# at ecommerce viewing sizes. 6–7 remain available for wider lifestyle scenes.
GROUP_COUNTS = [3, 3, 4, 4, 4, 5, 5, 6, 7]
OVERLAY_CORNERS = ["top-left", "top-right", "bottom-left", "bottom-right"]
THEMES = ["dark", "light"]
LAYOUTS = ["row", "grid", "rail"]
SLOGANS = [
    "ONE TEAM", "BETTER TOGETHER", "WE ARE ONE", "STRONGER TOGETHER",
    "EXPLORE TOGETHER", "OUTDOOR CREW", "GO EXPLORE", "ALL IN",
    "GOOD VIBES", "ONE TEAM • ONE DREAM", "TOGETHER WE WIN",
    "CAMP • EXPLORE • REPEAT", "CÙNG NHAU BỨT PHÁ", "KẾT NỐI • BỨT PHÁ",
]

def pick_not_previous(values, rng, previous=None):
    choices = [v for v in values if v != previous] or list(values)
    return rng.choice(choices)

def plan(count: int, rng: random.Random) -> list[dict[str, object]]:
    result=[]; prev_count=prev_corner=prev_theme=prev_layout=prev_slogan=None
    for index in range(count):
        group_count=pick_not_previous(GROUP_COUNTS,rng,prev_count)
        overlay_corner=pick_not_previous(OVERLAY_CORNERS,rng,prev_corner)
        theme=pick_not_previous(THEMES,rng,prev_theme)
        layout=pick_not_previous(LAYOUTS,rng,prev_layout)
        slogan=pick_not_previous(SLOGANS,rng,prev_slogan)
        result.append({
            "variant": index+1,
            "group_count": group_count,
            "shirt_slogan": slogan,
            "logo": "mayaodongphuc-vertical.png",
            "overlay_corner": overlay_corner,
            "theme": theme,
            "layout": layout,
            "note": "Treat shirt slogan as designed garment artwork: build a deliberate typographic lockup, integrate it with perspective/folds, and reject plain typed text. Overlay preferences are secondary and must yield to faces and garment details."
        })
        prev_count,prev_corner,prev_theme,prev_layout,prev_slogan=group_count,overlay_corner,theme,layout,slogan
    return result

def main() -> int:
    p=argparse.ArgumentParser(); p.add_argument("--count",type=int,default=1); p.add_argument("--seed",type=int)
    a=p.parse_args()
    if a.count < 1: p.error("--count must be at least 1")
    rng=random.Random(a.seed) if a.seed is not None else random.SystemRandom()
    print(json.dumps(plan(a.count,rng),ensure_ascii=False,indent=2)); return 0
if __name__ == "__main__": raise SystemExit(main())
