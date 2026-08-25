#!/usr/bin/env python3
"""Choose a stable pseudo-random grade 8-12 student scene from a product SKU."""

from __future__ import annotations

import argparse
import hashlib
import json
import re


SKU_RE = re.compile(r"^X24-DP-[0-9]{6}$")

GRADES = {
    8: "13-14",
    9: "14-15",
    10: "15-16",
    11: "16-17",
    12: "17-18",
}

SCENES = [
    "sân thể thao trường trong giờ sinh hoạt",
    "hành lang lớp học sáng",
    "thư viện hoặc phòng câu lạc bộ",
    "cầu thang và courtyard trường học",
    "sân trường sau giờ học",
]

ACTIONS = [
    "trò chuyện và cười tự nhiên",
    "cùng xem bản thiết kế áo trên một tờ giấy",
    "chuẩn bị gian hàng ngày hội trường",
    "khoác vai nhẹ và tạo dáng kỷ niệm",
    "đi bộ chậm qua sân trường sau giờ học",
]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--sku", required=True)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    sku = args.sku.strip().upper()
    if not SKU_RE.fullmatch(sku):
        raise SystemExit("ERROR: --sku must match X24-DP-HHSSMM")

    digest = hashlib.sha256(sku.encode("utf-8")).digest()
    grade = 8 + digest[0] % 5
    scene = SCENES[digest[1] % len(SCENES)]
    action = ACTIONS[digest[2] % len(ACTIONS)]
    cast_count = 4 + digest[4] % 2

    print(json.dumps({
        "sku": sku,
        "grade": grade,
        "ageRange": GRADES[grade],
        "castCount": cast_count,
        "scene": scene,
        "action": action,
        "selection": "stable-sha256",
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
