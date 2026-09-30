#!/usr/bin/env python3
"""Hold Count Me In to what it says.

Ryan's calls, 2026-09-30, after the counting game in our Discord's
Collaborative Nonsense channels: a CB pass puts the next number, nobody takes
two steps in a row, a wrong number sends the stair back to one and NAMES
NOBODY, and the stair keeps the highest step it has reached. And the same
afternoon: "Add a chairlift to the stairs so everyone can join."

THE DISCORD GAME'S MEAN PART IS WHO RUINED IT, AND THIS ROOM HAS NONE. Every
counting bot announces whose wrong number sent it back, and the friendly edit
here will be exactly that, because it is how the game is usually played. On a
Disabled people's site, where plenty of us have dyscalculia, a slip of the
hand or eyes that swap digits, a name beside a mistake is a pillory. Nothing
on the server knows a name to give.

THE LIFT IS THE OTHER HALF, AND IT HAS TO STAY EQUAL. A stairlift fitted as an
afterthought is smaller, paler, further down and labelled for somebody else;
this one is a way up that counts exactly the same, can never go wrong, and
sits beside the stair's own control, the same size.

WHAT IT REFUSES:
  · A STAIR THAT REMEMBERS WHO. climb's written bodies must be exactly the
    step, the best, the one mark and where it last fell. No function may put
    the mark into an answer, and stair.js must not know what a handle is.
  · A LIFT THAT IS LESS THAN THE STAIR: its button must wear exactly the class
    the step's button wears, both inside the two ways up, and the lift must be
    one of those two ways rather than a note further down the page.
  · A LIFT THAT CAN GO WRONG: the lift's request must carry no number.
  · THE VOCABULARY OF BLAME, A PER-PERSON TALLY OR A RACE, in the page and the
    script, with make-guild.py's negation window so the room can say it has
    none.
  · A SCRIPT THAT KEEPS ANYTHING OR CALLS ANYTHING BUT THE STAIR.
  · privacy.html without the section the page links to.

IF THIS REFUSES: fix the cause. Do not widen a list to make it quiet.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGE = ROOT / "count-me-in.html"
SCRIPT = ROOT / "stair.js"
LIB = ROOT / "netlify" / "cb" / "lib.mjs"
FUNCS = [ROOT / "netlify" / "functions" / f for f in ("cb-stair.mjs", "cb-stair-climb.mjs")]
PRIVACY = ROOT / "privacy.html"

NEGATION = (r"(?:no|not|nothing|never|neither|none|without|refuses?|refused|refusing|"
            r"cannot|does not|won't|will not|is not|are not|isn't|aren't|nobody|nobody's|declin\w+)")
BLAME = (r"ruin(?:ed|s)?|broke it|broken by|blame[sd]?|fault|culprit|who (?:broke|ruined|reset)|"
         r"leaderboards?|top (?:climbers?|counters?)|most steps|your (?:steps|total|count|score)|"
         r"streaks?|badges?|achievements?|levels? up|progress bar|ranks?|ranked|ranking|"
         r"\d+\s*%|per cent|percent|thank(?:s| you)? (?:to )?whoever")

problems = []


def sweep(text, where):
    found = re.compile(rf"\b(?:{BLAME})", re.I)
    ok = re.compile(rf"\b{NEGATION}\b[^.]{{0,60}}?\b(?:{BLAME})", re.I)
    for m in found.finditer(text):
        if not ok.search(text[max(0, m.start() - 70):m.end()]):
            problems.append(f"{where}: {m.group(0)!r} blames somebody, counts somebody or races them. "
                            "Nobody on the stair is named or counted; rewrite the sentence.")


def plain(html):
    html = re.sub(r"<script\b.*?</script>", " ", html, flags=re.S)
    html = re.sub(r"<!--.*?-->", " ", html, flags=re.S)
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", html))


def main():
    lib = LIB.read_text()
    body = re.search(r"export async function climb\(.*?\n\}", lib, re.S)
    b = body.group(0) if body else ""
    for want in ("body = { step: want, best: Math.max(best, want), last: mark, fell };",
                 "body = { step: 0, best, last: mark, fell: { at: step, t: now } };",
                 "const got = n === 'lift' ? want : n;"):
        if want not in b:
            problems.append(f"{LIB.name}: climb no longer has {want!r}. The stair keeps a step, the highest, "
                            "one mark and where it fell, and the lift always takes the next step.")
    if re.search(r"\bhandle\b|\bwho\b", b):
        problems.append(f"{LIB.name}: climb mentions a handle or a who. It is given a mark and nothing else.")
    m = re.search(r"export const STAIR_MAX = (\d+);", lib)
    if not m:
        problems.append(f"{LIB.name}: no STAIR_MAX.")
    for f in FUNCS:
        code = re.sub(r"/\*.*?\*/", " ", f.read_text(), flags=re.S)
        for j in re.finditer(r"json\((.*?)\);\n", code, re.S):
            if re.search(r"\b(?:last|mark)\s*:|\.(?:last|mark|handle)\b", j.group(1)):
                problems.append(f"{f.name}: an answer carries the mark or a handle. Neither ever leaves the server.")

    src = PAGE.read_text()
    if m:
        digits = len(m.group(1))
        if not re.search(rf'<input class="cmi-way__in"[^>]*maxlength="{digits}"', src):
            problems.append(f"{PAGE.name}: the number box's maxlength is not {digits}, the digits in STAIR_MAX.")
    ways = re.search(r'<div class="cmi-ways" id="cmi-ways"[^>]*>(.*?)\n  </div>', src, re.S)
    step_btn = re.search(r'<button type="submit" class="([^"]+)">', ways.group(1)) if ways else None
    lift_btn = re.search(r'<button type="button" class="([^"]+)" id="cmi-lift"', ways.group(1)) if ways else None
    if not (ways and step_btn and lift_btn):
        problems.append(f"{PAGE.name}: the lift and the step are not both inside the two ways up.")
    elif step_btn.group(1) != lift_btn.group(1):
        problems.append(f"{PAGE.name}: the lift's button is {lift_btn.group(1)!r} and the step's is "
                        f"{step_btn.group(1)!r}. The lift is the same size as the stair.")

    sweep(plain(src), PAGE.name)
    js = SCRIPT.read_text()
    code = re.sub(r"/\*.*?\*/", " ", js, flags=re.S)
    sweep(" ".join(re.findall(r"'([^']*)'", code)), SCRIPT.name)
    if re.search(r"localStorage\.(?:setItem|removeItem|clear)|sessionStorage|indexedDB|document\.cookie", code):
        problems.append(f"{SCRIPT.name}: it writes to storage. The room stores nothing.")
    if re.search(r"\bhandle\b", code):
        problems.append(f"{SCRIPT.name}: it knows what a handle is. No step on the stair is anybody's.")
    for url in re.findall(r"call\('([^']+)'", code):
        if not url.startswith("/cb/stair"):
            problems.append(f"{SCRIPT.name}: it calls {url}. The stair talks to its own functions and nothing else.")
    if code.count("fetch(") != 1:
        problems.append(f"{SCRIPT.name}: every request goes through call(), and there is one fetch in it.")
    if not re.search(r"call\('/cb/stair/climb', \{ lift: true \}", code):
        problems.append(f"{SCRIPT.name}: the lift's request is not {{ lift: true }}. It carries no number, "
                        "so it can never be the wrong one.")
    if 'id="the-stair"' not in PRIVACY.read_text():
        problems.append(f"{PRIVACY.name}: no section with id=\"the-stair\", which the room links for what it keeps.")

    if problems:
        print("REFUSING:\n  " + "\n  ".join(problems))
        return 1
    print("stair: nobody named for a wrong number, the lift the same size as the step and never wrong; "
          "nothing kept says who took a step.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
