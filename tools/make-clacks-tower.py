#!/usr/bin/env python3
"""Build The Clacks Tower: its cabin, its sections and its credits, from data/clacks-tower.json.

ONE DATA FILE, ONE TOOL, TWO SURFACES, the contract make-yells.py set. The room
is behind Widdershins, in the city over the bridge (Ryan's ask, 2026-11-04:
subrooms of Widdershins inspired by places in the Discworld novels). It is the
shutter cabin at the top of a tower of the Grand Trunk, the semaphore company
in Terry Pratchett's Going Postal (2004), and it stands on what Star Stuff has
already written in One Atom of Justice (No. 49): the clacks workers on the
towers, the Overhead, GNU John Dearheart, and the X-Clacks-Overhead header this
street sends. This tool writes, between clk:<part> markers in clacks-tower.html:

  · THE CABIN (clk:view): inside the cabin at noon, looking at the wall of
    shutters. The shutters stand open in one pattern and shut in the rest, and
    the sun comes through the open ones onto the floorboards in squares, in the
    same pattern, worked out here by projecting each opening along the sun onto
    the floor and then onto the picture. Through the open shutter in the middle,
    the next tower on the next hill.
  · EVERY SECTION (clk:lede, clk:tower, clk:overhead, clk:header, clk:crews,
    clk:light), block by block, each in a square of daylight.
  · WHAT IS NOT UP HERE (clk:rules), NEXT DOOR (clk:elsewhere) and THE CREDITS
    (clk:credits), with a table of the quotations in liner-notes.html.

THE LIGHT IS THE MESSAGE GOING OUT. The day is outside, behind the shutters, and
comes in only where a shutter stands open, so the light on the floor is the
shape of what the tower is sending, cut out of the sun. Every word in the room
stands in one of those squares or in the shade between them.

WHAT IT REFUSES:

  · A LINE NOBODY HAS CHECKED. Star Stuff gives one line from Going Postal
    about what a name in the Overhead is for, and says in its own colophon that
    the wording came from a reference wiki and was never checked against the
    novel. So the room says what the line is about and does not print it, and
    the tool refuses the line anywhere in the data or on the page. The friendly
    edit is the line everybody knows; it goes in when somebody reads it in the
    book, with the page, and not before.
  · A DIAGNOSIS, A RANKING, PITY, INSPIRATION OR THE CURE, in our voice, with
    the negation window: make-widdershins.py's sweeps, imported, never copied.
  · A FAN WIKI OR A FAN SITE, linked or named as a source, and any <img>: no
    cover, crest, crew or character of the book's. The tower is ours.
  · A QUOTATION over the cap in the data, with no author, carrying an HTML
    entity, read off anything but a page in `pages`, or, where the copy it was
    read on is on the machine, not there word for word. A `holds` line those
    copies, or a room next door, no longer say.
  · THE HEADER GONE. The room says this street sends GNU Terry Pratchett, and
    _headers has to.
  · A PATTERN WITH NO LIGHT IN IT, OR NOTHING BUT LIGHT: every shutter shut
    leaves the room dark, and every one open is no message.
  · ANY WORD IN THE DRAWING. The picture is aria-hidden and its caption says it.
  · A FORM, AN INPUT, A TEXTAREA OR ANYTHING EDITABLE outside the job marker,
    and any script but love.js and quest.js. Nothing up here takes anything.
  · A KEYFRAME, AN ANIMATION OR A TRANSITION in §143. The shutters are held
    mid-word at every setting, MAX GLITTER included: a light that changed with
    them would be a light that flickered.
  · A MISSING MARKER PAIR.
"""
import html
import importlib.util
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data/clacks-tower.json"
ROOM = ROOT / "clacks-tower.html"
NOTES = ROOT / "liner-notes.html"
CSS = ROOT / "love.css"
HEADERS = ROOT / "_headers"
FACES = ROOT / "data/foundry-faces.json"
KS = Path.home() / "Documents/Claude/Projects/Stimpunks Knowledge System"
MIRROR = KS / "site/stimpunks.org"
STARSTUFF = Path.home() / "Documents/GitHub/Star-Stuff"

