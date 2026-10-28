#!/usr/bin/env python3
"""Write the chat page's channel groups, and hold the chat page to what it says.

Ryan's ask, 2026-10-22: "a /chat page with a Discord style interface for our
room chat channels", with the channels in groups:

  · COMMUNITY: World, the Community Center, Community Care (the street's room
    for asking for mutual aid, peer support and other help, Ryan's, the same
    day), Coping (the eye of the storm, for talking about coping, Ryan's,
    2026-10-24), Pets (for talking about your animals, Ryan's, the same day),
    Show Your Work (where our community shows what it is making, Ryan's,
    2026-10-23), Volunteers (for volunteering with Stimpunks, Ryan's,
    2026-10-27), and every room at Cavendish Coworking. Dead Tired
    Society was in Community from 2026-10-22 and came out of it on 2026-10-24,
    Ryan's call, so that it does not compete with Coping; it is still under its
    tags, Coping and Calm, like every other room.
  · STAFF: the Town Hall's private rooms, and Tasks and the Office (Ryan's
    ask, 2026-10-26), whose channels are their pages' readers'.
  · EVERY ROOM BUT STAFF'S AND WORLD, BY ITS TAGS (Ryan's ask, 2026-10-24,
    "Give rooms tags and use those tags to group them in /chat", replacing the
    one group called World that held everything else; and the same morning,
    "Tag Community's rooms as well", so Community's are in Community and under
    their tags too). data/room-tags.json gives every room on
    the street's list its tags, says what each tag means and the order the
    groups come in, and a room is under every tag it has, A to Z unless the reader
    chooses Recently active or Most active (cb.js, chatSorted, 2026-10-24). Ryan's
    come first, Music to Make/build; the rest were added so every room has one
    that is true of it. The forums' public categories follow The forums wherever it
    is, as everywhere on the radio.

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
in cb-rooms.json is in the groups its tags name, out of data/room-tags.json.
Never hand-edit between the markers.

The channels under tags are A to Z, by activity (/cb/chat-order, two orders and
never a time or a count) or in a claimed username's own order (/cb/chat-arrange,
kept under the username with nothing about when, never a quiet room, deleted
with it); this tool refuses each of those promises broken, and arranging that
is dragging alone.

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
  · A ROOM WITH NO TAG, A TAG ON NO ROOM, OR A TAG THE LIST DOES NOT HAVE. A
    new room on the street's list with no entry in data/room-tags.json would
    sit in no group but the radio's fallback, so this stops until it has one.
    A Staff room is refused a tag, because a tag group is listed for anybody
    and the chat lists a Staff room only for a pass that can go in; so is
    World, which is the whole street's channel and first in Community, and the
    chat page itself. A page the street's list does not have is refused too.
  · MUSIC OR VIDEOS ON A ROOM WITH NOTHING TO PRESS AND PLAY, or a room on the
    Now Playing bill with neither. Those two tags are the only ones something
    else on the street can check, so they are checked against
    data/now-playing.json both ways: a tag is a claim about a room, and this
    one is a claim somebody pressing will test.
  · A ROOM CALLED events. The chat page's #events is its Events, the list of
    scheduled events at the top of the channels (cb.js, evFromHash; Ryan's
    ask, 2026-10-23), so a room with that tag would be a channel nobody could
    pick there. And cb.js must still read #events before it reads a channel.

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
TAGS = ROOT / "data" / "room-tags.json"
PLAYING = ROOT / "data" / "now-playing.json"
LIB = ROOT / "netlify" / "cb" / "lib.mjs"
CB = ROOT / "cb.js"
HOUSE = "cavendish-coworking.html"
# Community's rooms beside World and Cavendish's, in this order (Ryan, 2026-10-22;
# Coping in and Dead Tired Society out, 2026-10-24; Pets in, the same day;
# Volunteers in, 2026-10-27).
COMMUNITY = ["community-center.html", "community-care.html", "coping.html", "pets.html", "show-your-work.html",
             "volunteers.html"]

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

# STAFF: MOD_ROOMS, the Town Hall's private rooms and Tasks' and the Office's, never one that keeps to itself.
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
# THE TELEPORTER'S #CHANNELS read which rooms are staff's off cb-rooms.json, where
# make-sitemap.py writes it from each page's <body>, because off this page the
# radio has no other list (Ryan's ask, 2026-10-28). The two must be one list, or
# the teleporter offers a channel this page would not, or the other way round.
said = {r["tag"]: r["staff"] for r in rooms if "staff" in r}
held = {x["tag"]: {"roles": sorted(x["roles"]), "strict": x["strict"]} for x in staff}
for t in sorted(set(said) | set(held)):
    a = said.get(t)
    a = a and {"roles": sorted(a.get("roles", [])), "strict": a.get("strict") is True}
    if a != held.get(t):
        refuse(f"cb-rooms.json says #{t}'s channel is for {a or 'everybody'}, and MOD_ROOMS and STRICT_ROOMS "
               f"say {held.get(t) or 'everybody'}. Make the page's data-cb, data-cb-role and data-cb-strict "
               "agree with the server, then run tools/make-sitemap.py.")
for t in community + [x["tag"] for x in staff]:
    if t in quiet:
        refuse(f"{t} keeps to itself (QUIET_ROOMS), and this page is public: it cannot be listed here.")

stem = PAGE.stem

# EVERY OTHER ROOM, BY ITS TAGS. A room is a page on the street's list, named by
# its file (the street's own page is index.html, whose #tag is street).
def page_of(room):
    return "index.html" if room["path"] == "/" else room["path"].lstrip("/")


tagdoc = json.loads(TAGS.read_text())
by_page = {page_of(r): r["tag"] for r in rooms}
vocab, names = [], set()
for t in tagdoc.get("tags", []):
    k, n = t.get("key"), t.get("name")
    if not isinstance(k, str) or not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", k):
        refuse(f"{TAGS.name}: a tag's key must be lower case letters, digits and hyphens, and {k!r} is not.")
        continue
    if not isinstance(n, str) or not n.strip():
        refuse(f"{TAGS.name}: the tag {k} has no name to show on the chat.")
        continue
    if not isinstance(t.get("means"), str) or not t["means"].strip():
        refuse(f"{TAGS.name}: the tag {k} does not say what it means, so the next room cannot be tagged by it.")
    if k in [v["key"] for v in vocab] or n.casefold() in names:
        refuse(f"{TAGS.name}: the tag {k} ({n}) is listed twice.")
        continue
    names.add(n.casefold())
    vocab.append({"key": k, "name": n.strip()})
known = {v["key"] for v in vocab}
grouped = set(mods) | ({world} if world else set())
tagged = {v["key"]: [] for v in vocab}
given = tagdoc.get("rooms", {})
for p, ts in given.items():
    t = by_page.get(p)
    if t is None:
        refuse(f"{TAGS.name} tags {p}, and the street's list (cb-rooms.json) has no such room.")
        continue
    if t in grouped or t == stem:
        refuse(f"{TAGS.name} tags {p}, which is a Staff room, World or the chat itself, and those are never under a tag: take its tags off.")
        continue
    if not isinstance(ts, list) or not ts:
        refuse(f"{TAGS.name}: {p} has no tags.")
        continue
    if len(set(ts)) != len(ts):
        refuse(f"{TAGS.name}: {p} has a tag twice.")
    for k in ts:
        if k not in known:
            refuse(f"{TAGS.name}: {p} has the tag {k!r}, which its list of tags does not have.")
for r in rooms:
    p, t = page_of(r), r["tag"]
    if t in grouped or t == stem:
        continue
    if p not in given:
        refuse(f"{p} is on the street's list and has no tags in {TAGS.name}, so the chat has no group for it. Give it the tags that are true of it.")
for r in rooms:
    for k in given.get(page_of(r)) or []:
        if k in tagged and r["tag"] not in tagged[k]:
            tagged[k].append(r["tag"])
for v in vocab:
    if not tagged[v["key"]]:
        refuse(f"{TAGS.name}: no room has the tag {v['key']}, so the chat would show an empty group. Use it or take it off the list.")

# MUSIC AND VIDEOS ARE THINGS TO PRESS AND PLAY, AND NOW PLAYING KNOWS WHICH ROOMS HAVE THEM.
venues = {v.get("page") for v in json.loads(PLAYING.read_text()).get("venues", [])}
for p, ts in given.items():
    if not isinstance(ts, list) or p not in by_page:
        continue
    plays = [k for k in ("music", "videos") if k in ts]
    if plays and p not in venues:
        refuse(f"{TAGS.name}: {p} is tagged {' and '.join(plays)}, and Now Playing says it has nothing to press and play.")
for p in sorted(venues):
    t = by_page.get(p)
    if t is None or t in grouped:
        continue
    if not any(k in (given.get(p) or []) for k in ("music", "videos")):
        refuse(f"{TAGS.name}: {p} is on the Now Playing bill, so it has something to press and play, and it is tagged neither music nor videos.")

# cb.js keeps its promises about this page.
m = re.search(r"var CHAT_PAGE = '([a-z0-9-]+)'", cb)
if not m or m.group(1) != stem:
    refuse(f"cb.js must say CHAT_PAGE = '{stem}', the chat page's own name, so the page is never a channel on itself.")
own = re.search(r"var CHAT_OWN = \[(.*?)\];", cb, re.S)
kept = set(re.findall(r"'([a-z]+)'", own.group(1))) if own else set()
for k in ("folded", "size", "small", "popped", "band", "x", "y"):
    if k not in kept:
        refuse(f"cb.js: CHAT_OWN must keep '{k}' as the other pages left it; without it the chat page changes the radio everywhere.")
# Your page (2026-10-25) is docked the same way, so save() may ask docked(), which must take in the chat page.
if not (re.search(r"function save\(v\) \{[^}]*inChat\(\)", cb, re.S)
        or (re.search(r"function save\(v\) \{[^}]*docked\(\)", cb, re.S) and re.search(r"function docked\(\) \{ return inChat\(\) \|\|", cb))):
    refuse("cb.js: save() must write back CHAT_OWN's keys as they are stored when it is on the chat page.")
if "data-chat-groups" not in cb:
    refuse("cb.js must read the groups this tool writes, data-chat-groups.")
if "events" in order:
    refuse("cb-rooms.json has a room called events, and the chat page's #events is its list of events: rename the room.")
if "function evFromHash()" not in cb or "var evAt = evFromHash();" not in cb:
    refuse("cb.js must read #events as the chat page's Events (evFromHash in chatTake) before it reads a channel.")
fr = re.search(r"export function forumRooms\(.*?\n\}", lib, re.S)
if not fr or "locked: true" not in fr.group(0):
    refuse(f"{LIB.name}: forumRooms must say which categories are locked, so the chat lists them under Staff.")

src = PAGE.read_text()
if not re.search(r"<body[^>]*\bdata-cb-chat\b", src):
    refuse(f"{PAGE.name}: its <body> must say data-cb-chat, or cb.js floats the radio over it like any page.")
begin, end = "<!-- chat:dock:begin -->", "<!-- chat:dock:end -->"
if begin not in src or end not in src:
    refuse(f"{PAGE.name} has no chat:dock markers to write between.")

# THE ORDERS (2026-10-24). By activity: two orders, never a time or a count.
# My own order: kept under the claimed username, groups and channels and
# nothing about when, never a room that keeps to itself, shown to nobody else,
# deleted with the username and by Forget me, and arranged with Move buttons
# and the keyboard as well as by dragging. privacy.html#chat-order says so.
lib_src = LIB.read_text()
def _code(t):
    return re.sub(r"//[^\n]*", "", re.sub(r"/\*.*?\*/", "", t, flags=re.S))
act = re.search(r"export async function channelActivity\(.*?\n\}", lib_src, re.S)
if not act or "return { recent, active };" not in act.group(0):
    refuse("channelActivity in lib.mjs must answer two orders, { recent, active }, and nothing else: never a time or a count.")
own = re.search(r"export const CHAT_ORDER_GROUPS.*?export async function forgetChatOrder\(.*?\n\}", lib_src, re.S)
if not own:
    refuse("lib.mjs has no part for My own order (CHAT_ORDER_GROUPS to forgetChatOrder) for this tool to hold.")
else:
    oc = _code(own.group(0))
    writes = re.findall(r"updateDoc\(chatOrderBlob\([^)]*\)\),\s*\(\)\s*=>\s*\(([^;]*)\),\s*s\)", oc)
    if writes != ["empty ? false : { groups: clean }"]:
        refuse(f"My own order is written as {writes}: it holds {{ groups }} and nothing else, so nothing about when is ever kept.")
    if re.search(r"\bnow\b|Date\.now", oc):
        refuse("My own order's code in lib.mjs reads the clock: it keeps nothing about when.")
    if "quietRoom(tag)" not in oc:
        refuse("cleanChatOrder in lib.mjs must leave out a room that keeps to itself, whose tag is its address.")
    if oc.count("if (!forumReader(who))") < 2:
        refuse("readChatOrder and keepChatOrder in lib.mjs must each refuse anything but a claimed username.")
da = re.search(r"export async function deleteAccount\(.*?\n\}", lib_src, re.S)
if not da or "await forgetChatOrder(petKey(handle), s);" not in da.group(0):
    refuse("deleting a username (deleteAccount in lib.mjs) no longer deletes its own order for the chat page.")
if "forgetChatOrder(pk)" not in (ROOT / "netlify/functions/cb-pets.mjs").read_text():
    refuse("Forget me (cb-pets.mjs) no longer deletes the own order for the chat page.")
if 'id="chat-order"' not in (ROOT / "privacy.html").read_text():
    refuse("privacy.html has no #chat-order saying what My own order keeps, which it must say before the order is kept.")
cb_code = _code(CB.read_text())
if "cb-chan-move" not in cb_code or "e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')" not in cb_code:
    refuse("cb.js: arranging must keep Move up and Move down beside each channel, and Alt and an arrow on one, "
           "as well as dragging, which shuts out a keyboard, a screen reader and a phone.")

if problems:
    print("make-chat.py refused:")
    for p in problems:
        print("  · " + p)
    sys.exit(1)

groups = json.dumps({"community": community, "staff": staff,
                     "tagged": [dict(v, rooms=tagged[v["key"]]) for v in vocab]},
                    ensure_ascii=False, separators=(",", ":"))
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
print("make-chat.py: the chat's groups agree with the street's rooms, Cavendish Coworking's, MOD_ROOMS and every room's tags.")
