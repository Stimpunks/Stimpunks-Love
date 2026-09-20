#!/usr/bin/env python3
"""Build The Latibulum's wireless and television from data/latibulum.json, and their credits with them.

The burrow holds two press-to-play objects: a wooden wireless with one station
on it, and a tube television with one programme. They are facades, the same
mechanism the dancefloor and the chapel use -- nothing reaches YouTube until
somebody presses -- and they get a generator for the same reasons those two do,
plus one that is particular to this room.

WHY A THIRD DATA FILE. data/jukebox.json came off our own Double Rainbow page;
data/chappell.json came off a playlist we published; these two came off neither.
The wireless is a Stimpunk's own composition, published on stimpunks.org/ocean/
and pointed at again from the Bodymind Break; the television is a class we chose
for a Campfire Learn Together. Three provenances, three _source sentences, and a
merged file would leave one of them covering work it never saw.

WHY A GENERATOR AT ALL, FOR TWO BUTTONS. Because the failure it prevents is
silent, and two is exactly the number at which hand-authoring looks reasonable:

  - AN ID THAT IS NOT A YOUTUBE ID. love-embed.js tests the id before it builds
    an iframe and returns QUIETLY when it does not match. A typo is not an error
    anywhere -- not in the console, not in the network panel, not in any checker.
    It is a knob somebody turns and turns that never becomes a sound.

  - A MISSING RUNTIME. Every press-to-play control on this street says how long
    before the press. That is the room's own promise here twice over, because
    the two objects are an hour and a quarter apart: one of these is a
    seventy-four-minute composition and the other is a class. A blank runtime
    would read as a design choice rather than as a bug.

  - THE RUNTIME IN TWO PLACES. The label on the object and the plate beside it
    both say it, and they come from one field. Typed twice, they drift once.

  - A MISSING NAME. Attribution is the one careful habit this site kept, and
    neither of these works is ours. A credit row with a hole in it is worse than
    no credits page.

AND ONE THIS ROOM ADDS: A SLOT WITH NO MARKERS, OR MARKERS WITH NO SLOT. The two
objects are built differently -- a wireless has a grille and a tuning scale, a
television has an aerial and two dials -- so each has its own marker pair in the
page rather than being rendered from one loop into one list. That makes it
possible to add a track whose slot nothing renders, or to delete an object and
leave a track pointing at a hole. Both are refused here.
"""
import html
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA = ROOT / "data/latibulum.json"
ROOM = ROOT / "latibulum.html"
CREDITS = ROOT / "liner-notes.html"
ID = re.compile(r"^[A-Za-z0-9_-]{11}$")          # the same test love-embed.js applies
RUNTIME = re.compile(r"^\d{1,2}:\d{2}(?::\d{2})?$")
SLOTS = ("wireless", "telly")

data = json.loads(DATA.read_text())
tracks = data["tracks"]

problems = []
seen = {}
for i, t in enumerate(tracks, 1):
    where = f"track {i} ({t.get('title') or 'untitled'})"
    if t.get("slot") not in SLOTS:
        problems.append(f"{where}: slot {t.get('slot')!r} is not one of {', '.join(SLOTS)}. "
                        "Each object is built differently and is rendered by name.")
    if not ID.match(t.get("id", "")):
        problems.append(f"{where}: {t.get('id')!r} is not a YouTube id — the facade would "
                        "never become a video and would say nothing about it.")
    if not RUNTIME.match(t.get("length", "")):
        problems.append(f"{where}: no runtime. Every control on this street says how long "
                        "before you press it, and in this room the two are an hour apart.")
    for field in ("title", "artist", "channel", "note", "press"):
        if not t.get(field):
            problems.append(f"{where}: no {field}.")
    if t.get("id") in seen:
        problems.append(f"{where}: id {t['id']} is already {seen[t['id']]}.")
    seen[t.get("id")] = where

filled = [t.get("slot") for t in tracks]
for slot in SLOTS:
    if filled.count(slot) != 1:
        problems.append(
            f"slot {slot!r} is claimed {filled.count(slot)} times and the room has exactly "
            "one of it. An unclaimed slot renders as an empty case with a caption; two "
            "claims render as one object silently overwriting the other.")

if problems:
    raise SystemExit("REFUSING:\n  " + "\n  ".join(problems))

by_slot = {t["slot"]: t for t in tracks}


