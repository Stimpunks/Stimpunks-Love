#!/usr/bin/env python3
"""Build Coping's eye, its sections, its doors and its credits, from data/coping.json.

ONE DATA FILE, ONE TOOL, TWO SURFACES, the contract make-yells.py set. Coping is
a shopfront on the street in the eye of the storm (Ryan's brief, 2026-10-24): a
room that synthesizes and summarizes three pages from our Regulation and Coping
hub on stimpunks.org, Seeds of Cope, The Science of Cope and Cope Is Not an
Insult, with its channel on the CB under Community on the chat page, and doors
to the other rooms on the street for coping, regulation and peer support. This
tool writes, between cop:<part> markers in coping.html:

  · THE EYE (cop:eye): a wall of storm cloud standing all the way round, white
    where the sun lands on it and slate at its foot where the rain is, the
    clear sky straight up, and the dry floor of the eye in the sun, with a few
    doors standing on it. From a fixed seed, so it is the same storm every build.
  · RIGHT NOW (cop:now), THE COPE MAP (cop:map), THE SEEDS (cop:seeds), THE
    WORDS TO BORROW (cop:scripts), THE SCIENCE (cop:science) and COPE IS NOT AN
    INSULT (cop:insult), block by block.
  · THE DOORS (cop:doors), WHAT IS NOT IN THE EYE (cop:rules), WHO READS THE
    CHANNEL AND FOR HOW LONG (cop:channel) and THE CREDITS (cop:credits), with a
    table of the quotations in liner-notes.html.

WHAT IT REFUSES:

  · GRIT, THE SNEER, MISREADING, ANYTHING CLINICAL, A TALLY AND TOXIC POSITIVITY
    in the room's own words, each with the negation window so the room can still
    say it will not. The sweep SKIPS BLOCKQUOTES, the cope map and the works our
    science page names, which are all our pages' words, and anything in curly
    quotes, because a page arguing against a word has to be allowed to contain
    it ("They are not “malfunctioning.”"). See the _no_ notes in the data.
  · ADVICE NOBODY ASKED FOR in the coercive second-person shapes, and pity:
    you should, you must, you need to, have you tried; brave, inspiring,
    suffering from. A coping room is a toolkit, and our page offers it as
    "Pick one"; the room never turns that into an order.
  · THE PAGE WITHOUT ITS CRISIS PARAGRAPH, before the first heading: the words
    "not clinical advice" and "not a crisis line", our page's line about
    calling your local emergency number, and links to our Help page and to
    Coping's crisis lines.
  · A QUOTATION over the cap, with an HTML entity in it, or read off anything
    but one of our pages in `pages`. AND, WHERE THE KNOWLEDGE SYSTEM MIRROR IS ON
    THE MACHINE, ONE THAT IS NOT ON THAT PAGE WORD FOR WORD; the cope map, the
    scripts, the doors' group names and the works the science page names are
    held the same way. The comparison takes Markdown's links, emphasis and list
    and quote markers off the mirror's copy and folds the spaces, and nothing
    else. Where the mirror is missing (any machine but Ryan's), it says so and
    carries on, make-coworking.py's arrangement.
  · A GLOSSARY LINK the data does not list, or one the mirror has no entry for
    at that address, because on stimpunks.org a redirect is a failure.
  · A DOOR THAT IS NOT THIS ROOM'S DRAWING. Every door is drawn here, in this
    room's inks, told apart by its form, the campground board's rule. Two
    doors with one form, a form with no drawing, a door to a page that is not
    there, to this room, or to a room that keeps to itself (its address would be
    on a public page), and a door whose room no longer says what the door says
    about it: each carries `holds`, words on that room's published page, the
    Community Center's service-board rule. The door's name is read off the
    room's own <title>, so a renamed room renames its door.
  · A COLOUR IN THE DRAWINGS THAT love.css DOES NOT DECLARE.
  · ANYTHING THAT MOVES BY ITSELF: a keyframe, an animation or a transition in
    §126. Nothing in the eye moves at any setting, MAX GLITTER included.
  · A FORM, AN INPUT, A TEXTAREA OR ANYTHING EDITABLE outside the job marker,
    and any script but love.js and quest.js. Nothing on the page takes words or
    keeps anything; the friendly edit to a coping room is a mood tracker.
  · A MISSING MARKER PAIR. A generator that writes nothing and exits 0 is how
    two surfaces drift apart.

WHAT IT DOES NOT CHECK, on purpose: how many doors there are. The street keeps
growing, and so can the floor of the eye.
"""
import html
import json
import math
import random
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data/coping.json"
ROOM = ROOT / "coping.html"
NOTES = ROOT / "liner-notes.html"
CSS = ROOT / "love.css"
FORUM = ROOT / "data/forum.json"
LIB = ROOT / "netlify/cb/lib.mjs"
FACES = ROOT / "data/foundry-faces.json"
MIRROR = Path.home() / "Documents/Claude/Projects/Stimpunks Knowledge System/site/stimpunks.org"

ENTITY = re.compile(r"&(?:[a-zA-Z][a-zA-Z0-9]{1,31}|#\d{1,6}|#x[0-9a-fA-F]{1,6});")
LINK = re.compile(r"\[([^\]]+)\]\(([^)\s]+)\)")
BOLD = re.compile(r"\*\*([^*]+)\*\*")

NEGATION = (r"(?:no|not|nothing|never|neither|none|without|refuses?|refused|refusing|"
            r"cannot|does not|won't|will not|is not|are not|isn't|aren't|nobody|nor|declin\w+)")

GRIT = (r"resilien\w*|grit\b|gritty|toughen\w*|tough it out|push(?:es|ed|ing)? through|"
        r"power(?:s|ed|ing)? through|mental toughness|bounce back|man up|suck it up|"
        r"stiff upper lip|no pain,? no gain|hustle\w*")
SNEER = r"cope harder|cope and seethe|seeth(?:e|es|ing)|copelord"
MISREAD = (r"maladaptive|malfunction\w*|attention[- ]seeking|manipulative|non-?complian\w*|"
           r"problem behaviou?rs?|behaviou?ral problems?|defian(?:t|ce)|over-?react\w*|"
           r"over-?sensitive|lazy|laziness|weak|weakness|fragile|fragility|melodramatic|"
           r"self-indulgent")
