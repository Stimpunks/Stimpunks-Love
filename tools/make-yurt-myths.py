#!/usr/bin/env python3
"""Build Myths & Legends, behind Helen Edgar's Faery Yurt, through the Alchemist's Arch.

HELEN ASKED FOR THIS ROOM, at the keyboard on 2026-10-25: "more faery and myths
and legends section for my yurt", The Golden Bough, "more fun faery stuff and
myths facts", English folklore, "Stone henge ideas to make more magical", King
Arthur and Merlin, and "an alchemist archway into myths and legends made of
amythest crystal and amber stones". The room is hers, so the ask is the licence;
what this tool adds is the street's plumbing round it, and the street's one rule
about a room of stories: SAY WHICH IS A STORY AND WHICH IS KNOWN.

ONE DATA FILE, ONE TOOL. data/yurt-myths.json holds every fact, creature, card,
festival and book; this writes them into faery-myths-room.html between the
yurt-myths:<part> markers. Edit the data, never the markers.

WHAT IT REFUSES, AND WHY:

  - A FACT WITH NO SOURCE. Every fact about the stones, every layer of the
    Arthur story, every creature, card and festival names an address it was read
    on (https only), because a room of myths is exactly where something typed
    from memory reads as known. The sources were read on the day in `_checked`.
  - A CARD WITH ONLY ONE SIDE. A story-or-fact card has the story on the front
    and what is known on the back, and both are words.
  - A BOOK THAT IS NOT FREE EVERYWHERE. Every book on the shelf must be by
    somebody, author and translator both, who died more than seventy years ago,
    counted against the current year rather than a date in the file (the
    Doomscroll's bar), and must link a free copy.
  - THE GOLDEN BOUGH WITHOUT ITS CARE LINE. Frazer's book is famous and its big
    theories have since been set aside; a shelf that handed it over as fact
    would be teaching them. Any book carrying `care` prints it under the title.
  - AN HTML ENTITY IN THE DATA. Everything is escaped on the way into the page,
    so an entity there arrives as five literal characters (the spoon drawer's
    lesson). Write the character.
  - A CLAIM OF CURE, OR ADVICE TO GO FORAGING. The stones are not said to heal,
    and a fairy ring is never a guide to a mushroom: Mycelium Munchies' rule,
    in the room where a fairy ring turns up.
  - A CRYSTAL PHOTOGRAPH NOBODY CAN CREDIT. Every stone on the Crystal Wheel is
    somebody's photograph from Wikimedia Commons: it must name its photographer,
    its Commons page and a licence this site can use (no NC, no ND), with a link
    to the licence, and the card credits it as the licence asks. The file must be
    a JPEG with no camera data left in it. And every meaning says whether it is
    old tradition or modern crystal lore; the wheel says once, with a source,
    that none of it is medicine.
  - A NEW BOOK LINKED ANYWHERE BUT ITS PUBLISHER. Helen's ask, 2026-10-26: the
    Green Witch shelf links every book to its own page at its publisher and
    never to Amazon, so the tool refuses a link off PUBLISHERS, an Amazon
    address anywhere in the data or the page, and a book with no ISBN in its
    address. A book not out yet says the day it is out, worked out against
    today, rather than passing for one you can have now.
  - A CRYSTAL POUCH THAT KEEPS MORE THAN WHICH CRYSTALS. Helen's ask,
    2026-10-26: Take it with you on every card puts that crystal in a pouch in
    your Profile on the radio. This tool writes CRYSTAL_IDS into
    netlify/cb/lib.mjs and the drawings' list into crystal-pouch.js, and
    refuses: a stone with no drawing or with inks love.css does not declare;
    the pouch keeping anything but which crystals (nothing about when);
    deleting a username or Forget me leaving it; crystal-pouch.js reading
    anything but love-cb, writing anything, sending anywhere but /cb/crystals or
    writing markup from a string; and privacy.html without its section.
  - A HERB BASKET OR A BOOK OF BREWS THAT IS ANYTHING BUT STORIES. Helen's ask,
    2026-10-26: the Herbery, where Gather it puts a herb in a basket in your
    Profile, the pouch's arrangement, and a cauldron that names the brew or
    stew you stirred from the room's own book. The tool refuses: a herb with
    no drawing, no inks love.css declares, or a fact or a piece of lore with no
    source; a brew in the book naming a herb not in the Herbery, two brews of
    the same herbs, a brew of anything but two herbs or a stew of anything but
    three; a measure or a dose anywhere in the Herbery's data, because the brews
    are words and never recipes, and the room without its note saying so; and
    herb-basket.js or the basket breaking any promise the pouch keeps.
  - ANYTHING IN §128 THAT MAKES A LIGHT FLASH. The amber glows slowly and the
    amethyst glints at MAX GLITTER only; the tool refuses an animation outside
    an html[data-intensity="max"] rule, a keyframe faster than two seconds, and
    a transition on the sun.
"""
import datetime
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "yurt-myths.json"
PAGE = ROOT / "faery-myths-room.html"
CSS = ROOT / "love.css"

YEAR = datetime.date.today().year
problems = []


def refuse(msg):
    problems.append(msg)


def esc(s):
    return html.escape(str(s), quote=True)


def src_link(url, name):
    return f'<a href="{esc(url)}">{esc(name)}</a>'


