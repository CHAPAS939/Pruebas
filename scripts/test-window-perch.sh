#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
TEST_DIR="$(mktemp -d "${TMPDIR:-/tmp}/coucou-perch.XXXXXX")"
trap 'rm -rf "$TEST_DIR"' EXIT
swiftc -module-cache-path "$TEST_DIR/cache" NotchBuddy/Sources/App/WindowPerchLogic.swift tests/WindowPerchTests.swift -o "$TEST_DIR/tests"
"$TEST_DIR/tests"
