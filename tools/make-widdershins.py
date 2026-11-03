#!/usr/bin/env python3
"""Build Widdershins: its city, its sections, the Watch, Star Stuff's figures and its credits, from data/widdershins.json.

ONE DATA FILE, ONE TOOL, TWO SURFACES, the contract make-yells.py set. The room
is a Discworld appreciation with an anti-normative bent (Ryan's brief,
2026-11-02: Widdershins: Against the Way of Normativity, after Pratchett's
writing on inclusion and on embracing difference and weirdness, above all in
the books about the City Watch, which are about diversity within a team and
forming competency networks; copy some of Star Stuff's Discworld writing and
drawings into it; evoke Ankh-Morpork). This tool writes, between wds:<part>
markers in widdershins.html:

  · THE CITY (wds:city-view): crooked roofs built on top of each other beside a
    river too thick to drown in, a thin tower, a clacks tower and a bridge, at
    the moment the Disc's slow morning is halfway across it. Everything right
    of the morning's edge is lit; everything left of it is still night; and a
    compass with the Disc's four directions hangs in the night sky, its
    widdershins arm pointing into the morning.
  · EVERY SECTION (wds:lede, wds:city, wds:watch, wds:senses, wds:witches,
    wds:starstuff), block by block, with the Watch, the people we recognise and
    Star Stuff's figures among them.
  · WHAT IS NOT IN THIS CITY (wds:rules), NEXT DOOR (wds:elsewhere) and THE
    CREDITS (wds:credits), with a table of the quotations in liner-notes.html.

THE MORNING IS AN EDGE, AND THE ROOM IS ON THE NIGHT SIDE OF IT. On the Disc,
in the books, light is slow, so a morning crosses a city like a tide you could
watch. The drawing is the same city twice, at night and lit, the lit one
clipped to one side of a slanting line, and that line is the only light in the
room. Every word is set on the night side, on flat ground; the morning only
ever cuts across the corner of a card, at the same slant as in the city.

WHAT IT REFUSES, and the first four are the room:

  · A DIAGNOSIS. Nobody on the Disc is called autistic, ADHD, neurodivergent or
    anything else in our words, and neither is their author, who named the one
    condition he had himself. We recognise ourselves; we do not label people
    who cannot answer. Swept with the negation window, so the room can say it
    will not.
  · A RANKING. Best book, favourite character, greatest, top ten, must-read.
    A team that works because nobody on it is the same is the last thing to
    put in order.
  · PITY, INSPIRATION AND THE CURE. Suffering, bravery, overcoming, fixing,
    curing: nobody on the Watch is cured into a human, and an embuggerance is
    not a battle. Laughingstock's rule.
  · A FAN WIKI, A FAN SITE OR ANYTHING OF THE ESTATE'S. No link to a fan wiki
    or to the fan site the brief linked, and no <img> at all: no cover, no map
    of the city, no crest, no lettering and no character, because the city in
    the window is ours and nobody is in it.
  · A QUOTATION over the cap in the data, with no author, with no link for a
    work, carrying an HTML entity, or read off anything but a page in `pages`.
    AND, WHERE THE COPY IT WAS READ ON IS ON THE MACHINE, ONE THAT IS NOT THERE
    WORD FOR WORD: the Knowledge System mirror for stimpunks.org, Star Stuff's
    own repository for starstuff.earth, and the paper's own text, read with
    pdftotext, for the one paper. A `holds` line those copies no longer say.
  · A FIGURE THAT IS NOT STAR STUFF'S. Each figure is kept here exactly as the
    zine has it, and where Star Stuff's repository is on the machine the tool
    refuses one the zine no longer carries, so a correction there is noticed
    here. Its colours are this room's; its words are the zine's, but for the
    one `change` the data names and the page says.
  · THE HEADER GONE. The room says this street sends GNU Terry Pratchett;
    _headers has to.
  · A FORM, AN INPUT, A TEXTAREA OR ANYTHING EDITABLE outside the job marker,
    and any script but love.js and quest.js.
  · A KEYFRAME, AN ANIMATION OR A TRANSITION in §135. The morning is caught
    halfway across the city and stays there at every setting.
  · A MISSING MARKER PAIR.
"""
import html
import json
import random
import re
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data/widdershins.json"
ROOM = ROOT / "widdershins.html"
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

NEGATION = (r"(?:no|not|nothing|never|neither|none|without|refuses?|refused|refusing|"
            r"cannot|does not|do not|won't|will not|is not|are not|isn't|aren't|nobody|nor|declin\w+)")

