#!/usr/bin/env python3
"""Build the Pebble Board's current edition from data/pebble-board.json.

THE BOARD IS STREET FURNITURE AND NOT A STOREFRONT. It is a community
noticeboard on the pavement outside the shops, in the same category as the
signpost to the campgrounds: not a door, not in the grid of them. A room is
permanent and singular; this thing is defined by being replaced, and a shop
whose entire stock is swapped out every gathering is a periodical.

WHAT IT REFUSES, and why each one is here rather than left to care:

  - A CARD WITH NO CREDIT. Attribution is the one careful habit this street
    kept, because it is a licence rather than a house style. A pebble is
    something somebody brought; the whole point is who brought it and whose it
    is.
  - A VIDEO WITH NO RUNTIME. Every press-to-play control on this street says
    how long it runs BEFORE the press -- make-chappell.py, make-den.py,
    make-club.py and make-hermitage.py all refuse the same thing. A blank one
    looks like a design choice rather than a bug.
  - AN ID THAT IS NOT A YOUTUBE ID. love-embed.js validates before it builds a
    frame and returns QUIETLY, so a typo is not an error anywhere -- it is a
    button a reader presses and presses that never becomes a video.
  - A THUMBNAIL THAT IS NOT A LOCAL FILE. This is the one refusal that is this
    board's own, and it is the reason the Content-Security-Policy did not have
    to move. The page arrived hotlinking twenty-one thumbnails off
    img.youtube.com, which `img-src 'self'` would have rendered as broken
    images -- and loosening the header to let them through would have made a
    request to Google for every card on load, telling them who is reading the
    board before anybody pressed anything. Cached at build time instead. A
    remote image URL anywhere in this data is refused.
  - ARTWORK WITH NO MAKER, OR A MAKER WHO HAS NOT AGREED. Sharing a drawing at
    a gathering is not the same as agreeing to have it published on a public
    site, so 'maker_agreed' is a separate fact from 'maker'. This is
    make-polaroids.py's rule about photographers, arriving for the people who
    draw: being in the room is not the same as publishing.
  - A PHOTOGRAPH WITH NO CONSENT RECORD. The photographs are governed by
    data/polaroids.json and tools/make-polaroids.py, same as every other
    photograph here, and this refuses to name one that file does not carry.
    Two tools guarding one fact from opposite ends is deliberate: three audio
    tools each guarded their own files and left recordings sitting in audio/
    that belonged to no tool's patch.
  - A SECTION WITH NO CARDS. It would render as a tab over nothing.
  - MARKERS WITHOUT A SECTION, OR A SECTION WITHOUT MARKERS.

WHAT IT DOES NOT COUNT. The board arrived saying "44 things collected so far"
and there is no total on it now. check-counts.py would have refused a typed
one, but a generated one would have passed and would still have been wrong:
the pebbling cabinet refuses a tally on the grounds that pebbling is explicitly
not about volume, and this is the same practice in a room with no game in it. A
number beside it would quietly make it about volume.

ROTATION IS A NEW GATHERING, NOT A CLOCK. An edition is dated by the day it was
collected. A board nobody has pinned to in a while is an honest board rather
than a stale one, and a header that said "Autumn" in spring would not be. When
a new edition goes up, the outgoing one is written to its own page and joins
the rack at the foot of the board; until something has rotated out the rack
says so rather than being hidden, the same way Enid's plates stay grey.
"""
import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data/pebble-board.json"
PAGE = ROOT / "pebble-board.html"
YT_ID = re.compile(r"^[A-Za-z0-9_-]{11}$")
REMOTE = re.compile(r"^(https?:)?//")

# One tape colour per section, and they are Norah's. The tab and the strip of
# tape on every card in that section share it, which is what makes a spread
# read as one drawer rather than as a list with headings.
TAPE = {"music": "#C9A6A0", "words": "#A9B18C", "art": "#D7B67E", "fun": "#E0C15A",
        "moments": "#9FA8C0", "community": "#C68B5C", "grants": "#D4AF37"}

