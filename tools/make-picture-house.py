#!/usr/bin/env python3
"""Build The Lightbulb Picture House's two screens, its rack and the credits, from data/picture-house.json.

ONE DATA FILE, ONE TOOL, TWO SURFACES -- the contract make-yells.py set and
every generator here has kept since. Each screen is one of our own playlists put
on whole; the rack is a card for every film on Screen One; Screen Two gets a
credits line naming what is on it. The credits also go to liner-notes.html.

WHAT IT REFUSES, and the first two are the room:

  - BLUE, ANYWHERE IN THE ROOM'S PALETTE. A theater named for a lightbulb, in a
    neurodiversity room, lit blue, is Light It Up Blue: the campaign in which
    parent- and professional-led autism charities light landmarks blue every
    April, and which autistic people have spent years asking to be done some
    other way. This tool reads every --lph- colour declared in love.css's :root
    and every literal colour in the room's own section, and refuses any whose
    hue is blue or cyan. That is a stronger promise than a sentence on the page,
    because the page says NOTHING IN THIS BUILDING IS BLUE and a palette is the
    one place that sentence could quietly stop being true. The ornament over the
    screen is the gold infinity for the same reason: the rainbow one has blue in
    it.

  - THE VOCABULARY OF AWARENESS, IN OUR OWN VOICE. Puzzle pieces, lighting it
    up blue, autism awareness, cure, suffers from, high- and low-functioning,
    special needs, "person with autism". Every one is the language of the
    campaigns our own Acceptance entry quotes autistic people refusing. It is
    swept with the negation window, so the room can say that there is no puzzle
    piece in it, and it skips the one blockquote, the film titles and anything
    inside curly quotation marks, because those are other people talking -- and
    several of these films use person-first language about themselves, which is
    their call and not ours to sweep.

  - A FILM WITH NO `content` KEY. Every card says what is in a film BEFORE the
    press, beside the runtime, for the runtime's reason: a panic attack, a
    bullying scene, jokes about suicide or a sponsor segment are things
    somebody may want to know before they sit down. Null is a real answer and
    means somebody looked. A missing key means nobody did, and is refused.

  - A PRONOUN FOR A CREATOR ON THE RACK. Not one of these films' captions says
    what its maker's pronouns are, and a name tells you nobody's. He, she and
    their object forms are refused in the rack's fields; they are written round.

  - A FILM WITH NO RUNTIME, and A SCREEN THAT HAS ONE. make-club.py's pair, for
    its reason: a film has a length and a playlist we keep adding to does not.

  - A FILM WITH NO MAKERS, NO CHANNEL OR NO LINE OF OURS, and an `ours` link
    that is not one of our own pages. A card is an introduction, and an
    introduction that does not say who made the thing is crediting the shop.

  - A QUOTATION OVER THIRTY WORDS, or with no author, work or link.

  - AN ID THAT IS NOT A YOUTUBE ID, A LIST THAT IS NOT A PLAYLIST, OR A FRAME
    THIS SITE WILL NOT BUILD. The origins are READ out of love-embed.js.

  - AN HTML ENTITY IN ANY FIELD, and any missing marker pair.

WHAT IT DOES NOT CHECK, on purpose: whether the rack still matches the playlist.
That needs the network; the rack is a mirror and the room says so, with the
date. check-jukebox.py is what notices a film that has died.

EVERY FRAME ASKS FOR CAPTIONS (cc_load_policy=1). That was tested framed from a
page, on a single film and on a playlist, because loading an embed URL on its
own gives Error 153 for every video and proves nothing either way.
"""
import colorsys
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data/picture-house.json"
ROOM = ROOT / "lightbulb-picture-house.html"
NOTES = ROOT / "liner-notes.html"
CSS = ROOT / "love.css"

WORDS = 30
ID = re.compile(r"^[A-Za-z0-9_-]{11}$")
LIST = re.compile(r"^PL[A-Za-z0-9_-]{10,40}$")
RUNTIME = re.compile(r"^(?:\d+:)?[0-5]?\d:[0-5]\d$")
ENTITY = re.compile(r"&(?:[a-zA-Z][a-zA-Z0-9]{1,31}|#\d{1,6}|#x[0-9a-fA-F]{1,6});")
OURS = ("https://stimpunks.org/",)
EMBED = "https://www.youtube-nocookie.com/embed/"

NEGATION = (r"(?:no|not|nothing|never|neither|none|without|refuses?|refused|refusing|"
            r"cannot|does not|won't|will not|is not|are not|isn't|aren't|nobody|nor|"
            r"declin\w+)")
