#!/usr/bin/env python3
"""Build Samefood Cafe's table, menu, counter and regulars' trays, and its credits, from data/samefood.json.

ONE DATA FILE, ONE TOOL, TWO SURFACES -- the contract make-yells.py set and
every generator here has kept since. The room is a cafe for samefoods and safe
foods, where food aversion is understood rather than corrected; the credits go
to liner-notes.html.

WHAT IT REFUSES, and the first four are the room:

  - A FOOD THAT TOUCHES ANYTHING ON THE PLATE OR IN A RAMEKIN. Nothing on the
    house's divided plate touches anything else unless whoever is eating it puts
    it there, which for a great
    many of us is the difference between a plate we can eat from and one we
    cannot. So the drawing in the window is built from primitives this tool can
    walk -- circles, ellipses, rounded rects and paths of absolute commands --
    and EVERY COORDINATE of every food is checked to sit inside its own well
    with MARGIN to spare, every piece is checked against every other piece in
    that well that belongs to a DIFFERENT food for GAP (pieces of one food may
    touch; the pasta does not need room from itself), every object on the table against every other and
    against the plate with its ring of shade included, and every well against
    the plate's rim. A path's control points are counted as if they were on the
    curve, which can only make the box bigger: the check may be stricter than
    the picture, never kinder. That is make-garden.py's soil-line walker, for
    this room's line. A BOWL IS THE EXCEPTION ON PURPOSE: it is one person's dish
    drawn as they eat it, and its parts may touch. See check_vessel.

  - THE VOCABULARY OF CORRECTING SOMEBODY'S PLATE, in the room's own voice.
    Picky, fussy, just one bite, clean your plate, healthy and unhealthy, junk
    food, guilty pleasures, cheat days, calories, vegetables snuck into things,
    expanding a palate, growing out of it, waiting until they are hungry enough.
    Every page on the internet about eating is written in that vocabulary, which
    is exactly why the friendly edit will arrive in it: one encouraging line
    about "trying new things" turns a room that says your samefood is fine into
    a room that is waiting for you to stop. It is swept with the negation window
    so the room can still say that nobody in here is a picky eater -- our own
    glossary's reframe -- and it skips blockquotes, cites, titles and anything
    in curly quotes, because the book on the counter has "Picky Eaters" in its
    own subtitle and that is the author's to say.

  - A TALLY, AND ESPECIALLY ONE ACROSS THE TRAYS. Nothing is counted, voted on,
    ranked or added up. A page of other people's samefoods is exactly the shape
    of thing that grows "most popular" -- two regulars list the same drink, and
    somebody will want to say so -- and a league table of what our community
    eats would turn a page meant to say "yours is fine" into a popularity
    contest between other people's dinners. make-guild.py's scoring nouns and
    the pebbling cabinet's refusal, with votes and rankings added.

  - ADVICE ABOUT EATING, IN THE SECOND PERSON. This cafe has a book on the
    counter by somebody who knows and a menu that does not change, and it tells
    nobody what to eat, how to introduce a food or what to try. make-sithen.py
    and make-dead-tired.py refuse the same shapes for their own reasons.

  - A REGULAR WITH ANY KEY BUT name, items, given AND date. Every other key
    anybody will want to add -- a count, a category, a star, a tag, a "healthy"
    flag -- is the beginning of sorting other people's food. The items are
    written exactly as given and are NOT swept: they are the person's own words
    about their own plate, and this tool does not get an opinion about them.
    It refuses an entity or markup in one, because those are escaped on the way
    in and a person's words must arrive looking the way they typed them.

  - AN ASK THAT IS NOT KEPT, OR THAT REACHES SOMEBODY ELSE'S FOOD. The house
    defaults to structure, separation and predictability and accommodates every
    guest individually -- quietly, professionally, and never as fussy, picky or
    too much. A regular may carry `asks`, their own way of being served; this
    checks each ask against drawings of THAT person's food and nobody else's,
    because no one's rules impose on someone else. Ronan asks for red things in
    a ramekin of their own, so his ketchup is refused anywhere but one, and
    Ryan's red apples may go wherever they like. An ask this tool does not know
    is refused rather than ignored. The first draft made Ronan's way a house
    rule and refused red everywhere; Ryan corrected it the same day.

  - A FOOD IN THE WINDOW THAT IS NOT ON A REGULAR'S TRAY, exactly as written
    there. When somebody asks for their list to come down, this stops until the
    plate has let go of their food as well -- make-polaroids.py's rule that a
    withdrawal is honoured on every surface and not half-honoured on one.

  - A QUOTATION OVER THIRTY WORDS, or with no author, work, link or year, or
    with no record of how it was checked. make-sweetgrass.py's rule: an
    unchecked quotation must not sit among checked ones looking identical, so
    the room prints the `checked` line beside every one of them.

  - A BOOK WITH NO LIBRARY LINK. make-hermitage.py's rule: a counter that could
    only say where to buy would be a shop with an argument painted on it. And a
    pronoun in the book's note, because none of the pages read states one --
    make-picture-house.py's rule about makers.

  - AN HTML ENTITY IN ANY FIELD. Everything is escaped on the way into the
    page; write the character.

  - A MISSING MARKER PAIR. A generator that writes nothing and exits 0 is how
    two surfaces drift apart.

WHAT IT DOES NOT CHECK, on purpose: how many regulars there are, or how many
foods anybody has. More people are coming, and the room says so rather than
giving a number.
"""
import html
import json
import math
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data/samefood.json"
ROOM = ROOT / "samefood-cafe.html"
NOTES = ROOT / "liner-notes.html"

