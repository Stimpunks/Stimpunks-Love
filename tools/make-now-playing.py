#!/usr/bin/env python3
"""Print the Now Playing bill on the poster column, out of the rooms themselves.

WHAT IT IS. One screenprinted bill pasted on a poster column on the pavement,
beside the Pebble Board: every room on this street with something in it to press
and play, a line of ours about what is on there, and what that room puts on first.
Ryan's brief, 2026-09-25.

A POSTER IS A PAGE OF SENTENCES ABOUT OTHER ROOMS, and that is the shape CLAUDE.md
warns about more often than any other: a claim about one room living in another
room's copy, which no generator owns and nothing notices going stale. The
Community Center's service board met it first. This is the same shape with one
more claim on every line -- not only what a room is but what it is playing -- and
the new claim is the one most likely to change, because a room re-sorts its rack
or a list gets a new top. So:

  · WHAT IS ON FIRST IS READ OFF EACH ROOM'S PUBLISHED PAGE, never off its data
    file and never off its generator. The first thing on the page you can press,
    after the point the data names -- a press-to-play button, a channel on a set,
    a headset -- with its title and its runtime exactly as that room prints them.
    check-quests.py's rule: a checker that re-derived the answer from the
    generator's source would only be testing that Python is deterministic, and
    the day somebody hand-edits a room is the day this has to be right.
  · OUR LINE ABOUT EACH ROOM CARRIES `holds`: words on the room's page that carry
    what the line says, refused when they have gone. make-community.py's rule.
  · WHERE EACH ROOM IS -- on the street, behind another room, in the campgrounds,
    down the road out of town -- IS READ, not written: data/map.json's rooms
    behind rooms, and which page links to the room.
  · THE ORDER IS THE SITEMAP'S WALKING ORDER, read out of make-sitemap.py as a
    literal the way make-map.py reads it. There is no order of our own.

IT FINDS THE VENUES BY LOOKING. Every page carrying a press-to-play facade, a set
with a running order, or a headset is a venue, and one that is not on the bill and
not in `left_off` with a reason stops the build. So a room cannot open with a stage
in it and be missing from the poster: make-sitemap.py's refusal of an unlisted
page, arriving at a listing. And a venue on the bill whose page has nothing left to
press is refused from the other side, because a poster advertising a stage that has
been taken down is the stale-claim problem at its plainest.

IT ALSO REFUSES:
  · anything on the poster that plays. No facade, no frame, no audio element, no
    data-embed attribute. It is paper; it says where to go. A poster that could
    play a song would be a second jukebox with nobody's room around it, and it
    would put a copy of every room's first press on one page nobody chose it for.
  · a headliner. No top billing, no best, no most popular, no ranking, no chart,
    in our own voice, with make-guild.py's negation window so the poster can still
    say out loud that there is none. Every venue's name is set the same size. A
    gig poster is precisely the object that puts one act in big letters, and here
    it would rank one room above the others on a sheet that belongs to all of them.
  · a count. Nothing says how many rooms, songs, videos or hours are on, because a
    total is a fact about the whole street written in one place and changed in
    another (check-counts.py), and because a number beside a list of things to
    listen to is the pebbling cabinet's tally with a sound system.

IT NEEDS NOTHING BUT THE FILES, so it runs on a train and belongs in the
pre-deploy sequence. Run it after any change to a room that plays something; if
you forget, the next run is where the poster stops being wrong.
"""
import ast
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data/now-playing.json"
PAGE = ROOT / "now-playing.html"
HERE = PAGE.name
BEGIN, END = "<!-- np-bill:begin -->", "<!-- np-bill:end -->"

# The three shapes of a thing you press to play on this street. A facade is the
# street's press-to-play button (love-embed.js); a set's running order is a list
# item carrying its runtime (the Hermitage's television, Looming Rocks' desk, the
# Mopery's screen); a headset is Dance, Punks'. A new shape of player is a new
# alternative here, and until it is added this will not see that room at all --
# which is why the venue check below also runs the other way.
PLAYABLE = re.compile(
    r'<button\b[^>]*\bclass="[^"]*\bfacade\b[^"]*"[^>]*>'
    r'|<li\b[^>]*\bdata-runs="[^"]*"[^>]*>'
    r'|<button\b[^>]*\bclass="dp-tune"[^>]*>', re.S)

