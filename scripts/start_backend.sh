#!/usr/bin/env bash
# NetResQ Backend Startup Script (Linux / macOS / WSL)
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="${SCRIPT_DIR}/../backend"

cd "${BACKEND_DIR}"

if [ -f "venv/bin/activate" ]; then
    echo "Activating virtual environment..."
    source venv/bin/activate
fi

echo "===================================================="
echo "Starting NetResQ FastAPI Backend Engine..."
echo "Host: http://127.0.0.1:8000"
echo "Interactive API Docs: http://127.0.0.1:8000/docs"
echo "===================================================="

uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
