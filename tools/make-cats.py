#!/usr/bin/env python3
"""Hold Rescue A Cat to what it says.

Ryan's calls, 2026-09-30, after the catch-a-cat game in our Discord's
Collaborative Nonsense channels, renamed: cats turn up at random, the first CB
pass to press rescues one and names it, the shelter shows every cat and never
who rescued it, and "cats you rescued" is kept in the rescuer's own browser.

THE DISCORD GAME IS A COLLECTION WITH A LEADERBOARD, AND THIS ROOM IS NEITHER.
The friendly edits all point back at the original: show whose cat it is, rank
the rescuers, make some cats rare. Every refusal below keeps one of those out.

WHAT IT REFUSES:
  · A SHELTER THAT KNOWS WHO. rescueCat's written body must be exactly `due`
    and the shelter, and a cat exactly its looks, its name and its time; it is
    given no handle, and no function's answer carries `due`, which would let a
    page camp the next cat.
  · A RARITY: any weight in the looks, or the vocabulary of prizes. Every coat,
    marking, place and mood is one entry in a flat list.
  · A LOOK WITH NO DRAWING. Every coat and marking in lib.mjs must be a key in
    cats.js, or a cat would be drawn as some other cat and described as itself.
  · A SCRIPT THAT KEEPS ANYTHING BUT love-cats, OR CALLS ANYTHING BUT THE
    SHELTER, and privacy.html not naming love-cats in its table.
  · THE VOCABULARY OF A TALLY OR A RACE BETWEEN PEOPLE, with make-guild.py's
    negation window so the room can say it has none.

IF THIS REFUSES: fix the cause. Do not widen a list to make it quiet.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGE = ROOT / "rescue-a-cat.html"
SCRIPT = ROOT / "cats.js"
LIB = ROOT / "netlify" / "cb" / "lib.mjs"
FUNCS = [ROOT / "netlify" / "functions" / f for f in ("cb-cats.mjs", "cb-cats-rescue.mjs", "cb-cats-unname.mjs")]
PRIVACY = ROOT / "privacy.html"

NEGATION = (r"(?:no|not|nothing|never|neither|none|without|refuses?|refused|refusing|"
            r"cannot|does not|won't|will not|is not|are not|isn't|aren't|nobody|nobody's|declin\w+)")
PRIZE = (r"rarer|rarest|rare|legendary|epic|mythic|shiny|common cat|uncommon|prizes?|jackpot|"
         r"leaderboards?|top rescuers?|most cats|your (?:total|count|score)|streaks?|scores?|badges?|"
         r"achievements?|levels? up|ranks?|ranked|ranking|\d+\s*%|collect(?:ion|ed|ing)?|catch(?:es)? them|"
         r"rescued by \w+|thank(?:s| you)? (?:to )?whoever")

problems = []


def sweep(text, where):
    found = re.compile(rf"\b(?:{PRIZE})", re.I)
    ok = re.compile(rf"\b{NEGATION}\b[^.]{{0,60}}?\b(?:{PRIZE})", re.I)
    for m in found.finditer(text):
        if not ok.search(text[max(0, m.start() - 70):m.end()]):
            problems.append(f"{where}: {m.group(0)!r} makes a cat a prize, a rescuer a rank or a rescue a "
                            "collection. Rewrite the sentence.")


def plain(html):
    html = re.sub(r"<script\b.*?</script>", " ", html, flags=re.S)
    html = re.sub(r"<!--.*?-->", " ", html, flags=re.S)
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", html))


def keys(lib, name):
    m = re.search(rf"export const {name} = \[(.*?)\n\];", lib, re.S)
    if not m:
        raise SystemExit(f"REFUSING: {LIB.name} has no {name}.")
    body = m.group(1)
    if re.search(r"weight|\bw:|rar", body, re.I):
        problems.append(f"{LIB.name}: {name} carries a weight or a rarity. Every look is one flat entry.")
    return re.findall(r"\['([a-z]+)',", body)


def main():
    lib = LIB.read_text()
    coats, marks = keys(lib, "CAT_COATS"), keys(lib, "CAT_MARKS")
    keys(lib, "CAT_PLACES"), keys(lib, "CAT_MOODS")

    body = re.search(r"export async function rescueCat\(.*?\n\}", lib, re.S)
    b = body.group(0) if body else ""
    for want in ("const cat = { ...catAt(due), name, t: now };", "const body = { due: now + gap(), shelter: [...shelter, cat] };"):
        if want not in b:
            problems.append(f"{LIB.name}: rescueCat no longer has {want!r}. The shelter keeps cats and when the "
                            "next is due, and a cat is its looks, its name and its time.")
    if re.search(r"\bhandle\b|\bwho\b|\bmark\b", b):
        problems.append(f"{LIB.name}: rescueCat mentions a handle, a who or a mark. It knows no rescuer.")
    catat = re.search(r"export function catAt\(due\) \{.*?\n\}", lib, re.S)
    if not catat or "return { id: `c${Number(due).toString(36)}`, coat: coat[0], mark: mark[0], place: place[0], mood: mood[0] };" not in catat.group(0):
        problems.append(f"{LIB.name}: catAt no longer returns exactly an id and four looks.")
    for f in FUNCS:
        code = re.sub(r"/\*.*?\*/", " ", f.read_text(), flags=re.S)
        for j in re.finditer(r"json\((.*?)\);\n", code, re.S):
            if re.search(r"\b(?:due|last|mark)\s*:|\.(?:due|handle)\b", j.group(1)):
                problems.append(f"{f.name}: an answer carries when the next cat is due, or who somebody is.")

    js = SCRIPT.read_text()
    code = re.sub(r"/\*.*?\*/", " ", js, flags=re.S)
    code = re.sub(r"//[^\n]*", " ", code)
    drawn = set(re.findall(r"^\s{4}([a-z]+):\s+\{ base:", code, re.M))
    for k in coats:
        if k not in drawn:
            problems.append(f"{SCRIPT.name}: no drawing for the coat {k!r}, which lib.mjs can hand it.")
    mk = re.search(r"var MARKS = \{(.*?)\};", code)
    marked = set(re.findall(r"([a-z]+):", mk.group(1))) if mk else set()
    for k in marks:
        if k not in marked:
            problems.append(f"{SCRIPT.name}: no drawing for the marking {k!r}, which lib.mjs can hand it.")
    stores = set(re.findall(r"localStorage\.setItem\((\w+|'[^']+')", code))
    if stores - {"KEY"} or "var KEY = 'love-cats';" not in code:
        problems.append(f"{SCRIPT.name}: it stores something other than love-cats.")
    if re.search(r"sessionStorage|indexedDB|document\.cookie|localStorage\.setItem\('love-cb'", code):
        problems.append(f"{SCRIPT.name}: it keeps something other than love-cats, or writes the radio's pass.")
    if re.search(r"\bhandle\b", code):
        problems.append(f"{SCRIPT.name}: it knows what a handle is. No cat is anybody's but in your own browser.")
    for url in re.findall(r"call\('([^']+)'", code):
        if not url.startswith("/cb/cats"):
            problems.append(f"{SCRIPT.name}: it calls {url}. The shelter talks to its own functions and nothing else.")
    if code.count("fetch(") != 1:
        problems.append(f"{SCRIPT.name}: every request goes through call(), and there is one fetch in it.")
    sweep(" ".join(re.findall(r"'([^']*)'", code)), SCRIPT.name)

    src = PAGE.read_text()
    sweep(plain(src), PAGE.name)
    priv = PRIVACY.read_text()
    if 'id="the-shelter"' not in priv:
        problems.append(f"{PRIVACY.name}: no section with id=\"the-shelter\", which the room links for what it keeps.")
    if "<tr><td><code>love-cats</code></td>" not in priv:
        problems.append(f"{PRIVACY.name}: love-cats is not in the table of what your browser keeps.")

    if problems:
        print("REFUSING:\n  " + "\n  ".join(problems))
        return 1
    print(f"cats: every coat and marking drawn, none rarer than another, the shelter knows no rescuer, "
          f"and love-cats is the only thing kept, in your own browser.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
