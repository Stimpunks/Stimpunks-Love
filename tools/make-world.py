#!/usr/bin/env python3
"""Write the World room's directory of every room, and hold the room to what it
and privacy.html say.

Ryan's brief, 2026-10-18: a World index, a list of every room, saying which
have people in them and active calls, filtered by active or not, sorted by
latest activity and by most active; in a World room whose own chat and call are
the CB's World channel and the World call. Ryan's calls the same day: most
active is in (the one place the street counts people, and the numbers never
leave the server), the World room is world.html, past the Garden, and its look
is knowledge gardens and our garden spider: webs connecting gardens around the
world.

WHAT IT WRITES: the web across the top, between the world:web markers, drawn
here from a fixed seed so it is the same picture every build and the share card
can lift it; and the gardens below it, between the world:directory markers,
from the street's own lists and nobody's typing:
  · which rooms, their names and their order are cb-rooms.json's, which
    make-sitemap.py writes from every page's own title in walking order, so a
    room that keeps to itself is never in it;
  · each room's line is that page's own og:description;
  · the categories are the Map's: whichever part of the model (map.html) a page
    stands on, so a new area is a new category the day the Map has it, and a
    part of the Map this does not know stops the build until it is taught.
It runs after make-sitemap.py and make-map.py, whose output it reads.

WHAT IT REFUSES:
  · A NUMBER IN THE ROOM. Nothing on the page or in world.js says how many
    rooms there are, how many people are in one, or how busy it is: most active
    is an ORDER, and the server sends the order and never the counts. The
    friendly edits are a number of people beside a room, a number of rooms
    active, and a visitor counter.
  · A VISITOR COUNTER, BLINK OR A MARQUEE: the street refuses counting
    visitors and anything that flashes or scrolls by itself.
  · world.js storing anything but the reader's own filter and sort, or talking
    to anything but /cb/world and /cb-rooms.json, or writing love-cb.
  · NAMES IN A CALL. The index says a call is going and never who is in it,
    which is shown only in its room, to radios seen there.
  · the page without data-world or its link to privacy.html#world, and the
    Garden without its door to it, past the spider.

IF THIS REFUSES: fix the cause. Do not widen a list to make it quiet.
"""
import html
import json
import math
import random
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGE = ROOT / "world.html"
JS = ROOT / "world.js"
ROOMS = ROOT / "cb-rooms.json"
MAP = ROOT / "map.html"
GARDEN = ROOT / "the-garden.html"
PRIVACY = ROOT / "privacy.html"
FN = ROOT / "netlify" / "functions" / "cb-world.mjs"
LIB = ROOT / "netlify" / "cb" / "lib.mjs"
BEGIN, END = "<!-- world:directory:begin -->", "<!-- world:directory:end -->"
WEB_BEGIN, WEB_END = "<!-- world:web:begin -->", "<!-- world:web:end -->"

# The Map's parts, in the order the directory lists them: the street first,
# then out along each edge, then under it, then the paperwork pinned to the mat.
PARTS = [
    ("mm-board", "street", "On the street, and behind its doors"),
    ("mm-field", "campgrounds", "Past the treeline: the campgrounds"),
    ("mm-land", "land", "Through the wood: Nature’s Contribution"),
    ("mm-road", "outskirts", "Past the last streetlight: the Outskirts"),
    ("mm-under", "caverns", "Down the lift: Arlesglad Caverns"),
    ("mm-tags", "paperwork", "Paperwork, pinned to the edge of the Map"),
]

problems = []


def plain(s):
    return html.unescape(re.sub(r"<[^>]+>", "", s or "")).strip()


def code_of(path):
    c = re.sub(r"/\*.*?\*/", " ", path.read_text(), flags=re.S)
    return re.sub(r"(?m)^\s*//[^\n]*", " ", c)


def page_of(path):
    return "index.html" if path == "/" else path.lstrip("/")


