#!/usr/bin/env python3
"""Build the Mopery's bookcases, its parlour screen and its Raven nook, and their credits.

ONE DATA FILE, ONE TOOL, TWO SURFACES -- the contract make-chappell.py,
make-den.py, make-hermitage.py and make-club.py all keep. The room and the liner
notes move together or a credit goes quietly stale in the place nobody re-reads.

THREE KINDS OF THING FROM THREE PLACES and the data file says which is which.
The novels are a second-hand shop's stock, chosen by Ryan; the versions of one
song came off YouTube and were each checked on their own watch page; the poem is
Poe's and was transcribed from a public domain text. A merged provenance note
would be one sentence claiming work it never did.

WHAT IT REFUSES, and why each one is a bug that does not announce itself:

  - A BOOK WITH NO WORK RECORD. The borrow link is built from it, and a shelf
    that can only tell you where to BUY is a shop with an argument painted on
    it -- our own library page says access to knowledge is mutual aid. This is
    the Hermitage's rule and it is the site's rather than that room's.
  - THE SAME BOOK ON TWO SHELVES. One work id twice is one book wearing two
    shelf cards, which reads as two books and is not.
  - A SPINE COLOUR LOVE.CSS HAS NO RULE FOR. This one is particular to this
    room: the spines are coloured by a modifier class, so a typo does not
    error -- it renders an unstyled transparent book with dark text on a dark
    shelf, which is invisible rather than wrong. The stylesheet is the list of
    colours that exist, so the stylesheet is what gets asked.
  - A CUT THAT DOES NOT NAME THE WRITERS. The Den's rule, arriving where it
    bites harder: every one of these but the first is a cover, the performer's
    name is the entire draw, and a wall of covers is precisely where crediting
    only the voice would pass unnoticed. Jagger and Richards wrote it and none
    of these people did.
  - A CUT WITH NO RUNTIME. Every press-to-play control on this street says how
    long it runs BEFORE the press, because that number is what lets somebody
    decide. Same promise as make-chappell.py's and make-hermitage.py's, and the
    exact inverse of make-jungle.py's, which refuses a runtime because a live
    camera has no length to give.
  - AN ID THAT IS NOT A YOUTUBE ID. love-embed.js validates before it builds an
    iframe and returns QUIETLY, so a typo is not an error anywhere: it is a
    button somebody presses and presses that never becomes a video.
  - A STANZA OF THE RAVEN THAT IS NOT SIX LINES. The poem is eighteen sixains
    and its shape IS its metre; a line dropped in transcription reads as a
    stanza that scans oddly rather than as a fault, which is the quietest way
    to publish somebody else's poem wrongly.
  - MARKERS WITH NO DATA, OR DATA WITH NO MARKERS, in either surface.
"""
import html
import json
import re
import sys
from pathlib import Path

import imgsize           # tools/imgsize.py: width and height read off the file

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data/mopery.json"
ROOM = ROOT / "the-mopery.html"
NOTES = ROOT / "liner-notes.html"
CSS = ROOT / "love.css"

YT = re.compile(r"^[A-Za-z0-9_-]{11}$")
WORK = re.compile(r"^OL\d+W$")
# The two names every cut on that screen has to carry. Written out rather than
# looked up, because the point of the check is that they cannot be forgotten.
WROTE = ("Jagger", "Richards")

OL = "https://openlibrary.org/works/"
# Searches rather than product pages, on purpose: see _ids in data/mopery.json.
LIB = "https://search.worldcat.org/search?q="
SHOP = "https://bookshop.org/search?keywords="


def esc(s):
    return html.escape(s, quote=False)


def q(s):
    return html.escape(s, quote=True)


def url(s):
    from urllib.parse import quote
    return quote(s, safe="")


def swap(page, marker, block, indent=""):
    begin, end = f"<!-- {marker}:begin -->", f"<!-- {marker}:end -->"
    src = page.read_text()
    if begin not in src or end not in src:
        raise SystemExit(
            f"REFUSING: {page.name} has no {marker} markers, so there is nowhere\n"
            "to write. Add them on purpose rather than letting this tool render nothing."
        )
    new = re.sub(re.escape(begin) + r".*?" + re.escape(end),
                 lambda m: begin + "\n" + block + "\n" + indent + end, src, flags=re.S)
    page.write_text(new)


