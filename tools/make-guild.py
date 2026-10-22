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
#   404.html         is served at every address nobody built, so the only way to
#                    reach its marker would be to mistype a URL on purpose -- a
#                    job only somebody who already knew the trick could do.
#   privacy.html     is where somebody goes to find out what happens to them
#                    here. A job marker on it would turn the one page that has
#                    to be read carefully into a stop on a walking tour, and
#                    reading it is not a quest.
#   design.html      says how the street is made and who and what makes it,
#                    AI included. It is a disclosure, read for the privacy
#                    page's reason, and a job sending somebody through it would
#                    make an account owed to every visitor into a quest.
#   about.html       is where somebody who has been shown the street and does
#                    not get it yet is sent. A job through it would turn the
#                    answer to "what is this?" into the first errand.
#   mission.html     says what the street is for, and names the page keeping
#                    each aim so a reader can hold us to it. It is read for
#                    design.html's reason: a job through it would make the page
#                    the rest of the street is checked against into a stop.
#   architecture.html  says how the site runs, what it keeps and what it
#                    contacts. It is design.html's other half and read for the
#                    same reason: a reference somebody checks us against, not
#                    a stop on a walking tour.
#   cb-guide.html    is the radio's manual, read with the radio open to find out
#                    what a button does. A job through it would turn help into
#                    homework, for the privacy page's reason.
#   forum.html       is the CB's forums, and only a claimed username can read
#                    what is in them. A job through it would be an errand that
#                    only works for somebody who has claimed a username, and
#                    a nudge to claim one, which is a choice the CB leaves to
#                    people rather than a step on a walking tour.
#   chat.html        is the radio on a page of its own, for anybody signed on to
#                    the CB, and is every room's channel rather than a room. A
#                    job through it would be an errand only somebody with an
#                    invite could run, which is forum.html's reason.
#   tasks.html       is the team's to-do list, and only its directors and
#                    administrators can read it. A job through it would be an
#                    errand nobody else could run.
#   join.html        is the joining page, where an invite becomes a username.
#                    Everybody who could walk the board has been through it
#                    already, so a job through it could only be done by joining
#                    twice.
#   call-window.html  and any other window (tools/windows.py) holds one thing
#                    somebody popped out of a page, and nothing until then. A
#                    marker in it would be a job in a room nobody can walk to.
from windows import WINDOWS
EXEMPT = {"changelog.html", "adventurers-guild.html", "404.html", "privacy.html", "design.html",
          "mission.html", "architecture.html", "cb-guide.html", "about.html", "chat.html", "forum.html", "tasks.html", "office.html", "join.html"} | WINDOWS

