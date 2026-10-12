"""What Nature's Contribution's tools share, and nothing they do not.

WHAT THE AREA IS. Ryan Boren's brief, 2026-10-11: past the campgrounds' wood
there is land kept for balancing conservation, agriculture and renewable
energy, after Brock, Roehrdanz, Beringer et al., "Balancing land use for
conservation, agriculture, and renewable energy" (Nature Communications 17,
3623, 2026). Its places complement and sustain each other and the street: a
wildlife sanctuary, a cannabis farm, a solar farm, a mixed farm with its café
in the old dairy, and a chaos garden, and the farms' goods go to the street
through a shopfront with an honesty box.

WHY ONE MODULE. Each place has its own generator and its own refusals, and no
two of them look alike: this file holds no colour, no class and no drawing.
What is here is plumbing that would otherwise be pasted into every one of
those tools and drift, the way make-coworking.py writes all of Cavendish's
rooms out of one file while every room dresses its parts in its own section:

  · the marker swap, the escaping and the runtimes said aloud;
  · the sweep of our own sentences, with A Quiet Pint's ANCHORED negation
    window, so "nobody lights a lamp." cannot excuse the next sentence;
  · the two shapes of rack the area has: a rack of videos a person picked,
    each measured on its own watch page, and a rack of a channel list's
    latest month, refilled on the morning timer by tools/pull-nature-month.py.
    Both are markup for rack.js, which finds its parts by data- attributes
    and never by class, so every room passes its own prefix and its own words
    and dresses the result in its own section of love.css.

IT TOUCHES NO NETWORK. tools/pull-nature-month.py does, and it is kept out of
tools/check-all.sh with the other pullers.
"""
import html
import json
import re
from datetime import datetime, timedelta, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parent.parent
MIRROR = Path.home() / "Documents/Claude/Projects/Stimpunks Knowledge System/site/stimpunks.org"
HERE = ZoneInfo("America/Denver")
YT = re.compile(r"^[A-Za-z0-9_-]{11}$")
CHANNEL = re.compile(r"^UC[A-Za-z0-9_-]{22}$")
MONTH = 30          # days a month rack keeps; tools/pull-nature-month.py holds the same number
MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August",
          "September", "October", "November", "December"]

NEGATION = (r"(?:no|not|nothing|never|neither|none|without|refuses?|refused|refusing|"
            r"cannot|can't|does not|doesn't|do not|don't|won't|will not|is not|are not|isn't|"
            r"aren't|nobody|nor|declin\w+|instead of)")
# The tally every place on this land refuses, in the area's words: nobody is
# counted, and no animal, crop or panel is ranked against another.
TALLY = (r"leaderboards?|streaks?|scores?|scored|scoring|tall(?:y|ies)|tallied|ranked|"
         r"rankings?|most popular|top (?:\d+|three|five|ten)|best[- ]selling|bestsellers?|"
         r"headcount|footfall")


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


def swap(page, marker, block, indent=""):
    src = page.read_text()
    begin, end = f"<!-- {marker}:begin -->", f"<!-- {marker}:end -->"
    if begin not in src or end not in src:
        raise SystemExit(
            f"REFUSING: {page.name} has no {marker} markers, so there is nowhere to write.\n"
            "Put them back rather than letting this tool go quiet -- a generator that\n"
            "writes nothing and exits 0 is how two surfaces drift apart.")
    page.write_text(re.sub(re.escape(begin) + r".*?" + re.escape(end),
                           lambda _m: begin + "\n" + block + "\n" + indent + end,
                           src, count=1, flags=re.S))


def sweep(text, where, vocab, problems):
    """Our own sentences, for each (pattern, why) in vocab. THE NEGATION HAS TO
    BE ABOUT THIS WORD: the window ends where the match does and the search is
    anchored there, A Quiet Pint's fix, so a refusal in one sentence never
    excuses the word in the next."""
    text = html.unescape(re.sub(r"<[^>]+>", " ", str(text)))
    for pat, why in vocab:
        for m in re.finditer(rf"(?<!\w)(?:{pat})(?!\w)", text, re.I):
            window = text[max(0, m.start() - 80):m.end()]
            if re.search(rf"\b{NEGATION}\b[^.]{{0,70}}?(?<!\w)(?:{pat})(?!\w)$", window, re.I):
                continue
            problems.refuse(f"{where}: {m.group(0)!r} -- {why}")


