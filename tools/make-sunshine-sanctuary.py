#!/usr/bin/env python3
"""Build the Sunshine Sanctuary for Sick Dragons: its yard, its sections and its credits, from data/sunshine-sanctuary.json.

ONE DATA FILE, ONE TOOL, TWO SURFACES, the contract make-yells.py set. A room
behind Widdershins, in the city over the bridge (Ryan's ask, 2026-11-04:
subrooms of Widdershins inspired by places in the Discworld novels). Lady
Sybil Ramkin's sanctuary for small swamp dragons nobody else wanted, from
Terry Pratchett's Guards! Guards! (1989). This tool writes, between ssd:<part>
markers in sunshine-sanctuary.html:

  · THE YARD (ssd:yard-view): a walled yard of sand at noon, brick pens with
    doorways and no doors, a bucket of sand and a bucket of water at every
    doorway, chimney stacks over the wall breathing smoke into the sky, a sun
    the smoke has turned down to a pale disc, and small dragons on the sand,
    the pens and the roofs, some with a breath of flame and some asleep.
  · EVERY SECTION (ssd:lede, ssd:home, ssd:sick, ssd:kept), what is in the
    yard (ssd:yard), what is not (ssd:rules), next door (ssd:elsewhere) and
    the credits (ssd:credits), with a table of the quotations in
    liner-notes.html (sunshine-sanctuary-credits).

THE LIGHT IS A SUN YOU CAN LOOK AT. The city's smoke has turned the noon sun
down to a pale disc, and the whole smoky sky lights the yard at once, so
nothing throws more than a soft shadow round its own feet; and the brightest
things in the yard are the dragons' flames, which light nothing. The tool reads
--ssd-sun and --ssd-flame off love.css and refuses a sun as bright as a flame:
the day the sun outshines a dragon, the room has become any sunny yard.

WHAT IT REFUSES, and the first four are the room:

  · ADOPTION. This is a sanctuary and not a shelter: nobody here waits to be
    picked, and nobody leaves to make room. Adopting, rehoming, a forever home
    and a waiting list are refused in our words, with the negation window, so
    the room can say it does none of them. Rescue A Cat, A Dog and Small
    Animals are the street's shelters, and they are not this.
  · CHARITY. A charity, a donation, a sponsor, gratitude, the needy, the less
    fortunate, a good deed: the sanctuary story that is really about the kind
    person who keeps it. Swept with the negation window.
  · PITY, INSPIRATION AND THE CURE, Laughingstock's rule and Widdershins'.
    The word on the sign is sick and the yard keeps it; nobody is put right in
    order to leave.
  · A COUNT OF DRAGONS, and a DIAGNOSIS or a RANKING (make-widdershins.py's).
  · A FAN WIKI, A FAN SITE, AN <img>, A FORM, AN INPUT OR ANYTHING EDITABLE
    outside the job marker, and any script but love.js and quest.js.
  · A QUOTATION over the cap, with no author, carrying an HTML entity, read off
    anything but a page in `pages`, or, where the copy it was read on is on
    the machine, not there word for word: the Knowledge System mirror for
    stimpunks.org and Star Stuff's own repository for starstuff.earth. NO LINE
    OF THE BOOK IS QUOTED, because neither prints one about the sanctuary and
    nothing here is quoted from memory; the tool refuses a quotation whose
    `who` is Terry Pratchett.
  · A KEYFRAME, AN ANIMATION, A TRANSITION or A HARD SHADOW (a box-shadow
    with an offset and no blur) in §145. Nothing moves, and nothing in the
    yard throws a hard shadow, at any setting.
  · A MISSING MARKER PAIR.
"""
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data/sunshine-sanctuary.json"
ROOM = ROOT / "sunshine-sanctuary.html"
NOTES = ROOT / "liner-notes.html"
CSS = ROOT / "love.css"
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
RANKING = (r"best (?:book|books|character|characters|of the|dragon)|greatest|favourite|favorite|"
           r"top (?:ten|five|\d+)|ranked|ranking|must[- ]reads?|the definitive")
