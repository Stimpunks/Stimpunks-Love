#!/usr/bin/env python3
"""Build the Faery Yurt's phonograph and songbook, and the Music Room's phonograph, yarn and record case.

THE YARN PLAYS IN THE MUSIC ROOM AND NOWHERE ELSE, since 2026-10-18, Helen's ask
at the keyboard: the playlist re-read "so it runs as one", the songs "so they
look like a book case for people to click on and play in the music room page",
and in the yurt itself "just a gramophone with a book listing all tracks for
people to look through - it will only play in the music room though". That
reverses her own arrangement of 2026-10-13 (below), which put the whole yarn
and the rack in the yurt; DECISIONS.md says so. So now: the PHONOGRAPH is drawn
into both rooms; the DECK (the whole yarn, one press, runs until you stop it)
and the RECORD CASE are written into the Music Room only; and the yurt gets a
SONGBOOK under its phonograph, bound like Nature Notes, a song to a line with
its runtime, each line a link to that record in the Music Room. This tool
refuses the yarn or a record on the yurt's page, and a line in the book with no
record behind it. The yurt's record still turns at MAX, because the dial's line
in there still says so.

HELEN ASKED FOR ALL OF THIS, on 2026-10-13, through Ryan: the rack for her
playlist, and a phonograph drawn after a photograph of a reproduction gramophone
she sent, with a record that turns at MAX GLITTER. The room is hers, so the ask
is the licence; what this tool adds is the street's plumbing round it.

ONE DATA FILE, ONE TOOL, TWO SURFACES -- the contract make-yells.py set. The
yarn is Helen's own playlist, Faery Yurt's Yarn, put on whole; the rack is every
song on it, one press each; the credits go to liner-notes.html.

THE RACK IS A RECORD CASE (Helen's asks, 2026-10-15 and -16): an arched case in
the same design as her bookcases, with every song an LP sleeve standing on a
plank, in one of her six spine colours with the disc peeking out of the top.
THE SLEEVE IS THE PRESS: it is the card's data-rack-to button, so pressing it
takes the record out, puts it on the phonograph and plays it, and it says how
long the record runs before the press. A small "play it here instead" line
under each sleeve is still the card's own facade, because the CB's
watch-together finds a song by that button; it is dressed as a line, not a
plate. The case, the sleeves and the disc are §14's clothes; the behaviour is
rack.js's, unchanged.

THE RACK IS rack.js's PATTERN AND THE SCREEN IS THE PHONOGRAPH. Every song plays
where it hangs, or goes up on the phonograph in place of the whole yarn, and
taking it off puts the yarn's own plate back without playing it. The behaviour
is rack.js's and the look is §14's, in Helen's own colours: every class here is
the room's, and rack.js finds the parts by their data-rack-* attributes. The
rack is a <details> that SHIPS OPEN, because a shut rack is text
check-contrast-live.py and check-focus.py cannot measure.

THE PHONOGRAPH IS DRAWN HERE, NOT TYPED INTO THE PAGE, because its bell is
geometry -- twelve gores from a throat to a scalloped lip -- and a drawing worked
out once and pasted is a drawing nobody can change. It is drawn only in colours
the room already had: her declared ones (--candle, --ember-2, --tallow,
--tallow-3, the tent's darks), the browns her portrait frame and shutters use,
and two of her book spines (the amber one for the brass and the case, the red
one for the label and the plaque). NO NEW COLOUR ARRIVES IN HER ROOM THROUGH A
DRAWING. It carries no words, so the share card and the contrast tools have
nothing to read in it; it is aria-hidden, and the paragraph beside it is what is
read.

THE RECORD TURNS AT MAX AND NOWHERE ELSE. The dial's own line in that room says
MAX "lights the fairy lights and turns the record", which was true of the little
record this replaced and has to stay true of this one. (Since 2026-10-14 it goes
on to say nothing else moves unless you ask it to: Join the faeries and Grow a
garden, which move only when pressed.) So the tool refuses a rule in love.css that animates the disc under
any selector but MAX's, and refuses the page if the dial stops saying so. The
record is a circle in a group squashed to the angle you see the turntable at,
and it is the circle that turns, so the label's moon and star go round the
spindle in perspective. The shine on the record does NOT turn: it is where the
light is, and light does not go round with a record.

WHAT IT REFUSES, besides that:

  - A SONG WITH NO RUNTIME. Every press-to-play control on this street says how
    long before the press.
  - A RUNTIME ON THE PLAYLIST. Helen keeps adding to it; a total would be wrong
    the day she did. make-club.py's pair, in her room.
  - AN ID THAT IS NOT A YOUTUBE ID, because love-embed.js returns quietly on one
    and the button never becomes a video.
  - A REPLACEMENT NOBODY WROTE DOWN. When a song on the playlist dies and the
    rack plays another upload of it, the entry carries `replaced`: the id it
    replaced, the day, what was measured, and the sentence the card says. The
    card says it out loud, because the whole yarn still reaches the dead copy
    until Helen swaps it on her own playlist, and that is hers to do. When she
    has, read the playlist again and take the `replaced` off.
  - AN HTML ENTITY IN ANY FIELD. Everything is escaped on the way into the page;
    write the character. data/toys.json's lesson.

WHAT IT DOES NOT CHECK, on purpose: whether the rack still matches the playlist.
That needs the network. The rack is a mirror and drifts by design -- the room
says so, with the date it was read -- and check-jukebox.py is what notices a song
that has died.
"""
import html
import json
import math
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data/yurt-yarn.json"
ROOM = ROOT / "faery-yurt.html"
MUSIC = ROOT / "faery-music-room.html"
# THE PHONOGRAPH STANDS IN BOTH ROOMS (the Music Room since Helen's ask of
# 2026-10-16, "for those who just want to listen and not scroll"), drawn into
# each from this one tool; the Music Room wears it in its own classes (mus-),
# because a class is global and §14's names are the yurt's (check-classes.py),
# and its section of love.css dresses it in the Reading Room's colours. THE
# MUSIC IS THE MUSIC ROOM'S ALONE since 2026-10-18: the deck and the record
# case go there and the songbook goes in the yurt, both from the one data file,
# so the book and the case cannot name different songs.
READING = ROOT / "faery-reading-room.html"
# THE READING ROOM HAS A GRAMOPHONE OF ITS OWN since 2026-10-18 (Helen's third
# ask that day: "a gramophone to switch on and off and a shelf of records to
# choose from"), with its own playlist, Library Music, in its own classes
# (rdr-, §114), and nothing of it in the yurt's songbooks, which are the Music
# Room's catalogue. Each playlist names its room; the deck, the case and the
# way back are written into that room, and into no other.
SURFACES = ((ROOM, "yurt", 14), (MUSIC, "mus", 115), (READING, "rdr", 114))
ROOMS = {
    "music": {"page": MUSIC, "prefix": "mus", "screen": "the phonograph",
              "off": "The playlists are off until you put one back.",
              "back": "Take it off and put the playlists back",
              "where": "the Music Room"},
    "reading": {"page": READING, "prefix": "rdr", "screen": "the gramophone",
                "off": "The gramophone is off until you switch it on again.",
                "back": "Switch the gramophone off",
                "where": "the Reading Room"},
}
BOOKED = "music"  # the room whose playlists the yurt's songbooks list
PER_PAGE = 7  # songs to a page of a songbook
NOTES = ROOT / "liner-notes.html"
CSS = ROOT / "love.css"

