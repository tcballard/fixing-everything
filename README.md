# Fixing Everything — Omarchy

Tom Ballard’s independent home for Omarchy writing, learning material and projects.
Intended public domain: **omarchy.tcballard.dev**. Domain activation is not implied by this repository.

```sh
npm ci
npm test
npm run build
npm run check
npm run dev
```

Static HTML, CSS and minimal progressive JavaScript. Markdown and JSON front matter are the source of truth; no database or account is needed to read the public site.

- [Authoring and 101 integration](docs/AUTHORING.md)
- [Deployment and exact DNS steps](docs/DEPLOYMENT.md)
- [Migration register and missing source material](docs/MIGRATION.md)
- [Verification results](docs/VERIFICATION.md)

`npm run build:review` includes clearly labelled drafts for an **owner-only** preview. Never deploy that output publicly. The public workflow always rebuilds without drafts.

The homepage, `/explaining`, `/today`, `/projects` and `/about` work without JavaScript. JavaScript adds topic filtering and command copying, with clipboard-denial feedback and manual selection fallback.

This public code branch excludes recovered drafts and private publication artwork. The owner-only preview and migration register retain that material separately.
