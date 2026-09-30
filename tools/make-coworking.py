#!/usr/bin/env python3
"""Build Cavendish Coworking's doors from data/coworking.json.

A house on the street after Henry Cavendish's in Bedford Square, with a shut and
unlocked door onto each of our calls:
the Operations and Editorial meetings, which are open to the world, and the
room our events meet in. Ryan's brief, 2026-09-25: those meetings have been
held in our Discord, and many people refuse to use Discord.

EVERY WORD ON A DOOR IS OUR EVENTS PAGE'S, AND THIS TOOL READS THAT PAGE. The
taglines, the descriptions and every time are copied word for word from
https://stimpunks.org/events/, and when the Knowledge System mirror is on this
machine each one is looked for in the mirror's copy of that page and refused if
it has gone. A door that went on saying Tuesday after the meeting moved to
Wednesday would be the worst kind of wrong on this street: a claim about WHEN,
made before the press, which is the one thing every press-to-play control here
exists to get right. When the events page changes, the fix is to re-copy the
line, never to delete this check.

THE DOORS ARE IN THE EVENTS PAGE'S OWN ORDER, events before meetings, and the
tool refuses a data file that has re-sorted them -- the Jungle Room's rule about
somebody else's running order, where the somebody else is us.

EVERY DOOR OPENS ONTO A ROOM OF ITS OWN NOW, AND THIS TOOL WRITES THEM TOO.
Ryan's brief, 2026-09-28: Proton goes, and each door at Cavendish opens onto a
room with a call in it, through 8x8's Jitsi as a Service. A door with a `page`
in the data is one of those rooms, and this tool writes that room's generated
parts from the same data the door is built from (its words, its light list or
norms, its call panel, its credits), so the door and the room behind it cannot
say two different things. Each room dresses those parts in its own section of
love.css, under its own class prefix; only the markup's shape is shared, the
job marker's rule. Every door has a `page`, and a door without one is refused:
until 2026-09-28 each opened a Proton Meet room, and that fallback is gone.
Events, Operations and Editorial are PUBLIC calls and the suites are the CB's,
and which is which is read out of PUBLIC_CALLS in netlify/cb/lib.mjs, never
restated here: a room that said it was open while the server refused its
guests would be a door that looks like it worked.

IT ALSO REFUSES:
  · a door with no room behind it, or a room that does not exist, or whose
    call the server would refuse its guests (or hand to anybody, for a suite);
  · a slot with no time said in words, or no days, or a start that is not a
    clock time -- the page works out the visitor's own hour from these, and the
    words are what a page with no script shows;
  · Proton Meet anywhere on this page or on a room behind a door. It was the
    call behind every door until 2026-09-28, and a stale link to it is the
    friendly edit that will arrive from somebody reading an old copy;
  · the events page's own closing line, that the meetings are open to Discord
    members and the Discord is where to get the links. It was true until this
    room existed, and it is the friendly edit that will arrive: somebody copying
    the rest of the section helpfully copies that sentence too;
  · anything in coworking.js that stores, sends or listens. It reads the
    visitor's clock and time zone to write the hour underneath, which is a thing
    this room has to say out loud and has to keep small;
  · a hang suite that is not a real door into the room it names, that says
    nothing about how things go in there, or that has hours -- a suite with
    hours is a meeting -- and the suites without David Thornburg's name on the
    page, because caves, campfires and watering holes are his;
  · a count of who went through a door, in the room's own voice, with
    make-guild.py's negation window so the room can say it keeps none;
  · openness as being on show -- an open plan, doors propped wide, glass all
    the way along -- in the room's own voice. Ryan's correction, 2026-09-25:
    transparency does not mean an open floor plan and always-open doors. The
    room is Henry Cavendish's house now: every door shut, every door saying what
    is behind it and when, and none of them locked.
"""
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data/coworking.json"
PAGE = ROOT / "cavendish-coworking.html"
SCRIPT = ROOT / "coworking.js"
MIRROR = Path.home() / "Documents/Claude/Projects/Stimpunks Knowledge System/site/stimpunks.org"
EVENTS = MIRROR / "pages/events.md"

