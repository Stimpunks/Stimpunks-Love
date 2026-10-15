#!/usr/bin/env python3
"""Build the Faery Yurt's phonograph, its yarn on the phonograph, and the rack of songs under it.

HELEN ASKED FOR ALL OF THIS, on 2026-10-13, through Ryan: the rack for her
playlist, and a phonograph drawn after a photograph of a reproduction gramophone
she sent, with a record that turns at MAX GLITTER. The room is hers, so the ask
is the licence; what this tool adds is the street's plumbing round it.

ONE DATA FILE, ONE TOOL, TWO SURFACES -- the contract make-yells.py set. The
yarn is Helen's own playlist, Faery Yurt's Yarn, put on whole; the rack is every
song on it, one press each; the credits go to liner-notes.html.

THE RACK IS A SHELF OF RECORDS (Helen's ask, 2026-10-15): each song is a sleeve
in one of her six spine colours with the disc peeking out, standing on its own
plank, and the press under it puts it on the phonograph. The sleeve and the disc
are §14's clothes; the behaviour is unchanged.

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
pl = d.get("playlist") or {}
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
if not LIST.match(str(pl.get("list", ""))):
    problems.append("playlist.list: not a YouTube playlist id.")
if not pl.get("title"):
    problems.append("playlist.title: the playlist's own name.")
if "runtime" in pl:
    problems.append("playlist: carries a runtime. Helen keeps adding to it, and a total here would "
                    "be wrong the day she did.")
if not tracks:
    problems.append("tracks: none. A rack with nothing on it is a heading over nothing.")

seen = set()
for i, t in enumerate(tracks):
    where = f"tracks[{i}] ({t.get('artist', '?')}, {t.get('title', '?')})"
    if not ID.match(str(t.get("id", ""))):
        problems.append(f"{where}: not a YouTube id. love-embed.js returns quietly on one, and the "
                        "button would never become a video.")
    elif t["id"] in seen:
        problems.append(f"{where}: {t['id']} is on the rack twice.")
    seen.add(t.get("id"))
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


def what(s):
    # *words* is italic, for a title inside a line ("from *Schitt's Creek*").
    return re.sub(r"\*([^*]+)\*", r"<i>\1</i>", esc(s))


def swap(path, marker, block, indent=""):
    src = path.read_text()
    pat = re.compile(rf"(<!-- {re.escape(marker)}:begin -->).*?(\n[ \t]*<!-- {re.escape(marker)}:end -->)", re.S)
    if not pat.search(src):
        raise SystemExit(f"REFUSING: no <!-- {marker}:begin --> / :end pair in {path.name}.")
    path.write_text(pat.sub(lambda m: m.group(1) + "\n" + indent + block + m.group(2), src, count=1))


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


swap(ROOM, "yurt-yarn:phonograph",
     '<div class="yurt-phono" aria-hidden="true">\n' +
     "\n".join(("        " if line.startswith(("<svg", "</svg")) else "          ") + line
               for line in phonograph()) +
     '\n      </div>', "      ")

# ── The whole yarn, on the phonograph ────────────────────────────────────────
yarn_src = f'https://www.youtube-nocookie.com/embed/videoseries?list={pl["list"]}&autoplay=1'
swap(ROOM, "yurt-yarn:deck",
     f'<div class="yurt-deck">\n'
     f'      <div class="yurt-deck__glass" data-rack-screen="yarn" '
     f'data-rack-off="The whole yarn is off until you put it back.">\n'
     f'        <button type="button" class="facade" data-embed-src="{attr(yarn_src)}" '
     f'data-embed-title="{attr(pl["title"])}, Helen’s playlist, on YouTube">\n'
     f'          Put on {esc(pl["title"])} &mdash; runs until you stop it\n'
     f'          <span class="facade__play">&#9654; PRESS PLAY</span>\n'
     f'        </button>\n'
     f'      </div>\n'
     f'      <p class="yurt-deck__now" data-rack-now="yarn" tabindex="-1" hidden></p>\n'
     f'      <p class="yurt-deck__back" hidden><button type="button" class="yurt-back" '
     f'data-rack-back="yarn">Take it off and put the whole yarn back</button></p>\n'
     f'    </div>\n'
     f'    <p class="yurt-deck__credit"><a href="https://www.youtube.com/playlist?list='
     f'{attr(pl["list"])}">{esc(pl["title"])}</a>, on YouTube, from my own channel.</p>', "    ")

# ── The rack ─────────────────────────────────────────────────────────────────
cards = []
for i, t in enumerate(tracks):
    who, title, rt = t["artist"], t["title"], t["runtime"]
    extra = f'\n          <p class="yurt-track__what">{what(t["what"])}</p>' if t.get("what") else ""
    if t.get("replaced"):
        extra += f'\n          <p class="yurt-track__note">{esc(t["replaced"]["says"])}</p>'
    cards.append(
        f'        <li class="yurt-track" data-rack-card>\n'
        f'          <span class="yurt-disc" aria-hidden="true"></span>\n'
        f'          <div class="yurt-sleeve yurt-sleeve--{i % 6 + 1}">\n'
        f'            <h3 class="yurt-track__title">{esc(title)}</h3>\n'
        f'            <p class="yurt-track__who">{esc(who)}</p>\n'
        f'          </div>{extra}\n'
        f'          <button type="button" class="facade" data-embed-id="{attr(t["id"])}" '
        f'data-embed-title="{attr(who)} &mdash; {attr(title)}">\n'
        f'            Play it here &mdash; {esc(rt)}\n'
        f'            <span class="facade__play">&#9654; PRESS PLAY</span>\n'
        f'          </button>\n'
        f'          <button type="button" class="yurt-track__up" hidden data-rack-to="yarn" '
        f'data-rack-name="{SCREEN}" '
        f'data-rack-src="https://www.youtube-nocookie.com/embed/{attr(t["id"])}?autoplay=1&amp;rel=0" '
        f'data-rack-title="{attr(who)} &mdash; {attr(title)}, on {SCREEN}" '
        f'data-rack-film="{attr(who)}, {attr(title)}" '
        f'data-rack-runtime="{attr(rt)}">Put it on {SCREEN} &mdash; {esc(rt)}</button>\n'
        f'          <p class="yurt-track__credit">{esc(rt)} &middot; on YouTube, via {esc(t["channel"])}</p>\n'
        f'        </li>')

swap(ROOM, "yurt-yarn:rack",
     f'<p class="section-intro yurt-rack__intro">Or pick a record off the shelf. Every song says how long it runs before '
     f'you press it, and nothing plays until you do. Each one plays where it hangs, or goes on '
     f'{SCREEN} in place of the whole yarn, and taking it off puts the yarn back without '
     f'starting it.</p>\n'
     '    <details class="yurt-rack" open>\n'
     '      <summary class="yurt-rack__sum">Every song on the yarn</summary>\n'
     '      <ol class="yurt-rack__cards">\n' + "\n".join(cards) + '\n      </ol>\n'
     f'      <p class="yurt-rack__from">Read off the yarn on {esc(d["_checked"])}, in its own order. '
     f'A song I add plays on the whole yarn straight away, and turns up here the next time somebody '
     f'reads the playlist again.</p>\n'
     '    </details>', "    ")

credit_rows = [
    f'      <tr><td>{esc(t["title"])}</td><td><strong>{esc(t["artist"])}</strong></td>'
    f'<td>{esc(t["channel"])}</td><td>{esc(t["runtime"])}</td></tr>'
    for t in tracks]
swap(NOTES, "yurt-yarn-credits", "\n".join(credit_rows).lstrip(), "      ")

# ── What the room promises about the record ──────────────────────────────────
page = ROOM.read_text()
if page.count(f'class="{DISC}"') != 1:
    problems.append(f"{ROOM.name}: the record ({DISC}) should be on the page exactly once.")
if "turns the record" not in page:
    problems.append(f"{ROOM.name}: the dial's line no longer says MAX turns the record. If that "
                    "changed on purpose, change this check with it; if not, put it back.")
css = CSS.read_text()
s14 = css[css.find("/* §14 "):css.find("/* §15 ")]
for m in re.finditer(r"([^{}]*)\{([^{}]*)\}", s14):
    sel, body = m.group(1), m.group(2)
    if DISC in sel and re.search(r"\banimation\b", body):
        for part in sel.split(","):
            if DISC in part and 'html[data-intensity="max"]' not in part:
                problems.append(f"love.css §14: the record turns under {part.strip()!r}. It turns at MAX "
                                "and nowhere else; the dial's line in the room says so.")
if not re.search(r'html\[data-intensity="max"\][^{]*' + re.escape(DISC) + r'[^{]*\{[^}]*animation', s14):
    problems.append("love.css §14: nothing turns the record at MAX, and the dial says MAX does.")
if problems:
    raise SystemExit("REFUSING:\n  " + "\n  ".join(problems))

replaced = [t for t in tracks if t.get("replaced")]
print(f"faery yurt: the phonograph drawn, {len(tracks)} songs on the rack under it, and the whole "
      f"yarn on the phonograph, in {ROOM.name}; {len(credit_rows)} credit rows in {NOTES.name}")
if replaced:
    print("  playing another upload than the playlist's, until Helen swaps it on the yarn: " +
          "; ".join(f'{t["artist"]}, {t["title"]} (the yarn has {t["replaced"]["was"]})' for t in replaced))
