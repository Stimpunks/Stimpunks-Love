#!/usr/bin/env python3
"""Build Nothing For Sale's tables and quotations, and the credits.

ONE DATA FILE, ONE TOOL, TWO SURFACES. The tables and the quotations go into
nothing-for-sale.html; the credits go into liner-notes.html.

WHAT IT REFUSES, and why each one is here:

  - A TABLE THAT IS NOT SOMETHING OF OURS, or not on a page the Knowledge
    System mirror has. A table with nothing on it is the one lie a free market
    can tell, and something of somebody else's laid out as a giveaway would be
    handing out what is not ours to hand. Checked whenever the mirror is on this
    machine, and it says so when it is not.

  - A PRICE, AND THE VOCABULARY OF SELLING. A currency sign beside a number, and
    buy, sell, price, discount, bargain -- in our own voice, with the negation
    window, so "nothing here is for sale" survives and so does the room's name.

  - THE VOCABULARY THAT SORTS PEOPLE THE WAY CHARITY DOES. The deserving,
    needy, handout, beneficiary, donor, less fortunate, means test, proof of
    need. Not the word charity itself, which the room has to be able to name. Mutual aid goes sideways and
    charity comes down, and one kind sentence about helping the less fortunate
    would turn the lay-by into the thing it is named against. Negation window,
    so "no proof of worthiness required" and "not charity" survive, and
    quotations are skipped because Sparrow's line has to be allowed to say what
    it is refusing.

  - THE VOCABULARY OF OBLIGATION. Owe, debt, in return, repay, pay it back, pay
    it forward, earn. Taking something here puts nobody in anybody's debt, which
    is Sithen's hospitality trap turned inside out; a sign asking people to pay
    it forward is the friendly version of a bill.

  - A TALLY. Nothing taken, left or visited is counted.

  - TWO HEADLIGHTS OF THE SAME COLOUR, or a table lit by a beam no car brought.
    No two lamps in the ring match, and the colours are read out of love.css's
    :root rather than copied here.

  - ANY ANIMATION IN §46. The cars are parked with their lights on and nothing
    in the ring flickers or sweeps.

  - A QUOTATION THAT IS NOT WORD FOR WORD ON THE PAGE OF OURS IT COMES FROM,
    and an HTML entity in any field.

IF THIS REFUSES: fix the cause. Do not loosen the tool.
"""
import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data/nothing-for-sale.json"
ROOM = ROOT / "nothing-for-sale.html"
NOTES = ROOT / "liner-notes.html"
CSS = ROOT / "love.css"
MIRROR = Path.home() / "Documents/Claude/Projects/Stimpunks Knowledge System/site/stimpunks.org"

ENTITY = re.compile(r"&(?:[a-zA-Z][a-zA-Z0-9]{1,31}|#\d{1,6}|#x[0-9a-fA-F]{1,6});")
NEGATION = (r"(?:no|not|nothing|never|neither|none|without|refuses?|refused|refusing|"
            r"cannot|does not|doesn't|won't|will not|is not|are not|isn't|aren't|nobody|nor)")
SELLING = r"for sale|buy|buying|sell|selling|prices?|priced|discount|bargain|cheap"
# NARROWED ON ITS FIRST RUN, NOT EXCEPTED. The first version refused the bare
# words charity and deserve, and its first run refused the room's own sentence
# explaining what charity is -- which is the argument, not the failure. What the
# room must never do is put its VISITORS in charity's categories, so the pattern
# is the words that sort people: the deserving, the needy, the less fortunate,
# beneficiaries, a means test. check-counts.py's first-run lesson, again.
CHARITY = (r"the deserving|deserving poor|needy|handouts?|beneficiar\w*|donors?|"
           r"less fortunate|means[- ]test\w*|proof of (?:need|worthiness)|worthy of|those in need")
OBLIGATION = r"owe|owing|debt|in return|repay|pay (?:it )?back|pay it forward|earn\w*"
TALLY = r"scores?|totals?|streaks?|tall(?:y|ies)|items? (?:given|taken)|counted up"
MONEY = re.compile(r"[£$€]\s?\d")

problems = []


def refuse(msg):
    problems.append(msg)


def sweep(name, vocab, text):
    bad = re.compile(rf"\b(?:{vocab})\b", re.I)
    ok = re.compile(rf"\b{NEGATION}\b[^.]{{0,80}}?\b(?:{vocab})\b", re.I)
    for sentence in re.split(r"(?<=[.!?])\s+", text):
        s = sentence.replace("Nothing For Sale", "")
        if bad.search(s) and not ok.search(s):
            refuse(f"{name} in the room's own voice: {sentence.strip()[:140]!r}")


def norm(s):
    s = html.unescape(s).replace("’", "'").replace("‘", "'")
    s = s.replace("“", '"').replace("”", '"')
    return re.sub(r"\s+", " ", re.sub(r"\*\*|__|\*", "", s)).strip().lower()


def mirror_file(url):
    m = re.match(r"https://stimpunks\.org/(.+?)/?$", url)
    if not m:
        return None
    parts = m.group(1).split("/")
    if parts[0] == "glossary":
        return MIRROR / "glossary" / f"{parts[1]}.md"
    return MIRROR / "pages" / ("__".join(parts) + ".md")


def e(s):
    return html.escape(s, quote=True)


def swap(src, marker, body, where):
    begin, end = f"<!-- {marker}:begin -->", f"<!-- {marker}:end -->"
    if src.count(begin) != 1 or src.count(end) != 1:
        raise SystemExit(f"REFUSING: {where} needs exactly one {marker} marker pair.")
    return re.sub(re.escape(begin) + r".*?" + re.escape(end),
                  lambda _: f"{begin}\n{body}\n{end}", src, count=1, flags=re.S)


