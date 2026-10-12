#!/usr/bin/env python3
"""Build Gentle Help Cannabis Farm out of data/gentle-help.json: the hoop house,
the strains, the companion plants, how to be careful, the quotations, the screen
in the potting shed and its rack, and the room's credits in the liner notes.

WHAT THE ROOM IS. Ryan Boren's brief, 2026-10-11: cannabis grown with companion
plants, kind, gentle, green and flowering, celebrating the plant; popular
strains with their THC, CBD and CBN and their terpenes; offering bud, rosins and
resins, cordage and cloth, companion plants such as herbs and alfalfa, and
education; and the room used to teach harm reduction, with Chelsea's work at a
dispensary, Ryan's own neuromuscular disease, and our Addiction and Harm
Reduction entries.

THE LIGHT COMES THROUGH THE HOUSE'S OWN SKIN. A hoop house is a tunnel of milky
plastic over hoops, and in the afternoon the whole skin glows: light from all
of the arch at once, every leaf lit from above and both sides, and only a soft
shadow under each plant. So the page's ground is that glow, pale and warm, and
every word is a deep green on it. Learning Large is the other glasshouse and is
this room turned inside out: a glasshouse at night under red and blue lamps,
with no green in it at all. This one is day, white light, and nothing but green
and flowers.

IT REFUSES, and writes nothing when it does:

  · A MEDICAL CLAIM IN OUR VOICE: that cannabis cures, treats or heals
    anything, is a neuroprotectant or the safest drug. Ryan's own body's answer
    is said as his, and our Addiction entry's two strongest sentences, which
    carry no source, are not repeated here.
  · A LABEL FOR PEOPLE WHO USE IT: addict, junkie, stoner, pothead, abuser.
    Harm reduction starts with nobody being called a name, and the friendly
    edit is a joke about stoners.
  · A STRAIN FIGURE WITHOUT ITS PAGE, OR A CBN FIGURE. Leafly publishes none,
    and the brief asked for CBN, so the column says it is not published rather
    than guessing, which is the herbarium's binomial in a lab report.
  · CANNABIS FOR SALE HERE. The farm sells nothing to visitors; bud, rosin and
    resin go to licensed dispensaries, and the area's tool refuses them at the
    honesty box. The vocabulary of a shop is refused in the room's own voice.
  · THE LAW LEFT OFF. Every page about cannabis on this street says you have
    to be 21 in Colorado; the tool looks for it.
  · A COMPANION PLANT'S CLAIM AS A FACT. What each one is said to do is the
    grower's guide's, and the page says the extension service's caution beside it.
  · A QUOTATION NOT WORD FOR WORD: ours against the mirror, when it is here.
  · A TALLY, the picked rack's rules, and a script of its own.

THE TITLES ON THE RACK ARE THE CHANNELS' AND ARE NOT SWEPT.
"""
import json
import math
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import natures as nc  # noqa: E402

ROOT = nc.ROOT
DATA = ROOT / "data/gentle-help.json"
PAGE = ROOT / "gentle-help.html"
NOTES = ROOT / "liner-notes.html"
P = "ghc"
SCREEN = ("ghc", "the screen in the potting shed")
MEDICAL = (r"cures?|cured|curing|treats?|treated|treating|treatment for|heals?|healing (?:properties|powers)|"
           r"remed(?:y|ies)|neuroprotect\w*|safest (?:drug|medicine|active)|anti-?(?:inflammatory|anxiety|cancer)|"
           r"medicinal properties|miracle")
LABELS = r"addicts?|junkies?|stoners?|potheads?|abusers?|(?<!Institute on )drug abuse|druggies"
SHOP = r"buy (?:it )?here|for sale here|we sell|on sale|in stock|add to (?:cart|basket)|order now|price list"
VOCAB = [(MEDICAL, "a medical claim in our voice. Ryan's body's answer is his, and nothing on this page "
                   "promises anybody else's."),
         (LABELS, "a label for people. Harm reduction starts with nobody being called a name."),
         (SHOP, "a shop. The farm sells nothing to visitors."),
         (nc.TALLY, "a tally. Nothing here is counted, and no strain is ranked against another.")]
KINDS = {"Sativa", "Indica", "Hybrid"}

problems = nc.Problems()


