#!/usr/bin/env python3
"""Build the Dopamine Dress-Up Den out of data/dressup.json: the valet stand as
it stands when you walk in, the rails, the looks off the peg, the cuts and
prints the stand is redrawn from, and the room's credits.

WHAT THE ROOM IS. A boutique on the street for dopamine dressing -- Helen
Edgar's suggestion, and her name for it -- where you put an outfit together on
a wooden valet stand out of the rails: something on your head, something over
the top, something underneath, the bottom half, your feet, and a boa or a scarf
if you want one. Every piece comes in every print and every colourway, and
nothing has to go with anything.

NOBODY'S BODY IS DRAWN, AND THAT IS THE ROOM'S ONE CLAIM ABOUT BODIES. The
obvious build is a paper doll, and a doll is a body: a size, a shape, a skin, a
gender, drawn once and handed to everybody who walks in. So the clothes hang on
a stand -- a knob for a hat, a bar for the shoulders, a bar for the waist, a
base for the shoes -- and whoever is wearing them is you. Laughingstock's rule,
that we do not draw anybody's body for them, arriving in the room where the
temptation is the whole shape of the thing.

IT REFUSES, RATHER THAN TRUSTS:

  - A GARMENT OR A PRINT WITH NO DRAWING, and two garments drawn alike.
    make-guild.py's refusal of a room with no marker drawing: the failure is not
    an error anywhere, it is a thing somebody picks that never appears on the
    stand, which reads as broken.

  - A GARMENT THAT DOES NOT SAY HOW IT FEELS AND HOW IT GOES ON. Our glossary
    defines dopamine dressing as colours, textures and styles, and Ryan wears
    his pants for how they feel first. A rail that only said how things look
    would be half of it. See _feel.

  - A SET OF COLOURWAYS WITH NO ALL-BLACK ONE. Black is a colour in here. See
    _black: a room that told people colour was the cure would be the dress code
    our own glossary entry is about, with a nicer name.

  - AN INK love.css DOES NOT DECLARE, read out of the stylesheet rather than
    listed here, because CSS drops an unknown custom property and paints
    nothing -- Covenstead's kettle.

  - A LOOK WITH SOMEBODY'S NAME ON IT AND NOT THEIR WORDS. A look that names a
    person carries who gave it, when, and what they said, and it may only use
    pieces that are on the rails. Helen's was relayed, and she has the final say.

  - THE VOCABULARY OF BODIES, OF GENDERED RAILS, OF FASHION RULES, OF BRAIN
    CHEMISTRY, OF OTHERING AND OF SCORING, in the room's own voice, with the
    negation window every sweep here uses, so the room can still say out loud
    that it does none of these things. Skipping blockquotes, and the looks'
    as-given lines, which are people's own words:
      · bodies: flattering, slimming, figure, body type, sizes -- nothing here
        comes in a size, because nothing here is sold and nobody is measured.
      · gender: menswear, womenswear, for men, for women, feminine, masculine.
        No rail is anybody's.
      · rules: tacky, garish, drab, too much, age-appropriate, goes with. The
        site's own motto is that clashing is not the same as illegible.
      · brain chemistry: boost, serotonin, neurotransmitter, mood-boosting,
        science says. Dopamine is in the name because that is what people call
        it; nothing here claims a colour does anything to anybody's brain,
        which is a claim a page cannot check and every wellness page makes.
      · othering: exotic, ethnic, authentic, tribal, oriental, gypsy, harem
        pants -- the words that turn somebody else's garment into a costume.
        The haori and the pants are named plainly and credited to Wikipedia.
      · scoring: rating, score, likes, votes, best-dressed. A dress-up room is
        exactly the shape of thing that grows a rate-my-outfit button.

  - "THE DEN" ON ITS OWN. A room called The Den is already on this street,
    behind the Jungle Room, and it is Graceland's. This room is the Dress-Up
    Den in full, everywhere, unless the words are a link to that other room.

  - ANYTHING IN dressup.js THAT STORES, SENDS OR READS THE INTENSITY. The rails
    keep nothing and send nothing, and no garment is behind the dial: the
    sequins are on the rail at Gentle too.

  - AN ID WITH TWO OWNERS on the page, before check-ids.py has to.

It writes nothing if anything is refused. Run it after editing the data file,
then make-og.py, because the share card lifts the stand off the page.
"""
import html
import json
import math
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data/dressup.json"
PAGE = ROOT / "dopamine-dress-up-den.html"
NOTES = ROOT / "liner-notes.html"
CSS = ROOT / "love.css"
JS = ROOT / "dressup.js"

SLOTS = ("head", "outer", "top", "bottom", "feet")
# Back to front. The feet go first so a hem or a trouser leg falls over the top
# of a boot, and the head goes last so a big wig sits over the collar.
PAINT = ("feet", "bottom", "top", "outer", "boa", "scarf", "head")
BLACKS = {"black", "coal"}
ENTITY = re.compile(r"&(?:[a-zA-Z][a-zA-Z0-9]{1,31}|#\d{1,6}|#x[0-9a-fA-F]{1,6});")

NEGATION = (r"(?:no|not|nothing|never|neither|none|without|refuses?|refused|refusing|"
            r"cannot|does not|do not|won't|will not|is not|are not|isn't|aren't|nobody|"
            r"nor|declin\w+|instead of)")

BODY = (r"flatter\w*|slimming|figure[- ]hugging|body types?|body shapes?|your shape|"
        r"petite|plus[- ]size\w*|curvy|hourglass|tummy|sizes?|sized|sizing|measured|measurements?")
GENDER = (r"menswear|womenswear|men'?s|women'?s|ladies'?|gents|unisex|"
          r"for (?:men|women|boys|girls)|feminine|masculine|girly|manly")
RULES = (r"tacky|garish|gaudy|tasteless|frumpy|drab|dull|too much|age[- ]appropriate|"
         r"(?:in)?appropriate|fashion rules?|should(?:n't| not)? wear|must wear|never wear|"
         r"go(?:es)? (?:well )?with|matching|mismatch\w*|fashion police|faux pas")
