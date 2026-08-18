#!/usr/bin/env python3
"""Create varied, catalog-friendly group and overlay preferences."""
from __future__ import annotations
import argparse, json, random

# Weighted toward 3–5 people because garment fidelity and anatomy are more reliable
# at ecommerce viewing sizes. 6–7 remain available for wider lifestyle scenes.
GROUP_COUNTS = [3, 3, 4, 4, 4, 5, 5, 6, 7]
OVERLAY_CORNERS = ["top-left", "top-right", "bottom-left", "bottom-right"]
THEMES = ["dark", "light"]
LAYOUTS = ["single-hero"] * 45 + ["campaign-composite-3"] * 35 + ["front-back-showcase"] * 20
OVERLAY_SYSTEMS = ["side-editorial-panel", "continuous-bottom-band", "side-editorial-panel", "continuous-bottom-band", "light-rail"]
PRODUCTION_OVERLAY_SYSTEMS = ["continuous-bottom-band", "continuous-bottom-band", "side-editorial-panel"]
SLOGANS = [
    "ONE TEAM", "BETTER TOGETHER", "WE ARE ONE", "STRONGER TOGETHER",
    "EXPLORE TOGETHER", "OUTDOOR CREW", "GO EXPLORE", "ALL IN",
    "GOOD VIBES", "ONE TEAM • ONE DREAM", "TOGETHER WE WIN",
    "CAMP • EXPLORE • REPEAT", "CÙNG NHAU BỨT PHÁ", "KẾT NỐI • BỨT PHÁ",
]
PRODUCTION_SLOGANS = [
    "ONE TEAM ONE DREAM / TOGETHER WE WIN",
    "ONE TEAM • ONE DREAM",
    "TOGETHER WE WIN",
    "EXPLORE TOGETHER",
]

def pick_not_previous(values, rng, previous=None):
    choices = [v for v in values if v != previous] or list(values)
    return rng.choice(choices)

def plan(count: int, rng: random.Random, production_campaign: bool = False, slogan_override: str | None = None) -> list[dict[str, object]]:
    result=[]; prev_count=prev_corner=prev_theme=prev_layout=prev_slogan=None
    for index in range(count):
        group_count=pick_not_previous([4, 4, 5, 5], rng, prev_count) if production_campaign else pick_not_previous(GROUP_COUNTS,rng,prev_count)
        overlay_corner=pick_not_previous(OVERLAY_CORNERS,rng,prev_corner)
        theme="dark" if production_campaign else pick_not_previous(THEMES,rng,prev_theme)
        layout=pick_not_previous(["campaign-composite-3", "front-back-showcase"], rng, prev_layout) if production_campaign else pick_not_previous(LAYOUTS,rng,prev_layout)
        overlay_system=rng.choice(PRODUCTION_OVERLAY_SYSTEMS if production_campaign else OVERLAY_SYSTEMS)
        slogan=slogan_override or pick_not_previous(PRODUCTION_SLOGANS if production_campaign else SLOGANS,rng,prev_slogan)
        result.append({
            "variant": index+1,
            "group_count": group_count,
            "shirt_slogan": slogan,
            "shirt_slogan_required": production_campaign,
            "back_view_required": production_campaign,
            "logo": "mayaodongphuc-vertical.png",
            "overlay_corner": overlay_corner,
            "theme": theme,
            "layout_preset": layout,
            "overlay_system": overlay_system,
            "bottom_band": {
                "enabled": True,
                "height_fraction": 0.10,
                "default_color": "#740e26",
                "default_alpha": 188,
            },
            "note": "Production mode requires designer-quality shirt slogan artwork and at least one natural back-facing wearer when the brief includes slogan/back-print references. Treat shirt slogan as garment artwork: exact spelling, hierarchy, ink colors from the garment palette, perspective/folds, and no gibberish. For catalog overlay, prefer one continuous 10% translucent bottom band derived from the garment color; avoid disconnected cards and loose text on busy photo areas."
        })
        prev_count,prev_corner,prev_theme,prev_layout,prev_slogan=group_count,overlay_corner,theme,layout,slogan
    return result

def main() -> int:
    p=argparse.ArgumentParser(); p.add_argument("--count",type=int,default=1); p.add_argument("--seed",type=int)
    p.add_argument("--production-campaign", action="store_true", help="Prefer campaign/front-back layouts, slogan artwork, back view, and 10% bottom-band overlay")
    p.add_argument("--slogan", help="Lock exact campaign slogan copy across all planned variants")
    a=p.parse_args()
    if a.count < 1: p.error("--count must be at least 1")
    rng=random.Random(a.seed) if a.seed is not None else random.SystemRandom()
    print(json.dumps(plan(a.count,rng,a.production_campaign,a.slogan),ensure_ascii=False,indent=2)); return 0
if __name__ == "__main__": raise SystemExit(main())
