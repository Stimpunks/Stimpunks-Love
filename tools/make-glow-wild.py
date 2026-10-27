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
  - glow-wild.js keeping or sending anything, or its lights coming up or going
    faster than the floors below, which is what keeps it under the flash line.
  - a §129 animation outside MAX GLITTER, or one quicker than four seconds.
"""
import html
import json
import re
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGE = ROOT / "glow-wild-hollow.html"
DATA = ROOT / "data" / "glow-wild.json"
SCRIPT = ROOT / "glow-wild.js"
CSS = ROOT / "love.css"

LATIN = re.compile(r"\b(Armillaria|Noctiluca|Lampyris|Aequorea|Mycena|Panellus|Omphalotus|"
                   r"Mnemiopsis|Beroe|Pleurobrachia)\b")
NOT_HERE = re.compile(r"\b(edible|forag\w*|cures?|cured|healing|remed\w*|medicin\w*|therap\w*|"
                      r"good for you|you (?:can|could|may) eat)\b", re.I)
FLOORS = {"RISE": 400, "FADE": 1500}

problems = []


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
    blocks[pid] = '\n    <ul class="hollow-facts">\n      ' + "\n      ".join(items) + '\n    </ul>\n    '

wiki = ", ".join(f'<a href="{esc(a["url"])}">{esc(a["name"])}</a>' for a in also[:-1])
if len(also) > 1:
    wiki += f' and <a href="{esc(also[-1]["url"])}">{esc(also[-1]["name"])}</a>'
blocks["credit"] = (
    f'\n    <p class="hollow-credit">Most of what is here was first read in '
    f'<a href="{esc(kew["url"])}">&ldquo;{esc(kew["title"])}&rdquo;</a>, by {esc(kew["by"])}, for '
    f'{esc(kew["site"])}, {esc(kew["on"])}, and the rest in Wikipedia&rsquo;s articles on {wiki}, '
    f'on {date.fromisoformat(d["_checked"]).strftime("%-d %B %Y")}. Every sentence here is ours, written for this room, and every fact '
    f'says where it was read. The drawings are ours too, and every light in them belongs to '
    f'something alive.</p>\n    ')

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

js = SCRIPT.read_text(encoding="utf-8")
code = re.sub(r"/\*.*?\*/", " ", js, flags=re.S)
code = re.sub(r"(?m)//.*$", " ", code)
if re.search(r"localStorage|sessionStorage|indexedDB|fetch\(|XMLHttpRequest|sendBeacon|WebSocket|"
             r"EventSource|innerHTML|outerHTML|insertAdjacentHTML|document\.cookie", code):
    refuse("glow-wild.js keeps or sends something, or writes markup from a string. It keeps and sends nothing.")
for name, floor in FLOORS.items():
    m = re.search(rf"var {name} = (\d+);", code)
    if not m or int(m.group(1)) < floor:
        refuse(f"glow-wild.js: {name} must be at least {floor} ms. A light that comes or goes faster is a flash.")
m = re.search(r"var MAX_SPARKS = (\d+);", code)
if not m or int(m.group(1)) > 80:
    refuse("glow-wild.js: MAX_SPARKS must be set, and no more than 80.")
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
