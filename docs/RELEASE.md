# Release readiness — Alltabs 0.1.0

This is a release candidate, not a published extension. Local preparation is complete except the manual acceptance checks below. Store approval is controlled by Google.

## Gaps closed

- Manifest V3, bundled scripts, restrictive CSP, and no website host permissions confirmed.
- All six requested permissions mapped to implemented features and privacy disclosures.
- Fixed preferences not updating in other open panels; hidden selections are cleared when those preferences arrive.
- Added syntax, manifest, permission-baseline, asset, and package-allowlist validation.
- Added a reproducible ZIP test comparing every extracted entry with its source.
- Added one fail-fast release command and a GitHub Actions workflow.
- Prepared listing text, permission explanations, reviewer instructions, privacy page, store screenshot, and promotional image.
- Removed machine-specific installation instructions; added contribution and pull-request guidance.
- Kept browser profiles, generated packages, local agent tooling, and common credential files out of Git.

## Verification

Run `node scripts/release.mjs` from the repository root with Node.js 24 and Chrome installed. No package installation required. It runs 8 unit/package tests, 12 browser checks, 5 real-extension checks, and release validation before packaging. The native checks run in a temporary unsigned-in profile. This does not validate personal account sync or macOS behavior.

Release output: `dist/alltabs-0.1.0.zip`. Only 11 approved extension files are included, with manifest.json at the root. The GitHub workflow is prepared locally; its hosted run remains pending until the repository is published.

## Publication progress — September 7, 2026

The owner reports developer registration complete. Publisher is z0; public support email is oahz48@gmail.com. The website and privacy policy are deployed to https://alltabs.oahz48.com/ and https://alltabs.oahz48.com/privacy and verified over HTTPS. Browser automation cannot access the Web Store dashboard because Chrome rejects scripting on the extensions gallery; account settings, ZIP upload, and listing fields remain unverified. See ACCEPTANCE-TEST.md for testing the extracted final package.

## Remaining steps, in order

1. In the developer dashboard, confirm publisher z0, verified contact oahz48@gmail.com, and any account verification requirements. Registration is complete per the owner.
2. Use https://alltabs.oahz48.com/privacy for the privacy policy and https://alltabs.oahz48.com/ for the homepage/support URL. Hosting is complete.
3. Complete real-device acceptance: compare remote tabs against Chrome History on Windows and macOS; open a fresh tab on each phone and check it arrives; test offline/stale sync, browser restart, two open panels, keyboard navigation and screen-reader announcements. Record browser/OS versions and results. Verify Chrome 141 compatibility if continuing to claim that minimum; this run used Chrome 152.
4. Review `docs/STORE-LISTING.md` and `docs/store-assets/`. Confirm name, contact, distribution regions, and privacy disclosures. Artwork uses labelled sample data, not personal tabs.
5. Run the release command on the final source. Upload the ZIP as a new dashboard item. Enter the prepared listing, artwork, permission justifications, remote-code declaration, privacy URL, and distribution settings. Complete the dashboard's certifications based on the actual behavior.
6. Submit for review. Resolve any reviewer feedback and upload a higher version for updates. Confirm the public store install works after approval; record the listing URL and tag the exact tested commit.

## GitHub publication

The owner authorized public source publication at https://github.com/oahz48/alltabs under the MIT License. See [OPEN-SOURCE.md](OPEN-SOURCE.md) for repository scope and validation. GitHub release tags and package attachments remain separate from this source push.

## Scope and limits

No external dependency was added. The checks include syntax and behavior; they are not a full static type checker, external security audit, or proof of store approval. No remote closing, OneTab integration, or new data collection was added.

## Submission — 2026-09-07

User confirmed successful Windows and macOS testing (macOS Chrome 152.0.7977.82 ARM64). Submitted version 0.1.0 to Chrome Web Store; dashboard confirmed Pending review. Free, public, all regions. Automatic publication is OFF: publish manually after approval, within Google's 30-day staging window. Reviewer instructions saved and verified. Homepage now shows Coming soon with awaiting-review text and no active store link. Restore the install link after publication: https://chromewebstore.google.com/detail/alltabs/ikneolohkckpkfmkbplmcneeaaelneoa .

## Website feature update — September 7, 2026

Published the six-feature homepage section and compact System requirements footnote to the existing Cloudflare Worker. Live homepage, privacy page, and both image assets verified against local files. Extension package and store publication status unchanged.
