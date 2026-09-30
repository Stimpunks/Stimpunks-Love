#!/usr/bin/env python3
"""Hold Pando Calrissian to what it says, and write the numbers it says them with.

Ryan's brief, 2026-09-30, after the grow-a-tree game in our Discord's
Collaborative Nonsense channels: a community tree that grows as it is watered,
a count of waterings that never expires, and a board beside it on the
chalkboard's rules. Only a CB pass waters it, and the ground soaks for a minute
after any watering before it takes more.

THE ONE ROOM THAT COUNTS SOMETHING, SO THIS TOOL IS MOSTLY ABOUT WHAT IT MUST
NOT COUNT. The street's aim was "nothing is counted", and this room made that
false: the aim was narrowed, Ryan's call, to NOBODY is counted. The tree keeps
how many times it has been watered and never who watered it. Every refusal
below keeps one half of that sentence true.

WHAT IT WRITES, from netlify/cb/lib.mjs, between `pando:` markers in the page:
how long the ground soaks, how long a note stays and how many the fence holds,
and the textarea's maxlength. Those numbers are the server's, and a page that
restated them by hand would be the `_headers` CSP line again.

WHAT IT REFUSES:
  · A TREE THAT REMEMBERS WHO. waterTree's written body must be exactly the
    number and the time. A handle added there -- the friendly edit is "thank
    whoever watered it last" -- would be the first per-person record, and
    everything that grows out of one (a total each, a leaderboard, a streak)
    starts with that one line.
  · THE VOCABULARY OF A PER-PERSON TALLY OR A GOAL, in the page and the script,
    with make-guild.py's negation window so the room can still say it has none.
    A tree is exactly the shape of thing that grows a milestone ("we reached a
    thousand!") and a milestone is a target, which turns watering together into
    a workload.
  · A SCRIPT THAT KEEPS ANYTHING OR TALKS TO ANYBODY ELSE: no storage write, no
    cookie, and no request to anything but the tree's own functions.
  · ANYTHING OF STAR WARS BUT THE NAME. Lando Calrissian is Lucasfilm's, and the
    name is the only thing taken, Dead Tired Society's rule about its film. The
    friendly edit is a line about a cape or a cloud city; it is refused here.
  · A BINOMIAL FOR THE ASPEN, the herbarium's rule: the page names it the way
    its sources do and never in Latin from memory.
  · THE PAGE WITHOUT ITS SOURCES, or privacy.html without the section the page
    links to.
  · A SENTENCE ELSEWHERE SAYING NOTHING IS COUNTED. The Mission and the
    manifesto sheet both said it, and this room made it false; they say nobody
    is counted now. When a room changes a street-wide promise, the rooms that
    describe the street are where the old sentence lives.

IF THIS REFUSES: fix the cause. Do not widen a list to make it quiet.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGE = ROOT / "pando-calrissian.html"
SCRIPT = ROOT / "pando.js"
LIB = ROOT / "netlify" / "cb" / "lib.mjs"
PRIVACY = ROOT / "privacy.html"
DESCRIBERS = [ROOT / "mission.html", ROOT / "data" / "broadside.json", ROOT / "broadsheet-broadside.html"]

SOURCES = [
    "https://www.fs.usda.gov/r04/fishlake/multimedia/videos/fishlake-national-forest-pando-clone",
    "https://history.utah.gov/blog/the-diminishing-pando-clone-history-and-forest-management/",
]

NEGATION = (r"(?:no|not|nothing|never|neither|none|without|refuses?|refused|refusing|"
            r"cannot|does not|won't|will not|is not|are not|isn't|aren't|nobody|declin\w+)")
TALLY = (r"leaderboards?|top waterers?|most waterings|your (?:waterings|total|count|score)|"
         r"streaks?|scores?|scored|badges?|achievements?|levels? up|milestones?|goals?|targets?|"
         r"progress bar|ranks?|ranked|ranking|\d+\s*%|per cent|percent|thank(?:s| you)? (?:to )?whoever")
STAR_WARS = (r"cloud city|bespin|millennium falcon|falcon|sabacc|han solo|chewbacca|wookiee|jedi|sith|"
             r"lightsaber|droid|the empire|rebel alliance|the force|galaxy far|far,? far away|"
             r"hello, what have we here|cape|smooth(?:est)? operator|billy dee|donald glover")

problems = []


def words(n):
    small = ("zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen "
             "fifteen sixteen seventeen eighteen nineteen twenty").split()
    tens = {20: "twenty", 30: "thirty", 40: "forty", 50: "fifty", 60: "sixty"}
    if n < len(small):
        return small[n]
    if n in tens:
        return tens[n]
    return str(n)


def duration(ms):
    s = ms // 1000
    if s % 60 == 0:
        m = s // 60
        return "a minute" if m == 1 else f"{words(m)} minutes"
    return f"{words(s)} seconds"


def const(src, name):
    m = re.search(rf"export const {name} = ([^;]+);", src)
    if not m:
        raise SystemExit(f"REFUSING: {LIB.name} has no {name}, and the page's numbers are read from it.")
    expr = m.group(1).split("//")[0].strip()
    if not re.fullmatch(r"[\d\s*+()]+", expr):
        raise SystemExit(f"REFUSING: {name} in {LIB.name} is {expr!r}, which this tool will not evaluate.")
    return int(eval(expr))


def sweep(text, where):
    found = re.compile(rf"\b(?:{TALLY})", re.I)
    ok = re.compile(rf"\b{NEGATION}\b[^.]{{0,60}}?\b(?:{TALLY})", re.I)
    for m in found.finditer(text):
        window = text[max(0, m.start() - 70):m.end()]
        if not ok.search(window):
            problems.append(f"{where}: {m.group(0)!r} counts somebody or sets a goal. The tree counts water "
                            "and never waterers, and grows towards nothing; rewrite the sentence.")
    for m in re.finditer(rf"\b(?:{STAR_WARS})\b", text, re.I):
        problems.append(f"{where}: {m.group(0)!r} is Star Wars, and the name is the only thing taken from it.")
    if re.search(r"\bPopulus\b", text):
        problems.append(f"{where}: a binomial for the aspen. Name it the way the sources do.")


def plain(html):
    html = re.sub(r"<script\b.*?</script>", " ", html, flags=re.S)
    html = re.sub(r"<!--.*?-->", " ", html, flags=re.S)
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", html))


def put(src, key, value):
    pat = re.compile(rf"(<!-- pando:{key}:begin -->).*?(<!-- pando:{key}:end -->)", re.S)
    if not pat.search(src):
        raise SystemExit(f"REFUSING: {PAGE.name} has no pando:{key} markers, so there is nowhere to write "
                         "that number. Put them back rather than typing the number in.")
    return pat.sub(lambda m: m.group(1) + value + m.group(2), src)


def main():
    lib = LIB.read_text()
    soak, keep, most, days = (const(lib, n) for n in ("PANDO_SOAK", "PANDO_KEEP", "PANDO_MAX", "CHALK_DAYS"))

    body = re.search(r"export async function waterTree\(.*?\n\}", lib, re.S)
    if not body or "const body = { water: water + 1, wet: now };" not in body.group(0):
        problems.append(f"{LIB.name}: waterTree no longer writes exactly {{ water, wet }}. The tree keeps a "
                        "number and a time and nothing about who watered it.")
    if body and re.search(r"\bhandle\b|\bwho\b", body.group(0)):
        problems.append(f"{LIB.name}: waterTree mentions a handle or a who. It must not know one.")

    src = PAGE.read_text()
    new = put(src, "soak", duration(soak))
    new = put(new, "days", f"{words(days)} days")
    new = put(new, "days2", f"{words(days)} days")
    new = put(new, "keep", words(keep))
    new, n = re.subn(r'(<textarea class="pdo-write__text"[^>]*?maxlength=")\d+(")', rf"\g<1>{most}\2", new)
    if n != 1:
        problems.append(f"{PAGE.name}: the fence's textarea is not where this tool writes its maxlength.")

    sweep(plain(new), PAGE.name)
    js = SCRIPT.read_text()
    js_code = re.sub(r"/\*.*?\*/", " ", js, flags=re.S)
    sweep(" ".join(re.findall(r"'([^']*)'", js_code)), SCRIPT.name)
    if re.search(r"localStorage\.(?:setItem|removeItem|clear)|sessionStorage|indexedDB|document\.cookie", js_code):
        problems.append(f"{SCRIPT.name}: it writes to storage. The room stores nothing; it reads love-cb and "
                        "never writes it.")
    for url in re.findall(r"call\('([^']+)'", js_code):
        if not url.startswith("/cb/pando"):
            problems.append(f"{SCRIPT.name}: it calls {url}. The tree talks to its own functions and nothing else.")
    if re.search(r"\bfetch\(", js_code) and js_code.count("fetch(") != 1:
        problems.append(f"{SCRIPT.name}: a second fetch. Every request goes through call().")

    for u in SOURCES:
        if u not in new:
            problems.append(f"{PAGE.name}: its source {u} is gone. Nothing about the real tree is from memory.")
    if 'id="the-tree"' not in PRIVACY.read_text():
        problems.append(f"{PRIVACY.name}: no section with id=\"the-tree\", which the room links for what it keeps.")

    for f in DESCRIBERS:
        t = f.read_text()
        for m in re.finditer(r"Nothing (?:on the street |here )?is counted", t):
            problems.append(f"{f.name}: {m.group(0)!r}. The tree counts its water; nobody is counted, which "
                            "is the sentence that is still true.")

    if problems:
        print("REFUSING:\n  " + "\n  ".join(problems))
        return 1
    if new != src:
        PAGE.write_text(new)
    print(f"pando: the ground soaks for {duration(soak)}, a note stays {words(days)} days, "
          f"the fence holds {words(keep)}; the tree keeps a number and a time.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
