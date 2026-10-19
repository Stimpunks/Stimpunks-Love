#!/usr/bin/env python3
"""Hold the CB's direct messages to what privacy.html#messages promises.

Ryan's calls, 2026-10-18, as our community moves off Discord: messages between
two people, claimed usernames only, off until switched on, the first message
waiting for its person to answer it, blocking, 48 hours, not end-to-end
encrypted, a report the only way a message reaches the moderators, and no
counts or receipts. The server is the Direct messages part of
netlify/cb/lib.mjs, /cb/dm and /cb/dm/reports; the radio's half is the
Messages part of cb.js; the moderators' half is desk.js.

WHAT IT REFUSES, and why each one is here:

  · AN UNCLAIMED HANDLE AT EITHER END. Every way in asks forumReader first, and
    a handle nobody claimed answers 'closed', because an unclaimed handle is
    anybody's who signs on with it.
  · A BLOCK THAT SAYS SO. Somebody blocked is told 'closed', the same words as a
    switch that is off, and nobody but its owner is sent a block list.
  · A SENDER'S KEY IN AN ANSWER. shapeDm sends whether a message is yours,
    never whose key it is, and never spreads a message into an answer.
  · A MODERATOR READING A CONVERSATION. Only readReports and closeReport ask
    for the base, and only reportDm puts anything on the desk; no other
    function in the part treats the base differently, except to mark a
    message BASE.
  · A MESSAGE KEPT PAST ITS 48 HOURS, and the sweep not deleting what is left.
  · FORGET ME OR DELETING THE USERNAME LEAVING A CONVERSATION BEHIND.
  · A COUNT, A RECEIPT OR A TIMER in the radio's Messages code: no unread
    number, no "seen", no "typing", and nothing that asks the server on a timer
    of its own (listen() is the only thing that asks). The friendly edits are
    all of those. "seen" is the word and not part of a name: its first run
    refused the radio's own cb-seen-now class, and the pattern was narrowed
    rather than the class excepted.
  · MARKUP FROM A STRING, on the radio or on the desk.
  · A function that logs anything, an answer search engines may keep, and a
    privacy page or CB guide with no section on messages.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LIB = ROOT / "netlify" / "cb" / "lib.mjs"
CB = ROOT / "cb.js"
DESK = ROOT / "desk.js"
SW = ROOT / "cb-sw.js"
FUNCS = [ROOT / "netlify" / "functions" / n for n in ("cb-dm.mjs", "cb-dm-reports.mjs")]

problems = []


def refuse(msg):
    problems.append(msg)


def uncomment(s):
    return re.sub(r"(?m)^\s*//.*$", "", re.sub(r"/\*.*?\*/", "", s, flags=re.S))


def fn(src, name):
    m = re.search(r"(?:export )?(?:async )?function " + re.escape(name) + r"\(.*?\n\}", src, re.S)
    if not m:
        refuse(f"lib.mjs has no {name}, which direct messages need.")
        return ""
    return m.group(0)


def main():
    lib = LIB.read_text()
    if "/* ── Direct messages" not in lib:
        raise SystemExit("REFUSING: lib.mjs has no Direct messages part (/* ── Direct messages). Put it back rather than letting this tool go quiet.")
    part = lib[lib.index("/* ── Direct messages"):lib.index("/* ── Pictures on the channel")]
    code = uncomment(part)

    for name in ("sendDm", "pairOf", "listDms", "setDmOpen", "unblockDm"):
        if "if (!forumReader(who)) return { error: 'claim' };" not in fn(part, name):
            refuse(f"{name} no longer refuses a username that is not claimed, first.")
    pair = fn(part, "pairOf")
    if "if (!acct) return { error: 'closed'" not in pair:
        refuse("pairOf no longer answers 'closed' for a handle nobody has claimed.")
    send = fn(part, "sendDm")
    if "if (blocks(theirs, who.handle)) return { error: 'closed' };" not in send:
        refuse("sendDm tells somebody blocked something other than 'closed', which says they were blocked.")
    if "if (!theirs.open) return { error: 'closed' };" not in send:
        refuse("sendDm starts a conversation with somebody who has not switched messages on.")
    if "if (c.from === p.me) return { error: 'waiting' };" not in send:
        refuse("sendDm lets whoever asked write more before their first message is answered.")
    if "blocks(theirs, who.handle)" not in fn(part, "readDmWith"):
        refuse("readDmWith no longer hides a block behind 'closed'.")
    shape = fn(part, "shapeDm")
    if re.search(r"\bby\s*:|\.\.\.\s*m\b", shape):
        refuse("shapeDm sends a sender's key, or spreads the whole message into an answer.")
    for name in ("readReports", "closeReport"):
        if "who.role !== 'base'" not in fn(part, name):
            refuse(f"{name} no longer refuses everybody but the base.")
    for name in ("readDmWith", "listDms", "takeDm", "editDm", "acceptDm", "rejectDm", "blockDm", "reportDm"):
        if re.search(r"role\s*===?\s*'base'|\.roles\b", fn(part, name)):
            refuse(f"{name} treats a moderator differently. No moderator reaches into a conversation; a report is the one way.")
    if re.search(r"\.set(JSON)?\(\s*REPORTS", re.sub(r"export async function (reportDm|closeReport|sweepDms)\(.*?\n\}", "", code, flags=re.S)) \
            or re.search(r"updateDm\(REPORTS", re.sub(r"export async function (reportDm|closeReport|sweepDms)\(.*?\n\}", "", code, flags=re.S)):
        refuse("something other than reportDm, closeReport and the sweep writes to the moderators' desk.")
    if "now - m.t < LIFE" not in fn(part, "convDoc"):
        refuse("a conversation no longer drops every message past its 48 hours on every read.")
    if "slice(-DM_KEEP)" not in code:
        refuse("a conversation keeps more than DM_KEEP messages.")

    da = re.search(r"export async function deleteAccount\(.*?\n\}", lib, re.S)
    if not da or "await forgetDms(acct.handle, acct.since, s);" not in da.group(0):
        refuse("deleteAccount in lib.mjs no longer deletes a username's messages.")
    if "forgetDms(who.handle, who.since)" not in (ROOT / "netlify/functions/cb-pets.mjs").read_text():
        refuse("Forget me (cb-pets.mjs) no longer deletes messages.")
    if "await sweepDms();" not in (ROOT / "netlify/functions/cb-midnight.mjs").read_text():
        refuse("the hourly sweep (cb-midnight.mjs) no longer sweeps messages.")
    for f in FUNCS:
        if not f.exists():
            refuse(f"{f.name} is missing.")
            continue
        src = f.read_text()
        if re.search(r"\bconsole\.", src):
            refuse(f"{f.name} logs something, and nothing a person sends is ever logged.")
        if "noindex" not in src:
            refuse(f"{f.name} no longer asks search engines not to index its answers.")

    cb = CB.read_text()
    begin, end = "/* ── Messages ─", "/* ── Your props ─"
    if begin not in cb or end not in cb:
        refuse("cb.js has lost its Messages part (/* ── Messages ─ ... /* ── Your props ─).")
        radio = ""
    else:
        radio = uncomment(cb[cb.index(begin):cb.index(end)])
    m = re.search(r"\.length\s*\+|\+\s*[\w.]+\.length\b|\bcount\b|\btotal\b|\bhow many\b|\bnumber of\b|\bunread\b|"
                  r"\bread receipt|(?<![\w-])seen(?![\w-])|\btyping\b", radio, re.I)
    if m:
        refuse(f"cb.js's Messages code has {m.group(0)!r}. Nothing counts messages and nothing says who read what "
               "or who is typing.")
    if re.search(r"setInterval|setTimeout|requestAnimationFrame", radio):
        refuse("cb.js's Messages code keeps a timer of its own. listen() is the only thing that asks the server.")
    if re.search(r"localStorage|sessionStorage|indexedDB", radio):
        refuse("cb.js's Messages code stores something in the browser. Nothing about a conversation is kept there.")
    if re.search(r"innerHTML|outerHTML|insertAdjacentHTML", radio):
        refuse("cb.js writes a message as markup from a string. A message's words are drawn into elements by md().")
    listen = re.search(r"Radio\.prototype\.listen = function \(\) \{.*?\n  \};", cb, re.S)
    if not listen or "this.dmTick()" not in listen.group(0):
        refuse("listen() no longer asks for messages while the Messages part is open.")
    if re.search(r"innerHTML|outerHTML|insertAdjacentHTML", uncomment(DESK.read_text())):
        refuse("desk.js writes something as markup from a string. A report's words are plain text.")
    sw = SW.read_text()
    if "d.kind === 'dm'" not in sw or "'/#cb=messages'" not in sw:
        refuse("cb-sw.js no longer shows a message's notification, or opens Messages from it.")

    priv = (ROOT / "privacy.html").read_text()
    if 'id="messages"' not in priv:
        refuse("the privacy page (privacy.html) has no section on direct messages (id=\"messages\").")
    elif "not end-to-end encrypted" not in priv:
        refuse("the privacy page no longer says direct messages are not end-to-end encrypted.")
    if 'id="messages"' not in (ROOT / "cb-guide.html").read_text():
        refuse("the CB guide (cb-guide.html) has no section on messages (id=\"messages\").")

    if problems:
        print("REFUSING:\n  " + "\n  ".join(problems))
        sys.exit(1)
    print("messages: claimed at both ends, a block that says nothing, 48 hours, moderators only through a report, never counted")


if __name__ == "__main__":
    main()
