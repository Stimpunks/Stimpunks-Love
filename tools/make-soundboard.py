#!/usr/bin/env python3
"""Build the Playhouse's sound board out of data/soundboard.json.

THREE FILES HAVE TO AGREE ABOUT EVERY PAD AND NONE OF THEM IS NEAR THE OTHERS.
The markup is in playhouse.html, the noise is a function in love.js, the key's
colour and its flourish are rules in love.css. A pad whose voice is missing is a
button that does nothing and says nothing -- make-chappell.py's typo that never
becomes a video, arriving in a room where the press IS the content. A pad whose
burst is missing is a button that is quietly ordinary at MAX GLITTER, which
nobody would notice because nobody screenshots MAX. So this reads all three and
refuses rather than writing a board that only works in the file you are looking
at.

THE DRAWINGS LIVE HERE AND THE WORDS LIVE IN THE DATA, which is make-guild.py's
split for make-guild.py's reason: a pad with no drawing must be a refusal rather
than a fallback, because the failure mode of guessing is ONE SHARED SHAPE on
every pad -- the harmonising instinct arriving through plumbing, on a board whose
whole job is that no two of these noises are the same noise. Each wave is that
pad's own sound drawn as a line: one spike for the click, a decaying ring for the
chime, a tight buzz for the angry hum. Fifteen lines, no two alike.

AND THE BOTTOM ROW IS NOT A FEELINGS CHART, which is the reason there are no
faces on this board and the reason this file checks the mood row rather than
trusting it. Three pads, three moods each, happy then sad then angry, and what
changes is the shape of a NOISE. A row of happy/sad/angry FACES on a Disabled
people's site is the emotion flashcard, and it is the kind of thing that arrives
by accident from somebody drawing a friendly icon. The moods are a word, a line
and a sound, and never a face.

WHAT IT REFUSES, and why each one is here:

  · A PAD WITH NO `heard`. The board is made of sounds, and a sound is the one
    kind of content that a reader can be completely locked out of. Every pad
    says what it sounds like, in words, into the room's live region on the press
    -- the Jungle Room's rule that colour is never the only channel, in a room
    where the channel is audio. A pad that cannot say what it did is a pad that
    only works for people who can hear it.

  · TWO PADS THAT SOUND THE SAME, checked on the `heard` line, because that
    sentence is the only description of the noise anybody has written down. Two
    identical descriptions means either two identical pads or one of them is
    lying about itself, and a board of nine buttons exists to be nine buttons.

  · A BURST CLAIMED TWICE. Ryan asked for a different visual flourish for each
    button, so a shared one is not a shortcut, it is the thing not being done.

  · A MOOD ROW THAT IS NOT THE LAST ROW, or a mood pad with a different set of
    moods from the one beside it. The grid is rows of three; the moods are the
    bottom row. A pad with two moods, or a fourth mood, or the same three in a
    different order, makes the bottom row a different control in every column.

  · A VOICE, A KEY OR A BURST THAT THE OTHER FILES DO NOT HAVE. See above.

IF THIS REFUSES: add the missing half. Do not delete the pad to make it quiet,
and do not point two pads at one burst.
"""
import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGE = ROOT / "playhouse.html"
CSS = ROOT / "love.css"
JS = ROOT / "love.js"
DATA = ROOT / "data/soundboard.json"

MOODS = ("happy", "sad", "angry")
ACROSS = 3          # the board is a grid this wide; the moods are the last row.

WORDS = {1: "one", 2: "two", 3: "three", 4: "four", 5: "five", 6: "six",
         7: "seven", 8: "eight", 9: "nine", 10: "ten", 11: "eleven", 12: "twelve"}


