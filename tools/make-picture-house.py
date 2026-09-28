#!/usr/bin/env python3
"""Build The Lightbulb Picture House's screens, its racks and the credits, from data/picture-house.json.

ONE DATA FILE, ONE TOOL, TWO SURFACES -- the contract make-yells.py set and
every generator here has kept since. Each screen is one of our own playlists put
on whole, and each has a rack under it with a card for every film on it: Screen
One's, Screen Two's, and the campfire rack for Screen Three. Every rack folds
away and ships open, for the reason fold() gives. The credits also go to liner-notes.html.

SCREEN THREE IS EVERYTHING WE HAVE WATCHED AT CAMPFIRE LEARN TOGETHER, and its
rack is built out of `campfire`: one entry per campfire, each naming the post we
wrote for it on stimpunks.org and the films watched there, in the order the
session watched them. Ryan's brief, 2026-09-28: newest first, because new
campfires go on at the TOP of the playlist. So the tool refuses campfires out of
date order -- the rack is a mirror of the playlist and the playlist's order is a
date -- refuses a post that is not a stimpunks.org post address, and, when the
Knowledge System mirror is on this machine, refuses a post the mirror does not
have at that address with that title. A card that links the wrong campfire's
post would be crediting the wrong conversation. A campfire whose film cannot be
on a playlist (private now, or on Vimeo) stays in the data with no films and an
`off_screen` reason, and the room lists it under the rack, because leaving it out
would make the screen look like the whole record when it is not.

WHAT IT REFUSES, and the first two are the room:

  - BLUE, ANYWHERE IN THE ROOM'S PALETTE. A theater named for a lightbulb, in a
    neurodiversity room, lit blue, is Light It Up Blue: the campaign in which
    parent- and professional-led autism charities light landmarks blue every
    April, and which autistic people have spent years asking to be done some
    other way. This tool reads every --lph- colour declared in love.css's :root
    and every literal colour in the room's own section, and refuses any whose
    hue is blue or cyan. That is a stronger promise than a sentence on the page,
    because the page says NOTHING IN THIS BUILDING IS BLUE and a palette is the
    one place that sentence could quietly stop being true. The ornament over the
    screen is the gold infinity for the same reason: the rainbow one has blue in
    it.

  - THE VOCABULARY OF AWARENESS, IN OUR OWN VOICE. Puzzle pieces, lighting it
    up blue, autism awareness, cure, suffers from, high- and low-functioning,
    special needs, "person with autism". Every one is the language of the
    campaigns our own Acceptance entry quotes autistic people refusing. It is
    swept with the negation window, so the room can say that there is no puzzle
    piece in it, and it skips the one blockquote, the film titles and anything
    inside curly quotation marks, because those are other people talking -- and
    several of these films use person-first language about themselves, which is
    their call and not ours to sweep.

  - A FILM WITH NO `content` KEY. Every card says what is in a film BEFORE the
    press, beside the runtime, for the runtime's reason: a panic attack, a
    bullying scene, jokes about suicide or a sponsor segment are things
    somebody may want to know before they sit down. Null is a real answer and
    means somebody looked. A missing key means nobody did, and is refused.

  - A PRONOUN FOR A CREATOR ON THE RACK. Not one of these films' captions says
    what its maker's pronouns are, and a name tells you nobody's. He, she and
    their object forms are refused in the rack's fields; they are written round.

  - A FILM WITH NO RUNTIME, and A SCREEN THAT HAS ONE. make-club.py's pair, for
    its reason: a film has a length and a playlist we keep adding to does not.

  - A FILM WITH NO MAKERS, NO CHANNEL OR NO LINE OF OURS, and an `ours` link
    that is not one of our own pages. A card is an introduction, and an
    introduction that does not say who made the thing is crediting the shop.

  - A QUOTATION OVER THIRTY WORDS, or with no author, work or link.

  - AN ID THAT IS NOT A YOUTUBE ID, A LIST THAT IS NOT A PLAYLIST, OR A FRAME
    THIS SITE WILL NOT BUILD. The origins are READ out of love-embed.js.

  - AN HTML ENTITY IN ANY FIELD, and any missing marker pair.

EVERY CARD ON A RACK HAS A SECOND PRESS that puts its film on the rack's own
screen in place of the programme (Ryan's ask, 2026-09-28). It is written here,
hidden, beside the card's own plate, and picture-house.js unhides it and does
the swap with loveEmbed.frameUrl, so this tool refuses a page that does not
load that script: without it every second button would stay hidden and nobody
would know it was meant to be there. Only a screen with a rack under it gets
the now-showing line and the way back.

WHAT IT DOES NOT CHECK, on purpose: whether the rack still matches the playlist.
That needs the network; the rack is a mirror and the room says so, with the
date. check-jukebox.py is what notices a film that has died.

EVERY FRAME ASKS FOR CAPTIONS (cc_load_policy=1). That was tested framed from a
page, on a single film and on a playlist, because loading an embed URL on its
own gives Error 153 for every video and proves nothing either way.
"""
import colorsys
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data/picture-house.json"
ROOM = ROOT / "lightbulb-picture-house.html"
NOTES = ROOT / "liner-notes.html"
CSS = ROOT / "love.css"

