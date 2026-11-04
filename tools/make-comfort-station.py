#!/usr/bin/env python3
"""Build The Comfort Station, one of the street's public restrooms, out of
data/comfort-station.json and data/restrooms.json: the hall drawn from the
foot of the steps, the lede, the light, what every stall has (the shared list,
with the room's own sentence for how it does each thing), the words on the
wall, the house rules and the credits, here and in the liner notes.

WHAT THE ROOM IS. Ryan Boren's brief, 2026-11-03: public restrooms on Danny the
Street, each a room with a name and a theme. This one is a comfort station of
the old municipal kind, the American city's public restroom of a hundred years
ago: down a flight of steps from a path through a park, with a lift beside the
steps, a long hall of white glazed tile, a terrazzo floor, brass rails and a
row of oak doors.

THE LIGHT IS DAYLIGHT THROUGH THE PAVEMENT. Vault lights, round glass prisms
set in an iron grid in the path overhead, bend the day down into the hall, so
the ceiling is a grid of small lit points and the light lies on the floor in a
grid of dots. The glass has gone faintly violet with age. The prisms make dots
and never spectra: the Dopamine Dress-Up Den's rainbows are on its wall, not
here. The collisions are in love.css's §138.

IT REFUSES, and writes nothing when it does:

  · A ROOM THAT LEAVES ONE OF THE LIST OUT, or says how it does one in words
    that break the list's promises: tools/restrooms.py's check_room and sweep.
    Every stall is for everybody, nothing is to pay, there is no air dryer, the
    street's restrooms are never counted, and no stall is set apart.
  · A QUOTATION not word for word on its page in the mirror (check_quotes).
  · A TALLY in the room's own words: nobody who comes down is counted.
  · ANYTHING MOVING in §138, a script but love.js and quest.js, a form outside
    the job marker, and an id with two owners.
  · A MISSING MARKER PAIR.
"""
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import restrooms as rr  # noqa: E402

ROOT = rr.ROOT
DATA = ROOT / "data/comfort-station.json"
PAGE = ROOT / "comfort-station.html"
NOTES = ROOT / "liner-notes.html"
CSS = ROOT / "love.css"
P = "cst"
SECTION = 138
TALLY = (r"\b(?:leaderboards?|streaks?|scores?|tall(?:y|ies)|tallied|headcount|footfall|"
         r"visitors? (?:a|per) (?:day|week)|counted)\b")
NEGATION = rr.NEGATION

problems = rr.Problems()


def own_words(d):
    """Every sentence of the room's own, for the sweeps."""
    yield "the lede", d["lede"]
    yield "the hall in words", d["hall"]
    for i, t in enumerate(d["light"]):
        yield f"the light, paragraph {i + 1}", t
    for i, t in enumerate(d["rules"]):
        yield f"house rule {i + 1}", t


def check(d):
    rr.check_room(d, DATA.name, problems)
    rr.check_quotes(problems)
    keys = {q["key"] for q in rr.shared()["quotes"]}
    for k in d.get("quotes") or []:
        if k not in keys:
            problems.refuse(f"{DATA.name}: quotation {k!r} is not in data/restrooms.json; quotations come only from there.")
    for where, text in own_words(d):
        rr.sweep(text, where, problems)
        for m in re.finditer(TALLY, rr.plain(text), re.I):
            before = rr.plain(text)[max(0, m.start() - 70):m.start()]
            if not re.search(r"\b" + NEGATION + r"\b", re.split(r"[.!?;:]\s", before)[-1], re.I):
                problems.refuse(f"{where}: {m.group(0)!r} counts somebody; nothing down here is counted.")
    if not any("stallbatting" in r for r in d["rules"]):
        problems.refuse("the house rules no longer name stallbatting, the word a young Stimpunk coined for what "
                        "every restroom on the street is built against.")


