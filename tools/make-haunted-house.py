#!/usr/bin/env python3
"""Build The Haunted House's set, its hunt, its list, its lore and its credits, from data/haunted-house.json.

ONE DATA FILE, ONE TOOL, TWO SURFACES, the contract make-yells.py set. The room
is turning 09 off The Outskirts: an empty warehouse at the end of the road with
a haunted house built inside it out of plywood flats, and the work lights left on
behind the set. Somebody in our community asked for it in the Sandbox's
suggestion box (2026-10-27): a place to share haunted things we made and love,
with one way through that hides them like a scavenger hunt and one where
everything is easy to scroll. Ryan's brief, 2026-10-28, added the history and
lore of Halloween and haunted houses, and the eldritch, the weird, the different
and the marginal. This tool writes, between hh:<part> markers in
haunted-house.html:

  · THE SET (hh:set): the front of the house in the dark warehouse, built of
    flats, and the light of the work lights behind it coming through the seams,
    under the door and between the boards over the windows. Lifted by make-og.py.
  · THE HUNT (hh:hunt): every room of the house, every place in it as a button
    that names where it looks, and the way out of every room.
  · THE LIST (hh:list): every thing in the house with the lights up, the one
    copy of each; haunted-house.js clones from it into the hunt, so a place and
    the list cannot disagree about what is hidden there.
  · EVERY SECTION (hh:lede, hh:veil, hh:history, hh:made, hh:weird, hh:rest),
    WHAT IS NOT IN THIS HOUSE (hh:rules), BRINGING SOMETHING (hh:bring), WHO READS
    THE CHANNEL (hh:channel), NEXT DOOR (hh:elsewhere) and THE CREDITS
    (hh:credits), with a table of the quotations in liner-notes.html.

THE LIGHT IS THE WORK LIGHTS BEHIND THE SET, AND IT LIGHTS NOTHING. Every line of
it in the drawing is a seam, a gap or a crack: a threshold with the light on the
other side. The veil is thin because the set is plywood. So the drawing refuses
light anywhere but on a seam (`SEAMS` below are the only places --hh-seam is
drawn), and no word is ever set in it.

WHAT IT REFUSES, and the first four are the house:

  · THE ASYLUM. Asylum, insane, lunatic, psycho, madhouse, crazy, straitjacket,
    padded cell and their kin, in the room's own words. The haunted asylum is the
    oldest cheap scare in the business, and the people it makes into monsters are
    ours: Black Leather Lagoon's refusal of the Napa joke, as a whole house.
  · THE FREAK SHOW'S WORDS for a person or a body: freaks, freakish, deformed,
    mutant, abomination, monstrous, and calling anybody a monster. Chimera
    Obscura's rule. The room may name the freak show to say what it did.
  · A JUMP SCARE, AND A SCARE YOU CANNOT LEAVE. Jump scares, things that leap or
    jump out, the chicken exit, no way out, no escape. The house says nothing
    jumps out and every room has its way out, and both are sentences on the page.
  · A COUNT. Scores, points, streaks, found 3, 3 of 12, how many are left. The
    friendly edit to a scavenger hunt is "you have found 4 of 12", which is the
    Mission's progress bar in a cobweb.

  Each is swept in the room's own words with the negation window, anchored to the
  word it excuses (A Quiet Pint's fix), so the room can still say nothing jumps
  out and nobody is the monster. The sweep SKIPS BLOCKQUOTES.

  · A THING WITH NO PLACE, TWO THINGS IN ONE PLACE, A ROOM OF THE HOUSE WITH
    NOTHING IN IT, a place with no words on its button, and two places with the
    same words.
  · A THING ON THE STREET WHOSE PAGE IS GONE OR UNLISTED (a quiet room is never a
    thing, because the list would name its address), a page of ours the mirror
    does not have at that address, a thing from somebody in our community with no
    `given` day and no `said_yes`, and A PICTURE that is not public domain with a
    page saying so, has no alt text, or no file.
  · A QUOTATION over the cap, with no `who`, from no source, with an HTML entity,
    or, from a page of ours, not on that page word for word where the Knowledge
    System mirror is on the machine.
  · A SCRIPT THAT KEEPS, SENDS, SOUNDS, MOVES OR COUNTS. haunted-house.js may not
    touch storage, the network, audio, a timer, an animation frame, innerHTML or
    `.length`; the page may load love.js, quest.js and it, and nothing else; and
    the page may not carry a form, an audio or video element, a facade or
    autoplay outside the job marker.
  · A KEYFRAME, AN ANIMATION OR A TRANSITION in §132. Nothing in the house moves at
    any setting, MAX GLITTER included, and nothing flickers: the work lights are
    on, steadily, behind the set.
  · A MISSING MARKER PAIR.

WHAT IT DOES NOT CHECK, on purpose: how many things are in the house. It is as
full as people make it.
"""
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data/haunted-house.json"
ROOM = ROOT / "haunted-house.html"
NOTES = ROOT / "liner-notes.html"
CSS = ROOT / "love.css"
LIB = ROOT / "netlify/cb/lib.mjs"
SCRIPT = ROOT / "haunted-house.js"
FACES = ROOT / "data/foundry-faces.json"
MIRROR = Path.home() / "Documents/Claude/Projects/Stimpunks Knowledge System/site/stimpunks.org"

