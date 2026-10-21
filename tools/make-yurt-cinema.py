#!/usr/bin/env python3
"""Build the Cinema's reel rack, behind Helen Edgar's Faery Yurt.

HELEN ASKED FOR THIS ROOM, at the keyboard on 2026-10-21: a cinema behind her
yurt, "similar idea to my library and music room", reached through an old-style
cinema door with a film strip on it, and every film she drops in "on an old
fashioned film reel for each one in rows instead of a bookcase". The room is
hers, so the ask is the licence; what this tool adds is the street's plumbing
round it.

ONE DATA FILE, ONE TOOL, TWO SURFACES. data/yurt-cinema.json holds the films;
this writes the screen and the rows of reels into faery-cinema-room.html
between the yurt-cinema:reels markers, and the Cinema's book into the yurt
between the yurt-cinema:book markers (Helen, 2026-10-21: "a book for the
cinema room in same style" as the songbooks): Nature Notes' binding, a shelf to
a run of pages, every reel a line linking to that reel in the Cinema. Nothing
in the book plays. Edit the data, never the markers.

THE RACK IS rack.js's PATTERN AND THE SCREEN HAS NOTHING OF ITS OWN ON IT. A
cinema has no film that is "the whole programme" the way the Music Room's
phonograph has a playlist, so the screen is The Doom Scoop's kind: it ships
hidden with tabindex="-1", rack.js unhides it, and taking a film off puts the
keyboard back on it. Every reel can go up on the screen (THE REEL IS THE
PRESS: it is the card's data-rack-to button) or play where it hangs (the small
"play it here instead" line under it, the card's own facade, kept because the
CB's watch-together finds a film by that button). rack.js finds the parts by
attribute; every class here is the room's own (cin-).

WITH NO FILMS YET THERE IS NO SCREEN. A screen rack.js would unhide with
nothing to put on it is a panel promising a button that never comes, so an
empty list writes a sentence saying the reels are on their way and nothing
else. The first film writes the screen.

WHAT IT REFUSES:

  - A FILM WITH NO RUNTIME. Every press-to-play control on this street says how
    long before the press, and a reel is one.
  - AN ID THAT IS NOT A YOUTUBE ID, because love-embed.js returns quietly on one
    and the reel would never become a film.
  - A FILM ON THE RAIL TWICE.
  - A DOOR NOBODY MEASURED. A film whose channel has embedding off is a link to
    its watch page, dashed, and says so on its face; it carries `door` (what was
    measured and when) and state: link, which check-jukebox.py reads.
  - AN HTML ENTITY IN THE DATA. Everything is escaped on the way into the page,
    so an entity there arrives as five literal characters (the spoon drawer's
    lesson).
  - ANYTHING IN THE ROOM'S SECTION OF love.css THAT MAKES THE LIGHT MOVE. A
    projector flickers; this one does not, at any setting, for Club Chronic's
    reason. The two reels on the projector in the drawing turn at MAX GLITTER and
    nowhere else, as the record does in the Music Room, and the room's dial line
    says so; the tool refuses a rule that turns them under any other selector,
    and any keyframe that animates opacity, a colour or a filter.
"""
import html
import json
import math
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "yurt-cinema.json"
PAGE = ROOT / "faery-cinema-room.html"
CSS = ROOT / "love.css"

ID = re.compile(r"^[A-Za-z0-9_-]{11}$")
LIST = re.compile(r"^(?:PL[A-Za-z0-9_-]{16,32}|UU[A-Za-z0-9_-]{22})$")
RUNTIME = re.compile(r"^(?:\d+:)?[0-5]?\d:[0-5]\d$")
DATE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
ENTITY = re.compile(r"&(?:[a-zA-Z][a-zA-Z0-9]{1,31}|#\d{1,6}|#x[0-9a-fA-F]{1,6});")

SCREEN = "the screen"
RACK = "cinema"

d = json.loads(DATA.read_text())
shelves = d.get("shelves")
problems = []


