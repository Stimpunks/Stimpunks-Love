#!/usr/bin/env python3
"""Build The Live Room's desk, one studio at a time, and the credits.

ONE DATA FILE, ONE TOOL, TWO SURFACES -- the contract make-chappell.py,
make-looming.py, make-picture-house.py and the rest keep. Every session is a
channel strip on the desk: its name in marker on a strip of masking tape, where
and when it was taped, whose channel it is on, a note written for this room,
and a press-to-play plate that says how long before the press.

WHAT IT REFUSES:

  - A SESSION THAT WAS NOT PLAYED INDOORS, OR ONE THAT DOES NOT SAY WHERE.
    THIS IS make-looming.py's RULE UPSIDE DOWN, AND THEY MUST NOT BE MADE TO
    AGREE. Looming Rocks is for outdoor music and refuses an act that was not
    played outdoors; this room is for music played in a studio and refuses one
    that was not played indoors. Both are keeping the same promise -- say where
    a thing was played, and mean it -- and the first nine sessions here are the
    proof that the pair is needed: they arrived for Looming Rocks, were refused
    there, and this room was built the same afternoon to hold them.

  - A STUDIO WITH NO SESSIONS. It would render as a heading over nothing: the
    Jungle Room's dark group, arriving on a desk. KEXP and KCRW are named on the
    page as studios this room takes sessions from, in words, and get a section
    each the day somebody sends one.

  - A SESSION WITH NO RUNTIME, A RUNTIME THAT IS NOT A CLOCK, OR NO SPOKEN FORM.
    Every press-to-play control on this street says how long before the press;
    the digits are what a player shows and the spoken form is what somebody
    decides with.

  - AN ID THAT IS NOT A YOUTUBE ID, OR ONE USED TWICE. love-embed.js validates
    before it builds and returns QUIETLY, so a typo is a button somebody presses
    and presses that never becomes a video.

  - A SESSION WITH NO TAPE, NO TITLE, NO PERFORMER, NO CHANNEL OR NO NOTE. None
    of this music is ours, and every strip names whose channel it is on.

  - A RANKED DESK. No best, no greatest, no countdown, and no claim to be the
    oldest or the longest thing on it either: those go quietly false the day a
    session arrives from another studio, which is a hand-typed total wearing a
    superlative.

  - A QUOTATION OF ANY LENGTH FROM THE STAGE, and a note shaped like verse. This
    street says in three places that nothing musical is hosted here, and a room
    of sessions is where somebody would transcribe a good line between songs.

  - AN HTML ENTITY IN ANY FIELD, and any missing marker pair.

WHAT IT DOES NOT CHECK, on purpose: whether each video still plays. That needs
the network; check-jukebox.py asks.
"""
import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data/live-room.json"
ROOM = ROOT / "live-room.html"
NOTES = ROOT / "liner-notes.html"

YT = re.compile(r"^[A-Za-z0-9_-]{11}$")
CLOCK = re.compile(r"^\d+:[0-5]\d(?::[0-5]\d)?$")
ENTITY = re.compile(r"&(?:[a-zA-Z][a-zA-Z0-9]{1,31}|#\d{1,6}|#x[0-9a-fA-F]{1,6});")
RANKING = re.compile(
    r"\b(?:best|greatest|essential|definitive|top)\s+(?:\d+\s+)?"
    r"(?:session|sessions|sets?|acts?|shows?|performances?|takes?)\b"
    r"|\bcountdown\b|\branked\b|\bno\.?\s*1\b"
    r"|\b(?:the\s+)?(?:oldest|newest|longest|shortest)\s+(?:thing|session|one|set)\s+on\b",
    re.I)
VERSE_LINE = 52


def esc(s):
    return html.escape(s, quote=False)


def attr(s):
    return html.escape(s, quote=True)


def swap(page, marker, block, indent=""):
    begin, end = f"<!-- {marker}:begin -->", f"<!-- {marker}:end -->"
    src = page.read_text()
    if begin not in src or end not in src:
        raise SystemExit(
            f"REFUSING: {page.name} has no {marker} markers, so there is nowhere\n"
            "to write. Add them on purpose rather than letting this tool render nothing.")
    page.write_text(re.sub(re.escape(begin) + r".*?" + re.escape(end),
                           lambda m: begin + "\n" + block + "\n" + indent + end,
                           src, flags=re.S))


def looks_like_verse(text):
    lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
    return len(lines) >= 3 and all(len(ln) <= VERSE_LINE for ln in lines)


