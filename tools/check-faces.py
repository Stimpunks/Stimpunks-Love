#!/usr/bin/env python3
"""Refuse a typeface this site holds that one of the two rooms about type has lost.

WHY THIS EXISTS, AND IT IS NOT A HYPOTHETICAL. Two rooms on this street claim,
in their own published copy, to hold EVERY typeface on it: The Mopery's Raven
nook says the picker holds every typeface on this street, and The Foundry's
cases are the whole collection with a designer and a licence beside each one.
Both claims are the kind a page makes once and stops checking.

The nook's list was hand-kept markup. By the time anybody counted, EIGHTEEN
families were missing from it -- every face added since the last time somebody
remembered to walk back into that room -- and llms.txt was still telling readers
the poem could be set in any face on the street. Nothing warned, because adding
a file to fonts/ and adding an <option> in a room two doors away are two edits
in two places and only one of them is obviously required.

The nook's picker is generated now, from the same record The Foundry's shelves
are built from. This is the tool that says so out loud when it stops being true.

IT READS THE PUBLISHED HTML AND NEVER THE GENERATORS. A checker that re-derived
the lists by calling picker_block() and specimen_list() would only be testing
that Python is deterministic. This exists for every moment AFTER those tools
run, when a generated line sitting in a committed file gets edited by hand --
the frame-src shape exactly, and check-quests.py's rule.

WHAT IT ASKS, IN BOTH DIRECTIONS:
  · every family in fonts/_sources.json is on The Foundry's shelves
  · every family in fonts/_sources.json is in The Mopery's picker
  · neither room offers a family this site does not actually hold, which is the
    half that catches a deletion -- an option pointing at a face that is gone is
    a control that silently falls back to Georgia and looks like a design choice

IF THIS REFUSES: run tools/pull-foundry.py, then tools/make-foundry.py and
tools/make-mopery.py. Do not add the option by hand; that is what went wrong.
"""
import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCES = ROOT / "fonts/_sources.json"
RECORD = ROOT / "data/foundry-faces.json"

# Where each room keeps its list, and how to read the family names out of it.
# Both are slices of published markup rather than anything a tool hands over.
ROOMS = [
    ("The Mopery's Raven nook", "the-mopery.html",
     r'id="raven-font"', r"</select>", r"value=\"'([^']+)',"),
    ("The Foundry's cases", "foundry.html",
     r'class="fo-cases"', r"</main>", r"font-family:'([^']+)'"),
]


def main():
    slugs = json.loads(SOURCES.read_text())
    record = json.loads(RECORD.read_text())["faces"]

    missing_record = sorted(set(slugs) - set(record))
    if missing_record:
        print("REFUSING: fonts/_sources.json holds families that data/foundry-faces.json\n"
              "has no record for, so nothing knows who drew them:\n  " +
              "\n  ".join(missing_record) +
              "\n\nRun tools/pull-foundry.py.", file=sys.stderr)
        return 1

    held = {rec["family"] for slug, rec in record.items() if slug in slugs}
    fail = []

    for label, page, start, stop, pattern in ROOMS:
        src = (ROOT / page).read_text()
        m = re.search(start, src)
        if not m:
            fail.append(f"{label}: {page} no longer has the block this tool reads "
                        f"({start!r}). If the room was rebuilt, point this at the new one.")
            continue
        block = html.unescape(src[m.end():])
        end = re.search(stop, block)
        if end:
            block = block[:end.start()]
        offered = set(re.findall(pattern, block))

        for gone in sorted(held - offered):
            fail.append(f"{label}: does not offer {gone}, which this site holds. "
                        f"The room says it holds every face on the street.")
        for ghost in sorted(offered - held):
            fail.append(f"{label}: offers {ghost}, which is not in fonts/. Nothing "
                        f"breaks -- it falls back to Georgia and looks like a choice.")

    if fail:
        print("REFUSING:\n  " + "\n  ".join(fail), file=sys.stderr)
        return 1

    print(f"{len(held)} families held, and both rooms that claim to hold every one "
          f"of them do.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
