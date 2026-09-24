#!/usr/bin/env python3
"""Build The Small Hours' menu, quotations and placemat, and the credits.

ONE DATA FILE, ONE TOOL, TWO SURFACES. The menu and every quotation go into
small-hours.html; the same quotations go into liner-notes.html as credits.

WHAT IT REFUSES, and why each one is here:

  - A QUOTATION WITHOUT AN AUTHOR, A WORK, A PAGE OF OURS THAT QUOTES IT, OR A
    CHECKED DATE. The authors were resolved against Open Library and Crossref,
    because our own Sleep entry prints a memoir's passage under a link to the
    book and never names who wrote it, and the name this room was nearly given
    from memory was somebody else's.

  - A QUOTATION THAT IS NOT WORD FOR WORD ON THE PAGE OF OURS IT CLAIMS TO COME
    FROM -- whenever the Knowledge System mirror is on the machine running
    this. When it is not, the tool says it could not look, rather than saying
    nothing and letting a pass mean two different things.

  - A QUOTATION OVER FORTY WORDS. This is a room with a few lines in it, not a
    quote bank; the Zibaldone's cap is thirty and exists for drift, and forty
    here fits the longest sentence the room is actually about.

  - SLEEP ADVICE IN OUR OWN VOICE. The room quotes a study in which what
    helped Autistic adolescents sleep was the opposite of standard sleep
    hygiene advice, and a diner that handed out tips at three in the morning
    would be the leaflet by the till. It will arrive as a kindness. Negation
    window, so "there is no sleep advice in this building" survives, and
    quotations are skipped, because the study is allowed to name what it is
    arguing with.

  - CLOSING TIME. The diner does not close, and a line about last orders or
    opening hours would make that false in the room that says it most. Same
    negation window.

  - THE PAGE ASKING THE BROWSER FOR THE TIME. A sign that said what time it was
    where you were was the first draft, and it was one more thing noticing what
    hour somebody is awake. Nothing in small-hours.html may call for the date or
    the hour.

  - A TALLY. No visits, no nights awake, no hours since. The pebbling cabinet's
    refusal, in the room where a counter would be a record of how often
    somebody could not sleep.

  - A QUOTATION WITH NO SLOT ON THE PAGE, OR A SLOT WITH NO QUOTATION, and an
    HTML entity in any field. make-latibulum.py's rule and data/toys.json's.

  - A LYRIC WITH NO PERMISSION RECORD. "Up All Night" is the one song on this
    street printed in full, because Stimpunks helped produce it and holds
    permission to distribute it and its lyrics (Ryan, 2026-09-23). That is
    permission rather than quotation, so the record must say what is permitted,
    who holds it, how, when it was recorded, by whom, and that the words stay
    outside this site's licence. Every other room's tools go on refusing lyrics.

  - A TRACK FROM ANYWHERE BUT love-embed.js's AUDIO_ORIGINS, a track with no
    runtime or one that is not a clock, and an album button that does not say
    how many songs and how long before the press. The runtimes were measured off
    the files; the album totals are summed here rather than typed.

  - A PLACEMAT PART WITH NO NAME, OR A NAME WITH NO PART. The drawing is in this
    file and the names each part is spoken by are in the data, and the list of
    names under the placemat is the only way in for anybody without a pointer:
    a part missing from it is a part they cannot colour, and a name with no
    drawing is a button that colours nothing.

  - A CRAYON WHOSE INK IS NOT DECLARED IN love.css's :root, or two crayons
    alike. CSS drops an unknown var() and paints nothing, which is how
    Covenstead's kettle lost its line after a repaint.

  - A small-hours.js THAT STORES, SENDS, OR READS THE CLOCK. The house rule is
    that nothing is kept, and the placemat is the object in this room most
    likely to grow a "save your drawing" by kindness. Taking it home is a
    download to the visitor's own device, which is theirs to keep and not ours.

IF THIS REFUSES: fix the cause. Do not loosen the tool.
"""
import html
import json
import math
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data/small-hours.json"
ROOM = ROOT / "small-hours.html"
NOTES = ROOT / "liner-notes.html"
MIRROR = Path.home() / "Documents/Claude/Projects/Stimpunks Knowledge System/site/stimpunks.org"