LIB = ROOT / "netlify/cb/lib.mjs"
_pub = re.search(r"export const PUBLIC_CALLS = \[(.*?)\];", LIB.read_text(), re.S)
if not _pub:
    raise SystemExit("REFUSING: netlify/cb/lib.mjs has no PUBLIC_CALLS array, so this tool cannot tell "
                     "which rooms are open to the world. Put it back rather than restating it here.")
PUBLIC = set(re.findall(r"'([a-z0-9-]+)'", _pub.group(1)))
PROTON = re.compile(r"meet\.proton\.me", re.I)
CLOCK = re.compile(r"^(?:[01]\d|2[0-3]):[0-5]\d$")
SAID_TIME = re.compile(r"\d\s*(?::\d\d)?\s*(?:AM|PM)", re.I)
DAYNAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

MEMBERS = re.compile(
    r"open to (?:the )?(?:Stimpunks )?Discord (?:community )?members|members[- ]only|"
    r"Join the Discord to get (?:the )?(?:meeting )?links", re.I)
SENDS = re.compile(
    r"localStorage|sessionStorage|indexedDB|document\.cookie|\bfetch\s*\(|XMLHttpRequest|"
    r"sendBeacon|WebSocket|EventSource|getUserMedia|navigator\.geolocation")
# Ryan's correction, 2026-09-25, the afternoon the room opened: TRANSPARENCY
# DOES NOT MEAN AN OPEN FLOOR PLAN AND ALWAYS-OPEN DOORS. The first version was a
# glass office with every door propped wide, and it read openness as being on
# show. It is refused in the room's own voice, with the negation window, so the
# room can still say it has no open plan.
ON_SHOW = re.compile(
    r"\b(open[- ]plan|propped (?:wide )?open|always[- ]open|doors? (?:standing |left )?wide open|"
    r"glass all the way along|nothing to hide)\b", re.I)
TALLY = re.compile(
    r"\b(attendance|attendees|headcount|visitors?|visits|check-?ins?|"
    r"(?:people|folks|times) (?:went|have gone|came) through)\b", re.I)
NEGATED = re.compile(r"\b(not|no|nothing|never|nor|without|keeps none)\b[^.;:]*$", re.I)

problems = []


def refuse(msg):
    problems.append(msg)


def e(s):
    return html.escape(s, quote=True)


def norm(s):
    s = html.unescape(re.sub(r"<[^>]+>|\*+|\[|\]\([^)]*\)", " ", s))
    s = s.replace("’", "'").replace("‘", "'").replace("“", '"').replace("”", '"')
    return re.sub(r"\s+", " ", s).strip()


def swap(src, marker, block):
    begin, end = f"<!-- {marker}:begin -->", f"<!-- {marker}:end -->"
    if begin not in src or end not in src:
        raise SystemExit(
            f"REFUSING: {PAGE.name} has no {marker} markers, so there is nowhere to write.\n"
            "Put them back rather than letting this tool go quiet.")
    return re.sub(re.escape(begin) + r".*?" + re.escape(end),
                  lambda m: begin + "\n" + block + "\n" + end, src, flags=re.S)


def room_check(d, where, public):
    """A door opens a room of its own (`page`), and nothing else."""
    if not d.get("page"):
        refuse(f"{where}: no `page`. Every door opens onto a room of its own; build the room "
               "before the door, rather than pointing the door somewhere else.")
    if d.get("url") or d.get("proton_name"):
        refuse(f"{where}: a `url` or `proton_name`. Proton has gone from these doors; take them out.")
    for f in ("room", "prefix", "item"):
        if not str(d.get(f, "")).strip():
            refuse(f"{where}: a door with a page needs its `{f}`.")
    tag = d["page"][:-5] if d["page"].endswith(".html") else ""
    if not (ROOT / d["page"]).exists():
        refuse(f"{where}: {d['page']} does not exist.")
    if public and tag not in PUBLIC:
        refuse(f"{where}: {tag} is a meeting that is open to the world, and it is not in "
               "PUBLIC_CALLS in netlify/cb/lib.mjs, so its guests would be refused a call.")
    if not public and tag in PUBLIC:
        refuse(f"{where}: {tag} is a hang suite, for people signed on to the CB, and "
               "PUBLIC_CALLS in netlify/cb/lib.mjs would give anybody a call there.")