# Norah scattered the cards by hand. Regenerating that by random() would move
# every card on every build for no reason and make the diffs unreadable, so the
# scatter is a fixed cycle keyed to position -- deterministic, and the same
# shape she drew. §3 flattens all of it at Gentle.
ROT = (-3, 2, -1.5, 3, -2.5, 1.5, -1)
TAPE_ROT = (-8, 6, -5, 9, -7, 5, -6)


def die(msg):
    raise SystemExit("REFUSING: " + msg)


def esc(s):
    return html.escape(s or "", quote=True)


def consented_photos():
    """Every photo id data/polaroids.json carries a consent record for.

    THE RECORD LIVES THERE AND NOT HERE, on purpose. Consent, withdrawal and
    the young-person policy are one contract for the whole site; a second copy
    in this file is a copy that gets a withdrawal honoured in one place and not
    the other. make-polaroids.py guards the same fact from the far end -- it
    refuses if this page publishes a photo its record does not mention -- so
    deleting an entry there breaks this build until the board lets go too.
    """
    pol = json.loads((ROOT / "data/polaroids.json").read_text())
    return {p["id"] for p in pol.get("photos", [])}


def photo_file(pid):
    for suf in (".jpg", ".jpeg", ".png", ".webp"):
        if (ROOT / "photos" / f"{pid}{suf}").exists():
            return f"photos/{pid}{suf}"
    return None


def zoom(src, alt, title, credit, photo=False):
    """A picture pinned at 250px, and a way to see it properly.

    A scrap on a corkboard is small because that is what a scrap is, and 250px
    is not a size anybody can look at a watercolour at. The button opens a
    native <dialog>, so the browser owns the focus trap, Escape and the return
    of focus rather than pebble-board.js imitating them.

    THE ALT TEXT TRAVELS WITH THE PICTURE and is shown as words inside the
    dialog rather than only announced, which is why it is written onto the
    button as well: a description that exists only in an attribute is a
    description most people never get. The class stays 'photo' on photographs
    wherever they are, because that is the exact hook make-polaroids.py looks
    for when it checks that nobody has been filtered.
    """
    cls = "photo pb-shot" if photo else "pb-shot"
    return (f'          <button type="button" class="pb-zoom" data-full="{src}"\n'
            f'                  data-title="{esc(title)}" data-credit="{esc(credit)}"\n'
            f'                  data-desc="{esc(alt)}"\n'
            f'                  aria-label="View larger: {esc(title)}">'
            f'<img class="{cls}" src="{src}" alt="{esc(alt)}" loading="lazy"></button>\n')


