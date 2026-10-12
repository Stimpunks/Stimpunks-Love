#!/usr/bin/env python3
"""Build Wide-Spread Chaos Gardens out of data/wide-spread-chaos.json: the
garden on a windy day, what chaos gardening is, what is thrown, what the garden
gives, the screen in the seed shed and its rack, and the room's credits.

WHAT THE ROOM IS. Ryan Boren's brief, 2026-10-11: an ornamental and food garden
sown by chaos gardening, offering food, flowers, seeds and connection, east of
the stile.

THE WIND IS THE SUBJECT. It is a bright, clear, windy day, and everything in the
garden leans the same way: the stems, the heads, the grass, the seed in the air.
Nothing in it is in a row and nothing was placed by hand: the drawing is thrown,
like the seed, out of a fixed seed so every build draws the same garden, and the
plants lean by geometry rather than by a transform, so check-gentle.py has
nothing to take on trust. The page's ground is the clear sky the wind is
blowing across, and every word stands on it in a dark ink or on a plant label.

IT REFUSES, and writes nothing when it does:

  · A NOXIOUS WEED IN THE MIX. Colorado State University Extension's fact sheet
    on wildflowers names four to keep out of a seed mix, and the friendly edit
    is a pretty daisy that is one of them.
  · A LATIN NAME, by the herbarium's shape test (one capitalised word and a
    lowercase one), with a short PLAIN list for the plain names that look like
    that. A name typed from memory reads as a determination.
  · A CLAIM OF NATIVENESS IN OUR VOICE. The mix is checked against the noxious-
    weed advice and that is the claim; where each plant is native is not
    something this page asserts.
  · A FOOD THE CAFÉ SAYS COMES FROM HERE THAT THE MIX DOES NOT HAVE, which
    make-the-dairy.py checks from its side too.
  · AN OFFERING OF THE BRIEF'S LEFT OUT, a quotation over the cap, a tally, the
    picked rack's rules, and a script of its own.

THE TITLES ON THE RACK ARE THE CHANNELS' AND ARE NOT SWEPT.
"""
import json
import math
import random
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import natures as nc  # noqa: E402

ROOT = nc.ROOT
DATA = ROOT / "data/wide-spread-chaos.json"
PAGE = ROOT / "wide-spread-chaos.html"
NOTES = ROOT / "liner-notes.html"
P = "wsc"
SCREEN = ("wsc", "the screen in the seed shed")
SHAPE = re.compile(r"\b([A-Z][a-z]+) ([a-z]{3,})\b")
PLAIN = {"bee", "poppies"}
NATIVE = r"native to|is native|are native|natives?\b"
VOCAB = [(NATIVE, "a claim about where a plant is native. The mix is checked against Colorado's noxious-weed "
                  "advice; nativeness is not this page's to assert."),
         (nc.TALLY, "a tally. Nothing here is counted, and no flower is ranked against another.")]

problems = nc.Problems()


def check(d):
    refused = [w.lower() for w in d.get("refused_seed") or []]
    if len(refused) < 4:
        problems.refuse("the list of noxious weeds to keep out of the mix is not CSU's four.")
    for m in d.get("mix") or []:
        n = m.get("name") or ""
        if any(w in n.lower() for w in refused):
            problems.refuse(f"{n!r} is in the mix, and Colorado State University Extension says to keep it out of "
                            "seed mixes as a noxious weed.")
        for a, b in SHAPE.findall(n):
            if b not in PLAIN:
                problems.refuse(f"{n!r}: {a} {b!r} looks like a Latin name. Plain names only.")
    eats = {m["name"] for m in d.get("mix") or [] if m.get("eat")}
    dairy = json.loads((ROOT / "data/the-dairy.json").read_text())
    for x in dairy.get("pantry") or []:
        if x.get("from") == "wide-spread-chaos" and x["what"] not in eats:
            problems.refuse(f"the café says {x['what']!r} comes from the chaos gardens, and the mix has no such food.")
    have = {g.get("what") for g in d.get("gives") or []}
    for w in ("food", "flowers", "seeds", "connection"):
        if w not in have:
            problems.refuse(f"the brief says the garden offers {w}, and nothing here does.")
    cap = d.get("quote_cap") or 0
    for q in d.get("quotes") or []:
        if q.get("source") not in (d.get("sources") or {}):
            problems.refuse(f"quotation {q.get('key')!r} has no source here.")
        if len(q.get("said", "").split()) > cap:
            problems.refuse(f"quotation {q.get('key')!r} is over the cap of {cap} words.")
    for g in d.get("gives") or []:
        nc.sweep(g.get("how", ""), f"gives {g.get('what')}", VOCAB, problems)
    nc.check_picks(d.get("videos"), "the rack", problems, need=4)


# ── The garden on a windy day ────────────────────────────────────────────────

