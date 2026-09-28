#!/usr/bin/env python3
"""Build the Slake, the world out the back door of the MUD Room, and its credits.

ONE DATA FILE, ONE TOOL: data/mud.json becomes the guidebook in the-mud-room.html
(every place, every thing, every person and every way on), the map the game is
drawn on, the lines the game says, and the list in liner-notes.html.

THE GUIDEBOOK IS THE GAME. mud.js builds nothing out of data attributes it was
handed separately: it reads this markup, clones from it, and hides it. So with
scripts off the Slake is still all there, as a book whose ways on are links, and
the game can never say something the book does not. The Mopery's popups made the
same rule (clones of markup already on the page) for the same reason.

WHAT IT REFUSES, and each is a sentence the room says:

  - A WAY ON WITH NO WAY BACK. Every exit has its opposite from the place it
    leads to, under the same tide. A map that lies about the way back is a trap,
    and the room says you can always go back the way you came.

  - A PLACE YOU CANNOT GET HOME FROM. From every place, at every tide it can be
    reached at, there is a walk back to the MUD Room. The noticeboard says SAY
    HOME AND YOU ARE HOME, and the home command is only honest if the walk
    exists too.

  - A PLACE YOU CANNOT GET TO. Every place is reachable from the MUD Room at one
    tide or the other.

  - A WAY ONTO THE MUD THAT IGNORES THE TIDE. An exit into a tidal place must
    say it only opens while the tide is out, and the ferry only while it is in.

  - A DARK PLACE WITH NOTHING TO READ. A place without light still says what
    you can hear and feel. The lantern adds to it and never unlocks the only
    words there are, because a room that hid its words behind an item would be
    putting its contents behind a puzzle.

  - A PERSON WITHOUT AN IDEA, OR AN IDEA THAT IS NOT OURS TO POINT AT. Every
    resident of the Slake is doing something our glossary has an entry for, and
    says so, linked. The slug is checked against the Knowledge System mirror when
    the mirror is here (it is on Ryan's machine only), and the run says when it
    could not check rather than pretending it did.

  - THE VOCABULARY OF A FIGHT, OR OF A SCORE. Nobody to fight: no kill, attack,
    weapon, damage, hit points, enemy, monster or loot. Nothing is counted: no
    score, points, XP, levelling up, rank, achievement, streak, percentage or
    completion. Ultima Online, which is the brief's inspiration, is built on both,
    and an exploring game is exactly the shape of thing that grows a percentage
    explored. Swept through the data and the room's own words, with the negation
    window so the house rules can say what the Slake will not do.

  - A LINE THAT TELLS ANYBODY TO EAT SOMETHING THEY FOUND. Samphire is on the
    marsh and people forage it; Mycelium Munchies' rule, that nothing here is a
    field guide, holds in an estuary too.

  - A SCRIPT THAT KEEPS OR SOUNDS ANYTHING, OR SENDS ANYTHING ANYWHERE BUT THE
    SLAKE'S OWN FUNCTIONS. The multi-user half is the CB, so mud.js may read the
    radio's pass out of love-cb and never write it (the chalkboard's rule), and
    may send to /cb/mud/ and nowhere else, through one call(). Any other
    storage, any other address, a beacon, a socket or a sound is refused. This
    rule was "sends nothing" until 2026-09-27 and was changed on purpose, here,
    in the same commit as the page and the privacy page.

  - A PLACE THE SERVER DOES NOT KNOW. netlify/cb/lib.mjs names every place in
    MUD_PLACES, and a place the game can walk to that the server refuses would
    be somewhere nobody can meet. The two must be the same list.
"""
import html
import json
import re
import sys
from collections import deque
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data/mud.json"
ROOM = ROOT / "the-mud-room.html"
NOTES = ROOT / "liner-notes.html"
JS = ROOT / "mud.js"
MIRROR = Path.home() / "Documents/Claude/Projects/Stimpunks Knowledge System/site/stimpunks.org/glossary"

OPPOSITE = {"north": "south", "south": "north", "east": "west", "west": "east",
            "up": "down", "down": "up", "in": "out", "out": "in", "across": "across"}
DIRS = {"north": "North", "south": "South", "east": "East", "west": "West",
        "up": "Up", "down": "Down", "in": "In", "out": "Out", "across": "Across"}
WHENS = {"any", "low", "high", "dark", "lit", "boots", "bare"}
WHEN_SAYS = {"low": "At low tide.", "high": "At high tide.", "dark": "Without a light.",
             "lit": "With a light.", "boots": "In wellies.", "bare": "Barefoot."}
TIDE_SAYS = {"low": "while the tide is out", "high": "while the tide is in"}

ENTITY = re.compile(r"&(?:[a-zA-Z][a-zA-Z0-9]{1,31}|#\d{1,6}|#x[0-9a-fA-F]{1,6});")
FIGHT = re.compile(r"\b(?:kill(?:s|ed|ing)?|attack(?:s|ed|ing)?|fight(?:s|ing)?|fought|combat|"
                   r"weapons?|swords?|daggers?|damage|hit ?points|hp|health bar|enem(?:y|ies)|"
                   r"monsters?|slay(?:s|ing)?|loot(?:ing)?|pvp|player ?kill(?:ing|er)?|"
                   r"respawn(?:s|ed)?)\b", re.I)
