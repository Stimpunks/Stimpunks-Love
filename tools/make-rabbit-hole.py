#!/usr/bin/env python3
"""Build The Rabbit Hole's presses, its engravings and its trail from data/rabbit-hole.json.

The room is a shaft with things hanging in it: seven press-to-play facades off
our own glossary entry, six 1865 wood engravings, and the trail of pages that
entry sends you on next. Three surfaces plus the credits, one data file.

WHY A FIFTH FACADE FILE. data/jukebox.json came off our Double Rainbow page,
data/chappell.json off a playlist we published, data/latibulum.json off a
composition and a class, data/jungle.json off an events page. These came off a
glossary entry. Five provenances, five _source sentences, and a merged file
would leave one of them covering work it never saw.

WHAT IT REFUSES, and the first one is why this file exists at all:

  - A LYRIC. The glossary entry this room is built on prints the whole of Grace
    Slick's words, in four blocks, and this room prints none of them.
    make-zibaldone.py refuses a song outright and the reasoning is Ryan's, put
    to the person who asked for that room on 2026-09-22: music publishing
    enforces on quotation where prose publishing shrugs, the licensing is
    separate from the recording, and one line is a far larger fraction of a song
    than of a novel. This street also says in three places that nothing musical
    is hosted here.

    THE FRIENDLY EDIT IS REAL AND IT WILL ARRIVE. A room whose whole spine is
    one song, whose source page has the words on it already, and whose sections
    are named after phrases from it, looks THIN without them -- and the person
    who pastes them back will be right that the page reads better and wrong
    about everything else. So it is a refusal in a tool rather than a paragraph
    in a comment. Any field whose value looks like verse, and any field named
    for one, stops the build.

  - AN ID THAT IS NOT A YOUTUBE ID. love-embed.js tests the id before it builds
    an iframe and returns QUIETLY when it does not match, so a typo is not an
    error anywhere: not in the console, not in the network panel, not in any
    checker. It is a button somebody presses and presses that never becomes a
    video. make-chappell.py's refusal, and the reason it is in every one of
    these tools.

  - A MISSING RUNTIME. Every press-to-play control on this street says how long
    before the press, and in this room the spread is the widest anywhere on the
    site: two and a half minutes at one end and sixteen at the other. A blank
    one would read as a design choice rather than as a bug. make-latibulum.py's
    rule, and make-club.py holds both halves of it at once.

  - A PLATE WITH NO SENTENCE OF OURS. The 1865 edition captioned none of its
    illustrations, so unlike the Mopery's Doré plates there is nothing printed
    to quote -- which means every word beside an engraving here is ours, and
    WHICH engraving sits beside WHICH paragraph is a reading decision we made.
    A plate with a description and no sentence of ours is that decision going
    unstated, which is the one thing the Mopery's own note says not to do.

  - A PLATE FILE THAT IS NOT ON DISK. A missing image is not an error anywhere
    either: the page renders, the alt text reads, and the room is a column of
    broken frames. Checked here rather than trusted, because the files were
    fetched by hand from somebody else's server.

  - A PLATE WITH NO RIGHTS PAGE. Six engravings are shown rather than linked
    because each one carries an explicit Public domain statement on Wikimedia
    Commons -- which is exactly what the Library of Congress facsimile in the
    Mopery did NOT have, and the reason that one is a door and not a window.
    The statement is the whole basis for showing them, so the link to it is
    required and not decorative.

  - A TRAIL ENTRY THAT IS NOT ONE OF OUR OWN PAGES, or one with no line of
    ours. make-hermitage.py refuses a Star Stuff bench entry that does not point
    at starstuff.earth, for the reason a bench with somebody's name on it
    holding something else is a mis-filed thing that reads as a claim. This
    trail is our glossary's own Further Reading list; something else on it would
    be this room quietly extending somebody else's list.

AND ONE THIS ROOM ADDS: A MARKER PAIR THAT IS NOT THERE. Three blocks are
written into the page and one into the credits, and a generator that writes
nothing and exits 0 is how two surfaces drift apart.
"""
import html
import json
import pathlib
import re
import sys

import imgsize           # tools/imgsize.py: width and height read off the file

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA = ROOT / "data/rabbit-hole.json"
ROOM = ROOT / "rabbit-hole.html"
CREDITS = ROOT / "liner-notes.html"

ID = re.compile(r"^[A-Za-z0-9_-]{11}$")           # the same test love-embed.js applies
RUNTIME = re.compile(r"^\d{1,2}:\d{2}(?::\d{2})?$")
GLOSSARY = "https://stimpunks.org/glossary/"

# A FIELD NAMED FOR VERSE. The data file's own header is allowed to discuss the
# refusal -- that is the record of why -- so only the per-entry dicts are swept,
# and the top-level keys beginning with an underscore are left alone.
VERSE_FIELDS = re.compile(r"lyric|verse|chorus|refrain|stanza|words_to|libretto", re.I)

