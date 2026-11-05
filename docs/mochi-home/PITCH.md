Hi Louis,

I made a small visual experiment for Coucou: a room for Mochi inside the island.

The browser study is now a small 3D diorama: a desk, a plant, a rainy window and a lamp that lights the desk. Daylight and evening change the actual scene lighting, and a slight cursor response lets you look into the room. Mochi keeps his familiar shape and expressions, rendered with volume.

The room is a separate destination behind a lamp icon. It doesn’t replace the overview or approval cards, and its animation clock is absent when the view is inactive.

This is one of two independent experiments; the other lets Mochi sit on window edges. They can be reviewed separately.

The browser demo passed 36 interaction checks across both projects and 16 additional checks for 3D rendering, reduced motion and fallback behavior. The contribution now includes the shared offline 3D renderer in both the macOS app (WKWebView) and Windows app (Tauri), driven by real Coucou state. The contribution includes native SwiftUI source, local preferences and Swift logic tests. Full macOS and Windows builds still need to run in the included dual-platform CI workflow; the GitHub connection currently cannot push the contribution (HTTP 403). Runtime checks remain required on both systems, especially alert transitions, screen locking and the return from desktop Mochi.

Would this fit the direction you want for Coucou?