TALLY = re.compile(r"\b(?:scor(?:e|es|ed|ing)|xp|experience points|level(?:s|led|ling)? up|"
                   r"levelling|leaderboards?|achievements?|streaks?|per ?cent|percentage|"
                   r"\d+\s?%|completion|completed the|high scores?|rank(?:s|ed|ing)?|"
                   # POINTS ONLY AS SOMETHING YOU COLLECT. "a board that points
                   # the way" is the verb; make-guild.py's narrowing, taken over
                   # before its first run this time rather than after it.
                   r"(?:\d+|earn|win|get|gain|collect|scor\w*)\s+points?)\b", re.I)
FORAGE = re.compile(r"\b(?:edible|eat (?:it|them|this|some)|forag(?:e|es|ed|ing|er)|"
                    r"pick (?:it|them|some) (?:to eat|for)|taste[sd]? (?:it|them))\b", re.I)
# THE NEGATION WINDOW KNOWS "DISCARD". Its first run refused the credits'
# sentence that TinyMUD set out to discard combat altogether, which is a history
# of the Slake's own first rule rather than a breach of it; the window was
# widened by one verb of putting something down, rather than the sentence cut.
NEGATED = re.compile(r"\b(?:not|no|nothing|never|nor|without|nobody|none|refuses?|isn['’]t|"
                     r"discard(?:s|ed|ing)?)\b[^.;:]*$", re.I)
KEEPS = re.compile(r"localStorage\.(?:setItem|removeItem|clear)|localStorage\[|sessionStorage|indexedDB|"
                   r"document\.cookie|XMLHttpRequest|sendBeacon|WebSocket|EventSource|AudioContext|"
                   r"speechSynthesis|new Audio\b|\.play\(")
LIB = ROOT / "netlify/cb/lib.mjs"


def esc(s):
    return html.escape(s, quote=False)


def attr(s):
    return html.escape(s, quote=True)


def plain(s):
    s = re.sub(r"<script.*?</script>|<style.*?</style>|<!--.*?-->|<svg.*?</svg>", " ", s, flags=re.S)
    s = re.sub(r"<[^>]+>", " ", s)
    return re.sub(r"\s+", " ", html.unescape(s)).strip()


def swap(page, marker, block, indent=""):
    begin, end = f"<!-- {marker}:begin -->", f"<!-- {marker}:end -->"
    src = page.read_text()
    if begin not in src or end not in src:
        raise SystemExit(f"REFUSING: {page.name} has no {marker} markers, so there is nowhere to write.")
    page.write_text(re.sub(re.escape(begin) + r".*?" + re.escape(end),
                           lambda m: begin + "\n" + block + "\n" + indent + end, src, flags=re.S))


def sweep(text, where, bad):
    for pat, why in ((FIGHT, "the vocabulary of a fight, and there is nobody to fight on the Slake"),
                     (TALLY, "the vocabulary of a score, and nothing on the Slake is counted"),
                     (FORAGE, "telling somebody to eat what they found, and nothing here is a field guide")):
        for m in pat.finditer(text):
            if NEGATED.search(text[max(0, m.start() - 70):m.start()]):
                continue
            bad.append(f"{where} says {m.group(0)!r}, which is {why}.")


def idea_link(idea):
    return (f'<a href="https://stimpunks.org/glossary/{attr(idea["slug"])}/">'
            f'{esc(idea["name"])}</a>')


def with_idea(text, idea):
    out = esc(text)
    if "{idea}" in text:
        out = out.replace("{idea}", idea_link(idea))
    return out


# ── The checks ────────────────────────────────────────────────────────────────

def reachable(places, start, tide):
    """Every place you can walk to from start at one tide, without waiting."""
    by = {p["id"]: p for p in places}
    seen, q = {start}, deque([start])
    while q:
        here = by[q.popleft()]
        for e in here["exits"]:
            if e.get("tide") not in (None, tide):
                continue
            if by[e["to"]].get("tidal") and tide != "low":
                continue
            if e["to"] not in seen:
                seen.add(e["to"])
                q.append(e["to"])
    return seen


