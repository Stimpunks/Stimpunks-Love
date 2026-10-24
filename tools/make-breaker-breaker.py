#!/usr/bin/env python3
"""Build Breaker Breaker's convoy, its slang, its quotations, its rack and its credits, from data/breaker-breaker.json.

ONE DATA FILE, ONE TOOL, the contract make-yells.py set. The room is a
shopfront on the street for CB radios, CB slang, CB history and trucking,
Ryan's brief, 2026-10-24, with Dale Watson's trucking records and Convoy on a
rack. This writes, between bkb:<part> markers in breaker-breaker.html:

  · THE CAB (bkb:cab): night on the interstate from the driver's seat of a rig
    in the middle of a convoy, drawn in perspective from where the lamps on a
    real rig go. Lifted whole by make-og.py for the share card.
  · WHAT OUR CB TOOK FROM THE CITIZENS BAND (bkb:ours), THE QUOTATIONS
    (bkb:chatrooms, bkb:radio), THE SLANG (bkb:slang), THE RACK (bkb:rack) and
    THE CREDITS (bkb:credits).

THE LIGHT IS THE ROOM, and the tool holds it. Every light in Breaker Breaker is
a marker lamp: a point that shows where the edge of a rig is and lights nothing
round it. The colours are the law's, amber at the front and sides and red at
the back, so the drawing is made of those two, the night, and one dark line for
the shapes you can just make out (the mirror, the dash, the radio), and THE
TOOL REFUSES ANY OTHER COLOUR IN IT. The radio's readout is red too: a number
made of lit segments, which is a light used as a shape, the same idea.

WHAT IT REFUSES:

  · A LAMP THAT MOVES OR BLINKS. No @keyframes, animation or transition in the
    room's section of love.css (§125), and no hazard or turn signal drawn as
    one. The Repeater's mast is steady for the same reason, and Club Chronic's
    rule holds here: a blinking light is the first ambient effect a room of
    lamps would grow, and nothing on this page moves at any setting.
  · SLANG THAT NAMES PEOPLE UNKINDLY. Wikipedia's list has women, sex workers,
    people speaking another language and people crossing the border on foot in
    it, among others. Every phrase in the data's left_off is refused anywhere in
    the room, and the friendly edit is to fill the board out with the rest of
    the list.
  · A SONG'S WORDS. Convoy is a story told in CB talk, which makes it the most
    tempting page on the street to quote a line from. Any value in the data
    shaped like verse (several short hand-broken lines) is refused, which is
    make-rabbit-hole.py's rule; and the room's own text must not carry the
    song's best-known line (`_convoy_line` in this file is the pattern).
  · A RANKED RACK. No best, greatest, essential or countdown in our voice, the
    Lagoon's rule: the records are in the order they came out, and Convoy,
    which is older than all of them, closes the rack because it is a single
    and the rack is Dale Watson's records first.
  · A RECORD WITHOUT ITS YEAR, LABEL AND MUSICBRAINZ RECORD, or with a song
    whose length here is more than DRIFT seconds off the record's and does not
    say what plays instead. The cabin behind the door marked E's rule for a
    whole album, and the Lagoon's: the year is the record's, never the
    upload's.
  · A QUOTATION over the cap in the data, with no author, work and link, with
    no line saying how it was checked, or with an HTML entity in it; AND, WHERE
    THE KNOWLEDGE SYSTEM MIRROR IS ON THE MACHINE, ONE OF OURS THAT IS NOT ON
    ITS PAGE WORD FOR WORD. When our page changes, re-copy the quotation; never
    loosen the check.
  · A LINE ABOUT OUR CB THAT ITS OWN GUIDE OR CODE NO LONGER SAYS (`holds`),
    the Community Center's service-board rule: a sentence about the radio
    lives here, and the radio changes somewhere else.
  · A SOURCE WITH NO REVISION. Everything the room says about CB history, the
    slang and the lamps was read off Wikipedia at a revision, under CC BY-SA
    4.0, and the credits link that revision rather than the article as it is
    by the time somebody reads them.

IT NEEDS NOTHING BUT THE FILES. check-jukebox.py asks YouTube about every song.
Top-level underscore keys in the data are the record of why, and are skipped.
"""
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data/breaker-breaker.json"
ROOM = ROOT / "breaker-breaker.html"
CSS = ROOT / "love.css"
FACES = ROOT / "data/foundry-faces.json"
MIRROR = Path.home() / "Documents/Claude/Projects/Stimpunks Knowledge System/site/stimpunks.org"

