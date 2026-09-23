#!/usr/bin/env python3
"""Build the Doomscroll's feed and its credits.

ONE DATA FILE, ONE TOOL, TWO SURFACES -- the same contract every other room
here keeps.

IT SORTS RATHER THAN TRUSTS. The feed's whole conceit is that it runs newest
first by the date each poem was first published, which means the order is a
claim and not a layout. So this tool sorts on the year itself: an entry pasted
at the bottom of the data file cannot end up rendered at the bottom of a feed
that says it is chronological.

WHAT IT REFUSES:

  - A POEM WHOSE AUTHOR HAS NOT BEEN DEAD SEVENTY YEARS. The room says every
    poem on it is public domain EVERYWHERE and not merely in the United States,
    and that sentence is only true if something enforces it. Life plus seventy
    is the long term in most of the world; clearing it clears the shorter ones
    too. THIS ALREADY COST THE SCROLL ITS BEST OPENER -- Eliot's The Hollow Men
    is public domain in the US and will not be in Europe until the 2030s, and a
    site that serves everybody cannot publish a whole poem on somebody else's
    technicality. The rule is checked against the current year rather than a
    date written into the file, so it keeps being true.
  - A POEM WITH NO PUBLICATION YEAR, or none that is a plausible year. The
    order is built from it, so a missing one does not render wrong -- it
    renders somewhere, confidently.
  - A TEXT WITH NO PRINTING NAMED. These poems exist in several and they
    differ: the 1890 Dickinson is retitled and a stanza short, the 1609
    Shakespeare keeps its compositor's error. A text with no printing behind it
    is a text nobody can check, which is why The Darkling Thrush is not on this
    scroll.
  - A TEXT FROM SOMEWHERE OTHER THAN THE ONE SOURCE. Everything here was
    transcribed from Wikisource, which is what lets the room make one statement
    about where its words came from. make-hermitage.py's starstuff.earth rule.
  - AN EMPTY STANZA, or a poem with none. A feed item that opens onto nothing
    looks like a page that has not finished loading.
  - A DUPLICATE SLUG.
  - MARKERS WITH NO DATA, OR DATA WITH NO MARKERS, in either surface.
"""
import datetime
import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data/doomscroll.json"
ROOM = ROOT / "the-doomscroll.html"
NOTES = ROOT / "liner-notes.html"

SOURCE = "https://en.wikisource.org/"
TERM = 70          # life plus seventy: the long copyright term, cleared for everybody.


def esc(s):
    return html.escape(s, quote=False)


def q(s):
    return html.escape(s, quote=True)


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


def check(data, now):
    bad = []
    poems = data.get("poems") or []
    if not poems:
        bad.append("data/doomscroll.json has no poems, and the feed is made of them.")

    slugs = set()
    for p in poems:
        t = (p.get("title") or "").strip() or "<untitled>"
        slug = (p.get("slug") or "").strip()
        if not slug:
            bad.append(f"{t!r} has no slug.")
        elif slug in slugs:
            bad.append(f"the slug {slug!r} is used twice.")
        slugs.add(slug)

        author = (p.get("author") or "").strip()
        if not author:
            bad.append(f"{t!r} has no author.")

        died = p.get("author_died")
        if not isinstance(died, int):
            bad.append(f"{t!r} does not say when its author died, which is the only "
                       "thing that decides whether it can be published whole.")
        elif now - died <= TERM:
            bad.append(
                f"{t!r}: {author} died in {died}, which is {now - died} years ago. "
                f"This scroll only carries poems whose author has been dead more than "
                f"{TERM} years, so that every one of them is public domain everywhere "
                f"rather than only in the United States.")

        year = p.get("year")
        if not isinstance(year, int) or not (1400 <= year <= now):
            bad.append(f"{t!r} has no usable first-publication year ({year!r}), and the "
                       "order of this feed is built out of it.")

        if not (p.get("first_published") or "").strip():
            bad.append(f"{t!r} does not say where it was first published.")
        src = (p.get("text_source") or "").strip()
        if not src:
            bad.append(f"{t!r} does not name the printing its text came from. These "
                       "poems exist in several and they differ.")
        url = (p.get("text_url") or "").strip()
        if not url.startswith(SOURCE):
            bad.append(f"{t!r} was transcribed from {url!r}, which is not the one source "
                       "this scroll names. One statement about provenance only covers "
                       "one source.")

        for field in ("headline", "standfirst"):
            if not (p.get(field) or "").strip():
                bad.append(f"{t!r} has no {field}.")

        stanzas = p.get("stanzas") or []
        if not stanzas:
            bad.append(f"{t!r} has no text, and a feed item that opens onto nothing "
                       "looks like a page still loading.")
        for n, st in enumerate(stanzas, 1):
            if not st or not all(str(l).strip() for l in st):
                bad.append(f"{t!r} has an empty line or stanza at {n}.")

    if bad:
        print("REFUSING to build the Doomscroll:\n")
        for b in bad:
            print("  · " + b)
        print("\nFix the data rather than this tool.")
        sys.exit(1)


def ordered(data):
    """Newest first. Ties break on title so the order is stable between runs."""
    return sorted(data["poems"], key=lambda p: (-p["year"], p["title"]))


