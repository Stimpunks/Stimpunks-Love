#!/usr/bin/env python3
"""Build Show Your Work's garage, its quotations, its bench and its credits, from data/show-your-work.json.

ONE DATA FILE, ONE TOOL, TWO SURFACES, the contract make-yells.py set. The room
is a garage on the street with the door rolled up, where the work of folks in
our community is shown before it is finished (Ryan's brief, 2026-10-23). It is
led by the show your work philosophy and how we practise it, out of three pages
of ours and our Scenius entry: Show Your Work, our Infodumplings post Show Your
Work, One Card at a Time, and Default to Open. This tool writes, between
syw:<part> markers in show-your-work.html:

  · THE GARAGE (syw:garage): seen from the driveway with the door rolled up,
    the day coming in off the street and running out before the back wall, a
    card pinned over the bench for every piece of work on it and one blank,
    the tools on their shadow board, and a box of cards with their backs to
    you. Lifted whole by make-og.py for the share card.
  · EVERY SECTION WITH A QUOTATION IN IT (syw:share, syw:scenius,
    syw:practice, syw:consent), block by block.
  · THE BENCH (syw:bench), THE THREE PLACES TO SHOW YOUR WORK (syw:places),
    WHAT TO SEND FOR THE BENCH (syw:ask), WHAT IS NOT IN THIS GARAGE
    (syw:rules), NEXT DOOR (syw:elsewhere) and THE CREDITS (syw:credits), with
    a table of the quotations in liner-notes.html.

WHAT IT REFUSES, and the first three are the room:

  · A PIECE OF WORK ITS MAKER DID NOT TURN OVER. Every piece on the bench names
    whose it is as they asked to be named, who said yes and on what day, where
    it lives, and the state it is in in words; what it is carries `words`,
    `maker` or `ours`, and the card says which. Any key the bench does not
    know is refused. Where a piece names
    words in its own repository (`checked`) and that repository is on the
    machine, the words have to be there, and the maker's own words have to be
    there too, so a card cannot go on saying a deck is a starter draft after
    it stops being one. `holds` does the same against a page of ours.
  · A RANKING. Featured, best of, work of the month, winners, top ten, most
    liked, staff picks, spotlights. A showcase is exactly the shape of page
    that grows one, and it would turn a scene into a contest between our own
    people. The bench is in the order things arrived and the tool does not
    sort it.
  · A COUNT. Likes, views, followers, subscribers, engagement, a number of
    works, and make-dead-tired.py's tally with `points` narrowed. The friendly
    edit is a heart under every card.
  · A PITCH. Investors, monetising, hustle, personal brand, growing an
    audience, going viral, portfolio-ready, polished. Our post says a show
    your work night is not a pitch competition, and Kleon's book is read as
    marketing advice often enough that the room has to say which reading it
    takes.
  · GENIUS. Calling anybody a genius, a prodigy, gifted, talented, brilliant
    or a savant, which is scenius turned back into genius and, for the last
    one, the stereotype Autistic people are handed most. The window lets the
    room say nobody is one, and talk about the lone genius as a story.
  · MARKING. Grades, ratings, stars, critique: our post says the room is not
    there to audit a draft against a standard of done.
  · A PHOTOGRAPH THE POLAROID WALL WOULD NOT HANG. Ryan's call, 2026-10-23: a
    card can carry a photograph of the work under the wall's rules, so `photo`
    names a record in data/polaroids.json, never a file, and the tool refuses
    one with no record, a record that does not list this page in `elsewhere`
    or is booked for Enid's wall as well, and a record with no file. Everything
    else the wall promises (alt text, who is in it and who took it, the date
    of the yes, no camera data, nothing filtered, and withdrawal as deletion on
    every page) is make-polaroids.py's, which walks this page like every other;
    the image wears class="photo" so that walk can see it, and its alt text is
    the record's, never typed here. Withdrawal is deleting the record, the file
    and the `photo` line, and make-polaroids.py refuses until all three are
    gone.

  Each is swept in the room's own words with the negation window, and the
  sweep SKIPS BLOCKQUOTES and a maker's own words on the bench, Dead Tired
  Society's reason: Kleon's line says "talented", and a quotation that argues
  against a word has to be allowed to contain it.

  · A QUOTATION over the cap in the data, with no author, no work and no link
    (unless it is ours), with an HTML entity in it, or read off anything but a
    page of ours in `pages`. AND, WHERE THE KNOWLEDGE SYSTEM MIRROR IS ON THE
    MACHINE, ONE THAT IS NOT ON THAT PAGE WORD FOR WORD, make-community-care.py's
    comparison exactly. Where the mirror is missing, it says so and carries on.
  · A NEXT-DOOR LINE WHOSE ROOM NO LONGER SAYS IT (`holds`, read off that room's
    published page), the Community Center's service-board rule.
  · AN <img> ON THE PAGE THAT IS NOT A BENCH CARD'S PHOTOGRAPH, which would be
    a picture with no card saying whose work it is.
  · A FORM, AN INPUT, A TEXTAREA OR ANYTHING EDITABLE outside the job marker,
    and any script but love.js and quest.js. Nothing in the garage takes words;
    the channel and the forum do. The friendly edit is an upload box "so people
    can put their own work up", and that is a stranger's file on a page
    everybody reads, with nobody having said yes to anything.
  · A MISSING MARKER PAIR. A generator that writes nothing and exits 0 is how
    two surfaces drift apart.

WHAT IT DOES NOT CHECK, on purpose: how many pieces of work are on the bench.
The drawing pins one card for each and wraps them when the wall is full.
"""
import html
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import imgsize  # tools/imgsize.py: width and height read off the file, never typed

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data/show-your-work.json"
ROOM = ROOT / "show-your-work.html"
NOTES = ROOT / "liner-notes.html"
FORUM = ROOT / "data/forum.json"
LIB = ROOT / "netlify/cb/lib.mjs"
FACES = ROOT / "data/foundry-faces.json"
POLAROIDS = ROOT / "data/polaroids.json"
PHOTOS = ROOT / "photos"
PHOTO_SUFFIXES = (".jpg", ".jpeg", ".png", ".webp")
MIRROR = Path.home() / "Documents/Claude/Projects/Stimpunks Knowledge System/site/stimpunks.org"
REPOS = Path.home() / "Documents/GitHub"
FORUM_SLUG = "show-your-work"

