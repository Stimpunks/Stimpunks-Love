#!/usr/bin/env python3
"""Build The Small Hours' menu and quotations, and the credits.

ONE DATA FILE, ONE TOOL, TWO SURFACES. The menu and every quotation go into
small-hours.html; the same quotations go into liner-notes.html as credits.

WHAT IT REFUSES, and why each one is here:

  - A QUOTATION WITHOUT AN AUTHOR, A WORK, A PAGE OF OURS THAT QUOTES IT, OR A
    CHECKED DATE. The authors were resolved against Open Library and Crossref,
    because our own Sleep entry prints a memoir's passage under a link to the
    book and never names who wrote it, and the name this room was nearly given
    from memory was somebody else's.

  - A QUOTATION THAT IS NOT WORD FOR WORD ON THE PAGE OF OURS IT CLAIMS TO COME
    FROM -- whenever the Knowledge System mirror is on the machine running
    this. When it is not, the tool says it could not look, rather than saying
    nothing and letting a pass mean two different things.

  - A QUOTATION OVER FORTY WORDS. This is a room with a few lines in it, not a
    quote bank; the Zibaldone's cap is thirty and exists for drift, and forty
    here fits the longest sentence the room is actually about.

  - SLEEP ADVICE IN OUR OWN VOICE. The room quotes a study in which what
    helped Autistic adolescents sleep was the opposite of standard sleep
    hygiene advice, and a diner that handed out tips at three in the morning
    would be the leaflet by the till. It will arrive as a kindness. Negation
    window, so "there is no sleep advice in this building" survives, and
    quotations are skipped, because the study is allowed to name what it is
    arguing with.

  - CLOSING TIME. The diner does not close, and a line about last orders or
    opening hours would make that false in the room that says it most. Same
    negation window.

  - THE PAGE ASKING THE BROWSER FOR THE TIME. A sign that said what time it was
    where you were was the first draft, and it was one more thing noticing what
    hour somebody is awake. Nothing in small-hours.html may call for the date or
    the hour.

  - A TALLY. No visits, no nights awake, no hours since. The pebbling cabinet's
    refusal, in the room where a counter would be a record of how often
    somebody could not sleep.

  - A QUOTATION WITH NO SLOT ON THE PAGE, OR A SLOT WITH NO QUOTATION, and an
    HTML entity in any field. make-latibulum.py's rule and data/toys.json's.

  - A LYRIC WITH NO PERMISSION RECORD. "Up All Night" is the one song on this
    street printed in full, because Stimpunks helped produce it and holds
    permission to distribute it and its lyrics (Ryan, 2026-09-23). That is
    permission rather than quotation, so the record must say what is permitted,
    who holds it, how, when it was recorded, by whom, and that the words stay
    outside this site's licence. Every other room's tools go on refusing lyrics.

  - A TRACK FROM ANYWHERE BUT love-embed.js's AUDIO_ORIGINS, a track with no
    runtime or one that is not a clock, and an album button that does not say
    how many songs and how long before the press. The runtimes were measured off
    the files; the album totals are summed here rather than typed.

IF THIS REFUSES: fix the cause. Do not loosen the tool.
"""
import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data/small-hours.json"
ROOM = ROOT / "small-hours.html"
NOTES = ROOT / "liner-notes.html"
MIRROR = Path.home() / "Documents/Claude/Projects/Stimpunks Knowledge System/site/stimpunks.org"

ENTITY = re.compile(r"&(?:[a-zA-Z][a-zA-Z0-9]{1,31}|#\d{1,6}|#x[0-9a-fA-F]{1,6});")
MAX_WORDS = 40
CLOCK_RE = re.compile(r"^\d+:[0-5]\d$")
PERMISSION = ("what", "held_by", "how", "recorded", "by", "licence")
EMBED = ROOT / "love-embed.js"

NEGATION = (r"(?:no|not|nothing|never|neither|none|without|refuses?|refused|refusing|"
            r"cannot|does not|doesn't|won't|will not|is not|are not|isn't|aren't|nobody|nor)")
ADVICE = (r"sleep hygiene|bedtime routine|wind(?:ing)? down|go to bed|get some sleep|"
          r"try to sleep|you should (?:sleep|rest|go|get|try)|melatonin|blue light|"
          r"screens? (?:off|before bed)|reset your (?:body clock|sleep)|fix your sleep|"
          r"sleep schedule|early night|past your bedtime|should be (?:asleep|in bed|sleeping)|"
          r"tips?(?: for| to| on)?\b|leaflet")
