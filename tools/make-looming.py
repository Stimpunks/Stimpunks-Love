#!/usr/bin/env python3
"""Build Looming Rocks Amphitheatre's running order, and the credits.

ONE DATA FILE, ONE TOOL, TWO SURFACES -- the contract make-chappell.py,
make-club.py, make-lagoon.py, make-sithen.py, make-covenstead.py and
make-hermitage.py keep.

WHAT IT REFUSES:

  - AN ACT WITH NO RUNTIME, OR A RUNTIME THAT IS NOT A CLOCK. Every
    press-to-play control on this street says how long before the press, and
    this is the room where that promise is under the most load: these are FULL
    CONCERTS. The shortest is nearly an hour and the longest is over two, so a
    wrong or missing number here is the street breaking its own promise at the
    largest possible scale. The spoken form is required as well as the digits,
    because "1:52:23" is what a player shows and "1 hr 52 min" is what somebody
    decides with.

  - A NAMED LICHEN SPECIES. The room is built on the fact that lichens
    fluoresce under ultraviolet light, which is real and is used in the field.
    What it must never do is tell anybody that a particular species glows a
    particular colour, because nobody here has checked that and the format --
    a confident binomial beside a colour -- is the one most likely to be
    believed. make-hermitage.py's herbarium rule, arriving in a light rig --
    but NOT that rule's check, because it does not survive the move. A bare
    shape test works on a page of short labels and matches the start of nearly
    every sentence in prose: its first run here refused "Rocks that", "Once
    something" and "Ferrell sings". It is a SHAPE IN A PLACE now -- sentence
    starts are ignored, and it only reads sentences that are about lichen at
    all. See the note above the pattern.

  - A QUOTATION OF ANY LENGTH FROM THE STAGE. This street says in three places
    that nothing musical is hosted here, and a room made of six concerts is
    where that would be broken by somebody transcribing a good line between
    songs. The notes describe what a performance DOES. They quote nothing.

  - A RANKED RUNNING ORDER. No best, no greatest, no countdown. A running order
    is an order somebody put things in, not a verdict on them -- the pebbling
    cabinet's refusal of a tally arriving on a bill.

  - AN ID THAT IS NOT A YOUTUBE ID, ONE USED TWICE, OR AN ACT WITH NO CHANNEL.
    love-embed.js validates before it builds and returns QUIETLY, so a typo is
    a two-hour button somebody presses and presses that never becomes a video.
    None of this music is ours and every act names whose channel it is on.

  - AN HTML ENTITY IN ANY FIELD, and a note shaped like verse. The fifth and
    sixth shapes of each on this street; see data/lagoon.json.
"""
import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data/looming-rocks.json"
ROOM = ROOT / "looming-rocks.html"
NOTES = ROOT / "liner-notes.html"

YT = re.compile(r"^[A-Za-z0-9_-]{11}$")
CLOCK = re.compile(r"^\d+:[0-5]\d(?::[0-5]\d)?$")
ENTITY = re.compile(r"&(?:[a-zA-Z][a-zA-Z0-9]{1,31}|#\d{1,6}|#x[0-9a-fA-F]{1,6});")

RANKING = re.compile(
    r"\b(?:best|greatest|essential|definitive|top)\s+(?:\d+\s+)?"
    r"(?:show|shows|sets?|acts?|nights?|performances?|gigs?)\b"
    r"|\bcountdown\b|\branked\b|\bno\.?\s*1\b", re.I)

# A BINOMIAL CLAIM IS A SHAPE IN A PLACE, and the first version of this check
# had only the shape. `[A-Z][a-z]+ [a-z]+` is the herbarium's test and it works
# there because that file is short labels; run over PROSE it matches the start
# of nearly every sentence, and the first run refused "Rocks that", "Once
# something" and "Ferrell sings". Excepting those phrases would have been the
# mistake this repo has written down three times, so the pattern was narrowed
# instead, in two ways that are both structural rather than a list:
#
#   · SENTENCE STARTS ARE DROPPED. A genus is capitalised in the middle of a
#     sentence; the first word of a sentence is capitalised because it is the
#     first word. Nothing is learned from it either way, so it is not looked at.
#   · AND IT ONLY LOOKS WHERE THE RISK IS. A species claim in this room will sit
#     beside the subject -- lichen, species, fluoresce, glow -- so the check runs
#     on sentences carrying that vocabulary and nowhere else. A capitalised name
#     in a note about a band is a band.
LICHEN_TALK = re.compile(r"lichen|species|fluoresc|glow", re.I)
BINOMIAL = re.compile(r"\b([A-Z][a-z]{3,})\s+([a-z]{4,})\b")
# Ordinary English that fits the shape and turns up in exactly those sentences.
PLAIN = {
    "rock", "rocks", "lichen", "lichens", "stage", "stages", "light", "lights",
    "floods", "under", "light,", "back", "steadily", "glows", "which", "that",
    "come", "gives", "takes", "answer", "answers", "colour", "colours",
}

