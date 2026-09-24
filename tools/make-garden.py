#!/usr/bin/env python3
"""Build The Garden's beds, one per site we publish, the plots through the ivy
next door, and the credits with all of them.

THE ROSTER IS NOT IN THIS FILE AND NOT IN data/garden.json EITHER. Which sites
exist and what order they come in is read out of data/arrivals.json, whose own
`_order` records that the order is stimpunks.org's published feeds page -- the
one place our sites are collected by somebody deciding. So the garden cannot
invent a bed, cannot quietly lose one when a site is added to that list, and
cannot re-sort itself, which would be this room overruling a decision made
somewhere else. That is the rule the Jungle Room keeps about its cams, arriving
in a room where the temptation is stronger, because a garden looks like a thing
you would arrange by eye.

WHAT IS IN data/garden.json IS OUR OWN WRITING ABOUT EACH SITE, and nothing
else: no url, no name, no feed, no order. A second copy of a URL is a URL that
goes stale in one of the two places, which is the `_headers` shape this
repository has now met four times.

AND IT IS NOT THE FEED'S PARAGRAPH. That board's notes say what has ARRIVED
from a site; these say what GROWS there. Both rooms list every site we run,
which makes The Feed the room this one could collapse into -- so the division
is structural rather than a matter of tone: a board is a timetable (a title, a
date, a destination, and the minute it was set) and this is a planting plan
(what a site is for, whose hands are in it, and nothing that changes when
somebody publishes). Hence no network in this tool, no pull step beside it, and
the refusal of dates below.

WHAT IT REFUSES, and why each one is here:

  · A WIRE WITH NO BED, OR A BED WITH NO WIRE. make-latibulum.py's rule: a
    generator that writes nothing and exits 0 is how two surfaces drift apart.

  · A BED THIS FILE HAS NO DRAWING FOR, AND TWO BEDS THAT SHARE ONE. make-og.py's
    refusal and make-guild.py's, for their reason. The failure mode of guessing
    is not a crash; it is one shared glyph appearing quietly in every bed, which
    is the harmonising instinct arriving through plumbing.

  · A DRAWING WHOSE ARGUMENT IS NOT WRITTEN OUT IN WORDS. The drawings are
    aria-hidden decoration, and the habit of growth is the whole point of each
    one -- a rhizome for the site that comes up everywhere, a runner for the one
    about bringing somebody a small thing, a plant with no chlorophyll for the
    cabinet about living by what you are connected to. A claim that only sighted
    readers get is not a claim this site is allowed to make, so every bed says
    its habit in a sentence and this refuses one that does not.

  · A BED WITH NOBODY CREDITED. Attribution is the one careful habit this street
    kept, and a credit filed in the liner notes and not on the face of the thing
    is a credit nobody reads -- make-toys.py's rule about Milton and
    Miserandino, arriving where half these sites were made with Helen Edgar.

  · A COUNT OF WHAT A SITE HOLDS. Not the number of glossary terms, not how many
    sheets are out. It goes stale within the week and looks authoritative in the
    meantime, which is the fault The Feed spends a paragraph avoiding, and a
    garden measured by volume is an inventory. Cite the thing, not the size of
    it. The pattern is narrow on purpose: a number that belongs to SOMEBODY
    ELSE'S structure is a fact to protect rather than a total to refuse, which
    is why make-sweetgrass.py counts the seven strands in a bundle and this lets
    the map say how many places are on it.

  · THE VOCABULARY OF RANKING OUR OWN SITES. No biggest, no best, no busiest, no
    flagship. Checked with make-guild.py's negation window so the room can still
    say that it does not rank anything. A league table of our own projects would
    be a race between our own people, most of whom are Disabled and several of
    whom are one person -- The Feed's refusal, arriving where the comparison
    would be even easier to make because the beds are side by side.

  · A DATE IN A BED. See above: this is a plan, not a board.

  · A LINK IN A BED'S NOTE TO SOMEWHERE THAT IS NEITHER OURS NOR THAT BED'S OWN
    SITE. make-hermitage.py's rule about the Star Stuff table: a bench with
    somebody's name on it holding something else reads as a claim. The `with`
    line is exempt, and that is the entire reason it exists -- it is where a
    collaborator's name and a collaborator's own site go.

AND THE GARDEN NEXT DOOR IS NOT A BACK DOOR AROUND THE ROSTER. Autistic Realms
and More Realms are Helen Edgar's own sites, so they cannot be beds: a bed is a
site WE publish, and the only way to plant one of hers would have been to write
it into data/arrivals.json, which would put it on The Feed as one of our wires
and claim her work as ours in the one file this room may not invent anything in.
They are through the ivy instead. The two refusals face each other -- a bed
that is NOT on the roster is refused up there, a plot that IS on it is refused
down here -- so no edit to this file can move a site across that line.

THE LINE WAS A WOVEN FENCE FOR AN AFTERNOON AND HELEN ASKED FOR IVY AND STARS.
Her call, 2026-09-22, on a drawing of her own gardens, and she was right about
more than the picture: a fence says KEPT OUT and ivy says THIS IS AS FAR AS WE
CAN SEE. What the line marks is the edge of what we know and never the edge of
where anybody may go, which is the opposite reading and the correct one on a
page about somebody else's work.

  · A PLOT THAT DOES NOT SAY WHAT OF IT IS ALREADY IN THIS GARDEN. Without that
    line the section is a list of a friend's websites on a page about ours. With
    it, it is the other half of every `with` line in the beds: those say who
    helped us, and this says whose garden that help walked out of.

  · A PLOT WITH NO GARDENER NAMED ON IT, which is the entire difference between
    a plot and a bed and is not a thing to leave to the liner notes.

  · A DRAWING THAT REACHES UNDER THE IVY. A bed shows its soil and most of
    them show what is under it. We do not get to draw the ground of somebody
    else's garden, so a plot's drawing stops where the ivy runs and the walker
    at the bottom of this file refuses a coordinate that tries. Nothing over
    there casts a shadow either: the sun has not moved, the floor is past the
    ivy.

  · A HABIT ALREADY CLAIMED, whichever side of the ivy claimed it. The dedup
    spans both sets, because two drawings alike is two drawings alike.

IF THIS REFUSES: fix the cause. Do not widen a list to make it quiet.
"""
import html
import json
import math
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "garden.json"
WIRES = ROOT / "data" / "arrivals.json"
PAGE = ROOT / "the-garden.html"
CREDITS = ROOT / "liner-notes.html"

# Our own hosts. A link to one of these inside a bed's note is a link to a page
# of ours, which is always allowed: the beds sit on our street and may point
# back into it.
OURS = {"stimpunks.world"}

# ── The drawings, one habit of growth per bed ────────────────────────────────
# Every one of them is in THE SAME THREE INKS AND THE SAME ONE FLOWER COLOUR,
# and what tells them apart is the form. That is the campground's grammar
# deliberately inverted: out there each pitch gets one lit colour of its own,
# which works beautifully and runs out at about the fourth pitch, because there
# are not many kinds of light. There are as many kinds of growth as you like.
#
# THE SUN IS OVERHEAD IN THIS ROOM, so every drawing carries its own shadow as a
# small hard ellipse directly underneath the thing that made it -- never off to
# one side, which is the Hermitage's low sun and the one thing a drawing here
# must not borrow.
LOAM, LOAM2 = "#2B2013", "#5A462C"
LEAF, LEAF2 = "#2F6B1E", "#55893A"
BLOOM, BOARD = "#A8390B", "#FCFDF6"
# AND THE PALETTE SPLITS AT THE SOIL LINE THE WAY A PLANT DOES. Everything below
# it -- every root, rhizome, thread and spilled seed -- is drawn PALE, because a
# root is pale and because green on this earth is invisible: check-contrast.py
# measured the stems at 1.38 and the leaves at 2.14 against the soil, and no
# soil can clear 3:1 against both of these greens at once, since they are only
# 1.55 apart from each other. So the answer was not a different brown. Above the
# line is green, below it is PALE, and that is both the physics and the fix.
PALE = "#F2F7E9"

