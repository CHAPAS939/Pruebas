#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
PHOTO_TEST_DIR="$(mktemp -d "${TMPDIR:-/tmp}/coucou-photo.XXXXXX")"
trap 'rm -rf "$PHOTO_TEST_DIR"' EXIT
swiftc -module-cache-path "$PHOTO_TEST_DIR/cache" NotchBuddy/Sources/App/MochiPhotoLogic.swift tests/MochiPhotoTests.swift -o "$PHOTO_TEST_DIR/tests"
"$PHOTO_TEST_DIR/tests"
