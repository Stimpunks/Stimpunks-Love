#!/usr/bin/env python3
"""Build Chimera Obscura out of data/chimera-obscura.json, and write the shelf
every chimera on the street is drawn from.

WHAT THE ROOM IS. A camera obscura on the street, painted black inside, where
you make a chimera out of animals: the body from one, and the head, ears,
mouth, tail, back, colours and markings from it or another, and a lens in the
roof throws it onto a round white table. Ryan's brief, 2026-10-18, after Norah
asked for an otteraccoon, modelled on the chimeras on stimpunks.org's About
page, which Becky Hicks drew and which hang in the room.

IT IS A PARTS BUILDER AND NOTHING IN IT CALLS AN AI. Every animal is drawn once,
as code, for one shared rig in chimera.js, so any part goes with any other and
a chimera is drawn in the visitor's own browser the moment it is picked. An
animal the shelf does not have is asked for in the suggestion box and drawn in a
later session, which takes days and keeps design.html's "Nothing you do here is
sent to an AI" true. Ryan offered to exempt one page from that and chose this
instead; see DECISIONS.md.

THREE FILES HAVE TO AGREE ABOUT EVERY ANIMAL, SO THIS TOOL WRITES TWO OF THEM.
data/chimera-obscura.json says what is on the shelf; chimera.js draws it, and
(once chimeras can be kept) netlify/cb/lib.mjs refuses one kept with anything
else in it. The shelf in chimera.js, between its chimera:data markers, is
written here, and so are the keys in lib.mjs between its chimera:keys markers
when they are there. Never hand-edit between those markers.

IT REFUSES, RATHER THAN TRUSTS:

  - AN ANIMAL MISSING A PART, or a part chimera.js has no drawing for. An
    animal that cannot be drawn with every other animal is not on the shelf;
    tools/chimera.test.mjs draws every pair to make sure.

  - A NAME THAT IS SOMEBODY ELSE'S. The room suggests a name for every pairing,
    the body's animal and then the animal that gave the most other parts, and
    this works every one of them out. Our friends at Randimals make combined
    animals and their characters' names are theirs, so no suggestion may be one
    of them (read off their shop, in the data file). Porkypine is not on that
    list: Randimals and Stimpunks made it together and both use it.

  - A NAME NOBODY SHOULD BE CALLED. Joining the end of one animal's name onto
    another can make a slur. "Coon", the obvious end of "raccoon", is one, so
    raccoon's end is "accoon" and otter plus raccoon is an otteraccoon. No name
    part may be or begin with a word on the list below, and no suggested name
    may carry one that is not inside an animal's own name. The list is short and
    only for what animal names can make; a moderator answers every request.

  - THE FREAK SHOW'S WORDS. Bodies made of unexpected parts were exhibited as
    freaks, and the people exhibited were mostly disabled. On a Disabled
    people's site every chimera is whole, so the room's own voice may not call
    one a monster, a freak, a mutant, an abomination, a mistake or wrong, with
    the negation window every sweep here uses, outside quotations.

  - A QUIZ. A chimera can be a picture of yourself, as Ryan's Bearmouse is, but
    nothing may tell anybody which animal they are, call anything a spirit
    animal (a term taken from Indigenous traditions), or say what an animal says
    about a person. The friendly edit is "which animal are you?".

  - A COUNT. No number of chimeras the shelf could make, nothing rare, nothing
    to collect, no score. The friendly edit is "hundreds of combinations!".

  - A SOUND, A FETCH, OR A STORE. chimera.js and chimera-obscura.js may make no
    sound, may not ask for the camera or draw onto a canvas, may write no markup
    from a string (chimera.js builds elements), and may send nothing and store
    nothing but a chimera kept on purpose, to /cb/chimeras, with the CB's pass
    read out of love-cb and never written.

  - A FAMILIAR THAT BREAKS ITS PROMISES (familiar.js and familiar.css, Ryan's
    call of 2026-10-19). A familiar is a chimera somebody took with them, kept
    in their own browser under love-familiar and nowhere else, and drawn again
    in every room. familiar.js may send nothing, read or write no storage but
    that key (not even the CB's pass: it does not react to the radio), write
    no markup from a string, make no sound, draw on no canvas, and move only
    with left and top. Everything that moves it by itself has to ask mayMove(),
    which is MAX GLITTER or Let it move by itself, and its words may not give
    it stats, a boost, a level, a streak or a collection: Castle Crashers'
    orbs give their player something, and a familiar here is company. Its
    stylesheet may use no colour but Chimera Obscura's own tokens, which are
    measured, may animate only a walk, and must not print. love.js must load it
    only where the familiar is allowed, and privacy.html must say what is kept.

  - THE QUOTATION, IF THE MIRROR SAYS OTHERWISE. The line about Ryan's
    Bearmouse is read on our About page; when the Knowledge System mirror is on
    this machine the words are looked for in it, the Town Hall's rule: re-copy,
    never loosen.

  - A CREDIT GONE. The room's credits must name Becky Hicks, Norah, Randimals
    and Claude, and the liner notes carry the same line.

It writes nothing if anything is refused. Run it before make-og.py; then
node --test tools/chimera.test.mjs.
"""
import html
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data/chimera-obscura.json"
PAGE = ROOT / "chimera-obscura.html"
NOTES = ROOT / "liner-notes.html"
JS = ROOT / "chimera.js"
ROOM_JS = ROOT / "chimera-obscura.js"
FAMILIAR = ROOT / "familiar.js"
FAMILIAR_CSS = ROOT / "familiar.css"
LOVE_JS = ROOT / "love.js"
PRIVACY = ROOT / "privacy.html"
LIB = ROOT / "netlify/cb/lib.mjs"
FACES = ROOT / "data/foundry-faces.json"
MIRROR = Path.home() / "Documents/Claude/Projects/Stimpunks Knowledge System/site/stimpunks.org"