GLOSSARY = "https://stimpunks.org/glossary/"
WORDS = 30            # printed in the room
MARGIN = 8            # a food's clearance from its well's wall
GAP = 8               # the least room between any two things that are not one thing
SHADE = 8             # the ring of shade the overhead light puts round an object
VIEW = (1000, 300)    # the drawing's viewBox

ENTITY = re.compile(r"&(?:[a-zA-Z][a-zA-Z0-9]{1,31}|#\d{1,6}|#x[0-9a-fA-F]{1,6});")
DATE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
PRONOUN = re.compile(r"\b(?:he|him|his|she|her|hers)\b", re.I)

NEGATION = (r"(?:no|not|nothing|never|neither|none|without|refuses?|refused|refusing|"
            r"cannot|does not|won't|will not|is not|are not|isn't|aren't|nobody|nor|declin\w+)")

# THE SHAPES CORRECTION TAKES. Narrow on purpose, and every one of them was
# chosen because it is something people actually say across a table. "try" is
# NOT here on its own: "nobody will ask you to try a bite" has to survive, and a
# flat ban on a common verb would teach people to ignore this tool, which is
# check-counts.py's first-run lesson. "nutrition" is not here either -- the
# room refuses nutrition LABELS by name and says so.
CORRECTION = (r"picky|fussy|fussiness|faddy|just (?:one|a) (?:bite|taste)|one bite|"
              r"no[- ]thank[- ]you bite|clean (?:your|the|their) plate|clean plate|"
              r"healthy|unhealthy|junk food|guilty pleasures?|cheat (?:day|meal)s?|"
              r"clean eating|calories?|sneak\w* (?:in )?(?:vegetables|veg|veggies)|"
              r"hid(?:e|den|ing) (?:vegetables|veg|veggies)|"
              r"(?:expand|widen|broaden)\w* (?:your|their|the) (?:palate|diet)|"
              r"branch(?:ing)? out|grow(?:s|n|ing)? out of|hungry enough|"
              r"exposure therapy|food chaining|good foods?|bad foods?")

# make-guild.py's scoring nouns, and what a page of other people's plates grows.
TALLY = (r"scores?|scored|scoring|\d+\s*points?|points?\s+(?:for|per|each|awarded|"
         r"earned|available)|streaks?|leaderboards?|high[- ]score|tall(?:y|ies)|tallied|"
         r"votes?|voted|voting|most popular|favourite of the|top (?:\d+|three|five|ten)|"
         r"ranked|rankings?|how many (?:of us|people|times)|percent(?:age)?s?|\d+ likes")

# SECOND PERSON AND IMPERATIVE FRAMINGS ONLY, as make-dead-tired.py has it.
ADVICE = (r"you should|you need to|you must|try to|make sure (?:you|to)|have you tried|"
          r"don'?t forget to|remember to|it'?s important to|tips?(?: for| to| on)\b|"
          r"you could try|try (?:adding|swapping|mixing|eating|serving)|"
          r"introduce (?:a |one )?new foods?|learn to eat")

VOCAB = [
    (re.compile(rf"\b(?:{CORRECTION})", re.I),
     re.compile(rf"\b{NEGATION}\b[^.]{{0,70}}?\b(?:{CORRECTION})", re.I),
     "nobody's plate is corrected in this cafe. See _what and the docstring."),
    (re.compile(rf"\b(?:{TALLY})", re.I),
     re.compile(rf"\b{NEGATION}\b[^.]{{0,70}}?\b(?:{TALLY})", re.I),
     "nothing here is counted, ranked or added up across the trays. See _regulars."),
    (re.compile(rf"\b(?:{ADVICE})", re.I),
     re.compile(rf"\b{NEGATION}\b[^.]{{0,70}}?\b(?:{ADVICE})", re.I),
     "this cafe tells nobody what to eat or how. The book on the counter is for that."),
]

INK = {k: f"var(--sf-{k})" for k in
       ("plate", "pop", "pesto", "apple", "nut", "coffee", "cheese", "ketchup",
        "noodle", "onion", "nugget")}

# THE RED INKS, which matter only to somebody who has asked about red things.
RED = {"apple", "ketchup"}
ON_PLATE = set(INK) - {"noodle", "onion", "nugget"}
IN_BOWL = set(INK) - {"plate", "coffee"}

# THE ASKS THIS TOOL KNOWS HOW TO CHECK. A regular's asks are their own way of
# being served and apply to THEIR FOOD AND NOBODY ELSE'S: the house always
# accommodates the individual, and no one's rules impose on someone else --
# Ryan, 2026-09-23, correcting a first draft that made Ronan's way a house rule
# and refused red anywhere but a ramekin. An ask this tool does not know is
# refused rather than ignored, because an ask nobody checks is a promise made
# to one person and kept by nobody.
ASKS = {"red things in a ramekin of their own"}

problems = []


def sweep(text, where):
    text = str(text)
    for rx, ok, why in VOCAB:
        for m in rx.finditer(text):
            window = text[max(0, m.start() - 80):m.end()]
            if ok.search(window):
                continue
            problems.append(f"{where}: {m.group(0)!r} -- {why}")


