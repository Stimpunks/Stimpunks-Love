#!/usr/bin/env python3
"""Build the Town Hall's doors, and each room's call panel, from data/town-hall.json.

Ryan's brief, 2026-09-29: a new location on the street, the Town Hall, with a
Fishbowl for community fishbowl meetings open to anybody with CB access, and
rooms for the Stimpunks Directors, Board Members and Moderators. Anybody can
walk into any of them. In the private ones the CB only shows for people signed
on with the moderators' password, the base.

WHICH ROOMS ARE PRIVATE IS DECIDED IN ONE PLACE, AND IT IS NOT HERE. It is
MOD_ROOMS in netlify/cb/lib.mjs, because that is the list the server checks
before it hands over a room's channel, its call or its beacons, and a page is
only the part that keeps quiet. This tool reads that array and refuses:
  · a room whose `for` disagrees with it, in either direction, and a name in
    MOD_ROOMS that no room here has. A room private on the page and open on
    the server is a lock painted on a door; open on the page and private on
    the server is a door that looks like it worked;
  · a private room whose page does not say data-cb="mods" on its <body>, and an
    open one that does. love.js reads that attribute to decide whether the
    radio comes into the room at all;
  · a private room's call panel without data-call-mods, which callroom.js reads
    to give everybody but the base the part that says the call is theirs;
  · an open room that is one of PUBLIC_CALLS. The Fishbowl is for the CB, and a
    guest with no pass cannot knock on it;
  · a room with no `what`, or with a `what` that is not a sentence. Every one is
    Ryan's own, word for word from the brief.

A ROOM WITH NO PAGE YET IS A DOOR NOT OPEN YET. It is on the rotunda's wall,
named and in full-strength words, with a dashed frame and no link: the
campgrounds' raising state, and The Den's rule that a door which is subtle is
never a door somebody cannot read.

Everything this writes is between markers: the doors in town-hall.html
(th-doors) and each room's call panel in its own page (<prefix>-call).
"""
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data/town-hall.json"
HALL = ROOT / "town-hall.html"
LIB = ROOT / "netlify/cb/lib.mjs"


def refuse(msg):
    raise SystemExit("REFUSING: " + msg)


def e(s):
    return html.escape(s, quote=True)


def array(name):
    m = re.search(r"export const " + name + r" = \[(.*?)\];", LIB.read_text(), re.S)
    if not m:
        refuse(f"netlify/cb/lib.mjs has no {name} array, so this tool cannot tell which rooms are "
               "whose. Put it back rather than restating it here.")
    return set(re.findall(r"'([a-z0-9-]+)'", m.group(1)))


def swap(src, where, marker, block):
    begin, end = f"<!-- {marker}:begin -->", f"<!-- {marker}:end -->"
    if begin not in src or end not in src:
        refuse(f"{where} has no {marker} markers, so there is nowhere to write.")
    return re.sub(re.escape(begin) + r".*?" + re.escape(end),
                  lambda m: begin + "\n" + block + "\n" + end, src, flags=re.S)


MODS = array("MOD_ROOMS")
PUBLIC = array("PUBLIC_CALLS")
data = json.loads(DATA.read_text())
rooms = data["rooms"]

seen = set()
for r in rooms:
    where = f"room {r.get('id')!r}"
    for f in ("id", "page", "name", "what", "for", "prefix", "body"):
        if not str(r.get(f, "")).strip():
            refuse(f"{where} has no `{f}`.")
    if r["id"] in seen:
        refuse(f"{where}: two rooms with one id.")
    seen.add(r["id"])
    if not r["what"].rstrip().endswith("."):
        refuse(f"{where}: `what` is Ryan's sentence from the brief and ends with a full stop.")
    tag = r["page"][:-5] if r["page"].endswith(".html") else ""
    if not tag.startswith("town-hall-"):
        refuse(f"{where}: {r['page']} is not a Town Hall page (town-hall-<something>.html).")
    r["tag"] = tag
    if r["for"] not in ("cb", "mods"):
        refuse(f"{where}: `for` is cb or mods, not {r['for']!r}.")
    if r["for"] == "mods" and tag not in MODS:
        refuse(f"{where} says it is the base's, and {tag} is not in MOD_ROOMS in netlify/cb/lib.mjs, "
               "so the server would hand its channel and call to anybody on the CB.")
    if r["for"] == "cb" and tag in MODS:
        refuse(f"{where} says it is for anybody on the CB, and MOD_ROOMS in netlify/cb/lib.mjs "
               "keeps it for the base, so its door would look like it worked.")
    if tag in PUBLIC:
        refuse(f"{where}: {tag} is in PUBLIC_CALLS, and no Town Hall room takes guests with no pass.")
for tag in MODS:
    if not any(r["tag"] == tag for r in rooms):
        refuse(f"MOD_ROOMS names {tag}, and data/town-hall.json has no room with that page.")


def access(r):
    if r["for"] == "mods":
        return ("Anybody can walk in. The radio and the call in there are for the base, "
                "signed on with the moderators&rsquo; password.")
    return "Anybody can walk in, and anybody signed on to the CB can talk there."