def check(d, page, js):
    bad = []
    places = d.get("places") or []
    things, people = d.get("things") or {}, d.get("people") or {}
    by = {p["id"]: p for p in places}
    if d.get("start") not in by:
        bad.append(f"the start, {d.get('start')!r}, is not a place.")
        return bad
    if len(by) != len(places):
        bad.append("two places share an id.")
    cells = {}
    used_things, used_people = [], []
    for p in places:
        pid = p["id"]
        where = f"place {pid!r}"
        cell = (p.get("x"), p.get("y"))
        if not all(isinstance(v, int) for v in cell):
            bad.append(f"{where} has no whole-number x and y, so there is nowhere to draw it on the map.")
        elif cell in cells:
            bad.append(f"{where} and {cells[cell]!r} are drawn in the same square of the map.")
        cells[cell] = pid
        if pid not in DRAW:
            bad.append(f"{where} has no drawing. Every place on the map is drawn, and a place "
                       "the map cannot show is one somebody finds only by reading.")
        text = p.get("text") or {}
        for w in text:
            if w not in WHENS:
                bad.append(f"{where} has text for {w!r}, and the Slake knows {', '.join(sorted(WHENS))}.")
        if p.get("dark"):
            if not (text.get("dark") and text.get("lit")):
                bad.append(f"{where} is dark and needs words for both without a light and with one. "
                           "A dark place still says what you can hear and feel.")
        elif not (text.get("any") or (text.get("low") and text.get("high"))):
            bad.append(f"{where} needs words for any tide, or for both low and high.")
        if p.get("tidal") and not (text.get("boots") and text.get("bare")):
            bad.append(f"{where} is out on the mud and needs a line in wellies and a line barefoot.")
        for k, v in list(text.items()) + [("sit", p.get("sit", ""))]:
            if ENTITY.search(v or ""):
                bad.append(f"{where}'s {k} has an HTML entity in it; write the character.")
        for t in p.get("things", []):
            if t not in things:
                bad.append(f"{where} has a thing, {t!r}, that is not in things.")
            used_things.append(t)
        for h in p.get("people", []):
            if h not in people:
                bad.append(f"{where} has a person, {h!r}, who is not in people.")
            used_people.append(h)
        for e in p.get("exits", []):
            to, dr = e.get("to"), e.get("dir")
            if dr not in OPPOSITE:
                bad.append(f"{where} has a way on {dr!r}, and the Slake knows {', '.join(OPPOSITE)}.")
                continue
            if to not in by:
                bad.append(f"{where} goes {dr} to {to!r}, which is not a place.")
                continue
            if not e.get("way"):
                bad.append(f"{where}'s way {dr} does not say what the way is.")
            if by[to].get("tidal") and e.get("tide") != "low":
                bad.append(f"{where} goes {dr} onto {to!r}, which is out on the mud, and the way does "
                           "not say it only opens while the tide is out.")
            if dr == "across" and e.get("tide") != "high":
                bad.append(f"{where} goes across on the ferry, and the ferry only runs while the tide is in.")
            back = [b for b in by[to].get("exits", []) if b.get("to") == pid and b.get("dir") == OPPOSITE[dr]]
            if not back:
                bad.append(f"{where} goes {dr} to {to!r}, and there is no way {OPPOSITE[dr]} from "
                           "there back again. Every way on has its way back.")
            elif (back[0].get("tide") or None) != (e.get("tide") or None) and not (
                    by[to].get("tidal") or p.get("tidal")):
                bad.append(f"{where} and {to!r} disagree about when the way between them is open.")
        if p.get("tidal") and p.get("sit"):
            bad.append(f"{where} is out on the mud and has somewhere to sit, and the Slake only lets "
                       "you stop somewhere dry.")
    for t in things:
        if used_things.count(t) != 1:
            bad.append(f"the thing {t!r} is in {used_things.count(t)} places; a thing starts in one.")
    for h in people:
        if used_people.count(h) != 1:
            bad.append(f"{people[h].get('name', h)!r} is in {used_people.count(h)} places.")

    # REACHABLE, AND HOME FROM EVERYWHERE, AT EACH TIDE A PLACE CAN BE AT.
    start = d["start"]
    low, high = reachable(places, start, "low"), reachable(places, start, "high")
    for p in places:
        if p["id"] not in low | high:
            bad.append(f"place {p['id']!r} cannot be reached from {start!r} at either tide.")
        for tide in ("low", "high"):
            if p.get("tidal") and tide == "high":
                continue
            if start not in reachable(places, p["id"], tide):
                bad.append(f"place {p['id']!r} has no walk home to {start!r} at {tide} tide. "
                           "The noticeboard says SAY HOME AND YOU ARE HOME, and that is only honest "
                           "if the walk is there too.")

    for tid, t in things.items():
        where = f"thing {tid!r}"
        if not t.get("name") or not t.get("words"):
            bad.append(f"{where} needs a name and the words somebody might type for it.")
        look = t.get("look") or {}
        if not look:
            bad.append(f"{where} has nothing to say when somebody looks at it.")
        for w in look:
            if w not in WHENS:
                bad.append(f"{where} has words for {w!r}.")
        if t.get("find") and not t.get("lore"):
            bad.append(f"{where} is a find and Ada has nothing to say about it; the table is where "
                       "a find is for.")
        if t.get("idea") and "{idea}" not in look.get("any", ""):
            bad.append(f"{where} carries an idea and its words never link it.")
    for hid, h in people.items():
        where = f"{h.get('name', hid)!r}"
        idea = h.get("idea") or {}
        if not idea.get("slug") or not idea.get("name"):
            bad.append(f"{where} is doing nothing our glossary has an entry for. Every resident of "
                       "the Slake is, and says so.")
        says = h.get("says") or []
        if len(says) < 2 or not any("{idea}" in s for s in says):
            bad.append(f"{where} never names what they are doing. The idea is in their own "
                       "second line, linked.")
        if not h.get("here"):
            bad.append(f"{where} has no line saying what they are doing when you arrive.")
    ideas = [h["idea"]["slug"] for h in people.values() if h.get("idea")] + \
            [t["idea"]["slug"] for t in things.values() if t.get("idea")]
    if len(set(ideas)) != len(ideas):
        bad.append("two residents or things point at the same glossary entry; every one of them is "
                   "a different idea.")
    if MIRROR.is_dir():
        for slug in ideas:
            if not (MIRROR / f"{slug}.md").is_file():
                bad.append(f"the glossary slug {slug!r} is not in the Knowledge System mirror. On "
                           "stimpunks.org a redirect is a failure, not a pass.")
    else:
        print("mud room: the Knowledge System mirror is not on this machine, so the glossary slugs "
              "were not checked. Check any new one on the live site, and a redirect is a failure.")

    # THE WORDS: the data, then the room's own copy, then the script.
    for p in places:
        sweep(" ".join(list(p.get("text", {}).values()) + [p.get("sit", "")]), f"place {p['id']!r}", bad)
        for e in p.get("exits", []):
            sweep(e.get("way", ""), f"place {p['id']!r}'s way {e.get('dir')}", bad)
    for tid, t in things.items():
        sweep(" ".join(list(t.get("look", {}).values()) + [t.get("lore", ""), t.get("name", "")]),
              f"thing {tid!r}", bad)
    for hid, h in people.items():
        sweep(" ".join(h.get("says", []) + h.get("join", []) + [h.get("here", "")]), f"{hid!r}", bad)
    for k in ("home", "say-signon", "say-unseen", "sit", "slide", "dark-blocked", "unknown"):
        sweep(d.get(k, ""), f"the line {k!r}", bad)
    for k, v in list(d.get("wait", {}).items()) + list(d.get("closed", {}).items()):
        sweep(v, f"the line {k!r}", bad)
    for k in ("wait", "closed"):
        if set(d.get(k, {})) != ({"to-high", "to-low", "not-here"} if k == "wait" else {"low", "high"}):
            bad.append(f"the {k} lines are not all there.")
    said = plain(re.sub(r"<!-- mud:(?:book|lines):begin -->.*?<!-- mud:(?:book|lines):end -->", " ",
                        page, flags=re.S))
    sweep(said, "the room", bad)
    for promise in ("nobody to fight", "nothing is counted", "the tide turns when you wait"):
        if promise not in said.lower() and promise not in plain(page).lower():
            bad.append(f"the room no longer says {promise!r}.")
    if KEEPS.search(js):
        bad.append(f"mud.js uses {KEEPS.search(js).group(0)!r}. The room says the Slake keeps nothing, "
                   "makes no sound, and sends only to its own functions.")
    reads = re.findall(r"localStorage\.getItem\(\s*'([^']*)'", js)
    if len(reads) != js.count("localStorage.") or any(k != "love-cb" for k in reads):
        bad.append("mud.js touches localStorage for something other than reading love-cb, the radio's "
                   "pass. It reads that and nothing else, and never writes it.")
    if js.count("fetch(") != 1:
        bad.append("mud.js sends from somewhere other than its one call(). Everything it sends goes "
                   "through that, so this tool can see every address.")
    for path in re.findall(r"call\(\s*'([^']*)'", js):
        if not path.startswith("/cb/mud/"):
            bad.append(f"mud.js sends to {path!r}, and the Slake sends to /cb/mud/ and nowhere else.")
    m = re.search(r"export const MUD_PLACES = \[([^\]]*)\];", LIB.read_text())
    server = set(re.findall(r"'([a-z0-9-]+)'", m.group(1))) if m else None
    if server is None:
        bad.append("netlify/cb/lib.mjs has no MUD_PLACES array to read.")
    elif server != {p["id"] for p in places}:
        diff = sorted(server ^ {p["id"] for p in places})
        bad.append(f"the server's MUD_PLACES and data/mud.json disagree about {', '.join(diff)}. A place "
                   "the game can walk to and the server refuses is somewhere nobody can meet.")
    return bad


