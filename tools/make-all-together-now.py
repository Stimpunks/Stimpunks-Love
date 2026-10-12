#!/usr/bin/env python3
"""Build All Together Now Farms out of data/all-together-now.json and
data/all-together-now-month.json: the farm in its two lights, mixed farming,
the five agroforestry practices, the Three Sisters, the animals and the crops,
the milk, the screen in the barn with its two racks, and the room's credits.

WHAT THE ROOM IS. Ryan Boren's brief, 2026-10-11: mixed farming and
agroforestry, the Three Sisters, sheep, goats and chickens, and everything the
farm grows going to a café in its old dairy (the-dairy.html) and a shopfront on
the street (the-honesty-box.html), pasteurised and lawful, no raw milk, with a
rack of films and the latest month of Farming While Beige.

THE LIGHT IS TWO LIGHTS AT ONCE. The sun is going down on one side of the farm
and the full moon is coming up on the other, both on the horizon together, so
everything on the farm is lit warm on its west side and silver on its east:
the barn, every tree, every sheep. All together now. The page's sky runs from
the sun's colour to the moon's across its width, on the body's ::before, and
every block of words stands on a flat card of its own or in ink dark enough for
every colour the sky passes through, because a gradient is not a ground anybody
can measure. No other room on the street is lit from two sides by two different
lights; the collisions are in love.css's section for the farm.

IT REFUSES, and writes nothing when it does:

  · RAW MILK, anywhere in our voice, except in a sentence refusing it. The
    milk here is pasteurised, the CDC says why and Colorado's law says retail
    raw milk is not allowed, and the friendly edit is "farm-fresh raw milk".
  · THE THREE SISTERS RETOLD. The planting is described in our own words and
    credited to the Haudenosaunee sources that describe it; the story belongs
    to the nations that tell it, and its figures' names are refused here,
    Swaying Sweetgrass's rule that nothing on a page of ours teaches what is
    somebody else's to teach.
  · AN AGROFORESTRY PRACTICE MISSING, OUT OF THE USDA'S ORDER, OR WITHOUT A
    LINE SAYING WHETHER THIS FARM DOES IT. A practice the farm does not do says
    so, rather than being left off to make the farm look complete.
  · A QUOTATION OVER THE CAP, OR WITHOUT ITS SOURCE. The Animal paper is
    copyrighted and quoted briefly with its credit; the USDA's and the CDC's
    pages and Colorado's statute are public.
  · A TALLY, the picked rack's rules, the month rack's rules, and a script of
    its own.

`--month` redraws only the month rack, for tools/daily-farm.sh on the morning
timer. THE TITLES ON BOTH RACKS ARE THE CHANNELS' AND ARE NOT SWEPT.
"""
import json
import math
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import natures as nc  # noqa: E402

ROOT = nc.ROOT
DATA = ROOT / "data/all-together-now.json"
MONTHLY = ROOT / "data/all-together-now-month.json"
PAGE = ROOT / "all-together-now.html"
NOTES = ROOT / "liner-notes.html"
P = "atn"
SCREEN = ("atn", "the screen in the barn")
USDA_ORDER = ["windbreaks", "riparian forest buffers", "alley cropping", "silvopasture", "forest farming"]
RAW = r"raw milk|unpasteuri[sz]ed|raw cheese|straight from the (?:cow|goat|sheep)"
LEGEND = r"Good Twin|Sky Woman|Handsome Lake|Sky World|once upon a time|the legend (?:says|tells)"
VOCAB = [(RAW, "raw milk. Everything from the dairy here is pasteurised, which the CDC says is crucial for milk "
               "safety and Colorado's law requires for anything sold."),
         (LEGEND, "the Three Sisters retold. The story belongs to the nations that tell it; this page credits them "
                  "and links to them, and tells only how the farm plants."),
         (nc.TALLY, "a tally. Nothing on the farm is counted or ranked.")]

problems = nc.Problems()


def check(d):
    src = d.get("sources") or {}
    for k, s in src.items():
        for f in ("cite", "short", "url", "read"):
            if not s.get(f):
                problems.refuse(f"source {k!r} has no {f}.")
    cap = d.get("quote_cap") or 0
    for q in d.get("quotes") or []:
        if q.get("source") not in src:
            problems.refuse(f"quotation {q.get('key')!r} comes from {q.get('source')!r}, which is not a source here.")
        if len(q.get("said", "").split()) > cap:
            problems.refuse(f"quotation {q.get('key')!r} is over the cap of {cap} words.")
    names = [p.get("name") for p in d.get("practices") or []]
    if names != USDA_ORDER:
        problems.refuse(f"the practices are {names}; they are the USDA's five, in its order: {USDA_ORDER}.")
    for p in d.get("practices") or []:
        if not (p.get("usda") and p.get("here")):
            problems.refuse(f"practice {p.get('name')!r} has no USDA definition or no line saying what the farm does.")
        nc.sweep(p.get("here", ""), f"practice {p.get('name')}", VOCAB, problems)
    have = {a.get("name") for a in d.get("animals") or []}
    for a in ("sheep", "goats", "chickens"):
        if a not in have:
            problems.refuse(f"the brief names {a}, and the farm has none.")
    blob = " ".join(json.dumps(x, ensure_ascii=False) for x in (d.get("animals"), d.get("crops")))
    nc.sweep(blob, "the animals and crops", VOCAB, problems)
    nc.check_picks(d.get("videos"), "the rack", problems, need=4)