WORDS = 30
ID = re.compile(r"^[A-Za-z0-9_-]{11}$")
LIST = re.compile(r"^PL[A-Za-z0-9_-]{10,40}$")
RUNTIME = re.compile(r"^(?:\d+:)?[0-5]?\d:[0-5]\d$")
ENTITY = re.compile(r"&(?:[a-zA-Z][a-zA-Z0-9]{1,31}|#\d{1,6}|#x[0-9a-fA-F]{1,6});")
OURS = ("https://stimpunks.org/",)
EMBED = "https://www.youtube-nocookie.com/embed/"

NEGATION = (r"(?:no|not|nothing|never|neither|none|without|refuses?|refused|refusing|"
            r"cannot|does not|won't|will not|is not|are not|isn't|aren't|nobody|nor|"
            r"declin\w+)")
AWARENESS = (r"puzzle[- ]?pieces?|puzzle ribbons?|light(?:ing|s)? it up blue|autism awareness|"
             r"cur(?:e|es|ed|ing)\b|suffer(?:s|ed|ing)? from|(?:high|low)[- ]functioning|"
             r"special needs|afflicted|(?:person|people|child|children|individuals?|those) "
             r"with autism")
AW_RE = re.compile(rf"\b(?:{AWARENESS})", re.I)
AW_OK = re.compile(rf"\b{NEGATION}\b[^.]{{0,70}}?\b(?:{AWARENESS})", re.I)
PRONOUN = re.compile(r"\b(?:he|him|his|himself|she|her|hers|herself)\b", re.I)

problems = []


def origins():
    js = (ROOT / "love-embed.js").read_text()
    block = re.search(r"var ORIGINS = \[(.*?)\];", js, re.S)
    if not block:
        raise SystemExit("REFUSING: love-embed.js has no ORIGINS array, so this tool cannot "
                         "tell\nwhether a screen's frame points somewhere this site will build.")
    return tuple(re.findall(r"'(https://[^']+)'", block.group(1)))


def sweep(text, where):
    text = re.sub(r"“[^”]*”", " ", str(text))
    for m in AW_RE.finditer(text):
        window = text[max(0, m.start() - 80):m.end()]
        if AW_OK.search(window):
            continue
        problems.append(f"{where}: {m.group(0)!r} -- that is the vocabulary of the awareness "
                        "campaigns autistic people have been refusing for years. See the "
                        "docstring.")


def no_entity(v, where):
    if ENTITY.search(str(v)):
        problems.append(f"{where} carries an HTML entity; write the character.")