DRIFT = 8
VIDEO = re.compile(r"[A-Za-z0-9_-]{11}")
LIST = re.compile(r"OLAK5uy_[A-Za-z0-9_-]{33}")
MBID = re.compile(r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}")
ENTITY = re.compile(r"&(?:[a-zA-Z][a-zA-Z0-9]{1,8}|#\d{2,5}|#x[0-9A-Fa-f]{2,5});")
TRACK_KEYS = {"id", "title", "seconds", "record", "channel"}
WORDS = ("one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen "
         "sixteen seventeen eighteen nineteen twenty").split()
# The line everybody knows from Convoy, as a pattern rather than the words,
# so this file does not quote it either.
_convoy_line = r"\bgot\s+(?:us\s+)?a\s+little\s+ol['’]?\s+convoy\b"
RANKING = (r"(?:the )?best (?:record|song|album|trucking song|truckin)s?|greatest|essential|must-hear|countdown|"
           r"top (?:ten|five|\d+)|definitive")
TALLY = r"streaks?|leaderboards?|how many (?:people|listeners|of you)|listener count|headcount"
NEGATION = (r"(?:no|not|nothing|never|neither|none|nor|without|refuses?|refused|refusing|"
            r"cannot|does not|won't|will not|is not|are not|isn't|aren't|nobody)")
INKS = {"--bkb-night", "--bkb-amber", "--bkb-red", "--bkb-line"}

problems = []
refuse = problems.append
esc = lambda s: html.escape(s, quote=False)
att = lambda s: html.escape(s, quote=True)


def clock(s):
    return f"{s // 60}:{s % 60:02d}"


def mins(s):
    m = round(s / 60)
    return f"{m} minutes" if m != 1 else "1 minute"


def plain(text):
    return re.sub(r"\s+", " ", html.unescape(text)).strip()


def sweep(text, where):
    for label, pat in (("ranks the records", RANKING), ("counts people", TALLY)):
        found = re.compile(rf"\b(?:{pat})\b", re.I)
        # The window is anchored to the word it excuses (A Quiet Pint's fix):
        # a "no" in one sentence never excuses the next.
        ok = re.compile(rf"\b{NEGATION}\b[^.]{{0,70}}?\b(?:{pat})\b", re.I)
        for m in found.finditer(text):
            start = max(0, m.start() - 80)
            window = text[start:m.end()]
            hit = ok.search(window)
            if hit and start + hit.end() == m.end():
                continue
            refuse(f"{where}: {m.group(0)!r} {label}. Rewrite the sentence rather than softening the word.")


def verse(s):
    lines = [l for l in s.split("\n") if l.strip()]
    return len(lines) >= 3 and sum(len(l) < 60 for l in lines) >= 3


data = json.loads(DATA.read_text())

# ── the data ────────────────────────────────────────────────────────────────
def walk(v, where):
    if isinstance(v, dict):
        for k, x in v.items():
            if not k.startswith("_"):
                walk(x, f"{where}.{k}")
    elif isinstance(v, list):
        for i, x in enumerate(v):
            walk(x, f"{where}[{i}]")
    elif isinstance(v, str):
        if ENTITY.search(v):
            refuse(f"{where}: an HTML entity. Write the character.")
        if verse(v):
            refuse(f"{where} is shaped like verse. No song's words go in this room.")


walk({k: v for k, v in data.items() if not k.startswith("_")}, "data")

sources = data.get("sources", {})
for key, s in sources.items():
    if not (s.get("title") and str(s.get("url", "")).startswith("https://en.wikipedia.org/wiki/")
            and isinstance(s.get("revision"), int)):
        refuse(f"source {key!r} has no title, Wikipedia address or revision. The room says what it read, and when.")
if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", data.get("sources_read", "")):
    refuse("the sources have no date they were read on.")

