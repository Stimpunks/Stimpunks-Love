#!/usr/bin/env python3
"""Paint Plural Mural's wall and its list, out of data/mural.json and the drawings below.

WHAT IT IS. An end wall on the street with a mural on it, and then another:
Ryan's brief, 2026-09-25. The street is Danny's, and Danny rearranges what is on
them for whoever turns up, so the wall repaints itself. The murals are the
house's, painted here, and the first of them are the lines of the street's own
tagline. Anybody can propose one, in words, and the house paints it.

THE DRAWINGS LIVE HERE AND NOT IN THE DATA, make-dressup.py's arrangement: the
data holds what each mural is called, what it shows in words, and whose idea it
was; this file holds the paint. Each drawing is keyed to its entry, and the two
have to agree.

WHAT IT REFUSES, and why each one is here:

  · A MURAL WITH NO WORDS FOR WHAT IT SHOWS. The wall is aria-hidden paint, so the
    sentence under it is the mural for anybody not looking at the picture, and a
    mural with no sentence is one a screen reader walks straight past. The list
    under the wall carries every one of them at every setting of the dial.
  · A MURAL WITH NO CREDIT for whose idea it was.
  · PAINTED WORDS UNDER 4.5:1 against the paint they stand on. A mural's lettering
    is decoration in WCAG's terms, and it is also the one thing on it everybody
    reads first. Every word painted on this wall is held to the body-text bar
    against every colour it crosses, which is the Jungle Room's quills rule
    arriving at a sign-writer.
  · TWO MURALS PAINTED ON ONE GROUND. No two alike is the street's rule and a
    wall of them is where it would slip first.
  · A PICTURE THAT IS NOT PAINT. No <image>, no href, no url() in a drawing:
    nothing on this wall is a photograph of a real mural, because a mural is its
    painter's work wherever it stands and a photograph of one is a copy of it.
  · A CREDIT WITH A NAME AND NO WORDS. A proposal that goes up with somebody's
    name on it carries `as_given`, what they said, exactly as they said it.
  · THE VOCABULARY OF A VOTE. No likes, no votes, no most popular, no favourite
    of the week, nothing counted, with make-guild.py's negation window so the room
    can say out loud that there is none. A wall that takes proposals is exactly
    the shape of thing that grows a poll, and a poll would turn somebody's idea
    into a contest with somebody else's.
"""
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data/mural.json"
PAGE = ROOT / "plural-mural.html"

