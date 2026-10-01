#!/usr/bin/env python3
"""Refuse a room search that finds differently in the radio, the guest bar or the finder.

THE TELEPORTER IS IN TWO FILES. cb.js carries the radio's, and guest.js carries
a copy for everybody who is not signed on, because nobody who has not signed on
ever downloads cb.js. Two copies of one search is one copy that gets a fix and
one that does not, and the person who notices is whoever happens to be signed
off that day. finder.js carries a third, for the search box on the front page
and the Map (Helen's ask for a search bar, Ryan's call to put it on those two
pages). So the block that decides what a search finds, from
"WHAT THE TELEPORTER FINDS" to the end of findRooms, has to be the same
characters in all three, and this refuses otherwise.

IT ALSO RUNS IT, against the cb-rooms.json make-sitemap.py just wrote, on the
asks it was built for (Helen Edgar's, 2026-10-01): "fire" finds The Campfire,
a word only a description holds finds that room, and a plural finds its
singular. And every room in the list carries its description, because a room
with no `about` can only be found by its name and nothing would say so.

IF THIS REFUSES over the copies: change all three files, never one.
"""
import json, pathlib, subprocess, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
START = "  /* WHAT THE TELEPORTER FINDS"
END = "    return begins.concat(inside, about);\n  }\n"


def block(name):
    s = (ROOT / name).read_text()
    if s.count(START) != 1:
        raise SystemExit(f"REFUSING: {name} should hold the teleporter's search once, and holds it "
                         f"{s.count(START)} times.")
    a = s.index(START)
    b = s.find(END, a)
    if b < 0:
        raise SystemExit(f"REFUSING: {name}'s teleporter search does not end where this tool expects.")
    return s[a:b + len(END)]


COPIES = ["cb.js", "guest.js", "finder.js"]
radio = block(COPIES[0])
apart = [name for name in COPIES[1:] if block(name) != radio]
if apart:
    raise SystemExit(f"REFUSING: the room search in {', '.join(apart)} has drifted from cb.js's. "
                     "The radio, the guest bar and the finder would find different rooms. Make "
                     f"them the same, in all of {', '.join(COPIES)}.")

# Every page that carries a finder box loads finder.js, and every page that
# loads finder.js carries a box: a box with no script never unhides, and a
# script with no box is a fetch-shaped thing nobody can use.
import re
for page in sorted(ROOT.glob("*.html")):
    t = page.read_text()
    has_box = "data-finder" in t
    loads = re.search(r'<script src="/?finder\.js"', t) is not None
    if has_box != loads:
        raise SystemExit(f"REFUSING: {page.name} " + ("has a finder box and does not load finder.js."
                         if has_box else "loads finder.js and has no finder box."))

rooms = json.loads((ROOT / "cb-rooms.json").read_text())["rooms"]
bare = [r["tag"] for r in rooms if not isinstance(r.get("about"), str) or not r["about"].strip()]
if bare:
    raise SystemExit(f"REFUSING: cb-rooms.json has no description for #{', #'.join(bare)}, so the "
                     "teleporter can only find them by name. Run tools/make-sitemap.py.")

# (what is typed, a tag that must be found, a tag that must not)
ASKS = [
    ("fire", "cavendish-campfire", None),        # inside a word of a name
    ("Fire", "cavendish-campfire", None),        # whatever the case
    ("theatre", "looming-rocks", None),          # inside a name and nowhere in its description,
    ("bowl", "town-hall-fishbowl", None),        # so only the inside-a-name match can find these
    ("#the-den", "the-den", None),               # a #tag still goes where it always went
    ("autism films", "lightbulb-picture-house", None),  # only in its description, and a plural
    ("dogs", "rescue-a-dog", None),
    ("f", None, "lightbulb-picture-house"),      # one letter does not reach into descriptions
]
js = "const rooms = " + json.dumps(rooms) + ";\n" + radio + """
const asks = JSON.parse(process.argv[1]);
const out = asks.map(([q]) => findRooms(q).map(f => f.room.tag));
process.stdout.write(JSON.stringify(out));
"""
run = subprocess.run(["node", "-e", js, json.dumps(ASKS)], capture_output=True, text=True)
if run.returncode:
    raise SystemExit("REFUSING: the teleporter's search does not run:\n" + run.stderr)
found = json.loads(run.stdout)
bad = []
for (q, must, mustnt), tags in zip(ASKS, found):
    if must and must not in tags:
        bad.append(f"  · {q!r} should find #{must} and finds {', '.join('#' + t for t in tags[:6]) or 'nothing'}")
    if mustnt and mustnt in tags:
        bad.append(f"  · {q!r} should not reach #{mustnt}, and does")
if bad:
    raise SystemExit("REFUSING: the teleporter no longer finds what it was asked to:\n" + "\n".join(bad))
print(f"room search: the radio's, the guest bar's and the finder's are the same, and find what "
      f"they were asked to ({len(ASKS)} asks)")
