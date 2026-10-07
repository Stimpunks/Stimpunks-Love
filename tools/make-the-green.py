#!/usr/bin/env python3
"""Build The Green, the community green space on the street, out of
data/the-green.json: the view from the porch, the plan of the trail round the
pond with every stop on it, the trailhead sign, the screen under the porch roof
and its rack, and the room's credits in the liner notes.

WHAT THE ROOM IS. Ryan Boren's brief, 2026-10-05, the third of the outdoor lots
side by side where the buildings stop, next to the Truck Stop: a community green
space with a covered porch, heavily wooded, with a wooden, accessible trail that
goes in a meandering circle lined with beds of plants, flowers and vegetables
you can eat, and a pond in the centre.

IT HAS JUST STOPPED RAINING, AND THAT IS THE LIGHT. There is no sun on the Green,
so NOTHING CASTS A SHADOW, and everything wet holds a line of the pale sky along
its top edge: every leaf, every board, every rail, every card on the page. The
tool refuses a shadow in the drawing and a --grn- colour named for one, and the
vocabulary of sunshine in the room's voice with the negation window. If the sun
ever comes out on the Green, it has become the Garden with a pond in it.

THE TRAIL IS BUILT TO THE ACCESS BOARD'S STANDARD, AND THE SIGN SAYS SO. Section
1017 of the Architectural Barriers Act standards, Trails, read 2026-10-05: a
firm, stable surface, a tread 36 inches wide at least, cross slope no steeper
than 1:48, openings no wider than half an inch, resting places 60 inches long.
1017.10 asks a trailhead sign for the trail's length, its surface, its typical
and minimum tread width, its typical and maximum running slope and its typical
and maximum cross slope, and the Green's sign gives every one. The tool refuses
a figure outside the standard, and a sign missing one, because a trail that says
it is accessible and is not is the claim this street exists to check.

NOTHING ON THE TRAIL IS COUNTED. A walking trail is the shape of thing a page
fills with a step counter, laps and calories, and that turns a walk into
exercise; the tool refuses the vocabulary. Where you are is said as the stop's
name, never as a number out of a total.

NOTHING ON THE GREEN IS FOR ANYTHING, and the tool refuses the claim that it is.
Every page about green space says what it does for your mental health; the
rack's titles say so, in the channels' words, and those are not swept. The
room's own sentences are.

NOTHING HERE IS A FIELD GUIDE. Every plant on the Green was planted, is in a bed,
and is named by its common name only: the herbarium's rule, because a Latin name
typed from memory reads as a determination when it was a guess, and its shape
test (one capitalised word and one lowercase word) is run over every plant's
name. The vegetable beds were planted to be eaten and anybody may pick from
them; the room never says anything else growing anywhere is safe to eat, and
refuses the vocabulary of foraging.

THE SECOND RACK IS A SEARCH, AND NOBODY HERE CHOSE WHAT IS ON IT. Ryan's brief,
2026-10-07: the latest videos from a YouTube search for cities and towns making
room for green. tools/pull-green-latest.py asks the search every morning on the
timer in tools/daily-green.sh, and this runs with --latest so that only that
rack is redrawn. It refuses a row older than the week, a row carrying anything
but an id, a title, a channel, a time, a length and the search that found it, a
title that does not say what its search asked for, two of one channel or one
title, a row its own channel filed under a game or music, and a rack over
Ryan's number. The titles are the channels' and are not swept; the rack says
nobody here watched them first.

THE QUOTATIONS ARE OURS, AND CHECKED. Both were read on our own Nature page and
are checked against the Knowledge System mirror's copy of it word for word on
every build when the mirror is there, the Town Hall's rule.

IF THIS REFUSES: fix the cause. Do not widen a list to make it quiet.
"""
import html
import importlib.util
import json
import math
import re
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parent.parent
TOOLS = ROOT / "tools"
DATA = ROOT / "data/the-green.json"
LATEST = ROOT / "data/the-green-latest.json"
PAGE = ROOT / "the-green.html"
NOTES = ROOT / "liner-notes.html"
CSS = ROOT / "love.css"
SCRIPT = ROOT / "green.js"
MIRROR = Path.home() / "Documents/Claude/Projects/Stimpunks Knowledge System/site/stimpunks.org"
SECTION = 98

W, H = 1200, 560      # the view from the porch
PW, PH = 600, 400     # the plan of the trail
YT = re.compile(r"^[A-Za-z0-9_-]{11}$")
CHANNEL = re.compile(r"^UC[A-Za-z0-9_-]{22}$")
RUNTIME = re.compile(r"^(?:\d+:[0-5]\d|\d+:[0-5]\d:[0-5]\d)$")
VIDEO_KEYS = {"id", "title", "channel", "channel_id", "runtime", "published"}
STOP_KEYS = {"key", "name", "x", "y", "rest", "bed", "picking", "plants", "words", "notice"}
SCREEN = ("grn", "the screen under the porch roof")
MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August",
          "September", "October", "November", "December"]
HERE = ZoneInfo("America/Denver")
LATEST_KEYS = {"id", "title", "channel", "published", "runs", "search"}
SEEN_KEYS = {"id", "search", "title", "channel", "published", "runs", "state", "why"}
SEEN_STATES = {"screen", "door", "gone", "pending", "left"}
SEARCH_KEYS = {"key", "topic", "q", "has"}
# Common names that LOOK like a genus and an epithet: added on purpose, one at
# a time, never by guessing at endings (the herbarium's lesson).
PLAIN = {"Swiss chard"}

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
# THE SECOND RACK'S RULES ARE THE PULLER'S, READ RATHER THAN RESTATED: the week,
# Ryan's number, what is left off and how a title is read are written once, in
# tools/pull-green-latest.py, so the tool that chooses and the tool that refuses
# cannot disagree. Importing it touches no network; only its main() does.
pull = tool("pull-green-latest")
WEEK, RACK, LEFT_OFF = pull.WEEK, pull.RACK, pull.LEFT_OFF


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
SUN = r"sunny|sunshine|sunlit|sunlight|the sun (?:is|has come|came) out|in the sun|sunbeams?|shadows? fall"
COUNT = (r"steps? counted|step counts?|pedometers?|laps?|calories|kcal|workouts?|fitness|exercise|"
         r"\d[\d,]* steps|personal bests?|pace|distance walked|miles walked")
