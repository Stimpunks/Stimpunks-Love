#!/usr/bin/env python3
"""Build the Faery Yurt's art gallery and its Art shelf from data/yurt-gallery.json.

HELEN ASKED FOR THIS, 2026-10-15: an art section with any open art, and a
book spine with a Wikipedia page for any artist whose work is not open; then
a gallery you click into, inside a golden frame. The room is hers, so the ask
is the licence; this tool adds the street's plumbing round it.

ONE DATA FILE, ONE TOOL, THREE SURFACES: the wall in faery-yurt.html, the Art
shelf in her bookcases, and the credits in liner-notes.html. The pictures hang
small on the wall; each one is a link to the scan itself, which is what it
opens with scripts off, and yurt-art.js turns that press into the painting's
own <dialog> inside a gilt frame, with Escape and a click on the dark to close.
The frames are drawn in CSS from colours her room already had (the candle, the
ember, the amber spine and the browns of her portrait frame); NO NEW COLOUR
ARRIVES IN HER ROOM THROUGH A FRAME, and no word of ours stands on the gold.

EVERY PAINTING IS OUT OF COPYRIGHT EVERYWHERE, NOT IN ONE COUNTRY. The bar is
the Doomscroll's: the painter dead more than seventy years, counted against
the current year rather than a date in the file. And every scan is one whose
own page on Wikimedia Commons carries an explicit public domain template
(PD-Art and what it wraps), the Rabbit Hole's rule, because a scan nobody has
read the rights of is the Mopery's facsimile. The painter, the title and the
year came off the same record and not from memory; the data file says how.

WHAT IT REFUSES:

  - A PAINTER DEAD SEVENTY YEARS OR LESS. A painting that is free in America
    and not in Europe cannot hang on a site that serves everybody.
  - A SCAN WITH NO COMMONS FILE PAGE, or a `template` that is not PD-Art with
    what it wraps, which is where the rights statement this room relies on lives.
  - A FILE NOT ON DISK, A FILE THAT IS NOT A JPEG, OR ONE STILL CARRYING EXIF.
    make-polaroids.py's rule for a photograph, kept for a scan: a museum's scan
    carries no address, but the habit is one habit.
  - A PICTURE WITH NO `shows` SENTENCE. The wall is pictures, and a picture
    with no words is a wall a screen reader walks past. The sentence is the
    alt text, in both places the picture appears.
  - AN ARTIST ON THE SHELF WITH NO WIKIPEDIA ADDRESS, or one on both the shelf
    and the wall who is not out of copyright.
  - AN HTML ENTITY IN ANY FIELD. Write the character; data/toys.json's lesson.

WHAT IT DOES NOT CHECK, on purpose: that the Commons page still says what it
said. That needs the network, and the day it was read is printed in the credits.
"""
import datetime
import html
import json
import re
import struct
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data/yurt-gallery.json"
ROOM = ROOT / "faery-yurt.html"
NOTES = ROOT / "liner-notes.html"

ENTITY = re.compile(r"&(?:[a-zA-Z][a-zA-Z0-9]{1,31}|#\d{1,6}|#x[0-9a-fA-F]{1,6});")
DATE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
SLUG = re.compile(r"^[a-z0-9-]+$")
COMMONS = "https://commons.wikimedia.org/wiki/File:"
WIKIPEDIA = "https://en.wikipedia.org/wiki/"
YEAR = datetime.date.today().year
BAR = 70

d = json.loads(DATA.read_text())
paintings = d.get("paintings") or []
artists = (d.get("shelf") or {}).get("artists") or []
problems = []


def no_entity(v, where):
    if isinstance(v, str) and ENTITY.search(v):
        problems.append(f"{where}: an HTML entity ({ENTITY.search(v).group(0)}). Write the character.")
    elif isinstance(v, dict):
        for k, x in v.items():
            no_entity(x, f"{where}.{k}")
    elif isinstance(v, list):
        for i, x in enumerate(v):
            no_entity(x, f"{where}[{i}]")


