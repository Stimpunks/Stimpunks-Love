#!/usr/bin/env python3
"""Build the telly in Luis's Burrow and the rack of Frasier clips under it.

ONE DATA FILE, ONE TOOL. data/luis-burrow.json holds the clips, read off
YouTube's own watch pages; this writes the telly and its rack into
luis-burrow.html between the lbw:telly markers. Do not hand-edit between them.

THE TELLY HAS NOTHING OF ITS OWN ON IT, the Doom Scoop's and Big Steep's
arrangement: it ships hidden, rack.js unhides it, and any clip on the rack plays
where it hangs or goes up on the telly with the button under it. Nothing reaches
YouTube until somebody presses.

IT REFUSES, rather than writing something that looks right:
  - A CLIP WITH NO RUNTIME, because every press on this street says how long
    before the press, and a blank one would look like a design choice.
  - AN ID THAT IS NOT A YOUTUBE ID, because love-embed.js validates quietly and a
    typo is a button that never becomes a video.
  - A CLIP TWICE, or a clip from anybody but its shelf's own channels. Frasier
    is Paramount's and the animal films are BBC Earth's, and Helen's rule for
    her cinema holds here too: the makers' own uploads only. A fan copy is
    somebody else's copy of somebody else's work, and when an official one
    stops playing it comes off the rack rather than being swapped for one.
  - MORE THAN FIVE FRASIER CLIPS. Helen asked for the top five, and a sixth is
    the rack growing past what she asked for.
  - A PAGE THAT CANNOT PLAY THEM: no love-embed.js, no rack.js, no telly.

THE COFFEE AND THE BOOKSHELF are written between the lbw:coffee and lbw:shelf
markers from the same file. It refuses A BOOK WITH NO BORROW LINK (the
Hermitage's shelf rule: access is the point), A PRICE OR ANYTHING OWED
anywhere in the burrow's own words (Nothing For Sale's rule: the coffee is free
to help yourself to), and A CLAIM ABOUT WHAT COFFEE DOES FOR A BODY (energy,
focus, waking you up, antioxidants): a bag of beans says where it is from and
what it tastes like, and this room says no more than a bag.
"""
import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "luis-burrow.json"
PAGE = ROOT / "luis-burrow.html"
SCREEN = ("telly", "the telly")
# Whose channel each shelf may hold, read off each channel's own page: Frasier
# is Paramount's, the animal films are BBC Earth's, and the waterfall is on the
# channel that filmed it. Anybody else's upload is somebody else's copy.
SHELVES = {
    "frasier": {"Paramount Plus": "UCrRttZIypNTA1Mrfwo745Sg"},
    "wood": {"BBC Earth": "UCwmZiChSryoWQCZMIQezgTg", "Nature Zilla": "UCDmvEp5Rtjw817rMw_Z-S1A"},
}
FRASIER_MOST = 5   # Helen's ask, 2026-11-05: "only use 5 top clips"
MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August",
          "September", "October", "November", "December"]
ID = re.compile(r"^[A-Za-z0-9_-]{11}$")
RUNTIME = re.compile(r"^(?:\d+:)?\d{1,2}:\d{2}$")

problems = []
PRICE = re.compile(r"(?:[$£€]\s?\d|\b\d+p\b|\bprice|\bcost|\bfor sale\b|\bbuy\b|\bpay\b|\bdonat|\btip jar)", re.I)
CURE = re.compile(r"\b(?:energy|energi[sz]|boost|focus|wake[s]? you up|alert|antioxidant|health|metabolism|productiv)", re.I)


def refuse(msg):
    problems.append(msg)


def esc(s):
    return html.escape(str(s), quote=False)


def attr(s):
    return html.escape(str(s), quote=True)


def day(iso):
    y, m, dd = (int(x) for x in iso.split("-"))
    return f"{dd} {MONTHS[m - 1]} {y}"


def swap(page, marker, block, indent=""):
    src = page.read_text()
    begin, end = f"<!-- {marker}:begin -->", f"<!-- {marker}:end -->"
    if begin not in src or end not in src:
        raise SystemExit(
            f"REFUSING: {page.name} has no {marker} markers, so there is nowhere to write.\n"
            "Put them back rather than letting this tool go quiet -- a generator that\n"
            "writes nothing and exits 0 is how two surfaces drift apart.")
    page.write_text(re.sub(re.escape(begin) + r".*?" + re.escape(end),
                           lambda _m: begin + "\n" + block + "\n" + indent + end,
                           src, flags=re.S))