def entity(v, where):
    if ENTITY.search(str(v)):
        problems.append(f"{where} carries an HTML entity. Everything here is escaped on "
                        "the way into the page; write the character.")


# ── Geometry ─────────────────────────────────────────────────────────────────
# A box is (x0, y0, x1, y1). Every shape is walked to one, WITH ITS OUTLINE: the
# ink includes the stroke, so half the stroke's width is added all round. A
# path's box is taken over EVERY number pair in it, control points included, so
# it can only ever be larger than the ink.

# How much stroke sits outside each primitive's geometry. A noodle is drawn as
# a pale stroke over a darker one, so its outside is the darker one's half.
PAD = {"noodle": 4.0, "ring": 2.0}
OUTLINE = 1.1


def pad_of(sh):
    if "ring" in sh:
        return PAD["ring"]
    return PAD.get(sh.get("fill"), OUTLINE)


def shape_box(sh, where):
    p = pad_of(sh)
    if "circle" in sh or "ring" in sh:
        cx, cy, r = sh.get("circle") or sh.get("ring")
        return (cx - r - p, cy - r - p, cx + r + p, cy + r + p)
    if "ellipse" in sh:
        cx, cy, rx, ry = sh["ellipse"]
        return (cx - rx - p, cy - ry - p, cx + rx + p, cy + ry + p)
    if "rect" in sh:
        x, y, w, h = sh["rect"][:4]
        return (x - p, y - p, x + w + p, y + h + p)
    if "path" in sh:
        d = sh["path"]
        if re.search(r"[a-z]", d.replace("Z", "")) or re.search(r"[AaSsTt]", d):
            problems.append(f"{where}: the path uses a relative or arc command. Only M, L, "
                            "H, V, Q, C and Z are walked, because those are the ones whose "
                            "every coordinate is written down in the path itself.")
            return (0, 0, 0, 0)
        xs, ys = [], []
        for cmd, args in re.findall(r"([MLHVQCZ])([^MLHVQCZ]*)", d):
            nums = [float(n) for n in re.findall(r"-?\d+(?:\.\d+)?", args)]
            if cmd == "H":
                xs += nums
            elif cmd == "V":
                ys += nums
            else:
                xs += nums[0::2]
                ys += nums[1::2]
        return (min(xs) - p, min(ys) - p, max(xs) + p, max(ys) + p)
    problems.append(f"{where}: a shape this tool cannot walk: {sorted(sh)}.")
    return (0, 0, 0, 0)


def reach(sh, cx, cy, where):
    """How far the shape's ink reaches from a vessel's centre. Exact for a round
    thing; for anything else the farthest corner of its box, which can only be
    farther than the ink."""
    p = pad_of(sh)
    if "circle" in sh or "ring" in sh:
        x, y, r = sh.get("circle") or sh.get("ring")
        return math.hypot(x - cx, y - cy) + r + p
    if "ellipse" in sh:
        x, y, rx, ry = sh["ellipse"]
        return math.hypot(x - cx, y - cy) + max(rx, ry) + p
    b = shape_box(sh, where)
    return max(math.hypot(x - cx, y - cy) for x in (b[0], b[2]) for y in (b[1], b[3]))


def grow(b, n):
    return (b[0] - n, b[1] - n, b[2] + n, b[3] + n)


def inside(inner, outer, margin):
    return (inner[0] >= outer[0] + margin and inner[1] >= outer[1] + margin and
            inner[2] <= outer[2] - margin and inner[3] <= outer[3] - margin)


def apart(a, b, gap):
    """True if the two boxes are at least `gap` apart on one axis or the other."""
    return (a[2] + gap <= b[0] or b[2] + gap <= a[0] or
            a[3] + gap <= b[1] or b[3] + gap <= a[1])


def rect_box(r):
    return (r["x"], r["y"], r["x"] + r["w"], r["y"] + r["h"])


def vessel_box(v):
    cx, cy = v["center"]
    return (cx - v["rim"], cy - v["rim"], cx + v["rim"], cy + v["rim"])


def check_vessel(v, where, allowed):
    """A ramekin on the table or a bowl on a tray: every piece within the inner
    wall with MARGIN to spare, measured as a distance from the centre because
    the wall is round. NOTHING TOUCHES THE DISH IT IS IN, and that is all.

    WHAT IS INSIDE MAY TOUCH ITSELF. A ramekin holds one food (checked by its
    caller) and a bowl is one dish, drawn the way its person eats it. Separation
    is what this cafe OFFERS -- the divided plate keeps different foods apart,
    the ramekin keeps red things off everything else -- and never what it
    imposes: Ryan does not mind his food touching and his green onions float
    among his noodles, Helen's pasta sits all together, and Ronan likes
    everything apart. A tool that forced a gap into somebody's own bowl would be
    correcting the people who do not mind, which is the thing this room refuses
    in the other direction."""
    for need in ("center", "rim", "inner", "pieces"):
        if need not in v:
            problems.append(f"{where}: no {need}.")
            return
    if not v["inner"] < v["rim"]:
        problems.append(f"{where}: the inside is wider than the rim.")
    cx, cy = v["center"]
    for n, sh in enumerate(v["pieces"], 1):
        if sh.get("fill") not in allowed:
            problems.append(f"{where} piece {n}: fill {sh.get('fill')!r} is not allowed here "
                            f"(allowed: {sorted(allowed)}).")
        r = reach(sh, cx, cy, f"{where} piece {n}")
        if r > v["inner"] - MARGIN:
            problems.append(
                f"{where} piece {n}: reaches {r:.1f} from the centre and the inside wall is at "
                f"{v['inner']}, so it comes within {MARGIN} of the wall. Nothing touches the "
                "dish it is in either.")

