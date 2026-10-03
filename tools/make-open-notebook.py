#!/usr/bin/env python3
"""Build The Open Notebook out of data/open-notebook.json and
data/open-notebook-month.json: the drawing of the day, the questions, the laptop,
the collection, the monthly log, and the room's credits in the liner notes.

WHAT THE ROOM IS. A desk under a window with a notebook lying open on it, and a
laptop beside it. Ryan Boren's brief, 2026-10-03: a shopfront for journaling,
led by his own piece, Bullet Journaling + Junk Journaling + Interstitial
Journaling, in full; then the reflection questions from our write-up of the
Infodumplings where he shared it; then the videos the piece points at, pulled
into a rack; then a rack with the last month from journaling channels he chose.

THE PIECE IS HIS AND IS SET BY HAND, between the onb:piece markers, and this
tool does not write it. What it checks about it:

  - A YOUTUBE LINK LEFT IN THE PIECE. The brief was to pull the piece's videos
    into a rack, so every list of them became a line saying it was migrated to
    the collection. A YouTube address still in the piece is a video that is not
    on the shelf, or one that is on it twice.
  - A MIGRATED LINE POINTING AT A SHELF THAT IS NOT THERE, and a practice in the
    data with no heading in the piece. The pointer and the shelf are two
    surfaces, written in two places.
  - A BYLINE WITHOUT RYAN'S NAME OR WITHOUT THE ORIGINAL'S ADDRESS. Attribution
    is the habit this street kept when it dropped the others.

It does not sweep the piece for our refusals. It is Ryan's voice, credited to
him by name, and Helen's rule holds for him too: somebody's writing is never
folded into our "we".

THE QUESTIONS ARE OUR WRITE-UP'S, WORD FOR WORD, and every one is looked for in
the Knowledge System mirror's copy of that post on every build. A question the
post no longer has is refused, the Town Hall's rule about a page somebody else
keeps: re-copy it, never loosen the check. Without the mirror it says it could
not check and carries on. THERE IS NOWHERE TO ANSWER THEM, ON PURPOSE, and the
page refuses a form, an input, a textarea or anything editable outside the job
marker: the friendly edit to a journaling room is a box that remembers what you
wrote, and then the notebook is ours instead of yours.

THE COLLECTION is every video the piece links, a shelf for each practice in the
piece's order, measured once on 2026-10-03. It refuses what make-vital.py's
telly refuses: an id that is not a YouTube id or is on a shelf twice, a video
with no runtime, a row carrying anything but what is listed in `_videos`.

THE MONTHLY LOG, out of data/open-notebook-month.json, is Vital Plant Living's
telly with journaling channels on it, and the reasons are that room's:
tools/pull-notebook-month.py reads each channel's own feeds on the morning
timer in tools/daily-notebook.sh, which runs this with --month so that only the
log is rewritten. It refuses a video older than the month, a row carrying a
description, a thumbnail or a count, a screen with no runtime, a door with no
reason, an id twice, and a channel not in the list. THE TITLES ARE THE
CHANNELS' AND ARE NOT SWEPT: some of them sell journaling as a way to get more
done, which is theirs to say, beside a sentence of ours saying the companion
line is the piece's and ours.

THE LAPTOP IS ONE SCREEN FOR BOTH RACKS, with nothing of its own on it: it
ships hidden and rack.js unhides it, the Doom Scoop's empty screen. A short
goes up upright, because its second button carries data-rack-shape="tall".

OUR OWN SENTENCES ARE SWEPT for the vocabulary of counting and of selling a
practice as output, with make-vital.py's negation window, so the room can still
say what it refuses. The piece, the questions, the racks' titles, the job marker
and quotations are cut out first.

THE DRAWING IS THE DAY. The notebook has lain open under the window since first
light, so the window's patch of sun has crossed the page at every hour and the
page has kept all of them. Each patch is a window's four panes thrown onto the
page at that hour's slant, in that hour's colour, with the time written under
it. It is drawn here rather than by hand so the patches are made from one
function, and nothing in it moves at any setting.

It writes nothing if anything is refused. Run it after editing either data
file, then make-og.py, because the share card lifts the drawing off the page.
"""
import html
import json
import re
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data/open-notebook.json"
MONTHLY = ROOT / "data/open-notebook-month.json"
PAGE = ROOT / "the-open-notebook.html"
NOTES = ROOT / "liner-notes.html"
MIRROR = (Path.home() / "Documents/Claude/Projects/Stimpunks Knowledge System/site/stimpunks.org"
          / "posts/infodumplings-interstitial-journaling-and-star-stuff.md")

