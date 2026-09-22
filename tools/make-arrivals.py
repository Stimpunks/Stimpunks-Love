#!/usr/bin/env python3
"""Set the arrivals board in The Feed, out of data/arrivals.json.

NOT make-feed.py. That one builds feed.xml, this site's OWN feed, and the two
files are one word apart on purpose-avoidance grounds: `feed.xml` is what this
street publishes, and The Feed is a room that reads everybody else's. The board
is named after the object -- an arrivals board -- so that a search for one never
lands on the other. If you came here looking for the RSS this site emits, it is
tools/make-feed.py.

WHY A TOOL. The same reason make-latibulum.py is one: a row has to say where it
goes, and the row and the plate under it have to agree about which feed it came
off. Hand-kept, that drifts the first time somebody adds a wire and the second
time somebody swaps a feed. And the pull is separate on purpose --
tools/pull-arrivals.py touches the network, this one touches nothing, so the
board can be re-set from the file on a train.

WHAT THE ROOM IS CLAIMING, which is what this file is guarding:

  · THE BOARD IS A SNAPSHOT AND SAYS SO. It cannot be anything else: none of
    these hosts sends an Access-Control-Allow-Origin header, so the page cannot
    read a feed, and the ways round it are a proxy we do not run or a reader we
    would be handing our visitors to. So every plate carries the minute its wire
    was read and the hall carries the minute the board was set, both GENERATED
    rather than typed. This is make-jungle.py's refused runtime the other way
    up: a live camera has no length to give and publishing one would be a number
    that goes quietly wrong, and a board HAS a time it was set, so leaving that
    off would be the identical fault upside down.

  · A ROW IS A NAME, A DATE AND A DESTINATION. Never a summary. A departures
    board does not read you the contents of the train, and that is not only the
    metaphor -- it is what keeps this page from republishing everybody else's
    writing onto one surface. SO A SUMMARY FIELD IS REFUSED, not ignored. The
    friendly edit is real and it will arrive: the rows look bare, somebody
    pastes the excerpts back, and the board is a reader. make-sweetgrass.py
    refuses a reading marked `screen` for the same reason.

  · NOTHING IS RANKED AND NO SITE'S ACTIVITY IS TOTALLED. No busiest, no
    quietest, no rows-per-week, nothing that says which of our sites has been
    getting on with it. A board that showed that would turn publishing into a
    race between our own people -- the pebbling cabinet's refusal of a tally,
    arriving between sites rather than inside a game, and it is exactly the
    feature somebody would add to make the hall feel more alive. The vocabulary
    is refused in the room's own copy, with the negation window make-guild.py
    uses, so that the room can still SAY it does not rank anything.

  · EVERY ROW LANDS ON THE HOST ITS WIRE IS NAMED AFTER. Checked in the puller
    and checked again here, because the two tools are read by different people
    on different days and this one is the one that publishes.

  · AND THE COUNTS IN THE ROOM'S OWN PROSE ARE WRITTEN BY THIS FILE, grammar
    included. Two wires are shorter than the rest today because their feeds have
    fewer items on them; that is a true thing to say and it stops being true the
    week Penguin Pebbling ships twice. make-jungle.py's lesson exactly -- its
    first version generated the number and left the tail plural, which is a
    hand-typed count wearing a disguise.

IF THIS REFUSES: fix the cause. Do not loosen the tool.
"""
import html
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "arrivals.json"
PAGE = ROOT / "the-feed.html"

# Fields that must never reach a row. Refused rather than dropped -- see the top.
BODY_FIELDS = ("summary", "description", "excerpt", "content", "body", "blurb", "extract")

ONES = ("zero one two three four five six seven eight nine ten eleven twelve "
        "thirteen fourteen fifteen sixteen seventeen eighteen nineteen").split()
TENS = ("- - twenty thirty forty fifty sixty seventy eighty ninety").split()

# The vocabulary of a league table. NEGATION window is wider than
# make-guild.py's forty characters because the sentences this room needs to be
# able to say are longer than the ones that board needs -- "nothing here says
# which of our sites has been busiest" is one clause and forty characters short.
RANK_NOUNS = (r"(?:busiest|most active|least active|quietest|liveliest|leader ?boards?|"
              r"top site|ranked by|ranking|rankings|winning|wins the week|"
              r"(?:posts?|items?|rows?|updates?|entries) (?:this|per) (?:week|month))")
