#!/usr/bin/env python3
"""Build All Needs Met Wildlife Sanctuary out of data/all-needs-met.json and
data/all-needs-met-month.json: the night round, the residents, the preserve's
wild neighbours, what the sanctuary gives, the screen in the keepers' hut and
its rack, and the room's credits in the liner notes.

WHAT THE ROOM IS. Ryan Boren's brief, 2026-10-11: in Nature's Contribution, a
wildlife preserve for local wildlife and a sanctuary for disabled and abandoned
animals, offering connection, conservation, education and manure, with a rack of
the latest month from fourteen channels he listed.

THE LIGHT IS NOT LIGHT. It is the night round: the keepers go round after dark
with a viewer that sees warmth, because a torch wakes everybody, and in it every
resident shows by their own warmth, white against a cold black night. All needs
met is what that picture shows: somebody fed, sheltered and warm. HEAT HAS NO
COLOUR, so nothing in this room has a hue: the tool reads every --anm- colour in
love.css's :root and every literal colour in §105, and refuses one whose red,
green and blue are not the same number. The friendly edit is a false-colour
palette, purple to orange, because that is what thermal pictures usually look
like; it would also put this room next to Learning Large's red and blue lamps,
and it would make the warmth a decoration instead of the only light. The viewer
has no crosshair, because the instrument a crosshair belongs to is a scope.

IT REFUSES, and writes nothing when it does:

  · A COLOUR WITH A HUE, as above.
  · A RESIDENT WITHOUT A NAME, A KIND, HOW THEY CAME, HOW THEY GET ABOUT OR WHAT
    THEY LIKE. Each one is somebody, not a condition.
  · PITY AND INSPIRATION in our voice, Laughingstock's rule arriving where it is
    most likely to be broken kindly: nobody here is brave, suffering, special,
    an inspiration or anybody's lesson. They are goats and hens getting on with
    it, and the friendly edit is a sentence about how much they have overcome.
  · A RESIDENT FOR SALE, FOR BREEDING OR FOR MEAT. They live here for good; the
    manure is the only thing that leaves, and the area's tool holds that too.
  · A WILD NEIGHBOUR WITH A LATIN NAME, or a sentence telling anybody how to
    find or tell one apart: the herbarium's binomial rule and Mycelium Munchies'
    refusal to be a field guide.
  · AN OFFERING OF THE BRIEF'S LEFT OUT.
  · THE RACK, with Learning Large's rules: a video older than the month, a row
    carrying a description or a count, a screen with no runtime, a door with no
    reason, an id twice, a channel not in the list. THE TITLES ARE THE CHANNELS'
    AND ARE NOT SWEPT: some of them are sold as danger and bites, which is
    theirs to say, beside a sanctuary that says otherwise in its own words.
  · A TALLY: no count of animals rescued, saved or housed. Nobody is counted.
  · A SCRIPT OF ITS OWN, or anything that sends anything anywhere.

`--month` redraws only the rack, for tools/daily-sanctuary.sh on the morning
timer, so a session's edit to the rest of the page is never touched by it.
"""
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import natures as nc  # noqa: E402

ROOT = nc.ROOT
DATA = ROOT / "data/all-needs-met.json"
MONTHLY = ROOT / "data/all-needs-met-month.json"
PAGE = ROOT / "all-needs-met.html"
NOTES = ROOT / "liner-notes.html"
CSS = ROOT / "love.css"
P = "anm"
SECTION = 105
SCREEN = ("anm", "the screen in the keepers' hut")
RESIDENT_KEYS = {"key", "name", "kind", "came", "gets_about", "likes"}

PITY = (r"brave(?:ly|ry)?|courage(?:ous)?|inspir\w+|heroes?|heroic|overcom\w+|despite|suffer\w*|"
        r"special needs|handicap\w*|crippled?|poor (?:thing|things|creatures?|dears?)|victims?|tragic\w*|"
        r"broken|bound to|confined to|wheelchair[- ]bound|afflicted|plucky|miracle|fighters?|warriors?")
SOLD = (r"for sale|sell|sells|selling|sold|slaughter\w*|butcher\w*|for meat|breed(?:ing|s)?|bred|"
        r"auction\w*|cull\w*|livestock")
