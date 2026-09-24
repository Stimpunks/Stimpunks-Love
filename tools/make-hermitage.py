#!/usr/bin/env python3
"""Build the Solarpunk Hermitage's shelves and its campfire, and their credits.

ONE DATA FILE, ONE TOOL, TWO SURFACES -- the contract make-chappell.py and
make-den.py keep. The room and the liner notes move together or a credit goes
quietly stale in the place nobody re-reads.

TWO KINDS OF THING FROM TWO PLACES, and the file says which is which. The books
are ones our own site already cites, with the citing page read out of the
Knowledge System mirror's own frontmatter; the documentaries are Ryan's list,
with every id checked on its own watch page. A merged provenance note covering
both would be one sentence claiming work it never did.

WHAT IT REFUSES, and why each one is a bug that does not announce itself:

  - A BOOK WITH NO BORROW LINK. Our own library page says knowledge is
    infrastructure and access to it is mutual aid. A shelf that can only tell
    you where to BUY a book is a shop with an argument painted on it, and the
    way that happens is not a decision -- it is somebody adding a title in a
    hurry with the easier link to hand. A buy link is optional; this is not.
  - A BOOK WITH NO CITING PAGE. Every title here is on this shelf because
    stimpunks.org already argues from it. One that is not is a book somebody
    liked, which is a different and much larger shelf.
  - A DOCUMENTARY WITH NO RUNTIME. Every press-to-play control on this street
    says how long it runs BEFORE the press, because that number is what lets
    somebody decide. This is the exact inverse of make-jungle.py, which refuses
    a cam that HAS one -- a live camera has no length to give and a film does,
    and the two tools are keeping the same promise. Do not make them agree.
  - AN ID THAT IS NOT A YOUTUBE ID. love-embed.js validates before it builds an
    iframe and returns QUIETLY, so a typo is not an error anywhere: it is a
    button somebody presses and presses that never becomes a video.
  - A LINK-OUT WITH NO REASON ON IT. Playing and embedding are two different
    permissions. A doc published as a door rather than a screen has to say why
    on its own face, or it reads as an inconsistency somebody forgot to fix.
  - MARKERS WITH NO DATA, OR DATA WITH NO MARKERS, in either surface.
"""
import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data/hermitage.json"
ROOM = ROOT / "solarpunk-hermitage.html"
NOTES = ROOT / "liner-notes.html"

YT = re.compile(r"^[A-Za-z0-9_-]{11}$")
MOJIBAKE = re.compile("[\u00c2\u00c3][\u0080-\u00bf]|\u00e2[\u0080-\u009f\u20ac]")
# The second word of a two-word specimen name, when that name is plain English
# rather than Latin. Short on purpose: it is read as a declaration, so adding to
# it should feel like a decision rather than like silencing a tool.
PLAIN = {"rhizome", "frond", "cushion", "mat", "spore", "seed", "leaf", "bark",
         "root", "stem", "cone", "catkin"}


def esc(s):
    return html.escape(s, quote=False)


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