SLOTS = ["body", "head", "ears", "mouth", "arms", "feet", "tail", "back", "colours", "markings"]
# A part that may be missing from a chimera kept or linked before it was a
# part of its own, and the part whose animal it then takes.
DEFAULTS = {"arms": "body", "feet": "body"}
# Every kind of part chimera.js has a drawing for. A new kind is a drawing
# there and a word here, in the same commit.
ARMS = {"thick", "thin", "hands", "wings", "flippers", "tentacles", "none"}
FEET = {"pads", "small", "claws", "big", "webbed", "hooves", "toes", "talons", "paddles", "fins", "tentacles",
        "streamers", "none"}
SHAPES = {"round", "wedge", "block", "bell"}
NOSES = {"round", "tri", "small", "y", "wide", "snout", "beak", "nostrils", "trunk", "bill", "hook", "duckbill",
         "flatbill", "blowhole", "none"}
EYES = (False, True, "dark", "slit", "turret", "bulge")
EARS = {"round", "semi", "long", "oval", "tri", "none", "flop", "fan", "tufts", "leaf", "comb", "crest", "plume",
        "gills", "horns"}
MOUTHS = {"smile", "buck", "bunny", "w", "tiny", "fierce", "open", "smirk", "none", "tusks", "chisel", "grin",
          "pout", "wattle", "tongue", "spiral"}
FILLS = {"fur", "light", "skin", "dark"}
MARKS = {"belly", "chest", "band", "patches", "darkEars", "darkLimbs", "darkPaws", "rimEars",
         "lightHead", "lowerFace", "bands", "mask", "rings", "tailTip", "tux", "stripes", "chevrons",
         "disc", "eyePatch", "darkMuzzle", "spots", "blotches", "coils", "facePatch", "bareHead", "ribbons"}
STRIPES = {"bold", "tabby"}
# What each kind of back is drawn in.
BACKS = {"shell": ("plate", "band", "speck"), "scutes": ("plate", "band", "speck"),
         "quills": ("quill", "tip"), "mane": ("plate", "band"), "fan": ("quill", "band", "tip"),
         "train": ("plate", "ring", "eye"), "shag": ("plate", "band"), "crest": ("plate", "band"),
         "wings": ("plate", "band", "tip")}
# A neck holds the head up; any longer and a tall pair of ears leaves the rig.
NECK_MAX = 40
COLOURS = {"fur", "light", "dark", "skin", "nose"}
NAME_MAX = 24

# Fragments the end of one animal's name joined onto another can make, and
# nothing else. Kept short on purpose; see the docstring.
NEVER = ["coon", "jap", "spic", "chink", "gook", "wop", "kike", "fag", "dyke", "tranny",
         "retard", "tard", "spaz", "cripple", "midget", "nigg", "darkie", "gyp", "paki",
         "slut", "whore", "cunt", "fuck", "shit", "piss", "dick", "cock", "twat", "bitch"]

NEGATION = (r"(?:no|not|nothing|never|neither|none|without|refuses?|refused|refusing|"
            r"cannot|does not|do not|won't|will not|is not|are not|isn't|aren't|nobody|"
            r"nor|declin\w+|instead of|rather than|less)")
FREAK = (r"monsters?|monstrous|freaks?|freakish|mutants?|mutated|abominations?|frankenstein\w*|"
         r"aberrations?|grotesque|misfits?|deformed|unnatural|mistakes?|wrong")
QUIZ = (r"spirit animals?|which animal (?:are you|you are)|your (?:true |inner )?animal|"
        r"personality|says about (?:you|anybody|somebody)|quiz(?:zes)?")
TALLY = (r"combinations|possible chimeras|collect them all|rarest|rare|scores?|scored|"
         r"leaderboards?|how many (?:you|chimeras)")
# What a familiar must never be given: anything it does for you, or a tally.
PERKS = (r"level(?:s|led|ling|ed|ing)? up|levels?|xp|experience points|stats?|boosts?|boosted|buffs?|"
         r"power-?ups?|streaks?|unlock(?:s|ed)?|evolves?|evolved|collection|collect")
VOCAB = [
    (FREAK, "every chimera here is whole. A Disabled people's site does not borrow the freak show's words."),
    (QUIZ, "nothing here tells anybody which animal they are or what an animal says about them."),
    (TALLY, "nothing here is counted, collected or scored."),
]

problems = []


def refuse(msg):
    problems.append(msg)


def esc(s):
    return html.escape(str(s), quote=False)


def attr(s):
    return html.escape(str(s), quote=True)


def plain(text):
    return html.unescape(re.sub(r"<[^>]+>", " ", str(text)))


def hexok(v):
    return isinstance(v, str) and re.fullmatch(r"#[0-9A-Fa-f]{6}", v)


def sweep(text, where):
    text = plain(text)
    for pat, why in VOCAB:
        for m in re.finditer(rf"\b(?:{pat})\b", text, re.I):
            # The window is anchored: the negation has to be in the same clause
            # as the word it excuses (A Quiet Pint's lesson).
            window = text[max(0, m.start() - 90):m.end()]
            if re.search(rf"\b{NEGATION}\b[^.;:]{{0,80}}?\b(?:{pat})\b\W*$", window, re.I):
                continue
            refuse(f"{where}: {m.group(0)!r} -- {why}")


def write_block(path, begin, end, block, required=True):
    src = path.read_text()
    if begin not in src or end not in src:
        if not required:
            return False
        raise SystemExit(f"REFUSING: {path.name} has no {begin} / {end} markers, so there is nowhere to write.\n"
                         "Put them back rather than letting this tool go quiet.")
    new = re.sub(re.escape(begin) + r".*?" + re.escape(end), lambda _m: begin + "\n" + block + "\n" + end, src, flags=re.S)
    if new != src:
        path.write_text(new)
    return True


