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
  · FLYING FAIRY (Ryan, 2026-10-19) is the third: it is drawn in the Fairy
    Lights theme's declared --cb-fairy-* inks between the effect:fairy markers,
    because its faeries are the Faery Yurt's own, in that room's colours, five
    skins and seven hairs among them, which no card's seven could hold. Its
    credit names Helen Edgar and her Faery Yurt, whose faeries they are. Its
    faeries are dressed from lists of inks, and an ink named in a list is read
    like one named on its own, so a list cannot carry an ink past this tool.
  · HOWLING WOLF, STARWARD DREAMING, LEAPING DOLPHINS AND AUTUMN FALLS (Ryan,
    2026-10-19) are drawn in palettes of their own, --pfx-<name>-* in love.css,
    each between its own effect:<key> markers, because a full moon, a fire
    under the stars, a sunset on the sea and an autumn afternoon with children
    in it are lights and skins no card's seven inks can hold. They are nobody
    else's work, so they need no credit. check-contrast.py measures every one
    of their inks on its own scene's ground.
  · CLOUD CITY (Ryan, 2026-10-23) is drawn in the Cloud City theme's
    declared --cb-cloud-* inks between the effect:cloudcity markers, because a
    sunset over a sea of cloud is a light no card's seven inks can hold. It is
    after the city in The Empire Strikes Back, so it keeps the rule the games'
    themes keep: the world's shapes and palette, and NOBODY FROM THE FILMS. Its
    credit names Lucasfilm and says nobody from the films is drawn, and the
    films' people and things are refused by name in its code, its credit and
    the theme's line, because the friendly edit, a caped figure on the deck,
    is the one that would arrive.
  · STARWARD DREAMING'S FIRE SHOWN OVER THE FLASH LINE. The cabin's candles'
    rule: every flame sways on a time of its own out of SW_FLICKER, each half of
    a sway at least four tenths of a second and no two alike, and the flames'
    keyframes in cb.css move their brightness by a tenth at most.
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
  · A PROFILE SET HOLDING MORE THAN A LOOK, A NAME AND AN AVATAR (a request
    from our community, 2026-10-19). A set is the card's seven drawn choices
    under a name, and which avatar is worn: never the card's words, which
    wearing a set must leave as they are, and never a time, which the
    profile's part already refuses. Every set lib.mjs writes is built in
    exactly that shape, and Forget me and deleting the username delete them.
  · THE COMMUNITY DIRECTORY BROKEN IN ANY OF THE WAYS IT PROMISES NOT TO BE
    (Ryan's ask, 2026-10-23). A card is listed only when it says listed, in as
    many words, so the switch starts off; the directory's blob keeps a line of
    exactly the username, nameplate, tagline and pronouns, and forgetProfile
    takes it out before the card goes, so Clear my card, a moderator clearing
    it, Forget me and deleting the username all take somebody out of it; the
    answer is the people and whether you are among them, and nothing that
    counts them. directory.js asks /cb/directory and nowhere else, keeps
    nothing, writes no markup from a string, and says nothing about how many
    or since when; directory.css wears the CB's seven and no colour of its
    own; and privacy.html says what it keeps. The friendly edits are a count at
    the top, a "joined" date beside a name, and a switch that starts on.
  · A PROFILE'S OWN PAGE SHOWING WHAT ITS OWNER DID NOT CHOOSE (Helen Edgar's
    question, Ryan's calls, 2026-10-26). A card is the community's unless its
    owner says private or public in as many words; a private card is nobody
    else's to read, and is in no directory and on no Who's online; somebody
    signed off is answered only for a public card, and the same for every
    other name; and profilePage never carries props, a chat status or a way to
    message anybody, which stay on the radio. profile-page.js asks
    /cb/profile/page and two of the street's own lists and nowhere else, keeps
    nothing and writes no markup from a string; profile-page.css wears the CB's
    seven; privacy.html says all of it. The friendly edits are a Props tab on
    the page "so it is complete", a card that starts public "so sharing is
    easy", and a list of public profiles.
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
DIR_JS = ROOT / "directory.js"
DIR_CSS = ROOT / "directory.css"
DIR_PAGE = ROOT / "directory.html"
DIR_FN = ROOT / "netlify" / "functions" / "cb-directory.mjs"
PAGE_JS = ROOT / "profile-page.js"
PAGE_CSS = ROOT / "profile-page.css"
PAGE = ROOT / "profile.html"
PAGE_FN = ROOT / "netlify" / "functions" / "cb-profile-page.mjs"
PRIVACY = ROOT / "privacy.html"
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
    # --cb-kelp-*, and an effect with a palette of its own to that palette,
    # --pfx-<name>-*. Everything outside those blocks is in the card's seven.
    EFFECT_INKS = {
        "lagoon": ("--lag-", "the Black Leather Lagoon", "that room's"),
        "otters": ("--cb-kelp-", "Otters in the kelp", "the Kelp Forest theme's"),
        "fairy": ("--cb-fairy-", "Flying Fairy", "the Fairy Lights theme's"),
        "wolf": ("--pfx-wolf-", "Howling Wolf", "its own"),
        "starward": ("--pfx-star-", "Starward Dreaming", "its own"),
        "dolphins": ("--pfx-dolphin-", "Leaping Dolphins", "its own"),
        "autumn": ("--pfx-autumn-", "Autumn Falls", "its own"),
        "cloudcity": ("--cb-cloud-", "Cloud City", "the Cloud City theme's"),
    }
    blocks = {k: between(src, f"/* effect:{k}:begin */", f"/* effect:{k}:end */", "profile.js") for k in EFFECT_INKS}
    rest_src = src
    for b in blocks.values():
        rest_src = rest_src.replace(b, "")
    def uncomment(s):
        return re.sub(r"(?m)^\s*//.*$", "", re.sub(r"/\*.*?\*/", "", s, flags=re.S))
    ink = r"(?:fill|stroke|stop)\s*:\s*(?:[^,}]*\?\s*)?'(--[a-z0-9-]+)'(?:\s*:\s*'(--[a-z0-9-]+)')?"
    # A list of inks, which a drawing picks from, is read as every ink in it.
    listed_inks = r"\[\s*'--[a-z0-9-]+'(?:\s*,\s*'--[a-z0-9-]+')*\s*\]"
    def inks(code):
        found = {n for m in re.finditer(ink, code) for n in m.groups() if n}
        for m in re.finditer(listed_inks, code):
            found |= set(re.findall(r"'(--[a-z0-9-]+)'", m.group(0)))
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
        "fairy": ("Helen Edgar", "Faery Yurt"),
        "cloudcity": ("Lucasfilm", "nobody from the films"),
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
    # CLOUD CITY DRAWS NOBODY FROM THE FILMS, the games' themes' rule: the city,
    # its cloud cars and its sunset, and no character, ship or emblem of theirs.
    # Read in the effect's code, its credit, and the Cloud City theme's line.
    cloud_line = re.search(r"\['cloud', 'Cloud City', 'world', '([^']*)'", CALL.read_text())
    said = uncomment(blocks["cloudcity"]) + " " + credit("cloudcity") + " " + (cloud_line.group(1) if cloud_line else "")
    m = re.search(r"\b(?:Lando|Calrissian|Han Solo|Leia|Vader|Boba|Fett|Lobot|Chewbacca|Chewie|Wookiee|Ugnaught|C-?3PO|R2-?D2"
                  r"|stormtroopers?|carbonite|Falcon|lightsabers?|Jedi|Sith|Rebel|insignia)\b", said, re.I)
    if m:
        refuse(f"Cloud City says {m.group(0)!r}. It draws the city, its cloud cars and its sunset, and nobody and "
               "nothing else from the films, the rule the games' themes keep.")
    if not cloud_line:
        refuse("call.js has no Cloud City theme, which the Cloud City effect is drawn in.")
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
    for key, fn in (("lagoon", "lagoonMoment()"), ("otters", "otterMoment()"), ("fairy", "fairyMoment()"),
                    ("wolf", "wolfMoment()"), ("starward", "swMoment()"), ("dolphins", "dpMoment()"), ("autumn", "auMoment()"),
                    ("cloudcity", "ccMoment()")):
        if f"appendChild({fn})" not in uncomment(blocks[key]) or "pf-fx__moment" not in blocks[key]:
            refuse(f"{EFFECT_INKS[key][1]} has lost its opening across the profile, which Ryan asked for.")
    # STARWARD DREAMING'S FIRE IS HELD UNDER THE FLASH LINE, the cabin's
    # candles' rule: each flame sways on a time of its own out of SW_FLICKER,
    # each half of a sway at least four tenths of a second and no two alike,
    # every flame takes its time from that list, and the flames' keyframes move
    # their brightness by a tenth at most.
    sw_code = uncomment(blocks["starward"])
    times = re.search(r"var SW_FLICKER = \[([^\]]*)\]", sw_code)
    vals = [float(v) for v in re.findall(r"[0-9]*\.?[0-9]+", times.group(1))] if times else []
    if not vals or min(vals) < .4 or len(vals) != len(set(vals)):
        refuse("Starward Dreaming's SW_FLICKER is missing, has a sway under four tenths of a second, or two alike: "
               "a flame wobbles no faster than two and a half times a second and never in step with another.")
    flames = [ln for ln in sw_code.splitlines() if "fx-sw-flame" in ln]
    if not flames or any("t: SW_FLICKER[" not in ln for ln in flames):
        refuse("a flame in Starward Dreaming takes its time from somewhere other than SW_FLICKER.")
    flick = re.search(r"@keyframes cb-fx-sw-flicker\s*\{(.*?)\}\s*\}", cbcss, re.S)
    ops = [float(v) for v in re.findall(r"opacity\s*:\s*([0-9.]+)", flick.group(1))] if flick else []
    if not ops or min(ops) < .9:
        refuse("cb.css's cb-fx-sw-flicker is missing or dims a flame by more than a tenth of itself; the cabin's rule holds it at .9 and up.")
    rule = re.search(r"\.fx-sw-flame\s*\{[^}]*animation\s*:\s*([^;]*)", cbcss)
    if not rule or "cb-fx-sw-flicker" not in rule.group(1) or "var(--t" not in rule.group(1):
        refuse("cb.css no longer sways .fx-sw-flame with cb-fx-sw-flicker on the flame's own time.")

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

    sets = part[part.index("/* ── Profile sets"):] if "/* ── Profile sets" in part else ""
    if not sets:
        refuse("the profile's part of lib.mjs has no Profile sets section, which the radio's Profile wears sets from.")
    else:
        sets_code = re.sub(r"/\*.*?\*/", "", sets, flags=re.S)
        built = re.findall(r"(?:const rec =|sets\[i\] =) \{([^}]*)\}", sets_code)
        shapes = [sorted(re.findall(r"(\w+):", b)) for b in built]
        if len(built) < 2 or any(k not in (["avatar", "id", "look", "name"], ["name"]) for k in shapes):
            refuse(f"a profile set in lib.mjs is built with {shapes}: a set holds its id, its name, its look and its avatar, "
                   "and nothing else, so wearing one never puts words back on a card.")
        if re.search(r"\b(?:bio|pronouns|tagline|links|why|listed)\b", sets_code):
            refuse("the profile sets' code in lib.mjs names a part of the card's words: a set is the look, and wearing it keeps the words.")
        if not re.search(r"for \(const \[k, list\] of LOOK\)", sets_code):
            refuse("cardLook in lib.mjs no longer reads exactly LOOK, the seven drawn choices.")
    da = re.search(r"export async function deleteAccount\(.*?\n\}", lib, re.S)
    if not da or "await forgetProfileSets(petKey(handle), s);" not in da.group(0):
        refuse("deleting a username (deleteAccount in lib.mjs) no longer deletes its profile sets.")
    if "forgetProfileSets(pk)" not in (ROOT / "netlify/functions/cb-pets.mjs").read_text():
        refuse("Forget me (cb-pets.mjs) no longer deletes profile sets.")

    check_directory(lib, part_code)
    check_public_page(part_code)

    if problems:
        print("REFUSING:\n  " + "\n  ".join(problems))
        sys.exit(1)
    data = {"themes": keys, "banners": banners, "decorations": keys_d, "frames": listed.get("FRAMES", []),
            "effects": listed.get("EFFECTS", []), "faces": faces}
    write_block(LIB, "/* profile:keys:begin */", "/* profile:keys:end */",
                "export const PROFILE_KEYS = " + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";")
    print("profiles: the themes, drawings, decorations, frames, effects and faces written into lib.mjs")


def strip_js(src):
    code = re.sub(r"/\*.*?\*/", "", src, flags=re.S)
    return re.sub(r"(?m)^\s*//.*$", "", code)


def check_directory(lib, part_code):
    """The community directory (Ryan's ask, 2026-10-23): opt-in, a line of
    exactly what the card shows, out with the card, and no count or date."""
    if "out.listed = p.listed === true;" not in part_code:
        refuse("cleanProfile in lib.mjs no longer lists a card only when it says listed: true. The switch starts off.")
    m = re.search(r"function directoryLine\(.*?\n\}", part_code, re.S)
    built = re.findall(r"return \{([^}]*)\};", m.group(0)) if m else []
    if not built or sorted(re.findall(r"(\w+)(?=[,:]|\s*\}|$)", built[-1].replace(" ", ""))) != ["handle", "plate", "pronouns", "tagline"]:
        refuse("directoryLine in lib.mjs builds a line with something besides the username, nameplate, tagline and pronouns.")
    m = re.search(r"export async function forgetProfile\(.*?\n\}", part_code, re.S)
    body = m.group(0) if m else ""
    i, j = body.find("showInDirectory(pk, null"), body.find("s.delete(profileBlob(pk))")
    if i < 0 or j < 0 or i > j:
        refuse("forgetProfile in lib.mjs no longer takes somebody out of the directory before the card goes.")
    m = re.search(r"export async function communityDirectory\(.*?\n\}", part_code, re.S)
    cd = m.group(0) if m else ""
    ret = re.search(r"return \{(.*?)\};", cd, re.S)
    if not ret or sorted(re.findall(r"^\s*(\w+):", ret.group(1), re.M)) != ["listed", "people"]:
        refuse("communityDirectory in lib.mjs answers with something besides its people and whether you are among them.")
    if re.search(r"\bcount\b|\btotal\b|\.length\b", cd):
        refuse("communityDirectory in lib.mjs counts something: the directory says how many people are in it nowhere.")

    fn = DIR_FN.read_text() if DIR_FN.exists() else ""
    if not fn or "await readPass(req)" not in fn or "if (!who) return json(401" not in fn:
        refuse(f"{DIR_FN.name} answers without a pass: the directory is for people signed on to the CB.")

    js = strip_js(DIR_JS.read_text()) if DIR_JS.exists() else ""
    if not js:
        refuse("directory.js is missing.")
    urls = sorted(set(re.findall(r"fetch\(\s*'([^']*)'", js)))
    if urls != ["/cb/directory"] or re.search(r"XMLHttpRequest|sendBeacon|WebSocket|EventSource", js):
        refuse(f"directory.js asks {urls}: it asks /cb/directory and nowhere else.")
    for pat, why in [
        (r"setItem|removeItem|sessionStorage|indexedDB|document\.cookie", "storage: the directory keeps nothing"),
        (r"innerHTML|outerHTML|insertAdjacentHTML|DOMParser", "markup written from a string"),
        (r"\bcount\b|\btotal\b|\.length\s*\+|\+\s*[\w.]+\.length", "a count: the directory never says how many"),
        (r"\bjoined\b|member since|new Date|Date\.now|toLocale(?:Date)?String", "a date: nothing in the directory says when anybody joined"),
    ]:
        mm = re.search(pat, js)
        if mm:
            refuse(f"directory.js has {mm.group(0)!r}, {why}.")
    css = DIR_CSS.read_text() if DIR_CSS.exists() else ""
    css_code = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
    mm = re.search(r"#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|oklch|lab|lch)\(|\b(?:white|black)\b", css_code)
    if not css or mm:
        refuse(f"directory.css has {mm.group(0) if mm else 'nothing'}: the directory wears the CB's seven and no colour of its own.")
    if re.search(r"\b(?:transition|animation|@keyframes|transform)\b", css_code):
        refuse("directory.css moves something: nothing in the directory moves.")
    page = DIR_PAGE.read_text() if DIR_PAGE.exists() else ""
    for want in ("data-directory", 'src="directory.js"', 'src="call.js"', 'href="privacy.html#community-directory"'):
        if want not in page:
            refuse(f"directory.html has no {want}.")
    priv = PRIVACY.read_text()
    if 'id="community-directory"' not in priv or "Show my profile in the community directory" not in priv:
        refuse("privacy.html has no #community-directory section naming the switch, Show my profile in the community directory.")


def check_public_page(part_code):
    """A profile's own page (2026-10-26): who may open a card is its owner's
    choice, and the community's things never reach it."""
    m = re.search(r"export function cleanProfile\(.*?\n\}", part_code, re.S)
    cp = m.group(0) if m else ""
    if "PROFILE_REACHES.includes(p.reach)" not in cp or "if (reach === 'private') out.listed = false;" not in cp:
        refuse("cleanProfile in lib.mjs no longer keeps who may open a card to '', private or public, or lists a private card.")
    if not re.search(r"PROFILE_REACHES = \['private', 'public'\];", part_code):
        refuse("PROFILE_REACHES in lib.mjs is not exactly private and public: '' is the community, and every card starts there.")
    m = re.search(r"export async function keepProfile\(.*?\n\}", part_code, re.S)
    if not m or "p.reach === 'private' ? ''" not in m.group(0):
        refuse("keepProfile in lib.mjs puts a private card's nameplate on Who's online.")
    m = re.search(r"export async function shownProfile\(.*?\n\}", part_code, re.S)
    if not m or "profile.reach === 'private'" not in m.group(0):
        refuse("shownProfile in lib.mjs shows a private card to somebody who is not its owner.")
    m = re.search(r"export async function profilePage\(.*?\n\}", part_code, re.S)
    pp = m.group(0) if m else ""
    if "if (!who && reach !== 'public') return null;" not in pp:
        refuse("profilePage in lib.mjs answers somebody signed off for a card that is not open to the public.")
    if re.search(r"Props|props|chatStatus|\bdm|Dm\b|message", pp):
        refuse("profilePage in lib.mjs reaches props, a chat status or messages: those are the community's, on the radio.")
    if "const { listed, reach: r, ...rest } = card;" not in pp:
        refuse("profilePage in lib.mjs sends a card's listed, or its reach to somebody else.")
    fn = PAGE_FN.read_text() if PAGE_FN.exists() else ""
    if "{ handle, open: false, signedOn: !!who }" not in fn:
        refuse(f"{PAGE_FN.name} answers a closed profile with more than the name it was asked: every closed name must look alike.")
    js = strip_js(PAGE_JS.read_text()) if PAGE_JS.exists() else ""
    if not js:
        refuse("profile-page.js is missing.")
    urls = sorted(set(re.findall(r"(?:fetch|getJSON)\(\s*'([^']*)'", js)))
    if urls != ["/cb-rooms.json", "/cb/profile/page", "/guild-jobs.json"] or re.search(r"XMLHttpRequest|sendBeacon|WebSocket|EventSource", js):
        refuse(f"profile-page.js asks {urls}: it asks /cb/profile/page and the street's own room and guild lists, and nowhere else.")
    for pat, why in [
        (r"setItem|removeItem|sessionStorage|indexedDB|document\.cookie", "storage: the page keeps nothing"),
        (r"innerHTML|outerHTML|insertAdjacentHTML|DOMParser", "markup written from a string"),
        (r"/cb/props|/cb/dm|/cb/chat|chatStatus|giveProp", "the community's props, chat status or messages, which stay on the radio"),
        (r"\bcount\b|\btotal\b|\.length\s*\+|\+\s*[\w.]+\.length", "a count"),
        (r"\bjoined\b|member since|new Date|Date\.now|toLocale(?:Date)?String", "a date: nothing on a profile says when"),
    ]:
        mm = re.search(pat, js)
        if mm:
            refuse(f"profile-page.js has {mm.group(0)!r}, {why}.")
    css = PAGE_CSS.read_text() if PAGE_CSS.exists() else ""
    css_code = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
    mm = re.search(r"#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|oklch|lab|lch)\(|\b(?:white|black)\b", css_code)
    if not css or mm:
        refuse(f"profile-page.css has {mm.group(0) if mm else 'nothing'}: the page wears the CB's seven and no colour of its own.")
    if re.search(r"\b(?:transition|animation|@keyframes|transform)\b", css_code):
        refuse("profile-page.css moves something.")
    page = PAGE.read_text() if PAGE.exists() else ""
    for want in ("data-profile-page", 'src="profile-page.js"', 'src="call.js"', 'href="privacy.html#public-profiles"'):
        if want not in page:
            refuse(f"profile.html has no {want}.")
    priv = PRIVACY.read_text()
    if 'id="public-profiles"' not in priv or "never shows your props, your chat status or a way to message you" not in priv:
        refuse("privacy.html has no #public-profiles section saying a page never shows props, a chat status or a way to message.")


if __name__ == "__main__":
    main()
