#!/usr/bin/env python3
"""Build the Adventurer's Guild's job board, and the job marker standing in every room.

ONE DATA FILE, TWO KINDS OF SURFACE, WHICH IS THE WHOLE REASON THIS IS A TOOL.
A quest is a code written in one room and typed into a board in another, which
means the same short word has to be identical in two places that are not near
each other and are not read together. Hand-kept, that is `_headers`' CSP line
again: it looks right in the file you are editing and is wrong in the one you
are not. So the room's marker and the board's entry are generated out of
data/quests.json together, and the board holds a CHECKSUM of the code rather
than a second copy of it -- there is exactly one place the word itself is
written down.

THE CHECKSUM IS A COURTESY AND NOT A LOCK, and this file would rather say so
than let somebody discover it. Every code is printed, in plain text, in the
markup of a public page -- that is the entire mechanism -- so anybody who opens
View Source in a room has that room's code, and anybody who reads this data file
has the lot. What the checksum buys is only that opening the source of the BOARD
is not a spoiler sheet for every room at once. There is no security here and
nothing here needs any: it is a scavenger hunt on a website, and every marker
carries a "give me the answer" way out anyway.

THE MARKER IS A <details> AND NOT A SCRIPTED POPUP, deliberately, and that is
the accessibility decision this file exists around. A native disclosure is
focusable, announced, operable from a keyboard and works with scripts off -- so
the code, the hints and the escape are all reachable on a page where nothing
runs. The scripted half (quest.js) only ADDS the answer box, which ships hidden
so a page without JavaScript shows no dead control. A quest that only worked
with JavaScript would be a room a chunk of our own readers cannot enter.

AND THE MARKER IS NEVER THE PLAY BUTTON, although the first sketch of this put
it there. Three reasons, any one of them enough: love-embed.js REPLACES a
pressed facade with a fresh <div class="facade">, so anything the button was
wearing evaporates on the press -- the same fault that shipped Swaying
Sweetgrass's players at zero by zero; a play button that also does a second
thing hands a popup to somebody who only wanted the song; and gating a quest
behind a press would put it behind consenting to a third-party frame, which is
precisely the consent this street spends a mechanism protecting. The marker is
its own control, standing in the room beside the thing the job is about, and the
job's QUESTION is what makes you read the tile.

WHAT IT REFUSES, and why each one is here:

  · A QUEST WITH NO `takes`. This is the street's oldest promise arriving at a
    job board: every press-to-play control here says how long it runs before
    the press, because that number is what lets somebody decide. A job that
    does not say how long it will take is the same missing sentence in a room
    where the cost is a walk rather than a runtime. make-den.py refuses a track
    without one; this refuses a job without one.

  · THE VOCABULARY OF SCORING. A job board is EXACTLY the shape of thing that
    grows a score, and a score beside a Disabled people's walking tour would
    quietly turn a wander into a workload -- the pebbling cabinet's refusal of a
    tally, arriving in the one room most likely to talk itself out of it. It is
    checked with the negation rule rather than a flat word ban, because the
    sentences that REFUSE a score have to be sayable: "nothing here is scored"
    must pass and "your score" must not.

  · A ROOM WITH NO JOB IN IT. Every page on this street carries a marker, so a
    new room refuses to ship without one -- make-sitemap.py's rule, which stops
    a room being published unlisted, in the form this board needs. Two pages are
    exempt on purpose and are named below with the reason.

  · A ROOM THIS FILE HAS NO DRAWING FOR. make-og.py's refusal, for make-og.py's
    reason: the marker in each room is drawn in that room's own colours, and the
    failure mode of guessing -- quietly falling back to a shared glyph -- would
    put one shared component in every room on a street whose entire architecture
    is that the rooms share nothing. That is the harmonising instinct arriving
    through a mechanism, which is how it always arrives.

  · AN ANSWER THE ANSWER BOX WOULD NOT ACCEPT. The "give me the answer" escape
    prints an answer; if that answer does not normalise into the accept list,
    the escape hands somebody a word the box then rejects, which is worse than
    no escape. Checked here rather than discovered there.

  · A MARKER WITH NO SLOT, OR A SLOT WITH NO MARKER. make-latibulum.py's rule. A
    generator that writes nothing and exits 0 is how two surfaces drift apart.

IF THIS REFUSES: fix the cause. Do not widen a list to make it quiet.
"""
import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "quests.json"
BOARD = ROOT / "adventurers-guild.html"
CREDITS = ROOT / "liner-notes.html"

# The two pages that carry no marker, each for its own stated reason.
#
#   changelog.html   is a dated record of what was true on the day it was
#                    written. check-counts.py exempts it for the same reason --
#                    writing new furniture into a log is the same instinct as
#                    rewriting a September entry to satisfy a linter.
#   adventurers-guild.html  is where jobs are handed IN. A marker here would be
#                    a job that sends you to the room you are standing in.
EXEMPT = {"changelog.html", "adventurers-guild.html"}