ENTITY = re.compile(r"&(?:[a-zA-Z][a-zA-Z0-9]{1,31}|#\d{1,6}|#x[0-9a-fA-F]{1,6});")
LINK = re.compile(r"\[([^\]]+)\]\(([^)\s]+)\)")
BOLD = re.compile(r"\*\*([^*]+)\*\*")
EM = re.compile(r"(?<![*\w])\*([^*]+)\*(?![*\w])")
FANS = re.compile(r"fandom\.com|lspace\.org|theturtlemoves\.com|discworld\.fandom|"
                  r"discworld (?:reference )?wiki|l-space wiki", re.I)
# The one line Star Stuff could not check against the book, in any of the forms
# it circulates in. Refused everywhere a reader could meet it.
UNCHECKED = re.compile(r"not dead while|name is still spoken|still spoken", re.I)
SCRIPTS = {"love.js", "quest.js"}

# make-widdershins.py's sweeps, read out of that tool rather than copied, so the
# two rooms over the bridge cannot drift apart on what they refuse. That tool
# runs as a script and writes as it goes, so only its patterns are lifted.
_wds = (ROOT / "tools/make-widdershins.py").read_text()
_ns = {"re": re}
for name in ("NEGATION", "DIAGNOSIS", "RANKING", "PITY"):
    m = re.search(rf"^{name} = \((.*?)\)\n", _wds, re.S | re.M)
    if not m:
        raise SystemExit(f"REFUSING: tools/make-widdershins.py no longer has {name}, which this room's sweep "
                         "reads. Look at what changed there, on purpose.")
    exec(f"{name} = ({m.group(1)})", _ns)
SWEEPS = [
    (_ns["DIAGNOSIS"], "nobody in the book, and not its author, is diagnosed here."),
    (_ns["RANKING"], "nothing up here is put in order."),
    (_ns["PITY"], "nobody here is pitied, an inspiration or cured."),
]
SWEEPS = [(re.compile(rf"\b(?:{p})", re.I),
           re.compile(rf"\b{_ns['NEGATION']}\b[^.]{{0,70}}?\b(?:{p})", re.I), why) for p, why in SWEEPS]

problems = []


def refuse(msg):
    problems.append(msg)


def esc(s):
    return html.escape(str(s), quote=False)


def attr(s):
    return html.escape(str(s), quote=True)


def fold(s):
    return re.sub(r"\s+", " ", str(s)).strip()


def plain(s):
    s = re.sub(r"!\[[^\]]*\]\([^)]*\)", " ", s)
    s = re.sub(r"\[\d+\]\(#[^)]*\)", "", s)
    s = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", s)
    s = s.replace("**", "").replace("*", "")
    s = re.sub(r"^\s*>\s?", "", s, flags=re.M)
    s = re.sub(r"^\s*-\s+", "", s, flags=re.M)
    return fold(s)


def plain_html(s):
    m = re.search(r"<main\b.*?</main>", s, re.S)
    s = m.group(0) if m else s
    s = re.sub(r"<(script|style|svg)\b.*?</\1>", " ", s, flags=re.S)
    s = re.sub(r"<[^>]+>", "", s)
    return fold(html.unescape(s))


def sweep(text, where):
    text = str(text)
    for rx, ok, why in SWEEPS:
        for m in rx.finditer(text):
            window = text[max(0, m.start() - 80):m.end()]
            if ok.search(window):
                continue
            refuse(f"{where}: {m.group(0)!r} -- {why}")
    if UNCHECKED.search(text):
        refuse(f"{where}: carries the line Star Stuff never checked against the novel. Say what it is about, "
               "in our words, until somebody reads it in the book and gives the page.")


def ours(text, where):
    text = str(text)
    if ENTITY.search(text):
        refuse(f"{where}: carries an HTML entity. Everything is escaped on the way in; write the character.")
    for _, url in LINK.findall(text):
        if not (url.startswith("https://") or re.match(r"^[a-z0-9-]+\.html(?:#[\w/=-]*)?$", url)):
            refuse(f"{where}: {url!r} is neither an https address nor a page of ours.")
    if FANS.search(text):
        refuse(f"{where}: links or names a fan wiki or fan site. Nothing here is drawn from one.")
    sweep(EM.sub(r"\1", BOLD.sub(r"\1", LINK.sub(r"\1", text))), where)


