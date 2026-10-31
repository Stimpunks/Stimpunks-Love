#!/usr/bin/env python3
"""Cel Street: draw the street in the sun over the page's name, and hold the
page and its script to what they say.

Ryan's ask, 2026-10-31: a WebGL version of the street in a 3D anime style, as a
proof of concept beside Paper Street, with solar panels on the roofs. He named
it Cel Street. cel-street.js builds it with three.js; this tool draws the
picture at the top of the page and refuses the page anything it says it does
not do.

THREE.JS IS VENDORED AND PINNED. The CSP lets scripts come from this site and
nowhere else, so three.js is a file in vendor/, with its MIT licence beside it,
and this tool refuses it if its bytes are not the ones recorded here. Updating
it is deciding to: download the release, read its licence, change VERSION and
SHA256 below in the same commit.

THE STREET IS READ, NOT COPIED. cel-street.js asks for index.html when the page
opens and takes the first stretch of its row of doors, and each door's own
awning and name, so the shops are always the front page's. That only holds
while the front page has those parts, and at runtime a missing part would only
look like a broken game, so this tool reads index.html for them.

WHAT IT REFUSES IN cel-street.js:
  · any import but the vendored three.js, and any request but index.html;
  · storage of any kind, and anything sent some other way than fetch;
  · a timer: nothing moves by itself, so nothing waits on a clock;
  · markup written from a string;
  · a colour written into the script, or a --cel- name love.css does not
    declare: every colour is read by name out of love.css.
AND IN love.css's §134: a keyframe, an animation or a transition.
"""
import hashlib
import random
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGE = ROOT / "cel-street.html"
JS = ROOT / "cel-street.js"
CSS = ROOT / "love.css"
INDEX = ROOT / "index.html"
THREE = ROOT / "vendor" / "three.module.min.js"
THREE_LICENCE = ROOT / "vendor" / "three-LICENSE.txt"
VERSION = "0.160.0"
SHA256 = "3e690ac7d180b0aadf0891bea39eec643e29e2d3e75c99b18689518665f69ba6"

problems = []


def refuse(msg):
    problems.append(msg)


# ── three.js, the file and its licence ─────────────────────────────────────
if not THREE.exists():
    refuse("vendor/three.module.min.js is missing, and Cel Street is drawn with it.")
elif hashlib.sha256(THREE.read_bytes()).hexdigest() != SHA256:
    refuse(f"vendor/three.module.min.js is not three.js {VERSION} as recorded here. If it was "
           "updated on purpose, change VERSION and SHA256 in this tool in the same commit.")
if not THREE_LICENCE.exists() or "MIT License" not in THREE_LICENCE.read_text():
    refuse("vendor/three-LICENSE.txt, three.js's MIT licence, has to travel with the file.")

# ── The front page has every part the script reads ─────────────────────────
index = INDEX.read_text()
row = re.search(r'<ul class="doors">(.*?)</ul>', index, re.S)
if not row or not re.search(r'<li><a class="door door--[^"]+" href="[^"]+"', row.group(1)):
    refuse('index.html has no <ul class="doors"> of <li><a class="door"> links, and Cel Street builds exactly those.')
elif 'class="door__awning"' not in row.group(1) or 'class="door__name"' not in row.group(1):
    refuse("index.html's doors have lost .door__awning or .door__name, which Cel Street dresses its shops in.")

# ── What cel-street.js promises ─────────────────────────────────────────────
js = JS.read_text()
code = re.sub(r"/\*.*?\*/", "", js, flags=re.S)
code = re.sub(r"(?m)^\s*//.*$", "", code)
for selector in ("ul.doors", ":scope > li > a.door", ".door__awning", ".door__name"):
    if selector not in code:
        refuse(f"cel-street.js no longer reads {selector!r}; change this tool's list with it, on purpose.")
imports = re.findall(r"^\s*import\b[^;]*?from\s*'([^']+)'", code, re.M)
if imports != ["./vendor/three.module.min.js"]:
    refuse(f"cel-street.js imports {imports}; it imports the vendored three.js and nothing else.")
if re.search(r"\bimport\s*\(", code):
    refuse("cel-street.js imports something at runtime.")
for m in re.finditer(r"fetch\(\s*([^,)]+)", code):
    if m.group(1).strip() != "'index.html'":
        refuse(f"cel-street.js fetches {m.group(1).strip()}; it reads the front page and nothing else.")
if re.search(r"localStorage|sessionStorage|indexedDB|document\.cookie", code):
    refuse("cel-street.js touches storage. The page keeps nothing.")
if re.search(r"XMLHttpRequest|sendBeacon|EventSource|WebSocket", code):
    refuse("cel-street.js sends something some other way than fetch.")