left_off = [p.lower() for p in data.get("left_off", [])]
if not left_off:
    refuse("left_off is empty. The list it came from names people unkindly, and the room says which it left off.")

seen_say = set()
for g in data.get("slang", []):
    if not g.get("group") or not g.get("terms"):
        refuse(f"a slang group with no name or no terms: {g!r}")
        continue
    for t in g["terms"]:
        if not t.get("say") or not t.get("means"):
            refuse(f"{g['group']}: a term with no words or no meaning: {t!r}")
            continue
        if t["say"].lower() in seen_say:
            refuse(f"{t['say']!r} is on the board twice.")
        seen_say.add(t["say"].lower())

cap = data.get("quote_cap")
quotes = {}
for q in data.get("quotes", []):
    where = f"quotation {q.get('id')!r}"
    n = len(q.get("words", "").split())
    if not isinstance(cap, int) or n > cap:
        refuse(f"{where} runs {n} words, over the cap of {cap}. Link the rest.")
    for key in ("id", "words", "who", "work", "link", "checked"):
        if not q.get(key):
            refuse(f"{where} has no {key}.")
    if q.get("mirror"):
        page = MIRROR / q["mirror"]
        if MIRROR.exists():
            if not page.exists():
                refuse(f"{where}: our copy of stimpunks.org has no {q['mirror']}.")
            else:
                body = re.sub(r"\*\*|__|^>\s?", "", page.read_text(), flags=re.M)
                if re.sub(r"\s+", " ", q["words"]) not in re.sub(r"\s+", " ", body):
                    refuse(f"{where} is not on {q['read_on']} word for word any more. Re-copy it from the page; "
                           "never loosen this check.")
    if q.get("source") and q["source"] not in sources:
        refuse(f"{where} names a source this file does not have.")
    quotes[q.get("id")] = q
if not MIRROR.exists():
    print("breaker breaker: our copy of stimpunks.org is not on this machine, so the quotations of ours were "
          "not checked against it this time")

for item in data.get("from_the_cb", []):
    for h in item.get("holds", []):
        f = ROOT / h["file"]
        text = plain(f.read_text()) if f.exists() else ""
        if plain(h["words"]) not in text:
            refuse(f"what our CB took ({item['name']}): {h['file']} no longer says {h['words']!r}. "
                   "Change the sentence with the radio, and its holds with it.")
    if not item.get("holds"):
        refuse(f"what our CB took ({item.get('name')}): no holds. A sentence about the radio is held to the radio.")

for a in data.get("albums", []):
    where = f"record {a.get('title')!r}"
    if not LIST.fullmatch(a.get("list", "")):
        refuse(f"{where}: {a.get('list')!r} is not one of YouTube's album lists.")
    if not (re.fullmatch(r"\d{4}(-\d{2}(-\d{2})?)?", a.get("released", "")) and a.get("label")
            and MBID.fullmatch(a.get("musicbrainz", ""))):
        refuse(f"{where} has no release date, label or MusicBrainz release. The year on a record is the record's, "
               "read off MusicBrainz, never the upload's.")
    if not (a.get("artist") and a.get("channel") and re.fullmatch(r"UC[A-Za-z0-9_-]{22}", a.get("channel_id", ""))):
        refuse(f"{where} does not name its artist and the artist's own channel. The rack plays from the people "
               "who made the records.")
    if not a.get("tracks"):
        refuse(f"{where} has no songs, so there is nothing to add up into a runtime.")
    for t in a.get("tracks", []):
        if set(t) - {"plays"} != TRACK_KEYS or not VIDEO.fullmatch(t["id"]) or not all(
                isinstance(t[k], int) and 30 <= t[k] <= 1800 for k in ("seconds", "record")):
            refuse(f"{where}: a song is not an id, a title, its length here and on the record, and its channel: {t!r}")
            continue
        if abs(t["seconds"] - t["record"]) > DRIFT and not t.get("plays"):
            refuse(f"{where}: {t['title']} plays {clock(t['seconds'])} and runs {clock(t['record'])} on the record. "
                   "Say what plays instead, in plays.")

