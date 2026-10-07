#!/usr/bin/env python3
"""Draw the cabin behind the door marked E, and hold it to what it promises.

WHAT IT IS. Ryan's brief, 2026-10-07: the first room you have to know the
address of. A cabin in the woods, beyond the usual paths, behind a wooden door
marked with the letter E, with a password. Inside, everything is soft and slow:
faery lights, candles, blankets, a record player with three records by
Cigarettes After Sex on its rack, and a place for tenderness, curiosity,
connection and closeness, where kinks, pluralities and polyamorous ways are
embraced. The words in both pages are printed as they were given, and the room
names nobody as their author (Ryan's call, the same day).

TWO PAGES, AND THE WORD IS THE ADDRESS. Ryan's call: the door is one unlisted
page, and saying the password to it takes you to a second unlisted page whose
address is the word. So the door page must never contain that address. It holds
only the word's SHA-256, written here into e-door.js, and builds the address
from what was typed. That is a door, not a lock: the repository is public, and
it says so (tools/unlisted.py).

WHAT IT DRAWS, AND WHY THE TWO HALVES SHARE NOTHING. Outside is the woods at
night, cold grey and no colour, and the only light is the inside's, coming
through the E cut in the door and under it, and laying the E on the leaves in
front of you like a stencil in front of a lamp. Inside is the same light seen
from under a blanket: every light in the room out of focus, a soft disc rather
than a point, and only what is close to you sharp. The collisions are in §101
and §102 of love.css.

IT WRITES, between markers: the door's scene and the door's word (e-door.js);
the inside's lights, its record player and its rack; and both pages' credit for
the type, read off data/foundry-faces.json rather than typed.

IT REFUSES:
  · either page without data-unlisted on its <body> or noindex in its <head>,
    and either page in make-sitemap.py's walking order (that tool refuses the
    second too, from the other side);
  · the inside's address anywhere in the door page or in e-door.js, in any case;
  · an album that is not on the band's own channel, whose list or track ids are
    not ids, with no year, label or MusicBrainz record, or with a field this
    tool does not know: a lyric is not a field, and nothing musical is hosted;
  · a runtime typed rather than added up: the rack's numbers come from the
    tracks, so there is nowhere to type one;
  · a credit for the words that names nobody without saying so.
"""
import hashlib
import html
import json
import random
import re
import sys
from pathlib import Path

import unlisted

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data/secret-cabin.json"
DOORJS = ROOT / "e-door.js"
FACES = ROOT / "data/foundry-faces.json"
LIST = re.compile(r"OLAK5uy_[A-Za-z0-9_-]{33}")
VIDEO = re.compile(r"[A-Za-z0-9_-]{11}")
ALBUM_KEYS = {"title", "released", "label", "musicbrainz", "list", "sleeve", "tracks"}
TRACK_KEYS = {"id", "title", "seconds"}
WORDS = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
         "eleven", "twelve", "thirteen", "fourteen", "fifteen"]

problems = []


def refuse(msg):
    problems.append(msg)


def esc(s):
    return html.escape(s, quote=True)