# ── The data ─────────────────────────────────────────────────────────────────
d = json.loads(DATA.read_text())
table = d.get("table") or {}
menu = d.get("menu") or []
book = d.get("book") or {}
regulars = d.get("regulars") or []

# THE REGULARS FIRST, because the plate is checked against them.
on_trays = {}
asks_of = {}
for i, r in enumerate(regulars, 1):
    name = str(r.get("name", "")).strip()
    where = f"regular {i} ({name or 'no name'})"
    extra = sorted(set(r) - {"name", "items", "given", "date", "moment", "asks"})
    if extra:
        problems.append(
            f"{where}: carries {extra}. A regular is a name, their items as they gave them, "
            "how they reached us and when, and optionally a samefood of the moment and their own "
            "asks -- every other key is the start of sorting other "
            "people's food. See _regulars.")
    if not name:
        problems.append(f"{where}: no name. A tray is somebody's, and says whose.")
    if name in on_trays:
        problems.append(f"{where}: two trays with one name.")
    items = r.get("items")
    if not isinstance(items, list) or not items or not all(
            isinstance(x, str) and x.strip() for x in items):
        problems.append(f"{where}: `items` must be a list of what they gave, as they gave it.")
        items = []
    for x in items:
        entity(x, f"{where} item {x!r}")
        if "<" in x or ">" in x:
            problems.append(f"{where}: item {x!r} carries markup. It is their words, not ours "
                            "to format.")
    if len(set(items)) != len(items):
        problems.append(f"{where}: an item appears twice on one tray.")
    if not str(r.get("given", "")).strip():
        problems.append(f"{where}: no `given`. How a list reached us is part of the record, "
                        "because it is what somebody asks about when they want it down.")
    if not DATE.match(str(r.get("date", ""))):
        problems.append(f"{where}: no date, or not YYYY-MM-DD.")
    entity(r.get("given", ""), f"{where} given")
    # THE SAMEFOOD OF THE MOMENT: one of the items already on the tray, said in
    # words, and a bowl of it walked like the plate. A bowl holds one thing, so
    # nothing red goes in one -- that is a ramekin's job.
    mo = r.get("moment")
    if mo is not None:
        if mo.get("item") not in items:
            problems.append(f"{where}: the samefood of the moment {mo.get('item')!r} is not on "
                            "their tray as written. It is one of theirs, not one we picked.")
        if not str(mo.get("said", "")).strip():
            problems.append(f"{where}: the bowl has no `said`; it is aria-hidden and has to be "
                            "said in words as well.")
        entity(mo.get("said", ""), f"{where} moment said")
        sweep(mo.get("said", ""), f"{where} moment said")
        check_vessel(mo.get("bowl") or {}, f"{where}'s bowl", IN_BOWL)
        if "red things in a ramekin of their own" in set(r.get("asks", [])):
            for sh in (mo.get("bowl") or {}).get("pieces", []):
                if sh.get("fill") in RED:
                    problems.append(f"{where}: something red in {name}'s bowl, and {name} asks for "
                                    "red things in a ramekin of their own.")
    for ask in r.get("asks", []):
        if ask not in ASKS:
            problems.append(f"{where}: asks {ask!r}, and this tool does not know how to check it. "
                            f"Teach it (ASKS) rather than let the ask go unkept.")
    asks_of[name] = set(r.get("asks", []))
    on_trays[name] = set(items)
if not regulars:
    problems.append("data/samefood.json has no regulars, and the room promises their trays.")


def wants_ramekin(src):
    """True only if the food is off the tray of somebody who asked for it."""
    return (isinstance(src, list) and len(src) == 2 and
            "red things in a ramekin of their own" in asks_of.get(src[0], set()))


def from_ok(src, where):
    if src is None:
        return
    if (not isinstance(src, list) or len(src) != 2 or src[0] not in on_trays
            or src[1] not in on_trays[src[0]]):
        problems.append(
            f"{where}: `from` {src!r} is not an item on a regular's tray exactly as written "
            "there. Everything in the window is off the trays; when a list comes down, the "
            "plate lets go of it too. See _from_the_lists.")


# THE TABLE.
plate = table.get("plate")
wells = {w["id"]: w for w in table.get("wells", [])}
foods = table.get("foods", [])
objects = table.get("objects", [])
ramekins = table.get("ramekins", [])
view = (0, 0) + VIEW
if not plate or not wells or not foods:
    problems.append("the table needs a plate, its wells and at least one food on it.")
