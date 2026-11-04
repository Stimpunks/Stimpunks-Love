#!/usr/bin/env python3
"""Build The Seaside Convenience from data/seaside-convenience.json and tools/restrooms.py.

WHAT IT IS. One of the street's public restrooms (Ryan's brief, 2026-11-03): a
shopfront whose door opens onto a seaside promenade, where a Victorian
convenience of painted cast iron and glazed tile stands under a glass canopy
with the sea past the railings. Every restroom on the street carries the same
list (data/restrooms.json), written into each by tools/restrooms.py in the
room's own classes, with a sentence of the room's own for how it does each
thing; this tool writes this room's, between sea:<part> markers:

  · THE FRONT (sea:view): the pavilion on the promenade in the sea's glare,
    drawn here from a fixed layout, aria-hidden, the caption under it saying
    the same in words. Lifted whole by make-og.py for the share card.
  · THE LEDE (sea:lede), WHAT IT HAS (sea:has), WHY (sea:why), WHAT IS NOT
    HERE (sea:rules) and WHOSE THIS IS (sea:credits), and the room's entry in
    liner-notes.html (sea-credits).

THE LIGHT IS THE ROOM. A bright hazy sky over the sea, and the glare off the
water coming in from the sea side: everything pale and high-key, the shadows
faint and blue, and nothing lit from inside. Its collisions are in §139.

WHAT IT REFUSES:
  · everything tools/restrooms.py refuses: a thing on the list the room does
    not say how it does, a gendered sign, an air dryer, anything to pay, a count
    of the street's restrooms, a stall set apart, a quotation not word for word
    on its page;
  · the same in the room's own words everywhere else in the data;
  · a colour in the drawing that love.css does not declare, and a literal one;
  · anything that moves: a keyframe, an animation or a transition in §139.
    Nothing on the front moves at any setting, the sea and the gulls included;
  · a form, an input, a textarea or anything editable outside the job marker,
    and any script but love.js and quest.js: a restroom keeps nothing;
  · a missing marker pair.
"""
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import restrooms as rr  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data/seaside-convenience.json"
ROOM = ROOT / "seaside-convenience.html"
NOTES = ROOT / "liner-notes.html"
CSS = ROOT / "love.css"
SECTION = 139
P = "sea"

d = json.loads(DATA.read_text())
problems = rr.Problems()

rr.check_room(d, DATA.name, problems)
rr.check_quotes(problems)
for key in ("trail", "over", "sub", "job"):
    rr.sweep(d[key], f"{DATA.name}, {key}", problems)
for k in ("lede", "why", "rules"):
    for i, line in enumerate(d[k]):
        rr.sweep(line, f"{DATA.name}, {k} {i + 1}", problems)
known = {q["key"] for q in rr.shared()["quotes"]}
for k in d["quotes"]:
    if k not in known:
        problems.refuse(f"{DATA.name}: quotation {k!r} is not in data/restrooms.json.")
problems.stop("the Seaside Convenience's words")


# ── The front, drawn ──────────────────────────────────────────────────────────
# Sky, the sea with the glare lying on it, the promenade, the railings, and the
# pavilion: tiled walls, a row of cubicle doors each with its lamp, a glass
# canopy on iron brackets, benches under it facing the sea, the faint blue
# shadow of the canopy on the paving. Everything in --sea-* by name.
W, H = 1200, 380
HORIZON, PROM = 150, 300
s = []
s.append(f'<rect x="0" y="0" width="{W}" height="{HORIZON}" fill="var(--sea-sky)"/>')
s.append(f'<rect x="0" y="{HORIZON - 40}" width="{W}" height="40" fill="var(--sea-glare)" opacity=".55"/>')
s.append(f'<rect x="0" y="{HORIZON}" width="{W}" height="{PROM - HORIZON}" fill="var(--sea-sea)"/>')
# The glare on the water: broken bright dashes, thick near the horizon's sun.
for i in range(46):
    x = (i * 263) % W
    y = HORIZON + 6 + (i * 37) % (PROM - HORIZON - 30)
    w = 30 + (i * 53) % 90
    s.append(f'<rect x="{x}" y="{y}" width="{w}" height="3" rx="1.5" fill="var(--sea-glare)"/>')
# A pier far off, and gulls lying still in the haze.
s.append(f'<rect x="80" y="{HORIZON - 6}" width="220" height="5" fill="var(--sea-ink-2)" opacity=".45"/>')
for x in range(96, 300, 26):
    s.append(f'<rect x="{x}" y="{HORIZON - 2}" width="3" height="14" fill="var(--sea-ink-2)" opacity=".45"/>')
for gx, gy in ((420, 52), (470, 70), (980, 40), (1040, 58)):
    s.append(f'<path d="M{gx - 12} {gy} q6 -7 12 0 q6 -7 12 0" fill="none" stroke="var(--sea-ink-2)" stroke-width="2.2" '
             'stroke-linecap="round"/>')
