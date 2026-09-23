#!/usr/bin/env python3
"""Build Dead Tired Society's pegs by the door, and the credits, from data/dead-tired.json.

ONE DATA FILE, ONE TOOL, TWO SURFACES -- the contract make-yells.py set and
every generator here has kept since. The pegs are the named things that wear
people out; each carries a drawing of what hangs on it, one short quotation read
off our own glossary entry, and a line of ours. The credits go to liner-notes.

WHAT IT REFUSES, and the first three are the room:

  - ADVICE, IN THE SECOND PERSON. A burnout page is exactly the shape of thing
    that fills up with tips -- ten ways to recharge, a morning routine, a
    checklist -- and every one of them is homework handed to the person least
    able to do it. Peer support is being in a room with people who have been
    there, and advice only when somebody asks. make-sithen.py refuses the same
    vocabulary for its own reason (a page about unwritten rules must not end in
    tips for following them); this is the room where the tip would arrive from
    somebody being KIND, which makes it the more likely of the two.

  - RESILIENCE, AND EVERYTHING THAT MEANS "SO YOU CAN GO AGAIN". Bouncing back,
    back on track, back to normal, back to work, recharging, productivity. Our
    own ecology page puts burnout down to a failure of relational ecology, not a
    lack of individual resilience, and a room that congratulated somebody on how
    much they could take would be praising the thing that did it to them.
    make-checkpoint.py refuses instrumental rest in room 429; this is the same
    refusal arriving at the point BEFORE rest, where the pressure is to recover
    for somebody else's sake.

    THE SWEEP READS THE ROOM'S OWN WORDS AND SKIPS BLOCKQUOTES, which is the one
    place this differs from make-checkpoint.py. Two of the quotations here are
    the sharpest things anybody has said AGAINST resilience -- "the world demands
    resilience", and our own "not a lack of individual resilience" -- and a
    quotation criticising a word has to be allowed to contain it. Quotations are
    held to their own rules below instead: a cap, an author, a work, a link.

  - THE FILM, BEYOND ITS NAME. Dead Tired Society is a play on Dead Poets
    Society (1989, Peter Weir, Tom Schulman) and takes the shape of the name and
    nothing else: no character, no school, no line, no motto. That is somebody
    else's screenplay by a living writer, and the most famous parts of it are
    the most tempting to borrow for atmosphere. So the names and the two lines
    are refused outright, with NO negation window, anywhere on the page -- the
    room has no reason to say them even to refuse them, the way make-sithen.py
    names its two borrowers and not their vocabulary.

  - A TALLY. make-checkpoint.py's list, taken over pattern for pattern
    including its narrowing of `points`, plus the two a support group grows:
    days since, and a check-in that is counted. A society that kept a register
    of how often somebody needed it would be keeping exactly the record the
    healing checkpoint refuses to keep, one door along the street.

  - A QUOTATION OVER THIRTY WORDS, or with no author, work or link, or read off
    anything but one of our own glossary entries. make-zibaldone.py's number
    and make-checkpoint.py's, for their reason: nobody ever decides to
    republish a page, they add one good line at a time. The number is printed
    in the room.

  - A PEG WITH NO DRAWING, OR TWO PEGS SHARING ONE, and a peg whose drawing is
    not also written out in `on_peg`. The drawings are aria-hidden decoration;
    a claim only sighted readers get is not a claim this site may make. The
    garden's rule for its beds, arriving on a coat rack.

  - AN HTML ENTITY IN ANY FIELD, and a note shaped like verse. The fourth and
    fifth shapes of each; see data/lagoon.json and data/rabbit-hole.json.

  - A MISSING MARKER PAIR. A generator that writes nothing and exits 0 is how
    two surfaces drift apart.

WHAT IT DOES NOT CHECK, on purpose: how many pegs there are. The wall is longer
than what is on it, and the room says so rather than giving a number.
"""
import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data/dead-tired.json"
ROOM = ROOT / "dead-tired-society.html"
NOTES = ROOT / "liner-notes.html"

GLOSSARY = "https://stimpunks.org/glossary/"
WORDS = 30            # printed in the room; see _quotes in the data file
VERSE_LINE = 52

ENTITY = re.compile(r"&(?:[a-zA-Z][a-zA-Z0-9]{1,31}|#\d{1,6}|#x[0-9a-fA-F]{1,6});")

NEGATION = (r"(?:no|not|nothing|never|neither|none|without|refuses?|refused|refusing|"
            r"cannot|does not|won't|will not|is not|are not|isn't|aren't|nobody|nor|declin\w+)")

