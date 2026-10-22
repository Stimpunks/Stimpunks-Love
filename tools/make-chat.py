#!/usr/bin/env python3
"""Write the chat page's channel groups, and hold the chat page to what it says.

Ryan's ask, 2026-10-22: "a /chat page with a Discord style interface for our
room chat channels", with the channels in three groups:

  · COMMUNITY: World, the Community Center and Dead Tired Society (Ryan's
    addition, the same day), Community Care (the street's room for asking for
    mutual aid, peer support and other help, Ryan's, the same day), and every
    room at Cavendish Coworking.
  · STAFF: the Town Hall's private rooms.
  · WORLD: everything else.

chat.html is the radio on a page of its own (cb.js, inChat): docked into the
page at Full, with every room's channel down its left. This tool writes the
groups the page cannot work out for itself onto [data-cb-dock], between the
chat:dock markers, and cb.js reads them there: Community's rooms out of
data/coworking.json (the house and every door and suite in it), in the street's
walking order after World; Staff's out of MOD_ROOMS in netlify/cb/lib.mjs, with
the roles each takes and whether the administrator key opens it, as the Town
Hall pages carry them, so the page lists a room only for a pass that can go in.
The forums' locked categories join Staff on the page itself, because the server
names a category only to its readers (forumRooms, `locked`). Every other room
in cb-rooms.json is World's. Never hand-edit between the markers.

WHAT IT REFUSES, because a friendly edit could break each without a test
noticing:

  · A ROOM IN A GROUP THAT THE STREET'S LIST DOES NOT HAVE. A door or a suite
    at Cavendish, or a private Town Hall room, missing from cb-rooms.json would
    drop out of the chat without a word.
  · A ROOM THAT KEEPS TO ITSELF ON THE PAGE. QUIET_ROOMS can be locked too
    (the cabin), and this page is public: naming one here would list the
    address the room exists not to have. check-unlisted.py would refuse it as
    well; this refuses it before writing.
  · THE PAGE NOT SAYING IT IS THE CHAT: no data-cb-chat on its <body>, or no
    markers to write between.
  · cb.js FORGETTING WHAT IT PROMISES HERE: the page's own name as CHAT_PAGE,
    and CHAT_OWN keeping the other pages' radio as they left it (folded, size,
    where it sits, World or This room, popped out). The friendly edit is to let
    the chat page save the radio's size "so it opens the same next time", and
    that resizes the radio on every other page.
  · forumRooms NOT SAYING WHICH CATEGORIES ARE LOCKED, so a staff category
    would sit under World.

IF THIS REFUSES: fix the cause. Do not widen a list to make it quiet.
"""
import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGE = ROOT / "chat.html"
ROOMS = ROOT / "cb-rooms.json"
COWORKING = ROOT / "data" / "coworking.json"
LIB = ROOT / "netlify" / "cb" / "lib.mjs"
CB = ROOT / "cb.js"
HOUSE = "cavendish-coworking.html"
# Community's rooms beside World and Cavendish's, in this order (Ryan, 2026-10-22).
COMMUNITY = ["community-center.html", "dead-tired-society.html", "community-care.html"]

problems = []


def refuse(msg):
    problems.append(msg)


def lib_array(src, name):
    m = re.search(r"export const " + name + r" = \[(.*?)\];", src, re.S)
    if not m:
        refuse(f"{LIB.name} has no {name} array to read.")
        return []
    return re.findall(r"'([a-z0-9-]+)'", m.group(1))


def lib_rolemap(src, name):
    m = re.search(r"export const " + name + r" = \{(.*?)\};", src, re.S)
    if not m:
        refuse(f"{LIB.name} has no {name} map to read.")
        return {}
    return {tag: re.findall(r"'([a-z]+)'", roles)
            for tag, roles in re.findall(r"'([a-z0-9-]+)':\s*\[([^\]]*)\]", m.group(1))}


def tag_of(page):
    return re.sub(r"\.html$", "", page)


lib = LIB.read_text()
cb = CB.read_text()
rooms = json.loads(ROOMS.read_text())["rooms"]
order = {r["tag"]: i for i, r in enumerate(rooms)}

world = re.search(r"var WORLD_CALL = '([a-z0-9-]+)'", cb)
world = world.group(1) if world else None
if not world:
    refuse("cb.js has no WORLD_CALL, so this tool cannot tell which channel is World.")

