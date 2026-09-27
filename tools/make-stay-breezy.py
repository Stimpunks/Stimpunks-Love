#!/usr/bin/env python3
"""Build Stay Breezy's floor of fans and the room of your own, from data/stay-breezy.json.

Stay Breezy is the room behind Stay Frosty at the bottom of Arlesglad Caverns: a
hall full of fans, for anybody who loves moving air and the noise it makes. It
is Ryan's, 2026-09-26 -- "even in a 68F room, I need a fan blowing on me" -- and
his words are on the page. Every fan is one entry in the data file; this writes
the floor, the room of your own, and the numbers each fan's sound is built from.
stay-breezy.js makes the sound in the visitor's own browser. Nothing is recorded,
fetched or hosted.

WHAT IT REFUSES, and why each one would arrive as a kindness:

  · A FAN WITHOUT ITS WORDS. Every fan says what it feels like and what it sounds
    like before you switch it on, because a fan has no runtime to give and its
    sound is what it says instead -- the Playhouse's sound board rule, where a
    board made of sounds is the one thing that can lock somebody out entirely.
  · TWO FANS THAT SOUND THE SAME. A broad selection with two identical voices in
    it is a smaller selection pretending, and a fan picked for its sound that
    turns out to be another fan's is the one lie a floor of fans can tell.
  · A MAKER'S NAME. The street sells nothing and a fan named for its brand is
    named for the one thing about it that is not the fan. The list is short and
    says so; the rule covers what it cannot catch.
  · A FAN THAT IS FOR SOMETHING. Sleep, focus, calm, treatment: every page about
    fan noise on the internet says what it will do for you, and one of those
    sentences makes a thing somebody loves into a thing somebody is prescribed.
    Swept over the data and the published room, with the checkpoint's negation
    window so the room can say what it is not.
  · A COUNT. The pebbling cabinet's refusal of a tally: no count of fans on, no
    time spent, nothing kept.
  · A CEILING FAN WHOSE LAMP IS NOT BELOW ITS BLADES. A lamp above turning blades
    throws a flickering shadow, which on this street is Club Chronic's strobe
    arriving through a light fitting. Every ceiling fan's lamp hangs under its
    hub, in the drawing as in the room's own sentence, and this checks the
    drawing's coordinates rather than trusting the sentence.
  · A FLASH. No keyframe in the room's section of love.css may animate opacity,
    visibility, filter, colour or a background: the only motion in the room is
    blades turning and a ribbon lifting.
  · A LOUDER CEILING, OR A SCRIPT THAT REACHES OUT. MAX_GAIN in stay-breezy.js is
    refused above 0.2, the Repeater's ceiling, and the script may not fetch,
    send, or ask for the microphone. It keeps ONE thing, the visitor's usual,
    under love-breezy in their own browser, and the tool refuses any other key,
    any other storage, and a privacy page that does not list it.

IT NEEDS NOTHING BUT THE FILES, so it is in the pre-deploy sequence.
"""
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data/stay-breezy.json"
ROOM = ROOT / "stay-breezy.html"
JS = ROOT / "stay-breezy.js"
CSS = ROOT / "love.css"
CEILING = 0.2
KINDS = {"ceiling", "floor", "table", "room"}
SOUND = ("noise", "low", "hum", "hum_level", "beat", "depth", "sweep", "level")
NOISES = {"white", "pink", "brown"}

# A SHORT LIST OF FAN MAKERS, and it says so. Enough to catch the names that
# arrive first when somebody describes a fan they love; the rule in the data
# file's _no_makers covers every name this list does not.
MAKERS = (r"dyson|vornado|lasko|honeywell|hunter fan|casablanca|emerson|westinghouse|"
          r"holmes|rowenta|hampton bay|minka|big ass|air king|pelonis|bionaire|"
          r"black ?\+? ?decker|comfort zone|hurricane|woozoo|dreo|levoit|marelli|kdk|"
          r"panasonic|mitsubishi|xiaomi|rowenta|tefal|delonghi|de'?longhi")

INSTRUMENTAL = (r"earn(?:s|ed|ing)?|deserv(?:e|es|ed|ing)|recharg(?:e|es|ed|ing)|"
                r"productivity|productive|bounce back|back to work|"
                r"so (?:you|we|they) can|in order to|optimi[sz]|"
                r"work(?:ing)? better|perform better|refuel|fuel up")
