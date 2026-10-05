#!/usr/bin/env python3
"""Build The Pile, the junk playground on the street, out of data/the-pile.json:
the Pile itself with its bubble-wrap den, every part on it with its own drawing,
the place to make something, where junk playgrounds come from, the quotations,
the reading, the old telly on the Pile and its rack, and the room's credits in
the liner notes.

WHAT THE ROOM IS. Ryan Boren's brief, 2026-10-05, one of the outdoor lots
side by side where the buildings stop, next to the Green: a junk or
adventure playground of duct tape, fabric, bubble wrap, sand, old wooden
furniture, tempera paint, plywood pieces, pallets, pianos, buckets, shovels,
ropes, tree stumps and old playground equipment, with our Play page's heading,
Play Is Learning, and six pages to read.

NOTHING ON THE PILE IS FOR ANYTHING, AND THE TOOL REFUSES THE CLAIM THAT IT IS.
Our Play page says play is learning, and the room quotes it. What the room does
not do is sell play by its outcomes -- skills, development, readiness for
school, motor control -- because play done for an outcome is the one thing the
Playwork Principles say play is not: freely chosen, personally directed and
intrinsically motivated. That vocabulary is refused in the room's own voice
with the negation window; the quotations are skipped.

NOBODY TELLS YOU WHAT TO BUILD. A part's list of what it can become is a list of
what it has been, and the tool refuses the vocabulary of instruction in the
second person (you should, the right way to) and of a score (points, levels,
the best build), because a junk playground with a right answer is a lesson with
splinters in it. And the room never says the Pile is safe or that it is
dangerous: risk is the player's to judge.

THE LIGHT HAS NO COLOUR IN IT. The den in the middle of the Pile is roofed with
bubble wrap, and every bubble throws a ring of light on the sand under it;
everywhere else the Pile is in plain sun. All the colour on the Pile is paint,
tempera, chalky and matte, splashed on plywood and pallets, and the tool
refuses a --pil- colour named for light. See §99 for the collisions.

EVERY PART HAS ITS OWN DRAWING, and the tool refuses a part it cannot draw:
make-guild.py's rule, because the failure mode of a missing drawing is not a
crash, it is the same box standing in for everything. A paintable part is drawn
in var(--paint), which pile.js sets to the colour somebody chose, and in its own
colour until somebody does.

RUBIK WET PAINT SETS THE PILE'S NAME AND NOTHING ELSE. Dripping letters are an
access failure the moment they carry a sentence: the Doomscroll's blackletter
rule, in the room most likely to talk itself out of it. The tool reads §99 and
refuses the face anywhere but the h1.

THE QUOTATIONS. Our Play page's are checked against the Knowledge System
mirror's copy word for word when the mirror is there; the cap is forty words,
in the data file, with its reason.

IF THIS REFUSES: fix the cause. Do not widen a list to make it quiet.
"""
import html
import importlib.util
import json
import math
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TOOLS = ROOT / "tools"
DATA = ROOT / "data/the-pile.json"
PAGE = ROOT / "the-pile.html"
NOTES = ROOT / "liner-notes.html"
CSS = ROOT / "love.css"
SCRIPT = ROOT / "pile.js"
MIRROR = Path.home() / "Documents/Claude/Projects/Stimpunks Knowledge System/site/stimpunks.org"
SECTION = 99

W, H = 1200, 600      # the Pile
BW, BH = 1200, 300    # what you made
PART_ORDER = ["tape", "fabric", "bubble", "sand", "chair", "paint", "plywood", "pallet", "piano", "bucket",
              "shovel", "rope", "stump", "slide"]
YT = re.compile(r"^[A-Za-z0-9_-]{11}$")
CHANNEL = re.compile(r"^UC[A-Za-z0-9_-]{22}$")
RUNTIME = re.compile(r"^(?:\d+:[0-5]\d|\d+:[0-5]\d:[0-5]\d)$")
VIDEO_KEYS = {"id", "title", "channel", "channel_id", "runtime", "published", "start"}
SCREEN = ("pil", "the old telly on the Pile")
MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August",
          "September", "October", "November", "December"]

problems = []


def refuse(msg):
    problems.append(msg)


