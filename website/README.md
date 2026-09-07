# Alltabs website

Live homepage: https://alltabs.oahz48.com/
Privacy policy: https://alltabs.oahz48.com/privacy

Hosted as Cloudflare Worker `alltabs-site` on the custom domain `alltabs.oahz48.com`. The apex domain and www were not changed. No paid plan was enabled. These pages are independent of the extension package and GitHub.

Source: index.html and ../PRIVACY.md. Run `node scripts/privacy-page.mjs` then `node scripts/build-website.mjs` from the repository root to regenerate worker.js. Deploy that generated file through the Cloudflare Workers API using application/javascript, then verify the public HTTPS pages. Do not upload the entire workspace.

No analytics, cookies, forms, or external browser scripts are used. Cloudflare receives normal HTTP requests when someone visits the site. The extension does not contact the site or transmit tab data to it.

The homepage serves the extension icon and `assets/panel-preview.png` (actual panel with sample data). The build embeds these PNGs in the Worker and serves them locally. The Chrome Web Store label is intentionally non-clickable while review is pending. After publication, replace it with the installation link and remove the awaiting-review notice. See `../AGENTS.md` and `../docs/RELEASE.md` for release status and the assigned extension ID.

## Website update — September 7, 2026

Deployed the prominent six-feature section, Features navigation link, and compact System requirements footnote to the existing alltabs-site Worker. Verified the live HTTPS homepage, privacy page, icon, and panel preview match local files. Store Coming soon status remains unchanged.

## Open-source website refinement — September 7, 2026

Deployed lighter surfaces, refined typography and spacing, a framed sample panel preview, and GitHub links in the navigation, hero, and footer. Checked desktop and 390px layouts; verified live homepage, privacy page, and both images match the local build. The existing Worker and domain remain in use.
