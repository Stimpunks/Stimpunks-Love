#!/usr/bin/env python3
"""Build The Zibaldone's leaves and its attribution slip, and the credits with them.

A ZIBALDONE IS A HEAP OF THINGS -- the Italian miscellany notebook, kept from the
fourteenth century on, of which Leopardi's is the famous one. Our own glossary
has had an entry for the commonplace book since 2022. Somebody in the community
asked for a quote bank on 2026-09-22; this is that, with a desk under it.

THE ROOM IS A QUOTE BANK, WHICH IS THE MOST DANGEROUS SHAPE OF PAGE THIS SITE
HAS BUILT, and every refusal below is one way it goes wrong. Nobody ever decides
to republish a book. They add one good line, and then another, each individually
reasonable, and a year later the page IS the work instead of pointing at it. The
same drift runs through attribution: the first entry carries a full citation, the
tenth carries a surname, and the fiftieth carries a picture of the sentence with
nobody's name on it at all. Neither drift has a moment anybody could have caught,
so neither is left to care.

WHAT IT REFUSES, and why each one is here:

  · A QUOTATION LONGER THAN THE LIMIT. The limit is a number in this file and
    the room prints it, because "quote lightly" is not a thing a page can
    promise and not enforce. make-arrivals.py refuses a summary field on a
    departures board for the same reason: the friendly edit is real, it will
    arrive, and it looks like an improvement while it is arriving.

  · A SONG. Ryan's reply to the person who asked for this room, 2026-09-22:
    song lyric reproduction is an intellectual property minefield in the US, so
    we quote lightly and rarely from songs. Music publishing enforces where
    prose publishing shrugs, the licensing is separate from the recording, and
    one line is a far larger fraction of a song than of a novel. This street
    already says in three places that nothing musical is hosted here; a quote
    bank is where that promise would be broken in the way that looked most
    harmless. So it is refused structurally rather than remembered.

  · A QUOTATION WITH NO PRINTING IN `where`. A title is not a source. These
    texts differ between printings, and a text nobody can trace is the one thing
    a room built on sourcing cannot carry -- which is exactly why The Doomscroll
    dropped The Darkling Thrush. The Dickinson in this room is the proof it
    matters: it is in the SECOND series, not the first, and only looking found
    that out.

  · A QUOTATION WITH NO `checked` RECORD. make-sweetgrass.py's rule: do not let
    an unchecked quotation sit among checked ones looking identical. Every card
    prints how it was verified and when, so there is nowhere for an unchecked
    one to hide.

  · A PUBLIC DOMAIN CLAIM THAT DOES NOT CLEAR SEVENTY YEARS, checked against the
    current year rather than a date written in the data. make-doomscroll.py's
    test, and a public-domain-EVERYWHERE test rather than a United States one.
    A TRANSLATED WORK HAS TO CLEAR IT TWICE, for the author and the translator,
    which is a trap this repository had not met before: the translation is a
    copyrightable work of its own, so a Roman emperor in a 1998 English is a
    1998 book. It is why the Meditations here is Casaubon's 1634.

  · A QUOTATION SET IN THE HAND. The room varies the face per entry, which is
    what was asked for, but the hand writes margins and labels and never a
    quotation. A passage in a handwriting face is an access failure wearing
    atmosphere -- the lesson The Doomscroll's blackletter already carries, where
    the masthead is set in it and not one line of a poem is.

  · A DRAWING THIS FILE HAS NO ENTRY FOR, OR TWO ENTRIES SHARING ONE. make-og.py's
    refusal for make-og.py's reason. The failure mode of guessing is not a crash,
    it is one shared glyph appearing quietly beside every quotation, which is the
    harmonising instinct arriving through plumbing.

  · A DRAWING WITH NO SENTENCE SAYING WHAT IT IS. make-garden.py's rule: the
    drawings are aria-hidden decoration, and a claim only sighted readers get is
    not a claim this site is allowed to make.

  · A MARGIN NOTE CARRYING A QUOTATION. The margins are where the keeper argues
    with the page, and they are ours. If they could hold quotations they would
    quietly become a second, uncited quote bank running down the side of the
    cited one -- and nobody would ever see it happen.

  · AN EMOJI OR A FACE IN THE `for` LINE. The request was quotes for any state of
    mind, and the obvious build is a grid of moods you pick from. The Playhouse
    settled this for its sound board and the answer is the same here: a row of
    happy, sad and angry faces on a Disabled people's site is the emotion
    flashcard autistic people spend their childhoods being drilled with. A `for`
    line is a SITUATION in words.

  · THE VOCABULARY OF RANKING. No favourites, no most-copied, no top of the
    bank, no counter on a card. A quote bank is exactly the shape of thing that
    grows a leaderboard, and a leaderboard here would turn the one page meant to
    meet somebody where they are into a popularity contest between other
    people's grief. Checked with make-guild.py's negation window so the room can
    still say out loud that it ranks nothing.

  · AN ENTRY MARKED `ours` WHOSE LINK IS NOT OURS. make-hermitage.py's rule
    about the Star Stuff bench: a shelf with our name on it holding somebody
    else's writing reads as a claim, and it is the one kind of attribution error
    that flatters us.

THE SLIP IS GENERATED FROM THE SAME FIELDS THE CARDS CARRY, and that is the
reason it is in this tool rather than hand-written into the page. The slip asks a
contributor for exactly what an entry needs; if the two were kept separately, the
day somebody adds a field to an entry is the day the form stops asking for it,
and nothing would say a word. One list, two surfaces -- make-guild.py's contract.

IF THIS REFUSES: fix the cause. Do not widen a list to make it quiet.
"""
import datetime
import html
import json
import re
import sys
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "zibaldone.json"
PAGE = ROOT / "zibaldone.html"
CREDITS = ROOT / "liner-notes.html"

