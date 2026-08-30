from __future__ import annotations

import hashlib
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

from PIL import Image


SCRIPTS = Path(__file__).resolve().parents[1]
BUILDER = SCRIPTS / "build_delivery_manifest.py"
VALIDATOR = SCRIPTS / "validate_delivery.py"
DELIVER = SCRIPTS / "deliver_print_masters.py"
SKU = "X24-BD-00000001"


class FourImageDeliveryContractTests(unittest.TestCase):
    @staticmethod
    def sha256(path: Path) -> str:
        return hashlib.sha256(path.read_bytes()).hexdigest()

    def make_product(self, root: Path) -> Path:
        product = root / "four-image-product"
        for name in ("print", "marketing"):
            (product / name).mkdir(parents=True, exist_ok=True)

        logo = root / "logo-white-test.png"
        Image.new("RGBA", (128, 128), "#ffffff").save(logo)
        spec = {
            "sku": SKU,
            "inputMode": "original-design",
            "print": {
                "masterPolicy": "builtin-imagegen-original",
                "singleGenerationPerSide": True,
                "resamplingAllowed": False,
                "regenerationAllowed": False,
            },
            "logoSource": {
                "path": "assets/logo-references/logo-white-test.png",
                "absolutePath": str(logo.resolve()),
            },
            "teamPhoto": {"playerCount": 7},
        }
        (product / "design-spec.json").write_text(
            json.dumps(spec, ensure_ascii=False), encoding="utf-8"
        )

        Image.new("RGB", (1024, 1536), "#174d3b").save(
            product / "print" / f"{SKU}-front-print.png"
        )
        Image.new("RGB", (1024, 1536), "#9b1d20").save(
            product / "print" / f"{SKU}-back-print.png"
        )
        Image.new("RGB", (1536, 1024), "#f6bd60").save(
            product / "marketing" / f"{SKU}-sales.png"
        )
        Image.new("RGB", (1536, 1024), "#84a59d").save(
            product / "marketing" / f"{SKU}-team-photo.png"
        )
        return product

    def run_builder(self, product: Path) -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            [
                sys.executable,
                str(BUILDER),
                str(product),
                "--sku",
                SKU,
                "--product-slug",
                "four-image-product",
                "--approve-visual",
            ],
            capture_output=True,
            text=True,
            check=False,
        )

    def run_validator(self, product: Path) -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            [sys.executable, str(VALIDATOR), str(product)],
            capture_output=True,
            text=True,
            check=False,
        )

    def test_four_image_builtin_delivery_passes_without_pixel_floor(self) -> None:
        with tempfile.TemporaryDirectory() as temp_name:
            product = self.make_product(Path(temp_name))
            built = self.run_builder(product)
            self.assertEqual(built.returncode, 0, built.stderr)
            validated = self.run_validator(product)
            self.assertEqual(validated.returncode, 0, validated.stderr)
            report = json.loads(validated.stdout)
            self.assertEqual(report["imageCount"], 4)
            self.assertEqual(report["actualPrintPixels"], [1024, 1536])
            self.assertFalse(report["pixelFloorApplied"])
            self.assertTrue(report["singleGenerationPerSideValidated"])

    def test_manifest_contains_exactly_four_roles(self) -> None:
        with tempfile.TemporaryDirectory() as temp_name:
            product = self.make_product(Path(temp_name))
            self.assertEqual(self.run_builder(product).returncode, 0)
            manifest = json.loads(
                (product / "delivery-manifest.json").read_text(encoding="utf-8")
            )
            self.assertEqual(
                {item["role"] for item in manifest["files"]},
                {
                    "front print master",
                    "back print master",
                    "sales image",
                    "team photo",
                },
            )

    def test_resampled_master_claim_is_rejected(self) -> None:
        with tempfile.TemporaryDirectory() as temp_name:
            product = self.make_product(Path(temp_name))
            self.assertEqual(self.run_builder(product).returncode, 0)
            manifest_path = product / "delivery-manifest.json"
            manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
            manifest["masterGeneration"]["front"]["resampled"] = True
            manifest_path.write_text(json.dumps(manifest), encoding="utf-8")
            validated = self.run_validator(product)
            self.assertNotEqual(validated.returncode, 0)
            self.assertIn("resampled must be false", validated.stderr + validated.stdout)

    def test_missing_logo_asset_is_rejected(self) -> None:
        with tempfile.TemporaryDirectory() as temp_name:
            product = self.make_product(Path(temp_name))
            spec_path = product / "design-spec.json"
            spec = json.loads(spec_path.read_text(encoding="utf-8"))
            spec["logoSource"]["absolutePath"] = str(Path(temp_name) / "missing.png")
            spec_path.write_text(json.dumps(spec), encoding="utf-8")
            built = self.run_builder(product)
            self.assertNotEqual(built.returncode, 0)
            self.assertIn("does not exist", built.stderr + built.stdout)

    def test_extra_mockup_image_is_rejected(self) -> None:
        with tempfile.TemporaryDirectory() as temp_name:
            product = self.make_product(Path(temp_name))
            Image.new("RGB", (1024, 1024), "#134074").save(
                product / "marketing" / f"{SKU}-mockup.png"
            )
            built = self.run_builder(product)
            self.assertNotEqual(built.returncode, 0)
            self.assertIn("exactly the four required images", built.stderr + built.stdout)

    def test_data_handoff_preserves_only_canonical_print_bytes(self) -> None:
        with tempfile.TemporaryDirectory() as temp_name:
            root = Path(temp_name)
            product = self.make_product(root)
            self.assertEqual(self.run_builder(product).returncode, 0)
            destination = root / "data-volume"
            delivered = subprocess.run(
                [
                    sys.executable,
                    str(DELIVER),
                    str(product),
                    "--sku",
                    SKU,
                    "--destination-root",
                    str(destination),
                ],
                capture_output=True,
                text=True,
                check=False,
            )
            self.assertEqual(delivered.returncode, 0, delivered.stderr)
            self.assertEqual(
                sorted(path.name for path in destination.iterdir()),
                [f"{SKU}_sau.png", f"{SKU}_truoc.png"],
            )
            self.assertEqual(
                self.sha256(product / "print" / f"{SKU}-front-print.png"),
                self.sha256(destination / f"{SKU}_truoc.png"),
            )
            self.assertEqual(
                self.sha256(product / "print" / f"{SKU}-back-print.png"),
                self.sha256(destination / f"{SKU}_sau.png"),
            )


if __name__ == "__main__":
    unittest.main()
