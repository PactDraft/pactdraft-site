# PactDraft site (pactdraft.com)

Eleventy + Tailwind, deployed to GitHub Pages by `.github/workflows/deploy.yml`. This repo holds code and articles only; images live in the `pactdraft-cdn` repo.

## One file controls the brand
`src/_data/site.json`: name, domain, address, email, founder, author byline, image hosts, footer links, `indexable`.
Change it there and every page, feed, sitemap and schema follows. Logos are in `src/assets/icons/`.

## Hidden until launch
`"indexable": false` adds `noindex` to every page and `Disallow: /` to robots.txt. Set it to `true` on launch day.

## Articles
See `docs/n8n-post-format.md`. File name = URL slug = image folder name.

## Images
n8n uploads ONE image per article to the CDN repo (`pactdraft-cdn`). `src/_data/site.json` -> `"images": {"thumbs": false}` uses that file everywhere. Set `"thumbs": true` and the build makes small cards and the featured picture itself (`scripts/make_thumbs.py`, cached, never breaks the build). Add `src/assets/thumbs/` and `src/_data/thumbs.json` to `.gitignore`.

## Ads
`src/_data/mgid.json` -> `"enabled": false` until MGID confirms the new domain. Debug: add `?adaudit=1` (on-screen report) or `?noads=1` to a URL.

## More
`docs/LAUNCH-CHECKLIST.md`, `docs/GITHUB-RENAME-REMINDER.md`, `CHANGELOG.md`.
