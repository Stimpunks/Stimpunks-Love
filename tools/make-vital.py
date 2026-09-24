#!/usr/bin/env python3
"""Build Vital Plant Living out of data/vital.json: the shelf, the builder, the
board of combos, the counter, the stereo, and the room's credits.

WHAT THE ROOM IS. A plant-based kitchen on the street, where you build your own
bowl or wrap out of RYAN'S OWN PANTRY -- the list he cooks from at home -- or
start from one of the combos on the board, each standing on a flavour base from
somewhere in the world that he wrote down. Everything in it is drawn cut
straight through the middle, the way a cook sketches a dish to show what is in
it, so every layer sits on the one under it and EVERYTHING TOUCHES. That is
Samefood Cafe inverted, a few doors along: there the table is seen from above
and nothing on the plate touches anything; here it is seen in section and the
touching is the point. Anybody who needs their food apart is sent there, by
name, in the house rules.

IT REFUSES, RATHER THAN TRUSTS:

  - A PANTRY ITEM WITH NO LOOK. Every thing you can tick has a shape and an ink
    so the section of your bowl can draw it. The failure it prevents is not an
    error anywhere -- it is a thing somebody ticked that never shows up in the
    picture, which reads as broken. make-guild.py's refusal of a room with no
    marker drawing, for the same reason.

  - A COMBO THAT BRINGS IN SOMETHING THE KITCHEN DOES NOT KEEP. Every item in a
    combo must be in the pantry, exactly as the pantry spells it, and every
    combo must stand on at least one of the flavour bases Ryan wrote down. A
    base's own ingredients (lemon grass, oregano, celeriac) come with the base
    and are not in the pantry, which is why a combo names a base rather than
    listing them.

  - THE WORD ITAL ON THE MENU. The room was briefed as Ital Plant Livity and
    renamed, Ryan's call, 2026-09-24, because this kitchen uses salt, MSG, soy
    sauce and processed food and Ital, as many Rastafari keep it, does not; and
    because practice varies among Rastafari, which is not ours to settle. So no
    combo, base, step or counter line may call anything Ital. The stereo keeps
    the word because it is in the songs' own titles, which are the musicians'.
    \\bital\\b does not match "Italian", which is the one false positive it would
    otherwise have on this page.

  - AUTHENTIC, EXOTIC AND ETHNIC in our own voice, with the negation window, so
    the room can still say nothing on the board claims to be authentic. A bowl
    somebody builds out of one person's pantry is not a claim about anybody's
    grandmother's cooking, and the other two are how a menu makes somebody
    else's food foreign.

  - THE VOCABULARY OF WELLNESS AND OF COUNTING, in our own voice, with the same
    window. "Vital" means alive here and never optimised: the friendly edit is
    a line about what a bowl does for your body, and every menu on the internet
    is written that way, so it will arrive. Samefood Cafe refuses advice about
    eating; this refuses the sales pitch for it. Song titles are not swept --
    Admiral Bailey's Healthy Body is his to call what he likes.

  - make-club.py's PAIR OF RUNTIME RULES: every song listed under the stereo
    carries its runtime, and the playlist refuses one, because a list somebody
    keeps adding to has no length that stays true.

  - A PLANT ON THE SHELF THAT IS NOT ON THE MENU, and two plants drawn the same
    way. The decor is the larder: every pot over the counter is something in
    the pantry, which is the one claim the room makes about its plants.

  - AN ID WITH TWO OWNERS on the builder's controls, before check-ids.py has to.

It writes nothing if anything is refused. Run it after editing the data file,
then make-og.py, because the share card lifts the shelf off the page.
"""
import html
import json
import re
import sys
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data/vital.json"
PAGE = ROOT / "vital-plant-living.html"
NOTES = ROOT / "liner-notes.html"
CSS = ROOT / "love.css"

YT = re.compile(r"^[A-Za-z0-9_-]{11}$")
LIST = re.compile(r"^PL[A-Za-z0-9_-]{11,32}$")
RUNTIME = re.compile(r"^(?:\d{1,2}:)?\d{1,2}:\d{2}$")
ENTITY = re.compile(r"&(?:[a-zA-Z][a-zA-Z0-9]{1,31}|#\d{1,6}|#x[0-9a-fA-F]{1,6});")

SHAPES = {"grain", "strand", "chunk", "round", "bean", "leaf", "slice", "floret",
          "pod", "pea", "shred", "fleck", "dust", "seed", "nut", "ring", "drizzle",
          "sauce", "dollop", "berry", "wedge"}
FORMS = {"roll", "fold", "stack"}
LAYERS = {"vessel", "base", "veg", "texture", "aroma", "sauce", "spice", "top", "fruit"}

NEGATION = (r"(?:no|not|nothing|never|neither|none|without|refuses?|refused|refusing|"
            r"cannot|does not|won't|will not|is not|are not|isn't|aren't|nobody|nor|declin\w+)")