def page_body(page, cut=()):
    """The page's <main>, with generated blocks named in `cut`, every job
    marker, every blockquote and every comment taken out: what is left is the
    room speaking in its own voice."""
    src = page.read_text()
    body = src[src.index("<main"):src.index("</main>")]
    for marker in cut:
        body = re.sub(rf"<!-- {marker}:begin -->.*?<!-- {marker}:end -->", " ", body, flags=re.S)
    body = re.sub(r"<!-- quest:[\w-]+:begin -->.*?<!-- quest:[\w-]+:end -->", " ", body, flags=re.S)
    body = re.sub(r"<blockquote.*?</blockquote>", " ", body, flags=re.S)
    body = re.sub(r"<!--.*?-->", " ", body, flags=re.S)
    return body


def utc(s):
    return datetime.fromisoformat(s.replace("Z", "+00:00")).astimezone(timezone.utc)


def clock(n):
    h, rest = divmod(int(n), 3600)
    m, sec = divmod(rest, 60)
    return f"{h}:{m:02d}:{sec:02d}" if h else f"{m}:{sec:02d}"


def spoken(n):
    n = int(n)
    if n < 60:
        return f"{n} second{'s' if n != 1 else ''}"
    h, m = divmod(round(n / 60), 60)
    if h:
        return f"{h} hr {m} min" if m else f"{h} hr"
    return f"{m} min"


def day(dt):
    t = dt.astimezone(HERE)
    return f"{t.strftime('%A')} {t.day} {t.strftime('%B')}"


def date_words(iso):
    y, m, d = (int(x) for x in iso[:10].split("-"))
    return f"{d} {MONTHS[m - 1]} {y}"


def listify(names):
    names = list(names)
    if len(names) == 1:
        return names[0]
    return ", ".join(names[:-1]) + " and " + names[-1]


def mirror_text(rel):
    """A page of ours out of the Knowledge System mirror, as words, or None if
    the mirror is not on this machine (it is on Ryan's only). Read the same way
    a quotation is, so a check compares words and never markup."""
    f = MIRROR / rel
    if not f.exists():
        return None
    t = f.read_text()
    t = re.sub(r"!\[[^\]]*\]\([^)]*\)", "", t)
    t = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", t)
    t = re.sub(r"[*_`]+", "", t)
    return re.sub(r"\s+", " ", html.unescape(t)).replace("’", "'").replace("‘", "'") \
        .replace("“", '"').replace("”", '"')


def words(s):
    return re.sub(r"\s+", " ", html.unescape(str(s))).replace("’", "'").replace("‘", "'") \
        .replace("“", '"').replace("”", '"').strip()


# ── A rack of picked videos ──────────────────────────────────────────────────
#
# Each one was asked on its own watch page before it went in: OK, embeddable,
# not age-gated, and the runtime is the page's lengthSeconds. check-jukebox.py
# asks again whenever somebody runs it. The titles and channels are theirs, as
# written, and are never swept.

PICK_KEYS = {"id", "title", "channel", "channel_id", "published", "runs", "about", "held"}


def check_picks(videos, where, problems, need=1):
    seen = set()
    live = [v for v in videos or [] if not v.get("held")]
    if len(live) < need:
        problems.refuse(f"{where}: the rack holds {len(live)} videos, so it would be a heading over nothing.")
    for v in videos or []:
        t = (v.get("title") or "")[:40] or v.get("id")
        extra = set(v) - PICK_KEYS
        if extra:
            problems.refuse(f"{where}: {t!r} carries {sorted(extra)}. A video is an id, a title, a channel, "
                            "a date, a length and one line of ours; nothing else.")
        if not YT.match(v.get("id") or ""):
            problems.refuse(f"{where}: {t!r} has {v.get('id')!r}, which is not a YouTube id. love-embed.js "
                            "would build nothing and say nothing, and the button would never become a video.")
        if v.get("id") in seen:
            problems.refuse(f"{where}: {v.get('id')} is on the rack twice.")
        seen.add(v.get("id"))
        for k in ("title", "channel", "about"):
            if not (v.get(k) or "").strip():
                problems.refuse(f"{where}: {t!r} has no {k}.")
        if not CHANNEL.match(v.get("channel_id") or ""):
            problems.refuse(f"{where}: {t!r} has no channel id this can link to ({v.get('channel_id')!r}).")
        if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", v.get("published") or ""):
            problems.refuse(f"{where}: {t!r} has no date it was published.")
        if not (isinstance(v.get("runs"), int) and v["runs"] > 0):
            problems.refuse(f"{where}: {t!r} has no runtime. Every press on this street says how long "
                            "before the press.")
        if "held" in v and not str(v["held"]).strip():
            problems.refuse(f"{where}: {t!r} is held with no reason; a hold says why.")


