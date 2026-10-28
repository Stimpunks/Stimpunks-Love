#!/usr/bin/env python3
"""The Stim Tin: writes it into the Regulation Nook of the Faery Yurt, and holds its promises.

Helen Edgar's ask, 2026-10-28: "a fidget and stim something" for her
Regulation Nook, with photographs of stim toys and a film, and she named it the
Stim Tin. Its data is data/yurt-stim.json; this writes it into faery-yurt.html
between yurt-stim markers, in her room's own colours (love.css §14).

THE PHOTOGRAPHS ARE REAL ONES, AND OF TOYS. Each is on Wikimedia Commons under a
licence this site can use, credited under it, saved without camera data, and
says in `real` how it is known to be a photograph (Helen: "no ai pics just
real"). A photograph whose words name a child is refused.

A TOY SAYS HOW IT FEELS, AND NEVER WHAT IT IS FOR. Fidget toys are sold on what
they do for a brain (focus, calm, anxiety); the line under each toy here says
only what it is like in the hand, and the tool refuses a cure, a treatment or
an outcome in our words. The friendly edit is "great for focus".

THE FILM IS ITS MAKER'S, on her own channel, a press-to-play button that says
how long it runs; check-jukebox.py asks after it.
"""
import html
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import imgsize  # noqa: E402
from natures import Problems, check_picks, clock, spoken, date_words  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
PAGE = ROOT / "faery-yurt.html"
DATA = ROOT / "data" / "yurt-stim.json"
FREE = {"Public domain", "CC0", "CC BY 2.0", "CC BY 3.0", "CC BY 4.0",
        "CC BY-SA 2.0", "CC BY-SA 2.5", "CC BY-SA 3.0", "CC BY-SA 4.0"}
CHILD = re.compile(r"\b(child\w*|kids?|toddlers?|bab(?:y|ies)|boys?|girls?|infants?|pupils?)\b", re.I)
OUTCOME = re.compile(r"\b(focus\w*|calm\w*|anxi\w*|stress relief|relieves?|therap\w*|treat\w*|cures?|heal\w*|"
                     r"develop\w*|skills?|improves?|beneficial|helps? (?:you|with))\b", re.I)

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
        if m == 0xE1:
            return True
        if m == 0xDA:
            break
        i += 2 + n
    return False


d = json.loads(DATA.read_text(encoding="utf-8"))
for w, text in [("intro", d.get("intro", ""))] + [(t.get("name", "?"), t.get("feel", "")) for t in d.get("toys", [])]:
    m = OUTCOME.search(text)
    if m:
        refuse(f"{w}: says {m.group(0)!r}. A toy here says how it feels, never what it does for anybody.")

cards, used = [], []
for i, t in enumerate(d.get("toys", [])):
    w = f"toy {i + 1}"
    f = ROOT / t.get("file", "")
    if not f.is_file():
        refuse(f"{w}: no photograph at {t.get('file')}.")
        continue
    used.append(t["file"])
    ex = jpeg_exif(f)
    if ex is None:
        refuse(f"{w}: {t['file']} is not a JPEG.")
    elif ex:
        refuse(f"{w}: {t['file']} still carries camera data. Save it again without.")
    if t.get("licence") not in FREE:
        refuse(f"{w}: licence {t.get('licence')!r} is not one this site can use (no NC, no ND).")
    if not str(t.get("licence_url", "")).startswith("https://creativecommons.org/"):
        refuse(f"{w}: no link to its licence.")
    if not str(t.get("commons", "")).startswith("https://commons.wikimedia.org/wiki/File:"):
        refuse(f"{w}: no Commons file page, where its licence lives.")
    for k in ("name", "feel", "shows", "photo_by", "real"):
        if not t.get(k):
            refuse(f"{w}: no {k}. Every photograph says what it shows, who took it, and how it is known to be real.")
    m = CHILD.search(t.get("shows", ""))
    if m:
        refuse(f"{w}: its words say {m.group(0)!r}. No photograph of a child goes on this street.")
    cards.append(
        f'<li class="yurt-stim__toy"><figure class="yurt-stim__photo"><img class="yurt-stim__img" src="{esc(t["file"])}" '
        f'{imgsize.attrs(f)} alt="{html.escape(t.get("shows", ""))}" loading="lazy" decoding="async">'
        f'<figcaption class="yurt-stim__credit">Photograph by {esc(t.get("photo_by", ""))}, '
        f'<a href="{esc(t.get("licence_url", ""))}">{esc(t.get("licence", ""))}</a>, '
        f'<a href="{esc(t.get("commons", ""))}">via Wikimedia Commons</a>; resized.</figcaption></figure>'
        f'<h4 class="yurt-stim__name">{esc(t.get("name", ""))}</h4>'
        f'<p class="yurt-stim__feel">{esc(t.get("feel", ""))}</p></li>')
if len(used) != len(set(used)):
    refuse("a photograph is in the tin twice.")
for f in sorted((ROOT / "stim-tin").glob("*")):
    if f"stim-tin/{f.name}" not in used:
        refuse(f"stim-tin/{f.name} is in the folder and in no card; take it out, or give it a record.")

fp = Problems()
check_picks(d.get("videos"), "videos", fp)
for msg in fp:
    refuse(msg)
films = []
for v in d.get("videos", []):
    if fp:
        break
    full = html.escape(f'{v["channel"]} — {v["title"]}', quote=True)
    films.append(
        f'<div class="yurt-stim__film"><p class="yurt-stim__filmby"><b>{esc(v["title"])}</b>, '
        f'<a href="https://www.youtube.com/channel/{v["channel_id"]}">{esc(v["channel"])}</a> &middot; '
        f'{date_words(v["published"])} &middot; {clock(v["runs"])}. {esc(v["about"])}</p>'
        f'<button type="button" class="facade" data-embed-id="{v["id"]}" data-embed-title="{full}">'
        f'Watch it here &mdash; {esc(spoken(v["runs"]))} <span class="facade__play">&#9654; PRESS PLAY</span></button></div>')

page = PAGE.read_text(encoding="utf-8")
if '<script src="love-embed.js" defer></script>' not in page:
    refuse("faery-yurt.html does not load love-embed.js, so the film's button would press and do nothing.")
if problems:
    raise SystemExit("REFUSING:\n  " + "\n  ".join(problems))

block = "\n".join([
    '    <div class="yurt-stim" role="group" aria-labelledby="stim-tin">',
    '      <h3 id="stim-tin">The Stim Tin</h3>',
    f'      <p class="section-intro">{esc(d.get("intro", ""))}</p>',
    '      <ul class="yurt-stim__toys">',
    "        " + "\n        ".join(cards),
    '      </ul>',
    "      " + "\n      ".join(films),
    '      <p class="yurt-gallery__note">The photographs are their photographers&rsquo;, each credited under it, and the '
    'film is its maker&rsquo;s, on her own channel; nothing of hers is hosted here and nothing reaches YouTube until you press.</p>',
    '    </div>'])
b, e = "<!-- yurt-stim:begin -->", "<!-- yurt-stim:end -->"
if page.count(b) != 1 or page.count(e) != 1:
    raise SystemExit(f"REFUSING: faery-yurt.html must hold one {b} and one {e}.")
page = page[:page.index(b) + len(b)] + "\n" + block + "\n    " + page[page.index(e):]
if page != PAGE.read_text(encoding="utf-8"):
    PAGE.write_text(page, encoding="utf-8")
print("make-yurt-stim: the Stim Tin written, every photograph real and credited, and no toy sold on what it does.")
