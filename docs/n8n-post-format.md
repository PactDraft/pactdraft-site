# How n8n adds an article (3 steps, in this order)

The article slug is the file name and never changes: `src/_posts/<slug>.md` -> `https://pactdraft.com/article/<slug>/`

**1. Check the slug in THIS (site) repo.** `GET /repos/<owner>/pactdraft-site/contents/src/_posts/<slug>.md`
404 = free. 200 = taken: add `-2` and check again. (The slug is checked here, not in the image repo, because images may live in several repos over time.)

**2. Upload THREE ready-made images to the CDN repo (served exactly as uploaded, nothing is resized there).**
Three `PUT /repos/<owner>/pactdraft-cdn/contents/<path>` calls with `{"message":"image: <slug>","content":"<base64>","branch":"main"}` (to replace a file also send its `sha`):

| Path | Used for | Size to aim for |
|---|---|---|
| `image/<slug>.<ext>` | hero on the article page, social preview and Discover (original size, original file type) | 1280x720, as you like |
| `image/feature/<slug>.<ext>` | the big featured card on the home page (a bit less compressed than cards) | 800x450, 25-55 KB |
| `image/card/<slug>.<ext>` | every small card: latest posts, categories, related posts (heavily compressed) | 480x270, 8-20 KB |

The extension is whatever you upload (webp, jpg, png, avif). It is written in the front matter `image:` line; the feature and card files are expected to have the same extension unless you add `imageFeatureExt` / `imageCardExt`. All three are 16:9. They are live at `https://cdn.pactdraft.com/image/...`. If a feature or card file is missing, the site falls back to the hero file (slower, but never broken), and the CDN workflow prints a warning.

**3. Commit the article to the site repo** with the host written explicitly (so old posts keep working when a second CDN repo is added):

```
---
title: "Reform UK crypto donation reaches record levels"
date: 2026-10-28T14:32:00+05:30        # publish time WITH timezone (IST = +05:30)
updated: 2026-10-28T16:05:00+05:30     # optional: set again whenever the article is changed
category: united-kingdom               # main category slug from src/_data/categories.json
subcategory: uk-national               # optional sub category slug
image: c1/<slug>.webp                  # hero file WITH the extension you uploaded; c1 = cdn.pactdraft.com
# imageFeatureExt: webp                # only if the feature file has a different extension than the hero
# imageCardExt: webp                   # only if the card file has a different extension than the hero
excerpt: "One or two sentences. Also used as the meta description."
imageAlt: "Short description of the picture"
draft: false                           # true = not published
---
<p>Article body (HTML is fine)...</p>
```

Rules
- Slug: lowercase letters, digits, hyphens. Unique forever.
- Images: WebP, 16:9, compressed BEFORE upload, three files per article (see the table above).
- Do not put double curly braces or curly-brace-percent inside the body (the site engine would read them as code). If unavoidable, wrap that text in a raw block.
- Commit message: `post: <slug>` for new articles, `update: <slug> - <reason>` for edits.
