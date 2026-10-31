#!/usr/bin/env python3
"""Paper Street: draw the toy theatre's front, and hold the page to what it says.

Ryan's ask, 2026-10-30: a sandbox game on the web, walking down the street and
into the rooms with your avatars, chimeras and pets, built a little at a time,
the street first. paper-street.js stands the street up; this tool draws the
picture over the page's name and refuses the page anything it says it does not
do.

THE STREET IS READ, NOT COPIED. paper-street.js asks for index.html when the
page opens and takes the parts below out of it, so Paper Street can never be a
second street that drifts from the first. That only holds while the front page
has those parts, and nothing at runtime would say so out loud: a page with no
row of doors would stand nothing up and look like a broken game. So this tool
reads index.html for every part the script reads, and refuses if one has gone.

WHAT IT REFUSES IN paper-street.js:
  · storage of any kind written, and love-familiar written: familiar.js is the
    one file that keeps a familiar, and this page keeps nothing.
  · any request but index.html and a GET of /cb/avatars, and /cb/avatars asked
    anywhere but the Bring my avatar press.
  · a timer: nothing moves by itself, so nothing waits on a clock. Movement is
    requestAnimationFrame, and only while a key or button is held or a glide is
    on its way to a door.
  · a rotation, a skew or a matrix: the street is a toy theatre, every flat
    faces you, and check-gentle.py sees only translate and scale here.
  · markup written from a string.
AND IN love.css's section for the room: a keyframe, an animation or a
transition, because the street stands still until you walk.
AND THE PAGE must keep data-familiar="walks", which love.js and familiar.js
read so the familiar is not put on the page twice.
"""
import random
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGE = ROOT / "paper-street.html"
JS = ROOT / "paper-street.js"
CSS = ROOT / "love.css"
INDEX = ROOT / "index.html"

problems = []


def html_text(s):
    import html as _h
    return _h.unescape(re.sub(r"<[^>]+>", "", s)).strip()


def refuse(msg):
    problems.append(msg)


# ── The front page has every part the script reads ─────────────────────────
index = INDEX.read_text()
row = re.search(r'<ul class="doors">(.*?)</ul>', index, re.S)
if not row or not re.search(r'<li><a class="door door--[^"]+" href="[^"]+"', row.group(1)):
    refuse("index.html has no <ul class=\"doors\"> of <li><a class=\"door\"> links, and Paper Street stands up exactly that.")
for cls in ("noticeboard", "brasstacks", "postercol", "gardengate", "signpost", "roadout", "liftdown"):
    if not re.search(rf'<a class="{cls}" href=', index):
        refuse(f"index.html has lost its a.{cls}, which paper-street.js stands up as a flat.")
if '<div class="openground">' not in index:
    refuse("index.html has lost its div.openground, the fence Paper Street stands up after the last door.")

js = JS.read_text()
code = re.sub(r"/\*.*?\*/", "", js, flags=re.S)
code = re.sub(r"(?m)^\s*//.*$", "", code)
for selector in ("ul.doors", ":scope > li > a.door", "a.signpost", "a.liftdown", "a.noticeboard",
                 "a.brasstacks", "a.postercol", "a.gardengate", "div.openground", "a.roadout"):
    if selector not in code:
        refuse(f"paper-street.js no longer reads {selector!r}; change this tool's list with it, on purpose.")

# ── What paper-street.js promises ───────────────────────────────────────────
if re.search(r"localStorage\.(setItem|removeItem|clear)|sessionStorage|indexedDB|document\.cookie", code):
    refuse("paper-street.js writes to storage. The page keeps nothing; familiar.js alone keeps a familiar.")
for m in re.finditer(r"fetch\(\s*([^,)]+)", code):
    if m.group(1).strip() not in ("'index.html'", "'/cb/avatars'"):
        refuse(f"paper-street.js fetches {m.group(1).strip()}; it reads the front page and, on a press, your avatars, and nothing else.")
if re.search(r"XMLHttpRequest|sendBeacon|EventSource|WebSocket", code):
    refuse("paper-street.js sends something some other way than fetch.")
if re.search(r"method:\s*'(POST|PUT|DELETE|PATCH)'", code):
    refuse("paper-street.js writes to the server. It only reads.")
avatars = code.find("'/cb/avatars'")
press = code.rfind("addEventListener('click'", 0, avatars)
if avatars != -1 and (press == -1 or code.find("data-ps-bring") > press):
    refuse("paper-street.js asks /cb/avatars outside the Bring my avatar press.")