PRESCRIBED = (r"sleep(?:s|ing)? better|fall asleep|sleep aids?|help(?:s|ing)? you (?:sleep|focus|"
              r"concentrate|relax|study|work|calm)|focus(?:ed|es)? better|concentrat\w+|"
              r"white noise (?:for|helps)|adhd|calm(?:s|ing)? (?:you|your)|treatments?|"
              r"therap\w*|heal(?:s|ing|ed)?|cures?|cured|symptoms?|tinnitus|"
              r"nervous system|regulat(?:e|es|ing) your")
TALLY = (r"scores?|scored|scoring|\d+\s*points?|streaks?|leaderboards?|high[- ]score|"
         r"badges?|achievements?|tall(?:y|ies)|tallied|progress bar|timers?|countdowns?|"
         r"\d+\s+fans? (?:on|running)|fans? (?:on|running) (?:now|so far)|minutes? (?:spent|left)")
NEGATION = (r"(?:no|not|nothing|never|neither|none|without|refuses?|refused|refusing|"
            r"cannot|does not|won't|will not|is not|are not|isn't|aren't|nobody|declin\w+)")
ENTITY = re.compile(r"&(?:[a-zA-Z][a-zA-Z0-9]{1,8}|#\d{2,5}|#x[0-9A-Fa-f]{2,5});")

problems = []


def sweep(text, where):
    for name, pat in (("says what the room is for", INSTRUMENTAL),
                      ("prescribes the fan", PRESCRIBED),
                      ("counts something", TALLY)):
        found = re.compile(rf"\b(?:{pat})", re.I)
        ok = re.compile(rf"\b{NEGATION}\b[^.]{{0,60}}?\b(?:{pat})", re.I)
        for m in found.finditer(text):
            window = text[max(0, m.start() - 70):m.end()]
            if ok.search(window):
                continue
            problems.append(f"{where}: {m.group(0)!r} {name}. See _not_for_anything in the data file; "
                            "rewrite the sentence rather than softening the word.")
    for m in re.finditer(rf"\b(?:{MAKERS})\b", text, re.I):
        problems.append(f"{where}: {m.group(0)!r} is a fan maker's name. See _no_makers.")


# ── The drawings ─────────────────────────────────────────────────────────────
# One per fan, in the room's inks. Every fan with blades has them in a
# <g class="bz-blades"> turning about its hub, whose centre is given so the
# turn is about the hub and never about the bounding box of an odd number of
# blades. A ceiling fan's lamp is a <ellipse class="bz-lamp"> and must sit
# BELOW its hub.

def blades(cx, cy, n, length, width, offset=0):
    out = []
    for i in range(n):
        a = offset + i * 360 / n
        out.append(f'<path d="M{cx} {cy} q{-width} {-length * .55} 0 {-length} '
                   f'q{width} {length * .45} 0 {length} Z" transform="rotate({a:.0f} {cx} {cy})"/>')
    return (f'<g class="bz-blades" style="transform-origin:{cx}px {cy}px">'
            + "".join(out) + f'</g><circle cx="{cx}" cy="{cy}" r="{max(3, width * .7):.1f}" class="bz-hub"/>')


def blur(cx, cy, r):
    return f'<circle cx="{cx}" cy="{cy}" r="{r}" class="bz-blur"/>'


def ribbon(x, y):
    return (f'<path class="bz-ribbon bz-ribbon--hang" d="M{x} {y} q4 9 -1 18 q-3 5 1 9"/>'
            f'<path class="bz-ribbon bz-ribbon--lift" d="M{x} {y} q10 -4 18 1 q6 3 11 0"/>')


def cage(cx, cy, r, spokes=12):
    lines = "".join(
        f'<path d="M{cx} {cy} L{cx + r * __import__("math").cos(i * 6.2832 / spokes):.1f} '
        f'{cy + r * __import__("math").sin(i * 6.2832 / spokes):.1f}"/>' for i in range(spokes))
    return (f'<g class="bz-cage"><circle cx="{cx}" cy="{cy}" r="{r}"/>'
            f'<circle cx="{cx}" cy="{cy}" r="{r * .62:.1f}"/>{lines}</g>')


