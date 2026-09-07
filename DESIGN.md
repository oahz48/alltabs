# Alltabs v0.1 agreed design

The user wants to repeatedly open tabs from other devices without navigating back through nested Chrome menus. The central invariant is that opening a tab preserves the panel, search, expansion, and scroll position.

- Global side panel, toggled by the pinned extension icon, with an internal close button.
- Other devices first, sorted by most recent sync. Remote devices expanded initially; local tabs collapsed. Remember user expansion choices.
- Group by device and window. Search titles and URLs. Display counts and sync timestamps.
- Click creates and activates a new local tab. Ctrl/Cmd-click and middle-click create background tabs. Repeated opening can create duplicates.
- Selection checkboxes reveal Open selected and Copy links. Device menus expose Open all, Select all, and Hide. Hidden devices can be restored in settings.
- Opening and visible periodic/manual refresh read Chrome's snapshot. Refresh preserves the browsing position.
- Clean, compact appearance with automatic light/dark theme and an abstract icon. Straightforward workflow inspired by OneTab.
- No account, external server, analytics, or separate sync transport. Preferences local. First release for personal PC/Mac use, with mobile devices contributing Chrome-synced tabs.
- Test target: 500 remote tabs across four devices.
- Accept public API limits: no guaranteed instantaneous remote state; panel-only hiding; at most 25 windows per remote device. Defer remote closing and direct OneTab integration.
- Public store submission follows daily-use validation, rather than being part of this personal-test build.
