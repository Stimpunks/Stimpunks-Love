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

THE STICKER DRAWER, Ryan's brief of 2026-10-12: the days of the week and the
months of the year by name, on 4 x 7 inch sheets for Liene's PixCut S1, in any
face on the street and three sizes, the week or the year on one sheet or one
name to a sheet, as many stickers to a sheet as will go. Every number it draws
with is in data/open-notebook.json, and this writes it twice: into the
sentences above the drawer and onto the drawer's data- attributes, which
notebook-stickers.js reads. So the page cannot say 3 mm while the sheets are
drawn at 2. The face picker is built from data/foundry-faces.json, the record
The Foundry's shelves and The Mopery's picker come from, and check-faces.py
reads it in both directions like theirs: a face added to fonts/ is in the
drawer on the next run, and never by hand.

IT NARROWED A RULE OF THIS ROOM, ON RYAN'S ASK, AND ONLY AS FAR AS IT HAD TO.
The room refused a select and any script of its own, so that there would be
nowhere to write. The drawer needs a face picker and a script to draw with.
Neither is somewhere to write: a select chooses from a list, and nothing in
the drawer takes a word. So what is refused now is a form, an input, a
textarea or anything editable anywhere outside the job marker, and a select
anywhere outside the drawer; the scripts are the four and
notebook-stickers.js, and that file is refused if it stores anything, sends
anything, or writes markup from a string. A sheet goes to the visitor's own
device as a download, the Small Hours' placemat's way, and nowhere else.

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
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data/open-notebook.json"
MONTHLY = ROOT / "data/open-notebook-month.json"
PAGE = ROOT / "the-open-notebook.html"
NOTES = ROOT / "liner-notes.html"
MIRROR = (Path.home() / "Documents/Claude/Projects/Stimpunks Knowledge System/site/stimpunks.org"
          / "posts/infodumplings-interstitial-journaling-and-star-stuff.md")
FACES = ROOT / "data/foundry-faces.json"
FOUNDRY = ROOT / "data/foundry.json"
SOURCES = ROOT / "fonts/_sources.json"
CSS = ROOT / "love.css"
STICKERS = ROOT / "notebook-stickers.js"
SCRIPTS = ["love.js", "love-embed.js", "rack.js", "quest.js", STICKERS.name]

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


# ── The sticker drawer ───────────────────────────────────────────────────────

# The names, in English and in order, from a week that began on a Monday and a
# year, so a typo in the data file is a refusal rather than a sticker.
DAY_NAMES = [date(2024, 1, n).strftime("%A") for n in range(1, 8)]
MONTH_NAMES = [date(2024, n, 1).strftime("%B") for n in range(1, 13)]
SIZE_KEYS = ["small", "medium", "large"]
SHEET_KEYS = ["week", "days", "year", "months"]
STICKER_KEYS = {"printer", "paper_in", "printable_mm", "dpi", "inset_mm", "gap_mm", "grid_mm",
                "label", "sizes", "sheets", "days", "months", "opens"}
NUMBER = {1: "one", 2: "two", 3: "three", 4: "four", 5: "five", 6: "six", 7: "seven",
          8: "eight", 9: "nine", 10: "ten", 11: "eleven", 12: "twelve"}
# The drawer keeps nothing and sends nothing, and nothing in it builds markup
# out of a string: a word on a sticker is drawn on a canvas, and the page round
# it is built with textContent.
KEEPS = re.compile(r"localStorage|sessionStorage|indexedDB|document\.cookie|fetch\(|"
                   r"XMLHttpRequest|sendBeacon|WebSocket|EventSource")
MARKUP = re.compile(r"innerHTML|outerHTML|insertAdjacentHTML|document\.write")


def g(x):
    return f"{x:g}"


def covers(weights, n):
    """A variant's weight is one number, or a range a variable file answers to."""
    p = [int(w) for w in str(weights).split()]
    return p[0] <= n <= p[-1]


def declared():
    """Every family, style and weight love.css declares an @font-face for."""
    out = {}
    for block in re.findall(r"@font-face\s*\{([^}]*)\}", CSS.read_text()):
        fam = re.search(r"font-family:\s*['\"]([^'\"]+)['\"]", block)
        if not fam:
            continue
        w = re.search(r"font-weight:\s*([\d ]+);", block)
        st = re.search(r"font-style:\s*(\w+)", block)
        out.setdefault((fam.group(1), st.group(1) if st else "normal"), []).append(
            w.group(1).strip() if w else "400")
    return out


