#!/usr/bin/env python3
"""Hold the Brass Tacks Board to what it and privacy.html say.

Ryan's brief and calls, 2026-09-30: a board for posts meant to persist, read
by anybody, posted on only by moderators with their usernames public on the
post; the author edits, any moderator takes a post down; a feed of its own;
pictures allowed. lib.test.mjs tests what the code does. This checks what a
friendly edit could break without a test noticing:

  · NOTHING A MODERATOR TYPES BECOMES MARKUP. brass.js builds every post with
    createElement and textContent: no innerHTML, outerHTML, insertAdjacentHTML
    or document.write anywhere in it. The friendly edit is "just use a Markdown
    library and innerHTML", and that is a script on a page everybody reads the
    day a moderator's pass is stolen.
  · ONLY A MODERATOR POSTS, ONLY THE AUTHOR EDITS. addBrass, editBrass and
    removeBrass each refuse anything but a base pass, editBrass compares the
    author, and the function refuses a non-moderator before any action.
  · A PICTURE IS DESCRIBED AND SAID YES TO, and brassFields refuses one without.
  · brass.js reads love-cb and never writes it, stores nothing, and talks only
    to the board's own functions; the picture goes through cb.js's one redraw.
  · the page has the feed, the hidden form and the rules, and privacy.html the
    section the page links.

IF THIS REFUSES: fix the cause. Do not widen a list to make it quiet.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
JS = ROOT / "brass.js"
LIB = ROOT / "netlify" / "cb" / "lib.mjs"
FN = ROOT / "netlify" / "functions" / "cb-brass.mjs"
FEED = ROOT / "netlify" / "functions" / "brass-feed.mjs"
PAGE = ROOT / "brass-tacks-board.html"
PRIVACY = ROOT / "privacy.html"
CB = ROOT / "cb.js"

problems = []


def code_of(path):
    c = re.sub(r"/\*.*?\*/", " ", path.read_text(), flags=re.S)
    return re.sub(r"(?m)^\s*//[^\n]*", " ", c)


def fn(src, name):
    m = re.search(rf"export (?:async )?function {name}\(.*?\n\}}", src, re.S)
    return m.group(0) if m else ""


def main():
    js = code_of(JS)
    for bad in ("innerHTML", "outerHTML", "insertAdjacentHTML", "document.write", "DOMParser", "createContextualFragment"):
        if bad in js:
            problems.append(f"{JS.name}: {bad}. Every post is built from nodes with textContent, never as HTML.")
    if "localStorage.setItem" in js or "sessionStorage" in js or "indexedDB" in js:
        problems.append(f"{JS.name}: it stores something. It reads love-cb and nothing else.")
    for url in set(re.findall(r"""['"](/[a-z][^'"?#]*)""", js)):
        if url not in ("/cb/brass", "/cb/brass/image"):
            problems.append(f"{JS.name}: it calls {url}. The board talks to its own functions and nothing else.")
    if "window.loveRedraw" not in js or "createImageBitmap" in js:
        problems.append(f"{JS.name}: a picture must go through cb.js's one redraw (window.loveRedraw), not a copy of it.")
    if "window.loveRedraw = redraw;" not in CB.read_text():
        problems.append(f"{CB.name}: the radio no longer shares its redraw, which the board's pictures go through.")

    lib = LIB.read_text()
    for name in ("addBrass", "editBrass", "removeBrass", "putBrassImage"):
        if "who.role !== 'base'" not in fn(lib, name):
            problems.append(f"{LIB.name}: {name} no longer refuses anybody but a moderator.")
    if "foldHandle(list[k].handle) !== foldHandle(who.handle)" not in fn(lib, "editBrass"):
        problems.append(f"{LIB.name}: editBrass no longer checks that the moderator editing is the one who posted.")
    m = re.search(r"async function brassFields\(.*?\n\}", lib, re.S)
    fields = m.group(0) if m else ""
    if "cleanBrassAlt(f.alt)" not in fields or "f.yes !== true" not in fields:
        problems.append(f"{LIB.name}: a picture on the board no longer needs a description and a yes.")
    if "carriesMetadata(bytes, kind)" not in fn(lib, "putBrassImage"):
        problems.append(f"{LIB.name}: putBrassImage no longer refuses a picture still carrying camera data.")
    if "escHtml(" not in fn(lib, "brassHtml"):
        problems.append(f"{LIB.name}: the feed's HTML no longer escapes what was typed.")

    f = code_of(FN)
    post = f.index("if (who.role !== 'base')") if "if (who.role !== 'base')" in f else -1
    first = min([i for i in (f.find("b.action === 'post'"), f.find("b.action === 'preview'")) if i >= 0] or [-1])
    if post < 0 or first < 0 or post > first:
        problems.append(f"{FN.name}: it no longer refuses a pass that is not a moderator's before doing anything.")
    if not FEED.exists() or "path: '/brass-tacks.xml'" not in FEED.read_text():
        problems.append("brass-feed.mjs: the board has lost its feed at /brass-tacks.xml.")

    page = PAGE.read_text()
    if 'href="/brass-tacks.xml"' not in page or 'type="application/rss+xml" title="The Brass Tacks Board' not in page:
        problems.append(f"{PAGE.name}: the page does not link its own feed.")
    if not re.search(r'id="brass-write"[^>]*hidden', page):
        problems.append(f"{PAGE.name}: the form's section must ship hidden, so a page with no script shows no dead control.")
    if 'href="privacy.html#brass-tacks"' not in page or 'id="brass-tacks"' not in PRIVACY.read_text():
        problems.append(f"{PRIVACY.name}: no section with id=\"brass-tacks\", which the board links for what it keeps.")

    if problems:
        print("REFUSING:\n  " + "\n  ".join(problems))
        return 1
    print("brass tacks: built from nodes and never HTML, only moderators post, only the author edits, "
          "every picture described and said yes to, and the board has its feed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
