#!/usr/bin/env python3
"""Build the Oracle Deck and its credits.

ONE DATA FILE, ONE TOOL, TWO SURFACES -- the same contract every other room
here keeps.

THE THING THIS TOOL IS REALLY FOR is the first refusal below. Every other check
in this file guards a rendering bug; that one guards the room's argument, which
is the only one of the two that cannot be spotted by looking at the page.

WHAT IT REFUSES:

  - A CARD THAT TELLS A FORTUNE. The deck asks and does not answer: every card
    ends in a question mark and no card carries the vocabulary of prediction.
    A deck on a Disabled people's site that told somebody how their life was
    going to go would be doing the exact thing our own pages spend their time
    refusing, in the one room dark enough to get away with it -- and it would
    arrive as a friendly edit, one card at a time, from somebody who thought a
    question was a bit thin. This is the pebbling cabinet's refusal of a tally
    and the otter's refusal to be recharged, wearing a cloak.
  - A PLATE THAT IS NOT FROM THE ONE COLLECTION. Every image here is from the
    Metropolitan Museum of Art's Open Access collection, which is what lets the
    room make one rights statement instead of thirteen. An object url pointing
    somewhere else is a deck that has quietly become a scrapbook, and nobody
    can check a scrapbook. This is make-hermitage.py's starstuff.earth rule.
  - A CARD WITH NO ALT TEXT, or an image file that is not on disk. A card whose
    picture is its whole front is a card that is blank to anybody who cannot
    see it, and a missing file renders as an empty box rather than an error.
  - A DUPLICATE SLUG OR OBJECT ID. One id twice is one engraving wearing two
    names, which reads as two cards.
  - MARKERS WITH NO DATA, OR DATA WITH NO MARKERS, in either surface.
"""
import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data/oracle.json"
ROOM = ROOT / "oracle-deck.html"
NOTES = ROOT / "liner-notes.html"

MET = "https://www.metmuseum.org/"

# THE LANGUAGE OF PREDICTION. Short and blunt on purpose: it is read as a
# declaration about what this deck is, so adding to it should feel like a
# decision. Matched case-insensitively against the name, the question and the
# note of every card.
FORTUNE = [
    "will happen", "your future", "the future holds", "is coming to you",
    "destined", "destiny", "foretell", "foretold", "prophecy", "prophesy",
    "predict", "you shall", "expect soon", "good luck", "bad luck",
    "reversed", "the outcome", "means that you", "tells you that",
]


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


def check(data):
    bad = []
    cards = data.get("cards") or []
    if not cards:
        bad.append("data/oracle.json has no cards, and the deck is made of them.")

    slugs, oids = set(), set()
    for c in cards:
        name = (c.get("name") or "").strip() or "<unnamed card>"
        slug = (c.get("slug") or "").strip()
        if not slug:
            bad.append(f"{name!r} has no slug.")
        elif slug in slugs:
            bad.append(f"the slug {slug!r} is used twice.")
        slugs.add(slug)

        ask = (c.get("question") or "").strip()
        if not ask:
            bad.append(f"{name!r} asks nothing, and a card here is a question.")
        elif not ask.endswith("?"):
            bad.append(f"{name!r} does not end in a question mark: {ask!r}. "
                       "This deck asks and does not answer.")

        note = (c.get("note") or "").strip()
        if not note:
            bad.append(f"{name!r} has no note.")

        hay = " ".join((name, ask, note)).lower()
        for phrase in FORTUNE:
            if phrase in hay:
                bad.append(f"{name!r} uses the language of prediction ({phrase!r}). "
                           "This deck does not tell anybody what is going to happen "
                           "to them.")

        alt = (c.get("alt") or "").strip()
        if not alt:
            bad.append(f"{name!r} has no alt text, and the picture is the whole front "
                       "of the card.")

        img = (c.get("image") or "").strip()
        if not img:
            bad.append(f"{name!r} has no image.")
        elif not (ROOT / img).exists():
            bad.append(f"{name!r} points at {img}, which is not in the repository. "
                       "A missing file renders as an empty box rather than an error.")

        plate = c.get("plate") or {}
        for field in ("title", "artist", "date", "medium", "credit", "accession", "url"):
            if not str(plate.get(field) or "").strip():
                bad.append(f"{name!r} has no {field} on its plate.")
        url = str(plate.get("url") or "")
        if url and not url.startswith(MET):
            bad.append(f"{name!r} links to {url}, which is not the Metropolitan "
                       "Museum. This deck makes ONE rights statement and it only "
                       "covers one collection.")
        oid = plate.get("object_id")
        if oid in oids:
            bad.append(f"object {oid} is used twice.")
        oids.add(oid)

    if bad:
        print("REFUSING to build the Oracle Deck:\n")
        for b in bad:
            print("  · " + b)
        print("\nFix the data rather than this tool.")
        sys.exit(1)