def parts_of_map():
    """Which part of the Map each page stands on, read off map.html."""
    src = MAP.read_text()
    starts = [(m.start(), m.group(1)) for m in re.finditer(r'<(?:section|aside) class="(mm-[a-z]+)"', src)]
    where = {}
    for i, (at, cls) in enumerate(starts):
        chunk = src[at: starts[i + 1][0] if i + 1 < len(starts) else len(src)]
        if cls in ("mm-how", "mm-why"):
            continue
        if cls not in [p[0] for p in PARTS]:
            problems.append(f"{MAP.name}: a part of the Map called {cls} that this tool does not know. Teach PARTS where it goes.")
            continue
        for href in re.findall(r'href="([a-z0-9-]+\.html)(?:#[^"]*)?"', chunk):
            where.setdefault(href, cls)
    return where


def about_of(page):
    p = ROOT / page
    if not p.exists():
        return ""
    m = re.search(r'<meta property="og:description" content="([^"]*)"', p.read_text())
    return html.unescape(m.group(1)).strip() if m else ""


def directory():
    rooms = json.loads(ROOMS.read_text())["rooms"]
    where = parts_of_map()
    behind = json.loads((ROOT / "data" / "map.json").read_text()).get("behind", {})
    groups = {cls: [] for cls, _, _ in PARTS}
    for i, r in enumerate(rooms):
        page = page_of(r["path"])
        cls = where.get(page)
        # A room behind a room the Map does not draw (behind a pitch, behind a
        # turning) stands on its parent's part, by data/map.json's own record.
        seen = set()
        up = page
        while not cls and up in behind and up not in seen:
            seen.add(up)
            up = behind[up]
            cls = where.get(up)
        if page in ("index.html", "map.html"):
            cls = "mm-board"
        if not cls:
            problems.append(f"{page}: it is on the street's list and stands on no part of the Map, so the World room "
                            "cannot say where it is. Put it on the Map.")
            continue
        groups[cls].append((i, r, page))
    out = ['<div class="www-dir" data-world-dir>']
    for cls, key, title in PARTS:
        rows = groups[cls]
        if not rows:
            continue
        out.append(f'  <section class="www-cat" aria-labelledby="www-cat-{key}">')
        out.append(f'    <h2 class="www-cat__h" id="www-cat-{key}">{html.escape(title, quote=False)}</h2>')
        out.append('    <ul class="www-list">')
        for i, r, page in rows:
            about = about_of(page)
            line = f'<span class="www-room__about"> &ndash; {html.escape(about, quote=False)}</span>' if about else ""
            out.append(f'      <li class="www-room" data-room="{html.escape(r["tag"])}" data-order="{i}">'
                       f'<a class="www-room__name" href="{html.escape(page)}">{html.escape(r["name"], quote=False)}</a>{line}'
                       f'<span class="www-room__live" data-live hidden></span></li>')
        out.append("    </ul>")
        out.append("  </section>")
    out.append("</div>")
    return "\n".join(out)


def f1(v):
    return f"{v:.1f}".rstrip("0").rstrip(".")


