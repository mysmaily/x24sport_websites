#!/usr/bin/env python3
"""Create randomized group/logo/corner preferences for image variants."""

from __future__ import annotations

import argparse
import json
import random


GROUP_COUNTS = [3, 4, 5, 6, 7]
LOGOS = ["mayaodongphuc-horizontal.png", "mayaodongphuc-vertical.png"]
CORNERS = ["top-left", "top-right", "bottom-left", "bottom-right"]


def refill(values: list, rng: random.Random, previous: object | None) -> list:
    pool = list(values)
    rng.shuffle(pool)
    if previous is not None and pool[0] == previous and len(pool) > 1:
        pool[0], pool[1] = pool[1], pool[0]
    return pool


def plan(count: int, rng: random.Random) -> list[dict[str, object]]:
    result: list[dict[str, object]] = []
    count_pool: list[int] = []
    logo_pool: list[str] = []
    previous_count: int | None = None
    previous_logo: str | None = None

    for index in range(count):
        if not count_pool:
            count_pool = refill(GROUP_COUNTS, rng, previous_count)
        if not logo_pool:
            logo_pool = refill(LOGOS, rng, previous_logo)
        group_count = count_pool.pop(0)
        logo = logo_pool.pop(0)
        corner_priority = list(CORNERS)
        rng.shuffle(corner_priority)
        result.append(
            {
                "variant": index + 1,
                "group_count": group_count,
                "logo": logo,
                "corner_priority": corner_priority,
                "note": "Use the first corner that does not overlap faces, hair, hands, garments, or key action.",
            }
        )
        previous_count = group_count
        previous_logo = logo
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
