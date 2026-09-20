#!/usr/bin/env python3
"""Rebuild the audio room in hear-queer-here.html from data/readings.json.

Hear Queer Here promised "the glossary read aloud, in our own voices" and did
not deliver it, which made the room's own name a claim it was not keeping. This
builds the room. It does NOT record anything: a passage goes live the moment
audio/<id>.mp3 exists beside it, and until then the page shows the words with a
visibly empty slot where the player will be -- the same choice as Enid's grey
polaroids, because a room that says what it is waiting for is more use than one
that pretends.

THE WORDS COME FIRST, AND THEY STAY. Every passage is printed as text whether or
not the audio exists. That is not a courtesy transcript bolted on afterwards: an
argument you can only follow by hearing it is an audio-only requirement, and on
a site published by a Disability foundation that would be the ordinary exclusion
rendered in HTML. The recording is a second route to the same words, never the
only one.

WHY THE PROSE IS NEW. The monotropism glossary entry is mostly curation -- the
explanation in it belongs to Murray, Lawson and Lesser, to the questionnaire's
authors, and to Helen Edgar, whose opening section is hers. Reading it aloud
would have been reading other people's words. These passages were written for
this room instead, so nothing here is anyone else's to clear. See _source in
data/readings.json.

Three passages carry a panel state, so the superposition panel and the readings
are the same argument rather than two decorations. Pressing a panel button
highlights its passage; it never starts audio. Nothing plays until you press
play, in this room as in the others.
"""
import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGE = ROOT / "hear-queer-here.html"
STATES = {None, "a", "b", "open"}

# Whatever the reader's recorder produced. This started as .mp3 only and missed the
# first actual recording, which was .m4a -- what a Mac makes by default. A tool that
# silently ignores the file it was built for is worse than one that refuses.
SUFFIXES = (".m4a", ".mp3", ".opus", ".ogg", ".wav", ".aac", ".flac")


def find_audio(rid):
    for suf in SUFFIXES:
        f = ROOT / "audio" / f"{rid}{suf}"
        if f.exists():
            return f
    return None


def main():
    data = json.loads((ROOT / "data/readings.json").read_text())
    readings = data["readings"]
    if not readings:
        raise SystemExit("REFUSING: data/readings.json has no readings.")

    seen, claimed = set(), {}
    for r in readings:
        for key in ("id", "title", "text"):
            if not r.get(key):
                raise SystemExit(f"REFUSING: a reading is missing its {key!r}.")
        if r["id"] in seen:
            raise SystemExit(f"REFUSING: two readings share the id {r['id']!r}.")
        seen.add(r["id"])
        if r.get("state") not in STATES:
            raise SystemExit(
                f"REFUSING: {r['id']!r} has state {r.get('state')!r}. "
                "The panel only knows 'a', 'b', 'open', or null."
            )
        if r.get("state") and r["state"] in claimed:
            raise SystemExit(
                f"REFUSING: {r['id']!r} and {claimed[r['state']]!r} both claim panel "
                f"state {r['state']!r}. A button cannot highlight two passages."
            )
        if r.get("state"):
            claimed[r["state"]] = r["id"]

    reader = html.escape(data.get("_reader", "us"))
    blocks, recorded = [], 0
    for r in readings:
        found = find_audio(r["id"])
        state = f' data-reading-state="{r["state"]}"' if r.get("state") else ""
        if found:
            recorded += 1
            player = (f'        <audio class="reading__player" controls preload="none" '
                      f'src="audio/{found.name}"></audio>')
        else:
            player = ('        <p class="reading__empty">Not recorded yet. The words are '
                      'here; the voice is not. This slot stays visibly empty rather than '
                      'quietly closed up.</p>')
        blocks.append(
            f'      <section class="reading"{state}>\n'
            f'        <h3>{html.escape(r["title"])}</h3>\n'
            f'        <p class="reading__text">{html.escape(r["text"])}</p>\n'
            f'{player}\n'
            f'      </section>'
        )

    lead = (f'      <p class="readings__lead">Selected passages on monotropism, written for '
            f'this room and read by {reader}. Not the glossary entry itself &mdash; most of '
            f'that belongs to <a href="https://stimpunks.org/glossary/monotropism/">other '
            f'people</a>, and it stays with their names on it. '
            f'<strong>{recorded} of {len(readings)} recorded.</strong></p>')

    block = lead + "\n" + "\n".join(blocks)
    src = PAGE.read_text()
    if "<!-- readings:begin -->" not in src:
        raise SystemExit(
            f"REFUSING: {PAGE.name} has no <!-- readings:begin --> / <!-- readings:end -->\n"
            "markers, so there is nowhere to write the room."
        )
    out = re.sub(r"(<!-- readings:begin -->).*?(<!-- readings:end -->)",
                 lambda m: m.group(1) + "\n" + block + "\n      " + m.group(2),
                 src, flags=re.S)
    PAGE.write_text(out)
    print(f"readings: {len(readings)} passages, {recorded} recorded, "
          f"{len(readings) - recorded} waiting on audio")


if __name__ == "__main__":
    main()
