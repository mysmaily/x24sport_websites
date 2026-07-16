#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
import unittest
from pathlib import Path
from unittest.mock import patch


ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("v5_run_all", ROOT / "scripts" / "v5_run_all.py")
assert SPEC and SPEC.loader
v5_run_all = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(v5_run_all)


class ManualImagegenQueueTest(unittest.TestCase):
    def test_manual_queue_uses_live_woocommerce_state_only(self) -> None:
        records = [
            {
                "source_product_key": "x24-cb-052",
                "status": "analyzed",
                "product_code": "X24-PB-036",
                "new_product_id": None,
                "reservation_sku": None,
                "artifacts": {"responses": ["products/x24-cb-052/a.txt", "products/x24-cb-052/b.txt"]},
            },
            {
                "source_product_key": "x24-cb-057",
                "status": "analyzed",
                "product_code": "X24-PB-037",
                "new_product_id": 3001,
                "reservation_sku": "x24-transfer-safe",
                "artifacts": {"responses": ["products/x24-cb-057/a.txt", "products/x24-cb-057/b.txt"]},
            },
        ]

        live_products = [
            {
                "id": 3002,
                "permalink": "https://mayaopickleball.vn/?post_type=product&p=3002",
                "sku": "x24-transfer-live",
            },
            {
                "id": 3001,
                "permalink": "https://mayaopickleball.vn/?post_type=product&p=3001",
                "sku": "x24-transfer-safe",
            },
        ]

        with patch.object(v5_run_all, "product_by_id", return_value=live_products[1]), patch.object(
            v5_run_all,
            "find_transfer_product",
            side_effect=[live_products[0]],
        ), patch.object(
            v5_run_all,
            "record_live_claim_state",
            side_effect=["claimable", "busy"],
        ):
            queue = v5_run_all.manual_imagegen_queue(records, env={})

        self.assertEqual(["x24-cb-052"], [item["source_product_key"] for item in queue["ready"]])
        self.assertEqual(["x24-cb-057"], [item["source_product_key"] for item in queue["unsafe_unclaimed"]])

    def test_next_product_code_skips_used_skus(self) -> None:
        used = {"X24-PB-042", "X24-PB-043"}

        self.assertEqual("X24-PB-044", v5_run_all.next_product_code("X24-PB-042", used))

    def test_live_claim_decision_blocks_recent_running_claim(self) -> None:
        decision = v5_run_all.live_claim_decision(
            "running",
            "2026-07-10T10:15:00+00:00",
            now="2026-07-10T10:20:00+00:00",
            stale_after_seconds=1800,
        )

        self.assertEqual("busy", decision)

    def test_live_claim_decision_allows_stale_running_claim(self) -> None:
        decision = v5_run_all.live_claim_decision(
            "running",
            "2026-07-10T09:00:00+00:00",
            now="2026-07-10T10:20:00+00:00",
            stale_after_seconds=1800,
        )

        self.assertEqual("claimable", decision)

    def test_pending_records_skips_recent_live_busy_items(self) -> None:
        records = [
            {
                "source_product_key": "busy-item",
                "status": "analyzed",
                "source_index": 1,
                "new_product_id": 3001,
            },
            {
                "source_product_key": "claimable-item",
                "status": "analyzed",
                "source_index": 2,
                "new_product_id": 3002,
            },
        ]

        with patch.object(v5_run_all, "manifest_records", return_value=records), patch.object(
            v5_run_all,
            "record_live_claim_state",
            side_effect=["busy", "claimable"],
        ):
            pending = v5_run_all.pending_records(Path("/tmp/fake-wave"), 2, env={})

        self.assertEqual(["claimable-item"], [item["source_product_key"] for item in pending])


if __name__ == "__main__":
    unittest.main()
