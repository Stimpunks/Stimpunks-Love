#!/usr/bin/env python3
"""Write the rack in Excursions (excursions.html, §141) from data/excursions.json.

    python3 tools/make-excursions.py

An excursion is part room, part announcement and part run of show, made by
somebody for one of our gatherings, and its page is its maker's. This room only
keeps the rack, so everything on a brochure that could drift is read off the
excursion's own page rather than typed here: its title is the page's <h1>, and
the line of ours under it names, in `holds`, words the page still says.

IT REFUSES:
  · an excursion whose page is not on the street, or does not link back to
    excursions.html (a brochure for a page you cannot come back from);
  · a date that is not a day (YYYY-MM-DD), or two entries for one page;
  · an entry without its maker's name, its gathering or its line;
  · a `holds` its page no longer says;
  · a count of excursions or a ranking in the room's own words or in a line,
    because the rack's only order is the date and nobody is counting outings;
  · a page with no exc:rack markers to write between.
"""
import html
import json
import re
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "excursions.json"
PAGE = ROOT / "excursions.html"
BEGIN, END = "<!-- exc:rack:begin -->", "<!-- exc:rack:end -->"
DAY = re.compile(r"^\d{4}-\d{2}-\d{2}$")
# A number of outings, or a ranking of them, in our words.
COUNT = re.compile(r"\b(?:\d+|one|two|three|four|five|six|seven|eight|nine|ten|dozens?)\s+(?:excursions|outings|brochures)\b"
                   r"|\b(?:best|top|most popular|favourite|favorite)\s+(?:excursion|outing|brochure)s?\b", re.I)


def plain(h):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", h))).strip()


def when(day, gathering):
    d = date.fromisoformat(day)
    return f"{html.escape(gathering)} &middot; {d.strftime('%A')} {d.day} {d.strftime('%B %Y')}"


def main():
    data = json.loads(DATA.read_text())
    items = data.get("excursions", [])
    problems, seen = [], set()
    for e in items:
        page = e.get("page", "")
        where = f"data/excursions.json: {page or '(no page)'}"
        if page in seen:
            problems.append(f"{where} is on the rack twice.")
        seen.add(page)
        for k in ("made_by", "gathering", "line"):
            if not (e.get(k) or "").strip():
                problems.append(f"{where} has no {k}.")
        if not DAY.match(e.get("date", "")):
            problems.append(f"{where}: date {e.get('date')!r} is not YYYY-MM-DD.")
        if COUNT.search(e.get("line", "")):
            problems.append(f"{where}: the line counts or ranks outings. The rack's only order is the date.")
        p = ROOT / page
        if not page or not p.exists():
            problems.append(f"{where} is not a page on the street.")
            continue
        src = p.read_text()
        if 'href="excursions.html"' not in src:
            problems.append(f"{where} does not link back to excursions.html, so a brochure would lead "
                            "somewhere with no way back to the rack.")
        h1 = re.search(r"<h1[^>]*>(.*?)</h1>", src, re.S)
        if not h1:
            problems.append(f"{where} has no <h1> to put on its brochure.")
        e["_title"] = plain(h1.group(1)) if h1 else ""
        text = plain(src)
        for h in e.get("holds", []):
            if h not in text:
                problems.append(f"{where}: the page no longer says {h!r}. Change the line with the page, "
                                "and its holds with it; never delete the holds to quiet this.")
        if not e.get("holds"):
            problems.append(f"{where} has no holds: words its page says that the line depends on.")
    room = PAGE.read_text()
    if BEGIN not in room or END not in room:
        problems.append("excursions.html has no exc:rack markers, so there is nowhere to write the rack.")
    if COUNT.search(plain(re.sub(re.escape(BEGIN) + r".*?" + re.escape(END), "", room, flags=re.S))):
        problems.append("excursions.html counts or ranks outings in its own words.")
    if problems:
        print("REFUSING:\n  " + "\n  ".join(problems))
        return 1

    rows = []
    for e in sorted(items, key=lambda e: e["date"], reverse=True):
        who = f"Made by {html.escape(e['made_by'])}" + (f", with {html.escape(e['with'])}" if e.get("with") else "")
        rows.append(
            f'      <li class="exc-brochure">\n'
            f'        <p class="exc-when">{when(e["date"], e["gathering"])}</p>\n'
            f'        <h3><a href="{e["page"]}">{html.escape(e["_title"])}</a></h3>\n'
            f'        <p class="exc-who">{who}</p>\n'
            f'        <p class="exc-line">{html.escape(e["line"])}</p>\n'
            f'      </li>')
    block = '    <ol class="exc-rack">\n' + "\n".join(rows) + "\n    </ol>" if rows else \
        '    <p>The rack is waiting for its first brochure.</p>'
    new = re.sub(re.escape(BEGIN) + r".*?" + re.escape(END), lambda m: BEGIN + "\n" + block + "\n" + END,
                 room, flags=re.S)
    if new != room:
        PAGE.write_text(new)
    print("excursions: the rack is written from data/excursions.json, newest first, every title read off its page")
    return 0


if __name__ == "__main__":
    sys.exit(main())
