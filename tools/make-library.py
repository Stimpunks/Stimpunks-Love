#!/usr/bin/env python3
"""Build the quotations, the front desk and the threads in the Community Library,
L-Space and Oook, and their credits, out of data/library.json.

ONE DATA FILE AND EVERY SURFACE THAT QUOTES, make-yells.py's contract. These
rooms and the liner notes all say who said what, and a quotation copied by hand into four
places is one that gets its year corrected in one of them. So every quotation
is written in the data file once and rendered everywhere it appears, with its
author, its work, its year and the sentence saying how it was checked.

EVERY QUOTATION IN THESE ROOMS WAS READ OFF OUR OWN LIBRARY PAGE AND NONE WAS
CHECKED AGAINST ITS BOOK, and each one says so on the page, under the words.
That is the Swaying Sweetgrass rule and the Zibaldone's: an unchecked quotation
must not sit among checked ones looking identical, and a quotation our own page
gives no source for must not be handed a citation it has not got.

IT REFUSES, and each of these is here because it is the friendly edit:

  · A QUOTATION LONGER THAN THE CAP IN THE DATA FILE. Our Library page quotes
    Pratchett at length, and the long passages are the ones that read best, so
    the next person to open these rooms will want one. They stay on that page,
    linked. The number lives in data/library.json with its reason, Covenstead's
    way rather than the Zibaldone's, because these rooms quote a handful of lines
    the prose is about rather than banking them.
  · A QUOTATION WITH NO `checked`, or with no `who`, or with a work and no year.
    A quotation whose source is unknown is allowed, and says so; one whose line
    about checking is missing is not.
  · A LYRIC. Our Library page quotes the Linda Lindas, and this street hosts no
    song's words anywhere but the one room that holds a written permission. The
    vocabulary that only ever describes a recording is refused in a quotation's
    work and checked lines, which is make-zibaldone.py's narrowed pattern.
  · THE GRAPHIC NOVEL. Our Library page cites the 1989 novel and links Open
    Library's record for the 2000 graphic adaptation (OL21372059W, edition
    OL7878556M). Copying the link off our own page is what the next edit will
    do, because it looks sourced; it is refused by id, and the novel is
    OL453735W.
  · A MARKER WITH NO QUOTATION, OR A QUOTATION WITH NO MARKER. The first is a
    blank figure on a page; the second is a quotation in the credits that no
    room shows. Either is the two surfaces drifting apart.
  · AN ADDRESS ON STIMPUNKS.ORG THAT COULD REDIRECT. Every collection and every
    thread must be https://stimpunks.org/… ending in a slash, because on that
    site a 301 is a failure and not a pass, and a link without the slash is one
    redirect away from wherever core's guesser sends it.

IT NEEDS NOTHING BUT THE FILES, so it is in the pre-deploy sequence.
"""
import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data/library.json"
CREDITS = ROOT / "liner-notes.html"

# Which prefix each room's classes wear. A quotation is the same object in each
# of these rooms and is dressed differently in every one, so the markup names the room rather than
# sharing a class the three sections would then have to fight over.
PREFIX = {
    "community-library.html": "cl",
    "l-space.html": "lsp",
    "oook.html": "ook",
}

GRAPHIC_NOVEL = ("OL21372059W", "OL7878556M")

# Only ever a recording. `song` alone would refuse Whitman, which is the first
# thing make-zibaldone.py's version of this refused; these are the words that
# never describe anything else.
LYRIC = re.compile(r"\b(?:lyrics?|chorus|verse \d|single|album|b-side|track \d|"
                   r"sings?|sung|songwriter|the band)\b", re.I)
ENTITY = re.compile(r"&[a-z]+;|&#\d+;")


def e(s):
    return html.escape(s, quote=False)


def swap(page, marker, block, indent=""):
    src = page.read_text()
    begin, end = f"<!-- {marker}:begin -->", f"<!-- {marker}:end -->"
    if begin not in src or end not in src:
        raise SystemExit(
            f"REFUSING: {page.name} has no {marker} markers, so there is nowhere to write.\n"
            "Put them back rather than letting this tool go quiet.")
    page.write_text(re.sub(re.escape(begin) + r".*?" + re.escape(end),
                           lambda m: begin + "\n" + block + "\n" + indent + end,
                           src, count=1, flags=re.S))


def words(s):
    return len(re.findall(r"[\w’'-]+", s))