# NARROW ON PURPOSE. "healthy" is here and "health" is not, because a sentence
# about access to food is not a sales pitch. "boost" is here because it is the
# single commonest verb on a smoothie menu. "protein" is NOT here: it is one of
# Ryan's own four words for a bowl, and refusing it would refuse his list.
WELLNESS = (r"superfoods?|detox\w*|cleanse\w*|clean eating|guilt[- ]free|guilty pleasures?|"
            r"cheat (?:day|meal)s?|healthy|healthier|nutritious|nutrients?|"
            r"calories?|macros|immune|boost\w*|fuel (?:your|the) body|good for you|"
            r"bad for you|protein[- ]packed|wholesome|virtuous")
TALLY = (r"scores?|scored|scoring|streaks?|leaderboards?|tall(?:y|ies)|tallied|"
         r"most popular|best[- ]sellers?|ranked|rankings?|top (?:\d+|three|five|ten)")
OTHER = r"authentic\w*|exotic\w*|ethnic\w*"

VOCAB = [
    (OTHER, "nothing on this board claims to be authentic, and no food in here is "
            "anybody's exotic. See _combos."),
    (WELLNESS, "vital means alive in here, never optimised. Nobody is told what a bowl "
               "does for their body. See the docstring."),
    (TALLY, "nothing in this kitchen is counted, ranked or scored."),
]

ITAL = re.compile(r"\bital\b", re.I)

problems = []


def refuse(msg):
    problems.append(msg)


def sweep(text, where):
    text = re.sub(r"<[^>]+>", " ", str(text))
    text = html.unescape(text)
    for pat, why in VOCAB:
        for m in re.finditer(rf"\b(?:{pat})", text, re.I):
            window = text[max(0, m.start() - 80):m.end()]
            if re.search(rf"\b{NEGATION}\b[^.]{{0,70}}?\b(?:{pat})", window, re.I):
                continue
            refuse(f"{where}: {m.group(0)!r} -- {why}")


def no_ital(text, where):
    if ITAL.search(html.unescape(re.sub(r"<[^>]+>", " ", str(text)))):
        refuse(f"{where} calls something Ital. This kitchen is not Ital and the menu "
               "never says it is. See _ital.")