# THE DIFFICULTY CLASS IS HOW FAR YOU WALK. It is enumerated here rather than
# typed per job so that no job can invent a rank, and defined by geography so
# that it says nothing whatever about the person doing it. A board on a
# Disabled people's site whose classes meant "how clever" would be sorting
# readers, which is the thing the dial exists to refuse in the loudness
# dimension and this exists to refuse in the difficulty one.
RANKS = {
    1: ("I", "on the street", "Everything is on a page you can reach from the front door."),
    2: ("II", "through a door", "The marker is in a room behind another room, so there is a door to go through first."),
    # III USED TO SAY "past the treeline", WHICH WAS THE ONLY EDGE THERE WAS.
    # The Outskirts is a second one, at the other end, and a class defined by
    # geography cannot name one edge and mean both. NOT a fourth class: IV
    # would encode a false ordering, because the road and the field are not
    # different distances, they are opposite directions. This is the street
    # describing its own edges, and when an edge changes the sentences about
    # it live in other rooms -- the guild's house rules, its card and
    # llms.txt all said the old thing and none of them is in this file.
    3: ("III", "off the street", "Out of the street altogether \u2014 the field past the treeline at one end, or the road past the last streetlight at the other."),
}

# Scoring words, and the negations that make a sentence about NOT scoring. A
# flat ban would have refused this repository's own argument against scoring,
# which is the shape of mistake check-counts.py made on its first run and fixed
# by skipping quoted spans. Here the fix is a window rather than a quotation:
# a scoring noun with a negation in front of it is a refusal of scoring, and a
# scoring noun on its own is a score.
# `points` IS NOT ON THIS LIST AS A BARE WORD, and the reason is the first thing
# this tool ever refused: "a book it points at" and "a room that points at a
# shelf" are the verb, and a pattern that cannot tell them from a points system
# is check-counts.py's first draft refusing "no two rooms alike". So a point is
# only a point when it is being awarded or counted -- a number in front of it,
# or an awarding word after it. Narrowing the pattern is the fix; adding the two
# sentences to an exception list would have been the bug.
SCORE_NOUNS = (r"(?:scores?|scored|scoring|\d+\s*points?|points?\s+(?:for|per|each|"
               r"awarded|earned|available)|streaks?|leaderboards?|high[- ]score|xp\b|"
               r"levels? up|levelled up|badges?|achievements?|percent(?:age)?s?|"
               r"tall(?:y|ies)|tallied)")
NEGATION = r"(?:no|not|nothing|never|neither|none|without|refuses?|refused|refusing|cannot|does not|won't|will not|is not|are not|isn't|aren't|nobody)"
SCORE = re.compile(rf"\b{SCORE_NOUNS}", re.I)
SCORE_OK = re.compile(rf"\b{NEGATION}\b[^.]{{0,40}}?\b{SCORE_NOUNS}", re.I)


def e(s):
    return html.escape(str(s), quote=True)


def checksum(code):
    """djb2, masked to 32 bits and printed as eight hex digits.

    Deliberately the simplest thing that both sides can agree on: quest.js
    computes the identical value with `h = ((h * 33) ^ c) >>> 0`, where the
    XOR's own ToInt32 does the masking this line does explicitly. It is not a
    cryptographic hash and it is not being asked to be one -- see the note at
    the top about what it is actually for."""
    h = 5381
    for ch in code:
        h = ((h * 33) & 0xFFFFFFFF) ^ ord(ch)
    return format(h & 0xFFFFFFFF, "08x")


def normalise(s):
    """What the answer box does to what somebody types, here so the check below
    is asking the same question the visitor's keyboard will."""
    return re.sub(r"[^a-z]", "", s.lower())


