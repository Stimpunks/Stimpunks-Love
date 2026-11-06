#!/usr/bin/env python3
"""Build the Scalable Feast Ballroom out of data/ballroom.json.

Ryan's brief, 2026-11-06: a big comfortable ballroom, both cozy and grand; a
grand ceiling with chandeliers, gilt and parquet; canopies, tents and cabanas
at each end of the ballroom for refuge at human scale; living room areas
amidst the tents with couches, chairs and rugs; plush furnishings and soft
fabrics; and on the web page, the grand size shown by scrolling down.

ONE DATA FILE, ONE TOOL. This writes into scalable-feast-ballroom.html, between
sfb: markers, the ceiling, the height (the long scroll between the ceiling and
the floor, with a plaque at each level and the chandeliers on their chains),
the floor with every canopy drawn standing on it, both ends of the room, the
floor's words and the two quotations. Do not hand-edit between the markers.
THE DRAWING OF THE FLOOR IS MADE FROM THE SAME LIST AS THE CARDS, so a canopy
cannot be on the page and missing from the picture, or the other way round.

IT REFUSES, rather than writing something that looks right:
  - AN END WITH NO CANOPY. The brief puts them at EACH end, so somebody at
    either end of the floor has one near them.
  - TWO CANOPIES ALIKE: the same kind or the same cloth. No two rooms on this
    street are alike, and no two refuges in this one.
  - A CANOPY WITH NOWHERE TO SIT OR NOTHING SOFT UNDERFOOT. Every one is a
    living room: a seat, a rug and something soft, or it is a tent to stand in.
  - A KIND OF CANOPY THIS TOOL HAS NO DRAWING FOR, the guild's rule: guessing
    would put one shared shape at both ends.
  - THE HEIGHT OUT OF ORDER. The plaques go down the page from the ceiling to
    the tops of the canopies, because the scroll IS the height.
  - A QUOTATION NOT WORD FOR WORD ON OUR OWN PAGE. Both are Terrapin Bright
    Green's, read on our Biophilic Design glossary entry, and checked against
    the Knowledge System mirror's copy of it whenever the mirror is on this
    machine (the Town Hall's rule: when our page changes, re-copy; never
    loosen).
  - A GUEST LIST, in the room's own voice. A ballroom is exactly the shape of
    room that grows one, and a dress code, tickets, a VIP rope, a dance card
    and a word for whoever sits out: guest list, dress code, black tie, invite
    only, ticket, VIP, RSVP, reserved, exclusive, dance card, wallflower, belle
    of the ball, best dressed. Swept with the negation window every sweep here
    carries, so the house can still say out loud that it has none.
  - A COUNT, of guests, places, dances or canopies: nothing in here is
    counted (the street's rule, and check-counts.py's for the canopies).
  - A PAGE WITH NO WAY STRAIGHT DOWN TO THE FLOOR above the height, or no way
    back up after it. The long scroll is the room's grandeur, and nobody has
    to scroll it: the link past it is part of the design, not an apology.
  - MOTION IN §150 THAT IS NOT MAX GLITTER'S. The glints on the gilt and the
    crystal brighten and fade slowly at MAX and nowhere else; nothing in the
    ballroom moves at Gentle or Regular, and nothing flashes at any setting.
"""
import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "ballroom.json"
PAGE = ROOT / "scalable-feast-ballroom.html"
CSS = ROOT / "love.css"
MIRROR = Path.home() / "Documents/Claude/Projects/Stimpunks Knowledge System/site/stimpunks.org"

ENDS = ("west", "east")
CLOTHS = ("rose", "teal", "plum", "saffron", "sage", "blue")
LEVELS = ["the-ceiling", "the-cornice", "the-mirrors", "the-chandeliers", "the-canopies"]

problems = []
GUEST = re.compile(r"\b(?:guest[- ]?lists?|dress[- ]codes?|black[- ]tie|white[- ]tie|invit(?:e|ation)[- ]only|tickets?|vip|rsvp|reserved|exclusive|dance[- ]cards?|wallflowers?|belle of the ball|best[- ]dressed)\b", re.I)
TALLY = re.compile(r"\b(?:\d+|one hundred|a hundred|thousand)\s+(?:guests?|places?|seats?|dances?|canopies|tents|people)\b|\bheadcount\b|\bcapacity\b", re.I)
NEGATION = re.compile(r"\b(?:nothing|no|never|not|nobody|without|none|neither|nor)\b", re.I)


def refuse(msg):
    problems.append(msg)


def esc(s):
    return html.escape(str(s), quote=False)


def attr(s):
    return html.escape(str(s), quote=True)


def between(a, b):
    """How the data names the hall between two canopies."""
    low = lambda t: t["name"].replace("The ", "the ", 1)
    return f"between {low(a)} and {low(b)}"


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


# ── The drawings ──────────────────────────────────────────────────────────────
# Every colour is a §150 custom property, by name. The glints carry the class
# sfb-glint, which is the one thing in §150 that moves, and only at MAX.

def glint(x, y, r=7, delay=0.0):
    return (f'<path class="sfb-glint" style="animation-delay:-{delay:.1f}s" '
            f'd="M{x} {y - r} L{x + r * .22:.1f} {y - r * .22:.1f} L{x + r} {y} L{x + r * .22:.1f} {y + r * .22:.1f} '
            f'L{x} {y + r} L{x - r * .22:.1f} {y + r * .22:.1f} L{x - r} {y} L{x - r * .22:.1f} {y - r * .22:.1f} Z" '
            f'fill="var(--sfb-glint)"/>')


def chain(x, y0, y1):
    out, y, k = [], y0, 0
    while y < y1:
        if k % 2:
            out.append(f'<ellipse cx="{x}" cy="{y + 6}" rx="2.2" ry="6" fill="none" stroke="var(--sfb-gilt-dark)" stroke-width="2"/>')
        else:
            out.append(f'<ellipse cx="{x}" cy="{y + 6}" rx="4.4" ry="6" fill="none" stroke="var(--sfb-gilt)" stroke-width="2.2"/>')
        y += 10
        k += 1
    return "".join(out)


