# Changelog

## v1.5.0 - www address, CDN makes the three images
- Site address is now https://www.pactdraft.com (`domain`, `url`, MGID hosts).
- One upload per article. The CDN repo builds `image/feature/` and `image/card/` itself; this site only links to them. `images.variants` switches it off.
- Removed the site-side thumbnail script and its workflow steps.
- Grievance Officer wording stays at 24 hours.
Suggested commit message: `feat: www canonical address, feature/card images from the CDN build`

## v1.4.0 - one image per article, optional build-time thumbnails
- n8n uploads one image per article. Switch `images.thumbs` in `site.json`: false = that one file everywhere; true = the build also makes small cards (480x270) and the featured picture (800x450) on the main site (`scripts/make_thumbs.py`, cached by the workflow, failures are never fatal).
- Removed the separate feature/card upload idea and the per-variant extension fields.
Suggested commit message: `feat: single image per article with optional build-time thumbnails`

## v1.3.0 - the file extension is whatever you upload
- `image: c1/<slug>.<ext>` carries the real extension (webp, jpg, png, avif). The hero, social preview and Discover image use that original file; the home featured card and all small cards use their own files from `image/feature/` and `image/card/` (same extension unless `imageFeatureExt` / `imageCardExt` say otherwise).
- `og:image:type` follows the extension. Shared helper in `lib/image.js`.
Suggested commit message: `feat: per-article image extension, card and feature files follow it`

## v1.2.0 - three images per article
- Hero (original) `image/<slug>.webp`, home featured card `image/feature/<slug>.webp`, small cards `image/card/<slug>.webp`. Missing feature/card files fall back to the hero.
- The browser connects early to the image host(s) of each page (max 2) and the main image of the page is preloaded (article hero; home featured card).
Suggested commit message: `feat: hero, feature and card images with automatic preconnect and preload`

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