def sticker_faces():
    """Every face this site holds, with the weight a sticker is set at: 400 where
    the family has it, and otherwise the one weight it was brought here in."""
    faces = json.loads(FACES.read_text())["faces"]
    held = json.loads(SOURCES.read_text())
    have = declared()
    out = []
    for slug, rec in sorted(faces.items(), key=lambda kv: kv[1]["family"].lower()):
        if slug not in held:
            continue
        normals = [v["weight"] for v in rec["variants"] if v["style"] == "normal"]
        if not normals:
            refuse(f"the sticker drawer: {rec['family']} has no upright file, and a sticker is never "
                   "set in a slant the browser invents.")
            continue
        w = 400 if any(covers(x, 400) for x in normals) else int(str(normals[0]).split()[0])
        if not any(covers(x, w) for x in have.get((rec["family"], "normal"), [])):
            refuse(f"the sticker drawer would ask for {rec['family']} at {w}, and love.css declares no "
                   "@font-face for it, so the browser would draw a stand-in and call it that face.")
        out.append((slug, rec, w))
    return out


def check_stickers(s):
    if not s:
        refuse("data/open-notebook.json has no stickers, so the drawer has nothing to draw with.")
        return
    extra = set(s) - STICKER_KEYS - {k for k in s if k.startswith("_")}
    if extra:
        refuse(f"the stickers carry {sorted(extra)}, which the drawer does not know.")
    if s.get("days") != DAY_NAMES:
        refuse(f"the stickers' days are {s.get('days')}, not Monday to Sunday by name.")
    if s.get("months") != MONTH_NAMES:
        refuse(f"the stickers' months are {s.get('months')}, not January to December by name.")
    pin, pr = s.get("paper_in") or [], s.get("printable_mm") or []
    if len(pin) != 2 or len(pr) != 2 or not all(isinstance(x, (int, float)) and x > 0 for x in pin + pr):
        refuse("the stickers need the paper in inches and the printable area in mm, each as two numbers.")
        return
    if any(a > b * 25.4 for a, b in zip(pr, pin)):
        refuse("the printable area is bigger than the paper.")
    if not (isinstance(s.get("dpi"), int) and s["dpi"] > 0) or any(
            abs(x * s["dpi"] - round(x * s["dpi"])) > 1e-9 for x in pin):
        refuse("the stickers' dpi does not give the paper a whole number of pixels.")
    for k in ("inset_mm", "gap_mm", "grid_mm"):
        if not (isinstance(s.get(k), (int, float)) and s[k] > 0):
            refuse(f"the stickers have no {k}.")
    lab = s.get("label") or {}
    if not all(isinstance(lab.get(k), (int, float)) and 0 < lab[k] < 0.5 for k in ("pad", "vpad", "round")):
        refuse("a label's pad, vpad and round are fractions of its height, each under a half.")
    sizes = s.get("sizes") or []
    if [z.get("key") for z in sizes] != SIZE_KEYS:
        refuse(f"the sizes are {[z.get('key') for z in sizes]}; the brief is small, medium and large.")
    tall = [z.get("squares", 0) * s.get("grid_mm", 0) for z in sizes]
    if tall != sorted(set(tall)) or not all(t > 0 for t in tall):
        refuse("the sizes do not grow from small to large.")
    if tall and pr and tall[-1] + 2 * s.get("inset_mm", 0) > min(pr):
        refuse("the largest sticker is taller than the printable area is wide.")
    if [z.get("key") for z in s.get("sheets") or []] != SHEET_KEYS:
        refuse("the sheets are the week on one, a day to each, the year on one and a month to each.")
    o = s.get("opens") or {}
    faces = {slug for slug, _, _ in sticker_faces()}
    if o.get("face") not in faces or o.get("size") not in SIZE_KEYS or o.get("sheet") not in SHEET_KEYS:
        refuse(f"the drawer opens on {o}, which is not a face, a size and a sheet it has.")
    p = s.get("printer") or {}
    for k in ("url", "spec", "faq"):
        if not re.match(r"^https://www\.liene-life\.com/[^?#\s]+$", p.get(k) or ""):
            refuse(f"the printer's {k} is not one of Liene's own pages, plain, with no query string.")
    js = STICKERS.read_text() if STICKERS.exists() else ""
    if not js:
        refuse("notebook-stickers.js is missing, so the drawer would be a heading over nothing.")
    if KEEPS.search(js):
        refuse(f"notebook-stickers.js uses {KEEPS.search(js).group(0)!r}. The drawer keeps nothing and "
               "sends nothing: a sheet is drawn here and saved to the visitor's own device.")
    if MARKUP.search(js):
        refuse(f"notebook-stickers.js uses {MARKUP.search(js).group(0)!r}. It builds the page with "
               "textContent, so no name or credit can ever become markup.")