def tool(name):
    spec = importlib.util.spec_from_file_location(name.replace("-", "_"), TOOLS / f"{name}.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


hgc = tool("make-hey-good-cookin")
pekoe = tool("make-pekoe")


def esc(s):
    return html.escape(str(s), quote=False)


def attr(s):
    return html.escape(str(s), quote=True)


def swap(page, marker, block, indent=""):
    src = page.read_text()
    begin, end = f"<!-- {marker}:begin -->", f"<!-- {marker}:end -->"
    if begin not in src or end not in src:
        raise SystemExit(
            f"REFUSING: {page.name} has no {marker} markers, so there is nowhere to write.\n"
            "Put them back rather than letting this tool go quiet -- a generator that\n"
            "writes nothing and exits 0 is how two surfaces drift apart.")
    page.write_text(re.sub(re.escape(begin) + r".*?" + re.escape(end),
                           lambda _m: begin + "\n" + block + "\n" + indent + end,
                           src, flags=re.S))


def n(v):
    v = round(float(v), 1)
    return str(int(v)) if v == int(v) else str(v)


# ── The voice ────────────────────────────────────────────────────────────────

NEGATION = hgc.NEGATION
PURPOSE = (r"outcomes?|skills?|skill-building|develop(?:s|ing|ment|mental)?|school[- ]readiness|fine motor|"
           r"gross motor|motor control|STEM|educational value|enrichment|therap\w+|benefits?|resilien\w+|"
           r"builds? character|teaches?")
SCORE = r"scores?|scored|points|levels?|badges?|achievements?|winners?|win|wins|best builds?|ranked|leaderboards?"
TOLD = r"you should|you must|the right way|the correct way|the proper way|you need to|make sure you|don't forget to"
SAFE = r"safe|safety[- ]tested|childproof|child-proof|risk[- ]free|harmless|dangerous|hazardous"
VOCAB = [
    (PURPOSE, "play sold by its outcome. Our Play page says play is learning, and the room quotes it; it never "
              "says what play is for, because play done for an outcome is not freely chosen."),
    (SCORE, "a score. Nothing on the Pile is scored, and nobody's build is better than anybody's."),
    (TOLD, "an instruction. Nobody on the Pile tells anybody what to build or how."),
    (SAFE, "a verdict on risk. The room never says the Pile is safe or dangerous: that is the player's to judge."),
]


def sweep(text, where):
    text = html.unescape(re.sub(r"<[^>]+>", " ", str(text)))
    for pat, why in VOCAB:
        for m in re.finditer(rf"\b(?:{pat})\b", text, re.I):
            window = text[max(0, m.start() - 80):m.end()]
            if re.search(rf"\b{NEGATION}\b[^.]{{0,70}}?\b(?:{pat})", window, re.I):
                continue
            refuse(f"{where}: {m.group(0)!r} -- {why}")


# ── The parts, each its own drawing ──────────────────────────────────────────
# viewBox 0 0 120 90. A paintable part's body is var(--paint, its own colour),
# and pile.js sets --paint on the copy in what you made.

LINE = 'stroke="var(--pil-ink)" stroke-width="2.5" stroke-linejoin="round"'


def paint(own):
    return f'var(--paint, var({own}))'


DRAW = {
    "tape": lambda: (f'<circle cx="60" cy="48" r="30" fill="var(--pil-tape)" {LINE}/>'
                     f'<circle cx="60" cy="48" r="13" fill="var(--pil-sand)" {LINE}/>'
                     f'<path d="M86 60 L110 70 L106 80 L82 70 Z" fill="var(--pil-tape)" {LINE}/>'),
    "fabric": lambda: (f'<path d="M24 12 V86" stroke="var(--pil-pallet)" stroke-width="5" stroke-linecap="round"/>'
                       f'<path d="M26 14 Q58 6 76 18 Q96 30 104 22 L102 56 Q90 64 72 52 Q52 40 26 50 Z" fill="{paint("--pil-cloth")}" {LINE}/>'),
    "bubble": lambda: (f'<rect x="14" y="20" width="92" height="56" rx="3" fill="var(--pil-wrap)" {LINE}/>'
                       + "".join(f'<circle cx="{26 + c * 17}" cy="{32 + r * 16}" r="6" fill="none" stroke="var(--pil-ink)" stroke-width="1.4"/>'
                                 for r in range(3) for c in range(5))),
    "sand": lambda: (f'<path d="M8 80 Q30 30 60 26 Q92 30 112 80 Z" fill="var(--pil-sand-2)" {LINE}/>'
                     '<path d="M40 50 l3 2 M64 40 l3 2 M78 58 l3 2 M52 64 l3 2" stroke="var(--pil-ink)" stroke-width="1.6"/>'),
    "chair": lambda: (f'<rect x="38" y="14" width="10" height="70" rx="2" fill="{paint("--pil-wood")}" {LINE}/>'
                      f'<rect x="38" y="46" width="48" height="10" rx="2" fill="{paint("--pil-wood")}" {LINE}/>'
                      f'<path d="M80 56 V86 M44 56 V86" stroke="var(--pil-ink)" stroke-width="5" stroke-linecap="round"/>'
                      f'<path d="M48 24 H40 M48 34 H40" stroke="var(--pil-ink)" stroke-width="1.6"/>'),
    "paint": lambda: (f'<path d="M34 34 H86 L82 84 H38 Z" fill="var(--pil-tin)" {LINE}/>'
                      f'<ellipse cx="60" cy="34" rx="26" ry="7" fill="{paint("--pil-blue")}" {LINE}/>'
                      f'<path d="M48 36 Q46 52 50 56 Q54 52 52 37 Z" fill="{paint("--pil-blue")}" {LINE}/>'
                      f'<path d="M86 30 L104 10" stroke="var(--pil-wood)" stroke-width="6" stroke-linecap="round"/>'),
    "plywood": lambda: (f'<path d="M30 84 L48 10 L96 18 L84 86 Z" fill="{paint("--pil-ply")}" {LINE}/>'
                        '<path d="M44 40 Q60 34 86 44 M38 62 Q58 58 84 66" fill="none" stroke="var(--pil-ink)" stroke-width="1.2" opacity=".5"/>'),
    "pallet": lambda: ("".join(f'<rect x="12" y="{18 + i * 16}" width="96" height="10" rx="1" fill="{paint("--pil-pallet")}" {LINE}/>' for i in range(4))
                       + "".join(f'<rect x="{x}" y="14" width="12" height="70" fill="{paint("--pil-pallet")}" {LINE}/>' for x in (16, 54, 92))),
    "piano": lambda: (f'<rect x="20" y="12" width="80" height="70" rx="3" fill="{paint("--pil-piano")}" {LINE}/>'
                      f'<rect x="16" y="46" width="88" height="12" fill="var(--pil-keys)" {LINE}/>'
                      + "".join(f'<path d="M{24 + i * 8} 46 V58" stroke="var(--pil-ink)" stroke-width="1.2"/>' for i in range(10))
                      + "".join(f'<rect x="{27 + i * 8}" y="46" width="4" height="7" fill="var(--pil-ink)"/>' for i in (0, 1, 3, 4, 5, 7, 8))
                      + f'<path d="M26 82 V88 M94 82 V88" stroke="var(--pil-ink)" stroke-width="5"/>'),
    "bucket": lambda: (f'<path d="M30 28 H90 L82 84 H38 Z" fill="{paint("--pil-blue")}" {LINE}/>'
                       f'<ellipse cx="60" cy="28" rx="30" ry="7" fill="{paint("--pil-blue")}" {LINE}/>'
                       f'<path d="M30 30 Q60 -6 90 30" fill="none" stroke="var(--pil-ink)" stroke-width="2.5"/>'),
    "shovel": lambda: (f'<path d="M30 80 L88 18" stroke="var(--pil-wood)" stroke-width="7" stroke-linecap="round"/>'
                       f'<path d="M82 12 L100 6 L106 22 L94 32 Z" fill="var(--pil-wood)" {LINE}/>'
                       f'<path d="M34 72 L18 70 L12 86 L30 88 L38 80 Z" fill="var(--pil-tin)" {LINE}/>'),
    "rope": lambda: (f'<ellipse cx="60" cy="56" rx="40" ry="20" fill="none" stroke="var(--pil-ink)" stroke-width="10"/>'
                     f'<ellipse cx="60" cy="56" rx="40" ry="20" fill="none" stroke="var(--pil-rope)" stroke-width="6"/>'
                     f'<ellipse cx="60" cy="50" rx="28" ry="13" fill="none" stroke="var(--pil-ink)" stroke-width="10"/>'
                     f'<ellipse cx="60" cy="50" rx="28" ry="13" fill="none" stroke="var(--pil-rope)" stroke-width="6"/>'
                     f'<path d="M96 60 Q110 76 98 86" fill="none" stroke="var(--pil-rope)" stroke-width="6" stroke-linecap="round"/>'),
    "stump": lambda: (f'<path d="M24 34 V78 Q60 92 96 78 V34 Z" fill="var(--pil-bark)" {LINE}/>'
                      f'<ellipse cx="60" cy="34" rx="36" ry="12" fill="var(--pil-cut)" {LINE}/>'
                      '<ellipse cx="60" cy="34" rx="22" ry="7" fill="none" stroke="var(--pil-ink)" stroke-width="1.2"/>'
                      '<ellipse cx="60" cy="34" rx="9" ry="3" fill="none" stroke="var(--pil-ink)" stroke-width="1.2"/>'),
    "slide": lambda: (f'<path d="M24 86 V20 M40 86 V20" stroke="var(--pil-ink)" stroke-width="4"/>'
                      + "".join(f'<path d="M24 {28 + i * 14} H40" stroke="var(--pil-ink)" stroke-width="3"/>' for i in range(5))
                      + f'<path d="M40 20 H50 Q78 20 104 86 H92 Q70 32 46 30 H40 Z" fill="{paint("--pil-steel")}" {LINE}/>'),
}


def part_svg(key, cls="pil-thing__draw"):
    return (f'<svg class="{cls}" data-pile-draw="{attr(key)}" viewBox="0 0 120 90" aria-hidden="true" '
            f'focusable="false">{DRAW[key]()}</svg>')


# ── The checks on the room's own data ────────────────────────────────────────

def declared():
    css = CSS.read_text()
    root = re.search(r":root\s*\{(.*?)\n\}", css, re.S)
    return set(re.findall(r"(--pil-[a-z0-9-]+):\s*#", root.group(1) if root else ""))


def check_data(d):
    parts = d.get("parts") or []
    if [p.get("key") for p in parts] != PART_ORDER:
        refuse(f"the parts are {[p.get('key') for p in parts]}; Ryan's list is {PART_ORDER}, every one, in his order.")
    for p in parts:
        k = p.get("key")
        if k not in DRAW:
            refuse(f"the part {k!r} has no drawing. Every part on the Pile has its own; draw one.")
        if set(p) - {"key", "name", "one", "feel", "becomes", "paint"}:
            refuse(f"the part {k!r} carries {sorted(set(p) - {'key', 'name', 'one', 'feel', 'becomes', 'paint'})}.")
        if not (p.get("name") and p.get("feel") and re.match(r"(?:a|an|the|some) ", p.get("one") or "")):
            refuse(f"the part {k!r} has no name, does not say what it is like, or has no 'one' saying what you take "
                   "of it, a pallet or an old chair.")
        if len(p.get("becomes") or []) < 2:
            refuse(f"the part {k!r} can only become one thing. On the Pile anything can be several.")
    if any("tempura" in (p.get("name", "") + p.get("feel", "")).lower() for p in parts):
        refuse("a part says tempura, which is a batter. The paint is tempera.")
    colours = declared()
    for c in d.get("paints") or []:
        if c.get("colour") not in colours:
            refuse(f"the paint {c.get('name')!r} is {c.get('colour')!r}, which :root does not declare.")
    if not isinstance(d.get("holds"), int) or not 2 <= d["holds"] <= 8:
        refuse("holds is how many things fit in what you made, between two and eight.")
    cap = d.get("cap")
    if not isinstance(cap, int) or cap > 40:
        refuse("the quotations' cap is missing or over forty words. Raise it on purpose, with the reason, never to "
               "fit one passage.")
    for q in d.get("quotes") or []:
        if not all(q.get(f) for f in ("words", "who", "where", "page", "page_title")):
            refuse(f"the quotation {q.get('key')!r} is missing its words, who, where, or the page it was read on.")
        if cap and len((q.get("words") or "").split()) > cap:
            refuse(f"the quotation {q.get('key')!r} is over {cap} words.")
    src = d.get("sources") or {}
    for h in d.get("history") or []:
        if h.get("source") not in src:
            refuse(f"the history line {h.get('key')!r} names no source the data holds.")
    for k, s in src.items():
        if not all(s.get(f) for f in ("title", "by", "url", "read", "for")):
            refuse(f"the source for {k!r} is missing a title, a by, an address, a date read or what it is for.")
    vids = d.get("videos") or []
    if not vids:
        refuse("the old telly's rack has no films on it.")
    ids = set()
    for v in vids:
        where = f"{DATA.name}, video {v.get('id')!r}"
        if set(v) - VIDEO_KEYS:
            refuse(f"{where} carries {sorted(set(v) - VIDEO_KEYS)}: no description, no count of views or likes.")
        if not YT.match(v.get("id") or ""):
            refuse(f"{where} is not a YouTube id.")
        if v.get("id") in ids:
            refuse(f"{where} is on the rack twice.")
        ids.add(v.get("id"))
        if not RUNTIME.match(v.get("runtime") or ""):
            refuse(f"{where} has no runtime. Every button here says how long before the press.")
        if "start" in v and not (isinstance(v["start"], int) and v["start"] > 0):
            refuse(f"{where}'s start is not a number of seconds.")
        if not CHANNEL.match(v.get("channel_id") or ""):
            refuse(f"{where} has no channel id.")


def check_quotes(d):
    page = MIRROR / "glossary/play.md"
    if not page.exists():
        print("the pile: the Knowledge System mirror is not on this machine, so our Play page's quotations were "
              "not re-read this time")
        return
    flat = re.sub(r"\s+", " ", re.sub(r"\*\*", "", page.read_text()))
    for q in d.get("quotes") or []:
        if q.get("ours") and q["words"] not in flat:
            refuse(f"the quotation {q['key']!r} is not on our Play page word for word any more. Re-copy it; never "
                   "loosen this check.")


# ── The Pile ─────────────────────────────────────────────────────────────────

def splash(x, y, r, col):
    """A splat of tempera, irregular, with a drop or two run off it."""
    pts = []
    for i in range(9):
        ang = i / 9 * 6.283
        rr = r * (1.0 if i % 2 else 0.62) * (1.1 if i % 3 == 0 else 1.0)
        pts.append(f"{n(x + rr * math.cos(ang))} {n(y + rr * .8 * math.sin(ang))}")
    return (f'<path d="M{" L".join(pts)} Z" fill="var({col})" stroke="var(--pil-ink)" stroke-width="1"/>'
            f'<circle cx="{n(x + r * .3)}" cy="{n(y + r * 1.3)}" r="{n(r * .22)}" fill="var({col})"/>')


def placed(key, x, y, w, turn=0):
    """A part's own drawing, put down on the Pile with its foot at x, y, w wide,
    and turned inside the picture where it leans on something."""
    h = w * 0.75
    inner = (f'<svg x="{n(x - w / 2)}" y="{n(y - h)}" width="{n(w)}" height="{n(h)}" viewBox="0 0 120 90">'
             f'{DRAW[key]()}</svg>')
    if not turn:
        return inner
    return f'<g transform="rotate({turn} {n(x)} {n(y - h / 2)})">{inner}</g>'


def pile_svg(d):
    out = [f'<svg class="pil-pile__draw" viewBox="0 0 {W} {H}" aria-hidden="true" focusable="false">',
           f'<rect width="{W}" height="{H}" fill="var(--pil-sky)"/>',
           f'<path d="M0 262 Q300 250 600 258 Q900 266 1200 250 V{H} H0 Z" fill="var(--pil-sand)" {LINE}/>']
    # The back fence, and the big tree on the left with its rope swing.
    out.append(''.join(f'<path d="M{x} 236 V262" stroke="var(--pil-wood)" stroke-width="5" stroke-linecap="round"/>'
                       for x in range(250, 1200, 40)))
    out.append(f'<path d="M250 244 H1200" stroke="var(--pil-wood)" stroke-width="3"/>')
    out.append(f'<rect x="70" y="120" width="34" height="240" rx="6" fill="var(--pil-bark)" {LINE}/>'
               f'<path d="M104 176 Q170 156 236 172" fill="none" stroke="var(--pil-ink)" stroke-width="19" stroke-linecap="round"/>'
               f'<path d="M104 176 Q170 156 236 172" fill="none" stroke="var(--pil-bark)" stroke-width="14" stroke-linecap="round"/>')
    for cx, cy, r in ((40, 96, 74), (128, 62, 84), (222, 104, 66)):
        out.append(f'<circle cx="{cx}" cy="{cy}" r="{r + 2.5}" fill="var(--pil-ink)"/>')
    for cx, cy, r in ((40, 96, 74), (128, 62, 84), (222, 104, 66)):
        out.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="var(--pil-leaf)"/>')
    out.append(f'<path d="M206 170 V350 M230 172 V350" stroke="var(--pil-rope)" stroke-width="4"/>'
               f'<rect x="198" y="348" width="40" height="10" rx="3" fill="{paint("--pil-red")}" {LINE}/>')
    # THE PILE ITSELF: a mound of sand and earth with everything heaped up it,
    # leaning on each other, the slide coming down its right-hand side and a
    # flag of fabric stuck in the top.
    out.append(f'<path d="M560 480 Q620 330 760 236 Q850 180 930 222 Q1060 300 1140 480 Z" fill="var(--pil-sand-2)" {LINE}/>')
    out.append(placed("plywood", 690, 400, 170, -14) + placed("pallet", 790, 330, 170, 9))
    out.append(placed("pallet", 900, 420, 180, -6) + placed("plywood", 1010, 430, 150, 16))
    out.append(placed("chair", 840, 236, 110, 22) + placed("chair", 742, 470, 110, -8))
    out.append(placed("slide", 1060, 470, 220))
    out.append(placed("rope", 960, 300, 110) + placed("tape", 880, 450, 60))
    out.append(f'<path d="M868 214 V96" stroke="var(--pil-wood)" stroke-width="7"/>'
               f'<path d="M868 100 Q824 92 800 112 Q824 132 868 132 Z" fill="{paint("--pil-purple")}" {LINE}/>')
    out.append(splash(700, 370, 15, "--pil-pink") + splash(800, 300, 12, "--pil-yellow") + splash(930, 384, 14, "--pil-blue")
               + splash(1004, 410, 11, "--pil-green") + splash(752, 440, 10, "--pil-orange"))
    # The piano at the foot of the pile, the paint on it too.
    out.append(placed("piano", 600, 500, 220) + splash(560, 398, 12, "--pil-green") + splash(640, 416, 10, "--pil-red"))
    # THE DEN: two pallets stood on end, a roof of bubble wrap, a curtain of
    # fabric for a door, and the rings of light every bubble throws on the sand.
    out.append(f'<path d="M262 474 Q380 488 498 474 L494 456 Q380 470 266 456 Z" fill="var(--pil-sand-2)"/>')
    for cx, cy in ((290, 462), (322, 470), (354, 464), (386, 472), (418, 465), (450, 471), (480, 462),
                   (306, 480), (370, 482), (434, 481)):
        out.append(f'<ellipse cx="{cx}" cy="{cy}" rx="12" ry="4.5" fill="none" stroke="var(--pil-ring)" stroke-width="3"/>'
                   f'<ellipse cx="{cx}" cy="{cy}" rx="12" ry="4.5" fill="none" stroke="var(--pil-ink)" stroke-width=".8"/>')
    out.append(placed("pallet", 282, 480, 150).replace('<svg ', '<svg preserveAspectRatio="none" ', 1))
    out.append(placed("pallet", 480, 480, 150))
    out.append(f'<path d="M222 372 L540 372 L520 348 L242 348 Z" fill="var(--pil-wrap)" {LINE}/>'
               + "".join(f'<circle cx="{254 + i * 21}" cy="360" r="6" fill="none" stroke="var(--pil-ink)" stroke-width="1.2"/>'
                         for i in range(13)))
    out.append(f'<path d="M352 372 Q370 420 366 470 L402 470 Q406 420 424 372 Z" fill="{paint("--pil-cloth")}" {LINE}/>')
    out.append(splash(250, 420, 12, "--pil-yellow") + splash(500, 410, 11, "--pil-blue"))
    # In front: stumps, buckets, shovels, a heap of sand, paint pots, a coil of
    # rope, and the old telly on the near stump.
    out.append(placed("sand", 130, 596, 190) + placed("bucket", 222, 596, 76) + placed("shovel", 300, 596, 120))
    out.append(placed("paint", 430, 596, 86) + placed("paint", 500, 596, 70) + placed("rope", 610, 596, 130))
    out.append(placed("stump", 760, 596, 120) + placed("bucket", 870, 596, 80) + placed("stump", 1100, 596, 150))
    out.append(f'<rect x="1046" y="452" width="108" height="80" rx="10" fill="var(--pil-piano)" {LINE}/>'
               f'<rect x="1058" y="462" width="70" height="58" rx="8" fill="var(--pil-screen)" {LINE}/>'
               f'<circle cx="1142" cy="478" r="5" fill="var(--pil-tin)"/><circle cx="1142" cy="498" r="5" fill="var(--pil-tin)"/>'
               f'<path d="M1074 452 L1058 420 M1120 452 L1138 418" stroke="var(--pil-ink)" stroke-width="2.5"/>')
    out.append("</svg>")
    return "".join(out)


# ── What you made ────────────────────────────────────────────────────────────

def build_svg(d):
    holds = d["holds"]
    out = [f'<svg class="pil-build__draw" viewBox="0 0 {BW} {BH}" aria-hidden="true" focusable="false" data-pile-build>',
           f'<rect width="{BW}" height="{BH}" fill="var(--pil-sky)"/>',
           f'<path d="M0 210 Q600 190 1200 210 V{BH} H0 Z" fill="var(--pil-sand)" {LINE}/>']
    w = BW / holds
    for i in range(holds):
        out.append(f'<g data-pile-slot="{i}" data-x="{n(i * w + 10)}" data-y="60" data-w="{n(w - 20)}" data-h="{n((w - 20) * .75)}"></g>')
    out.append("</svg>")
    return "".join(out)


def parts_block(d):
    out = ['    <ul class="pil-things">']
    for p in d["parts"]:
        out.append(f'      <li class="pil-thing" id="pil-thing-{p["key"]}" data-pile-part="{attr(p["key"])}" '
                   f'data-pile-name="{attr(p["name"])}" data-pile-one="{attr(p["one"])}" data-pile-paint="{"yes" if p.get("paint") else "no"}" '
                   f'data-pile-becomes="{attr(json.dumps(p["becomes"]))}">\n'
                   f'        {part_svg(p["key"])}\n'
                   f'        <h3 class="pil-thing__name">{esc(p["name"])}</h3>\n'
                   f'        <p class="pil-thing__feel">{esc(p["feel"][:1].upper() + p["feel"][1:])}.</p>\n'
                   f'        <p class="pil-thing__been">It has been {esc(", ".join(p["becomes"][:-1]))} and {esc(p["becomes"][-1])}, '
                   f'and it is whatever you say it is.</p>\n'
                   '      </li>')
    out.append('    </ul>')
    return "\n".join(out)


def make_block(d):
    opts = "".join(f'<option value="{attr(p["key"])}">{esc(p["name"])}</option>' for p in d["parts"])
    paints = "".join(f'<option value="{attr(c["colour"])}">{esc(c["name"])}</option>' for c in d["paints"])
    return (f'    <div class="pil-make" data-pile-make hidden>\n'
            f'      <p class="pil-make__row"><label class="pil-make__lab" for="pil-what">Take</label> '
            f'<select class="pil-make__pick" id="pil-what" data-pile-what>{opts}</select> '
            f'<label class="pil-make__lab" for="pil-as">and make it</label> '
            f'<select class="pil-make__pick" id="pil-as" data-pile-as></select> '
            f'<button type="button" class="pil-btn" data-pile-add>Put it on</button></p>\n'
            f'      <p class="pil-make__row"><label class="pil-make__lab" for="pil-colour">Paint the last thing you put on</label> '
            f'<select class="pil-make__pick" id="pil-colour" data-pile-colour>{paints}</select> '
            f'<button type="button" class="pil-btn pil-btn--quiet" data-pile-paint>Paint it</button> '
            f'<button type="button" class="pil-btn pil-btn--quiet" data-pile-down>Knock it all down</button></p>\n'
            f'      <p class="pil-make__said" data-pile-said aria-hidden="true" hidden></p>\n'
            f'      <div class="pil-build">{build_svg(d)}</div>\n'
            f'      <p class="pil-make__words" data-pile-words></p>\n'
            '    </div>')


def history_block(d):
    out = ['    <ul class="pil-history">']
    for h in d["history"]:
        s = d["sources"][h["source"]]
        out.append(f'      <li>{esc(h["say"])} <span class="pil-history__src">(<a href="{attr(s["url"])}">{esc(s["title"])}</a>, '
                   f'{esc(s["by"])})</span></li>')
    out.append('    </ul>')
    return "\n".join(out)


def quote_block(q):
    return (f'    <figure class="pil-quote">\n'
            f'      <blockquote><p>{esc(q["words"])}</p></blockquote>\n'
            f'      <figcaption>{esc(q["who"][:1].upper() + q["who"][1:])}, {esc(q["where"])}: '
            f'<a href="{attr(q["page"])}">{esc(q["page_title"])}</a>.</figcaption>\n'
            '    </figure>')


def reading_block(d):
    out = ['    <ul class="pil-reading">']
    for r in d["reading"]:
        out.append(f'      <li><a href="{attr(r["url"])}">{esc(r["title"])}</a>, {esc(r["site"])}</li>')
    out.append('    </ul>')
    return "\n".join(out)


def day(iso):
    y, m, dd = (int(x) for x in iso.split("-"))
    return f"{dd} {MONTHS[m - 1]} {y}"


def rack_block(d):
    sid, sname = SCREEN
    out = [f'    <div class="pil-screen" data-rack-screen="{sid}" tabindex="-1" hidden>',
           '      <p class="pil-screen__idle"><span><b>The old telly on the Pile.</b> It works, and nobody knows why. '
           'Nothing is on it: any film on the rack can go up here with the button under it, and nothing loads until '
           'you press one.</span></p>',
           '    </div>',
           f'    <p class="pil-screen__now" data-rack-now="{sid}" tabindex="-1" hidden></p>',
           f'    <p class="pil-screen__back" hidden><button type="button" class="pil-btn pil-btn--quiet" '
           f'data-rack-back="{sid}">Take it off the telly</button></p>',
           '    <details class="pil-rack" open>',
           '      <summary class="pil-rack__sum">The rack: adventure playgrounds, here and there</summary>',
           '      <ul class="pil-vids">']
    for v in d["videos"]:
        t, c, r = esc(v["title"]), esc(v["channel"]), v["runtime"]
        st = v.get("start")
        from_ = f", from {st // 60}:{st % 60:02d} in, where Ryan&rsquo;s link starts" if st else ""
        from_attr = f' data-embed-start="{st}"' if st else ""
        out += ['        <li class="pil-vid" data-rack-card>',
                f'          <h3 class="pil-vid__title">{t}</h3>',
                f'          <p class="pil-vid__by">{c} &middot; {day(v["published"])} &middot; {r}</p>',
                f'          <button type="button" class="facade" data-embed-id="{v["id"]}"{from_attr} data-embed-title="{attr(v["channel"])} &mdash; {attr(v["title"])}">',
                f'            Watch it here &mdash; {r}{from_}',
                '            <span class="facade__play">&#9654; PRESS PLAY</span>',
                '          </button>',
                f'          <button type="button" class="pil-btn pil-btn--quiet pil-vid__big" hidden data-rack-to="{sid}" '
                f'data-rack-name="{sname}" data-rack-src="https://www.youtube-nocookie.com/embed/{v["id"]}?autoplay=1&amp;rel=0" '
                f'data-rack-title="{attr(v["channel"])} &mdash; {attr(v["title"])}, on {sname}" data-rack-film="{attr(v["title"])}" '
                f'data-rack-runtime="{r}">Put it on the telly &mdash; {r}</button>',
                '        </li>']
    out += ['      </ul>', '    </details>']
    return "\n".join(out)


def liner_sources(d):
    rows = [(v["for"], f'<a href="{attr(v["url"])}">{esc(v["title"])}</a>, {esc(v["by"])}, read {esc(v["read"])}')
            for v in d["sources"].values()]
    chans = []
    for v in d["videos"]:
        link = f'<a href="https://www.youtube.com/channel/{v["channel_id"]}">{esc(v["channel"])}</a>'
        if link not in chans:
            chans.append(link)
    rows.append(("The films on the rack",
                 "Ryan Boren’s pick, of 2026-10-05, in his order, each on its own channel on YouTube: "
                 + ", ".join(chans[:-1]) + " and " + chans[-1]
                 + ". None of them is affiliated with Stimpunks, and nothing of theirs is hosted here"))
    rows.append(("The pages to read",
                 "Ryan Boren’s six, of 2026-10-05: " + ", ".join(
                     f'<a href="{attr(r["url"])}">{esc(r["title"])}</a> ({esc(r["site"])})' for r in d["reading"])))
    return "\n".join(f'      <tr><td>{esc(w)}</td><td>{src}</td></tr>' for w, src in rows)


# ── The script and the page as written ───────────────────────────────────────

def check_script():
    if not SCRIPT.exists():
        refuse(f"{SCRIPT.name} is missing, and making something with it.")
        return
    js = pekoe.code_of(SCRIPT)
    if pekoe.KEEPS.search(js) or "fetch(" in js or pekoe.WIRE.search(js):
        refuse(f"{SCRIPT.name} stores or sends something. What you made lives in the page and is gone when you go.")
    if any(w in js for w in pekoe.WRITES_HTML):
        refuse(f"{SCRIPT.name} writes HTML.")
    if re.search(r"\btransform\b|rotate", js):
        refuse(f"{SCRIPT.name} tilts or moves something with a transform.")
    sweep(" ".join(re.findall(r"'([^'\\]*(?:\\.[^'\\]*)*)'", js)), SCRIPT.name)


def check_page():
    src = PAGE.read_text()
    for want, why in (('src="pile.js"', "it does not load pile.js, where you make something"),
                      ('src="love-embed.js"', "it does not load love-embed.js, so every film would press and do nothing"),
                      ('src="rack.js"', "it does not load rack.js, so no film could go up on the telly"),
                      ('href="the-green.html"', "it has no gate through to the Green next door"),
                      ('href="https://stimpunks.org/glossary/play/#h-play-is-learning"', "it does not link our Play page's Play Is Learning"),
                      ('data-pile-says', "it has no live region for what you made")):
        if want not in src:
            refuse(f"{PAGE.name}: {why}.")
    plain = re.sub(r"<script\b.*?</script>", " ", src, flags=re.S)
    plain = re.sub(r'<(h3|p) class="pil-vid__(?:title|by)">.*?</\1>', " ", plain, flags=re.S)
    plain = re.sub(r'data-(?:embed|rack)-(?:title|film)="[^"]*"', " ", plain)
    plain = re.sub(r"<blockquote>.*?</blockquote>", " ", plain, flags=re.S)
    plain = re.sub(r'<ul class="pil-reading">.*?</ul>', " ", plain, flags=re.S)
    plain = re.sub(r"<!--.*?-->", " ", plain, flags=re.S)
    sweep(plain, PAGE.name)


def section_css():
    css = CSS.read_text()
    m = re.search(rf"/\* §{SECTION} ── ROOM: The Pile.*?(?=/\* §\d+ ── )", css, re.S)
    if not m:
        refuse(f"love.css has no §{SECTION} for The Pile, followed by another section.")
        return
    body = re.sub(r"/\*.*?\*/", " ", m.group(0), flags=re.S)
    if re.search(r"#[0-9a-fA-F]{3,6}\b|rgba?\(|hsla?\(", body):
        refuse(f"love.css §{SECTION} has a literal colour in it.")
    if re.search(r"transform\s*:\s*(?:rotate|skew)", body):
        refuse(f"love.css §{SECTION} rotates or skews something.")
    for rule in re.finditer(r"([^{}]+)\{([^}]*)\}", body):
        if "Rubik Wet Paint" in rule.group(2) and rule.group(1).strip() != ".junkpile h1":
            refuse(f"love.css §{SECTION} sets Rubik Wet Paint on {rule.group(1).strip()!r}. The dripping face sets the "
                   "Pile's name and nothing else.")
    root = re.search(r":root\s*\{(.*?)\n\}", css, re.S).group(1)
    for name in re.findall(r"(--pil-[a-z0-9-]+):", root):
        if re.search(r"light|glow|lamp|sun", name):
            refuse(f"{name} is named for a light. The light on the Pile has no colour; all of its colour is paint.")


def main():
    d = json.loads(DATA.read_text())
    check_data(d)
    check_quotes(d)
    for k in ("_what", "_light", "_parts", "_history"):
        sweep(d.get(k, ""), f"{DATA.name} {k}")
    for p in d.get("parts") or []:
        sweep(p.get("feel", "") + ". " + ", ".join(p.get("becomes") or []), f"{DATA.name}, {p.get('name')}")
    for h in d.get("history") or []:
        sweep(h.get("say", ""), f"{DATA.name}, history {h.get('key')}")
    if problems:
        print("REFUSING:\n  " + "\n  ".join(dict.fromkeys(problems)))
        sys.exit(1)
    swap(PAGE, "pil:pile", "      " + pile_svg(d), "      ")
    swap(PAGE, "pil:make", make_block(d), "    ")
    swap(PAGE, "pil:parts", parts_block(d), "    ")
    swap(PAGE, "pil:history", history_block(d), "    ")
    for q in d["quotes"]:
        swap(PAGE, f"pil:quote-{q['key']}", quote_block(q), "    ")
    swap(PAGE, "pil:reading", reading_block(d), "    ")
    swap(PAGE, "pil:rack", rack_block(d), "    ")
    swap(NOTES, "pile-sources", liner_sources(d), "      ")
    check_script()
    check_page()
    section_css()
    if problems:
        print("REFUSING (the page as written):\n  " + "\n  ".join(dict.fromkeys(problems)))
        sys.exit(1)
    print("the pile: the Pile and its den, every part with its own drawing, the place to make something, the history, "
          "the quotations, the reading, the old telly's rack and the credits written; nothing on it is for anything")


if __name__ == "__main__":
    main()