def jpeg_size_and_exif(path):
    """(width, height, carries_exif) read off the JPEG's own segments."""
    raw = path.read_bytes()
    if raw[:2] != b"\xff\xd8":
        return None
    i, w, h, exif = 2, None, None, False
    while i + 4 <= len(raw) and raw[i] == 0xFF:
        marker = raw[i + 1]
        if marker in (0xD8, 0x01) or 0xD0 <= marker <= 0xD7:
            i += 2
            continue
        length = struct.unpack(">H", raw[i + 2:i + 4])[0]
        if marker == 0xE1 and raw[i + 4:i + 10].startswith(b"Exif"):
            exif = True
        if marker in (0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7, 0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF):
            h, w = struct.unpack(">HH", raw[i + 5:i + 9])
        if marker == 0xDA:
            break
        i += 2 + length
    return (w, h, exif) if w else None


no_entity(d, "data")
if not DATE.match(str(d.get("_read", ""))):
    problems.append("_read: the day the Commons records were read, as YYYY-MM-DD. The credits print it.")
if not paintings:
    problems.append("paintings: none. A gallery with nothing on the wall is a heading over nothing.")

sizes = {}
seen = set()
for i, p in enumerate(paintings):
    where = f"paintings[{i}] ({p.get('painter', '?')}, {p.get('title', '?')})"
    for k in ("slug", "file", "painter", "title", "year", "commons", "template", "shows"):
        if not p.get(k):
            problems.append(f"{where}: no {k}.")
    if not SLUG.match(str(p.get("slug", ""))):
        problems.append(f"{where}: slug is not lowercase letters, digits and hyphens.")
    if p.get("slug") in seen:
        problems.append(f"{where}: slug {p['slug']} is used twice.")
    seen.add(p.get("slug"))
    died = p.get("died")
    if not isinstance(died, int):
        problems.append(f"{where}: `died` is not a year. The bar is the painter dead more than {BAR} years.")
    elif YEAR - died <= BAR:
        problems.append(f"{where}: died {died}, which is {YEAR - died} years ago. Out of copyright everywhere "
                        f"means more than {BAR} years, and a painting free in one country cannot hang on a "
                        "site that serves everybody.")
    if not str(p.get("commons", "")).startswith(COMMONS):
        problems.append(f"{where}: `commons` is not a Commons file page, which is where the rights "
                        "statement this room relies on lives.")
    if not str(p.get("template", "")).startswith("PD-Art|PD-"):
        problems.append(f"{where}: `template` is not PD-Art with the public domain template it wraps, "
                        "as the file's own page carries it. A scan with no explicit statement is linked, "
                        "never shown.")
    if len(str(p.get("shows", "")).split()) < 8:
        problems.append(f"{where}: `shows` is not a sentence. It is the alt text, written from looking.")
    f = p.get("file", "")
    if not f.startswith("gallery/") or not (ROOT / f).is_file():
        problems.append(f"{where}: {f or '(no file)'} is not on disk under gallery/.")
    else:
        got = jpeg_size_and_exif(ROOT / f)
        if not got:
            problems.append(f"{where}: {f} is not a JPEG.")
        elif got[2]:
            problems.append(f"{where}: {f} still carries EXIF. Re-save it without; nothing here keeps "
                            "metadata it has not read.")
        else:
            sizes[p["slug"]] = got[:2]

named = {p.get("painter") for p in paintings}
for i, a in enumerate(artists):
    where = f"shelf.artists[{i}] ({a.get('name', '?')})"
    if not a.get("name"):
        problems.append(f"{where}: no name.")
    if not str(a.get("wikipedia", "")).startswith(WIKIPEDIA):
        problems.append(f"{where}: `wikipedia` is not an English Wikipedia address. The spine is the door.")
if not artists:
    problems.append("shelf.artists: none, and the room says the Art shelf is there.")

if problems:
    raise SystemExit("REFUSING, data/yurt-gallery.json:\n  " + "\n  ".join(problems))


def esc(s):
    return html.escape(s, quote=False)


