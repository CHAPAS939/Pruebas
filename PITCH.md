Hi Louis,

I made a visual experiment that gives desktop Mochi a place to sit: the top edge of a window.

He follows the window when it moves or resizes, swings his feet and leans a little during movement. The existing agent states and celebration still drive the character.

Option-drag explicitly chooses this interaction. A normal drop keeps Coucou’s current window-as-context behavior. The proposed implementation reads window geometry and process IDs, without reading titles or capturing window contents.

This is independent from the room experiment, so either idea can be reviewed on its own.

The browser demo is working and tested. Native geometry tests pass in Swift. The AppKit integration still needs a full Mac build and review across Spaces, fullscreen windows, app switching and the existing approval-return lifecycle.

Would you be interested in this direction for desktop Mochi?