ENTITY = re.compile(r"&(?:[a-zA-Z][a-zA-Z0-9]{1,31}|#\d{1,6}|#x[0-9a-fA-F]{1,6});")
LINK = re.compile(r"\[([^\]]+)\]\(([^)\s]+)\)")
BOLD = re.compile(r"\*\*(.+?)\*\*")
DATE = re.compile(r"\b20\d\d-\d\d-\d\d\b")

NEGATION = (r"(?:no|not|nothing|never|neither|none|without|refuses?|refused|refusing|"
            r"cannot|does not|won't|will not|is not|are not|isn't|aren't|nobody|nor|declin\w+)")

RANK = (r"featured|best of|best work|work of the (?:week|month|year)|winners?|winning|"
        r"top (?:\d+|ten|five|three)|most (?:liked|viewed|popular|loved)|staff picks?|"
        r"editor'?s picks?|spotlight\w*|leaderboards?|ranked|rankings?|showcase of the")
COUNT = (r"likes\b|liked by|like (?:counts?|buttons?)|\d+ likes|view counts?|page ?views|\d+ views|"
         r"followers?|subscribers?|engagement|upvotes?|hearts? (?:under|on|beside)|"
         r"\d+ (?:works|projects|pieces|makers)|tall(?:y|ies)|tallied|scores?|scored|scoring|"
         r"\d+\s*points?|points?\s+(?:for|per|each|awarded|earned|available)|streaks?|"
         r"progress bar")
PITCH = (r"pitch(?:es|ing)?|investors?|monetis\w+|monetiz\w+|hustle|personal brand\w*|"
         r"grow (?:your|an) (?:audience|following|brand)|go(?:es|ing)? viral|viral|influencers?|"
         r"clout|portfolio-ready|polished")
GENIUS = r"genius(?:es)?|prodig(?:y|ies)|gifted|talented|brilliant|savants?"
MARKING = r"grades?|graded|grading|ratings?|rated|stars? out of|out of (?:five|ten|\d+)|critiques?|\bcrits?\b|marked down"

SWEEPS = [
    (RANK, "", "nothing on the bench is ranked; the bench is in the order things arrived."),
    (COUNT, "", "nothing in this garage is counted, and nobody's work gets a number under it."),
    (PITCH, "", "a show your work night is not a pitch competition, our post's own words."),
    # Talking about the lone genius as a story is the room's argument; calling
    # anybody one is not.
    (GENIUS, r"|lone|story|myth|concept of the", "scenius, not genius: nobody here is called a genius, "
     "a prodigy, gifted, talented, brilliant or a savant."),
    (MARKING, "", "nobody's draft is marked against a standard of done."),
]
SWEEPS = [(re.compile(rf"\b(?:{p})", re.I),
           re.compile(rf"(?:\b{NEGATION}\b{extra})[^.]{{0,70}}?\b(?:{p})", re.I), why)
          for p, extra, why in SWEEPS]

SCRIPTS = {"love.js", "quest.js"}
BENCH_KEYS = {"key", "title", "whose", "given", "link", "also", "what", "words", "from",
              "state", "licence", "checked", "holds", "photo"}

problems = []


def refuse(msg):
    problems.append(msg)


def esc(s):
    return html.escape(str(s), quote=False)


def attr(s):
    return html.escape(str(s), quote=True)


def fold(s):
    return re.sub(r"\s+", " ", str(s)).strip()


def plain_md(s):
    """The mirror's Markdown with only what is not words taken off: images,
    footnote markers, link targets, emphasis and blockquote markers.
    make-community-care.py's, exactly."""
    s = re.sub(r"!\[[^\]]*\]\([^)]*\)", " ", s)
    s = re.sub(r"\[\d+\]\(#[^)]*\)", "", s)
    s = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", s)
    s = s.replace("**", "").replace("*", "")
    s = re.sub(r"^\s*>\s?", "", s, flags=re.M)
    s = re.sub(r"^\s*-\s+", "", s, flags=re.M)
    return fold(s)


def page_text(name):
    p = ROOT / name
    if not p.is_file():
        return None
    main = re.search(r"<main\b.*?</main>", p.read_text(), re.S)
    return fold(html.unescape(re.sub(r"<[^>]+>", " ", main.group(0) if main else ""))).lower()


def sweep(text, where):
    text = str(text)
    for rx, ok, why in SWEEPS:
        for m in rx.finditer(text):
            window = text[max(0, m.start() - 80):m.end()]
            if ok.search(window):
                continue
            refuse(f"{where}: {m.group(0)!r} -- {why}")


def address_ok(url):
    return bool(re.match(r"^https?://", url) or re.match(r"^[a-z0-9-]+\.html(?:#[\w/=-]*)?$", url)
                or re.match(r"^#[a-z0-9-]+$", url))


def ours(text, where):
    """Our own words: no entity, a link only to an address or a page of ours,
    swept for the room's refusals."""
    text = str(text)
    if ENTITY.search(text):
        refuse(f"{where}: carries an HTML entity. Everything is escaped on the way in; write the character.")
    for _, url in LINK.findall(text):
        if not address_ok(url):
            refuse(f"{where}: {url!r} is neither an address nor a page of ours.")
    sweep(BOLD.sub(r"\1", LINK.sub(r"\1", text)), where)


def linked(text):
    """Escape, then make [words](address) a link and **words** strong. The
    brackets and asterisks survive escaping."""
    out = LINK.sub(lambda m: f'<a href="{attr(html.unescape(m.group(2)))}">{m.group(1)}</a>', esc(text))
    return BOLD.sub(r"<strong>\1</strong>", out)


def host(url):
    m = re.match(r"^https?://(?:www\.)?([^/]+)", url)
    return m.group(1) if m else None


