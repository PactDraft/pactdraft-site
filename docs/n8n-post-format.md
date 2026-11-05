# How n8n adds an article

One file per article in `src/_posts/` of the site repo. The FILE NAME is the slug and never changes:
`src/_posts/reform-uk-crypto-donation-record.md` -> `https://pactdraft.com/article/reform-uk-crypto-donation-record/`

```
---
title: "Reform UK crypto donation reaches record levels"
date: 2026-10-28T14:32:00+05:30        # publish time WITH timezone (IST = +05:30)
updated: 2026-10-28T16:05:00+05:30     # optional: set again whenever the article is changed
category: united-kingdom               # main category slug from src/_data/categories.json
subcategory: in-national                   # optional sub category slug
excerpt: "One or two sentences. Also used as the meta description."
imageAlt: "Short description of the picture"
draft: false                           # true = not published
---
<p>Article body (HTML is fine)...</p>
```

Rules
- Slug: lowercase letters, digits, hyphens. Unique forever. Check the file does not exist yet; if it does, add `-2`.
- The image is NOT in this repo. Upload the original to the CDN repo first as `incoming/<same-slug>.png` (see the pactdraft-cdn README). Nothing else is needed in the front matter: the site finds `cdn.pactdraft.com/img/<slug>/...` by itself.
- Image width must be at least 1152 px so the 1280 px version exists.
- Do not put double curly braces or curly-brace-percent inside the body (the site engine would read them as code). If unavoidable, wrap that text in a raw block.
- Commit message: `post: <slug>` for new articles, `update: <slug> - <reason>` for edits.
