#!/usr/bin/env python3
"""Build Community Care's roof, its four things, its quotations and its credits, from data/community-care.json.

ONE DATA FILE, ONE TOOL, TWO SURFACES, the contract make-yells.py set. The room
is the street's room for asking: its channel on the CB is where anybody signed on
asks for mutual aid, peer support and any other help, and where anybody who can
offers it (Ryan's brief, 2026-10-22). Its page is built out of three pages of
ours: Community Care on stimpunks.org, our glossary's Peer Support, and Tuesday
Ferguson's Tapping the Radical Roots of Peer Support. This tool writes, between
cmc:<part> markers in community-care.html:

  · THE ROOF (cmc:canopy): everybody's umbrellas, open and tied to one another
    and to the shopfronts either side, drawn from the data's list, with rain
    falling on them and nothing falling under them.
  · THE FOUR THINGS THE CHANNEL IS FOR (cmc:four), and every section with a
    quotation in it (cmc:solidarity, cmc:peer, cmc:woven), block by block.
  · WHAT IS NOT IN THIS ROOM (cmc:rules), WHO READS THE CHANNEL AND FOR HOW LONG
    (cmc:channel), NEXT DOOR (cmc:elsewhere), and THE CREDITS (cmc:credits),
    with a table of the quotations in liner-notes.html.

WHAT IT REFUSES, and the first four are the room:

  · SORTING THE PEOPLE WHO ASK. Deserving, worthy, needy, the less fortunate,
    the vulnerable, beneficiaries, handouts. Nothing For Sale refuses the same
    words for its tables; this is the room where somebody asks in their own
    name, so a sentence that sorted them would be said to their face.
  · DEBT. Pay it forward, repay, owe, in return, give back. Help that puts
    somebody in debt is a loan with a smile on it, and our own forums' Mutual aid
    category says nobody owes anybody.
  · A MEANS TEST. Proof of need, verify, evidence, eligibility, qualify,
    documentation, screening. The Foundation's own grants have an application,
    and the room says so and links it; the channel has none.
  · A TALLY. make-dead-tired.py's list, narrowed `points` and all, plus the
    ones a room for asking grows: people helped, requests met, a wall of
    thank-yous. A counter of good deeds would arrive here as a kindness.

  Each of the four is swept in the room's own words with the negation window,
  so the room can still say that nobody is sorted, owes, proves or is counted.
  The sweep SKIPS BLOCKQUOTES, Dead Tired Society's reason: one of them says
  "not accommodation as charity", and a quotation arguing against a word has to
  be allowed to contain it.

  · ADVICE, in the second-person shapes make-dead-tired.py refuses, and pity:
    brave, heartwarming, inspiring, suffering from. Laughingstock's rule, in the
    room where it would arrive most kindly.
  · THE PAGE WITHOUT ITS CRISIS PARAGRAPH, before the first heading: the words
    "not a crisis" and links to our Help page and to Coping's crisis lines. A
    channel full of people offering help is exactly where somebody in danger
    might sit waiting for an answer.
  · A FORM, AN INPUT, A TEXTAREA OR ANYTHING EDITABLE outside the job marker,
    and any script but love.js, love-embed.js and quest.js. Nothing in the room
    takes words; the channel does. The friendly edit is a request form on the
    page "so people do not have to sign on", and that is somebody's need sent to
    a server nobody told them about.
  · A QUOTATION over the cap in the data, with no author, no work and no link
    (unless `unnamed` says our page names none), with an HTML entity in it, or
    read off anything but one of our pages in `pages`. AND, WHERE THE KNOWLEDGE
    SYSTEM MIRROR IS ON THE MACHINE, ONE THAT IS NOT ON THAT PAGE WORD FOR WORD.
    The comparison takes Markdown's links, emphasis, footnote markers and quote
    marks off the mirror's copy and folds the spaces, and nothing else, so a
    quotation tidied or "corrected" is refused. Where the mirror is missing (any
    machine but Ryan's), the check says so and carries on, make-coworking.py's
    arrangement.
  · A NEXT-DOOR LINE WHOSE ROOM NO LONGER SAYS IT. Each carries `holds`, words
    on that room's published page, the Community Center's service-board rule:
    a claim about one room living in another room's copy. And the grants line,
    held against the mirror's copy of the grants page, where present.
  · A ROOF THAT DOES NOT HOLD. An umbrella whose ink love.css does not declare,
    two alike side by side (front row, or back row against the two in front of
    it), and four in a row in a rainbow's order, because the Dopamine Dress-Up
    Den's rainbows are on its wall and not here. Every umbrella is tied to the
    next and the two at the ends to the shopfronts; nothing else holds the roof
    up, and the drawing has no other way to be made.
  · A MISSING MARKER PAIR. A generator that writes nothing and exits 0 is how
    two surfaces drift apart.

WHAT IT DOES NOT CHECK, on purpose: how many umbrellas there are. The roof is as
long as the street is wide.
"""
import colorsys
import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data/community-care.json"
ROOM = ROOT / "community-care.html"
NOTES = ROOT / "liner-notes.html"
CSS = ROOT / "love.css"
FORUM = ROOT / "data/forum.json"
LIB = ROOT / "netlify/cb/lib.mjs"
FACES = ROOT / "data/foundry-faces.json"
MIRROR = Path.home() / "Documents/Claude/Projects/Stimpunks Knowledge System/site/stimpunks.org"