# ── The shelf ────────────────────────────────────────────────────────────────
def check_shelf(d):
    if [s.get("key") for s in d.get("slots", [])] != SLOTS:
        refuse(f"the slots must be exactly {SLOTS}, in that order: chimera.js draws those and nothing else.")
    for s in d.get("slots", []):
        if s.get("defaults_to") != DEFAULTS.get(s.get("key")):
            refuse(f"slot {s.get('key')!r} defaults to {s.get('defaults_to')!r}, and the CB and chimera.js expect "
                   f"{DEFAULTS.get(s.get('key'))!r}: chimeras kept before it was a part depend on it.")
    for s in d.get("slots", []):
        if not s.get("legend") or not s.get("word"):
            refuse(f"slot {s.get('key')!r} has no legend or no word, and a part that cannot be said cannot be chosen.")
    animals = d.get("animals", {})
    if len(animals) < 2:
        refuse("a shelf needs at least two animals to make anything out of.")
    for key, a in animals.items():
        where = f"animal {key!r}"
        if not re.fullmatch(r"[a-z]+", key):
            refuse(f"{where}: a key is lowercase letters only, because it goes into an address after the #.")
        said = a.get("word", key)
        if not (isinstance(said, str) and re.fullmatch(r"[A-Za-z][a-z]*(?: [a-z]+)*", said)):
            refuse(f"{where}: its word, what it is called where its key is not, is words of letters.")
        elif "word" in a and said == key:
            refuse(f"{where}: its word is its key; leave word out.")
        elif a.get("a") != ("an" if said[0].lower() in "aeiou" else "a"):
            refuse(f"{where}: its article is {a.get('a')!r}, which does not go with the word.")
        say = a.get("say")
        if not (isinstance(say, list) and 2 <= len(say) <= 3 and all(isinstance(x, str) and x for x in say)):
            refuse(f"{where}: say is [the name as the body, the name as the second animal, an optional short form].")
        else:
            if not say[0][0].isupper() or (len(say) == 3 and not say[2][0].isupper()):
                refuse(f"{where}: the first and short name parts start with a capital, because a name starts there.")
            if not re.fullmatch(r"[a-z]+", say[1]):
                refuse(f"{where}: the second name part is lowercase letters, because it is the end of a word.")
            for part in say:
                low = part.lower()
                for w in NEVER:
                    if low == w or (part is say[1] and low.startswith(w)):
                        refuse(f"{where}: the name part {part!r} is, or begins with, a word nobody should be called. "
                               "Give it a longer piece of the animal's name.")
        c = a.get("colours", {})
        if set(c) != COLOURS or not all(hexok(v) for v in c.values()):
            refuse(f"{where}: colours are exactly {sorted(COLOURS)}, each a hex.")
        b = a.get("body", {})
        if not (isinstance(b.get("w"), (int, float)) and isinstance(b.get("h"), (int, float)) and
                0.5 <= b.get("top", 0) <= 1 and b.get("arms") in ARMS and b.get("feet") in FEET):
            refuse(f"{where}: the body needs w, h, top (0.5 to 1), arms in {sorted(ARMS)} and feet in {sorted(FEET)}.")
        elif not (120 <= b["w"] <= 230 and 130 <= b["h"] <= 215):
            refuse(f"{where}: a body {b['w']} wide and {b['h']} high falls off the rig, which is 400 by 460.")
        elif not (isinstance(b.get("neck", 0), (int, float)) and 0 <= b.get("neck", 0) <= NECK_MAX):
            refuse(f"{where}: a neck is up to {NECK_MAX} high, or the head it holds leaves the rig.")
        h = a.get("head", {})
        muz = h.get("muz", {})
        if not (isinstance(h.get("r"), (int, float)) and 55 <= h["r"] <= 90 and h.get("shape") in SHAPES and
                h.get("nose") in NOSES and isinstance(h.get("eyes"), dict) and {"y", "rx", "ry"} <= set(muz)
                and h["eyes"].get("big", False) in EYES and h.get("barbels", False) in (False, True)):
            refuse(f"{where}: the head needs r (55 to 90), sx, sy, a shape in {sorted(SHAPES)}, a nose in "
                   f"{sorted(NOSES)}, eyes and a muzzle.")
        e = a.get("ears", {})
        if not (e.get("type") in EARS and isinstance(e.get("a"), (int, float)) and isinstance(e.get("s"), (int, float))):
            refuse(f"{where}: ears need a type in {sorted(EARS)}, an angle a and a size s.")
        if a.get("mouth") not in MOUTHS:
            refuse(f"{where}: the mouth must be one of {sorted(MOUTHS)}.")
        t = a.get("tail", {})
        if t == {"none": True}:
            pass
        elif not (isinstance(t.get("d"), str) and t.get("fill") in FILLS):
            refuse(f"{where}: the tail needs a shape d and a fill in {sorted(FILLS)}, or is {{\"none\": true}} and nothing else.")
        elif t["d"].startswith("@") and not re.fullmatch(r"@circle -?[\d.]+ -?[\d.]+ [\d.]+", t["d"]):
            refuse(f"{where}: a round tail is written \"@circle cx cy r\".")
        elif t.get("whip") is not None and not (isinstance(t["whip"], list) and len(t["whip"]) == 2 and
                                                  t["whip"][0] > t["whip"][1] > 0):
            refuse(f"{where}: a whip tail is [its outline's width, its fill's width], the outline the wider.")
        bk = a.get("back")
        if bk is not None:
            if not (isinstance(bk, dict) and bk.get("kind") in BACKS and bk.get("word") and
                    all(hexok(bk.get(k)) for k in BACKS[bk["kind"]])):
                refuse(f"{where}: a back is null, or one of {sorted(BACKS)} with a word and the colours that kind is "
                       f"drawn in ({'; '.join(k + ': ' + ', '.join(v) for k, v in sorted(BACKS.items()))}).")
        m = a.get("markings", {})
        if not isinstance(m, dict) or not set(m) <= MARKS:
            refuse(f"{where}: markings may only be {sorted(MARKS)}; {sorted(set(m) - MARKS) if isinstance(m, dict) else m} "
                   "has no drawing in chimera.js.")
        elif "stripes" in m and m["stripes"] not in STRIPES:
            refuse(f"{where}: stripes are one of {sorted(STRIPES)}.")


