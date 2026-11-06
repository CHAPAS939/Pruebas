# Coucou · Mochi Studio 0.6.0-beta.1

A community preview based on Coucou's 0.6 main revision, with an editable room, saved looks, new appearances, photos, desktop objects and automatic window-edge attachment.

## Downloads

- **Windows 10/11 x64:** download `Coucou-Mochi-0.6.0-beta.1-Windows-x64-setup.exe` and run it. An MSI and portable ZIP are also available.
- **macOS 15+, Intel and Apple Silicon:** download `Coucou-Mochi-0.6.0-beta.1-macOS-universal.dmg`, open it and drag Coucou into Applications.

Close Coucou before updating. This preview retains the original app identifiers and may replace an installation in the same location. Back up your preferences before testing.

## Preview status

Both native packages were built from the same source revision. The build checks include 618 Windows app tests, 35 relay tests, 569 frontend tests, 22 shared scene/data tests, 7 native Windows edge-selection checks, and the packaged Mac studio rendering and PNG export in WebKit. Full installed-app interaction QA is still incomplete; this release is intended for testing and review.

Windows is unsigned. macOS is ad-hoc signed and not notarized, so browser or system warnings may appear. The Mac package uses the upstream Debug configuration with `-O` optimization and does not include the PHONE_LINK/iCloud integration enabled by the original Release configuration. Windows uses Release.

Source and SHA-256 checksums are included with the downloads. This is a community preview, not an official release or a statement of endorsement. Coucou, Mochi and the original artwork and sounds belong to Louis Raillé. Original source and dependency notices are retained.