def spine_colours():
    """Every .mop-spine--NAME the stylesheet actually has a rule for."""
    return set(re.findall(r"\.mop-spine--([a-z0-9-]+)", CSS.read_text()))


def check(data):
    bad = []
    shelves = data.get("shelves") or []
    cuts = data.get("cuts") or []
    raven = data.get("raven") or {}

    if not shelves:
        bad.append("data/mopery.json has no shelves, and the library is made of them.")
    if not cuts:
        bad.append("data/mopery.json has no cuts, and the parlour is a screen with nothing on it.")

    have = spine_colours()
    seen_work, seen_title = set(), set()
    for sh in shelves:
        name = (sh.get("card") or "").strip() or "<unnamed shelf>"
        if not (sh.get("slug") or "").strip():
            bad.append(f"the shelf {name!r} has no slug.")
        if not (sh.get("sub") or "").strip():
            bad.append(f"the shelf {name!r} has no card under its name.")
        books = sh.get("books") or []
        if not books:
            bad.append(f"the shelf {name!r} has no books on it, which renders as a "
                       "card over an empty board.")
        for b in books:
            t = (b.get("title") or "").strip()
            if not t:
                bad.append(f"a book on {name!r} has no title.")
                continue
            if t in seen_title:
                bad.append(f"{t!r} is on the shelves twice.")
            seen_title.add(t)
            for field, why in (("author", "no author"),
                               ("year", "no year"),
                               ("note", "nothing to open to; every spine here opens to a note"),
                               ("shelftalker", "no shelf-talker")):
                if not (b.get(field) or "").strip():
                    bad.append(f"{t!r} has {why}.")
            w = (b.get("work") or "").strip()
            if not WORK.match(w):
                bad.append(f"{t!r} has {w!r}, which is not an Open Library work id — "
                           "so there is no way to borrow it, and access is the point.")
            elif w in seen_work:
                bad.append(f"{w} is used twice; one work id is one book.")
            else:
                seen_work.add(w)
            sp = (b.get("spine") or "").strip()
            if sp not in have:
                bad.append(f"{t!r} asks for the spine colour {sp!r}, which love.css §22 has "
                           "no rule for. An unstyled spine is invisible rather than wrong.")

    ids = set()
    for c in cuts:
        vid = (c.get("id") or "").strip()
        title = (c.get("title") or "").strip() or vid or "<untitled>"
        if not YT.match(vid):
            bad.append(f"{title!r} has {vid!r}, which is not a YouTube id — "
                       "love-embed.js would refuse it silently.")
        if vid in ids:
            bad.append(f"{vid} appears twice.")
        ids.add(vid)
        if not (c.get("channel") or "").strip():
            bad.append(f"{title!r} has no channel; none of these is ours.")
        if not (c.get("length") or "").strip() or not (c.get("spoken") or "").strip():
            bad.append(f"{title!r} has no runtime. Every control here says how long "
                       "it runs before it is pressed.")
        if not (c.get("note") or "").strip():
            bad.append(f"{title!r} has no note.")
        if c.get("how") not in ("screen", "link"):
            bad.append(f"{title!r} is neither a screen nor a door. Playing and "
                       "embedding are two different permissions and an owner can "
                       "switch the second off without touching the first.")
        if c.get("how") == "link" and not (c.get("why_link") or "").strip():
            bad.append(f"{title!r} is a door out and does not say why on its own face.")
        writers = (c.get("writers") or "")
        if not all(n in writers for n in WROTE):
            bad.append(f"{title!r} does not name the people who wrote the song. "
                       "Of everything on that screen only one is the writers' own band.")

    stanzas = raven.get("stanzas") or []
    n_st = len(stanzas)
    plates = raven.get("dore") or []
    if not plates:
        bad.append("the Raven nook has no plates, and the room publishes the 1884 edition's.")
    for pl in plates:
        f = (pl.get("file") or "").strip()
        if not f:
            bad.append("a plate has no file.")
        elif not (ROOT / f).exists():
            bad.append(f"the plate {f} is not in the repository; a missing file renders "
                       "as an empty box rather than an error.")
        if not (pl.get("alt") or "").strip():
            bad.append(f"the plate {f} has no alt text. A wood engraving with nothing "
                       "written about it is a blank rectangle to anybody who cannot see it.")
        at = pl.get("after")
        # 0 puts a plate in front of the poem and n_st + 1 puts it after the last
        # stanza; anything else would render nowhere at all, silently, which is
        # the one failure this loop exists for.
        if not isinstance(at, int) or not (0 <= at <= n_st + 1):
            bad.append(f"the plate {f} sits after stanza {at!r}, which is not a place in "
                       f"a poem of {n_st} stanzas. It would render nowhere at all.")

    scan = raven.get("scan") or {}
    if not scan.get("leaves"):
        bad.append("the Raven nook has no scanned leaves beside the text.")
    for field in ("item", "imprint", "holder", "licence", "licence_url"):
        if not (scan.get(field) or "").strip():
            bad.append(f"the 1865 scan has no {field}. A scan this site REPRODUCES has to "
                       "carry the statement that says it may be — that is the whole "
                       "difference between it and the facsimile it replaced.")
    for lf in scan.get("leaves") or []:
        f = (lf.get("file") or "").strip()
        if not f or not (ROOT / f).exists():
            bad.append(f"the leaf {f!r} is not in the repository.")
        if not (lf.get("alt") or "").strip():
            bad.append(f"the leaf {f} has no alt text.")
        if not (lf.get("what") or "").strip():
            bad.append(f"the leaf {f} does not say what it is.")

    if not stanzas:
        bad.append("the Raven nook has no poem in it.")
    for n, st in enumerate(stanzas, 1):
        if len(st) != 6:
            bad.append(f"stanza {n} of The Raven has {len(st)} lines and not six. "
                       "The shape of that poem is its metre.")
    for field in ("title", "author", "first_published", "text_source", "text_url", "facsimile"):
        if not (raven.get(field) or "").strip():
            bad.append(f"The Raven has no {field}.")

    if bad:
        print("REFUSING to build the Mopery:\n")
        for b in bad:
            print("  · " + b)
        print("\nFix the data rather than this tool. Each of these is a thing that would\n"
              "render as a page that looks finished.")
        sys.exit(1)