# A ROOM YOU HAVE TO KNOW THE ADDRESS OF CARRIES NO MARKER, AND IS REFUSED ONE.
# Ryan's call, 2026-10-07 (tools/unlisted.py). The board prints every job beside
# the room it sends you to, so a marker in an unlisted room would put that room
# on a public page in the guild's own hand. Read off the page, not listed here,
# because this file is served as well.
import unlisted
EXEMPT |= set(unlisted.pages(ROOT))

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
    # And then a third, which is not at either end: Arlesglad Caverns is
    # UNDER the street. Still not a fourth class, for the same reason and a
    # stronger one -- down is not even along the street, so there is no
    # distance to put it at. The sentence changed in the same places again.
    # And then the land past the campgrounds, which is further along the
    # field's own direction rather than a new one: still III, because a class
    # that counted how far past an edge you went would rank the edges.
    3: ("III", "off the street", "Out of the street altogether \u2014 the field past the treeline at one end and the land past its wood, the road past the last streetlight at the other, or the caverns underneath."),
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
    # A returned book lying on the reading-room floor, seen from above: the cover
    # in --cl-stamp, 8.63 on the plaster, its spine in --cl-ink, 13.35, and the
    # date-due slip sticking out of the top in --cl-card with --cl-ink-2 lines on
    # it, which carry nothing. It lies still.
    "lib-slip": """<path d="M11 3 H18 V8 H11 Z" fill="var(--cl-card)" stroke="var(--cl-ink-2)" stroke-width="1"/><path d="M12.5 5 H16.5 M12.5 6.6 H15.5" stroke="var(--cl-ink-2)" stroke-width="1"/><rect x="6" y="7" width="20" height="21" rx="1.5" fill="var(--cl-stamp)"/><rect x="6" y="7" width="4" height="21" fill="var(--cl-ink)"/><path d="M14 14 H22 M14 17 H20" stroke="var(--cl-card)" stroke-width="1.4" stroke-linecap="round"/>""",
    # The loose end of the string in L-space, coiled on the floor where it was
    # tied off: one line in --lsp-string, 13.32 on the violet, with its frayed
    # end. It lies still.
    "lsp-string": """<path d="M4 24 C8 24 9 20 13 20 C19 20 21 26 16 27 C11 28 10 22 15 19 C21 15 27 19 25 24 C24 27 20 26 21 23" fill="none" stroke="var(--lsp-string)" stroke-width="2.2" stroke-linecap="round"/><path d="M4 24 L2 22 M4 24 L1.5 25" stroke="var(--lsp-string)" stroke-width="1.4" stroke-linecap="round"/>""",
    # A banana skin on the floor of Oook, left where somebody finished the banana:
    # the peel in --ook-banana, 9.99 on the rust, splayed in three, with its stalk
    # and the tips in --ook-cream, 12.31. It lies still.
    "ook-peel": """<path d="M16 17 C12 18 7 22 4 27 C9 26 13 23 16 19 Z" fill="var(--ook-banana)"/><path d="M16 17 C20 18 25 22 28 27 C23 26 19 23 16 19 Z" fill="var(--ook-banana)"/><path d="M16 17 C14 22 15 26 17 29 C18 25 18 21 17 17 Z" fill="var(--ook-banana)"/><path d="M15 17 C15 13 16 9 18 6 L19.5 7 C18 10 17.5 13 17.5 17 Z" fill="var(--ook-banana)"/><path d="M18 6 L19.5 4.5" stroke="var(--ook-cream)" stroke-width="2" stroke-linecap="round"/><circle cx="4.5" cy="26.5" r="1" fill="var(--ook-cream)"/><circle cx="27.5" cy="26.5" r="1" fill="var(--ook-cream)"/>""",
    # The lid off a tin of paint, put down on the pavement at the foot of the
    # wall: seen a little from above, in --pm-line, 10.59 on the road, with a
    # ring of yellow paint dried round its rim in --pm-yellow, 7.56, and the
    # kerb line under it in --pm-yellow too, which carries nothing. It lies still.
    # A note somebody folded and left on the hall floor, the way the house's
    # business went round in notes: the paper in --cw-card, 7.9 on the painted
    # wall, the fold and the edge in --cw-ink-2, a round seal on it in
    # --cw-brass, 5.30, and the skirting under it in --cw-stone, which carries
    # nothing. It lies still and square.
    # A roll of masking tape dropped under the desk, with the marker that
    # wrote the strips beside it: the roll in --lvr-tape, 12.26 on the room,
    # its hole in the room's own colour, the marker in --lvr-text with its cap
    # in --lvr-link, 7.84, and the floor line in --lvr-cap, which carries
    # nothing. It lies still.
    # A sheet that came down in the bottom of your boat, folded once: the paper
    # in --bb-paper, 17.91 on the hull, its registration bar in --bb-ochre, 8.45,
    # two lines of print on it in the hull's own colour, and the boards under it
    # in --bb-dim, 9.07, which carries nothing. It lies still and square.
    "broadside-sheet": """<path d="M3 28 H29" stroke="var(--bb-dim)" stroke-width="1.6" stroke-linecap="round"/><path d="M5 22 L17 11 L28 17 L16 27 Z" fill="var(--bb-paper)"/><path d="M5 22 L17 11" stroke="var(--bb-ochre)" stroke-width="2.6" stroke-linecap="round"/><path d="M11 20 L19 14 M14 22 L22 16" stroke="var(--bb-hull)" stroke-width="1.4" stroke-linecap="round"/>""",
    # An ice cream scoop dropped on the floor in front of the cabinet, with the
    # last of a mint scoop still in it: the handle and bowl in --ds-steel, 5.82
    # on the shop, the mint in --ds-mint, 11.33, and the floor line in
    # --ds-rime, which carries nothing. It lies still.
    "doom-scoop-scoop": """<path d="M3 28 H29" stroke="var(--ds-rime)" stroke-width="1.6" stroke-linecap="round"/><path d="M15 21 L28 24.5" stroke="var(--ds-steel)" stroke-width="3.2" stroke-linecap="round"/><circle cx="10" cy="20" r="6.5" fill="var(--ds-steel)"/><path d="M4.6 18.2 Q6 12 11 12.6 Q15.6 13.4 15.4 18.4 Q10 16.4 4.6 18.2 Z" fill="var(--ds-mint)"/>""",
    "live-room-tape": """<path d="M3 28 H29" stroke="var(--lvr-cap)" stroke-width="1.6" stroke-linecap="round"/><circle cx="12" cy="18" r="8.5" fill="var(--lvr-tape)"/><circle cx="12" cy="18" r="4" fill="var(--lvr-room)"/><path d="M20.5 18 L23 26" stroke="var(--lvr-tape)" stroke-width="3" stroke-linecap="round"/><rect x="20" y="10" width="10" height="3.6" rx="1.8" fill="var(--lvr-text)"/><rect x="26.5" y="10" width="3.5" height="3.6" rx="1.2" fill="var(--lvr-link)"/>""",
    "cavendish-marker": """<path d="M3 28 H29" stroke="var(--cw-stone)" stroke-width="1.6" stroke-linecap="round"/><rect x="5" y="11" width="22" height="14" fill="var(--cw-card)"/><path d="M5 11 L16 19 L27 11" fill="none" stroke="var(--cw-ink-2)" stroke-width="1.4" stroke-linejoin="round"/><circle cx="16" cy="19" r="3.2" fill="var(--cw-brass)"/>""",
    "mural-lid": """<path d="M3 28 H29" stroke="var(--pm-yellow)" stroke-width="1.6" stroke-linecap="round"/><ellipse cx="16" cy="21" rx="12" ry="5.5" fill="var(--pm-line)"/><ellipse cx="16" cy="21" rx="8.5" ry="3.4" fill="none" stroke="var(--pm-yellow)" stroke-width="2"/><path d="M26 23 Q27 26 25.5 27" fill="none" stroke="var(--pm-yellow)" stroke-width="1.6" stroke-linecap="round"/>""",
    # The paste brush the bill went up with, put down on the pavement at the
    # foot of the column: a wide flat brush on a short handle, bristles and
    # handle both in --np-stock, 16.3 on the street's night, the ferrule band
    # in --np-drum-2 as detail on the brush rather than a shape on the ground,
    # and a smear of paste on the kerb line in --np-drum-2, which carries
    # nothing. Not in either ink: the screens are the poster's, and the brush
    # is the fly-poster's. It lies still.
    "now-playing-brush": """<path d="M3 28 H29" stroke="var(--np-drum-2)" stroke-width="1.8" stroke-linecap="round"/><path d="M4 21 H15 V26 H4 Z" fill="var(--np-stock)"/><path d="M15 21.5 H18 V25.5 H15 Z" fill="var(--np-drum-2)"/><path d="M18 22.2 L28 21 V25.8 L18 24.8 Z" fill="var(--np-stock)"/><path d="M6 21 V26 M9 21 V26 M12 21 V26" stroke="var(--np-night)" stroke-width="0.9"/>""",
    # A spare torch left on a tailgate, which is the one kind of light somebody
    # in that ring can take home: the body in --nfs-pale, 16.45 on the gravel,
    # its lens and the beam it would throw in --nfs-fog, 13.07, and the tailgate
    # edge under it in --nfs-dim, 7.98. None of it is switched on.
    "nothing-for-sale-torch": """<path d="M3 27 H29" stroke="var(--nfs-dim)" stroke-width="1.8" stroke-linecap="round"/><rect x="5" y="15" width="15" height="7" rx="2" fill="var(--nfs-pale)"/><path d="M20 13.5 L25 12 V25 L20 23.5 Z" fill="var(--nfs-fog)"/><path d="M9 18.5 H13" stroke="var(--nfs-gravel)" stroke-width="1.6" stroke-linecap="round"/>""",
    # A confirmation card blown against the foot of the mast, the kind radio
    # operators post to one another: the card in --rp-card, 14.79 on the cloud,
    # with its call stripe in --rp-call along the top, which is detail on the
    # card rather than a shape on the ground, and the ridge line under it in
    # --rp-glow, which carries nothing.
    "repeater-qsl": """<path d="M3 28 H29" stroke="var(--rp-glow)" stroke-width="1.8" stroke-linecap="round"/><path d="M5 10 L25 7 L27 23 L7 26 Z" fill="var(--rp-card)"/><path d="M5 10 L25 7 L25.6 11 L5.6 14 Z" fill="var(--rp-call)"/><path d="M8.5 18.5 L22 16.5 M9 22 L18 20.7" stroke="var(--rp-ink-2)" stroke-width="1.4" stroke-linecap="round"/>""",
    # A crayon dropped by the diner's door, out on the lot where the window's
    # light reaches: the wax in --sh-neon, 6.82 on the lot, its paper wrapper in
    # --sh-pale, 16.54, and the kerb under it in --sh-line, which carries
    # nothing. From the table of crayons in the menu, for the reason quoted there.
    "small-hours-crayon": """<path d="M3 28 H29" stroke="var(--sh-line)" stroke-width="1.6" stroke-linecap="round"/><path d="M6 22 L22 12 L26 15 L10 25 Z" fill="var(--sh-neon)"/><path d="M22 12 L28 9.5 L26 15 Z" fill="var(--sh-neon)"/><path d="M11 19 L15 16.5 L19 22 L15 24.5 Z" fill="var(--sh-pale)"/>""",
    # A glow stick snapped and dropped on the runway, which is the one kind of
    # light a silent disco leaves lying about: two lengths of it in --dp-orange,
    # 9.35 on the tarmac, bent at the snap, and the runway's edge in --dp-dim
    # under it, 8.44. Neither moves; nothing in that room glows on and off.
    "dance-punks-glowstick": """<path d="M3 28 H29" stroke="var(--dp-dim)" stroke-width="1.6" stroke-linecap="round"/><path d="M5 23 L14.5 16.5" stroke="var(--dp-orange)" stroke-width="4" stroke-linecap="round"/><path d="M17.5 15.5 L27 9" stroke="var(--dp-orange)" stroke-width="4" stroke-linecap="round"/><path d="M14.5 16.5 L17.5 15.5" stroke="var(--dp-orange)" stroke-width="1.6" stroke-linecap="round"/>""",
    # A little plastic grass divider slipped off a tray -- the kind a lunchbox
    # keeps two foods apart with -- lying on the cafe floor and, being in that
    # room, touching nothing, not even the floor line under it. The blades are
    # --sf-cress, 5.88 on the table, over the body threshold a marker is held to;
    # the floor line is --sf-ink-2 and carries nothing.
    # A feather come off the boa, lying on the shop floor under the stand: a
    # quill in --dd-ink and a curved vane in --dd-link, the room's magenta, 6.38
    # on the lavender wall and over the body threshold a marker is held to; the
    # pink of the boa itself is 2.07 there and would be a feather nobody could
    # find. The floor line is --dd-ink and carries nothing. It lies still.
    # The Bodymind Booth: a strip of four frames out of the slot, with nobody in
    # any of them, lying on the curtain-coloured floor. The strip is the booth's
    # --bmb-lamp outlined in --bmb-ink, 6.88 on the curtain, and its frames are
    # the curtain itself. It lies still.
    # Chimera Obscura: the brass cap off the lens in the roof, dropped on the
    # black floor. Its rim is --chm-brass, 5.23 on the black, and its face
    # --chm-link, 12.11, both over the body threshold a marker is held to, with a
    # ring of the room's black on the face. The floor line is --chm-dim and
    # carries nothing. It lies still.
    "chm-lenscap": """<path d="M3 29 H29" stroke="var(--chm-dim)" stroke-width="1.6" stroke-linecap="round"/><ellipse cx="16" cy="23.5" rx="11" ry="4.6" fill="var(--chm-brass)"/><circle cx="16" cy="15" r="8.6" fill="var(--chm-link)"/><circle cx="16" cy="15" r="5.4" fill="none" stroke="var(--chm-room)" stroke-width="1.3"/><circle cx="13.6" cy="12.6" r="1.4" fill="var(--chm-room)"/>""",
    # Community Care: a spare umbrella, rolled up with its strap done and left
    # on the dry paving by the door for whoever needs one. The canopy is
    # --cmc-teal, 5.61 on the paving and over the body threshold a marker is held
    # to, and the strap, the handle and the tip are --cmc-tie, 12.75. The floor
    # line is --cmc-dim and carries nothing. It lies still.
    "cmc-spare": """<path d="M3 29.5 H29" stroke="var(--cmc-dim)" stroke-width="1.6" stroke-linecap="round"/><path d="M4.5 26.5 L20.5 21.2 Q22.6 22.4 22.6 24.8 L21.8 26.6 Z" fill="var(--cmc-teal)" stroke="var(--cmc-rib)" stroke-width="1.2" stroke-linejoin="round"/><path d="M14.4 23.2 L15.2 26.6" stroke="var(--cmc-tie)" stroke-width="1.8" stroke-linecap="round"/><path d="M22.4 25 H26 q2.8 0 2.8 -2.8 q0 -2.2 -2.2 -2.2" fill="none" stroke="var(--cmc-tie)" stroke-width="1.8" stroke-linecap="round"/><path d="M4.5 26.5 L2.6 27.2" stroke="var(--cmc-tie)" stroke-width="1.4" stroke-linecap="round"/>""",
    "booth-strip": """<path d="M3 29.5 H29" stroke="var(--bmb-ink)" stroke-width="1.6" stroke-linecap="round"/><path d="M4 23.5 L27 17.5 L28.6 23.5 L5.6 29.5 Z" fill="var(--bmb-lamp)" stroke="var(--bmb-ink)" stroke-width="1.4" stroke-linejoin="round"/><path d="M7 23.9 L10.6 23 L11.4 26.1 L7.8 27 Z M12.6 22.5 L16.2 21.6 L17 24.7 L13.4 25.6 Z M18.2 21.1 L21.8 20.2 L22.6 23.3 L19 24.2 Z M23.8 19.7 L27 18.9 L27.8 22 L24.6 22.8 Z" fill="var(--bmb-curtain)" stroke="var(--bmb-ink)" stroke-width=".8" stroke-linejoin="round"/>""",
    # Fantasy Fancy Dress: one faery wing come loose from its pair, lying on the
    # dark floor in front of the sheers. The wing is --ffd-rose outlined in
    # --ffd-ink, 8.6 on --ffd-ground, over the body threshold a marker is held
    # to, with a vein in --ffd-ground. The floor line is --ffd-edge and carries
    # nothing. It lies still.
    "fancy-wing": """<path d="M3 29 H29" stroke="var(--ffd-edge)" stroke-width="1.6" stroke-linecap="round"/><path d="M6 25 C8 12 18 4 27 5 C27 14 21 22 13 25 Q9 26.5 6 25 Z" fill="var(--ffd-rose)" stroke="var(--ffd-ink)" stroke-width="1.3" stroke-linejoin="round"/><path d="M8 24 Q16 15 24 8 M12 23 Q15 19 20 17" fill="none" stroke="var(--ffd-ground)" stroke-width="1" stroke-linecap="round"/>""",
    "dressup-feather": """<path d="M3 29 H29" stroke="var(--dd-ink)" stroke-width="1.6" stroke-linecap="round"/><path d="M7 26 Q12 12 27 6 Q26 16 17 22 Q12 25 7 26 Z" fill="var(--dd-link)" stroke="var(--dd-ink)" stroke-width="1.4" stroke-linejoin="round"/><path d="M5 28 Q15 17 26 7" fill="none" stroke="var(--dd-ink)" stroke-width="1.6" stroke-linecap="round"/><path d="M13 20 L10 16 M17 17 L15 12 M21 13 L20 9" stroke="var(--dd-ink)" stroke-width="1.1" stroke-linecap="round"/>""",
    # A sprig of cilantro fallen off the shelf over the counter, lying on the
    # kitchen floor: a stem and three lobed leaflets in --vpl-leaf, 4.86 on the
    # turmeric wall, over the body threshold a marker is held to. The floor
    # line is --vpl-ink and carries nothing. It lies flat and does not move.
    # A push-in letter fallen off the letterboard over the door, lying on the
    # floor of the hall: a white plastic T with the two pins on its back that
    # hold it in the felt, outlined in --ctr-ink at 9.63 on the shaded wall,
    # over the body threshold a marker is held to. The white alone would be
    # 1.3 against the paint, so the outline carries it, the way every chair in
    # the Hermitage is carried. It lies flat and does not move.
    # The World room's drop of dew, on a broken strand fallen to the floor: the
    # strand and the floor line are --www-silk, 15.28 on the sky, and the drop
    # --www-bead, 14.58, both over the body threshold a marker is held to.
    "world-dewdrop": """<path d="M3 29 H29" stroke="var(--www-silk)" stroke-width="1.6" stroke-linecap="round"/><path d="M5 6 Q12 14 15 18 M19 15 Q24 9 28 4" stroke="var(--www-silk)" stroke-width="1.3" fill="none" stroke-linecap="round"/><path d="M17 15.5 C19.5 19 21 21 21 23 A4 4 0 0 1 13 23 C13 21 14.5 19 17 15.5 Z" fill="var(--www-bead)" stroke="var(--www-silk)" stroke-width="1"/>""",
    "community-letter": """<path d="M3 29 H29" stroke="var(--ctr-ink)" stroke-width="1.6" stroke-linecap="round"/><path d="M6 11 H26 V16 H19 V26 H13 V16 H6 Z" fill="var(--ctr-letter)" stroke="var(--ctr-ink)" stroke-width="2" stroke-linejoin="round"/><path d="M9 8 V11 M23 8 V11" stroke="var(--ctr-ink)" stroke-width="1.8" stroke-linecap="round"/>""",
    "vital-sprig": """<path d="M3 29 H29" stroke="var(--vpl-ink)" stroke-width="1.6" stroke-linecap="round"/><path d="M6 25 Q15 22 26 13" fill="none" stroke="var(--vpl-leaf)" stroke-width="2.2" stroke-linecap="round"/><circle cx="12" cy="20" r="3.6" fill="var(--vpl-leaf)"/><circle cx="18" cy="15" r="3.6" fill="var(--vpl-leaf)"/><circle cx="25" cy="9" r="3.8" fill="var(--vpl-leaf)"/><circle cx="21" cy="21" r="3.2" fill="var(--vpl-leaf)"/>""",
    "samefood-divider": """<path d="M3 29 H29" stroke="var(--sf-ink-2)" stroke-width="1.6" stroke-linecap="round"/><path d="M5 25 L7 13 L10 21 L13 8 L16 21 L19 9 L22 21 L25 12 L27 25 Z" fill="none" stroke="var(--sf-cress)" stroke-width="2.2" stroke-linejoin="round"/><path d="M5 25 H27" stroke="var(--sf-cress)" stroke-width="2.6" stroke-linecap="round"/>""",
    # A luggage tag come off its string -- the kind tied to every thing in the
    # gallery -- lying on the dark floor with its string still through the hole.
    # The tag is --cc-card, 15.89 on the floor, over the body threshold a marker
    # is held to; its string is --cc-dust at 7.49, and the floor line is
    # --cc-line and carries nothing.
    "collection-tag": """<path d="M3 29 H29" stroke="var(--cc-line)" stroke-width="1.6" stroke-linecap="round"/><path d="M8 25 L8 15 L13 10 H26 V25 Z" fill="var(--cc-card)" stroke="var(--cc-card)" stroke-width="1.6" stroke-linejoin="round"/><circle cx="12.4" cy="15.2" r="1.7" fill="var(--cc-dark)"/><path d="M12.4 15.2 C9 12 6 9 4 11 C2 13 5 17 3 21" fill="none" stroke="var(--cc-dust)" stroke-width="1.4" stroke-linecap="round"/><path d="M16 17.5 H23 M16 21 H21" stroke="var(--cc-ink-2)" stroke-width="1.4" stroke-linecap="round"/>""",
    # Ear defenders left on a seat in the second row, which is where a relaxed
    # screening keeps a spare pair: the headband and both cups in --lph-cream,
    # 10.2 on the velvet, and the seat's edge in --lph-brass, which carries
    # nothing. Held to the body threshold a marker is held to. No blue.
    "picture-house-earmuffs": """<path d="M3 27 H29" stroke="var(--lph-brass)" stroke-width="1.8" stroke-linecap="round"/><path d="M8 19 Q8 5 16 5 Q24 5 24 19" fill="none" stroke="var(--lph-cream)" stroke-width="2.4" stroke-linecap="round"/><rect x="4" y="16" width="7" height="10" rx="3" fill="none" stroke="var(--lph-cream)" stroke-width="2.2"/><rect x="21" y="16" width="7" height="10" rx="3" fill="none" stroke="var(--lph-cream)" stroke-width="2.2"/>""",
    # A set list taped to the stage floor by the mic stand, which is where every
    # comic keeps theirs: a sheet in --ls-cream, 15.72 on the house, with three
    # lines of running order on it and a strip of tape across the top in the
    # neon, 12.39. Both clear the body threshold a marker is held to. The sheet
    # is drawn skewed as a polygon rather than rotated, because rotation is all
    # check-gentle.py can read and a marker must not ask it to take the room's
    # word. The floor line is --ls-edge and carries nothing.
    "laughingstock-setlist": """<path d="M2 28 H30" stroke="var(--ls-edge)" stroke-width="1.8" stroke-linecap="round"/><path d="M8 6 L25 4 L27 25 L10 27 Z" fill="none" stroke="var(--ls-cream)" stroke-width="2.2" stroke-linejoin="round"/><path d="M12.5 12 L22 11 M13 16.5 L22.5 15.5 M13.5 21 L20 20.3" stroke="var(--ls-cream)" stroke-width="1.6" stroke-linecap="round"/><path d="M11 3.5 L21 2.4 L21.4 6.6 L11.4 7.7 Z" fill="var(--ls-neon)"/>""",
    # A rubber doorstop wedged under the door, which is the only thing holding
    # that room open -- and the reason anybody can find it and anybody can
    # leave. Drawn in --dts-exit, the corridor's green and that room's link
    # colour, 10.74 on its plum, so it clears the body threshold a marker is
    # held to. The floor line is --dts-edge and carries nothing.
    "dead-tired-doorstop": """<path d="M3 25 H29" stroke="var(--dts-edge)" stroke-width="1.8" stroke-linecap="round"/><path d="M5 25 L27 25 L27 13 Z" fill="none" stroke="var(--dts-exit)" stroke-width="2.3" stroke-linejoin="round"/><path d="M13 21 L13 25 M18 18 L18 25 M23 15 L23 25" stroke="var(--dts-exit)" stroke-width="1.5" stroke-linecap="round" opacity=".8"/><path d="M27 6 V13" stroke="var(--dts-exit)" stroke-width="2.3" stroke-linecap="round"/>""",
    # A flood lamp at the foot of the rock, pointing UP, which is the one
    # thing that room does that nothing else on this street does. Drawn in
    # the lichen rather than the lamp's own violet: 10.65 against that
    # ground where the violet is 5.86, and a marker is held to the body
    # threshold either way, but the brighter one is the thing you can see.
    "looming-flood": """<path d="M9 28 H23 L21 20 H11 Z" fill="none" stroke="var(--lr-lichen)" stroke-width="2.2" stroke-linejoin="round"/><path d="M11 20 L7 6 M21 20 L25 6" stroke="var(--lr-lichen)" stroke-width="1.6" stroke-linecap="round" opacity=".7"/><path d="M13 19 L14 4 M19 19 L18 4" stroke="var(--lr-lichen)" stroke-width="1.4" stroke-linecap="round" opacity=".45"/><path d="M12 24 H20" stroke="var(--lr-lichen)" stroke-width="1.8" stroke-linecap="round"/>""",
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
    # A length of handrail with its two stanchions, drawn in the rail's own
    # warm white, which is the only colour the caverns' passage has: 15.50 on
    # the rock it lies on. The floor line is --cav-seam and carries nothing.
    "caverns-rail": """<path d="M3 28 H29" stroke="var(--cav-seam)" stroke-width="1.8" stroke-linecap="round"/><path d="M3 12 H29" stroke="var(--cav-rail)" stroke-width="2.6" stroke-linecap="round"/><path d="M8 12 V28 M24 12 V28" stroke="var(--cav-rail)" stroke-width="2" stroke-linecap="round"/><path d="M5 16 H27" stroke="var(--cav-rail)" stroke-width="1.2" stroke-linecap="round" opacity=".45"/>""",
    # A thermometer lying on the floor, drawn in the room's frost: 15.47 on the
    # wet rock. It reads nothing, because the reading is on the room's wall in
    # words. The floor line is --fro-bead and carries nothing.
    "frosty-thermometer": """<path d="M3 29 H29" stroke="var(--fro-bead)" stroke-width="1.8" stroke-linecap="round"/><path d="M13 22 V6 q0 -3 3 -3 q3 0 3 3 V22" fill="none" stroke="var(--fro-frost)" stroke-width="2.2" stroke-linejoin="round"/><circle cx="16" cy="24" r="4.2" fill="none" stroke="var(--fro-frost)" stroke-width="2.2"/><path d="M16 24 V11" stroke="var(--fro-frost)" stroke-width="2.2" stroke-linecap="round"/><path d="M20 9 H23 M20 13 H22 M20 17 H23" stroke="var(--fro-frost)" stroke-width="1.4" stroke-linecap="round"/>""",
    # A ribbon come loose off a fan's cage, lying on the floor with the knot
    # still in it: the one thing in that room that shows the air moving. Drawn
    # in the ribbon red, 5.67 on the hall's wall, over the fan-blade teal.
    "breezy-ribbon": """<path d="M3 29 H29" stroke="var(--bz-cage)" stroke-width="1.8" stroke-linecap="round"/><circle cx="9" cy="21" r="3.2" fill="none" stroke="var(--bz-blade)" stroke-width="2.2"/><path d="M12 20 q6 -8 11 -2 q5 6 7 -3" fill="none" stroke="var(--bz-ribbon)" stroke-width="2.6" stroke-linecap="round"/><path d="M11 23 q5 5 11 2" fill="none" stroke="var(--bz-ribbon)" stroke-width="2.6" stroke-linecap="round"/>""",
    # A spent growing block on the kitchen floor, with two small caps still on
    # its side: the part of the farm that goes out as compost. Drawn in the
    # mushrooms' tan, 7.92 on the kitchen's dark; the floor is --myc-shelf.
    "mycelium-block": """<path d="M3 29 H29" stroke="var(--myc-shelf)" stroke-width="1.8" stroke-linecap="round"/><rect x="7" y="11" width="18" height="17" rx="3" fill="none" stroke="var(--myc-tan)" stroke-width="2.2"/><path d="M10 17 H22 M10 22 H20" stroke="var(--myc-tan)" stroke-width="1.2" stroke-linecap="round" opacity=".6"/><path d="M22 12 q3 -5 7 -2 q-3 3 -7 2 Z M20 9 q2 -4 5 -2 q-2 2 -5 2 Z" fill="var(--myc-tan)"/>""",
    # A glass carboy on the cellar floor with an airlock in its neck, drawn in
    # the straw of a pale drink with the light through it, 11.24 on the rock.
    # The floor line is --bs-rack and carries nothing.
    "bigsteep-carboy": """<path d="M3 29 H29" stroke="var(--bs-rack)" stroke-width="1.8" stroke-linecap="round"/><path d="M13 5 H19 V9 Q27 12 27 20 V25 Q27 28 24 28 H8 Q5 28 5 25 V20 Q5 12 13 9 Z" fill="none" stroke="var(--bs-straw)" stroke-width="2.2" stroke-linejoin="round"/><path d="M16 5 V1 M14 2 H18" stroke="var(--bs-straw)" stroke-width="1.6" stroke-linecap="round"/><path d="M7 21 H25" stroke="var(--bs-straw)" stroke-width="1.2" opacity=".6"/>""",
    # A glow-in-the-dark star fallen off a ceiling onto the shop floor, drawn in
    # the green that lasts longest, 15.18 on the shop's dark. The floor line is
    # --gg-shelf-line and carries nothing.
    "glow-star": """<path d="M3 29 H29" stroke="var(--gg-shelf-line)" stroke-width="1.8" stroke-linecap="round"/><path d="M16 4 L19.1 11.7 L27.4 12.3 L21 17.7 L23 25.8 L16 21.4 L9 25.8 L11 17.7 L4.6 12.3 L12.9 11.7 Z" fill="none" stroke="var(--gg-green)" stroke-width="2.2" stroke-linejoin="round"/>""",
    # A foam earplug dropped on the hangar floor, from the basket at the
    # hydration station, drawn in the hazard yellow of the warning it sits
    # beside, 13.86 on the hangar's dark. The floor line is --rr-steel and
    # carries nothing.
    "rave-earplug": """<path d="M3 29 H29" stroke="var(--rr-steel)" stroke-width="1.8" stroke-linecap="round"/><path d="M8 23 Q7 17 12.5 16 L22 13.8 Q26.5 13 27 17.5 Q27.5 22 23 22.6 L13.5 25 Q9 26 8 23 Z" fill="none" stroke="var(--rr-hazard)" stroke-width="2.2" stroke-linejoin="round"/><path d="M15 16.2 L16.6 24.2 M19.4 15.2 L20.9 23.4" stroke="var(--rr-hazard)" stroke-width="1.3" stroke-linecap="round" opacity=".7"/>""",
    # A bottle cap rolled under a couch, crimped round its edge, in the mint the
    # room uses for every control, 10.98 on the room. The floor line is
    # --cool-cabinet and carries nothing.
    # One yellow welly, left standing by the MUD Room's back door: a boot
    # with a heel and a sole, in --mud-welly, 10.13 on the mud, over the body
    # threshold a marker is held to. The floor line and the sole are --mud-dim
    # and carry nothing. It lies still.
    # A gold aspen leaf, fallen at the foot of the fence round the new growth on
    # Pando Calrissian's hill: round, with a point, on a flat stalk, which is
    # the flattened stem that makes an aspen leaf quake. --pdo-gold is 6.63 on
    # the valley's shade, the floor line --pdo-dim 6.91, both over the body
    # threshold a marker is held to; the midrib is the shade itself.
    # A word magnet that has slid to the foot of the fridge door, nothing on it
    # yet: the tile's edge and its word are --fos-ink, 6.51 on the enamel, over
    # the body threshold a marker is held to. The tile's face is --fos-tile,
    # which is 2.37 on the door alone, so the edge carries it, as on the door.
    # The stairlift's call button, a small box on the wall at the foot of the
    # stairs. The box is --cmi-dado, 5.89 on the pale wall, over the body
    # threshold a marker is held to; the button on it is --cmi-nosing, and the
    # floor line under it --cmi-ink.
    # A torch somebody left on the kerb, still on. The body is --rac-dim, 9.10 on
    # the dark, and so is the kerb line, over the body threshold a marker is held
    # to; the lens is the torch's own pool colour and the light it throws is
    # eyeshine, which is the only colour in the room.
    # A dog's red lead, dropped in the snow by a gate. The lead is --rad-link,
    # 6.28 on the snow, and the snow line and the clip --rad-ink, over the body
    # threshold a marker is held to; the prints beside it are --rad-track.
    # A wisp of hay caught in a strip of daylight on the dust, under a crack in
    # the boards. The strip is --rsa-lit, 13.16 against the dust it lies on, the
    # hay --rsa-link inside it, and the floor line --rsa-dim at 7.12, both over
    # the body threshold a marker is held to.
    # A brass tack that fell out of a plate, lying on the pavement under the
    # board, point up. The head is --btb-link, 8.15 on the green wall, and the
    # floor line --btb-dim at 6.97, both over the body threshold.
    "brass-tack": """<path d="M3 29 H29" stroke="var(--btb-dim)" stroke-width="1.6" stroke-linecap="round"/><ellipse cx="16" cy="24" rx="9" ry="3.4" fill="var(--btb-link)"/><path d="M16 21 V7" stroke="var(--btb-link)" stroke-width="2.4" stroke-linecap="round"/><path d="M16 21 V7" stroke="var(--btb-ink)" stroke-width="0.8" stroke-linecap="round"/>""",
    "smalls-hay": """<path d="M3 29 H29" stroke="var(--rsa-dim)" stroke-width="1.6" stroke-linecap="round"/><polygon points="11,3 15,3 23,27 13,27" fill="var(--rsa-lit)"/><path d="M12 22 Q17 18 22 21 M13 25 Q18 20 24 24 M14 19 Q18 17 21 18" fill="none" stroke="var(--rsa-ink)" stroke-width="1.8" stroke-linecap="round"/><path d="M12 22 Q17 18 22 21 M13 25 Q18 20 24 24" fill="none" stroke="var(--rsa-link)" stroke-width="1" stroke-linecap="round"/>""",
    "dogs-lead": """<path d="M3 29 H29" stroke="var(--rad-ink)" stroke-width="1.6" stroke-linecap="round"/><path d="M6 24 Q10 8 18 12 Q26 16 22 24" fill="none" stroke="var(--rad-link)" stroke-width="2.6" stroke-linecap="round"/><circle cx="22" cy="25.5" r="2.2" fill="none" stroke="var(--rad-ink)" stroke-width="1.6"/><ellipse cx="27" cy="19" rx="1.8" ry="1.3" fill="var(--rad-track)"/><ellipse cx="25.5" cy="15" rx="1.8" ry="1.3" fill="var(--rad-track)"/>""",
    "cats-torch": """<path d="M3 29 H29" stroke="var(--rac-dim)" stroke-width="1.6" stroke-linecap="round"/><rect x="5" y="19" width="15" height="7" rx="2" fill="var(--rac-dim)"/><path d="M20 18 L25 16 V29 L20 27 Z" fill="var(--rac-dim)"/><ellipse cx="25" cy="22.5" rx="1.6" ry="6" fill="var(--rac-beam)"/><circle cx="12" cy="10" r="1.8" fill="var(--rac-eye)"/><circle cx="17" cy="10" r="1.8" fill="var(--rac-eye)"/>""",
    # The Open Notebook's roll of washi tape, set down on the floor under the
    # desk with a length of it pulled out. The roll's edge and the floor are
    # --onb-ink, 15.38 on the page, well over the body threshold a marker is
    # held to; the tape itself is --onb-washi-butter, which carries nothing, and
    # its core is the page showing through.
    "onb-washi": """<path d="M3 29 H29" stroke="var(--onb-ink)" stroke-width="1.6" stroke-linecap="round"/><path d="M15 25.5 H28 L26.5 23 L28 20.5 H15 Z" fill="var(--onb-washi-butter)" stroke="var(--onb-ink)" stroke-width="1.4" stroke-linejoin="round"/><circle cx="12" cy="17" r="9.5" fill="var(--onb-washi-butter)" stroke="var(--onb-ink)" stroke-width="1.8"/><circle cx="12" cy="17" r="4.2" fill="var(--onb-page)" stroke="var(--onb-ink)" stroke-width="1.4"/>""",
    # Learning Large's dibber, the pointed tool for making a hole for a seed,
    # set down on the floor under the potting bench with its depth rings on
    # the shaft. Its outline and the floor are --ll-rim, 10.29 on the night,
    # well over the body threshold a marker is held to; the wood is lit by the
    # lamp, --ll-lamp, and the rings are the dark showing through.
    "ll-dibber": """<path d="M3 29 H29" stroke="var(--ll-rim)" stroke-width="1.6" stroke-linecap="round"/><rect x="4" y="19" width="5" height="9" rx="1.6" fill="var(--ll-lamp)" stroke="var(--ll-rim)" stroke-width="1.4"/><path d="M9 21.6 H22 L28.5 23.5 L22 25.4 H9 Z" fill="var(--ll-lamp)" stroke="var(--ll-rim)" stroke-width="1.4" stroke-linejoin="round"/><path d="M13 21.6 V25.4 M16.5 21.6 V25.4 M20 21.6 V25.4" stroke="var(--ll-night)" stroke-width="1.2"/>""",
    # Hey, Good Cookin's ladle, an enamel one, set down on the floor by the
    # placard station: its bowl is the soup kettle's --hgc-enamel, 7.09 on the
    # wall, with two of the kettle's white flecks in it, and its outline, its
    # handle and the floor line are --hgc-ink, 13.32 on the wall, both well over
    # the body threshold a marker is held to.
    "hgc-ladle": """<path d="M3 29 H29" stroke="var(--hgc-ink)" stroke-width="1.6" stroke-linecap="round"/><path d="M4 21 A6 6 0 0 0 16 21 Z" fill="var(--hgc-enamel)" stroke="var(--hgc-ink)" stroke-width="1.4" stroke-linejoin="round"/><path d="M15.5 21 L27.5 14.6" stroke="var(--hgc-ink)" stroke-width="2.2" stroke-linecap="round"/><path d="M27.5 14.6 Q29.6 13.4 28.4 11.8" fill="none" stroke="var(--hgc-ink)" stroke-width="1.6" stroke-linecap="round"/><circle cx="8" cy="23.4" r=".9" fill="var(--hgc-fleck)"/><circle cx="12" cy="24.2" r=".9" fill="var(--hgc-fleck)"/>""",
    # Pekoe and Purrs' felt mouse on a string, batted under the second table:
    # its body is --pkp-link, the deep raspberry felt, 6.58 on the coral wall,
    # and its outline, its string tail and the floor line are --pkp-ink, 8.70,
    # both over the body threshold a marker is held to; its eye is a detail in
    # --pkp-card.
    "pkp-mouse": """<path d="M3 29 H29" stroke="var(--pkp-ink)" stroke-width="1.6" stroke-linecap="round"/><path d="M5 25 Q6 16 15 16 Q22 16 25 25 Z" fill="var(--pkp-link)" stroke="var(--pkp-ink)" stroke-width="1.4" stroke-linejoin="round"/><circle cx="11" cy="16.5" r="3" fill="var(--pkp-link)" stroke="var(--pkp-ink)" stroke-width="1.2"/><circle cx="8.6" cy="21" r=".9" fill="var(--pkp-card)"/><path d="M25 25 Q29 22 27.5 17 Q26.5 13 29 11" fill="none" stroke="var(--pkp-ink)" stroke-width="1.4" stroke-linecap="round"/>""",
    # Brew and Stew's wooden spoon, dropped by the stove: its bowl and handle
    # are --bns-glow, the foxfire, 12.96 on the heather, and its outline and the
    # floor line are --bns-text, 13.23, both over the body threshold a marker is
    # held to.
    "bns-spoon": """<path d="M3 29 H29" stroke="var(--bns-text)" stroke-width="1.6" stroke-linecap="round"/><ellipse cx="9" cy="22" rx="5.5" ry="3.6" fill="var(--bns-glow)" stroke="var(--bns-text)" stroke-width="1.2"/><path d="M13.6 20.6 L28 15" stroke="var(--bns-glow)" stroke-width="2.6" stroke-linecap="round"/>""",
    # Mountain Man's carabiner, off the cable car's top station and dropped on
    # the cabin's floor: its body and the floor line are --efw-text, 14.10 on
    # the night it lies against, and its gate --efw-link, 10.39.
    "mtn-carabiner": """<path d="M3 29 H29" stroke="var(--efw-text)" stroke-width="1.6" stroke-linecap="round"/><rect x="10" y="3" width="12" height="23" rx="6" fill="none" stroke="var(--efw-text)" stroke-width="2.4"/><path d="M10 10 V19" stroke="var(--efw-link)" stroke-width="3.2" stroke-linecap="round"/><path d="M7.5 9.5 L10 10 M7.5 19.5 L10 19" stroke="var(--efw-text)" stroke-width="1.6" stroke-linecap="round"/>""",
    # The Bough House's acorn, dropped on the platform: its nut is --bgh-rust,
    # 5.54 on the autumn sky it lies against, and its cap, its stalk and the
    # floor line are --bgh-bark, 11.91.
    "bgh-acorn": """<path d="M3 29 H29" stroke="var(--bgh-bark)" stroke-width="1.6" stroke-linecap="round"/><path d="M10.5 18 Q10.5 27.5 16 27.5 Q21.5 27.5 21.5 18 Z" fill="var(--bgh-rust)" stroke="var(--bgh-bark)" stroke-width="1.3" stroke-linejoin="round"/><path d="M9 18.4 Q9 12 16 12 Q23 12 23 18.4 Z" fill="var(--bgh-bark)"/><path d="M16 12 Q16.5 9 18.5 7.5" stroke="var(--bgh-bark)" stroke-width="1.6" fill="none" stroke-linecap="round"/>""",
    # The Run's blue ball, chewed, by the porch steps: its body is --run-link,
    # the Run's own blue, 5.15 on the grass, because the brighter ball blue is
    # 3.17 there and a marker is held to the body threshold; its outline and
    # the floor line are --run-ink, 8.12. The seam is --run-paper.
    "run-ball": """<path d="M3 29 H29" stroke="var(--run-ink)" stroke-width="1.6" stroke-linecap="round"/><circle cx="16" cy="21" r="7.5" fill="var(--run-link)" stroke="var(--run-ink)" stroke-width="1.4"/><path d="M9.6 18 Q16 23 22.4 18" fill="none" stroke="var(--run-paper)" stroke-width="1.4" stroke-linecap="round"/><path d="M12 27 l1.4 -2 M19 27.4 l-1 -2.2" stroke="var(--run-ink)" stroke-width="1"/>""",
    # The Truck Stop's empty paper boat, left on the porch: its body is
    # --tks-link, 7.6 on the lot, and its outline and the floor line are
    # --tks-ink, over the body threshold a marker is held to. A smear of salsa
    # is --tks-marigold, a detail.
    "tks-boat": """<path d="M3 29 H29" stroke="var(--tks-ink)" stroke-width="1.6" stroke-linecap="round"/><path d="M5 17 L8 25 H24 L27 17 Z" fill="var(--tks-link)" stroke="var(--tks-ink)" stroke-width="1.4" stroke-linejoin="round"/><path d="M11 19 Q16 17 21 19" fill="none" stroke="var(--tks-marigold)" stroke-width="1.6" stroke-linecap="round"/>""",
    # The Green's wet leaf, stuck to the boardwalk: the leaf is --grn-ink,
    # 8.39 on the lawn, and the line of sky along its top edge is --grn-sheen,
    # because it is wet. The floor line is the ink.
    "grn-leaf": """<path d="M3 29 H29" stroke="var(--grn-ink)" stroke-width="1.6" stroke-linecap="round"/><path d="M6 25 Q8 13 24 11 Q24 23 9 26 Z" fill="var(--grn-ink)"/><path d="M8 24 Q15 17 22 13" fill="none" stroke="var(--grn-sheen)" stroke-width="1.2" stroke-linecap="round"/><path d="M9 14 Q14 11.6 21 11.4" fill="none" stroke="var(--grn-sheen)" stroke-width="1.2" stroke-linecap="round"/>""",
    # The Pile's roll of duct tape, half used: the roll is --pil-link, 8.8 on
    # the sand, its hole the sand itself, the torn end --pil-tape, and the
    # outline and the floor line --pil-ink.
    "pil-tape": """<path d="M3 29 H29" stroke="var(--pil-ink)" stroke-width="1.6" stroke-linecap="round"/><circle cx="14" cy="20" r="7.5" fill="var(--pil-link)" stroke="var(--pil-ink)" stroke-width="1.4"/><circle cx="14" cy="20" r="3" fill="var(--pil-sand)" stroke="var(--pil-ink)" stroke-width="1"/><path d="M20 24 L28 27 L27 29 L19 26.4 Z" fill="var(--pil-tape)" stroke="var(--pil-ink)" stroke-width="1"/>""",
    # A Quiet Pint's beer mat, dropped on the floor: the mat is --aqp-sea, 8.34
    # on the wood, with its edge in --aqp-mat and a ring printed on it in the
    # wood; the floor line is --aqp-dim, 7.43. Both over the body threshold a
    # marker is held to.
    "aqp-mat": """<path d="M3 29 H29" stroke="var(--aqp-dim)" stroke-width="1.6" stroke-linecap="round"/><path d="M5 21 V23.4 Q16 30.4 27 23.4 V21" fill="var(--aqp-mat)"/><ellipse cx="16" cy="21" rx="11" ry="5" fill="var(--aqp-sea)"/><ellipse cx="16" cy="21" rx="7" ry="3" fill="none" stroke="var(--aqp-wood)" stroke-width="1.3"/>""",
    # Nature's Contribution's acorn, dropped by the stile: its nut is
    # --ncx-sun, 8.88 on the shade, and its cup, its outline and the floor line
    # are --ncx-text, 10.91, both over the body threshold a marker is held to.
    "ncx-stile": """<path d="M3 29 H29" stroke="var(--ncx-text)" stroke-width="1.6" stroke-linecap="round"/><path d="M10 14 Q10 26 16 27 Q22 26 22 14 Z" fill="var(--ncx-sun)" stroke="var(--ncx-text)" stroke-width="1.2" stroke-linejoin="round"/><path d="M8.5 14.5 Q16 7 23.5 14.5 Z" fill="var(--ncx-text)"/><path d="M16 9.5 V6" stroke="var(--ncx-text)" stroke-width="1.6" stroke-linecap="round"/>""",
    # All Needs Met's feather, dropped by Otis: its vane is --anm-body, 17.6 on
    # the night, and its shaft and the floor line are --anm-text, 15.16, both
    # over the body threshold a marker is held to, and neither has a hue.
    "anm-feather": """<path d="M3 29 H29" stroke="var(--anm-text)" stroke-width="1.6" stroke-linecap="round"/><path d="M8 25 Q10 12 24 6 Q22 18 8 25 Z" fill="var(--anm-body)"/><path d="M6 27 L22 9" stroke="var(--anm-text)" stroke-width="1.4" stroke-linecap="round"/>""",
    # Brighter Days' chiltepin, dropped between the rows: its fruit is
    # --bds-sun, 10.40 on the glass, and its stem and the floor line are
    # --bds-text, 13.31, both over the body threshold a marker is held to.
    "bds-chiltepin": """<path d="M3 29 H29" stroke="var(--bds-text)" stroke-width="1.6" stroke-linecap="round"/><ellipse cx="15" cy="20" rx="6.5" ry="5" fill="var(--bds-sun)" stroke="var(--bds-text)" stroke-width="1.2"/><path d="M19 16 Q22 11 25 10" stroke="var(--bds-text)" stroke-width="1.8" fill="none" stroke-linecap="round"/>""",
    # Gentle Help's fan leaf, fallen on the path: its leaflets are --ghc-head,
    # 7.15 on the skin, and its stem and the floor line are --ghc-ink, 11.09,
    # both over the body threshold a marker is held to.
    "ghc-leaf": """<path d="M3 29 H29" stroke="var(--ghc-ink)" stroke-width="1.6" stroke-linecap="round"/><path d="M16 22 L16 27" stroke="var(--ghc-ink)" stroke-width="1.6"/><path d="M16 22 Q14 13 16 4 Q18 13 16 22 Z M16 22 Q10 15 7 8 Q14 13 16 22 Z M16 22 Q22 15 25 8 Q18 13 16 22 Z M16 22 Q8 20 4 15 Q11 17 16 22 Z M16 22 Q24 20 28 15 Q21 17 16 22 Z" fill="var(--ghc-head)"/>""",
    # All Together Now's brown egg, laid by the gate: the shell is --atn-card
    # with an --atn-ink outline, 8.88 on the sky and 8.95 and 10.16 on its two
    # ends, and its speckles and the grass line are --atn-link, 6.33 at the
    # least, both over the body threshold a marker is held to.
    "atn-egg": """<path d="M3 29 H29" stroke="var(--atn-link)" stroke-width="1.6" stroke-linecap="round"/><path d="M16 5 C22 5 25 14 25 19 C25 24 21 27 16 27 C11 27 7 24 7 19 C7 14 10 5 16 5 Z" fill="var(--atn-card)" stroke="var(--atn-ink)" stroke-width="1.8"/><circle cx="13" cy="15" r="1.2" fill="var(--atn-link)"/><circle cx="18.5" cy="12" r="1" fill="var(--atn-link)"/><circle cx="19" cy="20" r="1.3" fill="var(--atn-link)"/><circle cx="12.5" cy="21.5" r="0.9" fill="var(--atn-link)"/>""",
    # The Dairy's milk churn by the door: its outline and the floor line are
    # --dry-ink, 13.94 on the tile, and its band is --dry-band, 5.74,
    # both over the body threshold a marker is held to; the steel fill is
    # ornament inside the outline.
    "dry-churn": """<path d="M3 29 H29" stroke="var(--dry-ink)" stroke-width="1.6" stroke-linecap="round"/><path d="M12 5 H20 V8 L23 11 V26 H9 V11 L12 8 Z" fill="var(--dry-steel)" stroke="var(--dry-ink)" stroke-width="1.6" stroke-linejoin="round"/><path d="M9 17 H23" stroke="var(--dry-band)" stroke-width="2.6"/><path d="M11 5 H21" stroke="var(--dry-ink)" stroke-width="2.2" stroke-linecap="round"/>""",
    # The Honesty Box's coin, dropped by the box: --hbx-link, 10.49 on the
    # night, with the kerb line in --hbx-fog, 8.48, both over the body threshold a
    # marker is held to.
    "hbx-coin": """<path d="M3 29 H29" stroke="var(--hbx-fog)" stroke-width="1.6" stroke-linecap="round"/><ellipse cx="16" cy="22" rx="11" ry="4.5" fill="var(--hbx-link)"/><circle cx="16" cy="13" r="8.5" fill="var(--hbx-link)"/><circle cx="16" cy="13" r="5.6" fill="none" stroke="var(--hbx-night)" stroke-width="1.3"/>""",
    # Wide-Spread Chaos's seed ball, dropped in the grass: the ball is
    # --wsc-dim, 5.97 on the sky, flecked with seed in --wsc-label, and the
    # grass line is --wsc-ink, 7.81, both over the body threshold a marker
    # is held to.
    "wsc-seed": """<path d="M3 29 H29" stroke="var(--wsc-ink)" stroke-width="1.6" stroke-linecap="round"/><circle cx="16" cy="18" r="9" fill="var(--wsc-dim)"/><circle cx="12.5" cy="15" r="1.3" fill="var(--wsc-label)"/><circle cx="18" cy="13.5" r="1.1" fill="var(--wsc-label)"/><circle cx="19.5" cy="20" r="1.4" fill="var(--wsc-label)"/><circle cx="13.5" cy="21.5" r="1" fill="var(--wsc-label)"/><path d="M22 10 l4 -4 M24 12 l5 -2" stroke="var(--wsc-ink)" stroke-width="1.3" stroke-linecap="round"/>""",
    "stair-lift": """<path d="M3 29 H29" stroke="var(--cmi-ink)" stroke-width="1.6" stroke-linecap="round"/><rect x="9" y="6" width="14" height="19" rx="3" fill="var(--cmi-dado)"/><circle cx="16" cy="13" r="3.6" fill="var(--cmi-nosing)"/><path d="M13 20 H19" stroke="var(--cmi-nosing)" stroke-width="1.6" stroke-linecap="round"/>""",
    "fridge-magnet": """<path d="M3 29 H29" stroke="var(--fos-ink)" stroke-width="1.6" stroke-linecap="round"/><rect x="6" y="15" width="20" height="10" fill="var(--fos-tile)" stroke="var(--fos-ink)" stroke-width="1.6"/><path d="M10 20 H15 M17 20 H22" stroke="var(--fos-ink)" stroke-width="1.6" stroke-linecap="round"/><path d="M8 26 H27" stroke="var(--fos-edge)" stroke-width="1.4" stroke-linecap="round"/>""",
    "pando-leaf": """<path d="M3 29 H29" stroke="var(--pdo-dim)" stroke-width="1.6" stroke-linecap="round"/><path d="M16 5 Q25 9 25 17 Q25 24 16 25 Q7 24 7 17 Q7 9 16 5 Z" fill="var(--pdo-gold)"/><path d="M16 7.5 V23" stroke="var(--pdo-shade)" stroke-width="1.3" stroke-linecap="round"/><path d="M16 25 L17 28.5" stroke="var(--pdo-gold)" stroke-width="2" stroke-linecap="round"/>""",
    "mud-welly": """<path d="M3 29 H29" stroke="var(--mud-dim)" stroke-width="1.6" stroke-linecap="round"/><path d="M5 24 V13 Q5 10 8 10 H17 Q19 10 19 13 V17 H25 Q28 17 28 21 V24 Z" fill="var(--mud-welly)" stroke="var(--mud-welly)" stroke-width="1.4" stroke-linejoin="round"/><path d="M4.5 26 H28.5" stroke="var(--mud-dim)" stroke-width="2.4" stroke-linecap="round"/><path d="M8 13.5 H16" stroke="var(--mud-ground)" stroke-width="1.4" stroke-linecap="round"/>""",
    # A folded note, left on a chair in Executive Session: a sheet folded in
    # half with a line of writing showing, in the green the room reads its
    # links in, on the dark room. The floor line is --es-frame and carries nothing.
    "es-note": """<path d="M3 29.5 H29" stroke="var(--es-frame)" stroke-width="1.6" stroke-linecap="round"/><path d="M7 26 L10 15 H25 L22 26 Z" fill="none" stroke="var(--es-link)" stroke-width="2.2" stroke-linejoin="round"/><path d="M11.5 19 H21 M10.5 22.5 H18" stroke="var(--es-link)" stroke-width="1.6" stroke-linecap="round"/>""",
    # A spare fuse, left in the Moderators' room: a glass body with its two
    # metal caps and the wire inside, in the mint the room reads its links in,
    # on the dark room. The floor line is --md-frame and carries nothing.
    "md-fuse": """<path d="M3 29.5 H29" stroke="var(--md-frame)" stroke-width="1.6" stroke-linecap="round"/><rect x="9" y="19" width="14" height="7" rx="1.5" fill="none" stroke="var(--md-link)" stroke-width="2"/><path d="M5 22.5 H9 M23 22.5 H27 M9 22.5 C12 20 14 25 16 22.5 C18 20 20 25 23 22.5" fill="none" stroke="var(--md-link)" stroke-width="1.6" stroke-linecap="round"/>""",
    # A pencil, rolled off the Board's table: a long body, its sharpened end
    # and a ferrule, in the peach the room reads its links in, on the dark
    # room. The floor line is --bd-edge and carries nothing.
    "bd-lamp": """<path d="M3 29.5 H29" stroke="var(--bd-edge)" stroke-width="1.6" stroke-linecap="round"/><path d="M5 25 H23 L28 22.5 L23 20 H5 Z" fill="none" stroke="var(--bd-link)" stroke-width="2.2" stroke-linejoin="round"/><path d="M9 20 V25" stroke="var(--bd-link)" stroke-width="1.8"/>""",
    # A key, left on the floor inside the Directors' door: a ring and a
    # blade with its teeth, in the pale blue the room reads its links in, on
    # the dark room. The floor line is --dr-frame and carries nothing.
    "dr-key": """<path d="M3 29.5 H29" stroke="var(--dr-frame)" stroke-width="1.6" stroke-linecap="round"/><circle cx="9" cy="21" r="5" fill="none" stroke="var(--dr-link)" stroke-width="2.2"/><path d="M14 21 H28 M24 21 V25 M20 21 V24" stroke="var(--dr-link)" stroke-width="2.2" stroke-linecap="round"/>""",
    # A flake of fish food, fallen on the Fishbowl's sill: a small curled
    # flake in the goldfish's orange the room reads its links in, dark on the
    # pale water. The sill line is --fb-glass and carries nothing.
    "fb-flake": """<path d="M3 29.5 H29" stroke="var(--fb-glass)" stroke-width="1.6" stroke-linecap="round"/><path d="M8 24 C9 16 16 12 24 13 C22 20 16 25 8 24 Z" fill="none" stroke="var(--fb-link)" stroke-width="2.2" stroke-linejoin="round"/><path d="M11 21 C14 18 18 16 21 16" stroke="var(--fb-link)" stroke-width="1.6" stroke-linecap="round"/>""",
    # A gavel, left on the floor of the Town Hall's rotunda: a head and a
    # handle, in the warm gold the room uses for every link, on the hall's
    # shade. The floor line is --th-granite and carries nothing.
    "th-gavel": """<path d="M3 29.5 H29" stroke="var(--th-granite)" stroke-width="1.6" stroke-linecap="round"/><path d="M6 27 L18 15" stroke="var(--th-link)" stroke-width="2.6" stroke-linecap="round"/><path d="M13.5 8.5 L20.5 1.5 L28.5 9.5 L21.5 16.5 Z" fill="none" stroke="var(--th-link)" stroke-width="2.2" stroke-linejoin="round"/><path d="M17 12 L25 4" stroke="var(--th-link)" stroke-width="1.6"/>""",
    # A mitten, dropped on the ice in the Cave: a thumb and a cuff, in the pale
    # aqua the room uses for every link, 8.24 on the deep ice. The floor line
    # is --cv-seam and carries nothing.
    # NeuroHome, Isha Snow's room: a jar of honey off the stump by her bee yard,
    # in her honey ink on her meadow floor. The floor line is --nh-soft.
    "nh-honey": """<path d="M3 29.5 H29" stroke="var(--nh-soft)" stroke-width="1.6" stroke-linecap="round"/><rect x="11" y="6" width="10" height="4" rx="1" fill="none" stroke="var(--nh-honey)" stroke-width="2"/><path d="M10.5 10 H21.5 Q24 12 24 16 V24 Q24 26.5 21.5 26.5 H10.5 Q8 26.5 8 24 V16 Q8 12 10.5 10 Z" fill="none" stroke="var(--nh-honey)" stroke-width="2.2" stroke-linejoin="round"/><path d="M8.5 16 H23.5 M13 16 V19.5 Q13 21 14.2 21 Q15.4 21 15.4 19.5 V16" fill="none" stroke="var(--nh-honey)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>""",
    # Words, Bud, Beats, Kristina Brooke's room: a carrot rolled off the shopping
    # list on her fifth record, lying on her floor. The carrot is --wbb-link, 9.27 on
    # her ground, its leaves --wbb-succ, 6.65, both over the body threshold a marker
    # is held to. The floor line is --wbb-rail and carries nothing.
    "wbb-carrot": """<path d="M3 29.5 H29" stroke="var(--wbb-rail)" stroke-width="1.6" stroke-linecap="round"/><path d="M21.5 13.5 Q24 16 22.5 18.5 L8 27 Q6 27.8 5.6 26.4 L14.5 12.4 Q17.5 10.6 21.5 13.5 Z" fill="var(--wbb-link)"/><path d="M12 19.5 L14.6 21 M15 15.5 L17.4 17.2 M9.4 23.8 L11.2 24.8" stroke="var(--wbb-ground)" stroke-width="1.3" stroke-linecap="round"/><path d="M20 12.6 Q20 6.5 17 3.8 M21.4 13.2 Q24.6 8 28.6 7 M22.4 14.6 Q27.4 13.4 29 16" fill="none" stroke="var(--wbb-succ)" stroke-width="2" stroke-linecap="round"/>""",
    # The Sandbox: a plastic picnic fork somebody left in the sand, lying across
    # the floor, in the room's own screen --sb-glow, 10.76 on its dusk, the same
    # ink its links are in. The floor line is --sb-sanddeep and carries
    # nothing. The job is what your own copy of the street is called. It lies still.
    "sb-fork": """<path d="M3 29.5 H29" stroke="var(--sb-sanddeep)" stroke-width="1.6" stroke-linecap="round"/><path d="M5 27 L16.5 15.5" stroke="var(--sb-glow)" stroke-width="2.8" stroke-linecap="round"/><path d="M15.6 14.6 L18.4 9.4 L22.6 13.6 L17.4 16.4 Z" fill="var(--sb-glow)" stroke="var(--sb-glow)" stroke-width="1" stroke-linejoin="round"/><path d="M18.9 9.9 L23.2 5.7 M20 11 L24.2 6.7 M21 12 L25.3 7.8 M22.1 13.1 L26.3 8.9" stroke="var(--sb-glow)" stroke-width="1.2" stroke-linecap="round"/>""",
    "cv-icicle": """<path d="M3 29.5 H29" stroke="var(--cv-seam)" stroke-width="1.6" stroke-linecap="round"/><path d="M10 26 V12 Q10 6 16 6 Q22 6 22 12 V26 Z" fill="none" stroke="var(--cv-link)" stroke-width="2.2" stroke-linejoin="round"/><path d="M10 16 Q5 15 5.5 19.5 Q6 23 10 22" fill="none" stroke="var(--cv-link)" stroke-width="2.2" stroke-linecap="round"/><path d="M9 22.5 H23" stroke="var(--cv-link)" stroke-width="3" stroke-linecap="round"/>""",
    # A toasting stick, left leaning against a log at the Campfire: a green
    # stick with its forked end, in the fire's orange the room uses for every
    # link, 9.26 on the night. The log and the floor line are --cf-bark and
    # carry nothing.
    "cf-marshmallow": """<path d="M3 29.5 H29" stroke="var(--cf-bark)" stroke-width="1.6" stroke-linecap="round"/><rect x="4" y="22" width="24" height="6" rx="3" fill="var(--cf-bark)"/><path d="M8 22 L23 6" stroke="var(--cf-fire)" stroke-width="2.4" stroke-linecap="round"/><path d="M23 6 L26 3.5 M23 6 L25.5 8.5" stroke="var(--cf-fire)" stroke-width="1.8" stroke-linecap="round"/><path d="M13 17 l3 2" stroke="var(--cf-fire)" stroke-width="1.6" stroke-linecap="round"/>""",
    # An ostrich feather, blown up against a stone at the Watering Hole: a quill
    # with its soft vanes, in the water's teal the room uses for every link,
    # 6.68 on the sand. The stone and the floor line are --wh-dune and carry
    # nothing.
    "wh-feather": """<path d="M3 29.5 H29" stroke="var(--wh-dune)" stroke-width="1.6" stroke-linecap="round"/><ellipse cx="23" cy="26" rx="5" ry="3.2" fill="var(--wh-dune)"/><path d="M6 26 Q13 16 24 5" fill="none" stroke="var(--wh-water)" stroke-width="2" stroke-linecap="round"/><path d="M10 21 q-2 -6 3 -9 M13 17 q0 -6 5 -8 M16 13 q1 -5 6 -6 M12 22 q5 1 8 -3 M15 18 q5 1 8 -3 M18 14 q4 0 6 -4" fill="none" stroke="var(--wh-water)" stroke-width="1.6" stroke-linecap="round"/>""",
    # A loupe, left lying on the Editorial Room's proofs: a ring of glass on a
    # short handle, in the cyan the room uses for every link in the studio,
    # 9.35 on the dark. The floor line is --ed-halo and carries nothing.
    "ed-loupe": """<path d="M3 29.5 H29" stroke="var(--ed-halo)" stroke-width="1.6" stroke-linecap="round"/><circle cx="13.5" cy="13.5" r="8" fill="none" stroke="var(--ed-cyan)" stroke-width="2.4"/><circle cx="13.5" cy="13.5" r="4.5" fill="none" stroke="var(--ed-cyan)" stroke-width="1.2" opacity=".6"/><path d="M19.3 19.3 L25.5 25.5" stroke="var(--ed-cyan)" stroke-width="3.2" stroke-linecap="round"/>""",
    # A brass valve tag, fallen off a valve onto the Operations Room's floor:
    # a small plate with its hole and its number stamped in, in the brass the
    # room uses for its tags, 6.18 on the concrete. The floor line is
    # --op-steel and carries nothing.
    "op-tag": """<path d="M3 29.5 H29" stroke="var(--op-steel)" stroke-width="1.6" stroke-linecap="round"/><rect x="6" y="10" width="20" height="13" rx="2.5" fill="none" stroke="var(--op-brass)" stroke-width="2.2"/><circle cx="10.5" cy="16.5" r="1.8" fill="none" stroke="var(--op-brass)" stroke-width="1.6"/><path d="M15 14 H22 M15 19 H20" stroke="var(--op-brass)" stroke-width="1.8" stroke-linecap="round"/><path d="M10.5 10 Q9 5 13 4" fill="none" stroke="var(--op-brass)" stroke-width="1.4" stroke-linecap="round"/>""",
    # A spare lamp mantle, left by the Events Room's chart table: the mesh a
    # lighthouse's paraffin lamp glowed through, and its collar, in the brass
    # the room uses for every link on the wall, 8.9 on the stone. The floor
    # line is --wr-rail and carries nothing.
    "wr-mantle": """<path d="M3 29.5 H29" stroke="var(--wr-rail)" stroke-width="1.6" stroke-linecap="round"/><path d="M16 4.5 C22 8.5 23 15.5 21 20.5 L11 20.5 C9 15.5 10 8.5 16 4.5 Z" fill="none" stroke="var(--wr-brass)" stroke-width="2.2" stroke-linejoin="round"/><path d="M12.5 12.5 H19.5 M11.5 16.5 H20.5" stroke="var(--wr-brass)" stroke-width="1.3" opacity=".75"/><path d="M12 23.5 H20 M13 26.5 H19" stroke="var(--wr-brass)" stroke-width="2.2" stroke-linecap="round"/>""",
    "cool-cap": """<path d="M3 29 H29" stroke="var(--cool-cabinet)" stroke-width="1.8" stroke-linecap="round"/><circle cx="16" cy="17" r="8.2" fill="none" stroke="var(--cool-mint)" stroke-width="2.2"/><circle cx="16" cy="17" r="4.4" fill="none" stroke="var(--cool-mint)" stroke-width="1.4" opacity=".7"/><path d="M16 5.6 V7.4 M16 26.6 V28.4 M4.6 17 H6.4 M25.6 17 H27.4 M7.9 8.9 L9.2 10.2 M22.8 23.8 L24.1 25.1 M7.9 25.1 L9.2 23.8 M22.8 10.2 L24.1 8.9" stroke="var(--cool-mint)" stroke-width="1.8" stroke-linecap="round"/>""",
    "lagoon-speaker": """<path d="M11 7 q0 -4 5 -4 q5 0 5 4" fill="none" stroke="var(--lag-acid)" stroke-width="2"/><rect x="8" y="7" width="16" height="21" rx="3" fill="none" stroke="var(--lag-acid)" stroke-width="2.4"/><path d="M12 13 H20 M12 17 H20 M12 21 H20" stroke="var(--lag-acid)" stroke-width="1.8" stroke-linecap="round"/>""",
    "foundry-sort": """<path d="M5 11 H25 V22 H5 Z" fill="none" stroke="var(--fo-brass)" stroke-width="2.2" stroke-linejoin="round"/><path d="M12 22 a3.2 3.2 0 0 1 6.4 0" fill="none" stroke="var(--fo-brass)" stroke-width="2"/><path d="M27 12 V21" stroke="var(--fo-brass)" stroke-width="2.6" stroke-linecap="round"/><path d="M25 14 H27 M25 19 H27" stroke="var(--fo-brass)" stroke-width="1.8"/>""",
    "checkpoint-pillow": """<path d="M5 21 q-2 -9 6 -10 q10 -2 16 1 q6 2 4 9 q-2 4 -11 4 q-11 1 -15 -4 Z" fill="none" stroke="var(--hc-steam)" stroke-width="2.2" stroke-linejoin="round"/><path d="M12 15 q4 3 8 0" fill="none" stroke="var(--hc-steam)" stroke-width="1.8" stroke-linecap="round"/>""",
    # A spare pin stuck upright in the cutting mat beside the model, its head and
    # its shank both --mm-face, 7.10 on the mat, over the body threshold a marker
    # is held to. The line it stands on is --mm-rule, the mat's own printed grid,
    # and carries nothing.
    "map-pin": """<path d="M3 29 H29" stroke="var(--mm-rule)" stroke-width="1.6" stroke-linecap="round"/><path d="M16 13 V27" stroke="var(--mm-face)" stroke-width="2.4" stroke-linecap="round"/><circle cx="16" cy="9" r="5.6" fill="var(--mm-face)"/><path d="M12 29 H20" stroke="var(--mm-face)" stroke-width="1.6" stroke-linecap="round"/>""",
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
    # A ribbon bookmark trailing out of a shut book, in the room's brass on its
    # claret wall: 8.88, over the body threshold a marker is held to.
    # A moth asleep on the phonograph's horn in the Music Room: two wings and a
    # body in --rdr-brass, 7.53 on the claret, over the body threshold a marker is
    # held to, with the feelers in the same brass. It sleeps still.
    "music-moth": """<path d="M16 9 C12 3 4 5 3 12 C2 18 9 21 15 17 Z" fill="var(--rdr-brass)"/><path d="M16 9 C20 3 28 5 29 12 C30 18 23 21 17 17 Z" fill="var(--rdr-brass)"/><path d="M15 17 C10 19 7 25 10 28 C13 29 15 24 16 20 Z M17 17 C22 19 25 25 22 28 C19 29 17 24 16 20 Z" fill="var(--rdr-brass)" opacity=".75"/><rect x="14.6" y="8" width="2.8" height="16" rx="1.4" fill="var(--rdr-brass)"/><path d="M15 8 Q12 3 9 2 M17 8 Q20 3 23 2" fill="none" stroke="var(--rdr-brass)" stroke-width="1.2" stroke-linecap="round"/>""",
    # A ticket stub dropped under a seat in the Cinema: a torn admit-one ticket
    # with its perforated edge and a star, in --rdr-brass on the claret, 7.53,
    # over the body threshold a marker is held to. It lies still.
    "cinema-ticket": """<path d="M5 10 H25 V14 a2 2 0 0 0 0 4 V22 H5 V18 a2 2 0 0 0 0 -4 Z" fill="none" stroke="var(--rdr-brass)" stroke-width="2.2" stroke-linejoin="round"/><path d="M19 10.5 V21.5" stroke="var(--rdr-brass)" stroke-width="1.6" stroke-dasharray="1.6 1.6"/><path d="M11.5 12.6 L12.5 15 L15 15.2 L13.1 16.8 L13.7 19.3 L11.5 18 L9.3 19.3 L9.9 16.8 L8 15.2 L10.5 15 Z" fill="var(--rdr-brass)"/>""",
    "reading-bookmark": """<path d="M8 6 H24 V26 H8 Z" fill="none" stroke="var(--rdr-brass)" stroke-width="2.2" stroke-linejoin="round"/><path d="M8 6 V26 M12 6 V26" stroke="var(--rdr-brass)" stroke-width="1.4"/><path d="M17 4 V21 L20 18 L23 21 V4 Z" fill="var(--rdr-brass)"/>""",
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