def chandelier(cx, top, s=1.0, seed=0):
    """A crystal chandelier hung from (cx, top): a gilt stem with knops, two
    tiers of arms, a crystal globe on every arm (electric, steady, no flame),
    festoons of beads swagged between the arms and drops hanging below."""
    g = []
    def X(v): return cx + v * s
    def Y(v): return top + v * s
    g.append(f'<path d="M{X(-6)} {Y(0)} L{X(6)} {Y(0)} L{X(4)} {Y(40)} L{X(-4)} {Y(40)} Z" fill="var(--sfb-gilt)" stroke="var(--sfb-gilt-dark)" stroke-width="1.2"/>')
    for ky, rx in ((14, 9), (40, 13), (78, 16), (118, 11)):
        g.append(f'<ellipse cx="{X(0)}" cy="{Y(ky)}" rx="{rx * s:.1f}" ry="{6 * s:.1f}" fill="var(--sfb-gilt)" stroke="var(--sfb-gilt-dark)" stroke-width="1.2"/>')
    g.append(f'<rect x="{X(-3)}" y="{Y(40)}" width="{6 * s:.1f}" height="{100 * s:.1f}" fill="var(--sfb-gilt)" stroke="var(--sfb-gilt-dark)" stroke-width="1"/>')
    # The tiers: each a ring of arms curling out and up to a globe.
    for tier, (ty, reach, n, lift) in enumerate(((70, 86, 6, 26), (112, 112, 8, 30))):
        ends = []
        for i in range(n):
            t = i / (n - 1)
            ex = X(-reach + 2 * reach * t)
            # The arms nearer the middle are further away in depth, so a touch higher.
            depth = 1 - abs(2 * t - 1)
            ey = Y(ty - lift - depth * 8)
            ends.append((ex, ey))
            g.append(f'<path d="M{X(0)} {Y(ty)} C{X(0) + (ex - X(0)) * .5:.1f} {Y(ty + 14)} {ex:.1f} {Y(ty + 8)} {ex:.1f} {ey + 8 * s:.1f}" fill="none" stroke="var(--sfb-gilt)" stroke-width="{3.2 * s:.1f}" stroke-linecap="round"/>')
            g.append(f'<path d="M{ex - 7 * s:.1f} {ey + 8 * s:.1f} L{ex + 7 * s:.1f} {ey + 8 * s:.1f} L{ex + 4 * s:.1f} {ey + 13 * s:.1f} L{ex - 4 * s:.1f} {ey + 13 * s:.1f} Z" fill="var(--sfb-gilt)" stroke="var(--sfb-gilt-dark)" stroke-width=".8"/>')
            g.append(f'<circle cx="{ex:.1f}" cy="{ey:.1f}" r="{7.5 * s:.1f}" fill="var(--sfb-crystal)" stroke="var(--sfb-glass-edge)" stroke-width="1"/>')
        # Festoons of beads between neighbouring arms, and a drop under each.
        for (ax, ay), (bx, by) in zip(ends, ends[1:]):
            for k in range(1, 6):
                u = k / 6
                bxk = ax + (bx - ax) * u
                byk = ay + 14 * s + (by - ay) * u + 16 * s * (1 - (2 * u - 1) ** 2)
                g.append(f'<circle cx="{bxk:.1f}" cy="{byk:.1f}" r="{1.9 * s:.1f}" fill="var(--sfb-crystal)" stroke="var(--sfb-glass-edge)" stroke-width=".7"/>')
        for ex, ey in ends:
            g.append(f'<path d="M{ex:.1f} {ey + 13 * s:.1f} L{ex + 3 * s:.1f} {ey + 22 * s:.1f} L{ex:.1f} {ey + 30 * s:.1f} L{ex - 3 * s:.1f} {ey + 22 * s:.1f} Z" fill="var(--sfb-crystal)" stroke="var(--sfb-glass-edge)" stroke-width=".8"/>')
    # The crown of drops under the bowl, and the last long drop.
    for i in range(-4, 5):
        dx, dl = X(i * 6), (22 - abs(i) * 3)
        g.append(f'<line x1="{dx:.1f}" y1="{Y(124)}" x2="{dx:.1f}" y2="{Y(124 + dl)}" stroke="var(--sfb-glass-edge)" stroke-width="{1.1 * s:.1f}"/>')
        g.append(f'<path d="M{dx:.1f} {Y(124 + dl)} l{3 * s:.1f} {6 * s:.1f} l{-3 * s:.1f} {6 * s:.1f} l{-3 * s:.1f} {-6 * s:.1f} Z" fill="var(--sfb-crystal)" stroke="var(--sfb-glass-edge)" stroke-width=".7"/>')
    g.append(f'<path d="M{X(0)} {Y(148)} l{5 * s:.1f} {12 * s:.1f} l{-5 * s:.1f} {14 * s:.1f} l{-5 * s:.1f} {-14 * s:.1f} Z" fill="var(--sfb-crystal)" stroke="var(--sfb-glass-edge)" stroke-width=".9"/>')
    for j, (gx, gy) in enumerate(((-60, 46), (34, 30), (70, 90), (-96, 96), (6, 104), (100, 70))):
        g.append(glint(round(X(gx), 1), round(Y(gy), 1), 6 * s, delay=(seed * 1.7 + j * 1.3) % 7))
    return "".join(g)


