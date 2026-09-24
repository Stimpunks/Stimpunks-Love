#!/usr/bin/env python3
"""Build The Repeater's log and quotations, and the credits.

ONE DATA FILE, ONE TOOL, TWO SURFACES. The log cards and the two quotations go
into repeater.html; the credits go into liner-notes.html.

WHAT IT REFUSES, and why each one is here:

  - ANYTHING THAT SENDS, STORES OR LISTENS, in the room or in repeater.js: a
    form, a fetch, an XMLHttpRequest, a beacon, a socket, an event stream,
    local storage, or a call for the microphone. The room is about being
    reachable, which is exactly where a "leave us a message" box would arrive
    as a kindness -- and collecting what somebody types to a server nobody told
    them about is the consent this street spends a mechanism protecting. The
    job marker is cut out first, because its answer box is quest.js's and
    sends nothing either.

  - AN OPEN LINE LOUDER THAN 0.2. The ceiling is MAX_GAIN in repeater.js and
    the slider scales under it. A line left open in the background is a thing
    somebody forgets is on, and it must never be the loud thing in the room.

  - ANY ANIMATION IN §45. The lamps on the mast are the steady kind, and a
    blinking red light is the one ambient effect this room would grow if
    nobody said no. Comments are stripped first, since this section's own
    header describes the refusal.

  - THE VOCABULARY THAT MAKES SIGNAL LESSER, in our own voice: substitute,
    fallback, stand-in, second best, consolation, not real, real life, IRL,
    touch grass, just online. Our Shared-Signal Space entry spends a page
    saying signal is a mode in its own right, and one sentence of "of course
    it's no substitute for the real thing" would undo it while sounding
    reasonable. Negation window, so "not a stand-in" survives; quotations
    are skipped.

  - A NUMBER, A TALLY OR AN AWARD ON THE LOG. Radio logbooks count contacts and
    hand out awards for how many, and the log here confirms kinds of contact
    and counts none -- the pebbling cabinet's refusal in a radio shack.

  - A LOG CARD WITH A QUOTATION MARK IN IT, or two cards of the same kind. The
    lines are ours, written for the room; the glossary's own list is the
    entry's to keep.

  - A QUOTATION THAT IS NOT WORD FOR WORD ON THE PAGE OF OURS IT COMES FROM,
    whenever the Knowledge System mirror is on this machine, and says so when
    it is not.

IF THIS REFUSES: fix the cause. Do not loosen the tool.
"""
import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data/repeater.json"
ROOM = ROOT / "repeater.html"
JS = ROOT / "repeater.js"
NOTES = ROOT / "liner-notes.html"
CSS = ROOT / "love.css"
MIRROR = Path.home() / "Documents/Claude/Projects/Stimpunks Knowledge System/site/stimpunks.org"

CEILING = 0.2
ENTITY = re.compile(r"&(?:[a-zA-Z][a-zA-Z0-9]{1,31}|#\d{1,6}|#x[0-9a-fA-F]{1,6});")
SENDS = re.compile(r"<form\b|\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource|"
                   r"localStorage|sessionStorage|indexedDB|getUserMedia|mediaDevices", re.I)
NEGATION = (r"(?:no|not|nothing|never|neither|none|without|refuses?|refused|refusing|"
            r"cannot|does not|doesn't|won't|will not|is not|are not|isn't|aren't|nobody|nor)")
LESSER = (r"substitute|fallback|stand-in|second best|consolation|not real|real life|irl|"
          r"touch grass|just online|only online|lesser")
TALLY = r"scores?|totals?|awards?|streaks?|leaderboards?|tall(?:y|ies)|logbook count|dxcc"

problems = []


def refuse(msg):
    problems.append(msg)


def sweep(name, vocab, text):
    bad = re.compile(rf"\b(?:{vocab})\b", re.I)
    ok = re.compile(rf"\b{NEGATION}\b[^.]{{0,80}}?\b(?:{vocab})\b", re.I)
    for sentence in re.split(r"(?<=[.!?])\s+", text):
        if bad.search(sentence) and not ok.search(sentence):
            refuse(f"{name} in the room's own voice: {sentence.strip()[:140]!r}")


def norm(s):
    s = html.unescape(s).replace("’", "'").replace("‘", "'")
    s = s.replace("“", '"').replace("”", '"')
    return re.sub(r"\s+", " ", re.sub(r"\*\*|__|\*", "", s)).strip().lower()


def e(s):
    return html.escape(s, quote=True)


def swap(src, marker, body, where):
    begin, end = f"<!-- {marker}:begin -->", f"<!-- {marker}:end -->"
    if src.count(begin) != 1 or src.count(end) != 1:
        raise SystemExit(f"REFUSING: {where} needs exactly one {marker} marker pair.")
    return re.sub(re.escape(begin) + r".*?" + re.escape(end),
                  lambda _: f"{begin}\n{body}\n{end}", src, count=1, flags=re.S)