# ── The drawings ──────────────────────────────────────────────────────────────
# One small drawing per place, centred on the place's square of the map and
# inside a circle of about 30 units, in the Slake's own inks. They are the
# map's drawings and not pictures of anything real. Nothing in any of them
# moves. Every one is aria-hidden with the map; the place says what it is in
# words.

S, T, M, R, G, W = "var(--mud-silver)", "var(--mud-text)", "var(--mud-marsh)", \
    "var(--mud-reed)", "var(--mud-ground)", "var(--mud-welly)"
DRAW = {
    # A narrow house end-on: a pitched roof, a back door with a window in it.
    "mud-room": f'<path d="M-24 22 V-6 L0 -26 L24 -6 V22 Z" fill="var(--mud-bank)" stroke="{T}" stroke-width="2" stroke-linejoin="round"/>'
                f'<rect x="-8" y="0" width="16" height="22" fill="{G}" stroke="{T}" stroke-width="1.6"/>'
                f'<rect x="-4.5" y="4" width="9" height="7" fill="{S}"/>',
    # A length of grassed bank with its path along the top.
    "sea-wall": f'<path d="M-30 12 Q-15 -6 0 -6 Q15 -6 30 12 Z" fill="var(--mud-land)" stroke="{M}" stroke-width="2"/>'
                f'<path d="M-24 4 Q0 -10 24 4" fill="none" stroke="{T}" stroke-width="1.6" stroke-dasharray="3 3"/>',
    # A hut with one long slot of a window.
    "hide": f'<path d="M-24 18 V-4 L0 -18 L24 -4 V18 Z" fill="var(--mud-bank)" stroke="{T}" stroke-width="2" stroke-linejoin="round"/>'
            f'<rect x="-16" y="0" width="32" height="4" fill="{S}"/>',
    # Reeds, a stand of thin stems with seed heads leaning the same way.
    "reedbed": "".join(f'<path d="M{x} 20 Q{x+2} 0 {x+5} -{14+(i%3)*5}" fill="none" stroke="{R}" stroke-width="1.8" stroke-linecap="round"/>'
                       f'<ellipse cx="{x+5}" cy="-{16+(i%3)*5}" rx="2" ry="5" fill="{R}"/>'
                       for i, x in enumerate(range(-24, 25, 8))),
    # Marsh: tufts either side of a winding little creek.
    "saltmarsh": f'<path d="M-26 14 Q-8 4 0 14 T26 10" fill="none" stroke="{S}" stroke-width="2.4" stroke-linecap="round"/>'
                 + "".join(f'<path d="M{x} {y} v-10 M{x-3} {y} v-7 M{x+3} {y} v-7" stroke="{M}" stroke-width="2" stroke-linecap="round"/>'
                           for x, y in ((-18, 2), (-4, -6), (12, -2), (20, 20), (-12, 22))),
    # A hut with its front propped open and a thread of steam off the kettle.
    "tea-hut": f'<path d="M-22 18 V-4 L-24 -6 H24 L22 -4 V18 Z" fill="var(--mud-bank)" stroke="{T}" stroke-width="2" stroke-linejoin="round"/>'
               f'<path d="M-24 -6 L-6 -22 H24 L24 -6" fill="none" stroke="{T}" stroke-width="1.6"/>'
               f'<rect x="-12" y="4" width="24" height="14" fill="{G}"/>'
               f'<path d="M2 -26 q-4 -5 0 -10 q4 -5 0 -10" fill="none" stroke="{S}" stroke-width="1.6" stroke-linecap="round"/>',
    # A weatherboarded mill with its wheel at the side.
    "tide-mill": f'<rect x="-22" y="-14" width="30" height="34" fill="var(--mud-sky)" stroke="{T}" stroke-width="1.6"/>'
                 f'<path d="M-24 -14 L-7 -28 L10 -14 Z" fill="var(--mud-bank)" stroke="{T}" stroke-width="1.6" stroke-linejoin="round"/>'
                 f'<path d="M-22 -4 H8 M-22 6 H8" stroke="var(--mud-dim)" stroke-width="1"/>'
                 f'<circle cx="16" cy="10" r="11" fill="none" stroke="{S}" stroke-width="2"/>'
                 f'<path d="M16 -1 V21 M5 10 H27 M8 2 L24 18 M24 2 L8 18" stroke="{S}" stroke-width="1.3"/>',
    # A pit in the dark, with a ladder going down into it.
    "wheel-pit": f'<rect x="-22" y="-20" width="44" height="40" rx="4" fill="var(--mud-deep)" stroke="var(--mud-dim)" stroke-width="1.6"/>'
                 f'<path d="M-8 -20 V20 M8 -20 V20 M-8 -12 H8 M-8 -4 H8 M-8 4 H8 M-8 12 H8" stroke="{T}" stroke-width="1.6"/>',
    # A hut up on stilts, and the long table showing through its window.
    "mudlarks-hut": f'<path d="M-22 4 V-12 L0 -24 L22 -12 V4 Z" fill="var(--mud-bank)" stroke="{T}" stroke-width="2" stroke-linejoin="round"/>'
                    f'<path d="M-18 4 V24 M-6 4 V24 M6 4 V24 M18 4 V24" stroke="{T}" stroke-width="2"/>'
                    f'<rect x="-14" y="-8" width="28" height="7" fill="{S}"/>'
                    f'<path d="M-10 -4.5 h3 M-3 -4.5 h2 M4 -4.5 h4" stroke="{G}" stroke-width="2"/>',
    # A bend of the creek and a heron standing in it.
    "creek": f'<path d="M-26 -18 Q0 -10 -4 4 T26 22" fill="none" stroke="{S}" stroke-width="7" stroke-linecap="round"/>'
             f'<path d="M6 8 V-12 Q6 -20 12 -20 L16 -18 M6 -2 Q-2 -2 -2 6 L6 8" fill="none" stroke="{T}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>'
             f'<path d="M4 8 L2 16 M8 8 L9 16" stroke="{T}" stroke-width="1.4"/>',
    # A tall shed open at one end, a boat on trestles inside.
    "boathouse": f'<path d="M-24 22 V-8 L0 -26 L24 -8 V22" fill="var(--mud-bank)" stroke="{T}" stroke-width="2" stroke-linejoin="round"/>'
                 f'<path d="M-14 8 Q0 18 14 8" fill="none" stroke="{R}" stroke-width="2.4" stroke-linecap="round"/>'
                 f'<path d="M-8 10 V2 M0 13 V2 M8 10 V2" stroke="{R}" stroke-width="1.4"/>'
                 f'<path d="M-12 12 V22 M12 12 V22" stroke="{T}" stroke-width="1.6"/>',
    # Shingle and small finds along a line of mud.
    "foreshore": f'<path d="M-28 -2 Q0 -12 28 -2" fill="none" stroke="{M}" stroke-width="2"/>'
                 + "".join(f'<circle cx="{x}" cy="{y}" r="{r}" fill="var(--mud-dim)"/>'
                           for x, y, r in ((-18, 8, 2.2), (-8, 14, 1.6), (4, 6, 2), (14, 16, 2.4), (22, 6, 1.6), (-2, 22, 1.8)))
                 + f'<rect x="-14" y="18" width="10" height="2.6" rx="1.3" fill="var(--mud-sky)"/>'
                 + f'<circle cx="10" cy="-4" r="2.6" fill="var(--mud-glass)"/>',
    # Open mud, casts coiled on it and one shining channel.
    "mudflat": f'<path d="M-28 16 Q-6 8 4 14 T28 8" fill="none" stroke="{S}" stroke-width="3" stroke-linecap="round"/>'
               + "".join(f'<path d="M{x} {y} q3 -3 0 -5 q-3 -2 0 -4" fill="none" stroke="var(--mud-dim)" stroke-width="1.6" stroke-linecap="round"/>'
                         for x, y in ((-18, -4), (-4, -10), (10, -2), (20, -14), (-12, 6)))
               + f'<path d="M14 2 q-2 -8 4 -10 l6 3" fill="none" stroke="{T}" stroke-width="1.6" stroke-linecap="round"/>',
    # Steps down a bank, a post with a bell, a rowing boat at the bottom.
    "ferry-steps": f'<path d="M-24 -18 H-12 V-10 H-2 V-2 H8 V6 H18" fill="none" stroke="{T}" stroke-width="2" stroke-linejoin="round"/>'
                   f'<path d="M-20 -18 V-30 M-20 -28 H-14" stroke="{T}" stroke-width="1.6"/>'
                   f'<path d="M-15 -28 q1 6 -1 6 h4 q-2 0 -1 -6" fill="{W}"/>'
                   f'<path d="M0 16 Q14 24 28 16 L24 22 Q14 28 4 22 Z" fill="var(--mud-bank)" stroke="{T}" stroke-width="1.6" stroke-linejoin="round"/>',
    # A causeway: a band of stones with posts along it.
    "causeway": f'<path d="M0 -30 V30" stroke="var(--mud-dim)" stroke-width="10"/>'
                + "".join(f'<path d="M{s*9} {y} v-12" stroke="{T}" stroke-width="2.2" stroke-linecap="round"/>'
                          for s, y in ((-1, -14), (1, -2), (-1, 10), (1, 22))),
    # A grassy island with the striped beacon on it.
    "holm": f'<ellipse cx="0" cy="12" rx="28" ry="12" fill="var(--mud-land)" stroke="{M}" stroke-width="2"/>'
            f'<rect x="-4" y="-26" width="8" height="34" fill="var(--mud-sky)" stroke="{T}" stroke-width="1.2"/>'
            f'<path d="M-4 -18 H4 M-4 -10 H4 M-4 -2 H4" stroke="var(--mud-deep)" stroke-width="4"/>'
            f'<circle cx="16" cy="10" r="3.4" fill="none" stroke="{T}" stroke-width="1.4"/>',
    # The beacon's platform, seen from above, with the Slake round it.
    "beacon-top": f'<circle cx="0" cy="0" r="24" fill="none" stroke="{S}" stroke-width="1.6" stroke-dasharray="2 4"/>'
                  f'<rect x="-11" y="-11" width="22" height="22" fill="var(--mud-bank)" stroke="{T}" stroke-width="2"/>'
                  f'<path d="M-11 -4 H11 M-11 4 H11" stroke="var(--mud-sky)" stroke-width="3"/>',
}