single = data.get("single") or {}
if not (VIDEO.fullmatch(single.get("id", "")) and isinstance(single.get("seconds"), int)
        and isinstance(single.get("record"), int) and single.get("writers") and single.get("label")
        and MBID.fullmatch(single.get("musicbrainz", "")) and single.get("released")):
    refuse("the single has no id, length here and on the record, writers, label, year or MusicBrainz release.")
elif abs(single["seconds"] - single["record"]) > DRIFT and not single.get("plays"):
    refuse(f"the single plays {clock(single['seconds'])} and runs {clock(single['record'])} on the record. "
           "Say what plays instead.")

css = CSS.read_text()
sec = re.search(r"/\* §125 ── ROOM: Breaker Breaker.*?(?=/\* §126 )", css, re.S)
if not sec:
    refuse("love.css has no §125 for Breaker Breaker before §126.")
else:
    rules = re.sub(r"/\*.*?\*/", " ", sec.group(0), flags=re.S)
    for word in ("@keyframes", "animation", "transition", "blink"):
        if word in rules:
            refuse(f"§125 has {word!r} in it. Every lamp in this room is steady and nothing moves at any setting.")

if problems:
    raise SystemExit("REFUSING:\n  " + "\n  ".join(problems))


# ── the cab ─────────────────────────────────────────────────────────────────
# A pinhole camera at the driver's eye, eight feet up, looking straight down
# the lane: a point x feet to the right, y feet up and z feet ahead lands at
# (VX + F*x/z, VY + F*(EYE-y)/z). The lamps go where a rig's lamps go: three
# identification lamps at the middle, as high as they will go, a clearance
# lamp at each top corner, the tail lamps low, and on the rig in the next lane
# the side markers along its rails, amber, with red at the back corner. Its
# top rail carries a row more than the law asks, which is chicken lights.
VX, VY, F, EYE = 600, 196, 1400, 8.0
LANE = 2.0           # our lane's middle, the hammer lane, a little right of the driver's eye
SLOW = LANE + 12.0   # the slow lane, on our right
FAR = LANE - 60.0    # the other carriageway, over the median's hedge
lamps = []


def at(x, y, z):
    return VX + F * x / z, VY + F * (EYE - y) / z


def lamp(x, y, z, ink, size):
    px, py = at(x, y, z)
    lamps.append((round(px, 1), round(py, 1), max(1.3, round(F * size / z, 1)), ink))


def back_of(xc, z):
    """The back of a trailer: red, three in a row, two corners, four tail lamps."""
    for dx in (-0.9, 0, 0.9):
        lamp(xc + dx, 13.2, z, "red", 0.2)
    for dx in (-4.1, 4.1):
        lamp(xc + dx, 13.2, z, "red", 0.2)
    for dx in (-3.5, -2.8, 2.8, 3.5):
        lamp(xc + dx, 3.4, z, "red", 0.33)


def front_of(xc, z):
    """The front of a cab coming the other way, over the hedge: amber, three in a
    row on the roof and two at its corners. Its headlamps are below the hedge."""
    for dx in (-0.85, 0, 0.85):
        lamp(xc + dx, 12.8, z, "amber", 0.22)
    for dx in (-3.9, 3.9):
        lamp(xc + dx, 12.6, z, "amber", 0.22)


for z in (760, 470, 240, 70):            # the front door, far ahead, then nearer
    back_of(LANE, z)
for z in (720, 430, 260):                # coming the other way
    front_of(FAR, z)
front_of(FAR - 12, 330)
side = SLOW - 4.25                       # the near side of the rig in the slow lane
back_of(SLOW, 50)
for z in (51, 64, 77, 90, 102):          # its side marker lamps, red at the back corner
    lamp(side, 3.9, z, "red" if z == 51 else "amber", 0.24)
for z in range(52, 104, 6):              # and chicken lights along its top rail
    lamp(side, 13.0, z, "amber", 0.18)


def circle(x, y, r, ink):
    return (f'<circle cx="{x}" cy="{y}" r="{round(r * 2.6, 1)}" fill="var(--bkb-{ink})" opacity=".16"/>'
            f'<circle cx="{x}" cy="{y}" r="{r}" fill="var(--bkb-{ink})"/>')


SEG = {"1": "bc", "9": "abcdfg"}


