#!/usr/bin/env python3
"""Build Volunteers' loom, its sections, its help list, its playbooks and its credits, from data/volunteers.json.

ONE DATA FILE, ONE TOOL, TWO SURFACES, the contract make-yells.py set. The room
is the street's room for volunteering with Stimpunks: its channel on the CB is
for asking what needs doing, offering what you can, and finding the people doing
the same (Ryan's brief, 2026-10-27, borrowing from stimpunks.org's Volunteer
page). Its page is built out of three pages of ours: Volunteer, We exist as
friction, and Everyone can contribute. This tool writes, between vol:<part>
markers in volunteers.html:

  · THE LOOM (vol:loom): a cloth half woven, the warp running up from it to the
    beam with the window between the threads, a band of weft for every thing on
    the help list, in that thing's dye, and the shuttle lying on the newest row.
  · EVERY SECTION (vol:lede, vol:warp, vol:weft, vol:ecology, vol:roles,
    vol:playbooks, vol:form), block by block, the help list, the warp's threads
    and the playbooks among them.
  · WHAT IS NOT IN THIS ROOM (vol:rules), WHO READS THE CHANNEL AND FOR HOW LONG
    (vol:channel), NEXT DOOR (vol:elsewhere), and THE CREDITS (vol:credits), with
    a table of the quotations in liner-notes.html.

THE CLOTH IS THE ARGUMENT, AND THE DRAWING CANNOT BE MADE ANY OTHER WAY. The warp
is our values: one undyed thread, the same from one end of the cloth to the
other, and every band is crossed by it, because the drawing draws the band as
the warp going over and under it. The weft is what each person brings, a band of
its own dye. A woven cloth holds because every thread grips the ones it crosses,
which is the friction our Volunteer page says we exist as, doing the holding.

WHAT IT REFUSES, and the first four are the room:

  · A TALLY. Hours logged, a volunteer of the month, top volunteers, people
    helped, a leaderboard, and make-dead-tired.py's list, narrowed `points` and
    all. A volunteer page is exactly where a count of hours arrives as a thank
    you, and then it is a timesheet.
  · THE MARTYR. Selfless, tireless, sacrifice, heroes, giving back, above and
    beyond, unsung. Volunteering burns people out on exactly that vocabulary,
    and the room's own rule is that rest is not quitting.
  · OBLIGATION. Minimum hours, commitment required, must commit, mandatory,
    expected to, a shift you owe. Joining the channel commits you to nothing.
  · CHARITY, AND THE CAUSE. The less fortunate, the needy, the vulnerable, those
    in need, helping the disabled, charity cases, and inspiration and bravery,
    Laughingstock's rule: our pages ask for allies working with us and alongside
    us instead of for us, and a sentence that made us somebody's good deed would
    be said to our faces.

  Each is swept in the room's own words with the negation window, so the room
  can still say nobody counts, nobody owes, nobody is a hero. The sweep SKIPS
  BLOCKQUOTES, Dead Tired Society's reason.

  · CULTURE FIT in our own words, unless the words round it say not. GitLab's
    line is quoted; the room's own voice only ever says values fit.
  · A LYRIC. Our Volunteer page ends its values with a song's words, and this
    room has none of them: make-zibaldone.py's rule, refused by the song's own
    lines with no negation window, and by any value shaped like verse.
  · A FORM, AN INPUT, A TEXTAREA OR ANYTHING EDITABLE outside the job marker, and
    any script but love.js and quest.js. The volunteer form is on stimpunks.org;
    the friendly edit is a sign-up sheet on the page "so people can volunteer
    without signing on", which is somebody's details sent to a server nobody
    told them about.
  · A QUOTATION over the cap in the data, with no author or no link for a work,
    an HTML entity in it, or read off anything but one of our pages in `pages`.
    AND, WHERE THE KNOWLEDGE SYSTEM MIRROR IS ON THE MACHINE, ONE THAT IS NOT ON
    THAT PAGE WORD FOR WORD, make-community-care.py's comparison exactly.
  · A HELP LIST OR A HOLDS LINE OUR PAGE NO LONGER SAYS. Every line in `holds` is
    looked for in the mirror's copy of the page, so when our Volunteer page
    changes what it asks for, this stops until the room changes with it.
  · THE FORM'S WAY IN GONE FROM THE OFFICE. The room says the form arrives in
    our office as a volunteer application; data/office.json has to say so.
  · A NEXT-DOOR LINE WHOSE ROOM NO LONGER SAYS IT, the Community Center's
    service-board rule.
  · A CLOTH THAT DOES NOT HOLD: a dye love.css does not declare, two bands of one
    dye touching, and four in a row in a rainbow's order, because the Dopamine
    Dress-Up Den's rainbows are on its wall and not here.
  · A KEYFRAME, AN ANIMATION OR A TRANSITION in §130. Nothing on the loom moves
    at any setting; the shuttle is lying where somebody put it down.
  · A MISSING MARKER PAIR.

WHAT IT DOES NOT CHECK, on purpose: how many bands there are. The cloth is as
long as the list.
"""
import colorsys
import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data/volunteers.json"
ROOM = ROOT / "volunteers.html"
NOTES = ROOT / "liner-notes.html"
CSS = ROOT / "love.css"
LIB = ROOT / "netlify/cb/lib.mjs"
OFFICE = ROOT / "data/office.json"
FACES = ROOT / "data/foundry-faces.json"
MIRROR = Path.home() / "Documents/Claude/Projects/Stimpunks Knowledge System/site/stimpunks.org"

