#!/usr/bin/env bash
set -euo pipefail

# Railway Redis plugins often expose variables like:
# - REDIS_URL / REDIS_PUBLIC_URL (full URL)
# - REDISHOST / REDISPORT / REDISPASSWORD (split)
# Judge0 expects:
# - REDIS_HOST / REDIS_PORT / REDIS_PASSWORD

if [[ -z "${REDIS_HOST:-}" ]]; then
  if [[ -n "${REDISHOST:-}" ]]; then
    export REDIS_HOST="$REDISHOST"
  fi
fi

if [[ -z "${REDIS_PORT:-}" ]]; then
  if [[ -n "${REDISPORT:-}" ]]; then
    export REDIS_PORT="$REDISPORT"
  fi
fi

if [[ -z "${REDIS_PASSWORD:-}" ]]; then
  if [[ -n "${REDISPASSWORD:-}" ]]; then
    export REDIS_PASSWORD="$REDISPASSWORD"
  fi
fi

redis_url="${REDIS_URL:-${REDIS_PUBLIC_URL:-}}"
if [[ -n "${redis_url:-}" ]] && ([[ -z "${REDIS_HOST:-}" ]] || [[ -z "${REDIS_PORT:-}" ]]); then
  # Parse URL via python (available in judge0 image).
  parsed="$(python3 - <<'PY'
import os
from urllib.parse import urlparse

u = os.environ.get('REDIS_URL') or os.environ.get('REDIS_PUBLIC_URL')
if not u:
    raise SystemExit(0)

p = urlparse(u)
host = p.hostname or ''
port = str(p.port or '')
password = p.password or ''
print(host)
print(port)
print(password)
PY
)"

  host="$(printf '%s' "$parsed" | sed -n '1p')"
  port="$(printf '%s' "$parsed" | sed -n '2p')"
  password="$(printf '%s' "$parsed" | sed -n '3p')"

  if [[ -z "${REDIS_HOST:-}" ]] && [[ -n "${host:-}" ]]; then
    export REDIS_HOST="$host"
  fi
  if [[ -z "${REDIS_PORT:-}" ]] && [[ -n "${port:-}" ]]; then
    export REDIS_PORT="$port"
  fi
  if [[ -z "${REDIS_PASSWORD:-}" ]] && [[ -n "${password:-}" ]]; then
    export REDIS_PASSWORD="$password"
  fi
fi

# Now run the upstream entrypoint (starts cron) and then the command.
exec /api/docker-entrypoint.sh "$@"