def ceiling_svg():
    W, H = 1200, 400
    g = [f'<svg class="sfb-ceiling__draw" viewBox="0 0 {W} {H}" aria-hidden="true" focusable="false">',
         f'<rect width="{W}" height="{H}" fill="var(--sfb-panel)"/>']
    # The coffers, gilt-edged, a rosette in each.
    for row, y in enumerate((14, 96, 178)):
        for col in range(12):
            x = 8 + col * 99
            g.append(f'<rect x="{x}" y="{y}" width="86" height="72" fill="var(--sfb-ceiling)" stroke="var(--sfb-gilt)" stroke-width="3"/>')
            g.append(f'<rect x="{x + 8}" y="{y + 8}" width="70" height="56" fill="none" stroke="var(--sfb-gilt-dark)" stroke-width="1"/>')
            g.append(f'<circle cx="{x + 43}" cy="{y + 36}" r="9" fill="var(--sfb-gilt)" stroke="var(--sfb-gilt-dark)" stroke-width="1"/>')
            g.append(f'<circle cx="{x + 43}" cy="{y + 36}" r="3.5" fill="var(--sfb-gilt-hi)"/>')
    # The painted sky in the middle of it, framed in gilt, with its clouds.
    g.append('<ellipse cx="600" cy="132" rx="330" ry="112" fill="var(--sfb-sky)"/>')
    for cx_, cy_, rx_ in ((420, 120, 70), (470, 104, 52), (700, 150, 84), (760, 132, 50), (560, 70, 44), (840, 92, 40), (380, 170, 40)):
        g.append(f'<ellipse cx="{cx_}" cy="{cy_}" rx="{rx_}" ry="{rx_ * .36:.0f}" fill="var(--sfb-cloud)"/>')
        g.append(f'<ellipse cx="{cx_ + rx_ * .3:.0f}" cy="{cy_ - rx_ * .2:.0f}" rx="{rx_ * .55:.0f}" ry="{rx_ * .3:.0f}" fill="var(--sfb-cloud)"/>')
    g.append('<ellipse cx="600" cy="132" rx="330" ry="112" fill="none" stroke="var(--sfb-gilt)" stroke-width="18"/>')
    g.append('<ellipse cx="600" cy="132" rx="318" ry="100" fill="none" stroke="var(--sfb-gilt-hi)" stroke-width="3"/>')
    g.append('<ellipse cx="600" cy="132" rx="342" ry="124" fill="none" stroke="var(--sfb-gilt-dark)" stroke-width="2"/>')
    # The cornice, gilt, egg and dart along it.
    g.append(f'<rect x="0" y="258" width="{W}" height="46" fill="var(--sfb-gilt)"/>')
    g.append(f'<rect x="0" y="258" width="{W}" height="5" fill="var(--sfb-gilt-dark)"/>')
    g.append(f'<rect x="0" y="299" width="{W}" height="5" fill="var(--sfb-gilt-dark)"/>')
    for x in range(14, W, 28):
        g.append(f'<ellipse cx="{x}" cy="281" rx="9" ry="12" fill="var(--sfb-gilt-hi)" stroke="var(--sfb-gilt-dark)" stroke-width="1.2"/>')
        g.append(f'<path d="M{x + 14} 270 L{x + 17} 286 L{x + 14} 294 L{x + 11} 286 Z" fill="var(--sfb-gilt-dark)"/>')
    # Under the cornice, the tops of the tall arched mirrors and the gilt
    # capitals of the pilasters between them.
    for i, x in enumerate(range(20, W, 200)):
        g.append(f'<rect x="{x}" y="304" width="44" height="{H - 304}" fill="var(--sfb-wall)"/>')
        g.append(f'<path d="M{x - 8} 304 h60 v16 h-60 Z" fill="var(--sfb-gilt)" stroke="var(--sfb-gilt-dark)" stroke-width="1"/>')
        g.append(f'<path d="M{x + 2} 320 q20 14 40 0" fill="none" stroke="var(--sfb-gilt-dark)" stroke-width="2"/>')
        mx = x + 70
        g.append(f'<path d="M{mx} {H} V360 A60 44 0 0 1 {mx + 120} 360 V{H} Z" fill="var(--sfb-glass)" stroke="var(--sfb-gilt)" stroke-width="7"/>')
        g.append(f'<path d="M{mx + 20} {H} V362 A40 30 0 0 1 {mx + 46} 334" fill="none" stroke="var(--sfb-crystal)" stroke-width="3"/>')
    # The ceiling roses and the chains going down out of the picture.
    for x in (200, 600, 1000):
        g.append(f'<circle cx="{x}" cy="132" r="26" fill="var(--sfb-gilt)" stroke="var(--sfb-gilt-dark)" stroke-width="2"/>')
        g.append(f'<circle cx="{x}" cy="132" r="13" fill="var(--sfb-gilt-hi)" stroke="var(--sfb-gilt-dark)" stroke-width="1"/>')
        g.append(chain(x, 158, H))
    for j, (gx, gy) in enumerate(((268, 132), (932, 132), (600, 22), (600, 244), (160, 281), (1046, 281), (380, 281), (820, 281))):
        g.append(glint(gx, gy, 8, delay=j * 0.9))
    g.append("</svg>")
    return "".join(g)


def height_block(d):
    """The long scroll from the ceiling to the floor: the wall's pilasters and
    mirrors are love.css's (the section's ::before, so nothing stands under a
    word), the chains and the chandeliers are here, and a plaque at each level
    says where you are in the height."""
    out = ['  <div class="sfb-height" id="sfb-height">',
           '    <div class="sfb-height__wall" aria-hidden="true">']
    for side in ("near", "far"):
        out.append(f'      <span class="sfb-mirror sfb-mirror--{side}"></span>')
    for i, side in enumerate(("a", "b")):
        out.append(f'      <span class="sfb-chain sfb-chain--{side}"></span>')
        out.append(f'      <svg class="sfb-chandelier sfb-chandelier--{side}" viewBox="-130 -6 260 196" focusable="false">{chain(0, -6, 0)}{chandelier(0, 0, 1.0, seed=i + 2)}</svg>')
    out.append('    </div>')
    out.append('    <ol class="sfb-levels">')
    for i, lv in enumerate(d["height"]):
        out.append(f'      <li class="sfb-level sfb-level--{i + 1}" id="sfb-{attr(lv["at"])}"><p class="sfb-level__said">{esc(lv["said"])}</p></li>')
    out.append('    </ol>')
    out.append('  </div>')
    return "\n".join(out)