# SECOND PERSON AND IMPERATIVE FRAMINGS ONLY. "tells you what to do about it" is
# the room REFUSING advice and has to survive, which is why this is a list of
# the shapes advice takes rather than of words it uses.
ADVICE = (r"you should|you need to|you must|try to|make sure (?:you|to)|have you tried|"
          r"don'?t forget to|remember to|it'?s important to|tips?(?: for| to| on)?\b|"
          r"self-care routine|ways to (?:recover|heal|cope)|steps to (?:recover|heal)|"
          r"how to recover|learn to|practi[cs]e (?:saying|setting)")

# THE VOCABULARY OF GOING AGAIN. Narrow on purpose. "recover" is NOT here: it is
# an ordinary word in a Disabled person's mouth and the brief itself uses it,
# and banning it would teach people to ignore this tool, which is
# check-counts.py's first-run lesson and make-checkpoint.py's note about the
# same word.
RESILIENCE = (r"resilien\w*|bounc(?:e|ed|es|ing) back|back on track|back to normal|"
              r"back to (?:work|full strength)|recharg\w*|productiv\w*|push(?:ing)? through|"
              r"so (?:you|we|they) can (?:go|get|work|keep|perform)|good as new|stronger than ever")

# make-checkpoint.py's TALLY, narrowed `points` and all, plus the two a support
# group grows. "attendance" alone is not here: "neither is attendance" is a
# standing order refusing it, and a bare word would be a flat ban.
TALLY = (r"scores?|scored|scoring|\d+\s*points?|points?\s+(?:for|per|each|awarded|"
         r"earned|available)|streaks?|leaderboards?|high[- ]score|xp\b|levels? up|"
         r"badges? (?:earned|awarded)|achievements?|tall(?:y|ies)|tallied|progress bar|"
         r"completion rate|days since|check-ins? (?:counted|logged|recorded)")

# THE FILM, outright. No negation window: see the docstring.
FILM = (r"keating|welton|o captain|carpe diem|todd anderson|neil perry|pritchard|"
        r"marrow of life|seize the day")

ADVICE_RE = re.compile(rf"\b(?:{ADVICE})", re.I)
ADVICE_OK = re.compile(rf"\b{NEGATION}\b[^.]{{0,70}}?\b(?:{ADVICE})", re.I)
RES_RE = re.compile(rf"\b(?:{RESILIENCE})", re.I)
RES_OK = re.compile(rf"\b{NEGATION}\b[^.]{{0,70}}?\b(?:{RESILIENCE})", re.I)
TALLY_RE = re.compile(rf"\b(?:{TALLY})", re.I)
TALLY_OK = re.compile(rf"\b{NEGATION}\b[^.]{{0,70}}?\b(?:{TALLY})", re.I)
FILM_RE = re.compile(rf"\b(?:{FILM})\b", re.I)

# ── The drawings, one per peg ────────────────────────────────────────────────
# Every one hangs from the same rail and the same kind of peg, because it is one
# wall; what hangs there is never the same shape twice. Drawn in the room's own
# declared inks by name, so a drawing cannot drift from the palette around it:
# --dts-dim for the thing itself, 7.73 on the room, and --dts-edge for the rail,
# the peg and the fine detail, 4.29, which is ornament and is in
# check-contrast.py's ORNAMENT list with that number. Nothing in any of them is
# a face. A mask is drawn blank.
RAIL = ('<path d="M0 14 H120" stroke="var(--dts-edge)" stroke-width="3"/>'
        '<circle cx="60" cy="14" r="5" fill="var(--dts-edge)"/>')
