#!/usr/bin/env python3
"""Refuse a page that uses the same id twice, and a script that reaches for one that is not there.

WHY THIS EXISTS, WITH TWO CASES FROM THE SAME AFTERNOON. Duplicate ids are
invalid HTML, which is the boring half. The interesting half is that
getElementById returns the FIRST match and never says anything, so the failure
is silent and arrives somewhere else entirely.

  · penguin-pebbling.html gave the player's sprite id="peng" while the drawing
    it is made of already had it in <defs>. getElementById returned the drawing,
    and the game threw on the first line of start(). That one took thirty
    seconds to find, because pressing START does something visible.

  · faery-yurt.html carried SEVEN elements with id="yurt-says" -- the generator
    was emitting a live region inside every sound tile. love.js only ever
    reached the first, so six were dead markup that never received a word, and
    nothing anywhere complained. It had been live since the nook shipped.

The second is the reason for the tool. A duplicate in markup nobody presses
does not announce itself, and there is no version of this site where an element
with two owners is what somebody meant.

IT ALSO CHECKS THE OTHER DIRECTION: every id a script asks for by name should
exist on at least one page that loads that script. A getElementById against an
id nobody has returns null and every one of these games would fall over on it,
which is exactly what the peng clash did.

IF THIS REFUSES: rename one of them. Do not reach for querySelectorAll and take
the first.
"""
import re
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

ID = re.compile(r'\sid="([^"]+)"')
GET = re.compile(r"""getElementById\(\s*['"]([^'"]+)['"]\s*\)""")
SCRIPTS = re.compile(r'<script src="([^"]+)"')


def main():
    bad = []

    pages = sorted(ROOT.glob("*.html"))
    for p in pages:
        ids = ID.findall(p.read_text())
        for name, n in sorted(Counter(ids).items()):
            if n > 1:
                bad.append(f'{p.name}: id="{name}" appears {n} times')

    # Every id a page's own scripts ask for, against the ids that page has.
    for p in pages:
        src = p.read_text()
        here = set(ID.findall(src))
        for js in SCRIPTS.findall(src):
            f = ROOT / js
            if not f.exists():
                bad.append(f"{p.name}: loads {js}, which is not in the repository")
                continue
            for want in sorted(set(GET.findall(f.read_text()))):
                if want not in here:
                    # A script shared by several pages legitimately asks for ids
                    # only some of them have -- love.js reaches for the yurt's
                    # tiles from every page on the street. Only complain when NO
                    # page that loads this script has the id.
                    holders = [q for q in pages
                               if js in SCRIPTS.findall(q.read_text())
                               and want in set(ID.findall(q.read_text()))]
                    if not holders:
                        bad.append(f"{js}: asks for id {want!r} and no page that loads it has one")

    for line in sorted(set(bad)):
        print("REFUSING  " + line)

    if bad:
        print("\ngetElementById returns the first match and never says anything, so a\n"
              "duplicate is a silent bug that arrives somewhere else. Rename one of them.")
        return 1

    print(f"{len(pages)} pages checked, every id unique and every id a script asks for exists.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