def tent_svg(t, x, w, base, top):
    """One canopy standing on the floor, its kind drawn, its cloth its own
    colour and the light inside it the pale of that cloth."""
    c, p = f"var(--sfb-{t['cloth']})", f"var(--sfb-{t['cloth']}-pale)"
    k, g = t["kind"], []
    mid = x + w / 2
    h = base - top
    def seat(sx, sw, sy):
        # A sofa seen from the front: plush back, arms and a seat, cushions.
        return (f'<rect x="{sx}" y="{sy - 26}" width="{sw}" height="26" rx="8" fill="var(--sfb-velvet)"/>'
                f'<rect x="{sx - 4}" y="{sy - 16}" width="10" height="22" rx="4" fill="var(--sfb-velvet)"/>'
                f'<rect x="{sx + sw - 6}" y="{sy - 16}" width="10" height="22" rx="4" fill="var(--sfb-velvet)"/>'
                f'<rect x="{sx + 4}" y="{sy - 8}" width="{sw - 8}" height="10" rx="3" fill="var(--sfb-plush)"/>'
                f'<circle cx="{sx + 14}" cy="{sy - 16}" r="7" fill="var(--sfb-cream)"/>'
                f'<circle cx="{sx + sw - 14}" cy="{sy - 16}" r="7" fill="var(--sfb-cream)"/>')
    def rug(rx, rw, ry):
        return (f'<ellipse cx="{rx + rw / 2}" cy="{ry + 6}" rx="{rw / 2}" ry="8" fill="var(--sfb-rug)"/>'
                f'<ellipse cx="{rx + rw / 2}" cy="{ry + 6}" rx="{rw / 2 - 6}" ry="5" fill="none" stroke="var(--sfb-rug-2)" stroke-width="2"/>')
    if k == "cabana":
        g.append(f'<rect x="{x}" y="{top + 30}" width="{w}" height="{h - 30}" fill="{p}"/>')
        for i in range(0, int(w), 16):
            g.append(f'<rect x="{x + i}" y="{top + 30}" width="8" height="{min(28, h)}" fill="{c}"/>')
        g.append(rug(x + 10, w - 20, base - 6) + seat(x + 22, w - 44, base - 4))
        # The front, tied back on both sides: a triangle of stripes each side.
        for side in (0, 1):
            sx = x if side == 0 else x + w
            d = 1 if side == 0 else -1
            g.append(f'<path d="M{sx} {top + 30} L{sx + d * 34} {top + 30} Q{sx + d * 8} {top + 110} {sx} {base} Z" fill="{c}"/>')
            g.append(f'<path d="M{sx + d * 12} {top + 30} Q{sx + d * 4} {top + 100} {sx + d * 1} {base - 30}" fill="none" stroke="var(--sfb-cream)" stroke-width="5"/>')
            g.append(f'<circle cx="{sx + d * 8}" cy="{top + 120}" r="4" fill="var(--sfb-gilt)"/>')
        g.append(f'<rect x="{x - 6}" y="{top}" width="{w + 12}" height="30" fill="{c}"/>')
        for i in range(0, int(w + 12), 16):
            g.append(f'<rect x="{x - 6 + i}" y="{top}" width="8" height="30" fill="var(--sfb-cream)"/>')
        for i in range(0, int(w + 12), 18):
            g.append(f'<path d="M{x - 6 + i} {top + 30} q9 14 18 0 Z" fill="{c}"/>')
    elif k == "pavilion":
        g.append(f'<rect x="{x + 8}" y="{top + 70}" width="{w - 16}" height="{h - 70}" fill="{p}"/>')
        g.append(f'<rect x="{mid - 3}" y="{top + 20}" width="6" height="{h - 20}" fill="var(--sfb-gilt)"/>')
        g.append(rug(x + 4, w - 8, base - 6))
        g.append(f'<path d="M{x + 18} {base - 4} q{(w - 36) / 2} -40 {w - 36} 0 Z" fill="var(--sfb-velvet)"/>'
                 f'<rect x="{x + 18}" y="{base - 14}" width="{w - 36}" height="12" rx="5" fill="var(--sfb-plush)"/>')
        for i in range(4):
            g.append(f'<circle cx="{x + 30 + i * (w - 60) / 3:.1f}" cy="{base - 22}" r="6" fill="var(--sfb-cream)"/>')
        for side in (0, 1):
            sx = x + 8 if side == 0 else x + w - 8
            d = 1 if side == 0 else -1
            g.append(f'<path d="M{sx} {top + 70} L{sx + d * 24} {top + 70} Q{sx + d * 4} {top + 150} {sx} {base} Z" fill="{c}"/>')
        g.append(f'<path d="M{x - 6} {top + 74} L{mid} {top + 4} L{x + w + 6} {top + 74} Z" fill="{c}"/>')
        g.append(f'<path d="M{mid} {top + 4} L{mid - 8} {top + 74} M{mid} {top + 4} L{x + w * .25} {top + 74} M{mid} {top + 4} L{x + w * .75} {top + 74}" stroke="var(--sfb-ink)" stroke-opacity=".25" stroke-width="2"/>')
        for i in range(0, int(w + 12), 16):
            g.append(f'<path d="M{x - 6 + i} {top + 74} q8 13 16 0 Z" fill="{c}"/>')
        g.append(f'<path d="M{x - 6} {top + 74} H{x + w + 6}" stroke="var(--sfb-gilt)" stroke-width="3"/>')
        g.append(f'<circle cx="{mid}" cy="{top - 2}" r="6" fill="var(--sfb-gilt)" stroke="var(--sfb-gilt-dark)" stroke-width="1"/>'
                 f'<path d="M{mid} {top - 18} L{mid + 3} {top - 8} L{mid - 3} {top - 8} Z" fill="var(--sfb-gilt)"/>')
    elif k == "four-poster":
        g.append(f'<rect x="{x + 6}" y="{top + 34}" width="{w - 12}" height="{h - 34}" fill="{p}"/>')
        g.append(rug(x + 8, w - 16, base - 6))
        # The deep armchair, sideways on, and its footstool.
        g.append(f'<rect x="{x + 26}" y="{base - 62}" width="20" height="60" rx="8" fill="var(--sfb-velvet)"/>'
                 f'<rect x="{x + 30}" y="{base - 30}" width="50" height="26" rx="8" fill="var(--sfb-velvet)"/>'
                 f'<rect x="{x + 40}" y="{base - 40}" width="12" height="20" rx="5" fill="var(--sfb-velvet)"/>'
                 f'<rect x="{x + 86}" y="{base - 22}" width="34" height="18" rx="6" fill="var(--sfb-plush)"/>'
                 f'<path d="M{x + 46} {base - 30} q14 -8 30 2 v8 h-30 Z" fill="var(--sfb-cream)"/>')
        for px in (x, x + w - 8):
            g.append(f'<rect x="{px}" y="{top + 10}" width="8" height="{h - 10}" fill="var(--sfb-gilt)" stroke="var(--sfb-gilt-dark)" stroke-width="1"/>')
            g.append(f'<circle cx="{px + 4}" cy="{top + 6}" r="6" fill="var(--sfb-gilt)" stroke="var(--sfb-gilt-dark)" stroke-width="1"/>')
        g.append(f'<rect x="{x - 4}" y="{top + 12}" width="{w + 8}" height="26" fill="{c}"/>')
        for i in range(0, int(w + 8), 20):
            g.append(f'<path d="M{x - 4 + i} {top + 38} q10 12 20 0 Z" fill="{c}"/>')
        g.append(f'<path d="M{x - 4} {top + 14} H{x + w + 4}" stroke="var(--sfb-gilt)" stroke-width="3"/>')
        for side in (0, 1):
            sx = x + 8 if side == 0 else x + w - 8
            d = 1 if side == 0 else -1
            g.append(f'<path d="M{sx} {top + 38} L{sx + d * 22} {top + 38} Q{sx + d * 2} {top + h * .5} {sx + d * 12} {base} L{sx} {base} Z" fill="{c}"/>')
            g.append(f'<path d="M{sx + d * 6} {top + 50} Q{sx + d * 2} {top + h * .5} {sx + d * 6} {base - 4}" fill="none" stroke="var(--sfb-ink)" stroke-opacity=".3" stroke-width="2"/>')
    elif k == "bell":
        g.append(f'<path d="M{x} {base} C{x + 4} {top + 90} {mid - 24} {top + 20} {mid} {top} C{mid + 24} {top + 20} {x + w - 4} {top + 90} {x + w} {base} Z" fill="{c}"/>')
        # The door, rolled up and tied, and the room inside it.
        dw = w * .58
        g.append(f'<path d="M{mid - dw / 2} {base} L{mid - dw / 2 + 8} {top + 70} Q{mid} {top + 50} {mid + dw / 2 - 8} {top + 70} L{mid + dw / 2} {base} Z" fill="{p}"/>')
        g.append(rug(mid - dw / 2 + 6, dw - 12, base - 6))
        for sx in (mid - dw / 2 + 12, mid + dw / 2 - 30):
            g.append(f'<rect x="{sx}" y="{base - 56}" width="18" height="54" rx="7" fill="var(--sfb-velvet)"/>'
                     f'<rect x="{sx - 2}" y="{base - 22}" width="22" height="18" rx="5" fill="var(--sfb-plush)"/>')
        g.append(f'<path d="M{mid - dw / 2 + 6} {top + 72} Q{mid} {top + 60} {mid + dw / 2 - 6} {top + 72}" fill="none" stroke="{c}" stroke-width="12" stroke-linecap="round"/>')
        g.append(f'<rect x="{mid - 2}" y="{top - 14}" width="4" height="18" fill="var(--sfb-gilt)"/>'
                 f'<path d="M{mid} {top - 22} l5 8 h-10 Z" fill="{c}"/>')
        g.append(f'<path d="M{x + 14} {base - 60} Q{x + 10} {base - 20} {x + 4} {base}" fill="none" stroke="var(--sfb-ink)" stroke-opacity=".25" stroke-width="2"/>'
                 f'<path d="M{x + w - 14} {base - 60} Q{x + w - 10} {base - 20} {x + w - 4} {base}" fill="none" stroke="var(--sfb-ink)" stroke-opacity=".25" stroke-width="2"/>')
    elif k == "sail":
        g.append(rug(x + 4, w - 8, base - 6))
        g.append(f'<path d="M{x + 14} {base - 4} h{w - 30} v-18 q-10 -24 -26 -18 h-{w - 60} q-12 0 -12 12 Z" fill="var(--sfb-velvet)"/>'
                 f'<rect x="{x + 22}" y="{base - 22}" width="{w - 50}" height="10" rx="4" fill="var(--sfb-plush)"/>'
                 f'<path d="M{x + 24} {base - 34} q26 -10 50 0 v10 h-50 Z" fill="var(--sfb-cream)"/>')
        g.append(f'<rect x="{x + 2}" y="{top + 40}" width="6" height="{h - 40}" fill="var(--sfb-gilt)" stroke="var(--sfb-gilt-dark)" stroke-width="1"/>'
                 f'<rect x="{x + w - 8}" y="{top + 10}" width="6" height="{h - 10}" fill="var(--sfb-gilt)" stroke="var(--sfb-gilt-dark)" stroke-width="1"/>')
        g.append(f'<path d="M{x + 5} {top + 40} Q{mid} {top + 64} {x + w - 5} {top + 10} L{mid + 10} {top + 96} Z" fill="{c}"/>'
                 f'<path d="M{x + 5} {top + 40} L{mid + 10} {top + 96} L{x + w - 5} {top + 10}" fill="none" stroke="var(--sfb-cream)" stroke-width="2"/>')
        g.append(f'<path d="M{mid + 10} {top + 96} Q{mid + 14} {top + 130} {mid + 20} {base - 70}" fill="none" stroke="var(--sfb-gilt-dark)" stroke-width="1.5"/>')
    elif k == "crown":
        g.append(f'<path d="M{x + 8} {base} L{x + 16} {top + 50} L{x + w - 16} {top + 50} L{x + w - 8} {base} Z" fill="{p}"/>')
        g.append(rug(x + 6, w - 12, base - 6) + seat(x + 26, w - 52, base - 4))
        g.append(f'<rect x="{x + 34}" y="{base - 12}" width="22" height="10" rx="5" fill="var(--sfb-plush)"/>'
                 f'<rect x="{x + w - 58}" y="{base - 12}" width="22" height="10" rx="5" fill="var(--sfb-plush)"/>')
        for side in (0, 1):
            sx = x + 16 if side == 0 else x + w - 16
            d = 1 if side == 0 else -1
            g.append(f'<path d="M{mid} {top + 34} Q{sx + d * 10} {top + 40} {sx - d * 6} {top + 70} Q{sx - d * 14} {top + h * .55} {sx - d * 4} {base} L{sx + d * 18} {base} Q{sx + d * 22} {top + h * .5} {sx + d * 18} {top + 110} Q{sx + d * 30} {top + 84} {mid} {top + 34} Z" fill="{c}"/>')
            g.append(f'<circle cx="{sx + d * 12}" cy="{top + 116}" r="5" fill="var(--sfb-gilt)"/>')
        g.append(f'<path d="M{mid - 30} {top + 34} L{mid - 26} {top + 8} L{mid - 14} {top + 22} L{mid} {top} L{mid + 14} {top + 22} L{mid + 26} {top + 8} L{mid + 30} {top + 34} Z" fill="var(--sfb-gilt)" stroke="var(--sfb-gilt-dark)" stroke-width="1.5"/>')
        g.append(f'<path d="M{mid - 34} {top + 34} q34 18 68 0" fill="{c}"/>')
    else:
        raise ValueError(k)
    return "".join(g)


