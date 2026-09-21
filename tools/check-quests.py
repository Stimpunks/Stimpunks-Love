#!/usr/bin/env python3
"""Check the published pages agree with each other about every quest code.

make-guild.py writes the room's marker and the board's entry out of one data
file, so at the moment it runs they cannot disagree. THIS IS ABOUT EVERY MOMENT
AFTER THAT. The generated lines sit in twenty-nine committed HTML files, they
look exactly like something you may edit, and a code typed into one of them by
hand would be right in the file somebody was looking at and wrong in the one
they were not.

That is not a hypothetical on this site. The frame-src allowlist had exactly
this shape -- a generated line in `_headers` that said "do not hand-edit",
edited by hand, confirmed in the file, and silently put back by the next run of
the tool. It worked on the dev server, which serves no headers, and the live
site refused the frame. Ryan found it by pressing the button. The lesson taken
from it was to make surfaces READ from one place rather than restate it, and
this file is the other half: when they have to be restated, check them.

SO EVERYTHING HERE IS READ OFF THE HTML, never off data/quests.json. A checker
that re-derived the answer from the same source the generator used would only
be testing that Python is deterministic. The data file is used for exactly one
thing -- knowing which quests are supposed to exist -- and every value compared
comes out of the published pages.

WHAT IT CHECKS:

  · every job on the board has a marker in the room it names, and vice versa
  · the board's checksum is the checksum of the code printed in that room
  · a marker's "hand it in" link carries that marker's own code, because a link
    that pre-fills the wrong word is a visitor pressing a button that tells them
    they are wrong
  · every code is unique, and is the word a person can actually type
  · every marker is a <details> with a real accessible name, and every question
    still has a give-me-the-answer way out. The escape is the only thing on this
    board that guarantees nobody is stuck, and it lives inside a <details> that
    a well-meaning tidy-up could collapse into a scripted panel without anybody
    noticing it had stopped working with JavaScript off.

IT NEEDS NO NETWORK, so unlike check-jukebox.py it belongs in the pre-deploy
sequence.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BOARD = ROOT / "adventurers-guild.html"


def checksum(code):
    """The same djb2 make-guild.py and quest.js compute. Written a third time on
    purpose: this file is checking that two surfaces agree, so it has to be able
    to do the sum itself rather than import the tool whose output it is
    auditing."""
    h = 5381
    for ch in code:
        h = ((h * 33) & 0xFFFFFFFF) ^ ord(ch)
    return format(h & 0xFFFFFFFF, "08x")


def main():
    bad = []
    quests = json.loads((ROOT / "data" / "quests.json").read_text())["quests"]
    expected = {q["id"]: q["page"] for q in quests}

    # ── What the board says ──────────────────────────────────────────────
    board = BOARD.read_text()
    posted = dict(re.findall(r'<li class="job" data-quest="([^"]+)" data-sum="([^"]+)">', board))
    if not posted:
        bad.append("adventurers-guild.html has no jobs posted on it at all.")

    stray = sorted(set(posted) - set(expected))
    gone = sorted(set(expected) - set(posted))
    for q in stray:
        bad.append(f"the board posts {q!r}, which is not a quest in the data.")
    for q in gone:
        bad.append(f"{q!r} is in the data and is not posted on the board.")

    # ── What the rooms say ───────────────────────────────────────────────
    found = {}                                  # quest id -> (page, code)
    for p in sorted(ROOT.glob("*.html")):
        src = p.read_text()
        for m in re.finditer(r'<details class="quest" data-quest="([^"]+)" data-code="([^"]+)"', src):
            qid, code = m.group(1), m.group(2)
            if qid in found:
                bad.append(f"{qid!r} has a marker in both {found[qid][0]} and {p.name}.")
            found[qid] = (p.name, code)

            # SLICED ON THE GENERATOR'S OWN END MARKER, not on the next
            # </details>. The first draft did the latter and the marker's own
            # HINTS are <details> too, so every block stopped at "Hint 1" and
            # the escape below it was invisible to this file -- which reported
            # eighteen missing escapes that were all present. A checker that
            # cries wolf is a checker people stop running.
            stop = src.index(f"<!-- quest:{qid}:end -->", m.start())
            block = src[m.start():stop]

            if '<summary class="quest__mark">' not in block:
                bad.append(f"{qid!r}'s marker has no summary, so it cannot be opened "
                           "from a keyboard.")
            if '<span class="quest__label">' not in block:
                bad.append(f"{qid!r}'s marker has no name on it. A drawing in a button "
                           "with no text is an unlabelled control, which on this site is "
                           "not a subtle marker but an excluded reader.")
            if f'adventurers-guild.html?code={code}' not in block:
                bad.append(f"{qid!r}'s hand-it-in link does not carry {code!r}. A link "
                           "that pre-fills the wrong word sends somebody to a board that "
                           "tells them they are wrong.")
            if f'<b class="quest__word">{code}</b>' not in block:
                bad.append(f"{qid!r} does not print {code!r} anywhere a reader can see it.")
            if '<p class="quest__ask">' in block and 'Give me the answer' not in block:
                bad.append(f"{qid!r} asks a question and has no give-me-the-answer way "
                           "out. That escape is the only thing guaranteeing nobody is "
                           "stuck, and it is the thing a tidy-up removes first.")
            if '<p class="quest__ask">' in block and '<details class="quest__out">' not in block:
                bad.append(f"{qid!r}'s escape is not a <details>, so it does not work "
                           "with scripts off — which is the whole reason it is one.")

    for qid, page in expected.items():
        if qid not in found:
            bad.append(f"{qid!r} has no marker on any page; it should be on {page}.")
        elif found[qid][0] != page:
            bad.append(f"{qid!r}'s marker is on {found[qid][0]} and the board sends "
                       f"people to {page}.")

    # ── Do the two surfaces agree about the word? ────────────────────────
    seen = {}
    for qid, (page, code) in sorted(found.items()):
        if not re.fullmatch(r"[A-Z]{4,12}", code):
            bad.append(f"{qid!r}'s code {code!r} is not four to twelve capital letters, "
                       "and somebody has to type it in another room.")
        if code in seen:
            bad.append(f"{code!r} is the code for both {qid!r} and {seen[code]!r}; "
                       "one of them can never be handed in.")
        seen[code] = qid
        want = checksum(code)
        got = posted.get(qid)
        if got and got != want:
            bad.append(
                f"{qid!r}: {page} prints {code!r} and the board is waiting for "
                f"{got} rather than {want}. Somebody edited a generated line by hand — "
                "re-run make-guild.py rather than patching the other side to match.")

    for line in bad:
        print("REFUSING  " + line)
    if bad:
        print("\nThe room and the board have to agree about a word a person carries\n"
              "between them. Fix the cause in data/quests.json and re-run\n"
              "tools/make-guild.py; do not hand-edit either surface.")
        return 1

    gated = sum(1 for q in quests if q.get("ask"))
    print(f"{len(found)} markers checked against {len(posted)} posted jobs across "
          f"{len(set(p for p, _ in found.values()))} rooms;\n"
          f"every code agrees with its board entry, and all {gated} questions still "
          f"have a way out.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
