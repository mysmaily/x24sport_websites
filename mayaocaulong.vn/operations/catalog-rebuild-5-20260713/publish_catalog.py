#!/usr/bin/env python3
from __future__ import annotations

import argparse
import importlib.util
import json
import sys
import urllib.parse
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parent
REPO = ROOT.parents[2]
RUNNER = REPO / ".codex/skills/convert-pickleball-to-badminton/scripts/badminton_transfer.py"


def load_runner() -> Any:
    spec = importlib.util.spec_from_file_location("badminton_transfer", RUNNER)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {RUNNER}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def relation_id(value: Any) -> Any:
    return value.get("id") if isinstance(value, dict) else value


def old_product_payload(doc: dict[str, Any]) -> dict[str, Any]:
    fields = [
        "name", "slug", "sku", "sport", "price", "compareAtPrice",
        "shortDescription", "description", "searchTags", "badges", "featured",
    ]
    payload = {key: doc[key] for key in fields if key in doc}
    payload["tenant"] = relation_id(doc.get("tenant"))
    payload["gallery"] = [relation_id(value) for value in (doc.get("gallery") or [])]
    payload["categories"] = [relation_id(value) for value in (doc.get("categories") or [])]
    return payload


def product_payload(item: dict[str, Any], media_id: int, tenant_id: str, runner: Any) -> dict[str, Any]:
    colors = ", ".join(item["mainColors"])
    tags = [
        "cầu lông", "áo cầu lông đặt may", "đồng phục cầu lông", "in tên số",
        "đội thi đấu", "câu lạc bộ", *item["mainColors"], item["gradient"],
        item["pattern"], item["shape"],
    ]
    paragraphs = [
        f"{item['name']} nổi bật với {item['gradient']}, tông chính {colors} và {item['pattern']}.",
        f"Phom {item['shape']} phù hợp làm đồng phục cầu lông cho câu lạc bộ, đội thi đấu và nhóm phong trào.",
        "Có thể đặt in tên, số và logo đội theo yêu cầu để hoàn thiện bộ nhận diện riêng.",
    ]
    return {
        "tenant": tenant_id,
        "name": item["name"],
        "slug": item["slug"],
        "sku": item["code"],
        "sport": "badminton",
        "price": 135000,
        "compareAtPrice": 200000,
        "shortDescription": (
            f"Mẫu áo cầu lông đặt may {item['code']} với {item['gradient']}, "
            f"tông chính {colors}, {item['pattern']}; phù hợp đồng phục đội và in tên số."
        ),
        "description": runner.lexical_doc(paragraphs),
        "searchTags": [{"value": tag} for tag in dict.fromkeys(tags)],
        "gallery": [media_id],
        "badges": [{"label": "Mới"}],
        "featured": False,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--env-file", type=Path, required=True)
    args = parser.parse_args()
    runner = load_runner()
    env = runner.load_env(args.env_file)
    tenant_id = str(env.get("PAYLOAD_TENANT_ID") or "1")
    client = runner.PayloadClient(env)
    catalog = json.loads((ROOT / "catalog.json").read_text(encoding="utf-8"))
    backup = json.loads((ROOT / "backups/products-before.json").read_text(encoding="utf-8"))
    if len(catalog) != 5:
        raise RuntimeError("catalog must contain exactly 5 products")

    uploaded: list[dict[str, Any]] = []
    for item in catalog:
        image = ROOT / item["image"]
        if image.suffix.lower() != ".webp" or not image.exists():
            raise RuntimeError(f"missing WebP: {image}")
        tags = [
            "cầu lông", *item["mainColors"], item["gradient"], item["pattern"],
            item["shape"], "ảnh sản phẩm", item["code"].lower(),
        ]
        alt = f"{item['name']} - {item['gradient']} - ảnh sản phẩm"
        media = client.upload_media(image, alt, list(dict.fromkeys(tags)))
        uploaded.append({"code": item["code"], "media_id": int(media["id"])})
    (ROOT / "uploaded-media.json").write_text(
        json.dumps(uploaded, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )

    query = urllib.parse.urlencode({"where[tenant][equals]": tenant_id, "limit": 100})
    current = client.request(f"/api/products?{query}").get("docs", [])
    deleted_ids: list[int] = []
    try:
        for doc in current:
            client.request(f"/api/products/{doc['id']}", method="DELETE")
            deleted_ids.append(int(doc["id"]))
        created: list[dict[str, Any]] = []
        media_by_code = {row["code"]: row["media_id"] for row in uploaded}
        for item in catalog:
            doc = client.create_product(product_payload(item, media_by_code[item["code"]], tenant_id, runner))
            created.append({"code": item["code"], "product_id": int(doc["id"]), "slug": doc["slug"]})
        (ROOT / "created-products.json").write_text(
            json.dumps(created, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
        )
    except Exception:
        print("publish failed after deletion; attempting product rollback from backup", file=sys.stderr)
        for doc in backup.get("docs", []):
            try:
                client.create_product(old_product_payload(doc))
            except Exception as rollback_error:
                print(f"rollback failed for old product {doc.get('id')}: {rollback_error}", file=sys.stderr)
        raise

    verified = client.request(f"/api/products?{query}&depth=2").get("docs", [])
    result = {
        "deleted_product_ids": deleted_ids,
        "uploaded_media": uploaded,
        "created_products": created,
        "verified_count": len(verified),
        "verified_skus": sorted(doc.get("sku") for doc in verified),
    }
    (ROOT / "publish-result.json").write_text(
        json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
