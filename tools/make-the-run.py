#!/usr/bin/env python3
"""Build The Run, the dog park on the street, out of data/the-run.json: the field
and every place a dog can be in it, the porch, the toys, the treat tin, the dog
telly's rack, and the room's credits in the liner notes.

WHAT THE ROOM IS. Ryan Boren's brief, 2026-10-05, the first of the outdoor lots
side by side where the buildings stop: an outdoor dog park with a covered porch,
swings, rocking chairs and plush dog beds; a row of trees for shade and peeing
on; an open grassy area for fetch; and the dogs from the rescue shelter out for
exercise, met the way the cats are met at Pekoe and Purrs.

THE DOGS ARE THE SHELTER'S AND THIS TOOL NEVER WRITES ONE. roam.js reads them off
Rescue A Dog's own public list every time the room opens, the one GET the
shelter pages make, and animals.js draws each of them, so a dog on the Run is
the same dog, drawn the same way, as at the shelter and in its adopter's
Profile. roam.js is shared with the café since this room asked for the same
thing, and make-pekoe.py's check_roam() holds it to its promises from here too.
This tool holds what the Run promises about its dogs:

  · THERE IS ALWAYS SOMEWHERE TO BE. More places than the shelter can ever hold,
    read off SHELTER_KEEP in netlify/cb/lib.mjs, with the bed beside your chair
    kept out of the count because nobody is put there but the dog you asked;
    and no two places overlap, so no dog is drawn on top of another.
  · A DOG GOES WHERE ITS MOOD TAKES IT, AND NOTHING ELSE DECIDES. Every mood the
    shelter can write down (DOG_MOODS) has a rule, and a rule names kinds of
    place and parts of the Run and never a marking. A dog with three legs gets
    to the far end of the field like anybody else.
  · A DOG WHO WANTS TO BE LEFT ALONE IS LEFT ALONE. Nobody calls that dog over.
  · ADOPTING IS THE SHELTER'S, AND A DOG IS ADOPTED, NEVER BOUGHT. Every card
    links to the dog's own card at Rescue A Dog, and run.js sends nothing.

IT IS PAINTED IN A DOG'S COLOURS, AND THAT IS ENFORCED BY READING THE PALETTE.
Dogs have two kinds of cone where most people have three, so they see in blues
and yellows and cannot tell red from green (Neitz, Geist and Jacobs, 1989;
Siniscalchi and others, 2017). Every --run- colour in :root has to lie on that
one line, a blue or a yellow or a grey, and §96 may hold no literal colour at
all: if a red or a green ever appears on the Run, it is being seen through our
eyes instead of a dog's. THE DOGS ARE THE ONE THING NOT DRAWN THAT WAY, on
purpose, because a dog here is the same dog it is at the shelter and in the
Profile of whoever adopts them, and animals.js draws every one of them in its
own coat. And THE BALL IS BLUE: that is the researcher's own advice to the
press for a ball on green grass, not a finding of the paper, and the page says
which it is.

THE SHADOWS ARE NOT BLUE, which is the one place the dog's palette and the
street pull against each other. A shadow on snow is blue because only the sky
lights it, and Rescue A Dog, where these dogs were found, owns that: its
section says no other room has shadows that are a colour. The Run is summer
grass under clouds going over, and every shadow on it is the grass's own
yellow, darker. The tool refuses a --run- colour named for shade that is blue.

NOBODY GIVES A COMMAND ON THE RUN. A dog park is the place a page reaches for
obedience -- sit, stay, heel, the pack leader -- and a room on a Disabled
people's site that was about compliance would be the one thing this
organisation exists to refuse, arriving with a lead on. A dog that brings the
ball back is playing. The vocabulary is refused in the room's voice with the
negation window, so the room can still say that nobody trains anybody here.

THE DOG TELLY'S TITLES ARE THE CHANNELS' AND SAY WHAT A FILM DOES FOR A DOG; THE
ROOM NEVER DOES. Dog television is sold as calming, anti-anxiety and a cure for
boredom, in the titles Ryan picked. Those are quoted as written and not swept,
the Doom Scoop's rule; the room's own sentences are swept for the claim. Every
film says how long it runs before the press, and the one live stream says it
runs until you close it and is refused a runtime, the Jungle Room's rule for a
live camera arriving on a porch.

THE TREAT TIN IS FILLED FROM THE TREAT TRUCK NEXT DOOR, read out of
data/truckin-food-court.json, so the two lots cannot disagree about what a dog
is given. And THE ASPCA'S LIST LIVES HERE, in the dogs' room: poisoned() reads a
treat's ingredients for every food on the ASPCA's page of people foods to keep
from pets, and make-truckin-food-court.py imports it rather than keeping a
second list.

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
DATA = ROOT / "data/the-run.json"
TRUCKS = ROOT / "data/truckin-food-court.json"
PAGE = ROOT / "the-run.html"
NOTES = ROOT / "liner-notes.html"
CSS = ROOT / "love.css"
LIB = ROOT / "netlify/cb/lib.mjs"
SCRIPT = ROOT / "run.js"
SECTION = 96          # love.css's section for this room

W, H = 1200, 660      # the field's drawing
DECK = 592            # the porch boards
GRASS = 250           # where the field meets the sky
DOG_W, DOG_H = 84, 71  # a dog, 200 by 170 in animals.js, at 0.42
KINDS = {"swing", "bed", "deck", "step", "shade", "gate", "trough", "grass", "sun", "cool"}
LEVELS = {"porch", "field", "trees"}
SPARE = 3
YT = re.compile(r"^[A-Za-z0-9_-]{11}$")
CHANNEL = re.compile(r"^UC[A-Za-z0-9_-]{22}$")
RUNTIME = re.compile(r"^(?:\d+:[0-5]\d|\d+:[0-5]\d:[0-5]\d)$")
VIDEO_KEYS = {"id", "title", "channel", "channel_id", "runtime", "published", "live"}
SCREEN = ("run", "the dog telly")
MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August",
          "September", "October", "November", "December"]

problems = []


def refuse(msg):
    problems.append(msg)


def tool(name):
    spec = importlib.util.spec_from_file_location(name.replace("-", "_"), TOOLS / f"{name}.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


hgc = tool("make-hey-good-cookin")
rescue = tool("make-rescue")
pekoe = tool("make-pekoe")


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


# ── The ASPCA's list, which the Truck Stop's treat truck reads as well ───────
# Every heading on the ASPCA's page "People Foods to Avoid Feeding Your Pets",
# read 2026-10-05, as the words that would put one of those foods in a treat.
# Milk is read through Hey, Good Cookin's allergen engine, so that peanut
# butter is peanuts and not butter, and oat milk is oats.
POISONS = [
    (r"alcohol|beer|wine|spirits|yeast dough|raw dough|bread dough|yeast", "Alcohol and Yeast Dough"),
    (r"chocolate|cocoa|cacao|coffee|espresso|caffeine|tea|cola|guarana", "Chocolate, Coffee and Caffeine"),
    (r"avocados?|guacamole", "Avocado"),
    (r"lemons?|limes?|oranges?|grapefruits?|citrus|clementines?|tangerines?|mandarins?", "Citrus"),
    (r"grapes?|raisins?|sultanas?|currants?", "Grapes and Raisins"),
    (r"onions?|garlic|chives?|leeks?|shallots?|scallions?|spring onions?", "Onion, Garlic, Chives"),
    (r"macadamias?", "Macadamia Nuts"),
    (r"almonds?|pecans?|walnuts?|cashews?|pistachios?|hazelnuts?|brazil nuts|pine nuts|nuts", "Nuts"),
    (r"raw|undercooked|rare|bones?", "Raw/Undercooked Meat, Eggs, and Bones"),
    (r"xylitol|birch sugar|sweeteners?|sugar[- ]free|gum|candy", "Xylitol"),
    (r"salt|salted|salty|crisps|chips|pretzels?|soy sauce|stock cubes?", "Salt/Excessively Salty Foods"),
]


def poisoned(what):
    """What on the ASPCA's list is in a treat, by the page's own headings."""
    t = hgc.norm(what)
    found = [head for pat, head in POISONS if re.search(rf"\b(?:{pat})\b", t)]
    has, _ = hgc.allergens(what)
    if "milk" in has:
        found.append("Milk/Dairy")
    return found


# ── The voice ────────────────────────────────────────────────────────────────

NEGATION = hgc.NEGATION
SOLD = r"buy|buys|buying|bought|purchas\w*|sell|sells|selling|sold|for sale|prices?|priced|fees?|breeders?"
TRAIN = (r"obey|obeys|obeying|obedien\w*|commands?|commanded|heel|alpha|dominan\w*|pack leaders?|"
         r"corrections?|trained|training|trainers?|disciplin\w*|good boys?|good girls?|bad dogs?")
CLAIM = (r"calm(?:s|ing|ed)?|soothes?|soothing|anti[- ]anxiety|anxiety|stress\w*|cures?|cured|"
         r"therap\w*|treats? boredom|prevents? boredom|boredom[- ]bust\w*|relax(?:es|ing)? (?:your|a|the) dogs?")
VOCAB = [
    (SOLD, "a dog bought or sold, or a price. A dog here is adopted at the shelter, never bought."),
    (TRAIN, "a command, or training. Nobody gives a command on the Run, and a dog who brings the ball back "
            "is playing, not obeying."),
    (CLAIM, "a claim about what something does for a dog. The dog telly's titles say that, in the channels' "
            "words; the room never does."),
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


# ── What the shelter can hand the Run ────────────────────────────────────────

def shelter_facts():
    lib = LIB.read_text()
    m = re.search(r"export const SHELTER_KEEP = (\d+);", lib)
    if not m:
        raise SystemExit(f"REFUSING: {LIB.name} has no SHELTER_KEEP, so there is no telling how many "
                         "dogs the Run must have room for.")
    moods = rescue.keys(lib, "DOG_MOODS")
    if len(moods) < 2:
        raise SystemExit(f"REFUSING: read {len(moods)} moods out of {LIB.name}'s DOG_MOODS, which is this "
                         "tool misreading the list rather than a shelter with no moods.")
    return int(m.group(1)), moods


# ── The palette, read off :root ──────────────────────────────────────────────

def hsv(hexstr):
    h = hexstr.lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    r, g, b = (int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
    mx, mn = max(r, g, b), min(r, g, b)
    d = mx - mn
    s = 0 if mx == 0 else d / mx
    if d == 0:
        return 0.0, s, mx
    if mx == r:
        hue = 60 * (((g - b) / d) % 6)
    elif mx == g:
        hue = 60 * ((b - r) / d + 2)
    else:
        hue = 60 * ((r - g) / d + 4)
    return hue, s, mx


YELLOW, BLUE, GREY = (34, 66), (198, 252), 0.14


def dogs_line(hexstr):
    """On the one line a dog sees along: a yellow, a blue, or near enough a grey."""
    hue, s, _ = hsv(hexstr)
    return s <= GREY or YELLOW[0] <= hue <= YELLOW[1] or BLUE[0] <= hue <= BLUE[1]


def palette():
    css = CSS.read_text()
    root = re.search(r":root\s*\{(.*?)\n\}", css, re.S)
    found = dict(re.findall(r"(--run-[a-z0-9-]+):\s*(#[0-9A-Fa-f]{3,6})\b", root.group(1) if root else ""))
    if len(found) < 8:
        refuse(f"love.css's :root declares {len(found)} --run- colours; the Run's palette has gone missing.")
    for name, value in found.items():
        if not dogs_line(value):
            hue, s, _ = hsv(value)
            refuse(f"{name} is {value}, hue {hue:.0f} at saturation {s:.2f}: not a blue, a yellow or a grey. "
                   "Everything the Run paints itself is on the one line a dog sees along; a red or a green "
                   "here is the room seen through our eyes instead of a dog's.")
        if re.search(r"shade|shadow", name):
            hue, s, _ = hsv(value)
            if s > GREY and BLUE[0] <= hue <= BLUE[1]:
                refuse(f"{name} is a blue shadow. Blue shadows are Rescue A Dog's, cast on snow and lit only "
                       "by the sky; on the Run's summer grass a shadow is the grass's own yellow, darker.")
    return found


# ── The checks on the room's own data ────────────────────────────────────────

def check_data(d, keep, moods):
    spots = d.get("spots") or []
    kept = d.get("kept")
    keys = [s.get("key") for s in spots]
    if kept not in keys:
        refuse(f"the kept place {kept!r} is not one of the spots. It is the bed beside your rocking chair, kept "
               "for the dog you ask to come and sit with you.")
    else:
        k = spots[keys.index(kept)]
        if k.get("kind") != "bed" or k.get("level") != "porch":
            refuse("the kept place must be a bed on the porch, beside your chair.")
    open_ = [s for s in spots if s.get("key") != kept]
    if len(open_) < keep + SPARE:
        refuse(f"there are {len(open_)} places a dog can be put and the shelter can hold {keep} dogs; the Run "
               f"needs at least {keep + SPARE}, so every dog has somewhere to be and somewhere to go.")
    seen = set()
    for s in spots:
        k = s.get("key")
        if k in seen:
            refuse(f"two places are keyed {k!r}.")
        seen.add(k)
        if s.get("kind") not in KINDS:
            refuse(f"place {k!r} is a {s.get('kind')!r}, which the tool cannot draw.")
        if s.get("level") not in LEVELS:
            refuse(f"place {k!r} is on {s.get('level')!r}, not the porch, the field or under the trees.")
        if not (s.get("where") or "").strip():
            refuse(f"place {k!r} has no words for where a dog in it is.")
        x, y = s.get("x", -1), s.get("y", -1)
        if not (DOG_W / 2 <= x <= W - DOG_W / 2 and GRASS + DOG_H / 2 <= y <= H):
            refuse(f"place {k!r} puts a dog outside the Run, or up in the sky.")
        if s.get("level") == "porch" and x > 640:
            refuse(f"place {k!r} is on the porch and out in the field.")
    for i, a in enumerate(spots):
        for b in spots[i + 1:]:
            if abs(a["x"] - b["x"]) < DOG_W and abs(a["y"] - b["y"]) < DOG_H:
                refuse(f"places {a['key']!r} and {b['key']!r} overlap: two dogs there would be drawn on top of "
                       "each other.")

    rules = d.get("moods") or {}
    if set(rules) != set(moods):
        refuse(f"the moods here are {sorted(rules)} and the shelter's are {sorted(moods)}. Every mood the shelter "
               "can write down needs a rule, and no rule may be for a mood it never writes.")
    for mood, r in rules.items():
        if set(r) - {"kinds", "levels", "toys"}:
            refuse(f"the rule for {mood!r} reads {sorted(set(r) - {'kinds', 'levels', 'toys'})}. Where a dog goes "
                   "is its mood's kinds of place and parts of the Run and nothing else: never its markings.")
        if not set(r.get("kinds", [])) <= KINDS or not set(r.get("levels", [])) <= LEVELS:
            refuse(f"the rule for {mood!r} names a place or a part of the Run that is not here.")
        if not isinstance(r.get("toys"), bool):
            refuse(f"the rule for {mood!r} does not say whether a toy moves that dog.")
        liked = [s for s in open_ if (not r.get("kinds") or s["kind"] in r["kinds"])
                 and (not r.get("levels") or s["level"] in r["levels"])]
        if not liked:
            refuse(f"no place on the Run suits a dog who is {mood!r}.")
    if "alone" not in (d.get("left_alone") or []):
        refuse("left_alone has lost 'alone'. The shelter wrote down that some dogs want to be left alone, which "
               "is allowed, and nobody on the Run calls one over.")
    if not set(d.get("left_alone") or []) <= set(moods):
        refuse("left_alone names a mood the shelter never writes down.")

    for t in d.get("toys") or []:
        if not (t.get("label") and t.get("went") and isinstance(t.get("most"), int) and t["most"] >= 1):
            refuse(f"toy {t.get('key')!r} needs a label, what the dogs did, and how many it can move.")
        if not set(t.get("kinds", [])) <= KINDS or not set(t.get("levels", [])) <= LEVELS:
            refuse(f"toy {t.get('key')!r} sends dogs to a place the Run does not have.")
    ball = next((t for t in d.get("toys") or [] if t.get("key") == "ball"), None)
    if not ball or "blue" not in ball.get("label", "").lower():
        refuse("the ball has stopped being blue. On green grass a dog can find a blue ball and loses a red one, "
               "and the ball is the one thing the Run shows off about a dog's eyes.")

    vids = d.get("videos") or []
    if not vids:
        refuse("the dog telly's rack has no films on it.")
    ids = set()
    for v in vids:
        where = f"{DATA.name}, video {v.get('id')!r}"
        if set(v) - VIDEO_KEYS:
            refuse(f"{where} carries {sorted(set(v) - VIDEO_KEYS)}. A film here is an id, a title, a channel, a "
                   "runtime and the day it went up: no description, no count of views or likes.")
        if not YT.match(v.get("id") or ""):
            refuse(f"{where} is not a YouTube id, so the button would never become a film.")
        if v.get("id") in ids:
            refuse(f"{where} is on the rack twice.")
        ids.add(v.get("id"))
        if v.get("live"):
            if v.get("runtime"):
                refuse(f"{where} is a live stream and has a runtime. A live stream has no length to give, and a "
                       "number here would be wrong tomorrow and authoritative meanwhile: the Jungle Room's rule.")
        elif not RUNTIME.match(v.get("runtime") or ""):
            refuse(f"{where} has no runtime. Every button here says how long before the press.")
        if not (v.get("title") or "").strip() or not (v.get("channel") or "").strip():
            refuse(f"{where} has no title or no channel.")
        if not CHANNEL.match(v.get("channel_id") or ""):
            refuse(f"{where} has no channel id, so the liner notes cannot link the channel it is on.")
        if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", v.get("published") or ""):
            refuse(f"{where} has no day it went up.")

    src = d.get("sources") or {}
    for k in ("dichromat", "redgreen", "seeing", "ball", "poisons"):
        s = src.get(k) or {}
        if not all(s.get(f) for f in ("title", "by", "url", "read", "for")):
            refuse(f"the source for {k!r} is missing a title, a by, an address, a date read or what it is for.")


def treats():
    """The treat truck's bags, out of the Truck Stop's own file."""
    d = json.loads(TRUCKS.read_text())
    truck = next((t for t in d.get("trucks") or [] if t.get("key") == "treats"), None)
    if not truck or truck.get("for") != "dogs" or not truck.get("items"):
        refuse(f"{TRUCKS.name} has no treat truck for dogs, and the Run's tin is filled from it.")
        return []
    for x in truck["items"]:
        bad = poisoned(x.get("what") or "")
        if bad:
            refuse(f"{TRUCKS.name}: the treat {x.get('name')!r} has in it what the ASPCA lists under "
                   f"{', '.join(bad)}. Nothing on that list goes in a dog's treat.")
    return truck["items"]


# ── The field ────────────────────────────────────────────────────────────────
# Everything is outlined in --run-ink, the one hand the porch, the trees and the
# trough are drawn in. The light is a bright day with clouds going over: each
# cloud's shadow lies on the grass under it, soft at the edge, and the trees
# throw a darker pool each. The shadows are the grass's own colour, darker.

LINE = 'stroke="var(--run-ink)" stroke-width="2.5" stroke-linejoin="round"'
CLOUDS = [  # the cloud in the sky, and where its shadow lies on the field
    {"sky": (700, 70), "shadow": (720, 402, 152, 34)},
    {"sky": (980, 120), "shadow": (962, 570, 128, 30)},
    {"sky": (330, 54), "shadow": (330, 652, 160, 22)},
]
TREES = [560, 690, 820, 950, 1080]


def cloud(x, y, s=1.0):
    parts = [(-46, 6, 34), (-12, -8, 40), (28, -2, 34), (58, 10, 24), (-70, 14, 22)]
    return "".join(f'<ellipse cx="{n(x + dx * s)}" cy="{n(y + dy * s)}" rx="{n(r * s * 1.2)}" ry="{n(r * s * .8)}" '
                   f'fill="var(--run-cloud)"/>' for dx, dy, r in parts)


def tree(x):
    """A tree in the row: a trunk, and a canopy of overlapping rounds drawn as
    one shape, outlined once round the outside rather than round every round."""
    rounds = ((-38, 150, 44), (34, 146, 46), (0, 112, 52), (-8, 176, 40), (22, 178, 36))
    return (f'<rect x="{x - 9}" y="196" width="18" height="128" rx="4" fill="var(--run-bark)" {LINE}/>'
            f'<path d="M{x - 2} 250 l-26 -30 M{x + 3} 232 l24 -26" stroke="var(--run-bark)" stroke-width="7" '
            f'stroke-linecap="round"/>'
            + "".join(f'<circle cx="{x + dx}" cy="{cy}" r="{r + 2.5}" fill="var(--run-ink)"/>' for dx, cy, r in rounds)
            + "".join(f'<circle cx="{x + dx}" cy="{cy}" r="{r}" fill="var(--run-leaf)"/>' for dx, cy, r in rounds)
            + "".join(f'<path d="M{x + dx} {cy} q9 -9 18 0" fill="none" stroke="var(--run-leaf-2)" stroke-width="3" '
                      f'stroke-linecap="round"/>' for dx, cy in ((-46, 146), (16, 116), (34, 152), (-16, 178), (6, 92))))


def porch():
    out = []
    # The clubhouse wall the porch leans on, in the porch roof's shade.
    out.append(f'<rect x="-4" y="168" width="456" height="{DECK - 168}" fill="var(--run-wall)" {LINE}/>')
    for y in range(196, DECK, 28):
        out.append(f'<path d="M0 {y} H450" stroke="var(--run-ink)" stroke-width="1.2" opacity=".28"/>')
    # A door in the wall, and a window into the clubhouse.
    out.append(f'<rect x="352" y="250" width="78" height="{DECK - 250}" rx="3" fill="var(--run-roof)" {LINE}/>')
    out.append(f'<circle cx="420" cy="430" r="4" fill="var(--run-board)"/>')
    out.append(f'<rect x="248" y="222" width="80" height="62" rx="3" fill="var(--run-sky)" {LINE}/>'
               '<path d="M288 222 V284 M248 253 H328" stroke="var(--run-board)" stroke-width="5"/>')
    # The dog telly, hung low on the wall between the chairs and the door.
    out.append(f'<rect x="256" y="330" width="64" height="46" rx="5" fill="var(--run-roof)" {LINE}/>'
               '<rect x="263" y="336" width="50" height="34" rx="2" fill="var(--run-screen)"/>'
               '<path d="M282 376 V392 M268 392 H298" stroke="var(--run-ink)" stroke-width="3" stroke-linecap="round"/>')
    # The deck, its edge, the steps on the right and the ramp on the left,
    # the ramp as wide as the steps.
    out.append(f'<rect x="-4" y="{DECK}" width="478" height="20" fill="var(--run-board)" {LINE}/>')
    for x in range(30, 470, 44):
        out.append(f'<path d="M{x} {DECK} V{DECK + 20}" stroke="var(--run-ink)" stroke-width="1.2" opacity=".4"/>')
    for i, (x, y) in enumerate(((474, DECK + 20), (508, DECK + 36), (542, DECK + 52))):
        out.append(f'<rect x="{x - 10}" y="{y - 16}" width="{78 - i * 4}" height="16" fill="var(--run-board)" {LINE}/>')
    out.append(f'<path d="M-4 {DECK + 20} H118 L200 {H + 6} H-4 Z" fill="var(--run-board)" {LINE}/>'
               f'<path d="M20 {DECK + 20} L46 {H + 6} M62 {DECK + 20} L100 {H + 6} M100 {DECK + 20} L150 {H + 6}" '
               'stroke="var(--run-ink)" stroke-width="1.2" opacity=".4"/>')
    # Posts and the roof over everything, the roof's own shade along the wall.
    for x in (12, 232, 446):
        out.append(f'<rect x="{x - 7}" y="168" width="14" height="{DECK - 168}" fill="var(--run-board)" {LINE}/>')
    out.append(f'<rect x="-4" y="168" width="456" height="34" fill="var(--run-shade)" opacity=".55"/>')
    out.append(f'<path d="M-10 168 H476 L460 140 H-10 Z" fill="var(--run-roof)" {LINE}/>')
    out.append(f'<path d="M-10 168 H476" stroke="var(--run-board)" stroke-width="3"/>')
    # The swing, on two chains from the roof.
    out.append('<path d="M92 170 V430 M208 170 V430" stroke="var(--run-ink)" stroke-width="2.5" stroke-dasharray="6 4"/>'
               f'<rect x="80" y="430" width="140" height="40" rx="4" fill="var(--run-board)" {LINE}/>'
               '<path d="M100 436 V466 M124 436 V466 M150 436 V466 M176 436 V466 M200 436 V466" '
               'stroke="var(--run-ink)" stroke-width="1.2" opacity=".45"/>')
    # Two rocking chairs, yours on the left, with the bed between them.
    for x, mine in ((236, True), (356, False)):
        out.append(f'<path d="M{x - 30} 590 Q{x} 604 {x + 30} 590" fill="none" stroke="var(--run-ink)" stroke-width="5" '
                   'stroke-linecap="round"/>'
                   f'<path d="M{x - 22} 548 L{x - 24} 592 M{x + 22} 548 L{x + 24} 592" stroke="var(--run-ink)" stroke-width="4"/>'
                   f'<rect x="{x - 30}" y="540" width="60" height="10" rx="3" fill="var(--run-chair)" {LINE}/>'
                   f'<path d="M{x - 26} 540 L{x - 30} 478 H{x + 30} L{x + 26} 540" fill="none" stroke="var(--run-chair)" '
                   'stroke-width="7" stroke-linejoin="round"/>'
                   + (f'<rect x="{x - 26}" y="484" width="52" height="50" rx="6" fill="var(--run-cushion)" {LINE}/>' if mine else ""))
    # The plush beds, the back of each; the front rim is in front of the dog.
    for x, col in ((76, "--run-cushion"), (300, "--run-cushion-2"), (392, "--run-cushion")):
        out.append(f'<ellipse cx="{x}" cy="{DECK - 12}" rx="50" ry="14" fill="var({col})" {LINE}/>')
    # The water bowl.
    out.append(f'<ellipse cx="132" cy="{DECK - 4}" rx="13" ry="5" fill="var(--run-water)" {LINE}/>')
    return "".join(out)


def field_svg(d):
    out = [f'<svg class="run-field__draw" viewBox="0 0 {W} {H}" aria-hidden="true" focusable="false">',
           f'<rect width="{W}" height="{GRASS + 12}" fill="var(--run-sky)"/>']
    out += [cloud(*c["sky"]) for c in CLOUDS]
    out.append(f'<rect y="{GRASS}" width="{W}" height="{H - GRASS}" fill="var(--run-grass)"/>')
    # The back fence, behind the trees, and the gates through to the Truck Stop
    # on the right, two of them, with a pen between so nobody gets out.
    out.append(f'<path d="M452 268 H1200" stroke="var(--run-fence)" stroke-width="3"/>'
               + "".join(f'<path d="M{x} 244 V272" stroke="var(--run-fence)" stroke-width="5" stroke-linecap="round"/>'
                         for x in range(470, 1200, 46)))
    for cx, cy, rx, ry in (c["shadow"] for c in CLOUDS):
        out.append(f'<ellipse cx="{cx}" cy="{cy}" rx="{rx + 18}" ry="{ry + 8}" fill="var(--run-shadow)" opacity=".5"/>'
                   f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="var(--run-shadow)"/>')
    for x in TREES:
        out.append(f'<ellipse cx="{x + 6}" cy="326" rx="72" ry="17" fill="var(--run-shade)"/>')
    out += [tree(x) for x in TREES]
    # The right-hand fence, and the double gate in it.
    out.append('<path d="M1190 268 V660" stroke="var(--run-fence)" stroke-width="3"/>'
               + "".join(f'<path d="M1190 {y} h-8" stroke="var(--run-fence)" stroke-width="5" stroke-linecap="round"/>'
                         for y in range(290, 660, 44)))
    for y0 in (362, 452):
        out.append(f'<rect x="1176" y="{y0}" width="22" height="70" rx="3" fill="none" stroke="var(--run-fence)" stroke-width="4"/>'
                   f'<path d="M1176 {y0 + 23} H1198 M1176 {y0 + 46} H1198" stroke="var(--run-fence)" stroke-width="2.5"/>')
    # The water trough, out in the field.
    out.append(f'<rect x="656" y="456" width="96" height="34" rx="4" fill="var(--run-steel)" {LINE}/>'
               f'<rect x="662" y="458" width="84" height="8" rx="2" fill="var(--run-water)"/>')
    out.append(porch())
    # The blue ball, in the grass.
    out.append(f'<circle cx="868" cy="628" r="9" fill="var(--run-ball)" {LINE}/>'
               '<path d="M861 624 q7 6 14 0" fill="none" stroke="var(--run-cloud)" stroke-width="1.6"/>')
    out.append("</svg>")
    return "".join(out)


def front_svg(d):
    """What stands in FRONT of a dog: the near rim of each bed and the front of
    the swing's seat, so a dog in a bed is in it. It takes no pointer, so
    pressing a dog in a bed presses the dog."""
    out = [f'<svg class="run-field__front" viewBox="0 0 {W} {H}" aria-hidden="true" focusable="false">']
    for x, col in ((76, "--run-cushion"), (300, "--run-cushion-2"), (392, "--run-cushion")):
        out.append(f'<path d="M{x - 50} {DECK - 12} Q{x - 48} {DECK + 4} {x} {DECK + 4} Q{x + 48} {DECK + 4} {x + 50} {DECK - 12} '
                   f'Q{x} {DECK - 2} {x - 50} {DECK - 12} Z" fill="var({col})" {LINE}/>')
    out.append(f'<rect x="80" y="466" width="140" height="10" rx="3" fill="var(--run-board)" {LINE}/>')
    out.append("</svg>")
    return "".join(out)


def field_block(d):
    spots = sorted(d["spots"], key=lambda s: (s["y"] // 60, s["x"]))
    lis = "\n".join(
        f'        <li data-spot="{attr(s["key"])}" data-kind="{s["kind"]}" data-level="{s["level"]}" '
        f'data-x="{n(s["x"])}" data-y="{n(s["y"])}">{esc(s["where"])}</li>' for s in spots)
    moods = json.dumps(d["moods"], separators=(",", ":"))
    return (f'    <div class="run-field" id="run-field" data-roam data-kind="dog" data-shelter="rescue-a-dog.html" '
            f'data-moods="{attr(moods)}" data-left-alone="{attr(" ".join(d["left_alone"]))}" '
            f'data-animal-w="{DOG_W}" data-animal-h="{DOG_H}" data-w="{W}" data-h="{H}">\n'
            f'      {field_svg(d)}\n'
            f'      <div class="run-dogs" id="run-dogs" data-roam-box></div>\n'
            f'      {front_svg(d)}\n'
            f'      <ul class="run-spots" id="run-spots" data-roam-spots data-kept="{attr(d["kept"])}" hidden>\n{lis}\n      </ul>\n'
            f'    </div>')


def toys_block(d):
    return "\n".join(
        f'      <button type="button" class="run-btn run-toy" data-roam-toy data-toy="{attr(t["key"])}" '
        f'data-kinds="{attr(" ".join(t.get("kinds", [])))}" data-levels="{attr(" ".join(t.get("levels", [])))}" '
        f'data-most="{t["most"]}" data-went="{attr(t["went"])}" hidden>{esc(t["label"])}</button>'
        for t in d["toys"])


def mark(x):
    if x["diet"] == "vegan":
        return "Vegan"
    if x["diet"] == "fish":
        return "Fish"
    return x["animal"][:1].upper() + x["animal"][1:]


def tin_block(items):
    out = ['    <ul class="run-tin">']
    for x in items:
        note = f'\n        <p class="run-tin__note">{esc(x["note"])}</p>' if x.get("note") else ""
        out.append(f'      <li class="run-tin__bag">\n'
                   f'        <h3 class="run-tin__name">{esc(x["name"])}</h3>\n'
                   f'        <p class="run-tin__mark">{esc(mark(x))} &middot; for dogs</p>\n'
                   f'        <p class="run-tin__what"><span class="sr">In it: </span>{esc(x["what"])}</p>\n'
                   f'        <p class="run-tin__has">For anybody handling it: {esc(hgc.contains(x)[0].lower() + hgc.contains(x)[1:])}</p>{note}\n'
                   '      </li>')
    out.append('    </ul>')
    return "\n".join(out)


def day(iso):
    y, m, dd = (int(x) for x in iso.split("-"))
    return f"{dd} {MONTHS[m - 1]} {y}"


def telly_block(d):
    sid, sname = SCREEN
    out = [f'    <div class="run-screen" data-rack-screen="{sid}" tabindex="-1" hidden>',
           '      <p class="run-screen__idle"><span><b>The dog telly.</b> Nothing is on it. Any film on the rack can go '
           'up here with the button under it, and nothing loads until you press one.</span></p>',
           '    </div>',
           f'    <p class="run-screen__now" data-rack-now="{sid}" tabindex="-1" hidden></p>',
           f'    <p class="run-screen__back" hidden><button type="button" class="run-btn run-btn--quiet" '
           f'data-rack-back="{sid}">Take it off the dog telly</button></p>',
           '    <details class="run-rack" open>',
           '      <summary class="run-rack__sum">The rack: television made for dogs</summary>',
           '      <ul class="run-vids">']
    for v in d["videos"]:
        t, c = esc(v["title"]), esc(v["channel"])
        runs = "live, and runs until you close it" if v.get("live") else v["runtime"]
        label = "live, runs until you close it" if v.get("live") else v["runtime"]
        out += [
            '        <li class="run-vid" data-rack-card>',
            f'          <h3 class="run-vid__title">{t}</h3>',
            f'          <p class="run-vid__by">{c} &middot; {day(v["published"])} &middot; {runs}</p>',
            f'          <button type="button" class="facade" data-embed-id="{v["id"]}" data-embed-title="{attr(v["channel"])} &mdash; {attr(v["title"])}">',
            f'            Watch it here &mdash; {label}',
            '            <span class="facade__play">&#9654; PRESS PLAY</span>',
            '          </button>',
            f'          <button type="button" class="run-btn run-btn--quiet run-vid__big" hidden data-rack-to="{sid}" '
            f'data-rack-name="{sname}" data-rack-src="https://www.youtube-nocookie.com/embed/{v["id"]}?autoplay=1&amp;rel=0" '
            f'data-rack-title="{attr(v["channel"])} &mdash; {attr(v["title"])}, on {sname}" data-rack-film="{attr(v["title"])}" '
            f'data-rack-runtime="{label}">Put it on {sname} &mdash; {label}</button>',
            '        </li>']
    out += ['      </ul>', '    </details>']
    return "\n".join(out)


def liner_sources(d):
    s = d["sources"]
    rows = [(v["for"], f'<a href="{attr(v["url"])}">{esc(v["title"])}</a>, {esc(v["by"])}, read {esc(v["read"])}')
            for v in (s["dichromat"], s["redgreen"], s["seeing"], s["ball"], s["poisons"])]
    chans = []
    for v in d["videos"]:
        link = f'<a href="https://www.youtube.com/channel/{v["channel_id"]}">{esc(v["channel"])}</a>'
        if link not in chans:
            chans.append(link)
    rows.append(("The films on the dog telly’s rack",
                 "Ryan Boren’s pick, of 2026-10-05, in his order, each on its own channel on YouTube: "
                 + ", ".join(chans[:-1]) + " and " + chans[-1]
                 + ". None of them is affiliated with Stimpunks, and nothing of theirs is hosted here"))
    rows.append(("The treat tin",
                 'Filled from the treat truck at <a href="truckin-food-court.html">the Truck Stop</a> next door, '
                 'out of the same file, so the two lots cannot disagree about what a dog is given'))
    rows.append(("The dogs",
                 'Read off <a href="rescue-a-dog.html">Rescue A Dog</a>&rsquo;s own list every time the Run opens, '
                 'and drawn by the same file that draws them there'))
    return "\n".join(f'      <tr><td>{esc(w)}</td><td>{src}</td></tr>' for w, src in rows)


# ── The script and the page as written ───────────────────────────────────────

def check_script():
    pekoe.check_roam(refuse)
    if not SCRIPT.exists():
        refuse(f"{SCRIPT.name} is missing, and the dogs' words with it.")
        return
    js = pekoe.code_of(SCRIPT)
    if pekoe.KEEPS.search(js):
        refuse(f"{SCRIPT.name} keeps something in your browser. The Run keeps nothing: not who sat with you, "
               "not which dogs you met.")
    if "fetch(" in js or pekoe.WIRE.search(js) or pekoe.TALK.search(js):
        refuse(f"{SCRIPT.name} asks for something. The Run's one request is roam.js's, to the shelter's list.")
    if "window.loveRoam(" not in js:
        refuse(f"{SCRIPT.name} no longer hands the dogs to roam.js.")
    if re.search(r"\.mark\b", js):
        refuse(f"{SCRIPT.name} reads a dog's markings. Where a dog goes is its mood's business.")
    if "rescue-a-dog.html" not in js:
        refuse(f"{SCRIPT.name} no longer names Rescue A Dog, where the dogs are adopted.")
    if any(w in js for w in pekoe.WRITES_HTML):
        refuse(f"{SCRIPT.name} writes HTML. A dog's name is somebody else's words and goes in as text.")
    if re.search(r"\btransform\b", js):
        refuse(f"{SCRIPT.name} moves something with a transform.")
    sweep(" ".join(re.findall(r"'([^'\\]*(?:\\.[^'\\]*)*)'", js)), SCRIPT.name)


def check_page():
    src = PAGE.read_text()
    for want, why in (('src="animals.js"', "it does not load animals.js, which draws the dogs"),
                      ('src="roam.js"', "it does not load roam.js, which puts the dogs where they go"),
                      ('src="run.js"', "it does not load run.js"),
                      ('data-roam data-kind="dog" data-shelter="rescue-a-dog.html"',
                       "its field no longer tells roam.js these are Rescue A Dog's dogs"),
                      ('href="rescue-a-dog.html"', "it does not link Rescue A Dog, where the dogs are adopted"),
                      ('href="truckin-food-court.html"', "it has no gate through to the Truck Stop next door"),
                      ('data-roam-says', "it has no live region for what the Run says"),
                      ('src="love-embed.js"', "it does not load love-embed.js, so every film would press and do nothing"),
                      ('src="rack.js"', "it does not load rack.js, so no film could go up on the dog telly")):
        if want not in src:
            refuse(f"{PAGE.name}: {why}.")
    plain = re.sub(r"<script\b.*?</script>", " ", src, flags=re.S)
    # The films' titles and channels are theirs, quoted as written: the Doom
    # Scoop's rule. They are the one place on the page a film is called calming.
    plain = re.sub(r'<(h3|p) class="run-vid__(?:title|by)">.*?</\1>', " ", plain, flags=re.S)
    plain = re.sub(r'data-(?:embed|rack)-(?:title|film)="[^"]*"', " ", plain)
    plain = re.sub(r"<!--.*?-->", " ", plain, flags=re.S)
    sweep(plain, PAGE.name)


def section_css():
    css = CSS.read_text()
    m = re.search(rf"/\* §{SECTION} ── ROOM: The Run.*?(?=/\* §\d+ ── )", css, re.S)
    if not m:
        refuse(f"love.css has no §{SECTION} for The Run, followed by another section.")
        return
    body = re.sub(r"/\*.*?\*/", " ", m.group(0), flags=re.S)
    if re.search(r"#[0-9a-fA-F]{3,6}\b|rgba?\(|hsla?\(", body):
        refuse(f"love.css §{SECTION} has a literal colour in it. The Run's colours are --run- custom properties "
               "in :root, where this tool reads them for a dog's eyes and check-contrast.py for ours.")
    if re.search(r"transform\s*:\s*(?:rotate|skew)", body):
        refuse(f"love.css §{SECTION} rotates or skews something.")


def main():
    d = json.loads(DATA.read_text())
    keep, moods = shelter_facts()
    check_data(d, keep, moods)
    items = treats()
    palette()
    for k in ("_what", "_spots", "_sources"):
        sweep(d.get(k, ""), f"{DATA.name} {k}")
    for s in d.get("spots") or []:
        sweep(s.get("where", ""), f"{DATA.name}, place {s.get('key')}")
    for t in d.get("toys") or []:
        sweep(t.get("label", "") + ". " + t.get("went", ""), f"{DATA.name}, toy {t.get('key')}")
    if problems:
        print("REFUSING:\n  " + "\n  ".join(dict.fromkeys(problems)))
        sys.exit(1)
    swap(PAGE, "run:field", field_block(d), "    ")
    swap(PAGE, "run:toys", toys_block(d), "      ")
    swap(PAGE, "run:tin", tin_block(items), "    ")
    swap(PAGE, "run:telly", telly_block(d), "    ")
    swap(NOTES, "run-sources", liner_sources(d), "      ")
    check_script()
    check_page()
    section_css()
    if problems:
        print("REFUSING (the page as written):\n  " + "\n  ".join(dict.fromkeys(problems)))
        sys.exit(1)
    print("the run: the field, every place a dog can be, the porch, the toys, the treat tin, the dog telly's rack "
          "and the credits written; the dogs are the shelter's, read when the Run opens, and the colours are a dog's")


if __name__ == "__main__":
    main()
