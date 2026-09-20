#!/usr/bin/env python3
"""Check every text/ground pair on the street against WCAG.

The zine table says in its own words that "clashing is not the same as illegible",
and Your Room makes 4.5:1 a condition of taking the keys. A claim like that has to
be checkable or it is decoration. This is the check.

Large text (>=24px, or >=18.66px bold) is held to 3:1 per WCAG 1.4.3; everything
else to 4.5:1. Each pair below names where it is used so a failure is findable.
"""
import sys

def lum(hexstr):
    h = hexstr.lstrip("#")
    c = [int(h[i:i+2], 16) / 255 for i in (0, 2, 4)]
    c = [x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c]
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]

def ratio(a, b):
    la, lb = lum(a), lum(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)

INK, INK2, INK3 = "#15121f", "#241d33", "#4a3f67"
CHALK, CREAM, PAPER = "#c8bfe0", "#FFF3E6", "#EDEAE2"
PINK, HOT, ORANGE, YELLOW = "#FF2D95", "#FF3D9A", "#FF8A00", "#FFE100"
GREEN, CYAN, VIOLET, RED = "#22E06A", "#00D4FF", "#AC5BFF", "#C4002B"
BLUE, VIOLET_DEEP = "#1770C2", "#7B28DD"

# (fg, bg, large?, where)
PAIRS = [
    (PINK,    INK,  True,  "street: tagline 'Queer without fear' 25px Archivo Black"),
    (ORANGE,  INK,  True,  "street: tagline 'Interdependent and here' 25px"),
    (GREEN,   INK,  True,  "street: tagline 'Divergent and proud' 21px bold display"),
    (CYAN,    INK,  True,  "street: tagline 'Living out loud' 27px"),
    (YELLOW,  INK,  False, "street: tagline 'Plucky pluralism' 16px Rock Salt"),
    (VIOLET,  INK,  True,  "street: tagline 'ribald songing' 30px VT323"),
    ("#ffffff", INK, True, "street: wordmark"),
    (CHALK,   INK2, False, "street: pavement + dial fine print"),
    (YELLOW,  INK2, False, "street: pavement links, dial label"),
    (CHALK,   INK,  False, "plain rooms: lede"),
    (YELLOW,  INK,  False, "plain rooms: links"),
    ("#ffffff", INK, False, "plain rooms: body copy"),
    (INK,     YELLOW, False, "marquee text; zine 'keeps' panel"),
    ("#2b0a1c", HOT, False, "pony: lede + door blurb on hot pink"),
    (CREAM,   HOT,  True,  "pony: h1 and h2 on hot pink"),
    (YELLOW,  "#2b0a1c", True, "pony: consent banner heading"),
    ("#ffd9ec", "#2b0a1c", False, "pony: consent banner body"),
    ("#2b0a1c", "#ffffff", False, "pony: track titles on the jukebox card"),
    ("#6b3a55", "#ffffff", False, "pony: track notes"),
    (INK,     PAPER, False, "zine: body copy on paper"),
    ("#2e2a22", PAPER, False, "zine: secondary copy on paper"),
    (RED,     PAPER, False, "zine: shout line + scrawl"),
    (PAPER,   INK,  False, "zine: pullquote body"),
    ("#b9b2a3", INK, False, "zine: pullquote citation"),
    (PAPER,   RED,  True,  "zine: ransom 'PHASE'"),
    (INK,     CYAN, True,  "zine: ransom 'A' (#1) and 'RAINBOWS' (#2)"),
    (CYAN,    "#05060f", True,  "quantum: h1"),
    ("#d8d4ff", "#05060f", False, "quantum: lede and body"),
    ("#a6a1d4", "#05060f", False, "quantum: citations"),
    ("#8c87bd", "#05060f", False, "quantum: footnote"),
    (GREEN,   "#05060f", False, "quantum: backlink + helen link"),
    (CYAN,    "#05060f", False, "quantum: reading titles in the audio room"),
    ("#05060f", GREEN, False, "quantum: sequence control while playing"),
    ("#8c87bd", "#05060f", False, "quantum: sequence control when nothing is recorded"),
    (PINK,    "#05060f", False, "quantum: terminal lines 22px"),
    (GREEN,   "#101014", True,  "enid: h1"),
    ("#ece8f5", "#101014", False, "enid: body"),
    ("#b9b5c9", "#16161d", False, "enid: panel secondary copy"),
    (PINK,    "#16161d", False, "enid: panel heading"),
    ("#101014", GREEN, False, "enid: sticker DISABLED"),
    ("#101014", YELLOW, False, "enid: sticker monotropic"),
    ("#101014", CYAN, False, "enid: sticker QUEER"),
    ("#101014", PINK, False, "enid: sticker AUTISTIC"),
    ("#ffffff", RED, False, "enid: sticker 'not a phase'"),
    (YELLOW,   BLUE, True,  "playhouse: h1 (has a black shadow too)"),
    ("#ffffff", BLUE, False, "playhouse: lede, backlink, door--play blurb"),
    ("#101014", YELLOW, False, "playhouse: stim box toy"),
    ("#3a3200", YELLOW, False, "playhouse: stim box body copy"),
    ("#0a3a1c", GREEN, False, "playhouse: chairy body copy"),
    ("#efe2ff", VIOLET_DEEP, False, "playhouse: word clock body copy"),
    ("#ffffff", VIOLET_DEEP, False, "playhouse: word clock title"),
    ("#3d2100", ORANGE, False, "playhouse: yell button body copy"),
    ("#101014", "#ffffff", False, "playhouse: house rules"),
    (YELLOW,  "#101014", False, "playhouse: the says-box and the floor tag"),
    (YELLOW,   RED, False, "playhouse: secret-word label 13px"),
    ("#ffffff", RED, True,  "playhouse: the secret word itself"),
    ("#ffe0e2", RED, False, "playhouse: secret-word small print"),
    ("#9d8cc8", INK2, False, "street: the empty storefront's 'to let'"),
    (INK,      GREEN, False, "dial: Gentle when pressed"),
    (INK,      CYAN,  False, "dial: Regular when pressed"),
    (INK,      PINK,  False, "dial: MAX GLITTER when pressed"),
    (CREAM,    INK2, False, "pony: facade button label"),
    ("#3a3644", "#ece8f5", False, "enid: polaroid caption"),
    (GREEN,    "#16161d", False, "enid: boombox PLAY + panel links"),
    ("#7d7a8c", "#101014", False, "enid: the room-05 line"),
    ("#7f7aad", "#05060f", False, "quantum: the room-04 line"),
    ("#4a4437", PAPER, False, "zine: the issue line"),
    (VIOLET,   "#05060f", False, "quantum: superposition heading"),
    (VIOLET,   INK,  False, "street: violet tagline + any violet ink on the night ground"),

    # THE SHARE CARDS (tools/make-og.py). Each card is its room's own markup on
    # its room's own ground, so most of what they draw is already above. These
    # are the pairs the cards ADDED -- and the two that the rooms had all along
    # and this file had never named, because a pair only gets checked once
    # somebody writes down where the text sits.
    (CYAN,      INK,  False, "plain rooms: h2 — and the plain share card's kicker"),
    ("#ffffff", "#047A9C", True, "quantum: the fringe caption, over the cyan "
     "interference stripe — the darkest of the three grounds those stripes make"),
    ("#b9b5c9", "#35224C", False, "enid: share-card footer over the violet half of the glow"),
    ("#b9b5c9", "#133523", False, "enid: share-card footer over the green half of the glow"),
    ("#2b0a1c", "#FF5AA6", False, "pony: dark copy over the brightest ray of the mirrorball glow"),
]

# NOT IN THE LIST, AND IT SHOULD BE: cream (#FFF3E6) on the same #FF5AA6 ground
# measures 2.64 and fails. That is the Pink Pony Club's own h1 and h2, over the
# room's own glow, on the live page -- flat on #FF3D9A they are 3.01, which is
# 3:1 by four thousandths, and any ray at all takes them under. Adding the pair
# here without fixing the room would only turn every run red, and the fix is a
# choice about how that room looks, which is not a checker's to make. It is
# written down here rather than in a commit message because this file is where
# somebody goes looking. The share card leaves the glow off until it is decided.


fails = []
for fg, bg, large, where in PAIRS:
    need = 3.0 if large else 4.5
    r = ratio(fg, bg)
    tag = "large" if large else "body "
    if r < need:
        fails.append((r, need, fg, bg, where))
        print(f"FAIL  {r:5.2f} (need {need}) {tag}  {fg} on {bg}  — {where}")

print(f"\n{len(PAIRS)} pairs checked, {len(fails)} failing.")
sys.exit(1 if fails else 0)