def check(d):
    src = d.get("sources") or {}
    for k, s in src.items():
        for f in ("cite", "url", "read"):
            if not s.get(f):
                problems.refuse(f"source {k!r} has no {f}.")
    kinds = set()
    for s in d.get("strains") or []:
        n = s.get("name")
        if s.get("cbn") is not None:
            problems.refuse(f"strain {n!r} has a CBN figure. Leafly publishes none; say not published.")
        if not (s.get("url") or "").startswith("https://www.leafly.com/strains/"):
            problems.refuse(f"strain {n!r} has no Leafly page to say where its figures come from.")
        if s.get("leafly_calls") not in KINDS:
            problems.refuse(f"strain {n!r} is called {s.get('leafly_calls')!r}, which is not Leafly's word.")
        kinds.add(s.get("leafly_calls"))
        if not isinstance(s.get("thc"), int):
            problems.refuse(f"strain {n!r} has no THC figure.")
        if len(s.get("terpenes") or []) != 3:
            problems.refuse(f"strain {n!r} does not give its top three terpenes.")
    if kinds != KINDS:
        problems.refuse(f"the brief asked for sativa, indica and hybrid strains, and the table has {sorted(kinds)}.")
    for c in d.get("companions") or []:
        if not (c.get("name") and c.get("claim") and c.get("goes")):
            problems.refuse(f"a companion plant is missing its name, the guide's claim or where it goes: {c}")
    names = " ".join(c.get("name", "") for c in d.get("companions") or [])
    for w in ("basil", "alfalfa"):
        if w not in names:
            problems.refuse(f"the brief names {w} among the companions, and the list does not.")
    cap = d.get("quote_cap") or 0
    for q in d.get("quotes") or []:
        k = q.get("key")
        if q.get("source") not in src:
            problems.refuse(f"quotation {k!r} comes from {q.get('source')!r}, which is not a source here.")
            continue
        if len(q["said"].split()) > cap:
            problems.refuse(f"quotation {k!r} is over the cap of {cap} words.")
        m = src[q["source"]].get("mirror")
        if m:
            mt = nc.mirror_text(m)
            if mt is None:
                print(f"  (could not check {k!r} against the mirror: it is not on this machine)")
            elif nc.words(q["said"]) not in mt:
                problems.refuse(f"quotation {k!r} is not word for word on our page. Re-copy it from the page.")
    for c in d.get("careful") or []:
        for s in c.get("sources") or []:
            if s not in src:
                problems.refuse(f"careful {c.get('key')!r} names {s!r}, which is not a source here.")
        if c.get("quote") and c.get("quote_source") not in src:
            problems.refuse(f"careful {c.get('key')!r} quotes {c.get('quote_source')!r}, which is not a source.")
        nc.sweep(c.get("says", ""), f"careful {c.get('key')}", VOCAB, problems)
    if not any("21" in c.get("says", "") for c in d.get("careful") or []):
        problems.refuse("nothing here says you have to be 21 in Colorado.")
    nc.check_picks(d.get("videos"), "the rack", problems, need=4)


# ── The hoop house ───────────────────────────────────────────────────────────

def v(name):
    return f"var(--{P}-{name})"


def leaf(cx, cy, size, angle, fill=None):
    """A fan leaf: seven leaflets from one point, the middle one longest, each a
    pointed blade with its edge left smooth at this size."""
    out = []
    for i, (a, l) in enumerate(((0, 1.0), (-24, .86), (24, .86), (-48, .66), (48, .66), (-74, .42), (74, .42))):
        t = math.radians(angle + a - 90)
        L = size * l
        tx, ty = cx + L * math.cos(t), cy + L * math.sin(t)
        nx, ny = -math.sin(t) * size * .11 * l, math.cos(t) * size * .11 * l
        mx, my = cx + L * .5 * math.cos(t), cy + L * .5 * math.sin(t)
        out.append(f'<path d="M{cx:.1f} {cy:.1f} Q{mx + nx:.1f} {my + ny:.1f} {tx:.1f} {ty:.1f} '
                   f'Q{mx - nx:.1f} {my - ny:.1f} {cx:.1f} {cy:.1f} Z" fill="{fill or v("leaf")}"/>')
    return "".join(out)


def cola(x, y, h, w, purple=False):
    """A flowering top: the bud, its orange hairs and its frost of resin."""
    body = v("bud-purple") if purple else v("bud")
    out = [f'<ellipse cx="{x}" cy="{y}" rx="{w}" ry="{h}" fill="{body}"/>']
    for i in range(9):
        a = (i * 40) % 360
        px, py = x + w * .7 * math.cos(math.radians(a)), y + h * .8 * math.sin(math.radians(a))
        out.append(f'<path d="M{px:.1f} {py:.1f} q{3 if i % 2 else -3} -5 {2 if i % 2 else -1} -9" stroke="{v("pistil")}" '
                   f'stroke-width="1.6" fill="none" stroke-linecap="round"/>')
    for i in range(14):
        px = x + w * .8 * math.cos(i * 1.7)
        py = y + h * .85 * math.sin(i * 2.3)
        out.append(f'<circle cx="{px:.1f}" cy="{py:.1f}" r="1.3" fill="{v("trichome")}"/>')
    return "".join(out)


