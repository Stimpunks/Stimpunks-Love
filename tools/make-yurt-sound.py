#!/usr/bin/env python3
"""Wire the Faery Yurt's sounds to their tiles, and their credits to the liner notes.

The Regulation Nook is six tiles of Helen's, and the ones with a sound behind
them are buttons: press "the smell of vanilla cupcakes" and somebody says
Mmmm, press "a standing supply of coffee" and somebody says Ahhhh. Easter eggs,
which is exactly why they get a tool instead of being typed into the page and
forgotten.

MARKERS PER TILE, NOT A GENERATED LIST. Each sound owns one
<!-- yurt-sound:<id>:begin --> / :end pair in faery-yurt.html and nothing else,
so the silent tiles stay Helen's own hand-written markup and this tool cannot
reach them. The alternative was generating the whole nook, which would have
moved her six lines and six drawings into a JSON file to serve two of them. A
sound with no markers is a refusal; so is a marker pair with no sound.

AND IT SWEEPS THE WHOLE OF audio/, not just its own files. That is the bigger
gap a third kind of audio exposed: make-readings.py guards passages,
make-yells.py guards yells, this guards the yurt, and every one of them looks
only at files its own data file names. Four recordings sat in audio/ for the
length of an afternoon carrying `com.apple.VoiceMemos (iPad Version 26.6.2)`,
a creation timestamp to the second and a voice-memo UUID -- in a public
repository, one `git add -A` from being permanent -- and nothing was watching,
because they belonged to no tool's patch. Three guards with a hole between them
is a hole. This walks every audio file in the repo instead.

IT IS A THIRD KIND OF AUDIO AND THAT WAS THE GAP. This site had passages
(make-readings.py) and yells (make-yells.py), and both refuse a file still
carrying what a recorder wrote into it -- the device, the OS build, the exact
second. A sound belonging to neither had nothing watching it, and this one
arrived with `com.apple.VoiceMemos (iPad Version 26.6.2)` and a timestamp in it,
like the first six recordings here did. Strip it and the tool is happy:

    ffmpeg -i in.m4a -map_metadata -1 -fflags +bitexact -c copy out.m4a

A VOICE IS NOT LESS IDENTIFYING THAN A FACE, so the consent record is the
polaroid wall's: who it is, named the way they asked, and the date they agreed.
Withdrawal is deletion -- remove the entry, remove the file, run this, and the
tile goes back to being a tile with nothing behind it.

THE RUNTIME IS MEASURED, NOT TYPED. Every press-to-play control on this street
says how long before the press: the jukebox, the thirteen arches in The
Chappell, the audio room's sequence. That promise is only worth anything if the
number is true, so it comes out of the file's own container rather than out of
data/yurt-sound.json, where it would be one edit away from being a lie.

AND IT IS AN EASTER EGG THAT STILL TELLS YOU IT IS THERE. The tile keeps
Helen's wording and gains a small marker that surfaces on hover and focus; the
button's accessible name says it is a sound and how long. The discovery is that
one of six tiles does anything at all -- not that a page you were reading
quietly made a noise at you. A hidden noise would be the one thing the dial and
the press-to-play facades exist to prevent, arriving as a joke.
"""
import html
import json
import re
import struct
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data/yurt-sound.json"
PAGE = ROOT / "faery-yurt.html"
NOTES = ROOT / "liner-notes.html"

# What a recorder leaves behind. `make-yells.py` and `make-readings.py` look for
# the same things; an m4a keeps them in plain sight in its moov atom.
SMELLS = (b"com.apple", b"VoiceMemos", b"Core Media", b"iPhone", b"iPad",
          b"Macintosh", b"Logic Pro", b"GarageBand", b"Audacity")


