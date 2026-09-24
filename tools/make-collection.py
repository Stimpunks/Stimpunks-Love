#!/usr/bin/env python3
"""Build The Collection Collection from data/collection.json, and refuse what it must not publish.

A DARK GALLERY WITH NO LIGHT OF ITS OWN, where every collection stands in a
cabinet of its own under a lamp of its own, and no two lamps are alike. The
room is a collection of collections, and the one thing a collector always
decides for themselves is how their things are lit -- so the house brings the
furniture and the owner brings the light.

WHAT IT BUILDS, all from the one data file so no two surfaces can disagree:

  · the drawing of the gallery in the header, and the sentence that says the
    same thing in words underneath it (the drawing is aria-hidden);
  · every cabinet, its label, and every photograph in it;
  · the quotations, and the line saying how long they are allowed to be;
  · the credit rows in liner-notes.html.
make-og.py lifts the drawing whole for the share card.

WHAT IT REFUSES, and why each one is here:

  · A PHOTOGRAPH CARRYING ANY METADATA AT ALL -- EXIF, GPS, XMP, IPTC. Stricter
    than make-polaroids.py, which looks only for EXIF: a phone writes XMP too,
    and a picture of somebody's pens should not say where their desk is.
    intake-collection.py strips it; this checks that it was stripped.
  · A PHOTOGRAPH NOBODY HAS DESCRIBED. No title, no alt, no caption, or nobody
    recorded as having written them, and it does not go up. The stub the intake
    tool writes is exactly this refusal waiting to happen.
  · A PHOTOGRAPH NOBODY HAS LOOKED AT. `nobody_in_it` and `nothing_says_where`
    must both be true, which is a person saying they looked at the whole frame.
    A person in the picture belongs to the polaroid wall's consent record and
    not here; an address, a letter or a view out of a window says where the
    collection lives, and a collection is exactly what somebody might come for.
  · A MAKER'S NAME IN WORDS CLAUDE WROTE, unless that name is legible in the
    photograph and transcribed into `reads`. Pens, inks and perfumes are all
    sold on their names, and a name typed from what a bottle looks like reads as
    a determination and is a guess -- the herbarium's refusal to guess at a
    binomial, in a room where every object has a label. The owner may name
    anything (`named`, `named_by`). The list below is short and says so: it
    catches the names a describer would reach for, and a model number it cannot
    catch is still covered by the rule in the data file.
  · VALUE, PRICE, RARITY AND COUNT, in the room's own voice and in every
    description, with the negation window so the house rules can say nobody
    asks. A cabinet with a number beside it has become an inventory, and a
    collection with a price beside it has become a list of things worth
    stealing. The pebbling cabinet's refusal of a tally, in the room most shaped
    like one.
  · A CSS FILTER, BLEND OR FADE ON A PHOTOGRAPH. The lamps are coloured and a
    lamp's colour laid over somebody's photograph would be a filter by another
    name. The glow goes round the picture and never on it -- the polaroid wall's
    promise, which is not waived because the thing in the picture is a pen.
  · A FULL CABINET WITH NO LAMP, A LAMP NOBODY DEFINED, AND TWO CABINETS WITH
    THE SAME LAMP. No two lamps alike is the room. A lamp is lit only when there
    is something to light, and the drawing shows none at all until the owner
    has chosen one.
  · A FILE IN collection/ WITH NO ENTRY, AND AN ENTRY WITH NO FILE. Withdrawal
    is deletion, so either half left behind is a withdrawal half-honoured.
  · A QUOTATION OVER THIRTY WORDS, or with no record of how it was checked.

IF THIS REFUSES: fix the cause. Do not widen a list to make it quiet.
"""
import html
import json
import re
import sys
from datetime import date
from pathlib import Path

import imgsize           # tools/imgsize.py: width and height read off the file

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "collection.json"
ROOM = ROOT / "collection-collection.html"
NOTES = ROOT / "liner-notes.html"
CSS = ROOT / "love.css"
PHOTOS = ROOT / "collection"
WORDS = 30

# ── The lamps ────────────────────────────────────────────────────────────────
# One per cabinet and never two alike. Each says what it is, where it shines
# from and WHY IT SUITS THE THING IT LIGHTS, which is the only reason a lamp is
# ever chosen here. A new one is added when an owner chooses it; its colour is a
# --cc- custom property in love.css §2 and is measured in check-contrast.py's
# ORNAMENT list, because it carries no word -- every word stands on a label.
LAMPS = {
    "daylight": {
        "css": "--cc-daylight",
        "drawn": "a daylight desk lamp on an arm",
        "says": "a daylight desk lamp on an arm, from the upper left",
        "why": "ink is the thing being collected, and a warm bulb tells lies about its colour",
    },
    "door-strip": {
        "css": "--cc-strip",
        "drawn": "a strip light inside the door",
        "says": "a strip light inside the door, which is on only while the door is open",
        "why": "light spoils perfume, so the cupboard is kept shut and dark and lights "
               "itself only while somebody is looking",
    },
}

