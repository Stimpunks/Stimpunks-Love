#!/usr/bin/env python3
"""Build Club Chronic's stage, its paste-up and its record rack, and the credits.

ONE DATA FILE, ONE TOOL, TWO SURFACES -- the contract make-chappell.py,
make-den.py and make-hermitage.py keep.

THE SELECTION IN THE RACK IS NOT THIS ROOM'S. It is the six racks from
It Take a Joyful Sound on starstuff.earth, our sibling site, and the room says
so beside them. What is written here was written here: the notes are this
room's rather than that page's, for the reason make-readings.py gives about the
glossary -- two of our own sites reciting the same paragraphs makes an argument
you can only follow by having read the other one.

WHAT IT REFUSES:

  - A SONG WITH NO RUNTIME, and A PLAYLIST THAT HAS ONE. Both directions, in
    one tool, which is the first time this street has needed that: a song has a
    length and withholding it keeps back the thing that lets somebody decide,
    and a playlist somebody keeps adding to does NOT have one, so storing
    today's total publishes a number that is wrong next week and looks
    authoritative in the meantime. make-jungle.py refuses a runtime and
    make-den.py requires one; this room contains both kinds of object and has
    to hold both rules at once without letting either leak onto the other.
  - AN ID THAT IS NOT A YOUTUBE ID, because love-embed.js validates before it
    builds and returns QUIETLY -- a typo is a button somebody presses and
    presses that never becomes a player.
  - A PLAYLIST FRAME POINTING SOMEWHERE THE SITE WILL NOT FRAME. The origins
    are in love-embed.js AND in the Content-Security-Policy, and a URL that is
    in neither renders as a blank box with no error anywhere. This checks the
    same list at build time so it fails here instead of in somebody's browser.
  - A START POINT THAT IS NOT A YOUTUBE ID, ONE STORED TWICE, A SET OF THEM ON
    A PLAYLIST THAT CANNOT USE THEM, AND A SET WITH NO DATE ON IT. The stage
    starts its YouTube playlist at a random one of these, because the embed
    cannot shuffle and cannot take a position -- only /embed/<id>?list= moves
    the starting point, which is why the file holds ids rather than a count.
    They are pulled by tools/pull-club.py and they DRIFT, so the date is part
    of the claim: a list of ids nobody can say they measured is the thing
    data/hermitage.json's header already forbids. The Spotify deck has none and
    must not be given any -- its frame has no such lever, and an attribute that
    does nothing is a feature somebody will later believe in.
  - A DECK THAT IS BOTH A DOOR AND A SCREEN, AND A DOOR CARRYING START POINTS.
    A deck marked how: link is a way OUT and gets no frame -- the Jungle Room's
    state: link and the Pebble Board's how: link, arriving on a stage. Qobuz is
    the first one here: it publishes no embed, and framing the playlist anyway
    renders a catalogue page with a Listen on Qobuz button and nothing on it
    that plays. THAT IS THE TRAP, because it frames perfectly -- no
    X-Frame-Options, no frame-ancestors, nothing for a checker to catch -- and
    what arrives is a link wearing the shape of a window, promising the one
    action it cannot do. A door carrying a frame is somebody halfway through
    changing their mind, and a door carrying start points is a draw nothing
    will ever read.

  - A SONG WITH NO CHANNEL. None of this music is ours.
  - A COLLECTION LINK WITH NO DESCRIPTION, because a wall of bare links is a
    bookmark folder rather than a room.
"""
import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data/club.json"
ROOM = ROOT / "club-chronic.html"
NOTES = ROOT / "liner-notes.html"

YT = re.compile(r"^[A-Za-z0-9_-]{11}$")


def origins():
    """The origins this site will build a frame for, READ rather than restated.

    This used to be a two-item tuple typed out here and described as being in
    three places on purpose. It was a copy of a list that already had a single
    source of truth, and adding Apple Music is what exposed it: the origin goes
    in love-embed.js and the header is generated from there, so this tool WOULD
    have refused a deck the browser was perfectly willing to frame -- the
    _headers trap in miniature, a hand-kept copy of something that has to agree
    everywhere. It was made to read rather than edited a third time, which is
    what make-csp.py and make-sweetgrass.py already do. ADDING A SERVICE IS ONE
    EDIT IN love-embed.js AND A RE-RUN OF make-csp.py."""
    js = (ROOT / "love-embed.js").read_text()
    block = re.search(r"var ORIGINS = \[(.*?)\];", js, re.S)
    if not block:
        raise SystemExit(
            "REFUSING: love-embed.js has no ORIGINS array, so this tool cannot tell\n"
            "whether a deck's frame points somewhere this site will actually build.")
    return tuple(re.findall(r"'(https://[^']+)'", block.group(1)))


def esc(s):
    return html.escape(s, quote=False)


def swap(page, marker, block, indent=""):
    begin, end = f"<!-- {marker}:begin -->", f"<!-- {marker}:end -->"
    src = page.read_text()
    if begin not in src or end not in src:
        raise SystemExit(
            f"REFUSING: {page.name} has no {marker} markers, so there is nowhere\n"
            "to write. Add them on purpose rather than letting this tool render nothing."
        )
    page.write_text(re.sub(re.escape(begin) + r".*?" + re.escape(end),
                           lambda m: begin + "\n" + block + "\n" + indent + end, src, flags=re.S))