def no_entity(v, where):
    if isinstance(v, str) and ENTITY.search(v):
        problems.append(f"{where}: an HTML entity ({ENTITY.search(v).group(0)}). Write the "
                        "character; everything is escaped on the way into the page.")
    elif isinstance(v, dict):
        for k, x in v.items():
            no_entity(x, f"{where}.{k}")
    elif isinstance(v, list):
        for i, x in enumerate(v):
            no_entity(x, f"{where}[{i}]")


no_entity(d, "data")
if not DATE.match(str(d.get("_checked", ""))):
    problems.append("_checked: the day the films were read, as YYYY-MM-DD. The room prints it.")
# SHELVES, EACH UNDER ITS OWN HEADING (Helen, 2026-10-21: "add headings"):
# Philosophy, Nature, Cosmos, Weird stuff, Poetry, in her order. A shelf may be
# empty while she chooses, and then says so rather than standing as a heading
# over nothing; a shelf may carry a note in her words under its heading.
if not isinstance(shelves, list) or not shelves:
    problems.append("shelves: a list of shelves, each with a title and its reels.")
    shelves = []
titles = [sh.get("title") for sh in shelves]
if len(set(titles)) != len(titles) or not all(titles):
    problems.append("shelves: every shelf needs a title, and no two the same.")
films = []
for sh in shelves:
    if not isinstance(sh.get("reels"), list):
        problems.append(f"shelves ({sh.get('title')}): reels must be a list, empty until its first film arrives.")
        sh["reels"] = []
    films += sh["reels"]

seen = set()
for i, t in enumerate(films):
    where = f"reels[{i}] ({t.get('title', '?')})"
    if "list" in t:
        # A WHOLE CHANNEL OR PLAYLIST ON ONE REEL (Helen, 2026-10-21: "main
        # channels not just the link to a specific video so can scroll"). It
        # plays the list from the top, and YouTube's own player lets you scroll
        # through it. It carries NO runtime: a channel keeps adding to itself,
        # and a total would be wrong the day it did (make-club.py's pair).
        if not LIST.match(str(t["list"])):
            problems.append(f"{where}: not a playlist id (PL...) or a channel's uploads (UU + the channel id after UC).")
        elif t["list"] in seen:
            problems.append(f"{where}: {t['list']} is on the rail twice.")
        seen.add(t["list"])
        if "runtime" in t:
            problems.append(f"{where}: a channel or playlist carries a runtime. It keeps growing, and a total "
                            "would be wrong the day it did.")
        if t.get("kind") not in ("channel", "playlist"):
            problems.append(f"{where}: kind must be channel or playlist.")
        if t.get("kind") == "channel" and not str(t["list"]).startswith("UU"):
            problems.append(f"{where}: a channel plays its uploads, a list starting UU.")
        if t.get("kind") == "playlist":
            # Queercore's lesson: a playlist can be healthy and still fail to
            # embed because of what sits at the top of it, so the first film is
            # written down when the list is read, and checked by pressing play.
            if not ID.match(str(t.get("opens", ""))):
                problems.append(f"{where}: a playlist says the id of the film it opens on (`opens`).")
        if not str(t.get("address", "")).startswith("https://www.youtube.com/"):
            problems.append(f"{where}: no `address`, the channel's or playlist's own page, which the credit links.")
        for k in ("title", "channel"):
            if not t.get(k):
                problems.append(f"{where}: no {k}.")
        if t.get("door") and not t.get("says"):
            problems.append(f"{where}: a list that is a door says on its face why (`says`), beside "
                            "`door`, what was measured and when.")
        continue
    if not ID.match(str(t.get("id", ""))):
        problems.append(f"{where}: not a YouTube id. love-embed.js returns quietly on one, and the "
                        "reel would never become a film.")
    elif t["id"] in seen:
        problems.append(f"{where}: {t['id']} is on the rail twice.")
    seen.add(t.get("id"))
    if t.get("live"):
        # A LIVE CAMERA HAS NO RUNTIME, and the Jungle Room refuses one: a
        # stream's length today is wrong tomorrow. Its reel says it runs until
        # you close it, and that the picture may be dark or between streams.
        if "runtime" in t:
            problems.append(f"{where}: a live camera carries a runtime. It has none to give.")
    elif not RUNTIME.match(str(t.get("runtime", ""))):
        problems.append(f"{where}: no runtime. Every press-to-play control on this street says how "
                        "long before the press.")
    if t.get("live") and t.get("door"):
        problems.append(f"{where}: a live camera that cannot be framed is not handled here yet.")
    for k in ("title", "channel"):
        if not t.get(k):
            problems.append(f"{where}: no {k}.")
    if t.get("door") and t.get("state") != "link":
        problems.append(f"{where}: a door must also say state: link, which is how check-jukebox.py "
                        "knows not to expect the frame.")
    if t.get("state") == "link" and not t.get("door"):
        problems.append(f"{where}: state is link with no `door` saying what was measured and when.")