YT = re.compile(r"^[A-Za-z0-9_-]{11}$")
CHANNEL = re.compile(r"^UC[A-Za-z0-9_-]{22}$")
HERE = ZoneInfo("America/Denver")
MONTH = 30           # days kept; tools/pull-notebook-month.py holds the same number
SCREEN = ("onb", "the laptop")

VIDEO_KEYS = {"group", "id", "title", "channel", "runs", "form", "as_linked", "piece_t"}
LOG_KEYS = {"id", "source", "form", "title", "published", "state", "why", "runs", "channel"}
LOG_STATES = {"screen", "door", "pending", "gone"}
DOOR_WHY = {"no embedding": "Its channel has switched off showing it on other sites, so it plays on YouTube and not in here.",
            "age-gated": "YouTube shows it only to signed-in adults, so it plays there and not in here."}

NEGATION = (r"(?:no|not|nothing|never|neither|none|without|refuses?|refused|refusing|"
            r"cannot|does not|won't|will not|is not|are not|isn't|aren't|nobody|nor|declin\w+)")
TALLY = (r"scores?|scored|scoring|streaks?|leaderboards?|tall(?:y|ies)|tallied|"
         r"most popular|ranked|rankings?|top (?:\d+|three|five|ten)")
# NARROW ON PURPOSE. "work" is not here: the piece's whole point is that the
# notebook assists work without feeling like it. What is here is the sales pitch
# for a practice, the line every journaling video ends up on.
OUTPUT = (r"productiv\w*|optimi[sz]\w*|life ?hacks?|hacks?|level(?:led|ed|ling|ing)? up|"
          r"self[- ]improvement|discipline\w*|hustl\w*|grind\w*|get your life together")
VOCAB = [
    (TALLY, "nothing in this notebook is counted, ranked or scored, and nothing keeps a "
            "record of you."),
    (OUTPUT, "this is journaling as tool, as companion and as practice rather than as "
             "performance. A channel's title may sell it as output; our sentences do not."),
]

problems = []


def refuse(msg):
    problems.append(msg)


def esc(s):
    return html.escape(str(s), quote=False)


def attr(s):
    return html.escape(str(s), quote=True)


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
                           src, flags=re.S))


def sweep(text, where):
    text = re.sub(r"<[^>]+>", " ", str(text))
    text = html.unescape(text)
    for pat, why in VOCAB:
        for m in re.finditer(rf"\b(?:{pat})\b", text, re.I):
            window = text[max(0, m.start() - 80):m.end()]
            if re.search(rf"\b{NEGATION}\b[^.]{{0,70}}?\b(?:{pat})", window, re.I):
                continue
            refuse(f"{where}: {m.group(0)!r} -- {why}")


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


# ── The day on the page ──────────────────────────────────────────────────────
# Each hour's patch: where the window's light landed (x, y), how big (w, h), how
# far the top edge is thrown sideways by the sun's angle (lean), and that hour's
# colour. Dawn comes in from the left, long and blue; noon is nearly square and
# nearly white; dusk comes from the right, long and rose. The times are the
# drawing's labels and nothing else: nobody wrote anything at 6:40.

HOURS = [
    ("6:40",  36, 50, 150, 228, 150, "--onb-dawn"),
    ("9:15", 214, 42, 150, 210,  72, "--onb-morning"),
    ("12:05", 405, 34, 168, 200,  0, "--onb-noon"),
    ("15:30", 598, 42, 150, 210, -72, "--onb-afternoon"),
    ("18:20", 742, 50, 150, 228, -150, "--onb-dusk"),
]
DAY_W, DAY_H = 1000, 330


def window_patch(x, y, w, h, lean, ink):
    """Four panes of one window, thrown onto the page as a parallelogram. The
    frame's shadow is the gap between them, which is the page in shade."""
    gx, gy = 0.03, 0.045

    def pt(u, v):
        return (x + u * w + lean * (1 - v), y + v * h)

    out = []
    for u0, u1 in ((0, 0.5 - gx), (0.5 + gx, 1)):
        for v0, v1 in ((0, 0.5 - gy), (0.5 + gy, 1)):
            pts = [pt(u0, v0), pt(u1, v0), pt(u1, v1), pt(u0, v1)]
            out.append('<path d="M' + " L".join(f"{a:.1f} {b:.1f}" for a, b in pts)
                       + f' Z" fill="var({ink})"/>')
    return "".join(out)


