# Chrome Web Store listing

Status: prepared for owner review; not submitted.

## Listing fields

- Name: Alltabs
- Summary: Your synced Chrome tabs, one click away. Browse devices in a persistent side panel.
- Suggested category: Productivity / Tools (choose the nearest current dashboard category).
- Language: English
- Pricing: Free; no in-app purchases.

## Detailed description

Keep your tabs from other devices within reach.

PRIVATE BY DESIGN
Alltabs processes tab titles, URLs, searches, and selections locally on your device. It does not upload this data to the developer, the Alltabs website, or any developer-operated server. There is no Alltabs account, analytics, tracking, advertising, or remote code.

Alltabs brings the tabs Chrome syncs from your phones and computers into a persistent desktop side panel. Browse by device, search titles and addresses, and open the links you need without losing your place.

• Search across visible devices.
• Open individual tabs, or select several to open together.
• Copy selected links, one URL per line.
• Hide devices and restore them whenever you want.
• Remember expanded groups and your preference to show this computer.
• Use light or dark appearance and keyboard-friendly controls.

Requires Chrome 141 or newer on a desktop computer. Sign into Chrome on your devices with the same account and enable history and open-tab sync. Phones supply tabs through Chrome sync and do not need this extension installed.

Alltabs reads the snapshots Chrome provides. It cannot force devices to sync, close remote tabs, or retrieve tabs Chrome does not expose. Chrome provides up to 25 window sessions per remote device; that is not a 25-tab limit.

Tabs from other devices are supplied by Chrome's own sync service. Alltabs reads the snapshots Chrome makes available; it does not operate a separate sync service. Website icons use Chrome's built-in favicon service, and opening a link connects your browser to that website. These Chrome services and destination websites have their own privacy behavior.

## Privacy practices

Single purpose: Help users find and reopen Chrome-synced tabs from other devices in a persistent desktop side panel. Tab data is processed locally and is not uploaded to the developer, the Alltabs website, or a developer-operated server. Chrome supplies synced snapshots through its own service.

Permission justifications: copy the corresponding rows from ../PRIVACY.md. All six permissions are used. No website host permissions or content scripts are requested.

Remote code: No. All executable code is bundled in the extension.

Data categories: browsing history (open-tab URLs and titles) is accessed locally for the visible tab-management feature. Device names and display preferences are also processed locally. No browsing data is transmitted to the developer. Do not equate no server transmission with no data access; review the live dashboard's category wording and disclose browsing history consistently with this policy.

Limited use certifications: the implementation does not sell data, use it outside the single purpose, use it for advertising, or use it to determine creditworthiness or lending eligibility. Owner must review and make the dashboard certifications.

Privacy policy URL: https://alltabs.oahz48.com/privacy
Publisher: z0
Support email: oahz48@gmail.com
Homepage / support URL: https://alltabs.oahz48.com/
Distribution regions and visibility: pending owner selection.

## Reviewer instructions

Alltabs processes tab titles, URLs, searches, and selections locally on your device. It does not upload this data to the developer, the Alltabs website, or any developer-operated server. There is no Alltabs account, analytics, tracking, advertising, or remote code.

Tabs from other devices are supplied by Chrome's own sync service. Alltabs reads the snapshots Chrome makes available; it does not operate a separate sync service. Website icons use Chrome's built-in favicon service, and opening a link connects your browser to that website. These Chrome services and destination websites have their own privacy behavior.

Load or install Alltabs in desktop Chrome 141+. Pin its toolbar action and click to open the side panel. With no synced devices, the panel explains how to enable Chrome sync. No separate test credentials are required.

To test remote tabs, use a Google account with Chrome history and open-tab sync enabled on another device. Open a few normal web pages there, wait for Chrome to sync, then refresh Alltabs. Search, open a tab, select and copy links, hide a device, and restore it in Settings. Remote-tab availability depends on Chrome's sync service.

## Assets

- ../extension/icons/icon-128.png: 128×128 icon with transparent padding.
- store-assets/screenshot.png: 1280×800 screenshot of the production interface using explicitly labelled sample data.
- store-assets/promo.png: 440×280 promotional artwork.

Regenerate with `node scripts/icons.mjs` and `node tests/browser.mjs --store-assets`. Demo pages and data are excluded from the release ZIP.

Requirements checked 2026-09-07 against [images](https://developer.chrome.com/docs/webstore/images), [privacy fields](https://developer.chrome.com/docs/webstore/cws-dashboard-privacy), and [publishing](https://developer.chrome.com/docs/webstore/publish).