# THE LIGHT STAYS STILL, AND THE REELS TURN AT MAX ONLY.
css = CSS.read_text()
m = re.search(r"/\* §\d+ ── SUBROOM: The Cinema \(behind the Faery Yurt\).*?(?=/\* §\d+ ── )", css, re.S)
if not m:
    problems.append("love.css: no section headed 'SUBROOM: The Cinema (behind the Faery Yurt)'.")
else:
    sec = m.group(0)
    body = re.sub(r"/\*.*?\*/", "", sec, flags=re.S)
    for rule in re.finditer(r"([^{}]+)\{([^{}]*)\}", body):
        sel, decl = rule.group(1).strip(), rule.group(2)
        if re.search(r"\banimation(-name)?\s*:", decl) and 'html[data-intensity="max"]' not in sel:
            problems.append(f"love.css, the Cinema: {sel!r} animates outside MAX. The reels turn at MAX "
                            "GLITTER and nowhere else, which the room's dial line says.")
        if re.search(r"\btransition\s*:", decl) and re.search(r"opacity|filter|color|background", decl):
            problems.append(f"love.css, the Cinema: {sel!r} transitions a light. Nothing here flickers.")
    for kf in re.finditer(r"@keyframes\s+([\w-]+)\s*\{(.*?)\}\s*\}", body, re.S):
        if re.search(r"opacity|filter|color|background|fill", kf.group(2)):
            problems.append(f"love.css, the Cinema: @keyframes {kf.group(1)} changes a light. A projector "
                            "flickers; this one does not, at any setting.")

page = PAGE.read_text()
if "MAX turns the reels" not in page:
    problems.append("faery-cinema-room.html: the dial's line no longer says MAX turns the reels, and "
                    "this tool lets them turn at MAX on that sentence's word.")

if problems:
    raise SystemExit("REFUSING, the Cinema:\n  " + "\n  ".join(problems))


def esc(s):
    return html.escape(s, quote=False)


def attr(s):
    return html.escape(s, quote=True)


