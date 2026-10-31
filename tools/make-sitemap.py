#!/usr/bin/env python3
"""Generate sitemap.xml, llms.txt and cb-rooms.json from the pages themselves.

cb-rooms.json is the CB's list of rooms: what #the-den on the channel means. It
is written here because this is the one tool that already walks every page in
the street's order and reads its title, so a new room is a name on the radio
the moment it is in ORDER, and a renamed one changes on the radio when its
<title> does. Nothing about the list is counted or ranked; it is in walking
order because that is the only order this street has.

Both are DERIVED, so neither can drift from the site: the canonical, the title
and the description all come out of each page's own head. A hand-kept sitemap is
a list that is wrong the first time somebody adds a room and forgets.
"""
import pathlib, re, datetime, html

ROOT = pathlib.Path(__file__).resolve().parent.parent
# Walking order, not alphabetical: the street, then each room with its subroom
# behind it, then off the end of the street into the campgrounds and the one
# pitch standing on it, then the pages that hold lists.
ORDER = ["index.html",
         # The model of the whole street, on a table by the front door. Street
         # furniture rather than a room, and second because it is the page that
         # shows where every other page stands.
         "map.html",
         # The street walked as paper, in a toy theatre beside the Map: the
         # front page's own doors, stood up along a road to walk down.
         "paper-street.html",
         # The first stretch of the street in WebGL, drawn like a cel, through
         # a link on Paper Street: a proof of concept beside it.
         "cel-street.html",
         # The page about the street's own name, which is reached from a line
         # under the dial on the front page rather than from a shopfront: it is
         # about the street rather than a room standing on it. First, because it
         # is the only page here that explains what all the others are doing.
         "danny-the-street.html",
         "pink-pony-club.html", "the-chappell.html", "club-chronic.html", "zine-table.html", "zine-issue-2.html",
         "hear-queer-here.html",
         "enids-room.html", "polaroids.html", "playhouse.html",
         "arcade.html", "quill-drift.html", "otterly-adorbs.html", "penguin-pebbling.html",
         "latibulum.html",
         "jungle-room.html", "the-den.html",
         "the-mopery.html", "oracle-deck.html", "the-doomscroll.html",
         "adventurers-guild.html",
         "the-feed.html", "the-source.html",
         "zibaldone.html",
         "rabbit-hole.html", "healing-checkpoint.html",
         "foundry.html",
         "covenstead.html",
         "dead-tired-society.html",
         "laughingstock.html",
         "lightbulb-picture-house.html",
         "samefood-cafe.html",
         "collection-collection.html",
         "vital-plant-living.html",
         "community-center.html",
         "town-hall.html", "town-hall-fishbowl.html", "town-hall-directors.html", "town-hall-board.html", "town-hall-moderators.html", "town-hall-executive-session.html",
         "dopamine-dress-up-den.html", "fantasy-fancy-dress.html",
         "bodymind-booth.html",
         "plural-mural.html",
         "community-library.html", "l-space.html", "oook.html",
         "cavendish-coworking.html", "cavendish-events.html", "cavendish-operations.html",
         "cavendish-editorial.html", "cavendish-watering-hole.html", "cavendish-campfire.html",
         "cavendish-cave.html",
         "live-room.html",
         "broadsheet-broadside.html",
         "the-doom-scoop.html",
         "the-mud-room.html",
         "pando-calrissian.html",
         "fridge-of-sighs.html",
         "count-me-in.html",
         "rescue-a-cat.html",
         "rescue-a-dog.html",
         "rescue-small-animals.html",
         "the-open-notebook.html",
         "learning-large.html",
         "hey-good-cookin.html",
         "pekoe-and-purrs.html",
         "a-quiet-pint.html",
         "the-honesty-box.html",
         "neurohome.html",  # Isha Snow's, brought in by tools/import-room.py
         "words-bud-beats.html",  # Kristina Brooke's, brought in by tools/import-room.py
         "sandbox.html",  # brought in by tools/import-room.py
         "chimera-obscura.html",
         "community-care.html",
         "coping.html",
         "pets.html",
         "show-your-work.html",
         "volunteers.html",
         "breaker-breaker.html",
         "your-room.html",
         # Street furniture rather than a door, and listed like everything else:
         # a page nobody can find from the sitemap is unpublished with extra
         # steps (the one exception is a page that says so on its own body,
         # below NO_ADDRESS). Back issues join this list as they rotate off the
         # board.
         "pebble-board.html",
         # The Brass Tacks Board beside it: the street's posts that persist.
         "brass-tacks-board.html",
         # The poster column beside the board: street furniture too, and a page
         # of what is on in every other room, so it goes where you would stop to
         # read it, right after the board it stands beside.
         "now-playing.html",
         # The gate in the wall, which is also not a door: every bed out there
         # links off this street, so the garden is a page of ours listing sites
         # that are not.
         "the-garden.html",
         # The World room, past the Garden's spider: every room on its web,
         # and its own channel and call are the World's.
         "world.html",
         # The open ground where the buildings stop: the lots side by side,
         # behind a fence with a gate into each, in the order they stand --
         # the Run, the Truck Stop between it and the Green, then the Pile.
         "the-run.html", "truckin-food-court.html", "the-green.html", "the-pile.html",
         "campgrounds.html", "faery-yurt.html", "faery-reading-room.html", "faery-music-room.html",
         "faery-cinema-room.html", "faery-myths-room.html", "glow-wild-hollow.html", "play-pod.html",
         # Pitch 05, Jess's tree house, stands next to the Faery Yurt.
         "the-bough-house.html", "swaying-sweetgrass.html",
         "solarpunk-hermitage.html",
         "brew-and-stew.html",
         # The summit: David's log cabin, up the cable car from the field, off
         # the main campsite and still the campgrounds'.
         "the-mountain-cabin.html",
         # Past the campgrounds and through its wood, the land the street
         # lives on: Nature's Contribution, then its places as they open, in
         # the order its fingerpost's arms run.
         "natures-contribution.html", "all-needs-met.html", "gentle-help.html",
         "brighter-days.html", "all-together-now.html", "the-dairy.html",
         "wide-spread-chaos.html",
         # The other edge, past the last streetlight at the far end. An area
         # like the campgrounds, listed the same way: the road first, then
         # what is down its turnings.
         "the-outskirts.html", "black-leather-lagoon.html", "sithen.html",
         "looming-rocks.html", "dance-punks.html", "small-hours.html",
         "repeater.html", "nothing-for-sale.html",
         "rebellion-rave-room.html", "cooldown-room.html", "haunted-house.html",
         # The third edge, and the first one that is under the street rather
         # than past an end of it: down the lift by the stoop. An area like the
         # other two, listed the same way: the caverns first, then its rooms as
         # they open.
         "arlesglad-caverns.html", "big-steep-fermentables.html", "mycelium-munchies.html",
         "glow-go-gee-gaws.html", "stay-frosty.html",
         "stay-breezy.html",
         "liner-notes.html",
         # What this is all about, for anybody who has been shown the street
         # and does not get it yet: a short film and a few lines. Paperwork
         # rather than a room, so it stands with the credits, first of them
         # because it is the one a newcomer is sent to.
         "about.html",
         # What the street is for: the mission, each aim with the page that
         # keeps it. Paperwork rather than a room, so it stands with the credits;
         # the manifesto it points at is a sheet in the Broadsheet Broadside.
         "mission.html",
         # How the site is made, and who and what makes it, AI included. A
         # page with a job rather than a room, so it stands with the credits.
         "design.html",
         # How the site runs: the code, the hosting, the timers and every outside
         # service. design.html is the why and this is the how, so it stands
         # beside it with the other paperwork.
         "architecture.html",
         # What the site keeps about the people who visit it. With the other
         # pages that hold lists rather than rooms, because that is what it is.
         "privacy.html",
         # How to use the CB, part by part, beside what it keeps. A manual
         # rather than a room, so it stands with the paperwork too.
         "cb-guide.html",
         # The joining page, where an invite becomes a username of your own
         # (2026-10-21). The CB's, in its clothes, so it stands beside the guide.
         "join.html",
         # Home, the community dashboard (2026-10-27): what is new to you, the
         # latest on the street and the places members use most, where the
         # radio's house and the joining page send you. The CB's, in the
         # reader's own CB theme, so it stands with the joining page and the chat.
         "home.html",
         # The chat, every room's channel on one page (2026-10-22). The radio
         # itself, docked into a page in the reader's own CB theme rather than a
         # world of its own, so it stands with the guide and the forums.
         "chat.html",
         # The community directory (2026-10-23): everybody on the CB who chose
         # to be listed. The CB's, in the reader's own CB theme rather than a
         # world of its own, so it stands with the chat and the forums.
         "directory.html",
         # A profile's own page (2026-10-26), profile.html#<username>: the
         # card and the tabs its owner shows, for whoever its owner lets open
         # it. The CB's, in the reader's own CB theme, beside the directory.
         # The username is after the #, which a search engine reads as this one
         # page, so no profile is ever listed here or anywhere else.
         "profile.html",
         # Your page (2026-10-25): the radio's You part docked into a page,
         # with your past notifications beside it. The CB's, in the reader's
         # own CB theme, so it stands with the chat and the directory.
         "you.html",
         # The CB's forums, for what needs longer than the channel's two weeks. The
         # radio's, as its guide is, and in the reader's own CB theme rather
         # than a world of its own, so it stands beside the guide.
         "forum.html",
         # Tasks, the team's to-do list, moved from EspoCRM. The CB's too, for
         # directors, board members and administrators, so it stands beside the forums.
         "tasks.html",
         # The office, contacts and then grant requests and cases, moved from
         # EspoCRM. The CB's, for directors, board members and administrators, beside tasks.
         "office.html",
         "changelog.html"]