def linked(text):
    out = BOLD.sub(r"<b>\1</b>", esc(text))
    out = EM.sub(r"<em>\1</em>", out)
    return LINK.sub(lambda m: f'<a href="{attr(html.unescape(m.group(2)))}">{m.group(1)}</a>', out)


# ── The data ─────────────────────────────────────────────────────────────────
d = json.loads(DATA.read_text())
pages = d.get("pages") or {}
quotes = d.get("quotes") or {}
sections = d.get("sections") or {}
cap = int(d.get("words") or 0)
if not cap:
    refuse("data/clacks-tower.json has no `words` cap, and the room prints one.")

for key, v in d.items():
    if not key.startswith("_") and UNCHECKED.search(json.dumps(v, ensure_ascii=False)):
        refuse(f"data: `{key}` carries the line Star Stuff never checked against the novel.")

have = {"mirror": MIRROR.is_dir(), "starstuff": STARSTUFF.is_dir()}
texts = {}
for key, pg in pages.items():
    kind = pg.get("from")
    for need in ("title", "url", "file"):
        if not str(pg.get(need, "")).strip():
            refuse(f"pages.{key}: no {need}.")
    url = str(pg.get("url", ""))
    if kind == "mirror":
        if not url.startswith("https://stimpunks.org/") or not url.endswith("/"):
            refuse(f"pages.{key}: {url!r} is not one of our pages on stimpunks.org, with its trailing slash.")
    elif kind == "starstuff":
        if not url.startswith("https://starstuff.earth/"):
            refuse(f"pages.{key}: {url!r} is not on starstuff.earth.")
    else:
        refuse(f"pages.{key}: `from` is {kind!r}; it is mirror or starstuff.")
        continue
    if not have.get(kind):
        continue
    if kind == "mirror":
        f = MIRROR / pg["file"]
        if not f.is_file():
            refuse(f"pages.{key}: the mirror has no {pg['file']}.")
            continue
        raw = f.read_text()
        m = re.search(r'^url:\s*"([^"]+)"', raw, re.M)
        if not m or m.group(1) != url:
            refuse(f"pages.{key}: {pg['file']} in the mirror is {m.group(1) if m else 'no page'}, not {url}.")
        texts[key] = plain(raw.split("\n---", 1)[-1])
    else:
        f = STARSTUFF / pg["file"]
        if not f.is_file():
            refuse(f"pages.{key}: Star Stuff's repository has no {pg['file']}.")
            continue
        raw = f.read_text()
        texts[key] = plain_html(raw) if f.suffix == ".html" else plain(raw.split("\n---", 1)[-1])
    for w in pg.get("holds") or []:
        if key in texts and fold(w) not in texts[key]:
            refuse(f"pages.{key}: {url} no longer says {w!r}, and this room says so on its behalf.")

for qid, q in quotes.items():
    where = f"quote {qid}"
    text = str(q.get("text", ""))
    n = len(text.split())
    if not n:
        refuse(f"{where}: no text.")
    if n > cap:
        refuse(f"{where}: {n} words against a cap of {cap}. Raise it in the data on purpose, with the reason, "
               "or quote less.")
    if not str(q.get("who", "")).strip():
        refuse(f"{where}: no `who`. Every line here names who said it.")
    src = pages.get(q.get("read_on"))
    if not src:
        refuse(f"{where}: `read_on` is not one of `pages`. Nothing here is quoted from memory, and no line of "
               "the book is quoted at all.")
        continue
    if q.get("who") == "Star Stuff" and src.get("from") != "starstuff":
        refuse(f"{where}: Star Stuff's words read somewhere that is not Star Stuff.")
    if q.get("who") == "Stimpunks" and src.get("from") != "mirror":
        refuse(f"{where}: our words read somewhere that is not our own page.")
    if q.get("who") not in ("Star Stuff", "Stimpunks"):
        refuse(f"{where}: somebody else's words. This room quotes Star Stuff and our own pages and nobody else; "
               "a line of the book goes in only when somebody has read it in the book.")
    for field, v in q.items():
        if ENTITY.search(str(v)):
            refuse(f"{where}: {field} carries an HTML entity.")
        if FANS.search(str(v)):
            refuse(f"{where}: {field} points at a fan wiki or fan site.")
    if UNCHECKED.search(text):
        refuse(f"{where}: is the line Star Stuff never checked against the novel.")
    key = q["read_on"]
    if key in texts and fold(EM.sub(r"\1", text)) not in texts[key]:
        refuse(f"{where}: not on {src['url']} word for word. Re-copy it from there; never loosen the check.")

