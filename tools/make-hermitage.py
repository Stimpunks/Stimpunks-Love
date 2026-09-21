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
    out = []
    for d in docs:
        if d["how"] == "screen":
            control = (
                f'        <button type="button" class="facade" data-embed-id="{esc(d["id"])}"\n'
                f'                data-embed-title="{esc(d["title"])}">Play &middot; {esc(d["spoken"])}</button>'
            )
            tail = ("Pressing is what sends the request; nothing reaches YouTube before that.")
        else:
            control = (
                f'        <a class="doorout" href="https://www.youtube.com/watch?v={esc(d["id"])}">'
                f'Open on YouTube &middot; {esc(d["spoken"])} &rarr;</a>'
            )
            tail = esc(d["why_link"])
        out.append(
            '      <li class="doc">\n'
            f'        <h3>{esc(d["title"])}</h3>\n'
            f'        <p class="doc__by">{esc(d["channel"])} &middot; {esc(d["length"])}</p>\n'
            f'        <p>{esc(d["note"])}</p>\n'
            f'{control}\n'
            f'        <p class="doc__note">{tail}</p>\n'
            '      </li>'
        )
    return "\n".join(out)


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
    swap(NOTES, "hermitage-docs", doc_rows(docs), "      ")
    swap(NOTES, "hermitage-books", book_rows(books), "      ")

    doors = sum(1 for d in docs if d["how"] == "link")
    print(f"hermitage: {len(books)} books on the shelves, {len(docs)} documentaries "
          f"at the campfire ({doors} as a door out), credits rebuilt.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