DIAGNOSIS = (r"diagnos\w*|undiagnosed|(?:is|was|were|are|being)\s+(?:clearly\s+|obviously\s+|probably\s+|"
             r"definitely\s+|surely\s+)?(?:autistic|adhd|neurodivergent|dyslexic|dyspraxic|on the spectrum)|"
             r"has (?:adhd|autism|asperger\w*)|asperger\w*")
RANKING = (r"best (?:book|books|character|characters|of the)|greatest|favourite|favorite|"
           r"top (?:ten|five|\d+)|ranked|ranking|must[- ]reads?|the definitive")
PITY = (r"suffer\w*|brave\w*|courag\w+|inspir(?:ing|ational|ation to)|overcom\w+|"
        r"battl\w+ (?:with|against)|cur(?:e|ed|es|ing)\b|fix(?:ed|es|ing)?\b|wheelchair[- ]bound")

SWEEPS = [
    (DIAGNOSIS, "nobody on the Disc, and not its author, is diagnosed here. See _ours."),
    (RANKING, "nothing in this room is put in order. See not_here."),
    (PITY, "nobody here is pitied, an inspiration or cured. See not_here."),
]
SWEEPS = [(re.compile(rf"\b(?:{p})", re.I),
           re.compile(rf"\b{NEGATION}\b[^.]{{0,70}}?\b(?:{p})", re.I), why) for p, why in SWEEPS]

FANS = re.compile(r"fandom\.com|lspace\.org|theturtlemoves\.com|discworld\.fandom", re.I)
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
    """Words only, for comparing a quotation with what it was read on: images,
    footnote markers, link targets, emphasis, list and quote markers off."""
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


def ours(text, where):
    text = str(text)
    if ENTITY.search(text):
        refuse(f"{where}: carries an HTML entity. Everything is escaped on the way in; write the character.")
    for _, url in LINK.findall(text):
        if not (url.startswith("https://") or re.match(r"^[a-z0-9-]+\.html(?:#[\w/=-]*)?$", url)):
            refuse(f"{where}: {url!r} is neither an https address nor a page of ours.")
        if FANS.search(url):
            refuse(f"{where}: links a fan wiki or fan site. Nothing here is drawn from one.")
    sweep(EM.sub(r"\1", BOLD.sub(r"\1", LINK.sub(r"\1", text))), where)


def linked(text):
    """Escape, then **bold**, *emphasis* and [words](address)."""
    out = BOLD.sub(r"<b>\1</b>", esc(text))
    out = EM.sub(r"<em>\1</em>", out)
    return LINK.sub(lambda m: f'<a href="{attr(html.unescape(m.group(2)))}">{m.group(1)}</a>', out)


def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


# ── The data ─────────────────────────────────────────────────────────────────
d = json.loads(DATA.read_text())
pages = d.get("pages") or {}
quotes = d.get("quotes") or {}
sections = d.get("sections") or {}
watch = d.get("watch") or []
recognised = d.get("recognised") or []
figures = d.get("figures") or {}
cap = int(d.get("words") or 0)
if not cap:
    refuse("data/widdershins.json has no `words` cap, and the room prints one.")

have = {"mirror": MIRROR.is_dir(), "starstuff": STARSTUFF.is_dir(),
        "paper": (KS / "inbox").is_dir() and bool(shutil.which("pdftotext"))}
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
    elif kind == "paper":
        if not url.startswith("https://doi.org/"):
            refuse(f"pages.{key}: a paper is linked by its DOI.")
        for need in ("who", "in", "year", "licence"):
            if not str(pg.get(need, "")).strip():
                refuse(f"pages.{key}: a paper with no {need}.")
    else:
        refuse(f"pages.{key}: `from` is {kind!r}; it is mirror, starstuff or paper.")
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
    elif kind == "starstuff":
        f = STARSTUFF / pg["file"]
        if not f.is_file():
            refuse(f"pages.{key}: Star Stuff's repository has no {pg['file']}.")
            continue
        raw = f.read_text()
        texts[key] = plain_html(raw) if f.suffix == ".html" else plain(raw.split("\n---", 1)[-1])
    else:
        f = KS / pg["file"]
        if not f.is_file():
            continue
        out = subprocess.run(["pdftotext", str(f), "-"], capture_output=True, text=True).stdout
        texts[key] = fold(re.sub(r"-\n(?=[a-z])", "", out))
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
        refuse(f"{where}: `read_on` is not one of `pages`.")
        continue
    if q.get("who") not in ("Stimpunks", "Star Stuff") and src.get("from") != "paper":
        if not str(q.get("work", "")).strip() or not str(q.get("url", "")).startswith("https://"):
            refuse(f"{where}: somebody else's words with no work, or no link to it. Do not fill it from memory.")
    if q.get("who") == "Star Stuff" and src.get("from") != "starstuff":
        refuse(f"{where}: Star Stuff's words read somewhere that is not Star Stuff.")
    for field, v in q.items():
        if ENTITY.search(str(v)):
            refuse(f"{where}: {field} carries an HTML entity.")
        if FANS.search(str(v)):
            refuse(f"{where}: {field} points at a fan wiki or fan site.")
    key = q["read_on"]
    if key in texts and fold(EM.sub(r"\1", text)) not in texts[key]:
        refuse(f"{where}: not on {src['url']} word for word. Re-copy it from there; never loosen the check.")