# ── The farm in its two lights ───────────────────────────────────────────────

def v(name):
    return f"var(--{P}-{name})"


def rims_circle(cx, cy, r, w=2.2):
    """A round thing between two lights: its west edge warm, its east silver."""
    return (f'<path d="M{cx} {cy - r} A{r} {r} 0 0 0 {cx} {cy + r}" fill="none" stroke="{v("rim-warm")}" stroke-width="{w}"/>'
            f'<path d="M{cx} {cy - r} A{r} {r} 0 0 1 {cx} {cy + r}" fill="none" stroke="{v("rim-cool")}" stroke-width="{w}"/>')


def tree(x, base, r):
    return (f'<path d="M{x} {base} V{base - r * 1.4:.1f}" stroke="{v("trunk")}" stroke-width="{max(2, r / 4):.1f}"/>'
            f'<circle cx="{x}" cy="{base - r * 2:.1f}" r="{r}" fill="{v("leaf")}"/>' + rims_circle(x, base - r * 2, r))


def sheep(x, y, goat=False):
    body = v("goat") if goat else v("fleece")
    out = (f'<ellipse cx="{x}" cy="{y}" rx="16" ry="10" fill="{body}"/>'
           f'<ellipse cx="{x + 15}" cy="{y - 5}" rx="6" ry="5" fill="{v("face") if not goat else body}"/>'
           f'<path d="M{x - 10} {y + 8} v11 M{x - 3} {y + 9} v11 M{x + 5} {y + 9} v11 M{x + 11} {y + 8} v11" stroke="{v("face")}" stroke-width="2.4"/>'
           f'<path d="M{x - 16} {y - 3} q0 -8 8 -10" fill="none" stroke="{v("rim-warm")}" stroke-width="2.2"/>'
           f'<path d="M{x + 2} {y - 10} q12 0 14 8" fill="none" stroke="{v("rim-cool")}" stroke-width="2.2"/>')
    if goat:
        out += f'<path d="M{x + 13} {y - 9} l-2 -7 M{x + 17} {y - 9} l2 -7" stroke="{v("face")}" stroke-width="2"/>'
    return out


def hen(x, y, brown=False):
    c = v("hen-brown") if brown else v("hen")
    return (f'<ellipse cx="{x}" cy="{y}" rx="8" ry="6.5" fill="{c}"/><circle cx="{x + 7}" cy="{y - 6}" r="3.6" fill="{c}"/>'
            f'<path d="M{x + 7} {y - 10} l1 -3" stroke="{v("comb")}" stroke-width="2.4"/>'
            f'<path d="M{x - 8} {y - 1} q1 -6 6 -6" fill="none" stroke="{v("rim-warm")}" stroke-width="1.6"/>'
            f'<path d="M{x + 3} {y - 6} q5 1 5 6" fill="none" stroke="{v("rim-cool")}" stroke-width="1.6"/>')


def sisters(x, base):
    """A mound with the three on it: corn up the middle, a bean round the corn,
    squash leaves over the mound."""
    return (f'<path d="M{x - 26} {base} q26 -16 52 0 Z" fill="{v("soil")}"/>'
            f'<path d="M{x} {base - 8} V{base - 70}" stroke="{v("corn-stalk")}" stroke-width="3"/>'
            + "".join(f'<path d="M{x} {base - 20 - i * 14} q{(-1) ** i * 14} -6 {(-1) ** i * 18} 4" stroke="{v("corn-stalk")}" '
                      f'stroke-width="2.4" fill="none"/>' for i in range(4))
            + f'<path d="M{x - 3} {base - 50} q-5 4 -3 12" stroke="{v("corn")}" stroke-width="5" stroke-linecap="round" fill="none"/>'
            + f'<path d="M{x} {base - 10} q6 -10 0 -20 q-6 -10 0 -20 q6 -10 0 -18" stroke="{v("bean")}" stroke-width="1.6" fill="none"/>'
            + "".join(f'<ellipse cx="{x + dx}" cy="{base - 6}" rx="9" ry="5" fill="{v("squash-leaf")}"/>' for dx in (-18, 16))
            + f'<circle cx="{x + 4}" cy="{base - 5}" r="5" fill="{v("squash")}"/>'
            + f'<path d="M{x - 1} {base - 70} V{base - 8}" stroke="{v("rim-warm")}" stroke-width="1" opacity=".9"/>')