ENTITY = re.compile(r"&(?:[a-zA-Z][a-zA-Z0-9]{1,31}|#\d{1,6}|#x[0-9a-fA-F]{1,6});")
LINK = re.compile(r"\[([^\]]+)\]\(([^)\s]+)\)")
BOLD = re.compile(r"\*\*([^*]+)\*\*")
ITAL = re.compile(r"(?<![*\w])\*([^*]+)\*(?![*\w])")

NEGATION = (r"(?:no|not|nothing|never|neither|none|without|refuses?|refused|refusing|"
            r"cannot|does not|won't|will not|is not|are not|isn't|aren't|nobody|nor|declin\w+)")

ASYLUM = (r"asylums?|insane|insanity|lunatics?|lunacy|psychos?\b|psychotic|madhouses?|madm[ae]n|"
          r"crazy|crazies|mental patients?|straitjackets?|padded cells?|escaped patients?|"
          r"nut ?houses?|loony|loonies|deranged|maniacs?|madness")
FREAK = (r"freaks\b|freak\b(?! show)|freakish|deformed|deformit\w*|mutants?|abominations?|monstrous|"
         r"(?:is|are|was|were|be|being|been) (?:a |the )?monsters?\b")
JUMP = (r"jump[- ]?scares?|leaps? out|jumps? out|chicken exits?|no way out|no escape|"
        r"can(?:not|'t|’t) (?:get out|leave)|trapped in here")
TALLY = (r"scores?|scored|scoring|\d+\s*points?|points?\s+(?:for|per|each|awarded|earned|available)|"
         r"streaks?|leaderboards?|high[- ]score|tall(?:y|ies)|tallied|progress bar|"
         r"found \d+|\d+ (?:of|out of) \d+|how many (?:things )?(?:are )?(?:left|to go)|all \d+ things")

SWEEPS = [
    (ASYLUM, "nobody's mind is the scare in this house. See _things and the house rules."),
    (FREAK, "nobody's body is the scare in this house, and nobody is called a monster. Chimera Obscura's rule."),
    (JUMP, "nothing jumps out and every room has its way out, which are sentences on the page."),
    (TALLY, "nothing in the house is counted, least of all what is left to find."),
]
SWEEPS = [(re.compile(rf"\b(?:{p})", re.I),
           re.compile(rf"\b{NEGATION}\b[^.]{{0,70}}?$", re.I), why) for p, why in SWEEPS]

SCRIPTS = {"love.js", "quest.js", "haunted-house.js"}
JS_REFUSED = [
    (r"localStorage|sessionStorage|indexedDB|document\.cookie", "keeps something"),
    (r"\bfetch\s*\(|XMLHttpRequest|sendBeacon|EventSource|WebSocket", "sends something"),
    (r"AudioContext|new\s+Audio|\.play\s*\(|speechSynthesis", "makes a sound"),
    (r"setTimeout|setInterval|requestAnimationFrame|\.animate\s*\(", "moves or waits on a clock"),
    (r"innerHTML|outerHTML|insertAdjacentHTML|document\.write", "writes markup from a string"),
    (r"\.length\b", "can count"),
]

problems = []


def refuse(msg):
    problems.append(msg)


def esc(s):
    return html.escape(str(s), quote=False)


def attr(s):
    return html.escape(str(s), quote=True)


def fold(s):
    return re.sub(r"\s+", " ", str(s)).strip()


def plain_md(s):
    s = re.sub(r"!\[[^\]]*\]\([^)]*\)", " ", s)
    s = re.sub(r"\[\d+\]\(#[^)]*\)", "", s)
    s = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", s)
    s = s.replace("**", "").replace("*", "")
    s = re.sub(r"^\s*>\s?", "", s, flags=re.M)
    s = re.sub(r"^\s*-\s+", "", s, flags=re.M)
    return fold(s)


def sweep(text, where):
    text = str(text)
    for rx, ok, why in SWEEPS:
        for m in rx.finditer(text):
            # The window is anchored to the word it excuses: a negation in the
            # same sentence, before it. Not the sentence after.
            start = text.rfind(".", 0, m.start()) + 1
            if ok.search(text[max(start, m.start() - 80):m.start()]):
                continue
            refuse(f"{where}: {m.group(0)!r} -- {why}")


def ours(text, where):
    text = str(text)
    if ENTITY.search(text):
        refuse(f"{where}: carries an HTML entity. Everything is escaped on the way in; write the character.")
    if text.count("\n") >= 2:
        refuse(f"{where}: shaped like verse, several hand-broken lines. No lyric here.")
    for _, url in LINK.findall(text):
        if not (url.startswith("https://") or re.match(r"^[a-z0-9-]+\.html(?:#[\w/=-]*)?$", url)):
            refuse(f"{where}: {url!r} is neither an https address nor a page of ours.")
        elif not url.startswith("https://") and not (ROOT / url.split("#")[0]).is_file():
            refuse(f"{where}: {url!r} is no page on the street.")
    sweep(ITAL.sub(r"\1", BOLD.sub(r"\1", LINK.sub(r"\1", text))), where)