def record_html(b, rid):
    """A book's whole record, as real markup on the page.

    THE DIALOG IS A CLONE OF THIS AND NOT A SECOND COPY OF THE DATA. Building
    the popup out of data-* attributes would mean the same note living twice in
    one document, which is how a shelf ends up saying one thing and its popup
    another. It also means the page still works with the script switched off:
    the records are [hidden], and the <noscript> in the head of the room unhides
    them and takes the spines out of the tab order, so somebody with no
    JavaScript gets a plain catalogue instead of a wall of buttons that do
    nothing."""
    find = url(b["title"] + " " + b["author"])
    return "\n".join([
        f'        <article class="mop-record" id="{rid}" hidden>',
        f'          <h4>{esc(b["title"])}</h4>',
        f'          <p class="mop-sheet__by">{esc(b["author"])} &middot; {esc(b["year"])}</p>',
        f'          <p class="mop-sheet__note">{esc(b["note"])}</p>',
        f'          <p class="mop-sheet__talker">{esc(b["shelftalker"])}</p>',
        f'          <div class="mop-sheet__get">',
        f'            <h3>Where to get it</h3>',
        f'            <ul>',
        f'              <li><a href="{q(OL + b["work"])}">Borrow or read it at Open Library</a>'
        f'<em>The catalogue record. Its work id was resolved against Open Library&rsquo;s '
        f'own search rather than assembled from the title.</em></li>',
        f'              <li><a href="{q(LIB + find)}">Find it in a library near you</a>'
        f'<em>WorldCat, searched for the title and the author.</em></li>',
        f'              <li><a href="{q(SHOP + find)}">Buy it from an independent shop</a>'
        f'<em>Bookshop.org, searched the same way. A search and not a product id, '
        f'because a product id nobody could check is how a reader gets sent to the '
        f'wrong book with a citation&rsquo;s confidence.</em></li>',
        f'            </ul>',
        f'          </div>',
        f'        </article>',
    ])