# ── The limit ────────────────────────────────────────────────────────────────
# THE NUMBER IS HERE AND THE ROOM PRINTS IT, so "we quote lightly" is a measured
# claim rather than a tone of voice. Thirty words is about two lines of verse or
# one long sentence of prose -- enough to carry a thought, nowhere near enough to
# be a substitute for the book it came from. It is deliberately a hard stop
# rather than a guideline: a guideline is what a quote bank erodes.
MAX_WORDS = 30

# Public domain everywhere, not in one country. See the module docstring.
PD_YEARS = 70

# ── The faces ────────────────────────────────────────────────────────────────
# Three TEXT faces for the quotations, one hand for everything the keeper wrote.
# The hand is not on this list and that is the entire point of the list.
QUOTE_FACES = {
    "eb-garamond": "EB Garamond",
    "newsreader": "Newsreader",
    "lora": "Lora",
}
HAND = "kalam"

# The inks a leaf may be written in. An ink is a colour somebody sat down with,
# so it is enumerated rather than typed per entry -- the same reason the guild's
# difficulty classes are in its tool.
INKS = {"oak", "iron", "violet", "rubric"}

# How an entry is allowed to be here at all. There is no fourth value, because
# the fourth value is always "it seemed fine".
BASES = {
    "public-domain": "Public domain",
    "credited":      "Quoted and cited",
    "ours":          "Ours",
}

OURS = ("stimpunks.org", "stimpunks.love", "starstuff.earth", "queering.earth",
        "cavendish.space", "penguinpebbling.app", "monotropicmap.org", "morerealms.com")

# ── The ranking vocabulary ───────────────────────────────────────────────────
# make-guild.py's negation window rather than a flat ban, so the room can print
# the sentence explaining that it does not do this. A scoring noun with a
# negation in front of it is a refusal of scoring; one on its own is a score.
RANK_WORDS = r"(?:favourites?|favorites?|top (?:quote|pick)|most[- ](?:copied|loved|liked|popular)|leaderboard|ranked|ranking|highest[- ]rated|best quote|votes?|upvotes?)"
NEGATIONS = r"(?:no|not|never|nothing|none|without|refus\w*|neither|nor|cannot|can't|isn't|aren't|does not|doesn't|don't)"

SLIP_TITLE = "The attribution slip"


def e(s):
    return html.escape(str(s), quote=True)


def die(msg):
    raise SystemExit("REFUSING: " + msg)


def words(s):
    return [w for w in re.split(r"\s+", s.strip()) if w]


def has_emoji(s):
    """Any pictographic character at all. A face is the thing being refused, and
    a face arrives as an emoji long before it arrives as an SVG."""
    for ch in s:
        if unicodedata.category(ch) == "So" or 0x1F300 <= ord(ch) <= 0x1FAFF:
            return ch
    return None


def ranking_leak(text, where):
    """A scoring word with no negation in the window in front of it."""
    flat = re.sub(r"<[^>]+>", " ", text)
    for m in re.finditer(RANK_WORDS, flat, re.I):
        window = flat[max(0, m.start() - 60):m.start()]
        if not re.search(NEGATIONS + r"\b[^.]{0,50}$", window, re.I):
            die(f"{where} uses the vocabulary of ranking: {flat[max(0,m.start()-40):m.end()+20].strip()!r}\n"
                "Nothing in this room is ranked, counted or voted on. A quote bank is exactly the\n"
                "shape of thing that grows a leaderboard. Say that it does not, or say nothing.")


