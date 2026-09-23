#!/usr/bin/env python3
"""Build Covenstead's table of tenets, and the credits.

ONE DATA FILE, ONE TOOL, TWO SURFACES -- the contract make-chappell.py,
make-club.py, make-lagoon.py, make-sithen.py and make-hermitage.py keep.

WHAT IT REFUSES:

  - A TENET MARKED CONTESTED THAT DOES NOT SAY WHAT IS CONTESTED ABOUT IT. This
    is the refusal particular to this room. The Rule of Three is NOT a universal
    article of faith among Wiccans -- there are practitioners who read it as an
    over-elaboration on the Rede and others who think it a modern innovation
    built on Christian morality -- and a page that stated it flat, as the witch
    law, would be settling a live argument inside somebody else's religion on
    their behalf, from the outside, in passing, for atmosphere. The flattened
    version is always the one that travels, which is exactly why the flag is not
    left to care.

  - A TENET WRITTEN AS AN ORDER. `Rede` is Middle English for COUNSEL, and the
    best-known couplet has stayed counsel for sixty years rather than hardening
    into a code somebody can be expelled for breaking. A site for Disabled
    people has met a great many rules dressed as guidance; this is the rarer
    thing going the other way, and a tool that let it drift back into commands
    would have quietly undone the one distinction the room turns on.
    NOTE THE CONTRAST WITH make-sithen.py, WHICH REFUSES ADVICE OUTRIGHT. That
    room is a catalogue of unwritten rules and must not tell anybody how to
    follow them; this one is explicitly about counsel that stays counsel. Two
    rooms in one area holding opposite rules about the same vocabulary, for the
    same underlying reason. DO NOT MAKE THEM AGREE.

  - A QUOTATION WITHOUT ITS AUTHOR, ITS WORK AND A LINK TO THE EDITION. The
    Pratchett lines are ON this page, in full, and they are the point of it.
    An earlier draft named the concepts and linked out for the words, on the
    reasoning that they are quoted properly elsewhere on our own sites -- and
    that was too cautious and it gutted the room. These sentences ARE the
    tenets, the way the Rede's couplet is; a page describing them at second
    hand was sending a reader somewhere else for the thing it was about.
    Ryan's call, 2026-09-22. Short attributed quotation in commentary is
    ordinary practice and is what every essay on this subject does. WHAT IS NOT
    OPTIONAL IS THE ATTRIBUTION, which is the one habit this site keeps when it
    drops every other kind of care.

  - A QUOTATION OVER THIS ROOM'S CAP, WHICH IS NOT THE ZIBALDONE'S AND MUST NOT
    BE. That room is a QUOTE BANK, where the danger is drift -- nobody decides
    to republish a book, they add one good line at a time until the page IS the
    work -- so thirty words is right there and the room prints the number. This
    room quotes a handful of named passages that the commentary is about, and
    the sentence defining First Sight runs to thirty-five words: a cap that cut
    it in half would be pedantry dressed as rigour. Sixty fits a defining
    sentence and refuses a scene. The long exchange that the shorter lines come
    out of runs to several hundred words and stays a link.

  - A TENET WITH NO SOURCE, or with no line of our own. One half of this page is
    inherited and one half is ours, and a reader cannot tell them apart by tone
    -- make-sithen.py's split, one turning along.

  - MEMBERSHIP. No degrees, no levels, no initiation, no test at the door. A
    covenstead is a place a group meets, and the one thing this street will not
    build is a room you have to qualify for.

  - AN HTML ENTITY IN ANY FIELD, and a note shaped like verse. The fourth and
    fifth shapes of each; see data/lagoon.json and data/rabbit-hole.json.
"""
import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data/covenstead.json"
ROOM = ROOT / "covenstead.html"
NOTES = ROOT / "liner-notes.html"

ENTITY = re.compile(r"&(?:[a-zA-Z][a-zA-Z0-9]{1,31}|#\d{1,6}|#x[0-9a-fA-F]{1,6});")

# An order rather than counsel. Second person and imperative framings only:
# "the constraint comes first" and "what you send out returns" are descriptions
# of somebody's tenet and have to survive.
ORDER = re.compile(
    r"\byou must\b|\bthou shalt\b|\byou shall\b|\bis a commandment\b|"
    r"\bis binding\b|\bmust obey\b|\bare required to\b|\bon pain of\b", re.I)

# Gating. Narrow on purpose: "degree" and "level" are ordinary words and a flat
# ban would refuse this repo's own prose, which is check-counts.py's first-run
# lesson and make-guild.py's, arriving a third time.
GATE = re.compile(
    r"\bfirst degree\b|\bsecond degree\b|\bthird degree\b|\binitiates? only\b|"
    r"\bmembers only\b|\byou must be initiated\b|\bearn your place\b", re.I)

VERSE_LINE = 52


# Sixty, and it is this room's own. See the docstring: the Zibaldone's thirty is
# right for a quote bank and wrong here, and data/covenstead.json carries the
# reasoning beside the quotations it governs.
MAX_QUOTE_WORDS = 60


def esc(s):
    return html.escape(s, quote=False)


def swap(page, marker, block, indent=""):
    begin, end = f"<!-- {marker}:begin -->", f"<!-- {marker}:end -->"
    src = page.read_text()
    if begin not in src or end not in src:
        raise SystemExit(
            f"REFUSING: {page.name} has no {marker} markers, so there is nowhere\n"
            "to write. Add them on purpose rather than letting this tool render nothing.")
    page.write_text(re.sub(re.escape(begin) + r".*?" + re.escape(end),
                           lambda m: begin + "\n" + block + "\n" + indent + end,
                           src, flags=re.S))


