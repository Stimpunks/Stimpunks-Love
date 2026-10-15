#!/usr/bin/env python3
"""Build The Live Room's desk, one studio at a time, the glass over it, the month
under it off each studio's own channel, and the credits.

ONE DATA FILE, ONE TOOL, TWO SURFACES -- the contract make-chappell.py,
make-looming.py, make-picture-house.py and the rest keep. Every session is a
channel strip on the desk: its name in marker on a strip of masking tape, where
and when it was taped, whose channel it is on, a note written for this room,
and a press-to-play plate that says how long before the press.

THE DESK IS A RACK NOW, Ryan's ask of 2026-10-15, and THE GLASS IS ITS SCREEN.
rack.js's pattern: every strip plays where it hangs, or its second button puts
it up on the glass at the top of the desk, saying how long before the press;
each studio's desk is a <details> that ships open, so it folds away and the
checkers still measure it. The glass has nothing of its own on it, the Doom
Scoop's screen, so it ships hidden and rack.js unhides it.

AND UNDER THE DESK, THE LAST MONTH OFF EACH STUDIO'S OWN CHANNEL, the same day:
data/live-room-month.json, filled on the morning timer by
tools/pull-live-month.py (tools/daily-live.sh), which touches the network so
this does not. `--month` redraws only that, so the timer never touches the
desk. NOBODY CHOSE THOSE AND NOBODY CHECKED WHERE THEY WERE PLAYED: a tape on a
strip means a person patched it in, and the month's strips carry no tape. So
the rule below about indoors is the DESK's rule, and the room says so beside the
month. The month's titles are the channels' own, as written, and are not swept.

WHAT IT REFUSES:

  - A SESSION THAT WAS NOT PLAYED INDOORS, OR ONE THAT DOES NOT SAY WHERE.
    THIS IS make-looming.py's RULE UPSIDE DOWN, AND THEY MUST NOT BE MADE TO
    AGREE. Looming Rocks is for outdoor music and refuses an act that was not
    played outdoors; this room is for music played in a studio and refuses one
    that was not played indoors. Both are keeping the same promise -- say where
    a thing was played, and mean it -- and the first nine sessions here are the
    proof that the pair is needed: they arrived for Looming Rocks, were refused
    there, and this room was built the same afternoon to hold them.

  - A STUDIO WITH NO SESSIONS. It would render as a heading over nothing: the
    Jungle Room's dark group, arriving on a desk. KEXP and KCRW are named on the
    page as studios this room takes sessions from, in words, and get a section
    each the day somebody sends one.

  - A SESSION WITH NO RUNTIME, A RUNTIME THAT IS NOT A CLOCK, OR NO SPOKEN FORM.
    Every press-to-play control on this street says how long before the press;
    the digits are what a player shows and the spoken form is what somebody
    decides with.

  - AN ID THAT IS NOT A YOUTUBE ID, OR ONE USED TWICE. love-embed.js validates
    before it builds and returns QUIETLY, so a typo is a button somebody presses
    and presses that never becomes a video.

  - A SESSION WITH NO TAPE, NO TITLE, NO PERFORMER, NO CHANNEL OR NO NOTE. None
    of this music is ours, and every strip names whose channel it is on.

  - A RANKED DESK. No best, no greatest, no countdown, and no claim to be the
    oldest or the longest thing on it either: those go quietly false the day a
    session arrives from another studio, which is a hand-typed total wearing a
    superlative.

  - A QUOTATION OF ANY LENGTH FROM THE STAGE, and a note shaped like verse. This
    street says in three places that nothing musical is hosted here, and a room
    of sessions is where somebody would transcribe a good line between songs.

  - AN HTML ENTITY IN ANY FIELD, and any missing marker pair.

  - IN THE MONTH, Learning Large's rules: a video older than the month, a row
    carrying a description, a count or anything else, a screen with no
    runtime, a door with no reason this knows, a channel that is not a studio
    on the desk, and a month with no time it was filled.

  - A PAGE THAT DOES NOT LOAD rack.js, which would ship every second button
    hidden for ever and the glass with it.

WHAT IT DOES NOT CHECK, on purpose: whether each video still plays. That needs
the network; check-jukebox.py asks.
"""
import html
import json
import re
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data/live-room.json"
MONTHLY = ROOT / "data/live-room-month.json"
ROOM = ROOT / "live-room.html"
NOTES = ROOT / "liner-notes.html"
HERE = ZoneInfo("America/Denver")
MONTH = 30          # days the month keeps; tools/pull-live-month.py holds the same number
GLASS = ("lvr", "the glass")
SCRIPTS = ["love.js", "love-embed.js", "rack.js", "quest.js"]
CHANNEL = re.compile(r"^UC[A-Za-z0-9_-]{22}$")
LOG_KEYS = {"id", "source", "form", "title", "published", "state", "why", "runs", "channel"}
LOG_STATES = {"screen", "door", "pending", "gone"}
DOOR_WHY = {"no embedding": "Its channel has switched off showing it on other sites, so it plays on YouTube "
                            "and not in here.",
            "age-gated": "YouTube shows it only to signed-in adults, so it plays there and not in here."}