ENTITY = re.compile(r"&(?:[a-zA-Z][a-zA-Z0-9]{1,31}|#\d{1,6}|#x[0-9a-fA-F]{1,6});")
LINK = re.compile(r"\[([^\]]+)\]\(([^)\s]+)\)")
BOLD = re.compile(r"\*\*([^*]+)\*\*")

NEGATION = (r"(?:no|not|nothing|never|neither|none|without|refuses?|refused|refusing|"
            r"cannot|does not|won't|will not|is not|are not|isn't|aren't|nobody|nor|declin\w+)")

TALLY = (r"scores?|scored|scoring|\d+\s*points?|points?\s+(?:for|per|each|awarded|"
         r"earned|available)|streaks?|leaderboards?|high[- ]score|xp\b|levels? up|"
         r"badges? (?:earned|awarded)|achievements?|tall(?:y|ies)|tallied|progress bar|"
         r"hours? (?:logged|served|given|donated)|log(?:ged|ging)? (?:your |the )?hours|"
         r"volunteer of the (?:month|week|year)|top volunteers?|most hours|people helped|"
         r"helped \d+|\d+ (?:people|volunteers|hours|tasks)")
MARTYR = (r"selfless\w*|tireless\w*|sacrific\w*|heroe?s?\b|heroic|give back|giving back|"
          r"above and beyond|unsung|thankless")
OBLIGATION = (r"minimum (?:of )?(?:\d+ )?hours|commitment (?:is )?required|must commit|mandatory|"
              r"expected to|required to|shifts? (?:you owe|required)|owes?\b|owed")
CHARITY = (r"less fortunate|needy|the vulnerable|vulnerable people|those in need|people in need|"
           r"help(?:ing)? the disabled|charity cases?|inspir(?:ing|ational)|brave|bravery|courageous")
CULTURE = r"culture fit"

SWEEPS = [
    (TALLY, "nothing in this room is counted. See _no_tally."),
    (MARTYR, "nobody here is a martyr, and rest is not quitting. See _no_martyr."),
    (OBLIGATION, "joining commits you to nothing. See _no_obligation."),
    (CHARITY, "we are worked with and alongside, not for. See _no_charity."),
    (CULTURE, "the room only ever says values fit; GitLab's line is quoted. See _values_fit."),
]
SWEEPS = [(re.compile(rf"\b(?:{p})", re.I),
           re.compile(rf"\b{NEGATION}\b[^.]{{0,70}}?\b(?:{p})", re.I), why) for p, why in SWEEPS]

# The song our Volunteer page quotes under Love and Care. Its words are refused
# here with no negation window, the Zibaldone's rule, by its own lines.
LYRIC = re.compile(r"write each other letters|call it prayer|temple of broken dreams|"
                   r"congregate in the place", re.I)

SCRIPTS = {"love.js", "quest.js"}

problems = []


def refuse(msg):
    problems.append(msg)


def esc(s):
    return html.escape(str(s), quote=False)


def attr(s):
    return html.escape(str(s), quote=True)


def fold(s):
    return re.sub(r"\s+", " ", str(s)).strip()


def plain_md(s):
    """The mirror's Markdown with only what is not words taken off: images,
    footnote markers, link targets, emphasis, list and blockquote markers."""
    s = re.sub(r"!\[[^\]]*\]\([^)]*\)", " ", s)
    s = re.sub(r"\[\d+\]\(#[^)]*\)", "", s)
    s = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", s)
    s = s.replace("**", "").replace("*", "")
    s = re.sub(r"^\s*>\s?", "", s, flags=re.M)
    s = re.sub(r"^\s*-\s+", "", s, flags=re.M)
    return fold(s)


