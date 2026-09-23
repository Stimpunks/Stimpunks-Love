#!/usr/bin/env python3
"""Generate sitemap.xml and llms.txt from the pages themselves.

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
         "your-room.html",
         # Street furniture rather than a door, and listed like everything else:
         # a page nobody can find from the sitemap is unpublished with extra
         # steps. Back issues join this list as they rotate off the board.
         "pebble-board.html",
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
         "covenstead.html",
         "liner-notes.html",
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

stray = sorted({p.name for p in ROOT.glob("*.html")} - set(ORDER))
if stray:
    raise SystemExit(f"REFUSING: {', '.join(stray)} exist(s) but is not in ORDER — add it, do not skip it.")

today = datetime.date.today().isoformat()
sm = ['<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
for p in pages:
    sm.append(f"  <url>\n    <loc>{p['url']}</loc>\n    <lastmod>{today}</lastmod>\n  </url>")
sm.append("</urlset>")
(ROOT / "sitemap.xml").write_text("\n".join(sm) + "\n")

lines = [
    "# Stimpunks.Love",
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
    "- The typefaces keep their own SIL Open Font License; the songs keep their own copyright.",
    "- Nothing musical is hosted here. The jukebox is press-to-play facades that link out.",
    "- Full credits: https://stimpunks.love/liner-notes.html",
    "",
]
(ROOT / "llms.txt").write_text("\n".join(lines))
print(f"sitemap.xml: {len(pages)} urls · llms.txt: {len(pages)} rooms · lastmod {today}")
