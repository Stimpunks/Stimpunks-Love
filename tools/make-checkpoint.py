#!/usr/bin/env python3
"""Build The Healing Checkpoint's appreciation, its slips and its way out from data/checkpoint.json.

Room 429 is a save room: an arched alcove with a bed in it, lit only from the
floor. Four surfaces out of one data file -- the quoted voices, the things on
the source page this room deliberately does NOT reproduce, the Retry-After
slips, and the trail out -- plus the credits, which is the contract
make-yells.py set and every generator here has kept since.

WHAT IT REFUSES, and the first one is the reason this file exists at all:

  - INSTRUMENTAL REST. Any sentence that says what rest is FOR. Earn, deserve,
    recharge, productive, bounce back, back to work, so you can, in order to.
    Star Stuff's zine No. 58 refuses "rest so you can produce" in as many words;
    otterly.js already holds that line for one cabinet, where floating fills
    nothing and the room says so out loud. This is the room where the whole
    street says it, which makes it the room where the failure would be worst.

    THE FRIENDLY EDIT IS REAL AND IT WILL ARRIVE, and unlike most of the ones
    these tools guard against it will arrive from somebody being kind. Every
    wellness page on the internet is written the other way round: rest is good
    BECAUSE it makes you better at the rest of it. That sentence is the single
    most natural thing to add to a page about a bed, it reads as encouragement,
    and it quietly turns the argument inside out -- rest stops being owed and
    starts being an investment, which is the thing being owed was refusing. So
    it is a refusal in a tool rather than a paragraph in a comment.

    IT SWEEPS THE PAGE AS WELL AS THE DATA, with make-guild.py's negation
    window, because the room has to be able to say what it will not do. A
    banned phrase with a negation in front of it is a refusal of the phrase; the
    same phrase standing on its own is the page doing the thing.

  - A QUOTATION OVER THIRTY WORDS. make-zibaldone.py's limit and its reasoning:
    nobody ever decides to republish somebody else's page. They add one good
    line, then another, each individually reasonable. There is no moment
    anybody could catch, so it is a number in a tool. The number is printed in
    the room, because "we quote lightly" is not a thing a page can promise and
    not enforce.

  - A QUOTATION WITH NO PAGE OF OURS AND NO CHECKED DATE. Every line here was
    read off the Knowledge System mirror rather than remembered, which is the
    lesson data/hermitage.json paid for twice. A quotation whose provenance is
    somebody's memory is the fabrication this site spends a page arguing
    against, in the format most likely to be believed.

  - A TRAIL ENTRY THAT IS NOT ONE OF OUR OWN PAGES, or one with no line of ours.
    make-rabbit-hole.py's rule, and make-hermitage.py's before it: this trail is
    the Rest entry's own Further Reading list, in that page's order, and
    something extra slipped into it would be this room quietly extending a list
    it does not keep.

  - A SCORE, A TALLY OR A STREAK. The pebbling cabinet's refusal and the
    guild's, arriving where a counter is the most obvious improvement anybody
    could suggest: a checkpoint that remembered you would be keeping a record of
    how often you needed one. Negation-windowed, so the house rules can say so.

  - AN HTML ENTITY IN ANY FIELD. Everything here is escaped on the way into the
    markup, so `&mdash;` in the data arrives on the page as eight literal
    characters. data/toys.json paid for this once through a data- attribute and
    data/rabbit-hole.json again through a string method. Write the character.

  - A MISSING MARKER PAIR. Four blocks in the page and one in the credits, and a
    generator that writes nothing and exits 0 is how two surfaces drift apart.

WHAT IT DOES NOT CHECK, on purpose: how long anybody stays.
"""
import html
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA = ROOT / "data/checkpoint.json"
ROOM = ROOT / "healing-checkpoint.html"
CREDITS = ROOT / "liner-notes.html"

OURS = "https://stimpunks.org/"
WORDS = 30            # printed in the room; see _short in the data file

# THE VOCABULARY OF RENT. Every one of these only ever appears in a sentence
# that gives rest a purpose, which is why the list is short and none of it is a
# word you would reach for by accident. "Recover" is deliberately NOT here: it
# is an ordinary word in a Disabled person's mouth and banning it would teach
# people to ignore this tool, which is check-counts.py's own first-run lesson.
INSTRUMENTAL = (r"earn(?:s|ed|ing)?|deserv(?:e|es|ed|ing)|recharg(?:e|es|ed|ing)|"
                r"productivity|productive|bounce back|back to work|"
                r"so (?:you|we|they) can|in order to|optimi[sz]|"
                r"work(?:ing)? better|perform better|refuel|fuel up|earn(?:ed)? (?:it|rest)")

