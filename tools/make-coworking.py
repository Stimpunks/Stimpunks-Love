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

IT ALSO REFUSES:
  · a door whose link is not a Proton Meet join link WITH its password. These
    meetings are open, so the password is not a secret; without it the door
    opens onto a locked room, which is a door that looks like it worked;
  · a door with no measured `proton_name`, the name Proton's own guest page
    gave the room when somebody opened it, because a door labelled Editorial
    that opens the Operations call is the jukebox's guessed mapping again;
  · a slot with no time said in words, or no days, or a start that is not a
    clock time -- the page works out the visitor's own hour from these, and the
    words are what a page with no script shows;
  · Proton Meet framed anywhere on the page. The call is behind the door
    because Proton's frame-ancestors only lets Proton's own apps frame it
    (measured 2026-09-25), and a frame dressed as a room would be a blank box;
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

DOOR = re.compile(r"^https://meet\.proton\.me/join/id-[A-Za-z0-9]+#pwd-[A-Za-z0-9]+$")
CLOCK = re.compile(r"^(?:[01]\d|2[0-3]):[0-5]\d$")
SAID_TIME = re.compile(r"\d\s*(?::\d\d)?\s*(?:AM|PM)", re.I)
DAYNAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

MEMBERS = re.compile(
    r"open to (?:the )?(?:Stimpunks )?Discord (?:community )?members|members[- ]only|"
    r"Join the Discord to get (?:the )?(?:meeting )?links", re.I)
FRAME = re.compile(r"<iframe[^>]*proton|data-embed-src=\"[^\"]*proton", re.I)
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


data = json.loads(DATA.read_text())
doors = data["doors"]
mirror = norm(EVENTS.read_text()) if EVENTS.exists() else None

ids = set()
for d in doors:
    where = f"door {d.get('id')!r}"
    if d["id"] in ids:
        refuse(f"{where}: two doors with one id.")
    ids.add(d["id"])
    if not DOOR.match(d.get("url", "")):
        refuse(f"{where}: {d.get('url')!r} is not a Proton Meet join link carrying its "
               "#pwd- password. Without the password the door opens onto a locked room.")
    if not d.get("proton_name"):
        refuse(f"{where}: no proton_name. Open the link as far as Proton's guest page and "
               "write down the name it gives the room; a door must not be labelled by guess.")
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
    if not DOOR.match(x.get("url", "")):
        refuse(f"{where}: {x.get('url')!r} is not a Proton Meet join link carrying its #pwd- password.")
    if not x.get("proton_name"):
        refuse(f"{where}: no proton_name. Read it off Proton's guest page; do not guess it.")
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
            f'<span class="cw-slot__local" hidden></span></li>')


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
        f'        <a class="cw-open" href="{e(d["url"])}">Open the {name} door<span aria-hidden="true"> &rarr;</span></a>',
        f'        <p class="cw-open__off">Off site: Proton Meet&rsquo;s guest page for the room named {e(d["proton_name"])}. Nothing reaches Proton until you open it.</p>',
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
        f'        <a class="cw-open" href="{e(x["url"])}">Open the {name} door<span aria-hidden="true"> &rarr;</span></a>',
        f'        <p class="cw-open__off">Off site: Proton Meet&rsquo;s guest page for the room named {e(x["proton_name"])}. Nothing reaches Proton until you open it.</p>',
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
    f'and refuses a line that has gone from it, a door without its room&rsquo;s password, a door '
    f'in a different order from the page, and the call framed inside this one. The hour on your '
    f'own clock underneath is worked out in your browser and is ours.</p>')
src = swap(src, "cw-credits", credits)

# Reading back what was written, so the sweeps see the published page.
bare = re.sub(r"<!--.*?-->", " ", src, flags=re.S)
if FRAME.search(bare):
    refuse("Proton Meet is framed on the page. It is a door, not a window.")
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
slots = sum(len(d["slots"]) for d in doors)
print(f"coworking: {len(doors)} doors, {slots} times and {len(suites)} hang suites written into {PAGE.name}"
      + ("; every line re-read against the events page." if mirror is not None else "."))