def clean(d, c):
    """chimera.js's clean(), for the data file's own chimeras."""
    animals = d["animals"]
    if not isinstance(c, dict) or not set(c) <= set(SLOTS):
        return None
    c = {k: c[k] if k in c else c.get(DEFAULTS.get(k, ""), None) for k in SLOTS}
    for k in SLOTS:
        v = c[k]
        if not isinstance(v, str):
            return None
        if k == "back":
            if v != "none" and not (v in animals and animals[v].get("back")):
                return None
        elif v not in animals:
            return None
    return c


def check_presets(d):
    ids = set()
    for p in d.get("presets", []):
        if not p.get("id") or not p.get("label") or not p.get("whose"):
            refuse(f"a starting chimera needs an id, a label and whose it is: {p}")
        if p.get("id") in ids:
            refuse(f"the starting chimera {p.get('id')!r} is in the data twice.")
        ids.add(p.get("id"))
        if not clean(d, p.get("parts")):
            refuse(f"the starting chimera {p.get('id')!r} uses a part the shelf does not have.")
    if d.get("opens_on") not in ids:
        refuse("opens_on must be one of the starting chimeras.")


def shelf_js(d):
    def strip(o):
        if isinstance(o, dict):
            return {k: strip(v) for k, v in o.items() if not k.startswith("_")}
        if isinstance(o, list):
            return [strip(v) for v in o]
        return o
    out = {
        "slots": strip(d["slots"]),
        "animals": strip(d["animals"]),
        "known": strip(d.get("known", {})),
        "presets": strip(d.get("presets", [])),
        "opensOn": d.get("opens_on", ""),
    }
    return "  var SHELF = " + json.dumps(out, ensure_ascii=False, separators=(",", ":")) + ";"


def keys_for_server(d):
    return {
        "slots": SLOTS,
        "defaults": DEFAULTS,
        "animals": sorted(d["animals"]),
        "backs": sorted(k for k, a in d["animals"].items() if a.get("back")),
    }


# ── Drawn by chimera.js under Node ───────────────────────────────────────────
def node_draw(d):
    """Every suggested name, and the drawings the page carries before any
    script runs, out of chimera.js itself, so the build and the browser cannot
    draw or name a chimera two ways."""
    presets = d["presets"]
    opening = next(p for p in presets if p["id"] == d["opens_on"])
    job = {
        "pairs": [[b, x] for b in d["animals"] for x in d["animals"] if b != x],
        "presets": [{"id": p["id"], "parts": p["parts"]} for p in presets],
        "opening": opening["parts"],
    }
    script = r"""
require(process.argv[1]);
const C = globalThis.loveChimera, job = JSON.parse(process.argv[2]), out = {names: [], presets: {}};
for (const [b, x] of job.pairs) {
  const c = {}; for (const s of C.slots) c[s.key] = x;
  c.body = b; c.back = C.hasBack(x) ? x : 'none';
  out.names.push([b, x, C.suggest(c), C.second(c)]);
}
for (const p of job.presets) out.presets[p.id] = {
  svg: C.svg(p.parts, {prefix: 'chm-s-' + p.id, cls: 'chm-start__draw'}),
  name: C.suggest(p.parts), code: C.code(p.parts)};
out.table = C.svg(job.opening, {prefix: 'chm-live', cls: 'chm-disc__draw'});
out.scene = C.inner(job.opening, 'chm-scene');
out.words = C.words(job.opening);
out.name = C.suggest(job.opening);
out.code = C.code(job.opening);
process.stdout.write(JSON.stringify(out));
"""
    r = subprocess.run(["node", "-e", script, str(JS), json.dumps(job)], capture_output=True, text=True)
    if r.returncode != 0:
        raise SystemExit("REFUSING: chimera.js would not run under Node:\n" + r.stderr)
    return json.loads(r.stdout)


def norm(s):
    return re.sub(r"[^a-z]", "", s.lower())


def check_names(d, drawn):
    animals = d["animals"]
    theirs = {norm(n) for n in d.get("randimals", {}).get("names", [])}
    if not theirs:
        refuse("the Randimals list is empty, and it is what stops a suggestion being one of their characters.")
    for b, x, name, second in drawn["names"]:
        where = f"{b} with {x}'s parts"
        if second != x:
            refuse(f"{where}: chimera.js gave the name to {second!r}, which is not the animal that gave the parts.")
        if not name:
            refuse(f"{where}: no name came back.")
            continue
        if len(name) > NAME_MAX:
            refuse(f"{where}: the suggestion {name!r} is longer than {NAME_MAX} letters, which is all a name may be.")
        if norm(name) in theirs:
            refuse(f"{where}: the suggestion {name!r} is one of Randimals' characters. Change a name part, or put a "
                   "name somebody chose in known.")
        low = name.lower()
        for w in NEVER:
            if w in low and w not in b and w not in x:
                refuse(f"{where}: the suggestion {name!r} carries a word nobody should be called. Change a name part.")
    for key in d.get("known", {}):
        if key.startswith("_"):
            continue
        if not re.fullmatch(r"[a-z]+\+[a-z]+", key):
            refuse(f"known name {key!r} must be written body+second.")