def door(r):
    built = (ROOT / r["page"]).exists()
    who = "th-door--mods" if r["for"] == "mods" else "th-door--cb"
    inner = [f'        <span class="th-door__name">{e(r["name"])}</span>',
             f'        <span class="th-door__what">{e(r["what"])}</span>',
             f'        <span class="th-door__who">{access(r)}</span>']
    if built:
        return "\n".join([f'    <li class="th-door {who}" id="door-{r["id"]}">',
                          f'      <a class="th-door__way" href="{e(r["page"])}">',
                          *inner,
                          f'        <span class="th-door__go">go in<span aria-hidden="true"> &rarr;</span></span>',
                          '      </a>',
                          '    </li>'])
    return "\n".join([f'    <li class="th-door th-door--raising {who}" id="door-{r["id"]}">',
                      '      <div class="th-door__way">',
                      *inner,
                      '        <span class="th-door__go">not open yet</span>',
                      '      </div>',
                      '    </li>'])


def panel(r):
    p, tag, name = r["prefix"], r["tag"], e(r["name"])
    if r["for"] == "mods":
        return "\n".join([
            f'    <div class="{p}-call" data-call="{tag}" data-call-name="{name}" data-call-mods>',
            '      <p>The channel and the call in here are for the base: people signed on at the Community Center with the moderators&rsquo; password. Anybody can come in and look around, and the radio waits outside the door for everybody else.</p>',
            f'      <p class="{p}-call__cb" data-call-cb hidden>This browser is not signed on as the base, so the call in here is not yours to join. The base signs on at <a href="community-center.html#cb-signon-desk">the front desk</a>.</p>',
            f'      <p class="{p}-call__member" data-call-join hidden><button type="button">Join the call as <b data-call-handle></b></button></p>',
            f'      <p class="{p}-call__said" role="status" data-call-said></p>',
            '      <noscript><p>Joining the call needs JavaScript: it opens in a window of its own on this page.</p></noscript>',
            f'      <p class="{p}-call__fine">The call is run by 8x8&rsquo;s Jitsi as a Service, and the server hands a pass into it to the base and nobody else. Camera and microphone start off, and we keep nothing about a call. <a href="privacy.html#calls">What goes where.</a></p>',
            '    </div>'])
    return "\n".join([
        f'    <div class="{p}-call" data-call="{tag}" data-call-name="{name}">',
        '      <p>The call in here is for people signed on to the CB. Anybody can come in and look around; to talk, and to be in the circle, you need the CB, and <a href="community-center.html#meeting-hall">the Community Center</a> says how to get on it.</p>',
        f'      <p class="{p}-call__cb" data-call-cb hidden>You are not signed on to the CB in this browser. <a href="community-center.html">Sign on at the Community Center</a>, then come back and the way in is here.</p>',
        f'      <p class="{p}-call__member" data-call-join hidden><button type="button">Join the call as <b data-call-handle></b></button></p>',
        f'      <p class="{p}-call__said" role="status" data-call-said></p>',
        '      <noscript><p>Joining the call needs JavaScript: it opens in a window of its own on this page.</p></noscript>',
        f'      <p class="{p}-call__fine">The call is run by 8x8&rsquo;s Jitsi as a Service. Your camera and microphone start off, the name you are called by goes to 8x8 inside your pass into the call, and we keep nothing about a call. <a href="privacy.html#calls">What goes where.</a></p>',
        '    </div>'])


hall = HALL.read_text()
hall = swap(hall, HALL.name, "th-doors", "\n".join(door(r) for r in rooms))
HALL.write_text(hall)

built = 0
for r in rooms:
    page = ROOT / r["page"]
    if not page.exists():
        continue
    built += 1
    src = page.read_text()
    body = re.search(r"<body\b[^>]*>", src)
    if not body:
        refuse(f"{r['page']} has no <body>.")
    cb = re.search(r'data-cb="([a-z]+)"', body.group(0))
    if r["for"] == "mods" and not (cb and cb.group(1) == "mods"):
        refuse(f'{r["page"]} is the base\'s and its <body> does not say data-cb="mods", so the radio '
               "would walk into the room with everybody.")
    if r["for"] == "cb" and cb and cb.group(1) == "mods":
        refuse(f'{r["page"]} is for anybody on the CB and its <body> says data-cb="mods".')
    if f'class="{r["body"]}' not in body.group(0):
        refuse(f"{r['page']}'s <body> does not wear {r['body']}, the class its card and section are built on.")
    if e(r["what"]).replace("&#x27;", "&rsquo;") not in src and r["what"] not in src:
        refuse(f"{r['page']} does not say its own line, which is Ryan's, word for word: {r['what']!r}")
    src = swap(src, r["page"], f"{r['prefix']}-call", panel(r))
    for a in re.findall(r'<a [^>]*class="backlink"[^>]*>', src):
        if 'href="town-hall.html' not in a:
            refuse(f"{r['page']}'s way back goes somewhere other than the Town Hall: {a}")
    if 'class="backlink"' not in src:
        refuse(f"{r['page']} has no way back to the Town Hall.")
    if 'src="callroom.js"' not in src:
        refuse(f"{r['page']} has a call panel and does not load callroom.js, so nothing would ever unhide it.")
    page.write_text(src)

print(f"town hall: {len(rooms) - built} door(s) not open yet, {built} room(s) written; "
      "every room agrees with MOD_ROOMS in netlify/cb/lib.mjs.")
