# Automatic native window attachment (stacked contribution)

Builds on the personal-room/wardrobe contribution. Drag Mochi from the island or desktop to an exposed native window top edge and release: a native tracker keeps his hands on the edge. No Alt/Option modifier is needed. Jump selects another valid exposed window, animates an arc and preserves the appearance and accessory layers. The shared renderer is introduced by the room contribution; this change connects it to native desktop views and safe target selection.

The native selector excludes Coucou’s own windows, hidden/minimized/covered targets and edges without clearance. Geometry handles negative monitor origins and per-monitor scaling; focus is not required. Target movement, close/minimize and jump cancellation update the tracker. No target window is activated or moved by Mochi. Reduced motion uses direct transitions. Canvas drawing is retained when the 3D view is unavailable.

Validation: `scripts/test-window-perch.sh`, `tests/window-perch-native` on Windows, the shared renderer tests, frontend tests and both native builds. The full integration beta additionally runs the real Windows app using native input, native fixture windows and actual WebView2, with video/screenshot evidence and CPU/memory samples. Mac accessibility permissions and a multi-monitor human smoke test remain an explicit review requirement.

This branch is stacked on `contrib/mochi-room-review-0.6`; compare against that branch to review only the window feature. Publishing, signing and preview-version metadata stay on the integration branch.
