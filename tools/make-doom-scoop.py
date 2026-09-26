#!/usr/bin/env python3
"""Fill The Doom Scoop's cabinet from data/doom-scoop.json, and write its credits.

IT NEEDS NOTHING BUT THE FILE. tools/pull-doom-scoop.py reads the feeds and the
watch pages; this draws the room from what was read, and runs on a train. DO NOT
MERGE THEM -- pull-arrivals.py and make-arrivals.py, for their reason.

WHAT IT DRAWS. One tub per morning, newest first, for the last week of mornings
whose five o'clock has come; inside each, Ryan's groups in his order, each source
in his order, and each source's scoops in the order they went up. Every video is
a press-to-play facade saying how long it runs before the press, or a door out to
YouTube saying why it is a door. The two sources that publish no feed are doors
on the counter, drawn once. The line saying when the cabinet was filled is
generated from the same file as the scoops, so the two cannot disagree.

EACH MORNING IS A FLAVOUR AND THE FLAVOUR IS THE DAY OF THE WEEK. Monday is
always pistachio, whatever it is carrying, so a tub keeps its colour as it ages
towards the back of the cabinet. Each flavour is a §2 colour held against the ink
in check-contrast.py. How scraped out a tub is says only how many mornings old it
is: it is age, and it says nothing about how much is in it.

WHAT IT REFUSES, and why each one is here rather than left to care:

  · A SCOOP OLDER THAN A WEEK. The room says in its own copy that the eighth
    morning is gone, not archived. A scoop still in the file after that is the
    archive this room refuses to be, arriving because somebody's puller did not
    prune. pull-doom-scoop.py drops them; this refuses the file if it did not.
  · A SCOOP CARRYING ANYTHING BUT WHAT IT IS ALLOWED: no description, summary,
    thumbnail, or count of views, likes, comments or subscribers. The Feed's
    refusal of a summary field, for the Feed's reason -- a departures board does
    not read you the contents of the train -- and the pebbling cabinet's refusal
    of a tally, for its: a number beside the news turns the news into a race.
  · A SCREEN WITH NO RUNTIME, or with a runtime that is not a whole number of
    seconds. Every press-to-play control on this street says how long before the
    press. A door says how long too, where YouTube gave a length.
  · AN ID THAT IS NOT A YOUTUBE ID, or one on the page twice. love-embed.js
    refuses a bad id quietly, which is a button somebody presses and presses.
  · A SCOOP FROM A SOURCE THAT IS NOT IN THE LIST, or with a state this does not
    know. A source is a curation decision; one arriving by accident is not one.
  · A DOOR WITH NO REASON. A link dressed as a door has to say why it is not a
    screen, or it looks like a broken screen.
  · OUR OWN WORDS RANKING OR COUNTING. Outside the generated blocks, the room's
    copy is swept for trending, viral, most watched, views, likes and the like,
    with make-guild.py's negation window so the rules can still say out loud
    that there are none. The headlines are NOT swept: they are the channels'
    words, quoted as written, and "BREAKS" in a headline is not this room
    breaking anything.
  · MISSING MARKERS, and no `set` time.
"""
import html
import json
import re
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data/doom-scoop.json"
PAGE = ROOT / "the-doom-scoop.html"
NOTES = ROOT / "liner-notes.html"
HERE = ZoneInfo("America/Denver")
CUT = 5
WEEK = 7
WORDS = {4: "four", 5: "five", 6: "six"}

YT = re.compile(r"^[A-Za-z0-9_-]{11}$")
FEED = re.compile(r"^(UULF|UUSH|UU|PL)[A-Za-z0-9_-]{10,40}$")
ALLOWED = {"id", "source", "title", "published", "edition", "state", "why", "runs", "channel"}
STATES = {"screen", "door", "pending", "gone"}
# Monday first, the way date.weekday() counts.
FLAVOURS = [("pistachio", "Pistachio"), ("lemon", "Lemon sorbet"), ("mint", "Mint"),
            ("vanilla", "Vanilla"), ("mango", "Mango"), ("blueberry", "Blueberry"),
            ("taro", "Taro")]
DOOR_WHY = {"no embedding": "Its channel has switched off showing it on other sites, so it plays on YouTube and not in here.",
            "age-gated": "YouTube shows it only to signed-in adults, so it plays there and not in here."}
RANKS = re.compile(
    r"\b(trending|viral|most[\s-](?:watched|viewed|popular|shared)|top\s+stor(?:y|ies)|"
    r"views|likes|subscribers|ranked|ranking|leaderboard|hottest|biggest|must[\s-]watch)\b", re.I)
