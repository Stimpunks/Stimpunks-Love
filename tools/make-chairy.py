#!/usr/bin/env python3
"""Rebuild what Chairy says, in playhouse.html, from data/chairy.json.

Chairy started with five lines held in a data-lines attribute, which was fine at
five and is not at twenty-eight. More to the point, an attribute cannot record
where a line came from, and some of these lines are not ours.

ATTRIBUTION IS THE REASON THIS IS A TOOL. Every saying carries the page it came
from, read out of the Knowledge System mirror's own frontmatter rather than
typed from memory. Two of them are borrowed and say so out loud when Chairy
speaks them: "Nothing About Us Without Us" is a motto of the self-advocacy
movement, credited on our own page to Disabled People South Africa in 1993, and
"Design for Real Life" is a book by Eric A. Meyer and Sara Wachter-Boettcher.
A talking chair that quotes a movement slogan as though it were a house line
would be exactly the failure this site spends a page arguing against.

IT REFUSES on a saying with no source, on a duplicate, and on a pipe character
-- because the lines are pipe-separated in the attribute, so a saying
containing one would be silently split into two half-sayings, and Chairy would
occasionally say half a thing with no indication anything was wrong.
"""
import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGE = ROOT / "playhouse.html"


def main():
    data = json.loads((ROOT / "data/chairy.json").read_text())
    sayings = data.get("sayings", [])
    if not sayings:
        raise SystemExit("REFUSING: data/chairy.json has no sayings.")

    seen, lines, borrowed = set(), [], 0
    for s in sayings:
        text = (s.get("text") or "").strip()
        if not text:
            raise SystemExit("REFUSING: a saying has no text.")
        if not (s.get("source") or "").strip():
            raise SystemExit(
                f"REFUSING: {text!r} has no source.\n"
                "Chairy says it comes out of a page we published. Name the page."
            )
        if "|" in text or "|" in (s.get("credit") or ""):
            raise SystemExit(
                f"REFUSING: {text!r} contains a pipe.\n"
                "The lines are pipe-separated, so this one would be silently split in\n"
                "two and Chairy would sometimes say half of it."
            )
        key = text.lower()
        if key in seen:
            raise SystemExit(f"REFUSING: {text!r} is in the list twice.")
        seen.add(key)
        if s.get("credit"):
            borrowed += 1
            lines.append(f"{text} — {s['credit']}")
        else:
            lines.append(text)

    attr = html.escape("|".join(lines), quote=True)
    src = PAGE.read_text()
    pat = r'(<button[^>]*data-toy="chairy"[^>]*data-lines=")[^"]*(")'
    if not re.search(pat, src, re.S):
        raise SystemExit(f"REFUSING: no chairy button with a data-lines attribute in {PAGE.name}.")
    PAGE.write_text(re.sub(pat, lambda m: m.group(1) + attr + m.group(2), src, flags=re.S))
    print(f"chairy: {len(lines)} sayings, {borrowed} of them borrowed and credited aloud")


if __name__ == "__main__":
    main()
