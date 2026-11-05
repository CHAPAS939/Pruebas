Hi Louis,

I made a visual experiment that gives desktop Mochi a place to sit: the top edge of a window.

The browser study now has a sculpted character, softer materials and a calmer desktop palette. Mochi follows the window when it moves or resizes, swings his feet and leans a little during movement. His eyes and expressions respond to the selected agent state.

Option-drag explicitly chooses this interaction. A normal drop keeps Coucou’s current window-as-context behavior. The proposed implementation reads window geometry and process IDs, without reading titles or capturing window contents.

This is independent from the room experiment, so either idea can be reviewed on its own.

The browser demo passed 36 interaction checks across both projects and 16 additional checks for 3D rendering, reduced motion and fallback behavior. The contribution now includes the shared offline 3D renderer in both the macOS app (WKWebView) and Windows app (Tauri), driven by real Coucou state. Native geometry tests pass in Swift. The Win32 integration includes Alt-drop, DPI-aware positioning and transient HWND/PID tracking. Full Xcode and Windows app builds and runtime checks still need to run using the included dual-platform CI workflow, especially virtual desktops, fullscreen, app switching and the existing approval-return lifecycle. The current GitHub connection cannot push the contribution (HTTP 403).

Would you be interested in this direction for desktop Mochi?