ENTITY = re.compile(r"&(?:[a-zA-Z][a-zA-Z0-9]{1,31}|#\d{1,6}|#x[0-9a-fA-F]{1,6});")
MAX_WORDS = 40
CLOCK_RE = re.compile(r"^\d+:[0-5]\d$")
PERMISSION = ("what", "held_by", "how", "recorded", "by", "licence")
EMBED = ROOT / "love-embed.js"

NEGATION = (r"(?:no|not|nothing|never|neither|none|without|refuses?|refused|refusing|"
            r"cannot|does not|doesn't|won't|will not|is not|are not|isn't|aren't|nobody|nor)")
ADVICE = (r"sleep hygiene|bedtime routine|wind(?:ing)? down|go to bed|get some sleep|"
          r"try to sleep|you should (?:sleep|rest|go|get|try)|melatonin|blue light|"
          r"screens? (?:off|before bed)|reset your (?:body clock|sleep)|fix your sleep|"
          r"sleep schedule|early night|past your bedtime|should be (?:asleep|in bed|sleeping)|"
          r"tips?(?: for| to| on)?\b|leaflet")
CLOSING = (r"closing time|last orders?|we close|closes at|opening hours|open until|"
           r"come back tomorrow|closed (?:on|at|until)")
TALLY = (r"scores?|streaks?|leaderboards?|tall(?:y|ies)|hours since|nights? awake count|"
         r"visits? (?:counted|logged)|days since")
CLOCK = re.compile(r"new Date|Date\(|getHours|toLocaleTime|Intl\.DateTimeFormat")

# ── THE PLACEMAT ─────────────────────────────────────────────────────────────
# ITS DRAWING LIVES HERE AND ITS WORDS LIVE IN THE DATA FILE, keyed by part, and
# the tool refuses either without the other: a part with no name is a shape
# nobody using the list can reach, and a name with no shape is a button that
# colours nothing. Every part is a closed path with the parts inside it cut out
# (even-odd), so no two parts overlap and a press lands in exactly one of them.
# The printed lines are every part's edge plus the few lines that are no part's
# edge -- the window's cross, the clock's ticks, the steam -- and none of it is a
# transform, because nothing in §44 moves and check-gentle.py reads the matrix.

def f(v):
    s = f"{v:.1f}"
    return s[:-2] if s.endswith(".0") else s

def circ(cx, cy, r):
    return (f"M{f(cx - r)} {f(cy)} A{f(r)} {f(r)} 0 1 0 {f(cx + r)} {f(cy)} "
            f"A{f(r)} {f(r)} 0 1 0 {f(cx - r)} {f(cy)} Z")

def ell(cx, cy, rx, ry):
    return (f"M{f(cx - rx)} {f(cy)} A{f(rx)} {f(ry)} 0 1 0 {f(cx + rx)} {f(cy)} "
            f"A{f(rx)} {f(ry)} 0 1 0 {f(cx - rx)} {f(cy)} Z")

def rrect(x, y, w, h, r):
    return (f"M{f(x + r)} {f(y)} H{f(x + w - r)} A{f(r)} {f(r)} 0 0 1 {f(x + w)} {f(y + r)} "
            f"V{f(y + h - r)} A{f(r)} {f(r)} 0 0 1 {f(x + w - r)} {f(y + h)} H{f(x + r)} "
            f"A{f(r)} {f(r)} 0 0 1 {f(x)} {f(y + h - r)} V{f(y + r)} A{f(r)} {f(r)} 0 0 1 {f(x + r)} {f(y)} Z")

def poly(pts):
    return "M" + " L".join(f"{f(x)} {f(y)}" for x, y in pts) + " Z"

def star(cx, cy, ro, ri):
    pts = []
    for k in range(10):
        a = math.radians(-90 + k * 36)
        r = ro if k % 2 == 0 else ri
        pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return poly(pts)

def _arc(c, r, a, b, via):
    """An SVG arc on circle c from a to b that passes through via."""
    ang = lambda p: math.atan2(p[1] - c[1], p[0] - c[0])
    ta, tb, tv = ang(a), ang(b), ang(via)
    span = (tb - ta) % (2 * math.pi)
    if (tv - ta) % (2 * math.pi) < span:
        sweep, large = 1, int(span > math.pi)
    else:
        sweep, large = 0, int(2 * math.pi - span > math.pi)
    return f"A{f(r)} {f(r)} 0 {large} {sweep} {f(b[0])} {f(b[1])}"

