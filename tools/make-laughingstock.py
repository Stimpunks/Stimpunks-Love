#!/usr/bin/env python3
"""Build Laughingstock's stage, its bill, its acts' lines, and the credits, from data/laughingstock.json.

ONE DATA FILE, ONE TOOL, TWO SURFACES -- the contract make-yells.py set and
every generator here has kept since. The stage is our own Disabled Comedy
playlist put on whole; the bill is every set on it, one press each; the acts are
the two comics our Campfire Learn Together watched, with their own lines set in
the spotlight. The credits go to liner-notes.html.

WHAT IT REFUSES, and the first two are the room:

  - THE VOCABULARY OF INSPIRATION, IN OUR OWN VOICE. Brave, courageous,
    inspiring, an inspiration, overcoming, despite their disability, suffers
    from, wheelchair-bound. The write-up this room is built on says it in as
    many words: disabled comedians are not inspiring for being on stage, they
    are comics who happen to be disabled, and inspiration exploitation is the
    trap that means even bombing is treated as a TED Talk. THE FRIENDLY EDIT IS
    A REAL ONE AND IT WILL ARRIVE: somebody being kind about a room full of
    disabled comics reaches for "brave" before anything else, and one sentence
    of it would turn the page into the thing the page is about. It is swept with
    the negation window, so the house rules can still say that nobody is called
    brave.

    NARROWED RATHER THAN EXCEPTED. `inspiration` on its own is not refused,
    because "inspiration exploitation" is one of our own glossary entries and
    "the inspiration column" is the write-up's own phrase for the trap -- a flat
    ban would refuse the room's argument against the thing, which is
    check-counts.py's first-run lesson. What is refused is calling somebody it:
    inspiring, inspirational, AN inspiration, inspires us.

    THE SWEEP READS THE HOUSE AND NOTHING IN THE LIGHT. Blockquotes are skipped,
    because the only blockquotes in the room are the comics' own lines standing
    in the spot, and "I suffer from people" has to be allowed to say suffer.
    Anything inside curly double quotation marks is skipped for the same reason:
    that is somebody else talking. And the set titles are skipped, because a
    title is the comic's or the channel's and it is still the title.

  - A HEADLINER, AND A RANKING. Nobody headlines here, nothing is the funniest
    or the best, and there is no top ten and no applause meter. A comedy bill
    runs opener to closer as a matter of trade, and a room whose whole argument
    is that disabled comics should be judged on their actual work has no
    business ordering seven of them by status. The pebbling cabinet's refusal of
    a tally, arriving at a club. The bill is in the playlist's own order, which
    is ours and is not re-sorted.

  - A SET WITH NO RUNTIME, and A PLAYLIST THAT HAS ONE. make-club.py's pair, in
    one file, for its reason: a set has a length and a list we keep adding to
    does not, and today's total would be wrong next week and authoritative in
    the meantime. Do not make the two agree.

  - A SET THAT DOES NOT NAME ITS COMICS. The Den's rule, because the comics
    wrote every word of those sets and a credit to the channel alone would be
    crediting the shop that sold the record.

  - A LINE OVER THIRTY WORDS, or one with no context of ours beside it. The
    lines are quoted from our own write-up and credited to the comic whose line
    it is; the context sits OUT OF THE LIGHT, in the house, because it is ours.
    The write-up does not say which set each line comes from and this file does
    not guess -- a line credited to the wrong special would be the jukebox's
    guessed mapping arriving at a comedy club.

  - AN ID THAT IS NOT A YOUTUBE ID, A LIST THAT IS NOT A PLAYLIST, OR A FRAME
    THIS SITE WILL NOT BUILD. love-embed.js refuses quietly, which is a button
    somebody presses and presses. The origins are READ out of love-embed.js,
    make-club.py's reason: a copy of that list is a copy that goes stale.

  - AN ACT WITH NO MARKERS, OR MARKERS WITH NO ACT, and any missing marker
    pair. make-latibulum.py's rule: a generator that writes nothing and exits 0
    is how two surfaces drift apart.

  - AN HTML ENTITY IN ANY FIELD. Everything is escaped on the way into the
    page; write the character. data/toys.json's lesson.

WHAT IT DOES NOT CHECK, on purpose: whether the bill still matches the
playlist. That needs the network, and this tool does not touch it. The bill is
a mirror and drifts by design -- the room says so, with the date it was read --
and check-jukebox.py is what notices a set that has died.
"""
import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data/laughingstock.json"
ROOM = ROOT / "laughingstock.html"
NOTES = ROOT / "liner-notes.html"