# A runtime as the rooms print them: 3:27, 1:14:00, 13 min, 3 hr 23 min, 10 seconds.
RUNS = re.compile(r"\b(\d{1,2}:\d{2}(?::\d{2})?|\d+ hr(?: \d+ min)?|\d+ min|\d+ seconds?)\b")

# What a room says on the button instead of a runtime, repeated as it says it.
SAYS = [("somewhere random", "starts somewhere random"),
        ("until you stop it", "runs until you stop it"),
        ("no end", "live, and it does not end"),
        ("captions on", "captions on")]

TOP = re.compile(
    r"\b(headlin\w*|top\s+(?:billing|billed|of\s+the\s+bill|act)|best|greatest|"
    r"most\s+(?:popular|played|listened)|number\s+one|ranked|ranking|charts?|charting|"
    r"hottest|biggest)\b", re.I)
NEGATED = re.compile(r"\b(not|no|nothing|never|nor|without|nobody)\b[^.;:]*$", re.I)
# "one" is not a count here -- one crate, one song many ways -- and every other
# number word is. The first version stopped at ten and let "twelve songs"
# through when it was broken on purpose, which is the reason for the pattern.
COUNT = re.compile(r"\b(\d+|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|"
                   r"\w+teen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|"
                   r"dozens?|hundreds?|thousands?)(?:[\s-]+\w+)?\s+"
                   r"(rooms?|venues?|songs?|videos?|films?|tracks?|records?|cams?|hours?|"
                   r"playlists?|things?\s+(?:to|on))\b", re.I)
PLAYS_HERE = re.compile(r'<(iframe|audio|video)\b|\bclass="[^"]*\bfacade\b|data-embed-|data-audio-src', re.I)

problems = []


def plain(s):
    s = re.sub(r"<script.*?</script>|<style.*?</style>", " ", s, flags=re.S)
    s = re.sub(r"<!--.*?-->", " ", s, flags=re.S)
    s = re.sub(r"<[^>]+>", " ", s)
    s = html.unescape(s).replace("’", "'").replace("‘", "'")
    return re.sub(r"\s+", " ", s).strip()


def esc(s):
    return html.escape(s, quote=False)


def attrs(tag):
    return {k: html.unescape(v) for k, v in re.findall(r'([a-z][a-z-]*)="([^"]*)"', tag)}


def walking_order():
    src = (ROOT / "tools/make-sitemap.py").read_text()
    for node in ast.parse(src).body:
        if isinstance(node, ast.Assign) and any(getattr(t, "id", "") == "ORDER" for t in node.targets):
            return ast.literal_eval(node.value)
    raise SystemExit("REFUSING: make-sitemap.py has no ORDER, so the bill has no walking order.")


def title(page):
    m = re.search(r"<title>(.*?)</title>", (ROOT / page).read_text(), re.S)
    if not m:
        raise SystemExit(f"REFUSING: {page} has no <title>, and the bill names every room as it names itself.")
    t = plain(m.group(1)).replace("'", "’")
    return re.sub(r"\s*[—–-]\s*Stimpunks\.World$", "", t).strip()


def links_to(page, target):
    return re.search(r'href="%s(?:#[^"]*)?"' % re.escape(target), (ROOT / page).read_text()) is not None


def where(page, behind):
    """Read off the street, never written. The order matters: a room behind a
    room is behind it wherever its parent stands."""
    if page in behind:
        return f"behind {title(behind[page])}"
    if links_to("campgrounds.html", page):
        return "in the campgrounds, past the treeline"
    if links_to("the-outskirts.html", page):
        return "down the road out of town, past the last streetlight"
    idx = (ROOT / "index.html").read_text()
    if re.search(r'<a class="noticeboard" href="%s"' % re.escape(page), idx):
        return "on the pavement, right beside this column"
    if re.search(r'<a class="door door--[^"]+" href="%s"' % re.escape(page), idx):
        return "a shopfront on the street"
    return None