BRAIN = (r"boost\w*|serotonin|neurotransmitters?|brain chemistry|dopamine (?:hit|rush|boost)|"
         r"mood[- ]boost\w*|science (?:says|shows)|studies show|proven|happy hormones?")
OTHER = r"exotic\w*|ethnic\w*|authentic\w*|tribal|oriental|gyps(?:y|ies)|harem pants|costume"
# `likes` IS NOT A BARE WORD HERE, for check-counts.py's first-run reason and
# make-guild.py's `points`: "wherever you like" is the verb. A like is only a
# like when there is a button or a count on it.
TALLY = (r"scores?|scored|scoring|ratings?|rate (?:my|your|this)|like (?:buttons?|counts?)|"
         r"likes? count|votes?|voted|"
         r"best[- ]dressed|worst[- ]dressed|ranked|rankings?|streaks?|leaderboards?")

VOCAB = [
    (BODY, "nothing here comes in a size and nobody is measured; no word here is about "
           "anybody's body. See the docstring."),
    (GENDER, "no rail in here is anybody's; clothes are not gendered in this room."),
    (RULES, "nothing in here has to go with anything, and nothing is too much. Clashing "
            "is not the same as illegible."),
    (BRAIN, "dopamine is in the name because that is what people call it; the room "
            "makes no claim about anybody's brain chemistry."),
    (OTHER, "the haori and the pants are named plainly, and nothing on the rails is "
            "anybody's costume."),
    (TALLY, "nothing in here is rated, scored, counted or voted on."),
]
# THE BARE NAME OF ANOTHER ROOM. The lookbehind lets "Dress-Up Den" through.
OTHER_DEN = re.compile(r"(?<!Dress-Up )\b[Tt]he Den\b")

problems = []


def refuse(msg):
    problems.append(msg)


def esc(s):
    return html.escape(str(s), quote=False)


def attr(s):
    return html.escape(str(s), quote=True)


def plain(text):
    return html.unescape(re.sub(r"<[^>]+>", " ", str(text)))


def sweep(text, where):
    text = plain(text)
    for pat, why in VOCAB:
        for m in re.finditer(rf"\b(?:{pat})\b", text, re.I):
            window = text[max(0, m.start() - 90):m.end()]
            if re.search(rf"\b{NEGATION}\b[^.;]{{0,80}}?\b(?:{pat})", window, re.I):
                continue
            refuse(f"{where}: {m.group(0)!r} -- {why}")


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


def fabric_inks():
    """The fabric inks love.css declares. Read out of the stylesheet so a
    colourway cannot name an ink that renders as nothing."""
    return set(re.findall(r"--dd-f-([a-z]+):", CSS.read_text()))


# ── The cuts ─────────────────────────────────────────────────────────────────
# One drawing per garment, in the stand's own coordinates (a 400 x 600 box: the
# knob at 200,86, the shoulder bar about y 150-176, the waist bar at 318, the
# base at 578). Every piece of cloth is a .dd-fab path, filled by love.css with
# the slot's own pattern and outlined in the room's ink; every seam, lace and
# cord is a .dd-seam stroke; every button, clasp and knot a .dd-knot. NOTHING
# HERE IS A BODY PART, and no drawing may name one: see body_free().

def fab(d):
    return f'<path class="dd-fab" d="{d}"/>'


def ball(cx, cy, r):
    return f'<circle class="dd-fab" cx="{cx}" cy="{cy}" r="{r}"/>'


def seam(d):
    return f'<path class="dd-seam" d="{d}"/>'


def knot(cx, cy, r=3.4):
    return f'<circle class="dd-knot" cx="{cx}" cy="{cy}" r="{r}"/>'


def mirror(d):
    """The same path reflected about the pole, x -> 400 - x. Every garment here
    is symmetrical, because it is hanging up and nobody is standing in it."""
    out, nums = [], re.findall(r"[A-Za-z]|-?\d+(?:\.\d+)?", d)
    cmd, k = None, 0
    for t in nums:
        if t.isalpha():
            cmd, k = t, 0
            out.append(t)
            continue
        v = float(t)
        if cmd in "MLQCT":
            v = 400 - v if k % 2 == 0 else v
        elif cmd == "H":
            v = 400 - v
        k += 1
        out.append(f"{v:g}")
    return " ".join(out)


def pair(d):
    return fab(d) + fab(mirror(d))


