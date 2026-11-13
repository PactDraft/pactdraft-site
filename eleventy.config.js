// PactDraft - Eleventy config (file name has no leading dot on purpose: some upload tools break dot-files). Brand, URLs, address and image hosts all come from src/_data/site.json.
const site = require("./src/_data/site.json");

const lib = require("./lib/image.js");
// The CDN repo makes the feature and card versions itself from the one uploaded image:
//   image/feature/<slug>.<ext> (home featured card), image/card/<slug>.<ext> (every small card).
// site.json -> images.variants: false = use the original file everywhere.
const variantsOn = !!(site.images && site.images.variants);
function variantUrl(kind, id) {
  if (!id) return "";
  return variantsOn ? lib.url(lib.derive(id, kind)) : lib.url(id);
}
// Files are served exactly as uploaded, with the extension you gave them (see lib/image.js):
//   hero (article page, social preview, Discover)  <host>/image/<slug>.<ext>
//   feature (big home card)                        <host>/image/feature/<slug>.<ext>
//   card (every small card)                        <host>/image/card/<slug>.<ext>
function imgSrc(id) { return lib.url(id); }   // hero; a width argument is ignored
function imgSet() { return ""; }              // there is no srcset any more
function imgOg(id) { return lib.url(id); }    // social preview = the hero file
// Hosts that serve the images of a page (ids or posts), at most n, so the browser can connect early.
function imgHosts(list, n) {
  var out = [];
  (list || []).forEach(function (it) {
    var id = typeof it === "string" ? it : (it && it.data && it.data.imageId);
    if (!id) return;
    var h = lib.host(id);
    if (h && out.indexOf(h) < 0) out.push(h);
  });
  return out.slice(0, n || 2);
}
function leadSlug(id) { return lib.slugOf(id); }

// Removes the first block of an article body when it is only the featured image again.
function dedupeLead(html, id) {
  if (!html || !id) return html;
  var slug = leadSlug(id);
  if (!slug) return html;
  var m = /^\s*<(div|p)\b[^>]*>[\s\S]*?<\/\1>/i.exec(html);
  if (!m) return html;
  var blk = m[0];
  if (blk.indexOf("<img") < 0 || blk.indexOf(slug) < 0) return html;
  if (blk.replace(/<[^>]+>/g, "").trim().length > 40) return html;
  return html.slice(m[0].length).replace(/^\s+/, "");
}

function isoOf(v) {
  var d = v ? new Date(v) : null;
  return d && !isNaN(d.getTime()) ? d.toISOString() : undefined;
}

function ldJson(ctx, s) {
  if (!ctx || !s) return "";
  var base = s.url, abs = function (p) { return /^https?:/.test(p) ? p : base + p; };
  var authorUrl = base + "/author/" + s.author.slug + "/";
  var out = [];
  var same = s.social ? Object.keys(s.social).map(function (k) { return s.social[k]; }).filter(function (v) { return typeof v === "string" && /^https?:/.test(v); }) : [];
  if (ctx.kind === "post") {
    var url = base + (ctx.url || "");
    var art = {
      "@context": "https://schema.org", "@type": "NewsArticle",
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      headline: String(ctx.title || "").slice(0, 110),
      description: ctx.description || s.description,
      image: ctx.imageId ? [imgOg(ctx.imageId)] : undefined,
      datePublished: isoOf(ctx.date), dateModified: isoOf(ctx.updated || ctx.date),
      author: { "@type": "Organization", name: s.author.name, url: authorUrl },
      publisher: { "@type": "Organization", name: s.name, url: base + "/", logo: { "@type": "ImageObject", url: abs(s.logoSchema || s.logo) } },
      articleSection: ctx.categoryLabel || undefined, inLanguage: s.language || "en"
    };
    out.push(art);
    var items = [{ "@type": "ListItem", position: 1, name: "Home", item: base + "/" }];
    if (ctx.categorySlug) items.push({ "@type": "ListItem", position: 2, name: ctx.categoryLabel || ctx.categorySlug, item: base + "/category/" + ctx.categorySlug + "/" });
    items.push({ "@type": "ListItem", position: items.length + 1, name: art.headline, item: url });
    out.push({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items });
  } else if (ctx.kind === "home") {
    out.push({ "@context": "https://schema.org", "@type": "WebSite", name: s.name, url: base + "/", inLanguage: s.language || "en",
      potentialAction: { "@type": "SearchAction", target: base + "/search/?q={search_term_string}", "query-input": "required name=search_term_string" } });
    out.push({ "@context": "https://schema.org", "@type": "NewsMediaOrganization", name: s.name, url: base + "/", logo: abs(s.logoSchema || s.logo),
      email: s.email, founder: { "@type": "Person", name: s.founder.name, jobTitle: s.founder.title },
      address: { "@type": "PostalAddress", addressLocality: s.address.locality, addressRegion: s.address.region, postalCode: s.address.postalCode, addressCountry: s.address.countryCode },
      contactPoint: { "@type": "ContactPoint", contactType: "editorial", email: s.email },
      publishingPrinciples: base + "/editorial-policy/", correctionsPolicy: base + "/corrections/",
      sameAs: same.length ? same : undefined });
  } else if (ctx.kind === "author") {
    out.push({ "@context": "https://schema.org", "@type": "ProfilePage", url: authorUrl,
      mainEntity: { "@type": "Organization", name: s.author.name, url: authorUrl, description: s.author.bio,
        parentOrganization: { "@type": "Organization", name: s.name, url: base + "/" } } });
  } else return "";
  return JSON.stringify(out).replace(/</g, "\\u003c");
}

