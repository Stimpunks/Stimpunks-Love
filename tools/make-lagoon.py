#!/usr/bin/env python3
"""Build Black Leather Lagoon's screen and its rack of records, and the credits.

ONE DATA FILE, ONE TOOL, TWO SURFACES -- the contract make-chappell.py,
make-den.py, make-club.py and make-hermitage.py keep.

WHAT IT REFUSES:

  - A SONG WITH NO RUNTIME, AND A PLAYLIST THAT HAS ONE. Both directions in one
    tool, which make-club.py already holds and which this room needs for the
    same reason: a song has a length, and withholding it keeps back the thing
    that lets somebody decide; a playlist somebody keeps adding to does not have
    one, so storing today's total publishes a number that is wrong next week and
    looks authoritative in the meantime. Do not make them agree.

  - AN ID THAT IS NOT A YOUTUBE ID, because love-embed.js validates before it
    builds and returns QUIETLY -- a typo is a button somebody presses and
    presses that never becomes a player.

  - A FRAME POINTING SOMEWHERE THIS SITE WILL NOT FRAME. The origins live in
    love-embed.js's ORIGINS array and the header is generated from it, so this
    reads that array rather than restating it -- make-club.py's lesson, which
    cost it a hand-kept third copy. ADDING A SERVICE IS ONE EDIT THERE AND A
    RE-RUN OF make-csp.py.

  - A SONG WITH NO YEAR AND NO RELEASE. This is the refusal that is particular
    to this room, and it exists because of what the uploads say about
    themselves. Every record in this rack is an auto-generated upload off the
    band's own artist channel, and every one of those carries a 'Released on'
    line giving the date of the REISSUE that was licensed rather than the date
    of the record: 1984 for most of this rack, which is a compilation, and 2014
    for three of them. Trusting it would have printed 1984 beside a 1978
    single, in the one field a reader has no way of checking. The years in the
    data file were resolved separately and the file says how; a song that
    arrives without one does not get a guess.

  - A NOTE SHAPED LIKE VERSE. make-rabbit-hole.py's rule, in the room that needs
    it most. This street says in three places that nothing musical is hosted
    here, and a page built out of ONE BAND -- whose words are half of why
    anybody loves them -- is exactly where that promise would be broken in the
    way that looked most affectionate. Several short hand-broken lines is what a
    lyric looks like in a JSON string and what a sentence never does.

  - A COVER THAT DOES NOT SAY WHOSE IT IS. Half of this band's method was
    digging up other people's forgotten singles, so an uncredited cover here
    would be the one failure the subject of the room would have minded most.
    Either field without the other is refused, because a note saying 'a cover'
    with nobody's name on it is worse than not mentioning it.

  - A RANKED RACK. No best, no greatest, no essential, no definitive, nothing
    numbered as a countdown. A rack of one band's records is precisely the shape
    of thing that grows into a ranking, and a ranking is the pebbling cabinet's
    tally wearing a leather jacket: it turns a room where you might press one
    thing into a list somebody is being asked to agree or disagree with. The
    pattern is narrow on purpose -- check-counts.py's first run refused a
    sentence that counted nothing, and make-guild.py's refused the verb in 'a
    book it points at', and both were narrowed rather than excepted.

  - AN HTML ENTITY IN ANY FIELD, because everything here is escaped on the way
    into the markup, so '&mdash;' in the data file arrives on the page as eight
    literal characters. data/toys.json carries this lesson for a data attribute
    and data/rabbit-hole.json for a string that got uppercased; this is the
    third shape of it. Write the character.
"""
import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data/lagoon.json"
ROOM = ROOT / "black-leather-lagoon.html"
NOTES = ROOT / "liner-notes.html"

YT = re.compile(r"^[A-Za-z0-9_-]{11}$")
ENTITY = re.compile(r"&(?:[a-zA-Z][a-zA-Z0-9]{1,31}|#\d{1,6}|#x[0-9a-fA-F]{1,6});")