def day_svg():
    s = [f'  <svg class="onb-day" viewBox="0 0 {DAY_W} {DAY_H}" aria-hidden="true" focusable="false">',
         '<defs><pattern id="onb-grid" width="20" height="20" patternUnits="userSpaceOnUse">'
         '<circle cx="10" cy="10" r="1.3" fill="var(--onb-dot)"/></pattern></defs>',
         f'<rect width="{DAY_W}" height="{DAY_H}" rx="18" fill="var(--onb-shade)"/>',
         '<g class="onb-day__light">']
    s += [window_patch(x, y, w, h, lean, ink) for _, x, y, w, h, lean, ink in HOURS]
    s += ['</g>',
          f'<rect width="{DAY_W}" height="{DAY_H}" rx="18" fill="url(#onb-grid)"/>']
    for t, x, y, w, h, lean, _ in HOURS:
        s.append(f'<text class="onb-day__hour" x="{x + w / 2:.0f}" y="{y + h + 30}" '
                 f'text-anchor="middle">{t}</text>')
    # The two ribbon markers sewn into the spine, hanging down over the page.
    s.append('<path d="M890 0 H906 V252 L898 242 L890 252 Z" fill="var(--onb-washi-sage)"/>')
    s.append('<path d="M914 0 H930 V206 L922 196 L914 206 Z" fill="var(--onb-washi-blush)"/>')
    s.append('</svg>')
    return "".join(s)


# ── The questions ────────────────────────────────────────────────────────────

def plain(md):
    """The mirror's markdown as words: emphasis marks out, whitespace folded."""
    t = re.sub(r"\*+", "", md)
    return re.sub(r"\s+", " ", t)


def check_questions(q):
    for k in ("post", "event", "star_stuff", "journaling", "star_intro", "star_prompts", "star_structure"):
        if not q.get(k):
            refuse(f"the questions have no {k}.")
    if not MIRROR.exists():
        print("make-open-notebook: the Knowledge System mirror is not on this machine, so the "
              "questions were not checked against the post. They were last time it was.")
        return
    src = plain(MIRROR.read_text())
    if q["post"] not in src:
        refuse("the mirror's copy of the post is not the post the questions name.")
    want = [i for g in q["journaling"] for i in [g["name"]] + g["items"]]
    want += [q["star_intro"], *q["star_prompts"], PROMPTS_LEAD, STRUCTURE_LEAD]
    want += [w for s in q["star_structure"] for w in (s["name"], s["what"])]
    for w in want:
        if plain(w) not in src:
            refuse(f"{w[:60]!r} is not in our write-up of that evening as the mirror has it. "
                   "Re-copy it from the post; do not loosen this.")


PROMPTS_LEAD = "Some writing or speaking prompt directions that fit the ethos:"
STRUCTURE_LEAD = "L★S could be an acronym that doubles as a journaling framework:"


def questions(q):
    out = ['    <h3 class="onb-q__part">Journaling Reflection Questions</h3>']
    for g in q["journaling"]:
        out.append(f'    <h4 class="onb-q__group">{esc(g["name"])}</h4>')
        out.append('    <ul class="onb-q">')
        out += [f'      <li>{esc(i)}</li>' for i in g["items"]]
        out.append('    </ul>')
    out += ['    <h3 class="onb-q__part">Star Stuff Reflection Questions</h3>',
            f'    <p>{esc(q["star_intro"])}</p>',
            f'    <p>{esc(PROMPTS_LEAD)}</p>',
            '    <ul class="onb-q onb-q--prompts">']
    out += [f'      <li><em>{esc(p)}</em></li>' for p in q["star_prompts"]]
    out += ['    </ul>',
            '    <h4 class="onb-q__group">As a prompt structure</h4>',
            f'    <p>{esc(STRUCTURE_LEAD)}</p>',
            '    <dl class="onb-ls">']
    for s in q["star_structure"]:
        out.append(f'      <div class="onb-ls__row"><dt><span class="onb-ls__mark">{esc(s["mark"])}</span> '
                   f'{esc(s["name"])}</dt><dd>{esc(s["what"])}</dd></div>')
    out.append('    </dl>')
    return "\n".join(out)


