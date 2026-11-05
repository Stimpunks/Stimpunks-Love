#!/usr/bin/env python3
"""Build The Golem Trust: its hall, its sections, what is not in it and its credits, from data/golem-trust.json.

ONE DATA FILE, ONE TOOL, TWO SURFACES, the contract make-yells.py set. The room
is behind Widdershins, in the city over the bridge (Ryan's brief, 2026-11-04:
subrooms of Widdershins inspired by places in the Discworld novels). It stands
on one clause Star Stuff already wrote in No. 49, One Atom of Justice, spread
6: the golems who are property. The trust is after the Golem Trust in Going
Postal (2004), and golems in Feet of Clay (1996) do not speak and write what
they say on slates. This tool writes, between gtr:<part> markers in
golem-trust.html:

  · THE HALL (gtr:view): a long dark hall with three tall windows in its back
    wall, every pane of them clay pressed thin enough for the day to come
    through, pale where it is thinnest and darker where a thumb pressed
    harder; drawers between the windows; a long table with slates on it; and
    golems standing against the windows in their own outlines, one holding a
    slate up. Nobody's character, no face, no word.
  · EVERY SECTION (gtr:lede, gtr:property, gtr:slate, gtr:owned), block by
    block, the quotations among them and two of them set on a slate.
  · WHAT IS NOT IN THIS HALL (gtr:not-here) and THE CREDITS (gtr:credits), with
    a table of the quotations in liner-notes.html (golem-trust-credits).

THE LIGHT COMES THROUGH CLAY, AND THAT IS THE ROOM. A pane of fired clay thin
enough to let the day through is brighter where it is thinner, so the light
carries the marks of whoever pressed it. Everything in the hall stands in
front of it as an outline; nothing has a lit side. The page's ground is that
lit clay, every word on it is slate, and the two lines set on a slate are
chalk on slate in a frame of fired clay.

WHAT IT REFUSES, and the first four are the room:

  · A DIAGNOSIS. No golem, and not their author, is called autistic, ADHD,
    neurodivergent, nonspeaking or anything else in our words. A slate is
    recognised as a way of talking our community knows; nobody who uses it is
    labelled. Swept with the negation window, so the room can say it will not.
  · A SLATE AS A LESSER VOICE. Mute, dumb, voiceless, non-verbal, "cannot
    talk", "has no voice": the vocabulary that makes writing on a slate a
    lack. Swept with the negation window.
  · PITY, INSPIRATION, THE CURE AND A RANKING, as Widdershins refuses them;
    and A PRICE: nothing in the hall is bought or sold, and nobody is owned.
  · A GOLEM FROM THE BOOKS BY NAME, a fan wiki or fan site, and any <img>: the
    golems in the window are anybody's golems, clay and nobody's character.
  · A QUOTATION over the cap in the data, with no author, with no link for a
    work, carrying an HTML entity, or read off anything but a page in `pages`;
    AND, WHERE THE COPY IT WAS READ ON IS ON THE MACHINE, ONE THAT IS NOT THERE
    WORD FOR WORD: the Knowledge System mirror for stimpunks.org and Star
    Stuff's own repository for starstuff.earth. No line of a Discworld book is
    quoted at all: `who` may not be Terry Pratchett.
  · A FORM, AN INPUT, A TEXTAREA OR ANYTHING EDITABLE outside the job marker,
    and any script but love.js and quest.js.
  · A KEYFRAME, AN ANIMATION OR A TRANSITION in §144. The day through the clay
    is the same at every setting.
  · A MISSING MARKER PAIR.
"""
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data/golem-trust.json"
ROOM = ROOT / "golem-trust.html"
NOTES = ROOT / "liner-notes.html"
CSS = ROOT / "love.css"
KS = Path.home() / "Documents/Claude/Projects/Stimpunks Knowledge System"
MIRROR = KS / "site/stimpunks.org"
STARSTUFF = Path.home() / "Documents/GitHub/Star-Stuff"

ENTITY = re.compile(r"&(?:[a-zA-Z][a-zA-Z0-9]{1,31}|#\d{1,6}|#x[0-9a-fA-F]{1,6});")
LINK = re.compile(r"\[([^\]]+)\]\(([^)\s]+)\)")
BOLD = re.compile(r"\*\*([^*]+)\*\*")
EM = re.compile(r"(?<![*\w])\*([^*]+)\*(?![*\w])")
CODE = re.compile(r"`([^`]+)`")