def first_playable(src, start):
    """The first thing on the page you can press, at or after `start`, read the
    way the room prints it."""
    m = PLAYABLE.search(src, start)
    if not m:
        return None
    tag, a = m.group(0), attrs(m.group(0))
    if tag.startswith("<li"):
        return {"title": a.get("data-title", ""), "runs": a.get("data-runs", ""),
                "by": a.get("data-artist", ""), "kind": "set", "says": []}
    if 'class="dp-tune"' in tag:
        return {"title": a.get("data-title", ""), "runs": "", "by": a.get("data-artist", ""),
                "kind": "headset", "says": ["channel 1 opens here and plays on through the crate"]}
    close = src.find("</button>", m.end())
    label = plain(src[m.end():close] + " " + a.get("aria-label", ""))
    t = a.get("data-embed-title", "")
    runs = RUNS.search(label.replace(plain(t), " ")) if t else RUNS.search(label)
    if not runs and t:
        runs = RUNS.search(t)
    runs = runs.group(1) if runs else ""
    # A title that carries its own runtime (the Pebble Board's does) keeps it
    # once rather than twice.
    if runs and t.endswith(runs):
        t = re.sub(r"\s*[·\-—]\s*" + re.escape(runs) + r"$", "", t)
    src_url = a.get("data-embed-src", "")
    kind = ("record" if "data-audio-src" in a
            else "list" if ("videoseries" in src_url or "list=" in src_url) else "one")
    says = [out for key, out in SAYS if key in label.lower()]
    return {"title": t, "runs": runs, "by": "", "kind": kind, "says": says}


def sweep(text, where_):
    said = plain(text)
    for pat, why in ((TOP, "the vocabulary of top billing, and there is no headliner on this bill"),
                     (COUNT, "a count, and nothing on this poster says how many of anything are on")):
        m = next((x for x in pat.finditer(said)
                  if not NEGATED.search(said[max(0, x.start() - 50):x.start()])), None)
        if m:
            problems.append(f"{where_}: {m.group(0)!r} is {why}.")


data = json.loads(DATA.read_text())
behind = json.loads((ROOT / "data/map.json").read_text())["behind"]
order = walking_order()
left_off = data.get("left_off", {})
venues = {v["page"]: v for v in data["venues"]}
if len(venues) != len(data["venues"]):
    problems.append("a page is on the bill twice. One line per room.")

# ── Who has something to press ───────────────────────────────────────────────
found = set()
for p in sorted(ROOT.glob("*.html")):
    if p.name == HERE:
        continue
    if PLAYABLE.search(p.read_text()):
        found.add(p.name)

for name in sorted(found - set(venues) - set(left_off)):
    problems.append(f"{name} has something in it to press and play and is not on the bill. Put it on "
                    "the bill with a line about it, or in `left_off` with the reason it is not there.")
for name, why in left_off.items():
    if not why:
        problems.append(f"{name} is left off the bill with no reason. Say why, or put it on.")
for name in sorted(set(venues) - found):
    problems.append(f"{name} is on the bill and has nothing on it to press any more. Take it off the "
                    "poster, or teach this tool the new shape of player it has.")
for name in sorted(set(venues) - set(order)):
    problems.append(f"{name} is not in the sitemap's walking order, so it has no place on the bill.")