def room_svg(x, w, base, kind):
    """A living room between two canopies: a rug and somewhere to sit."""
    g = [f'<ellipse cx="{x + w / 2}" cy="{base + 6}" rx="{w / 2}" ry="9" fill="var(--sfb-rug)"/>',
         f'<ellipse cx="{x + w / 2}" cy="{base + 6}" rx="{w / 2 - 7}" ry="5.5" fill="none" stroke="var(--sfb-rug-2)" stroke-width="2"/>']
    if kind == "borne":
        g.append(f'<path d="M{x + 10} {base} q{w / 2 - 10} -36 {w - 20} 0 Z" fill="var(--sfb-velvet)"/>'
                 f'<rect x="{x + w / 2 - 5}" y="{base - 52}" width="10" height="30" rx="4" fill="var(--sfb-velvet)"/>'
                 f'<circle cx="{x + w / 2}" cy="{base - 56}" r="9" fill="var(--sfb-plush)"/>')
    elif kind == "tete":
        g.append(f'<path d="M{x + 8} {base} v-18 q0 -14 14 -14 h{w - 30} q8 0 8 8 v24 Z" fill="var(--sfb-velvet)"/>'
                 f'<path d="M{x + w / 2 - 4} {base - 32} q-4 18 8 30" fill="none" stroke="var(--sfb-plush)" stroke-width="7" stroke-linecap="round"/>')
    else:
        g.append(f'<rect x="{x + 8}" y="{base - 30}" width="{w - 16}" height="28" rx="8" fill="var(--sfb-velvet)"/>'
                 f'<rect x="{x + 12}" y="{base - 12}" width="{w - 24}" height="10" rx="4" fill="var(--sfb-plush)"/>'
                 f'<circle cx="{x + 20}" cy="{base - 20}" r="6" fill="var(--sfb-cream)"/>')
    return "".join(g)


