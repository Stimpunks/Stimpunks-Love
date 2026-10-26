#!/usr/bin/env python3
"""Build Pets' floor, its sections, its pet flaps and its credits, from data/pets.json.

ONE DATA FILE, ONE TOOL, TWO SURFACES, the contract make-yells.py set. Pets is a
shopfront on the street, down on the floor with the animals at the end of the
day (Ryan's brief, 2026-10-24): a room saying how important co-regulating with
pets is for many Autistic people and for humans in general, because mammalian
co-regulation is a thing, with its channel on the CB under Community on the
chat page, and every room on the street with animals in it presented as a door.
This tool writes, between pts:<part> markers in pets.html:

  · THE FLOOR (pts:floor): the far wall of a room at the end of the day, seen
    from down on the floor. The sky going in its one low window, the lamp off
    and its switch lying on the floor, pet flaps in the skirting board, and a
    dog, a cat and a rabbit asleep. From a fixed seed, so it is the same room
    every build.
  · THE LEDE (pts:lede), CO-REGULATION (pts:coreg), WHY IT MATTERS TO SO MANY
    AUTISTIC PEOPLE (pts:autistic) and AND FOR EVERYBODY ELSE (pts:everybody),
    block by block.
  · THE PET FLAPS (pts:doors), YOUR OWN ANIMALS (pts:yours), WHAT IS NOT ON THE
    FLOOR (pts:rules), WHO READS THE CHANNEL AND FOR HOW LONG (pts:channel) and
    THE CREDITS (pts:credits), with a table of the quotations in
    liner-notes.html.

WHAT IT REFUSES:

  · ANYTHING CLINICAL, A BEST PET, A TALLY, A PRICE, AND AN ORDER NOBODY ASKED
    FOR, in the room's own words, each with the negation window so the room can
    still say it will not. The sweep SKIPS BLOCKQUOTES, which are other
    people's words read on our pages, and anything in curly quotes. The
    friendly edit to a pets room is a sentence about what a pet does for your
    health, or a list of the best pets for Autistic people; see _not_clinical
    and _no_best in the data.
  · A QUOTATION over the cap, with an HTML entity in it, or read off anything
    but one of our pages in `pages`. AND, WHERE THE KNOWLEDGE SYSTEM MIRROR IS ON
    THE MACHINE, ONE THAT IS NOT ON THAT PAGE WORD FOR WORD, and a page whose
    `holds` it no longer says. The comparison takes Markdown's links, emphasis
    and list and quote markers off the mirror's copy and folds the spaces, and
    nothing else. Where the mirror is missing (any machine but Ryan's), it says
    so and carries on, make-coworking.py's arrangement. Somebody else's words
    name who wrote them and where, and say they were read on our page.
  · A GLOSSARY LINK the data does not list, or one the mirror has no entry for
    at that address, because on stimpunks.org a redirect is a failure.
  · A ROOM TAGGED pets WITH NO FLAP. data/room-tags.json says which rooms are
    the street's pets rooms, and every one of them gets a flap here, so a new
    one cannot open without this room noticing. Ryan asked for all of them.
  · A FLAP THAT IS NOT THIS ROOM'S DRAWING. Every flap is drawn here, in this
    room's inks, told apart by its form, the campground board's rule. Two flaps
    with one form, a form with no drawing, a flap to a page that is not there,
    to this room, or to a room that keeps to itself (its address would be on a
    public page), and a flap whose room no longer says what the flap says
    about it: each carries `holds`, words on that room's published page, the
    Community Center's service-board rule. The flap's name is read off the
    room's own <title>, so a renamed room renames its flap. Every sentence
    about your own animals and about the channel holds its pages the same way.
  · A COLOUR IN THE DRAWINGS THAT love.css DOES NOT DECLARE, and A LIT LAMP:
    the lamp in the drawing carries none of the light's or the words' inks,
    because the lamp is never switched on.
  · ANYTHING THAT MOVES: a keyframe, an animation or a transition in §127.
    Everybody on the floor is asleep, at every setting, MAX GLITTER included.
  · A FORM, AN INPUT, A TEXTAREA OR ANYTHING EDITABLE outside the job marker,
    and any script but love.js and quest.js.
  · A MISSING MARKER PAIR. A generator that writes nothing and exits 0 is how
    two surfaces drift apart.

WHAT IT DOES NOT CHECK, on purpose: how many flaps there are. The street keeps
growing, and so can the skirting board.
"""
import html
import json
import math
import random
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data/pets.json"
ROOM = ROOT / "pets.html"
NOTES = ROOT / "liner-notes.html"
CSS = ROOT / "love.css"
FORUM = ROOT / "data/forum.json"
TAGS = ROOT / "data/room-tags.json"
LIB = ROOT / "netlify/cb/lib.mjs"
FACES = ROOT / "data/foundry-faces.json"
MIRROR = Path.home() / "Documents/Claude/Projects/Stimpunks Knowledge System/site/stimpunks.org"

ENTITY = re.compile(r"&(?:[a-zA-Z][a-zA-Z0-9]{1,31}|#\d{1,6}|#x[0-9a-fA-F]{1,6});")
LINK = re.compile(r"\[([^\]]+)\]\(([^)\s]+)\)")
BOLD = re.compile(r"\*\*([^*]+)\*\*")

NEGATION = (r"(?:no|not|nothing|never|neither|none|without|refuses?|refused|refusing|"
            r"cannot|does not|won't|will not|is not|are not|isn't|aren't|nobody|nor|declin\w+)")

# make-coping.py's CLINICAL, without its bare "treat", because a truck on this
# street makes treats for dogs, and with what a pets page grows: the hormone,
# the blood pressure and the health benefit, each a study nobody here has read.
CLINICAL = (r"cures?|cured|curing|treatments?|therap(?:y|ies|ist|ists|eutic)|diagnos\w+|prescri\w+|"
            r"symptoms?|disorders?|clinically|evidence-based|proven to|cortisol|oxytocin|serotonin|"
            r"dopamine|blood pressure|heart disease|good for (?:your|you|the) health|"
            r"health benefits?|emotional support animals?")