# ── Badges ───────────────────────────────────────────────────────────────────
# A BADGE IS A SET OF THINGS DONE THAT GO TOGETHER, AND MOSTLY THEY ARE JOBS. Ryan's call, 2026-10-14, after
# people asked for badges like Scouting America's merit badges, Open Badges and
# video game achievements, and he did not want to gamify or credentialise too
# much. It reverses one word of this file: `badges?` and `achievements?` used
# to be on SCORE_NOUNS for the board as a whole. They still are for a JOB's
# own words -- a job does not mention badges -- and a badge's words are swept
# for everything else below.
#
# What keeps a badge from becoming the score this board refuses:
#
#   · IT IS WORKED OUT, NEVER KEPT. quest.js and the radio work out which
#     badges somebody has from the jobs they have handed in, every time. No
#     record anywhere holds a badge, so there is nothing to count, rank or
#     lose except the jobs themselves.
#   · NOTHING COUNTS THEM. No number of badges, no number of a badge's jobs
#     done, no bar that fills. A badge lists its jobs and marks the done ones
#     the way the board does, with a stamp on each.
#   · NONE IS RARE, SECRET OR WORTH MORE. Every badge's jobs are printed on the
#     board, and the board never says how many people have one.
#   · IT CERTIFIES NOTHING. Every code is printed in its room and every
#     question gives its answer away, so a badge says where somebody walked.
#     That is the whole difference from an Open Badge, which is a credential.
#   · ITS LIST NEVER GROWS. A badge somebody already has would stop being
#     theirs, which is a badge expiring. Checked below against the committed
#     data file, so a new room goes into a new badge or into none.
#   · NO BADGE SENDS ANYBODY TO A ROOM FOR RESTING IN. Rest on this street is
#     owed rather than earned (the Healing Checkpoint's whole argument), and a
#     badge is earned. These are the rooms whose own words say they are for
#     resting in, or for having had enough.
REST = {
    "healing-checkpoint.html": "rest is owed, not earned, and nothing up there is written down",
    "dead-tired-society.html": "peer support for the burnt out, where nothing is homework",
    "latibulum.html": "a burrow for when you have had enough of being findable",
    "stay-frosty.html": "a quiet place to chill that is not for anything",
    "cooldown-room.html": "a room for resting in, behind the hangar",
}

