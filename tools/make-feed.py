#!/usr/bin/env python3
"""Build feed.xml from changelog.html.

Every Stimpunks site publishes a changelog, and this one is a page rather than a
file. A page is not subscribable, so index.html briefly linked /feed.xml -- and
the link was removed rather than the file invented, because a hand-maintained RSS
file drifts the first week nobody remembers to update it. This is the tool that
makes the link honest: the feed is generated FROM the changelog, the way the
sitemap is generated from the pages' own heads, so the two cannot disagree.

RSS 2.0 with an atom:link self-reference, which is the shape queering.earth's
feed already uses. Where a decision is the same, the reasoning there is the
reasoning here.

IT REFUSES rather than guesses, like the other generators. Every <h2> in the
changelog must carry a stable id, because that id is the item's permalink and a
feed whose guids move republishes every entry into somebody's reader as if it
were new. It also refuses on a duplicate id or a date it cannot read.

SAME-DAY ENTRIES STEP BACK A MINUTE EACH, AND THE MINUTES ARE AN ORDER, NOT A
CLOCK. Several entries a day is normal here, and every one of them used to get
12:00:00 GMT. Readers sort on pubDate, and a tie gives them nothing to sort on:
on 2026-09-23 stimpunks.org's /feeds/ page showed ten of that day's entries in
an order of its own choosing and left out the newest one entirely, because the
day had more than ten. So the entry at the top of a day keeps 12:00:00 and each
one below it in the changelog is a minute earlier. The DATE is still the true
date. The time is not a claim about when anything was written, and nothing
should read it as one: it is document order (newest first) written in the only
field a reader actually sorts on. Changing a pubDate does not move a guid, so
no reader sees an old entry as new. It refuses a day with more entries than
there are minutes before noon, rather than letting one spill into the day
before.
"""
import datetime
import html
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE = "https://stimpunks.world"
# THE GUIDS STAY ON THE OLD DOMAIN, ON PURPOSE. The site moved from
# stimpunks.love to stimpunks.world on 2026-09-23, and a reader decides whether
# an item is new by its guid. Rewriting every guid to the new domain would have
# republished the whole changelog into everybody's reader as if it were news:
# exactly the failure the id refusal below exists to prevent, arriving through
# a domain move instead of a missing id. So a guid is an opaque name now
# (isPermaLink="false"), minted on the address the feed was born on, and the
# <link> beside it carries the live address. New entries get the same prefix:
# a guid is a name, not a location, and it never has to resolve.
GUID_BASE = "https://stimpunks.love"
SOURCE = "changelog.html"

H2 = re.compile(r'<h2(?P<attrs>[^>]*)>(?P<head>.*?)</h2>', re.S)
TAG = re.compile(r"<[^>]+>")


def text_of(fragment: str) -> str:
    """Visible text of an HTML fragment, whitespace collapsed."""
    t = re.sub(r"<(script|style)\b.*?</\1>", " ", fragment, flags=re.S | re.I)
    t = TAG.sub(" ", t)
    t = re.sub(r"\s+", " ", html.unescape(t)).strip()
    # Stripping inline tags leaves a space in front of whatever followed them:
    # "<strong>invisible</strong>." becomes "invisible ." and a closing quote
    # after an <em> drifts off its word. Pull punctuation back onto the word.
    t = re.sub(r"\s+([,.;:!?%\)\]”’])", r"\1", t)
    return re.sub(r"([(\[“‘])\s+", r"\1", t)


def main():
    src = (ROOT / SOURCE).read_text()
    body = src[src.index("<main"):src.index("</main>")]

    heads = list(H2.finditer(body))
    if not heads:
        raise SystemExit(f"REFUSING: no <h2> entries found in {SOURCE}.")

    entries, seen = [], set()
    for i, m in enumerate(heads):
        ident = re.search(r'id="([^"]+)"', m.group("attrs"))
        head = text_of(m.group("head"))
        if not ident:
            raise SystemExit(
                f"REFUSING: the changelog entry {head!r} has no id.\n"
                "That id is the feed item's permalink. Without a stable one every\n"
                "entry would reappear as new in somebody's reader each time this runs."
            )
        ident = ident.group(1)
        if ident in seen:
            raise SystemExit(f"REFUSING: two changelog entries share id {ident!r}.")
        seen.add(ident)

        date_m = re.match(r"(\d{4}-\d{2}-\d{2})\s*[—-]\s*(.+)", head)
        if not date_m:
            raise SystemExit(
                f"REFUSING: cannot read a date out of the entry {head!r}.\n"
                "Headings are 'YYYY-MM-DD — what changed'."
            )
        date = datetime.date.fromisoformat(date_m.group(1))
        title = date_m.group(2).strip()

        end = heads[i + 1].start() if i + 1 < len(heads) else len(body)
        summary = text_of(body[m.end():end])
        if not summary:
            raise SystemExit(f"REFUSING: the entry {title!r} has no body to describe.")
        entries.append((ident, date, title, summary))

    # Document order is newest first, so the n-th entry seen on a date is n minutes
    # before noon. See the docstring: the minutes are an order, not a clock.
    rank, times = {}, []
    for _, date, title, _ in entries:
        n = rank.get(date, 0)
        rank[date] = n + 1
        if n >= 12 * 60:
            raise SystemExit(f"REFUSING: more than {12 * 60} entries on {date}; "
                             f"{title!r} would step back into the previous day.")
        times.append(datetime.datetime.combine(date, datetime.time(12)) - datetime.timedelta(minutes=n))

    stamp = "{d:%a}, {d.day:02d} {d:%b %Y} {d:%H:%M:%S} GMT".format
    built = stamp(d=max(times))

    out = ['<?xml version="1.0" encoding="UTF-8"?>',
           '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
           "  <channel>",
           "    <title>Stimpunks.World — what changed on the street</title>",
           f"    <link>{SITE}/{SOURCE}</link>",
           f'    <atom:link href="{SITE}/feed.xml" rel="self" type="application/rss+xml"/>',
           "    <description>Every change to the rooms, the street that joins them and the "
           "campground past the treeline, "
           "newest first — including the things that are not built yet. Generated from "
           "changelog.html by tools/make-feed.py, so the page and the feed cannot "
           "disagree.</description>",
           "    <language>en</language>",
           "    <copyright>CC BY-SA 4.0</copyright>",
           f"    <lastBuildDate>{built}</lastBuildDate>"]

    for (ident, date, title, summary), when in zip(entries, times):
        url = f"{SITE}/{SOURCE}#{ident}"
        guid = f"{GUID_BASE}/{SOURCE}#{ident}"
        out += ["    <item>",
                f"      <title>{html.escape(title)}</title>",
                f"      <link>{url}</link>",
                f'      <guid isPermaLink="false">{guid}</guid>',
                f"      <pubDate>{stamp(d=when)}</pubDate>",
                f"      <description>{html.escape(summary)}</description>",
                "    </item>"]

    out += ["  </channel>", "</rss>", ""]
    (ROOT / "feed.xml").write_text("\n".join(out))
    print(f"feed.xml: {len(entries)} entries · latest {max(e[1] for e in entries)}")


if __name__ == "__main__":
    main()