AWARENESS = (r"puzzle[- ]?pieces?|puzzle ribbons?|light(?:ing|s)? it up blue|autism awareness|"
             r"cur(?:e|es|ed|ing)\b|suffer(?:s|ed|ing)? from|(?:high|low)[- ]functioning|"
             r"special needs|afflicted|(?:person|people|child|children|individuals?|those) "
             r"with autism")
AW_RE = re.compile(rf"\b(?:{AWARENESS})", re.I)
AW_OK = re.compile(rf"\b{NEGATION}\b[^.]{{0,70}}?\b(?:{AWARENESS})", re.I)
PRONOUN = re.compile(r"\b(?:he|him|his|himself|she|her|hers|herself)\b", re.I)

problems = []


def origins():
    js = (ROOT / "love-embed.js").read_text()
    block = re.search(r"var ORIGINS = \[(.*?)\];", js, re.S)
    if not block:
        raise SystemExit("REFUSING: love-embed.js has no ORIGINS array, so this tool cannot "
                         "tell\nwhether a screen's frame points somewhere this site will build.")
    return tuple(re.findall(r"'(https://[^']+)'", block.group(1)))


def sweep(text, where):
    text = re.sub(r"“[^”]*”", " ", str(text))
    for m in AW_RE.finditer(text):
        window = text[max(0, m.start() - 80):m.end()]
        if AW_OK.search(window):
            continue
        problems.append(f"{where}: {m.group(0)!r} -- that is the vocabulary of the awareness "
                        "campaigns autistic people have been refusing for years. See the "
                        "docstring.")


def no_entity(v, where):
    if ENTITY.search(str(v)):
        problems.append(f"{where} carries an HTML entity; write the character.")


