#!/usr/bin/env python3
"""Refuse a page whose headings skip a level, or that has other than one h1.

A screen reader user moves through a page by its headings, and the levels are
the outline: an h4 straight under an h2 says there is a section in between
that is not there. Three pages here did it, and ALL THREE WERE GENERATED --
Looming Rocks' running order, the Hermitage's campfire and the Doomscroll's
feed -- because a generator writes the heading for its own block without
knowing what the page around it is using. The level was chosen for how it
looked in the room's CSS. So the check is on the published page, where the
block and the page finally meet, and never on the templates.

Headings inside an <svg> are not headings (an SVG <title> is the drawing's
name), and are ignored.

IF THIS REFUSES: fix the level in the generator that wrote the block, then
move the room's CSS from the old tag to the new one -- and compare the
computed style before and after, because a level also picks up whatever the
base and the room say about that tag.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
HEAD = re.compile(r"<h([1-6])\b[^>]*>(.*?)</h\1>", re.S)
SVG = re.compile(r"<svg\b.*?</svg>", re.S)


def main():
    bad = []
    pages = sorted(ROOT.glob("*.html"))
    for p in pages:
        src = SVG.sub("", p.read_text())
        heads = [(int(m.group(1)), re.sub(r"<[^>]+>", "", m.group(2)).strip()[:60],
                  src[:m.start()].count("\n") + 1) for m in HEAD.finditer(src)]
        ones = sum(1 for level, _, _ in heads if level == 1)
        if ones != 1:
            bad.append(f"{p.name}: {ones} h1 elements; a page has exactly one")
        prev = 0
        for level, text, line in heads:
            if prev and level > prev + 1:
                bad.append(f"{p.name}:{line}: h{prev} then h{level} “{text}”")
            prev = level
    for line in bad:
        print("REFUSING  " + line)
    if bad:
        print("\nA heading level is the outline a screen reader walks. Fix the level in\n"
              "the generator that wrote it, then move the room's CSS to the new tag.")
        return 1
    print(f"{len(pages)} pages checked, one h1 each and no level skipped.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
