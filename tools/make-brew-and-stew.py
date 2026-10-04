#!/usr/bin/env python3
"""Build Brew and Stew, the woodland tea room at pitch 04 on the Campgrounds, out
of data/brew-and-stew.json: the cabin, the view down at your table, the menu,
the arrangements to take to your table, the looking-glass and its rack, and the
room's credits in the liner notes.

WHAT THE ROOM IS. Ryan Boren's brief, 2026-10-04: herbal teas and plant-based
soups in a cottage or cabin in the woods, on the Campgrounds; a menu of herbal
teas, vegan soups and vegan breads; flower, grass and twig arrangements to take
to your table; a fantasy woodland cottage, cosy and mystical; the look at your
table from Pekoe and Purrs; and a rack of the videos he listed.

THE LIGHT GROWS IN THE WOOD, AND NOTHING IN THE ROOM IS A FLAME. This is the
answer to the hardest neighbour on the street: the Faery Yurt is pitched on the
same field, and it is the candlelit fae room, warm brown canvas and a flame you
could hold. So nobody lit this cabin. The light is foxfire: a pale cool glow in
the joints between the logs, in the moss and in the little mushrooms at the
foot of the walls, enough to read by and not enough to throw a shadow. The
stove is shut iron and gives the room its warmth and none of its light. The
friendly edit is a candle on every table, a lantern in the window and a string
of fairy lights along the beam, and each one turns this into the yurt with
soup; the tool refuses them in the room's voice, with the negation window, so
the room can still say it has none. See §95 for the collisions.

EVERYTHING ON THE BOARD IS VEGAN, AND THE TWO KITCHENS AND THE TWO TEA ROOMS
SHARE THEIR ENGINES. Hey, Good Cookin's allergens(), contains() and check_dish()
work out what is in every soup and loaf and refuse anything from an animal,
honey included, which is why every tea has maple syrup on the side; Pekoe and
Purrs' caffeine() works out every tea's caffeine from what is in it, and this
tool refuses a tea that has any. All three are imported, never restated.

NOTHING HERE IS A REMEDY. Herbal tea is sold everywhere as a cure for something:
sleep, nerves, digestion, a cold, a cleanse. On a Disabled people's site a menu
that prescribed would be the cure framing in a teapot, and the friendly edit is
one kind line under the chamomile. Refused in the room's voice, with the
negation window, and the channels' video titles are skipped because they are
the channels' words.

NOTHING HERE WAS FORAGED. A tea room in a wood is exactly where a menu starts
telling people what they can pick, and that is one sentence from somebody
eating what they found: Mycelium Munchies' rule. Its list is not imported,
because it refuses the words "in the woods", which are this room's address; the
narrower list below refuses picking, gathering and telling plants apart. Every
plant in an arrangement was grown in the cottage garden or dried from last
year's, nothing in one is food, and every plant is named the way a florist
would, never in Latin.

YOUR TABLE IS TABLE.JS'S, and this room only draws its own table, a slice of
log with its rings, seen from your seat, and its own things to put on it.

THE LOOKING-GLASS IS A SCREEN WITH NOTHING OF ITS OWN ON IT, and its rack is
Ryan's pick in his order, in rack.js's pattern: every button says how long
before the press, every runtime measured off the video's own watch page, titles
the channels' and not swept, and a video that looks like a re-upload of another
on the same rack is held with its reason rather than published unasked.

IF THIS REFUSES: fix the cause. Do not widen a list to make it quiet.
"""
import html
import importlib.util
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TOOLS = ROOT / "tools"
DATA = ROOT / "data/brew-and-stew.json"
PAGE = ROOT / "brew-and-stew.html"
NOTES = ROOT / "liner-notes.html"
CSS = ROOT / "love.css"
TABLE = ROOT / "table.js"
SECTION = 95          # love.css's section for this room

W, H = 1200, 620
FLOOR = 540
YT = re.compile(r"^[A-Za-z0-9_-]{11}$")
CHANNEL = re.compile(r"^UC[A-Za-z0-9_-]{22}$")
RUNTIME = re.compile(r"^(?:\d+:[0-5]\d|\d+:[0-5]\d:[0-5]\d)$")
VIDEO_KEYS = {"id", "title", "channel", "channel_id", "runtime", "published", "held"}
SCREEN = ("bns", "the looking-glass")
MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August",
          "September", "October", "November", "December"]
SECTIONS = {"teas": ("pot", {"drink"}), "soups": ("bowl", {"soup", "top"}), "breads": ("board", {"crust", "crumb"})}
ITEM_KEYS = {"key", "name", "diet", "what", "note", "vessel", "look"}
VESSELS = {"jug", "jar", "pot", "bottle", "slice", "tin"}
STEMS = {"lavender", "grass", "catkin", "pod", "puff", "frond", "twig", "heather", "thistle"}
ARR_KEYS = {"key", "name", "in", "what", "vessel", "stems"}

problems = []


def refuse(msg):
    problems.append(msg)


