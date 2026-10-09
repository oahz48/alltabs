# Test the exact Web Store package

## Installation on Windows or macOS

1. Extract dist/alltabs-0.1.2.zip into dist/store-test-0.1.2 before testing this release.
2. Open chrome://extensions. Disable the existing development Alltabs temporarily to avoid two identical toolbar icons. This keeps its data available.
3. Enable Developer mode, choose Load unpacked, and select the extracted store-test-0.1.2 folder containing manifest.json.
4. Pin the new Alltabs toolbar action. Leave the folder in place while testing.

The ZIP is a store upload artifact. Extract it for local testing. You do not need Chrome's Pack extension button or a separate CRX file.

## Acceptance checklist (record pass/fail and browser/OS)

- [x] Open the toolbar panel, switch browser tabs, close and reopen it.
- [x] Compare device names and several known links against Chrome History > Tabs from other devices.
- [x] Open a distinctive normal web page on each phone. After Chrome sync updates, confirm it appears in Alltabs. Refresh cannot force remote sync.
- [x] Search part of a title and a URL. Open a result and verify the search stays in place.
- [x] Ctrl/Cmd-click and middle-click open in the background.
- [x] Select two tabs, copy links, and paste into a local text editor. Confirm exactly the selected URLs.
- [x] Open selected tabs. Check the destination is the window containing the panel.
- [x] Hide a remote device and restore it in Settings.
- [x] Open panels in two browser windows; changing a display preference updates the other panel.
- [x] Close/reopen the panel and restart Chrome. Display preferences survive; temporary search/selection state may reset when the browser session ends.
- [x] Use Tab, Shift+Tab, Enter, Space, /, and Escape. Check visible focus, accessible labels, narrow layout, and light/dark appearance.
- [ ] Check an offline or stale device. The interface must not imply Refresh forces its sync.
- [ ] Repeat core checks on macOS. Record the Chrome version. The automated tests used Chrome 152; the declared minimum is 141.

## Store-installed testing

For testing through the Web Store first, choose Private with trusted testers, submit for review, and install from the resulting listing after it is approved and published to those testers. A draft ZIP upload alone does not create an installable listing. Later change visibility to Public and republish. Unlisted is accessible to anyone with the link, not only invited testers.

After the public release, disable the local copy, install from the public listing, and repeat opening, sync, search, selection, and copy checks. Store and unpacked copies can have different extension IDs and separate preferences.

References: https://developer.chrome.com/docs/webstore/update and https://developer.chrome.com/docs/webstore/cws-dashboard-distribution