ENTITY = re.compile(r"&(?:[a-zA-Z][a-zA-Z0-9]{1,31}|#\d{1,6}|#x[0-9a-fA-F]{1,6});")
LINK = re.compile(r"\[([^\]]+)\]\(([^)\s]+)\)")

NEGATION = (r"(?:no|not|nothing|never|neither|none|without|refuses?|refused|refusing|"
            r"cannot|does not|won't|will not|is not|are not|isn't|aren't|nobody|nor|declin\w+)")

CHARITY = (r"deserv\w*|undeserv\w*|worthy|unworthy|needy|less fortunate|the vulnerable|"
           r"vulnerable people|beneficiar\w*|handouts?|charity cases?|those in need|people in need")
DEBT = (r"pay it forward|repa(?:y|id|ying|yment)|owes?|owed|owing|in return|give back|"
        r"debts?|indebted|return the favou?r|favou?rs? owed")
PROOF = (r"proof of need|prove (?:it|that|your)|verif\w*|evidence|eligib\w*|qualif\w*|"
         r"documentation|means[- ]test\w*|screening")
# make-dead-tired.py's TALLY, narrowed `points` and all, plus what a room for
# asking grows. "count" alone is not here: "nothing counted" is a house rule.
TALLY = (r"scores?|scored|scoring|\d+\s*points?|points?\s+(?:for|per|each|awarded|"
         r"earned|available)|streaks?|leaderboards?|high[- ]score|xp\b|levels? up|"
         r"badges? (?:earned|awarded)|achievements?|tall(?:y|ies)|tallied|progress bar|"
         r"people helped|requests? (?:met|filled|answered so far)|helped \d+|"
         r"\d+ (?:people|requests|asks|offers)|wall of thank|thank-you wall|top helpers?")
ADVICE = (r"you should|you need to|you must|try to|make sure (?:you|to)|have you tried|"
          r"don'?t forget to|remember to|it'?s important to|tips?(?: for| to| on)?\b|"
          r"self-care routine|ways to (?:recover|heal|cope)|learn to")
PITY = r"brave|bravery|courageous|heartwarming|heart-warming|inspir(?:ing|ational)|suffer(?:s|ing)? from|sufferers?"

SWEEPS = [
    (CHARITY, "nobody who asks here is sorted. See _no_charity."),
    (DEBT, "help here puts nobody in anybody's debt. See _no_debt."),
    (PROOF, "nobody here proves anything. See _no_proof."),
    (TALLY, "nothing in this room is counted. See _no_tally."),
    (ADVICE, "no advice nobody asked for, in the shapes make-dead-tired.py refuses."),
    (PITY, "nobody here is pitied or called brave for asking, Laughingstock's rule."),
]
SWEEPS = [(re.compile(rf"\b(?:{p})", re.I),
           re.compile(rf"\b{NEGATION}\b[^.]{{0,70}}?\b(?:{p})", re.I), why) for p, why in SWEEPS]

SCRIPTS = {"love.js", "love-embed.js", "quest.js"}

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
    """The mirror's Markdown with only what is not words taken off: images,
    footnote markers, link targets, emphasis and blockquote markers."""
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
            window = text[max(0, m.start() - 80):m.end()]
            if ok.search(window):
                continue
            refuse(f"{where}: {m.group(0)!r} -- {why}")