# ── The page ─────────────────────────────────────────────────────────────────
def scene(drawn):
    """The room, seen from the door: the lens in the roof, the light coming
    down, the table on its pedestal with a rail round it, and the chimera lying
    on the table as a picture, which is why it is squashed: you are looking at
    it on a surface, from the side."""
    chim = drawn["scene"]
    return (
        '<svg class="chm-scene__draw" viewBox="0 0 1200 500" aria-hidden="true" focusable="false">'
        '<defs>'
        '<linearGradient id="chm-scene-beam" x1="0" y1="0" x2="0" y2="1">'
        '<stop offset="0" stop-color="var(--chm-table)" stop-opacity=".24"/>'
        '<stop offset="1" stop-color="var(--chm-table)" stop-opacity=".05"/></linearGradient>'
        '<radialGradient id="chm-scene-disc" cx="600" cy="330" r="250" gradientUnits="userSpaceOnUse" '
        'gradientTransform="translate(0 247.5) scale(1 .25)">'
        '<stop offset="0" stop-color="var(--chm-table)"/><stop offset=".78" stop-color="var(--chm-table)"/>'
        '<stop offset="1" stop-color="var(--chm-edge)"/></radialGradient>'
        '<clipPath id="chm-scene-top"><ellipse cx="600" cy="330" rx="248" ry="61"/></clipPath>'
        '</defs>'
        '<rect width="1200" height="500" fill="var(--chm-room)"/>'
        '<path d="M0 40 H1200" stroke="var(--chm-plinth)" stroke-width="3"/>'
        '<ellipse cx="600" cy="352" rx="430" ry="118" fill="none" stroke="var(--chm-rail)" stroke-width="6"/>'
        '<path d="M178 352 V470 M1022 352 V470 M372 455 V470 M828 455 V470" stroke="var(--chm-rail)" stroke-width="6"/>'
        '<rect x="566" y="0" width="68" height="34" rx="4" fill="var(--chm-brass)"/>'
        '<path d="M580 30 L620 30 L612 40 L588 40 Z" fill="var(--chm-brass)"/>'
        '<ellipse cx="600" cy="40" rx="18" ry="5" fill="var(--chm-table)"/>'
        '<path d="M584 42 L616 42 L846 330 L354 330 Z" fill="url(#chm-scene-beam)"/>'
        '<path d="M556 386 L536 470 H664 L644 386 Z" fill="var(--chm-plinth)"/>'
        '<ellipse cx="600" cy="472" rx="96" ry="12" fill="var(--chm-plinth)"/>'
        '<path d="M350 330 V346 A250 64 0 0 0 850 346 V330 Z" fill="var(--chm-plinth)"/>'
        '<ellipse cx="600" cy="330" rx="250" ry="62" fill="url(#chm-scene-disc)"/>'
        '<g clip-path="url(#chm-scene-top)">'
        '<svg x="476" y="292" width="248" height="74" viewBox="0 0 400 460" preserveAspectRatio="none">'
        + chim + '</svg></g>'
        '</svg>'
    )


def table(drawn):
    return (
        f'<div class="chm-disc" id="chm-disc" data-familiar-avoid>{drawn["table"]}</div>\n'
        f'<p class="chm-named" id="chm-named">{esc(drawn["name"])}</p>\n'
        f'<p class="chm-words" id="chm-words" aria-live="polite">{esc(drawn["words"])}</p>'
    )


def starts(d, drawn):
    out = []
    for p in d["presets"]:
        got = drawn["presets"][p["id"]]
        out.append(
            f'          <button type="button" class="chm-start" data-chimera="{attr(got["code"])}" '
            f'data-name="{attr(got["name"])}">{got["svg"]}'
            f'<span class="chm-start__name">{esc(p["label"])}</span>'
            f'<span class="chm-start__whose">{esc(p["whose"])}</span></button>')
    return "\n".join(out)


def shelf_words(d):
    items = "".join(f'<li>{esc(a["a"])} {esc(a.get("word", k))}</li>' for k, a in d["animals"].items())
    return (f'    <p>On the shelf now, with every part each one has:</p>\n'
            f'    <ul class="chm-shelf">{items}</ul>')


def wall(d):
    q = d["quote"]
    figs = []
    for dr in d["becky"]["drawings"]:
        figs.append(
            f'<li class="chm-frame"><img src="{attr(dr["file"])}" width="{dr["width"]}" height="{dr["height"]}" '
            f'alt="{attr(dr["alt"])}" loading="lazy" decoding="async">'
            f'<p class="chm-frame__name">{esc(dr["name"])}</p>'
            f'<p class="chm-frame__whose">{esc(dr["whose"])}, drawn by Becky Hicks</p></li>')
    return (
        f'    <blockquote class="chm-quote"><p>{esc(q["words"])}</p>'
        f'<p class="chm-quote__from">&mdash; <a href="{attr(q["url"])}">Stimpunks, About</a>, '
        f'read on {esc(q["read_on"])}</p></blockquote>\n'
        f'    <ul class="chm-wall">{"".join(figs)}</ul>'
    )


def faces():
    f = json.loads(FACES.read_text())["faces"]
    try:
        g, t = f["gilda-display"], f["gantari"]
    except KeyError:
        refuse("data/foundry-faces.json has no record for Gilda Display or Gantari. Run tools/pull-foundry.py.")
        return ""
    if g["licence"] != t["licence"]:
        return (f'Gilda Display is {esc(g["designer"])}&rsquo;s, under the {esc(g["licence"])}, and Gantari is '
                f'{esc(t["designer"])}&rsquo;s, under the {esc(t["licence"])}, both read off their own records.')
    return (f'Gilda Display is {esc(g["designer"])}&rsquo;s and Gantari is {esc(t["designer"])}&rsquo;s, both under '
            f'the {esc(g["licence"])} and read off their own records.')


def credit_items(d):
    return [
        ('<strong>The three chimeras on the wall are Becky Hicks&rsquo;s</strong>, drawn for '
         '<a href="https://stimpunks.org/about/">stimpunks.org&rsquo;s About page</a>: Ryan&rsquo;s Bearmouse, '
         'Chelsea&rsquo;s Pandillo and Inna&rsquo;s Bunnybadger. Becky is on the Stimpunks board, and they hang here '
         'under this site&rsquo;s licence, CC BY-SA 4.0, with her yes.'),
        '<strong>The room began with Norah</strong>, asking for an otteraccoon.',
        ('<strong>Every part on the shelf is drawn as code</strong> by Claude, an AI model made by Anthropic, to '
         'Ryan&rsquo;s brief, after Becky&rsquo;s three. Nothing on this page calls an AI while you use it.'),
        ('<strong>Our friends at <a href="https://randimals.com/">Randimals</a></strong> make combined animals as '
         'plush toys. The Porkypine is a name Randimals and Stimpunks made together, and no name this room suggests '
         'is one of their characters&rsquo;.'),
        ('<strong>The line about Ryan&rsquo;s Bearmouse</strong> is from our About page and was checked there '
         'word for word.'),
        faces(),
    ]


