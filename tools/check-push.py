#!/usr/bin/env python3
"""Hold the CB's notifications to what privacy.html#notifications says.

Ryan, 2026-10-18, after requests "especially for staff": Web Push, for an @
mention, a room followed, a call starting and everything on World, each off
until a device switches it on. It reversed the street's "no alerts", so what
is left of the old promise is checked here rather than remembered:

  · THE SERVICE WORKER TOUCHES NO PAGE. cb-sw.js shows a notification and opens
    the room it is about, and nothing else: a fetch listener would put it
    between every visitor and every room, a cache would keep copies of them,
    and storage would keep something about somebody. All three are refused, and
    so is importScripts, which would bring in code nobody reviewed here.
  · ONLY THE RADIO ASKS THE BROWSER. No script but cb.js may ask for permission,
    register a service worker or subscribe to push, so no room can ask anybody
    to be notified about anything.
  · THE STREET POSTS ONLY TO A BROWSER'S OWN PUSH SERVICE. Every pattern in
    PUSH_HOSTS in lib.mjs is anchored at both ends, so a request cannot name an
    address and have this server post to it.
  · A CALL'S NOTIFICATION NEVER SAYS WHO JOINED. Who is in a call is shown only
    to radios seen in its room (privacy.html#calls); notifyCall's payload is the
    room and nothing else, and for a forum category's room (2026-10-21), which
    is in no public list, that room's name and address by forumPlace().
  · EVERYTHING REACHES A KIND ADDED LATER (feedback from our community and
    Ryan's call, 2026-10-19). A device can switch on every kind at once, and
    every kind added after it, so every notifier asks wants() in lib.mjs and
    never a switch by name: a switch read directly would stay off for somebody
    who chose everything, and nothing would say so.
  · EVERY ROOM IS NEVER A ROOM THAT KEEPS TO ITSELF (Norah's ask, 2026-10-21).
    A device can follow every room at once, and followsRoom() in lib.mjs is the
    one place a notifier asks whether it follows a room, so a room that keeps to
    itself is told only to a device that followed it there by name: every room
    taking it in would announce it to everybody who never knew its address.
  · A ROLE IS CALLED ONLY AS THE SERVER SAYS, AND NOBODY IS TOLD WHO HOLDS ONE
    (Ryan's ask, 2026-10-23: @moderator, @director, @board, @administrator). A
    message's or a post's roles are only ever what roleMentions() in lib.mjs
    found, from the sender's own pass and the words, never from the request; a
    notification says which role (`as`) and nothing about who else holds it;
    a role's word is refused as a username where one is claimed; the roles the
    radio, links.js, forum.js and the service worker know by name are ROLES.
    A MEMBER'S CALL FOR A MODERATOR leaves a note on the desk (noteModCall,
    Ryan's call the same day): never for a moderator's own call, never from a
    room that keeps to itself or one only some may enter, read and closed by
    the base only, written by nothing else, and privacy.html says so.
  · THE PRIVACY PAGE SAYS SO, under #notifications.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
problems = []


def code(src):
    src = re.sub(r"/\*.*?\*/", "", src, flags=re.S)
    return re.sub(r"(?m)^\s*//.*$", "", src)


def roles_check(lib):
    roles = re.search(r"export const ROLES = \[([^\]]*)\]", lib)
    if not roles:
        problems.append("lib.mjs has no ROLES.")
        return
    names = sorted(re.findall(r"'([a-z]+)'", roles.group(1)))
    # What a message or a post keeps as its roles is roleMentions()'s, from the pass and the words.
    files = [ROOT / "netlify" / "cb" / "lib.mjs"] + sorted((ROOT / "netlify" / "functions").glob("*.mjs"))
    for f in files:
        c = code(f.read_text())
        for m in re.finditer(r"\b(?:msg|p|next\[i\]|post|m)\.roles\s*=\s*([^;]*);", c):
            before = c[:m.start()]
            made = before.rfind("const roles = ")
            if m.group(1).strip() != "roles" or made < 0 or not before[made + len("const roles = "):].startswith("roleMentions("):
                problems.append(f"{f.name} keeps roles on a message or post that roleMentions() did not find ({m.group(0).strip()}).")
        # The desk's own roles function (cb-roles.mjs) gives people roles, and is not a message.
        for m in re.finditer(r"\b(?:b|f|body)\.roles\b", "" if f.name == "cb-roles.mjs" else c):
            problems.append(f"{f.name} reads roles off a request ({m.group(0)}): which roles are called is roleMentions()'s, from the pass.")
    for fn in ("checkHandle", "joinAccount", "claimAccount"):
        body = re.search(r"export async function " + fn + r"\(.*?\n}\n", lib, re.S)
        if not body or "roleWord(" not in body.group(0):
            problems.append(f"lib.mjs: {fn} does not refuse a role's word as a username, so @board could be somebody.")
    for m in re.finditer(r"payload\.as\s*=\s*([^;]*);", code(lib)):
        if m.group(1).strip() != "role":
            problems.append(f"a notification says it called {m.group(1).strip()}: it says the one role, and never who else holds it.")
    note = re.search(r"export async function noteModCall\(.*?\n}\n", lib, re.S)
    nc = code(note.group(0)) if note else ""
    for need, why in [("who.role === 'base'", "leaves a note for a moderator's own call"),
                      ("quietRoom(room)", "names a room that keeps to itself on the desk"),
                      ("lockedRoom(room)", "names a room only some may enter on the desk"),
                      ("cat.see && cat.see.length", "names a category only some may read on the desk"),
                      ("includes('moderator')", "leaves a note for something other than a call of @moderator")]:
        if need not in nc:
            problems.append(f"lib.mjs: noteModCall {why}.")
    for fn in ("readModCalls", "closeModCall"):
        body = re.search(r"export async function " + fn + r"\(.*?\n}\n", lib, re.S)
        if not body or "who.role !== 'base'" not in body.group(0):
            problems.append(f"lib.mjs: {fn} is not the base's alone.")
    writers = [m.start() for m in re.finditer(r"updateDm\(MOD_CALLS", code(lib))]
    starts = [(m.start(), m.group(1)) for m in re.finditer(r"(?:async )?function (\w+)\(", code(lib))]
    for w in writers:
        owner = [n for (p, n) in starts if p < w][-1]
        if owner not in ("noteModCall", "closeModCall", "sweepDms"):
            problems.append(f"lib.mjs: {owner} writes the desk's calls; only noteModCall, closeModCall and the sweep may.")
    desk = code((ROOT / "desk.js").read_text())
    if re.search(r"innerHTML|outerHTML|insertAdjacentHTML", desk):
        problems.append("desk.js: builds markup from a string, and a call's words are somebody's.")
    priv = (ROOT / "privacy.html").read_text()
    if "noteModCall" in lib and 'id="moderator-calls"' not in priv:
        problems.append("privacy.html has no #moderator-calls saying a member's call leaves a note on the desk.")
    for name, pat in [("cb.js", r"var ROLE_SAYS = \{([^}]*)\}"), ("links.js", r"var ROLE_SAYS = \{([^}]*)\}"),
                      ("forum.js", r"var ROLE_SAYS = \{([^}]*)\}"), ("cb-sw.js", r"function called\(d\) \{[^}]*\[([^\]]*)\]")]:
        m = re.search(pat, (ROOT / name).read_text())
        known = sorted(re.findall(r"'?([a-z]+)'?\s*:", m.group(1)) if "ROLE_SAYS" in pat else re.findall(r"'([a-z]+)'", m.group(1))) if m else None
        if known != names:
            problems.append(f"{name} knows the roles an @ can call as {known}, and ROLES in lib.mjs is {names}.")


def main():
    sw = ROOT / "cb-sw.js"
    if not sw.exists():
        problems.append("cb-sw.js is gone, and the radio registers it.")
    else:
        c = code(sw.read_text())
        for pat, why in [
            (r"addEventListener\(\s*['\"]fetch['\"]", "a fetch listener: it would stand between every visitor and every room"),
            (r"\bcaches\b|CacheStorage", "a cache: it would keep copies of the street's pages"),
            (r"localStorage|sessionStorage|indexedDB", "storage: the worker keeps nothing"),
            (r"importScripts|import\s*\(", "code brought in from elsewhere"),
        ]:
            if re.search(pat, c):
                problems.append(f"cb-sw.js has {why}.")
    for js in sorted(ROOT.glob("*.js")):
        if js.name in ("cb.js", "cb-sw.js"):
            continue
        c = code(js.read_text())
        for pat in (r"Notification\.requestPermission", r"serviceWorker\.register", r"pushManager\.subscribe"):
            if re.search(pat, c):
                problems.append(f"{js.name} asks the browser for notifications ({pat.replace(chr(92), '')}); only the radio may.")
    lib = (ROOT / "netlify" / "cb" / "lib.mjs").read_text()
    m = re.search(r"export const PUSH_HOSTS = \[(.*?)\];", lib, re.S)
    if not m:
        problems.append("lib.mjs has no PUSH_HOSTS, so nothing says where the street may post.")
    else:
        pats = re.findall(r"/(\^.*?)/", m.group(1))
        raw = re.findall(r"/([^/,\s][^,]*?)/", m.group(1))
        if not pats or len(pats) != len(raw):
            problems.append("an entry in PUSH_HOSTS is not anchored at its start.")
        for p in pats:
            if not p.endswith("$"):
                problems.append(f"PUSH_HOSTS entry /{p}/ is not anchored at its end, so a longer host would pass.")
    # The part and its sub-parts (Sending, and the notifiers), up to Answers.
    part = re.search(r"/\* ── Notifications ─.*?(?=/\* ── Answers )", lib, re.S)
    kinds = re.search(r"export const PUSH_KINDS = \[([^\]]*)\]", lib)
    if not part or not kinds:
        problems.append("lib.mjs has no Notifications part, or no PUSH_KINDS in it.")
    else:
        names = re.findall(r"'([a-z]+)'", kinds.group(1))
        body = re.sub(r"export function (cleanWant|wants)\(.*?\n}\n", "", code(part.group(0)), flags=re.S)
        for k in names + ["all"]:
            for m in re.finditer(r"\b(?:want|w)\s*\??\.\s*" + k + r"\b", body):
                problems.append(f"lib.mjs reads the {k} switch by name ({m.group(0)}): ask wants(), or Everything misses it.")
    call = re.search(r"export async function notifyCall\(.*?\n}\n", lib, re.S)
    if not call:
        problems.append("lib.mjs has no notifyCall.")
    else:
        c = code(call.group(0))
        payloads = re.findall(r"payload(?::|\s*=)\s*(\{[^}]*\})", c)
        adds = re.findall(r"payload\.(\w+)\s*=\s*([^;]*);", c)
        if payloads != ["{ kind: 'call', room: tag }"] or adds not in ([], [("place", "forumPlace(tag)")]):
            problems.append(f"a call's notification carries {payloads} {adds}: it is the room and nothing else, never who joined.")
    follows = re.search(r"export function followsRoom\(w, room\) \{(.*?)\n\}", lib, re.S)
    if not follows or "w.everyRoom === true && !quietRoom(room)" not in follows.group(1):
        problems.append("lib.mjs: followsRoom() must leave a room that keeps to itself out of every room.")
    if part:
        for m in re.finditer(r"\b(?:w|want|d\.want)\s*\??\.\s*(?:rooms|everyRoom)\b[^;\n]*", re.sub(r"export function (cleanWant|followsRoom)\(.*?\n}\n", "", code(part.group(0)), flags=re.S)):
            problems.append(f"lib.mjs reads the rooms a device follows itself ({m.group(0).strip()}): ask followsRoom(), which keeps every room off a room that keeps to itself.")
    roles_check(lib)
    priv = (ROOT / "privacy.html").read_text()
    if 'id="notifications"' not in priv:
        problems.append("privacy.html has no #notifications section, and the radio and the service worker link to it.")
    elif "@moderator" not in re.split(r"<h2\b", priv.split('id="notifications"', 1)[1], 1)[0]:
        problems.append("privacy.html#notifications does not say who a role's @ (@moderator and the rest) tells.")
    if problems:
        print("REFUSING:\n  " + "\n  ".join(problems))
        sys.exit(1)
    print("notifications: the worker touches no page, only the radio asks, the street posts only to push services")


if __name__ == "__main__":
    main()