def floor_svg(d):
    W, H, WALL, BASE = 1600, 540, 340, 392
    g = [f'<svg class="sfb-floor__draw" viewBox="0 0 {W} {H}" aria-hidden="true" focusable="false">',
         '<defs><pattern id="sfb-herringbone" width="44" height="44" patternUnits="userSpaceOnUse">'
         '<rect width="44" height="44" fill="var(--sfb-oak)"/>'
         '<path d="M0 22 L22 0 L33 11 L11 33 Z" fill="var(--sfb-oak-3)"/><path d="M22 44 L44 22 L33 11 L11 33 Z" fill="var(--sfb-oak-2)"/>'
         '<path d="M22 0 L44 22 M0 22 L22 44" stroke="var(--sfb-oak-2)" stroke-width="1"/></pattern></defs>',
         f'<rect width="{W}" height="{WALL}" fill="var(--sfb-wall)"/>']
    # Pilasters and the tall mirrors between them, the chandeliers in them twice.
    for x in range(0, W, 160):
        g.append(f'<rect x="{x}" y="0" width="34" height="{WALL}" fill="var(--sfb-panel)"/>'
                 f'<rect x="{x + 4}" y="0" width="4" height="{WALL}" fill="var(--sfb-gilt)"/>'
                 f'<rect x="{x + 26}" y="0" width="4" height="{WALL}" fill="var(--sfb-gilt)"/>')
    for mx in (640, 800):
        g.append(f'<path d="M{mx + 48} 262 V70 A58 46 0 0 1 {mx + 164} 70 V262 Z" fill="var(--sfb-glass)" stroke="var(--sfb-gilt)" stroke-width="7"/>')
        g.append(chandelier(mx + 106, 44, .32, seed=mx % 7))
    # The wainscot.
    g.append(f'<rect y="262" width="{W}" height="{WALL - 262}" fill="var(--sfb-panel)"/>')
    for x in range(10, W, 120):
        g.append(f'<rect x="{x}" y="274" width="100" height="{WALL - 290}" fill="none" stroke="var(--sfb-gilt)" stroke-width="2.5"/>')
    g.append(f'<rect y="262" width="{W}" height="5" fill="var(--sfb-gilt)"/><rect y="{WALL - 6}" width="{W}" height="6" fill="var(--sfb-gilt-dark)"/>')
    # The parquet.
    g.append(f'<rect y="{WALL}" width="{W}" height="{H - WALL}" fill="url(#sfb-herringbone)"/>')
    # The long table down the middle of the floor, its cloth to the floor, the
    # chairs drawn up on the far side, dishes and crystal on it, no candles.
    tx0, tx1, ty = 640, 960, BASE + 34
    for cx_ in range(tx0 + 22, tx1 - 10, 40):
        g.append(f'<path d="M{cx_ - 12} {ty - 6} V{ty - 46} q12 -12 24 0 V{ty - 6} Z" fill="var(--sfb-velvet)" stroke="var(--sfb-gilt)" stroke-width="2.5"/>')
    g.append(f'<rect x="{tx0}" y="{ty - 8}" width="{tx1 - tx0}" height="10" fill="var(--sfb-cream)"/>')
    g.append(f'<path d="M{tx0} {ty} H{tx1} V{ty + 52} ' + " ".join(f"q-10 8 -20 0" for _ in range(int((tx1 - tx0) / 20))) + ' Z" fill="var(--sfb-cream)" stroke="var(--sfb-panel)" stroke-width="1"/>')
    for dx in range(tx0 + 20, tx1 - 10, 46):
        g.append(f'<ellipse cx="{dx}" cy="{ty - 10}" rx="13" ry="4" fill="var(--sfb-gilt)"/>'
                 f'<path d="M{dx - 10} {ty - 11} q10 -18 20 0 Z" fill="var(--sfb-glass)" stroke="var(--sfb-glass-edge)" stroke-width="1"/>'
                 f'<path d="M{dx + 20} {ty - 9} v-12 l-4 -6 h8 l-4 6" fill="none" stroke="var(--sfb-glass-edge)" stroke-width="1.2"/>')
    # The canopies at each end, and the living rooms between them.
    rooms = {r["between"]: r for r in d["rooms"]}
    for end, (x0, x1) in (("west", (16, 612)), ("east", (988, 1584))):
        tents = [t for t in d["tents"] if t["end"] == end]
        tw = (x1 - x0) / (len(tents) + (len(tents) - 1) * .55)
        x = x0
        for i, t in enumerate(tents):
            top = 132 + (i % 2) * 16
            g.append(tent_svg(t, round(x, 1), round(tw, 1), BASE, top))
            x += tw
            if i < len(tents) - 1:
                nxt = tents[i + 1]
                r = rooms.get(between(t, nxt))
                g.append(room_svg(round(x + 4, 1), round(tw * .55 - 8, 1), BASE + 18, r["id"] if r else "sofa"))
                x += tw * .55
    # The chandeliers' lowest tiers, hanging into the top of the picture.
    for cx_, seed in ((300, 1), (800, 4), (1300, 6)):
        g.append(chandelier(cx_, -110, 1.0, seed=seed))
    g.append("</svg>")
    return "".join(g)