def shelves_block(data):
    out = []
    n = 0
    for sh in data["shelves"]:
        out.append(f'    <section class="mop-case">')
        out.append('      <div class="mop-candles" aria-hidden="true">'
                   + "".join('<span class="mop-candle"><span></span></span>' for _ in range(11))
                   + "</div>")
        out.append(f'      <h3 class="mop-card">{esc(sh["card"])}</h3>')
        out.append(f'      <p>{esc(sh["sub"])}</p>')
        out.append('      <div class="mop-shelf">')
        rids = []
        for b in sh["books"]:
            n += 1
            rid = f"book-{n}"
            rids.append((rid, b))
            out.append(
                f'        <button type="button" class="mop-spine mop-spine--{b["spine"]}"'
                f' data-record="{rid}">'
                f'<b>{esc(b["title"])}</b> <i>{esc(b["author"])}</i></button>')
        out.append("      </div>")
        out.append('      <div class="mop-records">')
        for rid, b in rids:
            out.append(record_html(b, rid))
        out.append("      </div>")
        out.append("    </section>")
    return "\n".join(out)


def cuts_block(data):
    out = ['    <ol class="mop-cuts" id="mopery-cuts-list">']
    for n, c in enumerate(data["cuts"], 1):
        out.append(
            f'      <li class="mop-cut" data-id="{q(c["id"])}" data-title="{q(c["title"])}"'
            f' data-runs="{q(c["length"])}" data-spoken="{q(c["spoken"])}"'
            f' data-how="{q(c["how"])}">')
        out.append(f'        <span class="mop-cut__who">{esc(c["title"])}</span>')
        out.append(f'        <span class="mop-cut__sub">{esc(c["sub"])}</span>')
        out.append(f'        <span class="mop-cut__runs">{esc(c["length"])}</span>')
        out.append(f'        <button type="button" class="mop-tune" data-cut="{n}">'
                   f'Put this on <span class="sr">&mdash; {esc(c["title"])}, '
                   f'{esc(c["spoken"])}</span></button>')
        out.append(f'        <span class="mop-cut__note">{esc(c["note"])}</span>')
        if c["how"] == "link":
            out.append(f'        <span class="mop-cut__note">{esc(c["why_link"])}</span>')
        out.append(f'        <span class="mop-cut__wrote">Written by {esc(c["writers"])} '
                   f'&middot; performed on {esc(c["channel"])}</span>')
        out.append("      </li>")
    out.append("    </ol>")
    return "\n".join(out)


def plate_html(pl):
    """One of Dore's engravings, where its own caption says it belongs.

    THE PLACING IS OURS AND THE PAGE SAYS SO. The 1884 edition printed the poem
    straight through and put the plates after it, each with a caption quoting
    the lines it illustrates; here each plate sits at the lines it quotes, which
    is a reading decision rather than a reproduction. The caption is verbatim."""
    cap = (pl.get("caption") or "").strip()
    fig = ['      <figure class="mop-plate">',
           f'        <img src="{q(pl["file"])}" {imgsize.attrs(ROOT / pl["file"])} alt="{q(pl["alt"])}" loading="lazy" decoding="async">']
    if cap:
        fig.append(f'        <figcaption>{esc(cap)}</figcaption>')
    fig.append("      </figure>")
    return "\n".join(fig)


# ── The Raven nook's picker ─────────────────────────────────────────────────
# THIS USED TO BE HAND-KEPT MARKUP AND THE ROOM'S CLAIM HAD GONE QUIETLY FALSE.
# The nook says the picker holds every typeface on this street and llms.txt says
# the poem can be set in any face on it, and by the time anybody looked,
# EIGHTEEN families were missing from it -- every face added since the last time
# somebody remembered to come back here. Nothing warned, because adding a font
# to fonts/ and adding an <option> in this room are two edits in two places and
# only one of them is obviously required.
#
# So the list is not restated here any more, it is READ: the same
# data/foundry-faces.json record The Foundry's shelves are built from, with the
# room labels out of data/foundry.json. When something has to agree in several
# places, make the others read it rather than write it out again -- which is the
# lesson love-embed.js's ORIGINS array already carries for the framed origins.
# tools/check-faces.py then reads this room's PUBLISHED markup, not this
# function, because a checker that re-derived the answer from the generator
# would only be testing that Python is deterministic.
#
# THE THREE GROUPS ARE STILL THIS ROOM'S OWN and are worked out rather than
# typed: what this room sets, what shouts, and everything else. The nook opens
# in IM Fell English, which is the face the poem is printed in above it.
FACES = ROOT / "data/foundry-faces.json"
FOUNDRY = ROOT / "data/foundry.json"
FALLBACK = {"Serif": "Georgia, serif", "Sans Serif": "sans-serif",
            "Monospace": "monospace", "Handwriting": "cursive",
            "Display": "sans-serif"}