CLINICAL = (r"cures?|cured|curing|treat(?:s|ed|ing|ment|ments)?|therap(?:y|ies|ist|ists|eutic)|"
            r"diagnos\w+|prescri\w+|symptoms?|disorders?|clinically|evidence-based|proven to")
# make-dead-tired.py's TALLY, narrowed `points` and all, plus what a coping room
# grows. "count" alone is not here: "nobody is counting" is a door's line.
TALLY = (r"mood track\w*|track(?:s|ed|ing)? (?:your|my) (?:mood|moods|feelings|days)|"
         r"habit track\w*|streaks?|scores?|scored|scoring|leaderboards?|progress bar|"
         r"levels? up|days since|check-ins? that remembers?|tall(?:y|ies)|tallied|"
         r"badges? (?:earned|awarded)|achievements?|\d+\s*points?")
POSITIVITY = (r"calm down|cheer up|bright side|silver linings?|everything happens for a reason|"
              r"could be worse|good vibes|positive vibes|positive thinking|stay positive|"
              r"count your blessings|just breathe|just relax|smile more|get over it|snap out of it|"
              r"all in your head")
ADVICE = (r"you should|you must|you need to|you have to|have you tried|make sure (?:you|to)|"
          r"don'?t forget to|remember to|it'?s important to|learn to")
PITY = r"brave|bravery|courageous|inspir(?:ing|ational)|suffer(?:s|ing)? from|sufferers?"

SWEEPS = [
    (GRIT, "no grit: our manifesto takes cope back from the grit stories. See _no_grit."),
    (SNEER, "no sneer. See _no_sneer."),
    (MISREAD, "nobody here is misread as malfunctioning. See _no_misreading."),
    (CLINICAL, "nothing in this room is clinical. See _not_clinical."),
    (TALLY, "nothing in this room is counted or kept. See _no_tally."),
    (POSITIVITY, "nobody here is told to calm down or cheer up. See _no_positivity."),
    (ADVICE, "no order nobody asked for, in the shapes make-dead-tired.py refuses."),
    (PITY, "nobody here is pitied or called brave for coping, Laughingstock's rule."),
]
SWEEPS = [(re.compile(rf"\b(?:{p})\b", re.I),
           re.compile(rf"\b{NEGATION}\b[^.]{{0,70}}?\b(?:{p})\b", re.I), why) for p, why in SWEEPS]

SCRIPTS = {"love.js", "quest.js"}
DANGER = "If you are in danger, or feel like you might hurt yourself, call your local emergency number."

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
    footnote markers, link targets, emphasis, list markers and blockquote
    markers."""
    s = re.sub(r"!\[[^\]]*\]\([^)]*\)", " ", s)
    s = re.sub(r"\[\d+\]\(#[^)]*\)", "", s)
    s = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", s)
    s = s.replace("**", "").replace("*", "")
    s = re.sub(r"^\s*>\s?", "", s, flags=re.M)
    s = re.sub(r"^\s*-\s+", "", s, flags=re.M)
    return fold(s)


def unquoted(text):
    """Our words with anything in curly quotes taken out: a quoted word is
    somebody saying it, which is what the room argues with."""
    return re.sub(r"“[^”]*”", " ", str(text))


def sweep(text, where):
    text = unquoted(text)
    for rx, ok, why in SWEEPS:
        for m in rx.finditer(text):
            window = text[max(0, m.start() - 80):m.end()]
            if ok.search(window):
                continue
            refuse(f"{where}: {m.group(0)!r} -- {why}")


GLOSSARY = re.compile(r"^https://stimpunks\.org/glossary/([a-z0-9-]+)/$")


def ours(text, where):
    """Our own words: no entity, a link only to a page of ours or one that can
    be checked, every glossary link listed and in the mirror, swept for the
    room's refusals."""
    text = str(text)
    if ENTITY.search(text):
        refuse(f"{where}: carries an HTML entity. Everything is escaped on the way in; write the character.")
    for _, url in LINK.findall(text):
        g = GLOSSARY.match(url)
        if g:
            if g.group(1) not in glossary:
                refuse(f"{where}: links the glossary's {g.group(1)!r}, which `glossary` does not list.")
        elif not (url.startswith("https://") or re.match(r"^[a-z0-9-]+\.html(?:#[\w/=-]*)?$", url)):
            refuse(f"{where}: {url!r} is neither an https address nor a page of ours.")
    sweep(BOLD.sub(r"\1", LINK.sub(r"\1", text)), where)


def linked(text):
    """Escape, then make [words](address) a link and **words** bold. The
    brackets and stars survive escaping."""
    out = LINK.sub(lambda m: f'<a href="{attr(html.unescape(m.group(2)))}">{m.group(1)}</a>', esc(text))
    return BOLD.sub(r"<b>\1</b>", out)


def css_root():
    src = CSS.read_text()
    root = src[src.index(":root {"):src.index("\n}", src.index(":root {"))]
    root = re.sub(r"/\*.*?\*/", " ", root, flags=re.S)
    return dict(re.findall(r"(--[a-z0-9-]+):\s*(#[0-9A-Fa-f]{6})", root))


# ── The data ─────────────────────────────────────────────────────────────────
d = json.loads(DATA.read_text())
pages = d.get("pages") or {}
quotes = d.get("quotes") or {}
glossary = set(d.get("glossary") or [])
cap = int(d.get("words") or 0)
if not cap:
    refuse("data/coping.json has no `words` cap, and the room prints one.")

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

if mirror_ok:
    for slug in sorted(glossary):
        f = MIRROR / "glossary" / f"{slug}.md"
        m = re.search(r'^url:\s*"([^"]+)"', f.read_text(), re.M) if f.is_file() else None
        if not m or m.group(1) != f"https://stimpunks.org/glossary/{slug}/":
            refuse(f"glossary: the mirror has no entry at https://stimpunks.org/glossary/{slug}/, and a "
                   "redirect there is a failure. Check the slug against the mirror.")


def held(text, key, where):
    """Our page's words in this room's mouth: on that page word for word."""
    if mirror_ok and key in mirror_text and fold(text) not in mirror_text[key]:
        refuse(f"{where}: {text!r} is not on {pages[key]['url']} word for word. Re-copy it from our page; "
               "never loosen the check.")


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
    if q.get("read_on") not in pages:
        refuse(f"{where}: `read_on` is not one of `pages`, and every quotation here was read on a page of ours.")
    if ENTITY.search(text):
        refuse(f"{where}: carries an HTML entity.")
    held(text, q.get("read_on"), where)