def check(d):
    bad = []
    studios = d.get("studios") or []
    if not studios:
        bad.append("data/live-room.json has no studios, and the desk is made of them.")
    seen, ids = set(), set()
    for st in studios:
        sname = (st.get("name") or "").strip() or "<unnamed studio>"
        sid = (st.get("id") or "").strip()
        if not re.match(r"^[a-z0-9-]+$", sid):
            bad.append(f"studio {sname!r} has {sid!r} as an id; it becomes an anchor.")
        if sid in ids:
            bad.append(f"studio id {sid!r} is used twice.")
        ids.add(sid)
        for f in ("name", "place", "about"):
            if not (st.get(f) or "").strip():
                bad.append(f"studio {sname!r} has no {f}.")
            elif ENTITY.search(st[f]):
                bad.append(f"studio {sname!r}'s {f} carries an HTML entity; write the character.")
        if not st.get("sessions"):
            bad.append(f"studio {sname!r} has no sessions, and would render as a heading over "
                       "nothing. Name it in words until somebody sends one.")
        for s in st.get("sessions") or []:
            t = (s.get("title") or "").strip() or "<untitled>"
            vid = (s.get("id") or "").strip()
            if not YT.match(vid):
                bad.append(f"{t!r} has {vid!r}, which is not a YouTube id. love-embed.js would "
                           "refuse it quietly, which is a button that never becomes a video.")
            if vid in seen:
                bad.append(f"{vid} is on the desk twice.")
            seen.add(vid)
            for f in ("tape", "title", "who", "where", "channel", "note", "spoken"):
                if not (s.get(f) or "").strip():
                    bad.append(f"{t!r} has no {f}.")
            if s.get("indoors") is not True:
                bad.append(
                    f"{t!r} is not marked as played indoors. This room is for sessions played "
                    "in a studio, and make-looming.py holds the opposite rule for outdoor "
                    "music one road over; a set played outside belongs there.")
            runs = (s.get("runs") or "").strip()
            if not CLOCK.match(runs):
                bad.append(f"{t!r} has {runs!r} as a runtime, which is not a clock. Every "
                           "control on this street says how long before the press.")
            note = (s.get("note") or "").strip()
            if looks_like_verse(note):
                bad.append(f"{t!r}'s note is several short hand-broken lines, which is what a "
                           "lyric looks like and what a sentence never does.")
            for f in ("tape", "title", "who", "where", "when", "channel", "note"):
                v = s.get(f) or ""
                if ENTITY.search(v):
                    bad.append(f"{t!r}'s {f} carries an HTML entity; write the character.")
                if RANKING.search(v):
                    bad.append(f"{t!r}'s {f} ranks the desk ({RANKING.search(v).group(0)!r}). "
                               "A desk is an order somebody patched things in, not a chart -- "
                               "and a superlative goes false the day another studio arrives.")
                for q in re.findall(r"“([^”]+)”|\"([^\"]+)\"", v):
                    quoted = (q[0] or q[1]).strip()
                    if quoted:
                        bad.append(f"{t!r}'s {f} quotes {quoted[:36]!r}... Nothing musical is "
                                   "hosted here and no words out of these sessions are on "
                                   "this page. Describe what it does instead.")
    return bad


def strip(s):
    when = f' &middot; {esc(s["when"])}' if s.get("when") else ""
    return (
        f'        <li class="lvr-strip" id="session-{attr(s["id"])}">\n'
        f'          <p class="lvr-tape"><span>{esc(s["tape"])}</span></p>\n'
        f'          <h3 class="lvr-strip__title">{esc(s["title"])}</h3>\n'
        f'          <p class="lvr-strip__where">{esc(s["where"])}{when} &middot; '
        f'{esc(s["runs"])}</p>\n'
        f'          <p class="lvr-strip__note">{esc(s["note"])}</p>\n'
        f'          <button type="button" class="facade" data-embed-id="{attr(s["id"])}" '
        f'data-embed-title="{attr(s["title"])}, on YouTube via {attr(s["channel"])}">\n'
        f'            Play &mdash; {esc(s["spoken"])}\n'
        f'            <span class="facade__play">&#9654; PRESS PLAY</span>\n'
        f'          </button>\n'
        f'          <p class="lvr-strip__on">{esc(s["who"])} &middot; on YouTube, via '
        f'{esc(s["channel"])}</p>\n'
        '        </li>')


def desk(d):
    out = []
    for st in d["studios"]:
        out.append(
            f'  <section class="lvr-studio" id="studio-{attr(st["id"])}" '
            f'aria-labelledby="studio-{attr(st["id"])}-h">\n'
            f'    <h2 id="studio-{attr(st["id"])}-h"><span class="lvr-studio__name">'
            f'{esc(st["name"])}</span> <span class="lvr-studio__place">{esc(st["place"])}'
            f'</span></h2>\n'
            f'    <p class="lvr-studio__about">{esc(st["about"])}</p>\n'
            '    <ol class="lvr-desk">\n'
            + "\n".join(strip(s) for s in st["sessions"]) + "\n"
            '    </ol>\n'
            '  </section>')
    return "\n".join(out)


def credit_rows(d):
    rows = []
    for st in d["studios"]:
        for s in st["sessions"]:
            rows.append(
                f'      <tr><td><strong>{esc(s["who"])}</strong></td><td>{esc(s["title"])}</td>'
                f'<td>{esc(st["name"])}, {esc(s["where"])}</td><td>{esc(s["runs"])}</td>'
                f'<td>{esc(s["channel"])}</td>'
                f'<td><a href="https://www.youtube.com/watch?v={attr(s["id"])}">watch</a></td></tr>')
    return "\n".join(rows)


def main():
    d = json.loads(DATA.read_text())
    bad = check(d)
    if bad:
        print("REFUSING to build The Live Room:")
        for b in bad:
            print("  - " + b)
        return 1
    swap(ROOM, "lvr-desk", desk(d), "  ")
    swap(NOTES, "live-room-credits", credit_rows(d), "      ")
    n = sum(len(st["sessions"]) for st in d["studios"])
    print(f"live room: {n} sessions on the desk across {len(d['studios'])} "
          f"stud{'io' if len(d['studios']) == 1 else 'ios'}, none of it hosted here and every "
          "one saying how long before the press.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