def digit(ch, x, y, w=22, h=40, t=5):
    """One digit of a seven-segment readout, lit segments only."""
    half = h / 2
    rects = {"a": (x + t, y, w - 2 * t, t), "b": (x + w - t, y + t, t, half - 1.5 * t),
             "c": (x + w - t, y + half + t / 2, t, half - 1.5 * t), "d": (x + t, y + h - t, w - 2 * t, t),
             "e": (x, y + half + t / 2, t, half - 1.5 * t), "f": (x, y + t, t, half - 1.5 * t),
             "g": (x + t, y + half - t / 2, w - 2 * t, t)}
    return "".join(f'<rect x="{rx:g}" y="{ry:g}" width="{rw:g}" height="{rh:g}" rx="1.2" fill="var(--bkb-red)"/>'
                   for rx, ry, rw, rh in (rects[s] for s in SEG[ch]))


parts = ['<rect width="1200" height="460" fill="var(--bkb-night)"/>']
# The mirror outside the driver's door, and in it the back door's lamps.
parts.append('<rect x="22" y="132" width="74" height="178" rx="10" fill="none" stroke="var(--bkb-line)" stroke-width="3"/>')
parts.append('<path d="M96 196 H150" stroke="var(--bkb-line)" stroke-width="3"/>')
for dx in (-7, 0, 7):
    parts.append(circle(59 + dx, 214, 2.3, "amber"))
for dx in (-26, 26):
    parts.append(circle(59 + dx, 216, 2.3, "amber"))
for dx in (-3, 0, 3):
    parts.append(circle(58 + dx, 236, 1.3, "amber"))
parts.extend(circle(x, y, r, ink) for x, y, r, ink in lamps)
# The dash, the radio on it, and the microphone on its hook.
parts.append('<path d="M0 408 Q600 386 1200 408" fill="none" stroke="var(--bkb-line)" stroke-width="3"/>')
parts.append('<rect x="776" y="402" width="214" height="56" rx="6" fill="none" stroke="var(--bkb-line)" stroke-width="3"/>')
parts.append(digit("1", 792, 410) + digit("9", 822, 410))
for cx in (890, 934):
    parts.append(f'<circle cx="{cx}" cy="430" r="13" fill="none" stroke="var(--bkb-line)" stroke-width="3"/>')
parts.append('<path d="M1012 396 v18 M1012 414 c-14 6 14 10 0 16 c-14 6 14 10 0 16" fill="none" '
             'stroke="var(--bkb-line)" stroke-width="3" stroke-linecap="round"/>')
parts.append('<rect x="998" y="444" width="28" height="18" rx="7" fill="none" stroke="var(--bkb-line)" stroke-width="3"/>')
cab = ('<svg class="bkb-cab" viewBox="0 0 1200 460" aria-hidden="true" focusable="false">'
       + "".join(parts) + "</svg>")
for ink in set(re.findall(r'(?:fill|stroke)="var\((--[a-z0-9-]+)\)"', cab)):
    if ink not in INKS:
        refuse(f"the cab has {ink} in it. The lamps are amber and red, which are the law's, the dark is the night, "
               "and the shapes you can just make out are the one line colour; nothing else is lit.")
if re.search(r'(?:fill|stroke)="#', cab):
    refuse("the cab has a literal colour in it. Every ink is one of the room's, by name.")

# ── the words ───────────────────────────────────────────────────────────────
def quote(q):
    who = q["who"]
    if who == "us":
        cite = (f'Our page <a href="{att(q["link"])}">{esc(q["work"])}</a>.')
    elif q.get("source"):
        s = sources[q["source"]]
        cite = (f'{esc(who)}, <a href="{att(s["url"])}">{esc(s["title"])}</a>, read at '
                f'<a href="https://en.wikipedia.org/w/index.php?oldid={s["revision"]}">revision {s["revision"]}</a> '
                f'on {esc(data["sources_read"])}, under CC BY-SA 4.0.')
    else:
        cite = (f'{esc(who)}, <a href="{att(q["link"])}"><cite>{esc(q["work"])}</cite></a> ({q["year"]}), '
                f'pages {esc(q["pages"])}, read on our page <a href="{att(q["read_on"])}">Written Communication Is the '
                f'Great Social Equalizer</a>, which quotes it from the Kindle edition, and checked against it word for word.')
    return ("    <figure class=\"bkb-quote\">\n"
            f"      <blockquote><p>{esc(q['words'])}</p></blockquote>\n"
            f"      <figcaption class=\"bkb-quote__who\">{cite}</figcaption>\n"
            "    </figure>")


