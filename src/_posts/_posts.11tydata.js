// Applies to every file in src/_posts/. n8n only has to write the front matter listed in docs/n8n-post-format.md.
const cats = require("../_data/categories.json");
const site = require("../_data/site.json");

function findMain(slug) { return cats.find(function (c) { return c.slug === slug; }); }
function findSub(slug) {
  for (const c of cats) { const s = c.subs.find(function (x) { return x.slug === slug; }); if (s) return { main: c, sub: s }; }
  return null;
}
function resolve(d) {
  var sub = findSub(d.subCategorySlug || d.subcategory || "");
  var main = findMain(d.categorySlug || d.category || "") || (sub && sub.main) || null;
  return { main: main, sub: sub && (!main || sub.main.slug === main.slug) ? sub.sub : null };
}

module.exports = {
  layout: "post.njk",
  eleventyComputed: {
    // Article URL: /article/<file name without .md>/  (no dates anywhere)
    permalink: function (d) { return d.draft ? false : (d.permalink || "/article/" + d.page.fileSlug + "/"); },
    categorySlug: function (d) { var r = resolve(d); return r.main ? r.main.slug : undefined; },
    categoryLabel: function (d) { var r = resolve(d); return r.main ? r.main.label : undefined; },
    subCategorySlug: function (d) { var r = resolve(d); return r.sub ? r.sub.slug : undefined; },
    subCategoryLabel: function (d) { var r = resolve(d); return r.sub ? r.sub.label : undefined; },
    // Image id on the CDN: "c1/<post-slug>" by default (same slug as the article)
    imageId: function (d) {
      if (d.image === false || d.image === "none") return null;
      if (d.imageId) return d.imageId;
      if (d.image && d.image !== "auto") return d.image;
      return site.imageDefaultHost + "/" + d.page.fileSlug;
    },
    excerpt: function (d) { return d.excerpt || d.description; },
    description: function (d) { return d.description || d.excerpt; }
  }
};