PITY = (r"suffer\w*|brave\w*|courag\w+|inspir(?:ing|ational|ation to)|overcom\w+|"
        r"battl\w+ (?:with|against)|cur(?:e|ed|es|ing)\b|fix(?:ed|es|ing)?\b|wheelchair[- ]bound|"
        r"poor (?:thing|things|little|dragon|dragons)|heartbreak\w*|tragic\w*")
ADOPTION = r"adopt\w*|rehom\w*|forever homes?|waiting list|up for grabs|pick of the litter"
CHARITY = (r"charit\w+|donat\w+|sponsor\w*|grateful|gratitude|the needy|in need\b|less fortunate|"
           r"good deeds?|benefactor\w*|saviou?r\w*")
COUNT = (r"\b\d+\s+(?:\w+\s+)?dragons?\b|\b(?:two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|"
         r"dozens?|hundreds?|scores?)\s+(?:\w+\s+)?dragons\b|how many dragons")

SWEEPS = [
    (DIAGNOSIS, "nobody in the yard, on the Disc or off it, is diagnosed here."),
    (RANKING, "nothing in this yard is put in order."),
    (PITY, "nobody here is pitied, an inspiration or cured. The word on the sign is sick, and the yard keeps it."),
    (ADOPTION, "this is a sanctuary and not a shelter: nobody here waits to be picked. See not_here."),
    (CHARITY, "nobody here is anybody's good deed, and nobody owes a thank-you for being let in."),
    (COUNT, "how many dragons sleep in the yard is written down nowhere."),
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


def lum(h):
    h = h.lstrip("#")
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    c = [x / 12.92 if x <= 0.03928 else ((x + 0.055) / 1.055) ** 2.4 for x in c]
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]


# ── The data ─────────────────────────────────────────────────────────────────
d = json.loads(DATA.read_text())
pages = d.get("pages") or {}
quotes = d.get("quotes") or {}
sections = d.get("sections") or {}
yard = d.get("yard") or []
cap = int(d.get("words") or 0)
if not cap:
    refuse("data/sunshine-sanctuary.json has no `words` cap, and the room prints one.")

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
    if "pratchett" in str(q.get("who", "")).lower() or q.get("read_by"):
        refuse(f"{where}: a line of the book. Neither Star Stuff nor any page of ours prints one about the "
               "sanctuary, and nothing here is quoted from memory.")
    src = pages.get(q.get("read_on"))
    if not src:
        refuse(f"{where}: `read_on` is not one of `pages`.")
        continue
    if q.get("who") not in ("Stimpunks", "Star Stuff"):
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
        else:
            refuse(f"{where}: a block is a q or a p, and this is neither.")
for qid in quotes:
    if qid not in used:
        refuse(f"quote {qid}: in the data and on no section, so its credit would claim a line the room does not print.")

if not yard:
    refuse("yard: empty.")
for listname, rows in (("yard", yard), ("not_here", d.get("not_here") or [])):
    for i, r in enumerate(rows, 1):
        for need in ("name", "line"):
            if not str(r.get(need, "")).strip():
                refuse(f"{listname} {i}: no {need}.")
        for field in ("name", "line"):
            ours(r.get(field, ""), f"{listname} {i} ({field})")

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

# THE LIGHT: the sun is a disc you can look at, and every dragon's flame is
# brighter than it.
css_text = CSS.read_text()
inks = dict(re.findall(r"(--ssd-[\w-]+)\s*:\s*(#[0-9A-Fa-f]{6})\b", css_text))
for need in ("--ssd-sun", "--ssd-flame"):
    if need not in inks:
        refuse(f"love.css declares no {need}, and the yard is drawn in it.")
if "--ssd-sun" in inks and "--ssd-flame" in inks and lum(inks["--ssd-sun"]) >= lum(inks["--ssd-flame"]):
    refuse("love.css: --ssd-sun is as bright as --ssd-flame. The smoke has turned the sun down, and the brightest "
           "things in the yard are the dragons: darken the sun, never brighten it.")

if problems:
    raise SystemExit("REFUSING to build the Sunshine Sanctuary:\n  " + "\n  ".join(problems))