def linked(text):
    out = BOLD.sub(r"<b>\1</b>", esc(text))
    out = ITAL.sub(r"<i>\1</i>", out)
    return LINK.sub(lambda m: f'<a href="{attr(html.unescape(m.group(2)))}">{m.group(1)}</a>', out)


# ── The data ─────────────────────────────────────────────────────────────────
d = json.loads(DATA.read_text())
sources = d.get("sources") or {}
quotes = d.get("quotes") or {}
sections = d.get("sections") or {}
rooms = d.get("rooms") or []
things = d.get("things") or []
cap = int(d.get("words") or 0)
if not cap:
    refuse("data/haunted-house.json has no `words` cap, and the room prints one.")

mirror_ok = MIRROR.is_dir()
mirror_text = {}
for key, s in sources.items():
    kind = s.get("kind")
    if kind not in ("mirror", "web", "brief"):
        refuse(f"sources.{key}: kind {kind!r} is none of mirror, web or brief.")
        continue
    if not str(s.get("title", "")).strip():
        refuse(f"sources.{key}: no title.")
    if kind in ("mirror", "web") and not str(s.get("url", "")).startswith("https://"):
        refuse(f"sources.{key}: no https address.")
    if kind == "web" and not (s.get("who") and s.get("where")):
        refuse(f"sources.{key}: somebody else's page with no `who` or no `where`.")
    if kind == "brief" and not s.get("who"):
        refuse(f"sources.{key}: a brief is somebody's; name them.")
    if kind == "mirror":
        if not s["url"].startswith("https://stimpunks.org/") or not s["url"].endswith("/"):
            refuse(f"sources.{key}: {s['url']!r} is not one of our pages, with its trailing slash.")
        if mirror_ok:
            f = MIRROR / s.get("mirror", "")
            if not f.is_file():
                refuse(f"sources.{key}: the mirror has no {s.get('mirror')}.")
                continue
            raw = f.read_text()
            m = re.search(r'^url:\s*"([^"]+)"', raw, re.M)
            if not m or m.group(1) != s["url"]:
                refuse(f"sources.{key}: {s['mirror']} in the mirror is {m.group(1) if m else 'no page'}, not {s['url']}.")
            mirror_text[key] = plain_md(raw.split("\n---", 1)[-1])

used = set()
for qid, q in quotes.items():
    where = f"quote {qid}"
    text = str(q.get("text", ""))
    n = len(text.split())
    if not n:
        refuse(f"{where}: no text.")
    if n > cap:
        refuse(f"{where}: {n} words against a cap of {cap}. It is printed in the room; raise it in the data on "
               "purpose, with the reason, or quote less.")
    if not str(q.get("who", "")).strip():
        refuse(f"{where}: no `who`. Every line here names who said it.")
    if q.get("source") not in sources:
        refuse(f"{where}: `source` is not one of `sources`.")
        continue
    if str(q.get("work", "")).strip() and not str(q.get("url", "")).startswith("https://"):
        refuse(f"{where}: a work with no link to it.")
    if sources[q["source"]]["kind"] == "mirror" and q["who"] != "Stimpunks" and not q.get("work"):
        refuse(f"{where}: somebody else's words on our page with no work of theirs. Do not fill it from memory.")
    for field, v in q.items():
        if ENTITY.search(str(v)):
            refuse(f"{where}: {field} carries an HTML entity.")
    if mirror_ok and q["source"] in mirror_text and fold(text) not in mirror_text[q["source"]]:
        refuse(f"{where}: not on {sources[q['source']]['url']} word for word. Re-copy it from our page; never "
               "loosen the check.")

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
            refuse(f"{where}: a block is a q or a p.")
for qid in quotes:
    if qid not in used:
        refuse(f"quote {qid}: in the data and on no section, so its credit would claim a line the room does not print.")

# THE HOUSE: every thing in one place, every place one thing, every room something.
room_ids = [r.get("id") for r in rooms]
if len(set(room_ids)) != len(room_ids):
    refuse("rooms: two rooms of the house share an id.")
for r in rooms:
    ours(r.get("name", ""), f"room {r.get('id')}")
    ours(r.get("line", ""), f"room {r.get('id')}")
