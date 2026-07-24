#!/usr/bin/env python3
"""Resize imported mayaobongro Dropbox media to 1000px WebP and remove old R2 objects."""

from __future__ import annotations

import argparse
import hashlib
import io
import json
import os
import re
import subprocess
import sys
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

import boto3
import requests
from botocore.client import Config
from botocore.exceptions import ClientError
from PIL import Image, ImageOps


TENANT_ID = 5
TENANT_SLUG = "mayaobongro"
CMS_URL = "https://cms.x24sport.vn"
MEDIA_SOURCE_SYSTEM = "dropbox-basketball-media-20260724"
MANIFEST_PATH = Path(__file__).with_name("import-manifest.json")
STATE_PATH = Path(__file__).with_name("optimize-media-manifest.json")
REPORT_PATH = Path(__file__).with_name("optimize-media-report.json")


@dataclass(frozen=True)
class MediaJob:
    manifest_key: str
    media_id: int
    product_id: int
    path: Path
    slug: str
    sku: str
    age: str


def now_ms() -> int:
    return int(time.time() * 1000)


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def read_credentials(command: str | None, path: Path | None) -> tuple[str, str]:
    if command:
        raw = subprocess.check_output(command, shell=True, text=True)
    elif path:
        raw = path.read_text(encoding="utf-8")
    else:
        raise RuntimeError("Provide --credentials-command or --credentials")

    try:
        data = json.loads(raw)
        email, password = data.get("email"), data.get("password")
    except json.JSONDecodeError:
        fields: dict[str, str] = {}
        for line in raw.splitlines():
            match = re.match(r"\s*(email|password)\s*[:=]\s*(.+?)\s*$", line, re.I)
            if match:
                fields[match.group(1).lower()] = match.group(2)
        email, password = fields.get("email"), fields.get("password")
    if not email or not password:
        raise RuntimeError("Could not parse CMS credentials")
    return str(email), str(password)


def read_env(command: str | None, path: Path | None) -> dict[str, str]:
    if command:
        raw = subprocess.check_output(command, shell=True, text=True)
    elif path:
        raw = path.read_text(encoding="utf-8")
    else:
        raise RuntimeError("Provide --r2-env-command or --r2-env")

    values: dict[str, str] = {}
    for line in raw.splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        value = value.strip().strip('"').strip("'")
        values[key.strip()] = value
    return values


def load_jobs() -> list[MediaJob]:
    data = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    jobs: list[MediaJob] = []
    for key, item in data["items"].items():
        if item.get("status") != "ok":
            continue
        jobs.append(
            MediaJob(
                manifest_key=key,
                media_id=int(item["mediaId"]),
                product_id=int(item["productId"]),
                path=Path(item["path"]),
                slug=str(item["slug"]),
                sku=str(item["sku"]),
                age=str(item["age"]),
            )
        )
    jobs.sort(key=lambda job: (job.age != "Người lớn", job.sku))
    return jobs


def load_state() -> dict[str, Any]:
    if STATE_PATH.exists():
        return json.loads(STATE_PATH.read_text(encoding="utf-8"))
    return {"createdAtMs": now_ms(), "items": {}}


