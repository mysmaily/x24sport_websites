#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("v6_run_all", ROOT / "scripts" / "v6_run_all.py")
assert SPEC and SPEC.loader
v6_run_all = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(v6_run_all)


class ManualImagegenQueueTest(unittest.TestCase):
    def test_prompts_ready_without_reserved_product_is_unsafe(self) -> None:
        records = [
            {
                "source_product_key": "x24-cb-052",
                "status": "prompts_ready",
                "product_code": "X24-PB-036",
                "new_product_id": None,
                "reservation_sku": None,
                "artifacts": {"responses": ["products/x24-cb-052/a.txt", "products/x24-cb-052/b.txt"]},
            },
            {
                "source_product_key": "x24-cb-057",
                "status": "prompts_ready",
                "product_code": "X24-PB-037",
                "new_product_id": 3001,
                "reservation_sku": "x24-transfer-safe",
                "artifacts": {"responses": ["products/x24-cb-057/a.txt", "products/x24-cb-057/b.txt"]},
            },
        ]

        queue = v6_run_all.manual_imagegen_queue(records)

        self.assertEqual(["x24-cb-057"], [item["source_product_key"] for item in queue["ready"]])
        self.assertEqual(["x24-cb-052"], [item["source_product_key"] for item in queue["unsafe_unclaimed"]])

    def test_next_product_code_skips_used_skus(self) -> None:
        used = {"X24-PB-042", "X24-PB-043"}

        self.assertEqual("X24-PB-044", v6_run_all.next_product_code("X24-PB-042", used))

    def test_v6_image_b_requires_female_collared_no_sleeve(self) -> None:
        record = {"source_product_key": "product-2188"}

        prompt = v6_run_all.generate_prompt(record, "b", ["cam"])

        self.assertIn("male wears a no-sleeve round-neck pickleball tank top", prompt)
        self.assertIn("Female must wear a no-sleeve collared pickleball tank top", prompt)
        self.assertIn("female collared no-sleeve tank top", prompt)
        self.assertNotIn("rarer deterministic round-neck", prompt)
        self.assertNotIn("Female is usually collared", prompt)

    def test_pose_guidance_allows_female_back_only(self) -> None:
        record = {"source_product_key": "product-2188"}

        prompt_a = v6_run_all.generate_prompt(record, "a", ["cam"])
        prompt_b = v6_run_all.generate_prompt(record, "b", ["cam"])

        for prompt in [prompt_a, prompt_b]:
            self.assertIn("male may stand left, right, slightly forward, or slightly behind", prompt)
            self.assertIn("female may stand left, right, slightly forward, or slightly behind", prompt)
            self.assertIn("Eye direction and head turn may vary", prompt)
            self.assertIn("only the female may be", prompt.lower())
            self.assertIn("The male must never be fully back-facing", prompt)
            self.assertIn("Avoid: male back-facing pose", prompt)


if __name__ == "__main__":
    unittest.main()