d = json.loads(DATA.read_text(encoding="utf-8"))
raw = DATA.read_text(encoding="utf-8")
if re.search(r"&[a-zA-Z]+;|&#\d+;", raw):
    refuse("data/yurt-myths.json: an HTML entity in the data. Write the character itself.")
swept = re.sub(r"crystal[ _]healing", "", raw, flags=re.I)
for word in (r"\bheals?\b", r"\bhealing\b", r"\bcures?\b", r"\bremed\w*", r"\bforag\w*", r"\bsafe to eat\b"):
    if re.search(word, swept, re.I):
        refuse(f"data/yurt-myths.json: '{word}' in the data. The stones heal nothing and a fairy ring is no guide to a mushroom.")


def need_src(where, item):
    s = item.get("source")
    if not s or not str(s).startswith("https://"):
        refuse(f"{where}: no https source. Every fact in this room names where it was read.")
    if not item.get("source_name"):
        refuse(f"{where}: no source_name, the words the link carries.")


# ── The stones ──────────────────────────────────────────────────────────────
st = d["stones"]
for k in ("summer", "winter"):
    need_src(f"stones.sun.{k}", st["sun"][k])
for i, f in enumerate(st["facts"]):
    need_src(f"stones.facts[{i}]", f)
for i, n in enumerate(st["nearby"]):
    need_src(f"stones.nearby[{i}] {n.get('name')}", n)


def says_with_src(item):
    return f'{esc(item["says"])} <span class="myth-src">({src_link(item["source"], item["source_name"])})</span>'


summer = says_with_src(st["sun"]["summer"])
winter = says_with_src(st["sun"]["winter"])

stones = (
    '<div class="myth-panel">\n'
    '      <h3>What is known about the stones</h3>\n'
    '      <ul class="myth-list">\n'
    + "\n".join(f'        <li>{says_with_src(f)}</li>' for f in st["facts"]) + "\n"
    '      </ul>\n'
    '    </div>\n'
    '    <h3 style="margin-top:22px">Close by on the chalk</h3>\n'
    '    <ul class="myth-grid">\n'
    + "\n".join(
        f'      <li class="myth-panel"><h3>{esc(n["name"])}</h3><p class="myth-where">{esc(n["where"])}</p>'
        f'<p>{says_with_src(n)}</p></li>' for n in st["nearby"]) + "\n"
    '    </ul>'
)

# ── Arthur and Merlin ───────────────────────────────────────────────────────
ar = d["arthur"]
for i, l in enumerate(ar["layers"]):
    need_src(f"arthur.layers[{i}]", l)
for i, p in enumerate(ar["people"]):
    need_src(f"arthur.people[{i}] {p.get('name')}", p)
for i, p in enumerate(ar["places"]):
    need_src(f"arthur.places[{i}] {p.get('name')}", p)

arthur = (
    '<div class="myth-panel">\n'
    '      <h3>How the story grew</h3>\n'
    '      <ul class="myth-list">\n'
    + "\n".join(f'        <li><b>{esc(l["when"])}.</b> {says_with_src(l)}</li>' for l in ar["layers"]) + "\n"
    '      </ul>\n'
    '    </div>\n'
    '    <h3 style="margin-top:22px">Who is in it</h3>\n'
    '    <ul class="myth-grid">\n'
    + "\n".join(f'      <li class="myth-panel"><h3>{esc(p["name"])}</h3><p>{says_with_src(p)}</p></li>' for p in ar["people"]) + "\n"
    '    </ul>\n'
    '    <h3 style="margin-top:22px">Where he is said to have been</h3>\n'
    '    <ul class="myth-grid">\n'
    + "\n".join(
        f'      <li class="myth-panel"><h3>{esc(p["name"])}</h3><p class="myth-where">{esc(p["where"])}</p>'
        f'<p>{says_with_src(p)}</p></li>' for p in ar["places"]) + "\n"
    '    </ul>'
)

# ── The folk under the hill ─────────────────────────────────────────────────
for i, c in enumerate(d["creatures"]):
    need_src(f"creatures[{i}] {c.get('name')}", c)
    if not c.get("where"):
        refuse(f"creatures[{i}] {c.get('name')}: no `where`. A creature of English folklore belongs to a place.")
creatures = (
    '<ul class="myth-grid">\n'
    + "\n".join(
        f'      <li class="myth-panel"><h3>{esc(c["name"])}</h3><p class="myth-where">{esc(c["where"])}</p>'
        f'<p>{says_with_src(c)}</p></li>' for c in d["creatures"]) + "\n"
    '    </ul>'
)

# ── Story or fact? ──────────────────────────────────────────────────────────
for i, c in enumerate(d["cards"]):
    if not c.get("story") or not c.get("fact"):
        refuse(f"cards[{i}]: a card needs a story on the front and what is known on the back.")
    need_src(f"cards[{i}]", c)
cards = (
    '<ul class="myth-cards">\n'
    + "\n".join(
        f'      <li class="myth-card myth-panel"><details><summary>{esc(c["story"])}</summary>'
        f'<p class="myth-card__fact"><b class="myth-tag">What is known</b><br>{esc(c["fact"])} '
        f'<span class="myth-src">({src_link(c["source"], c["source_name"])})</span></p></details></li>'
        for c in d["cards"]) + "\n"
    '    </ul>'
)

