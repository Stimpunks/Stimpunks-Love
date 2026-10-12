#!/usr/bin/env python3
"""Build Nature's Contribution's own page out of data/natures-contribution.json:
the view from the stile, the fingerpost, the table of what goes where, the
quotations from the paper the area comes from, and the area's credits in the
liner notes.

WHAT THE AREA IS. Ryan Boren's brief, 2026-10-11: beyond the campgrounds there
is land reserved for balancing conservation, agriculture and renewable energy,
after Brock, Roehrdanz, Beringer et al. (Nature Communications 17, 3623, 2026),
and its places complement and sustain each other and the street. You reach it
through the campgrounds' wood, which stays unmapped: the campgrounds' own page
says so, and the one thing drawn of it is the track through.

THE LIGHT IS AN AFTERNOON UNDER BROKEN CLOUD, AND THE SHADOWS ON THE LAND ARE
THE CLOUDS'. Nothing on the ground casts them, and they lie across whole fields
with edges as soft as the cloud. You are standing in one at the stile, which is
why the page's ground is a hayfield in shade and every word stands in it, while
the valley in front of you is in the sun. It is the only light on this street
cast by the sky rather than by anything in it or under it. The collisions are
written in love.css's section for the area.

IT REFUSES, and writes nothing when it does:

  · AN ARM WITH NO PLACE, OR A PLACE IN THE WRONG STATE. An open arm whose page
    does not exist or is not in the sitemap's walking order; a raising arm
    whose page is already in the order (open it); two arms with one bearing.
    A raising arm is the campgrounds' raising pitch on a fingerpost: a solid
    sign with no link, and its words are never dimmed.
  · AN OFFERING THAT GOES NOWHERE. Every `to` must be a place on this land or
    one of the ends the data file names, and a place's offers must carry every
    word of the brief's list for it.
  · CANNABIS AT THE HONESTY BOX. Bud, rosin and resin leave this land through
    licensed dispensaries only. An honesty box with nobody watching it is the
    one shop on the street that could never check anybody's age, and Colorado
    sells cannabis to adults only, through licences. The stalks' cordage and
    cloth are hemp, and go to the box like the wool.
  · ANYTHING FROM THE SANCTUARY BUT WHAT IT GIVES. Its residents are not
    stock: nothing of theirs goes to the box or the café but the manure.
  · A QUOTATION OVER THE CAP, OR WITHOUT ITS PAGE AND SECTION. The paper is CC
    BY 4.0, and the credit with the licence's link is written under every
    quotation and again in the liner notes.
  · A TALLY in our own sentences: nobody here is counted and nothing is ranked
    against anything else, with the area's anchored negation window.
  · THE WAY IN GONE. campgrounds.html must link here, because that is the only
    way in, and the map draws it.

Nothing in the area moves, at any setting. The view is drawn here, from one
function per thing in it, and its colours are love.css's, so the contrast
checker holds every one of them.
"""
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import natures as nc  # noqa: E402

ROOT = nc.ROOT
DATA = ROOT / "data/natures-contribution.json"
PAGE = ROOT / "natures-contribution.html"
NOTES = ROOT / "liner-notes.html"
P = "ncx"
BEARINGS = ["North", "North-east", "East", "South-east", "South", "South-west", "West", "North-west"]
CANNABIS = r"cannabis|bud|rosins?|resins?|marijuana|thc"
VOCAB = [(nc.TALLY, "a tally. Nobody out here is counted, and no animal, crop, panel or place is ranked "
                    "against another.")]

problems = nc.Problems()


def walking_order():
    import ast
    src = (ROOT / "tools/make-sitemap.py").read_text()
    for node in ast.parse(src).body:
        if isinstance(node, ast.Assign) and any(getattr(t, "id", "") == "ORDER" for t in node.targets):
            return ast.literal_eval(node.value)
    raise SystemExit("REFUSING: make-sitemap.py has no ORDER.")


# ── Checks ───────────────────────────────────────────────────────────────────

