#!/usr/bin/env python3
"""Build Mycelium Munchies' pass, menu and growing rooms from data/mycelium.json.

Mycelium Munchies is level B2 of Arlesglad Caverns: a mushroom farm with a
restaurant at the end of the growing rooms. Ryan's brief, 2026-09-26. This
writes three blocks into the room -- the house specialities on the pass, the
rest of the menu, and the growing rooms -- and holds the room to the rules the
brief was given in DECISIONS.md.

WHAT IT REFUSES:

  · A DISH WITH A MUSHROOM THE FARM DOES NOT GROW, AND A MUSHROOM NO DISH SERVES.
    Everything on a plate was grown on the shelves you walk past; a crop that
    never reaches a plate is decoration pretending to be a crop.
  · HOUSE SPECIALITIES THAT ARE NOT THE BRIEF'S. Crispy fried oyster mushrooms,
    lion's mane nuggets and mushroom steaks were named in Ryan's brief, and the
    pass holds exactly those.
  · A DISH THAT DOES NOT SAY WHAT IS IN IT, OR ANYTHING SERVED RAW. The runtime
    rule for a kitchen: somebody who cannot eat something should not have to ask.
  · A LATIN NAME. The herbarium's rule: a binomial on a menu reads as a
    determination and was typed from memory. A short list of genera, and any
    mushroom name shaped like one; the rule in the data file covers the rest.
  · A FIELD GUIDE. The vocabulary of foraging and identifying wild mushrooms, the
    most dangerous friendly edit on the street, because a description of how a
    mushroom looks next to where it grows is one step from somebody eating what
    they found.
  · A SUPPLEMENT. Brains, focus, memory, nerves, immunity, energy, adaptogens,
    superfoods, medicine: the lion's mane marketing, which on this site is the
    cure framing on a plate. And "magic".
  · THE WOOD WIDE WEB stated as fact. Argued about among the people who study it;
    a menu is not where it gets settled.
  · The Vital kitchen's refusals too: authentic, exotic, healthy, and a ranking.
  · A QUOTATION OF OURS THAT OUR PAGE DOES NOT SAY. Where the Knowledge System
    mirror is on this machine the line is checked against it word for word; where
    it is not, the tool says so and carries on, make-coworking.py's rule.

Every refusal of vocabulary uses the checkpoint's negation window, so the room
can say what it will not do. TOP-LEVEL UNDERSCORE KEYS in the data are the
record of why and are skipped. IT NEEDS NOTHING BUT THE FILES.
"""
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data/mycelium.json"
ROOM = ROOT / "mycelium-munchies.html"
MIRROR = Path.home() / "Documents/Claude/Projects/Stimpunks Knowledge System/site/stimpunks.org"
HOUSE = ["Crispy fried oyster mushrooms", "Lion's mane nuggets", "Mushroom steaks"]
COLOURS = {"grey", "pink", "gold", "blue", "cream", "tan"}

GENERA = (r"pleurotus|hericium|lentinula|lentinus|agaricus|grifola|flammulina|psilocybe|amanita|"
          r"cordyceps|ganoderma|trametes|morchella|cantharellus|boletus|coprinus|armillaria|"
          r"hypsizygus|pholiota|stropharia|tremella|inonotus|auricularia|volvariella|calvatia")
FORAGE = (r"forag\w*|wild mushrooms?|in the wild|in the woods|identif\w+|look-?alikes?|spore prints?|"
          r"safe to eat|edible|poisonous|toxic|how to (?:find|pick|spot|tell)|field guide|mushroom hunt\w*")
SUPPLEMENT = (r"brains?|cogniti\w+|focus|memory|nootropic\w*|neuro\w*|nerves?|nerve growth|"
              r"immun\w+|energy|adaptogen\w*|superfoods?|medicin\w+|supplements?|boost\w*|"
              r"heal(?:s|ing|ed)?|cures?|cured|treat(?:s|ment|ments)?\b|therap\w*|detox\w*|"
              r"good for you|healthy|healthier|nutrient-dense|magic|psilocybin|psychedelic\w*|shrooms?\b|trip(?:s|ping)?\b")