def tool(name):
    spec = importlib.util.spec_from_file_location(name.replace("-", "_"), TOOLS / f"{name}.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


hgc = tool("make-hey-good-cookin")
pekoe = tool("make-pekoe")


def esc(s):
    return html.escape(str(s), quote=False)


def attr(s):
    return html.escape(str(s), quote=True)


def n(v):
    v = round(float(v), 1)
    return str(int(v)) if v == int(v) else str(v)


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


# ── The voice ────────────────────────────────────────────────────────────────

NEGATION = hgc.NEGATION
REMEDY = (r"remed(?:y|ies|ial)|heal(?:s|ing|ed|er)?|cures?|cured|curing|medicin\w*|therap\w*|"
          r"detox\w*|cleans(?:e|es|ing)|immun\w*|boost\w*|tonics?|wellness|anxiety|insomnia|"
          r"sleep aid|calming|soothing|soothes|de-?stress\w*|anti-?inflammator\w*|digesti\w*|"
          r"metabolism|good for (?:you|your)|for colds?|for a cold|treat(?:s|ment|ments)?\b")
FORAGE = (r"forag\w*|wild[- ](?:picked|gathered|harvested|grown)|(?:picked|gathered|collected) "
          r"(?:from|in) the (?:woods?|forest|hedgerows?)|hedgerow harvest|identif\w+|look-?alikes?|"
          r"safe to eat|edible|poisonous|toxic|field guide|how to (?:find|pick|spot|tell)")
FLAME = (r"candles?|candlelit|candlelight|lanterns?|lamps?|lamplight|lamplit|firelight|fairy lights|"
         r"tealights?|oil lamps?")
SOLD = r"prices?|priced|\$\s*\d|\d+\s*(?:dollars|pounds|euros)"
VOCAB = [
    (REMEDY, "a remedy. Nothing here is: herbal tea is sold everywhere as a cure for something, and a "
             "menu that prescribed would be the cure framing in a teapot."),
    (FORAGE, "foraging or telling plants apart. Nothing here was picked in the wood, and the room is not a "
             "field guide: Mycelium Munchies' rule."),
    (FLAME, "a flame, which this room has none of. The light grows in the wood; a candle or a lantern "
            "makes it the Faery Yurt with soup."),
    (SOLD, "a price. The board has none."),
    (hgc.DIET, "a verdict on food or on a body, Hey, Good Cookin's refusal: food is food."),
    (hgc.PICKY, "sorting eaters. Nobody here is picky."),
]


def sweep(text, where):
    text = html.unescape(re.sub(r"<[^>]+>", " ", str(text)))
    # Look-arounds rather than \b, because a price starts with "$", which is not
    # a word character, so \b could never stand before it: Glow Go Gee Gaws'
    # lesson, found again when this was broken on purpose.
    for pat, why in VOCAB:
        for m in re.finditer(rf"(?<!\w)(?:{pat})(?!\w)", text, re.I):
            window = text[max(0, m.start() - 80):m.end()]
            if re.search(rf"\b{NEGATION}\b[^.]{{0,70}}?\b(?:{pat})", window, re.I):
                continue
            refuse(f"{where}: {m.group(0)!r} -- {why}")


# ── The checks on the room's own data ────────────────────────────────────────

def check_data(d):
    menu = d.get("menu") or []
    if [s.get("key") for s in menu] != list(SECTIONS):
        refuse("the menu is herbal teas, soups and stews, and breads, in that order, as the brief has it.")
    seen = set()
    for sec in menu:
        vessel, looks = SECTIONS.get(sec.get("key"), (None, set()))
        for x in sec.get("items") or []:
            name, where = x.get("name") or "?", f"{DATA.name}, {sec.get('title')}"
            if x.get("key") in seen or not re.fullmatch(r"[a-z0-9-]+", x.get("key") or ""):
                refuse(f"{where}: {name!r} has no plain key of its own.")
            seen.add(x.get("key"))
            extra = set(x) - ITEM_KEYS
            if extra:
                refuse(f"{where}: {name!r} carries {sorted(extra)}, which nothing reads.")
            if x.get("diet") != "vegan":
                refuse(f"{where}: {name!r} is {x.get('diet')!r}. Everything on this board is vegan.")
            before = len(hgc.problems)
            hgc.check_dish({k: x[k] for k in ("name", "diet", "what", "note") if k in x}, where)
            problems.extend(hgc.problems[before:])
            del hgc.problems[before:]
            if x.get("vessel") != vessel:
                refuse(f"{where}: {name!r} comes in {x.get('vessel')!r}; everything in {sec.get('title')} comes "
                       f"in a {vessel}.")
            look = x.get("look") or {}
            if not set(look) <= looks or not look:
                refuse(f"{where}: {name!r}'s look is {sorted(look)}; it is what is in the {vessel}: {sorted(looks)}.")
            for v in look.values():
                if not str(v).startswith("--bns-"):
                    refuse(f"{where}: {name!r} is coloured {v!r}, which is not one of the room's own colours.")
            if sec.get("key") == "teas":
                caf = pekoe.caffeine(x.get("what") or "")
                if caf is None:
                    refuse(f"{where}: {name!r}'s ingredients name nothing the caffeine engine knows, so its "
                           "caffeine cannot be worked out. Say what it is made from.")
                elif caf != "none":
                    refuse(f"{where}: {name!r} has caffeine ({caf}). Every tea here is a tisane.")
    for a in d.get("arrangements") or []:
        where = f"{DATA.name}, arrangement {a.get('key')!r}"
        extra = set(a) - ARR_KEYS
        if extra:
            refuse(f"{where} carries {sorted(extra)}.")
        for f in ("key", "name", "in", "what"):
            if not (a.get(f) or "").strip():
                refuse(f"{where} has no {f}.")
        if a.get("key") in seen:
            refuse(f"{where} has a key the menu already uses; the table cannot tell them apart.")
        seen.add(a.get("key"))
        if a.get("vessel") not in VESSELS:
            refuse(f"{where} stands in {a.get('vessel')!r}, which the tool cannot draw.")
        stems = a.get("stems") or []
        if not stems:
            refuse(f"{where} has nothing in it.")
        for kind, colour in stems:
            if kind not in STEMS:
                refuse(f"{where} has a {kind!r}, which the tool cannot draw.")
            if not str(colour).startswith("--bns-"):
                refuse(f"{where}'s {kind} is {colour!r}, not one of the room's own colours.")
    vids = d.get("videos") or []
    ids = set()
    shown = 0
    for v in vids:
        where = f"{DATA.name}, video {v.get('id')!r}"
        extra = set(v) - VIDEO_KEYS
        if extra:
            refuse(f"{where} carries {sorted(extra)}. A video here is an id, a title, a channel, a runtime "
                   "and the day it went up: no description, no count of views or likes.")
        if not YT.match(v.get("id") or ""):
            refuse(f"{where} is not a YouTube id.")
        if v.get("id") in ids:
            refuse(f"{where} is on the rack twice.")
        ids.add(v.get("id"))
        if not RUNTIME.match(v.get("runtime") or ""):
            refuse(f"{where} has no runtime. Every button here says how long before the press.")
        if not (v.get("title") or "").strip() or not (v.get("channel") or "").strip():
            refuse(f"{where} has no title or no channel.")
        if not CHANNEL.match(v.get("channel_id") or ""):
            refuse(f"{where} has no channel id.")
        if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", v.get("published") or ""):
            refuse(f"{where} has no day it went up.")
        if "held" in v and len((v.get("held") or "").strip()) < 40:
            refuse(f"{where} is held without a sentence saying why.")
        if "held" not in v:
            shown += 1
    if not shown:
        refuse("the looking-glass's rack has nothing on it.")
    s = (d.get("sources") or {}).get("herbal") or {}
    if not all(s.get(f) for f in ("title", "by", "url", "read", "for")):
        refuse("the source for what a tisane is has lost a title, a by, an address, a date read or what it is for.")
    if not isinstance(d.get("table_holds"), int) or not 1 <= d["table_holds"] <= 6:
        refuse("table_holds is how many things a slice of log holds, between one and six.")


# ── The cabin ────────────────────────────────────────────────────────────────
# Every outline is the stove's iron, and the only light is --bns-glow: in the
# joints between the logs, in the moss, and in the caps of the mushrooms. It
# lights nothing around it, which is why nothing in the drawing has a shadow.

LINE = 'stroke="var(--bns-iron)" stroke-width="2.5" stroke-linejoin="round"'


def glow_cap(x, y, r=7):
    """A little mushroom that glows: a cap and a stem, and no halo, because
    the light it grows lights nothing round it. Not named, not food, and
    nothing here says what kind it is."""
    return (f'<path d="M{n(x - r * .3)} {n(y)} V{n(y - r * .5)} H{n(x + r * .3)} V{n(y)} Z" fill="var(--bns-birch)" '
            f'stroke="var(--bns-iron)" stroke-width="1.2"/>'
            f'<path d="M{n(x - r)} {n(y - r * .45)} Q{n(x - r)} {n(y - r * 1.5)} {n(x)} {n(y - r * 1.5)} '
            f'Q{n(x + r)} {n(y - r * 1.5)} {n(x + r)} {n(y - r * .45)} Z" fill="var(--bns-glow)" '
            f'stroke="var(--bns-iron)" stroke-width="1.4" stroke-linejoin="round"/>')


def cluster(x, y, k=3, r=7):
    out = []
    for i in range(k):
        dx = (i - (k - 1) / 2) * r * 1.6
        out.append(glow_cap(x + dx, y - (i % 2) * r * .5, r * (1 - .18 * (i % 2))))
    return "".join(out)


def logs():
    out = []
    rows = list(range(60, FLOOR, 40))
    for j, y in enumerate(rows):
        out.append(f'<rect x="0" y="{y}" width="{W}" height="38" rx="16" fill="var(--bns-log)"/>')
        # Foxfire in the joint under each log, in patches: the wood grows it
        # where it grows it, never along the whole seam.
        x = 40 + (j * 173) % 260
        while x < W - 40:
            run = 60 + (x * 7 + j * 31) % 140
            out.append(f'<path d="M{n(x)} {y + 39} H{n(min(W - 20, x + run))}" stroke="var(--bns-glow)" '
                       f'stroke-width="2.4" stroke-linecap="round"/>')
            x += run + 110 + (x * 3 + j * 17) % 160
    return "".join(out)


def window_svg():
    x0, y0, w, h = 140, 150, 190, 170
    out = [f'<rect x="{x0 - 10}" y="{y0 - 10}" width="{w + 20}" height="{h + 20}" rx="6" fill="var(--bns-birch)" {LINE}/>',
           f'<rect x="{x0}" y="{y0}" width="{w}" height="{h}" fill="var(--bns-deep)" {LINE}/>']
    # The night wood outside, which the room's light does not reach.
    out.append(f'<path d="M{x0} {y0 + h - 22} Q{x0 + w / 2} {y0 + h - 34} {x0 + w} {y0 + h - 20} V{y0 + h} H{x0} Z" fill="var(--bns-log)"/>')
    for fx, fh in ((172, 96), (226, 124), (290, 84)):
        out.append(f'<path d="M{fx} {y0 + h - 26 - fh} L{fx - fh * .3:.0f} {y0 + h - 24} H{fx + fh * .3:.0f} Z" fill="var(--bns-log)"/>')
    # Foxfire on a fallen log out in the wood: the same light, out there too.
    out.append(f'<path d="M{x0 + 112} {y0 + h - 12} h28" stroke="var(--bns-glow)" stroke-width="2.4" stroke-linecap="round"/>')
    out.append(f'<path d="M{x0 + w / 2} {y0} V{y0 + h} M{x0} {y0 + h / 2} H{x0 + w}" stroke="var(--bns-birch)" stroke-width="6"/>')
    out.append(f'<rect x="{x0 - 22}" y="{y0 + h + 8}" width="{w + 44}" height="14" rx="4" fill="var(--bns-birch)" {LINE}/>')
    out.append(f'<path d="M{x0 - 16} {y0 + h + 8} q14 -12 30 -2 q12 -10 26 0 q16 -8 28 2 Z" fill="var(--bns-moss)"/>')
    out.append(cluster(x0 + w - 22, y0 + h + 8, 3, 8))
    return "".join(out)


def stove_svg():
    x, base = 500, FLOOR
    out = [f'<rect x="{x - 9}" y="0" width="18" height="{base - 190}" fill="var(--bns-iron)"/>',
           f'<ellipse cx="{x}" cy="{base - 100}" rx="62" ry="78" fill="var(--bns-iron)" {LINE}/>',
           f'<rect x="{x - 74}" y="{base - 190}" width="148" height="16" rx="4" fill="var(--bns-iron)" {LINE}/>',
           # The door is shut, and nothing shows round it: warmth, and no light.
           f'<rect x="{x - 26}" y="{base - 118}" width="52" height="40" rx="6" fill="var(--bns-iron)" stroke="var(--bns-log)" stroke-width="3"/>',
           f'<circle cx="{x + 16}" cy="{base - 98}" r="3" fill="var(--bns-log)"/>',
           f'<path d="M{x - 44} {base - 26} L{x - 52} {base} M{x + 44} {base - 26} L{x + 52} {base}" stroke="var(--bns-iron)" stroke-width="7" stroke-linecap="round"/>']
    # On top: the kettle in the stoneware glaze, and the stew pot in iron.
    out.append(f'<path d="M{x - 64} {base - 190} q0 -40 26 -40 q26 0 26 40 Z" fill="var(--bns-stone)" {LINE}/>'
               f'<path d="M{x - 64} {base - 214} q-18 -6 -22 -20" fill="none" stroke="var(--bns-stone)" stroke-width="6" stroke-linecap="round"/>'
               f'<path d="M{x - 52} {base - 226} q12 -18 24 0" fill="none" stroke="var(--bns-iron)" stroke-width="3"/>')
    out.append(f'<rect x="{x + 8}" y="{base - 238}" width="58" height="48" rx="8" fill="var(--bns-iron)" {LINE}/>'
               f'<rect x="{x + 2}" y="{base - 244}" width="70" height="10" rx="4" fill="var(--bns-iron)" {LINE}/>')
    for sx, h in ((x - 40, 70), (x + 26, 90), (x + 50, 64)):
        out.append(f'<path d="M{sx} {base - 246} q-12 -{h * .3:.0f} 0 -{h * .5:.0f} q12 -{h * .2:.0f} 0 -{h * .5:.0f}" '
                   f'fill="none" stroke="var(--bns-text)" stroke-width="2.5" stroke-linecap="round" opacity=".35"/>')
    return "".join(out)


def shelves_svg():
    out = []
    jars = ["--bns-gold", "--bns-mintea", "--bns-ruby", "--bns-amber", "--bns-rose", "--bns-gold", "--bns-lavender"]
    for k, y in enumerate((170, 250, 330)):
        out.append(f'<rect x="742" y="{y}" width="236" height="12" rx="3" fill="var(--bns-birch)" {LINE}/>')
        for i in range(5):
            jx = 760 + i * 44
            c = jars[(i + k * 2) % len(jars)]
            out.append(f'<rect x="{jx}" y="{y - 40}" width="30" height="40" rx="6" fill="var(--bns-stone)" {LINE}/>'
                       f'<rect x="{jx + 4}" y="{y - 26}" width="22" height="22" rx="3" fill="var({c})"/>'
                       f'<rect x="{jx + 2}" y="{y - 46}" width="26" height="8" rx="3" fill="var(--bns-birch)" {LINE}/>')
    out.append(cluster(960, 170, 2, 8))
    return "".join(out)


def herbs_svg():
    out = [f'<rect x="0" y="22" width="{W}" height="30" fill="var(--bns-log)" {LINE}/>']
    for i, (x, c) in enumerate(((610, "--bns-lavender"), (650, "--bns-moss"), (690, "--bns-straw"),
                                (1040, "--bns-heather"), (1080, "--bns-moss"))):
        out.append(f'<path d="M{x} 52 V70" stroke="var(--bns-straw)" stroke-width="2"/>'
                   f'<path d="M{x} 70 l-12 46 M{x} 70 l-4 52 M{x} 70 l4 52 M{x} 70 l12 46" stroke="var({c})" '
                   f'stroke-width="4" stroke-linecap="round"/>'
                   f'<rect x="{x - 6}" y="66" width="12" height="8" rx="2" fill="var(--bns-straw)"/>')
    return "".join(out)


def table_svg(x, rug=False):
    top = FLOOR - 72
    out = []
    if rug:
        out.append(f'<ellipse cx="{x}" cy="{FLOOR + 30}" rx="210" ry="30" fill="var(--bns-rose)" opacity=".55"/>'
                   f'<ellipse cx="{x}" cy="{FLOOR + 30}" rx="170" ry="22" fill="none" stroke="var(--bns-heather)" stroke-width="5"/>')
    out.append(f'<path d="M{x - 22} {top + 8} L{x - 28} {FLOOR} H{x + 28} L{x + 22} {top + 8} Z" fill="var(--bns-log)" {LINE}/>'
               f'<ellipse cx="{x}" cy="{top}" rx="78" ry="16" fill="var(--bns-slice)" {LINE}/>'
               f'<ellipse cx="{x}" cy="{top}" rx="52" ry="10" fill="none" stroke="var(--bns-ring)" stroke-width="2"/>'
               f'<ellipse cx="{x}" cy="{top}" rx="26" ry="5" fill="none" stroke="var(--bns-ring)" stroke-width="2"/>')
    for sx in (x - 110, x + 110):
        out.append(f'<path d="M{sx - 16} {FLOOR - 38} L{sx - 20} {FLOOR} M{sx + 16} {FLOOR - 38} L{sx + 20} {FLOOR}" '
                   f'stroke="var(--bns-log)" stroke-width="7" stroke-linecap="round"/>'
                   f'<ellipse cx="{sx}" cy="{FLOOR - 42}" rx="30" ry="9" fill="var(--bns-heather)" {LINE}/>')
    out.append(cluster(x - 8, FLOOR, 2, 7))
    if rug:
        # A bowl and its spoon.
        out.append(f'<path d="M{x - 30} {top - 8} Q{x - 28} {top + 6} {x - 8} {top + 6} Q{x + 12} {top + 6} {x + 14} {top - 8} Z" fill="var(--bns-stone)" {LINE}/>'
                   f'<ellipse cx="{x - 8}" cy="{top - 8}" rx="22" ry="5" fill="var(--bns-lentil)" {LINE}/>'
                   f'<path d="M{x + 8} {top - 12} l22 -14" stroke="var(--bns-birch)" stroke-width="4" stroke-linecap="round"/>')
    else:
        # A pot for one and a beaker.
        out.append(f'<ellipse cx="{x - 20}" cy="{top - 18}" rx="20" ry="17" fill="var(--bns-stone)" {LINE}/>'
                   f'<path d="M{x - 2} {top - 22} l14 -10" stroke="var(--bns-stone)" stroke-width="5" stroke-linecap="round"/>'
                   f'<circle cx="{x - 20}" cy="{top - 37}" r="3.5" fill="var(--bns-stone)" {LINE}/>'
                   f'<path d="M{x + 22} {top - 24} L{x + 24} {top - 2} H{x + 42} L{x + 44} {top - 24} Z" fill="var(--bns-stone)" {LINE}/>')
    return "".join(out)


def door_svg():
    x0, w = 1036, 132
    return (f'<rect x="{x0}" y="{FLOOR - 250}" width="{w}" height="250" rx="4" fill="var(--bns-log)" {LINE}/>'
            + "".join(f'<path d="M{x0 + i * 33} {FLOOR - 250} V{FLOOR}" stroke="var(--bns-iron)" stroke-width="2"/>' for i in (1, 2, 3))
            + f'<path d="M{x0 + 12} {FLOOR - 190} H{x0 + w - 12} M{x0 + 12} {FLOOR - 60} H{x0 + w - 12}" stroke="var(--bns-iron)" stroke-width="5"/>'
            f'<circle cx="{x0 + 18}" cy="{FLOOR - 120}" r="6" fill="var(--bns-iron)"/>'
            + cluster(x0 + w + 14, FLOOR, 2, 6))


def stand_svg(d):
    """The shelf by the door with the arrangements on it, drawn small from the
    same drawings as their cards."""
    out = [f'<rect x="878" y="{FLOOR - 150}" width="140" height="12" rx="3" fill="var(--bns-birch)" {LINE}/>',
           f'<path d="M890 {FLOOR - 138} V{FLOOR} M1006 {FLOOR - 138} V{FLOOR}" stroke="var(--bns-birch)" stroke-width="7"/>',
           f'<rect x="878" y="{FLOOR - 64}" width="140" height="10" rx="3" fill="var(--bns-birch)" {LINE}/>']
    arr = d["arrangements"]
    for i, a in enumerate(arr[:6]):
        row, col = divmod(i, 3)
        x, y = 882 + col * 44, (FLOOR - 150) - 48 + row * 86
        # A group, never a nested <svg>: the share card lifts the drawing up to
        # its first closing </svg>, and a nested one cut the card off at the
        # shelf, losing the tables.
        out.append(f'<g transform="translate({x} {y}) scale(0.4)">{arrangement_art(a)}</g>')
    return "".join(out)


def room_svg(d):
    out = [f'<svg class="bns-room__draw" viewBox="0 0 {W} {H}" aria-hidden="true" focusable="false">',
           f'<rect width="{W}" height="{H}" fill="var(--bns-night)"/>',
           logs(),
           f'<rect y="{FLOOR}" width="{W}" height="{H - FLOOR}" fill="var(--bns-deep)"/>',
           f'<path d="M0 {FLOOR} H{W}" stroke="var(--bns-iron)" stroke-width="3"/>']
    for x in range(0, W, 120):
        out.append(f'<path d="M{x} {FLOOR} L{x - 60} {H}" stroke="var(--bns-log)" stroke-width="1.5"/>')
    out += [herbs_svg(), window_svg(), stove_svg(), shelves_svg(), door_svg(), stand_svg(d),
            table_svg(270, rug=False), table_svg(700, rug=True),
            f'<path d="M0 {FLOOR - 8} q30 -18 60 -6 q20 -10 40 2 Z" fill="var(--bns-moss)"/>',
            cluster(44, FLOOR, 3, 10), cluster(612, FLOOR, 2, 8), "</svg>"]
    return "".join(out)


# ── Your table, looking down ─────────────────────────────────────────────────
# A slice of log on a stump, seen from your seat: the rings run away from you,
# the bark is the edge, and a few of the wood's own mushrooms grow out of it.

SLOTS = [(300, 250), (520, 196), (720, 196), (920, 250), (420, 360), (800, 360)]
ITEM_W, ITEM_H = 230, 172


def table_view(d):
    holds = d["table_holds"]
    out = [f'<svg class="bns-table__draw" viewBox="0 0 {W} {H}" data-table data-table-holds="{holds}" '
           'aria-hidden="true" focusable="false">',
           f'<rect width="{W}" height="{H}" fill="var(--bns-deep)"/>']
    for k in range(6):
        out.append(f'<path d="M-20 {470 + k * 26} Q600 {440 + k * 26} 1220 {470 + k * 26}" fill="none" '
                   f'stroke="var({"--bns-rose" if k % 2 else "--bns-heather"})" stroke-width="10" opacity=".5"/>')
    out.append(f'<ellipse cx="600" cy="300" rx="560" ry="236" fill="var(--bns-log)" {LINE}/>')
    out.append(f'<ellipse cx="600" cy="290" rx="532" ry="218" fill="var(--bns-slice)" {LINE}/>')
    for k in range(1, 8):
        out.append(f'<ellipse cx="{600 + k * 4}" cy="{290 - k * 2}" rx="{532 - k * 66}" ry="{218 - k * 27}" '
                   f'fill="none" stroke="var(--bns-ring)" stroke-width="2"/>')
    out.append(cluster(98, 300, 3, 9) + cluster(1112, 270, 2, 8))
    out.append('<g class="bns-table__things">')
    for i, (x, y) in enumerate(SLOTS[:holds]):
        out.append(f'<g data-slot="{i}" data-x="{x - ITEM_W // 2}" data-y="{y - ITEM_H // 2}" '
                   f'data-w="{ITEM_W}" data-h="{ITEM_H}"></g>')
    out.append('</g></svg>')
    return "".join(out)


# ── The menu and the arrangements ────────────────────────────────────────────

def teapot(look):
    return (f'<path d="M58 54 l18 -14" stroke="var(--bns-iron)" stroke-width="9" stroke-linecap="round"/>'
            f'<path d="M58 54 l18 -14" stroke="var(--bns-stone)" stroke-width="5" stroke-linecap="round"/>'
            f'<path d="M14 48 q-14 0 -12 12 q2 10 14 8" fill="none" stroke="var(--bns-iron)" stroke-width="8" stroke-linecap="round"/>'
            f'<path d="M14 48 q-14 0 -12 12 q2 10 14 8" fill="none" stroke="var(--bns-stone)" stroke-width="4" stroke-linecap="round"/>'
            f'<ellipse cx="36" cy="58" rx="26" ry="24" fill="var(--bns-stone)" {LINE}/>'
            f'<ellipse cx="36" cy="37" rx="13" ry="5" fill="var(--bns-stone)" {LINE}/>'
            f'<circle cx="36" cy="30" r="4" fill="var(--bns-stone)" {LINE}/>'
            # A beaker, no handle, the tea in it.
            f'<path d="M80 50 L83 78 Q95 84 107 78 L110 50 Z" fill="var(--bns-stone)" {LINE}/>'
            f'<ellipse cx="95" cy="50" rx="15" ry="5" fill="var(--bns-stone)" {LINE}/>'
            f'<ellipse cx="95" cy="51" rx="11.5" ry="3.4" fill="var({look["drink"]})"/>')


def bowl(look):
    return (f'<path d="M86 30 L112 10" stroke="var(--bns-iron)" stroke-width="8" stroke-linecap="round"/>'
            f'<path d="M86 30 L112 10" stroke="var(--bns-birch)" stroke-width="4.5" stroke-linecap="round"/>'
            f'<path d="M10 44 Q12 82 60 84 Q108 82 110 44 Z" fill="var(--bns-stone)" {LINE}/>'
            f'<ellipse cx="60" cy="44" rx="50" ry="17" fill="var(--bns-stone)" {LINE}/>'
            f'<ellipse cx="60" cy="45" rx="43" ry="13" fill="var({look["soup"]})"/>'
            f'<path d="M44 45 q8 -6 16 0 q8 6 16 0" fill="none" stroke="var({look["top"]})" stroke-width="3" stroke-linecap="round"/>'
            f'<circle cx="38" cy="49" r="2" fill="var({look["top"]})"/><circle cx="80" cy="41" r="2" fill="var({look["top"]})"/>')


def board(look):
    out = [f'<rect x="8" y="52" width="104" height="26" rx="8" fill="var(--bns-slice)" {LINE}/>',
           f'<path d="M112 62 h6" stroke="var(--bns-slice)" stroke-width="6" stroke-linecap="round"/>']
    for x in (22, 52):
        out.append(f'<path d="M{x} 66 V44 Q{x} 26 {x + 18} 26 Q{x + 36} 26 {x + 36} 44 V66 Z" fill="var({look["crumb"]})" '
                   f'stroke="var({look["crust"]})" stroke-width="5" stroke-linejoin="round"/>'
                   f'<path d="M{x} 66 V44 Q{x} 26 {x + 18} 26 Q{x + 36} 26 {x + 36} 44 V66 Z" fill="none" {LINE}/>')
    out.append(f'<ellipse cx="98" cy="58" rx="11" ry="5" fill="var(--bns-stone)" {LINE}/>'
               f'<ellipse cx="98" cy="58" rx="7" ry="3" fill="var(--bns-gold)"/>')
    return "".join(out)


def item_svg(x, section):
    look = x["look"]
    inner = teapot(look) if section == "teas" else bowl(look) if section == "soups" else board(look)
    return (f'<svg class="bns-item__draw" data-table-draw="{attr(x["key"])}" viewBox="0 0 120 90" '
            f'aria-hidden="true" focusable="false">{inner}</svg>')


def stem(kind, colour, x, base, top, lean):
    tip = (x + lean, top)
    out = [f'<path d="M{n(x)} {n(base)} Q{n(x + lean * .3)} {n((base + top) / 2)} {n(tip[0])} {n(tip[1])}" '
           f'fill="none" stroke="{"var(--bns-moss)" if kind not in ("twig",) else f"var({colour})"}" stroke-width="2.4" stroke-linecap="round"/>']
    tx, ty = tip
    c = f"var({colour})"
    if kind == "lavender":
        for k in range(5):
            out.append(f'<ellipse cx="{n(tx - lean * .03 * k)}" cy="{n(ty + k * 6)}" rx="3.4" ry="4" fill="{c}"/>')
    elif kind == "grass":
        out.append(f'<path d="M{n(tx)} {n(ty)} q-6 10 -3 22 M{n(tx)} {n(ty)} q6 10 3 22 M{n(tx)} {n(ty)} v24" stroke="{c}" stroke-width="2" fill="none" stroke-linecap="round"/>')
    elif kind == "catkin":
        out.append(f'<path d="M{n(tx)} {n(ty)} q4 10 1 22" stroke="{c}" stroke-width="5" fill="none" stroke-linecap="round"/>')
    elif kind == "pod":
        out.append(f'<ellipse cx="{n(tx)}" cy="{n(ty)}" rx="9" ry="10" fill="{c}" stroke="var(--bns-iron)" stroke-width="1.6"/>'
                   f'<ellipse cx="{n(tx - 10)}" cy="{n(ty + 16)}" rx="7" ry="8" fill="{c}" stroke="var(--bns-iron)" stroke-width="1.6"/>')
    elif kind == "puff":
        out.append(f'<ellipse cx="{n(tx)}" cy="{n(ty)}" rx="6" ry="9" fill="{c}" stroke="var(--bns-iron)" stroke-width="1.4"/>')
    elif kind == "frond":
        for k in range(6):
            yy = ty + k * 8
            out.append(f'<path d="M{n(tx)} {n(yy)} q-12 -2 -16 4 M{n(tx)} {n(yy)} q12 -2 16 4" stroke="{c}" stroke-width="2.4" fill="none" stroke-linecap="round"/>')
    elif kind == "twig":
        out.append(f'<path d="M{n(tx)} {n(ty + 20)} l10 -8 M{n(tx)} {n(ty + 34)} l-9 -7" stroke="{c}" stroke-width="2" fill="none" stroke-linecap="round"/>')
    elif kind == "heather":
        for k in range(6):
            out.append(f'<circle cx="{n(tx + (2 if k % 2 else -2))}" cy="{n(ty + k * 5)}" r="2.6" fill="{c}"/>')
    elif kind == "thistle":
        out.append(f'<path d="M{n(tx - 6)} {n(ty)} l2 -10 M{n(tx)} {n(ty - 2)} v-12 M{n(tx + 6)} {n(ty)} l-2 -10" stroke="{c}" stroke-width="2.4" stroke-linecap="round"/>'
                   f'<ellipse cx="{n(tx)}" cy="{n(ty + 4)}" rx="7" ry="6" fill="var(--bns-moss)" stroke="var(--bns-iron)" stroke-width="1.4"/>')
    return "".join(out)


def vessel_svg(kind):
    if kind == "jug":
        return (f'<path d="M80 74 q14 0 12 14 q-2 10 -12 8" fill="none" stroke="var(--bns-stone)" stroke-width="6"/>'
                f'<path d="M40 70 Q36 112 60 114 Q84 112 80 70 Z" fill="var(--bns-stone)" {LINE}/>', 70)
    if kind == "jar":
        return (f'<rect x="42" y="72" width="36" height="42" rx="8" fill="var(--bns-glass)" {LINE}/>'
                f'<rect x="40" y="66" width="40" height="9" rx="3" fill="var(--bns-glass)" {LINE}/>', 72)
    if kind == "pot":
        return (f'<path d="M38 82 L44 114 H76 L82 82 Z" fill="var(--bns-rose)" {LINE}/>'
                f'<rect x="34" y="76" width="52" height="10" rx="3" fill="var(--bns-rose)" {LINE}/>', 80)
    if kind == "bottle":
        return (f'<path d="M54 50 V66 Q40 74 40 90 V112 H80 V90 Q80 74 66 66 V50 Z" fill="var(--bns-glass)" {LINE}/>', 52)
    if kind == "slice":
        return (f'<ellipse cx="60" cy="104" rx="48" ry="12" fill="var(--bns-slice)" {LINE}/>'
                f'<ellipse cx="60" cy="104" rx="30" ry="7" fill="none" stroke="var(--bns-ring)" stroke-width="2"/>'
                f'<path d="M30 102 q12 -14 30 -4 q16 -10 30 4 Z" fill="var(--bns-moss)" {LINE}/>'
                f'<ellipse cx="86" cy="96" rx="8" ry="10" fill="var(--bns-rye)" {LINE}/>', 98)
    return (f'<rect x="38" y="76" width="44" height="38" rx="3" fill="var(--bns-silver)" {LINE}/>'
            f'<path d="M38 84 H82 M38 106 H82" stroke="var(--bns-iron)" stroke-width="1.4"/>', 76)


def arrangement_art(a):
    body, mouth = vessel_svg(a["vessel"])
    stems = a["stems"]
    out = []
    k = len(stems)
    for i, (kind, colour) in enumerate(stems):
        x = 60 + (i - (k - 1) / 2) * 7
        lean = (i - (k - 1) / 2) * 12
        out.append(stem(kind, colour, x, mouth + 6, 14 + (i % 2) * 10, lean))
    return "".join(out) + body


def arrangement_svg(a):
    return (f'<svg class="bns-item__draw" data-table-draw="{attr(a["key"])}" viewBox="0 0 120 120" '
            f'aria-hidden="true" focusable="false">{arrangement_art(a)}</svg>')


def item_card(x, section):
    lines = [f'<p class="bns-item__what"><span class="sr">In it: </span>{esc(x["what"])}</p>',
             f'<p class="bns-item__has">{esc(hgc.contains(x))}</p>']
    if section == "teas":
        lines.append(f'<p class="bns-item__caf">{esc(pekoe.CAFFEINE_SAYS[pekoe.caffeine(x["what"])])}</p>')
    if x.get("note"):
        lines.append(f'<p class="bns-item__note">{esc(x["note"])}</p>')
    body = "\n          ".join(lines)
    return (f'        <li class="bns-item" id="bns-item-{x["key"]}">\n'
            f'          {item_svg(x, section)}\n'
            f'          <h4 class="bns-item__name">{esc(x["name"])}</h4>\n'
            f'          {body}\n'
            f'          <p class="bns-item__go"><button type="button" class="bns-btn" data-table-order="{attr(x["key"])}" '
            f'data-table-name="{attr(x["name"])}" hidden>Bring it to my table</button> '
            f'<span class="bns-said" data-table-said aria-hidden="true" hidden></span></p>\n'
            '        </li>')


def menu_block(d):
    out = []
    for sec in d["menu"]:
        out.append(f'    <section class="bns-board" aria-labelledby="bns-{sec["key"]}-h">')
        out.append(f'      <h3 id="bns-{sec["key"]}-h">{esc(sec["title"])}</h3>')
        out.append(f'      <p class="bns-board__lede">{esc(sec["lede"])}</p>')
        out.append('      <ul class="bns-items">')
        out += [item_card(x, sec["key"]) for x in sec["items"]]
        out.append('      </ul>')
        out.append('    </section>')
    return "\n".join(out)


def arrangements_block(d):
    out = ['    <ul class="bns-items bns-items--arr">']
    for a in d["arrangements"]:
        out.append(f'      <li class="bns-item bns-arr" id="bns-arr-{a["key"]}">\n'
                   f'        {arrangement_svg(a)}\n'
                   f'        <h3 class="bns-item__name">{esc(a["name"])}</h3>\n'
                   f'        <p class="bns-item__what">{esc(a["what"][:1].upper() + a["what"][1:])}, in {esc(a["in"])}.</p>\n'
                   f'        <p class="bns-item__go"><button type="button" class="bns-btn" data-table-order="{attr(a["key"])}" '
                   f'data-table-name="{attr(a["name"])}" hidden>Take it to my table</button> '
                   f'<span class="bns-said" data-table-said aria-hidden="true" hidden></span></p>\n'
                   '      </li>')
    out.append('    </ul>')
    return "\n".join(out)


def day(iso):
    y, m, dd = (int(x) for x in iso.split("-"))
    return f"{dd} {MONTHS[m - 1]} {y}"


def rack_block(d):
    sid, sname = SCREEN
    out = [f'    <div class="bns-glass" data-rack-screen="{sid}" tabindex="-1" hidden>',
           '      <p class="bns-glass__idle"><span><b>The looking-glass.</b> Nothing shows in it. Any film on the rack '
           'can go up here with the button under it, and nothing loads until you press one.</span></p>',
           '    </div>',
           f'    <p class="bns-glass__now" data-rack-now="{sid}" tabindex="-1" hidden></p>',
           f'    <p class="bns-glass__back" hidden><button type="button" class="bns-btn bns-btn--quiet" '
           f'data-rack-back="{sid}">Take it out of the looking-glass</button></p>',
           '    <details class="bns-rack" open>',
           '      <summary class="bns-rack__sum">The rack: other woodland tea rooms</summary>',
           '      <ul class="bns-vids">']
    for v in d["videos"]:
        if "held" in v:
            continue
        t, c, r = esc(v["title"]), esc(v["channel"]), v["runtime"]
        out += [
            '        <li class="bns-vid" data-rack-card>',
            f'          <h3 class="bns-vid__title">{t}</h3>',
            f'          <p class="bns-vid__by">{c} &middot; {day(v["published"])} &middot; {r}</p>',
            f'          <button type="button" class="facade" data-embed-id="{v["id"]}" data-embed-title="{attr(v["channel"])} &mdash; {attr(v["title"])}">',
            f'            Watch it here &mdash; {r}',
            '            <span class="facade__play">&#9654; PRESS PLAY</span>',
            '          </button>',
            f'          <button type="button" class="bns-btn bns-btn--quiet bns-vid__big" hidden data-rack-to="{sid}" '
            f'data-rack-name="{sname}" data-rack-src="https://www.youtube-nocookie.com/embed/{v["id"]}?autoplay=1&amp;rel=0" '
            f'data-rack-title="{attr(v["channel"])} &mdash; {attr(v["title"])}, in {sname}" data-rack-film="{attr(v["title"])}" '
            f'data-rack-runtime="{r}">Put it in {sname} &mdash; {r}</button>',
            '        </li>']
    out += ['      </ul>', '    </details>']
    return "\n".join(out)


def liner_sources(d):
    s = d["sources"]["herbal"]
    rows = [(s["for"], f'<a href="{attr(s["url"])}">{esc(s["title"])}</a>, {esc(s["by"])}, read {esc(s["read"])}'),
            ("The nine major food allergens and gluten on every card",
             'Worked out by the same engine as <a href="hey-good-cookin.html">Hey, Good Cookin&rsquo;</a>, which read '
             'the nine on the U.S. Food and Drug Administration&rsquo;s page on 2026-10-04'),
            ("Every tea’s caffeine",
             'Worked out by the same engine as <a href="pekoe-and-purrs.html">Pekoe and Purrs</a>, from what is in '
             'the tea')]
    chans = []
    for v in d["videos"]:
        if "held" in v:
            continue
        link = f'<a href="https://www.youtube.com/channel/{v["channel_id"]}">{esc(v["channel"])}</a>'
        if link not in chans:
            chans.append(link)
    rows.append(("The films on the looking-glass’s rack",
                 "Ryan Boren’s pick, of 2026-10-04, in his order, each on its own channel on YouTube: "
                 + ", ".join(chans[:-1]) + " and " + chans[-1]
                 + ". None of them is affiliated with Stimpunks, and nothing of theirs is hosted here"))
    held = [v for v in d["videos"] if "held" in v]
    for v in held:
        rows.append(("Held off the rack",
                     f'<a href="https://www.youtube.com/watch?v={v["id"]}">{esc(v["title"])}</a>, '
                     f'{esc(v["channel"])}, {day(v["published"])}: {esc(v["held"])}'))
    return "\n".join(f'      <tr><td>{esc(w)}</td><td>{src}</td></tr>' for w, src in rows)


# ── The page as written ──────────────────────────────────────────────────────

def code_of(path):
    c = re.sub(r"/\*.*?\*/", " ", path.read_text(), flags=re.S)
    return re.sub(r"(?m)^\s*//[^\n]*", " ", c)


def check_page():
    src = PAGE.read_text()
    for want, why in (('src="table.js"', "it does not load table.js, which puts things on your table"),
                      ('src="love-embed.js"', "it does not load love-embed.js, so every film would press and do nothing"),
                      ('src="rack.js"', "it does not load rack.js, so no film could go in the looking-glass"),
                      ('href="campgrounds.html"', "it has no way back to the campgrounds"),
                      ('data-table-says', "it has no live region for what your table says")):
        if want not in src:
            refuse(f"{PAGE.name}: {why}.")
    plain = re.sub(r"<script\b.*?</script>", " ", src, flags=re.S)
    plain = re.sub(r"<!--.*?-->", " ", plain, flags=re.S)
    plain = re.sub(r'<(h3|p) class="bns-vid__(?:title|by)">.*?</\1>', " ", plain, flags=re.S)
    sweep(plain, PAGE.name)
    js = code_of(TABLE)
    if re.search(r"localStorage|sessionStorage|indexedDB|document\.cookie|fetch\(|XMLHttpRequest|sendBeacon", js):
        refuse(f"{TABLE.name} stores or sends something. What is on your table lives in the page.")
    camp = (ROOT / "campgrounds.html").read_text()
    if 'href="brew-and-stew.html"' not in camp:
        refuse("campgrounds.html has no sign for the tea room, so nobody on the field can find it.")


def section_css():
    css = CSS.read_text()
    m = re.search(rf"/\* §{SECTION} ── ROOM: Brew and Stew.*?(?=/\* §\d+ ── )", css, re.S)
    if not m:
        refuse(f"love.css has no §{SECTION} for Brew and Stew, followed by another section.")
        return
    body = re.sub(r"/\*.*?\*/", " ", m.group(0), flags=re.S)
    if re.search(r"#[0-9a-fA-F]{3,6}\b|rgba?\(", body):
        refuse(f"love.css §{SECTION} has a literal colour in it; the room's colours are --bns- custom properties.")
    if re.search(r"@keyframes|animation\s*:", body):
        refuse(f"love.css §{SECTION} animates something. Nothing in the tea room moves, at any setting.")
    if re.search(r"transform\s*:\s*(?:rotate|skew)", body):
        refuse(f"love.css §{SECTION} tilts something.")


def main():
    d = json.loads(DATA.read_text())
    check_data(d)
    for k in ("_what", "_menu", "_arrangements"):
        sweep(d.get(k, ""), f"{DATA.name} {k}")
    for sec in d.get("menu") or []:
        sweep(sec.get("lede", ""), f"{DATA.name}, {sec.get('title')}")
        for x in sec.get("items") or []:
            sweep(" ".join(str(x.get(f, "")) for f in ("name", "what", "note")), f"{DATA.name}, {x.get('name')}")
    for a in d.get("arrangements") or []:
        sweep(" ".join(str(a.get(f, "")) for f in ("name", "what", "in")), f"{DATA.name}, {a.get('name')}")
    if problems:
        print("REFUSING:\n  " + "\n  ".join(dict.fromkeys(problems)))
        sys.exit(1)
    swap(PAGE, "bns:room", "      " + room_svg(d), "      ")
    swap(PAGE, "bns:table", "      " + table_view(d), "      ")
    swap(PAGE, "bns:menu", menu_block(d), "    ")
    swap(PAGE, "bns:arrangements", arrangements_block(d), "    ")
    swap(PAGE, "bns:rack", rack_block(d), "    ")
    swap(NOTES, "brew-sources", liner_sources(d), "      ")
    check_page()
    section_css()
    if problems:
        print("REFUSING (the page as written):\n  " + "\n  ".join(dict.fromkeys(problems)))
        sys.exit(1)
    held = sum(1 for v in d["videos"] if "held" in v)
    print("brew and stew: the cabin, your table, the menu, the arrangements, the looking-glass's rack"
          f"{f' ({held} held, with the reason)' if held else ''} and the credits written; nothing in it is a "
          "flame, a remedy or foraged")


if __name__ == "__main__":
    main()