data = json.loads(DATA.read_text())
doors = data["doors"]
mirror = norm(EVENTS.read_text()) if EVENTS.exists() else None

ids = set()
for d in doors:
    where = f"door {d.get('id')!r}"
    if d["id"] in ids:
        refuse(f"{where}: two doors with one id.")
    ids.add(d["id"])
    room_check(d, where, public=True)
    for field in ("name", "tagline", "said", "anchor"):
        if not str(d.get(field, "")).strip():
            refuse(f"{where}: no {field}.")
    if not d.get("slots"):
        refuse(f"{where}: no slots. A door says when its room is in use before you open it.")
    for s in d.get("slots", []):
        w = f"{where}, {s.get('what')!r}"
        if not s.get("days") or not all(isinstance(x, int) and 0 <= x <= 6 for x in s["days"]):
            refuse(f"{w}: days must be a list of 0-6, Sunday first.")
        if not CLOCK.match(s.get("start", "")) or ("end" in s and not CLOCK.match(s["end"])):
            refuse(f"{w}: start and end must be clock times like 10:00.")
        if not SAID_TIME.search(s.get("said", "")):
            refuse(f"{w}: `said` does not say a time in words. It is what a page with no "
                   "script shows, so it has to carry the hour on its own.")
    if mirror is not None:
        lines = [d["tagline"], d["said"]] + [x for s in d.get("slots", [])
                                             for x in (s.get("tagline"), s.get("said")) if x]
        for line in lines:
            if norm(line) not in mirror:
                refuse(f"{where}: {line[:70]!r} is no longer on our events page, word for "
                       "word. Re-copy it from the page; do not keep a line the page has dropped.")

if mirror is not None:
    at = [mirror.find(norm(d["said"])) for d in doors]
    if all(a >= 0 for a in at) and at != sorted(at):
        refuse("the doors are not in the events page's own order. That order is the page's "
               "and not this room's to re-sort.")
else:
    print("coworking: the Knowledge System mirror is not on this machine, so the doors' "
          "words were NOT re-checked against the events page this run.")

# THE HANG SUITES. Ryan's words, as he gave them, so nothing here re-checks them
# against a page; what is checked is that each one is a real door into the room
# it says, that it says how things go in there before you knock, and that it
# has no hours, because a suite with hours is a meeting and belongs up there.
suites = data.get("suites", [])
for x in suites:
    where = f"suite {x.get('id')!r}"
    if x["id"] in ids:
        refuse(f"{where}: an id a door already has.")
    ids.add(x["id"])
    room_check(x, where, public=False)
    if not x.get("norms") or not str(x.get("norms_title", "")).strip():
        refuse(f"{where}: no norms. A suite says how things go in there before you knock, "
               "which is what a meeting's time does on its door.")
    if x.get("slots") or x.get("start"):
        refuse(f"{where}: a suite with hours is a meeting. Put it with the doors, with its "
               "times off our events page, or take the hours off.")
    lk = x.get("link")
    if lk and lk["text"] not in x.get("said", ""):
        refuse(f"{where}: the link text {lk['text']!r} is not in what the suite says.")

# The data is refused before anything is built from it: a door with a field
# missing would otherwise stop this tool with a traceback instead of a reason.
if problems:
    raise SystemExit("REFUSING:\n  " + "\n  ".join(problems))


# ── Writing ──────────────────────────────────────────────────────────────────

def slot(s):
    what = e(s["what"])
    if s.get("link"):
        what = f'<a href="{e(s["link"])}">{what}</a>'
    tag = f' <span class="cw-slot__tag">{e(s["tagline"])}</span>' if s.get("tagline") else ""
    end = f' data-end="{s["end"]}"' if s.get("end") else ""
    days = " ".join(str(x) for x in s["days"])
    return (f'          <li class="cw-slot" data-days="{days}" data-start="{s["start"]}"{end}>'
            f'<span class="cw-slot__what">{what}</span>{tag}'
            f'<span class="cw-slot__said">{e(s["said"])}</span>'
            f'<span class="cw-slot__local" data-local hidden></span></li>')