NEGATED = re.compile(r"\b(not|no|nothing|never|nor|without|nobody)\b[^.;:]*$", re.I)

problems = []


def esc(s):
    return html.escape(s, quote=False)


def attr(s):
    return html.escape(s, quote=True)


def utc(s):
    return datetime.fromisoformat(s.replace("Z", "+00:00")).astimezone(timezone.utc)


def clock(n):
    h, rest = divmod(int(n), 3600)
    m, s = divmod(rest, 60)
    return f"{h}:{m:02d}:{s:02d}" if h else f"{m}:{s:02d}"


def spoken(n):
    n = int(n)
    if n < 60:
        return f"{n} second{'s' if n != 1 else ''}"
    mins = round(n / 60)
    h, m = divmod(mins, 60)
    if h:
        return f"{h} hr {m} min" if m else f"{h} hr"
    return f"{m} min"


def hour(dt):
    t = dt.astimezone(HERE)
    return f"{t.strftime('%A')} {t.strftime('%I').lstrip('0')}:{t.strftime('%M')} {t.strftime('%p').lower()}"


def day_long(d):
    return f"{d.strftime('%A')} {d.day} {d.strftime('%B')}"


def swap(src, marker, block):
    begin, end = f"<!-- {marker}:begin -->", f"<!-- {marker}:end -->"
    if begin not in src or end not in src:
        problems.append(f"{PAGE.name if 'ds-' in marker else NOTES.name} has no {marker} markers, "
                        "so there is nowhere to write. Add them on purpose.")
        return src
    return re.sub(re.escape(begin) + r".*?" + re.escape(end),
                  lambda m: begin + "\n" + block + "\n" + end, src, flags=re.S)


def window(edition):
    end = datetime.fromisoformat(edition).replace(hour=CUT, tzinfo=HERE)
    return end - timedelta(days=1), end


def covered(spans, a, b):
    return any(utc(x) <= a and utc(y) >= b for x, y in spans)


def check(d):
    srcs = {}
    for g in d.get("groups") or []:
        if not g.get("sources"):
            problems.append(f"the group {g.get('name')!r} has no sources, and would render as a "
                            "heading over nothing.")
        for s in g.get("sources") or []:
            for f in ("slug", "name", "url"):
                if not (s.get(f) or "").strip():
                    problems.append(f"a source in {g.get('name')!r} has no {f}.")
            if not (s.get("url") or "").startswith("https://"):
                problems.append(f"{s.get('name')!r}'s address is not https.")
            if s.get("feed") is not None and not FEED.match(s["feed"]):
                problems.append(f"{s.get('name')!r}'s feed {s['feed']!r} is not a YouTube list id.")
            if s.get("feed") and s.get("shape") not in ("wide", "tall"):
                problems.append(f"{s.get('name')!r} says no shape, and a short played in a "
                                "landscape frame is two black bars and a small picture.")
            if s["slug"] in srcs:
                problems.append(f"the source {s['slug']!r} is listed twice.")
            srcs[s["slug"]] = s
    if not d.get("set") or not d.get("newest"):
        problems.append("data/doom-scoop.json has no `set` time or no `newest` morning. Run "
                        "tools/pull-doom-scoop.py; the room prints when the cabinet was filled.")
        return srcs
    oldest = (datetime.fromisoformat(d["newest"]) - timedelta(days=WEEK - 1)).date().isoformat()
    seen = set()
    for s in d.get("scoops") or []:
        t = (s.get("title") or "")[:40] or s.get("id")
        extra = set(s) - ALLOWED
        if extra:
            problems.append(f"{t!r} carries {sorted(extra)}. A scoop is an id, a title, a channel, "
                            "a time and a length; nothing is read to you and nothing is counted.")
        if not YT.match(s.get("id") or ""):
            problems.append(f"{t!r} has {s.get('id')!r}, which is not a YouTube id.")
        if s.get("source") not in srcs or not srcs[s["source"]].get("feed"):
            problems.append(f"{t!r} is from {s.get('source')!r}, which is not a source with a feed.")
        if s.get("state") not in STATES:
            problems.append(f"{t!r} is in the state {s.get('state')!r}, which this does not know.")
        if s.get("edition", "") < oldest:
            problems.append(f"{t!r} belongs to the morning of {s.get('edition')}, which is more than "
                            "a week before the newest. The room says the eighth morning is gone.")
        if s.get("state") in ("screen", "door"):
            if s["id"] in seen and s.get("edition", "") >= oldest:
                problems.append(f"{s['id']} is in the cabinet twice.")
            seen.add(s["id"])
            if not (s.get("title") or "").strip():
                problems.append(f"{s['id']} has no title.")
            if not (s.get("channel") or "").strip():
                problems.append(f"{t!r} does not say whose channel it is on.")
        if s.get("state") == "screen" and not (isinstance(s.get("runs"), int) and s["runs"] > 0):
            problems.append(f"{t!r} is a screen with no runtime. Every control on this street "
                            "says how long before the press.")
        if s.get("state") == "door" and s.get("why") not in DOOR_WHY:
            problems.append(f"{t!r} is a door with no reason this knows ({s.get('why')!r}), and a "
                            "door that does not say why looks like a broken screen.")
    return srcs


