#!/usr/bin/env python3
"""The Faery Yurt Music Book: Helen Edgar's playlists, written into her Music Room.

Helen's document of 2026-11-19 ("Read and push"), kept in data/music-book.json in her
own words: her welcome, six parts, and every playlist's songs as she listed them. This
tool writes it between music-book markers in faery-music-room.html, one chapter to a
playlist, folded, with its songs in order and a link that opens the playlist on YouTube.

NOTHING HERE PLAYS. Every chapter is a link out, never a facade or a frame, because the
room's phonograph and its shelves are what plays in here; a link says where it goes and
asks nothing of the page. A playlist YouTube said does not exist keeps its songs on the
page and says it is not on YouTube yet, with no link, rather than a link to nothing; its
id from the document stays in the data as 'was', so Helen's corrected address can go in.

It refuses: a part whose own count of playlists ("Sixteen playlists ...") is not the
number of chapters under it, so her words can never go stale; a playlist id that is not
YouTube's shape; a chapter with no songs; the welcome's total if it is not the number of
chapters; and a frame, a facade or anything that plays inside the markers. Never
hand-edit between the markers.
"""
import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = json.loads((ROOT / "data" / "music-book.json").read_text())
PAGE = ROOT / "faery-music-room.html"
BEGIN, END = "<!-- music-book:begin -->", "<!-- music-book:end -->"
WORDS = {w: n for n, w in enumerate(
    "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen "
    "sixteen seventeen eighteen nineteen twenty".split())}
ID = re.compile(r"^PL[A-Za-z0-9_-]{11}$|^PL[A-Za-z0-9_-]{32}$")
fail = []


def refuse(msg):
    fail.append(msg)


def esc(s):
    return html.escape(s, quote=True)


def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


parts = DATA["parts"]
total = sum(len(p["lists"]) for p in parts)
m = re.search(r"holds (\d+) playlists", " ".join(DATA["welcome"]))
if m and int(m.group(1)) != total:
    refuse(f"the welcome says the book holds {m.group(1)} playlists and it holds {total}: the words must say what is there.")
seen = set()
for p in parts:
    first = p["about"].split()[0].lower()
    if first in WORDS and WORDS[first] != len(p["lists"]):
        refuse(f"{p['part']} says {first} playlists and has {len(p['lists'])} under it.")
    for pl in p["lists"]:
        if not pl["songs"]:
            refuse(f"{pl['name']} has no songs.")
        i = pl.get("list")
        if i is not None and not ID.match(i):
            refuse(f"{pl['name']}'s playlist id {i!r} is not YouTube's shape.")
        if i is None and not pl.get("was"):
            refuse(f"{pl['name']} has no link and no id from the document: say which playlist it was.")
        s = slug(pl["name"])
        if s in seen:
            refuse(f"two chapters would share the id music-book-{s}.")
        seen.add(s)

out = ['<section class="mus-book" aria-labelledby="music-book">',
       '    <h2 id="music-book">The Music Book</h2>']
for para in DATA["welcome"]:
    out.append(f'    <p class="mus-book__lede">{esc(para)}</p>')
waiting = any(not pl.get("list") for p in parts for pl in p["lists"])
out.append('    <p class="mus-book__how">Every chapter opens to its songs, in the playlist&rsquo;s own order, and its link opens the playlist on YouTube; nothing here plays by itself.'
           + (' A chapter that says it is not on YouTube yet is one whose playlist is on its way.' if waiting else '') + '</p>')
for p in parts:
    pid = f"music-book-{slug(p['part'])}"
    out.append(f'    <h3 class="mus-book__part" id="{pid}">{esc(p["part"])}: {esc(p["name"])}</h3>')
    out.append(f'    <p class="mus-book__about">{esc(p["about"])}</p>')
    out.append('    <div class="mus-book__shelf">')
    for pl in p["lists"]:
        name = esc(pl["name"])
        if pl.get("list"):
            go = (f'<p class="mus-book__go"><a href="https://www.youtube.com/playlist?list={pl["list"]}" '
                  f'rel="noopener">Listen to {name} on YouTube</a></p>')
        else:
            go = '<p class="mus-book__go mus-book__go--soon">Not on YouTube yet.</p>'
        songs = "\n          ".join(f"<li>{esc(s)}</li>" for s in pl["songs"])
        out.append(f'''      <details class="mus-book__list" id="music-book-{slug(pl["name"])}">
        <summary class="mus-book__name">{name}</summary>
        {go}
        <ol class="mus-book__songs">
          {songs}
        </ol>
      </details>''')
    out.append('    </div>')
out.append(f'    <p class="mus-book__from">From my Music Book, 19 November 2026. The playlists are on <a href="{esc(DATA["channel"])}" rel="noopener">my YouTube channel</a>.</p>')
out.append('  </section>')
block = "\n".join(out)

if re.search(r"<iframe|facade|data-embed|<audio|<video", block):
    refuse("the music book holds something that plays; every chapter is a link out.")

page = PAGE.read_text()
i, j = page.find(BEGIN), page.find(END)
if i < 0 or j < i:
    refuse(f"faery-music-room.html has no {BEGIN} ... {END} markers for the music book.")
if fail:
    for f in fail:
        print("make-music-book: " + f, file=sys.stderr)
    sys.exit(1)
new = page[: i + len(BEGIN)] + "\n  " + block + "\n  " + page[j:]
if new != page:
    PAGE.write_text(new)
linked = sum(1 for p in parts for pl in p["lists"] if pl.get("list"))
print(f"music book: Helen's chapters written into the Music Room, {linked} with their playlist's link" + (" and the rest waiting for theirs" if waiting else ", every one"))
