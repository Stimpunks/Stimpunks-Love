#!/usr/bin/env python3
"""Check that a room you have to know the address of is listed nowhere.

Ryan's brief, 2026-10-07: easter egg rooms "not listed in the changelog, the
feeds, the sitemap, the teleporter, or anywhere. You have to know the URL to get
to them." A page says it is one on its own <body> (data-unlisted; see
tools/unlisted.py), and the tools that list pages leave it out. This is the
other half: it reads what was actually published and refuses if an unlisted
room can be reached from it.

WHAT IT READS. Everything a visitor, a crawler or an agent follows: every page
that is NOT unlisted, the changelog among them; the files those pages and this
site's discovery point at (sitemap.xml, llms.txt, cb-rooms.json, which is the
teleporter, the #tags and the search's list of rooms, search-index.json,
feed.xml, robots.txt, the web manifest and .well-known/); and every stylesheet
and script on the street, because love.css and love.js reach every visitor on
every page. Scripts that only unlisted pages load are theirs and are not read.

WHAT IT LOOKS FOR. Each unlisted page's address (its filename, with or without
.html, wherever it stands as a word) and its name (its <title> without the
site's name), in any case. A name on a listed page is a sign pointing at the
door even with no link on it.

WHAT IT DOES NOT READ, AND WHY. data/, tools/, fonts/, og/, CLAUDE.md,
DECISIONS.md and the README are the repository's workings. This site publishes
its whole root, so they are served, but nothing links to them, and the same
files are public on GitHub anyway. Unlisted is a door with no path to it, not a
lock; tools/unlisted.py says the same.

IT ALSO REFUSES an unlisted page without <meta name="robots" content="noindex">,
because a crawler that has been handed the address by somebody should still not
put it in a search engine's results, which are a listing too.

Break it on purpose before believing it: a link from a listed page, the name in
a paragraph, the address in love.css's comments.
"""
import html
import re
import sys
from pathlib import Path

import unlisted

ROOT = Path(__file__).resolve().parent.parent
SUFFIX = " — Stimpunks.World"
LISTINGS = ["sitemap.xml", "llms.txt", "cb-rooms.json", "search-index.json", "feed.xml",
            "robots.txt", "site.webmanifest"]
SCRIPT = re.compile(r'<script\b[^>]*\bsrc="/?([^"/]+\.js)"')


def scripts(src):
    return set(SCRIPT.findall(src))


def flat(text):
    """Words as a reader meets them: entities resolved, case and spacing gone."""
    return re.sub(r"\s+", " ", html.unescape(text)).lower()


def main():
    eggs = unlisted.pages(ROOT)
    if not eggs:
        print("unlisted: no page says it is unlisted, so there is nothing to keep off the lists")
        return 0

    listed = [p for p in sorted(ROOT.glob("*.html")) if p.name not in eggs]
    theirs = set().union(*(scripts((ROOT / e).read_text()) for e in eggs))
    shared = set().union(*(scripts(p.read_text()) for p in listed))
    own = theirs - shared
    files = (listed
             + [ROOT / n for n in LISTINGS if (ROOT / n).exists()]
             + [p for p in sorted((ROOT / ".well-known").rglob("*")) if p.is_file()]
             + sorted(ROOT.glob("*.css"))
             + [p for p in sorted(ROOT.glob("*.js")) if p.name not in own])
    texts = {f: f.read_text(errors="replace") for f in files}
    flats = {f: flat(t) for f, t in texts.items()}

    problems = []
    for egg in eggs:
        src = (ROOT / egg).read_text()
        if not unlisted.NOINDEX.search(src):
            problems.append(f"{egg} is unlisted and has no <meta name=\"robots\" content=\"noindex\">, so a "
                            "search engine handed its address would list it.")
        stem = egg[:-len(".html")]
        address = re.compile(rf"(?<![A-Za-z0-9_-]){re.escape(stem)}(?![A-Za-z0-9_-])", re.I)
        m = re.search(r"<title>(.*?)</title>", src, re.S)
        name = flat(m.group(1)).removesuffix(flat(SUFFIX)).strip() if m else ""
        for f in files:
            where = f.relative_to(ROOT)
            if address.search(texts[f]):
                problems.append(f"{where} names {stem}, which is a room you have to know the address of.")
            if name and name in flats[f]:
                problems.append(f"{where} says “{name}”, the name of {egg}, which is unlisted.")

    if problems:
        raise SystemExit("REFUSING:\n  " + "\n  ".join(problems) +
                         "\n\nAn unlisted room is reached by knowing its address and by nothing else. Take "
                         "it off the page or the list above, or, if it belongs on the street after all, "
                         "take data-unlisted off its <body> and put it in make-sitemap.py's ORDER.")
    print(f"unlisted: {len(eggs)} page(s) say they are unlisted, and none of {len(files)} published "
          "files a visitor, crawler or agent follows names one")
    return 0


if __name__ == "__main__":
    sys.exit(main())
