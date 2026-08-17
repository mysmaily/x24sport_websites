#!/usr/bin/env python3
"""Create randomized group and catalog-overlay preferences for image variants."""

from __future__ import annotations

import argparse
import json
import random


GROUP_COUNTS = [3, 4, 5, 6, 7]
OVERLAY_CORNERS = ["top-left", "top-right", "bottom-left", "bottom-right"]
THEMES = ["dark", "light"]
LAYOUTS = ["row", "grid"]


def refill(values: list, rng: random.Random, previous: object | None) -> list:
    pool = list(values)
    rng.shuffle(pool)
    if previous is not None and pool[0] == previous and len(pool) > 1:
        pool[0], pool[1] = pool[1], pool[0]
    return pool


def plan(count: int, rng: random.Random) -> list[dict[str, object]]:
    result: list[dict[str, object]] = []
    count_pool: list[int] = []
    corner_pool: list[str] = []
    theme_pool: list[str] = []
    layout_pool: list[str] = []
    previous_count: int | None = None
    previous_corner: str | None = None
    previous_theme: str | None = None
    previous_layout: str | None = None

    for index in range(count):
        if not count_pool:
            count_pool = refill(GROUP_COUNTS, rng, previous_count)
        if not corner_pool:
            corner_pool = refill(OVERLAY_CORNERS, rng, previous_corner)
        if not theme_pool:
            theme_pool = refill(THEMES, rng, previous_theme)
        if not layout_pool:
            layout_pool = refill(LAYOUTS, rng, previous_layout)
        group_count = count_pool.pop(0)
        overlay_corner = corner_pool.pop(0)
        theme = theme_pool.pop(0)
        layout = layout_pool.pop(0)
        result.append(
            {
                "variant": index + 1,
                "group_count": group_count,
                "logo": "mayaodongphuc-vertical.png",
                "overlay_corner": overlay_corner,
                "theme": theme,
                "layout": layout,
                "note": "Use a quiet corner and switch theme for contrast; never move the whole group aside for the overlay.",
            }
        )
        previous_count = group_count
        previous_corner = overlay_corner
        previous_theme = theme
        previous_layout = layout
    return result


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--count", type=int, default=1)
    parser.add_argument("--seed", type=int)
    args = parser.parse_args()
    if args.count < 1:
        parser.error("--count must be at least 1")
    rng = random.Random(args.seed) if args.seed is not None else random.SystemRandom()
    print(json.dumps(plan(args.count, rng), ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