def blocks(bs, where):
    for j, b in enumerate(bs, 1):
        w = f"{where} block {j}"
        if "q" in b:
            if b["q"] not in quotes:
                refuse(f"{w}: quotes {b['q']!r}, which is not in `quotes`.")
            used.add(b["q"])
        elif "p" in b:
            ours(b["p"], w)
        elif "h3" in b:
            ours(b["h3"], w)
        elif "ladder" in b:
            steps = b["ladder"]
            if len(steps) < 2:
                refuse(f"{w}: a ladder with nowhere to go.")
            line = "From " + " → to ".join(steps) + "."
            held(line, "insult", w)
        else:
            refuse(f"{w}: a block is a q, a p, an h3 or a ladder, and this is none of them.")


now = d.get("now") or {}
for i, g in enumerate(now.get("groups") or [], 1):
    for need in ("name", "line"):
        if not str(g.get(need, "")).strip():
            refuse(f"now group {i}: no {need}.")
    ours(g.get("name", ""), f"now group {i}")
    ours(g.get("line", ""), f"now group {i}")
blocks(now.get("after") or [], "now.after")
used.add("pick")

cmap = d.get("map") or {}
held(cmap.get("root", ""), "seeds", "map.root")
for i, br in enumerate(cmap.get("branches") or [], 1):
    held(br.get("q", ""), "seeds", f"map branch {i}")
    held(br.get("a", ""), "seeds", f"map branch {i}")
used.update({"not_psych"})

seed_ids = []
for i, s in enumerate(d.get("seeds") or [], 1):
    where = f"seed {s.get('id', i)}"
    for need in ("id", "name", "line", "q"):
        if not str(s.get(need, "")).strip():
            refuse(f"{where}: no {need}.")
    if s.get("q") not in quotes:
        refuse(f"{where}: quotes {s.get('q')!r}, which is not in `quotes`.")
    used.add(s.get("q"))
    ours(s.get("name", ""), where)
    ours(s.get("line", ""), where)
    seed_ids.append(s.get("id"))
blocks(d.get("seeds_after") or [], "seeds_after")
used.add("plant")

for i, g in enumerate(d.get("scripts") or [], 1):
    ours(g.get("group", ""), f"scripts group {i}")
    for line in g.get("lines") or []:
        held(line, "seeds", f"scripts group {i}")
used.add("scripts")

sci = d.get("science") or {}
blocks(sci.get("open") or [], "science.open")
blocks(sci.get("close") or [], "science.close")
for i, pt in enumerate(sci.get("points") or [], 1):
    where = f"science point {i}"
    ours(pt.get("name", ""), where)
    ours(pt.get("line", ""), where)
    for qid in pt.get("q") or []:
        if qid not in quotes:
            refuse(f"{where}: quotes {qid!r}, which is not in `quotes`.")
        used.add(qid)
ours(sci.get("sources_line", ""), "science.sources_line")
for s in sci.get("sources") or []:
    held(s, "science", "science.sources")

blocks(d.get("insult") or [], "insult")
ours(d.get("doors_line", ""), "doors_line")
for i, r in enumerate(d.get("not_here") or [], 1):
    for need in ("name", "line"):
        if not str(r.get(need, "")).strip():
            refuse(f"not_here {i}: no {need}.")
    ours(r.get("name", ""), f"not_here {i}")
    ours(r.get("line", ""), f"not_here {i}")

used.update({"kit", "system_not_you", "share"})
for qid in quotes:
    if qid not in used:
        refuse(f"quote {qid}: in the data and printed nowhere, so its credit would claim a line the room does not print.")


# ── The doors ────────────────────────────────────────────────────────────────

def page_text(p):
    src = p.read_text()
    main = re.search(r"<main\b.*?</main>", src, re.S)
    t = re.sub(r"<(script|style)\b.*?</\1>", " ", main.group(0) if main else "", flags=re.S)
    return fold(html.unescape(re.sub(r"<[^>]+>", " ", t))).lower()


def page_name(p):
    m = re.search(r"<title>(.*?)</title>", p.read_text(), re.S)
    name = html.unescape(m.group(1)) if m else ""
    return re.sub(r"\s+[—-]\s+Stimpunks\.World\s*$", "", name).strip()


door_forms = []
door_rows = []
for gi, grp in enumerate(d.get("doors") or [], 1):
    gw = f"doors group {gi}"
    held(grp.get("moment", ""), "seeds", gw)
    if grp.get("seed") not in seed_ids:
        refuse(f"{gw}: points at seed {grp.get('seed')!r}, which `seeds` does not have.")
    ours(grp.get("line", ""), gw)
    if not grp.get("doors"):
        refuse(f"{gw}: a group with no doors in it.")
    for door in grp.get("doors") or []:
        where = f"door to {door.get('page')}"
        p = ROOT / str(door.get("page", ""))
        if door.get("page") == ROOM.name:
            refuse(f"{where}: a door from this room to this room.")
            continue
        if not p.is_file():
            refuse(f"{where}: no such page.")
            continue
        if re.search(r"<body\b[^>]*\bdata-unlisted\b", p.read_text()):
            refuse(f"{where}: that room keeps to itself, and a door here would publish its address.")
        ours(door.get("line", ""), where)
        text = page_text(p)
        if not door.get("holds"):
            refuse(f"{where}: no holds. A door says what a room is for, so it names the words there that carry it.")
        for w in door.get("holds") or []:
            if fold(w).lower() not in text:
                refuse(f"{where}: that room no longer says {w!r}, and this door says it on its behalf. Change "
                       "the door's line with the room, and its holds with it.")
        door_forms.append(door.get("form"))
        door_rows.append((grp, door, page_name(p)))

for f in set(door_forms):
    if door_forms.count(f) > 1:
        refuse(f"doors: two doors are {f!r}. Every door on the floor of the eye is its own form.")

if problems:
    raise SystemExit("REFUSING to build Coping:\n  " + "\n  ".join(problems))


# ── The drawings ─────────────────────────────────────────────────────────────

def num(v):
    return f"{v:.1f}".rstrip("0").rstrip(".")


INK = 'stroke="var(--cop-ink)"'