# NARROW ON PURPOSE. Each of these only ever introduces a ranking; none of them
# is a thing somebody would write about a single record in passing. "Best" alone
# would have refused "the best thing about it", which is ordinary prose about
# one song and not a league table, so it is only refused where a superlative is
# being applied to the rack.
RANKING = re.compile(
    r"\b(?:best|greatest|essential|definitive|top)\s+(?:\d+\s+)?"
    r"(?:songs?|tracks?|records?|singles?|cuts?)\b"
    r"|\bcountdown\b|\branked\b|\bno\.?\s*1\b|\b#\s*1\b", re.I)

# What a lyric looks like in a JSON string: several short lines, hand broken.
VERSE_LINE = 52


def origins():
    """The origins this site will build a frame for, READ rather than restated.

    make-club.py's note says why this is a read and not a tuple: the list lives
    in love-embed.js, make-csp.py generates the header out of it, and a tool
    holding its own copy is a tool that refuses a deck the browser was perfectly
    willing to frame."""
    js = (ROOT / "love-embed.js").read_text()
    block = re.search(r"var ORIGINS = \[(.*?)\];", js, re.S)
    if not block:
        raise SystemExit(
            "REFUSING: love-embed.js has no ORIGINS array, so this tool cannot tell\n"
            "whether the screen's frame points somewhere this site will actually build.")
    return tuple(re.findall(r"'(https://[^']+)'", block.group(1)))


def esc(s):
    return html.escape(s, quote=False)


def swap(page, marker, block, indent=""):
    begin, end = f"<!-- {marker}:begin -->", f"<!-- {marker}:end -->"
    src = page.read_text()
    if begin not in src or end not in src:
        raise SystemExit(
            f"REFUSING: {page.name} has no {marker} markers, so there is nowhere\n"
            "to write. Add them on purpose rather than letting this tool render nothing.")
    page.write_text(re.sub(re.escape(begin) + r".*?" + re.escape(end),
                           lambda m: begin + "\n" + block + "\n" + indent + end,
                           src, flags=re.S))


def looks_like_verse(text):
    lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
    return len(lines) >= 3 and all(len(ln) <= VERSE_LINE for ln in lines)


def check(data):
    bad = []
    songs = data.get("songs") or []
    pl = data.get("playlist") or {}

    if not songs:
        bad.append("data/lagoon.json has no songs, and the rack is made of them.")
    if not pl:
        bad.append("data/lagoon.json has no playlist, and the screen is made of it.")

    # ── the screen ───────────────────────────────────────────────────────────
    src = (pl.get("frame") or "").strip()
    if not src.startswith(origins()):
        bad.append(
            f"the screen frames {src!r}, which is not an origin this site will build. "
            "Add it to love-embed.js and re-run make-csp.py, or it renders as a blank "
            "box with no error anywhere.")
    if not (pl.get("out") or "").strip():
        bad.append("the screen has no way out to the service it is on.")
    if not (pl.get("note") or "").strip():
        bad.append("the screen has no note. A facade that does not say what it is or "
                   "what pressing it does is a bare link with a heading over it.")
    # THE INVERSE OF THE SONG RULE, in the same tool. See the docstring.
    if pl.get("length") or pl.get("spoken"):
        bad.append(
            "the playlist carries a runtime. It is a list somebody keeps adding to; "
            "today's total is wrong next week and authoritative in the meantime. Say "
            "it runs until you stop it.")

    # ── the rack ─────────────────────────────────────────────────────────────
    seen = set()
    for s in songs:
        t = (s.get("title") or "").strip() or "<untitled>"
        vid = (s.get("id") or "").strip()
        if not YT.match(vid):
            bad.append(f"{t!r} has {vid!r}, which is not a YouTube id.")
        if vid in seen:
            bad.append(f"{vid} is in the rack twice.")
        seen.add(vid)
        if not (s.get("channel") or "").strip():
            bad.append(f"{t!r} has no channel. None of this music is ours.")
        if not (s.get("length") or "").strip() or not (s.get("spoken") or "").strip():
            bad.append(f"{t!r} has no runtime. Every control here says how long first.")
        if not (s.get("when") or "").strip() or not (s.get("on") or "").strip():
            bad.append(
                f"{t!r} has no year or no release. The uploads in this rack date the "
                "REISSUE that was licensed and not the record, so an unresolved year "
                "here is a guess printed in the one field a reader cannot check. "
                "Resolve it and write down where, or leave the song out.")
        note = (s.get("note") or "").strip()
        if not note:
            bad.append(f"{t!r} has no note written for this room.")
        if looks_like_verse(note):
            bad.append(
                f"{t!r}'s note is several short hand-broken lines, which is what a "
                "lyric looks like and what a sentence never does. Nothing musical is "
                "hosted on this street and no words of this band's are on this page.")
        if RANKING.search(note) or RANKING.search(s.get("role") or ""):
            bad.append(
                f"{t!r} ranks the rack. Nothing here is best, greatest or numbered: a "
                "rack of one band's records is the shape of thing that grows a league "
                "table, and a league table turns a room into an argument.")
        has_cover = bool((s.get("cover_of") or "").strip())
        has_said = bool((s.get("role_note") or "").strip())
        if has_cover != has_said:
            bad.append(
                f"{t!r} is half-credited as a cover. This band's method was digging up "
                "other people's forgotten singles; a cover here says whose it is and "
                "when, or it is not marked as one at all.")
        for field in ("title", "note", "role", "on", "channel", "role_note"):
            v = s.get(field) or ""
            if ENTITY.search(v):
                bad.append(
                    f"{t!r}'s {field} contains an HTML entity. Everything here is "
                    "escaped on the way into the page, so it would arrive as literal "
                    "characters. Write the character itself.")
    return bad


