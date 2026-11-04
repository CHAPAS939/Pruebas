Hi Louis,

I made a small visual experiment for Coucou: a room for Mochi inside the island.

There’s a desk, a plant, a rainy window and a lamp. You can switch between daylight, night and the local time of day. Mochi uses the existing character renderer, outfits and agent states.

The room is a separate destination behind a lamp icon. It doesn’t replace the overview or approval cards, and its animation clock is absent when the view is inactive.

This is one of two independent experiments; the other lets Mochi sit on window edges. They can be reviewed separately.

The browser demo is working and tested. The contribution includes native SwiftUI source, local preferences and Swift logic tests. The full macOS app still needs to be built and checked on a Mac, especially alert transitions, screen locking and the return from desktop Mochi.

Would this fit the direction you want for Coucou?