NEGATION = (r"(?:no|not|nothing|never|neither|none|without|refuses?|refused|refusing|"
            r"cannot|does not|do not|won't|will not|is not|are not|isn't|aren't|nobody|nor|declin\w+)")

DIAGNOSIS = (r"diagnos\w*|undiagnosed|(?:is|was|were|are|being)\s+(?:clearly\s+|obviously\s+|probably\s+|"
             r"definitely\s+|surely\s+)?(?:autistic|adhd|neurodivergent|dyslexic|dyspraxic|nonspeaking|"
             r"non-speaking|on the spectrum)|has (?:adhd|autism|asperger\w*)|asperger\w*")
LESSER = r"mute|dumb|voiceless|non-?verbal|(?:can't|cannot|can not) (?:talk|speak)|has no voice|have no voice"
RANKING = (r"best (?:book|books|character|characters|of the)|greatest|favourite|favorite|"
           r"top (?:ten|five|\d+)|ranked|ranking|must[- ]reads?|the definitive")
PITY = (r"suffer\w*|brave\w*|courag\w+|inspir(?:ing|ational|ation to)|overcom\w+|"
        r"battl\w+ (?:with|against)|cur(?:e|ed|es|ing)\b|fix(?:ed|es|ing)?\b|wheelchair[- ]bound")
PRICE = r"for sale|on sale|\bprices?\b|\bpriced\b|bought|\bbuy\w*|\bsells?\b|\bsold\b|\$\s?\d"

SWEEPS = [
    (DIAGNOSIS, "no golem, and not their author, is diagnosed here. See _ours."),
    (LESSER, "a slate is a voice, not the lack of one. See sections.slate."),
    (RANKING, "nothing in this room is put in order."),
    (PITY, "nobody here is pitied, an inspiration or cured. See not_here."),
    (PRICE, "nothing in the hall is bought or sold, and nobody is owned. See not_here."),
]
SWEEPS = [(re.compile(rf"\b(?:{p})", re.I),
           re.compile(rf"\b{NEGATION}\b[^.]{{0,70}}?(?:{p})", re.I), why) for p, why in SWEEPS]

FANS = re.compile(r"fandom\.com|lspace\.org|theturtlemoves\.com|discworld\.fandom", re.I)
# The golems the books name. A name is somebody's character, and this hall
# draws and names nobody's: the figures against the windows are anybody's.
NAMED = re.compile(r"\b(?:Dorfl|Pump|Anghammarad|Gladys|Meshugah|Dorfl's)\b")
SCRIPTS = {"love.js", "quest.js"}

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
    """Words only, for comparing a quotation with what it was read on."""
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
    if NAMED.search(text):
        refuse(f"{where}: names a golem from the books ({NAMED.search(text).group(0)}). Nobody's character is here.")


def ours(text, where):
    text = str(text)
    if ENTITY.search(text):
        refuse(f"{where}: carries an HTML entity. Everything is escaped on the way in; write the character.")
    for _, url in LINK.findall(text):
        if not (url.startswith("https://") or re.match(r"^[a-z0-9-]+\.html(?:#[\w/=-]*)?$", url)):
            refuse(f"{where}: {url!r} is neither an https address nor a page of ours.")
        if FANS.search(url):
            refuse(f"{where}: links a fan wiki or fan site. Nothing here is drawn from one.")
    sweep(CODE.sub(r"\1", EM.sub(r"\1", BOLD.sub(r"\1", LINK.sub(r"\1", text)))), where)


def linked(text):
    """Escape, then `code`, **bold**, *emphasis* and [words](address)."""
    out = CODE.sub(r"<code>\1</code>", esc(text))
    out = BOLD.sub(r"<b>\1</b>", out)
    out = EM.sub(r"<em>\1</em>", out)
    return LINK.sub(lambda m: f'<a href="{attr(html.unescape(m.group(2)))}">{m.group(1)}</a>', out)


def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