def check(data):
    bad = []
    books = data.get("books") or []
    docs = data.get("docs") or []
    if not books:
        bad.append("data/hermitage.json has no books, and the cave is a room made of them.")
    if not docs:
        bad.append("data/hermitage.json has no documentaries, and the campfire is where they go.")

    seen = set()
    for b in books:
        t = (b.get("title") or "").strip()
        if not t:
            bad.append("a book with no title.")
            continue
        if t in seen:
            bad.append(f"{t!r} is on the shelf twice.")
        seen.add(t)
        if not (b.get("author") or "").strip():
            bad.append(f"{t!r} has no author.")
        if not (b.get("note") or "").strip():
            bad.append(f"{t!r} opens to nothing; every spine here opens to a note.")
        if not (b.get("borrow") or "").strip():
            bad.append(f"{t!r} has no borrow link. Access is the point; buying is the fallback.")
        if not (b.get("source") or "").strip():
            bad.append(f"{t!r} has no citing page on stimpunks.org.")

    ids = set()
    for d in docs:
        vid = (d.get("id") or "").strip()
        title = (d.get("title") or "").strip() or vid or "<untitled>"
        if not YT.match(vid):
            bad.append(f"{title!r} has {vid!r}, which is not a YouTube id — "
                       "love-embed.js would refuse it silently.")
        if vid in ids:
            bad.append(f"{vid} appears twice.")
        ids.add(vid)
        if not (d.get("channel") or "").strip():
            bad.append(f"{title!r} has no channel; none of these is ours.")
        if not (d.get("length") or "").strip() or not (d.get("spoken") or "").strip():
            bad.append(f"{title!r} has no runtime. Every control here says how long "
                       "it runs before it is pressed.")
        if d.get("how") not in ("screen", "link"):
            bad.append(f"{title!r} is neither a screen nor a door.")
        if d.get("how") == "link" and not (d.get("why_link") or "").strip():
            bad.append(f"{title!r} is a door out and does not say why on its own face.")

    for b in data.get("beanbags") or []:
        t = (b.get("term") or "").strip() or "<unnamed chair>"
        for k in ("colour", "hex", "on_it", "note"):
            if not (b.get(k) or "").strip():
                bad.append(f"the {t} chair has no {k}.")
        if not (b.get("source") or "").strip():
            bad.append(f"the {t} chair names no page of ours. A chair with an invented "
                       "hobby on it is set dressing, and nothing else in this room is.")

    for sp in data.get("herbarium") or []:
        n = (sp.get("name") or "").strip() or "<unnamed sheet>"
        if not n or n == "<unnamed sheet>":
            bad.append("a herbarium sheet with no name.")
        if not (sp.get("note") or "").strip():
            bad.append(f"the {n} sheet opens to nothing.")
        if not (sp.get("source") or "").strip():
            bad.append(f"the {n} sheet has no page of ours behind it. A specimen without "
                       "one is a plant somebody liked, which is a different table.")
        # A HERBARIUM SHEET'S ONE CLAIM TO AUTHORITY IS ITS NAME, so a binomial
        # typed from memory is the worst thing that can go on one: it reads as
        # determined when it was guessed. Nothing here is named to species.
        #
        # THE FIRST VERSION OF THIS CHECK WAS A LIST OF LATIN ENDINGS AND IT
        # LEAKED, which is why it is not that any more. It missed Taraxacum
        # officinale -- the single most likely binomial to end up on this table
        # -- then missed Sphagnum capillifolium and Cladonia rangiferina after
        # two rounds of widening, and every widening walked it closer to firing
        # on ordinary prose ("ans" catches Native Americans, "ula" catches The
        # formula). A tripwire that is allowed to miss AND at risk of crying
        # wolf is the worst of both.
        #
        # SO THE SHAPE IS THE CHECK, and the English words are the allowlist. A
        # binomial is Genus epithet: one capitalised word, one lowercase word.
        # Every plain name we actually use has that shape too -- Bamboo rhizome,
        # Fern frond -- so the second word has to be one we have declared. That
        # catches EVERY binomial rather than the ones somebody anticipated, and
        # the cost is one word added on purpose when a new plain name arrives.
        m = re.match(r"^[A-Z][a-z]+ ([a-z]+)$", n)
        if m and m.group(1) not in PLAIN:
            bad.append(f"the {n!r} sheet is shaped like a binomial and {m.group(1)!r} is "
                       "not a word this table has declared. Nothing in this herbarium is "
                       "determined to species. If it is a plain English name, add the word "
                       "to PLAIN on purpose.")

    for v in data.get("solar_watch") or []:
        t = (v.get("title") or "").strip() or "<untitled>"
        if not YT.match((v.get("id") or "").strip()):
            bad.append(f"{t!r} on the solar bench has an id love-embed.js would refuse silently.")
        if not (v.get("length") or "").strip() or not (v.get("spoken") or "").strip():
            bad.append(f"{t!r} on the solar bench has no runtime.")
        if not (v.get("channel") or "").strip():
            bad.append(f"{t!r} on the solar bench has no channel; none of these is ours.")

    for r in data.get("solar_read") or []:
        t = (r.get("title") or "").strip() or "<untitled>"
        if not (r.get("url") or r.get("borrow") or "").strip():
            bad.append(f"{t!r} on the solar bench goes nowhere.")
        if not (r.get("source") or "").strip():
            bad.append(f"{t!r} on the solar bench has no page of ours behind it.")

    for piece in data.get("starstuff") or []:
        t = (piece.get("title") or "").strip() or "<untitled>"
        u = (piece.get("url") or "").strip()
        if not u.startswith("https://starstuff.earth/"):
            bad.append(f"{t!r} is on the Star Stuff table and does not point at "
                       "starstuff.earth. A table with somebody's name on it holding "
                       "something else is a mis-filed thing that reads as a claim.")
        if not (piece.get("what") or "").strip() or not (piece.get("why") or "").strip():
            bad.append(f"{t!r} does not say what it is, or why it is on this bench.")

    # TEXT DECODED TWICE IS REFUSED, WHEREVER IT IS IN THIS FILE. A title read
    # off a YouTube watch page in the wrong encoding arrives as three Latin-1
    # characters where one curly apostrophe should be -- "World" then a-circumflex
    # and two control characters, then "s Shores" -- and it was published that
    # way on the campfire's listing and in the liner notes until 2026-09-24, in
    # a title whose whole claim is that it is YouTube's own words. YouTube's page
    # had the apostrophe right; the fault was ours. The pattern is the UTF-8 lead
    # bytes of the punctuation and accented letters these titles actually carry,
    # read as Latin-1, so it cannot fire on a real word.
    def strings(o, where):
        if isinstance(o, dict):
            for k, v in o.items():
                yield from strings(v, f"{where}.{k}")
        elif isinstance(o, list):
            for i, v in enumerate(o):
                yield from strings(v, f"{where}[{i}]")
        elif isinstance(o, str):
            yield where, o
    for where, text in strings(data, "hermitage.json"):
        m = MOJIBAKE.search(text)
        if m:
            bad.append(f"{where} has {text[max(0, m.start() - 16):m.end() + 8]!r}, which is "
                       "text decoded twice. Read it again off its own page, in UTF-8.")

    return bad