# ── The waves, one per pad and one per mood ──────────────────────────────────
# Each is the pad's own noise drawn as a line in a 120×36 box: a flat trace with
# one spike for the click, a ring dying away for the chime, a buzz with no decay
# in it at all for the angry hum. They are the second channel for the moods --
# the word says which mood, the line says what shape it is, and neither is a
# face. Drawn with currentColor, so a pad's wave cannot drift from the ink the
# key is already checked in.
WAVE = {
    "click":
        "M2 18 H48 L52 5 L56 31 L60 18 H118",
    "pop":
        "M2 28 H44 C56 28 58 6 70 6 C80 6 82 18 92 18 H118",
    "rain":
        "M2 18 L8 26 L14 12 L20 26 L26 12 L32 26 L38 12 L44 26 L50 12 L56 26 "
        "L62 12 L68 26 L74 12 L80 26 L86 12 L92 26 L98 12 L104 26 L110 18 H118",
    "chime":
        "M2 18 C8 -1 16 -1 22 18 C28 37 36 37 42 18 C47 3 54 3 59 18 "
        "C64 33 70 33 75 18 C79 8 84 8 88 18 C92 28 97 28 101 18 "
        "C104 13 108 13 111 18 H118",
    "purr":
        "M2 18 C5 11 9 11 12 18 C15 25 19 25 22 18 C25 11 29 11 32 18 "
        "C35 25 39 25 42 18 C45 11 49 11 52 18 C55 25 59 25 62 18 "
        "C65 11 69 11 72 18 C75 25 79 25 82 18 C85 11 89 11 92 18 "
        "C95 25 99 25 102 18 C105 11 109 11 112 18 H118",
    "squeak":
        "M2 18 H30 L34 8 L38 26 L42 6 L46 28 L50 4 L54 30 L58 8 L62 24 "
        "L66 14 L70 20 H118",

    ("hum", "happy"):
        "M2 24 C8 24 8 18 14 18 C20 18 20 24 26 24 C32 24 32 16 38 16 "
        "C44 16 44 22 50 22 C56 22 56 14 62 14 C68 14 68 20 74 20 "
        "C80 20 80 12 86 12 C92 12 92 18 98 18 C104 18 104 11 110 11 "
        "C114 11 116 11 118 11",
    ("hum", "sad"):
        "M2 11 C8 11 8 17 14 17 C20 17 20 10 26 10 C32 10 32 18 38 18 "
        "C44 18 44 12 50 12 C56 12 56 20 62 20 C68 20 68 14 74 14 "
        "C80 14 80 23 86 23 C92 23 92 17 98 17 C104 17 104 26 110 26 "
        "C114 26 116 26 118 26",
    ("hum", "angry"):
        "M2 18 L6 6 L10 30 L14 6 L18 30 L22 6 L26 30 L30 6 L34 30 L38 6 "
        "L42 30 L46 6 L50 30 L54 6 L58 30 L62 6 L66 30 L70 6 L74 30 L78 6 "
        "L82 30 L86 6 L90 30 L94 6 L98 30 L102 6 L106 30 L110 6 L114 30 L118 18",

    ("spring", "happy"):
        "M2 30 L8 22 L14 30 L20 20 L26 28 L32 17 L38 25 L44 13 L50 21 "
        "L56 10 L62 18 L68 8 L74 15 L80 7 L86 13 L92 7 L98 11 L104 8 "
        "L110 10 L118 9",
    ("spring", "sad"):
        "M2 8 L8 16 L14 9 L22 19 L30 12 L40 23 L50 16 L62 27 L74 20 "
        "L88 29 L102 24 L118 29",
    ("spring", "angry"):
        "M2 18 L4 4 L7 32 L10 5 L13 31 L17 7 L21 29 L26 9 L31 27 L37 11 "
        "L43 25 L50 13 L57 23 L65 15 L73 21 L82 16 L92 20 L104 18 L118 18",

    ("drum", "happy"):
        "M2 28 H24 L28 20 L32 28 H52 L56 14 L60 28 H80 L84 8 L88 28 H118",
    ("drum", "sad"):
        "M2 28 H30 C46 28 46 14 60 14 C74 14 74 28 90 28 H118",
    ("drum", "angry"):
        "M2 28 H26 L30 4 L34 30 L38 12 L42 26 L46 16 L50 24 L54 19 L58 22 "
        "L62 20 H118",
}


def e(s):
    return html.escape(str(s), quote=True)