def check(d):
    order = walking_order()
    keys = [p["key"] for p in d["places"]]
    ends = d["ends"]
    seen_bearing = set()
    for p in d["places"]:
        k = p.get("key")
        if p.get("bearing") not in BEARINGS:
            problems.refuse(f"{k}: bearing {p.get('bearing')!r} is not a point of the compass.")
        if p.get("bearing") in seen_bearing:
            problems.refuse(f"{k}: two arms point {p['bearing']}. A fingerpost has one arm per way.")
        seen_bearing.add(p.get("bearing"))
        page = p.get("page") or ""
        if p.get("state") == "open":
            if not (ROOT / page).exists():
                problems.refuse(f"{k}: the arm is open and {page} does not exist.")
            elif page not in order:
                problems.refuse(f"{k}: the arm is open and {page} is not in the sitemap's walking order.")
        elif p.get("state") == "raising":
            if page in order:
                problems.refuse(f"{k}: {page} is built and in the walking order, and its arm still says "
                                "raising. Open it.")
        else:
            problems.refuse(f"{k}: state {p.get('state')!r} is neither open nor raising.")
        for f in ("name", "what", "land"):
            if not (p.get(f) or "").strip():
                problems.refuse(f"{k}: no {f}.")
        said = " ".join(o["what"] for o in p.get("offers") or []).lower()
        for w in p.get("brief_offers") or []:
            if w.lower() not in said:
                problems.refuse(f"{k}: the brief says it offers {w!r}, and no offer says so.")
        for o in p.get("offers") or []:
            for t in o.get("to") or []:
                if t not in keys and t not in ends:
                    problems.refuse(f"{k}: {o['what']!r} goes to {t!r}, which is not a place on this land "
                                    "or an end the data file names.")
                if t == k:
                    problems.refuse(f"{k}: {o['what']!r} goes to the place it comes from.")
            if not o.get("to"):
                problems.refuse(f"{k}: {o['what']!r} goes nowhere.")
            if re.search(rf"\b(?:{CANNABIS})\b", o["what"], re.I) and \
                    set(o.get("to") or []) - {"licensed"}:
                problems.refuse(f"{k}: {o['what']!r} goes to {o['to']}. Cannabis leaves this land through "
                                "licensed dispensaries only, and never through an honesty box nobody watches.")
            if k == "sanctuary" and set(o.get("to") or []) & {"honesty", "dairy"} and \
                    "manure" not in o["what"].lower():
                problems.refuse(f"sanctuary: {o['what']!r} goes to the box or the café. The residents are "
                                "not stock; nothing of theirs leaves but the manure.")
    cap = d.get("quote_cap")
    if not isinstance(cap, int):
        problems.refuse("the data file has no quote_cap.")
        cap = 0
    for q in d.get("quotes") or []:
        n = len(q.get("said", "").split())
        if n > cap:
            problems.refuse(f"quotation {q.get('key')!r} runs to {n} words; the cap is {cap}.")
        if not isinstance(q.get("page"), int) or not (q.get("section") or "").strip():
            problems.refuse(f"quotation {q.get('key')!r} has no page or no section.")
    paper = d.get("paper") or {}
    for f in ("authors", "title", "journal", "year", "doi", "url", "licence", "licence_url"):
        if not paper.get(f):
            problems.refuse(f"the paper has no {f}, and a CC BY quotation without its credit is not CC BY.")
    camp = (ROOT / "campgrounds.html").read_text()
    if 'href="natures-contribution.html"' not in camp:
        problems.refuse("campgrounds.html does not link here, and the campgrounds is the only way in.")


# ── The view from the stile ──────────────────────────────────────────────────

def v(name):
    return f"var(--{P}-{name})"


