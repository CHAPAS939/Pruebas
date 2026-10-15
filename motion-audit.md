# Motion audit

## Engine

`src/components/portfolio/use-motion.ts` uses one scoped `gsap.context()` and `gsap.matchMedia()`, with cleanup through `mm.revert()` and `ctx.revert()`. ScrollTrigger uses native scrolling; Lenis is intentionally not added because the reference could not be observed and there is no need to introduce a second scroll owner. Font readiness triggers layout refresh. Responsive media changes revert and recreate the appropriate timelines.

Design and code use `[data-design-word="design"]`, `[data-design-word="code"]`, and `[data-design-amp]`. There are no ambiguous `:first-child` / `:last-child` word selectors.

## Choreography

| Scene | Initial → final | Trigger / relationship | Timing / reversal |
| --- | --- | --- | --- |
| Hero intro | masked lines displaced 110%, object rotated −35°/scaled .65 → readable type and full object | mount; no scroll lock | 1.2–1.8s, power3.out; mount-only |
| Hero departure | first line x 0 → −16%; second 0 → +14%; object y 0 → 25%, rotation 0 → 35°, scale 1 → .8 | hero top/top to bottom/top, scrub 1 | fully reversible |
| About | muted word color → ink, individually staggered | statement top/80% to bottom/40%, scrub | reverse returns words to muted state |
| About emblem | −90°/.6 → normal rotation/scale | section top/bottom to bottom/top | reversible parallax |
| Work | inset mask 12% → 0%, scale .94 → 1; internal visual y −5% → +5% | each project separately; top/90% to top/30% and top/bottom to bottom/top | scrub .6/.7; captions toggle/reverse |
| Design & Code | design x −22% → +18%; code +24% → −22%; ampersand −70°/.5/Y−40° → 45°/1.15/Y35° | pinned at top/top, desktop end +=160%, smaller screens +=75%, scrub .65 | fully reversible; total desktop passage approx. 260vh |
| Laboratory | masked feed entries → complete feeds | grid top/85% | .8s power3.inOut, stagger .07, reverse on upward exit |
| FAQ | each row x35/opacity0 → settled row | row top/95% | .5s; reverse on exit; native details with .35s answer entry |
| Footer | type y45%/−4° → normal | footer top/bottom to bottom/bottom | scrub 1, reversible |

## Thirteen feeds

| Camera | Implementation | Motion |
| --- | --- | --- |
| 01 WebGL | 17 original toroidal rings with metal/clearcoat and a green accent | group rotation, floating offset, pointer response |
| 02 Product Film | procedural metal cylinder, cap, concentric bands, emblem | cinematic object turn and float; not filmed footage |
| 03 3D Motion | seven nested polished rings and central polyhedron | independently rotating rings |
| 04 Motion Graphics | large contrasting type and cropped circular form | type drift/rotation and circle trajectory |
| 05 App Reel | OFFGRID mobile concept with landscape, trip stats and progress | device pose, floating movement, progress cycle |
| 06 Boot Intro | typographic boot console, status rows and progress | timed line changes, cursor, repeating initialization |
| 07 Hero Design | editorial hero concept, oversized type and colored disc | type parallax and disc scale/position |
| 08 Motion Branding | eight-part radial symbol and stacked wordmark | geometric symbol rotation/scale |
| 09 Visual Research | overlapping radial optical patterns | counter-rotation and scale distortion |
| 10 Particle Flow | 12,000 particles distributed across five volumetric ribbons, custom vertex/fragment shaders | organic spatial displacement, depth, additive glow |
| 11 Claude Motion | original displaced sphere with custom shader | animated surface, lighting approximation, orbit ring |
| 12 Motion Reel | three contrasting typographic rows and disc | offset rhythmic loops; silent CSS reel |
| 13 Screen Capture | simulated Pulse analytics interface | animated chart bars; illustrative local data |

## Resource lifecycle and accessibility

- IntersectionObserver controls CSS play state and creation/destruction of WebGL scenes.
- Offscreen WebGL contexts are disposed, forcibly released, and recreated on re-entry.
- Geometry, materials, environment maps, RAFs, ResizeObservers, pointer listeners and media listeners are cleaned up.
- WebGL DPR is capped at 1.6 desktop / 1.25 mobile; updates target around 30 FPS; tab-hidden rendering is skipped.
- Three.js and internal route modules load separately. Fonts are bundled locally.
- Reduced motion bypasses scroll pinning/reveals, stops CSS loops, and renders one static WebGL frame.
- Native dialog provides focus containment and Escape dismissal; project/feed trigger focus is restored.
- Native details, visible focus rings, a skip link, live search/copy feedback and keyboard-operable controls are included.
- WebGL failure shows an explicit availability fallback, not a false claim of live 3D.

## Verification

The Playwright suite measures computed transforms before/during/after/reverse, masks, About text color, and per-camera image hashes at two different times. It checks seven viewports at six scroll positions; library search/filters/copy; all eleven project modals; thirteen feed modals; nine FAQ entries; menu navigation; keyboard focus; reduced motion; and runtime errors.

See `docs/evidence/test-results.json`, `motion-transforms.json`, `feed-motion.json` and PNGs for actual results. Test output is the source of truth; performance on physical mobile GPUs and reference fidelity are not established by desktop software-rendered Chromium.

## Defects found and corrected during implementation

- Ambiguous word selection avoided with explicit `data-design-word` hooks and verified single DOM matches.
- FAQ entrance initially caused 12px of mobile overflow; its animation is now clipped within its list.
- Project caption entrance caused 2px of overflow at 375px; project containers now contain the reveal.
- Missing diagonal-arrow glyphs were replaced by a locally bundled 3.9KB DejaVu-derived symbol subset.
- The first particle arrangement resembled continuous thin coils; it was rebuilt as twelve thousand scattered particles across five volumetric ribbons.
- AI demo controls now drive the shader's displacement amplitude in addition to presentation changes.
- ESLint found two full-width whitespace characters in JSX; both were corrected.