ours = ['    <dl class="bkb-ours">']
for item in data["from_the_cb"]:
    ours += [f'      <dt>{esc(item["name"])}</dt>', f'      <dd>{esc(item["words"])}</dd>']
ours.append("    </dl>")

slang = ['    <div class="bkb-board">']
for g in data["slang"]:
    slang += ['      <section class="bkb-group">', f'        <h3>{esc(g["group"])}</h3>', '        <dl>']
    for t in g["terms"]:
        slang += [f'          <dt>{esc(t["say"])}</dt>', f'          <dd>{esc(t["means"])}</dd>']
    slang += ['        </dl>', '      </section>']
slang.append("    </div>")
s = sources["slang"]
slang.append(f'    <p class="bkb-source">All of it from Wikipedia&rsquo;s <a href="{att(s["url"])}">{esc(s["title"])}</a>, '
             f'read at <a href="https://en.wikipedia.org/w/index.php?oldid={s["revision"]}">revision {s["revision"]}</a> '
             f'on {esc(data["sources_read"])}, under CC BY-SA 4.0, and put into our words.</p>')

DASH = ("bkb-dash", "the screen in the cab")
rack = [f'    <div class="bkb-screen" data-rack-screen="{DASH[0]}" tabindex="-1" hidden>',
        '      <p class="bkb-screen__idle"><span><b>The screen in the cab.</b> Nothing shows on it. Any record on the '
        'rack can go up here with the button under it, and nothing loads until you press one.</span></p>',
        '    </div>',
        f'    <p class="bkb-screen__now" data-rack-now="{DASH[0]}" tabindex="-1" hidden></p>',
        f'    <p class="bkb-screen__back" hidden><button type="button" class="bkb-put" data-rack-back="{DASH[0]}">'
        'Take it off the screen</button></p>',
        '    <details class="bkb-rack" open>',
        f'      <summary class="bkb-rack__sum">The rack: {esc(data["albums"][0]["channel"])}&rsquo;s Truckin&rsquo; '
        'Sessions, then Convoy</summary>',
        '      <ul class="bkb-records">']


def put(src, film, runs):
    return (f'        <button type="button" class="bkb-put" hidden data-rack-to="{DASH[0]}" data-rack-name="{DASH[1]}" '
            f'data-rack-src="{src}" data-rack-title="{att(film)}, on YouTube, on {DASH[1]}" '
            f'data-rack-film="{att(film)}" data-rack-runtime="{att(runs)}">Put it on in the cab &mdash; {esc(runs)}</button>')


for a in data["albums"]:
    secs = sum(t["seconds"] for t in a["tracks"])
    rec = sum(t["record"] for t in a["tracks"])
    n = len(a["tracks"])
    film = f"{a['title']}, by {a['artist']}"
    runs = f"{(WORDS[n - 1] if n <= len(WORDS) else str(n)).capitalize()} songs, {mins(secs)} all told"
    if abs(secs - rec) > 15:
        runs += f" as they play here; the record runs {mins(rec)}"
    src = f"https://www.youtube-nocookie.com/embed/videoseries?list={a['list']}&amp;autoplay=1&amp;rel=0"
    songs = []
    for t in a["tracks"]:
        songs.append(f'            <li><span class="bkb-song">{esc(t["title"])}</span> '
                     f'<span class="bkb-t">{clock(t["seconds"])}</span>'
                     + (f'\n              <span class="bkb-plays">Here: {esc(t["plays"])}.</span>' if t.get("plays") else "")
                     + f'\n              <button type="button" class="facade" data-embed-id="{t["id"]}" '
                     f'data-embed-title="{att(t["title"])}, by {att(a["artist"])}">Play this song &mdash; '
                     f'{clock(t["seconds"])}</button></li>')
    rack += ['        <li class="bkb-record" data-rack-card>',
             f'          <h3>{esc(a["title"])}</h3>',
             f'          <p class="bkb-record__by">{esc(a["artist"])} &middot; {a["released"][:4]} &middot; {esc(a["label"])}</p>',
             f'          <p class="bkb-record__runs">{esc(runs)}.</p>',
             f'          <p class="bkb-record__note">{esc(a["note"])}</p>' if a.get("note") else "",
             "  " + put(src, film, mins(secs)),
             '          <details class="bkb-back" open>',
             '            <summary>The back of the sleeve</summary>',
             '            <ol>', *songs, '            </ol>',
             '          </details>',
             f'          <p class="bkb-record__out"><a href="https://www.youtube.com/playlist?list={a["list"]}">'
             'The whole record on YouTube</a></p>',
             '        </li>']
