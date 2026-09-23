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
import difflib
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


def duration_seconds(f):
    """Length in whole seconds, or None when we cannot read it honestly.

    Only MP4/M4A is parsed, by walking to the mvhd atom. The panel's play
    control tells you what a press is about to cost, and a wrong number there
    is worse than no number, so anything else returns None and the control
    falls back to counting passages.
    """
    try:
        raw = f.read_bytes()
    except OSError:
        return None
    if raw[4:8] != b"ftyp":
        return None
    def atom_size(buf, at):
        """Atom size, honouring MP4's two escapes.

        size 1 means the real length is a 64-bit value after the type -- which
        is what Voice Memos writes for mdat, and treating it as malformed meant
        bailing out before reaching moov, which sits after it. size 0 means the
        atom runs to the end of the file.
        """
        n = int.from_bytes(buf[at:at + 4], "big")
        if n == 1:
            return int.from_bytes(buf[at + 8:at + 16], "big"), 16
        if n == 0:
            return len(buf) - at, 8
        return n, 8

    i = 0
    while i + 8 <= len(raw):
        size, _ = atom_size(raw, i)
        kind = raw[i + 4:i + 8]
        if size < 8:
            return None
        if kind == b"moov":
            j = i + 8
            end = min(i + size, len(raw))
            while j + 8 <= end:
                sub, _ = atom_size(raw, j)
                if sub < 8:
                    return None
                if raw[j + 4:j + 8] == b"mvhd":
                    ver = raw[j + 8]
                    if ver == 0:
                        scale = int.from_bytes(raw[j + 20:j + 24], "big")
                        dur = int.from_bytes(raw[j + 24:j + 28], "big")
                    else:
                        scale = int.from_bytes(raw[j + 28:j + 32], "big")
                        dur = int.from_bytes(raw[j + 32:j + 40], "big")
                    return round(dur / scale) if scale else None
                j += sub
            return None
        i += size
    return None


def find_audio(rid):
    for suf in SUFFIXES:
        f = ROOT / "audio" / f"{rid}{suf}"
        if f.exists():
            return f
    return None

# Metadata a recorder leaves in the file. Apple's Voice Memos writes the device
# model, the OS build and the exact second, and the yell that arrived on
# 2026-09-19 carried all three -- as did the five readings already published,
# which nobody had checked. A photograph is refused for its EXIF one room over;
# a voice deserves the same. Strip with:
#
#     ffmpeg -i in.m4a -map_metadata -1 -fflags +bitexact -c copy out.m4a
#
LEAKS = ((b"VoiceMemos", "the recording app and device"),
         (b"\xa9too", "an encoder tag"),
         (b"\xa9xyz", "GPS COORDINATES"),
         (b"date20", "the exact recording time"))


def metadata_leaks(path):
    raw = path.read_bytes()
    return [why for tag, why in LEAKS if tag in raw]


def stray_audio(terms):
    """Files in audio/ that answer to no passage, in any term.

    A recording arrives named whatever the recorder called it -- three arrived
    as "The B side: the same wall.m4a" and the like, which is the passage title
    rather than its id. Silently ignoring one would leave the page reporting
    fewer recordings than exist and nothing to say why, which is the same
    failure as only looking for .mp3 and missing the first one. So the tool
    names the file and guesses what it was meant to be.
    """
    folder = ROOT / "audio"
    if not folder.is_dir():
        return []
    wanted, titles = set(), {}
    for t in terms:
        for r in t["readings"]:
            wanted.add(r["id"])
            titles[r["title"]] = r["id"]
    out = []
    for f in sorted(folder.iterdir()):
        if f.name.startswith(".") or f.suffix.lower() not in SUFFIXES:
            continue
        if f.stem in wanted:
            continue
        guess = difflib.get_close_matches(f.stem, list(titles), n=1, cutoff=0.4)
        suggest = titles[guess[0]] if guess else None
        if not suggest:
            guess = difflib.get_close_matches(f.stem, list(wanted), n=1, cutoff=0.3)
            suggest = guess[0] if guess else None
        out.append((f, suggest))
    return out


def check(terms):
    """Refuse rather than publish something crooked."""
    if not terms:
        raise SystemExit("REFUSING: data/readings.json has no terms.")
    ids = {}
    for t in terms:
        for key in ("slug", "title", "glossary", "reader"):
            if not str(t.get(key, "")).strip():
                raise SystemExit(f"REFUSING: a term is missing its {key!r}.")
        if not t.get("readings"):
            raise SystemExit(f"REFUSING: the term {t['slug']!r} has no passages.")
        claimed = {}
        for r in t["readings"]:
            for key in ("id", "title", "text"):
                if not r.get(key):
                    raise SystemExit(f"REFUSING: a passage in {t['slug']!r} has no {key!r}.")
            # Audio filenames are flat, so ids must be unique across every term.
            if r["id"] in ids:
                raise SystemExit(
                    f"REFUSING: {r['id']!r} is used in both {ids[r['id']]!r} and "
                    f"{t['slug']!r}.\nRecordings live in one folder, so an id cannot "
                    "belong to two passages."
                )
            ids[r["id"]] = t["slug"]
            if r.get("state") not in STATES:
                raise SystemExit(
                    f"REFUSING: {r['id']!r} has state {r.get('state')!r}. "
                    "The panel only knows 'a', 'b', 'open', or null."
                )
            if r.get("state") and r["state"] in claimed:
                raise SystemExit(
                    f"REFUSING: {r['id']!r} and {claimed[r['state']]!r} both claim panel "
                    f"state {r['state']!r} in {t['slug']!r}. A button cannot highlight "
                    "two passages."
                )
            if r.get("state"):
                claimed[r["state"]] = r["id"]