# ── The data ─────────────────────────────────────────────────────────────────
d = json.loads(DATA.read_text())
pages = d.get("pages") or {}
quotes = d.get("quotes") or {}
sections = d.get("sections") or {}
bench = d.get("bench") or []
cap = int(d.get("words") or 0)
if not cap:
    refuse("data/show-your-work.json has no `words` cap, and the room prints one.")

mirror_ok = MIRROR.is_dir()
mirror_text = {}
for key, pg in pages.items():
    for need in ("title", "url", "mirror"):
        if not str(pg.get(need, "")).strip():
            refuse(f"pages.{key}: no {need}.")
    if not str(pg.get("url", "")).startswith("https://stimpunks.org/") or not str(pg.get("url", "")).endswith("/"):
        refuse(f"pages.{key}: {pg.get('url')!r} is not one of our pages on stimpunks.org, with its trailing slash.")
    if mirror_ok:
        f = MIRROR / pg.get("mirror", "")
        if not f.is_file():
            refuse(f"pages.{key}: the mirror has no {pg.get('mirror')}, so nothing read off it can be checked.")
            continue
        raw = f.read_text()
        m = re.search(r'^url:\s*"([^"]+)"', raw, re.M)
        if not m or m.group(1) != pg["url"]:
            refuse(f"pages.{key}: {pg['mirror']} in the mirror is {m.group(1) if m else 'no page'}, not {pg['url']}.")
        mirror_text[key] = plain_md(raw.split("\n---", 1)[-1])

used = set()
for qid, q in quotes.items():
    where = f"quote {qid}"
    text = str(q.get("text", ""))
    n = len(text.split())
    if not n:
        refuse(f"{where}: no text.")
    if n > cap:
        refuse(f"{where}: {n} words against a cap of {cap}. It is printed in the room; raise it in the data "
               "on purpose, with the reason, or quote less.")
    if not str(q.get("who", "")).strip():
        refuse(f"{where}: no `who`. Every line here names who said it.")
    if q.get("who") != "Stimpunks":
        if not str(q.get("work", "")).strip():
            refuse(f"{where}: somebody else's line with no `work`. Do not fill it from memory.")
        if not re.match(r"^https?://", str(q.get("url", ""))):
            refuse(f"{where}: a work with no link to it.")
    if q.get("read_on") not in pages:
        refuse(f"{where}: `read_on` is not one of `pages`, and every quotation here was read on a page of ours.")
    for field, v in q.items():
        if ENTITY.search(str(v)):
            refuse(f"{where}: {field} carries an HTML entity.")
    if mirror_ok and q.get("read_on") in mirror_text and fold(text) not in mirror_text[q["read_on"]]:
        refuse(f"{where}: not on {pages[q['read_on']]['url']} word for word. Re-copy it from our page; "
               "never loosen the check.")

for name, blocks in sections.items():
    for j, b in enumerate(blocks, 1):
        where = f"sections.{name} block {j}"
        if "q" in b:
            if b["q"] not in quotes:
                refuse(f"{where}: quotes {b['q']!r}, which is not in `quotes`.")
            used.add(b["q"])
        elif "p" in b:
            ours(b["p"], where)
        else:
            refuse(f"{where}: a block is a q or a p, and this is neither.")
for qid in quotes:
    if qid not in used:
        refuse(f"quote {qid}: in the data and on no section, so its credit would claim a line the room does not print.")

# THE BENCH. In the order it is in the file, which is the order things arrived.
seen = set()
for i, w in enumerate(bench, 1):
    where = f"bench {i} ({w.get('key')})"
    for k in w:
        if k not in BENCH_KEYS:
            refuse(f"{where}: {k!r} is not something the bench holds. A photograph is `photo`, the id of its "
                   "record in data/polaroids.json; see _photo.")
    for need in ("key", "title", "whose", "given", "link", "state"):
        if not str(w.get(need, "")).strip():
            refuse(f"{where}: no {need}. A piece goes on the bench only with whose it is, who said yes and when, "
                   "where it lives and what state it is in.")
    if w.get("key") in seen:
        refuse(f"{where}: the key is used twice.")
    seen.add(w.get("key"))
    if not DATE.search(str(w.get("given", ""))):
        refuse(f"{where}: `given` names no day. Who said yes, and when, is the whole of the bench's terms.")
    if not re.match(r"^https?://", str(w.get("link", ""))):
        refuse(f"{where}: `link` is not an address anybody can open.")
    for a in w.get("also") or []:
        if not str(a.get("words", "")).strip() or not address_ok(str(a.get("url", ""))):
            refuse(f"{where}: an `also` link needs its words and an address or a page of ours.")
    if w.get("what"):
        if w.get("words") not in ("maker", "ours"):
            refuse(f"{where}: what it is carries no `words`, maker or ours, and the card has to say whose words they are.")
        if w.get("words") == "maker" and not str(w.get("from", "")).strip():
            refuse(f"{where}: the maker's own words with no `from` saying where they were said.")
    for field in ("title", "whose", "state", "licence"):
        if ENTITY.search(str(w.get(field, ""))):
            refuse(f"{where}: {field} carries an HTML entity.")
    for field in ("state", "licence"):
        ours(w.get(field, ""), f"{where} ({field})")
    if w.get("words") == "ours":
        ours(w.get("what", ""), f"{where} (what)")
    # Words in the work's own repository, read there when it is on the machine.
    chk = w.get("checked")
    if chk:
        repo = REPOS / str(chk.get("repo", ""))
        if repo.is_dir():
            found = ""
            for fn, holds in (chk.get("files") or {}).items():
                f = repo / fn
                if not f.is_file():
                    refuse(f"{where}: {chk['repo']} has no {fn}, which the card's terms are read from.")
                    continue
                t = fold(f.read_text())
                found += " " + t
                for h in holds:
                    if fold(h) not in t:
                        refuse(f"{where}: {chk['repo']}/{fn} no longer says {h!r}, and the card says so on its "
                               "behalf. Change the card with it.")
            if w.get("words") == "maker" and fold(w.get("what", "")) not in found:
                refuse(f"{where}: the card says its maker's own words and {chk['repo']} does not say them. "
                       "Copy them again from where they were said.")
    for pg, holds in (w.get("holds") or {}).items():
        t = page_text(pg)
        if t is None:
            refuse(f"{where}: no page {pg}.")
            continue
        for h in holds:
            if fold(h).lower() not in t:
                refuse(f"{where}: {pg} no longer says {h!r}, and the card says so on its behalf.")