def cloud(cx, cy, s):
    puffs = [(-46, 8, 26), (-18, -10, 34), (16, -16, 38), (48, -2, 30), (74, 10, 22), (2, 10, 30), (-70, 14, 18)]
    body = "".join(f'<circle cx="{cx + dx * s:.1f}" cy="{cy + dy * s:.1f}" r="{r * s:.1f}"/>' for dx, dy, r in puffs)
    under = f'<ellipse cx="{cx + 4 * s:.1f}" cy="{cy + 26 * s:.1f}" rx="{88 * s:.1f}" ry="{9 * s:.1f}"/>'
    return (f'<g fill="{v("cloud")}">{body}</g>'
            f'<g fill="{v("cloud-under")}">{under}</g>')


def field(points, fill):
    return f'<path d="M{" L".join(f"{x:.0f} {y:.0f}" for x, y in points)} Z" fill="{fill}"/>'


def hoop(x, y, w):
    h = w * 0.42
    ribs = "".join(f'<path d="M{x + i * w / 6:.1f} {y} Q{x + i * w / 6 + 3:.1f} {y - h:.1f} {x + i * w / 6 + 6:.1f} {y}" '
                   f'fill="none" stroke="{v("tunnel-rib")}" stroke-width="1"/>' for i in range(1, 6))
    return (f'<path d="M{x} {y} Q{x + 4} {y - h * 1.05:.1f} {x + w / 2:.1f} {y - h:.1f} Q{x + w - 4} {y - h * 1.05:.1f} '
            f'{x + w} {y} Z" fill="{v("tunnel")}"/>' + ribs)


def panel_row(x, y, n, w):
    out = []
    for i in range(n):
        px = x + i * (w + 4)
        out.append(f'<path d="M{px:.1f} {y} L{px + w:.1f} {y} L{px + w - 3:.1f} {y + 7} L{px - 3:.1f} {y + 7} Z" '
                   f'fill="{v("pv")}"/>')
        out.append(f'<path d="M{px:.1f} {y} L{px + w:.1f} {y}" stroke="{v("glint")}" stroke-width="1.4"/>')
        out.append(f'<path d="M{px + w / 2:.1f} {y + 7} V{y + 12}" stroke="{v("hedge")}" stroke-width="1"/>')
    return "".join(out)


def tree(x, y, r, fill=None):
    return (f'<path d="M{x} {y} V{y - r * 1.2:.1f}" stroke="{v("trunk")}" stroke-width="{max(1.2, r / 5):.1f}"/>'
            f'<circle cx="{x}" cy="{y - r * 1.6:.1f}" r="{r}" fill="{fill or v("tree")}"/>')


def sheep(x, y):
    return (f'<ellipse cx="{x}" cy="{y}" rx="3.2" ry="2.1" fill="{v("fleece")}"/>'
            f'<circle cx="{x + 3.2}" cy="{y - .6}" r="1.1" fill="{v("trunk")}"/>')


def barn(x, y, s):
    w, h = 34 * s, 22 * s
    return (f'<path d="M{x} {y} V{y - h:.1f} L{x + w / 2:.1f} {y - h - 14 * s:.1f} L{x + w:.1f} {y - h:.1f} V{y} Z" '
            f'fill="{v("barn")}"/>'
            f'<path d="M{x + w * .36:.1f} {y} V{y - h * .62:.1f} H{x + w * .64:.1f} V{y}" fill="{v("barn-door")}"/>'
            f'<path d="M{x - 2} {y - h:.1f} L{x + w / 2:.1f} {y - h - 15 * s:.1f} L{x + w + 2:.1f} {y - h:.1f}" '
            f'fill="none" stroke="{v("roof")}" stroke-width="{2 * s:.1f}" stroke-linejoin="round"/>')


def chaos_patch(x0, y0, x1, y1, n, seed):
    """Seeds thrown, not set: a fixed scatter from a fixed seed, so the drawing
    is the same on every build and nothing in it was placed by hand."""
    import random
    rnd = random.Random(seed)
    inks = [v("bloom-1"), v("bloom-2"), v("bloom-3"), v("bloom-4"), v("cloud")]
    dots = []
    for _ in range(n):
        x, y = rnd.uniform(x0, x1), rnd.uniform(y0, y1)
        dots.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{rnd.uniform(1.1, 2.4):.1f}" fill="{rnd.choice(inks)}"/>')
    return "".join(dots)