def scoop_li(s, shape):
    t = utc(s["published"])
    runs = s.get("runs")
    when = f'{esc(hour(t))}' + (f' &middot; {clock(runs)}' if runs else "")
    head = (f'            <li class="ds-scoop ds-scoop--{shape}">\n'
            f'              <p class="ds-scoop__title">{esc(s["title"])}</p>\n'
            f'              <p class="ds-scoop__when">{when}</p>\n')
    if s["state"] == "screen":
        body = (f'              <button type="button" class="facade" data-embed-id="{attr(s["id"])}" '
                f'data-embed-title="{attr(s["title"])}, on YouTube via {attr(s["channel"])}">\n'
                f'                Play &mdash; {esc(spoken(runs))}\n'
                f'                <span class="facade__play">&#9654; PRESS PLAY</span>\n'
                f'              </button>\n')
    else:
        how = f" &mdash; {esc(spoken(runs))}" if runs else ""
        body = (f'              <a class="ds-door" href="https://www.youtube.com/watch?v={attr(s["id"])}">'
                f'Watch on YouTube{how} &rarr;</a>\n'
                f'              <p class="ds-door__why">{esc(DOOR_WHY[s["why"]])}</p>\n')
    return head + body + '            </li>'


def listify(names):
    names = [esc(n) for n in names]
    return names[0] if len(names) == 1 else ", ".join(names[:-1]) + " and " + names[-1]


def tub(d, edition, age, rows):
    day = datetime.fromisoformat(edition).date()
    slug, flavour = FLAVOURS[day.weekday()]
    a, b = window(edition)
    before = (day - timedelta(days=1)).strftime("%A")
    out = [f'  <details class="ds-tub ds-tub--{slug} ds-tub--age-{age}" id="scoop-{edition}"'
           + (" open" if age == 0 else "") + ">",
           f'    <summary class="ds-tub__lid"><span class="ds-tub__day">{esc(day_long(day))}</span> '
           f'<span class="ds-tub__flavour">{esc(flavour)}</span> '
           f'<span class="ds-tub__span">the morning edition: {WORDS[CUT]} on {before} morning to {WORDS[CUT]} on '
           f'{day.strftime("%A")}</span></summary>',
           '    <div class="ds-tub__in">']
    quiet, unread = [], []
    for g in d["groups"]:
        feeds = [s for s in g["sources"] if s.get("feed")]
        blocks = []
        for src in feeds:
            mine = [r for r in rows if r["source"] == src["slug"]]
            whole = covered(d["covered"].get(src["slug"], []), a, b)
            if not mine:
                (quiet if whole else unread).append(src["name"])
                continue
            gap = "" if whole else (
                f'          <p class="ds-src__gap">Its feed did not reach back to {WORDS[CUT]} on '
                f'{before} morning, so some of its day may be missing from this tub.</p>\n')
            blocks.append(
                f'        <section class="ds-src" aria-label="{attr(src["name"])}, {attr(day_long(day))}">\n'
                f'          <h4 class="ds-src__name"><a href="{attr(src["url"])}">{esc(src["name"])}</a></h4>\n'
                + gap +
                f'          <ol class="ds-scoops ds-scoops--{src["shape"]}">\n'
                + "\n".join(scoop_li(r, src["shape"]) for r in mine) + "\n"
                '          </ol>\n'
                '        </section>')
        if blocks:
            out.append(f'      <div class="ds-group">\n        <h3 class="ds-group__name">{esc(g["name"])}</h3>')
            out.extend(blocks)
            out.append('      </div>')
    if not any(r for r in rows):
        out.append('      <p class="ds-tub__none">Nothing in this tub: none of the feeds carried anything from this morning&rsquo;s window.</p>')
    if quiet:
        out.append(f'      <p class="ds-tub__foot">Nothing from {listify(quiet)} this morning.</p>')
    if unread:
        out.append(f'      <p class="ds-tub__foot">The feeds for {listify(unread)} were not read far enough '
                   'back to say what they put out this morning.</p>')
    out += ['    </div>', '  </details>']
    return "\n".join(out)