CUTS = {
    # ── On your head ──
    "slouchy-beanie": lambda: (
        fab("M166 104 Q160 58 196 46 Q238 36 258 66 Q272 94 250 120 Q240 106 234 100 Z")
        + fab("M164 92 Q200 104 236 94 L236 110 Q200 120 164 108 Z")
        + seam("M176 97 V112 M188 100 V115 M200 101 V116 M212 100 V115 M224 98 V112")),
    "beanie": lambda: (
        fab("M170 96 Q170 52 200 50 Q230 52 230 96 Z")
        + fab("M164 90 H236 V110 H164 Z")
        + ball(200, 44, 11)
        + seam("M176 92 V108 M188 92 V108 M200 92 V108 M212 92 V108 M224 92 V108")),
    "wide-brim": lambda: (
        fab("M172 100 Q174 70 190 46 Q198 30 206 40 Q210 64 228 100 Q200 106 172 100 Z")
        + fab("M122 104 Q200 84 278 104 Q200 124 122 104 Z")
        + seam("M175 94 Q200 100 226 94")),
    "headscarf": lambda: (
        fab("M226 100 Q248 108 252 138 L240 142 Q236 118 222 106 Z")
        + fab("M228 100 Q256 100 266 122 L256 128 Q246 110 226 106 Z")
        + fab("M166 104 Q162 58 200 54 Q238 58 234 104 Q200 114 166 104 Z")
        + ball(228, 102, 7)
        + seam("M172 82 Q200 72 228 82")),
    "wig": lambda: ball(200, 98, 50) + "".join(ball(x, y, r) for x, y, r in (
        (160, 138, 17), (240, 138, 17), (150, 112, 19), (250, 112, 19),
        (152, 84, 20), (248, 84, 20), (172, 60, 20), (228, 60, 20), (200, 50, 21),
        (182, 74, 18), (218, 74, 18), (200, 84, 18), (178, 104, 16), (222, 104, 16))),

    # ── Over the top ──
    "haori": lambda: (
        pair("M104 168 L50 178 L46 304 Q70 318 100 304 Z")
        + pair("M168 150 L104 168 L98 366 H172 Q170 260 184 170 Z")
        + pair("M166 150 L176 150 Q192 200 182 366 L172 366 Q180 200 166 150 Z")
        + seam("M182 240 Q200 250 218 240") + knot(200, 247, 4)),
    "cardigan": lambda: (
        pair("M104 168 L84 176 L64 336 L94 342 L112 230 Z")
        + pair("M64 336 L94 342 L92 356 L62 350 Z")
        + pair("M172 150 L104 168 L100 404 H184 L188 176 Z")
        + seam("M112 392 V404 M124 392 V404 M136 392 V404 M148 392 V404 M160 392 V404 M172 392 V404 "
               "M228 392 V404 M240 392 V404 M252 392 V404 M264 392 V404 M276 392 V404 M288 392 V404")
        + seam("M118 318 H164 V356 H118 Z M236 318 H282 V356 H236 Z")
        + "".join(knot(179, y) for y in (212, 252, 292, 332, 372))),
    "hoodie": lambda: (
        fab("M146 158 Q150 112 200 108 Q250 112 254 158 Q228 146 200 148 Q172 146 146 158 Z")
        + pair("M106 170 L84 178 L64 338 L94 344 L112 232 Z")
        + pair("M64 338 L94 344 L92 358 L62 352 Z")
        + fab("M146 156 L106 170 L108 354 Q200 362 292 354 L294 170 L254 156 "
              "Q230 168 200 170 Q170 168 146 156 Z")
        + seam("M200 170 V360 M152 296 L192 290 V338 H152 Z M248 296 L208 290 V338 H248 Z "
               "M108 340 Q200 348 292 340 M188 170 V206 M212 170 V206")
        + '<rect class="dd-knot" x="196" y="184" width="8" height="13" rx="2"/>'),
    "cape": lambda: (
        pair("M168 144 L98 178 Q58 332 50 474 Q110 488 170 480 Q178 320 190 158 Z")
        + fab("M168 144 Q200 128 232 144 L226 160 Q200 150 174 160 Z")
        + seam("M112 260 Q96 380 88 476 M288 260 Q304 380 312 476")
        + knot(200, 158, 6)),
    "sequin-jacket": lambda: (
        pair("M106 168 L86 176 L70 318 L98 322 L112 226 Z")
        + pair("M170 150 L106 168 L106 300 H194 L192 180 Z")
        + pair("M170 150 L192 180 L178 216 L160 170 Z")
        + seam("M112 290 H192 M208 290 H288")),

    # ── Underneath ──
    "button-down": lambda: (
        pair("M100 172 L80 180 L66 322 L94 326 L108 222 Z")
        + pair("M66 322 L94 326 L92 340 L64 336 Z")
        + fab("M134 156 L100 172 L104 338 Q200 348 296 338 L300 172 L266 156 L234 150 "
              "L200 182 L166 150 Z")
        + pair("M166 150 L200 182 L186 194 L156 164 Z")
        + seam("M200 182 V344 M222 214 H254 V240 H222 Z")
        + "".join(knot(200, y, 3.2) for y in (206, 236, 266, 296, 326))),
    "tee": lambda: (
        pair("M104 170 L76 214 L100 232 L108 214 Z")
        + fab("M132 156 L104 170 L106 336 Q200 346 294 336 L296 170 L268 156 "
              "Q240 152 230 156 Q200 182 170 156 Q160 152 132 156 Z")
        + seam("M170 156 Q200 188 230 156")),
    "corset": lambda: (
        pair("M150 162 L158 152 L166 156 L164 200 L156 200 Z")
        + fab("M146 196 Q170 180 200 188 Q230 180 254 196 Q240 262 258 336 "
              "Q200 348 142 336 Q160 262 146 196 Z")
        + seam("M170 190 Q164 262 170 340 M230 190 Q236 262 230 340 "
               "M192 202 L208 216 L192 230 L208 244 L192 258 L208 272 L192 286 "
               "L208 300 L192 314 L208 328")),
    "flowing-dress": lambda: (
        pair("M110 172 L82 206 Q94 222 114 214 Z")
        + fab("M134 156 L110 172 Q120 250 106 306 Q76 420 58 482 Q200 504 342 482 "
              "Q324 420 294 306 Q280 250 290 172 L266 156 Q238 152 228 158 "
              "Q200 184 172 158 Q162 152 134 156 Z")
        + seam("M114 262 Q200 274 286 262 M150 320 Q136 400 120 488 M200 280 V500 "
               "M250 320 Q264 400 280 488")),
    "gown": lambda: (
        pair("M150 162 L156 148 L164 150 L162 170 Z")
        + fab("M150 162 Q162 200 146 246 Q160 300 146 340 Q106 440 74 548 "
              "Q200 568 326 548 Q294 440 254 340 Q240 300 254 246 Q238 200 250 162 "
              "Q226 176 200 176 Q174 176 150 162 Z")
        + seam("M120 470 Q110 510 104 552 M280 470 Q290 510 296 552 M200 360 V560")),

    # ── The bottom half ──
    "fisherman": lambda: (
        fab("M104 330 H296 L304 376 L302 566 H214 L204 414 H196 L186 566 H98 L96 376 Z")
        + fab("M100 310 H300 L304 348 H96 Z")
        + seam("M194 350 Q186 366 190 382 M206 350 Q214 366 210 382 "
               "M100 552 H186 M214 552 H300")
        + ball(200, 350, 6)),
    "skirt": lambda: (
        fab("M128 312 H272 Q298 430 324 560 Q200 576 76 560 Q102 430 128 312 Z")
        + fab("M126 310 H274 V330 H126 Z")
        + seam("M160 330 Q146 440 130 566 M200 330 V572 M240 330 Q254 440 270 566")),
    "wide-leg": lambda: (
        fab("M120 324 H280 L298 566 H212 L202 406 H198 L188 566 H102 Z")
        + fab("M118 310 H282 V330 H118 Z")
        + seam("M190 330 Q186 350 180 364 M210 330 Q214 350 220 364 "
               "M146 344 L140 560 M254 344 L260 560")),
    "leggings": lambda: (
        fab("M140 324 H260 L252 566 H214 L204 392 H196 L186 566 H148 Z")
        + fab("M138 310 H262 V328 H138 Z")),

    # ── On your feet ── (a pair, the right one the left one moved along the base)
    "platforms": lambda: shoes(
        fab("M138 486 H170 L172 540 Q194 542 198 554 V560 H134 L136 540 Z")
        + fab("M130 560 H202 V578 H130 Z") + seam("M166 494 V548")),
    "slip-ons": lambda: shoes(
        fab("M128 562 Q132 548 152 546 Q184 546 196 562 L198 570 H126 Z")
        + fab("M124 570 H200 V578 H124 Z") + seam("M150 552 Q164 546 176 552")),
    "crocs": lambda: shoes(
        fab("M126 552 Q128 530 156 528 Q190 528 200 550 L202 566 Q202 576 190 576 H136 "
            "Q124 576 124 566 Z")
        + seam("M126 566 H200 M146 546 Q136 560 150 572")
        + "".join(knot(x, y, 2.3) for x, y in ((160, 538), (172, 538), (184, 542),
                                               (166, 548), (178, 550), (190, 554)))
        + knot(146, 548, 3)),
    "hi-tops": lambda: shoes(
        fab("M136 520 H168 L172 546 Q194 548 198 560 V566 H132 V546 Z")
        + fab("M128 566 H202 V578 H128 Z")
        + seam("M142 528 H164 M142 538 H166 M144 548 H168")),
    "socks": lambda: shoes(
        fab("M140 504 H166 L166 548 Q190 548 194 564 Q194 578 180 578 H140 Z")
        + seam("M140 516 H166")),

    # ── And the rest ──
    "boa": lambda: "".join(
        ball(round(x, 1), round(y, 1), 11) for x, y in boa_points()),
    "scarf": lambda: (
        fab("M176 148 Q200 172 224 148 L234 154 L240 392 H216 L212 180 Q200 188 188 180 "
            "L184 392 H160 L166 154 Z")
        + seam("M164 392 v10 M170 392 v10 M176 392 v10 M182 392 v10 "
               "M218 392 v10 M224 392 v10 M230 392 v10 M236 392 v10")),
}