# ── The Wheel of the Year ───────────────────────────────────────────────────
wh = d["wheel"]
need_src("wheel", wh)
fest = wh["festivals"]
if len(fest) != 8:
    refuse("wheel: the Wheel of the Year has eight festivals, and the drawing is eight spokes.")
import math
spokes, names = [], []
for i, f in enumerate(fest):
    a = math.radians(-90 + i * 45)
    x, y = 100 + 86 * math.cos(a), 100 + 86 * math.sin(a)
    spokes.append(f'<line x1="100" y1="100" x2="{x:.1f}" y2="{y:.1f}"/>')
    dx, dy = 100 + 76 * math.cos(a), 100 + 76 * math.sin(a)
    fill = "var(--myth-amber)" if i % 2 == 0 else "var(--myth-amethyst)"
    names.append(f'<circle cx="{dx:.1f}" cy="{dy:.1f}" r="7" fill="{fill}"/>')
wheel_svg = (
    '<svg class="myth-wheel__draw" viewBox="0 0 200 200" aria-hidden="true" focusable="false">'
    '<circle cx="100" cy="100" r="90" fill="var(--rdr-panel)" stroke="var(--rdr-brass)" stroke-width="2"/>'
    '<g stroke="var(--rdr-brass)" stroke-width="1.2" opacity=".6">' + "".join(spokes) + '</g>'
    '<circle cx="100" cy="100" r="14" fill="var(--rdr-wall)" stroke="var(--rdr-brass)" stroke-width="2"/>'
    + "".join(names) + '</svg>'
)
wheel = (
    f'<p class="myth-intro">{esc(wh["note"])} '
    f'<span class="myth-src">({src_link(wh["source"], wh["source_name"])})</span></p>\n'
    '    <div class="myth-wheel">\n'
    f'      {wheel_svg}\n'
    '      <ul class="myth-list">\n'
    + "\n".join(f'        <li><b>{esc(f["name"])}</b>, {esc(f["when"])}. {esc(f["says"])}</li>' for f in fest) + "\n"
    '      </ul>\n'
    '    </div>'
)

# ── The old books ───────────────────────────────────────────────────────────
for i, b in enumerate(d["books"]):
    for who, died in [("by", b.get("died"))] + [("translated by", b.get("translator_died"))] * bool(b.get("translator")):
        if died is None:
            refuse(f"books[{i}] {b.get('title')}: no death year for whoever it is {who}.")
        elif YEAR - died <= 70:
            refuse(f"books[{i}] {b.get('title')}: {who} died in {died}, under seventy years ago; not free everywhere.")
    if not str(b.get("read", "")).startswith("https://"):
        refuse(f"books[{i}] {b.get('title')}: no free copy to read (`read`, https).")
    if "golden bough" in b.get("title", "").lower() and not b.get("care"):
        refuse("The Golden Bough is on the shelf without its care line.")


def book(b):
    who = esc(b["by"])
    if b.get("translator"):
        who += f', translated by {esc(b["translator"])}'
    care = f'<p class="myth-book__care">{esc(b["care"])} <span class="myth-src">({src_link(b["care_source"], b["care_source_name"])})</span></p>' if b.get("care") else ""
    return (f'      <li class="myth-book"><p class="myth-book__title">{esc(b["title"])}</p>'
            f'<p>{who}, {esc(b["year"])}. {esc(b["says"])}</p>{care}'
            f'<p><a href="{esc(b["read"])}">Read it free at {esc(b["read_name"])}</a></p></li>')


books = '<ul class="myth-books">\n' + "\n".join(book(b) for b in d["books"]) + "\n    </ul>\n" + \
    f'    <p class="myth-src">Every fact in this room was read on the page it links to, on {esc(d["_checked"])}.</p>'


# ── The Green Witch shelf ───────────────────────────────────────────────────
# Helen's ask, 2026-10-26: these books and similar, straight from the publisher,
# never Amazon. New books are not free, so each links to its publisher's page.
PUBLISHERS = ("https://www.simonandschuster.co.uk/books/",)
if re.search(r"(amazon|amzn)\.[a-z]", raw, re.I):
    refuse("data/yurt-myths.json: an Amazon link. Books on this street link to their publisher.")
gs = d["green_shelf"]
for k in ("by", "imprint", "publisher", "intro", "checked"):
    if not gs.get(k):
        refuse(f"green_shelf.{k}: missing.")
for i, b in enumerate(gs["books"]):
    if not str(b.get("url", "")).startswith(PUBLISHERS):
        refuse(f"green_shelf.books[{i}] {b.get('title')}: not linked to its publisher's own page.")
    if not re.fullmatch(r"97[89]\d{10}", str(b.get("isbn", ""))) or not str(b.get("url", "")).endswith(str(b.get("isbn"))):
        refuse(f"green_shelf.books[{i}] {b.get('title')}: no ISBN, or the address is not that ISBN's page.")
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", str(b.get("out", ""))):
        refuse(f"green_shelf.books[{i}] {b.get('title')}: no day it came out (out, YYYY-MM-DD).")
TODAY = datetime.date.today()


def when(day):
    t = datetime.date.fromisoformat(day)
    return f"out on {t.day} {t.strftime('%B %Y')}" if t > TODAY else str(t.year)


