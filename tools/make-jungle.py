#!/usr/bin/env python3
"""Build The Jungle Room's viewing galleries from data/jungle.json, and their credits with them.

The room is the nature live cams our own Watering Hole Hangs page puts on in
the background, in that page's own groups and that page's own order. They are
facades -- the mechanism the dancefloor, the chapel and the burrow use, where
nothing reaches YouTube until somebody presses -- and they get a generator for
the same reasons those three do, plus two that belong to this room alone.

WHY A FOURTH DATA FILE. jukebox came off our Double Rainbow page; chappell off a
playlist we published; latibulum off a composition and a class we chose for a
campfire. These came off an events page we publish and do not otherwise touch
from this repo. Four provenances, four _source sentences, and a merged file
would leave one of them covering work it never saw.

AND THE FIRST OF THE TWO NEW ONES: A RUNTIME HERE WOULD BE A LIE. Every other
press-to-play control on this street says how long it runs before the press,
and make-latibulum.py REFUSES a track without one. A live camera has no runtime
-- the honest answer is that it does not stop -- so this tool refuses a cam that
HAS one. The reflex arriving from the other three files is to reach for the
length of whatever stream happens to be up today, which is a number that is
wrong tomorrow and looks authoritative in the meantime. The promise is kept the
other way round instead: the label says the thing runs until you close it, and
the room says out loud that the picture is whatever is happening there now,
including darkness, rain, an empty waterhole, or a cam between streams.

AND THE SECOND: EMBEDDING IS A SEPARATE PERMISSION FROM PLAYING, and nothing on
this site knew that until this room. love-embed.js checks that an id is
well-formed and builds an iframe; it cannot know that the owner of that video
has switched embedding OFF. The iframe loads, and shows a refusal where the
picture should be. That is the same failure make-chappell.py exists to prevent
-- a button somebody presses and presses that never becomes a video -- arriving
through a door no checker was watching. So a cam is marked in the data with
what was MEASURED on the watch page:

  live  -- playabilityStatus OK and playableInEmbed true. It gets a screen.
  link  -- plays on YouTube, embedding off. It gets a way out to YouTube and
           says why, because a door is not a window and dressing it as one is
           exactly the broken thing.
  dark  -- playabilityStatus UNPLAYABLE. The cam is gone. Nothing renders, and
           the entry stays in the file so that the death is written down rather
           than quietly deleted -- and this tool writes the names of the dead
           into the room, so a reader is told rather than left with a gallery
           that is silently shorter than our events page says it is.

THE REST IS THE SAME SET OF REFUSALS THE OTHER THREE MAKE: an id that is not a
YouTube id (love-embed.js returns quietly on those, so a typo is a button that
does nothing and reports nothing anywhere), a missing name for whoever runs the
camera (attribution is the one careful habit this site kept, and none of these
cameras is ours), the same id twice, and -- as in the burrow -- a group with no
markers in the page, or markers in the page for a group the data does not have.
"""
import html
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA = ROOT / "data/jungle.json"
ROOM = ROOT / "jungle-room.html"
CREDITS = ROOT / "liner-notes.html"
ID = re.compile(r"^[A-Za-z0-9_-]{11}$")          # the same test love-embed.js applies
STATES = ("live", "link", "dark")
WATCH = "https://www.youtube.com/watch?v="

data = json.loads(DATA.read_text())
groups = data["groups"]

