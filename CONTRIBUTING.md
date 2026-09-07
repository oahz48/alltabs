# Contributing to Alltabs

Use Node.js 24. No dependency installation or build is needed. Load `extension/` in Chrome 141 or newer.

Keep browser-independent logic in `extension/model.js`, UI in `panel.js`, and service-worker behavior in `background.js`. Use native modules, descriptive names, and small functions. Avoid introducing dependencies without discussing the need.

Treat synced titles and URLs as untrusted. Insert user data through `textContent`; validate navigation through `safeUrl`. Never add analytics, network services, host permissions, or remote code without an explicit product and privacy review. Update PRIVACY.md and the store disclosures when behavior changes.

Run `node scripts/release.mjs` before proposing a release. It stops on the first failure and runs validation, unit tests, browser checks, native-extension checks, and packaging. Set ALLTABS_CHROME when Chrome is installed elsewhere. Browser tests use disposable profiles and sample data. Never attach real browsing history to an issue.

For behavior changes, add a regression test that fails before the fix. Include the problem, resulting behavior, and validation in a pull request. Keep generated test artifacts, browser profiles, credentials, and ZIPs out of Git. Review new packaged files explicitly in scripts/validate.mjs.

Report suspected vulnerabilities privately using [SECURITY.md](SECURITY.md). Use public issues only for non-sensitive bug reports and feature requests, with sample data instead of browsing history.

Alltabs is licensed under the [MIT License](LICENSE). Contributions are provided under the same license.