looks, ids = set(), set()
for t in things:
    where = f"thing {t.get('id')}"
    for need in ("id", "room", "look", "name", "kind", "whose", "line"):
        if not str(t.get(need, "")).strip():
            refuse(f"{where}: no {need}.")
    if t.get("id") in ids:
        refuse(f"{where}: two things share this id.")
    ids.add(t.get("id"))
    if t.get("room") not in room_ids:
        refuse(f"{where}: room {t.get('room')!r} is no room of the house.")
    look = fold(t.get("look", "")).lower()
    if look in looks:
        refuse(f"{where}: two places say {t.get('look')!r}, and a hunt needs to tell places apart by their words.")
    looks.add(look)
    for field in ("look", "name", "line"):
        ours(t.get(field, ""), f"{where} ({field})")
    kind = t.get("kind")
    url = str(t.get("url", ""))
    if kind == "room":
        p = ROOT / url
        if not re.match(r"^[a-z0-9-]+\.html$", url) or not p.is_file():
            refuse(f"{where}: {url!r} is no room on the street.")
        elif "data-unlisted" in p.read_text():
            refuse(f"{where}: {url} keeps to itself, and a thing in this list would name its address.")
    elif kind == "page":
        if not url.startswith("https://stimpunks.org/") or not url.endswith("/"):
            refuse(f"{where}: {url!r} is not one of our pages, with its trailing slash.")
        elif mirror_ok and not any(f'url: "{url}"' in f.read_text()
                                   for f in MIRROR.glob(f"**/{url.rstrip('/').rsplit('/', 1)[-1]}.md")):
            refuse(f"{where}: the mirror has no page at {url}.")
    elif kind == "picture":
        img, rights = t.get("image") or {}, t.get("rights") or {}
        if not (ROOT / str(img.get("src", ""))).is_file():
            refuse(f"{where}: no picture at {img.get('src')!r}.")
        if not str(img.get("alt", "")).strip() or not img.get("width") or not img.get("height"):
            refuse(f"{where}: a picture needs its alt text and its size.")
        if "public domain" not in str(rights.get("words", "")) or not str(rights.get("url", "")).startswith("https://"):
            refuse(f"{where}: a picture here is public domain, with a page that says so. Anything else goes in as "
                   "a link to it, with its maker's name.")
    elif kind == "link":
        if not url.startswith("https://"):
            refuse(f"{where}: a link with no https address.")
    elif kind == "made":
        if not (t.get("given") and t.get("said_yes")):
            refuse(f"{where}: something from our community goes in with the day its maker said yes and who said "
                   "it, and comes out the moment they ask.")
    else:
        refuse(f"{where}: kind {kind!r} is none of room, page, picture, link or made.")
for r in rooms:
    if not any(t.get("room") == r.get("id") for t in things):
        refuse(f"room {r.get('id')}: nothing hidden in it. Looking somewhere and finding nothing is a let-down this "
               "house does not hand out; put something there or take the room out.")

for i, r in enumerate(d.get("not_here") or [], 1):
    ours(r.get("name", ""), f"not_here {i}")
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

js = SCRIPT.read_text() if SCRIPT.is_file() else ""
if not js:
    refuse("haunted-house.js is missing, and the switch and the hunt are it.")
code = re.sub(r"/\*.*?\*/", " ", js, flags=re.S)
code = re.sub(r"(?<![:\\])//[^\n]*", " ", code)
for rx, what in JS_REFUSED:
    if re.search(rx, code):
        refuse(f"haunted-house.js {what} ({rx}). The house keeps nothing, sends nothing, makes no sound, moves "
               "nothing on a clock and counts nothing.")

if problems:
    raise SystemExit("REFUSING to build The Haunted House:\n  " + "\n  ".join(problems))

# ── The set ──────────────────────────────────────────────────────────────────
W, H = 1200, 420
L, R = 300, 900          # the house's front, six flats of 100
EAVE, BASE, APEX = 176, 372, 58
FLATS = list(range(L, R + 1, 100))
DOOR = (556, 262, 644, BASE)
WINDOWS = [(352, 204, 456, 300), (744, 204, 848, 300)]
ROUND = (600, 122, 26)


def num(v):
    return f"{v:.1f}".rstrip("0").rstrip(".")


SEAMS = []   # every line the work lights come through, and nowhere else


def seam(d_, w=2.2, into=None):
    """A line the work lights come through: a faint spread and a hard core.
    Seams between flats go in under the door and the windows (`into` parts);
    the light round the door and between the boards goes on top."""
    (SEAMS if into is None else into).append(
        f'<path d="{d_}" fill="none" stroke="var(--hh-seam)" stroke-width="{num(w * 4)}" stroke-opacity=".10" '
        f'stroke-linecap="round"/><path d="{d_}" fill="none" stroke="var(--hh-seam)" stroke-width="{num(w)}" '
        f'stroke-linecap="round"/>')


parts = [
    f'<rect x="0" y="0" width="{W}" height="{H}" fill="var(--hh-dark)"/>',
    # The warehouse: its steel columns at the edges, and its concrete floor.
    '<path d="M70 0 V372 M1130 0 V372" stroke="var(--hh-steel)" stroke-width="22"/>',
    '<path d="M0 34 H1200" stroke="var(--hh-steel)" stroke-width="10"/>',
    f'<rect x="0" y="{BASE}" width="{W}" height="{H - BASE}" fill="var(--hh-floor)"/>',
]
# The timber jacks that hold the set up, seen past both ends: a set does not
# hide that it is one.
for x, s in ((L, -1), (R, 1)):
    parts.append(f'<path d="M{x} {EAVE + 20} L{x + s * 74} {BASE} M{x} {BASE - 6} H{x + s * 74} '
                 f'M{x + s * 30} {BASE - 6} L{x} {EAVE + 92}" stroke="var(--hh-timber)" stroke-width="7" '
                 f'stroke-linecap="square" fill="none"/>')
    parts.append(f'<rect x="{x + s * 74 - (14 if s > 0 else 0)}" y="{BASE - 10}" width="14" height="10" '
                 f'fill="var(--hh-timber)"/>')