# The words a badge may not use about itself, with the negation window, so the
# house rules can still say a badge is none of these. Ranking and rarity, the
# words achievements are sold with, and the words of a credential.
BADGE_NOUNS = (r"(?:scores?|scored|points?|xp\b|gamerscore|leaderboards?|streaks?|ranks?|ranked|"
               r"ranking|levels?(?:\s+up)?|tiers?|rare|rarest|rarity|legendary|epic|unlock(?:s|ed)?|"
               r"percent(?:age)?s?|progress|completion|complete(?:d|ist)?|"
               r"certif(?:y|ies|ied|icate)|credentials?|qualif(?:y|ies|ied|ication)|accredit\w*|"
               r"proficien\w*|mastery|master|expert|skills?|earned|deserve[sd]?)")
BADGE_WORD = re.compile(rf"\b{BADGE_NOUNS}\b", re.I)
BADGE_OK = re.compile(rf"\b{NEGATION}\b[^.]{{0,48}}?\b{BADGE_NOUNS}\b", re.I)

# TWO BADGES ARE NOT JOBS (Ryan, later on 2026-10-14): Rescue Ranger, for
# rescuing any animal, and Pet Parent, for adopting one. Each is worked out
# from something that already exists and adds no record of its own:
#
#   · `rescues` is love-rescues, in the rescuer's own browser. NOTHING ON THE
#     STREET KNOWS WHO RESCUED AN ANIMAL -- the shelters promise it and
#     make-rescue.py holds it -- so this badge is shown on the board and in the
#     rescuer's own Profile and NOWHERE ELSE. The friendly edit is to put it on
#     the public profile, which needs the server to keep who rescued what: a
#     reversal of a privacy promise, and Ryan's call, not a badge's.
#   · `pets` is the pets in a Profile. The board learns it from the one /cb/jobs
#     read it already makes while signed on, as yes or no; somebody else's
#     profile shows it only when their pets are shown.
#
# Neither lists jobs, and the shelters' own pages never mention a badge.
FROM = {
    "rescues": ('Rescue any animal at <a href="rescue-a-cat.html">Rescue A Cat</a>, '
                '<a href="rescue-a-dog.html">Rescue A Dog</a> or <a href="rescue-small-animals.html">Rescue Small '
                'Animals</a>. Nothing on the street knows who rescued which animal, so only your own browser knows '
                'you did: this badge is shown here and in your own Profile on the CB, and nowhere else.'),
    "pets": ('Adopt any animal from <a href="rescue-a-cat.html">Rescue A Cat</a>, <a href="rescue-a-dog.html">Rescue '
             'A Dog</a> or <a href="rescue-small-animals.html">Rescue Small Animals</a>, signed on to the CB. It is '
             'worked out from the pets in your Profile, so this board can only tell while you are signed on, and '
             'other people see it only if you show your pets.'),
}

