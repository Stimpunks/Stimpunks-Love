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
    posted = dict(re.findall(r'<li class="job" data-quest="([^"]+)" data-sum="([^"]+)" id="job-\1">', board))
    if not posted:
        bad.append("adventurers-guild.html has no jobs posted on it at all, or no job carries "
                   "the id its badges and the radio's Profile link to.")

    # ── What the badges say ──────────────────────────────────────────────
    # A badge lists jobs by id and links to each on the board. Read off the
    # published board: a badge naming a job the board does not post is a badge
    # nobody can ever have, and a link to a job that is not there goes nowhere.
    # SPLIT ON EACH BADGE'S OPENING TAG, not matched with one pattern: a badge
    # holds a list of its own <li>s, and the first draft of this sliced at the
    # first </li> it met and quietly read half the badges, which was found by
    # breaking a link on purpose and watching it pass.
    section = re.search(r"<!-- guild:badges:begin -->(.*?)<!-- guild:badges:end -->", board, re.S)
    blocks = re.split(r'(?=<li class="badge" )', section.group(1)) if section else []
    blocks = [b for b in blocks if b.startswith('<li class="badge" ')]
    if not blocks:
        bad.append("adventurers-guild.html has no badges between its guild:badges markers.")
    for block in blocks:
        m = re.match(r'<li class="badge" id="badge-([^"]+)" data-badge="\1" data-needs="(all|any)" '
                     r'data-jobs="([^"]*)"(?: data-from="(rescues|pets)")?>', block)
        if not m:
            bad.append("a badge on the board does not say its id, what it needs and which jobs, the way "
                       "make-guild.py writes it.")
            continue
        bid, needs, ids, src = m.group(1), m.group(2), m.group(3).split(), m.group(4)
        # A badge from the shelters lists no jobs and sends you to the shelters,
        # every one of which has to be there to send you to.
        if src:
            if ids or needs != "any":
                bad.append(f"badge {bid!r} comes from the shelters and lists jobs as well.")
            for page in re.findall(r'<a href="(rescue-[a-z-]+\.html)">', block):
                if not (ROOT / page).exists():
                    bad.append(f"badge {bid!r} sends people to {page}, which is not on disk.")
            if not re.search(r'<a href="rescue-[a-z-]+\.html">', block):
                bad.append(f"badge {bid!r} comes from the shelters and does not say where they are.")
        for j in ids:
            if j not in posted:
                bad.append(f"badge {bid!r} asks for {j!r}, which is not posted on the board.")
        listed = re.findall(r'<li class="badge__job" data-quest="([^"]+)"><a href="#job-([^"]+)">', block)
        if [a for a, _ in listed] != ids or any(a != b for a, b in listed):
            bad.append(f"badge {bid!r} lists different jobs from the ones it asks for, or links them wrongly.")
        if not ids and needs != "any":
            bad.append(f"badge {bid!r} asks for every one of no jobs.")

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
