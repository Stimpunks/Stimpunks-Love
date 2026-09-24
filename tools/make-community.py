#!/usr/bin/env python3
"""Build the Community Center's community service board from data/community.json.

The board is a painted steel sorter on the hall's wall with a slot for every room
on the street that takes something in from our community: a photograph, a yell,
a quotation, a tray, an idea for a room. Each slot says what the room takes, what
it asks of you, and how to send it, and links to the room's own words.

A SLOT IS A SENTENCE ABOUT ONE ROOM LIVING IN ANOTHER ROOM'S COPY, which is the
exact shape CLAUDE.md warns about: when the Playhouse changes the terms on its
yell, nothing in the Playhouse knows this board repeats them. So every slot that
repeats a room's terms names, in `holds`, the words on that room's page that
carry them, and THIS TOOL READS THE PUBLISHED PAGE -- never the data file, never
the room's own generator -- and refuses if those words have gone. The board then
cannot go on promising something the room has stopped promising.

IT ALSO REFUSES:
  · a slot whose page, anchor, or listed place does not exist;
  · a route a room does not offer (the routes are listed once, at the top of the
    data file, and a slot names one of them);
  · a form, an input or an endpoint anywhere on the board, because nothing on it
    sends anything and the CB is deliberately not a route;
  · the vocabulary of scoring -- points, rewards, badges, leaderboards, streaks,
    a top anybody -- because a board of ways to give things to a community is
    exactly the shape of thing that grows a table of who gave most.
"""
import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data/community.json"
PAGE = ROOT / "community-center.html"
MARK = "ctr-board"

SCORE = re.compile(
    r"\b(points?(?!\s+(?:at|to|out|of|towards?))|score[sd]?|scoring|rewards?|rewarded|"
    r"badges?|leaderboards?|streaks?|top\s+(?:contributors?|givers?|senders?)|"
    r"most\s+(?:generous|active)|ranked|ranking|tally|tallies)\b", re.I)

NEGATED = re.compile(r"\b(not|no|nothing|never|nor|without)\b[^.;:]*$", re.I)

problems = []


def plain(s):
    """What a reader sees: tags out, entities resolved, curly quotes straightened,
    space folded. Used both for the pages and for the phrases held against them,
    so a phrase with &rsquo; in the data matches ’ on the page."""
    s = re.sub(r"<script.*?</script>|<style.*?</style>", " ", s, flags=re.S)
    s = re.sub(r"<!--.*?-->", " ", s, flags=re.S)
    s = re.sub(r"<[^>]+>", " ", s)
    s = html.unescape(s).replace("’", "'").replace("‘", "'")
    return re.sub(r"\s+", " ", s).strip()


def page_text(name):
    p = ROOT / name
    if not p.exists():
        return None, None
    src = p.read_text()
    return src, plain(src)


data = json.loads(DATA.read_text())
routes = data["routes"]
seen = set()
items = []