def sun(path):
    """The sun is straight overhead, so the top of everything is where it lands."""
    return f'<path d="{path}" fill="none" stroke="var(--cop-sun)" stroke-width="5" stroke-linecap="round"/>'


def frame(x=24, y=22, w=72, h=154):
    return (f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="var(--cop-billow)" {INK} '
            f'stroke-width="2.4" stroke-linejoin="round"/>')


def leaf(x=30, y=28, w=60, h=148, fill="var(--cop-cloud)"):
    return (f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{fill}" {INK} stroke-width="2" '
            f'stroke-linejoin="round"/>')


def knob(x=80, y=112):
    return f'<circle cx="{x}" cy="{y}" r="3.6" fill="var(--cop-ink)"/>'


TOP = sun("M24 22 H96")


def door_lift():
    # Two leaves that slide, and the arrow over them pointing down: the lift
    # to the bottom of the caverns.
    return (frame() + leaf(30, 46, 30, 130) + leaf(60, 46, 30, 130) +
            f'<rect x="48" y="28" width="24" height="12" rx="2" fill="var(--cop-cloud)" {INK} stroke-width="1.6"/>'
            f'<path d="M55 31 H65 L60 37 Z" fill="var(--cop-ink)"/>' + TOP)


def door_padded():
    # Quilted and buttoned, a door you could lean on: the room to come down in.
    lattice = "".join(f'<path d="M{30 + k * 15} 28 L{30 + k * 15 - 60} 176 M{30 + k * 15 - 60} 28 L{30 + k * 15} 176" />'
                      for k in range(0, 9))
    buttons = "".join(f'<circle cx="{num(x)}" cy="{num(y)}" r="1.8" fill="var(--cop-ink)"/>'
                      for y in range(46, 176, 30) for x in (45, 75))
    return (frame() + leaf() +
            '<clipPath id="cop-pad"><rect x="30" y="28" width="60" height="148"/></clipPath>'
            f'<g clip-path="url(#cop-pad)" fill="none" stroke="var(--cop-tower)" stroke-width="1.2">{lattice}</g>'
            + buttons + f'<rect x="80" y="100" width="5" height="22" rx="2" fill="var(--cop-ink)"/>' + TOP)


def door_round():
    # A round door with its knob in the middle, the burrow's.
    planks = "".join(f'<path d="M{x} 80 V176"/>' for x in (44, 52, 60, 68, 76))
    return (f'<circle cx="60" cy="130" r="46" fill="var(--cop-billow)" {INK} stroke-width="2.4"/>'
            f'<circle cx="60" cy="130" r="38" fill="var(--cop-cloud)" {INK} stroke-width="2"/>'
            '<clipPath id="cop-round"><circle cx="60" cy="130" r="38"/></clipPath>'
            f'<g clip-path="url(#cop-round)" fill="none" stroke="var(--cop-tower)" stroke-width="1.4">{planks}</g>'
            + knob(60, 130) + sun("M20.2 107 A46 46 0 0 1 99.8 107"))


def door_cabin():
    # Planks, and a small window with the sky in it: the hermitage's.
    planks = "".join(f'<path d="M{x} 28 V176"/>' for x in (42, 54, 66, 78))
    return (frame() + leaf() +
            f'<g fill="none" stroke="var(--cop-tower)" stroke-width="1.4">{planks}</g>'
            f'<rect x="43" y="42" width="34" height="28" fill="var(--cop-sky)" {INK} stroke-width="2"/>'
            f'<path d="M60 42 V70 M43 56 H77" {INK} stroke-width="1.6"/>' + knob() + TOP)


def door_panelled():
    # Six panels and a brass knob, shut and unlocked, as every door at
    # Cavendish Coworking is.
    panels = "".join(f'<rect x="{x}" y="{y}" width="20" height="{h}" fill="var(--cop-billow)" {INK} stroke-width="1.4"/>'
                     for x in (36, 64) for y, h in ((36, 30), (74, 44), (126, 40)))
    return frame() + leaf() + panels + knob(84, 116) + TOP


def door_leafy():
    # An arched door with leaves hanging over the arch: the canopy's.
    arch = "M30 176 V70 A30 30 0 0 1 90 70 V176 Z"
    outer = "M24 176 V70 A36 36 0 0 1 96 70 V176 Z"
    leaves = "".join(
        f'<ellipse cx="{num(60 + 36 * math.cos(a))}" cy="{num(70 + 36 * math.sin(a) + 6)}" rx="5.5" ry="11" '
        f'transform="rotate({num(math.degrees(a) + 90)} {num(60 + 36 * math.cos(a))} {num(70 + 36 * math.sin(a) + 6)})" '
        f'fill="var(--cop-ink)"/>'
        for a in (math.radians(t) for t in (-170, -140, -112, -68, -40, -10)))
    return (f'<path d="{outer}" fill="var(--cop-billow)" {INK} stroke-width="2.4" stroke-linejoin="round"/>'
            f'<path d="{arch}" fill="var(--cop-cloud)" {INK} stroke-width="2" stroke-linejoin="round"/>'
            + sun("M28 58 A36 36 0 0 1 92 58") + leaves + knob(80, 120))


def door_louvred():
    # Slats all the way down, to let the air through: the hall of fans.
    slats = "".join(f'<path d="M36 {y} H84"/>' for y in list(range(40, 100, 7)) + list(range(116, 170, 7)))
    return (frame() + leaf() +
            f'<rect x="34" y="36" width="52" height="66" fill="none" {INK} stroke-width="1.4"/>'
            f'<rect x="34" y="112" width="52" height="58" fill="none" {INK} stroke-width="1.4"/>'
            f'<g fill="none" stroke="var(--cop-tower)" stroke-width="2.2">{slats}</g>' + TOP)


def door_starlit():
    # A star for a window, lit: the glow shop's.
    pts = []
    for k in range(10):
        r = 17 if k % 2 == 0 else 7
        a = math.radians(-90 + k * 36)
        pts.append(f"{num(60 + r * math.cos(a))} {num(70 + r * math.sin(a))}")
    return (frame() + leaf() +
            f'<path d="M{" L".join(pts)} Z" fill="var(--cop-sun)" {INK} stroke-width="1.8" stroke-linejoin="round"/>'
            + knob() + TOP)


