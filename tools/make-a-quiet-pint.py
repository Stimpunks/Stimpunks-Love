#!/usr/bin/env python3
"""Build A Quiet Pint, the pub under the street, out of data/a-quiet-pint.json:
the room from a seat at the south end, the plan by the door and its tables in
words, the view down at your table, the columns, the board, the quotations the
room owes, the Third Places lines it stands on, and its credits in the liner
notes.

WHAT THE ROOM IS. Ryan Boren's brief, 2026-10-05: a new room on the street, A
Quiet Pint, made like McAnally's Pub in homage to Jim Butcher's Dresden Files,
with the passages from the books that describe it. McAnally's is a pub built
round the people who drink in it: the books' wizards break machines by being
in the room, so there is no television, no games machine and no jukebox, only a
player piano, and the room itself is arranged, thirteen of everything and no two
alike, to take the edge off what they bring in. That is a pub made to fit its
patrons rather than patrons made to fit a pub, which is the argument this site
makes about everything, and our own Third Places page says the same thing about
radical third places in other words. So the room keeps the architecture, and
says out loud the three places it parts from the book, because each is an
access barrier in a room that is otherwise built for the people in it.

THE THIRTEENS ARE JIM BUTCHER'S, AND THIS TOOL COUNTS THEM. Stools, tables,
windows, mirrors, columns and ceiling fans, thirteen of each, from the books.
check-counts.py refuses a total that grows; this is the other kind of number,
a count that belongs to somebody else, which Swaying Sweetgrass protects for its
bundles. It is not a count of rooms and nothing here counts anybody.

A STUDY IN DELIBERATE ASYMMETRY, WHICH IS A CHECK. No two tables are the same
shape, size and height, and no two share a height; no two columns are the same
thickness; no two windows the same width, no two mirrors the same size, no two
fans the same span; no two gaps between stools, windows or beams the same; and
no two of anything stand in a row. The friendly edit is to tidy it, and every
one of those refusals is the tidying.

AND ASYMMETRY IS NOT OBSTRUCTION, WHICH IS THE OTHER CHECK. The books' columns
make it hard to walk round the room without weaving. This room keeps them where
they stand and walks the plan on a four-inch grid from the door: every table has
a way to it at least 36 inches wide (2010 ADA Standards 403.5.1); the tables at
dining height with room for knees under them are 28 to 34 inches high with 27
under (902.3, 306.3); the bar dips to 34 inches for more than 36 of its length
with nothing standing in front of it (904.4.1); the beams, the lowest thing over
the floor, are at least 80 inches up (307.4) and the fans turn in the bays
between them, above that line; the steps and the ramp outside the door are to
504.2 and 405, and the ramp is as wide as the steps. Every number was read on
the Access Board's page on 2026-10-05.

THE LIGHT IS THE STREET'S, PASSED ROUND BY THE MIRRORS. Every mirror says where
its light lands, on a table or on the floor, and the patch is drawn from the
mirror's own size, so no two patches are alike. Nothing in the room is lit warm:
the stove is shut and nobody lights a lamp, and Brew and Stew's list of flames
is refused in the room's voice. See §100 for the collisions.

THE PEOPLE WHO DO NOT DRINK. Every pint comes two ways, alcohol-free first, and
both pours are drawn from one drawing, so they are the same glass at the same
size and nobody can tell from across the room which one anybody has: this tool
refuses a pint whose two pours look different. Big Steep Fermentables' words for
pressure and for health claims are read out of make-big-steep.py's own source
(it runs as a script, so it is parsed rather than imported) and refused in the
room's voice. Nothing on the board has a price, and nobody has to order
anything to sit down, which is our Third Places page's own line.

THE KITCHENS' ENGINES. Hey, Good Cookin's allergens and dish checks, and Pekoe
and Purrs' and the Truck Stop's caffeine, are imported, never restated.

THE PLAYER PIANO PLAYS ROLLS, AND A ROLL IS A STRIP, NOT A SCREEN. Ryan,
2026-10-06: rolls on the piano. Each is a recording of a real piano roll on its
own page on Wikimedia Commons, public domain there, streamed as the MP3 Commons
makes of it through love-embed.js's audio builder, so nothing musical is hosted
here and nothing is fetched until somebody presses a roll. This tool reads
AUDIO_ORIGINS out of love-embed.js and refuses a roll from anywhere else, a roll
with no runtime, a roll that does not name its composers with their years, and a
composer who died seventy years ago or less, counted against this year: the
music has to be public domain everywhere, the Doomscroll's bar, not only in the
United States. Notation software playing sheet music is not a roll; the data
file says which files were left off for that. What the pub still refuses is a
screen: a frame, a video, a YouTube facade, a rack.

BUTCHER'S WORDS ARE QUOTED, NEVER RETOLD. Every quotation names its book, its
year and its pages and links the book's Open Library record; a quotation is held
to the cap in the data file and all of them together to a total, the Zibaldone's
drift guard. Outside the section that quotes him and the credits, nothing of his
invented world is in the room's voice: no wizards drink here and nothing is
magic, Sithen's rule about living authors' worlds, arriving in a room that is an
homage on purpose.

IF THIS REFUSES: fix the cause. Do not widen a list to make it quiet.
"""
import ast
import html
import importlib.util
import json
import math
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TOOLS = ROOT / "tools"
DATA = ROOT / "data/a-quiet-pint.json"
PAGE = ROOT / "a-quiet-pint.html"
NOTES = ROOT / "liner-notes.html"
CSS = ROOT / "love.css"
TABLE = ROOT / "table.js"
SCRIPT = ROOT / "pint.js"
STREET = ROOT / "index.html"
EMBED = ROOT / "love-embed.js"
MIRROR = Path.home() / "Documents/Claude/Projects/Stimpunks Knowledge System/site/stimpunks.org"
SECTION = 100         # love.css's section for this room
THIRTEEN = 13         # Jim Butcher's, from the books

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
tks = tool("make-truckin-food-court")
bns = tool("make-brew-and-stew")


def steep(name):
    """A constant out of make-big-steep.py, which runs as a script and so cannot
    be imported: parse the file and read the one assignment, never restate it."""
    for node in ast.parse((TOOLS / "make-big-steep.py").read_text()).body:
        if isinstance(node, ast.Assign) and any(getattr(t, "id", None) == name for t in node.targets):
            return ast.literal_eval(node.value)
    raise SystemExit(f"REFUSING: make-big-steep.py no longer has {name}, which this room reads.")


def esc(s):
    return html.escape(str(s), quote=False)


def attr(s):
    return html.escape(str(s), quote=True)


def n(v):
    v = round(float(v), 1)
    return str(int(v)) if v == int(v) else str(v)


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


WORDS = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
         "eleven", "twelve", "thirteen"]


def listify(xs):
    xs = list(xs)
    return xs[0] if len(xs) == 1 else ", ".join(xs[:-1]) + " and " + xs[-1]


# ── The voice ────────────────────────────────────────────────────────────────

NEGATION = hgc.NEGATION
PRESSURE = steep("PRESSURE")
HEALTH = steep("HEALTH")
TALLY = steep("TALLY") + "|" + hgc.TALLY
SCREEN = (r"televisions?|telly|tellies|tvs?|screens?|jukebox(?:es)?|games? machines?|fruit machines?|"
          r"quiz machines?|trivia machines?|video games?|pinball|slot machines?|karaoke|big screen")
WORLD = (r"wizards?|wizardry|magic\w*|spells?|unseelie|seelie|accords?|white council|faeries?|"
         r"vampires?|warlocks?|beeromancer|dresden(?!\s+files)|harry|practitioners?")
VOCAB = [
    (PRESSURE, "pressure to drink, or calling a drink without alcohol an imitation: Big Steep's refusal."),
    (HEALTH, "a health claim. A pint here is a pint."),
    (TALLY, "a count of pints, rounds or people. Nobody is counted in here."),
    (SCREEN, "a screen. Nothing behind the bar has one, which is the room's homage: no television, no games "
             "machine, no jukebox."),
    (bns.FLAME, "a flame or a lamp, which this room has none of. The light is the street's, passed round "
                "by the mirrors; a lamp makes it The Den."),
    (bns.SOLD, "a price. Nothing on the board has one, and nobody has to order anything to sit down."),
    (hgc.DIET, "a verdict on food or on a body, Hey, Good Cookin's refusal."),
    (hgc.PICKY, "sorting eaters. Nobody here is picky."),
]


def sweep(text, where, vocab=VOCAB):
    text = html.unescape(re.sub(r"<[^>]+>", " ", str(text)))
    # THE NEGATION HAS TO BE ABOUT THIS WORD. The window ends where the match
    # does, and the search is anchored there: without the anchor, "nobody lights
    # a lamp." would excuse "A lamp is lit on every table." in the next sentence,
    # because both are inside eighty characters. Found by breaking this on
    # purpose, 2026-10-05; the other rooms' sweeps are written the old way.
    for pat, why in vocab:
        for m in re.finditer(rf"(?<!\w)(?:{pat})(?!\w)", text, re.I):
            window = text[max(0, m.start() - 80):m.end()]
            if re.search(rf"\b{NEGATION}\b[^.]{{0,70}}?(?<!\w)(?:{pat})(?!\w)$", window, re.I):
                continue
            refuse(f"{where}: {m.group(0)!r} -- {why}")


# ── Geometry, in inches ──────────────────────────────────────────────────────

SEAT = 22          # a chair and the person in it, beyond a table's edge
STOOL_ZONE = 30    # a stool and the person on it, beyond the bar's front
CLEAR = 36         # 403.5.1
CELL = 4           # the walker's grid
STOVE_KEEP = 36    # no table this close to the stove


def wall_of(t):
    return t.get("against")


def top_box(t):
    """A square or long table's top, (x0, y0, x1, y1). w runs along x."""
    w = t["w"]
    d = t.get("d", t["w"])
    return (t["x"] - w / 2, t["y"] - d / 2, t["x"] + w / 2, t["y"] + d / 2)


def d_box(px, py, b):
    x0, y0, x1, y1 = b
    dx = max(x0 - px, 0, px - x1)
    dy = max(y0 - py, 0, py - y1)
    if dx == 0 and dy == 0:
        return -min(px - x0, x1 - px, py - y0, y1 - py)
    return math.hypot(dx, dy)


def zone_box(t, room):
    """A square or long table with its seats: the top grown by a seat on every
    side, and on the side against a wall, grown to the wall, because the settle
    or the sofa fills it."""
    x0, y0, x1, y1 = top_box(t)
    x0, y0, x1, y1 = x0 - SEAT, y0 - SEAT, x1 + SEAT, y1 + SEAT
    w = wall_of(t)
    if w == "north":
        y0 = 0
    if w == "south":
        y1 = room["d"]
    if w == "east":
        x1 = room["w"]
    if w == "west":
        x0 = 0
    return (x0, y0, x1, y1)


def d_top(t, px, py):
    if t["shape"] == "round":
        return math.hypot(px - t["x"], py - t["y"]) - t["w"] / 2
    return d_box(px, py, top_box(t))


def d_zone(t, room, px, py):
    if t["shape"] == "round":
        return math.hypot(px - t["x"], py - t["y"]) - t["w"] / 2 - SEAT
    return d_box(px, py, zone_box(t, room))


def d_seg(px, py, a, b):
    ax, ay = a
    bx, by = b
    vx, vy = bx - ax, by - ay
    L = vx * vx + vy * vy
    u = 0 if L == 0 else max(0, min(1, ((px - ax) * vx + (py - ay) * vy) / L))
    return math.hypot(px - (ax + u * vx), py - (ay + u * vy))


def inside(px, py, poly):
    c = False
    j = len(poly) - 1
    for i in range(len(poly)):
        xi, yi = poly[i]
        xj, yj = poly[j]
        if (yi > py) != (yj > py) and px < (xj - xi) * (py - yi) / (yj - yi) + xi:
            c = not c
        j = i
    return c


def d_poly(px, py, poly):
    d = min(d_seg(px, py, poly[i], poly[(i + 1) % len(poly)]) for i in range(len(poly)))
    return -d if inside(px, py, poly) else d


def bar_quads(bar, with_zone=True):
    """The bar as one quad per stretch of its front: from the back of the
    counter to its front, and on the stretches with stools, on out over the
    stools and the people on them. The low stretch has no stools."""
    f = bar["front"]
    depth = bar["depth"]
    quads = []
    for i in range(len(f) - 1):
        (ax, ay), (bx, by) = f[i], f[i + 1]
        low = bar["heights"][i] <= 36
        out = 0 if (low or not with_zone) else STOOL_ZONE
        quads.append([(ax - depth, ay), (bx - depth, by), (bx + out, by), (ax + out, ay)])
    return quads


def arc_point(front, at):
    """The point at a distance along the bar's front, and the stretch it is on."""
    run = 0
    for i in range(len(front) - 1):
        (ax, ay), (bx, by) = front[i], front[i + 1]
        L = math.hypot(bx - ax, by - ay)
        if at <= run + L:
            u = (at - run) / L
            return ax + u * (bx - ax), ay + u * (by - ay), i
        run += L
    return front[-1][0], front[-1][1], len(front) - 2


def seg_lengths(front):
    return [math.hypot(front[i + 1][0] - front[i][0], front[i + 1][1] - front[i][1]) for i in range(len(front) - 1)]


def obstacles(d):
    """Everything a wheelchair has to go round, as distance functions."""
    room = d["room"]
    out = []
    for t in d["tables"]:
        out.append((f"table {t['n']}", lambda px, py, t=t: d_zone(t, room, px, py)))
    for c in d["columns"]:
        out.append((f"the {c['key']} column", lambda px, py, c=c: math.hypot(px - c["x"], py - c["y"]) - c["d"] / 2))
    for i, q in enumerate(bar_quads(d["bar"])):
        out.append((f"the bar's stretch {i + 1}", lambda px, py, q=q: d_poly(px, py, q)))
    s = d["stove"]
    out.append(("the stove", lambda px, py: d_box(px, py, (s["x0"], s["y0"], s["x1"], s["y1"]))))
    p = d["piano"]
    out.append(("the piano and its bench", lambda px, py: d_box(px, py, (p["x0"], p["y0"], p["x1"], p["bench"][3]))))
    return out