def check(data):
    bad = []
    racks = data.get("racks") or []
    plays = data.get("playlists") or []
    cols = data.get("collections") or []
    if not racks:
        bad.append("data/club.json has no racks, and the back wall is made of them.")
    if not plays:
        bad.append("data/club.json has no playlists, and the stage is made of them.")
    if not cols:
        bad.append("data/club.json has no collections to pin by the door.")

    seen = set()
    for r in racks:
        for s in r.get("songs") or []:
            t = (s.get("title") or "").strip() or "<untitled>"
            vid = (s.get("id") or "").strip()
            if not YT.match(vid):
                bad.append(f"{t!r} has {vid!r}, which is not a YouTube id.")
            if vid in seen:
                bad.append(f"{vid} is in the rack twice.")
            seen.add(vid)
            if not (s.get("channel") or "").strip():
                bad.append(f"{t!r} has no channel, and none of this music is ours.")
            if not (s.get("length") or "").strip() or not (s.get("spoken") or "").strip():
                bad.append(f"{t!r} has no runtime. Every control here says how long first.")
            if not (s.get("note") or "").strip():
                bad.append(f"{t!r} has no note written for this room.")

    for pl in plays:
        n = (pl.get("name") or "").strip() or "<unnamed>"
        src = (pl.get("frame") or "").strip()
        door = (pl.get("how") or "").strip() == "link"
        if not (pl.get("note") or "").strip():
            bad.append(f"the {n} playlist has no note. A deck that does not say what it is "
                       "or what pressing it does is a bare link with a heading over it.")
        if door:
            if src:
                bad.append(f"the {n} playlist is a door and carries a frame as well. It is "
                           "one or the other: a door is a way out precisely because the "
                           "service will not give us a player, and a frame beside it is "
                           "somebody halfway through changing their mind.")
            if pl.get("starts"):
                bad.append(f"the {n} playlist is a door and carries start points. Nothing "
                           "reads them, because nothing here builds it a frame to start.")
        elif not src.startswith(origins()):
            bad.append(f"the {n} playlist frames {src!r}, which is not an origin this site "
                       "will build. Add it to love-embed.js AND to _headers, or it renders "
                       "as a blank box with no error anywhere.")
        if not (pl.get("out") or "").strip():
            bad.append(f"the {n} playlist has no way out to the service it is on.")
        starts = pl.get("starts") or []
        if starts and not door:
            if not src.startswith("https://www.youtube-nocookie.com/") or \
                    "/embed/videoseries?" not in src:
                bad.append(f"the {n} playlist carries start points, but its frame is not "
                           "the form that can use one. Only "
                           "/embed/<id>?list= moves a starting point; on anything else "
                           "the attribute renders and does nothing, which is worse than "
                           "not having it.")
            if not (pl.get("starts_pulled") or "").strip():
                bad.append(f"the {n} playlist's start points carry no date. They are "
                           "mirrored from somebody else's list and they drift; a set of "
                           "ids nobody can say they measured is the thing this repo "
                           "refuses everywhere else.")
            seen_s = set()
            for sid in starts:
                if not YT.match(sid):
                    bad.append(f"the {n} playlist has {sid!r} as a start point, which is "
                               "not a YouTube id. love-embed.js would refuse it quietly "
                               "and the press would become nothing.")
                if sid in seen_s:
                    bad.append(f"the {n} playlist has {sid} as a start point twice. The "
                               "playlist itself may well hold that song twice -- several "
                               "of these do -- but a start point is a video rather than a "
                               "position, so both copies open the same place and the "
                               "second only doubles its odds. pull-club.py drops repeats; "
                               "a file with one in it was edited by hand.")
                seen_s.add(sid)
        # THE INVERSE OF THE RULE ABOVE, in the same tool.
        if (pl.get("length") or pl.get("spoken")):
            bad.append(f"the {n} playlist carries a runtime. It is a list somebody keeps "
                       "adding to; today's total is wrong next week and authoritative in "
                       "the meantime. Say it runs until you stop it.")

    for c in cols:
        t = (c.get("title") or "").strip() or "<untitled>"
        if not (c.get("url") or "").strip():
            bad.append(f"the {t!r} collection goes nowhere.")
        if not (c.get("what") or "").strip():
            bad.append(f"the {t!r} collection has no description; a wall of bare links is "
                       "a bookmark folder rather than a room.")
        if not (c.get("where") or "").strip():
            bad.append(f"the {t!r} collection does not say what it is on.")
    return bad


def pasteup(cols):
    return "\n".join(
        '      <li class="flyer">\n'
        f'        <p class="flyer__where">{esc(c["where"])}</p>\n'
        f'        <h3>{esc(c["title"])}</h3>\n'
        f'        <p>{esc(c["what"])}</p>\n'
        f'        <p class="flyer__go"><a href="{esc(c["url"])}">Go &rarr;</a></p>\n'
        '      </li>'
        for c in cols)


