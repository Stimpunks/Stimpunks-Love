#!/usr/bin/env python3
"""Build Champuru, Ryan Boren's restaurant on the street, out of
data/champuru.json: the lane it is set in, the name, Ryan's own words, the
menu, the kitchen's note, the house rules and the room's credits in the liner
notes.

WHAT THE ROOM IS. Ryan's brief, 2026-11-03: a restaurant to hang out in when he
eats, with a broader palette of dishes than Vital Plant Living, after the
Mediterranean and Okinawan cooking he eats from and the fusion dishes of the
two. It is first and foremost for him and his tastes, and a prescription for
nobody. He chose the name from Claude's suggestions: chanpurū is Okinawan for
"something mixed".

THE LIGHT IS THE SUN OFF THE WALL ACROSS THE LANE. The table is set in the
shade of a narrow lane at noon, the kind both shores have: a whitewashed wall
in full sun on one side and a coral-stone wall under a red-tiled eave in shade
on the other, bougainvillea over both and a strip of sea at the end. No sun
lands on the table. Everything in the shade is lit by the sunlit wall across
from it, so every lit face looks towards that wall, every shadow is soft and
falls away from it, and the shade itself is the colour of the sky. The
collisions are in love.css's section for the room.

IT REFUSES, and writes nothing when it does:

  · A DISH WITHOUT WHAT IS IN IT, OR A DIET IT BREAKS, by Hey, Good Cookin's
    engine (check_dish), whose allergen lines the cards carry; a drink whose
    caffeine its ingredients cannot settle, by Pekoe and Purrs'. Both engines
    are imported, never copied.
  · ANYTHING ABOUT WHAT FOOD DOES FOR A BODY, in the room's own voice: blood
    sugar, heart health, longevity, a cure, a diet named for what it treats.
    The street's other kitchens hold the line already (Hey, Good Cookin's
    verdicts on food are imported), and this is the room where the friendly
    edit is likeliest, because the food in it really is the food a doctor
    talks about. It is Ryan's food; it is nobody's advice.
  · AUTHENTIC, EXOTIC, ETHNIC, and sorting eaters, Hey, Good Cookin's lists;
    and a tally.
  · THE KITCHEN'S NOTE GONE. The menu cooks Okinawa with tofu and fish, and the
    page says plainly that Okinawan home cooking uses pork and SPAM, so the
    menu cannot pass for how anybody else eats.
  · RYAN'S WORDS CHANGED. They are quoted as his, and never swept: they are
    his to say.
  · A SCRIPT OF ITS OWN, an id with two owners, and anything moving in its
    section of love.css. Nothing in the lane moves at any setting.

THE SCREEN IN THE DOORWAY is the last month from every channel Ryan took on
2026-11-03 to winnow over time, refilled every morning by
tools/pull-nature-month.py champuru (tools/daily-champuru.sh), and drawn by
tools/natures.py's month rack; this runs with --month so that only the rack is
redrawn. Nobody watched these first, and THE TITLES ARE THE CHANNELS' AND ARE
NOT SWEPT: some of them sell food by what it does for a body or for a long
life, beside a room whose own words never do. The sentence above the rack says
so, and the tool refuses the page without it.
"""
import importlib.util
import json
import math
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import natures as nc  # noqa: E402

ROOT = nc.ROOT
TOOLS = ROOT / "tools"
DATA = ROOT / "data/champuru.json"
MONTHLY = ROOT / "data/champuru-month.json"
PAGE = ROOT / "champuru.html"
NOTES = ROOT / "liner-notes.html"
CSS = ROOT / "love.css"
P = "chp"
SECTION = 136
SCREEN = ("chp", "the screen in the doorway")