used = set()
for name, blocks in sections.items():
    for j, b in enumerate(blocks, 1):
        where = f"sections.{name} block {j}"
        if "q" in b:
            if b["q"] not in quotes:
                refuse(f"{where}: quotes {b['q']!r}, which is not in `quotes`.")
            used.add(b["q"])
        elif "p" in b:
            ours(b["p"], where)
        elif "h3" in b:
            ours(b["h3"], where)
        elif "figure" in b:
            if b["figure"] not in figures:
                refuse(f"{where}: figure {b['figure']!r} is not in `figures`.")
        elif "excerpt" in b:
            src = pages.get(b["excerpt"])
            if not src or src.get("from") != "starstuff":
                refuse(f"{where}: an excerpt is copied from a Star Stuff page in `pages`, and this names none.")
            elif not b.get("paras"):
                refuse(f"{where}: an excerpt with no paragraphs.")
            for k, para in enumerate(b.get("paras") or [], 1):
                if ENTITY.search(para):
                    refuse(f"{where} paragraph {k}: carries an HTML entity.")
                for _, url in LINK.findall(para):
                    if not url.startswith("https://starstuff.earth/"):
                        refuse(f"{where} paragraph {k}: a link that is not Star Stuff's own, made absolute.")
                if b.get("excerpt") in texts and fold(plain(para)) not in texts[b["excerpt"]]:
                    refuse(f"{where} paragraph {k}: not on {src['url']} word for word. Copy it again from "
                           "there; never loosen the check.")
        elif not any(k in b for k in ("watch", "recognised")):
            refuse(f"{where}: a block is a q, a p, an h3, a figure, the Watch or the recognised, and this is none.")
for qid in quotes:
    if qid not in used:
        refuse(f"quote {qid}: in the data and on no section, so its credit would claim a line the room does not print.")

for listname, rows in (("watch", watch), ("recognised", recognised)):
    if not rows:
        refuse(f"{listname}: empty.")
    for i, r in enumerate(rows, 1):
        for need in ("name", "line"):
            if not str(r.get(need, "")).strip():
                refuse(f"{listname} {i}: no {need}.")
        for field in ("name", "line", "first", "where"):
            ours(r.get(field, ""), f"{listname} {i} ({field})")

for i, r in enumerate(d.get("not_here") or [], 1):
    for need in ("name", "line"):
        if not str(r.get(need, "")).strip():
            refuse(f"not_here {i}: no {need}.")

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

if "X-Clacks-Overhead: GNU Terry Pratchett" not in HEADERS.read_text():
    refuse("_headers no longer sends X-Clacks-Overhead: GNU Terry Pratchett, and the room says this street sends it.")

for fid, f in figures.items():
    svg = str(f.get("svg", ""))
    home = pages.get(f.get("from", "atom"))
    if not home or home.get("from") != "starstuff":
        refuse(f"figures.{fid}: `from` names no Star Stuff page in `pages`.")
        continue
    if not re.match(r'<svg class="(?:diagram|coda-svg)"', svg):
        refuse(f"figures.{fid}: not one of Star Stuff's drawings as its page has it.")
    zine = (STARSTUFF / home["file"]).read_text() if have["starstuff"] else ""
    if zine and svg not in zine:
        refuse(f"figures.{fid}: {home['title']} no longer carries this drawing as it is kept here. Star Stuff "
               "may have corrected it: copy it again from there, never edit it here.")
    for old, new in [f["change"]] if f.get("change") else []:
        if old not in svg:
            refuse(f"figures.{fid}: the change names {old!r}, which the figure does not say.")
    if not str(f.get("caption", "")).strip():
        refuse(f"figures.{fid}: no caption.")

if problems:
    raise SystemExit("REFUSING to build Widdershins:\n  " + "\n  ".join(problems))