def sweep(text, where):
    text = str(text)
    if LYRIC.search(text):
        refuse(f"{where}: carries the words of the song our Volunteer page quotes. No lyric here. See _no_lyric.")
    for rx, ok, why in SWEEPS:
        for m in rx.finditer(text):
            window = text[max(0, m.start() - 80):m.end()]
            if ok.search(window):
                continue
            refuse(f"{where}: {m.group(0)!r} -- {why}")


def ours(text, where):
    """Our own words: no entity, no verse, a link only to a page that can be
    checked by eye, swept for the room's refusals."""
    text = str(text)
    if ENTITY.search(text):
        refuse(f"{where}: carries an HTML entity. Everything is escaped on the way in; write the character.")
    if text.count("\n") >= 2:
        refuse(f"{where}: shaped like verse, several hand-broken lines. No lyric here.")
    for _, url in LINK.findall(text):
        if not (url.startswith("https://") or re.match(r"^[a-z0-9-]+\.html(?:#[\w/=-]*)?$", url)):
            refuse(f"{where}: {url!r} is neither an https address nor a page of ours.")
    sweep(BOLD.sub(r"\1", LINK.sub(r"\1", text)), where)


def linked(text):
    """Escape, then make **words** bold and [words](address) a link. The brackets
    and stars survive escaping."""
    out = BOLD.sub(r"<b>\1</b>", esc(text))
    return LINK.sub(lambda m: f'<a href="{attr(html.unescape(m.group(2)))}">{m.group(1)}</a>', out)


def css_root():
    src = CSS.read_text()
    root = src[src.index(":root {"):src.index("\n}", src.index(":root {"))]
    root = re.sub(r"/\*.*?\*/", " ", root, flags=re.S)
    return dict(re.findall(r"(--[a-z0-9-]+):\s*(#[0-9A-Fa-f]{6})", root))


