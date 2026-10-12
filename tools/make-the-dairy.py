#!/usr/bin/env python3
"""Build The Dairy, the café in the old dairy at All Together Now Farms, out of
data/the-dairy.json: the room, the menu, where every ingredient comes from, and
the room's credits in the liner notes.

WHAT THE ROOM IS. Ryan Boren's brief, 2026-10-11: a café at the farm with a menu
created from every edible offering in Nature's Contribution, everything properly
pasteurised. It is in the farm's old dairy, behind the farm, which is why it
gets a page of its own: it is a room you walk into.

THE LIGHT IS BOUNCED OFF GLAZE. A dairy is tiled white to the ceiling so it can
be washed down, with small windows set high, and the daylight that comes in goes
round and round the glazed walls until it is everywhere and casts nothing. The
only colour in the room is the band of green tile at hand height and the food.
The collisions are in love.css's section for the room.

IT REFUSES, and writes nothing when it does:

  · AN INGREDIENT THE LAND DOES NOT GROW. Every ingredient names the place on
    the land it comes from, and the tool looks for it in that place's own data
    file, so the menu cannot claim a crop the land does not have; anything
    bought in is in `from_away` and the page says so.
  · A DISH WITHOUT WHAT IS IN IT, OR A DIET IT BREAKS, by Hey, Good Cookin's
    engine (check_dish), whose allergen lines the cards carry; a drink whose
    caffeine its ingredients cannot settle, by Pekoe and Purrs'.
  · RAW MILK, in our voice, except where it is refused: every milk and cheese
    in here is pasteurised.
  · THE VOCABULARY THE OTHER KITCHENS REFUSE: a verdict on food or a body,
    sorting eaters, and a tally (Hey, Good Cookin's lists).
  · A SCRIPT OF ITS OWN.
"""
import importlib.util
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import natures as nc  # noqa: E402

ROOT = nc.ROOT
TOOLS = ROOT / "tools"
DATA = ROOT / "data/the-dairy.json"
PAGE = ROOT / "the-dairy.html"
NOTES = ROOT / "liner-notes.html"
P = "dry"