# WHERE THE SOIL STARTS, and it is a straight line on purpose. A field's ground
# undulates; a raised bed's soil is level, which is what the plank along the
# front of every bed in love.css §28 is holding up. It also makes the rule above
# CHECKABLE rather than remembered: SOIL_Y is a number, so "nothing green below
# the line" is something this file can refuse at the bottom of it.
SOIL_Y = 120
SOIL = (
    f'<path d="M0 {SOIL_Y} L300 {SOIL_Y} L300 170 L0 170 Z" fill="{LOAM2}"/>'
    f'<path d="M0 {SOIL_Y} L300 {SOIL_Y}" fill="none" stroke="{LOAM}" stroke-width="2"/>'
)


def shadow(cx, cy, rx):
    return f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="3.6" fill="{LOAM}" opacity=".38"/>'


def blade(d, fill):
    return f'<path d="{d}" fill="{fill}" stroke="{LOAM}" stroke-width="1.2" stroke-linejoin="round"/>'


DRAW = {
    # stimpunks.org — a rhizome: one plant coming up in three places, joined
    # under the bed. Most of this drawing is BELOW the soil line, which no other
    # bed here does, because that is where the argument is.
    "rhizome": (
        SOIL
        + f'<path d="M14 145 C 64 136, 118 152, 168 143 S 254 133, 294 141" fill="none" '
          f'stroke="{PALE}" stroke-width="8" stroke-linecap="round"/>'
        + f'<path d="M58 146 l-7 15 M62 147 l3 16 M150 150 l-6 14 M154 150 l4 15 '
          f'M232 140 l-6 16 M236 140 l4 15" fill="none" stroke="{PALE}" stroke-width="1.8" stroke-linecap="round"/>'
        + f'<circle cx="60" cy="141" r="5.4" fill="{PALE}" stroke="{LOAM}" stroke-width="1.4"/>'
        + f'<circle cx="152" cy="145" r="5.4" fill="{PALE}" stroke="{LOAM}" stroke-width="1.4"/>'
        + f'<circle cx="234" cy="135" r="5.4" fill="{PALE}" stroke="{LOAM}" stroke-width="1.4"/>'
        + shadow(60, 121, 15) + shadow(152, 121, 18) + shadow(234, 120, 13)
        + f'<path d="M60 136 C 59 128, 58 124, 57 119" fill="none" stroke="{PALE}" stroke-width="3.4"/>'
        + f'<path d="M57 119 C 55 108, 53 98, 50 86" fill="none" stroke="{LEAF}" stroke-width="3.4" stroke-linecap="round"/>'
        + blade("M52 100 C 34 96, 24 84, 28 72 C 42 74, 52 88, 52 100 Z", LEAF2)
        + blade("M54 112 C 68 108, 78 96, 74 86 C 62 88, 54 100, 54 112 Z", LEAF)
        + f'<path d="M152 140 C 152 132, 152 126, 151 119" fill="none" stroke="{PALE}" stroke-width="3.8"/>'
        + f'<path d="M151 119 C 150 100, 149 82, 148 62" fill="none" stroke="{LEAF}" stroke-width="3.8" stroke-linecap="round"/>'
        + blade("M149 78 C 130 72, 118 58, 122 46 C 138 48, 149 64, 149 78 Z", LEAF2)
        + blade("M150 94 C 168 88, 180 74, 176 62 C 160 64, 150 80, 150 94 Z", LEAF2)
        + blade("M151 110 C 136 108, 126 98, 128 89 C 140 90, 150 101, 151 110 Z", LEAF)
        + f'<path d="M234 130 C 233 126, 233 123, 233 119" fill="none" stroke="{PALE}" stroke-width="3.2"/>'
        + f'<path d="M233 119 C 232 110, 231 102, 232 94" fill="none" stroke="{LEAF}" stroke-width="3.2" stroke-linecap="round"/>'
        + blade("M232 106 C 216 102, 208 92, 211 82 C 224 84, 232 96, 232 106 Z", LEAF2)
        + blade("M233 116 C 246 112, 254 102, 251 93 C 240 95, 233 106, 233 116 Z", LEAF)
    ),
    # starstuff.earth — an umbel: one stem, every ray opening at the same height.
    "umbel": (
        SOIL
        + shadow(150, 121, 20)
        + f'<path d="M150 119 C 149 98, 147 74, 150 50" fill="none" stroke="{LEAF}" stroke-width="4" stroke-linecap="round"/>'
        + blade("M148 96 C 126 92, 112 78, 116 64 C 134 68, 147 82, 148 96 Z", LEAF2)
        + blade("M151 108 C 172 104, 186 90, 182 77 C 164 80, 151 94, 151 108 Z", LEAF)
        + f'<path d="M150 50 L108 34 M150 50 L124 26 M150 50 L137 22 M150 50 L150 20 '
          f'M150 50 L163 22 M150 50 L176 26 M150 50 L192 34" fill="none" stroke="{LEAF}" stroke-width="1.8"/>'
        + "".join(f'<circle cx="{x}" cy="{y}" r="5" fill="{BLOOM}"/>'
                  for x, y in ((106, 33), (122, 24), (136, 20), (150, 18), (164, 20), (178, 24), (194, 33)))
        + "".join(f'<circle cx="{x}" cy="{y}" r="1.8" fill="{BOARD}"/>'
                  for x, y in ((106, 33), (136, 20), (164, 20), (194, 33)))
        + f'<path d="M150 52 l-9 7 M150 52 l9 7 M150 53 l0 9" fill="none" stroke="{LOAM}" stroke-width="1.4" stroke-linecap="round"/>'
    ),
    # queering.earth — Monotropa uniflora: no chlorophyll, nodding, and living
    # off what it is joined to. The only bed here with no green in it, carried
    # entirely by its outline, which is the pebbling shore's reading of WCAG
    # 1.4.11 turning up in a plant.
    "ghostpipe": (
        SOIL
        + shadow(142, 121, 16)
        + f'<path d="M256 121 C 250 134, 236 140, 226 150 M226 150 l-10 6 M226 150 l3 12" '
          f'fill="none" stroke="{PALE}" stroke-width="2.2" stroke-linecap="round"/>'
        + f'<path d="M150 138 C 178 142, 208 146, 224 150" fill="none" stroke="{PALE}" '
          f'stroke-width="1.8" stroke-dasharray="3 5" stroke-linecap="round"/>'
        + f'<path d="M144 140 C 118 144, 86 140, 62 148" fill="none" stroke="{PALE}" '
          f'stroke-width="1.8" stroke-dasharray="3 5" stroke-linecap="round"/>'
        + f'<path d="M140 136 C 138 148, 134 156, 128 162 M146 136 C 150 148, 152 156, 156 164" '
          f'fill="none" stroke="{PALE}" stroke-width="1.8" stroke-linecap="round"/>'
        + f'<path d="M138 122 C 130 100, 126 80, 138 68 C 148 58, 158 64, 158 74" fill="none" '
          f'stroke="{LOAM}" stroke-width="7" stroke-linecap="round"/>'
        + f'<path d="M138 122 C 130 100, 126 80, 138 68 C 148 58, 158 64, 158 74" fill="none" '
          f'stroke="{BOARD}" stroke-width="4" stroke-linecap="round"/>'
        + f'<path d="M152 72 C 144 72, 141 86, 149 91 C 158 96, 166 86, 163 74 Z" fill="{BOARD}" '
          f'stroke="{LOAM}" stroke-width="1.8" stroke-linejoin="round"/>'
        + f'<path d="M152 122 C 150 104, 152 90, 162 82 C 172 75, 180 82, 179 90" fill="none" '
          f'stroke="{LOAM}" stroke-width="6" stroke-linecap="round"/>'
        + f'<path d="M152 122 C 150 104, 152 90, 162 82 C 172 75, 180 82, 179 90" fill="none" '
          f'stroke="{BOARD}" stroke-width="3.2" stroke-linecap="round"/>'
        + f'<path d="M174 88 C 167 88, 165 100, 172 104 C 180 108, 186 99, 184 89 Z" fill="{BOARD}" '
          f'stroke="{LOAM}" stroke-width="1.8" stroke-linejoin="round"/>'
        + f'<path d="M128 122 C 122 106, 118 94, 106 88 C 96 83, 90 90, 92 98" fill="none" '
          f'stroke="{LOAM}" stroke-width="6" stroke-linecap="round"/>'
        + f'<path d="M128 122 C 122 106, 118 94, 106 88 C 96 83, 90 90, 92 98" fill="none" '
          f'stroke="{BOARD}" stroke-width="3.2" stroke-linecap="round"/>'
        + f'<path d="M97 96 C 90 96, 87 108, 95 112 C 103 116, 109 106, 106 96 Z" fill="{BOARD}" '
          f'stroke="{LOAM}" stroke-width="1.8" stroke-linejoin="round"/>'
        + f'<path d="M134 104 l-7 -2 M141 92 l-8 -1 M147 80 l-8 0 M158 98 l7 -3 M164 92 l7 -1" '
          f'fill="none" stroke="{LOAM}" stroke-width="1.3" stroke-linecap="round"/>'
    ),
    # cavendish.space — the one bed with something BUILT over it, because that
    # site is about the structure: a frame changes what a bed can grow.
    "coldframe": (
        SOIL
        + shadow(150, 122, 108)
        + f'<path d="M44 118 L44 92 L256 84 L256 118 Z" fill="{LOAM2}" stroke="{LOAM}" stroke-width="2.2" stroke-linejoin="round"/>'
        + f'<path d="M44 104 L256 96" fill="none" stroke="{LOAM}" stroke-width="1.4" opacity=".7"/>'
        + f'<path d="M64 116 L64 96 M150 113 L150 92 M232 110 L232 88" fill="none" stroke="{LOAM}" stroke-width="1.4" opacity=".6"/>'
        + "".join(
            f'<path d="M{x} 116 C {x-2} 106, {x-3} 100, {x} 94" fill="none" stroke="{LEAF}" stroke-width="2.4" stroke-linecap="round"/>'
            f'<path d="M{x} 104 C {x-11} 101, {x-16} 94, {x-13} 88 C {x-5} 90, {x} 97, {x} 104 Z" fill="{LEAF2}" stroke="{LOAM}" stroke-width="1.1"/>'
            f'<path d="M{x+1} 100 C {x+11} 97, {x+16} 90, {x+13} 84 C {x+5} 86, {x+1} 93, {x+1} 100 Z" fill="{LEAF2}" stroke="{LOAM}" stroke-width="1.1"/>'
            for x in (82, 124, 166, 210))
        + f'<path d="M38 90 L262 82 L266 66 L42 74 Z" fill="{BOARD}" opacity=".82" stroke="{LOAM}" stroke-width="2.2" stroke-linejoin="round"/>'
        + f'<path d="M110 86 L114 70 M182 83 L186 67" fill="none" stroke="{LOAM}" stroke-width="1.3" opacity=".6"/>'
        + f'<path d="M60 78 L86 71" fill="none" stroke="{BOARD}" stroke-width="2.6" opacity=".9"/>'
        + f'<path d="M262 82 L262 100" fill="none" stroke="{LOAM}" stroke-width="2.6" stroke-linecap="round"/>'
    ),
    # penguinpebbling.app — runners: the plant reaches over and puts a new plant
    # down beside itself, roots and all, and asks for nothing back.
    "runners": (
        SOIL
        + shadow(64, 121, 22) + shadow(226, 120, 14)
        + f'<path d="M64 119 C 62 108, 60 98, 62 88" fill="none" stroke="{LEAF}" stroke-width="3.4" stroke-linecap="round"/>'
        + blade("M62 100 C 42 96, 30 82, 34 68 C 52 72, 62 86, 62 100 Z", LEAF2)
        + blade("M64 106 C 84 102, 96 88, 92 75 C 74 78, 64 92, 64 106 Z", LEAF2)
        + blade("M63 114 C 48 114, 38 106, 40 97 C 53 99, 62 106, 63 114 Z", LEAF)
        + f'<circle cx="62" cy="64" r="6.5" fill="{BLOOM}"/><circle cx="62" cy="64" r="2.2" fill="{BOARD}"/>'
        + f'<path d="M62 71 L62 84" fill="none" stroke="{LEAF}" stroke-width="2"/>'
        + f'<path d="M74 118 C 118 100, 174 100, 220 116" fill="none" stroke="{LEAF}" stroke-width="3" stroke-linecap="round"/>'
        + f'<path d="M226 118 C 226 110, 226 104, 227 98" fill="none" stroke="{LEAF}" stroke-width="2.6" stroke-linecap="round"/>'
        + blade("M226 106 C 213 104, 206 95, 209 87 C 219 90, 226 98, 226 106 Z", LEAF2)
        + blade("M228 104 C 240 101, 247 93, 244 86 C 234 88, 228 96, 228 104 Z", LEAF2)
        + f'<path d="M225 121 l-6 14 M228 121 l3 15 M226 121 l0 12" fill="none" stroke="{PALE}" stroke-width="1.8" stroke-linecap="round"/>'
    ),
    # whysheet.press — a seed head gone dry. The only bed here whose point is
    # that you take it away and it grows somewhere we never see.
    "seedhead": (
        SOIL
        + shadow(150, 121, 13)
        + f'<path d="M150 119 L151 68" fill="none" stroke="{LOAM2}" stroke-width="4.4" stroke-linecap="round"/>'
        + blade("M149 108 C 134 106, 124 96, 127 86 C 139 89, 148 99, 149 108 Z", LOAM2)
        + blade("M152 100 C 166 98, 176 88, 173 78 C 161 81, 152 91, 152 100 Z", LOAM2)
        + f'<path d="M136 66 C 136 52, 141 42, 151 42 C 161 42, 166 52, 166 66 Z" fill="{LOAM2}" '
          f'stroke="{LOAM}" stroke-width="2.2" stroke-linejoin="round"/>'
        + f'<path d="M132 44 L170 44" fill="none" stroke="{LOAM}" stroke-width="3" stroke-linecap="round"/>'
        + f'<path d="M137 44 L133 34 M144 44 L142 32 M151 44 L151 31 M158 44 L160 32 M165 44 L169 34" '
          f'fill="none" stroke="{LOAM}" stroke-width="1.6" stroke-linecap="round"/>'
        + f'<path d="M140 52 L140 62 M151 50 L151 64 M162 52 L162 62" fill="none" stroke="{LOAM}" stroke-width="1.3" opacity=".65"/>'
        + "".join(f'<circle cx="{x}" cy="{y}" r="2.4" fill="{PALE}" stroke="{LOAM}" stroke-width="1"/>'
                  for x, y in ((120, 116), (108, 124), (186, 118), (198, 126), (170, 128), (132, 129)))
        + f'<path d="M142 68 C 136 78, 130 88, 122 96 M160 68 C 168 78, 176 86, 184 94" '
          f'fill="none" stroke="{LOAM}" stroke-width="1.2" stroke-dasharray="2 6" stroke-linecap="round"/>'
    ),
    # stimpunks.world — a scramble. Nasturtiums over the edges of the bed, onto
    # the path, and off both sides of the frame: the loud one, and the only
    # drawing here that does not stay inside its own bed.
    "scramble": (
        SOIL
        + shadow(150, 122, 96)
        + f'<path d="M-6 118 C 40 108, 70 117, 104 104 C 134 92, 150 106, 186 100 '
          f'C 226 94, 250 114, 306 100" fill="none" stroke="{LEAF}" stroke-width="3" stroke-linecap="round"/>'
        + f'<path d="M-4 112 C 30 104, 56 90, 92 88 C 128 86, 152 70, 196 76 '
          f'C 236 82, 262 68, 304 74" fill="none" stroke="{LEAF}" stroke-width="2.6" stroke-linecap="round"/>'
        + f'<path d="M18 118 C 26 104, 20 90, 34 76 M120 106 C 126 92, 118 84, 126 70 '
          f'M214 100 C 222 88, 214 80, 224 68" fill="none" stroke="{LEAF}" stroke-width="2.2" stroke-linecap="round"/>'
        + "".join(
            f'<circle cx="{x}" cy="{y}" r="{r}" fill="{LEAF2}" stroke="{LOAM}" stroke-width="1.2"/>'
            f'<path d="M{x} {y} l{-r+2} -1 M{x} {y} l{r-3} -4 M{x} {y} l1 {r-3} M{x} {y} l{-r+4} {r-5} '
            f'M{x} {y} l{r-4} {r-5}" fill="none" stroke="{LOAM}" stroke-width="1" opacity=".6"/>'
            for x, y, r in ((34, 72, 13), (74, 94, 11), (126, 66, 12), (164, 92, 14),
                            (224, 64, 12), (258, 90, 11), (282, 72, 9), (10, 100, 10)))
        + "".join(
            f'<circle cx="{x}" cy="{y}" r="7.5" fill="{BLOOM}"/><circle cx="{x}" cy="{y}" r="2.6" fill="{BOARD}"/>'
            for x, y in ((100, 76), (196, 58), (52, 98), (246, 104)))
    ),
    # monotropicmap.org — a tendril: the stem puts out a feeler, finds the cane,
    # and holds on. Tendril Theory is one of the places on that island.
    "tendril": (
        SOIL
        + shadow(110, 121, 15)
        + f'<path d="M212 120 L212 30" fill="none" stroke="{LOAM2}" stroke-width="4" stroke-linecap="round"/>'
        + f'<path d="M110 119 C 106 100, 114 82, 130 70" fill="none" stroke="{LEAF}" stroke-width="3.4" stroke-linecap="round"/>'
        + blade("M112 104 C 94 100, 82 88, 86 74 C 104 78, 112 90, 112 104 Z", LEAF2)
        + blade("M116 92 C 134 86, 144 72, 140 60 C 124 64, 116 78, 116 92 Z", LEAF)
        + blade("M110 116 C 96 116, 86 108, 88 99 C 101 101, 109 108, 110 116 Z", LEAF2)
        + f'<path d="M130 70 C 150 58, 172 58, 190 50" fill="none" stroke="{LEAF}" stroke-width="2.2" stroke-linecap="round"/>'
        + f'<path d="M190 50 C 200 44, 214 44, 216 52 C 218 60, 206 64, 202 57 '
          f'C 199 51, 208 47, 212 51" fill="none" stroke="{LEAF}" stroke-width="2.2" stroke-linecap="round"/>'
        + f'<path d="M160 62 C 166 54, 164 46, 158 42" fill="none" stroke="{LEAF}" stroke-width="1.8" stroke-linecap="round"/>'
        + f'<path d="M158 42 C 152 38, 148 44, 153 47" fill="none" stroke="{LEAF}" stroke-width="1.8" stroke-linecap="round"/>'
    ),
}


