#!/usr/bin/env python3
"""Build The Quiet Stall (§140) from data/the-quiet-stall.json and data/restrooms.json.

WHAT IT IS. Ryan's brief, 2026-11-03: public restrooms on Danny the Street, each
a room with a name and a theme. This one is the sensory one: a public restroom
lined with felt and cork so it gives nothing back, after our Bathroom Access
page and our community's sensory needs, the loudest of which is that a hand
dryer can make a restroom one somebody cannot use at all. Everything every
restroom on the street has is held by tools/restrooms.py; this tool says how
this room does each of them, in its own words, and draws the room.

THE LIGHT IS FROM NOWHERE YOU CAN SEE, AND IT LIES ON THE CEILING. Coves hidden
along the tops of the walls throw light up, so the ceiling is the brightest
thing in the room and the light comes down off it low and even, warm-neutral,
with no lamp, no bulb and no tube anywhere in sight. The collisions, in §140's
comment, are the other soft rooms: the Cooldown Room's one pale vending-machine
panel, the Healing Checkpoint's light coming up out of the floor, the
Adventurer's Guild lit from nowhere on manila and casting nothing, the
Community Center's sage window seat in north light, and Stay Breezy's lamps
under its fans. Here the source is hidden on purpose and lands on the ceiling,
the ground is felt the colour of dusk, and nothing is green or manila.

WHAT IT REFUSES:
  · everything tools/restrooms.py refuses: a restroom that does not say how it
    does every one of the list's things, a gendered sign, an air dryer, anything
    to pay for, a count of the street's restrooms, a stall set apart;
  · A PROMISE TO A BODY in the room's own words: calming, soothing, relaxing
    you, regulating you, reducing stress or anxiety, therapy, healing. The room
    says what is in it; what a quiet room does for somebody is theirs to say.
    The friendly edit is "a calming space for anxious visitors", which is a
    claim about somebody's body made from outside it. Swept with the negation
    window, so the room can still say it promises nothing;
  · a colour in the drawing that love.css does not declare for this room, and a
    literal colour anywhere in it;
  · a keyframe, an animation or a transition in §140: nothing moves at any
    setting, MAX GLITTER included;
  · a form, an input or anything editable outside the job marker, and any
    script but love.js and quest.js;
  · a missing marker pair.
"""
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import restrooms as rr  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "the-quiet-stall.json"
ROOM = ROOT / "the-quiet-stall.html"
CSS = ROOT / "love.css"
FACES = ROOT / "data" / "foundry-faces.json"
P = "qst"
SECTION = 140
SCRIPTS = {"love.js", "quest.js"}

NEGATION = rr.NEGATION
PROMISE = (r"\bcalm(?:s|ing|ed)?\s+(?:you|your|anybody|anyone|people|visitors|the nervous)|\bcalming\b|"
           r"\bsooth\w*|\brelax(?:es|ing)?\s+(?:you|your)|\bregulat\w*\s+(?:you|your)|"
           r"\breduc\w*\s+(?:stress|anxiety)|\b(?:stress|anxiety)\s+relief|\btherap\w*|\bheal(?:s|ing)\b|"
           r"\bsensory[- ]safe\b|\bsafe space\b")

problems = rr.Problems()
d = json.loads(DATA.read_text())


def promise_sweep(text, where):
    t = rr.plain(text)
    for m in re.finditer(PROMISE, t, re.I):
        sentence = re.split(r"[.!?;:]\s", t[max(0, m.start() - 70):m.start()])[-1]
        if re.search(r"\b" + NEGATION + r"\b", sentence, re.I):
            continue
        problems.refuse(f"{where}: {m.group(0)!r} promises something to a body. The room says what is in "
                        "it, and what a quiet room does for somebody is theirs to say.")


def ours(text, where):
    rr.sweep(text, where, problems)
    promise_sweep(text, where)


# ── The data, held to the list and the room's own refusals ──────────────────
rr.check_room(d, "the Quiet Stall", problems)
rr.check_quotes(problems)
for k, v in d["how"].items():
    promise_sweep(v, f"how it does {k}")
ours(d["lede"], "the lede")
for part in ("why", "who", "free"):
    for i, para in enumerate(d[part], 1):
        ours(para, f"{part} {i}")
for r in d["rules"]:
    ours(r["name"] + " " + r["line"], f"the rule {r['name']!r}")
ours(d["drawing_words"], "the drawing's words")
keys = {q["key"] for q in rr.shared()["quotes"]}
for part, ks in d["quotes"].items():
    for k in ks:
        if k not in keys:
            problems.refuse(f"quotes.{part}: {k!r} is not a quotation in data/restrooms.json.")