# The front: six painted flats and a gable cut from two more.
parts.append(f'<path d="M{L} {BASE} V{EAVE} L{600} {APEX} L{R} {EAVE} V{BASE} Z" fill="var(--hh-wall)"/>')
# Painted trim, and a painted cobweb in the top corner of the left window.
parts.append(f'<path d="M{L - 14} {EAVE + 6} L600 {APEX - 12} L{R + 14} {EAVE + 6}" fill="none" '
             f'stroke="var(--hh-paint)" stroke-width="9" stroke-linejoin="round"/>')
parts.append('<path d="M352 204 l40 0 M352 204 l0 40 M352 204 l30 28 M352 204 l38 16 M352 204 l16 36 '
             'M368 204 q-2 14 -16 16 M384 204 q-6 24 -32 28 M372 222 q8 -4 12 -18" fill="none" '
             'stroke="var(--hh-paint)" stroke-width="1.4"/>')
# THE SEAMS between the flats, where the light comes through. Gaffer tape over
# parts of them, which is where the light stops.
for x in FLATS[1:-1]:
    top = APEX + (EAVE - APEX) * abs(600 - x) / 300   # the roof line over this seam
    seam(f"M{x} {num(top + 4)} V{BASE - 2}", into=parts)
for x, y, h in ((400, 236, 26), (500, 318, 30), (700, 196, 22), (800, 330, 26)):
    parts.append(f'<rect x="{x - 9}" y="{y}" width="18" height="{h}" rx="1.5" fill="var(--hh-tape)"/>')
# Light spilling over the top edge of the set.
seam(f"M{L + 4} {EAVE - 1} L600 {APEX - 2} L{R - 4} {EAVE - 1}", 1.6)
# THE DOOR, with light all round its edges and under it.
x0, y0, x1, y1 = DOOR
parts.append(f'<rect x="{x0}" y="{y0}" width="{x1 - x0}" height="{y1 - y0}" fill="var(--hh-door)"/>'
             f'<path d="M{x0 + 10} {y0 + 12} H{x1 - 10} V{y0 + 50} H{x0 + 10} Z M{x0 + 10} {y0 + 62} H{x1 - 10} '
             f'V{y1 - 14} H{x0 + 10} Z" fill="none" stroke="var(--hh-paint)" stroke-width="1.6"/>'
             f'<circle cx="{x1 - 14}" cy="{y0 + 58}" r="3.4" fill="var(--hh-paint)"/>')
seam(f"M{x0 - 1} {y1 - 1} V{y0 - 1} H{x1 + 1} V{y1 - 1}", 1.6)
seam(f"M{x0 + 2} {y1 - 1} H{x1 - 2}", 3)
# THE WINDOWS, boarded, with light between the boards.
for wx0, wy0, wx1, wy1 in WINDOWS:
    parts.append(f'<rect x="{wx0}" y="{wy0}" width="{wx1 - wx0}" height="{wy1 - wy0}" fill="var(--hh-dark)"/>')
    for k in range(4):
        by = wy0 + 4 + k * 24
        seam(f"M{wx0 + 4} {by - 2} H{wx1 - 4}", 1.4)
        parts.append(f'<rect x="{wx0 - 8}" y="{by}" width="{wx1 - wx0 + 16}" height="20" rx="1" '
                     f'fill="var(--hh-board)" transform="rotate({(-1) ** k * 2} {(wx0 + wx1) / 2} {by + 10})"/>')
    parts.append(f'<rect x="{wx0 - 10}" y="{wy0 - 10}" width="{wx1 - wx0 + 20}" height="{wy1 - wy0 + 20}" '
                 f'fill="none" stroke="var(--hh-paint)" stroke-width="6"/>')
# THE ATTIC'S ROUND WINDOW, boarded in a cross, light round the boards.
cx, cy, r = ROUND
parts.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="var(--hh-dark)"/>')
seam(f"M{cx - r + 6} {cy - 5} H{cx + r - 6} M{cx - r + 6} {cy + 5} H{cx + r - 6} "
     f"M{cx - 5} {cy - r + 6} V{cy + r - 6} M{cx + 5} {cy - r + 6} V{cy + r - 6}", 1.2)
parts.append(f'<path d="M{cx - r - 2} {cy} H{cx + r + 2} M{cx} {cy - r - 2} V{cy + r + 2}" '
             f'stroke="var(--hh-board)" stroke-width="8"/>'
             f'<circle cx="{cx}" cy="{cy}" r="{r + 4}" fill="none" stroke="var(--hh-paint)" stroke-width="6"/>')