def save_state(state: dict[str, Any]) -> None:
    tmp = STATE_PATH.with_suffix(".json.tmp")
    tmp.write_text(json.dumps(state, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    tmp.replace(STATE_PATH)


def save_report(state: dict[str, Any], started_ms: int, finished_ms: int) -> None:
    items = state.get("items", {})
    counts: dict[str, int] = {}
    original_total = 0
    optimized_total = 0
    deleted = 0
    for item in items.values():
        status = item.get("status", "unknown")
        counts[status] = counts.get(status, 0) + 1
        original_total += int(item.get("oldFilesize") or 0)
        optimized_total += int(item.get("newFilesize") or 0)
        if item.get("oldR2Deleted"):
            deleted += 1
    report = {
        "startedAtMs": started_ms,
        "finishedAtMs": finished_ms,
        "totalTracked": len(items),
        "counts": counts,
        "oldR2Deleted": deleted,
        "originalBytesTracked": original_total,
        "optimizedBytesTracked": optimized_total,
        "savedBytesTracked": max(0, original_total - optimized_total),
    }
    REPORT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def webp_bytes(path: Path, quality: int) -> bytes:
    with Image.open(path) as image:
        image = ImageOps.exif_transpose(image)
        if image.mode in {"RGBA", "LA"} or (image.mode == "P" and "transparency" in image.info):
            canvas = Image.new("RGBA", image.size, (255, 255, 255, 255))
            canvas.alpha_composite(image.convert("RGBA"))
            image = canvas.convert("RGB")
        else:
            image = image.convert("RGB")
        image = ImageOps.fit(image, (1000, 1000), method=Image.Resampling.LANCZOS, centering=(0.5, 0.5))
        out = io.BytesIO()
        image.save(out, format="WEBP", quality=quality, method=6)
        return out.getvalue()


def object_key_from_url(url: str | None) -> str | None:
    if not url:
        return None
    parsed = urlparse(url)
    key = parsed.path.lstrip("/")
    return key or None


class PayloadClient:
    def __init__(self, base_url: str, email: str, password: str) -> None:
        self.base_url = base_url.rstrip("/")
        self.session = requests.Session()
        self.session.headers.update({"Accept": "application/json", "User-Agent": "X24Sport-Media-Optimizer/1.0"})
        response = self.session.post(f"{self.base_url}/api/users/login", json={"email": email, "password": password}, timeout=45)
        response.raise_for_status()
        self.session.headers["Authorization"] = f"Bearer {response.json()['token']}"

    def get_media(self, media_id: int) -> dict[str, Any]:
        response = self.session.get(f"{self.base_url}/api/media/{media_id}", params={"depth": 0}, timeout=45)
        response.raise_for_status()
        return response.json()

    def patch_media_file(self, media_id: int, filename: str, content: bytes, payload: dict[str, Any]) -> dict[str, Any]:
        files = {"file": (filename, io.BytesIO(content), "image/webp")}
        data = {"_payload": json.dumps(payload, ensure_ascii=False)}
        response = self.session.patch(f"{self.base_url}/api/media/{media_id}", data=data, files=files, timeout=240)
        response.raise_for_status()
        body = response.json()
        return body.get("doc", body)

    def count_optimized_batch(self) -> tuple[int, int]:
        params = {
            "limit": 1,
            "depth": 0,
            "where[tenant][equals]": TENANT_ID,
            "where[sourceSystem][equals]": MEDIA_SOURCE_SYSTEM,
            "where[mimeType][equals]": "image/webp",
            "where[width][equals]": 1000,
            "where[height][equals]": 1000,
        }
        response = self.session.get(f"{self.base_url}/api/media", params=params, timeout=45)
        response.raise_for_status()
        optimized = int(response.json().get("totalDocs") or 0)
        params.pop("where[mimeType][equals]")
        params.pop("where[width][equals]")
        params.pop("where[height][equals]")
        response = self.session.get(f"{self.base_url}/api/media", params=params, timeout=45)
        response.raise_for_status()
        total = int(response.json().get("totalDocs") or 0)
        return optimized, total


class R2Client:
    def __init__(self, values: dict[str, str]) -> None:
        bucket = values.get("CLOUDFLARE_R2_BUCKET_NAME")
        access_key = values.get("CLOUDFLARE_R2_ACCESS_KEY_ID")
        secret_key = values.get("CLOUDFLARE_R2_SECRET_ACCESS_KEY")
        endpoint = values.get("CLOUDFLARE_R2_ENDPOINT")
        account_id = values.get("CLOUDFLARE_ACCOUNT_ID")
        if not endpoint and account_id:
            endpoint = f"https://{account_id}.r2.cloudflarestorage.com"
        if not bucket or not access_key or not secret_key or not endpoint:
            raise RuntimeError("Missing required R2 environment values")
        self.bucket = bucket
        self.client = boto3.client(
            "s3",
            endpoint_url=endpoint,
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
            region_name="auto",
            config=Config(signature_version="s3v4", s3={"addressing_style": "path"}),
        )

    def exists(self, key: str) -> bool:
        try:
            self.client.head_object(Bucket=self.bucket, Key=key)
            return True
        except ClientError as exc:
            code = exc.response.get("Error", {}).get("Code")
            if code in {"404", "NoSuchKey", "NotFound"}:
                return False
            raise

    def delete_verified(self, key: str) -> bool:
        self.client.delete_object(Bucket=self.bucket, Key=key)
        return not self.exists(key)


def public_url_ready(url: str) -> bool:
    for _ in range(10):
        try:
            response = requests.get(url, timeout=20, stream=True)
            response.close()
            if response.status_code == 200:
                return True
        except requests.RequestException:
            pass
        time.sleep(2)
    return False


def current_payload(media: dict[str, Any], checksum: str) -> dict[str, Any]:
    fields = {
        "tenant": media.get("tenant") or TENANT_ID,
        "alt": media.get("alt") or "",
        "sourceSystem": media.get("sourceSystem") or MEDIA_SOURCE_SYSTEM,
        "sourceId": media.get("sourceId") or "",
        "sourceChecksum": checksum,
        "sourceUrl": media.get("sourceUrl") or "",
    }
    tags = media.get("searchTags")
    if tags:
        fields["searchTags"] = tags
    return fields


def process_job(
    job: MediaJob,
    payload: PayloadClient,
    r2: R2Client | None,
    state: dict[str, Any],
    *,
    dry_run: bool,
    quality: int,
    delete_old: bool,
) -> dict[str, Any]:
    optimized = webp_bytes(job.path, quality)
    checksum = sha256_bytes(optimized)
    filename = f"{job.slug}.webp"
    media = payload.get_media(job.media_id)
    old_url = media.get("url")
    old_key = object_key_from_url(old_url)
    new_key_expected = f"{TENANT_SLUG}/{filename}"
    already_current = (
        media.get("mimeType") == "image/webp"
        and int(media.get("width") or 0) == 1000
        and int(media.get("height") or 0) == 1000
        and media.get("filename") == filename
        and media.get("sourceChecksum") == checksum
    )

    result: dict[str, Any] = {
        "status": "unchanged" if already_current else "planned" if dry_run else "updated",
        "mediaId": job.media_id,
        "productId": job.product_id,
        "sku": job.sku,
        "sourcePath": str(job.path),
        "oldUrl": old_url,
        "oldKey": old_key,
        "oldFilesize": media.get("filesize"),
        "newFilename": filename,
        "newChecksum": checksum,
        "newFilesize": len(optimized),
        "updatedAtMs": now_ms(),
    }

    if dry_run:
        result["newUrl"] = f"https://static.x24sport.vn/{new_key_expected}"
        result["oldR2Deleted"] = False
        return result

    if not already_current:
        next_doc = payload.patch_media_file(job.media_id, filename, optimized, current_payload(media, checksum))
    else:
        next_doc = media

    new_url = next_doc.get("url")
    new_key = object_key_from_url(new_url)
    if (
        next_doc.get("mimeType") != "image/webp"
        or int(next_doc.get("width") or 0) != 1000
        or int(next_doc.get("height") or 0) != 1000
    ):
        raise RuntimeError(f"Media {job.media_id} did not update to 1000x1000 WebP")
    if not new_url or not public_url_ready(new_url):
        raise RuntimeError(f"New media URL is not publicly ready for media {job.media_id}: {new_url}")

    result.update(
        {
            "status": "unchanged" if already_current else "updated",
            "newUrl": new_url,
            "newKey": new_key,
            "newMimeType": next_doc.get("mimeType"),
            "newWidth": next_doc.get("width"),
            "newHeight": next_doc.get("height"),
            "newFilesize": next_doc.get("filesize") or len(optimized),
            "oldR2Deleted": False,
        }
    )

    if delete_old and r2 and old_key and old_key != new_key:
        result["oldR2Deleted"] = r2.delete_verified(old_key)
    return result


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--credentials", type=Path)
    parser.add_argument("--credentials-command")
    parser.add_argument("--r2-env", type=Path)
    parser.add_argument("--r2-env-command")
    parser.add_argument("--base-url", default=CMS_URL)
    parser.add_argument("--quality", type=int, default=84)
    parser.add_argument("--limit", type=int)
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--no-delete-old", action="store_true")
    args = parser.parse_args()

    dry_run = not args.apply
    started_ms = now_ms()
    jobs = load_jobs()
    if args.limit:
        jobs = jobs[: args.limit]
    missing = [str(job.path) for job in jobs if not job.path.exists()]
    if missing:
        raise RuntimeError(f"Missing local image files: {missing[:3]}")

    email, password = read_credentials(args.credentials_command, args.credentials)
    payload = PayloadClient(args.base_url, email, password)
    r2 = None
    if args.apply and not args.no_delete_old:
        r2 = R2Client(read_env(args.r2_env_command, args.r2_env))

    state = load_state()
    state.setdefault("items", {})
    total = len(jobs)
    for index, job in enumerate(jobs, 1):
        previous = state["items"].get(job.manifest_key)
        if args.apply and previous and previous.get("status") in {"updated", "unchanged"} and previous.get("oldR2Deleted", args.no_delete_old):
            print(f"[{index}/{total}] skip {job.sku} {previous.get('status')}", flush=True)
            continue
        try:
            result = process_job(
                job,
                payload,
                r2,
                state,
                dry_run=dry_run,
                quality=args.quality,
                delete_old=not args.no_delete_old,
            )
            state["items"][job.manifest_key] = result
            print(
                f"[{index}/{total}] {result['status']} {job.sku} "
                f"{result.get('oldFilesize')} -> {result.get('newFilesize')} bytes",
                flush=True,
            )
        except Exception as exc:
            state["items"][job.manifest_key] = {
                "status": "error",
                "mediaId": job.media_id,
                "productId": job.product_id,
                "sku": job.sku,
                "sourcePath": str(job.path),
                "error": str(exc),
                "updatedAtMs": now_ms(),
            }
            save_state(state)
            save_report(state, started_ms, now_ms())
            raise
        save_state(state)

    optimized, total_media = payload.count_optimized_batch()
    state["verification"] = {
        "optimizedWebp1000Media": optimized,
        "totalBatchMedia": total_media,
        "checkedAtMs": now_ms(),
        "dryRun": dry_run,
    }
    save_state(state)
    save_report(state, started_ms, now_ms())
    print(f"verification optimized_webp_1000={optimized}/{total_media}", flush=True)
    return 0


if __name__ == "__main__":
    sys.exit(main())
