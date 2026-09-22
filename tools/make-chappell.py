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

  - A RUNTIME ON THE PLAYLIST, which is the exact inverse of the rule above it
    and sits in this tool for the reason make-club.py holds both halves at once.
    The arcade is thirteen things that each have a length. The chancel at the
    end of it is the whole playlist, and a playlist HAS no length -- it is a
    list we keep adding to, today's total is wrong the next time it changes, and
    an authoritative-looking wrong number is worse than no number. So one kind
    of button here must say how long and the other must not, and the room's
    consent banner says which is which. make-jungle.py refuses a runtime on a
    live camera and make-den.py requires one on a song; they are the same
    promise and MUST NOT be made to agree.

  - A PLAYLIST FRAME POINTING SOMEWHERE THIS SITE WILL NOT BUILD. Read out of
    love-embed.js's ORIGINS rather than restated here, which is the rule
    make-csp.py, make-sweetgrass.py and make-club.py all keep: a hand-kept copy
    of a list with a single source of truth is the _headers trap in miniature.

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

# ── The chancel, at the east end ─────────────────────────────────────────────
# The one object in this room that is not one of the thirteen, and the one
# button in it that cannot say how long.
def origins():
    """The origins this site will build a frame for, READ rather than restated."""
    js = (ROOT / "love-embed.js").read_text()
    block = re.search(r"var ORIGINS = \[(.*?)\];", js, re.S)
    if not block:
        raise SystemExit(
            "REFUSING: love-embed.js has no ORIGINS array, so this tool cannot tell\n"
            "whether the chancel's frame points somewhere this site will actually build.")
    return tuple(re.findall(r"'(https://[^']+)'", block.group(1)))


pl = data.get("playlist") or {}
if not pl:
    problems.append("data/chappell.json has no playlist. The chancel is made of it.")
else:
    src = (pl.get("frame") or "").strip()
    if not src.startswith(origins()):
        problems.append(
            f"the chancel frames {src!r}, which is not an origin this site will build. "
            "love-embed.js returns quietly for a URL it does not recognise, so this "
            "would be a button somebody presses and presses. Add it to ORIGINS and "
            "re-run make-csp.py, or fix the URL.")
    if "list=" not in src:
        problems.append("the chancel's frame carries no list id, so it is not a playlist "
                        "at all and the whole object is a lie about what it plays.")
    if pl.get("length") or pl.get("spoken") or pl.get("runtime"):
        problems.append(
            "the chancel carries a runtime. Every OTHER button in this room must have "
            "one and this one must not: a playlist is a list we keep adding to, so "
            "today's total is wrong the next time it changes and looks authoritative "
            "in the meantime. Say it runs until you stop it.")
    for field in ("title", "note"):
        if not pl.get(field):
            problems.append(f"the chancel has no {field}.")

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

# NO RUNTIME ON THIS LABEL, and no random start either -- Ryan's call,
# 2026-09-22. Club Chronic's stage opens a five-hundred-track list somewhere
# random because nobody is going to reach the end of it; these thirteen were put
# in an order, and starting in the middle of a running order somebody chose
# would be this tool overruling them.
chancel = (f'      <div class="chancel__glass" aria-hidden="true"></div>\n'
           f'      <h3>{html.escape(pl["title"])}</h3>\n'
           f'      <p class="chancel__note">{html.escape(pl["note"])}</p>\n'
           f'      <button type="button" class="facade" '
           f'data-embed-src="{html.escape(pl["frame"], quote=True)}" '
           f'data-embed-title="{html.escape(pl["title"], quote=True)} on YouTube">\n'
           f'        Play the whole playlist &mdash; runs until you stop it\n'
           f'        <span class="facade__play">&#9654; PRESS PLAY</span>\n'
           f'      </button>\n'
           f'      <p class="chancel__credit">No runtime on this one: a playlist is a list we '
           f'keep adding to, and a total here would be wrong the next time it changed. '
           f'On YouTube, from our own channel.</p>')
swap(ROOM, "chappell-chancel", chancel, "    ")

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
      f"{CREDITS.name} · the chancel plays the whole playlist and says no runtime · "
      f"{runtime // 60}m{runtime % 60:02d}s of video in the niches, none of it hosted here")