def duration_seconds(path: Path) -> float:
    """Read the runtime out of the file itself.

    ffprobe if it is here, and the MP4 mvhd atom if it is not -- this tool has
    to run in the pre-deploy sequence on a machine that has not installed
    anything, and a checker that silently skips is worse than one that refuses.
    """
    try:
        out = subprocess.run(
            ["ffprobe", "-v", "error", "-show_entries", "format=duration",
             "-of", "csv=p=0", str(path)],
            capture_output=True, text=True, timeout=30,
        )
        if out.returncode == 0 and out.stdout.strip():
            return float(out.stdout.strip())
    except (FileNotFoundError, subprocess.SubprocessError, ValueError):
        pass

    raw = path.read_bytes()
    i = raw.find(b"mvhd")
    if i < 0:
        raise SystemExit(
            f"REFUSING: cannot read a runtime out of {path.name}, and this tool will\n"
            "not print a label saying how long it is without knowing. Install ffmpeg,\n"
            "or give it a file whose container says."
        )
    # After the four bytes of 'mvhd' come version and flags (4), then creation
    # and modification times (4 each in version 0, 8 each in version 1), then
    # the timescale and the duration. This read the modification time as the
    # timescale until 2026-09-26, and nobody knew, because the machine that ran
    # it had ffprobe; the first one that did not reported 0.0 seconds.
    ver = raw[i + 4]
    if ver == 1:
        scale, units = struct.unpack(">IQ", raw[i + 24:i + 36])
    else:
        scale, units = struct.unpack(">II", raw[i + 16:i + 24])
    return units / scale if scale else 0.0


def say_runtime(sec: float) -> str:
    """'2 seconds'. Short enough that the honest label is the plain one."""
    n = max(1, round(sec))
    return f"{n} second" + ("" if n == 1 else "s")


def splice(path: Path, marker: str, block: str):
    src = path.read_text()
    begin, end = f"<!-- {marker}:begin -->", f"<!-- {marker}:end -->"
    if begin not in src or end not in src:
        raise SystemExit(
            f"REFUSING: {path.name} has no {begin} / {end} markers, so there is\n"
            "nowhere to build. Put them back rather than letting this write blind."
        )
    indent = re.search(r"^([ \t]*)" + re.escape(begin), src, re.M).group(1)
    out = re.sub(re.escape(begin) + r".*?" + re.escape(end),
                 lambda m: begin + "\n" + block + "\n" + indent + end,
                 src, flags=re.S)
    path.write_text(out)


def sweep_all_audio():
    """Every audio file in the repo, not just the ones this tool owns.

    A file belonging to no tool's data is a file nothing checks, and that is
    exactly how four unstripped recordings came to be sitting in audio/ next to
    six stripped ones. Refuses rather than strips: what to do with somebody's
    recording is their call, and a tool that silently rewrote the files people
    dropped in would be worse than one that says what is wrong.
    """
    exts = {".m4a", ".mp3", ".wav", ".aac", ".flac", ".opus", ".ogg"}
    dirty = []
    for f in sorted((ROOT / "audio").rglob("*")):
        if f.suffix.lower() not in exts:
            continue
        raw = f.read_bytes()
        left = sorted({m.decode() for m in SMELLS if m in raw})
        if left:
            dirty.append((f.relative_to(ROOT).as_posix(), left))
    if dirty:
        raise SystemExit(
            "REFUSING: audio in this repository still carries what its recorder wrote\n"
            "into it — the device, the OS build, the exact second, sometimes a UUID:\n  "
            + "\n  ".join(f"{name}  ({', '.join(bits)})" for name, bits in dirty)
            + "\n\nStrip each one before it goes anywhere public:\n\n"
            "  ffmpeg -i in.m4a -map_metadata -1 -fflags +bitexact -c copy out.m4a\n\n"
            "It re-muxes rather than re-encodes, so the audio is untouched — compare the\n"
            "duration before and after. A photograph is refused for its EXIF one room\n"
            "over; a voice gets the same rule."
        )


def main():
    sweep_all_audio()
    sounds = json.loads(DATA.read_text())["sounds"]
    credits, seen_id, seen_tile = [], set(), set()
    page_src = PAGE.read_text()

    for s in sounds:
      build(s, credits, seen_id, seen_tile)

    # A marker pair with no sound behind it renders an empty gap where a tile
    # was -- five tiles and a hole. Withdrawal is deletion, and deletion has to
    # include the markers, so this says so rather than quietly building nothing.
    ids = {s["id"] for s in sounds}
    for orphan in sorted(set(re.findall(r"<!-- yurt-sound:([a-z0-9-]+):begin -->", page_src)) - ids):
        raise SystemExit(
            f"REFUSING: faery-yurt.html has markers for {orphan!r} and data/yurt-sound.json\n"
            "has no sound by that name. If the recording was withdrawn, take the markers\n"
            "out too — otherwise the nook renders five tiles and a hole where one was."
        )

    splice(NOTES, "yurt-sound", "\n".join(credits))
    print(f"yurt sounds: {len(sounds)} tiles wired, {len(credits)} credits written")