def green_book(b):
    return (f'      <li class="myth-book"><p class="myth-book__title">{esc(b["title"])}</p>'
            f'<p>{esc(b["subtitle"])}.</p>'
            f'<p>A {esc(b["kind"])}, {esc(gs["imprint"])}, {esc(when(b["out"]))}.</p>'
            f'<p><a href="{esc(b["url"])}">{esc(b["title"])} at {esc(gs["publisher"])}</a></p></li>')


green = (f'<p class="myth-intro">{esc(gs["intro"])}</p>\n'
         '    <ul class="myth-books">\n' + "\n".join(green_book(b) for b in sorted(gs["books"], key=lambda b: b["out"])) + "\n    </ul>\n" +
         f'    <p class="myth-src">Every title and date was read on its page at {esc(gs["publisher"])}, on {esc(gs["checked"])}. By {esc(gs["by"])}.</p>')

# ── The Crystal Wheel ───────────────────────────────────────────────────────
# Helen's ask, 2026-10-26: the main popular crystals, with photographs, in a
# circle, with their meanings. Every photograph is somebody's, shared on
# Wikimedia Commons under a licence that lets this site use it, and is credited
# on its card as that licence asks. Every meaning is a belief or a story and
# says which kind; the room says once, at the top, that none of it is medicine.
import sys
sys.path.insert(0, str(ROOT / "tools"))
import imgsize  # noqa: E402

FREE = {"CC BY 2.0", "CC BY 2.5", "CC BY 3.0", "CC BY 4.0", "CC BY-SA 2.0", "CC BY-SA 2.5",
        "CC BY-SA 3.0", "CC BY-SA 4.0", "CC0", "Public domain"}
KINDS = {"old tradition": "Old tradition", "modern crystal lore": "Modern crystal lore"}
cw = d["crystals"]
for k in ("note", "note_says", "note_source", "note_source_name"):
    if not cw.get(k):
        refuse(f"crystals.{k}: the wheel says once, with its source, that the meanings are not medicine.")
stones_cw = cw["stones"]


def jpeg_exif(path):
    b = path.read_bytes()
    if b[:2] != b"\xff\xd8":
        return None
    i = 2
    while i + 4 < len(b) and b[i] == 0xFF:
        m, n = b[i + 1], int.from_bytes(b[i + 2:i + 4], "big")
        if m == 0xE1 and (b[i + 4:i + 8] == b"Exif" or b[i + 4:i + 9] == b"http:"):
            return True
        if m == 0xDA:
            break
        i += 2 + n
    return False


seen = set()
for i, c in enumerate(stones_cw):
    w = f"crystals.stones[{i}] {c.get('name')}"
    if c.get("slug") in seen:
        refuse(f"{w}: on the wheel twice.")
    seen.add(c.get("slug"))
    f = ROOT / c.get("file", "")
    if not f.is_file():
        refuse(f"{w}: no photograph at {c.get('file')}.")
    else:
        ex = jpeg_exif(f)
        if ex is None:
            refuse(f"{w}: {c['file']} is not a JPEG.")
        elif ex:
            refuse(f"{w}: {c['file']} still carries camera data. Save it again without.")
    if c.get("licence") not in FREE:
        refuse(f"{w}: licence {c.get('licence')!r} is not one this site can use (no NC, no ND).")
    if c.get("licence") != "Public domain" and not str(c.get("licence_url", "")).startswith("https://creativecommons.org/"):
        refuse(f"{w}: no link to its licence, which crediting it needs.")
    if not str(c.get("commons", "")).startswith("https://commons.wikimedia.org/wiki/File:"):
        refuse(f"{w}: no Commons file page, where its licence lives.")
    if not c.get("photo_by"):
        refuse(f"{w}: no photographer to credit.")
    if not c.get("shows"):
        refuse(f"{w}: no `shows`, the words for the photograph.")
    if not c.get("facts"):
        refuse(f"{w}: no facts about what it is.")
    for j, fa in enumerate(c.get("facts", [])):
        need_src(f"{w} facts[{j}]", fa)
    need_src(f"{w} lore", c.get("lore", {}))
    if c.get("lore", {}).get("kind") not in KINDS:
        refuse(f"{w}: lore must say whether it is old tradition or modern crystal lore.")
    if c.get("birthstone") and not str(c.get("birthstone_source", "")).startswith("https://"):
        refuse(f"{w}: a birthstone month with no source.")

import math as _m
n_cw = len(stones_cw)
spokes_cw, items_cw = [], []
for i, c in enumerate(stones_cw):
    a = _m.radians(-90 + i * 360 / max(n_cw, 1))
    x, y = 50 + 39 * _m.cos(a), 50 + 39 * _m.sin(a)
    spokes_cw.append(f'<line x1="50" y1="50" x2="{x:.2f}" y2="{y:.2f}"/>')
    items_cw.append(
        f'      <li class="myth-cw__stone" style="left:{x:.2f}%;top:{y:.2f}%">'
        f'<a href="#crystal-{esc(c["slug"])}" aria-label="{esc(c["name"])}">'
        f'<img src="{esc(c["file"])}" {imgsize.attrs(ROOT / c["file"])} alt="" loading="lazy" decoding="async">'
        f'<span class="myth-cw__name" aria-hidden="true">{esc(c["name"])}</span></a></li>')