# THE CELLAR'S GRATING, low in the wall, light between its bars.
parts.append('<rect x="324" y="342" width="72" height="22" fill="var(--hh-dark)"/>')
seam("M334 346 V360 M348 346 V360 M362 346 V360 M376 346 V360 M388 346 V360", 1.2)
parts.append('<rect x="320" y="338" width="80" height="30" fill="none" stroke="var(--hh-paint)" stroke-width="4"/>')
# THE PORCH: painted steps, and a pumpkin nobody lit, its face dark.
parts.append('<path d="M530 372 H670 V384 H530 Z M518 384 H682 V396 H518 Z M506 396 H694 V408 H506 Z" '
             'fill="var(--hh-step)" stroke="var(--hh-floor)" stroke-width="1.4"/>')
parts.append('<ellipse cx="664" cy="360" rx="17" ry="13" fill="var(--hh-pumpkin)"/>'
             '<path d="M664 347 q2 -6 6 -7" stroke="var(--hh-timber)" stroke-width="3" fill="none" stroke-linecap="round"/>'
             '<path d="M656 354 l4 4 l-6 1 Z M672 354 l-4 4 l6 1 Z M654 364 q10 7 20 0 l-3 2 l-3 -2 l-4 3 l-4 -3 l-3 2 Z" '
             'fill="var(--hh-dark)"/>')
setd = (f'  <svg class="hh-set" viewBox="0 0 {W} {H}" aria-hidden="true" focusable="false">'
        + "".join(parts) + "".join(SEAMS) + "</svg>")


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
    s = sources[q["source"]]
    if s["kind"] == "brief":
        return f'{esc(q["who"])}, {esc(s["title"])}, {esc(s["year"])}'
    if s["kind"] == "web":
        said = f'{esc(q["who"])}, {esc(q["speaker"])}, ' if q.get("speaker") else f'{esc(q["who"])}, '
        return f'{said}<a href="{attr(s["url"])}">{esc(s["title"])}</a>, {esc(s["where"])}, {esc(s["year"])}'
    page_link = f'<a href="{attr(s["url"])}">{esc(s["title"])}</a>'
    if q["who"] == "Stimpunks":
        return f"Stimpunks, {page_link}"
    return (f'{esc(q["who"])}, <a href="{attr(q["url"])}">{esc(q["work"])}</a>, read on our {page_link} page')


def quote(qid):
    q = quotes[qid]
    return (f'    <blockquote class="hh-quote">\n'
            f'      <p>{esc(q["text"])}</p>\n'
            f'      <footer class="hh-quote__who">{source(q)}</footer>\n'
            f'    </blockquote>')


def section(name):
    out = []
    for b in sections[name]:
        out.append(quote(b["q"]) if "q" in b else f'    <p>{linked(b["p"])}</p>')
    return "\n".join(out)


KIND = {"room": "A room on this street", "page": "A page of ours", "picture": "A picture",
        "link": "A link", "made": "Made by somebody in our community"}
by_room = {r["id"]: r for r in rooms}


def where_words(t):
    return f'{by_room[t["room"]]["name"]}: {t["look"][0].lower()}{t["look"][1:]}'


def thing(t):
    href = t.get("url") or t.get("rights", {}).get("url")
    pic = ""
    if t["kind"] == "picture":
        im = t["image"]
        pic = (f'          <img class="hh-thing__pic" src="{attr(im["src"])}" width="{im["width"]}" '
               f'height="{im["height"]}" alt="{attr(im["alt"])}" loading="lazy" decoding="async">\n')
    rights = (f' <span class="hh-thing__rights">It is {esc(t["rights"]["words"])}; '
              f'<a href="{attr(t["rights"]["url"])}">the scan&rsquo;s own page</a>.</span>'
              if t["kind"] == "picture" else "")
    title = (f'<a href="{attr(href)}">{esc(t["name"])}</a>' if t["kind"] != "picture" else esc(t["name"]))
    return (f'      <li class="hh-thing" id="thing-{attr(t["id"])}">\n'
            f'        <div class="hh-thing__body" data-hh-thing="{attr(t["id"])}">\n'
            f'          <h3 class="hh-thing__name">{title}</h3>\n'
            f'          <p class="hh-thing__kind">{KIND[t["kind"]]} &middot; {esc(t["whose"])}</p>\n'
            f'{pic}'
            f'          <p class="hh-thing__line">{linked(t["line"])}{rights}</p>\n'
            f'        </div>\n'
            f'        <p class="hh-thing__where">Where it hides: {esc(where_words(t))}</p>\n'
            f'      </li>')


def hunt():
    out = ['    <ol class="hh-rooms">']
    for r in rooms:
        rid = r["id"]
        out.append(f'      <li class="hh-room" id="room-{attr(rid)}">\n'
                   f'        <h3 class="hh-room__name">{esc(r["name"])}</h3>\n'
                   f'        <p class="hh-room__line">{linked(r["line"])}</p>\n'
                   f'        <ul class="hh-places">')
        for t in things:
            if t["room"] != rid:
                continue
            out.append(f'          <li class="hh-place">\n'
                       f'            <button type="button" class="hh-look" aria-expanded="false" '
                       f'aria-controls="look-{attr(t["id"])}" data-hh-look="{attr(t["id"])}">{esc(t["look"])}</button>\n'
                       f'            <div class="hh-found" id="look-{attr(t["id"])}" hidden></div>\n'
                       f'          </li>')
        out.append('        </ul>\n'
                   '        <p class="hh-out">The way out: <a href="the-outskirts.html">back to the road</a>, '
                   'or <a href="#lights-up">put the lights up</a>.</p>\n'
                   '      </li>')
    out.append("    </ol>")
    return "\n".join(out)