def credits(d):
    lis = "".join(f'<li>{c}</li>' for c in credit_items(d) if c)
    return f'    <ul class="chm-creditlist">{lis}</ul>'


def liner(d):
    return ('      <li><strong>Chimera Obscura</strong>: Ryan&rsquo;s brief, 2026-10-18, after Norah asked for an '
            'otteraccoon. Bearmouse, Pandillo and Bunnybadger are Becky Hicks&rsquo;s, drawn for stimpunks.org&rsquo;s '
            'About page and hung here under CC BY-SA 4.0 with her yes. Every part on the shelf is drawn as code by '
            'Claude. Our friends at <a href="https://randimals.com/">Randimals</a> make combined animals as plush '
            'toys, and the Porkypine is a name they and Stimpunks made together. ' + faces() + '</li>')


def check_quote(d):
    q = d["quote"]
    f = MIRROR / q["mirror"]
    if not f.exists():
        return
    src = re.sub(r"\*\*|__", "", f.read_text())
    src = re.sub(r"\s+", " ", src)
    if re.sub(r"\s+", " ", q["words"]) not in src:
        refuse(f"the line about Ryan's Bearmouse is not on our About page in those words any more ({f}). "
               "Re-copy it from there; do not loosen this.")


def check_becky(d):
    b = d.get("becky", {})
    if b.get("agreed") != "2026-10-18":
        refuse("the date Becky Hicks agreed to CC BY-SA is gone from the data file, and it is the licence these "
               "drawings travel under.")
    for dr in b.get("drawings", []):
        f = ROOT / dr["file"]
        if not f.exists():
            refuse(f"{dr['file']} is not on disk.")
            continue
        if not dr.get("alt") or len(dr["alt"]) < 40:
            refuse(f"{dr['file']} has no real alt text, and a drawing nobody can hear is half a credit.")
        try:
            from PIL import Image
            with Image.open(f) as im:
                if im.size != (dr["width"], dr["height"]):
                    refuse(f"{dr['file']} is {im.size}, and the page says {dr['width']} by {dr['height']}.")
                if im.info.get("exif") or im.info.get("xmp"):
                    refuse(f"{dr['file']} still carries metadata. Save it again with none.")
        except ImportError:
            pass


def check_scripts(phase_keep):
    for js in (JS, ROOM_JS):
        if not js.exists():
            refuse(f"{js.name} is missing.")
            continue
        src = js.read_text()
        code = re.sub(r"/\*.*?\*/|//[^\n]*", "", src, flags=re.S)
        if re.search(r"\bnew Audio\b|AudioContext|speechSynthesis|navigator\.vibrate|<audio", code):
            refuse(f"{js.name} makes a sound, and nothing in this room does.")
        if re.search(r"getUserMedia|getDisplayMedia|getContext\s*\(|type\s*=\s*['\"]file['\"]", code):
            refuse(f"{js.name} asks for a camera, a file or a canvas. A chimera is choices, never a picture.")
        if re.search(r"sessionStorage|indexedDB|document\.cookie", code):
            refuse(f"{js.name} stores something.")
        if js is JS:
            if re.search(r"\bfetch\s*\(|XMLHttpRequest|EventSource|WebSocket|sendBeacon|localStorage|innerHTML", code):
                refuse("chimera.js fetches, stores or writes markup. It draws, and returns its drawing as a string.")
            continue
        if re.search(r"innerHTML|outerHTML|insertAdjacentHTML|document\.write|DOMParser|createContextualFragment", code):
            refuse(f"{js.name} writes markup from a string. The drawing is the element chimera.js builds.")
        if not phase_keep:
            if re.search(r"\bfetch\s*\(|XMLHttpRequest|EventSource|WebSocket|sendBeacon|localStorage", code):
                refuse(f"{js.name} sends or stores something, and the bench keeps nothing and sends nothing.")
        else:
            for m in re.finditer(r"\bfetch\s*\(\s*([^,)]+)", code):
                if "/cb/chimeras" not in m.group(1):
                    refuse(f"{js.name} sends to {m.group(1)!r}; the only place a chimera goes is /cb/chimeras.")
            if re.search(r"XMLHttpRequest|EventSource|WebSocket|sendBeacon", code):
                refuse(f"{js.name} sends something some other way than to /cb/chimeras.")
            if re.search(r"localStorage\.(?:setItem|removeItem|clear)|localStorage\[[^\]]+\]\s*=", code):
                refuse(f"{js.name} writes to localStorage. It reads the CB's pass and never writes it.")
            for m in re.finditer(r"localStorage\.getItem\(\s*['\"]([^'\"]+)", code):
                if m.group(1) != "love-cb":
                    refuse(f"{js.name} reads {m.group(1)!r}; the only thing it may read is the CB's pass, love-cb.")


def strings_of(code):
    return " ".join(m.group(2) for m in re.finditer(r"(['\"])((?:\\.|(?!\1).)*)\1", code))


def body_of(code, name):
    """The body of a function or a method, by counting braces."""
    m = re.search(rf"(?:function {name}|\.{name} = function)\s*\([^)]*\)\s*\{{", code)
    if not m:
        return ""
    i, depth = m.end(), 1
    while i < len(code) and depth:
        depth += {"{": 1, "}": -1}.get(code[i], 0)
        i += 1
    return code[m.end():i - 1]