# ── The pressed things ───────────────────────────────────────────────────────
# ONE PER ENTRY AND NO TWO ALIKE. They are pressed and pasted objects rather
# than illustrations of the line: a commonplace book has a dried leaf in it, not
# a picture of the sentence. Every one is drawn in the room's own inks, on the
# room's own paper, and each carries its shadow as the faint offset of a thing
# lying ON the page rather than printed into it -- which is the one drawing
# decision that separates this room from every printed-paper room on the street.
OAK, IRON, ANILINE = "#3A2A18", "#2B3348", "#5B2E6E"
RUBRIC, PENCIL, TAPE = "#8C2B18", "#635A4B", "#DFCDA8"
# PENCIL STARTED AT #6B6253 AND MEASURED 4.43 ON A LEAF, which is under the bar
# for body text -- and it carries every citation, every margin note and every
# provenance line in the room. Darkened to clear both papers with room to
# spare. Caught by check-contrast.py before the room shipped, which is the
# argument for making that file refuse a colour it has never seen.


def paste(x, y, w, h, r=0):
    """A strip of gummed paper under a pasted thing. Ornament, carries no text."""
    return (f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{TAPE}" '
            f'opacity=".85" transform="rotate({r} {x + w / 2} {y + h / 2})"/>')


DRAW = {
    # Montaigne -- a linen thread with a knot, the plainest possible bookmark.
    "thread": (
        f'<path d="M22 96 C40 70 34 52 52 40 C70 28 86 40 92 26" fill="none" '
        f'stroke="{OAK}" stroke-width="2.4" stroke-linecap="round"/>'
        f'<circle cx="52" cy="40" r="6.5" fill="none" stroke="{OAK}" stroke-width="2.4"/>'
        f'<path d="M92 26 l6 -7" fill="none" stroke="{OAK}" stroke-width="2.4" stroke-linecap="round"/>'
        f'<path d="M24 98 C42 72 36 54 54 42" fill="none" stroke="{PENCIL}" '
        f'stroke-width="2.4" opacity=".28" stroke-linecap="round"/>'
    ),
    # Whitman -- a blade of grass pressed flat, with the crease of the shut book.
    "grass": (
        paste(56, 18, 16, 7, -14) +
        f'<path d="M64 22 C50 46 44 74 50 102 C56 76 62 46 64 22 Z" fill="{PENCIL}" opacity=".5"/>'
        f'<path d="M64 22 C50 46 44 74 50 102" fill="none" stroke="{OAK}" stroke-width="2"/>'
        f'<path d="M64 22 C74 48 76 76 68 102" fill="none" stroke="{OAK}" stroke-width="2"/>'
        f'<path d="M64 22 C66 50 66 76 60 102" fill="none" stroke="{OAK}" stroke-width="1.2" opacity=".6"/>'
        f'<path d="M30 66 L96 62" fill="none" stroke="{PENCIL}" stroke-width="1" opacity=".45" stroke-dasharray="3 4"/>'
    ),
    # Dickinson -- a broken seal on a torn-off envelope flap.
    "wax": (
        f'<path d="M26 40 L96 34 L88 88 L34 92 Z" fill="none" stroke="{PENCIL}" '
        f'stroke-width="1.6" opacity=".7"/>'
        f'<path d="M26 40 L60 66 L96 34" fill="none" stroke="{PENCIL}" stroke-width="1.6" opacity=".7"/>'
        f'<path d="M60 52 a16 16 0 1 0 .1 0 Z" fill="{RUBRIC}" opacity=".85"/>'
        f'<path d="M60 52 a16 16 0 0 1 14 23 l-14 -23 Z" fill="{RUBRIC}"/>'
        f'<path d="M56 40 L58 84" fill="none" stroke="{TAPE}" stroke-width="2.4" opacity=".9"/>'
    ),
    # Thoreau -- two lines of footprints, one spaced wider, going the same way.
    "pace": (
        "".join(f'<ellipse cx="{28 + i * 13}" cy="{46 + (i % 2) * 6}" rx="4.4" ry="7" '
                f'fill="{IRON}" opacity=".8" transform="rotate(-8 {28 + i * 13} {46 + (i % 2) * 6})"/>'
                for i in range(6)) +
        "".join(f'<ellipse cx="{26 + i * 22}" cy="{86 + (i % 2) * 6}" rx="4.4" ry="7" '
                f'fill="{IRON}" opacity=".45" transform="rotate(-8 {26 + i * 22} {86 + (i % 2) * 6})"/>'
                for i in range(4)) +
        f'<path d="M20 66 L102 64" fill="none" stroke="{PENCIL}" stroke-width="1" '
        f'opacity=".4" stroke-dasharray="2 5"/>'
    ),
    # Marcus Aurelius -- a spring in section, water up through gravel to a basin.
    "spring": (
        f'<path d="M22 74 L98 70 L98 100 L22 104 Z" fill="{PENCIL}" opacity=".18"/>'
        f'<path d="M22 74 L98 70" fill="none" stroke="{OAK}" stroke-width="1.8"/>'
        + "".join(f'<circle cx="{30 + (i * 17) % 68}" cy="{84 + (i * 11) % 16}" r="{2.4 + (i % 3)}" '
                  f'fill="{OAK}" opacity=".45"/>' for i in range(8)) +
        f'<path d="M60 70 C60 56 52 50 56 38 C58 32 62 30 60 22" fill="none" '
        f'stroke="{IRON}" stroke-width="2.2" stroke-linecap="round"/>'
        f'<path d="M40 44 a20 12 0 0 0 40 0" fill="none" stroke="{IRON}" '
        f'stroke-width="1.6" opacity=".55"/>'
    ),
    # Barad -- two ripple sets from separate points, crossing.
    "fringe": (
        "".join(f'<circle cx="44" cy="60" r="{9 + i * 9}" fill="none" stroke="{ANILINE}" '
                f'stroke-width="1.5" opacity="{0.75 - i * 0.12:.2f}"/>' for i in range(5)) +
        "".join(f'<circle cx="80" cy="60" r="{9 + i * 9}" fill="none" stroke="{ANILINE}" '
                f'stroke-width="1.5" opacity="{0.75 - i * 0.12:.2f}"/>' for i in range(5)) +
        f'<circle cx="44" cy="60" r="2.6" fill="{ANILINE}"/>'
        f'<circle cx="80" cy="60" r="2.6" fill="{ANILINE}"/>'
    ),
    # Helen Edgar -- three loops passing through one another, no end visible.
    "knot": (
        f'<path d="M44 44 a18 18 0 1 0 0.1 0" fill="none" stroke="{ANILINE}" stroke-width="3"/>'
        f'<path d="M76 44 a18 18 0 1 0 0.1 0" fill="none" stroke="{ANILINE}" stroke-width="3"/>'
        f'<path d="M60 70 a18 18 0 1 0 0.1 0" fill="none" stroke="{ANILINE}" stroke-width="3"/>'
        f'<path d="M50 56 a18 18 0 0 0 10 10" fill="none" stroke="{TAPE}" stroke-width="5"/>'
        f'<path d="M70 56 a18 18 0 0 1 -10 10" fill="none" stroke="{TAPE}" stroke-width="5"/>'
        f'<path d="M44 44 a18 18 0 0 0 -8 22" fill="none" stroke="{ANILINE}" stroke-width="3"/>'
    ),
    # The tenets on rest -- a cushion from above, dent still in it, chair empty.
    "pillow": (
        f'<path d="M26 44 C26 34 38 30 60 30 C82 30 94 34 94 44 C94 62 90 84 60 84 '
        f'C30 84 26 62 26 44 Z" fill="{PENCIL}" opacity=".22"/>'
        f'<path d="M26 44 C26 34 38 30 60 30 C82 30 94 34 94 44 C94 62 90 84 60 84 '
        f'C30 84 26 62 26 44 Z" fill="none" stroke="{OAK}" stroke-width="2"/>'
        f'<path d="M46 52 C52 62 68 62 74 52" fill="none" stroke="{OAK}" '
        f'stroke-width="1.6" opacity=".7"/>'
        f'<path d="M36 40 C44 36 76 36 84 40" fill="none" stroke="{OAK}" '
        f'stroke-width="1.2" opacity=".45"/>'
    ),
    # The tenets on lived experience -- a used ticket, its printing worn off.
    "ticket": (
        paste(30, 34, 14, 7, 8) + paste(80, 86, 14, 7, 8) +
        f'<path d="M28 44 L96 36 L100 84 L32 92 Z" fill="{TAPE}" opacity=".5" '
        f'transform="rotate(-5 64 64)"/>'
        f'<path d="M28 44 L96 36 L100 84 L32 92 Z" fill="none" stroke="{IRON}" '
        f'stroke-width="1.8" transform="rotate(-5 64 64)"/>'
        f'<path d="M78 40 L82 88" fill="none" stroke="{IRON}" stroke-width="1.4" '
        f'stroke-dasharray="3 4" transform="rotate(-5 64 64)"/>'
        + "".join(f'<path d="M{38 + (i % 2) * 4} {54 + i * 9} L{70 - (i % 3) * 8} {52 + i * 9}" '
                  f'fill="none" stroke="{IRON}" stroke-width="2.4" opacity="{0.3 - i * 0.07:.2f}" '
                  f'transform="rotate(-5 64 64)"/>' for i in range(3))
    ),
}

