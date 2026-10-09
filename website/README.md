# Alltabs website

Live homepage: https://alltabs.oahz48.com/
Privacy policy: https://alltabs.oahz48.com/privacy

Hosted as Cloudflare Worker `alltabs-site` on the custom domain `alltabs.oahz48.com`. The apex domain and www were not changed. No paid plan was enabled. These pages are independent of the extension package and GitHub.

Source: index.html and ../PRIVACY.md. Run `node scripts/privacy-page.mjs` then `node scripts/build-website.mjs` from the repository root to regenerate worker.js. Deploy that generated file through the Cloudflare Workers API using application/javascript, then verify the public HTTPS pages. Do not upload the entire workspace.

No analytics, cookies, forms, or external browser scripts are used. Cloudflare receives normal HTTP requests when someone visits the site. The extension does not contact the site or transmit tab data to it.

The homepage serves the extension icon and `assets/panel-preview.png` (actual panel with sample data). The build embeds these PNGs in the Worker and serves them locally. The Add to Chrome button links to the published Chrome Web Store listing. See `../AGENTS.md` and `../docs/RELEASE.md` for release status and the assigned extension ID.

## Website update — September 7, 2026

Deployed the prominent six-feature section, Features navigation link, and compact System requirements footnote to the existing alltabs-site Worker. Verified the live HTTPS homepage, privacy page, icon, and panel preview match local files. Store Coming soon status remains unchanged.

## Open-source website refinement — September 7, 2026

Deployed lighter surfaces, refined typography and spacing, a framed sample panel preview, and GitHub links in the navigation, hero, and footer. Checked desktop and 390px layouts; verified live homepage, privacy page, and both images match the local build. The existing Worker and domain remain in use.

## Neutral theme — September 7, 2026

The homepage and privacy page now use white/zinc surfaces and charcoal text, with blue homepage accents. The homepage has a dark Add to Chrome button explicitly disabled and marked Coming soon pending confirmed store publication. GitOwl was inspected as a visual reference: its public assets show Next.js, Tailwind CSS, Inter, and shadcn-style theme tokens. Alltabs follows the palette and button treatment using its existing static CSS; no framework or remote dependency was added.

## Tinted surfaces and pill actions — September 7, 2026

Deployed soft blue/lavender page and preview surfaces, with rounded gradient-outline action buttons based on GitOwl's closing call to action. GitHub has a hover fill and keyboard focus ring; Add to Chrome remains disabled and labelled Coming soon. Verified desktop and 390px layouts, no horizontal overflow, and matching live homepage, privacy page, and assets.

## Published install link — September 8, 2026

Confirmed Alltabs 0.1.0 is publicly available with Add to Chrome. Enabled the homepage install link and removed the pending-review notice and disabled-button styling. Rebuilt and syntax-checked worker.js, deployed to alltabs-site, and verified the live homepage, privacy page, and both image assets match local files.

## Store status — October 6, 2026

The public store listing reports version 0.1.1, updated September 9. The green-icon update 0.1.2 is packaged locally but not submitted because automated dashboard access was denied. The existing install link remains valid. No website rebuild or deployment was performed; the deployed website still uses its previous icon.

## Green logo deployed — October 6, 2026

Deployed the rebuilt website to the existing alltabs-site Worker using Cloudflare Quick Edit; active version 891363a0. The homepage logo, favicon, and sample panel preview now use the approved green four-square mark. Verified the public homepage, privacy page, icon PNG, and panel-preview PNG byte-for-byte against the local build. Saved a live screenshot at artifacts/website-green-logo-live.png. Domain and distribution links are unchanged.

Regenerated store artwork is in docs/store-assets/: icon-128.png, promo.png (440 x 280), and screenshot.png (1280 x 800). Previous artwork is backed up in docs/design/store-artwork-before-green/.