def walk(d):
    """Flood the floor from the door through every point at least 18 inches
    from everything, which is every point a way 36 inches wide can pass."""
    room = d["room"]
    obs = obstacles(d)
    W, D = room["w"], room["d"]
    R = CLEAR / 2
    cols, rows = int(W // CELL), int(D // CELL)
    clearance = {}
    for i in range(cols):
        for j in range(rows):
            px, py = (i + .5) * CELL, (j + .5) * CELL
            c = min(px, W - px, py, D - py)
            for _, f in obs:
                c = min(c, f(px, py))
                if c < 0:
                    break
            clearance[(i, j)] = c
    door = d["door"]
    start = (int(((door["x0"] + door["x1"]) / 2) // CELL), int((R + 2) // CELL))
    if clearance.get(start, -1) < R:
        refuse("the floor just inside the door is not 36 inches clear. Nobody could get in.")
        return set(), clearance
    seen = {start}
    todo = [start]
    while todo:
        i, j = todo.pop()
        for k in ((i + 1, j), (i - 1, j), (i, j + 1), (i, j - 1)):
            if k not in seen and clearance.get(k, -1) >= R:
                seen.add(k)
                todo.append(k)
    return seen, clearance


def reaches(cells, f, within):
    for (i, j) in cells:
        if f((i + .5) * CELL, (j + .5) * CELL) <= within:
            return True
    return False


# ── What a table is near, worked out from the plan ───────────────────────────

def patches(d):
    """Where each mirror's light lands: a parallelogram the size of the mirror,
    a little bigger on the floor than on a table, leaning away from the wall it
    came off. Returns [(mirror, kind, target, [(x, y), ...])]."""
    tabs = {t["n"]: t for t in d["tables"]}
    out = []
    for m in d["mirrors"]:
        lands = m.get("lands") or {}
        if "table" in lands:
            t = tabs.get(lands["table"])
            if not t:
                continue
            cx, cy, z = t["x"], t["y"], t["h"]
            span_x = (t["w"] if t["shape"] != "long" else t["w"]) * .55
            span_y = (t["w"] if t["shape"] != "long" else t["d"]) * .55
            a, b = min(m["w"] * .55, span_x / 2), min(m["h"] * .5, span_y / 2)
            kind, target = "table", t["n"]
        else:
            cx, cy = lands.get("floor") or (0, 0)
            z = 0
            a, b = m["w"] * .8, m["h"] * .7
            kind, target = "floor", (cx, cy)
        lean = {"west": .45, "east": -.45, "north": 0}[m["wall"]]
        skew = .35 if m["wall"] == "north" else 0
        pts = [(cx - a + lean * b, cy - b + skew * a), (cx + a + lean * b, cy - b - skew * a),
               (cx + a - lean * b, cy + b - skew * a), (cx - a - lean * b, cy + b + skew * a)]
        out.append((m, kind, target, pts, z))
    return out


def sight_blocked(d, t):
    door = d["door"]
    ax, ay = (door["x0"] + door["x1"]) / 2, 6
    for c in d["columns"]:
        if d_seg(c["x"], c["y"], (ax, ay), (t["x"], t["y"])) < c["d"] / 2 + 1:
            return True
    p = d["piano"]
    for k in range(41):
        u = k / 40
        if d_box(ax + u * (t["x"] - ax), ay + u * (t["y"] - ay), (p["x0"], p["y0"], p["x1"], p["y1"])) < 0:
            return True
    return False


def bar_distance(d, px, py):
    f = d["bar"]["front"]
    return min(d_seg(px, py, f[i], f[i + 1]) for i in range(len(f) - 1))


def facts(d):
    """Everything the room says about each table, worked out from the plan so
    the words and the plan cannot disagree."""
    room = d["room"]
    lit = {target for (_, kind, target, _, _) in patches(d) if kind == "table"}
    s = d["stove"]
    out = {}
    for t in d["tables"]:
        has = set()
        roll = t["base"] == "pedestal" and 28 <= t["h"] <= 34 and t["h"] - t["top"] >= 27
        if roll:
            has.add("roll")
        if t["h"] >= 38:
            has.add("tall")
        if t["h"] <= 20 and t["seating"] in ("armchairs", "sofa"):
            has.add("low")
        if t["seats"] <= 2:
            has.add("small")
        if t["seats"] >= 4:
            has.add("big")
        if t.get("against"):
            has.add("wall")
        if sight_blocked(d, t):
            has.add("unseen")
        if bar_distance(d, t["x"], t["y"]) >= 250:
            has.add("quiet")
        stove = min(d_zone(t, room, px, py) for px in (s["x0"], s["x1"]) for py in (s["y0"], (s["y0"] + s["y1"]) / 2, s["y1"]))
        if stove <= 80:
            has.add("warm")
        has.add("light" if t["n"] in lit else "shade")
        near = min(d["columns"], key=lambda c: d_zone(t, room, c["x"], c["y"]) - c["d"] / 2)
        gap = d_zone(t, room, near["x"], near["y"]) - near["d"] / 2
        p = d["piano"]
        piano = min(d_zone(t, room, px, py) for px in (p["x0"], p["x1"]) for py in (p["y1"], p["bench"][3]))
        window = t.get("against") == "north" and any(
            w["x"] < t["x"] + t["w"] / 2 and w["x"] + w["w"] > t["x"] - t["w"] / 2 for w in d["windows"])
        out[t["n"]] = {"has": has, "column": near if gap <= 34 else None, "piano": piano <= 40,
                       "window": window, "roll": roll}
    return out


WANTS = [
    ("roll", "Room under it for a wheelchair or my knees"),
    ("tall", "A tall table, to stand at or perch"),
    ("low", "A low table and a soft seat"),
    ("small", "For one or two"),
    ("big", "For four or more"),
    ("wall", "My back to a wall"),
    ("unseen", "Out of sight of the door"),
    ("quiet", "Away from the bar"),
    ("warm", "By the stove"),
    ("light", "In a patch of light"),
    ("shade", "Out of the light"),
]


# ── The checks on the room's own data ────────────────────────────────────────

def thirteen(xs, what):
    if len(xs) != THIRTEEN:
        refuse(f"there are {len(xs)} {what}. McAnally's has thirteen, and this pub is made like it: Jim "
               "Butcher's number, a count that belongs to somebody else.")


def distinct(vals, what):
    seen = {}
    for v, who in vals:
        if v in seen:
            refuse(f"{who} and {seen[v]} are the same {what}. No two alike: the books call the pub a study "
                   "in deliberate asymmetry.")
        seen.setdefault(v, who)


def no_row(items, gap, what):
    """No two in a row, along either wall."""
    for i in range(len(items)):
        for j in range(i + 1, len(items)):
            (ax, ay, an), (bx, by, bn) = items[i], items[j]
            if abs(ax - bx) < gap:
                refuse(f"{an} and {bn} stand in a row, {abs(ax - bx):.0f} inches apart across the room. Nothing "
                       f"in this pub lines up; move one at least {gap} inches.")
            if abs(ay - by) < gap:
                refuse(f"{an} and {bn} stand in a row, {abs(ay - by):.0f} inches apart along the room. Nothing "
                       f"in this pub lines up; move one at least {gap} inches.")


def gaps_distinct(xs, what):
    gs = [round(b - a, 1) for a, b in zip(xs, xs[1:])]
    if len(set(gs)) != len(gs):
        refuse(f"two gaps between {what} are the same ({gs}). No two alike, gaps included.")
    return gs


def check_geometry(d):
    room, door = d["room"], d["door"]
    W, D = room["w"], room["d"]
    # The ADA numbers, each read on the Access Board's page.
    st = d["steps"]
    riser = room["below_street"] / st["risers"]
    if not 4 <= riser <= 7 or st["tread"] < 11:
        refuse(f"the steps rise {riser:.2f} inches with {st['tread']}-inch treads; 504.2 asks for 4 to 7 and 11.")
    rp = d["ramp"]
    if sum(r["rise"] for r in rp["runs"]) != room["below_street"]:
        refuse("the ramp's runs do not come down as far as the steps do.")
    for k, r in enumerate(rp["runs"], 1):
        if r["rise"] / r["run"] > 1 / 12 + 1e-9:
            refuse(f"the ramp's run {k} is steeper than 1:12 (405.2).")
        if r["rise"] > 30:
            refuse(f"the ramp's run {k} rises more than 30 inches (405.6).")
    if rp["width"] < 36:
        refuse("the ramp is narrower than 36 inches (405.5).")
    if rp["width"] != st["width"]:
        refuse(f"the ramp is {rp['width']} inches wide and the steps {st['width']}. The ramp is as wide as the "
               "steps: the way in that does not use your legs is not the narrower one.")
    if rp["landing"] < 60:
        refuse("a landing on the ramp is shorter than 60 inches (405.7.3, 405.7.4).")
    if rp.get("handrails") != "both sides":
        refuse("the ramp rises more than six inches and has no handrails on both sides (405.8, 505.2).")
    if room["beam_bottom"] < 80:
        refuse("the beams hang lower than 80 inches (307.4). The ceiling is low; it is not that low.")
    if room["ceiling"] - room["beam_bottom"] < 8:
        refuse("the bays between the beams are too shallow for a fan to turn in above the beams' line.")
    if room["window_sill"] < room["below_street"]:
        refuse("the windows sit below the pavement outside. They are at its level, at the top of the walls.")
    # Thirteen of each, and none alike.
    thirteen(d["tables"], "tables")
    thirteen(d["columns"], "columns")
    thirteen(d["windows"], "windows")
    thirteen(d["mirrors"], "mirrors")
    thirteen(d["fans"], "ceiling fans")
    thirteen(d["bar"]["stools"], "stools at the bar")
    tabs = d["tables"]
    if sorted(t["n"] for t in tabs) != list(range(1, THIRTEEN + 1)):
        refuse("the tables are not numbered one to thirteen, once each.")
    distinct([((t["shape"], t["w"], t.get("d"), t["h"]), f"table {t['n']}") for t in tabs], "table")
    distinct([(t["h"], f"table {t['n']}") for t in tabs], "height of table")
    no_row([(t["x"], t["y"], f"table {t['n']}") for t in tabs], 6, "tables")
    distinct([(c["d"], c["tale"]) for c in d["columns"]], "thickness of column")
    distinct([(c["tale"], c["key"]) for c in d["columns"]], "tale")
    distinct([(json.dumps(c["bands"]), c["tale"]) for c in d["columns"]], "carving")
    no_row([(c["x"], c["y"], f"the {c['key']} column") for c in d["columns"]], 8, "columns")
    distinct([(w["w"], f"the window at {w['x']}") for w in d["windows"]], "width of window")
    ws = sorted(d["windows"], key=lambda w: w["x"])
    edges = []
    for w in ws:
        if w["x"] < 0 or w["x"] + w["w"] > W:
            refuse(f"the window at {w['x']} runs off the wall.")
        if w["x"] < door["x1"] + 8 and w["x"] + w["w"] > door["x0"] - 8:
            refuse(f"the window at {w['x']} is over the door, which is taller than the windows' sill.")
        edges += [w["x"], w["x"] + w["w"]]
    for a, b in zip(ws, ws[1:]):
        if b["x"] < a["x"] + a["w"] + 4:
            refuse(f"the windows at {a['x']} and {b['x']} run into each other.")
    gaps_distinct([w["x"] for w in ws], "windows")
    distinct([((m["w"], m["h"]), f"the mirror at {m['wall']} {m['at']}") for m in d["mirrors"]], "size of mirror")
    distinct([(m["w"] * m["h"], f"the mirror at {m['wall']} {m['at']}") for m in d["mirrors"]], "area of mirror")
    for m in d["mirrors"]:
        where = f"the mirror at {m['wall']} {m['at']}"
        if m["wall"] not in ("west", "north", "east"):
            refuse(f"{where} is on a wall the room does not draw.")
            continue
        if m["z"] + m["h"] / 2 > room["window_sill"] - 2 and m["wall"] == "north":
            refuse(f"{where} runs up into the windows.")
        if m["z"] - m["h"] / 2 < 30:
            refuse(f"{where} hangs below the dado.")
        lands = m.get("lands") or {}
        if not ("table" in lands or "floor" in lands):
            refuse(f"{where} does not say where its light lands. Every mirror here passes the street's light on.")
    for wall in ("west", "north", "east"):
        on = sorted(m["at"] for m in d["mirrors"] if m["wall"] == wall)
        for a, b in zip(on, on[1:]):
            if b - a < 30:
                refuse(f"two mirrors on the {wall} wall hang within {b - a} inches of each other.")
    # The beams and the fans between them.
    beams = d["beams"]
    if beams != sorted(beams):
        refuse("the beams are not in order along the room.")
    gaps_distinct(beams, "beams")
    distinct([(f["span"], f"the fan at {f['x']},{f['y']}") for f in d["fans"]], "span of fan")
    distinct([(f["turn"], f"the fan at {f['x']},{f['y']}") for f in d["fans"]], "turn of fan")
    for f in d["fans"]:
        bay = [(a, b) for a, b in zip(beams, beams[1:]) if a < f["y"] < b]
        if not bay:
            refuse(f"the fan at {f['x']},{f['y']} is not in a bay between two beams.")
            continue
        a, b = bay[0]
        room_in_bay = (b - 4) - (a + 4)
        if f["span"] + 4 > room_in_bay or abs(f["y"] - (a + b) / 2) > (room_in_bay - f["span"]) / 2 + .5:
            refuse(f"the fan at {f['x']},{f['y']} does not fit its bay: it turns above the line of the beams, "
                   "so it has to fit between them.")
        if not f["span"] / 2 + 4 <= f["x"] <= W - f["span"] / 2 - 4:
            refuse(f"the fan at {f['x']},{f['y']} hits a wall.")
    # The beams decide where a fan hangs along the room, so fans in one bay
    # share its line; across the room, none of them line up.
    fans = d["fans"]
    for i in range(len(fans)):
        for j in range(i + 1, len(fans)):
            if abs(fans[i]["x"] - fans[j]["x"]) < 10:
                refuse(f"the fans at {fans[i]['x']},{fans[i]['y']} and {fans[j]['x']},{fans[j]['y']} line up across "
                       "the room. Nothing in this pub lines up; move one at least 10 inches.")
    # The bar: its stretches, its low stretch and its stools.
    bar = d["bar"]
    lens = seg_lengths(bar["front"])
    if len(bar["heights"]) != len(lens):
        refuse("the bar has a different number of heights from stretches.")
        return
    distinct([(round(L), f"stretch {i + 1} of the bar") for i, L in enumerate(lens)], "length of the bar's stretch")
    low = [i for i, h in enumerate(bar["heights"]) if h <= 36]
    if not low or max(lens[i] for i in low) < 36:
        refuse("no stretch of the bar is 36 inches high or lower for 36 inches of its length (904.4.1). Somebody "
               "sitting down has to be able to be served.")
    stools = bar["stools"]
    if stools != sorted(stools):
        refuse("the stools are not in order along the bar.")
    for at in stools:
        x, y, i = arc_point(bar["front"], at)
        if bar["heights"][i] <= 36:
            refuse(f"a stool stands at {at} inches along the bar, on its low stretch, where somebody sitting "
                   "down is served.")
    g = gaps_distinct(stools, "stools")
    if g and min(g) < 20:
        refuse("two stools at the bar are closer than 20 inches.")
    # Every table and every column inside the room, clear of each other.
    for t in tabs:
        where = f"table {t['n']}"
        zb = zone_box(t, room) if t["shape"] != "round" else (
            t["x"] - t["w"] / 2 - SEAT, t["y"] - t["w"] / 2 - SEAT, t["x"] + t["w"] / 2 + SEAT, t["y"] + t["w"] / 2 + SEAT)
        if zb[0] < 0 or zb[1] < 0 or zb[2] > W or zb[3] > D:
            refuse(f"{where} and its seats run through a wall.")
        if t["shape"] == "round" and t.get("against"):
            refuse(f"{where} is round and says it is against a wall.")
        if t.get("against") and t["seating"] not in ("settle", "sofa", "armchairs"):
            refuse(f"{where} is against a wall with {t['seating']}; a table against a wall has a settle, a sofa "
                   "or armchairs along it.")
        if t["shape"] != "round" and t.get("against"):
            x0, y0, x1, y1 = top_box(t)
            off = {"north": y0, "south": D - y1, "east": W - x1, "west": x0}[t["against"]]
            if not 14 <= off <= 26:
                refuse(f"{where} stands {off:.0f} inches off the {t['against']} wall; a settle or a sofa is 14 to "
                       "26 inches deep.")
        for u in tabs:
            if u["n"] > t["n"]:
                for px, py in sample_zone(t, room):
                    if d_zone(u, room, px, py) < 0:
                        refuse(f"{where} and table {u['n']} run into each other.")
                        break
        for c in d["columns"]:
            if d_zone(t, room, c["x"], c["y"]) < c["d"] / 2:
                refuse(f"{where} and its seats run into the {c['key']} column.")
        for q in bar_quads(bar):
            if any(d_poly(px, py, q) < 0 for px, py in sample_zone(t, room)):
                refuse(f"{where} runs into the bar or the people on its stools.")
                break
        s = d["stove"]
        near = min(d_zone(t, room, px, py) for px in (s["x0"], s["x1"]) for py in (s["y0"], (s["y0"] + s["y1"]) / 2, s["y1"]))
        if near < STOVE_KEEP:
            refuse(f"{where} is {near:.0f} inches from the stove; nothing sits nearer than {STOVE_KEEP}.")
        p = d["piano"]
        if any(d_box(px, py, (p["x0"], p["y0"], p["x1"], p["bench"][3])) < 0 for px, py in sample_zone(t, room)):
            refuse(f"{where} runs into the piano.")
        cx0, cy0, cx1, cy1 = door["clear"]
        if any(cx0 <= px <= cx1 and cy0 <= py <= cy1 for px, py in sample_zone(t, room)):
            refuse(f"{where} stands in the clear floor inside the door.")
    for i, c in enumerate(d["columns"]):
        if not c["d"] / 2 <= c["x"] <= W - c["d"] / 2 or not c["d"] / 2 <= c["y"] <= D - c["d"] / 2:
            refuse(f"the {c['key']} column is outside the room.")
        for e in d["columns"][i + 1:]:
            if math.hypot(c["x"] - e["x"], c["y"] - e["y"]) < (c["d"] + e["d"]) / 2 + 24:
                refuse(f"the {c['key']} and {e['key']} columns stand too close to walk between.")
        if any(d_poly(c["x"], c["y"], q) < c["d"] / 2 for q in bar_quads(bar)):
            refuse(f"the {c['key']} column stands in the bar or its stools.")
        cx0, cy0, cx1, cy1 = door["clear"]
        if cx0 - c["d"] / 2 <= c["x"] <= cx1 + c["d"] / 2 and c["y"] <= cy1 + c["d"] / 2:
            refuse(f"the {c['key']} column stands in the clear floor inside the door.")
        for b in c["bands"]:
            if not (0 <= b[0] < b[1] <= room["ceiling"]) or b[2] not in BANDS:
                refuse(f"the {c['key']} column has a band {b} the tool cannot carve.")
    # The walk: from the door to every table, the low stretch of the bar, and
    # somewhere to turn round.
    cells, clearance = walk(d)
    if not cells:
        return
    R = CLEAR / 2
    for t in tabs:
        if not reaches(cells, lambda px, py, t=t: d_zone(t, room, px, py), R + CELL * 1.5):
            refuse(f"table {t['n']} has no way to it 36 inches wide from the door (403.5.1). Asymmetry is not "
                   "obstruction: move a column or a table, never narrow the way.")
    q_low = [q for q, h in zip(bar_quads(bar), bar["heights"]) if h <= 36]
    for q in q_low:
        if not reaches(cells, lambda px, py, q=q: d_poly(px, py, q), R + CELL * 1.5):
            refuse("the low stretch of the bar has no way to it 36 inches wide (403.5.1, 904.4.1).")
    if not any(clearance[k] >= 30 for k in cells):
        refuse("there is nowhere on the floor to turn round in: no 60-inch circle (304.3.1).")
    # The light: every patch somewhere it can lie.
    for (m, kind, target, pts, z) in patches(d):
        if kind == "floor":
            cx, cy = target
            if any(f(cx, cy) < 0 for _, f in obstacles(d)):
                refuse(f"the mirror at {m['wall']} {m['at']} lands its light inside something on the floor.")
    lit_tables = [t for (_, k, t, _, _) in patches(d) if k == "table"]
    if len(set(lit_tables)) != len(lit_tables):
        refuse("two mirrors land their light on one table; each patch lies somewhere of its own.")


def sample_zone(t, room):
    if t["shape"] == "round":
        r = t["w"] / 2 + SEAT
        return [(t["x"] + r * math.cos(a * math.pi / 8), t["y"] + r * math.sin(a * math.pi / 8)) for a in range(16)] + [(t["x"], t["y"])]
    x0, y0, x1, y1 = zone_box(t, room)
    return [(x0 + (x1 - x0) * i / 6, y0 + (y1 - y0) * j / 6) for i in range(7) for j in range(7)]


SEATINGS = {"stools", "chairs", "armchairs", "settle", "sofa"}
SHAPES = {"round", "square", "long"}
TABLE_KEYS = {"n", "shape", "w", "d", "h", "top", "base", "seats", "seating", "against", "x", "y"}
POUR_KEYS = {"key", "label", "abv", "strength", "how"}
PINT_KEYS = {"key", "name", "diet", "what", "note", "look", "pours"}
GLASS_KEYS = {"key", "name", "diet", "what", "note", "vessel"}
FOOD_KEYS = {"key", "name", "diet", "what", "animal", "note", "look"}
VESSELS = {"tall", "pot", "jug"}
FREE = 0.05


# Pekoe and Purrs' words decide caffeine; a drink is caffeine-free only when
# every part of it is one of the Truck Stop's plain words or a brewer's.
BREWED = r"malted|roasted|barley|hops|yeast|pressed|apples|tea|black tea|side|oat milk"


def caffeine(what):
    level = pekoe.caffeine(what)
    if level:
        return level
    t = re.sub(r"[(),.]", " ", what.lower())
    t = re.sub(r"\b(?:and|with|a|an|of|the|on|in)\b", " ", t)
    rest = re.sub(rf"\b(?:{tks.PLAIN}|{BREWED})\b", " ", t).split()
    return None if rest else "none"


def check_menu(d):
    keys = set()

    def dish(x, where):
        before = len(hgc.problems)
        hgc.check_dish({k: x[k] for k in ("name", "diet", "what", "animal", "note") if k in x}, where)
        problems.extend(hgc.problems[before:])
        del hgc.problems[before:]
        if x.get("key") in keys or not re.fullmatch(r"[a-z]+", x.get("key") or ""):
            refuse(f"{where}: {x.get('name')!r} has no plain key of its own.")
        keys.add(x.get("key"))

    for p in d.get("pints") or []:
        where = f"{DATA.name}, pint {p.get('key')!r}"
        if set(p) - PINT_KEYS:
            refuse(f"{where} carries {sorted(set(p) - PINT_KEYS)}, which nothing reads.")
        dish(p, where)
        if p.get("diet") != "vegan":
            refuse(f"{where} is not vegan. Nothing clears the house's drinks, so every one of them is.")
        if caffeine(p.get("what") or "") != "none":
            refuse(f"{where}: its caffeine cannot be worked out as none from what is in it.")
        pours = p.get("pours") or []
        if len(pours) != 2:
            refuse(f"{where} has {len(pours)} pours. Every pint comes two ways, alcohol-free first.")
            continue
        for k, q in enumerate(pours, 1):
            if set(q) - POUR_KEYS:
                refuse(f"{where}, pour {k} carries {sorted(set(q) - POUR_KEYS)}.")
            for f in ("label", "strength", "how"):
                if not (q.get(f) or "").strip():
                    refuse(f"{where}, pour {k} has no {f}. Every pour says how strong it is before you order it.")
            if not isinstance(q.get("abv"), (int, float)):
                refuse(f"{where}, pour {k} gives no number for its strength.")
        first, second = pours
        if first.get("label") != "Alcohol-free" or (first.get("abv") or 1) > FREE:
            refuse(f"{where}'s first pour is not alcohol-free (at most {FREE}%). The alcohol-free pour comes "
                   "first, in the same glass, at the same size: Big Steep's rule.")
        if (second.get("abv") or 0) <= FREE:
            refuse(f"{where}'s second pour has no alcohol in it, so it is not the other way.")
        if [q.get("key") for q in pours] != ["free", "full"]:
            refuse(f"{where}'s pours are not keyed free and full.")
        look = p.get("look") or {}
        if set(look) != {"drink", "head"} or not all(str(v).startswith("--aqp-") for v in look.values()):
            refuse(f"{where}'s look is not a drink and a head in the room's own colours.")
        if pint_svg(look) != pint_svg(look):
            refuse(f"{where}: its two pours are drawn differently.")
    for g in d.get("glasses") or []:
        where = f"{DATA.name}, glass {g.get('key')!r}"
        if set(g) - GLASS_KEYS:
            refuse(f"{where} carries {sorted(set(g) - GLASS_KEYS)}.")
        dish(g, where)
        if g.get("vessel") not in VESSELS:
            refuse(f"{where} comes in a {g.get('vessel')!r}, which the tool cannot draw.")
        if caffeine(g.get("what") or "") is None:
            refuse(f"{where}: its caffeine cannot be worked out from what is in it. Say what it is made from.")
    food = d.get("stove_food") or []
    if food and food[0].get("diet") != "vegan":
        refuse("the first thing from the stove is not vegan. The vegan dish comes first on the board and is the "
               "same size: Hey, Good Cookin's rule.")
    for x in food:
        where = f"{DATA.name}, {x.get('name')!r}"
        if set(x) - FOOD_KEYS:
            refuse(f"{where} carries {sorted(set(x) - FOOD_KEYS)}.")
        dish(x, where)
        look = x.get("look") or {}
        if not look or not all(str(v).startswith("--aqp-") for v in look.values()):
            refuse(f"{where}'s look is not in the room's own colours.")
    if not isinstance(d.get("table_holds"), int) or not 1 <= d["table_holds"] <= 6:
        refuse("table_holds is how many things your table holds, between one and six.")


def check_words(d):
    cap, total = d.get("quote_cap"), d.get("quote_total")
    if not isinstance(cap, int) or not isinstance(total, int):
        refuse("the quotations have no cap or no total in the data file.")
        return
    books = d.get("books") or {}
    used = 0
    for q in d.get("quotes") or []:
        where = f"{DATA.name}, quotation {q.get('key')!r}"
        words = len(re.findall(r"[\w’']+", q.get("words") or ""))
        used += words
        if words > cap:
            refuse(f"{where} is {words} words, over the cap of {cap}. Quote what the room owes, never a scene.")
        b = books.get(q.get("book"))
        if not b:
            refuse(f"{where} names no book this file has.")
            continue
        if not re.fullmatch(r"OL\d+W", b.get("ol") or ""):
            refuse(f"{where}: its book has no Open Library work record.")
        if not re.fullmatch(r"\d+(?:–\d+)?", q.get("pages") or ""):
            refuse(f"{where} gives no pages.")
        if not (q.get("for") or "").strip():
            refuse(f"{where} does not say what the room quotes it for.")
        if re.search(r"&[a-z#0-9]+;", q.get("words") or ""):
            refuse(f"{where} has an HTML entity in it. Write the character.")
    if used > total:
        refuse(f"the quotations come to {used} words, over the total of {total}. That is the drift the "
               "Zibaldone's cap is for: nobody decides to republish a book.")
    tp = d.get("third_places") or {}
    page = MIRROR / (tp.get("mirror") or "")
    if MIRROR.exists():
        if not page.exists():
            refuse(f"the mirror has no {tp.get('mirror')}; our Third Places page has moved or gone.")
        else:
            src = re.sub(r"\s+", " ", page.read_text().replace("> ", " "))
            for line in [tp.get("radical") or "", tp.get("buy") or ""] + [f"{k}. {w}" for k, w in
                                                                            enumerate(tp.get("list") or [], 1)]:
                if re.sub(r"\s+", " ", line) not in src:
                    refuse(f"our Third Places page no longer says {line!r}. Re-copy it from the page; never "
                           "loosen this check.")


def check_columns(d):
    for c in d["columns"]:
        for f in ("key", "tale", "carved"):
            if not (c.get(f) or "").strip():
                refuse(f"the column {c.get('key')!r} has no {f}.")


ROLL_KEYS = {"key", "title", "written", "by", "roll", "heard", "file", "src", "runtime", "licence"}
RUNTIME = re.compile(r"^(?:\d+:[0-5]\d|\d+:[0-5]\d:[0-5]\d)$")


def audio_origins():
    block = re.search(r"var AUDIO_ORIGINS = \[(.*?)\];", EMBED.read_text(), re.S)
    return re.findall(r"'(https://[^']+)'", block.group(1)) if block else []


def check_rolls(d):
    """Every roll on the piano: a real roll's recording, from an origin
    love-embed.js will play, saying how long it runs and whose music it is."""
    from datetime import date
    origins = audio_origins()
    if not origins:
        refuse("love-embed.js has no AUDIO_ORIGINS, so no roll could be checked.")
    rolls = d.get("rolls") or []
    if not rolls:
        refuse("the piano has no rolls on its shelf.")
    keys = set()
    for r in rolls:
        where = f"{DATA.name}, roll {r.get('key')!r}"
        if set(r) - ROLL_KEYS:
            refuse(f"{where} carries {sorted(set(r) - ROLL_KEYS)}, which nothing reads.")
        if r.get("key") in keys or not re.fullmatch(r"[a-z]+", r.get("key") or ""):
            refuse(f"{where} has no plain key of its own.")
        keys.add(r.get("key"))
        for f in ("title", "roll", "file", "src", "licence"):
            if not (r.get(f) or "").strip():
                refuse(f"{where} has no {f}.")
        if not any((r.get("src") or "").startswith(o) for o in origins):
            refuse(f"{where}: {r.get('src')} is not from an origin in love-embed.js's AUDIO_ORIGINS, which "
                   "would refuse it quietly, and the button would never play.")
        if not (r.get("src") or "").endswith(".mp3"):
            refuse(f"{where} is not Commons' MP3, which every browser plays.")
        if not (r.get("file") or "").startswith("File:"):
            refuse(f"{where} does not name its file on Commons, where its licence is.")
        if not RUNTIME.match(r.get("runtime") or ""):
            refuse(f"{where} has no runtime. Every press-to-play control here says how long before the press.")
        if not str(r.get("licence") or "").startswith("Public domain"):
            refuse(f"{where} is not public domain on Commons.")
        by = r.get("by") or []
        if not by:
            refuse(f"{where} names no composer.")
        for c in by:
            if not (c.get("name") and isinstance(c.get("born"), int) and isinstance(c.get("died"), int)):
                refuse(f"{where}: a composer without a name or both years.")
            elif c["died"] + 70 >= date.today().year:
                refuse(f"{where}: {c['name']} died in {c['died']}, seventy years ago or less, so the music is not "
                       "public domain everywhere. The Doomscroll's bar, counted against this year.")
        if r.get("written") is not None and not isinstance(r.get("written"), int):
            refuse(f"{where}: the year it was written is not a year.")
    if len({r.get("src") for r in rolls}) != len(rolls):
        refuse("two rolls on the shelf are the same recording.")


# ── The room, from a seat at the south end ───────────────────────────────────
# One-point perspective, from a seat: the eye is 50 inches up, which is where
# most people in a pub are, sitting down. Everything is drawn from the plan, so
# the room and the plan cannot disagree.

W_PX, H_PX = 1200, 620
CAM = (360.0, 540.0, 50.0)
FOC = 570.0
VX, VY = 600.0, 283.0
ROOM_W = 720
CROP = (60, 560)


def setup(d):
    """The eye sits behind the south end of the room, at the height of somebody
    sitting down, and the back wall fills most of the width."""
    global CAM, FOC, VY, ROOM_W
    room = d["room"]
    ROOM_W = room["w"]
    CAM = (room["w"] / 2, room["d"] + 16.0, float(room["eye"]))
    FOC = 860 * CAM[1] / room["w"]
    VY = H_PX * (room["ceiling"] - room["eye"]) / room["ceiling"]
LINE = 'stroke="var(--aqp-line)" stroke-width="1.2" stroke-linejoin="round"'


def P(x, y, z):
    d = CAM[1] - y
    return (VX + FOC * (x - CAM[0]) / d, VY - FOC * (z - CAM[2]) / d)


def path(pts):
    return "M" + " L".join(f"{n(a)} {n(b)}" for a, b in pts) + " Z"


def face(pts3, fill, extra=""):
    return f'<path d="{path([P(*p) for p in pts3])}" fill="var({fill})" {extra}/>'


def line3(a, b, stroke, width=1.2, extra=""):
    (x1, y1), (x2, y2) = P(*a), P(*b)
    return (f'<path d="M{n(x1)} {n(y1)} L{n(x2)} {n(y2)}" stroke="var({stroke})" stroke-width="{width}" '
            f'fill="none" {extra}/>')


def disc(x, y, z, r, k=18):
    return [(x + r * math.cos(2 * math.pi * i / k), y + r * math.sin(2 * math.pi * i / k), z) for i in range(k)]


def room_shell(d):
    room = d["room"]
    W, D, C = room["w"], room["d"], room["ceiling"]
    out = [f'<rect width="{W_PX}" height="{H_PX}" fill="var(--aqp-ceil)"/>']
    out.append(face([(0, 0, C), (W, 0, C), (W, D, C), (0, D, C)], "--aqp-ceil"))
    for x in range(40, W, 46):
        out.append(line3((x, 0, C), (x, D, C), "--aqp-seam", .9))
    out.append(face([(0, 0, 0), (W, 0, 0), (W, D, 0), (0, D, 0)], "--aqp-floor"))
    for x in range(0, W + 1, 21):
        out.append(line3((x, 0, 0), (x, D, 0), "--aqp-seam", .9))
    out.append(face([(0, 0, 0), (W, 0, 0), (W, 0, C), (0, 0, C)], "--aqp-wall"))
    for x in range(26, W, 26):
        out.append(line3((x, 0, 0), (x, 0, C), "--aqp-seam", .8))
    out.append(face([(0, 0, 0), (0, D, 0), (0, D, C), (0, 0, C)], "--aqp-wall2"))
    out.append(face([(W, 0, 0), (W, D, 0), (W, D, C), (W, 0, C)], "--aqp-wall2"))
    for y in range(30, D, 30):
        out.append(line3((0, y, 0), (0, y, C), "--aqp-seam", .8))
        out.append(line3((W, y, 0), (W, y, C), "--aqp-seam", .8))
    for a, b in (((0, 0, 34), (W, 0, 34)), ((0, 0, 34), (0, D, 34)), ((W, 0, 34), (W, D, 34))):
        out.append(line3(a, b, "--aqp-line", 2))
    return out


def window_svg(w, room):
    s, t = room["window_sill"], room["window_top"]
    x0, x1 = w["x"], w["x"] + w["w"]
    out = [face([(x0 - 1.5, 0, s - 1.5), (x1 + 1.5, 0, s - 1.5), (x1 + 1.5, 0, t + 1.5), (x0 - 1.5, 0, t + 1.5)], "--aqp-col"),
           face([(x0, 0, s + 3), (x1, 0, s + 3), (x1, 0, t), (x0, 0, t)], "--aqp-street"),
           face([(x0, 0, s), (x1, 0, s), (x1, 0, s + 3), (x0, 0, s + 3)], "--aqp-kerb")]
    if w["w"] > 20:
        mid = (x0 + x1) / 2
        out.append(line3((mid, 0, s), (mid, 0, t), "--aqp-col", 1.6))
    return "".join(out)


def wall_quad(m, du0, du1, dv0, dv1):
    """A rectangle on a wall, in the wall's own across and up."""
    u0, u1 = m["at"] - m["w"] / 2 + du0, m["at"] + m["w"] / 2 + du1
    v0, v1 = m["z"] - m["h"] / 2 + dv0, m["z"] + m["h"] / 2 + dv1
    if m["wall"] == "north":
        return [(u0, 0, v0), (u1, 0, v0), (u1, 0, v1), (u0, 0, v1)]
    x = 0 if m["wall"] == "west" else ROOM_W
    return [(x, u0, v0), (x, u1, v0), (x, u1, v1), (x, u0, v1)]


def mirror_svg(m):
    w, h = m["w"], m["h"]
    out = [face(wall_quad(m, -2, 2, -2, 2), "--aqp-col"), face(wall_quad(m, 0, 0, 0, 0), "--aqp-glass")]
    # One streak of the window's light lying in the glass.
    a = wall_quad(m, w * .2, -w * .55, 0, 0)
    b = wall_quad(m, w * .42, -w * .3, 0, 0)
    streak = [a[0], b[0], (b[3][0], b[3][1], b[3][2]), (a[3][0], a[3][1], a[3][2])]
    if m["wall"] == "north":
        streak = [(m["at"] - w / 2 + w * .18, 0, m["z"] - h / 2), (m["at"] - w / 2 + w * .36, 0, m["z"] - h / 2),
                  (m["at"] - w / 2 + w * .62, 0, m["z"] + h / 2), (m["at"] - w / 2 + w * .44, 0, m["z"] + h / 2)]
    else:
        x = 0 if m["wall"] == "west" else ROOM_W
        u = m["at"] - w / 2
        streak = [(x, u + w * .18, m["z"] - h / 2), (x, u + w * .36, m["z"] - h / 2),
                  (x, u + w * .62, m["z"] + h / 2), (x, u + w * .44, m["z"] + h / 2)]
    out.append(face(streak, "--aqp-sheen"))
    return "".join(out)


def door_svg(d):
    dr = d["door"]
    x0, x1, top = dr["x0"], dr["x1"], dr["top"]
    return (face([(x0 - 2, 0, 0), (x1 + 2, 0, 0), (x1 + 2, 0, top + 2), (x0 - 2, 0, top + 2)], "--aqp-col")
            + face([(x0, 0, 0), (x1, 0, 0), (x1, 0, top), (x0, 0, top)], "--aqp-door")
            + face([(x0 + 7, 0, 50), (x1 - 7, 0, 50), (x1 - 7, 0, 72), (x0 + 7, 0, 72)], "--aqp-street")
            + face([(x0 + 7, 0, 50), (x1 - 7, 0, 50), (x1 - 7, 0, 53), (x0 + 7, 0, 53)], "--aqp-kerb")
            + face([(x0 + 7, 0, 8), (x1 - 7, 0, 8), (x1 - 7, 0, 42), (x0 + 7, 0, 42)], "--aqp-col2"))


def piano_svg(d):
    p = d["piano"]
    x0, x1, y1, h = p["x0"], p["x1"], p["y1"], p["h"]
    bx0, by0, bx1, by1 = p["bench"]
    out = [face([(x1, 0, 0), (x1, y1, 0), (x1, y1, h), (x1, 0, h)], "--aqp-piano2", LINE),
           face([(x0, y1, 0), (x1, y1, 0), (x1, y1, h), (x0, y1, h)], "--aqp-piano", LINE),
           face([(x0 + 3, y1, 27), (x1 - 3, y1, 27), (x1 - 3, y1, 30), (x0 + 3, y1, 30)], "--aqp-froth"),
           # The window the roll turns behind, with a roll in it: paper with
           # rows of holes, still, because nothing in the pub moves.
           face([(x0 + 13, y1, 35), (x1 - 13, y1, 35), (x1 - 13, y1, 46), (x0 + 13, y1, 46)], "--aqp-line"),
           face([(x0 + 15, y1, 36), (x1 - 15, y1, 36), (x1 - 15, y1, 45), (x0 + 15, y1, 45)], "--aqp-plate")]
    for k in range(9):
        hx = x0 + 17 + k * (x1 - x0 - 34) / 8
        hz = 37.5 + (k * 5 % 7)
        out.append(face([(hx, y1, hz), (hx + 1.2, y1, hz), (hx + 1.2, y1, hz + 1.4), (hx, y1, hz + 1.4)], "--aqp-line"))
    for k in range(1, 14):
        xx = x0 + 3 + k * (x1 - x0 - 6) / 14
        out.append(line3((xx, y1, 27), (xx, y1, 30), "--aqp-line", .6))
    out.append(face([(bx1, by0, 0), (bx1, by1, 0), (bx1, by1, 19), (bx1, by0, 19)], "--aqp-piano2", LINE))
    out.append(face([(bx0, by1, 0), (bx1, by1, 0), (bx1, by1, 19), (bx0, by1, 19)], "--aqp-piano", LINE))
    out.append(face([(bx0, by0, 19), (bx1, by0, 19), (bx1, by1, 19), (bx0, by1, 19)], "--aqp-piano2", LINE))
    return "".join(out)


def stove_svg(d):
    s = d["stove"]
    x0, x1, y0, y1, h = s["x0"], s["x1"], s["y0"], s["y1"], s["h"]
    fx, fy = s["flue"]
    out = [face([(x0, y0, h), (x1, y0, h), (x1, y1, h), (x0, y1, h)], "--aqp-iron2", LINE),
           face([(x0, y0, 0), (x0, y1, 0), (x0, y1, h), (x0, y0, h)], "--aqp-iron", LINE),
           face([(x0, y1, 0), (x1, y1, 0), (x1, y1, h), (x0, y1, h)], "--aqp-iron", LINE),
           # The door, shut.
           face([(x0, y0 + 8, 7), (x0, y1 - 8, 7), (x0, y1 - 8, 25), (x0, y0 + 8, 25)], "--aqp-iron2", LINE)]
    top = P(fx, fy, room_c(d))
    bot = P(fx, fy, h)
    r = FOC * 3.5 / (CAM[1] - fy)
    out.append(f'<rect x="{n(bot[0] - r)}" y="{n(top[1])}" width="{n(2 * r)}" height="{n(bot[1] - top[1])}" '
               f'fill="var(--aqp-iron)"/>')
    return "".join(out)


def room_c(d):
    return d["room"]["ceiling"]


def column_svg(c, d):
    C = room_c(d)
    x, y, r = c["x"], c["y"], c["d"] / 2
    depth = CAM[1] - y
    sx, top = P(x, y, C)
    _, bot = P(x, y, 0)
    rs = FOC * r / depth
    k = FOC / depth
    out = [f'<rect x="{n(sx - rs)}" y="{n(top)}" width="{n(2 * rs)}" height="{n(bot - top)}" fill="var(--aqp-col)"/>',
           f'<rect x="{n(sx + rs * .3)}" y="{n(top)}" width="{n(rs * .7)}" height="{n(bot - top)}" fill="var(--aqp-col2)"/>']
    for z0, z1, style in c["bands"]:
        out.append(band(sx, rs, k, P(x, y, z1)[1], P(x, y, z0)[1], style))
    for z0, z1, grow in ((0, 4, 1.6), (C - 4, C, 2)):
        rr = rs + grow * k
        y_top, y_bot = P(x, y, z1)[1], P(x, y, z0)[1]
        out.append(f'<rect x="{n(sx - rr)}" y="{n(y_top)}" width="{n(2 * rr)}" height="{n(y_bot - y_top)}" '
                   f'fill="var(--aqp-carve)"/>')
    return "".join(out)


def band(sx, rs, k, y0, y1, style):
    """A carved band on a column: the cut is darker than the wood round it, and
    no two columns carry the same bands."""
    h = y1 - y0
    w = 2 * rs
    x0 = sx - rs
    out = [f'<rect x="{n(x0)}" y="{n(y0)}" width="{n(w)}" height="{n(h)}" fill="var(--aqp-carve)"/>']
    cut = 'stroke="var(--aqp-col2)" fill="none"'
    sw = max(.6, min(1.6, k * .9))
    if style == "rings":
        for f in (.3, .7):
            out.append(f'<path d="M{n(x0)} {n(y0 + h * f)} H{n(x0 + w)}" {cut} stroke-width="{n(sw)}"/>')
    elif style == "rope":
        step = max(2.5, 3 * k)
        xx = x0
        while xx < x0 + w:
            out.append(f'<path d="M{n(xx)} {n(y1)} L{n(min(x0 + w, xx + step))} {n(y0)}" {cut} stroke-width="{n(sw)}"/>')
            xx += step
    elif style in ("beads", "leaves"):
        rad = max(.8, min(h * .3, 1.8 * k))
        cx = x0 + rad * 1.4
        while cx < x0 + w - rad:
            if style == "beads":
                out.append(f'<circle cx="{n(cx)}" cy="{n(y0 + h / 2)}" r="{n(rad)}" fill="var(--aqp-col2)"/>')
            else:
                out.append(f'<ellipse cx="{n(cx)}" cy="{n(y0 + h / 2)}" rx="{n(rad * .6)}" ry="{n(rad * 1.4)}" '
                           f'fill="var(--aqp-col2)"/>')
            cx += rad * 3
    elif style in ("chevrons", "braid", "waves", "scallops"):
        step = max(3, 4 * k)
        pts = []
        xx, up = x0, True
        while xx <= x0 + w + .1:
            pts.append((min(xx, x0 + w), y0 + h * (.25 if up else .75)))
            xx += step
            up = not up
        if style in ("waves", "scallops"):
            dd = f"M{n(pts[0][0])} {n(pts[0][1])}" + "".join(
                f" Q{n((a[0] + b[0]) / 2)} {n(y0 if style == 'scallops' else (y0 + h if k2 % 2 else y0))} {n(b[0])} {n(b[1])}"
                for k2, (a, b) in enumerate(zip(pts, pts[1:])))
        else:
            dd = "M" + " L".join(f"{n(a)} {n(b)}" for a, b in pts)
        out.append(f'<path d="{dd}" {cut} stroke-width="{n(sw)}"/>')
        if style == "braid":
            for f in (.2, .8):
                out.append(f'<path d="M{n(x0 + w * f)} {n(y0)} V{n(y1)}" {cut} stroke-width="{n(sw * .7)}"/>')
    elif style == "figures":
        cx = x0 + w * .12
        i = 0
        while cx < x0 + w * .9:
            fh = h * (.45 + .1 * ((i * 7) % 4))
            fw = max(1.2, w * .1)
            out.append(f'<rect x="{n(cx)}" y="{n(y1 - fh - h * .1)}" width="{n(fw)}" height="{n(fh)}" rx="{n(fw / 2)}" '
                       f'fill="var(--aqp-col2)"/>')
            cx += fw * 2.2
            i += 1
    elif style == "stack":
        step = max(2.2, 3 * k)
        yy = y0 + step / 2
        while yy < y1:
            out.append(f'<path d="M{n(x0)} {n(yy)} H{n(x0 + w)}" {cut} stroke-width="{n(sw * .8)}"/>')
            yy += step
    elif style == "vine":
        step = max(4, 6 * k)
        yy, side = y1, 1
        dd = f"M{n(sx)} {n(y1)}"
        while yy > y0:
            ny = max(y0, yy - step)
            dd += f" Q{n(sx + side * rs * .8)} {n((yy + ny) / 2)} {n(sx)} {n(ny)}"
            out.append(f'<ellipse cx="{n(sx + side * rs * .55)}" cy="{n((yy + ny) / 2)}" rx="{n(rs * .35)}" '
                       f'ry="{n(max(.8, step * .18))}" fill="var(--aqp-col2)"/>')
            yy, side = ny, -side
        out.append(f'<path d="{dd}" {cut} stroke-width="{n(sw)}"/>')
    elif style == "window":
        out.append(f'<path d="M{n(sx - rs * .35)} {n(y1 - h * .15)} V{n(y0 + h * .45)} Q{n(sx)} {n(y0 + h * .1)} '
                   f'{n(sx + rs * .35)} {n(y0 + h * .45)} V{n(y1 - h * .15)} Z" fill="var(--aqp-col2)"/>')
    return "".join(out)


BANDS = {"rings", "rope", "beads", "leaves", "chevrons", "braid", "waves", "scallops", "figures", "stack",
         "vine", "window"}


def seat_spots(t, room):
    """Where each seat stands round a table: (x, y, facing the table from)."""
    n_ = t["seats"]
    out = []
    if t["seating"] in ("settle", "sofa"):
        return out          # the long seat against the wall is drawn on its own
    if t["shape"] == "round":
        r = t["w"] / 2 + 9
        phase = (t["n"] * 37) % 90
        for i in range(n_):
            a = math.radians(phase + 360 * i / n_)
            out.append((t["x"] + r * math.cos(a), t["y"] + r * math.sin(a)))
        return out
    x0, y0, x1, y1 = top_box(t)
    w = wall_of(t)
    sides = [s for s in ("north", "south", "west", "east") if s != w]
    if w in ("east", "west"):
        sides = ["north", "south"] if t["seating"] == "armchairs" else sides
    k = 0
    while len(out) < n_:
        s = sides[k % len(sides)]
        if s == "north":
            out.append((t["x"] + (k // len(sides) - .2) * 14, y0 - 10))
        elif s == "south":
            out.append((t["x"] - (k // len(sides) - .2) * 14, y1 + 10))
        elif s == "west":
            out.append((x0 - 10, t["y"] + (k // len(sides)) * 12))
        else:
            out.append((x1 + 10, t["y"] - (k // len(sides)) * 12))
        k += 1
    return out


def chair_svg(x, y, t):
    kind = t["seating"]
    if kind == "stools":
        z = t["h"] - 12
        return stool_svg(x, y, z)
    if kind == "armchairs":
        s, z, back = 11, 15, 30
        fill, side = "--aqp-leather", "--aqp-leather2"
    else:
        s, z, back = 7.5, 17, 33
        fill, side = "--aqp-col", "--aqp-col2"
    # The back is on the side away from the table.
    dx, dy = x - t["x"], y - t["y"]
    L = math.hypot(dx, dy) or 1
    ux, uy = dx / L, dy / L
    bx, by = x + ux * s, y + uy * s
    px_, py_ = -uy * s, ux * s
    seat = [(x - s, y - s, z), (x + s, y - s, z), (x + s, y + s, z), (x - s, y + s, z)]
    backq = [(bx - px_, by - py_, z), (bx + px_, by + py_, z), (bx + px_, by + py_, back), (bx - px_, by - py_, back)]
    legs = "".join(line3((x + ex * s * .8, y + ey * s * .8, z), (x + ex * s * .8, y + ey * s * .8, 0), "--aqp-line", 1)
                   for ex, ey in ((-1, 1), (1, 1)))
    parts = [legs, face(seat, fill, LINE)]
    # Draw the back first if it is further away than the seat, after if nearer.
    if by < y:
        parts.insert(0, face(backq, side, LINE))
    else:
        parts.append(face(backq, side, LINE))
    return "".join(parts)


def stool_svg(x, y, z):
    return (line3((x, y, z), (x, y, 0), "--aqp-line", 2.2)
            + "".join(line3((x - 5 * math.cos(a), y - 5 * math.sin(a), 8), (x + 5 * math.cos(a), y + 5 * math.sin(a), 8),
                            "--aqp-line", 1) for a in (0, math.pi / 2))
            + face(disc(x, y, z - 2, 7, 14), "--aqp-col2", LINE)
            + face(disc(x, y, z, 7, 14), "--aqp-leather", LINE))


def long_seat_svg(t, room):
    """A settle or a sofa along the wall the table stands against."""
    x0, y0, x1, y1 = top_box(t)
    w = wall_of(t)
    sofa = t["seating"] == "sofa"
    z, back = (16, 32) if sofa else (17, 46)
    fill = "--aqp-leather" if sofa else "--aqp-col"
    if w == "north":
        bx0, bx1, by0, by1 = x0 - 6, x1 + 6, 0, y0 - 2
        seat = [(bx0, by0, z), (bx1, by0, z), (bx1, by1, z), (bx0, by1, z)]
        front = [(bx0, by1, 0), (bx1, by1, 0), (bx1, by1, z), (bx0, by1, z)]
        backq = [(bx0, 2, z), (bx1, 2, z), (bx1, 2, back), (bx0, 2, back)]
    elif w == "south":
        bx0, bx1, by0, by1 = x0 - 6, x1 + 6, y1 + 2, room["d"]
        seat = [(bx0, by0, z), (bx1, by0, z), (bx1, by1, z), (bx0, by1, z)]
        front = None
        backq = [(bx0, by1 - 2, z), (bx1, by1 - 2, z), (bx1, by1 - 2, back), (bx0, by1 - 2, back)]
    else:
        X = room["w"] if w == "east" else 0
        ax = x1 + 2 if w == "east" else 0
        bxx = X if w == "east" else x0 - 2
        by0, by1 = y0 - 6, y1 + 6
        seat = [(ax, by0, z), (bxx, by0, z), (bxx, by1, z), (ax, by1, z)]
        front = [(ax, by0, 0), (ax, by1, 0), (ax, by1, z), (ax, by0, z)]
        backq = [(X - 2 if w == "east" else 2, by0, z), (X - 2 if w == "east" else 2, by1, z),
                 (X - 2 if w == "east" else 2, by1, back), (X - 2 if w == "east" else 2, by0, back)]
    out = [face(backq, "--aqp-col2" if not sofa else "--aqp-leather2", LINE)]
    if front:
        out.append(face(front, "--aqp-col2", LINE))
    out.append(face(seat, fill, LINE))
    return "".join(out)


def table_svg(t, patch):
    h, top = t["h"], t["top"]
    out = []
    # The base first: a post and a foot, or four legs.
    if t["base"] == "pedestal":
        posts = [(t["x"], t["y"])]
        if t["shape"] == "long":
            posts = [(t["x"] - t["w"] * .3, t["y"]), (t["x"] + t["w"] * .3, t["y"])]
        for px, py in posts:
            out.append(face(disc(px, py, .5, max(8, min(t["w"], t.get("d", t["w"])) * .3), 16), "--aqp-col2", LINE))
            out.append(line3((px, py, 1), (px, py, h - top), "--aqp-line", max(2.4, 3.2 * FOC / (CAM[1] - py) / 3)))
    else:
        if t["shape"] == "round":
            r = t["w"] / 2 - 3
            legs = [(t["x"] + r * math.cos(a), t["y"] + r * math.sin(a)) for a in (.8, 2.4, 3.9, 5.5)]
        else:
            x0, y0, x1, y1 = top_box(t)
            legs = [(x0 + 2, y0 + 2), (x1 - 2, y0 + 2), (x1 - 2, y1 - 2), (x0 + 2, y1 - 2)]
        for px, py in legs:
            out.append(line3((px, py, 0), (px, py, h - top), "--aqp-line", 2.2))
    if t["shape"] == "round":
        edge = disc(t["x"], t["y"], h - top, t["w"] / 2, 28)
        topp = disc(t["x"], t["y"], h, t["w"] / 2, 28)
    else:
        x0, y0, x1, y1 = top_box(t)
        edge = [(x0, y1, h - top), (x1, y1, h - top), (x1, y1, h), (x0, y1, h)]
        topp = [(x0, y0, h), (x1, y0, h), (x1, y1, h), (x0, y1, h)]
    out.append(face(edge, "--aqp-edge", LINE))
    out.append(face(topp, "--aqp-top", LINE))
    if patch:
        out.append(face([(x, y, h + .1) for x, y in patch], "--aqp-light", 'opacity=".5"'))
    return "".join(out)


def bar_svg(d):
    bar = d["bar"]
    f = bar["front"]
    depth = bar["depth"]
    out = []
    # The back bar along the west wall, its shelf, and a few bottles on it.
    D = d["room"]["d"]
    out.append(face([(18, 20, 0), (18, D - 16, 0), (18, D - 16, 40), (18, 20, 40)], "--aqp-beam", LINE))
    out.append(face([(0, 20, 40), (18, 20, 40), (18, D - 16, 40), (0, D - 16, 40)], "--aqp-col2", LINE))
    for y, hh, fill in ((44, 12, "--aqp-glass"), (63, 9, "--aqp-sheen"), (101, 13, "--aqp-glass"),
                        (184, 10, "--aqp-sheen"), (262, 14, "--aqp-glass"), (279, 8, "--aqp-glass"),
                        (352, 11, "--aqp-sheen"), (423, 12, "--aqp-glass")):
        out.append(face([(9, y - 1.6, 40), (9, y + 1.6, 40), (9, y + 1.6, 40 + hh), (9, y - 1.6, 40 + hh)], fill))
    segs = []
    for i in range(len(f) - 1):
        (ax, ay), (bx, by) = f[i], f[i + 1]
        h = bar["heights"][i]
        parts = [face([(ax, ay, 0), (bx, by, 0), (bx, by, h), (ax, ay, h)], "--aqp-barfront", LINE),
                 face([(ax - depth, ay, h), (bx - depth, by, h), (bx, by, h), (ax, ay, h)], "--aqp-bartop", LINE)]
        for k in range(1, 4):
            u = k / 4
            px, py = ax + u * (bx - ax), ay + u * (by - ay)
            parts.append(line3((px, py, 3), (px, py, h - 3), "--aqp-line", .9))
        if h > 36:
            parts.append(line3((ax + 4, ay, 8), (bx + 4, by, 8), "--aqp-rim", 1.4))
        # Where the bar steps down, the end of the higher stretch shows.
        for j, (px, py) in ((i - 1, (ax, ay)), (i + 1, (bx, by))):
            if 0 <= j < len(bar["heights"]) and bar["heights"][j] < h:
                lo = bar["heights"][j]
                parts.append(face([(px, py, lo), (px - depth, py, lo), (px - depth, py, h), (px, py, h)], "--aqp-barfront", LINE))
        segs.append(((ay + by) / 2, "".join(parts)))
    out += [s for _, s in sorted(segs)]
    return "".join(out)


def beam_svg(y, room):
    W, C, b = room["w"], room["ceiling"], room["beam_bottom"]
    return (face([(0, y - 4, b), (W, y - 4, b), (W, y + 4, b), (0, y + 4, b)], "--aqp-beam2")
            + face([(0, y + 4, b), (W, y + 4, b), (W, y + 4, C), (0, y + 4, C)], "--aqp-beam", LINE))


def fan_svg(f, room):
    z = room["beam_bottom"] + 5
    x, y = f["x"], f["y"]
    out = []
    for k in range(4):
        a = math.radians(f["turn"] + 90 * k)
        ca, sa = math.cos(a), math.sin(a)
        r0, r1, wd = 3, f["span"] / 2, 2.6
        pts = [(x + r0 * ca - wd * sa, y + r0 * sa + wd * ca, z), (x + r1 * ca - wd * sa, y + r1 * sa + wd * ca, z),
               (x + r1 * ca + wd * sa, y + r1 * sa - wd * ca, z), (x + r0 * ca + wd * sa, y + r0 * sa - wd * ca, z)]
        out.append(face(pts, "--aqp-fan", LINE))
    out.append(face(disc(x, y, z + .5, 3.4, 12), "--aqp-iron", LINE))
    out.append(line3((x, y, z + .5), (x, y, room["ceiling"]), "--aqp-iron", 1.6))
    return "".join(out)


def room_svg(d):
    room = d["room"]
    tabs = {t["n"]: t for t in d["tables"]}
    lit = {}
    floor = []
    for (m, kind, target, pts, z) in patches(d):
        if kind == "table":
            lit[target] = pts
        elif max(y for _, y in pts) <= room["d"] - 84:
            floor.append(face([(x, y, .1) for x, y in pts], "--aqp-light", 'opacity=".38"'))
    # The frame is cropped to the band the room is in: above it is only the
    # underside of the nearest beams, and below it only the empty floor at
    # your feet.
    out = [f'<svg class="aqp-room__draw" viewBox="0 {CROP[0]} {W_PX} {CROP[1] - CROP[0]}" aria-hidden="true" focusable="false">']
    out += room_shell(d)
    out += [window_svg(w, room) for w in d["windows"]]
    out += [mirror_svg(m) for m in d["mirrors"]]
    out.append(door_svg(d))
    out += floor
    out.append(bar_svg(d))
    things = []
    for y in d["beams"]:
        things.append((y + 4, beam_svg(y, room)))
    for f in d["fans"]:
        things.append((f["y"], fan_svg(f, room)))
    for c in d["columns"]:
        things.append((c["y"], column_svg(c, d)))
    for t in d["tables"]:
        things.append((t["y"], table_svg(t, lit.get(t["n"]))))
        for x, y in seat_spots(t, room):
            things.append((y, chair_svg(x, y, t)))
        if t["seating"] in ("settle", "sofa"):
            yy = 0 if t.get("against") == "north" else (room["d"] if t.get("against") == "south" else t["y"] - .5)
            things.append((yy, long_seat_svg(t, room)))
    for at in d["bar"]["stools"]:
        x, y, _ = arc_point(d["bar"]["front"], at)
        things.append((y, stool_svg(x + 15, y, 30)))
    s = d["stove"]
    things.append(((s["y0"] + s["y1"]) / 2, stove_svg(d)))
    things.append((d["piano"]["y1"] / 2, piano_svg(d)))
    # What stands at the south end is round the seat the room is seen from,
    # and behind it: it is on the plan, and not in the view.
    near = room["d"] - 84
    for y, svg in sorted(things, key=lambda t: t[0]):
        if y <= near:
            out.append(svg)
    out.append("</svg>")
    return "".join(out)


# ── The plan by the door ─────────────────────────────────────────────────────

PX, PY = 30, 230     # where the room's north-west corner sits in the plan


def pp(x, y):
    return f"{n(PX + x)} {n(PY + y)}"


def prect(x0, y0, x1, y1, fill, extra=""):
    return (f'<rect x="{n(PX + x0)}" y="{n(PY + y0)}" width="{n(x1 - x0)}" height="{n(y1 - y0)}" '
            f'fill="var({fill})" {extra}/>')


def plan_svg(d, fx):
    room = d["room"]
    W, D = room["w"], room["d"]
    out = [f'<svg class="aqp-plan__draw" viewBox="0 0 {W + 2 * PX} {PY + D + 30}" aria-hidden="true" focusable="false">',
           f'<rect width="{W + 2 * PX}" height="{PY + D + 30}" fill="var(--aqp-floor)"/>']
    # Outside the door: the areaway, the steps and the ramp.
    out.append(prect(0, -190, W, 0, "--aqp-out"))
    out.append(f'<path d="M{pp(0, -190)} H{n(PX + W)}" stroke="var(--aqp-dim)" stroke-width="2"/>')
    st, rp = d["steps"], d["ramp"]
    sw, rw = st["width"], rp["width"]
    land = d["door"]["x0"] - 40          # the landing at the foot, outside the door
    r1, r2 = rp["runs"]
    flight = st["risers"] * st["tread"]
    out.append(prect(land, -rw, W, 0, "--aqp-plank"))
    # The steps, up from the landing to the street.
    out.append(prect(W - sw, -rw - flight, W, -rw, "--aqp-plank"))
    for k in range(st["risers"] + 1):
        yy = -rw - k * st["tread"]
        out.append(f'<path d="M{pp(W - sw, yy)} H{n(PX + W)}" stroke="var(--aqp-line)" stroke-width="1.4"/>')
    # The ramp: a run west from the landing, a landing to turn on, a run back
    # east, and a landing at the street. As wide as the steps.
    out.append(prect(land - r1["run"], -rw, land, 0, "--aqp-ramp"))
    out.append(prect(land - r1["run"] - rp["landing"], -2 * rw, land - r1["run"], 0, "--aqp-plank"))
    out.append(prect(land - r2["run"], -2 * rw, land, -rw, "--aqp-ramp"))
    out.append(prect(land, -190, W - sw, -rw, "--aqp-plank"))
    for yy in (0, -rw, -2 * rw):
        out.append(f'<path d="M{pp(land - r1["run"], yy)} H{n(PX + land)}" stroke="var(--aqp-rim)" stroke-width="2"/>')
    for k in range(6):
        cx = land - r1["run"] + 30 + k * 60
        for yy, sgn in ((-rw / 2, -1), (-1.5 * rw, 1)):
            out.append(f'<path d="M{pp(cx + 8 * sgn, yy - 9)} L{pp(cx - 8 * sgn, yy)} L{pp(cx + 8 * sgn, yy + 9)}" '
                       'fill="none" stroke="var(--aqp-dim)" stroke-width="1.6"/>')
    # The room.
    out.append(prect(0, 0, W, D, "--aqp-floor"))
    for (m, kind, target, pts, z) in patches(d):
        out.append(f'<path d="M{" L".join(pp(x, y) for x, y in pts)} Z" fill="var(--aqp-light)" opacity=".35"/>')
    bar = d["bar"]
    for q, h in zip(bar_quads(bar, with_zone=False), bar["heights"]):
        out.append(f'<path d="M{" L".join(pp(x, y) for x, y in q)} Z" fill="var({"--aqp-carve" if h <= 36 else "--aqp-beam"})" '
                   f'stroke="var(--aqp-line)" stroke-width="1"/>')
    out.append(prect(0, 20, 18, 404, "--aqp-beam"))
    for at in bar["stools"]:
        x, y, _ = arc_point(bar["front"], at)
        out.append(f'<circle cx="{n(PX + x + 15)}" cy="{n(PY + y)}" r="7" fill="var(--aqp-col)"/>')
    s, p = d["stove"], d["piano"]
    out.append(prect(s["x0"], s["y0"], s["x1"], s["y1"], "--aqp-iron"))
    out.append(prect(p["x0"], p["y0"], p["x1"], p["y1"], "--aqp-piano"))
    out.append(prect(*p["bench"], "--aqp-piano2"))
    for t in d["tables"]:
        for x, y in seat_spots(t, room):
            out.append(f'<rect x="{n(PX + x - 6)}" y="{n(PY + y - 6)}" width="12" height="12" rx="2" fill="var(--aqp-col2)"/>')
        if t["seating"] in ("settle", "sofa"):
            x0, y0, x1, y1 = top_box(t)
            w = wall_of(t)
            seat = "--aqp-leather" if t["seating"] == "sofa" else "--aqp-col"
            if w == "north":
                out.append(prect(x0 - 6, 0, x1 + 6, y0 - 2, seat))
            elif w == "south":
                out.append(prect(x0 - 6, y1 + 2, x1 + 6, D, seat))
            elif w == "east":
                out.append(prect(x1 + 2, y0 - 6, W, y1 + 6, seat))
            else:
                out.append(prect(0, y0 - 6, x0 - 2, y1 + 6, seat))
    for c in d["columns"]:
        out.append(f'<circle cx="{n(PX + c["x"])}" cy="{n(PY + c["y"])}" r="{n(c["d"] / 2)}" fill="var(--aqp-col)" '
                   'stroke="var(--aqp-carve)" stroke-width="2"/>')
    for t in d["tables"]:
        if t["shape"] == "round":
            shape = f'<circle class="aqp-plan__top" cx="{n(PX + t["x"])}" cy="{n(PY + t["y"])}" r="{n(t["w"] / 2)}"/>'
        else:
            x0, y0, x1, y1 = top_box(t)
            shape = (f'<rect class="aqp-plan__top" x="{n(PX + x0)}" y="{n(PY + y0)}" width="{n(x1 - x0)}" '
                     f'height="{n(y1 - y0)}" rx="2"/>')
        out.append(f'<g data-pint-spot="{t["n"]}">{shape}<text class="aqp-plan__n" x="{n(PX + t["x"])}" '
                   f'y="{n(PY + t["y"] + 5)}" text-anchor="middle" fill="currentColor">{t["n"]}</text></g>')
    # The walls, the windows in the street wall, the mirrors and the door.
    out.append(f'<rect x="{PX}" y="{PY}" width="{W}" height="{D}" fill="none" stroke="var(--aqp-dim)" stroke-width="4"/>')
    for w in d["windows"]:
        out.append(f'<path d="M{pp(w["x"], 0)} H{n(PX + w["x"] + w["w"])}" stroke="var(--aqp-street)" stroke-width="6"/>')
    for m in d["mirrors"]:
        a, b = m["at"] - m["w"] / 2, m["at"] + m["w"] / 2
        if m["wall"] == "north":
            seg = f"M{pp(a, 5)} H{n(PX + b)}"
        else:
            x = 5 if m["wall"] == "west" else W - 5
            seg = f"M{pp(x, a)} V{n(PY + b)}"
        out.append(f'<path d="{seg}" stroke="var(--aqp-sea)" stroke-width="4"/>')
    dr = d["door"]
    out.append(f'<path d="M{pp(dr["x0"], 0)} H{n(PX + dr["x1"])}" stroke="var(--aqp-floor)" stroke-width="6"/>')
    out.append(f'<path d="M{pp(dr["x0"], 0)} L{pp(dr["x0"], -(dr["x1"] - dr["x0"]))} '
               f'A{dr["x1"] - dr["x0"]} {dr["x1"] - dr["x0"]} 0 0 1 {pp(dr["x1"], 0)}" fill="none" '
               'stroke="var(--aqp-dim)" stroke-width="1.6"/>')
    out.append("</svg>")
    return "".join(out)


# ── Your table, looking down ─────────────────────────────────────────────────

SLOTS = [(330, 262), (580, 214), (830, 262), (600, 410)]
ITEM_W, ITEM_H = 230, 172


def table_view(d):
    holds = d["table_holds"]
    out = [f'<svg class="aqp-table__draw" viewBox="0 0 {W_PX} {H_PX}" data-table data-table-holds="{holds}" '
           'aria-hidden="true" focusable="false">',
           f'<rect width="{W_PX}" height="{H_PX}" fill="var(--aqp-floor)"/>',
           f'<path d="M60 60 H1140 Q1180 60 1180 100 V560 Q1180 600 1140 600 H60 Q20 600 20 560 V100 Q20 60 60 60 Z" '
           f'fill="var(--aqp-top)" {LINE}/>']
    for k, y in enumerate(range(96, 580, 34)):
        wob = 6 + (k * 7) % 11
        out.append(f'<path d="M40 {y} C340 {y - wob} 760 {y + wob} 1160 {y - 3}" fill="none" stroke="var(--aqp-grain)" '
                   'stroke-width="2"/>')
    out.append('<path d="M20 548 H1180 V560 Q1180 600 1140 600 H60 Q20 600 20 560 Z" fill="var(--aqp-edge)"/>')
    # The patch of the street's light from a mirror, lying across the boards.
    out.append('<path d="M640 84 L960 84 L870 470 L550 470 Z" fill="var(--aqp-light)" opacity=".22"/>')
    for cx, cy, r in ((250, 470, 62), (1010, 150, 54)):
        out.append(f'<ellipse cx="{cx}" cy="{cy}" rx="{r}" ry="{r * .62:.0f}" fill="var(--aqp-mat)"/>')
        out.append(f'<ellipse cx="{cx}" cy="{cy}" rx="{r - 9}" ry="{(r - 9) * .62:.0f}" fill="none" '
                   'stroke="var(--aqp-sea)" stroke-width="2"/>')
    out.append('<g class="aqp-table__things">')
    for i, (x, y) in enumerate(SLOTS[:holds]):
        out.append(f'<g data-slot="{i}" data-x="{x - ITEM_W // 2}" data-y="{y - ITEM_H // 2}" '
                   f'data-w="{ITEM_W}" data-h="{ITEM_H}"></g>')
    out.append('</g></svg>')
    return "".join(out)


# ── What comes to your table ─────────────────────────────────────────────────

def svg_item(body, key):
    return (f'<svg class="aqp-item__draw" data-table-draw="{attr(key)}" viewBox="0 0 120 90" aria-hidden="true" '
            f'focusable="false">{body}</svg>')


def pint_svg(look):
    """A pint glass with a bulge near the top, on a beer mat. Both pours of a
    pint are this one drawing, so they cannot look different."""
    return (f'<ellipse cx="60" cy="84" rx="31" ry="4.5" fill="var(--aqp-mat)"/>'
            f'<path d="M45 82 L41 26 L79 26 L75 82 Z" fill="var({look["drink"]})"/>'
            f'<path d="M40.6 26 L40 17 L80 17 L79.4 26 Z" fill="var({look["head"]})"/>'
            f'<path d="M45 83 L40 20 Q39 14 41.5 9 L78.5 9 Q81 14 80 20 L75 83 Z" fill="none" stroke="var(--aqp-rim)" '
            f'stroke-width="2.2" stroke-linejoin="round"/>')


def glass_svg(g):
    v = g["vessel"]
    if v == "tall":
        return ('<ellipse cx="60" cy="84" rx="26" ry="4" fill="var(--aqp-mat)"/>'
                '<path d="M46 82 L44 18 L76 18 L74 82 Z" fill="var(--aqp-lemon)"/>'
                '<rect x="49" y="24" width="10" height="10" rx="2" fill="var(--aqp-cube)"/>'
                '<rect x="61" y="30" width="10" height="10" rx="2" fill="var(--aqp-cube)"/>'
                '<rect x="52" y="40" width="10" height="10" rx="2" fill="var(--aqp-cube)"/>'
                '<circle cx="77" cy="18" r="9" fill="var(--aqp-cider)" stroke="var(--aqp-rim)" stroke-width="1.6"/>'
                '<path d="M46 83 L43 10 L77 10 L74 83 Z" fill="none" stroke="var(--aqp-rim)" stroke-width="2.2" '
                'stroke-linejoin="round"/>')
    if v == "pot":
        return ('<ellipse cx="46" cy="84" rx="30" ry="4" fill="var(--aqp-mat)"/>'
                '<path d="M20 56 Q20 34 46 34 Q72 34 72 56 Q72 80 46 80 Q20 80 20 56 Z" fill="var(--aqp-glaze)" '
                'stroke="var(--aqp-line)" stroke-width="1.6"/>'
                '<path d="M71 50 Q86 46 90 34" fill="none" stroke="var(--aqp-glaze)" stroke-width="5" stroke-linecap="round"/>'
                '<path d="M21 46 Q8 52 21 66" fill="none" stroke="var(--aqp-glaze)" stroke-width="4"/>'
                '<path d="M36 34 Q46 24 56 34 Z" fill="var(--aqp-glaze)" stroke="var(--aqp-line)" stroke-width="1.4"/>'
                '<path d="M86 66 H112 L108 82 H90 Z" fill="var(--aqp-glaze)" stroke="var(--aqp-line)" stroke-width="1.4"/>'
                '<ellipse cx="99" cy="66" rx="13" ry="3" fill="var(--aqp-stout)"/>')
    return ('<ellipse cx="54" cy="84" rx="40" ry="4.5" fill="var(--aqp-mat)"/>'
            '<path d="M26 82 L22 30 Q30 18 50 22 L54 30 L50 82 Z" fill="var(--aqp-water)" opacity=".8"/>'
            '<path d="M26 83 L21 26 Q30 14 52 18 L56 28 L51 83 Z" fill="none" stroke="var(--aqp-rim)" stroke-width="2.2" '
            'stroke-linejoin="round"/>'
            '<path d="M50 34 Q62 40 52 60" fill="none" stroke="var(--aqp-rim)" stroke-width="3"/>'
            '<path d="M72 82 L70 46 L94 46 L92 82 Z" fill="var(--aqp-water)" opacity=".8"/>'
            '<path d="M72 83 L69 40 L95 40 L92 83 Z" fill="none" stroke="var(--aqp-rim)" stroke-width="2"/>')


def food_svg(x):
    look = x["look"]
    if "chip" in look:
        chips = "".join(
            f'<path d="M{a} {b} L{a + 4} {b - 2} L{a + 14} {b + 22} L{a + 10} {b + 24} Z" fill="var({look["chip"]})" '
            f'stroke="var(--aqp-line)" stroke-width=".8"/>'
            for a, b in ((32, 30), (44, 24), (54, 28), (64, 22), (72, 30), (40, 38), (60, 36), (80, 34)))
        return ('<ellipse cx="60" cy="80" rx="46" ry="9" fill="var(--aqp-plate)" stroke="var(--aqp-line)" stroke-width="1.4"/>'
                f'{chips}'
                '<path d="M26 52 L32 80 Q60 88 88 80 L94 52 Z" fill="var(--aqp-glaze)" stroke="var(--aqp-line)" stroke-width="1.4"/>')
    return ('<ellipse cx="60" cy="72" rx="54" ry="14" fill="var(--aqp-plate)" stroke="var(--aqp-line)" stroke-width="1.4"/>'
            '<path d="M24 66 Q60 76 96 66 L94 58 Q60 66 26 58 Z" fill="var(--aqp-bread)" stroke="var(--aqp-line)" stroke-width="1.2"/>'
            f'<path d="M24 58 Q60 66 96 58 L98 50 Q60 58 22 50 Z" fill="var({look["filling"]})"/>'
            '<path d="M28 50 Q36 46 44 51 Q52 47 60 52 Q68 47 76 51 Q84 46 92 50" fill="none" stroke="var(--aqp-onion)" stroke-width="2.4"/>'
            '<path d="M24 50 Q20 26 60 22 Q100 26 96 50 Q60 56 24 50 Z" fill="var(--aqp-bread)" stroke="var(--aqp-line)" stroke-width="1.4"/>'
            '<path d="M44 34 L48 33 M60 30 L64 30 M72 35 L76 36" stroke="var(--aqp-crumb)" stroke-width="2" stroke-linecap="round"/>')


def order_btn(key, name):
    return (f'<button type="button" class="aqp-btn" data-table-order="{attr(key)}" data-table-name="{attr(name)}" hidden>'
            f'Order it</button> <span class="aqp-said" data-table-said aria-hidden="true" hidden></span>')


def pint_card(p):
    pours = []
    for q in p["pours"]:
        key = f'{p["key"]}{q["key"]}'
        what = p["name"][0].lower() + p["name"][1:]
        name = f'an alcohol-free pint of {what}' if q["key"] == "free" else f'a {q["label"]} pint of {what}'
        pours.append(f'          <div class="aqp-pour">\n'
                     f'            {svg_item(pint_svg(p["look"]), key)}\n'
                     f'            <p class="aqp-pour__label">{esc(q["strength"])}</p>\n'
                     f'            <p class="aqp-pour__how">{esc(q["how"])}</p>\n'
                     f'            <p class="aqp-item__go">{order_btn(key, name)}</p>\n'
                     f'          </div>')
    return (f'        <li class="aqp-item aqp-item--pint" id="aqp-item-{p["key"]}">\n'
            f'          <h4 class="aqp-item__name">{esc(p["name"])}</h4>\n'
            f'          <div class="aqp-pours">\n' + "\n".join(pours) + '\n          </div>\n'
            f'          <p class="aqp-item__what"><span class="sr">In it: </span>{esc(p["what"])}</p>\n'
            f'          <p class="aqp-item__has">{esc(hgc.contains(p))} {esc(pekoe.CAFFEINE_SAYS[caffeine(p["what"])])}</p>\n'
            f'          <p class="aqp-item__note">{esc(p["note"])}</p>\n'
            '        </li>')


def plain_card(x, draw):
    lines = [f'<p class="aqp-item__what"><span class="sr">In it: </span>{esc(x["what"])}</p>']
    has = hgc.contains(x)
    caf = caffeine(x["what"])
    lines.append(f'<p class="aqp-item__has">{esc(has)}{" " + esc(pekoe.CAFFEINE_SAYS[caf]) if caf else ""}</p>')
    if x.get("note"):
        lines.append(f'<p class="aqp-item__note">{esc(x["note"])}</p>')
    name = x["name"][0].lower() + x["name"][1:] if x["name"].startswith(("A ", "The ")) else x["name"].lower()
    return (f'        <li class="aqp-item" id="aqp-item-{x["key"]}">\n'
            f'          {svg_item(draw, x["key"])}\n'
            f'          <h4 class="aqp-item__name">{esc(x["name"])}</h4>\n'
            f'          ' + "\n          ".join(lines) + '\n'
            f'          <p class="aqp-item__go">{order_btn(x["key"], name)}</p>\n'
            '        </li>')


def menu_block(d):
    out = ['    <section class="aqp-board" aria-labelledby="aqp-pints-h">',
           '      <h3 id="aqp-pints-h">Pints</h3>',
           '      <p class="aqp-board__lede">Every pint comes two ways, and <strong>the alcohol-free one is first, in the '
           'same glass, at the same size</strong>: you cannot tell from across the room which one anybody has, and '
           'nobody here asks. Each says how strong it is before you order it.</p>',
           '      <ul class="aqp-items">']
    out += [pint_card(p) for p in d["pints"]]
    out += ['      </ul>', '    </section>',
            '    <section class="aqp-board" aria-labelledby="aqp-glasses-h">',
            '      <h3 id="aqp-glasses-h">Not brewed</h3>',
            '      <ul class="aqp-items">']
    out += [plain_card(g, glass_svg(g)) for g in d["glasses"]]
    out += ['      </ul>', '    </section>',
            '    <section class="aqp-board" aria-labelledby="aqp-stove-h">',
            '      <h3 id="aqp-stove-h">From the stove</h3>',
            '      <p class="aqp-board__lede">Cooked on the iron top of a wood-burning stove with its door shut. The vegan '
            'sandwich comes first and is the same size.</p>',
            '      <ul class="aqp-items">']
    out += [plain_card(x, food_svg(x)) for x in d["stove_food"]]
    out += ['      </ul>', '    </section>']
    return "\n".join(out)


# ── The piano's rolls ────────────────────────────────────────────────────────

def roll_svg(r, i):
    """A roll on its spool, with its paper hanging down, and the holes in it.
    The holes are a picture of holes, not the music: no two rolls are drawn
    alike, and nothing here claims to be a transcription."""
    seed = sum(ord(ch) for ch in r["key"])
    out = ['<svg class="aqp-roll__draw" viewBox="0 0 120 90" aria-hidden="true" focusable="false">',
           '<path d="M24 34 H96 V84 L90 80 L84 84 L78 80 L72 84 L66 80 L60 84 L54 80 L48 84 L42 80 L36 84 L30 80 L24 84 Z" '
           'fill="var(--aqp-plate)" stroke="var(--aqp-line)" stroke-width="1.2" stroke-linejoin="round"/>']
    for row in range(6):
        for col in range(12):
            if (seed + row * 7 + col * (3 + i)) % 5 < 2:
                x, y = 28 + col * 5.6, 42 + row * 6.2
                ln = 2 + (seed + col + row) % 3 * 1.6
                out.append(f'<rect x="{n(x)}" y="{n(y)}" width="2.2" height="{n(ln)}" rx="1" fill="var(--aqp-line)"/>')
    out.append('<rect x="18" y="20" width="84" height="16" rx="8" fill="var(--aqp-plate)" stroke="var(--aqp-line)" '
               'stroke-width="1.2"/>')
    out.append('<path d="M24 22 V34 M30 22 V34" stroke="var(--aqp-crumb)" stroke-width="1.4"/>')
    out.append('<rect x="8" y="22" width="12" height="12" rx="3" fill="var(--aqp-col)" stroke="var(--aqp-line)" stroke-width="1.2"/>')
    out.append('<rect x="100" y="22" width="12" height="12" rx="3" fill="var(--aqp-col)" stroke="var(--aqp-line)" stroke-width="1.2"/>')
    out.append('<rect x="48" y="52" width="24" height="12" rx="2" fill="var(--aqp-sea)"/>')
    out.append('</svg>')
    return "".join(out)


def by_words(r):
    return " and ".join(f'{c["name"]} ({c["born"]}–{c["died"]})' for c in r["by"])


def rolls_block(d):
    out = ['    <ul class="aqp-rolls">']
    for i, r in enumerate(d["rolls"]):
        title = r["title"] + (f' ({r["written"]})' if r.get("written") else "")
        name = f'{r["title"]}, by {" and ".join(c["name"] for c in r["by"])}, on the pub’s player piano'
        lines = [f'<p class="aqp-roll__by">By {esc(by_words(r))}.</p>',
                 f'<p class="aqp-roll__what">{esc(r["roll"])}.</p>']
        if r.get("heard"):
            lines.append(f'<p class="aqp-roll__heard">{esc(r["heard"])}</p>')
        lines.append(f'<p class="aqp-roll__src"><a href="https://commons.wikimedia.org/wiki/{attr(r["file"].replace(" ", "_"))}">'
                     f'Its page on Wikimedia Commons</a>: {esc(r["licence"])}.</p>')
        out.append(f'      <li class="aqp-roll" id="aqp-roll-{r["key"]}">\n'
                   f'        {roll_svg(r, i)}\n'
                   f'        <h3 class="aqp-roll__title">{esc(title)}</h3>\n'
                   f'        ' + "\n        ".join(lines) + '\n'
                   f'        <button type="button" class="facade facade--audio aqp-play" data-audio-src="{attr(r["src"])}" '
                   f'data-embed-title="{attr(name)}">Press to play &middot; {esc(r["runtime"])}</button>\n'
                   '      </li>')
    out.append('    </ul>')
    return "\n".join(out)


# ── The tables in words, and the plan ────────────────────────────────────────

SHAPE_WORDS = {"round": "Round", "square": "Square", "long": "Long"}


def size_words(t):
    if t["shape"] == "round":
        return f'{t["w"]} inches across'
    if t["shape"] == "square":
        return f'{t["w"]} inches square'
    return f'{t["w"]} by {t["d"]} inches'


def seat_words(t):
    k = WORDS[t["seats"]]
    return {
        "stools": f"{k} tall stools",
        "chairs": f"{k} chairs",
        "armchairs": f"{k} armchairs in the room's old sea-green leather",
        "settle": f"a settle along the wall, and chairs on the other side, for {k}",
        "sofa": f"a sofa along the wall, in the room's old sea-green leather, for {k}",
    }[t["seating"]]


def table_item(t, f, d):
    bits = [f'{SHAPE_WORDS[t["shape"]]}, {size_words(t)} and {t["h"]} inches high, '
            f'{"on one post" if t["base"] == "pedestal" and t["shape"] != "long" else ("on two posts" if t["base"] == "pedestal" else "on four legs")}, '
            f'with {seat_words(t)}.']
    if f["roll"]:
        bits.append(f'Room under it for a wheelchair or your knees: {n(t["h"] - t["top"])} inches underneath.')
    elif 28 <= t["h"] <= 34:
        bits.append("At dining height, but its four legs leave no room for a wheelchair under it.")
    if t.get("against"):
        bits.append(f'Against the {t["against"]} wall{", under a window" if f["window"] else ""}.')
    if f["column"]:
        bits.append(f'By the column carved with {f["column"]["tale"]}.')
    if "warm" in f["has"]:
        bits.append("By the stove, where it is warm.")
    if f["piano"]:
        bits.append("By the piano.")
    if "unseen" in f["has"]:
        bits.append("Out of sight of the door.")
    if "quiet" in f["has"]:
        bits.append("Away from the bar.")
    bits.append("A patch of light from a mirror lies on it." if "light" in f["has"] else "No light lands on it.")
    has = " ".join(k for k, _ in WANTS if k in f["has"])
    return (f'      <li class="aqp-tab" id="aqp-table-{t["n"]}" data-pint-table="{t["n"]}" data-pint-has="{has}">\n'
            f'        <h3 class="aqp-tab__name">Table {t["n"]}</h3>\n'
            f'        <p class="aqp-tab__what">{esc(" ".join(bits))}</p>\n'
            f'        <p class="aqp-tab__go"><button type="button" class="aqp-btn aqp-btn--quiet" data-pint-sit="{t["n"]}" '
            f'hidden>Sit at table {t["n"]}</button> <span class="aqp-said" data-pint-said aria-hidden="true" hidden></span></p>\n'
            '      </li>')


def finder_block(d, fx):
    for key, label in WANTS:
        if not any(key in f["has"] for f in fx.values()):
            refuse(f"no table is {label.lower()!r}, so that box would match nothing. A box you can tick that "
                   "finds nothing is a dead control.")
    boxes = "\n".join(
        f'          <li><label class="aqp-want__opt"><input type="checkbox" value="{k}" data-pint-want> {esc(lab)}</label></li>'
        for k, lab in WANTS)
    out = ['    <div class="aqp-plan">',
           '      ' + plan_svg(d, fx),
           '    </div>',
           '    <fieldset class="aqp-want" data-pint-finder hidden>',
           '      <legend>Tick what you want from a table, and the list keeps the tables that have all of it</legend>',
           '      <ul class="aqp-want__list">',
           boxes,
           '      </ul>',
           '      <p class="aqp-found" data-pint-found aria-hidden="true" hidden></p>',
           '    </fieldset>',
           '    <ol class="aqp-tables">']
    out += [table_item(t, fx[t["n"]], d) for t in sorted(d["tables"], key=lambda t: t["n"])]
    out.append('    </ol>')
    return "\n".join(out)


def columns_block(d, fx):
    by = {}
    for t in d["tables"]:
        c = fx[t["n"]]["column"]
        if c:
            by.setdefault(c["key"], []).append(t["n"])
    out = ['    <ul class="aqp-cols">']
    for c in sorted(d["columns"], key=lambda c: (c["y"], c["x"])):
        near = by.get(c["key"])
        tail = ""
        if near:
            near = sorted(near)
            tail = (f' Table {near[0]} is by it.' if len(near) == 1
                    else f' Tables {listify([str(k) for k in near])} are by it.')
        out.append(f'      <li class="aqp-col"><b class="aqp-col__tale">{esc(c["tale"])}</b>: {esc(c["carved"])}.{esc(tail)}</li>')
    out.append('    </ul>')
    return "\n".join(out)


# ── The sentences with numbers in them, written from the data ────────────────

ADA = "https://www.access-board.gov/ada/#ada-"


def sec(k, label=None):
    return f'<a href="{ADA}{k.split(".")[0]}">{label or k}</a>'


def ways_block(d):
    return ('    <p class="aqp-ways"><strong>Every table at dining height that stands on posts rather than legs has room '
            'under it for a wheelchair or your knees</strong>: between 28 and 34 inches high, with at least 27 inches '
            f'underneath ({sec("902.3")}, {sec("306.3")}). <strong>And every table can be reached from the door by a way '
            f'at least {CLEAR} inches wide</strong> ({sec("403.5.1")}), round every column and every chair, which the '
            "room’s own tool walks on a grid every time it builds this page, and refuses the page if one cannot.</p>")


def bar_block(d):
    bar = d["bar"]
    lens = seg_lengths(bar["front"])
    low = [(lens[i], h) for i, h in enumerate(bar["heights"]) if h <= 36]
    L, h = max(low)
    return (f'    <p class="aqp-ways"><strong>The bar dips to {h} inches for {int(L)} inches of its length</strong>, with no '
            f'stool in front of it, so anybody sitting down can be served there ({sec("904.4.1")}).</p>')


def parts_block(d):
    room, st, rp = d["room"], d["steps"], d["ramp"]
    runs = rp["runs"]
    slope = runs[0]["run"] // runs[0]["rise"]
    return (f'    <p><strong>Here there is a ramp beside the steps, as wide as they are</strong>, {rp["width"]} inches, and '
            f'longer, because {room["below_street"]} inches is a long way down at one in {slope}: '
            f'{WORDS[len(runs)]} runs, a landing to turn on, handrails on both sides, and a landing at the door '
            f'({sec("405")}, {sec("505")}). The steps are {st["risers"]} of them, each '
            f'{n(room["below_street"] / st["risers"])} inches high on an {st["tread"]}-inch tread ({sec("504.2")}).</p>\n'
            f'    <p><strong>The ceiling is still low, and the fans turn in the bays between the beams</strong>, above the '
            f'beams’ line, so the lowest thing over the floor is a beam, {room["beam_bottom"]} inches up '
            f'({sec("307.4")}). Nothing in here hangs where anybody walks, however tall.</p>')


# ── The words the room owes ──────────────────────────────────────────────────

def quote_block(q, d):
    b = d["books"][q["book"]]
    return (f'    <figure class="aqp-quote">\n'
            f'      <blockquote><p>{esc(q["words"])}</p></blockquote>\n'
            f'      <figcaption>Jim Butcher, <cite><a href="https://openlibrary.org/works/{b["ol"]}">{esc(b["title"])}</a></cite> '
            f'({esc(b["series"])}, {b["year"]}), pages {esc(q["pages"])} of the Kindle edition Ryan Boren quoted from.'
            f'</figcaption>\n'
            '    </figure>')


def third_block(d):
    tp = d["third_places"]
    items = "".join(f"<li>{esc(w)}</li>" for w in tp["list"])
    return (f'    <figure class="aqp-quote aqp-quote--third">\n'
            f'      <blockquote><ol class="aqp-third">{items}</ol></blockquote>\n'
            f'      <figcaption>The characteristics of third places, from <a href="{attr(tp["source_url"])}">'
            f'{esc(tp["source"])}</a>, a video on YouTube, as quoted on our own '
            f'<a href="{attr(tp["page"])}">Third Places</a> page, which is where we read them.</figcaption>\n'
            '    </figure>\n'
            f'    <figure class="aqp-quote aqp-quote--third">\n'
            f'      <blockquote><p>{esc(tp["radical"])}</p></blockquote>\n'
            f'      <figcaption>The same video, quoted on the same page.</figcaption>\n'
            '    </figure>')


def liner_sources(d):
    a, o = d["sources"]["ada"], d["sources"]["oldenburg"]
    books = d["books"]
    rows = []
    for key in ("storm-front", "proven-guilty", "small-favor", "cold-days"):
        b = books[key]
        rows.append((f"The pub this one is made like, from {b['title']}",
                     f'Jim Butcher, <a href="https://openlibrary.org/works/{b["ol"]}">{esc(b["title"])}</a> '
                     f'({esc(b["series"])}, {b["year"]}). Every quotation in the room was read off Ryan Boren’s '
                     'Kindle copy, as he quoted it, 2026-10-05, and not checked against a printed one'))
    rows.append(("Ale served at cellar temperature, never cold, and lemonade with lemonade ice",
                 "Mac’s, in Proven Guilty and Small Favor; the words on the board are ours"))
    rows.append(("The ramp, the steps, the ways between the tables, the tables you can roll under, the bar’s low "
                 "stretch and the height of the beams",
                 f'<a href="{attr(a["url"])}">{esc(a["title"])}</a>, {esc(a["by"])}, read {esc(a["read"])}: '
                 '405 and 505 for the ramp, 504.2 for the steps, 403.5.1 for the ways, 902.3 and 306.3 for the '
                 'tables, 904.4.1 for the bar, 307.4 for the beams, 304.3.1 for somewhere to turn round'))
    rows.append(("That third place is Ray Oldenburg’s term",
                 f'<a href="{attr(o["url"])}">{esc(o["title"])}</a>, {esc(o["by"])}, read {esc(o["read"])}. '
                 + esc(o["for"].split(". ", 1)[1])))
    tp = d["third_places"]
    rows.append(("The characteristics of third places, and radical third places",
                 f'Our own <a href="{attr(tp["page"])}">Third Places</a> page, quoting '
                 f'<a href="{attr(tp["source_url"])}">{esc(tp["source"])}</a>; checked against the Knowledge System’s '
                 'copy of our page on every build'))
    links = [f'<a href="https://commons.wikimedia.org/wiki/{attr(r["file"].replace(" ", "_"))}">{esc(r["title"])}</a>'
             for r in d["rolls"]]
    rows.append(("The rolls on the player piano",
                 "Recordings of piano rolls on Wikimedia Commons, each public domain on its own page, chosen on "
                 "2026-10-06 and streamed from there, never hosted here: " + ", ".join(links[:-1]) + " and " + links[-1]
                 + ". Every composer’s years were read on Wikipedia, and every runtime measured off the file"))
    rows.append(("Allergens and caffeine on every card",
                 'Worked out by the same engines as <a href="hey-good-cookin.html">Hey, Good Cookin’</a>, '
                 '<a href="pekoe-and-purrs.html">Pekoe and Purrs</a> and <a href="truckin-food-court.html">the Truck '
                 'Stop</a>, from what is in each thing'))
    return "\n".join(f'      <tr><td>{esc(w)}</td><td>{src}</td></tr>' for w, src in rows)


# ── The page as written ──────────────────────────────────────────────────────

def code_of(path):
    c = re.sub(r"/\*.*?\*/", " ", path.read_text(), flags=re.S)
    return re.sub(r"(?m)^\s*//[^\n]*", " ", c)


def check_page(d):
    src = PAGE.read_text()
    for want, why in (('src="table.js"', "it does not load table.js, which puts things on your table"),
                      ('src="pint.js"', "it does not load pint.js, which finds you a table"),
                      ('src="quest.js"', "it does not load quest.js"),
                      ('href="index.html"', "it has no way back to the street"),
                      ('data-table-says', "it has no live region"),
                      ('data-tell-fetch', "the choice of fetching or having it brought is gone"),
                      ('data-tell-bring', "the choice of fetching or having it brought is gone")):
        if want not in src:
            refuse(f"{PAGE.name}: {why}.")
    for m in re.finditer(r"<iframe|<video|data-embed-id|data-embed-src|data-rack-", src):
        refuse(f"{PAGE.name}: {m.group(0)!r}. Nothing behind the bar has a screen: that is the homage. The "
               "friendly edit is a telly over the bar with a rack of pub films. The piano's rolls are a strip, "
               "played by love-embed.js's audio builder.")
    origins = audio_origins()
    for m in re.finditer(r'class="facade[^"]*"[^>]*>', src):
        tag = m.group(0)
        if "facade--audio" not in tag:
            refuse(f"{PAGE.name}: a facade that is not a strip of audio. Nothing here has a screen.")
        a = re.search(r'data-audio-src="([^"]+)"', tag)
        if not a or not any(html.unescape(a.group(1)).startswith(o) for o in origins):
            refuse(f"{PAGE.name}: a roll whose recording is not from an origin in AUDIO_ORIGINS.")
    if 'class="facade' in src and 'src="love-embed.js"' not in src:
        refuse(f"{PAGE.name} has rolls and does not load love-embed.js, so every roll would press and play nothing.")
    for q in d["quotes"]:
        if f"<!-- aqp:quote:{q['key']}:begin -->" not in src:
            refuse(f"{PAGE.name} has no place for the quotation {q['key']!r}.")
    for k in re.findall(r"<!-- aqp:quote:([a-z]+):begin -->", src):
        if k not in {q["key"] for q in d["quotes"]}:
            refuse(f"{PAGE.name} has a place for a quotation {k!r} the data file does not have.")
    plain = re.sub(r"<!-- quest:[\w-]+:begin -->.*?<!-- quest:[\w-]+:end -->", " ", src, flags=re.S)
    plain = re.sub(r"<!-- signoff:begin -->.*?<!-- signoff:end -->", " ", plain, flags=re.S)
    plain = re.sub(r"<script\b.*?</script>", " ", plain, flags=re.S)
    plain = re.sub(r"<!--.*?-->", " ", plain, flags=re.S)
    plain = re.sub(r"<blockquote\b.*?</blockquote>", " ", plain, flags=re.S)
    plain = re.sub(r"<figcaption\b.*?</figcaption>", " ", plain, flags=re.S)
    sweep(plain, PAGE.name)
    house = re.sub(r"<section[^>]*data-aqp-homage.*?</section>", " ", plain, flags=re.S)
    house = re.sub(r'<section[^>]*id="aqp-whose".*?</section>', " ", house, flags=re.S)
    house = re.sub(r"<header\b.*?</header>", " ", house, flags=re.S)
    house = re.sub(r"<title>.*?</title>|<meta[^>]*>", " ", house, flags=re.S)
    sweep(house, f"{PAGE.name} (the house's own voice)",
          [(WORLD, "Jim Butcher's invented world in the house's own voice. Outside the section that quotes him "
                   "and the credits, no wizard drinks here and nothing is magic: Sithen's rule about living "
                   "authors' worlds.")])
    js = code_of(SCRIPT)
    if re.search(r"localStorage|sessionStorage|indexedDB|document\.cookie|fetch\(|XMLHttpRequest|sendBeacon|"
                 r"innerHTML|outerHTML|insertAdjacentHTML", js):
        refuse(f"{SCRIPT.name} stores, sends or writes HTML. Finding a table keeps nothing and sends nothing.")
    if "data-table-tell" not in TABLE.read_text():
        refuse(f"{TABLE.name} has lost data-table-tell, which says how your order reached you.")
    if re.search(r"localStorage|sessionStorage|indexedDB|document\.cookie|fetch\(|XMLHttpRequest|sendBeacon",
                 code_of(TABLE)):
        refuse(f"{TABLE.name} stores or sends something. What is on your table lives in the page.")
    street = STREET.read_text()
    if 'href="a-quiet-pint.html"' not in street:
        refuse("index.html has no door for the pub, so nobody on the street can find it.")


def section_css():
    css = CSS.read_text()
    m = re.search(rf"/\* §{SECTION} ── ROOM: A Quiet Pint.*?(?=/\* §\d+ ── )", css, re.S)
    if not m:
        refuse(f"love.css has no §{SECTION} for A Quiet Pint, followed by another section.")
        return
    body = re.sub(r"/\*.*?\*/", " ", m.group(0), flags=re.S)
    if re.search(r"#[0-9a-fA-F]{3,6}\b|rgba?\(", body):
        refuse(f"love.css §{SECTION} has a literal colour in it; the room's colours are --aqp- custom properties.")
    if re.search(r"@keyframes|animation\s*:", body):
        refuse(f"love.css §{SECTION} animates something. Nothing in the pub moves, the fans included, at any "
               "setting: the friendly edit is to spin them at MAX, and turning blades are Stay Breezy's.")
    if re.search(r"transform\s*:\s*(?:rotate|skew)", body):
        refuse(f"love.css §{SECTION} tilts something.")
    root = css[css.index(":root {"):css.index("\n}", css.index(":root {"))]
    root = re.sub(r"/\*.*?\*/", " ", root, flags=re.S)
    for name in sorted(set(re.findall(r"var\((--aqp-[\w-]+)\)", (PAGE.read_text() + json.dumps(json.loads(DATA.read_text()))
                                                                + m.group(0) + Path(__file__).read_text())))):
        if not re.search(rf"{re.escape(name)}\s*:", root):
            refuse(f"{name} is used and not declared in :root. CSS drops it and paints nothing.")


def main():
    d = json.loads(DATA.read_text())
    setup(d)
    check_geometry(d)
    check_menu(d)
    check_words(d)
    check_columns(d)
    check_rolls(d)
    for r in d.get("rolls") or []:
        words = " ".join(str(r.get(f, "")) for f in ("title", "roll", "heard"))
        sweep(words, f"{DATA.name}, roll {r.get('key')!r}")
        sweep(words, f"{DATA.name}, roll {r.get('key')!r}", [(WORLD, "Jim Butcher's invented world on a roll.")])
    for k in ("_what", "_light", "_thirteen", "_rolls"):
        sweep(d.get(k, ""), f"{DATA.name} {k}")
    for group in ("pints", "glasses", "stove_food"):
        for x in d.get(group) or []:
            sweep(" ".join(str(x.get(f, "")) for f in ("name", "what", "note")), f"{DATA.name}, {x.get('name')}")
            sweep(" ".join(str(x.get(f, "")) for f in ("name", "what", "note")), f"{DATA.name}, {x.get('name')}",
                  [(WORLD, "Jim Butcher's invented world on the board.")])
    for c in d["columns"]:
        sweep(c["carved"], f"{DATA.name}, the {c['key']} column", [(WORLD, "Jim Butcher's invented world on a column.")])
    if problems:
        print("REFUSING:\n  " + "\n  ".join(dict.fromkeys(problems)))
        sys.exit(1)
    fx = facts(d)
    finder = finder_block(d, fx)
    if problems:
        print("REFUSING:\n  " + "\n  ".join(dict.fromkeys(problems)))
        sys.exit(1)
    swap(PAGE, "aqp:room", "      " + room_svg(d), "      ")
    swap(PAGE, "aqp:table", "      " + table_view(d), "      ")
    swap(PAGE, "aqp:finder", finder, "    ")
    swap(PAGE, "aqp:ways", ways_block(d))
    swap(PAGE, "aqp:bar", bar_block(d))
    swap(PAGE, "aqp:parts", parts_block(d))
    swap(PAGE, "aqp:columns", columns_block(d, fx), "    ")
    swap(PAGE, "aqp:menu", menu_block(d), "    ")
    swap(PAGE, "aqp:rolls", rolls_block(d), "    ")
    for q in d["quotes"]:
        swap(PAGE, f"aqp:quote:{q['key']}", quote_block(q, d), "    ")
    swap(PAGE, "aqp:third", third_block(d), "    ")
    swap(NOTES, "pint-sources", liner_sources(d), "      ")
    check_page(d)
    section_css()
    if problems:
        print("REFUSING (the page as written):\n  " + "\n  ".join(dict.fromkeys(problems)))
        sys.exit(1)
    words = sum(len(re.findall(r"[\w’']+", q["words"])) for q in d["quotes"])
    print(f"a quiet pint: the room, the plan, your table, the board and the credits written; thirteen of "
          f"everything and no two alike, every table reachable by a way 36 inches wide, and {words} of Jim "
          "Butcher's words quoted, under the cap")


if __name__ == "__main__":
    if "--plan" in sys.argv:
        d = json.loads(DATA.read_text())
        setup(d)
        check_geometry(d)
        fx = facts(d)
        for k, f in sorted(fx.items()):
            print(k, sorted(f["has"]), f["column"]["key"] if f["column"] else None)
        print("\n".join(dict.fromkeys(problems)) or "plan ok")
    else:
        main()
