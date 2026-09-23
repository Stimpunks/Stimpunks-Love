#!/usr/bin/env python3
"""Rebuild the jukebox list and the decks in pink-pony-club.html from data/jukebox.json.

The tracks are between the two markers below and nothing else in the page is
touched. Every id in that file came out of our own published Double Rainbow page,
except where a video has since stopped playing and carries a 'replaced' note
saying where its id came from instead; the titles and channels were
resolved against YouTube's oEmbed endpoint rather than typed from memory. If you add a track, add it there and run this —
do not hand-edit the list, because a hand-edited entry has no provenance.

IT ALSO BUILDS THE DECKS, WHICH ARE NOT THE JUKEBOX. The tracks are one song
each, off our own published page. The decks are whole playlists on our own
channel, there to be put on and left running. WHAT IT REFUSES:

  - A RUNTIME ON A PLAYLIST. make-club.py holds this pair of rules and so does
    make-chappell.py: a list we keep adding to has no length, so today's total
    is wrong the next time it changes and looks authoritative meanwhile. This
    room never promised a runtime on anything, which is why the jukebox cards
    do not carry one -- but the refusal belongs here anyway, because a number
    would be added by somebody being helpful.

  - A FRAME THIS SITE WILL NOT BUILD, read out of love-embed.js's ORIGINS
    rather than restated, and A FRAME WITH NO list= IN IT. love-embed.js
    returns quietly for a URL it does not recognise, so either one is a button
    somebody presses and presses that never becomes a player.

  - A HELD PLAYLIST WITH NO REASON, and EVERY PLAYLIST HELD. 'held' is the
    Jungle Room's dark cam arriving on a dancefloor: the entry keeps its place
    in the data with the date and the diagnosis on it, and nothing renders. A
    hold with no reason written down gets deleted by the next person to read
    the file; a tray with everything held is a heading over an empty box.
"""
import json, re, pathlib, html

ROOT = pathlib.Path(__file__).resolve().parent.parent
data = json.loads((ROOT / "data/jukebox.json").read_text())


def origins():
    """The origins this site will build a frame for, READ rather than restated.

    make-csp.py, make-sweetgrass.py, make-club.py and make-chappell.py all read
    the same array. A hand-kept copy of a list with a single source of truth is
    the _headers trap in miniature."""
    js = (ROOT / "love-embed.js").read_text()
    block = re.search(r"var ORIGINS = \[(.*?)\];", js, re.S)
    if not block:
        raise SystemExit("REFUSING: love-embed.js has no ORIGINS array to check a frame against.")
    return tuple(re.findall(r"'(https://[^']+)'", block.group(1)))


problems = []
playlists = data.get("playlists") or []
if not playlists:
    problems.append("data/jukebox.json has no playlists, and the decks are made of them.")
for pl in playlists:
    n = pl.get("title") or "<untitled>"
    url = (pl.get("frame") or "").strip()
    if not url.startswith(origins()):
        problems.append(f"the {n} playlist frames {url!r}, which is not an origin this site "
                        "will build. love-embed.js would refuse it quietly.")
    if "list=" not in url:
        problems.append(f"the {n} playlist's frame carries no list id, so it is not a playlist "
                        "at all and the object is a lie about what it plays.")
    if pl.get("length") or pl.get("spoken") or pl.get("runtime"):
        problems.append(f"the {n} playlist carries a runtime. It is a list we keep adding to; "
                        "today's total is wrong the next time it changes. Say it runs until "
                        "you stop it.")
    for field in ("title", "note", "out"):
        if not pl.get(field):
            problems.append(f"the {n} playlist has no {field}.")
    if pl.get("state") == "held" and not (pl.get("why") or "").strip():
        problems.append(f"the {n} playlist is held with no reason written down. A hold nobody "
                        "can explain is deleted by the next person who reads this file.")
if playlists and not [pl for pl in playlists if pl.get("state") != "held"]:
    problems.append("every playlist on the decks is held, so the tray would render as a heading "
                    "over an empty box. Say so in the room's own copy instead.")
if problems:
    raise SystemExit("REFUSING to build the jukebox:\n  - " + "\n  - ".join(problems))

items = []
for t in data["tracks"]:
    label = f'{t["artist"]} — {t["title"]}'
    items.append(
        '    <li class="track">\n'
        f'      <h3>{html.escape(t["artist"])}</h3>\n'
        f'      <p>{html.escape(t["note"])}</p>\n'
        f'      <button type="button" class="facade" data-embed-id="{t["id"]}" '
        f'data-embed-title="{html.escape(label, quote=True)}">\n'
        f'        {html.escape(t["title"])}\n'
        '        <span class="facade__play">▶ PRESS PLAY</span>\n'
        '      </button>\n'
        f'      <p style="margin:9px 0 0;font-size:12px;color:#6b3a55;">on YouTube, '
        f'via {html.escape(t["channel"])}</p>\n'
        '    </li>')

# THE DECKS. A held playlist renders NOTHING -- the Jungle Room's rule for a
# dark cam. The room does not carry a control that cannot work, and the entry
# keeps its place in the data with the date and the diagnosis on it.
decks = []
for pl in playlists:
    if pl.get("state") == "held":
        continue
    decks.append(
        '      <li class="decks__rec">\n'
        f'        <h3>{html.escape(pl["title"])}</h3>\n'
        f'        <p>{html.escape(pl["note"])}</p>\n'
        f'        <button type="button" class="facade" '
        f'data-embed-src="{html.escape(pl["frame"], quote=True)}" '
        f'data-embed-title="{html.escape(pl["title"], quote=True)} on YouTube">\n'
        '          Put it on &mdash; runs until you stop it\n'
        '          <span class="facade__play">▶ PRESS PLAY</span>\n'
        '        </button>\n'
        '        <p class="decks__via">Our own playlist, on YouTube. No runtime on a playlist: '
        'it is a list we keep adding to, so a total here would be wrong the next time it '
        f'changed. <a href="{html.escape(pl["out"], quote=True)}">Open it there &rarr;</a></p>\n'
        '      </li>')

page = ROOT / "pink-pony-club.html"
src = page.read_text()


def swap(src, marker, block, indent):
    begin, end = f"<!-- {marker}:begin -->", f"<!-- {marker}:end -->"
    if begin not in src or end not in src:
        raise SystemExit(
            f"REFUSING: pink-pony-club.html has no {marker} markers, so there is nowhere to\n"
            "write. A generator that writes nothing and exits 0 is how two surfaces drift apart.")
    return re.sub(re.escape(begin) + r".*?" + re.escape(end),
                  lambda m: begin + "\n" + block + "\n" + indent + end, src, flags=re.S)


src = swap(src, "jukebox", "\n".join(items), "    ")
src = swap(src, "decks", "\n".join(decks), "    ")
page.write_text(src)

held = [pl["title"] for pl in playlists if pl.get("state") == "held"]
print(f"jukebox: {len(data['tracks'])} tracks and {len(decks)} deck(s) written to {page.name}")
for t in held:
    print(f"  held, nothing rendered: {t} — see its 'why' in data/jukebox.json")