def screen_block(p, sid, sname, idle):
    """The screen a rack's cards can put a video on: nothing of its own on it,
    shipped hidden, unhidden by rack.js."""
    return "\n".join([
        f'    <div class="{p}-screen" data-rack-screen="{sid}" tabindex="-1" hidden>',
        f'      <p class="{p}-screen__idle"><span>{idle}</span></p>',
        '    </div>',
        f'    <p class="{p}-screen__now" data-rack-now="{sid}" tabindex="-1" hidden></p>',
        f'    <p class="{p}-screen__back" hidden><button type="button" class="{p}-btn {p}-btn--quiet" '
        f'data-rack-back="{sid}">Take it off {sname}</button></p>'])


def pick_card(v, p, sid, sname, sub=None, tall=False):
    t, c, r = esc(v["title"]), esc(v["channel"]), clock(v["runs"])
    full = f'{attr(v["channel"])} &mdash; {attr(v["title"])}'
    sub = sub if sub is not None else f'{c} &middot; {date_words(v["published"])} &middot; {r}'
    about = f'\n          <p class="{p}-vid__about">{esc(v["about"])}</p>' if v.get("about") else ""
    return "\n".join([
        f'        <li class="{p}-vid{f" {p}-vid--tall" if tall else ""}" data-rack-card>',
        f'          <h3 class="{p}-vid__title">{t}</h3>',
        f'          <p class="{p}-vid__by">{sub}</p>{about}',
        f'          <button type="button" class="facade" data-embed-id="{v["id"]}" data-embed-title="{full}">',
        f'            Watch it here &mdash; {esc(spoken(v["runs"]))}',
        '            <span class="facade__play">&#9654; PRESS PLAY</span>',
        '          </button>',
        f'          <button type="button" class="{p}-btn {p}-btn--quiet {p}-vid__up" hidden data-rack-to="{sid}" '
        f'data-rack-name="{attr(sname)}" '
        f'data-rack-src="https://www.youtube-nocookie.com/embed/{v["id"]}?autoplay=1&amp;rel=0" '
        f'data-rack-title="{full}, on {attr(sname)}" data-rack-film="{attr(v["title"])}" '
        f'data-rack-runtime="{r}"' + (' data-rack-shape="tall"' if tall else "") +
        f'>Put it on {esc(sname)} &mdash; {esc(spoken(v["runs"]))}</button>',
        '        </li>'])


def picks_block(videos, p, sid, sname, summary, label):
    out = [f'    <details class="{p}-rack" open>',
           f'      <summary class="{p}-rack__sum">{summary}</summary>',
           f'      <ul class="{p}-vids" aria-label="{attr(label)}">']
    out += [pick_card(v, p, sid, sname) for v in videos if not v.get("held")]
    out += ['      </ul>', '    </details>']
    return "\n".join(out)


def picks_credit(videos, who, when):
    chans = []
    for v in videos:
        if v.get("held"):
            continue
        link = f'<a href="https://www.youtube.com/channel/{v["channel_id"]}">{esc(v["channel"])}</a>'
        if link not in chans:
            chans.append(link)
    return (f"{who}, {when}, each checked on its own watch page and each on its own channel on YouTube: "
            + listify(chans) + ". None of them is affiliated with Stimpunks, and nothing of theirs is hosted here")