# A PHOTOGRAPH ON A CARD IS A POLAROID RECORD. The record is the consent; this
# only checks that the card and the record agree about where it hangs.
records = {r.get("id"): r for r in json.loads(POLAROIDS.read_text()).get("photos", [])}
photo_file = {}
for i, w in enumerate(bench, 1):
    pid = w.get("photo")
    if not pid:
        continue
    where = f"bench {i} ({w.get('key')})"
    rec = records.get(pid)
    if not rec:
        refuse(f"{where}: photo {pid!r} has no record in data/polaroids.json. A photograph goes on a card only "
               "under the polaroid wall's rules, and the record is where they are kept.")
        continue
    if rec.get("on_wall") is not False or ROOM.name not in (rec.get("elsewhere") or []):
        refuse(f"{where}: the record for {pid!r} does not say it hangs on {ROOM.name} and nowhere on Enid's wall "
               "(on_wall false, elsewhere naming this page), so withdrawing it would not find this card.")
    for need in ("alt", "subject", "consent_on"):
        if not str(rec.get(need, "")).strip():
            refuse(f"{where}: the record for {pid!r} has no {need}.")
    f = next((PHOTOS / f"{pid}{s}" for s in PHOTO_SUFFIXES if (PHOTOS / f"{pid}{s}").exists()), None)
    if not f:
        refuse(f"{where}: {pid!r} has a record and no file in photos/. If it was withdrawn, take the `photo` "
               "line off the card too.")
        continue
    photo_file[pid] = f

blank = d.get("blank") or {}
for need in ("title", "line"):
    if not str(blank.get(need, "")).strip():
        refuse(f"blank: no {need}. The bench always ends in a blank card.")
ours(blank.get("title", ""), "blank (title)")
ours(blank.get("line", ""), "blank (line)")

places = d.get("places") or {}
for need in ("channel", "forum", "bench"):
    if not str(places.get(need, "")).strip():
        refuse(f"places: no {need}. The room says what each of its three places is for.")
    ours(places.get(need, ""), f"places.{need}")
for i, a in enumerate(d.get("ask") or [], 1):
    ours(a, f"ask {i}")
if not d.get("ask"):
    refuse("ask: the room says what to send for the bench, and there is nothing to say.")
ours(d.get("after", ""), "after")

for i, r in enumerate(d.get("not_here") or [], 1):
    for need in ("name", "line"):
        if not str(r.get(need, "")).strip():
            refuse(f"not_here {i}: no {need}.")
    ours(r.get("name", ""), f"not_here {i}")
    ours(r.get("line", ""), f"not_here {i}")

for i, e in enumerate(d.get("elsewhere") or [], 1):
    where = f"elsewhere {i} ({e.get('page')})"
    t = page_text(str(e.get("page", "")))
    if t is None:
        refuse(f"{where}: no such page.")
        continue
    ours(e.get("line", ""), where)
    for w in e.get("holds") or []:
        if fold(w).lower() not in t:
            refuse(f"{where}: that room no longer says {w!r}, and this room says it on its behalf. Change "
                   "the line with the room, and its holds with it.")
    if not e.get("holds"):
        refuse(f"{where}: no holds. A line about another room has to name the words there that carry it.")

# WHO READS THE CHANNEL, AND FOR HOW LONG; HOW LONG THE FORUM KEEPS A TOPIC.
# Read rather than typed, make-community-care.py's arrangement, so neither goes
# quietly wrong when somebody changes it where it lives.
life = re.search(r"export const LIFE_DAYS = (\d+);", LIB.read_text())
if not life:
    refuse("netlify/cb/lib.mjs has no LIFE_DAYS, and the room says how long a message stays.")
LIFE_WORDS = {7: "a week", 14: "two weeks", 21: "three weeks", 28: "four weeks"}
cats = {c["slug"]: c for c in json.loads(FORUM.read_text())["categories"]}
cat = cats.get(FORUM_SLUG)
if not cat or not cat.get("keep") or cat.get("see") or cat.get("start"):
    refuse(f"data/forum.json has no open {FORUM_SLUG} category with a keep, and the room links it as the "
           "place anybody on the forums can write their work up.")

if problems:
    raise SystemExit("REFUSING to build Show Your Work:\n  " + "\n  ".join(problems))


# ── The garage ───────────────────────────────────────────────────────────────
# One-point perspective from the driveway, at standing height. Everything is
# placed by depth `s` (1 at the door, smaller further in), so the box, the bench
# and the cards on the wall all agree about where the back wall is.
W, H = 1200, 440
X0, X1, Y0, Y1 = 70, 1130, 46, 380      # the opening: jambs, header, threshold
VX, VY = 600, 172                        # where everything goes to: eye height
BACK = 0.6
FOOT = (Y1 - Y0) / 8.5                   # the opening is eight and a half feet high


def at(x, y, s):
    """A point on the door's plane, carried s of the way in."""
    return VX + (x - VX) * s, VY + (y - VY) * s


def num(v):
    return f"{v:.1f}".rstrip("0").rstrip(".")


def poly(points, fill, extra=""):
    pts = " ".join(f"{num(x)},{num(y)}" for x, y in points)
    return f'<polygon points="{pts}" fill="{fill}"{extra}/>'


bx0, by0 = at(X0, Y0, BACK)
bx1, by1 = at(X1, Y1, BACK)

defs = (
    # The day comes in level off the street and runs out before the back wall:
    # the floor and both walls go from the concrete the day lands on to the
    # garage's own dark. Stops written as style, so var() is read.
    '<linearGradient id="syw-floor" gradientUnits="userSpaceOnUse" x1="0" y1="380" x2="0" y2="296">'
    '<stop offset="0" style="stop-color:var(--syw-concrete)"/><stop offset="1" style="stop-color:var(--syw-wall)"/>'
    '</linearGradient>'
    '<linearGradient id="syw-left" gradientUnits="userSpaceOnUse" x1="70" y1="0" x2="282" y2="0">'
    '<stop offset="0" style="stop-color:var(--syw-steel)"/><stop offset="1" style="stop-color:var(--syw-shade)"/>'
    '</linearGradient>'
    '<linearGradient id="syw-right" gradientUnits="userSpaceOnUse" x1="1130" y1="0" x2="918" y2="0">'
    '<stop offset="0" style="stop-color:var(--syw-steel)"/><stop offset="1" style="stop-color:var(--syw-shade)"/>'
    '</linearGradient>'
)