# THE REEL, drawn once as a symbol and used on every rail. A pressed-tin spool
# with six round windows onto the dark film wound inside, a brass hub, and the
# film's tail hanging off it with its sprocket holes. Drawn only in the
# Reading Room's declared colours, carries no word, aria-hidden.
REEL = (
    '    <svg class="cin-defs" aria-hidden="true" focusable="false" width="0" height="0">\n'
    '      <symbol id="cin-reel" viewBox="0 0 120 120">\n'
    '        <path d="M86 92 L112 116 L104 120 L80 98 Z" fill="var(--rdr-stone)"/>\n'
    '        <g fill="var(--rdr-ink-2)" opacity=".7"><rect x="92" y="103" width="3" height="3" transform="rotate(42 93.5 104.5)"/>'
    '<rect x="99" y="109" width="3" height="3" transform="rotate(42 100.5 110.5)"/></g>\n'
    '        <circle cx="60" cy="60" r="54" fill="var(--rdr-ink-2)"/>\n'
    '        <circle cx="60" cy="60" r="54" fill="none" stroke="var(--rdr-brass)" stroke-width="2.5"/>\n'
    '        <circle cx="60" cy="60" r="47" fill="none" stroke="var(--rdr-stone)" stroke-width="1" opacity=".35"/>\n'
    '        <g fill="var(--rdr-stone)">'
    + "".join(
        f'<circle cx="{60 + 29 * math.cos(a * math.pi / 3):.2f}" '
        f'cy="{60 + 29 * math.sin(a * math.pi / 3):.2f}" r="13"/>'
        for a in range(6))
    + '</g>\n'
    '        <circle cx="60" cy="60" r="12" fill="var(--rdr-brass)"/>\n'
    '        <circle cx="60" cy="60" r="4" fill="var(--rdr-stone)"/>\n'
    '        <path d="M60 50 V54 M60 66 V70 M50 60 H54 M66 60 H70" stroke="var(--rdr-timber)" stroke-width="2"/>\n'
    '      </symbol>\n'
    '    </svg>\n'
)


def reel_list(i, t):
    title, ch = t["title"], t["channel"]
    src = f"https://www.youtube-nocookie.com/embed/videoseries?list={t['list']}&autoplay=1"
    kind = "every film on the channel, newest first" if t["kind"] == "channel" else f"a playlist by {ch}"
    what = f'\n            <span class="cin-reel__what">{esc(t["what"])}</span>' if t.get("what") else ""
    tin = f'<svg class="cin-reel__tin cin-reel__tin--{i % 6 + 1}" viewBox="0 0 120 120" aria-hidden="true" focusable="false"><use href="#cin-reel"/></svg>'
    if t.get("door"):
        # A LIST THAT WILL NOT PLAY HERE: its first film is not available in
        # every country, and a frame would show YouTube's refusal where the
        # film should be. The reel is a link to the list on YouTube, dashed,
        # and says why on its face.
        return (
            f'        <li class="cin-reel__slot cin-reel__slot--door" id="cin-reel-{attr(t["list"])}">\n'
            f'          <a class="cin-reel cin-reel--list cin-reel--door" href="{attr(t["address"])}" rel="noopener">\n'
            f'            {tin}\n'
            f'            <span class="cin-reel__label">\n'
            f'            <span class="cin-reel__title">{esc(title)}</span>\n'
            f'            <span class="cin-reel__kind">{esc(kind)}</span>{what}\n'
            f'            <span class="cin-reel__note">{esc(t["says"])}</span>\n'
            f'            <span class="cin-reel__go">Opens on YouTube</span>\n'
            f'            </span>\n'
            f'          </a>\n'
            f'          <p class="cin-reel__credit">on YouTube: <a href="{attr(t["address"])}">{esc(ch)}</a></p>\n'
            f'        </li>')
    return (
        f'        <li class="cin-reel__slot cin-reel__slot--list" id="cin-reel-{attr(t["list"])}" data-rack-card>\n'
        f'          <button type="button" class="cin-reel cin-reel--list" hidden data-rack-to="{RACK}" '
        f'data-rack-name="{SCREEN}" '
        f'data-rack-src="{attr(src)}" '
        f'data-rack-title="{attr(title)}, {attr(kind)}, on {SCREEN}" '
        f'data-rack-film="{attr(title)}" '
        f'data-rack-runtime="runs until you stop it">\n'
        f'            {tin}\n'
        f'            <span class="cin-reel__label">\n'
        f'            <span class="cin-reel__title">{esc(title)}</span>\n'
        f'            <span class="cin-reel__kind">{esc(kind)}</span>{what}\n'
        f'            <span class="cin-reel__go">Put it on {SCREEN} &middot; runs until you stop it</span>\n'
        f'            </span>\n'
        f'          </button>\n'
        f'          <button type="button" class="facade" data-embed-src="{attr(src)}" '
        f'data-embed-title="{attr(title)}, {attr(kind)}, on YouTube">\n'
        f'            Play here instead &mdash; runs until you stop it\n'
        f'            <span class="facade__play">&#9654; PRESS PLAY</span>\n'
        f'          </button>\n'
        f'          <p class="cin-reel__credit">on YouTube: <a href="{attr(t["address"])}">{esc(ch)}</a></p>\n'
        f'        </li>')