CLAIM = (r"heals?|healing|therap\w+|well-?being|wellness|mental health|stress relief|relieves? stress|"
         r"benefits?|boosts?|good for you|cures?|restorative")
FORAGE = r"forag\w+|wild[- ]picked|identify|identification|safe to eat|edible wild|wild food"
VOCAB = [
    (SUN, "sunshine. It has just stopped raining on the Green, there is no sun, and nothing casts a shadow."),
    (COUNT, "a count, or exercise. Nothing on the trail is counted: a walk round the pond is a walk."),
    (CLAIM, "a claim about what the Green does for somebody. The rack's titles say that, in the channels' "
            "words; the room never does."),
    (FORAGE, "foraging. Everything on the Green that is eaten was planted to be, in a bed; nothing here is a "
             "field guide."),
]


def sweep(text, where):
    text = html.unescape(re.sub(r"<[^>]+>", " ", str(text)))
    for pat, why in VOCAB:
        for m in re.finditer(rf"\b(?:{pat})\b", text, re.I):
            window = text[max(0, m.start() - 80):m.end()]
            if re.search(rf"\b{NEGATION}\b[^.]{{0,70}}?\b(?:{pat})", window, re.I):
                continue
            refuse(f"{where}: {m.group(0)!r} -- {why}")


def binomial(name):
    """The herbarium's shape test: a capitalised word and then a lowercase
    word, as a Latin name is written. Common names in PLAIN pass on purpose."""
    if name in PLAIN:
        return False
    return bool(re.match(r"^[A-Z][a-z]+ [a-z]+", name))


# ── The checks on the room's own data ────────────────────────────────────────

def ratio_of(s):
    m = re.fullmatch(r"1:(\d+)", s or "")
    return int(m.group(1)) if m else None


def check_trail(t):
    for k in ("length", "surface", "tread_typical_in", "tread_min_in", "running_typical", "running_max",
              "cross_typical", "cross_max", "openings_in", "rest"):
        if t.get(k) in (None, ""):
            refuse(f"the trailhead sign has no {k}. ABA 1017.10 asks a trailhead sign for the length, the surface, "
                   "the typical and minimum tread width, and the typical and maximum running and cross slopes.")
    if (t.get("tread_min_in") or 0) < 36:
        refuse("the trail's tread is narrower than 36 inches somewhere, the minimum in ABA 1017.3.")
    if (t.get("tread_min_in") or 0) < 60 and "passing" not in t:
        refuse("the trail is narrower than 60 inches, so ABA 1017.4 asks for passing spaces every 1000 feet; "
               "say where they are.")
    for k in ("cross_typical", "cross_max"):
        r = ratio_of(t.get(k))
        if not r or r < 48:
            refuse(f"the trail's {k} is {t.get(k)!r}; ABA 1017.7.2 allows no cross slope steeper than 1:48.")
    for k in ("running_typical", "running_max"):
        r = ratio_of(t.get(k))
        if not r or r < 20:
            refuse(f"the trail's {k} is {t.get(k)!r}. The Green says nothing on it is steeper than 1:20, which "
                   "keeps every part of it out of ABA 1017.7.1's limits on steeper segments.")
    if (t.get("openings_in") or 1) > 0.5:
        refuse("the gaps between the boards are wider than half an inch, which ABA 1017.6 refuses.")
    if not re.search(r"\bfirm\b|\bboards\b", t.get("surface") or ""):
        refuse("the trail's surface does not say what it is. ABA 1017.2 asks for firm and stable.")
    if "60 inches" not in (t.get("rest") or ""):
        refuse("the resting places do not say they are 60 inches long, ABA 1017.8.1's minimum.")


def check_data(d):
    check_trail(d.get("trail") or {})
    stops = d.get("stops") or []
    if not stops or stops[0].get("key") != "porch":
        refuse("the trail starts at the porch, and so does its list of stops.")
    keys = set()
    for s in stops:
        k = s.get("key")
        where = f"{DATA.name}, stop {k!r}"
        if set(s) - STOP_KEYS:
            refuse(f"{where} carries {sorted(set(s) - STOP_KEYS)}, which nothing reads.")
        if k in keys:
            refuse(f"two stops are keyed {k!r}.")
        keys.add(k)
        for f in ("name", "words", "notice"):
            if not (s.get(f) or "").strip():
                refuse(f"{where} has no {f}. Every stop says what is there and what you might notice, in words, "
                       "because the plan is a picture.")
        if not (0 <= s.get("x", -1) <= PW and 0 <= s.get("y", -1) <= PH):
            refuse(f"{where} is off the plan.")
        if s.get("bed") and not s.get("plants"):
            refuse(f"{where} is a bed with nothing planted in it.")
        for p in s.get("plants") or []:
            if binomial(p):
                refuse(f"{where}: {p!r} is shaped like a Latin name. Every plant on the Green is named by its common "
                       "name; if this one is a common name, add it to PLAIN on purpose.")
        if s.get("picking") and not s.get("bed"):
            refuse(f"{where} says you may pick there and is not a bed. Only what was planted to be eaten is picked.")
    if not any(s.get("picking") for s in stops):
        refuse("no bed on the trail has vegetables to pick, and the brief's beds have vegetables you can eat.")
    for a, b in zip(stops, stops[1:] + stops[:1]):
        if math.hypot(a["x"] - b["x"], a["y"] - b["y"]) > 260:
            refuse(f"the stops {a['key']!r} and {b['key']!r} are too far apart on the plan to be the next stop along.")

    for q in d.get("quotes") or []:
        if not all(q.get(f) for f in ("words", "who", "work", "year", "page", "page_title")):
            refuse(f"the quotation {q.get('key')!r} is missing its words, who, the work, the year or our page.")
        if len((q.get("words") or "").split()) > 30:
            refuse(f"the quotation {q.get('key')!r} is over thirty words.")

    vids = d.get("videos") or []
    if not vids:
        refuse("the screen's rack has no films on it.")
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
        if not CHANNEL.match(v.get("channel_id") or ""):
            refuse(f"{where} has no channel id.")
        if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", v.get("published") or ""):
            refuse(f"{where} has no day it went up.")
    src = d.get("sources") or {}
    for k in ("trails", "beds", "petrichor", "nature"):
        s = src.get(k) or {}
        if not all(s.get(f) for f in ("title", "by", "url", "read", "for")):
            refuse(f"the source for {k!r} is missing a title, a by, an address, a date read or what it is for.")