def opening(d, name):
    return [f'        <a class="cw-open" href="{e(d["page"])}">Go through the {name} door<span aria-hidden="true"> &rarr;</span></a>',
            f'        <p class="cw-open__off">Into {e(d["room"])}: what goes on in there, and its call.</p>']


def door(d):
    # A Coade stone case with its fanlight, a mahogany leaf, a brass plate with the
    # room's name, and a note pinned to it. THE DOOR IS SHUT AND THE LINK IS THE
    # HANDLE: nothing is shown propped open, because transparency here is being
    # able to read what is behind a door and when, not every door standing wide.
    i, name = d["id"], e(d["name"])
    return "\n".join([
        f'    <article class="cw-door" id="door-{i}" aria-labelledby="cw-{i}-h">',
        f'      <div class="cw-door__fan" aria-hidden="true"></div>',
        f'      <div class="cw-door__leaf">',
        f'        <h2 class="cw-door__name" id="cw-{i}-h">{name}</h2>',
        f'        <div class="cw-door__note">',
        f'          <p class="cw-door__tag">{e(d["tagline"])}</p>',
        f'          <p class="cw-door__said">{e(d["said"])}</p>',
        f'          <ul class="cw-when" data-tz="{e(data["tz"])}">',
        *["  " + slot(s) for s in d["slots"]],
        f'          </ul>',
        f'          <p class="cw-door__from">In the words of <a href="{e(data["page"])}{e(d["anchor"])}">our events page</a>.</p>',
        f'        </div>',
        *opening(d, name),
        f'      </div>',
        f'    </article>',
    ])


def suite(x):
    i, name = x["id"], e(x["name"])
    said = e(x["said"])
    if x.get("link"):
        t = e(x["link"]["text"])
        said = said.replace(t, f'<a href="{e(x["link"]["href"])}">{t}</a>', 1)
    further = ""
    if x.get("further"):
        further = (f'          <p class="cw-door__from">Read more: <a href="{e(x["further"]["href"])}">'
                   f'{e(x["further"]["text"])}</a>.</p>')
    return "\n".join([l for l in [
        f'    <article class="cw-door cw-door--suite" id="suite-{i}" aria-labelledby="cw-{i}-h">',
        f'      <div class="cw-door__fan" aria-hidden="true"></div>',
        f'      <div class="cw-door__leaf">',
        f'        <h3 class="cw-door__name" id="cw-{i}-h">{name}</h3>',
        f'        <div class="cw-door__note">',
        f'          <p class="cw-door__said">{said}</p>',
        f'          <p class="cw-norms__title">{e(x["norms_title"])}</p>',
        f'          <ul class="cw-norms">',
        *[f'            <li>{e(n)}</li>' for n in x["norms"]],
        f'          </ul>',
        further,
        f'        </div>',
        *opening(x, name),
        f'      </div>',
        f'    </article>',
    ] if l])


src = PAGE.read_text()
if suites:
    src = swap(src, "cw-suites-intro", f'    <p class="cw-lede">{e(data["suites_intro"])}</p>')
    src = swap(src, "cw-suites", "\n".join(suite(x) for x in suites))
note = data.get("access_note")
if note:
    src = swap(src, "cw-access", f'    <h2>{e(note["title"])}</h2>\n    <p class="cw-access">{e(note["said"])}</p>')
src = swap(src, "cw-doors", "\n".join(door(d) for d in doors))
credits = (
    f'    <p><strong>Every line on a door is our events page&rsquo;s</strong>, word for word: '
    f'each room&rsquo;s own line, what it is for, and every day and time, read off '
    f'<a href="{e(data["page"])}">stimpunks.org/events</a> on {e(data["measured"])}. '
    f'<code>tools/make-coworking.py</code> reads that page again every time it builds the doors '
    f'and refuses a line that has gone from it, a door with no room behind it, and a door '
    f'in a different order from the page. The hour on your '
    f'own clock underneath is worked out in your browser and is ours.</p>')
src = swap(src, "cw-credits", credits)