def check_data(d):
    vids = d.get("videos") or []
    if not vids:
        refuse("no clips on the rack, and a telly with nothing to put on it is not a telly.")
    seen = set()
    for i, v in enumerate(vids):
        where = f"clip {i + 1} ({v.get('title', '?')!r})"
        if not ID.match(v.get("id", "")):
            refuse(f"{where}: {v.get('id')!r} is not a YouTube id.")
        if v.get("id") in seen:
            refuse(f"{where}: on the rack twice.")
        seen.add(v.get("id"))
        if not RUNTIME.match(v.get("runtime", "")):
            refuse(f"{where}: no runtime. Every press here says how long before the press.")
        allowed = SHELVES.get(v.get("shelf"))
        if allowed is None:
            refuse(f"{where}: no shelf called {v.get('shelf')!r}.")
        elif allowed.get(v.get("channel")) != v.get("channel_id"):
            refuse(f"{where}: not on its shelf's own channels ({', '.join(allowed)}). The makers' "
                   "own uploads only; a fan copy is not ours to put on.")
        for k in ("title", "published"):
            if not v.get(k):
                refuse(f"{where}: no {k}.")

    if sum(v.get("shelf") == "frasier" for v in vids) > FRASIER_MOST:
        refuse(f"more than {FRASIER_MOST} Frasier clips: Helen asked for the top five.")
    for k in SHELVES:
        if k not in (d.get("shelves") or {}):
            refuse(f"the shelf {k!r} has no heading in the data's shelves.")


def check_extras(d):
    for i, c in enumerate(d.get("coffee") or []):
        where = f"coffee {i + 1} ({c.get('name', '?')!r})"
        for k in ("name", "from", "roast", "tastes"):
            if not c.get(k):
                refuse(f"{where}: no {k}.")
        if not isinstance(c.get("intensity"), int) or not 1 <= c["intensity"] <= 10:
            refuse(f"{where}: intensity is one to ten on the burrow's scale.")
    if not d.get("coffee"):
        refuse("no beans: the machine has nothing to grind.")
    for i, b in enumerate(d.get("books") or []):
        where = f"book {i + 1} ({b.get('title', '?')!r})"
        for k in ("shelf", "title", "author", "note"):
            if not b.get(k):
                refuse(f"{where}: no {k}.")
        if not re.match(r"^https://openlibrary\.org/works/OL\d+W", b.get("borrow", "")):
            refuse(f"{where}: no borrow link on Open Library. Access is the point; a shelf that "
                   "only says where to buy is a shop with an argument painted on it.")
    if not d.get("books"):
        refuse("no books on the shelf.")


NEGATION = re.compile(r"\b(?:nothing|no|never|not|nobody|without|free)\b", re.I)


def sweep(text, where):
    """Refuse the vocabulary in the burrow's own voice, with the negation
    window every sweep on this street carries: the room may still say out loud
    that nothing is for sale, which is the sentence the sweep exists to keep."""
    plain = html.unescape(re.sub(r"<[^>]+>", " ", text))
    for pat, what in ((PRICE, "a price or something owed"), (CURE, "what coffee does for a body")):
        for m in pat.finditer(plain):
            if NEGATION.search(plain[max(0, m.start() - 48):m.start()]):
                continue
            refuse(f"{where}: {what} ({m.group(0)!r}). Nothing here is for sale, and a bag of beans "
                   "says where it is from and what it tastes like, no more.")


def coffee_block(d):
    out = ['    <ul class="lbw-beans">']
    for c in d["coffee"]:
        n = c["intensity"]
        dots = "".join('<i class="lbw-dot lbw-dot--on"></i>' if k < n else '<i class="lbw-dot"></i>' for k in range(10))
        out += [
            '      <li class="lbw-bean">',
            f'        <h3 class="lbw-bean__name">{esc(c["name"])} <span class="lbw-bean__from">{esc(c["from"])}</span></h3>',
            f'        <p class="lbw-bean__roast">{esc(c["roast"])} roast &middot; intensity {n} of 10</p>',
            f'        <p class="lbw-bean__dots" aria-hidden="true">{dots}</p>',
            f'        <p class="lbw-bean__tastes">{esc(c["tastes"])}</p>',
            '      </li>',
        ]
    out.append('    </ul>')
    return "\n".join(out)


def shelf_block(d):
    out = []
    shelves = list(dict.fromkeys(b["shelf"] for b in d["books"]))
    for sh in shelves:
        out += [f'    <h3 class="lbw-shelf-h">{esc(sh)}</h3>', '    <ul class="lbw-books">']
        for b in (b for b in d["books"] if b["shelf"] == sh):
            out += [
                '      <li class="lbw-book">',
                f'        <p class="lbw-book__title"><cite>{esc(b["title"])}</cite> <span class="lbw-book__by">{esc(b["author"])}</span></p>',
                f'        <p class="lbw-book__note">{esc(b["note"])}</p>',
                f'        <p class="lbw-book__go"><a href="{attr(b["borrow"])}">Borrow or read it &rarr;</a></p>',
                '      </li>',
            ]
        out.append('    </ul>')
    return "\n".join(out)


