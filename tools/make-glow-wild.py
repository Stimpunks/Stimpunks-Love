#!/usr/bin/env python3
"""Glow Wild Hollow: writes the room's facts and credit, and holds its promises.

Helen Edgar's ask, 2026-10-27: something about how nature glows, after Kew's
"How nature glows wild", as another portal out of her Faery Yurt, through a
mushroom, with a jellyfish that lights up. The room is glow-wild-hollow.html,
its data is data/glow-wild.json, its script is glow-wild.js and love.css §129
dresses it.

EVERY SENTENCE IS OURS AND EVERY FACT SAYS WHERE IT WAS READ. Kew's article is
the room's first source and is credited by name, its writer included; nothing
of Kew's is copied. This tool refuses:

  - a fact with no words, no source, or a source that is neither Kew's article
    nor one of the pages the data names as also read.
  - a Latin name. A binomial reads as a determination, and nobody here
    determined anything: the herbarium's rule. The genera most likely to be
    pasted back from a source are named below.
  - eating, foraging or curing, in our words. Honey fungus is in this room and
    a glowing mushroom is the most tempting thing on a page to tell somebody
    to go and find; nothing here is a field guide, Mycelium Munchies' rule.
  - a sentence about another room that its page no longer says (`holds`).
  - glow-wild.js keeping or sending anything, or its lights going faster than
    the floors below, which is what keeps it under the flash line: a light may
    come up quickly when you touch the water, but it always goes down over
    FADE, so nothing can come and go three times in a second (Helen's ask of
    2026-10-28, "far more sensory activated and stimmy", lowered RISE; FADE
    did not move). Its sound and buzz start off, are under MAX_GAIN, and are
    never a recording. A swim or a stir lasts SHOW, about twenty seconds, and
    ends over ENDING, never quicker than FADE; Keep it glowing and Keep it
    stirring start off (Helen's ask, the same day: "slower and more movement
    over 20 secs with option to loop it").
  - a §129 animation outside MAX GLITTER, or one quicker than four seconds.

THE PHOTOGRAPHS ARE REAL ONES, AND THE CRYSTAL WHEEL'S RULES HOLD THEM. Helen's
ask, 2026-10-28: real pictures, like the crystals in Myths & Legends. Each is of
the thing itself, glowing, on Wikimedia Commons under a licence this site can
use, credited on the page with its photographer, its licence and its file
page, and saved without camera data. The tool refuses one missing any of that,
an NC or ND licence, and words for it in anything but plain English. AND IT IS
A PHOTOGRAPH, NEVER A DRAWING OR A PICTURE MADE BY AI (Helen: "no ai pics just
real"): every one says in `real` how that is known, the camera's own record on
its Commons page, or who took it and when, and the tool refuses one that does
not. The friendly edit is a prettier picture of glowing mushrooms off a stock
site, which is very often generated.

THE FILMS ARE OTHER PEOPLE'S, ON THEIR OWN CHANNELS. Helen's ask the same day:
films of the forest and under the sea from National Geographic or the like.
Each is a pick (tools/natures.py's rack, dressed in §129) with its length on
the press, and goes up on the hollow's screen; check-jukebox.py asks after
them. Nothing reaches YouTube until somebody presses.
"""
import html
import json
import re
import sys
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import imgsize  # noqa: E402
from natures import Problems, check_picks, picks_block, picks_credit, screen_block  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
PAGE = ROOT / "glow-wild-hollow.html"
DATA = ROOT / "data" / "glow-wild.json"
SCRIPT = ROOT / "glow-wild.js"
CSS = ROOT / "love.css"

LATIN = re.compile(r"\b(Armillaria|Noctiluca|Lampyris|Aequorea|Mycena|Panellus|Omphalotus|"
                   r"Mnemiopsis|Beroe|Pleurobrachia)\b")
NOT_HERE = re.compile(r"\b(edible|forag\w*|cures?|cured|healing|remed\w*|medicin\w*|therap\w*|"
                      r"good for you|you (?:can|could|may) eat)\b", re.I)
FLOORS = {"RISE": 100, "FADE": 1500}
FREE = {"Public domain", "CC0", "CC BY 2.0", "CC BY 3.0", "CC BY 4.0",
        "CC BY-SA 2.0", "CC BY-SA 2.5", "CC BY-SA 3.0", "CC BY-SA 4.0"}
SCREEN, SCREEN_NAME = "hollow-screen", "the hollow's screen"

problems = []


