#!/usr/bin/env python3
"""Looking-Glass House: writes the pin board, the board, the book and the cuts, and holds the room's promises.

Helen Edgar's ask, 2026-10-31: "add alice quotes page on a pin board and copy
this page [the Rabbit Hole] as a looking glass so all reflected back in Faery
yurt - go through a looking glass instead of woodern doors to rooms. Add more
fun things." The room is looking-glass-house.html, behind her yurt, through the
looking-glass that hangs there instead of the oak doors her other rooms have;
its data is data/looking-glass-house.json, its script is looking-glass-house.js
and love.css §148 dresses it.

THE RABBIT HOLE, THE OTHER WAY ROUND. That room is a shaft you fall down, pale
words on wet slate, darker the further you read. This is a glass you go
through, dark words on silver, the yurt's own room reflected in it: where the
yurt reads cream on dark, the glass gives it back dark on pale. If the ground in
§148 ever goes dark it has become the Rabbit Hole with a frame on, or the yurt
with the lights off, and it is this room that moves.

EVERY WORD ON THE PIN BOARD IS CARROLL'S AND NAMES WHERE IT IS. Each pin names
its book, its chapter and who says it, and is at most `cap` words long, because
a board of quotations drifts into a copy of the book one good line at a time
(the Zibaldone's warning, for a book that is out of copyright: the cap here is
about pointing at the books rather than replacing them). `--verify` fetches
Project Gutenberg's texts of both books and finds every pin, word for word, in
the chapter it names, and the Jabberwocky verse and the un-birthday line too.
It needs the network, so it is never run by check-all.sh; run it when a pin is
added or changed.

THE ENGRAVINGS ARE TENNIEL'S 1871 CUTS, each on Wikimedia Commons with a public
domain statement, never cropped, tinted or filtered (the Rabbit Hole's rule),
and every word beside one is ours.

THE TOYS KEEP AND SEND NOTHING. looking-glass-house.js moves a pawn, holds a
book up to the glass, writes your words back to you the wrong way round and
answers the un-birthday question; it stores nothing, fetches nothing, writes no
markup from a string and runs on no timer. The writing glass is a box you type
into, and what you type never leaves the page.
"""
import html
import json
import re
import sys
import urllib.request
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import imgsize  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
PAGE = ROOT / "looking-glass-house.html"
DATA = ROOT / "data" / "looking-glass-house.json"
SCRIPT = ROOT / "looking-glass-house.js"
CSS = ROOT / "love.css"
SECTION, NEXT = "§148", "§149"
ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"]
QUOTES = "“”‘’\"' "

problems = []


def refuse(msg):
    problems.append(msg)


def esc(s):
    return html.escape(s, quote=False)


def italics(s):
    """Gutenberg's _underscores_ are the books' italics."""
    return re.sub(r"_([^_]+)_", r"<em>\1</em>", esc(s))


def words(s):
    return len(re.findall(r"[A-Za-z’'-]+", s))


def chapter_text(raw, n):
    """The text of chapter n, after the contents list, flattened to one line."""
    flat = re.sub(r"\s+", " ", raw)
    heads = [m for m in re.finditer(r"CHAPTER ([IVX]+)\.", flat)]
    # The contents list names every chapter first; the chapters themselves are
    # the last occurrence of each numeral.
    last = {}
    for m in heads:
        last[m.group(1)] = m.start()
    starts = sorted(last.items(), key=lambda kv: kv[1])
    for i, (num, at) in enumerate(starts):
        if num == ROMAN[n]:
            end = starts[i + 1][1] if i + 1 < len(starts) else flat.find("*** END OF THE PROJECT GUTENBERG")
            return flat[at:end]
    return ""


d = json.loads(DATA.read_text(encoding="utf-8"))
books = d.get("books", {})
cap = d.get("cap")
if not isinstance(cap, int) or cap < 1:
    refuse("cap: the board needs a word limit, and it is written in the data with its reason.")

# THE PIN BOARD.
pins = []
seen = set()
for i, p in enumerate(d.get("pins", []), 1):
    w = f"pin {i}"
    for k in ("book", "chapter", "who", "says"):
        if not p.get(k):
            refuse(f"{w}: has no {k}. Every pin names its book, its chapter and who says it.")
    if p.get("book") not in books:
        refuse(f"{w}: book {p.get('book')!r} is not one of {sorted(books)}.")
        continue
    if not isinstance(p.get("chapter"), int) or not 1 <= p["chapter"] <= 12:
        refuse(f"{w}: chapter {p.get('chapter')!r} is not a chapter of the book.")
        continue
    if isinstance(cap, int) and words(p.get("says", "")) > cap:
        refuse(f"{w}: {words(p['says'])} words. The board points at the books; {cap} at most.")
    if p.get("says") in seen:
        refuse(f"{w}: the same words are pinned twice.")
    seen.add(p.get("says"))
    b = books[p["book"]]
    pin = "red" if i % 2 else "white"
    pins.append(
        f'      <li class="lgh-pin lgh-pin--{pin}">\n'
        f'        <blockquote class="lgh-pin__says">{italics(p["says"])}</blockquote>\n'
        f'        <p class="lgh-pin__who">{esc(p["who"])}, <cite>{esc(b["title"])}</cite>, chapter {ROMAN[p["chapter"]]}</p>\n'
        f'      </li>')