# One drawing per badge, in a 32-unit square, made of PATHS AND NOTHING ELSE:
# ("s", d) is stroked and ("f", d) is filled, in whatever colour it is drawn in.
# Paths only so the radio can draw the same badge from guild-jobs.json with
# createElementNS and one attribute, and never from markup. No two alike, which
# is the markers' rule arriving at the badges.
BADGE_DRAW = {
    # A single pebble: one is plenty.
    "one-is-plenty": [("f", "M7 19 C7 13 12 10 17 10 C23 10 26 14 25 19 C24 24 19 25 15 25 C10 25 7 23 7 19 Z")],
    # A lift car with the arrow pointing down.
    "down-the-lift": [("s", "M8 4 H24 V28 H8 Z"), ("s", "M16 9 V22 M11 17 L16 22 L21 17")],
    # A spruce at the treeline.
    "past-the-treeline": [("s", "M16 3 L9 13 H13 L7 22 H25 L19 13 H23 Z"), ("s", "M16 22 V29")],
    # The road out, its centre line going away.
    "the-far-end": [("s", "M5 29 L13 3 M27 29 L19 3"), ("s", "M16 26 V22 M16 17 V14 M16 10 V8")],
    # A stile: two posts, two rails and a step.
    "over-the-stile": [("s", "M9 28 V5 M23 28 V5 M9 11 H23 M9 18 H23"), ("s", "M3 23 H13")],
    # A hall with a pediment and its columns.
    "open-hall": [("s", "M4 12 L16 4 L28 12 Z"), ("s", "M7 12 V25 M12.5 12 V25 M19.5 12 V25 M25 12 V25 M3 28 H29")],
    # A shut door with its panels and its knob.
    "shut-not-locked": [("s", "M8 3 H24 V29 H8 Z M12 7 H20 V14 H12 Z M12 18 H20 V25 H12 Z"), ("f", "M20.5 16 H23 V18.5 H20.5 Z")],
    # A book open on its spine.
    "borrowers-ticket": [("s", "M3 8 C8 6 12 6 16 9 C20 6 24 6 29 8 V25 C24 23 20 23 16 26 C12 23 8 23 3 25 Z M16 9 V26")],
    # A paw: one pad and four toes.
    "shelter-rounds": [("f", "M16 17 C11 17 9 21 9 23 C9 26 12 27 16 27 C20 27 23 26 23 23 C23 21 21 17 16 17 Z"),
                       ("f", "M6 13 C6 11 7.5 10 8.5 10 C9.5 10 11 11 11 13 C11 15 9.5 16 8.5 16 C7.5 16 6 15 6 13 Z"),
                       ("f", "M11 7 C11 5 12.5 4 13.5 4 C14.5 4 16 5 16 7 C16 9 14.5 10 13.5 10 C12.5 10 11 9 11 7 Z"),
                       ("f", "M16 7 C16 5 17.5 4 18.5 4 C19.5 4 21 5 21 7 C21 9 19.5 10 18.5 10 C17.5 10 16 9 16 7 Z"),
                       ("f", "M21 13 C21 11 22.5 10 23.5 10 C24.5 10 26 11 26 13 C26 15 24.5 16 23.5 16 C22.5 16 21 15 21 13 Z")],
    # A field gate between its posts.
    "through-the-gates": [("s", "M4 28 V7 M28 28 V7"), ("s", "M4 11 H28 M4 24 H28 M10 11 V24 M16 11 V24 M22 11 V24 M4 24 L28 11")],
    # A sheet with its corner folded and its lines.
    "paper-trail": [("s", "M7 3 H20 L25 8 V29 H7 Z M20 3 V8 H25"), ("s", "M11 13 H21 M11 18 H21 M11 23 H17")],
    # A record with its label and the arm coming in.
    "needle-drop": [("s", "M3 17 A12 12 0 1 0 27 17 A12 12 0 1 0 3 17 Z"), ("f", "M12 17 A3 3 0 1 0 18 17 A3 3 0 1 0 12 17 Z"),
                    ("s", "M29 2 V9 L21 15")],
    # A chair from the side.
    "pull-up-a-chair": [("s", "M10 3 V29 M10 17 H23 V29 M10 17 H23")],
    # A joystick on its base.
    "free-play": [("s", "M6 22 H26 V28 H6 Z M16 22 V12"), ("f", "M12 9 A4 4 0 1 0 20 9 A4 4 0 1 0 12 9 Z")],
    # A carrier with its handle and its barred door.
    "rescue-ranger": [("s", "M4 11 H28 V27 H4 Z M11 11 V6 H21 V11"), ("s", "M10 15 V23 M14 15 V23 M18 15 V23 M22 15 V23")],
    # A house with a heart in it.
    "pet-parent": [("s", "M4 15 L16 5 L28 15 M8 12 V28 H24 V12"),
                   ("f", "M16 25 C12 22 10 20 10 17.5 C10 15.5 11.5 14 13.3 14 C14.6 14 15.5 14.8 16 15.7 "
                         "C16.5 14.8 17.4 14 18.7 14 C20.5 14 22 15.5 22 17.5 C22 20 20 22 16 25 Z")],
}
PATH_D = re.compile(r"[MmLlHhVvCcSsQqTtAaZz0-9 .,\-]+")


