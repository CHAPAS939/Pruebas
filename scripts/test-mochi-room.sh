#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
TEST_DIR="$(mktemp -d "${TMPDIR:-/tmp}/coucou-room.XXXXXX")"
trap 'rm -rf "$TEST_DIR"' EXIT
swiftc -module-cache-path "$TEST_DIR/cache" NotchBuddy/Sources/App/MochiRoomLogic.swift tests/MochiRoomTests.swift -o "$TEST_DIR/tests"
"$TEST_DIR/tests"