# ── The markers, one drawing per room ────────────────────────────────────────
# Each one is an ordinary object lying in its own room, drawn in that room's own
# declared colours by name, so a marker cannot drift from the palette around it:
# change --coin and the arcade's token changes with it. They are small on
# purpose -- this is a thing you notice, not a thing that announces itself --
# and none of them is the same object twice.
#
# THE INK IS HELD TO THE BODY-TEXT THRESHOLD against the ground it lies on, and
# every pair is written into check-contrast.py. WCAG 1.4.3 does not reach a
# graphic; a marker you cannot pick out of the floor is a control you cannot
# use, which is the line the Jungle Room's quills already hold. The Playhouse's
# block is white rather than the yellow that room reaches for first, because
# yellow on that blue measures 3.88 and white measures 5.08 -- the one place
# here where the room's favourite colour lost to the floor it was lying on.
DRAW = {
    # A kettle on the hob, drawn in the blue glaze -- 5.72 on that room's
    # limewash, so it clears the body threshold a marker is held to. IT WAS
    # DRAWN IN --cov-tallow UNTIL THE ROOM MOVED onto the street and the
    # palette was replaced underneath it, at which point this stroked a
    # variable that no longer existed and the kettle rendered with no line at
    # all. A dead var() is not an error anywhere: CSS drops the declaration
    # and paints nothing. When a room is repainted, grep the old names.
    "covenstead-kettle": """<path d="M7 14 H23 q2 0 2 3 v6 q0 4 -4 4 H11 q-4 0 -4 -4 v-6 q0 -3 2 -3 Z" fill="none" stroke="var(--cov-delft)" stroke-width="2.2" stroke-linejoin="round"/><path d="M23 17 q4 1 4 4 q0 3 -3 3" fill="none" stroke="var(--cov-delft)" stroke-width="1.9"/><path d="M11 14 q5 -6 10 0" fill="none" stroke="var(--cov-delft)" stroke-width="1.9" stroke-linecap="round"/><path d="M14 8 q2 -3 0 -5 M18 8 q2 -3 0 -5" stroke="var(--cov-delft)" stroke-width="1.5" stroke-linecap="round" opacity=".75"/>""",
    # A sprig of thorn off the bank, drawn in the moon rather than in the
    # room's own thorn colour: --sth-thorn is 3.69 on that ground and a marker
    # is held to the BODY threshold, the Jungle Room's quills rule, because a
    # control you cannot pick out of the dark is a control you cannot use.
    "sithen-thorn": """<path d="M8 27 Q14 18 17 9" fill="none" stroke="var(--sth-moon)" stroke-width="2.2" stroke-linecap="round"/><path d="M12 21 L6 17 M14 16 L20 14 M10 24 L4 24" stroke="var(--sth-moon)" stroke-width="1.7" stroke-linecap="round"/><circle cx="18" cy="6" r="2.6" fill="var(--sth-moon)"/><circle cx="23" cy="12" r="2.2" fill="var(--sth-moon)"/><circle cx="24" cy="21" r="2" fill="var(--sth-moon)"/>""",
    # A road stud set into the verge, drawn in the beam's own bone. Flat, low
    # and catching the light on one face, which is the area's whole lighting
    # model in a 32px box.
    "outskirts-reflector": """<path d="M4 20 q0 -6 5 -6 H23 q5 0 5 6 v4 q0 2 -2 2 H6 q-2 0 -2 -2 Z" fill="none" stroke="var(--osk-beam)" stroke-width="2.2" stroke-linejoin="round"/><circle cx="12" cy="20" r="2.3" fill="var(--osk-beam)"/><circle cx="20" cy="20" r="2.3" fill="var(--osk-beam)"/><path d="M7 9 H25" stroke="var(--osk-beam)" stroke-width="1.6" stroke-linecap="round" opacity=".5"/>""",
    # A drive-in window speaker on its hook. Not a hubcap and not a spindle:
    # The Den already owns a disc with spokes in it and the Arcade owns a coin,
    # and a marker that reads as another room's object is the shared glyph this
    # registry exists to prevent, arriving by resemblance instead of by reuse.
    "lagoon-speaker": """<path d="M11 7 q0 -4 5 -4 q5 0 5 4" fill="none" stroke="var(--lag-acid)" stroke-width="2"/><rect x="8" y="7" width="16" height="21" rx="3" fill="none" stroke="var(--lag-acid)" stroke-width="2.4"/><path d="M12 13 H20 M12 17 H20 M12 21 H20" stroke="var(--lag-acid)" stroke-width="1.8" stroke-linecap="round"/>""",
    "foundry-sort": """<path d="M5 11 H25 V22 H5 Z" fill="none" stroke="var(--fo-brass)" stroke-width="2.2" stroke-linejoin="round"/><path d="M12 22 a3.2 3.2 0 0 1 6.4 0" fill="none" stroke="var(--fo-brass)" stroke-width="2"/><path d="M27 12 V21" stroke="var(--fo-brass)" stroke-width="2.6" stroke-linecap="round"/><path d="M25 14 H27 M25 19 H27" stroke="var(--fo-brass)" stroke-width="1.8"/>""",
    "checkpoint-pillow": """<path d="M5 21 q-2 -9 6 -10 q10 -2 16 1 q6 2 4 9 q-2 4 -11 4 q-11 1 -15 -4 Z" fill="none" stroke="var(--hc-steam)" stroke-width="2.2" stroke-linejoin="round"/><path d="M12 15 q4 3 8 0" fill="none" stroke="var(--hc-steam)" stroke-width="1.8" stroke-linecap="round"/>""",
    "street-chalk": """<path d="M5 24 Q11 15 16 22 Q21 29 27 19" fill="none" stroke="var(--chalk)" stroke-width="2.6" stroke-linecap="round"/><circle cx="16" cy="9" r="2.2" fill="var(--chalk)"/>""",
    "pony-sequin": """<circle cx="16" cy="16" r="9" fill="#2b0a1c"/><circle cx="16" cy="16" r="2.4" fill="var(--hot)"/><path d="M16 7 L19 16 L16 25 L13 16 Z" fill="var(--cream)" opacity=".55"/>""",
    "chappell-rhinestone": """<path d="M16 4 L26 13 L16 28 L6 13 Z" fill="var(--leaf)"/><path d="M16 4 L16 28 M6 13 L26 13" stroke="var(--nave)" stroke-width="1.4"/>""",
    "club-pin": """<path d="M7 20 L24 11" stroke="var(--paste)" stroke-width="2.4" stroke-linecap="round"/><path d="M7 20 q-3 2 -1 4 q2 2 4 -1 L25 15" fill="none" stroke="var(--paste)" stroke-width="2.4" stroke-linecap="round"/><circle cx="25" cy="10" r="2.6" fill="none" stroke="var(--paste)" stroke-width="2.2"/>""",
    "zine-staple": """<path d="M6 22 L6 12 L26 12 L26 22" fill="none" stroke="var(--ink)" stroke-width="3.4" stroke-linejoin="miter"/>""",
    "zine2-clip": """<path d="M11 26 L11 10 a5 5 0 0 1 10 0 L21 23 a3 3 0 0 1 -6 0 L15 12" fill="none" stroke="var(--ink)" stroke-width="2.4" stroke-linecap="round"/>""",
    "quantum-fringe": """<rect x="9" y="6" width="14" height="10" fill="none" stroke="var(--cyan)" stroke-width="2"/><path d="M16 16 L16 26 M10 26 L22 26" stroke="var(--cyan)" stroke-width="2" stroke-linecap="round"/><circle cx="16" cy="11" r="2" fill="var(--cyan)"/>""",
    "enid-sticker": """<path d="M6 6 H26 V21 L21 26 H6 Z" fill="var(--green)"/><path d="M26 21 L21 21 L21 26 Z" fill="var(--ink-2)"/><circle cx="14" cy="14" r="3.4" fill="var(--ink)"/>""",
    "polaroids-pin": """<circle cx="16" cy="10" r="6" fill="var(--chalk)"/><path d="M16 16 L16 27" stroke="var(--chalk)" stroke-width="2.2" stroke-linecap="round"/>""",
    "play-block": """<rect x="6" y="6" width="20" height="20" fill="#ffffff" stroke="#101014" stroke-width="3"/><path d="M12 21 L12 11 L16 18 L20 11 L20 21" fill="none" stroke="#101014" stroke-width="2.4" stroke-linejoin="round"/>""",
    "arcade-token": """<circle cx="16" cy="16" r="11" fill="none" stroke="var(--coin)" stroke-width="2.6"/><circle cx="16" cy="16" r="4.4" fill="none" stroke="var(--coin)" stroke-width="2.2"/><path d="M16 5 L16 9 M16 23 L16 27" stroke="var(--coin)" stroke-width="2.2"/>""",
    "quill-feather": """<path d="M25 6 Q11 10 7 25 Q19 23 25 6 Z" fill="none" stroke="var(--coin)" stroke-width="2.2" stroke-linejoin="round"/><path d="M23 8 L9 24" stroke="var(--coin)" stroke-width="1.8"/>""",
    "otter-clam": """<path d="M4 21 Q16 5 28 21 Z" fill="none" stroke="var(--shelly)" stroke-width="2.4" stroke-linejoin="round"/><path d="M16 8 L13 21 M16 8 L19 21 M16 8 L16 21" stroke="var(--shelly)" stroke-width="1.6"/>""",
    "pebbling-stone": """<path d="M6 20 Q7 10 16 9 Q26 10 26 19 Q22 25 15 25 Q8 25 6 20 Z" fill="var(--cobble)"/><path d="M11 15 Q15 13 19 15" fill="none" stroke="var(--bay)" stroke-width="1.4" opacity=".5"/>""",
    "burrow-door": """<circle cx="11" cy="12" r="5" fill="none" stroke="var(--umber)" stroke-width="2.4"/><path d="M14 15 L24 25" stroke="var(--umber)" stroke-width="2.6" stroke-linecap="round"/><path d="M20 21 L18 23 M24 25 L22 27" stroke="var(--umber)" stroke-width="2.4" stroke-linecap="round"/>""",
    "jungle-leaf": """<path d="M25 6 Q8 8 7 26 Q25 24 25 6 Z" fill="var(--sap)"/><path d="M24 7 L8 25 M20 10 L14 12 M21 14 L13 17 M20 19 L14 21" stroke="var(--canopy)" stroke-width="1.2" opacity=".7"/>""",
    "den-spindle": """<circle cx="16" cy="16" r="10" fill="none" stroke="var(--rattan)" stroke-width="2.2"/><path d="M16 6 L16 26 M7 11 L25 21 M25 11 L7 21" stroke="var(--rattan)" stroke-width="2"/><circle cx="16" cy="16" r="3" fill="var(--panel)" stroke="var(--rattan)" stroke-width="1.6"/>""",
    "mopery-card": """<rect x="5" y="9" width="22" height="15" fill="none" stroke="var(--mop-bone)" stroke-width="2"/><path d="M9 14 H23 M9 18 H19" stroke="var(--mop-bone)" stroke-width="1.6"/><path d="M5 9 L27 9" stroke="var(--mop-gilt)" stroke-width="2.4"/>""",
    "oracle-lozenge": """<path d="M16 4 L24 16 L16 28 L8 16 Z" fill="none" stroke="var(--orc-brass)" stroke-width="2.2"/><path d="M16 11 L20 16 L16 21 L12 16 Z" fill="var(--orc-brass)"/>""",
    "doom-foxing": """<circle cx="14" cy="15" r="6.5" fill="var(--dsc-ink-2)" opacity=".55"/><circle cx="22" cy="21" r="3.2" fill="var(--dsc-ink-2)" opacity=".7"/><circle cx="21" cy="10" r="2" fill="var(--dsc-ink-2)" opacity=".5"/>""",
    "your-room-keys": """<circle cx="11" cy="13" r="5.5" fill="none" stroke="var(--yellow)" stroke-width="2.4"/><path d="M15 16 L25 26 M21 22 L19 24 M25 26 L23 28" stroke="var(--yellow)" stroke-width="2.4" stroke-linecap="round"/>""",
    "board-clip": """<rect x="7" y="12" width="18" height="12" fill="none" stroke="var(--pbink)" stroke-width="2.2"/><path d="M11 12 L14 5 M21 12 L18 5" stroke="var(--pbink)" stroke-width="2" stroke-linecap="round"/><path d="M7 17 H25" stroke="var(--pbink)" stroke-width="1.6"/>""",
    "camp-peg": """<path d="M12 4 L12 24 L16 28 L20 24 L20 4" fill="none" stroke="var(--bone)" stroke-width="2.4" stroke-linejoin="round"/><path d="M8 7 L24 7" stroke="var(--bone)" stroke-width="2.4" stroke-linecap="round"/>""",
    "yurt-tallow": """<path d="M11 16 H21 V26 H11 Z" fill="none" stroke="var(--tallow-2)" stroke-width="2.2"/><path d="M16 16 L16 12" stroke="var(--tallow-2)" stroke-width="1.8"/><path d="M16 5 q4 4 0 7 q-4 -3 0 -7 Z" fill="var(--tallow-2)"/>""",
    "meadow-firefly": """<ellipse cx="16" cy="18" rx="4.5" ry="6" fill="none" stroke="var(--glow)" stroke-width="2"/><circle cx="16" cy="22" r="2.6" fill="var(--glow)"/><path d="M12 12 L7 7 M20 12 L25 7" stroke="var(--glow)" stroke-width="1.8" stroke-linecap="round"/>""",
    "hermitage-sunflower": """<circle cx="16" cy="14" r="5" fill="none" stroke="var(--furrow)" stroke-width="2.2"/><path d="M16 4 L16 9 M16 19 L16 28 M6 14 L11 14 M21 14 L26 14 M9 7 L12.5 10.5 M23 7 L19.5 10.5 M9 21 L12.5 17.5 M23 21 L19.5 17.5" stroke="var(--furrow)" stroke-width="2" stroke-linecap="round"/>""",
    "feed-splitflap": """<rect x="4" y="8" width="24" height="17" rx="2" fill="none" stroke="var(--fd-amber)" stroke-width="2.2"/><path d="M4 16.5 H28" stroke="var(--fd-amber)" stroke-width="2.2"/><path d="M2 11 H4 M2 22 H4 M28 11 H30 M28 22 H30" stroke="var(--fd-amber)" stroke-width="2.4" stroke-linecap="round"/>""",
    "hole-cuts": """<rect x="6" y="6" width="20" height="20" fill="none" stroke="var(--rh-brass)" stroke-width="2.2"/><path d="M10 11 H22 M10 16 H19 M10 21 H22" stroke="var(--rh-brass)" stroke-width="1.6" stroke-linecap="round"/><path d="M26 6 L6 26" stroke="var(--rh-brass)" stroke-width="1.2" opacity=".55"/>""",
    "zibaldone-nib": """<path d="M16 3 L24 12 L20 26 L16 29 L12 26 L8 12 Z" fill="var(--zb-laid)" stroke="var(--zb-oak)" stroke-width="2" stroke-linejoin="round"/><path d="M16 12 L16 24" stroke="var(--zb-oak)" stroke-width="1.8"/><circle cx="16" cy="13" r="2.6" fill="var(--zb-oak)"/><path d="M16 26 L16 29" stroke="var(--zb-rubric)" stroke-width="2.4" stroke-linecap="round"/>""",
    "garden-label": """<path d="M10 4 H22 V20 L16 28 L10 20 Z" fill="var(--gd-board)" stroke="var(--gd-loam)" stroke-width="2" stroke-linejoin="round"/><path d="M13 24 L19 24" stroke="var(--gd-leaf-2)" stroke-width="1.6" stroke-linecap="round"/>""",
    "danny-drain": """<rect x="4" y="11" width="24" height="12" rx="1.5" fill="none" stroke="var(--dn-chalk)" stroke-width="2.2"/><path d="M9 13 V21 M13.5 13 V21 M18 13 V21 M22.5 13 V21" stroke="var(--dn-chalk)" stroke-width="1.8" stroke-linecap="round"/><path d="M4 8 H28" stroke="var(--dn-chalk)" stroke-width="2.4" stroke-linecap="round"/>""",
    "liner-colophon": """<circle cx="16" cy="16" r="10" fill="none" stroke="var(--cyan)" stroke-width="2.2"/><path d="M16 6 L16 26" stroke="var(--cyan)" stroke-width="1.6"/><path d="M11 12 q5 4 0 8 M21 12 q-5 4 0 8" fill="none" stroke="var(--cyan)" stroke-width="2" stroke-linecap="round"/>""",
}