def view_svg():
    W, H = 1200, 470
    out = [f'<svg class="{P}-view__draw" viewBox="0 0 {W} {H}" aria-hidden="true" focusable="false">',
           '<defs>',
           f'<linearGradient id="{P}-sky-fade" x1="0" y1="0" x2="0" y2="1">'
           f'<stop offset="0" stop-color="{v("sky-high")}"/><stop offset="1" stop-color="{v("sky")}"/></linearGradient>',
           f'<filter id="{P}-soft" x="-30%" y="-60%" width="160%" height="220%">'
           '<feGaussianBlur stdDeviation="16"/></filter>',
           '</defs>',
           f'<rect width="{W}" height="200" fill="url(#{P}-sky-fade)"/>']
    out += [cloud(210, 70, 1.0), cloud(640, 46, .8), cloud(980, 84, 1.15), cloud(420, 120, .55)]
    # The far ridge, and the valley floor in front of it.
    out.append(f'<path d="M0 182 C 120 150, 230 168, 330 160 S 520 132, 640 150 S 860 170, 960 148 S 1120 140, 1200 160 '
               f'L1200 210 L0 210 Z" fill="{v("ridge")}"/>')
    out.append(f'<rect y="200" width="{W}" height="{H - 200}" fill="{v("pasture")}"/>')
    # THE PATCHWORK. Fields in bands that widen towards you, each a polygon
    # between lines that run back to one vanishing point above the ridge.
    vp = (600, 120)

    def at(x, y):
        """Where a line from the vanishing point through (x, 470) crosses y."""
        t = (y - vp[1]) / (H - vp[1])
        return vp[0] + (x - vp[0]) * t

    bands = [200, 228, 262, 312, 392]
    cols = [-900, -420, -60, 260, 600, 940, 1300, 1800, 2400]
    fills = ["wheat", "pasture", "plough", "meadow", "pasture", "wheat", "meadow", "plough",
             "meadow", "plough", "wheat", "pasture", "wheat", "meadow", "pasture", "plough",
             "pasture", "wheat", "meadow", "pasture", "plough", "meadow", "wheat", "pasture",
             "plough", "pasture", "meadow", "wheat", "pasture", "meadow", "plough", "wheat"]
    i = 0
    for b in range(len(bands) - 1):
        y0, y1 = bands[b], bands[b + 1]
        for c in range(len(cols) - 1):
            x0, x1 = cols[c], cols[c + 1]
            pts = [(at(x0, y0), y0), (at(x1, y0), y0), (at(x1, y1), y1), (at(x0, y1), y1)]
            out.append(field(pts, v(fills[i % len(fills)])))
            i += 1
    # Hedgerows along every field edge.
    for y in bands[1:]:
        out.append(f'<path d="M0 {y} H{W}" stroke="{v("hedge")}" stroke-width="{1 + (y - 200) / 70:.1f}"/>')
    for x in cols:
        out.append(f'<path d="M{at(x, 200):.1f} 200 L{at(x, 392):.1f} 392" stroke="{v("hedge")}" stroke-width="1.6"/>')
    # THE PLACES, west to east as the fingerpost has them.
    # The sanctuary: wetland, reeds and trees by the wood, a low barn with a ramp.
    out.append(f'<ellipse cx="150" cy="300" rx="96" ry="18" fill="{v("water")}"/>')
    out.append("".join(f'<path d="M{x} 304 q-2 -9 -1 -16" stroke="{v("hedge")}" stroke-width="1.2" fill="none"/>'
                       for x in range(70, 232, 9)))
    out.append(tree(250, 300, 11) + tree(268, 296, 8) + tree(42, 296, 12))
    out.append(f'<path d="M188 276 h40 v-12 l-20 -9 l-20 9 Z" fill="{v("byre")}"/>'
               f'<path d="M228 276 l16 6" stroke="{v("byre")}" stroke-width="2"/>')
    # The cannabis farm: three hoop houses in the second band.
    out.append(hoop(318, 258, 52) + hoop(378, 258, 52) + hoop(438, 258, 52))
    # The solar farm, far and in the middle: rows of panels on posts, sheep under.
    for r, y in enumerate((212, 222, 234)):
        out.append(panel_row(520 - r * 8, y, 8 + r, 16 + r * 2))
    out.append("".join(sheep(x, 250) for x in (540, 588, 627, 672)))
    # The farm: the barn, nut trees in rows with crops between, and corn.
    out.append(barn(790, 262, 1.25))
    out.append("".join(tree(x, 300, 7) for x in range(700, 930, 26)))
    out.append("".join(tree(x, 336, 9) for x in range(690, 960, 34)))
    out.append("".join(f'<path d="M{x} 384 V366 M{x} 372 l-4 -5 M{x} 377 l4 -5" stroke="{v("corn")}" '
                       f'stroke-width="1.6" stroke-linecap="round"/>' for x in range(700, 960, 12)))
    # The chaos gardens: seed thrown across the eastern fields.
    out.append(chaos_patch(968, 266, 1086, 384, 200, 11))
    # THE CLOUDS' SHADOWS, lying across whole fields, softer than anything
    # with an edge. Nothing on the ground casts them.
    out.append(f'<g filter="url(#{P}-soft)" fill="{v("cloud-shadow")}" opacity=".5">'
               '<ellipse cx="350" cy="250" rx="210" ry="30"/>'
               '<ellipse cx="990" cy="330" rx="150" ry="46"/>'
               '<ellipse cx="640" cy="350" rx="170" ry="26"/></g>')
    # The near field, in the cloud's shadow you are standing in, the stile and
    # the edge of the wood either side of it.
    out.append(f'<path d="M0 392 C 260 384, 520 398, 760 390 S 1060 386, 1200 394 L1200 {H} L0 {H} Z" '
               f'fill="{v("shade")}"/>')
    for x, w in ((0, 120), (1090, 110)):
        out.append(f'<rect x="{x}" y="0" width="{w}" height="{H}" fill="{v("wood")}"/>')
    out.append("".join(f'<path d="M{x} {H} V{y}" stroke="{v("trunk")}" stroke-width="{s}"/>'
                       for x, y, s in ((22, 60, 9), (64, 20, 12), (104, 90, 7), (1112, 40, 10), (1152, 0, 13),
                                       (1190, 70, 8))))
    out.append(f'<path d="M120 0 C 150 60, 128 140, 160 200 C 170 240, 140 300, 120 {H}" fill="{v("wood")}"/>'
               f'<path d="M1090 0 C 1060 80, 1080 150, 1046 210 C 1030 260, 1070 330, 1090 {H}" fill="{v("wood")}"/>')
    out.append(f'<g stroke="{v("stile")}" stroke-width="5" stroke-linecap="round">'
               '<path d="M560 470 V404 M640 470 V404 M552 420 H648 M552 444 H648"/></g>'
               f'<path d="M596 470 V452 H620" stroke="{v("stile")}" stroke-width="4" fill="none"/>')
    out.append('</svg>')
    return "".join(out)