# ── Through the ivy, which is not a bed and must not become one ────────────
# AUTISTIC REALMS AND MORE REALMS ARE HELEN EDGAR'S, and a bed is a site WE
# publish. The roster for that is data/arrivals.json, so the only way to plant
# somebody else's site here would have been to write it into that file -- which
# would put it on The Feed as one of our wires and claim her work as ours in the
# one place this room is not allowed to invent anything. The refusal below is
# therefore the mirror of the stray-bed refusal above: a plot that IS on the
# roster is a bed in the wrong section.
#
# IT WAS A WOVEN FENCE FIRST AND HELEN ASKED FOR IVY AND STARS INSTEAD, and she
# was right about more than the picture. A fence says KEPT OUT. Ivy says THIS IS
# AS FAR AS WE CAN SEE -- and what this line marks is the edge of what we know,
# never the edge of where anybody may go, which is the opposite reading and the
# correct one on a page about somebody else's work. Her call, 2026-09-22, on a
# drawing of her own gardens; it is written down here, in data/garden.json, in
# the changelog and in the liner notes for the same reason the one colour of
# hers this repository ever changed is written in four places.
#
# SO THE GRAMMAR INVERTS AND THE DRAWING SAYS SO BEFORE THE WORDS DO. A bed
# shows its soil and most of them show what is under it. A plot shows ivy
# running across the foot of the frame and NOTHING BELOW IT: we do not get to
# draw the roots of somebody else's garden, and the walker at the bottom of this
# file refuses a coordinate that tries.
#
# AND NOTHING OVER THERE CASTS A SHADOW. Every bed carries a small hard ellipse
# directly under the thing that made it, because the sun is overhead in this
# room. The sun has not moved -- the floor those shadows land on is past the
# ivy, where we cannot see it. An ellipse under a plot's plant would be this
# drawing claiming to know the shape of her ground.
IVY_Y = 132