def check_quotes(d):
    """Word for word against our own page, when the mirror is on this machine."""
    page = MIRROR / "glossary/nature.md"
    if not page.exists():
        print("the green: the Knowledge System mirror is not on this machine, so the quotations were not re-read "
              "against our Nature page this time")
        return
    text = page.read_text()
    flat = re.sub(r"\*\*", "", text)
    flat = re.sub(r"\s+", " ", flat)
    for q in d.get("quotes") or []:
        if q["words"] not in flat:
            refuse(f"the quotation {q['key']!r} is not on our Nature page word for word any more. Re-copy it from "
                   "the page; never loosen this check.")


# ── The view from the porch ──────────────────────────────────────────────────
# Everything wet holds a line of the pale sky along its top edge. Nothing casts
# a shadow. Everything is outlined in --grn-ink.

LINE = 'stroke="var(--grn-ink)" stroke-width="2.5" stroke-linejoin="round"'
SHEEN = 'fill="none" stroke="var(--grn-sheen)" stroke-width="2.5" stroke-linecap="round"'


def canopy(cx, cy, r, fill="--grn-wood"):
    """A tree's mass of leaves, wet, with the sky caught along its top."""
    a, b = cx - r * .7, cx + r * .7
    return (f'<circle cx="{n(cx)}" cy="{n(cy)}" r="{n(r)}" fill="var({fill})" {LINE}/>'
            f'<path d="M{n(a)} {n(cy - r * .55)} Q{n(cx)} {n(cy - r * 1.18)} {n(b)} {n(cy - r * .55)}" {SHEEN}/>')


def bed(x, y, w, plants_svg):
    return (f'<rect x="{n(x)}" y="{n(y)}" width="{n(w)}" height="30" rx="3" fill="var(--grn-timber)" {LINE}/>'
            f'<path d="M{n(x + 4)} {n(y + 2)} H{n(x + w - 4)}" {SHEEN}/>' + plants_svg)


