#!/usr/bin/env python3
"""Build The Chappell's arcade from data/chappell.json, and its credits with it.

The Chappell is a subroom off Pink Pony Club: thirteen press-to-play facades of
one artist, in a chapel rather than on a dancefloor. It has its own data file
rather than a thirteen-line addition to data/jukebox.json, because the two lists
have different provenance and a shared file would lose that. The jukebox's ids
came out of our own published Double Rainbow page; these came out of a YouTube
playlist we published. Merging them would leave one _source sentence covering two
sources, which is the point at which a provenance note stops being one.

ONE TOOL, TWO SURFACES, for the same reason make-yells.py writes both the button
and the sentence that describes it: the room and the credits page are two
renderings of one list, and a tool per surface is a second chance for them to
disagree. Run this and both move.

IT REFUSES on four things, each of which fails SILENTLY otherwise -- which is the
only kind of failure worth a refusal:

  - AN ID THAT IS NOT A YOUTUBE ID. love-embed.js validates the id before it
    builds an iframe and returns quietly if it does not match, so a typo here is
    not an error anywhere. It is a button that a reader presses and presses and
    that never becomes a video, with nothing in the console to say why.

  - A MISSING RUNTIME. The label on every facade in this room says how long the
    thing is before you press it, which is the same promise the audio room's
    sequence control makes: one press is consent, and consent needs to know what
    it is agreeing to. Twenty-three minutes of Tiny Desk sits in this list beside
    three-minute videos. A blank runtime would not look like a bug, it would look
    like a design choice, and the promise would quietly stop being kept.

  - A MISSING TITLE, CHANNEL OR NOTE. Attribution is the one careful habit this
    site kept. A credit row with a hole in it is worse than no credits page.

  - THE SAME ID TWICE. This playlist legitimately holds one song more than once
    in different cuts -- Pink Pony Club as a video and as an acoustic, Casual as
    a video and live -- and those are different ids. A REPEATED id is a paste
    error wearing the same face, and it renders as two identical buttons that
    nobody reads as a mistake.
"""
import html
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA = ROOT / "data/chappell.json"
ROOM = ROOT / "the-chappell.html"
CREDITS = ROOT / "liner-notes.html"
ID = re.compile(r"^[A-Za-z0-9_-]{11}$")      # the same test love-embed.js applies
RUNTIME = re.compile(r"^\d{1,2}:\d{2}(?::\d{2})?$")

data = json.loads(DATA.read_text())
tracks = data["tracks"]

problems = []
seen = {}
for i, t in enumerate(tracks, 1):
    where = f"track {i} ({t.get('title') or 'untitled'})"
    if not ID.match(t.get("id", "")):
        problems.append(f"{where}: {t.get('id')!r} is not a YouTube id — the facade "
                        "would never become a video and would say nothing about it.")
    if not RUNTIME.match(t.get("length", "")):
        problems.append(f"{where}: no runtime. Every label here says how long before "
                        "you press it; that is the room's promise, not its decoration.")
    for field in ("title", "channel", "note"):
        if not t.get(field):
            problems.append(f"{where}: no {field}.")
    if t.get("id") in seen:
        problems.append(f"{where}: id {t['id']} is already {seen[t['id']]}. Two cuts of "
                        "one song are two ids; one id twice is a paste error.")
    seen[t.get("id")] = where

if problems:
    raise SystemExit("REFUSING:\n  " + "\n  ".join(problems))


def swap(page, marker, block, indent):
    src = page.read_text()
    begin, end = f"<!-- {marker}:begin -->", f"<!-- {marker}:end -->"
    if begin not in src or end not in src:
        raise SystemExit(
            f"REFUSING: {page.name} has no {marker} markers, so there is nowhere to "
            "write.\nPut them back rather than letting this tool go quiet — a "
            "generator that\nwrites nothing and exits 0 is how two surfaces drift apart."
        )
    new = re.sub(re.escape(begin) + r".*?" + re.escape(end),
                 lambda m: begin + "\n" + block + "\n" + indent + end, src, flags=re.S)
    page.write_text(new)


# ── The arcade ───────────────────────────────────────────────────────────────
# Each track is a niche: a gold arch with a stained-glass tympanum over it. The
# glass is decorative and hidden from the accessibility tree; everything a reader
# needs is in the text under it, including the runtime.
niches = []
for t in tracks:
    label = f'Chappell Roan — {t["title"]}'
    niches.append(f'''      <li class="niche">
        <div class="niche__glass" aria-hidden="true"></div>
        <h3>{html.escape(t["title"])}</h3>
        <p class="niche__note">{html.escape(t["note"])}</p>
        <button type="button" class="facade" data-embed-id="{t["id"]}" data-embed-title="{html.escape(label, quote=True)}">
          Play &mdash; {html.escape(t["length"])}
          <span class="facade__play">&#9654; PRESS PLAY</span>
        </button>
        <p class="niche__credit">{html.escape(t["length"])} &middot; on YouTube, via {html.escape(t["channel"])}</p>
      </li>''')
swap(ROOM, "chappell", "\n".join(niches), "    ")

# ── The credits ──────────────────────────────────────────────────────────────
rows = []
for t in tracks:
    rows.append(
        f'      <tr><td>{html.escape(t["title"])}</td>'
        f'<td>{html.escape(t["length"])}</td>'
        f'<td>{html.escape(t["channel"])}</td>'
        f'<td><a href="https://www.youtube.com/watch?v={t["id"]}">watch</a></td></tr>')
swap(CREDITS, "chappell-credits", "\n".join(rows), "      ")

def seconds(stamp):
    parts = [int(x) for x in stamp.split(":")]
    return parts[0] * 60 + parts[1] if len(parts) == 2 else parts[0] * 3600 + parts[1] * 60 + parts[2]


runtime = sum(seconds(t["length"]) for t in tracks)
print(f"the chappell: {len(tracks)} niches in {ROOM.name}, {len(tracks)} credit rows in "
      f"{CREDITS.name} · {runtime // 60}m{runtime % 60:02d}s of video, none of it hosted here")