def telly_block(d):
    sid, sname = SCREEN
    out = [
        f'    <div class="lbw-telly" data-rack-screen="{sid}" tabindex="-1" hidden>',
        '      <p class="lbw-telly__idle"><span><b>The telly.</b> Nothing is on it yet. Any clip on the rack can go up here with the button under it, and nothing loads until you press one.</span></p>',
        '    </div>',
        f'    <p class="lbw-telly__now" data-rack-now="{sid}" tabindex="-1" hidden></p>',
        f'    <p class="lbw-telly__back" hidden><button type="button" class="lbw-btn" data-rack-back="{sid}">Switch the telly off</button></p>',
        '    <details class="lbw-rack" open>',
        '      <summary class="lbw-rack__sum">What is on, one press each</summary>',
    ]
    for shelf, heading in d["shelves"].items():
        out += [f'      <h3 class="lbw-shelf">{esc(heading)}</h3>', '      <ul class="lbw-clips">']
        for v in (v for v in d["videos"] if v["shelf"] == shelf):
            r = v["runtime"]
            label = f'{attr(v["channel"])} &mdash; {attr(v["title"])}'
            out += [
                '        <li class="lbw-clip" data-rack-card>',
                f'          <h4 class="lbw-clip__title">{esc(v["title"])}</h4>',
                f'          <p class="lbw-clip__who">{esc(v["channel"])} &middot; {esc(day(v["published"]))} &middot; {r}</p>',
                f'          <button type="button" class="facade" data-embed-id="{v["id"]}" data-embed-title="{label}">',
                f'            Play it here &mdash; {r}',
                '            <span class="facade__play">&#9654; PRESS PLAY</span>',
                '          </button>',
                f'          <button type="button" class="lbw-btn lbw-clip__up" hidden data-rack-to="{sid}" data-rack-name="{sname}" '
                f'data-rack-src="https://www.youtube-nocookie.com/embed/{v["id"]}?autoplay=1&amp;rel=0" '
                f'data-rack-title="{label}, on {sname}" data-rack-film="{attr(v["title"])}" '
                f'data-rack-runtime="{r}">Put it on the telly &mdash; {r}</button>',
                '        </li>',
            ]
        out.append('      </ul>')
    out += [
        f'      <p class="lbw-from">Every Frasier clip is on Paramount Plus&rsquo;s own channel, every animal film on BBC Earth&rsquo;s and the waterfall on the channel that filmed it, each read off its own watch page on {esc(day(d["_checked"]))}. The titles are the channels&rsquo;, as they wrote them.</p>',
        '    </details>',
    ]
    return "\n".join(out)


def check_page():
    src = PAGE.read_text()
    # The burrow's own words, with the clips' titles cut out, which are the
    # channels' and are not swept, and the markers' blocks, swept already.
    own = re.sub(r"<!-- lbw:(telly|coffee|shelf):begin -->.*?<!-- lbw:\1:end -->", " ", src, flags=re.S)
    own = re.sub(r"<!-- quest:.*?:end -->|<!-- signoff:begin -->.*?<!-- signoff:end -->|<!--.*?-->", " ", own, flags=re.S)
    own = own[own.index("<main"):]
    sweep(own, PAGE.name)
    for needle, why in (('src="love-embed.js"', "it does not load love-embed.js, so no clip could play"),
                        ('src="rack.js"', "it does not load rack.js, so nothing could go up on the telly"),
                        (f'data-rack-screen="{SCREEN[0]}"', "it has no telly for the rack to put a clip on")):
        if needle not in src:
            refuse(f"{PAGE.name}: {why}.")


def main():
    d = json.loads(DATA.read_text())
    check_data(d)
    check_extras(d)
    for k in ("_what", "_source", "_coffee", "_books"):
        sweep(d.get(k, ""), f"{DATA.name} {k}")
    for c in d.get("coffee") or []:
        sweep(" ".join(str(v) for v in c.values()), f"coffee {c.get('name')!r}")
    for b in d.get("books") or []:
        sweep(b.get("note", ""), f"book {b.get('title')!r}")
    if problems:
        print("REFUSING:\n  " + "\n  ".join(dict.fromkeys(problems)))
        sys.exit(1)
    swap(PAGE, "lbw:telly", telly_block(d), "    ")
    swap(PAGE, "lbw:coffee", coffee_block(d), "    ")
    swap(PAGE, "lbw:shelf", shelf_block(d), "    ")
    check_page()
    if problems:
        print("REFUSING (the page as written):\n  " + "\n  ".join(dict.fromkeys(problems)))
        sys.exit(1)
    print("luis's burrow: the telly and its two shelves written, five Frasier clips and the wood; "
          "every one its maker's own upload, every button saying how long")


if __name__ == "__main__":
    main()