def v(name):
    return f"var(--{P}-{name})"


WIND = 0.32      # how far a stem leans, per unit of its height, all the same way


def stem(x, base, h):
    """A stem leaning with the wind: its top displaced downwind by its height,
    curved so the lean is in the upper part, as wind bends a stem."""
    tx, ty = x + h * WIND, base - h * math.cos(WIND)
    return (tx, ty, f'<path d="M{x:.1f} {base} Q{x + h * .05:.1f} {base - h * .6:.1f} {tx:.1f} {ty:.1f}" '
                    f'stroke="{v("stem")}" stroke-width="{1.4 + h / 90:.1f}" fill="none" stroke-linecap="round"/>')


def bloom(kind, x, y, s, ink):
    if kind == "daisy":
        petals = "".join(f'<ellipse cx="{x + math.cos(a) * 6 * s:.1f}" cy="{y + math.sin(a) * 6 * s:.1f}" '
                         f'rx="{4.4 * s:.1f}" ry="{2.2 * s:.1f}" transform="rotate({math.degrees(a):.0f} '
                         f'{x + math.cos(a) * 6 * s:.1f} {y + math.sin(a) * 6 * s:.1f})" fill="{ink}"/>'
                         for a in [i * math.pi / 5 for i in range(10)])
        return petals + f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{3.2 * s:.1f}" fill="{v("eye")}"/>'
    if kind == "cup":
        return (f'<path d="M{x - 6 * s:.1f} {y - 2 * s:.1f} Q{x:.1f} {y + 9 * s:.1f} {x + 6 * s:.1f} {y - 2 * s:.1f} '
                f'Q{x + 2 * s:.1f} {y - 7 * s:.1f} {x:.1f} {y - 3 * s:.1f} Q{x - 2 * s:.1f} {y - 7 * s:.1f} {x - 6 * s:.1f} {y - 2 * s:.1f} Z" fill="{ink}"/>')
    if kind == "spike":
        return "".join(f'<circle cx="{x + i * WIND * 3 * s:.1f}" cy="{y - i * 4 * s:.1f}" r="{2.6 * s:.1f}" fill="{ink}"/>'
                       for i in range(5))
    if kind == "ball":
        return f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{5 * s:.1f}" fill="{ink}"/>'
    return (f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{7 * s:.1f}" fill="{ink}"/>'
            f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{3 * s:.1f}" fill="{v("eye")}"/>')


def view_svg():
    W, H, TOP = 1200, 470, 160    # the sky above TOP is clear and is not drawn
    rnd = random.Random(20261011)
    out = [f'<svg class="{P}-view__draw" viewBox="0 {TOP} {W} {H - TOP}" aria-hidden="true" focusable="false">',
           f'<rect y="{TOP}" width="{W}" height="{H - TOP}" fill="{v("sky")}"/>',
           f'<path d="M0 300 C 300 286, 700 306, 1200 292 L1200 {H} L0 {H} Z" fill="{v("ground")}"/>']
    inks = [v("red"), v("orange"), v("yellow"), v("pink"), v("blue"), v("violet"), v("white")]
    kinds = ["daisy", "cup", "spike", "ball", "round"]
    plants = []
    for _ in range(260):
        x = rnd.uniform(-40, W)
        base = rnd.uniform(300, H + 10)
        depth = (base - 300) / (H - 300)
        h = rnd.uniform(40, 120) * (0.5 + depth)
        plants.append((base, x, h, rnd.choice(kinds), rnd.choice(inks), 0.6 + depth * 0.9))
    # Grass first, then the plants from the back to the front.
    for _ in range(320):
        x, base = rnd.uniform(-20, W), rnd.uniform(300, H + 10)
        h = rnd.uniform(14, 40) * (0.6 + (base - 300) / 170)
        out.append(f'<path d="M{x:.1f} {base:.1f} q{h * .1:.1f} {-h * .6:.1f} {h * WIND * 1.6:.1f} {-h:.1f}" '
                   f'stroke="{v("grass")}" stroke-width="1.4" fill="none"/>')
    for base, x, h, kind, ink, s in sorted(plants):
        tx, ty, path = stem(x, base, h)
        out.append(path)
        if rnd.random() < .5:
            lx, ly = x + h * WIND * .45, base - h * .45
            out.append(f'<ellipse cx="{lx + 6:.1f}" cy="{ly:.1f}" rx="{8 * s:.1f}" ry="{3 * s:.1f}" fill="{v("leaf")}" '
                       f'transform="rotate(-18 {lx + 6:.1f} {ly:.1f})"/>')
        out.append(bloom(kind, tx, ty, s, ink))
    # Seed in the air, all going the same way.
    for _ in range(40):
        x, y = rnd.uniform(0, W), rnd.uniform(TOP + 16, 290)
        out.append(f'<path d="M{x:.1f} {y:.1f} l10 -3" stroke="{v("fluff")}" stroke-width="1.2"/>'
                   f'<circle cx="{x + 11:.1f}" cy="{y - 3.2:.1f}" r="2.6" fill="none" stroke="{v("fluff")}" stroke-width="1"/>')
    out.append('</svg>')
    return "".join(out)


# ── The words ────────────────────────────────────────────────────────────────

def link(d, key):
    s = d["sources"][key]
    return f'<a href="{nc.attr(s["url"])}">{nc.esc(s["cite"])}</a>'


def quote(d, q):
    return (f'    <blockquote class="{P}-quote">\n'
            f'      <p>{nc.esc(q["said"])}</p>\n'
            f'      <footer>{link(d, q["source"])}.</footer>\n'
            '    </blockquote>')


def mix(d):
    eat = [m["name"] for m in d["mix"] if m.get("eat")]
    flower = [m["name"] for m in d["mix"] if not m.get("eat")]
    out = [f'    <div class="{P}-labels">',
           f'      <div class="{P}-label"><h3>To eat</h3><p>{nc.esc(nc.listify(eat))}.</p></div>',
           f'      <div class="{P}-label"><h3>To flower</h3><p>{nc.esc(nc.listify(flower))}.</p></div>',
           f'      <div class="{P}-label {P}-label--never"><h3>Never in the mix</h3><p>{nc.esc(nc.listify(d["refused_seed"]))}, '
           f'the four noxious weeds {link(d, "csu")} says to keep out of a seed mix.</p></div>',
           '    </div>']
    return "\n".join(out)


def gives(d):
    out = [f'    <dl class="{P}-gives">']
    for g in d["gives"]:
        out.append(f'      <div><dt>{nc.esc(g["what"][:1].upper() + g["what"][1:])}</dt><dd>{nc.esc(g["how"])}</dd></div>')
    out.append('    </dl>')
    return "\n".join(out)


def liner(d):
    rows = [("The garden, and what it gives", "Ryan Boren&rsquo;s brief of 2026-10-11"),
            ("The garden on a windy day", "Ours, thrown by tools/make-wide-spread-chaos.py out of a fixed seed")]
    for k, s in d["sources"].items():
        rows.append((nc.esc(s["cite"]), f'<a href="{nc.attr(s["url"])}">{nc.esc(s["url"])}</a>, {nc.esc(s["read"])}'))
    rows.append(("The films on the rack", nc.picks_credit(d["videos"], "Claude&rsquo;s picks, put up at Ryan&rsquo;s ask",
                                                          "2026-10-11")))
    return "\n".join(f'      <tr><td>{w}</td><td>{s}</td></tr>' for w, s in rows)


def sweep_page():
    body = nc.page_body(PAGE, cut=("wsc:view", "wsc:rack", "wsc:mix"))
    nc.sweep(body, PAGE.name, VOCAB, problems)
    src = PAGE.read_text()
    scripts = re.findall(r'<script src="([^"]+)"', src)
    if sorted(scripts) != sorted(["love.js", "love-embed.js", "rack.js", "quest.js"]):
        problems.refuse(f"the room loads {scripts}; it loads love.js, love-embed.js, rack.js and quest.js only.")
    ids = re.findall(r'\bid="([^"]+)"', src)
    dup = sorted({i for i in ids if ids.count(i) > 1})
    if dup:
        problems.refuse(f"ids with two owners on the page: {', '.join(dup)}")


def main():
    d = json.loads(DATA.read_text())
    check(d)
    problems.stop("the data")
    nc.swap(PAGE, "wsc:view", view_svg(), "      ")
    for q in d["quotes"]:
        nc.swap(PAGE, f"wsc:quote:{q['key']}", quote(d, q), "    ")
    nc.swap(PAGE, "wsc:mix", mix(d), "    ")
    nc.swap(PAGE, "wsc:gives", gives(d), "    ")
    nc.swap(PAGE, "wsc:screen", nc.screen_block(P, SCREEN[0], SCREEN[1],
                                                "<b>The screen in the seed shed.</b> Nothing is on it. Any film on the rack "
                                                "can go up here with the button under it, and nothing loads until you "
                                                "press one."), "")
    nc.swap(PAGE, "wsc:rack", nc.picks_block(d["videos"], P, SCREEN[0], SCREEN[1],
                                             "The rack: chaos gardens, meadows from seed, and plants that sow themselves",
                                             "Films about chaos gardening"), "")
    nc.swap(NOTES, "wsc-credits", liner(d), "      ")
    sweep_page()
    problems.stop("the page as written")
    print("wide-spread chaos: the garden in the wind, what is thrown, what it gives, the screen and the rack written")


if __name__ == "__main__":
    main()