def shelves(books):
    out = []
    for b in books:
        links = [f'<a href="{esc(b["borrow"])}">Borrow or read it &rarr;</a>']
        if b.get("buy"):
            links.append(f'<a href="{esc(b["buy"])}">Buy it from a bookshop &rarr;</a>')
        out.append(
            '      <li><details class="book">\n'
            f'        <summary>{esc(b["title"])}'
            f' <span class="book__by">{esc(b["author"])}</span></summary>\n'
            '        <div class="book__open">\n'
            f'          <p>{esc(b["note"])}</p>\n'
            f'          <p class="book__links">{" ".join(links)}</p>\n'
            f'          <p class="book__cited">On this shelf because we argue from it on '
            f'<a href="{esc(b["source"])}">{esc(b.get("source_title") or b["source"])}</a>.</p>\n'
            '        </div>\n'
            '      </details></li>'
        )
    return "\n".join(out)


def campfire(docs):
    """The channel listing. EVERY ROW SAYS HOW LONG IT RUNS BEFORE ANYTHING IS
    PRESSED, which is the room's promise, and it matters more here than on a
    grid of separate players: the television retunes, so the runtime has to
    travel WITH the channel rather than sit on a button that is about to be
    replaced. hermitage.js reads these off the data attributes."""
    out = []
    for i, d in enumerate(docs, 1):
        if d["how"] == "screen":
            control = (
                f'          <button type="button" class="tune" data-ch="{i}">'
                f'Watch on the television &middot; {esc(d["spoken"])}</button>')
        else:
            control = (
                f'          <a class="doorout" href="https://www.youtube.com/watch?v={esc(d["id"])}">'
                f'Open on YouTube &middot; {esc(d["spoken"])} &rarr;</a>\n'
                f'          <p class="ch__why">{esc(d["why_link"])}</p>')
        out.append(
            f'        <li class="ch" data-ch="{i}" data-id="{esc(d["id"])}"\n'
            f'            data-title="{esc(d["title"])}" data-runs="{esc(d["length"])}"\n'
            f'            data-spoken="{esc(d["spoken"])}" data-how="{esc(d["how"])}">\n'
            f'          <p class="ch__no">CHANNEL {i}</p>\n'
            f'          <h3>{esc(d["title"])}</h3>\n'
            f'          <p class="ch__by">{esc(d["channel"])} &middot; {esc(d["length"])}</p>\n'
            f'          <p>{esc(d["note"])}</p>\n'
            f'{control}\n'
            '        </li>'
        )
    return "\n".join(out)


