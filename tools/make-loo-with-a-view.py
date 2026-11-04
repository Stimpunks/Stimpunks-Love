#!/usr/bin/env python3
"""Build Loo With a View: its view, its words, the list and its credits, from
data/loo-with-a-view.json and data/restrooms.json.

WHAT IT IS. A public restroom on the street (Ryan's brief, 2026-11-03): a rest
stop of board-marked concrete, rusted steel and larch at the top of a mountain
road, half dug into the hillside and half out over a fjord, with one glass
wall, at the time of year when the sun does not set. After Norway's
scenic-route rest stops, which Visit Norway showed off in October 2026, and
copying none of them: the building is ours.

THE LIGHT IS THE MIDNIGHT SUN, ON THE NORTHERN HORIZON STRAIGHT OUT THROUGH THE
GLASS, so everything you face from the door is backlit: rimmed in gold along
its far edge, its face toward you in cool shadow, and its long shadow lying
back across the floor to your feet. That is in the drawing; on the page it is
the cool shadow every word stands in, with a line of gold along the far (top)
edge of every card and heading, and nothing lit behind a word.

ONE DATA FILE, ONE TOOL, the contract make-yells.py set. Between lwv:<part>
markers in loo-with-a-view.html this writes the trail, the name, the view and
its words, the lede, THE LIST (restrooms.amenities_block, every restroom's
list with this room's own sentence for how it does each), the quotations
(restrooms.quotes_block), the rules in here and the credits.

WHAT IT REFUSES:
  · everything tools/restrooms.py refuses in a restroom: a thing on the list
    left out, a gendered sign, an air dryer, anything to pay, a count of the
    street's restrooms, a stall set apart, and a quotation not word for word
    on its page in the mirror;
  · the same sweep over every word of ours on the page, not only `how`;
  · a quotation key data/restrooms.json does not have;
  · a keyframe, an animation or a transition in §137: nothing moves at any
    setting, because the sun is sitting on the horizon and staying there. The
    friendly edit is the sun sinking and rising again at MAX, which is the one
    thing a midnight sun does not do;
  · a form, an input or anything editable outside the job marker, and any
    script but love.js and quest.js;
  · a literal colour in the drawing: every ink is §137's, by name;
  · a missing marker pair.
"""
import html
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import restrooms as rr  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data/loo-with-a-view.json"
ROOM = ROOT / "loo-with-a-view.html"
CSS = ROOT / "love.css"
FACES = ROOT / "data/foundry-faces.json"
P = "lwv"
SECTION = 137
SCRIPTS = {"love.js", "quest.js"}
BOLD = re.compile(r"\*\*([^*]+)\*\*")

problems = rr.Problems()
d = json.loads(DATA.read_text())
shared = rr.shared()
qkeys = {q["key"] for q in shared["quotes"]}


def words(s):
    """Our words: escaped, with **bold** made bold."""
    return BOLD.sub(r"<b>\1</b>", rr.esc(s))


# ── The data, held to the list ───────────────────────────────────────────────
rr.check_room(d, DATA.name, problems)
rr.check_quotes(problems)
for k in d.get("why", []) + d.get("door_quotes", []):
    if k not in qkeys:
        problems.refuse(f"{DATA.name}: quotes {k!r}, which data/restrooms.json does not have.")
for field in ("over", "name", "sub", "trail", "view_words"):
    if not str(d.get(field, "")).strip():
        problems.refuse(f"{DATA.name}: no {field}.")
    rr.sweep(d.get(field, ""), f"{DATA.name} {field}", problems)
for i, p in enumerate(d.get("lede", []), 1):
    rr.sweep(p, f"{DATA.name} lede {i}", problems)
for r in d.get("rules", []):
    rr.sweep(r["name"] + " " + r["line"], f"{DATA.name} rule {r['name']!r}", problems)
for k in ("blurb", "knock"):
    rr.sweep(html.unescape(d["door"][k]), f"{DATA.name} door {k}", problems)
problems.stop("Loo With a View's data")

# ── The view ─────────────────────────────────────────────────────────────────
# From the door: the glass wall at the far end, the sun on the horizon in it,
# and everything between lit from behind. Every ink is §137's, by name.
W, H = 1200, 420
GX0, GX1, GTOP, GBOT = 230, 970, 40, 300   # the glass wall
HOR = 214                                   # the horizon
SUN = (646, 192, 24)                        # the midnight sun, on it
VX, VY = 600, 170                           # where the floor's lines meet
MULLIONS = [230, 392, 556, 728, 892, 970]


def floor_x(x0, y):
    """Where a line on the floor that meets the glass at x0 is at height y."""
    return VX + (x0 - VX) * (y - VY) / (GBOT - VY)


