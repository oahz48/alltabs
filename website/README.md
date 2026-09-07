# Alltabs website

Live homepage: https://alltabs.oahz48.com/
Privacy policy: https://alltabs.oahz48.com/privacy

Hosted as Cloudflare Worker `alltabs-site` on the custom domain `alltabs.oahz48.com`. The apex domain and www were not changed. No paid plan was enabled. These pages are independent of the extension package and GitHub.

Source: index.html and ../PRIVACY.md. Run `node scripts/privacy-page.mjs` then `node scripts/build-website.mjs` from the repository root to regenerate worker.js. Deploy that generated file through the Cloudflare Workers API using application/javascript, then verify the public HTTPS pages. Do not upload the entire workspace.

No analytics, cookies, forms, or external browser scripts are used. Cloudflare receives normal HTTP requests when someone visits the site. The extension does not contact the site or transmit tab data to it.

The homepage serves the extension icon and `assets/panel-preview.png` (actual panel with sample data). The build embeds these PNGs in the Worker and serves them locally. The Chrome Web Store label is intentionally non-clickable while review is pending. After publication, replace it with the installation link and remove the awaiting-review notice. See `../AGENTS.md` and `../docs/RELEASE.md` for release status and the assigned extension ID.