if len(pins) < 2:
    refuse("pins: a pin board with nothing pinned to it.")

# THE BOARD: Alice's own squares, second to eighth, in order.
squares = d.get("squares", [])
if [s.get("rank") for s in squares] != list(range(2, 9)):
    refuse("squares: Alice goes up the board from the second square to the eighth, one at a time, "
           "and the data must hold each of them in order.")
rows = []
for s in squares:
    for k in ("where", "ours", "chapter"):
        if not s.get(k):
            refuse(f"square {s.get('rank')}: has no {k}.")
    rows.append(f'      <li class="lgh-square" data-lgh-square="{s.get("rank")}"><p class="lgh-square__where">'
                f'{esc(s.get("where", ""))}</p><p class="lgh-square__ours">{esc(s.get("ours", ""))} '
                f'<span class="lgh-square__ch">Chapter {ROMAN[s.get("chapter") or 0]}.</span></p></li>')

# THE BOOK ON THE MANTELPIECE.
jab = d.get("jabberwocky", {})
lines = jab.get("lines", [])
if len(lines) != 4:
    refuse("jabberwocky: Carroll printed one verse the wrong way round, four lines, and that verse only is here.")
verse = "".join(f'<span class="lgh-book__line">{esc(x)}</span>' for x in lines)

# THE ENGRAVINGS.
plates = []
for i, p in enumerate(d.get("plates", []), 1):
    w = f"plate {i}"
    f = ROOT / p.get("file", "")
    if not p.get("file") or not f.exists():
        refuse(f"{w}: {p.get('file')!r} is not on disk.")
        continue
    if not str(p.get("commons", "")).startswith("https://commons.wikimedia.org/wiki/File:"):
        refuse(f"{w}: no Wikimedia Commons page. Every engraving here is shown because its scan says it is public domain.")
    for k in ("shows", "ours", "chapter"):
        if not p.get(k):
            refuse(f"{w}: has no {k}.")
    plates.append(
        f'    <figure class="lgh-cut">\n'
        f'      <div class="lgh-cut__mat"><img src="{esc(p["file"])}" {imgsize.attrs(f)} alt="{html.escape(p.get("shows", ""))}" loading="lazy" decoding="async"></div>\n'
        f'      <figcaption class="lgh-cut__cap">\n'
        f'        <p class="lgh-cut__ours">{esc(p.get("ours", ""))}</p>\n'
        f'        <p class="lgh-cut__prov">Wood engraving by John Tenniel for <cite>Through the Looking-Glass</cite>, 1871, '
        f'chapter {ROMAN[p.get("chapter") or 0]}. Public domain. <a href="{esc(p.get("commons", ""))}">The scan we used</a>.</p>\n'
        f'      </figcaption>\n'
        f'    </figure>')

checked = date.fromisoformat(d["_checked"]).strftime("%-d %B %Y")
blocks = {
    "pins": '\n    <ul class="lgh-board">\n' + "\n".join(pins) + '\n    </ul>\n    ',
    "squares": '\n    <ol class="lgh-squares" start="2">\n' + "\n".join(rows) + '\n    </ol>\n    ',
    "verse": f'\n        <p class="lgh-book__verse" data-lgh-verse>{verse}</p>\n        ',
    "found": f'\n      <p class="lgh-said">{italics(jab.get("found", ""))} <span class="lgh-said__ch">Alice, chapter {ROMAN[jab.get("chapter", 1)]}.</span></p>\n      ',
    "unbirthday": f'\n        <p class="lgh-said">{italics(d.get("unbirthday", {}).get("says", ""))} '
                  f'<span class="lgh-said__ch">Humpty Dumpty, <cite>Through the Looking-Glass</cite>, chapter '
                  f'{ROMAN[d.get("unbirthday", {}).get("chapter", 6)]}.</span></p>\n        ',
    "plates": "\n" + "\n".join(plates) + "\n    ",
    "credit": (
        f'\n    <p class="lgh-credit">Looking-Glass House is Helen Edgar&rsquo;s, behind her yurt, asked for on '
        f'31 October 2026. Every word on the pin board, the verse in the book and the un-birthday line are '
        f'Lewis Carroll&rsquo;s, out of copyright everywhere, from <cite>{esc(books["wonderland"]["title"])}</cite> '
        f'({books["wonderland"]["year"]}) and <cite>{esc(books["glass"]["title"])}</cite> ({books["glass"]["year"]}), '
        f'each read word for word in its chapter in Project Gutenberg&rsquo;s texts '
        f'(<a href="{books["wonderland"]["gutenberg"]}">eBook #11</a> and <a href="{books["glass"]["gutenberg"]}">eBook #12</a>) '
        f'on {checked}. The engravings are John Tenniel&rsquo;s, from 1871, each credited under it. '
        f'Everything else, the drawings, the squares and the words beside the cuts, is ours.</p>\n    '),
}