YT = re.compile(r"^[A-Za-z0-9_-]{11}$")
CLOCK = re.compile(r"^\d+:[0-5]\d(?::[0-5]\d)?$")
ENTITY = re.compile(r"&(?:[a-zA-Z][a-zA-Z0-9]{1,31}|#\d{1,6}|#x[0-9a-fA-F]{1,6});")
RANKING = re.compile(
    r"\b(?:best|greatest|essential|definitive|top)\s+(?:\d+\s+)?"
    r"(?:session|sessions|sets?|acts?|shows?|performances?|takes?)\b"
    r"|\bcountdown\b|\branked\b|\bno\.?\s*1\b"
    r"|\b(?:the\s+)?(?:oldest|newest|longest|shortest)\s+(?:thing|session|one|set)\s+on\b",
    re.I)
VERSE_LINE = 52


def esc(s):
    return html.escape(s, quote=False)


def attr(s):
    return html.escape(s, quote=True)


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
    studios = d.get("studios") or []
    if not studios:
        bad.append("data/live-room.json has no studios, and the desk is made of them.")
    seen, ids = set(), set()
    for st in studios:
        sname = (st.get("name") or "").strip() or "<unnamed studio>"
        sid = (st.get("id") or "").strip()
        if not re.match(r"^[a-z0-9-]+$", sid):
            bad.append(f"studio {sname!r} has {sid!r} as an id; it becomes an anchor.")
        if sid in ids:
            bad.append(f"studio id {sid!r} is used twice.")
        ids.add(sid)
        for f in ("name", "place", "about"):
            if not (st.get(f) or "").strip():
                bad.append(f"studio {sname!r} has no {f}.")
            elif ENTITY.search(st[f]):
                bad.append(f"studio {sname!r}'s {f} carries an HTML entity; write the character.")
        if not st.get("sessions"):
            bad.append(f"studio {sname!r} has no sessions, and would render as a heading over "
                       "nothing. Name it in words until somebody sends one.")
        for s in st.get("sessions") or []:
            t = (s.get("title") or "").strip() or "<untitled>"
            vid = (s.get("id") or "").strip()
            if not YT.match(vid):
                bad.append(f"{t!r} has {vid!r}, which is not a YouTube id. love-embed.js would "
                           "refuse it quietly, which is a button that never becomes a video.")
            if vid in seen:
                bad.append(f"{vid} is on the desk twice.")
            seen.add(vid)
            for f in ("tape", "title", "who", "where", "channel", "note", "spoken"):
                if not (s.get(f) or "").strip():
                    bad.append(f"{t!r} has no {f}.")
            if s.get("indoors") is not True:
                bad.append(
                    f"{t!r} is not marked as played indoors. This room is for sessions played "
                    "in a studio, and make-looming.py holds the opposite rule for outdoor "
                    "music one road over; a set played outside belongs there.")
            runs = (s.get("runs") or "").strip()
            if not CLOCK.match(runs):
                bad.append(f"{t!r} has {runs!r} as a runtime, which is not a clock. Every "
                           "control on this street says how long before the press.")
            note = (s.get("note") or "").strip()
            if looks_like_verse(note):
                bad.append(f"{t!r}'s note is several short hand-broken lines, which is what a "
                           "lyric looks like and what a sentence never does.")
            for f in ("tape", "title", "who", "where", "when", "channel", "note"):
                v = s.get(f) or ""
                if ENTITY.search(v):
                    bad.append(f"{t!r}'s {f} carries an HTML entity; write the character.")
                if RANKING.search(v):
                    bad.append(f"{t!r}'s {f} ranks the desk ({RANKING.search(v).group(0)!r}). "
                               "A desk is an order somebody patched things in, not a chart -- "
                               "and a superlative goes false the day another studio arrives.")
                for q in re.findall(r"“([^”]+)”|\"([^\"]+)\"", v):
                    quoted = (q[0] or q[1]).strip()
                    if quoted:
                        bad.append(f"{t!r}'s {f} quotes {quoted[:36]!r}... Nothing musical is "
                                   "hosted here and no words out of these sessions are on "
                                   "this page. Describe what it does instead.")
    return bad


