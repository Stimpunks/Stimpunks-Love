#!/usr/bin/env python3
"""Build the model on map.html out of the street itself.

WHAT THE MAP IS. A model of the whole street in white card, standing on a
cutting mat: every shopfront where it stands, the rooms behind rooms, the garden
through its gate, the campgrounds past the treeline at one end and the road out
past the last streetlight at the other. Every building, tent and sign on it is a
link to the place it stands for.

NOTHING ON IT IS PLACED BY HAND, AND THAT IS THE MAINTENANCE PLAN. There are no
coordinates anywhere in this repository. The shopfronts, their order and which
side of the road they fall on come off index.html's own row of doors; the
pitches come off campgrounds.html's board and the turnings off
the-outskirts.html's signs, state and all; the garden gate stands halfway down
whatever length the street is that day, because §28 says halfway and a fixed
position would drift out of halfway the first time a room opened. The layout is
a CSS grid that flows, so a new building pushes the street longer rather than
needing somewhere to be put. The one thing the street does not show on its
front is a room behind a room, and that is the only thing data/map.json holds.

IT REFUSES RATHER THAN GUESSES, make-sitemap.py's rule in the form a map needs:

  · a page in the sitemap's walking order that has no place on the model and is
    not pinned to the mat's edge. A room cannot open unmapped.
  · a page placed twice. One place per page, because the "you are here" pin is
    the page's id and an id with two owners is a silent bug (check-ids.py).
  · a room behind a room whose parent page does not link to it. The model must
    not draw a door that is not there -- and the day somebody takes the door out
    of the parent, this stops until the model lets go of it too.
  · an entry in data/map.json naming a page that is not in the walking order.
    A stale entry is a claim about a room that has gone.

IT NEEDS NOTHING BUT THE FILES, so it is in the pre-deploy sequence and runs on
a train. Run it after anything that adds a shopfront, a pitch, a turning or a
room behind a room; if you forget, make-map.py is the thing that will not let
the deploy pretend otherwise.
"""
import ast
import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGE = ROOT / "map.html"
BEGIN, END = "<!-- map:begin -->", "<!-- map:end -->"
HERE = "map.html"
NO_ADDRESS = {"404.html"}


def walking_order():
    """The sitemap's ORDER, read as a literal rather than imported, because
    importing make-sitemap.py would run it."""
    src = (ROOT / "tools/make-sitemap.py").read_text()
    for node in ast.parse(src).body:
        if isinstance(node, ast.Assign) and any(getattr(t, "id", "") == "ORDER" for t in node.targets):
            return ast.literal_eval(node.value)
    raise SystemExit("REFUSING: make-sitemap.py has no ORDER, so there is no walking order to map.")


def plain(s):
    return html.unescape(re.sub(r"<[^>]+>", "", s)).strip()


def title(page):
    src = (ROOT / page).read_text()
    m = re.search(r"<title>(.*?)</title>", src, re.S)
    if not m:
        raise SystemExit(f"REFUSING: {page} has no <title>, and the model letters every place with its own name.")
    t = plain(m.group(1))
    return re.sub(r"\s*[—–-]\s*Stimpunks\.World$", "", t).strip() or t


def slug(page):
    return page[:-5]


# ── Reading the street ───────────────────────────────────────────────────────

def doors():
    src = (ROOT / "index.html").read_text()
    row = re.search(r'<ul class="doors">(.*?)</ul>', src, re.S)
    if not row:
        raise SystemExit("REFUSING: index.html has no row of doors, and the street on the model is that row.")
    found = re.findall(r'<a class="door door--[^"]+" href="([^"]+)"', row.group(1))
    if not found:
        raise SystemExit("REFUSING: index.html's row of doors is empty.")
    return found


