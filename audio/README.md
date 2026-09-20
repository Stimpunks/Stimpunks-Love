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

**Nothing autoplays.** The player is `preload="none"`, so it makes no request until somebody
presses it — the same consent model as the jukebox, one room over.
