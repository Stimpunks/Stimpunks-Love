#!/usr/bin/env python3
"""Hold The Fridge of Sighs to what it says, and write the numbers it says them with.

Ryan's calls, 2026-09-30, after the sentence builder in our Discord's
Collaborative Nonsense channels: a CB pass puts up one word, nobody puts up two
in a row, a word ending in a stop finishes the sentence, finished sentences are
kept for good, and NO WORD CARRIES A NAME.

KEPT FOR GOOD IS ONLY SIMPLE BECAUSE NOTHING KEPT IS ANYBODY'S. A sentence with
a handle on every word would be a list of people's names kept forever; a
sentence with none is our community's, and is not personal information about
anybody. Every refusal below keeps that true, because the friendly edits all
point the other way: "show who said each word, like Discord does", "thank
whoever finished it", "most words this week".

WHAT IT WRITES, from netlify/cb/lib.mjs, between `fridge:` markers in the page:
the longest word, the longest line and how many sentences the door holds, and
the word box's maxlength. Those numbers are the server's.

WHAT IT REFUSES:
  · A FRIDGE THAT REMEMBERS WHO. putWord's written body must be exactly the
    words, the one mark and the door, and a finished sentence exactly an id, its
    text and a time. The mark must never leave the server: no function may put
    `last` or a mark into an answer, and fridge.js must not know what a handle
    is.
  · THE VOCABULARY OF A TALLY OR A RACE, in the page and the script, with
    make-guild.py's negation window so the room can say it has none.
  · A SCRIPT THAT KEEPS ANYTHING OR CALLS ANYTHING BUT THE FRIDGE.
  · THE PAGE WITHOUT DAVE KAPELL'S CREDIT AND ITS SOURCE, or privacy.html
    without the section the page links to.

IF THIS REFUSES: fix the cause. Do not widen a list to make it quiet.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGE = ROOT / "fridge-of-sighs.html"
SCRIPT = ROOT / "fridge.js"
LIB = ROOT / "netlify" / "cb" / "lib.mjs"
FUNCS = [ROOT / "netlify" / "functions" / f for f in ("cb-fridge.mjs", "cb-fridge-word.mjs", "cb-fridge-strike.mjs")]
PRIVACY = ROOT / "privacy.html"
SOURCE = "https://en.wikipedia.org/wiki/Magnetic_Poetry"

NEGATION = (r"(?:no|not|nothing|never|neither|none|without|refuses?|refused|refusing|"
            r"cannot|does not|won't|will not|is not|are not|isn't|aren't|nobody|declin\w+)")
TALLY = (r"leaderboards?|top (?:writers?|posters?|contributors?)|most words|your (?:words|total|count|score)|"
         r"streaks?|scores?|scored|badges?|achievements?|levels? up|milestones?|goals?|targets?|"
         r"progress bar|ranks?|ranked|ranking|\d+\s*%|per cent|percent|word count|"
         r"(?:said|put up|written) by \w+|thank(?:s| you)? (?:to )?whoever")

ONES = ("zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen "
        "fifteen sixteen seventeen eighteen nineteen").split()
TENS = {2: "twenty", 3: "thirty", 4: "forty", 5: "fifty", 6: "sixty", 7: "seventy", 8: "eighty", 9: "ninety"}
ORD = {"one": "first", "two": "second", "three": "third", "five": "fifth", "eight": "eighth",
       "nine": "ninth", "twelve": "twelfth"}

problems = []


def words(n):
    if n < 20:
        return ONES[n]
    if n < 100:
        t, o = divmod(n, 10)
        return TENS[t] + (f"-{ONES[o]}" if o else "")
    raise SystemExit(f"REFUSING: {n} is bigger than this tool writes in words. Teach it, do not type it.")


def ordinal(n):
    w = words(n)
    head, _, last = w.rpartition("-")
    if last in ORD:
        last = ORD[last]
    elif last.endswith("y"):
        last = last[:-1] + "ieth"
    else:
        last += "th"
    return (head + "-" if head else "") + last


def const(src, name):
    m = re.search(rf"export const {name} = (\d+);", src)
    if not m:
        raise SystemExit(f"REFUSING: {LIB.name} has no plain number for {name}, and the page reads it from there.")
    return int(m.group(1))


def sweep(text, where):
    found = re.compile(rf"\b(?:{TALLY})", re.I)
    ok = re.compile(rf"\b{NEGATION}\b[^.]{{0,60}}?\b(?:{TALLY})", re.I)
    for m in found.finditer(text):
        if not ok.search(text[max(0, m.start() - 70):m.end()]):
            problems.append(f"{where}: {m.group(0)!r} counts somebody, races them or names them. Nobody on "
                            "the fridge is counted and no word is anybody's; rewrite the sentence.")


def plain(html):
    html = re.sub(r"<script\b.*?</script>", " ", html, flags=re.S)
    html = re.sub(r"<!--.*?-->", " ", html, flags=re.S)
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", html))


def put(src, key, value):
    pat = re.compile(rf"(<!-- fridge:{key}:begin -->).*?(<!-- fridge:{key}:end -->)", re.S)
    if not pat.search(src):
        raise SystemExit(f"REFUSING: {PAGE.name} has no fridge:{key} markers, so there is nowhere to write "
                         "that number. Put them back rather than typing the number in.")
    return pat.sub(lambda m: m.group(1) + value + m.group(2), src)


def main():
    lib = LIB.read_text()
    most, line, door = (const(lib, n) for n in ("FRIDGE_WORD_MAX", "FRIDGE_WORDS", "FRIDGE_DOOR"))

    body = re.search(r"export async function putWord\(.*?\n\}", lib, re.S)
    if not body or "const body = { words, last: mark, door };" not in body.group(0):
        problems.append(f"{LIB.name}: putWord no longer writes exactly {{ words, last, door }}.")
    if not body or "finished = { id: randomUUID(), text: words.join(' '), t: now };" not in body.group(0):
        problems.append(f"{LIB.name}: a finished sentence is no longer exactly an id, its text and a time.")
    if body and re.search(r"\bhandle\b|\bwho\b", body.group(0)):
        problems.append(f"{LIB.name}: putWord mentions a handle or a who. It is given a mark and nothing else.")
    shape = re.search(r"export function shapeSentences\(list\) \{ return list\.map\(\(n\) => \(\{ id: n\.id, "
                      r"text: n\.text, t: n\.t \}\)\); \}", lib)
    if not shape:
        problems.append(f"{LIB.name}: shapeSentences sends something other than an id, a text and a time.")
    for f in FUNCS:
        code = re.sub(r"/\*.*?\*/", " ", f.read_text(), flags=re.S)
        for m in re.finditer(r"json\((.*?)\);\n", code, re.S):
            # Keys and reads, not words: an error may say "the last word is yours".
            if re.search(r"\b(?:last|mark)\s*:|\.(?:last|mark|handle)\b", m.group(1)):
                problems.append(f"{f.name}: an answer carries the mark or a handle. Neither ever leaves the server.")

    src = PAGE.read_text()
    new = put(src, "max", words(most))
    new = put(new, "words", ordinal(line))
    new = put(new, "door", words(door))
    new, n = re.subn(r'(<input class="fos-put__word"[^>]*?maxlength=")\d+(")', rf"\g<1>{most}\2", new)
    if n != 1:
        problems.append(f"{PAGE.name}: the word box is not where this tool writes its maxlength.")

    sweep(plain(new), PAGE.name)
    js = SCRIPT.read_text()
    code = re.sub(r"/\*.*?\*/", " ", js, flags=re.S)
    sweep(" ".join(re.findall(r"'([^']*)'", code)), SCRIPT.name)
    if re.search(r"localStorage\.(?:setItem|removeItem|clear)|sessionStorage|indexedDB|document\.cookie", code):
        problems.append(f"{SCRIPT.name}: it writes to storage. The room stores nothing.")
    if re.search(r"\bhandle\b", code):
        problems.append(f"{SCRIPT.name}: it knows what a handle is. No word on the door is anybody's.")
    for url in re.findall(r"call\('([^']+)'", code):
        if not url.startswith("/cb/fridge"):
            problems.append(f"{SCRIPT.name}: it calls {url}. The fridge talks to its own functions and nothing else.")
    if code.count("fetch(") != 1:
        problems.append(f"{SCRIPT.name}: every request goes through call(), and there is one fetch in it.")

    if SOURCE not in new or "Dave Kapell" not in new:
        problems.append(f"{PAGE.name}: word magnets are Dave Kapell's idea, and the page must say so with its source.")
    if 'id="the-fridge"' not in PRIVACY.read_text():
        problems.append(f"{PRIVACY.name}: no section with id=\"the-fridge\", which the room links for what it keeps.")

    if problems:
        print("REFUSING:\n  " + "\n  ".join(problems))
        return 1
    if new != src:
        PAGE.write_text(new)
    print(f"fridge: a word is up to {words(most)} characters, the {ordinal(line)} word finishes a line, the "
          f"door holds {words(door)}; nothing kept says whose a word was.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