def crescent(c1, r1, c2, r2):
    """Circle c1 with circle c2 bitten out of it."""
    dx, dy = c2[0] - c1[0], c2[1] - c1[1]
    d = math.hypot(dx, dy)
    ux, uy = dx / d, dy / d
    a = (d * d + r1 * r1 - r2 * r2) / (2 * d)
    h = math.sqrt(r1 * r1 - a * a)
    mx, my = c1[0] + ux * a, c1[1] + uy * a
    p1 = (mx - uy * h, my + ux * h)
    p2 = (mx + uy * h, my - ux * h)
    far = (c1[0] - ux * r1, c1[1] - uy * r1)
    near = (c2[0] - ux * r2, c2[1] - uy * r2)
    return (f"M{f(p1[0])} {f(p1[1])} {_arc(c1, r1, p1, p2, far)} "
            f"{_arc(c2, r2, p2, p1, near)} Z")

def blob(cx, cy, radii, sx, sy):
    """A closed smooth shape through points at even angles (Catmull-Rom as cubics)."""
    n = len(radii)
    pts = [(cx + radii[i] * sx * math.cos(2 * math.pi * i / n),
            cy + radii[i] * sy * math.sin(2 * math.pi * i / n)) for i in range(n)]
    d = f"M{f(pts[0][0])} {f(pts[0][1])}"
    for i in range(n):
        p0, p1, p2, p3 = pts[i - 1], pts[i], pts[(i + 1) % n], pts[(i + 2) % n]
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        d += f" C{f(c1[0])} {f(c1[1])} {f(c2[0])} {f(c2[1])} {f(p2[0])} {f(p2[1])}"
    return d + " Z"

def along(a, b, w, s0, s1, tip=None):
    """The quadrilateral from s0 to s1 along a->b, w either side; tip narrows the far end."""
    L = math.hypot(b[0] - a[0], b[1] - a[1])
    ux, uy = (b[0] - a[0]) / L, (b[1] - a[1]) / L
    nx, ny = -uy, ux
    w1 = w if tip is None else tip
    p = lambda s, k: (a[0] + ux * s + nx * k, a[1] + uy * s + ny * k)
    return poly([p(s0, w), p(s1, w1), p(s1, -w1), p(s0, -w)])


