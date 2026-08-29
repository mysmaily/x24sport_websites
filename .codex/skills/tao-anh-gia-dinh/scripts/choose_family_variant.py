#!/usr/bin/env python3
"""Choose a stable pseudo-random Vietnamese family lifestyle scene from a SKU."""

from __future__ import annotations

import argparse
import hashlib
import json
import re


SKU_RE = re.compile(r"^X24-DP-[0-9]{6}$")

NORMAL_ROLE_SETS = {
    3: [
        ["bố", "mẹ", "con gái"],
        ["bố", "mẹ", "con trai"],
        ["mẹ", "con trai", "con gái"],
    ],
    4: [
        ["bố", "mẹ", "con trai", "con gái"],
        ["bố", "mẹ", "hai con gái"],
        ["bố", "mẹ", "hai con trai"],
    ],
    5: [
        ["bố", "mẹ", "ba con"],
        ["bố", "mẹ", "hai con và một người thân"],
        ["bố", "mẹ", "ba anh chị em"],
    ],
}

THREE_GENERATION_ROLE_SETS = {
    5: [
        ["ông", "bà", "bố", "mẹ", "con"],
        ["bà", "bố", "mẹ", "hai con"],
    ],
    6: [
        ["ông", "bà", "bố", "mẹ", "hai con"],
        ["ông", "bà", "hai bố mẹ", "hai con"],
    ],
    7: [
        ["ông", "bà", "bố", "mẹ", "ba con"],
        ["ông", "bà", "hai bố mẹ", "ba con"],
    ],
}

NORMAL_SCENES = [
    "phòng khách gia đình sáng ấm áp",
    "bếp và bàn ăn gia đình cuối tuần",
    "sân nhà hoặc hiên nhà có cây xanh",
    "công viên cuối tuần",
    "góc chụp ảnh du lịch gia đình ban ngày",
]

THREE_GENERATION_SCENES = [
    "phòng khách rộng trong buổi họp mặt gia đình",
    "sân nhà sáng với ba thế hệ đứng gần nhau",
    "bàn ăn gia đình trong ngày sum họp",
    "công viên ban ngày với ông bà, bố mẹ và các cháu",
]

ACTIONS = [
    "ngồi gần nhau và cười tự nhiên",
    "đứng cạnh nhau trong khoảnh khắc chụp ảnh kỷ niệm",
    "cùng xem album ảnh gia đình",
    "đi bộ chậm cùng nhau trong khung cảnh sáng",
    "ôm vai nhẹ nhàng và trò chuyện vui vẻ",
]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--sku", required=True)
    parser.add_argument("--generations", choices=("normal", "three"), default="normal")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    sku = args.sku.strip().upper()
    if not SKU_RE.fullmatch(sku):
        raise SystemExit("ERROR: --sku must match X24-DP-NNNNNN")

    digest = hashlib.sha256(f"{sku}|{args.generations}".encode("utf-8")).digest()
    if args.generations == "three":
        cast_count = 5 + digest[0] % 3
        role_options = THREE_GENERATION_ROLE_SETS[cast_count]
        scenes = THREE_GENERATION_SCENES
        family_type = "ba-the-he"
    else:
        cast_count = 3 + digest[0] % 3
        role_options = NORMAL_ROLE_SETS[cast_count]
        scenes = NORMAL_SCENES
        family_type = "gia-dinh-hat-nhan"

    print(json.dumps({
        "sku": sku,
        "familyType": family_type,
        "generations": args.generations,
        "castCount": cast_count,
        "roles": role_options[digest[1] % len(role_options)],
        "scene": scenes[digest[2] % len(scenes)],
        "action": ACTIONS[digest[3] % len(ACTIONS)],
        "selection": "stable-sha256",
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