def field(src, pat):
    m = re.search(pat, src, re.S)
    return html.unescape(m.group(1)).strip() if m else ""

pages = []
for name in ORDER:
    p = ROOT / name
    if not p.exists():
        raise SystemExit(f"REFUSING: {name} is in the page order and not on disk.")
    s = p.read_text()
    pages.append({
        "file": name,
        "url": field(s, r'<link rel="canonical" href="([^"]+)"'),
        "title": field(s, r"<title>(.*?)</title>"),
        "desc": field(s, r'<meta name="description" content="([^"]+)"'),
        "body": field(s, r"(<body\b[^>]*>)"),
    })

missing = [p["file"] for p in pages if not (p["url"] and p["title"] and p["desc"])]
if missing:
    raise SystemExit(f"REFUSING: canonical/title/description missing on: {', '.join(missing)}")

# THE ONE PAGE WITH NO ADDRESS. Netlify serves 404.html at every URL nobody
# built, so it has no URL of its own to list, and a sitemap entry for it would
# be telling a search engine that "nothing here" is a page worth indexing. It
# is named here rather than skipped by pattern, so that the rule above --
# every page is in the order or this refuses -- still holds for everything else.
NO_ADDRESS = {"404.html"}

# ROOMS YOU HAVE TO KNOW THE ADDRESS OF. Ryan's call, 2026-10-07: a page whose
# own <body> carries data-unlisted is left out of all three files this writes,
# which keeps it off the teleporter and the search too, because both read
# cb-rooms.json. It is read off the page rather than listed here, because this
# file is served too. A page cannot be both: in the walking order and unlisted
# is a contradiction, and this refuses it rather than deciding which was meant.
# See tools/unlisted.py, and tools/check-unlisted.py for what holds the rest.
import unlisted
UNLISTED = set(unlisted.pages(ROOT))
both = sorted(UNLISTED & set(ORDER))
if both:
    raise SystemExit(f"REFUSING: {', '.join(both)} is in ORDER and its <body> says data-unlisted. "
                     "A room is on the street's lists or it is not; take one of the two away.")