def leaf(x, y, s, a, fill):
    """One five-lobed ivy leaf, its stalk joining the stem at (x, y).

    THE ANGLE IS BAKED INTO THE COORDINATES AND IS NOT A TRANSFORM. Every other
    drawing in this file writes absolute numbers, and check-gentle.py reads
    rotation out of a computed matrix -- a leaf turned with transform would be
    asking that checker to take this room's word for something, which is the
    call arcade.js made about its sprites and quest.js about its sparks."""
    pts = ((0, 0), (-.55, .15), (-.78, .46), (-.45, .56), (-.64, .96),
           (-.26, .93), (-.10, 1.36), (0, 1.48), (.10, 1.36), (.26, .93),
           (.64, .96), (.45, .56), (.78, .46), (.55, .15))
    ca, sa = math.cos(a), math.sin(a)
    d = "M" + " L".join(f"{x + s * (px * ca - py * sa):.1f} "
                        f"{y + s * (px * sa + py * ca):.1f}" for px, py in pts) + " Z"
    return (f'<path d="{d}" fill="{fill}" stroke="{LOAM}" stroke-width="1.1" '
            f'stroke-linejoin="round"/>')


def glimmer(x, y, s):
    """A star caught in the ivy.

    WHITE ON WHITE, CARRIED BY THE OUTLINE, which is the ghost pipe's answer in
    Queering.Earth's bed and the pebbling shore's reading of WCAG 1.4.11: a
    limewash star on this path measures 1.07 and what has to separate is the
    EDGE rather than the fill. No new colour in the room for it.

    AND THEY ARE GLIMMERS RATHER THAN A SKY. This room is midday and stays
    midday -- there is no dark ground here, nothing is lit by them and nothing
    ambient was added to the page, so they cannot turn the one daylit garden
    into a night one. `Threads, glimmers, and soft, weird spaces` is More
    Realms' own line about itself, which is where the word comes from. They are
    also not the meadow's fireflies: those are many small lights carrying a dark
    field on the campground's sign, and these are small bright marks on a pale
    one."""
    q, r = s * .28, s * .18
    return (f'<path d="M{x} {y - s} C {x + r} {y - q}, {x + q} {y - r}, {x + s} {y} '
            f'C {x + q} {y + r}, {x + r} {y + q}, {x} {y + s} '
            f'C {x - r} {y + q}, {x - q} {y + r}, {x - s} {y} '
            f'C {x - q} {y - r}, {x - r} {y - q}, {x} {y - s} Z" '
            f'fill="{BOARD}" stroke="{LOAM}" stroke-width="1.1" stroke-linejoin="round"/>')