def plant(x, base, s, purple=False):
    h = 170 * s
    out = [f'<ellipse cx="{x}" cy="{base + 4}" rx="{46 * s:.1f}" ry="{8 * s:.1f}" fill="{v("shadow")}"/>',
           f'<path d="M{x} {base} V{base - h:.1f}" stroke="{v("stem")}" stroke-width="{4 * s:.1f}"/>']
    for k, (dy, side) in enumerate(((.25, -1), (.38, 1), (.52, -1), (.64, 1), (.76, -1))):
        out.append(leaf(x + side * 8 * s, base - h * dy, 38 * s, side * 62 - (k * 4 * side)))
    out.append(leaf(x, base - h * .86, 30 * s, 0, v("leaf-light")))
    out.append(cola(x, base - h - 4 * s, 18 * s, 9 * s, purple))
    for side in (-1, 1):
        out.append(cola(x + side * 26 * s, base - h * .62, 11 * s, 6 * s, purple))
    return "".join(out)


def basil(x, base):
    return "".join(f'<ellipse cx="{x + dx}" cy="{base - dy}" rx="9" ry="6" fill="{v("basil")}"/>'
                   for dx, dy in ((-9, 5), (9, 6), (0, 13), (-6, 20), (7, 21), (0, 28)))


def marigold(x, base):
    return (f'<path d="M{x} {base} V{base - 18}" stroke="{v("stem")}" stroke-width="2"/>'
            f'<circle cx="{x}" cy="{base - 22}" r="8" fill="{v("marigold")}"/><circle cx="{x}" cy="{base - 22}" r="3" fill="{v("pistil")}"/>')


def dill(x, base):
    return (f'<path d="M{x} {base} V{base - 44}" stroke="{v("stem")}" stroke-width="2"/>'
            + "".join(f'<path d="M{x} {base - 44} l{dx} -10" stroke="{v("stem")}" stroke-width="1"/>'
                      f'<circle cx="{x + dx}" cy="{base - 55}" r="2.4" fill="{v("dill")}"/>' for dx in (-12, -6, 0, 6, 12)))


def view_svg():
    W, H = 1200, 520
    out = [f'<svg class="{P}-view__draw" viewBox="0 0 {W} {H}" aria-hidden="true" focusable="false">',
           f'<rect width="{W}" height="{H}" fill="{v("skin")}"/>']
    # The hoops, receding: each a pale rib across the glowing skin, closer
    # together towards the far end, which is a lit doorway.
    for i, k in enumerate((1.0, .78, .6, .46, .35, .27)):
        w, h = 1180 * k, 470 * k
        x0 = 600 - w / 2
        y0 = 500 - (500 - 140) * (1 - k) * .9
        out.append(f'<path d="M{x0:.0f} {y0:.0f} C{x0:.0f} {y0 - h * 1.05:.0f}, {x0 + w:.0f} {y0 - h * 1.05:.0f}, {x0 + w:.0f} {y0:.0f}" '
                   f'fill="none" stroke="{v("rib")}" stroke-width="{6 * k + 1:.1f}"/>')
    out.append(f'<path d="M560 256 h80 v-60 q-40 -26 -80 0z" fill="{v("door")}"/>')
    out.append(f'<path d="M0 520 L560 262 L640 262 L1200 520 Z" fill="{v("floor")}"/>')
    out.append(f'<path d="M520 520 L590 262 L610 262 L680 520 Z" fill="{v("path")}"/>')
    # The beds, both sides, back to front: cannabis in the beds, and the
    # companions along their edges by the path.
    rows = ((.5, 292), (.64, 318), (.8, 352), (.98, 398), (1.2, 456), (1.42, 520))
    for depth, (s, y) in enumerate(rows):
        spread = (y - 262) / 258
        for side in (-1, 1):
            for k, off in enumerate((300, 160)):
                x = 600 + side * (off * spread + 70)
                out.append(plant(x, y, s * (0.95 if k else 1.0), purple=((depth + k + (side > 0)) % 5 == 2)))
            ex = 600 + side * (40 + 50 * spread)
            out.append([basil, marigold, dill][(depth + (side > 0)) % 3](ex, y))
    out.append('</svg>')
    return "".join(out)


# ── The words ────────────────────────────────────────────────────────────────

def link(d, key, words=None):
    s = d["sources"][key]
    return f'<a href="{nc.attr(s["url"])}">{nc.esc(words or s["cite"])}</a>'


def quote(d, q):
    return (f'    <blockquote class="{P}-quote">\n'
            f'      <p>{nc.esc(q["said"])}</p>\n'
            f'      <footer>{link(d, q["source"])}.</footer>\n'
            '    </blockquote>')