# Every mural is 1200 by 600. Each drawing is only its paint: the wall's render,
# the lamppost's shadow and the dissolve belong to the room, in love.css §54.
# `letter` is the ink the words are painted in and `under` every colour they are
# painted across; both are measured below.
DRAW = {
    "queer": {
        "ground": "#1D3557", "letter": "#1D3557", "under": ["#FFF4E0"],
        "paint": """
<rect width="1200" height="600" fill="#1D3557"/>
<g fill="#FFF4E0"><circle cx="90" cy="70" r="5"/><circle cx="210" cy="250" r="4"/><circle cx="1110" cy="90" r="5"/><circle cx="990" cy="260" r="4"/><circle cx="1150" cy="330" r="3"/><circle cx="60" cy="360" r="3"/><circle cx="600" cy="240" r="4"/></g>
<g fill="none" stroke-width="50">
<path d="M80 600 A520 520 0 0 1 1120 600" stroke="#E63946"/>
<path d="M130 600 A470 470 0 0 1 1070 600" stroke="#F4A261"/>
<path d="M180 600 A420 420 0 0 1 1020 600" stroke="#F1D302"/>
<path d="M230 600 A370 370 0 0 1 970 600" stroke="#2A9D8F"/>
<path d="M280 600 A320 320 0 0 1 920 600" stroke="#4EA8DE"/>
<path d="M330 600 A270 270 0 0 1 870 600" stroke="#9D4EDD"/>
</g>
<path d="M150 60 L110 110 L150 160 Z M1050 60 L1090 110 L1050 160 Z" fill="#E8D5B0"/>
<rect x="150" y="50" width="900" height="120" rx="6" fill="#FFF4E0"/>
<text x="600" y="134" text-anchor="middle" textLength="820" lengthAdjust="spacingAndGlyphs" font-family="Chango, sans-serif" font-size="58" fill="#1D3557">QUEER WITHOUT FEAR</text>
"""},
    "interdependent": {
        "ground": "#F6E7C1", "letter": "#3B2A20", "under": ["#F6E7C1"],
        "paint": """
<rect width="1200" height="600" fill="#F6E7C1"/>
<rect y="340" width="1200" height="260" fill="#5B3A29"/>
<g fill="none" stroke="#F3E3C3" stroke-width="4" stroke-linecap="round">
<path d="M150 340 V430 M150 380 L120 420 M150 390 L182 425"/>
<path d="M330 340 V410 M330 360 L305 400 M330 365 L352 398"/>
<path d="M520 340 V440 M520 380 L495 425"/>
<path d="M700 340 V450 M700 380 L670 430 M700 390 L735 435"/>
<path d="M880 340 V420 M880 370 L905 410"/>
<path d="M1050 340 V430 M1050 375 L1025 415"/>
<path d="M120 420 C220 520 260 470 305 400 M182 425 C260 540 420 500 495 425 M352 398 C420 470 600 540 670 430 M520 440 C600 560 800 560 905 410 M735 435 C820 520 960 520 1025 415 M150 430 C400 590 800 600 1050 430"/>
</g>
<path d="M150 340 V175" stroke="#4F772D" stroke-width="10"/>
<ellipse cx="128" cy="270" rx="26" ry="11" fill="#4F772D"/><ellipse cx="172" cy="240" rx="26" ry="11" fill="#4F772D"/>
<circle cx="150" cy="160" r="50" fill="#F2B705"/><circle cx="150" cy="160" r="22" fill="#6B3E1E"/>
<path d="M300 340 L312 280 L322 340 Z M322 340 L334 262 L346 340 Z M346 340 L358 290 L366 340 Z" fill="#90A955"/>
<rect x="508" y="290" width="24" height="50" rx="6" fill="#F3E3C3"/>
<path d="M466 296 Q520 220 574 296 Z" fill="#C1440E"/><g fill="#F3E3C3"><circle cx="500" cy="276" r="7"/><circle cx="536" cy="266" r="6"/><circle cx="552" cy="286" r="5"/></g>
<rect x="690" y="250" width="20" height="90" fill="#6B3E1E"/>
<circle cx="700" cy="215" r="60" fill="#4F772D"/><circle cx="660" cy="240" r="38" fill="#4F772D"/><circle cx="742" cy="240" r="38" fill="#4F772D"/>
<path d="M880 340 C880 290 890 250 920 225" stroke="#90A955" stroke-width="6" fill="none"/>
<g fill="#90A955"><ellipse cx="870" cy="310" rx="18" ry="7"/><ellipse cx="896" cy="300" rx="18" ry="7"/><ellipse cx="872" cy="280" rx="16" ry="6"/><ellipse cx="900" cy="268" rx="16" ry="6"/><ellipse cx="886" cy="252" rx="13" ry="5"/><ellipse cx="912" cy="240" rx="12" ry="5"/></g>
<path d="M1050 340 V240" stroke="#4F772D" stroke-width="8"/>
<path d="M1026 240 Q1024 196 1036 186 L1050 206 L1064 186 Q1076 196 1074 240 Z" fill="#D1495B"/>
<text x="600" y="110" text-anchor="middle" textLength="940" lengthAdjust="spacingAndGlyphs" font-family="Chango, sans-serif" font-size="56" fill="#3B2A20">INTERDEPENDENT AND HERE</text>
"""},
    "divergent": {
        "ground": "#F28C28", "letter": "#3D1E6D", "under": ["#F28C28", "#FFD166"],
        "paint": """
<rect width="1200" height="600" fill="#F28C28"/>
<circle cx="600" cy="330" r="210" fill="#FFD166"/>
<g fill="none" stroke="#3D1E6D" stroke-linecap="round">
<path d="M600 600 V470" stroke-width="30"/>
<path d="M600 480 C560 440 520 430 470 420 M600 480 C640 440 690 430 740 415 M600 470 C590 420 600 400 610 370 M470 420 C450 400 440 380 420 350 M740 415 C760 395 780 380 800 345 M470 420 C430 425 400 415 370 400 M740 415 C780 425 810 420 840 405" stroke-width="12"/>
</g>
<g fill="none" stroke="#3D1E6D" stroke-width="9" stroke-linecap="round">
<path d="M380 300 q27 -32 54 0 q27 -32 54 0"/>
<path d="M300 220 q22 -27 43 0 q22 -27 43 0" transform="rotate(-18 324 220)"/>
<path d="M820 290 q27 -32 54 0 q27 -32 54 0" transform="rotate(14 850 290)"/>
<path d="M920 200 q22 -27 43 0 q22 -27 43 0" transform="rotate(32 944 200)"/>
<path d="M640 200 q22 -25 43 0 q22 -25 43 0" transform="rotate(-6 664 200)"/>
<path d="M170 330 q22 -27 43 0 q22 -27 43 0" transform="rotate(-38 194 330)"/>
<path d="M1040 350 q22 -27 43 0 q22 -27 43 0" transform="rotate(48 1064 350)"/>
<path d="M500 250 q18 -22 36 0 q18 -22 36 0" transform="rotate(22 520 250)"/>
<path d="M1080 230 q18 -22 36 0 q18 -22 36 0" transform="rotate(-24 1100 230)"/>
<path d="M90 230 q18 -22 36 0 q18 -22 36 0" transform="rotate(10 110 230)"/>
<path d="M740 180 q18 -22 36 0 q18 -22 36 0" transform="rotate(62 760 180)"/>
<path d="M240 420 q22 -27 43 0 q22 -27 43 0" transform="rotate(-60 264 420)"/>
<path d="M960 440 q22 -27 43 0 q22 -27 43 0" transform="rotate(70 984 440)"/>
</g>
<text x="600" y="100" text-anchor="middle" textLength="880" lengthAdjust="spacingAndGlyphs" font-family="Chango, sans-serif" font-size="62" fill="#3D1E6D">DIVERGENT AND PROUD</text>
"""},
    "loud": {
        "ground": "#B5174B", "letter": "#FFF8E7", "under": ["#B5174B"],
        "paint": """
<rect width="1200" height="600" fill="#B5174B"/>
<g fill="none" stroke="#FFE66D" stroke-width="16">
<circle cx="300" cy="330" r="170"/><circle cx="300" cy="330" r="230"/><circle cx="300" cy="330" r="290"/>
</g>
<rect x="190" y="200" width="220" height="260" rx="16" fill="#1B1B3A"/>
<circle cx="300" cy="275" r="42" fill="#FFE66D"/><circle cx="300" cy="275" r="16" fill="#1B1B3A"/>
<circle cx="300" cy="385" r="56" fill="#FFE66D"/><circle cx="300" cy="385" r="22" fill="#1B1B3A"/>
<g fill="#FFE66D"><path d="M1110 18 L1078 72 L1100 72 L1068 136 L1132 62 L1108 62 L1134 18 Z"/><path d="M1130 420 L1105 465 L1125 465 L1098 520 L1150 458 L1130 458 L1150 420 Z"/></g>
<g font-family="Chango, sans-serif" fill="#FFF8E7" text-anchor="middle">
<text x="850" y="275" textLength="440" lengthAdjust="spacingAndGlyphs" font-size="104">LIVING</text>
<text x="850" y="400" textLength="440" lengthAdjust="spacingAndGlyphs" font-size="104">OUT LOUD</text>
</g>
"""},
    "plucky": {
        "ground": "#DDEBC8", "letter": "#203020", "under": ["#DDEBC8"],
        "paint": """
<rect width="1200" height="600" fill="#DDEBC8"/>
<g font-family="Chango, sans-serif" fill="#203020" text-anchor="middle">
<text x="600" y="100" textLength="760" lengthAdjust="spacingAndGlyphs" font-size="52">PLUCKY PLURALISM,</text>
<text x="600" y="172" textLength="840" lengthAdjust="spacingAndGlyphs" font-size="52">FOR HUMAN ORGANISMS</text>
</g>
<g transform="translate(120 330)"><ellipse cx="0" cy="40" rx="60" ry="16" fill="#8C6A4F"/><circle cx="10" cy="10" r="36" fill="#C1440E"/><path d="M10 10 m-22 0 a22 22 0 1 1 22 22 a14 14 0 1 1 -14 -14 a6 6 0 1 1 6 6" fill="none" stroke="#F3E3C3" stroke-width="4"/><path d="M-52 36 L-66 10 M-44 32 L-50 8" stroke="#8C6A4F" stroke-width="4" stroke-linecap="round"/></g>
<g transform="translate(330 270)"><ellipse cx="-14" cy="-22" rx="20" ry="12" fill="#FFFFFF"/><ellipse cx="14" cy="-22" rx="20" ry="12" fill="#FFFFFF"/><ellipse cx="0" cy="0" rx="40" ry="24" fill="#F2B705"/><path d="M-14 -22 V22 M6 -24 V24" stroke="#2B2B2B" stroke-width="8"/><circle cx="36" cy="-4" r="5" fill="#2B2B2B"/></g>
<g transform="translate(540 420)"><g fill="#FFFFFF"><ellipse cx="0" cy="-34" rx="12" ry="26"/><ellipse cx="0" cy="34" rx="12" ry="26"/><ellipse cx="-34" cy="0" rx="26" ry="12"/><ellipse cx="34" cy="0" rx="26" ry="12"/><ellipse cx="-24" cy="-24" rx="10" ry="22" transform="rotate(-45 -24 -24)"/><ellipse cx="24" cy="24" rx="10" ry="22" transform="rotate(-45 24 24)"/><ellipse cx="24" cy="-24" rx="10" ry="22" transform="rotate(45 24 -24)"/><ellipse cx="-24" cy="24" rx="10" ry="22" transform="rotate(45 -24 24)"/></g><circle r="16" fill="#F2B705"/></g>
<ellipse cx="760" cy="300" rx="52" ry="34" fill="#9AA5A8"/>
<g transform="translate(960 300)"><path d="M0 60 C0 20 10 -20 40 -50" stroke="#4F772D" stroke-width="6" fill="none"/><g fill="#4F772D"><ellipse cx="-12" cy="40" rx="18" ry="7"/><ellipse cx="14" cy="32" rx="18" ry="7"/><ellipse cx="-6" cy="12" rx="16" ry="6"/><ellipse cx="20" cy="2" rx="16" ry="6"/><ellipse cx="10" cy="-20" rx="13" ry="5"/><ellipse cx="32" cy="-30" rx="11" ry="5"/></g></g>
<g transform="translate(1090 460)"><ellipse cx="0" cy="0" rx="48" ry="24" fill="#4EA8DE"/><path d="M44 0 L80 -24 L80 24 Z" fill="#4EA8DE"/><circle cx="-26" cy="-4" r="5" fill="#1D3557"/></g>
<g transform="translate(250 500)"><circle r="30" fill="#E63946"/><path d="M0 -30 V30" stroke="#2B2B2B" stroke-width="4"/><g fill="#2B2B2B"><circle cx="-13" cy="-8" r="6"/><circle cx="13" cy="10" r="6"/><circle cx="-11" cy="14" r="5"/><circle cx="12" cy="-12" r="5"/></g><circle cy="-34" r="11" fill="#2B2B2B"/></g>
<g transform="translate(700 520)"><rect x="-9" y="-10" width="18" height="36" rx="5" fill="#F3E3C3"/><path d="M-36 -8 Q0 -60 36 -8 Z" fill="#8C6A4F"/></g>
<path d="M880 500 l14 30 32 4 -24 22 7 32 -29 -16 -29 16 7 -32 -24 -22 32 -4 z" fill="#F4A261"/>
<g transform="translate(420 560) rotate(-24)"><path d="M-40 0 Q0 -32 40 0 Q0 32 -40 0 Z" fill="#90A955"/><path d="M-40 0 H40" stroke="#4F772D" stroke-width="3"/></g>
"""},
    "becoming": {
        "ground": "#2B2D5C", "letter": "#FFD166", "under": ["#2B2D5C"],
        "paint": """
<rect width="1200" height="600" fill="#2B2D5C"/>
<g fill="none" stroke="#F2E9DC" stroke-width="4">
<path d="M0 110 Q600 190 1200 100"/><path d="M0 200 Q600 290 1200 190"/><path d="M0 290 Q600 380 1200 280"/>
</g>
<g>
<g transform="translate(180 130) scale(1.5)"><ellipse cx="0" cy="-20" rx="24" ry="20" fill="#F2A65A"/><path d="M20 -26 L40 -34 L22 -18 Z" fill="#FFD166"/><circle cx="10" cy="-26" r="3" fill="#2B2D5C"/></g>
<g transform="translate(470 147) scale(1.5)"><ellipse cx="0" cy="-20" rx="24" ry="20" fill="#8FB996"/><path d="M20 -26 L40 -34 L22 -18 Z" fill="#FFD166"/><circle cx="10" cy="-26" r="3" fill="#2B2D5C"/></g>
<g transform="translate(830 139) scale(1.5)"><ellipse cx="0" cy="-20" rx="24" ry="20" fill="#E4572E"/><path d="M-20 -26 L-40 -34 L-22 -18 Z" fill="#FFD166"/><circle cx="-10" cy="-26" r="3" fill="#2B2D5C"/></g>
<g transform="translate(300 233) scale(1.5)"><ellipse cx="0" cy="-20" rx="24" ry="20" fill="#C9A7E0"/><path d="M20 -26 L40 -34 L22 -18 Z" fill="#FFD166"/><circle cx="10" cy="-26" r="3" fill="#2B2D5C"/></g>
<g transform="translate(700 240) scale(1.5)"><ellipse cx="0" cy="-20" rx="24" ry="20" fill="#F2E9DC"/><path d="M-20 -26 L-40 -34 L-22 -18 Z" fill="#FFD166"/><circle cx="-10" cy="-26" r="3" fill="#2B2D5C"/></g>
<g transform="translate(1010 217) scale(1.5)"><ellipse cx="0" cy="-20" rx="24" ry="20" fill="#F2A65A"/><path d="M20 -26 L40 -34 L22 -18 Z" fill="#FFD166"/><circle cx="10" cy="-26" r="3" fill="#2B2D5C"/></g>
<g transform="translate(560 333) scale(1.5)"><ellipse cx="0" cy="-20" rx="24" ry="20" fill="#E4572E"/><path d="M20 -26 L40 -34 L22 -18 Z" fill="#FFD166"/><circle cx="10" cy="-26" r="3" fill="#2B2D5C"/></g>
</g>
<g fill="#FFD166">
<circle cx="236" cy="60" r="9"/><path d="M244 60 V30 h14" stroke="#FFD166" stroke-width="4" fill="none"/>
<circle cx="526" cy="80" r="9"/><path d="M534 80 V50 h14" stroke="#FFD166" stroke-width="4" fill="none"/>
<circle cx="770" cy="66" r="9"/><path d="M778 66 V36 h14" stroke="#FFD166" stroke-width="4" fill="none"/>
<circle cx="356" cy="160" r="8"/><path d="M363 160 V134 h12" stroke="#FFD166" stroke-width="4" fill="none"/>
<circle cx="640" cy="180" r="8"/><path d="M647 180 V154 h12" stroke="#FFD166" stroke-width="4" fill="none"/>
<circle cx="1070" cy="150" r="8"/><path d="M1077 150 V124 h12" stroke="#FFD166" stroke-width="4" fill="none"/>
</g>
<g transform="translate(880 311)"><circle cx="0" cy="0" r="9" fill="#8FB996"/><circle cx="16" cy="-2" r="9" fill="#8FB996"/><circle cx="32" cy="-3" r="9" fill="#8FB996"/><circle cx="48" cy="-3" r="10" fill="#8FB996"/><circle cx="52" cy="-6" r="2.5" fill="#2B2D5C"/></g>
<g transform="translate(1000 300)"><path d="M0 0 C-30 -40 -60 -20 -40 10 Z M0 0 C30 -40 60 -20 40 10 Z" fill="#F2A65A"/><path d="M0 0 C-20 20 -40 30 -26 40 Z M0 0 C20 20 40 30 26 40 Z" fill="#E4572E"/><path d="M0 -12 V30" stroke="#F2E9DC" stroke-width="4"/></g>
<g font-family="Chango, sans-serif" fill="#FFD166" text-anchor="middle">
<text x="600" y="470" textLength="900" lengthAdjust="spacingAndGlyphs" font-size="54">BECOMING AND BELONGING,</text>
<text x="600" y="548" textLength="800" lengthAdjust="spacingAndGlyphs" font-size="54">WITH RIBALD SONGING</text>
</g>
"""},
}

