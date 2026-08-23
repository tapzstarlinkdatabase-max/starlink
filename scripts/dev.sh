#!/bin/sh
set -eu

cleanup() {
  trap - INT TERM EXIT
  [ -n "${SERVER_PID:-}" ] && kill "$SERVER_PID" 2>/dev/null || true
  [ -n "${CLIENT_PID:-}" ] && kill "$CLIENT_PID" 2>/dev/null || true
}

trap cleanup INT TERM EXIT

npm run dev:server &
SERVER_PID=$!

npm run dev:client &
CLIENT_PID=$!

wait "$SERVER_PID" "$CLIENT_PID"