swap(ROOM, "hh:set", setd)
for name in sections:
    swap(ROOM, f"hh:{name}", section(name), "    ")
swap(ROOM, "hh:hunt", hunt(), "    ")
swap(ROOM, "hh:list", '    <ol class="hh-things">\n' + "\n".join(thing(t) for t in things) + "\n    </ol>", "    ")

rules = [f'      <li><strong>{esc(r["name"])}</strong> {linked(r["line"])}</li>' for r in d["not_here"]]
swap(ROOM, "hh:rules", '    <ul class="hh-rules">\n' + "\n".join(rules) + "\n    </ul>", "    ")

life = re.search(r"export const LIFE_DAYS = (\d+);", LIB.read_text())
if not life:
    raise SystemExit("REFUSING: netlify/cb/lib.mjs has no LIFE_DAYS, and the room says how long a message stays.")
LIFE_WORDS = {7: "a week", 14: "two weeks", 21: "three weeks", 28: "four weeks"}
life_words = LIFE_WORDS.get(int(life.group(1)), life.group(1) + " days")
bring = [
    f'    <p>Somebody in our community asked for this house in <a href="{attr(d["suggestion"])}">the Sandbox&rsquo;s '
    "suggestion box</a>: a place to share haunted things we have made and things we love, pictures and links, with "
    "one way to look for them like a scavenger hunt and one way to scroll through them all.</p>",
    "    <p><strong>Bring a picture or a link to the house&rsquo;s channel on the CB.</strong> The channel takes "
    f"pictures and links, like every channel, and keeps them {life_words} unless our administrators set it "
    'otherwise. Sign on, tune the radio to <b>This room</b> in here, or open <a href="chat.html#haunted-house">the '
    "house&rsquo;s channel</a> on the chat page, and say what it is and whose.</p>",
    "    <p><strong>To put something in the house for good</strong>, hidden in one of its rooms and in the list with "
    'the lights up, say so on the channel or in <a href="sandbox.html">the suggestion box</a>. It goes in with the '
    "name of whoever made it, the way they want to be named, and the day they said yes, and it comes out the moment "
    "they ask, deleted rather than hidden. Something you love that somebody else made goes in as a link with their "
    "name on it, never as a copy of their picture.</p>",
]
swap(ROOM, "hh:bring", "\n".join(bring), "    ")

channel = [
    "      <li><strong>Everybody signed on to the CB can read this room&rsquo;s channel</strong>, so share only what "
    "you would show a room with all of them in it. It keeps "
    '<a href="community-center.html#cb-norms">the house norms</a>, like every channel, and a picture is part of its '
    "message and goes when the message does.</li>",
    f"      <li><strong>Unless our administrators set this channel otherwise, every message on it goes {life_words} "
    "after it was sent</strong>, and the radio says what it keeps, first under <b>In this channel</b>.</li>",
    "      <li><strong>Say what is in it</strong> when what you share has blood, a jump or a flash in it, so "
    "somebody can choose before they press.</li>",
]
swap(ROOM, "hh:channel", '    <ul class="hh-rules">\n' + "\n".join(channel) + "\n    </ul>", "    ")

nexts = [f'      <li><a href="{attr(e["page"])}">{esc(e["name"])}</a>, {linked(e["line"])}</li>'
         for e in d["elsewhere"]]
swap(ROOM, "hh:elsewhere", '    <ul class="hh-next">\n' + "\n".join(nexts) + "\n    </ul>", "    ")

faces = json.loads(FACES.read_text())["faces"]
display, text_face = faces["mystery-quest"], faces["domine"]
whos = []
for q in quotes.values():
    if q["who"] not in ("Stimpunks",) and q["who"] not in whos:
        whos.append(q["who"])
