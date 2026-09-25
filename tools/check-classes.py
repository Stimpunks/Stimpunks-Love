#!/usr/bin/env python3
"""Refuse a class name claimed by two rooms, and a page wearing another room's class.

THIS FILE IS ONE STYLESHEET HOLDING A SET OF WORLDS THAT SHARE NOTHING, which is
the site's whole architecture and also the place it leaks. A section header is a
comment. A class name is global. So `.shelf` written in the Faery Yurt and
`.shelf` written in The Latibulum are the same selector, the browser applies
whichever came last, and NOTHING SAYS ANYTHING -- the same silence
getElementById gives a duplicate id, which is what check-ids.py is for. This is
the CSS twin of that tool.

WHAT IT FOUND ON ITS FIRST RUN, which is the argument for having it. The
Latibulum shipped four names that were already taken:

  · .scrawl   -- the zine table's margin hand, in Rock Salt and red
  · .shelf    -- the plank of books in the Faery Yurt, with a timber gradient
  · .knob     -- the Arcade's speed control, which is a button with a border
  · .tagline  -- the street's six-typeface masthead, which is display: flex

ONLY THE FIRST WAS VISIBLE. The burrow's trail line came out in Rock Salt and
somebody noticed; the other three were quietly inheriting a wood gradient, a
button's border and a flex container from rooms on the other side of the file,
in a room that had already been read.

WHAT COUNTS AS A CLAIM: THE LEFTMOST CLASS IN A RULE, and nothing else. Every
room here scopes its own rules by starting them with something of its own --
`.shelf li`, `.room-latibulum .wall`, `.yurt-head .eyebrow` -- so the leftmost
class is the name that room is taking for itself, and two rooms taking one name
is the bug. The rest of a selector is not a claim: `.room-latibulum .facade` is
a room dressing a piece of §4's shared furniture, which is what §4 is FOR, and
calling that a collision would teach people to ignore this tool.

RULES INSIDE AN AT-RULE CLAIM NOTHING. §54 and §55 are entirely @media, and they
restyle every room on the street by design; they are adjustments to rules that
already exist rather than worlds of their own. Neither is anywhere to introduce
a component, so neither can take a name.

THE SECOND HALF IS ABOUT THE MARKUP, and it is the half that catches the case
above that the first half cannot. `.tagline` is claimed by exactly one section --
the street's -- so the stylesheet is innocent; the bug was a PAGE in another room
putting `class="tagline"` on a paragraph and silently picking up the street's
masthead. So: a page may wear the base's classes (§1–§4), its own section's, and
any name nobody has claimed. A page wearing a name claimed by a DIFFERENT room is
refused. Which section owns a page is read off the body class the section scopes
its rules with, so a new room is known to this file the moment it has a page.

THERE IS A THIRD CHECK THAT IS NOT HERE, deliberately: a class styled in love.css
that no element ever wears. It is a real kind of dead weight -- and it cannot be
told apart from a class a script builds through a helper, because `svgEl('frond',
…)` in otterly.js puts a class on an element without the word `class` appearing
anywhere near it. Written anyway, it reported seven drawings that are on the
screen right now. A checker that cries wolf is a checker people stop running,
and this file would rather answer a narrow question truthfully.

IF THIS REFUSES: rename the newcomer, not the room that had the name first. Do
not reach for a longer selector to win the fight -- two rooms sharing a name and
settling it by specificity is still two rooms sharing a name.
"""
import re
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CSS = ROOT / "love.css"

SECTION = re.compile(r"/\* §(\d+) ── ([^\n─]*)")
COMMENT = re.compile(r"/\*.*?\*/", re.S)
CLASS = re.compile(r"\.(-?[A-Za-z_][\w-]*)")
BASE = 4          # §1–§4 are the shared base and may claim anything.


def body_classes():
    """Every page's body class, which is how a page is matched to its room."""
    out = {}
    for p in sorted(ROOT.glob("*.html")):
        m = re.search(r'<body[^>]*class="([^"]+)"', p.read_text())
        out[p.name] = m.group(1).split() if m else []
    return out