VERSE_LINE = 52


def esc(s):
    return html.escape(s, quote=False)


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
    acts = d.get("acts") or []
    if not acts:
        bad.append("data/looming-rocks.json has no acts, and the stage is made of them.")

    seen = set()
    for a in acts:
        t = (a.get("title") or "").strip() or "<untitled>"
        vid = (a.get("id") or "").strip()
        if not YT.match(vid):
            bad.append(f"{t!r} has {vid!r}, which is not a YouTube id. love-embed.js would "
                       "refuse it quietly, which is a two-hour button that never becomes a "
                       "video.")
        if vid in seen:
            bad.append(f"{vid} is in the running order twice.")
        seen.add(vid)
        if not (a.get("channel") or "").strip():
            bad.append(f"{t!r} names no channel. None of this music is ours.")
        if not (a.get("who") or "").strip():
            bad.append(f"{t!r} does not say who is playing.")
        runs = (a.get("runs") or "").strip()
        if not CLOCK.match(runs):
            bad.append(
                f"{t!r} has {runs!r} as a runtime, which is not a clock. This is the room "
                "where the street's promise is under the most load -- these are full "
                "concerts, and a wrong number in front of a two-hour press is the promise "
                "breaking at the largest scale it can.")
        if not (a.get("spoken") or "").strip():
            bad.append(f"{t!r} has no spoken runtime. The digits are what a player shows; "
                       "the spoken form is what somebody decides with.")
        note = (a.get("note") or "").strip()
        if not note:
            bad.append(f"{t!r} has no note written for this room.")
        if looks_like_verse(note):
            bad.append(f"{t!r}'s note is several short hand-broken lines, which is what a "
                       "lyric looks like and what a sentence never does.")
        if RANKING.search(note):
            bad.append(
                f"{t!r} ranks the running order. A running order is an order somebody put "
                "things in, not a verdict on them.")

        for field in ("title", "who", "channel", "note"):
            v = a.get(field) or ""
            if ENTITY.search(v):
                bad.append(f"{t!r}'s {field} contains an HTML entity; everything here is "
                           "escaped on the way into the page.")
            for q in re.findall(r"“([^”]+)”|\"([^\"]+)\"", v):
                quoted = (q[0] or q[1]).strip()
                if quoted:
                    bad.append(
                        f"{t!r}'s {field} quotes {quoted[:36]!r}... from the stage. Nothing "
                        "musical is hosted on this street and no words out of these "
                        "performances are on this page. Describe what it does instead.")

    # The lichen rule sweeps the WHOLE file, headers included, because the
    # temptation is in the prose about the rocks rather than in an act's note.
    # Sentence by sentence, and only sentences that are actually about the
    # subject -- see the note on BINOMIAL above for why both narrowings exist.
    flat = json.dumps(d, ensure_ascii=False)
    for sentence in re.split(r"(?<=[.!?])\s+|\\n", flat):
        if not LICHEN_TALK.search(sentence):
            continue
        body = sentence.split(" ", 1)[1] if " " in sentence else ""
        for m in BINOMIAL.finditer(body):
            if m.group(2).lower() in PLAIN or m.group(1).lower() in PLAIN:
                continue
            bad.append(
                f"{m.group(0)!r} reads as a species name, in a sentence about lichen. This "
                "room says lichens fluoresce, which is real; it must never say WHICH lichen "
                "glows WHICH colour, because nobody here has checked and a confident "
                "binomial beside a colour is the format most likely to be believed.")
    return bad


def secs(clock):
    return sum(int(x) * m for x, m in zip(reversed(clock.split(":")), (1, 60, 3600)))


