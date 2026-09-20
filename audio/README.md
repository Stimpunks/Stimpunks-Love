# audio/

Recorded passages for the audio room in `hear-queer-here.html`. The page shows the words
whether or not a recording exists, so a missing one costs a reader nothing but the voice.

Drop a file in here named for its passage and run `python3 tools/make-readings.py`. The
player appears on its own; nothing else needs editing. **Any common format works** — `.m4a`
(what a Mac records by default), `.mp3`, `.opus`, `.ogg`, `.wav`, `.aac`, `.flac` — so use
whatever your recorder gives you rather than transcoding for our benefit.

| Name | Passage | Panel |
|---|---|---|
| `what-monotropism-is` | What monotropism is | — |
| `the-a-side` | The A side: what the instrument reports | panel a |
| `the-b-side` | The B side: the same wall | panel b |
| `both-are-measurements` | Both are measurements | panel open |
| `a-love-language` | A love language | — |

Reader: Ryan Boren.

**Re-recording:** give it a new filename and change the `id` in `data/readings.json` rather
than overwriting quietly. `_headers` caches this directory for a year, on the understanding
that a file here does not change once it exists.

**Strip the metadata first.** A recorder writes its device, its OS build and the exact
second into the file. Voice Memos does, and the first six recordings here all carried it
before anybody looked. `make-readings.py` and `make-yells.py` both refuse a file that still
has any:

```bash
ffmpeg -i in.m4a -map_metadata -1 -fflags +bitexact -c copy out.m4a
```

It re-muxes rather than re-encodes, so the audio is untouched — verified by duration before
and after.

**Yells** live in `audio/yells/` and belong to `data/yells.json`, not to a passage. They need
a name and a consent date, the same as a photograph on Enid's wall.

**The yurt's sounds** live in `audio/yurt/` and belong to `data/yurt-sound.json`. All six tiles
in the Faery Yurt's regulation nook are buttons, and each plays a couple of seconds of
somebody making a noise about what is on the tile. Built by `tools/make-yurt-sound.py`, which
writes the tiles AND their credits in `liner-notes.html` — the same one-data-file-two-surfaces
contract `make-yells.py` has. Each needs a name and a consent date like the other two kinds, and
each **runtime is measured out of the file** rather than trusted from the data, because the
label says how long before you press and a hand-kept duration is a label that goes quietly
wrong. One marker pair per tile in `faery-yurt.html` rather than one block around the
list, so a tile whose recording is withdrawn goes back to being Helen's own markup without a
rewrite of the other five.

**And that tool sweeps all of `audio/`, not just its own files.** Three tools each guarding the
files their own data named left a hole between them, and recordings sat in `audio/` for an
afternoon carrying the iPad, the OS build, a timestamp to the second and a voice-memo UUID —
one `git add -A` from being permanent in a public repository. It refuses rather than strips:
what to do with somebody's recording is theirs to decide.

**The yurt's sound** lives in `audio/yurt/` and belongs to `data/yurt-sound.json`. One file,
behind one tile in the Faery Yurt's regulation nook, built by `tools/make-yurt-sound.py` — which
writes the tile AND the credit in `liner-notes.html`, the same one-data-file-two-surfaces
contract `make-yells.py` has. It needs a name and a consent date like the other two, and it
**measures the runtime out of the file** rather than trusting a number in the data, because the
label says how long before you press it and a hand-kept duration is a label that goes quietly
wrong. This was the gap the third kind of audio opened: passages and yells each had a tool
refusing stray recorder metadata, and a sound belonging to neither had nothing watching it.

**Nothing autoplays.** The player is `preload="none"`, so it makes no request until somebody
presses it — the same consent model as the jukebox, one room over.