# ── No blue ──────────────────────────────────────────────────────────────────
def blue(hexstr):
    h = hexstr.lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    r, g, b = (int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
    hue, light, sat = colorsys.rgb_to_hls(r, g, b)
    return 170 <= hue * 360 <= 265 and sat > 0.12 and 0.06 < light < 0.97


css = CSS.read_text()
root = css[css.index(":root {"):css.index("\n}", css.index(":root {"))]
palette = dict(re.findall(r"(--lph-[a-z0-9-]+):\s*(#[0-9A-Fa-f]{3,6})\b", root))
if not palette:
    problems.append("love.css's :root declares no --lph- colours, so there is nothing to hold "
                    "to the no-blue rule and the room has no palette.")
for name, hexv in palette.items():
    if blue(hexv):
        problems.append(f"{name} is {hexv}, which is blue. Nothing in this building is blue; "
                        "see the docstring.")
sec = re.search(r"/\* §\d+ ── ROOM: The Lightbulb Picture House.*?(?=/\* §\d+ ── )", css, re.S)
if not sec:
    problems.append("love.css has no section for The Lightbulb Picture House.")
else:
    for hexv in re.findall(r"#[0-9A-Fa-f]{6}\b|#[0-9A-Fa-f]{3}\b", sec.group(0)):
        if blue(hexv):
            problems.append(f"the room's section in love.css paints {hexv}, which is blue.")
    for r_, g_, b_ in re.findall(r"rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)", sec.group(0)):
        hexv = "#%02x%02x%02x" % (int(r_), int(g_), int(b_))
        if blue(hexv):
            problems.append(f"the room's section in love.css paints rgb({r_}, {g_}, {b_}), which "
                            "is blue.")

# ── The data ─────────────────────────────────────────────────────────────────
d = json.loads(DATA.read_text())
screens = d.get("screens") or []
rack = d.get("rack") or []
two = d.get("screen_two") or []
aw = d.get("awareness") or {}
page_src = ROOM.read_text()

if len(str(aw.get("text", "")).split()) > WORDS:
    problems.append(f"the awareness quotation is over {WORDS} words.")
for need in ("text", "who", "work", "url", "via"):
    if not str(aw.get(need, "")).strip():
        problems.append(f"the awareness quotation has no {need}.")
    no_entity(aw.get(need, ""), f"the awareness quotation's {need}")

for sc in screens:
    where = f"screen {sc.get('id')!r}"
    if not LIST.match(str(sc.get("list", ""))):
        problems.append(f"{where}: {sc.get('list')!r} is not a playlist id.")
    if "runtime" in sc:
        problems.append(f"{where} carries a runtime. It is a list we keep adding to; see "
                        "make-club.py.")
    for f in ("name", "title", "note"):
        if not str(sc.get(f, "")).strip():
            problems.append(f"{where}: no {f}.")
        no_entity(sc.get(f, ""), f"{where} {f}")
    sweep(sc.get("note", ""), f"{where} note")
    if f"<!-- lph-screen:{sc.get('id')}:begin -->" not in page_src:
        problems.append(f"{where}: no markers in {ROOM.name}.")

ORIGINS = origins()
if not any(EMBED.startswith(o) for o in ORIGINS):
    problems.append(f"{EMBED} is not an origin love-embed.js will frame.")

if not rack:
    problems.append("the rack is empty.")
seen = set()
for i, f in enumerate(rack, 1):
    where = f"rack card {i} ({f.get('title', 'no title')!r})"
    if not ID.match(str(f.get("id", ""))):
        problems.append(f"{where}: {f.get('id')!r} is not a YouTube id.")
    if f.get("id") in seen:
        problems.append(f"{where}: the id is on the rack twice.")
    seen.add(f.get("id"))
    if not RUNTIME.match(str(f.get("runtime", ""))):
        problems.append(f"{where}: no runtime. Every press says how long before the press.")
    for need in ("title", "makers", "channel", "about"):
        if not str(f.get(need, "")).strip():
            problems.append(f"{where}: no {need}.")
    if "content" not in f:
        problems.append(f"{where}: no `content` key. Null means somebody looked and found "
                        "nothing to warn about; a missing key means nobody looked.")
    ours = f.get("ours")
    if ours is not None and not str(ours.get("url", "")).startswith(OURS):
        problems.append(f"{where}: `ours` points at {ours.get('url')!r}, which is not one of "
                        "our own pages.")
    for need in ("makers", "about", "content"):
        v = f.get(need) or ""
        no_entity(v, f"{where} {need}")
        m = PRONOUN.search(re.sub(r"“[^”]*”", " ", str(v)))
        if m:
            problems.append(f"{where} {need}: {m.group(0)!r}. No creator's pronouns are "
                            "stated in any of these films; write round them.")
        if need != "makers":
            sweep(v, f"{where} {need}")
    no_entity(f.get("title", ""), f"{where} title")

for i, f in enumerate(two, 1):
    where = f"screen two, film {i}"
    if not ID.match(str(f.get("id", ""))) or not RUNTIME.match(str(f.get("runtime", ""))) \
            or not str(f.get("channel", "")).strip() or not str(f.get("title", "")).strip():
        problems.append(f"{where}: every film named on Screen Two needs an id, a title, a "
                        "channel and a runtime.")
    for v in f.values():
        no_entity(v, where)

for m in ("lph-rack", "lph-awareness"):
    if f"<!-- {m}:begin -->" not in page_src:
        problems.append(f"{ROOM.name} has no {m} markers.")

if problems:
    raise SystemExit("REFUSING to build The Lightbulb Picture House:\n  " + "\n  ".join(problems))


# ── Writing ──────────────────────────────────────────────────────────────────
def swap(page, marker, block, indent=""):
    src = page.read_text()
    begin, end = f"<!-- {marker}:begin -->", f"<!-- {marker}:end -->"
    if begin not in src or end not in src:
        raise SystemExit(f"REFUSING: {page.name} has no {marker} markers.")
    page.write_text(re.sub(re.escape(begin) + r".*?" + re.escape(end),
                           lambda _m: begin + "\n" + block + "\n" + indent + end,
                           src, flags=re.S))


def esc(s):
    return html.escape(str(s), quote=False)


def attr(s):
    return html.escape(str(s), quote=True)


def film_src(vid):
    return f"{EMBED}{vid}?autoplay=1&rel=0&cc_load_policy=1"


def list_src(lst):
    return f"{EMBED}videoseries?list={lst}&autoplay=1&cc_load_policy=1"


swap(ROOM, "lph-awareness",
     f'    <blockquote class="lph-said">\n'
     f'      <p>{esc(aw["text"])}</p>\n'
     f'      <cite>{esc(aw["who"])}, <a href="{attr(aw["url"])}">{esc(aw["work"])}</a>, '
     f'as quoted in our <a href="{attr(aw["via"])}">Acceptance</a> entry</cite>\n'
     f'    </blockquote>', "")

for sc in screens:
    extra = ""
    if sc["id"] == "two" and two:
        items = []
        for f in two:
            who = f' with {esc(f["who"])}' if f.get("who") else ""
            items.append(f'<li><span class="lph-two__t">{esc(f["title"])}</span>{who} '
                         f'&middot; {esc(f["channel"])} &middot; {esc(f["runtime"])}</li>')
        extra = ('\n    <p class="lph-two__h">On this screen, in the order it plays:</p>\n'
                 '    <ul class="lph-two">\n      ' + "\n      ".join(items) + '\n    </ul>')
    swap(ROOM, f"lph-screen:{sc['id']}",
         f'    <h2 id="lph-screen-{sc["id"]}-h"><span class="lph-screen__num">{esc(sc["name"])}</span> '
         f'{esc(sc["title"])}</h2>\n'
         f'    <p class="lph-screen__note">{esc(sc["note"])}</p>\n'
         f'    <div class="lph-proscenium">\n'
         f'      <button type="button" class="facade" data-embed-src="{attr(list_src(sc["list"]))}" '
         f'data-embed-title="{attr(sc["title"])}, on YouTube">\n'
         f'        Start the programme &mdash; runs until you stop it, captions on\n'
         f'        <span class="facade__play">&#9654; PRESS PLAY</span>\n'
         f'      </button>\n'
         f'    </div>\n'
         f'    <p class="lph-screen__credit">No runtime on a whole screen: it is a playlist we '
         f'keep adding to, and a total would be wrong the next time it changed. '
         f'<a href="https://www.youtube.com/playlist?list={attr(sc["list"])}">{esc(sc["title"])}</a>, '
         f'on YouTube, from our own channel.</p>{extra}', "")

cards = []
for n, f in enumerate(rack, 1):
    content = (f'\n        <p class="lph-card__content"><span class="lph-card__label">Before you '
               f'press:</span> {esc(f["content"])}</p>') if f.get("content") else ""
    ours = (f'\n        <p class="lph-card__ours"><a href="{attr(f["ours"]["url"])}">'
            f'{esc(f["ours"]["name"])} &rarr;</a></p>') if f.get("ours") else ""
    cards.append(
        f'      <li class="lph-card" id="film-{attr(f["id"])}">\n'
        f'        <p class="lph-card__n" aria-hidden="true">{n:02d}</p>\n'
        f'        <h3 class="lph-card__title">{esc(f["title"])}</h3>\n'
        f'        <p class="lph-card__makers">{esc(f["makers"])}</p>\n'
        f'        <p class="lph-card__about">{esc(f["about"])}</p>{content}\n'
        f'        <button type="button" class="facade" data-embed-src="{attr(film_src(f["id"]))}" '
        f'data-embed-title="{attr(f["title"])}, {attr(f["channel"])}">\n'
        f'          Play &mdash; {esc(f["runtime"])}\n'
        f'          <span class="facade__play">&#9654; PRESS PLAY</span>\n'
        f'        </button>\n'
        f'        <p class="lph-card__credit">{esc(f["runtime"])} &middot; on YouTube, via '
        f'{esc(f["channel"])}</p>{ours}\n'
        f'      </li>')
swap(ROOM, "lph-rack",
     '    <ol class="lph-rack">\n' + "\n".join(cards) + '\n    </ol>\n'
     f'    <p class="lph-from">Carded from the playlist on {esc(d["_checked"])}, in its own order. '
     f'The playlist is ours and we keep adding to it, so Screen One may be showing a film by now '
     f'that the rack has no card for yet.</p>', "")

rows = [f'      <tr><td>{esc(f["title"])}</td><td><strong>{esc(f["makers"])}</strong></td>'
        f'<td>{esc(f["channel"])}</td><td>{esc(f["runtime"])}</td></tr>' for f in rack]
rows += [f'      <tr><td>{esc(f["title"])}</td><td><strong>{esc(f.get("who") or f["channel"])}'
         f'</strong></td><td>{esc(f["channel"])}</td><td>{esc(f["runtime"])}</td></tr>' for f in two]
swap(NOTES, "picture-house-credits", "\n".join(rows), "      ")

# ── The page's own copy, swept ───────────────────────────────────────────────
page = ROOM.read_text()
page = re.sub(r"<!-- quest:.*?:end -->", " ", page, flags=re.S)
page = re.sub(r"<!--.*?-->", " ", page, flags=re.S)
page = re.sub(r"<(script|style|svg|head)\b.*?</\1>", " ", page, flags=re.S)
page = re.sub(r"<blockquote\b.*?</blockquote>", " ", page, flags=re.S)
page = re.sub(r'<h[23][^>]*>.*?</h[23]>', " ", page, flags=re.S)
page = re.sub(r'<span class="lph-two__t">.*?</span>', " ", page, flags=re.S)
page = re.sub(r"<[^>]+>", " ", page)
page = html.unescape(re.sub(r"\s+", " ", page))
before = len(problems)
sweep(page, ROOM.name)
if len(problems) > before:
    raise SystemExit("REFUSING, on the published page:\n  " + "\n  ".join(problems[before:]))

warned = sum(1 for f in rack if f.get("content"))
print(f"picture house: {len(screens)} screens and {len(rack)} cards on the rack, in {ROOM.name}")
print(f"  {warned} cards say something before the press besides the runtime; "
      f"{len(palette)} colours in the palette and none of them blue")
print(f"  {len(rows)} credit rows in {NOTES.name}")
