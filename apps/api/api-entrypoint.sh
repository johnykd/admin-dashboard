#!/usr/bin/env bash
set -euo pipefail

# Set defaults
: "${PORT:=4000}"
: "${CORS_ORIGIN:=http://localhost:3000}"

echo "[api] Running Prisma migrations..."
npx prisma migrate deploy

echo "[api] Starting Nest app on port ${PORT}"
node dist/main.js