wheel_cw = (
    f'<p class="myth-intro">{esc(cw["note"])} <span class="myth-src">(&ldquo;{esc(cw["note_says"])}&rdquo;: '
    f'{src_link(cw["note_source"], cw["note_source_name"])})</span></p>\n'
    '    <div class="myth-cw">\n'
    '      <svg class="myth-cw__ring" viewBox="0 0 100 100" aria-hidden="true" focusable="false">'
    '<circle cx="50" cy="50" r="39" fill="none" stroke="var(--rdr-brass)" stroke-width=".5" opacity=".7"/>'
    '<circle cx="50" cy="50" r="47" fill="none" stroke="var(--myth-amethyst)" stroke-width=".4" opacity=".8"/>'
    '<g stroke="var(--rdr-brass)" stroke-width=".25" opacity=".45">' + "".join(spokes_cw) + '</g></svg>\n'
    '      <p class="myth-cw__hub"><span>The Crystal Wheel</span><small>press a stone</small></p>\n'
    '      <ul class="myth-cw__stones">\n' + "\n".join(items_cw) + '\n      </ul>\n'
    '    </div>'
)


def crystal_card(c):
    birth = (f'<p class="myth-where">Birthstone for {esc(c["birthstone"])} '
             f'<span class="myth-src">({src_link(c["birthstone_source"], "GIA")})</span></p>') if c.get("birthstone") else ""
    facts = "".join(f'<li>{says_with_src(fa)}</li>' for fa in c["facts"])
    lic = (f'{src_link(c["licence_url"], c["licence"])}' if c.get("licence_url") else esc(c["licence"]))
    return (
        f'      <li class="myth-crystal myth-panel" id="crystal-{esc(c["slug"])}">'
        f'<img class="myth-crystal__photo" src="{esc(c["file"])}" {imgsize.attrs(ROOT / c["file"])} alt="{esc(c["shows"])}" loading="lazy" decoding="async">'
        f'<h3>{esc(c["name"])}</h3>{birth}'
        f'<p class="myth-crystal__h">What it is</p><ul class="myth-list">{facts}</ul>'
        f'<p class="myth-crystal__h">{KINDS[c["lore"]["kind"]]}</p>'
        f'<p>{says_with_src(c["lore"])}</p>'
        f'<p class="myth-crystal__credit">Photograph by {esc(c["photo_by"])}, {lic}, '
        f'{src_link(c["commons"], "via Wikimedia Commons")}; resized, and cropped to a circle on the wheel.</p>'
        f'<p class="myth-crystal__take" data-crystal-take="{esc(c["slug"])}" hidden>'
        f'<button type="button" class="myth-crystal__btn">Take it with you</button>'
        f'<span class="myth-crystal__said" data-crystal-said role="status"></span></p>'
        f'<p class="myth-crystal__back"><a href="#crystals">Back to the wheel</a></p></li>')


cards_cw = '<ul class="myth-crystals">\n' + "\n".join(crystal_card(c) for c in stones_cw) + '\n    </ul>'


# ── The crystal pouch ───────────────────────────────────────────────────────
LIB = ROOT / "netlify" / "cb" / "lib.mjs"
POUCH = ROOT / "crystal-pouch.js"
pjs = POUCH.read_text(encoding="utf-8")
dm = re.search(r"var DRAW = \{(.*?)\n  \};", pjs, re.S)
SHAPES = set(re.findall(r"(?m)^    (\w+): function", dm.group(1))) if dm else set()
if not SHAPES:
    refuse("crystal-pouch.js: no DRAW to read the shapes from.")
root_css = re.search(r":root\s*\{(.*?)\n\}", CSS.read_text(encoding="utf-8"), re.S)
declared = set(re.findall(r"(--[\w-]+)\s*:", root_css.group(1))) if root_css else set()
for t in ("--crys-cloth", "--crys-line", "--crys-bag", "--crys-bag-2", "--crys-cord"):
    if t not in declared:
        refuse(f"love.css :root does not declare {t}, which every crystal in the pouch is drawn on.")
pouch_data = []
for c in stones_cw:
    pc = c.get("pouch") or {}
    if pc.get("shape") not in SHAPES:
        refuse(f"crystals {c.get('name')}: no drawing for the pouch (pouch.shape one of {sorted(SHAPES)}).")
    for k in ("ink", "shine"):
        if pc.get(k) not in declared:
            refuse(f"crystals {c.get('name')}: pouch.{k} {pc.get(k)} is not declared in love.css :root.")
    pouch_data.append({"id": c["slug"], "name": c["name"], "shape": pc.get("shape"), "ink": pc.get("ink"), "shine": pc.get("shine")})
psrc = re.sub(r"/\*.*?\*/", " ", pjs, flags=re.S)
psrc = re.sub(r"(?m)^\s*//.*$", " ", psrc)
for m in re.finditer(r"localStorage\.(\w+)\(\s*([^,)]+)", psrc):
    if m.group(1) != "getItem" or m.group(2).strip() != "PASS_KEY":
        refuse(f"crystal-pouch.js {m.group(1)}s {m.group(2).strip()}. It reads love-cb and nothing else, and writes nothing.")
if "var PASS_KEY = 'love-cb';" not in psrc or "var CRYSTALS = '/cb/crystals';" not in psrc:
    refuse("crystal-pouch.js no longer names love-cb and /cb/crystals as the two things it touches.")
if psrc.count("fetch(") != 1 or "fetch(CRYSTALS," not in psrc:
    refuse("crystal-pouch.js sends somewhere other than /cb/crystals, or not through its one call().")