# Reading back what was written, so the sweeps see the published page.
bare = re.sub(r"<!--.*?-->", " ", src, flags=re.S)
if PROTON.search(bare):
    refuse("Proton Meet is on the page. Every door opens onto a room of ours now.")
m = MEMBERS.search(norm(bare))
if m:
    refuse(f"the page says {m.group(0)!r}. These meetings are open to the world now; that "
           "sentence is the events page's, from before this room, and must not be copied in.")
ours = re.sub(r"<blockquote\b.*?</blockquote>|<(script|style|svg)\b.*?</\1>", " ", bare, flags=re.S)
ours = html.unescape(re.sub(r"<[^>]+>", " ", ours))
for m in ON_SHOW.finditer(ours):
    window = ours[max(0, m.start() - 48):m.end()]
    if not NEGATED.search(window):
        refuse(f"the room says {m.group(0)!r} and is not refusing it. Open here means you can "
               "read what is behind a door and when, and nothing is locked; it does not mean "
               "every door propped wide or everybody on show.")
for m in TALLY.finditer(ours):
    window = ours[max(0, m.start() - 48):m.end()]
    if not NEGATED.search(window):
        refuse(f"the room says {m.group(0)!r} and is not refusing it. Nothing in here counts "
               "who went through a door.")
if suites and "David Thornburg" not in norm(bare):
    refuse("the Hang Suites are caves, campfires and watering holes, and the room no longer "
           "names David Thornburg. The three zones are his and are named as his.")
js = SCRIPT.read_text() if SCRIPT.exists() else ""
if not js:
    refuse("coworking.js is missing; the page loads it.")
for m in SENDS.finditer(re.sub(r"//[^\n]*|/\*.*?\*/", " ", js, flags=re.S)):
    refuse(f"coworking.js uses {m.group(0)!r}. It reads the visitor's clock to write one line "
           "and does nothing else: nothing stored, nothing sent, nothing listened to.")

if problems:
    raise SystemExit("REFUSING:\n  " + "\n  ".join(problems))

PAGE.write_text(src)


# ── The rooms behind the doors ───────────────────────────────────────────────

def room_slot(p, s, item):
    what = e(s["what"])
    if s.get("link"):
        what = f'<a href="{e(s["link"])}">{what}</a>'
    end = f' data-end="{s["end"]}"' if s.get("end") else ""
    days = " ".join(str(x) for x in s["days"])
    c = f"{p}-{item}"
    tag = f'<p class="{c}__tag">{e(s["tagline"])}</p>' if s.get("tagline") else ""
    return (f'      <li class="{c}" data-days="{days}" data-start="{s["start"]}"{end}>'
            f'<p class="{c}__name">{what}</p>{tag}'
            f'<p class="{c}__char">{e(s["said"])}</p>'
            f'<p class="{c}__local" data-local hidden></p></li>')


def room_call(p, d, tag, public):
    """The call panel. Its parts are found by callroom.js by their data-
    attributes, and every part that needs a script ships hidden."""
    room = e(d["room"])
    if public:
        lines = [
            f'    <div class="{p}-call" data-call="{tag}" data-call-name="{room}" data-call-public>',
            f'      <p>This call is open to anybody. Type the name you want to be called, and knock: you wait in the lobby until a moderator lets you in. Everybody who is not a moderator knocks, signed on to the CB or not, and the moderators are the base station, who are in here at the times on the list above. Between those times there may be nobody to open the door. Once you are in, the name you typed is shown to people signed on to the CB who have chosen to be seen in this room, as somebody in its call, until you leave.</p>',
            f'      <form class="{p}-call__knock" data-call-guest hidden>',
            f'        <label for="{p}-call-name">The name you want to be called in the call</label>',
            f'        <div class="{p}-call__row"><input id="{p}-call-name" name="name" maxlength="24" autocomplete="nickname" spellcheck="false"><button type="submit">Knock on the door</button></div>',
            f'      </form>',
        ]
    else:
        lines = [
            f'    <div class="{p}-call" data-call="{tag}" data-call-name="{room}">',
            f'      <p>The call in here is for people signed on to the CB. Anybody can come in and look around; to talk, and to be in the call, you need the CB, and <a href="community-center.html#cb-norms">the Community Center</a> says how to get on it.</p>',
            f'      <p class="{p}-call__cb" data-call-cb hidden>You are not signed on to the CB in this browser. <a href="community-center.html">Sign on at the Community Center</a>, then come back and the way in is here.</p>',
        ]
    lines += [
        f'      <p class="{p}-call__member" data-call-join hidden><button type="button">Join the call as <b data-call-handle></b></button></p>',
        f'      <p class="{p}-call__who" data-call-who hidden></p>',
        f'      <p class="{p}-call__said" role="status" data-call-said></p>',
        f'      <noscript><p>Joining the call needs JavaScript: it opens in a window of its own on this page.</p></noscript>',
    ]
    note = data.get("access_note")
    if note:
        lines.append(f'      <p><strong>{e(note["title"])}.</strong> {e(note["said"])}</p>')
    lines += [
        f'      <p class="{p}-call__fine">The call is run by 8x8&rsquo;s Jitsi as a Service. Your camera and microphone start off, the name you are called by goes to 8x8 inside your pass into the call, and while somebody is in the call we keep their name in it, until they leave. <a href="privacy.html#calls">What goes where.</a></p>',
        f'    </div>',
    ]
    return "\n".join(lines)