def hue(hexstr):
    h = hexstr.lstrip("#")
    r, g, b = (int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
    return colorsys.rgb_to_hls(r, g, b)[0] * 360


# ── The data ─────────────────────────────────────────────────────────────────
d = json.loads(DATA.read_text())
pages = d.get("pages") or {}
quotes = d.get("quotes") or {}
sections = d.get("sections") or {}
helps = d.get("help") or []
playbooks = d.get("playbooks") or []
warp = d.get("warp") or []
roles = d.get("roles") or []
cap = int(d.get("words") or 0)
if not cap:
    refuse("data/volunteers.json has no `words` cap, and the room prints one.")

mirror_ok = MIRROR.is_dir()
mirror_text = {}
for key, pg in pages.items():
    for need in ("title", "url", "mirror"):
        if not str(pg.get(need, "")).strip():
            refuse(f"pages.{key}: no {need}.")
    if not str(pg.get("url", "")).startswith("https://stimpunks.org/") or not str(pg.get("url", "")).endswith("/"):
        refuse(f"pages.{key}: {pg.get('url')!r} is not one of our pages on stimpunks.org, with its trailing slash.")
    if mirror_ok:
        f = MIRROR / pg.get("mirror", "")
        if not f.is_file():
            refuse(f"pages.{key}: the mirror has no {pg.get('mirror')}, so nothing read off it can be checked.")
            continue
        raw = f.read_text()
        m = re.search(r'^url:\s*"([^"]+)"', raw, re.M)
        if not m or m.group(1) != pg["url"]:
            refuse(f"pages.{key}: {pg['mirror']} in the mirror is {m.group(1) if m else 'no page'}, not {pg['url']}.")
        mirror_text[key] = plain_md(raw.split("\n---", 1)[-1])
        for w in pg.get("holds") or []:
            if fold(w) not in mirror_text[key]:
                refuse(f"pages.{key}: our page no longer says {w!r}, and the room says so on its behalf. "
                       "Re-read the page and change the room's line with it.")

used = set()
for qid, q in quotes.items():
    where = f"quote {qid}"
    text = str(q.get("text", ""))
    n = len(text.split())
    if not n:
        refuse(f"{where}: no text.")
    if n > cap:
        refuse(f"{where}: {n} words against a cap of {cap}. It is printed in the room; raise it in the data "
               "on purpose, with the reason, or quote less.")
    if not str(q.get("who", "")).strip():
        refuse(f"{where}: no `who`. Every line here names who said it.")
    if str(q.get("work", "")).strip() and not str(q.get("url", "")).startswith("https://"):
        refuse(f"{where}: a work with no link to it.")
    if q.get("who") != "Stimpunks" and not str(q.get("work", "")).strip():
        refuse(f"{where}: somebody else's words with no work. Do not fill it from memory.")
    if q.get("read_on") not in pages:
        refuse(f"{where}: `read_on` is not one of `pages`, and every quotation here was read on a page of ours.")
    for field, v in q.items():
        if ENTITY.search(str(v)):
            refuse(f"{where}: {field} carries an HTML entity.")
    if LYRIC.search(text):
        refuse(f"{where}: the song our Volunteer page quotes. No lyric here.")
    if mirror_ok and q.get("read_on") in mirror_text and fold(text) not in mirror_text[q["read_on"]]:
        refuse(f"{where}: not on {pages[q['read_on']]['url']} word for word. Re-copy it from our page; "
               "never loosen the check.")
    for field in ("who", "work", "year", "speaker"):
        sweep(q.get(field, ""), f"{where} ({field})")

for name, blocks in sections.items():
    for j, b in enumerate(blocks, 1):
        where = f"sections.{name} block {j}"
        if "q" in b:
            if b["q"] not in quotes:
                refuse(f"{where}: quotes {b['q']!r}, which is not in `quotes`.")
            used.add(b["q"])
        elif "p" in b:
            ours(b["p"], where)
        elif not any(k in b for k in ("help", "warp", "playbooks")):
            refuse(f"{where}: a block is a q, a p, the help list, the warp or the playbooks, and this is none of them.")
for qid in quotes:
    if qid not in used:
        refuse(f"quote {qid}: in the data and on no section, so its credit would claim a line the room does not print.")

for i, w in enumerate(warp, 1):
    if not str(w.get("url", "")).startswith("https://stimpunks.org/") or not str(w.get("url", "")).endswith("/"):
        refuse(f"warp {i}: {w.get('url')!r} is not one of our pages, with its trailing slash.")
    ours(w.get("name", ""), f"warp {i}")

for i, r in enumerate(roles, 1):
    if mirror_ok and "volunteer" in mirror_text and r not in mirror_text["volunteer"]:
        refuse(f"roles {i}: our Volunteer page no longer names {r!r} among the roles in social change.")

for i, pb in enumerate(playbooks, 1):
    for need in ("name", "line"):
        if not str(pb.get(need, "")).strip():
            refuse(f"playbooks {i}: no {need}.")
    if mirror_ok and "volunteer" in mirror_text and pb.get("name", "") not in mirror_text["volunteer"]:
        refuse(f"playbooks {i}: our Volunteer page no longer has a playbook called {pb.get('name')!r}.")
    ours(pb.get("line", ""), f"playbooks {pb.get('name')}")

for i, h in enumerate(helps, 1):
    for need in ("dye", "name", "line"):
        if not str(h.get(need, "")).strip():
            refuse(f"help {i}: no {need}.")
    ours(h.get("name", ""), f"help {i}")
    ours(h.get("line", ""), f"help {i}")

for i, r in enumerate(d.get("not_here") or [], 1):
    for need in ("name", "line"):
        if not str(r.get(need, "")).strip():
            refuse(f"not_here {i}: no {need}.")
    ours(r.get("name", ""), f"not_here {i}")
    ours(r.get("line", ""), f"not_here {i}")

for i, e in enumerate(d.get("elsewhere") or [], 1):
    where = f"elsewhere {i} ({e.get('page')})"
    p = ROOT / str(e.get("page", ""))
    if not p.is_file():
        refuse(f"{where}: no such page.")
        continue
    ours(e.get("line", ""), where)
    main = re.search(r"<main\b.*?</main>", p.read_text(), re.S)
    text = fold(html.unescape(re.sub(r"<[^>]+>", " ", main.group(0) if main else ""))).lower()
    for w in e.get("holds") or []:
        if fold(w).lower() not in text:
            refuse(f"{where}: that room no longer says {w!r}, and this room says it on its behalf. Change "
                   "the line with the room, and its holds with it.")
    if not e.get("holds"):
        refuse(f"{where}: no holds. A line about another room has to name the words there that carry it.")

# THE FORM ARRIVES IN THE OFFICE, and the room says so: data/office.json's intake
# has to have a volunteer form that makes a case.
intake = (json.loads(OFFICE.read_text()).get("intake") or {}).get("volunteer") or {}
if intake.get("record") != "case" or "Volunteer" not in str(intake.get("type", "")):
    refuse("data/office.json's intake no longer makes a volunteer application from the Volunteer form, and the "
           "room says that is where the form goes. Change the room's line with it.")

# ── The cloth ────────────────────────────────────────────────────────────────
inks = css_root()
dyes = [h.get("dye", "") for h in helps]
if len(dyes) < 3:
    refuse("help: a cloth needs more than a couple of bands to be a cloth.")
for dye in set(dyes):
    if f"--vol-{dye}" not in inks:
        refuse(f"help: --vol-{dye} is not declared in love.css's :root.")
for a, b in zip(dyes, dyes[1:]):
    if a == b:
        refuse(f"help: two bands of {a} touching. Every band is somebody else's thread; reorder them.")
hues = [hue(inks.get(f"--vol-{x}", "#000000")) for x in dyes]
for i in range(len(hues) - 3):
    run = hues[i:i + 4]
    if all(x < y for x, y in zip(run, run[1:])) or all(x > y for x, y in zip(run, run[1:])):
        refuse(f"help: {', '.join(dyes[i:i + 4])} run in a rainbow's order. The Dopamine Dress-Up Den's "
               "rainbows are on its wall; reorder the bands.")

if problems:
    raise SystemExit("REFUSING to build Volunteers:\n  " + "\n  ".join(problems))

W, H = 1200, 380
POST = 64              # the loom's uprights
LEFT, RIGHT = 150, 1050  # the warp's width
PITCH = 12             # one warp thread every 12
FELL = 164             # the newest row of weft
BEAM = 368             # the breast beam the cloth winds round
ROW = (BEAM - FELL) / (2 * len(helps))
threads = [LEFT + PITCH / 2 + i * PITCH for i in range(int((RIGHT - LEFT) / PITCH))]


def num(v):
    return f"{v:.1f}".rstrip("0").rstrip(".")


# The window behind the loom, the room's wall round it, and the light coming in
# level through the bare warp and lying across the top of the cloth.
parts = [
    '<defs><linearGradient id="vol-sky-g" x1="0" y1="0" x2="0" y2="1">'
    '<stop offset="0" stop-color="var(--vol-sky)"/><stop offset="1" stop-color="var(--vol-day)"/></linearGradient>'
    '<linearGradient id="vol-lay-g" x1="0" y1="0" x2="0" y2="1">'
    '<stop offset="0" stop-color="var(--vol-day)" stop-opacity=".55"/>'
    '<stop offset="1" stop-color="var(--vol-day)" stop-opacity="0"/></linearGradient></defs>',
    f'<rect x="0" y="0" width="{W}" height="{H}" fill="var(--vol-wall)"/>',
    f'<rect x="{LEFT - 40}" y="0" width="{RIGHT - LEFT + 80}" height="{FELL + 30}" fill="url(#vol-sky-g)"/>',
    f'<path d="M{LEFT - 40} {FELL + 30} H{RIGHT + 40}" stroke="var(--vol-wood)" stroke-width="10"/>',
    f'<path d="M{W / 2} 0 V{FELL + 30} M{LEFT - 40} 92 H{RIGHT + 40}" stroke="var(--vol-wall)" stroke-width="7"/>',
]
# THE CLOTH: two rows of weft to a band, and in each row the warp goes over the
# weft at every other thread, the next row at the others. That is what draws
# the warp across every band, so a band cannot be drawn without it.
cloth = []
for k, dye in enumerate(dyes):
    for r in range(2):
        y = FELL + (2 * k + r) * ROW
        cloth.append(f'<rect x="{LEFT}" y="{num(y)}" width="{RIGHT - LEFT}" height="{num(ROW + .4)}" '
                     f'fill="var(--vol-{dye})"/>')
        over = "".join(f'M{num(x)} {num(y + 1)} V{num(y + ROW - 1)}'
                       for j, x in enumerate(threads) if (j + r) % 2 == 0)
        cloth.append(f'<path d="{over}" stroke="var(--vol-warp)" stroke-width="5.4" stroke-linecap="round"/>')
    cloth.append(f'<path d="M{LEFT} {num(FELL + (2 * k + 2) * ROW)} H{RIGHT}" stroke="var(--vol-knot)" '
                 f'stroke-width=".8" stroke-opacity=".5"/>')
parts.append("".join(cloth))
# The selvedges, where the weft turns round the outermost thread and goes back.
for x in (LEFT, RIGHT):
    parts.append(f'<path d="M{x} {FELL} V{BEAM}" stroke="var(--vol-warp)" stroke-width="6"/>')
# THE BARE WARP above the newest row, up to the beam, with the window's light
# between every thread, and the light lying across the top of the cloth.
bare = "".join(f'M{num(x)} 34 V{FELL}' for x in threads)
parts.append(f'<path d="{bare}" stroke="var(--vol-thread)" stroke-width="2.4"/>')
parts.append(f'<rect x="{LEFT}" y="{FELL}" width="{RIGHT - LEFT}" height="56" fill="url(#vol-lay-g)"/>')
parts.append(f'<path d="M{LEFT} {FELL} H{RIGHT}" stroke="var(--vol-day)" stroke-width="2.6"/>')
# The loom: two uprights, the beam at the top the warp is tied to, and the
# breast beam at the bottom the cloth winds round.
parts.append(f'<rect x="{POST}" y="0" width="34" height="{H}" fill="var(--vol-wood)"/>'
             f'<rect x="{W - POST - 34}" y="0" width="34" height="{H}" fill="var(--vol-wood)"/>'
             f'<rect x="{POST}" y="20" width="{W - 2 * POST}" height="18" rx="5" fill="var(--vol-wood)" '
             f'stroke="var(--vol-knot)" stroke-width="2"/>'
             f'<rect x="{POST}" y="{BEAM}" width="{W - 2 * POST}" height="18" rx="5" fill="var(--vol-wood)" '
             f'stroke="var(--vol-knot)" stroke-width="2"/>'
             f'<path d="M{POST} 0 V{H} M{POST + 34} 0 V{H} M{W - POST - 34} 0 V{H} M{W - POST} 0 V{H}" '
             f'stroke="var(--vol-knot)" stroke-width="2"/>')
# THE SHUTTLE lying on the newest row, with the next thread on its bobbin in the
# warp's own undyed colour: whoever picks it up chooses the dye.
sx, sy = 690, FELL - 2
parts.append(f'<path d="M{sx - 96} {sy} Q{sx - 60} {sy - 20} {sx} {sy - 20} Q{sx + 60} {sy - 20} {sx + 96} {sy} '
             f'Q{sx + 60} {sy + 20} {sx} {sy + 20} Q{sx - 60} {sy + 20} {sx - 96} {sy} Z" fill="var(--vol-wood)" '
             f'stroke="var(--vol-knot)" stroke-width="2.4" stroke-linejoin="round"/>'
             f'<rect x="{sx - 40}" y="{sy - 9}" width="80" height="18" rx="9" fill="var(--vol-knot)"/>'
             f'<rect x="{sx - 30}" y="{sy - 7}" width="60" height="14" rx="7" fill="var(--vol-warp)"/>'
             f'<path d="M{sx - 26} {sy - 3} H{sx + 26} M{sx - 26} {sy + 1} H{sx + 26} M{sx - 26} {sy + 5} H{sx + 26}" '
             f'stroke="var(--vol-thread)" stroke-width="1.2"/>'
             f'<path d="M{sx + 30} {sy} C{sx + 120} {sy + 4} {sx + 170} {sy + 1} {RIGHT} {sy + 2}" fill="none" '
             f'stroke="var(--vol-warp)" stroke-width="2.4"/>')
loom = (f'  <svg class="vol-loom" viewBox="0 0 {W} {H}" aria-hidden="true" focusable="false">'
        + "".join(parts) + "</svg>")


# ── Writing ──────────────────────────────────────────────────────────────────

def swap(page, marker, block, indent="  "):
    src = page.read_text()
    begin, end = f"<!-- {marker}:begin -->", f"<!-- {marker}:end -->"
    if begin not in src or end not in src:
        raise SystemExit(
            f"REFUSING: {page.name} has no {marker} markers, so there is nowhere to write.\n"
            "Put them back rather than letting this tool go quiet -- a generator that\n"
            "writes nothing and exits 0 is how two surfaces drift apart.")
    page.write_text(re.sub(re.escape(begin) + r".*?" + re.escape(end),
                           lambda _m: begin + "\n" + block + "\n" + indent + end, src, flags=re.S))


def source(q):
    """Who said it and where, beside the words. Somebody else's line says it was
    read on our page, the Community Library's rule; our own says which page."""
    pg = pages[q["read_on"]]
    page_link = f'<a href="{attr(pg["url"])}">{esc(pg["title"])}</a>'
    if q["who"] == "Stimpunks":
        return f'Stimpunks, {page_link}'
    year = f', {esc(q["year"])}' if q.get("year") else ""
    work = f'<a href="{attr(q["url"])}">{esc(q["work"])}</a>'
    return f'{esc(q["who"])}, {work}{year}, read on our {page_link} page'


def quote(qid):
    q = quotes[qid]
    return (f'    <blockquote class="vol-quote">\n'
            f'      <p>{esc(q["text"])}</p>\n'
            f'      <footer class="vol-quote__who">{source(q)}</footer>\n'
            f'    </blockquote>')


def help_list():
    rows = [f'      <li class="vol-band vol-dye--{h["dye"]}">\n'
            f'        <h3>{esc(h["name"])}</h3>\n'
            f'        <p>{linked(h["line"])}</p>\n'
            f'      </li>' for h in helps]
    return '    <ul class="vol-bands">\n' + "\n".join(rows) + "\n    </ul>"


def warp_list():
    rows = [f'      <li><a href="{attr(w["url"])}">{esc(w["name"])}</a></li>' for w in warp]
    return '    <ul class="vol-warp">\n' + "\n".join(rows) + "\n    </ul>"


def playbook_list():
    rows = [f'      <li class="vol-book">\n'
            f'        <h3>{esc(p["name"])}</h3>\n'
            f'        <p>{linked(p["line"])}</p>\n'
            f'      </li>' for p in playbooks]
    return '    <ul class="vol-books">\n' + "\n".join(rows) + "\n    </ul>"


def section(name):
    out = []
    for b in sections[name]:
        if "q" in b:
            out.append(quote(b["q"]))
        elif "p" in b:
            out.append(f'    <p>{linked(b["p"])}</p>')
        elif "help" in b:
            out.append(help_list())
        elif "warp" in b:
            out.append(warp_list())
        elif "playbooks" in b:
            out.append(playbook_list())
    return "\n".join(out)


swap(ROOM, "vol:loom", loom)
for name in sections:
    swap(ROOM, f"vol:{name}", section(name), "    ")

rules = [f'      <li><strong>{esc(r["name"])}</strong> {linked(r["line"])}</li>' for r in d["not_here"]]
swap(ROOM, "vol:rules", '    <ul class="vol-rules">\n' + "\n".join(rules) + "\n    </ul>", "    ")

# WHO READS THE CHANNEL AND FOR HOW LONG, read rather than typed: the two weeks
# out of lib.mjs's LIFE_DAYS, so it does not go quietly wrong when that changes.
life = re.search(r"export const LIFE_DAYS = (\d+);", LIB.read_text())
if not life:
    raise SystemExit("REFUSING: netlify/cb/lib.mjs has no LIFE_DAYS, and the room says how long a message stays.")
LIFE_WORDS = {7: "a week", 14: "two weeks", 21: "three weeks", 28: "four weeks"}
channel = [
    "      <li><strong>Everybody signed on to the CB can read this room&rsquo;s channel</strong>, so say only what "
    "you would say in a room with all of them in it. It keeps "
    '<a href="community-center.html#cb-norms">the house norms</a>, like every channel.</li>',
    f"      <li><strong>Unless our administrators set this channel otherwise, every message on it goes "
    f"{LIFE_WORDS.get(int(life.group(1)), life.group(1) + ' days')} after it was sent</strong>, and the radio says "
    "what it keeps, first under <b>In this channel</b>. For a piece of work that needs longer, "
    '<a href="forum.html#/c/operations">Operations</a> and <a href="forum.html#/c/editorial">Editorial</a> in the '
    "forums are where the meetings&rsquo; work is kept.</li>",
    "      <li><strong>Nothing about you goes on it unless you put it there.</strong> Your address, your phone and "
    "the rest of what the form asks go on the form, never the channel.</li>",
]
swap(ROOM, "vol:channel", '    <ul class="vol-rules">\n' + "\n".join(channel) + "\n    </ul>", "    ")

nexts = [f'      <li><a href="{attr(e["page"])}">{esc(e["name"])}</a>, {linked(e["line"])}</li>'
         for e in d["elsewhere"]]
swap(ROOM, "vol:elsewhere", '    <ul class="vol-next">\n' + "\n".join(nexts) + "\n    </ul>", "    ")

# THE CREDITS: whose every line is, the type read off its own record, and the cap.
faces = json.loads(FACES.read_text())["faces"]
display, text_face = faces["sigmar-one"], faces["rasa"]
whos = []
for q in quotes.values():
    if q["who"] != "Stimpunks" and q["who"] not in whos:
        whos.append(q["who"])
names = ", ".join(whos[:-1]) + " and " + whos[-1]
read_on = ", ".join(f'<a href="{attr(pg["url"])}">{esc(pg["title"])}</a>'
                    for k, pg in pages.items() if any(q["read_on"] == k for q in quotes.values()))
licence = lambda f: f["licence"].replace(" 1.1", "")
credits = [
    "      <li><strong>The loom is ours</strong>, after the rainbow woven cloth our Volunteer page uses for our "
    "diversity and interdependence. It was drawn as code by Claude, an AI model made by Anthropic, to "
    "Ryan&rsquo;s brief, and nothing on this page calls an AI while you read it. The dyes are named for what they "
    "are made from; no cloth anybody wove is pictured.</li>",
    f"      <li><strong>Every quotation belongs to whoever said it</strong> and is credited to them where it stands: "
    f"{esc(names)}. Our page names the UX Cake episode and not who is speaking in it, and neither does this room. "
    "The words around the quotations are ours, written for this room.</li>",
    "      <li><strong>The roles in social change are the Building Movement Project&rsquo;s</strong>, from their "
    "Social Change Ecosystem Map, and only their names are here; <strong>the four playbooks are borrowed from "
    'Human Restoration Project</strong>, as our Volunteer page says, and described here in our words.</li>',
    f"      <li>Every quotation in this room is {cap} words or fewer and was read on one of our own pages, "
    f"{read_on}, on {esc(d['read'])}. <code>tools/make-volunteers.py</code> checks each one against those pages "
    "word for word whenever our copy of stimpunks.org is on the machine, and stops when our Volunteer page "
    "stops asking for what this room says it asks for.</li>",
    f"      <li>The type is {esc(display['family'])}, by {esc(display['designer'])}, for the room&rsquo;s name and "
    f"its headings, under the {esc(licence(display))}, and {esc(text_face['family'])}, by "
    f"{esc(text_face['designer'])}, for everything you read, under the {esc(licence(text_face))}, both read off "
    'their own records. More in <a href="liner-notes.html#volunteers">the liner notes</a>.</li>',
]
swap(ROOM, "vol:credits", '    <ul class="vol-credits">\n' + "\n".join(credits) + "\n    </ul>", "    ")

notes = []
for qid, q in quotes.items():
    pg = pages[q["read_on"]]
    notes.append(f'      <tr><td>{esc(q["text"])}</td><td>{esc(q["who"])}</td>'
                 f'<td><a href="{attr(pg["url"])}">{esc(pg["title"])}</a></td>'
                 f'<td>{len(q["text"].split())} words</td></tr>')
swap(NOTES, "volunteers-credits", "\n".join(notes), "      ")

# ── The published page, checked ──────────────────────────────────────────────
# AFTER the write, so what is checked is what is published.
src = ROOM.read_text()
body = re.sub(r"<!-- quest:.*?:end -->", " ", src, flags=re.S)
body = re.sub(r"<!--.*?-->", " ", body, flags=re.S)

for tag in re.findall(r"<(form|input|textarea|select)\b", body, re.I):
    refuse(f"{ROOM.name}: a <{tag}> outside the job marker. Nothing in this room takes your details; the "
           "volunteer form is on stimpunks.org.")
if re.search(r"contenteditable", body, re.I):
    refuse(f"{ROOM.name}: something editable outside the job marker.")
for s in re.findall(r'<script\b[^>]*\bsrc="([^"]+)"', src):
    if s not in SCRIPTS:
        refuse(f"{ROOM.name}: loads {s}, and the room runs {', '.join(sorted(SCRIPTS))} and nothing else.")
if 'href="https://stimpunks.org/volunteer/#h-volunteer-form"' not in body:
    refuse(f"{ROOM.name}: no link to the volunteer form on stimpunks.org, and the room says that is the way in.")

sec = re.search(r"/\* §130 ── ROOM: Volunteers.*?(?=/\* §131 )", CSS.read_text(), re.S)
if not sec:
    refuse("love.css has no §130 for Volunteers before §131.")
elif re.search(r"@keyframes|\banimation\s*:|\btransition\s*:", re.sub(r"/\*.*?\*/", " ", sec.group(0), flags=re.S)):
    refuse("love.css §130: a keyframe, an animation or a transition. Nothing on the loom moves at any setting.")

text = re.sub(r"<(script|style)\b.*?</\1>", " ", body, flags=re.S)
text = re.sub(r"<blockquote\b.*?</blockquote>", " ", text, flags=re.S)
text = re.sub(r"<head\b.*?</head>", " ", text, flags=re.S)
text = html.unescape(fold(re.sub(r"<[^>]+>", " ", text)))
sweep(text, ROOM.name)
if problems:
    raise SystemExit("REFUSING, on the published page:\n  " + "\n  ".join(problems))

longest = max(len(q["text"].split()) for q in quotes.values())
print(f"volunteers: a cloth of {len(helps)} bands, {len(playbooks)} playbooks, {len(quotes)} quotations "
      f"in {ROOM.name}")
print(f"  longest quotation {longest} words against a cap of {cap}; "
      + ("every one checked against the mirror word for word" if mirror_ok
         else "the Knowledge System mirror is not on this machine, so the quotations were not re-read"))
print("  nothing counted, nobody owed, nobody a hero, and no lyric")