WORDS = 30
ID = re.compile(r"^[A-Za-z0-9_-]{11}$")
LIST = re.compile(r"^PL[A-Za-z0-9_-]{10,40}$")
RUNTIME = re.compile(r"^(?:\d+:)?[0-5]?\d:[0-5]\d$")
ENTITY = re.compile(r"&(?:[a-zA-Z][a-zA-Z0-9]{1,31}|#\d{1,6}|#x[0-9a-fA-F]{1,6});")

NEGATION = (r"(?:no|not|nothing|never|neither|none|without|refuses?|refused|refusing|"
            r"cannot|does not|won't|will not|is not|are not|isn't|aren't|nobody|nor|"
            r"declin\w+)")

# CALLING SOMEBODY AN INSPIRATION, and the rest of the vocabulary that files a
# disabled person under it. See the docstring for why bare `inspiration` is not
# here.
INSPIRATION = (r"inspir(?:ing|ingly|ational(?:ly)?)\b|(?:an|such an|a real|so much) inspiration\b|"
               r"inspires? (?:us|me|everyone|everybody|people|all)\b|brave(?:ly|ry)?\b|"
               r"courag\w*|heroic\w*|overc(?:ome|omes|oming|ame)\b|"
               r"(?:despite|in spite of) (?:his|her|their|a|the) disabilit\w*|"
               r"suffer(?:s|ed|ing)? from|wheelchair[- ]bound|confined to a wheelchair|"
               r"special needs|differently[- ]abled|handi-?capable|victims? of")

# A HEADLINER AND A RANKING. `opener` is here as a status in a bill; "open" and
# "opening" as ordinary words are not.
RANKING = (r"headlin\w+|opener\b|opening act|closing act|funniest|(?:the )?best (?:set|comic|comedian|special)s?\b|"
           r"top (?:\d+|ten|five)\b|ranked|ranking|rated|ratings?\b|stars? out of|\d+\s*/\s*10\b|"
           r"applause meter|laughs? per minute|scores?\b|scored|leaderboards?")

INSP_RE = re.compile(rf"\b(?:{INSPIRATION})", re.I)
INSP_OK = re.compile(rf"\b{NEGATION}\b[^.]{{0,70}}?\b(?:{INSPIRATION})", re.I)
RANK_RE = re.compile(rf"\b(?:{RANKING})", re.I)
RANK_OK = re.compile(rf"\b{NEGATION}\b[^.]{{0,70}}?\b(?:{RANKING})", re.I)

problems = []


def origins():
    """The origins this site will build a frame for, READ out of love-embed.js
    rather than restated. make-club.py's docstring has the whole story."""
    js = (ROOT / "love-embed.js").read_text()
    block = re.search(r"var ORIGINS = \[(.*?)\];", js, re.S)
    if not block:
        raise SystemExit(
            "REFUSING: love-embed.js has no ORIGINS array, so this tool cannot tell\n"
            "whether the stage's frame points somewhere this site will actually build.")
    return tuple(re.findall(r"'(https://[^']+)'", block.group(1)))


def sweep(text, where):
    """Our own words, against the two vocabularies, each with a negation window.
    Anything inside curly double quotation marks is somebody else talking and is
    taken out first."""
    text = re.sub(r"“[^”]*”", " ", str(text))
    for rx, ok, why in ((INSP_RE, INSP_OK,
                         "nobody in this room is called brave or inspiring for getting on "
                         "a stage. See make-laughingstock.py's docstring."),
                        (RANK_RE, RANK_OK,
                         "nobody headlines and nothing is ranked. See _order.")):
        for m in rx.finditer(text):
            window = text[max(0, m.start() - 80):m.end()]
            if ok.search(window):
                continue
            problems.append(f"{where}: {m.group(0)!r} -- {why}")


def no_entity(v, where):
    if ENTITY.search(str(v)):
        problems.append(f"{where} carries an HTML entity. Everything here is escaped on "
                        "the way into the page; write the character.")


# ── The data ─────────────────────────────────────────────────────────────────
d = json.loads(DATA.read_text())
pl = d.get("playlist") or {}
sets = d.get("sets") or []
acts = d.get("acts") or []

if not LIST.match(str(pl.get("list", ""))):
    problems.append(f"the playlist id {pl.get('list')!r} is not a playlist id.")
if "runtime" in pl:
    problems.append(
        "the playlist carries a runtime. It is a list we keep adding to, and a total "
        "here would be wrong the next time it changed and authoritative in the meantime. "
        "make-club.py refuses the same thing for the same reason.")
for field in ("title", "channel", "note"):
    if not str(pl.get(field, "")).strip():
        problems.append(f"the playlist has no {field}.")
    no_entity(pl.get(field, ""), f"the playlist's {field}")
sweep(pl.get("note", ""), "the playlist's note")

stage_src = f"https://www.youtube-nocookie.com/embed/videoseries?list={pl.get('list', '')}"
if not any(stage_src.startswith(o) for o in origins()):
    problems.append(
        f"{stage_src} is not on an origin love-embed.js will build a frame for, so the "
        "stage would be a button nobody can make play.")

