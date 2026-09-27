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
  · DEREK SARNO'S RACK, make-club.py's pair and the Doom Scoop's quoting rule:
    every video carries a runtime and the playlist carries none; every video is
    on his own channel and in the rack newest first by upload date; his titles
    are quoted as written and the sweeps skip them, because they are his words.
    And North Spore, the one shop linked from the room, carries no query string,
    so no affiliate code or tracking can ride on it.
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

# ── Derek Sarno's rack ───────────────────────────────────────────────────────
VID = re.compile(r"^[A-Za-z0-9_-]{11}$")
RUNTIME = re.compile(r"^(?:\d+:)?[0-5]?\d:[0-5]\d$")
watch, videos, grow = data["watch"], data["videos"], data["grow"]
pl = watch["playlist"]
if "runtime" in pl:
    problems.append("the playlist carries a runtime. A list somebody keeps adding to does not have one.")
if not re.fullmatch(r"PL[A-Za-z0-9_-]{16,40}", pl.get("id", "")):
    problems.append(f"the playlist id {pl.get('id')!r} is not a YouTube playlist id.")
if not VID.match(pl.get("first", "")):
    problems.append("the playlist has no first entry recorded, which is the one that decides whether it embeds.")
if not videos:
    problems.append("the rack is empty.")
seen_v = set()
for i, v in enumerate(videos):
    where = f"video {v.get('id')!r}"
    if not VID.match(v.get("id", "")):
        problems.append(f"{where} is not a YouTube id. love-embed.js would refuse it quietly, and the button "
                        "would never become a video.")
    if v.get("id") in seen_v:
        problems.append(f"{where} is in the rack twice.")
    seen_v.add(v.get("id"))
    if not RUNTIME.match(str(v.get("runtime", ""))):
        problems.append(f"{where} has no runtime. Every video says how long it runs before the press.")
    if v.get("channel") != watch["who"]:
        problems.append(f"{where} is on {v.get('channel')!r}, not {watch['who']}'s own channel.")
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", v.get("published", "")):
        problems.append(f"{where} has no upload date, and the rack is ordered by it.")
    if i and v.get("published", "") > videos[i - 1].get("published", ""):
        problems.append(f"{where} is newer than the video before it. The rack is newest first by upload date.")
    if not v.get("title"):
        problems.append(f"{where} has no title.")
if "?" in grow.get("url", "") or "#" in grow.get("url", ""):
    problems.append(f"{grow.get('name')}'s address carries a query or fragment. The one shop linked from this "
                    "room goes plain, with no affiliate code and no tracking.")
if not grow.get("url", "").startswith("https://"):
    problems.append(f"{grow.get('name')}'s address is not https.")
guide = grow.get("guide", {})
if guide:
    if "?" in guide.get("url", "") or "#" in guide.get("url", "") or not guide.get("url", "").startswith(grow.get("url", "")):
        problems.append(f"{grow.get('name')}'s guide address is not a plain address on their own site.")
    if guide.get("url") and guide["url"] not in ROOM.read_text():
        problems.append(f"the room does not link {grow.get('name')}'s guide, which the data file says it does.")

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


MONTHS = ("January February March April May June July August September October November December").split()


def day(iso):
    y, m, d_ = iso.split("-")
    return f"{int(d_)} {MONTHS[int(m) - 1]} {y}"


att = lambda s: html.escape(s, quote=True)
who = esc(watch["who"])
rack = [f'  <div class="myc-watchplate">',
        f'    <button type="button" class="facade" data-embed-src="https://www.youtube-nocookie.com/embed/videoseries?list={pl["id"]}" '
        f'data-embed-title="{att(watch["who"])} &mdash; {att(pl["title"])}">',
        f'      Put the whole masterclass on &mdash; runs until you stop it',
        f'      <span class="facade__play">&#9654; PRESS PLAY</span>',
        f'    </button>',
        f'    <p class="myc-watchplate__credit"><a href="https://www.youtube.com/playlist?list={pl["id"]}">{esc(pl["title"])}</a>, '
        f'on YouTube, from {who}&rsquo;s own channel. No runtime on this one: it is his list, and he keeps adding to it.</p>',
        f'  </div>',
        f'  <p class="myc-intro">Or pick one: the most recent in the playlist, newest first, as it stood when we read it on '
        f'{day(watch["read"])}. Every video says how long it runs before you press it, and each title is his, as he wrote it.</p>',
        '  <ul class="myc-rack">']
for v in videos:
    rack += [f'    <li class="myc-vid">',
             f'      <h3 class="myc-vid__title">{esc(v["title"])}</h3>',
             f'      <p class="myc-vid__when">{day(v["published"])} &middot; {v["runtime"]}</p>',
             f'      <button type="button" class="facade" data-embed-id="{v["id"]}" '
             f'data-embed-title="{att(watch["who"])} &mdash; {att(v["title"])}">',
             f'        Play &mdash; {v["runtime"]}',
             f'        <span class="facade__play">&#9654; PRESS PLAY</span>',
             f'      </button>',
             f'    </li>']
rack.append("  </ul>")

BLOCKS = {
    "watch": "\n".join(rack),
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
# DEREK SARNO'S TITLES ARE HIS, quoted as written, so the rack is cut out before
# the room's own words are swept; the sentences of ours around it are not.
text = re.sub(r"<!-- mycelium:watch:begin -->.*?<!-- mycelium:watch:end -->", " ", text, flags=re.S)
text = re.sub(r"<!--.*?-->|<(svg|script|style)\b.*?</\1>", " ", text, flags=re.S)
text = re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", text)))
sweep(text, "mycelium-munchies.html")

NOTES = ROOT / "liner-notes.html"
notes = NOTES.read_text()
if "<!-- mycelium-credits:begin -->" not in notes:
    problems.append("liner-notes.html has lost its mycelium-credits markers, so Derek Sarno's rack would go uncredited.")
credit_rows = "\n".join(
    f'      <tr><td><strong>{esc(v["title"])}</strong></td><td>{day(v["published"])}</td>'
    f'<td>{v["runtime"]}</td><td><a href="https://www.youtube.com/watch?v={v["id"]}">watch</a></td></tr>'
    for v in videos)
notes_out = re.sub(r"(<!-- mycelium-credits:begin -->).*?(<!-- mycelium-credits:end -->)",
                   lambda m: m.group(1) + "\n" + credit_rows + "\n" + m.group(2), notes, flags=re.S)

if problems:
    raise SystemExit("REFUSING:\n  " + "\n  ".join(problems))
if out != src:
    ROOM.write_text(out)
if notes_out != notes:
    NOTES.write_text(notes_out)
print(f"mycelium munchies: the pass, the menu and the growing rooms written from data/mycelium.json; "
      f"everything on a plate grown here, nothing raw, nothing named in Latin; {mirror_note}")