def web():
    """The garden spider's web, strung between gardens, at the moment the dawn
    reaches it from the left: every thread on that side lit along its length,
    the rest not yet. A fixed seed, so it is the same web every build."""
    rnd = random.Random(1018)
    W, H, cx, cy = 1000, 380, 500, 196
    n = 19
    ang = [i * 2 * math.pi / n + rnd.uniform(-0.09, 0.09) for i in range(n)]
    reach = [rnd.uniform(0.84, 0.99) for _ in range(n)]
    anchors = [(cx + 470 * r * math.cos(a), cy + 172 * r * math.sin(a)) for a, r in zip(ang, reach)]
    lit = lambda x: x < 440
    ink = lambda x: "var(--www-glint)" if lit(x) else "var(--www-thread)"
    out = [f'<svg viewBox="0 0 {W} {H}" focusable="false" fill="none" stroke-linecap="round">']
    # The frame, anchor to anchor, and the radials from the hub.
    for i in range(n):
        (x1, y1), (x2, y2) = anchors[i], anchors[(i + 1) % n]
        out.append(f'<path d="M{f1(x1)} {f1(y1)} L{f1(x2)} {f1(y2)}" stroke="{ink((x1 + x2) / 2)}" stroke-width="1.2"/>')
    for x, y in anchors:
        out.append(f'<path d="M{cx} {cy} L{f1(x)} {f1(y)}" stroke="{ink((cx + x) / 2)}" stroke-width="1.3"/>')
    # The spiral, as an orb weaver lays it: straight from radial to radial.
    beads = []
    for k in range(11):
        fr = 0.11 + 0.077 * k
        pts = []
        for (x, y) in anchors:
            j = fr + rnd.uniform(-0.012, 0.012)
            pts.append((cx + (x - cx) * j, cy + (y - cy) * j))
        for i in range(n):
            (x1, y1), (x2, y2) = pts[i], pts[(i + 1) % n]
            mx = (x1 + x2) / 2
            out.append(f'<path d="M{f1(x1)} {f1(y1)} L{f1(x2)} {f1(y2)}" stroke="{ink(mx)}" stroke-width="0.9"/>')
            if lit(mx) and rnd.random() < 0.3:
                beads.append((mx, (y1 + y2) / 2))
    for x, y in beads:
        out.append(f'<circle cx="{f1(x)}" cy="{f1(y)}" r="2.2" fill="var(--www-bead)" stroke="none"/>')
    # A garden at every anchor: leaves and a flower, the web's other end.
    for x, y in anchors:
        for dx, dy, r in ((-7, 3, 7.5), (7, 2, 6.5), (0, -5, 7)):
            out.append(f'<circle cx="{f1(x + dx)}" cy="{f1(y + dy)}" r="{r}" fill="var(--www-moss)" stroke="none"/>')
        out.append(f'<circle cx="{f1(x)}" cy="{f1(y - 1)}" r="2.6" fill="var(--www-leaf)" stroke="none"/>')
    # The spider at the hub, the Garden's, in this room's inks: the cross on
    # its back is the garden spider's own.
    legs = [(-1, -0.55), (-1, -0.15), (-1, 0.25), (-1, 0.65)]
    for side in (-1, 1):
        for sx, sy in legs:
            kx, ky = cx + side * 15, cy + 2 + sy * 18
            fx, fy = cx + side * 31, cy + 4 + sy * 40
            out.append(f'<path d="M{cx + side * 4} {cy} L{f1(kx)} {f1(ky - 8)} L{f1(fx)} {f1(fy)}" stroke="var(--www-silk)" stroke-width="2"/>')
    out.append(f'<ellipse cx="{cx}" cy="{cy + 12}" rx="11" ry="13" fill="var(--www-body)" stroke="var(--www-silk)" stroke-width="1.6"/>')
    out.append(f'<path d="M{cx} {cy + 4} V{cy + 21} M{cx - 6} {cy + 10} H{cx + 6}" stroke="var(--www-dawn)" stroke-width="1.8"/>')
    out.append(f'<circle cx="{cx}" cy="{cy - 6}" r="6" fill="var(--www-body)" stroke="var(--www-silk)" stroke-width="1.6"/>')
    out.append("</svg>")
    return "".join(out)


