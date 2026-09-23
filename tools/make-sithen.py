#!/usr/bin/env python3
"""Build Sithen's ring of rules and its documented half, and the credits.

ONE DATA FILE, ONE TOOL, TWO SURFACES -- the contract make-chappell.py,
make-club.py, make-lagoon.py and make-hermitage.py keep.

WHAT IT REFUSES:

  - A FURNISHING SOURCED TO EITHER NOVEL SERIES. This is the refusal the room
    exists on and the only one here that could not be recovered from later.
    Laurell K. Hamilton's Merry Gentry books and Seanan McGuire's October Daye
    books are what pointed us at this and are credited in the room by name;
    nothing of either invented world is used, because those are living authors'
    property and a page cannot borrow a court, a politics or a cosmology and
    call it folklore. THE FRIENDLY EDIT IS REAL AND IT WILL ARRIVE: the
    tradition is thin exactly where a novel is rich, so the most useful thing
    lying around is the one thing this room may not pick up. It is
    make-sweetgrass.py's refusal of a reading marked 'screen', in a room where
    the borrowed version would read better.

    'knowe' IS NOT IN THE GUARD, deliberately. It is a genuine Scots word for a
    knoll, older than any novel that uses it, and refusing it would be this tool
    handing a living author a word that is not theirs -- the mirror image of the
    mistake it is here to prevent. The guard names the series and the authors,
    which is what actually identifies a borrowing.

  - A RULE WITH NO PLAIN READING, and a plain reading is OURS. The fae taboos
    are a catalogue of consequential rules nobody will state out loud, which is
    the ordinary experience of neurotypical convention for a great many autistic
    people. That reading is not in the folklore and is not claimed to be. A rule
    published without it is a piece of atmosphere, and this room is not
    decoration.

  - A RULE WITH NO SOURCE. The half that is traditional has to say so, because
    the whole argument of the page is that one half is inherited and one half is
    ours, and a reader cannot tell them apart by tone.

  - ADVICE. Nothing here tells anybody how to behave -- no 'you should', no
    'try to', no 'learn to', no 'practise'. A page about unwritten rules that
    ended in guidance on following them would be a social skills curriculum with
    thorns on it. The pattern is NARROW on purpose, second person only:
    check-counts.py's first run refused a sentence that counted nothing and
    make-guild.py's refused the verb in 'a book it points at', and both were
    narrowed rather than excepted.

  - A NOTE SHAPED LIKE VERSE, make-rabbit-hole.py's rule, because several short
    hand-broken lines is what a charm or a rhyme looks like in a JSON string and
    a good deal of this tradition travels as verse that somebody else collected.

  - AN HTML ENTITY IN ANY FIELD. Everything here is escaped on the way into the
    markup, so '&mdash;' in the data arrives on the page as eight literal
    characters. data/toys.json carries this for a data attribute,
    data/rabbit-hole.json for a string that got uppercased, and data/lagoon.json
    for an escaped note; this is the fourth shape of it. Write the character.
"""
import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data/sithen.json"
ROOM = ROOT / "sithen.html"
NOTES = ROOT / "liner-notes.html"

ENTITY = re.compile(r"&(?:[a-zA-Z][a-zA-Z0-9]{1,31}|#\d{1,6}|#x[0-9a-fA-F]{1,6});")

# The series and the people who wrote them. Names rather than vocabulary, for
# the reason the docstring gives about 'knowe'.
BORROWED = re.compile(
    r"merry gentry|meredith gentry|laurell|hamilton|"
    r"october daye|toby daye|seanan|mcguire|fandom", re.I)

# Second person only, and only where somebody is being told what to do. "The
# bargain is kept to the letter" and "you may not be able to leave" are
# descriptions and must survive.
ADVICE = re.compile(
    r"\byou should\b|\byou must\b|\byou need to\b|\btry to\b|\blearn to\b|"
    r"\bpracti[sc]e\b|\bmake sure you\b|\bremember to\b", re.I)

VERSE_LINE = 52


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