# ── The yard ─────────────────────────────────────────────────────────────────
W, H = 1200, 420
WALL_TOP, WALL_FOOT = 186, 262


def n(v):
    return f"{v:.1f}".rstrip("0").rstrip(".")


def shadow(cx, cy, rx, ry=None):
    """A soft shadow round a thing's own feet: the light is the whole smoky
    sky, so it is spread and faint, and never falls to one side."""
    return (f'<ellipse cx="{n(cx)}" cy="{n(cy)}" rx="{n(rx)}" ry="{n(ry or rx * .22)}" '
            f'fill="var(--ssd-shade)" fill-opacity=".75" filter="url(#ssd-soft)"/>')


def flame(x, y, s, face):
    """A breath of flame out of a dragon's nostrils, pointing the way it faces:
    the brightest thing in the yard, and it lights nothing."""
    k = s * face
    return (f'<path d="M{n(x)} {n(y)} C{n(x + 7 * k)} {n(y - 8 * s)} {n(x + 17 * k)} {n(y - 5 * s)} '
            f'{n(x + 22 * k)} {n(y - 1 * s)} C{n(x + 16 * k)} {n(y + 4 * s)} {n(x + 7 * k)} {n(y + 6 * s)} '
            f'{n(x)} {n(y)} Z" fill="var(--ssd-flame)" stroke="var(--ssd-soot)" stroke-width="{n(1.1 * s)}" '
            f'stroke-linejoin="round"/>'
            f'<path d="M{n(x + 2 * k)} {n(y)} C{n(x + 6 * k)} {n(y - 3 * s)} {n(x + 10 * k)} {n(y - 2 * s)} '
            f'{n(x + 12 * k)} {n(y)} C{n(x + 9 * k)} {n(y + 2 * s)} {n(x + 5 * k)} {n(y + 2 * s)} {n(x + 2 * k)} '
            f'{n(y)} Z" fill="var(--ssd-flame-2)"/>')


def dragon(x, y, s=1.0, face=1, breathe=True, ground=True):
    """A small swamp dragon, standing on its four short legs on the sand:
    nobody's in particular. Drawn facing right and turned by a mirror, never by
    a rotation; (x, y) is where its feet are."""
    body = (
        # the tail, curling up behind
        '<path d="M-24 -12 C-40 -10 -48 -2 -44 6 C-41 12 -33 11 -33 5" fill="none" stroke="var(--ssd-scale)" '
        'stroke-width="6" stroke-linecap="round"/>'
        '<path d="M-33 5 L-37 -1 L-28 1 Z" fill="var(--ssd-scale)" stroke="var(--ssd-soot)" stroke-width="1.2" '
        'stroke-linejoin="round"/>'
        # four short legs
        '<g stroke="var(--ssd-soot)" stroke-width="1.3" fill="var(--ssd-scale)">'
        '<rect x="-17" y="-8" width="6" height="9" rx="2"/><rect x="-7" y="-8" width="6" height="10" rx="2"/>'
        '<rect x="7" y="-8" width="6" height="9" rx="2"/><rect x="15" y="-8" width="6" height="10" rx="2"/></g>'
        # a round body, its belly lighter
        '<ellipse cx="0" cy="-16" rx="26" ry="14" fill="var(--ssd-scale)" stroke="var(--ssd-soot)" stroke-width="1.6"/>'
        '<path d="M-18 -9 C-8 -4 10 -4 20 -10" fill="none" stroke="var(--ssd-scale-2)" stroke-width="4" '
        'stroke-linecap="round"/>'
        # a small folded wing
        '<path d="M-10 -26 C-6 -44 12 -46 16 -30 C8 -34 2 -31 -10 -26 Z" fill="var(--ssd-scale-2)" '
        'stroke="var(--ssd-soot)" stroke-width="1.4" stroke-linejoin="round"/>'
        # the neck and a long head, a little up
        '<path d="M18 -22 C24 -30 28 -34 32 -36" fill="none" stroke="var(--ssd-scale)" stroke-width="9" '
        'stroke-linecap="round"/>'
        '<path d="M26 -42 C34 -46 44 -42 48 -36 C46 -32 38 -31 30 -32 C25 -33 23 -39 26 -42 Z" fill="var(--ssd-scale)" '
        'stroke="var(--ssd-soot)" stroke-width="1.5" stroke-linejoin="round"/>'
        '<path d="M29 -43 L27 -49 L33 -44 Z" fill="var(--ssd-scale-2)" stroke="var(--ssd-soot)" stroke-width="1"/>'
        '<circle cx="34" cy="-39" r="1.8" fill="var(--ssd-soot)"/>'
    )
    out = [shadow(x, y, 40 * s)] if ground else []
    turn = f"translate({n(x)} {n(y)}) scale({n(s * face)} {n(s)})"
    out.append(f'<g transform="{turn}">{body}</g>')
    if breathe:
        out.append(flame(x + 48 * s * face, y - 36 * s, s, face))
    return "".join(out)


