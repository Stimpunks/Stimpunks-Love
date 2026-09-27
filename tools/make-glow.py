#!/usr/bin/env python3
"""Build Glow Go Gee Gaws' shelves of toys from data/glow.json.

Glow Go Gee Gaws is level B3 of Arlesglad Caverns: glow-in-the-dark toys and
trinkets, in every colour glow comes in (Ryan's call, 2026-09-26, reversing the
orange-only and no-blue picks the brief first made). What makes the room its own
is the KIND of light: every toy starts dark, is charged by being held up to the
rail, and gives the light back slowly until it has none. The glow stick is the
one exception, and says so.

WHAT IT REFUSES:

  · A GREEN THAT IS NOT THE LONGEST, OR A RED OR ORANGE THAT IS NOT AMONG THE
    SHORTEST. Down here a glow lasts seconds so it can be watched, and the order
    at the two ends is the real one, checked 2026-09-26: green pigment is the
    brightest and longest-lasting, red and orange the dimmest and first to go.
    The middle is ours and the room says so. A fade that put red last would be
    the room teaching somebody something false in the one place it says it
    checked.
  · A STORED-LIGHT TOY WITH NO FADE, OR A CHEMICAL ONE WITH A FADE. A glow stick
    is not charged by light and does not fade in seconds; it is bent once.
  · A TOY WITH NO DRAWING, NO WORDS OR A COLOUR THE ROOM DOES NOT HAVE.
  · A PRICE, OR THE VOCABULARY OF BUYING: nothing here is for sale.
  · A FLASH. No keyframe in the room's section may animate anything; a glow
    rises at once on the press and fades by a transition, once. Flicker is Club
    Chronic's rule, and a room full of lights is where it would arrive.
  · A SCRIPT THAT STORES, SENDS OR PLAYS A SOUND. The toys are silent and say
    so; their answer is the glow on the tile and the words under it.

IT NEEDS NOTHING BUT THE FILES.
"""
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data/glow.json"
ROOM = ROOT / "glow-go-gee-gaws.html"
JS = ROOT / "glow.js"
CSS = ROOT / "love.css"
COLOURS = ["green", "aqua", "blue", "white", "violet", "yellow", "pink", "orange", "red"]

SELLING = r"for sale|buy(?:ing)?|purchase\w*|prices?|checkout|basket|add to cart|in stock|shop now"
# A PRICE HAS NO WORD BOUNDARY IN FRONT OF IT: "\b\$" never matches, because a
# dollar sign is not a word character. The break test's "$4" walked straight
# past the first version of this, so a price is its own pattern.
PRICE = re.compile(r"[$£€]\s*\d")
NEGATION = (r"(?:no|not|nothing|never|neither|none|nor|without|refuses?|refused|refusing|"
            r"cannot|does not|won't|will not|is not|are not|isn't|aren't|nobody|declin\w+)")
ENTITY = re.compile(r"&(?:[a-zA-Z][a-zA-Z0-9]{1,8}|#\d{2,5}|#x[0-9A-Fa-f]{2,5});")
problems = []


def sweep(text, where):
    found = re.compile(rf"\b(?:{SELLING})", re.I)
    ok = re.compile(rf"\b{NEGATION}\b[^.]{{0,70}}?\b(?:{SELLING})", re.I)
    for m in found.finditer(text):
        if ok.search(text[max(0, m.start() - 80):m.end()]):
            continue
        problems.append(f"{where}: {m.group(0)!r} is selling. Nothing on these shelves is for sale.")
    for m in PRICE.finditer(text):
        problems.append(f"{where}: {m.group(0)!r} is a price. Nothing on these shelves is for sale.")


# ── The drawings ─────────────────────────────────────────────────────────────
# One per toy, every glowing part in a <g class="gg-shape">, which carries the
# glow; the rest is a thin dim outline. aria-hidden: the words say what it is.
def star(cx, cy, r):
    import math
    pts = []
    for i in range(10):
        a = -math.pi / 2 + i * math.pi / 5
        rr = r if i % 2 == 0 else r * 0.45
        pts.append(f"{cx + rr * math.cos(a):.1f},{cy + rr * math.sin(a):.1f}")
    return f'<polygon points="{" ".join(pts)}"/>'


