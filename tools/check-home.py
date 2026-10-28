#!/usr/bin/env python3
"""Hold Home, the community dashboard, to what it and privacy.html#home say.

Ryan's brief, 2026-10-27: home.html, somewhere for people signed on to the CB
to land, see what is new to them and find what the street has, linked from the
radio's bar (a house with a CB aerial where it said CB) and from the joining
page. This checks what a friendly edit could break without anything noticing:

  · IT KEEPS NOTHING. home.js reads love-cb for the pass and never writes it,
    and keeps nothing in the browser at all; the rooms you follow are changed
    by the radio (window.loveRadioFollow), which keeps love-cb.
  · IT SENDS NOTHING NEW. It asks only the paths privacy.html#home describes,
    each the way the radio already asks: /cb/unread and /cb/events with an
    empty body, which only read (never a read mark, never an action). No
    timer: it asks when the page opens and on Look again.
  · NOTHING TYPED BECOMES MARKUP. No innerHTML or its relatives.
  · NO NUMBERS. No .length worked into a sentence: something new is a dot.
  · THE CB'S CLOTHES. home.css names no colour of its own, only the radio's
    seven --cb-*, and nothing in it moves; every drawing in home.js takes its
    inks from home.css's classes, never from a fill or a stroke of its own,
    and every place on it has a drawing.
  · THE BAR'S HOUSE. The radio's bar links to /home.html, named Home, the
    Mover leaves a link alone so the house can be pressed, and the guest bar,
    which has no Home behind it, still says CB.

IF THIS REFUSES: fix the cause. Do not widen a list to make it quiet.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGE = ROOT / "home.html"
JS = ROOT / "home.js"
CSS = ROOT / "home.css"
CB = ROOT / "cb.js"
CALL = ROOT / "call.js"
GUEST = ROOT / "guest.js"
JOIN = ROOT / "join.js"
PRIVACY = ROOT / "privacy.html"
GUIDE = ROOT / "cb-guide.html"

# What home.js may ask, and nothing else. A new one is a sentence on
# privacy.html#home first, then a line here.
ASKS = {"/cb/unread", "/cb/props", "/cb/brass", "/cb/forum?view=latest", "/cb/events", "/cb/online", "/cb/rooms",
        "/feed.xml", "/cb-rooms.json", "/guild-jobs.json", "/data/room-tags.json"}

problems = []


def code_of(path):
    c = re.sub(r"/\*.*?\*/", " ", path.read_text(), flags=re.S)
    return re.sub(r"(?m)^\s*//[^\n]*", " ", c)


js = code_of(JS)
css = re.sub(r"/\*.*?\*/", " ", CSS.read_text(), flags=re.S)

# Nothing kept.
for pat, why in [(r"localStorage\.(setItem|removeItem|clear)", "writes localStorage"),
                 (r"sessionStorage|indexedDB|document\.cookie", "keeps something in the browser"),
                 (r"\.(innerHTML|outerHTML)\s*=|insertAdjacentHTML|createContextualFragment", "builds markup from a string"),
                 (r"setInterval|setTimeout|requestAnimationFrame", "keeps a timer"),
                 (r"\bread\s*:|action\s*:", "sends a read mark or an action")]:
    if re.search(pat, js):
        problems.append(f"home.js {why}. Home keeps nothing, sends nothing new and asks on a press, never on a clock.")

# Only the paths it says.
asked = set(re.findall(r"""(?:ask|file)\(\s*['"]([^'"]+)['"]""", js))
for p in sorted(asked - ASKS):
    problems.append(f"home.js asks {p}, which privacy.html#home does not say it asks. Say so there first, then add it here.")
if re.search(r"\bfetch\(\s*['\"]", js):
    problems.append("home.js fetches a path directly. Every request goes through ask() or file(), which this tool reads.")
if not re.search(r"o\.body = '\{\}'", js) or re.search(r"JSON\.stringify", js):
    problems.append("home.js sends a body other than the empty one: Home only asks, it never changes anything on the server.")

# No numbers in a sentence.
if re.search(r"\.length\s*\+\s*['\"]|['\"]\s*\+\s*[\w.\[\]]+\.length\b", js):
    problems.append("home.js works a count into its words. Something new is a dot, and nothing says how many.")

# The CB's clothes, and nothing moving.
if re.search(r"#[0-9a-fA-F]{3,8}\b|\b(rgb|rgba|hsl|hsla)\(", css):
    problems.append("home.css names a colour of its own. Every colour is one of the radio's seven --cb-*.")
for v in set(re.findall(r"var\((--[\w-]+)", css)):
    if not v.startswith("--cb-"):
        problems.append(f"home.css uses {v}, which is not one of the radio's colours or its theme's face.")
if re.search(r"\b(transition|animation)\s*:|@keyframes|(?<![-\w])transform\s*:", css):
    problems.append("Something in home.css moves. Nothing on Home moves.")
art = re.search(r"var ART = \{(.*?)\n  \};", js, re.S)
if not art:
    problems.append("home.js has no ART block of drawings.")
else:
    a = art.group(1)
    if re.search(r"\b(fill|stroke|style|color)\s*:", a) or "#" in a:
        problems.append("A drawing in home.js gives itself a fill, a stroke or a colour. Its inks come from home.css's classes, the radio's seven.")
    kinds = set(re.findall(r"^\s{4}(\w+): \[", a, re.M))
    places = re.findall(r"\['(\w+)', '/", js)
    for k in places:
        if k not in kinds:
            problems.append(f"The place drawn as '{k}' has no drawing in ART.")

# The bar's house.
cb = CB.read_text()
if not re.search(r"home\.href = '/home\.html';", cb) or "setAttribute('aria-label', 'Home')" not in cb:
    problems.append("cb.js: the radio's bar has no Home link to /home.html named Home.")
if re.search(r"name\.appendChild\(el\('span', 'cb-brand', 'CB'\)\);\s*/\* THE TELEPORTER", cb):
    problems.append("cb.js: the radio's bar says CB again where Home goes.")
if "'cb-brand', 'CB'" not in GUEST.read_text():
    problems.append("guest.js: the guest bar has no Home behind it, so it keeps CB.")
if "if (e.target.closest('a[href]')) return;" not in CALL.read_text():
    problems.append("call.js: the Mover drags by a link, so the radio's Home cannot be pressed with a pointer.")
if "'/home.html'" not in JOIN.read_text():
    problems.append("join.js: the joining page no longer sends a new member Home.")

# The page and the words about it.
page = PAGE.read_text()
if "data-home" not in page or 'src="home.js"' not in page:
    problems.append("home.html has no [data-home] for home.js to draw into, or does not load it.")
if 'id="home"' not in PRIVACY.read_text():
    problems.append("privacy.html has no #home section, which Home links to and this tool's list rests on.")
if 'id="home"' not in GUIDE.read_text():
    problems.append("cb-guide.html has no #home section.")

if problems:
    print("check-home.py refused:")
    for p in problems:
        print("  · " + p)
    sys.exit(1)
print("check-home.py: Home keeps nothing, asks only what it says, counts nothing and wears the radio's colours.")
