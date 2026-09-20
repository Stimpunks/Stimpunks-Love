#!/usr/bin/env python3
"""Rebuild the yell button's recordings in playhouse.html from data/yells.json.

The yell button synthesises a shout. It always will: with nothing recorded the
toy still works, which is why the synth in love.js stays rather than being
replaced. Recordings are layered on top — press it and you get somebody's
actual voice, chosen at random, and the synth when there are none.

IT REWRITES THE HOUSE RULE, and that is the point of it being a tool. The
Playhouse says "the noises are synthesised here, not fetched from anywhere",
which is true today and stops being true the moment a recording lands. A claim
the site makes about itself should not depend on somebody remembering to edit
it, so the sentence is generated from the same data as the button.

A VOICE IDENTIFIES A PERSON AS SURELY AS A FACE DOES, so this follows the
polaroid wall rather than inventing a second process. No named yeller and no
consent date, no publishing. Withdrawal is deletion: remove the entry, remove
the file, run this, and the button goes back to synthesising. There is no
'hidden' flag to forget to honour later.

The credit is spoken, not filed. Press the button and the room says whose yell
that was, the same way Chairy names the two sayings that are not ours.
"""
import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGE = ROOT / "playhouse.html"
FOLDER = ROOT / "audio" / "yells"
SUFFIXES = (".m4a", ".mp3", ".opus", ".ogg", ".wav", ".aac", ".flac")

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


def find_file(yid):
    for suf in SUFFIXES:
        f = FOLDER / f"{yid}{suf}"
        if f.exists():
            return f
    return None


def main():
    data = json.loads((ROOT / "data/yells.json").read_text())
    yells = data.get("yells", [])

    seen, entries = set(), []
    for y in yells:
        for key in ("id", "who", "consent_on"):
            if not str(y.get(key, "")).strip():
                raise SystemExit(
                    f"REFUSING: a yell is missing its {key!r}.\n"
                    "A voice identifies somebody. If we cannot say whose it is and when\n"
                    "they agreed, we do not have their agreement, we have a file."
                )
        if y["id"] in seen:
            raise SystemExit(f"REFUSING: two yells share the id {y['id']!r}.")
        seen.add(y["id"])
        f = find_file(y["id"])
        if not f:
            raise SystemExit(
                f"REFUSING: {y['id']!r} is in the data and there is no file for it in\n"
                f"audio/yells/. If the yell was withdrawn, delete the entry too —\n"
                "withdrawal is deletion."
            )
        leaks = metadata_leaks(f)
        if leaks:
            raise SystemExit(
                f"REFUSING: {f.name} still carries {', '.join(leaks)}.\n"
                "Sending us a yell should not publish somebody's device and the second\n"
                "they recorded it. Strip it first; the docstring has the command."
            )
        entries.append({"src": f"audio/yells/{f.name}", "who": y["who"]})

    # Stray files: the same guard the readings have, and for the same reason --
    # a recording named for its recorder rather than its id would be ignored in
    # silence while the page reported one fewer than exists.
    if FOLDER.is_dir():
        known = {find_file(y["id"]).name for y in yells} if yells else set()
        stray = [f.name for f in sorted(FOLDER.iterdir())
                 if not f.name.startswith(".") and f.suffix.lower() in SUFFIXES
                 and f.name not in known]
        if stray:
            raise SystemExit(
                "REFUSING: audio/yells/ holds a file with no entry in data/yells.json:\n  "
                + "\n  ".join(repr(s) for s in stray)
                + "\nAdd it with who yelled and when they agreed, or remove it. A yell with\n"
                  "nobody's name on it is the one thing this cannot publish."
            )

    attr = html.escape(json.dumps(entries, ensure_ascii=False), quote=True)
    src = PAGE.read_text()
    pat = r'(<button[^>]*data-toy="yell"[^>]*data-yells=")[^"]*(")'
    if not re.search(pat, src, re.S):
        raise SystemExit(f"REFUSING: no yell button with a data-yells attribute in {PAGE.name}.")
    src = re.sub(pat, lambda m: m.group(1) + attr + m.group(2), src, flags=re.S)

    n = len(entries)
    if n:
        rule = (f"        <p><strong>Sound is on press only.</strong> The room is silent when you "
                f"walk in and stays silent if you never touch anything. Most of the noises are "
                f"synthesised here; the yell button also holds {n} recorded yell"
                f"{'' if n == 1 else 's'} from our community, played one at a time and only when "
                f"you press it. Nothing else is fetched from anywhere.</p>")
    else:
        rule = ("        <p><strong>Sound is on press only.</strong> The room is silent when you "
                "walk in and stays silent if you never touch anything. The noises are synthesised "
                "here, not fetched from anywhere.</p>")

    begin, end = "<!-- yellrule:begin -->", "<!-- yellrule:end -->"
    if begin not in src:
        raise SystemExit(f"REFUSING: {PAGE.name} has no {begin} / {end} markers.")
    src = re.sub(rf"({re.escape(begin)}).*?({re.escape(end)})",
                 lambda m: m.group(1) + "\n" + rule + "\n        " + m.group(2),
                 src, flags=re.S)

    PAGE.write_text(src)
    print(f"yells: {n} recorded" + ("" if n else " — the button synthesises, as it always could"))


if __name__ == "__main__":
    main()
