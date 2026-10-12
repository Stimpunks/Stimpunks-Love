#!/usr/bin/env python3
"""Build Brighter Days Solar Farm out of data/brighter-days.json: the rows at
noon, what grows under the panels, the quotations, the screen in the battery
shed and its rack, and the room's credits in the liner notes.

WHAT THE ROOM IS. Ryan Boren's brief, 2026-10-11: agrivoltaics that power
everything in Nature's Contribution and much of the street, though every place
out there has its own panels and battery too, after Star Stuff's Two Peppers
(Stimpunks Zine No. 87), offering peppers and the other plants that do well
under panels.

THE LIGHT IS NOON, SHARED. The sun is straight overhead and the panels take the
top of it: a hard white line of it along the top edge of every panel, and under
the panels the shade the peppers live in. The page's ground is the panels' own
glass, deep and blue, with the cells' hairline grid in it, because from above a
solar farm at noon is mostly sky lying in glass. The zine's line is the room:
the plants take the light the panel does not want, and the panel takes the heat
the plants do not want, and neither one is the host.

IT REFUSES, and writes nothing when it does:

  · A CROP WITHOUT A SOURCE, OR A SOURCE NOBODY CAN FIND. Every sentence about
    what the shade did to a crop names where it comes from.
  · A PERCENTAGE OF SHADE, anywhere in the data or on the page. The figure that
    travels with these peppers, seventy or eighty per cent shade, is not in the
    paper they come from, and Two Peppers' own sources say so. It is the most
    natural number to add and the one most likely to be wrong.
  · THE JALAPEÑOS ON LESS WATER. They lost 65 per cent less water through their
    leaves; the watering was the same. A sentence saying they needed less water
    is the friendly simplification that changes the finding, so "less water"
    must be "less transpirational water" wherever it is said.
  · A QUOTATION THAT IS NOT WORD FOR WORD: the zine's against the local copy of
    Star Stuff's repository, ours against the Knowledge System mirror, when each
    is on this machine; the others carry their licence in the credit.
  · THE SALES PITCH: free energy, limitless, unlimited, too cheap to meter. The
    sun is free and a solar farm is not, and the street does not sell either.
  · A TALLY, and the picked rack's rules (natures.check_picks).
  · A SCRIPT OF ITS OWN.

THE TITLES ON THE RACK ARE THE CHANNELS' AND ARE NOT SWEPT.
"""
import html
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import natures as nc  # noqa: E402

ROOT = nc.ROOT
DATA = ROOT / "data/brighter-days.json"
PAGE = ROOT / "brighter-days.html"
NOTES = ROOT / "liner-notes.html"
P = "bds"
SCREEN = ("bds", "the screen in the battery shed")
ZINE = Path.home() / "Documents/GitHub/Star-Stuff/two-peppers-zine.html"
SHADE = re.compile(r"\d+\s*(?:%|per ?cent)\s*(?:of\s+)?(?:shade|shading)|shad(?:e|ing) of \d+", re.I)
LESS_WATER = re.compile(r"less (?!transpirational)water", re.I)
HYPE = r"free (?:energy|power|electricity)|limitless|unlimited|too cheap to meter|endless power"
VOCAB = [(HYPE, "the sales pitch. The sun is free and a solar farm is not."),
         (nc.TALLY, "a tally. Nothing here is counted or ranked, and no panel against another.")]

problems = nc.Problems()