# The listicle: the best pets for Autistic people, the breed to get.
BEST = (r"best (?:pets?|breeds?|animals?|dogs?|cats?|companions?)|"
        r"which (?:pet|animal|breed|dog|cat) (?:to get|you should get)|"
        r"top \d+|ranked|ranking|rankings")
# make-dead-tired.py's TALLY, narrowed, plus a headcount of who has pets.
# The numbers are matched whole, digits and all, so the edge after them is not a
# digit: "$4" with a "0" after it is not a match, and that is how the first
# version of both let a price and a share through. Broken on purpose to find it.
TALLY = (r"how many|tall(?:y|ies)|tallied|streaks?|scores?|scored|leaderboards?|"
         r"\d+\s*(?:pets|animals|dogs|cats)|percent|per cent|\d+(?:\.\d+)?\s?%")
SALE = r"for sale|prices?|priced|breeders?|pet shops?|puppy mills?|\$\s?\d+(?:\.\d+)?"
ADVICE = (r"you should|you must|you need to|you have to|have you tried|make sure (?:you|to)|"
          r"don'?t forget to|remember to|it'?s important to|learn to")

SWEEPS = [
    (CLINICAL, "nothing in this room is clinical: an animal is company, not a treatment. See _not_clinical."),
    (BEST, "no best pet, and no animal ranked above another. See _no_best."),
    (TALLY, "nobody's animals are counted here. See _no_tally."),
    (SALE, "no animal on this street has a price on it. See _no_sale."),
    (ADVICE, "no order nobody asked for, in the shapes make-dead-tired.py refuses."),
]
# EDGES THAT ARE NOT \b, because a price starts with a $ and a share ends with a
# %, and \b before a $ can never match: Glow Go Gee Gaws' price check found that
# out by never firing.
EDGE_L, EDGE_R = r"(?<![A-Za-z0-9])", r"(?![A-Za-z0-9])"
SWEEPS = [(re.compile(rf"{EDGE_L}(?:{p}){EDGE_R}", re.I),
           re.compile(rf"\b{NEGATION}\b[^.]{{0,70}}?{EDGE_L}(?:{p}){EDGE_R}", re.I), why) for p, why in SWEEPS]