def jpeg_exif(path):
    b = path.read_bytes()
    if b[:2] != b"\xff\xd8":
        return None
    i = 2
    while i + 4 < len(b) and b[i] == 0xFF:
        m, n = b[i + 1], int.from_bytes(b[i + 2:i + 4], "big")
        if m == 0xE1 and (b[i + 4:i + 8] == b"Exif" or b[i + 4:i + 9] == b"http:"):
            return True
        if m == 0xDA:
            break
        i += 2 + n
    return False


def photo(ph, w, big=False):
    f = ROOT / ph.get("file", "")
    if not f.is_file():
        refuse(f"{w}: no photograph at {ph.get('file')}.")
        return ""
    ex = jpeg_exif(f)
    if ex is None:
        refuse(f"{w}: {ph['file']} is not a JPEG.")
    elif ex:
        refuse(f"{w}: {ph['file']} still carries camera data. Save it again without.")
    if ph.get("licence") not in FREE:
        refuse(f"{w}: licence {ph.get('licence')!r} is not one this site can use (no NC, no ND).")
    lu = ph.get("licence_url") or ""
    if ph.get("licence") not in ("Public domain", "CC0") and not lu.startswith("https://creativecommons.org/"):
        refuse(f"{w}: no link to its licence, which crediting it needs.")
    if not str(ph.get("commons", "")).startswith("https://commons.wikimedia.org/wiki/File:"):
        refuse(f"{w}: no Commons file page, where its licence lives.")
    for k in ("photo_by", "shows", "real"):
        if not ph.get(k):
            refuse(f"{w}: no {k}.")
    for rx in (LATIN, NOT_HERE):
        m = rx.search(ph.get("shows", ""))
        if m:
            refuse(f"{w}: its words say {m.group(0)!r}. No Latin names, and nothing about eating, picking or curing.")
    lic = f'<a href="{esc(lu)}">{esc(ph["licence"])}</a>' if lu else esc(ph.get("licence", ""))
    cls = "hollow-photo hollow-photo--big" if big else "hollow-photo"
    return (f'<figure class="{cls}"><img class="hollow-photo__img" src="{esc(ph["file"])}" '
            f'{imgsize.attrs(f)} alt="{html.escape(ph.get("shows", ""))}" loading="lazy" decoding="async">'
            f'<figcaption class="hollow-photo__credit">Photograph by {esc(ph.get("photo_by", ""))}, {lic}, '
            f'<a href="{esc(ph.get("commons", ""))}">via Wikimedia Commons</a>; resized.</figcaption></figure>')


def refuse(msg):
    problems.append(msg)


def esc(s):
    return html.escape(s, quote=False)


d = json.loads(DATA.read_text(encoding="utf-8"))
kew = d.get("kew", {})
also = d.get("also_read", [])
known = {kew.get("url")} | {a.get("url") for a in also}
for k in ("title", "by", "on", "site", "url"):
    if not kew.get(k):
        refuse(f"data/glow-wild.json: kew has no {k}. Kew's article is credited in full or not used.")

page = PAGE.read_text(encoding="utf-8")
blocks = {}
for part in d.get("parts", []):
    pid = part.get("id", "")
    if f'<h2 id="{pid}">' not in page:
        refuse(f"{pid}: glow-wild-hollow.html has no heading with that id for its facts to sit under.")
    items = []
    for i, f in enumerate(part.get("facts", [])):
        w = f"{pid} fact {i + 1}"
        says, src, name = f.get("says", ""), f.get("source", ""), f.get("source_name", "")
        if not says or not src or not name:
            refuse(f"{w}: a fact needs its words, its source and the source's name.")
            continue
        if src not in known:
            refuse(f"{w}: {src} is neither Kew's article nor a page in also_read.")
        for m in (LATIN.search(says), NOT_HERE.search(says)):
            if m:
                refuse(f"{w}: says {m.group(0)!r}. No Latin names, and nothing about eating, picking or curing.")
        items.append(f'<li>{esc(says)} <span class="hollow-src">(<a href="{esc(src)}">{esc(name)}</a>)</span></li>')
    if not items:
        refuse(f"{pid}: a part with no facts.")
    shots = [photo(ph, f"{pid} photo {i + 1}", big=(i == 0)) for i, ph in enumerate(part.get("photos", []))]
    if not shots:
        refuse(f"{pid}: no photograph. Every part shows the real thing glowing.")
    pics = ('\n    ' + shots[0]) if shots else ""
    if len(shots) > 1:
        pics += '\n    <div class="hollow-photos">' + "".join(shots[1:]) + '</div>'
    blocks[pid] = pics + '\n    <ul class="hollow-facts">\n      ' + "\n      ".join(items) + '\n    </ul>\n    '