if re.search(r"innerHTML|outerHTML|insertAdjacentHTML|DOMParser|document\.write|sessionStorage|indexedDB|"
             r"document\.cookie|sendBeacon|WebSocket|EventSource|XMLHttpRequest", psrc):
    refuse("crystal-pouch.js writes markup from a string, or keeps or sends something some other way.")
lib = LIB.read_text(encoding="utf-8")
pc_fn = re.search(r"export async function pouchCrystal\(.*?\n\}", lib, re.S)
if not pc_fn or "s.setJSON(key, { crystals: next }" not in pc_fn.group(0) or re.search(r"\bnow\b|Date|\bt:", pc_fn.group(0)):
    refuse("lib.mjs: pouchCrystal keeps something other than which crystals. It keeps nothing about when.")
da = re.search(r"export async function deleteAccount\(.*?\n\}", lib, re.S)
if not da or "await forgetCrystals(petKey(handle), s);" not in da.group(0):
    refuse("lib.mjs: deleting a username no longer empties the crystal pouch kept under it.")
if "forgetCrystals(pk)" not in (ROOT / "netlify" / "functions" / "cb-pets.mjs").read_text(encoding="utf-8"):
    refuse("cb-pets.mjs: Forget me no longer empties the crystal pouch.")
if 'id="crystals"' not in (ROOT / "privacy.html").read_text(encoding="utf-8"):
    refuse("privacy.html has no section on the crystal pouch (#crystals). It was written first; it stays.")


# ── The Herbery ─────────────────────────────────────────────────────────────
# Helen's ask, 2026-10-26: herbs to gather into a basket in your Profile, and a
# cauldron that names the brew or stew you stirred from the room's own book.
HB = d["herbery"]
HERB_KINDS = {"myth": "Myth", "folklore": "Folklore", "old tradition": "Old tradition", "history": "History"}
BASKET = ROOT / "herb-basket.js"
bjs = BASKET.read_text(encoding="utf-8")
hdm = re.search(r"var DRAW = \{(.*?)\n  \};", bjs, re.S)
HERB_SHAPES = set(re.findall(r"(?m)^    (\w+): function", hdm.group(1))) if hdm else set()
if not HERB_SHAPES:
    refuse("herb-basket.js: no DRAW to read the herbs' drawings from.")
for k in ("intro", "note"):
    if not HB.get(k):
        refuse(f"herbery.{k}: missing; the room says once, plainly, that the brews are stories and not recipes.")
hb_raw = json.dumps(HB, ensure_ascii=False)
for word in (r"\bdos(e|es|age)\b", r"\bteaspoons?\b", r"\btablespoons?\b", r"\btsp\b", r"\btbsp\b", r"\b\d+\s?(g|ml|mg|grams?)\b",
             r"\bsteep\b", r"\bboil\b", r"\btake (it|this|them)\b", r"\bsafe to\b"):
    if re.search(word, hb_raw, re.I):
        refuse(f"herbery: '{word}' in the data. The brews and stews are words, never a recipe or a measure.")
hslugs = []
for h in HB["herbs"]:
    hslugs.append(h["slug"])
    if h.get("draw") not in HERB_SHAPES:
        refuse(f"herbery {h.get('name')}: no drawing (draw one of {sorted(HERB_SHAPES)}).")
    for i, fa in enumerate(h.get("facts") or []):
        need_src(f"herbery {h.get('name')} facts[{i}]", fa)
    if not h.get("facts"):
        refuse(f"herbery {h.get('name')}: no facts.")
    lo = h.get("lore") or {}
    need_src(f"herbery {h.get('name')} lore", lo)
    if lo.get("kind") not in HERB_KINDS:
        refuse(f"herbery {h.get('name')}: lore.kind must be one of {sorted(HERB_KINDS)}.")
if len(set(hslugs)) != len(hslugs):
    refuse("herbery: two herbs with one slug.")
herb_tokens = {}
for h in HB["herbs"]:
    herb_tokens[h["slug"]] = (f"--herb-{h['slug']}", f"--herb-{h['slug']}-2")
    for t in herb_tokens[h["slug"]]:
        if t not in declared:
            refuse(f"herbery {h['name']}: love.css :root does not declare {t}.")
for t in ("--herb-cloth", "--herb-line", "--herb-wicker", "--herb-wicker-2", "--herb-iron", "--herb-iron-2"):
    if t not in declared:
        refuse(f"love.css :root does not declare {t}, which the basket and the cauldron are drawn in.")
seen_sets = set()
for b in HB["book"]:
    hs = b.get("herbs") or []
    for x in hs:
        if x not in hslugs:
            refuse(f"herbery book {b.get('name')}: {x} is not a herb in the Herbery.")
    want = {"brew": 2, "stew": 3}.get(b.get("kind"))
    if want is None or len(set(hs)) != want or len(hs) != want:
        refuse(f"herbery book {b.get('name')}: a brew is two herbs and a stew is three.")
    key = tuple(sorted(hs))
    if key in seen_sets:
        refuse(f"herbery book {b.get('name')}: another brew in the book is made of the same herbs.")
    seen_sets.add(key)
    if not b.get("says"):
        refuse(f"herbery book {b.get('name')}: no line of its own.")
by_slug = {h["slug"]: h["name"] for h in HB["herbs"]}