# ── A card, on either rack ───────────────────────────────────────────────────

def card(v, sub, extra=""):
    tall = v["form"] == "short"
    runs = v.get("runs")
    head = (f'          <li class="onb-card{" onb-card--short" if tall else ""}"'
            f'{" data-rack-card" if v.get("state", "screen") == "screen" else ""}>\n'
            f'            <p class="onb-card__title">{esc(v["title"])}</p>\n'
            f'            <p class="onb-card__by">{sub}</p>\n' + extra)
    full = f'{attr(v["title"])}, on YouTube via {attr(v["channel"])}'
    if v.get("state", "screen") == "screen":
        body = (f'            <button type="button" class="facade" data-embed-id="{v["id"]}" '
                f'data-embed-title="{full}">\n'
                f'              Play &mdash; {esc(spoken(runs))}\n'
                f'              <span class="facade__play">&#9654; PRESS PLAY</span>\n'
                f'            </button>\n'
                f'            <button type="button" class="onb-card__up" hidden data-rack-to="{SCREEN[0]}" '
                f'data-rack-name="{SCREEN[1]}" '
                f'data-rack-src="https://www.youtube-nocookie.com/embed/{v["id"]}?autoplay=1&amp;rel=0" '
                f'data-rack-title="{full}, on {SCREEN[1]}" '
                f'data-rack-film="{attr(v["title"])}" data-rack-runtime="{clock(runs)}"'
                + (' data-rack-shape="tall"' if tall else "") +
                f'>Put it on {SCREEN[1]} &mdash; {esc(spoken(runs))}</button>\n')
    else:
        how = f" &mdash; {esc(spoken(runs))}" if runs else ""
        body = (f'            <a class="onb-card__door" href="https://www.youtube.com/watch?v={v["id"]}">'
                f'Watch on YouTube{how} &rarr;</a>\n'
                f'            <p class="onb-card__why">{esc(DOOR_WHY[v["why"]])}</p>\n')
    return head + body + '          </li>'


def card_list(rows, label, render):
    """Videos, then shorts, each in its own list: a short's card is tall, and a
    row of mixed cards stretches the long ones to match it."""
    out = []
    for form in ("long", "short"):
        mine = [v for v in rows if v["form"] == form]
        if mine:
            out.append(f'        <ul class="onb-cards{" onb-cards--short" if form == "short" else ""}" '
                       f'aria-label="{attr(label)}, {"shorts" if form == "short" else "videos"}">')
            out += [render(v) for v in mine]
            out.append('        </ul>')
    return out


# ── The laptop and the collection ────────────────────────────────────────────

def laptop():
    return "\n".join([
        f'    <div class="onb-laptop" data-rack-screen="{SCREEN[0]}" tabindex="-1" hidden>',
        '      <p class="onb-laptop__idle"><span><b>The laptop.</b> Nothing is on it. Any video on this page '
        'can go up here with the button under it, and nothing loads until you press one.</span></p>',
        '    </div>',
        f'    <p class="onb-laptop__now" data-rack-now="{SCREEN[0]}" tabindex="-1" hidden></p>',
        f'    <p class="onb-laptop__back" hidden><button type="button" class="onb-back" '
        f'data-rack-back="{SCREEN[0]}">Take it off the laptop</button></p>'])


def check_collection(d):
    groups = {g["key"]: g for g in d.get("groups") or []}
    if not groups:
        refuse("data/open-notebook.json has no practices, so the collection has no shelves.")
    seen = set()
    for v in d.get("videos") or []:
        t = (v.get("title") or "")[:40] or v.get("id")
        extra = set(v) - VIDEO_KEYS
        if extra:
            refuse(f"the collection's {t!r} carries {sorted(extra)}. See _videos.")
        if not YT.match(v.get("id") or ""):
            refuse(f"the collection's {t!r} has {v.get('id')!r}, which is not a YouTube id.")
        if v.get("id") in seen:
            refuse(f"{v.get('id')} is in the collection twice.")
        seen.add(v.get("id"))
        if v.get("group") not in groups:
            refuse(f"the collection's {t!r} is on the shelf {v.get('group')!r}, which the piece "
                   "has no part for.")
        if v.get("form") not in ("long", "short"):
            refuse(f"the collection's {t!r} does not say whether it is a video or a short.")
        if not (isinstance(v.get("runs"), int) and v["runs"] > 0):
            refuse(f"the collection's {t!r} has no runtime. Every press in here says how long "
                   "before the press.")
        for f in ("title", "channel"):
            if not (v.get(f) or "").strip():
                refuse(f"the collection's {v.get('id')} has no {f}.")
    for k in groups:
        if not any(v.get("group") == k for v in d.get("videos") or []):
            refuse(f"the shelf {k!r} has nothing on it, so the piece would point at an empty shelf.")