def furniture():
    """The things on the front page that are not doors, found by what they are
    rather than where they sit, so moving one on the page does not lose it."""
    src = (ROOT / "index.html").read_text()
    out = {}
    for cls in ("noticeboard", "postercol", "gardengate", "signpost", "roadout"):
        m = re.search(rf'<a class="{cls}" href="([^"]+)"', src)
        if not m:
            raise SystemExit(f"REFUSING: index.html has lost its {cls}, and the model stands one where it goes.")
        out[cls] = m.group(1)
    return out


def signs(page, kind):
    """Pitches off the campground's board, turnings off the road's signs: the
    number on the sign, the name on it, where it goes, and its state."""
    src = (ROOT / page).read_text()
    items = []
    for m in re.finditer(rf'<li class="({kind}(?: {kind}--[a-z]+)*)">(.*?)</li>', src, re.S):
        classes, body = m.group(1), m.group(2)
        state = (re.findall(rf"{kind}--([a-z]+)", classes) or [""])[0]
        no = re.search(rf'<span class="{kind}__no">(.*?)</span>', body, re.S)
        h3 = re.search(r"<h3>(.*?)</h3>", body, re.S)
        if not (no and h3):
            raise SystemExit(f"REFUSING: a {kind} on {page} has no number or no name on its sign.")
        link = re.search(r'href="([^"#]+\.html)"', h3.group(1))
        items.append({"no": plain(no.group(1)), "name": plain(h3.group(1)),
                      "href": link.group(1) if link else None, "state": state})
    if not items:
        raise SystemExit(f"REFUSING: found no {kind} on {page}. The sign markup has changed; teach this to read it.")
    return items


# ── Checking ─────────────────────────────────────────────────────────────────

data = json.loads((ROOT / "data/map.json").read_text())
behind, stairs = data["behind"], data.get("back_stairs", {})
names, pinned = data.get("names", {}), data["pinned"]
order = walking_order()
street = doors()
furn = furniture()
pitches = signs("campgrounds.html", "pitch")
turnings = signs("the-outskirts.html", "turning")

problems = []
placed = {}


def place(page, where):
    if page in placed:
        problems.append(f"{page} is placed twice: {placed[page]} and {where}.")
    placed[page] = where


place("index.html", "the stoop")
place(HERE, "the table by the stoop")
# The page about the street's name is the street: it is lettered along the road.
place("danny-the-street.html", "the road itself")
for d in street:
    place(d, "a shopfront")
for cls, page in furn.items():
    place(page, cls)
for p in pitches:
    if p["href"]:
        place(p["href"], p["no"])
for t in turnings:
    if t["href"]:
        place(t["href"], t["no"])
for page, parent in behind.items():
    place(page, f"behind {parent}")
    if parent not in placed and parent not in behind:
        problems.append(f"{page} is behind {parent}, which is not on the model.")
    elif f'href="{page}' not in (ROOT / parent).read_text():
        problems.append(f"{page} is drawn behind {parent}, and {parent} has no link to it. "
                        "The model must not draw a door that is not there.")
for page in pinned:
    place(page, "pinned to the mat")
for page, via in stairs.items():
    if page not in placed or via not in placed:
        problems.append(f"the back stair from {via} to {page} joins something that is not on the model.")
    elif f'href="{page}' not in (ROOT / via).read_text():
        problems.append(f"{via} is drawn with a back stair to {page} and has no link to it.")

for page in list(behind) + list(behind.values()) + list(stairs) + list(stairs.values()) + pinned + list(names):
    if page not in order:
        problems.append(f"data/map.json names {page}, which is not in the sitemap's walking order.")

unmapped = [p for p in order if p not in placed and p not in NO_ADDRESS]
if unmapped:
    problems.append("these pages have no place on the model: " + ", ".join(unmapped) +
                    ".\n    A shopfront goes on index.html's row of doors, a pitch on the campground's board,\n"
                    "    a turning on the road's signs, and a room behind a room into data/map.json.")
off = [p for p in placed if p not in order]
if off:
    problems.append("placed on the model but not in the sitemap's walking order: " + ", ".join(off))