parts = []
# The street side: the house's siding round the opening, and the driveway.
parts.append(f'<rect x="0" y="0" width="{W}" height="{H}" fill="var(--syw-day)"/>')
for y in range(8, Y0, 9):
    parts.append(f'<path d="M0 {y} H{W}" stroke="var(--syw-concrete)" stroke-width="1"/>')
for x0, x1 in ((0, X0), (X1, W)):
    for y in range(Y0 + 8, Y1, 9):
        parts.append(f'<path d="M{x0} {y} H{x1}" stroke="var(--syw-concrete)" stroke-width="1"/>')
parts.append(f'<rect x="0" y="{Y1}" width="{W}" height="{H - Y1}" fill="var(--syw-day)"/>')
parts.append(f'<path d="M0 {Y1 + 22} H{W} M{VX} {Y1} V{H}" stroke="var(--syw-concrete)" stroke-width="1.4"/>')

# Inside: ceiling, walls, floor, back wall.
parts.append(poly([(X0, Y0), (X1, Y0), (bx1, by0), (bx0, by0)], "var(--syw-shade)"))
parts.append(poly([(X0, Y0), (bx0, by0), (bx0, by1), (X0, Y1)], "url(#syw-left)"))
parts.append(poly([(X1, Y0), (bx1, by0), (bx1, by1), (X1, Y1)], "url(#syw-right)"))
parts.append(poly([(X0, Y1), (X1, Y1), (bx1, by1), (bx0, by1)], "url(#syw-floor)"))
parts.append(poly([(bx0, by0), (bx1, by0), (bx1, by1), (bx0, by1)], "var(--syw-wall)"))

# The door, rolled up: its panels lie along the ceiling on two tracks, and its
# bottom edge, with the handle, is what you see at the top of the opening.
DOOR = 0.7
for x in (X0 + 14, X1 - 14):
    a, b = at(x, Y0 + 4, 1), at(x, Y0 + 4, BACK)
    parts.append(f'<path d="M{num(a[0])} {num(a[1])} L{num(b[0])} {num(b[1])}" stroke="var(--syw-steel)" stroke-width="2.4"/>')
dl, dr = at(X0 + 14, Y0 + 6, DOOR), at(X1 - 14, Y0 + 6, DOOR)
parts.append(poly([(X0 + 14, Y0 + 6), (X1 - 14, Y0 + 6), dr, dl], "var(--syw-door)"))
for k in range(1, 4):
    s = 1 - (1 - DOOR) * k / 4
    a, b = at(X0 + 14, Y0 + 6, s), at(X1 - 14, Y0 + 6, s)
    parts.append(f'<path d="M{num(a[0])} {num(a[1])} H{num(b[0])}" stroke="var(--syw-steel)" stroke-width="1.4"/>')
parts.append(f'<rect x="{X0 + 14}" y="{Y0 + 2}" width="{X1 - X0 - 28}" height="9" fill="var(--syw-door)"/>')
parts.append(f'<path d="M{X0 + 14} {Y0 + 11} H{X1 - 14}" stroke="var(--syw-steel)" stroke-width="1.6"/>')
parts.append(f'<rect x="{VX - 26}" y="{Y0 + 11}" width="52" height="6" rx="2" fill="var(--syw-steel)"/>')
# The header and the jambs' edge, where the outside stops.
parts.append(f'<path d="M{X0} {Y1} V{Y0} H{X1} V{Y1}" fill="none" stroke="var(--syw-concrete)" stroke-width="3"/>')

# The bench against the back wall.
BS = 0.64
TOPY = Y1 - 3 * FOOT


def bench_pt(x, s, up=0.0):
    return at(x, Y1 - up * FOOT, s)


bl0, br0 = bench_pt(170, BACK, 3), bench_pt(1030, BACK, 3)
bl1, br1 = bench_pt(170, BS, 3), bench_pt(1030, BS, 3)
parts.append(poly([bl0, br0, br1, bl1], "var(--syw-door)"))
apron = 0.28 * FOOT * BS
parts.append(f'<rect x="{num(bl1[0])}" y="{num(bl1[1])}" width="{num(br1[0] - bl1[0])}" height="{num(apron)}" fill="var(--syw-steel)"/>')
floor_y = at(0, Y1, BS)[1]
for x in (bl1[0] + 6, br1[0] - 14):
    parts.append(f'<rect x="{num(x)}" y="{num(bl1[1] + apron)}" width="8" height="{num(floor_y - bl1[1] - apron)}" fill="var(--syw-steel)"/>')
shelf_y = at(0, Y1 - 0.8 * FOOT, BS)[1]
parts.append(f'<rect x="{num(bl1[0] + 6)}" y="{num(shelf_y)}" width="{num(br1[0] - bl1[0] - 12)}" height="4" fill="var(--syw-steel)"/>')