# `like` IS NOT ON THIS LIST AS A BARE WORD: "the one you like" and "looks like"
# are the verb and the preposition, and the room says both. A like is only a
# like when it is counted -- likes, liked -- which is check-counts.py's first
# lesson and make-guild.py's `points`, arriving before the first run this time.
VOTE = re.compile(
    r"\b(likes|liked|votes?|voted|voting|polls?|most\s+(?:popular|liked|viewed|looked)|"
    r"favourite\s+of\s+the|top\s+(?:mural|pick)s?|ranked|ranking|leaderboards?|"
    r"\d+\s+murals?|tall(?:y|ies))\b", re.I)
NEGATED = re.compile(r"\b(not|no|nothing|never|nor|without|nobody|none)\b[^.;:]*$", re.I)
NOT_PAINT = re.compile(r"<image\b|href=|url\(", re.I)

problems = []


def lum(h):
    h = h.lstrip("#")
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    c = [x / 12.92 if x <= 0.03928 else ((x + 0.055) / 1.055) ** 2.4 for x in c]
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]


def ratio(a, b):
    la, lb = lum(a), lum(b)
    return (max(la, lb) + 0.05) / (min(la, lb) + 0.05)


def plain(s):
    s = re.sub(r"<!--.*?-->", " ", s, flags=re.S)
    s = re.sub(r"<[^>]+>", " ", s)
    return re.sub(r"\s+", " ", html.unescape(s)).strip()