# ── A rack of a channel list's latest month ──────────────────────────────────
#
# tools/pull-nature-month.py reads each channel's own feeds (UULF and UUSH) on
# the morning timer and asks each new video's watch page once. The rack prints
# the minute it was filled. Learning Large's rack, in this area's plumbing.

LOG_KEYS = {"id", "source", "form", "title", "published", "state", "why", "runs", "channel"}
LOG_STATES = {"screen", "door", "pending", "gone"}
DOOR_WHY = {"no embedding": "Its channel has switched off showing it on other sites, so it plays on YouTube "
                            "and not in here.",
            "age-gated": "YouTube shows it only to signed-in adults, so it plays there and not in here."}


def set_time(r):
    return datetime.strptime(r["set"], "%Y-%m-%dT%H:%MZ").replace(tzinfo=timezone.utc)


def check_month(r, where, problems):
    srcs = {}
    for s in r.get("sources") or []:
        for f in ("slug", "name", "url", "channel_id"):
            if not (s.get(f) or "").strip():
                problems.refuse(f"{where}: a channel has no {f}: {s}")
        if not (s.get("url") or "").startswith("https://www.youtube.com/@"):
            problems.refuse(f"{where}: {s.get('name')!r}'s address is not a YouTube channel's own page.")
        if not CHANNEL.match(s.get("channel_id") or ""):
            problems.refuse(f"{where}: {s.get('name')!r} has {s.get('channel_id')!r}, which is not a channel id.")
        if s.get("slug") in srcs:
            problems.refuse(f"{where}: the channel {s['slug']!r} is listed twice.")
        srcs[s.get("slug")] = s
    if not srcs:
        problems.refuse(f"{where} lists no channels, so the rack would be a heading over nothing.")
    if not r.get("set"):
        problems.refuse(f"{where} has no `set` time. Run tools/pull-nature-month.py; the room prints when "
                        "the rack was filled.")
        return
    oldest = set_time(r) - timedelta(days=MONTH, minutes=1)
    seen = set()
    for v in r.get("log") or []:
        t = (v.get("title") or "")[:40] or v.get("id")
        extra = set(v) - LOG_KEYS
        if extra:
            problems.refuse(f"{where}: {t!r} carries {sorted(extra)}. A video is an id, a title, a channel, "
                            "a time and a length; nothing is read to you and nothing is counted.")
        if not YT.match(v.get("id") or ""):
            problems.refuse(f"{where}: {t!r} has {v.get('id')!r}, which is not a YouTube id.")
        if v.get("source") not in srcs:
            problems.refuse(f"{where}: {t!r} is from {v.get('source')!r}, which is not one of the channels.")
        if v.get("form") not in ("long", "short"):
            problems.refuse(f"{where}: {t!r} does not say whether it is long-form or a short.")
        if v.get("state") not in LOG_STATES:
            problems.refuse(f"{where}: {t!r} is in the state {v.get('state')!r}, which this does not know.")
        if not v.get("published") or utc(v["published"]) < oldest:
            problems.refuse(f"{where}: {t!r} was published {v.get('published')}, more than a month before the "
                            "rack was filled. The older ones go off the end; this is not an archive.")
        if v.get("state") in ("screen", "door"):
            if v["id"] in seen:
                problems.refuse(f"{where}: {v['id']} is on the rack twice.")
            seen.add(v["id"])
            if not (v.get("title") or "").strip():
                problems.refuse(f"{where}: {v['id']} has no title.")
            if not (v.get("channel") or "").strip():
                problems.refuse(f"{where}: {t!r} does not say whose channel it is on.")
        if v.get("state") == "screen" and not (isinstance(v.get("runs"), int) and v["runs"] > 0):
            problems.refuse(f"{where}: {t!r} is a screen with no runtime. Every press in here says how long "
                            "before the press.")
        if v.get("state") == "door" and v.get("why") not in DOOR_WHY:
            problems.refuse(f"{where}: {t!r} is a door with no reason this knows ({v.get('why')!r}), and a door "
                            "that does not say why looks like a broken screen.")


def _covered(spans, a, b):
    return any(utc(x) <= a and utc(y) >= b for x, y in spans)