def drawing():
    """Every part of the placemat, keyed by the name data/small-hours.json speaks it by."""
    z = {}
    z["border"] = rrect(10, 10, 780, 480, 22) + " " + rrect(34, 34, 732, 432, 12)
    # the window, the moon and the stars
    moon = crescent((104, 170), 22, (115, 162), 18)
    s_big, s_mid, s_small = star(207, 168, 14, 6), star(224, 248, 10, 4.3), star(98, 250, 8, 3.4)
    z["sky"] = " ".join([rrect(64, 134, 190, 150, 4), moon, s_big, s_mid, s_small])
    z["moon"], z["star-big"], z["star-mid"], z["star-small"] = moon, s_big, s_mid, s_small
    z["sill"] = rrect(52, 284, 214, 14, 3)
    # the clock with no hands
    z["clock-rim"] = circ(400, 196, 56) + " " + circ(400, 196, 46)
    z["clock-face"] = circ(400, 196, 46)
    # the crayon lying on the paper
    A, B = (494, 292), (566, 162)
    L = math.hypot(B[0] - A[0], B[1] - A[1])
    z["crayon-wax"] = along(A, B, 13, 0, 26) + " " + along(A, B, 13, 92, 116) + " " + along(A, B, 13, 116, L, tip=3)
    z["crayon-wrap"] = along(A, B, 13, 26, 92)
    # the jukebox
    body = "M590 400 V210 A70 70 0 0 1 730 210 V400 Z"
    dome = "M612 232 V214 A48 48 0 0 1 708 214 V232 Z"
    win, grille = rrect(612, 250, 96, 62, 6), rrect(612, 330, 96, 54, 8)
    rec, lab = circ(660, 281, 22), circ(660, 281, 7)
    z["juke-body"] = " ".join([body, dome, win, grille])
    z["juke-dome"] = dome
    z["juke-window"] = win + " " + rec
    z["record"] = rec + " " + lab
    z["label"] = lab
    z["grille"] = grille
    # breakfast
    egg = blob(206, 398, [36, 33, 30, 34, 37, 32, 35, 31, 29, 34], 1.08, 0.84)
    yolk = circ(203, 394, 12)
    toast = ("M284 434 V386 C274 382 272 366 286 360 C296 350 330 350 340 360 "
             "C354 366 352 382 342 386 V434 Z")
    soft = ("M291 427 V381 C283 377 283 369 291 366 C300 357 326 357 335 366 "
            "C343 369 343 377 335 381 V427 Z")
    z["plate"] = " ".join([ell(262, 396, 120, 60), egg, toast])
    z["egg"] = egg + " " + yolk
    z["yolk"] = yolk
    z["crust"] = toast + " " + soft
    z["toast"] = soft
    # the mug
    z["mug"] = ("M430 372 V362 A10 10 0 0 1 440 352 H498 A10 10 0 0 1 508 362 V372 Z "
                "M430 386 H508 V434 A10 10 0 0 1 498 444 H440 A10 10 0 0 1 430 434 Z")
    z["mug-band"] = "M430 372 H508 V386 H430 Z"
    z["handle"] = ("M508 370 H520 A24 24 0 0 1 520 418 H508 Z "
                   "M512 382 H518 A12 12 0 0 1 518 406 H512 Z")

    # PRINTED LINES THAT ARE NOT THE EDGE OF A PART: (d, width, dash)
    extra = [(rrect(22, 22, 756, 456, 17), 4, "0.1 14"),
             ("M159 134 V284 M64 209 H254", 4, None)]
    for k in range(12):
        a = math.radians(k * 30)
        r0 = 33 if k % 3 == 0 else 38
        extra.append((f"M{f(400 + r0 * math.sin(a))} {f(196 - r0 * math.cos(a))} "
                      f"L{f(400 + 43 * math.sin(a))} {f(196 - 43 * math.cos(a))}", 2.5, None))
    extra.append((circ(400, 196, 2.5), 2, None))
    extra.append((circ(660, 281, 15), 1.5, None))
    extra.append((" ".join(f"M{x} 338 V376" for x in range(628, 700, 12)), 2, None))
    extra.append(("M600 400 V410 H620 V400 M700 400 V410 H720 V400", 3, None))
    # wrapper stripes on the drawn crayon
    extra.append((along(A, B, 13, 34, 34.01) + " " + along(A, B, 13, 84, 84.01), 2, None))
    extra.append(("M452 342 C444 332 460 324 452 312 M470 342 C462 332 478 324 470 312 "
                  "M488 342 C480 332 496 324 488 312", 2.5, None))
    words = [("THE SMALL HOURS", 400, 84, 36, 4, "Righteous", 400),
             ("colour in anything, at any hour", 400, 110, 15, 0.5, "Libre Franklin", 700)]
    return z, extra, words


STORE = re.compile(r"localStorage|sessionStorage|indexedDB|document\.cookie|fetch\(|"
                   r"XMLHttpRequest|sendBeacon|WebSocket|EventSource")
SCRIPT = ROOT / "small-hours.js"


def declared_props():
    css = (ROOT / "love.css").read_text()
    start = css.index(":root {")
    root = re.sub(r"/\*.*?\*/", " ", css[start:css.index("\n}", start)], flags=re.S)
    return set(re.findall(r"(--[a-z0-9-]+)\s*:", root))


def check_placemat(pm):
    z, _, _ = drawing()
    parts = pm.get("parts", {})
    for k in sorted(set(z) - set(parts)):
        refuse(f"placemat: part {k!r} is drawn and has no name, so nobody using the list can colour it.")
    for k in sorted(set(parts) - set(z)):
        refuse(f"placemat: part {k!r} has a name and no drawing; its button would colour nothing.")
    names = [v for v in parts.values()]
    if len(set(names)) != len(names):
        refuse("placemat: two parts share a name, so the list cannot tell them apart out loud.")
    props = declared_props()
    seen_ink, seen_name = set(), set()
    for c in pm.get("crayons", []):
        if c.get("ink") not in props:
            refuse(f"placemat: the {c.get('name')} crayon's ink {c.get('ink')!r} is not declared in "
                   "love.css's :root. CSS drops an unknown var() and paints nothing.")
        if c.get("ink") in seen_ink or c.get("name") in seen_name:
            refuse(f"placemat: the {c.get('name')} crayon repeats another's name or ink.")
        seen_ink.add(c.get("ink"))
        seen_name.add(c.get("name"))
    if not pm.get("crayons"):
        refuse("placemat: no crayons.")
    js = SCRIPT.read_text()
    if STORE.search(js):
        refuse(f"{SCRIPT.name} stores or sends something. Nothing in this diner is kept, the placemat "
               "included; taking it home is the visitor's own save to their own device.")
    if CLOCK.search(js):
        refuse(f"{SCRIPT.name} asks the browser for the time. Nothing here notices the hour.")


