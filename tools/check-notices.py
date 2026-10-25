#!/usr/bin/env python3
"""Hold your past notifications to what privacy.html#notification-archive says.

Ryan's ask, 2026-10-25: "Desktop notifications come and go. I find myself
wanting an archive of notifications. Tasks saves my task notifications for 30
days. I want that for all notifications." It reversed the privacy page's
"nothing about what was sent to it", so what is left of the old promise is
checked here rather than remembered:

  · IT KEEPS NO WORDS. What a device is sent can carry a message's first
    words, a post's, a topic's title, a task's name and a ticked box's words;
    fileNotices in lib.mjs keeps only what noticeOf leaves, which drops every
    one of those (NOTICE_WORDS). Keeping them would keep a message past its 48
    hours and past Take off. The words on Your page are read again by
    noticeArchive from wherever they still are, as the pass can read them now.
  · ONLY WHAT WAS DELIVERED, AND ONLY TO A CLAIMED USERNAME'S DEVICE. A push
    service's 2xx is the only answer that files one, so the device switches
    decide what is in it. Filing everything that would have notified you,
    switched on or not, is the friendly edit: a record nobody asked to keep.
  · NOBODY ELSE AND NO NUMBER. Only /cb/notices reads it, with the pass, and
    it answers no count; the radio's code for it writes no number of anything
    and keeps nothing in the browser. Forget me and deleting the username
    delete it.
  · ONE WORDING. How each notification is said is the service worker's, in a
    factory between notice-words markers that cb.js carries character for
    character (indentation aside), so Your page says each one the way the
    notification did. Change both.
  · THE PAGE IS THE RADIO, DOCKED. you.html says data-cb-you and holds a
    data-cb-dock; cb.js docks it; cb.css keeps the parts about a room off it.
"""
import re
import sys
import textwrap
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
problems = []


def read(rel):
    return (ROOT / rel).read_text()


def code(src):
    src = re.sub(r"/\*.*?\*/", "", src, flags=re.S)
    return re.sub(r"(?m)^\s*//.*$", "", src)


def fn(src, name):
    m = re.search(r"(?:export )?(?:async )?function " + name + r"\(.*?\n}\n", src, re.S)
    return m.group(0) if m else None


lib = read("netlify/cb/lib.mjs")
c = code(lib)

# It keeps no words.
words = re.search(r"const NOTICE_WORDS = \[([^\]]*)\]", lib)
kept = set(re.findall(r"'([a-z]+)'", words.group(1))) if words else set()
for w in ("text", "title", "name", "box"):
    if w not in kept:
        problems.append(f"NOTICE_WORDS in lib.mjs does not drop `{w}`: the archive would keep a notification's words.")
filing = fn(c, "fileNotices")
if not filing:
    problems.append("lib.mjs has no fileNotices.")
else:
    if "noticeOf(x.payload)" not in filing:
        problems.append("fileNotices keeps something other than noticeOf(payload): a notification's words could be kept.")
    if "a.value >= 200 && a.value < 300" not in filing:
        problems.append("fileNotices files a notification no push service accepted: only a 2xx says a device was told.")
    if "p.gen !== 2" not in filing:
        problems.append("fileNotices files a notification for a pass that is not a claimed username's.")
deliver = fn(c, "deliver")
if not deliver or "fileNotices(sends, answers, s)" not in deliver:
    problems.append("deliver() no longer files what it sends: every notifier goes through it, and the archive is filed nowhere else.")
if len(re.findall(r"\bfileNotices\(", c)) != 2:
    problems.append("fileNotices is called from somewhere other than deliver().")
# Only noticeArchive, fileNotices and forgetNotices touch a person's list.
for m in re.finditer(r"noticeBlob\(", c):
    owner = c.rfind("function ", 0, m.start())
    name = re.match(r"function (\w+)", c[owner:]).group(1)
    if name not in ("fileNotices", "noticeArchive", "forgetNotices"):
        problems.append(f"{name} in lib.mjs touches somebody's past notifications.")
if re.search(r"""list\(\s*\{\s*prefix:\s*['"`]notices/""", c):
    problems.append("something in lib.mjs lists everybody's past notifications.")
archive = fn(c, "noticeArchive")
if not archive:
    problems.append("lib.mjs has no noticeArchive.")
else:
    if "forumReader(who)" not in archive:
        problems.append("noticeArchive answers a pass that is not a claimed username's.")
    if re.search(r"\bunread\b", archive) or "return out;" not in archive:
        problems.append("noticeArchive answers something besides the list, like a count.")
    for guard in ("roomAllows(who, room)", "forumAllows(who, cat)", "tasksAllow(who)", "seesEvent(who, ev)"):
        if guard not in archive:
            problems.append(f"noticeArchive reads words without asking {guard} first.")
    if re.search(r"kind === '(?:dm|props)'", archive):
        problems.append("noticeArchive reads the words of a direct message or props, which have their own places.")
for where, src in (("deleteAccount", fn(c, "deleteAccount") or ""), ("cb-pets.mjs (Forget me)", code(read("netlify/functions/cb-pets.mjs")))):
    if "forgetNotices(" not in src:
        problems.append(f"{where} leaves somebody's past notifications behind.")

