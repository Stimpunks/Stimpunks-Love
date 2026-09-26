#!/usr/bin/env python3
"""Build The Broadsheet Broadside's sheets, both sides of each, out of data/broadside.json.

ONE DATA FILE, ONE TOOL. Every sheet is printed into broadsheet-broadside.html
between the bb-sheets markers: its number and name, the moment somebody reaches
for it, a print button that ships hidden, and side A over side B. love.css's §60
dresses it and §62 prints it, one side to a page, on whysheet.press's page.

THE FORM IS NOT OURS. It is the Stimpunks broadsides' (stimpunks.org/library/
broadsides/, and whysheet.press, which prints them), and theirs is Alfie Kohn's
Why Sheet. So most of what this tool refuses is that method's own rules, written
down on stimpunks.org's print notes, arriving as checks rather than as advice:

  - A SHEET THAT IS NOT TWO SIDES. A broadside here is one sheet printed both
    sides: the face carries one thing readable across a room, the reverse does
    the work. A third side is a booklet and one side is a poster, which is
    finished once you have looked at it.

  - A CLAIM LINE LONGER THAN CLAIM_WORDS. The one job side A's big line has is
    to be read across a room, and past a dozen words it is a paragraph set large.

  - MORE THAN ONE QUOTATION A SIDE, OR ONE THAT DOES NOT SAY WHOSE IT IS, WHERE
    IT CAME FROM AND HOW IT WAS CHECKED. The Stimpunks monotropism sheet's rule:
    two quotations and every other line ours is what keeps a sheet an adaptation
    rather than a republication. The first sheet carries none.

  - TWO INKS THAT DO NOT CLEAR AA ON WHITE, TWO THAT ARE THE SAME, OR A PAIR
    ANOTHER SHEET ALREADY HAS. Each sheet has its own pair of spot inks, and the
    pair is the point: hues run out long before pairs do, and the pair is what
    tells two sheets apart face down in a stack. §62 lets these inks survive the
    street's print reset, which is exactly why they are measured here.

  - A SHEET WITH NO MOMENT. Every Stimpunks broadside names the moment somebody
    reaches for it, and that is the part that decides whether a thing should be
    a sheet at all.

  - A LINK WHOSE WORDS ARE NOT ITS ADDRESS. On paper a link is an underlined
    word that goes nowhere -- §62's own comment about the sign-off -- so every
    address on a sheet is printed as the address, and §62 stops the street's
    print rule writing it out a second time. A stimpunks.org address keeps its
    trailing slash, which is make-library.py's rule and that site's redirects'.

  - AN ORDER AIMED AT THE READER. "Served across your bow": a shot across the
    bow is the one that is meant to miss. It makes you look, and a broadside is
    for that and nothing more. A manifesto says what WE will do; a sheet that
    says what YOU must is a different object with our name on it, and it is the
    friendly edit most likely to arrive, because every flyer ever printed ends in
    one. The pattern is second person and narrow, for check-counts.py's
    first-run reason: "Turn over" is a direction on a piece of paper, not an
    order about somebody's life.

  - A GUN. The ship in this room has sheets in its ports and no guns, and the
    tool that builds the sheets refuses the vocabulary of firing AT somebody in
    them, because a room that says nothing is aimed at anybody cannot print a
    page that is.

AND TWO LINES IT WRITES ITSELF, SO THAT NEITHER CAN BE LEFT OFF A SHEET: the
type credit, read out of data/foundry-faces.json for the two families the sheet
is set in rather than typed, and the licence, out of the sheet's own record.
Attribution is the habit this street kept when it dropped the others, and a
printed sheet is the one place a credit cannot be a link somebody follows later.
"""
import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data/broadside.json"
FACES = ROOT / "data/foundry-faces.json"
ROOM = ROOT / "broadsheet-broadside.html"

CLAIM_WORDS = 12
AA = 4.5
# The two families every sheet is set in. The credit on each sheet names who
# drew them, read off the record, never typed.
SHEET_FACES = ("atkinson-hyperlegible-next", "atkinson-hyperlegible-mono")

HEX = re.compile(r"^#[0-9A-Fa-f]{6}$")
LINK = re.compile(r'<a\s+href="([^"]+)"\s*>(.*?)</a>', re.S)
ANY_A = re.compile(r"<a\b", re.I)
# Second person, and only the forms that are an order. "you can", "you will
# find" and "you decide" are descriptions and are left alone.
ORDER = re.compile(
    r"\byou\s+(?:should|must|need\s+to|have\s+to|ought\s+to|had\s+better|are\s+required\s+to)\b",
    re.I)