# A WINDOW IS NOT A PLACE (tools/windows.py): the call window holds a call that
# was popped out, and nothing until then, so it is on no list a visitor walks.
from windows import WINDOWS
both = sorted(WINDOWS & set(ORDER))
if both:
    raise SystemExit(f"REFUSING: {', '.join(both)} is in ORDER and tools/windows.py says it is a window. "
                     "A page is a place on the street or a window, not both.")
stray = sorted({p.name for p in ROOT.glob("*.html")} - set(ORDER) - NO_ADDRESS - UNLISTED - WINDOWS)
if stray:
    raise SystemExit(f"REFUSING: {', '.join(stray)} exist(s) but is not in ORDER — add it, do not skip it.")

# THE WORLD CALL'S NAME IS NO ROOM'S. Ryan, 2026-10-13: a call for the whole
# street, under WORLD_CALL in netlify/cb/lib.mjs, and a room's call is named by
# its filename, so a page with that name would have the World call for its
# own. cb.js keeps a copy of the name to know which call is open; the two must
# say the same thing, or the radio's World call button joins one call and
# shows itself pressed for another.
import re as _re
def _world(path, pattern):
    m = _re.search(pattern, (ROOT / path).read_text())
    if not m:
        raise SystemExit(f"REFUSING: {path} no longer says what the World call is called ({pattern}).")
    return m.group(1)