def ceiling(cx, cy, n, length, width, lamp_rx):
    return (f'<path class="bz-rod" d="M{cx} 4 V{cy}"/>'
            + blur(cx, cy, length) + blades(cx, cy, n, length, width, 18)
            + f'<path class="bz-rod" d="M{cx} {cy} V{cy + 14}"/>'
            + f'<ellipse class="bz-glow" cx="{cx}" cy="{cy + 40}" rx="{lamp_rx * 2.6:.0f}" ry="16"/>'
            + f'<ellipse class="bz-lamp" cx="{cx}" cy="{cy + 20}" rx="{lamp_rx}" ry="7"/>')


DRAW = {
    "hall-ceiling": ceiling(60, 46, 5, 50, 7, 13),
    "room-ceiling": ceiling(60, 50, 4, 38, 6, 10),
    "box": ('<rect class="bz-body" x="14" y="12" width="92" height="92" rx="6"/>'
            + blur(60, 58, 38) + blades(60, 58, 5, 38, 8)
            + '<g class="bz-cage">' + "".join(f'<path d="M20 {y} H100"/>' for y in range(22, 100, 9)) + '</g>'
            + '<path class="bz-body-line" d="M24 104 V112 M96 104 V112"/>' + ribbon(100, 24)),
    "pedestal": (cage(60, 40, 34) + blur(60, 40, 30) + blades(60, 40, 3, 30, 8)
                 + '<path class="bz-body-line" d="M60 74 V106"/><ellipse class="bz-body" cx="60" cy="110" rx="26" ry="6"/>'
                 + ribbon(92, 36)),
    "tower": ('<rect class="bz-body" x="44" y="8" width="32" height="100" rx="14"/>'
              + '<g class="bz-cage">' + "".join(f'<path d="M50 {y} H70"/>' for y in range(20, 96, 5)) + '</g>'
              + '<ellipse class="bz-body" cx="60" cy="112" rx="24" ry="5"/>'),
    "window": ('<rect class="bz-body" x="6" y="30" width="108" height="62" rx="5"/>'
               + blur(34, 61, 24) + blades(34, 61, 4, 24, 6) + blur(86, 61, 24) + blades(86, 61, 4, 24, 6, 45)
               + '<g class="bz-cage"><circle cx="34" cy="61" r="25"/><circle cx="86" cy="61" r="25"/></g>'),
    "drum": (cage(60, 52, 44, 16) + blur(60, 52, 40) + blades(60, 52, 3, 40, 11)
             + '<path class="bz-body-line" d="M22 96 L14 112 M98 96 L106 112"/>'
             + '<circle class="bz-body" cx="14" cy="112" r="5"/><circle class="bz-body" cx="106" cy="112" r="5"/>'
             + ribbon(103, 46)),
    "desk": (cage(60, 46, 30) + blur(60, 46, 26) + blades(60, 46, 4, 26, 7)
             + '<path class="bz-body-line" d="M60 76 V98"/><rect class="bz-body" x="36" y="98" width="48" height="12" rx="5"/>'
             + ribbon(89, 42)),
    "clip": (cage(60, 44, 22, 10) + blur(60, 44, 19) + blades(60, 44, 3, 19, 6)
             + '<path class="bz-body-line" d="M60 66 V78"/>'
             + '<path class="bz-body" d="M44 78 H76 V86 L68 96 H52 L44 86 Z"/>' + ribbon(81, 40)),
    "little": (cage(60, 54, 17, 8) + blur(60, 54, 14) + blades(60, 54, 4, 14, 5)
               + '<path class="bz-body-line" d="M60 71 V100"/><ellipse class="bz-body" cx="60" cy="104" rx="16" ry="5"/>'),
}

# ── Checking the data ────────────────────────────────────────────────────────
data = json.loads(DATA.read_text())
fans = data["fans"]
ids = [f["id"] for f in fans]
if len(set(ids)) != len(ids):
    problems.append("two fans share an id.")
seen_sound = {}
for f in fans:
    where = f"fan {f.get('id')!r}"
    for key in ("id", "name", "kind", "feel", "sound", *SOUND):
        if key not in f or f[key] in ("", None):
            problems.append(f"{where} has no {key}.")
    if f.get("kind") not in KINDS:
        problems.append(f"{where} is kind {f.get('kind')!r}; the kinds are {sorted(KINDS)}.")
    if f.get("noise") not in NOISES:
        problems.append(f"{where} has noise {f.get('noise')!r}; it is one of {sorted(NOISES)}.")
    if not 0 < float(f.get("level", 0)) <= 1:
        problems.append(f"{where}'s level is outside 0 to 1.")
    for key in ("feel", "sound"):
        if len(str(f.get(key, "")).split()) < 6:
            problems.append(f"{where}'s {key} is too short to tell anybody anything before they switch it on.")
    sig = tuple(f.get(k) for k in SOUND if k != "level")
    if sig in seen_sound:
        problems.append(f"{where} sounds exactly like {seen_sound[sig]!r}. No two fans share a sound.")
    seen_sound[sig] = f.get("id")
    if f.get("id") not in DRAW:
        problems.append(f"{where} has no drawing in this tool. Draw it; do not borrow another fan's.")
    for key, value in f.items():
        if isinstance(value, str):
            sweep(value, f"{where} ({key})")
            if ENTITY.search(value):
                problems.append(f"{where} ({key}): an HTML entity. Write the character.")