# ── Star Stuff's figures, in this room's inks ────────────────────────────────
TINTS = {(167, 139, 250): "heather", (251, 191, 36): "dawn", (34, 211, 238): "river", (74, 222, 128): "moss",
         (244, 114, 182): "rose", (244, 244, 251): "ink-2", (138, 134, 160): "ink-3"}
NAMES = {"--violet": "heather", "--gold": "dawn", "--cyan": "river", "--green": "moss",
         "--sp-secondary": "ink-2", "--sp-dim": "ink-3", "--stardust": "ink-2",
         # The Turtle's occluding shapes: the page's ground is the figure's slab,
         # and the slightly lighter deep is the night walls' colour.
         "--void": "slab", "--deep": "wall-night"}


def recolour(fid, f):
    svg = f["svg"]
    for old, new in [f["change"]] if f.get("change") else []:
        svg = svg.replace(old, new)

    def rgba(m):
        prop, r, g, b, a = m.group(1), int(m.group(2)), int(m.group(3)), int(m.group(4)), m.group(5)
        ink = TINTS.get((r, g, b))
        if not ink:
            raise SystemExit(f"REFUSING: figure {fid} uses rgb({r},{g},{b}), which this room has no ink for.")
        return f'{prop}="var(--wds-{ink})" {prop}-opacity="{a}"'
    svg = re.sub(r'(fill|stroke)="rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)"', rgba, svg)

    def name(m):
        if m.group(1) not in NAMES:
            raise SystemExit(f"REFUSING: figure {fid} uses var({m.group(1)}), which this room has no ink for.")
        return f"var(--wds-{NAMES[m.group(1)]})"
    svg = re.sub(r"var\((--(?!wds-)[a-z-]+)\)", name, svg)
    svg = re.sub(r'class="(?:diagram|coda-svg)"', 'class="wds-figure__svg"', svg, count=1)
    svg = re.sub(r"<!--.*?-->", "", svg, flags=re.S)
    svg = re.sub(r'\bid="([a-z0-9]+-(?:title|desc))"', r'id="wds-\1"', svg)
    svg = re.sub(r'\bid="elephants"', 'id="wds-elephants"', svg)
    svg = re.sub(r'aria-labelledby="([a-z0-9]+-title) ([a-z0-9]+-desc)"', r'aria-labelledby="wds-\1 wds-\2"', svg)
    svg = svg.replace("Space Mono, monospace", "'Space Mono', monospace")
    if re.search(r"rgba?\(|#[0-9a-fA-F]{3,6}\b", svg):
        raise SystemExit(f"REFUSING: figure {fid} still carries a colour of its own after recolouring.")
    svg = "\n".join("      " + line.strip() for line in svg.splitlines() if line.strip())
    change = ""
    if f.get("change"):
        change = (f' One line is changed for this street: it said <q>{esc(f["change"][0])}</q>, and says '
                  f'<q>{esc(f["change"][1])}</q> here.')
    return (f'    <figure class="wds-figure">\n{svg}\n'
            f'      <figcaption class="wds-figure__words">{esc(f["caption"])} Drawn for '
            f'<a href="{attr(pages[f.get("from", "atom")]["url"])}">Star Stuff</a>, CC BY-SA 4.0, and recoloured for this room.'
            f'{change}</figcaption>\n    </figure>')


# ── The city ─────────────────────────────────────────────────────────────────
W, H = 1200, 420
BANK = 352            # where the front row stands on the river bank
TOP, BOT = 812, 612   # the morning's edge, where it meets the top and the foot
rng = random.Random(1983)   # the year of the first book; the same city every build


def n(v):
    return f"{v:.1f}".rstrip("0").rstrip(".")


def building(x, w, h, base, roof):
    """One crooked house as a polygon: it leans because its top is drawn
    somewhere other than over its foot, never by a transform."""
    lean = rng.uniform(-5, 5)
    top = base - h
    pts = [(x, base), (x + w, base), (x + w + lean, top)]
    if roof == "gable":
        pts += [(x + w / 2 + lean, top - rng.uniform(14, 30)), (x + lean, top)]
    elif roof == "lean":
        pts += [(x + lean, top - rng.uniform(8, 18))]
    else:
        pts += [(x + lean, top)]
    return pts, lean, top


def poly(pts):
    return " ".join(f"{n(a)},{n(b)}" for a, b in pts)