def reel(i, t):
    if "list" in t:
        return reel_list(i, t)
    title, ch = t["title"], t["channel"]
    rt = "live, runs until you close it" if t.get("live") else t["runtime"]
    who = f'\n            <span class="cin-reel__who">{esc(t["who"])}</span>' if t.get("who") else ""
    what = f'\n            <span class="cin-reel__what">{esc(t["what"])}</span>' if t.get("what") else ""
    tin = f'<svg class="cin-reel__tin cin-reel__tin--{i % 6 + 1}" viewBox="0 0 120 120" aria-hidden="true" focusable="false"><use href="#cin-reel"/></svg>'
    if t.get("door"):
        # A DOOR, NOT A SCREEN: its channel has embedding off, so a frame would
        # show YouTube's refusal where the film should be.
        return (
            f'        <li class="cin-reel__slot cin-reel__slot--door" id="cin-reel-{attr(t["id"])}">\n'
            f'          <a class="cin-reel cin-reel--door" href="https://www.youtube.com/watch?v={attr(t["id"])}" rel="noopener">\n'
            f'            {tin}\n'
            f'            <span class="cin-reel__label">\n'
            f'            <span class="cin-reel__title">{esc(title)}</span>{who}{what}\n'
            f'            <span class="cin-reel__note">This one will not play in a frame here; the reel opens it on YouTube.</span>\n'
            f'            <span class="cin-reel__go">Opens on YouTube &middot; {esc(rt)}</span>\n'
            f'            </span>\n'
            f'          </a>\n'
            f'          <p class="cin-reel__credit">{esc(rt)} &middot; on YouTube, via {esc(ch)}</p>\n'
            f'        </li>')
    film = f'{t["who"]}, {title}' if t.get("who") else title
    live = ('\n            <span class="cin-reel__note">A live camera: the picture may be dark, '
            'empty or between streams.</span>') if t.get("live") else ""
    return (
        f'        <li class="cin-reel__slot" id="cin-reel-{attr(t["id"])}" data-rack-card>\n'
        f'          <button type="button" class="cin-reel" hidden data-rack-to="{RACK}" '
        f'data-rack-name="{SCREEN}" '
        f'data-rack-src="https://www.youtube-nocookie.com/embed/{attr(t["id"])}?autoplay=1&amp;rel=0" '
        f'data-rack-title="{attr(film)}, on {SCREEN}" '
        f'data-rack-film="{attr(film)}" '
        f'data-rack-runtime="{attr(rt)}">\n'
        f'            {tin}\n'
        f'            <span class="cin-reel__label">\n'
        f'            <span class="cin-reel__title">{esc(title)}</span>{who}{what}{live}\n'
        f'            <span class="cin-reel__go">Put it on {SCREEN} &middot; {esc(rt)}</span>\n'
        f'            </span>\n'
        f'          </button>\n'
        f'          <button type="button" class="facade" data-embed-id="{attr(t["id"])}" '
        f'data-embed-title="{attr(film)}">\n'
        f'            Play here instead &mdash; {esc(rt)}\n'
        f'            <span class="facade__play">&#9654; PRESS PLAY</span>\n'
        f'          </button>\n'
        f'          <p class="cin-reel__credit">{esc("live" if t.get("live") else rt)} &middot; on YouTube, via {esc(ch)}</p>\n'
        f'        </li>')


def shelf_id(title):
    return "shelf-" + re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")


