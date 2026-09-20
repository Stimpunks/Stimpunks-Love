# Stimpunks.Love

**One street, six rooms, one subroom.** A Stimpunks Foundation site, and the loud one.

Live at **[stimpunks.love](https://stimpunks.love/)** since 2026-09-19.

> Queer without fear. Interdependent and here. Divergent and proud. Living out loud.
> Plucky pluralism, for human organisms. Becoming and belonging, with ribald songing.

## The one structural idea

**This site has no single design system, on purpose.** Every other site we run applies one
consistent look across many pages. Here the **street** is the system and the **rooms refuse to
share one** — six visual worlds, plus a seventh behind one of them, all allowed to contradict
each other and joined by a front door. That is not decoration; it is the architecture, and it is stolen wholesale from Danny the
Street, who rearranges himself for whoever needs sheltering.

Which means: **do not unify the rooms.** A pull request that harmonises the palettes or settles
on one typeface has removed the product. **A subroom is not an exception.** The Chappell is
reached through Pink Pony Club and shares nothing with it, because "it is only a subroom" is the
most reasonable-sounding excuse the tidying instinct has ever been handed.

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
quiet one. That snippet is byte-identical on all twelve pages and its hash is in the CSP — see
`tools/make-csp.py`.

## What stays careful here

Two things, and only two. The rest of our house discipline — careful palettes, careful hedging,
the balanced tone — was dropped deliberately.

- **Attribution.** A licence, not a house style. Every song, typeface, quotation and borrowed
  name is credited in `liner-notes.html`, and the credits are loud rather than hidden.
- **Contrast.** Clashing is not the same as illegible. `tools/check-contrast.py` holds 87 pairs
  to WCAG 1.4.3 and **found two real failures on the first run**, which is the argument for
  having it. It is still finding them: writing the share cards meant naming the grounds the
  ambient glows actually make, and two rooms turned out to be putting text on a background
  nobody had measured.

## Layout

```
index.html            The Stoop — the front door and the six shopfronts
pink-pony-club.html   The dancefloor. Ten press-to-play facades
the-chappell.html     Rhinestone Vatican. A subroom off the dancefloor; thirteen more
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
data/chappell.json    The thirteen in The Chappell. A separate file for separate provenance
feed.xml              Generated from changelog.html; the only subscribable thing here
data/readings.json    The five spoken passages; a player appears when its audio does
audio/                Recorded passages. Empty until somebody reads one
data/polaroids.json   The wall's consent record. Empty, and that is the default state
photos/               Community photographs. Does not exist until somebody sends one
data/chairy.json      Chairy's 28 sayings, each with the page it came from
data/yells.json       Recorded yells, and who agreed to lend their voice
og/                   One share card per page — eight card designs for twelve pages
tools/                Eleven generators and three checkers, below
```

**The HTML is hand-authored and committed** — it is the artifact, not a build output. Only eleven
things are generated, and each has a tool:

```bash
python3 tools/make-jukebox.py      # the track list in pink-pony-club.html
python3 tools/make-liner-notes.py  # the same tracks as credits in liner-notes.html
python3 tools/make-chappell.py     # The Chappell's arcade, and its credits with it
python3 tools/make-sitemap.py      # sitemap.xml and llms.txt, from the pages' own heads
python3 tools/make-csp.py          # the script hash in _headers
python3 tools/make-feed.py         # feed.xml, from changelog.html's own entries
python3 tools/make-readings.py     # the audio room, from data/readings.json
python3 tools/make-polaroids.py    # Enid's wall, from data/polaroids.json
python3 tools/make-chairy.py       # what Chairy says, from data/chairy.json
python3 tools/make-yells.py        # the yell button's recordings, from data/yells.json
python3 tools/make-og.py           # the share cards, and the og:image tags that point at them
python3 tools/check-contrast.py    # 87 pairs against WCAG; exits 1 on a failure
python3 tools/check-print.py       # renders each zine page to PDF; exits 1 if it is not one sheet
```

One more, deliberately **outside** that sequence because it is the only tool that needs the
network — a checker that fails on a train either blocks a deploy or teaches everyone to skip it:

```bash
python3 tools/check-jukebox.py     # presses nothing; asks YouTube whether all 23 still play
```

Run all thirteen before a deploy. They **refuse** rather than guess: `make-sitemap.py` stops if a page
is missing a canonical or if an HTML file exists that is not in its page order, `make-csp.py`
stops if the inline snippet has drifted between pages — because a stale hash does not warn, it
silently breaks the dial for everyone — `make-feed.py` stops if a changelog entry has no stable
anchor to serve as its permalink, `make-readings.py` stops if two passages claim the same
superposition-panel button, `make-polaroids.py` stops if a photograph has no alt text, no
named subject, no consent date, or any EXIF left on it, `make-chairy.py` stops if a saying has
no source page or contains the pipe that separates them, `make-yells.py` stops if a yell has
no name on it, `make-chappell.py` stops on an id that is not a YouTube id — which love-embed.js
declines silently, so the failure is a button that never becomes a video and says nothing about
it — or on a track with no runtime, because the label promising one before the press is that
room's own claim, both audio tools stop on a recording that still carries the device and timestamp
its recorder wrote into it, and `make-og.py` stops on a page whose room it has no card for —
rather than handing a new room somebody else's face in the one asset nobody looks at.
`check-print.py` stops if it cannot find a Chrome to render with, rather than passing a claim
it did not test.

Two tools need something *installed* — a Chrome or Chromium, which both drive headless. Point
them elsewhere with `CHECK_PRINT_BROWSER=` and `MAKE_OG_BROWSER=`.

`check-print.py` renders a real PDF and checks both halves of the zine room's claim: one sheet,
and "in black and white", the latter by reading the inks out of the PDF against an allowlist.
Borders keep their own colour — the reset covers backgrounds, text and shadows — which is why
the two near-neutral border tints are on that list.

`make-og.py` renders each share card and reads the layout back out of the same run, so "it fits
in 1200×630" is measured rather than eyeballed once and assumed forever. A longer title is
enough to push a word off the edge, and the crop lands in somebody else's timeline.

## The share cards

A pasted link gets unfurled into a card, and for most people that card is the only part of the
street they ever see. **There is no card template.** There are eight, one per room, and they
contradict each other exactly as `love.css` §5–§12 do — the street's collides six typefaces,
the zine's is a ransom note, the quantum room's is a mono face over interference fringes, The
Chappell's is gold neon under a rose window, the plain rooms get a quiet one. One template would
be the harmonising instinct arriving in the one asset nobody reviews, because nobody sees it in
the repo — and the subroom got a card of its own for the same reason, in the one place where
borrowing its parent's would have looked most defensible.

Each card is a scrap of markup on **the page's own body class with `love.css` attached**, so a
room's card cannot drift from the room, and the h1 is lifted from the page verbatim — which is
how the zine keeps its per-word ransom spans and the street keeps its two-part wordmark.

**Every card has alt text and the tool will not write an `og:image` without one.** Text baked
into an image is text nobody can hear, on a site that exists to say so.

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