def placemat_block(pm):
    z, extra, words = drawing()
    ind = "      "
    crayons = "\n".join(
        f'{ind}  <label class="sh-crayon"><input type="radio" name="sh-crayon" value="{e(c["ink"])}" '
        f'data-name="{e(c["name"])}"{" checked" if i == 0 else ""}>'
        f'<svg class="sh-crayon__draw" viewBox="0 0 60 16" aria-hidden="true" focusable="false">'
        f'<path d="M16 2.5 H57 V13.5 H16 L3 9 V7 Z" style="fill: var({e(c["ink"])})"/>'
        f'<path d="M26 2.5 V13.5 M47 2.5 V13.5"/></svg><span>{e(c["name"])}</span></label>'
        for i, c in enumerate(pm["crayons"]))
    lines = [f'<path class="sh-mat__line" d="{d}" stroke-width="{w}"'
             + (f' stroke-dasharray="{dash}"' if dash else "") + "/>" for d, w, dash in extra]
    lines += [f'<path class="sh-mat__line" d="{d}" stroke-width="3"/>' for d in z.values()]
    texts = [f'<text class="sh-mat__word" x="{x}" y="{y}" font-size="{size}" letter-spacing="{ls}" '
             f'font-family="{fam}, sans-serif" font-weight="{wt}" text-anchor="middle">{e(t)}</text>'
             for t, x, y, size, ls, fam, wt in words]
    zones = [f'<path class="sh-mat__zone" data-zone="{k}" data-name="{e(pm["parts"][k])}" d="{d}"/>'
             for k, d in z.items()]
    parts = "\n".join(
        f'{ind}    <li><button type="button" class="sh-mat__part" data-zone="{k}">'
        f'{e(pm["parts"][k])}<span class="sh-mat__now"></span></button></li>' for k in z)
    return (
        f'{ind}<fieldset class="sh-crayons" hidden>\n'
        f'{ind}  <legend>The crayons</legend>\n{crayons}\n'
        f'{ind}</fieldset>\n'
        f'{ind}<fieldset class="sh-mat__how" hidden>\n'
        f'{ind}  <legend>What a press on the placemat does</legend>\n'
        f'{ind}  <label class="sh-mat__way"><input type="radio" name="sh-mat-how" value="fill" checked> '
        f'Colour in: press a shape and it fills</label>\n'
        f'{ind}  <label class="sh-mat__way"><input type="radio" name="sh-mat-how" value="scribble"> '
        f'Scribble: draw wherever you like</label>\n'
        f'{ind}</fieldset>\n'
        f'{ind}<div class="sh-mat" data-mode="fill" role="img" aria-label="A paper placemat printed in '
        f'teal ink, ready to colour in: a window with a crescent moon and stars in it, the clock with no '
        f'hands, a crayon, a jukebox, a plate with an egg and a slice of toast, and a mug with steam coming '
        f'off it.">\n'
        f'{ind}  <canvas class="sh-mat__wax" width="1600" height="1000" hidden></canvas>\n'
        f'{ind}  <svg class="sh-mat__print" viewBox="0 0 800 500" aria-hidden="true" focusable="false">\n'
        f'{ind}    <g class="sh-mat__lines">\n' + "\n".join(f"{ind}      {l}" for l in lines) + "\n"
        f'{ind}    </g>\n' + "\n".join(f"{ind}    {t}" for t in texts) + "\n"
        f'{ind}    <g class="sh-mat__zones">\n' + "\n".join(f"{ind}      {zz}" for zz in zones) + "\n"
        f'{ind}    </g>\n'
        f'{ind}  </svg>\n'
        f'{ind}</div>\n'
        f'{ind}<p class="sh-mat__said" role="status"></p>\n'
        f'{ind}<p class="sh-mat__acts" hidden><button type="button" class="sh-mat__btn" data-mat="fresh">'
        f'A fresh placemat</button> <button type="button" class="sh-mat__btn" data-mat="home">'
        f'Take it home</button></p>\n'
        f'{ind}<details class="sh-mat__list" hidden>\n'
        f'{ind}  <summary>Colour it in by name, one part at a time</summary>\n'
        f'{ind}  <ul class="sh-mat__parts">\n{parts}\n{ind}  </ul>\n'
        f'{ind}</details>')