# THE SHADOW BOARD on the left of the back wall: every tool hangs inside the
# outline painted round it, so you can see where each one goes, and one outline
# is empty because its tool is out being used.
TOOLS = [
    # hammer: handle and head
    ('M0 0 h6 v56 h-6 z M-10 -6 h26 v12 h-26 z', 0, 0),
    # saw: blade and handle
    ('M0 0 h14 v4 l-2 52 h-10 l-2 -52 z M-2 -14 h18 v14 h-18 z', 1, 0),
    # wrench: shank and open jaw
    ('M3 8 h6 v50 h-6 z M-2 0 h16 v10 h-5 v-5 h-6 v5 h-5 z', 2, 0),
    # scissors: two rings and two blades
    ('M-1 0 a6 6 0 1 0 0.1 0 z M13 0 a6 6 0 1 0 0.1 0 z M2 10 l4 46 l4 -46 z', 3, 0),
    # paintbrush: handle, ferrule, bristles
    ('M3 0 h6 v34 h-6 z M1 34 h10 v8 h-10 z M0 42 h12 l-2 16 h-8 z', 4, 0),
    # screwdriver, out being used: only its outline is here
    ('M2 0 h8 v22 h-8 z M5 22 h2 v32 h-2 z', 5, 1),
]
sb_x, sb_y = bx0 + 26, by0 + 36
step = 42
for path, k, empty in TOOLS:
    x, y = sb_x + k * step, sb_y
    g = f'<g transform="translate({num(x)} {num(y)})">'
    g += f'<path d="{path}" fill="var(--syw-wall)" stroke="var(--syw-outline)" stroke-width="5" stroke-linejoin="round"/>'
    if not empty:
        g += f'<path d="{path}" fill="var(--syw-steel)"/>'
    g += '</g>'
    parts.append(g)

