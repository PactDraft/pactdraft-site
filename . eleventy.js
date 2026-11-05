// PactDraft - Eleventy config. Brand, URLs, address and image hosts all come from src/_data/site.json.
const site = require("./src/_data/site.json");

const IMG_SIZES = [480, 800, 1280];

function splitImageId(id) {
  const raw = String(id || "").replace(/^\/+/, "");
  const parts = raw.split("/");
  if (parts.length > 1 && site.imageHosts && site.imageHosts[parts[0]]) {
    return { host: site.imageHosts[parts[0]], slug: parts.slice(1).join("/") };
  }
  return { host: (site.imageHosts || {})[site.imageDefaultHost] || "", slug: raw };
}
function imgBase(id) { const p = splitImageId(id); return p.host + "/img/" + p.slug; }
function imgSrc(id, w) {
  if (!id) return "";
  const s = IMG_SIZES.find(function (x) { return x >= (w || 800); }) || IMG_SIZES[IMG_SIZES.length - 1];
  return imgBase(id) + "/" + s + ".webp";
}
function imgSet(id) {
  if (!id) return "";
  return IMG_SIZES.map(function (s) { return imgBase(id) + "/" + s + ".webp " + s + "w"; }).join(", ");
}
function imgOg(id) { return id ? imgBase(id) + "/og.jpg" : ""; }
function leadSlug(id) { return splitImageId(id).slug.split("/").pop(); }

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
        