def tool(name):
    spec = importlib.util.spec_from_file_location(name.replace("-", "_"), TOOLS / f"{name}.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


hgc = tool("make-hey-good-cookin")
pekoe = tool("make-pekoe")
RAW = r"raw milk|unpasteuri[sz]ed|raw cheese"
VOCAB = [(RAW, "raw milk. Everything from the dairy here is pasteurised."),
         (hgc.DIET, "a verdict on food or on a body. Food is food in here."),
         (hgc.PICKY, "sorting eaters. Nobody here is picky."),
         (nc.TALLY, "a tally. Nobody is counted.")]

problems = nc.Problems()


def check(d):
    places = d.get("places") or {}
    grown = {}
    for x in d.get("pantry") or []:
        pl = places.get(x.get("from"))
        if not pl:
            problems.refuse(f"pantry {x.get('what')!r} comes from {x.get('from')!r}, which is not a place here.")
            continue
        f = ROOT / pl["data"]
        if not f.exists():
            problems.refuse(f"pantry {x.get('what')!r} comes from {pl['name']}, and {pl['data']} does not exist.")
            continue
        if x.get("look", "").lower() not in f.read_text().lower():
            problems.refuse(f"pantry {x.get('what')!r}: {pl['data']} does not mention {x.get('look')!r}, so "
                            f"{pl['name']} does not grow it as far as this land knows.")
        grown[x["what"].lower()] = x["from"]
    away = {a.lower() for a in d.get("from_away") or []}
    for sec in d.get("menu") or []:
        for item in sec.get("items") or []:
            where = f"{sec.get('section')}: {item.get('name')}"
            before = len(hgc.problems)
            hgc.check_dish({k: item[k] for k in ("name", "diet", "what", "animal") if k in item}, where)
            problems.extend(hgc.problems[before:])
            del hgc.problems[before:]
            for ing in (i.strip().lower() for i in item.get("what", "").split(",")):
                if ing == "water":
                    continue
                if ing not in grown and ing not in away:
                    problems.refuse(f"{where}: {ing!r} is not in the pantry. Everything on the menu is grown on "
                                    "this land or said to be bought in.")
            if sec.get("drinks") and pekoe.caffeine(item.get("what", "")) is None:
                problems.refuse(f"{where}: its ingredients do not settle its caffeine.")
            nc.sweep(item.get("name", ""), where, VOCAB, problems)


def item_card(item, d):
    has = hgc.contains({"what": item["what"]})
    marks = {"vegan": "Vegan", "vegetarian": "Vegetarian"}.get(item["diet"]) or item.get("animal", "").capitalize()
    drink = ""
    if item.get("_drink"):
        drink = f'\n          <p class="{P}-item__caf">{nc.esc(pekoe.CAFFEINE_SAYS[pekoe.caffeine(item["what"])])}</p>'
    places = d["places"]
    grown = {x["what"].lower(): x["from"] for x in d["pantry"]}
    froms = []
    for ing in (i.strip().lower() for i in item["what"].split(",")):
        k = grown.get(ing)
        if k and places[k]["name"] not in froms:
            froms.append(places[k]["name"])
    return (f'        <li class="{P}-item">\n'
            f'          <h4 class="{P}-item__name">{nc.esc(item["name"])}</h4>\n'
            f'          <p class="{P}-item__mark">{nc.esc(marks)}</p>\n'
            f'          <p class="{P}-item__what"><span class="sr">In it: </span>{nc.esc(item["what"])}</p>\n'
            f'          <p class="{P}-item__has">{nc.esc(has)}</p>{drink}\n'
            f'          <p class="{P}-item__from">From {nc.esc(nc.listify(froms))}.</p>\n'
            '        </li>')


def menu(d):
    out = []
    for sec in d["menu"]:
        key = re.sub(r"[^a-z]+", "-", sec["section"].lower()).strip("-")
        out.append(f'    <section class="{P}-board" aria-labelledby="{P}-{key}-h">')
        out.append(f'      <h3 id="{P}-{key}-h">{nc.esc(sec["section"])}</h3>')
        out.append(f'      <ul class="{P}-items">')
        for item in sec["items"]:
            out.append(item_card(dict(item, _drink=bool(sec.get("drinks"))), d))
        out += ['      </ul>', '    </section>']
    return "\n".join(out)


def pantry(d):
    places = d["places"]
    by = {}
    for x in d["pantry"]:
        by.setdefault(x["from"], []).append(x["what"])
    out = [f'    <ul class="{P}-pantry">']
    for k, items in by.items():
        pl = places[k]
        out.append(f'      <li><a href="{pl["page"]}">{nc.esc(pl["name"])}</a>: {nc.esc(nc.listify(items))}.</li>')
    out.append(f'      <li>Bought in from away: {nc.esc(nc.listify(d["from_away"]))}. The water is the farm&rsquo;s well&rsquo;s.</li>')
    out.append('    </ul>')
    return "\n".join(out)


def room_svg():
    """The old dairy from its door: white glazed tile to the ceiling with a band
    of green at hand height, two small windows set high, a steel counter, the
    pasteuriser with its thermometer, and tables. Nothing casts a shadow."""
    W, H = 1200, 440
    v = lambda n: f"var(--{P}-{n})"
    out = [f'<svg class="{P}-room__draw" viewBox="0 0 {W} {H}" aria-hidden="true" focusable="false">',
           f'<rect width="{W}" height="{H}" fill="{v("tile")}"/>']
    out += [f'<path d="M0 {y} H{W}" stroke="{v("grout")}" stroke-width="1.2"/>' for y in range(20, H, 26)]
    out += [f'<path d="M{x} 0 V{H}" stroke="{v("grout")}" stroke-width="1.2"/>' for x in range(24, W, 26)]
    out.append(f'<rect y="250" width="{W}" height="52" fill="{v("band")}"/>')
    out += [f'<path d="M{x} 250 V302" stroke="{v("band-grout")}" stroke-width="1.2"/>' for x in range(24, W, 26)]
    for x in (230, 860):
        out.append(f'<rect x="{x}" y="40" width="110" height="62" fill="{v("window")}" stroke="{v("steel-dark")}" stroke-width="5"/>'
                   f'<path d="M{x + 55} 40 V102 M{x} 71 H{x + 110}" stroke="{v("steel-dark")}" stroke-width="3"/>')
    out.append(f'<rect x="0" y="370" width="{W}" height="70" fill="{v("floor")}"/>')
    # The steel counter and the pasteuriser on it.
    out.append(f'<rect x="80" y="300" width="460" height="72" fill="{v("steel")}"/>'
               f'<path d="M80 300 H540" stroke="{v("steel-dark")}" stroke-width="4"/>'
               f'<rect x="120" y="212" width="130" height="90" rx="10" fill="{v("steel")}" stroke="{v("steel-dark")}" stroke-width="3"/>'
               f'<circle cx="185" cy="246" r="20" fill="{v("tile")}" stroke="{v("steel-dark")}" stroke-width="3"/>'
               f'<path d="M185 246 L197 236" stroke="{v("band")}" stroke-width="3" stroke-linecap="round"/>'
               f'<path d="M250 236 h40 v-20" stroke="{v("steel-dark")}" stroke-width="5" fill="none"/>')
    # Churns and a cheese on the counter.
    out.append(f'<path d="M330 300 v-46 q20 -14 40 0 v46 z" fill="{v("steel")}" stroke="{v("steel-dark")}" stroke-width="3"/>'
               f'<path d="M400 300 v-52 q22 -16 44 0 v52 z" fill="{v("steel")}" stroke="{v("steel-dark")}" stroke-width="3"/>'
               f'<ellipse cx="490" cy="292" rx="34" ry="10" fill="{v("cheese")}"/><rect x="456" y="276" width="68" height="16" fill="{v("cheese")}"/>'
               f'<ellipse cx="490" cy="276" rx="34" ry="10" fill="{v("cheese-top")}"/>')
    # Tables, each with a plate in the room's only colours.
    for x in (700, 930):
        out.append(f'<rect x="{x}" y="318" width="160" height="12" fill="{v("table")}"/>'
                   f'<path d="M{x + 18} 330 V370 M{x + 142} 330 V370" stroke="{v("steel-dark")}" stroke-width="5"/>'
                   f'<ellipse cx="{x + 60}" cy="314" rx="30" ry="7" fill="{v("plate")}" stroke="{v("steel")}" stroke-width="2"/>'
                   f'<ellipse cx="{x + 60}" cy="312" rx="16" ry="4" fill="{v("squash")}"/>'
                   f'<path d="M{x + 112} 318 v-22 h14 v22" fill="{v("milk")}" stroke="{v("steel")}" stroke-width="2"/>')
    out.append('</svg>')
    return "".join(out)


def liner(d):
    rows = [("The café, and what it serves", "Ryan Boren&rsquo;s brief of 2026-10-11; every ingredient is grown on "
             "the land, and the page says which place grows it"),
            ("Every allergen line", 'Worked out by the same engine as <a href="hey-good-cookin.html">Hey, Good Cookin&rsquo;</a>, '
             'from what is in each dish'),
            ("Every drink&rsquo;s caffeine", 'Worked out by the same engine as <a href="pekoe-and-purrs.html">Pekoe and Purrs</a>'),
            ("The old dairy", "Ours, drawn by tools/make-the-dairy.py")]
    return "\n".join(f'      <tr><td>{w}</td><td>{s}</td></tr>' for w, s in rows)


def sweep_page():
    body = nc.page_body(PAGE, cut=("dry:room",))
    nc.sweep(body, PAGE.name, VOCAB, problems)
    src = PAGE.read_text()
    scripts = re.findall(r'<script src="([^"]+)"', src)
    if sorted(scripts) != sorted(["love.js", "quest.js"]):
        problems.refuse(f"the café loads {scripts}; it loads love.js and quest.js and nothing else.")
    ids = re.findall(r'\bid="([^"]+)"', src)
    dup = sorted({i for i in ids if ids.count(i) > 1})
    if dup:
        problems.refuse(f"ids with two owners on the page: {', '.join(dup)}")


def main():
    d = json.loads(DATA.read_text())
    check(d)
    problems.stop("the data")
    nc.swap(PAGE, "dry:room", room_svg(), "      ")
    nc.swap(PAGE, "dry:menu", menu(d), "    ")
    nc.swap(PAGE, "dry:pantry", pantry(d), "    ")
    nc.swap(NOTES, "dry-credits", liner(d), "      ")
    sweep_page()
    problems.stop("the page as written")
    print("the dairy: the room, the menu, where everything comes from, and the credits written")


if __name__ == "__main__":
    main()