names = ", ".join(whos[:-1]) + " and " + whos[-1]
licence = lambda f: f["licence"].replace(" 1.1", "")
web = [s for s in sources.values() if s["kind"] == "web"]
credits = [
    "      <li><strong>The house is ours</strong>: the set, its rooms, where everything hides, and every sentence "
    "not in a quotation, drawn and written as code by Claude, an AI model made by Anthropic, to Ryan&rsquo;s brief "
    f'and to <a href="{attr(d["suggestion"])}">the suggestion</a> that asked for it. Nothing on this page calls an '
    "AI while you read it.</li>",
    f"      <li><strong>Every quotation belongs to whoever said it</strong> and is credited where it stands: "
    f"{esc(names)}, and Stimpunks. "
    + " ".join(f'{esc(s["who"])}&rsquo;s <a href="{attr(s["url"])}">{esc(s["title"])}</a> was read on '
               f'{esc(d["read"])}' + (f', in {esc(s["read_via"])}' if s.get("read_via") else "") + "."
               for s in web)
    + f" Every quotation is {cap} words or fewer, and <code>tools/make-haunted-house.py</code> checks the ones from "
    "our own pages against them word for word whenever our copy of stimpunks.org is on the machine.</li>",
    "      <li><strong>Every thing in the house is credited to whoever made it.</strong> The engraving is Gustave "
    "Dor&eacute;&rsquo;s, public domain, as it hangs in <a href=\"the-mopery.html\">the Mopery</a>; the rooms are "
    "this street&rsquo;s and the pages are stimpunks.org&rsquo;s.</li>",
    "      <li><strong>Where eldritch comes from</strong> is read in Wiktionary&rsquo;s entry for it, which says "
    "nobody is sure; the history of the haunted house is Chris Heller&rsquo;s, as written above, and no date or "
    "name in it was added from memory.</li>",
    f"      <li>The type is {esc(display['family'])}, by {esc(display['designer'])}, for the house&rsquo;s name and "
    f"its headings, under the {esc(licence(display))}, and {esc(text_face['family'])}, by "
    f"{esc(text_face['designer'])}, for everything you read, under the {esc(licence(text_face))}, both read off "
    'their own records. More in <a href="liner-notes.html#haunted-house">the liner notes</a>.</li>',
]
swap(ROOM, "hh:credits", '    <ul class="hh-credits">\n' + "\n".join(credits) + "\n    </ul>", "    ")

notes = []
for qid, q in quotes.items():
    s = sources[q["source"]]
    where_link = (f'<a href="{attr(s["url"])}">{esc(s["title"])}</a>' if s.get("url") else esc(s["title"]))
    notes.append(f'      <tr><td>{esc(q["text"])}</td><td>{esc(q["who"])}</td><td>{where_link}</td>'
                 f'<td>{len(q["text"].split())} words</td></tr>')
swap(NOTES, "haunted-house-credits", "\n".join(notes), "      ")

# ── The published page, checked ──────────────────────────────────────────────
src = ROOM.read_text()
body = re.sub(r"<!-- quest:.*?:end -->", " ", src, flags=re.S)
body = re.sub(r"<!--.*?-->", " ", body, flags=re.S)
for tag in re.findall(r"<(form|input|textarea|select|audio|video|iframe)\b", body, re.I):
    refuse(f"{ROOM.name}: a <{tag}> outside the job marker. Nothing in this house takes your details, plays or "
           "sounds.")
if re.search(r'class="[^"]*\bfacade\b|autoplay|data-embed', body):
    refuse(f"{ROOM.name}: something to press and play. Nothing plays in this house; the gramophone only points.")
for s in re.findall(r'<script\b[^>]*\bsrc="([^"]+)"', src):
    if s not in SCRIPTS:
        refuse(f"{ROOM.name}: loads {s}, and the house runs {', '.join(sorted(SCRIPTS))} and nothing else.")
for need in ('class="hh-lights"', 'id="lights"', 'class="hh-hunt"', 'class="hh-list"'):
    if need not in body:
        refuse(f"{ROOM.name}: lost {need}, which the switch and its two ways through need.")
if not re.search(r'<section[^>]*class="hh-hunt"[^>]*\bhidden\b', body):
    refuse(f"{ROOM.name}: the hunt has to ship hidden, so a page with no script shows the list and no dead buttons.")
if not re.search(r'<div[^>]*class="hh-lights"[^>]*\bhidden\b', body):
    refuse(f"{ROOM.name}: the switch has to ship hidden, so a page with no script shows no dead control.")

sec = re.search(r"/\* §132 ── TURNING: The Haunted House.*?(?=/\* §133 )", CSS.read_text(), re.S)
if not sec:
    refuse("love.css has no §132 for The Haunted House before §133.")
else:
    s = re.sub(r"/\*.*?\*/", " ", sec.group(0), flags=re.S)
    if re.search(r"@keyframes|\banimation\s*:|\btransition\s*:", s):
        refuse("love.css §132: a keyframe, an animation or a transition. Nothing in the house moves at any setting.")

text = re.sub(r"<(script|style)\b.*?</\1>", " ", body, flags=re.S)
text = re.sub(r"<blockquote\b.*?</blockquote>", " ", text, flags=re.S)
text = re.sub(r"<head\b.*?</head>", " ", text, flags=re.S)
text = html.unescape(fold(re.sub(r"<[^>]+>", " ", text)))
sweep(text, ROOM.name)
if problems:
    raise SystemExit("REFUSING, on the published page:\n  " + "\n  ".join(problems))

longest = max(len(q["text"].split()) for q in quotes.values())
print(f"haunted house: {len(rooms)} rooms, {len(things)} things hidden, {len(quotes)} quotations in {ROOM.name}")
print(f"  longest quotation {longest} words against a cap of {cap}; "
      + ("the ones from our pages checked against the mirror word for word" if mirror_ok
         else "the Knowledge System mirror is not on this machine, so our pages were not re-read"))
print("  nothing jumps out, nobody is the monster, nothing counted, nothing kept")