# THE WINDING IVY AND THE STARS IN IT. One constant, drawn identically under
# both plots, exactly as the fence it replaces was: the boundary is the same
# boundary, and what tells the two plots apart is the plant standing behind it.
# The stars sit clear of both plants on purpose -- the tree's crown and the
# fern's fronds own the middle of the frame, so the glimmers keep to the ends.
IVY = (
    f'<path d="M-4 152 C 30 138, 62 164, 96 150 C 130 136, 160 164, 194 150 '
    f'C 228 136, 262 164, 304 148" fill="none" stroke="{LEAF}" stroke-width="3.4" '
    f'stroke-linecap="round"/>'
    + f'<path d="M-4 161 C 34 151, 70 170, 108 159 C 146 147, 178 168, 214 157 '
      f'C 248 147, 278 167, 304 157" fill="none" stroke="{LEAF2}" stroke-width="2.4" '
      f'stroke-linecap="round"/>'
    + "".join(f'<path d="M{x} {y} l{dx} {dy}" fill="none" stroke="{LEAF}" '
              f'stroke-width="1.4" stroke-linecap="round"/>'
              for x, y, dx, dy in ((34, 147, -3, 5), (92, 152, 4, 5), (150, 146, -4, 6),
                                   (208, 152, 4, 5), (268, 146, -3, 6)))
    + "".join(leaf(x, y, sz, a, fill) for x, y, sz, a, fill in (
        (18, 150, 11, 2.7, LEAF2), (48, 146, 12, 3.4, LEAF),
        (78, 155, 10, 0.4, LEAF), (110, 148, 12, 3.0, LEAF2),
        (140, 156, 10, 0.2, LEAF2), (170, 147, 12, 3.3, LEAF),
        (200, 156, 10, 6.0, LEAF), (230, 148, 12, 2.9, LEAF2),
        (262, 155, 10, 0.3, LEAF2), (290, 147, 11, 3.2, LEAF)))
    + "".join(glimmer(x, y, sz) for x, y, sz in (
        (26, 126, 7), (47, 138, 4.5), (235, 129, 6.5), (268, 143, 5),
        (289, 131, 4.5), (152, 166, 3.6)))
)

DRAW_OVER = {
    # autisticrealms.com — a nurse tree: the thing planted to take the weather
    # off whatever is growing under it until that can stand in its own light.
    # Her page puts the conditions before the flourishing, so the drawing does.
    "nurse": (
        f'<path d="M104 131 C 102 114, 101 98, 103 80" fill="none" stroke="{LOAM2}" '
        f'stroke-width="9" stroke-linecap="round"/>'
        + f'<path d="M103 98 C 92 92, 84 84, 80 74 M103 92 C 118 86, 132 78, 142 68" '
          f'fill="none" stroke="{LOAM2}" stroke-width="4" stroke-linecap="round"/>'
        + "".join(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{LEAF}"/>'
                  for x, y, r in ((74, 62, 20), (106, 44, 26), (140, 56, 22),
                                  (170, 66, 18), (92, 34, 17), (126, 32, 18), (156, 38, 16)))
        + "".join(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{LEAF2}"/>'
                  for x, y, r in ((98, 30, 10), (136, 46, 11), (76, 52, 9),
                                  (160, 52, 9), (118, 64, 10)))
        + "".join(
            f'<path d="M{x} 131 C {x-2} 122, {x-3} 114, {x} 106" fill="none" stroke="{LEAF}" '
            f'stroke-width="3" stroke-linecap="round"/>'
            f'<path d="M{x} 120 C {x-12} 117, {x-18} 110, {x-15} 103 C {x-6} 105, {x} 113, {x} 120 Z" '
            f'fill="{LEAF2}" stroke="{LOAM}" stroke-width="1.1"/>'
            f'<path d="M{x+1} 116 C {x+12} 113, {x+18} 106, {x+15} 99 C {x+6} 101, {x+1} 109, {x+1} 116 Z" '
            f'fill="{LEAF2}" stroke="{LOAM}" stroke-width="1.1"/>'
            f'<circle cx="{x}" cy="100" r="5.4" fill="{BLOOM}"/>'
            f'<circle cx="{x}" cy="100" r="1.9" fill="{BOARD}"/>'
            for x in (152, 182))
    ),
    # morerealms.com — a fern's crozier, still coiled. The one thing in either
    # garden that grows by UNWINDING rather than by reaching, which is what
    # keeps it clear of the map's tendril: a tendril is a feeler that finds
    # something and holds on, and this holds nothing and is not going anywhere
    # in particular. Spiral time is that site's own phrase for how it moves.
    "crozier": (
        f'<path d="M150 131 C 146 106, 152 82, 176 64" fill="none" stroke="{LEAF}" '
        f'stroke-width="3.4" stroke-linecap="round"/>'
        + blade("M154 112 C 140 108, 132 98, 136 89 C 147 93, 154 103, 154 112 Z", LEAF2)
        + blade("M151 100 C 164 95, 171 84, 167 76 C 156 80, 150 91, 151 100 Z", LEAF2)
        + blade("M158 88 C 147 84, 141 75, 144 68 C 153 71, 158 80, 158 88 Z", LEAF)
        + blade("M166 76 C 177 71, 183 62, 180 55 C 171 58, 166 68, 166 76 Z", LEAF2)
        + f'<path d="M122 131 C 126 108, 120 90, 106 82 C 92 74, 78 82, 78 95 '
          f'C 78 107, 92 112, 100 104 C 107 97, 101 88, 93 91 C 87 93, 87 100, 92 101" '
          f'fill="none" stroke="{LEAF}" stroke-width="4" stroke-linecap="round"/>'
        + f'<path d="M104 78 l-4 -7 M92 76 l-6 -5 M81 82 l-8 -3 M76 93 l-9 0 M79 104 l-8 4" '
          f'fill="none" stroke="{LOAM}" stroke-width="1.4" stroke-linecap="round"/>'
        + f'<path d="M196 131 C 200 118, 196 108, 186 104 C 177 100, 170 107, 173 114 '
          f'C 176 120, 184 118, 183 112" fill="none" stroke="{LEAF2}" stroke-width="3" '
          f'stroke-linecap="round"/>'
        + f'<path d="M188 102 l-3 -6 M177 103 l-5 -4 M171 110 l-7 -2" fill="none" '
          f'stroke="{LOAM}" stroke-width="1.3" stroke-linecap="round"/>'
    ),
}


# ── Nothing green below the soil line ───────────────────────────────────────
# THE ONE RULE IN THIS FILE THAT CAME OUT OF A MEASUREMENT. check-contrast.py
# put the greens at 1.38 and 2.14 against the earth, and no brown can clear 3:1
# against both of them at once, because they are only 1.55 apart from each
# other -- so there was no palette fix, only a drawing rule: green above the
# line, pale below it, which is what a plant does anyway. A blanched shoot goes
# green when it reaches the light.
#
# IT IS CHECKED RATHER THAN REMEMBERED because the next drawing will be added by
# somebody who has not read this paragraph, and a stem two pixels into the earth
# is invisible in exactly the way nobody notices. The walker below is the
# smallest thing that can answer the question: every absolute coordinate a green
# element puts on the canvas, endpoints and control points alike. Control points
# are included deliberately -- being stricter than the painted curve is cheap,
# and a drawing that trips on one is a drawing to redraw.
NUM = re.compile(r"[-+]?\d*\.?\d+")
CMD = re.compile(r"([MmLlHhVvCcSsQqTtAaZz])([^MmLlHhVvCcSsQqTtAaZz]*)")
GREENS = {LEAF, LEAF2, BLOOM}


