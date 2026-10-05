#!/usr/bin/env python3
"""Build Truckin' Food Court, which everybody calls the Truck Stop, out of
data/truckin-food-court.json: the court with its trucks round the porch, every
truck's board, your table, the screen on the side of the Cooler and its rack,
and the room's credits in the liner notes.

WHAT THE ROOM IS. Ryan Boren's brief, 2026-10-05, the second of the outdoor
lots side by side where the buildings stop, between the Run and the Green and
serving both: an outdoor food court with a covered porch of tables, food trucks
that each serve one thing several ways -- tacos, bánh mì, ramen and dog treats --
and a drinks truck with iced water, iced tea, lemonade, hibiscus tea, boba,
flavoured ice, oral rehydration solutions and other things to drink when it is
hot.

NOTHING HAS A PRICE, AND THE TOOL REFUSES ONE. Our own Third Places entry asks
for a place that provides community without being required to buy stuff, and a
food court is exactly the shape of thing a page fills with prices. The trucks
hand things out. Hey, Good Cookin's refusals of anything owed (pay it forward,
a donation, a jar) are imported and swept in the room's voice with the
negation window, and so are prices, including one written with a currency sign.

EVERY ITEM SAYS WHAT IS IN IT, AND THE KITCHENS ON THIS STREET SHARE ONE ENGINE.
Hey, Good Cookin' works out the FDA's nine allergens and gluten from a dish's
ingredients, checks vegan, vegetarian and every named animal, and words the
line; this tool imports it rather than keeping a second list, and the engine
learned two words for this room the day it opened: a baguette is wheat bread,
and oat flour is oats. Every drink's caffeine is worked out from its
ingredients with Pekoe and Purrs' own words for a bean, a leaf, a flower or
chocolate, and a drink is only called caffeine-free when every part of it is on
a short list of things that are: water, ice, fruit, sugar, salt. A drink with
something unknown in it is refused rather than called none by default.

THE TREAT TRUCK IS FOR DOGS, AND THE DOGS' ROOM HOLDS ITS LIST. Every bag is
checked against the ASPCA's list of people foods to keep from pets with
poisoned(), which lives in make-the-run.py and is imported here, and the Run's
treat tin is filled from this same file. A bag that says it is for people is
refused, and every bag says it is for dogs.

THE ORAL REHYDRATION SOLUTION IS THE WORLD HEALTH ORGANIZATION'S, TO THE GRAM.
Its card gives the WHO's own figures per litre, from Oral Rehydration Salts:
Production of the new ORS (2006), and the tool refuses a card whose figures
differ from the four held here. Nobody at the hatch asks why anybody wants it,
and nothing on the page says what it does for a body: a drinks truck is the
place a page reaches for the vocabulary of a cure, and the tool refuses it.

A TRUCK LEADS WITH A VEGAN ITEM, THE SAME SIZE AS THE REST, Big Steep's rule for
its alcohol-free pour, and the tool refuses a food truck whose first item has
anything from an animal in it.

NOTHING ON THE BOARDS IS AUTHENTIC, EXOTIC, ETHNIC OR THE BEST, in our voice:
Vital Plant Living's refusal of othering somebody's food, and the Lagoon's
refusal of a ranking. A dish is called what it is, and where it comes from is
said from Wikipedia's article on it, with the article named. The rack's titles
are the channels' own -- the best taco in the world, a Michelin star, the most
hyped bánh mì -- and they are quoted as written and not swept.

THE NAME BORROWS A WORD AND NEVER THE LINE AFTER IT. Truckin' has been the word
since Robert Crumb's Keep On Truckin' in Zap Comix #1, 1968, and the Grateful
Dead's song on American Beauty, 1970, with Robert Hunter's lyric. The song's
most famous line is refused on the page with no negation window, Hey, Good
Cookin's rule for the words after its own title.

THE LIGHT COMES THROUGH THE AWNINGS. Every truck has its awning out over its
hatch, two colours in stripes, and the sun through it lays those stripes on the
counter and on the ground in front. Between the trucks, out in the open, the lot
is plain sun. See §97 for the collisions.

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
DATA = ROOT / "data/truckin-food-court.json"
PAGE = ROOT / "truckin-food-court.html"
NOTES = ROOT / "liner-notes.html"
CSS = ROOT / "love.css"
SECTION = 97

W, H = 1200, 600      # the court's drawing
TRUCK_ORDER = ["tacos", "banh-mi", "ramen", "treats", "cooler"]
TRUCK_KEYS = {"key", "name", "sign", "awning", "lede", "about", "items", "for"}
ITEM_KEYS = {"key", "name", "diet", "what", "animal", "note", "ask", "look"}
LOOKS = {
    "tacos": {"shell", "fill"},
    "banh-mi": {"bread", "fill"},
    "ramen": {"broth", "top"},
    "treats": {"treat"},
    "cooler": {"drink", "ice", "pearls", "shaved"},
}
YT = re.compile(r"^[A-Za-z0-9_-]{11}$")
CHANNEL = re.compile(r"^UC[A-Za-z0-9_-]{22}$")
RUNTIME = re.compile(r"^(?:\d+:[0-5]\d|\d+:[0-5]\d:[0-5]\d)$")
VIDEO_KEYS = {"id", "title", "channel", "channel_id", "runtime", "published", "state", "why", "start"}
SCREEN = ("tks", "the screen on the Cooler")
MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August",
          "September", "October", "November", "December"]
# The WHO's reduced-osmolarity oral rehydration salts, grams per litre of water:
# Oral Rehydration Salts: Production of the new ORS, WHO/FCH/CAH/06.1, 2006,
# Table 1, read 2026-10-05.
ORS = {"sodium chloride": "2.6", "glucose": "13.5", "potassium chloride": "1.5", "trisodium citrate": "2.9"}

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
run = tool("make-the-run")


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
    v = round(float(v), 1)
    return str(int(v)) if v == int(v) else str(v)


# ── Caffeine ─────────────────────────────────────────────────────────────────
# Pekoe and Purrs' words for a bean, a leaf, a flower and chocolate decide
# whether a drink has caffeine. A drink is caffeine-free only when every part of
# it is something here; anything else is refused rather than called none.
PLAIN = (r"water|ice|filtered|sparkling|lemons?|limes?|juice|salted limes?|preserved|"
         r"sugar|cane sugar|brown sugar|syrup|mango|watermelon|coconuts?|young|chamoy|salt|chilli|"
         r"glucose|sodium chloride|potassium chloride|trisodium citrate|tapioca pearls|oat milk|"
         r"hibiscus|flowers|orange")
FULL_ELSEWHERE = r"cola|guarana|yerba|mate|energy"


def caffeine(what):
    level = pekoe.caffeine(what)
    if re.search(rf"\b(?:{FULL_ELSEWHERE})\b", what, re.I):
        return "full"
    if level:
        return level
    t = re.sub(r"[(),.]", " ", what.lower())
    t = re.sub(r"\b(?:and|with|a|an|of|the|over|in|from|inside|blended|steeped|chilled|sweetened|brewed|"
               r"strong|poured|wedge|pinch|fine|shaved|splash|world|health|organization's|amounts|plain)\b", " ", t)
    rest = re.sub(rf"\b(?:{PLAIN})\b", " ", t).split()
    return None if rest else "none"


# ── The voice ────────────────────────────────────────────────────────────────

NEGATION = hgc.NEGATION
PRICE = (r"prices?|priced|costs?|charged?|charges|pay|pays|paid|paying|payment|buy|buys|bought|sell|sells|"
         r"sold|selling|for sale|cash|cards? accepted|tips?|tip jar|dollars?|cents?|pounds|euros?")
CURRENCY = r"(?<!\w)[$£€¥]\s?\d"
RANK = (r"best|greatest|finest|number one|no\. 1|top \d+|michelin|award[- ]winning|famous|legendary|"
        r"most popular|ranked|rankings?")
CLAIM = (r"cures?|cure for|heals?|healing|remed\w+|medicine|medicinal|good for you|boost\w*|detox\w*|"
         r"replenish\w*|immun\w+|treats? dehydration|prevents?")
LYRIC = r"long,?\s+strange\s+trip"
VOCAB = [
    (PRICE, "a price, or paying. Nothing at the Truck Stop has a price on it: the trucks hand things out, "
            "and our Third Places entry asks for a place that provides community without being required "
            "to buy stuff."),
    (hgc.OWED, "something owed. Nothing at the Truck Stop is earned and nothing is paid back: Hey, Good "
               "Cookin's refusal, and Nothing For Sale's."),
    (hgc.SORT, "sorting the people who eat here. Anybody hungry comes to the hatch."),
    (hgc.DIET, "a verdict on food or on a body. Food is food at the Truck Stop."),
    (hgc.OTHER, "othering somebody's food, Vital Plant Living's refusal: a dish is called what it is."),
    (hgc.PICKY, "sorting eaters. Nobody here is picky."),
    (RANK, "a ranking. No truck and no dish is the best of anything; the rack's titles are the channels' and "
           "say that in their words, and the room never does."),
    (CLAIM, "a claim about what something does for a body. Every cup says what is in it, and nothing says what "
            "it is good for."),
]


def sweep(text, where):
    text = html.unescape(re.sub(r"<[^>]+>", " ", str(text)))
    for pat, why in VOCAB:
        for m in re.finditer(rf"\b(?:{pat})\b", text, re.I):
            window = text[max(0, m.start() - 80):m.end()]
            if re.search(rf"\b{NEGATION}\b[^.]{{0,70}}?\b(?:{pat})", window, re.I):
                continue
            refuse(f"{where}: {m.group(0)!r} -- {why}")
    if re.search(CURRENCY, text):
        refuse(f"{where}: a price written with a currency sign. Nothing at the Truck Stop has a price on it.")
    if re.search(LYRIC, text, re.I):
        refuse(f"{where}: the most famous line of the song the name borrows a word from is on the page. It is a "
               "lyric, and this street sets no lyric it does not hold permission for.")


# ── The checks on the room's own data ────────────────────────────────────────

def declared():
    css = CSS.read_text()
    root = re.search(r":root\s*\{(.*?)\n\}", css, re.S)
    return set(re.findall(r"(--tks-[a-z0-9-]+):\s*#", root.group(1) if root else ""))


def check_item(truck, x, colours, where):
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
    want = LOOKS[truck["key"]]
    if set(look) - want:
        refuse(f"{where}: {name!r}'s look carries {sorted(set(look) - want)}; a {truck['key']} item is drawn "
               f"from {sorted(want)}.")
    for k, v in look.items():
        for c in (v if isinstance(v, list) else [v]):
            if isinstance(c, bool):
                continue
            if c not in colours:
                refuse(f"{where}: {name!r}'s {k} is {c!r}, which :root does not declare.")
    if truck["key"] == "treats":
        bad = run.poisoned(x.get("what") or "")
        if bad:
            refuse(f"{where}: the treat {name!r} has in it what the ASPCA lists under {', '.join(bad)}. "
                   "Nothing on that list goes in a dog's treat.")
        if "peanut butter" in (x.get("what") or "") and "plain peanut butter" not in x["what"]:
            refuse(f"{where}: {name!r} has peanut butter in it that does not say it is plain. Every treat's "
                   "peanut butter is peanuts and nothing else, and its card says so.")
    if truck["key"] == "cooler":
        if caffeine(x.get("what") or "") is None:
            refuse(f"{where}: {name!r}'s ingredients include something this tool cannot place, so its caffeine "
                   "cannot be worked out. Say what it is made from rather than letting it pass as none.")
        if not ("drink" in look or "shaved" in look):
            refuse(f"{where}: {name!r} has no colour for what is in the cup.")
    if x.get("key") == "ors":
        text = (x.get("what") or "") + " " + (x.get("note") or "")
        if "World Health Organization" not in text:
            refuse(f"{where}: the oral rehydration solution no longer says it is the WHO's.")
        for part, grams in ORS.items():
            if not re.search(rf"\b{re.escape(grams)} g of {re.escape(part)}\b", text):
                refuse(f"{where}: the oral rehydration solution's card does not give {grams} g of {part} per "
                       "litre, the WHO's own figure (2006, Table 1). Copy the table; never round it.")


def check_data(d):
    trucks = d.get("trucks") or []
    if [t.get("key") for t in trucks] != TRUCK_ORDER:
        refuse(f"the trucks are {[t.get('key') for t in trucks]}; the brief's are tacos, bánh mì, ramen, dog "
               "treats and the drinks truck, in that order round the porch.")
        return
    colours = declared()
    keys = set()
    for t in trucks:
        where = f"{DATA.name}, {t.get('name')}"
        if set(t) - TRUCK_KEYS:
            refuse(f"{where} carries {sorted(set(t) - TRUCK_KEYS)}, which nothing reads.")
        for f in ("name", "sign", "lede", "about"):
            if not (t.get(f) or "").strip():
                refuse(f"{where} has no {f}.")
        aw = t.get("awning") or []
        if len(aw) != 2 or any(c not in colours for c in aw):
            refuse(f"{where}'s awning must be two of the room's own declared colours, in stripes.")
        items = t.get("items") or []
        if not items:
            refuse(f"{where} has nothing on its board.")
            continue
        if t["key"] != "cooler" and items[0].get("diet") != "vegan":
            refuse(f"{where}'s first item is not vegan. Every truck leads with a vegan one, the same size as the "
                   "rest, so nobody vegan reads past meat to get to lunch.")
        if t["key"] == "treats" and t.get("for") != "dogs":
            refuse(f"{where} does not say its treats are for dogs.")
        if t["key"] != "treats" and t.get("for"):
            refuse(f"{where} says it is for {t['for']}; only the treat truck is for anybody but people.")
        for x in items:
            if x.get("key") in keys:
                refuse(f"two items are keyed {x.get('key')!r}; a key is a card's address.")
            keys.add(x.get("key"))
            check_item(t, x, colours, where)
    aw = [tuple(t.get("awning") or []) for t in trucks]
    if len({a[0] for a in aw if a}) != len(aw):
        refuse("two trucks have the same awning. The light under each one is its own colour; two the same "
               "would be one light twice.")

    vids = d.get("rack") or []
    if [g.get("key") for g in vids] != ["banh-mi", "tacos", "ramen"]:
        refuse("the rack is Ryan's three shelves, bánh mì, tacos and ramen, in his order.")
    ids = set()
    for g in vids:
        if not (g.get("title") and g.get("videos")):
            refuse(f"the rack's shelf {g.get('key')!r} has no title or no films.")
        for v in g.get("videos") or []:
            where = f"{DATA.name}, video {v.get('id')!r}"
            if set(v) - VIDEO_KEYS:
                refuse(f"{where} carries {sorted(set(v) - VIDEO_KEYS)}. A film here is an id, a title, a channel, "
                       "a runtime and the day it went up: no description, no count of views or likes.")
            if not YT.match(v.get("id") or ""):
                refuse(f"{where} is not a YouTube id.")
            if v.get("id") in ids:
                refuse(f"{where} is on the rack twice.")
            ids.add(v.get("id"))
            if not RUNTIME.match(v.get("runtime") or ""):
                refuse(f"{where} has no runtime. Every button here says how long before the press.")
            if v.get("state", "screen") not in ("screen", "door"):
                refuse(f"{where} is {v.get('state')!r}: a film is a screen, or a door when its channel has "
                       "switched off showing it on other sites.")
            if v.get("state") == "door" and not (v.get("why") or "").strip():
                refuse(f"{where} is a door with no reason. Say what was measured.")
            if "start" in v and not (isinstance(v["start"], int) and v["start"] > 0):
                refuse(f"{where}'s start is not a number of seconds.")
            if not CHANNEL.match(v.get("channel_id") or ""):
                refuse(f"{where} has no channel id, so the liner notes cannot link the channel it is on.")
            if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", v.get("published") or ""):
                refuse(f"{where} has no day it went up.")
    src = d.get("sources") or {}
    for k in ("third", "taco", "birria", "banh-mi", "ramen", "ors", "boba", "hibiscus", "shaved", "agua", "counter", "truckin"):
        s = src.get(k) or {}
        if not all(s.get(f) for f in ("title", "by", "url", "read", "for")):
            refuse(f"the source for {k!r} is missing a title, a by, an address, a date read or what it is for.")


# ── The court ────────────────────────────────────────────────────────────────
# From under the porch roof, looking out: the roof's edge across the top, the
# five trucks in a row on the lot with their awnings out, the stripes of light
# under each awning lying on its counter and the ground in front, the gates to
# the Run and the Green at either end, and two of the porch's tables in front.
# Everything is outlined in --tks-ink.

LINE = 'stroke="var(--tks-ink)" stroke-width="2.5" stroke-linejoin="round"'
TRUCK_X = [40, 268, 496, 724, 952]
TRUCK_W = 208
BODY_TOP, BODY_BOTTOM = 210, 392


def stripes(x0, x1, y0, y1, cols, n_=10, opacity=None):
    """A band of stripes, alternating the two colours."""
    w = (x1 - x0) / n_
    op = f' opacity="{opacity}"' if opacity else ""
    return "".join(f'<rect x="{n(x0 + i * w)}" y="{n(y0)}" width="{n(w + .4)}" height="{n(y1 - y0)}" '
                   f'fill="var({cols[i % 2]})"{op}/>' for i in range(n_))


def light_on_ground(x0, x1, y0, y1, slant, cols, n_=10):
    """The awning's stripes laid on the ground in front of the truck, as
    parallelograms: the sun is up and a little behind the trucks."""
    w = (x1 - x0) / n_
    out = []
    for i in range(n_):
        a, b = x0 + i * w, x0 + (i + 1) * w
        out.append(f'<path d="M{n(a)} {n(y0)} L{n(b)} {n(y0)} L{n(b + slant)} {n(y1)} L{n(a + slant)} {n(y1)} Z" '
                   f'fill="var({cols[i % 2]})" opacity=".42"/>')
    return "".join(out)


def truck(i, t):
    x = TRUCK_X[i]
    cab_left = i % 2 == 1
    body_x0, body_x1 = x + (46 if cab_left else 0), x + TRUCK_W - (0 if cab_left else 46)
    cab_x0, cab_x1 = (x, x + 50) if cab_left else (x + TRUCK_W - 50, x + TRUCK_W)
    aw = t["awning"]
    out = []
    # The cab, and the body with its signwritten panel (no letters: the name is
    # on the truck's board below, in words anybody can read).
    out.append(f'<path d="M{cab_x0} {BODY_BOTTOM} V{BODY_TOP + 70} Q{(cab_x0 + cab_x1) / 2} {BODY_TOP + 40} {cab_x1} '
               f'{BODY_TOP + 66} V{BODY_BOTTOM} Z" fill="var(--tks-white)" {LINE}/>')
    wx0, wx1 = cab_x0 + 10, cab_x1 - 10
    out.append(f'<path d="M{wx0} {BODY_TOP + 98} V{BODY_TOP + 76} Q{(wx0 + wx1) / 2} {BODY_TOP + 58} {wx1} {BODY_TOP + 74} '
               f'V{BODY_TOP + 98} Z" fill="var(--tks-day)" {LINE}/>')
    out.append(f'<rect x="{body_x0}" y="{BODY_TOP}" width="{body_x1 - body_x0}" height="{BODY_BOTTOM - BODY_TOP}" rx="6" '
               f'fill="var(--tks-white)" {LINE}/>')
    out.append(f'<rect x="{body_x0 + 8}" y="{BODY_TOP + 10}" width="{body_x1 - body_x0 - 16}" height="22" rx="4" '
               f'fill="var({aw[0]})" {LINE}/>')
    # The hatch, open, the kitchen in shade behind it, and the counter shelf.
    hx0, hx1 = body_x0 + 18, body_x1 - 18
    out.append(f'<rect x="{hx0}" y="{BODY_TOP + 48}" width="{hx1 - hx0}" height="78" rx="3" fill="var(--tks-kitchen)" {LINE}/>')
    # The light under the awning: its stripes, laid across the counter.
    out.append(stripes(hx0 - 6, hx1 + 6, BODY_TOP + 126, BODY_TOP + 140, aw, opacity=None))
    out.append(f'<rect x="{hx0 - 6}" y="{BODY_TOP + 126}" width="{hx1 - hx0 + 12}" height="14" rx="2" fill="none" {LINE}/>')
    # What the truck makes, set out on its counter in the striped light.
    first = t["items"][0]
    out.append(f'<svg x="{(hx0 + hx1) / 2 - 36}" y="{BODY_TOP + 84}" width="72" height="54" viewBox="0 0 120 90">'
               f'{DRAW[t["key"]](first["look"])}</svg>')
    # The low counter at the side, no higher than 36 inches.
    lx = body_x1 - 34 if not cab_left else body_x0 + 4
    out.append(f'<rect x="{lx}" y="{BODY_TOP + 150}" width="30" height="10" rx="2" fill="var(--tks-steel)" {LINE}/>')
    # Wheels.
    for wx in (x + 40, x + TRUCK_W - 40):
        out.append(f'<circle cx="{wx}" cy="{BODY_BOTTOM + 6}" r="18" fill="var(--tks-ink)"/>'
                   f'<circle cx="{wx}" cy="{BODY_BOTTOM + 6}" r="7" fill="var(--tks-steel)"/>')
    # The awning, out over the hatch, in its two colours.
    ax0, ax1 = hx0 - 18, hx1 + 18
    top, lip = BODY_TOP + 40, BODY_TOP + 8
    out.append(f'<path d="M{hx0 - 6} {top} L{ax0} {lip} H{ax1} L{hx1 + 6} {top} Z" fill="var({aw[1]})" {LINE}/>')
    w = (ax1 - ax0) / 8
    for k in range(0, 8, 2):
        a, b = ax0 + k * w, ax0 + (k + 1) * w
        # Each stripe narrows towards the truck, because the awning slopes back.
        ta = (hx0 - 6) + (a - ax0) * ((hx1 - hx0 + 12) / (ax1 - ax0))
        tb = (hx0 - 6) + (b - ax0) * ((hx1 - hx0 + 12) / (ax1 - ax0))
        out.append(f'<path d="M{n(ta)} {top} L{n(a)} {lip} L{n(b)} {lip} L{n(tb)} {top} Z" fill="var({aw[0]})"/>')
    out.append(f'<path d="M{hx0 - 6} {top} L{ax0} {lip} H{ax1} L{hx1 + 6} {top} Z" fill="none" {LINE}/>')
    out.append("".join(f'<path d="M{n(ax0 + k * w)} {lip} q{n(w / 2)} 12 {n(w)} 0" fill="var({aw[k % 2]})" {LINE}/>'
                       for k in range(8)))
    return "".join(out)


def court_svg(d):
    trucks = d["trucks"]
    out = [f'<svg class="tks-court__draw" viewBox="0 0 {W} {H}" aria-hidden="true" focusable="false">',
           f'<rect width="{W}" height="{H}" fill="var(--tks-lot)"/>',
           f'<rect width="{W}" height="236" fill="var(--tks-day)"/>']
    # Over the fence at either end, the lots next door: the Run's row of trees
    # on the left and the Green's wood on the right, seen from here in our own
    # colours rather than a dog's, and with no weather of their own.
    for cx, cy, r in ((40, 170, 46), (110, 150, 52), (180, 176, 40), (1030, 172, 44), (1090, 146, 56), (1160, 166, 48)):
        out.append(f'<circle cx="{cx}" cy="{cy}" r="{r + 2.5}" fill="var(--tks-ink)"/>')
    for cx, cy, r in ((40, 170, 46), (110, 150, 52), (180, 176, 40), (1030, 172, 44), (1090, 146, 56), (1160, 166, 48)):
        out.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="var(--tks-trees)"/>')
    # The fence at the back, with a gate at each end: the Run on the left and
    # the Green on the right, the lots on either side.
    out.append(f'<path d="M0 236 H{W}" stroke="var(--tks-ink)" stroke-width="2.5"/>')
    for x in range(10, W, 36):
        out.append(f'<path d="M{x} 206 V236" stroke="var(--tks-fence)" stroke-width="5" stroke-linecap="round"/>')
    out.append(f'<path d="M0 214 H{W}" stroke="var(--tks-fence)" stroke-width="3"/>')
    for gx in (6, W - 48):
        out.append(f'<rect x="{gx}" y="196" width="42" height="40" rx="3" fill="var(--tks-lot)" {LINE}/>'
                   f'<path d="M{gx} 216 H{gx + 42} M{gx + 21} 196 V236" stroke="var(--tks-ink)" stroke-width="2"/>')
    # The light under each awning on the ground, before the trucks stand in it.
    for i, t in enumerate(trucks):
        x = TRUCK_X[i]
        out.append(light_on_ground(x + 30, x + TRUCK_W - 30, BODY_BOTTOM + 24, BODY_BOTTOM + 96, 22, t["awning"]))
    for i, t in enumerate(trucks):
        out.append(truck(i, t))
    # The porch: two picnic tables in front, and the roof's edge across the top,
    # where you are sitting out of the sun.
    for cx in (300, 900):
        out.append(f'<rect x="{cx - 170}" y="500" width="340" height="16" rx="3" fill="var(--tks-plank)" {LINE}/>'
                   f'<rect x="{cx - 200}" y="540" width="400" height="12" rx="3" fill="var(--tks-plank)" {LINE}/>'
                   f'<path d="M{cx - 150} 516 L{cx - 190} 600 M{cx + 150} 516 L{cx + 190} 600 M{cx - 120} 516 L{cx - 80} 600 '
                   f'M{cx + 120} 516 L{cx + 80} 600" stroke="var(--tks-ink)" stroke-width="5" stroke-linecap="round"/>')
    out.append(f'<rect x="-4" y="-4" width="{W + 8}" height="34" fill="var(--tks-roof)" {LINE}/>'
               f'<path d="M-4 30 H{W + 4}" stroke="var(--tks-plank)" stroke-width="4"/>')
    for px in (16, W - 16):
        out.append(f'<rect x="{px - 8}" y="28" width="16" height="{H - 28}" fill="var(--tks-plank)" {LINE}/>')
    out.append("</svg>")
    return "".join(out)


# ── Things on your table, each its own drawing ───────────────────────────────

def boat():
    return f'<path d="M14 60 L22 80 H98 L106 60 Z" fill="var(--tks-kraft)" {LINE}/>'


def draw_taco(look):
    out = [boat()]
    for cx in (42, 78):
        out.append(f'<path d="M{cx - 26} 64 A26 26 0 0 1 {cx + 26} 64 Z" fill="var({look["shell"]})" {LINE}/>')
        for k, c in enumerate(look["fill"]):
            out.append(f'<circle cx="{cx - 12 + k * 12}" cy="{56 - (k % 2) * 6}" r="5.5" fill="var({c})" '
                       f'stroke="var(--tks-ink)" stroke-width="1.2"/>')
    return "".join(out)


def draw_banh_mi(look):
    out = [f'<path d="M10 52 Q10 34 60 32 Q110 34 110 52 Q110 70 60 72 Q10 70 10 52 Z" fill="var({look["bread"]})" {LINE}/>']
    for k, c in enumerate(look["fill"]):
        out.append(f'<path d="M20 {50 + k * 4} Q60 {44 + k * 4} 100 {50 + k * 4}" fill="none" stroke="var({c})" '
                   'stroke-width="4" stroke-linecap="round"/>')
    out.append(f'<path d="M18 46 Q60 38 102 46" fill="none" {LINE}/>'
               f'<path d="M64 70 L78 78 H112 L104 58" fill="var(--tks-paper)" {LINE}/>')
    return "".join(out)


def draw_ramen(look):
    out = [f'<ellipse cx="60" cy="50" rx="50" ry="22" fill="var(--tks-bowl)" {LINE}/>',
           f'<path d="M10 50 Q14 84 60 84 Q106 84 110 50" fill="var(--tks-bowl)" {LINE}/>',
           f'<ellipse cx="60" cy="50" rx="42" ry="16" fill="var({look["broth"]})"/>',
           '<path d="M28 52 q6 -6 12 0 t12 0 t12 0 t12 0 t12 0" fill="none" stroke="var(--tks-noodle)" stroke-width="3"/>']
    for k, c in enumerate(look["top"]):
        out.append(f'<circle cx="{40 + k * 20}" cy="{46 - (k % 2) * 3}" r="7" fill="var({c})" stroke="var(--tks-ink)" stroke-width="1.2"/>')
    out.append(f'<path d="M84 26 L104 70 M92 24 L108 66" stroke="var(--tks-plank)" stroke-width="4" stroke-linecap="round"/>')
    return "".join(out)


def draw_treat(look):
    return (f'<path d="M36 30 H84 L88 82 H32 Z" fill="var(--tks-kraft)" {LINE}/>'
            f'<path d="M36 30 L42 22 H78 L84 30" fill="var(--tks-kraft)" {LINE}/>'
            f'<ellipse cx="60" cy="30" rx="18" ry="6" fill="var({look["treat"]})" {LINE}/>'
            # A paw print on the bag, because it is for dogs.
            f'<circle cx="60" cy="62" r="7" fill="var(--tks-ink)"/>'
            + "".join(f'<circle cx="{x}" cy="{y}" r="3" fill="var(--tks-ink)"/>' for x, y in ((50, 52), (56, 48), (64, 48), (70, 52))))


def draw_drink(look):
    if look.get("shaved"):
        return (f'<path d="M38 52 L44 84 H76 L82 52 Z" fill="var(--tks-paper)" {LINE}/>'
                f'<path d="M34 54 Q36 22 60 22 Q84 22 86 54 Z" fill="var({look["shaved"]})" {LINE}/>'
                '<path d="M46 40 l3 3 M60 30 l3 3 M70 42 l3 3 M54 48 l3 3" stroke="var(--tks-white)" stroke-width="2"/>')
    out = [f'<path d="M40 22 L46 86 H74 L80 22 Z" fill="var(--tks-cup)" {LINE}/>',
           f'<path d="M41.6 40 L46 84 H74 L78.4 40 Z" fill="var({look["drink"]})"/>']
    if look.get("ice"):
        out.append(f'<rect x="48" y="42" width="11" height="11" rx="2" fill="var(--tks-cup)" stroke="var(--tks-ink)" stroke-width="1.2"/>'
                   f'<rect x="61" y="48" width="10" height="10" rx="2" fill="var(--tks-cup)" stroke="var(--tks-ink)" stroke-width="1.2"/>')
    if look.get("pearls"):
        out.append("".join(f'<circle cx="{x}" cy="{y}" r="3.6" fill="var(--tks-pearl)"/>'
                           for x, y in ((52, 80), (60, 81), (68, 80), (56, 75), (64, 75))))
    out.append(f'<path d="M64 6 L58 40" stroke="var(--tks-straw)" stroke-width="5" stroke-linecap="round"/>'
               f'<ellipse cx="60" cy="22" rx="20" ry="4" fill="none" {LINE}/>')
    return "".join(out)


DRAW = {"tacos": draw_taco, "banh-mi": draw_banh_mi, "ramen": draw_ramen, "treats": draw_treat, "cooler": draw_drink}


def item_svg(t, x):
    return (f'<svg class="tks-item__draw" data-table-draw="{attr(x["key"])}" viewBox="0 0 120 90" aria-hidden="true" '
            f'focusable="false">{DRAW[t["key"]](x["look"])}</svg>')


# ── Your table, from your seat ───────────────────────────────────────────────

SLOTS = [(250, 210), (480, 170), (720, 170), (950, 210), (370, 330), (830, 330)]
ITEM_W, ITEM_H = 220, 165


def table_svg(holds):
    out = [f'<svg class="tks-table__draw" viewBox="0 0 1200 520" data-table data-table-holds="{holds}" aria-hidden="true" focusable="false">',
           '<rect width="1200" height="520" fill="var(--tks-lot)"/>']
    # The planks of a picnic table, running away from you, with the light that
    # gets under the porch roof lying across the far end in one stripe.
    for k, (y0, y1) in enumerate(((40, 130), (136, 236), (242, 352), (358, 478))):
        out.append(f'<path d="M{170 - k * 40} {y0} H{1030 + k * 40} L{1050 + k * 40} {y1} H{150 - k * 40} Z" '
                   f'fill="var(--tks-plank)" {LINE}/>')
    out.append('<path d="M150 40 H1050 L1060 70 H140 Z" fill="var(--tks-sun)" opacity=".55"/>')
    out.append('<g id="tks-table-items">')
    for i, (x, y) in enumerate(SLOTS[:holds]):
        out.append(f'<g data-slot="{i}" data-x="{x - ITEM_W // 2}" data-y="{y - ITEM_H // 2}" data-w="{ITEM_W}" data-h="{ITEM_H}"></g>')
    out.append('</g></svg>')
    return "".join(out)


# ── The boards ───────────────────────────────────────────────────────────────

def mark(x):
    if x["diet"] == "vegan":
        return '<span class="tks-mark tks-mark--vegan">Vegan</span>'
    if x["diet"] == "vegetarian":
        return '<span class="tks-mark tks-mark--veg">Vegetarian</span>'
    if x["diet"] == "fish":
        return '<span class="tks-mark">Fish</span>'
    return f'<span class="tks-mark">{esc(x["animal"][:1].upper() + x["animal"][1:])}</span>'


CAFFEINE_SAYS = dict(pekoe.CAFFEINE_SAYS)


def item_card(t, x):
    lines = [f'<p class="tks-item__diet">{mark(x)}{" <b>For dogs.</b>" if t.get("for") == "dogs" else ""}</p>',
             f'<p class="tks-item__what"><span class="sr">In it: </span>{esc(x["what"])}</p>',
             f'<p class="tks-item__has">{"For anybody handling it: " + hgc.contains(x)[0].lower() + hgc.contains(x)[1:] if t.get("for") == "dogs" else hgc.contains(x)}</p>']
    if t["key"] == "cooler":
        lines.append(f'<p class="tks-item__caf">{esc(CAFFEINE_SAYS[caffeine(x["what"])])}</p>')
    if x.get("ask"):
        lines.append(f'<p class="tks-item__ask">{esc(x["ask"])}</p>')
    if x.get("note"):
        lines.append(f'<p class="tks-item__note">{esc(x["note"])}</p>')
    body = "\n          ".join(lines)
    return (f'        <li class="tks-item" id="tks-item-{x["key"]}">\n'
            f'          {item_svg(t, x)}\n'
            f'          <h4 class="tks-item__name">{esc(x["name"])}</h4>\n'
            f'          {body}\n'
            f'          <p class="tks-item__go"><button type="button" class="tks-btn" data-table-order="{attr(x["key"])}" '
            f'data-table-name="{attr(x["name"])}" hidden>Bring it to my table</button> '
            f'<span class="tks-said" data-table-said aria-hidden="true" hidden></span></p>\n'
            '        </li>')


def boards_block(d):
    out = []
    for t in d["trucks"]:
        aw = t["awning"]
        out.append(f'    <section class="tks-truck" id="tks-{t["key"]}" aria-labelledby="tks-{t["key"]}-h">')
        out.append(f'      <div class="tks-awning" style="--tks-a: var({aw[0]}); --tks-b: var({aw[1]});" aria-hidden="true"></div>')
        out.append(f'      <h3 class="tks-truck__name" id="tks-{t["key"]}-h">{esc(t["name"])}</h3>')
        out.append(f'      <p class="tks-truck__lede">{esc(t["lede"])}</p>')
        out.append(f'      <p class="tks-truck__about">{esc(t["about"])}</p>')
        out.append('      <ul class="tks-items">')
        out += [item_card(t, x) for x in t["items"]]
        out.append('      </ul>')
        out.append('    </section>')
    return "\n".join(out)


def day(iso):
    y, m, dd = (int(x) for x in iso.split("-"))
    return f"{dd} {MONTHS[m - 1]} {y}"


def start_words(s):
    return f"{s // 60}:{s % 60:02d}"


def rack_block(d):
    sid, sname = SCREEN
    out = [f'    <div class="tks-screen" data-rack-screen="{sid}" tabindex="-1" hidden>',
           '      <p class="tks-screen__idle"><span><b>The screen on the side of the Cooler.</b> Nothing is on it. Any '
           'film on the rack can go up here with the button under it, and nothing loads until you press one.</span></p>',
           '    </div>',
           f'    <p class="tks-screen__now" data-rack-now="{sid}" tabindex="-1" hidden></p>',
           f'    <p class="tks-screen__back" hidden><button type="button" class="tks-btn tks-btn--quiet" '
           f'data-rack-back="{sid}">Take it off the screen</button></p>',
           '    <details class="tks-rack" open>',
           '      <summary class="tks-rack__sum">The rack: tacos, bánh mì and ramen, made and eaten</summary>']
    for g in d["rack"]:
        out.append(f'      <h3 class="tks-rack__shelf">{esc(g["title"])}</h3>')
        out.append('      <ul class="tks-vids">')
        for v in g["videos"]:
            t, c, r = esc(v["title"]), esc(v["channel"]), v["runtime"]
            st = v.get("start")
            from_ = f", from {start_words(st)} in, where Ryan&rsquo;s link starts" if st else ""
            from_attr = f' data-embed-start="{st}"' if st else ""
            out += ['        <li class="tks-vid" data-rack-card>',
                    f'          <h4 class="tks-vid__title">{t}</h4>',
                    f'          <p class="tks-vid__by">{c} &middot; {day(v["published"])} &middot; {r}</p>']
            if v.get("state") == "door":
                out += [f'          <a class="tks-door" href="https://www.youtube.com/watch?v={v["id"]}">Watch it on YouTube &mdash; {r} '
                        '<span class="tks-door__why">its channel has switched off showing it on other sites, so it plays there and not here</span></a>']
            else:
                out += [f'          <button type="button" class="facade" data-embed-id="{v["id"]}"{from_attr} data-embed-title="{attr(v["channel"])} &mdash; {attr(v["title"])}">',
                        f'            Watch it here &mdash; {r}{from_}',
                        '            <span class="facade__play">&#9654; PRESS PLAY</span>',
                        '          </button>',
                        f'          <button type="button" class="tks-btn tks-btn--quiet tks-vid__big" hidden data-rack-to="{sid}" '
                        f'data-rack-name="{sname}" data-rack-src="https://www.youtube-nocookie.com/embed/{v["id"]}?autoplay=1&amp;rel=0" '
                        f'data-rack-title="{attr(v["channel"])} &mdash; {attr(v["title"])}, on {sname}" data-rack-film="{attr(v["title"])}" '
                        f'data-rack-runtime="{r}">Put it on {sname} &mdash; {r}</button>']
            out.append('        </li>')
        out.append('      </ul>')
    out += ['    </details>']
    return "\n".join(out)


def liner_sources(d):
    s = d["sources"]
    rows = [(v["for"], f'<a href="{attr(v["url"])}">{esc(v["title"])}</a>, {esc(v["by"])}, read {esc(v["read"])}')
            for k, v in s.items()]
    rows.append(("The nine major food allergens and gluten on every card",
                 'Worked out by the same engine as <a href="hey-good-cookin.html">Hey, Good Cookin&rsquo;</a>, '
                 'which read the nine on the U.S. Food and Drug Administration&rsquo;s page on 2026-10-04'))
    rows.append(("The caffeine on every cup",
                 'Worked out with <a href="pekoe-and-purrs.html">Pekoe and Purrs</a>&rsquo; own words for a bean, a leaf, '
                 'a flower and chocolate'))
    rows.append(("What is never in a dog's treat",
                 'The ASPCA&rsquo;s list, read for <a href="the-run.html">the Run</a> on 2026-10-05, and checked against '
                 'every bag by the same function that fills the Run&rsquo;s treat tin'))
    chans = []
    for g in d["rack"]:
        for v in g["videos"]:
            link = f'<a href="https://www.youtube.com/channel/{v["channel_id"]}">{esc(v["channel"])}</a>'
            if link not in chans:
                chans.append(link)
    rows.append(("The films on the rack",
                 "Ryan Boren’s pick, of 2026-10-05, in his order, each on its own channel on YouTube: "
                 + ", ".join(chans[:-1]) + " and " + chans[-1]
                 + ". None of them is affiliated with Stimpunks, and nothing of theirs is hosted here"))
    return "\n".join(f'      <tr><td>{esc(w)}</td><td>{src}</td></tr>' for w, src in rows)


# ── The page as written ──────────────────────────────────────────────────────

def check_page():
    src = PAGE.read_text()
    for want, why in (('src="table.js"', "it does not load table.js, which puts things on your table"),
                      ('src="love-embed.js"', "it does not load love-embed.js, so every film would press and do nothing"),
                      ('src="rack.js"', "it does not load rack.js, so no film could go up on the screen"),
                      ('href="the-run.html"', "it has no gate through to the Run next door"),
                      ('href="the-green.html"', "it has no gate through to the Green next door"),
                      ('data-table-says', "it has no live region for what the court says")):
        if want not in src:
            refuse(f"{PAGE.name}: {why}.")
    if re.search(r'<script src="(?!love\.js|love-embed\.js|rack\.js|table\.js|quest\.js)[^"]+"', src):
        refuse(f"{PAGE.name} loads a script the Truck Stop has no use for. It sends nothing and keeps nothing.")
    plain = re.sub(r"<script\b.*?</script>", " ", src, flags=re.S)
    plain = re.sub(r'<(h4|p) class="tks-vid__(?:title|by)">.*?</\1>', " ", plain, flags=re.S)
    plain = re.sub(r'data-(?:embed|rack)-(?:title|film)="[^"]*"', " ", plain)
    # The guild's job marker asks what anything at the Truck Stop costs, and its
    # answer is nothing; the question is the guild's, written by make-guild.py,
    # and is not the court saying anything has a price.
    plain = re.sub(r"<!-- quest:[a-z-]+:begin -->.*?<!-- quest:[a-z-]+:end -->", " ", plain, flags=re.S)
    plain = re.sub(r"<!--.*?-->", " ", plain, flags=re.S)
    sweep(plain, PAGE.name)


def section_css():
    css = CSS.read_text()
    m = re.search(rf"/\* §{SECTION} ── ROOM: Truckin' Food Court.*?(?=/\* §\d+ ── )", css, re.S)
    if not m:
        refuse(f"love.css has no §{SECTION} for Truckin' Food Court, followed by another section.")
        return
    body = re.sub(r"/\*.*?\*/", " ", m.group(0), flags=re.S)
    if re.search(r"#[0-9a-fA-F]{3,6}\b|rgba?\(|hsla?\(", body):
        refuse(f"love.css §{SECTION} has a literal colour in it. The court's colours are --tks- custom properties "
               "in :root, where check-contrast.py can find them.")
    if re.search(r"transform\s*:\s*(?:rotate|skew)", body):
        refuse(f"love.css §{SECTION} rotates or skews something. Nothing at the Truck Stop tilts.")


def main():
    d = json.loads(DATA.read_text())
    check_data(d)
    for k in ("_what", "_free", "_trucks"):
        sweep(d.get(k, ""), f"{DATA.name} {k}")
    for t in d.get("trucks") or []:
        sweep(t.get("lede", "") + " " + t.get("about", ""), f"{DATA.name}, {t.get('name')}")
        for x in t.get("items") or []:
            sweep(" ".join(str(x.get(f, "")) for f in ("name", "what", "ask", "note")), f"{DATA.name}, {x.get('name')}")
    if problems:
        print("REFUSING:\n  " + "\n  ".join(dict.fromkeys(problems)))
        sys.exit(1)
    swap(PAGE, "tks:court", "      " + court_svg(d), "      ")
    swap(PAGE, "tks:table", "      " + table_svg(d.get("table_holds", 4)), "      ")
    swap(PAGE, "tks:boards", boards_block(d), "    ")
    swap(PAGE, "tks:rack", rack_block(d), "    ")
    swap(NOTES, "truckin-sources", liner_sources(d), "      ")
    check_page()
    section_css()
    if problems:
        print("REFUSING (the page as written):\n  " + "\n  ".join(dict.fromkeys(problems)))
        sys.exit(1)
    print("truckin' food court: the court, every truck's board, your table, the screen's rack and the credits "
          "written; nothing has a price, and every dog treat is clear of the ASPCA's list")


if __name__ == "__main__":
    main()