used = set()
for name, blocks in [("lede", d.get("lede") or [])] + list(sections.items()):
    if not blocks:
        refuse(f"{name}: empty.")
    for j, b in enumerate(blocks, 1):
        where = f"{name} block {j}"
        if "q" in b:
            if b["q"] not in quotes:
                refuse(f"{where}: quotes {b['q']!r}, which is not in `quotes`.")
            used.add(b["q"])
        elif "p" in b:
            ours(b["p"], where)
        else:
            refuse(f"{where}: a block is a q or a p, and this is neither.")
for qid in quotes:
    if qid not in used:
        refuse(f"quote {qid}: in the data and on no section, so its credit would claim a line the room does not print.")

for i, r in enumerate(d.get("not_here") or [], 1):
    for need in ("name", "line"):
        if not str(r.get(need, "")).strip():
            refuse(f"not_here {i}: no {need}.")
    ours(r.get("line", ""), f"not_here {i}")

for i, e in enumerate(d.get("elsewhere") or [], 1):
    where = f"elsewhere {i} ({e.get('page')})"
    p = ROOT / str(e.get("page", ""))
    if not p.is_file():
        refuse(f"{where}: no such page.")
        continue
    ours(e.get("line", ""), where)
    main = re.search(r"<main\b.*?</main>", p.read_text(), re.S)
    text = fold(html.unescape(re.sub(r"<[^>]+>", " ", main.group(0) if main else ""))).lower()
    for w in e.get("holds") or []:
        if fold(w).lower() not in text:
            refuse(f"{where}: that room no longer says {w!r}, and this room says it on its behalf.")
    if not e.get("holds"):
        refuse(f"{where}: no holds. A line about another room has to name the words there that carry it.")
if not any(e.get("page") == "widdershins.html" for e in d.get("elsewhere") or []):
    refuse("elsewhere: no way back over the bridge to Widdershins, the room this one is behind.")

if "X-Clacks-Overhead: GNU Terry Pratchett" not in HEADERS.read_text():
    refuse("_headers no longer sends X-Clacks-Overhead: GNU Terry Pratchett, and the room says this street sends it.")

if problems:
    raise SystemExit("REFUSING to build The Clacks Tower:\n  " + "\n  ".join(problems))


# ── The cabin ────────────────────────────────────────────────────────────────
# A plain perspective camera standing in the hatch, looking at the shutter wall.
# The cabin is 6 wide and 3.2 high, the wall at z = 0 and the camera at z = 5.2,
# eye 1.9 above the boards, standing at the top of the ladder. The sun is high behind the wall and a little to the
# left of it, so a ray through an opening drops `1 / RISE` for every unit it
# comes into the cabin and drifts `DRIFT` to the right.
W, H = 1200, 560
CX, HY, FOCAL, CAM, EYE = 600, 170, 620, 5.2, 1.9
RISE, DRIFT = 1.6, 0.32
COLS = ((-2.1, -0.9), (-0.6, 0.6), (0.9, 2.1))
ROWS = ((0.95, 1.55), (1.7, 2.3), (2.45, 3.05))           # bottom to top
# The pattern the shutters stand in, top row first. Ours, and no letter of the
# book's code, which we do not know. The middle one is open, so the next tower
# shows through it.
PATTERN = ("101", "010", "110")


def proj(x, y, z):
    depth = CAM - z
    return CX + FOCAL * x / depth, HY - FOCAL * (y - EYE) / depth


def n(v):
    return f"{v:.1f}".rstrip("0").rstrip(".")


def poly(pts):
    return " ".join(f"{n(a)},{n(b)}" for a, b in pts)


def quad3(pts):
    return poly([proj(*p) for p in pts])


opened = [(c, r) for r, row in enumerate(reversed(PATTERN)) for c, ch in enumerate(row) if ch == "1"]
if not opened:
    raise SystemExit("REFUSING: every shutter is shut, so no light comes into the room at all.")