c = single
film = f"{c['title']}, by {c['artist']}"
rack += ['        <li class="bkb-record bkb-record--single" data-rack-card>',
         f'          <h3>{esc(c["title"])}</h3>',
         f'          <p class="bkb-record__by">{esc(c["artist"])} &middot; {c["released"][:4]} &middot; {esc(c["label"])} '
         f'&middot; written by {esc(c["writers"])}</p>',
         f'          <p class="bkb-record__note">{esc(c["note"])}</p>',
         f'          <button type="button" class="facade" data-embed-id="{c["id"]}" data-embed-title="{att(film)}">',
         f'            Play it here &mdash; {clock(c["seconds"])}',
         '            <span class="facade__play">&#9654; PRESS PLAY</span>',
         '          </button>',
         "  " + put(f"https://www.youtube-nocookie.com/embed/{c['id']}?autoplay=1&amp;rel=0", film, clock(c["seconds"])),
         '        </li>',
         '      </ul>',
         '    </details>']
rack = [r for r in rack if r]

faces = json.loads(FACES.read_text())["faces"]
fr, ft = faces["racing-sans-one"], faces["titillium-web"]
wiki = ", ".join(f'<a href="https://en.wikipedia.org/w/index.php?oldid={s["revision"]}">{esc(s["title"])}</a>'
                 for s in sources.values())
labels = "; ".join(f"<em>{esc(a['title'])}</em> ({esc(a['label'])}, {a['released'][:4]})" for a in data["albums"])
credits = [
    '    <ul class="bkb-credits">',
    "      <li><strong>The convoy is ours</strong>, made as code by Claude, an AI model made by Anthropic, to "
    "Ryan&rsquo;s brief, with every lamp where the law puts it on a real rig and nobody&rsquo;s rig in particular. "
    "Nothing on this page calls an AI while you read it.</li>",
    f"      <li><strong>The records are their makers&rsquo;</strong>: Dale Watson&rsquo;s {labels}, the first "
    f"credited to Dale Watson and His Lone Stars, from his own channel; and <em>{esc(c['title'])}</em> by "
    f"{esc(c['artist'])} ({esc(c['label'])}, {c['released'][:4]}), written by {esc(c['writers'])}, from "
    f"C. W. McCall&rsquo;s own channel. Each record&rsquo;s year, label and own track lengths were read off "
    f"MusicBrainz, and every song was checked to play and to embed on {esc(data['measured'])}. Not a line of any "
    "song is on this page.</li>",
    f"      <li><strong>The history, the slang and the lamps</strong> were read off Wikipedia&rsquo;s articles {wiki}, "
    f"at those revisions, on {esc(data['sources_read'])}, under "
    '<a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>, and are in our words except '
    "where a quotation says otherwise. The slang that names people unkindly is left off.</li>",
    "      <li><strong>Every quotation belongs to whoever said it</strong> and is credited where it stands: Steve "
    "Silberman&rsquo;s <cite>NeuroTribes</cite>, read on our page about written communication, which quotes it from "
    "the Kindle edition; that page of ours; and Wikipedia. "
    f"<code>tools/make-breaker-breaker.py</code> checks ours against our pages word for word whenever our copy of "
    f"stimpunks.org is on the machine, and keeps every quotation to {data['quote_cap']} words or fewer.</li>",
    f"      <li>The type is {esc(fr['family'])}, by {esc(fr['designer'])}, for the room&rsquo;s name and its headings, "
    f"and {esc(ft['family'])}, by the {esc(ft['designer'])}, for everything you read. Both under the "
    f"{esc(fr['licence'])}, read off their own records. More in "
    '<a href="liner-notes.html#breaker-breaker">the liner notes</a>.</li>',
    "    </ul>",
]


