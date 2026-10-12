#!/usr/bin/env python3
"""Build The Honesty Box, the farm stand on the street, out of
data/the-honesty-box.json: the stand under its own lamp, the board of what is on
it and what it costs, and the room's credits in the liner notes.

WHAT THE ROOM IS. Ryan Boren's brief, 2026-10-11: a shopfront selling the wool
goods, meat, milk, eggs, cheese and produce from All Together Now Farms and its
neighbours in Nature's Contribution, properly pasteurised, lawful and ethical,
no raw milk. His answers the same afternoon: it stands on the street, and it
sells by honesty box, prices on a board, money in a box, nobody watching. It is
how the land past the campgrounds feeds the street.

IT IS THE ONE STALL ON THIS STREET WITH PRICES, ON PURPOSE. The Truck Stop,
Hey, Good Cookin', Nothing For Sale and the Cooldown Room all refuse a price,
for their own reasons, and they are right to; this one requires a price on
everything, because the brief is a shop and selling the farms' goods is the
land's half of the bargain with the street. The prices are this story's and the
board says they change with the season. The tool refuses an item with no price
and the word free, and that is not a contradiction of those rooms but the same
care about saying exactly what something costs before anybody takes it.

THE LIGHT IS THE STAND'S OWN LAMP. One white lamp under the eave, run off the
panel on the stand's roof and the battery under its counter, throwing a cone of
light over the shelves in a dark street, and everything inside the cone keeps
its own colour. The collisions are in love.css's section for the room.

IT REFUSES, and writes nothing when it does:

  · AN ITEM WITHOUT A PRICE, a price that is not dollars and cents, and the
    word free.
  · AN ITEM ITS PLACE DOES NOT SEND HERE. The area's data file says what each
    place gives and where it goes, and an item the area does not send to the
    honesty box is not on its board.
  · CANNABIS, OF ANY KIND. It leaves the land through licensed dispensaries
    only: a box nobody watches cannot ask anybody's age. The hemp cordage and
    cloth are fibre and are here.
  · ANYTHING FROM THE SANCTUARY. Its residents are not stock.
  · RAW MILK. Every milk and cheese says pasteurised, and Colorado does not
    allow raw milk to be sold at retail.
  · MEAT THAT DOES NOT NAME ITS ANIMAL, or names one its words do not (Hey, Good
    Cookin's engine); and anything that must be kept cold on a shelf that is not.
  · THE DOOR GONE from the street's row on index.html.
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
DATA = ROOT / "data/the-honesty-box.json"
AREA = ROOT / "data/natures-contribution.json"
PAGE = ROOT / "the-honesty-box.html"
NOTES = ROOT / "liner-notes.html"
P = "hbx"
PRICE = re.compile(r"^\d{1,3}\.\d\d$")
CANNABIS = r"cannabis|marijuana|weed|\bbud\b|buds|rosins?|resins?|\bthc\b|pre-?rolls?|edibles?|joints?|hash"
COLD = {"milk", "cheese", "meat", "eggs"}
FREE = r"free|for nothing|no charge|gratis|pay what you (?:can|like|want)"


def tool(name):
    spec = importlib.util.spec_from_file_location(name.replace("-", "_"), ROOT / "tools" / f"{name}.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


hgc = tool("make-hey-good-cookin")
VOCAB = [(FREE, "free. This stall sells, at Ryan's ask, and every item says what it costs before anybody takes it."),
         (r"raw milk|unpasteuri[sz]ed|raw cheese", "raw milk. Every milk and cheese here is pasteurised."),
         (nc.TALLY, "a tally. Nobody is counted, and nothing is a best-seller.")]

problems = nc.Problems()


def check(d):
    area = json.loads(AREA.read_text())
    offers = {p["key"]: p["offers"] for p in area["places"]}
    places = d.get("places") or {}
    for sh in d.get("shelves") or []:
        for it in sh.get("items") or []:
            n = it.get("name") or "?"
            if not PRICE.match(it.get("price") or ""):
                problems.refuse(f"{n!r} has no price in dollars and cents ({it.get('price')!r}). Everything on the "
                                "board says what it costs before anybody takes it.")
            if re.search(rf"(?i){CANNABIS}", n):
                problems.refuse(f"{n!r} is cannabis. It leaves the land through licensed dispensaries only, and a box "
                                "nobody watches cannot ask anybody's age.")
            frm = it.get("from")
            if frm == "sanctuary" or "sanctuary" in n.lower():
                problems.refuse(f"{n!r} comes from the sanctuary. Its residents are not stock; nothing leaves it but "
                                "its manure.")
                continue
            if frm not in places or frm not in offers:
                problems.refuse(f"{n!r} comes from {frm!r}, which is not a place on the land.")
                continue
            kind = it.get("kind") or ""
            sent = [o for o in offers[frm] if "honesty" in o.get("to", []) and kind.lower() in o["what"].lower()]
            if not sent:
                problems.refuse(f"{n!r}: the area does not send {kind!r} from {places[frm]['name']} to the honesty box "
                                "(data/natures-contribution.json).")
            if kind in ("milk", "cheese") and "pasteuris" not in n.lower():
                problems.refuse(f"{n!r} does not say pasteurised. Every milk and cheese here is.")
            if kind == "meat":
                named = it.get("animal")
                if not named or hgc.animals(n) != [named]:
                    problems.refuse(f"{n!r} names {hgc.animals(n)} and the board says {named!r}. Meat names its animal.")
            if kind in COLD and not sh.get("cold"):
                problems.refuse(f"{n!r} is on {sh.get('shelf')!r}, which is not kept cold.")
            nc.sweep(n, f"the board: {n}", VOCAB, problems)
    idx = (ROOT / "index.html").read_text()
    if not re.search(r'<a class="door door--honesty" href="the-honesty-box\.html"', idx):
        problems.refuse("index.html has no door for the honesty box in its row of shopfronts.")


def v(name):
    return f"var(--{P}-{name})"


def stand_svg():
    """The stand at the kerb at night: a little roof with a solar panel on it,
    the lamp under the eave and its cone of white light, shelves of produce, the
    fridge and the freezer, the painted board, and the box with its slot."""
    W, H = 1200, 460
    out = [f'<svg class="{P}-stand__draw" viewBox="0 0 {W} {H}" aria-hidden="true" focusable="false">',
           '<defs>',
           f'<radialGradient id="{P}-cone" cx="600" cy="120" r="420" gradientUnits="userSpaceOnUse">'
           f'<stop offset="0" stop-color="{v("lamp")}" stop-opacity=".95"/><stop offset=".6" stop-color="{v("lamp")}" stop-opacity=".35"/>'
           f'<stop offset="1" stop-color="{v("lamp")}" stop-opacity="0"/></radialGradient>',
           '</defs>',
           f'<rect width="{W}" height="{H}" fill="{v("night")}"/>',
           f'<rect y="400" width="{W}" height="60" fill="{v("kerb")}"/>',
           f'<path d="M0 400 H{W}" stroke="{v("kerb-edge")}" stroke-width="4"/>',
           f'<path d="M600 128 L330 430 L870 430 Z" fill="url(#{P}-cone)"/>']
    # The roof and its panel.
    out.append(f'<path d="M360 120 L600 70 L840 120 Z" fill="{v("roof")}"/>'
               f'<path d="M430 98 L600 62 L770 98 L760 104 L600 70 L440 104 Z" fill="{v("pv")}"/>'
               f'<path d="M430 98 L600 62 L770 98" stroke="{v("lamp")}" stroke-width="2" fill="none" opacity=".6"/>'
               f'<path d="M380 120 V400 M820 120 V400" stroke="{v("post")}" stroke-width="12"/>')
    # The lamp under the eave.
    out.append(f'<rect x="586" y="120" width="28" height="10" rx="3" fill="{v("post")}"/>'
               f'<rect x="590" y="128" width="20" height="6" rx="2" fill="{v("lamp")}"/>')
    # Shelves with the produce on them.
    for y in (190, 260):
        out.append(f'<rect x="392" y="{y}" width="416" height="8" fill="{v("wood")}"/>')
    produce = [(410, 182, "corn"), (450, 182, "squash"), (492, 182, "squash"), (540, 182, "pepper"), (572, 182, "pepper"),
               (612, 182, "tomato"), (650, 182, "herb"), (690, 182, "herb"), (735, 182, "flower"), (775, 182, "flower"),
               (420, 252, "egg"), (470, 252, "wool"), (520, 252, "wool"), (575, 252, "nut"), (622, 252, "nut"),
               (672, 252, "rope"), (722, 252, "cloth"), (770, 252, "seed")]
    for x, y, k in produce:
        out.append({
            "corn": f'<ellipse cx="{x}" cy="{y - 8}" rx="7" ry="13" fill="{v("corn")}"/>',
            "squash": f'<ellipse cx="{x}" cy="{y - 10}" rx="16" ry="11" fill="{v("squash")}"/>',
            "pepper": f'<path d="M{x} {y - 22} q8 10 0 22 q-8 -10 0 -22" fill="{v("pepper")}"/>',
            "tomato": f'<circle cx="{x - 6}" cy="{y - 7}" r="6" fill="{v("pepper")}"/><circle cx="{x + 6}" cy="{y - 7}" r="6" fill="{v("pepper")}"/>',
            "herb": f'<path d="M{x} {y} v-22 M{x - 8} {y} q2 -14 8 -18 M{x + 8} {y} q-2 -14 -8 -18" stroke="{v("leaf")}" stroke-width="3" fill="none"/>',
            "flower": f'<path d="M{x} {y} v-18" stroke="{v("leaf")}" stroke-width="2"/><circle cx="{x}" cy="{y - 22}" r="7" fill="{v("marigold")}"/>',
            "egg": f'<rect x="{x - 18}" y="{y - 12}" width="36" height="12" fill="{v("carton")}"/>' + "".join(
                f'<ellipse cx="{x - 12 + i * 8}" cy="{y - 14}" rx="3.6" ry="4.6" fill="{v("egg")}"/>' for i in range(4)),
            "wool": f'<ellipse cx="{x}" cy="{y - 11}" rx="16" ry="11" fill="{v("wool")}"/><path d="M{x - 12} {y - 14} q12 -6 24 0 M{x - 12} {y - 8} q12 -6 24 0" stroke="{v("wool-line")}" stroke-width="1.6" fill="none"/>',
            "nut": f'<path d="M{x - 14} {y} h28 l-4 -20 h-20 z" fill="{v("bag")}"/>',
            "rope": f'<circle cx="{x}" cy="{y - 12}" r="12" fill="none" stroke="{v("rope")}" stroke-width="5"/>',
            "cloth": f'<rect x="{x - 16}" y="{y - 18}" width="32" height="18" fill="{v("cloth")}"/>',
            "seed": f'<rect x="{x - 10}" y="{y - 22}" width="20" height="22" fill="{v("packet")}"/>',
        }[k])
    # The fridge and the freezer under the counter, running off the battery.
    out.append(f'<rect x="400" y="300" width="150" height="96" rx="6" fill="{v("fridge")}"/>'
               f'<rect x="562" y="320" width="110" height="76" rx="6" fill="{v("fridge")}"/>'
               f'<path d="M536 320 v30" stroke="{v("post")}" stroke-width="4"/><path d="M572 340 h90" stroke="{v("post")}" stroke-width="3"/>'
               f'<rect x="684" y="352" width="54" height="44" fill="{v("battery")}"/>')
    # The box with its slot and its padlock, on the counter end.
    out.append(f'<rect x="752" y="300" width="56" height="44" fill="{v("wood")}"/>'
               f'<rect x="766" y="306" width="28" height="4" fill="{v("night")}"/>'
               f'<rect x="774" y="330" width="12" height="10" fill="{v("post")}"/>')
    # The painted board, leaning on the post.
    out.append(f'<path d="M868 400 L900 200 H1040 L1060 400" fill="none" stroke="{v("wood")}" stroke-width="6"/>'
               f'<rect x="898" y="206" width="144" height="150" fill="{v("board")}"/>'
               + "".join(f'<path d="M912 {232 + i * 22} h{70 + (i * 23) % 40} M1012 {232 + i * 22} h18" stroke="{v("paint")}" '
                         f'stroke-width="4" stroke-linecap="round"/>' for i in range(5)))
    out.append('</svg>')
    return "".join(out)


def board(d):
    places = d["places"]
    out = []
    for sh in d["shelves"]:
        key = re.sub(r"[^a-z]+", "-", sh["shelf"].lower()).strip("-")
        cold = f'<p class="{P}-shelf__cold">Kept cold, off the stand&rsquo;s own panel and battery.</p>' if sh.get("cold") else ""
        out.append(f'    <section class="{P}-shelf" aria-labelledby="{P}-{key}-h">')
        out.append(f'      <h3 id="{P}-{key}-h">{nc.esc(sh["shelf"])}</h3>{cold}')
        out.append(f'      <ul class="{P}-items">')
        for it in sh["items"]:
            pl = places[it["from"]]
            out.append(f'        <li><span class="{P}-item__name">{nc.esc(it["name"])}</span>'
                       f'<span class="{P}-item__price">${it["price"]}</span>'
                       f'<span class="{P}-item__from">from <a href="{pl["page"]}">{nc.esc(pl["name"])}</a></span></li>')
        out += ['      </ul>', '    </section>']
    return "\n".join(out)


def liner(d):
    rows = [("The stand, and what is on it", "Ryan Boren&rsquo;s brief of 2026-10-11, and his answers the same afternoon: a "
             "shopfront on the street, selling by honesty box. The prices are this story&rsquo;s"),
            ("The stand under its lamp", "Ours, drawn by tools/make-the-honesty-box.py")]
    return "\n".join(f'      <tr><td>{w}</td><td>{s}</td></tr>' for w, s in rows)


def sweep_page():
    body = nc.page_body(PAGE, cut=("hbx:stand",))
    nc.sweep(body, PAGE.name, VOCAB, problems)
    src = PAGE.read_text()
    scripts = re.findall(r'<script src="([^"]+)"', src)
    if sorted(scripts) != sorted(["love.js", "quest.js"]):
        problems.refuse(f"the stand loads {scripts}; it loads love.js and quest.js and nothing else.")
    if "21" not in body:
        problems.refuse("the page does not say you have to be 21 to buy cannabis, where it says the box will not sell it.")
    ids = re.findall(r'\bid="([^"]+)"', src)
    dup = sorted({i for i in ids if ids.count(i) > 1})
    if dup:
        problems.refuse(f"ids with two owners on the page: {', '.join(dup)}")


def main():
    d = json.loads(DATA.read_text())
    check(d)
    problems.stop("the data")
    nc.swap(PAGE, "hbx:stand", stand_svg(), "      ")
    nc.swap(PAGE, "hbx:board", board(d), "    ")
    nc.swap(NOTES, "hbx-credits", liner(d), "      ")
    sweep_page()
    problems.stop("the page as written")
    print("the honesty box: the stand under its lamp, the board with every price, and the credits written")


if __name__ == "__main__":
    main()