LINE = 'fill="none" stroke="var(--dts-dim)" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"'
FINE = 'fill="none" stroke="var(--dts-edge)" stroke-width="1.8" stroke-linecap="round"'
DRAW = {
    # A half-mask on its string, nothing painted on it. The eyeholes are the
    # room's own ground showing through, which is what an empty mask is.
    "masking": (
        f'<path d="M60 18 L38 58 M60 18 L82 58" {FINE}/>'
        f'<path d="M24 62 Q60 44 96 62 Q94 86 76 90 Q66 92 60 82 Q54 92 44 90 Q26 86 24 62 Z" {LINE}/>'
        '<ellipse cx="44" cy="70" rx="9" ry="5.5" fill="var(--dts-room)" stroke="var(--dts-dim)" stroke-width="2"/>'
        '<ellipse cx="76" cy="70" rx="9" ry="5.5" fill="var(--dts-room)" stroke="var(--dts-dim)" stroke-width="2"/>'),
    # A rucksack gone out of shape at the bottom from being carried full.
    "minority-stress": (
        f'<path d="M50 30 Q60 16 70 30" {LINE}/>'
        f'<path d="M34 42 Q34 30 50 30 H70 Q86 30 86 42 L92 118 Q92 132 76 132 H44 Q28 132 28 118 Z" {LINE}/>'
        f'<path d="M34 56 Q60 70 86 56" {LINE}/>'
        f'<path d="M42 90 H78 Q82 90 82 96 V114 Q82 120 76 120 H44 Q38 120 38 114 V96 Q38 90 42 90 Z" {FINE}/>'
        f'<path d="M36 126 Q60 134 84 126" {FINE}/>'),
    # A lanyard with a visitor's badge on it. The badge has a band across the top
    # and ruled lines where a name would go, and no name on it.
    "epistemic-injustice": (
        f'<path d="M57 18 L49 78 M63 18 L71 78" {LINE}/>'
        f'<path d="M52 78 H68 V86 H52 Z" {LINE}/>'
        f'<path d="M38 88 H82 Q86 88 86 92 V134 Q86 138 82 138 H38 Q34 138 34 134 V92 Q34 88 38 88 Z" {LINE}/>'
        '<path d="M34 100 H86" stroke="var(--dts-dim)" stroke-width="7"/>'
        f'<path d="M44 114 H76 M44 124 H68" {FINE}/>'),
    # A whistle on a cord. The cord is long, because it was used a great deal.
    "justice-sensitivity": (
        f'<path d="M58 18 Q30 60 52 98 M62 18 Q84 56 62 94" {FINE}/>'
        f'<circle cx="58" cy="110" r="16" {LINE}/>'
        f'<path d="M70 100 L100 96 L102 110 L73 115" {LINE}/>'
        '<circle cx="58" cy="110" r="5" fill="var(--dts-dim)"/>'),
    # A work apron with a name badge still pinned to the bib.
    "moral-injury": (
        f'<path d="M60 18 L44 44 M60 18 L76 44" {FINE}/>'
        f'<path d="M44 44 H76 L80 70 L96 74 L90 136 H30 L24 74 L40 70 Z" {LINE}/>'
        f'<path d="M24 74 Q14 96 20 116 M96 74 Q106 96 100 116" {FINE}/>'
        f'<path d="M42 96 H78 V118 H42 Z" {FINE}/>'
        f'<path d="M50 54 H70 V64 H50 Z" {LINE}/>'),
    # A school blazer on a hanger, cut for somebody else: the sleeves hang down
    # past where any hands would be.
    "neuronormativity": (
        f'<path d="M60 18 Q60 10 66 10" {FINE}/>'
        f'<path d="M60 18 L20 44 H100 Z" {FINE}/>'
        f'<path d="M20 44 L10 138 M100 44 L110 138" {LINE}/>'
        f'<path d="M20 44 L28 136 H92 L100 44" {LINE}/>'
        f'<path d="M46 44 L60 84 L74 44" {LINE}/>'
        '<circle cx="60" cy="100" r="3" fill="var(--dts-dim)"/>'
        '<circle cx="60" cy="116" r="3" fill="var(--dts-dim)"/>'
        f'<path d="M76 88 H90 V100 Q83 106 76 100 Z" {FINE}/>'),
}

problems = []


def looks_like_verse(text):
    lines = [ln.strip() for ln in str(text).splitlines() if ln.strip()]
    return len(lines) >= 3 and all(len(ln) <= VERSE_LINE for ln in lines)


def sweep(text, where):
    """The room's own words, against three vocabularies with a negation window
    and one without. The window is characters rather than words, because a
    sentence can put a clause between the negation and the word and still
    plainly be a refusal."""
    text = str(text)
    for rx, ok, why in ((ADVICE_RE, ADVICE_OK,
                         "this room gives no advice nobody asked for. See _no_advice."),
                        (RES_RE, RES_OK,
                         "nobody here is praised for how much they can take. See _no_resilience."),
                        (TALLY_RE, TALLY_OK,
                         "nothing in this society is counted. See _no_tally.")):
        for m in rx.finditer(text):
            window = text[max(0, m.start() - 80):m.end()]
            if ok.search(window):
                continue
            problems.append(f"{where}: {m.group(0)!r} -- {why}")
    for m in FILM_RE.finditer(text):
        problems.append(
            f"{where}: {m.group(0)!r} -- the room takes the shape of the film's name "
            "and nothing else. See _film.")


