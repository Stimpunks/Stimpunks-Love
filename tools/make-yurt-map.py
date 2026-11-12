#!/usr/bin/env python3
"""A map of the Faery Yurt and its rooms: writes it onto her page and onto the 3D yurt's board.

Helen Edgar's ask, 2026-11-11, out of a list of what her yurt could still have:
"A map of your yurt and its rooms. A drawn plan of the yurt, each doorway and
where it leads, with a 'you are here'." Its data is data/yurt-map.json.

ONE PLAN, TWO PLACES, AND THE ROOM DECIDES WHERE EVERYTHING IS. The plan is
the yurt seen from above, the far wall at the top and the door at the
bottom, every way through at the angle it stands at in the yurt on Cel
Street (cel-in-faery-yurt.js), which this tool reads and checks: a way whose
angle in the data is not the room's stops the build, so the map cannot send
anybody to the wrong side of the tent. It writes:

  * faery-yurt.html, between yurt-map markers: the drawing (aria-hidden, a
    picture only) and, under it, the same plan in words, a list of every way
    through round from the door, each named by where it stands on a clock
    face with the door at six, and a link to its room. The list is the map
    for a screen reader, a keyboard and anybody who reads a list better than
    a drawing.
  * cel-in-faery-yurt.js, between yurt-map markers: YURT_MAP, the same ways
    and places, which the room letters on a board by the door.

YOU ARE HERE is the door, on both, because that is where everybody comes in.
It is drawn in her own colours by class (love.css §14) and carries no colour
of its own. Nothing on it moves, and nothing is counted. Never hand-edit
between the markers.
"""
import html
import json
import math
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = json.loads((ROOT / "data" / "yurt-map.json").read_text())
PAGE = ROOT / "faery-yurt.html"
ROOM = ROOT / "cel-in-faery-yurt.js"
fail = []


def refuse(msg):
    fail.append(msg)


def esc(s):
    return html.escape(s, quote=True)


room_src = ROOM.read_text()
page_src = PAGE.read_text()

# ── Every way's angle, read off the yurt on Cel Street ──────────────────────
VARS = {m.group(1): int(m.group(2)) for m in re.finditer(r"var (\w+) = (-?\d+) \* DEG;", room_src)}


def angle_of(expr):
    expr = expr.strip()
    m = re.fullmatch(r"(-?\d+) \* DEG", expr)
    if m:
        return int(m.group(1))
    m = re.fullmatch(r"(\w+)(?: [+-] \d+ \* DEG)?", expr)
    if m and m.group(1) in VARS:
        return VARS[m.group(1)]
    return None


for w in DATA["ways"]:
    page = w["page"]
    if not (ROOT / page).exists():
        refuse(f"the map's way to {w['room']} goes to {page}, which is not a page on the street.")
    if f'href="{page}' not in page_src:
        refuse(f"the map's way to {w['room']} goes to {page}, which her yurt's page does not link to.")
    found = None
    m = re.search(r"stop\(\s*([^,]+?)\s*,\s*'[^']*'\s*,\s*'" + re.escape(page) + "'", room_src)
    if m:
        found = angle_of(m.group(1))
    else:
        m = re.search(r"page: '" + re.escape(page) + r"',\s*x: \(R - [\d.]+\) \* Math\.sin\((\w+)", room_src)
        if m:
            found = angle_of(m.group(1))
    if found is None:
        refuse(f"the map's way to {w['room']} ({page}) is not a way through in the yurt on Cel Street, so the map would draw a door that is not there.")
    elif found != w["angle"]:
        refuse(f"the map puts the way to {w['room']} at {w['angle']} degrees and the yurt on Cel Street has it at {found}: they must agree.")

ids = set(re.findall(r'\bid="([\w-]+)"', page_src))
for p in DATA["places"]:
    if p.get("section") and p["section"] not in ids:
        refuse(f"the map's place {p['name']!r} links to #{p['section']}, which her yurt's page does not have.")

# ── The drawing ──────────────────────────────────────────────────────────────
W, H, CX, CY, R = 760, 640, 380, 316, 210


def xy(angle, r):
    a = math.radians(angle)
    return CX + r * math.sin(a), CY - r * math.cos(a)


def clock(angle):
    h = round(((angle % 360) / 30)) % 12
    return 12 if h == 0 else h


out = [f'<svg class="yurt-map__plan" viewBox="0 0 {W} {H}" role="presentation" aria-hidden="true" focusable="false">']
out.append(f'<circle class="yurt-map__floor" cx="{CX}" cy="{CY}" r="{R}"/>')
out.append(f'<circle class="yurt-map__rug" cx="{CX}" cy="{CY}" r="{R * 0.42:.0f}"/>')
out.append(f'<circle class="yurt-map__table" cx="{CX}" cy="{CY}" r="{R * 0.14:.0f}"/>')
# The lattice wall, drawn as its criss-cross, and the crown's ring overhead.
out.append(f'<circle class="yurt-map__wall" cx="{CX}" cy="{CY}" r="{R}"/>')
out.append(f'<circle class="yurt-map__crown" cx="{CX}" cy="{CY}" r="{R * 0.24:.0f}"/>')
for k in range(28):
    a = k / 28 * 360
    x1, y1 = xy(a, R * 0.24)
    x2, y2 = xy(a, R)
    out.append(f'<line class="yurt-map__pole" x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}"/>')
