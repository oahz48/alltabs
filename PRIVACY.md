# Alltabs privacy

Alltabs displays open tabs that Chrome makes available from your synced devices, plus non-incognito tabs from the current computer. Tab titles and addresses are used only to display, search, select, copy, and open tabs at your request.

Alltabs has no separate account, server, analytics, advertising, or third-party scripts. It does not send your browsing data to the developer or any Alltabs service.

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

This policy describes the bundled personal-test release, version 0.1.0.