for key in DRAW:
    if key not in ids:
        problems.append(f"this tool has a drawing for {key!r}, which is not a fan in the data file.")
for f in fans:
    if f.get("kind") in ("ceiling", "room") and f["id"] in DRAW:
        d = DRAW[f["id"]]
        hub = re.search(r'<circle cx="[\d.]+" cy="([\d.]+)"[^>]*class="bz-hub"', d)
        lamp = re.search(r'<ellipse class="bz-lamp" cx="[\d.]+" cy="([\d.]+)"', d)
        if not (hub and lamp) or float(lamp.group(1)) <= float(hub.group(1)):
            problems.append(f"{f['id']}'s lamp is not below its blades. A lamp above turning blades throws "
                            "a flickering shadow; hang it under the hub.")
if not [f for f in fans if f.get("kind") == "table"]:
    problems.append("no fan is small enough for the table in a room of your own.")
if len([f for f in fans if f.get("kind") == "room"]) != 1:
    problems.append("a room of your own has exactly one ceiling fan of its own.")

# ── Writing ──────────────────────────────────────────────────────────────────
esc = lambda s: html.escape(s, quote=False)
att = lambda s: html.escape(str(s), quote=True)


def attrs(f):
    return " ".join(f'data-{k.replace("_", "-")}="{att(f[k])}"' for k in SOUND)


def spoken(name):
    """What the switch is switching, said the way a sentence says it: the box
    fan, the big ceiling fan, your room's ceiling fan."""
    if name.startswith(("The ", "Your ")):
        return esc(name[0].lower() + name[1:])
    return "the " + esc(name[0].lower() + name[1:])


def tile(f, tid=None, extra=""):
    tid = tid or f"fan-{f['id']}"
    name = esc(f["name"])
    speeds = "".join(
        f'<button type="button" class="bz-speed" data-speed="{n}" aria-pressed="{"true" if n == 2 else "false"}">'
        f'<span class="sr">Speed </span>{n}</button>' for n in (1, 2, 3))
    return "\n".join([
        f'    <li class="bz-fan bz-fan--{f["kind"]}" id="{tid}" data-fan="{f["id"]}" {attrs(f)} data-speed="2">',
        f'      <div class="bz-fan__art" aria-hidden="true"><svg viewBox="0 0 120 120" focusable="false">{DRAW[f["id"]]}</svg></div>',
        '      <div class="bz-fan__words">',
        f'        <h3 class="bz-fan__name">{name}</h3>',
        f'        <p class="bz-fan__feel"><b>Feels like:</b> <span>{esc(f["feel"])}</span></p>',
        f'        <p class="bz-fan__sound"><b>Sounds like:</b> <span>{esc(f["sound"])}</span></p>',
        extra,
        '        <div class="bz-fan__controls" hidden>',
        f'          <button type="button" class="bz-switch" aria-pressed="false"><span class="bz-switch__word">Switch on</span><span class="sr"> {spoken(f["name"])}</span></button>',
        f'          <span class="bz-speeds" role="group" aria-label="{att(f["name"])}: speed">{speeds}</span>',
        '          <p class="bz-said" aria-hidden="true" hidden></p>',
        '        </div>',
        '      </div>',
        '    </li>',
    ])


floor = [f for f in fans if f["kind"] != "room"]
room_fan = next(f for f in fans if f["kind"] == "room")
tables = [f for f in fans if f["kind"] == "table"]

floor_block = "\n".join(['  <ul class="bz-floor">', *[tile(f) for f in floor], "  </ul>"])
options = "".join(f'<option value="{att(f["id"])}">{esc(f["name"])}</option>' for f in tables)
perch_pick = ('        <p class="bz-perch" hidden><label for="bz-perch">Perched on your table</label> '
              f'<select id="bz-perch">{options}</select></p>')