else:
    pbox = rect_box(plate)
    if not inside(grow(pbox, SHADE), view, 0):
        problems.append("the plate and its shade run off the drawing.")
    wl = list(wells.values())
    for w in wl:
        if not inside(rect_box(w), pbox, MARGIN):
            problems.append(f"well {w['id']}: runs into the plate's rim.")
    for a in range(len(wl)):
        for b in range(a + 1, len(wl)):
            if not apart(rect_box(wl[a]), rect_box(wl[b]), GAP):
                problems.append(f"wells {wl[a]['id']} and {wl[b]['id']} touch: a divided "
                                "plate is divided.")
    pieces = {}   # well id -> [(food id, box)]
    for f in foods:
        where = f"food {f.get('id')}"
        w = wells.get(f.get("well"))
        if not w:
            problems.append(f"{where}: sits in no well this plate has.")
            continue
        from_ok(f.get("from"), where)
        if not str(f.get("said", "")).strip():
            problems.append(f"{where}: no `said`. The drawing is aria-hidden; what is on the "
                            "plate has to be said in words as well, or only sighted readers "
                            "are told.")
        for n, sh in enumerate(f.get("shapes", []), 1):
            if sh.get("fill") in RED and wants_ramekin(f.get("from")):
                problems.append(f"{where} shape {n}: red, off {f['from'][0]}'s tray, on the plate. "
                                f"{f['from'][0]} asks for red things in a ramekin of their own, "
                                "and the house accommodates that. See _ramekins.")
            elif sh.get("fill") not in ON_PLATE:
                problems.append(f"{where} shape {n}: fill {sh.get('fill')!r} is not one of the "
                                f"inks a plate takes {sorted(ON_PLATE)}.")
            box = shape_box(sh, f"{where} shape {n}")
            if not inside(box, rect_box(w), MARGIN):
                problems.append(
                    f"{where} shape {n}: {box} comes within {MARGIN} of well {w['id']}'s wall "
                    f"{rect_box(w)}. Nothing on a plate here touches anything, the plate "
                    "included.")
            pieces.setdefault(w["id"], []).append((f"{f.get('id')} {n}", box))
    # DIFFERENT FOODS ARE KEPT APART; PIECES OF ONE FOOD MAY TOUCH. Pasta does not
    # need room round each piece -- Ryan, 2026-09-23 -- and the divided plate's
    # promise is that the pasta does not touch the popcorn, not that the pasta
    # does not touch itself.
    for wid, ps in pieces.items():
        for a in range(len(ps)):
            for b in range(a + 1, len(ps)):
                fa, fb = ps[a][0].rsplit(" ", 1)[0], ps[b][0].rsplit(" ", 1)[0]
                if fa != fb and not apart(ps[a][1], ps[b][1], GAP):
                    problems.append(
                        f"well {wid}: {ps[a][0]} and {ps[b][0]} are two different foods and come "
                        f"within {GAP} of each other. On the divided plate they do not touch.")
    obj_boxes = [("the plate", grow(pbox, SHADE))]
    for o in objects:
        where = f"object {o.get('id')}"
        from_ok(o.get("from"), where)
        if "also" in o:
            from_ok(o.get("also"), where + " (also)")
        if not str(o.get("said", "")).strip():
            problems.append(f"{where}: no `said`.")
        b = o.get("box")
        if not b or len(b) != 4:
            problems.append(f"{where}: no box.")
            continue
        box = (b[0], b[1], b[0] + b[2], b[1] + b[3])
        for n, sh in enumerate(o.get("shapes", []), 1):
            if sh.get("fill") in RED and wants_ramekin(o.get("from")):
                problems.append(f"{where} shape {n}: red, off a tray that asks for red things in a "
                                "ramekin, and not in one. See _ramekins.")
            elif sh.get("fill") not in INK:
                problems.append(f"{where} shape {n}: fill {sh.get('fill')!r} is not declared.")
            if not inside(shape_box(sh, f"{where} shape {n}"), box, 0):
                problems.append(f"{where} shape {n}: drawn outside its own box, so the box "
                                "this tool checks is not the object you see.")
        ring = grow(box, SHADE)
        if not inside(ring, view, 0):
            problems.append(f"{where}: runs off the drawing.")
        for other, ob in obj_boxes:
            if not apart(ring, ob, GAP):
                problems.append(f"{where}: its shade comes within {GAP} of {other}'s. On this "
                                "table nothing touches anything.")
        obj_boxes.append((o.get("id"), ring))
    # THE RAMEKINS. Each holds ONE food, from one tray, and stands apart from
    # everything else on the table with its ring of shade.
    for rk in ramekins:
        where = f"ramekin {rk.get('id')}"
        from_ok(rk.get("from"), where)
        if not isinstance(rk.get("from"), list):
            problems.append(f"{where}: a ramekin holds one food, off one tray; say which.")
        if not str(rk.get("said", "")).strip():
            problems.append(f"{where}: no `said`.")
        check_vessel(rk, where, set(INK) - {"noodle", "onion", "plate"})
        if "center" not in rk:
            continue
        ring = grow(vessel_box(rk), SHADE)
        if not inside(ring, view, 0):
            problems.append(f"{where}: runs off the drawing.")
        for other, ob in obj_boxes:
            if not apart(ring, ob, GAP):
                problems.append(f"{where}: its shade comes within {GAP} of {other}'s. A "
                                "ramekin touches nothing either.")
        obj_boxes.append((rk.get("id"), ring))
    for f in foods + objects + ramekins:
        entity(f.get("said", ""), f"{f.get('id')} said")
        sweep(f.get("said", ""), f"{f.get('id')} said")

# THE MENU AND THE BOOK.