CLOSING = (r"closing time|last orders?|we close|closes at|opening hours|open until|"
           r"come back tomorrow|closed (?:on|at|until)")
TALLY = (r"scores?|streaks?|leaderboards?|tall(?:y|ies)|hours since|nights? awake count|"
         r"visits? (?:counted|logged)|days since")
CLOCK = re.compile(r"new Date|Date\(|getHours|toLocaleTime|Intl\.DateTimeFormat")

problems = []


def refuse(msg):
    problems.append(msg)


def sweep(name, vocab, text):
    bad = re.compile(rf"\b(?:{vocab})", re.I)
    ok = re.compile(rf"\b{NEGATION}\b[^.]{{0,80}}?\b(?:{vocab})", re.I)
    for sentence in re.split(r"(?<=[.!?])\s+", text):
        if bad.search(sentence) and not ok.search(sentence):
            refuse(f"{name} in the room's own voice: {sentence.strip()[:140]!r}")


def norm(s):
    s = html.unescape(s)
    s = s.replace("’", "'").replace("‘", "'").replace("“", '"').replace("”", '"')
    s = re.sub(r"\*\*|__|\*", "", s)
    return re.sub(r"\s+", " ", s).strip().lower()


def mirror_file(via):
    m = re.match(r"https://stimpunks\.org/(.+?)/?$", via)
    if not m:
        return None
    parts = m.group(1).split("/")
    if len(parts) == 4 and all(p.isdigit() for p in parts[:3]):
        return MIRROR / "posts" / f"{parts[3]}.md"
    if parts[0] == "glossary":
        return MIRROR / "glossary" / f"{parts[1]}.md"
    return MIRROR / "pages" / ("__".join(parts) + ".md")


def e(s):
    return html.escape(s, quote=True)


def swap(src, marker, body, where):
    begin, end = f"<!-- {marker}:begin -->", f"<!-- {marker}:end -->"
    if src.count(begin) != 1 or src.count(end) != 1:
        raise SystemExit(f"REFUSING: {where} needs exactly one {marker} marker pair.")
    return re.sub(re.escape(begin) + r".*?" + re.escape(end),
                  lambda _: f"{begin}\n{body}\n{end}", src, count=1, flags=re.S)


def walk(obj, path=""):
    if isinstance(obj, dict):
        for k, v in obj.items():
            if not k.startswith("_"):
                walk(v, f"{path}.{k}")
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            walk(v, f"{path}[{i}]")
    elif isinstance(obj, str) and ENTITY.search(obj):
        refuse(f"{path}: an HTML entity. Write the character; this field is escaped on the way out.")