def badge_svg(bid, cls="badge__draw"):
    parts = []
    for mode, d in BADGE_DRAW[bid]:
        if mode == "f":
            parts.append(f'<path d="{d}" fill="currentColor"/>')
        else:
            parts.append(f'<path d="{d}" fill="none" stroke="currentColor" stroke-width="2.2" '
                         f'stroke-linecap="square" stroke-linejoin="miter"/>')
    return (f'<svg class="{cls}" viewBox="0 0 32 32" aria-hidden="true" focusable="false">'
            + "".join(parts) + "</svg>")


def committed_badges():
    """The badges as the last commit had them, or None where there is no git to
    ask. A badge posted there may lose a job (a room taken down) and never gain
    one."""
    import subprocess
    try:
        out = subprocess.run(["git", "show", "HEAD:data/quests.json"], cwd=ROOT,
                             capture_output=True, text=True, timeout=20)
    except (OSError, subprocess.SubprocessError):
        return None
    if out.returncode != 0:
        return None
    try:
        return {b["id"]: b for b in json.loads(out.stdout).get("badges", [])}
    except (ValueError, KeyError, TypeError):
        return None


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

# The badges.
badges = raw.get("badges", [])
by_id = {q["id"]: q for q in quests}
seen_badge, seen_set, seen_draw = set(), {}, {}
for b in badges:
    bid = b.get("id", "?")
    where = f"badge {bid!r}"
    if not re.fullmatch(r"[a-z0-9-]+", str(bid)) or bid in seen_badge:
        problems.append(f"{where}: id is not a marker-safe name, or is used twice.")
    seen_badge.add(bid)
    for field in ("name", "for"):
        if not str(b.get(field, "")).strip():
            problems.append(f"{where}: no `{field}`. A badge says what its jobs have in common.")
    if b.get("needs") not in ("all", "any"):
        problems.append(f"{where}: needs {b.get('needs')!r}, which is neither all nor any.")
    jobs = b.get("jobs", [])
    if b.get("from", "jobs") not in ("jobs", *FROM):
        problems.append(f"{where}: from {b.get('from')!r}, which is not jobs, {' or '.join(FROM)}.")
    elif b.get("from", "jobs") != "jobs" and (jobs or b.get("needs") != "any"):
        problems.append(f"{where}: a badge from {b['from']} is any one of them, and lists no jobs.")
    if len(set(jobs)) != len(jobs):
        problems.append(f"{where}: a job listed twice.")
    for j in jobs:
        if j not in by_id:
            problems.append(f"{where}: {j!r} is not a job on the board.")
        elif by_id[j]["page"] in REST:
            problems.append(
                f"{where}: {j!r} is in {by_id[j]['page']}, which is {REST[by_id[j]['page']]}. Rest on this "
                "street is owed rather than earned, and a badge is earned, so no badge sends anybody there.")
    if b.get("needs") == "all" and len(jobs) < 2:
        problems.append(f"{where}: a badge for every one of fewer than two jobs is a job, not a badge.")
    key = (b.get("from", "jobs"), b.get("needs"), tuple(sorted(jobs)))
    if key in seen_set:
        problems.append(f"{where}: the same jobs as {seen_set[key]!r}.")
    seen_set[key] = bid
    if bid not in BADGE_DRAW:
        problems.append(f"{where}: no drawing in BADGE_DRAW. No two badges look alike.")
    else:
        for mode, d in BADGE_DRAW[bid]:
            if mode not in ("s", "f") or not PATH_D.fullmatch(d):
                problems.append(f"{where}: its drawing is not paths alone, which is what lets the radio draw it.")
        sig = tuple(BADGE_DRAW[bid])
        if sig in seen_draw:
            problems.append(f"{where}: draws exactly what {seen_draw[sig]!r} draws.")
        seen_draw[sig] = bid
    # Numbers, and the words of a score, a rarity or a credential.
    for field in ("name", "for"):
        text = str(b.get(field, ""))
        if re.search(r"\d", text):
            problems.append(f"{where}: {field} has a number in it. Nothing about a badge is counted.")
        for m in BADGE_WORD.finditer(text):
            window = text[max(0, m.start() - 56):m.end()]
            if not BADGE_OK.search(window):
                problems.append(
                    f"{where}: {field} says {m.group(0)!r}. A badge is jobs that go together: it is not "
                    "ranked, rare, unlocked or counted, and it certifies nothing.")
