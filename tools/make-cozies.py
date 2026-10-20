#!/usr/bin/env python3
"""Lay out the Chimera Cozies: a spot of their own for familiars in a room.

WHAT A COZY IS. Ryan, 2026-10-19, naming the open question of per-room places
for familiars to sit ("Chimera Cozies sounds fun. Let's try giving them their
own spots."). A familiar is a chimera out of Chimera Obscura that follows its
person from room to room (familiar.js). A cozy is something to sit in, drawn
into a room, and a familiar that finds a free one in the window sits in it
rather than anywhere else, one familiar to a cozy; at MAX GLITTER they wander
between them. An empty cozy is a seat waiting, which is fine.

EVERY COZY IS ITS ROOM'S OWN, THE JOB MARKER'S RULE. A cozy is furniture drawn
INTO a room, so it is drawn in that room's own declared inks and in a shape
that belongs there, and no two rooms share one: a velvet pouf by the camera
obscura's rail, a cushion of moss on a stone in the Garden, a knitted floor
cushion against the burrow's plaster, a leather footstool in the reading room,
an egg chair in front of the Hermitage's screen.
What is shared is only the layout (`.cozy` in love.css §4, which sets no
colour) and the attribute familiar.js finds it by (data-familiar-cozy, on the
drawing itself, which is what a familiar sits in). The friendly edit is one
cushion drawing for every room; it is the shared glyph the job markers refuse.

THIS TOOL REFUSES, RATHER THAN GUESSES:
  - a room in data/cozies.json with no drawing here, or no cozy markers on its
    page, and cozy markers on a page with no entry;
  - a drawing with a colour of its own (a hex, rgb() or a name) or a
    var(--token) that love.css does not declare, because an ink nobody
    declared is a pair nobody measured;
  - a drawing with words in it (<text>), or a transform, which is the one thing
    check-gentle.py can read and must not be asked to take a drawing's word
    for;
  - two rooms' drawings alike.

It writes each room's cozy between <!-- cozy:begin --> and <!-- cozy:end -->,
a wrapper that keeps a familiar's height of clear air above the drawing so a
familiar sitting in it is on no words. Never hand-edit between the markers.
A new cozy is an entry in the data file, a drawing here in that room's inks,
and a pair of markers where the room has a little space.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data/cozies.json"
CSS = ROOT / "love.css"
BEGIN, END = "<!-- cozy:begin -->", "<!-- cozy:end -->"

# Each drawing is 132 wide and, unless SHAPE says otherwise, 48 high, the seat
# across its middle, in its room's own inks.
DRAW = {
    "chimera-obscura.html": (
        # A round velvet pouf by the rail, piped and studded in the lens's brass.
        '<ellipse cx="66" cy="44" rx="56" ry="4" fill="var(--chm-plinth)"/>'
        '<path d="M14 18 Q14 42 66 42 Q118 42 118 18 Z" fill="var(--chm-plinth)" stroke="var(--chm-brass)" stroke-width="2.5" stroke-linejoin="round"/>'
        '<ellipse cx="66" cy="18" rx="52" ry="11" fill="var(--chm-rail)" stroke="var(--chm-brass)" stroke-width="2.5"/>'
        '<circle cx="34" cy="31" r="2.2" fill="var(--chm-brass)"/><circle cx="54" cy="35" r="2.2" fill="var(--chm-brass)"/>'
        '<circle cx="78" cy="35" r="2.2" fill="var(--chm-brass)"/><circle cx="98" cy="31" r="2.2" fill="var(--chm-brass)"/>'
    ),
    "the-garden.html": (
        # A cushion of moss grown over a flat stone, in the beds' greens.
        '<path d="M8 40 L18 30 L112 28 L124 40 Z" fill="var(--gd-loam-2)" stroke="var(--gd-loam)" stroke-width="2.5" stroke-linejoin="round"/>'
        '<path d="M22 31 C22 12 44 8 66 9 C90 9 110 13 110 30 Z" fill="var(--gd-leaf-2)" stroke="var(--gd-leaf)" stroke-width="2.5" stroke-linejoin="round"/>'
        '<path d="M34 22 q4 -5 8 0 M56 17 q4 -5 8 0 M78 19 q4 -5 8 0 M94 25 q4 -5 8 0" fill="none" stroke="var(--gd-leaf)" stroke-width="2" stroke-linecap="round"/>'
    ),
    "latibulum.html": (
        # A knitted floor cushion against the plaster, cabled, with a tassel at each corner.
        '<path d="M12 16 Q66 6 120 16 L118 40 Q66 46 14 40 Z" fill="var(--oat-2)" stroke="var(--umber)" stroke-width="2.5" stroke-linejoin="round"/>'
        '<path d="M40 13 C34 22 46 30 40 42 M66 11 C60 22 72 32 66 44 M92 13 C86 22 98 30 92 42" fill="none" stroke="var(--umber-2)" stroke-width="2.5" stroke-linecap="round"/>'
        '<path d="M12 16 l-6 -6 M120 16 l6 -6 M14 40 l-6 6 M118 40 l6 6" stroke="var(--rust)" stroke-width="3" stroke-linecap="round"/>'
    ),
    "solarpunk-hermitage.html": (
        # An egg chair in front of the campfire's screen: a pale shell on a
        # swivel foot, padded in the cabin's mustard, outlined in --furrow like
        # everything else on that rug, because the scene's own rule is that
        # every object is carried by its outline.
        '<ellipse cx="66" cy="114" rx="30" ry="5" fill="var(--bakelite)" stroke="var(--furrow)" stroke-width="2.5"/>'
        '<path d="M61 96 L71 96 L70 112 L62 112 Z" fill="var(--bakelite)" stroke="var(--furrow)" stroke-width="2.5" stroke-linejoin="round"/>'
        '<path d="M66 4 C104 4 124 36 122 66 C120 92 100 104 66 104 C32 104 12 92 10 66 C8 36 28 4 66 4 Z" fill="var(--noon)" stroke="var(--furrow)" stroke-width="3" stroke-linejoin="round"/>'
        '<path d="M66 18 C94 18 108 42 106 64 C104 84 90 92 66 92 C42 92 28 84 26 64 C24 42 38 18 66 18 Z" fill="var(--bloom)" stroke="var(--furrow)" stroke-width="2.5" stroke-linejoin="round"/>'
        '<path d="M30 76 Q66 94 102 76" fill="none" stroke="var(--furrow)" stroke-width="2.5" stroke-linecap="round"/>'
        '<path d="M14 56 Q10 72 22 88 M118 56 Q122 72 110 88" fill="none" stroke="var(--noon-2)" stroke-width="3" stroke-linecap="round"/>'
    ),
    "community-library.html": (
        # A leather footstool on turned oak legs, buttoned, by the shelves.
        '<path d="M28 34 L26 46 M104 34 L106 46" stroke="var(--cl-oak)" stroke-width="5" stroke-linecap="round"/>'
        '<path d="M16 22 Q16 12 26 12 L106 12 Q116 12 116 22 L116 30 Q116 36 106 36 L26 36 Q16 36 16 30 Z" fill="var(--cl-oak)" stroke="var(--cl-ink)" stroke-width="2.5" stroke-linejoin="round"/>'
        '<path d="M20 22 L112 22" stroke="var(--cl-stone)" stroke-width="2" stroke-dasharray="3 4"/>'
        '<circle cx="46" cy="17" r="2" fill="var(--cl-ink)"/><circle cx="66" cy="17" r="2" fill="var(--cl-ink)"/><circle cx="86" cy="17" r="2" fill="var(--cl-ink)"/>'
    ),
}

# A cozy that is not the usual low cushion says how tall its drawing is and
# where in it a familiar's feet go, as a fraction of that height.
SHAPE = {
    "solarpunk-hermitage.html": {"h": 120, "seat": 0.72},
}
SIDES = ("left", "right", "center")

problems = []


def refuse(msg):
    problems.append(msg)


def declared():
    return set(re.findall(r"(--[\w-]+)\s*:", re.sub(r"/\*.*?\*/", "", CSS.read_text(), flags=re.S)))


def check(d):
    tokens = declared()
    rooms = d.get("rooms", {})
    for page, info in rooms.items():
        if page not in DRAW:
            refuse(f"{page} is in data/cozies.json and this tool has no drawing for it. Draw its cozy in its own inks.")
        if info.get("side") not in SIDES:
            refuse(f"{page}: side must be one of {SIDES}: which side of the room's words the cozy stands, or "
                   "centred, where the room lays its things out down the middle.")
        if not (ROOT / page).exists():
            refuse(f"{page} is in data/cozies.json and is not a page.")
    for page, art in DRAW.items():
        if page not in rooms:
            refuse(f"this tool has a cozy for {page} and data/cozies.json does not lay it out.")
        if re.search(r'#[0-9A-Fa-f]{3,8}\b|\brgba?\(|\bhsla?\(|="(?:white|black|red|green|blue|yellow|grey|gray)"', art):
            refuse(f"{page}'s cozy has a colour of its own. It is drawn in its room's declared inks.")
        for m in re.finditer(r"var\((--[\w-]+)\)", art):
            if m.group(1) not in tokens:
                refuse(f"{page}'s cozy uses {m.group(1)}, which love.css does not declare.")
        if re.search(r"<text|transform", art):
            refuse(f"{page}'s cozy has words or a transform in it. A cozy carries no word, and moves nothing.")
    for page, sh in SHAPE.items():
        if page not in DRAW:
            refuse(f"SHAPE has {page} and there is no drawing for it.")
        if not (48 <= sh.get("h", 0) <= 140 and 0.3 <= sh.get("seat", 0) <= 0.95):
            refuse(f"{page}: a cozy is 48 to 140 high and its seat between 0.3 and 0.95 of that.")
    arts = list(DRAW.values())
    if len(set(arts)) != len(arts):
        refuse("two rooms' cozies are drawn alike. Every cozy is its own room's.")
    for f in sorted(ROOT.glob("*.html")):
        if BEGIN in f.read_text() and f.name not in rooms:
            refuse(f"{f.name} has cozy markers and no entry in data/cozies.json.")


def block(page, info):
    sh = SHAPE.get(page, {})
    h = sh.get("h", 48)
    seat = f' data-familiar-seat="{sh["seat"]}"' if "seat" in sh else ""
    return (f'<div class="cozy cozy--{info["side"]}">'
            f'<svg class="cozy__seat" data-familiar-cozy{seat} viewBox="0 0 132 {h}" width="132" height="{h}" '
            f'aria-hidden="true" focusable="false">{DRAW[page]}</svg></div>')


def main():
    d = json.loads(DATA.read_text())
    check(d)
    if problems:
        print("REFUSING:\n  " + "\n  ".join(problems))
        sys.exit(1)
    for page, info in d["rooms"].items():
        f = ROOT / page
        src = f.read_text()
        if BEGIN not in src or END not in src:
            print(f"REFUSING: {page} has no cozy markers. Put {BEGIN} and {END} where the room has a little space.")
            sys.exit(1)
        new = re.sub(re.escape(BEGIN) + r".*?" + re.escape(END), lambda _m: BEGIN + block(page, info) + END, src, flags=re.S)
        if new != src:
            f.write_text(new)
    print("cozies: a cozy drawn in its own room's inks wherever one is laid out")


if __name__ == "__main__":
    main()
