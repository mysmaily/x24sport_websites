from __future__ import annotations

import json
import hashlib
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
SKU = "X24-BD-000001"


class NativeDeliveryContractTests(unittest.TestCase):
    @staticmethod
    def sha256(path: Path) -> str:
        return hashlib.sha256(path.read_bytes()).hexdigest()

    def make_product(self, root: Path) -> Path:
        product = root / "native-product"
        for name in ("print", "work", "marketing"):
            (product / name).mkdir(parents=True, exist_ok=True)

        spec = {
            "print": {
                "masterPolicy": "native-large-single-source",
                "nativeTargetPixels": [80, 120],
                "targetAspectRatio": 0.666667,
                "minNativeLongEdgePx": 120,
                "resamplingAllowed": False,
                "regenerationAfterMasterLock": False,
            },
            "garment": {"collar": "Cổ polo"},
            "galleryContact": {"website": "mayaobongda.vn", "hotline": "0989 353 247"},
            "salesHardConstraints": {
                "collarLabels": ["Cổ tròn", "Cổ Tim", "Cổ polo"],
                "collarCount": 3,
                "additionalCollarVariantsAllowed": False,
                "galleryContact": {"website": "mayaobongda.vn", "hotline": "0989 353 247"},
                "galleryContactRequiredOn": ["sales", "mockup", "teamPhoto"],
            },
            "teamPhoto": {"playerCount": 5},
            "sales": {
                "collection": "Mẫu áo bóng đá CLB",
                "offer": "IN TÊN + SỐ MIỄN PHÍ",
                "modelNumber": "09",
                "frontNumber": "09",
                "playerName": "NAM",
                "playerNumber": "09",
                "teamName": "NOVA FC",
                "materialLine": "VẢI MÈ THỂ THAO",
                "website": "mayaobongda.vn",
                "hotline": "0989 353 247",
                "sizes": ["S", "M", "L"],
                "collarHeading": "Cổ áo",
                "collarLabels": ["Cổ tròn", "Cổ Tim", "Cổ polo"],
                "selectedCollar": "Cổ polo",
            },
        }
        (product / "design-spec.json").write_text(
            json.dumps(spec, ensure_ascii=False), encoding="utf-8"
        )

        Image.new("RGB", (80, 120), "#174d3b").save(product / "print" / f"{SKU}-front-print.png")
        Image.new("RGB", (80, 120), "#9b1d20").save(product / "print" / f"{SKU}-back-print.png")
        marketing_assets = (
            ("mockup", (1200, 1200), "#134074", "mockup-base"),
            ("sales", (1200, 1200), "#f6bd60", "sales"),
            ("team-photo", (1200, 800), "#84a59d", "team-photo"),
        )
        for native_name, size, color, web_name in marketing_assets:
            native_path = product / "work" / f"{SKU}-{native_name}-native-source.png"
            web_path = product / "marketing" / f"{SKU}-{web_name}.webp"
            image = Image.new("RGB", size, color)
            image.save(native_path)
            image.save(web_path, format="WEBP", lossless=True)
        return product

    def run_builder(self, product: Path) -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            [
                sys.executable,
                str(BUILDER),
                str(product),
                "--sku", SKU,
                "--product-slug", "native-product",
                "--target-width-px", "80",
                "--target-height-px", "120",
                "--target-aspect-ratio", "0.666667",
                "--min-native-long-edge-px", "120",
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

    def test_native_single_source_delivery_passes(self) -> None:
        with tempfile.TemporaryDirectory() as temp_name:
            product = self.make_product(Path(temp_name))
            built = self.run_builder(product)
            self.assertEqual(built.returncode, 0, built.stderr)
            validated = self.run_validator(product)
            self.assertEqual(validated.returncode, 0, validated.stderr)
            self.assertIn('"masterScaleFactorValidated": 1.0', validated.stdout)
            self.assertIn('"masterResamplingValidated": false', validated.stdout)

    def test_resampled_master_claim_is_rejected(self) -> None:
        with tempfile.TemporaryDirectory() as temp_name:
            product = self.make_product(Path(temp_name))
            self.assertEqual(self.run_builder(product).returncode, 0)
            manifest_path = product / "delivery-manifest.json"
            manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
            manifest["files"][0]["resampled"] = True
            manifest_path.write_text(json.dumps(manifest), encoding="utf-8")
            validated = self.run_validator(product)
            self.assertNotEqual(validated.returncode, 0)
            self.assertIn("resampled must be false", validated.stderr + validated.stdout)

    def test_data_handoff_preserves_canonical_master_bytes(self) -> None:
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
                    "--sku", SKU,
                    "--destination-root", str(destination),
                ],
                capture_output=True,
                text=True,
                check=False,
            )
            self.assertEqual(delivered.returncode, 0, delivered.stderr)
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