def herbs(x, y, w):
    out = []
    for i in range(int(w // 34)):
        cx = x + 18 + i * 34
        out.append(f'<ellipse cx="{n(cx)}" cy="{n(y - 12)}" rx="16" ry="13" fill="var(--grn-sage)" {LINE}/>')
        if i % 2:
            out.append(f'<path d="M{n(cx - 6)} {n(y - 22)} l-2 -14 M{n(cx + 4)} {n(y - 22)} l2 -16" stroke="var(--grn-lavender)" '
                       'stroke-width="5" stroke-linecap="round"/>')
    return "".join(out)


def veg(x, y, w):
    out = []
    for i in range(int(w // 44)):
        cx = x + 22 + i * 44
        out.append(f'<path d="M{n(cx)} {n(y)} V{n(y - 50)}" stroke="var(--grn-cane)" stroke-width="3"/>'
                   f'<ellipse cx="{n(cx)}" cy="{n(y - 26)}" rx="18" ry="22" fill="var(--grn-leaf)" {LINE}/>'
                   f'<circle cx="{n(cx - 6)}" cy="{n(y - 22)}" r="5" fill="var(--grn-tomato)" stroke="var(--grn-ink)" stroke-width="1.2"/>'
                   f'<circle cx="{n(cx + 7)}" cy="{n(y - 30)}" r="4.5" fill="var(--grn-tomato)" stroke="var(--grn-ink)" stroke-width="1.2"/>')
    return "".join(out)


def flowers(x, y, w):
    out = []
    cols = ("--grn-cone", "--grn-gold", "--grn-cone", "--grn-aster")
    for i in range(int(w // 26)):
        cx = x + 13 + i * 26
        h = 30 + (i * 7) % 18
        out.append(f'<path d="M{n(cx)} {n(y)} V{n(y - h)}" stroke="var(--grn-leaf)" stroke-width="3"/>'
                   f'<circle cx="{n(cx)}" cy="{n(y - h)}" r="7" fill="var({cols[i % 4]})" stroke="var(--grn-ink)" stroke-width="1.2"/>')
    return "".join(out)


def rushes(x, y, w):
    return "".join(f'<path d="M{n(x + 8 + i * 12)} {n(y)} q{(-1) ** i * 6} -24 {(-1) ** i * 2} -{44 + (i % 3) * 8}" fill="none" '
                   f'stroke="var(--grn-reed)" stroke-width="3" stroke-linecap="round"/>' for i in range(int(w // 12)))


def view_svg(d):
    out = [f'<svg class="grn-view__draw" viewBox="0 0 {W} {H}" aria-hidden="true" focusable="false">',
           f'<rect width="{W}" height="{H}" fill="var(--grn-lawn)"/>',
           f'<rect width="{W}" height="250" fill="var(--grn-sky)"/>']
    # The wood all round, the far side first: a low row of distant trees across
    # the back, where the pond opens the sky up over it, then the near trees.
    for cx in range(330, 900, 46):
        out.append(canopy(cx, 278 - (cx * 7) % 13, 30 + (cx * 3) % 9, "--grn-wood-2"))
    for cx, cy, r in ((70, 200, 110), (230, 170, 120), (390, 210, 90), (810, 205, 95), (960, 170, 120), (1130, 200, 110)):
        out.append(canopy(cx, cy, r, "--grn-wood-2"))
    for cx, cy, r in ((40, 270, 80), (180, 255, 85), (330, 280, 70), (870, 280, 70), (1020, 255, 85), (1160, 270, 80)):
        out.append(canopy(cx, cy, r))
    out.append(f'<rect y="300" width="{W}" height="{H - 300}" fill="var(--grn-lawn)"/>'
               f'<path d="M0 300 H{W}" {SHEEN}/>')
    # The pond, with the sky lying in it and the last of the rain's rings.
    out.append(f'<ellipse cx="600" cy="372" rx="300" ry="62" fill="var(--grn-pond)" {LINE}/>'
               '<ellipse cx="600" cy="360" rx="240" ry="20" fill="var(--grn-pond-sky)"/>')
    for cx, cy, r in ((480, 378, 26), (640, 392, 18), (740, 368, 30), (560, 352, 14), (690, 404, 10)):
        out.append(f'<ellipse cx="{cx}" cy="{cy}" rx="{r}" ry="{n(r * .32)}" {SHEEN}/>'
                   f'<ellipse cx="{cx}" cy="{cy}" rx="{n(r * .5)}" ry="{n(r * .16)}" {SHEEN}/>')
    for cx in (360, 392, 830):
        out.append(f'<ellipse cx="{cx}" cy="{386 if cx < 800 else 394}" rx="16" ry="5" fill="var(--grn-leaf)" {LINE}/>')
    # The boardwalk's far side, behind the pond, and the bridge over the
    # outflow on the right; then the beds along it.
    out.append('<path d="M230 352 Q300 316 600 306 Q900 316 970 352" fill="none" stroke="var(--grn-ink)" stroke-width="16" stroke-linecap="round"/>'
               '<path d="M230 352 Q300 316 600 306 Q900 316 970 352" fill="none" stroke="var(--grn-board)" stroke-width="11" stroke-linecap="round"/>'
               '<path d="M236 346 Q300 312 600 302 Q900 312 964 346" fill="none" stroke="var(--grn-sheen)" stroke-width="2"/>')
    out.append(bed(420, 290, 150, flowers(424, 290, 146)))
    out.append(bed(640, 292, 130, flowers(644, 292, 126)))
    out.append(f'<path d="M980 360 q40 -18 80 0" fill="none" stroke="var(--grn-ink)" stroke-width="16"/>'
               '<path d="M980 360 q40 -18 80 0" fill="none" stroke="var(--grn-board)" stroke-width="11"/>'
               f'<path d="M984 354 q36 -16 72 0" {SHEEN}/>'
               f'<ellipse cx="1020" cy="420" rx="70" ry="18" fill="var(--grn-pond-sky)" {LINE}/>' + rushes(960, 432, 120))
    # The boardwalk's near side, wide, in front of the pond, with the herb bed
    # and the vegetable beds along it on the left and the fern bed on the right.
    out.append('<path d="M120 430 Q280 520 600 528 Q920 520 1080 430" fill="none" stroke="var(--grn-ink)" stroke-width="58" stroke-linecap="round"/>'
               '<path d="M120 430 Q280 520 600 528 Q920 520 1080 430" fill="none" stroke="var(--grn-board)" stroke-width="52" stroke-linecap="round"/>')
    for (x0, y0), (cx, cy), (x1, y1) in (((120, 430), (280, 520), (600, 528)), ((600, 528), (920, 520), (1080, 430))):
        for t in range(1, 20):
            u = t / 20
            x = (1 - u) ** 2 * x0 + 2 * (1 - u) * u * cx + u ** 2 * x1
            y = (1 - u) ** 2 * y0 + 2 * (1 - u) * u * cy + u ** 2 * y1
            out.append(f'<path d="M{n(x)} {n(y - 22)} V{n(y + 22)}" stroke="var(--grn-ink)" stroke-width="1.2" opacity=".35"/>')
    out.append('<path d="M128 410 Q284 496 600 502 Q916 496 1072 410" fill="none" stroke="var(--grn-sheen)" stroke-width="2.5"/>')
    out.append(bed(20, 404, 150, veg(24, 404, 146)))
    out.append(bed(180, 452, 120, herbs(184, 452, 116)))
    out.append(bed(930, 452, 140, "".join(
        f'<path d="M{n(940 + i * 26)} 452 q-14 -26 0 -46 q14 20 0 46" fill="var(--grn-fern)" {LINE}/>' for i in range(5))))
    # The porch you are standing on: the roof's edge, still dripping, the
    # posts, and the rail along the front with water standing on it.
    out.append(f'<rect x="-4" y="-4" width="{W + 8}" height="40" fill="var(--grn-roof)" {LINE}/>'
               f'<path d="M-4 36 H{W + 4}" {SHEEN}/>')
    for x in range(26, W, 52):
        out.append(f'<path d="M{x} 38 q-4 8 0 12 q4 -4 0 -12 Z" fill="var(--grn-sheen)" stroke="var(--grn-ink)" stroke-width="1"/>')
    for x in (14, W - 14):
        out.append(f'<rect x="{x - 9}" y="34" width="18" height="{H - 34}" fill="var(--grn-timber)" {LINE}/>'
                   f'<path d="M{x - 6} 40 V{H}" stroke="var(--grn-sheen)" stroke-width="2"/>')
    out.append(f'<rect x="-4" y="{H - 22}" width="{W + 8}" height="26" fill="var(--grn-timber)" {LINE}/>'
               f'<path d="M-4 {H - 21} H{W + 4}" {SHEEN}/>')
    for x in range(60, W, 140):
        out.append(f'<ellipse cx="{x}" cy="{H - 24}" rx="5" ry="3" fill="var(--grn-sheen)"/>')
    out.append("</svg>")
    return "".join(out)


# ── The plan of the trail ────────────────────────────────────────────────────

def smooth_loop(pts):
    """A closed Catmull-Rom curve through the stops, as cubic Béziers."""
    m = len(pts)
    d = [f"M{n(pts[0][0])} {n(pts[0][1])}"]
    for i in range(m):
        p0, p1, p2, p3 = pts[i - 1], pts[i], pts[(i + 1) % m], pts[(i + 2) % m]
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        d.append(f"C{n(c1[0])} {n(c1[1])} {n(c2[0])} {n(c2[1])} {n(p2[0])} {n(p2[1])}")
    return " ".join(d) + " Z"


def plan_svg(d):
    stops = d["stops"]
    pts = [(s["x"], s["y"]) for s in stops]
    first = stops[0]
    out = [f'<svg class="grn-plan__draw" viewBox="0 0 {PW} {PH}" aria-hidden="true" focusable="false">',
           f'<rect width="{PW}" height="{PH}" rx="10" fill="var(--grn-paper)"/>',
           f'<ellipse cx="330" cy="215" rx="150" ry="95" fill="var(--grn-pond)" {LINE}/>',
           '<path d="M410 140 Q440 80 380 40 Q350 20 340 0" fill="none" stroke="var(--grn-pond)" stroke-width="10"/>']
    for cx, cy, r in ((40, 40, 34), (560, 40, 34), (40, 380, 30), (570, 370, 30), (300, 395, 22), (590, 200, 26), (12, 200, 26)):
        out.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="var(--grn-wood)" {LINE}/>')
    path = smooth_loop(pts)
    out.append(f'<path d="{path}" fill="none" stroke="var(--grn-ink)" stroke-width="16" stroke-linejoin="round"/>'
               f'<path d="{path}" fill="none" stroke="var(--grn-board)" stroke-width="11" stroke-linejoin="round"/>')
    for s in stops:
        out.append(f'<circle cx="{s["x"]}" cy="{s["y"]}" r="7" fill="var(--grn-paper)" {LINE}/>')
    out.append(f'<circle cx="{first["x"]}" cy="{first["y"]}" r="14" fill="none" stroke="var(--grn-link)" stroke-width="5" '
               'data-trail-here/>')
    out.append("</svg>")
    return "".join(out)


def stops_block(d):
    out = ['    <ol class="grn-stops" data-trail>']
    for s in d["stops"]:
        plants = ""
        if s.get("plants"):
            plants = f'\n        <p class="grn-stop__plants"><b>Planted:</b> {esc(", ".join(s["plants"]))}.</p>'
        out.append(f'      <li class="grn-stop" id="grn-stop-{s["key"]}" data-stop="{attr(s["key"])}" data-x="{s["x"]}" '
                   f'data-y="{s["y"]}">\n'
                   f'        <h3 class="grn-stop__name">{esc(s["name"])}</h3>\n'
                   f'        <p class="grn-stop__words">{esc(s["words"])}</p>{plants}\n'
                   f'        <p class="grn-stop__notice"><b>You might notice:</b> {esc(s["notice"])}</p>\n'
                   '      </li>')
    out.append('    </ol>')
    return "\n".join(out)


def sign_block(d):
    t = d["trail"]
    rows = [("Length", t["length"]), ("Surface", t["surface"]),
            ("Tread width", f'{t["tread_typical_in"]} inches all the way round, and never less than {t["tread_min_in"]}'),
            ("Running slope", f'{t["running_typical"]} usually, and {t["running_max"]} at the steepest, on the bridge'),
            ("Cross slope", f'{t["cross_typical"]} usually, and {t["cross_max"]} at the most'),
            ("Resting places", t["rest"])]
    out = ['    <dl class="grn-sign__list">']
    for k, v in rows:
        out.append(f'      <dt>{esc(k)}</dt><dd>{esc(v)}</dd>')
    out.append('    </dl>')
    return "\n".join(out)


def quote_block(q):
    about = f', {esc(q["about"])}' if q.get("about") else ""
    return (f'    <figure class="grn-quote">\n'
            f'      <blockquote><p>{esc(q["words"])}</p></blockquote>\n'
            f'      <figcaption>{esc(q["who"])}, <i>{esc(q["work"])}</i> ({q["year"]}){about}, as quoted on our own '
            f'<a href="{attr(q["page"])}">{esc(q["page_title"])}</a> page.</figcaption>\n'
            '    </figure>')


def day(iso):
    y, m, dd = (int(x) for x in iso.split("-"))
    return f"{dd} {MONTHS[m - 1]} {y}"


def rack_block(d):
    sid, sname = SCREEN
    out = [f'    <div class="grn-screen" data-rack-screen="{sid}" tabindex="-1" hidden>',
           '      <p class="grn-screen__idle"><span><b>The screen under the porch roof.</b> Nothing is on it. Any video on '
           'either rack can go up here with the button under it, and nothing loads until you press one.</span></p>',
           '    </div>',
           f'    <p class="grn-screen__now" data-rack-now="{sid}" tabindex="-1" hidden></p>',
           f'    <p class="grn-screen__back" hidden><button type="button" class="grn-btn grn-btn--quiet" '
           f'data-rack-back="{sid}">Take it off the screen</button></p>',
           '    <details class="grn-rack" open>',
           '      <summary class="grn-rack__sum">Ryan&rsquo;s pick: cities and towns making room for green</summary>',
           '      <ul class="grn-vids">']
    for v in d["videos"]:
        t, c, r = esc(v["title"]), esc(v["channel"]), v["runtime"]
        out += ['        <li class="grn-vid" data-rack-card>',
                f'          <h3 class="grn-vid__title">{t}</h3>',
                f'          <p class="grn-vid__by">{c} &middot; {day(v["published"])} &middot; {r}</p>',
                f'          <button type="button" class="facade" data-embed-id="{v["id"]}" data-embed-title="{attr(v["channel"])} &mdash; {attr(v["title"])}">',
                f'            Watch it here &mdash; {r}',
                '            <span class="facade__play">&#9654; PRESS PLAY</span>',
                '          </button>',
                f'          <button type="button" class="grn-btn grn-btn--quiet grn-vid__big" hidden data-rack-to="{sid}" '
                f'data-rack-name="{sname}" data-rack-src="https://www.youtube-nocookie.com/embed/{v["id"]}?autoplay=1&amp;rel=0" '
                f'data-rack-title="{attr(v["channel"])} &mdash; {attr(v["title"])}, on {sname}" data-rack-film="{attr(v["title"])}" '
                f'data-rack-runtime="{r}">Put it on {sname} &mdash; {r}</button>',
                '        </li>']
    out += ['      </ul>', '    </details>']
    return "\n".join(out)


# ── The second rack: the newest from the search ──────────────────────────────

def utc(s):
    return datetime.fromisoformat(s.replace("Z", "+00:00")).astimezone(timezone.utc)


def clock(n):
    h, rest = divmod(int(n), 3600)
    m, sec = divmod(rest, 60)
    return f"{h}:{m:02d}:{sec:02d}" if h else f"{m}:{sec:02d}"


def weekday(dt):
    t = dt.astimezone(HERE)
    return f"{t.strftime('%A')} {t.day} {t.strftime('%B')}"


def set_time(r):
    return datetime.strptime(r["set"], "%Y-%m-%dT%H:%MZ").replace(tzinfo=timezone.utc)


def check_latest(r):
    keys = {}
    for s in r.get("searches") or []:
        where = f"{LATEST.name}, search {s.get('key')!r}"
        if set(s) != SEARCH_KEYS:
            refuse(f"{where} has {sorted(set(s))}; a search is a key, a topic, what is typed and the words "
                   "its titles must carry, and nothing else.")
        if s.get("key") in keys:
            refuse(f"two searches are keyed {s.get('key')!r}.")
        keys[s.get("key")] = s
        if not (s.get("q") or "").strip() or not (s.get("topic") or "").strip():
            refuse(f"{where} has no words to search for, or no topic.")
        if not s.get("has") or not all(isinstance(h, str) and h.strip() for h in s["has"]):
            refuse(f"{where} has no words a title must carry. Without them the rack is whatever the search "
                   "happened to say, and a search's results are full of things that only mention the words.")
    if not keys:
        refuse(f"{LATEST.name} has no searches, so the second rack would be a heading over nothing.")
    if not r.get("set"):
        refuse(f"{LATEST.name} has no `set` time. Run tools/pull-green-latest.py; the room prints when the "
               "rack was filled.")
        return
    oldest = set_time(r) - timedelta(days=WEEK, minutes=1)
    seen = {}
    for v in r.get("seen") or []:
        t = (v.get("title") or "")[:40] or v.get("id")
        if set(v) - SEEN_KEYS:
            refuse(f"{LATEST.name}: the result {t!r} carries {sorted(set(v) - SEEN_KEYS)}. Nothing is kept but "
                   "what the rack needs: no description, no thumbnail, no count of views.")
        if v.get("state") not in SEEN_STATES:
            refuse(f"{LATEST.name}: the result {t!r} is in the state {v.get('state')!r}, which this does not know.")
        if v.get("state") in ("door", "gone", "left", "pending") and not v.get("why"):
            refuse(f"{LATEST.name}: the result {t!r} is {v.get('state')} with no reason why.")
        if v.get("search") not in keys:
            refuse(f"{LATEST.name}: the result {t!r} was found by {v.get('search')!r}, which is not a search.")
        if v.get("published") and utc(v["published"]) < oldest:
            refuse(f"{LATEST.name}: the result {t!r} went up {v['published']}, more than a week before the rack "
                   "was filled. The older ones go; this is not an archive.")
        seen[v.get("id")] = v
    rack = r.get("latest") or []
    if len(rack) > RACK:
        refuse(f"the second rack holds more than Ryan's number ({len(rack)} against {RACK}).")
    ids, titles, chans = set(), set(), set()
    for v in rack:
        t = (v.get("title") or "")[:40] or v.get("id")
        where = f"the second rack's {t!r}"
        if set(v) != LATEST_KEYS:
            refuse(f"{where} carries {sorted(set(v) ^ LATEST_KEYS)} beside or instead of an id, a title, a "
                   "channel, a time, a length and the search that found it.")
            continue
        if not YT.match(v["id"]):
            refuse(f"{where} has {v['id']!r}, which is not a YouTube id.")
        s = keys.get(v["search"])
        if not s:
            refuse(f"{where} was found by {v['search']!r}, which is not a search.")
        elif not pull.carries(v["title"], s["has"]):
            refuse(f"{where}: its title does not say what the search for {s['q']!r} asked for "
                   f"({', '.join(s['has'])}).")
        if not (isinstance(v["runs"], int) and v["runs"] > 0):
            refuse(f"{where} has no runtime. Every button here says how long before the press.")
        if not (v.get("channel") or "").strip():
            refuse(f"{where} does not say whose channel it is on.")
        if utc(v["published"]) < oldest:
            refuse(f"{where} went up {v['published']}, more than a week before the rack was filled.")
        for got, key, what in ((ids, v["id"], "is on the rack twice"),
                               (titles, pull.words(v["title"]), "has the same title as another on the rack"),
                               (chans, v["channel"].casefold(), "is the second from its channel")):
            if key in got:
                refuse(f"{where} {what}. One from each channel, and no title twice.")
            got.add(key)
        w = seen.get(v["id"])
        if not w or w.get("state") != "screen":
            refuse(f"{where} is not a result whose watch page said it plays here"
                   + (f" ({w.get('state')}: {w.get('why')})" if w else "") + ".")


def number_word(n):
    return {10: "ten", 12: "twelve", 15: "fifteen", 20: "twenty", 24: "twenty-four", 30: "thirty"}.get(n, str(n))


def quoted(searches, last="and"):
    q = [f"&ldquo;{esc(s['q'])}&rdquo;" for s in searches]
    return q[0] if len(q) == 1 else ", ".join(q[:-1]) + f" {last} " + q[-1]


def latest_block(r):
    sid, sname = SCREEN
    when = set_time(r)
    t = when.astimezone(HERE)
    at = f"{t.strftime('%I').lstrip('0')}:{t.strftime('%M')} {t.strftime('%p').lower()}"
    keys = {s["key"]: s for s in r["searches"]}
    out = [f'    <p class="grn-latest__set">The second rack was last filled at <b>{at} on {esc(weekday(when))}</b>, '
           f'Mountain time, with what YouTube&rsquo;s search found put up since '
           f'{esc(weekday(when - timedelta(days=WEEK)))}.</p>',
           f'    <p class="grn-latest__how">Every morning the Green asks the search for videos put up that week '
           f'about {quoted(r["searches"])}. A video goes on this rack only if its own title says what was asked '
           'for, it plays here, and its channel did not file it as a game or as music; one from each channel, and '
           'no title twice. Each search takes a turn, newest first, until the rack holds '
           f'{number_word(RACK)}. <strong>Nobody here watched these first.</strong> The titles are the '
           'channels&rsquo; own, and by next week every one of them has gone.</p>',
           '    <details class="grn-rack" open>',
           '      <summary class="grn-rack__sum">The newest: what the search found this week</summary>']
    rack = sorted(r["latest"], key=lambda v: (v["published"], v["id"]), reverse=True)
    if rack:
        out.append('      <ul class="grn-vids">')
    for v in rack:
        ti, ch, rt = esc(v["title"]), esc(v["channel"]), clock(v["runs"])
        full = f'{attr(v["channel"])} &mdash; {attr(v["title"])}'
        out += ['        <li class="grn-vid" data-rack-card>',
                f'          <h3 class="grn-vid__title">{ti}</h3>',
                f'          <p class="grn-vid__by">{ch} &middot; {esc(weekday(utc(v["published"])))} &middot; {rt}</p>',
                f'          <p class="grn-vid__found">Found searching for &ldquo;{esc(keys[v["search"]]["q"])}&rdquo;</p>',
                f'          <button type="button" class="facade" data-embed-id="{v["id"]}" data-embed-title="{full}">',
                f'            Watch it here &mdash; {rt}',
                '            <span class="facade__play">&#9654; PRESS PLAY</span>',
                '          </button>',
                f'          <button type="button" class="grn-btn grn-btn--quiet grn-vid__big" hidden data-rack-to="{sid}" '
                f'data-rack-name="{sname}" data-rack-src="https://www.youtube-nocookie.com/embed/{v["id"]}?autoplay=1&amp;rel=0" '
                f'data-rack-title="{full}, on {sname}" data-rack-film="{attr(v["title"])}" '
                f'data-rack-runtime="{rt}">Put it on {sname} &mdash; {rt}</button>',
                '        </li>']
    if rack:
        out.append('      </ul>')
    else:
        out.append('      <p class="grn-latest__quiet">Nothing turned up this week that the rack would take.</p>')
    quiet = [s for s in r["searches"] if not any(v["search"] == s["key"] for v in rack)]
    if rack and quiet:
        out.append(f'      <p class="grn-latest__quiet">Nothing on the rack this morning from the search for '
                   f'{quoted(quiet, "or")}.</p>')
    out.append('    </details>')
    return "\n".join(out)


def liner_sources(d, r):
    rows = [(v["for"], f'<a href="{attr(v["url"])}">{esc(v["title"])}</a>, {esc(v["by"])}, read {esc(v["read"])}')
            for v in d["sources"].values()]
    chans = []
    for v in d["videos"]:
        link = f'<a href="https://www.youtube.com/channel/{v["channel_id"]}">{esc(v["channel"])}</a>'
        if link not in chans:
            chans.append(link)
    rows.append(("The films on the first rack",
                 "Ryan Boren’s pick, of 2026-10-05, in his order, each on its own channel on YouTube: "
                 + ", ".join(chans[:-1]) + " and " + chans[-1]
                 + ". None of them is affiliated with Stimpunks, and nothing of theirs is hosted here"))
    rows.append(("The videos on the second rack",
                 "Whatever YouTube&rsquo;s search finds each morning for videos put up that week about "
                 + "; ".join(f"{quoted([s])}, whose titles say {' or '.join(f'&ldquo;{esc(h)}&rdquo;' for h in s['has'])}"
                             for s in r["searches"])
                 + ". Ryan Boren&rsquo;s brief, of 2026-10-07, and his topics. Nobody here chooses or watches them "
                 "first, none of their channels is affiliated with Stimpunks, and nothing of theirs is hosted here"))
    return "\n".join(f'      <tr><td>{esc(w)}</td><td>{src}</td></tr>' for w, src in rows)


# ── The script and the page as written ───────────────────────────────────────

def check_script():
    if not SCRIPT.exists():
        refuse(f"{SCRIPT.name} is missing, and the walk with it.")
        return
    js = pekoe.code_of(SCRIPT)
    if pekoe.KEEPS.search(js) or "fetch(" in js or pekoe.WIRE.search(js):
        refuse(f"{SCRIPT.name} stores or sends something. The walk lives in the page.")
    if any(w in js for w in pekoe.WRITES_HTML):
        refuse(f"{SCRIPT.name} writes HTML.")
    if re.search(r"\btransform\b", js):
        refuse(f"{SCRIPT.name} moves something with a transform. The marker moves by its own cx and cy.")
    if re.search(r"' of '|\blength\s*\+\s*'|\+\s*' of\b", js):
        refuse(f"{SCRIPT.name} says where you are as a number out of a total. Say the stop's name.")
    sweep(" ".join(re.findall(r"'([^'\\]*(?:\\.[^'\\]*)*)'", js)), SCRIPT.name)


def check_page():
    src = PAGE.read_text()
    for want, why in (('src="green.js"', "it does not load green.js, which walks the trail"),
                      ('src="love-embed.js"', "it does not load love-embed.js, so every film would press and do nothing"),
                      ('src="rack.js"', "it does not load rack.js, so no film could go up on the screen"),
                      ('href="truckin-food-court.html"', "it has no gate through to the Truck Stop next door"),
                      ('href="the-pile.html"', "it has no gate through to the Pile next door"),
                      ('data-trail-says', "it has no live region for the walk")):
        if want not in src:
            refuse(f"{PAGE.name}: {why}.")
    for m in re.finditer(r'<svg class="grn-(?:view|plan)__draw".*?</svg>', src, re.S):
        if re.search(r"shadow|shade", m.group(0)):
            refuse(f"{PAGE.name}: a drawing has a shadow or a shade in it. It has just stopped raining and there is "
                   "no sun on the Green: nothing casts a shadow.")
    plain = re.sub(r"<script\b.*?</script>", " ", src, flags=re.S)
    plain = re.sub(r'<(h3|p) class="grn-vid__(?:title|by)">.*?</\1>', " ", plain, flags=re.S)
    plain = re.sub(r'data-(?:embed|rack)-(?:title|film)="[^"]*"', " ", plain)
    plain = re.sub(r"<blockquote>.*?</blockquote>", " ", plain, flags=re.S)
    plain = re.sub(r"<!--.*?-->", " ", plain, flags=re.S)
    sweep(plain, PAGE.name)


def section_css():
    css = CSS.read_text()
    m = re.search(rf"/\* §{SECTION} ── ROOM: The Green.*?(?=/\* §\d+ ── )", css, re.S)
    if not m:
        refuse(f"love.css has no §{SECTION} for The Green, followed by another section.")
        return
    body = re.sub(r"/\*.*?\*/", " ", m.group(0), flags=re.S)
    if re.search(r"#[0-9a-fA-F]{3,6}\b|rgba?\(|hsla?\(", body):
        refuse(f"love.css §{SECTION} has a literal colour in it.")
    if re.search(r"box-shadow|text-shadow|drop-shadow", body):
        refuse(f"love.css §{SECTION} casts a shadow. Nothing on the Green does: it has just stopped raining.")
    if re.search(r"transform\s*:\s*(?:rotate|skew)", body):
        refuse(f"love.css §{SECTION} rotates or skews something.")
    root = re.search(r":root\s*\{(.*?)\n\}", css, re.S).group(1)
    for name in re.findall(r"(--grn-[a-z0-9-]+):", root):
        if re.search(r"shadow|shade|sun", name):
            refuse(f"{name} is a colour named for a shadow or the sun, and the Green has neither.")


def main():
    r = json.loads(LATEST.read_text())
    check_latest(r)
    if "--latest" in sys.argv[1:]:
        # THE MORNING TIMER'S PATH: the second rack and nothing else, so a
        # session's edit to the rest of the page or to the liner notes is never
        # touched by a machine refilling the rack.
        if problems:
            print("REFUSING:\n  " + "\n  ".join(dict.fromkeys(problems)))
            sys.exit(1)
        swap(PAGE, "grn:latest", latest_block(r), "    ")
        check_page()
        if problems:
            print("REFUSING (the page as written):\n  " + "\n  ".join(dict.fromkeys(problems)))
            sys.exit(1)
        print(f"the green: the second rack, filled {r['set']}, from the search")
        return
    d = json.loads(DATA.read_text())
    check_data(d)
    check_quotes(d)
    for k in ("_what", "_light", "_stops", "_quotes"):
        sweep(d.get(k, ""), f"{DATA.name} {k}")
    for s in d.get("stops") or []:
        sweep(" ".join(str(s.get(f, "")) for f in ("name", "words", "notice")) + " " + " ".join(s.get("plants") or []),
              f"{DATA.name}, stop {s.get('key')}")
    sweep(" ".join(str(v) for v in (d.get("trail") or {}).values()), f"{DATA.name}, the trail")
    if problems:
        print("REFUSING:\n  " + "\n  ".join(dict.fromkeys(problems)))
        sys.exit(1)
    swap(PAGE, "grn:view", "      " + view_svg(d), "      ")
    swap(PAGE, "grn:plan", "      " + plan_svg(d), "      ")
    swap(PAGE, "grn:stops", stops_block(d), "    ")
    swap(PAGE, "grn:sign", sign_block(d), "    ")
    for q in d["quotes"]:
        swap(PAGE, f"grn:quote-{q['key']}", quote_block(q), "    ")
    swap(PAGE, "grn:rack", rack_block(d), "    ")
    swap(PAGE, "grn:latest", latest_block(r), "    ")
    swap(NOTES, "green-sources", liner_sources(d, r), "      ")
    check_script()
    check_page()
    section_css()
    if problems:
        print("REFUSING (the page as written):\n  " + "\n  ".join(dict.fromkeys(problems)))
        sys.exit(1)
    print("the green: the view from the porch, the trail and every stop on it, the trailhead sign, the quotations, "
          "the screen's two racks and the credits written; it has just stopped raining, and nothing casts a shadow")


if __name__ == "__main__":
    main()