def stage(plays):
    out = []
    for pl in plays:
        # THE LABEL SAYS WHERE IT STARTS, because every control on this street
        # says what it is about to do before it is pressed. A deck that quietly
        # began in the middle of the list would look like a bug to the one
        # person who knows the playlist's running order.
        starts = pl.get("starts") or []
        attr = ('\n                data-embed-starts="' + " ".join(starts) + '"') if starts else ""
        label = ("Press to play &middot; starts somewhere random &middot; runs until you stop it"
                 if starts else "Press to play &middot; runs until you stop it")
        # A DOOR IS NOT SHAPED LIKE A SCREEN, and that is the whole reason it
        # gets its own markup rather than a facade with a different label. The
        # Jungle Room gives its link-outs a 16:9 box because they stand in a
        # grid of screens and have to line up with them; on this stage a 16:9
        # box IS the shape of a player, so this one is not given one.
        if (pl.get("how") or "").strip() == "link":
            out.append(
                f'      <div class="deck deck--{esc(pl["slug"])} deck--away">\n'
                f'        <p class="deck__where">{esc(pl["name"])}</p>\n'
                f'        <h3>{esc(pl["title"])}</h3>\n'
                f'        <p class="deck__by">Kept by {esc(pl["by"])}</p>\n'
                f'        <p>{esc(pl["note"])}</p>\n'
                f'        <a class="deck__away" href="{esc(pl["out"])}">Open it on '
                f'{esc(pl["name"])[3:] or esc(pl["name"])} &rarr;'
                f'<span class="deck__off">Off site &middot; nothing on this page plays it</span>'
                f'</a>\n'
                '      </div>')
            continue
        out.append(
            f'      <div class="deck deck--{esc(pl["slug"])}">\n'
            f'        <p class="deck__where">{esc(pl["name"])}</p>\n'
            f'        <h3>{esc(pl["title"])}</h3>\n'
            f'        <p class="deck__by">Kept by {esc(pl["by"])} &middot; '
            f'<a href="{esc(pl["out"])}">open it there &rarr;</a></p>\n'
            f'        <p>{esc(pl["note"])}</p>\n'
            f'        <button type="button" class="facade" data-embed-src="{esc(pl["frame"])}"\n'
            f'                data-embed-title="{esc(pl["title"])} on {esc(pl["name"])[3:] or esc(pl["name"])}"'
            f'{attr}>'
            f'{label}</button>\n'
            '      </div>')
    return "\n".join(out)


def rackwall(racks):
    out = []
    for r in racks:
        out.append(
            f'    <section class="rack">\n'
            f'      <p class="rack__no">Rack {esc(r["n"])}</p>\n'
            f'      <h2>{esc(r["title"])}</h2>\n'
            f'      <p class="rack__intro">{esc(r["intro"])}</p>\n'
            f'      <ul class="sleeves">')
        for s in r["songs"]:
            when = f' &middot; {esc(s["when"])}' if s.get("when") else ""
            out.append(
                '        <li class="sleeve">\n'
                f'          <p class="sleeve__role">{esc(s["role"])}</p>\n'
                f'          <h3>{esc(s["title"])}</h3>\n'
                f'          <p class="sleeve__by">{esc(s["artist"])}{when} &middot; {esc(s["length"])}</p>\n'
                f'          <p>{esc(s["note"])}</p>\n'
                f'          <button type="button" class="facade" data-embed-id="{esc(s["id"])}"\n'
                f'                  data-embed-title="{esc(s["artist"])} &mdash; {esc(s["title"])}">'
                f'Play &middot; {esc(s["spoken"])}</button>\n'
                '        </li>')
        out.append('      </ul>\n    </section>')
    return "\n".join(out)


def credit_rows(racks):
    return "\n".join(
        f'      <tr><td><strong>{esc(s["title"])}</strong></td><td>{esc(s["artist"])}</td>'
        f'<td>{esc(s["when"]) or "&mdash;"}</td><td>{esc(s["length"])}</td>'
        f'<td>{esc(s["channel"])}</td>'
        f'<td><a href="https://www.youtube.com/watch?v={esc(s["id"])}">watch</a></td></tr>'
        for r in racks for s in r["songs"])


def main():
    data = json.loads(DATA.read_text())
    bad = check(data)
    if bad:
        print("REFUSING to build Club Chronic:")
        for b in bad:
            print("  - " + b)
        return 1

    swap(ROOM, "club-pasteup", pasteup(data["collections"]), "    ")
    swap(ROOM, "club-stage", stage(data["playlists"]), "    ")
    swap(ROOM, "club-rack", rackwall(data["racks"]), "  ")
    swap(NOTES, "club-credits", credit_rows(data["racks"]), "      ")

    songs = sum(len(r["songs"]) for r in data["racks"])
    print(f"club chronic: {len(data['playlists'])} playlists on the stage, {songs} songs in "
          f"{len(data['racks'])} racks, {len(data['collections'])} collections on the wall, "
          "credits rebuilt. Nothing hosted here.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
