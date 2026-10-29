#!/usr/bin/env python3
"""Build the Bodymind Booth out of data/bodymind.json, and write the lists every
avatar on the street is drawn and checked against.

WHAT THE ROOM IS. A photo booth on the street with no camera in it, next door
to the Dopamine Dress-Up Den, where you draw your bodymind: how you get about,
your shape, your skin, your face, your hair, and everything you always have
with you. Then you take it next door and dress it, keep it in your Profile on
the CB, and wear one on the CB, where it shows beside your name on Who's
online and can be sent as a sticker. Ryan's brief, 2026-10-14, from a proposal
written after somebody in our community said they hoped for characters to
dress one day.

THE DRESS-UP DEN STAYS BODY-FREE, AND THAT IS WHY THIS IS A ROOM OF ITS OWN.
The Den was built with nobody's body in it, because a paper doll is one body
handed to everybody. That objection was to the house choosing the body. Here
nobody is handed one: the booth opens on a bodymind drawn at random, so no body
is the one it starts from, and the only body the Den ever shows is one somebody
made here and walked next door. Ryan's call, 2026-10-14, reversing "not open:
any drawing of a body" for a separate room; the Den's own rule holds for the
Den.

THREE FILES HAVE TO AGREE ABOUT EVERY CHOICE, SO THIS TOOL WRITES TWO OF THEM.
data/bodymind.json says what can be chosen; avatar.js draws it, and
netlify/cb/lib.mjs refuses an avatar kept with anything else in it. The lists
in the last two, between their avatar markers, are written here out of this
file and out of data/dressup.json (the rails, prints and colourways the Den
dresses a bodymind in), so a garment added to the Den is wearable on a body,
checkable by the server and drawable on the stand the day it is hung up -- as
long as avatar.js can put it on a body, which tools/avatar.test.mjs checks in
every pose. Never hand-edit between those markers.

IT REFUSES, RATHER THAN TRUSTS:

  - A CHOICE WITH NO WORDS, or two choices in one list with the same key. A
    choice that cannot be said cannot be heard by somebody choosing it.

  - A STARTING BODY. Nothing in the data, the page or booth.js may call a body
    normal, average, default, standard or typical, or mark one as where the
    booth begins; the page ships with nothing checked, and booth.js draws a
    bodymind at random. See _no_first_body.

  - AN AID SOLD AS CLOTHING. Nothing in the "always" part may share a key with
    a garment on the Den's rails, because what you always have with you is
    chosen here and nothing put on next door takes it off. See _aids.

  - A COLOUR WITHOUT A HEX, and a skin tone named by a word rather than a
    number. See _skin.

  - THE VOCABULARY OF BODIES BEING JUDGED, OF GENDERED CHOICES, OF CURES AND OF
    SCORING, in the room's own voice, with the negation window every sweep here
    uses, outside quotations:
      · judging: flattering, slimming, ideal, perfect body, attractive, ugly,
        overweight, obese, plus-size, petite, body type -- a body is chosen
        here, never improved.
      · gender: male, female, men's, women's, boy, girl, masculine, feminine.
        No choice in the booth is anybody's, and no part of the booth asks.
      · cure: fix, correct, overcome, suffer, wheelchair-bound, confined to,
        special needs -- the words that turn an aid into a tragedy.
      · scoring: rating, score, likes, votes, most popular, best.

  - A CAMERA OR AN UPLOAD. booth.js, try-on.js and strip.js may not ask for the camera or
    the microphone, may not take a file, and may not draw onto a canvas: an
    avatar is kept as the list of choices it is, never as a picture.

  - A SCRIPT THAT KEEPS OR SENDS ANYTHING IT SHOULD NOT. booth.js and try-on.js
    read the CB's pass out of love-cb and never write it; they send only to
    /cb/avatars, and only when somebody presses a button that says it keeps;
    they store nothing. strip.js is Your strip, in the booth, the Dress-Up Den
    and Fantasy Fancy Dress, and it only READS: one GET of /cb/avatars when
    somebody presses Open my strip, so it is refused a POST as well, because
    Fantasy Fancy Dress promises that nothing in there is kept.

  - THE QUOTATION, IF THE MIRROR SAYS OTHERWISE. Nick Walker's line is read on
    our Bodymind entry; when the Knowledge System mirror is on this machine, the
    words are looked for in it, the Town Hall's rule: re-copy, never loosen.

It writes nothing if anything is refused. Run it after make-dressup.py, then
node --test tools/avatar.test.mjs, then make-og.py.
"""
import html
import importlib.util
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data/bodymind.json"
DRESS = ROOT / "data/dressup.json"
FANCY = ROOT / "data/fancy-dress.json"
CHIMERA = ROOT / "data/chimera-obscura.json"
PAGE = ROOT / "bodymind-booth.html"
DEN = ROOT / "dopamine-dress-up-den.html"
NOTES = ROOT / "liner-notes.html"
CSS = ROOT / "love.css"
AVATAR = ROOT / "avatar.js"
LIB = ROOT / "netlify/cb/lib.mjs"
SCRIPTS = (ROOT / "booth.js", ROOT / "try-on.js", ROOT / "strip.js")
STRIP_PAGES = {"bodymind-booth.html": "booth.js", "dopamine-dress-up-den.html": "try-on.js",
               "fantasy-fancy-dress.html": "fancy-dress.js"}
