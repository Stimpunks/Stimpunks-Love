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
import datetime
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data/town-hall.json"
HALL = ROOT / "town-hall.html"
LIB = ROOT / "netlify/cb/lib.mjs"
ABOUT = "https://stimpunks.org/about/"
PAGES = Path.home() / "Documents/Claude/Projects/Stimpunks Knowledge System/site/stimpunks.org/pages"
MIRROR_ABOUT = PAGES / "about.md"


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


def rolemap(name):
    """MOD_ROOMS is a map from room to the list of roles it takes."""
    m = re.search(r"export const " + name + r" = \{(.*?)\};", LIB.read_text(), re.S)
    if not m:
        refuse(f"netlify/cb/lib.mjs has no {name} map, so this tool cannot tell which rooms need which "
               "role. Put it back rather than restating it here.")
    return {tag: re.findall(r"'([a-z]+)'", roles)
            for tag, roles in re.findall(r"'([a-z0-9-]+)':\s*\[([^\]]*)\]", m.group(1))}


ROLE_WORDS = {"moderator", "board", "director"}


def who_for(roles):
    """The people a room is for, in words."""
    if roles == ["moderator"]:
        return "any moderator"   # administrators are moderators already
    named = [x for x in roles if x != "moderator"]
    said = named[0] if len(named) == 1 else " or ".join([", ".join(named[:-1]), named[-1]])
    return f"moderators with the {said} role"


def swap(src, where, marker, block):
    begin, end = f"<!-- {marker}:begin -->", f"<!-- {marker}:end -->"
    if begin not in src or end not in src:
        refuse(f"{where} has no {marker} markers, so there is nowhere to write.")
    return re.sub(re.escape(begin) + r".*?" + re.escape(end),
                  lambda m: begin + "\n" + block + "\n" + end, src, flags=re.S)


about = MIRROR_ABOUT.read_text() if MIRROR_ABOUT.exists() else None
MODS = rolemap("MOD_ROOMS")
STRICT = array("STRICT_ROOMS")
PUBLIC = array("PUBLIC_CALLS")
# A room that keeps to itself (QUIET_ROOMS) may be locked too, and is not this
# tool's: the cabin behind the door marked E is held to MOD_ROOMS by
# tools/make-secret-cabin.py, which refuses its pages if they disagree. Every
# other name in MOD_ROOMS still has to be a room here.
QUIET = array("QUIET_ROOMS")
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
    r["mods"] = r["for"] != "cb"
    if r["mods"] and (not isinstance(r["for"], list) or not r["for"] or not set(r["for"]) <= ROLE_WORDS):
        refuse(f"{where}: `for` is cb or a list of roles from {sorted(ROLE_WORDS)}, not {r['for']!r}.")
    if bool(r.get("strict")) != (tag in STRICT):
        refuse(f"{where}: `strict` is {bool(r.get('strict'))} here and STRICT_ROOMS in netlify/cb/lib.mjs "
               f"{'has' if tag in STRICT else 'does not have'} {tag}, so the administrator key would open one and not the other.")
    if r["mods"] and sorted(MODS.get(tag, [])) != sorted(r["for"]):
        refuse(f"{where} says it takes {r['for']}, and MOD_ROOMS in netlify/cb/lib.mjs gives "
               f"{tag} {MODS.get(tag)!r}, so the page and the server would disagree about who is let in.")
    if r["for"] == "cb" and tag in MODS:
        refuse(f"{where} says it is for anybody on the CB, and MOD_ROOMS in netlify/cb/lib.mjs "
               "keeps it for the base, so its door would look like it worked.")
    if tag in PUBLIC:
        refuse(f"{where}: {tag} is in PUBLIC_CALLS, and no Town Hall room takes guests with no pass.")
for tag in MODS:
    if not any(r["tag"] == tag for r in rooms) and tag not in QUIET:
        refuse(f"MOD_ROOMS names {tag}, and data/town-hall.json has no room with that page.")