if not sets:
    problems.append("data/laughingstock.json has no sets, and the bill is made of them.")
seen = set()
for i, s in enumerate(sets, 1):
    where = f"set {i} ({s.get('title', 'no title')!r})"
    if not ID.match(str(s.get("id", ""))):
        problems.append(f"{where}: {s.get('id')!r} is not a YouTube id. love-embed.js "
                        "would refuse it quietly and the button would never become a video.")
    if s.get("id") in seen:
        problems.append(f"{where}: the id is on the bill twice.")
    seen.add(s.get("id"))
    if not RUNTIME.match(str(s.get("runtime", ""))):
        problems.append(f"{where}: no runtime. Every press-to-play control on this street "
                        "says how long before the press.")
    comics = s.get("comics") or []
    if not comics or not all(str(c).strip() for c in comics):
        problems.append(f"{where}: no comic named. The comics wrote every word of it, and a "
                        "credit to the channel alone credits the shop.")
    for field in ("title", "title_verbatim", "channel"):
        if not str(s.get(field, "")).strip():
            problems.append(f"{where}: no {field}.")
    for field, v in s.items():
        if isinstance(v, list):
            for x in v:
                no_entity(x, f"{where} {field}")
        else:
            no_entity(v, f"{where} {field}")
    if s.get("note"):
        sweep(s["note"], f"{where} (note)")

page_src = ROOM.read_text()
seen_act = set()
for a in acts:
    aid = str(a.get("id", ""))
    where = f"act {aid or 'with no id'}"
    seen_act.add(aid)
    if f"<!-- laughingstock:act:{aid}:begin -->" not in page_src:
        problems.append(f"{where}: no markers in {ROOM.name}. An act with nowhere to stand "
                        "is lines nothing renders.")
    if not str(a.get("name", "")).strip():
        problems.append(f"{where}: no name. Every line in the light says whose it is.")
    lines = a.get("lines") or []
    if not lines:
        problems.append(f"{where}: no lines.")
    for j, ln in enumerate(lines, 1):
        w = f"{where}, line {j}"
        n = len(str(ln.get("text", "")).split())
        if not n:
            problems.append(f"{w}: no text.")
        if n > WORDS:
            problems.append(f"{w}: {n} words against a limit of {WORDS}. A room built out "
                            "of somebody's lines becomes their set one good line at a time.")
        if not str(ln.get("context", "")).strip():
            problems.append(f"{w}: no context of ours beside it. A line with nothing of ours "
                            "next to it is somebody else's act reprinted for atmosphere.")
        no_entity(ln.get("text", ""), f"{w} text")
        no_entity(ln.get("context", ""), f"{w} context")
        sweep(ln.get("context", ""), f"{w} (context)")
for m in re.finditer(r"<!-- laughingstock:act:([a-z0-9-]+):begin -->", page_src):
    if m.group(1) not in seen_act:
        problems.append(f"{ROOM.name} has markers for an act called {m.group(1)!r} and the "
                        "data has no such act, so that space would sit empty.")

if problems:
    raise SystemExit("REFUSING to build Laughingstock:\n  " + "\n  ".join(problems))


# ── Writing ──────────────────────────────────────────────────────────────────

def swap(page, marker, block, indent=""):
    src = page.read_text()
    begin, end = f"<!-- {marker}:begin -->", f"<!-- {marker}:end -->"
    if begin not in src or end not in src:
        raise SystemExit(
            f"REFUSING: {page.name} has no {marker} markers, so there is nowhere to write.\n"
            "Put them back rather than letting this tool go quiet -- a generator that\n"
            "writes nothing and exits 0 is how two surfaces drift apart.")
    page.write_text(re.sub(re.escape(begin) + r".*?" + re.escape(end),
                           lambda _m: begin + "\n" + block + "\n" + indent + end,
                           src, flags=re.S))


def esc(s):
    return html.escape(str(s), quote=False)


def attr(s):
    return html.escape(str(s), quote=True)


def names(comics):
    comics = [esc(c) for c in comics]
    return comics[0] if len(comics) == 1 else ", ".join(comics[:-1]) + " and " + comics[-1]


# THE LINES IN THE LIGHT. The comic's line and their name stand in the spot; our
# context sits under it, in the house, because it is ours.
for a in acts:
    rows = []
    for ln in a["lines"]:
        rows.append(
            f'      <figure class="ls-line">\n'
            f'        <blockquote class="ls-spot">\n'
            f'          <p>&ldquo;{esc(ln["text"])}&rdquo;</p>\n'
            f'          <cite>{esc(a["name"])}</cite>\n'
            f'        </blockquote>\n'
            f'        <figcaption class="ls-line__ctx">{esc(ln["context"])}</figcaption>\n'
            f'      </figure>')
    swap(ROOM, f"laughingstock:act:{a['id']}",
         '      <div class="ls-lines">\n' + "\n".join(rows) + '\n      </div>', "")