VOCAB = [
    (PITY, "pity or inspiration. Nobody here is brave, suffering, special or anybody's lesson: they are "
           "goats and hens getting on with it, Laughingstock's rule."),
    (SOLD, "a resident for sale, for breeding or for meat. They live here for good; only the manure leaves."),
    (nc.TALLY + r"|rescued (?:\d+|hundreds|thousands)|\d[\d,]* (?:animals|residents|rescues)",
     "a tally. Nobody here is counted, and no number of animals saved is anybody's boast."),
]
BINOMIAL = re.compile(r"\b[A-Z][a-z]+ [a-z]{3,}(?:us|um|a|is|ae|ii|i)\b")
FIELD_GUIDE = (r"how to (?:find|spot|identify|tell)|identif\w+|look for|you can tell|field marks?|"
               r"distinguish\w*|to find them")

problems = nc.Problems()


# ── Checks ───────────────────────────────────────────────────────────────────

def no_hue():
    css = CSS.read_text()
    root = re.findall(r"--anm-[\w-]+:\s*(#[0-9A-Fa-f]{3,6})\b", css)
    m = re.search(rf"/\* §{SECTION} ── .*?(?=/\* §{SECTION + 1} ──|/\* §\d+ ── )", css, re.S)
    if not root:
        problems.refuse("love.css declares no --anm- colours.")
    lit = []
    if not m or "All Needs Met" not in m.group(0)[:200]:
        problems.refuse(f"love.css has no §{SECTION} for All Needs Met, so there is nothing to check.")
    else:
        body = re.sub(r"/\*.*?\*/", " ", m.group(0), flags=re.S)
        lit = re.findall(r"#[0-9A-Fa-f]{6}\b|#[0-9A-Fa-f]{3}\b", body)
        if re.search(r"rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+", body):
            for r, g, b in re.findall(r"rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)", body):
                if not (r == g == b):
                    problems.refuse(f"§{SECTION} has rgb({r}, {g}, {b}), which has a hue. Heat has no colour.")
    for h in root + lit:
        x = h.lstrip("#")
        if len(x) == 3:
            x = "".join(c * 2 for c in x)
        if not (x[0:2].lower() == x[2:4].lower() == x[4:6].lower()):
            problems.refuse(f"{h} in All Needs Met has a hue. Heat has no colour, and in a viewer that sees "
                            "warmth every resident is white and the night is black.")


def check(d):
    seen = set()
    for r in d.get("residents") or []:
        k = r.get("key") or "?"
        if set(r) - RESIDENT_KEYS:
            problems.refuse(f"resident {k!r} carries {sorted(set(r) - RESIDENT_KEYS)}, which nothing reads.")
        for f in RESIDENT_KEYS:
            if not (r.get(f) or "").strip():
                problems.refuse(f"resident {k!r} has no {f}. Each one is somebody, not a condition.")
        if k in seen:
            problems.refuse(f"two residents have the key {k!r}.")
        seen.add(k)
        nc.sweep(" ".join(str(v) for v in r.values()), f"resident {k}", VOCAB, problems)
    if len(d.get("residents") or []) < 2:
        problems.refuse("the sanctuary has fewer than two residents, which is a yard with nobody in it.")
    for n in d.get("neighbours") or []:
        txt = f'{n.get("name", "")} {n.get("when", "")}'
        if BINOMIAL.search(txt):
            problems.refuse(f"wild neighbour {n.get('name')!r}: {BINOMIAL.search(txt).group(0)!r} looks like a "
                            "Latin name. Plain names only: a binomial reads as a determination.")
        if re.search(rf"\b(?:{FIELD_GUIDE})\b", txt, re.I):
            problems.refuse(f"wild neighbour {n.get('name')!r} tells somebody how to find or tell it apart. "
                            "This is not a field guide.")
        if not (n.get("name") and n.get("when")):
            problems.refuse(f"a wild neighbour has no name or no when: {n}")
    brief = {"connection", "conservation", "education", "manure"}
    have = {o.get("what") for o in d.get("offers") or []}
    if brief - have:
        problems.refuse(f"the brief says the sanctuary offers {sorted(brief - have)}, and nothing here does.")
    for o in d.get("offers") or []:
        nc.sweep(o.get("how", ""), f"offer {o.get('what')}", VOCAB, problems)


# ── The night round, as the viewer sees it ───────────────────────────────────

def v(name):
    return f"var(--{P}-{name})"


def warm(shape, glow=True):
    """A body in the viewer: white, with the warmth coming off it as a soft
    grey halo. Nothing cold has a halo."""
    halo = (f'<g filter="url(#{P}-heat)" fill="{v("halo")}" stroke="{v("halo")}" stroke-width="6">{shape}</g>'
            if glow else "")
    return halo + f'<g fill="{v("body")}">{shape}</g>'