UNIT, PAD = 120, 60
# THE FOOTPRINT is a yellow welly, because that is what you took off the rack.
# It stands off to the upper right of the place it is at, so it never covers the
# place's own drawing.
ME = (f'<g class="mud-me" id="mud-me" transform="translate({PAD + UNIT} {PAD})"><g transform="translate(27 -27)">'
      f'<circle r="15" fill="var(--mud-deep)"/>'
      f'<ellipse cx="0" cy="-3" rx="5.5" ry="7.5" fill="{W}"/><ellipse cx="0" cy="8" rx="4.2" ry="3.8" fill="{W}"/>'
      f'<path d="M-3 -6 H3 M-3 -2 H3" stroke="var(--mud-deep)" stroke-width="1.2"/></g></g>')


def centre(p):
    return PAD + p["x"] * UNIT, PAD + p["y"] * UNIT


def the_map(d):
    places = d["places"]
    by = {p["id"]: p for p in places}
    w = PAD * 2 + UNIT * max(p["x"] for p in places)
    h = PAD * 2 + UNIT * max(p["y"] for p in places) + 20
    out = [f'<svg class="mud-map__svg" id="mud-svg" viewBox="0 0 {w} {h}" data-tide="{d["tide"]}" '
           'aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">']
    # THE GROUND: land behind the wall, the wall, the marsh, and the mud to the
    # foot of the map, with the creek running down it to the sea. The tide is a
    # sheet of water laid over the mud and shown only at high tide.
    wall_y = PAD + UNIT
    out.append(f'<rect width="{w}" height="{h}" fill="var(--mud-ground)"/>')
    out.append(f'<rect width="{w}" height="{wall_y - 22}" fill="var(--mud-land)"/>')
    out.append(f'<rect y="{wall_y - 22}" width="{w}" height="44" fill="var(--mud-bank)"/>')
    out.append(f'<path d="M0 {wall_y + 22} H{w} V{wall_y + UNIT + 40} Q{w*.6} {wall_y + UNIT + 60} {w*.3} {wall_y + UNIT + 44} T0 {wall_y + UNIT + 50} Z" fill="var(--mud-marsh-dk)"/>')
    mill, creek, ferry = centre(by["tide-mill"]), centre(by["creek"]), centre(by["ferry-steps"])
    creek_d = (f'M{mill[0]} {mill[1] + 20} Q{creek[0] + 16} {creek[1] - 40} {creek[0]} {creek[1]} '
               f'T{ferry[0]} {ferry[1]} Q{ferry[0] + 40} {ferry[1] + 80} {w - 20} {h - 60} L{w} {h}')
    out.append(f'<path class="mud-creek" d="{creek_d}" fill="none" stroke="var(--mud-silver)" stroke-width="12" stroke-linecap="round"/>')
    out.append(f'<path class="mud-channel" d="M{PAD - 40} {h - 40} Q{PAD + 90} {h - 110} {PAD + 150} {h - 190} T{PAD + 250} {h - 330}" fill="none" stroke="var(--mud-silver)" stroke-width="4" stroke-linecap="round" opacity=".8"/>')
    out.append(f'<path class="mud-tide" d="M0 {wall_y + UNIT + 44} Q{w*.3} {wall_y + UNIT + 30} {w*.6} {wall_y + UNIT + 52} T{w} {wall_y + UNIT + 38} V{h} H0 Z" fill="var(--mud-high)"/>')
    holm = centre(by["holm"])
    out.append(f'<ellipse cx="{holm[0]}" cy="{holm[1] + 6}" rx="64" ry="34" fill="var(--mud-land)"/>')
    # THE WAYS BETWEEN PLACES, drawn when both ends are at least known.
    done = set()
    for p in places:
        for e in p["exits"]:
            key = tuple(sorted((p["id"], e["to"])))
            if key in done:
                continue
            done.add(key)
            a, b = centre(p), centre(by[e["to"]])
            if e["dir"] == "across":
                mx, my = (a[0] + b[0]) / 2 + 50, (a[1] + b[1]) / 2 + 10
                dd = f"M{a[0]} {a[1]} Q{mx} {my} {b[0]} {b[1]}"
                cls = "mud-link mud-link--ferry"
            else:
                dd = f"M{a[0]} {a[1]} L{b[0]} {b[1]}"
                cls = "mud-link mud-link--tide" if e.get("tide") else "mud-link"
            out.append(f'<path class="{cls}" data-a="{key[0]}" data-b="{key[1]}" d="{dd}"/>')
    for p in places:
        x, y = centre(p)
        name = esc(p["name"])
        italic = ' font-style="italic"' if p.get("water") else ""
        tidal = " data-tidal" if p.get("tidal") else ""
        out.append(f'<g class="mud-node" data-node="{p["id"]}"{tidal} transform="translate({x} {y})">'
                   f'<circle class="mud-node__ring" r="36"/>'
                   f'<g class="mud-node__draw">{DRAW[p["id"]]}</g>'
                   f'<text class="mud-node__q" y="7" text-anchor="middle">?</text>'
                   f'<text class="mud-node__name" y="52" text-anchor="middle"{italic}>{name}</text></g>')
    out.append(ME.replace(f"translate({PAD + UNIT} {PAD})", "translate(%d %d)" % centre(by[d["start"]])))
    out.append("</svg>")
    return "\n".join(out)


