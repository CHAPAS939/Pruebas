#!/usr/bin/env bash
# Local preview installer; does not sign with a Developer ID or publish a release.
set -euo pipefail
[[ "$(uname -s)" == Darwin ]] || { echo 'This build requires macOS and Xcode.' >&2; exit 1; }
for command in xcodebuild xcodegen node codesign hdiutil lipo; do
  command -v "$command" >/dev/null || { echo "Missing tool: $command" >&2; exit 1; }
done
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
OUT="$ROOT/build/mochi-installers/macos"
DERIVED="$ROOT/build/mochi-xcode"
mkdir -p "$OUT"
node --test tests/mochi-scene.test.mjs tests/mochi-studio.test.mjs
npm --prefix windows ci --ignore-scripts
node scripts/build-studio-icons.mjs --check
bash scripts/test-mochi-room.sh
bash scripts/test-mochi-photo.sh
bash scripts/test-window-perch.sh
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
codesign --force --deep --sign - "$APP"
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

Compilación de prueba con firma ad-hoc, sin notarizar. No es una release oficial.
EOF
DMG="$OUT/Coucou-Mochi-macOS-universal.dmg"
hdiutil create -volname 'Coucou Mochi' -srcfolder "$STAGE" -format UDZO -ov "$DMG"
hdiutil verify "$DMG"
hdiutil attach -nobrowse -readonly -mountpoint "$MOUNT" "$DMG"
node scripts/test-mochi-resources.mjs "$MOUNT/Coucou.app/Contents/Resources/mochi-scenes"
codesign --verify --deep --strict "$MOUNT/Coucou.app"
node scripts/write-mochi-build-manifest.mjs "$OUT" macOS universal
echo "Installer: $DMG"
