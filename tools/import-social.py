#!/usr/bin/env python3
"""Bring stimpunkssocial.wordpress.com into /social, once (Ryan's ask, 2026-11-02).

    python3 tools/import-social.py <the WordPress export .xml> <a folder for the images>

Reads the WordPress export (WXR) and writes data/social.json: every published
post, its words as plain text, when, and the images WordPress kept with it.
Ryan's calls, the same day: the posts go into the repository and /social is
built from them; the 44 comments (our own replies in other people's
conversations) are left out; the images come, with their camera data off, alt
text from the export where it has some and written by Claude where it has none,
and any image with a person in it is held back until it has a consent record.

THE IMAGES ARE NEVER WRITTEN INTO THE REPOSITORY BY THIS TOOL. It downloads
each into the folder it is given (a scratch folder), re-saved with Pillow so
nothing but the pixels survives, at most 1600px on its long side, and records
each in the data as `held: "not looked at"`. A person looks at every one, and
only then is it copied into social/ and its record changed (make-social.py
refuses a held image on the page, an image with no alt text, and a file that
still carries camera data).

What is kept of a post: an id (w and WordPress's own number, so a second run
changes nothing), when it was published (UTC), and its words. WordPress made a
title for every post out of its first words, so the titles are not kept. Tags,
the export's mentions and its comments are not kept. The two pages in the
export (WordPress's sample About page and an empty Tools page) are not posts.

Running it again keeps every image record that has been looked at, so it can be
run again without losing a description.
"""
import html
import io
import json
import re
import sys
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "social.json"
NS = {"wp": "http://wordpress.org/export/1.2/", "content": "http://purl.org/rss/1.0/modules/content/"}
UPLOADS = "https://stimpunkssocial.wordpress.com/wp-content/uploads/"
LONG = 1600


def words_of(raw):
    """The post's words as it was written: tags out, entities read, no-break spaces plain."""
    t = re.sub(r"<!--.*?-->", "", raw or "", flags=re.S)
    t = re.sub(r"<br\s*/?>", "\n", t)
    t = re.sub(r"</p>\s*<p[^>]*>", "\n\n", t)
    t = re.sub(r"<[^>]+>", "", t)
    t = html.unescape(t).replace(" ", " ")
    t = re.sub(r"[ \t]+\n", "\n", t)
    return re.sub(r"\n{3,}", "\n\n", t).strip()


def when(gmt):
    return datetime.strptime(gmt, "%Y-%m-%d %H:%M:%S").replace(tzinfo=timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def fetch_image(url, into):
    from PIL import Image
    if not url.startswith(UPLOADS):
        raise SystemExit(f"refusing an image from somewhere else: {url}")
    req = urllib.request.Request(url, headers={"user-agent": "stimpunks.world import (+https://stimpunks.world/social)"})
    raw = urllib.request.urlopen(req, timeout=30).read()
    im = Image.open(io.BytesIO(raw))
    im.load()
    from PIL import ImageOps
    im = ImageOps.exif_transpose(im)
    if max(im.size) > LONG:
        im.thumbnail((LONG, LONG))
    # A fresh image of the same pixels: no Exif, XMP, ICC or comments come with it.
    mode = im.mode if im.mode in ("RGB", "RGBA", "L") else "RGB"
    bare = Image.frombytes(mode, im.size, im.convert(mode).tobytes())
    name = url.rsplit("/", 1)[-1].lower()
    name = re.sub(r"[^a-z0-9.-]+", "-", name)
    out = into / name
    if name.endswith(".png"):
        bare.save(out, "PNG", optimize=True)
    else:
        bare.convert("RGB").save(out, "JPEG", quality=85, optimize=True, progressive=True)
    return name, bare.size


def main():
    if len(sys.argv) != 3:
        raise SystemExit(__doc__)
    src, into = Path(sys.argv[1]), Path(sys.argv[2])
    into.mkdir(parents=True, exist_ok=True)
    ch = ET.parse(src).getroot().find("channel")
    items = ch.findall("item")
    kept_imgs, kept_held = {}, {}
    if DATA.exists():
        for p in json.loads(DATA.read_text()).get("posts", []):
            for im in p.get("images", []):
                kept_imgs[im["from"]] = im
            if p.get("held"):
                kept_held[p["id"]] = p["held"]
    by_parent = {}
    for a in items:
        if a.findtext("wp:post_type", namespaces=NS) != "attachment":
            continue
        meta = {m.findtext("wp:meta_key", namespaces=NS): m.findtext("wp:meta_value", namespaces=NS) for m in a.findall("wp:postmeta", namespaces=NS)}
        by_parent.setdefault(a.findtext("wp:post_parent", namespaces=NS), []).append(
            (a.findtext("wp:attachment_url", namespaces=NS), (meta.get("_wp_attachment_image_alt") or "").strip()))
    posts = []
    for i in items:
        if i.findtext("wp:post_type", namespaces=NS) != "post" or i.findtext("wp:status", namespaces=NS) != "publish":
            continue
        pid = i.findtext("wp:post_id", namespaces=NS)
        post = {"id": "w" + pid, "t": when(i.findtext("wp:post_date_gmt", namespaces=NS)),
                "text": words_of(i.findtext("content:encoded", namespaces=NS))}
        imgs = []
        for url, alt in sorted(by_parent.get(pid, [])):
            if url in kept_imgs:
                imgs.append(kept_imgs[url])
                continue
            name, (w, h) = fetch_image(url, into)
            imgs.append({"from": url, "file": name, "w": w, "h": h, "alt": alt, "alt_by": "us" if alt else None, "held": "not looked at"})
        if imgs:
            post["images"] = imgs
        if post["id"] in kept_held:
            post["held"] = kept_held[post["id"]]
        if post["text"] or imgs:
            posts.append(post)
    # The export holds some posts twice: the same words in the same minute, an
    # import's doubles rather than two posts. The lowest WordPress id is kept.
    # The same words on another day, or at another time, stay: we did post
    # things again.
    posts.sort(key=lambda p: int(p["id"][1:]))
    seen, kept = set(), []
    for p in posts:
        k = (p["text"], p["t"][:16])
        if k in seen and not p.get("images"):
            continue
        seen.add(k)
        kept.append(p)
    posts = sorted(kept, key=lambda p: p["t"], reverse=True)
    data = {
        "_source": "Imported from stimpunkssocial.wordpress.com's WordPress export of 2026-11-02 by tools/import-social.py. "
                   "Posts from the office are added by the morning fold (tools/pull-social.py). Never hand-edit a post's words.",
        "imported": src.name,
        "posts": posts,
    }
    DATA.write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n")
    print(f"import-social: {len(posts)} posts written, {sum(len(p.get('images', [])) for p in posts)} images, into {into}")


if __name__ == "__main__":
    main()