if re.search(r"\bset(Interval|Timeout)\b", code):
    refuse("cel-street.js waits on a clock. Nothing on the street moves by itself.")
if re.search(r"innerHTML|outerHTML|insertAdjacentHTML|document\.write", code):
    refuse("cel-street.js writes markup from a string. It copies the front page's own elements and builds the rest.")
if re.search(r"#[0-9a-fA-F]{3,8}\b|\b(rgb|hsl)a?\(\s*\d", code):
    refuse("cel-street.js writes a colour in itself. Every colour is read by name out of love.css, "
           "or off the front page's own doors.")

css = CSS.read_text()
root = css[css.index(":root {"):css.index("\n}", css.index(":root {"))]
declared = set(re.findall(r"(--[\w-]+)\s*:", re.sub(r"/\*.*?\*/", " ", root, flags=re.S)))
for name in sorted(set(re.findall(r"'(--cel-[\w-]+)'", code))):
    if name not in declared:
        refuse(f"cel-street.js reads {name}, which love.css's :root does not declare.")

sections = [(m.start(), m.group(0)) for m in re.finditer(r"/\* §\d+ ── [^\n]*", css)]
mine = next((i for i, (_, h) in enumerate(sections) if "Cel Street" in h), None)
if mine is None:
    refuse("love.css has no section for Cel Street.")
else:
    body = css[sections[mine][0]:sections[mine + 1][0]]
    body_code = re.sub(r"/\*.*?\*/", "", body, flags=re.S)
    if re.search(r"@keyframes|\banimation\b|\btransition\b", body_code):
        refuse("love.css's Cel Street section moves something. Nothing on the street moves by itself.")

page = PAGE.read_text()
if '<script type="module" src="cel-street.js"></script>' not in page:
    refuse("cel-street.html no longer loads cel-street.js as a module.")
if "data-cel-doors" not in page:
    refuse("cel-street.html has lost its list of doors, the way in for a keyboard and a screen reader.")
if "three.js" not in page or "MIT" not in page:
    refuse("cel-street.html no longer credits three.js and its licence.")

if problems:
    print("REFUSING:\n  " + "\n  ".join(problems))
    sys.exit(2)

# ── The picture over the name ────────────────────────────────────────────────
# The street in the sun, side on: sky going pale to the haze, two cumulus, the
# hills, a row of apartment blocks with shops on their ground floors in the
# street's own door colours and solar panels on every roof, and two poles in
# front with the wires sagging between them. Every edge inked. Seeded, so the
# picture is the same every run.
rnd = random.Random(31)
W, H = 1200, 420
out = [f'<svg class="cel-sky" viewBox="0 0 {W} {H}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">',
       '<defs><linearGradient id="cel-sky-g" x1="0" y1="0" x2="0" y2="1">'
       '<stop offset="0" style="stop-color: var(--cel-sky)"/><stop offset="1" style="stop-color: var(--cel-haze)"/>'
       '</linearGradient></defs>',
       f'<rect width="{W}" height="{H}" fill="url(#cel-sky-g)"/>']
INK = 'stroke="var(--cel-ink)" stroke-linejoin="round"'


def cloud(cx, cy, s):
    puffs = [(0, 0, 1.0), (-0.9, 0.25, 0.7), (0.95, 0.2, 0.75), (-0.4, -0.45, 0.65), (0.45, -0.5, 0.7), (1.6, 0.45, 0.5), (-1.55, 0.5, 0.5)]
    for dx, dy, r in puffs:
        out.append(f'<circle cx="{cx + dx * s:.1f}" cy="{cy + dy * s:.1f}" r="{r * s:.1f}" fill="var(--cel-cloud)"/>')
    out.append(f'<ellipse cx="{cx:.1f}" cy="{cy + 0.62 * s:.1f}" rx="{1.9 * s:.1f}" ry="{0.32 * s:.1f}" fill="var(--cel-cloud-shade)"/>')


cloud(250, 95, 58)
cloud(860, 70, 74)
out.append(f'<path d="M0 300 Q160 238 330 286 T700 270 T1200 262 V{H} H0 Z" fill="var(--cel-hill)"/>')