def and_list(xs):
    return xs[0] if len(xs) == 1 else ", ".join(xs[:-1]) + " and " + xs[-1]


def herb_card(h):
    facts = "".join(f'<li>{says_with_src(fa)}</li>' for fa in h["facts"])
    return (
        f'      <li class="myth-herb myth-panel" id="herb-{esc(h["slug"])}">'
        f'<span class="myth-herb__frame" data-herb-art="{esc(h["slug"])}"></span>'
        f'<h3>{esc(h["name"])}</h3>'
        f'<p class="myth-crystal__h">What it is</p><ul class="myth-list">{facts}</ul>'
        f'<p class="myth-crystal__h">{HERB_KINDS[h["lore"]["kind"]]}</p>'
        f'<p>{says_with_src(h["lore"])}</p>'
        f'<p class="myth-crystal__take" data-herb-take="{esc(h["slug"])}" hidden>'
        f'<button type="button" class="myth-crystal__btn">Gather it</button>'
        f'<span class="myth-crystal__said" data-herb-said role="status"></span></p>'
        f'<p class="myth-crystal__back"><a href="#cauldron">To the cauldron</a></p></li>')


picks = "".join(
    f'<label class="myth-cauldron__pick"><input type="checkbox" data-herb="{esc(h["slug"])}"> {esc(h["name"])}</label>'
    for h in HB["herbs"])
book_items = "\n".join(
    f'        <li><b>{esc(b["name"])}</b>, a {esc(b["kind"])} of {esc(and_list([by_slug[x] for x in b["herbs"]]))}. {esc(b["says"])}</li>'
    for b in HB["book"])
herbery = (
    f'<p class="myth-intro">{esc(HB["intro"])}</p>\n'
    f'    <p class="myth-herbery__note">{esc(HB["note"])}</p>\n'
    '    <ul class="myth-herbs">\n' + "\n".join(herb_card(h) for h in HB["herbs"]) + '\n    </ul>\n'
    '    <h3 id="cauldron" class="myth-herbery__h">The cauldron</h3>\n'
    '    <div class="myth-cauldron myth-panel" data-cauldron hidden>\n'
    '      <div class="myth-cauldron__art-box" data-cauldron-art></div>\n'
    '      <fieldset class="myth-cauldron__picks"><legend>Tip in two or three herbs</legend>' + picks + '</fieldset>\n'
    '      <p class="myth-cauldron__go"><button type="button" class="myth-crystal__btn" data-cauldron-stir>Stir</button> '
    '<button type="button" class="myth-crystal__btn" data-cauldron-empty>Empty it</button></p>\n'
    '      <p class="myth-cauldron__said" data-cauldron-said role="status"></p>\n'
    '    </div>\n'
    '    <h3 id="book-of-brews" class="myth-herbery__h">The book of brews and stews</h3>\n'
    '    <ul class="myth-list myth-brewbook">\n' + book_items + '\n    </ul>\n'
    f'    <p class="myth-src">Every fact and story about a herb was read on the page it links to, on {esc(d["_checked"])}; the book is this room&rsquo;s own.</p>')
herb_data = {"room": PAGE.name,
             "herbs": [{"id": h["slug"], "name": h["name"], "draw": h["draw"], "ink": herb_tokens[h["slug"]][0], "shine": herb_tokens[h["slug"]][1]} for h in HB["herbs"]],
             "book": [{"name": b["name"], "kind": b["kind"], "herbs": b["herbs"], "says": b["says"]} for b in HB["book"]]}
bsrc = re.sub(r"/\*.*?\*/", " ", bjs, flags=re.S)
bsrc = re.sub(r"(?m)^\s*//.*$", " ", bsrc)
for m in re.finditer(r"localStorage\.(\w+)\(\s*([^,)]+)", bsrc):
    if m.group(1) != "getItem" or m.group(2).strip() != "PASS_KEY":
        refuse(f"herb-basket.js {m.group(1)}s {m.group(2).strip()}. It reads love-cb and nothing else, and writes nothing.")
if "var PASS_KEY = 'love-cb';" not in bsrc or "var HERBS = '/cb/herbs';" not in bsrc:
    refuse("herb-basket.js no longer names love-cb and /cb/herbs as the two things it touches.")
if bsrc.count("fetch(") != 1 or "fetch(HERBS," not in bsrc:
    refuse("herb-basket.js sends somewhere other than /cb/herbs, or not through its one call(); the cauldron sends nothing.")
if re.search(r"innerHTML|outerHTML|insertAdjacentHTML|DOMParser|document\.write|sessionStorage|indexedDB|"
             r"document\.cookie|sendBeacon|WebSocket|EventSource|XMLHttpRequest", bsrc):
    refuse("herb-basket.js writes markup from a string, or keeps or sends something some other way.")
bh_fn = re.search(r"export async function basketHerb\(.*?\n\}", lib, re.S)
if not bh_fn or "s.setJSON(key, { herbs: next }" not in bh_fn.group(0) or re.search(r"\bnow\b|Date|\bt:", bh_fn.group(0)):
    refuse("lib.mjs: basketHerb keeps something other than which herbs. It keeps nothing about when.")
if not da or "await forgetHerbs(petKey(handle), s);" not in da.group(0):
    refuse("lib.mjs: deleting a username no longer empties the herb basket kept under it.")