OPENS_AT = "IM Fell English"


def picker_block():
    faces = json.loads(FACES.read_text())["faces"]
    where = json.loads(FOUNDRY.read_text())["faces"]
    groups = {"This room": [], "Shouting": [], "Elsewhere on the street": []}
    for slug, rec in sorted(faces.items(), key=lambda kv: kv[1]["family"].lower()):
        line = where.get(slug)
        if not line:
            raise SystemExit(
                f"REFUSING: data/foundry.json has no line for {rec['family']}, so this\n"
                "picker cannot say where it lives. Run tools/pull-foundry.py, then add it."
            )
        if line["page"] == "the-mopery.html":
            group = "This room"
        elif rec["category"] == "Display":
            group = "Shouting"
        else:
            group = "Elsewhere on the street"
        groups[group].append((rec, line))

    out = []
    for name in ("This room", "Shouting", "Elsewhere on the street"):
        out.append(f'            <optgroup label="{esc(name)}">')
        for rec, line in groups[name]:
            value = f"'{rec['family']}', {FALLBACK[rec['category']]}"
            label = esc(rec["family"])
            if line["page"] != "the-mopery.html":
                label += " &mdash; " + esc(line["where"])
            sel = " selected" if rec["family"] == OPENS_AT else ""
            out.append(f'              <option value="{q(value)}"{sel}>{label}</option>')
        out.append("            </optgroup>")
    return "\n".join(out)


def raven_block(data):
    raven = data["raven"]
    at = {}
    for pl in raven.get("dore") or []:
        at.setdefault(pl["after"], []).append(pl)
    out = [plate_html(pl) for pl in at.get(0, [])]
    for n, st in enumerate(raven["stanzas"], 1):
        lines = []
        for line in st:
            t = esc(line["t"])
            lines.append(f'<span class="mop-in">{t}</span>' if line["in"] else t)
        out.append("      <p>" + "<br>\n      ".join(lines) + "</p>")
        out += [plate_html(pl) for pl in at.get(n, [])]
    out += [plate_html(pl) for pl in at.get(len(raven["stanzas"]) + 1, [])]
    return "\n".join(out)


def scan_block(data):
    sc = data["raven"]["scan"]
    # str.capitalize() lowercases everything after the first letter, which turned
    # Scattergood's own name into a common noun on the page. Only the first
    # character moves.
    lead = esc(sc["illustrations"])
    lead = lead[:1].upper() + lead[1:]
    out = [
        f'    <h3 class="mop-scan__head">{esc(sc["title"])}, {esc(sc["imprint"])}</h3>',
        f'    <p class="mop-scan__why">{lead}. Scanned by {esc(sc["holder"])} and '
        f'published by the Internet Archive under the '
        f'<a href="{q(sc["licence_url"])}">{esc(sc["licence"])}</a> \u2014 an explicit '
        f'statement that it may be reproduced, which is why these leaves are here '
        f'rather than only linked to.</p>',
    ]
    for lf in sc["leaves"]:
        out.append('    <figure class="mop-leafshot">')
        out.append(f'      <img src="{q(lf["file"])}" {imgsize.attrs(ROOT / lf["file"])} alt="{q(lf["alt"])}" '
                   f'loading="lazy" decoding="async">')
        out.append(f'      <figcaption>{esc(lf["what"])}</figcaption>')
        out.append("    </figure>")
    out.append(f'    <p class="mop-scan__out"><a href="{q(sc["item"])}">'
               f'The whole book at the Internet Archive \u2192</a></p>')
    return "\n".join(out)