WORLD = _world("netlify/cb/lib.mjs", r"export const WORLD_CALL = '([a-z0-9-]+)';")
if _world("cb.js", r"var WORLD_CALL = '([a-z0-9-]+)';") != WORLD:
    raise SystemExit("REFUSING: cb.js and netlify/cb/lib.mjs name the World call differently. Change both.")
# THE WORLD ROOM SHARES THE NAME ON PURPOSE. Until 2026-10-18 this refused a
# page called world.html, because its own call would have been the World call.
# Ryan reversed that: the World room is world.html, and its own channel IS the
# World channel and its own call IS the World call, so there is no second of
# either to split people between. What this holds now is that it stays one:
# the page says so on its body (data-world), cb.js tunes it to World and hides
# its separate room call (worldHere), and lib.mjs reads and writes its channel
# as World's (readTuned).
if WORLD == "street":
    raise SystemExit("REFUSING: the World call cannot be called street, which is the street's own tag.")
_wp = ROOT / f"{WORLD}.html"
if _wp.exists():
    _body = _re.search(r"<body[^>]*>", _wp.read_text())
    if not _body or "data-world" not in _body.group(0):
        raise SystemExit(f"REFUSING: {_wp.name} is the World room, whose channel and call are the World's; its <body> must say data-world.")
    if "function worldHere()" not in (ROOT / "cb.js").read_text():
        raise SystemExit("REFUSING: cb.js no longer knows the World room (worldHere), so its radio would tune to a room channel beside World.")
    if "room && room !== WORLD_CALL ? readRoomTalk(room, s)" not in (ROOT / "netlify/cb/lib.mjs").read_text():
        raise SystemExit("REFUSING: lib.mjs no longer reads the World room's channel as World's (readTuned).")

# WHICH LICENCES THE TYPEFACES TRAVEL UNDER IS READ, NOT TYPED. This line said
# every face was SIL Open Font License for as long as llms.txt existed, and four
# are Apache 2.0 -- which pull-foundry.py found by reading each family's own
# record, and which this line went on contradicting because it was a sentence in
# a generator rather than a reading of that record.
def typeface_licences():
    import json
    faces = json.loads((ROOT / "data/foundry-faces.json").read_text())["faces"]
    found = sorted({f["licence"] for f in faces.values()})
    if not found:
        raise SystemExit("REFUSING: data/foundry-faces.json names no licence for any face.")
    if len(found) == 1:
        return f"licence ({found[0]})"
    return "licences (" + ", ".join(found[:-1]) + " or " + found[-1] + ")"


today = datetime.date.today().isoformat()