WOODWEB = r"wood[- ]wide[- ]web|trees? (?:talk|communicate|speak|share|feed)|mother trees?"
KITCHEN = r"authentic\w*|exotic|ethnic|best|#1|number one|finest|world[- ]class|award[- ]winning"
# NARROWED ON ITS FIRST RUN: the flat `scores?` refused "scored", which is what a
# cook does to a king oyster plank with a knife. A menu has no use for the
# scoring vocabulary, so it went rather than the verb being excepted --
# check-counts.py's first-run lesson and make-guild.py's, one more time.
TALLY = (r"streaks?|leaderboards?|high[- ]scores?|badges?|tall(?:y|ies)|\d+\s+(?:kinds|dishes|mushrooms)|"
         r"prices?|\$\s*\d|\d+\s*(?:dollars|pounds|euros)")
NEGATION = (r"(?:no|not|nothing|never|neither|none|nor|without|refuses?|refused|refusing|"
            r"cannot|does not|won't|will not|is not|are not|isn't|aren't|nobody|declin\w+)")
ENTITY = re.compile(r"&(?:[a-zA-Z][a-zA-Z0-9]{1,8}|#\d{2,5}|#x[0-9A-Fa-f]{2,5});")

problems = []


def sweep(text, where):
    for label, pat in (("is a field guide", FORAGE), ("sells a supplement", SUPPLEMENT),
                       ("states the wood wide web", WOODWEB), ("sells the kitchen", KITCHEN),
                       ("counts or prices something", TALLY)):
        found = re.compile(rf"\b(?:{pat})", re.I)
        ok = re.compile(rf"\b{NEGATION}\b[^.]{{0,70}}?\b(?:{pat})", re.I)
        for m in found.finditer(text):
            window = text[max(0, m.start() - 80):m.end()]
            if ok.search(window):
                continue
            problems.append(f"{where}: {m.group(0)!r} {label}. See the data file's reasons; rewrite the "
                            "sentence rather than softening the word.")
    for m in re.finditer(rf"\b(?:{GENERA})\b", text, re.I):
        problems.append(f"{where}: {m.group(0)!r} is a Latin genus. Name the mushroom the way a kitchen does.")


data = json.loads(DATA.read_text())
mushrooms, dishes, why = data["mushrooms"], data["dishes"], data["why"]
mids = [m["id"] for m in mushrooms]
used = set()

for m in mushrooms:
    where = f"mushroom {m.get('id')!r}"
    for key in ("id", "name", "colour", "look", "cooked", "grown_on"):
        if not m.get(key):
            problems.append(f"{where} has no {key}.")
    if m.get("colour") not in COLOURS:
        problems.append(f"{where}'s colour is {m.get('colour')!r}; the room's inks are {sorted(COLOURS)}.")
    if re.fullmatch(r"[A-Z][a-z]+ [a-z]+", m.get("name", "")) and not m["name"].endswith(("mushroom", "mane")):
        problems.append(f"{where} is named {m['name']!r}, which is shaped like a binomial.")
    for key, value in m.items():
        sweep(str(value), f"{where} ({key})")
        if ENTITY.search(str(value)):
            problems.append(f"{where} ({key}): an HTML entity. Write the character.")

house = [d["name"] for d in dishes if d.get("house")]
if house != HOUSE:
    problems.append(f"the house specialities are {house}; the brief named {HOUSE}, in that order.")
for d in dishes:
    where = f"dish {d.get('id')!r}"
    for key in ("id", "name", "way", "mushrooms", "what", "in"):
        if not d.get(key):
            problems.append(f"{where} has no {key}.")
    if "raw" in str(d.get("way", "")).lower():
        problems.append(f"{where} is served raw. Nothing here is.")
    if len(str(d.get("in", "")).split()) < 4:
        problems.append(f"{where} does not say what is in it, which it has to before anybody orders.")
    for mid in d.get("mushrooms", []):
        if mid not in mids:
            problems.append(f"{where} serves {mid!r}, which the growing rooms do not grow.")
        used.add(mid)
    for key, value in d.items():
        if isinstance(value, str):
            sweep(value, f"{where} ({key})")
            if ENTITY.search(value):
                problems.append(f"{where} ({key}): an HTML entity. Write the character.")
for mid in mids:
    if mid not in used:
        problems.append(f"the growing rooms grow {mid!r} and no dish serves it.")

