#!/usr/bin/env python3
"""Build Pekoe and Purrs, the cat café on the street, out of data/pekoe.json:
the room and every perch in it, the view down at your lap and your table, the
toys, the menu, and the room's credits in the liner notes.

WHAT THE ROOM IS. Ryan Boren's brief, 2026-10-04: coffee, tea, tea sandwiches,
and cats from the cat rescue waiting for adoption; a menu with vegan and
vegetarian options; the shelter's cats roaming among toys, lofts and wall
playgrounds; press a cat for its name and how to adopt it, with a link to the
rescue; the cats move around the café now and then; pick one up and put it in
your lap, and look down at your lap and your table to see the cat and your
drinks and food.

THE CATS ARE THE SHELTER'S AND THIS TOOL NEVER WRITES ONE. purrs.js reads them
off Rescue A Cat's own public list every time the room opens (the one GET the
shelter pages make, /cb/shelter?kind=cat), and draws each with animals.js, so a
cat in the café is the same cat, drawn the same way, as on the shelter page and
in its adopter's Profile. This tool holds what the café promises about them:

  · THERE IS ALWAYS SOMEWHERE TO GO. More perches than the shelter can ever
    hold, read off SHELTER_KEEP in netlify/cb/lib.mjs, so a cat can always move
    and none is left with nowhere to sit; and no two perches overlap, so no cat
    is ever drawn on top of another.
  · A CAT GOES WHERE ITS MOOD TAKES IT, AND NOTHING ELSE DECIDES. Every mood the
    shelter can write down (CAT_MOODS in lib.mjs) has a rule here, and a rule
    names perches and heights and never a marking. A cat with three legs goes
    to the top of the tree like anybody else, which is what "no opinion about
    it" says; purrs.js is refused if it ever reads a cat's markings for
    anything but handing them to animals.js.
  · A CAT WHO WANTS TO BE LEFT ALONE IS LEFT ALONE. The shelter wrote that
    down, "which is allowed", and the café keeps to it: no button picks that
    cat up. The tool refuses the list without that mood in it.
  · ADOPTING IS THE SHELTER'S AND THE CAFÉ ONLY POINTS AT IT. Every cat's card
    links to its own card at Rescue A Cat (#animal-<id>, which shelter.js
    writes, and the tool checks it still does), and the café sends nothing:
    purrs.js makes one fetch, a GET to the shelter's list, stores nothing,
    knows nothing about a CB pass and never posts. Picking a cat up happens in
    your browser and nowhere else.
  · A CAT IS ADOPTED, NEVER BOUGHT. Buy, sell, price and fee are refused in the
    room's voice with the negation window, and so is the shelter's own list of
    prize words (make-rescue.py's): nothing rarer, nothing collected, nobody
    counted.

EVERY MUG IS THE SAME MUG, AND THAT IS WHAT KEEPS THIS ROOM OFF COVENSTEAD'S.
Both rooms pour tea in daylight. Covenstead's subject is the mismatched china,
nobody's cup anybody else's; here every cup, mug and pot is the one teal glaze,
because the regulars knock things off tables and the good china would not
last an afternoon. A drink's look is the colour of what is IN it, and the tool
refuses one that tries to give its vessel a colour of its own.

EVERY ITEM SAYS WHAT IS IN IT, AND THE TWO KITCHENS SHARE ONE ENGINE.
Hey, Good Cookin' works out the FDA's nine allergens and gluten from each
dish's ingredients, checks vegan, vegetarian and every named animal against
them, and words the allergen line; this tool imports those functions rather
than keeping a second list, so the two rooms cannot disagree about what is in
a word. And every drink's caffeine line is worked out from its ingredients the
same way and never typed: the runtime rule at a café counter. A drink whose
ingredients name no bean, leaf, flower or chocolate is refused rather than
called caffeine-free by default.

THE TELLY'S RACK IS RYAN'S PICK AND THE TITLES ARE THE CHANNELS'. Films from
other cat cafés, in the order he gave them, in rack.js's pattern: each plays
where it hangs or goes up on the telly, which has nothing of its own on it. Every
button says how long before the press, the runtime measured off the video's own
watch page; a video is an id, a title, a channel, a runtime and the day it went
up, and a description or a count of views is refused, the Doom Scoop's rule. The
titles are quoted as written and the room's sweeps skip them. check-jukebox.py
asks after every one with every other facade on the street.

THE LIGHT. A window at every height, each cut to the size of a cat, so every
cat has a window of its own to look out of and each lays a small square of day
on the wall down and to the right of it. The squares are drawn from the
windows, never placed by hand. See §94 for the collisions.

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
DATA = ROOT / "data/pekoe.json"
PAGE = ROOT / "pekoe-and-purrs.html"
NOTES = ROOT / "liner-notes.html"
CSS = ROOT / "love.css"
LIB = ROOT / "netlify/cb/lib.mjs"
SCRIPT = ROOT / "purrs.js"
SHELTER = ROOT / "shelter.js"
TABLE = ROOT / "table.js"
ANIMALS = ROOT / "animals.js"
SECTION = 94          # love.css's section for this room

W, H = 1200, 660      # the room's drawing, and the lap's
FLOOR = 590
CAT_W, CAT_H = 84, 71  # a cat, 200 by 170 in animals.js, at 0.42
KINDS = {"shelf", "sill", "bridge", "hammock", "ledge", "chair", "floor", "basket", "box", "tree", "cubby"}
LEVELS = {"high", "middle", "floor"}
SHAPES = {"square", "round", "arch"}
VESSELS = {"cup", "mug", "glass", "pot"}
DIETS = {"vegan", "vegetarian", "meat", "fish"}
DRINK_LOOK = {"drink", "top", "dust", "art"}
FOOD_LOOK = {"bread", "filling"}
ITEM_KEYS = {"key", "name", "diet", "what", "animal", "note", "ask", "vessel", "look"}
SPARE = 3             # perches beyond the most cats the shelter can hold
YT = re.compile(r"^[A-Za-z0-9_-]{11}$")
CHANNEL = re.compile(r"^UC[A-Za-z0-9_-]{22}$")
RUNTIME = re.compile(r"^(?:\d+:[0-5]\d|\d+:[0-5]\d:[0-5]\d)$")
VIDEO_KEYS = {"id", "title", "channel", "channel_id", "runtime", "published"}
SCREEN = ("pkp", "the telly")
MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August",
          "September", "October", "November", "December"]

# ── Caffeine, worked out from what is in a drink ─────────────────────────────
# Strongest first. Decaf is read before coffee, because "decaf espresso" is
# espresso with most of the caffeine gone. A drink that matches nothing is
# refused, never called caffeine-free by default.
CAFFEINE = [
    ("full", r"espresso|coffee|black tea|green tea|white tea|oolong|sencha|matcha"),
    ("cocoa", r"chocolate|cocoa"),
    ("none", r"chamomile|peppermint|spearmint|rooibos|hibiscus|rosehips?|elderflowers?|lemon balm|"
             r"lemon verbena|lavender|fennel|ginger|rose petals?|dried apple|oat milk"),
]
# Brew and Stew's herbal teas read this same list (make-brew-and-stew.py), so
# the two tea rooms work caffeine out the same way.
DECAF = r"decaf(?:feinated)? (?:espresso|coffee)"
CAFFEINE_SAYS = {
    "full": "Has caffeine.",
    "decaf": "Less caffeine, but some: decaf is never quite none.",
    "cocoa": "Some caffeine, from the chocolate.",
    "none": "No caffeine.",
}
RANK = {"none": 0, "decaf": 1, "cocoa": 1, "full": 2}

problems = []


def refuse(msg):
    problems.append(msg)


def tool(name):
    """Another tool's module, imported rather than restated: the community
    kitchen's allergen engine and the shelter's prize words."""
    spec = importlib.util.spec_from_file_location(name.replace("-", "_"), TOOLS / f"{name}.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


hgc = tool("make-hey-good-cookin")
rescue = tool("make-rescue")


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


def n(v):
    """A coordinate, without a trailing .0."""
    v = round(float(v), 1)
    return str(int(v)) if v == int(v) else str(v)


# ── The voice ────────────────────────────────────────────────────────────────

NEGATION = hgc.NEGATION
SOLD = r"buy|buys|buying|bought|purchas\w*|sell|sells|selling|sold|for sale|prices?|priced|fees?"
VOCAB = [
    (SOLD, "a cat bought or sold, or a price. A cat here is adopted, never bought, and the board "
           "has no prices on it."),
    (hgc.DIET, "a verdict on food or on a body, Hey, Good Cookin's refusal: food is food."),
    (hgc.PICKY, "sorting eaters. Nobody here is picky, and nobody is told to finish anything."),
]


def sweep(text, where):
    text = html.unescape(re.sub(r"<[^>]+>", " ", str(text)))
    for pat, why in VOCAB:
        for m in re.finditer(rf"\b(?:{pat})\b", text, re.I):
            window = text[max(0, m.start() - 80):m.end()]
            if re.search(rf"\b{NEGATION}\b[^.]{{0,70}}?\b(?:{pat})", window, re.I):
                continue
            refuse(f"{where}: {m.group(0)!r} -- {why}")
    before = len(rescue.problems)
    rescue.sweep(text, where)
    problems.extend(rescue.problems[before:])
    del rescue.problems[before:]


# ── What the shelter can hand the café ───────────────────────────────────────

def shelter_facts():
    lib = LIB.read_text()
    m = re.search(r"export const SHELTER_KEEP = (\d+);", lib)
    if not m:
        raise SystemExit(f"REFUSING: {LIB.name} has no SHELTER_KEEP, so there is no telling how many "
                         "cats the café must have room for.")
    moods = rescue.keys(lib, "CAT_MOODS")
    if len(moods) < 2:
        raise SystemExit(f"REFUSING: read {len(moods)} moods out of {LIB.name}'s CAT_MOODS, which is this "
                         "tool misreading the list rather than a shelter with no moods.")
    return int(m.group(1)), moods


# ── The checks on the room's own data ────────────────────────────────────────

def caffeine(what):
    t = " " + what.lower() + " "
    got = []
    if re.search(rf"\b{DECAF}\b", t):
        got.append("decaf")
        t = re.sub(rf"\b{DECAF}\b", " ", t)
    for level, pat in CAFFEINE:
        if re.search(rf"\b(?:{pat})\b", t):
            got.append(level)
    if not got:
        return None
    return max(got, key=lambda g: RANK[g])


def check_item(x, section, where):
    name = x.get("name") or "?"
    extra = set(x) - ITEM_KEYS
    if extra:
        refuse(f"{where}: {name!r} carries {sorted(extra)}, which nothing reads.")
    if not re.fullmatch(r"[a-z0-9-]+", x.get("key") or ""):
        refuse(f"{where}: {name!r} has no plain key; its key is its card's address and its drawing's.")
    before = len(hgc.problems)
    hgc.check_dish({k: x[k] for k in ("name", "diet", "what", "animal", "note") if k in x}, where)
    problems.extend(hgc.problems[before:])
    del hgc.problems[before:]
    look = x.get("look") or {}
    if section == "sandwiches":
        if x.get("vessel"):
            refuse(f"{where}: {name!r} names a vessel; a sandwich comes on the plate.")
        if set(look) != FOOD_LOOK or not isinstance(look.get("filling"), list) or not look["filling"]:
            refuse(f"{where}: {name!r}'s look must be its bread and its fillings, and nothing else.")
    else:
        if x.get("vessel") not in VESSELS:
            refuse(f"{where}: {name!r} comes in {x.get('vessel')!r}, which is not cup, mug, glass or pot.")
        bad = set(look) - DRINK_LOOK
        if bad:
            refuse(f"{where}: {name!r}'s look carries {sorted(bad)}. A drink's look is what is in the mug, "
                   "never the mug: every mug in the café is the same mug, and that is what keeps the room "
                   "off Covenstead's mismatched china.")
        if "drink" not in look:
            refuse(f"{where}: {name!r} has no colour for what is in the mug.")
        if look.get("art") not in (None, "cat"):
            refuse(f"{where}: {name!r} asks for latte art the drawing does not have: {look.get('art')!r}.")
        if caffeine(x.get("what") or "") is None:
            refuse(f"{where}: {name!r}'s ingredients name no bean, leaf, flower or chocolate, so its caffeine "
                   "cannot be worked out. Say what it is made from rather than letting it pass as none.")
    for k in ("drink", "top", "bread"):
        if k in look and not str(look[k]).startswith("--pkp-"):
            refuse(f"{where}: {name!r}'s {k} is {look[k]!r}, which is not one of the room's own colours.")
    for c in look.get("filling") or []:
        if not str(c).startswith("--pkp-"):
            refuse(f"{where}: {name!r}'s filling {c!r} is not one of the room's own colours.")


def check_data(d, keep, moods):
    menu = d.get("menu") or []
    if [s.get("key") for s in menu] != ["coffee", "not-coffee", "tea", "sandwiches"]:
        refuse("the menu is coffee, not coffee, tea and tea sandwiches, in that order, as the brief has it.")
    seen = set()
    for sec in menu:
        items = sec.get("items") or []
        if not items:
            refuse(f"the menu's {sec.get('title')!r} is empty.")
        for x in items:
            if x.get("key") in seen:
                refuse(f"the menu has two items keyed {x.get('key')!r}.")
            seen.add(x.get("key"))
            check_item(x, sec.get("key"), f"{DATA.name}, {sec.get('title')}")
        if not any(x.get("diet") == "vegan" for x in items):
            refuse(f"the menu's {sec.get('title')!r} has nothing vegan on it. Every part of the board does.")
    sw = next((s for s in menu if s.get("key") == "sandwiches"), {"items": []})["items"]
    veg = [x for x in sw if x.get("diet") in ("vegan", "vegetarian")]
    if len(veg) * 2 <= len(sw):
        refuse("more than half the sandwiches must be vegan or vegetarian.")
    if not sw or sw[0].get("diet") != "vegan":
        refuse("the first sandwich on the board is vegan, so nobody vegan reads past meat to get to lunch.")

    sources = d.get("sources") or {}
    for k in ("grading", "caffeine", "herbal"):
        s = sources.get(k) or {}
        if not all(s.get(f) for f in ("title", "by", "url", "read", "for")):
            refuse(f"the source for {k!r} is missing a title, a by, an address, a date read or what it is for.")

    if not isinstance(d.get("table_holds"), int) or not 1 <= d["table_holds"] <= 6:
        refuse("table_holds is how many things a small café table holds, between one and six.")

    vids = d.get("videos") or []
    if not vids:
        refuse("the telly's rack has no videos on it.")
    ids = set()
    for v in vids:
        where = f"{DATA.name}, video {v.get('id')!r}"
        extra = set(v) - VIDEO_KEYS
        if extra:
            refuse(f"{where} carries {sorted(extra)}. A video here is an id, a title, a channel, a runtime and "
                   "the day it went up: no description, no count of views or likes.")
        if not YT.match(v.get("id") or ""):
            refuse(f"{where} is not a YouTube id. love-embed.js would quietly build nothing, and the button "
                   "would never become a film.")
        if v.get("id") in ids:
            refuse(f"{where} is on the rack twice.")
        ids.add(v.get("id"))
        if not RUNTIME.match(v.get("runtime") or ""):
            refuse(f"{where} has no runtime. Every button here says how long before the press.")
        if not (v.get("title") or "").strip() or not (v.get("channel") or "").strip():
            refuse(f"{where} has no title or no channel.")
        if not CHANNEL.match(v.get("channel_id") or ""):
            refuse(f"{where} has no channel id, so the liner notes cannot link the channel it is on.")
        if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", v.get("published") or ""):
            refuse(f"{where} has no day it went up.")

    wins = d.get("windows") or []
    for w in wins:
        if w.get("shape") not in SHAPES:
            refuse(f"window {w.get('key')!r} is {w.get('shape')!r}, not square, round or arch.")
    spots = d.get("spots") or []
    if len(spots) < keep + SPARE:
        refuse(f"there are {len(spots)} perches and the shelter can hold {keep} cats; the café needs at "
               f"least {keep + SPARE}, so every cat has somewhere to sit and somewhere to go.")
    keys = set()
    for s in spots:
        k = s.get("key")
        if k in keys:
            refuse(f"two perches are keyed {k!r}.")
        keys.add(k)
        if s.get("kind") not in KINDS:
            refuse(f"perch {k!r} is a {s.get('kind')!r}, which the tool cannot draw.")
        if s.get("level") not in LEVELS:
            refuse(f"perch {k!r} is at {s.get('level')!r}, not high, middle or floor.")
        if not (s.get("where") or "").strip():
            refuse(f"perch {k!r} has no words for where a cat on it is.")
        x, y = s.get("x", -1), s.get("y", -1)
        if not (CAT_W / 2 <= x <= W - CAT_W / 2 and CAT_H <= y <= FLOOR):
            refuse(f"perch {k!r} puts a cat outside the room.")
        if s.get("kind") == "sill":
            if not any(abs(w["x"] - x) <= 12 and abs((w["y"] + w["h"] / 2) - y) <= 12 for w in wins):
                refuse(f"perch {k!r} is a sill with no window over it.")
        if s.get("level") == "floor" and s.get("kind") not in ("floor", "basket", "box", "chair"):
            refuse(f"perch {k!r} is on the floor and is a {s.get('kind')}.")
    for w in wins:
        bottom = w["y"] + w["h"] / 2
        if not any(abs(s["x"] - w["x"]) <= w["w"] / 2 and bottom - 6 <= s["y"] <= bottom + 48 for s in spots):
            refuse(f"window {w['key']!r} has nobody's place under it. Every window is cut for a cat.")
    for i, a in enumerate(spots):
        for b in spots[i + 1:]:
            if abs(a["x"] - b["x"]) < CAT_W and abs(a["y"] - b["y"]) < CAT_H:
                refuse(f"perches {a['key']!r} and {b['key']!r} overlap: two cats there would be drawn on "
                       "top of each other.")

    rules = d.get("moods") or {}
    if set(rules) != set(moods):
        refuse(f"the moods here are {sorted(rules)} and the shelter's are {sorted(moods)}. Every mood the "
               "shelter can write down needs a rule, and no rule may be for a mood it never writes.")
    for mood, r in rules.items():
        extra = set(r) - {"kinds", "levels", "toys"}
        if extra:
            refuse(f"the rule for {mood!r} reads {sorted(extra)}. Where a cat goes is its mood's perches and "
                   "heights and nothing else: never its markings.")
        if not set(r.get("kinds", [])) <= KINDS or not set(r.get("levels", [])) <= LEVELS:
            refuse(f"the rule for {mood!r} names a perch or a height the room does not have.")
        if not isinstance(r.get("toys"), bool):
            refuse(f"the rule for {mood!r} does not say whether a toy moves that cat.")
        liked = [s for s in spots if (not r.get("kinds") or s["kind"] in r["kinds"])
                 and (not r.get("levels") or s["level"] in r["levels"])]
        if not liked:
            refuse(f"no perch in the room suits a cat who is {mood!r}.")
    if "alone" not in (d.get("left_alone") or []):
        refuse("left_alone has lost 'alone'. The shelter wrote down that some cats want to be left alone, "
               "which is allowed, and the café never picks one up.")
    if not set(d.get("left_alone") or []) <= set(moods):
        refuse("left_alone names a mood the shelter never writes down.")

    for t in d.get("toys") or []:
        if not (t.get("label") and t.get("went") and isinstance(t.get("most"), int) and t["most"] >= 1):
            refuse(f"toy {t.get('key')!r} needs a label, what the cats did, and how many it can move.")
        if not set(t.get("kinds", [])) <= KINDS or not set(t.get("levels", [])) <= LEVELS:
            refuse(f"toy {t.get('key')!r} sends cats to a perch or height the room does not have.")


# ── The room ─────────────────────────────────────────────────────────────────
# Everything is outlined in --pkp-ink, the way every cat is outlined in the
# shelter's dark, so the furniture and the cats are drawn in one hand.

LINE = 'stroke="var(--pkp-ink)" stroke-width="2.5" stroke-linejoin="round"'


def plank(x0, x1, y, depth=14, fill="--pkp-birch"):
    return (f'<rect x="{n(x0)}" y="{n(y)}" width="{n(x1 - x0)}" height="{depth}" rx="3" '
            f'fill="var({fill})" {LINE}/>')


def bracket(x, y, flip=False):
    d = -1 if flip else 1
    return (f'<path d="M{n(x)} {n(y + 14)} V{n(y + 40)} L{n(x + d * 26)} {n(y + 14)} Z" '
            f'fill="var(--pkp-birch)" {LINE}/>')


def window_shape(w, dx=0.0, dy=0.0, grow=0.0):
    x, y, ww, hh = w["x"] + dx, w["y"] + dy, w["w"] + grow, w["h"] + grow
    if w["shape"] == "round":
        return "ellipse", f'cx="{n(x)}" cy="{n(y)}" rx="{n(ww / 2)}" ry="{n(hh / 2)}"'
    if w["shape"] == "arch":
        r = ww / 2
        d = (f"M{n(x - r)} {n(y + hh / 2)} V{n(y - hh / 2 + r)} A{n(r)} {n(r)} 0 0 1 {n(x + r)} "
             f"{n(y - hh / 2 + r)} V{n(y + hh / 2)} Z")
        return "path", f'd="{d}"'
    return "rect", f'x="{n(x - ww / 2)}" y="{n(y - hh / 2)}" width="{n(ww)}" height="{n(hh)}" rx="3"'


def day_square(w):
    """The square of day a window lays on the wall: its own shape, a little
    bigger, down and to the right, because the sun is up and to the left."""
    tag, a = window_shape(w, dx=w["w"] * 0.42, dy=w["h"] * 0.78, grow=8)
    return f'<{tag} {a} fill="var(--pkp-day)"/>'


def window_svg(w):
    tag, a = window_shape(w, grow=12)
    out = [f'<{tag} {a} fill="var(--pkp-card)" {LINE}/>']
    tag, a = window_shape(w)
    out.append(f'<{tag} {a} fill="var(--pkp-sky)" {LINE}/>')
    x, y, ww, hh = w["x"], w["y"], w["w"], w["h"]
    if w["shape"] == "square":
        out.append(f'<path d="M{n(x)} {n(y - hh / 2)} V{n(y + hh / 2)} M{n(x - ww / 2)} {n(y)} H{n(x + ww / 2)}" '
                   f'stroke="var(--pkp-card)" stroke-width="5"/>')
    elif w["shape"] == "arch":
        out.append(f'<path d="M{n(x)} {n(y - hh / 2)} V{n(y + hh / 2)}" stroke="var(--pkp-card)" stroke-width="5"/>')
    # A small cloud in the bigger panes: what a cat in that window is watching.
    if ww >= 70 and w["shape"] != "arch":
        cx, cy = x - ww * 0.18, y - hh * 0.2
        out.append(f'<path d="M{n(cx - 12)} {n(cy + 4)} q2 -8 10 -6 q4 -8 12 -3 q8 -1 8 7 Z" fill="var(--pkp-card)"/>')
    out.append(plank(x - ww / 2 - 14, x + ww / 2 + 14, y + hh / 2, depth=10))
    return "".join(out)


def tree_svg(spots):
    tree = [s for s in spots if s["kind"] == "tree"]
    if not tree:
        return ""
    xs = [s["x"] for s in tree]
    trunk_x = round(sum(xs) / len(xs))
    top = min(s["y"] for s in tree)
    out = [f'<rect x="{trunk_x - 13}" y="{top}" width="26" height="{FLOOR - top}" fill="var(--pkp-sisal)" {LINE}/>']
    y = top + 10
    while y < FLOOR - 6:
        out.append(f'<path d="M{trunk_x - 12} {y} L{trunk_x + 12} {y + 6}" stroke="var(--pkp-ink)" stroke-width="1.2" opacity=".55"/>')
        y += 11
    out.append(f'<rect x="{trunk_x - 46}" y="{FLOOR - 12}" width="92" height="12" rx="4" fill="var(--pkp-knit)" {LINE}/>')
    for s in tree:
        out.append(f'<ellipse cx="{n(s["x"])}" cy="{n(s["y"] + 6)}" rx="54" ry="11" fill="var(--pkp-knit)" {LINE}/>')
    return "".join(out)


def bridge_svg(spots):
    br = [s for s in spots if s["kind"] == "bridge"]
    if not br:
        return ""
    x0, x1 = min(s["x"] for s in br) - 70, max(s["x"] for s in br) + 70
    y = br[0]["y"]
    out = []
    for hx in (x0 + 24, x1 - 24):
        out.append(f'<path d="M{n(hx)} 0 V{n(y)}" stroke="var(--pkp-ink)" stroke-width="3"/>')
    out.append(f'<rect x="{n(x0)}" y="{n(y)}" width="{n(x1 - x0)}" height="16" rx="3" fill="var(--pkp-glass)" {LINE}/>')
    out.append(f'<path d="M{n(x0 + 8)} {n(y + 5)} H{n(x1 - 8)}" stroke="var(--pkp-card)" stroke-width="2.5" stroke-linecap="round"/>')
    return "".join(out)


def ledge_svg(spots):
    lg = [s for s in spots if s["kind"] == "ledge"]
    if not lg:
        return ""
    x0, x1 = min(s["x"] for s in lg) - 64, max(s["x"] for s in lg) + 64
    y = lg[0]["y"]
    return plank(x0, x1, y) + bracket(x0 + 20, y) + bracket(x1 - 20, y, flip=True)


def hammock_back(s, bridge_y):
    x, y = s["x"], s["y"]
    a, b = x - 62, x + 62
    return (f'<path d="M{n(a + 4)} {n(bridge_y + 16)} L{n(a)} {n(y - 18)} M{n(b - 4)} {n(bridge_y + 16)} L{n(b)} {n(y - 18)}" '
            f'stroke="var(--pkp-ink)" stroke-width="2.5"/>'
            f'<path d="M{n(a)} {n(y - 18)} Q{n(x)} {n(y + 22)} {n(b)} {n(y - 18)} Z" fill="var(--pkp-knit)" {LINE}/>')


def hammock_front(s):
    x, y = s["x"], s["y"]
    a, b = x - 64, x + 64
    return (f'<path d="M{n(a)} {n(y - 16)} Q{n(x)} {n(y + 14)} {n(b)} {n(y - 16)} L{n(b - 2)} {n(y - 6)} '
            f'Q{n(x)} {n(y + 30)} {n(a + 2)} {n(y - 6)} Z" fill="var(--pkp-knit)" {LINE}/>')


def cubby_back(s):
    x, y = s["x"], s["y"]
    return f'<rect x="{n(x - 52)}" y="{n(y - 90)}" width="104" height="96" rx="4" fill="var(--pkp-shade)" {LINE}/>'


def cubby_front(s):
    x, y = s["x"], s["y"]
    # The box's own front edges, so a cat inside is inside.
    return (f'<path d="M{n(x - 52)} {n(y + 6)} V{n(y - 90)} H{n(x + 52)} V{n(y + 6)} Z" fill="none" '
            f'stroke="var(--pkp-birch)" stroke-width="9" stroke-linejoin="round"/>'
            f'<path d="M{n(x - 57)} {n(y + 10)} V{n(y - 95)} H{n(x + 57)} V{n(y + 10)} Z M{n(x - 47)} {n(y + 2)} '
            f'V{n(y - 85)} H{n(x + 47)} V{n(y + 2)} Z" fill="none" {LINE}/>'
            f'{plank(x - 57, x + 57, y, depth=10)}')


def chair_svg(s, table_x):
    x, y = s["x"], s["y"]
    side = -1 if x < table_x else 1        # the back is on the side away from the table
    bx = x + side * 40
    return (f'<path d="M{n(x - 34)} {n(y + 8)} L{n(x - 30)} {FLOOR} M{n(x + 34)} {n(y + 8)} L{n(x + 30)} {FLOOR}" '
            f'stroke="var(--pkp-ink)" stroke-width="5" stroke-linecap="round"/>'
            f'<path d="M{n(bx)} {n(y + 8)} L{n(bx + side * 4)} {n(y - 64)}" stroke="var(--pkp-mug)" stroke-width="9" stroke-linecap="round"/>'
  
            f'<rect x="{n(x - 44)}" y="{n(y)}" width="88" height="10" rx="4" fill="var(--pkp-mug)" {LINE}/>')


def mug_on_table(x, y):
    return (f'<path d="M{n(x - 11)} {n(y - 20)} L{n(x - 9)} {n(y)} H{n(x + 9)} L{n(x + 11)} {n(y - 20)} Z" fill="var(--pkp-mug)" {LINE}/>'
            f'<path d="M{n(x + 11)} {n(y - 15)} q9 1 7 8 q-2 5 -9 3" fill="none" stroke="var(--pkp-mug)" stroke-width="4"/>')


def pot_on_table(x, y):
    return (f'<path d="M{n(x - 20)} {n(y - 14)} q0 -20 20 -20 q20 0 20 20 q0 14 -20 14 q-20 0 -20 -14 Z" fill="var(--pkp-mug)" {LINE}/>'
            f'<path d="M{n(x + 19)} {n(y - 16)} l16 -10" stroke="var(--pkp-ink)" stroke-width="7" stroke-linecap="round"/>'
            f'<path d="M{n(x + 19)} {n(y - 16)} l16 -10" stroke="var(--pkp-mug)" stroke-width="3.5" stroke-linecap="round"/>'
            f'<circle cx="{n(x)}" cy="{n(y - 35)}" r="4" fill="var(--pkp-mug)" {LINE}/>')


def table_svg(x):
    top = 516
    return (f'<path d="M{n(x)} {top} V{FLOOR - 6}" stroke="var(--pkp-ink)" stroke-width="7"/>'
            f'<ellipse cx="{n(x)}" cy="{FLOOR - 4}" rx="34" ry="6" fill="var(--pkp-ink)"/>'
            f'<rect x="{n(x - 58)}" y="{top - 8}" width="116" height="12" rx="5" fill="var(--pkp-birch)" {LINE}/>'
            f'{mug_on_table(x - 22, top - 8)}{pot_on_table(x + 18, top - 8)}')


def basket_back(s):
    x, y = s["x"], s["y"]
    return f'<ellipse cx="{n(x)}" cy="{n(y - 30)}" rx="58" ry="12" fill="var(--pkp-shade)" {LINE}/>'


def basket_front(s):
    x, y = s["x"], s["y"]
    out = [f'<path d="M{n(x - 58)} {n(y - 30)} Q{n(x - 56)} {n(y)} {n(x)} {n(y)} Q{n(x + 56)} {n(y)} {n(x + 58)} {n(y - 30)} '
           f'Q{n(x)} {n(y - 18)} {n(x - 58)} {n(y - 30)} Z" fill="var(--pkp-sisal)" {LINE}/>']
    for i in range(-3, 4):
        out.append(f'<path d="M{n(x + i * 14)} {n(y - 22)} V{n(y - 3)}" stroke="var(--pkp-ink)" stroke-width="1.2" opacity=".5"/>')
    return "".join(out)


def box_back(s):
    x, y = s["x"], s["y"]
    return (f'<path d="M{n(x - 50)} {n(y - 38)} L{n(x - 66)} {n(y - 64)} L{n(x - 44)} {n(y - 62)} Z" fill="var(--pkp-sisal)" {LINE}/>'
            f'<path d="M{n(x + 50)} {n(y - 38)} L{n(x + 66)} {n(y - 64)} L{n(x + 44)} {n(y - 62)} Z" fill="var(--pkp-sisal)" {LINE}/>'
            f'<rect x="{n(x - 50)}" y="{n(y - 44)}" width="100" height="10" fill="var(--pkp-shade)" {LINE}/>')


def box_front(s):
    x, y = s["x"], s["y"]
    return (f'<rect x="{n(x - 52)}" y="{n(y - 36)}" width="104" height="36" fill="var(--pkp-sisal)" {LINE}/>'
            f'<path d="M{n(x - 20)} {n(y - 28)} h40" stroke="var(--pkp-ink)" stroke-width="1.6" stroke-dasharray="5 4"/>')


def hatch_svg():
    x, y = 1110, 452
    return (f'<rect x="{x - 62}" y="{y - 44}" width="124" height="88" rx="4" fill="var(--pkp-card)" {LINE}/>'
            f'<rect x="{x - 52}" y="{y - 34}" width="104" height="68" fill="var(--pkp-shade)" {LINE}/>'
            f'{plank(x - 70, x + 70, y + 34, depth=10)}'
            f'{pot_on_table(x - 18, y + 34)}{mug_on_table(x + 26, y + 34)}')


def toys_svg():
    out = []
    # The feather wand stood in a pot by the tree, crinkle balls on the floor,
    # and a felt mouse on a string. Drawn, not pressed: the toys you can use
    # are the buttons under the picture, in words.
    out.append(f'<path d="M846 {FLOOR - 4} q-6 -60 14 -126" fill="none" stroke="var(--pkp-ink)" stroke-width="2.5"/>'
               f'<path d="M860 458 q-14 -16 -8 -36 q10 14 8 36 Z" fill="var(--pkp-ruby)" {LINE}/>'
               f'<path d="M860 458 q16 -12 18 -32 q-14 8 -18 32 Z" fill="var(--pkp-knit)" {LINE}/>'
               f'<rect x="832" y="{FLOOR - 22}" width="28" height="22" rx="4" fill="var(--pkp-mug)" {LINE}/>')
    for cx, col in ((332, "--pkp-knit"), (684, "--pkp-ruby")):
        out.append(f'<circle cx="{cx}" cy="{FLOOR - 9}" r="9" fill="var({col})" {LINE}/>'
                   f'<path d="M{cx - 5} {FLOOR - 13} l4 3 l3 -4 l3 5" fill="none" stroke="var(--pkp-ink)" stroke-width="1.2"/>')
    out.append(f'<path d="M1000 {FLOOR - 8} q14 -16 28 -2 q-14 10 -28 2 Z" fill="var(--pkp-shade)" {LINE}/>'
               f'<path d="M1028 {FLOOR - 10} q10 4 14 -6" fill="none" stroke="var(--pkp-ink)" stroke-width="1.6"/>')
    return "".join(out)


def tables_for(spots):
    chairs = sorted((s for s in spots if s["kind"] == "chair"), key=lambda s: s["x"])
    return [(a["x"] + b["x"]) / 2 for a, b in zip(chairs[0::2], chairs[1::2])]


def room_svg(d):
    spots, wins = d["spots"], d["windows"]
    tables = tables_for(spots)
    bridge_y = min((s["y"] for s in spots if s["kind"] == "bridge"), default=150)
    out = [f'<svg class="pkp-room__draw" viewBox="0 0 {W} {H}" aria-hidden="true" focusable="false">',
           f'<rect width="{W}" height="{H}" fill="var(--pkp-wall)"/>']
    out += [day_square(w) for w in wins]
    out.append(f'<rect y="{FLOOR}" width="{W}" height="{H - FLOOR}" fill="var(--pkp-floor)"/>')
    for i, x in enumerate(range(0, W, 150)):
        out.append(f'<path d="M{x + (75 if i % 2 else 0)} {FLOOR} V{H} M0 {FLOOR + 35} H{W}" stroke="var(--pkp-ink)" stroke-width="1.2" opacity=".35"/>')
    out.append(f'<rect y="{FLOOR - 8}" width="{W}" height="8" fill="var(--pkp-card)" {LINE}/>')
    out += [window_svg(w) for w in wins]
    out.append(hatch_svg())
    out.append(bridge_svg(spots))
    out.append(ledge_svg(spots))
    out.append(tree_svg(spots))
    for s in spots:
        k = s["kind"]
        if k == "shelf":
            flip = s["x"] > 160
            out.append(plank(s["x"] - 60, s["x"] + 60, s["y"]) + bracket(s["x"] + (40 if flip else -40), s["y"], flip=flip))
        elif k == "hammock":
            out.append(hammock_back(s, bridge_y))
        elif k == "cubby":
            out.append(cubby_back(s))
        elif k == "basket":
            out.append(basket_back(s))
        elif k == "box":
            out.append(box_back(s))
    for x in tables:
        out.append(table_svg(x))
    for s in spots:
        if s["kind"] == "chair":
            out.append(chair_svg(s, min(tables, key=lambda t: abs(t - s["x"]))))
    out.append(toys_svg())
    out.append("</svg>")
    return "".join(out)


def front_svg(d):
    """What stands in FRONT of a cat: the near side of the box, the basket, the
    hammock and the cubbies, so a cat in one is in it. It takes no pointer, so
    pressing a cat in a box presses the cat."""
    out = [f'<svg class="pkp-room__front" viewBox="0 0 {W} {H}" aria-hidden="true" focusable="false">']
    for s in d["spots"]:
        k = s["kind"]
        if k == "hammock":
            out.append(hammock_front(s))
        elif k == "cubby":
            out.append(cubby_front(s))
        elif k == "basket":
            out.append(basket_front(s))
        elif k == "box":
            out.append(box_front(s))
    out.append("</svg>")
    return "".join(out)


def room_block(d):
    spots = sorted(d["spots"], key=lambda s: (s["y"] // 60, s["x"]))
    lis = "\n".join(
        f'        <li data-spot="{attr(s["key"])}" data-kind="{s["kind"]}" data-level="{s["level"]}" '
        f'data-x="{n(s["x"])}" data-y="{n(s["y"])}">{esc(s["where"])}</li>' for s in spots)
    moods = json.dumps(d["moods"], separators=(",", ":"))
    return (f'    <div class="pkp-room" id="pkp-room" data-roam data-kind="cat" data-shelter="rescue-a-cat.html" '
            f'data-moods="{attr(moods)}" data-left-alone="{attr(" ".join(d["left_alone"]))}" '
            f'data-animal-w="{CAT_W}" data-animal-h="{CAT_H}" data-w="{W}" data-h="{H}">\n'
            f'      {room_svg(d)}\n'
            f'      <div class="pkp-cats" id="pkp-cats" data-roam-box></div>\n'
            f'      {front_svg(d)}\n'
            f'      <ul class="pkp-spots" id="pkp-spots" data-roam-spots hidden>\n{lis}\n      </ul>\n'
            f'    </div>')


# ── Your lap and your table, looking down ─────────────────────────────────────
# From your own seat, not from above the room: the table runs away from you
# and your lap is nearest, under a knitted blanket the café lends to anybody
# who wants a cat on them, because claws. Nobody's body is drawn: the blanket
# is the lap, and whoever is under it is you.

SLOTS = [(280, 210), (500, 170), (720, 170), (940, 210), (390, 320), (830, 320)]
ITEM_W, ITEM_H = 210, 158


def lap_svg(d):
    holds = d["table_holds"]
    out = [f'<svg class="pkp-lap__draw" id="pkp-lap-draw" viewBox="0 0 {W} {H}" data-table data-table-holds="{holds}" '
           'aria-hidden="true" focusable="false">',
           f'<rect width="{W}" height="{H}" fill="var(--pkp-floor)"/>']
    for x in range(-200, W + 200, 120):
        out.append(f'<path d="M{x} 0 L{x + 160} {H}" stroke="var(--pkp-ink)" stroke-width="1.2" opacity=".3"/>')
    out.append(f'<ellipse cx="600" cy="246" rx="560" ry="196" fill="var(--pkp-crust)" {LINE}/>')
    out.append(f'<ellipse cx="600" cy="236" rx="560" ry="196" fill="var(--pkp-birch)" {LINE}/>')
    out.append('<g id="pkp-lap-items">')
    for i, (x, y) in enumerate(SLOTS[:holds]):
        out.append(f'<g data-slot="{i}" data-x="{x - ITEM_W // 2}" data-y="{y - ITEM_H // 2}" '
                   f'data-w="{ITEM_W}" data-h="{ITEM_H}"></g>')
    out.append('</g>')
    # The blanket, knitted, across the bottom: the lap.
    out.append(f'<path d="M-10 {H + 10} V512 Q160 452 600 446 Q1040 452 1210 512 V{H + 10} Z" fill="var(--pkp-knit)" {LINE}/>')
    for k, y in enumerate((482, 520, 560, 600, 640)):
        out.append(f'<path d="M-10 {y + 30} Q600 {y - 20} 1210 {y + 30}" fill="none" stroke="var(--pkp-card)" '
                   f'stroke-width="{7 if k % 2 == 0 else 3}" opacity=".85"/>')
    out.append(f'<g id="pkp-lap-cat" data-x="450" data-y="400" data-w="300" data-h="255"></g>')
    out.append("</svg>")
    return "".join(out)


# ── The menu ─────────────────────────────────────────────────────────────────

def mug(x, y, drink, top=None, dust=False, art=None, small=False):
    s = 0.72 if small else 1.0
    rx, ry = 34 * s, 13 * s
    out = []
    if small:
        out.append(f'<ellipse cx="{n(x)}" cy="{n(y + 34 * s)}" rx="{n(rx * 1.55)}" ry="{n(ry * 1.4)}" fill="var(--pkp-mug)" {LINE}/>')
    out.append(f'<path d="M{n(x - rx)} {n(y)} L{n(x - rx * 0.86)} {n(y + 34 * s)} Q{n(x)} {n(y + 44 * s)} '
               f'{n(x + rx * 0.86)} {n(y + 34 * s)} L{n(x + rx)} {n(y)} Z" fill="var(--pkp-mug)" {LINE}/>')
    out.append(f'<path d="M{n(x + rx - 1)} {n(y + 6 * s)} q{n(18 * s)} 0 {n(16 * s)} {n(13 * s)} '
               f'q{n(-2 * s)} {n(11 * s)} {n(-18 * s)} {n(8 * s)}" fill="none" stroke="var(--pkp-ink)" stroke-width="{n(9 * s)}" stroke-linecap="round"/>')
    out.append(f'<path d="M{n(x + rx - 1)} {n(y + 6 * s)} q{n(18 * s)} 0 {n(16 * s)} {n(13 * s)} '
               f'q{n(-2 * s)} {n(11 * s)} {n(-18 * s)} {n(8 * s)}" fill="none" stroke="var(--pkp-mug)" stroke-width="{n(4.5 * s)}" stroke-linecap="round"/>')
    out.append(f'<ellipse cx="{n(x)}" cy="{n(y)}" rx="{n(rx)}" ry="{n(ry)}" fill="var(--pkp-mug)" {LINE}/>')
    out.append(f'<ellipse cx="{n(x)}" cy="{n(y + 1)}" rx="{n(rx - 5 * s)}" ry="{n(ry - 3.5 * s)}" fill="var({drink})"/>')
    if top:
        out.append(f'<ellipse cx="{n(x)}" cy="{n(y + 1)}" rx="{n(rx - 13 * s)}" ry="{n(ry - 6 * s)}" fill="var({top})"/>')
    if art == "cat":
        # A cat drawn in the foam: two ears and a round face, in the coffee.
        out.append(f'<path d="M{n(x - 7)} {n(y + 3)} q7 5 14 0 q0 -6 -2 -9 l-2 3 h-6 l-2 -3 q-2 3 -2 9 Z" '
                   f'fill="none" stroke="var(--pkp-crema)" stroke-width="1.6" stroke-linejoin="round"/>')
    if dust:
        for dx, dy in ((-8, -1), (0, 2), (7, -2), (-2, -3), (4, 3)):
            out.append(f'<circle cx="{n(x + dx * s)}" cy="{n(y + 1 + dy * s)}" r="1.4" fill="var(--pkp-cocoa)"/>')
    return "".join(out)


def glass(x, y, drink):
    return (f'<path d="M{n(x - 22)} {n(y - 30)} L{n(x - 18)} {n(y + 30)} Q{n(x)} {n(y + 36)} {n(x + 18)} {n(y + 30)} '
            f'L{n(x + 22)} {n(y - 30)} Z" fill="var(--pkp-glass)" {LINE}/>'
            f'<path d="M{n(x - 20)} {n(y - 14)} L{n(x - 17)} {n(y + 29)} Q{n(x)} {n(y + 34)} {n(x + 17)} {n(y + 29)} '
            f'L{n(x + 20)} {n(y - 14)} Z" fill="var({drink})"/>'
            f'<rect x="{n(x - 12)}" y="{n(y - 22)}" width="12" height="12" rx="2" fill="var(--pkp-glass)" {LINE}/>'
            f'<rect x="{n(x + 2)}" y="{n(y - 18)}" width="11" height="11" rx="2" fill="var(--pkp-glass)" {LINE}/>'
            f'<ellipse cx="{n(x)}" cy="{n(y - 30)}" rx="22" ry="6" fill="none" {LINE}/>')


def teapot(x, y):
    return (f'<path d="M{n(x + 24)} {n(y - 2)} l20 -16" stroke="var(--pkp-ink)" stroke-width="10" stroke-linecap="round"/>'
            f'<path d="M{n(x + 24)} {n(y - 2)} l20 -16" stroke="var(--pkp-mug)" stroke-width="5" stroke-linecap="round"/>'
            f'<path d="M{n(x - 24)} {n(y - 8)} q-16 0 -14 12 q2 10 14 8" fill="none" stroke="var(--pkp-ink)" stroke-width="9" stroke-linecap="round"/>'
            f'<path d="M{n(x - 24)} {n(y - 8)} q-16 0 -14 12 q2 10 14 8" fill="none" stroke="var(--pkp-mug)" stroke-width="4.5" stroke-linecap="round"/>'
            f'<ellipse cx="{n(x)}" cy="{n(y)}" rx="28" ry="24" fill="var(--pkp-mug)" {LINE}/>'
            f'<ellipse cx="{n(x)}" cy="{n(y - 21)}" rx="14" ry="5" fill="var(--pkp-mug)" {LINE}/>'
            f'<circle cx="{n(x)}" cy="{n(y - 28)}" r="4" fill="var(--pkp-mug)" {LINE}/>')


def plate_of(x, look):
    """Three fingers of sandwich, crusts off, seen from your seat: the top of
    each, and along its near side the cut, bread and filling and bread."""
    bread, fill = look["bread"], look["filling"]
    out = [f'<ellipse cx="60" cy="54" rx="56" ry="28" fill="var(--pkp-card)" {LINE}/>',
           f'<ellipse cx="60" cy="54" rx="40" ry="18" fill="none" stroke="var(--pkp-ink)" stroke-width="1.2" opacity=".35"/>']
    h = 3.4
    for i, cx in enumerate((32, 60, 88)):
        y0 = 36 + (6 if i == 1 else 0)
        out.append(f'<rect x="{cx - 13}" y="{y0}" width="26" height="15" rx="3" fill="var({bread})" {LINE}/>')
        band = y0 + 15
        out.append(f'<rect x="{cx - 13}" y="{n(band)}" width="26" height="3" fill="var({bread})" stroke="var(--pkp-ink)" stroke-width=".8"/>')
        for j, c in enumerate(fill):
            out.append(f'<rect x="{cx - 13}" y="{n(band + 3 + j * h)}" width="26" height="{n(h)}" fill="var({c})" stroke="var(--pkp-ink)" stroke-width=".8"/>')
        out.append(f'<rect x="{cx - 13}" y="{n(band + 3 + len(fill) * h)}" width="26" height="3.5" rx="1" fill="var({bread})" stroke="var(--pkp-ink)" stroke-width="1.2"/>')
    return "".join(out)


def item_svg(x, section):
    look = x["look"]
    out = [f'<svg class="pkp-item__draw" data-table-draw="{attr(x["key"])}" viewBox="0 0 120 90" aria-hidden="true" focusable="false">']
    if section == "sandwiches":
        out.append(plate_of(x, look))
    elif x["vessel"] == "pot":
        out.append(teapot(36, 50))
        out.append(mug(88, 50, look["drink"], look.get("top"), look.get("dust"), look.get("art"), small=True))
    elif x["vessel"] == "glass":
        out.append(glass(60, 48, look["drink"]))
    else:
        out.append(mug(56, 32, look["drink"], look.get("top"), look.get("dust"), look.get("art"),
                       small=x["vessel"] == "cup"))
    out.append("</svg>")
    return "".join(out)


def diet_words(x):
    if x["diet"] == "vegan":
        return "Vegan"
    if x["diet"] == "vegetarian":
        return "Vegetarian"
    if x["diet"] == "fish":
        return "Fish"
    return x["animal"][:1].upper() + x["animal"][1:]


def item_card(x, section):
    lines = [f'<p class="pkp-item__diet"><span class="pkp-mark pkp-mark--{x["diet"]}">{esc(diet_words(x))}</span></p>',
             f'<p class="pkp-item__what"><span class="sr">In it: </span>{esc(x["what"])}</p>',
             f'<p class="pkp-item__has">{esc(hgc.contains(x))}</p>']
    if section != "sandwiches":
        lines.append(f'<p class="pkp-item__caf">{esc(CAFFEINE_SAYS[caffeine(x["what"])])}</p>')
    if x.get("ask"):
        lines.append(f'<p class="pkp-item__ask">{esc(x["ask"])}</p>')
    if x.get("note"):
        lines.append(f'<p class="pkp-item__note">{esc(x["note"])}</p>')
    body = "\n          ".join(lines)
    return (f'        <li class="pkp-item" id="pkp-item-{x["key"]}">\n'
            f'          {item_svg(x, section)}\n'
            f'          <h4 class="pkp-item__name">{esc(x["name"])}</h4>\n'
            f'          {body}\n'
            f'          <p class="pkp-item__go"><button type="button" class="pkp-btn" data-table-order="{attr(x["key"])}" '
            f'data-table-name="{attr(x["name"])}" hidden>Bring it to my table</button> '
            f'<span class="pkp-said" data-table-said aria-hidden="true" hidden></span></p>\n'
            '        </li>')


def menu_block(d):
    out = []
    for sec in d["menu"]:
        out.append(f'    <section class="pkp-board" aria-labelledby="pkp-{sec["key"]}-h">')
        out.append(f'      <h3 id="pkp-{sec["key"]}-h">{esc(sec["title"])}</h3>')
        out.append(f'      <p class="pkp-board__lede">{esc(sec["lede"])}</p>')
        out.append('      <ul class="pkp-items">')
        out += [item_card(x, sec["key"]) for x in sec["items"]]
        out.append('      </ul>')
        out.append('    </section>')
    return "\n".join(out)


def toys_block(d):
    return "\n".join(
        f'      <button type="button" class="pkp-btn pkp-toy" data-roam-toy data-toy="{attr(t["key"])}" '
        f'data-kinds="{attr(" ".join(t.get("kinds", [])))}" data-levels="{attr(" ".join(t.get("levels", [])))}" '
        f'data-most="{t["most"]}" data-went="{attr(t["went"])}" hidden>{esc(t["label"])}</button>'
        for t in d["toys"])


def day(iso):
    y, m, dd = (int(x) for x in iso.split("-"))
    return f"{dd} {MONTHS[m - 1]} {y}"


def telly_block(d):
    sid, sname = SCREEN
    out = [f'    <div class="pkp-screen" data-rack-screen="{sid}" tabindex="-1" hidden>',
           '      <p class="pkp-screen__idle"><span><b>The telly.</b> Nothing is on it. Any film on the rack can go '
           'up here with the button under it, and nothing loads until you press one.</span></p>',
           '    </div>',
           f'    <p class="pkp-screen__now" data-rack-now="{sid}" tabindex="-1" hidden></p>',
           f'    <p class="pkp-screen__back" hidden><button type="button" class="pkp-btn pkp-btn--quiet" '
           f'data-rack-back="{sid}">Take it off the telly</button></p>',
           '    <details class="pkp-rack" open>',
           '      <summary class="pkp-rack__sum">The rack: films from cat cafés</summary>',
           '      <ul class="pkp-vids">']
    for v in d["videos"]:
        t, c, r = esc(v["title"]), esc(v["channel"]), v["runtime"]
        out += [
            '        <li class="pkp-vid" data-rack-card>',
            f'          <h3 class="pkp-vid__title">{t}</h3>',
            f'          <p class="pkp-vid__by">{c} &middot; {day(v["published"])} &middot; {r}</p>',
            f'          <button type="button" class="facade" data-embed-id="{v["id"]}" data-embed-title="{attr(v["channel"])} &mdash; {attr(v["title"])}">',
            f'            Watch it here &mdash; {r}',
            '            <span class="facade__play">&#9654; PRESS PLAY</span>',
            '          </button>',
            f'          <button type="button" class="pkp-btn pkp-btn--quiet pkp-vid__big" hidden data-rack-to="{sid}" '
            f'data-rack-name="{sname}" data-rack-src="https://www.youtube-nocookie.com/embed/{v["id"]}?autoplay=1&amp;rel=0" '
            f'data-rack-title="{attr(v["channel"])} &mdash; {attr(v["title"])}, on {sname}" data-rack-film="{attr(v["title"])}" '
            f'data-rack-runtime="{r}">Put it on {sname} &mdash; {r}</button>',
            '        </li>']
    out += ['      </ul>', '    </details>']
    return "\n".join(out)


def liner_sources(d):
    s = d["sources"]
    rows = [(v["for"], f'<a href="{attr(v["url"])}">{esc(v["title"])}</a>, {esc(v["by"])}, read {esc(v["read"])}')
            for v in (s["grading"], s["caffeine"], s["herbal"])]
    rows.append(("The nine major food allergens and gluten on every card",
                 'Worked out by the same engine as <a href="hey-good-cookin.html">Hey, Good Cookin&rsquo;</a>, '
                 'which read the nine on the U.S. Food and Drug Administration&rsquo;s page on 2026-10-04'))
    chans = []
    for v in d["videos"]:
        link = f'<a href="https://www.youtube.com/channel/{v["channel_id"]}">{esc(v["channel"])}</a>'
        if link not in chans:
            chans.append(link)
    rows.append(("The films on the telly’s rack",
                 "Ryan Boren’s pick, of 2026-10-04, in his order, each on its own channel on YouTube: "
                 + ", ".join(chans[:-1]) + " and " + chans[-1]
                 + ". None of them is affiliated with Stimpunks, and nothing of theirs is hosted here"))
    rows.append(("The cats",
                 'Read off <a href="rescue-a-cat.html">Rescue A Cat</a>&rsquo;s own list every time the room opens, '
                 'and drawn by the same file that draws them there'))
    return "\n".join(f'      <tr><td>{esc(w)}</td><td>{src}</td></tr>' for w, src in rows)


# ── The script, the shelter, and the page as written ─────────────────────────

def code_of(path):
    c = re.sub(r"/\*.*?\*/", " ", path.read_text(), flags=re.S)
    return re.sub(r"(?m)^\s*//[^\n]*", " ", c)


ROAM = ROOT / "roam.js"
TALK = re.compile(r"method\s*:|POST|authorization|love-cb|\bhandle\b|\.pass\b", re.I)
WIRE = re.compile(r"XMLHttpRequest|sendBeacon|WebSocket|EventSource")
KEEPS = re.compile(r"localStorage|sessionStorage|indexedDB|document\.cookie")
WRITES_HTML = ("innerHTML", "insertAdjacentHTML", "outerHTML")


def check_roam(say=None):
    """roam.js, shared with The Run since 2026-10-05: the one file that reads a
    shelter's list and puts its animals on perches. make-the-run.py calls this
    too, so the two rooms hold the file to one set of promises."""
    say = say or refuse
    if not ROAM.exists():
        say(f"{ROAM.name} is missing, and every shelter animal in every room with it.")
        return
    js = code_of(ROAM)
    if KEEPS.search(js):
        say(f"{ROAM.name} keeps something in your browser. Nothing is kept: not who was with you, not "
            "which animals you met.")
    if js.count("fetch(") != 1:
        say(f"{ROAM.name} must make exactly one fetch: the shelter's list.")
    if "fetch('/cb/shelter?kind=' + KIND" not in js:
        say(f"{ROAM.name} no longer fetches the shelter's own list, /cb/shelter?kind= and the room's kind.")
    m = re.search(r"var KINDS = \{([^}]*)\}", js)
    if not m or set(re.findall(r"(\w+)\s*:", m.group(1))) - {"cat", "dog"}:
        say(f"{ROAM.name} will read a shelter it was never meant to: its KINDS must be cat and dog only.")
    if TALK.search(js):
        say(f"{ROAM.name} sends something or knows about a CB pass. Adopting is the shelter's; a room only "
            "points at it.")
    if WIRE.search(js):
        say(f"{ROAM.name} talks to a server some other way than the one fetch.")
    if re.search(r"\.mark\b", js):
        say(f"{ROAM.name} reads an animal's markings. Where an animal goes is its mood's business; a marking "
            "is only ever handed to animals.js to draw.")
    if "'#animal-'" not in js:
        say(f"{ROAM.name} no longer links each animal to its own card at its shelter.")
    if any(w in js for w in WRITES_HTML):
        say(f"{ROAM.name} writes HTML. An animal's name is somebody else's words and goes in as text.")
    if re.search(r"\btransform\b", js):
        say(f"{ROAM.name} moves something with a transform. Animals move with left and top, arcade.js's "
            "call, so check-gentle.py can see everything that moves.")


def check_script():
    check_roam()
    if not SCRIPT.exists():
        refuse(f"{SCRIPT.name} is missing, and the cats' words with it.")
        return
    js = code_of(SCRIPT)
    if KEEPS.search(js):
        refuse(f"{SCRIPT.name} keeps something in your browser. The café keeps nothing: not your lap, not "
               "your table, not which cats you met.")
    if "fetch(" in js or WIRE.search(js) or TALK.search(js):
        refuse(f"{SCRIPT.name} asks for something. The café's one request is roam.js's, to the shelter's list.")
    if "window.loveRoam(" not in js:
        refuse(f"{SCRIPT.name} no longer hands the cats to roam.js.")
    if re.search(r"\.mark\b", js):
        refuse(f"{SCRIPT.name} reads a cat's markings. Where a cat goes is its mood's business; a marking "
               "is only ever handed to animals.js to draw.")
    if "rescue-a-cat.html" not in js:
        refuse(f"{SCRIPT.name} no longer names Rescue A Cat, where the cats are adopted.")
    if any(w in js for w in WRITES_HTML):
        refuse(f"{SCRIPT.name} writes HTML. A cat's name is somebody else's words and goes in as text.")
    if re.search(r"\btransform\b", js):
        refuse(f"{SCRIPT.name} moves something with a transform.")
    sweep(" ".join(re.findall(r"'([^'\\]*(?:\\.[^'\\]*)*)'", js)), SCRIPT.name)


def check_table():
    """table.js is shared with Brew and Stew, and it keeps the café's promise
    about your table: nothing kept, nothing sent, nothing written as HTML."""
    js = code_of(TABLE)
    if re.search(r"localStorage|sessionStorage|indexedDB|document\.cookie|fetch\(|XMLHttpRequest|sendBeacon", js):
        refuse(f"{TABLE.name} stores or sends something. What is on your table lives in the page.")
    if "innerHTML" in js or "insertAdjacentHTML" in js or "outerHTML" in js:
        refuse(f"{TABLE.name} writes HTML.")


def check_neighbours():
    sh = SHELTER.read_text()
    if "li.id = 'animal-' + a.id" not in sh or "function arrive()" not in sh:
        refuse(f"{SHELTER.name} no longer gives each shelter cat the address #animal-<id> and lands on it, "
               "which is where every cat's card in the café sends somebody to adopt them.")
    an = ANIMALS.read_text()
    if "function drawCurled(" not in an or "if (!bare) add(svg, 'ellipse'" not in an:
        refuse(f"{ANIMALS.name} can no longer draw a cat bare or curled, which is how the café draws the "
               "shelter's cats in daylight and asleep on a lap.")


def check_page():
    src = PAGE.read_text()
    for want, why in (('src="animals.js"', "it does not load animals.js, which draws the cats"),
                      ('src="roam.js"', "it does not load roam.js, which puts the cats on their perches"),
                      ('src="purrs.js"', "it does not load purrs.js"),
                      ('data-roam data-kind="cat" data-shelter="rescue-a-cat.html"',
                       "its room no longer tells roam.js these are Rescue A Cat's cats"),
                      ('src="table.js"', "it does not load table.js, which puts things on your table"),
                      ('href="rescue-a-cat.html"', "it does not link Rescue A Cat, where the cats are adopted"),
                      ('id="pkp-says"', "it has no live region for what the café says"),
                      ('src="love-embed.js"', "it does not load love-embed.js, so every film on the rack would press "
                                              "and do nothing, which is Mycelium Munchies' first rack"),
                      ('src="rack.js"', "it does not load rack.js, so no film could go up on the telly")):
        if want not in src:
            refuse(f"{PAGE.name}: {why}.")
    if 'data-cb="off"' in src:
        refuse(f"{PAGE.name} switches the CB off; nothing in this room asks for that.")
    plain = re.sub(r"<script\b.*?</script>", " ", src, flags=re.S)
    # The films' titles and channels are theirs, quoted as written, and are
    # not swept: the Doom Scoop's rule.
    plain = re.sub(r'<(h3|p) class="pkp-vid__(?:title|by)">.*?</\1>', " ", plain, flags=re.S)
    plain = re.sub(r"<!--.*?-->", " ", plain, flags=re.S)
    sweep(plain, PAGE.name)
    # The palette lives in §94 and :root, and no vessel in the drawings may
    # wear anything but the house glaze.
    for m in re.finditer(r'<svg class="pkp-item__draw".*?</svg>', src, re.S):
        if re.search(r'fill="var\(--pkp-(?:link|wall|day)\)"', m.group(0)):
            refuse(f"{PAGE.name}: a menu drawing is painted in a colour that is not food, drink or the "
                   "house glaze.")


def section_css():
    css = CSS.read_text()
    m = re.search(rf"/\* §{SECTION} ── ROOM: Pekoe and Purrs.*?(?=/\* §\d+ ── )", css, re.S)
    if not m:
        refuse(f"love.css has no §{SECTION} for Pekoe and Purrs, followed by another section.")
        return
    body = re.sub(r"/\*.*?\*/", " ", m.group(0), flags=re.S)
    if re.search(r"#[0-9a-fA-F]{3,6}\b|rgba?\(", body):
        refuse(f"love.css §{SECTION} has a literal colour in it. The room's colours are --pkp- custom "
               "properties in :root, where check-contrast.py can find them.")
    if re.search(r"transform\s*:\s*(?:rotate|skew)", body):
        refuse(f"love.css §{SECTION} rotates or skews something. Nothing in the café tilts.")


def main():
    d = json.loads(DATA.read_text())
    keep, moods = shelter_facts()
    check_data(d, keep, moods)
    for k in ("_what", "_menu"):
        sweep(d.get(k, ""), f"{DATA.name} {k}")
    for sec in d.get("menu") or []:
        for x in sec.get("items") or []:
            sweep(" ".join(str(x.get(f, "")) for f in ("name", "what", "ask", "note")), f"{DATA.name}, {x.get('name')}")
    if problems:
        print("REFUSING:\n  " + "\n  ".join(dict.fromkeys(problems)))
        sys.exit(1)
    swap(PAGE, "pkp:room", room_block(d), "    ")
    swap(PAGE, "pkp:lap", "      " + lap_svg(d), "      ")
    swap(PAGE, "pkp:toys", toys_block(d), "      ")
    swap(PAGE, "pkp:menu", menu_block(d), "    ")
    swap(PAGE, "pkp:telly", telly_block(d), "    ")
    swap(NOTES, "pekoe-sources", liner_sources(d), "      ")
    check_script()
    check_table()
    check_neighbours()
    check_page()
    section_css()
    if problems:
        print("REFUSING (the page as written):\n  " + "\n  ".join(dict.fromkeys(problems)))
        sys.exit(1)
    print("pekoe and purrs: the room, every perch, your lap and your table, the toys, the menu, the "
          "telly's rack and the credits written; the cats are the shelter's, read when the room opens")


if __name__ == "__main__":
    main()