def sleeper(x, y, s=1.0, face=1):
    """A dragon asleep on the sand, curled with its tail round its nose and a
    wisp of smoke going up from it. No flame: asleep, it lights nothing at all."""
    body = (
        '<ellipse cx="0" cy="-12" rx="25" ry="13" fill="var(--ssd-scale)" stroke="var(--ssd-soot)" stroke-width="1.6"/>'
        '<path d="M-14 -22 C-8 -34 8 -34 12 -22 C6 -25 -4 -25 -14 -22 Z" fill="var(--ssd-scale-2)" '
        'stroke="var(--ssd-soot)" stroke-width="1.3" stroke-linejoin="round"/>'
        '<path d="M-24 -8 C-30 2 -10 6 6 4 C14 3 20 0 22 -4" fill="none" stroke="var(--ssd-scale)" '
        'stroke-width="6" stroke-linecap="round"/>'
        '<path d="M18 -14 C26 -16 34 -12 34 -7 C32 -3 24 -3 18 -6 Z" fill="var(--ssd-scale)" stroke="var(--ssd-soot)" '
        'stroke-width="1.4" stroke-linejoin="round"/>'
        '<path d="M24 -11 q2 1.5 4 0" fill="none" stroke="var(--ssd-soot)" stroke-width="1.3" stroke-linecap="round"/>'
    )
    out = [shadow(x, y, 34 * s)]
    out.append(f'<g transform="translate({n(x)} {n(y)}) scale({n(s * face)} {n(s)})">{body}</g>')
    wx = x + 34 * s * face
    out.append(f'<path d="M{n(wx)} {n(y - 10 * s)} c{n(-4 * face)} -8 {n(6 * face)} -12 {n(2 * face)} -20 '
               f'c{n(-4 * face)} -8 {n(6 * face)} -12 {n(2 * face)} -20" fill="none" stroke="var(--ssd-murk)" '
               f'stroke-width="{n(3 * s)}" stroke-linecap="round" stroke-opacity=".8"/>')
    return "".join(out)


def bucket(x, y, top):
    """A bucket at a doorway: sand in one, and water in the other, which holds
    the smoky sky."""
    return (shadow(x, y, 16, 4)
            + f'<path d="M{x - 11} {y - 22} L{x - 8} {y} L{x + 8} {y} L{x + 11} {y - 22} Z" fill="var(--ssd-iron)" '
            f'stroke="var(--ssd-soot)" stroke-width="1.3" stroke-linejoin="round"/>'
            f'<ellipse cx="{x}" cy="{y - 22}" rx="11" ry="3.5" fill="var(--ssd-{top})" stroke="var(--ssd-soot)" '
            f'stroke-width="1.2"/>'
            f'<path d="M{x - 11} {y - 22} C{x - 10} {y - 34} {x + 10} {y - 34} {x + 11} {y - 22}" fill="none" '
            f'stroke="var(--ssd-soot)" stroke-width="1.3"/>')


