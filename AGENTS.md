# Alltabs project instructions

## Git workflow

- Keep source code, tests, website sources, and project documentation under Git version control. Commit completed, verified work when the user requests Git control; do not leave the agent instructions outside version control.
- The owner authorized public GitHub publication at `https://github.com/oahz48/alltabs` under the MIT License. Keep pushes scoped to reviewed project files.
- Never commit credentials, private keys, local caches, browser profiles, or generated release ZIPs. Keep `dist/`, `artifacts/`, and local `.agents/` skills ignored.
- Read `docs/RELEASE.md` and `website/README.md` before release or website work. Update these records when publishing status changes.

## Current release record (2026-09-07)

- Alltabs 0.1.0 was submitted to the Chrome Web Store; the dashboard confirmed **Pending review**. This is a historical observation: verify the current dashboard before claiming a new status.
- Extension ID: `ikneolohkckpkfmkbplmcneeaaelneoa`. Publisher: `z0`. Public support: `oahz48@gmail.com`.
- Distribution is free, public, all regions. Automatic publication is **off**. After approval, manual publication is required within Google's stated 30-day staging window.
- The user confirmed final-package tests pass on Windows and macOS, including macOS Chrome 152.0.7977.82 ARM64.
- Homepage: https://alltabs.oahz48.com/ ; privacy: https://alltabs.oahz48.com/privacy . Hosted by Cloudflare Worker `alltabs-site`; do not change the apex domain or www as part of routine website edits.
- The homepage intentionally has a non-clickable “Chrome Web Store · Coming soon” label and awaiting-review text. After confirmed publication, replace it with the install link: https://chromewebstore.google.com/detail/alltabs/ikneolohkckpkfmkbplmcneeaaelneoa . Do not imply it is installable before then.

## Product and quality

- Preserve the privacy promise: Alltabs processes tab data locally and sends no tab data to developer servers. No analytics, tracking, accounts, or remote code. Chrome sync, Chrome's favicon service, and destination websites have their own network/privacy behavior; keep that distinction clear in website and store copy.
- Use actual panel previews with sample data clearly labeled. Keep website assets locally served and avoid third-party tracking or scripts.
- Run appropriate validation for changes. `npm run check` runs package validation, unit/package tests, browser tests, and real-extension tests. `npm run release` performs checks and creates the release package. Do not change an already-submitted version's package without planning a new store upload/version.
- Website build: `node scripts/privacy-page.mjs` then `node scripts/build-website.mjs`. Check generated `website/worker.js` syntax and verify live pages/assets after an authorized deployment.
- Ask before installing non-Python dependencies or tools. Follow the user's global AGENTS instructions for Python environments.