def main():
    data = json.loads(DATA.read_text())
    pads = data.get("pads", [])
    css, js = CSS.read_text(), JS.read_text()
    problems = []

    if not pads:
        raise SystemExit("REFUSING: data/soundboard.json has no pads in it.")
    if len(pads) % ACROSS:
        problems.append(
            f"the board is {len(pads)} pads, which is not a whole number of rows of "
            f"{ACROSS}. The grid would end with a gap where a button should be.")

    # Which pads are on the last row, and which say they have moods. The two
    # answers have to be the same answer.
    last_row = set(range(len(pads) - ACROSS, len(pads)))
    voices = set(re.findall(r"voice\('([a-z:]+)'", js))

    seen_id, seen_name, seen_heard, seen_burst = {}, {}, {}, {}

    for i, p in enumerate(pads):
        pid = p.get("id", "")
        where = f"pad {pid!r}" if pid else f"pad {i + 1}"

        for key in ("id", "name", "key", "burst", "what"):
            if not str(p.get(key, "")).strip():
                problems.append(f"{where} is missing its {key!r}.")
        if not pid:
            continue

        for field, bag, what in ((pid, seen_id, "id"), (p.get("name"), seen_name, "name"),
                                 (p.get("burst"), seen_burst, "burst")):
            if field in bag:
                problems.append(
                    f"{where} and {bag[field]!r} share the {what} {field!r}."
                    + (" Ryan asked for a different flourish on every button, so a "
                       "shared one is the thing not being done." if what == "burst" else ""))
            bag[field] = pid

        moods = p.get("moods")
        if (i in last_row) != bool(moods):
            problems.append(
                f"{where} " + ("has moods and is not on the bottom row."
                               if moods else "is on the bottom row and has no moods.")
                + " The bottom row is the mood row; a mood pad anywhere else makes the"
                  " grid a different control in every column.")

        if moods:
            got = tuple(m.get("mood", "") for m in moods)
            if got != MOODS:
                problems.append(
                    f"{where} has the moods {got!r} and every mood pad has "
                    f"{MOODS!r}, in that order.")
            for m in moods:
                mood, heard = m.get("mood", ""), str(m.get("heard", "")).strip()
                if not heard:
                    problems.append(
                        f"{where} at {mood!r} does not say what it sounds like. "
                        "The board is made of sounds and that line is the only way "
                        "it reaches somebody who cannot hear them.")
                if heard in seen_heard:
                    problems.append(
                        f"{where} at {mood!r} sounds exactly like {seen_heard[heard]}.")
                seen_heard[heard] = f"{pid} at {mood!r}"
                if (pid, mood) not in WAVE:
                    problems.append(
                        f"{where} at {mood!r} has no wave drawn for it in this file. "
                        "Draw it rather than letting the pad borrow one; a shared "
                        "line is a board with one shape on it.")
                if f"{pid}:{mood}" not in voices:
                    problems.append(
                        f"{where} at {mood!r} has no voice('{pid}:{mood}') in love.js, "
                        "so that press would make no sound at all.")
        else:
            heard = str(p.get("heard", "")).strip()
            if not heard:
                problems.append(
                    f"{where} does not say what it sounds like. The board is made of "
                    "sounds and that line is the only way it reaches somebody who "
                    "cannot hear them.")
            if heard in seen_heard:
                problems.append(f"{where} sounds exactly like {seen_heard[heard]}.")
            seen_heard[heard] = repr(pid)
            if pid not in WAVE:
                problems.append(f"{where} has no wave drawn for it in this file.")
            if pid not in voices:
                problems.append(
                    f"{where} has no voice('{pid}') in love.js, so pressing it would "
                    "make no sound at all.")

        # The other two files. A key with no rule is a pad with no colour; a
        # burst with no keyframes is a button that is quietly ordinary at MAX.
        if p.get("key") and f".stimpad--{p['key']}" not in css:
            problems.append(f"{where} asks for the key colour {p['key']!r}, which has "
                            f"no .stimpad--{p['key']} rule in love.css.")
        if p.get("burst"):
            if f".burst--{p['burst']}" not in css:
                problems.append(f"{where} asks for the flourish {p['burst']!r}, which has "
                                f"no .burst--{p['burst']} rule in love.css.")
            if f"@keyframes pb-{p['burst']}" not in css:
                problems.append(f"{where}'s flourish {p['burst']!r} has no "
                                f"@keyframes pb-{p['burst']} in love.css, so nothing "
                                "would happen at MAX GLITTER.")

    if problems:
        raise SystemExit("REFUSING:\n  " + "\n  ".join(problems))

    # ── The markup ───────────────────────────────────────────────────────────
    out = []
    for p in pads:
        moods = p.get("moods")
        cls = f"stimpad stimpad--{p['key']}" + (" stimpad--mood" if moods else "")
        first = moods[0] if moods else None
        wave = WAVE[(p["id"], first["mood"])] if moods else WAVE[p["id"]]

        bits = [f'    <li><button type="button" class="{cls}" data-pad="{e(p["id"])}"'
                f' data-burst="{e(p["burst"])}"']
        if moods:
            payload = [{"mood": m["mood"], "heard": m["heard"],
                        "wave": WAVE[(p["id"], m["mood"])]} for m in moods]
            # data-mood is the mood the key is OFFERING and love.js moves it on
            # after a press; data-lit, which only the script ever writes, stays
            # on the one that just played. Two attributes because they answer
            # two questions -- see the note beside them in love.css.
            bits.append(f'      data-mood="{e(first["mood"])}"')
            bits.append(f'      data-moods="{e(json.dumps(payload, ensure_ascii=False))}"')
        else:
            bits.append(f'      data-heard="{e(p["heard"])}"')
        bits.append("      >")
        bits.append(f'      <span class="stimpad__name">{e(p["name"])}</span>')
        if moods:
            bits.append(f'      <span class="stimpad__mood">{e(first["mood"])}</span>')
        bits.append(f'      <svg class="stimpad__wave" viewBox="0 0 120 36" aria-hidden="true" '
                    f'focusable="false"><path d="{wave}" fill="none" stroke="currentColor" '
                    f'stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>')
        bits.append(f'      <span class="stimpad__what">{e(p["what"])}</span>')
        bits.append(f'      <span class="burst burst--{e(p["burst"])}" aria-hidden="true"></span>')
        bits.append("    </button></li>")
        out.append("\n".join(bits))

    n_mood = sum(1 for p in pads if p.get("moods"))
    n_plain = len(pads) - n_mood
    rows = len(pads) // ACROSS
    # The shape is generated and so is the caveat on it. The grid is
    # ACROSS wide where there is room and one column on a phone, and a
    # sentence claiming three rows of three would be false on the narrower
    # half of the readers — make-jungle.py's rule about a generated number
    # dragging its own grammar along with it.
    note = (f"{WORDS.get(len(pads), len(pads)).capitalize()} keys, "
            f"{WORDS.get(rows, rows)} by {WORDS.get(ACROSS, ACROSS)} where there is "
            f"room for it and one column on a phone. The first "
            f"{WORDS.get(n_plain, n_plain)} make one noise each, for as long as you "
            f"keep pressing them. The last {WORDS.get(n_mood, n_mood)} have moods, "
            f"and each one shows the mood it is about to play.")

    block = ('  <p class="stimboard__note">' + note + "</p>\n"
             '  <ul class="stimboard__grid">\n' + "\n".join(out) + "\n  </ul>")

    src = PAGE.read_text()
    begin, end = "<!-- soundboard:begin -->", "<!-- soundboard:end -->"
    if begin not in src or end not in src:
        raise SystemExit(
            f"REFUSING: {PAGE.name} has no {begin} / {end} markers, so there is nowhere\n"
            "to write. Put them back rather than letting this tool go quiet — a\n"
            "generator that writes nothing and exits 0 is how two surfaces drift apart.")
    PAGE.write_text(re.sub(re.escape(begin) + r".*?" + re.escape(end),
                           lambda m: begin + "\n" + block + "\n  " + end,
                           src, flags=re.S))

    print(f"sound board: {len(pads)} pads, {n_mood} with moods, "
          f"{len(pads) + n_mood * (len(MOODS) - 1)} noises, {len(pads)} flourishes, none alike")


if __name__ == "__main__":
    main()