def pen(cx, w, h):
    """A low brick pen against the wall, round-topped, with a doorway and no
    door, straw spilling out of it onto the sand."""
    base = 304
    left, right, top = cx - w / 2, cx + w / 2, base - h
    r = w / 2
    out = [shadow(cx, base + 2, w * .62, 9)]
    out.append(f'<path d="M{n(left)} {base} V{n(top + r * .55)} A{n(r)} {n(r * .55)} 0 0 1 {n(right)} '
               f'{n(top + r * .55)} V{base} Z" fill="var(--ssd-brick)" stroke="var(--ssd-soot)" stroke-width="1.6"/>')
    rows = []
    for yy in range(int(top + r * .55) + 10, base, 11):
        rows.append(f"M{n(left + 2)} {yy} H{n(right - 2)}")
    out.append(f'<path d="{" ".join(rows)}" stroke="var(--ssd-soot)" stroke-width=".8" stroke-opacity=".35"/>')
    dw, dh = w * .38, h * .58
    out.append(f'<path d="M{n(cx - dw / 2)} {base} V{n(base - dh + dw / 2)} A{n(dw / 2)} {n(dw / 2)} 0 0 1 '
               f'{n(cx + dw / 2)} {n(base - dh + dw / 2)} V{base} Z" fill="var(--ssd-soot)"/>')
    out.append(f'<path d="M{n(cx - dw / 2 - 6)} {base} q{n(dw * .3)} -7 {n(dw * .55)} -3 q{n(dw * .35)} -6 '
               f'{n(dw * .55 + 12)} 3 Z" fill="var(--ssd-straw)" stroke="var(--ssd-soot)" stroke-width="1" '
               f'stroke-linejoin="round"/>')
    return "".join(out)


parts = [
    '<defs><filter id="ssd-soft" x="-30%" y="-200%" width="160%" height="500%">'
    '<feGaussianBlur stdDeviation="5"/></filter></defs>',
    # THE SKY, all smoke, lighter down by the wall where the haze is thickest.
    f'<rect width="{W}" height="{H}" fill="var(--ssd-smog)"/>',
    f'<rect y="104" width="{W}" height="{WALL_TOP - 104 + 4}" fill="var(--ssd-haze)" fill-opacity=".55"/>',
    # THE SUN, a pale disc you can look straight at, no rays, a little haze
    # round it. It is not the brightest thing in the yard.
    '<circle cx="852" cy="92" r="62" fill="var(--ssd-haze)" fill-opacity=".35"/>',
    '<circle cx="852" cy="92" r="31" fill="var(--ssd-sun)" stroke="var(--ssd-flame-2)" stroke-width="1.6" '
    'stroke-opacity=".7"/>',
]
# THE CITY OVER THE WALL is only its chimneys, breathing smoke into the sky.
for i, (cx, h, w) in enumerate(((120, 70, 22), (232, 96, 26), (402, 58, 20), (574, 84, 24),
                                 (716, 64, 18), (1004, 92, 26), (1120, 66, 22))):
    parts.append(f'<rect x="{cx - w / 2}" y="{WALL_TOP - h}" width="{w}" height="{h}" fill="var(--ssd-murk)"/>'
                 f'<rect x="{cx - w / 2 - 3}" y="{WALL_TOP - h}" width="{w + 6}" height="6" fill="var(--ssd-murk)"/>')
    puffs = "".join(f'<circle cx="{n(cx + 14 * k + (k % 2) * 6)}" cy="{n(WALL_TOP - h - 12 - 15 * k)}" '
                    f'r="{n(8 + 4 * k)}"/>' for k in range(4))
    parts.append(f'<g fill="var(--ssd-murk)" fill-opacity="{n(.5 - .05 * (i % 3))}">{puffs}</g>')
# THE WALL, brick, with its coping, and the gate standing open on the left.
parts.append(f'<rect y="{WALL_TOP}" width="{W}" height="{WALL_FOOT - WALL_TOP}" fill="var(--ssd-brick)" '
             f'stroke="var(--ssd-soot)" stroke-width="1.6"/>')
parts.append(f'<rect y="{WALL_TOP - 7}" width="{W}" height="9" fill="var(--ssd-soot-2)" stroke="var(--ssd-soot)" '
             f'stroke-width="1.2"/>')