def goat(x, y):
    # Three legs, and her head down to the hay.
    return warm(f'<ellipse cx="{x}" cy="{y}" rx="26" ry="13"/><path d="M{x + 20} {y - 6} l18 8 l-2 10 l-14 -6z"/>'
                f'<rect x="{x - 18}" y="{y + 8}" width="5" height="20"/><rect x="{x + 4}" y="{y + 8}" width="5" height="20"/>'
                f'<rect x="{x + 14}" y="{y + 8}" width="5" height="20"/>')


def hen(x, y):
    return warm(f'<ellipse cx="{x}" cy="{y}" rx="11" ry="9"/><circle cx="{x + 9}" cy="{y - 9}" r="5"/>'
                f'<path d="M{x - 10} {y - 4} l-7 -8 l3 12z"/>')


def dog(x, y):
    # Lying down, facing the door.
    return warm(f'<ellipse cx="{x}" cy="{y}" rx="30" ry="10"/><circle cx="{x + 30}" cy="{y - 8}" r="10"/>'
                f'<path d="M{x + 26} {y - 16} l4 -10 l5 9z"/><path d="M{x - 30} {y} q-14 -2 -18 -10" stroke="{v("body")}" stroke-width="5" fill="none"/>')


def pig(x, y):
    return warm(f'<ellipse cx="{x}" cy="{y}" rx="38" ry="22"/><ellipse cx="{x + 38}" cy="{y + 2}" rx="12" ry="10"/>'
                f'<rect x="{x - 26}" y="{y + 16}" width="8" height="14"/><rect x="{x + 16}" y="{y + 16}" width="8" height="14"/>')


def sheep(x, y):
    return warm(f'<ellipse cx="{x}" cy="{y}" rx="24" ry="15"/><ellipse cx="{x - 24}" cy="{y - 4}" rx="9" ry="7"/>'
                f'<rect x="{x - 14}" y="{y + 10}" width="4" height="14"/><rect x="{x + 10}" y="{y + 10}" width="4" height="14"/>')


def rabbit(x, y):
    # Her head on one side.
    return warm(f'<ellipse cx="{x}" cy="{y}" rx="13" ry="10"/><circle cx="{x + 10}" cy="{y - 9}" r="6"/>'
                f'<path d="M{x + 12} {y - 14} l10 -12 l2 3 l-8 11z"/><path d="M{x + 8} {y - 14} l-2 -15 l3 0 l2 15z"/>')


def duck(x, y):
    return warm(f'<ellipse cx="{x}" cy="{y}" rx="15" ry="8"/><circle cx="{x + 13}" cy="{y - 9}" r="5"/>'
                f'<path d="M{x + 17} {y - 9} l8 2 l-8 2z"/>')


def owl(x, y):
    return warm(f'<ellipse cx="{x}" cy="{y}" rx="12" ry="18"/><circle cx="{x}" cy="{y - 20}" r="10"/>'
                f'<path d="M{x - 8} {y - 28} l-3 -8 l7 5z M{x + 8} {y - 28} l3 -8 l-7 5z"/>')


def deer(x, y):
    return warm(f'<ellipse cx="{x}" cy="{y}" rx="26" ry="12"/><path d="M{x + 20} {y - 6} l8 -26 l10 2 l-6 26z"/>'
                f'<ellipse cx="{x + 34}" cy="{y - 32}" rx="9" ry="6"/>'
                f'<rect x="{x - 20}" y="{y + 8}" width="3.5" height="26"/><rect x="{x - 12}" y="{y + 8}" width="3.5" height="26"/>'
                f'<rect x="{x + 12}" y="{y + 8}" width="3.5" height="26"/><rect x="{x + 18}" y="{y + 8}" width="3.5" height="26"/>')


def heron(x, y):
    return warm(f'<ellipse cx="{x}" cy="{y}" rx="13" ry="9"/><path d="M{x + 8} {y - 4} q8 -14 2 -26" stroke="{v("body")}" '
                f'stroke-width="4" fill="none"/><circle cx="{x + 10}" cy="{y - 31}" r="4"/><path d="M{x + 13} {y - 31} l14 3 l-14 1z"/>'
                f'<path d="M{x - 2} {y + 7} v18 M{x + 3} {y + 7} v18" stroke="{v("body")}" stroke-width="2"/>')


