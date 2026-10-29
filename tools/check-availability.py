#!/usr/bin/env python3
"""Hold the CB's availability to what privacy.html#availability promises.

Ryan's ask, 2026-10-29, after a request for an away message and a status:
availability rather than presence, for working together. Available, Busy,
Away, Do not disturb and Out of office, each with a line of its person's own
words, or Not shown, where everybody starts. It sits beside the chat status
(tools/check-chat-status.py) and never in its place. The server is the
Availability part of netlify/cb/lib.mjs and /cb/availability; the radio's half
is cb.js, and Tasks and the office show it beside their people's names.

Ryan asked whether Available should turn to Not shown after an hour unseen,
and chose not to: that needs a record of when each person was last heard,
which the street keeps nowhere, and anybody watching the change would learn
it. What stands in its place is a question the radio asks its own person, on
a day after the state was chosen, from a day kept in that browser alone.

WHAT IT REFUSES, and why each one is here:

  · THE LISTS DISAGREEING. The ids in lib.mjs, and the ids and names in cb.js,
    tasks.js and office.js, are the same five in the same order, and the line's
    length is the same on both sides.
  · A DEFAULT. Nobody is started on a state: no id appears in either half
    outside its list.
  · A TIME, AN IDLE, AN EXPIRY OR A TIMER. The record is each person's state
    and line and nothing about when; the server keeps no last-seen and runs no
    timer. The radio's day for asking is never sent: no netlify file names it,
    and what the radio sends is the state and the line.
  · A LOCK, OR AN ANSWER SENT FOR SOMEBODY. sendDm, pairOf and readDmWith never
    read it, nothing in the part or the endpoint sends a message, and
    /cb/dm reads it only to show it.
  · NOTIFICATIONS THAT ASK IT. Do not disturb is a sign, the chat status's
    rule: no part of the push code reads it.
  · AN UNCLAIMED HANDLE WEARING ONE.
  · FORGET ME OR DELETING THE USERNAME LEAVING IT BEHIND.
  · A PLACE THAT NO LONGER SHOWS IT, a colour of its own in cb.css, and a
    privacy page or CB guide with no section on it.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LIB = ROOT / "netlify" / "cb" / "lib.mjs"
CB = ROOT / "cb.js"
FN = ROOT / "netlify" / "functions"

STATES = [
    ("available", "Available"), ("busy", "Busy"), ("away", "Away"),
    ("dnd", "Do not disturb"), ("out-of-office", "Out of office"),
]

problems = []


def refuse(msg):
    problems.append(msg)


def uncomment(s):
    return re.sub(r"(?m)^\s*//.*$", "", re.sub(r"/\*.*?\*/", "", s, flags=re.S))


def between(src, start, end, what):
    if start not in src or end not in src[src.index(start):]:
        raise SystemExit(f"REFUSING: {what} is not where this tool looks ({start!r} to {end!r}). Put it back rather than letting this tool go quiet.")
    i = src.index(start)
    return src[i:src.index(end, i)]


def fn(src, name):
    m = re.search(r"(?:export )?(?:async )?function " + re.escape(name) + r"\(.*?\n\}", src, re.S)
    if not m:
        refuse(f"lib.mjs has no {name}.")
        return ""
    return m.group(0)


def main():
    lib = LIB.read_text()
    cb = CB.read_text()
    part = between(lib, "/* ── Availability", "/* ── Who is in a room's call", "lib.mjs's Availability part")
    code = uncomment(part)
    words = between(cb, "  /* AVAILABILITY (Ryan's ask, 2026-10-29)", "  function localDay", "cb.js's availability words")
    picker = between(cb, "  /* YOUR AVAILABILITY, under your chat status", "  // A conversation open on the screen", "cb.js's availability picker")
    rcode = uncomment(words + picker)
    ids = [x[0] for x in STATES]

    # The lists, the same five everywhere.
    m = re.search(r"export const AVAILABILITY = \[([^\]]*)\];", part)
    got = re.findall(r"'([a-z-]+)'", m.group(1)) if m else []
    if got != ids:
        refuse(f"lib.mjs's AVAILABILITY is {got}, not {ids} in their order.")
    rows = re.findall(r"\{ id: '([a-z-]+)', name: '([^']*)'", words)
    if rows != STATES:
        refuse(f"cb.js's AVAIL is {rows}, not {STATES} in their order.")
    for f in ("tasks.js", "office.js"):
        src = (ROOT / f).read_text()
        mm = re.search(r"var AVAIL_NAMES = \{([^}]*)\};", src)
        names = re.findall(r"'?([a-z-]+)'?: '([^']*)'", mm.group(1)) if mm else []
        if names != STATES:
            refuse(f"{f}'s AVAIL_NAMES is {names}, not {STATES}.")
        if "about: availWords" not in src:
            refuse(f"{f} no longer shows availability beside a name in the @ list.")
    lm = re.search(r"export const AVAIL_NOTE_MAX = (\d+);", part)
    rm = re.search(r"var AVAIL_NOTE_MAX = (\d+);", words)
    if not lm or not rm or lm.group(1) != rm.group(1):
        refuse("AVAIL_NOTE_MAX is not the same number in lib.mjs and cb.js.")

    # No default. Its first run read the store's own retry, Error('busy'), as the state: narrowed, not excepted.
    bare = code.replace("new Error('busy')", "")
    for i in ids:
        if bare.count(f"'{i}'") != 1:
            refuse(f"lib.mjs's Availability part names '{i}' outside AVAILABILITY, which is how somebody gets started on a state they never chose.")
        if rcode.count(f"'{i}'") > 2:
            refuse(f"cb.js's availability names '{i}' outside AVAIL more than once, which is how somebody gets started on a state they never chose.")
    if re.search(r"availMine\s*=\s*\{\s*avail:\s*'[a-z]", rcode):
        refuse("cb.js starts somebody on a state they never chose.")

    # Nothing about when on the server, no timer, no idle.
    if re.search(r"Date\.|\bsince\b|\bwhen\s*:|\bt\s*:|\bat\s*:|lastSeen|last_seen|\bseen\s*:", code):
        refuse("lib.mjs's Availability part keeps or reads a time: the record is each person's state and line and nothing about when.")
    if "s.setJSON(AVAIL, { status }, opts)" not in part:
        refuse("lib.mjs writes the availability blob with something besides each person's state and line.")
    if "all[pk] = note ? { a: avail, note } : { a: avail };" not in part:
        refuse("setAvailability keeps something besides the state and the line.")
    if "if (!avail) { if (!own(all, pk)) return false; delete all[pk]; return true; }" not in part:
        refuse("Choosing Not shown no longer takes somebody out of the availability blob.")
    if re.search(r"setInterval|\bidle\b|\bafk\b|expires?\b|runs? out", rcode + code, re.I):
        refuse("The availability runs on a timer, or works out an idle or a time it runs out: nothing changes it but its person.")
    for f in FN.glob("*.mjs"):
        if "availDay" in f.read_text():
            refuse(f"{f.name} names availDay: the day the radio asks from stays in the browser and is never sent.")
    if "availDay" in uncomment(lib):
        refuse("lib.mjs names availDay: the day the radio asks from stays in the browser and is never sent.")
    if not re.search(r"var v = \{ avail: chosen \? chosen\.value : '', note: [^}]*\};", picker) or "call('/cb/availability', { body: v }" not in picker:
        refuse("cb.js sends /cb/availability something besides the state and the line.")

    # Claimed only.
    if "if (!p.claimed) return p;" not in fn(part, "withAvailability"):
        refuse("withAvailability would put an availability beside an unclaimed name.")
    setter = (FN / "cb-availability.mjs").read_text() if (FN / "cb-availability.mjs").exists() else ""
    if "if (!forumReader(who))" not in setter:
        refuse("/cb/availability does not ask forumReader first: an unclaimed handle is anybody's who signs on with it.")
    if "setAvailability(petKey(who.handle)" not in setter:
        refuse("/cb/availability sets an availability for somebody besides the pass's own username.")

    # A sign, never a lock, and nothing sent for anybody.
    for name in ("sendDm", "pairOf", "readDmWith"):
        if re.search(r"avail|AVAIL", uncomment(fn(lib, name))):
            refuse(f"{name} reads an availability: it is a sign and never a lock.")
    if re.search(r"sendDm|transmit|notify|updateLog|updateConv", code + uncomment(setter)):
        refuse("The availability sends a message or a notification: there is no automatic reply.")
    dm = (FN / "cb-dm.mjs").read_text()
    talk = re.search(r"const talk = async .*?\n    \};", dm, re.S)
    if not talk or "availabilityOf(" not in talk.group(0) or dm.count("availabilityOf(") != 1:
        refuse("/cb/dm reads an availability somewhere besides showing it in a conversation, or no longer shows it there.")

    # Notifications stay separate.
    if "/* ── Notifications" in lib:
        push = uncomment(lib[lib.index("/* ── Notifications"):])
        for name in ("wants", "tellDevices", "notifyWire", "notifyForum", "notifyProps", "notifyDm", "notifyTask", "notifyCall"):
            if re.search(r"availab|withAvailability|AVAIL\b|'availability'", fn(push, name)):
                refuse(f"{name} reads an availability: Do not disturb is a sign and silences nothing.")
    else:
        refuse("lib.mjs has no Notifications part where this tool looks (/* ── Notifications).")

    # Forget me and deleting the username.
    if "await forgetAvailability(petKey(handle), s);" not in fn(lib, "deleteAccount"):
        refuse("deleteAccount leaves the availability behind.")
    pets = (FN / "cb-pets.mjs").read_text()
    forget = re.search(r"if \(b\.forget !== true\).*?\n", pets, re.S)
    rest = pets[forget.end():forget.end() + 700] if forget else ""
    if "await forgetAvailability(pk);" not in rest:
        refuse("Forget me (/cb/pets) leaves the availability behind.")

    # Every place it is shown.
    shows = {
        "cb-online.mjs": "withAvailability(", "cb-here.mjs": "withAvailability(",
        "cb-profile-of.mjs": "availabilityOf(", "cb-unread.mjs": "availabilityOf(petKey(who.handle))",
        "cb-tasks.mjs": "availabilityFor(taskPeople())", "cb-office.mjs": "availabilityFor(me.people)",
    }
    for f, needle in shows.items():
        if needle not in (FN / f).read_text():
            refuse(f"{f} no longer carries the availability ({needle}).")
    for needle, where in (("var avail = availLine(p);", "Who's online"),
                          ("var av = chat && availLine(x);", "Also seen here"),
                          ("var availNow = rs[0].status === 200 && rs[0].body ? availLine(rs[0].body) : null;", "a profile"),
                          ("var av = availOf(b.avail);", "a conversation"),
                          ("if (forumPass(this.state.pass)) this.availMake(aroundSec);", "Who's around (the picker)"),
                          ("if (forumPass(this.state.pass)) this.availStaleMake(whereSec || hereSec);", "the top (Still true?)")):
        if needle not in cb:
            refuse(f"cb.js no longer shows the availability on {where}.")
    tasks = (ROOT / "tasks.js").read_text()
    if "fact('Assigned to', t.who ? (availWords(t.who)" not in tasks or "var a = availWords(h); return a ? h + ' (' + a + ')' : h;" not in tasks:
        refuse("tasks.js no longer shows availability beside who a task is assigned to.")

    # Words in the radio's ink, never a colour of its own.
    css = (ROOT / "cb.css").read_text()
    for line in css.splitlines():
        if re.match(r"\.(cb-avail|cb-availpick|pf-avail|cb-avail-stale)", line) and re.search(r"#[0-9a-fA-F]{3,8}\b|rgb|hsl|--cb-chat-|--cb-avail", line):
            refuse(f"cb.css gives availability a colour of its own: {line.strip()[:80]}")

    # Said where people read.
    priv = (ROOT / "privacy.html").read_text()
    if 'id="availability"' not in priv:
        refuse("privacy.html has no section on availability (#availability).")
    elif "the radio never sends it" not in priv or "not when you were last seen" not in priv:
        refuse("privacy.html#availability no longer says the day stays in the browser and no last-seen is kept.")
    if 'id="availability"' not in (ROOT / "cb-guide.html").read_text():
        refuse("cb-guide.html has no section on availability (#availability), which the radio links.")

    if problems:
        print("REFUSING: the CB's availability breaks a promise.\n")
        for p in problems:
            print("  ·", p)
        sys.exit(1)
    print("The availability keeps its promises: set by its person, nothing about when, never a lock, never an answer sent for anybody.")


if __name__ == "__main__":
    main()