def door_stable():
    # A stable door with its top half open: the Playhouse's, where you lean
    # in. The opening is dark because the room behind is its own.
    return (frame() +
            f'<rect x="30" y="28" width="60" height="70" fill="var(--cop-ink)"/>'
            f'<path d="M30 28 L14 20 V96 L30 98 Z" fill="var(--cop-cloud)" {INK} stroke-width="2" stroke-linejoin="round"/>'
            + leaf(30, 100, 60, 76) +
            f'<rect x="26" y="96" width="68" height="7" fill="var(--cop-billow)" {INK} stroke-width="1.8"/>'
            + knob(80, 136) + TOP)


def door_numbered():
    # A hotel door with a number plate and a peephole: room 429. The plate
    # carries no number, because the drawing carries no word.
    return (frame() + leaf() +
            f'<rect x="51" y="52" width="18" height="10" rx="1.5" fill="var(--cop-billow)" {INK} stroke-width="1.4"/>'
            f'<circle cx="60" cy="78" r="2.6" fill="var(--cop-ink)"/>'
            f'<path d="M78 112 H88" {INK} stroke-width="4" stroke-linecap="round"/>' + TOP)


def door_glazed():
    # A café door, glass nearly to the floor and a bar across it to push.
    return (frame() + leaf() +
            f'<rect x="38" y="38" width="44" height="80" fill="var(--cop-sky)" {INK} stroke-width="1.8"/>'
            f'<path d="M46 60 L62 44 M46 78 L72 52" stroke="var(--cop-cloud)" stroke-width="2" stroke-linecap="round"/>'
            f'<rect x="34" y="126" width="52" height="6" rx="3" fill="var(--cop-billow)" {INK} stroke-width="1.6"/>'
            f'<rect x="30" y="150" width="60" height="26" fill="var(--cop-billow)" {INK} stroke-width="1.6"/>'
            + TOP)


def door_sheltered():
    # A door with a hood over it, scalloped like an umbrella's hem: the room
    # roofed with everybody's umbrellas.
    hem = "".join(f" Q{x + 8} 30 {x + 16} 22" for x in range(14, 106, 16))
    return (frame() + leaf() +
            f'<path d="M14 22 L22 8 H98 L106 22{hem}" fill="var(--cop-billow)" {INK} stroke-width="2" stroke-linejoin="round"/>'
            f'<path d="M60 28 V176" {INK} stroke-width="1.4"/>' + knob(72, 112) + knob(48, 112)
            + sun("M22 8 H98"))


def door_ajar():
    # A door left ajar on a dark room: anybody can find it and leave by it,
    # and nobody has to sit in the light.
    return (frame() +
            f'<rect x="30" y="28" width="60" height="148" fill="var(--cop-ink)"/>'
            f'<path d="M30 28 L50 36 V168 L30 176 Z" fill="var(--cop-cloud)" {INK} stroke-width="2" stroke-linejoin="round"/>'
            + knob(45, 108) + TOP)


DOORS = {
    "lift": door_lift, "padded": door_padded, "round": door_round, "cabin": door_cabin,
    "panelled": door_panelled, "leafy": door_leafy, "louvred": door_louvred, "starlit": door_starlit,
    "stable": door_stable, "numbered": door_numbered,
    "glazed": door_glazed, "sheltered": door_sheltered, "ajar": door_ajar,
}
for f in door_forms:
    if f not in DOORS:
        refuse(f"doors: no drawing for the form {f!r}. Draw it in DOORS, in this room's inks, first.")


def door_art(form, uid):
    body = DOORS[form]().replace('id="cop-', f'id="cop-{uid}-').replace('url(#cop-', f'url(#cop-{uid}-')
    return ('<svg class="cop-door__art" viewBox="0 0 120 190" aria-hidden="true" focusable="false">'
            '<ellipse cx="60" cy="179" rx="40" ry="4" fill="var(--cop-shade)"/>'
            f'{body}</svg>')


# THE EYE. A wall of cloud all the way round, seen from the floor of the eye:
# nearer at the sides, so taller there, and furthest at the middle, so the sky
# hangs down into the middle of the picture like the inside of a bowl.
W, H = 1200, 420
rng = random.Random(d["eye"]["seed"])


def u(x):
    return (x - W / 2) / (W / 2)


def top(x):
    return 34 + 150 * (1 - u(x) ** 2)


def base(x):
    return 300 + 84 * u(x) ** 2


def band(f, wobble, phase):
    """A line a fraction f of the way down the wall, wavering a little."""
    pts = []
    for x in range(-20, W + 41, 20):
        y = top(x) + f * (base(x) - top(x)) + wobble * math.sin(x / 47 + phase) + wobble * .5 * math.sin(x / 19 + phase * 2)
        pts.append((x, y))
    return pts


def area(upper):
    path = "M" + " L".join(f"{num(x)} {num(y)}" for x, y in upper)
    lower = [(x, base(x)) for x in range(W + 40, -21, -20)]
    return path + " L" + " L".join(f"{num(x)} {num(y)}" for x, y in lower) + " Z"


billows, caps, towers, tower_caps = [], [], [], []
x = -30.0
while x < W + 40:
    r = (22 + 30 * rng.random()) * (1 + .7 * u(x) ** 2)
    cy = top(x) + r * .55
    billows.append(f'<circle cx="{num(x)}" cy="{num(cy)}" r="{num(r)}"/>')
    caps.append(f'<circle cx="{num(x + r * .06)}" cy="{num(cy - r * .2)}" r="{num(r * .8)}"/>')
    x += r * (.9 + .3 * rng.random())
x = -10.0
while x < W + 40:
    r = (14 + 20 * rng.random()) * (1 + .6 * u(x) ** 2)
    cy = top(x) + .42 * (base(x) - top(x)) + r * .3
    towers.append(f'<circle cx="{num(x)}" cy="{num(cy)}" r="{num(r)}"/>')
    tower_caps.append(f'<circle cx="{num(x + r * .05)}" cy="{num(cy - r * .22)}" r="{num(r * .78)}"/>')
    x += r * (1.1 + .5 * rng.random())

rain = []
for k in range(0, W + 60, 23):
    xx = k + 10 * rng.random()
    rain.append(f'<path d="M{num(xx)} 230 l-14 170"/>')