NEGATION = (r"(?:no|not|nothing|never|neither|none|without|refuses?|refused|refusing|"
            r"cannot|does not|won't|will not|is not|are not|isn't|aren't|nobody)")
RANK = re.compile(rf"\b{RANK_NOUNS}", re.I)
RANK_OK = re.compile(rf"\b{NEGATION}\b[^.]{{0,80}}?\b{RANK_NOUNS}", re.I)


def die(msg):
    raise SystemExit(f"REFUSING: {msg}")


def e(s):
    return html.escape(str(s), quote=True)


def word(n):
    """Numbers in the room's prose are words, because the prose is prose. The
    board's own date columns are digits, because a board's are."""
    if n < 20:
        return ONES[n]
    if n < 100:
        return TENS[n // 10] + (f"-{ONES[n % 10]}" if n % 10 else "")
    return str(n)


def listify(names):
    """a, b and c — because a generated sentence has to be a sentence."""
    if len(names) == 1:
        return names[0]
    return ", ".join(names[:-1]) + " and " + names[-1]


def stamp(iso, with_time=True):
    """2026-09-22T03:56Z -> '03:56 UTC on 22 September 2026'."""
    dt = datetime.strptime(iso, "%Y-%m-%dT%H:%MZ").replace(tzinfo=timezone.utc)
    day = f"{dt.day} {dt.strftime('%B %Y')}"
    return f"{dt.strftime('%H:%M')} UTC on {day}" if with_time else day


def same_host(link, host):
    h = (urlparse(link).hostname or "").lower().removeprefix("www.")
    host = host.lower().removeprefix("www.")
    return h == host or h.endswith("." + host)


def slot(src, name, markup):
    """Replace one marked span, refusing a marker that is not there."""
    begin, end = f"<!-- arrivals:{name}:begin -->", f"<!-- arrivals:{name}:end -->"
    if src.count(begin) != 1 or src.count(end) != 1:
        die(
            f"the-feed.html has no single {begin} … {end} pair.\n"
            "A generator that writes nothing and exits 0 is how two surfaces drift apart "
            "— make-latibulum.py's rule."
        )
    a, b = src.index(begin), src.index(end) + len(end)
    return src[:a] + begin + "\n" + markup + end + src[b:]


# ── The board for one wire ───────────────────────────────────────────────────
# One <section> per site: a nameboard, the flap rows, and an enamel plate under
# it naming the feed and the minute it was read. The ROWS are an <ol> because
# they are in an order that means something (newest first) and a screen reader
# should say so.
def indicator(w):
    rows = []
    for it in w["items"]:
        d = it["date"][:10]
        rows.append(
            f'      <li class="flap">'
            f'<span class="flap__when"><time datetime="{e(it["date"])}">{e(d)}</time></span>'
            f'<span class="flap__dest"><a href="{e(it["url"])}">{e(it["title"])}</a></span>'
            f'<span class="flap__split" aria-hidden="true"></span>'
            f"</li>"
        )
    feed_short = w["feed"].removeprefix("https://")
    second = ""
    if w.get("second"):
        second = (
            f'    <p class="indicator__also">This site keeps another feed as well: '
            f'<a href="{e(w["second"])}">{e(w["second_name"])}</a>. '
            f'This wire is not that one.</p>\n'
        )
    return (
        f'  <section class="indicator" aria-labelledby="wire-{e(w["id"])}">\n'
        f'    <div class="indicator__head">\n'
        f'      <h3 class="indicator__name" id="wire-{e(w["id"])}">'
        f'<a href="{e(w["home"])}">{e(w["site"])}</a></h3>\n'
        f'      <p class="indicator__what">{e(w["note"])}</p>\n'
        f'    </div>\n'
        f'    <ol class="flaps">\n' + "\n".join(rows) + "\n    </ol>\n"
        + second +
        f'    <p class="enamel">'
        f'<span class="enamel__feed">Wire: {e(w["feed_name"])} &mdash; '
        f'<a href="{e(w["feed"])}">{e(feed_short)}</a></span>'
        f'<span class="enamel__read">Read at {stamp(w["read"])}</span>'
        f"</p>\n"
        f"  </section>\n"
    )


def main():
    data = json.loads(DATA.read_text())
    wires = data["wires"]

    if not data.get("set"):
        die("data/arrivals.json has no `set` time on it.\n"
            "Run tools/pull-arrivals.py first — that is the half that reads the feeds.")

    for w in wires:
        for k in ("id", "site", "host", "home", "feed", "feed_name", "note", "read"):
            if not w.get(k):
                die(f"wire {w.get('id') or w!r} is missing {k}.")
        if not w.get("items"):
            die(f"wire {w['id']} has no rows on it. Run tools/pull-arrivals.py.")
        if w.get("second") and not w.get("second_name"):
            die(f"wire {w['id']} names a second feed without saying what it is.")
        for it in w["items"]:
            for f in BODY_FIELDS:
                if f in it:
                    die(
                        f"wire {w['id']}: a row carries a `{f}` field.\n"
                        "A row is a name, a date and a destination. A departures board does not "
                        "read you\nthe contents of the train — and that is also what keeps this "
                        "page from republishing\neverybody else's writing onto one surface. "
                        "Take the field out; do not render it."
                    )
            if not it.get("title") or not it.get("url") or not it.get("date"):
                die(f"wire {w['id']}: a row is missing its title, url or date.")
            if not same_host(it["url"], w["host"]):
                die(
                    f"wire {w['id']}: {it['title']!r} goes to "
                    f"{urlparse(it['url']).hostname}, not {w['host']}.\n"
                    "A rack with somebody's name on it holding something else is a mis-filed "
                    "thing that\nreads as a claim."
                )
        dates = [it["date"] for it in w["items"]]
        if dates != sorted(dates, reverse=True):
            die(f"wire {w['id']}: the rows are not newest-first.")

    # ── The two generated sentences ──────────────────────────────────────────
    # Both are in the room's prose and both go stale on their own. The plurals
    # and the naming of the short wires are generated with them, because
    # make-jungle.py's first version generated a number and left the tail
    # plural, which is a hand-typed count in a disguise.
    full = max(len(w["items"]) for w in wires)
    short = [w for w in wires if len(w["items"]) < full]
    total = sum(len(w["items"]) for w in wires)

    shape = (
        f"{word(len(wires)).capitalize()} wires are strung down this hall, "
        f"carrying {word(total)} rows between them."
    )
    if short:
        by_len = {}
        for w in short:
            by_len.setdefault(len(w["items"]), []).append(w.get("prose") or w["site"])
        bits = [f"{listify(names)} {'is' if len(names) == 1 else 'are'} showing "
                f"{word(n)}" for n, names in sorted(by_len.items())]
        shape += (
            f" A board here holds {word(full)}, and {'; '.join(bits)} — "
            f"because that is everything "
            f"{'its feed has' if len(short) == 1 else 'their feeds have'} on "
            f"{'it' if len(short) == 1 else 'them'}."
        )
    else:
        shape += f" Every one of them is showing {word(full)}, which is as many as a board here holds."

    src = PAGE.read_text()

    # The room's own copy may not grow a league table. Checked on the hand-written
    # half only, before this tool's own generated prose is written into it.
    prose = re.sub(r"<[^>]+>", " ", src)
    for m in RANK.finditer(prose):
        window = prose[max(0, m.start() - 120):m.end()]
        if not RANK_OK.search(window):
            die(
                f"the-feed.html says “{m.group(0)}”.\n"
                "No wire is ranked and no site's activity is totalled here. A board that showed "
                "which\nof our sites had been busiest would turn publishing into a race between "
                "our own\npeople — the pebbling cabinet's refusal of a tally, arriving between "
                "sites."
            )

    src = slot(src, "set", (
        f'<p class="hall__set">This board was set at <b>{stamp(data["set"])}</b>. '
        f'Every wire on it was read at that minute and has not been read since. '
        f'The board is not the railway.</p>\n'
    ))
    src = slot(src, "shape", f'<p class="hall__shape">{shape}</p>\n')

    boards = "".join(indicator(w) for w in wires)
    src = slot(src, "hall", boards)

    PAGE.write_text(src)
    print(f"Set {PAGE.relative_to(ROOT)}: {len(wires)} wires, {total} rows, "
          f"board set at {data['set']}.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