# ── Each line ────────────────────────────────────────────────────────────────
lines = []
for page in order:
    v = venues.get(page)
    if not v or page not in found:
        continue
    at = f"venue {page}"
    src = (ROOT / page).read_text()
    text = plain(src)
    if not v.get("what"):
        problems.append(f"{at}: no `what`, the line of ours about the room.")
    if not v.get("holds"):
        problems.append(f"{at}: holds none of the room's own words, so nothing would notice the room "
                        "changing under the line this poster says about it.")
    for phrase in v.get("holds", []) + ([v["song"]] if v.get("song") else []):
        if plain(phrase) not in text:
            problems.append(f"{at}: the room no longer says \"{plain(phrase)}\". Read the room, change "
                            "the line to say what it says now, and change `holds` with it.")
    sweep(v.get("what", ""), at)

    start = src.find("<main")
    if v.get("after"):
        start = src.find(v["after"])
        if start < 0:
            problems.append(f"{at}: the room has no {v['after']!r}, which is where this reads its "
                            "running order from.")
            continue
    first = first_playable(src, start)
    if not first or not first["title"]:
        problems.append(f"{at}: found nothing to press with a title after the point named, so there is "
                        "nothing to say is on first.")
        continue
    then = None
    if v.get("then"):
        t_at = src.find(v["then"])
        if t_at < 0:
            problems.append(f"{at}: the room has no {v['then']!r} to read its bill from.")
        else:
            then = first_playable(src, t_at)
            if not then or not then["title"]:
                problems.append(f"{at}: nothing to press on the room's bill after {v['then']!r}.")
            elif then["kind"] == "list":
                problems.append(f"{at}: the first thing on the room's bill is itself a list, so it "
                                "cannot say what the list opens on.")
    if first["kind"] == "list" and not then and not first["says"]:
        problems.append(f"{at}: the first thing is a list and the room's button says neither how it "
                        "starts nor that it runs until you stop it. The poster repeats the room; it "
                        "does not make that up.")
    w = where(page, behind)
    if not w:
        problems.append(f"{at}: could not tell where the room is. Nothing links to it from the street, "
                        "the campgrounds, the Outskirts or a room it is behind.")
    lines.append((page, v, first, then, w))

# The page's own words, everything but the bill (whose titles are other people's).
page_src = PAGE.read_text()
if BEGIN not in page_src or END not in page_src:
    raise SystemExit(f"REFUSING: {HERE} has no {BEGIN} / {END}, so there is nowhere to print the bill.")
outside = page_src.split(BEGIN)[0] + page_src.split(END)[1]
sweep(re.sub(r"<head>.*?</head>", " ", outside, flags=re.S), HERE)
if PLAYS_HERE.search(outside):
    problems.append(f"{HERE}: the poster carries something that plays. It is paper; every one of "
                    "these waits in its own room.")

if problems:
    raise SystemExit("REFUSING:\n  " + "\n  ".join(problems))


# ── The bill ─────────────────────────────────────────────────────────────────
def on(item, song=None):
    # Where a room's running order names the performer and not the song (the
    # Mopery's screen, which is one song many ways), the song is ours to name
    # and is held against the room's page like every other word of ours.
    name, by = (song, item["title"]) if song else (item["title"], item["by"])
    bits = [f'<span class="np-bill__title">{esc(name)}</span>']
    if by:
        bits.append(f'<span class="np-bill__by">by {esc(by)}</span>')
    tail = []
    if item["runs"]:
        tail.append(item["runs"])
    if item["kind"] == "list":
        tail.insert(0, "the whole list")
    tail += item["says"]
    line = " ".join(bits)
    if tail:
        line += f' &middot; <span class="np-bill__runs">{esc(" · ".join(tail))}</span>'
    return line


out = ['<ol class="np-bill">']
for page, v, first, then, w in lines:
    slug = page[:-5]
    out.append(f'  <li class="np-bill__act" id="np-{slug}">')
    out.append(f'    <h3 class="np-bill__name"><a href="{page}">{esc(title(page))}</a></h3>')
    out.append(f'    <p class="np-bill__where">{esc(w)}</p>')
    out.append(f'    <p class="np-bill__what">{esc(v["what"])}</p>')
    out.append(f'    <p class="np-bill__first"><span class="np-bill__on">On first</span> '
               f'{on(first, v.get("song"))}</p>')
    if then:
        out.append(f'    <p class="np-bill__first np-bill__first--then"><span class="np-bill__on">'
                   f'First on the room&rsquo;s own bill</span> {on(then)}</p>')
    out.append("  </li>")
out.append("</ol>")
block = "\n".join(out)
if PLAYS_HERE.search(block):
    raise SystemExit("REFUSING: the bill would carry something that plays.")

PAGE.write_text(re.sub(re.escape(BEGIN) + r".*?" + re.escape(END),
                       lambda m: BEGIN + "\n" + block + "\n" + END, page_src, flags=re.S))
held = sum(len(v.get("holds", [])) for v in data["venues"])
print(f"now playing: the bill is printed into {HERE}, in walking order, off every room's own "
      f"published page; {held} of those rooms' own words held against them")