def feed_block(data):
    """The feed, with each poem ON THE PAGE rather than in a data attribute.

    The dialog is a CLONE of the block below the button, so the whole poem and
    its provenance live in the document exactly once. Without JavaScript the
    <noscript> in this room's head unhides every one of them and takes the
    buttons away, and the page becomes what it says it is: a very long scroll of
    bad news."""
    out = ['    <ol class="dsc-feed">']
    for n, p in enumerate(ordered(data), 1):
        rid = f"poem-{p['slug']}"
        out.append('      <li class="dsc-item">')
        out.append(f'        <p class="dsc-when">{p["year"]} &middot; '
                   f'first published in {esc(p["first_published"])}</p>')
        out.append(f'        <h2 class="dsc-headline">{esc(p["headline"])}</h2>')
        out.append(f'        <p class="dsc-stand">{esc(p["standfirst"])}</p>')
        out.append(f'        <p class="dsc-by"><b>{esc(p["title"])}</b> by '
                   f'{esc(p["author"])}, who died in {p["author_died"]} &mdash; which is '
                   f'why the whole of it can be printed here</p>')
        out.append(f'        <button type="button" class="dsc-more" data-poem="{rid}">'
                   f'Read the whole thing<span class="sr"> of {esc(p["title"])} by '
                   f'{esc(p["author"])}</span></button>')
        out.append(f'        <div class="dsc-body" id="{rid}" hidden>')
        out.append(f'          <h3>{esc(p["title"])}</h3>')
        out.append(f'          <p class="dsc-full__by">{esc(p["author"])} &middot; '
                   f'{p["year"]}</p>')
        out.append('          <div class="dsc-poem">')
        for st in p["stanzas"]:
            out.append("            <p>" + "<br>\n            ".join(esc(l) for l in st) + "</p>")
        out.append("          </div>")
        out.append(f'          <p class="dsc-prov"><b>First published</b> in '
                   f'{esc(p["first_published"])}. <b>This text</b> is from '
                   f'{esc(p["text_source"])} &mdash; '
                   f'<a href="{q(p["text_url"])}">see it there</a>. '
                   f'{esc(p["author"])} died in {p["author_died"]}, so the poem is out '
                   f'of copyright everywhere.</p>')
        out.append("        </div>")
        out.append("      </li>")
    out.append("    </ol>")
    return "\n".join(out)


ONES = ("zero one two three four five six seven eight nine ten eleven twelve "
        "thirteen fourteen fifteen sixteen seventeen eighteen nineteen").split()
TENS = {20: "twenty", 30: "thirty", 40: "forty", 50: "fifty",
        60: "sixty", 70: "seventy", 80: "eighty", 90: "ninety"}


def words(n):
    """Small numbers in words, because this room writes them out.

    IT BUILDS THE WHOLE PHRASE AND NOT JUST THE NUMBER, which is the lesson
    make-jungle.py learned the hard way: the first version of its sentence
    generated the count and left the tail of the sentence plural, which is a
    hand-typed total wearing a disguise. Anything that has to agree with the
    number is built here too."""
    if n < 20:
        return ONES[n]
    if n < 100:
        t, r = divmod(n, 10)
        return TENS[t * 10] + (f"-{ONES[r]}" if r else "")
    h, r = divmod(n, 100)
    out = f"{ONES[h]} hundred"
    return out + (f" and {words(r)}" if r else "")


def slug_block(data):
    ps = ordered(data)
    newest = ps[0]["year"]
    return ('        <p class="dsc-slug">All the bad news &middot; newest first &middot; '
            f'nothing since {newest}</p>')


def tally_block(data):
    ps = ordered(data)
    span = ps[0]["year"] - ps[-1]["year"]
    n = len(ps)
    item = "item" if n == 1 else "items"
    return (f'        {words(span).capitalize()} years of it, and {words(n)} {item}.')


def credits_block(data):
    # The <h2> above this block in liner-notes.html already names the room.
    out = []
    out.append('  <p><strong>Every poem on the scroll is out of copyright everywhere</strong> '
               '&mdash; not only in the United States &mdash; because every one of these '
               'writers has been dead more than seventy years, which is what '
               '<code>tools/make-doomscroll.py</code> checks before it will build the '
               'page. Each text was transcribed from Wikisource and each entry names '
               'the printing it came from, because these poems exist in several and '
               'they differ. The headlines and the lines under them are ours.</p>')
    out.append("  <ul>")
    for p in ordered(data):
        out.append(f'    <li><em>{esc(p["title"])}</em> &mdash; {esc(p["author"])} '
                   f'(d. {p["author_died"]}). First published {esc(p["first_published"])}. '
                   f'Text from <a href="{q(p["text_url"])}">{esc(p["text_source"])}</a>.</li>')
    out.append("  </ul>")
    return "\n".join(out)


def main():
    now = datetime.date.today().year
    data = json.loads(DATA.read_text())
    check(data, now)
    swap(ROOM, "doomscroll-feed", feed_block(data), "  ")
    swap(ROOM, "doomscroll-slug", slug_block(data), "        ")
    swap(ROOM, "doomscroll-tally", tally_block(data), "        ")
    swap(NOTES, "doomscroll-credits", credits_block(data), "")
    ps = ordered(data)
    print(f"the-doomscroll.html: {len(ps)} poems, {ps[0]['year']} down to {ps[-1]['year']}")
    print("liner-notes.html: credits rewritten from the same file")


if __name__ == "__main__":
    main()
