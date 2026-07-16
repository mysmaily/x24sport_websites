#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import os
import re
import secrets
import string
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any


SERVICE_EMAIL = "automation-mayaocaulong@x24sport.local"
SERVICE_NAME = "Mayaocaulong Catalog Automation"


def request(base_url: str, path: str, *, method: str = "GET", token: str | None = None,
            payload: dict[str, Any] | None = None) -> dict[str, Any]:
    data = None if payload is None else json.dumps(payload).encode("utf-8")
    headers = {"Accept": "application/json"}
    if data is not None:
        headers["Content-Type"] = "application/json"
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(base_url.rstrip("/") + path, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as error:
        body = error.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Payload {method} {path} failed with HTTP {error.code}: {body[:500]}") from error


def read_admin_credentials(path: Path) -> tuple[str, str]:
    text = path.read_text(encoding="utf-8")
    email = re.search(r"^Email:\s*(.+)$", text, re.MULTILINE)
    password = re.search(r"^Password:\s*(.+)$", text, re.MULTILINE)
    if not email or not password:
        raise RuntimeError("admin credential file does not contain Email and Password fields")
    return email.group(1).strip(), password.group(1).strip()


def make_password(length: int = 40) -> str:
    alphabet = string.ascii_letters + string.digits + "-_"
    return "".join(secrets.choice(alphabet) for _ in range(length))


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--admin-credentials", type=Path, required=True)
    parser.add_argument("--output-env", type=Path, required=True)
    parser.add_argument("--internal-base-url", default="http://127.0.0.1:3001")
    parser.add_argument("--public-base-url", default="https://cms.x24sport.vn")
    args = parser.parse_args()

    admin_email, admin_password = read_admin_credentials(args.admin_credentials)
    login = request(
        args.internal_base_url,
        "/api/users/login",
        method="POST",
        payload={"email": admin_email, "password": admin_password},
    )
    admin_token = login.get("token")
    if not admin_token:
        raise RuntimeError("admin login returned no token")

    tenant_query = urllib.parse.urlencode({"where[slug][equals]": "mayaocaulong", "limit": 1})
    tenants = request(args.internal_base_url, f"/api/tenants?{tenant_query}", token=admin_token).get("docs", [])
    if len(tenants) != 1:
        raise RuntimeError(f"expected one mayaocaulong tenant, got {len(tenants)}")
    tenant_id = int(tenants[0]["id"])

    user_query = urllib.parse.urlencode({"where[email][equals]": SERVICE_EMAIL, "limit": 1})
    users = request(args.internal_base_url, f"/api/users?{user_query}", token=admin_token).get("docs", [])
    password = make_password()
    user_payload = {
        "email": SERVICE_EMAIL,
        "password": password,
        "name": SERVICE_NAME,
        "role": "tenant_admin",
        "tenants": [{"tenant": tenant_id}],
    }
    if users:
        user_id = int(users[0]["id"])
        result = request(
            args.internal_base_url, f"/api/users/{user_id}", method="PATCH",
            token=admin_token, payload=user_payload,
        )
        action = "rotated"
    else:
        result = request(
            args.internal_base_url, "/api/users", method="POST",
            token=admin_token, payload=user_payload,
        )
        record = result.get("doc", result)
        user_id = int(record["id"])
        action = "created"

    service_login = request(
        args.internal_base_url,
        "/api/users/login",
        method="POST",
        payload={"email": SERVICE_EMAIL, "password": password},
    )
    service_token = service_login.get("token")
    if not service_token:
        raise RuntimeError("service credential verification returned no token")
    product_query = urllib.parse.urlencode({"where[tenant][equals]": tenant_id, "limit": 1})
    request(args.internal_base_url, f"/api/products?{product_query}", token=service_token)

    args.output_env.parent.mkdir(parents=True, exist_ok=True)
    args.output_env.write_text(
        "\n".join([
            f"PAYLOAD_BASE_URL={args.public_base_url}",
            f"PAYLOAD_EMAIL={SERVICE_EMAIL}",
            f"PAYLOAD_PASSWORD={password}",
            f"PAYLOAD_TENANT_ID={tenant_id}",
            "MAYAOCAULONG_PUBLIC_BASE_URL=https://mayaocaulong.vn",
            "",
        ]),
        encoding="utf-8",
    )
    os.chmod(args.output_env, 0o600)
    print(json.dumps({
        "status": "verified",
        "action": action,
        "service_user_id": user_id,
        "tenant_id": tenant_id,
        "env_path": str(args.output_env),
        "env_mode": oct(args.output_env.stat().st_mode & 0o777),
    }))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