wall = area([(x, top(x) + 20) for x in range(-20, W + 41, 20)])
mid = area(band(.45, 5, .3))
foot = area(band(.74, 4, 1.7))
storm = area(band(.88, 3, 2.9))
floor = ("M-20 " + num(base(-20)) + " " + " ".join(f"L{num(x)} {num(base(x))}" for x in range(0, W + 41, 20))
         + f" L{W + 40} {H + 20} L-20 {H + 20} Z")

little = []
for i, dx in enumerate(d["eye"]["doors"]):
    near = (dx - W / 2) / (W / 2)
    h = 46 - 10 * abs(near) + (4 if i % 2 else 0)
    w = h * .5
    fy = 404 - 8 * abs(near) + (6 if i % 2 else 0)
    left = dx - w / 2
    shape = ["rect", "arch", "rect", "round", "arch"][i % 5]
    if shape == "rect":
        outline = f"M{num(left)} {num(fy)} V{num(fy - h)} H{num(left + w)} V{num(fy)} Z"
        lit = f"M{num(left)} {num(fy - h)} H{num(left + w)}"
    elif shape == "arch":
        outline = (f"M{num(left)} {num(fy)} V{num(fy - h + w / 2)} A{num(w / 2)} {num(w / 2)} 0 0 1 "
                   f"{num(left + w)} {num(fy - h + w / 2)} V{num(fy)} Z")
        lit = f"M{num(left + 1)} {num(fy - h + w / 2 - 4)} A{num(w / 2)} {num(w / 2)} 0 0 1 {num(left + w - 1)} {num(fy - h + w / 2 - 4)}"
    else:
        rr = w * .62
        outline = f"M{num(dx - rr)} {num(fy)} A{num(rr)} {num(rr)} 0 1 1 {num(dx + rr)} {num(fy)} Z"
        lit = f"M{num(dx - rr * .8)} {num(fy - rr * 1.55)} A{num(rr)} {num(rr)} 0 0 1 {num(dx + rr * .8)} {num(fy - rr * 1.55)}"
    little.append(f'<ellipse cx="{num(dx)}" cy="{num(fy + 1.5)}" rx="{num(w * .7)}" ry="2.6" fill="var(--cop-shade)"/>'
                  f'<path d="{outline}" fill="var(--cop-cloud)" {INK} stroke-width="1.8" stroke-linejoin="round"/>'
                  f'<path d="{lit}" fill="none" stroke="var(--cop-sun)" stroke-width="3" stroke-linecap="round"/>'
                  f'<circle cx="{num(dx + w * .26)}" cy="{num(fy - h * .44)}" r="1.4" fill="var(--cop-ink)"/>')

eye = (f'  <svg class="cop-eye" viewBox="0 0 {W} {H}" aria-hidden="true" focusable="false">'
       '<defs><linearGradient id="cop-sky-g" x1="0" y1="0" x2="0" y2="1">'
       '<stop offset="0" stop-color="var(--cop-zenith)"/><stop offset=".6" stop-color="var(--cop-sky)"/></linearGradient>'
       f'<clipPath id="cop-storm-clip"><path d="{storm}"/></clipPath>'
       '<clipPath id="cop-floor-clip"><path d="' + floor + '"/></clipPath></defs>'
       f'<rect x="0" y="0" width="{W}" height="{H}" fill="url(#cop-sky-g)"/>'
       f'<path d="{wall}" fill="var(--cop-billow)"/>'
       f'<g fill="var(--cop-billow)">{"".join(billows)}</g><g fill="var(--cop-cloud)">{"".join(caps)}</g>'
       f'<path d="{mid}" fill="var(--cop-tower)"/>'
       f'<g fill="var(--cop-tower)">{"".join(towers)}</g><g fill="var(--cop-billow)" opacity=".75">{"".join(tower_caps)}</g>'
       f'<path d="{foot}" fill="var(--cop-foot)"/>'
       f'<path d="{storm}" fill="var(--cop-storm)"/>'
       f'<g clip-path="url(#cop-storm-clip)" fill="none" stroke="var(--cop-rain)" stroke-width="1.2" '
       f'stroke-linecap="round" opacity=".55">{"".join(rain)}</g>'
       f'<path d="{floor}" fill="var(--cop-shade)"/>'
       f'<g clip-path="url(#cop-floor-clip)"><ellipse cx="{W / 2}" cy="{H + 36}" rx="560" ry="112" '
       f'fill="var(--cop-floor)"/></g>'
       f'{"".join(little)}</svg>')

inks = css_root()
for drawing in [eye] + [DOORS[f]() for f in DOORS]:
    for name in set(re.findall(r"var\((--[a-z0-9-]+)\)", drawing)):
        if name not in inks:
            refuse(f"drawing: {name} is not declared in love.css's :root, and CSS paints nothing for it.")
if problems:
    raise SystemExit("REFUSING to draw Coping:\n  " + "\n  ".join(problems))


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


def page_link(key):
    pg = pages[key]
    return f'<a href="{attr(pg["url"])}">{esc(pg["title"])}</a>'


def quote(qid, cls="cop-quote", pad="    "):
    q = quotes[qid]
    return (f'{pad}<blockquote class="{cls}">\n'
            f'{pad}  <p>{esc(q["text"])}</p>\n'
            f'{pad}  <footer class="cop-quote__who">Stimpunks, {page_link(q["read_on"])}</footer>\n'
            f'{pad}</blockquote>')


def render(bs):
    out = []
    for b in bs:
        if "q" in b:
            out.append(quote(b["q"]))
        elif "p" in b:
            out.append(f'    <p>{linked(b["p"])}</p>')
        elif "h3" in b:
            out.append(f'    <h3>{linked(b["h3"])}</h3>')
        elif "ladder" in b:
            steps = "".join(f'<li class="cop-ladder__step"><span>{esc(s)}</span></li>' for s in b["ladder"])
            out.append(f'    <ol class="cop-ladder" aria-label="How far coping reaches, from the smallest to the '
                       f'largest">{steps}</ol>')
    return "\n".join(out)


swap(ROOM, "cop:eye", eye)
swap(ROOM, "cop:open", quote("kit") + "\n" + quote("system_not_you"), "    ")

groups = "\n".join(f'      <li class="cop-now__item">\n        <h3>{esc(g["name"])}</h3>\n'
                   f'        <p>{linked(g["line"])}</p>\n      </li>' for g in now["groups"])
swap(ROOM, "cop:now", quote("pick") + '\n    <ul class="cop-now">\n' + groups + "\n    </ul>\n"
     + render(now.get("after") or []), "    ")