# ── The furniture ────────────────────────────────────────────────────────────
# The house's guess at the right piece of furniture for each kind of thing,
# which the owner may change. Drawn in the field of view below; `drawn` is the
# sentence the window line uses for it.
BUILDS = {
    "writing-box":    "a writing box open on a little table",
    "cupboard":       "a tall cupboard with its door ajar",
    "pegboard":       "a pegboard on the wall over a bench",
    "plant-stand":    "a plant stand in three steps",
    "specimen-chest": "a chest of shallow drawers with books along the top and one drawer pulled out",
}

ITEM_KEYS = {"id", "file", "title", "alt", "caption", "words", "described_on", "reads",
             "named", "named_by", "nobody_in_it", "nothing_says_where", "received_on"}
CAB_KEYS = {"id", "owner", "collection", "said", "given", "build", "lamp", "items"}

# The names a describer reaches for first when a pen, an ink or a perfume looks
# like one it has seen. Short on purpose and not a catalogue: see the docstring.
MAKERS = (r"pelikan|pilot|namiki|lamy|sailor|platinum|parker|waterman|montblanc|mont blanc|"
          r"kaweco|twsbi|sheaffer|aurora|visconti|conklin|esterbrook|diamine|noodler'?s|"
          r"iroshizuku|j\. ?herbin|herbin|de atramentis|robert oster|kwz|pure pigments|"
          r"chanel|dior|guerlain|herm[eè]s|tom ford|le labo|byredo|diptyque|creed|"
          r"jo malone|yves saint laurent|ysl|lanc[oô]me|gucci|prada|versace|"
          r"serge lutens|maison margiela|replica|penhaligon'?s|frederic malle")
MAKER = re.compile(rf"\b(?:{MAKERS})\b", re.I)

NEGATION = (r"(?:no|not|nothing|never|neither|none|without|refuses?|refused|refusing|"
            r"cannot|does not|won't|will not|is not|are not|isn't|aren't|nobody|nor|declin\w+)")
VALUE = (r"worth|valu(?:e|ed|es|able|ation)|pric(?:e|es|ed|ing|eless)|costs?|costly|"
         r"expensive|cheap|rare|rarity|grails?|investments?|collectibles?|mint condition|"
         r"limited editions?|apprais\w+|insured|insurance")
TALLY = (r"how many|number of|in total|totals?|tall(?:y|ies)|tallied|counts?|counted|"
         r"counting|biggest|largest|smallest|ranked|rankings?|scores?|streaks?|"
         r"\d+\s+(?:pens?|inks?|bottles?|plants?|books?|rocks?|swatches|tools?|items?|things?)")
VOCAB = [
    (re.compile(rf"\b(?:{VALUE})\b", re.I),
     re.compile(rf"\b{NEGATION}\b[^.]{{0,80}}?\b(?:{VALUE})\b", re.I),
     "nothing here is priced, valued or called rare. A collection with a price beside it is "
     "a list of things worth taking."),
    (re.compile(rf"\b(?:{TALLY})\b", re.I),
     re.compile(rf"\b{NEGATION}\b[^.]{{0,80}}?\b(?:{TALLY})\b", re.I),
     "nothing here is counted. A cabinet with a number beside it has become an inventory."),
]
ENTITY = re.compile(r"&[a-zA-Z]+;|&#\d+;")
DATE = re.compile(r"^\d{4}-\d{2}-\d{2}$")

problems = []


def proper_noun(text, m):
    """A capitalised word in the middle of a sentence is somebody's name.

    The first thing this sweep ever refused was Devon Price, whose book is
    quoted on the page. Excepting the name would be the mistake this repo has
    written down three times; the shape is the check instead, as Looming
    Rocks' binomial guard has it -- a capital mid-sentence is a name, a capital
    at the start of one is still a word."""
    if not m.group(0)[:1].isupper():
        return False
    before = text[:m.start()].rstrip()
    return bool(before) and before[-1] not in ".!?:;\u2014("