def cabinet(d):
    newest = d["newest"]
    shown = [(datetime.fromisoformat(newest) - timedelta(days=i)).date().isoformat() for i in range(WEEK)]
    live = [s for s in d["scoops"] if s["state"] in ("screen", "door")]
    return "\n".join(tub(d, e, i, [s for s in live if s["edition"] == e]) for i, e in enumerate(shown))


def counter(d):
    doors = [s for g in d["groups"] for s in g["sources"] if not s.get("feed")]
    if not doors:
        return '    <p>Nothing on the counter: every source has a feed.</p>'
    links = "\n".join(f'      <li><a class="ds-door" href="{attr(s["url"])}">{esc(s["name"])} &rarr;</a></li>'
                      for s in doors)
    return (f'    <p>{listify([s["name"] for s in doors])} publish no feed a timer can read, so nothing '
            'is scooped from them. One answers &ldquo;not found&rdquo; wherever a feed usually lives and '
            'the other puts up a bot check, and a bot check is somebody saying no to a machine. They are '
            'doors on the counter instead, to their own front pages as they are today.</p>\n'
            f'    <ul class="ds-counter">\n{links}\n    </ul>')


def set_line(d):
    t = datetime.strptime(d["set"], "%Y-%m-%dT%H:%MZ").replace(tzinfo=timezone.utc).astimezone(HERE)
    at = f"{t.strftime('%I').lstrip('0')}:{t.strftime('%M')} {t.strftime('%p').lower()}"
    return (f'    <p class="ds-set">The cabinet was last filled at <b>{at} on {esc(day_long(t))}</b>, '
            'Mountain time, and the newest tub is that morning&rsquo;s.</p>')


def credits(d):
    rows = []
    for g in d["groups"]:
        for s in g["sources"]:
            how = ("its channel&rsquo;s long-form videos" if (s.get("feed") or "").startswith("UULF") else
                   "its channel&rsquo;s shorts" if (s.get("feed") or "").startswith("UUSH") else
                   "a playlist" if s.get("feed") else "a door, with no feed to read")
            rows.append(f'      <tr><td>{esc(g["name"])}</td><td><a href="{attr(s["url"])}">'
                        f'{esc(s["name"])}</a></td><td>{how}</td></tr>')
    return "\n".join(rows)


def sweep(src):
    body = re.sub(r"<!-- (ds-[a-z]+):begin -->.*?<!-- \1:end -->", " ", src, flags=re.S)
    body = re.sub(r"<!--.*?-->|<script.*?</script>|<style.*?</style>|<head>.*?</head>", " ", body, flags=re.S)
    text = html.unescape(re.sub(r"<[^>]+>", " ", body))
    for sentence in re.split(r"(?<=[.!?])\s+", re.sub(r"\s+", " ", text)):
        for m in RANKS.finditer(sentence):
            if not NEGATED.search(sentence[:m.start()]):
                problems.append(f"the room's own words say {m.group(0)!r}: {sentence.strip()[:90]!r}. "
                                "Nothing here is ranked or counted.")


def main():
    d = json.loads(DATA.read_text())
    check(d)
    src = PAGE.read_text()
    sweep(src)
    if problems:
        print("REFUSING to fill The Doom Scoop:")
        for p in problems:
            print("  - " + p)
        return 1
    src = swap(src, "ds-set", set_line(d))
    src = swap(src, "ds-counter", counter(d))
    src = swap(src, "ds-cabinet", cabinet(d))
    notes = swap(NOTES.read_text(), "doom-scoop-credits", credits(d))
    if problems:
        print("REFUSING to fill The Doom Scoop:")
        for p in problems:
            print("  - " + p)
        return 1
    PAGE.write_text(src)
    NOTES.write_text(notes)
    live = [s for s in d["scoops"] if s["state"] in ("screen", "door")]
    print(f"the doom scoop: a week of tubs to the morning of {d['newest']}, filled {d['set']}, "
          f"{sum(s['state'] == 'screen' for s in live)} screens and "
          f"{sum(s['state'] == 'door' for s in live)} doors, none of it hosted here.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