def view_svg():
    W, H = 1200, 560
    # The sky is cropped to a strip: in this viewer it is the coldest, emptiest
    # thing there is, and a picture of mostly nothing is not the night round.
    out = [f'<svg class="{P}-view__draw" viewBox="0 130 {W} {H - 130}" aria-hidden="true" focusable="false">',
           '<defs>',
           f'<filter id="{P}-heat" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="9"/></filter>',
           f'<linearGradient id="{P}-ground-fall" x1="0" y1="0" x2="0" y2="1">'
           f'<stop offset="0" stop-color="{v("ground-far")}"/><stop offset="1" stop-color="{v("ground")}"/></linearGradient>',
           '</defs>',
           f'<rect width="{W}" height="{H}" fill="{v("sky")}"/>']
    # The trees along the back hold a little of the day, so they are a shade
    # above the sky; the ground holds more, and more the nearer it is.
    out.append(f'<path d="M0 220 ' + " ".join(f"Q{x + 25} {170 + (x * 37) % 40} {x + 50} {214 + (x * 13) % 12}"
                                              for x in range(0, W, 50)) + f' L{W} 260 L0 260 Z" fill="{v("trees")}"/>')
    out.append(f'<rect y="250" width="{W}" height="{H - 250}" fill="url(#{P}-ground-fall)"/>')
    # The wetland: cold water is the darkest thing on the ground, the reeds
    # round it a little warmer than the water and colder than the yard.
    out.append(f'<ellipse cx="270" cy="372" rx="250" ry="58" fill="{v("water")}"/>')
    out.append("".join(f'<path d="M{x} {404 - (x % 7)} q{(x % 5) - 2} -18 {(x % 3) - 1} -{26 + x % 11}" '
                       f'stroke="{v("reed")}" stroke-width="2" fill="none"/>' for x in range(28, 520, 11)))
    # The barn and the keepers' hut: their walls cooler than the animals,
    # their roofs coldest of all where they face the sky, and their doorways
    # bright, because everybody inside is warm.
    out.append(f'<rect x="640" y="268" width="250" height="140" fill="{v("wall")}"/>'
               f'<path d="M626 270 L765 196 L904 270 Z" fill="{v("roof")}"/>'
               f'<g filter="url(#{P}-heat)" fill="{v("halo")}"><rect x="732" y="320" width="66" height="88"/></g>'
               f'<rect x="740" y="328" width="50" height="80" fill="{v("door")}"/>'
               f'<path d="M790 408 l46 22 h-46z" fill="{v("wall")}"/>')
    out.append(f'<rect x="1010" y="300" width="130" height="96" fill="{v("wall")}"/>'
               f'<path d="M1000 302 L1075 262 L1150 302 Z" fill="{v("roof")}"/>'
               f'<g filter="url(#{P}-heat)" fill="{v("halo")}"><rect x="1036" y="324" width="44" height="32"/></g>'
               f'<rect x="1040" y="328" width="36" height="24" fill="{v("door")}"/>')
    # Otis's mews: wire, which is as cold as the air.
    out.append(f'<g stroke="{v("wire")}" stroke-width="1.4" fill="none"><rect x="920" y="300" width="70" height="104"/>'
               + "".join(f'<path d="M{x} 300 V404"/>' for x in range(930, 990, 10))
               + f'<path d="M920 352 H990"/></g><path d="M930 360 H982" stroke="{v("wall")}" stroke-width="4"/>')
    out.append(owl(956, 344))
    # The residents in the yard, each by their own warmth.
    out += [goat(660, 470), hen(560, 476), hen(590, 488), dog(800, 452), pig(880, 492),
            sheep(990, 468), rabbit(724, 512), duck(500, 420)]
    # The wild neighbours: a heron in the shallows, a deer at the trees, bats
    # over the water, a muskrat at the bank.
    out.append(heron(180, 380))
    out.append(deer(560, 236))
    out.append("".join(warm(f'<path d="M{x} {y} l6 -3 l6 3 l6 -3 l6 3 l-6 1.5 l-6 -1.5 l-6 1.5z"/>', glow=False)
                       for x, y in ((220, 300), (300, 280), (360, 312), (130, 296))))
    out.append(warm(f'<ellipse cx="420" cy="404" rx="10" ry="6"/>'))
    out.append('</svg>')
    return "".join(out)


def scale():
    """The viewer's key: colder to warmer, with no numbers, because a number on
    an animal is the beginning of a chart about it."""
    return (f'<div class="{P}-scale" aria-hidden="true"><span>colder</span><span class="{P}-scale__bar"></span>'
            f'<span>warmer</span></div>')


# ── The residents, the preserve and what it gives ────────────────────────────