# ── The guidebook ─────────────────────────────────────────────────────────────

def variants(text, cls, idea=None, tag="p"):
    """A block for each variant, labelled for the book; mud.js strips the label."""
    out = []
    for w in ("any", "low", "high", "dark", "lit", "boots", "bare"):
        if w not in text:
            continue
        label = "" if w == "any" else f'<span class="mud-when">{WHEN_SAYS[w]}</span> '
        out.append(f'<{tag} class="{cls}" data-when="{w}">{label}{with_idea(text[w], idea or {})}</{tag}>')
    return out


def book(d):
    places, things, people = d["places"], d["things"], d["people"]
    by = {p["id"]: p for p in places}
    out = []
    for p in places:
        a = [f'data-place="{p["id"]}"', f'data-x="{p["x"]}"', f'data-y="{p["y"]}"']
        for flag in ("tidal", "dark", "reveal", "water"):
            if p.get(flag):
                a.append(f"data-{flag}")
        out.append(f'      <article class="mud-place" id="mud-at-{p["id"]}" {" ".join(a)}>')
        out.append(f'        <h3 class="mud-place__name">{esc(p["name"])}</h3>')
        for line in variants(p["text"], "mud-text"):
            out.append("        " + line)
        if p.get("sit"):
            out.append(f'        <p class="mud-sit"><span class="mud-when">If you sit down.</span> {esc(p["sit"])}</p>')
        if p.get("things"):
            out.append('        <ul class="mud-things">')
            for tid in p["things"]:
                t = things[tid]
                ta = [f'data-thing="{tid}"', f'data-words="{attr("|".join(t["words"]))}"']
                for flag in ("take", "wear", "find"):
                    if t.get(flag):
                        ta.append(f"data-{flag}")
                if t.get("seen"):
                    ta.append(f'data-seen="{t["seen"]}"')
                seen = f' <span class="mud-when">Only {TIDE_SAYS[t["seen"]]}.</span>' if t.get("seen") else ""
                looks = "".join(variants(t["look"], "mud-look", t.get("idea"), "span"))
                lore = (f' <span class="mud-lore"><span class="mud-when">If you show it to Ada.</span> '
                        f'{esc(t["lore"])}</span>') if t.get("lore") else ""
                out.append(f'          <li class="mud-thing" {" ".join(ta)}><b class="mud-thing__name">'
                           f'{esc(t["name"])}</b>.{seen} {looks}{lore}</li>')
            out.append("        </ul>")
        if p.get("people"):
            out.append('        <ul class="mud-people">')
            for hid in p["people"]:
                h = people[hid]
                says = " ".join(f'<span class="mud-says">{with_idea(s, h["idea"])}</span>' for s in h["says"])
                join = "".join(f' <span class="mud-join"><span class="mud-when">If you join in.</span> '
                               f'{esc(j)}</span>' for j in h.get("join", []))
                out.append(f'          <li class="mud-person" data-person="{hid}" '
                           f'data-words="{attr("|".join(h["words"]))}"><b class="mud-person__name">'
                           f'{esc(h["name"])}</b>. <span class="mud-here">{esc(h["here"])}</span> '
                           f'{says}{join}</li>')
            out.append("        </ul>")
        ways = []
        for e in p["exits"]:
            tide = f' ({TIDE_SAYS[e["tide"]]})' if e.get("tide") else ""
            tt = f' data-tide="{e["tide"]}"' if e.get("tide") else ""
            ways.append(f'<a class="mud-way" href="#mud-at-{e["to"]}" data-dir="{e["dir"]}" '
                        f'data-to="{e["to"]}"{tt}>{DIRS[e["dir"]]}, {esc(e["way"])}{tide}</a>')
        out.append(f'        <p class="mud-ways"><span class="mud-when">Ways on:</span> {" &middot; ".join(ways)}</p>')
        if p.get("leave"):
            out.append(f'        <p class="mud-leave"><a href="{attr(p["leave"]["href"])}">'
                       f'{esc(p["leave"]["words"])}</a></p>')
        out.append("      </article>")
    return "\n".join(out)