def tool(name):
    spec = importlib.util.spec_from_file_location(name.replace("-", "_"), TOOLS / f"{name}.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


hgc = tool("make-hey-good-cookin")
pekoe = tool("make-pekoe")

# What a dish does for a body, in any of the words a menu reaches for when it
# is being kind. Narrow on purpose: "a dash of vinegar" and "dashi" are food.
HEALTH = (r"blood (?:sugar|glucose|pressure)|glucose|glyc(?:a)?emic|low[- ]GI|insulin|diabet\w*|"
          r"heart[- ]health\w*|anti[- ]inflammator\w*|longevity|live longer|living longer|"
          r"blue zones?|cholesterol|hypertension|metaboli\w+|medicin\w*|cures?|cured|healing|"
          r"remed(?:y|ies)|nuchi gusui|hara hachi bu|DASH (?:diet|eating plan)|dietary approaches|"
          r"weight loss|lose weight|antioxidants?|immun\w+|gut health|wellness|nourish\w*|fuel")
VOCAB = [(HEALTH, "what food does for a body. This is what Ryan likes to eat; it is nobody's advice, "
                  "and nothing in here says a dish is good for anything."),
         (hgc.DIET, "a verdict on food or on a body. Food is food in here."),
         (hgc.OTHER, "authentic, exotic or ethnic. Both shores' cooking is somebody's ordinary dinner."),
         (hgc.PICKY, "sorting eaters. Nobody here is picky."),
         (nc.TALLY, "a tally. Nothing is counted.")]
KITCHEN_HOLDS = ("pork", "SPAM", "tofu", "Ryan")

problems = nc.Problems()


def check(d):
    nm = d.get("name") or {}
    for f in ("word", "says", "culture", "source", "source_name", "read"):
        if not (nm.get(f) or "").strip():
            problems.refuse(f"the name has no {f}. The room says what the word means and where it read that.")
    if not (nm.get("source") or "").startswith("https://en.wikipedia.org/"):
        problems.refuse("the name's meaning is read on Wikipedia's chanpurū article; keep its address.")
    ryan = d.get("ryan") or []
    if len(ryan) != 2 or not all(isinstance(q, str) and q.strip() for q in ryan):
        problems.refuse("data/champuru.json's ryan is not Ryan's two passages from his brief.")
    if ryan and "not a prescription for anyone else" not in ryan[-1]:
        problems.refuse("Ryan's last passage has lost the words that make it his: the restaurant is "
                        "not a prescription for anyone else.")
    k = d.get("kitchen") or ""
    for w in KITCHEN_HOLDS:
        if w not in k:
            problems.refuse(f"the kitchen's note no longer says {w!r}. It is what stops the menu passing "
                            "for how Okinawa eats.")
    nc.sweep(k, "the kitchen's note", VOCAB, problems)
    for i, r in enumerate(d.get("rules") or []):
        nc.sweep(r, f"house rule {i + 1}", VOCAB, problems)
    if len(d.get("rules") or []) < 3:
        problems.refuse("the house rules are missing.")
    seen = set()
    for sec in d.get("menu") or []:
        if not sec.get("items"):
            problems.refuse(f"{sec.get('section')} has nothing on it.")
        for item in sec.get("items") or []:
            where = f"{sec.get('section')}: {item.get('name')}"
            if item.get("name") in seen:
                problems.refuse(f"{where} is on the menu twice.")
            seen.add(item.get("name"))
            before = len(hgc.problems)
            hgc.check_dish(item, where)
            problems.extend(hgc.problems[before:])
            del hgc.problems[before:]
            if not (item.get("note") or "").strip():
                problems.refuse(f"{where} has no note saying where it comes from.")
            if sec.get("drinks") and pekoe.caffeine(item.get("what", "")) is None:
                problems.refuse(f"{where}: its ingredients do not settle its caffeine.")
            nc.sweep(item.get("name", ""), where, VOCAB, problems)
            nc.sweep(item.get("note", ""), where, VOCAB, problems)


def mark(item):
    if item["diet"] in ("vegan", "vegetarian"):
        return item["diet"].capitalize()
    if item["diet"] == "fish":
        return "Fish"
    return item["animal"][:1].upper() + item["animal"][1:]


def item_card(item, drink):
    caf = ""
    if drink:
        caf = f'\n          <p class="{P}-dish__caf">{nc.esc(pekoe.CAFFEINE_SAYS[pekoe.caffeine(item["what"])])}</p>'
    return (f'        <li class="{P}-dish">\n'
            f'          <h4 class="{P}-dish__name">{nc.esc(item["name"])}</h4>\n'
            f'          <p class="{P}-dish__mark">{nc.esc(mark(item))}</p>\n'
            f'          <p class="{P}-dish__what"><span class="sr">In it: </span>{nc.esc(item["what"])}</p>\n'
            f'          <p class="{P}-dish__has">{nc.esc(hgc.contains(item))}</p>{caf}\n'
            f'          <p class="{P}-dish__note">{nc.esc(item["note"])}</p>\n'
            '        </li>')


def menu(d):
    out = []
    for sec in d["menu"]:
        key = sec["key"]
        out.append(f'    <section class="{P}-board" aria-labelledby="{P}-{key}-h">')
        out.append(f'      <h3 id="{P}-{key}-h">{nc.esc(sec["section"])}</h3>')
        out.append(f'      <ul class="{P}-dishes">')
        for item in sec["items"]:
            out.append(item_card(item, bool(sec.get("drinks"))))
        out += ['      </ul>', '    </section>']
    return "\n".join(out)


def name_block(d):
    nm = d["name"]
    return (f'    <p>The name is the word for the dish everybody on Okinawa cooks. <strong>{nc.esc(nm["word"])} is '
            f'{nc.esc(nm["says"])}</strong>, and {nc.esc(nm["culture"])}, by <a href="{nc.attr(nm["source"])}">'
            f'{nc.esc(nm["source_name"])}</a>, read {nc.esc(nc.date_words(nm["read"]))}. The sign spells it the way '
            'it is most often written in English. A table where two shores&rsquo; cooking is mixed on one plate is '
            'what the word is for.</p>')


def ryan_block(d):
    paras = "".join(f"<p>{nc.esc(q)}</p>" for q in d["ryan"])
    return (f'    <blockquote class="{P}-ryan">{paras}</blockquote>\n'
            f'    <p class="{P}-who">Ryan Boren, whose table this is, in his brief for the room.</p>')


def kitchen_block(d):
    return f'    <p class="{P}-kitchen">{nc.esc(d["kitchen"])}</p>'


def rules_block(d):
    items = "\n".join(f"      <li>{nc.esc(r)}</li>" for r in d["rules"])
    return f'    <ul class="{P}-rules">\n{items}\n    </ul>'


RACK_SAYS = ("nobody here watched them first", "the channels’ own")


def month_block(m):
    return nc.month_block(m, P, SCREEN[0], SCREEN[1], "Both shores and in between: the latest month, newest first")


def check_month(m):
    nc.check_month(m, MONTHLY.name, problems)


def lane_svg():
    """The lane at noon, looking down it to the sea: on the left the whitewashed
    wall in full sun, with a door, a shutter and bougainvillea over its top; on
    the right the coral-stone wall in shade under its red-tiled eave, washed
    warm by the light the sunlit wall throws across; the paving in shade but for
    a strip of sun at the foot of the lit wall; and in front, the table, lit on
    the side that faces the sunlit wall, its shadow soft and falling away from
    it. No sun lands on the table. Nothing moves."""
    W, H = 1200, 440
    v = lambda n: f"var(--{P}-{n})"
    vx, top, bot = 640, 150, 262          # where the lane ends
    lx, rx = 600, 690                      # the far ends of the two walls

    def left_top(x):
        return 30 + (top - 30) * x / lx

    def left_bot(x):
        return H - (H - bot) * x / lx

    def right_top(x):
        return 60 + (top - 60) * (W - x) / (W - rx)

    def right_bot(x):
        return H - (H - bot) * (W - x) / (W - rx)

    o = [f'<svg class="{P}-lane__draw" viewBox="0 0 {W} {H}" aria-hidden="true" focusable="false">',
         f'<rect width="{W}" height="{H}" fill="{v("sky")}"/>']
    # The sea at the end of the lane, under the sky.
    o.append(f'<rect x="{lx}" y="{top + 40}" width="{rx - lx}" height="{bot - top - 40}" fill="{v("water")}"/>'
             f'<path d="M{lx} {top + 40} H{rx}" stroke="{v("sun")}" stroke-width="2"/>')
    # The paving, in shade, with its joints running to the end of the lane.
    o.append(f'<path d="M0 {H} L{lx} {bot} L{rx} {bot} L{W} {H} Z" fill="{v("shade")}"/>')
    for i in range(1, 12):
        x = i * W / 12
        o.append(f'<path d="M{x:.0f} {H} L{vx} {bot}" stroke="{v("shadow")}" stroke-width="1.2"/>')
    for y in (300, 336, 380):
        t = (y - bot) / (H - bot)
        o.append(f'<path d="M{lx - lx * t:.0f} {y} H{rx + (W - rx) * t:.0f}" stroke="{v("shadow")}" stroke-width="1.2"/>')
    # The strip of sun along the foot of the lit wall.
    o.append(f'<path d="M0 {H} L{lx} {bot} L{lx + 8} {bot} L70 {H} Z" fill="{v("sun")}"/>')
    # The left wall, whitewash in full sun.
    o.append(f'<path d="M0 0 V{H} L{lx} {bot} V{top} L0 30 Z" fill="{v("sun")}"/>'
             f'<path d="M0 30 L{lx} {top}" stroke="{v("line")}" stroke-width="1.4"/>')
    # Its door, painted sea-green, and a shutter up the wall.
    dx1, dx2 = 150, 235
    o.append(f'<path d="M{dx1} {left_bot(dx1):.0f} V{left_bot(dx1) - 170:.0f} Q{(dx1 + dx2) / 2} '
             f'{left_bot(dx1) - 205:.0f} {dx2} {left_bot(dx2) - 160:.0f} V{left_bot(dx2):.0f} Z" '
             f'fill="{v("door")}" stroke="{v("line")}" stroke-width="2"/>')
    sx1, sx2 = 380, 430
    o.append(f'<path d="M{sx1} {left_top(sx1) + 60:.0f} L{sx2} {left_top(sx2) + 60:.0f} V{left_top(sx2) + 118:.0f} '
             f'L{sx1} {left_top(sx1) + 122:.0f} Z" fill="{v("door")}" stroke="{v("line")}" stroke-width="2"/>'
             f'<path d="M{(sx1 + sx2) / 2:.0f} {left_top(sx1) + 61:.0f} V{left_top(sx1) + 120:.0f}" '
             f'stroke="{v("line")}" stroke-width="1.5"/>')
    # Bougainvillea over the top of the lit wall, spilling down it.
    # Each cluster is leaves first, then the papery bracts in threes over them,
    # so it reads as a flowering branch and not as a ball.
    for cx, dy, n in [(20, 6, 16), (96, 22, 14), (172, 22, 15), (250, 44, 12), (318, 58, 9), (52, 66, 9),
                      (204, 84, 7), (372, 76, 6)]:
        cy = left_top(cx) + dy
        for k in range(n):
            a = k * 2.399
            rr = 7 + 7.5 * k ** 0.5
            lx_, ly_ = cx + rr * 1.3 * math.cos(a), cy + rr * 0.8 * math.sin(a)
            o.append(f'<ellipse cx="{lx_:.0f}" cy="{ly_:.0f}" rx="12" ry="6" fill="{v("leaf")}" '
                     f'transform="rotate({(k * 47) % 180} {lx_:.0f} {ly_:.0f})"/>')
        for k in range(n):
            a = k * 2.399 + 1.1
            rr = 5 + 6.8 * k ** 0.5
            bx, by = cx + rr * 1.3 * math.cos(a), cy + rr * 0.8 * math.sin(a)
            for t in range(3):
                o.append(f'<ellipse cx="{bx:.0f}" cy="{by - 4:.0f}" rx="4.6" ry="7.4" fill="{v("flower")}" '
                         f'transform="rotate({t * 120 + k * 17} {bx:.0f} {by:.0f})"/>')
    # The right wall, coral stone in shade under its eave.
    o.append(f'<path d="M{W} 0 V{H} L{rx} {bot} V{top} L{W} 60 Z" fill="{v("coral")}"/>')
    # The warm light the lit wall throws across, laid over the stone.
    o.append(f'<path d="M{W} 60 V{H} L{rx} {bot} V{top} Z" fill="{v("bounce")}" opacity=".32"/>')
    for row in range(6):
        y0 = 90 + row * 52
        for col in range(5):
            x = rx + 40 + col * 100 + (row % 2) * 48
            if x > W:
                continue
            t = (x - rx) / (W - rx)
            ya = top + (y0 - top) * t
            o.append(f'<path d="M{x - 30 * t:.0f} {ya:.0f} q{30 * t:.0f} {-6 * t:.0f} {60 * t:.0f} 0" '
                     f'fill="none" stroke="{v("coral-dark")}" stroke-width="{1 + t:.1f}"/>')
    # The red-tiled eave along the top of the stone wall.
    o.append(f'<path d="M{W} 30 L{rx - 6} {top - 10} L{rx - 6} {top} L{W} 82 Z" fill="{v("tile")}"/>')
    for i in range(10):
        x = rx + (W - rx) * (i + 0.5) / 10
        o.append(f'<path d="M{x:.0f} {right_top(x) - 26 * (x - rx) / (W - rx) - 2:.0f} V{right_top(x) + 18 * (x - rx) / (W - rx):.0f}" '
                 f'stroke="{v("tile-dark")}" stroke-width="{1 + 2 * (x - rx) / (W - rx):.1f}"/>')
    o.append(f'<path d="M{W} 82 L{rx - 6} {top}" stroke="{v("tile-dark")}" stroke-width="2"/>')
    # The table in front, in the shade: its shadow soft and falling away from the
    # lit wall, the cloth lit on the side that faces it.
    o.append(f'<ellipse cx="1000" cy="414" rx="180" ry="20" fill="{v("shadow")}"/>')
    o.append(f'<path d="M790 330 Q790 396 800 404 H1080 Q1090 396 1090 330 Z" fill="{v("cloth")}" '
             f'stroke="{v("line")}" stroke-width="1.6"/>'
             f'<path d="M790 330 Q790 396 800 404 H826 Q814 396 814 330 Z" fill="{v("bounce")}" opacity=".55"/>'
             f'<ellipse cx="940" cy="330" rx="150" ry="30" fill="{v("cloth")}" stroke="{v("line")}" stroke-width="1.6"/>'
             f'<path d="M792 334 Q800 312 860 304" fill="none" stroke="{v("bounce")}" stroke-width="5" stroke-linecap="round"/>')
    # A chair on the near side, its lit face towards the wall across the lane.
    o.append(f'<path d="M700 300 V408 M760 300 V408 M700 352 H760" stroke="{v("line")}" stroke-width="5" stroke-linecap="round"/>'
             f'<path d="M694 300 H766" stroke="{v("bounce")}" stroke-width="6" stroke-linecap="round"/>'
             f'<path d="M700 300 V240 Q730 228 760 240 V300" fill="none" stroke="{v("line")}" stroke-width="5"/>')
    # Two plates and what is on them, the chopsticks on their rest, a fork, and a
    # glass of barley tea.
    o.append(f'<ellipse cx="880" cy="326" rx="46" ry="11" fill="{v("plate")}" stroke="{v("line")}" stroke-width="1.4"/>'
             f'<ellipse cx="866" cy="323" rx="11" ry="5" fill="{v("imo")}"/>'
             f'<ellipse cx="886" cy="321" rx="11" ry="5" fill="{v("imo")}"/>'
             f'<ellipse cx="900" cy="326" rx="10" ry="4" fill="{v("imo")}"/>'
             f'<ellipse cx="1000" cy="334" rx="46" ry="11" fill="{v("plate")}" stroke="{v("line")}" stroke-width="1.4"/>'
             f'<ellipse cx="992" cy="331" rx="20" ry="6" fill="{v("leaf")}"/>'
             f'<circle cx="1014" cy="330" r="6" fill="{v("tile")}"/>'
             f'<path d="M930 344 L972 338 M930 348 L972 342" stroke="{v("tile-dark")}" stroke-width="2.4" stroke-linecap="round"/>'
             f'<rect x="926" y="342" width="8" height="6" rx="2" fill="{v("line")}"/>'
             f'<path d="M1052 320 L1062 344" stroke="{v("line")}" stroke-width="2.4" stroke-linecap="round"/>'
             f'<path d="M940 296 L944 322 H962 L966 296 Z" fill="{v("bounce")}" stroke="{v("line")}" stroke-width="1.4"/>')
    o.append('</svg>')
    return "".join(o)


def liner(d):
    rows = [("The restaurant, its name and its menu", "Ryan Boren&rsquo;s brief of 2026-11-03; the name his "
             "choice from Claude&rsquo;s suggestions, and the dishes Claude&rsquo;s draft for him to cut"),
            ("What the name means", f'<a href="{nc.attr(d["name"]["source"])}">{nc.esc(d["name"]["source_name"])}</a>, '
             f'read {nc.esc(nc.date_words(d["name"]["read"]))}'),
            ("Every allergen line", 'Worked out by the same engine as <a href="hey-good-cookin.html">Hey, Good '
             'Cookin&rsquo;</a>, from what is in each dish'),
            ("Every drink&rsquo;s caffeine", 'Worked out by the same engine as <a href="pekoe-and-purrs.html">Pekoe '
             'and Purrs</a>'),
            ("Ryan&rsquo;s words", "His, from his brief, quoted as he wrote them"),
            ("The lane", "Ours, drawn by tools/make-champuru.py")]
    return ("\n".join(f'      <tr><td>{w}</td><td>{s}</td></tr>' for w, s in rows)
            + "\n" + nc.month_credit(json.loads(MONTHLY.read_text())))


def sweep_page():
    body = nc.page_body(PAGE, cut=(f"{P}:lane", f"{P}:month"))
    nc.sweep(body, PAGE.name, VOCAB, problems)
    src = PAGE.read_text()
    scripts = re.findall(r'<script src="([^"]+)"', src)
    if sorted(scripts) != sorted(["love.js", "love-embed.js", "rack.js", "quest.js"]):
        problems.refuse(f"the restaurant loads {scripts}; it loads love.js, love-embed.js, rack.js and "
                        "quest.js and nothing else.")
    said = nc.plain(src[src.index('id="chp-screen-h"'):src.index("<!-- chp:month:begin -->")]).lower()
    for w in RACK_SAYS:
        if w not in said:
            problems.refuse(f"the screen in the doorway no longer says {w!r} above the rack. Its titles are "
                            "the channels', and the room has to say so where they are.")
    ids = re.findall(r'\bid="([^"]+)"', src)
    dup = sorted({i for i in ids if ids.count(i) > 1})
    if dup:
        problems.refuse(f"ids with two owners on the page: {', '.join(dup)}")
    if re.search(r"<(?:form|input|textarea|select)\b", re.sub(r"<!-- quest:.*?:end -->", "", src, flags=re.S)):
        problems.refuse("the restaurant has a form in it. Nothing is ordered, sent or kept here.")
    css = CSS.read_text()
    sec = re.search(rf"/\* §{SECTION} ── ROOM: Champuru.*?(?=/\* §\d+ ── )", css, re.S)
    if not sec:
        problems.refuse(f"love.css has no §{SECTION} for Champuru before the next section.")
    elif re.search(r"@keyframes|\banimation\b|\btransition\b", re.sub(r"/\*.*?\*/", "", sec.group(0), flags=re.S)):
        problems.refuse(f"§{SECTION} moves something. Nothing in the lane moves at any setting.")


def main():
    d = json.loads(DATA.read_text())
    m = json.loads(MONTHLY.read_text())
    check(d)
    check_month(m)
    problems.stop("the data")
    if "--month" in sys.argv[1:]:
        # The morning timer: the rack and nothing else, so it never touches the
        # rest of the room or the liner notes.
        nc.swap(PAGE, f"{P}:month", month_block(m), "    ")
        print("champuru: the screen in the doorway's month redrawn")
        return
    nc.swap(PAGE, f"{P}:month", month_block(m), "    ")
    nc.swap(PAGE, f"{P}:lane", lane_svg(), "      ")
    nc.swap(PAGE, f"{P}:name", name_block(d), "    ")
    nc.swap(PAGE, f"{P}:ryan", ryan_block(d), "    ")
    nc.swap(PAGE, f"{P}:menu", menu(d), "    ")
    nc.swap(PAGE, f"{P}:kitchen", kitchen_block(d), "    ")
    nc.swap(PAGE, f"{P}:rules", rules_block(d), "    ")
    nc.swap(NOTES, f"{P}-credits", liner(d), "      ")
    sweep_page()
    problems.stop("the page as written")
    print("champuru: the lane, the name, Ryan's words, the menu, the kitchen's note, the house rules and the credits written")


if __name__ == "__main__":
    main()