def main():
    data = json.loads(DATA.read_text())
    room = ROOM.read_text()
    css = CSS.read_text()
    root = css[css.index(":root {"):]
    root = root[:root.index("\n}")]
    inks = dict(re.findall(r"(--nfs-[a-z0-9-]+):\s*(#[0-9A-Fa-f]{6})", root))

    for key in ("beams", "quotes", "tables"):
        for i, item in enumerate(data[key]):
            for k, v in item.items():
                if isinstance(v, str) and ENTITY.search(v):
                    refuse(f"{key}[{i}].{k}: an HTML entity. Write the character.")

    seen = {}
    for b in data["beams"]:
        v = inks.get(b["ink"])
        if not v:
            refuse(f"beam {b['car']!r}: {b['ink']} is not declared in :root.")
        elif v.lower() in seen:
            refuse(f"beams {seen[v.lower()]!r} and {b['car']!r} are the same colour. No two "
                   "headlights in the ring match.")
        else:
            seen[v.lower()] = b["car"]
    beams = {b["ink"] for b in data["beams"]}

    signs = set()
    for t in data["tables"]:
        where = f"table {t.get('sign')!r}"
        if t.get("beam") not in beams:
            refuse(f"{where}: lit by {t.get('beam')}, which no car in the ring brought.")
        if t.get("sign") in signs:
            refuse(f"{where}: two tables with one sign.")
        signs.add(t.get("sign"))
        if not t.get("line"):
            refuse(f"{where}: no line of ours saying what is on it.")
        if not re.match(r"https://stimpunks\.org/", t.get("url", "")):
            refuse(f"{where}: {t.get('url')} is not ours to lay out.")
        elif MIRROR.exists():
            f = mirror_file(t["url"])
            if not f or not f.exists():
                refuse(f"{where}: {t['url']} is not a page the mirror has.")
        if MONEY.search(t.get("line", "")):
            refuse(f"{where}: a price.")

    for q in data["quotes"]:
        for k in ("text", "author", "work", "work_url", "via", "via_title", "checked"):
            if not q.get(k):
                refuse(f"quote {q.get('id')}: no {k}.")
        if MIRROR.exists():
            f = mirror_file(q.get("via", ""))
            if not f or not f.exists() or norm(q["text"]) not in norm(f.read_text()):
                refuse(f"quote {q['id']}: not word for word on {q.get('via')}.")

    start = css.index("/* §46 ── ROOM: Nothing For Sale")
    sec = re.sub(r"/\*.*?\*/", "", css[start:css.index("/* §47 ", start)], flags=re.S)
    if re.search(r"@keyframes|\banimation\s*:", sec):
        refuse("§46 animates something. The cars are parked and the lamps are steady.")

    ours = re.sub(r"<!-- quest:[a-z0-9-]+:begin -->.*?<!-- quest:[a-z0-9-]+:end -->", " ", room,
                  flags=re.S)
    ours = re.sub(r"<blockquote\b.*?</blockquote>", " ", ours, flags=re.S)
    ours = re.sub(r"<(script|style|svg)\b.*?</\1>", " ", ours, flags=re.S)
    ours = re.sub(r"<!--.*?-->|<(?:title|meta)[^>]*>|<em>[^<]*</em>", " ", ours, flags=re.S)
    text = html.unescape(re.sub(r"<[^>]+>", " ", ours))
    text += " " + " ".join(t["what"] + ". " + t["line"] for t in data["tables"])
    if MONEY.search(text):
        refuse("a price in the room's own words.")
    sweep("selling", SELLING, text)
    sweep("charity", CHARITY, text)
    sweep("obligation", OBLIGATION, text)
    sweep("a tally", TALLY, text)

    if problems:
        print("REFUSING:\n  " + "\n  ".join(problems))
        return 1

    for q in data["quotes"]:
        who = ("" if q["author"] == "Stimpunks"
               else f'{e(q["author"])}, ')
        cite = (f'{who}<a href="{e(q["work_url"])}">{e(q["work"])}</a>'
                + ("" if q["work_url"] == q["via"]
                   else f', as our <a href="{e(q["via"])}">{e(q["via_title"])}</a> entry quotes it'))
        if q["author"] == "Stimpunks":
            cite = f'Our <a href="{e(q["via"])}">{e(q["via_title"])}</a> page'
        block = (f'    <blockquote class="nfs-said">\n      <p>{e(q["text"])}</p>\n'
                 f'      <cite>{cite}</cite>\n    </blockquote>')
        room = swap(room, f"nfs-quote:{q['id']}", block, ROOM.name)

    rows = []
    for t in data["tables"]:
        slug = t["beam"].replace("--nfs-", "")
        rows.append(f'      <li class="nfs-table nfs-table--{slug}">'
                    f'<p class="nfs-table__sign">{e(t["sign"])}</p>'
                    f'<h3 class="nfs-table__what"><a href="{e(t["url"])}">{e(t["what"])}</a></h3>'
                    f'<p class="nfs-table__line">{e(t["line"])}</p></li>')
    room = swap(room, "nfs-tables", "\n".join(rows), ROOM.name)
    ROOM.write_text(room)

    notes = NOTES.read_text()
    cr = [f'      <tr><td>{e(q["text"][:60])}{"…" if len(q["text"]) > 60 else ""}</td>'
          f'<td><strong>{e(q["author"])}</strong></td><td><a href="{e(q["work_url"])}">{e(q["work"])}</a></td></tr>'
          for q in data["quotes"]]
    NOTES.write_text(swap(notes, "nothing-for-sale-credits", "\n".join(cr), NOTES.name))

    print(f"nothing for sale: {len(data['tables'])} tables, {len(data['beams'])} headlights "
          f"and {len(data['quotes'])} quotations written.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