def card_html(c, indent):
    p = c["plate"]
    bio = (p.get("artist_bio") or "").strip()
    who = esc(p["artist"]) + (f' <span class="sr">({esc(bio)})</span>' if bio else "")
    pad = " " * indent
    return "\n".join([
        f'{pad}<article class="orc-card" id="card-{c["slug"]}">',
        f'{pad}  <img class="orc-face" src="{q(c["image"])}" alt="{q(c["alt"])}" '
        f'width="500" height="625" loading="lazy" decoding="async">',
        f'{pad}  <h3 class="orc-name">{esc(c["name"])}</h3>',
        f'{pad}  <p class="orc-ask">{esc(c["question"])}</p>',
        f'{pad}  <p class="orc-note">{esc(c["note"])}</p>',
        f'{pad}  <p class="orc-plate">{who}, <b>{esc(p["title"])}</b>, {esc(p["date"])}. '
        f'{esc(p["medium"])}. {esc(p["credit"])}, {esc(p["accession"])}. '
        f'<a href="{q(p["url"])}">The Metropolitan Museum of Art</a> &middot; public domain.</p>',
        f'{pad}</article>',
    ])


def deck_block(data):
    out = ['    <ul class="orc-index">']
    for c in data["cards"]:
        out.append(f'      <li data-card="{q(c["slug"])}">')
        out.append(card_html(c, 8))
        out.append("      </li>")
    out.append("    </ul>")
    return "\n".join(out)


def credits_block(data):
    # The <h2> above this block in liner-notes.html already names the room.
    out = []
    out.append('  <p><strong>Every picture in this deck is somebody else&rsquo;s and '
               'nobody&rsquo;s.</strong> All of them are public domain works in the '
               '<a href="https://www.metmuseum.org/about-the-met/policies-and-documents/open-access">'
               'Metropolitan Museum of Art&rsquo;s Open Access collection</a>, whose images '
               'of public domain works are released under CC0 &mdash; which asks for '
               'nothing. The names below are here because naming the hand is this '
               'site&rsquo;s habit, not because anybody made us. The card names, the '
               'questions and the notes are ours and are CC BY-SA 4.0 with the rest of '
               'the site; the engravings are not ours to license.</p>')
    out.append("  <ul>")
    for c in data["cards"]:
        p = c["plate"]
        out.append(f'    <li><strong>{esc(c["name"])}</strong> &mdash; {esc(p["artist"])}, '
                   f'<em>{esc(p["title"])}</em>, {esc(p["date"])}. {esc(p["credit"])}, '
                   f'{esc(p["accession"])}. '
                   f'<a href="{q(p["url"])}">Object {p["object_id"]}</a></li>')
    out.append("  </ul>")
    return "\n".join(out)


def main():
    data = json.loads(DATA.read_text())
    check(data)
    swap(ROOM, "oracle-deck", deck_block(data), "  ")
    swap(NOTES, "oracle-credits", credits_block(data), "")
    print(f"oracle-deck.html: {len(data['cards'])} cards, every plate from one collection")
    print("liner-notes.html: credits rewritten from the same file")


if __name__ == "__main__":
    main()