EMBED = "https://www.youtube-nocookie.com/embed/"
VID = re.compile(r"^[A-Za-z0-9_-]{11}$")
LIST = re.compile(r"^PL[A-Za-z0-9_-]{16,40}$")
RUNTIME = re.compile(r"^(?:\d{1,2}:)?\d{1,2}:\d{2}$")
LIVE = "live, runs until you close it"


def rack_items(d):
    """A suite's rack, as a list of {id, title, channel, note, runs}. Cams come out of
    the Jungle Room's own data by id, never restated, so the two rooms cannot say two
    different things about one camera; videos carry their own measured runtime."""
    r = d.get("rack") or {}
    where = f"suite {d['id']!r}'s rack"
    items = []
    if r.get("cams_from"):
        src = json.loads((ROOT / r["cams_from"]).read_text())
        cams = {c["id"]: c for g in src.get("groups", []) for c in g.get("cams", [])}
        for cid in r.get("cams", []):
            c = cams.get(cid)
            if not c:
                refuse(f"{where}: {cid!r} is not a cam in {r['cams_from']}.")
                continue
            if c.get("dead") or c.get("frame") == "door":
                refuse(f"{where}: {cid!r} is dark or cannot be framed in {r['cams_from']}; "
                       "a rack shows only cams that play here.")
            if c.get("runtime") or c.get("length"):
                refuse(f"{where}: {cid!r} carries a runtime, and a live camera has none to give.")
            items.append({"id": cid, "title": c["title"], "channel": c["channel"], "note": c.get("note", ""), "runs": LIVE})
    videos = r.get("videos", [])
    if r.get("videos_from"):
        # Another room's list, read by key, when that room owns the selection: the
        # Campfire's fires are the fire pit's at Swaying Sweetgrass, which keeps
        # them as `length`. Never both a list here and one read from there.
        if videos:
            refuse(f"{where}: it has videos of its own and reads them from {r['videos_from'][0]} too.")
        path, *keys = r["videos_from"]
        src = json.loads((ROOT / path).read_text())
        for k in keys:
            src = (src or {}).get(k)
        if not isinstance(src, list):
            refuse(f"{where}: {path} has no list under {' > '.join(keys)}.")
            src = []
        videos = [{**v, "runtime": v.get("runtime") or v.get("length", "")} for v in src]
    for v in videos:
        w = f"{where}, {v.get('title')!r}"
        if not VID.match(v.get("id", "")):
            refuse(f"{w}: {v.get('id')!r} is not a YouTube id.")
        if not RUNTIME.match(v.get("runtime", "")):
            refuse(f"{w}: no runtime. Every press here says how long before the press.")
        for f in ("title", "channel", "note", "measured"):
            if not str(v.get(f, "")).strip():
                refuse(f"{w}: no `{f}`.")
        items.append({"id": v["id"], "title": v["title"], "channel": v["channel"], "note": v["note"], "runs": v["runtime"]})
    if r and not items:
        refuse(f"{where}: nothing on it.")
    return items