def stickers_block(s):
    pin, pr, dpi = s["paper_in"], s["printable_mm"], s["dpi"]
    pmm = [round(x * 25.4, 2) for x in pin]
    px = [round(x * dpi) for x in pin]
    p, lab, gap = s["printer"], s["label"], s["gap_mm"]
    sizes = [(z["key"], z["name"], z["squares"], z["squares"] * s["grid_mm"]) for z in s["sizes"]]
    many = {"days": len(s["days"]), "months": len(s["months"])}
    opens = s["opens"]
    faces = sticker_faces()
    where = json.loads(FOUNDRY.read_text())["faces"]
    sized = "; ".join(f"{name} is {NUMBER[sq]} squares, {g(mm)} mm" for _, name, sq, mm in sizes)
    out = [
        f'    <p>Every sheet is made for <a href="{attr(p["url"])}">the {esc(p["name"])}</a>, '
        f'{esc(p["maker"])}&rsquo;s photo sticker printer and cutter, and its {g(pin[0])} &times; {g(pin[1])} '
        f'inch sticker paper. <a href="{attr(p["spec"])}">{esc(p["maker"])}&rsquo;s help centre</a> gives that '
        f'paper&rsquo;s printable area as {g(pr[0])} &times; {g(pr[1])} mm, printed at {dpi} dpi, and '
        f'<a href="{attr(p["faq"])}">its FAQ</a> says the {esc(p["app"])} app will cut round a PNG with no '
        f'background. <strong>So a sheet is saved as exactly that</strong>: a PNG {px[0]} &times; {px[1]} pixels, '
        f'which is {g(pin[0])} &times; {g(pin[1])} inches at {dpi} dpi, clear everywhere but the stickers, with '
        f'every sticker at least {g(s["inset_mm"])} mm inside the printable area and {g(gap)} mm from the next, '
        'and as many of them as will go. Where turning some on their side gets more on, some are turned.</p>',
        f'    <p>A size is how tall a sticker is, in squares of a {g(s["grid_mm"])} mm dot grid: {sized}. Every '
        'sticker in one face and one size is the same height with its word the same size, whichever sheet it '
        'comes off, so a Monday off the week&rsquo;s sheet matches a Monday off a sheet of Mondays. The '
        'week&rsquo;s sheet and the year&rsquo;s hold as many whole weeks or years as fit, then as many more days '
        'or months as will go in the gaps, and every sheet says underneath it what is on it.</p>',
        f'    <p>To print one, open the saved sheet in the {esc(p["app"])} app: start a canvas, choose Uploads and '
        'pick the sheet, and skip the background removal, because there is no background to remove. The app puts '
        f'a border round everything it cuts, which you can turn down in its cutting mode; the stickers are '
        f'{g(gap)} mm apart, so if two ever come out as one, turn the border down. Uploads picks from your '
        'phone&rsquo;s photos, so a sheet saved on a phone, which goes to its downloads, wants saving into your '
        'photos from there first.</p>',
        f'    <div class="onb-stk" data-stickers data-paper="{g(pmm[0])} {g(pmm[1])}" '
        f'data-printable="{g(pr[0])} {g(pr[1])}" data-dpi="{dpi}" data-inset="{g(s["inset_mm"])}" '
        f'data-gap="{g(gap)}" data-pad="{g(lab["pad"])}" data-vpad="{g(lab["vpad"])}" '
        f'data-round="{g(lab["round"])}" data-days="{" ".join(s["days"])}" '
        f'data-months="{" ".join(s["months"])}" hidden>',
        '      <div class="onb-stk__controls">',
        '        <div>',
        '          <label class="onb-stk__lab" for="onb-stk-face">Face</label>',
        '          <select id="onb-stk-face" class="onb-stk__face" data-stk-face>']
    own = [f for f in faces if (where.get(f[0]) or {}).get("page") == PAGE.name]
    rest = [f for f in faces if f not in own]
    for label, group in (("This notebook&rsquo;s own", own), ("Every other face on the street", rest)):
        out.append(f'            <optgroup label="{label}">')
        for slug, rec, w in group:
            sel = " selected" if slug == opens["face"] else ""
            out.append(f'              <option value="{slug}" data-family="{attr(rec["family"])}" '
                       f'data-weight="{w}" data-by="{attr(rec["designer"])}" '
                       f'data-licence="{attr(rec["licence"])}" data-licence-url="{attr(rec["licence_url"])}"'
                       f'{sel}>{esc(rec["family"])}</option>')
        out.append('            </optgroup>')
    out += ['          </select>',
            '        </div>',
            '        <div role="group" aria-labelledby="onb-stk-size">',
            '          <p class="onb-stk__lab" id="onb-stk-size">Size</p>',
            '          <p class="onb-stk__picks">']
    for key, name, sq, mm in sizes:
        out.append(f'            <button type="button" class="onb-stk__pick" data-stk-size="{key}" '
                   f'data-mm="{g(mm)}" aria-pressed="{"true" if key == opens["size"] else "false"}">{esc(name)} '
                   f'<small>{g(mm)} mm tall</small></button>')
    out += ['          </p>',
            '        </div>',
            '        <div role="group" aria-labelledby="onb-stk-sheet">',
            '          <p class="onb-stk__lab" id="onb-stk-sheet">On the sheet</p>',
            '          <p class="onb-stk__picks">']
    under = {"week": f'{s["days"][0]} to {s["days"][-1]}',
             "days": f'{NUMBER[many["days"]]} sheets',
             "year": f'{s["months"][0]} to {s["months"][-1]}',
             "months": f'{NUMBER[many["months"]]} sheets'}
    for sh in s["sheets"]:
        out.append(f'            <button type="button" class="onb-stk__pick" data-stk-sheet="{sh["key"]}" '
                   f'aria-pressed="{"true" if sh["key"] == opens["sheet"] else "false"}">{esc(sh["name"])} '
                   f'<small>{under[sh["key"]]}</small></button>')
    first = next(r for slug, r, _ in faces if slug == opens["face"])
    out += ['          </p>',
            '        </div>',
            '      </div>',
            f'      <p class="onb-stk__credit" data-stk-credit>Set in <b>{esc(first["family"])}</b>, by '
            f'{esc(first["designer"])}, under the <a href="{attr(first["licence_url"])}">'
            f'{esc(first["licence"])}</a>.</p>',
            '      <p class="onb-stk__said" data-stk-said role="status"></p>',
            '      <ul class="onb-stk__sheets" data-stk-sheets aria-label="The sheets, as they will print"></ul>',
            '      <p class="onb-stk__all" data-stk-all-row hidden><button type="button" class="onb-stk__save" '
            'data-stk-all>Save every sheet</button></p>',
            '    </div>',
            '    <p class="onb-stk__off" data-stk-off>The drawer draws its sheets in your browser with a '
            'script, and scripts are not running here, so there is nothing to show. Everything it would draw '
            'with is in the sentences above.</p>']
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
    # The face picker's names are their designers' faces, not our sentences.
    sweep(re.sub(r"<select\b.*?</select>", " ", body, flags=re.S), PAGE.name)
    # NOWHERE TO WRITE. The job marker's answer box is the guild's furniture
    # and is cut out above; anything else that takes words is a notebook of
    # ours keeping somebody's. The sticker drawer's face picker is the one
    # select, and it chooses from a list rather than taking a word.
    for name, tag in (("a form", r"<form\b"), ("an input", r"<input\b"), ("a textarea", r"<textarea\b"),
                      ("something editable", r"contenteditable")):
        if re.search(tag, body, re.I):
            refuse(f"the room has {name} in it. There is nowhere to write in here, on purpose: "
                   "the questions are for somebody's own paper.")
    drawer = re.search(r"<!-- onb:stickers:begin -->(.*?)<!-- onb:stickers:end -->", src, re.S)
    if not drawer:
        refuse("the-open-notebook.html has lost its onb:stickers markers.")
    else:
        outside = body.replace(drawer.group(1), " ")
        if re.search(r"<select\b", outside, re.I):
            refuse("the room has a select outside the sticker drawer. The drawer's face picker is the "
                   "one list in here, and it chooses a typeface, not anybody's words.")
        if len(re.findall(r"<select\b", drawer.group(1))) != 1:
            refuse("the sticker drawer has more than its one face picker in it.")
    scripts = re.findall(r'<script src="([^"]+)"', src)
    if sorted(scripts) != sorted(SCRIPTS):
        refuse(f"the room loads {scripts}. It loads {', '.join(SCRIPTS)} and nothing else: a script "
               "of its own beyond the sticker drawer's would be the first thing in here that could "
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
    check_stickers(d.get("stickers"))
    if problems:
        print("REFUSING:\n  " + "\n  ".join(problems))
        sys.exit(1)
    swap(PAGE, "onb:day", day_svg(), "")
    swap(PAGE, "onb:questions", questions(d["questions"]), "")
    swap(PAGE, "onb:laptop", laptop(), "")
    swap(PAGE, "onb:collection", collection(d), "")
    swap(PAGE, "onb:month", month(r), "")
    swap(PAGE, "onb:stickers", stickers_block(d["stickers"]), "")
    swap(NOTES, "notebook-credits", liner_videos(d), "      ")
    swap(NOTES, "notebook-month-credits", liner_month(r), "      ")
    sweep_page()
    if problems:
        print("REFUSING (the page as written):\n  " + "\n  ".join(problems))
        sys.exit(1)
    print("the open notebook: the day, the questions, the laptop, the collection, the "
          "monthly log and the sticker drawer written")


if __name__ == "__main__":
    main()