def sweep(text, where):
    text = str(text)
    for rx, ok, why in VOCAB:
        for m in rx.finditer(text):
            if proper_noun(text, m):
                continue
            window = text[max(0, m.start() - 90):m.end()]
            if ok.search(window):
                continue
            problems.append(f"{where}: {m.group(0)!r} -- {why}")


def entity(v, where):
    if ENTITY.search(str(v)):
        problems.append(f"{where} carries an HTML entity. Everything here is escaped on the "
                        "way into the page; write the character.")


def metadata_in(raw):
    """Every kind of metadata a photograph can carry, named. Empty means clean.

    Deliberately blunt, like make-polaroids.py's has_exif, and stricter: any
    APP1 segment (EXIF or XMP), IPTC in APP13, or the equivalent chunks in a PNG
    or a WebP. ICC colour profiles are allowed through -- they say what colour
    the pixels are and nothing about who made them."""
    found = []
    if raw[:2] == b"\xff\xd8":
        i = 2
        while i + 4 < len(raw) and raw[i] == 0xFF:
            marker, size = raw[i + 1], int.from_bytes(raw[i + 2:i + 4], "big")
            body = raw[i + 4:i + 4 + 32]
            if marker == 0xE1:
                found.append("EXIF" if body.startswith(b"Exif") else
                             "XMP" if b"ns.adobe.com/xap" in raw[i + 4:i + 64] else "APP1")
            elif marker == 0xED:
                found.append("IPTC")
            elif marker in (0xE3, 0xE4, 0xE5, 0xEC):    # maker notes and friends
                found.append(f"APP{marker - 0xE0}")
            if marker in (0xDA, 0xD9):
                break
            i += 2 + size
    elif raw[:8] == b"\x89PNG\r\n\x1a\n":
        for tag in (b"eXIf", b"iTXt", b"tEXt", b"zTXt"):
            if tag in raw[:400000]:
                found.append(tag.decode())
    elif raw[:4] == b"RIFF" and raw[8:12] == b"WEBP":
        for tag in (b"EXIF", b"XMP "):
            if tag in raw[:400000]:
                found.append(tag.decode().strip())
    else:
        found.append("not a JPEG, PNG or WebP")
    return found


def check_nothing_filters_a_photo():
    """No filter, blend or fade reaches a photograph in this room.

    The lamps are coloured, which is the whole temptation: a daylight glow laid
    over a picture of an ink would change the colour of the ink, which is the one
    thing the lamp was chosen not to do. Crude and says so, like its model in
    make-polaroids.py: it reads selectors, and a filter four ancestors up would
    get past it. What it catches is the effect written onto the picture's own rule."""
    css = re.sub(r"/\*.*?\*/", "", CSS.read_text(), flags=re.S)
    bad = []
    for sel, body in re.findall(r"([^{}]+)\{([^{}]*)\}", css):
        if not re.search(r"(?<!-)\b(?:filter|mix-blend-mode|backdrop-filter)\s*:|\bopacity\s*:\s*(?:0?\.\d|0\b)", body):
            continue
        for part in sel.split(","):
            if re.search(r"\.cc-photo\b|\.cc-mat\b|\.collections\b[^,]*\bimg\b|\.cc-[\w-]+\s+img\b", part):
                bad.append(f"love.css  {part.strip()} {{{body.strip()[:60]}...}}")
                break
    if bad:
        problems.append(
            "a filter, blend or fade reaches a photograph:\n    " + "\n    ".join(bad) + "\n"
            "  The lamp's colour goes AROUND the picture and never on it. A glow on the case "
            "is fine; a colour laid over somebody's photograph is a filter by another name.")


def possessive(name):
    return name + ("’" if name.endswith("s") else "’s")


# ── Reading and refusing ─────────────────────────────────────────────────────

data = json.loads(DATA.read_text())
cabinets = data.get("cabinets", [])
quotes = data.get("quotes", [])
if not cabinets:
    problems.append("there are no cabinets, and the room is its cabinets.")