branches = "\n".join(f'        <li><span class="cop-map__q">{esc(b["q"])}</span> '
                     f'<span class="cop-map__a"><span class="cop-map__to" aria-hidden="true">&rarr;</span> '
                     f'<span class="sr">What helps:</span> {esc(b["a"])}</span></li>' for b in cmap["branches"])
swap(ROOM, "cop:map", quote("not_psych") +
     '\n    <figure class="cop-map cop-quoted">\n'
     f'      <p class="cop-map__root">{esc(cmap["root"])}</p>\n'
     f'      <ul class="cop-map__branches">\n{branches}\n      </ul>\n'
     f'      <figcaption class="cop-quote__who">The cope map, from Stimpunks, {page_link("seeds")}</figcaption>\n'
     '    </figure>', "    ")

seed_rows = []
for s in d["seeds"]:
    seed_rows.append(f'      <li class="cop-seed" id="cop-seed-{attr(s["id"])}">\n'
                     f'        <h3>{esc(s["name"])}</h3>\n'
                     f'        <p>{linked(s["line"])}</p>\n'
                     + quote(s["q"], "cop-quote cop-quote--seed", "        ")
                     + '\n      </li>')
swap(ROOM, "cop:seeds", quote("plant") + '\n    <ol class="cop-seeds">\n' + "\n".join(seed_rows)
     + "\n    </ol>\n" + render(d.get("seeds_after") or []), "    ")

script_rows = []
for g in d["scripts"]:
    lines = "\n".join(f'          <blockquote class="cop-script"><p>{esc(t)}</p></blockquote>' for t in g["lines"])
    script_rows.append(f'      <li class="cop-scripts__group">\n        <h3>{esc(g["group"])}</h3>\n{lines}\n      </li>')
swap(ROOM, "cop:scripts", quote("scripts") + '\n    <ul class="cop-scripts">\n' + "\n".join(script_rows)
     + "\n    </ul>\n"
     f'    <p class="cop-quote__who">Every one of them from Stimpunks, {page_link("seeds")}.</p>', "    ")

points = []
for i, pt in enumerate(sci["points"], 1):
    qs = "\n".join(quote(qid, "cop-quote cop-quote--point", "        ") for qid in pt.get("q") or [])
    points.append(f'      <li class="cop-point">\n        <h3>{esc(pt["name"])}</h3>\n'
                  f'        <p>{linked(pt["line"])}</p>\n{qs}\n      </li>')
sources = "\n".join(f"        <li>{esc(s)}</li>" for s in sci["sources"])
swap(ROOM, "cop:science", render(sci["open"]) + '\n    <ol class="cop-points">\n' + "\n".join(points)
     + "\n    </ol>\n" + render(sci["close"]) + "\n"
     f'    <figure class="cop-sources cop-quoted">\n'
     f'      <figcaption>{linked(sci["sources_line"])}</figcaption>\n'
     f'      <ul>\n{sources}\n      </ul>\n    </figure>', "    ")

swap(ROOM, "cop:insult", render(d["insult"]), "    ")

door_groups = []
for grp in d["doors"]:
    seed = next(s for s in d["seeds"] if s["id"] == grp["seed"])
    cards = []
    for g2, door, name in door_rows:
        if g2 is not grp:
            continue
        uid = re.sub(r"\.html$", "", door["page"])
        cards.append(f'          <li><a class="cop-door" href="{attr(door["page"])}">'
                     f'{door_art(door["form"], uid)}'
                     f'<span class="cop-door__name">{esc(name)}</span>'
                     f'<span class="cop-door__line">{linked(door["line"][:1].upper() + door["line"][1:])}</span></a></li>')
    door_groups.append(f'      <li class="cop-moment" id="cop-doors-{attr(grp["seed"])}">\n'
                       f'        <h3>{esc(grp["moment"])}</h3>\n'
                       f'        <p>{linked(grp["line"])} <span class="cop-moment__seed">The seeds for it are '
                       f'<a href="#cop-seed-{attr(seed["id"])}">{esc(seed["name"])}</a>, up the page.</span></p>\n'
                       f'        <ul class="cop-doors">\n' + "\n".join(cards) + '\n        </ul>\n      </li>')
swap(ROOM, "cop:doors", f'    <p>{linked(d["doors_line"])}</p>\n    <ul class="cop-moments">\n'
     + "\n".join(door_groups) + "\n    </ul>\n" + quote("share"), "    ")

rules = [f'      <li><strong>{esc(r["name"])}</strong> {linked(r["line"])}</li>' for r in d["not_here"]]
swap(ROOM, "cop:rules", '    <ul class="cop-rules">\n' + "\n".join(rules) + "\n    </ul>", "    ")

# WHO READS THE CHANNEL AND FOR HOW LONG, read rather than typed: the hours out
# of lib.mjs's LIFE, and how long the forums keep a Coping topic out of
# data/forum.json, so neither goes quietly wrong when somebody changes it there.
life = re.search(r"export const LIFE = (\d+) \* 60 \* 60 \* 1000;", LIB.read_text())
if not life:
    raise SystemExit("REFUSING: netlify/cb/lib.mjs has no LIFE in hours, and the room says how long a message stays.")
cats = {c["slug"]: c for c in json.loads(FORUM.read_text())["categories"]}
if "coping" not in cats or not cats["coping"].get("keep"):
    raise SystemExit("REFUSING: data/forum.json has no coping category with a keep, and the room links it.")
channel = [
    "      <li><strong>Everybody signed on to the CB can read this room&rsquo;s channel</strong>, so say only what "
    "you would say in a room with all of them in it. It keeps "
    '<a href="community-center.html#cb-norms">the house norms</a>, like every channel.</li>',
    f"      <li><strong>Every message on it goes {life.group(1)} hours after it was sent</strong>, like every "
    "channel on the CB. For something that needs longer, "
    f'<a href="forum.html#/c/coping">Coping</a> in the forums keeps a topic {esc(cats["coping"]["keep"])} after its '
    "last post.</li>",
    "      <li><strong>Nobody on it is a professional</strong>, and nobody has to fix anything or answer. If you "
    'want people who can help with more than talk, <a href="community-care.html">Community Care</a> is the '
    "room for asking.</li>",
]
swap(ROOM, "cop:channel", '    <ul class="cop-rules">\n' + "\n".join(channel) + "\n    </ul>", "    ")