# ── The month under the desk ─────────────────────────────────────────────────

def utc(s):
    return datetime.fromisoformat(s.replace("Z", "+00:00")).astimezone(timezone.utc)


def set_time(r):
    return datetime.strptime(r["set"], "%Y-%m-%dT%H:%MZ").replace(tzinfo=timezone.utc)


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


def listify(names):
    names = list(names)
    return names[0] if len(names) == 1 else ", ".join(names[:-1]) + " and " + names[-1]


def check_month(r, d):
    """Learning Large's rules for a month, and one of this room's own: every
    channel on it is a studio on the desk, read off that studio's own channel,
    so the month can never bring in a studio nobody named."""
    bad = []
    studios = {st["id"] for st in d.get("studios") or []}
    srcs = {}
    for s in r.get("sources") or []:
        for f in ("slug", "name", "url", "channel_id"):
            if not (s.get(f) or "").strip():
                bad.append(f"a channel in the month has no {f}: {s}")
        if not (s.get("url") or "").startswith("https://www.youtube.com/@"):
            bad.append(f"{s.get('name')!r}'s address is not a YouTube channel's own page.")
        if not CHANNEL.match(s.get("channel_id") or ""):
            bad.append(f"{s.get('name')!r} has {s.get('channel_id')!r}, which is not a channel id.")
        if s.get("slug") not in studios:
            bad.append(f"the month reads {s.get('name')!r} ({s.get('slug')!r}), which is not a studio on the "
                       "desk. The month is each studio's own channel; a studio goes on the desk first.")
        if s.get("slug") in srcs:
            bad.append(f"the channel {s['slug']!r} is listed twice.")
        srcs[s.get("slug")] = s
    if not srcs:
        bad.append("data/live-room-month.json lists no channels, so the month would be a heading over nothing.")
    if not r.get("set"):
        bad.append("data/live-room-month.json has no `set` time. Run tools/pull-live-month.py; the room "
                   "prints when the month was filled.")
        return bad
    oldest = set_time(r) - timedelta(days=MONTH, minutes=1)
    seen = set()
    for v in r.get("log") or []:
        t = (v.get("title") or "")[:40] or v.get("id")
        extra = set(v) - LOG_KEYS
        if extra:
            bad.append(f"the month's {t!r} carries {sorted(extra)}. A video is an id, a title, a channel, "
                       "a time and a length; nothing is read to you and nothing is counted.")
        if not YT.match(v.get("id") or ""):
            bad.append(f"the month's {t!r} has {v.get('id')!r}, which is not a YouTube id.")
        if v.get("source") not in srcs:
            bad.append(f"the month's {t!r} is from {v.get('source')!r}, which is not one of the channels.")
        if v.get("form") not in ("long", "short"):
            bad.append(f"the month's {t!r} does not say whether it is long-form or a short.")
        if v.get("state") not in LOG_STATES:
            bad.append(f"the month's {t!r} is in the state {v.get('state')!r}, which this does not know.")
        if not v.get("published") or utc(v["published"]) < oldest:
            bad.append(f"the month's {t!r} was published {v.get('published')}, more than a month before it "
                       "was filled. The older ones go off the end; this is not an archive.")
        if v.get("state") in ("screen", "door"):
            if v["id"] in seen:
                bad.append(f"{v['id']} is in the month twice.")
            seen.add(v["id"])
            if not (v.get("title") or "").strip():
                bad.append(f"{v['id']} in the month has no title.")
            if not (v.get("channel") or "").strip():
                bad.append(f"the month's {t!r} does not say whose channel it is on.")
        if v.get("state") == "screen" and not (isinstance(v.get("runs"), int) and v["runs"] > 0):
            bad.append(f"the month's {t!r} is a screen with no runtime. Every press in here says how long "
                       "before the press.")
        if v.get("state") == "door" and v.get("why") not in DOOR_WHY:
            bad.append(f"the month's {t!r} is a door with no reason this knows ({v.get('why')!r}), and a "
                       "door that does not say why looks like a broken screen.")
    return bad


