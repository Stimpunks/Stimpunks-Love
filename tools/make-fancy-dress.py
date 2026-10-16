#!/usr/bin/env python3
"""
Build Fantasy Fancy Dress, the shop through the curtain at the back of the
Dopamine Dress-Up Den, out of data/fancy-dress.json.

Helen Edgar's ask, 2026-10-15: faery wings in different sizes and colours,
jewellery, beads and rings, onesies, tiger, bear, dragon and unicorn dress-up
suits, and animal ears, tails and paws. Her answers: the pieces are worn by
your bodymind, and the sign reads Fantasy Fancy Dress.

EVERYTHING IN HERE NEEDS SOMEBODY TO WEAR IT, AND THAT IS WHY IT IS A ROOM OF
ITS OWN. The Den hangs its clothes on a valet stand because a paper doll is one
body handed to everybody, and a tail or a pair of ears on a stand is a stand
with a tail on it. So these pieces go on a bodymind drawn at the Bodymind
Booth, carried through in the address, and avatar.js and the CB's server both
refuse them on the stand (`bodyOnly`, written by make-bodymind.py). With
nobody brought through, the shop draws somebody at random, the booth's own
rule: no body is the one it starts from.

It refuses, and writes nothing, if any of these is true:

  - A PIECE THAT DOES NOT SAY HOW IT FEELS AND HOW IT GOES ON AND COMES OFF,
    the Den's rule, or that has no name, no words for the readout, or no
    first print and colourway out of the Den's own lists.
  - A PIECE avatar.js CANNOT DRAW. A pick that changes nothing reads as
    broken; tools/avatar.test.mjs draws every one in every pose, and this
    checks the drawing is there before the rail is.
  - THE DEN'S VOCABULARY, read out of make-dressup.py rather than copied: no
    body, size or measurement, no gendered rail, no fashion rule, no claim
    about brain chemistry, no othering word and no score, in the data and on
    the published page. COSTUME IS ONE OF THOSE WORDS: in our voice this is a
    dress-up suit, an outfit or fancy dress.
  - A SCRIPT THAT KEEPS OR SENDS ANYTHING. fancy-dress.js draws, and the only
    thing that leaves this room is the address of the Den with the look in its
    fragment, which never reaches a server. Keeping happens next door, when
    somebody presses Keep. It also refuses a camera, a file, a canvas and
    innerHTML in that script.
  - THE DEN WITH NO DOOR TO THIS ROOM, or a door that does not say the
    bodymind goes through with you.

Run it after make-bodymind.py, which writes these pieces into the lists
avatar.js draws from.
"""
import importlib.util
import json
import random
import re
import sys
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data/fancy-dress.json"
DRESS = ROOT / "data/dressup.json"
PAGE = ROOT / "fantasy-fancy-dress.html"
DEN = ROOT / "dopamine-dress-up-den.html"
AVATAR = ROOT / "avatar.js"
JS = ROOT / "fancy-dress.js"
CSS = ROOT / "love.css"

problems = []


def refuse(msg):
    problems.append(msg)


def esc(s):
    return escape(s, quote=False)


def attr(s):
    return escape(s, quote=True)