def ys(d):
    """Every absolute y a path lands on or bends towards."""
    out, x, y, sx, sy = [], 0.0, 0.0, 0.0, 0.0
    for cmd, arg in CMD.findall(d):
        n = [float(v) for v in NUM.findall(arg)]
        rel = cmd.islower()
        c = cmd.upper()
        if c == "Z":
            x, y = sx, sy
            continue
        if c == "H":
            for v in n:
                x = x + v if rel else v
            continue
        if c == "V":
            for v in n:
                y = y + v if rel else v
                out.append(y)
            continue
        step = {"M": 2, "L": 2, "T": 2, "S": 4, "Q": 4, "C": 6, "A": 7}[c]
        for i in range(0, len(n) - step + 1, step):
            seg = n[i:i + step]
            pairs = [(seg[-7] if False else 0, 0)] if c == "A" else list(zip(seg[0::2], seg[1::2]))
            if c == "A":
                pairs = [(seg[5], seg[6])]
            for px, py in pairs:
                ax = x + px if rel else px
                ay = y + py if rel else py
                out.append(ay)
            x, y = (x + seg[-2], y + seg[-1]) if rel else (seg[-2], seg[-1])
            if c == "M" and i == 0:
                sx, sy = x, y
    return out


def below_the_line(svg):
    """Every green element in one drawing that reaches under the soil."""
    bad = []
    for el in re.findall(r"<(?:path|circle|ellipse)\b[^>]*/>", svg):
        inks = set(re.findall(r'(?:fill|stroke)="(#[0-9A-Fa-f]{6})"', el))
        if not (inks & GREENS):
            continue
        low = []
        d = re.search(r'\sd="([^"]+)"', el)
        if d:
            low = [v for v in ys(d.group(1)) if v > SOIL_Y + 0.5]
        cy = re.search(r'\scy="([-\d.]+)"', el)
        if cy:
            r = re.search(r'\s(?:r|ry)="([-\d.]+)"', el)
            edge = float(cy.group(1)) + (float(r.group(1)) if r else 0)
            if edge > SOIL_Y + 0.5:
                low = [edge]
        if low:
            bad.append((max(low), el[:78]))
    return bad


def below_the_ivy(svg):
    """Every element in a plot's drawing that reaches under the ivy.

    THE SAME WALKER AS ABOVE WITH THE INK FILTER TAKEN OFF, because the rule is
    not about colour here. A bed may draw its own soil and what is under it; a
    plot may not draw either, whatever it draws them in. What is on the far side
    of that line is somebody else's ground and this room does not know its
    shape."""
    bad = []
    for el in re.findall(r"<(?:path|circle|ellipse)\b[^>]*/>", svg):
        low = []
        d = re.search(r'\sd="([^"]+)"', el)
        if d:
            low = [v for v in ys(d.group(1)) if v > IVY_Y + 0.5]
        cy = re.search(r'\scy="([-\d.]+)"', el)
        if cy:
            r = re.search(r'\s(?:r|ry)="([-\d.]+)"', el)
            edge = float(cy.group(1)) + (float(r.group(1)) if r else 0)
            if edge > IVY_Y + 0.5:
                low = [edge]
        if low:
            bad.append((max(low), el[:78]))
    return bad


def e(s):
    return html.escape(str(s), quote=True)


# ── Reading and refusing ────────────────────────────────────────────────────

wires = json.loads(WIRES.read_text())["wires"]
raw = json.loads(DATA.read_text())
beds = raw["beds"]
plots = raw.get("neighbours", {})
problems = []

order = [w["id"] for w in wires]
missing = [i for i in order if i not in beds]
stray = [i for i in beds if i not in order]
if missing:
    problems.append(
        "these sites are on our own roster and have no bed: " + ", ".join(missing) +
        ".\n    The roster is data/arrivals.json, whose order is stimpunks.org's own feeds "
        "page.\n    A site we publish and do not plant is a garden quietly deciding who "
        "counts.")
for i in stray:
    problems.append(
        f"bed {i!r} is not on the roster in data/arrivals.json, so there is no site, no "
        "name\n    and no address for it. Add the wire there first; a bed cannot be "
        "invented here.")

# A number in front of something a site HOLDS. Narrow on purpose -- see the
# docstring: somebody else's count is a fact to protect, so `places` and
# `zones` are not on this list and `terms`, `sheets` and `entries` are.
HELD = (r"(?:glossary\s+terms?|terms?|entries|entry|sheets?|cards?|zines?|posts?|articles?|"
        r"pages?|patterns?|recipes?|broadsides?|essays?|guides?)")
NUMBER = (r"(?:\d[\d,]*|four|five|six|seven|eight|nine|ten|eleven|twelve|dozens?|hundreds?|"
          r"thousands?)")
COUNT = re.compile(rf"\b{NUMBER}\b(?:\s+(?:more|other|new|whole))?\s+{HELD}\b", re.I)

RANK = (r"(?:biggest|largest|best|busiest|flagship|main\s+site|primary\s+site|leading|"
        r"most\s+(?:active|important|popular|useful)|least\s+active|quietest)")
NEGATION = (r"(?:no|not|nothing|never|neither|none|without|refuses?|refused|refusing|cannot|"
            r"does not|is not|are not|isn't|aren't|nobody)")
RANKED = re.compile(rf"\b{RANK}", re.I)
RANK_OK = re.compile(rf"\b{NEGATION}\b[^.]{{0,40}}?\b{RANK}", re.I)

# A date, in any of the shapes this repository writes them.
DATE = re.compile(
    r"\b\d{4}-\d{2}-\d{2}\b|\b(?:January|February|March|April|May|June|July|August|September|"
    r"October|November|December)\s+\d{4}\b|\b(?:19|20)\d{2}\b")

HREF = re.compile(r'href="([^"]+)"')

for wid in order:
    bed = beds.get(wid)
    if not bed:
        continue
    wire = next(w for w in wires if w["id"] == wid)
    where = f"bed {wid!r}"
    host = wire["host"]

    form = bed.get("form", "")
    if form not in DRAW:
        problems.append(
            f"{where}: no drawing for form {form!r}. Each bed is a different habit of "
            "growth,\n    and falling back to a shared plant would put one component in "
            "every bed on a\n    street whose whole architecture is that nothing is shared.")
    if not str(bed.get("habit", "")).strip():
        problems.append(
            f"{where}: no habit sentence. The drawing is aria-hidden decoration and the "
            "habit\n    IS the argument, so it has to be in words on the page. A claim only "
            "sighted\n    readers get is not a claim this site is allowed to make.")
    if not str(bed.get("with", "")).strip():
        problems.append(
            f"{where}: nobody credited. Attribution is the one careful habit this street "
            "kept,\n    and a credit that is only in the liner notes is a credit nobody reads.")
    if not str(bed.get("what", "")).strip():
        problems.append(f"{where}: nothing said about what grows there.")

    text = " ".join(str(bed.get(k, "")) for k in ("what", "habit", "with"))
    plain = html.unescape(re.sub(r"<[^>]+>", " ", text))
    for m in COUNT.finditer(plain):
        problems.append(
            f"{where}: says {m.group(0).strip()!r}. No bed says how much a site holds: it is "
            "wrong\n    within the week and authoritative-looking in the meantime, and a "
            "garden\n    measured by volume is an inventory. Cite the thing, not the size of it.")
    for m in RANKED.finditer(plain):
        window = plain[max(0, m.start() - 48):m.end()]
        if not RANK_OK.search(window):
            problems.append(
                f"{where}: says {m.group(0).strip()!r} and is not refusing it. Nothing in this "
                "garden\n    is ranked against anything else in it. A league table of our own "
                "projects is a\n    race between our own people, most of whom are Disabled and "
                "several of whom are\n    one person.")
    for m in DATE.finditer(plain):
        problems.append(
            f"{where}: carries the date {m.group(0)!r}. A bed is a planting plan and The Feed "
            "is\n    the timetable; a date here is this room growing into that one, and it goes "
            "stale\n    the way that board says out loud that it might.")

    for href in HREF.findall(str(bed.get("what", ""))):
        if href.startswith(("http://", "https://")):
            there = href.split("/")[2].lower()
            if there != host and there not in OURS:
                problems.append(
                    f"{where}: its note links to {there}, which is neither ours nor this bed's "
                    "own\n    site. A label on one plant pointing at another plant reads as a "
                    "claim about it.\n    A collaborator's own site goes in the `with` line, "
                    "which is what that line is for.")