# ── The slip's fields ────────────────────────────────────────────────────────
# TASL IS THE SPINE AND IT IS NOT ENOUGH ON ITS OWN. Creative Commons' Title,
# Author, Source, Licence is the right skeleton for a reused photograph, where
# the thing you are pointing at is a file with one address. A quotation is not
# that: it comes out of a WORK, in a PRINTING, and the person copying it found
# it SOMEWHERE ELSE AGAIN -- and the last of those three is the one that turns
# out to matter most, because most misquotations in circulation were copied in
# good faith off a page that had already got them wrong.
#
# So the four TASL fields are here under their own names, and the three that a
# quotation needs are here beside them, marked as the additions they are rather
# than smuggled in as though CC had asked for them.
FIELDS = [
    ("quote",     "The quotation itself",      "tasl-t",  True,
     f"Keep it short -- this room's own limit is {MAX_WORDS} words, and the reason is on the page."),
    ("who",       "Who wrote it (Author)",     "tasl-a",  True,
     "The person, not the person who said it to you. If you do not know, say so here rather than guessing."),
    ("work",      "What it is from (Title)",   "tasl-t2", True,
     "The book, poem, essay, talk or post. A chapter or section number if you have one."),
    ("where",     "Which printing",            "extra",   True,
     "The edition, year, publisher, issue -- whatever pins down WHICH version of the text this is. "
     "Texts differ between printings and this is the field that makes an entry checkable."),
    ("url",       "A link to it (Source)",     "tasl-s",  False,
     "A link to the work itself where there is one. Not a quotation site."),
    ("licence",   "Its terms (Licence)",       "tasl-l",  False,
     "Public domain, a Creative Commons licence, all rights reserved, or your own words -- whichever it is."),
    ("found",     "Where you found it",        "extra",   False,
     "The book you were reading, the person who told you, the page you saw it on. This is the field "
     "that catches a misquotation, because most of them are copied in good faith off something that "
     "was already wrong."),
    ("for",       "What it is for",            "extra",   False,
     "A situation somebody might be in, in your own words. Not a mood to pick off a list."),
]