# ── The data ─────────────────────────────────────────────────────────────────
# TOP-LEVEL UNDERSCORE KEYS ARE THE RECORD OF WHY and are skipped, the way
# make-checkpoint.py skips them: a file that may not explain its own refusal
# without tripping it is a file whose reasoning goes into a comment nobody reads.
d = json.loads(DATA.read_text())
pegs = d.get("pegs") or []
more = d.get("more") or []
if not pegs:
    problems.append("data/dead-tired.json has no pegs, and the wall by the door is made of them.")

seen_id, seen_draw = set(), {}
for i, p in enumerate(pegs, 1):
    pid = str(p.get("id") or "").strip()
    where = f"peg {i} ({pid or 'no id'})"
    for field in ("id", "name", "entry", "on_peg", "note"):
        if not str(p.get(field, "")).strip():
            problems.append(f"{where}: no {field}." + (
                " A drawing is aria-hidden; what hangs on the peg has to be said in words "
                "as well, or only sighted readers are told." if field == "on_peg" else "") + (
                " A quotation with no line of ours is somebody else's page reprinted for "
                "atmosphere." if field == "note" else ""))
    if pid in seen_id:
        problems.append(f"{where}: the id is used twice.")
    seen_id.add(pid)
    if pid not in DRAW:
        problems.append(
            f"{where}: no drawing in DRAW. Every peg has its own, and falling back to a "
            "shared shape would put one object on every hook on a wall whose point is "
            "that nobody is carrying the same thing.")
    else:
        body = DRAW[pid]
        if body in seen_draw:
            problems.append(f"{where}: draws exactly what {seen_draw[body]!r} draws.")
        seen_draw[body] = pid
    if not str(p.get("entry", "")).startswith(GLOSSARY):
        problems.append(
            f"{where}: `entry` is not one of our own glossary entries. Every peg names a "
            "thing our glossary already argues about, and every quotation on it was read "
            "off that entry.")
    for field in ("name", "on_peg", "note"):
        v = str(p.get(field, ""))
        sweep(v, f"{where} ({field})")
        if ENTITY.search(v):
            problems.append(f"{where}: {field} carries an HTML entity. Everything here is "
                            "escaped on the way into the page; write the character.")
        if looks_like_verse(v):
            problems.append(f"{where}: {field} is several short hand-broken lines.")
    q = p.get("quote") or {}
    words = len(str(q.get("text", "")).split())
    if not words:
        problems.append(f"{where}: no quotation. Each peg carries one line from the entry.")
    if words > WORDS:
        problems.append(
            f"{where}: the quotation is {words} words and the limit is {WORDS}. It is "
            "printed in the room; a page built out of other people's lines becomes their "
            "page one reasonable addition at a time.")
    for need in ("who", "work", "url"):
        if not str(q.get(need, "")).strip():
            problems.append(
                f"{where}: the quotation has no {need}. Every line here names who said it, "
                "where, and links to it -- the source our glossary credits, never the entry.")
    for field, v in q.items():
        if ENTITY.search(str(v)):
            problems.append(f"{where}: quotation {field} carries an HTML entity.")
        if field != "text":
            sweep(v, f"{where} (quotation {field})")
        else:
            for m in FILM_RE.finditer(str(v)):
                problems.append(f"{where}: the quotation says {m.group(0)!r}. See _film.")

for i, m in enumerate(more, 1):
    if not str(m.get("entry", "")).startswith(GLOSSARY) or not str(m.get("name", "")).strip():
        problems.append(f"more {i}: every other peg is named and is one of our own glossary "
                        "entries.")

if problems:
    raise SystemExit("REFUSING to build Dead Tired Society:\n  " + "\n  ".join(problems))


# ── Writing ──────────────────────────────────────────────────────────────────

def swap(page, marker, block, indent=""):
    src = page.read_text()
    begin, end = f"<!-- {marker}:begin -->", f"<!-- {marker}:end -->"
    if begin not in src or end not in src:
        raise SystemExit(
            f"REFUSING: {page.name} has no {marker} markers, so there is nowhere to write.\n"
            "Put them back rather than letting this tool go quiet -- a generator that\n"
            "writes nothing and exits 0 is how two surfaces drift apart.")
    page.write_text(re.sub(re.escape(begin) + r".*?" + re.escape(end),
                           lambda _m: begin + "\n" + block + "\n" + indent + end,
                           src, flags=re.S))


def esc(s):
    return html.escape(str(s), quote=False)


def cite(q):
    year = f", {esc(q['year'])}" if str(q.get("year", "")).strip() else ""
    return (f'<cite>{esc(q["who"])}, <a href="{esc(q["url"])}">{esc(q["work"])}</a>'
            f'{year}</cite>')


