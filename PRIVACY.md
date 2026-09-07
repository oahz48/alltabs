# Alltabs privacy

Alltabs displays open tabs that Chrome makes available from your synced devices, plus non-incognito tabs from the current computer. Tab titles and addresses are used only to display, search, select, copy, and open tabs at your request.

## Local processing; no upload to Alltabs

Alltabs processes tab titles, URLs, searches, and selections locally on your device. It does not upload this data to the developer, the Alltabs website, or any developer-operated server. There is no Alltabs account, analytics, tracking, advertising, or remote code.

Tabs from other devices are supplied by Chrome's own sync service. Alltabs reads the snapshots Chrome makes available; it does not operate a separate sync service. Website icons use Chrome's built-in favicon service, and opening a link connects your browser to that website. These Chrome services and destination websites have their own privacy behavior.

## Local storage

- Chrome extension local storage holds expanded-device choices, hidden device names, and the preference to show the current device. These preferences are not synced by Alltabs.
- Chrome extension session storage holds per-window search text, scroll position, and selected tab identifiers. Chrome clears this storage when the browser session ends or the extension is disabled, reloaded, updated, or removed.
- Tab snapshots stay in panel memory. Alltabs does not maintain a separate saved browsing history.
- Copy links writes only the selected URLs to the clipboard when you press that button.

Removing Alltabs removes its extension storage. Chrome sync and the operating system clipboard are managed separately by Chrome and your operating system.

## Permissions

| Permission | Purpose |
| --- | --- |
| `sidePanel` | Display the panel and support opening, toggling, and closing it. |
| `sessions` | Read the synced device and window snapshots Chrome exposes. |
| `tabs` | Read titles and URLs of current-device tabs and synced tab details. |
| `storage` | Remember display preferences and panel state on this computer. |
| `favicon` | Display website icons through Chrome's built-in favicon service. |
| `clipboardWrite` | Copy selected links when you request it. |

Alltabs requests no website host permissions and injects no code into web pages. Opening a link navigates Chrome to that destination; those websites and Chrome's own sync and favicon services have their own privacy behavior.

Alltabs uses browsing data only to provide its visible tab-management features. It does not sell this data, use it for advertising, or use it for credit or lending decisions. Its use of information complies with the Chrome Web Store User Data Policy, including the Limited Use requirements.

Last updated: September 7, 2026. Applies to Alltabs 0.1.0.

## Contact

Publisher: z0. For support or privacy questions, contact oahz48@gmail.com.