# A TALLY. make-guild.py's list, taken over pattern for pattern rather than
# rewritten, INCLUDING ITS NARROWING OF `points`. That tool's first refusal ever
# was a false positive -- "a book it points at" is the verb -- and it fixed it by
# making a point only a point when it is being awarded or counted. This file's
# first run reproduced the identical bug from the identical shortcut and was
# caught by the phrase `save point`, which is what a healing checkpoint IS.
# Copying the narrowed pattern is the fix; excepting the phrase would have been
# the bug a second time.
TALLY = (r"scores?|scored|scoring|\d+\s*points?|points?\s+(?:for|per|each|awarded|"
         r"earned|available)|streaks?|leaderboards?|high[- ]score|xp\b|levels? up|"
         r"badges?|achievements?|tall(?:y|ies)|tallied|progress bar|completion rate")

NEGATION = (r"(?:no|not|nothing|never|neither|none|without|refuses?|refused|refusing|"
            r"cannot|does not|won't|will not|is not|are not|isn't|aren't|nobody|declin\w+)")

INSTRUMENTAL_RE = re.compile(rf"\b(?:{INSTRUMENTAL})", re.I)
INSTRUMENTAL_OK = re.compile(rf"\b{NEGATION}\b[^.]{{0,60}}?\b(?:{INSTRUMENTAL})", re.I)
TALLY_RE = re.compile(rf"\b(?:{TALLY})", re.I)
TALLY_OK = re.compile(rf"\b{NEGATION}\b[^.]{{0,60}}?\b(?:{TALLY})", re.I)
ENTITY = re.compile(r"&(?:[a-zA-Z][a-zA-Z0-9]{1,8}|#\d{2,5}|#x[0-9A-Fa-f]{2,5});")

data = json.loads(DATA.read_text())
voices, held, retry, trail = data["voices"], data["held"], data["retry"], data["trail"]

problems = []


def sweep(text, where, allow_negated=True):
    """Both vocabularies, with the window make-guild.py uses.

    A banned phrase with a negation in front of it is a sentence ABOUT the
    refusal, which every one of these rooms has to be able to write. The window
    is characters rather than words because a sentence can put a clause between
    the two and still plainly be a refusal."""
    text = str(text)
    for m in INSTRUMENTAL_RE.finditer(text):
        window = text[max(0, m.start() - 70):m.end()]
        if allow_negated and INSTRUMENTAL_OK.search(window):
            continue
        problems.append(
            f"{where}: {m.group(0)!r} — this room does not say what rest is for. "
            "See _not_instrumental in the data file; rewrite the sentence rather "
            "than softening the word.")
    for m in TALLY_RE.finditer(text):
        window = text[max(0, m.start() - 70):m.end()]
        if allow_negated and TALLY_OK.search(window):
            continue
        problems.append(
            f"{where}: {m.group(0)!r} — nothing in room 429 is counted. "
            "See _no_tally in the data file.")


# ── The data ─────────────────────────────────────────────────────────────────
# TOP-LEVEL UNDERSCORE KEYS ARE THE RECORD OF WHY and are skipped, the way
# make-rabbit-hole.py skips its own _no_lyrics: a file that may not explain its
# own refusal without tripping it is a file whose reasoning goes into a comment
# nobody reads. Everything in a list entry is publishable and is swept.
for group, label in ((voices, "voice"), (held, "held item"),
                     (retry, "slip"), (trail, "trail entry")):
    for i, entry in enumerate(group, 1):
        for field, value in entry.items():
            where = f"{label} {i} ({field})"
            sweep(value, where)
            if ENTITY.search(str(value)):
                problems.append(
                    f"{where}: an HTML entity. Every field here is escaped on the way "
                    "into the markup, so this arrives on the page as literal characters. "
                    "Write the character itself.")

for i, v in enumerate(voices, 1):
    where = f"voice {i} ({v.get('who') or 'unattributed'})"
    for field in ("line", "who", "what", "at", "checked"):
        if not str(v.get(field, "")).strip():
            problems.append(f"{where}: no {field}.")
    n = len(str(v.get("line", "")).split())
    if n > WORDS:
        problems.append(
            f"{where}: {n} words. The limit is {WORDS} and it is printed in the room — "
            "an appreciation built out of somebody else's page becomes that page one "
            "reasonable addition at a time, and there is no moment anybody could catch.")
    if not str(v.get("at", "")).startswith(OURS):
        problems.append(
            f"{where}: `at` is not a page of ours. Every line in this room was read off "
            "our own published page; a quotation sourced anywhere else has no provenance "
            "this repository can stand behind.")