def sweep(text, where):
    said = plain(text)
    m = next((x for x in VOTE.finditer(said)
              if not NEGATED.search(said[max(0, x.start() - 50):x.start()])), None)
    if m:
        problems.append(f"{where}: {m.group(0)!r} is the vocabulary of a vote. Nothing on this wall "
                        "is voted on, liked, ranked or counted.")


def esc(s):
    return html.escape(s, quote=False)


def attr(s):
    return html.escape(s, quote=True)


data = json.loads(DATA.read_text())
murals = data["murals"]
keys = [m.get("key") for m in murals]
if len(set(keys)) != len(keys):
    problems.append("two murals share a key.")
for k in sorted(set(keys) - set(DRAW)):
    problems.append(f"mural {k!r} has no drawing in this file, so there is nothing to paint.")
for k in sorted(set(DRAW) - set(keys)):
    problems.append(f"a drawing for {k!r} is in this file with no mural in the data. Paint it on "
                    "purpose or take it out.")
grounds = {}
for m in murals:
    k = m.get("key", "?")
    at = f"mural {k!r}"
    for field in ("title", "shows", "idea"):
        if not m.get(field):
            problems.append(f"{at}: no `{field}`.")
    if m.get("who") and not m.get("as_given"):
        problems.append(f"{at}: goes up with {m['who']}'s name on it and none of their words. "
                        "A proposal carries `as_given`, exactly as it was given.")
    sweep(" ".join(str(m.get(f, "")) for f in ("title", "shows", "idea", "as_given")), at)
    d = DRAW.get(k)
    if not d:
        continue
    if NOT_PAINT.search(d["paint"]):
        problems.append(f"{at}: the drawing reaches for an image or a link. Everything on this wall "
                        "is paint, painted here.")
    for under in d["under"]:
        r = ratio(d["letter"], under)
        if r < 4.5:
            problems.append(f"{at}: the painted words, {d['letter']}, are {r:.2f} on {under}. "
                            "Painted words are still words, and they are held to 4.5.")
    g = d["ground"].upper()
    if g in grounds:
        problems.append(f"{at}: painted on {g}, the same ground as {grounds[g]!r}. No two alike.")
    grounds[g] = k