def check_page():
    """The page loads rack.js, or every second button and the glass ship hidden
    for ever: a rack whose half that is not the plate never arrives."""
    src = ROOM.read_text()
    scripts = re.findall(r'<script src="([^"]+)"', src)
    if sorted(scripts) != sorted(SCRIPTS):
        return [f"live-room.html loads {scripts}. It loads {', '.join(SCRIPTS)}, and nothing else: rack.js "
                "unhides the glass and every strip's second button."]
    return []


# ── Drawing ──────────────────────────────────────────────────────────────────

def up(vid, title, channel, runs, said, tall=False):
    """A strip's second button: puts its video up on the glass, saying how long
    before the press. Ships hidden; rack.js unhides it."""
    full = f'{attr(title)}, on YouTube via {attr(channel)}'
    return (f'<button type="button" class="lvr-up" hidden data-rack-to="{GLASS[0]}" '
            f'data-rack-name="{GLASS[1]}" '
            f'data-rack-src="https://www.youtube-nocookie.com/embed/{attr(vid)}?autoplay=1&amp;rel=0" '
            f'data-rack-title="{full}, on {GLASS[1]}" data-rack-film="{attr(title)}" '
            f'data-rack-runtime="{attr(runs)}"' + (' data-rack-shape="tall"' if tall else "") +
            f'>Put it on {GLASS[1]} &mdash; {esc(said)}</button>')


def strip(s):
    when = f' &middot; {esc(s["when"])}' if s.get("when") else ""
    return (
        f'        <li class="lvr-strip" id="session-{attr(s["id"])}" data-rack-card>\n'
        f'          <p class="lvr-tape"><span>{esc(s["tape"])}</span></p>\n'
        f'          <h3 class="lvr-strip__title">{esc(s["title"])}</h3>\n'
        f'          <p class="lvr-strip__where">{esc(s["where"])}{when} &middot; '
        f'{esc(s["runs"])}</p>\n'
        f'          <p class="lvr-strip__note">{esc(s["note"])}</p>\n'
        f'          <button type="button" class="facade" data-embed-id="{attr(s["id"])}" '
        f'data-embed-title="{attr(s["title"])}, on YouTube via {attr(s["channel"])}">\n'
        f'            Play &mdash; {esc(s["spoken"])}\n'
        f'            <span class="facade__play">&#9654; PRESS PLAY</span>\n'
        f'          </button>\n'
        f'          {up(s["id"], s["title"], s["channel"], s["runs"], s["spoken"])}\n'
        f'          <p class="lvr-strip__on">{esc(s["who"])} &middot; on YouTube, via '
        f'{esc(s["channel"])}</p>\n'
        '        </li>')


def desk(d):
    out = []
    for st in d["studios"]:
        out.append(
            f'  <section class="lvr-studio" id="studio-{attr(st["id"])}" '
            f'aria-labelledby="studio-{attr(st["id"])}-h">\n'
            f'    <h2 id="studio-{attr(st["id"])}-h"><span class="lvr-studio__name">'
            f'{esc(st["name"])}</span> <span class="lvr-studio__place">{esc(st["place"])}'
            f'</span></h2>\n'
            f'    <p class="lvr-studio__about">{esc(st["about"])}</p>\n'
            '    <details class="lvr-rack" open>\n'
            '      <summary class="lvr-rack__sum">On the desk, patched in by hand</summary>\n'
            '      <ol class="lvr-desk">\n'
            + "\n".join(strip(s) for s in st["sessions"]) + "\n"
            '      </ol>\n'
            '    </details>\n'
            '  </section>')
    return "\n".join(out)


