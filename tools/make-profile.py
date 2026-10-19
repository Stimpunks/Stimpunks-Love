#!/usr/bin/env python3
"""Write the lists a CB profile chooses from into netlify/cb/lib.mjs, and refuse
anything on them the radio could not draw.

Ryan, 2026-10-17, after requests for profiles more like Discord's: a theme and
a banner, a decoration round the avatar you wear, your name in a face of your
choosing, a nameplate on Who's online, your pronouns, a bio, links elsewhere and
a favourite room; and 2026-10-18, a frame round a profile and an effect over
it, after Discord's. profile.js draws them; the server keeps them, and checks every
choice against PROFILE_KEYS, which this writes between the profile:keys markers
out of the files that draw them:

  · the themes are call.js's SCHEMES, less Match my device, which is a rule and
    not a theme;
  · the banners and nameplates are cb-themes.js's drawings, each drawn on its
    own theme's case;
  · the decorations, the frames, the effects and the faces are profile.js's.

So a theme added to the radio is a theme for a profile on the next run, and a
choice the radio cannot draw is never one the server keeps.

WHAT IT REFUSES, and why each one is here:

  · A THEME WHOSE SEVEN COLOURS love.css DOES NOT DECLARE, and Amber's names
    gone. profile.js lays a theme on a card as --cb-<theme>-<part>, and a var()
    that names nothing paints nothing, without a word (the dead var() Covenstead's
    repaint left behind). Amber's seven are --cb-amber-<part>, which name the
    radio's own as :root has them, because on the radio's host the bare names
    are the viewer's own theme.
  · A DRAWING THAT IS NOT A THEME, a decoration, frame or effect with no
    drawing, two of any of them or two faces with one name, and a face love.css
    does not declare: a browser answers a face it has not got with another and
    says nothing.
  · AN INK THAT IS NOT THE CARD'S THEME. Every frame, decoration and effect is
    drawn in the seven --cb-* inks of the card's theme, so none brings a colour
    nobody measured, and no colour in profile.js is a literal. THE ONE
    EXCEPTION IS THE BLACK LEATHER LAGOON (Ryan, 2026-10-18, after the street's
    room and The Cramps): its drawing is in that room's own declared --lag-*
    inks, between the effect:lagoon markers and nowhere else, and each one must
    be declared in love.css. Its credit must name The Cramps, Lux Interior and
    Poison Ivy and say nobody real is drawn, because that is the condition it
    was built on: their world, not them.
  · OTTERS IN THE KELP (Ryan, 2026-10-18) is the second effect not in its
    card's theme: it is drawn in the Kelp Forest theme's declared --cb-kelp-*
    inks between the effect:otters markers, because an otter needs a brown no
    card's seven can be relied on for. It keeps the Arcade's otter rules
    (otterly.js): floating fills nothing, so no word in it, its credit or its
    theme's line says rest restores or earns anything; no otter is ranked; no
    otters hold paws; no favourite stone in a pouch. Its credit names Helen
    Edgar's Stimpunks Solidarity and Otters and Star Stuff's The Stone You Keep,
    as the cabinet does.
  · AN EFFECT'S PASS SHOWN WHERE THE DRAWINGS DO NOT MOVE. Ryan's call,
    2026-10-18: the pass crosses a profile's words, which is the one drawing on
    the radio that does. It is drawn only under :host([data-motion="on"]), at
    MAX GLITTER or after Let my theme move, so a profile standing still never
    has a butterfly sitting on somebody's bio. cb.css's .pf-fx__pass is
    display: none, and only that one rule may show it. THE LAGOON'S BIG
    MOMENT is held the same way (Ryan, 2026-10-18: the serpent rears up across
    the whole profile when it opens, then once a minute), and nothing an
    effect does may move outside data-motion.
  · A DATE OR A COUNT IN profile.js, or a time kept in the profile's part of
    lib.mjs. Ryan's call: no profile says when anybody claimed or joined, because
    a date beside a name invites ranking who has been here longest.
  · profile.js FETCHING, STORING OR WRITING MARKUP FROM A STRING. It draws what
    cb.js hands it and nothing else; everything typed reaches it as text.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CALL = ROOT / "call.js"
ART = ROOT / "cb-themes.js"
PROFILE = ROOT / "profile.js"
CSS = ROOT / "love.css"
LIB = ROOT / "netlify" / "cb" / "lib.mjs"
PARTS = ["case", "bar", "steel", "steel-2", "lcd", "amber", "amber-2"]

problems = []


def refuse(msg):
    problems.append(msg)


def between(src, begin, end, where):
    if begin not in src or end not in src:
        raise SystemExit(f"REFUSING: {where} has no {begin} / {end} markers. Put them back rather than letting this tool go quiet.")
    return src[src.index(begin) + len(begin):src.index(end)]


def write_block(path, begin, end, block):
    src = path.read_text()
    if begin not in src or end not in src:
        raise SystemExit(f"REFUSING: {path.name} has no {begin} / {end} markers, so there is nowhere to write.")
    new = re.sub(re.escape(begin) + r".*?" + re.escape(end), lambda _m: begin + "\n" + block + "\n" + end, src, flags=re.S)
    if new != src:
        path.write_text(new)


def themes():
    src = CALL.read_text()
    body = src[src.index("var SCHEMES = ["):src.index("];", src.index("var SCHEMES = ["))]
    keys = re.findall(r"\['([a-z0-9]+)', '", body)
    if len(keys) != len(set(keys)):
        refuse("call.js's SCHEMES has a key twice.")
    return [k for k in keys if k != "auto"]


def drawings():
    return re.findall(r"^\s*T\.([a-z0-9]+) = ", ART.read_text(), flags=re.M)


def main():
    keys = themes()
    if "amber" not in keys:
        refuse("Amber is not among call.js's SCHEMES, and a profile with no theme chosen wears it.")
    art = drawings()
    css = CSS.read_text()
    root = css[css.index(":root {"):css.index("\n}", css.index(":root {"))]
    declared = set(re.findall(r"(--[a-z0-9-]+)\s*:", root))
    for k in keys:
        for p in PARTS:
            name = f"--cb-{k}-{p}"
            if name not in declared:
                refuse(f"theme {k!r} has no {name} in love.css's :root, so a card wearing it would paint nothing there.")
    for p in PARTS:
        if not re.search(rf"--cb-amber-{re.escape(p)}\s*:\s*var\(--cb-{re.escape(p)}\)", root):
            refuse(f"--cb-amber-{p} in love.css's :root must be var(--cb-{p}): it is how a card wears Amber on a radio that wears something else.")
    banners = [k for k in art if k in keys]
    for k in art:
        if k not in keys:
            refuse(f"cb-themes.js draws {k!r}, which is not a theme in call.js.")

    src = PROFILE.read_text()
    faces_src = between(src, "/* profile:faces:begin */", "/* profile:faces:end */", "profile.js")
    decos_src = between(src, "/* profile:decorations:begin */", "/* profile:decorations:end */", "profile.js")
    frames_src = between(src, "/* profile:frames:begin */", "/* profile:frames:end */", "profile.js")
    effects_src = between(src, "/* profile:effects:begin */", "/* profile:effects:end */", "profile.js")
    faces = re.findall(r"\['([^']+)', [0-9.]+, [0-9.]+, '(?:none|uppercase|lowercase)', [0-9]{3}\]", faces_src)
    if len(faces) != len(re.findall(r"\[", faces_src)) - 1:
        refuse("profile.js's FACES has an entry this tool cannot read: each is ['Face', scale, tracking, 'case', weight].")
    if len(faces) != len(set(faces)):
        refuse("profile.js's FACES names a face twice.")
    families = set(re.findall(r"@font-face\s*\{\s*font-family:\s*'([^']+)'", css))
    for fc in faces:
        if fc not in families:
            refuse(f"profile.js offers the face {fc!r}, which love.css declares no @font-face for.")
    decos = re.findall(r"\['([a-z]+)', '([^']+)'\]", decos_src)
    keys_d = [k for k, _ in decos]
    names_d = [n for _, n in decos]
    if len(keys_d) != len(set(keys_d)) or len(names_d) != len(set(names_d)):
        refuse("profile.js's DECORATIONS has a key or a name twice.")
    for k in keys_d:
        if not re.search(rf"^\s*D\.{k} = function", src, flags=re.M):
            refuse(f"the decoration {k!r} has no drawing (D.{k}) in profile.js.")
    for k in re.findall(r"^\s*D\.([a-z]+) = function", src, flags=re.M):
        if k not in keys_d:
            refuse(f"profile.js draws a decoration {k!r} that DECORATIONS does not offer.")
    listed = {}
    for what, block, letter in (("FRAMES", frames_src, "F"), ("EFFECTS", effects_src, "E")):
        pairs = re.findall(r"\['([a-z]+)', '([^']+)'\]", block)
        ks = [k for k, _ in pairs]
        ns = [n for _, n in pairs]
        if not ks or len(ks) != len(re.findall(r"\[", block)) - 1:
            refuse(f"profile.js's {what} is empty or has an entry this tool cannot read: each is ['key', 'Name'].")
        if len(ks) != len(set(ks)) or len(ns) != len(set(ns)):
            refuse(f"profile.js's {what} has a key or a name twice.")
        drawn = re.findall(rf"^\s*{letter}\.([a-z]+) = \{{", src, flags=re.M)
        for k in ks:
            if k not in drawn:
                refuse(f"{what[:-1].lower()} {k!r} has no drawing ({letter}.{k}) in profile.js.")
        for k in drawn:
            if k not in ks:
                refuse(f"profile.js draws {letter}.{k}, which {what} does not offer.")
        listed[what] = ks
    # EACH EFFECT DRAWN IN SOMETHING OTHER THAN ITS CARD'S THEME is a block
    # between its own effect:<key> markers, held to one source of inks: the
    # Lagoon to that room's --lag-*, the otters to the Kelp Forest theme's
    # --cb-kelp-*. Everything outside those blocks is in the card's seven.
    EFFECT_INKS = {
        "lagoon": ("--lag-", "the Black Leather Lagoon", "that room's"),
        "otters": ("--cb-kelp-", "Otters in the kelp", "the Kelp Forest theme's"),
    }
    blocks = {k: between(src, f"/* effect:{k}:begin */", f"/* effect:{k}:end */", "profile.js") for k in EFFECT_INKS}
    rest_src = src
    for b in blocks.values():
        rest_src = rest_src.replace(b, "")
    def uncomment(s):
        return re.sub(r"(?m)^\s*//.*$", "", re.sub(r"/\*.*?\*/", "", s, flags=re.S))
    ink = r"(?:fill|stroke|stop)\s*:\s*(?:[^,}]*\?\s*)?'(--[a-z0-9-]+)'(?:\s*:\s*'(--[a-z0-9-]+)')?"
    def inks(code):
        found = {n for m in re.finditer(ink, code) for n in m.groups() if n}
        return found | set(re.findall(r"var\(\s*(--[a-z0-9-]+)\s*\)", code))
    theirs = {f"--cb-{x}" for x in PARTS}
    for name in sorted(inks(uncomment(rest_src))):
        if name not in theirs:
            refuse(f"profile.js draws in {name} outside an effect's own block: a card's drawings are in its theme's seven --cb-* inks.")
    for key, (prefix, title, whose) in EFFECT_INKS.items():
        code = uncomment(blocks[key])
        used = inks(code)
        if not used:
            refuse(f"{title} draws in no ink this tool can read.")
        for name in sorted(used):
            if not name.startswith(prefix) or name not in declared:
                refuse(f"{title} draws in {name}, which is not one of {whose} {prefix} inks declared in love.css.")
        if f"E.{key} = {{" not in blocks[key]:
            refuse(f"the effect:{key} markers do not hold E.{key}.")
    if re.search(r"#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(", uncomment(src)):
        refuse("profile.js has a literal colour. Every colour on a card is a declared ink, named.")
    cred = re.search(r"var EFFECT_CREDITS = \{(.*?)\n  \};", src, re.S)
    def credit(key):
        m = re.search(key + r":\s*'([^']*)'", cred.group(1)) if cred else None
        return m.group(1) if m else ""
    NEEDS = {
        "lagoon": ("The Cramps", "Lux Interior", "Poison Ivy", "nobody real is drawn"),
        "otters": ("Helen Edgar", "Stimpunks Solidarity and Otters", "The Stone You Keep", "fills nothing"),
    }
    for key, needs in NEEDS.items():
        if key in listed.get("EFFECTS", []):
            for need in needs:
                if need not in credit(key):
                    refuse(f"{EFFECT_INKS[key][1]}'s credit does not say {need!r}, and the credit says whose.")
    # THE OTTERS KEEP THE ARCADE'S OTTER RULES (otterly.js): floating fills
    # nothing, so no word says rest is for anything or earns anything; no otter
    # is ranked; no otters hold paws; and no favourite stone in a pouch. Read in
    # the effect's code, its credit, and the Kelp Forest theme's line.
    kelp_line = re.search(r"\['kelp', 'Kelp Forest', 'world', '([^']*)'", CALL.read_text())
    said = uncomment(blocks["otters"]) + " " + credit("otters") + " " + (kelp_line.group(1) if kelp_line else "")
    m = re.search(r"recharg|restor|stamina|\benergy\b|\bmeters?\b|\breward|\bearn|productiv|rest so|so (?:it|they|you) can"
                  r"|pouch|favou?rite (?:stone|rock)|hold(?:s|ing)? (?:paws|hands)|cutest|best otter|\branked?\b", said, re.I)
    if m:
        refuse(f"the otters say {m.group(0)!r}. Floating fills nothing, no otter is ranked, and none holds paws or keeps "
               "a stone in a pouch: the Arcade's otter cabinet and the zine it is built on refuse each of those.")
    if not kelp_line:
        refuse("call.js has no Kelp Forest theme, which the otter effect is drawn in.")
    cbcss = re.sub(r"/\*.*?\*/", "", (ROOT / "cb.css").read_text(), flags=re.S)
    # The pass and the Lagoon's big moment cross words, so each is display: none
    # and only its data-motion rule shows it; and nothing an effect does moves
    # outside data-motion.
    for part, what in ((".pf-fx__pass", "an effect's pass"), (".pf-fx__moment", "the Lagoon's big moment")):
        rules = re.findall(r"([^{}]*" + re.escape(part) + r"(?![\w-])[^{}]*)\{([^}]*)\}", cbcss)
        shown = [sel.strip() for sel, body in rules
                 if any(v != "none" for v in re.findall(r"display\s*:\s*([a-z-]+)", body))]
        base = [body for sel, body in rules if sel.strip() == part]
        if not base or not re.search(r"display\s*:\s*none", base[0]):
            refuse(f"cb.css's {part} is not display: none. {what[0].upper() + what[1:]} crosses words, so it is drawn only where the radio's drawings move.")
        if shown != [f':host([data-motion="on"]) {part}']:
            refuse(f"cb.css shows {what} at {shown or 'no selector'}; the only rule that shows it is "
                   f':host([data-motion="on"]) {part}, so a profile standing still has nothing on its words.')
    for sel, body in re.findall(r"([^{}]*)\{([^{}]*)\}", cbcss):
        moves = re.search(r"animation(?:-name)?\s*:[^;]*\bcb-(?:fx|mo)-", body) or (
            "animation" in body and re.search(r"\.(?:pf-fx__|fx-)", sel))
        if moves and 'data-motion="on"' not in sel:
            refuse(f"cb.css moves an effect at {sel.strip()!r}, outside data-motion.")
    for key, fn in (("lagoon", "lagoonMoment()"), ("otters", "otterMoment()")):
        if f"appendChild({fn})" not in uncomment(blocks[key]) or "pf-fx__moment" not in blocks[key]:
            refuse(f"{EFFECT_INKS[key][1]} has lost its opening across the profile, which Ryan asked for.")

    code = re.sub(r"/\*.*?\*/", "", src, flags=re.S)
    code = re.sub(r"(?m)^\s*//.*$", "", code)
    for pat, why in [
        (r"\bsince\b|\bmember\b|new Date|Date\.now", "a date: no profile says when anybody claimed or joined"),
        (r"innerHTML|outerHTML|insertAdjacentHTML|DOMParser", "markup written from a string"),
        (r"localStorage|sessionStorage|indexedDB|document\.cookie", "storage: profile.js keeps nothing"),
        (r"\bfetch\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource", "a request: profile.js sends nothing"),
        (r"\.length\s*\+\s*' |\bcount\b|\btotal\b", "a count"),
    ]:
        m = re.search(pat, code)
        if m:
            refuse(f"profile.js has {m.group(0)!r}, {why}.")

    lib = LIB.read_text()
    # The profile's part runs to Props, which tools/check-props.py holds.
    part = lib[lib.index("/* ── Profiles"):lib.index("/* ── Props")]
    part_code = re.sub(r"/\*.*?\*/", "", part, flags=re.S)
    if re.search(r"Date\.now|\bnow\b|\bsince\b|\bt:\s", part_code):
        refuse("the profile's part of lib.mjs keeps a time: a profile holds the choices and the words and nothing about when.")

    if problems:
        print("REFUSING:\n  " + "\n  ".join(problems))
        sys.exit(1)
    data = {"themes": keys, "banners": banners, "decorations": keys_d, "frames": listed.get("FRAMES", []),
            "effects": listed.get("EFFECTS", []), "faces": faces}
    write_block(LIB, "/* profile:keys:begin */", "/* profile:keys:end */",
                "export const PROFILE_KEYS = " + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";")
    print("profiles: the themes, drawings, decorations, frames, effects and faces written into lib.mjs")


if __name__ == "__main__":
    main()