# ── The words ─────────────────────────────────────────────────────────────────

def end_block(d, end):
    e = d["ends"][end]
    tents = [t for t in d["tents"] if t["end"] == end]
    out = [f'  <section class="sfb-end sfb-end--{end}" id="sfb-{end}-end" aria-labelledby="sfb-{end}-h">',
           f'    <h2 id="sfb-{end}-h">{esc(e["said"])}</h2>',
           f'    <p class="sfb-end__lede">{esc(e["lede"])}</p>',
           '    <ul class="sfb-tents">']
    rooms = d["rooms"]
    for i, t in enumerate(tents):
        out.append(f'      <li class="sfb-tent sfb-tent--{t["cloth"]}" id="sfb-{t["id"]}">')
        out.append(f'        <h3 class="sfb-tent__name">{esc(t["name"])}</h3>')
        out.append(f'        <p class="sfb-tent__under">{esc(t["under"])}</p>')
        out.append(f'        <p class="sfb-tent__light">{esc(t["light"])}</p>')
        out.append('        <ul class="sfb-tent__has">')
        for s in t["seats"]:
            out.append(f'          <li>To sit on: {esc(s)}.</li>')
        out.append(f'          <li>Underfoot: {esc(t["underfoot"])}.</li>')
        out.append(f'          <li>Something soft: {esc(t["soft"])}.</li>')
        out.append('        </ul>')
        out.append('      </li>')
        if i < len(tents) - 1:
            nxt = tents[i + 1]
            for r in rooms:
                if r["between"] == between(t, nxt):
                    out.append(f'      <li class="sfb-room" id="sfb-{r["id"]}">')
                    out.append(f'        <h3 class="sfb-room__name">{esc(r["name"])}</h3>')
                    out.append(f'        <p class="sfb-room__where">Out in the hall, {esc(r["between"])}:</p>')
                    out.append('        <ul class="sfb-room__has">' + "".join(f"<li>{esc(h)}</li>" for h in r["has"]) + '</ul>')
                    out.append('      </li>')
    out.append('    </ul>')
    out.append('  </section>')
    return "\n".join(out)


def floor_words(d):
    f, fe = d["floor"], d["feast"]
    return "\n".join([
        '  <section class="sfb-middle" id="sfb-middle" aria-labelledby="sfb-middle-h">',
        f'    <h2 id="sfb-middle-h">{esc(f["said"])}</h2>',
        f'    <p>{esc(f["lede"])}</p>',
        f'    <h3 class="sfb-middle__feast" id="sfb-feast">{esc(fe["said"])}</h3>',
        f'    <p>{esc(fe["body"])}</p>',
        '  </section>'])


def quotes_block(d):
    out = []
    for q in d["quotes"]:
        out.append('    <figure class="sfb-quote">')
        out.append(f'      <blockquote><p>{esc(q["words"])}</p></blockquote>')
        out.append(f'      <figcaption>{esc(q["who"])}, <a href="{attr(q["work_url"])}"><cite>{esc(q["work"])}</cite></a>, '
                   f'read on our <a href="{attr(q["read_on"])}">Biophilic Design</a> page.</figcaption>')
        out.append('    </figure>')
    return "\n".join(out)


# ── The checks ────────────────────────────────────────────────────────────────