def render_term(t):
    blocks, recorded = [], 0
    for r in t["readings"]:
        found = find_audio(r["id"])
        secs = duration_seconds(found) if found else None
        attrs = f' data-term="{t["slug"]}"'
        if r.get("state"):
            attrs += f' data-reading-state="{r["state"]}"'
        if r.get("sequences"):
            attrs += f' data-sequences="{" ".join(r["sequences"])}"'
        if secs:
            attrs += f' data-seconds="{secs}"'
        if found:
            leaks = metadata_leaks(found)
            if leaks:
                raise SystemExit(
                    f"REFUSING: {found.name} still carries {', '.join(leaks)}.\n"
                    "A reading should not publish the reader's device and the second they\n"
                    "recorded it. Strip it first; the docstring has the command."
                )
            # A VOICE GETS A CONSENT DATE, as it does everywhere else on the
            # street. This file was the one audio tool that did not ask, and
            # the privacy page had to word its promise around the gap.
            if not r.get("consent_on"):
                raise SystemExit(
                    f"REFUSING: {found.name} is {t['reader']}'s voice and its reading has no\n"
                    "consent_on. No consent date, no publishing -- make-yells.py's rule."
                )
            recorded += 1
            player = (f'          <audio class="reading__player" controls preload="none" '
                      f'src="audio/{found.name}"></audio>')
        else:
            player = ('          <p class="reading__empty">Not recorded yet. The words are '
                      'here; the voice is not. This slot stays visibly empty rather than '
                      'quietly closed up.</p>')
        blocks.append(
            f'        <section class="reading"{attrs}>\n'
            f'          <h4>{html.escape(r["title"])}</h4>\n'
            f'          <p class="reading__text">{html.escape(r["text"])}</p>\n'
            f'{player}\n'
            f'        </section>'
        )

    n = len(t["readings"])
    # Tense matters. Naming somebody as the reader of passages nobody has read
    # yet would put a claim about them on a public page before it was true.
    voice = (f'read by {html.escape(t["reader"])}' if recorded
             else f'to be read by {html.escape(t["reader"])}')
    lead = (f'        <p class="readset__lead">{n} passages, '
            f'{html.escape(t["words"])} and {voice}. '
            f'<a href="{html.escape(t["glossary"], quote=True)}">the glossary entry</a>. '
            f'<strong>{recorded} of {n} recorded.</strong></p>')

    return (f'      <section class="readset" data-term="{t["slug"]}">\n'
            f'        <h3 class="readset__name">{html.escape(t["title"])}</h3>\n'
            f'{lead}\n' + "\n".join(blocks) + '\n      </section>'), recorded


def write_region(src, name, block, indent):
    begin, end = f"<!-- {name}:begin -->", f"<!-- {name}:end -->"
    if begin not in src:
        raise SystemExit(
            f"REFUSING: {PAGE.name} has no {begin} / {end} markers, so there is\n"
            "nowhere to write that part of the room."
        )
    return re.sub(rf"({re.escape(begin)}).*?({re.escape(end)})",
                  lambda m: m.group(1) + "\n" + block + "\n" + indent + m.group(2),
                  src, flags=re.S)


def main():
    data = json.loads((ROOT / "data/readings.json").read_text())
    terms = data.get("terms", [])
    check(terms)

    stray = stray_audio(terms)
    if stray:
        lines = ["REFUSING: audio/ holds a file that answers to no passage.", ""]
        for f, suggest in stray:
            lines.append(f"  {f.name!r}")
            lines.append(f"      rename to: {suggest}{f.suffix}" if suggest
                         else "      matches no passage in data/readings.json")
        lines += ["",
                  "A recording named for its title rather than its id would be ignored in",
                  "silence, and the page would report fewer recordings than exist with",
                  "nothing to say why. Rename it, or add the passage to data/readings.json."]
        raise SystemExit("\n".join(lines))

    sections, totals = [], []
    for t in terms:
        block, recorded = render_term(t)
        sections.append(block)
        totals.append((t["slug"], recorded, len(t["readings"])))

    picker = "\n".join(
        f'          <button type="button" class="measuring__btn" data-term="{t["slug"]}"'
        f' aria-pressed="{"true" if i == 0 else "false"}">{html.escape(t["title"].lower())}</button>'
        for i, t in enumerate(terms))

    src = PAGE.read_text()
    src = write_region(src, "readings", "\n".join(sections), "      ")
    src = write_region(src, "measuring", picker, "        ")
    PAGE.write_text(src)

    done = sum(r for _, r, _ in totals)
    all_n = sum(n for _, _, n in totals)
    print(f"readings: {len(terms)} terms, {all_n} passages, {done} recorded, "
          f"{all_n - done} waiting on audio")
    for slug, r, n in totals:
        print(f"    {slug:20} {r}/{n}")

if __name__ == "__main__":
    main()