def looks_like_verse(text):
    lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
    return len(lines) >= 3 and all(len(ln) <= VERSE_LINE for ln in lines)


def check(d, cap):
    bad = []
    tenets = d.get("tenets") or []
    if not tenets:
        bad.append("data/covenstead.json has no tenets, and the table is made of them.")

    for t in tenets:
        n = (t.get("name") or "").strip() or "<unnamed>"
        for field in ("name", "said", "whose", "note"):
            v = (t.get(field) or "").strip()
            if not v:
                if field == "whose":
                    bad.append(
                        f"{n!r} names no source. One half of this page is inherited and one "
                        "half is ours, and a reader cannot tell them apart by tone.")
                elif field == "note":
                    bad.append(
                        f"{n!r} has no line of our own. A tenet published without one is "
                        "somebody else's belief reprinted for atmosphere.")
                else:
                    bad.append(f"{n!r} has no {field}.")
                continue
            if ENTITY.search(v):
                bad.append(f"{n!r}'s {field} contains an HTML entity. Everything here is "
                           "escaped on the way into the page.")
            if ORDER.search(v):
                bad.append(
                    f"{n!r}'s {field} is written as an order. Rede means counsel, and the "
                    "couplet on this table has stayed counsel for sixty years rather than "
                    "hardening into a code somebody can be expelled for breaking. That "
                    "distinction is the hinge this room turns on.")
            if GATE.search(v):
                bad.append(
                    f"{n!r}'s {field} gates membership. Nothing here admits or excludes "
                    "anybody: no degrees, no initiation, no test at the door.")
            if looks_like_verse(v):
                bad.append(f"{n!r}'s {field} is several short hand-broken lines.")
        for q in ([t["quote"]] if t.get("quote") else []) + (t.get("also") or []):
            words = len((q.get("text") or "").split())
            label = (q.get("text") or "")[:40]
            if not words:
                bad.append(f"{n!r} carries a quotation with no words in it.")
            if words > cap:
                bad.append(
                    f"{n!r} quotes {words} words and this room's cap is {cap}. The cap fits "
                    "a defining sentence and refuses a scene; the long exchange the shorter "
                    "lines come out of stays a link. Raise it on purpose, in the data file, "
                    "with the reason written down -- never to fit one passage.")
            for need in ("author", "work", "url"):
                if not (q.get(need) or "").strip():
                    bad.append(
                        f"{n!r} quotes {label!r}... with no {need}. Every quotation here "
                        "names its author, its work and where the edition is. That is the "
                        "one habit this site keeps when it drops all the others.")
        if t.get("contested") is not None and not (t.get("contested") or "").strip():
            bad.append(f"{n!r} is flagged as contested and says nothing about what is "
                       "contested. An empty flag is worse than none.")
    return bad


def table(tenets):
    out = []
    for i, t in enumerate(tenets, 1):
        when = f' &middot; {esc(t["when"])}' if t.get("when") else ""
        contested = (
            f'          <p class="seat__argued"><b>Contested, and the room is not going to '
            f'settle it:</b> {esc(t["contested"])}</p>\n'
            if t.get("contested") else "")

        # THE QUOTATIONS, each carrying its own attribution rather than a shared
        # footnote. A cite that sits once at the bottom of a room is a cite
        # nobody reads beside the words it belongs to.
        def block(q, first):
            cls = "seat__quote" + ("" if first else " seat__quote--more")
            return (f'          <blockquote class="{cls}">\n'
                    f'            <p>{esc(q["text"])}</p>\n'
                    f'            <cite><a href="{esc(q["url"])}">{esc(q["work"])}</a>, '
                    f'{esc(q["author"])}, {esc(q["year"])}</cite>\n'
                    f'          </blockquote>\n')
        quotes = ""
        if t.get("quote"):
            quotes += block(t["quote"], True)
        for extra in (t.get("also") or []):
            quotes += block(extra, False)
        out.append(
            '      <li class="seat">\n'
            f'        <p class="seat__lamp" aria-hidden="true"></p>\n'
            f'        <div class="seat__body">\n'
            f'          <h3>{esc(t["name"])}</h3>\n'
            f'          <p class="seat__said">{esc(t["said"])}</p>\n'
            f'          <p class="seat__whose">{esc(t["whose"])}{when}</p>\n'
            f'{contested}'
            f'{quotes}'
            f'          <p class="seat__note">{esc(t["note"])}</p>\n'
            '        </div>\n'
            '      </li>')
    return "\n".join(out)


def credit_rows(tenets):
    return "\n".join(
        f'      <tr><td>{esc(t["name"])}</td><td>{esc(t["whose"])}</td>'
        f'<td>{"yes" if t.get("contested") else "&mdash;"}</td></tr>'
        for t in tenets)


def main():
    d = json.loads(DATA.read_text())
    cap = MAX_QUOTE_WORDS
    bad = check(d, cap)
    if bad:
        print("REFUSING to build Covenstead:")
        for b in bad:
            print("  - " + b)
        return 1

    swap(ROOM, "covenstead-table", table(d["tenets"]), "    ")
    swap(NOTES, "covenstead-credits", credit_rows(d["tenets"]), "      ")

    argued = sum(1 for t in d["tenets"] if t.get("contested"))
    quoted = sum(bool(t.get("quote")) + len(t.get("also") or []) for t in d["tenets"])
    print(f"covenstead: {len(d['tenets'])} tenets on the table, {argued} of them marked "
          f"contested and saying why, {quoted} quotations at or under {cap} words, every "
          "one naming its author, its work and its edition. Nobody initiated.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