if re.search(r"\bsetInterval\b", code):
    refuse("paper-street.js keeps a timer running. Nothing on the street moves by itself.")
if re.search(r"rotate|skew|matrix|perspective", code):
    refuse("paper-street.js rotates, skews or uses a matrix or perspective. Every flat faces you; translate and scale only.")
if re.search(r"innerHTML|outerHTML|insertAdjacentHTML|document\.write", code):
    refuse("paper-street.js writes markup from a string. It copies the front page's own elements and builds the rest.")

if "screen(" not in code or "iframe" not in code:
    refuse("paper-street.js has lost screen(), the one way a room's page goes up inside its scene.")

# ── The rooms you can walk into, each its own file ───────────────────────────
# A ROOM'S FILE IS walk-<the room's page>.js AND IS THAT ROOM'S WORLD. It is held
# to Paper Street's promises (nothing kept, sent, fetched or timed, nothing
# rotated, no markup from a string), it may not build a frame of its own (its
# page goes up through Paper Street's screen(), so every room's page arrives the
# same honest way), it draws only in colours love.css declares, by name, and its
# classes are styled in its own room's section and nowhere else.
CSS_SRC = CSS.read_text()
SECTIONS = [(m.start(), m.group(0)) for m in re.finditer(r"/\* §\d+ ── [^\n]*", CSS_SRC)]
ROOT_DECL = set(re.findall(r"(--[\w-]+)\s*:", re.sub(r"/\*.*?\*/", " ",
                CSS_SRC[CSS_SRC.index(":root {"):CSS_SRC.index("\n}", CSS_SRC.index(":root {"))], flags=re.S)))


def section_with(selector):
    for i, (at, head) in enumerate(SECTIONS):
        end = SECTIONS[i + 1][0] if i + 1 < len(SECTIONS) else len(CSS_SRC)
        body = CSS_SRC[at:end]
        if re.search(rf"(^|[\s,}}]){re.escape(selector)}[\s{{:.,\[]", re.sub(r"/\*.*?\*/", "", body, flags=re.S)):
            return head, body
    return None, None


rooms = {}
for f in sorted(ROOT.glob("walk-*.js")):
    page = f.name[len("walk-"):-3] + ".html"
    src = f.read_text()
    mod = re.sub(r"/\*.*?\*/", "", src, flags=re.S)
    mod = re.sub(r"(?m)^\s*//.*$", "", mod)
    who = f.name
    if not (ROOT / page).exists():
        refuse(f"{who} walks into {page}, which is not a page on the street.")
        continue
    if f"window.lovePaperRooms['{page}']" not in mod:
        refuse(f"{who} does not register itself as window.lovePaperRooms['{page}'].")
    if re.search(r"localStorage|sessionStorage|indexedDB|document\.cookie", mod):
        refuse(f"{who} touches storage. A room on Paper Street keeps nothing.")
    if re.search(r"\bfetch\(|XMLHttpRequest|sendBeacon|EventSource|WebSocket|\bimport\(", mod):
        refuse(f"{who} asks the network for something. Its page arrives through screen(), and that is all.")
    if re.search(r"\bsetInterval\b|\bsetTimeout\b|requestAnimationFrame", mod):
        refuse(f"{who} keeps a clock. Nothing in a room moves by itself; Paper Street moves you.")
    if re.search(r"rotate|skew|matrix|perspective|transform", mod):
        refuse(f"{who} rotates, skews or transforms something. Work the points out turned and draw them.")
    if re.search(r"innerHTML|outerHTML|insertAdjacentHTML|document\.write", mod):
        refuse(f"{who} writes markup from a string.")
    if re.search(r"createElement\(\s*['\"]iframe", mod) or "<iframe" in mod:
        refuse(f"{who} builds a frame of its own. The room's page goes up through kit.screen().")
    if "kit.screen(kit.page" not in mod:
        refuse(f"{who} never hangs its own page. Every room on Paper Street has its page inside it.")
    if re.search(r"#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(", mod):
        refuse(f"{who} has a literal colour. A room draws in the inks its section declares, by name.")
    for v in sorted(set(re.findall(r"var\((--[\w-]+)\)", mod)) | set(re.findall(r"'(--[\w-]+)'", mod))):
        if v not in ROOT_DECL:
            refuse(f"{who} draws in {v}, which love.css's :root does not declare.")
    body_cls = re.search(r'<body[^>]*class="([^"]+)"', (ROOT / page).read_text())
    prefix = re.search(r"prefix:\s*'([a-z0-9-]+)'", mod)
    if not prefix:
        refuse(f"{who} names no prefix for its classes.")
    elif body_cls:
        head, body = section_with("." + body_cls.group(1).split()[0])
        if not head:
            refuse(f"{who}: no section of love.css styles {page}'s body class.")
        else:
            for c in sorted(set(re.findall(r"'(" + re.escape(prefix.group(1)) + r"[a-z0-9-]*)'", mod))):
                if not re.search(rf"\.{re.escape(c)}\b", re.sub(r"/\*.*?\*/", "", body, flags=re.S)):
                    refuse(f"{who} dresses things in .{c}, which {head.split('──')[0].strip(' /*')} (the room's own section) does not style.")
    # A room that names another page names it as that page names itself, and
    # links to a page that is there: the sentence-in-another-room problem.
    for other, name in re.findall(r"\{\s*page:\s*'([a-z0-9-]+\.html)',\s*name:\s*'([^']+)'\s*\}", mod):
        if not (ROOT / other).exists():
            refuse(f"{who} has a way into {other}, which is not a page on the street.")
            continue
        t = re.search(r"<title>(.*?)</title>", (ROOT / other).read_text(), re.S)
        if not t or not html_text(t.group(1)).startswith(name):
            refuse(f"{who} calls {other} {name!r}, which is not what that page calls itself.")
    # A thing a room lifts off its page has to be on its page, or it stands in
    # the room as an empty frame and nothing anywhere says why.
    page_src = (ROOT / page).read_text()
    for sel in re.findall(r"kit\.lift\(\s*\w+\s*,\s*'([^']+)'", mod):
        want = re.findall(r"\.([\w-]+)", sel)
        if not want or not re.fullmatch(r"(\.[\w-]+)+", sel):
            refuse(f"{who} lifts {sel!r}; a room lifts by classes only (.a.b), so this tool can find them.")
            continue
        found = any(set(want) <= set(c.split()) for c in re.findall(r'class="([^"]*)"', page_src))
        if not found:
            refuse(f"{who} lifts {sel} off {page}, which has nothing wearing those classes.")
    rooms[page] = f.name