gallery = [photo(ph, f"gallery photo {i + 1}") for i, ph in enumerate(d.get("gallery", []))]
blocks["gallery"] = '\n    <div class="hollow-photos hollow-photos--gallery">' + "".join(gallery) + '</div>\n    '
seen_files = [ph.get("file") for part in d.get("parts", []) for ph in part.get("photos", [])] + \
             [ph.get("file") for ph in d.get("gallery", [])]
if len(seen_files) != len(set(seen_files)):
    refuse("a photograph is on the page twice.")
for f in sorted((ROOT / "glow-wild").glob("*")):
    if f"glow-wild/{f.name}" not in seen_files:
        refuse(f"glow-wild/{f.name} is in the folder and on no part of the page; take it out, or give it a record.")

films = d.get("films", {})
fp = Problems()
check_picks(films.get("wood"), "films.wood", fp)
check_picks(films.get("sea"), "films.sea", fp)
for msg in fp:
    refuse(msg)
for v in films.get("wood", []) + films.get("sea", []):
    for rx in (LATIN, NOT_HERE):
        m = rx.search(v.get("about", ""))
        if m:
            refuse(f"films: the line under {v.get('title')!r} says {m.group(0)!r}.")
if not fp:
    blocks["films"] = "\n" + "\n".join([
        screen_block("hollow", SCREEN, SCREEN_NAME, "Nothing is on the screen. Put a film up from either shelf."),
        picks_block(films["wood"], "hollow", SCREEN, SCREEN_NAME, "In the wood", "Films of the glow in the wood"),
        picks_block(films["sea"], "hollow", SCREEN, SCREEN_NAME, "Under the sea", "Films of the glow under the sea"),
        '    <p class="hollow-credit">' + picks_credit(films["wood"] + films["sea"], "Chosen for Helen Edgar",
                                                       date.fromisoformat(films["checked"]).strftime("%-d %B %Y")) + ".</p>",
    ]) + "\n    "

wiki = ", ".join(f'<a href="{esc(a["url"])}">{esc(a["name"])}</a>' for a in also[:-1])
if len(also) > 1:
    wiki += f' and <a href="{esc(also[-1]["url"])}">{esc(also[-1]["name"])}</a>'
blocks["credit"] = (
    f'\n    <p class="hollow-credit">Most of what is here was first read in '
    f'<a href="{esc(kew["url"])}">&ldquo;{esc(kew["title"])}&rdquo;</a>, by {esc(kew["by"])}, for '
    f'{esc(kew["site"])}, {esc(kew["on"])}, and the rest in Wikipedia&rsquo;s articles on {wiki}, '
    f'on {date.fromisoformat(d["_checked"]).strftime("%-d %B %Y")}. Every sentence here is ours, written for this room, and every fact '
    f'says where it was read. The drawings are ours too, and every light in them belongs to '
    f'something alive. The photographs are their photographers&rsquo;, each credited under it, and the '
    f'films are their makers&rsquo;, on their own channels.</p>\n    ')

for h in d.get("holds", []):
    other = ROOT / h["page"]
    if not other.is_file() or h["words"] not in other.read_text(encoding="utf-8"):
        refuse(f"holds: {h['page']} no longer says {h['words']!r}, and {h['why']}. Change the sentence here.")

# Our words on the page, with the facts' sources' addresses stripped out.
text = re.sub(r"<[^>]+>", " ", re.sub(r"<script.*?</script>|<!--.*?-->", " ", page, flags=re.S))
for rx in (LATIN, NOT_HERE):
    m = rx.search(html.unescape(text))
    if m:
        refuse(f"glow-wild-hollow.html says {m.group(0)!r}. No Latin names, and nothing about eating, picking or curing.")
if '<script src="glow-wild.js" defer></script>' not in page:
    refuse("glow-wild-hollow.html does not load glow-wild.js, so the sea and the jellyfish stay dark.")
if 'class="dial"' not in page or page.count('class="dial__btn"') != 3:
    refuse("glow-wild-hollow.html has no glitter dial. Every room has one; the hollow shipped without it once.")
for s in ("love-embed.js", "rack.js"):
    if f'<script src="{s}" defer></script>' not in page:
        refuse(f"glow-wild-hollow.html does not load {s}, so every film's button would press and do nothing.")