def collection(d):
    out = ['    <details class="onb-racked" open>',
           '      <summary>The videos in the piece, a shelf for each practice</summary>']
    for g in d["groups"]:
        rows = [v for v in d["videos"] if v["group"] == g["key"]]
        sid = f'onb-shelf-{g["key"]}'
        out += [f'      <section class="onb-shelf" id="{sid}" aria-labelledby="{sid}-h">',
                f'        <h3 id="{sid}-h" class="onb-shelf__name">{esc(g["name"])}</h3>',
                f'        <p class="onb-shelf__back"><a href="#{g["anchor"]}">Back to {esc(g["name"])} '
                'in the piece</a></p>']

        def render(v):
            was = ""
            if v.get("as_linked"):
                was = (f'            <p class="onb-card__was">Its channel has retitled it since the piece '
                       f'linked it as &ldquo;{esc(v["as_linked"])}&rdquo;.</p>\n')
            return card(v, f'{esc(v["channel"])} &middot; {clock(v["runs"])}', was)

        out += card_list(rows, g["name"], render)
        out.append('      </section>')
    out.append('    </details>')
    return "\n".join(out)


# ── The monthly log ──────────────────────────────────────────────────────────

def set_time(r):
    return datetime.strptime(r["set"], "%Y-%m-%dT%H:%MZ").replace(tzinfo=timezone.utc)


def check_month(r):
    srcs = {}
    for s in r.get("sources") or []:
        for f in ("slug", "name", "url", "channel_id"):
            if not (s.get(f) or "").strip():
                refuse(f"a channel in the monthly log has no {f}: {s}")
        if not (s.get("url") or "").startswith("https://www.youtube.com/@"):
            refuse(f"{s.get('name')!r}'s address is not a YouTube channel's own page.")
        if not CHANNEL.match(s.get("channel_id") or ""):
            refuse(f"{s.get('name')!r} has {s.get('channel_id')!r}, which is not a channel id.")
        if s.get("slug") in srcs:
            refuse(f"the channel {s['slug']!r} is listed twice.")
        srcs[s.get("slug")] = s
    if not srcs:
        refuse("data/open-notebook-month.json lists no channels, so the log would be a heading "
               "over nothing.")
    if not r.get("set"):
        refuse("data/open-notebook-month.json has no `set` time. Run tools/pull-notebook-month.py; "
               "the room prints when the log was filled.")
        return
    oldest = set_time(r) - timedelta(days=MONTH, minutes=1)
    seen = set()
    for v in r.get("log") or []:
        t = (v.get("title") or "")[:40] or v.get("id")
        extra = set(v) - LOG_KEYS
        if extra:
            refuse(f"the log's {t!r} carries {sorted(extra)}. A video is an id, a title, a channel, "
                   "a time and a length; nothing is read to you and nothing is counted.")
        if not YT.match(v.get("id") or ""):
            refuse(f"the log's {t!r} has {v.get('id')!r}, which is not a YouTube id.")
        if v.get("source") not in srcs:
            refuse(f"the log's {t!r} is from {v.get('source')!r}, which is not one of the channels.")
        if v.get("form") not in ("long", "short"):
            refuse(f"the log's {t!r} does not say whether it is long-form or a short.")
        if v.get("state") not in LOG_STATES:
            refuse(f"the log's {t!r} is in the state {v.get('state')!r}, which this does not know.")
        if not v.get("published") or utc(v["published"]) < oldest:
            refuse(f"the log's {t!r} was published {v.get('published')}, more than a month before "
                   "the log was filled. The older ones go off the end; this is not an archive.")
        if v.get("state") in ("screen", "door"):
            if v["id"] in seen:
                refuse(f"{v['id']} is in the log twice.")
            seen.add(v["id"])
            if not (v.get("title") or "").strip():
                refuse(f"{v['id']} in the log has no title.")
            if not (v.get("channel") or "").strip():
                refuse(f"the log's {t!r} does not say whose channel it is on.")
        if v.get("state") == "screen" and not (isinstance(v.get("runs"), int) and v["runs"] > 0):
            refuse(f"the log's {t!r} is a screen with no runtime. Every press in here says how "
                   "long before the press.")
        if v.get("state") == "door" and v.get("why") not in DOOR_WHY:
            refuse(f"the log's {t!r} is a door with no reason this knows ({v.get('why')!r}), and a "
                   "door that does not say why looks like a broken screen.")