# ── The data ─────────────────────────────────────────────────────────────────
d = json.loads(DATA.read_text())
pages = d.get("pages") or {}
quotes = d.get("quotes") or {}
sections = d.get("sections") or {}
cap = int(d.get("words") or 0)
if not cap:
    refuse("data/golem-trust.json has no `words` cap, and the room prints one.")

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
            refuse(f"pages.{key}: {url} no longer says {w!r}, and this room stands on it.")

for qid, q in quotes.items():
    where = f"quote {qid}"
    text = str(q.get("text", ""))
    n = len(text.split())
    if not n:
        refuse(f"{where}: no text.")
    if n > cap:
        refuse(f"{where}: {n} words against a cap of {cap}. Raise it in the data on purpose, with the reason, "
               "or quote less.")
    who = str(q.get("who", "")).strip()
    if not who:
        refuse(f"{where}: no `who`. Every line here names who said it.")
    if re.search(r"pratchett", who, re.I):
        refuse(f"{where}: a line of Terry Pratchett's. This room quotes no Discworld book; say it in our words.")
    if not str(q.get("work", "")).strip() or not str(q.get("url", "")).startswith("https://"):
        refuse(f"{where}: no work, or no link to it. Do not fill it from memory.")
    src = pages.get(q.get("read_on"))
    if not src:
        refuse(f"{where}: `read_on` is not one of `pages`.")
        continue
    if who == "Star Stuff" and src.get("from") != "starstuff":
        refuse(f"{where}: Star Stuff's words read somewhere that is not Star Stuff.")
    for field, v in q.items():
        if ENTITY.search(str(v)):
            refuse(f"{where}: {field} carries an HTML entity.")
        if FANS.search(str(v)):
            refuse(f"{where}: {field} points at a fan wiki or fan site.")
    key = q["read_on"]
    if key in texts and fold(text) not in texts[key]:
        refuse(f"{where}: not on {src['url']} word for word. Re-copy it from there; never loosen the check.")

used = set()
for name, blocks in sections.items():
    for j, b in enumerate(blocks, 1):
        where = f"sections.{name} block {j}"
        if "q" in b or "slate" in b:
            qid = b.get("q") or b.get("slate")
            if qid not in quotes:
                refuse(f"{where}: quotes {qid!r}, which is not in `quotes`.")
            used.add(qid)
        elif "p" in b:
            ours(b["p"], where)
        elif "h2" in b:
            ours(b["h2"], where)
        else:
            refuse(f"{where}: a block is a p, an h2, a q or a slate, and this is none.")
for qid in quotes:
    if qid not in used:
        refuse(f"quote {qid}: in the data and on no section, so its credit would claim a line the room does not print.")
for i, line in enumerate(d.get("not_here") or [], 1):
    ours(line, f"not_here {i}")
if not d.get("not_here"):
    refuse("not_here: empty. The room says what it refuses.")
for i, line in enumerate(d.get("credits") or [], 1):
    ours(line, f"credits {i}")
credit_text = " ".join(d.get("credits") or [])
for need in ("Terry Pratchett", "Feet of Clay", "Going Postal", "trade mark", "CC BY-SA 4.0", "Star Stuff"):
    if need not in credit_text:
        refuse(f"credits: never says {need!r}. Discworld is credited, and Star Stuff's words carry their licence.")
if f"{cap} words or fewer" not in credit_text:
    refuse(f"credits: does not print the cap, {cap} words or fewer.")

if problems:
    raise SystemExit("REFUSING:\n  " + "\n  ".join(problems))


# ── The hall ─────────────────────────────────────────────────────────────────
# Drawn in §2's --gtr-* inks and nothing else. 1200 by 420, the shape the share
# card lifts. Every pane is clay lit from behind: --gtr-pane where it is thin,
# --gtr-thick where a thumb pressed and where a line was pressed into it.

def seeded(n):
    state = [n & 0xFFFFFFFF]

    def r():
        state[0] = (state[0] * 1664525 + 1013904223) & 0xFFFFFFFF
        return state[0] / 4294967296
    return r


def num(v):
    return f"{v:.1f}".rstrip("0").rstrip(".")


WINDOWS = (110, 500, 890)
WW, TOP, SILL = 200, 40, 300
FLOOR = 318