seen_ids, seen_lamps, seen_files = set(), {}, set()
for c in cabinets:
    cw = f"cabinet {c.get('id')}"
    for k in c:
        if k not in CAB_KEYS:
            problems.append(f"{cw}: unknown key {k!r}. A cabinet holds only {sorted(CAB_KEYS)}; "
                            "anything else is the start of describing somebody's collection for them.")
    for need in ("id", "owner", "collection", "given", "build"):
        if not str(c.get(need) or "").strip():
            problems.append(f"{cw}: no {need}.")
    if c.get("id") in seen_ids:
        problems.append(f"{cw}: in the file twice.")
    seen_ids.add(c.get("id"))
    if c.get("build") not in BUILDS:
        problems.append(f"{cw}: the build {c.get('build')!r} is not one this tool can draw. Add it "
                        "to BUILDS with a drawing of its own.")
    lamp = c.get("lamp")
    items = c.get("items") or []
    if lamp is not None and lamp not in LAMPS:
        problems.append(f"{cw}: the lamp {lamp!r} is not in LAMPS. A lamp is defined with the "
                        "reason it suits what it lights, or it is not a lamp here.")
    if items and lamp is None:
        problems.append(f"{cw}: there is something in it and no lamp. A lit cabinet has a lamp "
                        "its owner chose; ask them.")
    if lamp is not None:
        if lamp in seen_lamps:
            problems.append(f"{cw}: the {lamp} lamp is already {seen_lamps[lamp]}'s. No two "
                            "lamps in this room are alike; that is the room.")
        seen_lamps[lamp] = c.get("id")
    for k in ("owner", "collection", "said", "given"):
        entity(c.get(k) or "", f"{cw} {k}")
        sweep(c.get(k) or "", f"{cw} {k}")

    for it in items:
        w = f"{cw} item {it.get('id')}"
        for k in it:
            if k not in ITEM_KEYS:
                problems.append(f"{w}: unknown key {k!r}.")
        f = ROOT / str(it.get("file") or "")
        if not it.get("file") or not f.is_file():
            problems.append(f"{w}: no file at {it.get('file')!r}. Withdrawal is deletion: if it "
                            "came down, take the entry out too.")
        else:
            if f.parent != PHOTOS:
                problems.append(f"{w}: the file is not in collection/.")
            seen_files.add(f.name)
            meta = metadata_in(f.read_bytes())
            if meta:
                problems.append(f"{w}: {f.name} still carries {', '.join(meta)}. A photograph of "
                                "somebody's things must not say where their things are. Run it "
                                "through tools/intake-collection.py.")
        for need in ("title", "alt", "caption"):
            if not str(it.get(need) or "").strip():
                problems.append(f"{w}: no {need}. Nothing goes up undescribed.")
        if it.get("words") not in ("claude", "owner"):
            problems.append(f"{w}: `words` must say who wrote the title, alt and caption: "
                            "'claude' or 'owner'.")
        if not DATE.match(str(it.get("described_on") or "")):
            problems.append(f"{w}: no described_on date.")
        if it.get("nobody_in_it") is not True:
            problems.append(f"{w}: nobody has said there is nobody in it. A person in the picture "
                            "belongs to data/polaroids.json and its consent record, not here.")
        if it.get("nothing_says_where") is not True:
            problems.append(f"{w}: nobody has said the frame is clear of anything that says where "
                            "it was taken -- an address, post, a view out of a window.")
        alt, cap = str(it.get("alt") or ""), str(it.get("caption") or "")
        if alt and alt.strip().lower() == cap.strip().lower():
            problems.append(f"{w}: the caption is the alt again. A caption is the line under the "
                            "picture; the alt is what is in it.")
        if re.match(r"\s*(?:an? )?(?:image|picture|photo(?:graph)?) of\b", alt, re.I):
            problems.append(f"{w}: the alt starts by saying it is a picture, which a screen reader "
                            "has already said. Start with what is in it.")
        if len(alt.split()) > 45:
            problems.append(f"{w}: the alt is {len(alt.split())} words. One or two sentences that "
                            "can be said in one breath.")
        if len(str(it.get("title") or "").split()) > 9:
            problems.append(f"{w}: the title is more than a few words.")
        if it.get("named") and not str(it.get("named_by") or "").strip():
            problems.append(f"{w}: a name with nobody recorded as having given it.")
        if it.get("named_by") and it["named_by"] not in c.get("owner", ""):
            problems.append(f"{w}: named by {it['named_by']!r}, who is not this cabinet's owner. "
                            "Only the owner names their things.")
        if it.get("words") == "claude":
            reads = " ".join(it.get("reads") or [])
            for k in ("title", "alt", "caption"):
                for m in MAKER.finditer(str(it.get(k) or "")):
                    if m.group(0).lower() not in reads.lower():
                        problems.append(
                            f"{w} {k}: {m.group(0)!r} is a maker's name in words Claude wrote, and "
                            "it is not in `reads`. If it is legible in the photograph, transcribe "
                            "it there; if not, it is a guess that looks like a label. The owner "
                            "can name it in `named`.")
        for k in ("title", "alt", "caption", "named"):
            entity(it.get(k) or "", f"{w} {k}")
            sweep(it.get(k) or "", f"{w} {k}")

