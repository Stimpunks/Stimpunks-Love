#!/usr/bin/env python3
"""Stimpunks Social, at stimpunks.world/social: our short posts, kept here.

Ryan's ask, 2026-11-02: move stimpunkssocial.wordpress.com here, and have
Office > Posts post to it along with our other networks. His calls the same
day: PAPERWORK rather than a room (a record page, as the changelog and the
forums are, worn in the reader's own CB theme once social.js has run); the
posts KEPT IN THE REPOSITORY, so the page is built from them, works with no
script and is read by search engines; a post from the office shown at once
from the server (/cb/social) and folded into data/social.json by the morning
timer (tools/daily-social.sh); the images brought with alt text, Claude's
where the export had none and said so; the comments left out.

This writes, from data/social.json:
  · social.html, between social:posts markers: every post, newest first, under
    a heading for its year, each with its words (bare links made links), its
    images, and when, in Colorado's calendar, the street's clock;
  · social.xml, an RSS feed of the newest FEED_KEEP.

A POST CAN BE HELD (`held`, with the reason): it stays in the data and is on
neither the page nor the feed. Posts that quote a song's lyrics were held for
an afternoon and published on Ryan's call the same day (2026-11-02): our use of
them is fair use, the responsibility for them is ours, and the street refuses
lyrics nowhere now.

IT REFUSES: a post with neither words nor an image; two posts with one id; an
image on the page that is held (a person in it and no consent record, or not
looked at yet), has no alt text, says nobody wrote its alt text, has no file in
social/img/, or whose file still carries camera data (Exif, XMP, IPTC, a
comment, PNG text); a count of posts anywhere on the page; and the page without
its markers or without social.js.
"""
import html
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "social.json"
PAGE = ROOT / "social.html"
FEED = ROOT / "social.xml"
IMG = ROOT / "social" / "img"
BEGIN, END = "<!-- social:posts:begin -->", "<!-- social:posts:end -->"
SITE = "https://stimpunks.world"
FEED_KEEP = 50
HERE = ZoneInfo("America/Denver")
ALT_BY = {"us": "Alt text written when it was posted.", "claude": "Alt text written by Claude when the post moved here."}

problems = []