mirror_note = "the mirror is not on this machine, so the quotation was not re-checked"
src_post = MIRROR / why["mirror"]
if src_post.exists():
    if why["line"] not in src_post.read_text():
        problems.append(f"our post does not say {why['line']!r}, word for word. Quote what it says.")
    mirror_note = "the quotation matches our post word for word"

# ── Writing ──────────────────────────────────────────────────────────────────
esc = lambda s: html.escape(s, quote=False)
names = {m["id"]: m["name"] for m in mushrooms}
serves = {mid: [d for d in dishes if mid in d["mushrooms"]] for mid in mids}


def listing(ids):
    # Lowercase in a sentence: "fried · grey oyster mushroom and lion's mane".
    parts = [esc(names[i][0].lower() + names[i][1:]) for i in ids]
    return parts[0] if len(parts) == 1 else ", ".join(parts[:-1]) + " and " + parts[-1]


def dish(d, cls):
    return "\n".join([
        f'    <li class="{cls}" id="dish-{d["id"]}">',
        f'      <h3>{esc(d["name"])}</h3>',
        f'      <p class="myc-way">{esc(d["way"])} &middot; {listing(d["mushrooms"])}</p>',
        f'      <p>{esc(d["what"])}</p>',
        f'      <p class="myc-in"><b>In it:</b> {esc(d["in"])}</p>',
        "    </li>",
    ])


def room(m):
    on = serves[m["id"]]
    links = [f'<a href="#dish-{d["id"]}">{esc(d["name"])}</a>' for d in on]
    menu = links[0] if len(links) == 1 else ", ".join(links[:-1]) + " and " + links[-1]
    return "\n".join([
        f'    <li class="myc-crop" id="grown-{m["id"]}">',
        f'      <span class="myc-cap myc-cap--{m["colour"]}" aria-hidden="true"></span>',
        '      <div>',
        f'        <h3>{esc(m["name"])}</h3>',
        f'        <p><b>On the shelf:</b> {esc(m["look"])}</p>',
        f'        <p><b>Cooked:</b> {esc(m["cooked"])}</p>',
        f'        <p class="myc-grown">Grown here on {esc(m["grown_on"])}. On the menu as {menu}.</p>',
        '      </div>',
        "    </li>",
    ])


BLOCKS = {
    "pass": "\n".join(['  <ul class="myc-pass">', *[dish(d, "myc-plate") for d in dishes if d.get("house")], "  </ul>"]),
    "menu": "\n".join(['  <ul class="myc-menu">', *[dish(d, "myc-dish") for d in dishes if not d.get("house")], "  </ul>"]),
    "rooms": "\n".join(['  <ul class="myc-rooms">', *[room(m) for m in mushrooms], "  </ul>"]),
    "why": (f'<blockquote class="myc-quote"><p>&ldquo;{esc(why["line"])}&rdquo;</p>'
            f'<p class="myc-quote__from">From our own <a href="{why["url"]}">{esc(why["post"])}</a></p></blockquote>'),
}

src = ROOM.read_text()
seen = set()


def swap(m):
    seen.add(m.group(1))
    return f"<!-- mycelium:{m.group(1)}:begin -->\n{BLOCKS[m.group(1)]}\n  <!-- mycelium:{m.group(1)}:end -->"


out = re.sub(r"<!-- mycelium:(\w+):begin -->.*?<!-- mycelium:\1:end -->", swap, src, flags=re.S)
for need in BLOCKS:
    if need not in seen:
        problems.append(f"mycelium-munchies.html has lost its mycelium:{need} markers.")

main = re.search(r"<main\b.*?</main>", out, re.S)
text = main.group(0) if main else ""
text = re.sub(r"<!-- quest:[^:]+:begin -->.*?<!-- quest:[^:]+:end -->", " ", text, flags=re.S)
text = re.sub(r"<blockquote\b.*?</blockquote>", " ", text, flags=re.S)
text = re.sub(r"<!--.*?-->|<(svg|script|style)\b.*?</\1>", " ", text, flags=re.S)
text = re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", text)))
sweep(text, "mycelium-munchies.html")

if problems:
    raise SystemExit("REFUSING:\n  " + "\n  ".join(problems))
if out != src:
    ROOM.write_text(out)
print(f"mycelium munchies: the pass, the menu and the growing rooms written from data/mycelium.json; "
      f"everything on a plate grown here, nothing raw, nothing named in Latin; {mirror_note}")
