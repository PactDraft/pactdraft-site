# Launch checklist (in this order)

1. Domain: pactdraft.com is already set in `src/_data/site.json` (`domain`, `url`, `imageHosts.c1`). Delete the three `test-article-*.md` files before launch.
2. GitHub: create the site repo (public) and the image repo `pactdraft-cdn` (public). Pages source = GitHub Actions in both.
3. DNS: apex/www -> site repo, `cdn` -> image repo (DNS only, grey cloud).
4. Publish about 30 articles while the site is still hidden (`"indexable": false`).
5. Open the site on a phone: dark mode, search, every page in the footer, 404 page.
6. MGID: manager moves the domain (same site and widget IDs) -> set `"enabled": true` in `src/_data/mgid.json` -> check `?adaudit=1` on a post.
7. Check `ads.txt` on the live domain.
8. Set `"indexable": true` in `site.json`, deploy, then add the site in Google Search Console (Domain property) and send `sitemap.xml` and `sitemap-news.xml`.
9. Google Publisher Center (Google News) and Bing Webmaster Tools.
10. Confirm `editorial.humanReview` and `editorial.aiAssisted` in `site.json` say what is true. The Editorial Policy page reads them.
