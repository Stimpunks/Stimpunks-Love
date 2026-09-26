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
         "the-feed.html",
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
         "dopamine-dress-up-den.html",
         "plural-mural.html",
         "community-library.html", "l-space.html", "oook.html",
         "cavendish-coworking.html",
         "live-room.html",
         "broadsheet-broadside.html",
         "your-room.html",
         # Street furniture rather than a door, and listed like everything else:
         # a page nobody can find from the sitemap is unpublished with extra
         # steps. Back issues join this list as they rotate off the board.
         "pebble-board.html",
         # The poster column beside the board: street furniture too, and a page
         # of what is on in every other room, so it goes where you would stop to
         # read it, right after the board it stands beside.
         "now-playing.html",
         # The gate in the wall, which is also not a door: every bed out there
         # links off this street, so the garden is a page of ours listing sites
         # that are not.
         "the-garden.html",
         "campgrounds.html", "faery-yurt.html", "swaying-sweetgrass.html",
         "solarpunk-hermitage.html",
         # The other edge, past the last streetlight at the far end. An area
         # like the campgrounds, listed the same way: the road first, then
         # what is down its turnings.
         "the-outskirts.html", "black-leather-lagoon.html", "sithen.html",
         "looming-rocks.html", "dance-punks.html", "small-hours.html",
         "repeater.html", "nothing-for-sale.html",
         "liner-notes.html",
         # What the site keeps about the people who visit it. With the other
         # pages that hold lists rather than rooms, because that is what it is.
         "privacy.html",
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

stray = sorted({p.name for p in ROOT.glob("*.html")} - set(ORDER) - NO_ADDRESS)
if stray:
    raise SystemExit(f"REFUSING: {', '.join(stray)} exist(s) but is not in ORDER — add it, do not skip it.")

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
    "there is a campground, for anybody who would rather not be on a street at all, and past the "
    "last streetlight the other way there is a road out of town, where the mystical and the "
    "after-dark keep premises. "
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
    rooms.append({"tag": slug, "name": name,
                  "path": "/" if p["file"] == "index.html" else "/" + p["file"]})
if len({r["tag"] for r in rooms}) != len(rooms):
    raise SystemExit("REFUSING: two pages give the CB the same #tag.")
(ROOT / "cb-rooms.json").write_text(json.dumps(
    {"_what": "The rooms the CB knows by #tag, in walking order. Written by "
              "tools/make-sitemap.py from each page's own title. Do not hand-edit.",
     "rooms": rooms}, indent=1, ensure_ascii=False) + "\n")
print(f"sitemap.xml: {len(pages)} urls, lastmod from git ({min(dates.values())} to "
      f"{max(dates.values())}) · llms.txt: {len(pages)} pages")