def check_quote(q, where):
    words = len(str(q.get("text", "")).split())
    if not words:
        problems.append(f"{where}: no quotation.")
    if words > WORDS:
        problems.append(f"{where}: the quotation is {words} words and the limit is {WORDS}.")
    for need in ("who", "work", "url", "year", "checked"):
        if not str(q.get(need, "")).strip():
            problems.append(
                f"{where}: the quotation has no {need}." + (
                    " An unchecked quotation must not sit among checked ones looking "
                    "identical; say how this one was read." if need == "checked" else ""))
    for k, v in q.items():
        entity(v, f"{where} quotation {k}")


seen = set()
for i, m in enumerate(menu, 1):
    where = f"dish {i} ({m.get('id')})"
    for need in ("id", "name", "entry", "note"):
        if not str(m.get(need, "")).strip():
            problems.append(f"{where}: no {need}.")
    if m.get("id") in seen:
        problems.append(f"{where}: on the menu twice.")
    seen.add(m.get("id"))
    if not str(m.get("entry", "")).startswith(GLOSSARY):
        problems.append(f"{where}: `entry` is not one of our own glossary entries. The menu "
                        "comes from our glossary.")
    for k in ("name", "note"):
        entity(m.get(k, ""), f"{where} {k}")
        sweep(m.get(k, ""), f"{where} {k}")
    check_quote(m.get("quote") or {}, where)
if not menu:
    problems.append("the menu is empty, and the room is a menu.")

for need in ("title", "author", "publisher", "year", "isbn", "record", "note"):
    if not str(book.get(need, "")).strip():
        problems.append(f"the book: no {need}.")
if not str(book.get("library", "")).strip():
    problems.append(
        "the book: no library link. A counter that could only tell you where to buy would "
        "be a shop with an argument painted on it -- make-hermitage.py's rule.")
if PRONOUN.search(str(book.get("note", ""))):
    problems.append("the book's note gives its author a pronoun, and none of the pages read "
                    "states one. See _book.")
for k, v in book.items():
    if k != "quote":
        entity(v, f"the book {k}")
sweep(book.get("note", ""), "the book note")
check_quote(book.get("quote") or {}, "the book")

if problems:
    raise SystemExit("REFUSING to build Samefood Cafe:\n  " + "\n  ".join(problems))


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


def svg_shape(sh, stroke, extra=""):
    fill = INK[sh["fill"]] if stroke != "shade" else "var(--sf-shade)"
    if stroke == "shade":
        paint = f'fill="var(--sf-shade)" stroke="var(--sf-shade)" stroke-width="{SHADE * 2}" stroke-linejoin="round"'
    else:
        paint = f'fill="{fill}" stroke="var(--sf-ink-2)" stroke-width="2.2" stroke-linejoin="round"'
    if "ring" in sh:
        # A SLICE OF GREEN ONION FROM ABOVE: a green ring round the broth it is
        # floating on. The stroke's outer half is what PAD["ring"] accounts for.
        cx, cy, r = sh["ring"]
        return (f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="var(--sf-broth)" '
                f'stroke="var(--sf-onion)" stroke-width="4"{extra}/>')
    if sh.get("fill") == "noodle" and stroke != "shade":
        # A NOODLE is a pale stroke over a darker one, so it is outlined the way
        # every other food here is; PAD["noodle"] is the darker one's half.
        return (f'<path d="{sh["path"]}" stroke="var(--sf-ink-2)" stroke-width="8" '
                f'stroke-linecap="round"/><path d="{sh["path"]}" stroke="var(--sf-noodle)" '
                f'stroke-width="5" stroke-linecap="round"{extra}/>')
    if "circle" in sh:
        cx, cy, r = sh["circle"]
        if sh["fill"] == "pop" and stroke != "shade":
            # A KERNEL IS A PUFF DRAWN INSIDE ITS OWN CIRCLE: six bumps whose
            # every control point sits on the circle and every anchor inside
            # it, so the box the walker checked is still the box of the ink.
            pts = []
            for k in range(6):
                a0, a1 = math.radians(k * 60), math.radians(k * 60 + 30)
                pts.append((cx + r * .78 * math.cos(a0), cy + r * .78 * math.sin(a0),
                            cx + r * math.cos(a1), cy + r * math.sin(a1)))
            d = f"M{pts[0][0]:.1f} {pts[0][1]:.1f} " + " ".join(
                f"Q{pts[k][2]:.1f} {pts[k][3]:.1f} {pts[(k + 1) % 6][0]:.1f} {pts[(k + 1) % 6][1]:.1f}"
                for k in range(6)) + " Z"
            return f'<path d="{d}" {paint}{extra}/>'
        return f'<circle cx="{cx}" cy="{cy}" r="{r}" {paint}{extra}/>'
    if "ellipse" in sh:
        cx, cy, rx, ry = sh["ellipse"]
        out = f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" {paint}{extra}/>'
        if sh["fill"] == "pesto" and stroke != "shade":
            # THE TWIST OF A PIECE OF PASTA, three short strokes across it,
            # every one inside the piece's own ellipse and so inside its box.
            tw = " ".join(f"M{cx + dx:.1f} {cy - ry * .72:.1f} Q{cx + dx + 5:.1f} {cy:.1f} "
                          f"{cx + dx:.1f} {cy + ry * .72:.1f}"
                          for dx in (-rx * .45, 0, rx * .45))
            out += (f'<path d="{tw}" stroke="var(--sf-ink-2)" stroke-width="1.5" '
                    f'stroke-linecap="round"/>')
        return out
    if "rect" in sh:
        x, y, w, h = sh["rect"][:4]
        rx = sh["rect"][4] if len(sh["rect"]) > 4 else 0
        return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" {paint}{extra}/>'
    return f'<path d="{sh["path"]}" {paint}{extra}/>'