def check(d):
    problems = []
    cap = d.get("_cap", {}).get("words")
    if not isinstance(cap, int) or not d["_cap"].get("why"):
        problems.append("data/library.json has no _cap with a number and a reason. The cap is "
                        "a decision; write down why it is the number it is.")
        cap = 0
    seen = set()
    for q in d["quotes"]:
        where = f"quote {q.get('id')!r}"
        if q.get("id") in seen:
            problems.append(f"{where} is in the file twice.")
        seen.add(q.get("id"))
        if q.get("page") not in PREFIX:
            problems.append(f"{where} is for {q.get('page')!r}, which is not one of this tool's rooms.")
        for k in ("text", "who", "checked"):
            if not q.get(k):
                problems.append(f"{where} has no {k}.")
        if q.get("work") and not q.get("year") and not q.get("undated"):
            problems.append(f"{where} names a work and no year. A title is not a source; say "
                            "when, or say in `undated` why it has no when.")
        if cap and words(q.get("text", "")) > cap:
            problems.append(f"{where} is {words(q['text'])} words and the cap is {cap}. The long "
                            "passages stay on our Library page, linked.")
        for k in ("work", "checked", "text"):
            if q.get(k) and LYRIC.search(q[k]):
                problems.append(f"{where}: {k} reads like a song ({LYRIC.search(q[k]).group(0)!r}). "
                                "No lyric is hosted on this street without a written permission.")
        for k in ("text", "who", "work", "checked"):
            if q.get(k) and ENTITY.search(q[k]):
                problems.append(f"{where}: {k} carries an HTML entity. Write the character; this "
                                "tool escapes what it writes.")
        if q.get("href"):
            if any(g in q["href"] for g in GRAPHIC_NOVEL):
                problems.append(f"{where} links Open Library's record for the 2000 graphic "
                                "adaptation of Guards! Guards!. The novel is OL453735W.")
            if not q["href"].startswith("https://"):
                problems.append(f"{where}'s link is not https.")
        elif q.get("who", "").startswith("Terry Pratchett"):
            problems.append(f"{where} is Pratchett's and links no edition. Resolve one and say so.")
    for kind in ("collections", "threads"):
        labels = set()
        for c in d.get(kind, []):
            url = c.get("url", "")
            if not (url.startswith("https://stimpunks.org/") and url.endswith("/")):
                problems.append(f"{kind}: {c.get('label')!r} points at {url!r}, which is not an "
                                "https://stimpunks.org/ address ending in a slash.")
            if c.get("label") in labels:
                problems.append(f"{kind}: {c.get('label')!r} is listed twice.")
            labels.add(c.get("label"))
            if kind == "threads" and not c.get("why"):
                problems.append(f"threads: {c.get('label')!r} has no line saying why it is a thread.")
    return problems


def figure(q):
    p = PREFIX[q["page"]]
    if q.get("laws"):
        lines = [s.strip() for s in re.split(r"(?<=\.)\s+", q["text"]) if s.strip()]
        body = f'<ol class="{p}-quote__laws">' + "".join(f"<li>{e(s)}</li>" for s in lines) + "</ol>"
    else:
        body = f"<p>{e(q['text'])}</p>"
    who = e(q["who"])
    if q.get("work"):
        work = f"<i>{e(q['work'])}</i>" if q["work"][0].isupper() else e(q["work"])
        if q.get("href"):
            work = f'<a href="{e(q["href"])}">{work}</a>'
        who += f", <cite>{work}</cite>"
    if q.get("year"):
        who += f", {q['year']}"
    return (f'    <figure class="{p}-quote" id="q-{q["id"]}">\n'
            f'      <blockquote class="{p}-quote__text">{body}</blockquote>\n'
            f'      <figcaption class="{p}-quote__who">&mdash; {who}</figcaption>\n'
            f'      <p class="{p}-quote__checked">{e(q["checked"])}</p>\n'
            f'    </figure>')


def main():
    d = json.loads(DATA.read_text())
    problems = check(d)

    # Every marker on every page has a quotation, and every quotation a marker.
    wanted = {(q["page"], q["id"]) for q in d["quotes"] if q.get("page") in PREFIX}
    found = set()
    for page in PREFIX:
        src = (ROOT / page).read_text()
        for m in re.finditer(r"<!-- lib:quote:([\w-]+):begin -->", src):
            found.add((page, m.group(1)))
    for page, qid in sorted(found - wanted):
        problems.append(f"{page} has a marker for quotation {qid!r}, and data/library.json has "
                        "no such quotation for that page.")
    for page, qid in sorted(wanted - found):
        problems.append(f"quotation {qid!r} is for {page}, which has no marker for it. A "
                        "quotation in the credits that no room shows is the surfaces drifting.")

    if problems:
        raise SystemExit("REFUSING:\n  " + "\n  ".join(problems))

    for q in d["quotes"]:
        swap(ROOT / q["page"], f"lib:quote:{q['id']}", figure(q), "")

    desk = ['    <ul class="cl-desk">']
    for c in d["collections"]:
        desk.append(f'      <li class="cl-desk__card"><a href="{e(c["url"])}">{e(c["label"])}</a></li>')
    desk.append("    </ul>")
    swap(ROOT / "community-library.html", "lib:collections", "\n".join(desk), "")

    threads = ['    <ul class="lsp-threads">']
    for c in d["threads"]:
        threads.append(f'      <li><a href="{e(c["url"])}">{e(c["label"])}</a>, {e(c["why"])}</li>')
    threads.append("    </ul>")
    swap(ROOT / "l-space.html", "lib:threads", "\n".join(threads), "")

    names = {"community-library.html": "Community Library", "l-space.html": "L-Space", "oook.html": "Oook"}
    creds = ['  <ul>']
    for q in d["quotes"]:
        work = f", <i>{e(q['work'])}</i>" if q.get("work") and q["work"][0].isupper() else (
            f", {e(q['work'])}" if q.get("work") else "")
        year = f", {q['year']}" if q.get("year") else ""
        creds.append(f'    <li><b>{e(q["who"])}</b>{work}{year}, in {names[q["page"]]}. '
                     f'{e(q["checked"])}</li>')
    creds.append("  </ul>")
    swap(CREDITS, "lib:credits", "\n".join(creds), "  ")

    print(f"library: {len(d['quotes'])} quotations, each with how it was checked; {len(d['collections'])} collections on the desk; "
          f"{len(d['threads'])} threads; credits written into {CREDITS.name}.")


if __name__ == "__main__":
    main()