if len(opened) == len(COLS) * len(ROWS):
    raise SystemExit("REFUSING: every shutter is open, which is no message.")
if (1, 1) not in opened:
    raise SystemExit("REFUSING: the middle shutter is shut, and the caption says the next tower shows through it.")


def onfloor(x, y):
    """Where the sun through (x, y) on the wall lands on the floor."""
    z = y / RISE
    return (x + DRIFT * z, 0, z)


out = []
# THE DAY OUTSIDE, only ever seen through an opening: the sky, the next hill,
# and the next tower on it with its own shutter box.
wl, wt = proj(-3, 3.2, 0)
wr, wb = proj(3, 0, 0)
out.append(f'<rect x="{n(wl)}" y="{n(wt)}" width="{n(wr - wl)}" height="{n(wb - wt)}" fill="var(--clk-sky)"/>')
out.append(f'<path d="M{n(wl)} {HY + 12} C 470 {HY - 2} 540 {HY - 9} 600 {HY - 8} C 670 {HY - 7} 740 {HY + 4} '
           f'{n(wr)} {HY + 10} V{n(wb)} H{n(wl)} Z" fill="var(--clk-hill)"/>')
t = HY - 8
out.append(f'<path d="M604 {t} L606 {t - 26} H610 L612 {t} Z" fill="var(--clk-far)"/>'
           f'<rect x="598" y="{t - 38}" width="20" height="12" fill="var(--clk-far)"/>'
           f'<path d="M601 {t - 34.5} H605 M608 {t - 34.5} H612 M601 {t - 30.5} H605 M612 {t - 30.5} H615" '
           'stroke="var(--clk-sky)" stroke-width="1.6"/>')
# THE WALL OF SHUTTERS, planked, with the openings cut out of it.
holes = []
for c, (x0, x1) in enumerate(COLS):
    for r, (y0, y1) in enumerate(ROWS):
        holes.append((c, r, x0, x1, y0, y1))
wall = f"M{quad3([(-3, 0, 0), (3, 0, 0), (3, 3.2, 0), (-3, 3.2, 0)]).replace(' ', ' L')} Z"
for c, r, x0, x1, y0, y1 in holes:
    wall += f" M{quad3([(x0, y0, 0), (x0, y1, 0), (x1, y1, 0), (x1, y0, 0)]).replace(' ', ' L')} Z"
out.append(f'<defs><clipPath id="clk-wall"><path d="{wall}" clip-rule="evenodd"/></clipPath></defs>')
out.append(f'<path d="{wall}" fill="var(--clk-board)" fill-rule="evenodd"/>')
planks = []
for k in range(1, 12):
    x = -3 + k * 0.5
    a, b = proj(x, 0, 0), proj(x, 3.2, 0)
    planks.append(f'<path d="M{n(a[0])} {n(a[1])} V{n(b[1])}" stroke="var(--clk-grain)" stroke-width="1"/>')
out.append(f'<g clip-path="url(#clk-wall)">{"".join(planks)}</g>')
# Each opening: shut, its shutter tarred flat across it with its boards; or
# open, the shutter turned edge-on across the middle, so the day comes through.
for c, r, x0, x1, y0, y1 in holes:
    (ax, ay), (bx, by) = proj(x0, y1, 0), proj(x1, y0, 0)
    frame = f'<rect x="{n(ax)}" y="{n(ay)}" width="{n(bx - ax)}" height="{n(by - ay)}" fill="none" ' \
            f'stroke="var(--clk-frame)" stroke-width="5"/>'
    if (c, r) in opened:
        my = (ay + by) / 2
        out.append(f'<rect x="{n(ax)}" y="{n(my - 2.5)}" width="{n(bx - ax)}" height="5" fill="var(--clk-tar)"/>')
    else:
        out.append(f'<rect x="{n(ax)}" y="{n(ay)}" width="{n(bx - ax)}" height="{n(by - ay)}" fill="var(--clk-tar)"/>')
        for k in range(1, 4):
            yy = ay + (by - ay) * k / 4
            out.append(f'<path d="M{n(ax + 3)} {n(yy)} H{n(bx - 3)}" stroke="var(--clk-grain)" stroke-width="1.2"/>')
    out.append(frame)