# THE PEGS. The drawing is decoration and the sentence under the name says the
# same thing in words; the quotation carries its own attribution rather than a
# footnote, because a cite that sits once at the foot of a room is a cite nobody
# reads beside the words it belongs to -- Covenstead's reason.
rows = []
for p in pegs:
    q = p["quote"]
    rows.append(
        f'    <li class="dts-peg">\n'
        f'      <svg class="dts-peg__art" viewBox="0 0 120 142" aria-hidden="true" focusable="false">'
        f'{RAIL}{DRAW[p["id"]]}</svg>\n'
        f'      <div class="dts-peg__body">\n'
        f'        <h3>{esc(p["name"])}</h3>\n'
        f'        <p class="dts-peg__on"><span class="dts-peg__label">On the peg:</span> {esc(p["on_peg"])}</p>\n'
        f'        <blockquote class="dts-peg__quote">\n'
        f'          <p>{esc(q["text"])}</p>\n'
        f'          {cite(q)}\n'
        f'        </blockquote>\n'
        f'        <p class="dts-peg__note">{esc(p["note"])}</p>\n'
        f'        <p class="dts-peg__entry"><a href="{esc(p["entry"])}">'
        f'{esc(p["name"])}, in our glossary &rarr;</a></p>\n'
        f'      </div>\n'
        f'    </li>')
swap(ROOM, "dead-tired:pegs", '  <ul class="dts-pegs">\n' + "\n".join(rows) + "\n  </ul>", "  ")

# THE OTHER PEGS, which are named and linked and not drawn. The sentence around
# them is written once here so it cannot be left saying a number.
others = [f'<a href="{esc(m["entry"])}">{esc(m["name"])}</a>' for m in more]
if len(others) > 1:
    joined = ", ".join(others[:-1]) + " and " + others[-1]
else:
    joined = others[0] if others else ""
swap(ROOM, "dead-tired:more",
     f'  <p class="dts-more">The wall is longer than this, and nobody has finished putting '
     f'pegs up. Further along it: {joined}. All of them are in our glossary, argued by the '
     f'people who carried them.</p>', "  ")

swap(ROOM, "dead-tired:cap",
     f'    <p>Every quotation in this room is {WORDS} words or fewer, is credited to the '
     f'person or place that said it rather than to our page, and was read off our own '
     f'glossary entry for that peg on 2026-09-23. <code>tools/make-dead-tired.py</code> '
     f'refuses a longer one, and refuses advice, a tally and the vocabulary of bouncing '
     f'back in the room&rsquo;s own voice.</p>', "    ")

credit_rows = []
for p in pegs:
    q = p["quote"]
    year = esc(q["year"]) if str(q.get("year", "")).strip() else "&mdash;"
    credit_rows.append(
        f'      <tr><td>{esc(p["name"])}</td><td><strong>{esc(q["who"])}</strong></td>'
        f'<td><a href="{esc(q["url"])}">{esc(q["work"])}</a></td><td>{year}</td>'
        f'<td>{len(str(q["text"]).split())} words</td></tr>')
swap(NOTES, "dead-tired-credits", "\n".join(credit_rows), "      ")

# ── The page's own copy, swept ───────────────────────────────────────────────
# AFTER the write rather than before it, so what is checked is what is
# published, and with every blockquote taken out first: see the docstring. The
# job marker is make-guild.py's and is swept by that tool against its own list.
page = ROOM.read_text()
page = re.sub(r"<!-- quest:.*?:end -->", " ", page, flags=re.S)
page = re.sub(r"<!--.*?-->", " ", page, flags=re.S)
page = re.sub(r"<(script|style)\b.*?</\1>", " ", page, flags=re.S)
page = re.sub(r"<blockquote\b.*?</blockquote>", " ", page, flags=re.S)
page = re.sub(r"<[^>]+>", " ", page)
page = html.unescape(re.sub(r"\s+", " ", page))
before = len(problems)
sweep(page, ROOM.name)
if len(problems) > before:
    raise SystemExit("REFUSING, on the published page:\n  " + "\n  ".join(problems[before:]))

longest = max(len(str(p["quote"]["text"]).split()) for p in pegs)
print(f"dead tired society: {len(pegs)} pegs drawn and {len(more)} more named, in {ROOM.name}")
print(f"  {len(credit_rows)} credit rows in {NOTES.name}; longest quotation {longest} words "
      f"against a limit of {WORDS}")
print("  no advice nobody asked for, nothing counted, and nobody praised for how much they can take")