# A VALUE THAT LOOKS LIKE VERSE, wherever it is filed. Short lines, several of
# them, broken by hand -- which is what a lyric pasted into a JSON string looks
# like and what a sentence never does. Two line breaks is the threshold because
# a couplet is already a reproduction.
def looks_like_verse(value):
    if not isinstance(value, str) or "\n" not in value:
        return False
    lines = [ln.strip() for ln in value.splitlines() if ln.strip()]
    return len(lines) >= 3 and sum(len(ln) < 60 for ln in lines) >= 3


data = json.loads(DATA.read_text())
tracks, plates, trail = data["tracks"], data["plates"], data["trail"]

problems = []

# ── The refusal this file exists for ─────────────────────────────────────────
for group, label in ((tracks, "track"), (plates, "plate"), (trail, "trail entry")):
    for i, entry in enumerate(group, 1):
        for field, value in entry.items():
            where = f"{label} {i}"
            if VERSE_FIELDS.search(field):
                problems.append(
                    f"{where}: a field called {field!r}. This room carries the "
                    "recordings and not the words, on purpose — see _no_lyrics in the "
                    "data file. Take it out rather than renaming it.")
            if looks_like_verse(value):
                problems.append(
                    f"{where}: {field!r} holds several short hand-broken lines, which "
                    "is what a lyric looks like in a JSON string and what a sentence "
                    "never does. This room does not print the words.")

# ── The presses ──────────────────────────────────────────────────────────────
seen = {}
for i, t in enumerate(tracks, 1):
    where = f"track {i} ({t.get('title') or 'untitled'})"
    if not ID.match(t.get("id", "")):
        problems.append(f"{where}: {t.get('id')!r} is not a YouTube id — the facade "
                        "would never become a video and would say nothing about it.")
    if not RUNTIME.match(t.get("length", "")):
        problems.append(f"{where}: no runtime. Every control on this street says how "
                        "long before you press it, and in this room the shortest and "
                        "the longest are fourteen minutes apart.")
    for field in ("title", "artist", "channel", "note", "press"):
        if not str(t.get(field, "")).strip():
            problems.append(f"{where}: no {field}.")
    if not isinstance(t.get("official"), bool):
        problems.append(
            f"{where}: no `official` flag. Four of these are re-uploads on individual "
            "channels and three are not, and which it is changes how long the link "
            "will last. The room says so on every plate rather than smoothing it over.")
    if t.get("id") in seen:
        problems.append(f"{where}: id {t['id']} is already {seen[t['id']]}.")
    seen[t.get("id")] = where

# ── The engravings ───────────────────────────────────────────────────────────
for i, p in enumerate(plates, 1):
    where = f"plate {i}"
    for field in ("file", "at", "shows", "ours", "commons"):
        if not str(p.get(field, "")).strip():
            problems.append(
                f"{where}: no {field}." + (
                    " Every word beside these engravings is ours, because the 1865 "
                    "edition captioned none of them — a plate with no sentence of ours "
                    "is a reading decision going unstated." if field == "ours" else
                    " The Public domain statement is the whole basis for showing this "
                    "rather than linking it." if field == "commons" else ""))
    if not str(p.get("commons", "")).startswith("https://commons.wikimedia.org/wiki/File:"):
        problems.append(f"{where}: `commons` is not a Commons file page, which is where "
                        "the rights statement this room relies on actually lives.")
    f = p.get("file", "")
    if not f.startswith("alice/"):
        problems.append(f"{where}: {f!r} is not in alice/.")
    elif not (ROOT / f).exists():
        problems.append(f"{where}: {f} is not on disk. A missing image is not an error "
                        "anywhere — the page renders and the room is a column of "
                        "broken frames.")

# ── The trail ────────────────────────────────────────────────────────────────
for i, s in enumerate(trail, 1):
    where = f"trail entry {i} ({s.get('name') or 'unnamed'})"
    if not str(s.get("slug", "")).strip():
        problems.append(f"{where}: no slug.")
    if not str(s.get("line", "")).strip():
        problems.append(
            f"{where}: no line of ours. A list of bare links is our glossary's Further "
            "Reading list copied out; the line is what makes it a trail somebody can "
            "choose from.")
    if not str(s.get("name", "")).strip():
        problems.append(f"{where}: no name.")

if problems:
    raise SystemExit("REFUSING:\n  " + "\n  ".join(problems))


def swap(page, marker, block, indent=""):
    src = page.read_text()
    begin, end = f"<!-- {marker}:begin -->", f"<!-- {marker}:end -->"
    if begin not in src or end not in src:
        raise SystemExit(
            f"REFUSING: {page.name} has no {marker} markers, so there is nowhere to write.\n"
            "Put them back rather than letting this tool go quiet — a generator that\n"
            "writes nothing and exits 0 is how two surfaces drift apart."
        )
    new = re.sub(re.escape(begin) + r".*?" + re.escape(end),
                 lambda m: begin + "\n" + block + "\n" + indent + end, src, flags=re.S)
    page.write_text(new)


def esc(s):
    return html.escape(str(s))