js = SCRIPT.read_text(encoding="utf-8")
code = re.sub(r"/\*.*?\*/", " ", js, flags=re.S)
code = re.sub(r"(?m)//.*$", " ", code)
if re.search(r"localStorage|sessionStorage|indexedDB|fetch\(|XMLHttpRequest|sendBeacon|WebSocket|"
             r"EventSource|innerHTML|outerHTML|insertAdjacentHTML|document\.cookie", code):
    refuse("glow-wild.js keeps or sends something, or writes markup from a string. It keeps and sends nothing.")
for name, floor in FLOORS.items():
    m = re.search(rf"var {name} = (\d+);", code)
    if not m or int(m.group(1)) < floor:
        refuse(f"glow-wild.js: {name} must be at least {floor} ms. A light may come up quickly, but one "
               "that goes faster than FADE could come and go three times in a second, which is a flash.")
m = re.search(r"var MAX_SPARKS = (\d+);", code)
if not m or int(m.group(1)) > 400:
    refuse("glow-wild.js: MAX_SPARKS must be set, and no more than 400 small lights in a tank.")
m = re.search(r"var MAX_GAIN = ([\d.]+);", code)
if not m or float(m.group(1)) > 0.2:
    refuse("glow-wild.js: MAX_GAIN must be set, and no more than 0.2, the Repeater's ceiling.")
for what in ("audio", "buzz"):
    if not re.search(rf"var {what} = \{{ on: false", code):
        refuse(f"glow-wild.js: {what} must start off. Sound and buzz come on only with their own switches.")
if re.search(r"new (?:Audio|window\.Audio)\b|\.mp3|\.ogg|\.wav|\.m4a", code):
    refuse("glow-wild.js plays a recording. The hollow's sounds are arithmetic, made in the browser.")
if re.search(r"getUserMedia|DeviceMotion|DeviceOrientation", code):
    refuse("glow-wild.js asks for a microphone, a camera or the phone's movement. It asks for nothing.")
m = re.search(r"var SHOW = (\d+);", code)
if not m or int(m.group(1)) < 15000:
    refuse("glow-wild.js: SHOW must be set, and the jellyfish's swim and a stir last about twenty seconds, "
           "Helen's ask of 2026-10-28.")
m = re.search(r"var ENDING = (\d+);", code)
if not m or int(m.group(1)) < FLOORS["FADE"]:
    refuse(f"glow-wild.js: ENDING must be at least {FLOORS['FADE']} ms. A swim or a stir ends by fading, never by going out.")
for what in ("seaLooping", "jLooping"):
    if not re.search(rf"var {what} = false;", code):
        refuse(f"glow-wild.js: {what} must start off. Keep it stirring and Keep it glowing come on only when pressed.")
if "still()" not in code:
    refuse("glow-wild.js no longer asks still(). At Gentle nothing comes and goes.")

css = CSS.read_text(encoding="utf-8")
sec = re.search(r"/\* §129 ── SUBROOM: Glow Wild Hollow.*?(?=/\* §130 )", css, re.S)
if not sec:
    refuse("love.css has no §129 for Glow Wild Hollow before §130.")
else:
    body = re.sub(r"/\*.*?\*/", "", sec.group(0), flags=re.S)
    for rule in re.finditer(r"([^{}]+)\{([^{}]*)\}", body):
        sel, decl = rule.group(1).strip(), rule.group(2)
        if re.search(r"\banimation\s*:", decl):
            if 'html[data-intensity="max"]' not in sel:
                refuse(f"§129: an animation outside MAX GLITTER ({sel}).")
            t = re.search(r"animation:\s*[\w-]+\s+([\d.]+)s", decl)
            if t and float(t.group(1)) < 4:
                refuse(f"§129: {sel} moves in {t.group(1)}s. Nothing in the hollow moves faster than once in four seconds.")

if problems:
    raise SystemExit("REFUSING:\n  " + "\n  ".join(problems))

for part, block in blocks.items():
    b, e = f"<!-- glow-wild:{part}:begin -->", f"<!-- glow-wild:{part}:end -->"
    if page.count(b) != 1 or page.count(e) != 1:
        raise SystemExit(f"REFUSING: glow-wild-hollow.html must hold one {b} and one {e}.")
    page = page[:page.index(b) + len(b)] + block + page[page.index(e):]
if page != PAGE.read_text(encoding="utf-8"):
    PAGE.write_text(page, encoding="utf-8")
print("make-glow-wild: the hollow's facts and credit written, every one sourced; the sea and the jellyfish keep and send nothing and never flash.")