def check_card(f, where, seen):
    """One card on either rack. The rules are the same card's rules wherever it hangs."""
    if not ID.match(str(f.get("id", ""))):
        problems.append(f"{where}: {f.get('id')!r} is not a YouTube id.")
    if f.get("id") in seen:
        problems.append(f"{where}: the id is on this rack twice.")
    seen.add(f.get("id"))
    if not RUNTIME.match(str(f.get("runtime", ""))):
        problems.append(f"{where}: no runtime. Every press says how long before the press.")
    for need in ("title", "makers", "channel", "about"):
        if not str(f.get(need, "")).strip():
            problems.append(f"{where}: no {need}.")
    if "content" not in f:
        problems.append(f"{where}: no `content` key. Null means somebody looked and found "
                        "nothing to warn about; a missing key means nobody looked.")
    for need in ("makers", "about", "content"):
        v = f.get(need) or ""
        no_entity(v, f"{where} {need}")
        m = PRONOUN.search(re.sub(r"“[^”]*”", " ", str(v)))
        if m:
            problems.append(f"{where} {need}: {m.group(0)!r}. No creator's pronouns are "
                            "stated in any of these films; write round them.")
        if need != "makers":
            sweep(v, f"{where} {need}")
    no_entity(f.get("title", ""), f"{where} title")


