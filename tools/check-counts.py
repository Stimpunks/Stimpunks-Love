#!/usr/bin/env python3
"""Refuse a sentence that says how many rooms this street has.

Ryan's call, 2026-09-20: the number of storefronts is going to grow well past
anything worth writing down, so nothing here states a total. Not the pages, not
the stylesheet's comments, not a generator's published strings, not the docs.

WHY A TOOL AND NOT CARE. A total is a fact about the whole site that gets
written in a dozen places and updated in one. The commit that added the Arcade
is the proof, and it is the reason this file exists: it carefully changed the
room count in twelve places, and still shipped a stylesheet comment describing
the doors as outlined boxes by a number that was already wrong, another calling
the street a row of shopfronts by a number that was already wrong, and a line in
CLAUDE.md giving the number of card designs as one fewer than there were. Three
stale claims, published, inside the very change that was updating the other
twelve. Nothing caught them because nothing was looking.

WHAT IT LOOKS FOR: a number or an ordinal sitting immediately in front of a
thing that grows when a storefront opens. Small on purpose. The jukebox's track
count and The Chappell's are real counts of real data, generated from files
holding exactly that many, and they are none of this tool's business. The nouns
below are the ones that only ever appear as a total.

QUOTED TEXT IS SKIPPED IN PROSE AND NOT IN CODE, and the asymmetry is the point.
A page or a doc has to be able to say what it corrected, so a count inside
quotation marks there is evidence rather than a claim. In a Python file every
quoted string is a candidate for publication -- make-og.py writes its card
footers out of string literals -- so there is no safe quotation, and this file's
own docstring therefore describes the three stale counts above rather than
quoting them. It is the one place where a tool's prose has to obey the rule it
enforces.

IF THIS REFUSES: rewrite the sentence so it is true however many there are. "No
two rooms alike", "one card per room", "every page", "a row of shopfronts". Do
not add the noun to an exception list; the list is the tool.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# FOUR AND UP, and every ordinal. The first draft started at "two" and refused
# its own fix: "no two rooms alike" is the count-free phrasing this tool exists
# to encourage, and it was the first thing flagged. Below four, a number in
# front of one of these nouns is nearly always counting instances rather than
# stating a total -- "two rooms turned out to be putting text on a background
# nobody had measured" is a finding, not a claim about the size of the street.
# A street's total will be four or more and rising, so that is where this starts.
CARDINALS = ("four five six seven eight nine ten eleven twelve thirteen "
             "fourteen fifteen sixteen seventeen eighteen nineteen twenty").split()
ORDINALS = ("second third fourth fifth sixth seventh eighth ninth tenth eleventh "
            "twelfth thirteenth fourteenth fifteenth").split()

# Things that grow when somebody opens a storefront. Deliberately short: "ten
# tracks" in the jukebox and "thirteen" in The Chappell are real counts of real
# data, generated from files holding exactly that many, and are none of this
# tool's business.
NOUNS = r"(?:rooms?|storefronts?|shopfronts?|doors?|worlds?|card designs?|share cards?|cabinets?|games?)"

# One adjective may sit between: a number, then "visual" or "card", then the noun.
# (Written out rather than shown, because this file obeys its own rule -- see the
# docstring on why nothing quoted is skipped in code.)
# An allowlist rather than "any word", because the greedy version matched "the
# same four every room here already honours" and "two grounds the rooms had
# always had", neither of which counts anything.
GAP = r"(?:\s+(?:visual|share|self-hosted|more|other|separate|remaining|next))?"

COUNT = re.compile(
    rf"\b(?:{'|'.join(CARDINALS + ORDINALS)}|\d+)\b{GAP}\s+{NOUNS}\b",
    re.I,
)

# Spans where a count is evidence rather than a claim: anything in quotation
# marks, straight or curly, and anything in backticks. THE WHOLE FILE IS SCANNED
# AT ONCE, not line by line -- the first version did it per line and then
# refused this tool's own docstring, because the quotation it makes its argument
# out of wraps across two of them.
QUOTED = re.compile(r"\u201c[^\u201d]*\u201d|&ldquo;.*?&rdquo;|\"[^\"]*\"|`[^`]*`", re.S)

# changelog.html is the one file exempt, and not as a convenience: every entry
# there is a dated record of what was true on that day. Rewriting a September
# entry to match today would be falsifying the log to satisfy a linter.
SKIP = {"changelog.html"}


def surfaces():
    for p in sorted(ROOT.glob("*.html")):
        if p.name not in SKIP:
            yield p
    for name in ("love.css", "llms.txt", "README.md", "CLAUDE.md", "DECISIONS.md"):
        p = ROOT / name
        if p.exists():
            yield p
    yield from sorted((ROOT / "tools").glob("*.py"))


def main():
    hits = []
    for p in surfaces():
        text = p.read_text()
        # Blank the quoted spans rather than dropping them, so line and column
        # numbers still point at the real text.
        blanked = text if p.suffix == ".py" else QUOTED.sub(
            lambda m: re.sub(r"[^\n]", " ", m.group(0)), text)
        for n, line in enumerate(blanked.splitlines(), 1):
            for m in COUNT.finditer(line):
                real = text.splitlines()[n - 1]
                hits.append((p.relative_to(ROOT), n, m.group(0).strip(), real.strip()))

    for f, n, found, line in hits:
        print(f"REFUSING  {f}:{n}  \u2014 \u201c{found}\u201d")
        print(f"          {line[:112]}")

    if hits:
        print(f"\n{len(hits)} count(s) of a thing that grows when a storefront opens.\n"
              "This street does not say how many it has. Rewrite it so the sentence stays\n"
              "true however many there are \u2014 \u201cno two rooms alike\u201d, \u201cone card per room\u201d,\n"
              "\u201cevery page\u201d, \u201ca row of shopfronts\u201d. Do not widen the exception list.")
        return 1

    print(f"{sum(1 for _ in surfaces())} files checked, no room counted.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