for bid in set(BADGE_DRAW) - seen_badge:
    problems.append(f"BADGE_DRAW has a drawing for {bid!r}, which is no badge. A stale entry is how two lists drift.")

# A BADGE NEVER ASKS FOR MORE THAN IT DID WHEN IT WAS POSTED. Against the last
# commit. For `all`, a job taken out is allowed (a room taken down only makes it
# easier to have) and a job added is refused; for `any`, the other way round,
# because there every job listed is a way to have it. Either way the refusal is
# the same: somebody who had the badge would stop having it, which is a badge
# expiring, and nothing on this board expires.
def asks_more(old, new):
    if old.get("from", "jobs") != new.get("from", "jobs"):
        return True                       # asks for something else altogether
    o, n = set(old.get("jobs", [])), set(new.get("jobs", []))
    if old.get("needs") == "all":
        return new.get("needs") == "all" and bool(n - o)
    if new.get("needs") != "any":
        return True                       # any one of them -> every one of them
    if not o:
        return bool(n)                    # any job on the board -> only some
    return bool(n) and bool(o - n)        # a way to have it taken away


was = committed_badges()
if was is None:
    print("guild: no git to ask, so whether a posted badge asks for more was not checked this time.")
else:
    for b in badges:
        old = was.get(b.get("id"))
        if old and asks_more(old, b):
            problems.append(
                f"badge {b['id']!r} asks for more than it did when it was posted. Somebody who has it would "
                "stop having it, which is a badge expiring. Post a new badge instead.")

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
        # The id is the address a badge's list and the radio's Profile link to,
        # so a job is somewhere you can be sent rather than a row you scroll for.
        f'      <li class="job" data-quest="{q["id"]}" data-sum="{checksum(q["code"])}" id="job-{q["id"]}">',
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