problems = []


def refuse(msg):
    problems.append(msg)


def sweep(name, vocab, text):
    bad = re.compile(rf"\b(?:{vocab})", re.I)
    ok = re.compile(rf"\b{NEGATION}\b[^.]{{0,80}}?\b(?:{vocab})", re.I)
    for sentence in re.split(r"(?<=[.!?])\s+", text):
        if bad.search(sentence) and not ok.search(sentence):
            refuse(f"{name} in the room's own voice: {sentence.strip()[:140]!r}")


def norm(s):
    s = html.unescape(s)
    s = s.replace("’", "'").replace("‘", "'").replace("“", '"').replace("”", '"')
    s = re.sub(r"\*\*|__|\*", "", s)
    return re.sub(r"\s+", " ", s).strip().lower()


def mirror_file(via):
    m = re.match(r"https://stimpunks\.org/(.+?)/?$", via)
    if not m:
        return None
    parts = m.group(1).split("/")
    if len(parts) == 4 and all(p.isdigit() for p in parts[:3]):
        return MIRROR / "posts" / f"{parts[3]}.md"
    if parts[0] == "glossary":
        return MIRROR / "glossary" / f"{parts[1]}.md"
    return MIRROR / "pages" / ("__".join(parts) + ".md")


def e(s):
    return html.escape(s, quote=True)


def swap(src, marker, body, where):
    begin, end = f"<!-- {marker}:begin -->", f"<!-- {marker}:end -->"
    if src.count(begin) != 1 or src.count(end) != 1:
        raise SystemExit(f"REFUSING: {where} needs exactly one {marker} marker pair.")
    return re.sub(re.escape(begin) + r".*?" + re.escape(end),
                  lambda _: f"{begin}\n{body}\n{end}", src, count=1, flags=re.S)


def walk(obj, path=""):
    if isinstance(obj, dict):
        for k, v in obj.items():
            if not k.startswith("_"):
                walk(v, f"{path}.{k}")
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            walk(v, f"{path}[{i}]")
    elif isinstance(obj, str) and ENTITY.search(obj):
        refuse(f"{path}: an HTML entity. Write the character; this field is escaped on the way out.")


