#!/usr/bin/env bash
set -euo pipefail

# Start the Deno backend in the background, then run the frontend dev server.
# On exit, kill the background Deno process.

DENOPID=""

deno_run() {
  echo "Starting Deno backend..."
  deno run --allow-net src/backend/server.ts &
  DENOPID=$!
  echo "Deno server started (pid=$DENOPID)"
}

frontend_run() {
  echo "Starting frontend dev server..."
  if [ -d frontend ]; then
    cd frontend
    if [ ! -d node_modules ]; then
      echo "Installing frontend dependencies (npm)..."
      npm install
    fi
    npm run dev
  else
    echo "No frontend directory found; exiting"
    exit 1
  fi
}

cleanup() {
  echo "Stopping background services..."
  if [ -n "${DENOPID}" ]; then
    kill "$DENOPID" 2>/dev/null || true
    echo "Killed Deno pid $DENOPID"
  fi
}

trap cleanup EXIT

deno_run
frontend_run