houses = []   # (points, windows, chimneys)
for row, (base, lo, hi, wlo, whi) in enumerate(((BANK - 32, 88, 168, 34, 70), (BANK, 46, 112, 30, 66))):
    x = -12
    while x < W + 12:
        w = rng.uniform(wlo, whi)
        roof = rng.choice(("gable", "gable", "lean", "flat"))
        pts, lean, top = building(x, w, rng.uniform(lo, hi), base, roof)
        wins = []
        if row == 1:
            for wy in range(int(top + 14), int(base - 16), 22):
                for wx in range(int(x + 7), int(x + w - 10), 14):
                    if rng.random() < .55:
                        wins.append((wx + lean * (base - wy) / (base - top), wy))
        chims = [(x + rng.uniform(4, max(5, w - 12)) + lean, top)] if roof == "flat" and rng.random() < .8 else []
        houses.append((row, pts, wins, chims))
        x += w - rng.uniform(0, 6)

def city(side):
    """The whole city in one light: `night` or `day`."""
    sky, wall, roof, river, crust = (("sky-night", "wall-night", "roof-night", "ankh", "ankh-crust") if side == "night"
                                     else ("sky-day", "wall-day", "roof-day", "ankh-day", "ankh-crust-day"))
    out = [f'<rect width="{W}" height="{H}" fill="var(--wds-{sky})"/>']
    # The thin tower, far off, taller than anything, and the clacks tower with
    # its grid of shutters, both behind the houses.
    out.append(f'<path d="M286 {BANK - 32} L292 64 L298 44 L304 64 L310 {BANK - 32} Z" fill="var(--wds-{roof})" '
               f'stroke="var(--wds-line)" stroke-width="1.5"/>')
    cx = 936
    out.append(f'<path d="M{cx - 14} {BANK - 32} L{cx - 6} 96 H{cx + 6} L{cx + 14} {BANK - 32}" fill="none" '
               f'stroke="var(--wds-{roof})" stroke-width="5"/>'
               f'<path d="M{cx - 11} 270 H{cx + 11} M{cx - 9} 200 H{cx + 9} M{cx - 8} 140 H{cx + 8}" '
               f'stroke="var(--wds-{roof})" stroke-width="3"/>'
               f'<rect x="{cx - 22}" y="62" width="44" height="34" fill="var(--wds-{roof})" stroke="var(--wds-line)" '
               f'stroke-width="1.5"/>')
    shutters = "".join(f'<rect x="{cx - 18 + 11 * i}" y="{66 + 10 * j}" width="8" height="7" '
                       f'fill="var(--wds-{wall})"/>' for i in range(4) for j in range(3) if (i + j) % 2 == 0)
    out.append(shutters)
    for row, pts, wins, chims in houses:
        fill = wall if row == 1 else roof
        out.append(f'<polygon points="{poly(pts)}" fill="var(--wds-{fill})" stroke="var(--wds-line)" '
                   f'stroke-width="1.4" stroke-linejoin="round"/>')
        if row == 1:
            out.append(f'<polyline points="{poly(pts[2:])}" fill="none" stroke="var(--wds-{roof})" '
                       f'stroke-width="5" stroke-linejoin="round"/>')
        for wx, wy in wins:
            out.append(f'<rect x="{n(wx)}" y="{wy}" width="7" height="9" fill="var(--wds-window)"/>')
        for chx, chy in chims:
            out.append(f'<rect x="{n(chx)}" y="{n(chy - 16)}" width="7" height="16" fill="var(--wds-{roof})" '
                       f'stroke="var(--wds-line)" stroke-width="1"/>')
    # The river, thick enough to stand on, with its crust.
    out.append(f'<rect x="0" y="{BANK}" width="{W}" height="{H - BANK}" fill="var(--wds-{river})"/>')
    lumps = random.Random(1989)
    crust_d = "".join(f"M{n(x)} {n(y)} q{n(w / 2)} -{n(lumps.uniform(2, 5))} {n(w)} 0 "
                      for x, y, w in ((lumps.uniform(0, W), lumps.uniform(BANK + 10, H - 6), lumps.uniform(18, 46))
                                      for _ in range(46)))
    out.append(f'<path d="{crust_d}" fill="none" stroke="var(--wds-{crust})" stroke-width="2.4" '
               f'stroke-linecap="round"/>')
    # The bridge across it.
    out.append(f'<path d="M430 {BANK + 6} Q530 {BANK - 40} 630 {BANK + 6}" fill="none" stroke="var(--wds-brass)" '
               f'stroke-width="9"/><path d="M430 {BANK - 6} Q530 {BANK - 52} 630 {BANK - 6}" fill="none" '
               f'stroke="var(--wds-brass)" stroke-width="2.4"/>'
               + "".join(f'<path d="M{x} {n(BANK - 6 - 46 * (1 - ((x - 530) / 100) ** 2))} V'
                         f'{n(BANK + 6 - 46 * (1 - ((x - 530) / 100) ** 2))}" stroke="var(--wds-brass)" '
                         f'stroke-width="2"/>' for x in range(446, 630, 16)))
    return "".join(out)