def covered(spans, a, b):
    return any(utc(x) <= a and utc(y) >= b for x, y in spans)


def listify(names):
    names = [esc(n) for n in names]
    return names[0] if len(names) == 1 else ", ".join(names[:-1]) + " and " + names[-1]


def month(r):
    when = set_time(r)
    start = when - timedelta(days=MONTH)
    t = when.astimezone(HERE)
    at = f"{t.strftime('%I').lstrip('0')}:{t.strftime('%M')} {t.strftime('%p').lower()}"
    live = [v for v in r["log"] if v["state"] in ("screen", "door")]
    out = [f'    <p class="onb-log__set">The log was last filled at <b>{at} on {esc(day(when))}</b>, '
           f'Mountain time, with what each channel put up since {esc(day(start))}. Anything in it can '
           'go up on the laptop.</p>',
           '    <details class="onb-racked" open>',
           '      <summary>A month of their videos, newest first under each channel</summary>']
    quiet = []
    for s in r["sources"]:
        mine = sorted((v for v in live if v["source"] == s["slug"]),
                      key=lambda v: (v["published"], v["id"]), reverse=True)
        cov = r.get("covered", {}).get(s["slug"], {})
        # A MINUTE OF SLACK, the same minute check_month allows: `set` is kept to
        # the minute and the puller's coverage to the second, so a feed that did
        # reach the start of the month read as a few seconds short of it, and
        # the first fill said so under every channel with a short list.
        gaps = [f for f in ("long", "short")
                if not covered(cov.get(f, []), start + timedelta(minutes=1), when)]
        if not mine and not gaps:
            quiet.append(s["name"])
            continue
        block = [f'      <section class="onb-chan" aria-label="{attr(s["name"])}">',
                 f'        <h3 class="onb-chan__name"><a href="{attr(s["url"])}">{esc(s["name"])}</a></h3>']
        if gaps:
            what = {"long": "videos", "short": "shorts"}
            block.append(f'        <p class="onb-chan__gap">Its {" and ".join(what[f] for f in gaps)} feed did not '
                         'reach back a whole month the last time it was read, so some of its month may be '
                         'missing here. It fills in as the mornings go by.</p>')
        if not mine:
            block.append('        <p class="onb-chan__none">Nothing from this channel in what the feeds reached.</p>')

        def render(v):
            runs = v.get("runs")
            sub = esc(day(utc(v["published"]))) + (f" &middot; {clock(runs)}" if runs else "")
            return card(v, sub)

        block += card_list(mine, s["name"], render)
        block.append('      </section>')
        out += block
    if quiet:
        out.append(f'      <p class="onb-log__quiet">Nothing from {listify(quiet)} this month.</p>')
    out.append('    </details>')
    return "\n".join(out)


# ── The liner notes ──────────────────────────────────────────────────────────

def liner_videos(d):
    names = {g["key"]: g["name"] for g in d["groups"]}
    return "\n".join(f'      <tr><td>{esc(v["channel"])}</td><td>{esc(v["title"])}</td>'
                     f'<td>{esc(names[v["group"]])}</td><td>{clock(v["runs"])}</td>'
                     f'<td><a href="https://www.youtube.com/watch?v={v["id"]}">watch</a></td></tr>'
                     for v in d["videos"])


def liner_month(r):
    return "\n".join(f'      <tr><td><a href="{attr(s["url"])}">{esc(s["name"])}</a></td>'
                     f'<td>its videos and its shorts, the last month of each</td></tr>'
                     for s in r["sources"])


# ── The page as written ──────────────────────────────────────────────────────

