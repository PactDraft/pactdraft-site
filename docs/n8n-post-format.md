# How n8n adds an article (3 steps, in this order)

The article slug is the file name and never changes: `src/_posts/<slug>.md` -> `https://pactdraft.com/article/<slug>/`

**1. Check the slug in THIS (site) repo.** `GET /repos/<owner>/pactdraft-site/contents/src/_posts/<slug>.md`
404 = free. 200 = taken: add `-2` and check again. (The slug is checked here, not in the image repo, because images may live in several repos over time.)

**2. Upload ONE image to the CDN repo, exactly as it should be served.**
`PUT /repos/<owner>/pactdraft-cdn/contents/image/<slug>.<ext>` with `{"message":"image: <slug>","content":"<base64>","branch":"main"}`
(To replace an existing file also send its `sha`.) It is live at `https://cdn.pactdraft.com/image/<slug>.<ext>` about a minute later.
Aim for 1280x720 (16:9) and under 100 KB. The extension is whatever you upload (webp, jpg, png, avif); write it in the front matter.

**3. Commit the article to the site repo** with the host written explicitly (so old posts keep working when a second CDN repo is added):

```
---
title: "Reform UK crypto donation reaches record levels"
date: 2026-10-28T14:32:00+05:30        # publish time WITH timezone (IST = +05:30)
updated: 2026-10-28T16:05:00+05:30     # optional: set again whenever the article is changed
category: united-kingdom               # main category slug from src/_data/categories.json
subcategory: in-national                   # optional sub category slug
image: c1/<slug>.webp                  # the file you uploaded, WITH its extension; c1 = cdn.pactdraft.com
excerpt: "One or two sentences. Also used as the meta description."
imageAlt: "Short description of the picture"
draft: false                           # true = not published
---
<p>Article body (HTML is fine)...</p>
```

How the one image is used (nothing extra to upload)
The CDN repo builds the other two versions by itself, about a minute after the upload, from the same file name:
- `https://cdn.pactdraft.com/image/<slug>.<ext>` = the original: article hero, social preview, Discover.
- `https://cdn.pactdraft.com/image/feature/<slug>.<ext>` = a bit compressed: the big first card on the home page.
- `https://cdn.pactdraft.com/image/card/<slug>.<ext>` = compressed more: every small card (latest posts, category and other multi-post sections, related posts).
Until those two exist the site shows the original, so nothing breaks. jpg and webp originals are best; png gets resized but not much smaller; avif/gif get no feature/card (the site uses the original).
`src/_data/site.json` -> `"images": {"variants": false}` makes the site use the original everywhere.

Rules
- Slug: lowercase letters, digits, hyphens. Unique forever.
- Do not put double curly braces or curly-brace-percent inside the body (the site engine would read them as code). If unavoidable, wrap that text in a raw block.
- Commit message: `post: <slug>` for new articles, `update: <slug> - <reason>` for edits.