def main():
    data = json.loads(DATA.read_text())
    room = ROOM.read_text()
    walk(data)

    looked, could_not = 0, False
    for q in data["quotes"]:
        where = f"quote {q.get('id')}"
        for k in ("text", "author", "work", "work_url", "via", "via_title", "checked"):
            if not q.get(k):
                refuse(f"{where}: no {k}.")
        if len(q.get("text", "").split()) > MAX_WORDS:
            refuse(f"{where}: {len(q['text'].split())} words, over {MAX_WORDS}. Link the rest.")
        f = mirror_file(q.get("via", ""))
        if not MIRROR.exists():
            could_not = True
        elif not f or not f.exists():
            refuse(f"{where}: {q.get('via')} has no page in the mirror to check it against.")
        elif norm(q["text"]) not in norm(f.read_text()):
            refuse(f"{where}: not word for word on {q['via']}. A quotation that has drifted "
                   "from the page it is credited to is a misquotation with our name on it.")
        else:
            looked += 1
        marker = f"sh-quote:{q.get('id')}"
        if room.count(f"<!-- {marker}:begin -->") != 1:
            refuse(f"{where}: no slot for it in {ROOM.name}.")
    slots = set(re.findall(r"<!-- sh-quote:([a-z0-9-]+):begin -->", room))
    for extra in slots - {q.get("id") for q in data["quotes"]}:
        refuse(f"{ROOM.name} has a slot for quote {extra!r} and the data has none.")

    if CLOCK.search(room):
        refuse(f"{ROOM.name} asks the browser for the time. The sign says open whatever the hour "
               "and does not notice what hour it is.")

    ours = re.sub(r"<blockquote\b.*?</blockquote>", " ", room, flags=re.S)
    ours = re.sub(r"<(script|style|svg)\b.*?</\1>", " ", ours, flags=re.S)
    ours = re.sub(r"<!--.*?-->", " ", ours, flags=re.S)
    ours = re.sub(r"<(?:title|meta)[^>]*>", " ", ours)
    text = html.unescape(re.sub(r"<[^>]+>", " ", ours))
    text += " " + " ".join(m["dish"] + ". " + m["note"] for m in data["menu"])
    sweep("sleep advice", ADVICE, text)
    sweep("closing time", CLOSING, text)
    sweep("a tally", TALLY, text)

    ablock = re.search(r"var AUDIO_ORIGINS = \[(.*?)\];", EMBED.read_text(), re.S)
    audio_ok = re.findall(r"'(https://[^']+)'", ablock.group(1)) if ablock else []
    if not audio_ok:
        refuse("love-embed.js has no AUDIO_ORIGINS, so no track could be checked.")

    def track_ok(where, t):
        if not any(t.get("src", "").startswith(o) for o in audio_ok):
            refuse(f"{where}: {t.get('src')} is not from an origin in AUDIO_ORIGINS; "
                   "love-embed.js would refuse it quietly and the button would never play.")
        if not CLOCK_RE.match(t.get("runs", "")):
            refuse(f"{where}: no runtime, or one that is not a clock. Every press-to-play "
                   "control here says how long before the press.")

    rec = data.get("record")
    if rec:
        track_ok("record", rec)
        if rec.get("lyrics"):
            perm = rec.get("permission") or {}
            for k in PERMISSION:
                if not perm.get(k):
                    refuse(f"record: lyrics with no permission.{k}. A song's words are printed "
                           "whole here only on a written-down permission.")
        if not rec.get("credits"):
            refuse("record: no credits. Name everybody who made it.")
    for a in data.get("albums", []):
        if not a.get("page", "").startswith("https://josephmooon.wordpress.com/"):
            refuse(f"album {a.get('title')!r}: no page on the band's own site.")
        for t in a["tracks"]:
            track_ok(f"{a['title']} track {t.get('n')}", t)

    if problems:
        print("REFUSING:\n  " + "\n  ".join(problems))
        return 1

    for q in data["quotes"]:
        if q["author"] == "Stimpunks":
            cite = f'Our post, <a href="{e(q["work_url"])}">{e(q["work"])}</a>'
        else:
            cite = (f'{e(q["author"])}, <a href="{e(q["work_url"])}">{e(q["work"])}</a>, '
                    f'as our <a href="{e(q["via"])}">{e(q["via_title"])}</a> entry quotes it')
        block = (f'    <blockquote class="sh-said">\n'
                 f'      <p>{e(q["text"])}</p>\n'
                 f'      <cite>{cite}</cite>\n'
                 f'    </blockquote>')
        room = swap(room, f"sh-quote:{q['id']}", block, ROOM.name)

    def spoken(runs):
        m, sec = (int(x) for x in runs.split(":"))
        return f"{m} min {sec} sec" if sec else f"{m} min"

    def play(t, title):
        return (f'<button type="button" class="facade facade--audio sh-play" '
                f'data-audio-src="{e(t["src"])}" data-embed-title="{e(title)}">'
                f'Press to play &middot; {t["runs"]}</button>')

    if rec:
        credits = "".join(f'<div><dt>{e(c["who"])}</dt><dd>{e(c["did"])}</dd></div>'
                          for c in rec["credits"])
        stanzas = "\n".join("        <p>" + "<br>".join(e(l) for l in st) + "</p>"
                            for st in rec["lyrics"])
        album = next((a for a in data.get("albums", []) if a["title"] == rec["album"]), None)
        block = (f'    <div class="sh-record">\n'
                 f'      <p class="sh-record__meta">Track {rec["track"]} of <i>{e(rec["album"])}</i> '
                 f'&middot; runs {rec["runs"]}</p>\n'
                 f'      {play(rec, rec["title"] + " by " + rec["by"])}\n'
                 f'      <dl class="sh-credits">{credits}</dl>\n'
                 f'      <h3 class="sh-lyric__h">The words</h3>\n'
                 f'      <blockquote class="sh-lyric">\n{stanzas}\n'
                 f'        <cite>Lyrics by {e(rec["credits"][0]["who"])}. Printed in full with '
                 f'permission: {e(rec["permission"]["how"])}. They are not under this site&rsquo;s '
                 f'licence and stay the lyricist&rsquo;s and the band&rsquo;s.</cite>\n'
                 f'      </blockquote>\n'
                 + (f'      <p class="sh-record__more">The whole album is on the jukebox below and on '
                    f'<a href="{e(album["page"])}">its own page on the band&rsquo;s site</a>.</p>\n'
                    if album else "")
                 + '    </div>')
        room = swap(room, "sh-record", block, ROOM.name)

    albums_html = []
    for i, a in enumerate(data.get("albums", [])):
        secs = sum(int(t["runs"].split(":")[0]) * 60 + int(t["runs"].split(":")[1]) for t in a["tracks"])
        total = f"{round(secs / 60)} min"
        when = ""
        if a.get("released"):
            y, mth, d = a["released"].split("-")
            months = ["January", "February", "March", "April", "May", "June", "July", "August",
                      "September", "October", "November", "December"]
            when = f' &middot; released {int(d)} {months[int(mth) - 1]} {y}'
        rows = "\n".join(
            f'          <li class="sh-track"><span class="sh-track__n">{t["n"]}</span>'
            f'<span class="sh-track__t">{e(t["title"])}</span>'
            f'{play(t, t["title"] + " by Josephmooon")}</li>' for t in a["tracks"])
        albums_html.append(
            f'    <div class="sh-album" data-album="{i}">\n'
            f'      <h3 class="sh-album__h">{e(a["title"])}</h3>\n'
            f'      <p class="sh-album__meta">Josephmooon{when} &middot; '
            f'<a href="{e(a["page"])}">on the band&rsquo;s own site</a></p>\n'
            f'      <button type="button" class="sh-album__all" hidden '
            f'data-tracks="{e(json.dumps([[t["title"], t["src"], t["runs"]] for t in a["tracks"]], ensure_ascii=False))}">'
            f'Play the whole album &middot; {len(a["tracks"])} songs &middot; {total}</button>\n'
            f'      <div class="sh-album__now" hidden></div>\n'
            f'      <ol class="sh-tracks">\n{rows}\n      </ol>\n'
            f'    </div>')
    if data.get("albums"):
        room = swap(room, "sh-jukebox", "\n".join(albums_html), ROOM.name)

    items = []
    for m in data["menu"]:
        link = (f' <a href="{e(m["link"])}">Our {e(m["link_title"])} entry</a>.'
                if m.get("link") else "")
        items.append(f'      <li class="sh-dish"><p class="sh-dish__name">{e(m["dish"])}</p>'
                     f'<p class="sh-dish__note">{e(m["note"])}{link}</p></li>')
    room = swap(room, "sh-menu", "\n".join(items), ROOM.name)
    ROOM.write_text(room)

    notes = NOTES.read_text()
    rows = [f'      <tr><td>{e(q["text"][:60])}{"…" if len(q["text"]) > 60 else ""}</td>'
            f'<td><strong>{e(q["author"])}</strong></td><td><a href="{e(q["work_url"])}">{e(q["work"])}</a></td>'
            f'<td><a href="{e(q["via"])}">{e(q["via_title"])}</a></td></tr>' for q in data["quotes"]]
    notes = swap(notes, "small-hours-credits", "\n".join(rows), NOTES.name)
    jrows = []
    for a in data.get("albums", []):
        for t in a["tracks"]:
            who = ("; ".join(f"{c['who']}, {c['did']}" for c in rec["credits"])
                   if rec and t["src"] == rec["src"] else "Josephmooon; lyrics by Ronan Boren")
            jrows.append(f'      <tr><td>{e(t["title"])}</td><td><a href="{e(a["page"])}">{e(a["title"])}</a></td>'
                         f'<td>{e(who)}</td><td>{t["runs"]}</td></tr>')
    notes = swap(notes, "small-hours-jukebox-credits", "\n".join(jrows), NOTES.name)
    NOTES.write_text(notes)

    seen = (f"{looked} checked word for word against the mirror" if not could_not
            else "the mirror is not on this machine, so none was checked against it this run")
    tracks = sum(len(a["tracks"]) for a in data.get("albums", []))
    print(f"small hours: {len(data['menu'])} dishes, {len(data['quotes'])} quotations, one record "
          f"with its words and {tracks} tracks on the jukebox written; {seen}.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
