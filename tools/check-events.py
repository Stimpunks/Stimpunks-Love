#!/usr/bin/env python3
"""Hold the CB's events to what privacy.html#events promises.

Ryan's ask and calls, 2026-10-23, after Discord's Scheduled Events: anybody
signed on schedules an event, on World, in a room they can go into, or at a
link off the street; its maker or a moderator changes it or cancels it; anybody
who can see it says they are interested; an event names who is interested and
never how many; and two notifications, each off until switched on. The server
is the Events part of netlify/cb/lib.mjs, /cb/events and the five-minute
cb-events-start; the radio's half is the Events section of cb.js.

WHAT IT REFUSES, and why each one is here:

  · A COUNT in the radio's events code: no "12 Interested", no number beside
    the names. The friendly edit is Discord's count, which is the headcount the
    street refuses, wearing an RSVP; a reaction names who and never how many,
    and so does an event.
  · AN EVENT KEPT WITH ANYTHING MORE than what was typed, its id, its maker,
    the mark and who is interested, and above all A TIME OF WHEN: when it was
    made or changed, or when anybody said they were interested. A list of those
    beside usernames is a record of somebody's days.
  · THE MARK SENT ANYWHERE. authorMark is how a username deleted and claimed
    again is not its old owner; shapeEvent must not spread an event or name
    `by`, and a notification must not carry who is interested.
  · AN EVENT IN A ROOM THAT KEEPS TO ITSELF, or one seen by a pass that may not
    go into its room. An event is listed and announced outside its room, so a
    quiet room's would name its address; and roomAllows() is the one place that
    decides a private room, as it is for listening.
  · FORGET ME OR DELETING THE USERNAME LEAVING EVENTS BEHIND: the events they
    scheduled, and their name on anybody else's list.
  · A NOTIFIER THAT TELLS ITS OWN MAKER about a new event, or tells somebody an
    event started who did not say they were interested.
  · Storage, markup from a string, or a fetch anywhere but /cb/events in the
    radio's events code; a function that logs anything or forgets noindex; no
    scheduled start; and a privacy page or CB guide with no section on events.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LIB = ROOT / "netlify" / "cb" / "lib.mjs"
CB = ROOT / "cb.js"
FUNC = ROOT / "netlify" / "functions" / "cb-events.mjs"
START = ROOT / "netlify" / "functions" / "cb-events-start.mjs"

problems = []


def refuse(msg):
    problems.append(msg)


def uncomment(s):
    return re.sub(r"(?m)^\s*//.*$", "", re.sub(r"/\*.*?\*/", "", s, flags=re.S))


def fn(src, name):
    m = re.search(r"export (?:async )?function " + re.escape(name) + r"\(.*?\n\}", src, re.S)
    if not m:
        refuse(f"lib.mjs has no {name}, which events need.")
        return ""
    return m.group(0)


def keys_of(obj):
    return sorted(set(re.findall(r"(?:[{,]\s*)(\w+)(?=\s*[:,}])", obj)))


def main():
    lib = LIB.read_text()
    if "/* ── Events ─" not in lib:
        raise SystemExit("REFUSING: lib.mjs has no Events part (/* ── Events). Put it back rather than letting this tool go quiet.")
    part = lib[lib.index("/* ── Events ─"):lib.index("/* ── The forums ─")]
    code = uncomment(part)

    # What an event is made of, and nothing about when it was made.
    clean = fn(lib, "cleanEvent")
    m = re.search(r"const ev = (\{[^}]*\});", clean)
    if not m or keys_of(m.group(1)) != ["about", "at", "mins", "repeat", "room", "start", "title", "zone"]:
        refuse(f"cleanEvent keeps {keys_of(m.group(1)) if m else '?'}; an event from what was typed is exactly its title, words, "
               "channel, where in it, start, length, zone and how it repeats (and its link, set after).")
    make = fn(lib, "makeEvent")
    m = re.search(r"const ev = (\{.*?\});", make)
    if not m or keys_of(m.group(1).replace("...c.ev", "")) != ["by", "handle", "id", "keen"]:
        refuse("makeEvent keeps an event with more than what was typed, its id, its maker's handle, the mark and who is interested.")
    if not re.search(r"keen: \[\{ handle: who\.handle, by: mark \}\]", make):
        refuse("makeEvent: an interested person is exactly a handle and the mark.")
    keen = fn(lib, "keenEvent")
    if "{ handle: who.handle, by: mark }" not in keen or "if (!forumReader(who))" not in keen:
        refuse("keenEvent puts more than a claimed username's handle and mark on a list of the interested.")
    for name in ("makeEvent", "editEvent", "keenEvent", "removeEvent", "skipEvent", "cleanEvent"):
        body = fn(lib, name)
        hit = re.search(r"\b(?:t|made|edited|when|at)\s*:\s*now\b|Date\.now\(\)\s*[,}]", body)
        if hit:
            refuse(f"{name} keeps a time of when ({hit.group(0)!r}). An event keeps nothing about when it was made or changed, "
                   "or when anybody said they were interested.")

    shape = fn(lib, "shapeEvent")
    if re.search(r"\bby\s*:|\.\.\.\s*ev\b", shape):
        refuse("shapeEvent sends the mark, or spreads the whole event into an answer. The mark never leaves the server.")
    if re.search(r"keen\.length|count\s*:|\bn\s*:", shape):
        refuse("shapeEvent sends a number of people interested. An event names who, and never how many.")
    sees = fn(lib, "seesEvent")
    if "!quietRoom(ev.room)" not in sees or "roomAllows(who, ev.room)" not in sees or "forumReader(who)" not in sees:
        refuse("seesEvent must ask forumReader, refuse a room that keeps to itself and ask roomAllows for every room.")
    if "quietRoom(room)" not in clean or "roomAllows(who, room)" not in clean:
        refuse("cleanEvent must refuse a room that keeps to itself, and a room its maker may not go into.")
    if "eventsFor" not in lib or not re.search(r"filter\(\(e\) => seesEvent\(who, e\)\)", fn(lib, "eventsFor")):
        refuse("eventsFor sends events without asking seesEvent of each.")
    # Who is in a call, on an event (Ryan's call, 2026-10-29): only on now, only in a call.
    ef = uncomment(fn(lib, "eventsFor"))
    if "inCall(" in ef and not re.search(r"if \(!e\.on \|\| e\.at !== 'call'\) continue;", ef):
        refuse("eventsFor names who is in a call on an event that is not on now, or not in a call. "
               "privacy.html#event-calls holds the names to an event in a call while it is on.")
    tc = re.search(r"Radio\.prototype\.toCall = function.*?\n  \};", CB.read_text(), re.S)
    if not tc or re.search(r"setCall\(|\.click\(\)|loveCall\.open", tc.group(0)):
        refuse("toCall opens a call by itself, or is gone. A #cb=call link is anybody's to write, so arriving "
               "by one puts the keyboard on Join this room's call and presses nothing.")

    # Notifications: never the maker about their own, only the interested at a start, never who else.
    start = fn(lib, "notifyEventStart")
    if "keen.has(authorMark(who))" not in start or "seesEvent(who, ev)" not in start or "wants(d.want, 'events')" not in start:
        refuse("notifyEventStart tells somebody who did not say they were interested, or cannot see it, or did not switch it on.")
    new = fn(lib, "notifyEventNew")
    if "authorMark(who) === ev.by" not in new or "followsRoom(d.want, ev.room)" not in new or "wants(d.want, 'scheduled')" not in new:
        refuse("notifyEventNew tells its maker, or a device that does not follow its room, or one that did not switch it on.")
    pay = re.search(r"function eventPayload\(.*?\n\}", lib, re.S)
    if not pay or re.search(r"keen|\bby\b|count", uncomment(pay.group(0)).replace("why === 'new'", "")):
        refuse("an event's notification carries who is interested, the mark or a count.")
    kinds = re.search(r"export const PUSH_KINDS = \[([^\]]*)\]", lib)
    if not kinds or "'events'" not in kinds.group(1) or "'scheduled'" not in kinds.group(1):
        refuse("PUSH_KINDS has lost 'events' or 'scheduled', so Everything would miss them.")

    da = re.search(r"export async function deleteAccount\(.*?\n\}", lib, re.S)
    if not da or "await forgetEvents(acct.handle, acct.since, s);" not in da.group(0):
        refuse("deleteAccount in lib.mjs no longer deletes a username's events and takes it off every list.")
    if "forgetEvents(who.handle, who.since)" not in (ROOT / "netlify/functions/cb-pets.mjs").read_text():
        refuse("Forget me (cb-pets.mjs) no longer deletes events.")
    if "sweepEvents()" not in (ROOT / "netlify/functions/cb-midnight.mjs").read_text():
        refuse("the hourly sweep (cb-midnight.mjs) no longer takes events that have been and gone.")

    for f in (FUNC, START):
        if not f.exists():
            refuse(f"{f.name} is missing.")
            continue
        t = f.read_text()
        if re.search(r"\bconsole\.", t):
            refuse(f"{f.name} logs something, and nothing a person sends is ever logged.")
    if FUNC.exists() and "noindex" not in FUNC.read_text():
        refuse("cb-events.mjs no longer asks search engines not to index or archive its answers.")
    if START.exists() and not re.search(r"schedule:\s*'\*/5 \* \* \* \*'", START.read_text()):
        refuse("cb-events-start.mjs no longer runs every five minutes, so a start would be told late or never.")

    cb = CB.read_text()
    begin, end = "  /* ── Events ──", "  /* ── The Profile ──"
    if begin not in cb or end not in cb:
        refuse("cb.js has lost its Events section, before the Profile.")
    else:
        radio = uncomment(cb[cb.index(begin):cb.index(end)])
        m = re.search(r"\.length\s*\+|\+\s*[\w.]+\.length\b|\bcount\b|\btotal\b|\bhow many\b|\bnumber of\b|\binterested\b\s*\(\s*\d", radio, re.I)
        if m:
            refuse(f"cb.js's events code has {m.group(0)!r}. Nothing counts who is interested, or anything else on an event.")
        if re.search(r"innerHTML|outerHTML|insertAdjacentHTML", radio):
            refuse("cb.js writes an event as markup from a string. Its words are drawn into elements by md().")
        if re.search(r"localStorage|sessionStorage|indexedDB", radio):
            refuse("cb.js's events code keeps something in the browser. Nothing about events is kept there.")
        for u in re.findall(r"call\('([^']*)'", radio):
            if u != "/cb/events":
                refuse(f"cb.js's events code asks {u}; it asks /cb/events and nothing else.")
        if not re.search(r"Radio\.prototype\.listen = function \(\) \{.*?this\.evTick\(\);", cb, re.S):
            refuse("listen() no longer asks for events, so nothing does, or something else does.")

    for page, what in (("privacy.html", "privacy page"), ("cb-guide.html", "CB guide")):
        if 'id="events"' not in (ROOT / page).read_text():
            refuse(f"the {what} ({page}) has no section on events (id=\"events\").")

    if problems:
        print("REFUSING:\n  " + "\n  ".join(problems))
        sys.exit(1)
    print("events: names and never how many, kept with nothing about when, never in a room that keeps to itself, forgotten with you")


if __name__ == "__main__":
    main()