# ── Read and refuse ──────────────────────────────────────────────────────────
data = json.loads(DATA.read_text())
entries = data["entries"]
if not entries:
    die("data/zibaldone.json has no entries, so there is nothing to write.")

this_year = datetime.date.today().year
seen_slug, seen_draw = set(), {}

for q in entries:
    slug = q.get("slug") or die("an entry has no slug.")
    at = f"entry {slug!r}"

    if slug in seen_slug:
        die(f"{at} is used twice. A slug is an id on the page and check-ids.py will find it next.")
    seen_slug.add(slug)

    for field in ("quote", "who", "work", "where", "basis", "for", "checked", "hand",
                  "face", "ink", "draw", "draw_says"):
        if not str(q.get(field, "")).strip():
            die(f"{at} has no {field!r}. Every field here is one the room prints.")

    # The limit. This is the room's whole legal position and it is a number.
    n = len(words(q["quote"]))
    if n > MAX_WORDS:
        die(f"{at} is {n} words and the limit is {MAX_WORDS}.\n"
            "This is a quote bank, which is the shape of page that turns into republishing a book\n"
            "one reasonable-looking entry at a time. Cut it to the line that does the work and put\n"
            "a link to the book beside it. Do not raise the limit.")

    # Songs, refused structurally rather than by care.
    #
    # THE FIRST THING THIS CHECK EVER REFUSED WAS A FALSE POSITIVE, which is by
    # now the most reliable event in this repository: the word `song` matched
    # Whitman's SONG OF MYSELF, a poem. `song` came out of the pattern rather
    # than Whitman getting an exception -- check-counts.py refusing "no two
    # rooms alike" and make-guild.py refusing "a book it points at", for the
    # third time. What is left is the vocabulary that only ever describes a
    # RECORDING: `lyrics`, `album`, `b-side`. None of those turns up in prose
    # about a book, and `song` on its own never meant what this was looking for.
    # The load-bearing half is `kind` anyway -- a declared field rather than a
    # guess at one, which is the only half that can be relied on.
    kind = str(q.get("kind", "")).lower()
    haystack = " ".join(str(q.get(k, "")) for k in ("work", "where", "checked", "kind")).lower()
    if kind in ("song", "lyric", "lyrics") or re.search(r"\b(lyrics?|album|b-side)\b", haystack):
        die(f"{at} looks like a song.\n"
            "No song lyrics here. Music publishing enforces on quotation where prose publishing\n"
            "shrugs, the licensing is separate from the recording, and one line is a far larger\n"
            "fraction of a song than of a book. This street already says nothing musical is hosted\n"
            "here -- link the song instead, or quote the person talking about it.")

    basis = q["basis"]
    if basis not in BASES:
        die(f"{at} has basis {basis!r}; it must be one of {', '.join(sorted(BASES))}.\n"
            "There is no fourth value, because the fourth value is always 'it seemed fine'.")

    # Public domain everywhere, and TWICE for anything translated.
    if basis == "public-domain":
        for role, key in (("author", "who_died"), ("translator", "translator_died")):
            if key == "translator_died" and not q.get("translator"):
                continue
            died = q.get(key)
            if died is None:
                die(f"{at} claims the public domain with no {key}.\n"
                    "The test is the death date, and a translation is a copyrightable work of its\n"
                    "own -- so a translated text has to clear it for the translator as well.")
            if this_year - int(died) <= PD_YEARS:
                die(f"{at} claims the public domain but its {role} died in {died}, "
                    f"which is {this_year - int(died)} years ago.\n"
                    f"The test is more than {PD_YEARS} years, everywhere rather than in the United\n"
                    "States, because a site that serves everybody cannot lean on one country's rule.")

    if basis == "ours" and not any(h in q.get("url", "") for h in OURS):
        die(f"{at} is marked as ours and its link is {q.get('url')!r}, which is not one of our sites.\n"
            "Marking somebody else's sentence as ours is the one attribution error that flatters us.")

    if basis != "ours" and not q.get("url"):
        die(f"{at} is not ours and has no url, so a reader cannot go and check it.")

    # The legibility floor.
    if q["face"] == HAND:
        die(f"{at} sets its quotation in the hand.\n"
            "The hand writes margins and labels. A passage in a handwriting face is an access\n"
            "failure wearing atmosphere, which is why The Doomscroll's blackletter sets a masthead\n"
            "and not one line of a poem.")
    if q["face"] not in QUOTE_FACES:
        die(f"{at} sets its quotation in {q['face']!r}, which is not one of the text faces: "
            f"{', '.join(sorted(QUOTE_FACES))}.")
    if q["ink"] not in INKS:
        die(f"{at} is written in {q['ink']!r}, which is not one of the inks: {', '.join(sorted(INKS))}.")

    # One drawing each, no two alike.
    if q["draw"] not in DRAW:
        die(f"{at} asks for the drawing {q['draw']!r} and this file has none.\n"
            "Draw one. The failure mode of guessing is one shared glyph quietly appearing beside\n"
            "every quotation in the book, which is the harmonising instinct arriving through\n"
            "plumbing -- make-og.py's refusal, for make-og.py's reason.")
    if q["draw"] in seen_draw:
        die(f"{at} and entry {seen_draw[q['draw']]!r} both use the drawing {q['draw']!r}.\n"
            "One pressed thing per leaf, none repeated.")
    seen_draw[q["draw"]] = slug

    # The margin is ours, and is never a second quotation.
    if re.search(r"[\"“”]|&[lr]dquo;", q["hand"]):
        die(f"{at}'s margin note carries a quotation mark.\n"
            "The margins are where the keeper argues with the page and they are OUR words. If they\n"
            "could hold quotations they would quietly become a second, uncited quote bank running\n"
            "down the side of the cited one, and nobody would see it happen.")

    # A situation, not a face.
    ch = has_emoji(q["for"]) or has_emoji(q["hand"])
    if ch:
        die(f"{at} has {ch!r} in a line the room prints.\n"
            "No faces and no emoji in this room. A mood here is a situation written in words --\n"
            "the Playhouse's sound board settled this, and a row of happy, sad and angry faces on a\n"
            "Disabled people's site is the emotion flashcard.")
    if re.match(r"^\s*(happy|sad|angry|anxious|scared|excited)\s*$", q["for"], re.I):
        die(f"{at}'s `for` is the bare mood {q['for']!r}. It is meant to be a situation somebody "
            "might be in, in a sentence -- see the note above.")

    # ONE FIELD AT A TIME, AND THIS WAS FOUND BY BREAKING IT ON PURPOSE. The
    # first version joined these three with spaces and checked the join, which
    # let a negation in one field govern a ranking word in another: "cannot say
    # what it is for" at the end of `for` sat inside the sixty-character window
    # in front of "top pick" at the start of `hand`, and the leak passed. Every
    # other refusal in this file was confirmed by a deliberate break and this
    # one was not, until it was -- which is check-quests.py's lesson about
    # believing a checker, arriving in the checker written to obey it.
    for k in ("for", "hand", "checked"):
        ranking_leak(str(q.get(k, "")), f"{at}'s {k}")