def check_familiar():
    """The familiar's promises, held in the files that keep them."""
    if not FAMILIAR.exists() or not FAMILIAR_CSS.exists():
        refuse("familiar.js or familiar.css is missing.")
        return
    code = re.sub(r"/\*.*?\*/|//[^\n]*", "", FAMILIAR.read_text(), flags=re.S)
    if re.search(r"\bfetch\s*\(|XMLHttpRequest|EventSource|WebSocket|sendBeacon|navigator\.share|/cb/", code):
        refuse("familiar.js sends something. A familiar is kept in the browser and sent nowhere.")
    if re.search(r"sessionStorage|indexedDB|document\.cookie|caches\.", code):
        refuse("familiar.js stores something other than love-familiar.")
    if not re.search(r"var KEY = 'love-familiar';", code):
        refuse("familiar.js no longer keeps its familiar under love-familiar, which privacy.html names.")
    for m in re.finditer(r"localStorage\.(?:getItem|setItem|removeItem)\(\s*([^,)]+)", code):
        if m.group(1).strip() != "KEY":
            refuse(f"familiar.js touches {m.group(1).strip()!r} in localStorage; the only key it may use is love-familiar.")
    if re.search(r"localStorage\.clear|localStorage\[", code):
        refuse("familiar.js reaches into localStorage some other way than by its one key.")
    if re.search(r"love-cb", code):
        refuse("familiar.js reads the CB's pass. A familiar does not react to the radio, and nobody needs to be signed on to have one.")
    if re.search(r"innerHTML|outerHTML|insertAdjacentHTML|document\.write|DOMParser|createContextualFragment", code):
        refuse("familiar.js writes markup from a string. Its menu is built with createElement and textContent, and the drawing is chimera.js's.")
    if re.search(r"\bnew Audio\b|AudioContext|speechSynthesis|navigator\.vibrate|<audio", code):
        refuse("familiar.js makes a sound. A familiar is silent, as the Arcade promises of its rooms.")
    if re.search(r"getUserMedia|getDisplayMedia|getContext\s*\(", code):
        refuse("familiar.js asks for a camera or draws on a canvas. A familiar is a chimera, which is choices.")
    if re.search(r"\.style\.transform|\btransform\s*=", code):
        refuse("familiar.js moves something with a transform. It moves with left and top, so check-gentle.py can see it.")
    may = body_of(code, "mayMove")
    if "intensity() === 'max'" not in may or "state.moves" not in may:
        refuse("mayMove() in familiar.js is no longer MAX GLITTER or Let it move by itself.")
    for fn in ("wander", "followScroll", "followTo", "seekCozy"):
        if "mayMove()" not in body_of(code, fn):
            refuse(f"{fn}() in familiar.js moves it without asking mayMove(). Nothing moves by itself below MAX GLITTER unless you let it.")
    if re.search(r"\.style\.(?:left|top)\s*=", body_of(code, "measureOrigin")):
        refuse("measureOrigin() in familiar.js moves the familiar to measure it. Setting left and top to measure, with a "
               "walk's transition still on, walked it in from the corner of the page every few seconds; read them instead.")
    glide = body_of(code, "mayGlide")
    if "mayMove()" not in glide or "'gentle'" not in glide:
        refuse("mayGlide() in familiar.js no longer asks mayMove() and keeps out of Gentle.")
    if "mayGlide()" not in body_of(code, "speak"):
        refuse("speak() in familiar.js puts up a speech bubble without asking mayGlide(). A bubble is only for a familiar "
               "that may move by itself, and never at Gentle.")
    if "this.bubbleEl.setAttribute('aria-hidden', 'true');" not in code:
        refuse("a familiar's speech bubble is no longer aria-hidden. Pressing it says the same thing on purpose; a "
               "bubble read out by itself is words arriving unasked.")
    if "clearBox(" not in body_of(code, "speak"):
        refuse("speak() in familiar.js puts up a speech bubble without checking it covers no words.")
    allowed = body_of(code, "allowed")
    for need in ("window.top", "data-cb", "'off'", "data-cb-window"):
        if need not in allowed:
            refuse(f"allowed() in familiar.js no longer checks {need}: no familiar in a frame, a window, or a room that says data-cb=\"off\".")
    words = strings_of(code)
    for m in re.finditer(rf"\b(?:{PERKS})\b", words, re.I):
        refuse(f"familiar.js says {m.group(0)!r}. A familiar keeps you company; it gives you nothing and nothing is counted.")
    sweep(words, "familiar.js")

    css = re.sub(r"/\*.*?\*/", "", FAMILIAR_CSS.read_text(), flags=re.S)
    if re.search(r"#[0-9A-Fa-f]{3,8}\b|\brgba?\(|\bhsla?\(|(?<![\w-])(?:white|black)(?![\w-])", css):
        refuse("familiar.css sets a colour of its own. It wears Chimera Obscura's tokens, whose pairs are measured.")
    for m in re.finditer(r"var\(\s*(--[\w-]+)", css):
        if not m.group(1).startswith("--chm-"):
            refuse(f"familiar.css uses {m.group(1)}; it wears Chimera Obscura's --chm- tokens and nothing else.")
    for m in re.finditer(r"([^{}]+)\{([^{}]*)\}", css):
        sel, decl = m.group(1).strip(), m.group(2)
        if re.search(r"\b(?:animation|transition)\s*:", decl) and ".is-walking" not in sel:
            refuse(f"familiar.css moves something at {sel!r}. Nothing of it moves but a walk.")
    if not re.search(r"@media print\s*\{\s*:host\s*\{\s*display:\s*none\s*!important", css):
        refuse("familiar.css lets a familiar print. It is company on the screen, not part of the page.")

    love = LOVE_JS.read_text()
    fam = re.search(r"function familiar\(\)\s*\{(.*?)\n  \}", love, re.S)
    if not fam:
        refuse("love.js no longer loads a familiar.")
    else:
        for need in ("data-cb", "'off'", "data-cb-window", "window.top", "love-familiar"):
            if need not in fam.group(1):
                refuse(f"love.js loads familiar.js without checking {need}.")
    if "<code>love-familiar</code>" not in PRIVACY.read_text():
        refuse("privacy.html does not list love-familiar, and nothing is kept in a browser that the page does not say.")
    if '<script src="familiar.js" defer></script>' not in PAGE.read_text():
        refuse("chimera-obscura.html does not load familiar.js, so Take it with you has nothing to hand the chimera to.")


