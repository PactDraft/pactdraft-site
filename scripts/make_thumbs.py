#!/usr/bin/env python3
"""Makes small pictures from the ONE image uploaded per article, at build time.

Only runs when src/_data/site.json has  "images": {"thumbs": true}.  Otherwise it exits at once.
 - card    480x270 WebP, about 8-16 KB   -> src/assets/thumbs/card/<slug>.webp     (every small card)
 - feature 800x450 WebP, about 25-45 KB  -> src/assets/thumbs/feature/<slug>.webp  (the newest few articles only)
The hero stays on the CDN, untouched. The pictures live on the main site (not on the CDN), so CDN storage does not grow.
Results are remembered in src/_data/thumbs.json (the workflow caches both), so only new articles are processed.
Never fatal: an image that cannot be fetched is skipped and the page simply uses the hero file.
"""
import datetime, hashlib, io, json, os, re, shutil, sys, time, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE = json.loads((ROOT / "src/_data/site.json").read_text(encoding="utf-8"))
CFG = SITE.get("images", {}) or {}
if not CFG.get("thumbs"):
    print("thumbnails are OFF (site.json -> images.thumbs is false). Nothing to do.")
    sys.exit(0)

import yaml
from PIL import Image, ImageOps

OUT = ROOT / "src/assets/thumbs"
INDEX = ROOT / "src/_data/thumbs.json"
POSTS = ROOT / "src/_posts"
EXT = re.compile(r"\.([a-z0-9]{2,5})$", re.I)
FEATURE_COUNT = int(CFG.get("featureCount", 5))
CARD_KB, FEATURE_KB = int(CFG.get("cardKB", 16)), int(CFG.get("featureKB", 45))
RETRY_SLEEP = float(os.environ.get("THUMBS_SLEEP", 20))


def to_ts(v):
    if isinstance(v, datetime.datetime):
        return (v if v.tzinfo else v.replace(tzinfo=datetime.timezone.utc)).timestamp()
    if isinstance(v, datetime.date):
        return datetime.datetime(v.year, v.month, v.day, tzinfo=datetime.timezone.utc).timestamp()
    try:
        return datetime.datetime.fromisoformat(str(v).replace("Z", "+00:00")).timestamp()
    except Exception:
        return 0.0


def hero_url(slug, fm):
    img = fm.get("image")
    if img is False or img == "none":
        return None
    raw = str(fm.get("imageId") or (img if img not in (None, "auto") else "%s/%s" % (SITE["imageDefaultHost"], slug))).lstrip("/")
    parts, hosts = raw.split("/"), SITE["imageHosts"]
    if len(parts) > 1 and parts[0] in hosts:
        key, rest = parts[0], "/".join(parts[1:])
    else:
        key, rest = SITE["imageDefaultHost"], raw
    if not EXT.search(rest):
        rest += "." + SITE.get("imageExt", "webp")
    return hosts[key] + "/image/" + rest


def read_posts():
    posts = []
    for f in sorted(POSTS.glob("*.md")):
        m = re.match(r"^---\n(.*?)\n---", f.read_text(encoding="utf-8"), re.S)
        if not m:
            continue
        fm = yaml.safe_load(m.group(1)) or {}
        if fm.get("draft"):
            continue
        slug = f.stem
        url = hero_url(slug, fm)
        if url:
            posts.append({"slug": slug, "url": url, "ts": to_ts(fm.get("date")), "updated": str(fm.get("updated") or "")})
    posts.sort(key=lambda p: p["ts"], reverse=True)
    return posts


def fetch(url, recent):
    tries = int(os.environ.get("THUMBS_TRIES", 12 if recent else 2))
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "pactdraft-thumbs/1.0"})
            with urllib.request.urlopen(req, timeout=25) as r:
                if r.status == 200:
                    return r.read()
        except Exception:
            pass
        if i < tries - 1:
            time.sleep(RETRY_SLEEP)          # the CDN may still be deploying a brand-new image
    return None


def crop169(im):
    w, h = im.size
    if abs(w / h - 16 / 9) < 0.01:
        return im
    if w / h > 16 / 9:
        nw = round(h * 16 / 9); left = (w - nw) // 2
        return im.crop((left, 0, left + nw, h))
    nh = round(w * 9 / 16); top = int((h - nh) * 0.3)
    return im.crop((0, top, w, top + nh))


def to_webp(im, budget_kb):
    data = b""
    for q in (82, 76, 70, 64, 58, 52, 46, 40, 34):
        buf = io.BytesIO(); im.save(buf, "WEBP", quality=q, method=6); data = buf.getvalue()
        if len(data) <= budget_kb * 1024:
            break
    return data


def main():
    old = {}
    if INDEX.exists():
        try: old = json.loads(INDEX.read_text(encoding="utf-8")).get("items", {})
        except Exception: old = {}
    posts = read_posts()
    live = {p["slug"] for p in posts}
    newest = {p["slug"] for p in posts[:FEATURE_COUNT]}
    for k in ("card", "feature"):
        (OUT / k).mkdir(parents=True, exist_ok=True)
    items, made_card, made_feat, cached, failed = {}, 0, 0, 0, []
    now = time.time()
    for p in posts:
        slug = p["slug"]
        key = hashlib.sha1(("%s|%s|%s|%s" % (p["url"], p["updated"], CARD_KB, FEATURE_KB)).encode()).hexdigest()[:12]
        prev = old.get(slug, {})
        same = prev.get("key") == key
        have_card = same and prev.get("card") and (OUT / "card" / (slug + ".webp")).exists()
        have_feat = same and prev.get("feature") and (OUT / "feature" / (slug + ".webp")).exists()
        want_feat = slug in newest
        if have_card and (have_feat or not want_feat):
            items[slug] = {"key": key, "card": True, "feature": bool(have_feat and want_feat)}
            cached += 1
            continue
        raw = fetch(p["url"], recent=(now - p["ts"]) < 3 * 3600)
        if raw is None:
            failed.append(slug); items[slug] = {"key": key, "card": bool(have_card), "feature": bool(have_feat and want_feat)}
            continue
        try:
            base = crop169(ImageOps.exif_transpose(Image.open(io.BytesIO(raw))).convert("RGB"))
            (OUT / "card" / (slug + ".webp")).write_bytes(to_webp(base.resize((480, 270), Image.LANCZOS), CARD_KB)); made_card += 1
            feat = False
            if want_feat:
                (OUT / "feature" / (slug + ".webp")).write_bytes(to_webp(base.resize((800, 450), Image.LANCZOS), FEATURE_KB)); made_feat += 1; feat = True
            items[slug] = {"key": key, "card": True, "feature": feat}
        except Exception as e:
            print("::warning::could not process %s: %s" % (slug, e)); failed.append(slug)
            items[slug] = {"key": key, "card": False, "feature": False}
    for k in ("card", "feature"):                       # tidy: pictures of deleted/draft posts, old feature pictures
        for f in (OUT / k).glob("*.webp"):
            if f.stem not in live or (k == "feature" and f.stem not in newest):
                f.unlink()
    INDEX.write_text(json.dumps({"version": 1, "generated": datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds"), "items": items}, indent=1), encoding="utf-8")
    size = sum(f.stat().st_size for f in OUT.rglob("*.webp")) / 1048576
    print("thumbnails: %d articles | new card %d, new feature %d, from cache %d, could not fetch %d | folder %.1f MB" % (len(posts), made_card, made_feat, cached, len(failed), size))
    for s in failed:
        print("::warning::no picture yet for %s (page uses the hero file for now)" % s)


if __name__ == "__main__":
    main()