for i, h in enumerate(held, 1):
    where = f"held item {i}"
    for field in ("what", "whose", "where", "why"):
        if not str(h.get(field, "")).strip():
            problems.append(
                f"{where}: no {field}." + (
                    " A thing left out without a reason is a thing quietly left out, "
                    "which is the opposite of what this block is for."
                    if field == "why" else ""))

for i, s in enumerate(retry, 1):
    where = f"slip {i} ({s.get('after') or 'undated'})"
    for field in ("after", "closing", "note"):
        if not str(s.get(field, "")).strip():
            problems.append(f"{where}: no {field}.")

for i, t in enumerate(trail, 1):
    where = f"trail entry {i} ({t.get('name') or 'unnamed'})"
    for field in ("name", "url", "line"):
        if not str(t.get(field, "")).strip():
            problems.append(
                f"{where}: no {field}." + (
                    " A list of bare links is somebody else's Further Reading copied out; "
                    "the line is what makes it a way out somebody can choose from."
                    if field == "line" else ""))
    if not str(t.get("url", "")).startswith(OURS):
        problems.append(
            f"{where}: {t.get('url')!r} does not point at stimpunks.org. This trail is our "
            "Rest entry's own Further Reading list; something else on it is this room "
            "extending a list it does not keep.")

if problems:
    raise SystemExit("REFUSING:\n  " + "\n  ".join(problems))


def swap(page, marker, block, indent=""):
    src = page.read_text()
    begin, end = f"<!-- {marker}:begin -->", f"<!-- {marker}:end -->"
    if begin not in src or end not in src:
        raise SystemExit(
            f"REFUSING: {page.name} has no {marker} markers, so there is nowhere to write.\n"
            "Put them back rather than letting this tool go quiet — a generator that\n"
            "writes nothing and exits 0 is how two surfaces drift apart."
        )
    new = re.sub(re.escape(begin) + r".*?" + re.escape(end),
                 lambda m: begin + "\n" + block + "\n" + indent + end, src, flags=re.S)
    page.write_text(new)


def esc(s):
    return html.escape(str(s))


# ── The voices ───────────────────────────────────────────────────────────────
# A blockquote and a citation, and the citation names the page rather than only
# the person: a title is not a source, which is the Zibaldone's whole apparatus
# arriving in three lines.
blocks = []
for v in voices:
    blocks.append(
        f'    <figure class="hc-voice">\n'
        f'      <blockquote><p>{esc(v["line"])}</p></blockquote>\n'
        f'      <figcaption>&mdash; <b>{esc(v["who"])}</b>, {esc(v["what"])}\n'
        f'        <span class="hc-voice__at">On <a href="{esc(v["at"])}">our own Rest entry</a>; '
        f'checked {esc(v["checked"])}.</span></figcaption>\n'
        f'    </figure>')
swap(ROOM, "checkpoint:voices", "\n".join(blocks), "    ")

# ── What was left where it was ───────────────────────────────────────────────
rows = []
for h in held:
    rows.append(
        f'      <li class="hc-held">\n'
        f'        <p class="hc-held__what">{esc(h["what"])}</p>\n'
        f'        <p class="hc-held__whose">{esc(h["whose"])} &middot; '
        f'<a href="{esc(h["where"])}">where it lives</a></p>\n'
        f'        <p>{esc(h["why"])}</p>\n'
        f'      </li>')
swap(ROOM, "checkpoint:held", '    <ul class="hc-helds">\n' + "\n".join(rows) + "\n    </ul>", "    ")