DRAW = {
    "stars": star(24, 24, 16) + star(52, 18, 9) + star(46, 46, 11) + star(18, 52, 7),
    "ball": '<circle cx="36" cy="36" r="24"/>',
    "dino": ('<path d="M10 50 q8 -20 24 -18 q10 -12 22 -4 q6 4 4 10 q-6 -4 -12 0 q4 8 -2 14 h-6 v-8 h-8 v8 h-6 '
             'q-2 -6 -6 -6 q-6 6 -10 4 Z"/>'),
    "moon": '<path d="M30 10 a24 24 0 1 0 22 32 a18 18 0 1 1 -22 -32 Z"/><circle cx="58" cy="16" r="5"/><circle cx="60" cy="56" r="4"/>',
    "bat": '<path d="M36 26 q4 -8 8 0 q10 -6 22 6 q-10 -2 -12 8 q-6 -6 -10 2 q-4 -2 -8 0 q-4 -8 -10 -2 q-2 -10 -12 -8 q12 -12 22 -6 Z"/>',
    "putty": '<ellipse cx="36" cy="44" rx="26" ry="14"/><path d="M18 40 q10 -24 20 -6 q8 -18 16 4"/>',
    "beads": "".join(f'<circle cx="{36 + 22 * __import__("math").cos(i * 0.7854):.1f}" cy="{36 + 22 * __import__("math").sin(i * 0.7854):.1f}" r="7"/>' for i in range(8)),
    "dice": ('<rect x="8" y="22" width="26" height="26" rx="5"/><rect x="38" y="16" width="26" height="26" rx="5"/>'),
    "key": '<path d="M24 12 h24 v28 l-12 12 l-12 -12 Z"/><circle cx="36" cy="22" r="4"/>',
    "stick": '<rect x="30" y="6" width="12" height="60" rx="6"/>',
}
# Spots on the dice, a hole in the keyring's tag and the glass capsule in the
# stick are drawn dark over the glow: detail, not light.
OVER = {
    "dice": ('<circle cx="15" cy="29" r="2.4"/><circle cx="27" cy="41" r="2.4"/><circle cx="21" cy="35" r="2.4"/>'
             '<circle cx="45" cy="23" r="2.4"/><circle cx="57" cy="35" r="2.4"/><circle cx="45" cy="35" r="2.4"/>'
             '<circle cx="57" cy="23" r="2.4"/>'),
    "key": '<circle cx="36" cy="22" r="3"/>',
    "stick": '<rect x="34" y="22" width="4" height="28" rx="2"/>',
}

data = json.loads(DATA.read_text())
toys = data["toys"]
stored = [t for t in toys if t.get("kind") == "stored"]
for t in toys:
    where = f"toy {t.get('id')!r}"
    for key in ("id", "name", "colour", "kind", "what"):
        if not t.get(key):
            problems.append(f"{where} has no {key}.")
    if t.get("colour") not in COLOURS:
        problems.append(f"{where}'s colour is {t.get('colour')!r}; the shelves have {COLOURS}.")
    if t.get("kind") == "stored" and not isinstance(t.get("fade"), (int, float)):
        problems.append(f"{where} stores light and has no fade. Everything that stores light gives it back.")
    if t.get("kind") == "chemical" and "fade" in t:
        problems.append(f"{where} is chemistry and has a fade. A glow stick is bent once and glows until you leave.")
    if t.get("kind") not in ("stored", "chemical"):
        problems.append(f"{where} is {t.get('kind')!r}; a toy here stores light or is chemistry.")
    if t.get("id") not in DRAW:
        problems.append(f"{where} has no drawing in this tool.")
    for key, value in t.items():
        if isinstance(value, str):
            sweep(value, f"{where} ({key})")
            if ENTITY.search(value):
                problems.append(f"{where} ({key}): an HTML entity. Write the character.")
if stored:
    fades = sorted(t["fade"] for t in stored if isinstance(t.get("fade"), (int, float)))
    for t in stored:
        f = t.get("fade")
        if t["colour"] == "green" and f != fades[-1]:
            problems.append(f"{t['id']} glows green and does not last longest. Green pigment glows longest; "
                            "that end of the order is the checked one.")
        if t["colour"] in ("red", "orange") and f not in fades[:2]:
            problems.append(f"{t['id']} glows {t['colour']} and is not among the first to fade. Red and orange "
                            "are the dimmest and go first; that end of the order is the checked one.")
    missing = [c for c in COLOURS if c not in {t["colour"] for t in stored}]
    if missing:
        problems.append(f"no toy on the shelves glows {missing}. Ryan's call is every glow colour.")

