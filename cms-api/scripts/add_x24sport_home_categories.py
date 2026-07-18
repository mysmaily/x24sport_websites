#!/usr/bin/env python3
"""Create the three X24Sport homepage categories and attach factual products.

The command is dry-run by default. Pass --apply with CMS_EMAIL and
CMS_PASSWORD set to mutate Payload. Re-running is idempotent.
"""

from __future__ import annotations

import argparse
import os
import re
import sys
from dataclasses import dataclass
from typing import Any

import requests


@dataclass(frozen=True)
class CategorySpec:
    name: str
    slug: str
    description: str
    order: int
    product_pattern: re.Pattern[str]


CATEGORIES = (
    CategorySpec(
        name="Gaming",
        slug="gaming",
        description="Áo gaming và esports thiết kế theo màu sắc, logo và nhận diện riêng của đội tuyển.",
        order=80,
        product_pattern=re.compile(r"\b(?:gaming|e[\s-]?sports?|game thủ)\b", re.IGNORECASE),
    ),
    CategorySpec(
        name="Bi-a",
        slug="bi-a",
        description="Áo Bi-a và polo thi đấu với phom gọn, lịch sự, phù hợp câu lạc bộ và giải đấu.",
        order=90,
        product_pattern=re.compile(r"\b(?:bi[\s-]?a|billiards?|snooker)\b", re.IGNORECASE),
    ),
    CategorySpec(
        name="Đồng Phục",
        slug="dong-phuc",
        description="Đồng phục thể thao thiết kế đồng bộ cho đội nhóm, câu lạc bộ, trường học và sự kiện.",
        order=100,
        product_pattern=re.compile(r"\bđồng phục\b", re.IGNORECASE),
    ),
)


class PayloadClient:
    def __init__(self, base_url: str, email: str, password: str) -> None:
        self.base_url = base_url.rstrip("/")
        self.session = requests.Session()
        response = self.session.post(
            f"{self.base_url}/api/users/login",
            json={"email": email, "password": password},
            timeout=30,
        )
        response.raise_for_status()
        token = response.json().get("token")
        if not token:
            raise RuntimeError("Payload login did not return a token")
        self.session.headers["Authorization"] = f"JWT {token}"

    def list(self, collection: str, params: dict[str, str]) -> dict[str, Any]:
        response = self.session.get(
            f"{self.base_url}/api/{collection}", params=params, timeout=60
        )
        response.raise_for_status()
        return response.json()

    def create(self, collection: str, data: dict[str, Any]) -> dict[str, Any]:
        response = self.session.post(
            f"{self.base_url}/api/{collection}", json=data, timeout=60
        )
        response.raise_for_status()
        return response.json().get("doc", response.json())

    def update(self, collection: str, document_id: Any, data: dict[str, Any]) -> dict[str, Any]:
        response = self.session.patch(
            f"{self.base_url}/api/{collection}/{document_id}", json=data, timeout=60
        )
        response.raise_for_status()
        return response.json().get("doc", response.json())

    def all(self, collection: str, params: dict[str, str]) -> list[dict[str, Any]]:
        docs: list[dict[str, Any]] = []
        page = 1
        while True:
            page_params = {**params, "page": str(page), "limit": "100"}
            result = self.list(collection, page_params)
            docs.extend(result.get("docs", []))
            if page >= int(result.get("totalPages") or 1):
                return docs
            page += 1


def relation_id(value: Any) -> Any:
    return value.get("id") if isinstance(value, dict) else value


def product_text(product: dict[str, Any]) -> str:
    return " ".join(
        str(product.get(field) or "")
        for field in ("name", "shortDescription", "contentHtml", "productType")
    )


def arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--cms-api", default="http://127.0.0.1:3001")
    parser.add_argument("--tenant-slug", default="x24sport")
    parser.add_argument("--apply", action="store_true")
    return parser.parse_args()


def main() -> int:
    args = arguments()
    email = os.environ.get("CMS_EMAIL")
    password = os.environ.get("CMS_PASSWORD")
    if not email or not password:
        raise SystemExit("CMS_EMAIL and CMS_PASSWORD are required")

    client = PayloadClient(args.cms_api, email, password)
    tenants = client.list(
        "tenants", {"where[slug][equals]": args.tenant_slug, "limit": "1", "depth": "0"}
    ).get("docs", [])
    if not tenants:
        raise SystemExit(f"Tenant not found: {args.tenant_slug}")
    tenant_id = tenants[0]["id"]

    existing_categories = client.all(
        "product-categories",
        {"where[tenant.slug][equals]": args.tenant_slug, "depth": "0"},
    )
    categories_by_slug = {category["slug"]: category for category in existing_categories}
    products = client.all(
        "products",
        {
            "where[tenant.slug][equals]": args.tenant_slug,
            "where[publicationStatus][equals]": "publish",
            "depth": "0",
        },
    )

    created = updated = unchanged = product_updates = 0
    for spec in CATEGORIES:
        matches = [product for product in products if spec.product_pattern.search(product_text(product))]
        desired = {
            "tenant": tenant_id,
            "name": spec.name,
            "slug": spec.slug,
            "group": "sport",
            "description": spec.description,
            "legacyPath": f"/danh-muc/{spec.slug}/",
            "sourceSystem": "manual",
            "sourceId": f"x24-home-{spec.slug}",
            "productCount": len(matches),
            "order": spec.order,
        }
        category = categories_by_slug.get(spec.slug)
        changed = category is None or any(category.get(key) != value for key, value in desired.items())
        action = "create" if category is None else "update" if changed else "unchanged"
        print(f"category={spec.slug} action={action} matched_products={len(matches)}")
        for product in matches[:5]:
            print(f"  product={product['id']} {product['name']}")

        if args.apply:
            if category is None:
                category = client.create("product-categories", desired)
                created += 1
            elif changed:
                category = client.update("product-categories", category["id"], desired)
                updated += 1
            else:
                unchanged += 1
            category_id = category["id"]
            for product in matches:
                current_ids = [relation_id(value) for value in product.get("categories", [])]
                if category_id in current_ids:
                    continue
                next_ids = [*current_ids, category_id]
                client.update("products", product["id"], {"categories": next_ids})
                product["categories"] = next_ids
                product_updates += 1

    print(
        f"apply={args.apply} created={created} updated={updated} "
        f"unchanged={unchanged} product_updates={product_updates}"
    )
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except requests.HTTPError as error:
        detail = error.response.text[:500] if error.response is not None else ""
        print(f"HTTP error: {error} {detail}", file=sys.stderr)
        raise SystemExit(1)
