# Changelog

## v1.0.0 - PactDraft rebrand (first release of this repo)
- One brand file: `src/_data/site.json` (name, domain, address, email, founder, author, image hosts, footer links, indexing switch).
- Article URLs `/article/<slug>/`, no dates. Images from the CDN repo: `cdn.pactdraft.com/img/<slug>/`.
- New logos with dark variants, icons, manifest and default social image.
- Trust pages: About, Contact, Editorial, Corrections, Advertise, Privacy, Cookies, Terms, Copyright, Grievance Officer, author page.
- Discover and SEO: NewsArticle JSON-LD with full publish time, news sitemap, robots switch, llms.txt, preload of the hero image.
- Ads: MGID off until the domain change; loads only after consent (Europe/UK) and first interaction or 5 s; fixed "filled" detection so dark panel and margins apply.
- Removed: old archive, fake newsletter and alert widgets, old-brand ad verification tags.
Suggested commit message: `feat: PactDraft rebrand with CDN images, trust pages and discover-ready metadata`