src = PAGE.read_text()
for mark in ("pm-stage", "pm-list"):
    if f"<!-- {mark}:begin -->" not in src:
        problems.append(f"{PAGE.name} has no {mark} markers, so there is nowhere to paint.")
outside = re.sub(r"<!-- (pm-stage|pm-list):begin -->.*?<!-- \1:end -->", " ", src, flags=re.S)
sweep(re.sub(r"<head>.*?</head>", " ", outside, flags=re.S), PAGE.name)

if problems:
    raise SystemExit("REFUSING:\n  " + "\n  ".join(problems))

# ── The wall ────────────────────────────────────────────────────────────────
stage = []
for i, m in enumerate(murals):
    up = " pm-mural--up" if i == 0 else ""
    stage.append(
        f'<svg class="pm-mural{up}" data-key="{attr(m["key"])}" data-title="{attr(m["title"])}" '
        f'data-shows="{attr(m["shows"])}" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice" '
        f'aria-hidden="true" focusable="false">{DRAW[m["key"]]["paint"].strip()}</svg>')

items = []
for i, m in enumerate(murals):
    now = "" if i == 0 else " hidden"
    cur = ' aria-current="true"' if i == 0 else ""
    who = (f'<p class="pm-item__who">Proposed by {esc(m["who"])}: &ldquo;{esc(m["as_given"])}&rdquo;</p>'
           if m.get("who") else "")
    items.append(
        f'  <li class="pm-item{" pm-item--up" if i == 0 else ""}" id="mural-{attr(m["key"])}"{cur}>\n'
        f'    <h3 class="pm-item__title">{esc(m["title"])} <span class="pm-item__now"{now}>on the wall now</span></h3>\n'
        f'    <p class="pm-item__shows">{esc(m["shows"])}</p>\n'
        f'    <p class="pm-item__idea">The idea: {esc(m["idea"])}. Painted by the house.</p>\n'
        f'    {who}<p class="pm-item__go"><button type="button" class="pm-put" data-n="{i}" hidden>'
        f'Put this one up</button></p>\n'
        f'  </li>')
listing = '<ol class="pm-list">\n' + "\n".join(items) + "\n</ol>"


def put(mark, block, s):
    return re.sub(rf"(<!-- {mark}:begin -->).*?(<!-- {mark}:end -->)",
                  lambda x: x.group(1) + "\n" + block + "\n" + x.group(2), s, flags=re.S)


src = put("pm-stage", "\n".join(stage), src)
src = put("pm-list", listing, src)
first = murals[0]
src = re.sub(r'(<span class="pm-now__title" id="pm-now-title">).*?(</span>)',
             lambda x: x.group(1) + esc(first["title"]) + x.group(2), src, flags=re.S)
src = re.sub(r'(<span class="pm-now__shows" id="pm-now-shows">).*?(</span>)',
             lambda x: x.group(1) + esc(first["shows"]) + x.group(2), src, flags=re.S)
PAGE.write_text(src)
print(f"plural mural: painted into {PAGE.name}, every one with its words under the wall, and "
      "every painted word held to 4.5 against the paint it stands on")