# ── The page ────────────────────────────────────────────────────────────────
page = PAGE.read_text()
if not re.search(r'<body[^>]*\bdata-familiar="walks"', page):
    refuse("paper-street.html's <body> has lost data-familiar=\"walks\", and the familiar would be put on the page twice.")
for f, why in (("love.js", "love.js's familiar()"), ("familiar.js", "familiar.js's allowed()")):
    if 'data-familiar' not in (ROOT / f).read_text():
        refuse(f"{why} no longer reads data-familiar, so a familiar would rest on the page as well as walk on it.")

sec = re.search(r"/\* §(\d+) ── ROOM: Paper Street.*?(?=/\* §\d+ )", CSS.read_text(), re.S)
if not sec:
    refuse("love.css has no section for Paper Street.")
elif re.search(r"@keyframes|animation\s*:|animation-name|transition\s*:", re.sub(r"/\*.*?\*/", "", sec.group(0), flags=re.S)):
    refuse(f"love.css §{sec.group(1)} animates something. The street stands still until you walk.")


# ── The toy theatre's front ─────────────────────────────────────────────────
# The same arithmetic paper-street.js stands the street up with: every flat
# faces you, further back the further down the road, so a translate and a
# scale say where it is. Fixed seed, so it is the same picture every build.
def arch():
    hor, cx, f, eye, road = 176, 600, 520, 150, 230

    def at(x, y, z):
        s = f / z
        return cx + x * s, hor + (eye - y) * s, s

    def quad(pts, fill):
        d = "M" + " L".join(f"{x:.1f} {y:.1f}" for x, y, _ in pts) + " Z"
        return f'<path d="{d}" fill="var({fill})"/>'

    out = ['<svg class="ps-arch" viewBox="0 0 1200 420" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">',
           f'<rect width="1200" height="{hor}" fill="var(--ps-sky)"/>',
           f'<rect y="{hor}" width="1200" height="{420 - hor}" fill="var(--ps-pave)"/>']
    rnd = random.Random(7)
    for _ in range(38):
        out.append(f'<circle cx="{rnd.uniform(90, 1110):.0f}" cy="{rnd.uniform(50, hor - 20):.0f}" '
                   f'r="{rnd.choice([1.4, 1.8, 2.4])}" fill="var(--ps-bill)"/>')
    out.append(quad([at(-road, 0, 180), at(road, 0, 180), at(road, 0, 40000), at(-road, 0, 40000)], "--ps-road"))
    for z in range(300, 8000, 260):
        out.append(quad([at(-5, 0, z), at(5, 0, z), at(5, 0, z + 110), at(-5, 0, z + 110)], "--ps-line"))
    # The flats in the street's own inks, the ones its doors are painted in.
    inks = ["--hot", "--cyan", "--yellow", "--green", "--violet", "--orange", "--pink", "--cyan"]
    flats = []
    for i in range(9):
        side = -1 if i % 2 == 0 else 1
        flats.append((520 + i * 330, side * (road + 34 + 135), inks[i % len(inks)]))
    for z, x, ink in sorted(flats, reverse=True):
        tx, ty, s = at(x - 135, 290, z)
        bx, by, _ = at(x + 135, 0, z)
        w, h, t, sw = bx - tx, by - ty, (by - ty) * 0.06, max(1.0, 3 * s)
        out.append(f'<path d="M{tx + w * .06:.1f} {by:.1f} L{tx + w * .94:.1f} {by:.1f} L{tx + w * .86:.1f} {by + t:.1f} '
                   f'L{tx + w * .14:.1f} {by + t:.1f} Z" fill="var(--ps-tab)"/>')
        out.append(f'<rect x="{tx:.1f}" y="{ty:.1f}" width="{w:.1f}" height="{h:.1f}" rx="{6 * s:.1f}" '
                   f'fill="var({ink})" stroke="#fff" stroke-width="{sw:.1f}"/>')
        out.append(f'<rect x="{tx:.1f}" y="{ty:.1f}" width="{w:.1f}" height="{h * .12:.1f}" fill="var(--ps-bill)" '
                   f'stroke="#fff" stroke-width="{sw:.1f}"/>')
        out.append(f'<rect x="{tx + w * .1:.1f}" y="{ty + h * .22:.1f}" width="{w * .62:.1f}" height="{h * .08:.1f}" '
                   f'fill="var(--ps-print)" opacity=".55"/>')
    out.append('<path fill-rule="evenodd" d="M0 0 H1200 V420 H0 Z M64 420 V120 Q64 46 150 46 H1050 Q1136 46 1136 120 V420 Z" '
               'fill="var(--ps-bill)"/>')
    out.append('<path d="M64 420 V120 Q64 46 150 46 H1050 Q1136 46 1136 120 V420" fill="none" stroke="var(--ps-print)" stroke-width="3"/>')
    scallops, x = "M150 46", 150
    while x < 1050:
        scallops += f" Q{x + 25} 86 {x + 50} 46"
        x += 50
    out.append(f'<path d="{scallops} Z" fill="var(--ps-bill)" stroke="var(--ps-print)" stroke-width="2"/>')
    out.append('<path d="M22 20 H1178" stroke="var(--ps-print)" stroke-width="2"/>')
    out.append("</svg>")
    return "".join(out)