def shelf(sh, start):
    head = f'      <h3 class="cin-shelf__name" id="{shelf_id(sh["title"])}">{esc(sh["title"])}</h3>\n'
    note = f'      <p class="cin-shelf__note">{esc(sh["note"])}</p>\n' if sh.get("note") else ""
    if not sh["reels"]:
        return ('      <section class="cin-shelf" aria-labelledby="' + shelf_id(sh["title"]) + '">\n' + head + note +
                '      <p class="cin-shelf__soon">Coming soon: the rail is up and its reels are on their way.</p>\n'
                '      </section>')
    return ('      <section class="cin-shelf" aria-labelledby="' + shelf_id(sh["title"]) + '">\n' + head + note +
            '      <ol class="cin-reels">\n' + "\n".join(reel(start + i, t) for i, t in enumerate(sh["reels"])) +
            '\n      </ol>\n      </section>')


if films:
    doors = any(t.get("door") for t in films)
    block = (
        f'<div class="cin-screen" data-rack-screen="{RACK}" tabindex="-1" hidden>\n'
        '      <p class="cin-screen__idle"><span><b>The screen.</b> Nothing is showing. Any reel on the rails below '
        'can go up here, and nothing loads until you press one.</span></p>\n'
        '    </div>\n'
        f'    <p class="cin-screen__now" data-rack-now="{RACK}" tabindex="-1" hidden></p>\n'
        f'    <p class="cin-screen__back" hidden><button type="button" class="cin-back" data-rack-back="{RACK}">'
        'Take it off the screen</button></p>\n'
        '    <p class="cin-intro">Take a reel off the rail: press it and it goes up on the screen and plays. Every reel '
        'says how long the film runs before you press it. A whole channel or playlist says it runs until you stop it, '
        'and plays from the top with the rest to scroll through in the player; a live camera says it runs until you '
        'close it. Nothing plays '
        'until you press it, and taking it off leaves the screen dark again.'
        + (' A reel that opens on YouTube instead says so: its channel will not let other sites frame it.' if doors else '')
        + '</p>\n'
        '    <details class="cin-rack" open>\n'
        '      <summary class="cin-rack__sum">Every film, as reels on the rails</summary>\n'
        + REEL
        + "\n".join(shelf(sh, sum(len(x["reels"]) for x in shelves[:k])) for k, sh in enumerate(shelves)) + '\n'
        '    </details>\n'
        f'    <p class="cin-rack__from">Every reel read off its own page on YouTube on {esc(d["_checked"])}, '
        'in the order I put them on the rails. A channel or playlist plays whatever is on it the day you press it.</p>'
    )
else:
    block = ('<p class="cin-intro cin-waiting">The rails are up and the reels are on their way: I am choosing the films. '
             'When they come, each one hangs here on a reel of its own, says how long it runs, and goes up on the '
             'screen when you press it.</p>')

begin, end = "<!-- yurt-cinema:reels:begin -->", "<!-- yurt-cinema:reels:end -->"
if page.count(begin) != 1 or page.count(end) != 1:
    raise SystemExit(f"REFUSING: faery-cinema-room.html must hold one {begin} and one {end}.")
a = page.index(begin) + len(begin)
b = page.index(end)
new = page[:a] + "\n    " + block + "\n    " + page[b:]
if new != page:
    PAGE.write_text(new)
# ── The Cinema's book, in the yurt ──────────────────────────────────────────
# The songbooks' binding (yurt-notebook.js shuts it and turns its pages; with no
# script it is open and swipes), a shelf to a run of pages, seven lines to a
# page, every line a link to its reel in the Cinema.
YURT = ROOT / "faery-yurt.html"
PER_PAGE = 7


def reel_anchor(t):
    return "cin-reel-" + (t.get("id") or t.get("list"))


def reel_time(t):
    if "list" in t:
        return "runs until you stop it"
    return "live" if t.get("live") else t["runtime"]


