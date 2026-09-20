# CLAUDE.md — Stimpunks.Love

Guidance for Claude Code working in this repository. `README.md` covers what the site is and
how to run the tools; this file covers the things a session gets wrong.

## The rule that matters most: do not tidy this site

**There is no single design system here and there must not become one.** Six rooms, six
unrelated visual worlds, joined by a street. The instinct to harmonise — one type scale, one
palette, shared component classes across rooms — is the correct instinct on every other
Stimpunks site and is **destructive here**. `love.css` is deliberately a small shared base
(§1–§4) followed by six sections that duplicate each other's ideas in different clothes. That
duplication is the product.

If a change would make two rooms look more alike, it is probably wrong. Ask first.

## What this site is FOR, so you know what you are protecting

Ryan's brief, 2026-09-19: *"All of our sites are so careful. Careful color palettes, careful
fact checking, careful sourcing, careful attribution. I wanna get wild and wacky and loose."*

Three of those four were dropped. **Attribution was not**, and the reasoning is written into
the site itself on `zine-table.html`: attribution is a licence rather than a house style, it is
the cheapest thing on the page, and it is the only one of our habits whose absence is a legal
problem rather than an aesthetic one. So the credits got **louder** instead of going away —
scrawled in the margins, collected in `liner-notes.html`.

**Contrast survived too**, and for a reason that is not the obvious one. This is a Disabled
people's organisation. A glitter-maximalist site that overwhelms or excludes the people it is
for would be a self-own of exactly the kind we exist to name. The fix was never to tone it
down: it was the dial, which makes loudness a thing the visitor holds rather than a property of
the page. **Access is the premise of this design, not the brake on it.** Any change that makes
the site louder at the expense of the dial has inverted the whole argument.

## The three claims this site makes that can be checked — check them

Each of these is stated in the site's own copy, which means a regression turns a design
decision into a false statement on a published page.

1. **"Nothing plays until you press play."** Verified on 2026-09-19 in a browser: zero iframes
   and zero requests to youtube on load; one iframe after one press; the other nine facades
   untouched. If you touch `love-embed.js`, re-check it in the network panel rather than
   reasoning about it. **The audio room's sequence control is the one place where one press
   starts several files**, which is still consented playback because the visitor asked for the
   sequence — but only as long as the label says how many passages and how long *before* the
   press. If you change that control, the label is the part that keeps the claim true. The
   superposition buttons themselves still make no sound at all: collapsing is a measurement,
   not a play.
2. **"Clashing is not the same as illegible."** `tools/check-contrast.py`, 66 pairs. It found
   two real failures the first time it ran — white body copy on the Playhouse blue at 4.17, and
   the word clock's copy on violet at 3.36 — both of which would have shipped. **Add a pair to
   that file whenever you add a colour to a room.** A checker that does not know about the new
   colour passes silently, which is worse than no checker.
3. **"Gentle takes away the wobble, never the words."** There is no content behind an intensity
   level. Do not add any.

## The tools refuse rather than guess, and that is deliberate

`check-print.py` renders every `room-zine` page to a PDF and fails if it is not one sheet, or if an
ink reaches the paper that is not on its allowlist. **Both halves of that room's claim were false.**
"Prints to one sheet" was three sheets at launch, and adding one paragraph has put it back over the
limit twice since. "In black and white" was false too: the print rules reset backgrounds on a *list
of components*, so the ransom note printed in full colour and `.pullquote` kept a near-black ground
while its text was forced to `#000` — 1.14:1, invisible. **Add an ink to that list only after
deciding it survives a photocopier**, never to make the tool quiet.

`make-yells.py` builds the yell button's recordings and **rewrites the house rule to match**: the
Playhouse says the noises are synthesised and not fetched, which stops being true the moment a
recording lands, so the sentence is generated from the same data as the button rather than left
for somebody to remember. **Both audio tools refuse a file carrying recorder metadata** — Voice
Memos writes the device, the OS build and the exact second, and the first six recordings here all
carried it before anybody looked. A photograph is refused for its EXIF one room over; a voice gets
the same rule. Strip with `ffmpeg -i in.m4a -map_metadata -1 -fflags +bitexact -c copy out.m4a`.