def window(x0, r):
    out = [f'<path d="M{x0 - 10} {SILL + 8} V{TOP + 92} A{WW / 2 + 10} {WW / 2 + 10} 0 0 1 {x0 + WW + 10} '
           f'{TOP + 92} V{SILL + 8} Z" fill="var(--gtr-frame)"/>']
    clip = f"gtr-win-{x0}"
    out.append(f'<clipPath id="{clip}"><path d="M{x0} {SILL} V{TOP + 100} A{WW / 2} {WW / 2} 0 0 1 '
               f'{x0 + WW} {TOP + 100} V{SILL} Z"/></clipPath>')
    g = [f'<g clip-path="url(#{clip})">']
    cols, rows, gap = 3, 5, 6
    pw = (WW - gap * (cols - 1)) / cols
    ph = (SILL - TOP - gap * (rows - 1)) / rows
    for c in range(cols):
        for rr in range(rows):
            px, py = x0 + c * (pw + gap), TOP + rr * (ph + gap)
            g.append(f'<rect x="{num(px)}" y="{num(py)}" width="{num(pw)}" height="{num(ph)}" fill="var(--gtr-pane)"/>')
            # A thumb pressed into the clay: a whorl of thicker clay, darker.
            tx, ty = px + pw * (0.25 + 0.5 * r()), py + ph * (0.3 + 0.4 * r())
            for k in range(3):
                g.append(f'<ellipse cx="{num(tx)}" cy="{num(ty)}" rx="{num(6 + k * 4.5)}" ry="{num(8 + k * 5)}" '
                         f'fill="none" stroke="var(--gtr-thick)" stroke-width="2.2"/>')
            # Lines pressed in with a finger along the pane: no word in them.
            for k in range(2 + int(r() * 2)):
                ly = py + 10 + k * 11 + r() * 4
                lx = px + 6 + r() * 8
                ln = pw * (0.35 + 0.45 * r())
                if ly > py + ph - 6:
                    break
                g.append(f'<path d="M{num(lx)} {num(ly)} q{num(ln / 4)} -3 {num(ln / 2)} 0 t{num(ln / 2)} 0" '
                         f'fill="none" stroke="var(--gtr-thick)" stroke-width="2.4" stroke-linecap="round"/>')
    g.append("</g>")
    out.extend(g)
    return out


def drawers(x0, x1):
    out = []
    w = (x1 - x0 - 8) / 2
    for c in range(2):
        for rr in range(5):
            x, y = x0 + 4 + c * w, 156 + rr * 30
            out.append(f'<rect x="{num(x + 2)}" y="{y}" width="{num(w - 4)}" height="26" rx="2" '
                       f'fill="var(--gtr-frame)"/>')
            out.append(f'<rect x="{num(x + w / 2 - 6)}" y="{y + 11}" width="12" height="4" rx="2" '
                       f'fill="var(--gtr-deep)"/>')
    return out


def slate(x, y, w, h, r):
    out = [f'<rect x="{num(x)}" y="{num(y)}" width="{num(w)}" height="{num(h)}" rx="3" fill="var(--gtr-clay)"/>',
           f'<rect x="{num(x + 4)}" y="{num(y + 4)}" width="{num(w - 8)}" height="{num(h - 8)}" rx="1.5" '
           f'fill="var(--gtr-slate)"/>']
    for k in range(3):
        ly = y + 10 + k * (h - 18) / 3
        ln = (w - 20) * (0.5 + 0.45 * r())
        if ly > y + h - 8:
            break
        out.append(f'<path d="M{num(x + 9)} {num(ly)} q{num(ln / 4)} -2 {num(ln / 2)} 0 t{num(ln / 2)} 0" '
                   f'fill="none" stroke="var(--gtr-chalk-2)" stroke-width="1.8" stroke-linecap="round"/>')
    return out