def card_html(c, edition, i, consented):
    title = c.get("title") or die("a card has no title.")
    if not c.get("credit"):
        die(f"the card {title!r} has no credit. Attribution is the one careful habit\n"
            "this street kept, and a pebble is something somebody brought.")

    media, run = "", ""
    vid = c.get("video")
    if vid:
        if not YT_ID.match(vid):
            die(f"the card {title!r} has {vid!r} as a video id, which is not a YouTube id.\n"
                "love-embed.js refuses it quietly at runtime, so this would ship as a button\n"
                "a reader presses and presses that never becomes a video.")
        if not c.get("length"):
            die(f"the card {title!r} has no runtime. Every press-to-play control on this\n"
                "street says how long it runs before the press, and a blank one reads as a\n"
                "design choice rather than a bug.")
        thumb = c.get("thumb") or die(f"the card {title!r} has a video and no thumbnail.")
        if REMOTE.match(thumb):
            die(f"the card {title!r} points its thumbnail at {thumb!r}. Every image here is\n"
                "a local file: that is what lets img-src stay 'self', so opening the board\n"
                "makes no request to anybody. Cache it at build time instead.")
        src = f"pebbles/{edition['slug']}/{thumb}"
        if not (ROOT / src).exists():
            die(f"the card {title!r} names {src} and there is no such file.")
        name = f"{title} — {c['credit']} · {c['length']}"
        if c.get("how") == "link":
            # PLAYING IS NOT THE SAME PERMISSION AS EMBEDDING. This one answers
            # OK and refuses the frame, so it is a DOOR DRESSED AS A DOOR: a
            # link wearing a play triangle is the broken thing, because the one
            # action it promises is the one it cannot do.
            media = (f'          <a class="pb-play" href="https://www.youtube.com/watch?v={vid}">'
                     f'<img class="pb-shot" src="{src}" alt=""></a>\n')
            run = f'          <p class="pb-run">Opens on YouTube · {esc(c["length"])}</p>\n'
        else:
            media = (f'          <button type="button" class="facade pb-play" data-embed-id="{vid}"\n'
                     f'                  data-embed-title="{esc(name)}" aria-label="Play {esc(name)}">'
                     f'<img class="pb-shot" src="{src}" alt=""></button>\n')
            run = f'          <p class="pb-run">Play · {esc(c["length"])}</p>\n'
    elif c.get("art"):
        maker = c.get("maker") or die(f"the card {title!r} carries artwork with no maker named.")
        if not c.get("maker_agreed"):
            die(f"{maker}'s artwork on {title!r} has no recorded permission. Sharing a drawing\n"
                "at a gathering is not the same as agreeing to have it published on a public\n"
                "site; 'maker_agreed' is a separate fact from 'maker'.")
        if not c.get("alt"):
            die(f"the artwork on {title!r} has no alt text. A picture nobody can hear is not\n"
                "on a Disabled people's site by accident.")
        src = f"pebbles/{edition['slug']}/{c['art']}"
        if not (ROOT / src).exists():
            die(f"the card {title!r} names {src} and there is no such file.")
        media = zoom(src, c["alt"], title, c["credit"])
    elif c.get("photo"):
        pid = c["photo"]
        if pid not in consented:
            die(f"the card {title!r} publishes photos/{pid} and data/polaroids.json has no\n"
                "record for it. If we cannot say who agreed and when, we do not have their\n"
                "agreement, we have a file.")
        src = photo_file(pid) or die(f"{pid!r} has a consent record and no file in photos/.")
        pol = json.loads((ROOT / "data/polaroids.json").read_text())
        alt = next(p["alt"] for p in pol["photos"] if p["id"] == pid)
        media = zoom(src, alt, title, c["credit"], photo=True)

    out = [f'      <li class="pb-pin" style="--pb-rot:{ROT[i % len(ROT)]}deg;'
           f'--pb-tape-rot:{TAPE_ROT[i % len(TAPE_ROT)]}deg;">\n',
           '        <figure class="pb-card">\n',
           '          <span class="pb-tape" aria-hidden="true"></span>\n']
    out.append(media)
    out.append('          <figcaption class="pb-body">\n')
    out.append(f'            <h3 class="pb-title">{esc(title)}</h3>\n')
    out.append(f'            <p class="pb-credit">{esc(c["credit"])}</p>\n')
    if c.get("note"):
        out.append(f'            <p class="pb-note">{esc(c["note"])}</p>\n')
    if c.get("more"):
        out.append('            <details class="pb-more"><summary>read more</summary>'
                   f'<p>{esc(c["more"])}</p></details>\n')
    if run:
        out.append(run.replace("          <p", "            <p"))
    if c.get("href") and not (vid and c.get("how") != "link"):
        label = "Watch on YouTube →" if vid else "Open it →"
        out.append(f'            <a class="pb-go" href="{esc(c["href"])}">{label}</a>\n')
    out.append('          </figcaption>\n        </figure>\n      </li>\n')
    return "".join(out)