lit = f"M{TOP} 0 H{W} V{H} H{BOT} Z"
parts = [
    f'<defs><clipPath id="wds-lit"><path d="{lit}"/></clipPath></defs>',
    city("night"),
    f'<g clip-path="url(#wds-lit)">{city("day")}</g>',
    # THE MORNING'S EDGE: the only light in the room, a hard line with a little
    # haze to the lit side of it. Nothing on the night side is lit at all.
    f'<g clip-path="url(#wds-lit)"><path d="M{TOP} 0 L{BOT} {H}" stroke="var(--wds-edge)" stroke-width="46" '
    f'stroke-opacity=".22"/><path d="M{TOP} 0 L{BOT} {H}" stroke="var(--wds-edge)" stroke-width="18" '
    f'stroke-opacity=".4"/></g>',
    f'<path d="M{TOP} 0 L{BOT} {H}" stroke="var(--wds-edge)" stroke-width="3"/>',
]
# THE COMPASS in the night sky: the Disc's four directions, and widdershins
# pointing into the morning.
ox, oy, r = 176, 104, 52
parts.append(
    f'<g font-family="\'Grenze\', serif" font-weight="700" font-size="15" letter-spacing="1.2" text-anchor="middle">'
    f'<circle cx="{ox}" cy="{oy}" r="{r - 14}" fill="none" stroke="var(--wds-ink-3)" stroke-width="1.4"/>'
    f'<path d="M{ox} {oy - r + 6} V{oy + r - 6} M{ox - r + 6} {oy} H{ox}" stroke="var(--wds-ink-3)" stroke-width="2"/>'
    f'<path d="M{ox} {oy} H{ox + r + 10}" stroke="var(--wds-dawn)" stroke-width="3.4"/>'
    f'<path d="M{ox + r + 2} {oy - 7} L{ox + r + 14} {oy} L{ox + r + 2} {oy + 7}" fill="var(--wds-dawn)"/>'
    f'<text x="{ox}" y="{oy - r - 4}" fill="var(--wds-ink-2)">HUBWARD</text>'
    f'<text x="{ox}" y="{oy + r + 16}" fill="var(--wds-ink-2)">RIMWARD</text>'
    f'<text x="{ox - r - 4}" y="{oy + 5}" text-anchor="end" fill="var(--wds-ink-2)">TURN&#8203;WISE</text>'
    f'<text x="{ox + r + 20}" y="{oy + 5}" text-anchor="start" fill="var(--wds-dawn)">WIDDERSHINS</text></g>')
view = (f'  <svg class="wds-city" viewBox="0 0 {W} {H}" aria-hidden="true" focusable="false">'
        + "".join(parts) + "</svg>")


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
    if q["who"] == "Stimpunks":
        return f"Stimpunks, our {page_link} page"
    if q["who"] == "Star Stuff":
        return f"Star Stuff, {page_link}"
    if pg["from"] == "paper":
        bits = f'{esc(pg["who"])}, {page_link}, <cite>{esc(pg["in"])}</cite>, {esc(pg["year"])}'
        return bits + (f". {esc(q['note'])}" if q.get("note") else "")
    year = f', {esc(q["year"])}' if q.get("year") else ""
    at = f', {esc(q["page"])}' if q.get("page") else ""
    work = f'<a href="{attr(q["url"])}">{esc(q["work"])}</a>'
    where = "Star Stuff&rsquo;s" if pg["from"] == "starstuff" else "our"
    noun = "" if pg["from"] == "starstuff" else " page"
    note = f" {esc(q['note'])}" if q.get("note") else ""
    if q.get("speaker"):
        who = f'{esc(q["speaker"])}, in {esc(q["who"])}&rsquo;s {work}'
    else:
        who = f'{esc(q["who"])}, {work}'
    return f'{who}{year}{at}, read on {where} {page_link}{noun}.{note}'


def quote(qid):
    q = quotes[qid]
    return (f'    <blockquote class="wds-quote">\n'
            f'      <p>{linked(q["text"])}</p>\n'
            f'      <footer class="wds-quote__who">{source(q)}</footer>\n'
            f'    </blockquote>')


