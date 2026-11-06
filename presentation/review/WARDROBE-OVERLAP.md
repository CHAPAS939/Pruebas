# Open wardrobe contributions — overlap review

Reviewed PR descriptions, changed file lists and the selection/wardrobe/phone-link patches. This identifies overlap; it is not a merge test or a compatibility claim.

| Existing contribution | What it adds | Overlap and proposed boundary |
| --- | --- | --- |
| [#1025](https://github.com/Louis-CFM/coucou/pull/1025) | Validated JSON skins, 26 bundled files, a Settings wardrobe page and a user skins folder. Selections use `skin:<id>`. | Our selection parser and wardrobe UI currently assume a fixed registry. The desktop renderer, bridge, engine and wardrobe view are also shared edit points. Preserve the data-file selection path if this PR is chosen; avoid introducing a second competing skin catalog. Adapting its 2D formulas to the optional 3D scene needs an explicit design decision. |
| [#737](https://github.com/Louis-CFM/coucou/pull/737) | Seven full-character skins, including frog, panda, bee and ghost, with a phone fallback to `auto`. | Our body appearances are material effects, while `frogHat` is an accessory, not a frog body. The registry, labels, engine, outfit drawing and phone-link contract still overlap. These effects should be separate layers over one canonical outfit selection, with the original phone-known outfit set preserved. |
| [#738](https://github.com/Louis-CFM/coucou/pull/738) | Seven SVG hats, including cat ears, chef, cowboy, graduation, sprout, straw and top hats. | Outfit drawing, selection labels, wardrobe layout and phone fallback overlap. Prefer reusing the accepted hat/asset path rather than extending a parallel hat system. Mapping SVG hats into the shared 3D renderer is not implemented or verified here. |

The room/decor/camera interaction is the main distinct contribution. The saved-look and layered-appearance interface should be reviewed after the maintainer chooses the wardrobe direction. Native attachment can then carry the agreed appearance representation without owning another outfit catalog.

Snapshots reviewed: #1025 `a33334e3ed31fbbed748928ed846e86d22731f51`; #737 `2f38edd999494f26c9a0709c0420c6a02c2d51e8`; #738 `e797e476656e4a9fed3114af3a2e3b31ca42d1c3`.