def badge(b):
    """One badge on the board: its drawing, its name, what its jobs have in
    common, and the jobs. quest.js stamps it and marks the done ones; with
    scripts off it is a list of jobs that go together, which is all it is."""
    jobs = b.get("jobs", [])
    src = b.get("from", "jobs")
    out = [
        f'      <li class="badge" id="badge-{b["id"]}" data-badge="{b["id"]}" data-needs="{b["needs"]}" '
        f'data-jobs="{" ".join(jobs)}"' + (f' data-from="{src}"' if src != "jobs" else "") + '>',
        f'        {badge_svg(b["id"])}',
        f'        <div class="badge__words">',
        f'          <h3 class="badge__name">{e(b["name"])}</h3>',
        f'          <p class="badge__for">{e(b["for"])}</p>',
    ]
    if src != "jobs":
        out.append(f'          <p class="badge__how">{FROM[src]}</p>')
    elif not jobs:
        out.append(f'          <p class="badge__any">Any job on the board.</p>')
    else:
        out += [
            f'          <details class="badge__jobs">',
            f'            <summary>{"Any one of these jobs" if b["needs"] == "any" else "Its jobs"}</summary>',
            f'            <ul>',
        ]
        for j in jobs:
            q = by_id[j]
            out.append(
                f'              <li class="badge__job" data-quest="{j}"><a href="#job-{j}">{e(q["title"])}</a>'
                f' <span class="badge__room">&middot; {e(q["room"])}</span>'
                f'<b class="badge__tick" hidden>Done</b></li>')
        out += [f'            </ul>', f'          </details>']
    out += [
        f'        </div>',
        f'        <p class="badge__stamp" hidden>Yours</p>',
        f'      </li>',
    ]
    return "\n".join(out)


# In the order they were posted, like the jobs: sorted any other way they would
# start reading as a ladder.
swap(BOARD, "guild:badges", "\n".join(badge(b) for b in badges), "    ")

# WHAT THE RADIO NEEDS TO NAME A JOB AND DRAW A BADGE, and nothing else: no
# code and no checksum, so this file is no more of a spoiler sheet than the
# board is. cb.js fetches it when Profile or a profile opens, the way it fetches
# cb-rooms.json, and builds every drawing out of the paths with createElementNS.
GUILD_JSON = ROOT / "guild-jobs.json"
GUILD_JSON.write_text(json.dumps({
    "_": "Written by tools/make-guild.py out of data/quests.json, for the CB's Profile. Do not edit.",
    "jobs": [{"id": q["id"], "title": q["title"], "room": q["room"]} for q in quests],
    "badges": [{"id": b["id"], "name": b["name"], "for": b["for"], "needs": b["needs"], "jobs": b.get("jobs", []),
                "from": b.get("from", "jobs"),
                "draw": [list(p) for p in BADGE_DRAW[b["id"]]]} for b in badges],
}, ensure_ascii=False, indent=1) + "\n")

# THE SERVER KNOWS WHICH JOBS EXIST, so a Profile can only ever hold a job that
# is on the board. Written between markers in lib.mjs, the way make-bodymind.py
# writes the avatar lists; never hand-edit between them.
LIB = ROOT / "netlify" / "cb" / "lib.mjs"
lib = LIB.read_text()
QB, QE = "/* quest:ids:begin */", "/* quest:ids:end */"
if QB not in lib or QE not in lib:
    raise SystemExit(f"REFUSING: {LIB.name} has no quest:ids markers, so the CB cannot know which jobs exist.")
lib = re.sub(re.escape(QB) + r".*?" + re.escape(QE),
             lambda m: QB + "\nexport const QUEST_IDS = " + json.dumps([q["id"] for q in quests]) + ";\n" + QE,
             lib, flags=re.S)
LIB.write_text(lib)

# WHAT THE BOARD SENDS, AND WHAT THE SERVER KEEPS, read rather than trusted.
# quest.js runs in every room; only the board ever talks to the CB, and only to
# /cb/jobs, through one call(), with the pass the radio keeps in love-cb, which
# it reads and never writes. It keeps one thing of its own, love-quests. And
# the server keeps which jobs, sorted, and NOTHING ABOUT WHEN: a list of times
# would be a record of how somebody spends their days.
qjs = re.sub(r"/\*.*?\*/", " ", (ROOT / "quest.js").read_text(), flags=re.S)
qjs = re.sub(r"(?m)^\s*//.*$", " ", qjs)
for m in re.finditer(r"localStorage\.(setItem|getItem|removeItem)\(\s*([^,)]+)", qjs):
    kind, arg = m.group(1), m.group(2).strip()
    if arg not in ("KEY", "KEY + '-probe'", "PASS_KEY", "RESCUES_KEY"):
        problems.append(f"quest.js {kind}s {arg}. It keeps love-quests and reads love-cb and love-rescues, "
                        "and nothing else.")
    if arg in ("PASS_KEY", "RESCUES_KEY") and kind != "getItem":
        problems.append(f"quest.js writes {arg}. That is the radio's or the shelters', and the board only reads it.")
if "var PASS_KEY = 'love-cb';" not in qjs or "var KEY = 'love-quests';" not in qjs \
        or "var RESCUES_KEY = 'love-rescues';" not in qjs:
    problems.append("quest.js no longer names love-quests, love-cb and love-rescues as the things it touches.")
rd = re.search(r"function rescuedHere\(\) \{.*?\n  \}", qjs, re.S)
if qjs.count("RESCUES_KEY") != 2 or not rd or "RESCUES_KEY" not in rd.group(0) \
        or "return Array.isArray(v) && v.length > 0;" not in rd.group(0):
    problems.append("quest.js reads love-rescues somewhere other than rescuedHere(), or turns it into more than "
                    "yes or no. Nothing on the street knows who rescued, and the board does not start.")
# The radio reads love-rescues for your own Profile's Rescue Ranger and never
# writes it, and nothing about it goes into a request.
cbjs = re.sub(r"/\*.*?\*/", " ", (ROOT / "cb.js").read_text(), flags=re.S)
for m in re.finditer(r"localStorage\.(\w+)\(\s*'love-rescues'", cbjs):
    if m.group(1) != "getItem":
        problems.append("cb.js writes love-rescues. That is the shelters', and the radio only reads it.")
if "love-rescues" in cbjs and cbjs.count("'love-rescues'") != 1:
    problems.append("cb.js reads love-rescues in more than one place. One function reads it, for your own Profile.")
if re.search(r"sessionStorage|indexedDB|document\.cookie|sendBeacon|WebSocket|EventSource|XMLHttpRequest", qjs):
    problems.append("quest.js keeps or sends something some other way.")
if re.search(r"innerHTML|outerHTML|insertAdjacentHTML|document\.write", qjs):
    problems.append("quest.js writes markup from a string.")
if qjs.count("fetch(") != 1 or "fetch(JOBS," not in qjs or "var JOBS = '/cb/jobs';" not in qjs:
    problems.append("quest.js sends somewhere other than /cb/jobs, or not through its one call().")
kj = re.search(r"export async function keepJobs\(.*?\n\}", lib, re.S)
if not kj or "s.setJSON(key, { jobs: next }" not in kj.group(0) or re.search(r"\bnow\b|Date|\bt:", kj.group(0)):
    problems.append("lib.mjs: keepJobs keeps something other than which jobs. It keeps nothing about when.")
if "await forgetJobs(petKey(handle), s);" not in (re.search(r"export async function deleteAccount\(.*?\n\}", lib, re.S) or [""])[0]:
    problems.append("lib.mjs: deleting a username no longer deletes the jobs kept under it.")
if "forgetJobs(pk)" not in (ROOT / "netlify" / "functions" / "cb-pets.mjs").read_text():
    problems.append("cb-pets.mjs: Forget me no longer forgets the jobs kept in Profile.")
if problems:
    raise SystemExit("REFUSING:\n  " + "\n  ".join(problems))

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
    '    <p><b>The guild&rsquo;s badges</b> were asked for by people in our community, and they '
    'borrow from three places, each named on the board: the merit badges of '
    '<a href="https://www.scouting.org/skills/merit-badges/">Scouting America</a>, a patch for a list '
    'of requirements; <a href="https://openbadges.org/">Open Badges</a>, the format for digital badges '
    'that its own site calls verifiable and portable; and '
    '<a href="https://en.wikipedia.org/wiki/Achievement_(video_games)">video game achievements</a>, '
    'which Wikipedia dates, as a system across many games, to the Xbox 360&rsquo;s Gamerscore in 2005, '
    'and before that to the iron-on patches Activision posted in 1982 to players who photographed a high '
    'score. What the guild kept of each and what it left is on the board. The drawings are ours, and '
    'they are built by the same tool as the jobs.</p>',
    '    <p><b>The candle stub on the Faery Yurt&rsquo;s windowsill is ours, not Helen '
    'Edgar&rsquo;s.</b> That room is her design and this repository does not redecorate it; '
    'the only other design change we have made to it unasked is the one colour noted above. On '
    '2026-09-23 Helen gave a standing yes to maintenance that changes nothing you can see, '
    'and the first of it is the width and height on her two photographs, so the page no '
    'longer jumps while they load; anything that changes how her room looks is still hers '
    'to decide. The marker was '
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
