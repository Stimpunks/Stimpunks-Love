#!/usr/bin/env python3
"""The Play Pod: writes the room's ideas, photographs and credits, and holds its promises.

Helen Edgar's ask, 2026-10-28: a sensory play room through a door in her Faery
Yurt, under the Glimmer Window and before the Regulation Nook, holding glow
baths, glow nails, glow painting, tonic water under a UV lamp, messy play, mark
making, PMLD sensory mark making and tuff trays, "as ideas for families", with
"ideas and photos with credit", and the people she works with credited by name.
The room is play-pod.html, its data is data/play-pod.json, its script is
play-pod.js and love.css §131 dresses it.

EVERY IDEA SAYS WHO SHARED IT. Helen asked for no links to the sites the ideas
came from, so each idea names its maker in words, and the people she works
with, the one place the room links out, are linked to their own pages. This
tool refuses:

  - an idea with no words or nobody named for it.
  - play sold by an outcome (development, skills, readiness) in our words: play
    is for its own sake, The Pile's rule. And a cure: nothing here treats
    anybody, Glow Wild Hollow's rule.
  - water beads anywhere but the care line saying why they are left out: they
    grow inside a body if swallowed, and a page of ideas for families is the
    most likely place for somebody to paste them back in.
  - an edible-messy-play part without its care line saying edible means safe
    for whoever is playing, allergies and swallowing included. Until
    2026-10-28 the tool refused the word "edible" anywhere; Helen's call that
    day reversed it and gave edible messy play a part of its own, and the care
    line is what the refusal was protecting.

THE PHOTOGRAPHS ARE REAL ONES, AND NONE IS OF A CHILD. Helen's are hers, in
data/polaroids.json, each listing this page; the rest are on Wikimedia Commons
under a licence this site can use, credited under the picture and saved with
no camera data, and each says in `real` how it is known to be a photograph
(Helen: "no ai pics just real"). A photograph whose words name a child is
refused: this street does not publish anybody too young to say yes, and
messy play's own pictures are nearly all of children, which is exactly why.

THE LAMP IS THE ROOM. Everything here fluoresces: it glows only while the UV
lamp is on and stops the moment it goes off, which is what holds the pod off
Glow Go Gee Gaws, whose toys store the light and give it back. play-pod.js
switches the drawing between the lamp and daylight on a press and keeps and
sends nothing, and §131 moves nothing below MAX GLITTER.
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
PAGE = ROOT / "play-pod.html"
DATA = ROOT / "data" / "play-pod.json"
POLAROIDS = ROOT / "data" / "polaroids.json"
SCRIPT = ROOT / "play-pod.js"
CSS = ROOT / "love.css"

FREE = {"Public domain", "CC0", "CC BY 2.0", "CC BY 3.0", "CC BY 4.0",
        "CC BY-SA 2.0", "CC BY-SA 2.5", "CC BY-SA 3.0", "CC BY-SA 4.0"}
CHILD = re.compile(r"\b(child\w*|kids?|toddlers?|bab(?:y|ies)|boys?|girls?|infants?|pupils?)\b", re.I)
OUTCOME = re.compile(r"\b(develop\w*|skills?|school[- ]ready|readiness|fine motor|gross motor|"
                     r"cures?|cured|heal\w*|remed\w*|therap\w*|treat(?:s|ment))\b", re.I)
BEADS = re.compile(r"\b(water ?beads?|orbeez|gel beads?)\b", re.I)
SCREEN, SCREEN_NAME = "ppd-screen", "the pod's screen"

problems = []


def refuse(msg):
    problems.append(msg)


def esc(s):
    return html.escape(s, quote=False)


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


pol = json.loads(POLAROIDS.read_text(encoding="utf-8"))
pol = pol if isinstance(pol, list) else next(v for v in pol.values() if isinstance(v, list))
records = {p.get("id"): p for p in pol}


def helens(ph, w):
    rec = records.get(ph["polaroid"])
    if not rec:
        refuse(f"{w}: {ph['polaroid']} has no record in data/polaroids.json.")
        return ""
    if "play-pod.html" not in rec.get("elsewhere", []):
        refuse(f"{w}: {ph['polaroid']}'s record does not list play-pod.html in `elsewhere`, so a withdrawal "
               "would miss this page.")
    f = next((f for f in sorted((ROOT / "photos").glob(ph["polaroid"] + ".*"))), None)
    if not f:
        refuse(f"{w}: no file in photos/ for {ph['polaroid']}.")
        return ""
    return (f'<figure class="ppd-photo"><img class="photo ppd-photo__img" src="photos/{f.name}" {imgsize.attrs(f)} '
            f'alt="{html.escape(rec.get("alt", ""))}" loading="lazy" decoding="async">'
            f'<figcaption class="ppd-photo__credit">Photograph by Helen Edgar, in her yurt under the UV lamp.'
            f'</figcaption></figure>')


def commons(ph, w):
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
            refuse(f"{w}: no {k}. Every photograph says what it shows, who took it, and how it is known to be "
                   "a photograph and not a picture made by AI.")
    m = CHILD.search(ph.get("shows", ""))
    if m:
        refuse(f"{w}: its words say {m.group(0)!r}. No photograph of a child goes on this street.")
    lic = f'<a href="{esc(lu)}">{esc(ph["licence"])}</a>' if lu else esc(ph.get("licence", ""))
    return (f'<figure class="ppd-photo"><img class="ppd-photo__img" src="{esc(ph["file"])}" '
            f'{imgsize.attrs(f)} alt="{html.escape(ph.get("shows", ""))}" loading="lazy" decoding="async">'
            f'<figcaption class="ppd-photo__credit">Photograph by {esc(ph.get("photo_by", ""))}, {lic}, '
            f'<a href="{esc(ph.get("commons", ""))}">via Wikimedia Commons</a>; resized.</figcaption></figure>')


def ours(text, w):
    for rx, why in ((OUTCOME, "Play is for its own sake here, and nothing in the pod treats anybody."),
                    (BEADS, "Water beads are left out on purpose, and only the care line says so.")):
        m = rx.search(text)
        if m:
            refuse(f"{w}: says {m.group(0)!r}. {why}")


d = json.loads(DATA.read_text(encoding="utf-8"))
page = PAGE.read_text(encoding="utf-8")
blocks = {}
used = []
for part in d.get("parts", []):
    pid = part.get("id", "")
    if f'<h2 id="{pid}">' not in page:
        refuse(f"{pid}: play-pod.html has no heading with that id for its ideas to sit under.")
    ours(part.get("intro", ""), f"{pid} intro")
    items = []
    for i, idea in enumerate(part.get("ideas", [])):
        w = f"{pid} idea {i + 1}"
        says, by = idea.get("says", ""), idea.get("from", "")
        if not says or not by:
            refuse(f"{w}: an idea needs its words and who shared it.")
            continue
        ours(says, w)
        who = "mine" if by == "Helen" else f"from {esc(by)}"
        items.append(f'<li>{esc(says)} <span class="ppd-from">({who})</span></li>')
    if not items:
        refuse(f"{pid}: a part with no ideas.")
    shots = []
    for i, ph in enumerate(part.get("photos", [])):
        w = f"{pid} photo {i + 1}"
        if "polaroid" in ph:
            shots.append(helens(ph, w))
        else:
            shots.append(commons(ph, w))
            used.append(ph.get("file"))
    care = part.get("care", [])
    if pid == "messy-play" and not any(BEADS.search(c) for c in care):
        refuse("messy-play: its care line no longer says why water beads are left out.")
    if pid == "edible-messy-play" and not any(re.search(r"\ballerg", c) and re.search(r"\bswallow", c) for c in care):
        refuse("edible-messy-play: its care line must say edible means safe for whoever plays, allergies and "
               "swallowing included.")
    out = ""
    if shots:
        out += '\n    <div class="ppd-photos">' + "".join(shots) + '</div>'
    out += f'\n    <p class="ppd-intro">{esc(part.get("intro", ""))}</p>' if part.get("intro") else ""
    out += '\n    <ul class="ppd-ideas">\n      ' + "\n      ".join(items) + '\n    </ul>'
    if care:
        out += '\n    <ul class="ppd-care" aria-label="Take care">\n      ' + \
               "\n      ".join(f"<li>{esc(c)}</li>" for c in care) + '\n    </ul>'
    blocks[pid] = out + '\n    '

if len(used) != len(set(used)):
    refuse("a photograph is on the page twice.")
for f in sorted((ROOT / "play-pod").glob("*")):
    if f"play-pod/{f.name}" not in used:
        refuse(f"play-pod/{f.name} is in the folder and on no part of the page; take it out, or give it a record.")

people = d.get("people", {})
rows = []
for who in people.get("who", []):
    for k in ("name", "of", "url", "says"):
        if not who.get(k):
            refuse(f"people: {who.get('name')!r} has no {k}. Helen works with them and they are credited in full.")
    if not str(who.get("url", "")).startswith("https://"):
        refuse(f"people: {who.get('name')!r}'s address is not their own https page.")
    ours(who.get("says", ""), f"people: {who.get('name')}")
    rows.append(f'<li class="ppd-person"><h3 class="ppd-person__name"><a href="{esc(who["url"])}">'
                f'{esc(who["name"])}</a></h3><p class="ppd-person__of">{esc(who["of"])}</p>'
                f'<p class="ppd-person__says">{esc(who["says"])}</p></li>')
if not rows:
    refuse("people: nobody is credited. Helen asked for the people she works with to be.")
blocks["people"] = (f'\n    <p class="ppd-intro">{esc(people.get("intro", ""))}</p>\n    <ul class="ppd-people">\n      '
                    + "\n      ".join(rows) + '\n    </ul>\n    ')

films = d.get("films", {})
fp = Problems()
check_picks(films.get("shelf"), "films.shelf", fp)
for msg in fp:
    refuse(msg)
if not fp:
    blocks["films"] = "\n" + "\n".join([
        screen_block("ppd", SCREEN, SCREEN_NAME, "Nothing is on the screen. Put a film up from the shelf."),
        picks_block(films["shelf"], "ppd", SCREEN, SCREEN_NAME, "On the shelf", "Films for the Play Pod"),
        '    <p class="ppd-credit">' + picks_credit(films["shelf"], "Chosen for Helen Edgar",
                                                    date.fromisoformat(films["checked"]).strftime("%-d %B %Y")) + ".</p>",
    ]) + "\n    "

blocks["credit"] = (
    f'\n    <p class="ppd-credit">The Play Pod is Helen Edgar&rsquo;s, written in her voice for her, '
    f'{date.fromisoformat(d["_checked"]).strftime("%-d %B %Y")}. Every idea names who shared it, and the '
    f'ideas are theirs: this room passes them on and copies none of their words. Helen&rsquo;s photographs '
    f'are hers and are not under this site&rsquo;s licence; the rest are their photographers&rsquo;, each '
    f'credited under it, and every one is a real photograph, none of a child. The drawing of the pod is ours, '
    f'and the film is its maker&rsquo;s, on her own channel.</p>\n    ')

text = html.unescape(re.sub(r"<[^>]+>", " ", re.sub(r"<script.*?</script>|<!--.*?-->|<svg.*?</svg>", " ",
                                                    page, flags=re.S)))
text = re.sub(r"\s+", " ", text)
for c in d.get("parts", []):
    for line in c.get("care", []):
        text = text.replace(line, " ")
ours(text, "play-pod.html")
for s in ("love-embed.js", "rack.js", "play-pod.js"):
    if f'<script src="{s}" defer></script>' not in page:
        refuse(f"play-pod.html does not load {s}.")
if 'class="dial"' not in page or page.count('class="dial__btn"') != 3:
    refuse("play-pod.html has no glitter dial. Every room has one.")
if "data-ppd-lamp" not in page:
    refuse("play-pod.html has no lamp switch. The lamp is the room.")

js = SCRIPT.read_text(encoding="utf-8")
code = re.sub(r"/\*.*?\*/", " ", js, flags=re.S)
code = re.sub(r"(?m)//.*$", " ", code)
if re.search(r"localStorage|sessionStorage|indexedDB|fetch\(|XMLHttpRequest|sendBeacon|WebSocket|"
             r"EventSource|innerHTML|outerHTML|insertAdjacentHTML|document\.cookie|setInterval", code):
    refuse("play-pod.js keeps or sends something, writes markup from a string, or runs on a timer. "
           "It switches the lamp on a press and does nothing else.")

css = CSS.read_text(encoding="utf-8")
sec = re.search(r"/\* §131 ── SUBROOM: Play Pod.*?(?=/\* §132 )", css, re.S)
if not sec:
    refuse("love.css has no §131 for the Play Pod before §132.")
else:
    body = re.sub(r"/\*.*?\*/", "", sec.group(0), flags=re.S)
    for rule in re.finditer(r"([^{}]+)\{([^{}]*)\}", body):
        sel, decl = rule.group(1).strip(), rule.group(2)
        if re.search(r"\banimation\s*:", decl):
            if 'html[data-intensity="max"]' not in sel:
                refuse(f"§131: an animation outside MAX GLITTER ({sel}).")
            t = re.search(r"animation:\s*[\w-]+\s+([\d.]+)s", decl)
            if t and float(t.group(1)) < 4:
                refuse(f"§131: {sel} moves in {t.group(1)}s. Nothing in the pod moves faster than once in four seconds.")

if problems:
    raise SystemExit("REFUSING:\n  " + "\n  ".join(problems))

for part, block in blocks.items():
    b, e = f"<!-- play-pod:{part}:begin -->", f"<!-- play-pod:{part}:end -->"
    if page.count(b) != 1 or page.count(e) != 1:
        raise SystemExit(f"REFUSING: play-pod.html must hold one {b} and one {e}.")
    page = page[:page.index(b) + len(b)] + block + page[page.index(e):]
if page != PAGE.read_text(encoding="utf-8"):
    PAGE.write_text(page, encoding="utf-8")
print("make-play-pod: the pod's ideas written, every one credited; every photograph real and none of a child.")
