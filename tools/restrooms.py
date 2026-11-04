"""What the street's public restrooms share, and nothing they do not.

WHAT THEY ARE. Ryan Boren's brief, 2026-11-03: public restrooms on Danny the
Street, each a room of its own with a name and a theme, after Norway's
scenic-route rest stops (which Visit Norway showed off in October 2026, after
an American president called Norway a name), Step 'n Wash's writing on
restroom design, and our own Bathroom Access page, where a young Stimpunk
coined "stallbatting". Every one of them has everything in
data/restrooms.json: for everybody, toilets and urinals, wheelchair
accessible, a Step 'n Wash, changing tables for babies and adults, free
menstrual products and condoms, sharps disposal, naloxone, somewhere to sit,
soap and paper towels, no air dryers, private stalls with a light that says
free or in use in words, shelves and hooks, clear signs, and free to use.

WHY ONE MODULE. Each restroom has its own tool, its own section of love.css
and its own world, and no two of them look alike: this file holds no colour,
no class and no drawing. What is here is the list every restroom must carry,
written into each room in that room's own classes and words, so the promise
cannot drift room by room, and the sweep that holds each room's own words to
it. natures.py's arrangement for Nature's Contribution, and make-coworking.py's
for Cavendish's rooms.

WHAT IT REFUSES IN A ROOM'S OWN WORDS (the room's data, never the shared list
or a quotation):
  · a restroom that does not say how it does every one of the list's things,
    in a sentence of its own (`how`), or says one it does not know;
  · a gendered sign: men's, women's, ladies, gents, male or female, because
    every stall is for everybody, and the friendly edit is a "ladies" sign on
    one of them "for character";
  · an air dryer or hand dryer, except saying there is none;
  · anything to pay or buy, a coin, a key from the counter, a fee, a token;
  · a count of the street's restrooms, which goes stale the day another opens;
  · "disabled toilet" or "handicapped": every stall is accessible here, so
    none is set apart;
  · a quotation that is not word for word on its page in the mirror, when the
    mirror is on this machine.
"""
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "restrooms.json"
MIRROR = Path.home() / "Documents/Claude/Projects/Stimpunks Knowledge System/site/stimpunks.org"

NEGATION = (r"(?:no|not|nothing|never|none|without|isn't|aren't|nobody|nor|instead of|"
            r"doesn't|does not|do not|don't|won't|will not)")
GENDERED = r"\b(?:men'?s|women'?s|ladies|gents|gentlemen|male|female|boys'?|girls'?)\b"
DRYER = r"\b(?:air|hand)[- ]?dryers?\b|\bairblades?\b|\bblowers?\b"
PAY = r"\b(?:pay|paid|paying|coins?|fees?|tokens?|charge[sd]?|purchase|buy|customers? only)\b"
COUNT = (r"\b(?:\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s+"
         r"(?:public\s+)?(?:restrooms|toilets|loos|conveniences|comfort stations)\b"
         r"|\b(?:every|all|each)\s+(?:of\s+the\s+)?(?:\d+|two|three|four|five)\s+(?:restrooms|toilets)\b")
APART = r"\bdisabled (?:toilet|loo|restroom|stall)s?\b|\bhandicapped\b"


class Problems(list):
    def refuse(self, msg):
        self.append(msg)

    def stop(self, what):
        if self:
            print(f"REFUSING ({what}):\n  " + "\n  ".join(self))
            raise SystemExit(1)


def esc(s):
    return html.escape(str(s), quote=False)


def attr(s):
    return html.escape(str(s), quote=True)


def plain(h):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", str(h)))).strip()


def shared():
    return json.loads(DATA.read_text())


def _sweep(text, where, pattern, why, problems, negatable=True):
    for m in re.finditer(pattern, text, re.I):
        before = text[max(0, m.start() - 60):m.start()]
        sentence = re.split(r"[.!?;:]\s", before)[-1]
        if negatable and re.search(r"\b" + NEGATION + r"\b", sentence, re.I):
            continue
        problems.refuse(f"{where}: {m.group(0)!r} {why}")


