# Deployment and domain handoff

## Inspected infrastructure — 13 September 2026

- `https://tcballard.dev` serves GoDaddy Website Builder HTML (DPS server, Montserrat/Playfair Display/Source Sans Pro). No editable personal-site code repository was identified for that live origin.
- A separate existing Sites project, “Tom Ballard”, is published at `https://tom-ballard-home.tcballard19941011.chatgpt.site`. It was identified but not modified.
- `tcballard/fixing-everything` has `main` containing `.nojekyll`, and a `gh-pages` branch with generated static publication pages and empty feeds. Its canonical URLs point to `https://tcballard.github.io/fixing-everything/`. No article bodies are present there.
- `tcballard/omarchy-site` is a fork of the official Omarchy website, not Tom’s publication. Its approved JetBrains Mono WOFF2 assets were reused with the font licence.
- The GitHub Pages settings API was not readable from the available public request; current Pages configuration and domain DNS ownership were not confirmed. GoDaddy hosting does not prove GoDaddy is the DNS provider.

This change reuses the `fixing-everything` repository. Existing `gh-pages` output and the personal website were not overwritten.

## Private review preview

The Sites preview is owner-only and includes five clearly labelled drafts. Its exact deployed URL is supplied in the handoff. It is not the public launch, and it does not prove `omarchy.tcballard.dev` is live.

The separate private checkout retains its Sites identity. This public branch deliberately excludes its hosting manifest and private content. Build with `npm run build:review`, push the exact source to the Site’s source repository, save the matching static archive and deploy it privately. The deployment manifest must report success before handing it over.

## Public deployment using the existing GitHub repository

The included workflow is manual; pushes and pull requests only run checks. Publication is a separate action.

1. Merge the reviewed implementation into `tcballard/fixing-everything` `main`.
2. Confirm the articles to publish, complete their metadata and run the checks. Leave unverified articles as drafts.
3. In the repository, open **Settings → Pages → Build and deployment**. Select **GitHub Actions** as the source.
4. Under **Actions → Publish public Omarchy site**, choose **Run workflow** on `main`. It runs a fresh public build, verifies the output, uploads it and deploys through the `github-pages` environment.
5. In **Settings → Pages → Custom domain**, enter `omarchy.tcballard.dev` and save. If the account requires domain verification, add the exact TXT record GitHub displays; it is account-specific and must not be guessed.
6. At the authoritative DNS provider for `tcballard.dev`, configure this record:

| Type | Name/host | Target | TTL |
| --- | --- | --- | --- |
| CNAME | `omarchy` | `tcballard.github.io` | Provider default |

Use a hostname only: no `https://`, path or trailing slash. Replace a conflicting record only for the `omarchy` subdomain. Keep the apex website, `www`, `oss` and mail records unchanged.

7. Wait for GitHub’s DNS check and certificate provisioning, then enable **Enforce HTTPS**.
8. Verify `https://omarchy.tcballard.dev/`, `/explaining`, `/today`, `/projects`, `/about`, a real published article, RSS, sitemap, images and a missing URL returning 404. Check that canonicals use the custom domain and that drafts cannot be loaded.
9. Only after those checks, activate verified 101 article mappings and announce the public site.

The target above is for **GitHub Pages**, not the private Sites preview. Do not point the same hostname at both hosts. If selecting Sites for public hosting instead, first deploy the public-only build and then register the custom domain there; use the exact CNAME and validation records it returns. A pre-publication domain-registration attempt was rejected with “Publish the Site before adding a custom domain”; no domain was registered by that attempt.

## Rollback

Keep the former `gh-pages` branch and commit history. For an Actions deployment, rerun the last known-good public revision after checking its canonical origin. For Sites, redeploy the prior known-good saved version without rebuilding it. A rollback must not substitute a private review build for the public site.
