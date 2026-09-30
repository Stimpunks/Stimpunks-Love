#!/usr/bin/env python3
"""Hold Rescue A Cat, Rescue A Dog and the CB's Pets tray to what they say.

Ryan's calls, 2026-09-30, after the catch-a-cat game in our Discord's
Collaborative Nonsense channels, renamed: animals turn up at random, the first
CB pass to press rescues one and names it, the shelter shows every animal and
never who rescued it, and "the ones you rescued" is kept in the rescuer's own
browser. Then, the same evening: adoption into a Pets tray on the CB, a list of
everybody ever adopted kept for good, dogs as well as cats, and Forget Me.

THE DISCORD GAME IS A COLLECTION WITH A LEADERBOARD AND THIS IS NEITHER, and
adoption is the one place the street now keeps something under a person. So
the refusals below keep that one thing to exactly what was asked for.

WHAT IT REFUSES:
  · A SHELTER THAT KNOWS WHO RESCUED. rescueAnimal's written animal must be
    exactly its looks, its name and its time, and it is given no handle.
  · A FOREVER LIST OR A SHELTER ANSWER THAT KNOWS WHO ADOPTED. shapeAnimal must
    never send the pet key an adoption is filed under, and the animal written
    to the forever list must be the animal and its adoption time, not its
    person.
  · PETS FILED UNDER A HANDLE rather than petKey's scrambled form of it, or
    under the community password, which would lose everybody's pets on the day
    it changed.
  · A PETS TRAY WITHOUT FORGET ME, or a Forget Me that does not ask twice, or
    a tray that does not say a handle is not an account.
  · A RARITY: any weight in the looks, or the vocabulary of prizes.
  · A LOOK WITH NO DRAWING: every coat and marking of each kind must be a key
    in animals.js, or an animal would be drawn as some other animal and
    described as itself.
  · A SCRIPT THAT KEEPS ANYTHING BUT love-rescues, OR CALLS ANYTHING BUT THE
    SHELTERS, and privacy.html not naming love-rescues and Forget Me.
  · THE VOCABULARY OF A TALLY OR A RACE BETWEEN PEOPLE, with make-guild.py's
    negation window so the rooms can say they have none.

IF THIS REFUSES: fix the cause. Do not widen a list to make it quiet.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGES = {"cat": ROOT / "rescue-a-cat.html", "dog": ROOT / "rescue-a-dog.html"}
SHELTER = ROOT / "shelter.js"
ANIMALS = ROOT / "animals.js"
CB = ROOT / "cb.js"
LIB = ROOT / "netlify" / "cb" / "lib.mjs"
FUNCS = sorted((ROOT / "netlify" / "functions").glob("cb-shelter*.mjs")) + [
    ROOT / "netlify" / "functions" / "cb-adopted.mjs", ROOT / "netlify" / "functions" / "cb-pets.mjs"]
PRIVACY = ROOT / "privacy.html"

NEGATION = (r"(?:no|not|nothing|never|neither|none|without|refuses?|refused|refusing|"
            r"cannot|does not|won't|will not|is not|are not|isn't|aren't|nobody|nobody's|declin\w+)")
PRIZE = (r"rarer|rarest|rare|legendary|epic|mythic|shiny|uncommon|prizes?|jackpot|"
         r"leaderboards?|top (?:rescuers?|adopters?)|most (?:cats|dogs|pets)|your (?:total|count|score)|streaks?|"
         r"scores?|badges?|achievements?|levels? up|ranks?|ranked|ranking|\d+\s*%|collect(?:ion|ed|ing)?|"
         r"catch(?:es)? them|(?:rescued|adopted) by \w+|thank(?:s| you)? (?:to )?whoever")

problems = []


def sweep(text, where):
    found = re.compile(rf"\b(?:{PRIZE})", re.I)
    ok = re.compile(rf"\b{NEGATION}\b[^.]{{0,60}}?\b(?:{PRIZE})", re.I)
    for m in found.finditer(text):
        if not ok.search(text[max(0, m.start() - 70):m.end()]):
            problems.append(f"{where}: {m.group(0)!r} makes an animal a prize, a person a rank or a rescue a "
                            "collection. Rewrite the sentence.")


def plain(html):
    html = re.sub(r"<script\b.*?</script>", " ", html, flags=re.S)
    html = re.sub(r"<!--.*?-->", " ", html, flags=re.S)
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", html))


def code_of(path):
    c = re.sub(r"/\*.*?\*/", " ", path.read_text(), flags=re.S)
    return re.sub(r"(?m)^\s*//[^\n]*", " ", c)


def keys(lib, name):
    m = re.search(rf"export const {name} = \[(.*?)\n\];", lib, re.S)
    if not m:
        raise SystemExit(f"REFUSING: {LIB.name} has no {name}.")
    if re.search(r"weight|\bw:|rar", m.group(1), re.I):
        problems.append(f"{LIB.name}: {name} carries a weight or a rarity. Every look is one flat entry.")
    return re.findall(r"\['([a-z]+)',", m.group(1))


def fn(src, name):
    m = re.search(rf"export (?:async )?function {name}\(.*?\n\}}", src, re.S)
    return m.group(0) if m else ""


def main():
    lib = LIB.read_text()
    looks = {k: (keys(lib, f"{k.upper()}_COATS"), keys(lib, f"{k.upper()}_MARKS")) for k in ("cat", "dog")}
    for k in ("CAT_PLACES", "CAT_MOODS", "DOG_PLACES", "DOG_MOODS"):
        keys(lib, k)

    r = fn(lib, "rescueAnimal")
    for want in ("const animal = { ...animalAt(kind, due), name, t: now };",):
        if want not in r:
            problems.append(f"{LIB.name}: rescueAnimal no longer writes {want!r}: an animal is its looks, name and time.")
    if re.search(r"\bhandle\b|\bwho\b|\bmark\b|\bpk\b", r):
        problems.append(f"{LIB.name}: rescueAnimal mentions a handle, a who or a key. It knows no rescuer.")
    a = fn(lib, "adoptAnimal")
    if "const going = { ...found, at: now };" not in a or "leaving: [...(was.leaving || []), { animal: going, to: pk }]" not in a:
        problems.append(f"{LIB.name}: adoptAnimal no longer files the animal and its person apart.")
    f = fn(lib, "finishAdoptions")
    if "addOnce(animal)" not in f or re.search(r"addOnce\(\{", f):
        problems.append(f"{LIB.name}: finishAdoptions writes something other than the animal itself to the pets and the forever list.")
    shape = fn(lib, "shapeAnimal")
    if re.search(r"\bto\b|\bpk\b|petKey|handle", shape):
        problems.append(f"{LIB.name}: shapeAnimal sends who an animal belongs to. No answer ever does.")
    pk = fn(lib, "petKey")
    if "createHash('sha256')" not in pk or "secretFor" in pk or "CB_PASSWORD" in pk:
        problems.append(f"{LIB.name}: petKey is no longer a plain scrambled hash of the folded handle, which is "
                        "the one thing that keeps pets through a password change and keeps handles out of the store.")
    for path in FUNCS:
        code = code_of(path)
        for j in re.finditer(r"json\((.*?)\);\n", code, re.S):
            if re.search(r"\b(?:due|last|mark|to|pk)\s*:|\.(?:due|handle)\b|petKey\(", j.group(1)):
                problems.append(f"{path.name}: an answer carries when the next animal is due, or who somebody is.")
    if not (ROOT / "netlify" / "functions" / "cb-pets.mjs").exists():
        problems.append("cb-pets.mjs is gone, and Forget Me with it.")

    draws = code_of(ANIMALS)
    for kind, (coats, marks) in looks.items():
        cm = re.search(rf"var {kind.upper()}_COATS = \{{(.*?)\n  \}};", draws, re.S)
        mm = re.search(rf"var {kind.upper()}_MARKS = \{{(.*?)\}};", draws)
        drawn = set(re.findall(r"^\s+([a-z]+):\s+\{ base:", cm.group(1), re.M)) if cm else set()
        marked = set(re.findall(r"([a-z]+):", mm.group(1))) if mm else set()
        for k in coats:
            if k not in drawn:
                problems.append(f"{ANIMALS.name}: no drawing for the {kind} coat {k!r}, which lib.mjs can hand it.")
        for k in marks:
            if k not in marked:
                problems.append(f"{ANIMALS.name}: no drawing for the {kind} marking {k!r}, which lib.mjs can hand it.")

    js = code_of(SHELTER)
    stored = set(re.findall(r"localStorage\.setItem\((\w+|'[^']+')", js))
    if stored - {"KEY"} or "var KEY = 'love-rescues';" not in js:
        problems.append(f"{SHELTER.name}: it stores something other than love-rescues.")
    if re.search(r"sessionStorage|indexedDB|document\.cookie", js):
        problems.append(f"{SHELTER.name}: it keeps something other than love-rescues.")
    if re.search(r"\bhandle\b", js):
        problems.append(f"{SHELTER.name}: it knows what a handle is. Nothing on a shelter page is anybody's.")
    for url in re.findall(r"call\('([^']+)'", js):
        if not re.match(r"/cb/(?:shelter|adopted)", url):
            problems.append(f"{SHELTER.name}: it calls {url}. The shelters talk to their own functions and nothing else.")
    if js.count("fetch(") != 1:
        problems.append(f"{SHELTER.name}: every request goes through call(), and there is one fetch in it.")
    sweep(" ".join(re.findall(r"'([^']*)'", js)), SHELTER.name)

    cb = CB.read_text()
    for want, why in (("'Forget me'", "a Forget me button"), ("'Yes, forget me'", "a second press before it forgets"),
                      ("A handle is not an account", "the sentence saying a handle is not an account"),
                      ("call('/cb/pets', { body: { forget: true } }", "a Forget Me that asks the server to forget")):
        if want not in cb:
            problems.append(f"{CB.name}: the Pets tray has lost {why}.")

    for kind, page in PAGES.items():
        src = page.read_text()
        if f'data-shelter="{kind}"' not in src:
            problems.append(f"{page.name}: its <main> does not say it is the {kind} shelter.")
        for id_ in ("shelter-adopted", "shelter-list", "shelter-rescue", "shelter-mine"):
            if f'id="{id_}"' not in src:
                problems.append(f"{page.name}: no #{id_}, which shelter.js draws into.")
        if "animals.js" not in src or "shelter.js" not in src:
            problems.append(f"{page.name}: it does not load animals.js and shelter.js.")
        sweep(plain(src), page.name)

    priv = PRIVACY.read_text()
    if 'id="the-shelter"' not in priv:
        problems.append(f"{PRIVACY.name}: no section with id=\"the-shelter\", which the rooms link for what they keep.")
    if "<tr><td><code>love-rescues</code></td>" not in priv:
        problems.append(f"{PRIVACY.name}: love-rescues is not in the table of what your browser keeps.")
    if "Forget Me" not in priv:
        problems.append(f"{PRIVACY.name}: it does not say how to delete your pets.")

    if problems:
        print("REFUSING:\n  " + "\n  ".join(problems))
        return 1
    print("rescue: every coat and marking of both kinds drawn, none rarer, the shelters and the forever list "
          "know nobody, your pets are filed under a scrambled handle and Forget Me deletes them.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