def sweep(text, where, problems):
    """Hold a room's own words to the list's promises."""
    t = plain(text)
    _sweep(t, where, GENDERED, "is a gendered sign; every stall here is for everybody.", problems)
    _sweep(t, where, DRYER, "is an air dryer; no restroom on the street has one.", problems)
    _sweep(t, where, PAY, "asks for money; every restroom on the street is free.", problems)
    _sweep(t, where, COUNT, "counts the street's restrooms, which goes stale the day another opens.", problems, False)
    _sweep(t, where, APART, "sets a stall apart; every stall here is accessible.", problems, False)


def check_room(room, where, problems):
    """Every restroom says how it does every one of the list's things."""
    ids = [a["id"] for a in shared()["amenities"]]
    how = room.get("how") or {}
    for i in ids:
        if not (how.get(i) or "").strip():
            problems.refuse(f"{where}: says nothing about how it does {i!r}; every restroom on the street does all of them.")
    for k in how:
        if k not in ids:
            problems.refuse(f"{where}: says how it does {k!r}, which is not on the list in data/restrooms.json.")
    for k, v in how.items():
        sweep(v, f"{where}, how it does {k}", problems)


def check_quotes(problems):
    if not MIRROR.exists():
        return
    for q in shared()["quotes"]:
        f = MIRROR / q["mirror"]
        if not f.exists():
            problems.refuse(f"data/restrooms.json: quotation {q['key']!r} names {q['mirror']}, which the mirror does not have.")
            continue
        page = re.sub(r"\s+", " ", f.read_text().replace("*", ""))
        if re.sub(r"\s+", " ", q["text"]) not in page:
            problems.refuse(f"data/restrooms.json: quotation {q['key']!r} is not word for word on {q['href']}. Re-copy it from the page; never loosen this.")


def amenities_block(room, prefix, indent="    "):
    """The list, in the room's own classes: the shared line, and the room's own
    sentence for how it does it. A room dresses .{prefix}-has* in its own
    section of love.css."""
    p = prefix
    out = [f'{indent}<ul class="{p}-has">']
    for a in shared()["amenities"]:
        out.append(f'{indent}  <li class="{p}-has__item" id="{p}-{a["id"]}">')
        out.append(f'{indent}    <h3 class="{p}-has__name">{a["name"]}</h3>')
        out.append(f'{indent}    <p class="{p}-has__line">{a["line"]}</p>')
        out.append(f'{indent}    <p class="{p}-has__how">{room["how"][a["id"]]}</p>')
        out.append(f'{indent}  </li>')
    out.append(f'{indent}</ul>')
    return "\n".join(out)


def quotes_block(keys, prefix, indent="    "):
    by = {q["key"]: q for q in shared()["quotes"]}
    out = []
    for k in keys:
        q = by[k]
        out.append(f'{indent}<blockquote class="{prefix}-quote">')
        out.append(f'{indent}  <p>{esc(q["text"])}</p>')
        out.append(f'{indent}  <footer>&mdash; {esc(q["who"])}, <a href="{attr(q["href"])}">{esc(q["work"])}</a></footer>')
        out.append(f'{indent}</blockquote>')
    return "\n".join(out)


def credits_line():
    """What every restroom credits, in the same words."""
    return ("Every public restroom on the street was built from Ryan Boren&rsquo;s brief after Norway&rsquo;s "
            "scenic-route rest stops, which <a href=\"https://www.visitnorway.com/\">Visit Norway</a> showed off in October "
            "2026; after <a href=\"https://stepnwash.com/blogs/news/public-restroom-design\">Step &rsquo;n Wash&rsquo;s own "
            "writing on restroom design</a> (Step &rsquo;n Wash is its maker&rsquo;s trade mark, and the step at the basins is "
            "theirs); and after our own <a href=\"https://stimpunks.org/access/bathrooms/\">Bathroom Access</a> page, where a "
            "young Stimpunk coined &ldquo;stallbatting&rdquo;.")


def swap(page, marker, block, problems, indent=""):
    src = page.read_text()
    a, b = f"<!-- {marker}:begin -->", f"<!-- {marker}:end -->"
    if a not in src or b not in src:
        problems.refuse(f"{page.name} has lost its {marker} markers.")
        return
    new = re.sub(re.escape(a) + r"\n.*?" + r"([ \t]*)" + re.escape(b),
                 lambda m: a + "\n" + block + "\n" + m.group(1) + b, src, flags=re.S)
    if new != src:
        page.write_text(new)