for key, blob in data.items():
    if key.startswith("_"):
        ranking_leak(blob, f"data/zibaldone.json {key}")


# ── Write ────────────────────────────────────────────────────────────────────
def swap(page, marker, block, indent=""):
    src = page.read_text()
    begin, end = f"<!-- {marker}:begin -->", f"<!-- {marker}:end -->"
    if begin not in src or end not in src:
        raise SystemExit(
            f"REFUSING: {page.name} has no {marker} markers, so there is nowhere to write.\n"
            "Put them back rather than letting this tool go quiet -- a generator that writes\n"
            "nothing and exits 0 is how two surfaces drift apart.")
    page.write_text(re.sub(re.escape(begin) + r".*?" + re.escape(end),
                           lambda m: begin + "\n" + block + "\n" + indent + end,
                           src, flags=re.S))


def cite_html(q):
    """The citation, assembled in one place so no two leaves cite differently."""
    bits = [f'<b>{e(q["who"])}</b>']
    if q.get("translator"):
        bits.append(f'translated by {e(q["translator"])}')
    bits.append(f'<i>{e(q["work"])}</i>')
    line = ", ".join(bits) + "."
    where = f' Read in {e(q["where"])}.'
    if q.get("url"):
        where = (f' Read in <a href="{e(q["url"])}">{e(q["where"])}</a>.')
    return line + where