if problems:
    raise SystemExit("REFUSING:\n  " + "\n  ".join(problems))

esc = lambda s: html.escape(s, quote=False)


def tile(t):
    chem = t["kind"] == "chemical"
    how = ("Bend it once and it glows until you leave. It is chemistry, not stored light, so it cannot be "
           "charged again." if chem else f"Glows {t['colour']}. Down here it lasts about {t['fade']} seconds.")
    label = "Bend it" if chem else "Hold it up to the rail"
    over = f'<g class="gg-over">{OVER[t["id"]]}</g>' if t["id"] in OVER else ""
    fade = "" if chem else f' data-fade="{t["fade"]}"'
    return "\n".join([
        f'    <li class="gg-toy gg-toy--{t["colour"]}" id="toy-{t["id"]}" data-kind="{t["kind"]}"{fade}>',
        f'      <div class="gg-toy__art" aria-hidden="true"><svg viewBox="0 0 72 72" focusable="false">'
        f'<g class="gg-shape">{DRAW[t["id"]]}</g>{over}</svg></div>',
        '      <div class="gg-toy__words">',
        f'        <h3>{esc(t["name"])}</h3>',
        f'        <p>{esc(t["what"])}</p>',
        f'        <p class="gg-toy__how">{esc(how)}</p>',
        f'        <p class="gg-toy__do" hidden><button type="button" class="gg-hold">{label}'
        f'<span class="sr">: {esc(t["name"].lower())}</span></button></p>',
        '        <p class="gg-toy__said" aria-hidden="true">Dark, and not glowing.</p>',
        '      </div>',
        '    </li>',
    ])


block = "\n".join(['  <ul class="gg-shelves">', *[tile(t) for t in toys], "  </ul>"])
src = ROOM.read_text()
if "<!-- glow:toys:begin -->" not in src:
    problems.append("glow-go-gee-gaws.html has lost its glow:toys markers.")
out = re.sub(r"<!-- glow:toys:begin -->.*?<!-- glow:toys:end -->",
             lambda _: f"<!-- glow:toys:begin -->\n{block}\n  <!-- glow:toys:end -->", src, flags=re.S)

main = re.search(r"<main\b.*?</main>", out, re.S)
text = main.group(0) if main else ""
text = re.sub(r"<!-- quest:[^:]+:begin -->.*?<!-- quest:[^:]+:end -->", " ", text, flags=re.S)
text = re.sub(r"<!--.*?-->|<(svg|script|style)\b.*?</\1>", " ", text, flags=re.S)
sweep(re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", text))), "glow-go-gee-gaws.html")

js = JS.read_text() if JS.exists() else ""
for pat, what in ((r"\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket", "a request"),
                  (r"localStorage|sessionStorage|indexedDB|document\.cookie", "storage"),
                  (r"AudioContext|new Audio\b|<audio", "a sound")):
    if re.search(pat, js):
        problems.append(f"glow.js reaches for {what}. The toys are silent, keep nothing and send nothing.")

css = CSS.read_text()
sec = re.search(r"/\* §\d+ ── ROOM: Glow Go Gee Gaws.*?(?=/\* §\d+ ── )", css, re.S)
if not sec:
    problems.append("love.css has no section headed 'ROOM: Glow Go Gee Gaws'.")
elif re.search(r"@keyframes|animation\s*:", re.sub(r"/\*.*?\*/", " ", sec.group(0), flags=re.S)):
    problems.append("love.css's Glow Go Gee Gaws section has an animation. A glow rises on the press and "
                    "fades once, by a transition; nothing here pulses or flickers.")

if problems:
    raise SystemExit("REFUSING:\n  " + "\n  ".join(problems))
if out != src:
    ROOM.write_text(out)
print("glow go gee gaws: the shelves written from data/glow.json; every colour, every toy dark until "
      "it is charged, green longest and red first")