def check(d):
    bad = []
    rules = d.get("rules") or []
    fort = (d.get("fort") or {}).get("facts") or []
    if not rules:
        bad.append("data/sithen.json has no rules, and the ring is made of them.")
    if not fort:
        bad.append("data/sithen.json has no documented facts, and the room keeps the "
                   "inherited half and the recorded half apart on purpose.")

    for r in rules:
        t = (r.get("rule") or "").strip() or "<untitled>"
        for field in ("rule", "said", "source", "like"):
            v = (r.get(field) or "").strip()
            if not v:
                if field == "like":
                    bad.append(
                        f"{t!r} has no plain reading. The reading is the half of this room "
                        "that is ours, and a rule published without it is atmosphere.")
                elif field == "source":
                    bad.append(
                        f"{t!r} names no source. One half of this page is inherited and one "
                        "half is ours, and a reader cannot tell them apart by tone.")
                else:
                    bad.append(f"{t!r} has no {field}.")
                continue
            if ENTITY.search(v):
                bad.append(
                    f"{t!r}'s {field} contains an HTML entity. Everything here is escaped "
                    "on the way into the page, so it would arrive as literal characters.")
            if BORROWED.search(v):
                bad.append(
                    f"{t!r}'s {field} names one of the two novel series or their authors. "
                    "They are credited in the room as what pointed us here and nothing is "
                    "drawn from them -- those are living authors' invented worlds. The "
                    "tradition is thin exactly where a novel is rich, which is why this "
                    "refusal exists rather than being left to care.")
            if ADVICE.search(v):
                bad.append(
                    f"{t!r}'s {field} tells the reader how to behave. Nothing here does: a "
                    "page about unwritten rules that ended in advice on following them "
                    "would be a social skills curriculum with thorns on it.")
            if looks_like_verse(v):
                bad.append(
                    f"{t!r}'s {field} is several short hand-broken lines, which is what a "
                    "charm looks like. A good deal of this tradition travels as verse "
                    "somebody else collected, and none of it is reproduced here.")

    for f in fort:
        w = (f.get("what") or "").strip() or "<untitled>"
        if not w:
            bad.append("a documented fact with nothing in it.")
        if not (f.get("detail") or "").strip():
            bad.append(f"{w!r} has no detail. A bare assertion in the documented half is "
                       "the half that is supposed to be checkable.")
        for field in ("what", "detail"):
            v = f.get(field) or ""
            if ENTITY.search(v):
                bad.append(f"{w!r}'s {field} contains an HTML entity.")
            if BORROWED.search(v):
                bad.append(f"{w!r}'s {field} names one of the novel series. The documented "
                           "half is earthworks and a motorway, not anybody's fiction.")
    return bad


def ring(rules):
    out = []
    for i, r in enumerate(rules, 1):
        out.append(
            '      <li class="rule">\n'
            f'        <p class="rule__no">{i:02d}</p>\n'
            f'        <div class="rule__body">\n'
            f'          <h3>{esc(r["rule"])}</h3>\n'
            f'          <p class="rule__said">{esc(r["said"])}</p>\n'
            f'          <p class="rule__from">Traditional &middot; {esc(r["source"])}</p>\n'
            f'          <p class="rule__like"><b>What it is like:</b> {esc(r["like"])}</p>\n'
            '        </div>\n'
            '      </li>')
    return "\n".join(out)


def ground(fort):
    out = []
    for f in fort:
        out.append(
            '      <li class="dug">\n'
            f'        <p class="dug__what">{esc(f["what"])}</p>\n'
            f'        <p>{esc(f["detail"])}</p>\n'
            '      </li>')
    return "\n".join(out)


def credit_rows(rules):
    return "\n".join(
        f'      <tr><td>{esc(r["rule"])}</td><td>{esc(r["source"])}</td>'
        f'<td>ours</td></tr>'
        for r in rules)


def main():
    d = json.loads(DATA.read_text())
    bad = check(d)
    if bad:
        print("REFUSING to build Sithen:")
        for b in bad:
            print("  - " + b)
        return 1

    swap(ROOM, "sithen-ring", ring(d["rules"]), "    ")
    swap(ROOM, "sithen-ground", ground(d["fort"]["facts"]), "    ")
    swap(NOTES, "sithen-credits", credit_rows(d["rules"]), "      ")

    print(f"sithen: {len(d['rules'])} rules on the bank, "
          f"{len(d['fort']['facts'])} documented facts, credits rebuilt. "
          "Nothing drawn from either novel, and the door is not opened.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