def check_data(d):
    tents = d.get("tents") or []
    for end in ENDS:
        if not any(t.get("end") == end for t in tents):
            refuse(f"no canopy at the {end} end. The brief puts them at EACH end of the ballroom.")
    kinds, cloths = {}, {}
    for t in tents:
        where = f"canopy {t.get('name', '?')!r}"
        if t.get("end") not in ENDS:
            refuse(f"{where}: at no end of the room ({t.get('end')!r}).")
        if t.get("kind") not in ("cabana", "pavilion", "four-poster", "bell", "sail", "crown"):
            refuse(f"{where}: a kind this tool has no drawing for ({t.get('kind')!r}). Draw it before it goes up.")
        if t.get("cloth") not in CLOTHS:
            refuse(f"{where}: a cloth with no colour in §150 ({t.get('cloth')!r}).")
        for k, seen in (("kind", kinds), ("cloth", cloths)):
            if t.get(k) in seen:
                refuse(f"{where}: the same {k} as {seen[t[k]]!r}. No two refuges alike.")
            seen[t.get(k)] = t.get("name")
        if not t.get("seats"):
            refuse(f"{where}: nowhere to sit. Every canopy is a living room.")
        for k in ("underfoot", "soft", "under", "light", "id"):
            if not t.get(k):
                refuse(f"{where}: no {k}.")
    names = [t["name"].replace("The ", "the ", 1) for t in tents]
    for r in d.get("rooms") or []:
        m = re.match(r"^between (.+) and (.+)$", r.get("between", ""))
        if not m or m.group(1) not in names or m.group(2) not in names:
            refuse(f"living room {r.get('name')!r}: not between two canopies this file names ({r.get('between')!r}).")
        elif names.index(m.group(2)) != names.index(m.group(1)) + 1 or \
                tents[names.index(m.group(1))]["end"] != tents[names.index(m.group(2))]["end"]:
            refuse(f"living room {r.get('name')!r}: its two canopies are not neighbours at one end.")
        if not r.get("has"):
            refuse(f"living room {r.get('name')!r}: nothing in it.")
    order = [h.get("at") for h in d.get("height") or []]
    if order != [lv for lv in LEVELS if lv in order] or len(order) < 3:
        refuse(f"the height is out of order or too short: {order}. It goes down the page from the ceiling.")
    for q in d.get("quotes") or []:
        mfile = MIRROR / q.get("mirror", "")
        if MIRROR.exists():
            if not mfile.exists():
                refuse(f"quotation from {q.get('who')}: our page {q.get('mirror')!r} is not in the mirror.")
            else:
                text = re.sub(r"[*>]", "", mfile.read_text())
                text = re.sub(r"\s+", " ", text)
                if re.sub(r"\s+", " ", q["words"]) not in text:
                    refuse(f"quotation from {q.get('who')}: not word for word on our {q.get('read_on')}. "
                           "Re-copy it from our page; do not loosen this.")
                url = re.search(r'^url: "([^"]+)"', mfile.read_text(), re.M)
                if not url or url.group(1) != q.get("read_on"):
                    refuse(f"quotation from {q.get('who')}: read_on is not the mirror's own url for that page.")


def sweep(text, where):
    plain = html.unescape(re.sub(r"<[^>]+>", " ", text))
    for pat, what in ((GUEST, "a guest list, a dress code or a word for who sits out"),
                      (TALLY, "a count")):
        for m in pat.finditer(plain):
            if NEGATION.search(plain[max(0, m.start() - 48):m.start()]):
                continue
            refuse(f"{where}: {what} ({m.group(0)!r}). Nobody is on a list here, nothing is "
                   "worn to get in, and nothing is counted.")


def check_page():
    src = PAGE.read_text()
    main = src[src.index("<main"):src.index("</main>")]
    own = re.sub(r"<!-- quest:.*?:end -->|<!-- dial:begin -->.*?<!-- dial:end -->|<!--.*?-->", " ", main, flags=re.S)
    own = re.sub(r"<blockquote>.*?</blockquote>", " ", own, flags=re.S)
    # A link's words naming one of our own pages are that page's name, not the
    # room speaking: "our Dress Codes page" is the reason there is none.
    own = re.sub(r'<a href="https://stimpunks\.org/[^"]*">.*?</a>', " ", own, flags=re.S)
    sweep(own, PAGE.name)
    i_down, i_height = main.find('href="#sfb-floor"'), main.find('class="sfb-height"')
    if i_down < 0 or i_height < 0 or i_down > i_height:
        refuse(f"{PAGE.name}: no way straight down to the floor before the height. Nobody has to scroll it.")
    i_up = main.find('href="#sfb-ceiling"')
    if i_up < i_height:
        refuse(f"{PAGE.name}: no way back up to the ceiling after the height.")
    if 'id="sfb-floor"' not in main or 'id="sfb-ceiling"' not in main:
        refuse(f"{PAGE.name}: the floor or the ceiling has lost its id, which the ways past the height go to.")
    css = CSS.read_text()
    m = re.search(r"/\* §150 ──.*?(?=/\* §151 ──)", css, re.S)
    if not m:
        refuse("love.css has no §150 for the ballroom.")
        return
    for rule in re.finditer(r"([^{}]+)\{([^{}]*)\}", re.sub(r"/\*.*?\*/", "", m.group(0), flags=re.S)):
        sel, body = rule.group(1), rule.group(2)
        if re.search(r"\b(?:animation|transition)\s*:", body) and 'data-intensity="max"' not in sel:
            refuse(f"§150: {sel.strip()[:60]!r} moves outside MAX GLITTER. Nothing in the ballroom moves below MAX.")
    for kf in re.finditer(r"@keyframes\s+([\w-]+)", m.group(0)):
        if not kf.group(1).startswith("sfb-"):
            refuse(f"§150: keyframes {kf.group(1)!r} are not the ballroom's.")


def main():
    d = json.loads(DATA.read_text())
    check_data(d)
    # The brief is Ryan's words, quoted as his, and not swept.
    for blob in (d.get("ends"), d.get("tents"), d.get("rooms"), d.get("floor"), d.get("feast"), d.get("height")):
        sweep(json.dumps(blob, ensure_ascii=False), DATA.name)
    if problems:
        print("REFUSING:\n  " + "\n  ".join(dict.fromkeys(problems)))
        sys.exit(1)
    swap(PAGE, "sfb:ceiling", "    " + ceiling_svg(), "    ")
    swap(PAGE, "sfb:height", height_block(d), "  ")
    swap(PAGE, "sfb:floor", "    " + floor_svg(d), "    ")
    swap(PAGE, "sfb:quotes", quotes_block(d), "    ")
    swap(PAGE, "sfb:west", end_block(d, "west"), "  ")
    swap(PAGE, "sfb:middle", floor_words(d), "  ")
    swap(PAGE, "sfb:east", end_block(d, "east"), "  ")
    check_page()
    if problems:
        print("REFUSING (the page as written):\n  " + "\n  ".join(dict.fromkeys(problems)))
        sys.exit(1)
    print("scalable feast ballroom: the ceiling, the height, the floor and both ends written; "
          "a canopy at each end, no two alike, every one somewhere to sit")


if __name__ == "__main__":
    main()