def zine_text():
    if not ZINE.exists():
        return None
    t = ZINE.read_text()
    return nc.words(re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", t))))


def check(d):
    src = d.get("sources") or {}
    for k, s in src.items():
        for f in ("cite", "short", "url", "read"):
            if not s.get(f):
                problems.refuse(f"source {k!r} has no {f}.")
    cap = d.get("quote_cap") or 0
    zt = zine_text()
    for q in d.get("quotes") or []:
        k = q.get("key")
        if q.get("source") not in src:
            problems.refuse(f"quotation {k!r} comes from {q.get('source')!r}, which is not a source here.")
            continue
        n = len(q.get("said", "").split())
        if n > cap:
            problems.refuse(f"quotation {k!r} runs to {n} words; the cap is {cap}.")
        said = nc.words(q["said"]).strip("…").strip()
        if q["source"] == "two-peppers":
            if zt is None:
                print(f"  (could not check {k!r} against Star Stuff: its repository is not on this machine)")
            elif said not in zt:
                problems.refuse(f"quotation {k!r} is not word for word in Two Peppers. Re-copy it from the zine.")
        if q["source"] == "electrify":
            mt = nc.mirror_text(src["electrify"]["mirror"])
            if mt is None:
                print(f"  (could not check {k!r} against the mirror: it is not on this machine)")
            elif said not in mt:
                problems.refuse(f"quotation {k!r} is not word for word on our page. Re-copy it from the page.")
    keys = set()
    for c in d.get("crops") or []:
        for f in ("key", "name", "shade", "source", "to"):
            if not c.get(f):
                problems.refuse(f"crop {c.get('name')!r} has no {f}.")
        if c.get("source") not in src:
            problems.refuse(f"crop {c.get('name')!r} names {c.get('source')!r}, which is not a source here.")
        if c.get("key") in keys:
            problems.refuse(f"two crops have the key {c.get('key')!r}.")
        keys.add(c.get("key"))
    if not any("pepper" in (c.get("name") or "").lower() or "jalape" in (c.get("name") or "").lower()
               for c in d.get("crops") or []):
        problems.refuse("the brief says peppers, and nothing under the panels is a pepper.")
    blob = json.dumps(d, ensure_ascii=False)
    for rx, why in ((SHADE, "a percentage of shade, which is not in the paper the peppers come from"),
                    (LESS_WATER, "the jalapeños on less water. They lost less water through their leaves; "
                                 "the watering was the same. Say transpirational.")):
        m = rx.search(json.dumps({k: v for k, v in d.items() if k != "videos"}, ensure_ascii=False))
        if m:
            problems.refuse(f"the data says {m.group(0)!r}: {why}.")
    nc.check_picks(d.get("videos"), "the rack", problems, need=4)
    for c in d.get("crops") or []:
        nc.sweep(c.get("shade", ""), f"crop {c.get('key')}", VOCAB, problems)
    del blob


# ── The rows at noon ─────────────────────────────────────────────────────────

def v(name):
    return f"var(--{P}-{name})"


def panel(x, y, w):
    """A panel on its post, tilted to the south and seen a little from above,
    so its glass shows: the face, its cells, its frame, and the noon sun lying
    along its top edge as a hard white line."""
    tilt, depth, lean = w * 0.32, 34, 20
    face = (f'M{x} {y + tilt:.1f} L{x + w} {y} L{x + w + lean} {y + depth} L{x + lean} {y + tilt + depth:.1f} Z')
    cells = "".join(f'<path d="M{x + w * t:.1f} {y + tilt * (1 - t):.1f} l{lean} {depth}" stroke="{v("cell")}" stroke-width="1.4"/>'
                    for t in (0.17, 0.33, 0.5, 0.67, 0.83))
    mid = f'<path d="M{x + lean / 2:.1f} {y + tilt + depth / 2:.1f} L{x + w + lean / 2:.1f} {y + depth / 2}" stroke="{v("cell")}" stroke-width="1.4"/>'
    return (f'<path d="M{x + w * 0.5 + lean / 2:.1f} {y + tilt * 0.5 + depth:.1f} V 430" stroke="{v("post")}" stroke-width="7"/>'
            f'<path d="{face}" fill="{v("pv")}" stroke="{v("frame")}" stroke-width="2" stroke-linejoin="round"/>'
            + cells + mid +
            f'<path d="M{x} {y + tilt:.1f} L{x + w} {y}" stroke="{v("glint")}" stroke-width="3.5" stroke-linecap="round"/>')


def pepper_bush(x, base, fruit, n, h=46):
    leaves = "".join(f'<ellipse cx="{x + dx}" cy="{base - h + dy}" rx="13" ry="8" fill="{v("leaf")}"/>'
                     for dx, dy in ((-14, 18), (12, 14), (-4, 2), (16, 30), (-18, 34), (2, 26)))
    stem = f'<path d="M{x} {base} V{base - h + 14}" stroke="{v("leaf-dark")}" stroke-width="3"/>'
    fr = "".join(f'<path d="M{x - 16 + (i * 9) % 34} {base - h + 16 + (i * 13) % 28} q2 8 0 12" '
                 f'stroke="{fruit}" stroke-width="{4 if fruit == v("chiltepin") else 6}" stroke-linecap="round" fill="none"/>'
                 for i in range(n))
    return stem + leaves + fr


def tomato(x, base):
    cage = f'<path d="M{x - 14} {base} V{base - 70} M{x + 14} {base} V{base - 70} M{x - 14} {base - 50} H{x + 14} M{x - 14} {base - 26} H{x + 14}" stroke="{v("post")}" stroke-width="1.6"/>'
    leaves = "".join(f'<ellipse cx="{x + dx}" cy="{base - dy}" rx="10" ry="7" fill="{v("leaf")}"/>'
                     for dx, dy in ((-8, 66), (8, 56), (-6, 42), (9, 30), (-9, 18)))
    fr = "".join(f'<circle cx="{x + dx}" cy="{base - dy}" r="4.5" fill="{v("tomato")}"/>'
                 for dx, dy in ((4, 60), (-4, 48), (6, 36), (-2, 24), (8, 14)))
    return cage + leaves + fr


def basil(x, base):
    return "".join(f'<ellipse cx="{x + dx}" cy="{base - dy}" rx="8" ry="5" fill="{v("basil")}"/>'
                   for dx, dy in ((-8, 6), (8, 7), (0, 14), (-6, 20), (6, 22), (0, 28)))


def sheep(x, y, flip=False):
    s = -1 if flip else 1
    return (f'<ellipse cx="{x}" cy="{y}" rx="20" ry="13" fill="{v("fleece")}"/>'
            f'<ellipse cx="{x + 20 * s}" cy="{y + 2}" rx="7" ry="6" fill="{v("face")}"/>'
            f'<path d="M{x - 12} {y + 10} v14 M{x - 4} {y + 11} v14 M{x + 6} {y + 11} v14 M{x + 13} {y + 10} v14" '
            f'stroke="{v("face")}" stroke-width="3"/>')


def view_svg():
    W, H = 1200, 470
    out = [f'<svg class="{P}-view__draw" viewBox="0 0 {W} {H}" aria-hidden="true" focusable="false">',
           '<defs>',
           f'<linearGradient id="{P}-noon" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{v("sky-high")}"/>'
           f'<stop offset="1" stop-color="{v("sky")}"/></linearGradient>',
           '</defs>',
           f'<rect width="{W}" height="{H}" fill="url(#{P}-noon)"/>',
           # The sun, straight overhead and small: noon.
           f'<circle cx="600" cy="34" r="20" fill="{v("glint")}"/>',
           f'<rect y="410" width="{W}" height="{H - 410}" fill="{v("soil")}"/>']
    rows = [(50, 150, 300), (430, 150, 300), (810, 150, 300)]
    # The shade under each panel, straight down because the sun is straight up.
    for x, y, w in rows:
        out.append(f'<rect x="{x + 16}" y="410" width="{w - 6}" height="{H - 410}" fill="{v("shade")}"/>')
    for x, y, w in rows:
        out.append(panel(x, y, w))
    # Under the first row, chiltepin; under the second, jalapeños; under the
    # third, cherry tomatoes and basil; sheep in the sun between the rows.
    out += [pepper_bush(x, 430, v("chiltepin"), 7) for x in (120, 200, 280)]
    out += [pepper_bush(x, 430, v("jalapeno"), 4, h=52) for x in (500, 590, 680)]
    out += [tomato(x, 430) for x in (880, 980)]
    out += [basil(x, 430) for x in (1060, 1090)]
    out += [sheep(400, 418), sheep(790, 420, flip=True)]
    # The battery shed at the end of the rows, and the line going off towards
    # the street.
    out.append(f'<rect x="1130" y="352" width="66" height="70" fill="{v("battery")}"/>'
               f'<path d="M1126 354 L1163 334 L1200 354" fill="{v("frame")}"/>'
               f'<path d="M1150 372 h26 M1150 384 h26 M1150 396 h26" stroke="{v("pv")}" stroke-width="3"/>'
               f'<path d="M1196 360 L1200 352" stroke="{v("wire")}" stroke-width="2"/>')
    out.append('</svg>')
    return "".join(out)


# ── The words ────────────────────────────────────────────────────────────────

def credit(d, key, short=False):
    s = d["sources"][key]
    return f'<a href="{nc.attr(s["url"])}">{nc.esc(s["short" if short else "cite"])}</a>'


def quote(d, q):
    return (f'    <blockquote class="{P}-quote">\n'
            f'      <p>{nc.esc(q["said"])}</p>\n'
            f'      <footer>{credit(d, q["source"])}.</footer>\n'
            '    </blockquote>')


def crops(d):
    out = [f'    <ul class="{P}-crops">']
    for c in d["crops"]:
        out.append(f'      <li class="{P}-crop {P}-crop--{c["key"]}">\n'
                   f'        <h3>{nc.esc(c["name"])}</h3>\n'
                   f'        <p>{nc.esc(c["shade"])}</p>\n'
                   f'        <p class="{P}-crop__to">Goes to {nc.esc(c["to"])}.</p>\n'
                   f'        <p class="{P}-crop__src">From {credit(d, c["source"], short=True)}.</p>\n'
                   '      </li>')
    out.append('    </ul>')
    return "\n".join(out)


def panels(d):
    p = d["panels"]
    return (f'    <p class="{P}-cooler">{nc.esc(p["cooler"])} <span class="{P}-crop__src">From '
            f'{credit(d, p["source"], short=True)}; the whole citation is in the liner notes.</span></p>')


def liner(d):
    rows = [("The farm, and what it gives", "Ryan Boren&rsquo;s brief of 2026-10-11"),
            ("The rows at noon", "Ours, drawn by tools/make-brighter-days.py")]
    for k, s in d["sources"].items():
        rows.append((s["cite"], f'<a href="{nc.attr(s["url"])}">{nc.esc(s["url"])}</a>, {nc.esc(s["read"])}'))
    rows.append(("The films on the rack", nc.picks_credit(d["videos"], "Claude&rsquo;s picks, put up at Ryan&rsquo;s ask",
                                                          "2026-10-11")))
    return "\n".join(f'      <tr><td>{nc.esc(w) if "<" not in w else w}</td><td>{s}</td></tr>' for w, s in rows)


def sweep_page():
    body = nc.page_body(PAGE, cut=("bds:view", "bds:rack"))
    nc.sweep(body, PAGE.name, VOCAB, problems)
    for rx, why in ((SHADE, "a percentage of shade"), (LESS_WATER, "the jalapeños on less water")):
        m = rx.search(html.unescape(re.sub(r"<[^>]+>", " ", body)))
        if m:
            problems.refuse(f"{PAGE.name} says {m.group(0)!r}: {why}.")
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
    nc.swap(PAGE, "bds:view", view_svg(), "      ")
    for q in d["quotes"]:
        nc.swap(PAGE, f"bds:quote:{q['key']}", quote(d, q), "    ")
    nc.swap(PAGE, "bds:crops", crops(d), "    ")
    nc.swap(PAGE, "bds:panels", panels(d), "    ")
    nc.swap(PAGE, "bds:screen", nc.screen_block(P, SCREEN[0], SCREEN[1],
                                                "<b>The screen in the battery shed.</b> Nothing is on it. Any film on the "
                                                "rack can go up here with the button under it, and nothing loads until "
                                                "you press one."), "")
    nc.swap(PAGE, "bds:rack", nc.picks_block(d["videos"], P, SCREEN[0], SCREEN[1],
                                             "The rack: crops, sheep and bees under solar panels",
                                             "Films about agrivoltaics"), "")
    nc.swap(NOTES, "bds-credits", liner(d), "      ")
    sweep_page()
    problems.stop("the page as written")
    print("brighter days: the rows at noon, the crops, the quotations, the screen and the rack written")


if __name__ == "__main__":
    main()