def dressup():
    spec = importlib.util.spec_from_file_location("make_dressup", ROOT / "tools/make-dressup.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def plain(text):
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", text))


def sweep(text, where, mod):
    for pat, why in mod.VOCAB:
        for m in re.finditer(rf"\b(?:{pat})\b", text, re.I):
            # The window is anchored: the negation has to be in the same clause
            # as the word it excuses (A Quiet Pint's lesson).
            window = text[max(0, m.start() - 90):m.end()]
            if re.search(rf"\b{mod.NEGATION}\b[^.;:]{{0,80}}?\b(?:{pat})\b\W*$", window, re.I):
                continue
            refuse(f"{where}: {m.group(0)!r} -- {why}")
    if mod.OTHER_DEN.search(text):
        refuse(f"{where}: 'the Den' on its own is Graceland's, a room of its own; say the Dress-Up Den.")


def check(d, dd, mod):
    prints = {p["key"] for p in dd["prints"]}
    colourways = {c["key"] for c in dd["colourways"]}
    den_keys = {g["key"] for s in dd["slots"] for g in s["garments"]} | {x["key"] for x in dd["extras"]}
    den_slots = {s["key"] for s in dd["slots"]} | {x["key"] for x in dd["extras"]}
    avatar = AVATAR.read_text()
    seen = set()
    if d.get("sign") != "Fantasy Fancy Dress":
        refuse("the sign is Helen's words, Fantasy Fancy Dress; it is not this tool's to change.")
    for s in d["slots"]:
        if s["key"] in den_slots:
            refuse(f"slot {s['key']!r} is one of the Den's own; a piece here goes on a bodymind only.")
        if not s.get("name") or not s.get("garments"):
            refuse(f"slot {s['key']!r} has no name or nothing on its rail.")
        for g in s["garments"]:
            where = f"{s['key']}/{g.get('key')}"
            for k in ("key", "name", "a", "feel", "on", "start"):
                if not g.get(k):
                    refuse(f"{where} has no {k!r}. Every piece says what it is, how it feels and how it goes on and comes off.")
            if g["key"] in seen or g["key"] in den_keys:
                refuse(f"{where}: a key used twice is a pick that puts on the wrong thing.")
            seen.add(g["key"])
            st = g.get("start") or []
            if len(st) != 2 or st[0] not in prints or st[1] not in colourways:
                refuse(f"{where}: start {st!r} is not a print and a colourway out of the Den's lists.")
            if not re.search(rf"'{re.escape(g['key'])}': function", avatar):
                refuse(f"{where}: avatar.js has no drawing for it, so picking it would change nothing.")
            for k in ("name", "a", "feel", "on"):
                sweep(g.get(k, ""), f"{where} {k}", mod)
    if f"bodyOnly" not in avatar:
        refuse("avatar.js does not know which slots are body-only; run make-bodymind.py first.")


def check_js():
    if not JS.exists():
        refuse("fancy-dress.js is missing.")
        return
    src = re.sub(r"/\*.*?\*/", "", JS.read_text(), flags=re.S)
    for pat, why in (
        (r"\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource", "sends something"),
        (r"localStorage|sessionStorage|indexedDB|document\.cookie", "keeps something"),
        (r"getUserMedia|getDisplayMedia|type\s*=\s*['\"]file|getContext", "asks for a camera, a file or a canvas"),
        (r"innerHTML|outerHTML|insertAdjacentHTML|document\.write", "writes markup from a string"),
    ):
        if re.search(pat, src):
            refuse(f"fancy-dress.js {why}. This room draws and keeps nothing; keeping is the Dress-Up Den's, when somebody presses Keep.")


def check_den():
    src = DEN.read_text()
    m = re.search(r'<a id="dd-fancy-door" href="fantasy-fancy-dress\.html">', src)
    if not m:
        refuse("the Dress-Up Den has no door to Fantasy Fancy Dress (dd-fancy-door), and a room behind a room needs its door.")
    if "your bodymind goes through with you" not in src:
        refuse("the Dress-Up Den's door does not say your bodymind goes through with you, which is what the room does.")


def select(iid, part, label, options, chosen):
    opts = "".join(f'<option value="{attr(k)}"{" selected" if k == chosen else ""}>{esc(v)}</option>' for k, v in options)
    return (f'<span class="ffd-pick__one"><label class="ffd-pick__lab" for="{iid}">{label}</label> '
            f'<select class="ffd-pick__sel" id="{iid}" data-part="{part}">{opts}</select></span>')


def rails(d, dd):
    prints = [(p["key"], p["key"] == "solid" and "Plain" or p["a"][0].upper() + p["a"][1:]) for p in dd["prints"]]
    prints = [(k, "Plain" if k == "solid" else v.replace("In ", "", 1).capitalize()) for k, v in prints]
    cways = [(c["key"], c["name"][0].upper() + c["name"][1:]) for c in dd["colourways"]]
    out = []
    for s in d["slots"]:
        k = s["key"]
        first = s["garments"][0]["start"]
        out.append(f'      <fieldset class="ffd-rail" id="ffd-rail-{k}" data-slot="{k}">')
        out.append(f'        <legend class="ffd-rail__name">{esc(s["name"])}</legend>')
        out.append('        <ul class="ffd-hangers">')
        out.append(f'          <li><label class="ffd-hanger" for="ffd-{k}-none"><input type="radio" id="ffd-{k}-none" name="ffd-{k}" value="" checked>'
                   f'<span class="ffd-hanger__words"><span class="ffd-hanger__name">None</span>'
                   f'<span class="ffd-hanger__feel">Nothing from this rail.</span></span></label></li>')
        for g in s["garments"]:
            iid = f'ffd-{k}-{g["key"]}'
            out.append(f'          <li><label class="ffd-hanger" for="{iid}"><input type="radio" id="{iid}" name="ffd-{k}" value="{g["key"]}" '
                       f'data-start="{g["start"][0]} {g["start"][1]}">'
                       f'<span class="ffd-hanger__words"><span class="ffd-hanger__name">{esc(g["name"])}</span>'
                       f'<span class="ffd-hanger__feel">{esc(g["feel"])}</span><span class="ffd-hanger__on">{esc(g["on"])}</span></span></label></li>')
        out.append('        </ul>')
        out.append(f'        <p class="ffd-pick">{select(f"ffd-{k}-print", "print", "Print", prints, first[0])} '
                   f'{select(f"ffd-{k}-colours", "colours", "Colours", cways, first[1])}</p>')
        out.append('      </fieldset>')
    return "\n".join(out)


# ── The back of the shop, drawn ─────────────────────────────────────────────
# Lengths of sheer stuff hang from the ceiling in rose, mint, gold and lilac,
# overlapping, with the light at the far end coming through them; in front,
# a rail of stock on hangers, dark because the light is behind it: a pair of
# wings, a suit with ears on its hood, a tail, a strand of beads. Every word in
# the room is set on the dark in front; nothing here carries one. aria-hidden,
# and nothing in it moves.
VEILS = ("--ffd-rose", "--ffd-mint", "--ffd-gold", "--ffd-lilac")


def veils_svg():
    rnd = random.Random(1015)
    W, H = 1000, 250
    out = [f'<svg class="ffd-veils" viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">',
           '<defs><radialGradient id="ffd-glow" cx="50%" cy="38%" r="60%">'
           '<stop offset="0" stop-color="var(--ffd-glow)" stop-opacity=".95"/>'
           '<stop offset=".55" stop-color="var(--ffd-glow)" stop-opacity=".18"/>'
           '<stop offset="1" stop-color="var(--ffd-glow)" stop-opacity="0"/></radialGradient></defs>',
           f'<rect width="{W}" height="{H}" fill="var(--ffd-ground)"/>',
           f'<rect width="{W}" height="{H}" fill="url(#ffd-glow)"/>']
    x = -40
    i = 0
    while x < W:
        w = rnd.randint(150, 230)
        hem = rnd.randint(150, 235)
        sway = rnd.randint(-26, 26)
        c = VEILS[i % len(VEILS)]
        d = (f"M{x} 0 L{x + w} 0 C{x + w + sway} {hem * .4:.0f} {x + w - sway} {hem * .7:.0f} {x + w + sway * .6:.0f} {hem} "
             f"Q{x + w * .75:.0f} {hem - 16} {x + w * .5:.0f} {hem + 6} Q{x + w * .25:.0f} {hem - 14} {x - sway * .6:.0f} {hem - 4} "
             f"C{x - sway} {hem * .7:.0f} {x + sway} {hem * .4:.0f} {x} 0 Z")
        out.append(f'<path d="{d}" fill="var({c})" fill-opacity=".34"/>')
        for k in range(1, 4):
            fx = x + w * k / 4
            out.append(f'<path d="M{fx:.0f} 0 C{fx + sway * .5:.0f} {hem * .5:.0f} {fx - sway * .5:.0f} {hem * .8:.0f} {fx + sway * .3:.0f} {hem - 6}" '
                       f'fill="none" stroke="var({c})" stroke-opacity=".4" stroke-width="1.5"/>')
        x += int(w * .62)
        i += 1
    # The rail of stock, dark against the light.
    out.append(f'<path d="M30 132 H970" stroke="var(--ffd-hush)" stroke-width="5" stroke-linecap="round"/>')
    hush = 'fill="var(--ffd-hush)"'
    rim = lambda c: f'stroke="var({c})" stroke-opacity=".7" stroke-width="1.6"'
    def hanger(cx):
        return f'<path d="M{cx} 132 v-8 q0 -7 6 -7 M{cx - 22} 150 L{cx} 138 L{cx + 22} 150" fill="none" stroke="var(--ffd-hush)" stroke-width="3" stroke-linecap="round"/>'
    # A pair of butterfly wings.
    cx = 170
    out.append(hanger(cx))
    out.append(f'<path d="M{cx} 150 C{cx - 70} 96 {cx - 92} 150 {cx - 60} 182 Q{cx - 30} 196 {cx} 162 Z" {hush} {rim("--ffd-rose")}/>')
    out.append(f'<path d="M{cx} 150 C{cx + 70} 96 {cx + 92} 150 {cx + 60} 182 Q{cx + 30} 196 {cx} 162 Z" {hush} {rim("--ffd-rose")}/>')
    out.append(f'<path d="M{cx} 160 C{cx - 50} 196 {cx - 40} 226 {cx - 12} 218 Z M{cx} 160 C{cx + 50} 196 {cx + 40} 226 {cx + 12} 218 Z" {hush} {rim("--ffd-rose")}/>')
    # A suit with ears on its hood.
    cx = 410
    out.append(hanger(cx))
    out.append(f'<circle cx="{cx - 14}" cy="140" r="8" {hush} {rim("--ffd-gold")}/><circle cx="{cx + 14}" cy="140" r="8" {hush} {rim("--ffd-gold")}/>')
    out.append(f'<path d="M{cx - 30} 150 Q{cx} 128 {cx + 30} 150 L{cx + 44} 166 L{cx + 52} 214 L{cx + 38} 216 L{cx + 32} 182 L{cx + 26} 250 '
               f'L{cx + 4} 250 L{cx} 214 L{cx - 4} 250 L{cx - 26} 250 L{cx - 32} 182 L{cx - 38} 216 L{cx - 52} 214 L{cx - 44} 166 Z" {hush} {rim("--ffd-gold")}/>')
    # A tail, curling.
    cx = 600
    out.append(hanger(cx))
    out.append(f'<path d="M{cx} 150 C{cx + 6} 190 {cx - 30} 210 {cx - 10} 236 C{cx + 6} 250 {cx + 30} 236 {cx + 24} 220" fill="none" '
               f'stroke="var(--ffd-hush)" stroke-width="12" stroke-linecap="round"/>')
    out.append(f'<path d="M{cx} 150 C{cx + 6} 190 {cx - 30} 210 {cx - 10} 236 C{cx + 6} 250 {cx + 30} 236 {cx + 24} 220" fill="none" '
               f'stroke="var(--ffd-mint)" stroke-opacity=".55" stroke-width="1.5"/>')
    # A strand of beads, and great wings at the end of the rail.
    cx = 760
    out.append(f'<path d="M{cx} 132 Q{cx + 30} 196 {cx + 60} 132" fill="none" stroke="var(--ffd-hush)" stroke-width="2"/>')
    for t in range(1, 10):
        tt = t / 10
        bx = cx + 60 * tt
        by = 132 + 2 * 64 * tt * (1 - tt)
        out.append(f'<circle cx="{bx:.1f}" cy="{by:.1f}" r="4.5" {hush} {rim("--ffd-lilac")}/>')
    cx = 900
    out.append(hanger(cx))
    out.append(f'<path d="M{cx} 152 C{cx - 30} 120 {cx - 90} 60 {cx - 70} 34 C{cx - 40} 40 {cx - 20} 100 {cx} 160 Z M{cx} 152 C{cx + 30} 120 {cx + 90} 60 {cx + 70} 34 C{cx + 40} 40 {cx + 20} 100 {cx} 160 Z" {hush} {rim("--ffd-mint")}/>')
    out.append(f'<path d="M{cx} 160 C{cx - 40} 180 {cx - 80} 220 {cx - 54} 246 C{cx - 30} 236 {cx - 14} 200 {cx} 170 Z M{cx} 160 C{cx + 40} 180 {cx + 80} 220 {cx + 54} 246 C{cx + 30} 236 {cx + 14} 200 {cx} 170 Z" {hush} {rim("--ffd-mint")}/>')
    out.append('</svg>')
    return "".join(out)


def swap(page, marker, block):
    begin, end = f"<!-- {marker}:begin -->", f"<!-- {marker}:end -->"
    if begin not in page or end not in page:
        refuse(f"fantasy-fancy-dress.html has no {marker} markers, so there is nowhere to write it.")
        return page
    return re.sub(re.escape(begin) + r".*?" + re.escape(end), lambda _m: begin + "\n" + block + "\n" + end, page, flags=re.S)


def check_css():
    css = CSS.read_text()
    for v in ("ground", "panel", "ink", "ink-2", "link", "glow", "rose", "mint", "gold", "lilac", "hush", "edge"):
        if not re.search(rf"--ffd-{v}:\s*#[0-9A-Fa-f]{{6}}\b", css):
            refuse(f"love.css does not declare --ffd-{v} as a hex.")


def main():
    mod = dressup()
    d = json.loads(DATA.read_text())
    dd = json.loads(DRESS.read_text())
    check(d, dd, mod)
    check_js()
    check_den()
    check_css()
    if problems:
        print("REFUSING:\n  " + "\n  ".join(problems))
        sys.exit(1)
    page = PAGE.read_text()
    new = swap(page, "ffd:rails", rails(d, dd))
    new = swap(new, "ffd:veils", "  " + veils_svg())
    # The published page, our voice: the rails and the backdrop are swept
    # above; what is left is the room's own sentences.
    body = re.search(r"<main.*?</main>", new, re.S)
    text = plain(re.sub(r"<!-- quest:.*?:end -->", "", body.group(0), flags=re.S)) if body else ""
    sweep(text, "fantasy-fancy-dress.html", mod)
    if problems:
        print("REFUSING:\n  " + "\n  ".join(problems))
        sys.exit(1)
    if new != page:
        PAGE.write_text(new)
    print("fantasy fancy dress: the rails and the back of the shop written")


if __name__ == "__main__":
    main()