# ── Reading and refusing ─────────────────────────────────────────────────────

raw = json.loads(DATA.read_text())
quests = raw["quests"]
problems = []

seen_id, seen_code, seen_page = {}, {}, {}
for q in quests:
    qid = q.get("id", "?")
    where = f"quest {qid!r}"

    if not re.fullmatch(r"[a-z0-9-]+", str(qid)):
        problems.append(f"{where}: id is not a marker-safe name.")
    if qid in seen_id:
        problems.append(f"{where}: id used twice.")
    seen_id[qid] = True

    code = q.get("code", "")
    if not re.fullmatch(r"[A-Z]{4,12}", code):
        problems.append(
            f"{where}: code {code!r} is not four to twelve capital letters. "
            "A code gets typed by hand in another room; digits and punctuation "
            "are where that goes wrong.")
    if code in seen_code:
        problems.append(f"{where}: code {code!r} is already {seen_code[code]}'s.")
    seen_code[code] = qid

    page = q.get("page", "")
    if not (ROOT / page).exists():
        problems.append(f"{where}: page {page!r} is not on disk.")
    seen_page.setdefault(page, []).append(qid)

    if not str(q.get("takes", "")).strip():
        problems.append(
            f"{where}: no `takes`. Every press-to-play control on this street says "
            "how long before the press; a job has to say how long before the walk. "
            "That sentence is what lets somebody decide.")

    if q.get("rank") not in RANKS:
        problems.append(f"{where}: rank {q.get('rank')!r} is not one of {sorted(RANKS)}.")

    if len(q.get("hints", [])) < 2:
        problems.append(
            f"{where}: fewer than two hints. The last hint names the object exactly, "
            "which is the way out for anybody who is not going to enjoy hunting.")

    if qid not in DRAW:
        problems.append(
            f"{where}: no drawing. A marker is drawn in its own room's colours; "
            "falling back to a shared glyph would put one component in every room "
            "on a street whose whole architecture is that the rooms share nothing.")

    ask = q.get("ask")
    if ask:
        if not ask.get("accept"):
            problems.append(f"{where}: a question with nothing it will accept.")
        if not str(ask.get("why", "")).strip():
            problems.append(
                f"{where}: the escape gives an answer and does not say why. "
                "Handing somebody a word with no reasoning teaches them nothing, "
                "which is the only thing the question was for.")
        if len(ask.get("hints", [])) < 2:
            problems.append(f"{where}: a question with fewer than two hints.")
        acc = {normalise(a) for a in ask.get("accept", [])}
        given = normalise(ask.get("answer", ""))
        words = {normalise(w) for w in re.split(r"[^A-Za-z]+", ask.get("answer", "")) if w}
        if given not in acc and not (words & acc):
            problems.append(
                f"{where}: the printed answer {ask.get('answer')!r} does not normalise "
                f"into the accept list. The escape would hand somebody a word the box "
                "then rejects, which is worse than having no escape.")

    # The vocabulary of scoring, in everything this job publishes.
    for field, text in [("posted", q.get("posted", "")), ("learned", q.get("learned", "")),
                        ("title", q.get("title", "")), ("takes", q.get("takes", ""))]:
        for m in SCORE.finditer(str(text)):
            window = str(text)[max(0, m.start() - 48):m.end()]
            if not SCORE_OK.search(window):
                problems.append(
                    f"{where}: {field} says {m.group(0)!r} and is not refusing it. "
                    "There is no score on this board. A job board is exactly the shape "
                    "of thing that grows one, and a score beside a walking tour of a "
                    "Disabled people's site turns a wander into a workload.")