# ── No blue ──────────────────────────────────────────────────────────────────
def blue(hexstr):
    h = hexstr.lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    r, g, b = (int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
    hue, light, sat = colorsys.rgb_to_hls(r, g, b)
    return 170 <= hue * 360 <= 265 and sat > 0.12 and 0.06 < light < 0.97


css = CSS.read_text()
root = css[css.index(":root {"):css.index("\n}", css.index(":root {"))]
palette = dict(re.findall(r"(--lph-[a-z0-9-]+):\s*(#[0-9A-Fa-f]{3,6})\b", root))
if not palette:
    problems.append("love.css's :root declares no --lph- colours, so there is nothing to hold "
                    "to the no-blue rule and the room has no palette.")
for name, hexv in palette.items():
    if blue(hexv):
        problems.append(f"{name} is {hexv}, which is blue. Nothing in this building is blue; "
                        "see the docstring.")
sec = re.search(r"/\* §\d+ ── ROOM: The Lightbulb Picture House.*?(?=/\* §\d+ ── )", css, re.S)
if not sec:
    problems.append("love.css has no section for The Lightbulb Picture House.")
else:
    for hexv in re.findall(r"#[0-9A-Fa-f]{6}\b|#[0-9A-Fa-f]{3}\b", sec.group(0)):
        if blue(hexv):
            problems.append(f"the room's section in love.css paints {hexv}, which is blue.")
    for r_, g_, b_ in re.findall(r"rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)", sec.group(0)):
        hexv = "#%02x%02x%02x" % (int(r_), int(g_), int(b_))
        if blue(hexv):
            problems.append(f"the room's section in love.css paints rgb({r_}, {g_}, {b_}), which "
                            "is blue.")

# ── The data ─────────────────────────────────────────────────────────────────
d = json.loads(DATA.read_text())
screens = d.get("screens") or []
rack = d.get("rack") or []
two = d.get("screen_two") or []
campfire = d.get("campfire") or []
aw = d.get("awareness") or {}
page_src = ROOM.read_text()

if len(str(aw.get("text", "")).split()) > WORDS:
    problems.append(f"the awareness quotation is over {WORDS} words.")
for need in ("text", "who", "work", "url", "via"):
    if not str(aw.get(need, "")).strip():
        problems.append(f"the awareness quotation has no {need}.")
    no_entity(aw.get(need, ""), f"the awareness quotation's {need}")

for sc in screens:
    where = f"screen {sc.get('id')!r}"
    if not LIST.match(str(sc.get("list", ""))):
        problems.append(f"{where}: {sc.get('list')!r} is not a playlist id.")
    if "runtime" in sc:
        problems.append(f"{where} carries a runtime. It is a list we keep adding to; see "
                        "make-club.py.")
    for f in ("name", "title", "note"):
        if not str(sc.get(f, "")).strip():
            problems.append(f"{where}: no {f}.")
        no_entity(sc.get(f, ""), f"{where} {f}")
    sweep(sc.get("note", ""), f"{where} note")
    if f"<!-- lph-screen:{sc.get('id')}:begin -->" not in page_src:
        problems.append(f"{where}: no markers in {ROOM.name}.")

ORIGINS = origins()
if not any(EMBED.startswith(o) for o in ORIGINS):
    problems.append(f"{EMBED} is not an origin love-embed.js will frame.")

if not rack:
    problems.append("the rack is empty.")
seen = set()
for i, f in enumerate(rack, 1):
    where = f"rack card {i} ({f.get('title', 'no title')!r})"
    check_card(f, where, seen)
    ours = f.get("ours")
    if ours is not None and not str(ours.get("url", "")).startswith(OURS):
        problems.append(f"{where}: `ours` points at {ours.get('url')!r}, which is not one of "
                        "our own pages.")

# ── Screen Three: the campfire rack ─────────────────────────────────────────
POST = re.compile(r"^https://stimpunks\.org/(\d{4})/(\d{2})/(\d{2})/[a-z0-9-]+/$")
DATE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
MIRROR = Path.home() / "Documents/Claude/Projects/Stimpunks Knowledge System/site/stimpunks.org/posts"


def mirror_posts():
    if not MIRROR.is_dir():
        print("  (the Knowledge System mirror is not on this machine, so the campfire posts "
              "were not checked against it)")
        return None
    found = {}
    for md in MIRROR.glob("*.md"):
        head = md.read_text(encoding="utf-8").split("---", 2)[1]
        u = re.search(r'^url:\s*"(.*)"', head, re.M)
        t = re.search(r'^title:\s*"(.*)"', head, re.M)
        if u and t:
            found[u.group(1)] = t.group(1)
    return found


def plain(s):
    return re.sub(r"\s+", " ", html.unescape(str(s))).strip()


screen_ids = [sc.get("id") for sc in screens]
if campfire and "three" not in screen_ids:
    problems.append("there is a campfire rack and no Screen Three for it to hang under.")
if "three" in screen_ids and not any(c.get("films") for c in campfire):
    problems.append("Screen Three has no campfire rack under it.")
posts = mirror_posts() if campfire else None
seen = set()
last = None
for c in campfire:
    post = c.get("post") or {}
    where = f"campfire {c.get('date')!r} ({post.get('title', 'no post')!r})"
    if not DATE.match(str(c.get("date", ""))):
        problems.append(f"{where}: no date, as YYYY-MM-DD.")
    elif last is not None and c["date"] >= last:
        problems.append(f"{where} comes after {last} and is not older than it. The rack is newest "
                        "first, because new campfires go on at the top of the playlist.")
    else:
        last = c["date"]
    if not POST.match(str(post.get("url", ""))):
        problems.append(f"{where}: {post.get('url')!r} is not a stimpunks.org post address "
                        "(https://stimpunks.org/YYYY/MM/DD/slug/, with the trailing slash).")
    if not str(post.get("title", "")).strip():
        problems.append(f"{where}: the post has no title.")
    no_entity(post.get("title", ""), f"{where} post title")
    if posts is not None and post.get("url"):
        if post["url"] not in posts:
            problems.append(f"{where}: the mirror has no post at {post['url']}.")
        elif plain(posts[post["url"]]) != plain(post.get("title", "")):
            problems.append(f"{where}: the mirror titles that post {posts[post['url']]!r}.")
    films = c.get("films") or []
    if films and "off_screen" in c:
        problems.append(f"{where} has films on the screen and an `off_screen` reason; it is one "
                        "or the other.")
    if not films and not str(c.get("off_screen", "")).strip():
        problems.append(f"{where} has no films and no `off_screen` reason saying why none of "
                        "what it watched can be on the playlist.")
    no_entity(c.get("off_screen", ""), f"{where} off_screen")
    sweep(c.get("off_screen", ""), f"{where} off_screen")
    for i, f in enumerate(films, 1):
        check_card(f, f"{where}, film {i} ({f.get('title', 'no title')!r})", seen)

seen = set()
for i, f in enumerate(two, 1):
    where = f"Screen Two's rack, card {i} ({f.get('title', 'no title')!r})"
    check_card(f, where, seen)
    ours = f.get("ours")
    if ours is not None and not str(ours.get("url", "")).startswith(OURS):
        problems.append(f"{where}: `ours` points at {ours.get('url')!r}, which is not one of "
                        "our own pages.")

if '<script src="picture-house.js" defer></script>' not in page_src:
    problems.append(f"{ROOM.name} does not load picture-house.js, so every card's second button "
                    "would ship hidden and stay hidden. Load it after love-embed.js.")
for m in ("lph-rack", "lph-awareness") + (("lph-rack-two",) if two else ()) + \
        (("lph-campfire",) if campfire else ()):
    if f"<!-- {m}:begin -->" not in page_src:
        problems.append(f"{ROOM.name} has no {m} markers.")

if problems:
    raise SystemExit("REFUSING to build The Lightbulb Picture House:\n  " + "\n  ".join(problems))


# ── Writing ──────────────────────────────────────────────────────────────────
def swap(page, marker, block, indent=""):
    src = page.read_text()
    begin, end = f"<!-- {marker}:begin -->", f"<!-- {marker}:end -->"
    if begin not in src or end not in src:
        raise SystemExit(f"REFUSING: {page.name} has no {marker} markers.")
    page.write_text(re.sub(re.escape(begin) + r".*?" + re.escape(end),
                           lambda _m: begin + "\n" + block + "\n" + indent + end,
                           src, flags=re.S))


def esc(s):
    return html.escape(str(s), quote=False)


def attr(s):
    return html.escape(str(s), quote=True)


def when(iso):
    y, m, d_ = iso.split("-")
    return f"{int(d_)} {MONTHS[int(m) - 1]} {y}"


MONTHS = ("January", "February", "March", "April", "May", "June", "July", "August",
          "September", "October", "November", "December")


def big(f, screen, name, card):
    """The card's second press: the same film on the rack's own screen, in place of the programme."""
    return (f'\n        <button type="button" class="lph-card__big" hidden data-lph-screen="{screen}" '
            f'data-lph-name="{attr(name)}" data-lph-src="{attr(film_src(f["id"]))}" '
            f'data-lph-title="{attr(f["title"])}, {attr(f["channel"])}, on {attr(name)}" '
            f'data-lph-film="{attr(f["title"])}" data-lph-runtime="{attr(f["runtime"])}" '
            f'aria-describedby="{card}-t">Play on {esc(name)} instead &mdash; {esc(f["runtime"])}</button>')


def film_src(vid):
    return f"{EMBED}{vid}?autoplay=1&rel=0&cc_load_policy=1"


def list_src(lst):
    return f"{EMBED}videoseries?list={lst}&autoplay=1&cc_load_policy=1"


swap(ROOM, "lph-awareness",
     f'    <blockquote class="lph-said">\n'
     f'      <p>{esc(aw["text"])}</p>\n'
     f'      <cite>{esc(aw["who"])}, <a href="{attr(aw["url"])}">{esc(aw["work"])}</a>, '
     f'as quoted in our <a href="{attr(aw["via"])}">Acceptance</a> entry</cite>\n'
     f'    </blockquote>', "")

RACKED = {"one": bool(rack), "two": bool(two), "three": any(c.get("films") for c in campfire)}
screen_name = {sc["id"]: sc["name"] for sc in screens}

for sc in screens:
    racked = RACKED.get(sc["id"], False)
    glass = f' data-lph-screen="{sc["id"]}"' if racked else ""
    now = (f'\n    <p class="lph-screen__now" id="lph-now-{sc["id"]}" tabindex="-1" hidden></p>\n'
           f'    <p class="lph-screen__back" hidden><button type="button" class="lph-back" '
           f'id="lph-back-{sc["id"]}" data-lph-screen="{sc["id"]}">Take it off and put the whole '
           f'programme back</button></p>') if racked else ""
    swap(ROOM, f"lph-screen:{sc['id']}",
         f'    <h2 id="lph-screen-{sc["id"]}-h"><span class="lph-screen__num">{esc(sc["name"])}</span> '
         f'{esc(sc["title"])}</h2>\n'
         f'    <p class="lph-screen__note">{esc(sc["note"])}</p>\n'
         f'    <div class="lph-proscenium"{glass}>\n'
         f'      <button type="button" class="facade" data-embed-src="{attr(list_src(sc["list"]))}" '
         f'data-embed-title="{attr(sc["title"])}, on YouTube">\n'
         f'        Start the programme &mdash; runs until you stop it, captions on\n'
         f'        <span class="facade__play">&#9654; PRESS PLAY</span>\n'
         f'      </button>\n'
         f'    </div>{now}\n'
         f'    <p class="lph-screen__credit">No runtime on a whole screen: it is a playlist we '
         f'keep adding to, and a total would be wrong the next time it changed. '
         f'<a href="https://www.youtube.com/playlist?list={attr(sc["list"])}">{esc(sc["title"])}</a>, '
         f'on YouTube, from our own channel.</p>', "")


def card(f, n, prefix, screen, when_line="", ours=None):
    """One card, on whichever rack. Every rack's cards are the same card."""
    cid = f"{prefix}-{f['id']}"
    content = (f'\n        <p class="lph-card__content"><span class="lph-card__label">Before you '
               f'press:</span> {esc(f["content"])}</p>') if f.get("content") else ""
    whenp = f'\n        <p class="lph-card__when">{when_line}</p>' if when_line else ""
    oursp = (f'\n        <p class="lph-card__ours"><a href="{attr(ours["url"])}">'
             f'{esc(ours["name"])} &rarr;</a></p>') if ours else ""
    return (f'      <li class="lph-card" id="{attr(cid)}">\n'
            f'        <p class="lph-card__n" aria-hidden="true">{n:02d}</p>{whenp}\n'
            f'        <h3 class="lph-card__title" id="{attr(cid)}-t">{esc(f["title"])}</h3>\n'
            f'        <p class="lph-card__makers">{esc(f["makers"])}</p>\n'
            f'        <p class="lph-card__about">{esc(f["about"])}</p>{content}\n'
            f'        <button type="button" class="facade" data-embed-src="{attr(film_src(f["id"]))}" '
            f'data-embed-title="{attr(f["title"])}, {attr(f["channel"])}">\n'
            f'          Play &mdash; {esc(f["runtime"])}\n'
            f'          <span class="facade__play">&#9654; PRESS PLAY</span>\n'
            f'        </button>{big(f, screen, screen_name[screen], cid)}\n'
            f'        <p class="lph-card__credit">{esc(f["runtime"])} &middot; on YouTube, via '
            f'{esc(f["channel"])}</p>{oursp}\n'
            f'      </li>')


def fold(screen, cards):
    """EVERY RACK FOLDS AWAY (Ryan's ask, 2026-09-28), as a <details> that works with no
    script, and it SHIPS OPEN. Shut, its cards have no layout, so check-contrast-live.py and
    check-focus.py would walk past every card on the page and report a clean run over text they
    never measured -- a rack a visitor can fold is fine; a rack the checkers cannot see is not."""
    return (f'    <details class="lph-fold" open>\n'
            f'      <summary class="lph-fold__sum">The cards for {esc(screen_name[screen])}</summary>\n'
            f'    <ol class="lph-rack">\n' + "\n".join(cards) + '\n    </ol>\n'
            f'    </details>')


swap(ROOM, "lph-rack",
     fold("one", [card(f, n, "film", "one", ours=f.get("ours")) for n, f in enumerate(rack, 1)]) + '\n'
     f'    <p class="lph-from">Carded from the playlist on {esc(d["_checked"])}, in its own order. '
     f'The playlist is ours and we keep adding to it, so Screen One may be showing a film by now '
     f'that the rack has no card for yet.</p>', "")

if two:
    swap(ROOM, "lph-rack-two",
         fold("two", [card(f, n, "two", "two", ours=f.get("ours")) for n, f in enumerate(two, 1)]) + '\n'
         f'    <p class="lph-from">Carded from the playlist on {esc(d["_two_checked"])}, in its own '
         f'order. The playlist is ours and we keep adding to it, so Screen Two may be showing a film '
         f'by now that the rack has no card for yet.</p>', "")

if campfire:
    cards = []
    n = 0
    for c in campfire:
        for f in c.get("films") or []:
            n += 1
            cards.append(card(f, n, "campfire", "three", f"At the campfire of {when(c['date'])}",
                              {"url": c["post"]["url"], "name": c["post"]["title"]}))
    off = [f'      <li><a href="{attr(c["post"]["url"])}">{esc(c["post"]["title"])}</a> &middot; '
           f'{when(c["date"])} &middot; {esc(c["off_screen"])}</li>'
           for c in campfire if not c.get("films")]
    off_block = ('\n    <p class="lph-two__h">Watched at a campfire, and not on this screen:</p>\n'
                 '    <ul class="lph-two lph-off">\n' + "\n".join(off) + '\n    </ul>') if off else ""
    swap(ROOM, "lph-campfire",
         fold("three", cards) + off_block + '\n'
         f'    <p class="lph-from">Carded on {esc(d["_campfire_checked"])} from our own campfire '
         f'posts, newest first, which is the playlist&rsquo;s own order. New campfires go on at '
         f'the top of the playlist, so Screen Three may be showing one by now that the rack has '
         f'no card for yet.</p>', "")

credited = set()
rows = []
for f in rack + two + [f for c in campfire for f in c.get("films") or []]:
    if f["id"] in credited:
        continue
    credited.add(f["id"])
    rows.append(f'      <tr><td>{esc(f["title"])}</td><td><strong>{esc(f["makers"])}</strong></td>'
                f'<td>{esc(f["channel"])}</td><td>{esc(f["runtime"])}</td></tr>')
swap(NOTES, "picture-house-credits", "\n".join(rows), "      ")

# ── The page's own copy, swept ───────────────────────────────────────────────
page = ROOM.read_text()
page = re.sub(r"<!-- quest:.*?:end -->", " ", page, flags=re.S)
page = re.sub(r"<!--.*?-->", " ", page, flags=re.S)
page = re.sub(r"<(script|style|svg|head)\b.*?</\1>", " ", page, flags=re.S)
page = re.sub(r"<blockquote\b.*?</blockquote>", " ", page, flags=re.S)
page = re.sub(r'<h[23][^>]*>.*?</h[23]>', " ", page, flags=re.S)
page = re.sub(r"<[^>]+>", " ", page)
page = html.unescape(re.sub(r"\s+", " ", page))
before = len(problems)
sweep(page, ROOM.name)
if len(problems) > before:
    raise SystemExit("REFUSING, on the published page:\n  " + "\n  ".join(problems[before:]))

warned = sum(1 for f in rack if f.get("content"))
lit = [f for c in campfire for f in c.get("films") or []]
print(f"picture house: {len(screens)} screens; {len(rack)} cards on Screen One's rack and {len(two)} on Screen Two's, in {ROOM.name}")
if campfire:
    print(f"  {len(lit)} cards on the campfire rack from {len(campfire)} campfires, "
          f"{sum(1 for f in lit if f.get('content'))} saying something before the press; "
          f"{sum(1 for c in campfire if not c.get('films'))} campfires listed as not on the screen")
print(f"  {warned} cards say something before the press besides the runtime; "
      f"{len(palette)} colours in the palette and none of them blue")
print(f"  {len(rows)} credit rows in {NOTES.name}")