def glass():
    """The screen over the desk. Nothing of its own is on it, so it ships
    hidden, with tabindex so taking a video off puts the keyboard back here."""
    sid, name = GLASS
    return "\n".join([
        f'  <div class="lvr-glass" data-rack-screen="{sid}" tabindex="-1" hidden>',
        '    <p class="lvr-glass__idle"><span><b>The glass.</b> The live room is lit and nobody is in it. '
        'Any session on the desk, or anything in the month under it, can go up here with the button under '
        'it, and nothing loads until you press one.</span></p>',
        '  </div>',
        f'  <p class="lvr-glass__now" data-rack-now="{sid}" tabindex="-1" hidden></p>',
        f'  <p class="lvr-glass__back" hidden><button type="button" class="lvr-up" data-rack-back="{sid}">'
        f'Take it off {name}</button></p>'])


def log_item(v):
    tall = v["form"] == "short"
    runs = v.get("runs")
    when = esc(day(utc(v["published"]))) + (f" &middot; {clock(runs)}" if runs else "")
    head = (f'          <li class="lvr-log__item{" lvr-log__item--tall" if tall else ""}"'
            f'{" data-rack-card" if v["state"] == "screen" else ""}>\n'
            f'            <p class="lvr-log__title">{esc(v["title"])}</p>\n'
            f'            <p class="lvr-log__when">{when}</p>\n')
    if v["state"] == "screen":
        return (head +
                f'            <button type="button" class="facade" data-embed-id="{v["id"]}" '
                f'data-embed-title="{attr(v["title"])}, on YouTube via {attr(v["channel"])}">\n'
                f'              Play &mdash; {esc(spoken(runs))}\n'
                f'              <span class="facade__play">&#9654; PRESS PLAY</span>\n'
                f'            </button>\n'
                f'            {up(v["id"], v["title"], v["channel"], clock(runs), spoken(runs), tall)}\n'
                '          </li>')
    how = f" &mdash; {esc(spoken(runs))}" if runs else ""
    return (head +
            f'            <a class="lvr-log__door" href="https://www.youtube.com/watch?v={v["id"]}">'
            f'Watch on YouTube{how} &rarr;</a>\n'
            f'            <p class="lvr-log__why">{esc(DOOR_WHY[v["why"]])}</p>\n'
            '          </li>')


def covered(spans, a, b):
    return any(utc(x) <= a and utc(y) >= b for x, y in spans)


def month(r):
    """Every studio's month off its own channel, newest first, its videos and its
    shorts in lists of their own because a short's card is tall. A channel whose
    reading did not reach back a whole month says so; a channel with nothing
    says so in one line rather than a heading over nothing."""
    when = set_time(r)
    start = when - timedelta(days=MONTH)
    t = when.astimezone(HERE)
    at = f"{t.strftime('%I').lstrip('0')}:{t.strftime('%M')} {t.strftime('%p').lower()}"
    live = [v for v in r["log"] if v["state"] in ("screen", "door")]
    out = [f'    <p class="lvr-month__set">Last filled at <b>{at} on {esc(day(when))}</b>, Mountain time, '
           f'with what each studio put up on its own channel since {esc(day(start))}.</p>']
    quiet = []
    for s in r["sources"]:
        sid = attr(s["slug"])
        head = [f'    <section class="lvr-chan" id="month-{sid}" aria-labelledby="month-{sid}-h">',
                f'      <h3 class="lvr-chan__name" id="month-{sid}-h"><a href="{attr(s["url"])}">{esc(s["name"])}</a>'
                f' <span class="lvr-chan__on">on its own channel</span></h3>']
        if s["slug"] not in r.get("covered", {}):
            # ADDED SINCE THE LAST FILL, Hey, Good Cookin's case: it has never
            # been read, so the gap line below would describe a reading that
            # never happened.
            out += head + ['      <p class="lvr-chan__gap">This studio was added after the month was last filled. '
                           'Its month arrives with the next fill.</p>', '    </section>']
            continue
        mine = sorted((v for v in live if v["source"] == s["slug"]),
                      key=lambda v: (v["published"], v["id"]), reverse=True)
        cov = r["covered"][s["slug"]]
        # A MINUTE OF SLACK, The Open Notebook's: `set` is kept to the minute
        # and the puller's coverage to the second.
        gaps = [f for f in ("long", "short")
                if not covered(cov.get(f, []), start + timedelta(minutes=1), when)]
        if not mine and not gaps:
            quiet.append(esc(s["name"]))
            continue
        block = list(head)
        if gaps:
            what = {"long": "videos", "short": "shorts"}
            block.append(f'      <p class="lvr-chan__gap">What was read of its {" and ".join(what[f] for f in gaps)} '
                         'did not reach back a whole month, so some of its month may be missing here. It fills in '
                         'as the mornings go by.</p>')
        if not mine:
            block.append('      <p class="lvr-chan__gap">Nothing from this channel in what was read.</p>')
        else:
            block += ['      <details class="lvr-rack" open>',
                      '        <summary class="lvr-rack__sum">Its last month, newest first</summary>']
            for form in ("long", "short"):
                these = [v for v in mine if v["form"] == form]
                if these:
                    block.append(f'        <ul class="lvr-log{" lvr-log--tall" if form == "short" else ""}" '
                                 f'aria-label="{attr(s["name"])}, {"shorts" if form == "short" else "videos"}">')
                    block += [log_item(v) for v in these]
                    block.append('        </ul>')
            block.append('      </details>')
        block.append('    </section>')
        out += block
    if quiet:
        out.append(f'    <p class="lvr-month__quiet">Nothing from {listify(quiet)} this month.</p>')
    return "\n".join(out)