ID = re.compile(r"^[A-Za-z0-9_-]{11}$")
LIST = re.compile(r"^PL[A-Za-z0-9_-]{10,40}$")
RUNTIME = re.compile(r"^(?:\d+:)?[0-5]?\d:[0-5]\d$")
DATE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
ENTITY = re.compile(r"&(?:[a-zA-Z][a-zA-Z0-9]{1,31}|#\d{1,6}|#x[0-9a-fA-F]{1,6});")

SCREEN = "the phonograph"
DISC = "yurt-phono__disc"

d = json.loads(DATA.read_text())
# TWO PLAYLISTS SINCE 2026-10-18 (Helen's second ask that day, "also add this to
# the music room"): each is put on whole from the deck, has a record case of
# its own, and a run of pages of its own in the songbook, and every track says
# which it is on. They are never mixed into one shelf: the order on a shelf is
# the playlist's own.
pls = d.get("playlists") or []
tracks = d.get("tracks") or []
problems = []


def no_entity(v, where):
    if isinstance(v, str) and ENTITY.search(v):
        problems.append(f"{where}: an HTML entity ({ENTITY.search(v).group(0)}). Write the "
                        "character; everything is escaped on the way into the page.")
    elif isinstance(v, dict):
        for k, x in v.items():
            no_entity(x, f"{where}.{k}")
    elif isinstance(v, list):
        for i, x in enumerate(v):
            no_entity(x, f"{where}[{i}]")


no_entity(d, "data")
if not DATE.match(str(d.get("_checked", ""))):
    problems.append("_checked: the day the playlist was read, as YYYY-MM-DD. The room prints it.")
if not pls:
    problems.append("playlists: none.")
for i, pl in enumerate(pls):
    if not LIST.match(str(pl.get("list", ""))):
        problems.append(f"playlists[{i}].list: not a YouTube playlist id.")
    if not pl.get("title"):
        problems.append(f"playlists[{i}].title: the playlist's own name.")
    if "runtime" in pl:
        problems.append(f"playlists[{i}]: carries a runtime. Helen keeps adding to it, and a total here "
                        "would be wrong the day she did.")
    if pl.get("room") not in ROOMS:
        problems.append(f"playlists[{i}].room: must name the room it plays in, one of {sorted(ROOMS)}.")
    # Something to read with a playlist (Helen, 2026-10-25): a piece of writing
    # linked at the top of its shelf, with whoever wrote it named, because a link
    # with nobody's name on it is the credit this street keeps.
    rd = pl.get("read")
    if rd is not None:
        for k in ("href", "title", "by", "on"):
            if not (isinstance(rd, dict) and rd.get(k)):
                problems.append(f"playlists[{i}].read.{k} is missing: a piece to read with a playlist "
                                "says its address, its title, who wrote it and where it is published.")
        if isinstance(rd, dict) and rd.get("href") and not str(rd["href"]).startswith("https://"):
            problems.append(f"playlists[{i}].read.href: not an https address.")
lists =[pl.get("list") for pl in pls]
if len(set(lists)) != len(lists):
    problems.append("playlists: one is listed twice.")
if not tracks:
    problems.append("tracks: none. A rack with nothing on it is a heading over nothing.")
if not any(pl.get("room") == BOOKED for pl in pls):
    problems.append(f"playlists: none plays in {BOOKED!r}, so the yurt would have no songbook.")
for pl in pls:
    if not any(t.get("on") == pl.get("list") for t in tracks):
        problems.append(f"playlists: nothing is on {pl.get('title')!r}; a case with no records is a "
                        "heading over nothing.")