def rack_block(p, d, items):
    """The screen and the rack under it, for rack.js: the screen's plate is the
    rack's first thing, or a whole playlist when the rack names one."""
    r = d["rack"]
    scr = e(r["screen"])
    lst = r.get("playlist")
    if r.get("playlist_from"):
        # Another room's playlist, read out of that room's own data by key, so the
        # two rooms cannot disagree about which list it is or what it is called.
        path, key = r["playlist_from"]
        src = json.loads((ROOT / path).read_text()).get(key) or {}
        m = re.search(r"[?&]list=([A-Za-z0-9_-]+)", src.get("playlist", ""))
        if not m:
            refuse(f"suite {d['id']!r}: {path} has no playlist under {key!r}.")
        lst = {"id": m.group(1) if m else "", "title": src.get("title", "")}
    if lst:
        if not LIST.match(lst.get("id", "")):
            refuse(f"suite {d['id']!r}: the playlist {lst.get('id')!r} is not a playlist id.")
        if lst.get("runtime"):
            refuse(f"suite {d['id']!r}: the playlist has a runtime. A list somebody keeps adding to has none.")
        plate_src, plate_title = f"{EMBED}videoseries?list={lst['id']}&autoplay=1", f"{lst['title']}, on YouTube"
        plate_label, back_label = f"Put on the whole playlist &mdash; runs until you stop it", "Put the whole playlist back on the screen"
    else:
        first = items[0]
        plate_src, plate_title = f"{EMBED}{first['id']}?autoplay=1&rel=0", f"{first['title']}, {first['channel']}"
        plate_label, back_label = f"Watch {e(first['title'])} &mdash; {e(first['runs'])}", f"Put {e(first['title'])} back on the screen"
    out = [
        f'    <div class="{p}-screen" data-rack-screen="{p}" data-rack-off="{e(r["off"])}">',
        f'      <button type="button" class="facade" data-embed-src="{e(plate_src)}" data-embed-title="{e(plate_title)}">',
        f'        {plate_label}',
        f'        <span class="facade__play">&#9654; PRESS PLAY</span>',
        f'      </button>',
        f'    </div>',
        f'    <p class="{p}-screen__now" data-rack-now="{p}" tabindex="-1" hidden></p>',
        f'    <p class="{p}-screen__back" hidden><button type="button" class="{p}-back" data-rack-back="{p}">{back_label}</button></p>',
        f'    <details class="{p}-rack" open>',
        f'      <summary>{e(r["rack_title"])}</summary>',
        f'      <ul class="{p}-cards">',
    ]
    for it in items:
        src = f"{EMBED}{it['id']}?autoplay=1&rel=0"
        who = f"{it['title']}, {it['channel']}"
        out += [
            f'        <li class="{p}-card" data-rack-card>',
            f'          <h3 class="{p}-card__title">{e(it["title"])}</h3>',
            f'          <p class="{p}-card__who">{e(it["channel"])}, on YouTube</p>',
            f'          <p class="{p}-card__note">{e(it["note"])}</p>',
            f'          <button type="button" class="facade" data-embed-src="{e(src)}" data-embed-title="{e(who)}">',
            f'            Watch it here &mdash; {e(it["runs"])}',
            f'            <span class="facade__play">&#9654; PRESS PLAY</span>',
            f'          </button>',
            f'          <button type="button" class="{p}-card__big" hidden data-rack-to="{p}" data-rack-name="{scr}" '
            f'data-rack-src="{e(src)}" data-rack-title="{e(who)}, on {scr}" data-rack-film="{e(it["title"])}" '
            f'data-rack-runtime="{e(it["runs"])}">Put it on {scr} &mdash; {e(it["runs"])}</button>',
            f'        </li>',
        ]
    out += [f'      </ul>', f'    </details>']
    return "\n".join(out)


