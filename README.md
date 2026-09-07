# Alltabs

A clean, persistent Chrome side panel for tabs synced from your other devices.

## Install for personal use

Requires **Chrome 141 or newer** on Windows or macOS.

1. Open `chrome://extensions` in Chrome.
2. Turn on **Developer mode** in the upper-right corner.
3. Click **Load unpacked** and select this project's **extension** folder (the folder containing `manifest.json`).
4. Open Chrome's puzzle-piece Extensions menu and pin **Alltabs**.
5. Click the Alltabs icon to open the panel. Click it again, or use the panel's close button, to close it.

On this PC, select:

```text
C:\Users\yzhao\Downloads\Workspace\Alltabs\extension
```

For your Mac, copy the `extension` folder or extract `dist/alltabs-0.1.0.zip` into a permanent folder and load that folder. Keep it in place while the unpacked extension is installed. There is no build step or dependency installation.

Sign into the same Chrome profile on your PC, Mac, Android phone, and iPhone, with history and open-tab sync enabled. The phones do not need Alltabs installed. They supply their tabs through Chrome sync; Alltabs runs on your computers.

## Use it

- **Browse:** other devices start expanded, newest sync first. This device starts collapsed. Expansion choices are remembered.
- **Search:** search titles and addresses across visible devices. Press `/` to focus search; Escape clears the focused search. Matching groups expand temporarily without changing saved choices.
- **Open:** clicking a tab opens a new local tab and activates it. Ctrl/Cmd-click or middle-click opens in the background. The panel preserves your position, search, and expanded groups.
- **Select:** check tabs to reveal **Open selected** and **Copy links**. Selection survives searching and refresh while the tabs remain available. Clear selection when done.
- **Device actions:** use the three-dot menu to open or select all tabs, or hide a remote device. While searching, these actions apply to matching tabs and are labeled accordingly.
- **Large batches:** opening more than 20 tabs asks for confirmation. They open in the background in list order, in the window containing the panel.
- **Settings:** show/hide this device and restore hidden remote devices. Hiding affects Alltabs only.
- **Refresh:** click the refresh icon to reread Chrome's latest snapshot. Alltabs also checks on opening and every 30 seconds while visible. It cannot force another device to sync.
- **OneTab:** open the selected remote tabs locally, then use OneTab's own menu to collect them. Copy links outputs one URL per line. There is no direct OneTab integration or remote closing in this version.

After changing extension files, click **Reload** on Alltabs in `chrome://extensions`, then reopen the panel.

## What Chrome exposes

Alltabs uses the public `chrome.sessions.getDevices()` API. Chrome exposes at most 25 window sessions per remote device, without pagination; this is not a limit of 25 tabs. Availability and freshness depend on Chrome sync. Some browser-internal pages are omitted by Chrome. Synced devices have names but no public stable device IDs, so renaming a device may reset its Alltabs expansion/hide preferences. Two devices with identical names may be indistinguishable if Chrome reorders them; distinct device names work best.

Chrome's native History view can hide a synced device through a private API. Alltabs provides its own reversible hide; it cannot change the native History view's hidden-device state. Remote tab closing is not exposed by Chrome's sync APIs.

## Development and verification

The extension is plain HTML, CSS, and JavaScript. Development scripts use Node.js 24 and built-in modules only. No package installation is needed.

```text
node --test tests/model.test.js
node tests/browser.mjs
node tests/browser.mjs --extension
node scripts/preview.mjs
node scripts/icons.mjs
```

- `tests/model.test.js`: normalization, search, hiding, URL handling, ordered opening, failure handling, 500-tab coverage.
- `tests/browser.mjs`: real Chrome renders the production panel with a **test-only Chrome API stand-in**. Checks search, click modifiers, selection, copied output, persistence, hiding/restoration, refresh errors, scroll retention with 500 tabs, batch cancellation, malicious text, dark/narrow layout, and empty states. Clipboard output is intercepted so the system clipboard is unchanged.
- `tests/browser.mjs --extension`: loads the actual extension into a **temporary unsigned-in Chrome profile**. Checks native APIs, persistent preferences, toolbar toggle, and panel close. Requires a recent Chrome version supporting the development protocol's extension test commands (tested on Chrome 152).
- The browser executable defaults to Windows Chrome. Set `ALLTABS_CHROME` to another Chrome executable path if needed. Test profiles stay under `.cache`; screenshots and results go to `artifacts`.
- Preview: open `http://127.0.0.1:4173`. `?large` loads 500 sample remote tabs. This preview never reads real Chrome tabs and never opens real websites. Sample favicon artwork is a placeholder. Demo fixtures are not shipped in the extension.

Create a distributable ZIP:

```text
node scripts/package.mjs
```

Only the contents of `extension` are packaged, with `manifest.json` at the ZIP root. No demo or test data is included.

## First-use checks with your devices

1. Compare the device lists and a few known tabs against Chrome's History → Tabs from other devices.
2. Open several remote tabs and confirm the panel stays open at the same position.
3. Check Ctrl/Cmd-click, middle-click, selection, and Copy links.
4. Collapse a device, search, clear search, close/reopen the panel, and check the saved expansion state.
5. Hide a device and restore it in settings.
6. Open a new tab on a phone, wait for Chrome sync, and refresh Alltabs.

Real account sync across Windows, macOS, Android, and iPhone remains a personal-use acceptance check; the automated test profile is intentionally unsigned-in.

## Before publishing

This is version 0.1.0 for personal testing, not a published store listing. After daily-use validation, review permission disclosures, publish a privacy-policy page based on `PRIVACY.md`, choose final store screenshots and copy, and submit the ZIP for Chrome Web Store review. No analytics, server, account, or build service is required.

References: [Sessions API](https://developer.chrome.com/docs/extensions/reference/api/sessions), [Side Panel API](https://developer.chrome.com/docs/extensions/reference/api/sidePanel), [OneTab help](https://www.one-tab.com/help).