def when(iso):
    return datetime.strptime(iso, "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc)


def day_words(dt):
    d = dt.astimezone(HERE)
    return f"{d.day} {d.strftime('%B %Y')}"


URL = re.compile(r"https?://[^\s<>\"]+")


def linked(text):
    """The words, escaped, with every bare http or https address a link, and the
    punctuation that ends a sentence left outside it."""
    out, at = [], 0
    for m in URL.finditer(text):
        href = m.group(0)
        while re.search(r"[.,;:!?'\"’”]$", href) or (href.endswith(")") and "(" not in href):
            href = href[:-1]
        out.append(html.escape(text[at:m.start()], quote=False))
        out.append(f'<a href="{html.escape(href)}">{html.escape(href, quote=False)}</a>')
        at = m.start() + len(href)
    out.append(html.escape(text[at:], quote=False))
    return "".join(out)


def paragraphs(text):
    return "".join("<p>" + linked(p).replace("\n", "<br>\n") + "</p>" for p in re.split(r"\n\s*\n", text.strip()) if p.strip())


def carries_metadata(b, name):
    if name.endswith((".jpg", ".jpeg")):
        i = 2
        while i + 4 <= len(b) and b[i] == 0xFF:
            marker, size = b[i + 1], int.from_bytes(b[i + 2:i + 4], "big")
            if marker == 0xDA:
                break
            seg = b[i + 4:i + 2 + size]
            if marker == 0xE1 or marker == 0xED or marker == 0xFE or (0xE2 <= marker <= 0xEF and not seg.startswith(b"ICC_PROFILE")):
                return True
            i += 2 + size
        return False
    if name.endswith(".png"):
        return any(c in b for c in (b"tEXt", b"iTXt", b"zTXt", b"eXIf", b"tIME"))
    return True


def check(posts):
    seen = set()
    for p in posts:
        if not re.fullmatch(r"[a-z][A-Za-z0-9_-]{1,40}", p.get("id", "")):
            problems.append(f"a post's id is not one this page can use as an anchor: {p.get('id')!r}")
        if p["id"] in seen:
            problems.append(f"two posts are {p['id']}.")
        seen.add(p["id"])
        if not (p.get("text") or "").strip() and not shown(p):
            problems.append(f"{p['id']} has no words and no image it may show.")
        try:
            when(p["t"])
        except (KeyError, ValueError):
            problems.append(f"{p['id']} has no time this can read.")
        for im in p.get("images", []):
            if im.get("held"):
                continue
            f = IMG / im.get("file", "")
            if not (im.get("alt") or "").strip():
                problems.append(f"{p['id']}: {im.get('file')} has no alt text.")
            if im.get("alt_by") not in ALT_BY:
                problems.append(f"{p['id']}: {im.get('file')} does not say who wrote its alt text.")
            if not f.is_file():
                problems.append(f"{p['id']}: {im.get('file')} is not in social/img/.")
            elif carries_metadata(f.read_bytes(), f.name.lower()):
                problems.append(f"{p['id']}: {im.get('file')} still carries camera data.")
    held_files = {im["file"] for p in posts for im in p.get("images", []) if im.get("held")}
    for f in held_files:
        if (IMG / f).exists():
            problems.append(f"social/img/{f} is held, and is in the repository anyway. A held image stays out until it may be shown.")


def shown(p):
    return [im for im in p.get("images", []) if not im.get("held")]


def post_html(p):
    dt = when(p["t"])
    parts = [f'      <li class="sp-post" id="{p["id"]}">']
    if (p.get("text") or "").strip():
        parts.append("        " + paragraphs(p["text"]))
    for im in shown(p):
        alt = html.escape(im["alt"])
        parts.append(f'        <figure class="sp-fig"><img class="sp-img" src="social/img/{html.escape(im["file"])}" width="{im["w"]}" height="{im["h"]}" '
                     f'loading="lazy" decoding="async" alt="{alt}"><figcaption class="sp-alt-by">{ALT_BY[im["alt_by"]]}</figcaption></figure>')
    parts.append(f'        <p class="sp-when"><a href="#{p["id"]}"><time datetime="{p["t"]}">{day_words(dt)}</time></a></p>')
    parts.append("      </li>")
    return "\n".join(parts)


def page_block(posts):
    years = {}
    for p in posts:
        years.setdefault(when(p["t"]).astimezone(HERE).year, []).append(p)
    out = [BEGIN]
    for y in sorted(years, reverse=True):
        out.append(f'    <section class="sp-year" aria-labelledby="social-{y}">')
        out.append(f'      <h2 id="social-{y}">{y}</h2>')
        out.append('      <ul class="sp-list">')
        out.extend(post_html(p) for p in years[y])
        out.append("      </ul>")
        out.append("    </section>")
    out.append("    " + END)
    return "\n".join(out)


def feed(posts, now):
    items = []
    for p in posts[:FEED_KEEP]:
        dt = when(p["t"])
        first = (p.get("text") or "").strip().split("\n")[0]
        title = first if len(first) <= 90 else first[:89].rstrip() + "…"
        body = paragraphs(p.get("text") or "") + "".join(
            f'<p><img src="{SITE}/social/img/{html.escape(im["file"])}" alt="{html.escape(im["alt"])}"></p>' for im in shown(p))
        items.append("  <item>\n"
                     f"    <title>{html.escape(title or 'A post')}</title>\n"
                     f"    <link>{SITE}/social#{p['id']}</link>\n"
                     f"    <guid isPermaLink=\"false\">stimpunks-social-{p['id']}</guid>\n"
                     f"    <pubDate>{dt.strftime('%a, %d %b %Y %H:%M:%S +0000')}</pubDate>\n"
                     f"    <description>{html.escape(body)}</description>\n"
                     "  </item>")
    last = when(posts[0]["t"]) if posts else now
    return ('<?xml version="1.0" encoding="utf-8"?>\n'
            '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n<channel>\n'
            "  <title>Stimpunks Social</title>\n"
            f"  <link>{SITE}/social</link>\n"
            f'  <atom:link href="{SITE}/social.xml" rel="self" type="application/rss+xml"/>\n'
            "  <description>Brief. Real. Ours. The Stimpunks Foundation's short posts.</description>\n"
            "  <language>en</language>\n"
            f"  <lastBuildDate>{last.strftime('%a, %d %b %Y %H:%M:%S +0000')}</lastBuildDate>\n"
            + "\n".join(items) + "\n</channel>\n</rss>\n")


def main():
    data = json.loads(DATA.read_text())
    every = sorted(data.get("posts", []), key=lambda p: p["t"], reverse=True)
    check(every)
    # A held post is in the data and on neither the page nor the feed.
    posts = [p for p in every if not p.get("held")]
    page = PAGE.read_text()
    if page.count(BEGIN) != 1 or page.count(END) != 1:
        problems.append("social.html: the social:posts markers must be there exactly once.")
    if '<script src="social.js"' not in page:
        problems.append("social.html: it does not load social.js, which dresses it in the reader's CB theme and shows the office's newest posts.")
    outside = re.sub(re.escape(BEGIN) + r".*?" + re.escape(END), "", page, flags=re.S)
    if re.search(r"\b\d[\d,]*\s+(posts|toots|skeets|updates)\b", outside, re.I):
        problems.append("social.html: it counts the posts. Nothing on the street says how many of anything.")
    if problems:
        print("REFUSING:\n  " + "\n  ".join(problems))
        return 1
    new = re.sub(re.escape(BEGIN) + r".*?" + re.escape(END), lambda m: page_block(posts), page, flags=re.S)
    if new != page:
        PAGE.write_text(new)
    xml = feed(posts, datetime.now(timezone.utc))
    if not FEED.exists() or FEED.read_text() != xml:
        FEED.write_text(xml)
    print("social: every post under its year, newest first, nothing held shown, every image with alt text that says who wrote it, and the feed written from the same data.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