for page, ids in seen_page.items():
    if page in EXEMPT:
        problems.append(f"{page} is exempt from carrying a marker and has one: {ids}.")

missing = sorted({p.name for p in ROOT.glob("*.html")} - set(seen_page) - EXEMPT)
if missing:
    problems.append(
        "these pages have no job on the board: " + ", ".join(missing) +
        ".\n    Every room on this street carries a marker, so a new room refuses to "
        "ship\n    without one — make-sitemap.py's rule in the form this board needs. "
        "If a\n    page genuinely should not carry one, add it to EXEMPT with the reason.")

if problems:
    raise SystemExit("REFUSING:\n  " + "\n  ".join(problems))


# ── Writing ──────────────────────────────────────────────────────────────────

def swap(page, marker, block, indent=""):
    src = page.read_text()
    begin, end = f"<!-- {marker}:begin -->", f"<!-- {marker}:end -->"
    if begin not in src or end not in src:
        raise SystemExit(
            f"REFUSING: {page.name} has no {marker} markers, so there is nowhere to write.\n"
            "Put them back rather than letting this tool go quiet — a generator that writes\n"
            "nothing and exits 0 is how two surfaces drift apart.")
    page.write_text(re.sub(re.escape(begin) + r".*?" + re.escape(end),
                           lambda m: begin + "\n" + block + "\n" + indent + end,
                           src, flags=re.S))