def residents(d):
    out = [f'    <ul class="{P}-residents">']
    for r in d["residents"]:
        out.append(f'      <li class="{P}-resident" id="{P}-{r["key"]}">\n'
                   f'        <h3 class="{P}-resident__name">{nc.esc(r["name"])}</h3>\n'
                   f'        <p class="{P}-resident__kind">{nc.esc(r["kind"][:1].upper() + r["kind"][1:])}.</p>\n'
                   f'        <p>Came {nc.esc(r["came"])}. Gets about {nc.esc(r["gets_about"])}. '
                   f'Likes {nc.esc(r["likes"])}.</p>\n'
                   '      </li>')
    out.append('    </ul>')
    return "\n".join(out)


def neighbours(d):
    out = [f'    <ul class="{P}-wild">']
    for n in d["neighbours"]:
        out.append(f'      <li><b>{nc.esc(n["name"][:1].upper() + n["name"][1:])}</b>, {nc.esc(n["when"])}.</li>')
    out.append('    </ul>')
    return "\n".join(out)


def offers(d):
    out = [f'    <dl class="{P}-offers">']
    for o in d["offers"]:
        out.append(f'      <div><dt>{nc.esc(o["what"][:1].upper() + o["what"][1:])}</dt><dd>{nc.esc(o["how"])}</dd></div>')
    out.append('    </dl>')
    return "\n".join(out)


def screen():
    return nc.screen_block(P, SCREEN[0], SCREEN[1],
                           "<b>The screen in the keepers&rsquo; hut.</b> Nothing is on it. Any film on the rack can "
                           "go up here with the button under it, and nothing loads until you press one.")


def liner_rows(d, r):
    rows = [("The sanctuary, and what it gives",
             "Ryan Boren&rsquo;s brief of 2026-10-11, in his words: a wildlife preserve for local wildlife and a "
             "sanctuary for disabled and abandoned animals, offering connection, conservation, education and manure"),
            ("The residents and the night round",
             "Ours, and fictional: nobody here is a real animal, and nothing about any of them is a claim about a real "
             "sanctuary. Drawn and written by tools/make-all-needs-met.py")]
    out = "\n".join(f'      <tr><td>{w}</td><td>{s}</td></tr>' for w, s in rows)
    return out + "\n" + nc.month_credit(r)


def sweep_page():
    body = nc.page_body(PAGE, cut=("anm:month", "anm:view"))
    nc.sweep(body, PAGE.name, VOCAB, problems)
    src = PAGE.read_text()
    scripts = re.findall(r'<script src="([^"]+)"', src)
    if sorted(scripts) != sorted(["love.js", "love-embed.js", "rack.js", "quest.js"]):
        problems.refuse(f"the room loads {scripts}. It loads love.js, love-embed.js, rack.js and quest.js and "
                        "nothing else: a script of its own would be the first thing in here that could send "
                        "something somewhere.")
    if re.search(r"\bfetch\(|XMLHttpRequest|EventSource|WebSocket", src):
        problems.refuse("the page asks the network for something by itself.")
    ids = re.findall(r'\bid="([^"]+)"', src)
    dup = sorted({i for i in ids if ids.count(i) > 1})
    if dup:
        problems.refuse(f"ids with two owners on the page: {', '.join(dup)}")


def main():
    r = json.loads(MONTHLY.read_text())
    nc.check_month(r, MONTHLY.name, problems)
    if "--month" in sys.argv[1:]:
        problems.stop("the rack")
        nc.swap(PAGE, "anm:month", nc.month_block(r, P, SCREEN[0], SCREEN[1],
                                                  "A month of their films, newest first under each channel"), "")
        live = [x for x in r["log"] if x["state"] in ("screen", "door")]
        print(f"all needs met: the rack, filled {r['set']}, {sum(x['state'] == 'screen' for x in live)} screens "
              f"and {sum(x['state'] == 'door' for x in live)} doors")
        return
    d = json.loads(DATA.read_text())
    check(d)
    no_hue()
    problems.stop("the data")
    nc.swap(PAGE, "anm:view", view_svg() + scale(), "      ")
    nc.swap(PAGE, "anm:residents", residents(d), "    ")
    nc.swap(PAGE, "anm:wild", neighbours(d), "    ")
    nc.swap(PAGE, "anm:offers", offers(d), "    ")
    nc.swap(PAGE, "anm:screen", screen(), "")
    nc.swap(PAGE, "anm:month", nc.month_block(r, P, SCREEN[0], SCREEN[1],
                                              "A month of their films, newest first under each channel"), "")
    nc.swap(NOTES, "anm-credits", liner_rows(d, r), "      ")
    sweep_page()
    problems.stop("the page as written")
    print("all needs met: the night round, the residents, the preserve, what it gives, the screen and the rack written")


if __name__ == "__main__":
    main()