def slug(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def esc(s):
    return html.escape(str(s), quote=False)


def attr(s):
    return html.escape(str(s), quote=True)


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


def food_inks():
    """The food inks love.css declares, as the names a look may use. Read out of
    the stylesheet rather than listed here, so a look cannot name an ink that
    renders as nothing -- CSS drops an unknown custom property and paints
    nothing, which is how Covenstead's kettle lost its outline."""
    src = CSS.read_text()
    return set(re.findall(r"--vpl-f-([a-z]+):", src))


# ── The shelf ────────────────────────────────────────────────────────────────
# Every pot is cut through the middle like everything else in the room, so the
# soil is a band inside a terracotta wall and THE PART OF THE PLANT THE KITCHEN
# USES IS VISIBLE UNDER IT where that part grows underground. Green stays above
# the soil line and every root, bulb and tuber below it is drawn in a food ink
# with an ink outline, for the Garden's reason: greens on dark soil measure
# nothing useful. The plants never move, at any setting.

VIEW = (1000, 300)
SOIL_Y = 184        # the top of the soil in every pot
SHELF_Y = 252       # the top of the plank
LINE = 'stroke="var(--vpl-ink)" stroke-width="2" stroke-linejoin="round"'
THIN = 'stroke="var(--vpl-ink)" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"'


def pot_body(x):
    return (
        f'<path d="M{x-46} 170 H{x+46} L{x+36} {SHELF_Y} H{x-36} Z" fill="var(--vpl-pot)" {LINE}/>'
        f'<path d="M{x-37} {SOIL_Y} H{x+37} L{x+30} {SHELF_Y-8} H{x-30} Z" fill="var(--vpl-soil)" {THIN}/>'
    )


def pot_rim(x):
    return f'<rect x="{x-50}" y="162" width="100" height="14" rx="3" fill="var(--vpl-pot)" {LINE}/>'


def leafy(d, fill="var(--vpl-leaf)"):
    return f'<path d="{d}" fill="{fill}" {THIN}/>'


def stem(x1, y1, x2, y2, w=2.4):
    return (f'<path d="M{x1} {y1} Q{(x1+x2)/2+4} {(y1+y2)/2} {x2} {y2}" '
            f'stroke="var(--vpl-leaf)" stroke-width="{w}" stroke-linecap="round" fill="none"/>')


def root(x1, y1, x2, y2):
    return (f'<path d="M{x1} {y1} Q{x1+(x2-x1)*.3+3} {(y1+y2)/2} {x2} {y2}" '
            f'stroke="var(--vpl-f-rice)" stroke-width="1.4" stroke-linecap="round" fill="none"/>')


def draw_scallion(x):
    out = []
    for i, dx in enumerate((-18, -9, 0, 9, 18)):
        top = 70 + (i * 13) % 30
        out.append(f'<rect x="{x+dx-3}" y="{top}" width="7" height="{SOIL_Y-top+2}" rx="3.5" '
                   f'fill="var(--vpl-leaf)" {THIN}/>')
        out.append(f'<ellipse cx="{x+dx}" cy="{SOIL_Y+12}" rx="4.5" ry="7" fill="var(--vpl-f-rice)" {THIN}/>')
        out.append(root(x+dx, SOIL_Y+19, x+dx-4, SOIL_Y+34))
        out.append(root(x+dx, SOIL_Y+19, x+dx+5, SOIL_Y+32))
    return "".join(out)


def draw_herb(x):
    """Cilantro: lacy, many small rounded lobes on fine stems."""
    out = []
    for sx, sy in ((-22, 112), (-8, 92), (6, 100), (20, 116), (-14, 132), (14, 136)):
        out.append(stem(x, SOIL_Y, x+sx, sy, 1.8))
        for lx, ly in ((0, 0), (-7, 5), (7, 5), (0, -7)):
            out.append(f'<circle cx="{x+sx+lx}" cy="{sy+ly}" r="5.2" fill="var(--vpl-leaf)" {THIN}/>')
    out.append(root(x, SOIL_Y+2, x-8, SOIL_Y+30))
    out.append(root(x, SOIL_Y+2, x+6, SOIL_Y+36))
    return "".join(out)


def draw_garlic(x):
    out = []
    for dx, top in ((-12, 96), (0, 84), (12, 100)):
        out.append(leafy(f"M{x} {SOIL_Y} Q{x+dx-6} {(SOIL_Y+top)/2} {x+dx*2} {top} "
                         f"Q{x+dx+4} {(SOIL_Y+top)/2} {x+4} {SOIL_Y} Z"))
    out.append(f'<path d="M{x-17} {SOIL_Y+26} Q{x-18} {SOIL_Y+8} {x} {SOIL_Y+6} Q{x+18} {SOIL_Y+8} '
               f'{x+17} {SOIL_Y+26} Q{x+10} {SOIL_Y+40} {x} {SOIL_Y+40} Q{x-10} {SOIL_Y+40} {x-17} {SOIL_Y+26} Z" '
               f'fill="var(--vpl-f-rice)" {THIN}/>')
    out.append(f'<path d="M{x-6} {SOIL_Y+10} Q{x-10} {SOIL_Y+26} {x-5} {SOIL_Y+39} M{x+6} {SOIL_Y+10} '
               f'Q{x+10} {SOIL_Y+26} {x+5} {SOIL_Y+39}" {THIN} fill="none"/>')
    out.append(root(x-6, SOIL_Y+40, x-10, SOIL_Y+58))
    out.append(root(x+5, SOIL_Y+40, x+9, SOIL_Y+56))
    return "".join(out)


def draw_ginger(x):
    out = []
    for dx, top in ((-16, 70), (2, 58), (18, 78)):
        out.append(stem(x+dx/3, SOIL_Y, x+dx, top, 2.2))
        for k in range(3):
            ly = top + 16 + k * 26
            side = 1 if k % 2 else -1
            out.append(leafy(f"M{x+dx} {ly} Q{x+dx+side*16} {ly-10} {x+dx+side*26} {ly-2} "
                             f"Q{x+dx+side*14} {ly+4} {x+dx} {ly} Z"))
    out.append(f'<path d="M{x-26} {SOIL_Y+22} Q{x-26} {SOIL_Y+10} {x-14} {SOIL_Y+12} Q{x-6} {SOIL_Y+4} '
               f'{x+4} {SOIL_Y+12} Q{x+16} {SOIL_Y+6} {x+24} {SOIL_Y+16} Q{x+30} {SOIL_Y+28} {x+16} {SOIL_Y+30} '
               f'Q{x} {SOIL_Y+34} {x-14} {SOIL_Y+30} Q{x-26} {SOIL_Y+32} {x-26} {SOIL_Y+22} Z" '
               f'fill="var(--vpl-f-gold)" {THIN}/>')
    out.append(root(x-8, SOIL_Y+32, x-12, SOIL_Y+52))
    out.append(root(x+12, SOIL_Y+30, x+16, SOIL_Y+50))
    return "".join(out)


def draw_chili(x):
    out = [stem(x, SOIL_Y, x, 96, 3)]
    for bx, by in ((-6, 120), (8, 106), (-20, 106), (18, 128)):
        out.append(stem(x, by + 20, x+bx, by, 1.8))
    for lx, ly, s in ((-26, 104, -1), (-12, 92, -1), (10, 96, 1), (24, 112, 1), (-24, 132, -1), (22, 140, 1)):
        out.append(leafy(f"M{x+lx} {ly} Q{x+lx+s*10} {ly-8} {x+lx+s*18} {ly} Q{x+lx+s*10} {ly+7} {x+lx} {ly} Z"))
    for cx, cy in ((-14, 118), (4, 126), (16, 112), (-2, 108)):
        out.append(f'<path d="M{x+cx} {cy} Q{x+cx+5} {cy+14} {x+cx+1} {cy+26} Q{x+cx-5} {cy+14} {x+cx} {cy} Z" '
                   f'fill="var(--vpl-f-red)" {THIN}/>')
    out.append(root(x, SOIL_Y+2, x-10, SOIL_Y+32))
    out.append(root(x, SOIL_Y+2, x+10, SOIL_Y+30))
    return "".join(out)


def draw_carrot(x):
    out = []
    for dx, top in ((-18, 104), (-6, 86), (6, 90), (18, 108)):
        out.append(stem(x, SOIL_Y, x+dx, top, 1.6))
        for k in range(4):
            fy = top + 8 + k * 14
            fx = x + dx * (1 - k * .18)
            out.append(f'<path d="M{fx} {fy} l-7 -5 M{fx} {fy} l7 -5" stroke="var(--vpl-leaf)" '
                       f'stroke-width="2" stroke-linecap="round"/>')
    out.append(f'<path d="M{x-11} {SOIL_Y-2} Q{x} {SOIL_Y-6} {x+11} {SOIL_Y-2} L{x+2} {SOIL_Y+56} '
               f'Q{x} {SOIL_Y+60} {x-2} {SOIL_Y+56} Z" fill="var(--vpl-f-orange)" {THIN}/>')
    out.append(f'<path d="M{x-7} {SOIL_Y+12} h5 M{x+3} {SOIL_Y+24} h5 M{x-4} {SOIL_Y+36} h4" {THIN} fill="none"/>')
    return "".join(out)


def draw_potato(x):
    out = []
    for lx, ly in ((-24, 112), (-8, 96), (10, 100), (26, 116), (-16, 132), (16, 138), (0, 118)):
        out.append(stem(x, SOIL_Y, x+lx, ly+8, 1.8))
        out.append(leafy(f"M{x+lx-11} {ly} Q{x+lx} {ly-13} {x+lx+11} {ly} Q{x+lx} {ly+11} {x+lx-11} {ly} Z"))
    for tx, ty, r in ((-16, SOIL_Y+26, 10), (8, SOIL_Y+36, 12), (22, SOIL_Y+16, 7)):
        out.append(root(x, SOIL_Y+2, x+tx, ty))
        out.append(f'<ellipse cx="{x+tx}" cy="{ty}" rx="{r+2}" ry="{r}" fill="var(--vpl-f-red)" {THIN}/>')
    return "".join(out)


def draw_parsley(x):
    """Flat Italian parsley: fewer, broader, toothed leaflets than the cilantro
    one pot along, which is the only honest way to tell two green herbs apart."""
    out = []
    for sx, sy in ((-20, 104), (-4, 86), (14, 96), (24, 124), (-22, 132)):
        out.append(stem(x, SOIL_Y, x+sx, sy+10, 2))
        out.append(leafy(f"M{x+sx} {sy+10} L{x+sx-12} {sy} L{x+sx-7} {sy-8} L{x+sx} {sy-14} "
                         f"L{x+sx+7} {sy-8} L{x+sx+12} {sy} Z"))
    out.append(root(x, SOIL_Y+2, x-6, SOIL_Y+34))
    out.append(root(x, SOIL_Y+2, x+9, SOIL_Y+28))
    return "".join(out)


def draw_leek(x):
    out = [f'<rect x="{x-8}" y="{SOIL_Y-40}" width="16" height="{40+44}" rx="6" fill="var(--vpl-f-rice)" {THIN}/>']
    for dx, top, s in ((-30, 74, -1), (-14, 60, -1), (14, 62, 1), (30, 80, 1)):
        out.append(leafy(f"M{x-6} {SOIL_Y-38} Q{x+dx*.4} {top+40} {x+dx} {top} "
                         f"Q{x+dx*.4+s*8} {top+44} {x+6} {SOIL_Y-38} Z"))
    for dx in (-6, -2, 3, 7):
        out.append(root(x+dx/2, SOIL_Y+44, x+dx*2, SOIL_Y+60))
    return "".join(out)


def draw_lemon(x):
    out = [f'<path d="M{x-3} {SOIL_Y} L{x-2} 128 M{x+3} {SOIL_Y} L{x+2} 128" stroke="var(--vpl-f-brown)" '
           f'stroke-width="4" stroke-linecap="round"/>',
           f'<path d="M{x-44} 100 Q{x-46} 58 {x-8} 52 Q{x+2} 36 {x+22} 50 Q{x+50} 58 {x+44} 96 '
           f'Q{x+40} 130 {x} 130 Q{x-40} 132 {x-44} 100 Z" fill="var(--vpl-leaf)" {LINE}/>']
    for lx, ly in ((-22, 84), (14, 70), (26, 104), (-6, 110)):
        out.append(f'<ellipse cx="{x+lx}" cy="{ly}" rx="9" ry="7" fill="var(--vpl-f-gold)" {THIN}/>')
    out.append(root(x, SOIL_Y+2, x-12, SOIL_Y+44))
    out.append(root(x, SOIL_Y+2, x+10, SOIL_Y+48))
    out.append(root(x-6, SOIL_Y+24, x-22, SOIL_Y+50))
    return "".join(out)


DRAWINGS = {
    "scallion": (draw_scallion, "scallions, with their white bulbs showing under the soil"),
    "herb":     (draw_herb, "cilantro, lacy and many-lobed"),
    "garlic":   (draw_garlic, "garlic, a whole bulb in the soil with its cloves drawn in"),
    "ginger":   (draw_ginger, "ginger, tall and narrow-leaved over a knobbly rhizome"),
    "chili":    (draw_chili, "a chili plant with its red chilies hanging"),
    "carrot":   (draw_carrot, "carrots, feathery on top and one orange root going down"),
    "potato":   (draw_potato, "red potatoes, three of them in the soil under the leaves"),
    "parsley":  (draw_parsley, "flat Italian parsley, broader-leaved than the cilantro"),
    "leek":     (draw_leek, "a leek, its white shaft half under the soil"),
    "lemon":    (draw_lemon, "a small lemon tree with lemons on it"),
}


def shelf_svg(plants):
    w, h = VIEW
    n = len(plants)
    step = (w - 60) / n
    parts = [f'<svg class="vpl-shelf-art" viewBox="0 0 {w} {h}" fill="none" '
             f'xmlns="http://www.w3.org/2000/svg">']
    for i, p in enumerate(plants):
        x = round(30 + step * (i + .5))
        # IN SECTION THE SOIL IS A BAND YOU CAN SEE INTO: the pot's wall and its
        # soil first, then the whole plant over them -- so the part the kitchen
        # uses shows where it grows -- and the rim last, across the stems.
        parts.append(f'      <g class="vpl-pot">{pot_body(x)}{DRAWINGS[p["draw"]][0](x)}{pot_rim(x)}</g>')
    parts.append(f'      <rect x="0" y="{SHELF_Y}" width="{w}" height="18" fill="var(--vpl-f-tan)" {LINE}/>')
    parts.append(f'      <path d="M40 {SHELF_Y+18} V{h} M{w-40} {SHELF_Y+18} V{h}" stroke="var(--vpl-ink)" stroke-width="5"/>')
    parts.append("      </svg>")
    return "\n".join(parts)


# ── The builder ──────────────────────────────────────────────────────────────

def chip(kind, name, value, label, extra="", checked=False, sub=""):
    iid = f"vpl-{name}-{value}"
    sub_html = f' <span class="vpl-chip__sub">{esc(sub)}</span>' if sub else ""
    return (f'<li><label class="vpl-chip" for="{iid}"><input type="{kind}" id="{iid}" '
            f'name="vpl-{name}" value="{attr(value)}"{extra}{" checked" if checked else ""}>'
            f'<span class="vpl-chip__name">{esc(label)}{sub_html}</span></label></li>')


def builder(d):
    looks = d["looks"]
    by_step = {s["key"]: [] for s in d["steps"]}
    for sec in d["pantry"]:
        by_step[sec["step"]].append(sec)
    out = []
    for no, step in enumerate(d["steps"], 1):
        out.append(f'      <fieldset class="vpl-step" id="vpl-step-{step["key"]}">')
        out.append(f'        <legend class="vpl-step__name"><span class="vpl-step__no">{no}</span> {esc(step["name"])}</legend>')
        out.append(f'        <p class="vpl-step__says">{esc(step["says"])}</p>')
        for sec in by_step[step["key"]]:
            if sec["key"] == "wrap":
                out.append('        <fieldset class="vpl-group vpl-group--vessel">')
                out.append('          <legend class="vpl-group__name">Bowl or wrap</legend>')
                out.append('          <ul class="vpl-chips">')
                out.append('            ' + chip("radio", "vessel", "bowl", "Bowl",
                                                  ' data-form="bowl" data-ink="bowl"', checked=True))
                for it in sec["items"]:
                    form, ink = looks[it]
                    out.append('            ' + chip("radio", "vessel", slug(it), it,
                                                      f' data-form="{form}" data-ink="{ink}"'))
                out.append('          </ul>')
                out.append('        </fieldset>')
                continue
            if step["key"] == "flavour" and sec["key"] == "aromatics":
                out.append('        <fieldset class="vpl-group vpl-group--bases">')
                out.append('          <legend class="vpl-group__name">A base to start from</legend>')
                out.append('          <p class="vpl-group__says">Off the foot of Ryan&rsquo;s list: '
                           'the aromatics a kitchen somewhere starts from, and a few of his own '
                           'go-tos. Tick one, several, or none; what each one brings is written '
                           'beside it and comes with it.</p>')
                out.append('          <ul class="vpl-chips">')
                for b in d["bases"]:
                    out.append('            ' + chip("checkbox", "base", b["key"], b["name"],
                                                      f' data-group="bases" data-brings="{attr("|".join(b["items"]))}"',
                                                      sub=", ".join(b["items"])))
                out.append('          </ul>')
                out.append('        </fieldset>')
            out.append(f'        <fieldset class="vpl-group" data-group="{sec["key"]}">')
            out.append(f'          <legend class="vpl-group__name">{esc(sec["name"])}</legend>')
            out.append('          <ul class="vpl-chips">')
            for it in sec["items"]:
                shape, ink = looks[it]
                out.append('            ' + chip("checkbox", "item", slug(it), it,
                                                  f' data-group="{sec["key"]}" data-layer="{sec["layer"]}" '
                                                  f'data-shape="{shape}" data-ink="{ink}"'))
            out.append('          </ul>')
            out.append('        </fieldset>')
        out.append('      </fieldset>')
    return "\n".join(out)


# ── The board ────────────────────────────────────────────────────────────────

def vessel_phrase(v):
    return "A bowl" if v == "Bowl" else f"A wrap, in {v.lower()}"


def combos(d):
    bases = {b["key"]: b for b in d["bases"]}
    out = ['    <ul class="vpl-board">']
    for c in d["combos"]:
        on = "; and ".join(
            f'Ryan&rsquo;s own go-to, {esc(", ".join(bases[k]["items"]))}' if bases[k]["kind"] == "go-to"
            else f'the {esc(bases[k]["name"])} base, {esc(", ".join(bases[k]["items"]))}' for k in c["on"])
        items = ", ".join(esc(i) for i in c["items"])
        vessel = "bowl" if c["vessel"] == "Bowl" else slug(c["vessel"])
        out += [
            f'      <li class="vpl-combo" id="combo-{c["key"]}">',
            f'        <h3>{esc(c["name"])}</h3>',
            f'        <p class="vpl-combo__on">{vessel_phrase(c["vessel"])}, on {on}</p>',
            f'        <svg class="vpl-cut vpl-cut--mini" viewBox="0 0 400 300" aria-hidden="true" focusable="false" hidden></svg>',
            f'        <p class="vpl-combo__note">{esc(c["note"])}</p>',
            f'        <p class="vpl-combo__in"><b>In it:</b> {items}</p>',
            f'        <p class="vpl-combo__go" hidden><button type="button" class="vpl-load" '
            f'data-name="{attr(c["name"])}" data-vessel="{vessel}" data-bases="{"|".join(c["on"])}" '
            f'data-items="{"|".join(slug(i) for i in c["items"])}">Start the builder from this</button></p>',
            f'        <p class="vpl-combo__said" hidden></p>',
            '      </li>',
        ]
    out.append('    </ul>')
    return "\n".join(out)


def counter(d):
    c = d["counter"]
    return "\n".join([
        '    <div class="vpl-counter">',
        '      <div class="vpl-counter__side">',
        '        <h3>Snacks</h3>',
        '        <ul class="vpl-list">' + "".join(f"<li>{esc(s)}</li>" for s in c["snacks"]) + '</ul>',
        '      </div>',
        '      <div class="vpl-counter__side">',
        '        <h3>Drinks</h3>',
        '        <ul class="vpl-list">' + "".join(f"<li>{esc(s)}</li>" for s in c["drinks"]) + '</ul>',
        '      </div>',
        '    </div>',
    ])


def stereo(d):
    """THE WHOLE PLAYLIST IS A SCREEN OR A DOOR, and which one is measured rather
    than assumed. A playlist that plays on YouTube and will not play in a frame
    is make-jungle.py's link-out and Club Chronic's Qobuz deck: a link dressed as
    a window promises the one action it cannot do, so it is shaped like a door
    -- no aspect ratio, dashed -- and says what was measured. EVERY SONG IS ITS
    OWN PRESS either way, with its runtime on the button, so the stereo plays
    whichever state the playlist is in."""
    p = d["playlist"]
    rows = []
    for t in d["tracks"]:
        aside = f' <span class="vpl-track__aside">({esc(t["aside"])})</span>' if t.get("aside") else ""
        rows.append("\n".join([
            '        <li class="vpl-track">',
            f'          <p class="vpl-track__title">{esc(t["title"])}</p>',
            f'          <p class="vpl-track__who">{esc(t["artist"])}{aside}</p>',
            f'          <button type="button" class="facade" data-embed-id="{t["id"]}" '
            f'data-embed-title="{attr(t["artist"])} &mdash; {attr(t["title"])}">',
            f'            <span class="vpl-sr">{esc(t["title"])}, by {esc(t["artist"])}, runs </span>{esc(t["runtime"])}',
            '            <span class="facade__play">&#9654; PRESS PLAY</span>',
            '          </button>',
            f'          <p class="vpl-track__up">uploaded by <a href="https://www.youtube.com/watch?v={t["id"]}">{esc(t["channel"])}</a></p>',
            '        </li>']))
    url = f'https://www.youtube.com/playlist?list={p["id"]}'
    if p["frame"] == "screen":
        whole = [
            '      <p class="vpl-stereo__note">The whole playlist, in the order Ryan put it in, and it runs until you stop it. '
            'No runtime on this one: it is a list we keep adding to, and a total here would be wrong the next time it changed.</p>',
            f'      <button type="button" class="facade" data-embed-src="https://www.youtube-nocookie.com/embed/videoseries?list={p["id"]}" '
            f'data-embed-title="{attr(p["title"])}, on YouTube">',
            '        Put the whole playlist on &mdash; runs until you stop it',
            '        <span class="facade__play">&#9654; PRESS PLAY</span>',
            '      </button>',
            f'      <p class="vpl-stereo__credit"><a href="{url}">{esc(p["title"])}</a>, '
            f'on YouTube, from our own channel. The playlist still carries the name this room was briefed under.</p>',
        ]
    else:
        whole = [
            f'      <a class="vpl-door" href="{url}">',
            f'        <span class="vpl-door__name">{esc(p["title"])}, the whole playlist, on YouTube &rarr;</span>',
            '        <span class="vpl-door__why">A door and not a screen, because it will not play inside this page: '
            'YouTube answers every frame of the whole list with &ldquo;this video is unavailable&rdquo;, although every song on '
            'it plays on its own below. It plays on YouTube, in the order Ryan put it in, until you stop it.</span>',
            '      </a>',
            '      <p class="vpl-stereo__credit">From our own channel. The playlist still carries the name this room was briefed under.</p>',
        ]
    return "\n".join([
        '    <div class="vpl-stereo">',
        *whole,
        '      <p class="vpl-stereo__note">Or one song at a time, in the playlist&rsquo;s own order. Every one says how long it runs before you press it.</p>',
        '      <ol class="vpl-tracks">',
        *rows,
        '      </ol>',
        f'      <p class="vpl-stereo__read">What is on the playlist, as it read on {d["_checked"]}. '
        'A song added to it since is not here until somebody reads the playlist again. '
        'One entry in it is unavailable, and YouTube skips it.</p>',
        '    </div>',
    ])


def window(d):
    names = [DRAWINGS[p["draw"]][1] for p in d["plants"]]
    listed = "; ".join(names[:-1]) + "; and " + names[-1]
    return ('    <p class="vpl-window">On the shelf over the counter, cut through the middle like '
            f'everything else in here: {listed}. Every pot on it is something in the pantry, '
            'and where the part the kitchen uses grows underground, you can see it under the soil.</p>')


def cap():
    return ('    <p><code>tools/make-vital.py</code> builds this room out of one data file. It refuses a combo '
            'that brings in anything the pantry does not keep, and a combo that stands on no flavour base. It '
            'refuses the word Ital anywhere on the menu. It refuses the vocabulary of authenticity, of wellness '
            'and of counting in the room&rsquo;s own voice. And it refuses a pot on the shelf that is not on the '
            'menu, and anything you can tick that the drawing of your bowl would not know how to draw.</p>')


def liner(d):
    rows = []
    for t in d["tracks"]:
        aside = f' ({esc(t["aside"])})' if t.get("aside") else ""
        rows.append(f'      <tr><td><strong>{esc(t["artist"])}</strong>{aside}</td><td>{esc(t["title"])}</td>'
                    f'<td>{esc(t["runtime"])}</td><td>{esc(t["channel"])}</td>'
                    f'<td><a href="https://www.youtube.com/watch?v={t["id"]}">watch</a></td></tr>')
    return "\n".join(rows)


# ── The checks ───────────────────────────────────────────────────────────────

def check(d):
    inks = food_inks()
    if not inks:
        refuse("love.css declares no --vpl-f- inks, so nothing a look names would render.")
    looks = d.get("looks", {})
    seen = {}
    for sec in d["pantry"]:
        if sec["layer"] not in LAYERS:
            refuse(f"pantry section {sec['name']!r} has a layer the drawing does not know: {sec['layer']!r}")
        if sec["step"] not in {s["key"] for s in d["steps"]}:
            refuse(f"pantry section {sec['name']!r} is in no step of the builder")
        for it in sec["items"]:
            entity(it, f"pantry item {it!r}")
            if it in seen:
                refuse(f"{it!r} is in the pantry twice ({seen[it]} and {sec['name']}); a thing on "
                       "the list twice is in the builder once. See _pantry.")
            seen[it] = sec["name"]
            lk = looks.get(it)
            if not lk:
                refuse(f"{it!r} has no look, so ticking it would draw nothing. See _looks.")
                continue
            shape, ink = lk
            ok = FORMS if sec["layer"] == "vessel" else SHAPES
            if shape not in ok:
                refuse(f"{it!r} has a shape the drawing does not know: {shape!r}")
            if ink not in inks:
                refuse(f"{it!r} names the ink {ink!r}, which love.css does not declare as --vpl-f-{ink}; "
                       "it would paint nothing.")
    for k in looks:
        if k not in seen:
            refuse(f"looks has {k!r}, which is not in the pantry. A stale look is a stale claim.")
    slugs = {}
    for it in seen:
        s = slug(it)
        if s in slugs:
            refuse(f"{it!r} and {slugs[s]!r} come out as the same id, vpl-item-{s}.")
        slugs[s] = it

    bases = {b["key"] for b in d["bases"]}
    if len(bases) != len(d["bases"]):
        refuse("two flavour bases share a key.")
    wraps = next(s["items"] for s in d["pantry"] if s["key"] == "wrap")
    fillable = {i for s in d["pantry"] if s["key"] != "wrap" for i in s["items"]}
    names = set()
    for c in d["combos"]:
        where = f"combo {c.get('name')!r}"
        for f in ("key", "name", "vessel", "on", "items", "note"):
            if not c.get(f):
                refuse(f"{where} has no {f}.")
        if c["name"] in names:
            refuse(f"{where} is on the board twice.")
        names.add(c["name"])
        if c["vessel"] != "Bowl" and c["vessel"] not in wraps:
            refuse(f"{where} comes in {c['vessel']!r}, which is not a bowl or a wrap the pantry keeps.")
        for k in c["on"]:
            if k not in bases:
                refuse(f"{where} stands on {k!r}, which is not one of the bases Ryan wrote down.")
        for it in c["items"]:
            if it not in fillable:
                refuse(f"{where} brings in {it!r}, which the pantry does not keep (or keeps as a wrap). "
                       "A combo is assembled out of the pantry. See _combos.")
        if len(set(c["items"])) != len(c["items"]):
            refuse(f"{where} lists something twice.")
        for f in ("name", "note"):
            sweep(c[f], f"{where} {f}")
            no_ital(c[f], f"{where} {f}")
            entity(c[f], f"{where} {f}")
    for b in d["bases"]:
        no_ital(b["name"], f"base {b['name']!r}")
    for s in d["steps"]:
        sweep(s["says"], f"step {s['name']!r}")
        no_ital(s["says"], f"step {s['name']!r}")
    for side, items in d["counter"].items():
        for it in items:
            no_ital(it, f"the counter's {side}")
            sweep(it, f"the counter's {side}")

    p = d["playlist"]
    if not LIST.match(p.get("id", "")):
        refuse(f"the playlist id {p.get('id')!r} is not a YouTube playlist id.")
    if p.get("frame") not in ("screen", "door"):
        refuse("the playlist's frame is neither 'screen' nor 'door'. Which one is measured, by "
               "pressing play inside a frame; say which.")
    if p.get("frame") == "door" and not p.get("door_why"):
        refuse("the playlist is a door with no door_why. A door says what was measured, or it is a "
               "broken screen with a nicer name.")
    if "runtime" in p:
        refuse("the playlist carries a runtime. A list somebody keeps adding to has no length "
               "that stays true -- make-club.py's rule.")
    ids = set()
    for t in d["tracks"]:
        where = f"track {t.get('title')!r}"
        if not YT.match(t.get("id", "")):
            refuse(f"{where} has no YouTube id.")
        if t["id"] in ids:
            refuse(f"{where} is listed twice.")
        ids.add(t["id"])
        if not RUNTIME.match(t.get("runtime", "")):
            refuse(f"{where} has no runtime. Every song says how long it runs.")
        for f in ("artist", "channel", "title_verbatim"):
            if not t.get(f):
                refuse(f"{where} has no {f}.")

    drew = set()
    for pl in d["plants"]:
        if pl["item"] not in seen:
            refuse(f"the shelf has a pot of {pl['item']!r}, which is not in the pantry. "
                   "The decor is the larder.")
        if pl["draw"] not in DRAWINGS:
            refuse(f"the shelf's {pl['item']!r} has no drawing: {pl['draw']!r}")
        if pl["draw"] in drew:
            refuse(f"two pots on the shelf are drawn as {pl['draw']!r}. No two alike.")
        drew.add(pl["draw"])


def entity(v, where):
    if ENTITY.search(str(v)):
        refuse(f"{where} carries an HTML entity. Everything here is escaped on the way into the "
               "page; write the character.")


def sweep_page():
    """The room's own copy, as published, outside the stereo -- whose song titles
    are the musicians' -- and outside quotations."""
    src = PAGE.read_text()
    body = src[src.index("<main"):src.index("</main>")]
    body = re.sub(r"<!-- vpl:stereo:begin -->.*?<!-- vpl:stereo:end -->", " ", body, flags=re.S)
    body = re.sub(r"<!-- vpl:name:begin -->.*?<!-- vpl:name:end -->", " ", body, flags=re.S)
    body = re.sub(r"<blockquote.*?</blockquote>", " ", body, flags=re.S)
    body = re.sub(r"<!--.*?-->", " ", body, flags=re.S)
    sweep(body, "vital-plant-living.html")
    for m in re.finditer(r"<!-- vpl:(builder|board|counter):begin -->(.*?)<!-- vpl:\1:end -->", src, re.S):
        no_ital(m.group(2), f"the {m.group(1)}")
    ids = re.findall(r'\bid="([^"]+)"', src)
    dup = sorted({i for i in ids if ids.count(i) > 1})
    if dup:
        refuse(f"ids with two owners on the page: {', '.join(dup)}")


def main():
    d = json.loads(DATA.read_text())
    check(d)
    if problems:
        print("REFUSING:\n  " + "\n  ".join(problems))
        sys.exit(1)
    swap(PAGE, "vpl:shelf", shelf_svg(d["plants"]), "    ")
    swap(PAGE, "vpl:window", window(d), "")
    swap(PAGE, "vpl:builder", builder(d), "      ")
    swap(PAGE, "vpl:board", combos(d), "")
    swap(PAGE, "vpl:counter", counter(d), "")
    swap(PAGE, "vpl:stereo", stereo(d), "")
    swap(PAGE, "vpl:cap", cap(), "")
    swap(NOTES, "vital-credits", liner(d), "      ")
    sweep_page()
    if problems:
        print("REFUSING (the page as written):\n  " + "\n  ".join(problems))
        sys.exit(1)
    print("vital plant living: shelf, builder, board, counter and stereo written")


if __name__ == "__main__":
    main()