def watch_list():
    rows = []
    for w in watch:
        when = f'{esc(w["first"])}, {esc(w["year"])}' if w.get("year") else esc(w["first"])
        rows.append(f'      <li class="wds-card">\n'
                    f'        <h3>{esc(w["name"])}</h3>\n'
                    f'        <p class="wds-card__when">from <i>{when}</i></p>\n'
                    f'        <p>{linked(w["line"])}</p>\n'
                    f'      </li>')
    return '    <ul class="wds-cards">\n' + "\n".join(rows) + "\n    </ul>"


def recognised_list():
    rows = [f'      <li class="wds-card">\n'
            f'        <h3>{esc(r["name"])}</h3>\n'
            f'        <p class="wds-card__when"><i>{esc(r["where"])}</i></p>\n'
            f'        <p>{linked(r["line"])}</p>\n'
            f'      </li>' for r in recognised]
    return '    <ul class="wds-cards">\n' + "\n".join(rows) + "\n    </ul>"


def section(name):
    out = []
    for b in sections[name]:
        if "q" in b:
            out.append(quote(b["q"]))
        elif "p" in b:
            out.append(f'    <p>{linked(b["p"])}</p>')
        elif "h3" in b:
            out.append(f'    <h3 id="wds-{slug(b["h3"])}">{linked(b["h3"])}</h3>')
        elif "figure" in b:
            out.append(recolour(b["figure"], figures[b["figure"]]))
        elif "excerpt" in b:
            pg = pages[b["excerpt"]]
            paras = "\n".join(f"      <p>{linked(x)}</p>" for x in b["paras"])
            out.append(f'    <blockquote class="wds-excerpt">\n{paras}\n'
                       f'      <footer class="wds-quote__who">Star Stuff, <a href="{attr(pg["url"])}">'
                       f'{esc(pg["title"])}</a>, copied whole under CC BY-SA 4.0, its links made absolute.'
                       f'</footer>\n    </blockquote>')
        elif "watch" in b:
            out.append(watch_list())
        elif "recognised" in b:
            out.append(recognised_list())
    return "\n".join(out)


swap(ROOM, "wds:city-view", view)
for name in sections:
    swap(ROOM, f"wds:{name}", section(name), "    ")

rules = [f'      <li class="wds-card"><strong>{esc(r["name"])}</strong> {linked(r["line"])}</li>'
         for r in d["not_here"]]
swap(ROOM, "wds:rules", '    <ul class="wds-rules">\n' + "\n".join(rules) + "\n    </ul>", "    ")

nexts = [f'      <li><a href="{attr(e["page"])}">{esc(e["name"])}</a>, {linked(e["line"])}</li>'
         for e in d["elsewhere"]]
swap(ROOM, "wds:elsewhere", '    <ul class="wds-next">\n' + "\n".join(nexts) + "\n    </ul>", "    ")

faces = json.loads(FACES.read_text())["faces"]
display, text_face = faces["grenze"], faces["proza-libre"]
licence = lambda f: f["licence"].replace(" 1.1", "")
others = []
for q in quotes.values():
    if q["who"] not in ("Stimpunks", "Star Stuff", "Terry Pratchett") and q["who"] not in others:
        others.append(q["who"])
names = ", ".join(others[:-1]) + " and " + others[-1]
mapp = pages["mapp"]
credits = [
    "      <li><strong>The Discworld is Terry Pratchett&rsquo;s</strong>, and every line of his here was already "
    "quoted on one of our pages or on Star Stuff before this room was built, credited to the book it is from. "
    "His estate has no involvement in this room, was not asked, and has not seen it. Discworld is a trade mark, "
    "and nothing here is offered as anything of theirs.</li>",
    "      <li><strong>The city is ours</strong>, crooked roofs anybody might draw, a thin tower, a clacks tower and "
    "a bridge, made as code by Claude, an AI model made by Anthropic, to Ryan&rsquo;s brief. It is not a map of "
    "anywhere, nobody is in it, and nothing on this page calls an AI while you read it.</li>",
    "      <li><strong>Six drawings and some of the words are Star Stuff&rsquo;s</strong>, from "
    f'<a href="{attr(pages["atom"]["url"])}">No. 49, One Atom of Justice</a>, '
    f'<a href="{attr(pages["promise"]["url"])}">A Promise, Not a Finding</a> and the '
    f'<a href="{attr(pages["eggs"]["url"])}">Easter Eggs</a> collection, whose closing section The Turtle '
    "Moves is copied whole, by Stimpunks and Helen Edgar&rsquo;s More Realms, under CC BY-SA 4.0 like this "
    "street. The drawings are as Star Stuff has them, in this room&rsquo;s colours, with one line changed and "
    "said so.</li>",
    f"      <li><strong>Every other quotation belongs to whoever said it</strong> and is credited where it stands: "
    f"{esc(names)}. The words around them are ours, written for this room, and so is every reading of the books; "
    "nothing about the Disc was taken from a fan wiki.</li>",
    f'      <li>Two lines are from {esc(mapp["who"])}&rsquo;s <a href="{attr(mapp["url"])}">paper</a> in '
    f"<cite>{esc(mapp['in'])}</cite>, {esc(mapp['year'])}, open access under {esc(mapp['licence'])}, quoted as "
    "they are and not adapted.</li>",
    f"      <li>Every quotation in this room is {cap} words or fewer, and was read on {esc(d['read'])} on the "
    "page it names. <code>tools/make-widdershins.py</code> checks each one word for word against our copy of "
    "stimpunks.org, Star Stuff&rsquo;s own repository and the paper, whenever they are on the machine.</li>",
    f"      <li>The type is {esc(display['family'])}, by {esc(display['designer'])}, a face between a roman and a "
    f"blackletter, for the room&rsquo;s name and headings, under the {esc(licence(display))}, and "
    f"{esc(text_face['family'])}, by {esc(text_face['designer'])}, for everything you read, under the "
    f"{esc(licence(text_face))}, both read off their own records. Star Stuff&rsquo;s drawings keep their own "
    'Space Mono. More in <a href="liner-notes.html#widdershins">the liner notes</a>.</li>',
]
swap(ROOM, "wds:credits", '    <ul class="wds-credits">\n' + "\n".join(credits) + "\n    </ul>", "    ")