# ── Through the ivy ─────────────────────────────────────────────────────────
# THE MIRROR OF THE STRAY-BED REFUSAL. Up there, a bed that is not on the roster
# is refused because a bed cannot be invented; down here, a plot that IS on the
# roster is refused because that is one of ours and belongs in a bed. Between
# them there is no way to move a site across that line by editing this file, and
# no way to put somebody else's site in our ground by editing the other one.
for pid, plot in plots.items():
    where = f"plot {pid!r}"
    if pid in order:
        problems.append(
            f"{where} is on our own roster in data/arrivals.json, so it is a site we "
            "publish\n    and it belongs in a bed. This section is the garden NEXT DOOR and "
            "it is not a\n    back door around the roster: everything in it is somebody "
            "else's, said out loud.")
    for key, why in (
        ("site", "no name."),
        ("host", "no host, and the host is how a reader tells whose ground they are "
                 "looking at."),
        ("home", "nowhere to go. A plot that cannot be visited is this page talking "
                 "about\n    somebody instead of pointing at them."),
    ):
        if not str(plot.get(key, "")).strip():
            problems.append(f"{where}: {why}")

    form = plot.get("form", "")
    if form not in DRAW_OVER:
        problems.append(
            f"{where}: no drawing for form {form!r}. Every plot is its own habit of growth "
            "for\n    the beds' reason, and a shared glyph is the harmonising instinct "
            "arriving through\n    plumbing.")
    elif SOIL in DRAW_OVER[form]:
        problems.append(
            f"drawing {form!r} has a bed's soil band in it. A plot shows the ivy and what "
            "is\n    standing behind it, and nothing else: we do not get to draw the ground "
            "of\n    somebody else's garden, let alone what is under it.")
    if not str(plot.get("habit", "")).strip():
        problems.append(
            f"{where}: no habit sentence, and the drawing is aria-hidden decoration. The "
            "beds'\n    rule, and it does not relax because the plant is past the ivy.")
    if not str(plot.get("whose", "")).strip():
        problems.append(
            f"{where}: nobody named as whose it is. That is the entire difference between "
            "this\n    section and the beds -- a plot with no gardener on it reads as "
            "another of ours.")
    if not str(plot.get("here", "")).strip():
        problems.append(
            f"{where}: does not say what of it is already in this garden. Without that line "
            "this\n    is a list of a friend's websites on a page about ours. With it, it is "
            "the other\n    half of every `with` line in the beds: those say who helped us, "
            "and this says\n    whose garden that help walked out of.")
    if not str(plot.get("what", "")).strip():
        problems.append(f"{where}: nothing said about what grows there.")

    text = " ".join(str(plot.get(k, "")) for k in ("what", "habit", "whose", "here"))
    plain = html.unescape(re.sub(r"<[^>]+>", " ", text))
    for m in COUNT.finditer(plain):
        problems.append(
            f"{where}: says {m.group(0).strip()!r}. The beds' rule, and it matters more here: "
            "a\n    stale number about somebody else's site is a wrong claim about their "
            "work.")
    for m in RANKED.finditer(plain):
        if not RANK_OK.search(plain[max(0, m.start() - 48):m.end()]):
            problems.append(
                f"{where}: says {m.group(0).strip()!r} and is not refusing it. Nothing in this "
                "garden is\n    ranked against anything else in it, and ranking a "
                "neighbour's garden against\n    ours would be worse than ranking our own "
                "beds.")
    for m in DATE.finditer(plain):
        problems.append(
            f"{where}: carries the date {m.group(0)!r}. A plot is part of the planting plan "
            "and\n    The Feed is the timetable.")

    # A PLOT MAY POINT AT ITS OWN GROUND OR AT OURS AND NOWHERE ELSE. Wider than
    # the beds' rule by exactly the roster, and that widening IS the `here`
    # line: saying what of somebody's garden is already in ours means naming the
    # beds it is in. A third party is still refused, for the beds' reason.
    reachable = {plot.get("host", "").lower()} | OURS | {w["host"].lower() for w in wires}
    for field in ("what", "habit", "whose", "here"):
        for href in HREF.findall(str(plot.get(field, ""))):
            if href.startswith(("http://", "https://")):
                there = href.split("/")[2].lower()
                if there not in reachable:
                    problems.append(
                        f"{where}: its {field} line links to {there}, which is neither this "
                        "plot's own\n    site nor one of ours. A label on a neighbour's plant "
                        "pointing at a third\n    garden reads as a claim about all three.")

for form, svg in DRAW_OVER.items():
    for depth, el in below_the_ivy(svg):
        problems.append(
            f"drawing {form!r} puts something at y={depth:g}, under the ivy at "
            f"y={IVY_Y}:\n      {el}\n    A plot's drawing stops where the ivy runs. What is "
            "past it is somebody else's\n    ground and this room does not know its shape -- "
            "which is also why nothing over\n    there casts a shadow.")

for form, svg in DRAW.items():
    for depth, el in below_the_line(svg):
        problems.append(
            f"drawing {form!r} puts a green ink at y={depth:g}, under the soil line at "
            f"y={SOIL_Y}:\n      {el}\n    Green on this earth measures 1.38 and 2.14, and no brown "
            "clears 3:1 against both\n    of these greens at once. Above the line is green and below "
            "it is pale -- which is\n    what a plant does anyway. Draw the underground part in PALE.")

# ONE HABIT EACH, THROUGH THE IVY AS WELL AS ALONG THE PATH. The dedup spans
# both sets deliberately: two drawings alike is two drawings alike whichever
# side of the ivy they are standing on, and a boundary is not an excuse to
# reuse a form. It is also what keeps the crozier off the map's tendril.
seen_form = {}
for kind, wid, form in ([("bed", w, beds.get(w, {}).get("form")) for w in order]
                        + [("plot", k, v.get("form")) for k, v in plots.items()]):
    if form in seen_form:
        was_kind, was_id = seen_form[form]
        problems.append(
            f"{kind} {wid!r} and {was_kind} {was_id!r} both grow {form!r}. One habit each: "
            "the\n    form is the only thing telling these drawings apart, which is the whole "
            "reason\n    this room's grammar is form rather than colour.")
    seen_form[form] = (kind, wid)

if problems:
    raise SystemExit("REFUSING:\n  " + "\n  ".join(problems))


# ── Writing ─────────────────────────────────────────────────────────────────

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