def hand_in(q, cls="quest__go"):
    """The way out of the marker and into the board.

    It carries the code in the query string so the board can PUT IT IN THE BOX,
    and stops there: the visitor still presses hand in. That press is what the
    fanfare is consented by, and auto-redeeming would make a noise nobody asked
    for out of a link somebody followed. It is also the accessible path for
    anybody who finds typing expensive, which is most of the reason it exists."""
    return (f'<p class="{cls}"><a href="adventurers-guild.html?code={q["code"]}">'
            f'Hand it in at the Adventurer&rsquo;s Guild &rarr;</a></p>')


def code_line(q):
    return (f'<p class="quest__code">Quest code: '
            f'<b class="quest__word">{q["code"]}</b></p>')


def marker(q):
    """One job marker, standing in one room."""
    qid = q["id"]
    ask = q.get("ask")
    # The accept list rides on the element, normalised exactly as quest.js will
    # normalise what somebody types, so the two sides cannot disagree about what
    # counts as the same word. It is not a secret: the answer itself is printed
    # a few lines further down, inside the escape.
    acc = ""
    if ask:
        acc = ' data-accept="%s"' % "|".join(
            sorted({normalise(a) for a in ask["accept"]}))
    out = [
        f'  <details class="quest" data-quest="{qid}" data-code="{q["code"]}"{acc}>',
        f'    <summary class="quest__mark">',
        f'      <svg class="quest__draw" viewBox="0 0 32 32" aria-hidden="true" focusable="false">{DRAW[qid]}</svg>',
        f'      <span class="quest__label">Job marker &mdash; {e(q["target"])}</span>',
        f'    </summary>',
        f'    <div class="quest__panel">',
        f'      <p class="quest__what"><b>You have found a job marker.</b> The '
        f'Adventurer&rsquo;s Guild is a shopfront on the street, and it posts jobs that '
        f'send you round these rooms. Take the code below to its board and that job is '
        f'done. Nothing here is scored, nothing expires, and one is a perfectly good '
        f'number of jobs to do.</p>',
        f'      <p class="quest__job"><b>The job:</b> {e(q["title"])}</p>',
    ]

    if ask:
        out.append(f'      <p class="quest__ask"><b>Before the code:</b> {e(ask["question"])}</p>')
        # Ships hidden. quest.js reveals it, so a page with scripts off shows no
        # dead control -- the same contract the audio room's sequence button has.
        out += [
            f'      <div class="quest__try" hidden>',
            f'        <label class="quest__lab" for="{qid}-answer">Your answer, one word</label>',
            f'        <span class="quest__row">',
            f'          <input class="quest__in" id="{qid}-answer" type="text" '
            f'autocomplete="off" autocapitalize="off" spellcheck="false" inputmode="text">',
            f'          <button type="button" class="quest__check">Check</button>',
            f'        </span>',
            f'        <p class="quest__said" role="status"></p>',
            f'      </div>',
        ]
        for n, h in enumerate(ask["hints"], 1):
            last = n == len(ask["hints"])
            out.append(
                f'      <details class="quest__hint"><summary>'
                f'{"Hint " + str(n) if not last else "Last hint"}</summary>'
                f'<p>{e(h)}</p></details>')
        out += [
            f'      <details class="quest__out">',
            f'        <summary>Give me the answer</summary>',
            f'        <p>The answer is <b>{e(ask["answer"])}</b>. {e(ask["why"])}</p>',
            f'        <p class="quest__free">Taking the answer is a real way through this, '
            f'not a lesser one. Nothing is watching and nothing is written down.</p>',
            f'        {code_line(q)}',
            f'        {hand_in(q)}',
            f'      </details>',
            # Revealed by quest.js when the answer is right. Everything in here
            # is also inside the escape above, so nothing is only behind script.
            f'      <div class="quest__won" hidden>',
            f'        <p class="quest__yes">That is the one.</p>',
            f'        <p>{e(ask["why"])}</p>',
            f'        {code_line(q)}',
            f'        {hand_in(q)}',
            f'      </div>',
        ]
    else:
        out.append(f'      {code_line(q)}')
        out.append(f'      {hand_in(q)}')

    out += [f'    </div>', f'  </details>']
    return "\n".join(out)