def shoes(one):
    return one + f'<g transform="translate(84 0)">{one}</g>'


def boa_points():
    pts = [(188, 146), (200, 143), (212, 146)]
    for i in range(12):
        t = i / 11
        x = 178 - 30 * t + 7 * math.sin(t * math.pi * 3)
        y = 152 + 232 * t
        pts += [(x, y), (400 - x, y)]
    return pts


# ── The prints ───────────────────────────────────────────────────────────────
# One tile per print, drawn in the pattern's own custom properties: --c1 to --c6
# are the colourway's inks cycled through six, for the prints that use them all
# (stripes, blocks, patchwork); --g is the ground and --f1 to --f5 the other
# inks cycled, for the prints that put a figure on a ground (dots, flowers,
# moons, sequins, gingham), so a two-ink colourway never draws a figure in its
# own ground colour and vanishes. The inks are set on the <pattern> element and
# its children inherit them; love.css never has to know which is on.

def rect(x, y, w, h, fill, extra=""):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="var(--{fill})"{extra}/>'


def dot(cx, cy, r, fill):
    return f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="var(--{fill})"/>'


def flower(cx, cy, petal, middle):
    out = []
    for k in range(5):
        a = -math.pi / 2 + k * 2 * math.pi / 5
        out.append(dot(round(cx + 7 * math.cos(a), 1), round(cy + 7 * math.sin(a), 1), 5.6, petal))
    out.append(dot(cx, cy, 3.8, middle))
    return "".join(out)


STITCH = ('<path d="M24 0 V72 M48 0 V72 M0 24 H72 M0 48 H72" fill="none" '
          'stroke="var(--dd-ink)" stroke-width="1" stroke-dasharray="3 3" opacity=".7"/>')