notes = []
for qid, q in quotes.items():
    pg = pages[q["read_on"]]
    words = EM.sub(r"\1", q["text"])
    notes.append(f'      <tr><td>{esc(words)}</td><td>{esc(q["who"])}</td>'
                 f'<td><a href="{attr(pg["url"])}">{esc(pg["title"])}</a></td>'
                 f'<td>{len(q["text"].split())} words</td></tr>')
swap(NOTES, "widdershins-credits", "\n".join(notes), "      ")

# ── The published page, checked ──────────────────────────────────────────────
src = ROOM.read_text()
body = re.sub(r"<!-- quest:.*?:end -->", " ", src, flags=re.S)
body = re.sub(r"<!--.*?-->", " ", body, flags=re.S)

for tag in re.findall(r"<(form|input|textarea|select)\b", body, re.I):
    refuse(f"{ROOM.name}: a <{tag}> outside the job marker. Nothing in this room takes anything from you.")
if re.search(r"contenteditable", body, re.I):
    refuse(f"{ROOM.name}: something editable outside the job marker.")
if re.search(r"<img\b", body, re.I):
    refuse(f"{ROOM.name}: an <img>. No cover, map, crest or character of theirs; the city is drawn here.")
if FANS.search(body):
    refuse(f"{ROOM.name}: links a fan wiki or fan site.")
for s in re.findall(r'<script\b[^>]*\bsrc="([^"]+)"', src):
    if s not in SCRIPTS:
        refuse(f"{ROOM.name}: loads {s}, and the room runs {', '.join(sorted(SCRIPTS))} and nothing else.")

sec = re.search(r"/\* §135 ── ROOM: Widdershins.*?(?=/\* §136 )", CSS.read_text(), re.S)
if not sec:
    refuse("love.css has no §135 for Widdershins before §136.")
elif re.search(r"@keyframes|\banimation\s*:|\btransition\s*:", re.sub(r"/\*.*?\*/", " ", sec.group(0), flags=re.S)):
    refuse("love.css §135: a keyframe, an animation or a transition. The morning stays halfway at every setting.")

text = re.sub(r"<(script|style)\b.*?</\1>", " ", body, flags=re.S)
text = re.sub(r"<blockquote\b.*?</blockquote>", " ", text, flags=re.S)
text = re.sub(r"<svg\b.*?</svg>", " ", text, flags=re.S)
text = re.sub(r"<head\b.*?</head>", " ", text, flags=re.S)
text = html.unescape(fold(re.sub(r"<[^>]+>", " ", text)))
sweep(text, ROOM.name)
if problems:
    raise SystemExit("REFUSING, on the published page:\n  " + "\n  ".join(problems))

checked = [k for k, v in have.items() if v]
print(f"widdershins: a city half in the morning, {len(watch)} on the Watch, {len(figures)} of Star Stuff's "
      f"figures, {len(quotes)} quotations in {ROOM.name}")
print("  quotations checked word for word against " + (", ".join(checked) if checked else "nothing on this machine"))
print("  nobody diagnosed, nothing ranked, nobody cured")