def spoken_of(act):
    return act["spoken"]


def summary(acts):
    """THE COUNT AND THE RANGE, GENERATED. Both were typed into the page and
    both were wrong within a day of the room opening -- it said six acts and a
    shortest of 57 minutes, and four more arrived. This is the Jungle Room's
    dead-cam count: a number about the data belongs to the tool that holds the
    data, and the grammar around it has to be generated too, or the first
    version says "1 acts"."""
    lo = min(acts, key=lambda a: secs(a["runs"]))
    hi = max(acts, key=lambda a: secs(a["runs"]))
    n = len(acts)
    word = {6: "six", 7: "seven", 8: "eight", 9: "nine", 10: "ten", 11: "eleven",
            12: "twelve"}.get(n, str(n))
    return (f"The running order &mdash; {word} act{'' if n == 1 else 's'}, "
            f"shortest {spoken_of(lo)}, longest {spoken_of(hi)}")


def count_line(acts):
    n = len(acts)
    word = {6: "Six", 7: "Seven", 8: "Eight", 9: "Nine", 10: "Ten", 11: "Eleven",
            12: "Twelve"}.get(n, str(n))
    own = sum(1 for a in acts if a["who"].lower() in a["channel"].lower()
              or a["channel"].lower() in a["who"].lower())
    # The tail is generated too, not just the number. A line reading "1 of them
    # ... themselves" is a hand-typed total wearing a disguise, which is the
    # mistake the Jungle Room made with its dead cams.
    ownword = {0: "none", 1: "one", 2: "two", 3: "three", 4: "four", 5: "five",
               6: "six", 7: "seven", 8: "eight", 9: "nine", 10: "ten"}.get(own, str(own))
    tail = ("none of them posted by the artists themselves" if own == 0 else
            f"{ownword} of them posted by the artist or the band "
            f"{'themself' if own == 1 else 'themselves'}")
    return (f"{word} full show{'' if n == 1 else 's'}, all of them recorded at the real "
            f"place this one is fond of, and {tail}.")


def running(acts):
    out = []
    for i, a in enumerate(acts, 1):
        out.append(
            f'        <li class="act" data-ch="{i}" data-id="{esc(a["id"])}"\n'
            f'            data-title="{html.escape(a["title"], quote=True)}" '
            f'data-runs="{esc(a["runs"])}"\n'
            f'            data-spoken="{esc(a["spoken"])}" data-how="{esc(a["how"])}">\n'
            f'          <p class="act__no">ACT {i:02d}</p>\n'
            f'          <h4>{esc(a["title"])}</h4>\n'
            f'          <p class="act__by">{esc(a["who"])} &middot; on {esc(a["channel"])} '
            f'&middot; {esc(a["runs"])}</p>\n'
            f'          <p>{esc(a["note"])}</p>\n'
            f'          <button type="button" class="tuneto" data-ch="{i}">'
            f'Put it on the rocks &middot; {esc(a["spoken"])}</button>\n'
            '        </li>')
    return "\n".join(out)


def credit_rows(acts):
    return "\n".join(
        f'      <tr><td><strong>{esc(a["who"])}</strong></td><td>{esc(a["title"])}</td>'
        f'<td>{esc(a["runs"])}</td><td>{esc(a["channel"])}</td>'
        f'<td><a href="https://www.youtube.com/watch?v={esc(a["id"])}">watch</a></td></tr>'
        for a in acts)


def main():
    d = json.loads(DATA.read_text())
    bad = check(d)
    if bad:
        print("REFUSING to build Looming Rocks Amphitheatre:")
        for b in bad:
            print("  - " + b)
        return 1

    swap(ROOM, "looming-order", running(d["acts"]), "      ")
    swap(ROOM, "looming-summary", summary(d["acts"]), "    ")
    swap(ROOM, "looming-count", count_line(d["acts"]), "  ")
    swap(NOTES, "looming-credits", credit_rows(d["acts"]), "      ")

    total = sum(
        sum(int(x) * m for x, m in zip(reversed(a["runs"].split(":")), (1, 60, 3600)))
        for a in d["acts"])
    print(f"looming rocks: {len(d['acts'])} acts in the running order, "
          f"{total // 3600} hours {total % 3600 // 60} minutes of stage time, none of it "
          "hosted here and every one saying how long before the press.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
