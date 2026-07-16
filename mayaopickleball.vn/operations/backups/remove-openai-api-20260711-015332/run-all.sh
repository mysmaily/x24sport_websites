#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

ENV_FILE="../.runtime/wordpress-api.env"
if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
else
  echo "Missing env file: $ENV_FILE" >&2
  exit 1
fi

python3 scripts/v5_run_all.py "$@"
