#!/usr/bin/env bash
# Community beta installer. Developer ID signing is optional and explicit.
set -euo pipefail
[[ "$(uname -s)" == Darwin ]] || { echo 'This build requires macOS and Xcode.' >&2; exit 1; }
for command in xcodebuild xcodegen node codesign hdiutil lipo; do
  command -v "$command" >/dev/null || { echo "Missing tool: $command" >&2; exit 1; }
done
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
OUT="$ROOT/build/mochi-installers/macos"
VERSION="$(node -p 'require("./mochi-preview.json").version')"
DERIVED="$ROOT/build/mochi-xcode"
mkdir -p "$OUT"
node --test tests/mochi-scene.test.mjs tests/mochi-studio.test.mjs
npm --prefix windows ci --ignore-scripts
node scripts/build-studio-icons.mjs --check
bash scripts/test-mochi-room.sh
bash scripts/test-mochi-photo.sh
bash scripts/test-window-perch.sh
for regression in work-streak session-launch agy-permissions flow-keys cli-relay-run review-policy codex-auto-review; do
  bash "scripts/test-$regression.sh"
done
swiftc -parse-as-library NotchBuddy/Sources/App/CoucoudoroEngine.swift NotchBuddy/Tests/CoucoudoroEngineTests.swift -o "$OUT/coucoudoro-tests"
"$OUT/coucoudoro-tests"
rm "$OUT/coucoudoro-tests"
python3 scripts/test-localization.py
(cd NotchBuddy && xcodegen generate)
xcodebuild -project NotchBuddy/NotchBuddy.xcodeproj -scheme NotchBuddy \
  -configuration Debug -destination 'generic/platform=macOS' -derivedDataPath "$DERIVED" \
  ARCHS='arm64 x86_64' ONLY_ACTIVE_ARCH=NO SWIFT_OPTIMIZATION_LEVEL=-O \
  CODE_SIGNING_ALLOWED=NO CODE_SIGNING_REQUIRED=NO build
APP="$DERIVED/Build/Products/Debug/Coucou.app"
test -x "$APP/Contents/MacOS/Coucou"
lipo "$APP/Contents/MacOS/Coucou" -verify_arch arm64 x86_64
node scripts/test-mochi-resources.mjs "$APP/Contents/Resources/mochi-scenes"
swiftc NotchBuddy/Sources/App/MochiPhotoLogic.swift NotchBuddy/Sources/App/MochiStudioResources.swift tests/MochiStudioWebKitSmoke.swift -o "$OUT/studio-webkit-smoke"
"$OUT/studio-webkit-smoke" "$APP/Contents/Resources/mochi-scenes"
rm "$OUT/studio-webkit-smoke"
test -f "$APP/Contents/Resources/mochi-scenes/home.js"
test -f "$APP/Contents/Resources/mochi-scenes/perch.js"
# Apple Silicon requires a code signature. Ad-hoc signing authenticates this local
# build's contents; it does not claim Louis's identity or notarization.
if [[ -n "${COUCOU_MAC_SIGN_IDENTITY:-}" ]]; then
  codesign --force --deep --options runtime --timestamp --sign "$COUCOU_MAC_SIGN_IDENTITY" "$APP"
else
  codesign --force --deep --sign - "$APP"
fi
codesign --verify --deep --strict "$APP"
STAGE="$(mktemp -d "${TMPDIR:-/tmp}/coucou-mochi-dmg.XXXXXX")"
MOUNT="$(mktemp -d "${TMPDIR:-/tmp}/coucou-mochi-mount.XXXXXX")"
cleanup() { hdiutil detach "$MOUNT" >/dev/null 2>&1 || true; rm -rf "$STAGE" "$MOUNT"; }
trap cleanup EXIT
ditto "$APP" "$STAGE/Coucou.app"
ln -s /Applications "$STAGE/Applications"
cat > "$STAGE/LEEME.txt" <<'EOF'
Coucou · Mochi Home + Perch (preview)

Arrastra Coucou a Aplicaciones. Requiere macOS 15 o posterior.
Incluye Mochi Studio: habitación editable, conjuntos, materiales y fotos PNG.
Arrastra Mochi al borde superior de una ventana y suéltalo para que se enganche.
No necesita combinaciones de teclas.

Beta de la comunidad. Consulta signature-status.json para conocer su firma.
No es una release oficial de Louis.
EOF
DMG="$OUT/Coucou-Mochi-$VERSION-macOS-universal.dmg"
hdiutil create -volname 'Coucou Mochi' -srcfolder "$STAGE" -format UDZO -ov "$DMG"
SIGNATURE='ad-hoc; not notarized'
if [[ -n "${COUCOU_MAC_SIGN_IDENTITY:-}" ]]; then
  SIGNATURE='Developer ID; not notarized'
  codesign --force --timestamp --sign "$COUCOU_MAC_SIGN_IDENTITY" "$DMG"
  if [[ -n "${COUCOU_MAC_NOTARY_PROFILE:-}" ]]; then
    xcrun notarytool submit "$DMG" --keychain-profile "$COUCOU_MAC_NOTARY_PROFILE" --wait --timeout 30m
    xcrun stapler staple "$DMG"
    xcrun stapler validate "$DMG"
    SIGNATURE='Developer ID; notarized and stapled'
  fi
fi
node -e 'require("node:fs").writeFileSync(process.argv[1],JSON.stringify({status:process.argv[2]})+"\n")' "$OUT/signature-status.json" "$SIGNATURE"
hdiutil verify "$DMG"
hdiutil attach -nobrowse -readonly -mountpoint "$MOUNT" "$DMG"
node scripts/test-mochi-resources.mjs "$MOUNT/Coucou.app/Contents/Resources/mochi-scenes"
codesign --verify --deep --strict "$MOUNT/Coucou.app"
node scripts/write-mochi-build-manifest.mjs "$OUT" macOS universal
echo "Installer: $DMG"