def vessel_svg(v, part):
    """A ramekin or a bowl from above: its ring of shade, its rim, its inside
    (broth if it has any) and what is in it. `part` is 'shade' or 'body', so a
    table can draw every shade before any body."""
    cx, cy = v["center"]
    if part == "shade":
        return [f'<circle cx="{cx}" cy="{cy}" r="{v["rim"]}" fill="var(--sf-shade)" '
                f'stroke="var(--sf-shade)" stroke-width="{SHADE * 2}"/>']
    inside_ink = "var(--sf-broth)" if v.get("broth") else "var(--sf-well)"
    out = [f'<circle cx="{cx}" cy="{cy}" r="{v["rim"]}" fill="var(--sf-plate)" '
           f'stroke="var(--sf-rim)" stroke-width="3"/>',
           f'<circle cx="{cx}" cy="{cy}" r="{v["inner"]}" fill="{inside_ink}" '
           f'stroke="var(--sf-rim)" stroke-width="2"/>']
    out += [svg_shape(sh, "ink") for sh in v["pieces"]]
    return out


# THE TABLE. Shade first, all of it, so no ring is ever drawn over an object;
# then the plate, its wells, the food and the things beside it. Every ink is one
# of the room's own declared names, so the drawing cannot drift from the palette.
p = plate
parts = [f'<svg class="sf-table-art" viewBox="0 0 {VIEW[0]} {VIEW[1]}" fill="none" '
         f'xmlns="http://www.w3.org/2000/svg">']
parts.append(f'<rect x="{p["x"]}" y="{p["y"]}" width="{p["w"]}" height="{p["h"]}" rx="{p["rx"]}" '
             f'fill="var(--sf-shade)" stroke="var(--sf-shade)" stroke-width="{SHADE * 2}"/>')
for o in objects:
    for sh in o["shapes"]:
        parts.append(svg_shape(sh, "shade"))
for rk in ramekins:
    parts += vessel_svg(rk, "shade")
parts.append(f'<rect x="{p["x"]}" y="{p["y"]}" width="{p["w"]}" height="{p["h"]}" rx="{p["rx"]}" '
             f'fill="var(--sf-plate)" stroke="var(--sf-rim)" stroke-width="3"/>')
for w in wells.values():
    parts.append(f'<rect x="{w["x"]}" y="{w["y"]}" width="{w["w"]}" height="{w["h"]}" rx="{w["rx"]}" '
                 f'fill="var(--sf-well)" stroke="var(--sf-rim)" stroke-width="2"/>')
for f in foods:
    for sh in f["shapes"]:
        parts.append(svg_shape(sh, "ink"))
for o in objects:
    for sh in o["shapes"]:
        parts.append(svg_shape(sh, "ink"))
for rk in ramekins:
    parts += vessel_svg(rk, "body")
parts.append("</svg>")
swap(ROOM, "samefood:table", "      " + "\n      ".join(parts), "")

# THE SAME PICTURE IN WORDS, generated from the same entries as the drawing so
# the two cannot disagree about what is on the plate.
fs = [f["said"] for f in foods]
plate_words = ", ".join(fs[:-1]) + (", " if len(fs) > 2 else " ") + fs[-1] if len(fs) > 1 else fs[0]
extras = [o["said"] for o in objects]
if ramekins:
    extras.append(", ".join(rk["said"] for rk in ramekins))
swap(ROOM, "samefood:window",
     f'    <p class="sf-window">In the window: one divided plate, with {esc(plate_words)}. '
     f'{esc(". ".join(extras))}. Nothing on the table touches anything else, and every food '
     f'on it is off a regular&rsquo;s tray further down.</p>', "")


def quote_block(q, cls="sf-quote"):
    where = f', {esc(q["where"])}' if str(q.get("where", "")).strip() else ""
    return (f'        <blockquote class="{cls}">\n'
            f'          <p>{esc(q["text"])}</p>\n'
            f'          <cite>{esc(q["who"])}, <a href="{attr(q["url"])}"><i>{esc(q["work"])}</i></a>'
            f'{where}, {esc(q["year"])}'
            f'<span class="sf-checked">{esc(q["checked"][0].upper() + q["checked"][1:])}.</span></cite>\n'
            f'        </blockquote>')


dishes = []
for m in menu:
    dishes.append(
        f'      <li class="sf-plate">\n'
        f'        <h3>{esc(m["name"])}</h3>\n'
        f'        <p>{esc(m["note"])}</p>\n'
        f'{quote_block(m["quote"])}\n'
        f'        <p class="sf-entry"><a href="{attr(m["entry"])}">{esc(m["name"])}, in our '
        f'glossary &rarr;</a></p>\n'
        f'      </li>')
swap(ROOM, "samefood:menu", '    <ul class="sf-plates">\n' + "\n".join(dishes) + "\n    </ul>", "")

