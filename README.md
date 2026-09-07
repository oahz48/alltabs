<p align="center"><img src="extension/icons/icon-128.png" width="80" height="80" alt="Alltabs icon"></p>
<h1 align="center">Alltabs</h1>
<p align="center">Your Chrome tabs, across devices. One side panel.</p>
<p align="center"><a href="https://alltabs.oahz48.com/">Website</a> · <a href="docs/USER-GUIDE.md">User guide</a> · <a href="PRIVACY.md">Privacy</a> · <a href="LICENSE">MIT License</a></p>

Browse tabs from your other devices, search by title or address, and open or copy the links you need. Alltabs processes tab data locally, with no accounts, analytics, or developer servers. Synced tabs come from Chrome's own sync service.

<p align="center"><img src="website/assets/panel-preview.png" width="300" alt="Alltabs side panel with tabs grouped by device"></p>
<p align="center"><sub>Actual interface · sample data</sub></p>

## Install

**Chrome Web Store: coming soon.** Version 0.1.0 was submitted and observed pending review on September 7, 2026.

To try it now:

1. Clone or download this repository.
2. Open `chrome://extensions` and enable **Developer mode**.
3. Choose **Load unpacked** and select the `extension` folder.
4. Pin Alltabs, then click its icon to open the panel.

Requires Chrome 141+ on Windows or macOS. Sign into Chrome on your devices with history and open-tab sync enabled. Phones supply tabs through Chrome sync; they don't need the extension.

## Develop

Plain HTML, CSS, and JavaScript. Use Node.js 24 and Chrome; no dependency installation is needed.

```sh
npm run test
npm run test:browser
npm run test:extension
npm run release
```

Set `ALLTABS_CHROME` if Chrome is installed outside the default Windows location. See [Contributing](CONTRIBUTING.md) for code guidelines and [Release notes](docs/RELEASE.md) for publication details.

## Support

[Report a bug](https://github.com/oahz48/alltabs/issues) or email [oahz48@gmail.com](mailto:oahz48@gmail.com). Please use sample data in reports. Report vulnerabilities privately through [SECURITY.md](SECURITY.md).