def leaf_html(q, i):
    slug = q["slug"]
    badge = BASES[q["basis"]]
    when = re.search(r"\b(20\d\d-\d\d-\d\d)\b", q["checked"])
    return "\n".join([
        f'    <li class="zb-leaf zb-leaf--{e(q["ink"])} zb-leaf--{e(q["face"])}" id="zb-{e(slug)}">',
        f'      <div class="zb-leaf__pressed" aria-hidden="true">',
        f'        <svg viewBox="0 0 120 120" fill="none">{DRAW[q["draw"]]}</svg>',
        f'      </div>',
        f'      <blockquote class="zb-leaf__quote">{e(q["quote"])}</blockquote>',
        f'      <p class="zb-leaf__cite">{cite_html(q)}</p>',
        f'      <p class="zb-leaf__for"><span class="zb-leaf__tag">Copied out</span> {e(q["for"])}</p>',
        f'      <p class="zb-leaf__hand">{e(q["hand"])}</p>',
        f'      <details class="zb-leaf__prov">',
        f'        <summary><span class="zb-leaf__badge">{e(badge)}</span>'
        f'<span class="zb-leaf__when">checked {e(when.group(1)) if when else "&mdash;"}</span></summary>',
        f'        <p>{e(q["checked"])}</p>',
        f'        <p class="zb-leaf__pasted"><b>Pasted in beside it:</b> {e(q["draw_says"])}</p>',
        f'      </details>',
        f'    </li>',
    ])


swap(PAGE, "zibaldone:leaves", "\n".join(leaf_html(q, i) for i, q in enumerate(entries)), "  ")


def slip_html():
    rows = []
    for name, label, kind, required, help_ in FIELDS:
        tag = {"tasl-t": "T &mdash; Title", "tasl-a": "A &mdash; Author", "tasl-s": "S &mdash; Source",
               "tasl-l": "L &mdash; Licence", "tasl-t2": "T &mdash; Title", "extra": "&#43;"}[kind]
        big = name in ("quote", "found", "checked")
        field = (f'<textarea id="slip-{name}" name="{name}" rows="{3 if name == "quote" else 2}" '
                 f'aria-describedby="slip-{name}-help"></textarea>' if big else
                 f'<input type="text" id="slip-{name}" name="{name}" aria-describedby="slip-{name}-help">')
        extra = " zb-slip__row--extra" if kind == "extra" else ""
        need = ' <span class="zb-slip__req">needed</span>' if required else ""
        rows.append("\n".join([
            f'      <div class="zb-slip__row{extra}">',
            f'        <label for="slip-{name}">{label}{need}'
            f'<span class="zb-slip__key" aria-hidden="true">{tag}</span></label>',
            f'        <p class="zb-slip__help" id="slip-{name}-help">{help_}</p>',
            f'        {field}',
            f'      </div>',
        ]))
    return "\n".join(rows)