def chairs(bags):
    out = []
    for b in bags:
        credit = (f'<p class="bag__credit">{esc(b["credit"])}</p>' if b.get("credit") else "")
        out.append(
            f'      <li class="bag" style="--bag: {esc(b["hex"])};">\n'
            f'        <p class="bag__on">{esc(b["on_it"])}</p>\n'
            f'        <h3>{esc(b["term"])}</h3>\n'
            f'        <p>{esc(b["note"])}</p>\n'
            f'        {credit}\n'
            f'        <p class="bag__cited"><a href="{esc(b["source"])}">'
            f'{esc(b.get("source_title") or b["source"])} &rarr;</a></p>\n'
            '      </li>'
        )
    return "\n".join(out)


def sheets(specimens):
    out = []
    for sp in specimens:
        credit = (f'<p class="sheet__credit">{esc(sp["credit"])}</p>'
                  if sp.get("credit") else "")
        out.append(
            '      <li><details class="sheet">\n'
            f'        <summary>{esc(sp["name"])}'
            f' <span class="sheet__as">{esc(sp["sheet"])}</span></summary>\n'
            '        <div class="sheet__open">\n'
            f'          <p>{esc(sp["note"])}</p>\n'
            f'          {credit}\n'
            f'          <p class="sheet__cited">Pressed because we argue from it on '
            f'<a href="{esc(sp["source"])}">{esc(sp.get("source_title") or sp["source"])}</a>.</p>\n'
            '        </div>\n'
            '      </details></li>'
        )
    return "\n".join(out)


def bench(watch, read):
    out = []
    for v in watch:
        out.append(
            '      <li class="lay lay--watch">\n'
            f'        <h4>{esc(v["title"])}</h4>\n'
            f'        <p class="lay__by">{esc(v["channel"])} &middot; {esc(v["length"])}</p>\n'
            f'        <p>{esc(v["note"])}</p>\n'
            f'        <button type="button" class="facade" data-embed-id="{esc(v["id"])}"\n'
            f'                data-embed-title="{esc(v["title"])}">Play &middot; {esc(v["spoken"])}</button>\n'
            '      </li>'
        )
    for r in read:
        href = r.get("borrow") or r["url"]
        label = "Borrow or read it &rarr;" if r.get("borrow") else "Read it &rarr;"
        kind = "a book" if r["kind"] == "book" else "reading"
        out.append(
            '      <li class="lay lay--read">\n'
            f'        <h4>{esc(r["title"])}</h4>\n'
            f'        <p class="lay__by">{esc(r["author"])} &middot; {kind}</p>\n'
            f'        <p>{esc(r["note"])}</p>\n'
            f'        <p class="lay__go"><a href="{esc(href)}">{label}</a></p>\n'
            f'        <p class="lay__cited">Off our own <a href="{esc(r["source"])}">'
            f'{esc(r.get("source_title") or r["source"])}</a>.</p>\n'
            '      </li>'
        )
    return "\n".join(out)


def kin(pieces):
    out = []
    for piece in pieces:
        out.append(
            '      <li class="kin">\n'
            f'        <h4><a href="{esc(piece["url"])}">{esc(piece["title"])}</a></h4>\n'
            f'        <p>{esc(piece["what"])}</p>\n'
            f'        <p class="kin__why">{esc(piece["why"])}</p>\n'
            '      </li>'
        )
    return "\n".join(out)