def pct(n):
    return "not shown" if n is None else f"{n}%"


def strains(d):
    out = [f'    <div class="{P}-tablewrap">',
           f'    <table class="{P}-strains">',
           '      <caption class="sr">Strains, with Leafly\'s figures</caption>',
           '      <thead><tr><th scope="col">Strain</th><th scope="col">Leafly calls it</th><th scope="col">THC</th>'
           '<th scope="col">CBD, and CBG where shown</th><th scope="col">CBN</th><th scope="col">Terpenes, most first</th></tr></thead>',
           '      <tbody>']
    for s in d["strains"]:
        cbg = f'<span class="{P}-strains__also"> &middot; CBG {s["cbg"]}%</span>' if s.get("cbg") else ""
        out.append(f'        <tr><th scope="row"><a href="{nc.attr(s["url"])}">{nc.esc(s["name"])}</a></th>'
                   f'<td>{s["leafly_calls"].lower()}</td><td>{pct(s["thc"])}</td><td>{pct(s["cbd"])}{cbg}</td>'
                   f'<td>not published</td><td>{nc.esc(", ".join(s["terpenes"]))}</td></tr>')
    out += ['      </tbody>', '    </table>', '    </div>']
    return "\n".join(out)


def companions(d):
    out = [f'    <ul class="{P}-companions">']
    for c in d["companions"]:
        they = c["name"].endswith("s")
        out.append(f'      <li><b>{nc.esc(c["name"][:1].upper() + c["name"][1:])}</b>: the guide says '
                   f'{"they" if they else "it"} {nc.esc(c["claim"])}. {"They go" if they else "It goes"} to '
                   f'{nc.esc(c["goes"])}.</li>')
    out.append('    </ul>')
    return "\n".join(out)


def careful(d):
    out = [f'    <ol class="{P}-careful">']
    for c in d["careful"]:
        q = ""
        if c.get("quote"):
            q = (f'\n        <blockquote class="{P}-careful__q"><p>{nc.esc(c["quote"])}</p>'
                 f'<footer>{link(d, c["quote_source"])}.</footer></blockquote>')
        srcs = nc.listify([link(d, s) for s in c["sources"]])
        out.append(f'      <li id="{P}-{c["key"]}">\n'
                   f'        <h3>{nc.esc(c["head"])}</h3>\n'
                   f'        <p>{nc.esc(c["says"])}</p>{q}\n'
                   f'        <p class="{P}-careful__src">From {srcs}.</p>\n'
                   '      </li>')
    out.append('    </ol>')
    return "\n".join(out)


def liner(d):
    rows = [("The farm, and what it gives", "Ryan Boren&rsquo;s brief of 2026-10-11"),
            ("The hoop house", "Ours, drawn by tools/make-gentle-help.py")]
    for k, s in d["sources"].items():
        rows.append((nc.esc(s["cite"]), f'<a href="{nc.attr(s["url"])}">{nc.esc(s["url"])}</a>, {nc.esc(s["read"])}'))
    rows.append(("The films on the rack", nc.picks_credit(d["videos"], "Claude&rsquo;s picks, put up at Ryan&rsquo;s ask",
                                                          "2026-10-11")))
    return "\n".join(f'      <tr><td>{w}</td><td>{s}</td></tr>' for w, s in rows)


def sweep_page():
    body = nc.page_body(PAGE, cut=("ghc:view", "ghc:rack", "ghc:strains"))
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
    nc.swap(PAGE, "ghc:view", view_svg(), "      ")
    for q in d["quotes"]:
        nc.swap(PAGE, f"ghc:quote:{q['key']}", quote(d, q), "    ")
    nc.swap(PAGE, "ghc:strains", strains(d), "    ")
    nc.swap(PAGE, "ghc:companions", companions(d), "    ")
    nc.swap(PAGE, "ghc:careful", careful(d), "    ")
    nc.swap(PAGE, "ghc:screen", nc.screen_block(P, SCREEN[0], SCREEN[1],
                                                "<b>The screen in the potting shed.</b> Nothing is on it. Any film on the "
                                                "rack can go up here with the button under it, and nothing loads until "
                                                "you press one."), "")
    nc.swap(PAGE, "ghc:rack", nc.picks_block(d["videos"], P, SCREEN[0], SCREEN[1],
                                             "The rack: growing with companions, hemp to rope and cloth, and rosin",
                                             "Films about growing cannabis and hemp"), "")
    nc.swap(NOTES, "ghc-credits", liner(d), "      ")
    sweep_page()
    problems.stop("the page as written")
    print("gentle help: the hoop house, the strains, the companions, how to be careful, the screen and the rack written")


if __name__ == "__main__":
    main()