def job(q):
    """One job posted on the board."""
    numeral, where, _ = RANKS[q["rank"]]
    out = [
        f'      <li class="job" data-quest="{q["id"]}" data-sum="{checksum(q["code"])}">',
        f'        <p class="job__class"><span class="sr">Difficulty class </span>'
        f'{numeral}<span class="job__where">{e(where)}</span></p>',
        f'        <div class="job__body">',
        f'          <h3 class="job__title">{e(q["title"])}</h3>',
        f'          <p class="job__room"><a href="{q["page"]}">{e(q["room"])}</a></p>',
        f'          <p class="job__posted">{e(q["posted"])}</p>',
        f'          <p class="job__takes"><b>Takes</b> {e(q["takes"])}'
        + ('  &middot; there is a question to answer in the room' if q.get("ask") else '')
        + '</p>',
        f'          <div class="job__hints">',
    ]
    for n, h in enumerate(q["hints"], 1):
        last = n == len(q["hints"])
        out.append(
            f'            <details class="job__hint"><summary>'
            f'{"Hint " + str(n) if not last else "Where exactly it is"}</summary>'
            f'<p>{e(h)}</p></details>')
    out += [
        f'          </div>',
        # Ships hidden and is filled in by quest.js when this job's code is
        # handed in. It is written here rather than fetched so that the board
        # cannot disagree with itself, the same reason the Mopery's popups are
        # clones of markup already on the page.
        f'          <div class="job__done" hidden>',
        f'            <p class="job__learned">{e(q["learned"])}</p>',
        f'          </div>',
        f'        </div>',
        f'        <p class="job__stamp" hidden aria-hidden="true">DONE</p>',
        f'      </li>',
    ]
    return "\n".join(out)