def check():
    page = PAGE.read_text()
    body = re.search(r"<body[^>]*>", page)
    if not body or "data-world" not in body.group(0) or 'class="room-world"' not in body.group(0):
        problems.append(f"{PAGE.name}: its <body> must be class=\"room-world\" and say data-world.")
    if 'href="privacy.html#world"' not in page:
        problems.append(f"{PAGE.name}: the room must link what it shows, privacy.html#world.")
    if 'id="world"' not in PRIVACY.read_text():
        problems.append(f"{PRIVACY.name}: no section with id=\"world\".")
    if 'href="world.html"' not in GARDEN.read_text():
        problems.append(f"{GARDEN.name}: the World room is past the Garden's spider, and the Garden has no door to it.")
    words = plain(re.sub(r"<script.*?</script>|<style.*?</style>", " ", page, flags=re.S))
    for m in re.finditer(r"\b\d+\s+(?:rooms?|people|visitors?|hits?|users?|active)\b", words, re.I):
        problems.append(f"{PAGE.name}: {m.group(0)!r}. Nothing in the World room says how many.")
    low = page.lower()
    for bad, why in (("<blink", "blink"), ("<marquee", "a marquee"), ("hit counter", "a visitor counter"), ("visitor counter", "a visitor counter")):
        if bad in low:
            problems.append(f"{PAGE.name}: {why}. The street counts no visitors, and nothing flashes or scrolls by itself.")
    if not JS.exists():
        problems.append(f"{JS.name}: missing.")
        return
    js = code_of(JS)
    for bad in ("innerHTML", "outerHTML", "insertAdjacentHTML", "document.write"):
        if bad in js:
            problems.append(f"{JS.name}: {bad}. Everything it shows is built with textContent.")
    for url in set(re.findall(r"""['"](/[a-z][^'"?#]*)""", js)):
        if url not in ("/cb/world", "/cb-rooms.json"):
            problems.append(f"{JS.name}: it calls {url}. It asks /cb/world and reads the list of rooms, and nothing else.")
    for key in set(re.findall(r"localStorage\.(?:setItem|removeItem)\(\s*([^,)]+)", js)):
        if key.strip() not in ("KEEP",):
            problems.append(f"{JS.name}: it writes {key.strip()} into the browser. It keeps the reader's own filter and sort, and reads love-cb.")
    if "var KEEP = 'love-world';" not in js:
        problems.append(f"{JS.name}: its one key in the browser is love-world.")
    if "sessionStorage" in js or "indexedDB" in js:
        problems.append(f"{JS.name}: it stores something outside love-world.")
    for m in re.finditer(r"""\.length\s*\+\s*['"]|\+\s*['"]\s*(?:rooms?|people|of|here|active)\b""", js):
        problems.append(f"{JS.name}: {m.group(0)!r} looks like a number put beside something. Nothing here is counted.")
    if "busiest" not in js:
        problems.append(f"{JS.name}: Most active must sort by the server's order, busiest, and nothing else.")
    lib = LIB.read_text()
    m = re.search(r"export async function worldIndex\(.*?\n\}", lib, re.S)
    body = m.group(0) if m else ""
    if not body:
        problems.append(f"{LIB.name}: worldIndex is missing.")
    else:
        ret = body[body.rfind("return {"):]
        if re.search(r"\b(?:n|count|total|busy)\s*:", ret):
            problems.append(f"{LIB.name}: worldIndex sends a count. It sends the order (busiest) and never the numbers.")
        if "quietRoom(tag)" not in body or "roomAllows(who, tag)" not in body:
            problems.append(f"{LIB.name}: worldIndex no longer leaves out quiet rooms and rooms the asker may not enter.")
        if re.search(r"call\s*:\s*\[|names\s*:", ret):
            problems.append(f"{LIB.name}: worldIndex names who is in a call. It says a call is on, never who.")
    if "path: '/cb/world'" not in FN.read_text():
        problems.append(f"{FN.name}: it no longer answers at /cb/world.")
    if "sweep" in code_of(FN).lower() or "setJSON" in code_of(FN):
        problems.append(f"{FN.name}: it writes something. The index is worked out each time and kept nowhere.")


def main():
    block = directory()
    src = PAGE.read_text()
    if src.count(BEGIN) != 1 or src.count(END) != 1 or src.count(WEB_BEGIN) != 1 or src.count(WEB_END) != 1:
        problems.append(f"{PAGE.name}: the world:directory and world:web markers must each be there exactly once.")
    elif not problems:
        new = re.sub(re.escape(BEGIN) + r".*?" + re.escape(END), lambda _: BEGIN + "\n" + block + "\n" + END, src, count=1, flags=re.S)
        new = re.sub(re.escape(WEB_BEGIN) + r".*?" + re.escape(WEB_END), lambda _: WEB_BEGIN + web() + WEB_END, new, count=1, flags=re.S)
        if new != src:
            PAGE.write_text(new)
    check()
    if problems:
        print("REFUSING:\n  " + "\n  ".join(problems))
        return 1
    print("the World room: the web drawn, every room on the street's list in a garden on it, in the Map's parts and walking order; "
          "nothing counted on the page, no call's names, and most active sent as an order.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