out.append(f'<text class="yurt-map__mid" x="{CX}" y="{CY + 5}" text-anchor="middle">the low table</text>')
out.append(f'<text class="yurt-map__mid" x="{CX}" y="{CY + 24}" text-anchor="middle">under the crown</text>')
for p in DATA["places"]:
    if p["angle"] == 180:
        continue
    x, y = xy(p["angle"], R * p["r"])
    out.append(f'<circle class="yurt-map__place" cx="{x:.1f}" cy="{y:.1f}" r="5"/>')
    anchor = "middle" if abs(math.sin(math.radians(p["angle"]))) < 0.3 else ("end" if math.sin(math.radians(p["angle"])) > 0 else "start")
    dx = {"middle": 0, "end": -10, "start": 10}[anchor]
    dy = 20 if abs(math.sin(math.radians(p["angle"]))) < 0.3 and math.cos(math.radians(p["angle"])) > 0 else 5
    out.append(f'<text class="yurt-map__placename" x="{x + dx:.1f}" y="{y + dy:.1f}" text-anchor="{anchor}">{esc(p["short"])}</text>')
for w in DATA["ways"]:
    x, y = xy(w["angle"], R)
    lx, ly = xy(w["angle"], R + 26)
    s = math.sin(math.radians(w["angle"]))
    anchor = "middle" if abs(s) < 0.3 else ("start" if s > 0 else "end")
    out.append(f'<circle class="yurt-map__way" cx="{x:.1f}" cy="{y:.1f}" r="11"/>')
    out.append(f'<circle class="yurt-map__wayin" cx="{x:.1f}" cy="{y:.1f}" r="4"/>')
    out.append(f'<text class="yurt-map__room" x="{lx:.1f}" y="{ly + 6:.1f}" text-anchor="{anchor}">{esc(w["room"])}</text>')
# The door and YOU ARE HERE.
dx_, dy_ = xy(180, R)
out.append(f'<rect class="yurt-map__door" x="{dx_ - 26:.1f}" y="{dy_ - 6:.1f}" width="52" height="12" rx="3"/>')
out.append(f'<circle class="yurt-map__here" cx="{dx_:.1f}" cy="{dy_ - 34:.1f}" r="9"/>')
out.append(f'<text class="yurt-map__heretext" x="{dx_ + 18:.1f}" y="{dy_ - 29:.1f}">you are here</text>')
out.append(f'<text class="yurt-map__room" x="{dx_:.1f}" y="{dy_ + 34:.1f}" text-anchor="middle">the door, out to the campgrounds</text>')
out.append("</svg>")
svg = "\n      ".join(out)

# ── The same plan in words ──────────────────────────────────────────────────
items = sorted(DATA["ways"], key=lambda w: (w["angle"] - 180) % 360)
lis = []
for w in items:
    lis.append(f'<li><a href="{w["page"]}">{esc(w["room"])}</a>, through {esc(w["by"])}, at about {clock(w["angle"])} o’clock</li>')
places_words = sorted([p for p in DATA["places"] if p["angle"] != 180], key=lambda p: (p["angle"] - 180) % 360)
pl = []
for p in places_words:
    name = f'<a href="#{p["section"]}">{esc(p["name"])}</a>' if p.get("section") else esc(p["name"])
    pl.append(f"{name} at about {clock(p['angle'])}")
block = f"""<section class="yurt-map hearth-card" aria-labelledby="yurt-map-h">
    <h2 id="yurt-map-h">A map of the yurt</h2>
    <p class="yurt-map__lede">The yurt from above, the far wall at the top and the door at the bottom, where you are. Every way through goes to a room of its own.</p>
    <figure class="yurt-map__fig">
      {svg}
    </figure>
    <p class="yurt-map__how">The same in words, going round to the right from the door, with the door at six o&rsquo;clock and her own page on the far wall at twelve:</p>
    <ol class="yurt-map__ways">
      {chr(10).join('      ' + li for li in lis).strip()}
    </ol>
    <p class="yurt-map__how">And round the wall between them: {'; '.join(pl)}. The low table is in the middle, under the crown. On <a href="cel-street.html#in=faery-yurt">Cel Street</a> this map stands on a lectern just inside the door.</p>
  </section>"""

js_data = {
    "ways": [{"room": w["room"], "angle": w["angle"], "by": w["by"]} for w in DATA["ways"]],
    "places": [{"short": p["short"], "angle": p["angle"], "r": p["r"]} for p in DATA["places"]],
}


def swap(src, begin, end, body, where):
    i, j = src.find(begin), src.find(end)
    if i < 0 or j < i:
        refuse(f"{where} has no {begin!r} … {end!r} markers for the map.")
        return src
    return src[: i + len(begin)] + "\n" + body + "\n" + src[j:]


new_page = swap(page_src, "<!-- yurt-map:begin -->", "<!-- yurt-map:end -->", "  " + block + "\n  ", "faery-yurt.html")
new_room = swap(room_src, "/* yurt-map:begin */", "/* yurt-map:end */",
                "      var YURT_MAP = " + json.dumps(js_data, ensure_ascii=False) + ";\n      ", "cel-in-faery-yurt.js")

if '<a href="#yurt-map-h">' not in new_page:
    refuse("her yurt's contents list has no line for the map; a new section needs a line there too.")

if fail:
    for f in fail:
        print("make-yurt-map: " + f, file=sys.stderr)
    sys.exit(1)
if new_page != page_src:
    PAGE.write_text(new_page)
if new_room != room_src:
    ROOM.write_text(new_room)
print(f"yurt map: every way through where the yurt on Cel Street has it, drawn and in words on her page, and on the board by the door")