# The board, in the order the jobs were written rather than sorted by class:
# sorting by difficulty would put the three longest walks at the bottom in a
# block and read as a ladder you climb, which is the scoreboard arriving as a
# sort order. The class is printed on every job and a reader can pick.
swap(BOARD, "guild:jobs", "\n".join(job(q) for q in quests), "    ")

for q in quests:
    swap(ROOT / q["page"], f"quest:{q['id']}", marker(q))

# The credits, with the board, out of one file -- make-yells.py's contract.
creds = [
    '    <p><b>The Adventurer&rsquo;s Guild.</b> The job board, the markers standing in '
    'every room, and the codes that join them are built from <code>data/quests.json</code> '
    'by <code>tools/make-guild.py</code>. The guild sets <b>Rye</b>, a woodtype face for '
    'posted bills, and <b>Public Sans</b>, the typeface of the United States Web Design '
    'System &mdash; a civic form face, because the joke of that room is that it is the one '
    'tidy room on a street that refuses tidiness. Both are under the SIL Open Font License.</p>',
    '    <p>Every question on the board is answered by a sentence already published on the '
    'page its marker stands on, and each was read off that page rather than remembered. '
    'Where a question asks for a name it is a name one of our own pages already credits.</p>',
    '    <p><b>The candle stub on the Faery Yurt&rsquo;s windowsill is ours, not Helen '
    'Edgar&rsquo;s.</b> That room is her design and this repository does not redecorate it; '
    'the only other change we have made to it is the one colour noted above. The marker was '
    'added with Ryan&rsquo;s say-so so that her pitch is not the one room on the street with '
    'no job in it, it is drawn in her own declared colours, and it is written down here for '
    'the same reason the colour is &mdash; a change to a contributor&rsquo;s room should be '
    'visible somewhere other than a diff. Helen has the final say on whether it stays.</p>',
]
swap(CREDITS, "guild:credits", "\n".join(creds), "  ")

gated = sum(1 for q in quests if q.get("ask"))
print(f"guild: {len(quests)} jobs on the board, {gated} of them with a question, "
      f"markers written into {len(seen_page)} rooms.")
print(f"       credits written into {CREDITS.name}; "
      f"{', '.join(sorted(EXEMPT))} carry none, on purpose.")