# THE CEILING, THE SIDE WALLS AND THE FLOOR, all in shade, and the beams.
near = 4.6
out.append(f'<polygon points="{quad3([(-3, 3.2, 0), (3, 3.2, 0), (3, 3.2, near), (-3, 3.2, near)])}" fill="var(--clk-tar)"/>')
for z in (1.2, 2.6, 4.0):
    out.append(f'<polygon points="{quad3([(-3, 3.2, z), (3, 3.2, z), (3, 2.95, z), (-3, 2.95, z)])}" '
               f'fill="var(--clk-frame)"/>')
for side in (-3, 3):
    out.append(f'<polygon points="{quad3([(side, 0, 0), (side, 3.2, 0), (side, 3.2, near), (side, 0, near)])}" '
               f'fill="var(--clk-shade)"/>')
    for y in (0.8, 1.6, 2.4):
        a, b = proj(side, y, 0), proj(side, y, near)
        out.append(f'<path d="M{n(a[0])} {n(a[1])} L{n(b[0])} {n(b[1])}" stroke="var(--clk-grain)" stroke-width="1"/>')
out.append(f'<polygon points="{quad3([(-3, 0, 0), (3, 0, 0), (3, 0, near), (-3, 0, near)])}" fill="var(--clk-board)"/>')
for k in range(0, 13):
    x = -3 + k * 0.5
    a, b = proj(x, 0, 0), proj(x, 0, near)
    out.append(f'<path d="M{n(a[0])} {n(a[1])} L{n(b[0])} {n(b[1])}" stroke="var(--clk-grain)" stroke-width="1"/>')
# THE LIGHT: each open shutter's square of sun on the boards. Hard-edged,
# because it is noon and the sun is a long way off, and the only light here.
for c, r in opened:
    x0, x1 = COLS[c]
    y0, y1 = ROWS[r]
    pts = [onfloor(x0, y0), onfloor(x1, y0), onfloor(x1, y1), onfloor(x0, y1)]
    out.append(f'<polygon points="{quad3(pts)}" fill="var(--clk-day)"/>')
# THE LEVER BANK under the shutters: a bench, and one lever for each shutter,
# leaning towards you for an open one and away for a shut one.
out.append(f'<polygon points="{quad3([(-2.4, 0.35, 0), (2.4, 0.35, 0), (2.4, 0.35, 0.25), (-2.4, 0.35, 0.25)])}" '
           f'fill="var(--clk-frame)"/>')
out.append(f'<polygon points="{quad3([(-2.4, 0, 0.25), (2.4, 0, 0.25), (2.4, 0.35, 0.25), (-2.4, 0.35, 0.25)])}" '
           f'fill="var(--clk-shade)" stroke="var(--clk-grain)" stroke-width="1"/>')
for c in range(len(COLS)):
    for r in range(len(ROWS)):
        x = -2.1 + (c * len(ROWS) + r) * 0.525
        lean = 0.16 if (c, r) in opened else -0.1
        a, b = proj(x, 0.35, 0.12), proj(x, 0.8, 0.12 + lean)
        out.append(f'<path d="M{n(a[0])} {n(a[1])} L{n(b[0])} {n(b[1])}" stroke="var(--clk-timber-2)" '
                   f'stroke-width="2.6" stroke-linecap="round"/><circle cx="{n(b[0])}" cy="{n(b[1])}" r="3.4" '
                   f'fill="var(--clk-timber-2)"/>')
# THE HATCH YOU CAME UP THROUGH, with the ladder's rails.
out.append(f'<polygon points="{quad3([(-2.7, 0, 2.0), (-1.6, 0, 2.0), (-1.6, 0, 2.55), (-2.7, 0, 2.55)])}" '
           f'fill="var(--clk-tar)" stroke="var(--clk-frame)" stroke-width="2"/>')
for x in (-2.45, -1.85):
    a, b = proj(x, 0, 2.1), proj(x, 0.55, 2.1)
    out.append(f'<path d="M{n(a[0])} {n(a[1])} L{n(b[0])} {n(b[1])}" stroke="var(--clk-frame)" stroke-width="5" '
               'stroke-linecap="round"/>')
view = (f'  <svg class="clk-cabin" viewBox="0 0 {W} {H}" aria-hidden="true" focusable="false">'
        + "".join(out) + "</svg>")
