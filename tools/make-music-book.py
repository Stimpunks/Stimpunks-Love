#!/usr/bin/env python3
"""The Faery Yurt Music Book: Helen Edgar's playlists, written into her Music Room.

Helen's document of 2026-11-19 ("Read and push"), kept in data/music-book.json in her
own words: her welcome, six parts, and every playlist's songs as she listed them. This
tool writes it between music-book markers in faery-music-room.html, one chapter to a
playlist, folded, with its songs in order and a link that opens the playlist on YouTube.

EVERY PLAYLIST IS A BAR THAT PLAYS IT ON A PRESS (Helen's asks, 2026-11-21 and 2026-11-24:
"host them too like my Strange things will happen and faery yarn ... just a book per
playlist", then "have them set out like symphrenia chill and strange things will happen",
which reverses the first day's "nothing here plays"). Each playlist is a bar like the
phonograph's own, always in sight: one button that puts the whole playlist on where it
stands, built by love-embed.js, so it can be hosted on the radio and followed like any
list, saying it runs until you stop it and never a length, because a list somebody keeps
adding to has none. Under each bar its songs are folded, with the link that opens the
playlist on YouTube. No records on a shelf: she said there are too many. The first
playlist's songs ship unfolded, so the render checkers measure them; the rest are the
same markup, folded. A playlist YouTube does not show keeps its name and songs on the
page and says it is not on YouTube yet, with no bar and no link; its id from the document
stays in the data as 'was'.

'since' holds the playlists Helen made after the book, their songs read off YouTube, under
a heading of their own so her parts' own counts and her welcome's total stay her words.

It refuses: a part whose own count of playlists ("Sixteen playlists ...") is not the
number of chapters under it, so her words can never go stale; a playlist id that is not
YouTube's shape; a chapter with no songs; the welcome's total if it is not the number of
chapters in her six parts; a playlist given a runtime; a button that is not exactly one
to a linked chapter, or whose address is not that playlist's with autoplay=1; and a
frame, an audio or a video written into the markers. Never hand-edit between the markers.
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


book = DATA["parts"]
since = DATA.get("since")
parts = book + ([since] if since else [])
total = sum(len(p["lists"]) for p in book)
m = re.search(r"holds (\d+) playlists", " ".join(DATA["welcome"]))
if m and int(m.group(1)) != total:
    refuse(f"the welcome says the book holds {m.group(1)} playlists and it holds {total}: the words must say what is there.")
seen = set()
for p in parts:
    first = p["about"].split()[0].lower()
    if p is not since and first in WORDS and WORDS[first] != len(p["lists"]):
        refuse(f"{p['part']} says {first} playlists and has {len(p['lists'])} under it.")
    for pl in p["lists"]:
        if "runtime" in pl or "runs" in pl:
            refuse(f"{pl['name']} is a playlist and has no length to give: take its runtime out.")
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
out.append('    <p class="mus-book__how">Every playlist is a bar: press it and the whole playlist goes on right here, and runs until you stop it. Under each bar are its songs, in the playlist&rsquo;s own order, and a link that opens it on YouTube. Nothing plays, and nothing is fetched from YouTube, until you press.'
           + (' A playlist that says it is not on YouTube yet is on its way.' if waiting else '') + '</p>')
opened = False
for p in parts:
    if p is since:
        out.append(f'    <h3 class="mus-book__part" id="music-book-since">{esc(p["name"])}</h3>')
    else:
        pid = f"music-book-{slug(p['part'])}"
        out.append(f'    <h3 class="mus-book__part" id="{pid}">{esc(p["part"])}: {esc(p["name"])}</h3>')
    out.append(f'    <p class="mus-book__about">{esc(p["about"])}</p>')
    out.append('    <div class="mus-book__shelf">')
    for pl in p["lists"]:
        name = esc(pl["name"])
        songs = "\n            ".join(f"<li>{esc(s)}</li>" for s in pl["songs"])
        if pl.get("list"):
            src = f'https://www.youtube-nocookie.com/embed/videoseries?list={pl["list"]}&amp;autoplay=1'
            top = (f'<div class="mus-book__play"><button type="button" class="facade" data-embed-src="{src}" '
                   f'data-embed-title="{name}, Helen&rsquo;s playlist, on YouTube">\n'
                   f'          Put on {name} &mdash; runs until you stop it\n'
                   f'          <span class="facade__play">&#9654; PRESS PLAY</span>\n'
                   f'        </button></div>')
            go = (f'<p class="mus-book__go"><a href="https://www.youtube.com/playlist?list={pl["list"]}" '
                  f'rel="noopener">Listen to {name} on YouTube</a></p>')
        else:
            top = f'<p class="mus-book__title">{name}</p>'
            go = '<p class="mus-book__go mus-book__go--soon">Not on YouTube yet.</p>'
        first_open = "" if opened or not pl.get("list") else " open"
        opened = opened or bool(first_open)
        out.append(f'''      <div class="mus-book__list" id="music-book-{slug(pl["name"])}">
        {top}
        <details class="mus-book__more"{first_open}>
          <summary class="mus-book__name">The songs on {name}</summary>
          {go}
          <ol class="mus-book__songs">
            {songs}
          </ol>
        </details>
      </div>''')
    out.append('    </div>')
out.append(f'    <p class="mus-book__from">From my Music Book, 19 November 2026. The playlists are on <a href="{esc(DATA["channel"])}" rel="noopener">my YouTube channel</a>.</p>')
out.append('  </section>')
block = "\n".join(out)

if re.search(r"<iframe|<audio|<video", block):
    refuse("the music book holds a frame or a player of its own; a chapter plays only through its button, which love-embed.js turns into the frame.")
linked_ids = [pl["list"] for p in parts for pl in p["lists"] if pl.get("list")]
srcs = re.findall(r'data-embed-src="([^"]+)"', block)
if srcs != [f"https://www.youtube-nocookie.com/embed/videoseries?list={i}&amp;autoplay=1" for i in linked_ids]:
    refuse("every linked chapter has exactly one button, its own playlist's with autoplay=1, and nothing else in the book plays.")
if block.count('class="facade"') != len(linked_ids) or "data-embed-id" in block:
    refuse("the music book has a play button that is not a chapter's playlist.")
if '<script src="love-embed.js"' not in PAGE.read_text():
    refuse("faery-music-room.html does not load love-embed.js, so a chapter's button would press and do nothing.")

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