# The promenade and the railings along its edge.
s.append(f'<rect x="0" y="{PROM}" width="{W}" height="{H - PROM}" fill="var(--sea-sand)"/>')
s.append(f'<rect x="0" y="{PROM}" width="{W}" height="6" fill="var(--sea-iron)"/>')
for x in range(0, W, 18):
    s.append(f'<rect x="{x}" y="{PROM - 34}" width="3" height="34" fill="var(--sea-iron)"/>')
s.append(f'<rect x="0" y="{PROM - 36}" width="{W}" height="5" fill="var(--sea-iron)"/>')
# The pavilion, standing on the promenade in front of the railings.
PX, PW, PY, PH = 300, 600, 196, 150
s.append(f'<ellipse cx="{PX + PW // 2}" cy="{PY + PH + 6}" rx="{PW // 2 + 70}" ry="16" fill="var(--sea-shade)"/>')
s.append(f'<rect x="{PX}" y="{PY}" width="{PW}" height="{PH}" fill="var(--sea-tile)" stroke="var(--sea-iron)" stroke-width="4"/>')
for gy in range(PY + 14, PY + PH, 14):
    s.append(f'<path d="M{PX} {gy} H{PX + PW}" stroke="var(--sea-tile-2)" stroke-width="1.2"/>')
s.append(f'<rect x="{PX}" y="{PY + PH - 26}" width="{PW}" height="26" fill="var(--sea-tile-2)"/>')
# The cubicle doors, each with its lamp: free or in use, never moving.
doors = 8
for k in range(doors):
    dx = PX + 40 + k * 66
    if k == 4:
        continue
    lamp = "var(--sea-free)" if k % 3 else "var(--sea-inuse)"
    s.append(f'<rect x="{dx}" y="{PY + 44}" width="42" height="{PH - 44}" fill="var(--sea-cream)" stroke="var(--sea-iron)" stroke-width="3"/>')
    s.append(f'<circle cx="{dx + 21}" cy="{PY + 32}" r="6" fill="{lamp}" stroke="var(--sea-iron)" stroke-width="2"/>')
# The arch in the middle, with its enamel sign.
ax = PX + 40 + 4 * 66 - 6
s.append(f'<path d="M{ax} {PY + PH} V{PY + 70} a27 27 0 0 1 54 0 V{PY + PH} Z" fill="var(--sea-ink)"/>')
s.append(f'<rect x="{ax - 26}" y="{PY + 6}" width="106" height="30" rx="4" fill="var(--sea-iron)" stroke="var(--sea-cream)" stroke-width="2"/>')
s.append(f'<text x="{ax + 27}" y="{PY + 27}" text-anchor="middle" font-family="\'Playfair Display\', Georgia, serif" '
         f'font-weight="700" font-size="17" fill="var(--sea-cream)">TOILETS</text>')
# The glass canopy over the front, on curly iron brackets.
CY = PY - 34
s.append(f'<path d="M{PX - 60} {CY + 30} L{PX + 20} {CY} H{PX + PW - 20} L{PX + PW + 60} {CY + 30} Z" '
         f'fill="var(--sea-glass)" stroke="var(--sea-iron)" stroke-width="4" stroke-linejoin="round"/>')
for gx in range(PX + 20, PX + PW - 19, 40):
    s.append(f'<path d="M{gx} {CY} L{gx + (gx - (PX + PW // 2)) * 0.13:.0f} {CY + 30}" stroke="var(--sea-iron)" stroke-width="1.6"/>')
for bx in (PX - 40, PX + PW + 40):
    s.append(f'<path d="M{bx} {CY + 30} V{PY + PH}" stroke="var(--sea-iron)" stroke-width="7"/>')
    s.append(f'<path d="M{bx} {CY + 52} c{(PX + PW // 2 - bx) * 0.08:.0f} -6 {(PX + PW // 2 - bx) * 0.1:.0f} -18 '
             f'{(PX + PW // 2 - bx) * 0.12:.0f} -22" fill="none" stroke="var(--sea-iron)" stroke-width="4" stroke-linecap="round"/>')
s.append(f'<rect x="{PX - 60}" y="{CY + 28}" width="{PW + 120}" height="6" fill="var(--sea-cream)" stroke="var(--sea-iron)" stroke-width="2"/>')
# Benches either side, facing the sea, and a shadow under each.
for bx in (PX - 150, PX + PW + 60):
    s.append(f'<ellipse cx="{bx + 45}" cy="{PROM + 50}" rx="58" ry="7" fill="var(--sea-shade)"/>')
    s.append(f'<rect x="{bx}" y="{PROM + 24}" width="90" height="8" rx="2" fill="var(--sea-cream)" stroke="var(--sea-iron)" stroke-width="2"/>')
    s.append(f'<rect x="{bx}" y="{PROM + 10}" width="90" height="7" rx="2" fill="var(--sea-cream)" stroke="var(--sea-iron)" stroke-width="2"/>')
    for lx in (bx + 6, bx + 80):
        s.append(f'<path d="M{lx} {PROM + 10} V{PROM + 48}" stroke="var(--sea-iron)" stroke-width="4"/>')