if "<text" in view:
    raise SystemExit("REFUSING: a word in the cabin's drawing. The picture is aria-hidden; its caption says it.")


# ── Writing ──────────────────────────────────────────────────────────────────

def swap(page, marker, block, indent="  "):
    src = page.read_text()
    begin, end = f"<!-- {marker}:begin -->", f"<!-- {marker}:end -->"
    if begin not in src or end not in src:
        raise SystemExit(
            f"REFUSING: {page.name} has no {marker} markers, so there is nowhere to write.\n"
            "Put them back rather than letting this tool go quiet -- a generator that\n"
            "writes nothing and exits 0 is how two surfaces drift apart.")
    page.write_text(re.sub(re.escape(begin) + r".*?" + re.escape(end),
                           lambda _m: begin + "\n" + block + "\n" + indent + end, src, flags=re.S))


def source(q):
    pg = pages[q["read_on"]]
    link = f'<a href="{attr(pg["url"])}">{esc(pg["title"])}</a>'
    if q["who"] == "Stimpunks":
        return f"Stimpunks, our {link} page"
    return f"Star Stuff, {link}, No. 49"


def quote(qid, indent):
    q = quotes[qid]
    return (f'{indent}<blockquote class="clk-quote">\n'
            f'{indent}  <p>{linked(q["text"])}</p>\n'
            f'{indent}  <footer class="clk-quote__who">{source(q)}</footer>\n'
            f'{indent}</blockquote>')


def blocks(bs, indent):
    out = []
    for b in bs:
        if "q" in b:
            out.append(quote(b["q"], indent))
        else:
            out.append(f'{indent}<p>{linked(b["p"])}</p>')
    return "\n".join(out)


swap(ROOM, "clk:view", view)
swap(ROOM, "clk:lede", blocks(d["lede"], "    "), "    ")
for name, bs in sections.items():
    swap(ROOM, f"clk:{name}", blocks(bs, "      "), "      ")

rules = [f'      <li class="clk-square"><strong>{esc(r["name"])}</strong> {linked(r["line"])}</li>'
         for r in d["not_here"]]
swap(ROOM, "clk:rules", '    <ul class="clk-rules">\n' + "\n".join(rules) + "\n    </ul>", "    ")

nexts = [f'      <li><a href="{attr(e["page"])}">{esc(e["name"])}</a>, {linked(e["line"])}</li>'
         for e in d["elsewhere"]]
swap(ROOM, "clk:elsewhere", '    <ul class="clk-next">\n' + "\n".join(nexts) + "\n    </ul>", "    ")

faces = json.loads(FACES.read_text())["faces"]
display, text_face = faces["allerta-stencil"], faces["signika"]
licence = lambda f: f["licence"].replace(" 1.1", "")
atom = pages["atom"]
credits = [
    "      <li><strong>The Discworld is Terry Pratchett&rsquo;s</strong>, and the clacks, the Grand Trunk, the "
    "Overhead and John Dearheart are from his <cite>Going Postal</cite> (2004). No line of the book is quoted here. "
    "His estate has no involvement in this room, was not asked, and has not seen it. Discworld is a trade mark, and "
    "nothing here is offered as anything of theirs.</li>",
    "      <li><strong>The header is a fan convention</strong>, started by readers in March 2015, and not his "
    "instruction or his estate&rsquo;s, as Star Stuff says in as many words. This street sends it from its "
    "<code>_headers</code> file.</li>",
    "      <li><strong>The tower is ours</strong>, a timber cabin with a grid of shutters anybody might draw, made as "
    "code by Claude, an AI model made by Anthropic, to Ryan&rsquo;s brief. Its pattern spells no letter of the "
    "book&rsquo;s code, nobody is in it, and nothing on this page calls an AI while you read it.</li>",
    f'      <li><strong>Most of the quoted words are Star Stuff&rsquo;s</strong>, from <a href="{attr(atom["url"])}">'
    "No. 49, One Atom of Justice</a>, by Stimpunks and Helen Edgar&rsquo;s More Realms, under CC BY-SA 4.0 like "
    "this street, and one line is from our own Luddite Sensibilities page. The words around them are ours, "
    "written for this room, and nothing about the Disc was taken from a fan wiki.</li>",
    f"      <li>Every quotation in this room is {cap} words or fewer, was read on {esc(d['read'])} on the page it "
    "names, and <code>tools/make-clacks-tower.py</code> checks each word for word against Star Stuff&rsquo;s own "
    "repository and our copy of stimpunks.org, whenever they are on the machine.</li>",
    f"      <li>The type is {esc(display['family'])}, by {esc(display['designer'])}, a stencil, for the "
    f"room&rsquo;s name and headings, under the {esc(licence(display))}, and {esc(text_face['family'])}, by "
    f"{esc(text_face['designer'])}, drawn for signs, for everything you read, under the "
    f"{esc(licence(text_face))}, both read off their own records. More in "
    '<a href="liner-notes.html#clacks-tower">the liner notes</a>.</li>',
]
swap(ROOM, "clk:credits", '    <ul class="clk-credits">\n' + "\n".join(credits) + "\n    </ul>", "    ")