if PHOTOS.is_dir():
    for f in sorted(PHOTOS.iterdir()):
        if f.is_file() and not f.name.startswith(".") and f.name not in seen_files:
            problems.append(f"collection/{f.name} is in the repository with no entry. Either it "
                            "was withdrawn and the file was left behind, or it was never described. "
                            "Withdrawal is deletion.")

for q in quotes:
    w = f"quotation {q.get('id')}"
    n = len(str(q.get("text", "")).split())
    if not n:
        problems.append(f"{w}: no quotation.")
    if n > WORDS:
        problems.append(f"{w}: {n} words, and the limit is {WORDS}.")
    for need in ("who", "work", "where", "year", "url", "checked", "entry", "entry_name"):
        if not str(q.get(need, "")).strip():
            problems.append(f"{w}: no {need}.")
    for k, v in q.items():
        entity(v, f"{w} {k}")

check_nothing_filters_a_photo()

if problems:
    raise SystemExit("REFUSING to build The Collection Collection:\n  " + "\n  ".join(problems))


# ── Writing ──────────────────────────────────────────────────────────────────

def swap(page, marker, block, indent=""):
    src = page.read_text()
    begin, end = f"<!-- {marker}:begin -->", f"<!-- {marker}:end -->"
    if begin not in src or end not in src:
        raise SystemExit(
            f"REFUSING: {page.name} has no {marker} markers, so there is nowhere to write.\n"
            "Put them back rather than letting this tool go quiet -- a generator that\n"
            "writes nothing and exits 0 is how two surfaces drift apart.")
    page.write_text(re.sub(re.escape(begin) + r".*?" + re.escape(end),
                           lambda _m: begin + "\n" + block + "\n" + indent + end,
                           src, flags=re.S))


def esc(s):
    return html.escape(str(s), quote=False)


def attr(s):
    return html.escape(str(s), quote=True)


# ── The drawing ──────────────────────────────────────────────────────────────
# The gallery from the doorway: a row of cabinets standing apart on the bare
# floor, each drawn in the same dim line, and light only where a lamp is lit.
# Every build is a function of the slot it stands in, so the row reflows as the
# collection collection grows and nothing here says how many there are.
FLOOR = 292
LINE = 'stroke="var(--cc-line)" stroke-width="2" stroke-linejoin="round"'
BODY = 'fill="var(--cc-body)"'


def glow(cx, cy, rx, ry, lamp):
    """A lamp's light: a soft radial fall-off in the lamp's own colour, drawn
    BEHIND the furniture it lands on. The gradient is defined once per lamp in
    the drawing's <defs>, with an id no other page element uses (check-ids.py)."""
    return (f'<ellipse cx="{cx:.0f}" cy="{cy:.0f}" rx="{rx:.0f}" ry="{ry:.0f}" '
            f'fill="url(#cc-glow-{lamp})"/>')


def glow_defs():
    stops = []
    for k, v in LAMPS.items():
        stops.append(f'<radialGradient id="cc-glow-{k}">'
                     f'<stop offset="0" stop-color="var({v["css"]})" stop-opacity=".42"/>'
                     f'<stop offset=".55" stop-color="var({v["css"]})" stop-opacity=".14"/>'
                     f'<stop offset="1" stop-color="var({v["css"]})" stop-opacity="0"/>'
                     f'</radialGradient>')
    return "<defs>" + "".join(stops) + "</defs>"


def arm_lamp(x, y, lamp, lit):
    """A desk lamp on an arm rising from behind the table, its head over the box."""
    fill = f"var({LAMPS[lamp]['css']})" if lit else "var(--cc-body)"
    return (f'<path d="M{x - 38:.0f} {y + 104:.0f} L{x - 30:.0f} {y + 40:.0f} L{x:.0f} {y:.0f}" '
            f'fill="none" {LINE}/>'
            f'<path d="M{x - 14:.0f} {y - 6:.0f} L{x + 16:.0f} {y + 2:.0f} L{x + 8:.0f} {y + 18:.0f} '
            f'L{x - 20:.0f} {y + 10:.0f} Z" fill="{fill}" {LINE}/>')


def strip_lamp(x, y, width, lamp, lit):
    """One bar along the inside of a cupboard's head."""
    fill = f"var({LAMPS[lamp]['css']})" if lit else "var(--cc-body)"
    return f'<rect x="{x:.0f}" y="{y:.0f}" width="{width:.0f}" height="6" rx="2" fill="{fill}" {LINE}/>'