# ── The fingerpost, the table and the quotations ─────────────────────────────

def arms(d):
    out = [f'    <ul class="{P}-arms">']
    for p in d["places"]:
        open_ = p["state"] == "open"
        cls = f"{P}-arm" if open_ else f"{P}-arm {P}-arm--raising"
        name = (f'<a href="{p["page"]}">{nc.esc(p["name"])}</a>' if open_ else nc.esc(p["name"]))
        note = "" if open_ else f'\n        <p class="{P}-arm__note">Being raised. The sign is up and the place is not open yet.</p>'
        out.append(f'      <li class="{cls}">\n'
                   f'        <div class="{P}-arm__board"><span class="{P}-arm__no">{nc.esc(p["bearing"].upper())}</span>'
                   f'<h3>{name}</h3></div>\n'
                   f'        <p class="{P}-arm__what">{nc.esc(p["what"])}</p>\n'
                   f'        <p class="{P}-arm__land">The land here is {nc.esc(p["land"])}.</p>{note}\n'
                   '      </li>')
    out.append('    </ul>')
    return "\n".join(out)


def end_name(d, t, order):
    places = {p["key"]: p for p in d["places"]}
    if t in places:
        p = places[t]
        return (f'<a href="{p["page"]}">{nc.esc(p["name"])}</a>' if p["state"] == "open" else nc.esc(p["name"]))
    e = d["ends"][t]
    if e.get("page") and e["page"] in order:
        return f'<a href="{e["page"]}">{nc.esc(e["name"])}</a>'
    return nc.esc(e["name"])