def credits_block(data):
    """The liner notes. Every author, every channel, every source, once."""
    # The <h2> above this block in liner-notes.html already names the room.
    out = []
    out.append('  <p><strong>The shelves.</strong> Nine novels, and the only room on this '
               'street whose books are not ones our own pages already argue from. '
               'Every one belongs to the person who wrote it; the notes and the '
               'shelf-talkers are ours.</p>')
    out.append("  <ul>")
    for sh in data["shelves"]:
        for b in sh["books"]:
            out.append(f'    <li><em>{esc(b["title"])}</em> &mdash; {esc(b["author"])}, '
                       f'{esc(b["year"])}. '
                       f'<a href="{q(OL + b["work"])}">Open Library</a></li>')
    out.append("  </ul>")
    out.append('  <p><strong>The parlour screen.</strong> One song, several times over. '
               '&ldquo;Paint It, Black&rdquo; was written by <strong>Mick Jagger and '
               'Keith Richards</strong> and released by the Rolling Stones on '
               '<em>Aftermath</em> in 1966; the arrangement nearly every version below '
               'is answering was written for Netflix&rsquo;s <em>Wednesday</em> by '
               '<strong>Danny Elfman and Chris Bacon</strong>. Nothing is hosted here '
               'and nothing loads until you press it.</p>')
    out.append("  <ul>")
    for c in data["cuts"]:
        out.append(f'    <li><strong>{esc(c["title"])}</strong> &mdash; {esc(c["sub"])}, '
                   f'{esc(c["length"])}, on {esc(c["channel"])}. '
                   f'Written by {esc(c["writers"])}.</li>')
    out.append("  </ul>")
    r = data["raven"]
    sc = r["scan"]
    out.append(f'  <p><strong>The reading nook.</strong> <em>{esc(r["title"])}</em> is '
               f'{esc(r["author"])}&rsquo;s, first published in {esc(r["first_published"])}, '
               f'and out of copyright everywhere. Our text was transcribed from '
               f'<a href="{q(r["text_url"])}">{esc(r["text_source"])}</a>. '
               f'<strong>The twenty-six engravings are Gustave Dor&eacute;&rsquo;s</strong>, '
               f'made for the 1884 edition and published after his death in 1883, so they '
               f'are out of copyright everywhere. Ours came from '
               f'<a href="https://www.gutenberg.org/ebooks/17192">Project Gutenberg&rsquo;s '
               f'ebook #17192</a>. <strong>Where each one sits is our decision and the room '
               f'says so</strong>: that edition printed the poem straight through and the '
               f'plates after it, and here each plate stands at the lines its own caption '
               f'quotes. The captions are printed verbatim, which is how a reader can see '
               f'that the 1884 text is not quite the one we set beside it.</p>')
    out.append(f'  <p><strong>The scanned book</strong> is <em>{esc(sc["title"])}</em>, '
               f'{esc(sc["imprint"])}, {esc(sc["illustrations"])} &mdash; digitised by '
               f'{esc(sc["holder"])} and published by the Internet Archive under the '
               f'<a href="{q(sc["licence_url"])}">{esc(sc["licence"])}</a>. '
               f'<a href="{q(sc["item"])}">The whole book is there</a>; three leaves of it '
               f'are shown in the room. <strong>A separate facsimile of the poem in '
               f'Poe&rsquo;s own hand is linked and not copied</strong>, at '
               f'<a href="{q(r["facsimile"])}">the Library of Congress</a>: that printing '
               f'was made in 1949 and carries a reproduction notice on its own first leaf, '
               f'and this site does not relicense other people&rsquo;s assets by copying '
               f'them. One explicit licence and one notice saying no; the room shows the '
               f'first and points at the second. The typefaces in the picker belong to '
               f'their own designers, under the SIL Open Font License or Apache 2.0 '
               f'face by face, and are listed above.</p>')
    return "\n".join(out)


def main():
    data = json.loads(DATA.read_text())
    check(data)
    swap(ROOM, "mopery-shelves", shelves_block(data), "  ")
    swap(ROOM, "mopery-cuts", cuts_block(data), "  ")
    swap(ROOM, "mopery-picker", picker_block(), "          ")
    swap(ROOM, "mopery-raven", raven_block(data), "    ")
    swap(ROOM, "mopery-scan", scan_block(data), "  ")
    swap(NOTES, "mopery-credits", credits_block(data), "")
    books = sum(len(s["books"]) for s in data["shelves"])
    print(f"the-mopery.html: {books} books on {len(data['shelves'])} shelves, "
          f"{len(data['cuts'])} cuts, {len(data['raven']['stanzas'])} stanzas, "
          f"{len(data['raven']['dore'])} plates, "
          f"{len(data['raven']['scan']['leaves'])} scanned leaves")
    print("liner-notes.html: credits rewritten from the same file")


if __name__ == "__main__":
    main()