def ours(text, where):
    """Our own words: no entity, a link only to a page that can be checked by
    eye, swept for the room's refusals."""
    text = str(text)
    if ENTITY.search(text):
        refuse(f"{where}: carries an HTML entity. Everything is escaped on the way in; write the character.")
    for _, url in LINK.findall(text):
        if not (url.startswith("https://") or re.match(r"^[a-z0-9-]+\.html(?:#[\w/=-]*)?$", url)):
            refuse(f"{where}: {url!r} is neither an https address nor a page of ours.")
    sweep(LINK.sub(r"\1", text), where)


def linked(text):
    """Escape, then make [words](address) a link. The brackets survive escaping."""
    return LINK.sub(lambda m: f'<a href="{attr(html.unescape(m.group(2)))}">{m.group(1)}</a>', esc(text))


def css_root():
    src = CSS.read_text()
    root = src[src.index(":root {"):src.index("\n}", src.index(":root {"))]
    root = re.sub(r"/\*.*?\*/", " ", root, flags=re.S)
    return dict(re.findall(r"(--[a-z0-9-]+):\s*(#[0-9A-Fa-f]{6})", root))


def hue(hexstr):
    h = hexstr.lstrip("#")
    r, g, b = (int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
    return colorsys.rgb_to_hls(r, g, b)[0] * 360


# ── The data ─────────────────────────────────────────────────────────────────
d = json.loads(DATA.read_text())
pages = d.get("pages") or {}
quotes = d.get("quotes") or {}
four = d.get("four") or []
sections = d.get("sections") or {}
videos = {v["id"]: v for v in d.get("videos") or []}
cap = int(d.get("words") or 0)
if not cap:
    refuse("data/community-care.json has no `words` cap, and the room prints one.")

mirror_ok = MIRROR.is_dir()
mirror_text = {}
for key, pg in pages.items():
    for need in ("title", "url", "mirror"):
        if not str(pg.get(need, "")).strip():
            refuse(f"pages.{key}: no {need}.")
    if not str(pg.get("url", "")).startswith("https://stimpunks.org/") or not str(pg.get("url", "")).endswith("/"):
        refuse(f"pages.{key}: {pg.get('url')!r} is not one of our pages on stimpunks.org, with its trailing slash.")
    if mirror_ok:
        f = MIRROR / pg.get("mirror", "")
        if not f.is_file():
            refuse(f"pages.{key}: the mirror has no {pg.get('mirror')}, so nothing read off it can be checked.")
            continue
        raw = f.read_text()
        m = re.search(r'^url:\s*"([^"]+)"', raw, re.M)
        if not m or m.group(1) != pg["url"]:
            refuse(f"pages.{key}: {pg['mirror']} in the mirror is {m.group(1) if m else 'no page'}, not {pg['url']}.")
        mirror_text[key] = plain_md(raw.split("\n---", 1)[-1])
        for w in pg.get("holds") or []:
            if fold(w) not in mirror_text[key]:
                refuse(f"pages.{key}: our page no longer says {w!r}, and the room says so on its behalf. "
                       "Re-read the page and change the room's line with it.")

used = set()
for qid, q in quotes.items():
    where = f"quote {qid}"
    text = str(q.get("text", ""))
    n = len(text.split())
    if not n:
        refuse(f"{where}: no text.")
    if n > cap:
        refuse(f"{where}: {n} words against a cap of {cap}. It is printed in the room; raise it in the data "
               "on purpose, with the reason, or quote less.")
    if not str(q.get("who", "")).strip():
        refuse(f"{where}: no `who`. Every line here names who said it.")
    if not str(q.get("work", "")).strip() and not str(q.get("unnamed", "")).strip():
        refuse(f"{where}: no `work`, and no `unnamed` saying our page names none. Do not fill it from memory.")
    if str(q.get("work", "")).strip() and not str(q.get("url", "")).startswith("https://"):
        refuse(f"{where}: a work with no link to it.")
    if q.get("read_on") not in pages:
        refuse(f"{where}: `read_on` is not one of `pages`, and every quotation here was read on a page of ours.")
    for field, v in q.items():
        if ENTITY.search(str(v)):
            refuse(f"{where}: {field} carries an HTML entity.")
    if mirror_ok and q.get("read_on") in mirror_text and fold(text) not in mirror_text[q["read_on"]]:
        refuse(f"{where}: not on {pages[q['read_on']]['url']} word for word. Re-copy it from our page; "
               "never loosen the check.")
    for field in ("who", "work", "year", "unnamed"):
        sweep(q.get(field, ""), f"{where} ({field})")

seen_four = set()
for i, f in enumerate(four, 1):
    for need in ("id", "name", "line"):
        if not str(f.get(need, "")).strip():
            refuse(f"four {i}: no {need}.")
    if f.get("id") in seen_four:
        refuse(f"four {i}: the id is used twice.")
    seen_four.add(f.get("id"))
    ours(f.get("line", ""), f"four {f.get('id')}")
    ours(f.get("name", ""), f"four {f.get('id')}")

for name, blocks in sections.items():
    for j, b in enumerate(blocks, 1):
        where = f"sections.{name} block {j}"
        if "q" in b:
            if b["q"] not in quotes:
                refuse(f"{where}: quotes {b['q']!r}, which is not in `quotes`.")
            used.add(b["q"])
        elif "p" in b:
            ours(b["p"], where)
        elif "video" in b:
            if b["video"] not in videos:
                refuse(f"{where}: video {b['video']!r} is not in `videos`.")
        elif "four" not in b:
            refuse(f"{where}: a block is a q, a p, a video or the four, and this is none of them.")
for qid in quotes:
    if qid not in used:
        refuse(f"quote {qid}: in the data and on no section, so its credit would claim a line the room does not print.")

for v in videos.values():
    for need in ("id", "title", "channel", "who", "runtime"):
        if not str(v.get(need, "")).strip():
            refuse(f"video {v.get('id')}: no {need}. Every press-to-play here says how long before the press.")
    if not re.fullmatch(r"[A-Za-z0-9_-]{11}", str(v.get("id", ""))):
        refuse(f"video {v.get('id')}: not a YouTube id, and love-embed.js returns quietly on one.")
    if not re.fullmatch(r"\d{1,2}:\d{2}(?::\d{2})?", str(v.get("runtime", ""))):
        refuse(f"video {v.get('id')}: runtime {v.get('runtime')!r} is not minutes and seconds.")

for i, r in enumerate(d.get("not_here") or [], 1):
    for need in ("name", "line"):
        if not str(r.get(need, "")).strip():
            refuse(f"not_here {i}: no {need}.")
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
            refuse(f"{where}: that room no longer says {w!r}, and this room says it on its behalf. Change "
                   "the line with the room, and its holds with it.")
    if not e.get("holds"):
        refuse(f"{where}: no holds. A line about another room has to name the words there that carry it.")

# ── The roof ─────────────────────────────────────────────────────────────────
inks = css_root()
umbrellas = d.get("umbrellas") or []
if len(umbrellas) < 3:
    refuse("umbrellas: a roof needs more than a couple of umbrellas to be a roof.")
for u in umbrellas:
    if f"--cmc-{u}" not in inks:
        refuse(f"umbrellas: --cmc-{u} is not declared in love.css's :root.")
for a, b in zip(umbrellas, umbrellas[1:]):
    if a == b:
        refuse(f"umbrellas: two {a} side by side, and the roof is everybody's umbrellas, not one colour twice.")
hues = [hue(inks.get(f"--cmc-{u}", "#000000")) for u in umbrellas]
for i in range(len(hues) - 3):
    run = hues[i:i + 4]
    if all(x < y for x, y in zip(run, run[1:])) or all(x > y for x, y in zip(run, run[1:])):
        refuse(f"umbrellas: {', '.join(umbrellas[i:i + 4])} run in a rainbow's order. The Dopamine Dress-Up "
               "Den's rainbows are on its wall; reorder the umbrellas.")

# The back row hangs behind the gaps between the front row's umbrellas, each
# taking a colour from further along the list; the first offset at which none
# matches either umbrella it stands behind is the one drawn, so the choice is
# made here and not by hand.
n = len(umbrellas)
back = None
for off in range(2, n):
    cand = [umbrellas[(i + off) % n] for i in range(n - 1)]
    if all(c != umbrellas[i] and c != umbrellas[i + 1] for i, c in enumerate(cand)) and \
            all(a != b for a, b in zip(cand, cand[1:])):
        back = cand
        break
if back is None:
    refuse("umbrellas: no back row can stand behind the front one without two alike touching.")

if problems:
    raise SystemExit("REFUSING to build Community Care:\n  " + "\n  ".join(problems))

W, H = 1200, 300
WALL = 28
HEM, RISE, R = 196, 64, 62
BHEM, BRISE, BR = 150, 52, 50
STEP = (W - 2 * WALL) / n
fx = [WALL + STEP / 2 + i * STEP for i in range(n)]
bx = [(a + b) / 2 for a, b in zip(fx, fx[1:])]
TIE = 230


def num(v):
    return f"{v:.1f}".rstrip("0").rstrip(".")


def dome(cx, hem, rise, r, ink, cls):
    """One open umbrella seen from the side: a dome down to a scalloped hem,
    the ribs that run to each point of it, and every other panel a little
    darker. Outlined in the rib ink, because an umbrella you cannot pick out of
    its neighbours is not one of everybody's."""
    pts = [cx - r + k * r / 2 for k in range(5)]
    apex = hem - rise
    hemline = "".join(f" Q{num((pts[k] + pts[k - 1]) / 2)} {num(hem - 9)} {num(pts[k - 1])} {num(hem)}"
                      for k in range(4, 0, -1))
    path = f"M{num(cx - r)} {num(hem)} A{num(r)} {num(rise)} 0 0 1 {num(cx + r)} {num(hem)}{hemline} Z"
    shade = "".join(f'<path d="M{num(cx)} {num(apex)} L{num(pts[k])} {num(hem)} L{num(pts[k + 1])} {num(hem)} Z" '
                    f'fill="var(--cmc-rib)" fill-opacity=".18"/>' for k in (0, 2))
    ribs = "".join(f'<path d="M{num(cx)} {num(apex)} L{num(p)} {num(hem)}"/>' for p in pts[1:4])
    return (f'<g class="{cls}"><path d="{path}" fill="var(--cmc-{ink})"/>'
            f'<g clip-path="url(#cmc-dome-{cls}-{num(cx)})">{shade}</g>'
            f'<g fill="none" stroke="var(--cmc-rib)" stroke-width="1.4" stroke-opacity=".7">{ribs}</g>'
            f'<path d="{path}" fill="none" stroke="var(--cmc-rib)" stroke-width="2.4" stroke-linejoin="round"/>'
            f'<path d="M{num(cx)} {num(apex)} V{num(apex - 9)}" stroke="var(--cmc-rib)" stroke-width="3" '
            f'stroke-linecap="round"/></g>'), (f'<clipPath id="cmc-dome-{cls}-{num(cx)}"><path d="{path}"/></clipPath>')


defs, back_g, front_g = [], [], []
for cx, ink in zip(bx, back):
    g, clip = dome(cx, BHEM, BRISE, BR, ink, "cmc-far")
    back_g.append(g)
    defs.append(clip)
for cx, ink in zip(fx, umbrellas):
    g, clip = dome(cx, HEM, RISE, R, ink, "cmc-near")
    front_g.append(g)
    defs.append(clip)

# Each umbrella's shaft comes down under the roof to a hooked handle, and a cord
# runs from each shaft to the next with a loose loop at every one -- the ties,
# with no single knot tied too tight -- and from the two at the ends to the
# shopfronts' walls. Nothing else holds the roof up.
shafts, ties = [], []
for cx in fx:
    shafts.append(f'<path d="M{num(cx)} {HEM - 4} V262 q0 12 -10 12 q-8 0 -8 -8" fill="none" '
                  f'stroke="var(--cmc-sky)" stroke-width="3.2" stroke-linecap="round"/>')
    ties.append(f'<circle cx="{num(cx)}" cy="{TIE}" r="4.5" fill="none" stroke="var(--cmc-tie)" stroke-width="1.8"/>')
anchors = [WALL] + fx + [W - WALL]
for a, b in zip(anchors, anchors[1:]):
    mid = (a + b) / 2
    ties.append(f'<path d="M{num(a)} {TIE} Q{num(mid)} {TIE + 13} {num(b)} {TIE}" fill="none" '
                f'stroke="var(--cmc-tie)" stroke-width="1.8"/>')

walls = (f'<rect x="0" y="0" width="{WALL}" height="{H}" fill="var(--cmc-slab)"/>'
         f'<rect x="{W - WALL}" y="0" width="{WALL}" height="{H}" fill="var(--cmc-slab)"/>'
         f'<path d="M{WALL} 0 V{H} M{W - WALL} 0 V{H}" stroke="var(--cmc-rib)" stroke-width="2"/>'
         f'<circle cx="{WALL}" cy="{TIE}" r="5" fill="var(--cmc-tie)"/>'
         f'<circle cx="{W - WALL}" cy="{TIE}" r="5" fill="var(--cmc-tie)"/>')

# The rain is a pattern on a rect taller than the sky by one tile, clipped to
# the sky, so that at MAX GLITTER moving the rect down one tile and starting
# again is seamless. It falls on the roof and never under it.
rain = ('<pattern id="cmc-rain-tile" width="60" height="60" patternUnits="userSpaceOnUse">'
        '<path d="M12 2 l-5 15 M44 20 l-5 15 M28 40 l-5 15" stroke="var(--cmc-rain)" '
        'stroke-width="1.6" stroke-linecap="round"/></pattern>'
        f'<clipPath id="cmc-sky-clip"><rect x="0" y="0" width="{W}" height="{HEM}"/></clipPath>')
canopy = (f'  <svg class="cmc-canopy" viewBox="0 0 {W} {H}" aria-hidden="true" focusable="false">'
          f'<defs>{rain}{"".join(defs)}</defs>'
          f'<rect x="0" y="0" width="{W}" height="{HEM}" fill="var(--cmc-sky)"/>'
          f'<g clip-path="url(#cmc-sky-clip)"><rect class="cmc-rain" x="0" y="-60" width="{W}" '
          f'height="{HEM + 60}" fill="url(#cmc-rain-tile)"/></g>'
          f'<rect x="0" y="{HEM - 6}" width="{W}" height="{H - HEM + 6}" fill="var(--cmc-under)"/>'
          f'<g opacity=".82">{"".join(back_g)}</g>'
          f'{"".join(shafts)}{"".join(front_g)}{"".join(ties)}{walls}</svg>')


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
    """Who said it and where, beside the words, Covenstead's reason. Somebody
    else's line says it was read on our page, the Community Library's rule;
    our own says only which page it is."""
    pg = pages[q["read_on"]]
    page_link = f'<a href="{attr(pg["url"])}">{esc(pg["title"])}</a>'
    if q["who"] == "Stimpunks":
        return f'Stimpunks, {page_link}'
    if not q.get("work"):
        return f'{esc(q["who"])}, as our {page_link} page quotes it, naming no work'
    year = f', {esc(q["year"])}' if q.get("year") else ""
    work = f'<a href="{attr(q["url"])}">{esc(q["work"])}</a>' if q.get("url") else esc(q["work"])
    if pg["url"] == q.get("url"):
        return f'{esc(q["who"])}, {work}{year}, on our blog'
    return f'{esc(q["who"])}, {work}{year}, read on our {page_link} page'


def quote(qid):
    q = quotes[qid]
    return (f'    <blockquote class="cmc-quote">\n'
            f'      <p>{esc(q["text"])}</p>\n'
            f'      <footer class="cmc-quote__who">{source(q)}</footer>\n'
            f'    </blockquote>')


def facade(v):
    title = f'{v["who"]} at {v["event"]} &mdash; {v["title"]}'
    return (f'    <div class="cmc-talk">\n'
            f'      <button type="button" class="facade" data-embed-id="{attr(v["id"])}" '
            f'data-embed-title="{attr(html.unescape(title))}">\n'
            f'        {esc(v["who"])}, {esc(v["title"])}, {esc(v["event"])} &mdash; {esc(v["runtime"])}\n'
            f'        <span class="facade__play">&#9654; PRESS PLAY</span>\n'
            f'      </button>\n'
            f'      <p class="cmc-talk__note">On {esc(v["channel"])}&rsquo;s own channel. {esc(v["note"])} '
            f'Nothing reaches YouTube until you press it.</p>\n'
            f'    </div>')


def four_cards():
    rows = []
    for f, ink in zip(four, umbrellas):
        rows.append(f'      <li class="cmc-four__item cmc-hem--{ink}">\n'
                    f'        <h3>{esc(f["name"])}</h3>\n'
                    f'        <p>{linked(f["line"])}</p>\n'
                    f'      </li>')
    return '    <ul class="cmc-four">\n' + "\n".join(rows) + "\n    </ul>"


def section(name):
    out = []
    for b in sections[name]:
        if "q" in b:
            out.append(quote(b["q"]))
        elif "p" in b:
            out.append(f'    <p>{linked(b["p"])}</p>')
        elif "video" in b:
            out.append(facade(videos[b["video"]]))
        elif "four" in b:
            out.append(four_cards())
    return "\n".join(out)


swap(ROOM, "cmc:canopy", canopy)
for name in sections:
    swap(ROOM, f"cmc:{name}", section(name), "    ")

rules = [f'      <li><strong>{esc(r["name"])}</strong> {linked(r["line"])}</li>' for r in d["not_here"]]
swap(ROOM, "cmc:rules", '    <ul class="cmc-rules">\n' + "\n".join(rules) + "\n    </ul>", "    ")

# WHO READS THE CHANNEL AND FOR HOW LONG, read rather than typed: the 48 hours
# out of lib.mjs's LIFE, and how long the forums keep a topic out of
# data/forum.json, so neither goes quietly wrong when somebody changes it there.
life = re.search(r"export const LIFE = (\d+) \* 60 \* 60 \* 1000;", LIB.read_text())
if not life:
    raise SystemExit("REFUSING: netlify/cb/lib.mjs has no LIFE in hours, and the room says how long a message stays.")
cats = {c["slug"]: c for c in json.loads(FORUM.read_text())["categories"]}
for slug in ("mutual-aid", "coping"):
    if slug not in cats or not cats[slug].get("keep"):
        raise SystemExit(f"REFUSING: data/forum.json has no {slug} category with a keep, and the room links it.")
channel = [
    "      <li><strong>Everybody signed on to the CB can read this room&rsquo;s channel</strong>, so say only what "
    "you would say in a room with all of them in it. It keeps "
    '<a href="community-center.html#cb-norms">the house norms</a>, like every channel.</li>',
    f"      <li><strong>Every message on it goes {life.group(1)} hours after it was sent</strong>, like every "
    "channel on the CB. For an ask that needs longer, "
    f'<a href="forum.html#/c/mutual-aid">Mutual aid</a> in the forums keeps a topic {esc(cats["mutual-aid"]["keep"])} '
    f'after its last post, and <a href="forum.html#/c/coping">Coping</a> keeps one {esc(cats["coping"]["keep"])}.</li>',
    "      <li><strong>A direct message is between two people</strong>, and it is not end-to-end encrypted. "
    "One that breaks the house norms can be reported, which is the one way it reaches a moderator.</li>",
]
swap(ROOM, "cmc:channel", '    <ul class="cmc-rules">\n' + "\n".join(channel) + "\n    </ul>", "    ")

nexts = [f'      <li><a href="{attr(e["page"])}">{esc(e["name"])}</a>, {linked(e["line"])}</li>'
         for e in d["elsewhere"]]
swap(ROOM, "cmc:elsewhere", '    <ul class="cmc-next">\n' + "\n".join(nexts) + "\n    </ul>", "    ")

# THE CREDITS: whose every line is, the type read off its own record, and the cap.
faces = json.loads(FACES.read_text())["faces"]
display, text_face = faces["agbalumo"], faces["ysabeau-infant"]
whos = []
for q in quotes.values():
    if q["who"] != "Stimpunks":
        w = re.sub(r",? citing .*$", "", q["who"]).replace(" & ", " and ")
        if w not in whos:
            whos.append(w)
names = ", ".join(whos[:-1]) + " and " + whos[-1]
v0 = next(iter(videos.values()))
read_on = ", ".join(f'<a href="{attr(pg["url"])}">{esc(pg["title"])}</a>'
                    for k, pg in pages.items() if any(q["read_on"] == k for q in quotes.values()))
credits = [
    "      <li><strong>The umbrellas are our Community Care page&rsquo;s.</strong> Its sign is an umbrella, and its "
    "photograph is open umbrellas in every colour hanging on strings over a street. The drawing is ours, made as "
    "code by Claude, an AI model made by Anthropic, to Ryan&rsquo;s brief, and nothing on this page calls an AI "
    "while you read it.</li>",
    f"      <li><strong>Every quotation belongs to whoever said it</strong> and is credited to them where it stands: "
    f"{esc(names)}. The words around them are ours, written for this room.</li>",
    "      <li><strong>Tapping the Radical Roots of Peer Support is Tuesday Ferguson&rsquo;s</strong>, published on "
    "our blog in 2024 under CC BY-SA 4.0.</li>",
    f"      <li><strong>{esc(v0['who'])}&rsquo;s talk is {esc(v0['channel'])}&rsquo;s</strong>, from {esc(v0['event'])}, "
    "on their own channel; the presenter is named in the video&rsquo;s own description.</li>",
    f"      <li>Every quotation in this room is {cap} words or fewer and was read on one of our own pages, "
    f"{read_on}, on {esc(d['read'])}. <code>tools/make-community-care.py</code> checks each one against those "
    "pages word for word whenever our copy of stimpunks.org is on the machine, and where our page names no work "
    "for a line, neither does this room.</li>",
    f"      <li>The type is {esc(display['family'])}, by {esc(display['designer'])}, for the room&rsquo;s name and "
    f"its headings, and {esc(text_face['family'])}, by {esc(text_face['designer'])}, for everything you read. "
    f'Both under the {esc(display["licence"].replace(" 1.1", ""))}, read off their own records. More in '
    '<a href="liner-notes.html#community-care">the liner notes</a>.</li>',
]
if text_face["licence"] != display["licence"]:
    raise SystemExit("REFUSING: the two faces are under different licences now, and the credit says both.")
swap(ROOM, "cmc:credits", '    <ul class="cmc-credits">\n' + "\n".join(credits) + "\n    </ul>", "    ")

notes = []
for qid, q in quotes.items():
    pg = pages[q["read_on"]]
    work = (f'<a href="{attr(q["url"])}">{esc(q["work"])}</a>' if q.get("work") else
            f'&mdash; <span class="sr">no work named</span>')
    notes.append(f'      <tr><td><strong>{esc(q["who"])}</strong></td><td>{work}</td>'
                 f'<td><a href="{attr(pg["url"])}">{esc(pg["title"])}</a></td>'
                 f'<td>{len(q["text"].split())} words</td></tr>')
swap(NOTES, "community-care-credits", "\n".join(notes), "      ")

# ── The published page, checked ──────────────────────────────────────────────
# AFTER the write, so what is checked is what is published.
src = ROOM.read_text()
body = re.sub(r"<!-- quest:.*?:end -->", " ", src, flags=re.S)
body = re.sub(r"<!--.*?-->", " ", body, flags=re.S)

for tag in re.findall(r"<(form|input|textarea|select)\b", body, re.I):
    refuse(f"{ROOM.name}: a <{tag}> outside the job marker. Nothing in this room takes words; the channel does.")
if re.search(r"contenteditable", body, re.I):
    refuse(f"{ROOM.name}: something editable outside the job marker.")
for s in re.findall(r'<script\b[^>]*\bsrc="([^"]+)"', src):
    if s not in SCRIPTS:
        refuse(f"{ROOM.name}: loads {s}, and the room runs {', '.join(sorted(SCRIPTS))} and nothing else.")
if videos and 'src="love-embed.js"' not in src:
    refuse(f"{ROOM.name}: has a press-to-play facade and does not load love-embed.js, so the press does nothing.")

head = body.split("<h2", 1)[0]
if not re.search(r"not a crisis", html.unescape(re.sub(r"<[^>]+>", " ", head)), re.I) or \
        'href="https://stimpunks.org/help/"' not in head or \
        'href="https://stimpunks.org/fieldguide/coping/#h-crisis-hotlines"' not in head:
    refuse(f"{ROOM.name}: the paragraph before the first heading must say this is not a crisis line and link "
           "our Help page and Coping's crisis lines. See _crisis.")

text = re.sub(r"<(script|style)\b.*?</\1>", " ", body, flags=re.S)
text = re.sub(r"<blockquote\b.*?</blockquote>", " ", text, flags=re.S)
text = re.sub(r"<head\b.*?</head>", " ", text, flags=re.S)
text = html.unescape(fold(re.sub(r"<[^>]+>", " ", text)))
sweep(text, ROOM.name)
if problems:
    raise SystemExit("REFUSING, on the published page:\n  " + "\n  ".join(problems))

longest = max(len(q["text"].split()) for q in quotes.values())
print(f"community care: a roof of {n} umbrellas, {len(four)} things the channel is for, "
      f"{len(quotes)} quotations in {ROOM.name}")
print(f"  longest quotation {longest} words against a cap of {cap}; "
      + ("every one checked against the mirror word for word" if mirror_ok
         else "the Knowledge System mirror is not on this machine, so the quotations were not re-read"))
print("  nobody sorted, nothing owed, nothing proved and nothing counted")