// Real publish date of a collection item (front-matter date, which may carry a time and timezone).
function realDate(item) {
  var raw = item && item.data && item.data.date;
  if (raw) {
    var d = new Date(raw);
    if (!isNaN(d.getTime())) return d;
  }
  return new Date(item && item.date);
}

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/ads.txt");

  // All published posts: src/_posts/*.md (n8n adds one file per article), oldest first.
  // Templates call "| reverse" for newest first. Files with "draft: true" are left out.
  eleventyConfig.addCollection("posts", function (collectionApi) {
    return collectionApi.getFilteredByGlob("src/_posts/*.md")
      .filter(function (item) { return !item.data.draft; })
      .sort(function (a, b) { return realDate(a) - realDate(b); });
  });

  eleventyConfig.addFilter("imgSrc", function (id, w) { return imgSrc(id, w); });
  eleventyConfig.addFilter("imgSet", function (id) { return imgSet(id); });
  eleventyConfig.addFilter("imgOg", function (id) { return imgOg(id); });
  eleventyConfig.addFilter("imgHero", function (id) { return lib.url(id); });
  eleventyConfig.addFilter("imgFeature", function (id) { return variantUrl("feature", id); });
  eleventyConfig.addFilter("imgCard", function (id) { return variantUrl("card", id); });
  eleventyConfig.addFilter("imgFile", function (id) { return lib.url(id); });
  eleventyConfig.addFilter("imgMime", function (id) { return lib.mime(id); });
  eleventyConfig.addFilter("imgHosts", function (list, n) { return imgHosts(list, n); });
  eleventyConfig.addFilter("dedupeLead", function (html, id) { return dedupeLead(html, id); });
  eleventyConfig.addFilter("ldJson", function (ctx, s) { return ldJson(ctx, s); });

  eleventyConfig.addFilter("mgidConfig", function (m, pageKey) {
    if (!m || !m.enabled || !pageKey || !m.pages || !m.pages[pageKey]) return "";
    var cfg = Object.assign(
      { loader: m.loader, hosts: m.hosts, gapMs: m.gapMs, startAfterMs: m.startAfterMs, minWords: m.minWordsBetween, page: pageKey },
      m.pages[pageKey]
    );
    return JSON.stringify(cfg).replace(/</g, "\\u003c");
  });

  eleventyConfig.addFilter("postDate", function (item) { return realDate(item); });
  eleventyConfig.addFilter("utcDate", function (dateObj) { return new Date(dateObj).toUTCString(); });
  eleventyConfig.addFilter("dateDisplay", function (dateObj) {
    if (!dateObj) return "";
    return new Date(dateObj).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: site.timezone || "UTC" });
  });
  eleventyConfig.addFilter("isoDate", function (dateObj) {
    var s = isoOf(dateObj); return s ? s.split("T")[0] : "";
  });
  eleventyConfig.addFilter("isoDateTime", function (dateObj) { return isoOf(dateObj) || ""; });
  eleventyConfig.addFilter("recent", function (posts, hours) {
    var cut = Date.now() - (hours || 48) * 3600 * 1000;
    return (posts || []).filter(function (p) { return realDate(p).getTime() >= cut; });
  });
  eleventyConfig.addFilter("readingTime", function (content) {
    var text = (content || "").toString().replace(/<[^>]+>/g, " ");
    var words = text.split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
  });
  eleventyConfig.addFilter("limit", function (arr, n) { return (arr || []).slice(0, n); });
  eleventyConfig.addFilter("plus1", function (n) { return (n || 0) + 1; });

  eleventyConfig.addGlobalData("allSubCategories", function () {
    const categories = require("./src/_data/categories.json");
    const flat = [];
    for (const main of categories) {
      for (const sub of main.subs) {
        flat.push({ mainSlug: main.slug, mainLabel: main.label, subSlug: sub.slug, subLabel: sub.label });
      }
    }
    return flat;
  });

  eleventyConfig.addFilter("whereMainCategory", function (posts, slug) {
    return (posts || []).filter(function (p) { return p.data.categorySlug === slug; });
  });
  eleventyConfig.addFilter("whereSubCategory", function (posts, slug) {
    return (posts || []).filter(function (p) { return p.data.subCategorySlug === slug; });
  });
  eleventyConfig.addFilter("whereCategory", function (posts, slug) {
    return (posts || []).filter(function (p) {
      return p.data.categorySlug === slug || p.data.subCategorySlug === slug || (p.data.categories || []).indexOf(slug) !== -1;
    });
  });

  eleventyConfig.addShortcode("year", function () { return new Date().getFullYear().toString(); });

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["njk", "md", "html"],
  };
};