MIRROR = Path.home() / "Documents/Claude/Projects/Stimpunks Knowledge System/site/stimpunks.org"

ONLY_LISTS = "--lists" in sys.argv

NEGATION = (r"(?:no|not|nothing|never|neither|none|without|refuses?|refused|refusing|"
            r"cannot|does not|do not|won't|will not|is not|are not|isn't|aren't|nobody|"
            r"nor|declin\w+|instead of|rather than)")
JUDGING = (r"flatter\w*|slimming|ideal body|perfect body|attractive|unattractive|ugly|"
           r"overweight|obese|plus[- ]size\w*|petite|body types?|figure flaws?")
GENDER = (r"male|female|men'?s|women'?s|boys?|girls?|masculine|feminine|ladies|gents")
CURE = (r"fix(?:es|ed|ing)?|correct(?:s|ed|ing)?|overcom\w+|suffer\w*|wheelchair[- ]bound|"
        r"confined to|special needs|afflicted|victim of")
TALLY = r"scores?|scored|ratings?|rate (?:my|your)|likes? count|votes?|most popular|leaderboards?"
FIRST = r"normal|average|default|standard body|typical"
VOCAB = [
    (JUDGING, "a body is chosen here, never improved or judged."),
    (GENDER, "no choice in the booth is anybody's, and nothing in it asks."),
    (CURE, "an aid here is part of somebody, not a tragedy or a problem being solved."),
    (TALLY, "nothing here is rated, scored, counted or compared."),
    (FIRST, "no body is where the booth starts. See _no_first_body."),
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


def dressup():
    """make-dressup.py's cuts, prints and painting order, read from the tool
    itself, so the stand an avatar is drawn on is the Den's stand."""
    spec = importlib.util.spec_from_file_location("make_dressup", ROOT / "tools/make-dressup.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def css_hex(name):
    m = re.search(rf"--{re.escape(name)}:\s*(#[0-9A-Fa-f]{{6}})\b", CSS.read_text())
    return m.group(1) if m else None


def standalone(markup, slot, colours):
    """The Den's cut, with its classes turned into the attributes love.css gives
    them, so it draws the same in a page that is not the Den's and in the
    radio's shadow root. @P@ is the avatar's own prefix, filled in by
    avatar.js, so two avatars on one page never share a pattern."""
    ink, panel, wood = colours
    out = markup
    out = out.replace('class="dd-fab"', f'fill="url(#@P@-{slot})" stroke="{ink}" stroke-width="2" stroke-linejoin="round"')
    out = out.replace('class="dd-seam"', f'fill="none" stroke="{ink}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"')
    out = out.replace('class="dd-knot"', f'fill="{panel}" stroke="{ink}" stroke-width="1.4"')
    out = out.replace('class="dd-wood"', f'fill="{wood}" stroke="{ink}" stroke-width="2"')
    if "class=" in out:
        refuse(f"a cut for the {slot} carries a class this tool cannot turn into attributes: {out[:120]}")
    return out


def fancy():
    """Fantasy Fancy Dress's rails, the shop behind the Den: slots only a
    bodymind can wear (wings, ears, tails, paws, jewellery, dress-up suits),
    so they have no cut on the valet stand and both checkers refuse them on
    it. tools/make-fancy-dress.py checks their words; this only lists them."""
    return json.loads(FANCY.read_text())["slots"]


HEX = re.compile(r"^#[0-9A-Fa-f]{6}$")


def chimera_lists():
    """What avatar.js needs to make a chimera onesie (Fantasy Fancy Dress,
    a request from our community for Halloween, 2026-10-28): for every animal
    on Chimera Obscura's shelf, its colours, the kind of ears, tail and back it
    has and its markings, read out of data/chimera-obscura.json so that a new
    animal on the shelf is a new onesie with nothing to edit. Only the shapes'
    kinds come across, never chimera.js's drawings: a onesie is a suit with a
    hood, and what it borrows from an animal is what a suit can carry. The
    slots and their defaults come across too, so avatar.js checks a chimera
    the way chimera.js and the server's cleanChimera() do."""
    c = json.loads(CHIMERA.read_text())
    comb = re.search(r"COMB = '(#[0-9A-Fa-f]{6})'", (ROOT / "chimera.js").read_text())
    if not comb:
        refuse("chimera.js has no COMB colour, and a chicken's comb on a hood is drawn in it.")
    animals = {}
    for key, a in c["animals"].items():
        col = a.get("colours") or {}
        for part in ("fur", "light", "dark", "skin"):
            if not HEX.match(str(col.get(part, ""))):
                refuse(f"chimera shelf: {key} has no {part} colour as a hex, and its onesie is drawn in it.")
        t = a.get("tail")
        tail = None
        if t and not t.get("none"):
            kind = ("stub" if t.get("at") else "paddle" if t.get("hatch") else "tuft" if t.get("tuft")
                    else "whip" if (t.get("whip") or t.get("string")) else "thick")
            tail = {"kind": kind, "fill": t.get("fill") or "fur"}
        b = a.get("back")
        back = None
        if b:
            main = b.get("plate") or b.get("quill")
            second = b.get("band") or b.get("tip") or main
            third = b.get("tip") or b.get("eye") or b.get("speck") or b.get("ring") or second
            if not all(HEX.match(str(x or "")) for x in (main, second, third)):
                refuse(f"chimera shelf: {key}'s back has no colours as hexes.")
            back = {"kind": b["kind"], "word": b.get("word") or key, "main": main, "second": second, "third": third}
        animals[key] = {
            "word": a.get("word") or key, "a": a.get("a") or "a",
            "fur": col.get("fur"), "light": col.get("light"), "dark": col.get("dark"), "skin": col.get("skin"),
            "ears": (a.get("ears") or {}).get("type") or "none",
            "tail": tail,
            "marks": sorted(k for k, v in (a.get("markings") or {}).items() if v),
            "back": back,
        }
    return {
        "slots": [s["key"] for s in c["slots"]],
        "defaults": {s["key"]: s["defaults_to"] for s in c["slots"] if s.get("defaults_to")},
        "animals": animals,
        "comb": comb.group(1) if comb else "#D7313E",
    }


def lists(d, dd, mod):
    """Everything avatar.js needs to know, as one object."""
    ink, panel, wood = css_hex("dd-ink"), css_hex("dd-panel"), css_hex("dd-wood")
    if not (ink and panel and wood):
        refuse("love.css does not declare --dd-ink, --dd-panel and --dd-wood as hexes, and the stand is drawn in them.")
        return None
    inks = {k: css_hex(f"dd-f-{k}") for k in dd["ink_names"]}
    for k, v in inks.items():
        if not v:
            refuse(f"love.css does not declare --dd-f-{k} as a hex.")
    slots = [s["key"] for s in dd["slots"]] + [x["key"] for x in dd["extras"]]
    garments = {s["key"]: [g["key"] for g in s["garments"]] for s in dd["slots"]}
    for x in dd["extras"]:
        garments[x["key"]] = [x["key"]]
    names = {g["key"]: g["a"] for s in dd["slots"] for g in s["garments"]}
    names.update({x["key"]: x["a"] for x in dd["extras"]})
    slot_of = {g: s for s, gs in garments.items() for g in gs}
    body_only = []
    for s in fancy():
        slots.append(s["key"])
        body_only.append(s["key"])
        garments[s["key"]] = [g["key"] for g in s["garments"]]
        names.update({g["key"]: g["a"] for g in s["garments"]})
    cuts = {k: standalone(mod.CUTS[k](), slot_of[k], (ink, panel, wood)) for k in slot_of}
    prints = {}
    for k, (w, h, draw) in mod.PRINTS.items():
        prints[k] = [w, h, draw().replace("var(--dd-ink)", f"var(--dd-ink, {ink})")]
    groups = []
    for grp in d["groups"]:
        groups.append({"key": grp["key"], "name": grp["name"], "multi": bool(grp.get("multi")),
                       "options": grp["options"]})
    colours = {k: v for k, v in d["colours"].items() if not k.startswith("_")}
    stand_ground, booth_ground = css_hex("dd-wall"), css_hex("bmb-curtain")
    if not (stand_ground and booth_ground):
        refuse("love.css does not declare --dd-wall and --bmb-curtain as hexes, and an avatar's ground is one of them.")
    return {
        "ink": ink,
        "ground": {"stand": stand_ground, "bodymind": booth_ground},
        "slots": slots,
        "garments": garments,
        "bodyOnly": body_only,
        "names": names,
        "prints": prints,
        "printA": {p["key"]: p["a"] for p in dd["prints"]},
        "colourways": {c["key"]: {"name": c["name"], "inks": c["inks"]} for c in dd["colourways"]},
        "inks": inks,
        "inkNames": dd["ink_names"],
        "stand": {"wood": standalone(mod.WOOD, "wood", (ink, panel, wood)), "cuts": cuts, "paint": list(mod.PAINT)},
        "chimera": chimera_lists(),
        "body": {
            "groups": groups,
            "colours": colours,
            "standingOnly": {k: v for k, v in d["standing_only"].items() if not k.startswith("_")},
            "random": d["random"],
        },
    }


def keys_for_server(d, dd):
    """Only the keys: what the server needs to refuse an avatar with anything
    else in it. No drawing, no colour, no word."""
    garments = {s["key"]: [g["key"] for g in s["garments"]] for s in dd["slots"]}
    for x in dd["extras"]:
        garments[x["key"]] = [x["key"]]
    for s in fancy():
        garments[s["key"]] = [g["key"] for g in s["garments"]]
    return {
        "garments": garments,
        "bodyOnly": [s["key"] for s in fancy()],
        "prints": [p["key"] for p in dd["prints"]],
        "colourways": [c["key"] for c in dd["colourways"]],
        "body": {g["key"]: [o[0] for o in g["options"]] for g in d["groups"]},
        "multi": [g["key"] for g in d["groups"] if g.get("multi")],
        "standingOnly": {k: v for k, v in d["standing_only"].items() if not k.startswith("_")},
    }


def write_block(path, begin, end, block):
    src = path.read_text()
    if begin not in src or end not in src:
        raise SystemExit(f"REFUSING: {path.name} has no {begin} / {end} markers, so there is nowhere to write.\n"
                         "Put them back rather than letting this tool go quiet.")
    new = re.sub(re.escape(begin) + r".*?" + re.escape(end), lambda _m: begin + "\n" + block + "\n" + end, src, flags=re.S)
    if new != src:
        path.write_text(new)


def check(d, dd):
    seen_groups = set()
    garment_keys = {g["key"] for s in dd["slots"] for g in s["garments"]} | {x["key"] for x in dd["extras"]}
    garment_keys |= {g["key"] for s in fancy() for g in s["garments"]}
    parts = {k for k, _ in d["parts"]}
    for grp in d["groups"]:
        where = f"group {grp.get('key')!r}"
        if not grp.get("key") or not grp.get("name") or not grp.get("options"):
            refuse(f"{where} has no key, name or options.")
            continue
        if grp["key"] in seen_groups:
            refuse(f"{where} is in the data twice.")
        seen_groups.add(grp["key"])
        if grp.get("part") not in parts:
            refuse(f"{where} is in no part of the booth.")
        keys = [o[0] for o in grp["options"]]
        if len(set(keys)) != len(keys):
            refuse(f"{where} has two choices with one key.")
        for k, label in grp["options"]:
            if not label:
                refuse(f"{where}: {k!r} has no words. A choice that cannot be said cannot be heard.")
            sweep(label, f"{where} {k!r}")
            if grp.get("part") == "always" and k in garment_keys:
                refuse(f"{where}: {k!r} is also a garment on the Den's rails. What you always have with "
                       "you is chosen here, never sold next door. See _aids.")
        if grp["key"] == "skin":
            for k, label in grp["options"]:
                if k.startswith("t") and not re.match(r"Tone \d+\b", label):
                    refuse(f"skin {k!r} is named {label!r}; a tone is named by its number. See _skin.")
        sweep(grp["name"], where)
    for need in ("pose", "skin", "hair", "hairColour", "layer", "hands", "limbs"):
        if need not in seen_groups:
            refuse(f"there is no {need!r} group, and avatar.js draws from it.")
    colours = d.get("colours", {})
    for grp in d["groups"]:
        if grp["key"] in ("skin", "hairColour"):
            table = colours.get("skin" if grp["key"] == "skin" else "hair", {})
            for k, _ in grp["options"]:
                if not re.fullmatch(r"#[0-9A-Fa-f]{6}", str(table.get(k, ""))):
                    refuse(f"{grp['key']} {k!r} has no colour as a hex.")
    ink_names = dd["ink_names"]
    layer = next((g for g in d["groups"] if g["key"] == "layer"), None)
    if layer:
        for k, _ in layer["options"]:
            if k not in ink_names:
                refuse(f"underneath {k!r} is not one of the Den's fabric inks, so it would paint nothing.")
    pose = next((g for g in d["groups"] if g["key"] == "pose"), None)
    if pose and pose["options"][0][0] != "standing":
        pass  # The order is the booth's, not a ranking; nothing to check.
    for k, vals in d["standing_only"].items():
        if k.startswith("_"):
            continue
        grp = next((g for g in d["groups"] if g["key"] == k), None)
        if not grp:
            refuse(f"standing_only names {k!r}, which is no group.")
            continue
        for v in vals:
            if v not in [o[0] for o in grp["options"]]:
                refuse(f"standing_only names {k} {v!r}, which is no choice.")
    for k in d["random"]:
        if k not in seen_groups:
            refuse(f"random names {k!r}, which is no group.")
        grp = next((g for g in d["groups"] if g["key"] == k), {})
        if grp.get("part") == "always":
            refuse(f"random names {k!r}: nothing you always have with you is handed to you at random.")
    for k, v in d.items():
        if k.startswith("_"):
            continue
    q = d["quote"]
    if MIRROR.exists():
        entry = MIRROR / q["mirror"]
        text = entry.read_text() if entry.exists() else ""
        if q["words"] not in text and q["words"].replace("’", "'") not in text:
            refuse(f"Nick Walker's line is not word for word on {q['mirror']} in the mirror. Re-copy it from "
                   "our page; never loosen this.")
        if q["read_on"] not in text:
            refuse(f"{q['mirror']} in the mirror is not at {q['read_on']}.")


def check_scripts():
    for js in SCRIPTS:
        if not js.exists():
            refuse(f"{js.name} is missing.")
            continue
        src = re.sub(r"/\*.*?\*/", " ", js.read_text(), flags=re.S)
        src = re.sub(r"(?m)^\s*//.*$", " ", src)
        for pat, why in (
                (r"getUserMedia|getDisplayMedia|mediaDevices", "asks for a camera, a microphone or a screen"),
                (r"type\s*=\s*['\"]file['\"]|FileReader|\.files\b", "takes a file"),
                (r"getContext\s*\(|toDataURL|toBlob", "draws onto a canvas, which would make an avatar a picture"),
                (r"sessionStorage|indexedDB|document\.cookie", "stores something"),
                (r"localStorage\.setItem|localStorage\.removeItem|localStorage\[", "writes to storage"),
                (r"innerHTML|outerHTML|insertAdjacentHTML|document\.write", "writes markup from a string"),
                (r"sendBeacon|WebSocket|EventSource|XMLHttpRequest", "sends something some other way")):
            if re.search(pat, src):
                refuse(f"{js.name} {why}. See the docstring.")
        for m in re.finditer(r"localStorage\.getItem\(\s*['\"]([^'\"]+)['\"]", src):
            if m.group(1) != "love-cb":
                refuse(f"{js.name} reads {m.group(1)!r}; the only thing it may read is the CB's pass, love-cb.")
        for m in re.finditer(r"fetch\(\s*([^,)]+)", src):
            if "'/cb/avatars'" not in m.group(1) and '"/cb/avatars"' not in m.group(1) and "AVATARS" not in m.group(1):
                refuse(f"{js.name} fetches {m.group(1).strip()}; it may send only to /cb/avatars.")
        if re.search(r"\b(?:normal|default|average|standard|typical)\b\s*(?:body|bodymind)", src, re.I):
            refuse(f"{js.name} names a starting body. See _no_first_body.")
        if js.name == "strip.js" and re.search(r"['\"](?:POST|PUT|PATCH|DELETE)['\"]|JSON\.stringify|sendBeacon", src):
            refuse("strip.js sends a body; Your strip only reads what is already kept, and keeping is "
                   "booth.js's and try-on.js's, when somebody presses Keep.")
    for name, own in STRIP_PAGES.items():
        src = (ROOT / name).read_text()
        at = {k: src.find(f'src="{k}"') for k in ("avatar.js", "strip.js", own)}
        if min(at.values()) < 0 or not at["avatar.js"] < at["strip.js"] < at[own] \
                or 'id="your-strip"' not in src:
            refuse(f"{name} has no Your strip, or does not load strip.js after avatar.js and before its own "
                   "script, which calls it.")


def main():
    d = json.loads(DATA.read_text())
    dd = json.loads(DRESS.read_text())
    mod = dressup()
    check(d, dd)
    data = lists(d, dd, mod)
    if not ONLY_LISTS:
        check_scripts()
    if problems:
        print("REFUSING:\n  " + "\n  ".join(problems))
        sys.exit(1)
    write_block(AVATAR, "/* avatar:data:begin */", "/* avatar:data:end */",
                "  var DATA = " + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";")
    write_block(LIB, "/* avatar:keys:begin */", "/* avatar:keys:end */",
                "export const AVATAR = " + json.dumps(keys_for_server(d, dd), separators=(",", ":")) + ";")
    if ONLY_LISTS:
        print("bodymind booth: the lists written into avatar.js and lib.mjs")
        return
    build_page(d, dd)
    if problems:
        print("REFUSING (the page as written):\n  " + "\n  ".join(problems))
        sys.exit(1)
    print("bodymind booth: the booth, its choices and the avatar lists written")


# ── The booth, drawn ─────────────────────────────────────────────────────────
# A cabinet of cream enamel with steel edges, a lamp box on top, and an opening
# with the curtain half drawn back. Inside, the two strip lights behind their
# frosted panels, one either side, and an empty stool. On the side, a coin slot
# and the delivery slot, with a strip of four frames sticking out of it and
# nobody in any of them. It carries no word, it is aria-hidden, and nothing in
# it moves.

def booth_svg():
    frames = "".join(
        f'<rect class="bmb-art-cur" x="267" y="{238 + i * 25}" width="20" height="20" rx="1"/>' for i in range(4))
    pleats = "".join(f'<path class="bmb-art-pleat" d="M{x} 86 Q{x + 4} 210 {x - 2} 338"/>' for x in (70, 82, 94, 106))
    return (
        '<svg class="bmb-booth" viewBox="0 0 320 400" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">'
        '<ellipse class="bmb-art-floor" cx="160" cy="388" rx="150" ry="9"/>'
        '<rect class="bmb-art-cab" x="34" y="56" width="252" height="324" rx="10"/>'
        '<rect class="bmb-art-lamp" x="62" y="14" width="196" height="46" rx="8"/>'
        '<path class="bmb-art-line" d="M80 26 h22 v22 h-22 Z M110 26 h22 v22 h-22 Z M140 26 h22 v22 h-22 Z M170 26 h22 v22 h-22 Z"/>'
        '<path class="bmb-art-line" d="M206 30 h34 M206 37 h26 M206 44 h30"/>'
        # The opening: the back curtain, the two frosted lights, the stool.
        '<rect class="bmb-art-inside" x="52" y="78" width="168" height="270" rx="4"/>'
        '<rect class="bmb-art-back" x="64" y="84" width="144" height="258"/>'
        '<rect class="bmb-art-light" x="56" y="88" width="10" height="200" rx="5"/>'
        '<rect class="bmb-art-light" x="206" y="88" width="10" height="200" rx="5"/>'
        '<ellipse class="bmb-art-steel" cx="136" cy="270" rx="30" ry="9"/>'
        '<path class="bmb-art-steel" d="M132 278 h8 v50 h-8 Z"/>'
        '<ellipse class="bmb-art-steel" cx="136" cy="334" rx="24" ry="6"/>'
        # The curtain, drawn back to the left on its rail.
        '<path class="bmb-art-line" d="M50 80 H222"/>'
        '<path class="bmb-art-cur" d="M54 82 H118 Q112 210 122 342 H54 Z"/>'
        f'{pleats}'
        # The side: a coin slot, and a strip of four frames in the delivery slot.
        '<rect class="bmb-art-plate" x="236" y="104" width="38" height="58" rx="4"/>'
        '<path class="bmb-art-line" d="M250 118 h10 M255 132 v18"/>'
        '<rect class="bmb-art-plate" x="242" y="216" width="40" height="10" rx="3"/>'
        '<rect class="bmb-art-strip" x="262" y="222" width="30" height="124" rx="2"/>'
        f'{frames}'
        '<rect class="bmb-art-cab" x="54" y="378" width="22" height="10" rx="2"/>'
        '<rect class="bmb-art-cab" x="244" y="378" width="22" height="10" rx="2"/>'
        '</svg>')


def choices(d):
    """Every choice as a radio or a box, in the booth's order, in plates by
    part. Nothing ships checked: booth.js draws somebody at random, and with
    scripts off these are a list. See _no_first_body."""
    colours = d["colours"]
    standing = {k: v for k, v in d["standing_only"].items() if not k.startswith("_")}
    out = []
    for part, part_name in d["parts"]:
        groups = [g for g in d["groups"] if g.get("part") == part]
        if not groups:
            refuse(f"the {part!r} part of the booth has no choices in it.")
            continue
        out.append(f'        <fieldset class="bmb-plate" data-part="{part}">')
        out.append(f'          <legend class="bmb-plate__name">{esc(part_name)}</legend>')
        for g in groups:
            kind = "checkbox" if g.get("multi") else "radio"
            out.append(f'          <fieldset class="bmb-group" data-group="{g["key"]}"{" data-multi" if g.get("multi") else ""}>')
            out.append(f'            <legend class="bmb-group__name">{esc(g["name"])}</legend>')
            out.append('            <ul class="bmb-opts">')
            for k, label in g["options"]:
                iid = f'bmb-{g["key"]}-{k}'
                swatch = ""
                if g["key"] == "skin":
                    swatch = f'<span class="bmb-swatch" style="--sw:{colours["skin"][k]}" aria-hidden="true"></span>'
                elif g["key"] == "hairColour":
                    # Rainbow hair is stripes, not one colour, and its swatch is too.
                    sw = (f'linear-gradient({", ".join(colours["hair_rainbow"])})' if k == "rainbow"
                          else colours["hair"][k])
                    swatch = f'<span class="bmb-swatch" style="--sw:{sw}" aria-hidden="true"></span>'
                elif g["key"] == "layer":
                    swatch = f'<span class="bmb-swatch" style="--sw:var(--dd-f-{k})" aria-hidden="true"></span>'
                feet = ' data-standing' if k in standing.get(g["key"], []) else ""
                out.append(f'              <li><label class="bmb-opt" for="{iid}"><input type="{kind}" id="{iid}" '
                           f'name="bmb-{g["key"]}" value="{attr(k)}"{feet}>{swatch}'
                           f'<span class="bmb-opt__name">{esc(label)}</span></label></li>')
            out.append('            </ul>')
            if g["key"] in standing:
                out.append(f'            <p class="bmb-note" id="bmb-note-{g["key"]}">{esc(d["standing_only"]["_why"])}</p>')
            out.append('          </fieldset>')
        out.append('        </fieldset>')
    return "\n".join(out)


def quote(d):
    q = d["quote"]
    return (f'      <blockquote class="bmb-quote"><p>{esc(q["words"])}</p>'
            f'<p class="bmb-quote__who">&mdash; {esc(q["who"])}, in <cite>{esc(q["from"])}</cite>, '
            f'read on <a href="{attr(q["read_on"])}">our Bodymind entry</a></p></blockquote>')


def cap():
    return ('    <p><code>tools/make-bodymind.py</code> builds this booth out of one data file, writes the same '
            'choices into the file that draws every avatar and the one the CB checks them against, and refuses '
            'rather than guesses. It will not build a choice with no words, a skin tone named by a word rather '
            'than a number, a mobility aid or a hearing aid sold as clothing next door, a body the booth starts '
            'from, or a script that asks for a camera, takes a file, keeps a picture or sends anything anywhere '
            'but your own Profile when you press Keep. And it sweeps the booth&rsquo;s own words, so that nothing '
            'here judges a body, keeps a choice for one gender, calls an aid a tragedy, or rates anybody.</p>')


def liner(d):
    q = d["quote"]
    return ("      <li><strong>The Bodymind Booth</strong>: an idea from our community, written up as a proposal "
            "by Ryan, 2026-10-14. The line about bodyminds is " + esc(q["who"]) + "&rsquo;s, from <cite>" +
            esc(q["from"]) + "</cite>, read on our Bodymind entry. The drawing, and every garment from the "
            "Dress-Up Den worked out again to fit a body, are the house&rsquo;s. Oleo Script is soytutype "
            "fonts&rsquo;; Host Grotesk is Element Type&rsquo;s, Doğukan Karapınar&rsquo;s and İbrahim "
            "Kaçtıoğlu&rsquo;s.</li>")


def swap(page, marker, block):
    write_block(page, f"<!-- {marker}:begin -->", f"<!-- {marker}:end -->", block)


def sweep_page():
    src = PAGE.read_text()
    body = src[src.index("<main"):src.index("</main>")]
    body = re.sub(r"<blockquote.*?</blockquote>", " ", body, flags=re.S)
    body = re.sub(r"<!-- bmb:cap:begin -->.*?<!-- bmb:cap:end -->", " ", body, flags=re.S)
    body = re.sub(r"<!-- quest:.*?:end -->", " ", body, flags=re.S)
    body = re.sub(r"<!--.*?-->", " ", body, flags=re.S)
    sweep(body, PAGE.name)
    if re.search(r'<input[^>]*\bchecked\b', body):
        refuse(f"{PAGE.name} ships a choice checked. No body comes first: see _no_first_body.")
    ids = re.findall(r'\bid="([^"]+)"', src)
    dup = sorted({i for i in ids if ids.count(i) > 1})
    if dup:
        refuse(f"ids with two owners on the page: {', '.join(dup)}")
    if 'src="avatar.js"' not in src or 'src="booth.js"' not in src:
        refuse(f"{PAGE.name} does not load avatar.js and booth.js, so nothing would draw.")


def build_page(d, dd):
    swap(PAGE, "bmb:booth", booth_svg())
    swap(PAGE, "bmb:choices", choices(d))
    swap(PAGE, "bmb:quote", quote(d))
    swap(PAGE, "bmb:cap", cap())
    swap(NOTES, "bodymind-credits", liner(d))
    sweep_page()


if __name__ == "__main__":
    main()