def write_room(d, public):
    p, tag = d["prefix"], d["page"][:-5]
    page = ROOT / d["page"]
    s = page.read_text()
    here = f"door-{d['id']}" if public else f"suite-{d['id']}"
    if f'href="cavendish-coworking.html#{here}"' not in s:
        refuse(f"{d['page']}: it has no way back through its own door, cavendish-coworking.html#{here}.")
    if public:
        s = swapin(s, page, f"{p}-words", f'    <p class="{p}-head__sub">{e(d["tagline"])}</p>')
        s = swapin(s, page, f"{p}-lede", f'  <p class="lede">{e(d["said"])}</p>')
        s = swapin(s, page, f"{p}-list", "\n".join(
            [f'    <ol class="{p}-list" data-tz="{e(data["tz"])}">'] + [room_slot(p, x, d.get("item", "slot")) for x in d["slots"]] + ['    </ol>']))
    if not public:
        said = e(d["said"])
        if d.get("link"):
            t = e(d["link"]["text"])
            said = said.replace(t, f'<a href="{e(d["link"]["href"])}">{t}</a>', 1)
        s = swapin(s, page, f"{p}-lede", f'  <p class="lede">{said}</p>')
        s = swapin(s, page, f"{p}-norms", "\n".join(
            [f'    <p class="{p}-norms__title">{e(d["norms_title"])}</p>', f'    <ul class="{p}-norms">']
            + [f'      <li>{e(n)}</li>' for n in d["norms"]] + ['    </ul>']
            + ([f'    <p>Read more: <a href="{e(d["further"]["href"])}">{e(d["further"]["text"])}</a>.</p>'] if d.get("further") else [])))
        if d.get("rack"):
            items = rack_items(d)
            if items:
                s = swapin(s, page, f"{p}-rack", rack_block(p, d, items))
            for js in ("love-embed.js", "rack.js"):
                if f'<script src="{js}" defer></script>' not in s:
                    refuse(f"{d['page']}: it has a rack and does not load {js}.")
    s = swapin(s, page, f"{p}-call", room_call(p, d, tag, public))
    s = swapin(s, page, f"{p}-credits", (
        f'    <p>Every line about when is our events page&rsquo;s, word for word, read off '
        f'<a href="{e(data["page"])}{e(d.get("anchor", ""))}">stimpunks.org/events</a> on {e(data["measured"])}, '
        f'and <code>tools/make-coworking.py</code> reads that page again every time it builds this room and its door. '
        f'The hour on your own clock is worked out in your browser.</p>') if public else (
        f'    <p>What goes on in here, and the norms, are Ryan&rsquo;s words, as he wrote them for the Hang Suites; '
        f'caves, campfires and watering holes are <a href="https://stimpunks.org/glossary/caves-campfires-watering-holes/">David Thornburg&rsquo;s</a>.</p>'))
    m = re.search(r'data-call="([^"]+)"', s)
    if not m or m.group(1) != tag:
        refuse(f"{d['page']}: its call panel names {m.group(1) if m else 'no room'!r}, not {tag!r}.")
    if PROTON.search(re.sub(r"<!--.*?-->", " ", s, flags=re.S)):
        refuse(f"{d['page']}: Proton Meet is on the page. The rooms behind the doors use the street's own calls.")
    return page, s


def swapin(src, page, marker, block):
    begin, end = f"<!-- {marker}:begin -->", f"<!-- {marker}:end -->"
    if begin not in src or end not in src:
        refuse(f"{page.name}: no {marker} markers, so there is nowhere to write.")
        return src
    return re.sub(re.escape(begin) + r".*?" + re.escape(end),
                  lambda m: begin + "\n" + block + "\n" + end, src, flags=re.S)


built = [write_room(d, True) for d in doors if d.get("page")] + \
        [write_room(x, False) for x in suites if x.get("page")]
if problems:
    raise SystemExit("REFUSING:\n  " + "\n  ".join(problems))
for page, text in built:
    page.write_text(text)
print(f"coworking: {len(built)} room(s) behind the doors written" if built else "coworking: no rooms behind the doors yet")

slots = sum(len(d["slots"]) for d in doors)
print(f"coworking: {len(doors)} doors, {slots} times and {len(suites)} hang suites written into {PAGE.name}"
      + ("; every line re-read against the events page." if mirror is not None else "."))