problems = []
seen = {}
for g in groups:
    for field in ("slug", "name", "sub", "cams"):
        if not g.get(field):
            problems.append(f"group {g.get('slug') or g.get('name') or '?'}: no {field}.")
    if not re.fullmatch(r"[a-z][a-z0-9-]*", g.get("slug", "")):
        problems.append(f"group slug {g.get('slug')!r} is not a marker-safe name.")
    for c in g.get("cams", []):
        where = f"{g.get('slug')}/{c.get('title') or 'untitled'}"
        if not ID.match(c.get("id", "")):
            problems.append(f"{where}: {c.get('id')!r} is not a YouTube id — the facade would "
                            "never become a picture and would say nothing about it.")
        if c.get("state") not in STATES:
            problems.append(f"{where}: state {c.get('state')!r} is not one of "
                            f"{', '.join(STATES)}. It is what was measured on the watch "
                            "page, not a preference.")
        for field in ("title", "channel", "note"):
            if not c.get(field):
                problems.append(f"{where}: no {field}."
                                + (" None of these cameras is ours." if field == "channel" else ""))
        if c.get("length") or c.get("runtime"):
            problems.append(
                f"{where}: carries a runtime. A live camera has no runtime, and the length "
                "of whichever stream is up today is a number that is wrong tomorrow. "
                "The label says it runs until you close it; see _no_runtime in the data.")
        if c.get("id") in seen:
            problems.append(f"{where}: id {c['id']} is already {seen[c['id']]}.")
        seen[c.get("id")] = where

    if g.get("cams") and not [c for c in g["cams"] if c.get("state") != "dark"]:
        problems.append(
            f"group {g.get('slug')}: every cam in it is dark, so it would render as a "
            "heading over nothing. Decide what the group is for before publishing it.")

if problems:
    raise SystemExit("REFUSING:\n  " + "\n  ".join(problems))


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
    return True


def e(s):
    return html.escape(s, quote=True)


def screen(c):
    """A live cam: a leaf-shaped aperture with a button in it.

    The button carries the cam's name and who runs it, because that is the whole
    of what a screen reader gets from the control -- everything around it is
    either a drawing or already said in the plate."""
    label = f'{c["title"]} — {c["channel"]}'
    return (f'          <div class="cam__view">\n'
            f'            <button type="button" class="facade" data-embed-id="{c["id"]}" '
            f'data-embed-title="{e(label)}">\n'
            f'              Live — no end. Whatever is happening there right now.\n'
            f'              <span class="facade__play">&#9654; Open the leaves</span>\n'
            f'            </button>\n'
            f'          </div>')


def away(c):
    """A cam whose owner has embedding switched off: a way out, saying so."""
    return (f'          <a class="cam__away" href="{WATCH}{c["id"]}">\n'
            f'            <strong>Watch on YouTube &rarr;</strong>\n'
            f'            <span class="jungle-note">This camera&rsquo;s owner has embedding '
            f'switched off, so it cannot open in a screen here.</span>\n'
            f'          </a>')


def cam(c):
    body = screen(c) if c["state"] == "live" else away(c)
    live = ('            <p class="cam__live"><span class="cam__dot" aria-hidden="true"></span>'
            'Live &middot; no end</p>\n') if c["state"] == "live" else (
            '            <p class="cam__live">Off site &middot; opens on YouTube</p>\n')
    return (f'        <li class="cam{" cam--away" if c["state"] == "link" else ""}">\n'
            f'{body}\n'
            f'          <div>\n'
            f'{live}'
            f'            <h3>{e(c["title"])}</h3>\n'
            f'            <p>{e(c["note"])}</p>\n'
            f'            <p class="cam__who">{e(c["channel"])}&rsquo;s camera, on YouTube. '
            f'Nothing of it is hosted here; '
            f'{"following the link is what sends the request" if c["state"] == "link" else "pressing is what sends the request"}.</p>\n'
            f'          </div>\n'
            f'        </li>')


LEAF = ('<svg viewBox="0 0 34 34" aria-hidden="true" fill="none" stroke="#57A05C" '
        'stroke-width="2" stroke-linecap="round"><path d="M30 4C12 4 4 12 4 24c0 3 1 5 1 5s2 1 5 1'
        'c12 0 20-8 20-26Z"/><path d="M30 4 6 28" opacity=".8"/></svg>')

shown = gone = doors = 0
for g in groups:
    cams = [c for c in g["cams"] if c["state"] != "dark"]
    shown += sum(1 for c in cams if c["state"] == "live")
    doors += sum(1 for c in cams if c["state"] == "link")
    gone += sum(1 for c in g["cams"] if c["state"] == "dark")
    swap(ROOM, f"jungle:{g['slug']}", f'''    <div class="gallery__head">
      {LEAF}
      <div>
        <h2>{e(g["name"])}</h2>
        <p>{e(g["sub"])}</p>
      </div>
    </div>
      <ul class="cams">
{chr(10).join(cam(c) for c in cams)}
      </ul>''', "    ")

