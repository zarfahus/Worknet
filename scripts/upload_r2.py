#!/usr/bin/env python3
"""Upload the generated product files to the private R2 bucket used for downloads.

Reads credentials from the environment (never from the repository):
  R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_ENDPOINT or CLOUDFLARE_ACCOUNT_ID
Optional: R2_BUCKET (default: worknest-studio-files)

Usage: python3 scripts/upload_r2.py          # requires: pip install boto3
"""
import json
import os
import sys

import boto3
from botocore.exceptions import ClientError

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUCKET = os.environ.get("R2_BUCKET", "worknest-studio-files")


def main():
    endpoint = os.environ.get("R2_ENDPOINT") or (
        f"https://{os.environ['CLOUDFLARE_ACCOUNT_ID']}.r2.cloudflarestorage.com" if os.environ.get("CLOUDFLARE_ACCOUNT_ID") else None)
    if not (endpoint and os.environ.get("R2_ACCESS_KEY_ID") and os.environ.get("R2_SECRET_ACCESS_KEY")):
        sys.exit("Set R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY and R2_ENDPOINT (or CLOUDFLARE_ACCOUNT_ID).")
    s3 = boto3.client("s3", endpoint_url=endpoint, region_name="auto",
                      aws_access_key_id=os.environ["R2_ACCESS_KEY_ID"],
                      aws_secret_access_key=os.environ["R2_SECRET_ACCESS_KEY"])

    try:
        s3.head_bucket(Bucket=BUCKET)
    except ClientError:
        print(f"Creating private bucket {BUCKET}")
        s3.create_bucket(Bucket=BUCKET)

    with open(os.path.join(ROOT, "src", "data", "manifest.json")) as fh:
        manifest = json.load(fh)
    uploaded = skipped = 0
    for fid, f in manifest["files"].items():
        path = os.path.join(ROOT, "products", "out", f["key"])
        if not os.path.exists(path):
            sys.exit(f"Missing {path}. Run: python3 products/generate.py")
        try:
            head = s3.head_object(Bucket=BUCKET, Key=f["key"])
            if head.get("Metadata", {}).get("sha256") == f["sha256"] and head["ContentLength"] == f["bytes"]:
                skipped += 1
                continue
        except ClientError:
            pass
        with open(path, "rb") as fh:
            s3.put_object(Bucket=BUCKET, Key=f["key"], Body=fh, ContentType=f["contentType"],
                          ContentDisposition=f'attachment; filename="{f["filename"]}"',
                          Metadata={"sha256": f["sha256"], "file-id": fid})
        uploaded += 1
        print(f"  uploaded {f['key']} ({f['bytes'] / 1024:.0f} KB)")

    # Verify every object the site can serve is present with the expected size.
    for f in manifest["files"].values():
        head = s3.head_object(Bucket=BUCKET, Key=f["key"])
        if head["ContentLength"] != f["bytes"]:
            sys.exit(f"Size mismatch for {f['key']}")
    print(f"R2 bucket {BUCKET}: {uploaded} uploaded, {skipped} unchanged, {len(manifest['files'])} verified")


if __name__ == "__main__":
    main()