problems.stop("the Quiet Stall's words")


# ── The drawing ──────────────────────────────────────────────────────────────
W, H = 1200, 380
CEIL, LIP, FLOOR = 46, 58, 322


def num(v):
    return f"{v:.1f}".rstrip("0").rstrip(".")


def speck(i, j):
    """A fixed scatter for the cork, the same floor every build."""
    n = (i * 73856093) ^ (j * 19349663)
    n = (n ^ (n >> 13)) * 1274126177 & 0xFFFFFFFF
    return (n % 10000) / 10000


parts = [
    '<defs>'
    '<linearGradient id="qst-wash" x1="0" y1="0" x2="0" y2="1">'
    '<stop offset="0" stop-color="var(--qst-cove)" stop-opacity=".5"/>'
    '<stop offset="1" stop-color="var(--qst-cove)" stop-opacity="0"/></linearGradient>'
    '<linearGradient id="qst-ceil" x1="0" y1="0" x2="0" y2="1">'
    '<stop offset="0" stop-color="var(--qst-dim)"/>'
    '<stop offset="1" stop-color="var(--qst-cove)"/></linearGradient>'
    '</defs>',
    # The felt wall, and the ceiling washed pale by the coves: brightest where
    # the hidden light lands, nearest the lip.
    f'<rect x="0" y="0" width="{W}" height="{H}" fill="var(--qst-felt)"/>',
    f'<rect x="0" y="0" width="{W}" height="{CEIL}" fill="url(#qst-ceil)"/>',
    # The cove's lip, which hides the light, and the wash it throws down the
    # top of the wall.
    f'<rect x="0" y="{CEIL}" width="{W}" height="{LIP - CEIL}" rx="5" fill="var(--qst-shade)"/>',
    f'<rect x="0" y="{LIP}" width="{W}" height="120" fill="url(#qst-wash)"/>',
]
# Felt panels on the wall, every corner rounded, so nothing rings in them.
for i, x in enumerate(range(28, 420, 132)):
    parts.append(f'<rect x="{x}" y="76" width="112" height="70" rx="20" fill="var(--qst-shade)" opacity=".55"/>')
# The basin counter, a step folded under it, the towel dispenser and the shelf.
parts.append('<rect x="32" y="236" width="196" height="16" rx="8" fill="var(--qst-wool)"/>'
             '<rect x="44" y="252" width="172" height="40" rx="14" fill="var(--qst-shade)"/>'
             '<ellipse cx="130" cy="240" rx="46" ry="7" fill="var(--qst-dim)"/>'
             '<path d="M130 214 V226 Q130 232 138 232" fill="none" stroke="var(--qst-dim)" stroke-width="5" stroke-linecap="round"/>'
             # the Step 'n Wash, folded up flat against the cabinet
             '<rect x="104" y="262" width="52" height="26" rx="6" fill="var(--qst-dim)" stroke="var(--qst-ink)" stroke-width="2"/>'
             '<path d="M112 270 H148 M112 278 H148" stroke="var(--qst-ink-2)" stroke-width="2" stroke-linecap="round"/>'
             # the towel dispenser
             '<rect x="186" y="168" width="44" height="52" rx="12" fill="var(--qst-wool)" stroke="var(--qst-ink)" stroke-width="2"/>'
             '<path d="M196 214 Q208 226 220 214" fill="var(--qst-text)" stroke="var(--qst-ink-2)" stroke-width="1.5"/>'
             # the shelf with the cork bowl and the boxes, and the cabinet by it
             '<rect x="30" y="168" width="140" height="10" rx="5" fill="var(--qst-cork)"/>'
             '<path d="M44 168 Q44 148 64 148 Q84 148 84 168 Z" fill="var(--qst-cork)" stroke="var(--qst-cork-dark)" stroke-width="2"/>'
             '<rect x="96" y="146" width="22" height="22" rx="5" fill="var(--qst-wool)"/>'
             '<rect x="122" y="150" width="22" height="18" rx="5" fill="var(--qst-blanket)"/>'
             '<rect x="34" y="188" width="54" height="40" rx="10" fill="var(--qst-wool)" stroke="var(--qst-ink)" stroke-width="2"/>'
             '<path d="M61 196 V220 M49 208 H73" stroke="var(--qst-plum)" stroke-width="4" stroke-linecap="round"/>')