PRINTS = {
    "solid": (20, 20, lambda: rect(0, 0, 20, 20, "g")),
    "stripes": (36, 36, lambda: "".join(rect(0, 6 * i, 36, 6, f"c{i+1}") for i in range(6))),
    "dots": (42, 42, lambda: rect(0, 0, 42, 42, "g") + "".join(
        dot(x, y, 4.4, f) for x, y, f in ((7, 7, "f1"), (28, 7, "f2"), (17.5, 21, "f3"),
                                          (38.5, 21, "f4"), (7, 35, "f5"), (28, 35, "f1")))),
    "gingham": (24, 24, lambda: rect(0, 0, 24, 24, "g")
                + rect(0, 0, 12, 24, "f1", ' opacity=".55"') + rect(0, 0, 24, 12, "f1", ' opacity=".55"')),
    "floral": (60, 60, lambda: rect(0, 0, 60, 60, "g")
               + '<ellipse cx="31" cy="24" rx="6" ry="2.8" fill="var(--f2)"/>'
               + '<ellipse cx="28" cy="46" rx="6" ry="2.8" fill="var(--f4)"/>'
               + flower(15, 16, "f1", "f2") + flower(45, 42, "f3", "f4") + dot(47, 11, 2.2, "f5")),
    "blocks": (120, 80, lambda: "".join(
        rect(40 * (i % 3), 40 * (i // 3), 40, 40, f"c{i+1}") for i in range(6))),
    "patchwork": (72, 72, lambda: "".join(
        rect(24 * (i % 3), 24 * (i // 3), 24, 24, f"c{n}")
        for i, n in enumerate((1, 2, 3, 4, 5, 6, 3, 1, 2)))
        + dot(8, 8, 2.2, "f1") + dot(16, 16, 2.2, "f1") + STITCH),
    "moons": (48, 48, lambda: rect(0, 0, 48, 48, "g")
              + '<path d="M16 8 A9 9 0 1 0 24 24 A7 7 0 1 1 16 8 Z" fill="var(--f1)"/>'
              + '<path d="M36 26 L38 32 L44 34 L38 36 L36 42 L34 36 L28 34 L34 32 Z" fill="var(--f2)"/>'
              + dot(40, 10, 1.6, "f2") + dot(10, 40, 1.6, "f1")),
    "sequins": (12, 10, lambda: rect(0, 0, 12, 10, "g")
                + '<circle cx="3" cy="3" r="3.2" fill="var(--f1)" stroke="var(--g)" stroke-width=".6"/>'
                + '<circle cx="9" cy="8" r="3.2" fill="var(--f2)" stroke="var(--g)" stroke-width=".6"/>'),
}


def ink_vars(inks):
    """The custom properties a pattern carries, for one colourway."""
    n = len(inks)
    rest = inks[1:] or inks
    parts = [f"--g:var(--dd-f-{inks[0]})"]
    parts += [f"--c{i+1}:var(--dd-f-{inks[i % n]})" for i in range(6)]
    parts += [f"--f{i+1}:var(--dd-f-{rest[i % len(rest)]})" for i in range(5)]
    return ";".join(parts)


def pattern(slot, print_key, inks):
    w, h, draw = PRINTS[print_key]
    return (f'<pattern id="dd-p-{slot}" class="dd-pat" patternUnits="userSpaceOnUse" '
            f'width="{w}" height="{h}" style="{ink_vars(inks)}">{draw()}</pattern>')


# ── The stand ────────────────────────────────────────────────────────────────
# A wooden valet stand on a lavender wall, and the light is the one thing in the
# picture that is not cloth or wood: a crystal hanging in the window throws
# small rainbows about the wall. They are behind everything, they carry no word,
# and at MAX they drift a little, with a translate, as the crystal turns.

FLECKS = ((96, 118, 18, 5), (322, 84, 5, 17), (352, 280, 18, 5), (40, 334, 5, 17),
          (62, 470, 18, 5), (346, 452, 5, 17), (132, 30, 16, 4), (268, 230, 16, 4))

WOOD = (
    '<rect class="dd-wood" x="195" y="96" width="10" height="484" rx="3"/>'
    '<circle class="dd-wood" cx="200" cy="86" r="14"/>'
    '<path class="dd-wood" d="M84 176 Q200 128 316 176 L316 186 Q200 140 84 186 Z"/>'
    '<rect class="dd-wood" x="118" y="318" width="164" height="9" rx="4"/>'
    '<rect class="dd-wood" x="110" y="578" width="180" height="14" rx="7"/>')


def stand(d, look):
    cw = {c["key"]: c for c in d["colourways"]}
    wearing = dict(look["pieces"])
    wearing.update({k: dict(v, garment=k) for k, v in look.get("extras", {}).items()})
    defs = [
        '<linearGradient id="dd-spectrum" x1="0" x2="1" y1="0" y2="0">'
        + "".join(f'<stop offset="{i/5:.2f}" stop-color="var(--dd-sp-{i+1})"/>' for i in range(6))
        + '</linearGradient>',
        '<linearGradient id="dd-spectrum-v" x1="0" x2="0" y1="0" y2="1">'
        + "".join(f'<stop offset="{i/5:.2f}" stop-color="var(--dd-sp-{i+1})"/>' for i in range(6))
        + '</linearGradient>',
    ]
    # EVERY SLOT HAS A PATTERN WHETHER OR NOT ANYTHING IS ON IT, so the script
    # only ever rewrites one; an empty slot is solid in the first colourway.
    first = d["colourways"][0]["inks"]
    for slot in PAINT:
        w = wearing.get(slot)
        defs.append(pattern(slot, w["print"], cw[w["colours"]]["inks"]) if w
                    else pattern(slot, "solid", first))
    out = ['<svg class="dd-stand" id="dd-stand" viewBox="0 0 400 600" fill="none" '
           'xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">',
           f'  <defs>{"".join(defs)}</defs>',
           '  <g class="dd-flecks">' + "".join(
               f'<ellipse class="dd-fleck" cx="{x}" cy="{y}" rx="{rx}" ry="{ry}" '
               f'fill="url(#{"dd-spectrum" if rx > ry else "dd-spectrum-v"})"/>'
               for x, y, rx, ry in FLECKS) + '</g>',
           '  <g class="dd-crystal"><path class="dd-seam" d="M52 0 V40"/>'
           '<path class="dd-glass" d="M52 40 L63 55 L52 80 L41 55 Z"/>'
           '<path class="dd-seam" d="M41 55 H63 M52 40 V80"/></g>',
           f'  <g class="dd-woodwork">{WOOD}</g>']
    for slot in PAINT:
        w = wearing.get(slot)
        inner = CUTS[w["garment"]]() if w else ""
        out.append(f'  <g class="dd-slot dd-slot--{slot}" data-slot="{slot}">{inner}</g>')
    out.append('</svg>')
    return "\n".join(out)


def cuts_template(d):
    """Every cut and every print, once, for dressup.js to clone. A <template>
    so none of it renders and none of it is in the accessibility tree; the
    <svg> wrappers are there so the parser puts the children in the SVG
    namespace."""
    gs = [g["key"] for s in d["slots"] for g in s["garments"]] + [x["key"] for x in d["extras"]]
    cuts = "".join(f'<g data-cut="{k}">{CUTS[k]()}</g>' for k in gs)
    prints = "".join(f'<g data-print="{k}" data-w="{w}" data-h="{h}">{draw()}</g>'
                     for k, (w, h, draw) in PRINTS.items())
    return (f'<template id="dd-cuts"><svg xmlns="http://www.w3.org/2000/svg">{cuts}</svg>'
            f'<svg xmlns="http://www.w3.org/2000/svg">{prints}</svg></template>')


# ── Words ────────────────────────────────────────────────────────────────────

def phrase(d, garment_a, print_key, colours_key):
    """A piece in words, the same way dressup.js says it, so the readout the
    page ships with and the one the script writes read alike."""
    pr = {p["key"]: p for p in d["prints"]}[print_key]
    cw = {c["key"]: c for c in d["colourways"]}[colours_key]
    if print_key == "solid":
        return f"{garment_a} in plain {d['ink_names'][cw['inks'][0]]}"
    return f"{garment_a} {pr['a']}, {cw['name']}"


def look_lines(d, look):
    names = {g["key"]: g for s in d["slots"] for g in s["garments"]}
    names.update({x["key"]: x for x in d["extras"]})
    lines = []
    for s in d["slots"]:
        p = look["pieces"].get(s["key"])
        if p:
            lines.append((s["name"], phrase(d, names[p["garment"]]["a"], p["print"], p["colours"])))
    for k, p in look.get("extras", {}).items():
        lines.append(("And", phrase(d, names[k]["a"], p["print"], p["colours"])))
    return lines


def readout(d, look):
    parts = [p for _, p in look_lines(d, look)]
    if not parts:
        return "The stand is bare. Everything is whatever you have on."
    if len(parts) > 1:
        parts[-1] = "and " + parts[-1]
    return "On the stand: " + "; ".join(parts) + "."


def choice(kind, name, iid, value, label, checked, data="", feel="", on=""):
    lines = ""
    if feel:
        lines += f'<span class="dd-hanger__feel">{esc(feel)}</span>'
    if on:
        lines += f'<span class="dd-hanger__on">{esc(on)}</span>'
    return (f'<li><label class="dd-hanger" for="{iid}"><input type="{kind}" id="{iid}" '
            f'name="{name}" value="{attr(value)}"{data}{" checked" if checked else ""}>'
            f'<span class="dd-hanger__words"><span class="dd-hanger__name">{esc(label)}</span>'
            f'{lines}</span></label></li>')


def cloth(d, key, label, on_now):
    """The print and colourway for one slot. Shipped hidden: without the script
    they would change nothing, and a page with scripts off shows no dead
    control."""
    p_now = on_now.get("print", "solid") if on_now else "solid"
    c_now = on_now.get("colours", d["colourways"][0]["key"]) if on_now else d["colourways"][0]["key"]
    popts = "".join(
        f'<option value="{p["key"]}" data-a="{attr(p["a"])}"{" selected" if p["key"] == p_now else ""}>'
        f'{esc(p["name"])}</option>' for p in d["prints"])
    copts = "".join(
        f'<option value="{c["key"]}" data-inks="{"|".join(c["inks"])}" '
        f'data-first="{attr(d["ink_names"][c["inks"][0]])}"{" selected" if c["key"] == c_now else ""}>'
        f'{esc(c["name"])}</option>' for c in d["colourways"])
    return (f'<div class="dd-cloth" hidden>'
            f'<label class="dd-cloth__lab" for="dd-{key}-print">{esc(label)}: print</label>'
            f'<select class="dd-cloth__pick" id="dd-{key}-print" data-part="print">{popts}</select>'
            f'<label class="dd-cloth__lab" for="dd-{key}-colours">{esc(label)}: colours</label>'
            f'<select class="dd-cloth__pick" id="dd-{key}-colours" data-part="colours">{copts}</select>'
            f'</div>')


def rails(d, look):
    out = []
    for s in d["slots"]:
        now = look["pieces"].get(s["key"])
        out.append(f'      <fieldset class="dd-rail" id="dd-rail-{s["key"]}" data-slot="{s["key"]}">')
        out.append(f'        <legend class="dd-rail__name">{esc(s["name"])}</legend>')
        out.append('        <ul class="dd-hangers">')
        out.append('          ' + choice("radio", f"dd-{s['key']}", f"dd-{s['key']}-own", "own",
                                         "Your own", not now,
                                         ' data-a=""', feel="Whatever you came in with, or nothing at all."))
        for g in s["garments"]:
            out.append('          ' + choice(
                "radio", f"dd-{s['key']}", f"dd-{s['key']}-{g['key']}", g["key"], g["name"],
                bool(now and now["garment"] == g["key"]), f' data-a="{attr(g["a"])}"',
                g["feel"], g["on"]))
        out.append('        </ul>')
        out.append('        ' + cloth(d, s["key"], s["name"], now))
        out.append('      </fieldset>')
    out.append('      <fieldset class="dd-rail" id="dd-rail-extras" data-slot="extras">')
    out.append('        <legend class="dd-rail__name">And the rest</legend>')
    for x in d["extras"]:
        now = look.get("extras", {}).get(x["key"])
        out.append(f'        <div class="dd-extra" data-extra="{x["key"]}">')
        out.append('          <ul class="dd-hangers">')
        out.append('            ' + choice("checkbox", f"dd-x-{x['key']}", f"dd-x-{x['key']}",
                                           x["key"], x["name"], bool(now), f' data-a="{attr(x["a"])}"',
                                           x["feel"], x["on"]))
        out.append('          </ul>')
        out.append('          ' + cloth(d, "x-" + x["key"], x["name"], now))
        out.append('        </div>')
    out.append('      </fieldset>')
    return "\n".join(out)


def looks(d):
    out = ['    <ul class="dd-looks">']
    for lk in d["looks"]:
        code = [f"{s}:{p['garment']}:{p['print']}:{p['colours']}" for s, p in lk["pieces"].items()]
        code += [f"+{k}:{p['print']}:{p['colours']}" for k, p in lk.get("extras", {}).items()]
        given = ""
        if lk.get("whose"):
            given = (f'        <p class="dd-look__given">{esc(lk["as_given"])}</p>\n'
                     f'        <p class="dd-look__who">&mdash; {esc(lk["given"][:1].upper() + lk["given"][1:])}</p>\n')
        out += [
            f'      <li class="dd-look" id="look-{lk["key"]}">',
            f'        <h3>{esc(lk["name"])}</h3>',
            given.rstrip("\n") if given else None,
            '        <ul class="dd-look__pieces">' + "".join(
                f'<li><span class="dd-look__slot">{esc(slot)}:</span> {esc(words)}</li>'
                for slot, words in look_lines(d, lk)) + '</ul>',
            f'        <p class="dd-look__note">{esc(lk["note"])}</p>',
            f'        <p class="dd-look__go" hidden><button type="button" class="dd-put" '
            f'data-name="{attr(lk["name"])}" data-look="{"|".join(code)}">Put this on the stand</button></p>',
            '      </li>',
        ]
        out = [o for o in out if o is not None]
    out.append('    </ul>')
    return "\n".join(out)


def cap():
    return ('    <p><code>tools/make-dressup.py</code> builds this room out of one data file, and it refuses '
            'rather than guesses. It will not build a garment that does not say how it feels and how it comes '
            'off, a garment or a print it cannot draw, a set of colours with no all-black one in it, or a look '
            'with somebody&rsquo;s name on it and not their own words. And it sweeps the room&rsquo;s own '
            'copy, so that nobody can add a word here about anybody&rsquo;s body, a rail for one gender, a rule '
            'about what goes together, a claim about brain chemistry, a word that turns somebody&rsquo;s '
            'clothes into a costume, or a way of rating an outfit.</p>')


def liner(d):
    rows = []
    for lk in d["looks"]:
        if lk.get("whose"):
            rows.append(f'      <li><strong>{esc(lk["name"])}</strong>: {esc(lk["as_given"])} '
                        f'<em>&mdash; {esc(lk["given"])}.</em></li>')
    return "\n".join(rows)


# ── The checks ───────────────────────────────────────────────────────────────

def entity(v, where):
    if ENTITY.search(str(v)):
        refuse(f"{where} carries an HTML entity. Everything here is escaped on the way into the "
               "page; write the character.")


BODY_PARTS = re.compile(r"\b(?:body|torso|skin|face|head|arm|hand|leg|foot|feet|neck|chest|"
                        r"waist|hip|breast|mannequin|doll|figure)\b", re.I)


def body_free():
    """No drawing names a body part. The cuts are paths and nothing else, and a
    class or an id that said `arm` or `torso` would be the doll arriving one
    shape at a time."""
    for k, draw in CUTS.items():
        for m in re.finditer(r'(?:class|id)="([^"]+)"', draw()):
            if BODY_PARTS.search(m.group(1)):
                refuse(f"the {k} cut names a body part ({m.group(1)!r}). Nobody's body is "
                       "drawn in this room; the clothes hang on a stand.")


def check(d):
    inks = fabric_inks()
    if not inks:
        refuse("love.css declares no --dd-f- inks, so no colourway would render.")
    keys = {}
    for s in d["slots"]:
        if s["key"] not in SLOTS:
            refuse(f"slot {s['key']!r} is not one the stand has a place for: {SLOTS}")
        for g in s["garments"]:
            where = f"garment {g.get('name')!r}"
            for f in ("key", "name", "a", "feel", "on"):
                if not g.get(f):
                    refuse(f"{where} has no {f}. Every garment says how it feels and how it goes "
                           "on and comes off. See _feel.")
            if g["key"] in keys:
                refuse(f"{where} shares its key with {keys[g['key']]}.")
            keys[g["key"]] = where
            if g["key"] not in CUTS:
                refuse(f"{where} has no drawing, so picking it would put nothing on the stand.")
    if [s["key"] for s in d["slots"]] != list(SLOTS):
        refuse(f"the slots are not the stand's, in the stand's order: {SLOTS}")
    for x in d["extras"]:
        for f in ("key", "name", "a", "feel", "on"):
            if not x.get(f):
                refuse(f"extra {x.get('name')!r} has no {f}. See _feel.")
        if x["key"] not in CUTS or x["key"] not in PAINT:
            refuse(f"extra {x['key']!r} has no drawing or no place in the painting order.")
        keys[x["key"]] = f"extra {x['name']!r}"
    for k in CUTS:
        if k not in keys:
            refuse(f"the tool draws {k!r}, which is on no rail. A stale drawing is a stale claim.")
    drawn = {}
    for k, draw in CUTS.items():
        m = draw()
        if m in drawn:
            refuse(f"{k!r} and {drawn[m]!r} are drawn alike.")
        drawn[m] = k
    body_free()

    prints = [p["key"] for p in d["prints"]]
    for p in d["prints"]:
        if p["key"] not in PRINTS:
            refuse(f"print {p['name']!r} has no tile, so picking it would paint nothing.")
    for k in PRINTS:
        if k not in prints:
            refuse(f"the tool draws a {k!r} print that is on no rail.")
    if "solid" not in prints:
        refuse("there is no plain print. A room of patterns still owes somebody a plain one.")

    names = d.get("ink_names", {})
    cws = {}
    for c in d["colourways"]:
        where = f"colourway {c.get('name')!r}"
        if c["key"] in cws:
            refuse(f"{where} is on the rails twice.")
        cws[c["key"]] = c
        if not c.get("inks") or len(c["inks"]) < 2:
            refuse(f"{where} has fewer than two inks, so no figure could stand on its ground.")
        for ink in c.get("inks", []):
            if ink not in inks:
                refuse(f"{where} names {ink!r}, which love.css does not declare as --dd-f-{ink}; "
                       "it would paint nothing.")
            if ink not in names:
                refuse(f"{where} names {ink!r}, which has no name in ink_names, so a plain "
                       "garment in it could not be said in words.")
        sweep(c["name"], where)
    if not any(set(c["inks"]) <= BLACKS for c in d["colourways"]):
        refuse("no colourway is all black. Black is a colour in here. See _black.")

    for lk in d["looks"]:
        where = f"look {lk.get('name')!r}"
        for f in ("key", "name", "note", "pieces"):
            if not lk.get(f) and f != "pieces":
                refuse(f"{where} has no {f}.")
        if lk.get("whose") and not (lk.get("given") and lk.get("as_given")):
            refuse(f"{where} has somebody's name on it and not who gave it, when, and their "
                   "words as given. See _looks.")
        if not lk.get("whose") and (lk.get("given") or lk.get("as_given")):
            refuse(f"{where} carries somebody's words and no name to go with them.")
        for slot, p in lk["pieces"].items():
            s = next((x for x in d["slots"] if x["key"] == slot), None)
            if not s or p["garment"] not in {g["key"] for g in s["garments"]}:
                refuse(f"{where} puts {p.get('garment')!r} {slot}, which is not on that rail.")
            if p["print"] not in prints or p["colours"] not in cws:
                refuse(f"{where}'s {slot} is in a print or colours the rails have not got.")
        for k, p in lk.get("extras", {}).items():
            if k not in {x["key"] for x in d["extras"]}:
                refuse(f"{where} has an extra, {k!r}, that is on no rail.")
            if p["print"] not in prints or p["colours"] not in cws:
                refuse(f"{where}'s {k} is in a print or colours the rails have not got.")
        sweep(lk["note"], f"{where} note")
        sweep(lk["name"], f"{where} name")
    if d.get("dressed_in") not in {lk["key"] for lk in d["looks"]}:
        refuse("dressed_in names no look, so the stand would ship with nothing on it by accident.")

    for s in d["slots"]:
        sweep(s["name"], f"slot {s['name']!r}")
        for g in s["garments"]:
            for f in ("name", "a", "feel", "on"):
                sweep(g[f], f"garment {g['name']!r} {f}")
                entity(g[f], f"garment {g['name']!r} {f}")
    for x in d["extras"]:
        for f in ("name", "feel", "on"):
            sweep(x[f], f"extra {x['name']!r} {f}")
    for p in d["prints"]:
        sweep(p["name"], f"print {p['name']!r}")


def check_js():
    """The rails keep nothing and send nothing, and no garment is behind the
    dial. dressup.js is read as text, comments first taken out, so its own
    explanation of what it refuses is not mistaken for doing it."""
    if not JS.exists():
        refuse("dressup.js is missing; the stand cannot change without it.")
        return
    src = re.sub(r"/\*.*?\*/", " ", JS.read_text(), flags=re.S)
    src = re.sub(r"(?m)//.*$", " ", src)
    for pat, why in ((r"localStorage|sessionStorage|indexedDB|document\.cookie", "stores something"),
                     (r"\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource", "sends something"),
                     (r"data-intensity|dataset\.intensity|love-intensity", "reads the dial"),
                     (r"Math\.random[^;]*(?:score|rate|count)", "counts something")):
        if re.search(pat, src):
            refuse(f"dressup.js {why}. The rails keep nothing, send nothing, and nothing on them "
                   "is behind the dial.")


def sweep_page():
    """The room's own copy as published, outside quotations and the looks' own
    words, which are people's."""
    src = PAGE.read_text()
    body = src[src.index("<main"):src.index("</main>")]
    body = re.sub(r"<template.*?</template>", " ", body, flags=re.S)
    body = re.sub(r"<!-- dd:cap:begin -->.*?<!-- dd:cap:end -->", " ", body, flags=re.S)
    body = re.sub(r'<p class="dd-look__given">.*?</p>', " ", body, flags=re.S)
    body = re.sub(r"<blockquote.*?</blockquote>", " ", body, flags=re.S)
    body = re.sub(r"<!--.*?-->", " ", body, flags=re.S)
    sweep(body, PAGE.name)
    no_links = re.sub(r'<a [^>]*href="the-den\.html[^"]*"[^>]*>.*?</a>', " ", body, flags=re.S)
    for m in OTHER_DEN.finditer(plain(no_links)):
        refuse(f"{PAGE.name} says {m.group(0)!r} on its own. The Den is another room on this "
               "street, Graceland's; this one is the Dress-Up Den in full, unless the words link there.")
    ids = re.findall(r'\bid="([^"]+)"', src)
    dup = sorted({i for i in ids if ids.count(i) > 1})
    if dup:
        refuse(f"ids with two owners on the page: {', '.join(dup)}")


def main():
    d = json.loads(DATA.read_text())
    check(d)
    check_js()
    if problems:
        print("REFUSING:\n  " + "\n  ".join(problems))
        sys.exit(1)
    look = next(lk for lk in d["looks"] if lk["key"] == d["dressed_in"])
    swap(PAGE, "dd:stand", stand(d, look), "        ")
    swap(PAGE, "dd:readout", f'        <p class="dd-readout" id="dd-readout">{esc(readout(d, look))}</p>',
         "        ")
    swap(PAGE, "dd:rails", rails(d, look), "      ")
    swap(PAGE, "dd:cuts", cuts_template(d), "")
    swap(PAGE, "dd:looks", looks(d), "")
    swap(PAGE, "dd:cap", cap(), "")
    swap(NOTES, "dressup-credits", liner(d), "      ")
    sweep_page()
    if problems:
        print("REFUSING (the page as written):\n  " + "\n  ".join(problems))
        sys.exit(1)
    print("dopamine dress-up den: stand, rails, looks and cuts written")


if __name__ == "__main__":
    main()