SCRIPTS = {"love.js", "quest.js"}
# The lamp is never lit, so it never wears the light's inks or the words'.
LIT = ("--pts-glow", "--pts-link", "--pts-ink", "--pts-sky", "--pts-sheen")

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
    somebody saying it."""
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


def page_text(p):
    src = p.read_text()
    main = re.search(r"<main\b.*?</main>", src, re.S)
    t = re.sub(r"<(script|style|svg)\b.*?</\1>", " ", main.group(0) if main else "", flags=re.S)
    t = re.sub(r"<!--.*?-->", " ", t, flags=re.S)
    return fold(html.unescape(re.sub(r"<[^>]+>", " ", t))).lower()


def page_name(p):
    m = re.search(r"<title>(.*?)</title>", p.read_text(), re.S)
    name = html.unescape(m.group(1)) if m else ""
    return re.sub(r"\s+[—-]\s+Stimpunks\.World\s*$", "", name).strip()


def holds_on(holds, where):
    """{page: [words]}: every page there, and every one of its words on it."""
    if not isinstance(holds, dict) or not holds:
        refuse(f"{where}: no holds. A sentence about another room names the words there that carry it.")
        return
    for page, words in holds.items():
        p = ROOT / page
        if not p.is_file():
            refuse(f"{where}: holds {page}, which is not a page here.")
            continue
        text = page_text(p)
        for w in words or []:
            if fold(w).lower() not in text:
                refuse(f"{where}: {page} no longer says {w!r}, and this room says it on its behalf. Change "
                       "the sentence with the page, and its holds with it.")


# ── The data ─────────────────────────────────────────────────────────────────
d = json.loads(DATA.read_text())
pages = d.get("pages") or {}
quotes = d.get("quotes") or {}
glossary = set(d.get("glossary") or [])
cap = int(d.get("words") or 0)
if not cap:
    refuse("data/pets.json has no `words` cap, and the room prints one.")

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
        continue
    if ENTITY.search(text):
        refuse(f"{where}: carries an HTML entity.")
    if (q.get("who") or q.get("video")) and not str(q.get("work", "")).strip():
        refuse(f"{where}: somebody else's words with no `work`. Say where they come from as our page does.")
    if mirror_ok and q["read_on"] in mirror_text and fold(text) not in mirror_text[q["read_on"]]:
        refuse(f"{where}: {text!r} is not on {pages[q['read_on']]['url']} word for word. Re-copy it from our "
               "page; never loosen the check.")


def blocks(bs, where):
    for j, b in enumerate(bs, 1):
        w = f"{where} block {j}"
        if "q" in b:
            if b["q"] not in quotes:
                refuse(f"{w}: quotes {b['q']!r}, which is not in `quotes`.")
            used.add(b["q"])
        elif "p" in b:
            ours(b["p"], w)
        else:
            refuse(f"{w}: a block is a q or a p, and this is none of them.")


SECTIONS = ("lede", "coreg", "autistic", "everybody")
for part in SECTIONS:
    if not d.get(part):
        refuse(f"{part}: empty, and the page has a section waiting for it.")
    blocks(d.get(part) or [], part)
ours(d.get("doors_line", ""), "doors_line")

for qid in quotes:
    if qid not in used:
        refuse(f"quote {qid}: in the data and printed nowhere, so its credit would claim a line the room does not print.")

for i, r in enumerate(d.get("not_here") or [], 1):
    for need in ("name", "line"):
        if not str(r.get(need, "")).strip():
            refuse(f"not_here {i}: no {need}.")
    ours(r.get("name", ""), f"not_here {i}")
    ours(r.get("line", ""), f"not_here {i}")

for i, y in enumerate(d.get("yours") or [], 1):
    where = f"yours {i}"
    for need in ("name", "line"):
        if not str(y.get(need, "")).strip():
            refuse(f"{where}: no {need}.")
    ours(y.get("name", ""), where)
    ours(y.get("line", ""), where)
    holds_on(y.get("holds"), where)

for k in ("pictures", "care"):
    holds_on(((d.get("channel") or {}).get(k) or {}).get("holds"), f"channel.{k}")


# ── The pet flaps ────────────────────────────────────────────────────────────
tags = json.loads(TAGS.read_text())["rooms"]
pets_rooms = sorted(p for p, t in tags.items() if "pets" in t and p != ROOM.name)

door_forms = []
door_rows = []
flapped = set()
for gi, grp in enumerate(d.get("doors") or [], 1):
    gw = f"doors group {gi}"
    for need in ("name", "line"):
        if not str(grp.get(need, "")).strip():
            refuse(f"{gw}: no {need}.")
    ours(grp.get("name", ""), gw)
    ours(grp.get("line", ""), gw)
    if not grp.get("doors"):
        refuse(f"{gw}: a group with no flaps in it.")
    for door in grp.get("doors") or []:
        where = f"flap to {door.get('page')}"
        p = ROOT / str(door.get("page", ""))
        if door.get("page") == ROOM.name:
            refuse(f"{where}: a flap from this room to this room.")
            continue
        if not p.is_file():
            refuse(f"{where}: no such page.")
            continue
        if re.search(r"<body\b[^>]*\bdata-unlisted\b", p.read_text()):
            refuse(f"{where}: that room keeps to itself, and a flap here would publish its address.")
        if door.get("page") in flapped:
            refuse(f"{where}: a second flap to the same room.")
        flapped.add(door.get("page"))
        ours(door.get("line", ""), where)
        text = page_text(p)
        if not door.get("holds"):
            refuse(f"{where}: no holds. A flap says what a room is, so it names the words there that carry it.")
        for w in door.get("holds") or []:
            if fold(w).lower() not in text:
                refuse(f"{where}: that room no longer says {w!r}, and this flap says it on its behalf. Change "
                       "the flap's line with the room, and its holds with it.")
        door_forms.append(door.get("form"))
        door_rows.append((grp, door, page_name(p)))

for p in pets_rooms:
    if p not in flapped:
        refuse(f"doors: {p} is tagged pets in {TAGS.name} and has no flap here. Every pets room on the street "
               "has one; give it a flap, in a group, with its own form and its holds.")

for f in set(door_forms):
    if door_forms.count(f) > 1:
        refuse(f"doors: two flaps are {f!r}. Every flap in the skirting board is its own form.")

if problems:
    raise SystemExit("REFUSING to build Pets:\n  " + "\n  ".join(problems))


# ── The drawings ─────────────────────────────────────────────────────────────

def num(v):
    return f"{v:.1f}".rstrip("0").rstrip(".")


INK = 'stroke="var(--pts-night)"'


def glow(path, w=4):
    """The last light comes in level from the window, on the left, so it lands
    on the window side of everything and never on a top."""
    return f'<path d="{path}" fill="none" stroke="var(--pts-glow)" stroke-width="{w}" stroke-linecap="round"/>'


def wall():
    # A piece of this room's wall, its skirting board and the floor in front,
    # with what is left of the light lying on the boards from the left.
    return ('<rect x="0" y="0" width="160" height="98" fill="var(--pts-wall)"/>'
            f'<rect x="0" y="84" width="160" height="14" fill="var(--pts-skirting)"/>'
            f'<path d="M0 84 H160" {INK} stroke-width="1.6"/>'
            '<rect x="0" y="98" width="160" height="22" fill="var(--pts-floor)"/>'
            '<path d="M0 98 H78 L46 120 H0 Z" fill="var(--pts-sheen)" opacity=".45"/>'
            f'<path d="M0 98 H160" {INK} stroke-width="1.4"/>')


def door_catflap():
    # A square cat flap with its hinge across the top and the tab at the foot:
    # the shelter on the dark street, where the cats come in.
    return (f'<rect x="52" y="40" width="56" height="56" rx="10" fill="var(--pts-skirting)" {INK} stroke-width="2.4"/>'
            f'<rect x="60" y="50" width="40" height="40" rx="6" fill="var(--pts-flap)" {INK} stroke-width="1.8"/>'
            f'<rect x="58" y="44" width="44" height="5" rx="2" fill="var(--pts-sheen)"/>'
            f'<rect x="75" y="84" width="10" height="4" rx="2" fill="var(--pts-night)"/>'
            + glow("M52 50 V86"))


def door_dogdoor():
    # A big dog door hung in rubber strips, to push through without stopping:
    # the kennels in the snow.
    strips = "".join(f'<rect x="{x}" y="30" width="12" height="62" rx="2" fill="var(--pts-flap)" {INK} stroke-width="1.4"/>'
                     for x in (52, 66, 80, 94))
    return (f'<rect x="46" y="18" width="68" height="78" rx="6" fill="var(--pts-skirting)" {INK} stroke-width="2.4"/>'
            + strips + f'<rect x="50" y="22" width="60" height="6" rx="2" fill="var(--pts-sheen)"/>'
            + glow("M46 28 V90"))


def door_mousehole():
    # No flap at all: an arch gnawed out of the skirting, dark inside, with the
    # day coming up between the floorboards in thin lines. The hutches under
    # the shop.
    return ('<path d="M62 98 V80 A18 18 0 0 1 98 80 V98 Z" fill="var(--pts-night)"/>'
            '<path d="M68 93 H92 M70 87 H90" stroke="var(--pts-sheen)" stroke-width="1.3" stroke-linecap="round"/>'
            + glow("M62 96 V80"))


def door_porthole():
    # A round flap with a round window in it, cut to the size of a cat: the
    # café where every cat has a window of its own.
    return (f'<circle cx="80" cy="64" r="30" fill="var(--pts-skirting)" {INK} stroke-width="2.4"/>'
            f'<circle cx="80" cy="64" r="22" fill="var(--pts-flap)" {INK} stroke-width="1.8"/>'
            f'<path d="M62 50 H98" stroke="var(--pts-sheen)" stroke-width="4" stroke-linecap="round"/>'
            f'<circle cx="80" cy="66" r="8" fill="var(--pts-sky)" {INK} stroke-width="1.4"/>'
            + glow("M54 79 A30 30 0 0 1 54 49"))


def door_propped():
    # A dog door with its flap propped up and open, the field outside going
    # dark and a ball out there on it: the Run.
    return (f'<rect x="50" y="30" width="60" height="66" fill="var(--pts-night)"/>'
            f'<rect x="55" y="35" width="50" height="34" fill="var(--pts-sky)"/>'
            f'<rect x="55" y="69" width="50" height="27" fill="var(--pts-skirting)"/>'
            f'<circle cx="92" cy="84" r="6" fill="var(--pts-zenith)" {INK} stroke-width="1.4"/>'
            f'<rect x="50" y="30" width="60" height="66" fill="none" stroke="var(--pts-skirting)" stroke-width="5"/>'
            f'<path d="M48 30 H112 L104 12 H56 Z" fill="var(--pts-flap)" {INK} stroke-width="1.8" stroke-linejoin="round"/>'
            + glow("M50 34 V94"))


def door_hatch():
    # A serving hatch at counter height with its shutter rolled up and a treat
    # on the ledge: the truck that makes nothing but treats for dogs.
    slats = "".join(f'<path d="M40 {y} H120"/>' for y in (26, 30, 34))
    return (f'<rect x="40" y="34" width="80" height="40" fill="var(--pts-night)"/>'
            f'<rect x="38" y="22" width="84" height="14" fill="var(--pts-flap)" {INK} stroke-width="1.8"/>'
            f'<g {INK} stroke-width="1">{slats}</g>'
            f'<rect x="34" y="74" width="92" height="7" rx="2" fill="var(--pts-skirting)" {INK} stroke-width="1.6"/>'
            f'<g fill="var(--pts-ink)" {INK} stroke-width="1.2"><circle cx="70" cy="66" r="3.4"/><circle cx="70" cy="71" r="3.4"/>'
            f'<circle cx="90" cy="66" r="3.4"/><circle cx="90" cy="71" r="3.4"/><rect x="70" y="65" width="20" height="7"/></g>'
            f'<rect x="71" y="66" width="18" height="5" fill="var(--pts-ink)"/>'
            + glow("M40 36 V72"))


def door_barn():
    # A flap made like a little barn door, planks and a Z brace: the sanctuary,
    # where everybody has a home for good.
    planks = "".join(f'<path d="M{x} 42 V94"/>' for x in (67, 80, 93))
    return (f'<rect x="50" y="36" width="60" height="62" fill="none" stroke="var(--pts-skirting)" stroke-width="5"/>'
            f'<rect x="54" y="40" width="52" height="56" fill="var(--pts-flap)" {INK} stroke-width="2"/>'
            f'<g {INK} stroke-width="1.2" opacity=".6">{planks}</g>'
            f'<rect x="54" y="45" width="52" height="7" fill="var(--pts-sheen)" {INK} stroke-width="1"/>'
            f'<rect x="54" y="82" width="52" height="7" fill="var(--pts-sheen)" {INK} stroke-width="1"/>'
            f'<path d="M58 82 L102 52" stroke="var(--pts-night)" stroke-width="8" stroke-linecap="round"/>'
            f'<path d="M58 82 L102 52" stroke="var(--pts-sheen)" stroke-width="5" stroke-linecap="round"/>'
            + glow("M50 40 V94"))


def door_lens():
    # A round flap with a lens in the middle of it, ringed in black: the
    # camera obscura, where a creature of your own appears on a white table.
    return (f'<circle cx="80" cy="62" r="32" fill="var(--pts-skirting)" {INK} stroke-width="2.4"/>'
            f'<circle cx="80" cy="62" r="24" fill="var(--pts-night)"/>'
            f'<circle cx="80" cy="62" r="14" fill="var(--pts-sky)" stroke="var(--pts-zenith)" stroke-width="3"/>'
            f'<circle cx="75" cy="57" r="3.5" fill="var(--pts-ink)"/>'
            + glow("M52.3 78 A32 32 0 0 1 52.3 46"))


DOORS = {
    "catflap": door_catflap, "dogdoor": door_dogdoor, "mousehole": door_mousehole,
    "porthole": door_porthole, "propped": door_propped, "hatch": door_hatch,
    "barn": door_barn, "lens": door_lens,
}
for f in door_forms:
    if f not in DOORS:
        refuse(f"doors: no drawing for the form {f!r}. Draw it in DOORS, in this room's inks, first.")


def door_art(form):
    return ('<svg class="pts-door__art" viewBox="0 0 160 120" aria-hidden="true" focusable="false">'
            f'{wall()}{DOORS[form]()}</svg>')


# THE FLOOR. The far wall at the end of the day, seen from down on the floor:
# the window low and to the left, the lamp in the corner off, the skirting
# board with its flaps, and the animals on the rug in front of you.
W, H = 1200, 440
FLOOR_Y, SKIRT_Y = 330, 312
fl = d["floor"]
rng = random.Random(fl["seed"])

# The window, its glass cut off by the top of the picture, the trees outside.
GX0, GX1, SILL = 154, 556, 240
trees = []
x = GX0 - 30
while x < GX1 + 30:
    r = 16 + 26 * rng.random()
    trees.append(f'<circle cx="{num(x)}" cy="{num(SILL - 6 - r * .35)}" r="{num(r)}"/>')
    x += r * (1.0 + .5 * rng.random())
roof = f'M{GX0 + 230} {SILL} V{SILL - 34} L{GX0 + 268} {SILL - 58} L{GX0 + 306} {SILL - 34} V{SILL} Z'

# The boards run away from you to a point beyond the wall.
VX, VY = 600, 170
boards = []
for k in range(-6, 19):
    xb = -400 + k * 110
    t = (FLOOR_Y - VY) / (H - VY)
    xt = VX + (xb - VX) * t
    boards.append(f'<path d="M{num(xt)} {FLOOR_Y} L{num(xb)} {H}"/>')

# Flaps in the skirting board, a few sizes, in the order the data lays them.
little = []
for i, fx in enumerate(fl["flaps"]):
    kind = ["catflap", "dogdoor", "arch", "round"][i % 4]
    if kind == "catflap":
        little.append(f'<rect x="{num(fx - 22)}" y="{SKIRT_Y - 34}" width="44" height="46" rx="8" '
                      f'fill="var(--pts-skirting)" {INK} stroke-width="2"/>'
                      f'<rect x="{num(fx - 15)}" y="{SKIRT_Y - 26}" width="30" height="32" rx="5" '
                      f'fill="var(--pts-flap)" {INK} stroke-width="1.4"/>' + glow(f"M{num(fx - 22)} {SKIRT_Y - 26} V{SKIRT_Y + 6}", 3))
    elif kind == "dogdoor":
        little.append(f'<rect x="{num(fx - 30)}" y="{SKIRT_Y - 60}" width="60" height="72" rx="6" '
                      f'fill="var(--pts-skirting)" {INK} stroke-width="2"/>'
                      + "".join(f'<rect x="{num(fx - 25 + s * 12.5)}" y="{SKIRT_Y - 52}" width="11" height="60" rx="2" '
                                f'fill="var(--pts-flap)" {INK} stroke-width="1.2"/>' for s in range(4))
                      + glow(f"M{num(fx - 30)} {SKIRT_Y - 52} V{SKIRT_Y + 8}", 3))
    elif kind == "arch":
        little.append(f'<path d="M{num(fx - 15)} {FLOOR_Y} V{FLOOR_Y - 14} A15 15 0 0 1 {num(fx + 15)} {FLOOR_Y - 14} '
                      f'V{FLOOR_Y} Z" fill="var(--pts-night)"/>' + glow(f"M{num(fx - 15)} {FLOOR_Y - 2} V{FLOOR_Y - 14}", 3))
    else:
        cy = SKIRT_Y - 14
        little.append(f'<circle cx="{num(fx)}" cy="{cy}" r="24" fill="var(--pts-skirting)" {INK} stroke-width="2"/>'
                      f'<circle cx="{num(fx)}" cy="{cy}" r="17" fill="var(--pts-flap)" {INK} stroke-width="1.4"/>'
                      f'<circle cx="{num(fx)}" cy="{cy + 2}" r="6" fill="var(--pts-sky)" {INK} stroke-width="1.2"/>'
                      + glow(f"M{num(fx - 20.8)} {cy + 12} A24 24 0 0 1 {num(fx - 20.8)} {cy - 12}", 3))

# THE LAMP, OFF. Its shade is cut by the top of the picture, its bulb dark, and
# its switch lies on the floor on its cord where nobody has reached for it.
LX = 1040
lamp = (f'<g class="pts-lamp">'
        f'<rect x="{LX - 3}" y="40" width="6" height="{FLOOR_Y + 8 - 40}" fill="var(--pts-flap)" {INK} stroke-width="1.4"/>'
        f'<path d="M{LX - 52} -4 H{LX + 52} L{LX + 72} 70 H{LX - 72} Z" fill="var(--pts-flap)" {INK} stroke-width="2.4" stroke-linejoin="round"/>'
        f'<circle cx="{LX}" cy="74" r="7" fill="var(--pts-skirting)" {INK} stroke-width="1.6"/>'
        f'<ellipse cx="{LX}" cy="{FLOOR_Y + 8}" rx="34" ry="7" fill="var(--pts-flap)" {INK} stroke-width="2"/>'
        f'<path d="M{LX + 28} {FLOOR_Y + 10} C{LX + 40} {FLOOR_Y + 40} {LX + 20} {FLOOR_Y + 46} {LX + 38} {FLOOR_Y + 44} '
        f'M{LX + 66} {FLOOR_Y + 44} C{LX + 96} {FLOOR_Y + 40} {LX + 80} {SKIRT_Y + 8} {LX + 82} {SKIRT_Y + 8}" '
        f'fill="none" {INK} stroke-width="2.4" stroke-linecap="round"/>'
        f'<rect x="{LX + 38}" y="{FLOOR_Y + 37}" width="28" height="14" rx="5" fill="var(--pts-skirting)" {INK} stroke-width="1.6"/>'
        f'<circle cx="{LX + 52}" cy="{FLOOR_Y + 44}" r="3.5" fill="var(--pts-flap)"/>'
        f'<rect x="{LX + 74}" y="{SKIRT_Y + 2}" width="18" height="12" rx="2" fill="var(--pts-flap)" {INK} stroke-width="1.4"/>'
        f'</g>')


def tail(path, fill, w):
    """A tail is a line with an outline: the night under it, the fur over it."""
    return (f'<path d="{path}" fill="none" stroke="var(--pts-night)" stroke-width="{w + 5}" stroke-linecap="round"/>'
            f'<path d="{path}" fill="none" stroke="var({fill})" stroke-width="{w}" stroke-linecap="round"/>')


FUR = 'stroke="var(--pts-night)" stroke-width="2.4" stroke-linejoin="round"'

# THE DOG, asleep on the rug, curled, chin on its paws, facing the window.
dog = ('<g class="pts-dog">'
       f'<ellipse cx="712" cy="388" rx="112" ry="34" fill="var(--pts-dog)" {FUR}/>'
       + tail("M820 396 C852 404 846 430 800 430", "--pts-dog", 11) +
       f'<ellipse cx="790" cy="400" rx="42" ry="26" fill="var(--pts-dog)" {FUR}/>'
       f'<ellipse cx="594" cy="424" rx="28" ry="8" fill="var(--pts-dog)" {FUR}/>'
       f'<ellipse cx="628" cy="427" rx="26" ry="8" fill="var(--pts-dog)" {FUR}/>'
       f'<ellipse cx="602" cy="398" rx="40" ry="27" fill="var(--pts-dog)" {FUR}/>'
       f'<ellipse cx="566" cy="408" rx="24" ry="14" fill="var(--pts-dog)" {FUR}/>'
       f'<path d="M606 374 C630 376 636 398 628 414 C618 420 610 412 606 400 C602 390 600 382 606 374 Z" fill="var(--pts-dog)" {FUR}/>'
       '<path d="M580 393 Q588 399 596 393" fill="none" stroke="var(--pts-night)" stroke-width="2.2" stroke-linecap="round"/>'
       '<ellipse cx="545" cy="404" rx="6" ry="4.5" fill="var(--pts-night)"/>'
       '</g>')

# THE CAT, curled up beside the dog, its head tucked and its tail round its feet.
stripes = "".join(f'<path d="M{x} {y} q8 -6 16 0"/>' for x, y in ((896, 378), (918, 382), (938, 390)))
cat = ('<g class="pts-cat">'
       f'<ellipse cx="905" cy="398" rx="56" ry="30" fill="var(--pts-cat)" {FUR}/>'
       f'<g fill="none" stroke="var(--pts-night)" stroke-width="2" stroke-linecap="round" opacity=".45">{stripes}</g>'
       f'<path d="M845 386 L851 364 L864 380 Z" fill="var(--pts-cat)" {FUR}/>'
       f'<path d="M866 380 L878 363 L882 384 Z" fill="var(--pts-cat)" {FUR}/>'
       f'<circle cx="862" cy="398" r="22" fill="var(--pts-cat)" {FUR}/>'
       + tail("M958 404 C952 432 900 430 846 416", "--pts-cat", 8) +
       '<path d="M851 400 Q856 404 862 400" fill="none" stroke="var(--pts-night)" stroke-width="2" stroke-linecap="round"/>'
       '</g>')

# THE RABBIT, loafing by the skirting board in what is left of the light,
# ears laid back.
rabbit = ('<g class="pts-rabbit">'
          f'<ellipse cx="256" cy="{FLOOR_Y + 8}" rx="28" ry="16" fill="var(--pts-sheen)" {FUR}/>'
          f'<ellipse cx="248" cy="{FLOOR_Y - 9}" rx="16" ry="5" transform="rotate(-14 248 {FLOOR_Y - 9})" fill="var(--pts-sheen)" {FUR}/>'
          f'<ellipse cx="252" cy="{FLOOR_Y - 4}" rx="15" ry="4.5" transform="rotate(-6 252 {FLOOR_Y - 4})" fill="var(--pts-sheen)" {FUR}/>'
          f'<circle cx="232" cy="{FLOOR_Y + 2}" r="12" fill="var(--pts-sheen)" {FUR}/>'
          f'<path d="M226 {FLOOR_Y} q4 3 8 0" fill="none" stroke="var(--pts-night)" stroke-width="1.8" stroke-linecap="round"/>'
          '</g>')

scene = (f'  <svg class="pts-floor" viewBox="0 0 {W} {H}" aria-hidden="true" focusable="false">'
         '<defs><linearGradient id="pts-sky-g" x1="0" y1="0" x2="0" y2="1">'
         '<stop offset="0" stop-color="var(--pts-zenith)"/><stop offset=".55" stop-color="var(--pts-sky)"/>'
         '<stop offset=".93" stop-color="var(--pts-glow)"/></linearGradient>'
         '<linearGradient id="pts-light-g" x1="0" y1="0" x2="0" y2="1">'
         '<stop offset="0" stop-color="var(--pts-sheen)" stop-opacity=".7"/>'
         '<stop offset="1" stop-color="var(--pts-sheen)" stop-opacity="0"/></linearGradient>'
         f'<clipPath id="pts-glass"><rect x="{GX0}" y="-20" width="{GX1 - GX0}" height="{SILL + 20}"/></clipPath>'
         f'<clipPath id="pts-boards"><rect x="0" y="{FLOOR_Y}" width="{W}" height="{H - FLOOR_Y}"/></clipPath></defs>'
         f'<rect x="0" y="0" width="{W}" height="{FLOOR_Y}" fill="var(--pts-wall)"/>'
         f'<rect x="{GX0 - 14}" y="-20" width="{GX1 - GX0 + 28}" height="{SILL + 32}" fill="var(--pts-skirting)"/>'
         f'<rect x="{GX0}" y="-20" width="{GX1 - GX0}" height="{SILL + 20}" fill="url(#pts-sky-g)"/>'
         f'<g clip-path="url(#pts-glass)" fill="var(--pts-night)">{"".join(trees)}<path d="{roof}"/></g>'
         f'<rect x="{(GX0 + GX1) / 2 - 4}" y="-20" width="8" height="{SILL + 20}" fill="var(--pts-skirting)"/>'
         f'<rect x="{GX0}" y="104" width="{GX1 - GX0}" height="8" fill="var(--pts-skirting)"/>'
         f'<rect x="{GX0 - 26}" y="{SILL}" width="{GX1 - GX0 + 52}" height="14" fill="var(--pts-skirting)" {INK} stroke-width="1.6"/>'
         f'<path d="M{GX0 - 24} {SILL + 1.5} H{GX1 + 24}" stroke="var(--pts-sheen)" stroke-width="2.4"/>'
         f'<rect x="0" y="{SKIRT_Y}" width="{W}" height="{FLOOR_Y - SKIRT_Y}" fill="var(--pts-skirting)"/>'
         f'<path d="M0 {SKIRT_Y} H{W}" {INK} stroke-width="2"/>'
         f'{"".join(little)}'
         f'<rect x="0" y="{FLOOR_Y}" width="{W}" height="{H - FLOOR_Y}" fill="var(--pts-floor)"/>'
         f'<g clip-path="url(#pts-boards)" fill="none" stroke="var(--pts-skirting)" stroke-width="1.4">{"".join(boards)}</g>'
         f'<path d="M0 {FLOOR_Y} H{W}" {INK} stroke-width="2"/>'
         f'<ellipse cx="760" cy="404" rx="360" ry="46" fill="var(--pts-rug)" {INK} stroke-width="2"/>'
         '<ellipse cx="760" cy="404" rx="334" ry="37" fill="none" stroke="var(--pts-flap)" stroke-width="2"/>'
         f'<path d="M{GX0} {FLOOR_Y} H{GX1} L{GX1 + 250} {H} H{GX0 - 130} Z" fill="url(#pts-light-g)"/>'
         f'{rabbit}{lamp}{dog}{cat}</svg>')

inks = css_root()
for drawing in [scene] + [DOORS[f]() for f in DOORS] + [wall()]:
    for name in set(re.findall(r"var\((--[a-z0-9-]+)\)", drawing)):
        if name not in inks:
            refuse(f"drawing: {name} is not declared in love.css's :root, and CSS paints nothing for it.")
for name in LIT:
    if f"var({name})" in lamp:
        refuse(f"drawing: the lamp wears {name}, and the lamp is never lit. See _no_motion.")
if problems:
    raise SystemExit("REFUSING to draw Pets:\n  " + "\n  ".join(problems))


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


def whose(q):
    """Who wrote it, where, and the page of ours it was read on."""
    pg = pages[q["read_on"]]
    kind = "entry" if "/glossary/" in pg["url"] else "page"
    on = f'read on our {page_link(q["read_on"])} {kind}'
    if q.get("video"):
        return f'From the video <cite>{esc(q["work"])}</cite>, {on}'
    if q.get("who"):
        site = f' on {esc(q["site"])}' if q.get("site") else ""
        return f'{esc(q["who"])}, <cite>{esc(q["work"])}</cite>{site}, {on}'
    return f"Stimpunks, {page_link(q['read_on'])}"


def quote(qid, pad="    "):
    q = quotes[qid]
    return (f'{pad}<blockquote class="pts-quote">\n'
            f'{pad}  <p>{esc(q["text"])}</p>\n'
            f'{pad}  <footer class="pts-quote__who">{whose(q)}</footer>\n'
            f'{pad}</blockquote>')


def render(bs):
    out = []
    for b in bs:
        if "q" in b:
            out.append(quote(b["q"]))
        else:
            out.append(f'    <p>{linked(b["p"])}</p>')
    return "\n".join(out)


swap(ROOM, "pts:floor", scene)
for part in SECTIONS:
    swap(ROOM, f"pts:{part}", render(d[part]), "    ")

groups = []
for grp in d["doors"]:
    cards = []
    for g2, door, name in door_rows:
        if g2 is not grp:
            continue
        cards.append(f'          <li><a class="pts-door" href="{attr(door["page"])}">'
                     f'{door_art(door["form"])}'
                     f'<span class="pts-door__name">{esc(name)}</span>'
                     f'<span class="pts-door__line">{linked(door["line"][:1].upper() + door["line"][1:])}</span></a></li>')
    groups.append('      <li class="pts-group">\n'
                  f'        <h3>{esc(grp["name"])}</h3>\n'
                  f'        <p>{linked(grp["line"])}</p>\n'
                  '        <ul class="pts-doors">\n' + "\n".join(cards) + '\n        </ul>\n      </li>')
swap(ROOM, "pts:doors", f'    <p>{linked(d["doors_line"])}</p>\n    <ul class="pts-groups">\n'
     + "\n".join(groups) + "\n    </ul>", "    ")

# YOUR OWN ANIMALS, and the forums' Pets category with its keep read rather
# than typed, out of data/forum.json, so it never goes quietly wrong.
cats = {c["slug"]: c for c in json.loads(FORUM.read_text())["categories"]}
if "pets" not in cats or not cats["pets"].get("keep"):
    raise SystemExit("REFUSING: data/forum.json has no pets category with a keep, and the room links it.")
if "pictures, stories, worries and questions" not in cats["pets"].get("about", ""):
    raise SystemExit("REFUSING: the forums' Pets category no longer says it is for pictures, stories, worries\n"
                     "and questions, and this room says so on its behalf. Change the room with it.")
keep = esc(cats["pets"]["keep"])
yours = [f'      <li><strong>{esc(y["name"])}</strong> {linked(y["line"])}</li>' for y in d["yours"]]
yours.append('      <li><strong>The forums.</strong> <a href="forum.html#/c/pets">Pets</a> in the forums is for '
             f"pictures, stories, worries and questions about your animals, and keeps a topic {keep} after its "
             "last post.</li>")
swap(ROOM, "pts:yours", '    <ul class="pts-yours">\n' + "\n".join(yours) + "\n    </ul>", "    ")

rules = [f'      <li><strong>{esc(r["name"])}</strong> {linked(r["line"])}</li>' for r in d["not_here"]]
swap(ROOM, "pts:rules", '    <ul class="pts-rules">\n' + "\n".join(rules) + "\n    </ul>", "    ")

# WHO READS THE CHANNEL AND FOR HOW LONG, read rather than typed: the hours out
# of lib.mjs's LIFE, and the forums' keep, as above.
life = re.search(r"export const LIFE_DAYS = (\d+);", LIB.read_text())
if not life:
    raise SystemExit("REFUSING: netlify/cb/lib.mjs has no LIFE_DAYS, and the room says how long a message stays.")
LIFE_WORDS = {7: "a week", 14: "two weeks", 21: "three weeks", 28: "four weeks"}
channel = [
    "      <li><strong>Everybody signed on to the CB can read this room&rsquo;s channel</strong>, so say only what "
    "you would say in a room with all of them in it. It keeps "
    '<a href="community-center.html#cb-norms">the house norms</a>, like every channel.</li>',
    f"      <li><strong>Unless our administrators set this channel otherwise, every message on it goes {LIFE_WORDS.get(int(life.group(1)), life.group(1) + ' days')} after it was sent</strong>, "
    "and the radio says what it keeps, first under <b>In this channel</b>. For something that needs longer, "
    f'<a href="forum.html#/c/pets">Pets</a> in the forums keeps a topic {keep} after its last post.</li>',
    "      <li><strong>Pictures of your animals are welcome</strong>, and a picture goes when its message does. "
    "It is redrawn in your own browser before it leaves, which takes off where it was taken, as "
    '<a href="privacy.html#cb">the privacy page</a> says.</li>',
    "      <li><strong>Nobody on it is a vet.</strong> For an animal who is ill or hurt, a vet. For help with "
    'what looking after one costs, <a href="community-care.html">Community Care</a> is the room for asking.</li>',
]
swap(ROOM, "pts:channel", '    <ul class="pts-rules">\n' + "\n".join(channel) + "\n    </ul>", "    ")

# THE CREDITS: whose every line is, the type read off its own record, and the cap.
faces = json.loads(FACES.read_text())["faces"]
display, text_face = faces["coiny"], faces["zen-maru-gothic"]
others = []
for q in quotes.values():
    name = "a video on body doubling" if q.get("video") else q.get("who")
    if name and name not in others:
        others.append(name)
named = ", ".join(others[:-1]) + " and " + others[-1] if len(others) > 1 else "".join(others)
read_on = ", ".join(page_link(k) for k in pages if any(q["read_on"] == k for q in quotes.values()))
credits = [
    f"      <li><strong>Most of the words quoted here are other people&rsquo;s</strong>: {esc(named)}, each "
    "named under their words with where the words come from, and read on our own pages rather than in the "
    "originals, which nobody read for this room. The lines with no other name on them are ours. Everything round "
    "the quotations is ours too, written for this room.</li>",
    "      <li><strong>The floor at the end of the day is ours</strong>, and nobody is drawn on it: the animals are "
    "nobody in particular, and the person lying there is you. It was drawn as code by Claude, an AI model made by "
    "Anthropic, to Ryan&rsquo;s brief, and so were the pet flaps, which are this room&rsquo;s drawings and not the "
    "rooms&rsquo;. Nothing on this page calls an AI while you read it.</li>",
    f"      <li>Every quotation in this room is {cap} words or fewer and was read on one of our own pages, "
    f"{read_on}, on {esc(d['read'])}. <code>tools/make-pets.py</code> checks each one against those pages word "
    "for word whenever our copy of stimpunks.org is on the machine.</li>",
    f"      <li>The type is {esc(display['family'])}, by {esc(display['designer'])}, for the room&rsquo;s name "
    f"and its headings, and {esc(text_face['family'])}, by {esc(text_face['designer'])}, for everything you read, "
    f'both under the {esc(display["licence"].replace(" 1.1", ""))}, read off their own records. More in '
    '<a href="liner-notes.html#pets">the liner notes</a>.</li>',
]
if text_face["licence"] != display["licence"]:
    raise SystemExit("REFUSING: the two faces no longer share a licence, and the credit says one for both.")
swap(ROOM, "pts:credits", '    <ul class="pts-credits">\n' + "\n".join(credits) + "\n    </ul>", "    ")

notes = []
for qid, q in quotes.items():
    who = "a video on body doubling" if q.get("video") else q.get("who") or "Stimpunks"
    notes.append(f'      <tr><td>{esc(q["text"])}</td><td>{esc(who)}</td><td>{page_link(q["read_on"])}</td>'
                 f'<td>{len(q["text"].split())} words</td></tr>')
swap(NOTES, "pets-credits", "\n".join(notes), "      ")


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

css = CSS.read_text()
sec = re.search(r"/\* §127 ── ROOM: Pets.*?(?=/\* §128 )", css, re.S)
if not sec:
    refuse("love.css has no §127 for Pets before §128.")
else:
    s127 = re.sub(r"/\*.*?\*/", " ", sec.group(0), flags=re.S)
    for word in ("@keyframes", "animation", "transition"):
        if word in s127:
            refuse(f"love.css §127: {word!r}. Everybody on the floor is asleep, at every setting. See _no_motion.")

text = re.sub(r"<(script|style|svg)\b.*?</\1>", " ", body, flags=re.S)
text = re.sub(r"<blockquote\b.*?</blockquote>", " ", text, flags=re.S)
text = re.sub(r"<head\b.*?</head>", " ", text, flags=re.S)
text = html.unescape(fold(re.sub(r"<[^>]+>", " ", text)))
sweep(text, ROOM.name)
if problems:
    raise SystemExit("REFUSING, on the published page:\n  " + "\n  ".join(problems))

longest = max(len(q["text"].split()) for q in quotes.values())
print(f"pets: the floor at dusk, {len(quotes)} quotations and {len(door_rows)} pet flaps in {ROOM.name}, "
      f"one for every room tagged pets")
print(f"  longest quotation {longest} words against a cap of {cap}; "
      + ("every one checked against the mirror word for word" if mirror_ok
         else "the Knowledge System mirror is not on this machine, so the quotations were not re-read"))
print("  nothing clinical, no best pet, nobody counted, nothing for sale, and the lamp never on")