def num(v):
    return f"{v:.1f}".rstrip("0").rstrip(".")


parts = [
    '<defs>'
    '<linearGradient id="lwv-sky-g" x1="0" y1="0" x2="0" y2="1">'
    '<stop offset="0" stop-color="var(--lwv-sky)"/><stop offset=".72" stop-color="var(--lwv-sky)"/>'
    '<stop offset="1" stop-color="var(--lwv-low)"/></linearGradient>'
    '<radialGradient id="lwv-halo-g" cx="50%" cy="50%" r="50%">'
    '<stop offset="0" stop-color="var(--lwv-low)" stop-opacity=".95"/>'
    '<stop offset="1" stop-color="var(--lwv-low)" stop-opacity="0"/></radialGradient>'
    '</defs>',
    # The room in shadow round the glass: ceiling, the larch wall of stalls on
    # the left, the board-marked concrete on the right, the floor.
    f'<rect x="0" y="0" width="{W}" height="{H}" fill="var(--lwv-shade)"/>',
    f'<path d="M0 0 H{W} L{GX1} {GTOP} H{GX0} Z" fill="var(--lwv-line)"/>',
    f'<path d="M0 0 L{GX0} {GTOP} V{GBOT} L0 {H} Z" fill="var(--lwv-larch)"/>',
    f'<path d="M{W} 0 L{GX1} {GTOP} V{GBOT} L{W} {H} Z" fill="var(--lwv-concrete)"/>',
    f'<path d="M{GX0} {GBOT} H{GX1} L{W} {H} H0 Z" fill="var(--lwv-concrete)"/>',
]
# The concrete's board marks, running away toward the glass.
marks = "".join(f'M{W} {num(y)} L{GX1} {num(GTOP + (y - 0) * (GBOT - GTOP) / H)}'
                for y in range(30, H, 34))
parts.append(f'<path d="{marks}" stroke="var(--lwv-line)" stroke-width="1.2" stroke-opacity=".45" fill="none"/>')
# The stalls along the larch wall: a door's edge every so often, running
# toward the glass, and over each door its small light.
doors = []
lights = []
for k, x in enumerate([18, 70, 116, 156, 190, 216]):
    top = x * GTOP / GX0
    bot = H - x * (H - GBOT) / GX0
    doors.append(f'M{x} {num(top + 6)} V{num(bot)}')
    if k < 5:
        nx = [18, 70, 116, 156, 190, 216][k + 1]
        mx = (x + nx) / 2
        lights.append(f'<circle cx="{num(mx)}" cy="{num(mx * GTOP / GX0 + 24 - mx * 0.04)}" r="{num(5.2 - k * 0.7)}" '
                      f'fill="var(--lwv-rim)"/>')
parts.append(f'<path d="{"".join(doors)}" stroke="var(--lwv-line)" stroke-width="3" fill="none"/>')
parts.extend(lights)
# THE GLASS: the low sky, the halo round the sun, the sun sitting on the
# horizon, the mountains either side with gold along their ridges, the fjord,
# and the sun's road across the water toward you.
sx, sy, sr = SUN
parts += [
    f'<rect x="{GX0}" y="{GTOP}" width="{GX1 - GX0}" height="{HOR - GTOP}" fill="url(#lwv-sky-g)"/>',
    f'<ellipse cx="{sx}" cy="{sy}" rx="150" ry="70" fill="url(#lwv-halo-g)"/>',
    f'<circle cx="{sx}" cy="{sy}" r="{sr}" fill="var(--lwv-sun)"/>',
    f'<path d="M{GX0} {HOR} V128 L268 112 L314 138 L352 124 L404 158 L452 170 L498 190 L534 {HOR} Z" fill="var(--lwv-ridge)"/>',
    f'<path d="M{GX0} 128 L268 112 L314 138 L352 124 L404 158 L452 170 L498 190 L534 {HOR}" '
    f'stroke="var(--lwv-rim)" stroke-width="2.4" fill="none" stroke-linejoin="round"/>',
    f'<path d="M{GX1} {HOR} V106 L926 92 L884 118 L842 110 L796 146 L752 166 L716 192 L700 {HOR} Z" fill="var(--lwv-ridge)"/>',
    f'<path d="M{GX1} 106 L926 92 L884 118 L842 110 L796 146 L752 166 L716 192 L700 {HOR}" '
    f'stroke="var(--lwv-rim)" stroke-width="2.4" fill="none" stroke-linejoin="round"/>',
    f'<rect x="{GX0}" y="{HOR}" width="{GX1 - GX0}" height="{GBOT - HOR}" fill="var(--lwv-fjord)"/>',
]
road = []
for i, y in enumerate(range(HOR + 3, GBOT, 6)):
    half = 8 + (y - HOR) * 1.05
    road.append(f'M{num(sx - half)} {y} H{num(sx + half)}')