def attr(s):
    return html.escape(s, quote=True)


def swap(path, marker, block, indent=""):
    src = path.read_text()
    pat = re.compile(rf"(<!-- {re.escape(marker)}:begin -->).*?(\n[ \t]*<!-- {re.escape(marker)}:end -->)", re.S)
    if not pat.search(src):
        raise SystemExit(f"REFUSING: no <!-- {marker}:begin --> / :end pair in {path.name}.")
    path.write_text(pat.sub(lambda m: m.group(1) + "\n" + indent + block + m.group(2), src, count=1))


# ── The wall ──────────────────────────────────────────────────────────────────
hangs = []
for p in paintings:
    w, h = sizes[p["slug"]]
    hid = f"yurt-art-{p['slug']}"
    holder = f" {esc(p['holder'])}." if p.get("holder") else ""
    hangs.append(
        f'      <li class="yurt-art__hang">\n'
        f'        <a class="yurt-art__open" href="{attr(p["file"])}" data-art-open>\n'
        f'          <span class="yurt-art__gilt"><img src="{attr(p["file"])}" width="{w}" height="{h}" '
        f'alt="{attr(p["shows"])}" loading="lazy" decoding="async"></span>\n'
        f'          <span class="yurt-art__label"><i>{esc(p["title"])}</i> &middot; {esc(p["painter"])}, '
        f'{esc(p["year"])}</span>\n'
        f'        </a>\n'
        f'        <dialog class="yurt-art__frame" aria-labelledby="{hid}">\n'
        f'          <div class="yurt-art__board"><img src="{attr(p["file"])}" width="{w}" height="{h}" '
        f'alt="{attr(p["shows"])}" loading="lazy" decoding="async"></div>\n'
        f'          <div class="yurt-art__plate">\n'
        f'            <h3 class="yurt-art__title" id="{hid}">{esc(p["title"])}</h3>\n'
        f'            <p class="yurt-art__who">{esc(p["painter"])}, {esc(p["year"])}.{holder}</p>\n'
        f'            <p class="yurt-art__where">Public domain &middot; <a href="{attr(p["commons"])}">the scan, '
        f'on Wikimedia Commons</a></p>\n'
        f'            <button type="button" class="yurt-back" data-art-close>Hang it back on the wall</button>\n'
        f'          </div>\n'
        f'        </dialog>\n'
        f'      </li>')
swap(ROOM, "yurt-gallery:wall",
     '<ul class="yurt-art__wall">\n' + "\n".join(hangs) + '\n    </ul>', "    ")

# ── The Art shelf ─────────────────────────────────────────────────────────────
spines = []
for i, a in enumerate(sorted(artists, key=lambda a: a["name"].split()[-1].lower())):
    spines.append(f'          <li class="spine c{i % 6 + 1}"><a class="spine__link" href="{attr(a["wikipedia"])}">'
                  f'{esc(a["name"])}</a></li>')
swap(ROOM, "yurt-gallery:shelf", "\n".join(spines).lstrip(), "          ")

# ── The credits ───────────────────────────────────────────────────────────────
rows = []
for p in paintings:
    rows.append(f'      <tr><td><strong>{esc(p["painter"])}</strong> (died {p["died"]})</td>'
                f'<td><i>{esc(p["title"])}</i>, {esc(p["year"])}</td>'
                f'<td>{esc(p["holder"]) if p.get("holder") else "not stated on the scan&rsquo;s record"}</td>'
                f'<td>{esc(p["template"])}</td>'
                f'<td><a href="{attr(p["commons"])}">the scan</a></td></tr>')
swap(NOTES, "yurt-gallery-credits", "\n".join(rows).lstrip(), "      ")
swap(NOTES, "yurt-gallery-read", f'Every record was read on {esc(d["_read"])}.', "")

print(f"faery yurt: {len(paintings)} paintings on the wall, {len(artists)} artists on the Art shelf, "
      f"in {ROOM.name}; {len(rows)} credit rows in {NOTES.name}")