def swap(page, marker, block, indent=""):
    src = page.read_text()
    begin, end = f"<!-- {marker}:begin -->", f"<!-- {marker}:end -->"
    if begin not in src or end not in src:
        raise SystemExit(
            f"REFUSING: {page.name} has no {marker} markers, so there is nowhere to write.\n"
            "Put them back rather than letting this tool go quiet — a generator that writes\n"
            "nothing and exits 0 is how two surfaces drift apart."
        )
    new = re.sub(re.escape(begin) + r".*?" + re.escape(end),
                 lambda m: begin + "\n" + block + "\n" + indent + end, src, flags=re.S)
    page.write_text(new)


def facade(t):
    """The button, identical in both objects. The runtime appears on it and on
    the plate below, out of this one field."""
    label = f'{t["artist"]} — {t["title"]}'
    return (f'          <button type="button" class="facade" data-embed-id="{t["id"]}" '
            f'data-embed-title="{html.escape(label, quote=True)}">\n'
            f'            Play &mdash; {html.escape(t["length"])}\n'
            f'            <span class="facade__play">&#9654; {html.escape(t["press"])}</span>\n'
            f'          </button>')


def plate(t):
    """What the object is, in words, on the lit plaster. Everything decorative
    above it is hidden from the accessibility tree, so this is the whole of what
    a screen reader gets — which is why it carries the runtime and the channel
    rather than leaving them to the drawing."""
    return (f'        <div class="wall thing__plate">\n'
            f'          <p class="runs">RUNS {html.escape(t["length"])} &middot; '
            f'ON YOUTUBE, VIA {html.escape(t["channel"]).upper()}</p>\n'
            f'          <h3>{html.escape(t["title"])}</h3>\n'
            f'          <p>{html.escape(t["note"])}</p>\n'
            f'          <p class="note">{html.escape(t["artist"])}. '
            f'Nothing of it is hosted here; pressing is what sends the request.</p>\n'
            f'        </div>')


# ── The wireless ─────────────────────────────────────────────────────────────
# An arched wooden case with a cloth grille over the speaker, the station in the
# recess under it, and a tuning scale with two knobs. The grille, the scale and
# the knobs are drawings that carry no words, so all three are hidden.
w = by_slot["wireless"]
swap(ROOM, "latibulum:wireless", f'''    <div class="thing wireless">
      <div class="thing__set">
        <div class="thing__case">
          <div class="grille" aria-hidden="true"></div>
{facade(w)}
          <div class="tuner" aria-hidden="true">
            <span class="set-knob"></span>
            <span class="tuner__scale"><span class="tuner__needle"></span></span>
            <span class="set-knob"></span>
          </div>
        </div>
      </div>
{plate(w)}
    </div>''', "    ")

# ── The television ───────────────────────────────────────────────────────────
# A rounded wooden case with an aerial on top and two dials on the right. The
# screen's corners are rounded by the case, which is what a real tube mask does.
t = by_slot["telly"]
swap(ROOM, "latibulum:telly", f'''    <div class="thing telly">
      <div class="thing__set">
        <svg class="aerial" viewBox="0 0 130 46" aria-hidden="true" fill="none" stroke="#E3BB6A" stroke-width="3" stroke-linecap="round">
          <path d="M65 44 32 6M65 44l33-38"/>
          <circle cx="32" cy="6" r="3.5" fill="#E3BB6A"/>
          <circle cx="98" cy="6" r="3.5" fill="#E3BB6A"/>
        </svg>
        <div class="thing__case">
{facade(t)}
          <div class="dials" aria-hidden="true">
            <span class="set-knob"></span>
            <span class="set-knob"></span>
          </div>
        </div>
      </div>
{plate(t)}
    </div>''', "    ")

# ── The credits ──────────────────────────────────────────────────────────────
rows = []
for t in tracks:
    rows.append(
        f'      <tr><td><strong>{html.escape(t["artist"])}</strong></td>'
        f'<td>{html.escape(t["title"])}</td>'
        f'<td>{html.escape(t["length"])}</td>'
        f'<td>{html.escape(t["channel"])}</td>'
        f'<td><a href="https://www.youtube.com/watch?v={t["id"]}">watch</a></td></tr>')
swap(CREDITS, "latibulum-credits", "\n".join(rows), "      ")


def seconds(stamp):
    parts = [int(x) for x in stamp.split(":")]
    return parts[0] * 60 + parts[1] if len(parts) == 2 else parts[0] * 3600 + parts[1] * 60 + parts[2]


total = sum(seconds(t["length"]) for t in tracks)
print(f"the latibulum: {', '.join(SLOTS)} in {ROOM.name}, {len(tracks)} credit rows in "
      f"{CREDITS.name} · {total // 60}m{total % 60:02d}s of it, none hosted here")