# LASTMOD IS WHEN THE PAGE CHANGED, NOT WHEN THIS RAN. It used to be today's date
# on every page, every run, which told a crawler that the whole street had just
# changed whenever anybody rebuilt the sitemap -- and the spec's own mistake list
# names exactly that: a lastmod touched on every build degrades the one signal it
# exists to give. The page's date is the date of the last commit that touched
# it; a page with uncommitted changes gets today, because today is when those
# changes will land. A site-wide edit to every head moves every date, which is
# true: every page did change. Outside a git checkout this refuses rather than
# guessing, because a guessed date is the fault being fixed.
def changed_on(names):
    import subprocess
    try:
        log = subprocess.run(["git", "log", "--format=%x00%cs", "--name-only", "--", *names],
                             cwd=ROOT, capture_output=True, text=True, check=True).stdout
        dirty = subprocess.run(["git", "status", "--porcelain", "--", *names],
                               cwd=ROOT, capture_output=True, text=True, check=True).stdout
    except (OSError, subprocess.CalledProcessError):
        raise SystemExit("REFUSING: cannot read git history, so there is no honest lastmod to "
                         "write. Run this from a checkout of the repository.")
    seen, date = {}, None
    for line in log.splitlines():
        if line.startswith("\0"):
            date = line[1:]
        elif line and line not in seen:
            seen[line] = date
    for line in dirty.splitlines():
        seen[line[3:].strip()] = today
    missing = [n for n in names if n not in seen]
    for n in missing:
        seen[n] = today      # new and not yet committed: it lands today
    return seen


