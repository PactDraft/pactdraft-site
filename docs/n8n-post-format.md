# How n8n adds an article (3 steps, in this order)

The article slug is the file name and never changes: `src/_posts/<slug>.md` -> `https://pactdraft.com/article/<slug>/`

**1. Check the slug in THIS (site) repo.** `GET /repos/<owner>/pactdraft-site/contents/src/_posts/<slug>.md`
404 = free. 200 = taken: add `-2` and check again. (The slug is checked here, not in the image repo, because images may live in several repos over time.)

**2. Upload the image to the CDN repo, exactly as it should be served.**
`PUT /repos/<owner>/pactdraft-cdn/contents/image/<slug>.webp` with `{"message":"image: <slug>","content":"<base64>","branch":"main"}`
(To replace an existing file also send its `sha`.) It is then live at `https://cdn.pactdraft.com/image/<slug>.webp`.

**3. Commit the article to the site repo** with the host written explicitly (so old posts keep working when a second CDN repo is added):

```
---
title: "Reform UK crypto donation reaches record levels"
date: 2026-10-28T14:32:00+05:30        # publish time WITH timezone (IST = +05:30)
updated: 2026-10-28T16:05:00+05:30     # optional: set again whenever the article is changed
category: united-kingdom               # main category slug from src/_data/categories.json
subcategory: uk-national               # optional sub category slug
image: c1/<slug>                       # c1 = cdn.pactdraft.com
excerpt: "One or two sentences. Also used as the meta description."
imageAlt: "Short description of the picture"
draft: false                           # true = not published
---
<p>Article body (HTML is fine)...</p>
```

Rules
- Slug: lowercase letters, digits, hyphens. Unique forever.
- Image: WebP, 16:9, compressed BEFORE upload (aim for 1280x720 and 40-90 KB). The same file is used for the hero, the home page cards and the social preview, so keep it small.
- Do not put double curly braces or curly-brace-percent inside the body (the site engine would read them as code). If unavoidable, wrap that text in a raw block.
- Commit message: `post: <slug>` for new articles, `update: <slug> - <reason>` for edits.