def month_card(v, p, sid, sname):
    tall = v["form"] == "short"
    runs = v.get("runs")
    sub = esc(day(utc(v["published"]))) + (f" &middot; {clock(runs)}" if runs else "")
    if v["state"] == "screen":
        return pick_card({"id": v["id"], "title": v["title"], "channel": v["channel"], "runs": runs},
                         p, sid, sname, sub=sub, tall=tall)
    how = f" &mdash; {esc(spoken(runs))}" if runs else ""
    return "\n".join([
        f'        <li class="{p}-vid{f" {p}-vid--tall" if tall else ""}">',
        f'          <h3 class="{p}-vid__title">{esc(v["title"])}</h3>',
        f'          <p class="{p}-vid__by">{sub}</p>',
        f'          <a class="{p}-vid__door" href="https://www.youtube.com/watch?v={v["id"]}">Watch on YouTube{how} &rarr;</a>',
        f'          <p class="{p}-vid__why">{esc(DOOR_WHY[v["why"]])}</p>',
        '        </li>'])


def month_block(r, p, sid, sname, summary):
    """Every channel's month, newest first, its videos and its shorts in lists
    of their own because a short's card is tall. A channel whose feed did not
    reach back a whole month says so, and a channel with nothing says so in one
    line at the foot rather than a heading over nothing."""
    when = set_time(r)
    start = when - timedelta(days=MONTH)
    t = when.astimezone(HERE)
    at = f"{t.strftime('%I').lstrip('0')}:{t.strftime('%M')} {t.strftime('%p').lower()}"
    live = [v for v in r["log"] if v["state"] in ("screen", "door")]
    out = [f'    <p class="{p}-rack__set">The rack was last filled at <b>{at} on {esc(day(when))}</b>, Mountain '
           f'time, with what each channel put up since {esc(day(start))}.</p>',
           f'    <details class="{p}-rack" open>',
           f'      <summary class="{p}-rack__sum">{summary}</summary>']
    quiet = []
    for s in r["sources"]:
        mine = sorted((v for v in live if v["source"] == s["slug"]),
                      key=lambda v: (v["published"], v["id"]), reverse=True)
        cov = r.get("covered", {}).get(s["slug"], {})
        # A MINUTE OF SLACK, The Open Notebook's: `set` is kept to the minute
        # and the puller's coverage to the second.
        gaps = [f for f in ("long", "short")
                if not _covered(cov.get(f, []), start + timedelta(minutes=1), when)]
        if not mine and not gaps:
            quiet.append(esc(s["name"]))
            continue
        block = [f'      <section class="{p}-chan" aria-label="{attr(s["name"])}">',
                 f'        <h3 class="{p}-chan__name"><a href="{attr(s["url"])}">{esc(s["name"])}</a></h3>']
        if gaps:
            what = {"long": "videos", "short": "shorts"}
            block.append(f'        <p class="{p}-chan__gap">Its {" and ".join(what[f] for f in gaps)} feed did not '
                         'reach back a whole month the last time it was read, so some of its month may be '
                         'missing here. It fills in as the mornings go by.</p>')
        if not mine:
            block.append(f'        <p class="{p}-chan__none">Nothing from this channel in what the feeds reached.</p>')
        for form in ("long", "short"):
            these = [v for v in mine if v["form"] == form]
            if these:
                block.append(f'        <ul class="{p}-vids{f" {p}-vids--tall" if form == "short" else ""}" '
                             f'aria-label="{attr(s["name"])}, {"shorts" if form == "short" else "videos"}">')
                block += [month_card(v, p, sid, sname) for v in these]
                block.append('        </ul>')
        block.append('      </section>')
        out += block
    if quiet:
        out.append(f'      <p class="{p}-rack__quiet">Nothing from {listify(quiet)} this month.</p>')
    out.append('    </details>')
    return "\n".join(out)


def month_credit(r):
    return "\n".join(f'      <tr><td><a href="{attr(s["url"])}">{esc(s["name"])}</a></td>'
                     f'<td>its videos and its shorts, the latest month of each</td></tr>'
                     for s in r["sources"])


def read_json(path):
    return json.loads(Path(path).read_text())