def credit_rows(d):
    rows = []
    for st in d["studios"]:
        for s in st["sessions"]:
            rows.append(
                f'      <tr><td><strong>{esc(s["who"])}</strong></td><td>{esc(s["title"])}</td>'
                f'<td>{esc(st["name"])}, {esc(s["where"])}</td><td>{esc(s["runs"])}</td>'
                f'<td>{esc(s["channel"])}</td>'
                f'<td><a href="https://www.youtube.com/watch?v={attr(s["id"])}">watch</a></td></tr>')
    return "\n".join(rows)


def month_credit(r):
    chans = listify(f'<a href="{attr(s["url"])}">{esc(s["name"])}</a>' for s in r["sources"])
    return (f'  <p><strong>Under the desk, the last month off each studio&rsquo;s own channel</strong>: '
            f'{chans}, their videos and their shorts, read off the channels&rsquo; own feeds and list pages '
            'every morning by <code>tools/pull-live-month.py</code>, which asks each new video&rsquo;s watch '
            'page once whether it plays, whether it can be shown here and how long it runs. Ryan&rsquo;s ask of '
            '2026-10-15. <strong>Nobody chose those videos or watched them first</strong>, and nothing says where '
            'each was played, so the rule that a session was played indoors is the desk&rsquo;s and not the '
            'month&rsquo;s. Their titles are the channels&rsquo; own, as written, and anything older than a month '
            'goes off the end.</p>')


def main():
    d = json.loads(DATA.read_text())
    r = json.loads(MONTHLY.read_text())
    if "--month" in sys.argv[1:]:
        bad = check_month(r, d)
        if bad:
            print("REFUSING to fill the month under the Live Room's desk:")
            for b in bad:
                print("  - " + b)
            return 1
        swap(ROOM, "lvr-month", month(r), "    ")
        live = [x for x in r["log"] if x["state"] in ("screen", "door")]
        print(f"live room: the month under the desk, filled {r['set']}, "
              f"{sum(x['state'] == 'screen' for x in live)} screens and "
              f"{sum(x['state'] == 'door' for x in live)} doors.")
        return 0
    bad = check(d) + check_month(r, d) + check_page()
    if bad:
        print("REFUSING to build The Live Room:")
        for b in bad:
            print("  - " + b)
        return 1
    swap(ROOM, "lvr-glass", glass(), "  ")
    swap(ROOM, "lvr-desk", desk(d), "  ")
    swap(ROOM, "lvr-month", month(r), "    ")
    swap(NOTES, "live-room-credits", credit_rows(d), "      ")
    swap(NOTES, "live-room-month-credit", month_credit(r), "  ")
    n = sum(len(st["sessions"]) for st in d["studios"])
    print(f"live room: {n} sessions on the desk across {len(d['studios'])} "
          f"stud{'io' if len(d['studios']) == 1 else 'ios'}, the glass over it, and the month under it "
          f"off {len(r['sources'])} channels, none of it hosted here and every one saying how long "
          "before the press.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
