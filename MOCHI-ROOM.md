# Personal room and wardrobe (review contribution)

Adds an opt-in lamp-tab destination and a separate resizable studio to Coucou 0.6 main (`b1bc09de`). It includes editable rooms, saved camera/light presets, outfit layers/body appearances, photos and desktop props. The native automatic window-edge attachment changes are isolated in the next stacked contribution.

The new renderer is shared offline WebGL/Three.js code, with its MIT notice included, to keep the same room, materials, wardrobe and export behavior on AppKit/WebKit and Tauri/WebView2. Native Canvas drawing remains available. This dependency and the extra Windows webviews are review tradeoffs, not a claim of zero overhead. The renderer is lazy, pauses when hidden and caps animation work; native resource measurements accompany the beta.

Review the native scene bridge, cosmetic-setting validation, local resource policy, editor lifecycle and performance before merging. No keys, agent prompts, sessions or integration data enter the room renderer. Settings stay local. The original 0.6 launcher remains available beside the room.

Build/test: the Mochi cross-platform workflow, shared scene/studio tests, frontend suite, `scripts/test-mochi-room.sh`, `scripts/test-mochi-photo.sh` and the upstream localization checker. This contribution retains upstream package versions; beta publishing/signing/version metadata are kept on the separate integration branch.