AIMED = re.compile(r"\b(?:open\s+fire|fire\s+(?:on|at)|aimed\s+at\s+you|take\s+aim|broadside\s+(?:at|on)\s+you)\b", re.I)


def plain(h):
    return html.unescape(re.sub(r"<[^>]+>", "", h))


def lum(hexv):
    h = hexv.lstrip("#")
    out = []
    for i in (0, 2, 4):
        c = int(h[i:i + 2], 16) / 255
        out.append(c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4)
    r, g, b = out
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def on_white(hexv):
    return 1.05 / (lum(hexv) + 0.05)


def address(href):
    """What a link on paper should read as: the href without its scheme, and a
    bare host without its trailing slash."""
    a = re.sub(r"^https?://", "", href)
    if a.endswith("/") and a.count("/") == 1:
        a = a[:-1]
    return a


def texts(side):
    """Every HTML field on one side, with a label for the refusal message."""
    out = []
    for k in ("side", "title", "standfirst", "claim", "claim_sub", "foot_left", "foot_right"):
        if side.get(k):
            out.append((k, side[k]))
    for i, p in enumerate(side.get("panels") or []):
        out += [(f"panel {i + 1} name", p["name"]), (f"panel {i + 1}", p["text"])]
    if side.get("motto"):
        out += [("motto", side["motto"]["text"]), ("motto's line", side["motto"]["whose"])]
    for i, c in enumerate(side.get("cols") or []):
        out.append((f"column {i + 1} head", c["head"]))
        out += [(f"column {i + 1} item {j + 1}", t) for j, t in enumerate(c["items"])]
    if side.get("principle"):
        out += [("principle head", side["principle"]["head"]),
                ("principle", side["principle"]["text"])]
    for i, s in enumerate(side.get("sources") or []):
        out.append((f"source {i + 1}", s))
    # A list here is refused in check(); read every item anyway, so a malformed
    # quotation is refused for being malformed rather than crashing the tool.
    qs = side.get("quote") or []
    for q in (qs if isinstance(qs, list) else [qs]):
        if isinstance(q, dict):
            out += [("quotation", q.get("text", "")), ("quotation's credit", q.get("who", ""))]
    return out


def check(d, faces):
    bad, pairs, ids = [], {}, set()
    for f in SHEET_FACES:
        if f not in faces:
            bad.append(f"{f}: not in data/foundry-faces.json, so the sheet's type credit "
                       "has nobody to name. Run tools/pull-foundry.py.")
    sheets = d.get("sheets") or []
    if not sheets:
        bad.append("no sheets. A press with nothing on it would render as a heading over "
                   "nothing; the room says in words what it prints until it prints something.")
    for n, s in enumerate(sheets, 1):
        who = f"No. {s.get('number', n)}"
        if s.get("id") in ids or not re.fullmatch(r"no-\d+", s.get("id", "")):
            bad.append(f"{who}: id {s.get('id')!r} is missing, repeated, or not no-N.")
        ids.add(s.get("id"))
        if s.get("number") != n:
            bad.append(f"{who}: numbered {s.get('number')} in position {n}. The press "
                       "numbers its sheets in the order they were printed, and never again.")
        for k in ("name", "moment", "made", "licence", "licence_href", "spots_why"):
            if not s.get(k):
                bad.append(f"{who}: no {k}.")
        if set(k for k in s if k in ("a", "b", "c")) != {"a", "b"}:
            bad.append(f"{who}: a sheet is two sides, A and B, and nothing else.")
            continue
        spots = s.get("spots") or []
        if len(spots) != 2 or not all(HEX.match(x) for x in spots):
            bad.append(f"{who}: needs exactly two spot inks, as #RRGGBB.")
        else:
            if spots[0].lower() == spots[1].lower():
                bad.append(f"{who}: its two spot inks are the same ink.")
            for x in spots:
                r = on_white(x)
                if r < AA:
                    bad.append(f"{who}: spot ink {x} is {r:.2f} on white, under {AA}. "
                               "Darken it until it prints; do not lighten the bar.")
            key = frozenset(x.lower() for x in spots)
            if key in pairs:
                bad.append(f"{who}: its spot pair is {pairs[key]}'s. The pair is what tells "
                           "two sheets apart face down in a stack.")
            pairs[key] = who
        for side_key in ("a", "b"):
            side = s[side_key]
            label = f"{who} side {side_key.upper()}"
            if not side.get("title") or not side.get("foot_left") or not side.get("foot_right"):
                bad.append(f"{label}: needs a title and both halves of its foot.")
            q = side.get("quote")
            if isinstance(q, list):
                bad.append(f"{label}: one quotation a side at most, and this holds a list.")
            elif q:
                for k in ("text", "who", "work", "href", "checked"):
                    if not q.get(k):
                        bad.append(f"{label}: its quotation has no {k}. Whose it is, where it "
                                   "came from and how it was checked all go on the paper.")
            for where, h in texts(side):
                if ORDER.search(plain(h)):
                    bad.append(f"{label}, {where}: tells the reader what they must do "
                               f"({ORDER.search(plain(h)).group(0)!r}). A shot across the "
                               "bow is meant to miss.")
                if AIMED.search(plain(h)):
                    bad.append(f"{label}, {where}: {AIMED.search(plain(h)).group(0)!r}. "
                               "Nothing on this ship is aimed at anybody.")
                if len(ANY_A.findall(h)) != len(LINK.findall(h)):
                    bad.append(f"{label}, {where}: a link that is not a plain "
                               '<a href="...">address</a>.')
                for href, words in LINK.findall(h):
                    if plain(words).strip() != address(href):
                        bad.append(f"{label}, {where}: the link to {href} reads "
                                   f"{plain(words)!r}. On paper a link is its address.")
                    if re.match(r"https?://stimpunks\.org/.+[^/]$", href):
                        bad.append(f"{label}, {where}: {href} has no trailing slash, and "
                                   "on stimpunks.org a redirect is a failure.")
        a = s["a"]
        if not a.get("claim"):
            bad.append(f"{who} side A: no claim line, and it is the one thing side A is for.")
        else:
            words = len(plain(a["claim"]).split())
            if words > CLAIM_WORDS:
                bad.append(f"{who} side A: the claim line is {words} words. Past "
                           f"{CLAIM_WORDS} it is a paragraph set large, and nobody reads it "
                           "across a room.")
        if len(a.get("panels") or []) not in (2, 3):
            bad.append(f"{who} side A: two or three panels under the claim, which is what "
                       "fits a face and still reads as one thing.")
        if not s["b"].get("cols"):
            bad.append(f"{who} side B: no columns. The reverse is where the work is.")
    return bad