`make-chairy.py` builds what Chairy says from `data/chairy.json`, where **every saying carries the page
it came from**, read out of the Knowledge System mirror's own frontmatter rather than typed. Two of the
28 are **not ours and say so when Chairy speaks them**: "Nothing About Us Without Us" is a motto of the
self-advocacy movement, and "Design for Real Life" is Meyer and Wachter-Boettcher's book. A talking
chair passing a movement slogan off as a house line is the exact failure this site argues against.

`make-polaroids.py` builds Enid's wall and **enforces the promises on `polaroids.html` rather
than trusting them**: no alt text, no named subject, no consent date, or any EXIF still on the
file, and it refuses. The photographs are **excluded from the site's CC BY-SA licence** and that
exclusion is load-bearing — CC BY-SA cannot be revoked, so a photo published under it could not
be taken back after somebody withdrew, and "it comes down when you say so" would be a promise
the licence contradicted. Withdrawal is deletion, not a hidden flag. **We do not publish
photographs of children.**

`make-readings.py` builds the audio room from `data/readings.json` and prints every passage as
text whether or not its recording exists — the words are the room, and an argument you can only
follow by hearing it is an audio-only requirement. **Do not lift readings from the glossary**: that
entry is mostly curation, and its explanation belongs to Murray, Lawson and Lesser, to the
questionnaire's authors, and to Helen Edgar. The passages here were written for this room so that
nothing recorded is anyone else's to clear.

`make-feed.py` stops if a changelog `<h2>` has no id, because that id is the feed item's permalink
and a feed whose guids move republishes every old entry into somebody's reader as if it were new.
`make-sitemap.py` stops if an HTML file exists that is not in its page order — so a new room
cannot be published unlisted. `make-csp.py` stops if the pre-paint snippet has drifted between
pages, because **a stale CSP hash does not warn**: the browser silently refuses the snippet and
every reader who asked for Gentle gets flashed the loud version instead. That is precisely the
failure the dial exists to prevent, arriving through the security header.

`check-jukebox.py` asks YouTube whether all ten tracks still play, and is the one tool kept out
of the pre-deploy sequence because it needs the network. **Two obvious ways to test this do not
work** and were each ruled out the hard way: oEmbed returns 200 with the right title for a dead
video, and loading `youtube.com/embed/<id>` gives Error 153 for every video including working
ones. The watch page's `playabilityStatus` is the only thing that tells them apart.

When a tool refuses, fix the cause. Do not loosen the tool.

## Where the content came from, so you do not re-derive it wrongly

- **The ten tracks** in `data/jukebox.json` were extracted from the embeds on our own published
  [Double Rainbow](https://stimpunks.org/philosophy/were-a-double-rainbow-all-the-way/) page.
  The mirror stores rendered content and does **not** say which artist goes with which video id
  — the titles and channels were resolved against YouTube's oEmbed endpoint. **Do not guess a
  mapping**; that is the exact fabrication this site spends a page arguing against.
- **Glossary links** (Enid's sticker wall, the secret word, the word clock) were each checked
  against `site/stimpunks.org/glossary/` in the Knowledge System mirror before being written.
  Four candidates were dropped because the term does not exist: `disability`, `plurality`,
  `autistic-burnout`, `aac`. On stimpunks.org **a 301 is a failure, not a pass** — core's
  `redirect_guess_404_permalink()` will happily deliver a reader to the wrong page — so check
  the mirror, never a live fetch that follows redirects.
- **The quotations** are Barad, Helen Edgar and one line of our own. Helen's writing is credited
  to her by name and never folded into our "we"; she is a colleague, not a corpus.

## Its relatives

Six sibling sites, each in its own repository under `~/Documents/GitHub/`: Star Stuff, Queering
Earth, Cavendish Cards, Penguin Pebbling, Monotropic Map, Why Sheets. `_headers` here is adapted
from queering.earth's, which is the house reference and much longer; where a decision is the
same, the reasoning there is the reasoning here.

**Every one of our sites publishes a changelog** (Ryan's rule, 2026-09-15), and `changelog.html`
is this one's. The Knowledge System's `update-logs` skill watches the sibling repos' git logs so
a day of work here does not vanish — **adding this site to that rotation takes four edits**, not
one: the `REPOS` dict in `update_logs.py`, the scope table in `update-logs/SKILL.md`, the
scheduled task prompt in `.claude/scheduled-tasks/update-logs-daily/SKILL.md`, and the project
`CLAUDE.md`. A prompt that contradicts its own skill is worse than no prompt.