def flows(d):
    order = walking_order()
    out = [f'    <table class="{P}-flows">',
           '      <caption class="sr">What each place gives, and where it goes</caption>',
           '      <thead><tr><th scope="col">From</th><th scope="col">What</th><th scope="col">Goes to</th></tr></thead>',
           '      <tbody>']
    for p in d["places"]:
        first = True
        for o in p["offers"]:
            frm = nc.esc(p["name"]) if first else f'<span class="sr">{nc.esc(p["name"])}</span>'
            first = False
            to = nc.listify([end_name(d, t, order) for t in o["to"]])
            out.append(f'        <tr><th scope="row">{frm}</th><td>{nc.esc(o["what"])}</td><td>{to}</td></tr>')
    out += ['      </tbody>', '    </table>']
    return "\n".join(out)


def credit(d):
    p = d["paper"]
    return (f'{nc.esc(p["short"])}, &ldquo;<a href="{p["url"]}">{nc.esc(p["title"])}</a>&rdquo;, '
            f'<i>{nc.esc(p["journal"])}</i> {p["volume"]}, {p["article"]} ({p["year"]}), '
            f'<a href="{p["licence_url"]}">{nc.esc(p["licence"])}</a>')


def quote(d, q):
    return (f'    <blockquote class="{P}-quote">\n'
            f'      <p>{nc.esc(q["said"])}</p>\n'
            f'      <footer>{credit(d)}, page {q["page"]}, {nc.esc(q["section"])}.</footer>\n'
            '    </blockquote>')


def liner(d):
    p = d["paper"]
    rows = [("The area, and what it is for",
             f'Ryan Boren&rsquo;s brief of 2026-10-11, after {credit(d)}, by {nc.esc(p["authors"])}, published '
             f'{nc.esc(nc.date_words(p["published"]))}. Every quotation on the page is from it, character for '
             'character, with its page and section, read off the PDF itself'),
            ("The view from the stile, the fingerpost and the table of what goes where",
             "Ours, drawn and written by tools/make-natures-contribution.py. The land is not a picture of any real "
             "place"),
]
    return "\n".join(f'      <tr><td>{w}</td><td>{s}</td></tr>' for w, s in rows)


def sweep_page():
    body = nc.page_body(PAGE, cut=("ncx:view", "ncx:quote:[\\w-]+"))
    nc.sweep(body, PAGE.name, VOCAB, problems)
    src = PAGE.read_text()
    ids = re.findall(r'\bid="([^"]+)"', src)
    dup = sorted({i for i in ids if ids.count(i) > 1})
    if dup:
        problems.refuse(f"ids with two owners on the page: {', '.join(dup)}")


def main():
    d = json.loads(DATA.read_text())
    check(d)
    problems.stop("the data")
    nc.swap(PAGE, "ncx:view", view_svg(), "      ")
    nc.swap(PAGE, "ncx:arms", arms(d), "    ")
    nc.swap(PAGE, "ncx:flows", flows(d), "    ")
    for q in d["quotes"]:
        nc.swap(PAGE, f"ncx:quote:{q['key']}", quote(d, q), "    ")
    nc.swap(NOTES, "natures-credits", liner(d), "      ")
    sweep_page()
    problems.stop("the page as written")
    print("nature's contribution: the view, the fingerpost, what goes where, the quotations and the credits written")


if __name__ == "__main__":
    main()