# THE PAGE.
page = PAGE.read_text(encoding="utf-8")
for s in ("love.js", "quest.js", "looking-glass-house.js"):
    if f'<script src="{s}" defer></script>' not in page:
        refuse(f"looking-glass-house.html does not load {s}.")
if 'class="dial"' not in page or page.count('class="dial__btn"') != 3:
    refuse("looking-glass-house.html has no glitter dial. Every room has one.")
if 'href="rabbit-hole.html"' not in page:
    refuse("looking-glass-house.html no longer points down the street to the Rabbit Hole, whose looking-glass this is.")
if re.search(r"<(iframe|video|audio)\b|class=\"facade\"", page):
    refuse("looking-glass-house.html plays something. Nothing in the glass plays.")

# THE SCRIPT keeps and sends nothing.
js = SCRIPT.read_text(encoding="utf-8")
code = re.sub(r"/\*.*?\*/", " ", js, flags=re.S)
code = re.sub(r"(?m)//.*$", " ", code)
if re.search(r"localStorage|sessionStorage|indexedDB|fetch\(|XMLHttpRequest|sendBeacon|WebSocket|"
             r"EventSource|innerHTML|outerHTML|insertAdjacentHTML|document\.cookie|setInterval|setTimeout", code):
    refuse("looking-glass-house.js keeps or sends something, writes markup from a string, or runs on a timer. "
           "It answers presses and does nothing else.")

# §148 moves nothing below MAX GLITTER, and nothing at all faster than twice a second.
css = CSS.read_text(encoding="utf-8")
sec = re.search(rf"/\* {SECTION} ── SUBROOM: Looking-Glass House.*?(?=/\* {NEXT} )", css, re.S)
if not sec:
    refuse(f"love.css has no {SECTION} for Looking-Glass House before {NEXT}.")
else:
    body = re.sub(r"/\*.*?\*/", "", sec.group(0), flags=re.S)
    for rule in re.finditer(r"([^{}]+)\{([^{}]*)\}", body):
        sel, decl = rule.group(1).strip(), rule.group(2)
        if re.search(r"\banimation\s*:", decl) and 'html[data-intensity="max"]' not in sel:
            refuse(f"{SECTION}: an animation outside MAX GLITTER ({sel}).")


def verify():
    texts = {}
    for key, b in books.items():
        num = b["gutenberg"].rsplit("/", 1)[1]
        url = f"https://www.gutenberg.org/cache/epub/{num}/pg{num}.txt"
        req = urllib.request.Request(url, headers={"User-Agent": "StimpunksWorld/1.0"})
        texts[key] = urllib.request.urlopen(req, timeout=30).read().decode("utf-8")
    bad = []

    def find(book, ch, s, w):
        inner = re.sub(r"\s+", " ", s).strip(QUOTES)
        if inner not in chapter_text(texts[book], ch):
            bad.append(f"{w}: not found word for word in chapter {ROMAN[ch]} of {books[book]['title']}.")

    for i, p in enumerate(d.get("pins", []), 1):
        find(p["book"], p["chapter"], p["says"], f"pin {i}")
    for x in lines:
        find("glass", jab["chapter"], x, "jabberwocky")
    find("glass", jab["chapter"], jab["found"], "jabberwocky: what Alice says")
    find("glass", d["unbirthday"]["chapter"], d["unbirthday"]["says"], "unbirthday")
    if bad:
        raise SystemExit("REFUSING:\n  " + "\n  ".join(bad))
    print(f"looking-glass house: every pin, the verse and the un-birthday line read word for word in Gutenberg's texts.")


if problems:
    raise SystemExit("REFUSING:\n  " + "\n  ".join(problems))

if "--verify" in sys.argv:
    verify()

for part, block in blocks.items():
    b, e = f"<!-- lgh:{part}:begin -->", f"<!-- lgh:{part}:end -->"
    if page.count(b) != 1 or page.count(e) != 1:
        raise SystemExit(f"REFUSING: looking-glass-house.html must hold one {b} and one {e}.")
    page = page[:page.index(b) + len(b)] + block + page[page.index(e):]
PAGE.write_text(page, encoding="utf-8")
print(f"looking-glass house: {len(pins)} pins on the board, {len(squares)} squares across it, "
      f"{len(plates)} engravings in {PAGE.name}")
