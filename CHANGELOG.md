# Changelog

## v1.1.0 - one image per article, real domain
- Images are served exactly as uploaded: `https://cdn.pactdraft.com/image/<slug>.webp` (no 480/800/1280 variants, no og.jpg). Slug is checked in this repo by n8n.
- Image settings in `site.json`: `imageExt`, `imageWidth`, `imageHeight`.
- `domain`, `url` and image host now point to pactdraft.com / cdn.pactdraft.com. `indexable` is still false and MGID is still off.
Suggested commit message: `change: single image per article from cdn.pactdraft.com/image/<slug>.webp, real domain config`

## v1.0.1 - build fix
- Config file renamed `.eleventy.js` -> `eleventy.config.js` (a phone upload had turned the dot-file into ". eleventy.js", so Eleventy ignored it and looked for `_includes` in the wrong place).
- Workflow and npm scripts call `eleventy --config=eleventy.config.js`.
- About page title no longer shows template braces.
Suggested commit message: `fix: config file without leading dot so the build finds src/_includes`

## v1.0.0 - PactDraft rebrand (first release of this repo)
- One brand file: `src/_data/site.json` (name, domain, address, email, founder, author, image hosts, footer links, indexing switch).
- Article URLs `/article/<slug>/`, no dates. Images from the CDN repo: `cdn.pactdraft.com/img/<slug>/`.
- New logos with dark variants, icons, manifest and default social image.
- Trust pages: About, Contact, Editorial, Corrections, Advertise, Privacy, Cookies, Terms, Copyright, Grievance Officer, author page.
- Discover and SEO: NewsArticle JSON-LD with full publish time, news sitemap, robots switch, llms.txt, preload of the hero image.
- Ads: MGID off until the domain change; loads only after consent (Europe/UK) and first interaction or 5 s; fixed "filled" detection so dark panel and margins apply.
- Removed: old archive, fake newsletter and alert widgets, old-brand ad verification tags.
Suggested commit message: `feat: PactDraft rebrand with CDN images, trust pages and discover-ready metadata`