def draw(c, x0, w):
    """One cabinet in its slot, and its lamp if it has one. Returns svg text."""
    b, lamp, lit = c["build"], c.get("lamp"), bool(c.get("items"))
    cx = x0 + w / 2
    s = []
    if b == "writing-box":
        tw = min(w - 30, 150)
        tx = cx - tw / 2
        if lamp and lit:
            s.append(glow(tx + 30, 170, tw * .95, 95, lamp))
        s.append(f'<path d="M{tx + 12:.0f} 226 V{FLOOR} M{tx + tw - 12:.0f} 226 V{FLOOR}" {LINE}/>')
        s.append(f'<rect x="{tx:.0f}" y="218" width="{tw:.0f}" height="10" {BODY} {LINE}/>')
        s.append(f'<rect x="{tx + 14:.0f}" y="192" width="{tw - 28:.0f}" height="26" {BODY} {LINE}/>')
        s.append(f'<path d="M{tx + 14:.0f} 192 L{tx + 26:.0f} 150 H{tx + tw - 2:.0f} L{tx + tw - 14:.0f} 192" {BODY} {LINE}/>')
        s.append(f'<path d="M{tx + 30:.0f} 206 H{tx + tw - 30:.0f}" {LINE}/>')
        if lamp:
            s.append(arm_lamp(tx + 18, 112, lamp, lit))
    elif b == "cupboard":
        cw, top = min(w - 60, 92), 96
        x = cx - cw / 2 - 10
        s.append(f'<rect x="{x:.0f}" y="{top:.0f}" width="{cw:.0f}" height="{FLOOR - top:.0f}" {BODY} {LINE}/>')
        if lamp and lit:
            # INSIDE the cupboard, so drawn over its back and under its shelves
            s.append(glow(x + cw / 2, top + 20, cw * .75, 120, lamp))
        for yy in (150, 196, 242):
            s.append(f'<path d="M{x + 6:.0f} {yy} H{x + cw - 6:.0f}" {LINE}/>')
        # the door, swung out to the right on its hinge
        s.append(f'<path d="M{x + cw:.0f} {top:.0f} L{x + cw + 34:.0f} {top + 14:.0f} '
                 f'V{FLOOR - 14:.0f} L{x + cw:.0f} {FLOOR:.0f}" {BODY} {LINE}/>')
        if lamp:
            s.append(strip_lamp(x + 8, top + 6, cw - 16, lamp, lit))
    elif b == "pegboard":
        bw = min(w - 30, 150)
        x = cx - bw / 2
        s.append(f'<rect x="{x:.0f}" y="96" width="{bw:.0f}" height="104" {BODY} {LINE}/>')
        for yy in range(112, 196, 16):
            for xx in range(int(x) + 14, int(x + bw) - 8, 16):
                s.append(f'<circle cx="{xx}" cy="{yy}" r="1.6" fill="var(--cc-line)"/>')
        s.append(f'<rect x="{x - 6:.0f}" y="228" width="{bw + 12:.0f}" height="10" {BODY} {LINE}/>')
        s.append(f'<path d="M{x + 6:.0f} 238 V{FLOOR} M{x + bw - 6:.0f} 238 V{FLOOR}" {LINE}/>')
    elif b == "plant-stand":
        sw = min(w - 30, 150)
        x = cx - sw / 2
        steps = [(x, 250, sw), (x + sw * .18, 206, sw * .64), (x + sw * .34, 162, sw * .32)]
        for (sx, sy, ww) in steps:
            s.append(f'<rect x="{sx:.0f}" y="{sy}" width="{ww:.0f}" height="8" {BODY} {LINE}/>')
        s.append(f'<path d="M{x + 6:.0f} 258 V{FLOOR} M{x + sw - 6:.0f} 258 V{FLOOR} '
                 f'M{x + sw * .18 + 6:.0f} 214 V250 M{x + sw * .82 - 6:.0f} 214 V250 '
                 f'M{x + sw * .34 + 6:.0f} 170 V206 M{x + sw * .66 - 6:.0f} 170 V206" {LINE}/>')
    elif b == "specimen-chest":
        chw = min(w - 30, 150)
        x = cx - chw / 2
        s.append(f'<rect x="{x:.0f}" y="178" width="{chw:.0f}" height="{FLOOR - 178}" {BODY} {LINE}/>')
        for yy in (206, 234, 262):
            s.append(f'<path d="M{x + 6:.0f} {yy} H{x + chw - 6:.0f}" {LINE}/>')
        # one drawer pulled out towards us, shallow, with its compartments
        s.append(f'<path d="M{x + 10:.0f} 184 L{x - 4:.0f} 196 H{x + chw + 4:.0f} L{x + chw - 10:.0f} 184 Z" {BODY} {LINE}/>')
        # books along the top, standing, each its own width
        bx = x + 8
        for bwid, bh in ((10, 34), (14, 40), (8, 30), (12, 38), (16, 42), (9, 32)):
            if bx + bwid > x + chw - 8:
                break
            s.append(f'<rect x="{bx:.0f}" y="{178 - bh}" width="{bwid}" height="{bh}" {BODY} {LINE}/>')
            bx += bwid + 3
    return "".join(s)