courses = []
for j, yy in enumerate(range(WALL_TOP + 12, WALL_FOOT, 12)):
    courses.append(f"M0 {yy} H{W}")
    for xx in range(14 + (j % 2) * 18, W, 36):
        courses.append(f"M{xx} {yy - 12} V{yy}")
parts.append(f'<path d="{" ".join(courses)}" stroke="var(--ssd-soot)" stroke-width=".8" stroke-opacity=".3"/>')
parts.append(f'<path d="M40 {WALL_FOOT} V{WALL_TOP + 20} A40 26 0 0 1 120 {WALL_TOP + 20} V{WALL_FOOT} Z" '
             f'fill="var(--ssd-haze)" stroke="var(--ssd-soot)" stroke-width="1.8"/>')
parts.append(f'<path d="M120 {WALL_FOOT} L156 {WALL_FOOT + 10} V{WALL_TOP + 26} L120 {WALL_TOP + 20}" '
             f'fill="none" stroke="var(--ssd-iron)" stroke-width="3"/>'
             + "".join(f'<path d="M{128 + 7 * k} {WALL_FOOT + 2 + 2.2 * k} V{WALL_TOP + 22 + 1.4 * k}" '
                       f'stroke="var(--ssd-iron)" stroke-width="2.2"/>' for k in range(4)))
# The board over the gate, its painted name too far off to read: lines, never
# letters, so the drawing carries no word.
parts.append(f'<rect x="28" y="{WALL_TOP - 30}" width="104" height="24" rx="3" fill="var(--ssd-sand)" '
             f'stroke="var(--ssd-soot)" stroke-width="1.6"/>'
             f'<path d="M38 {WALL_TOP - 22} H122 M44 {WALL_TOP - 14} H116" stroke="var(--ssd-brick)" stroke-width="3" '
             f'stroke-linecap="round" stroke-dasharray="9 4"/>')
# THE SAND, the whole floor.
parts.append(f'<rect y="{WALL_FOOT}" width="{W}" height="{H - WALL_FOOT}" fill="var(--ssd-sand)"/>')
parts.append(f'<path d="M0 {WALL_FOOT} H{W}" stroke="var(--ssd-soot)" stroke-width="1.6"/>')
ripples = "".join(f'<path d="M{x} {y} q14 -4 28 0"/>' for x, y in
                  ((210, 330), (330, 352), (620, 334), (760, 392), (980, 404), (1090, 346), (70, 404), (460, 410)))
parts.append(f'<g fill="none" stroke="var(--ssd-shade)" stroke-width="2" stroke-linecap="round">{ripples}</g>')
# THE PENS, each with buckets at its doorway.
for cx, w, h in ((300, 120, 74), (500, 130, 84), (700, 116, 70), (1010, 128, 80)):
    parts.append(pen(cx, w, h))
    parts.append(bucket(int(cx + w / 2 + 14), 312, "sand"))
    parts.append(bucket(int(cx + w / 2 + 40), 316, "haze"))
