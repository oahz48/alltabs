# Open-source publication

The owner authorized publishing Alltabs at https://github.com/oahz48/alltabs under the MIT License on September 7, 2026. Website: https://alltabs.oahz48.com/.

## Repository contents

Source, tests, development scripts, project documentation (including AGENTS.md), and website sources and sample artwork belong in Git. The generated website Worker remains tracked as the deployment artifact used by the website workflow.

Browser profiles, local agent tooling, caches, dependencies, credentials, logs, and release archives are excluded. The existing history is retained. A common-credential-pattern scan of both prior commits found no matches; this limited scan does not replace a security audit.

## Validation and release

Run node scripts/release.mjs for the full validation and packaging gate. The Windows Quality workflow runs the same command on GitHub. Report vulnerabilities using SECURITY.md.

GitHub source publication is separate from Chrome Web Store publication. Version 0.1.0 was observed pending review on September 7, 2026. Do not claim store availability until confirmed. Create release tags and attach packages only when the exact tested release is selected.