SHOPS = ["--hot", "--cyan", "--yellow", "--green", "--violet", "--orange"]
WALLS = ["--cel-wall-1", "--cel-wall-2", "--cel-wall-3", "--cel-wall-4"]
x, k, base = -20, 0, 372
while x < W:
    w = rnd.choice([118, 136, 152, 170])
    h = rnd.choice([150, 182, 214, 246])
    top = base - h
    wall = WALLS[k % len(WALLS)]
    out.append(f'<rect x="{x}" y="{top}" width="{w}" height="{h}" fill="var({wall})" {INK} stroke-width="3"/>')
    # Solar panels on the roof, tipped toward the sun.
    for p in range(max(1, (w - 16) // 30)):
        px = x + 10 + p * 30
        out.append(f'<path d="M{px} {top - 3} L{px + 8} {top - 15} L{px + 30} {top - 15} L{px + 22} {top - 3} Z" fill="var(--cel-panel)" stroke="var(--cel-frame)" stroke-width="1.6"/>')
    # Windows, floor by floor.
    for fy in range(top + 18, base - 70, 34):
        for fx in range(x + 12, x + w - 30, 34):
            out.append(f'<rect x="{fx}" y="{fy}" width="20" height="22" fill="var(--cel-glass)" stroke="var(--cel-frame)" stroke-width="2.5"/>')
            out.append(f'<path d="M{fx + 5} {fy + 19} L{fx + 11} {fy + 3}" stroke="var(--cel-glint)" stroke-width="3"/>')
    # The shop on the ground floor, in one of the street's own door colours,
    # with a striped awning over it.
    shop = SHOPS[k % len(SHOPS)]
    out.append(f'<rect x="{x + 6}" y="{base - 52}" width="{w - 12}" height="52" fill="var({shop})" {INK} stroke-width="3"/>')
    out.append(f'<rect x="{x + 22}" y="{base - 36}" width="{w - 44}" height="30" fill="var(--cel-glass)" {INK} stroke-width="2"/>')
    out.append(f'<path d="M{x + 2} {base - 52} L{x + 10} {base - 66} L{x + w - 10} {base - 66} L{x + w - 2} {base - 52} Z" fill="var(--cel-cloud)" {INK} stroke-width="3"/>')
    for sx in range(x + 10, x + w - 14, 16):
        out.append(f'<path d="M{sx} {base - 66} L{sx + 8} {base - 66} L{sx + 6} {base - 52} L{sx - 3} {base - 52} Z" fill="var({shop})"/>')
    x += w
    k += 1

out.append(f'<rect y="{base}" width="{W}" height="18" fill="var(--cel-walk)" {INK} stroke-width="3"/>')
out.append(f'<rect y="{base + 18}" width="{W}" height="{H - base - 18}" fill="var(--cel-road)"/>')
for dx in range(20, W, 90):
    out.append(f'<rect x="{dx}" y="{base + 30}" width="46" height="5" fill="var(--cel-paint)"/>')

poles = [150, 640, 1110]
for px in poles:
    out.append(f'<rect x="{px - 7}" y="60" width="14" height="{base - 60 + 10}" fill="var(--cel-pole)" {INK} stroke-width="3"/>')
    out.append(f'<rect x="{px - 46}" y="76" width="92" height="9" fill="var(--cel-pole)" {INK} stroke-width="2.5"/>')
    out.append(f'<rect x="{px - 30}" y="112" width="60" height="8" fill="var(--cel-pole)" {INK} stroke-width="2.5"/>')
    out.append(f'<rect x="{px + 9}" y="140" width="24" height="34" rx="5" fill="var(--cel-frame)" {INK} stroke-width="2.5"/>')
for a, b in zip(poles, poles[1:]):
    for i, (o, y, sag) in enumerate([(-40, 74, 46), (-14, 74, 52), (14, 74, 58), (40, 74, 50), (-26, 112, 70), (24, 112, 64), (0, 150, 80)]):
        mid = (a + b) / 2
        out.append(f'<path d="M{a + o} {y} Q{mid} {y + sag * 2} {b + o} {y}" fill="none" stroke="var(--cel-wire)" stroke-width="{2.6 if i < 4 else 3.6}"/>')
out.append(f'<path d="M{poles[0] - 40} 74 Q60 140 -10 120" fill="none" stroke="var(--cel-wire)" stroke-width="2.6"/>')
out.append(f'<path d="M{poles[-1] + 40} 74 Q1170 132 1210 116" fill="none" stroke="var(--cel-wire)" stroke-width="2.6"/>')
out.append('</svg>')
svg = "".join(out)

new = re.sub(r"(<!-- cel:sky:begin -->).*?(<!-- cel:sky:end -->)",
             lambda m: m.group(1) + "\n    " + svg + "\n    " + m.group(2), page, flags=re.S)
if "<!-- cel:sky:begin -->" not in page:
    print("REFUSING: cel-street.html has lost its cel:sky markers.")
    sys.exit(2)
if new != page:
    PAGE.write_text(new)
print(f"cel street: three.js {VERSION} pinned, the street in the sun drawn, the script holds its promises")