# THE DRAGONS, nobody's in particular: one looking out of a doorway, one up on
# a roof, the rest on the sand, awake with a breath of flame or asleep.
parts.append(dragon(486, 222, 1.0, -1, ground=False))   # up on the second pen's roof
parts.append(dragon(712, 304, .85, 1))           # in the third pen's doorway
parts.append(dragon(548, 382, 1.4, 1))
parts.append(dragon(906, 372, 1.45, -1))
parts.append(dragon(378, 404, .85, 1))           # a small one
parts.append(sleeper(190, 392, 1.35, 1))
parts.append(sleeper(1092, 404, 1.2, -1))
view = (f'  <svg class="ssd-yard" viewBox="0 0 {W} {H}" aria-hidden="true" focusable="false">'
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
    year = f', {esc(q["year"])}' if q.get("year") else ""
    at = f', {esc(q["page"])}' if q.get("page") else ""
    work = f'<a href="{attr(q["url"])}">{esc(q["work"])}</a>'
    note = f" {esc(q['note'])}" if q.get("note") else ""
    return f'{esc(q["who"])}, {work}{year}{at}, read on our {page_link} page.{note}'


def quote(qid):
    q = quotes[qid]
    return (f'    <blockquote class="ssd-quote">\n'
            f'      <p>{linked(q["text"])}</p>\n'
            f'      <footer class="ssd-quote__who">{source(q)}</footer>\n'
            f'    </blockquote>')


def section(name):
    out = []
    for b in sections[name]:
        if "q" in b:
            out.append(quote(b["q"]))
        else:
            out.append(f'    <p>{linked(b["p"])}</p>')
    return "\n".join(out)


swap(ROOM, "ssd:yard-view", view)
for name in sections:
    swap(ROOM, f"ssd:{name}", section(name), "    ")

cards = [f'      <li class="ssd-card">\n        <h3>{esc(r["name"])}</h3>\n        <p>{linked(r["line"])}</p>\n      </li>'
         for r in yard]
swap(ROOM, "ssd:yard", '    <ul class="ssd-cards">\n' + "\n".join(cards) + "\n    </ul>", "    ")

rules = [f'      <li class="ssd-card"><strong>{esc(r["name"])}</strong> {linked(r["line"])}</li>'
         for r in d["not_here"]]
swap(ROOM, "ssd:rules", '    <ul class="ssd-rules">\n' + "\n".join(rules) + "\n    </ul>", "    ")

nexts = [f'      <li><a href="{attr(e["page"])}">{esc(e["name"])}</a>, {linked(e["line"])}</li>'
         for e in d["elsewhere"]]
swap(ROOM, "ssd:elsewhere", '    <ul class="ssd-next">\n' + "\n".join(nexts) + "\n    </ul>", "    ")

faces = json.loads(FACES.read_text())["faces"]
display, text_face = faces["young-serif"], faces["alegreya"]
licence = lambda f: f["licence"].replace(" 1.1", "")
others = []
for q in quotes.values():
    if q["who"] not in ("Stimpunks", "Star Stuff") and q["who"] not in others:
        others.append(q["who"])
names = ", ".join(others[:-1]) + " and " + others[-1] if len(others) > 1 else "".join(others)
credits = [
    "      <li><strong>The Discworld is Terry Pratchett&rsquo;s</strong>, and so is the Sunshine Sanctuary for Sick "
    "Dragons, from <cite>Guards! Guards!</cite> (1989). No line of his is quoted here: neither Star Stuff nor any "
    "page of ours prints one about the sanctuary, and nothing here is quoted from memory. What this room says about "
    "the book is three plain facts, and everything else is ours. His estate has no involvement in this room, was not "
    "asked, and has not seen it. Discworld is a trade mark, and nothing here is offered as anything of theirs.</li>",
    "      <li><strong>The yard is ours</strong>, a walled yard of sand, brick pens and buckets anybody might draw, "
    "made as code by Claude, an AI model made by Anthropic, to Ryan&rsquo;s brief. The dragons in it are small and "
    "nobody&rsquo;s in particular: nobody from the book is drawn, not the lady whose sanctuary it is and not any "
    "dragon of hers. Nothing on this page calls an AI while you read it.</li>",
    "      <li><strong>One line is Star Stuff&rsquo;s</strong>, from "
    f'<a href="{attr(pages["atom"]["url"])}">No. 49, One Atom of Justice</a>, by Stimpunks and Helen Edgar&rsquo;s '
    "More Realms, under CC BY-SA 4.0 like this street.</li>",
    f"      <li><strong>Every other quotation belongs to whoever said it</strong> and is credited where it stands: "
    f"{esc(names)}, each read on our own pages. The words around them are ours, written for this room; nothing "
    "about the Disc was taken from a fan wiki.</li>",
    f"      <li>Every quotation in this room is {cap} words or fewer. Every one was read on {esc(d['read'])} on the "
    "page it names, and <code>tools/make-sunshine-sanctuary.py</code> checks each word for word against our copy of "
    "stimpunks.org and Star Stuff&rsquo;s own repository, whenever they are on the machine.</li>",
    f"      <li>The type is {esc(display['family'])}, by {esc(display['designer'])}, for the room&rsquo;s name and "
    f"headings, and {esc(text_face['family'])}, by {esc(text_face['designer'])}, for everything you read, both "
    f"under the {esc(licence(text_face))} and read off their own records. More in "
    '<a href="liner-notes.html#sunshine-sanctuary">the liner notes</a>.</li>',
]
swap(ROOM, "ssd:credits", '    <ul class="ssd-credits">\n' + "\n".join(credits) + "\n    </ul>", "    ")

notes = []
for qid, q in quotes.items():
    words = EM.sub(r"\1", q["text"])
    pg = pages[q["read_on"]]
    notes.append(f'      <tr><td>{esc(words)}</td><td>{esc(q["who"])}</td>'
                 f'<td><a href="{attr(pg["url"])}">{esc(pg["title"])}</a></td>'
                 f'<td>{len(q["text"].split())} words</td></tr>')
swap(NOTES, "sunshine-sanctuary-credits", "\n".join(notes), "      ")

# ── The published page, checked ──────────────────────────────────────────────
src = ROOM.read_text()
body = re.sub(r"<!-- quest:.*?:end -->", " ", src, flags=re.S)
body = re.sub(r"<!--.*?-->", " ", body, flags=re.S)

for tag in re.findall(r"<(form|input|textarea|select)\b", body, re.I):
    refuse(f"{ROOM.name}: a <{tag}> outside the job marker. Nothing in this yard takes anything from you.")
if re.search(r"contenteditable", body, re.I):
    refuse(f"{ROOM.name}: something editable outside the job marker.")
if re.search(r"<img\b", body, re.I):
    refuse(f"{ROOM.name}: an <img>. No cover, no character and no dragon of theirs; the yard is drawn here.")
if FANS.search(body):
    refuse(f"{ROOM.name}: links a fan wiki or fan site.")
for s in re.findall(r'<script\b[^>]*\bsrc="([^"]+)"', src):
    if s not in SCRIPTS:
        refuse(f"{ROOM.name}: loads {s}, and the room runs {', '.join(sorted(SCRIPTS))} and nothing else.")

sec = re.search(r"/\* §145 ── SUBROOM: The Sunshine Sanctuary.*?(?=/\* §1(?:4[6-9]|[5-9]\d) )", css_text, re.S)
if not sec:
    refuse("love.css has no §145 for the Sunshine Sanctuary before the next section.")
else:
    rules_css = re.sub(r"/\*.*?\*/", " ", sec.group(0), flags=re.S)
    if re.search(r"@keyframes|\banimation\s*:|\btransition\s*:", rules_css):
        refuse("love.css §145: a keyframe, an animation or a transition. Nothing in the yard moves at any setting.")
    for shad in re.findall(r"(?:box|text)-shadow\s*:\s*([^;]+);", rules_css):
        for one in re.split(r",(?![^(]*\))", shad):
            lens = re.findall(r"(-?[\d.]+)(?:px)?\b", re.sub(r"var\([^)]*\)", " ", one))
            if len(lens) >= 3 and (float(lens[0]) or float(lens[1])) and float(lens[2]) == 0:
                refuse(f"love.css §145: a hard shadow, {one.strip()!r}. The light is the whole smoky sky; "
                       "a shadow here is soft and round a thing's own feet.")

text = re.sub(r"<(script|style)\b.*?</\1>", " ", body, flags=re.S)
text = re.sub(r"<blockquote\b.*?</blockquote>", " ", text, flags=re.S)
text = re.sub(r"<svg\b.*?</svg>", " ", text, flags=re.S)
text = re.sub(r"<head\b.*?</head>", " ", text, flags=re.S)
text = html.unescape(fold(re.sub(r"<[^>]+>", " ", text)))
sweep(text, ROOM.name)
if problems:
    raise SystemExit("REFUSING, on the published page:\n  " + "\n  ".join(problems))

checked = [k for k, v in have.items() if v]
print(f"sunshine sanctuary: a walled yard under a sun you can look at, {len(yard)} things in it, "
      f"{len(quotes)} quotations in {ROOM.name}")
print("  quotations checked word for word against " + (", ".join(checked) if checked else "nothing on this machine"))
print("  nobody adopted out, nobody cured, nobody counted")