def main():
    data = json.loads(DATA.read_text())
    consented = consented_photos()
    editions = data.get("editions") or die("data/pebble-board.json has no editions.")
    cur = next((e for e in editions if e.get("state") == "current"), None)
    if cur is None:
        die("no edition is marked \"state\": \"current\", so there is nothing on the board.")

    secs = cur.get("sections") or die("the current edition has no sections.")
    i, parts = 0, []
    for s in secs:
        if not s.get("cards"):
            die(f"the section {s.get('id')!r} has no cards and would render as a tab over nothing.")
        tape = TAPE.get(s["id"]) or die(f"the section {s['id']!r} has no tape colour in TAPE.")
        parts.append(f'    <section class="pb-spread" id="pb-{s["id"]}" style="--pb-tape:{tape};">\n')
        parts.append(f'      <h2 class="pb-tab">{esc(s["tab"])}</h2>\n')
        parts.append('      <ul class="pb-pins">\n')
        for c in s["cards"]:
            parts.append(card_html(c, cur, i, consented))
            i += 1
        parts.append('      </ul>\n    </section>\n')

    m = cur.get("memory")
    if m:
        quote = "".join(f"            <p>&ldquo;{esc(q)}&rdquo;</p>\n" for q in m["quote"])
        parts.append(
            '    <section class="pb-memory">\n      <div class="pb-memcard">\n'
            '        <span class="pb-tack" aria-hidden="true"></span>\n'
            f'        <p class="pb-memkicker">{esc(m["kicker"])}</p>\n'
            f'        <h2>{esc(m["name"])}</h2>\n'
            f'        <p class="pb-memwho">{esc(m["credit"])}</p>\n'
            f'        <blockquote>\n{quote}'
            f'            <p>&mdash; {esc(m["closer"])}</p>\n        </blockquote>\n'
            f'        <a class="pb-go" href="{esc(m["href"])}">Read the full tribute &rarr;</a>\n'
            '      </div>\n    </section>\n')

    toc = "".join(
        f'    <li><a href="#pb-{s["id"]}">{esc(s["tab"])}</a></li>\n' for s in secs)

    past = [e for e in editions if e.get("state") != "current"]
    if past:
        rack = ('      <p>Editions that have come down off the board.</p>\n      <ul>\n'
                + "".join(f'        <li><a href="pebble-board-{esc(e["slug"])}.html">'
                          f'{esc(e["title"])}</a> &mdash; collected {esc(e["gathered_on"])}</li>\n'
                          for e in past) + '      </ul>\n')
    else:
        rack = ('      <p>Nothing has come down off the board yet. When the next gathering '
                'pins a new edition up, this one moves down here and keeps its own page. '
                'An empty rack is what a board that has had one edition actually looks '
                'like.</p>\n')

    # The cover is generated too, because it is the EDITION's and not the
    # board's: the title, the hand, the keeper's name and the date all change
    # when the paper does, and a hand-typed cover is the one part that would
    # still say "Summer" after the autumn board went up.
    for f in ("title", "tagline", "note", "keeper", "gathered_on"):
        if not cur.get(f):
            die(f"the current edition has no {f!r}, and the cover is built from it.")
    cover = (
        f'      <p class="pb-kicker">{esc(cur["keeper"])} &middot; keeper of this edition</p>\n'
        f'      <h1>{esc(cur["title"])}</h1>\n'
        f'      <p class="pb-slug">{esc(cur["tagline"])}</p>\n'
        f'      <p class="pb-lede">{esc(cur["note"])}</p>\n'
        f'      <p class="pb-sign">{esc(cur["keeper"])}'
        f'<small>{esc(cur.get("keeper_role", ""))}</small></p>\n'
        f'      <p class="pb-when">Collected {esc(cur["gathered_on"])} '
        f'&middot; pinned up {esc(cur.get("published_on", ""))}</p>\n')

    src = PAGE.read_text()
    blocks = (("cover", cover), ("spreads", "".join(parts)), ("toc", toc), ("rack", rack))
    for name, _ in blocks:
        if f"<!-- pb-{name}:begin -->" not in src:
            die(f"{PAGE.name} has no <!-- pb-{name}:begin --> marker, so there is nowhere\n"
                "to build that part of the board.")
    for name, block in blocks:
        src = re.sub(rf"(<!-- pb-{name}:begin -->).*?(<!-- pb-{name}:end -->)",
                     lambda m, b=block: m.group(1) + "\n" + b + "  " + m.group(2),
                     src, flags=re.S)
    PAGE.write_text(src)

    drops = len(cur.get("dropped", []))
    print(f"pebble board: {i} pinned across {len(secs)} spreads"
          + (f", {drops} recorded as dropped" if drops else "")
          + f", {len(past)} in the rack.")


if __name__ == "__main__":
    main()
