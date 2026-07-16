from __future__ import annotations

import argparse
import importlib.util
import json
import tempfile
import unittest
from pathlib import Path


SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "badminton_transfer.py"
SPEC = importlib.util.spec_from_file_location("badminton_transfer_test", SCRIPT)
assert SPEC and SPEC.loader
TRANSFER = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(TRANSFER)


class BadmintonTransferTests(unittest.TestCase):
    def test_variant_classification(self) -> None:
        self.assertEqual(TRANSFER.variant_kind_for_name("mau-ao-co-tay-co-co.webp"), "collared")
        self.assertEqual(TRANSFER.variant_kind_for_name("mau-ao-khong-tay.webp"), "crew")
        self.assertEqual(TRANSFER.variant_kind_for_name("x24-pb-070-anh-1.webp"), "collared")
        self.assertEqual(TRANSFER.variant_kind_for_name("x24-pb-070-anh-2.webp"), "crew")
        self.assertEqual(TRANSFER.variant_kind_for_name("ao-pickleball-co-co-ngan-tay.webp"), "collared")

    def test_discover_groups_two_webp_variants_into_one_record(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            final = root / "products" / "product-123" / "final"
            final.mkdir(parents=True)
            (final / "mau-ao-co-tay-co-co.webp").write_bytes(b"collared")
            (final / "mau-ao-khong-tay.webp").write_bytes(b"crew")
            (final / "contact-sheet.webp").write_bytes(b"sheet")
            out = root / "sources.jsonl"
            TRANSFER.cmd_discover(argparse.Namespace(source_root=root, out=out, limit=None))
            records = TRANSFER.read_jsonl(out)
            self.assertEqual(len(records), 1)
            record = records[0]
            self.assertEqual(record["source_product_key"], "products-product-123")
            self.assertEqual([item["kind"] for item in record["source_variants"]], ["collared", "crew"])
            self.assertEqual(len(record["source_signatures"]), 2)

    def test_api_product_becomes_one_ordered_two_image_record(self) -> None:
        product = {
            "id": 3422,
            "name": "Áo Pickleball X24-PB-083",
            "slug": "ao-pickleball-x24-pb-083",
            "permalink": "https://mayaopickleball.vn/san-pham/x24-pb-083/",
            "sku": "X24-PB-083",
            "images": [
                {
                    "id": 8001,
                    "src": "https://static.example/x24-pb-083-anh-1.webp",
                    "name": "X24 PB 083 ảnh 1",
                    "alt": "áo có cổ",
                },
                {
                    "id": 8002,
                    "src": "https://static.example/x24-pb-083-anh-2.webp",
                    "name": "X24 PB 083 ảnh 2",
                    "alt": "áo cổ tròn không tay",
                },
            ],
        }
        record = TRANSFER.source_record_from_api_product(product, 1)
        self.assertIsNotNone(record)
        assert record is not None
        self.assertEqual(record["source_product_id"], 3422)
        self.assertEqual(record["source_product_key"], "product-3422")
        self.assertEqual(record["source_sku"], "X24-PB-083")
        self.assertEqual([item["kind"] for item in record["source_variants"]], ["collared", "crew"])
        self.assertEqual(len(record["source_variants"]), 2)

    def test_api_filename_wins_when_alt_text_is_swapped(self) -> None:
        product = {
            "id": 2883,
            "sku": "X24-PB-104",
            "images": [
                {
                    "id": 8101,
                    "src": "https://static.example/x24-pb-104-ao-co-tay-co-co.webp",
                    "alt": "biến thể không ống tay",
                },
                {
                    "id": 8102,
                    "src": "https://static.example/x24-pb-104-ao-khong-tay.webp",
                    "alt": "áo có tay có cổ",
                },
            ],
        }
        record = TRANSFER.source_record_from_api_product(product, 1)
        self.assertIsNotNone(record)
        assert record is not None
        self.assertEqual([item["kind"] for item in record["source_variants"]], ["collared", "crew"])

    def test_init_skips_product_id_already_in_global_ledger(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            wave = root / "wave-a"
            source_file = root / "sources.jsonl"
            source = {
                "source_product_id": 3422,
                "source_product_key": "product-3422",
                "source_signature": "new-image-signature",
                "source_variants": [
                    {"kind": "collared", "url": "https://static.example/a.webp"},
                    {"kind": "crew", "url": "https://static.example/b.webp"},
                ],
            }
            TRANSFER.write_jsonl(source_file, [source])
            TRANSFER.write_jsonl(
                TRANSFER.global_converted_path(wave),
                [{"source_product_id": 3422, "source_signature": "old-image-signature"}],
            )
            TRANSFER.cmd_init(argparse.Namespace(
                wave_dir=wave,
                source_jsonl=source_file,
                product_code_prefix="X24-CL-",
                product_code_start=1,
            ))
            self.assertEqual(TRANSFER.load_manifest(wave), [])

    def test_init_skips_product_id_active_in_sibling_wave(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            wave = root / "wave-new"
            other_wave = root / "wave-running"
            source_file = root / "sources.jsonl"
            source = {
                "source_product_id": 3422,
                "source_product_key": "product-3422",
                "source_signature": "same-product-new-signature",
            }
            TRANSFER.write_jsonl(source_file, [source])
            TRANSFER.save_manifest(other_wave, [{
                "source_product_id": 3422,
                "source_product_key": "product-3422",
                "source_signature": "same-product-old-signature",
                "status": "analyzed",
            }])
            TRANSFER.cmd_init(argparse.Namespace(
                wave_dir=wave,
                source_jsonl=source_file,
                product_code_prefix="X24-CL-",
                product_code_start=1,
            ))
            self.assertEqual(TRANSFER.load_manifest(wave), [])

    def test_init_reconciles_legacy_record_by_source_sku(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            wave = root / "wave"
            source_file = root / "sources.jsonl"
            TRANSFER.save_manifest(wave, [{
                "source_product_key": "legacy-x24-pb-083-collared",
                "source_signature": "legacy-signature",
                "product_code": "X24-CL-001",
                "status": "verified",
            }])
            TRANSFER.write_jsonl(source_file, [{
                "source_product_id": 3422,
                "source_product_key": "product-3422",
                "source_sku": "X24-PB-083",
                "source_signature": "api-signature",
            }])
            TRANSFER.cmd_init(argparse.Namespace(
                wave_dir=wave,
                source_jsonl=source_file,
                product_code_prefix="X24-CL-",
                product_code_start=1,
            ))
            self.assertEqual(len(TRANSFER.load_manifest(wave)), 1)

    def test_paired_payload_uses_two_images_and_responsible_copy(self) -> None:
        record = {
            "product_code": "X24-CL-321",
            "source_product_key": "product-123",
            "source_signature": "a" * 64,
            "source_variants": [
                {"kind": "collared", "label": "áo có cổ, tay ngắn", "path": "/tmp/co-be.webp", "filename": "co-be.webp"},
                {"kind": "crew", "label": "áo cổ tròn, không tay", "path": "/tmp/co-tron.webp", "filename": "co-tron.webp"},
            ],
            "visual_analysis": {
                "main_colors": ["xanh navy", "xanh dương"],
                "gradient": "gradient xanh navy xanh dương",
                "pattern": "đường sọc chéo hai bên sườn",
            },
        }
        payload = TRANSFER.final_product_payload(record, [41, 42], {})
        encoded = json.dumps(payload, ensure_ascii=False).casefold()
        self.assertEqual(payload["gallery"], [41, 42])
        self.assertIn("áo cầu lông", payload["name"].casefold())
        self.assertIn("có cổ & cổ tròn", payload["name"].casefold())
        self.assertIn("hai ảnh trong cùng sản phẩm", encoded)
        for claim in TRANSFER.UNSUPPORTED_PRODUCT_CLAIMS:
            self.assertNotIn(claim, encoded)
        tags = {item["value"] for item in payload["searchTags"]}
        self.assertTrue({"cổ bẻ tay ngắn", "cổ tròn", "không tay", "xanh navy"} <= tags)

    def test_single_source_record_remains_supported(self) -> None:
        record = {
            "product_code": "X24-CL-322",
            "source_product_key": "legacy-one-image",
            "source_path": "/tmp/mau-ao-co-tay-co-co-xanh.webp",
            "source_filename": "mau-ao-co-tay-co-co-xanh.webp",
            "source_signature": "b" * 64,
            "visual_analysis": {
                "main_colors": ["xanh dương"],
                "gradient": "gradient xanh dương",
            },
        }
        payload = TRANSFER.final_product_payload(record, [43], {})
        encoded = json.dumps(payload, ensure_ascii=False).casefold()
        self.assertEqual(payload["gallery"], [43])
        self.assertNotIn("hai ảnh trong cùng sản phẩm", encoded)

    def test_publish_rejects_unknown_visual_colors(self) -> None:
        record = {
            "product_code": "X24-CL-323",
            "source_product_key": "unknown-design",
            "source_path": "/tmp/design.webp",
            "source_filename": "design.webp",
            "source_signature": "c" * 64,
        }
        with self.assertRaisesRegex(RuntimeError, "verified main garment colors"):
            TRANSFER.final_product_payload(record, [44], {})

    def test_mark_generated_keeps_pair_order_and_visual_facts(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            wave = Path(tmp)
            record = {
                "product_code": "X24-CL-324",
                "source_product_key": "paired-source",
                "source_signature": "d" * 64,
                "status": "analyzed",
                "source_variants": [
                    {"kind": "collared", "label": "áo có cổ, tay ngắn", "path": "/tmp/a.webp", "signature": "1" * 64},
                    {"kind": "crew", "label": "áo cổ tròn, không tay", "path": "/tmp/b.webp", "signature": "2" * 64},
                ],
                "artifacts": {"item_dir": "products/paired-source", "generated": []},
            }
            TRANSFER.save_manifest(wave, [record])
            first, second = wave / "first.png", wave / "second.png"
            first.write_bytes(b"one")
            second.write_bytes(b"two")
            original = TRANSFER.branded_webp_for_generated
            TRANSFER.branded_webp_for_generated = lambda _src, dest, _index: dest.write_bytes(b"RIFFxxxxWEBP")
            try:
                TRANSFER.cmd_mark_generated(argparse.Namespace(
                    wave_dir=wave,
                    source_key="paired-source",
                    images=[first, second],
                    colors=["cam", "đỏ"],
                    gradient="gradient cam đỏ",
                    pattern="đường sóng đỏ",
                ))
            finally:
                TRANSFER.branded_webp_for_generated = original
            updated = TRANSFER.load_manifest(wave)[0]
            self.assertEqual(updated["status"], "images_generated")
            self.assertEqual(
                [item["kind"] for item in updated["artifacts"]["generated_variants"]],
                ["collared", "crew"],
            )
            self.assertEqual(updated["visual_analysis"]["main_colors"], ["cam", "đỏ"])


if __name__ == "__main__":
    unittest.main()