def hall_svg():
    """The hall from the foot of the steps, drawn straight on: the steps and the
    lift going up on the left to the opening in the path; the ceiling a grid of
    vault-light prisms, each a lit point; white tile with its green band; the
    basins under one long mirror, the step folded away under the lowest; the
    naloxone cabinet; a long bench with cushions; and the row of oak doors, each
    with its brass plate saying FREE or IN USE. The light lies on the terrazzo
    in a grid of dots. Nothing moves."""
    W, H = 1200, 420
    v = lambda n: f"var(--{P}-{n})"
    ceil, floor = 64, 340
    o = [f'<svg class="{P}-hall__draw" viewBox="0 0 {W} {H}" aria-hidden="true" focusable="false">',
         f'<rect width="{W}" height="{H}" fill="{v("tile")}"/>']
    # The tile: grout every course, joints staggered like brick.
    for y in range(ceil + 10, floor, 14):
        o.append(f'<path d="M0 {y} H{W}" stroke="{v("grout")}" stroke-width="1"/>')
        off = 0 if ((y - ceil) // 14) % 2 else 21
        for x in range(off, W, 42):
            o.append(f'<path d="M{x} {y} V{min(y + 14, floor)}" stroke="{v("grout")}" stroke-width="1"/>')
    # The green band at the height of a hand, and the cove under the ceiling.
    o.append(f'<rect x="0" y="222" width="{W}" height="12" fill="{v("trim")}"/>'
             f'<rect x="0" y="{ceil}" width="{W}" height="8" fill="{v("trim")}"/>')
    # The ceiling: an iron grid of glass prisms, each a lit point, and on the
    # left the opening in the path where the steps come down into the day.
    o.append(f'<rect x="0" y="0" width="{W}" height="{ceil}" fill="{v("iron")}"/>'
             f'<rect x="0" y="0" width="150" height="{ceil}" fill="{v("daylight")}"/>')
    for row, y in enumerate((18, 44)):
        for x in range(170 + row * 20, W, 40):
            o.append(f'<circle cx="{x}" cy="{y}" r="9" fill="{v("prism")}"/>'
                     f'<circle cx="{x}" cy="{y}" r="4" fill="{v("glow")}"/>')
    # The steps going up on the left, with their brass rail, to the day.
    steps = []
    for i in range(9):
        x0, y0 = 40 + i * 13, floor - i * 30
        steps.append(f"L{x0} {y0} L{x0 + 13} {y0}")
    o.append(f'<path d="M0 {floor} L40 {floor} {" ".join(steps)} L{40 + 9 * 13} 0 L0 0 Z" fill="{v("terrazzo")}" '
             f'stroke="{v("ink")}" stroke-width="2" stroke-linejoin="round"/>')
    o.append(f'<path d="M20 {floor - 70} L{40 + 9 * 13 + 10} {floor - 340}" stroke="{v("brass")}" stroke-width="5" stroke-linecap="round"/>')
    # The lift beside the steps: brass doors and the big button.
    o.append(f'<rect x="178" y="150" width="78" height="{floor - 150}" fill="{v("brass")}" stroke="{v("ink")}" stroke-width="2"/>'
             f'<path d="M217 150 V{floor}" stroke="{v("ink")}" stroke-width="2"/>'
             f'<rect x="168" y="126" width="98" height="20" fill="{v("trim")}" stroke="{v("ink")}" stroke-width="2"/>'
             f'<text x="217" y="141" text-anchor="middle" class="{P}-hall__plate" fill="{v("glow")}">LIFT</text>'
             f'<circle cx="270" cy="250" r="8" fill="{v("brass")}" stroke="{v("ink")}" stroke-width="2"/>')
    # The naloxone cabinet, glass-fronted and never locked.
    o.append(f'<rect x="292" y="148" width="46" height="58" fill="{v("glow")}" stroke="{v("brass")}" stroke-width="4"/>'
             f'<rect x="299" y="160" width="32" height="10" fill="{v("trim")}"/>'
             f'<rect x="304" y="178" width="22" height="20" rx="4" fill="{v("panel")}" stroke="{v("ink")}" stroke-width="1.5"/>')
    # The basins under one long mirror, with towel boxes and soap, and the step
    # folded away under the lowest basin.
    o.append(f'<rect x="360" y="96" width="290" height="108" fill="{v("glow")}" stroke="{v("brass")}" stroke-width="4"/>')
    for i, x in enumerate((382, 462, 542)):
        low = i == 0
        top = 252 if low else 238
        o.append(f'<path d="M{x} {top} H{x + 76} Q{x + 72} {top + 22} {x + 38} {top + 24} Q{x + 4} {top + 22} {x} {top} Z" '
                 f'fill="{v("glow")}" stroke="{v("ink")}" stroke-width="2"/>'
                 f'<rect x="{x + 32}" y="{top + 22}" width="12" height="{floor - top - 22}" fill="{v("glow")}" stroke="{v("ink")}" stroke-width="2"/>'
                 f'<path d="M{x + 38} {top - 4} V{top - 18} H{x + 50}" fill="none" stroke="{v("brass")}" stroke-width="4" stroke-linecap="round"/>')
        if low:
            o.append(f'<rect x="{x + 50}" y="{floor - 52}" width="8" height="50" fill="{v("brass")}" stroke="{v("ink")}" stroke-width="1.5"/>')
    o.append(f'<rect x="628" y="200" width="20" height="30" fill="{v("oak")}" stroke="{v("ink")}" stroke-width="1.5"/>')
    # The long bench with its cushions, under the brightest dots.
    o.append(f'<rect x="672" y="286" width="190" height="12" fill="{v("oak")}" stroke="{v("ink")}" stroke-width="2"/>'
             f'<rect x="680" y="298" width="10" height="{floor - 298}" fill="{v("oak")}" stroke="{v("ink")}" stroke-width="1.5"/>'
             f'<rect x="844" y="298" width="10" height="{floor - 298}" fill="{v("oak")}" stroke="{v("ink")}" stroke-width="1.5"/>')
    for x in (680, 742, 804):
        o.append(f'<rect x="{x}" y="270" width="54" height="18" rx="7" fill="{v("prism")}" stroke="{v("ink")}" stroke-width="1.5"/>')
    # The row of oak doors, each floor to ceiling, each with its brass plate:
    # FREE on green, IN USE on red, in words as well as colour.
    for i, x in enumerate(range(890, W - 10, 76)):
        used = i in (1, 3)
        o.append(f'<rect x="{x}" y="{ceil + 8}" width="70" height="{floor - ceil - 8}" fill="{v("oak")}" stroke="{v("ink")}" stroke-width="2"/>'
                 f'<rect x="{x + 8}" y="150" width="54" height="80" fill="none" stroke="{v("ink")}" stroke-width="1.2"/>'
                 f'<rect x="{x + 8}" y="246" width="54" height="80" fill="none" stroke="{v("ink")}" stroke-width="1.2"/>'
                 f'<circle cx="{x + 58}" cy="238" r="4" fill="{v("brass")}"/>'
                 f'<rect x="{x + 7}" y="92" width="56" height="20" rx="3" fill="{v("inuse" if used else "trim")}" '
                 f'stroke="{v("brass")}" stroke-width="2.5"/>'
                 f'<text x="{x + 35}" y="106.5" text-anchor="middle" class="{P}-hall__plate" fill="{v("glow")}">'
                 f'{"IN USE" if used else "FREE"}</text>')
    # The terrazzo, with its chips, and the daylight lying on it in a grid of
    # dots, brightest under the bench.
    o.append(f'<rect x="0" y="{floor}" width="{W}" height="{H - floor}" fill="{v("terrazzo")}"/>'
             f'<path d="M0 {floor} H{W}" stroke="{v("ink")}" stroke-width="2"/>')
    chips = ("chip-1", "chip-2", "chip-3")
    for k in range(240):
        x = (k * 397) % W
        y = floor + 6 + (k * 131) % (H - floor - 10)
        o.append(f'<circle cx="{x}" cy="{y}" r="{1.4 + (k % 3) * 0.6:.1f}" fill="{v(chips[k % 3])}"/>')
    for row, y in enumerate((360, 386, 410)):
        for x in range(180 + row * 14, W, 40):
            near = abs(x - 767) < 140
            rx = 12 if near else 8
            o.append(f'<ellipse cx="{x}" cy="{y}" rx="{rx + row * 2}" ry="{3 + row}" fill="{v("glow")}"/>')
    o.append('</svg>')
    return "".join(o)


def lede_block(d):
    return f'  <p class="{P}-lede">{d["lede"]}</p>'


def hall_words(d):
    return f'    <p class="{P}-hall__words">{rr.esc(d["hall"])}</p>'


def light_block(d):
    return "\n".join(f"    <p>{rr.esc(t)}</p>" for t in d["light"])


def rules_block(d):
    items = "\n".join(f"      <li>{rr.esc(r)}</li>" for r in d["rules"])
    return f'    <ul class="{P}-rules">\n{items}\n    </ul>'


def credits_block():
    return "\n".join([
        f'    <ul class="{P}-credits">',
        f"      <li>{rr.credits_line()}</li>",
        "      <li><strong>The hall is ours</strong>, drawn as code by Claude, an AI model made by Anthropic, and the comfort "
        "station is no real one: every word about how it does each thing is this room&rsquo;s own.</li>",
        "      <li><strong>Every quotation belongs to whoever wrote it</strong> and is credited where it stands, and each was "
        "read on one of our own pages and checked there word for word.</li>",
        "      <li>The type is <strong>Newsreader</strong>, by Production Type, for the name and the headings, and "
        "<strong>Atkinson Hyperlegible Next</strong>, by the Braille Institute with Applied Design Works, Elliott Scott, "
        "Megan Eiswerth and Letters From Sweden, drawn to be easy to tell letter from letter, for everything you read and "
        "every sign; both under the SIL Open Font License.</li>",
        "    </ul>"])


def liner():
    rows = [("The restroom, its name and its theme", "Ryan Boren&rsquo;s brief of 2026-11-03, and Claude&rsquo;s "
             "drawing of it"),
            ("What every restroom on the street has", "data/restrooms.json, from Ryan&rsquo;s brief, our "
             '<a href="https://stimpunks.org/access/bathrooms/">Bathroom Access</a> page and '
             '<a href="https://stepnwash.com/blogs/news/public-restroom-design">Step &rsquo;n Wash&rsquo;s writing on '
             "restroom design</a>"),
            ("Stallbatting", 'Coined by a young Stimpunk, a baseball fan, on our '
             '<a href="https://stimpunks.org/access/bathrooms/">Bathroom Access</a> page'),
            ("Naloxone, condoms and tampons", 'Shawna Potter&rsquo;s <i>Making Spaces Safer</i>, quoted on our '
             '<a href="https://stimpunks.org/access/making-spaces-safer/">Making Spaces Safer</a> page'),
            ("Step &rsquo;n Wash", "Its maker&rsquo;s trade mark, and the step at the basins is theirs"),
            ("The hall", "Ours, drawn by tools/make-comfort-station.py")]
    return "\n".join(f"      <tr><td>{w}</td><td>{s}</td></tr>" for w, s in rows)


def sweep_page():
    src = PAGE.read_text()
    body = src[src.index("<main"):src.index("</main>")]
    body = re.sub(r"<!-- quest:.*?:end -->", "", body, flags=re.S)
    body = re.sub(r"<blockquote.*?</blockquote>", "", body, flags=re.S)
    body = re.sub(rf'<p class="{P}-has__line">.*?</p>', "", body, flags=re.S)
    body = re.sub(r"<svg.*?</svg>", "", body, flags=re.S)
    rr.sweep(body, PAGE.name, problems)
    scripts = re.findall(r'<script src="([^"]+)"', src)
    if sorted(scripts) != ["love.js", "quest.js"]:
        problems.refuse(f"the comfort station loads {scripts}; it loads love.js and quest.js and nothing else.")
    ids = re.findall(r'\bid="([^"]+)"', src)
    dup = sorted({i for i in ids if ids.count(i) > 1})
    if dup:
        problems.refuse(f"ids with two owners on the page: {', '.join(dup)}")
    if re.search(r"<(?:form|input|textarea|select)\b", re.sub(r"<!-- quest:.*?:end -->", "", src, flags=re.S)):
        problems.refuse("the comfort station has a form in it. Nothing is asked for or kept here.")
    css = CSS.read_text()
    sec = re.search(rf"/\* §{SECTION} ── ROOM: The Comfort Station.*?(?=/\* §\d+ ── )", css, re.S)
    if not sec:
        problems.refuse(f"love.css has no §{SECTION} for The Comfort Station before the next section.")
    elif re.search(r"@keyframes|\banimation\b|\btransition\b", re.sub(r"/\*.*?\*/", "", sec.group(0), flags=re.S)):
        problems.refuse(f"§{SECTION} moves something. Nothing down the steps moves at any setting.")
    elif re.search(r"#[0-9a-fA-F]{3,8}\b|\b(?:rgb|hsl)a?\(", re.sub(r"/\*.*?\*/", "", sec.group(0), flags=re.S)):
        problems.refuse(f"§{SECTION} writes a colour in itself; every colour is a --{P}- one, by name.")


def main():
    d = json.loads(DATA.read_text())
    check(d)
    problems.stop("the data")
    rr.swap(PAGE, f"{P}:lede", lede_block(d), problems)
    rr.swap(PAGE, f"{P}:hall", "      " + hall_svg(), problems)
    rr.swap(PAGE, f"{P}:hall-words", hall_words(d), problems)
    rr.swap(PAGE, f"{P}:light", light_block(d), problems)
    rr.swap(PAGE, f"{P}:has", rr.amenities_block(d, P), problems)
    rr.swap(PAGE, f"{P}:quotes", rr.quotes_block(d["quotes"], P), problems)
    rr.swap(PAGE, f"{P}:rules", rules_block(d), problems)
    rr.swap(PAGE, f"{P}:credits", credits_block(), problems)
    rr.swap(NOTES, f"{P}-credits", liner(), problems)
    problems.stop("the markers")
    sweep_page()
    problems.stop("the page as written")
    print("comfort station: the hall, the lede, the light, what every stall has, the words on the wall, "
          "the house rules and the credits written")


if __name__ == "__main__":
    main()
