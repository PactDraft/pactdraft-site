// Image ids look like  c1/<slug>.<ext>  ("c1" = a host key from site.json -> imageHosts).
// The extension is whatever file was uploaded (webp, jpg, png, avif ...). An id without extension gets site.imageExt.
const site = require("../src/_data/site.json");
const EXT = /\.([a-z0-9]{2,5})$/i;
const MIME = { webp: "image/webp", jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", avif: "image/avif", gif: "image/gif" };

function parse(id) {
  const raw = String(id || "").replace(/^\/+/, "");
  const parts = raw.split("/");
  let key = site.imageDefaultHost, rest = raw;
  if (parts.length > 1 && site.imageHosts && site.imageHosts[parts[0]]) { key = parts[0]; rest = parts.slice(1).join("/"); }
  return { key: key, host: (site.imageHosts || {})[key] || "", path: rest };
}
function withExt(path) { return EXT.test(path) ? path : path + "." + (site.imageExt || "webp"); }
function normalize(id) { if (!id) return null; const p = parse(id); return p.key + "/" + withExt(p.path); }
function extOf(id) { const m = EXT.exec(parse(id).path); return m ? m[1].toLowerCase() : (site.imageExt || "webp"); }
// hero id -> id of its feature/card file; ext (optional) = a different extension for that file
function derive(heroId, kind, ext) {
  const p = parse(heroId);
  let path = withExt(p.path);
  if (ext) path = path.replace(EXT, "." + String(ext).replace(/^\./, "").toLowerCase());
  return p.key + "/" + kind + "/" + path;
}
function url(id) { if (!id) return ""; const p = parse(id); return p.host + "/image/" + withExt(p.path); }
function mime(id) { return MIME[extOf(id)] || "image/jpeg"; }
function host(id) { return parse(id).host; }
function slugOf(id) { return parse(id).path.split("/").pop().replace(EXT, ""); }

module.exports = { parse: parse, normalize: normalize, derive: derive, url: url, mime: mime, host: host, slugOf: slugOf };