# ── The slips ────────────────────────────────────────────────────────────────
# EACH ONE IS A <details> AND THE COPY BUTTON SHIPS HIDDEN, which is the guild
# marker's arrangement for the guild marker's reason: the whole slip is readable
# and selectable with no JavaScript at all, and checkpoint.js only adds the
# convenience. A scripted panel here would put the one useful thing in this room
# behind a script, in the room least able to afford a dead control.
#
# THE READOUT IS ON THE SLIP YOU PRESSED. The Playhouse answered into one live
# region at the top of its page, Ryan pressed the buttons he had just asked for
# and thought they were broken, and every check anybody ran was reading the DOM
# rather than the viewport. So each slip says whether it copied, where the hand
# is, and the one live region carries it for anybody not looking.
slips = []
for i, s in enumerate(retry, 1):
    after = esc(s["after"])
    body = (f'429 Too Many Requests\n'
            f'Retry-After: {s["after"]}\n\n'
            f'{s["closing"]}')
    slips.append(
        f'    <details class="hc-slip">\n'
        f'      <summary class="hc-slip__mark">\n'
        f'        <span class="hc-slip__after">Retry-After: {after}</span>\n'
        f'        <span class="hc-slip__note">{esc(s["note"])}</span>\n'
        f'      </summary>\n'
        f'      <div class="hc-slip__panel">\n'
        f'        <pre class="hc-slip__text" id="hc-text-{i}">{esc(body)}</pre>\n'
        f'        <button type="button" class="hc-slip__copy" data-copy="hc-text-{i}" hidden>'
        f'Copy this slip</button>\n'
        f'        <p class="hc-slip__said" aria-hidden="true" hidden></p>\n'
        f'      </div>\n'
        f'    </details>')
swap(ROOM, "checkpoint:retry", "\n".join(slips), "    ")

# ── The way out ──────────────────────────────────────────────────────────────
steps = []
for t in trail:
    steps.append(
        f'      <li class="hc-step">\n'
        f'        <a href="{esc(t["url"])}">{esc(t["name"])}</a>\n'
        f'        <p>{esc(t["line"])}</p>\n'
        f'      </li>')
swap(ROOM, "checkpoint:trail", '    <ul class="hc-trail">\n' + "\n".join(steps) + "\n    </ul>", "    ")

# ── The credits ──────────────────────────────────────────────────────────────
credit_rows = []
for v in voices:
    credit_rows.append(
        f'      <tr><td><strong>{esc(v["who"])}</strong></td>'
        f'<td>quoted, {len(str(v["line"]).split())} words</td>'
        f'<td>read off our own Rest entry</td>'
        f'<td>{esc(v["checked"])}</td>'
        f'<td><a href="{esc(v["at"])}">the page</a></td></tr>')
for h in held:
    credit_rows.append(
        f'      <tr><td><strong>{esc(h["whose"])}</strong></td>'
        f'<td>{esc(h["what"])}</td>'
        f'<td>named here, published there</td>'
        f'<td>not reproduced in room 429</td>'
        f'<td><a href="{esc(h["where"])}">where it lives</a></td></tr>')
swap(CREDITS, "checkpoint-credits", "\n".join(credit_rows), "      ")

# ── No radio in room 429 ─────────────────────────────────────────────────────
# The CB floats on every page of the street once somebody has signed on, and
# love.js keeps it off any page whose <body> carries data-cb="off". This room
# says it writes nothing down about you and has no fetch in it, which stops being
# true the moment a radio that polls a server turns up in the corner -- Ryan's
# call, 2026-09-24: keep it out. The attribute is one word in a hand-kept <body>
# tag that nothing else would miss, so it is refused here rather than trusted.
if not re.search(r'<body[^>]*\bdata-cb="off"', ROOM.read_text()):
    raise SystemExit(
        "REFUSING: healing-checkpoint.html's <body> has lost data-cb=\"off\", so the CB\n"
        "would float in room 429. That room promises no fetch and nothing written down\n"
        "about you; the radio polls a server and remembers where you put it. Put the\n"
        "attribute back.")

# ── The page's own copy, swept ───────────────────────────────────────────────
# AFTER the write rather than before it, so what is checked is what is
# published. check-quests.py reads the built HTML for the same reason: a
# checker that re-derives its answer from the generator's own source is only
# testing that Python is deterministic, and the edit this file is guarding
# against arrives in a committed file by hand.
page = re.sub(r"<!--.*?-->", " ", ROOM.read_text(), flags=re.S)
page = re.sub(r"<[^>]+>", " ", page)
page = html.unescape(re.sub(r"\s+", " ", page))
before = len(problems)
sweep(page, "healing-checkpoint.html")
if len(problems) > before:
    raise SystemExit("REFUSING:\n  " + "\n  ".join(problems[before:]))

longest = max(len(str(v["line"]).split()) for v in voices)
print(f"the healing checkpoint: {len(voices)} voices, {len(held)} things left where they are, "
      f"{len(retry)} slips and {len(trail)} steps out in {ROOM.name}")
print(f"  {len(credit_rows)} credit rows in {CREDITS.name}; longest quotation {longest} words "
      f"against a limit of {WORDS}")
print("  nothing counted, nothing stored, and nothing in here says what rest is for")