def golem(cx, base, s, holding, r):
    """Anybody's golem, in outline against the light: a block of clay with a
    head, arms and legs. No face, no eyes, nobody's character."""
    ink = 'fill="var(--gtr-clay-2)"'
    out = []
    head_h, body_h, leg_h = 40 * s, 96 * s, 58 * s
    top = base - leg_h - body_h - head_h
    out.append(f'<rect x="{num(cx - 18 * s)}" y="{num(top)}" width="{num(36 * s)}" height="{num(head_h)}" '
               f'rx="{num(12 * s)}" {ink}/>')
    sy = top + head_h - 2 * s
    out.append(f'<path d="M{num(cx - 48 * s)} {num(sy)} H{num(cx + 48 * s)} L{num(cx + 38 * s)} '
               f'{num(sy + body_h)} H{num(cx - 38 * s)} Z" {ink}/>')
    for side in (-1, 1):
        out.append(f'<rect x="{num(cx + side * 22 * s - 15 * s)}" y="{num(sy + body_h - 4 * s)}" '
                   f'width="{num(30 * s)}" height="{num(leg_h + 4 * s)}" rx="{num(5 * s)}" {ink}/>')
    if holding:
        # Both arms up and forward, a slate held at the chest, written on.
        for side in (-1, 1):
            out.append(f'<path d="M{num(cx + side * 42 * s)} {num(sy + 6 * s)} L{num(cx + side * 34 * s)} '
                       f'{num(sy + 62 * s)} L{num(cx + side * 16 * s)} {num(sy + 54 * s)} L{num(cx + side * 26 * s)} '
                       f'{num(sy + 2 * s)} Z" {ink}/>')
        out.extend(slate(cx - 44 * s, sy + 16 * s, 88 * s, 62 * s, r))
    else:
        for side in (-1, 1):
            out.append(f'<rect x="{num(cx + side * 56 * s - 12 * s)}" y="{num(sy + 4 * s)}" width="{num(24 * s)}" '
                       f'height="{num(92 * s)}" rx="{num(10 * s)}" {ink}/>')
    return out


def hall():
    r = seeded(144)
    parts = ['<rect x="0" y="0" width="1200" height="420" fill="var(--gtr-deep)"/>']
    for x0 in WINDOWS:
        parts.extend(window(x0, r))
    parts.extend(drawers(326, 484))
    parts.extend(drawers(716, 874))
    parts.append(f'<rect x="0" y="{FLOOR}" width="1200" height="{420 - FLOOR}" fill="var(--gtr-slate)"/>')
    # The day through each window, lying on the floor towards you, soft.
    for x0 in WINDOWS:
        parts.append(f'<path d="M{x0} {FLOOR} H{x0 + WW} L{x0 + WW + 60} 420 H{x0 - 60} Z" '
                     f'fill="var(--gtr-pane)" opacity=".16"/>')
    parts.extend(golem(600, 330, 1.05, True, r))
    # The long table, in front of the one holding up a slate, with slates on it.
    parts.append('<rect x="330" y="306" width="540" height="14" rx="3" fill="var(--gtr-frame)"/>')
    for x in (350, 840):
        parts.append(f'<rect x="{x}" y="318" width="12" height="70" fill="var(--gtr-frame)"/>')
    for x, w, h in ((372, 70, 40), (450, 64, 34), (690, 72, 42), (770, 60, 30)):
        parts.extend(slate(x, 306 - h, w, h, r))
    parts.extend(golem(212, 392, 1.18, False, r))
    parts.extend(golem(992, 392, 1.12, False, r))
    return ('<svg class="gtr-hall" viewBox="0 0 1200 420" xmlns="http://www.w3.org/2000/svg" focusable="false">\n'
            + "\n".join("      " + p for p in parts) + "\n    </svg>")


view = ('  <figure class="gtr-view" aria-hidden="true">\n    <!-- THE HALL, written by tools/make-golem-trust.py: '
        "three windows of clay in the back wall, drawers between them, a long table of slates, and golems in "
        "outline against the light. No face, no word, nobody's character. -->\n    "
        + hall() + "\n  </figure>")


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
    page_link = f'<a href="{attr(pg["url"])}">{esc(pg["title"])}</a>'
    if q["who"] == "Star Stuff":
        return f"Star Stuff, {page_link}"
    work = f'<a href="{attr(q["url"])}">{esc(q["work"])}</a>'
    return f'{esc(q["who"][0].upper() + q["who"][1:])}, {work}, read on our {page_link} page.'


def quote(qid, on_slate=False):
    q = quotes[qid]
    cls = "gtr-slate" if on_slate else "gtr-quote"
    return (f'    <blockquote class="{cls}">\n'
            f'      <p>{linked(q["text"])}</p>\n'
            f'      <footer class="gtr-who">{source(q)}</footer>\n'
            f'    </blockquote>')