def lines(d):
    """The things the Slake says that belong to no one place. Hidden: mud.js
    reads them and the book does not need them."""
    out = ['      <div class="mud-lines" hidden>']
    flat = {"home": d["home"], "say-signon": d["say-signon"], "say-unseen": d["say-unseen"],
            "sit": d["sit"], "slide": d["slide"],
            "dark-blocked": d["dark-blocked"], "unknown": d["unknown"]}
    for k, v in d["wait"].items():
        flat["wait-" + k] = v
    for k, v in d["closed"].items():
        flat["closed-" + k] = v
    flat["nothing"] = d["nothing"]
    for k, v in flat.items():
        out.append(f'        <p data-line="{k}">{esc(v)}</p>')
    out.append("      </div>")
    return "\n".join(out)


def credits(d):
    rows = []
    for hid, h in d["people"].items():
        where = next(p["name"] for p in d["places"] if hid in p.get("people", []))
        rows.append(f'      <tr><td>{esc(h["name"])}</td><td>{esc(where)}</td>'
                    f'<td>{idea_link(h["idea"])}</td></tr>')
    for tid, t in d["things"].items():
        if t.get("idea"):
            where = next(p["name"] for p in d["places"] if tid in p.get("things", []))
            rows.append(f'      <tr><td>{esc(t["name"][0].upper() + t["name"][1:])}</td>'
                        f'<td>{esc(where)}</td><td>{idea_link(t["idea"])}</td></tr>')
    return "\n".join(rows)


def main():
    d = json.loads(DATA.read_text())
    bad = check(d, ROOM.read_text(), JS.read_text())
    if bad:
        print("REFUSING to build the Slake:")
        for b in bad:
            print("  - " + b)
        return 1
    swap(ROOM, "mud:map", the_map(d), "          ")
    swap(ROOM, "mud:lines", lines(d), "      ")
    swap(ROOM, "mud:book", book(d), "      ")
    swap(ROOM, "mud:checked", f'    <p class="mud-further">{esc(d["_checked"])}</p>', "")
    swap(NOTES, "mud-credits", credits(d), "      ")
    print("mud room: the Slake is built, every way on has its way back, there is a walk home from "
          "every place at every tide it can be reached at, and nobody on it is counted.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