# ── What is gone, in the room rather than only in the data ───────────────────
# A gallery that is quietly shorter than our own events page says it is would
# be the site correcting a published page by deleting the evidence.
dead = [(g, c) for g in groups for c in g["cams"] if c["state"] == "dark"]
WORDS = {1: "One cam", 2: "Two cams", 3: "Three cams", 4: "Four cams", 5: "Five cams"}
# The same numbers without the noun on them. Two maps rather than one because
# the noun is part of the subject in one sentence and already spoken in the
# other, and gluing them together is how "Three cams of them" got published.
NUMBERS = {1: "One", 2: "Two", 3: "Three", 4: "Four", 5: "Five"}
if dead:
    # The number is GENERATED rather than typed, for the reason check-counts.py
    # exists: a total written into a sentence is a fact that lives in one place
    # and is updated somewhere else. A cam dying does not need anybody to
    # remember this paragraph.
    one = len(dead) == 1
    how_many = WORDS.get(len(dead), f"{len(dead)} cams")
    names = ", ".join(f'{e(c["title"])} ({e(c["channel"])})' for _g, c in dead)
    # THE WHOLE SENTENCE AGREES, not just the opening clause. The first draft
    # generated the count and left the tail plural, so one dead cam read as
    # "One cam ... has gone dark ... The entries are ... Replacing them". A
    # generated number in front of hand-written grammar is a sentence that goes
    # wrong the moment the number changes, which is the same failure as a
    # hand-typed total wearing a better disguise.
    block = (f'      <p class="jungle-note"><strong>{how_many} on our own events page '
             f'{"has" if one else "have"} gone dark since it was written</strong> and '
             f'{"is" if one else "are"} not in the galleries above, because a screen '
             f'that cannot play is worse than an honest gap: {names}. '
             f'{"The entry is" if one else "The entries are"} still in this room&rsquo;s data '
             f'file, carrying the date {"it was" if one else "they were"} found dead on, so the '
             f'death is written down rather than tidied away. '
             f'Replacing {"it" if one else "them"} is a curation '
             f'decision on <a href="https://stimpunks.org/events/watering-hole-hangs/">the '
             f'events page</a>, not one this street gets to make on its own.</p>')
else:
    # NOTHING IS DARK, WHICH IS NOT THE SAME AS EVERYTHING BEING IN A SCREEN.
    # The first version of this branch said only that every cam is playing,
    # which is true and would have let a reader assume they were all openable
    # here. The link-outs are counted in the same breath, and the whole
    # sentence agrees with both numbers.
    away = [c for g in groups for c in g["cams"] if c["state"] == "link"]
    block = '      <p class="jungle-note"><strong>Every cam our events page lists is playing.</strong>'
    if away:
        n, one = len(away), len(away) == 1
        block += (f' {NUMBERS.get(n, str(n))} of them '
                  f'{"opens" if one else "open"} on YouTube rather than in a screen here, because '
                  f'{"its owner has" if one else "their owners have"} embedding switched off — '
                  f'{"that is a door rather than a window" if one else "those are doors rather than windows"}, '
                  f'and {"it says" if one else "they say"} so on the way out.')
    block += "</p>"
swap(ROOM, "jungle:gone", block, "    ")

# ── The credits ──────────────────────────────────────────────────────────────
rows = []
for g in groups:
    for c in g["cams"]:
        state = {"live": "in a screen", "link": "link only — embedding off",
                 "dark": "gone — see the room"}[c["state"]]
        rows.append(
            f'      <tr><td><strong>{e(c["channel"])}</strong></td>'
            f'<td>{e(c["title"])}</td>'
            f'<td>{e(g["name"])}</td>'
            f'<td>{state}</td>'
            f'<td><a href="{WATCH}{c["id"]}">watch</a></td></tr>')
swap(CREDITS, "jungle-credits", "\n".join(rows), "      ")

print(f"the jungle room: {len(groups)} galleries in {ROOM.name} · {shown} screens, "
      f"{doors} link-outs, {gone} dark · {len(rows)} credit rows in {CREDITS.name} · "
      f"none of it hosted here, and not one of them carries a runtime")