parts.append(f'<path d="{"".join(road)}" stroke="var(--lwv-glare)" stroke-width="2.6" fill="none"/>')
# The steel between the panes, each with gold down both its edges, and the
# frame round the glass.
for x in MULLIONS:
    parts.append(f'<rect x="{x - 6}" y="{GTOP}" width="12" height="{GBOT - GTOP}" fill="var(--lwv-corten)"/>'
                 f'<path d="M{x - 6} {GTOP} V{GBOT} M{x + 6} {GTOP} V{GBOT}" stroke="var(--lwv-rim)" stroke-width="1.4"/>')
parts.append(f'<rect x="{GX0 - 6}" y="{GTOP - 6}" width="{GX1 - GX0 + 12}" height="10" fill="var(--lwv-corten)"/>'
             f'<path d="M{GX0 - 6} {GTOP + 4} H{GX1 + 6}" stroke="var(--lwv-rim)" stroke-width="1.4"/>')
# THE LIGHT ON THE FLOOR: each pane's light lying on the concrete toward you,
# and between them the steel's long shadows.
for a, b in zip(MULLIONS, MULLIONS[1:]):
    a, b = a + 6, b - 6
    parts.append(f'<path d="M{a} {GBOT} L{b} {GBOT} L{num(floor_x(b, H))} {H} L{num(floor_x(a, H))} {H} Z" '
                 f'fill="var(--lwv-glare)" fill-opacity=".34"/>')
# THE BASINS, a long larch counter under the left of the glass, and THE BENCH
# facing the water on the right, both against the light: gold along their tops,
# their faces in shadow, and their shadows lying back across the light.
CNT = (252, 548, 266)
BEN = (742, 952, 282)
parts += [
    f'<path d="M{CNT[0]} {GBOT} L{CNT[1]} {GBOT} L{num(floor_x(CNT[1], H))} {H} L{num(floor_x(CNT[0], H))} {H} Z" '
    f'fill="var(--lwv-line)" fill-opacity=".38"/>',
    f'<rect x="{CNT[0]}" y="{CNT[2]}" width="{CNT[1] - CNT[0]}" height="{GBOT - CNT[2]}" fill="var(--lwv-larch)"/>',
    f'<path d="M{CNT[0]} {CNT[2]} H{CNT[1]}" stroke="var(--lwv-rim)" stroke-width="3"/>',
]
for bx in (300, 374, 448, 512):
    parts.append(f'<ellipse cx="{bx}" cy="{CNT[2] + 4}" rx="20" ry="4" fill="var(--lwv-line)"/>'
                 f'<path d="M{bx} {CNT[2] - 12} V{CNT[2] - 2} H{bx + 7}" stroke="var(--lwv-line)" stroke-width="3" fill="none"/>')
parts += [
    f'<path d="M{BEN[0]} {GBOT} L{BEN[1]} {GBOT} L{num(floor_x(BEN[1], H))} {H} L{num(floor_x(BEN[0], H))} {H} Z" '
    f'fill="var(--lwv-line)" fill-opacity=".3"/>',
    f'<rect x="{BEN[0]}" y="{BEN[2]}" width="{BEN[1] - BEN[0]}" height="7" fill="var(--lwv-larch)"/>',
    f'<path d="M{BEN[0]} {BEN[2]} H{BEN[1]}" stroke="var(--lwv-rim)" stroke-width="2.4"/>',
    f'<path d="M{BEN[0] + 10} {BEN[2] + 7} V{GBOT} M{BEN[1] - 10} {BEN[2] + 7} V{GBOT} M{(BEN[0] + BEN[1]) // 2} {BEN[2] + 7} V{GBOT}" '
    f'stroke="var(--lwv-line)" stroke-width="5"/>',
]
view = (f'  <svg class="lwv-view" viewBox="0 0 {W} {H}" aria-hidden="true" focusable="false">'
        + "".join(parts) + "</svg>\n"
        f'  <figcaption class="lwv-scene__words">{rr.esc(d["view_words"])}</figcaption>')
if re.search(r"#[0-9A-Fa-f]{3,8}\b|\b(rgb|hsl)a?\(", view):
    problems.refuse("the view writes a colour in itself. Every ink is §137's, by name.")


# ── Writing ──────────────────────────────────────────────────────────────────
def swap(marker, block, indent="  "):
    rr.swap(ROOM, marker, block, problems, indent)


