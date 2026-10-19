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
    room and nothing else.
  · EVERYTHING REACHES A KIND ADDED LATER (feedback from our community and
    Ryan's call, 2026-10-19). A device can switch on every kind at once, and
    every kind added after it, so every notifier asks wants() in lib.mjs and
    never a switch by name: a switch read directly would stay off for somebody
    who chose everything, and nothing would say so.
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
        payloads = re.findall(r"payload:\s*(\{[^}]*\})", code(call.group(0)))
        if payloads != ["{ kind: 'call', room: tag }"]:
            problems.append(f"a call's notification carries {payloads}: it is the room and nothing else, never who joined.")
    priv = (ROOT / "privacy.html").read_text()
    if 'id="notifications"' not in priv:
        problems.append("privacy.html has no #notifications section, and the radio and the service worker link to it.")
    if problems:
        print("REFUSING:\n  " + "\n  ".join(problems))
        sys.exit(1)
    print("notifications: the worker touches no page, only the radio asks, the street posts only to push services")


if __name__ == "__main__":
    main()