# Only /cb/notices answers it, with the pass, and never a count.
fnsrc = code(read("netlify/functions/cb-notices.mjs"))
if "readPass(req)" not in fnsrc or "forumReader(who)" not in fnsrc:
    problems.append("cb-notices.mjs answers without a claimed username's pass.")
if "x-robots-tag" not in read("netlify/functions/cb-notices.mjs"):
    problems.append("cb-notices.mjs answers without asking search engines not to keep it.")
for f in sorted((ROOT / "netlify" / "functions").glob("*.mjs")):
    if f.name != "cb-notices.mjs" and re.search(r"\bnoticeArchive\b", code(f.read_text())):
        problems.append(f"{f.name} reads somebody's past notifications.")

# One wording, in the service worker and the radio.
def block(src, name):
    m = re.search(r"/\* notice-words:begin.*?\n(.*?)/\* notice-words:end \*/", src, re.S)
    if not m:
        problems.append(f"{name} has no notice-words block.")
        return None
    return textwrap.dedent(m.group(1)).strip()
sw, cb = read("cb-sw.js"), read("cb.js")
a, b = block(sw, "cb-sw.js"), block(cb, "cb.js")
if a and b and a != b:
    problems.append("the notice-words block in cb.js differs from cb-sw.js's: Your page would say a notification differently from the notification. Copy it across.")

# And the block stands on its own: run it, with the street's rooms, on one
# notification of every kind the server sends. A name it reaches outside the
# block works in the service worker and throws on Your page (placeOf did).
if a:
    import json, subprocess
    probe = r"""
const fs = require('fs');
const f = new Function(process.argv[1] + '; return noticeWords;')();
const rooms = JSON.parse(fs.readFileSync(process.argv[2], 'utf8')).rooms;
const w = f(() => Promise.resolve(rooms));
const kinds = [{ kind: 'message', why: 'mention', handle: 'A', room: '', what: '', id: 'm' }, { kind: 'call', room: 'world' },
  { kind: 'forum', why: 'mention', handle: 'A', cat: 'C', t: 't', p: 'p' }, { kind: 'props', handle: 'A' }, { kind: 'dm', handle: 'A' },
  { kind: 'task', why: 'assigned', did: 'changed', handle: 'A', task: '' }, { kind: 'event', why: 'new', id: 'e', room: 'world', at: 0, handle: 'A' },
  { kind: 'suggestion', to: 'asker', handle: 'A', id: 'x' }];
Promise.all(kinds.map((d) => Promise.resolve(w.say(d)))).then((out) => {
  if (out.some((x) => !x || !x.title || !x.url)) { console.log('a kind said nothing'); process.exit(1); }
}, (e) => { console.log(e.message); process.exit(1); });
"""
    try:
        r = subprocess.run(["node", "-e", probe, a[a.find("function noticeWords"):], str(ROOT / "cb-rooms.json")], capture_output=True, text=True, timeout=30)
        if r.returncode:
            problems.append("the notice-words block cannot say every kind on its own: " + (r.stdout or r.stderr).strip()[:200])
    except FileNotFoundError:
        problems.append("check-notices needs node to run the notice-words block.")

# The radio's part keeps nothing and counts nothing.
part = re.search(r"/\* PAST NOTIFICATIONS, on Your page.*?(?=Radio\.prototype\.newsTick)", cb, re.S)
if not part:
    problems.append("cb.js has no Past notifications part.")
else:
    p = code(part.group(0))
    if re.search(r"localStorage|sessionStorage|indexedDB", p):
        problems.append("cb.js keeps past notifications in the browser.")
    if re.search(r"""\.length\s*\+\s*['"]|['"]\s*\+\s*\w+\.length|\bunread\b""", p):
        problems.append("cb.js writes a number of past notifications.")
    if "innerHTML" in p:
        problems.append("cb.js draws past notifications with innerHTML.")
    if p.count("'/cb/notices'") < 1 or re.search(r"call\('/cb/(?!notices)", p):
        problems.append("the Past notifications part asks the street for something other than /cb/notices.")
if "function inYou()" not in cb or "if (inYou()) this.noticesTick();" not in cb:
    problems.append("cb.js does not dock the radio on Your page.")

# The page.
you = read("you.html")
if not re.search(r"<body[^>]*\bdata-cb-you\b", you) or "data-cb-dock" not in you:
    problems.append("you.html is not the radio docked: it needs data-cb-you on <body> and a data-cb-dock.")
css = read("cb.css")
for part_name in ("where", "channel", "here", "around", "events", "film"):
    if f".cb-radio--you.cb-radio--full .cb-set--parts .cb-sec--{part_name}" not in css:
        problems.append(f"cb.css shows the radio's {part_name} part on Your page, which is about you and not a room.")

# The privacy page says so.
priv = read("privacy.html")
sec = re.search(r'<li id="notification-archive">(.*?)</li>', priv, re.S)
if not sec:
    problems.append("privacy.html has no #notification-archive.")
else:
    t = sec.group(1)
    for said in ("never its words", "never how many", "nobody else is shown it", "30 days", "Forget me"):
        if said.lower() not in t.lower():
            problems.append(f"privacy.html#notification-archive no longer says “{said}”.")

if problems:
    print("check-notices: refused.")
    for p in problems:
        print("  · " + p)
    sys.exit(1)
print("past notifications: no words kept, only what was delivered, nobody else, one wording")