def view_svg():
    W, H = 1200, 480
    out = [f'<svg class="{P}-view__draw" viewBox="0 0 {W} {H}" aria-hidden="true" focusable="false">',
           '<defs>',
           f'<linearGradient id="{P}-two-lights" x1="0" y1="0" x2="1" y2="0">'
           f'<stop offset="0" stop-color="{v("west")}"/><stop offset=".5" stop-color="{v("sky")}"/>'
           f'<stop offset="1" stop-color="{v("east")}"/></linearGradient>',
           '</defs>',
           f'<rect width="{W}" height="{H}" fill="url(#{P}-two-lights)"/>',
           # The sun going down on the west horizon, the moon coming up on the east.
           f'<circle cx="70" cy="236" r="46" fill="{v("sun")}"/>',
           f'<circle cx="1120" cy="226" r="36" fill="{v("moon")}"/>',
           f'<rect y="236" width="{W}" height="{H - 236}" fill="{v("pasture")}"/>',
           f'<path d="M0 236 H{W}" stroke="{v("rim-warm")}" stroke-width="2" opacity=".7"/>']
    # The windbreak along the back.
    out += [tree(x, 248, 14 + (x * 7) % 6) for x in range(150, 1060, 46)]
    # The brook, running west down to the sanctuary's wetland.
    out.append(f'<path d="M0 330 C 120 316, 200 344, 300 326" stroke="{v("brook")}" stroke-width="9" fill="none" stroke-linecap="round"/>')
    # The barn and the old dairy beside it, each lit warm on its west wall and
    # silver on its east.
    out.append(f'<rect x="560" y="236" width="150" height="96" fill="{v("barn")}"/>'
               f'<path d="M548 238 L635 184 L722 238 Z" fill="{v("roof")}"/>'
               f'<path d="M610 332 V278 H660 V332" fill="{v("barn-door")}"/>'
               f'<path d="M560 238 V332" stroke="{v("rim-warm")}" stroke-width="4"/><path d="M710 238 V332" stroke="{v("rim-cool")}" stroke-width="4"/>'
               f'<path d="M548 238 L635 184" stroke="{v("rim-warm")}" stroke-width="3"/><path d="M635 184 L722 238" stroke="{v("rim-cool")}" stroke-width="3"/>')
    out.append(f'<rect x="732" y="276" width="78" height="56" fill="{v("dairy")}"/>'
               f'<path d="M726 278 L771 254 L816 278 Z" fill="{v("roof")}"/>'
               f'<rect x="760" y="300" width="22" height="32" fill="{v("roof")}"/>'
               f'<path d="M732 278 V332" stroke="{v("rim-warm")}" stroke-width="3"/><path d="M810 278 V332" stroke="{v("rim-cool")}" stroke-width="3"/>')
    # The alleys: rows of nut trees, with the Three Sisters between them.
    for row, base in enumerate((372, 446)):
        out += [tree(x, base, 16 + row * 3) for x in range(120 + row * 30, 1160, 120)]
        out += [sisters(x + 60, base + 6) for x in range(120 + row * 30, 1080, 240)]
    # The animals under the trees.
    out += [sheep(380, 360), sheep(452, 376), sheep(860, 358, goat=True), sheep(930, 372, goat=True),
            hen(500, 392), hen(522, 400, brown=True), hen(980, 396, brown=True)]
    out.append('</svg>')
    return "".join(out)


# ── The words ────────────────────────────────────────────────────────────────

def link(d, key, short=False):
    s = d["sources"][key]
    return f'<a href="{nc.attr(s["url"])}">{nc.esc(s["short" if short else "cite"])}</a>'


def quote(d, q):
    return (f'    <blockquote class="{P}-quote">\n'
            f'      <p>{nc.esc(q["said"])}</p>\n'
            f'      <footer>{link(d, q["source"])}.</footer>\n'
            '    </blockquote>')


def practices(d):
    out = [f'    <ol class="{P}-practices">']
    for p in d["practices"]:
        no = p["here"].startswith("Not here")
        out.append(f'      <li class="{P}-practice{f" {P}-practice--not" if no else ""}">\n'
                   f'        <h3>{nc.esc(p["name"][:1].upper() + p["name"][1:])}</h3>\n'
                   f'        <p class="{P}-practice__usda">{nc.esc(p["usda"])}</p>\n'
                   f'        <p>{nc.esc(p["here"])}</p>\n'
                   '      </li>')
    out.append('    </ol>')
    out.append(f'    <p class="{P}-src">Every practice&rsquo;s first line is {link(d, "usda", short=True)}&rsquo;s, word for word.</p>')
    return "\n".join(out)


