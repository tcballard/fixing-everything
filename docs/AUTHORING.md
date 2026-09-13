# Authoring Fixing Everything

The source of truth is one Markdown file per article in `content/articles/`.
The body is written once. The builder renders article pages and full-text feeds from it.

## Run locally

Requires Node.js 22+ and npm.

```sh
npm ci
npm test
npm run build
npm run dev
```

`npm run build` is the **public** build. It excludes drafts entirely, including their routes.
`npm run build:review` builds an explicitly labelled **private editorial preview** with draft pages.
Never deploy a review build to a public host. `dist/` records the last built output; always rebuild before deployment.
The hosted preview in the handoff is private. Draft pages carry noindex and omit canonical and publication metadata.

## Article format

Create a Markdown file using the structure below. Front matter is JSON for strict validation; do not add trailing commas.

```markdown
---json
{
  "id": "explaining-stable-id",
  "series": "explaining",
  "title": "Exact article title",
  "slug": "stable-url-slug",
  "summary": "A short, accurate description.",
  "author": "Tom Ballard",
  "status": "draft",
  "draftDate": "2026-09-13",
  "publishedAt": null,
  "updatedAt": null,
  "originalXUrl": null,
  "order": 6,
  "topics": ["Desktop"],
  "lessonId": null,
  "sources": [],
  "media": []
}
---
Introduction, followed by the complete article body.

## First heading

Text with [citations](https://example.com/source).
```

This example is authoring guidance, not a published article. Do not copy its sample date as a publication date.

- `id`: stable feed GUID; never change it to rename a title.
- `series`: `explaining` or `today`. Weekly schema support is reserved for extending the publication; add its index/feed and navigation before using it.
- `slug`: lowercase words and hyphens; unique within the series. This fixes the canonical route.
- `status`: `draft` or `published`. Publishing requires an actual `publishedAt` date in `YYYY-MM-DD` form.
- `draftDate`: date on the source draft; never treated as evidence of publication.
- `updatedAt`: optional actual revision date. Do not update it for a rebuild alone.
- `originalXUrl`: the verified original X status or Article URL, when available. It appears as “Originally published on X”. Never guess a post ID.
- `order`: positive unique integer within the explaining series. It controls the index and previous/next reading sequence.
- `topics`: topic labels for the index filter; works as a complete list without JavaScript.
- `lessonId`: one of `super`, `terminal`, `workspace`, `launcher`, `browser`, `focus`, `help`, or `null`. Only use it when the article supports that lesson.
- `sources`: the original source URLs. Preserve inline Markdown citations in place; this field records provenance rather than replacing citations.
- `media`: optional figures after the body, each with `src`, `alt`, `width`, `height`, and optional `caption`. Put assets in `assets/`. Inline Markdown images stay in their original position and must have alt text.
- `provenance`: optional migration evidence. Existing source filenames and SHA-256 hashes identify the recovered originals. Preserve these records.

Raw HTML and unsafe links are rejected. Markdown supports headings, lists, quotes, links, images, tables and fenced code. Long code blocks scroll horizontally rather than stretching the page.

## Publish a verified article

1. Obtain the complete source text and original media. Verify the X URL and publication date, or explicitly choose a new first-publication date for a never-published draft.
2. Preserve the original wording and citations. Strip only writing-block envelopes, duplicated title/date labels, and separate social captions; do not silently edit the article.
3. Set the exact metadata, then `status: "published"` and the verified date.
4. Run `npm test`, `npm run build`, and `npm run check`. Inspect mobile/desktop and keyboard behavior in a working browser.
5. Deploy the **public** output. Verify the canonical page, feeds and images before announcing it.

No script edits or publishes X posts.

## 101 companion integration

Checked 13 September 2026: PR #2 and PR #3 are open drafts, not merged or released. The website's command UI explicitly targets the preview code at `f3e5e07610d2a819d7600331aa17b0c9bd8fd587`.

The command copies text for an installed, enabled compatible checkout. It is not a browser deep link or installer. The UI provides the pinned checkout and links to its installation instructions.

After a compatible 101 release, recheck its README, lesson IDs and command support before changing `content/site.json` and the compatibility copy in `scripts/build.mjs`.

Publish and verify the canonical article **first**. Only then add its exact title and canonical URL to `Articles.js` in the 101 repository. Run that repository's tests and verify the link in the real desktop. This website build has not changed `Articles.js`.

## Changing URLs

Prefer keeping slugs stable. If one must change, add an explicit redirect at the old route before deployment, and update internal links plus the plugin mapping only after verifying the new page. Do not derive the new URL from a changed title automatically. Keep the article `id` unchanged.

For GitHub Pages, a redirect page needs a canonical link, immediate meta refresh and visible fallback link. Sites deployments can also use `_redirects`; test its behavior on the chosen host. Avoid redirecting old article URLs to the homepage merely because the content is missing.

## Feeds

- `/rss.xml`: all published articles, newest first, with complete Markdown body.
- `/explaining/rss.xml`: published explanations.
- `/today/rss.xml`: published daily editions.
- `/sitemap.xml`: the five section pages plus published article routes.

Drafts are absent from every feed and sitemap even in review mode.