seen = set()
for i, t in enumerate(tracks):
    where = f"tracks[{i}] ({t.get('artist', '?')}, {t.get('title', '?')})"
    if not ID.match(str(t.get("id", ""))):
        problems.append(f"{where}: not a YouTube id. love-embed.js returns quietly on one, and the "
                        "button would never become a video.")
    elif t["id"] in seen:
        problems.append(f"{where}: {t['id']} is on the rack twice.")
    seen.add(t.get("id"))
    if t.get("on") not in lists:
        problems.append(f"{where}: `on` does not name one of the playlists.")
    if t.get("door") and t.get("state") != "link":
        problems.append(f"{where}: a door (an upload its channel will not let other sites frame) must "
                        "also say state: link, which is how check-jukebox.py knows not to expect the frame.")
    if t.get("state") == "link" and not t.get("door"):
        problems.append(f"{where}: state is link with no `door` saying what was measured and when.")
    if not RUNTIME.match(str(t.get("runtime", ""))):
        problems.append(f"{where}: no runtime. Every press-to-play control on this street says how "
                        "long before the press.")
    for k in ("artist", "title", "channel"):
        if not t.get(k):
            problems.append(f"{where}: no {k}.")
    r = t.get("replaced")
    if r is not None:
        for k in ("was", "on", "why", "says"):
            if not r.get(k):
                problems.append(f"{where}: replaced.{k} is missing. A replacement nobody wrote down "
                                "is the original bug with a fresh id on it.")
        if r.get("was") and (not ID.match(r["was"]) or r["was"] == t.get("id")):
            problems.append(f"{where}: replaced.was must be the id on the playlist, and not this one.")
        if r.get("on") and not DATE.match(r["on"]):
            problems.append(f"{where}: replaced.on is not a date.")

if problems:
    raise SystemExit("REFUSING, data/yurt-yarn.json:\n  " + "\n  ".join(problems))


def esc(s):
    return html.escape(s, quote=False)


def attr(s):
    return html.escape(s, quote=True)


def what_(s):
    # *words* is italic, for a title inside a line ("from *Schitt's Creek*").
    return re.sub(r"\*([^*]+)\*", r"<i>\1</i>", esc(s))


def swap(path, marker, block, indent=""):
    src = path.read_text()
    pat = re.compile(rf"(<!-- {re.escape(marker)}:begin -->).*?(\n[ \t]*<!-- {re.escape(marker)}:end -->)", re.S)
    if not pat.search(src):
        raise SystemExit(f"REFUSING: no <!-- {marker}:begin --> / :end pair in {path.name}.")
    path.write_text(pat.sub(lambda m: m.group(1) + "\n" + indent + block + m.group(2), src, count=1))


def dressed(block, prefix):
    """The same markup in the other room's class names: yurt- becomes mus-, and the
    yurt's shared `section-intro` becomes the room's own intro class."""
    if prefix == "yurt":
        return block
    return block.replace("yurt-", f"{prefix}-").replace("section-intro ", f"{prefix}-intro ")


def write_both(marker, block, indent=""):
    for page, prefix, _ in SURFACES:
        swap(page, marker, dressed(block, prefix), indent)


def write_room(room, marker, block, indent=""):
    swap(ROOMS[room]["page"], marker, dressed(block, ROOMS[room]["prefix"]), indent)


def in_room(room):
    return [pl for pl in pls if pl.get("room") == room]


# ── The phonograph ────────────────────────────────────────────────────────────
def n(x):
    return f"{x:.1f}".rstrip("0").rstrip(".")


