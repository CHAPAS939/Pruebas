# Mochi Home · visual study v2

Open `index.html` directly, or serve this directory on localhost. The HTML is self-contained: Three.js 0.170.0 and Manrope font files are embedded, and there are no CDN requests. Keep `THIRD-PARTY-LICENSES.txt` with the contribution.

The 3D renderer is also supplied separately as `room-3d.js` for review. `visual-v2.css` contains the art direction. The standalone page contains these same sources inline.

This is an interactive browser design study, with simulated agents and desktop windows. Reduced motion stops its animation loop; unsupported WebGL devices retain the illustrated/original character renderer. The character behaviors derive from Louis Raillé’s prototype.

See `PROJECT.md` for the included native implementation and its verification limits. The shared 3D renderer is now integrated into macOS and Windows source; full native builds and runtime checks remain pending.