swap(PAGE, "zibaldone:slip", slip_html(), "    ")

# The room says its own limit rather than carrying a number somebody typed.
swap(PAGE, "zibaldone:limit",
     f'      <p class="zb-rule__n">{MAX_WORDS} words</p>\n'
     f'      <p class="zb-rule__why">is the longest quotation this room will carry, and '
     f'<code>tools/make-zibaldone.py</code> refuses a longer one rather than trusting anybody to '
     f'remember. A bank of quotations is the shape of page that turns into republishing somebody'
     f'&rsquo;s book one reasonable-looking entry at a time. Where the line is not enough, the '
     f'book is linked.</p>', "    ")

creds = [
    # THE HEADER AND THE INTRO ABOVE THESE MARKERS ARE HAND-WRITTEN AND SAY WHERE
    # THE ROOM CAME FROM, so this must not say it again. The first draft did --
    # the community request, the commonplace book and the fourteenth century,
    # all twice in consecutive paragraphs -- which is what happens when a
    # generated block is written before the page around it exists. This half
    # says what the GENERATOR does; the page says what the room is.
    '    <p><b>The Zibaldone.</b> Built from <code>data/zibaldone.json</code> by '
    '<code>tools/make-zibaldone.py</code>, which refuses more than any other generator here: a '
    'quotation over its word limit, a song, a line naming a title but no printing, one with no '
    'record of how it was checked, a public domain claim that does not clear for the translator '
    'as well as the author, a margin note carrying a second quotation, and the vocabulary of '
    'ranking. <b>Nothing in that room is ranked, counted or voted on.</b></p>',
    '    <p><b>Every quotation names its printing, and the room prints how it was checked.</b> '
    'The public domain lines were read out of the transcriptions named on each card rather than '
    'recalled &mdash; which is how the Dickinson turned out to be in the <i>second</i> series and '
    'not the first, and how the Thoreau kept the sentence he actually wrote instead of the one '
    'everybody quotes. The contemporary lines were read off our own published pages. <b>Karen '
    'Barad</b>, <b>Helen Edgar</b>, <b>Montaigne</b>, <b>Whitman</b>, <b>Dickinson</b>, '
    '<b>Thoreau</b> and <b>Marcus Aurelius</b> by way of <b>Meric Casaubon</b>&rsquo;s 1634 '
    'English &mdash; because a translation is a copyrightable work of its own and has to be out '
    'of copyright too.</p>',
    '    <p><b>The room quotes lightly and refuses songs.</b> The word limit is a number in the '
    'generator and the page prints it; a quote bank is the shape of thing that becomes a book one '
    'entry at a time. No song lyrics at all, refused by the tool rather than by care, because '
    'nothing musical is hosted on this street and this is where that promise would have been '
    'broken in the way that looked most harmless.</p>',
    '    <p><b>The typefaces are EB Garamond, Newsreader and Lora for the quotations and Kalam '
    'for the hand</b>, all under the SIL Open Font License, and the tool refuses a quotation set '
    'in the hand. The drawings are ours, one pressed thing per leaf, and each is described in a '
    'sentence beside it because a drawing is decoration a screen reader never reaches. <b>The '
    'attribution slip copies to your clipboard and sends nothing anywhere</b> &mdash; its fields '
    'are Creative Commons&rsquo; <a href="https://wiki.creativecommons.org/wiki/best_practices_for_attribution">'
    'TASL</a> with the three a quotation also needs.</p>',
]
swap(CREDITS, "zibaldone:credits", "\n".join(creds), "  ")

# AND THE ROOM'S OWN COPY IS CHECKED LAST, after the writing, because the page
# is where a leaderboard would actually be announced. Checking only the data
# file would be checking the half that is already generated from checked
# entries -- check-quests.py's rule, that a tool which re-reads its own output
# is only testing that Python is deterministic. The hand-written prose on the
# page is the half nothing else is looking at.
ranking_leak(PAGE.read_text(), f"{PAGE.name}'s own copy")

print(f"zibaldone: {len(entries)} leaves written into {PAGE.name}; "
      f"{len(seen_draw)} pressed things, none repeated.")
print(f"           longest quotation {max(len(words(q['quote'])) for q in entries)} words "
      f"against a limit of {MAX_WORDS}.")
print(f"           slip built from {len(FIELDS)} fields; credits written into {CREDITS.name}.")
