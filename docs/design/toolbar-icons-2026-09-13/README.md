# Toolbar icon trial — September 13, 2026

Historical trial: the final extension uses the green logo for both toolbar and listing. The gray assets are archived, and obsolete generated trial ZIPs were removed during cleanup. See `../README.md` for current locations. The restoration instructions below describe the original trial state; the current `icons/icon-*.png` files now contain the green logo. To restore the old artwork, use the backed-up PNG files from `original/`.

The toolbar uses the supplied `mid` variant (#8a8d91), described in the supplied README as usable on both light and dark toolbars. All four PNG sizes are copied unchanged into `extension/icons/toolbar/`. The extension listing icons remain unchanged.

`original/` backs up the previous manifest, four original PNGs, and original SVG. `supplied/` preserves all three variants and their SVG sources from `Toolbar icon for All Tabs.zip`.

To restore the previous toolbar, change only `action.default_icon` in `extension/manifest.json` back to `icons/icon-16.png`, `icons/icon-32.png`, `icons/icon-48.png`, and `icons/icon-128.png` for the matching sizes. Avoid replacing the entire manifest if subsequent changes have been made.

Reload the unpacked extension in Chrome to try the toolbar change. This is a local source change; no store upload or release package is produced.