# The bench along the felt wall, upholstered, with a heavy blanket folded on it.
parts.append('<rect x="262" y="232" width="150" height="58" rx="18" fill="var(--qst-wool)" stroke="var(--qst-ink)" stroke-width="2"/>'
             '<rect x="262" y="276" width="150" height="20" rx="10" fill="var(--qst-dim)" stroke="var(--qst-ink)" stroke-width="2"/>'
             '<rect x="270" y="296" width="12" height="26" rx="5" fill="var(--qst-shade)"/>'
             '<rect x="392" y="296" width="12" height="26" rx="5" fill="var(--qst-shade)"/>'
             '<path d="M300 268 Q300 250 318 250 H392 Q404 250 404 262 V284 Q356 292 300 284 Z" fill="var(--qst-blanket)" stroke="var(--qst-ink)" stroke-width="2"/>'
             '<path d="M306 266 H398 M306 276 H398" stroke="var(--qst-plum)" stroke-width="2" stroke-linecap="round" opacity=".7"/>')
# The stalls: felt-faced doors, floor to ceiling, every corner rounded, a soft
# round handle, and over each a lamp, round when free and square when in use,
# beside a felt plate that says which in words.
for k in range(4):
    x = 438 + k * 186
    free = k in (0, 2, 3)
    parts.append(f'<rect x="{x}" y="96" width="166" height="{FLOOR - 96}" rx="24" fill="var(--qst-shade)" '
                 f'stroke="var(--qst-ink)" stroke-width="2"/>')
    parts.append(f'<rect x="{x + 14}" y="110" width="138" height="{FLOOR - 124}" rx="18" fill="var(--qst-felt)" opacity=".75"/>')
    parts.append(f'<circle cx="{x + 140}" cy="214" r="8" fill="var(--qst-cork)" stroke="var(--qst-cork-dark)" stroke-width="2"/>')
    lamp = (f'<circle cx="{x + 46}" cy="78" r="9" fill="var(--qst-free)" stroke="var(--qst-ink)" stroke-width="2"/>' if free else
            f'<rect x="{x + 37}" y="69" width="18" height="18" rx="2" fill="var(--qst-busy)" stroke="var(--qst-ink)" stroke-width="2"/>')
    parts.append(lamp)
    parts.append(f'<rect x="{x + 62}" y="68" width="78" height="20" rx="8" fill="var(--qst-wool)"/>'
                 f'<text x="{x + 101}" y="82.5" text-anchor="middle" font-family="Atkinson Hyperlegible, sans-serif" '
                 f'font-weight="700" font-size="12" fill="var(--qst-ink)">{"FREE" if free else "IN USE"}</text>')
# The cork floor, speckled, the same floor every build.
parts.append(f'<rect x="0" y="{FLOOR}" width="{W}" height="{H - FLOOR}" fill="var(--qst-cork)"/>')
dots = "".join(f'<circle cx="{num(speck(i, 1) * W)}" cy="{num(FLOOR + 4 + speck(i, 2) * (H - FLOOR - 8))}" '
               f'r="{num(1 + speck(i, 3) * 2.2)}"/>' for i in range(240))
parts.append(f'<g fill="var(--qst-cork-dark)" opacity=".55">{dots}</g>')
parts.append(f'<path d="M0 {FLOOR} H{W}" stroke="var(--qst-ink)" stroke-width="3"/>')
drawing = (f'  <svg class="qst-room" viewBox="0 0 {W} {H}" aria-hidden="true" focusable="false">'
           + "".join(parts) + "</svg>")

# Every colour the drawing uses is one love.css declares, by name.
css = CSS.read_text()
root = css[css.index(":root {"):css.index("\n}", css.index(":root {"))]
declared = set(re.findall(r"(--[\w-]+)\s*:", re.sub(r"/\*.*?\*/", " ", root, flags=re.S)))
for name in sorted(set(re.findall(r"var\((--[\w-]+)\)", drawing))):
    if not name.startswith("--qst-"):
        problems.refuse(f"the drawing draws in {name}, which is not this room's.")
    elif name not in declared:
        problems.refuse(f"the drawing draws in {name}, which love.css's :root does not declare.")
if re.search(r"#[0-9a-fA-F]{3,8}\b|\b(?:rgb|hsl)a?\(", drawing):
    problems.refuse("the drawing writes a colour in itself. It draws in the room's declared colours, by name.")
problems.stop("the Quiet Stall's drawing")


# ── Writing ──────────────────────────────────────────────────────────────────
def paras(items):
    return "\n".join(f"    <p>{rr.esc(t)}</p>" for t in items)