def check_piece(d):
    src = PAGE.read_text()
    m = re.search(r"<!-- onb:piece:begin -->(.*?)<!-- onb:piece:end -->", src, re.S)
    if not m:
        refuse("the-open-notebook.html has lost its onb:piece markers, so nothing can say which "
               "words are Ryan's.")
        return
    piece = m.group(1)
    p = d.get("piece") or {}
    if p.get("by", "") not in piece or p.get("url", "") not in piece:
        refuse("the piece's byline does not name its writer and link the original. Attribution "
               "is the one habit this street kept.")
    if re.search(r"youtube\.com|youtu\.be", piece):
        refuse("there is a YouTube address in the piece. Its videos are pulled into the collection; "
               "a link left behind is a video not on a shelf, or on one twice.")
    for g in d.get("groups") or []:
        if f'id="{g["anchor"]}"' not in piece:
            refuse(f"the piece has no heading with id {g['anchor']!r} for {g['name']}, so the shelf "
                   "has nowhere to point back to.")
        if f'href="#onb-shelf-{g["key"]}"' not in piece:
            refuse(f"the piece's {g['name']} part does not say its videos were migrated to the "
                   "collection, or points at a shelf that is not there.")


def sweep_page():
    src = PAGE.read_text()
    body = src[src.index("<main"):src.index("</main>")]
    for marker in ("onb:piece", "onb:questions", "onb:collection", "onb:month", "onb:day"):
        body = re.sub(rf"<!-- {marker}:begin -->.*?<!-- {marker}:end -->", " ", body, flags=re.S)
    body = re.sub(r"<!-- quest:[\w-]+:begin -->.*?<!-- quest:[\w-]+:end -->", " ", body, flags=re.S)
    body = re.sub(r"<blockquote.*?</blockquote>", " ", body, flags=re.S)
    body = re.sub(r"<!--.*?-->", " ", body, flags=re.S)
    sweep(body, PAGE.name)
    # NOWHERE TO WRITE. The job marker's answer box is the guild's furniture
    # and is cut out above; anything else that takes words is a notebook of
    # ours keeping somebody's.
    for name, tag in (("a form", r"<form\b"), ("an input", r"<input\b"), ("a textarea", r"<textarea\b"),
                      ("a select", r"<select\b"), ("something editable", r"contenteditable")):
        if re.search(tag, body, re.I):
            refuse(f"the room has {name} in it. There is nowhere to write in here, on purpose: "
                   "the questions are for somebody's own paper.")
    scripts = re.findall(r'<script src="([^"]+)"', src)
    if sorted(scripts) != sorted(["love.js", "love-embed.js", "rack.js", "quest.js"]):
        refuse(f"the room loads {scripts}. It loads love.js, love-embed.js, rack.js and quest.js "
               "and nothing else: a script of its own would be the first thing in here that could "
               "keep something.")
    ids = re.findall(r'\bid="([^"]+)"', src)
    dup = sorted({i for i in ids if ids.count(i) > 1})
    if dup:
        refuse(f"ids with two owners on the page: {', '.join(dup)}")


def main():
    r = json.loads(MONTHLY.read_text())
    check_month(r)
    if "--month" in sys.argv[1:]:
        # THE MORNING TIMER'S PATH: the log and nothing else, so a session's edit
        # to the rest of the page or to the liner notes is never touched by a
        # machine refilling the rack.
        if problems:
            print("REFUSING:\n  " + "\n  ".join(problems))
            sys.exit(1)
        swap(PAGE, "onb:month", month(r), "")
        live = [v for v in r["log"] if v["state"] in ("screen", "door")]
        print(f"the open notebook: the monthly log, filled {r['set']}, "
              f"{sum(v['state'] == 'screen' for v in live)} screens and "
              f"{sum(v['state'] == 'door' for v in live)} doors")
        return
    d = json.loads(DATA.read_text())
    check_collection(d)
    check_questions(d.get("questions") or {})
    check_piece(d)
    if problems:
        print("REFUSING:\n  " + "\n  ".join(problems))
        sys.exit(1)
    swap(PAGE, "onb:day", day_svg(), "")
    swap(PAGE, "onb:questions", questions(d["questions"]), "")
    swap(PAGE, "onb:laptop", laptop(), "")
    swap(PAGE, "onb:collection", collection(d), "")
    swap(PAGE, "onb:month", month(r), "")
    swap(NOTES, "notebook-credits", liner_videos(d), "      ")
    swap(NOTES, "notebook-month-credits", liner_month(r), "      ")
    sweep_page()
    if problems:
        print("REFUSING (the page as written):\n  " + "\n  ".join(problems))
        sys.exit(1)
    print("the open notebook: the day, the questions, the laptop, the collection and the "
          "monthly log written")


if __name__ == "__main__":
    main()
