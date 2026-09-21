#!/usr/bin/env python3
"""Build The Den's listening bench from data/den.json, and its credits with it.

The Den is the subroom behind the Jungle Room: Graceland's own Jungle Room, and
the songs Elvis Presley recorded in it across two sessions in 1976. They are
facades, the mechanism every room on this street uses, and they get a generator
for the reasons the other four do plus one that belongs to this room.

WHY A FIFTH DATA FILE. jukebox came off our Double Rainbow page; chappell off a
playlist we published; latibulum off a composition and a class we chose; jungle
off our own events page. This came off none of them -- it is a discography read
out of two album articles and then resolved, one title at a time, against
YouTube itself. Five provenances, five _source sentences, and a merged file
would leave one of them covering work it never saw.

AND THE ONE THIS ROOM ADDS: IT REFUSES A TRACK WITHOUT A RUNTIME, which is the
exact opposite of the check make-jungle.py runs one page up. That is not an
inconsistency, it is the same promise twice. Every press-to-play control on this
street tells somebody what they are pressing before they press it. Upstairs the
things never end, so a runtime would be a number invented to look reassuring;
down here they are songs of a known length, so leaving it off would be
withholding the one fact that lets somebody decide. The parent and the subroom
enforce opposite rules for one reason, and it is worth reading them together.

WHAT ELSE IT REFUSES, all of it learned somewhere else on this street:

  - AN ID THAT IS NOT A YOUTUBE ID. love-embed.js tests the id and returns
    QUIETLY when it does not match, so a typo is a button somebody presses and
    presses that never becomes a song, reported by nothing.

  - A MISSING WRITER. Presley wrote none of these. A room that credited the
    performer and not the people who wrote the song would be doing the thing
    this site keeps attribution for, in the one room where it is most tempting
    because the performer's name is the whole draw.

  - A MISSING DAY. The room's argument is that these records came out of that
    carpet on particular nights; a track with no session day is a track that has
    lost the only thing making it belong here.

  - THE SAME ID TWICE, and a session with no markers in the page or markers for
    a session the data does not have.
"""
import html
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA = ROOT / "data/den.json"
ROOM = ROOT / "the-den.html"
CREDITS = ROOT / "liner-notes.html"
ID = re.compile(r"^[A-Za-z0-9_-]{11}$")          # the same test love-embed.js applies
RUNTIME = re.compile(r"^\d{1,2}:\d{2}$")
WATCH = "https://www.youtube.com/watch?v="

data = json.loads(DATA.read_text())
sessions = data["sessions"]
artist = data["_artist"]

problems = []
seen = {}
for s in sessions:
    for field in ("slug", "name", "dates", "sub", "tracks"):
        if not s.get(field):
            problems.append(f"session {s.get('slug') or '?'}: no {field}.")
    if not re.fullmatch(r"[a-z][a-z0-9-]*", s.get("slug", "")):
        problems.append(f"session slug {s.get('slug')!r} is not a marker-safe name.")
    for t in s.get("tracks", []):
        where = f"{s.get('slug')}/{t.get('title') or 'untitled'}"
        if not ID.match(t.get("id", "")):
            problems.append(f"{where}: {t.get('id')!r} is not a YouTube id — the facade would "
                            "never become a song and would say nothing about it.")
        if not RUNTIME.match(t.get("length", "")):
            problems.append(f"{where}: no runtime. Every control on this street says how long "
                            "before you press it, and a song has one to give.")
        if not t.get("writers"):
            problems.append(f"{where}: no writer. Presley wrote none of these, and crediting "
                            "only the voice is the failure this site keeps attribution for.")
        if not t.get("day"):
            problems.append(f"{where}: no session day. The day is why it is in this room.")
        for field in ("title", "album", "channel", "note"):
            if not t.get(field):
                problems.append(f"{where}: no {field}.")
        if t.get("id") in seen:
            problems.append(f"{where}: id {t['id']} is already {seen[t['id']]}.")
        seen[t.get("id")] = where

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
    page.write_text(re.sub(re.escape(begin) + r".*?" + re.escape(end),
                           lambda m: begin + "\n" + block + "\n" + indent + end, src, flags=re.S))


def e(s):
    return html.escape(s, quote=True)


def track(t, n):
    """One carved frame on the carpet: a number, the song, who wrote it, and the
    button. The runtime is on the button and on the plate out of one field,
    because typed twice it drifts once."""
    label = f'{artist} — {t["title"]}'
    return (f'        <li class="cut">\n'
            f'          <p class="cut__no" aria-hidden="true">{n:02d}</p>\n'
            f'          <div class="cut__body">\n'
            f'            <h3>{e(t["title"])}</h3>\n'
            f'            <p class="cut__by">Written by {e(t["writers"])} &middot; cut '
            f'{e(t["day"])} 1976 &middot; {e(t["album"])}</p>\n'
            f'            <p class="cut__note">{e(t["note"])}</p>\n'
            f'            <button type="button" class="facade" data-embed-id="{t["id"]}" '
            f'data-embed-title="{e(label)}">\n'
            f'              Play &mdash; {e(t["length"])}\n'
            f'              <span class="facade__play">&#9654; DROP THE NEEDLE</span>\n'
            f'            </button>\n'
            f'            <p class="cut__runs">Runs {e(t["length"])} &middot; on YouTube, via '
            f'{e(t["channel"])}. Nothing of it is hosted here.</p>\n'
            f'          </div>\n'
            f'        </li>')


n = 0
for s in sessions:
    rows = []
    for t in s["tracks"]:
        n += 1
        rows.append(track(t, n))
    swap(ROOM, f"den:{s['slug']}", f'''    <div class="session">
      <p class="session__when">{e(s["dates"])}</p>
      <h2>{e(s["name"])}</h2>
      <p class="session__sub">{e(s["sub"])}</p>
    </div>
      <ul class="cuts">
{chr(10).join(rows)}
      </ul>''', "    ")

# ── The credits ──────────────────────────────────────────────────────────────
rows = []
for s in sessions:
    for t in s["tracks"]:
        rows.append(
            f'      <tr><td>{e(t["title"])}</td>'
            f'<td>{e(t["writers"])}</td>'
            f'<td>{e(t["day"])} 1976</td>'
            f'<td>{e(t["length"])}</td>'
            f'<td>{e(t["channel"])}</td>'
            f'<td><a href="{WATCH}{t["id"]}">watch</a></td></tr>')
swap(CREDITS, "den-credits", "\n".join(rows), "      ")


def seconds(stamp):
    m, sec = (int(x) for x in stamp.split(":"))
    return m * 60 + sec


total = sum(seconds(t["length"]) for s in sessions for t in s["tracks"])
print(f"the den: {len(sessions)} sessions, {n} cuts in {ROOM.name}, {len(rows)} credit rows in "
      f"{CREDITS.name} · {total // 60}m{total % 60:02d}s of it, none hosted here, "
      f"and every one of them says so before you press it")
