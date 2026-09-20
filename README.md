# Stimpunks.Love

**One street, six rooms.** A Stimpunks Foundation site, and the loud one.

Live at **[stimpunks.love](https://stimpunks.love/)** since 2026-09-19.

> Queer without fear. Interdependent and here. Divergent and proud. Living out loud.
> Plucky pluralism, for human organisms. Becoming and belonging, with ribald songing.

## The one structural idea

**This site has no single design system, on purpose.** Every other site we run applies one
consistent look across many pages. Here the **street** is the system and the **rooms refuse to
share one** — six visual worlds that are allowed to contradict each other, joined by a front
door. That is not decoration; it is the architecture, and it is stolen wholesale from Danny the
Street, who rearranges himself for whoever needs sheltering.

Which means: **do not unify the rooms.** A pull request that harmonises the palettes or settles
on one typeface has removed the product.

## The dial

Every page carries a three-position intensity control. It reads the visitor's
`prefers-reduced-motion` for its default and then lets them **turn it up past that**, because
the visitor is the authority on their own tolerance and a media query is not.

- `gentle` — no rotation, no ambient motion, no sparkle. **Nothing is hidden at this setting.**
  A "lite" version that drops content would be a worse site wearing a politer name.
- `regular` — full colour and full type play; motion on hover and focus only.
- `max` — ambient motion as well. Nobody arrives here by default.

The default is applied by a small inline snippet in each `<head>`, **before first paint**.
Deferring it to `love.js` would flash the loud version at somebody whose device asked for the
quiet one. That snippet is byte-identical on all ten pages and its hash is in the CSP — see
`tools/make-csp.py`.

## What stays careful here

Two things, and only two. The rest of our house discipline — careful palettes, careful hedging,
the balanced tone — was dropped deliberately.

- **Attribution.** A licence, not a house style. Every song, typeface, quotation and borrowed
  name is credited in `liner-notes.html`, and the credits are loud rather than hidden.
- **Contrast.** Clashing is not the same as illegible. `tools/check-contrast.py` holds 66 pairs
  to WCAG 1.4.3 and **found two real failures on the first run**, which is the argument for
  having it.

## Layout

```
index.html            The Stoop — the front door and the six shopfronts
pink-pony-club.html   The dancefloor. Ten press-to-play facades
zine-table.html       Riot grrrl xerox. The table itself, and issue #1
zine-issue-2.html     Issue #2, distilled from our Neurodiversity and Gender course
hear-queer-here.html  Quantum queering — Barad, Helen Edgar, a superposition panel
enids-room.html       Colorful goth. Sticker wall wired to seven glossary entries
playhouse.html        Four toys, all real buttons, all synthesised
your-room.html        The sixth storefront: empty on purpose, terms written down
liner-notes.html      Who made this noise
changelog.html        What changed, and when. Every Stimpunks site publishes one
love.css              Shared base (§1–§4) then one self-contained world per room
love.js               The dial, the toys, the superposition panel
love-embed.js         The press-to-play facade
fonts/                12 self-hosted families + _sources.json
data/jukebox.json     The ten tracks, one source of truth for two pages
feed.xml              Generated from changelog.html; the only subscribable thing here
data/readings.json    The five spoken passages; a player appears when its audio does
audio/                Recorded passages. Empty until somebody reads one
data/polaroids.json   The wall's consent record. Empty, and that is the default state
photos/               Community photographs. Does not exist until somebody sends one
data/chairy.json      Chairy's 28 sayings, each with the page it came from
tools/                Eight generators and three checkers, below
```

**The HTML is hand-authored and committed** — it is the artifact, not a build output. Only eight
things are generated, and each has a tool:

```bash
python3 tools/make-jukebox.py      # the track list in pink-pony-club.html
python3 tools/make-liner-notes.py  # the same tracks as credits in liner-notes.html
python3 tools/make-sitemap.py      # sitemap.xml and llms.txt, from the pages' own heads
python3 tools/make-csp.py          # the script hash in _headers
python3 tools/make-feed.py         # feed.xml, from changelog.html's own entries
python3 tools/make-readings.py     # the audio room, from data/readings.json
python3 tools/make-polaroids.py    # Enid's wall, from data/polaroids.json
python3 tools/make-chairy.py       # what Chairy says, from data/chairy.json
python3 tools/check-contrast.py    # 66 pairs against WCAG; exits 1 on a failure
python3 tools/check-print.py       # renders each zine page to PDF; exits 1 if it is not one sheet
```

One more, deliberately **outside** that sequence because it is the only tool that needs the
network — a checker that fails on a train either blocks a deploy or teaches everyone to skip it:

```bash
python3 tools/check-jukebox.py     # presses nothing, but asks YouTube whether all ten still play
```

Run all ten before a deploy. They **refuse** rather than guess: `make-sitemap.py` stops if a page
is missing a canonical or if an HTML file exists that is not in its page order, `make-csp.py`
stops if the inline snippet has drifted between pages — because a stale hash does not warn, it
silently breaks the dial for everyone — `make-feed.py` stops if a changelog entry has no stable
anchor to serve as its permalink, `make-readings.py` stops if two passages claim the same
superposition-panel button, `make-polaroids.py` stops if a photograph has no alt text, no
named subject, no consent date, or any EXIF left on it, `make-chairy.py` stops if a saying has
no source page or contains the pipe that separates them, and `check-print.py` stops if it cannot find a Chrome to
render with, rather than passing a claim it did not test.

`check-print.py` is the only tool that needs anything *installed*: a Chrome or Chromium, which it
drives headless to produce a real PDF and count the sheets. Point it elsewhere with
`CHECK_PRINT_BROWSER=/path/to/chrome`. It checks both halves of the room's claim: one sheet, and
"in black and white", the latter by reading the inks out of the PDF against an allowlist. Borders
keep their own colour — the reset covers backgrounds, text and shadows — which is why the two
near-neutral border tints are on that list.

## Serving it locally

```bash
npx -y serve . -l 8919
```

Or start it from `.claude/launch.json`, which is tracked here for the same reason it is in
every sibling repo. There is no build step; the only thing to install is a Chrome for
`check-print.py`.

## Attribution

Text, markup and design are [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
The typefaces keep their own SIL Open Font License; the songs keep their own copyright and
**nothing musical is hosted here**. See `LICENSE` and `liner-notes.html`.