def main():
    data = json.loads(DATA.read_text())
    room = ROOM.read_text()
    walk(data)

    looked, could_not = 0, False
    for q in data["quotes"]:
        where = f"quote {q.get('id')}"
        for k in ("text", "author", "work", "work_url", "via", "via_title", "checked"):
            if not q.get(k):
                refuse(f"{where}: no {k}.")
        if len(q.get("text", "").split()) > MAX_WORDS:
            refuse(f"{where}: {len(q['text'].split())} words, over {MAX_WORDS}. Link the rest.")
        f = mirror_file(q.get("via", ""))
        if not MIRROR.exists():
            could_not = True
        elif not f or not f.exists():
            refuse(f"{where}: {q.get('via')} has no page in the mirror to check it against.")
        elif norm(q["text"]) not in norm(f.read_text()):
            refuse(f"{where}: not word for word on {q['via']}. A quotation that has drifted "
                   "from the page it is credited to is a misquotation with our name on it.")
        else:
            looked += 1
        marker = f"sh-quote:{q.get('id')}"
        if room.count(f"<!-- {marker}:begin -->") != 1:
            refuse(f"{where}: no slot for it in {ROOM.name}.")
    slots = set(re.findall(r"<!-- sh-quote:([a-z0-9-]+):begin -->", room))
    for extra in slots - {q.get("id") for q in data["quotes"]}:
        refuse(f"{ROOM.name} has a slot for quote {extra!r} and the data has none.")

    if CLOCK.search(room):
        refuse(f"{ROOM.name} asks the browser for the time. The sign says open whatever the hour "
               "and does not notice what hour it is.")

    ours = re.sub(r"<blockquote\b.*?</blockquote>", " ", room, flags=re.S)
    ours = re.sub(r"<(script|style|svg)\b.*?</\1>", " ", ours, flags=re.S)
    ours = re.sub(r"<!--.*?-->", " ", ours, flags=re.S)
    ours = re.sub(r"<(?:title|meta)[^>]*>", " ", ours)
    text = html.unescape(re.sub(r"<[^>]+>", " ", ours))
    text += " " + " ".join(m["dish"] + ". " + m["note"] for m in data["menu"])
    sweep("sleep advice", ADVICE, text)
    sweep("closing time", CLOSING, text)
    sweep("a tally", TALLY, text)

    ablock = re.search(r"var AUDIO_ORIGINS = \[(.*?)\];", EMBED.read_text(), re.S)
    audio_ok = re.findall(r"'(https://[^']+)'", ablock.group(1)) if ablock else []
    if not audio_ok:
        refuse("love-embed.js has no AUDIO_ORIGINS, so no track could be checked.")

    def track_ok(where, t):
        if not any(t.get("src", "").startswith(o) for o in audio_ok):
            refuse(f"{where}: {t.get('src')} is not from an origin in AUDIO_ORIGINS; "
                   "love-embed.js would refuse it quietly and the button would never play.")
        if not CLOCK_RE.match(t.get("runs", "")):
            refuse(f"{where}: no runtime, or one that is not a clock. Every press-to-play "
                   "control here says how long before the press.")

    rec = data.get("record")
    if rec:
        track_ok("record", rec)
        if rec.get("lyrics"):
            perm = rec.get("permission") or {}
            for k in PERMISSION:
                if not perm.get(k):
                    refuse(f"record: lyrics with no permission.{k}. A song's words are printed "
                           "whole here only on a written-down permission.")
        if not rec.get("credits"):
            refuse("record: no credits. Name everybody who made it.")
    for a in data.get("albums", []):
        if not a.get("page", "").startswith("https://josephmooon.wordpress.com/"):
            refuse(f"album {a.get('title')!r}: no page on the band's own site.")
        for t in a["tracks"]:
            track_ok(f"{a['title']} track {t.get('n')}", t)

    if data.get("placemat"):
        check_placemat(data["placemat"])
    else:
        refuse("no placemat. The menu promises crayons and a paper placemat on every table.")

    if problems:
        print("REFUSING:\n  " + "\n  ".join(problems))
        return 1

    for q in data["quotes"]:
        if q["author"] == "Stimpunks":
            cite = f'Our post, <a href="{e(q["work_url"])}">{e(q["work"])}</a>'
        else:
            cite = (f'{e(q["author"])}, <a href="{e(q["work_url"])}">{e(q["work"])}</a>, '
                    f'as our <a href="{e(q["via"])}">{e(q["via_title"])}</a> entry quotes it')
        block = (f'    <blockquote class="sh-said">\n'
                 f'      <p>{e(q["text"])}</p>\n'
                 f'      <cite>{cite}</cite>\n'
                 f'    </blockquote>')
        room = swap(room, f"sh-quote:{q['id']}", block, ROOM.name)

    def spoken(runs):
        m, sec = (int(x) for x in runs.split(":"))
        return f"{m} min {sec} sec" if sec else f"{m} min"

    def play(t, title):
        return (f'<button type="button" class="facade facade--audio sh-play" '
                f'data-audio-src="{e(t["src"])}" data-embed-title="{e(title)}">'
                f'Press to play &middot; {t["runs"]}</button>')

    if rec:
        credits = "".join(f'<div><dt>{e(c["who"])}</dt><dd>{e(c["did"])}</dd></div>'
                          for c in rec["credits"])
        stanzas = "\n".join("        <p>" + "<br>".join(e(l) for l in st) + "</p>"
                            for st in rec["lyrics"])
        album = next((a for a in data.get("albums", []) if a["title"] == rec["album"]), None)
        block = (f'    <div class="sh-record">\n'
                 f'      <p class="sh-record__meta">Track {rec["track"]} of <i>{e(rec["album"])}</i> '
                 f'&middot; runs {rec["runs"]}</p>\n'
                 f'      {play(rec, rec["title"] + " by " + rec["by"])}\n'
                 f'      <dl class="sh-credits">{credits}</dl>\n'
                 f'      <h3 class="sh-lyric__h">The words</h3>\n'
                 f'      <blockquote class="sh-lyric">\n{stanzas}\n'
                 f'        <cite>Lyrics by {e(rec["credits"][0]["who"])}. Printed in full with '
                 f'permission: {e(rec["permission"]["how"])}. They are not under this site&rsquo;s '
                 f'licence and stay the lyricist&rsquo;s and the band&rsquo;s.</cite>\n'
                 f'      </blockquote>\n'
                 + (f'      <p class="sh-record__more">The whole album is on the jukebox below and on '
                    f'<a href="{e(album["page"])}">its own page on the band&rsquo;s site</a>.</p>\n'
                    if album else "")
                 + '    </div>')
        room = swap(room, "sh-record", block, ROOM.name)

    albums_html = []
    for i, a in enumerate(data.get("albums", [])):
        secs = sum(int(t["runs"].split(":")[0]) * 60 + int(t["runs"].split(":")[1]) for t in a["tracks"])
        total = f"{round(secs / 60)} min"
        when = ""
        if a.get("released"):
            y, mth, d = a["released"].split("-")
            months = ["January", "February", "March", "April", "May", "June", "July", "August",
                      "September", "October", "November", "December"]
            when = f' &middot; released {int(d)} {months[int(mth) - 1]} {y}'
        rows = "\n".join(
            f'          <li class="sh-track"><span class="sh-track__n">{t["n"]}</span>'
            f'<span class="sh-track__t">{e(t["title"])}</span>'
            f'{play(t, t["title"] + " by Josephmooon")}</li>' for t in a["tracks"])
        albums_html.append(
            f'    <div class="sh-album" data-album="{i}">\n'
            f'      <h3 class="sh-album__h">{e(a["title"])}</h3>\n'
            f'      <p class="sh-album__meta">Josephmooon{when} &middot; '
            f'<a href="{e(a["page"])}">on the band&rsquo;s own site</a></p>\n'
            f'      <button type="button" class="sh-album__all" hidden '
            f'data-tracks="{e(json.dumps([[t["title"], t["src"], t["runs"]] for t in a["tracks"]], ensure_ascii=False))}">'
            f'Play the whole album &middot; {len(a["tracks"])} songs &middot; {total}</button>\n'
            f'      <div class="sh-album__now" hidden></div>\n'
            f'      <ol class="sh-tracks">\n{rows}\n      </ol>\n'
            f'    </div>')
    if data.get("albums"):
        room = swap(room, "sh-jukebox", "\n".join(albums_html), ROOM.name)

    items = []
    for m in data["menu"]:
        link = (f' <a href="{e(m["link"])}">Our {e(m["link_title"])} entry</a>.'
                if m.get("link") else "")
        items.append(f'      <li class="sh-dish"><p class="sh-dish__name">{e(m["dish"])}</p>'
                     f'<p class="sh-dish__note">{e(m["note"])}{link}</p></li>')
    room = swap(room, "sh-menu", "\n".join(items), ROOM.name)
    room = swap(room, "sh-mat", placemat_block(data["placemat"]), ROOM.name)
    ROOM.write_text(room)

    notes = NOTES.read_text()
    rows = [f'      <tr><td>{e(q["text"][:60])}{"…" if len(q["text"]) > 60 else ""}</td>'
            f'<td><strong>{e(q["author"])}</strong></td><td><a href="{e(q["work_url"])}">{e(q["work"])}</a></td>'
            f'<td><a href="{e(q["via"])}">{e(q["via_title"])}</a></td></tr>' for q in data["quotes"]]
    notes = swap(notes, "small-hours-credits", "\n".join(rows), NOTES.name)
    jrows = []
    for a in data.get("albums", []):
        for t in a["tracks"]:
            who = ("; ".join(f"{c['who']}, {c['did']}" for c in rec["credits"])
                   if rec and t["src"] == rec["src"] else "Josephmooon; lyrics by Ronan Boren")
            jrows.append(f'      <tr><td>{e(t["title"])}</td><td><a href="{e(a["page"])}">{e(a["title"])}</a></td>'
                         f'<td>{e(who)}</td><td>{t["runs"]}</td></tr>')
    notes = swap(notes, "small-hours-jukebox-credits", "\n".join(jrows), NOTES.name)
    NOTES.write_text(notes)

    seen = (f"{looked} checked word for word against the mirror" if not could_not
            else "the mirror is not on this machine, so none was checked against it this run")
    tracks = sum(len(a["tracks"]) for a in data.get("albums", []))
    print(f"small hours: {len(data['menu'])} dishes, {len(data['quotes'])} quotations, one record "
          f"with its words, {tracks} tracks on the jukebox and the placemat written; {seen}.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