def access(r):
    if r["mods"]:
        return (f"Anybody can walk in. The radio and the call in there are for {who_for(r['for'])}"
                + (", and nobody else: not even an administrator." if r.get("strict") else
                   "." if r["for"] == ["moderator"] else ", and for administrators."))
    return "Anybody can walk in, and anybody signed on to the CB can talk there."


def door(r):
    built = (ROOT / r["page"]).exists()
    who = "th-door--mods" if r["mods"] else "th-door--cb"
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


def people(r):
    """Who a room is for: in the order, and with the titles, of the page it
    came from, each linked to their own section of stimpunks.org/about/."""
    src_page = r.get("people_from") or {}
    for f in ("url", "mirror", "called"):
        if not src_page.get(f):
            refuse(f"room {r['id']!r} lists people and its `people_from` has no `{f}`.")
    listed = (PAGES / src_page["mirror"]).read_text() if (PAGES / src_page["mirror"]).exists() else None
    if listed is not None:
        at = [listed.find(x["name"]) for x in r["people"]]
        if -1 in at:
            gone = r["people"][at.index(-1)]["name"]
            refuse(f"room {r['id']!r}: {gone} is not on {src_page['mirror']} any more. Re-read it.")
        if at != sorted(at):
            refuse(f"room {r['id']!r}: its people are not in the order {src_page['mirror']} gives them.")
    rows = []
    for x in r["people"]:
        for f in ("name", "title", "anchor"):
            if not str(x.get(f, "")).strip():
                refuse(f"room {r['id']!r}: somebody on its list has no `{f}`.")
        if about is not None and f"(#{x['anchor']})" not in about:
            refuse(f"room {r['id']!r}: #{x['anchor']} ({x['name']}) is not on our About page any more. "
                   "Re-read stimpunks.org/about/ rather than keeping a link that lands at the top of it.")
        if about is not None and x["name"] not in about:
            refuse(f"room {r['id']!r}: {x['name']} is not named on our About page.")
        rows.append(f'      <li><a href="{ABOUT}#{e(x["anchor"])}"><b>{e(x["name"])}</b></a>, {e(x["title"])}</li>')
    p = r["prefix"]
    return "\n".join([f'    <ul class="{p}-people">', *rows, '    </ul>',
                      f'    <p class="{p}-people__from">As <a href="{e(src_page["url"])}">{src_page["called"]}</a> '
                      f'lists them, in its order and with its titles, read on {e(r["people_read"])}.'
                      + ('' if src_page["mirror"] == "about.md" else
                         f' Each name goes to their own section of <a href="{ABOUT}">our About page</a>.')
                      + '</p>'])


def md_plain(t):
    """A mirror page as plain words: links down to their text, bold and
    italic marks gone, runs of space folded, so a sentence can be looked for."""
    t = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", t)
    t = t.replace("**", "").replace("__", "")
    return re.sub(r"\s+", " ", t)


def governance(r):
    """A section of one of our own stimpunks.org pages, word for word, every
    sentence and link looked for in the mirror's copy of that page."""
    g = r["governance"]
    src_page = g["from"]
    mirror = PAGES / src_page["mirror"]
    if mirror.exists():
        raw = mirror.read_text()
        start = raw.find("## " + src_page["heading"])
        if start < 0:
            refuse(f"room {r['id']!r}: {src_page['mirror']} has no section headed {src_page['heading']!r} any more.")
        nxt = raw.find("\n## ", start + 3)
        section = raw[start:nxt if nxt > 0 else None]
        plain = md_plain(section)
        for t in g["lede"] + g["close"] + [x.get("note", "") for x in g["items"]] + [x["name"] for x in g["items"]]:
            if t and md_plain(t) not in plain:
                refuse(f"room {r['id']!r}: {t[:70]!r} is not in the {src_page['heading']} section of "
                       f"{src_page['mirror']} any more. Re-copy the section rather than keeping words the page dropped.")
        for x in g["items"]:
            rel = x["url"].replace("https://stimpunks.org", "")
            if x["url"] not in section and f"({rel})" not in section:
                refuse(f"room {r['id']!r}: {x['name']} no longer links to {x['url']} on {src_page['mirror']}.")
    p = r["prefix"]
    def linked(t):
        t = e(t)
        for words, url in g.get("close_links", {}).items():
            t = t.replace(e(words), f'<a href="{e(url)}">{e(words)}</a>', 1)
        return t
    # A link the page has that goes nowhere is left off, and the data says so.
    rows = []
    for x in g["items"]:
        note = f' &mdash; {e(x["note"])}' if x.get("note") else ""
        rows.append(f'      <li><a href="{e(x["url"])}"><b>{e(x["name"])}</b></a>{note}</li>')
    return "\n".join([f'    <div class="{p}-gov">',
                      *[f'    <p>{e(t)}</p>' for t in g["lede"]],
                      f'    <ul class="{p}-gov__list">', *rows, '    </ul>',
                      *[f'    <p>{linked(t)}</p>' for t in g["close"]],
                      f'    <p class="{p}-gov__from">This section is <a href="{e(src_page["url"])}">{src_page["called"]}</a>&rsquo;s, '
                      f'word for word, read on {e(g["read"])}.</p>',
                      '    </div>'])