def put(marker, block):
    rr.swap(ROOM, f"{P}:{marker}", block, problems)


put("drawing", drawing)
put("lede", f'  <p class="{P}-lede">{rr.esc(d["lede"])}</p>')
put("has", rr.amenities_block(d, P))
put("why", paras(d["why"]) + "\n" + rr.quotes_block(d["quotes"]["why"], P))
put("who", paras(d["who"]) + "\n" + rr.quotes_block(d["quotes"]["who"], P))
put("free", paras(d["free"]) + "\n" + rr.quotes_block(d["quotes"]["free"], P))
rules = [f'      <li><strong>{rr.esc(r["name"])}</strong> {rr.esc(r["line"])}</li>' for r in d["rules"]]
put("rules", f'    <ul class="{P}-rules">\n' + "\n".join(rules) + "\n    </ul>")

faces = json.loads(FACES.read_text())["faces"]
display, text_face = faces["nunito"], faces["atkinson-hyperlegible"]
licence = lambda f: f["licence"].replace(" 1.1", "")
credits = [
    f"      <li>{rr.credits_line()}</li>",
    "      <li><strong>The room is ours</strong>, and so is every word in it but the quotations, which are credited "
    "where they stand. The drawing was made as code by Claude, an AI model made by Anthropic, to Ryan&rsquo;s "
    "brief, and nothing on this page calls an AI while you read it. No real restroom is pictured.</li>",
    f"      <li>The type is {rr.esc(display['family'])}, by {rr.esc(display['designer'])}, for the room&rsquo;s name and "
    f"its headings, under the {rr.esc(licence(display))}, and {rr.esc(text_face['family'])}, by "
    f"{rr.esc(text_face['designer'])}, for everything you read, under the {rr.esc(licence(text_face))}, both read off "
    "their own records.</li>",
]
put("credits", f'    <ul class="{P}-credits">\n' + "\n".join(credits) + "\n    </ul>")
problems.stop("the Quiet Stall's markers")


# ── The published page, checked ──────────────────────────────────────────────
src = ROOM.read_text()
body = re.sub(r"<!-- quest:.*?:end -->", " ", src, flags=re.S)
body = re.sub(r"<!--.*?-->", " ", body, flags=re.S)
for tag in re.findall(r"<(form|input|textarea|select)\b", body, re.I):
    problems.refuse(f"{ROOM.name}: a <{tag}> outside the job marker. Nothing in this room takes anything from you.")
if re.search(r"contenteditable", body, re.I):
    problems.refuse(f"{ROOM.name}: something editable outside the job marker.")
for s in re.findall(r'<script\b[^>]*\bsrc="([^"]+)"', src):
    if s not in SCRIPTS:
        problems.refuse(f"{ROOM.name}: loads {s}, and the room runs {', '.join(sorted(SCRIPTS))} and nothing else.")

sec = re.search(rf"/\* §{SECTION} ── ROOM: The Quiet Stall.*?(?=/\* §\d+ ── )", css, re.S)
if not sec:
    problems.refuse(f"love.css has no §{SECTION} for The Quiet Stall.")
else:
    code = re.sub(r"/\*.*?\*/", " ", sec.group(0), flags=re.S)
    if re.search(r"@keyframes|\banimation\s*:|\btransition\s*:", code):
        problems.refuse(f"§{SECTION}: a keyframe, an animation or a transition. Nothing in the Quiet Stall moves "
                        "at any setting.")
    if re.search(r"#[0-9a-fA-F]{3,8}\b|\b(?:rgb|hsl)a?\(\s*\d", code):
        problems.refuse(f"§{SECTION}: a literal colour. The room's colours are declared in :root and used by name.")

main = re.search(r"<main\b.*?</main>", src, re.S)
text = main.group(0) if main else ""
text = re.sub(r"<!-- quest:.*?:end -->", " ", text, flags=re.S)
text = re.sub(r"<blockquote\b.*?</blockquote>", " ", text, flags=re.S)
text = re.sub(r"<svg\b.*?</svg>", " ", text, flags=re.S)
text = re.sub(r'<p class="qst-has__line">.*?</p>', " ", text, flags=re.S)
text = re.sub(r"<li>Every public restroom on the street was built.*?</li>", " ", text, flags=re.S)
rr.sweep(text, ROOM.name, problems)
promise_sweep(text, ROOM.name)
problems.stop("the Quiet Stall as published")

print(f"the quiet stall: every item on the street's restroom list said in the room's own words, "
      f"and what is not in it; nothing moves, nobody is counted, nothing is promised to a body")