def swap(src, name, block):
    begin, end = f"<!-- bkb:{name}:begin -->", f"<!-- bkb:{name}:end -->"
    if begin not in src or end not in src:
        refuse(f"breaker-breaker.html has lost its bkb:{name} markers.")
        return src
    return re.sub(re.escape(begin) + r".*?" + re.escape(end),
                  lambda _: f"{begin}\n{block}\n    {end}", src, flags=re.S)


NOTES = ROOT / "liner-notes.html"
notes = []
for a in data["albums"]:
    notes.append(f'      <tr><td><strong>{esc(a["artist"])}</strong></td><td>{esc(a["title"])}</td>'
                 f'<td>{a["released"][:4]}, {esc(a["label"])}</td>'
                 f'<td><a href="https://www.youtube.com/playlist?list={a["list"]}">{esc(a["channel"])}&rsquo;s '
                 f'own channel</a></td></tr>')
notes.append(f'      <tr><td><strong>{esc(c["artist"])}</strong>, written by {esc(c["writers"])}</td>'
             f'<td>{esc(c["title"])}</td><td>{c["released"][:4]}, {esc(c["label"])}</td>'
             f'<td><a href="https://www.youtube.com/watch?v={c["id"]}">{esc(c["artist"])}&rsquo;s own channel</a></td></tr>')

src = ROOM.read_text()
out = src
out = swap(out, "cab", "  " + cab)
out = swap(out, "ours", "\n".join(ours))
out = swap(out, "chatrooms", quote(quotes["chatrooms"]))
out = swap(out, "radio", quote(quotes["neurotribes"]) + "\n" + quote(quotes["written"]))
out = swap(out, "slang", "\n".join(slang))
out = swap(out, "rack", "\n".join(rack))
out = swap(out, "credits", "\n".join(credits))

main = re.search(r"<main\b.*?</main>", out, re.S)
text = main.group(0) if main else ""
text = re.sub(r"<!-- quest:[^:]+:begin -->.*?<!-- quest:[^:]+:end -->", " ", text, flags=re.S)
text = re.sub(r"<!--.*?-->|<(svg|script|style)\b.*?</\1>", " ", text, flags=re.S)
words = plain(re.sub(r"<[^>]+>", " ", text))
low = words.lower()
for phrase in left_off:
    if re.search(rf"(?<![a-z]){re.escape(phrase)}(?![a-z])", low):
        refuse(f"breaker-breaker.html says {phrase!r}, which is on the list of slang left off because it names "
               "people unkindly.")
if re.search(_convoy_line, low):
    refuse("breaker-breaker.html quotes Convoy. No song's words go in this room.")
# The songs' titles are their makers' words and are cut out before our voice is swept.
sweep(re.sub(r"\s+", " ", plain(re.sub(r"<[^>]+>", " ", re.sub(
    r'<span class="bkb-song">.*?</span>|<h3>.*?</h3>', " ", text, flags=re.S)))), "breaker-breaker.html")

nsrc = NOTES.read_text()
nbegin, nend = "<!-- breaker-breaker-credits:begin -->", "<!-- breaker-breaker-credits:end -->"
if nbegin not in nsrc or nend not in nsrc:
    refuse("liner-notes.html has lost its breaker-breaker-credits markers.")
nout = re.sub(re.escape(nbegin) + r".*?" + re.escape(nend),
              lambda _: nbegin + "\n" + "\n".join(notes) + "\n      " + nend, nsrc, flags=re.S)

if problems:
    raise SystemExit("REFUSING:\n  " + "\n  ".join(problems))
if out != src:
    ROOM.write_text(out)
if nout != nsrc:
    NOTES.write_text(nout)
print(f"breaker breaker: the convoy drawn lamp by lamp, the slang, the quotations and the rack written from "
      f"data/breaker-breaker.json; every lamp steady, amber and red")