def check_server():
    """Once chimeras can be kept, the promises privacy.html#chimeras makes are
    held where they are kept: Forget me and deleting the username delete them,
    a sticker is only ever the sender's own, and every answer asks search
    engines to leave it alone."""
    lib = LIB.read_text()
    da = re.search(r"export async function deleteAccount\(.*?\n\}", lib, re.S)
    if not da or "await forgetChimeras(petKey(handle), s);" not in da.group(0):
        refuse("deleteAccount in lib.mjs no longer deletes a username's chimeras.")
    fc = re.search(r"export async function forgetChimeras\(.*?\n\}", lib, re.S)
    if not fc or "chimerasBlob(pk)" not in fc.group(0) or "chShownBlob(pk)" not in fc.group(0):
        refuse("forgetChimeras in lib.mjs no longer deletes both the chimeras and the switch that shows them.")
    if "forgetChimeras(pk)" not in (ROOT / "netlify/functions/cb-pets.mjs").read_text():
        refuse("Forget me (cb-pets.mjs) no longer deletes chimeras.")
    tx = (ROOT / "netlify/functions/cb-transmit.mjs").read_text()
    if "chimeraSticker(who.handle, b.chimera)" not in tx:
        refuse("a chimera sticker is no longer looked up among the sender's own chimeras in cb-transmit.mjs.")
    keep = re.search(r"export async function keepChimera\(.*?\n\}", lib, re.S)
    if not keep or re.search(r"\bt:|Date\.now|now\b", keep.group(0)):
        refuse("keepChimera keeps a time. Nothing about when is kept: privacy.html#chimeras says so.")
    for f in ("cb-chimeras.mjs", "cb-chimeras-of.mjs"):
        src = (ROOT / "netlify/functions" / f).read_text()
        if "noindex" not in src:
            refuse(f"{f} answers without asking search engines not to index it.")
    if re.search(r"console\.(log|info|warn|error)", (ROOT / "netlify/functions/cb-chimeras.mjs").read_text()):
        refuse("cb-chimeras.mjs logs something, and nothing a person sends is ever logged.")
    if 'id="chimeras"' not in (ROOT / "privacy.html").read_text():
        refuse("privacy.html has no section on chimeras, and nothing is kept under a person that the page does not say.")


def check_page(src):
    body = re.sub(r"<blockquote.*?</blockquote>", " ", src, flags=re.S)
    body = re.sub(r"<script.*?</script>", " ", body, flags=re.S)
    body = re.sub(r"<!--.*?-->", " ", body, flags=re.S)
    body = re.sub(r"<svg.*?</svg>", " ", body, flags=re.S)
    main = re.search(r"<main.*?</main>", body, re.S)
    sweep(main.group(0) if main else body, PAGE.name)
    if re.search(r"\bRandimal\b|\brandimals?\b", plain(main.group(0) if main else body)):
        refuse("the page calls something a Randimal, or writes their name in lowercase. Randimals is our friends' "
               "company and its characters are theirs; what is made here is a chimera.")
    for who in ("Becky Hicks", "Norah", "Randimals", "Claude"):
        cr = re.search(r'<section class="chm-part chm-credits".*?</section>', src, re.S)
        if not cr or who not in cr.group(0):
            refuse(f"the room's credits do not name {who}.")
    if 'href="sandbox.html#suggest-chimera"' not in src:
        refuse("the way to ask for an animal is gone. Every request goes to the suggestion box, "
               "sandbox.html#suggest-chimera.")
    if re.search(r"<audio|<iframe|class=\"facade", src):
        refuse("the room has something to play in it. Nothing in it makes a sound.")
    if 'id="cant-find-it"' not in src:
        refuse("the Can't find it? heading lost its anchor, and the Community Center's service board points at it.")


def main():
    d = json.loads(DATA.read_text())
    check_shelf(d)
    check_presets(d)
    check_becky(d)
    check_quote(d)
    if problems:
        print("REFUSING:\n  " + "\n  ".join(problems))
        sys.exit(1)

    # The shelf goes into chimera.js first, so Node draws from what is here now.
    write_block(JS, "/* chimera:data:begin */", "/* chimera:data:end */", shelf_js(d))
    phase_keep = write_block(LIB, "/* chimera:keys:begin */", "/* chimera:keys:end */",
                             "export const CHIMERA = " + json.dumps(keys_for_server(d), separators=(",", ":")) + ";",
                             required=False)
    drawn = node_draw(d)
    check_names(d, drawn)
    check_scripts(phase_keep)
    check_familiar()
    if phase_keep:
        check_server()
    if problems:
        print("REFUSING:\n  " + "\n  ".join(problems))
        sys.exit(1)

    pairs = [("chm:scene", scene(drawn)), ("chm:table", table(drawn)), ("chm:starts", starts(d, drawn)),
             ("chm:shelf", shelf_words(d)), ("chm:wall", wall(d)), ("chm:credits", credits(d))]
    src = PAGE.read_text()
    for name, block in pairs:
        begin, end = f"<!-- {name}:begin -->", f"<!-- {name}:end -->"
        if begin not in src or end not in src:
            raise SystemExit(f"REFUSING: {PAGE.name} has no {name} markers. Put them back.")
        src = re.sub(re.escape(begin) + r".*?" + re.escape(end), lambda _m, b=block: begin + "\n" + b + "\n" + end,
                     src, flags=re.S)
    check_page(src)
    if problems:
        print("REFUSING (the page as written):\n  " + "\n  ".join(problems))
        sys.exit(1)
    if src != PAGE.read_text():
        PAGE.write_text(src)
    write_block(NOTES, "<!-- chimera-credits:begin -->", "<!-- chimera-credits:end -->", liner(d))
    print(f"chimera obscura: the shelf written into chimera.js, every suggested name checked"
          f"{', the keys written into lib.mjs' if phase_keep else ''}, and the room built")


if __name__ == "__main__":
    main()