def spot_style(s):
    return f"--bb-spot: {s['spots'][0]}; --bb-spot-2: {s['spots'][1]};"


def type_credit(faces):
    fams = " and ".join(faces[f]["family"].replace("Atkinson Hyperlegible ", "")
                        if i else faces[f]["family"] for i, f in enumerate(SHEET_FACES))
    who = {faces[f]["designer"] for f in SHEET_FACES}
    lic = {faces[f]["licence"] for f in SHEET_FACES}
    if len(who) != 1 or len(lic) != 1:
        # Two different hands or licences cannot share one sentence without one
        # of them being misreported; say each in full.
        return " &middot; ".join(
            f"Set in {html.escape(faces[f]['family'])}, by {html.escape(faces[f]['designer'])}, "
            f"under the {html.escape(faces[f]['licence'])}." for f in SHEET_FACES)
    names = [n.strip() for n in who.pop().split(",")]
    hands = ", ".join(names[:-1]) + " and " + names[-1] if len(names) > 1 else names[0]
    return (f"Set in {html.escape(fams)}, by {html.escape(hands)}, "
            f"under the {html.escape(lic.pop())}.")


def mast(s, side):
    return (f'      <header class="bb-mast">\n'
            f'        <p class="bb-mast__org"><strong>The Broadsheet Broadside</strong>'
            f'Manifestos and mementos &middot; No. {s["number"]}</p>\n'
            f'        <p class="bb-mast__side">{side["side"]}</p>\n'
            f'      </header>')


def foot(side):
    return (f'      <footer class="bb-foot">\n'
            f'        <p class="bb-foot__left">{side["foot_left"]}</p>\n'
            f'        <p class="bb-foot__right">{side["foot_right"]}</p>\n'
            f'      </footer>')


def quote(q, indent="      "):
    if not q:
        return []
    return [f'{indent}<blockquote class="bb-quote">',
            f'{indent}  <p>{q["text"]}</p>',
            f'{indent}  <p class="bb-cite">{q["who"]}, <a href="{html.escape(q["href"])}">'
            f'{address(q["href"])}</a></p>',
            f'{indent}</blockquote>']