# THE BENCH'S CARDS, pinned on the wall over it: one for every piece of work,
# in the order they arrived, and a blank one after them. They wrap into a second
# row when the wall is full, and get smaller rather than run off it.
cards = len(bench) + 1
area_x0, area_x1 = bx0 + 300, bx1 - 22
area_y1 = bl0[1] - 10
cw, ch, gap = 46, 58, 14
per_row = max(1, int((area_x1 - area_x0 + gap) // (cw + gap)))
rows = -(-cards // per_row)
while rows > 2:
    cw, ch, gap = cw * 0.85, ch * 0.85, gap * 0.85
    per_row = max(1, int((area_x1 - area_x0 + gap) // (cw + gap)))
    rows = -(-cards // per_row)
for i in range(cards):
    r, c = divmod(i, per_row)
    x = area_x0 + c * (cw + gap)
    y = area_y1 - (rows - r) * (ch + gap) + gap
    is_blank = i == cards - 1
    if is_blank:
        parts.append(f'<rect x="{num(x)}" y="{num(y)}" width="{num(cw)}" height="{num(ch)}" fill="var(--syw-wall)" '
                     f'stroke="var(--syw-card)" stroke-width="1.8" stroke-dasharray="5 4"/>')
    elif bench[i].get("photo"):
        # A piece with a photograph on its card is pinned up with a picture of
        # it, drawn as a print with a white border: what is in it is in words
        # under the card on the page, never in this drawing.
        parts.append(f'<rect x="{num(x)}" y="{num(y)}" width="{num(cw)}" height="{num(ch)}" fill="var(--syw-card)"/>')
        parts.append(f'<rect x="{num(x + cw * 0.12)}" y="{num(y + ch * 0.14)}" width="{num(cw * 0.76)}" '
                     f'height="{num(ch * 0.5)}" fill="var(--syw-steel)"/>')
        for k in range(2):
            ly = y + ch * (0.76 + k * 0.12)
            parts.append(f'<path d="M{num(x + cw * 0.15)} {num(ly)} h{num(cw * (0.7 if k else 0.5))}" stroke="var(--syw-steel)" stroke-width="1.6" stroke-linecap="round"/>')
    else:
        parts.append(f'<rect x="{num(x)}" y="{num(y)}" width="{num(cw)}" height="{num(ch)}" fill="var(--syw-card)"/>')
        for k in range(4):
            ly = y + ch * (0.36 + k * 0.14)
            lw = cw * (0.7 if k % 2 else 0.55)
            parts.append(f'<path d="M{num(x + cw * 0.15)} {num(ly)} h{num(lw)}" stroke="var(--syw-steel)" stroke-width="1.6" stroke-linecap="round"/>')
    # A strip of masking tape across the top, a little off true.
    parts.append(poly([(x + cw * 0.2, y - 5), (x + cw * 0.82, y - 3), (x + cw * 0.8, y + 5), (x + cw * 0.18, y + 3)],
                      "var(--syw-tape)", ' fill-opacity=".92"'))

# A box of cards at the far end of the bench, every one standing with its back
# to you: work nobody has turned over yet, and nobody here will turn it for them.
bx = br0[0] - 104
top = bl0[1]
for k in range(5):
    x = bx + 6 + k * 13
    y = top - 46 + (k % 2) * 6
    parts.append(f'<rect x="{num(x)}" y="{num(y)}" width="30" height="40" rx="2" fill="var(--syw-back)" '
                 f'stroke="var(--syw-card)" stroke-width="1.2"/>')
    parts.append(f'<rect x="{num(x + 5)}" y="{num(y + 5)}" width="20" height="30" fill="none" '
                 f'stroke="var(--syw-card)" stroke-width=".8" stroke-opacity=".7"/>')
parts.append(f'<rect x="{num(bx)}" y="{num(top - 16)}" width="86" height="16" fill="var(--syw-steel)"/>')

garage = (f'  <svg class="syw-garage" viewBox="0 0 {W} {H}" aria-hidden="true" focusable="false">'
          f'<defs>{defs}</defs>{"".join(parts)}</svg>')


# ── Writing ──────────────────────────────────────────────────────────────────

def swap(page, marker, block, indent="  "):
    src = page.read_text()
    begin, end = f"<!-- {marker}:begin -->", f"<!-- {marker}:end -->"
    if begin not in src or end not in src:
        raise SystemExit(
            f"REFUSING: {page.name} has no {marker} markers, so there is nowhere to write.\n"
            "Put them back rather than letting this tool go quiet -- a generator that\n"
            "writes nothing and exits 0 is how two surfaces drift apart.")
    page.write_text(re.sub(re.escape(begin) + r".*?" + re.escape(end),
                           lambda _m: begin + "\n" + block + "\n" + indent + end, src, flags=re.S))


def source(q):
    """Who said it and where, beside the words. Somebody else's line says it
    was read on our page; our own says only which page it is."""
    pg = pages[q["read_on"]]
    page_link = f'<a href="{attr(pg["url"])}">{esc(pg["title"])}</a>'
    if q["who"] == "Stimpunks":
        return f'Stimpunks, {page_link}'
    work = f'<a href="{attr(q["url"])}">{esc(q["work"])}</a>'
    return f'{esc(q["who"])}, {work}, read on our {page_link} page'


def quote(qid):
    q = quotes[qid]
    return (f'    <blockquote class="syw-quote">\n'
            f'      <p>{esc(q["text"])}</p>\n'
            f'      <footer class="syw-quote__who">{source(q)}</footer>\n'
            f'    </blockquote>')


def section(name):
    out = []
    for b in sections[name]:
        out.append(quote(b["q"]) if "q" in b else f'    <p>{linked(b["p"])}</p>')
    return "\n".join(out)


def away(url, words):
    """A link off the street says where it goes, the CB's ↗ host rule."""
    h = host(url)
    tail = f' <span class="syw-host">&#8599; {esc(h)}</span>' if h else ""
    return f'<a href="{attr(url)}">{esc(words)}</a>{tail}'


def photo_html(w):
    """The photograph, from its record: the record's alt text, the file's own
    size, class="photo" so make-polaroids.py walks it, and nothing that crops
    or filters it. Whose photograph it is goes under it in words."""
    rec, f = records[w["photo"]], photo_file[w["photo"]]
    wd, ht = imgsize.size(f)
    shot = rec.get("photographer")
    by = (f"Photograph by {esc(shot)}, used here with permission and outside this site&rsquo;s licence. "
          f"It comes down the moment they ask." if shot else
          "The photograph is used here with permission and outside this site&rsquo;s licence. It comes down "
          "the moment its maker asks.")
    return (f'        <figure class="syw-card__picture"><img class="photo syw-card__photo" src="photos/{attr(f.name)}" '
            f'width="{wd}" height="{ht}" alt="{attr(rec["alt"])}" loading="lazy">'
            f'<figcaption class="syw-card__said">{by}</figcaption></figure>')


def card(w):
    lines = [f'      <li class="syw-card" id="work-{attr(w["key"])}">',
             *([photo_html(w)] if w.get("photo") else []),
             f'        <h3>{esc(w["title"])}</h3>',
             f'        <p class="syw-card__whose">{esc(w["whose"])}</p>']
    if w.get("what"):
        said = (f'In its maker&rsquo;s own words, from {esc(w["from"])}' if w["words"] == "maker"
                else "In our words")
        lines.append(f'        <p class="syw-card__what">{esc(w["what"])}</p>')
        lines.append(f'        <p class="syw-card__said">{said}</p>')
    lines.append(f'        <p class="syw-card__state"><strong>Where it is:</strong> {linked(w["state"])}</p>')
    if w.get("licence"):
        lines.append(f'        <p class="syw-card__state"><strong>How you may use it:</strong> {linked(w["licence"])}</p>')
    links = [away(w["link"], "Where it lives")]
    for a in w.get("also") or []:
        links.append(away(a["url"], a["words"]) if re.match(r"^https?://", a["url"])
                     else f'<a href="{attr(a["url"])}">{esc(a["words"])}</a>')
    lines.append('        <p class="syw-card__links">' + " &middot; ".join(links) + "</p>")
    lines.append("      </li>")
    return "\n".join(lines)


swap(ROOM, "syw:garage", garage)
for name in sections:
    swap(ROOM, f"syw:{name}", section(name), "    ")

blank_li = (f'      <li class="syw-card syw-card--blank">\n'
            f'        <h3>{esc(blank["title"])}</h3>\n'
            f'        <p>{linked(blank["line"])}</p>\n'
            f'      </li>')
swap(ROOM, "syw:bench", '    <ol class="syw-bench">\n' + "\n".join(card(w) for w in bench) + "\n"
     + blank_li + "\n    </ol>", "    ")

forum_href = f"forum.html#/c/{FORUM_SLUG}"
places_html = [
    '    <ol class="syw-places">',
    '      <li class="syw-place">',
    '        <h3>Today: this room&rsquo;s channel</h3>',
    f'        <p>{linked(places["channel"])}</p>',
    f'        <p class="syw-place__terms">Tune the radio to <b>This room</b> while you are in here, or open '
    f'<a href="chat.html#show-your-work">Show Your Work on the chat page</a>, under Community. Everybody signed '
    f'on to the CB can read it, and unless our administrators set this channel otherwise, every message on it goes {LIFE_WORDS.get(int(life.group(1)), life.group(1) + " days")} after it was sent; the radio says what it keeps, first under <b>In this channel</b>.'
    f' Not on the CB yet? <a href="community-center.html#getting-started">Getting started</a> says how '
    f'to get an invite.</p>',
    '      </li>',
    '      <li class="syw-place">',
    f'        <h3>Longer: <a href="{forum_href}">{esc(cat["name"])}</a> in the forums</h3>',
    f'        <p>{linked(places["forum"])}</p>',
    f'        <p class="syw-place__terms">The category says it is for {esc(cat["about"][0].lower() + cat["about"][1:])} '
    f'A topic there goes {esc(cat["keep"])} after its last post, so a piece people keep talking about keeps '
    f'going. Anybody signed on to the CB can read the forums and write in them.</p>',
    '      </li>',
    '      <li class="syw-place">',
    '        <h3>For as long as you like: <a href="#on-the-bench">the bench</a></h3>',
    f'        <p>{linked(places["bench"])}</p>',
    '        <p class="syw-place__terms">The house puts it up when you ask, and takes it down the moment you '
    'ask again. What to send is just below.</p>',
    '      </li>',
    '    </ol>',
]
swap(ROOM, "syw:places", "\n".join(places_html), "    ")

ask_html = ['    <ul class="syw-ask">'] + [f'      <li>{linked(a)}</li>' for a in d["ask"]] + ['    </ul>',
            f'    <p>{linked(d["after"])}</p>']
swap(ROOM, "syw:ask", "\n".join(ask_html), "    ")

rules = [f'      <li><strong>{esc(r["name"])}</strong> {linked(r["line"])}</li>' for r in d["not_here"]]
swap(ROOM, "syw:rules", '    <ul class="syw-rules">\n' + "\n".join(rules) + "\n    </ul>", "    ")

nexts = [f'      <li><a href="{attr(e["page"])}">{esc(e["name"])}</a>, {linked(e["line"])}</li>'
         for e in d["elsewhere"]]
swap(ROOM, "syw:elsewhere", '    <ul class="syw-next">\n' + "\n".join(nexts) + "\n    </ul>", "    ")

# THE CREDITS: whose every line is, the type read off its own record, and the cap.
faces = json.loads(FACES.read_text())["faces"]
display, text_face = faces["cabin-sketch"], faces["sen"]
if text_face["licence"] != display["licence"]:
    raise SystemExit("REFUSING: the two faces are under different licences now, and the credit says both.")
whos = []
for q in quotes.values():
    if q["who"] != "Stimpunks" and q["who"] not in whos:
        whos.append(q["who"])
names = ", ".join(whos[:-1]) + " and " + whos[-1]
read_on = ", ".join(f'<a href="{attr(pg["url"])}">{esc(pg["title"])}</a>'
                    for k, pg in pages.items() if any(q["read_on"] == k for q in quotes.values()))
credits = [
    "      <li><strong>The garage is ours</strong>, made as code by Claude, an AI model made by Anthropic, to "
    "Ryan&rsquo;s brief, and nothing on this page calls an AI while you read it. Nobody is drawn in it: the "
    "work is on show, and the people who made it are not.</li>",
    f"      <li><strong>Every quotation belongs to whoever said it</strong> and is credited to them where it stands: "
    f"{esc(names)}, and our own pages. Show Your Work! is Austin Kleon&rsquo;s book, and our "
    '<a href="https://stimpunks.org/philosophy/show-your-work/">Show Your Work</a> page is built round it; the '
    "longer passages stay there. The created serendipity line is credited to the blog our page names, and to "
    "nobody&rsquo;s name, because our page gives none. The words around them are ours, written for this "
    "room.</li>",
    "      <li><strong>The work on the bench is its makers&rsquo;</strong>, under whatever terms its card gives, "
    "and the card says whose words describe it.</li>",
    f"      <li>Every quotation in this room is {cap} words or fewer and was read on one of our own pages, "
    f"{read_on}, on {esc(d['read'])}. <code>tools/make-show-your-work.py</code> checks each one against those "
    "pages word for word whenever our copy of stimpunks.org is on the machine.</li>",
    f"      <li>The type is {esc(display['family'])}, by {esc(display['designer'])}, a sketch of a typeface with "
    f"its pencil work left in, for the room&rsquo;s name and its headings, and {esc(text_face['family'])}, by "
    f"{esc(text_face['designer'])}, for everything you read. Both under the "
    f'{esc(display["licence"].replace(" 1.1", ""))}, read off their own records. More in '
    '<a href="liner-notes.html#show-your-work">the liner notes</a>.</li>',
]
swap(ROOM, "syw:credits", '    <ul class="syw-credits">\n' + "\n".join(credits) + "\n    </ul>", "    ")

notes = []
for qid, q in quotes.items():
    pg = pages[q["read_on"]]
    work = (f'<a href="{attr(q["url"])}">{esc(q["work"])}</a>' if q.get("work") else
            f'<a href="{attr(pg["url"])}">{esc(pg["title"])}</a>')
    notes.append(f'      <tr><td><strong>{esc(q["who"])}</strong></td><td>{work}</td>'
                 f'<td><a href="{attr(pg["url"])}">{esc(pg["title"])}</a></td>'
                 f'<td>{len(q["text"].split())} words</td></tr>')
swap(NOTES, "show-your-work-credits", "\n".join(notes), "      ")

# ── The published page, checked ──────────────────────────────────────────────
# AFTER the write, so what is checked is what is published.
src = ROOM.read_text()
body = re.sub(r"<!-- quest:.*?:end -->", " ", src, flags=re.S)
body = re.sub(r"<!--.*?-->", " ", body, flags=re.S)

for tag in re.findall(r"<(form|input|textarea|select)\b", body, re.I):
    refuse(f"{ROOM.name}: a <{tag}> outside the job marker. Nothing in this garage takes words or files; the "
           "channel and the forum do.")
if re.search(r"contenteditable", body, re.I):
    refuse(f"{ROOM.name}: something editable outside the job marker.")
for s in re.findall(r'<script\b[^>]*\bsrc="([^"]+)"', src):
    if s not in SCRIPTS:
        refuse(f"{ROOM.name}: loads {s}, and the room runs {', '.join(sorted(SCRIPTS))} and nothing else.")
if not re.search(r'href="forum\.html#/c/' + FORUM_SLUG + '"', src):
    refuse(f"{ROOM.name}: no link to the {FORUM_SLUG} forum, and the room is half of a pair with it.")
bench_photos = {f"photos/{f.name}" for f in photo_file.values()}
for src_ in re.findall(r'<img\b[^>]*\bsrc="([^"]+)"', body, re.I):
    if src_ not in bench_photos:
        refuse(f"{ROOM.name}: an <img> of {src_} that is no bench card's photograph, so no card says whose "
               "work it is. A photograph goes on the page only through a card's `photo`.")

text = re.sub(r"<(script|style)\b.*?</\1>", " ", body, flags=re.S)
text = re.sub(r"<blockquote\b.*?</blockquote>", " ", text, flags=re.S)
text = re.sub(r'<p class="syw-card__what">.*?</p>', " ", text, flags=re.S)
text = re.sub(r"<head\b.*?</head>", " ", text, flags=re.S)
text = html.unescape(fold(re.sub(r"<[^>]+>", " ", text)))
sweep(text, ROOM.name)
if problems:
    raise SystemExit("REFUSING, on the published page:\n  " + "\n  ".join(problems))

longest = max(len(q["text"].split()) for q in quotes.values())
print(f"show your work: the door is up, {len(quotes)} quotations and the bench in {ROOM.name}")
print(f"  longest quotation {longest} words against a cap of {cap}; "
      + ("every one checked against the mirror word for word" if mirror_ok
         else "the Knowledge System mirror is not on this machine, so the quotations were not re-read"))
print("  nothing ranked, nothing counted, nobody pitched, nobody a genius, nothing marked")