book_pages = []
for sh in shelves:
    for n in range(0, len(sh["reels"]), PER_PAGE):
        chunk = sh["reels"][n:n + PER_PAGE]
        lines = [
            f'            <li class="yurt-songbook__song"><a class="yurt-songbook__link" '
            f'href="faery-cinema-room.html#{attr(reel_anchor(t))}">'
            f'<span class="yurt-songbook__title">{esc(t["title"])}</span></a> '
            f'<span class="yurt-songbook__what">{esc(t["channel"])}</span> '
            f'<span class="yurt-songbook__time">{esc(reel_time(t))}</span></li>'
            for t in chunk]
        no = len(book_pages) + 1
        say = (f'Page {no}: {sh["title"]}, from {chunk[0]["title"]} to {chunk[-1]["title"]}.'
               if len(chunk) > 1 else f'Page {no}: {sh["title"]}, {chunk[0]["title"]}.')
        book_pages.append(
            f'        <li class="yurt-notebook__page" data-notebook-say="{attr(say)}">\n'
            f'          <p class="yurt-songbook__head">{esc(sh["title"])}</p>\n'
            f'          <ul class="yurt-songbook__list">\n' + "\n".join(lines) + '\n          </ul>\n'
            f'          <span class="yurt-notebook__no" aria-hidden="true">No. {no}</span>\n'
            f'        </li>')

if book_pages:
    book = (
        '<div class="yurt-notebook yurt-songbook" data-notebook>\n'
        '      <button type="button" class="yurt-notebook__shut" data-notebook-open hidden>\n'
        '        <span class="yurt-notebook__title">The Cinema</span>\n'
        '        <span class="yurt-notebook__open">Open the book</span>\n'
        '      </button>\n'
        '      <div class="yurt-notebook__cover" data-notebook-book>\n'
        '        <ul class="yurt-notebook__pages" tabindex="0" aria-label="The Cinema: every reel on its rails, '
        'shelf by shelf; each line goes to that reel in the Cinema" data-notebook-pages>\n'
        + "\n".join(book_pages) + '\n'
        '        </ul>\n'
        '        <span class="yurt-notebook__sweep" aria-hidden="true" data-notebook-sweep></span>\n'
        '      </div>\n'
        '      <div class="yurt-notebook__controls" data-notebook-controls hidden>\n'
        '        <button type="button" class="yurt-notebook__btn" data-notebook-prev>&larr; Turn back</button>\n'
        '        <button type="button" class="yurt-notebook__btn" data-notebook-close>Close the book</button>\n'
        '        <button type="button" class="yurt-notebook__btn" data-notebook-next>Turn the page &rarr;</button>\n'
        '      </div>\n'
        '      <p class="sr" role="status" aria-live="polite" data-notebook-says></p>\n'
        '    </div>\n'
        '    <p class="yurt-songbook__from">Every reel on the rails in the <a href="faery-cinema-room.html">Cinema</a>, '
        'shelf by shelf, in the order I hung them. Press a line and it takes you to that reel, which is where it plays. '
        'Nothing in this book plays.</p>')
else:
    book = '<p class="yurt-songbook__from">The Cinema&rsquo;s book is waiting for its first reel.</p>'

yurt = YURT.read_text()
b2, e2 = "<!-- yurt-cinema:book:begin -->", "<!-- yurt-cinema:book:end -->"
if yurt.count(b2) != 1 or yurt.count(e2) != 1:
    raise SystemExit(f"REFUSING: faery-yurt.html must hold one {b2} and one {e2}.")
a2, z2 = yurt.index(b2) + len(b2), yurt.index(e2)
new_yurt = yurt[:a2] + "\n    " + book + "\n    " + yurt[z2:]
if new_yurt != yurt:
    YURT.write_text(new_yurt)
if re.search(r"data-embed|data-rack-to|class=\"facade", new_yurt[a2:new_yurt.index(e2)]):
    raise SystemExit("REFUSING: the Cinema's book in the yurt holds something that plays. The films play in the Cinema.")


print(f"make-yurt-cinema: {len(films)} reel{'s' if len(films) != 1 else ''} on {len(shelves)} shelves, "
      f"and {len(book_pages)} pages in the yurt's book"
      + ("" if films else " (none yet; the room says they are on their way)") + ".")
