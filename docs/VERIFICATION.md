# Verification — 13 September 2026

## Passed

- Public code uses synthetic test fixtures for content validation, public draft exclusion, private review isolation, daily rendering/metadata, command copying and denied-clipboard fallback, and topic filtering/reset.
- Internal routes, assets, heading structure and feeds are checked by `npm run check`.
- The full private preview separately verifies recovered text against original source files. Those files and rendered drafts are not included in this public branch.
- Fonts are valid WOFF2 files with the included OFL licence.

## Not verified

- Browser-based desktop/mobile rendering, 200% text zoom, live keyboard navigation, actual clipboard behavior and image loading. The supervised preview starts, but the cloud browser rejects its address with `ERR_BLOCKED_BY_CLIENT`. One retry after preview configuration was checked produced the same result. No visual screenshots or passing browser results are claimed.
- Responsive CSS includes desktop, tablet and narrow-phone layouts, wrapping navigation, horizontal code/table scrolling, visible focus styles, a skip link and reduced-motion handling. These are implemented and statically checked, not a substitute for browser testing.
- Actual installation, invocation and article opening on an Omarchy desktop. These are also unverified in the 101 proposals.
- Custom-domain DNS, TLS, canonical pages and HTTP 404 behavior at `omarchy.tcballard.dev`. The site must not be described as live there until checked.
- Original X publication URLs/dates and missing Today edition sources; see the migration register.

## Manual acceptance checklist

1. At 390px, 768px and 1440px widths, review the homepage, series index and a long explanation. Check navigation wrapping, paragraph measure and no page-level horizontal overflow.
2. At 200% text enlargement, check that every label and link remains reachable.
3. Use Tab/Shift+Tab/Enter through the skip link, navigation, topic selector, previous/next links, 101 details and Copy command button. Confirm visible focus throughout.
4. Copy a command and compare it to the code block. Deny clipboard permission and confirm the selected-text fallback and status message.
5. Disable JavaScript: articles, navigation, topic list and command text remain readable.
6. Open a real published article from RSS and the sitemap. Confirm its original X link and any captions against the original publication.
7. Run the public build and verify every draft route returns 404 after deployment.

The automated CI workflow performs a clean install, the seven tests, a public build and static checks. The separate manual publication workflow verifies `mode: public` before deployment.
