#!/usr/bin/env python3
"""Write the neighbours line into every home on the campgrounds.

Helen Edgar's ask, 2026-10-17: a line in her Faery Yurt, Jess's Bough House
and Ryan's Solarpunk Hermitage that sends a visitor to the others, each named
with the room's name and whose it is, linked, and kept up to date as people
join, so the commit that brings a new pitch brings the whole list with it.

THE LIST IS THE CAMPGROUNDS' BOARD, READ AGAIN EVERY RUN, and nothing else.
A home is a pitch whose sign names a person, not Stimpunks, and has a door: a
link on its name. Every home gets every other home, in the board's own order,
between the neighbours markers, so a new pitch on the board is a new name on
every neighbour's line the next time tools/check-all.sh runs. Nobody keeps a
list by hand, because a hand-kept list is the one that forgets somebody.

IT IS A STREET CONVENTION, and wears the room's own ink: a plain paragraph
with no colour of its own, so every room's own paragraph and link colours
dress it, the job marker's rule. Nothing is counted on it.

IT REFUSES:
  - a home on the board whose page has no neighbours markers, because then the
    home would be on everybody else's line and nobody would be on its own.
  - neighbours markers on a page that is not a home on the board, because
    that line would be a list of rooms that are not its neighbours.
  - a sign with no name of a person on it.
"""
import html
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BOARD = ROOT / "campgrounds.html"
BEGIN, END = "<!-- neighbours:begin -->", "<!-- neighbours:end -->"
NOT_A_PERSON = {"Stimpunks"}


def refuse(msg):
    print("REFUSING: " + msg)
    sys.exit(1)


def homes():
    src = BOARD.read_text()
    out = []
    for m in re.finditer(r'<li class="pitch(?: pitch--[a-z]+)*">(.*?)</li>', src, re.S):
        body = m.group(1)
        no = re.search(r'<span class="pitch__no">(.*?)</span>', body)
        h3 = re.search(r'<h3>(.*?)</h3>', body, re.S)
        who = re.search(r'<p class="pitch__who">(.*?)</p>', body, re.S)
        if not (no and h3 and who):
            refuse("a pitch on campgrounds.html has no number, no name or no line saying whose it is.")
        whose = who.group(1).split("&middot;")[0].strip()
        if not whose:
            refuse(f"{no.group(1)} names nobody on its sign.")
        link = re.search(r'<a href="([^"#]+\.html)">(.*?)</a>', h3.group(1), re.S)
        if whose in NOT_A_PERSON or not link:
            continue
        out.append({"no": no.group(1).strip().title(), "page": link.group(1),
                    "name": link.group(2).strip(), "whose": whose})
    if not out:
        refuse("found no home on the campgrounds' board. The sign markup has changed; teach this to read it.")
    return out


def possessive(name):
    return name + "&rsquo;s"


def bare(name):
    # "Helen Edgar's Faery Yurt", not "Helen Edgar's The Faery Yurt"
    return name[4:] if name.startswith("The ") else name


def line(me, everyone):
    others = [h for h in everyone if h["page"] != me]
    if not others:
        return ('<p class="neighbours">Nobody else has pitched a home on the campgrounds yet; '
                'when somebody does, they will be named here.</p>')
    bits = [f'{possessive(h["whose"])} <a href="{h["page"]}">{bare(h["name"])}</a> at {h["no"].lower()}' for h in others]
    said = bits[0] if len(bits) == 1 else ", ".join(bits[:-1]) + " and " + bits[-1]
    return ('<p class="neighbours"><strong>The neighbours on the campgrounds</strong>, down the pebble paths '
            f'from <a href="campgrounds.html#between">the pond</a>: {said}. Go and visit.</p>')


def main():
    everyone = homes()
    pages = {h["page"] for h in everyone}
    for h in everyone:
        path = ROOT / h["page"]
        if not path.exists():
            refuse(f"{h['no']} links to {h['page']}, which is not here.")
        src = path.read_text()
        if src.count(BEGIN) != 1 or src.count(END) != 1:
            refuse(f"{h['page']} is {h['whose']}'s home on the campgrounds and has no neighbours markers. "
                   f"Put {BEGIN}{END} where the line should go, in the room's own words.")
        new = re.sub(re.escape(BEGIN) + r".*?" + re.escape(END),
                     BEGIN + "\n  " + line(h["page"], everyone) + "\n  " + END, src, count=1, flags=re.S)
        if new != src:
            path.write_text(new)
    for path in ROOT.glob("*.html"):
        if path.name not in pages and BEGIN in path.read_text():
            refuse(f"{path.name} has neighbours markers and is not a home on the campgrounds' board.")
    print("neighbours: " + "; ".join(f"{h['whose']} at {h['no'].lower()}" for h in everyone))


if __name__ == "__main__":
    main()