if problems:
    raise SystemExit("REFUSING:\n  " + "\n  ".join(problems))


# ── Drawing ──────────────────────────────────────────────────────────────────

def name(page):
    return html.escape(names.get(page) or title(page), quote=False)


def link(page, cls, label=None, extra=""):
    text = html.escape(label, quote=False) if label else name(page)
    return (f'<a class="{cls}" href="{page}" id="at-{slug(page)}">'
            f'<span class="mm-name">{text}</span>{extra}</a>')


children = {}
for page, parent in behind.items():
    children.setdefault(parent, []).append(page)
back_stair_from = {via: page for page, via in stairs.items()}


def behind_lot(page):
    """A room behind a room, and whatever is behind that in turn. The Community
    Library's L-Space has Oook behind it, so a room two doors deep hangs under
    the one you walk through to reach it rather than beside the shopfront, which
    would draw a door into the library that is not there."""
    out = [link(page, "mm-back")]
    kids = children.get(page, [])
    if kids:
        out.append(f'<span class="sr">, and behind {name(page)}:</span>')
        out.append('<ul class="mm-behind">')
        for k in kids:
            out.append(f"<li>{behind_lot(k)}</li>")
        out.append("</ul>")
    return "".join(out)


def lot(page, side):
    out = [f'<li class="mm-lot mm-lot--{side}">', link(page, "mm-shop")]
    kids = children.get(page, [])
    if kids:
        out.append(f'<span class="sr">, and behind {name(page)}:</span>')
        out.append('<ul class="mm-behind">')
        for k in kids:
            out.append(f"<li>{behind_lot(k)}</li>")
        out.append("</ul>")
    if page in back_stair_from:
        to = back_stair_from[page]
        out.append(f'<p class="mm-stair">a back stair up to <a href="{to}">{name(to)}</a>, '
                   f"which also has its own front door</p>")
    out.append("</li>")
    return "".join(out)


def gate_lot(side):
    g = furn["gardengate"]
    return (f'<li class="mm-lot mm-lot--{side} mm-lot--gate">'
            f'<a class="mm-gate" href="{g}" id="at-{slug(g)}"><span class="mm-name">{name(g)}</span>'
            f'<span class="mm-note">through the gate in the wall, halfway down</span></a></li>')


rows = []
# The top of the street, at the treeline end: the stoop, which is the front
# door, and across the pavement from it the table this model stands on, with
# the pebble board beside it and the poster column beside that.
rows.append(f'<li class="mm-lot mm-lot--w mm-lot--stoop">'
            f'<a class="mm-shop mm-shop--stoop" href="index.html" id="at-index">'
            f'<span class="mm-name">The Stoop</span><span class="mm-note">the front door</span></a></li>')
rows.append(f'<li class="mm-lot mm-lot--e mm-lot--furniture">'
            f'<span class="mm-table" id="at-map" aria-current="page">'
            f'<span class="mm-name">The Map</span><span class="mm-note">this table</span></span>'
            f'{link(furn["noticeboard"], "mm-notice")}'
            f'{link(furn["postercol"], "mm-poster")}</li>')
half = (len(street) + 1) // 2
side = "w"
for i, d in enumerate(street):
    if i == half:
        rows.append(gate_lot(side))
        side = "e" if side == "w" else "w"
    rows.append(lot(d, side))
    side = "e" if side == "w" else "w"


def numbered(text):
    return f'<span class="mm-no">{text}</span>'


def pitch(p):
    no = html.escape(p["no"].title(), quote=False)
    if p["href"]:
        return f'<li class="mm-pitch">{link(p["href"], "mm-tent", p["name"], numbered(no))}</li>'
    state = "open" if p["state"] == "open" else "spoken for"
    return (f'<li class="mm-pitch mm-pitch--{p["state"] or "empty"}"><span class="mm-plot">'
            f'<span class="mm-name">{html.escape(p["name"], quote=False)}</span>'
            f'<span class="mm-no">{no} &middot; {state}</span></span></li>')