swap(ROOM, "laughingstock:lines-credit",
     f'    <p class="ls-from">Every line in the light is quoted from our <a href="https://stimpunks.org/'
     f'2026/05/02/campfire-learn-together-being-disabled-can-be-pretty-funny/">write-up</a>, '
     f'belongs to the comic who said it, and is {WORDS} words or fewer. The write-up does not '
     f'say which set each one comes from, and neither do we. The line under each is ours.</p>', "")

# THE STAGE. The whole playlist, in its own order, with no runtime.
swap(ROOM, "laughingstock:stage",
     f'    <div class="ls-stageplate">\n'
     f'      <p class="ls-stageplate__note">{esc(pl["note"])}</p>\n'
     f'      <button type="button" class="facade" data-embed-src="{attr(stage_src)}" '
     f'data-embed-title="{attr(pl["title"])} on YouTube">\n'
     f'        Put the whole night on &mdash; runs until you stop it\n'
     f'        <span class="facade__play">&#9654; PRESS PLAY</span>\n'
     f'      </button>\n'
     f'      <p class="ls-stageplate__credit"><a href="https://www.youtube.com/playlist?list='
     f'{attr(pl["list"])}">{esc(pl["title"])}</a>, on YouTube, from our own channel.</p>\n'
     f'    </div>', "")

# THE BILL. One press per set, in the playlist's order, the comic named on every
# one and the runtime said before the press.
rows = []
for s in sets:
    note = f'\n        <p class="ls-set__note">{esc(s["note"])}</p>' if s.get("note") else ""
    who = names(s["comics"])
    rows.append(
        f'      <li class="ls-set">\n'
        f'        <h3 class="ls-set__title">{esc(s["title"])}</h3>\n'
        f'        <p class="ls-set__who">{who}</p>{note}\n'
        f'        <button type="button" class="facade" data-embed-id="{attr(s["id"])}" '
        f'data-embed-title="{attr(", ".join(s["comics"]))} &mdash; {attr(s["title"])}">\n'
        f'          Play &mdash; {esc(s["runtime"])}\n'
        f'          <span class="facade__play">&#9654; PRESS PLAY</span>\n'
        f'        </button>\n'
        f'        <p class="ls-set__credit">{esc(s["runtime"])} &middot; on YouTube, via '
        f'{esc(s["channel"])}</p>\n'
        f'      </li>')
swap(ROOM, "laughingstock:bill",
     '    <ul class="ls-bill">\n' + "\n".join(rows) + '\n    </ul>\n'
     f'    <p class="ls-from">Chalked up off the playlist on {esc(d["_checked"])}, in the '
     f'playlist&rsquo;s own order. The playlist is ours and we keep adding to it, so the whole '
     f'night may have more on it by now than the bill does.</p>', "")

credit_rows = []
for s in sets:
    credit_rows.append(
        f'      <tr><td>{esc(s["title"])}</td><td><strong>{names(s["comics"])}</strong></td>'
        f'<td>{esc(s["channel"])}</td><td>{esc(s["runtime"])}</td></tr>')
swap(NOTES, "laughingstock-credits", "\n".join(credit_rows), "      ")

# ── The page's own copy, swept ───────────────────────────────────────────────
# AFTER the write, so what is checked is what is published. The job marker is
# make-guild.py's and is swept by that tool against its own list.
page = ROOM.read_text()
page = re.sub(r"<!-- quest:.*?:end -->", " ", page, flags=re.S)
page = re.sub(r"<!--.*?-->", " ", page, flags=re.S)
page = re.sub(r"<(script|style|svg|head)\b.*?</\1>", " ", page, flags=re.S)
page = re.sub(r"<blockquote\b.*?</blockquote>", " ", page, flags=re.S)
page = re.sub(r'<h3 class="ls-set__title">.*?</h3>', " ", page, flags=re.S)
page = re.sub(r"<[^>]+>", " ", page)
page = html.unescape(re.sub(r"\s+", " ", page))
before = len(problems)
sweep(page, ROOM.name)
if len(problems) > before:
    raise SystemExit("REFUSING, on the published page:\n  " + "\n  ".join(problems[before:]))

print(f"laughingstock: {len(sets)} sets on the bill and the whole night on the stage, "
      f"in {ROOM.name}")
print(f"  {sum(len(a['lines']) for a in acts)} lines in the light across {len(acts)} acts, "
      f"none over {WORDS} words; {len(credit_rows)} credit rows in {NOTES.name}")
print("  nobody headlines, nobody is called brave, and the playlist carries no runtime")