def bed_html(wid):
    wire = next(w for w in wires if w["id"] == wid)
    bed = beds[wid]
    return "\n".join([
        f'    <li class="gd-bed">',
        f'      <div class="gd-bed__art" aria-hidden="true">',
        f'        <svg viewBox="0 0 300 170" fill="none">{DRAW[bed["form"]]}</svg>',
        f'      </div>',
        f'      <div class="gd-bed__sign">',
        f'        <div class="gd-bed__label">',
        f'          <h3><a href="{e(wire["home"])}">{e(wire["site"])}</a></h3>',
        f'          <span class="gd-bed__host">{e(wire["host"])}</span>',
        f'        </div>',
        f'        <p class="gd-bed__what">{bed["what"]}</p>',
        f'        <p class="gd-bed__habit"><b>What is growing here:</b> {bed["habit"]}</p>',
        f'        <p class="gd-bed__with"><b>Grown with</b> {bed["with"]}</p>',
        f'      </div>',
        f'    </li>',
    ])


def plot_html(pid):
    """A plot through the ivy. SAID DIFFERENTLY FROM A BED IN EVERY LINE that
    could be mistaken for one: the heading is what is growing THERE rather than
    here, the credit is `Tended by` rather than `Grown with`, and there is a
    fourth line a bed does not have, because the one thing this section owes a
    reader is why somebody else's garden is on a page about ours."""
    plot = plots[pid]
    return "\n".join([
        f'    <li class="gd-plot">',
        f'      <div class="gd-plot__art" aria-hidden="true">',
        f'        <svg viewBox="0 0 300 170" fill="none">{DRAW_OVER[plot["form"]]}{IVY}</svg>',
        f'      </div>',
        f'      <div class="gd-plot__sign">',
        f'        <div class="gd-plot__label">',
        f'          <h3><a href="{e(plot["home"])}">{e(plot["site"])}</a></h3>',
        f'          <span class="gd-plot__host">{e(plot["host"])}</span>',
        f'        </div>',
        f'        <p class="gd-plot__what">{plot["what"]}</p>',
        f'        <p class="gd-plot__habit"><b>What is growing there:</b> {plot["habit"]}</p>',
        f'        <p class="gd-plot__whose"><b>Tended by</b> {plot["whose"]}</p>',
        f'        <p class="gd-plot__here"><b>What of it is already in this garden:</b> '
        f'{plot["here"]}</p>',
        f'      </div>',
        f'    </li>',
    ])


swap(PAGE, "garden:beds", "\n".join(bed_html(w) for w in order), "  ")
swap(PAGE, "garden:neighbours", "\n".join(plot_html(k) for k in plots), "  ")

creds = [
    '    <p><b>The Garden.</b> One bed per site we publish, built from '
    '<code>data/garden.json</code> by <code>tools/make-garden.py</code>. <b>Which sites are in '
    'it is not decided in either of those files:</b> the roster and the running order are read '
    'out of <code>data/arrivals.json</code>, whose order is the one our sites appear in on '
    '<a href="https://stimpunks.org/feeds/">stimpunks.org&rsquo;s own feeds page</a> &mdash; the '
    'same list <a href="the-feed.html">The Feed</a> runs on, and the same reason: re-sorting it '
    'here would be this room overruling a decision made somewhere else.</p>',
    '    <p><b>What each site is was read off that site&rsquo;s own pages</b>, and where one of '
    'them describes itself in a phrase worth keeping, the phrase is attributed to it rather than '
    'absorbed &mdash; Star Stuff calls itself the public flowering of this garden, which is its '
    'sentence and not ours. The notes here are written for this room: The Feed says what has '
    '<i>arrived</i> from a site and this says what <i>grows</i> there, because two rooms holding '
    'one paragraph is one room with two doors.</p>',
    '    <p><b>Every bed says whose hands are in it, on the face of the bed.</b> Half of these '
    'sites were made with <b>Helen Edgar</b> of <a href="https://autisticrealms.com/">Autistic '
    'Realms</a>; <i>Star Stuff</i> is a collaboration with <a href="https://morerealms.com/">More '
    'Realms</a>; the Cavendish model is <b>David Thornburg</b>&rsquo;s three primordial spaces by '
    'way of <b>Steve Silberman</b>&rsquo;s <i>NeuroTribes</i>; monotropism is <b>Dinah Murray</b>, '
    '<b>Wenn Lawson</b> and <b>Mike Lesser</b>&rsquo;s; the pebbling locution is <b>Amythest '
    'Schaber</b>&rsquo;s. A credit filed only here and not in the room is a credit nobody reads, '
    'so the generator refuses a bed with nobody on it.</p>',
    '    <p><b>The garden next door is Helen Edgar\u2019s and is not a bed.</b> '
    '<a href="https://autisticrealms.com/">Autistic Realms</a> and '
    '<a href="https://morerealms.com/">More Realms</a> are hers, so the only way to plant '
    'them would have been to write them into the roster above &mdash; which would put them '
    'on <a href="the-feed.html">The Feed</a> as our own wires and claim her work as ours in '
    'the one file this room is not allowed to invent anything in. They are through the ivy '
    'instead, and the grammar inverts to say so before the words do: a bed shows its soil '
    'and most of them show what is under it, and <b>a plot stops where the ivy runs</b>, '
    'because we do not get to draw the ground of somebody else\u2019s garden. Nothing over '
    'there casts a shadow either &mdash; the sun has not moved, the floor is past the ivy. '
    'What each of them is was read off its own pages, and the phrases in quotation marks '
    'are theirs.</p>',
    '    <p><b>It was a woven fence for an afternoon, and Helen asked for ivy and stars '
    'instead.</b> Her call, on a drawing of her own gardens, and she was right about more '
    'than the picture: <b>a fence says kept out and ivy says this is as far as we can '
    'see.</b> What that line marks is the edge of what we know and never the edge of where '
    'anybody may go, which is the opposite reading and the correct one on a page about '
    'somebody else\u2019s work. The stars are glimmers caught in the ivy rather than a sky '
    '&mdash; this room is still midday, nothing is lit by them and nothing was added to the '
    'page &mdash; and <i>threads, glimmers, and soft, weird spaces</i> is '
    '<a href="https://morerealms.com/">More Realms</a>\u2019 own line about itself, '
    'which is where the word comes from. They are limewash white carried by an outline, '
    'because white on this path measures 1.07 and what has to separate is the edge: the '
    'ghost pipe\u2019s answer in Queering.Earth\u2019s bed, in a star.</p>',
    '    <p><b>The drawings are ours, and each one is a different habit of growth</b> &mdash; a '
    'rhizome, an umbel, a plant with no chlorophyll in it, a frame with seedlings under glass, a '
    'runner, a dry seed head, a scramble, a tendril. That is the campground&rsquo;s grammar '
    'inverted on purpose: out in the field each pitch gets one lit colour of its own, and there '
    'are not many kinds of light. Every habit is also written out in a sentence beside its bed, '
    'because the drawings are decoration a screen reader never reaches and the habit is the '
    'argument. <b>The Garden Spider is ours too</b>, and it is an orb weaver rather than anybody'
    '&rsquo;s mascot.</p>',
    '    <p><b>The spider&rsquo;s own words are stimpunks.org&rsquo;s.</b> That a spider is a '
    'guide to the garden and never a replacement for it, and that its best answer is an entrance, '
    'are lines from our <a href="https://stimpunks.org/ask/">Ask</a> page, quoted from ourselves '
    'rather than paraphrased into something softer. The typefaces are <b>Faustina</b> and '
    '<b>Mulish</b>, both under the SIL Open Font License, and this is the one room on the street '
    'that sets no display face at all.</p>',
]
swap(CREDITS, "garden:credits", "\n".join(creds), "  ")

print(f"garden: {len(order)} beds and {len(plots)} plots through the ivy written into "
      f"{PAGE.name},\n        {len(set(seen_form))} habits of growth, none repeated.")
print(f"        roster and order read from {WIRES.name}; credits written into {CREDITS.name}.")
