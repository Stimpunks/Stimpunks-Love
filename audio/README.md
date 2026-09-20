# audio/

Recorded passages for the audio room in `hear-queer-here.html`. **Empty on purpose** until
somebody reads one — the page shows the words and a visibly empty slot either way.

Drop an mp3 in here with the matching name and run `python3 tools/make-readings.py`. The
player appears on its own; nothing else needs editing. The words live in
`data/readings.json`, which is the source of truth for both the text and the filename.

| File | Passage | Panel |
|---|---|---|
| `what-monotropism-is.mp3` | What monotropism is | — |
| `the-a-side.mp3` | The A side: what the instrument reports | panel a |
| `the-b-side.mp3` | The B side: the same wall | panel b |
| `both-are-measurements.mp3` | Both are measurements | panel open |
| `a-love-language.mp3` | A love language | — |

Reader: Ryan Boren.

**Re-recording:** give it a new filename and change the `id` in `data/readings.json` rather
than overwriting quietly. `_headers` caches this directory for a year, on the understanding
that a file here does not change once it exists.

**Nothing autoplays.** The player is `preload="none"`, so it makes no request until somebody
presses it — the same consent model as the jukebox, one room over.
