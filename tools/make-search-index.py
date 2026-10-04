#!/usr/bin/env python3
"""Write search-index.json, the words the finder searches beyond the rooms' names.

Ryan, 2026-10-01: "Add site search. All of our other sites have it." The finder on
the front page and the Map already finds a ROOM by its name or its description
(the teleporter's search). This is the rest of the street: every section of every
page, so a word somebody remembers reading finds the place they read it.

A FILE, NOT A SERVICE AND NOT PAGEFIND. Search on a static site is somebody else's
server or a file, and this street sends nothing anywhere until somebody presses, so
it is a file, fetched from this site the first time somebody types in the box and
searched in their browser. Queering Earth, Star Stuff and the rest do the same.
Pagefind was the other candidate and was turned down for three reasons written in
the changelog: it runs WebAssembly, which would loosen script-src on the one header
this site guards hardest; its index is a folder of hash-named fragments that would
churn in every morning's commit; and it is a dependency both machines would need.

IT IS READ OFF THE PUBLISHED PAGES, NEVER TYPED. Every record comes out of a page's
own <main>, so a result can never quote a sentence the page does not hold. The unit
is a SECTION: text is filed under the heading above it, and the link goes to that
heading's id, or to the nearest element round it that has one, so a result lands
on the paragraph rather than at the top of the changelog.

A QUOTATION IS NEVER CROPPED. A search snippet is a trimming machine, twenty words
round the match with the attribution left behind, which is the one thing this site
keeps attribution to prevent. So a <blockquote> is filed apart from our prose, as
its own record with whatever <cite>, <figcaption> or <footer> it carries, and the
finder shows its attribution and never its words. Inline quotations in our prose
are widened over whole by the finder rather than cut.

WHAT IS LEFT OUT, AND WHY:
  · the regions the morning timers rewrite (the Doom Scoop's cabinet, The Feed's
    board, the kitchen telly, the Now Playing bill). They are other people's titles
    and they turn over every day, and the timers commit only their own paths, so an
    index of them would be wrong by breakfast. Named in DAILY below.
  · the job markers, which are the same furniture in every room.
  · the front page's doors and the Map's model, which are the rooms' own names
    again: the finder already finds rooms first.
  · The Small Hours' lyric. It is printed with permission and is not under this
    site's licence, and permission to print a song on its page is not permission
    to copy it into another file.
  · scripts, styles, drawings, anything aria-hidden, and the finder itself.

check-all.sh runs this after make-sitemap.py, so the index is never older than the
pages, and a commit whose pages changed carries the index that matches them.
"""
import html, json, pathlib, re, sys
from html.parser import HTMLParser

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "search-index.json"

# Marker regions the morning timers rewrite (tools/daily-*.sh). A new timer that
# rewrites part of a page adds its markers here, or the index goes stale daily.
DAILY = ["ds-cabinet", "ds-set", "ds-counter", "arrivals:hall", "arrivals:set",
         "arrivals:shape", "vpl:rack", "onb:month", "ll:month", "np-bill"]
# Classes whose whole subtree is left out (see the docstring for each reason).
SKIP_CLASS = {"sh-lyric", "doors", "mm-model", "finder", "mm-find", "quest", "skip"}
SKIP_TAG = {"script", "style", "svg", "template", "noscript", "button", "select", "input",
            "textarea", "iframe", "canvas", "audio", "video"}
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta",
        "param", "source", "track", "wbr"}
BLOCK = {"p", "li", "dt", "dd", "div", "section", "article", "figure", "figcaption", "tr",
         "td", "th", "h4", "h5", "h6", "blockquote", "header", "footer", "aside", "summary",
         "details", "ul", "ol", "dl", "table", "pre", "address", "label", "cite"}