def animals(d):
    out = [f'    <ul class="{P}-animals">']
    for a in d["animals"]:
        out.append(f'      <li><h3>{nc.esc(a["name"][:1].upper() + a["name"][1:])}</h3>'
                   f'<p>{nc.esc(a["does"])}</p><p class="{P}-gives">They give {nc.esc(a["gives"])}.</p></li>')
    out.append('    </ul>')
    return "\n".join(out)


def crops(d):
    out = [f'    <ul class="{P}-crops">']
    for c in d["crops"]:
        out.append(f'      <li><b>{nc.esc(c["name"][:1].upper() + c["name"][1:])}</b>. {nc.esc(c["how"])}</li>')
    out.append('    </ul>')
    return "\n".join(out)


def liner(d, r):
    rows = [("The farm, and what it gives", "Ryan Boren&rsquo;s brief of 2026-10-11"),
            ("The farm in its two lights", "Ours, drawn by tools/make-all-together-now.py")]
    for k, s in d["sources"].items():
        rows.append((nc.esc(s["cite"]), f'<a href="{nc.attr(s["url"])}">{nc.esc(s["url"])}</a>, {nc.esc(s["read"])}'))
    rows.append(("The films on the first rack", nc.picks_credit(d["videos"], "Claude&rsquo;s picks, put up at Ryan&rsquo;s ask",
                                                                "2026-10-11")))
    out = "\n".join(f'      <tr><td>{w}</td><td>{s}</td></tr>' for w, s in rows)
    return out + "\n" + nc.month_credit(r)


def sweep_page():
    body = nc.page_body(PAGE, cut=("atn:view", "atn:rack", "atn:month"))
    nc.sweep(body, PAGE.name, VOCAB, problems)
    src = PAGE.read_text()
    scripts = re.findall(r'<script src="([^"]+)"', src)
    if sorted(scripts) != sorted(["love.js", "love-embed.js", "rack.js", "quest.js"]):
        problems.refuse(f"the room loads {scripts}; it loads love.js, love-embed.js, rack.js and quest.js only.")
    for need in ("onondaganation.org", "oneidaindiannation.com"):
        if need not in src:
            problems.refuse(f"the Three Sisters are on the page without their link to {need}.")
    ids = re.findall(r'\bid="([^"]+)"', src)
    dup = sorted({i for i in ids if ids.count(i) > 1})
    if dup:
        problems.refuse(f"ids with two owners on the page: {', '.join(dup)}")


def month(r):
    return nc.month_block(r, P, SCREEN[0], SCREEN[1], "Farming While Beige&rsquo;s month, newest first")


def main():
    r = json.loads(MONTHLY.read_text())
    nc.check_month(r, MONTHLY.name, problems)
    if "--month" in sys.argv[1:]:
        problems.stop("the month rack")
        nc.swap(PAGE, "atn:month", month(r), "")
        live = [x for x in r["log"] if x["state"] in ("screen", "door")]
        print(f"all together now: the month rack, filled {r['set']}, {len(live)} on it")
        return
    d = json.loads(DATA.read_text())
    check(d)
    problems.stop("the data")
    nc.swap(PAGE, "atn:view", view_svg(), "      ")
    for q in d["quotes"]:
        nc.swap(PAGE, f"atn:quote:{q['key']}", quote(d, q), "    ")
    nc.swap(PAGE, "atn:practices", practices(d), "    ")
    nc.swap(PAGE, "atn:animals", animals(d), "    ")
    nc.swap(PAGE, "atn:crops", crops(d), "    ")
    nc.swap(PAGE, "atn:screen", nc.screen_block(P, SCREEN[0], SCREEN[1],
                                                "<b>The screen in the barn.</b> Nothing is on it. Any film on either rack "
                                                "can go up here with the button under it, and nothing loads until you "
                                                "press one."), "")
    nc.swap(PAGE, "atn:rack", nc.picks_block(d["videos"], P, SCREEN[0], SCREEN[1],
                                             "The first rack: growing, grazing and the Three Sisters",
                                             "Films about mixed farming, agroforestry and the Three Sisters"), "")
    nc.swap(PAGE, "atn:month", month(r), "")
    nc.swap(NOTES, "atn-credits", liner(d, r), "      ")
    sweep_page()
    problems.stop("the page as written")
    print("all together now: the farm in its two lights, the practices, the animals, the crops, the screen and both racks written")


if __name__ == "__main__":
    main()