def agenda(r):
    """The outline of a room's meeting: the date, the decisions required, and
    the order of business with its timings. A meeting whose date has gone by
    is written in the past tense, so it never reads as the next one."""
    a = r["agenda"]
    try:
        day = datetime.date.fromisoformat(a["date"])
    except (KeyError, ValueError):
        refuse(f"room {r['id']!r}: its agenda has no date, or one that is not YYYY-MM-DD.")
    if not a.get("decisions") or not a.get("order"):
        refuse(f"room {r['id']!r}: an agenda needs its decisions and its order of business.")
    for num, item, minutes in a["order"]:
        if not isinstance(minutes, int) or minutes <= 0:
            refuse(f"room {r['id']!r}: {item!r} on the agenda has no time given.")
    said = f"{day.strftime('%A')} {day.day} {day.strftime('%B %Y')}"
    past = day < datetime.date.today()
    draft = " draft" if a.get("status") == "draft" else ""
    p = r["prefix"]
    head = (f"The{draft} agenda of the meeting on {said}" if past else f"The{draft} agenda for {said}")
    return "\n".join([
        f'    <div class="{p}-agenda">',
        f'    <p class="{p}-agenda__when"><b>{e(head)}</b> &middot; {e(a["kind"])}.</p>',
        f'    <h3 class="{p}-agenda__h">Decisions required</h3>',
        f'    <ol class="{p}-agenda__list">', *[f'      <li>{e(x)}</li>' for x in a["decisions"]], '    </ol>',
        f'    <p>Everything else is discussion or reporting.</p>',
        f'    <h3 class="{p}-agenda__h">Order of business</h3>',
        # The agenda's own numbers, not the list's: its items refer to each other
        # by number, and it has an 8a.
        f'    <ul class="{p}-agenda__list {p}-agenda__list--numbered">',
        *[f'      <li><span class="{p}-agenda__n">{e(num)}.</span> {e(item)} &mdash; {m} min</li>' for num, item, m in a["order"]],
        '    </ul>',
        *[f'    <p>{e(x)}</p>' for x in a.get("access", [])],
        f'    <p class="{p}-agenda__fine">This is the outline of the agenda. The papers behind it go to the board.</p>',
        '    </div>'])


