#!/usr/bin/env python3
"""Write Your Room's questions, under Build it with us, out of its own prompt.

WHY THERE IS A TOOL FOR ONE LIST. Your Room asks the same questions twice: once
to a person who wants us to build their room with them, and once inside the
prompt somebody hands their AI. Ryan, 2026-10-14, after people said they did not
know what to send: the questions belong on the page as well as in the prompt.
Typed twice, they drift the first time somebody improves one of them, and a
person answering the page's questions would be sending something different from
what the prompt asks for. So the PROMPT IS THE SOURCE. It is hand-written, in
the <pre> on the page, and this tool reads its question lines (the "- " lines
under "FIRST, ASK ME ABOUT THE ROOM.") and writes them into the list between the
`your-room:questions` markers. Change a question in the prompt, then run this.
Never hand-edit between the markers.

THE PROMPT IS IN THE FIRST PERSON AND THE PAGE IS IN THE SECOND, so "my name as
I want it credited" becomes "your name as you want it credited". The swap is a
short word list, and the tool refuses a question that still says I, me or my
after it, rather than publishing a sentence in the wrong voice. A question that
needs a word the list does not know gets the word added here, on purpose.

IT REFUSES rather than guesses: a prompt it cannot find, a question block it
cannot find or that is empty, markers missing or doubled, and a question left in
the first person.
"""
import html
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
PAGE = ROOT / "your-room.html"

HEAD = "FIRST, ASK ME ABOUT THE ROOM."
BEGIN, END = "<!-- your-room:questions:begin -->", "<!-- your-room:questions:end -->"

# First person, as the prompt says it, to second, as the page says it.
SWAP = [
    (r"\bI'm\b", "you're"),
    (r"\bI've\b", "you've"),
    (r"\bI'd\b", "you'd"),
    (r"\bmyself\b", "yourself"),
    (r"\bmine\b", "yours"),
    (r"\bmy\b", "your"),
    (r"\bme\b", "you"),
    (r"\bI\b", "you"),
]
FIRST_PERSON = re.compile(r"\b(I|I'm|I've|I'd|me|my|mine|myself)\b")


def refuse(problems):
    print("REFUSING to write Your Room's questions:")
    for p in problems:
        print("  · " + p)
    sys.exit(1)


src = PAGE.read_text()
m = re.search(r'<pre id="yr-prompt-text"[^>]*>(.*?)</pre>', src, re.S)
if not m:
    refuse(["your-room.html has no <pre id=\"yr-prompt-text\">, so there is no prompt to read the questions out of."])
prompt = html.unescape(m.group(1))

lines = prompt.split("\n")
at = next((i for i, line in enumerate(lines) if line.startswith(HEAD)), None)
if at is None:
    refuse([f"the prompt no longer has a line starting {HEAD!r}, which is where its questions are."])
asks = []
for line in lines[at + 1:]:
    if not line.startswith("- "):
        break
    asks.append(line[2:].strip())
if not asks:
    refuse([f"the prompt's {HEAD!r} line has no \"- \" questions under it."])

problems = []
items = []
for ask in asks:
    said = ask
    for pat, to in SWAP:
        said = re.sub(pat, to, said)
    left = FIRST_PERSON.search(said)
    if left:
        problems.append(f"{ask!r} still says {left.group(0)!r} after the swap to the second "
                        "person; teach SWAP the word rather than writing the page by hand.")
        continue
    said = said[0].upper() + said[1:]
    if not said.endswith((".", "?", "!")):
        said += "."
    items.append("    <li>" + html.escape(said, quote=False).replace("'", "&rsquo;") + "</li>")

if src.count(BEGIN) != 1 or src.count(END) != 1:
    problems.append(f"your-room.html needs exactly one {BEGIN} and one {END}, round the list under Build it with us.")
if problems:
    refuse(problems)

block = BEGIN + '\n  <ul>\n' + "\n".join(items) + "\n  </ul>\n  " + END
new = re.sub(re.escape(BEGIN) + r".*?" + re.escape(END), lambda _: block, src, flags=re.S)
if new != src:
    PAGE.write_text(new)
    print("your room: the questions under Build it with us were rewritten from the prompt")
else:
    print("your room: the questions under Build it with us already match the prompt")