n = len(cabinets)
slot = 1000 / n
shapes = [glow_defs(), f'<path d="M0 {FLOOR} H1000" stroke="var(--cc-line)" stroke-width="2"/>']
for i, c in enumerate(cabinets):
    shapes.append(draw(c, i * slot, slot))
svg = ('      <svg class="cc-gallery" viewBox="0 0 1000 310" fill="none" '
       'xmlns="http://www.w3.org/2000/svg">\n      ' + "\n      ".join(shapes) + "\n      </svg>")
swap(ROOM, "collection:gallery", svg, "")

window = []
for c in cabinets:
    what = BUILDS[c["build"]]
    lamp, lit = c.get("lamp"), bool(c.get("items"))
    if lamp:
        light = (f"with {LAMPS[lamp]['drawn']}, lit" if lit else
                 f"with {LAMPS[lamp]['drawn']}, switched off, because there is nothing in it yet")
    else:
        light = f"with no lamp yet, because the lamp is {possessive(c['owner'])} to choose"
    window.append(f"{possessive(c['owner'])} {c['collection'].lower()}: {what}, {light}")
swap(ROOM, "collection:window",
     f'    <p class="cc-window">In the picture: the gallery from the doorway, dark, with the '
     f'cabinets standing apart on the bare floor. {esc("; ".join(window))}.</p>', "")


def label(c):
    lamp, items = c.get("lamp"), c.get("items") or []
    out = [f'        <div class="cc-label">',
           f'          <p class="cc-label__whose">{esc(possessive(c["owner"]))}</p>',
           f'          <h3>{esc(c["collection"])}</h3>']
    if str(c.get("said") or "").strip():
        out.append(f'          <p class="cc-label__said">“{esc(c["said"])}” '
                   f'<span class="cc-label__who">— {esc(c["owner"])}</span></p>')
    if lamp:
        state = "" if items else " It is switched off until there is something in here to light."
        out.append(f'          <p class="cc-label__lamp">Lit by {esc(LAMPS[lamp]["says"])}, because '
                   f'{esc(LAMPS[lamp]["why"])}.{state}</p>')
    else:
        out.append(f'          <p class="cc-label__lamp">No lamp yet. The lamp is '
                   f'{esc(possessive(c["owner"]))} to choose, and it will be none of the ones '
                   f'already in here.</p>')
    if not items:
        # RELAYED IS WRITTEN AS RELAYED: a cabinet whose owner gave it to us
        # themselves is waiting for their photographs; one that reached us
        # through somebody else is waiting for its owner to want it at all.
        if not str(c["given"]).startswith("relayed"):
            out.append(f'          <p class="cc-empty">Nothing in it yet. The lamp goes on with the '
                       f'first photograph.</p>')
        else:
            out.append(f'          <p class="cc-empty">Nothing in it yet, and nothing goes in unless '
                       f'{esc(c["owner"])} send{"" if " and " in c["owner"] else "s"} it. The '
                       f'furniture is the house&rsquo;s guess, and theirs to change.</p>')
    if any(it.get("words") == "claude" for it in items):
        out.append(f'          <p class="cc-label__words">Titles, descriptions and captions written by '
                   f'Claude from {esc(possessive(c["owner"]))} photographs, so that nobody had to '
                   f'write them before sending; the owner&rsquo;s own words wherever they gave any, '
                   f'and anything wrong is changed the moment they say.</p>')
    out.append(f'          <p class="cc-label__given">Given {esc(c["given"])}.</p>')
    out.append('        </div>')
    return "\n".join(out)


def item(it):
    w, h = imgsize.size(ROOT / it["file"])
    title = it.get("named") or it["title"]
    named = (f' <span class="cc-tag__named">named by {esc(it["named_by"])}</span>'
             if it.get("named") else "")
    return (f'          <li class="cc-item">\n'
            f'            <figure>\n'
            f'              <div class="cc-mat"><img class="cc-photo" src="{attr(it["file"])}" '
            f'alt="{attr(it["alt"])}" width="{w}" height="{h}" loading="lazy" decoding="async"></div>\n'
            f'              <figcaption class="cc-tag"><b class="cc-tag__title">{esc(title)}</b>{named} '
            f'<span class="cc-tag__caption">{esc(it["caption"])}</span></figcaption>\n'
            f'            </figure>\n'
            f'          </li>')


