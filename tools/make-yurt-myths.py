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
for word in (r"\bheals?\b", r"\bhealing\b", r"\bcures?\b", r"\bforag\w*", r"\bsafe to eat\b"):
    if re.search(word, raw, re.I):
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
for part, block in (("summer", summer), ("winter", winter), ("stones", stones), ("arthur", arthur),
                    ("creatures", creatures), ("cards", cards), ("wheel", wheel), ("books", books)):
    b, e = f"<!-- yurt-myths:{part}:begin -->", f"<!-- yurt-myths:{part}:end -->"
    if page.count(b) != 1 or page.count(e) != 1:
        raise SystemExit(f"REFUSING: faery-myths-room.html must hold one {b} and one {e}.")
    inline = part in ("summer", "winter")
    a, z = page.index(b) + len(b), page.index(e)
    page = page[:a] + (block if inline else "\n    " + block + "\n    ") + page[z:]
old = PAGE.read_text(encoding="utf-8")
if page != old:
    PAGE.write_text(page, encoding="utf-8")
n = len(st["facts"]) + len(ar["layers"]) + len(d["creatures"]) + len(d["cards"])
print(f"make-yurt-myths: the stones, Arthur, the folk, the cards, the wheel and the shelf written; every one of them sourced.")