b = book
swap(ROOM, "samefood:book",
     f'    <div class="sf-plate sf-book">\n'
     f'      <p class="sf-book__title"><i>{esc(b["title"])}</i></p>\n'
     f'      <p class="sf-book__sub">{esc(b["subtitle"])}</p>\n'
     f'      <p class="sf-book__by">by {esc(b["author"])} &middot; {esc(b["publisher"])}, '
     f'{esc(b["year"])} &middot; ISBN {esc(b["isbn"])}</p>\n'
     f'      <p>{esc(b["note"])}</p>\n'
     f'{quote_block(b["quote"])}\n'
     f'      <ul class="sf-book__get">\n'
     f'        <li><a href="{attr(b["library"])}">Find it in a library</a></li>\n'
     f'        <li><a href="{attr(b["record"])}">Its Open Library record</a></li>\n'
     + (f'        <li><a href="{attr(b["shop"])}">From an independent bookshop</a></li>\n'
        if str(b.get("shop", "")).strip() else "") +
     f'      </ul>\n'
     f'    </div>', "")

trays = []
for r in regulars:
    wells_html = "\n".join(f'          <li>{esc(x)}</li>' for x in r["items"])
    moment = ""
    mo = r.get("moment")
    if mo:
        # THE BOWL IS DECORATION AND THE CAPTION SAYS THE SAME THING IN WORDS.
        body = "".join(vessel_svg(mo["bowl"], "shade") + vessel_svg(mo["bowl"], "body"))
        moment = (f'        <figure class="sf-moment">\n'
                  f'          <svg class="sf-bowl" viewBox="0 0 220 220" fill="none" '
                  f'aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">'
                  f'{body}</svg>\n'
                  f'          <figcaption><span class="sf-moment__label">Samefood of the moment</span> '
                  f'<span class="sf-moment__item">{esc(mo["item"])}</span> '
                  f'<span class="sf-moment__said">In the bowl: {esc(mo["said"])}.</span></figcaption>\n'
                  f'        </figure>\n')
    trays.append(
        f'      <li class="sf-plate sf-tray">\n'
        f'        <h3>{esc(r["name"])}</h3>\n'
        f'{moment}'
        f'        <ul class="sf-wells">\n{wells_html}\n        </ul>\n'
        f'        <p class="sf-tray__given">Given {esc(r["given"])}, {esc(r["date"])}.</p>\n'
        f'      </li>')
swap(ROOM, "samefood:regulars", '    <ul class="sf-trays">\n' + "\n".join(trays) + "\n    </ul>", "")

swap(ROOM, "samefood:cap",
     f'    <p>Every quotation in this café is {WORDS} words or fewer, names who said it, where '
     f'and when, and says beside it how it was checked. <code>tools/make-samefood.py</code> '
     f'refuses a longer one, and refuses the vocabulary of correcting somebody&rsquo;s plate, '
     f'a tally, and advice about eating, in the room&rsquo;s own voice. It also walks every '
     f'coordinate of the drawing of the table and refuses anything on it that touches '
     f'anything else.</p>', "")

credit_rows = []
for label, q in [(m["name"], m["quote"]) for m in menu] + [("On the counter", b["quote"])]:
    credit_rows.append(
        f'      <tr><td>{esc(label)}</td><td><strong>{esc(q["who"])}</strong></td>'
        f'<td><a href="{attr(q["url"])}">{esc(q["work"])}</a>, {esc(q.get("where", ""))}</td>'
        f'<td>{esc(q["year"])}</td><td>{esc(q["checked"])}</td>'
        f'<td>{len(str(q["text"]).split())} words</td></tr>')
swap(NOTES, "samefood-credits", "\n".join(credit_rows), "      ")

# ── The page's own copy, swept ───────────────────────────────────────────────
# AFTER the write, so what is checked is what is published. Out first: the job
# marker (make-guild.py sweeps its own), every blockquote and cite, every <i>
# (titles), the book's subtitle (its author's words), the regulars' wells (their
# words), and anything in curly quotes, which in this room is always a phrase
# being refused rather than said.
page = ROOM.read_text()
page = re.sub(r"<!-- quest:.*?:end -->", " ", page, flags=re.S)
page = re.sub(r"<!--.*?-->", " ", page, flags=re.S)
page = re.sub(r"<(script|style|svg)\b.*?</\1>", " ", page, flags=re.S)
page = re.sub(r"<head>.*?</head>", " ", page, flags=re.S)
page = re.sub(r"<(blockquote|cite|i)\b.*?</\1>", " ", page, flags=re.S)
page = re.sub(r'<p class="sf-book__sub">.*?</p>', " ", page, flags=re.S)
page = re.sub(r'<ul class="sf-wells">.*?</ul>', " ", page, flags=re.S)
page = re.sub(r"<[^>]+>", " ", page)
page = html.unescape(re.sub(r"\s+", " ", page))
page = re.sub(r"[‘“][^’”]{0,120}[’”]", " ", page)
before = len(problems)
sweep(page, ROOM.name)
if len(problems) > before:
    raise SystemExit("REFUSING, on the published page:\n  " + "\n  ".join(problems[before:]))

print(f"samefood cafe: the table drawn and walked ({sum(len(f['shapes']) for f in foods)} pieces "
      f"of food, no two foods on the plate within {GAP} of each other), {len(menu)} dishes, the book, "
      f"{len(regulars)} trays, in {ROOM.name}")
print(f"  {len(credit_rows)} credit rows in {NOTES.name}; longest quotation "
      f"{max(len(str(q['text']).split()) for q in [m['quote'] for m in menu] + [b['quote']])} "
      f"words against a limit of {WORDS}")
print("  nobody's plate corrected, nothing counted, and nothing on the table touching anything")