view = (f'  <svg class="sea-front" viewBox="0 0 {W} {H}" aria-hidden="true" focusable="false">'
        + "".join(s) + "</svg>\n"
        '  <p class="sea-front__caption">The convenience on the promenade: a long pavilion of glazed green tile under a glass '
        'canopy on curly iron brackets, a row of cream cubicle doors with a little lamp over each, an arch in the middle with '
        'an enamel sign that says Toilets, iron benches facing the sea, and the railings, the water and the glare beyond.</p>')

# The colours in the drawing must be declared, and only for this room.
css = CSS.read_text()
root = css[css.index(":root {"):css.index("\n}", css.index(":root {"))]
declared = set(re.findall(r"(--[\w-]+)\s*:", re.sub(r"/\*.*?\*/", " ", root, flags=re.S)))
for name in sorted(set(re.findall(r"var\((--[\w-]+)\)", view))):
    if name not in declared:
        problems.refuse(f"the front is drawn in {name}, which love.css's :root does not declare.")
    if not name.startswith("--sea-"):
        problems.refuse(f"the front is drawn in {name}, another room's colour.")
if re.search(r"#[0-9a-fA-F]{3,8}\b|\b(?:rgb|hsl)a?\(", view):
    problems.refuse("the front writes a colour in itself. Every colour is one §139 declares, by name.")
problems.stop("the front")


# ── Writing ──────────────────────────────────────────────────────────────────
def paras(lines, cls):
    return "\n".join(f'    <p class="{cls}">{x}</p>' for x in lines)


rr.swap(ROOM, "sea:view", view, problems)
rr.swap(ROOM, "sea:lede", paras(d["lede"], "sea-lede"), problems)
rr.swap(ROOM, "sea:has", rr.amenities_block(d, P), problems)
rr.swap(ROOM, "sea:why", paras(d["why"], "sea-para") + "\n" + rr.quotes_block(d["quotes"], P), problems)
rr.swap(ROOM, "sea:rules", '    <ul class="sea-rules">\n' + "\n".join(f"      <li>{r}</li>" for r in d["rules"]) + "\n    </ul>", problems)
credits = [
    "<li><strong>The convenience is ours</strong>, drawn as code by Claude, an AI model made by Anthropic, to Ryan&rsquo;s "
    "brief, after the painted cast-iron and tiled conveniences of old seaside towns; no real building is pictured, and "
    "nothing on this page calls an AI while you read it.</li>",
    f"<li>{rr.credits_line()}</li>",
    "<li><strong>Every quotation belongs to whoever said it</strong> and is credited where it stands: our Bathroom Access "
    "page, and Shawna Potter&rsquo;s <i>Making Spaces Safer</i>, read on our Making Spaces Safer page. The words round "
    "them are this room&rsquo;s own.</li>",
    "<li>The type is Playfair Display, by Claus Eggers S&oslash;rensen, for the room&rsquo;s name and its headings, and "
    "Newsreader, by Production Type, for everything you read, both under the SIL Open Font License, both read off their "
    'own records. More in <a href="liner-notes.html#seaside-convenience">the liner notes</a>.</li>',
]
rr.swap(ROOM, "sea:credits", '    <ul class="sea-credits">\n' + "\n".join("      " + c for c in credits) + "\n    </ul>", problems)
notes = [
    '  <p>A public restroom on the street, a Victorian convenience of painted cast iron and glazed tile on a seaside '
    'promenade under a glass canopy. Ryan&rsquo;s brief of 2026-11-03, for public restrooms on the street, each a room with a '
    'name and a theme. Everything on the list every restroom carries is in it, and <code>tools/restrooms.py</code> holds it '
    'to all of it.</p>',
    f'  <p>{rr.credits_line()}</p>',
    '  <p>The type is <strong>Playfair Display</strong>, by Claus Eggers S&oslash;rensen, for the name and headings, and '
    '<strong>Newsreader</strong>, by Production Type, for every word you read, both under the SIL Open Font License.</p>',
]
rr.swap(NOTES, "sea-credits", "\n".join(notes), problems)
problems.stop("writing")


# ── What the page as written promises ────────────────────────────────────────
page = ROOM.read_text()
body = re.sub(r"<!-- quest:.*?:end -->", "", page, flags=re.S)
for tag in re.findall(r"<(form|input|textarea|select)\b", body, re.I):
    problems.refuse(f"{ROOM.name}: a <{tag}> outside the job marker. A restroom keeps nothing.")
scripts = re.findall(r'<script src="([^"]+)"', page)
for sc in scripts:
    if sc not in ("love.js", "quest.js"):
        problems.refuse(f"{ROOM.name} loads {sc}; the convenience runs only love.js and quest.js.")
sec = re.search(rf"/\* §{SECTION} ── ROOM: The Seaside Convenience.*?(?=/\* §\d+ ── )", css, re.S)
if not sec:
    problems.refuse(f"love.css has no §{SECTION} for the Seaside Convenience.")
elif re.search(r"@keyframes|\banimation\s*:|\btransition\s*:", re.sub(r"/\*.*?\*/", " ", sec.group(0), flags=re.S)):
    problems.refuse(f"§{SECTION} moves something. Nothing on the front moves at any setting.")
problems.stop("the page as written")
print("the seaside convenience: the front, the list, why, what is not here and the credits written; "
      "every amenity said in the room's own words")