if "forgetHerbs(pk)" not in (ROOT / "netlify" / "functions" / "cb-pets.mjs").read_text(encoding="utf-8"):
    refuse("cb-pets.mjs: Forget me no longer empties the herb basket.")
if 'id="herbs"' not in (ROOT / "privacy.html").read_text(encoding="utf-8"):
    refuse("privacy.html has no section on the herb basket (#herbs). It was written first; it stays.")

# ── §128 stays still but for the stones ─────────────────────────────────────
css = CSS.read_text(encoding="utf-8")
m = re.search(r"/\* §128 ── SUBROOM: Myths & Legends.*?(?=/\* §129 )", css, re.S)
if not m:
    refuse("love.css has no §128 for Myths & Legends before §129.")
else:
    sec = m.group(0)
    body = re.sub(r"/\*.*?\*/", "", sec, flags=re.S)
    for rule in re.finditer(r"([^{}]+)\{([^{}]*)\}", body):
        sel, decl = rule.group(1).strip(), rule.group(2)
        if re.search(r"\banimation\s*:", decl) and 'html[data-intensity="max"]' not in sel:
            refuse(f"§128: an animation outside MAX GLITTER ({sel}). The stones are still until somebody turns the dial up.")
        if re.search(r"\btransition\s*:", decl):
            refuse(f"§128: a transition ({sel}). The sun moves when a season is pressed, with no motion.")
    for kf in re.finditer(r"html\[data-intensity=\"max\"\][^{]*\{[^}]*animation:\s*([\w-]+)\s+([\d.]+)s", body):
        if float(kf.group(2)) < 2:
            refuse(f"§128: {kf.group(1)} runs in {kf.group(2)}s. Nothing in here may pulse faster than once in two seconds.")

if problems:
    raise SystemExit("REFUSING:\n  " + "\n  ".join(problems))

# ── Write ───────────────────────────────────────────────────────────────────
page = PAGE.read_text(encoding="utf-8")
if re.search(r"(amazon|amzn)\.[a-z]", page, re.I):
    raise SystemExit("REFUSING: faery-myths-room.html links to Amazon. Link the publisher.")
for part, block in (("summer", summer), ("winter", winter), ("stones", stones), ("arthur", arthur),
                    ("creatures", creatures), ("cards", cards), ("wheel", wheel), ("crystal-wheel", wheel_cw),
                    ("crystal-cards", cards_cw), ("herbery", herbery), ("books", books), ("green-shelf", green)):
    b, e = f"<!-- yurt-myths:{part}:begin -->", f"<!-- yurt-myths:{part}:end -->"
    if page.count(b) != 1 or page.count(e) != 1:
        raise SystemExit(f"REFUSING: faery-myths-room.html must hold one {b} and one {e}.")
    inline = part in ("summer", "winter")
    a, z = page.index(b) + len(b), page.index(e)
    page = page[:a] + (block if inline else "\n    " + block + "\n    ") + page[z:]

def swap(text, b, e, block, name):
    if text.count(b) != 1 or text.count(e) != 1:
        raise SystemExit(f"REFUSING: {name} must hold one {b} and one {e}.")
    return text[:text.index(b) + len(b)] + block + text[text.index(e):]


if '<script src="crystal-pouch.js" defer></script>' not in page:
    raise SystemExit("REFUSING: faery-myths-room.html does not load crystal-pouch.js, so no crystal can be taken.")
ids_line = "\nexport const CRYSTAL_IDS = " + json.dumps([c["slug"] for c in stones_cw]) + ";\n"
new_lib = swap(lib, "/* crystal:ids:begin */", "/* crystal:ids:end */", ids_line, "lib.mjs")
if new_lib != lib:
    LIB.write_text(new_lib, encoding="utf-8")
data_line = "\n  var DATA = " + json.dumps({"room": PAGE.name, "crystals": pouch_data}, ensure_ascii=False) + ";\n  "
new_pjs = swap(pjs, "/* crystals:data:begin */", "/* crystals:data:end */", data_line, "crystal-pouch.js")
if new_pjs != pjs:
    POUCH.write_text(new_pjs, encoding="utf-8")
if '<script src="herb-basket.js" defer></script>' not in page:
    raise SystemExit("REFUSING: faery-myths-room.html does not load herb-basket.js, so no herb can be gathered and the cauldron is cold.")
new_lib2 = swap(new_lib, "/* herb:ids:begin */", "/* herb:ids:end */", "\nexport const HERB_IDS = " + json.dumps(hslugs) + ";\n", "lib.mjs")
if new_lib2 != new_lib:
    LIB.write_text(new_lib2, encoding="utf-8")
hb_line = "\n  var DATA = " + json.dumps(herb_data, ensure_ascii=False) + ";\n  "
new_bjs = swap(bjs, "/* herbs:data:begin */", "/* herbs:data:end */", hb_line, "herb-basket.js")
if new_bjs != bjs:
    BASKET.write_text(new_bjs, encoding="utf-8")
old = PAGE.read_text(encoding="utf-8")
if page != old:
    PAGE.write_text(page, encoding="utf-8")
print("make-yurt-myths: the stones, Arthur, the folk, the cards, the wheel, the crystals and their pouch, the herbs, their basket and the cauldron, the old shelf and the Green Witch shelf written; every one of them sourced, every photograph credited.")
