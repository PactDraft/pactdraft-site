# When the GitHub account is renamed from `earthinsider` to `pactdraft`

Do these by hand after the rename (Claude was asked to remind you once the build is complete):
1. `src/_data/site.json` -> `github.owner`.
2. DNS: every record that points to `earthinsider.github.io` must now point to `pactdraft.github.io` (old test hosts, tools site, any other Pages site). GitHub does not redirect old github.io addresses.
3. n8n: GitHub credentials and every API URL that contains `/repos/earthinsider/...`.
4. Fine-grained tokens and repository secrets may need to be created again.
5. README links, the CDN repo README, and any bookmarks.
6. Check Settings -> Pages -> Custom domain is still verified and HTTPS is enforced.
Easier alternative: create a free GitHub Organization named `pactdraft` and move the repos there.
