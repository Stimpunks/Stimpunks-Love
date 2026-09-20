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

**Nothing autoplays.** The player is `preload="none"`, so it makes no request until somebody
presses it — the same consent model as the jukebox, one room over.