def side_a(s):
    a, sid = s["a"], s["id"]
    out = [f'    <section class="bb-sheet bb-sheet--a" aria-labelledby="{sid}-a">',
           mast(s, a),
           f'      <h3 class="bb-title" id="{sid}-a">{a["title"]}</h3>']
    if a.get("standfirst"):
        out.append(f'      <p class="bb-standfirst">{a["standfirst"]}</p>')
    out.append('      <div class="bb-bar" aria-hidden="true"></div>')
    out.append('      <div class="bb-claim">')
    out.append(f'        <p class="bb-claim__line">{a["claim"]}</p>')
    if a.get("claim_sub"):
        out.append(f'        <p class="bb-claim__sub">{a["claim_sub"]}</p>')
    out.append('      </div>')
    out.append('      <div class="bb-panels">')
    for p in a["panels"]:
        out += ['        <div class="bb-panel">',
                f'          <h4>{p["name"]}</h4>',
                f'          <p>{p["text"]}</p>',
                '        </div>']
    out.append('      </div>')
    if a.get("motto"):
        out += ['      <div class="bb-motto">',
                f'        <p>{a["motto"]["text"]}</p>',
                f'        <p class="bb-cite">{a["motto"]["whose"]}</p>',
                '      </div>']
    out += quote(a.get("quote"))
    out += [foot(a), '    </section>']
    return "\n".join(out)


def side_b(s, faces):
    b, sid = s["b"], s["id"]
    out = [f'    <section class="bb-sheet bb-sheet--b" aria-labelledby="{sid}-b">',
           mast(s, b),
           f'      <h3 class="bb-title" id="{sid}-b">{b["title"]}</h3>']
    if b.get("standfirst"):
        out.append(f'      <p class="bb-standfirst">{b["standfirst"]}</p>')
    out.append('      <div class="bb-cols">')
    for c in b["cols"]:
        out += ['        <div class="bb-col">',
                f'          <h4 class="bb-colhead">{c["head"]}</h4>',
                '          <ul class="bb-list">']
        out += [f'            <li>{t}</li>' for t in c["items"]]
        out += ['          </ul>', '        </div>']
    out.append('      </div>')
    if b.get("principle"):
        out += ['      <div class="bb-principle">',
                f'        <h4>{b["principle"]["head"]}</h4>',
                f'        <p>{b["principle"]["text"]}</p>',
                '      </div>']
    out += quote(b.get("quote"))
    for src in b.get("sources") or []:
        out.append(f'      <p class="bb-sources">{src}</p>')
    out.append(f'      <p class="bb-sources">{type_credit(faces)}</p>')
    page = "https://stimpunks.world/broadsheet-broadside.html"
    out.append(f'      <p class="bb-sources">This sheet: <a href="{page}">{address(page)}</a> '
               f'&middot; {html.escape(s["licence"])}, <a href="{html.escape(s["licence_href"])}">'
               f'{address(s["licence_href"])}</a>: copy it, change it and share it, with this '
               'line still on it.</p>')
    out += [foot(b), '    </section>']
    return "\n".join(out)


def shelf(d, faces):
    out = ['  <ol class="bb-shelf">']
    for s in d["sheets"]:
        sid = s["id"]
        out += [f'  <li class="bb-set" id="{sid}" style="{spot_style(s)}">',
                '    <div class="bb-issue">',
                f'      <h2 id="{sid}-h">No. {s["number"]}: {s["name"]}</h2>',
                f'      <p class="bb-moment"><b>The moment:</b> {s["moment"]}</p>',
                '      <p class="bb-printrow" hidden><button type="button" class="bb-print" '
                f'data-bb-sheet="{sid}">Print No. {s["number"]}, both sides</button></p>',
                '    </div>',
                '    <div class="bb-sides">',
                side_a(s),
                side_b(s, faces),
                '    </div>',
                '  </li>']
    out.append('  </ol>')
    return "\n".join(out)


def swap(page, marker, block, indent=""):
    begin, end = f"<!-- {marker}:begin -->", f"<!-- {marker}:end -->"
    src = page.read_text()
    if begin not in src or end not in src:
        raise SystemExit(
            f"REFUSING: {page.name} has no {marker} markers, so there is nowhere\n"
            "to print. Add them on purpose rather than letting this tool render nothing.")
    page.write_text(re.sub(re.escape(begin) + r".*?" + re.escape(end),
                           lambda m: begin + "\n" + block + "\n" + indent + end,
                           src, flags=re.S))


def main():
    d = json.loads(DATA.read_text())
    faces = json.loads(FACES.read_text())
    faces = faces.get("faces", faces)
    bad = check(d, faces)
    if bad:
        print("REFUSING to print The Broadsheet Broadside:")
        for b in bad:
            print("  - " + b)
        return 1
    swap(ROOM, "bb-sheets", shelf(d, faces), "  ")
    n = len(d["sheets"])
    print(f"broadside: {n} sheet{'s' if n != 1 else ''} on the press, both sides of each, "
          "every address printed as an address and every ink measured on white.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