def build(s, credits, seen_id, seen_tile):
    if s["id"] in seen_id:
        raise SystemExit(f"REFUSING: two sounds share the id {s['id']!r}.")
    seen_id.add(s["id"])
    # Two sounds on one tile is one press with two possible outcomes, and the
    # label can only promise one of them. make-readings.py refuses the same
    # collision for the same reason.
    if s.get("tile") in seen_tile:
        raise SystemExit(
            f"REFUSING: two sounds both claim the tile {s.get('tile')!r}. One tile is one\n"
            "button, and its label says what happens when you press it — it cannot say two."
        )
    seen_tile.add(s.get("tile"))

    for field, why in (("who", "whose voice it is, named the way they asked"),
                       ("consent_on", "the date they agreed"),
                       ("tile", "which of Helen's six tiles it belongs to"),
                       ("said", "what is actually said, for anybody who will not hear it"),
                       ("icon", "the drawing on the tile, so it still looks like Helen's")):
        if not str(s.get(field, "")).strip():
            raise SystemExit(
                f"REFUSING: sound {s.get('id', '?')!r} has no {field!r} — {why}.\n"
                "A voice identifies a person as surely as a face does. Enid's wall would\n"
                "refuse a photograph on these grounds and this is the same question."
            )

    f = ROOT / s["file"]
    if not f.exists():
        raise SystemExit(
            f"REFUSING: {s['file']} is in the data and not on disk.\n"
            "If the recording was withdrawn, delete the entry too — withdrawal is\n"
            "deletion, and the tile goes back to being a tile."
        )

    raw = f.read_bytes()
    left = sorted({m.decode() for m in SMELLS if m in raw})
    if left:
        raise SystemExit(
            f"REFUSING: {f.name} still carries what its recorder wrote into it "
            f"({', '.join(left)}).\nThat is the device, the OS build and the exact second "
            "it was made. Strip it:\n\n"
            "  ffmpeg -i in.m4a -map_metadata -1 -fflags +bitexact -c copy out.m4a\n\n"
            "It re-muxes rather than re-encodes, so the audio is untouched — check the\n"
            "duration before and after if you want to be sure."
        )

    secs = duration_seconds(f)
    if secs <= 0:
        raise SystemExit(f"REFUSING: {f.name} reports a runtime of {secs}s.")
    runtime = say_runtime(secs)

    # The tile. A real <button>, because it does something -- the other five are
    # <li> text and stay that way. The accessible name carries what the visible
    # marker cannot fit, so a keyboard visitor is told MORE than a mouse one
    # rather than less, which is usually the wrong way round on an easter egg.
    label = (f"{s['tile']} — press for a sound, {runtime}")
    tile = (
        f'        <li class="nook__egg"><button type="button" class="egg" '
        f'data-src="{html.escape(s["file"], quote=True)}" '
        f'data-said="{html.escape(s["said"] + " — that was " + s["who"] + ".", quote=True)}" '
        f'aria-label="{html.escape(label, quote=True)}">\n'
        f'          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">'
        f'{s["icon"]}</svg>\n'
        f'          <span class="egg__label">{html.escape(s["tile"])}</span>\n'
        f'          <span class="egg__mark" aria-hidden="true">&#9834; {html.escape(runtime.split()[0])}s</span>\n'
        f'        </button></li>'
    )
    # NO LIVE REGION PER TILE. It used to emit one inside every tile's marker
    # block, so the page carried seven elements with id="yurt-says" -- invalid,
    # and getElementById in love.js only ever reached the first, leaving six
    # pieces of dead markup that never received a word. The room has ONE, in the
    # page outside these markers, which is where a shared live region belongs.
    # Found 2026-09-20 by the duplicate-id sweep that check-ids.py now runs.
    splice(PAGE, f"yurt-sound:{s['id']}", tile)

    credits.append(
        f'    <div><dt>&ldquo;{html.escape(s["said"])}&rdquo; &mdash; {html.escape(s["who"])}</dt><dd>'
        f'{runtime.capitalize()} behind &ldquo;{html.escape(s["tile"])}&rdquo; in '
        f'<a href="faery-yurt.html">Helen&rsquo;s regulation nook</a> &mdash; an easter egg she '
        f'and Ryan wanted in her room. Ours, recorded by us, so it keeps the site&rsquo;s '
        f'licence; a voice lent to us by anybody else would not. It is credited here as well as '
        f'hidden there, because a joke is not a reason to stop saying whose voice it is.</dd></div>'
    )
    print(f"  {f.name:<12} {secs:5.2f}s labelled {runtime!r:<12} "
          f"{s['who']}, consent {s['consent_on']}")


if __name__ == "__main__":
    main()