def panel(r):
    p, tag, name = r["prefix"], r["tag"], e(r["name"])
    roles_attr = " ".join(r["for"]) if r["mods"] else ""
    strict_attr = " data-call-strict" if r.get("strict") else ""
    if r["mods"]:
        return "\n".join([
            f'    <div class="{p}-call" data-call="{tag}" data-call-name="{name}" data-call-mods="{roles_attr}"{strict_attr}>',
            f'      <p>The channel and the call in here are for {who_for(r["for"])}{" and nobody else, not even an administrator" if r.get("strict") else "" if r["for"] == ["moderator"] else ", and for administrators"}: moderators sign on at the Community Center with the moderators&rsquo; password, under a handle on the moderators&rsquo; list. Anybody can come in and look around, and the radio waits outside the door for everybody else.</p>',
            f'      <p class="{p}-call__cb" data-call-cb hidden>This browser is not signed on as a moderator this room is for, so the call in here is not yours to join. Moderators sign on at <a href="community-center.html#cb-signon-desk">the front desk</a>.</p>',
            f'      <p class="{p}-call__member" data-call-join hidden><button type="button">Join the call as <b data-call-handle></b></button></p>',
            f'      <p class="{p}-call__who" data-call-who hidden></p>',
            f'      <p class="{p}-call__said" role="status" data-call-said></p>',
            '      <noscript><p>Joining the call needs JavaScript: it opens in a window of its own on this page.</p></noscript>',
            f'      <p class="{p}-call__fine">The call is run by 8x8&rsquo;s Jitsi as a Service, and the server hands a pass into it to the moderators this room is for and nobody else. Camera and microphone start off, and while somebody is in the call we keep their name in it, until they leave. <a href="privacy.html#calls">What goes where.</a></p>',
            '    </div>'])
    return "\n".join([
        f'    <div class="{p}-call" data-call="{tag}" data-call-name="{name}">',
        '      <p>The call in here is for people signed on to the CB. Anybody can come in and look around; to talk, and to be in the circle, you need the CB, and <a href="community-center.html#meeting-hall">the Community Center</a> says how to get on it.</p>',
        f'      <p class="{p}-call__cb" data-call-cb hidden>You are not signed on to the CB in this browser. <a href="community-center.html">Sign on at the Community Center</a>, then come back and the way in is here.</p>',
        f'      <p class="{p}-call__member" data-call-join hidden><button type="button">Join the call as <b data-call-handle></b></button></p>',
        f'      <p class="{p}-call__who" data-call-who hidden></p>',
        f'      <p class="{p}-call__said" role="status" data-call-said></p>',
        '      <noscript><p>Joining the call needs JavaScript: it opens in a window of its own on this page.</p></noscript>',
        f'      <p class="{p}-call__fine">The call is run by 8x8&rsquo;s Jitsi as a Service. Your camera and microphone start off, the name you are called by goes to 8x8 inside your pass into the call, and while somebody is in the call we keep their name in it, until they leave. <a href="privacy.html#calls">What goes where.</a></p>',
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
    if r["mods"] and not (cb and cb.group(1) == "mods"):
        refuse(f'{r["page"]} is the base\'s and its <body> does not say data-cb="mods", so the radio '
               "would walk into the room with everybody.")
    if r["mods"]:
        want = f'data-cb-role="{" ".join(r["for"])}"'
        if want not in body.group(0):
            refuse(f"{r['page']}'s <body> does not say {want}, so love.js would let the radio in for the wrong moderators.")
        if bool(r.get("strict")) != ("data-cb-strict" in body.group(0)):
            refuse(f"{r['page']}'s <body> and data/town-hall.json disagree about data-cb-strict, so love.js would "
                   "let an administrator's radio in where the server will not.")
    if r["for"] == "cb" and cb and cb.group(1) == "mods":
        refuse(f'{r["page"]} is for anybody on the CB and its <body> says data-cb="mods".')
    if f'class="{r["body"]}' not in body.group(0):
        refuse(f"{r['page']}'s <body> does not wear {r['body']}, the class its card and section are built on.")
    if e(r["what"]).replace("&#x27;", "&rsquo;") not in src and r["what"] not in src:
        refuse(f"{r['page']} does not say its own line, which is Ryan's, word for word: {r['what']!r}")
    src = swap(src, r["page"], f"{r['prefix']}-call", panel(r))
    if r.get("people"):
        src = swap(src, r["page"], f"{r['prefix']}-people", people(r))
    if r.get("agenda"):
        src = swap(src, r["page"], f"{r['prefix']}-agenda", agenda(r))
    if r.get("governance"):
        src = swap(src, r["page"], f"{r['prefix']}-governance", governance(r))
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
