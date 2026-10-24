#!/usr/bin/env bash
# NetResQ Frontend Startup Script (Linux / macOS / WSL)
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="${SCRIPT_DIR}/../frontend"

cd "${FRONTEND_DIR}"

echo "===================================================="
echo "Starting NetResQ React + Vite Frontend Dashboard..."
echo "URL: http://localhost:5173"
echo "===================================================="

npm run dev