cases = []
for c in cabinets:
    items = c.get("items") or []
    cls = ["cc-case", f"cc-case--{c['build']}"]
    if c.get("lamp"):
        cls.append(f"cc-lamp--{c['lamp']}")
    if not items:
        cls.append("cc-case--dark")
    body = ("\n        <ul class=\"cc-items\">\n" + "\n".join(item(it) for it in items) +
            "\n        </ul>") if items else ""
    cases.append(f'      <li class="{" ".join(cls)}" id="{attr(c["id"])}">\n{label(c)}{body}\n      </li>')
swap(ROOM, "collection:cabinets", '    <ul class="cc-cases">\n' + "\n".join(cases) + "\n    </ul>", "")


def quote_block(q):
    return (f'    <blockquote class="cc-quote">\n'
            f'      <p>{esc(q["text"])}</p>\n'
            f'      <cite>{esc(q["who"])}, <a href="{attr(q["url"])}"><i>{esc(q["work"])}</i></a>, '
            f'{esc(q["where"])}, {esc(q["year"])}. '
            f'<span class="cc-checked">{esc(q["checked"][0].upper() + q["checked"][1:])}. '
            f'<a href="{attr(q["entry"])}">{esc(q["entry_name"])}, in our glossary</a>.</span></cite>\n'
            f'    </blockquote>')


for q in quotes:
    swap(ROOM, f"collection:quote-{q['id']}", quote_block(q), "    ")

swap(ROOM, "collection:cap",
     f'    <p>Every quotation in this room is {WORDS} words or fewer, names who said it, where and '
     f'when, and says beside it how it was checked. <code>tools/make-collection.py</code> refuses '
     f'a longer one; refuses a photograph that still carries any metadata, that nobody has '
     f'described, or that nobody has looked at for a person or an address; refuses a maker&rsquo;s '
     f'name in words Claude wrote unless it can be read in the picture; refuses a filter on any '
     f'photograph; and refuses two cabinets with the same lamp.</p>', "")

rows = []
for q in quotes:
    rows.append(f'      <tr><td><strong>{esc(q["who"])}</strong></td>'
                f'<td><a href="{attr(q["url"])}">{esc(q["work"])}</a>, {esc(q["where"])}</td>'
                f'<td>{esc(q["year"])}</td><td>{esc(q["checked"])}</td>'
                f'<td>{len(str(q["text"]).split())} words</td></tr>')
swap(NOTES, "collection-credits", "\n".join(rows), "      ")

# ── The page's own copy, swept ───────────────────────────────────────────────
# AFTER the write, so what is checked is what is published. Out first: the job
# marker (make-guild.py sweeps its own), the quotations and their cites, every
# <i> (titles), and anything in curly quotes, which in this room is an owner's
# own sentence or a question being refused.
page = ROOM.read_text()
page = re.sub(r"<!-- quest:.*?:end -->", " ", page, flags=re.S)
page = re.sub(r"<!--.*?-->", " ", page, flags=re.S)
page = re.sub(r"<(script|style|svg)\b.*?</\1>", " ", page, flags=re.S)
page = re.sub(r"<head>.*?</head>", " ", page, flags=re.S)
page = re.sub(r"<(blockquote|cite|i)\b.*?</\1>", " ", page, flags=re.S)
page = re.sub(r"<[^>]+>", " ", page)
page = html.unescape(re.sub(r"\s+", " ", page))
page = re.sub(r"[‘“][^’”]{0,160}[’”]", " ", page)
sweep(page, ROOM.name)
if problems:
    raise SystemExit("REFUSING, on the published page:\n  " + "\n  ".join(problems))

lit = [c["id"] for c in cabinets if c.get("items")]
print(f"the collection collection: {len(cabinets)} cabinets drawn in {ROOM.name}, "
      f"{sum(len(c.get('items') or []) for c in cabinets)} photographs, lit: {', '.join(lit) or 'none yet'}")
print(f"  lamps: {', '.join(f'{k} ({v})' for k, v in seen_lamps.items()) or 'none chosen'}; "
      f"no two alike")
print(f"  {len(rows)} credit rows in {NOTES.name}; every photograph clean of metadata, described, "
      f"and looked at for a person or an address")