def screen(pl):
    return (
        f'      <div class="feature">\n'
        f'        <p class="feature__where">{esc(pl["name"])}</p>\n'
        f'        <h3>{esc(pl["title"])}</h3>\n'
        f'        <p class="feature__by">Kept by {esc(pl["by"])} &middot; '
        f'<a href="{esc(pl["out"])}">open it there &rarr;</a></p>\n'
        f'        <p>{esc(pl["note"])}</p>\n'
        f'        <button type="button" class="facade" data-embed-src="{esc(pl["frame"])}"\n'
        f'                data-embed-title="{esc(pl["title"])} on YouTube">'
        f'Press to play &middot; runs until you stop it</button>\n'
        f'      </div>')


def rack(songs):
    out = []
    for s in songs:
        cover = (f'          <p class="post__cover">{esc(s["role_note"])}</p>\n'
                 if s.get("role_note") else "")
        out.append(
            '      <li class="post">\n'
            f'        <div class="post__card">\n'
            f'          <p class="post__role">{esc(s["role"])}</p>\n'
            f'          <h3>{esc(s["title"])}</h3>\n'
            f'          <p class="post__by">{esc(s["on"])} &middot; {esc(s["when"])} '
            f'&middot; {esc(s["length"])}</p>\n'
            f'{cover}'
            f'          <p>{esc(s["note"])}</p>\n'
            f'          <button type="button" class="facade" data-embed-id="{esc(s["id"])}"\n'
            f'                  data-embed-title="The Cramps &mdash; {esc(s["title"])}">'
            f'Play &middot; {esc(s["spoken"])}</button>\n'
            f'        </div>\n'
            '      </li>')
    return "\n".join(out)


def credit_rows(songs):
    return "\n".join(
        f'      <tr><td><strong>{esc(s["title"])}</strong></td>'
        f'<td>{esc(s["on"])}</td><td>{esc(s["when"])}</td><td>{esc(s["length"])}</td>'
        f'<td>{esc(s["channel"])}</td>'
        f'<td><a href="https://www.youtube.com/watch?v={esc(s["id"])}">watch</a></td></tr>'
        for s in songs)


def main():
    data = json.loads(DATA.read_text())
    bad = check(data)
    if bad:
        print("REFUSING to build Black Leather Lagoon:")
        for b in bad:
            print("  - " + b)
        return 1

    swap(ROOM, "lagoon-screen", screen(data["playlist"]), "    ")
    swap(ROOM, "lagoon-rack", rack(data["songs"]), "    ")
    swap(NOTES, "lagoon-credits", credit_rows(data["songs"]), "      ")

    covers = sum(1 for s in data["songs"] if s.get("cover_of"))
    print(f"black leather lagoon: one screen, {len(data['songs'])} records on posts "
          f"({covers} of them other people's songs, credited), credits rebuilt. "
          "Nothing hosted here.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