def main():
    data = json.loads(DATA.read_text())
    room = ROOM.read_text()
    js = JS.read_text()
    css = CSS.read_text()

    for path, obj in (("quotes", data["quotes"]), ("log", data["log"])):
        for i, item in enumerate(obj):
            for k, v in item.items():
                if isinstance(v, str) and ENTITY.search(v):
                    refuse(f"{path}[{i}].{k}: an HTML entity. Write the character.")

    bare = re.sub(r"<!-- quest:[a-z0-9-]+:begin -->.*?<!-- quest:[a-z0-9-]+:end -->", "", room,
                  flags=re.S)
    # THE DIAL'S PRE-PAINT SNIPPET IS CUT OUT BY EXACT MATCH, AND NOTHING ELSE.
    # It reads the visitor's own saved dial setting from localStorage on every
    # page on this street, and the first run of this tool refused the room for
    # it. That is the street's furniture rather than the room's; it is read off
    # the front page so that it is the same bytes everywhere, and any OTHER
    # storage call in this room is still refused.
    front = (ROOT / "index.html").read_text()
    snippet = re.search(r"<script>var d=document\.documentElement.*?</script>", front, re.S)
    if not snippet or snippet.group(0) not in bare:
        refuse(f"{ROOM.name} does not carry the front page's pre-paint snippet byte for byte.")
    else:
        bare = bare.replace(snippet.group(0), "")
    for where, text in ((ROOM.name, bare), (JS.name, js)):
        m = SENDS.search(text)
        if m:
            refuse(f"{where} has {m.group(0)!r}. Nothing on the ridge sends, stores or listens.")
    inputs = re.findall(r"<input\b[^>]*>", bare)
    if any('type="range"' not in i for i in inputs) or len(inputs) > 1:
        refuse(f"{ROOM.name} has an input other than the one volume slider.")

    g = re.search(r"var MAX_GAIN\s*=\s*([0-9.]+)", js)
    if not g:
        refuse(f"{JS.name} has no MAX_GAIN, so nothing says how loud the line can get.")
    elif float(g.group(1)) > CEILING:
        refuse(f"MAX_GAIN is {g.group(1)}, over {CEILING}. A line left open must stay quiet.")

    start = css.index("/* §45 ── ROOM: The Repeater")
    sec = re.sub(r"/\*.*?\*/", "", css[start:css.index("/* §46 ", start)], flags=re.S)
    if re.search(r"@keyframes|\banimation\s*:", sec):
        refuse("§45 animates something. The lamps on the mast are the steady kind.")

    calls = set()
    for c in data["log"]:
        if c["call"] in calls:
            refuse(f"log: {c['call']!r} twice.")
        calls.add(c["call"])
        if re.search(r"\d", c["call"] + c["line"]):
            refuse(f"log {c['call']!r}: a number. The log counts nothing.")
        if re.search(r"[\"“”]", c["line"]):
            refuse(f"log {c['call']!r}: a quotation mark. The lines are ours.")

    for q in data["quotes"]:
        for k in ("text", "via", "via_title", "checked"):
            if not q.get(k):
                refuse(f"quote {q.get('id')}: no {k}.")
        slug = re.match(r"https://stimpunks\.org/glossary/([a-z0-9-]+)/?$", q.get("via", ""))
        if MIRROR.exists() and slug:
            f = MIRROR / "glossary" / f"{slug.group(1)}.md"
            if not f.exists() or norm(q["text"]) not in norm(f.read_text()):
                refuse(f"quote {q['id']}: not word for word on {q['via']}.")

    ours = re.sub(r"<blockquote\b.*?</blockquote>", " ", bare, flags=re.S)
    ours = re.sub(r"<(script|style|svg)\b.*?</\1>", " ", ours, flags=re.S)
    ours = re.sub(r"<!--.*?-->|<(?:title|meta)[^>]*>", " ", ours, flags=re.S)
    text = html.unescape(re.sub(r"<[^>]+>", " ", ours))
    text += " " + " ".join(c["line"] for c in data["log"])
    sweep("signal made lesser", LESSER, text)
    sweep("a tally", TALLY, text)

    if problems:
        print("REFUSING:\n  " + "\n  ".join(problems))
        return 1

    for q in data["quotes"]:
        block = (f'    <blockquote class="rp-said">\n'
                 f'      <p>{e(q["text"])}</p>\n'
                 f'      <cite>Our <a href="{e(q["via"])}">{e(q["via_title"])}</a> entry</cite>\n'
                 f'    </blockquote>')
        room = swap(room, f"rp-quote:{q['id']}", block, ROOM.name)
    cards = [f'      <li class="rp-card"><p class="rp-card__call">{e(c["call"])}</p>'
             f'<p class="rp-card__ok">Contact confirmed</p>'
             f'<p class="rp-card__line">{e(c["line"])}</p></li>' for c in data["log"]]
    room = swap(room, "rp-log", "\n".join(cards), ROOM.name)
    ROOM.write_text(room)

    notes = NOTES.read_text()
    rows = [f'      <tr><td>{e(q["text"])}</td><td><a href="{e(q["via"])}">{e(q["via_title"])}</a></td>'
            f'<td>{e(q["checked"])}</td></tr>' for q in data["quotes"]]
    NOTES.write_text(swap(notes, "repeater-credits", "\n".join(rows), NOTES.name))

    print(f"repeater: {len(data['log'])} cards in the log and {len(data['quotes'])} quotations "
          f"written; the line tops out at {g.group(1)}.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