def phonograph():
    """The drawing, as a list of SVG lines. Every colour is one the room had."""
    # THE MOUTH: an ellipse tipped so the bell opens up and to the left, and the
    # throat seen down it near the near wall, which is what makes it a bell and
    # not a fan.
    C = (80.0, 58.0); A, B = 70.0, 48.0; TH = math.radians(-28)
    U = (math.cos(TH), math.sin(TH)); V = (-math.sin(TH), math.cos(TH))

    def P(t, k=1.0):
        return (C[0] + k * (A * math.cos(t) * U[0] + B * math.sin(t) * V[0]),
                C[1] + k * (A * math.cos(t) * U[1] + B * math.sin(t) * V[1]))

    lip = P(0.7)
    T = (C[0] + 0.68 * (lip[0] - C[0]), C[1] + 0.68 * (lip[1] - C[1]))
    N = (158.0, 106.0)  # where the horn becomes a pipe
    GORES, OFF = 12, 0.18
    out = []
    o = out.append
    o('<svg viewBox="0 0 240 262" fill="none" aria-hidden="true" focusable="false">')
    o('<ellipse cx="120" cy="252" rx="104" ry="7" fill="#0C0908" opacity=".55"/>')

    # The outside of the horn, narrowing to the pipe, its seams all running down to it.
    ta, tb = -0.35, 2.05
    pa, pb = P(ta), P(tb)
    o(f'<path d="M{n(pa[0])} {n(pa[1])} Q166 70 {n(N[0] + 4)} {n(N[1] - 4)} L{n(N[0] - 3)} {n(N[1] + 5)} '
      f'Q128 118 {n(pb[0])} {n(pb[1])} Z" fill="#7A5324"/>')
    for i in range(GORES):
        t = (2 * math.pi * i / GORES + OFF + math.pi) % (2 * math.pi) - math.pi
        if ta + 0.05 < t < tb - 0.05:
            p = P(t)
            o(f'<path d="M{n(p[0])} {n(p[1])} Q{n((p[0] + N[0]) / 2 + 6)} {n((p[1] + N[1]) / 2 - 2)} '
              f'{n(N[0])} {n(N[1])}" stroke="#4A372B" stroke-width="1" opacity=".7"/>')
    o(f'<path d="M{n(pa[0])} {n(pa[1])} Q166 70 {n(N[0] + 4)} {n(N[1] - 4)}" stroke="#E9C874" '
      'stroke-width="1.4" opacity=".55"/>')

    # The inside of the bell: gores from the throat to a scalloped lip, the far
    # wall catching the candle and the near wall in shade, each with a sprig
    # pressed into it like the embossing on the photograph's horn.
    for i in range(GORES):
        t0 = 2 * math.pi * i / GORES + OFF
        t1 = 2 * math.pi * (i + 1) / GORES + OFF
        tm = (t0 + t1) / 2
        a, b, m = P(t0), P(t1), P(tm, 1.09)
        light = 0.5 + 0.5 * math.cos(tm - math.radians(200))
        shade = min(.92, (0.18 + 0.6 * (1 - light)) * 1.25 + (.14 if i % 2 else 0))
        gore = f'M{n(T[0])} {n(T[1])} L{n(a[0])} {n(a[1])} Q{n(m[0])} {n(m[1])} {n(b[0])} {n(b[1])} Z'
        o(f'<path d="{gore}" fill="{"#E9C874" if i % 2 else "#F2B673"}"/>')
        o(f'<path d="{gore}" fill="#7A5324" opacity="{shade:.2f}"/>')

        def G(k, dt=0.0):
            p = P(tm + dt)
            return (T[0] + k * (p[0] - T[0]), T[1] + k * (p[1] - T[1]))
        q, r = G(0.45), G(0.88)
        l1, l2 = G(0.66, -0.07), G(0.74, 0.07)
        m1, m2 = G(0.62), G(0.7)
        e1, e2 = G(0.78, -0.05), G(0.84, 0.05)
        bead = G(0.94)
        op = 0.25 + 0.35 * light
        o(f'<path d="M{n(q[0])} {n(q[1])} L{n(r[0])} {n(r[1])} M{n(m1[0])} {n(m1[1])} Q{n(l1[0])} {n(l1[1])} '
          f'{n(e1[0])} {n(e1[1])} M{n(m2[0])} {n(m2[1])} Q{n(l2[0])} {n(l2[1])} {n(e2[0])} {n(e2[1])}" '
          f'stroke="#7A5324" stroke-width=".9" stroke-linecap="round" opacity="{op:.2f}"/>')
        o(f'<circle cx="{n(bead[0])}" cy="{n(bead[1])}" r="1.3" fill="#7A5324" opacity="{op:.2f}"/>')
        o(f'<path d="M{n(T[0])} {n(T[1])} L{n(a[0])} {n(a[1])}" stroke="#7A5324" stroke-width=".8" opacity=".6"/>')
    # The dark down the throat.
    o(f'<defs><radialGradient id="yurt-phono-deep" gradientUnits="userSpaceOnUse" cx="{n(T[0])}" '
      f'cy="{n(T[1])}" r="62"><stop offset="0" stop-color="#150F0E" stop-opacity=".95"/>'
      '<stop offset=".35" stop-color="#2A1E17" stop-opacity=".55"/>'
      '<stop offset="1" stop-color="#2A1E17" stop-opacity="0"/></radialGradient></defs>')
    ring = " L".join(f"{n(x)} {n(y)}" for x, y in (P(2 * math.pi * i / 60) for i in range(60)))
    o(f'<path d="M{ring} Z" fill="url(#yurt-phono-deep)"/>')
    rim = []
    for i in range(GORES):
        t0 = 2 * math.pi * i / GORES + OFF
        t1 = 2 * math.pi * (i + 1) / GORES + OFF
        rim.append((P(t0), P((t0 + t1) / 2, 1.09), P(t1)))
    lipd = (f'M{n(rim[0][0][0])} {n(rim[0][0][1])} ' +
            " ".join(f"Q{n(m[0])} {n(m[1])} {n(b[0])} {n(b[1])}" for a, m, b in rim) + " Z")
    o(f'<path d="{lipd}" stroke="#4A372B" stroke-width="1.6" stroke-linejoin="round"/>')
    o(f'<path d="{lipd}" stroke="#F2E6D4" stroke-width=".7" stroke-linejoin="round" opacity=".45"/>')
    o(f'<ellipse cx="{n(T[0])}" cy="{n(T[1])}" rx="4.2" ry="3.2" fill="#2A1E17" '
      f'transform="rotate(-28 {n(T[0])} {n(T[1])})"/>')

    # The pipe from the horn into the post that holds it up.
    o(f'<path d="M{n(N[0])} {n(N[1])} Q170 104 173 116" stroke="#7A5324" stroke-width="8" stroke-linecap="round"/>')
    o(f'<path d="M{n(N[0])} {n(N[1] - 2.5)} Q169 101 175.5 113" stroke="#E9C874" stroke-width="1.4" '
      'stroke-linecap="round" opacity=".6"/>')
    o('<rect x="169" y="116" width="8" height="30" fill="#7A5324"/>')
    o('<path d="M171 117 V145" stroke="#E9C874" stroke-width="1.2" opacity=".55"/>')
    o('<rect x="166.5" y="142" width="13" height="5" rx="1.5" fill="#4A372B"/>')
    o('<circle cx="173" cy="117" r="6.5" fill="#8A5F26" stroke="#4A372B" stroke-width="1"/>')
    o('<circle cx="171" cy="115" r="2" fill="#E9C874" opacity=".7"/>')

    # The lid, seen from above, and the turntable on it.
    o('<path d="M50 176 H190 L178 134 H62 Z" fill="#2A1E17"/>')
    o('<path d="M62 134 H178" stroke="#4A372B" stroke-width="1"/>')
    o('<ellipse cx="120" cy="158" rx="57" ry="20.5" fill="#150F0E"/>')
    o('<ellipse cx="120" cy="156" rx="57" ry="20.5" fill="#3A2A20"/>')
    # THE RECORD: a circle in a group squashed to the turntable's angle. The
    # inner group is the one that turns (§14, MAX only), about the spindle,
    # which is this group's own origin.
    o('<g transform="translate(120 155.5) scale(1 .36)">')
    o(f'<g class="{DISC}">')
    o('<circle r="53" fill="#0C0908"/>')
    for r in (49, 45, 41, 37, 33, 29, 25):
        o(f'<circle r="{r}" stroke="#2C1F19" stroke-width=".8" vector-effect="non-scaling-stroke"/>')
    o('<circle r="18" fill="#8A3D34"/>')
    o('<circle r="18" stroke="#E9C874" stroke-width=".6" vector-effect="non-scaling-stroke" opacity=".7"/>')
    o('<circle r="12.5" stroke="#E9C874" stroke-width=".5" vector-effect="non-scaling-stroke" opacity=".5"/>')
    # The label's print, a moon and a star on one side: what you see go round.
    o('<path d="M-3 -14 A8 8 0 1 0 -3 -2 A6 6 0 1 1 -3 -14 Z" fill="#E9C874"/>')
    o('<path d="M8 6 l1.3 2.8 3 .4 -2.2 2 .6 3 -2.7 -1.5 -2.7 1.5 .6 -3 -2.2 -2 3 -.4 Z" fill="#E9C874"/>')
    o('</g>')
    # The shine stays where the light is while the record turns under it.
    o('<path d="M-46 -20 A50 50 0 0 1 -14 -47" stroke="#F2E6D4" stroke-width="1.6" '
      'vector-effect="non-scaling-stroke" opacity=".22" stroke-linecap="round"/>')
    o('<path d="M30 40 A50 50 0 0 0 46 22" stroke="#F2E6D4" stroke-width="1.2" '
      'vector-effect="non-scaling-stroke" opacity=".14" stroke-linecap="round"/>')
    o('<circle r="2.4" fill="#E9C874"/>')
    o('</g>')

    # The case: the lid's lip, the carved front with its plaque, turned columns
    # at the corners, the crank, and a stepped black plinth.
    o('<rect x="44" y="172" width="152" height="7" rx="1.5" fill="#3A2A20"/>')
    o('<path d="M45 172.6 H195" stroke="#F2B673" stroke-width=".8" opacity=".35"/>')
    o('<rect x="52" y="179" width="136" height="54" fill="#8A5F26"/>')
    o('<rect x="52" y="206" width="136" height="27" fill="#7A5324"/>')
    o('<rect x="64" y="186" width="112" height="40" rx="3" stroke="#4A372B" stroke-width="1.6"/>')
    o('<rect x="66.5" y="188.5" width="107" height="35" rx="2" stroke="#F2B673" stroke-width=".6" opacity=".3"/>')
    for sx in (1, -1):
        def X(x):
            return n(120 + sx * (x - 120))
        o(f'<path d="M{X(102)} 206 C{X(94)} 196 {X(84)} 198 {X(84)} 205 C{X(84)} 211 {X(92)} 212 {X(93)} 206 '
          f'M{X(84)} 205 C{X(80)} 214 {X(72)} 215 {X(70)} 208 M{X(102)} 206 C{X(96)} 216 {X(88)} 220 {X(80)} 219" '
          'stroke="#4A372B" stroke-width="1.5" stroke-linecap="round"/>')
        o(f'<circle cx="{X(76)}" cy="196" r="1.6" fill="#4A372B"/>')
        o(f'<circle cx="{X(76)}" cy="217" r="1.6" fill="#4A372B"/>')
    o('<ellipse cx="120" cy="206" rx="16" ry="10.5" fill="#8A3D34" stroke="#E9C874" stroke-width="1.4"/>')
    o('<ellipse cx="120" cy="206" rx="11.5" ry="6.5" stroke="#E9C874" stroke-width=".7" opacity=".6"/>')
    o('<path d="M113 204.5 H127 M115 208 H125" stroke="#E9C874" stroke-width="1" opacity=".8"/>')
    for cx in (52, 188):
        o(f'<rect x="{cx - 7}" y="179" width="14" height="5" fill="#150F0E"/>')
        o(f'<rect x="{cx - 3}" y="184" width="6" height="44" fill="#1B1310"/>')
        for cy, rx in ((189, 5), (206, 5.5), (223, 5)):
            o(f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="2.6" fill="#150F0E"/>')
        o(f'<path d="M{cx - 1.5} 185 V227" stroke="#A4907B" stroke-width=".8" opacity=".35"/>')
        o(f'<rect x="{cx - 7}" y="228" width="14" height="5" fill="#150F0E"/>')
    o('<path d="M195 203 H206 L210 217" stroke="#7A5324" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>')
    o('<ellipse cx="211" cy="222" rx="3.4" ry="5" fill="#2A1E17" stroke="#E9C874" stroke-width=".8"/>')
    o('<path d="M38 233 H202 L206 241 H34 Z" fill="#1B1310"/>')
    o('<path d="M38 233.6 H202" stroke="#A4907B" stroke-width=".7" opacity=".3"/>')
    o('<path d="M30 241 H210 L214 250 H26 Z" fill="#150F0E"/>')
    o('<path d="M30 241.6 H210" stroke="#A4907B" stroke-width=".7" opacity=".25"/>')

    # The arm over the record, and the soundbox with its needle in the groove.
    o('<path d="M173 123 Q148 124 113 139" stroke="#7A5324" stroke-width="5.5" stroke-linecap="round"/>')
    o('<path d="M172 121 Q148 122 113 136.5" stroke="#E9C874" stroke-width="1.1" stroke-linecap="round" opacity=".6"/>')
    o('<path d="M106.5 149 L108.5 155" stroke="#F2E6D4" stroke-width="1.2" stroke-linecap="round"/>')
    o('<circle cx="105" cy="140" r="10" fill="#7A5324" stroke="#E9C874" stroke-width="1.2"/>')
    o('<circle cx="105" cy="140" r="6" fill="#2A1E17"/>')
    o('<circle cx="105" cy="140" r="3.6" stroke="#E9C874" stroke-width=".6" opacity=".5"/>')
    o('</svg>')
    return out


write_both("yurt-yarn:phonograph",
     '<div class="yurt-phono" aria-hidden="true">\n' +
     "\n".join(("        " if line.startswith(("<svg", "</svg")) else "          ") + line
               for line in phonograph()) +
     '\n      </div>', "      ")

# ── The whole yarn, on the Music Room's phonograph ───────────────────────────
# One plate per playlist, in one glass: rack.js keeps the glass's whole markup as
# the plate it puts back, so a record going up covers both and the way back
# restores both, without playing either.
def names(lists, sep=" and "):
    return sep.join(f'<a href="https://www.youtube.com/playlist?list={attr(pl["list"])}">{esc(pl["title"])}</a>' for pl in lists)


for room, R in ROOMS.items():
    plates = []
    for pl in in_room(room):
        src = f'https://www.youtube-nocookie.com/embed/videoseries?list={pl["list"]}&autoplay=1'
        plates.append(
            f'        <button type="button" class="facade" data-embed-src="{attr(src)}" '
            f'data-embed-title="{attr(pl["title"])}, Helen’s playlist, on YouTube">\n'
            f'          {"Switch on" if room == "reading" else "Put on"} {esc(pl["title"])} &mdash; runs until you stop it\n'
            f'          <span class="facade__play">&#9654; PRESS PLAY</span>\n'
            f'        </button>')
    # data-rack-switch: rack.js shows the way back once the glass's own plate is
    # pressed, so the one button is also the off switch (Helen, 2026-10-18).
    write_room(room, "yurt-yarn:deck",
         f'<div class="yurt-deck">\n'
         f'      <div class="yurt-deck__glass" data-rack-screen="yarn" data-rack-switch '
         f'data-rack-off="{attr(R["off"])}">\n'
         + "\n".join(plates) + '\n'
         f'      </div>\n'
         f'      <p class="yurt-deck__now" data-rack-now="yarn" tabindex="-1" hidden></p>\n'
         f'      <p class="yurt-deck__back" hidden><button type="button" class="yurt-back" '
         f'data-rack-back="yarn">{esc(R["back"])}</button></p>\n'
         f'    </div>\n'
         f'    <p class="yurt-deck__credit">{names(in_room(room))}, on YouTube, from my own channel.</p>', "    ")

# ── The record case, in the Music Room ───────────────────────────────────────
# Every slot carries an id, yurt-lp-<video id> (mus-lp-… once dressed), which is
# what a line in the yurt's songbook links to.
def card(i, t, SCREEN):
    who, title, rt = t["artist"], t["title"], t["runtime"]
    what = f'\n            <span class="yurt-lp__what">{what_(t["what"])}</span>' if t.get("what") else ""
    note = f'\n            <span class="yurt-lp__note">{esc(t["replaced"]["says"])}</span>' if t.get("replaced") else ""
    if t.get("door"):
        # A DOOR, NOT A SCREEN: its channel has embedding off, so a frame would
        # show YouTube's refusal where the record should be. The sleeve is a link
        # to the watch page, dressed dashed, and says so; nothing here presses.
        return (
            f'        <li class="yurt-lp__slot yurt-lp__slot--door" id="yurt-lp-{attr(t["id"])}">\n'
            f'          <a class="yurt-lp__sleeve yurt-lp__sleeve--{i % 6 + 1} yurt-lp__sleeve--door" '
            f'href="https://www.youtube.com/watch?v={attr(t["id"])}" rel="noopener">\n'
            f'            <span class="yurt-lp__disc" aria-hidden="true"></span>\n'
            f'            <span class="yurt-lp__title">{esc(title)}</span>\n'
            f'            <span class="yurt-lp__who">{esc(who)}</span>{what}\n'
            f'            <span class="yurt-lp__note">This one will not play in a frame here; the sleeve opens it on YouTube.</span>\n'
            f'            <span class="yurt-lp__go">Opens on YouTube &middot; {esc(rt)}</span>\n'
            f'          </a>\n'
            f'          <div class="yurt-lp__under">\n'
            f'          <p class="yurt-lp__credit">{esc(rt)} &middot; on YouTube, via {esc(t["channel"])}</p>\n'
            f'          </div>\n'
            f'        </li>')
    return (
        f'        <li class="yurt-lp__slot" id="yurt-lp-{attr(t["id"])}" data-rack-card>\n'
        f'          <button type="button" class="yurt-lp__sleeve yurt-lp__sleeve--{i % 6 + 1}" hidden data-rack-to="yarn" '
        f'data-rack-name="{SCREEN}" '
        f'data-rack-src="https://www.youtube-nocookie.com/embed/{attr(t["id"])}?autoplay=1&amp;rel=0" '
        f'data-rack-title="{attr(who)} &mdash; {attr(title)}, on {SCREEN}" '
        f'data-rack-film="{attr(who)}, {attr(title)}" '
        f'data-rack-runtime="{attr(rt)}">\n'
        f'            <span class="yurt-lp__disc" aria-hidden="true"></span>\n'
        f'            <span class="yurt-lp__title">{esc(title)}</span>\n'
        f'            <span class="yurt-lp__who">{esc(who)}</span>{what}{note}\n'
        f'            <span class="yurt-lp__go">Put it on {SCREEN} &middot; {esc(rt)}</span>\n'
        f'          </button>\n'
        f'          <div class="yurt-lp__under">\n'
        f'          <button type="button" class="facade" data-embed-id="{attr(t["id"])}" '
        f'data-embed-title="{attr(who)} &mdash; {attr(title)}">\n'
        f'            Play here instead &mdash; {esc(rt)}\n'
        f'            <span class="facade__play">&#9654; PRESS PLAY</span>\n'
        f'          </button>\n'
        f'          <p class="yurt-lp__credit">{esc(rt)} &middot; on YouTube, via {esc(t["channel"])}</p>\n'
        f'          </div>\n'
        f'        </li>')


for room, R in ROOMS.items():
    SCREEN = R["screen"]
    mine_lists = in_room(room)
    cases = []
    for pl in mine_lists:
        mine = [t for t in tracks if t.get("on") == pl["list"]]
        cards = [card(i, t, SCREEN) for i, t in enumerate(mine)]
        rd = pl.get("read")
        read = (f'      <p class="yurt-rack__read">To read with it: <a href="{attr(rd["href"])}">{esc(rd["title"])}</a>, '
                f'by {esc(rd["by"])}, on {esc(rd["on"])}.</p>\n') if rd else ""
        cases.append(
            '    <details class="yurt-rack" open>\n'
            f'      <summary class="yurt-rack__sum">Every song on {esc(pl["title"])}, as records on a shelf</summary>\n'
            + read +
            '      <div class="yurt-lp-case">\n'
            '      <ol class="yurt-lp">\n' + "\n".join(cards) + '\n      </ol>\n'
            '      </div>\n'
            '    </details>')
    many = len(mine_lists) > 1
    doors_here = any(t.get("door") for pl in mine_lists for t in tracks if t.get("on") == pl["list"])
    write_room(room, "yurt-yarn:rack",
         f'<p class="section-intro yurt-rack__intro">Or take a record off {"a" if many else "the"} shelf: press its sleeve and it goes on '
         f'{SCREEN} in place of the whole playlist and plays. Every sleeve says how long the record runs before '
         f'you press it, nothing plays until you do, and taking it off puts the '
         f'{"playlists back without starting either" if many else "playlist back without starting it"}.'
         + (' A sleeve that opens on YouTube instead says so: its channel will not let other sites frame it.' if doors_here else '')
         + '</p>\n'
         + "\n".join(cases) + '\n'
         f'    <p class="yurt-rack__from">Read off {"the playlists" if many else "the playlist"} on {esc(d["_checked"])}, '
         f'{"each shelf in its playlist’s" if many else "in its"} own order. A song I add plays on the whole playlist straight away, '
         f'and turns up on {"its" if many else "the"} shelf the next time somebody reads the playlist again.</p>', "    ")

# ── The songbook, in the yurt ────────────────────────────────────────────────
# Nature Notes' binding (yurt-notebook.js shuts it and turns its pages; with no
# script it is open and swipes), ruled pages, a song to a line. Each line links
# to that record in the Music Room; nothing here plays, and the tool checks the
# yurt's page for that below.
# A BOOK PER PLAYLIST, ITS NAME ON THE COVER (Helen, 2026-10-18: "with title of
# playlist as another book"), bound like Nature Notes. The Music Room's books
# stand under the yurt's gramophone; the Reading Room's stand on the yurt's
# Bookshelf, by the door through to it (Helen, the same evening: "a book for
# the main yurt page listing what is inside reading room same as we did for
# music room"). Every line goes to its record in its own room.
pages = []  # every page in every book, for the count the tool prints
books = {room: [] for room in ROOMS}


def book_for(pl, room):
    R = ROOMS[room]
    mine = [t for t in tracks if t.get("on") == pl["list"]]
    pages_here = []
    for n in range(0, len(mine), PER_PAGE):
        chunk = mine[n:n + PER_PAGE]
        lines = []
        for t in chunk:
            what = f' <span class="yurt-songbook__what">{what_(t["what"])}</span>' if t.get("what") else ""
            lines.append(
                f'            <li class="yurt-songbook__song"><a class="yurt-songbook__link" '
                f'href="{R["page"].name}#{R["prefix"]}-lp-{attr(t["id"])}">'
                f'<span class="yurt-songbook__who">{esc(t["artist"])}</span> '
                f'<span class="yurt-songbook__title">{esc(t["title"])}</span></a>{what} '
                f'<span class="yurt-songbook__time">{esc(t["runtime"])}</span></li>')
        no = len(pages_here) + 1
        say = (f'Page {no}: from {chunk[0]["artist"]}, {chunk[0]["title"]}, '
               f'to {chunk[-1]["artist"]}, {chunk[-1]["title"]}.' if len(chunk) > 1 else
               f'Page {no}: {chunk[0]["artist"]}, {chunk[0]["title"]}.')
        pages_here.append(
            f'        <li class="yurt-notebook__page" data-notebook-say="{attr(say)}">\n'
            f'          <p class="yurt-songbook__head">{esc(pl["title"])}</p>\n'
            f'          <ul class="yurt-songbook__list">\n' + "\n".join(lines) + '\n          </ul>\n'
            f'          <span class="yurt-notebook__no" aria-hidden="true">No. {no}</span>\n'
            f'        </li>')
    pages.extend(pages_here)
    return (
        f'<div class="yurt-notebook yurt-songbook" data-notebook>\n'
        f'      <button type="button" class="yurt-notebook__shut" data-notebook-open hidden>\n'
        f'        <span class="yurt-notebook__title">{esc(pl["title"])}</span>\n'
        f'        <span class="yurt-notebook__open">Open the book</span>\n'
        f'      </button>\n'
        f'      <div class="yurt-notebook__cover" data-notebook-book>\n'
        f'        <ul class="yurt-notebook__pages" tabindex="0" aria-label="{attr(pl["title"])}: every song on it, '
        f'in its own order; each line goes to that record in {R["where"]}" data-notebook-pages>\n'
        + "\n".join(pages_here) + '\n'
        f'        </ul>\n'
        f'        <span class="yurt-notebook__sweep" aria-hidden="true" data-notebook-sweep></span>\n'
        f'      </div>\n'
        f'      <div class="yurt-notebook__controls" data-notebook-controls hidden>\n'
        f'        <button type="button" class="yurt-notebook__btn" data-notebook-prev>&larr; Turn back</button>\n'
        f'        <button type="button" class="yurt-notebook__btn" data-notebook-close>Close the book</button>\n'
        f'        <button type="button" class="yurt-notebook__btn" data-notebook-next>Turn the page &rarr;</button>\n'
        f'      </div>\n'
        f'      <p class="sr" role="status" aria-live="polite" data-notebook-says></p>\n'
        f'    </div>')


for room in ROOMS:
    for pl in in_room(room):
        books[room].append(book_for(pl, room))

swap(ROOM, "yurt-yarn:book",
     "\n    ".join(books[BOOKED]) + '\n'
     f'    <p class="yurt-songbook__from">Every song on {names(in_room(BOOKED))}, my own playlists on YouTube, read off them on '
     f'{esc(d["_checked"])}, each in its own order, a book each. Press a line and it takes you to that record in the '
     f'<a href="faery-music-room.html">Music Room</a>, which is where the music plays, whole or one '
     f'record at a time. A song I add plays there straight away, and turns up in this book the next '
     f'time somebody reads the playlist again.</p>', "    ")

swap(ROOM, "yurt-yarn:readbook",
     "\n    ".join(books["reading"]) + '\n'
     f'    <p class="yurt-songbook__from">What is on the gramophone through there: every record on '
     f'{names(in_room("reading"))}, my own playlist on YouTube, read off it on {esc(d["_checked"])} in its own '
     f'order. Press a line and it takes you to that record on the shelf in the '
     f'<a href="faery-reading-room.html#gramophone">Reading Room</a>, which is where it plays, whole or one '
     f'record at a time.</p>', "    ")

titles = {pl["list"]: pl["title"] for pl in pls}
credit_rows = [
    f'      <tr><td>{esc(t["title"])}</td><td><strong>{esc(t["artist"])}</strong></td>'
    f'<td>{esc(t["channel"])}</td><td>{esc(t["runtime"])}</td><td>{esc(titles[t["on"]])}</td></tr>'
    for t in tracks]
swap(NOTES, "yurt-yarn-credits", "\n".join(credit_rows).lstrip(), "      ")

# ── What the room promises about the record ──────────────────────────────────
css = CSS.read_text()
for page_path, prefix, sec in SURFACES:
    disc = DISC.replace("yurt-", f"{prefix}-")
    page = page_path.read_text()
    if page.count(f'class="{disc}"') != 1:
        problems.append(f"{page_path.name}: the record ({disc}) should be on the page exactly once.")
    if "turns the record" not in page:
        problems.append(f"{page_path.name}: the dial's line no longer says MAX turns the record. If that "
                        "changed on purpose, change this check with it; if not, put it back.")
    part_css = css[css.find(f"/* §{sec} "):css.find(f"/* §{sec + 1} ")]
    if not part_css:
        problems.append(f"love.css: no §{sec} section to hold {page_path.name}'s record.")
    for m in re.finditer(r"([^{}]*)\{([^{}]*)\}", part_css):
        sel, body = m.group(1), m.group(2)
        if disc in sel and re.search(r"\banimation\b", body):
            for part in sel.split(","):
                if disc in part and 'html[data-intensity="max"]' not in part:
                    problems.append(f"love.css §{sec}: the record turns under {part.strip()!r}. It turns at MAX "
                                    "and nowhere else; the dial's line in the room says so.")
    if not re.search(r'html\[data-intensity="max"\][^{]*' + re.escape(disc) + r'[^{]*\{[^}]*animation', part_css):
        problems.append(f"love.css §{sec}: nothing turns the record at MAX, and the dial says MAX does.")
# ── Nothing on the yurt's page plays the yarn, and every line in the book has
# a record behind it (Helen, 2026-10-18: "it will only play in the music room").
room = ROOM.read_text()
if "videoseries?list=" in room or "data-rack-card" in room or 'data-embed-id="' in room:
    problems.append(f"{ROOM.name}: the yarn or a record is on the yurt's page. Since 2026-10-18 the music "
                    "plays in the Music Room and nowhere else; the yurt has the songbook.")
room_of = {pl["list"]: pl["room"] for pl in pls}
written = {rm: R["page"].read_text() for rm, R in ROOMS.items()}
for t in tracks:
    rm = room_of[t["on"]]
    if f'id="{ROOMS[rm]["prefix"]}-lp-{t["id"]}"' not in written[rm]:
        problems.append(f"{ROOMS[rm]['page'].name}: no record with id {ROOMS[rm]['prefix']}-lp-{t['id']} "
                        f"({t['artist']}, {t['title']}); the shelf did not take it, so a songbook's line "
                        "would go nowhere.")
for rm, R in ROOMS.items():
    if 'src="rack.js"' not in R["page"].read_text():
        problems.append(f"{R['page'].name}: the record case needs rack.js on the page, or no sleeve goes on {R['screen']}.")
if "data-notebook" not in room or 'src="yurt-notebook.js"' not in room:
    problems.append(f"{ROOM.name}: the songbook needs yurt-notebook.js on the page to shut and turn it.")
if problems:
    raise SystemExit("REFUSING:\n  " + "\n  ".join(problems))

replaced = [t for t in tracks if t.get("replaced")]
print(f"faery yurt: the phonograph drawn in {ROOM.name}, {MUSIC.name} and {READING.name}; "
      + "; ".join(f"{len(in_room(r))} playlist(s) whole and {sum(1 for t in tracks if any(t.get('on') == pl['list'] for pl in in_room(r)))} "
                  f"records in the case in {R['page'].name}" for r, R in ROOMS.items())
      + f"; {sum(len(b) for b in books.values())} songbooks over {len(pages)} pages in {ROOM.name}; {len(credit_rows)} credit rows in {NOTES.name}")
doors = [t for t in tracks if t.get("door")]
if doors:
    print("  doors, not screens (their channels refuse the frame): " +
          "; ".join(f'{t["artist"]}, {t["title"]}' for t in doors))
if replaced:
    print("  playing another upload than the playlist's, until Helen swaps it on the yarn: " +
          "; ".join(f'{t["artist"]}, {t["title"]} (the yarn has {t["replaced"]["was"]})' for t in replaced))