if problems:
    for p in problems:
        print("REFUSING  " + p)
    sys.exit(1)

# The list of rooms you can walk into, into paper-street.js.
listed = "  var ROOMS = {" + ", ".join(f"'{p}': '{f}'" for p, f in rooms.items()) + "};"
js_new = re.sub(r"(  // walk:rooms:begin\n).*?(\n  // walk:rooms:end)", lambda m: m.group(1) + listed + m.group(2), js, flags=re.S)
if "// walk:rooms:begin" not in js:
    print("REFUSING  paper-street.js has no walk:rooms markers for the rooms you can walk into.")
    sys.exit(1)
if js_new != js:
    JS.write_text(js_new)
    print("paper-street.js: rooms you can walk into: " + (", ".join(rooms) or "none"))

new = re.sub(r"(<!-- ps:arch:begin -->).*?(<!-- ps:arch:end -->)",
             lambda m: m.group(1) + "\n    " + arch() + "\n    " + m.group(2), page, flags=re.S)
if new == page and "<!-- ps:arch:begin -->" not in page:
    print("REFUSING  paper-street.html has no ps:arch markers for the theatre's front.")
    sys.exit(1)
if new != page:
    PAGE.write_text(new)
    print("paper-street.html: the theatre's front drawn again.")
print("Paper Street reads the front page's doors, keeps nothing, sends nothing but a GET of your "
      "avatars on a press, and moves only when you walk.")