def turning(t, side):
    no = html.escape(t["no"].title(), quote=False)
    if t["href"] and t["state"] != "dark":
        return (f'<li class="mm-turn mm-turn--{side}">'
                f'{link(t["href"], "mm-sign", t["name"], numbered(no))}</li>')
    if t["href"]:
        return (f'<li class="mm-turn mm-turn--{side} mm-turn--dark">'
                f'{link(t["href"], "mm-sign", t["name"], numbered(no + " &middot; lit, nothing behind it yet"))}</li>')
    return (f'<li class="mm-turn mm-turn--{side} mm-turn--dark"><span class="mm-sign">'
            f'<span class="mm-name">{html.escape(t["name"], quote=False)}</span>'
            f'<span class="mm-no">{no} &middot; a sign with no road behind it yet</span></span></li>')


camp, road = furn["signpost"], furn["roadout"]
trees = "".join(
    f'<circle cx="{x}" cy="{20 + (i % 3) * 5}" r="{11 + (i * 7) % 6}"/>'
    for i, x in enumerate(range(14, 1000, 31)))
treeline = (f'<svg class="mm-trees" viewBox="0 0 1000 44" preserveAspectRatio="none" aria-hidden="true" '
            f'focusable="false"><g class="mm-trees__sticks">'
            + "".join(f'<path d="M{x} 30 V44"/>' for x in range(14, 1000, 31))
            + f'</g><g class="mm-trees__tops">{trees}</g></svg>')

block = "\n".join([
    '<div class="mm-model">',
    '  <section class="mm-field" aria-labelledby="at-campgrounds">',
    f'    <h3 class="mm-edge">{link(camp, "mm-edge__name")}'
    f'<span class="mm-edge__where">past the treeline, off the board</span></h3>',
    '    <ul class="mm-pitches">',
    *[f"      {pitch(p)}" for p in pitches],
    "    </ul>",
    f"    {treeline}",
    "  </section>",
    '  <section class="mm-board" aria-labelledby="at-danny-the-street">',
    f'    <h3 class="mm-roadname">{link("danny-the-street.html", "mm-roadname__a", "Danny the Street")}'
    f'<span class="mm-roadname__what">the street itself</span></h3>',
    '    <ol class="mm-lots">',
    *[f"      {r}" for r in rows],
    "    </ol>",
    '    <p class="mm-lamp" aria-hidden="true"></p>',
    "  </section>",
    '  <section class="mm-road" aria-labelledby="at-the-outskirts">',
    f'    <h3 class="mm-edge mm-edge--road">{link(road, "mm-edge__name")}'
    f'<span class="mm-edge__where">past the last streetlight, off the board</span></h3>',
    '    <ol class="mm-turnings">',
    *[f"      {turning(t, 'w' if i % 2 == 0 else 'e')}" for i, t in enumerate(turnings)],
    "    </ol>",
    "  </section>",
    '  <aside class="mm-tags" aria-labelledby="mm-tags-h">',
    '    <h3 id="mm-tags-h">Pinned to the edge of the mat</h3>',
    '    <ul>',
    *[f'      <li>{link(p, "mm-tag")}</li>' for p in pinned],
    "    </ul>",
    "  </aside>",
    "</div>",
])

src = PAGE.read_text()
if BEGIN not in src or END not in src:
    raise SystemExit("REFUSING: map.html has no map markers, so there is nowhere to build the model.\n"
                     "Put them back rather than letting this tool go quiet.")
PAGE.write_text(re.sub(re.escape(BEGIN) + r".*?" + re.escape(END),
                       lambda _: BEGIN + "\n" + block + "\n" + END, src, count=1, flags=re.S))
print("map: every page in the walking order is on the model or pinned to the mat's edge")