# THE CREDITS: whose every line is, the type read off its own record, and the cap.
faces = json.loads(FACES.read_text())["faces"]
display, text_face = faces["funnel-display"], faces["funnel-sans"]
if text_face["licence"] != display["licence"] or text_face["designer"] != display["designer"]:
    raise SystemExit("REFUSING: the two faces no longer share a designer and a licence, and the credit says both.")
read_on = ", ".join(page_link(k) for k in ("seeds", "science", "insult"))
credits = [
    f"      <li><strong>Seeds of Cope, The Science of Cope and Cope Is Not an Insult are Stimpunks&rsquo;</strong>, "
    f'three pages of the <a href="{attr(pages["hub"]["url"])}">Regulation and Coping hub</a> on stimpunks.org. '
    "Every quotation in this room is credited to the page it was read on, and the summaries around them are ours, "
    "written for this room as a way into the pages and never instead of them.</li>",
    "      <li><strong>The eye of the storm is ours</strong>, after our page&rsquo;s line about seeds you can grab "
    "in a storm and our manifesto&rsquo;s about micro-worlds of safety inside hostile terrain. It was drawn as code "
    "by Claude, an AI model made by Anthropic, to Ryan&rsquo;s brief, and so were the doors, which are this "
    "room&rsquo;s drawings and not the rooms&rsquo;. Nothing on this page calls an AI while you read it.</li>",
    f"      <li>Every quotation in this room is {cap} words or fewer and was read on one of our own pages, "
    f"{read_on}, on {esc(d['read'])}. <code>tools/make-coping.py</code> checks each one against those pages word "
    "for word whenever our copy of stimpunks.org is on the machine, and so it does the cope map, the words to "
    "borrow and the works our science page names.</li>",
    f"      <li>The type is {esc(display['family'])} for the room&rsquo;s name and its headings and "
    f"{esc(text_face['family'])} for everything you read, both by {esc(display['designer'])}, under the "
    f'{esc(display["licence"].replace(" 1.1", ""))}, read off their own records. One family at two sizes, '
    "because a room for steadying yourself does not change its voice between the sign and the page. More in "
    '<a href="liner-notes.html#coping">the liner notes</a>.</li>',
]
swap(ROOM, "cop:credits", '    <ul class="cop-credits">\n' + "\n".join(credits) + "\n    </ul>", "    ")

notes = []
for qid, q in quotes.items():
    notes.append(f'      <tr><td>{esc(q["text"])}</td><td>{page_link(q["read_on"])}</td>'
                 f'<td>{len(q["text"].split())} words</td></tr>')
swap(NOTES, "coping-credits", "\n".join(notes), "      ")


# ── The published page, checked ──────────────────────────────────────────────
# AFTER the write, so what is checked is what is published.
src = ROOM.read_text()
body = re.sub(r"<!-- quest:.*?:end -->", " ", src, flags=re.S)
body = re.sub(r"<!--.*?-->", " ", body, flags=re.S)

for tag in re.findall(r"<(form|input|textarea|select)\b", body, re.I):
    refuse(f"{ROOM.name}: a <{tag}> outside the job marker. Nothing in this room takes words or keeps anything.")
if re.search(r"contenteditable", body, re.I):
    refuse(f"{ROOM.name}: something editable outside the job marker.")
for s in re.findall(r'<script\b[^>]*\bsrc="([^"]+)"', src):
    if s not in SCRIPTS:
        refuse(f"{ROOM.name}: loads {s}, and the room runs {', '.join(sorted(SCRIPTS))} and nothing else.")

head = body.split("<h2", 1)[0]
head_text = html.unescape(fold(re.sub(r"<[^>]+>", " ", head)))
if not re.search(r"not clinical advice", head_text, re.I) or not re.search(r"not a crisis line", head_text, re.I) or \
        not re.search(r"call your local emergency number", head_text, re.I) or \
        'href="https://stimpunks.org/help/"' not in head or \
        'href="https://stimpunks.org/fieldguide/coping/#h-crisis-hotlines"' not in head:
    refuse(f"{ROOM.name}: the paragraph before the first heading must say this is not clinical advice and not a "
           "crisis line, say to call your local emergency number in danger, and link our Help page and Coping's "
           "crisis lines. See _crisis.")
if mirror_ok and "seeds" in mirror_text and DANGER not in mirror_text["seeds"]:
    refuse("seeds: our page no longer says what to do in danger in the words this room repeats. Re-read it.")
if DANGER not in head_text:
    refuse(f"{ROOM.name}: the crisis paragraph no longer says our page's line about danger word for word.")

css = CSS.read_text()
sec = re.search(r"/\* §126 ── ROOM: Coping.*?(?=/\* §127 )", css, re.S)
if not sec:
    refuse("love.css has no §126 for Coping before §127.")
else:
    s126 = re.sub(r"/\*.*?\*/", " ", sec.group(0), flags=re.S)
    for word in ("@keyframes", "animation", "transition"):
        if word in s126:
            refuse(f"love.css §126: {word!r}. Nothing in the eye moves by itself at any setting. See _no_motion.")

text = re.sub(r"<(script|style|svg)\b.*?</\1>", " ", body, flags=re.S)
text = re.sub(r"<blockquote\b.*?</blockquote>", " ", text, flags=re.S)
text = re.sub(r'<figure class="[^"]*\bcop-quoted\b.*?</figure>', " ", text, flags=re.S)
text = re.sub(r"<head\b.*?</head>", " ", text, flags=re.S)
text = html.unescape(fold(re.sub(r"<[^>]+>", " ", text)))
sweep(text, ROOM.name)
if problems:
    raise SystemExit("REFUSING, on the published page:\n  " + "\n  ".join(problems))

longest = max(len(q["text"].split()) for q in quotes.values())
print(f"coping: the eye of the storm, {len(d['seeds'])} seeds, {len(quotes)} quotations and "
      f"{len(door_rows)} doors in {ROOM.name}")
print(f"  longest quotation {longest} words against a cap of {cap}; "
      + ("every one checked against the mirror word for word" if mirror_ok
         else "the Knowledge System mirror is not on this machine, so the quotations were not re-read"))
print("  no grit, no sneer, nothing clinical, nothing counted, and nothing moving by itself")