room_block = "\n".join(['  <ul class="bz-room">', tile(room_fan),
                        tile(tables[0], "fan-perch", perch_pick), "  </ul>"])
BLOCKS = {"floor": floor_block, "room": room_block}

src = ROOM.read_text()
seen = set()


def swap(m):
    seen.add(m.group(1))
    return f"<!-- breezy:{m.group(1)}:begin -->\n{BLOCKS[m.group(1)]}\n  <!-- breezy:{m.group(1)}:end -->"


out = re.sub(r"<!-- breezy:(floor|room):begin -->.*?<!-- breezy:\1:end -->", swap, src, flags=re.S)
for need in BLOCKS:
    if need not in seen:
        problems.append(f"stay-breezy.html has lost its breezy:{need} markers.")

# ── Checking the room, the script and the stylesheet ─────────────────────────
main = re.search(r"<main\b.*?</main>", out, re.S)
text = main.group(0) if main else ""
text = re.sub(r"<!-- quest:[^:]+:begin -->.*?<!-- quest:[^:]+:end -->", " ", text, flags=re.S)
text = re.sub(r"<!--.*?-->|<(svg|script|style)\b.*?</\1>", " ", text, flags=re.S)
text = re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", text)))
sweep(text, "stay-breezy.html")

js = JS.read_text() if JS.exists() else ""
g = re.search(r"var MAX_GAIN\s*=\s*([0-9.]+)", js)
if not g:
    problems.append("stay-breezy.js has no MAX_GAIN, so nothing says how loud the hall can get.")
elif float(g.group(1)) > CEILING:
    problems.append(f"MAX_GAIN is {g.group(1)}, over {CEILING}. A fan left on must stay under the ceiling.")
for pat, what in ((r"\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource", "a request"),
                  (r"getUserMedia|mediaDevices", "the microphone"),
                  (r"sessionStorage|indexedDB|document\.cookie|caches\.", "storage other than your usual")):
    if re.search(pat, js):
        problems.append(f"stay-breezy.js reaches for {what}. The fans are made here and go nowhere.")
# YOUR USUAL IS ONE KEY, AND IT IS ON THE PRIVACY PAGE. Ryan's call,
# 2026-09-26. The script may keep the visitor's usual under love-breezy and
# nothing else, every call has to go through KEY, and privacy.html has to list
# the key -- because a thing kept in somebody's browser that the page about
# what we keep does not mention is the one quiet lie this street's privacy
# page cannot afford.
key = re.search(r"var KEY\s*=\s*'([^']+)'", js)
if not key or key.group(1) != "love-breezy":
    problems.append("stay-breezy.js keeps its usual under a key other than love-breezy, or none.")
for m in re.finditer(r"localStorage\.(\w+)\(([^,)]*)", js):
    if m.group(2).strip() != "KEY":
        problems.append(f"stay-breezy.js calls localStorage.{m.group(1)}({m.group(2).strip()}); every "
                        "call goes through KEY, so there is one thing kept and one name for it.")
if "<code>love-breezy</code>" not in (ROOT / "privacy.html").read_text():
    problems.append("privacy.html does not list love-breezy. Say what is kept before keeping it.")

css = CSS.read_text()
sec = re.search(r"/\* §\d+ ── SUBROOM: Stay Breezy.*?(?=/\* §\d+ ── )", css, re.S)
if not sec:
    problems.append("love.css has no section headed 'SUBROOM: Stay Breezy'.")
else:
    body = re.sub(r"/\*.*?\*/", " ", sec.group(0), flags=re.S)
    for kf in re.finditer(r"@keyframes\s+([\w-]+)\s*\{(.*?\})\s*\}", body, re.S):
        if re.search(r"\b(opacity|visibility|filter|color|background|fill|stroke)\s*:", kf.group(2)):
            problems.append(f"love.css's @keyframes {kf.group(1)} animates a light or a colour. Nothing in "
                            "Stay Breezy flashes; the only motion is blades turning and a ribbon lifting.")

if problems:
    raise SystemExit("REFUSING:\n  " + "\n  ".join(problems))
if out != src:
    ROOM.write_text(out)
print("stay breezy: the floor and a room of your own written from data/stay-breezy.json; "
      "every fan says how it feels and sounds before it is switched on, and none of it is hosted")
