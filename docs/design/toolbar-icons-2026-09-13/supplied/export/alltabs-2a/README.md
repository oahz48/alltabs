# Alltabs icon (2a)

- dark/  #5f6368 glyph, for light toolbars
- light/ #e8eaed glyph, for dark toolbars
- mid/   #8a8d91 glyph, single set usable on both

Each folder: icon-16/32/48/128.png + icon.svg (16px grid source).

Manifest: "icons": {"16":"icons/icon-16.png","32":"icons/icon-32.png","48":"icons/icon-48.png","128":"icons/icon-128.png"}
Theme switch: in the service worker, match prefers-color-scheme via an offscreen document or the side panel page, then chrome.action.setIcon({path:{16:...,32:...}}).