def sections():
    """(number, title, body) for each §, in order."""
    src = CSS.read_text()
    marks = [(m.start(), int(m.group(1)), m.group(2).strip()) for m in SECTION.finditer(src)]
    if not marks:
        raise SystemExit("REFUSING: love.css has no § section headers to read.")
    # THE NUMBERS ARE HOW EVERY COMMENT IN THIS FILE POINTS AT ANOTHER PART OF
    # IT, so a duplicate or an out-of-order one is a cross-reference that goes
    # to the wrong place -- and nothing was looking. Adding the Solarpunk
    # Hermitage numbered it §20 when §20 was already Print, and dropped it
    # between §18 and §19; this tool read both, reported collisions as "§20 and
    # §20", and passed. The refusal message was the only clue and it looked like
    # a display bug.
    nums = [n for _, n, _ in marks]
    dupes = sorted({n for n in nums if nums.count(n) > 1})
    if dupes:
        raise SystemExit(
            "REFUSING: love.css has more than one section numbered "
            + ", ".join(f"§{n}" for n in dupes)
            + ".\nEvery comment in that file points at another part of it by number, so two\n"
            "sections sharing one is a cross-reference that goes to the wrong place."
        )
    if nums != sorted(nums):
        out_of_place = [f"§{n}" for i, n in enumerate(nums) if i and n < nums[i - 1]]
        raise SystemExit(
            "REFUSING: love.css's sections are not in numerical order (" 
            + ", ".join(out_of_place) + " comes after a higher number).\n"
            "A new room appended before the cross-cutting sections at the end is how a\n"
            "number gets reused; renumber rather than leaving the file out of sequence."
        )
    # A CUSTOM PROPERTY DECLARED TWICE IN ONE :root IS LAST-WINS AND SILENT,
    # which is the same failure as two rooms claiming a class and is not caught
    # by any of the checks above -- those read SELECTORS, and this is a name
    # inside one block. It shipped: the Solarpunk Hermitage declared --leaf for
    # its green and --sky for its daylight, and both names were already taken --
    # --leaf is The Chappell's GOLD LEAF and --sky is the pebbling shore's
    # overcast. For as long as that was live, a gold room rendered green and a
    # grey sky rendered blue, in two rooms nobody had reason to reopen.
    #
    # The contrast checker caught the identical collision in its own Python and
    # was fixed there; nobody thought to look for it in the stylesheet, because
    # the Python failed loudly and CSS does not fail at all.
    root_at = src.find(":root {")
    if root_at != -1:
        root = src[root_at:src.index("\n}", root_at)]
        root = re.sub(r"/\*.*?\*/", " ", root, flags=re.S)
        decls = re.findall(r"(--[\w-]+)\s*:", root)
        twice = sorted({n for n in decls if decls.count(n) > 1})
        if twice:
            raise SystemExit(
                "REFUSING: these custom properties are declared more than once in "
                "love.css's :root:\n  " + "\n  ".join(twice)
                + "\n\nThe last one wins, everywhere, and nothing warns — so the room that "
                "had the\nname first is quietly repainted in the newcomer's colour. Give the "
                "newcomer\nits own name, the same as for a class."
            )

    return [(n, title, src[at:(marks[i + 1][0] if i + 1 < len(marks) else len(src))])
            for i, (at, n, title) in enumerate(marks)]


def rules(body):
    """Every selector in a section that is not inside an at-rule.

    Brace counting rather than a parser, which is enough for a hand-written
    stylesheet: a run of text before `{` at depth 0 is a selector, and anything
    one level inside an @media or @keyframes is skipped. An unbalanced brace
    would leave a selector carrying half the file, which shows up at once rather
    than passing quietly."""
    body = COMMENT.sub(" ", body)
    out, buf, depth, at_depth = [], "", 0, None
    for ch in body:
        if ch == "{":
            sel = buf.strip()
            if sel.startswith("@") and at_depth is None:
                at_depth = depth
            elif sel and at_depth is None:
                out.append(sel)
            buf = ""
            depth += 1
        elif ch == "}":
            depth = max(0, depth - 1)
            if at_depth is not None and depth <= at_depth:
                at_depth = None
            buf = ""
        else:
            buf += ch
    return out


def leftmost(part):
    """The first class in one comma-separated selector, or None.

    `html[data-intensity="gentle"] .polaroid` leads with a type selector and an
    attribute, so the first CLASS is what is wanted rather than the first token."""
    m = CLASS.search(part)
    return m.group(1) if m else None


def worn(page_src):
    """Every class this page's own markup puts on an element."""
    out = set()
    for m in re.finditer(r'class="([^"]*)"', page_src):
        out.update(m.group(1).split())
    return out


def main():
    bodies = body_classes()
    claims = defaultdict(list)                 # class -> [(section, title)]
    owns = defaultdict(set)                    # section -> {body classes it scopes}
    all_body = {c for cs in bodies.values() for c in cs}

    for n, title, body in sections():
        for sel in rules(body):
            for part in sel.split(","):
                names = set(CLASS.findall(part))
                for name in names & all_body:
                    owns[n].add(name)
                name = leftmost(part)
                if name and name not in all_body and (n, title) not in claims[name]:
                    claims[name].append((n, title))

    bad = []
    for name, where in sorted(claims.items()):
        worlds = [w for w in where if w[0] > BASE]
        if len(worlds) > 1:
            bad.append(".%s is claimed by %s" % (
                name, " and ".join(f"§{n} {t}" for n, t in worlds)))

    # Which section a page belongs to, by its body class.
    section_of = {}
    for n, cls in owns.items():
        for c in cls:
            section_of.setdefault(c, n)

    for page, cls in bodies.items():
        mine = {section_of.get(c) for c in cls} - {None}
        for name in sorted(worn((ROOT / page).read_text())):
            where = [n for n, _ in claims.get(name, []) if n > BASE]
            if where and not (set(where) & mine):
                bad.append(
                    f"{page} wears class=\"{name}\", which is claimed by "
                    + " and ".join(f"§{n}" for n in where)
                    + f" and not by this page's own section"
                    + (f" (§{min(mine)})" if mine else ""))

    for line in bad:
        print("REFUSING  " + line)

    if bad:
        print("\nA section header is a comment and a class name is global. The browser\n"
              "applies the winner and says nothing, which is the same silence a duplicate\n"
              "id gives. Rename the newcomer — not the room that had the name first — and\n"
              "do not settle it with a longer selector.")
        return 1

    print(f"{len(claims)} class names claimed across {len(sections())} sections, "
          f"{len(bodies)} pages checked, none claimed twice and none worn by the wrong room.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