swap("lwv:trail", f'    <p class="lwv-trail">{rr.esc(d["trail"]).replace(" · ", " &middot; ")}</p>')
swap("lwv:head", "\n".join([
    f'    <p class="lwv-over">{rr.esc(d["over"])}</p>',
    f'    <h1>{rr.esc(d["name"])}</h1>',
    f'    <p class="lwv-sub">{rr.esc(d["sub"])}</p>',
]))
swap("lwv:view", view)
swap("lwv:lede", "\n".join(f"    <p>{words(p)}</p>" for p in d["lede"]))
swap("lwv:has", rr.amenities_block(d, P))
swap("lwv:why", rr.quotes_block(d["why"], P))
swap("lwv:door", "\n".join([
    "    <p>The things by the door are the ones somebody might need in a hurry, or might not want to be seen "
    "taking, so they are where you can reach them without walking the length of the room, and nobody stands "
    "beside them.</p>",
    rr.quotes_block(d["door_quotes"], P),
]))
swap("lwv:rules", '    <ul class="lwv-rules">\n' + "\n".join(
    f'      <li><strong>{rr.esc(r["name"])}</strong> {rr.esc(r["line"])}</li>' for r in d["rules"]) + "\n    </ul>")

faces = json.loads(FACES.read_text())["faces"]
display, text_face = faces["instrument-sans"], faces["atkinson-hyperlegible-next"]
licence = lambda f: f["licence"].replace(" 1.1", "")
credits = [
    f"      <li>{rr.credits_line()}</li>",
    "      <li><strong>The rest stop is ours</strong>, drawn as code by Claude, an AI model made by Anthropic, to "
    "Ryan&rsquo;s brief. It copies no real building and names none as this one: the idea of a rest stop built as "
    "carefully as the road is the scenic routes&rsquo;, and the concrete, steel, larch and glass are everybody&rsquo;s. "
    "Nothing on this page calls an AI while you read it.</li>",
    "      <li><strong>Every quotation belongs to whoever said it</strong> and is credited where it stands, read on "
    "our own pages; the words around them are ours, written for this room.</li>",
    f"      <li>The type is {rr.esc(display['family'])}, by {rr.esc(display['designer'])}, for the room&rsquo;s name "
    f"and its headings, under the {rr.esc(licence(display))}, and {rr.esc(text_face['family'])}, by "
    f"{rr.esc(text_face['designer'])}, for everything you read, under the {rr.esc(licence(text_face))}, both "
    "read off their own records. The Braille Institute drew it to be read by people with low vision, which is "
    "what a restroom&rsquo;s signs are for.</li>",
]
swap("lwv:credits", '    <ul class="lwv-credits">\n' + "\n".join(credits) + "\n    </ul>")
problems.stop("writing Loo With a View")

# ── The published page, checked ──────────────────────────────────────────────
src = ROOM.read_text()
body = re.sub(r"<!-- quest:.*?:end -->", " ", src, flags=re.S)
body = re.sub(r"<!--.*?-->", " ", body, flags=re.S)
for tag in re.findall(r"<(form|input|textarea|select)\b", body, re.I):
    problems.refuse(f"{ROOM.name}: a <{tag}> outside the job marker. Nothing in this room takes anything from you.")
if re.search(r"contenteditable", body, re.I):
    problems.refuse(f"{ROOM.name}: something editable outside the job marker.")
for s in re.findall(r'<script\b[^>]*\bsrc="([^"]+)"', src):
    if s not in SCRIPTS:
        problems.refuse(f"{ROOM.name}: loads {s}, and the room runs {', '.join(sorted(SCRIPTS))} and nothing else.")
sec = re.search(rf"/\* §{SECTION} ── ROOM: Loo With a View.*?(?=/\* §\d+ ── )", CSS.read_text(), re.S)
if not sec:
    problems.refuse(f"love.css has no §{SECTION} for Loo With a View.")
elif re.search(r"@keyframes|\banimation\s*:|\btransition\s*:", re.sub(r"/\*.*?\*/", " ", sec.group(0), flags=re.S)):
    problems.refuse(f"love.css §{SECTION}: a keyframe, an animation or a transition. Nothing in this rest stop moves "
                    "at any setting; the sun sits on the horizon and stays there.")
text = re.sub(r"<(script|style)\b.*?</\1>", " ", body, flags=re.S)
text = re.sub(r"<blockquote\b.*?</blockquote>", " ", text, flags=re.S)
text = re.sub(r"<head\b.*?</head>", " ", text, flags=re.S)
text = re.sub(r'<p class="lwv-has__line">.*?</p>', " ", text, flags=re.S)
rr.sweep(text, ROOM.name, problems)
problems.stop("the page as written")

print(f"loo with a view: the view, the list with this room's own sentence for every thing on it, "
      f"{len(d['why']) + len(d['door_quotes'])} quotations, written in {ROOM.name}")
print("  for everybody, free, no air dryers, nothing counted; the sun stays on the horizon")