def section(name):
    out = []
    for b in sections[name]:
        if "q" in b:
            out.append(quote(b["q"]))
        elif "slate" in b:
            out.append(quote(b["slate"], True))
        elif "p" in b:
            cls = ' class="gtr-lede"' if name == "lede" else ""
            out.append(f'    <p{cls}>{linked(b["p"])}</p>')
        elif "h2" in b:
            out.append(f'    <h2 id="gtr-{slug(b["h2"])}">{linked(b["h2"])}</h2>')
    return "\n".join(out)


swap(ROOM, "gtr:view", view)
for name in sections:
    swap(ROOM, f"gtr:{name}", section(name), "    ")
rules = [f"      <li>{linked(x)}</li>" for x in d["not_here"]]
swap(ROOM, "gtr:not-here", '    <ul class="gtr-rules">\n' + "\n".join(rules) + "\n    </ul>", "    ")
creds = [f"      <li>{linked(x)}</li>" for x in d["credits"]]
swap(ROOM, "gtr:credits", '    <ul class="gtr-credits">\n' + "\n".join(creds) + "\n    </ul>", "    ")
notes = []
for qid, q in quotes.items():
    pg = pages[q["read_on"]]
    notes.append(f'      <tr><td>{esc(q["text"])}</td><td>{esc(q["who"])}</td>'
                 f'<td><a href="{attr(pg["url"])}">{esc(pg["title"])}</a></td>'
                 f'<td>{len(q["text"].split())} words</td></tr>')
swap(NOTES, "golem-trust-credits", "\n".join(notes), "      ")

# ── The published page, checked ──────────────────────────────────────────────
src = ROOM.read_text()
body = re.sub(r"<!-- quest:.*?:end -->", " ", src, flags=re.S)
body = re.sub(r"<!--.*?-->", " ", body, flags=re.S)
for tag in re.findall(r"<(form|input|textarea|select)\b", body, re.I):
    refuse(f"{ROOM.name}: a <{tag}> outside the job marker. Nothing in this room takes anything from you.")
if re.search(r"contenteditable", body, re.I):
    refuse(f"{ROOM.name}: something editable outside the job marker.")
if re.search(r"<img\b", body, re.I):
    refuse(f"{ROOM.name}: an <img>. No cover, map, crest or character of anybody's; the hall is drawn here.")
if FANS.search(body):
    refuse(f"{ROOM.name}: links a fan wiki or fan site.")
for s in re.findall(r'<script\b[^>]*\bsrc="([^"]+)"', src):
    if s not in SCRIPTS:
        refuse(f"{ROOM.name}: loads {s}, and the room runs {', '.join(sorted(SCRIPTS))} and nothing else.")
if 'href="widdershins.html"' not in src:
    refuse(f"{ROOM.name}: no way back over the bridge to Widdershins.")
sec = re.search(r"/\* §144 ── SUBROOM: The Golem Trust.*?(?=/\* §1\d\d )", CSS.read_text(), re.S)
if not sec:
    refuse("love.css has no §144 for The Golem Trust, followed by another section.")
elif re.search(r"@keyframes|\banimation\s*:|\btransition\s*:", re.sub(r"/\*.*?\*/", " ", sec.group(0), flags=re.S)):
    refuse("love.css §144: a keyframe, an animation or a transition. The day through the clay never moves.")
text = re.sub(r"<(script|style)\b.*?</\1>", " ", body, flags=re.S)
text = re.sub(r"<blockquote\b.*?</blockquote>", " ", text, flags=re.S)
text = re.sub(r"<svg\b.*?</svg>", " ", text, flags=re.S)
text = re.sub(r"<head\b.*?</head>", " ", text, flags=re.S)
text = html.unescape(fold(re.sub(r"<[^>]+>", " ", text)))
sweep(text, ROOM.name)
if problems:
    raise SystemExit("REFUSING, on the published page:\n  " + "\n  ".join(problems))
checked = [k for k, v in have.items() if v]
print(f"golem trust: a hall lit through clay, {len(quotes)} quotations in {ROOM.name}")
print("  quotations checked word for word against " + (", ".join(checked) if checked else "nothing on this machine"))
print("  no golem named, nobody diagnosed, nothing for sale")