class Reader(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []        # (tag, id, skipping)
        self.skip = 0
        self.records = []
        self.anchor, self.heading = "", ""
        self.in_h = None       # tag of the heading being read
        self.h_buf = []
        self.buf = []          # our prose under the current heading
        self.quote = None      # [words, attribution] while inside a blockquote
        self.by = 0            # depth inside an attribution element in a quotation
        # A credit written just after a quotation (<blockquote> then <cite>, the
        # shape most rooms here use) belongs to it: the record waiting for one,
        # and how deep its parent was.
        self.pending = None
        self.credit = None     # [record, depth, words] while reading such a credit

    def flush(self):
        text = clean("".join(self.buf))
        if text:
            self.records.append([self.anchor, self.heading, text, ""])
        self.buf = []

    def ancestor_id(self):
        for tag, i, _ in reversed(self.stack):
            if i and i not in ("main", "top"):
                return i
        return ""

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        classes = set((a.get("class") or "").split())
        skipping = (tag in SKIP_TAG or a.get("aria-hidden") == "true" or classes & SKIP_CLASS)
        if tag in VOID:
            if tag == "br" and not self.skip:
                self.text(" ")
            return
        if self.pending is not None and not self.skip:
            rec, depth = self.pending
            self.pending = None
            if tag in ("cite", "figcaption", "footer") and len(self.stack) == depth:
                self.credit = [rec, depth + 1, []]
        self.stack.append((tag, a.get("id") or "", bool(skipping)))
        if skipping:
            self.skip += 1
            return
        if self.skip:
            return
        if tag in ("h1", "h2", "h3"):
            if self.quote is None:
                self.flush()
            self.in_h = tag
            self.h_buf = []
            self.anchor = a.get("id") or self.ancestor_id()
        elif tag == "blockquote" and self.quote is None:
            self.quote = [[], []]
        elif self.quote is not None and tag in ("cite", "figcaption", "footer"):
            self.by += 1
        if tag in BLOCK:
            self.text(" ")

    def handle_endtag(self, tag):
        if tag in VOID:
            return
        # Close back to the matching open tag; browsers forgive stray end tags and so must this.
        for k in range(len(self.stack) - 1, -1, -1):
            if self.stack[k][0] == tag:
                break
        else:
            return
        while len(self.stack) > k:
            t, _, skipping = self.stack.pop()
            if skipping:
                self.skip -= 1
                continue
            if self.skip:
                continue
            if t == self.in_h:
                self.heading = clean("".join(self.h_buf))
                self.in_h = None
            elif t == "blockquote" and self.quote is not None:
                words, by = clean("".join(self.quote[0])), clean("".join(self.quote[1]))
                if words:
                    self.records.append([self.anchor, self.heading, words, by or "-"])
                    if not by:
                        self.pending = (len(self.records) - 1, len(self.stack))
                self.quote = None
                self.by = 0
            elif self.quote is not None and t in ("cite", "figcaption", "footer") and self.by:
                self.by -= 1
            elif self.credit is not None and len(self.stack) < self.credit[1]:
                rec, _, words = self.credit
                if clean("".join(words)):
                    self.records[rec][3] = clean("".join(words))
                self.credit = None
            if t in BLOCK:
                self.text(" ")

    def text(self, s):
        if self.skip:
            return
        if self.pending is not None and s.strip():
            self.pending = None
        if self.credit is not None:
            self.credit[2].append(s)
        if self.in_h:
            self.h_buf.append(s)
        elif self.quote is not None:
            (self.quote[1] if self.by else self.quote[0]).append(s)
        else:
            self.buf.append(s)

    def handle_data(self, data):
        self.text(data)


def clean(s):
    return re.sub(r"\s+", " ", s).strip()


def main():
    rooms = json.loads((ROOT / "cb-rooms.json").read_text())["rooms"]
    pages, records = [], []
    for n, r in enumerate(rooms):
        f = "index.html" if r["path"] == "/" else r["path"][1:]
        src = (ROOT / f).read_text()
        m = re.search(r"<main\b.*?</main>", src, re.S)
        if not m:
            raise SystemExit(f"REFUSING: {f} has no <main>, so there is nothing of its own to index.")
        body = m.group(0)
        for name in DAILY:
            body = re.sub(rf"<!-- {re.escape(name)}:begin -->.*?<!-- {re.escape(name)}:end -->",
                          " ", body, flags=re.S)
        body = re.sub(r"<!--.*?-->", " ", body, flags=re.S)
        reader = Reader()
        reader.feed(body)
        reader.close()
        reader.flush()
        pages.append([r["path"], r["name"]])
        for anchor, heading, text, by in reader.records:
            # [page, anchor, heading, words, attribution]; attribution is "" for our
            # prose, "-" for a quotation that carries none, else its own words.
            records.append([n, anchor, heading, text, by])
    # The Small Hours' lyric must not be in here; check the words rather than trust the class.
    lyric = re.search(r'<blockquote class="sh-lyric">(.*?)</blockquote>',
                      (ROOT / "small-hours.html").read_text(), re.S)
    if lyric:
        line = next((clean(html.unescape(re.sub(r"<[^>]+>", " ", l))) for l in lyric.group(1).split("<br")
                     if len(clean(re.sub(r"<[^>]+>", " ", l))) > 25), None)
        blob = json.dumps(records, ensure_ascii=False)
        if line and line[:40] in blob:
            raise SystemExit("REFUSING: the index holds a line of Up All Night's lyric, which is printed "
                             "with permission on its own page and not under this site's licence.")
    data = {"_what": "Every section of every page, for the finder. Written by tools/make-search-index.py "
                     "from each page's own <main>. Do not hand-edit.",
            "pages": pages, "records": records}
    text = json.dumps(data, ensure_ascii=False, separators=(",", ":")) + "\n"
    if not OUT.exists() or OUT.read_text() != text:
        OUT.write_text(text)
    quotes = sum(1 for r in records if r[4])
    print(f"search-index.json: {len(text) // 1024} KB, every section of every page in walking order, "
          f"quotations filed apart ({quotes and 'with their attributions' or 'none found'})")


main()