notes = []
for qid, q in quotes.items():
    pg = pages[q["read_on"]]
    words = EM.sub(r"\1", q["text"])
    notes.append(f'      <tr><td>{esc(words)}</td><td>{esc(q["who"])}</td>'
                 f'<td><a href="{attr(pg["url"])}">{esc(pg["title"])}</a></td>'
                 f'<td>{len(q["text"].split())} words</td></tr>')
swap(NOTES, "clacks-tower-credits", "\n".join(notes), "      ")

# ── The published page, checked ──────────────────────────────────────────────
src = ROOM.read_text()
body = re.sub(r"<!-- quest:.*?:end -->", " ", src, flags=re.S)
body = re.sub(r"<!--.*?-->", " ", body, flags=re.S)

for tag in re.findall(r"<(form|input|textarea|select)\b", body, re.I):
    refuse(f"{ROOM.name}: a <{tag}> outside the job marker. Nothing up here takes anything from you.")
if re.search(r"contenteditable", body, re.I):
    refuse(f"{ROOM.name}: something editable outside the job marker.")
if re.search(r"<img\b", body, re.I):
    refuse(f"{ROOM.name}: an <img>. No cover, crest, crew or character of the book's; the tower is drawn here.")
if FANS.search(body):
    refuse(f"{ROOM.name}: links or names a fan wiki or fan site.")
for s in re.findall(r'<script\b[^>]*\bsrc="([^"]+)"', src):
    if s not in SCRIPTS:
        refuse(f"{ROOM.name}: loads {s}, and the room runs {', '.join(sorted(SCRIPTS))} and nothing else.")
if 'href="widdershins.html"' not in src:
    refuse(f"{ROOM.name}: no way back over the bridge to Widdershins.")

sec = re.search(r"/\* §143 ── ROOM: The Clacks Tower.*?(?=/\* §14[4-9] |/\* §1[5-9]\d )", CSS.read_text(), re.S)
if not sec:
    refuse("love.css has no §143 for The Clacks Tower before the next section.")
elif re.search(r"@keyframes|\banimation\s*:|\btransition\s*:", re.sub(r"/\*.*?\*/", " ", sec.group(0), flags=re.S)):
    refuse("love.css §143: a keyframe, an animation or a transition. The shutters are held mid-word at every setting.")

text = re.sub(r"<(script|style)\b.*?</\1>", " ", body, flags=re.S)
text = re.sub(r"<blockquote\b.*?</blockquote>", " ", text, flags=re.S)
text = re.sub(r"<svg\b.*?</svg>", " ", text, flags=re.S)
text = re.sub(r"<head\b.*?</head>", " ", text, flags=re.S)
text = html.unescape(fold(re.sub(r"<[^>]+>", " ", text)))
sweep(text, ROOM.name)
if UNCHECKED.search(html.unescape(body)):
    refuse(f"{ROOM.name}: carries the line Star Stuff never checked against the novel.")
if problems:
    raise SystemExit("REFUSING, on the published page:\n  " + "\n  ".join(problems))

checked = [k for k, v in have.items() if v]
print(f"clacks tower: a cabin lit by the message going out, {len(opened)} squares of sun on the floor, "
      f"{len(quotes)} quotations in {ROOM.name}")
print("  quotations checked word for word against " + (", ".join(checked) if checked else "nothing on this machine"))
print("  no line of the book quoted, nobody drawn, nothing logged")