def herb_rows(specimens):
    out = []
    for sp in specimens:
        credit = esc(sp["credit"]) if sp.get("credit") else "&mdash;"
        out.append(
            f'      <tr><td><strong>{esc(sp["name"])}</strong></td><td>{credit}</td>'
            f'<td><a href="{esc(sp["source"])}">{esc(sp.get("source_title") or sp["source"])}</a></td></tr>')
    return "\n".join(out)


def solar_rows(watch, read):
    out = []
    for v in watch:
        out.append(
            f'      <tr><td><strong>{esc(v["title"])}</strong></td><td>{esc(v["channel"])}</td>'
            f'<td>{esc(v["length"])}</td><td>in a screen</td>'
            f'<td><a href="https://www.youtube.com/watch?v={esc(v["id"])}">watch</a></td></tr>')
    for r in read:
        href = r.get("borrow") or r["url"]
        out.append(
            f'      <tr><td><strong>{esc(r["title"])}</strong></td><td>{esc(r["author"])}</td>'
            f'<td>&mdash;</td><td>{"a book" if r["kind"] == "book" else "reading"}</td>'
            f'<td><a href="{esc(href)}">open</a></td></tr>')
    return "\n".join(out)


def kin_rows(pieces):
    return "\n".join(
        f'      <li><a href="{esc(k["url"])}">{esc(k["title"])}</a> &mdash; {esc(k["what"])}</li>'
        for k in pieces)


def doc_rows(docs):
    """Rows only. The table around them is hand-set in liner-notes.html, the
    same as every other credits block there."""
    out = []
    for d in docs:
        how = "in a screen" if d["how"] == "screen" else "a door out; embedding is off"
        out.append(
            f'      <tr><td><strong>{esc(d["title"])}</strong></td><td>{esc(d["channel"])}</td>'
            f'<td>{esc(d["length"])}</td><td>{how}</td>'
            f'<td><a href="https://www.youtube.com/watch?v={esc(d["id"])}">watch</a></td></tr>')
    return "\n".join(out)


def book_rows(books):
    out = []
    for b in books:
        buy = f' &middot; <a href="{esc(b["buy"])}">buy</a>' if b.get("buy") else ""
        out.append(
            f'      <tr><td><strong>{esc(b["title"])}</strong></td><td>{esc(b["author"])}</td>'
            f'<td><a href="{esc(b["borrow"])}">borrow</a>{buy}</td>'
            f'<td><a href="{esc(b["source"])}">{esc(b.get("source_title") or b["source"])}</a></td></tr>')
    return "\n".join(out)


def main():
    data = json.loads(DATA.read_text())
    bad = check(data)
    if bad:
        print("REFUSING to build the Hermitage:")
        for b in bad:
            print("  - " + b)
        return 1

    books, docs = data["books"], data["docs"]
    swap(ROOM, "hermitage-shelves", shelves(books), "    ")
    swap(ROOM, "hermitage-campfire", campfire(docs), "    ")
    swap(ROOM, "hermitage-chairs", chairs(data["beanbags"]), "    ")
    swap(ROOM, "hermitage-herbarium", sheets(data["herbarium"]), "    ")
    swap(ROOM, "hermitage-bench", bench(data["solar_watch"], data["solar_read"]), "    ")
    swap(ROOM, "hermitage-kin", kin(data["starstuff"]), "    ")
    swap(NOTES, "hermitage-docs", doc_rows(docs), "      ")
    swap(NOTES, "hermitage-books", book_rows(books), "      ")
    swap(NOTES, "hermitage-herb", herb_rows(data["herbarium"]), "      ")
    swap(NOTES, "hermitage-solar", solar_rows(data["solar_watch"], data["solar_read"]), "      ")
    swap(NOTES, "hermitage-kin-credits", kin_rows(data["starstuff"]), "      ")

    doors = sum(1 for d in docs if d["how"] == "link")
    print(f"hermitage: {len(books)} books on the shelves, {len(docs)} documentaries "
          f"at the campfire ({doors} as a door out), {len(data['herbarium'])} sheets "
          f"in the herbarium, {len(data['solar_watch'])} + {len(data['solar_read'])} on "
          f"the solar bench, {len(data['starstuff'])} on the Star Stuff table, "
          "credits rebuilt.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
