#!/usr/bin/env python3
"""Hold the CB's chat status to what privacy.html#chat-status promises.

Ryan's ask, 2026-10-24: Discord has Online, Idle, Do Not Disturb and
Invisible, and Be seen here is already Online and Invisible, a room at a time.
What nothing said was whether somebody wants to be talked to. So a chat status,
after the interaction badges (the colour communication badges Autism Network
International started at the first Autreat, Jim Sinclair, 1996), in the words
and shapes of the Cavendish Space Project's interaction cards, which are CC0:
come say hi, a green circle; people i know, a yellow triangle; not right now, a
red square. The server is the Chat status part of netlify/cb/lib.mjs and
/cb/chat-status; the radio's half is cb.js.

WHAT IT REFUSES, and why each one is here:

  · THE CARDS' WORDS CHANGED. The badge and the card are the same thing in two
    materials, the deck says, and so is the radio's copy: each badge's name,
    prompt and shape are checked against the deck's words below, and against
    the cards themselves when ../Cavendish-Cards is on this machine. The ids
    in lib.mjs and in cb.js are the same three, in the same order.
  · A DEFAULT. Somebody who has not chosen is shown as nothing, never as green:
    no badge's id may appear in either half outside the list of them, so
    nothing can quietly start anybody on one.
  · A TIME, AN IDLE OR A COUNT. The record is each person's badge and nothing
    else: no time it was chosen, no idle worked out from a quiet keyboard, no
    time it runs out, no timer of the radio's own, no number. Those are the
    friendly edits, and each would publish something about somebody's attention
    they never chose to show.
  · A LOCK. It is a sign: sendDm, pairOf and readDmWith never read it, and
    /cb/dm reads it only to show it in a conversation.
  · AN UNCLAIMED HANDLE WEARING ONE, or a status shown anywhere but beside a
    claimed name: withChatStatus asks p.claimed, and /cb/chat-status asks
    forumReader first.
  · FORGET ME OR DELETING THE USERNAME LEAVING IT BEHIND.
  · A PLACE THAT NO LONGER SHOWS IT (Who's online, Be seen here, a profile, a
    conversation), a colour that is not declared, and a privacy page or CB
    guide with no section on it.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LIB = ROOT / "netlify" / "cb" / "lib.mjs"
CB = ROOT / "cb.js"
FN = ROOT / "netlify" / "functions"
DECK = ROOT.parent / "Cavendish-Cards" / "cards" / "interaction"

# The Cavendish Space Project's interaction cards, word for word (CC0).
CARDS = [
    ("come-say-hi", "come say hi", "circle", "i want to talk — you can start."),
    ("people-i-know", "people i know", "triangle", "only say hi if we've met."),
    ("not-right-now", "not right now", "square", "please don't start talking to me."),
]
SHAPE_OF_CUE = {"circle": "white circle on green", "triangle": "white triangle on yellow", "square": "white square on red"}

problems = []


def refuse(msg):
    problems.append(msg)


def uncomment(s):
    return re.sub(r"(?m)^\s*//.*$", "", re.sub(r"/\*.*?\*/", "", s, flags=re.S))


def plain(s):
    """A JS string's words as a reader sees them: its escapes undone, its
    apostrophes straight, so the deck's typing and ours can be compared."""
    s = re.sub(r"\\u([0-9a-fA-F]{4})", lambda m: chr(int(m.group(1), 16)), s)
    return s.replace("’", "'").replace("\\'", "'")


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
    part = between(lib, "/* ── Chat status", "/* ── Who is in a room's call", "lib.mjs's Chat status part")
    code = uncomment(part)
    radio = between(cb, "  /* CHAT STATUS (Ryan's ask", "  function personLine", "cb.js's chat status badges")
    picker = between(cb, "  /* YOUR CHAT STATUS, under Who's around", "  // The channel being listened to", "cb.js's chat status picker")
    rcode = uncomment(radio + picker)
    ids = [c[0] for c in CARDS]

    # The ids, the same three in both halves.
    m = re.search(r"export const CHAT_STATUSES = \[([^\]]*)\];", part)
    got = re.findall(r"'([a-z-]+)'", m.group(1)) if m else []
    if got != ids:
        refuse(f"lib.mjs's CHAT_STATUSES is {got}, not the three badges {ids} in their order.")
    rows = re.findall(r"\{ id: '([a-z-]+)', name: '([^']*)', shape: '([a-z]+)', says: '((?:[^'\\]|\\.)*)'", radio)
    if [r[0] for r in rows] != ids:
        refuse(f"cb.js's CHAT has {[r[0] for r in rows]}, not the three badges {ids} in their order.")
    for (rid, name, shape, says), (cid, cname, cshape, csays) in zip(rows, CARDS):
        if (name, shape) != (cname, cshape):
            refuse(f"cb.js calls {rid} {name!r}, a {shape}; the card is {cname!r}, a {cshape}.")
        if plain(says) != csays:
            refuse(f"cb.js has {rid} saying {plain(says)!r}; the card says {csays!r}, word for word.")

    # The cards themselves, when they are here.
    if DECK.is_dir():
        for cid, cname, cshape, csays in CARDS:
            f = DECK / f"{cid}.md"
            if not f.exists():
                refuse(f"The deck has no {f.name} any more: read what it says now before this tool is changed.")
                continue
            t = f.read_text()
            if not t.startswith(f"# {cname}\n"):
                refuse(f"The deck's {f.name} is not called {cname!r} any more.")
            if f"\n## Prompt\n\n{csays}\n" not in t:
                refuse(f"The deck's {f.name} does not prompt {csays!r} any more: copy what it says now, here and in cb.js.")
            if SHAPE_OF_CUE[cshape] not in t:
                refuse(f"The deck's {f.name} is not a {SHAPE_OF_CUE[cshape]} any more.")

    # No default: no badge's id anywhere but its list.
    for i in ids:
        if code.count(f"'{i}'") != 1:
            refuse(f"lib.mjs's Chat status part names '{i}' outside CHAT_STATUSES, which is how somebody gets started on a badge they never chose.")
        if rcode.count(f"'{i}'") != 1:
            refuse(f"cb.js's chat status names '{i}' outside CHAT, which is how somebody gets started on a badge they never chose.")

    # Nothing about when, no idle, no count, no timer of its own.
    # Its first run read the not-right-now badge as a time: a word, not part of an id.
    if re.search(r"(?<![\w-])now(?![\w-])|Date\.|\bsince\b|\bwhen\s*:|\bt\s*:|\bat\s*:", code):
        refuse("lib.mjs's Chat status part keeps or reads a time: the record is each person's badge and nothing about when.")
    for where, src in (("lib.mjs's Chat status part", code), ("cb.js's chat status", rcode)):
        if re.search(r"\bidle\b|\bafk\b|\baway\b|\bdnd\b|\bexpires?\b|\bruns? out\b", src, re.I):
            refuse(f"{where} works out an idle, an away or a time it runs out: nothing changes a chat status but its person.")
        # Counting what is shown, never a loop's length: its first run refused CHAT.length.
        if re.search(r"setInterval|\bcount\b|how many|\bnumber of\b", src, re.I):
            refuse(f"{where} counts something, or asks on a timer of its own.")
    if not re.search(r"setTimeout\(function \(\) \{\s*call\('/cb/chat-status'", picker):
        refuse("cb.js no longer sends a chat status once, after the last change: walking the arrows past a badge must not choose it.")

    # Kept with nothing else in it.
    if "s.setJSON(CHAT, { status }, opts)" not in part:
        refuse("lib.mjs writes the chat-status blob with something besides each person's badge.")
    if "if (!chat) { if (!own(all, pk)) return false; delete all[pk]; return true; }" not in part:
        refuse("Choosing none no longer takes somebody out of the chat-status blob.")

    # Claimed only.
    if "if (!p.claimed) return p;" not in fn(part, "withChatStatus"):
        refuse("withChatStatus would put a chat status beside an unclaimed name.")
    setter = (FN / "cb-chat-status.mjs").read_text() if (FN / "cb-chat-status.mjs").exists() else ""
    if "if (!forumReader(who))" not in setter:
        refuse("/cb/chat-status does not ask forumReader first: an unclaimed handle is anybody's who signs on with it.")
    if "setChatStatus(petKey(who.handle)" not in setter:
        refuse("/cb/chat-status sets a status for somebody besides the pass's own username.")

    # A sign, never a lock.
    for name in ("sendDm", "pairOf", "readDmWith"):
        if re.search(r"chat|CHAT", uncomment(fn(lib, name))):
            refuse(f"{name} reads a chat status: it is a sign and never a lock, so nothing refuses a message for it.")
    dm = (FN / "cb-dm.mjs").read_text()
    talk = re.search(r"const talk = async .*?\n    \};", dm, re.S)
    if not talk or "chatStatusOf(" not in talk.group(0) or dm.count("chatStatusOf(") != 1:
        refuse("/cb/dm reads a chat status somewhere besides showing it in a conversation, or no longer shows it there.")

    # Forget me and deleting the username.
    if "await forgetChatStatus(petKey(handle), s);" not in fn(lib, "deleteAccount"):
        refuse("deleteAccount leaves the chat status behind.")
    pets = (FN / "cb-pets.mjs").read_text()
    forget = re.search(r"if \(b\.forget !== true\).*?\n", pets, re.S)
    rest = pets[forget.end():forget.end() + 600] if forget else ""
    if "await forgetChatStatus(pk);" not in rest:
        refuse("Forget me (/cb/pets) leaves the chat status behind.")

    # Every place it is shown.
    shows = {
        "cb-online.mjs": "withChatStatus(", "cb-here.mjs": "withChatStatus(",
        "cb-profile-of.mjs": "chatStatusOf(", "cb-unread.mjs": "chatStatusOf(petKey(who.handle))",
    }
    for f, needle in shows.items():
        if needle not in (FN / f).read_text():
            refuse(f"{f} no longer carries the chat status ({needle}).")
    for needle, where in (("var chat = p.chat && chatBadge(p.chat);", "Who's online"),
                          ("whoList(span, others, 'handle', true)", "Also seen here"),
                          ("chatLine.appendChild(chatBadge(chatNow.id));", "a profile"),
                          ("var cs = chatOf(b.chat);", "a conversation")):
        if needle not in cb:
            refuse(f"cb.js no longer shows a chat status on {where}.")

    # Its colours, declared, and nowhere else in the radio.
    love = (ROOT / "love.css").read_text()
    css = (ROOT / "cb.css").read_text()
    for t in ("hi", "known", "not"):
        for k in (f"--cb-chat-{t}", f"--cb-chat-{t}-ink"):
            if not re.search(re.escape(k) + r":\s*#[0-9A-Fa-f]{6};", love):
                refuse(f"love.css does not declare {k}.")
    for line in css.splitlines():
        if "--cb-chat-" in line and not line.startswith(".cb-chat--"):
            refuse(f"cb.css uses a chat status colour outside its badge: {line.strip()[:80]}")

    # Said where people read.
    if 'id="chat-status"' not in (ROOT / "privacy.html").read_text():
        refuse("privacy.html has no section on the chat status (#chat-status).")
    if 'id="chat-status"' not in (ROOT / "cb-guide.html").read_text():
        refuse("cb-guide.html has no section on the chat status (#chat-status), which the radio links.")

    if problems:
        print("REFUSING: the CB's chat status breaks a promise.\n")
        for p in problems:
            print("  ·", p)
        sys.exit(1)
    print("The chat status keeps its promises: the cards' words, nothing chosen for anybody, nothing about when, a sign and never a lock.")


if __name__ == "__main__":
    main()