# ── The engravings, hung down the shaft ──────────────────────────────────────
# Each one on a paper-white mat, because that is what it physically is: black
# ink on white paper, and the only bright thing this far down. The mat carries
# its own flat ground so the pair check-contrast.py holds for the caption is the
# honest one rather than the ground behind it.
blocks = []
for p in plates:
    file_ = esc(p["file"])
    blocks.append(
        f'    <figure class="rh-cut">\n'
        f'      <div class="rh-cut__mat">\n'
        f'        <img src="{file_}" {imgsize.attrs(ROOT / p["file"])} alt="{esc(p["shows"])}" loading="lazy" decoding="async">\n'
        f'      </div>\n'
        f'      <figcaption class="rh-cut__cap">\n'
        f'        <p class="rh-cut__at">{esc(p["at"])}</p>\n'
        f'        <p class="rh-cut__ours">{esc(p["ours"])}</p>\n'
        f'        <p class="rh-cut__prov">Wood engraving by John Tenniel for the first '
        f'edition of <cite>Alice&rsquo;s Adventures in Wonderland</cite>, 1865. Public '
        f'domain. <a href="{esc(p["commons"])}">The scan we used</a>. Where it sits on '
        f'this page is our reading and not the book&rsquo;s arrangement.</p>\n'
        f'      </figcaption>\n'
        f'    </figure>')
swap(ROOM, "rabbit-hole:plates", "\n".join(blocks), "  ")

# ── The presses ──────────────────────────────────────────────────────────────
# One facade each, in the glossary page's own order. Nothing reaches YouTube
# until somebody presses; §4 supplies the box and love-embed.js is the only
# thing on this street that builds the frame.
rows = []
for t in tracks:
    label = f'{t["artist"]} — {t["title"]}'
    origin = ("published by the rights holder" if t["official"]
              else "a re-upload on an individual\u2019s channel")
    rows.append(
        f'    <li class="rh-press">\n'
        f'      <div class="rh-press__slot">\n'
        f'        <button type="button" class="facade" data-embed-id="{t["id"]}" '
        f'data-embed-title="{html.escape(label, quote=True)}">\n'
        f'          Play &mdash; {esc(t["length"])}\n'
        f'          <span class="facade__play">&#9654; {esc(t["press"])}</span>\n'
        f'        </button>\n'
        f'      </div>\n'
        f'      <div class="rh-press__plate">\n'
        f'        <p class="rh-press__runs">RUNS {esc(t["length"])} &middot; ON YOUTUBE, VIA '
        f'{esc(t["channel"]).upper()} &middot; {origin.upper()}</p>\n'
        f'        <h3>{esc(t["title"])}</h3>\n'
        f'        <p class="rh-press__who">{esc(t["artist"])}</p>\n'
        f'        <p>{esc(t["note"])}</p>\n'
        f'      </div>\n'
        f'    </li>')
swap(ROOM, "rabbit-hole:presses", "\n".join(rows), "  ")

# ── The trail ────────────────────────────────────────────────────────────────
steps = []
for i, s in enumerate(trail):
    steps.append(
        f'    <li class="rh-step" style="--step: {i}">\n'
        f'      <a href="{GLOSSARY}{esc(s["slug"])}/">{esc(s["name"])}</a>\n'
        f'      <p>{esc(s["line"])}</p>\n'
        f'    </li>')
swap(ROOM, "rabbit-hole:trail", "\n".join(steps), "  ")

# ── The credits ──────────────────────────────────────────────────────────────
credit_rows = []
for t in tracks:
    credit_rows.append(
        f'      <tr><td><strong>{esc(t["artist"])}</strong></td>'
        f'<td>{esc(t["title"])}</td>'
        f'<td>{esc(t["length"])}</td>'
        f'<td>{esc(t["channel"])}</td>'
        f'<td><a href="https://www.youtube.com/watch?v={t["id"]}">watch</a></td></tr>')
for p in plates:
    credit_rows.append(
        f'      <tr><td><strong>John Tenniel</strong></td>'
        f'<td>{esc(p["at"])} &mdash; wood engraving, 1865</td>'
        f'<td>public domain</td>'
        f'<td>Wikimedia Commons</td>'
        f'<td><a href="{esc(p["commons"])}">the scan</a></td></tr>')
swap(CREDITS, "rabbit-hole-credits", "\n".join(credit_rows), "      ")


def seconds(stamp):
    parts = [int(x) for x in stamp.split(":")]
    return parts[0] * 60 + parts[1] if len(parts) == 2 else parts[0] * 3600 + parts[1] * 60 + parts[2]


total = sum(seconds(t["length"]) for t in tracks)
official = sum(1 for t in tracks if t["official"])
print(f"the rabbit hole: {len(tracks)} presses and {len(plates)} engravings in {ROOM.name}, "
      f"{len(trail)} steps on the trail, {len(credit_rows)} credit rows in {CREDITS.name}")
print(f"  {total // 60}m{total % 60:02d}s of recording, none of it hosted here, "
      f"{official} published by a rights holder and {len(tracks) - official} re-uploads")
print("  no words to any of it, which is the point — see _no_lyrics in the data file")