dates = changed_on([p["file"] for p in pages])
sm = ['<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
for p in pages:
    sm.append(f"  <url>\n    <loc>{p['url']}</loc>\n    <lastmod>{dates[p['file']]}</lastmod>\n  </url>")
sm.append("</urlset>")
(ROOT / "sitemap.xml").write_text("\n".join(sm) + "\n")

lines = [
    "# Stimpunks.World",
    "",
    "> Queer without fear. Interdependent and here. Divergent and proud. Living out loud. "
    "Plucky pluralism, for human organisms. Becoming and belonging, with ribald songing.",
    "",
    "A Stimpunks Foundation site, and the loud one. It has no single design system on purpose: "
    "the street is the system and the rooms refuse to share one. Through a gate in the wall there "
    "is a garden, with one bed for every site we publish and every bed linking out to it. The "
    "street has an edge at each end and they are not the same kind of edge: past the treeline "
    "there is a campground, for anybody who would rather not be on a street at all, and past its "
    "wood the land the street lives on, kept for wildlife, food and power at once; past the "
    "last streetlight the other way there is a road out of town, where the mystical and the "
    "after-dark keep premises. Under the street, by lift or stair, there are caverns, for "
    "everything that needs things to stay the same. "
    "Two habits survive from our "
    "careful sites — attribution, which is a licence rather than a house style, and contrast, "
    "because clashing is not the same as illegible.",
    "",
    "Every page carries an intensity dial with three settings. It defaults to whatever the "
    "visitor's device asks for and lets them turn it up past that; Gentle removes motion and "
    "sparkle and never removes content.",
    "",
    "## The rooms, the garden through the gate, and the field at the end of the street",
    "",
]
for p in pages:
    lines.append(f"- [{p['title']}]({p['url']}): {p['desc']}")
lines += [
    "",
    "## Attribution",
    "",
    "- Text and design: CC BY-SA 4.0, Stimpunks Foundation.",
    f"- The typefaces keep their own {typeface_licences()}, family by family, as "
    "https://stimpunks.world/foundry.html records them; the songs keep their own copyright.",
    "- Nothing musical is hosted here. The jukebox is press-to-play facades that link out.",
    "- Full credits: https://stimpunks.world/liner-notes.html",
    "- What this is all about, for newcomers: https://stimpunks.world/about.html",
    "- What the street is for (the mission): https://stimpunks.world/mission.html",
    "- The manifesto, Ribald Songing, as a printable broadside: https://stimpunks.world/broadsheet-broadside.html#no-2",
    "- How the site is made, and how we use AI: https://stimpunks.world/design.html",
    "- How the site runs, its code and its hosting: https://stimpunks.world/architecture.html",
    "- The CB, the street's radio, part by part: https://stimpunks.world/cb-guide.html",
    "- Joining the CB with an invite, which claims a username of your own: https://stimpunks.world/join.html",
    "- Home, the community dashboard: what is new to you, the latest on the street, events coming up and the places members use most, for anybody signed on to the CB (nothing in it is public): https://stimpunks.world/home.html",
    "- The chat, every room's channel on the CB on one page, for anybody signed on to the CB (nothing in it is public): https://stimpunks.world/chat.html",
    "- The community directory, everybody on the CB who has chosen to be listed, for anybody signed on to the CB (nothing in it is public): https://stimpunks.world/directory.html",
    "- Your page, the radio's Profile and Account with your past notifications beside them, for whoever is signed on to the CB in that browser and nobody else (nothing in it is public): https://stimpunks.world/you.html",
    "- The CB's forums, for claimed usernames on the CB (nothing in them is public): https://stimpunks.world/forum.html",
    "- Tasks, the team's to-do list, for its directors, board members and administrators (nothing in it is public): https://stimpunks.world/tasks.html",
    "- The Office, the people and organisations Stimpunks is in touch with, for its directors, board members and administrators (nothing in it is public): https://stimpunks.world/office.html",
    "",
    "## For agents",
    "",
    "- How to read, quote and cite this site: https://stimpunks.world/.well-known/agent-skills/stimpunks-world/SKILL.md",
    "- Every machine-readable resource, as an RFC 9264 Linkset: https://stimpunks.world/.well-known/api-catalog",
    "- What the site keeps about visitors: https://stimpunks.world/privacy.html",
    "",
]
(ROOT / "llms.txt").write_text("\n".join(lines))

# THE CB'S ROOMS. #slug on the channel is a room's filename without .html, and
# the name shown is the page's own <title> without the site's name after it. The
# front page is "the street", because its title is only the site's name.
import json
SUFFIX = " \u2014 Stimpunks.World"
rooms = []
for p in pages:
    slug = "street" if p["file"] == "index.html" else p["file"][:-len(".html")]
    title = html.unescape(p["title"])
    name = "The Street" if p["file"] == "index.html" else title.removesuffix(SUFFIX)
    if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", slug):
        raise SystemExit(f"REFUSING: {p['file']} gives the CB the tag #{slug}, which a message "
                         "cannot carry. Rooms are lowercase letters, digits and hyphens.")
    if name == title and p["file"] != "index.html":
        raise SystemExit(f"REFUSING: {p['file']}'s title does not end in the site's name, so the "
                         "CB cannot tell the room's name from it.")
    # `about` is the page's own description, so the teleporter can find a room
    # by what it is about as well as by its name (Helen Edgar's ask, 2026-10-01:
    # "fire" should find The Campfire). Read off the page, never typed, for the
    # reason the sitemap is: a keyword list kept by hand is wrong the first time
    # a room changes what it is for.
    room = {"tag": slug, "name": name,
            "path": "/" if p["file"] == "index.html" else "/" + p["file"],
            "about": html.unescape(p["desc"])}
    # A ROOM WHOSE CHANNEL IS STAFF'S says which roles hear it, read off its own
    # <body> (data-cb="mods", data-cb-role, data-cb-strict), so the teleporter's
    # #channels can leave out a channel the radio could not tune to (Ryan's ask,
    # 2026-10-28). The page says the same thing publicly already; the server's
    # MOD_ROOMS is still the lock, and make-town-hall.py and make-tasks.py hold
    # the pages to it.
    if re.search(r'\bdata-cb="mods"', p["body"]):
        roles = (re.search(r'\bdata-cb-role="([^"]*)"', p["body"]) or [None, "moderator"])[1].split()
        room["staff"] = {"roles": roles, "strict": bool(re.search(r"\bdata-cb-strict\b", p["body"]))}
    rooms.append(room)
if len({r["tag"] for r in rooms}) != len(rooms):
    raise SystemExit("REFUSING: two pages give the CB the same #tag.")
(ROOT / "cb-rooms.json").write_text(json.dumps(
    {"_what": "The rooms the CB knows by #tag, in walking order. Written by "
              "tools/make-sitemap.py from each page's own title and description. Do not hand-edit.",
     "rooms": rooms}, indent=1, ensure_ascii=False) + "\n")
print(f"sitemap.xml: {len(pages)} urls, lastmod from git ({min(dates.values())} to "
      f"{max(dates.values())}) · llms.txt: {len(pages)} pages")