def lum(h):
    c = [int(h[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    c = [x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c]
    return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]


def mins(s):
    m, x = divmod(int(s), 60)
    return f"{m} min {x} sec" if x else f"{m} min"


def clock(s):
    m, x = divmod(int(s), 60)
    return f"{m}:{x:02d}"


def put(src, name, body, page):
    """Replace one marked region, refusing a page that has lost its markers."""
    begin, end = f"<!-- cabin:{name}:begin -->", f"<!-- cabin:{name}:end -->"
    if src.count(begin) != 1 or src.count(end) != 1:
        refuse(f"{page} needs exactly one pair of cabin:{name} markers.")
        return src
    return re.sub(re.escape(begin) + r".*?" + re.escape(end),
                  lambda _: f"{begin}\n{body}\n{end}", src, count=1, flags=re.S)


# ── The E, in unit coordinates: three arms on a stem, the same top and bottom ─
E = [(0, 0), (1, 0), (1, .2), (.3, .2), (.3, .4), (.84, .4), (.84, .6), (.3, .6),
     (.3, .8), (1, .8), (1, 1), (0, 1)]


def pts(ps):
    return " ".join(f"{x:.1f},{y:.1f}" for x, y in ps)


def door_scene():
    """The woods at night and the door. NOTHING IS LIT BUT WHAT COMES THROUGH
    THE E: the cut letter, the line under the door, and the E laid on the leaves
    in front of it, foreshortened, the way a stencil in front of a lamp throws
    its shape. Everything else is grey on grey, the cold outside, and nothing in
    the drawing moves at any setting."""
    r = random.Random(5)
    out = ['<svg class="wd-scene__draw" viewBox="0 0 800 420" fill="none" '
           'preserveAspectRatio="xMidYMid meet" focusable="false" aria-hidden="true">']
    # far trunks, then near ones, kept off the cabin
    for tone, n, (lo, hi) in (("--wd-far", 16, (6, 16)), ("--wd-tree", 9, (16, 34))):
        for _ in range(n):
            w = r.uniform(lo, hi)
            x = r.choice([r.uniform(-10, 214 - w), r.uniform(588, 810 - w)])
            out.append(f'<rect x="{x:.1f}" y="0" width="{w:.1f}" height="336" fill="var({tone})"/>')
    # the cabin: a roof line in the dark and a wall of logs
    out.append('<polygon points="214,82 400,14 586,82" fill="var(--wd-roof)"/>')
    out.append('<rect x="232" y="80" width="336" height="252" fill="var(--wd-wall)"/>')
    for y in range(102, 332, 22):
        out.append(f'<path d="M232 {y} H568" stroke="var(--wd-seam)" stroke-width="2"/>')
    # the frame and the door, planked, with two iron straps and a ring
    out.append('<rect x="320" y="100" width="160" height="232" fill="var(--wd-frame)"/>')
    out.append('<rect x="330" y="110" width="140" height="220" fill="var(--wd-door)"/>')
    for x in range(358, 470, 28):
        out.append(f'<path d="M{x} 110 V330" stroke="var(--wd-seam)" stroke-width="2"/>')
    for y in (136, 296):
        out.append(f'<rect x="330" y="{y}" width="92" height="9" rx="2" fill="var(--wd-iron)"/>')
        out.append(f'<circle cx="338" cy="{y + 4.5}" r="2.4" fill="var(--wd-seam)"/>')
    out.append('<circle cx="452" cy="232" r="9" stroke="var(--wd-iron)" stroke-width="4"/>')
    # the ground, the leaves and the step
    out.append('<rect x="0" y="330" width="800" height="90" fill="var(--wd-ground)"/>')
    for _ in range(140):
        x, y = r.uniform(0, 800), r.uniform(336, 418)
        out.append(f'<ellipse cx="{x:.1f}" cy="{y:.1f}" rx="{r.uniform(3, 8):.1f}" '
                   f'ry="{r.uniform(1.4, 2.8):.1f}" fill="var(--wd-leaf)"/>')
    out.append('<rect x="314" y="330" width="172" height="9" fill="var(--wd-step)"/>')
    # the light: under the door, through the E, and the E on the leaves. It is
    # candlelight, so it is one light that flickers (candles.js), and only dims:
    # the E is a hole in a door, not a flame, and does not change shape.
    out.append('<g data-flame="glow" data-x="400" data-y="330">')
    # round a shut door the light gets out at every edge, most of all at the
    # foot, and that line is what you can see of the door in the dark
    out.append('<path d="M329 330 V109 H471 V330" stroke="var(--wd-glow)" stroke-width="1.6" opacity=".55"/>')
    out.append('<rect x="332" y="327.5" width="136" height="2.5" fill="var(--wd-glow)"/>')
    out.append('<ellipse cx="400" cy="342" rx="96" ry="5" fill="var(--wd-glow)" opacity=".22"/>')
    on_door = [(372 + u * 56, 160 + v * 84) for u, v in E]
    out.append(f'<polygon points="{pts(on_door)}" stroke="var(--wd-glow)" stroke-width="20" '
               'stroke-linejoin="round" opacity=".07"/>')
    out.append(f'<polygon points="{pts(on_door)}" stroke="var(--wd-glow)" stroke-width="8" '
               'stroke-linejoin="round" opacity=".16"/>')
    out.append(f'<polygon points="{pts(on_door)}" fill="var(--wd-glow)"/>')
    # thrown: the top of the E lands nearest you, and an E is the same either way up
    def thrown(u, v):
        y = 410 - v * 58
        w = 132 - v * 66
        return 400 + (u - .5) * w, y
    out.append(f'<polygon points="{pts([thrown(u, v) for u, v in E])}" fill="var(--wd-glow)" opacity=".3"/>')
    out.append("</g></svg>")
    return "".join(out)


def halo(prefix):
    """Three soft discs with a brighter rim: a light out of focus."""
    out = []
    for k in ("amber", "rose", "gold"):
        out.append(f'<radialGradient id="{prefix}-{k}">'
                   f'<stop offset="0" style="stop-color:var(--snug-{k});stop-opacity:.5"/>'
                   f'<stop offset=".8" style="stop-color:var(--snug-{k});stop-opacity:.62"/>'
                   f'<stop offset=".93" style="stop-color:var(--snug-{k});stop-opacity:.8"/>'
                   f'<stop offset="1" style="stop-color:var(--snug-{k});stop-opacity:0"/>'
                   '</radialGradient>')
    return "".join(out)


def flame(cx, base, w, h, prefix, ink="amber", glow=1.5):
    """One flame, its soft glow and its gold heart, as a group candles.js can
    flicker from its foot. Nothing here carries a word."""
    def tongue(w, h):
        return (f"M{cx:.1f} {base:.1f} C{cx - w:.1f} {base - h * .25:.1f} {cx - w * .55:.1f} "
                f"{base - h * .7:.1f} {cx:.1f} {base - h:.1f} C{cx + w * .55:.1f} {base - h * .7:.1f} "
                f"{cx + w:.1f} {base - h * .25:.1f} {cx:.1f} {base:.1f} Z")
    return (f'<g data-flame data-x="{cx:.1f}" data-y="{base:.1f}">'
            f'<circle cx="{cx:.1f}" cy="{base - h * .55:.1f}" r="{h * glow:.1f}" '
            f'fill="url(#{prefix}-amber)" opacity=".5"/>'
            f'<path d="{tongue(w, h)}" fill="var(--snug-{ink})"/>'
            f'<path d="{tongue(w * .5, h * .55)}" fill="var(--snug-gold)"/>'
            '</g>')


def candle(cx, base, w, tall, prefix, glow=1.5):
    """A candle standing on `base`: wax with its shaded side, a wick, a flame."""
    top = base - tall
    return (f'<rect x="{cx - w / 2:.1f}" y="{top:.1f}" width="{w:.1f}" height="{tall:.1f}" '
            'fill="var(--snug-wax)"/>'
            f'<rect x="{cx + w * .15:.1f}" y="{top:.1f}" width="{w * .35:.1f}" height="{tall:.1f}" '
            'fill="var(--snug-wax2)"/>'
            f'<ellipse cx="{cx:.1f}" cy="{top:.1f}" rx="{w / 2:.1f}" ry="{max(1.2, w / 6):.1f}" '
            'fill="var(--snug-wax2)"/>'
            f'<path d="M{cx:.1f} {top:.1f} V{top - 3:.1f}" stroke="var(--snug-vinyl)" stroke-width="1.2"/>'
            + flame(cx, top - 2.5, w * .42, w * 1.5 + 5, prefix, glow=glow))


def bokeh():
    """The cabin's lights from under a blanket: nothing far is in focus, every
    light a soft disc with a brighter rim, the strings of faery lights along the
    walls, and in front of them, close enough to be sharp, a row of candles.
    Ryan, 2026-10-07: "We want flicker. And lots of candles." The flames
    flicker (candles.js); the faery lights hold still, and at MAX drift a few
    pixels, as slowly as anything on the street."""
    r = random.Random(11)
    inks = ["amber", "rose", "gold"]
    out = ['<svg class="snug-glow__draw" viewBox="0 0 800 260" fill="none" '
           'preserveAspectRatio="xMidYMax slice" focusable="false" aria-hidden="true"><defs>',
           halo("snug-b"), "</defs>"]
    # far: big, faint, anywhere
    out.append('<g class="snug-drift snug-drift--a" opacity=".26">')
    for _ in range(14):
        out.append(f'<circle cx="{r.uniform(0, 800):.0f}" cy="{r.uniform(30, 230):.0f}" '
                   f'r="{r.uniform(34, 76):.0f}" fill="url(#snug-b-{r.choice(inks)})"/>')
    out.append("</g>")
    # the strings, along the walls: two sagging curves of lights
    out.append('<g class="snug-drift snug-drift--b" opacity=".85">')
    for top, sag, step, start in ((46, 64, 44, 8), (32, 40, 52, 30)):
        x, i = start, 0
        while x < 812:
            t = (x - 400) / 400
            y = top + sag * (1 - t * t)
            out.append(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{r.uniform(13, 21):.0f}" '
                       f'fill="url(#snug-b-{inks[i % 3]})"/>')
            x += step + r.uniform(-6, 6)
            i += 1
    out.append("</g>")
    # the candles, close, along the foot, every height and width
    x = 14
    while x < 792:
        w = r.uniform(9, 20)
        out.append(candle(x, 262, w, r.uniform(16, 62), "snug-b"))
        x += w + r.uniform(8, 22)
    out.append("</svg>")
    return "".join(out)


def fluffy(cx, cy, rx, ry, bumps, ink, r):
    """A heap of blanket with a fluffy edge: an ellipse whose rim is a run of
    small soft bumps, so it has no straight line in it anywhere."""
    import math
    d = []
    n = bumps
    for k in range(n + 1):
        a = math.pi + math.pi * k / n          # the top half, left to right
        x, y = cx + rx * math.cos(a), cy + ry * math.sin(a)
        if k == 0:
            d.append(f"M{x:.1f} {y:.1f}")
        else:
            pa = math.pi + math.pi * (k - .5) / n
            px = cx + (rx + r.uniform(5, 9)) * math.cos(pa)
            py = cy + (ry + r.uniform(5, 9)) * math.sin(pa)
            d.append(f"Q{px:.1f} {py:.1f} {x:.1f} {y:.1f}")
    d.append(f"Q{cx:.1f} {cy + ry * .5:.1f} {cx - rx:.1f} {cy:.1f}Z")
    return f'<path d="{" ".join(d)}" fill="var({ink})"/>'


def cabin():
    """The cabin, all of it, as the paragraph above it says: the fire, the
    mantel crowded with candles, more candles on the floor and the table,
    blankets heaped up to curl up in, the record player on a crate with its
    sleeves, and a low table with bottles of wine, a glass, a coffee pot and
    mugs, a jar of weed, and an abundance of snacks. Ryan, 2026-10-07: "Include
    all of this." The faery lights along the wall are out of focus, like every
    light here; every flame flickers (candles.js). Nothing in it carries a word,
    because every word of it is in the paragraph above."""
    r = random.Random(23)
    o = ['<svg class="snug-scene__draw" viewBox="0 0 900 440" fill="none" '
         'focusable="false" aria-hidden="true"><defs>', halo("snug-s"), "</defs>",
         '<rect width="900" height="440" fill="var(--snug-dark)"/>',
         '<rect y="352" width="900" height="88" fill="var(--snug-floor)"/>',
         '<ellipse cx="520" cy="402" rx="330" ry="32" fill="var(--snug-plinth)"/>']
    # the faery lights along the wall, out of focus
    o.append('<g class="snug-drift snug-drift--b" opacity=".8">')
    x, i = 380, 0
    while x < 900:
        t = (x - 640) / 260
        o.append(f'<circle cx="{x:.0f}" cy="{30 + 34 * (1 - t * t):.0f}" r="{r.uniform(9, 14):.0f}" '
                 f'fill="url(#snug-s-{["amber", "rose", "gold"][i % 3]})"/>')
        x += 30 + r.uniform(-4, 4)
        i += 1
    o.append("</g>")
    # the hearth: stones, the dark opening, logs, embers and the fire
    o.append('<rect x="56" y="122" width="278" height="232" fill="var(--snug-stone)"/>')
    for row, y in enumerate(range(130, 350, 22)):
        x = 60 + (row % 2) * 18
        while x < 330:
            w = r.uniform(30, 48)
            o.append(f'<rect x="{x:.1f}" y="{y}" width="{min(w, 330 - x):.1f}" height="18" rx="4" '
                     'fill="var(--snug-stone2)"/>')
            x += w + 4
    o.append('<path d="M104 354 V230 Q195 172 286 230 V354 Z" fill="var(--snug-vinyl)"/>')
    o.append('<ellipse cx="195" cy="342" rx="74" ry="9" fill="var(--snug-ember)" opacity=".75"/>')
    o.append('<polygon points="136,348 254,326 258,338 140,358" fill="var(--snug-log)"/>')
    o.append('<polygon points="142,326 250,350 246,360 138,338" fill="var(--snug-log)"/>')
    for cx, w, h, ink in ((160, 15, 62, "ember"), (182, 19, 92, "amber"), (204, 21, 108, "amber"),
                          (226, 17, 84, "rose"), (246, 13, 58, "ember"), (196, 11, 64, "gold")):
        o.append(flame(cx, 340, w, h, "snug-s", ink, glow=.5))
    # the mantel, crowded with candles
    o.append('<rect x="38" y="106" width="314" height="16" rx="3" fill="var(--snug-table)"/>')
    o.append('<path d="M40 107 H350" stroke="var(--snug-rim)" stroke-width="1.5"/>')
    x = 50
    while x < 344:
        w = r.uniform(8, 15)
        o.append(candle(x, 106, w, r.uniform(16, 64), "snug-s", glow=1.1))
        x += w + r.uniform(5, 13)
    # candles on the floor by the hearth
    for cx, w, tall in ((22, 14, 46), (40, 10, 26), (352, 13, 38), (368, 9, 22)):
        o.append(candle(cx, 368, w, tall, "snug-s", glow=1.1))
    # the record player on a crate, its sleeves leaning against it
    o.append('<rect x="380" y="292" width="92" height="64" rx="3" fill="var(--snug-table)"/>')
    o.append('<path d="M382 293 H470" stroke="var(--snug-rim)" stroke-width="1.5"/>')
    o.append('<path d="M380 314 H472 M380 336 H472" stroke="var(--snug-stone2)" stroke-width="2"/>')
    o.append('<rect x="386" y="270" width="80" height="22" rx="4" fill="var(--snug-plinth)" '
             'stroke="var(--snug-rim)" stroke-width="1"/>')
    o.append('<ellipse cx="416" cy="276" rx="25" ry="6" fill="var(--snug-vinyl)"/>')
    o.append('<ellipse cx="416" cy="276" rx="7" ry="2" fill="var(--snug-label)"/>')
    o.append('<path d="M456 270 L432 278" stroke="var(--snug-arm)" stroke-width="2.5" stroke-linecap="round"/>')
    for x, tone in ((476, "--snug-sleeve-c"), (484, "--snug-sleeve-a"), (492, "--snug-sleeve-b")):
        o.append(f'<rect x="{x}" y="306" width="38" height="50" fill="var({tone})"/>')
    # the blankets, heaped to curl up in, and a cushion
    o.append(fluffy(566, 380, 106, 76, 15, "--snug-knit", r))
    o.append(fluffy(626, 388, 90, 56, 13, "--snug-wool", r))
    o.append(fluffy(548, 398, 82, 40, 12, "--snug-fleece", r))
    o.append('<ellipse cx="664" cy="352" rx="30" ry="18" fill="var(--snug-wool)"/>')
    # the low table, and what is on it
    o.append('<rect x="688" y="300" width="200" height="12" rx="3" fill="var(--snug-table)"/>')
    o.append('<path d="M690 301 H886" stroke="var(--snug-rim)" stroke-width="1.5"/>')
    o.append('<rect x="700" y="312" width="9" height="46" fill="var(--snug-table)"/>')
    o.append('<rect x="868" y="312" width="9" height="46" fill="var(--snug-table)"/>')
    # two bottles of wine
    for bx, tall in ((708, 70), (734, 60)):
        top = 300 - tall
        o.append(f'<path d="M{bx - 10} 300 V{top + 26} Q{bx - 10} {top + 14} {bx - 4} {top + 10} V{top} '
                 f'H{bx + 4} V{top + 10} Q{bx + 10} {top + 14} {bx + 10} {top + 26} V300 Z" '
                 'fill="var(--snug-bottle)" stroke="var(--snug-glassline)" stroke-width="1.2"/>')
        o.append(f'<rect x="{bx - 8}" y="{top + 34}" width="16" height="18" fill="var(--snug-fleece)"/>')
    # a glass of wine
    o.append('<path d="M760 262 H782 Q782 284 771 286 Q760 284 760 262 Z" '
             'stroke="var(--snug-glassline)" stroke-width="1.2"/>')
    o.append('<path d="M761 272 H781 Q780 284 771 285 Q762 284 761 272 Z" fill="var(--snug-wine)"/>')
    o.append('<path d="M771 286 V299 M764 300 H778" stroke="var(--snug-glassline)" stroke-width="1.5"/>')
    # the coffee pot and two mugs, steaming
    o.append('<path d="M796 300 L800 268 H816 L820 300 Z" fill="var(--snug-arm)"/>')
    o.append('<path d="M799 268 L802 254 H814 L817 268 Z" fill="var(--snug-arm)"/>')
    o.append('<rect x="805" y="248" width="6" height="7" fill="var(--snug-arm)"/>')
    o.append('<path d="M820 276 Q830 280 820 292" stroke="var(--snug-arm)" stroke-width="3"/>')
    for mx in (832, 852):
        o.append(f'<rect x="{mx}" y="282" width="14" height="18" rx="2" fill="var(--snug-label)"/>')
        o.append(f'<path d="M{mx + 14} 286 Q{mx + 20} 291 {mx + 14} 296" stroke="var(--snug-label)" stroke-width="2"/>')
        o.append(f'<path d="M{mx + 4} 278 Q{mx + 1} 272 {mx + 5} 266 Q{mx + 9} 260 {mx + 6} 254" '
                 'stroke="var(--snug-dim)" stroke-width="1.4" opacity=".55"/>')
    # a jar of weed
    o.append('<rect x="868" y="270" width="22" height="30" rx="4" stroke="var(--snug-glassline)" stroke-width="1.2"/>')
    o.append('<rect x="866" y="264" width="26" height="7" rx="2" fill="var(--snug-arm)"/>')
    for bx, by, br in ((874, 292, 4.5), (883, 293, 4), (878, 285, 4.2), (886, 284, 3.4), (872, 282, 3.2)):
        o.append(f'<circle cx="{bx}" cy="{by}" r="{br}" fill="var(--snug-bud)"/>')
    # candles on the table
    for cx, w, tall in ((750, 10, 24), (788, 8, 16)):
        o.append(candle(cx, 300, w, tall, "snug-s", glow=1.1))
    # an abundance of snacks, on the floor in front of everything
    def bowl(cx, rx):
        return (f'<path d="M{cx - rx} 412 Q{cx} {412 + rx * .7:.1f} {cx + rx} 412 Z" fill="var(--snug-label)"/>')
    # popcorn
    o.append(bowl(690, 26))
    for _ in range(16):
        o.append(f'<circle cx="{690 + r.uniform(-21, 21):.1f}" cy="{410 - r.uniform(0, 10):.1f}" '
                 f'r="{r.uniform(3.2, 4.8):.1f}" fill="var(--snug-fleece)"/>')
    # crisps
    o.append(bowl(750, 22))
    for _ in range(9):
        o.append(f'<ellipse cx="{750 + r.uniform(-17, 17):.1f}" cy="{410 - r.uniform(0, 7):.1f}" '
                 f'rx="{r.uniform(4, 6):.1f}" ry="2.6" fill="var(--snug-gold)"/>')
    # grapes
    for gx, gy in ((800, 404), (807, 404), (814, 404), (803.5, 397), (810.5, 397), (807, 390), (818, 410), (796, 410)):
        o.append(f'<circle cx="{gx}" cy="{gy}" r="4" fill="var(--snug-grape)"/>')
    # strawberries and chocolate on a plate
    o.append('<ellipse cx="852" cy="414" rx="34" ry="7" fill="var(--snug-label)"/>')
    for sx in (834, 846):
        o.append(f'<path d="M{sx - 5} 404 Q{sx} 418 {sx + 5} 404 Z" fill="var(--snug-berry)"/>')
        o.append(f'<path d="M{sx - 4} 404 H{sx + 4}" stroke="var(--snug-bud)" stroke-width="2"/>')
    for cx in (858, 868, 878):
        o.append(f'<rect x="{cx - 4}" y="402" width="9" height="9" rx="1" fill="var(--snug-choc)"/>')
    # cookies by the blankets
    for cx, cy in ((452, 412), (468, 418), (440, 420)):
        o.append(f'<circle cx="{cx}" cy="{cy}" r="7" fill="var(--snug-gold)"/>')
        o.append(f'<circle cx="{cx - 2}" cy="{cy - 2}" r="1.3" fill="var(--snug-choc)"/>')
        o.append(f'<circle cx="{cx + 2.5}" cy="{cy + 1.5}" r="1.3" fill="var(--snug-choc)"/>')
    o.append("</svg>")
    return "".join(o)


def turntable():
    """The record player, which is close, and so the one thing in focus: a
    plinth with the candles' light along its top edge, a platter, a record with
    its grooves and a pale label, and the tonearm resting on it."""
    out = ['<svg class="snug-deck__draw" viewBox="0 0 520 230" fill="none" '
           'focusable="false" aria-hidden="true">',
           '<rect x="20" y="40" width="480" height="172" rx="16" fill="var(--snug-plinth)" '
           'stroke="var(--snug-rim)" stroke-width="1.5"/>',
           '<path d="M36 41 H484" stroke="var(--snug-rim)" stroke-width="2.5" stroke-linecap="round"/>',
           '<ellipse cx="200" cy="128" rx="152" ry="74" fill="var(--snug-platter)"/>',
           '<ellipse cx="200" cy="124" rx="142" ry="68" fill="var(--snug-vinyl)"/>']
    for rx in range(134, 50, -7):
        out.append(f'<ellipse cx="200" cy="124" rx="{rx}" ry="{rx * .48:.1f}" '
                   'stroke="var(--snug-groove)" stroke-width=".9"/>')
    out += ['<path d="M108 92 Q150 72 196 70" stroke="var(--snug-amber)" stroke-width="3" '
            'stroke-linecap="round" opacity=".45"/>',
            '<ellipse cx="200" cy="124" rx="40" ry="19" fill="var(--snug-label)"/>',
            '<ellipse cx="200" cy="124" rx="3.4" ry="1.8" fill="var(--snug-vinyl)"/>',
            '<circle cx="432" cy="76" r="18" fill="var(--snug-arm)"/>',
            '<circle cx="454" cy="62" r="11" fill="var(--snug-arm)"/>',
            '<path d="M432 76 L318 150" stroke="var(--snug-arm)" stroke-width="6" stroke-linecap="round"/>',
            '<path d="M318 150 L298 160 L304 170 L326 158 Z" fill="var(--snug-arm)"/>',
            '<circle cx="462" cy="186" r="11" fill="var(--snug-arm)"/>',
            '<circle cx="428" cy="186" r="11" fill="var(--snug-arm)"/>',
            "</svg>"]
    return "".join(out)


def type_credit(faces, a, b):
    fa, fb = faces[a], faces[b]
    lic = (f"both under the {fa['licence']}" if fa["licence"] == fb["licence"]
           else f"under the {fa['licence']} and the {fb['licence']}")
    return (f"Set in {esc(fa['family'])}, drawn by {esc(fa['designer'])}, and "
            f"{esc(fb['family'])}, drawn by {esc(fb['designer'])}, {lic}; both are on the "
            f"street already, and the <a href=\"foundry.html\">Foundry</a> has them.")


def main():
    data = json.loads(DATA.read_text())
    faces = json.loads(FACES.read_text())["faces"]
    door_name, inside_name = data["door"], data["inside"]
    door_p, inside_p = ROOT / door_name, ROOT / inside_name
    word = inside_name.removesuffix(".html")
    if not re.fullmatch(r"[a-z]+", word):
        refuse(f"the inside's address is {inside_name}, and the door builds an address from letters "
               "alone, so it would never get there.")

    # ── the albums ────────────────────────────────────────────────────────────
    if data.get("channel_id") != "UCqNxhPZoLJ81i5QaK4nqn8A" or data.get("artist") != "Cigarettes After Sex":
        refuse("the rack is Cigarettes After Sex's records off the band's own channel, and the file "
               "names another artist or channel.")
    if data.get("words_by") not in ("anonymous",) and not str(data.get("words_by", "")).strip():
        refuse("whose words the cabin prints is empty. Name them, or say anonymous on purpose.")
    rack, secs = [], {}
    for a in data["albums"]:
        where = f"{DATA.name}, {a.get('title')!r}"
        extra = set(a) - ALBUM_KEYS
        if extra:
            refuse(f"{where} carries {', '.join(sorted(extra))}, which this rack does not know. A song's "
                   "words are not a field here, and nothing musical is hosted on this street.")
        if not LIST.fullmatch(a.get("list", "")):
            refuse(f"{where}: {a.get('list')!r} is not one of YouTube's album lists.")
        if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", a.get("released", "")) or not a.get("label") \
                or not re.fullmatch(r"[0-9a-f-]{36}", a.get("musicbrainz", "")):
            refuse(f"{where} has no release date, label or MusicBrainz record. The year on a record "
                   "is the record's, read off MusicBrainz, never the upload's.")
        if a.get("sleeve") not in ("a", "b", "c"):
            refuse(f"{where} has no sleeve this room draws.")
        if not a.get("tracks"):
            refuse(f"{where} has no tracks, so there is nothing to add up into a runtime.")
            continue
        for t in a["tracks"]:
            if set(t) != TRACK_KEYS or not VIDEO.fullmatch(t["id"]) or not (
                    isinstance(t["seconds"], int) and 30 <= t["seconds"] <= 1800):
                refuse(f"{where}: a track is not an id, a title and a length in seconds: {t!r}")
        secs[a["title"]] = sum(t["seconds"] for t in a["tracks"] if isinstance(t.get("seconds"), int))
        rack.append(a)
    if problems:
        raise SystemExit("REFUSING:\n  " + "\n  ".join(problems))

    cards = []
    for a in rack:
        s, n = secs[a["title"]], len(a["tracks"])
        film = f"{a['title']}, by {data['artist']}"
        src = f"https://www.youtube-nocookie.com/embed/videoseries?list={a['list']}&amp;autoplay=1&amp;rel=0"
        songs = (WORDS[n - 1] if n <= len(WORDS) else str(n)).capitalize()
        # EVERY SONG HAS ITS OWN PLAY BUTTON on the back of its sleeve, a single
        # video with its runtime, because a song in an album list has no button
        # of its own, and Follow and Catch up find a host's film by its button
        # (filmButton in cb.js). Without these, somebody following a host who has
        # a record on is told what to do instead of having the song got ready.
        tracks = "\n".join(
            f'          <li><span class="snug-song">{esc(t["title"])}</span> '
            f'<span class="snug-t">{clock(t["seconds"])}</span>\n'
            f'            <button type="button" class="facade" data-embed-id="{t["id"]}" '
            f'data-embed-title="{esc(t["title"])}, by {esc(data["artist"])}">Play this song &mdash; '
            f'{mins(t["seconds"])}</button></li>' for t in a["tracks"])
        cards.append(
            f'    <li class="snug-record" data-rack-card>\n'
            f'      <div class="snug-sleeve snug-sleeve--{a["sleeve"]}" aria-hidden="true"></div>\n'
            f'      <div class="snug-record__words">\n'
            f'        <h3>{esc(a["title"])}</h3>\n'
            f'        <p class="snug-record__by">{esc(data["artist"])} &middot; {a["released"][:4]} '
            f'&middot; {esc(a["label"])}</p>\n'
            f'        <p class="snug-record__runs">{songs} songs, {mins(s)} all told.</p>\n'
            f'        <button type="button" class="snug-put" hidden data-rack-to="snug-turntable" '
            f'data-rack-name="the turntable" data-rack-src="{src}" '
            f'data-rack-title="{esc(film)}, on YouTube, on the turntable" data-rack-film="{esc(film)}" '
            f'data-rack-runtime="{mins(s)}">Put it on the turntable &mdash; {mins(s)}</button>\n'
            f'        <details class="snug-back" open>\n'
            f'          <summary>The back of the sleeve</summary>\n'
            f'          <ol>\n{tracks}\n          </ol>\n'
            f'        </details>\n'
            f'        <p class="snug-record__out"><a href="https://www.youtube.com/playlist?list={a["list"]}">'
            f'The whole album on YouTube</a></p>\n'
            f'      </div>\n'
            f'    </li>')
    rack_html = '  <ul class="snug-rack">\n' + "\n".join(cards) + "\n  </ul>"

    # ── the pages ─────────────────────────────────────────────────────────────
    door = door_p.read_text()
    door = put(door, "scene", door_scene(), door_name)
    door = put(door, "type", "    " + type_credit(faces, "cinzel", "hanken-grotesk"), door_name)
    inside = inside_p.read_text()
    inside = put(inside, "glow", bokeh(), inside_name)
    inside = put(inside, "scene", cabin(), inside_name)
    inside = put(inside, "deck", turntable(), inside_name)
    inside = put(inside, "rack", rack_html, inside_name)
    inside = put(inside, "type", "    " + type_credit(faces, "comfortaa", "figtree"), inside_name)
    if data["words_by"] == "anonymous" and "names nobody" not in inside:
        refuse(f"{inside_name} does not say that it names nobody as the author of its words, and the "
               "credit for them is anonymous on purpose. Say so on the page.")

    # ── the door's word ───────────────────────────────────────────────────────
    js = DOORJS.read_text()
    digest = hashlib.sha256(word.encode()).hexdigest()
    line = f"  var WORD = '{digest}';"
    js, n = re.subn(r"(// door:word:begin\n).*?(\n\s*// door:word:end)",
                    lambda m: m.group(1) + line + m.group(2), js, flags=re.S)
    if n != 1:
        refuse(f"{DOORJS.name} needs exactly one pair of door:word markers.")

    # ── what both pages promise ───────────────────────────────────────────────
    for name, src in ((door_name, door), (inside_name, inside)):
        if not unlisted.is_unlisted(src):
            refuse(f"{name} has no data-unlisted on its <body>, so every list on the street would "
                   "take it.")
        if not unlisted.NOINDEX.search(src):
            refuse(f"{name} has no noindex.")
        if 'data-cb="off"' in src:
            refuse(f"{name} switches the radio off. Ryan's call is that it comes in with all the "
                   "usual amenities, kept quiet: this room's channel, Be seen here, its call and "
                   "hosting, told only to radios in here (QUIET_ROOMS in netlify/cb/lib.mjs).")
    sitemap = (ROOT / "tools/make-sitemap.py").read_text()
    order = sitemap.split("ORDER = [", 1)[1].split("]\n", 1)[0]
    for name in (door_name, inside_name):
        if f'"{name}"' in order:
            refuse(f"{name} is in make-sitemap.py's walking order, which is a list.")
    for name, text in ((door_name, door), (DOORJS.name, js)):
        if re.search(rf"(?<![a-z]){word}(?![a-z])", text, re.I):
            refuse(f"{name} contains the inside's address. The door holds the word's hash and nothing "
                   "else, so the only way through is to say it.")
    # ── the flicker: a candle, never a flash ──────────────────────────────────
    cjs = (ROOT / "candles.js").read_text()
    dim = re.search(r"var DIM = ([0-9.]+);", cjs)
    hz = re.search(r"var HZ = \[([0-9., ]+)\];", cjs)
    if not (dim and hz):
        refuse("candles.js has lost DIM or HZ, so nothing here can say how much or how fast a flame moves.")
    else:
        dim, hz = float(dim.group(1)), [float(x) for x in hz.group(1).split(",")]
        if dim > 0.1 or max(hz) > 2.5:
            refuse(f"candles.js dims a flame by {dim} of itself, or wobbles it {max(hz)} times a second. The "
                   "line is a tenth and two and a half: a candle, never a flash.")
        css = (ROOT / "love.css").read_text()
        ink = lambda name: re.search(rf"{name}:\s*(#[0-9A-Fa-f]{{6}})", css).group(1)
        worst = 0.0
        for fg, bg in (("--snug-amber", "--snug-dark"), ("--snug-rose", "--snug-dark"),
                       ("--snug-gold", "--snug-dark"), ("--snug-ember", "--snug-vinyl"),
                       ("--wd-glow", "--wd-night")):
            worst = max(worst, dim * (lum(ink(fg)) - lum(ink(bg))))
        # WCAG 2.3.1 counts a flash from a change of a tenth of the brightest white.
        if worst >= 0.08:
            refuse(f"the dimmest flame changes the brightness under it by {worst:.3f}, too near the 0.1 WCAG "
                   "counts as a flash. Dim it less.")
    for bad in ("localStorage", "sessionStorage", "fetch(", "XMLHttpRequest", "sendBeacon", "rotate", "skew"):
        if bad in cjs:
            refuse(f"candles.js uses {bad}. It keeps nothing, sends nothing, and moves a flame only by "
                   "scale, which is all check-gentle.py can be asked to read.")
    for name, text in ((door_name, door), (inside_name, inside)):
        if 'src="candles.js"' not in text:
            refuse(f"{name} does not load candles.js, so its flames never flicker.")
    if not re.search(r'<button type="button" class="snug-put snug-candles" data-candles hidden aria-pressed="false">', inside):
        refuse(f"{inside_name}'s Let the candles flicker ships shown, or is gone. It ships hidden and "
               "candles.js shows it, so a page with no script shows no button that does nothing.")

    if f'src="{DOORJS.name}"' not in door:
        refuse(f"{door_name} does not load {DOORJS.name}, so the door cannot hear the word.")
    for s in ("love-embed.js", "rack.js"):
        if f'src="{s}"' not in inside:
            refuse(f"{inside_name} does not load {s}, so the turntable would not turn.")

    if problems:
        raise SystemExit("REFUSING:\n  " + "\n  ".join(problems))
    changed = 0
    for p, text in ((door_p, door), (inside_p, inside), (DOORJS, js)):
        if p.read_text() != text:
            p.write_text(text)
            changed += 1
    print(f"secret cabin: the door and the inside drawn, {len(rack)} records on the rack "
          f"({', '.join(mins(secs[a['title']]) for a in rack)}), {changed} file(s) rewritten")
    return 0


if __name__ == "__main__":
    sys.exit(main())