for slot in data["slots"]:
    sid = slot.get("id", "?")
    where = f"slot {sid!r}"
    if sid in seen:
        problems.append(f"{where}: the id is used twice.")
    seen.add(sid)
    for key in ("label", "room", "takes", "asks", "route"):
        if not slot.get(key):
            problems.append(f"{where}: no {key}.")
    if slot.get("page") and not slot.get("places") and not slot.get("more"):
        problems.append(f"{where}: no `more`, the words on the link to {slot['page']}. A link "
                        "that says only 'more' tells a screen reader nothing about where it goes.")
    if slot.get("route") not in routes:
        problems.append(f"{where}: route {slot.get('route')!r} is not one the data file lists. "
                        "A slot may only send people the way a room already offers.")

    # Every word a visitor will read on this slot, swept for a score.
    words = " ".join([slot.get("label", ""), slot.get("takes", ""), *slot.get("asks", []),
                      *[p.get("wants", "") for p in slot.get("places", [])]])
    # With make-guild.py's negation window, so a slot can still say out loud
    # that nothing is ranked: a refusal that cannot be stated is a refusal
    # nobody hears about.
    said = plain(words)
    m = next((x for x in SCORE.finditer(said)
              if not NEGATED.search(said[max(0, x.start() - 40):x.start()])), None)
    if m:
        problems.append(f"{where}: {m.group(0)!r} is the vocabulary of a score, and nothing on "
                        "this board is counted, ranked or rewarded.")

    target = slot.get("page")
    if target:
        src, text = page_text(target)
        if src is None:
            problems.append(f"{where}: {target} does not exist.")
        else:
            a = slot.get("anchor")
            if a and not re.search(r'\bid="%s"' % re.escape(a), src):
                problems.append(f"{where}: {target} has no id=\"{a}\" to link to.")
            for phrase in slot.get("holds", []):
                if plain(phrase) not in text:
                    problems.append(
                        f"{where}: {target} no longer says \"{plain(phrase)}\", and this slot "
                        "repeats that room's terms. Read the room, change the slot to say what "
                        "the room says now, and change `holds` with it.")
    for place in slot.get("places", []):
        psrc, ptext = page_text(place["page"])
        if psrc is None:
            problems.append(f"{where}: {place['page']} does not exist.")
            continue
        if place.get("anchor") and not re.search(r'\bid="%s"' % re.escape(place["anchor"]), psrc):
            problems.append(f"{where}: {place['page']} has no id=\"{place['anchor']}\" to link to.")
        for phrase in place.get("holds", []):
            if plain(phrase) not in ptext:
                problems.append(
                    f"{where}: {place['page']} no longer says \"{plain(phrase)}\", and this slot "
                    "sends people there on the strength of it. Read the room and change both.")
    if slot.get("asks") and not slot.get("holds") and target and slot.get("anchor"):
        problems.append(f"{where}: it links to {target}#{slot['anchor']} for that room's terms "
                        "but holds none of them, so nothing would notice the terms changing.")

if problems:
    raise SystemExit("REFUSING:\n  " + "\n  ".join(problems))

# ── The markup ────────────────────────────────────────────────────────────────
out = ['<ul class="ctr-sorter">']
for slot in data["slots"]:
    href = slot.get("page", "")
    if slot.get("anchor"):
        href += "#" + slot["anchor"]
    out.append(f'  <li class="ctr-slot" id="slot-{slot["id"]}">')
    out.append(f'    <h3 class="ctr-slot__label">{slot["label"]}</h3>')
    out.append(f'    <p class="ctr-slot__room">{slot["room"]}</p>')
    out.append('    <div class="ctr-slot__form">')
    out.append(f'      <p class="ctr-slot__takes">{slot["takes"]}</p>')
    if slot.get("places"):
        out.append('      <ul class="ctr-slot__places">')
        for p in slot["places"]:
            ph = p["page"] + ("#" + p["anchor"] if p.get("anchor") else "")
            out.append(f'        <li><a href="{ph}">{p["name"]}</a>: {p["wants"]}.</li>')
        out.append('      </ul>')
    out.append('      <ul class="ctr-slot__asks">')
    for a in slot["asks"]:
        out.append(f"        <li>{a}</li>")
    out.append("      </ul>")
    out.append(f'      <p class="ctr-slot__how">{routes[slot["route"]]}</p>')
    if href and not slot.get("places"):
        out.append(f'      <p class="ctr-slot__more"><a href="{href}">{slot["more"]}</a></p>')
    out.append("    </div>")
    out.append("  </li>")
out.append("</ul>")
block = "\n".join(out)

if re.search(r"<(form|input|textarea|select)\b|action=", block, re.I):
    raise SystemExit("REFUSING: the board would carry a form or an input. Nothing on it sends "
                     "anything; it says how, and the room it points at says the rest.")

src = PAGE.read_text()
pat = re.compile(r"(<!-- %s:begin -->).*?(<!-- %s:end -->)" % (MARK, MARK), re.S)
if not pat.search(src):
    raise SystemExit(f"REFUSING: {PAGE.name} has no {MARK} markers, so there is nowhere to write.")
PAGE.write_text(pat.sub(lambda m: m.group(1) + "\n" + block + "\n" + m.group(2), src))
held = sum(len(s.get("holds", [])) + sum(len(p.get("holds", [])) for p in s.get("places", []))
           for s in data["slots"])
print(f"community service board: written into {PAGE.name}; "
      f"{held} of other rooms' own words held against their published pages")