# COMMUNITY: World, the rooms named above, then the house at Cavendish and every room in it.
# The house is make-coworking.py's page; its doors and suites are the data's.
cw = json.loads(COWORKING.read_text())
pages = [HOUSE] + [d.get("page") for d in cw.get("doors", [])] + [x.get("page") for x in cw.get("suites", [])]
cav = []
for p in pages:
    if not isinstance(p, str) or not p.endswith(".html"):
        refuse(f"{COWORKING.name}: every door and suite needs a page, and one has none.")
        continue
    t = tag_of(p)
    if t not in order:
        refuse(f"{COWORKING.name} names {p}, and cb-rooms.json has no such room, so the chat would drop it.")
        continue
    if t not in cav:
        cav.append(t)
named = []
for p in COMMUNITY:
    t = tag_of(p)
    if t not in order:
        refuse(f"Community names {p}, and cb-rooms.json has no such room, so the chat would drop it.")
    elif t not in named and t not in cav:
        named.append(t)
community = [world] + named + sorted(cav, key=lambda t: order[t]) if world else []

# STAFF: the Town Hall's private rooms, never one that keeps to itself.
mods = lib_rolemap(lib, "MOD_ROOMS")
strict = set(lib_array(lib, "STRICT_ROOMS"))
quiet = set(lib_array(lib, "QUIET_ROOMS"))
staff = []
for t, roles in mods.items():
    if t in quiet:
        continue
    if t not in order:
        refuse(f"MOD_ROOMS names {t}, and cb-rooms.json has no such room, so the chat would drop it.")
        continue
    if not roles:
        refuse(f"MOD_ROOMS gives {t} no roles.")
        continue
    staff.append({"tag": t, "roles": roles, "strict": t in strict})
staff.sort(key=lambda x: order[x["tag"]])
for t in community + [x["tag"] for x in staff]:
    if t in quiet:
        refuse(f"{t} keeps to itself (QUIET_ROOMS), and this page is public: it cannot be listed here.")

# cb.js keeps its promises about this page.
stem = PAGE.stem
m = re.search(r"var CHAT_PAGE = '([a-z0-9-]+)'", cb)
if not m or m.group(1) != stem:
    refuse(f"cb.js must say CHAT_PAGE = '{stem}', the chat page's own name, so the page is never a channel on itself.")
own = re.search(r"var CHAT_OWN = \[(.*?)\];", cb, re.S)
kept = set(re.findall(r"'([a-z]+)'", own.group(1))) if own else set()
for k in ("folded", "size", "small", "popped", "band", "x", "y"):
    if k not in kept:
        refuse(f"cb.js: CHAT_OWN must keep '{k}' as the other pages left it; without it the chat page changes the radio everywhere.")
if not re.search(r"function save\(v\) \{[^}]*inChat\(\)", cb, re.S):
    refuse("cb.js: save() must write back CHAT_OWN's keys as they are stored when it is on the chat page.")
if "data-chat-groups" not in cb:
    refuse("cb.js must read the groups this tool writes, data-chat-groups.")
fr = re.search(r"export function forumRooms\(.*?\n\}", lib, re.S)
if not fr or "locked: true" not in fr.group(0):
    refuse(f"{LIB.name}: forumRooms must say which categories are locked, so the chat lists them under Staff.")

src = PAGE.read_text()
if not re.search(r"<body[^>]*\bdata-cb-chat\b", src):
    refuse(f"{PAGE.name}: its <body> must say data-cb-chat, or cb.js floats the radio over it like any page.")
begin, end = "<!-- chat:dock:begin -->", "<!-- chat:dock:end -->"
if begin not in src or end not in src:
    refuse(f"{PAGE.name} has no chat:dock markers to write between.")

if problems:
    print("make-chat.py refused:")
    for p in problems:
        print("  · " + p)
    sys.exit(1)

groups = json.dumps({"community": community, "staff": staff}, separators=(",", ":"))
block = (
    f'  <div data-cb-dock data-chat-groups="{html.escape(groups, quote=True)}" style="margin-top:24px;">\n'
    '    <p>The chat opens here for anybody signed on to the CB in this browser. Not on the CB yet? It is by invite: '
    '<a href="community-center.html#getting-started">Getting started</a> says how to ask for one, and an invite&rsquo;s '
    'link brings you to <a href="join.html">Join the CB</a>, where you choose a username and a password of your own.</p>\n'
    '    <noscript><p>The chat is the CB&rsquo;s, and it needs JavaScript to be heard at all.</p></noscript>\n'
    '  </div>'
)
new = re.sub(re.escape(begin) + r".*?" + re.escape(end),
             lambda _: begin + "\n" + block + "\n  " + end, src, flags=re.S)
if new != src:
    PAGE.write_text(new)
    print(f"make-chat.py: wrote the channel groups into {PAGE.name}.")
print("make-chat.py: the chat's groups agree with the street's rooms, Cavendish Coworking's and MOD_ROOMS.")
