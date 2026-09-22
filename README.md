# Stimpunks.Love

**One street, no two rooms alike, rooms behind rooms, and a campground past the treeline.** A Stimpunks
Foundation site, and the loud one.

Live at **[stimpunks.love](https://stimpunks.love/)** since 2026-09-19.

> Queer without fear. Interdependent and here. Divergent and proud. Living out loud.
> Plucky pluralism, for human organisms. Becoming and belonging, with ribald songing.

## The one structural idea

**This site has no single design system, on purpose.** Every other site we run applies one
consistent look across many pages. Here the **street** is the system and the **rooms refuse to
share one** — a visual world per room, more of them behind doors at the back of rooms, and more
again off the end of the street, all allowed to contradict each other and joined by a front door. That is not decoration; it is the architecture, and it is stolen wholesale from
[Danny the Street](danny-the-street.html), who turns up wherever somebody needs shelter and
rearranges what is on them to suit whoever has arrived. **Danny is DC Comics' and the credit
is a page of its own now** — it used to live only in a scrolling marquee that is
`aria-hidden`, which meant the one place this site named what it had taken was unreachable
by a screen reader.

Which means: **do not unify the rooms.** A pull request that harmonises the palettes or settles
on one typeface has removed the product. **A subroom is not an exception, and neither is an
area.** The Chappell is reached through Pink Pony Club and shares nothing with it; the Faery
Yurt is the first thing in the campgrounds and shares nothing with the field it stands on. "It
is only a subroom" and "an area should look like an area" are the two most reasonable-sounding
excuses the tidying instinct has ever been handed.

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
quiet one. That snippet is byte-identical on every page and its hash is in the CSP — see
`tools/make-csp.py`.

## What stays careful here

Two things, and only two. The rest of our house discipline — careful palettes, careful hedging,
the balanced tone — was dropped deliberately.

- **Attribution.** A licence, not a house style. Every song, typeface, quotation and borrowed
  name is credited in `liner-notes.html`, and the credits are loud rather than hidden.
- **The dial.** Loudness is a thing the visitor holds, not a property of the page — so
  `tools/check-gentle.py` loads every page at all three settings and measures what
  actually moves. The global reset is safe (`!important`); the tilts are not, because each room
  resets its own and a reset is one selector away from being outranked, silently. **It found the
  Faery Yurt's windowsill on its first run** — a book and a pen still rotating at Gentle, in a
  room a day old that two people had read.
- **Contrast.** Clashing is not the same as illegible. `tools/check-contrast.py` holds a pair for
  every text-and-ground combination on the street, each against WCAG 1.4.3, and **found two real
  failures on the first run**, which is the argument for
  having it. It is still finding them: writing the share cards meant naming the grounds the
  ambient glows actually make, and two rooms turned out to be putting text on a background
  nobody had measured. It caught two more in the Faery Yurt before that room shipped — the grey
  under five different labels, and one book spine — which is the whole reason a room designed
  by somebody outside this repo can be taken almost exactly as sent.

## Layout

```
index.html            The Stoop — the front door and the shopfronts
danny-the-street.html The road from above, under one sodium lamp. Where the name came from
pink-pony-club.html   The dancefloor. Ten press-to-play facades
club-chronic.html     Club Chronic. Punk community, a wall of playlists, a rack of records
the-chappell.html     Rhinestone Vatican. A subroom off the dancefloor; thirteen more
zine-table.html       Riot grrrl xerox. The table itself, and issue #1
zine-issue-2.html     Issue #2, distilled from our Neurodiversity and Gender course
hear-queer-here.html  Quantum queering — Barad, Helen Edgar, a superposition panel
enids-room.html       Colorful goth. Sticker wall wired to seven glossary entries
playhouse.html        Four toys, all real buttons, all synthesised
arcade.html           The Arcade's floor: cabinets standing there, walk up to one
quill-drift.html      Esmx gathers drifting quills. Contact is the only verb it has
otterly-adorbs.html   An otter, a kelp bay, and floating that fills nothing up
penguin-pebbling.html A shore, some pebbles, and neighbours with nests. Nothing counted
latibulum.html        A burrow under the hill. A wireless, a tube television, a lamp
jungle-room.html      A viewing room under a canopy. Nature live cams, none with a runtime
the-den.html          Behind it: Graceland's Jungle Room, and the records cut in it
the-mopery.html       A cold library. Books to borrow, one song many ways, Poe with Doré
oracle-deck.html      Behind it: thirteen engravings, and a question on the back of each
the-doomscroll.html   And behind it: public domain doom as a feed, on an actual scroll
adventurers-guild.html  A job board in a manila room. The one tidy room on this street
the-feed.html         A dark concourse of arrival boards, one wire per site, off their feeds
zibaldone.html        A commonplace book open on a desk. Short quotations, each naming its printing
rabbit-hole.html      Not a room: a shaft. Rabbit holing, seven presses, six 1865 engravings
healing-checkpoint.html  Room 429. A save room lit from the floor. Rest, and a bed with no terms on it
your-room.html        The storefront with nothing in it: empty on purpose, terms written down
the-garden.html       The knowledge garden. One bed per site we publish, each linking out
campgrounds.html      The field past the treeline. Marker posts, no ambient layer, ever
faery-yurt.html       Pitch 01. Helen Edgar's candlelit yurt; her design, not ours
solarpunk-hermitage.html  Pitch 03. A cabin on wheels, and the one room the sun is up in
liner-notes.html      Who made this noise
changelog.html        What changed, and when. Every Stimpunks site publishes one
love.css              Shared base (§1–§4) then one self-contained world per room (§5 on)
love.js               The dial, the toys, the superposition panel
love-embed.js         The press-to-play facade
arcade.js             Quill Drift. Loaded by its own page only; nothing before the coin
otterly.js            Otterly Adorbs. The same, for the cabinet next to it
pebbling.js           Penguin Pebbling. Built on the locution, not on the card game
mopery.js             The shelves' popups, the Raven's font picker, the parlour screen
oracle.js             The draw. Moves a copy of a card that is already on the page
doomscroll.js         Opens a poem that is already on the page. Nothing is fetched
fonts/                Self-hosted families, one per voice a room insisted on + _sources.json
data/jukebox.json     The ten tracks, one source of truth for two pages
data/chappell.json    The thirteen in The Chappell. A separate file for separate provenance
feed.xml              Generated from changelog.html; the only subscribable thing here
data/readings.json    The five spoken passages; a player appears when its audio does
audio/                Recorded passages. Empty until somebody reads one
data/polaroids.json   The consent record for every photograph on the site, wall or not
photos/               Community photographs. Does not exist until somebody sends one
data/chairy.json      Chairy's 28 sayings, each with the page it came from
data/yells.json       Recorded yells, and who agreed to lend their voice
data/yurt-sound.json  The six sounds in the Faery Yurt, and whose voice they are
data/latibulum.json   The burrow's wireless and its television. A third provenance
data/jungle.json      The nature cams, in our own events page's groups and order
data/den.json         The Jungle Room sessions, 1976. A discography, not a list of ours
data/hermitage.json   The cave's books and the campfire's documentaries. Two provenances
data/club.json        Club Chronic's rack, stage and paste-up. The selection is Star Stuff's
data/mopery.json      The Mopery's shelves, its screen, and The Raven with Doré's plates
data/oracle.json      The deck. Thirteen Met open-access engravings, and our questions
data/doomscroll.json  Thirteen poems, newest first, each naming the printing it came from
data/quests.json      Every job on the board, and the marker it sends you to
data/garden.json      What grows on each site. The roster is read out of arrivals.json
data/zibaldone.json   The quote bank. Every line names its printing and how it was checked
data/rabbit-hole.json The shaft's presses, its engravings and its trail. No lyrics, refused
data/checkpoint.json  Room 429's quotations, its Retry-After slips and its way out
quest.js              The job markers, and the guild's board. Works with scripts off
zibaldone.js          The attribution slip. Composes a block of text; sends nothing anywhere
checkpoint.js         Room 429's copy buttons, which ship hidden. The slips work without it
raven/                Doré's 1884 engravings and three leaves of an 1865 printing
alice/                Six of Tenniel's 1865 wood engravings. Public domain, scans credited
oracle/               The deck's plates. Public domain, CC0, from one collection
og/                   One share card per page, and one card design per room
tools/                The generators and the checkers, below
```

**The HTML is hand-authored and committed** — it is the artifact, not a build output. A short
list of things is generated, and each of them has a tool:

```bash
python3 tools/make-jukebox.py      # the track list in pink-pony-club.html
python3 tools/make-liner-notes.py  # the same tracks as credits in liner-notes.html
python3 tools/make-chappell.py     # The Chappell's arcade, and its credits with it
python3 tools/make-sitemap.py      # sitemap.xml and llms.txt, from the pages' own heads
python3 tools/make-csp.py          # the script hash in _headers
python3 tools/make-feed.py         # feed.xml, from changelog.html's own entries
python3 tools/make-readings.py     # the audio room, from data/readings.json
python3 tools/make-polaroids.py    # Enid's wall, from data/polaroids.json
python3 tools/make-toys.py         # the Playhouse's toys, from data/toys.json
python3 tools/make-chairy.py       # what Chairy says, from data/chairy.json
python3 tools/make-yells.py        # the yell button's recordings, from data/yells.json
python3 tools/make-soundboard.py   # the Playhouse's sound board, from data/soundboard.json
python3 tools/make-yurt-sound.py   # the yurt's sounds: their tiles, and their credits
python3 tools/make-latibulum.py    # the burrow's wireless and television, and their credits
python3 tools/make-jungle.py       # the Jungle Room's viewing galleries, and their credits
python3 tools/make-den.py          # The Den's listening bench, and its credits
python3 tools/make-hermitage.py    # the Hermitage's shelves and campfire, and their credits
python3 tools/make-club.py         # Club Chronic's stage, paste-up and rack, and their credits
python3 tools/make-mopery.py       # the Mopery's shelves, its screen and its Raven nook
python3 tools/make-sweetgrass.py   # the meadow's fire, its readings and its braid
python3 tools/make-oracle.py       # the oracle deck, and its credits
python3 tools/make-doomscroll.py   # the doomscroll's feed, sorted by first publication
python3 tools/make-pebble-board.py # the Pebble Board's current edition, and its back-issue rack
python3 tools/make-guild.py        # the job board, a marker in every room, and the credits
python3 tools/make-arrivals.py     # The Feed's arrival boards; draws what pull-arrivals.py read
python3 tools/make-garden.py       # The Garden's beds and credits; roster and order from arrivals.json
python3 tools/make-zibaldone.py    # The Zibaldone's leaves and its attribution slip, and the credits
python3 tools/make-rabbit-hole.py  # The Rabbit Hole's presses, engravings and trail, and the credits
python3 tools/make-checkpoint.py   # Room 429's quotations, slips and way out, and the credits
python3 tools/make-foundry.py      # The Foundry's bench, its shelves and its proof
python3 tools/make-og.py           # the share cards, and the og:image tags that point at them
python3 tools/check-contrast.py    # every pair against WCAG; exits 1 on a failure
python3 tools/check-print.py       # renders each zine page to PDF; exits 1 if it is not one sheet
python3 tools/check-gentle.py      # every page at all three dial settings; exits 1 on a leak
python3 tools/check-contrast-live.py # every piece of text on every page, as rendered
python3 tools/check-counts.py      # refuses a sentence that says how many rooms there are
python3 tools/check-ids.py         # refuses a repeated id, and one no page actually has
python3 tools/check-classes.py     # refuses a class two rooms claim, or a page wears wrongly
python3 tools/check-quests.py      # refuses a code a room and the board disagree about
python3 tools/check-faces.py       # refuses a typeface either room about type has lost
```

`make-mopery.py` refuses a book with no way to borrow it, a cut that does not name Jagger and
Richards — eight of the nine on that screen are covers, and a wall of covers is exactly where
crediting only the voice would pass unnoticed — a spine colour the stylesheet has no rule for,
and a stanza of The Raven that is not six lines, because that poem's shape is its metre.
`make-oracle.py` refuses a card that tells a fortune: every card ends in a question mark and
none of them carries the language of prediction, because **a deck on a Disabled people's site
that told somebody how their life was going to go would be doing the thing the rest of these
pages exist to refuse** — and it would arrive as a friendly edit from somebody who thought a
question was a bit thin. It also refuses a plate whose object page is not the Metropolitan
Museum's, because one rights statement only covers one collection.
`make-doomscroll.py` refuses a poem whose author has been dead seventy years or less. That is
not a US-public-domain test, it is a **public domain everywhere** test, and it cost the scroll
its best opening item: Eliot's *The Hollow Men* is free in America and will not be in much of
Europe until the 2030s.
`make-sweetgrass.py` holds the runtime rule the ordinary way and one refusal no other tool here
has: **a chapter reading may not be a screen.** The twenty-one readings of *Braiding Sweetgrass*
in that room are an unauthorised recording of a book that is in copyright, and every one of them
plays and embeds — so nothing else would have stopped them going in beside the fire. The room's
whole argument is the honorable harvest, and a page making that argument cannot serve somebody
else's entire book off its own surface, so they are doors with a borrow link beside them. It also
refuses a talk whose channel is the readings' channel in either direction, because those ids
arrived looking identical and the channel is all that told them apart; and it **counts the
braid** — three bundles of exactly seven — because that number is an Elder's teaching rather than
a layout, which is the opposite of `check-counts.py`'s rule and for the opposite reason.

These are deliberately **outside** that sequence, because they are the ones that need the
network — a checker that fails on a train either blocks a deploy or teaches everyone to skip it:

```bash
python3 tools/check-jukebox.py     # presses nothing; asks YouTube whether every facade still plays
python3 tools/pull-arrivals.py     # reads the sibling sites' RSS feeds into data/arrivals.json
python3 tools/pull-foundry.py      # reads every typeface's own record into data/foundry-faces.json
```

And one that is **not a tool you run by hand at all**, listed here only so nobody goes looking for
it in the sequence above: `tools/daily-arrivals.sh` is the single command the **arrivals-board-daily**
scheduled task runs each morning. It pulls, redraws, gates, **commits and pushes** — so it does not
belong in a pre-deploy checklist, where it would quietly publish from whatever laptop ran it.

Run them all before a deploy. They **refuse** rather than guess: `make-sitemap.py` stops if a page
is missing a canonical or if an HTML file exists that is not in its page order, `make-csp.py`
stops if the inline snippet has drifted between pages — because a stale hash does not warn, it
silently breaks the dial for everyone — `make-feed.py` stops if a changelog entry has no stable
anchor to serve as its permalink, `make-readings.py` stops if two passages claim the same
superposition-panel button, `make-polaroids.py` stops if a photograph has no alt text, no
named subject, no consent date, or any EXIF left on it — and, since a photograph can now hang
somewhere other than Enid's wall, stops if any page publishes one the record does not mention,
so that deleting a withdrawn entry catches every page instead of one; it also stops on a CSS or
inline filter reaching a photograph, because that page promises we will not filter anybody, `make-chairy.py` stops if a saying has
no source page or contains the pipe that separates them, `make-toys.py` stops on a toy with no handler registered in `love.js`, no noise registered beside it — six of them shipped silent and in a room where the others answer out loud the quiet ones read as broken — or no fill in `love.css`, on two toys claiming one fill, on a credit that is in the data and not on the face of the tile, on an idea line pointing anywhere but our own pages, and on an HTML entity in a field that becomes a `data-` attribute — the script writes those with `textContent`, so an entity there looks correct in the data file and renders as itself in the room; it also carries Chairy's sayings and the yell button's recordings across untouched, because a generator that silently empties another generator's output is the `_headers` trap with two tools in it, `make-yells.py` stops if a yell has
no name on it, `make-soundboard.py` stops on a key whose noise is not registered in `love.js` or whose flourish has no rule and no keyframes in `love.css` — three files have to agree about every key and none of them is near the others, so a key with no voice is a button somebody presses and presses that never makes a sound — and it stops on two keys sharing a flourish, on a key that does not say what it sounds like in words, and on a mood key anywhere but the last row, `make-yurt-sound.py` stops if a recording has no name or no consent date,
stops if two sounds claim the same tile, and measures each runtime off the file rather than
trusting the data, because a label promising one before the press is the same promise the
jukebox makes, `make-chappell.py` stops on an id that is not a YouTube id — which love-embed.js
declines silently, so the failure is a button that never becomes a video and says nothing about
it — or on a track with no runtime, because the label promising one before the press is that
room's own claim, all three audio tools stop on a recording that still carries the device and timestamp
its recorder wrote into it — and `make-yurt-sound.py` sweeps **every** audio file in the repo
rather than only its own, because three tools each guarding their own patch left a hole between
them that four unstripped recordings sat in for an afternoon, and `make-og.py` stops on a page whose room it has no card for —
rather than handing a new room somebody else's face in the one asset nobody looks at — and on a
campgrounds card with no plots on it, because that card lists the field's pitches and used to list
them from a string literal typed twice, in the one file whose whole argument is that a card must
not be able to disagree with its page — and
`check-classes.py` stops on a class name claimed by two rooms' sections of `love.css`, and on a
page wearing a class another room claimed — a section header is a comment and a class name is
global, so the browser applies the winner and says nothing. It found four collisions the day it
was written and three leaks that were already here, including the Faery Yurt's tagline quietly
taking `display: flex` from the street's masthead. `check-ids.py` stops on a page that uses the same id twice, because
`getElementById` returns the first match and says nothing — it found a seven-way clash in the
Faery Yurt that had been live since the nook shipped, six of them dead markup receiving nothing.
`check-counts.py` stops on a sentence that says how many rooms, doors, worlds or share cards
there are, because **the number of storefronts is going to keep growing** and a total is a fact
that gets written in a dozen places and updated in one. The commit that opened the Arcade is the
proof: it changed the count in twelve places and still shipped three sentences carrying the old
one, in a stylesheet comment, a second stylesheet comment, and `CLAUDE.md`.
`make-arrivals.py` stops on a row carrying a summary field, because a row on that board is a
title, a date and a destination and nothing else &mdash; a departures board does not read you the
contents of the train, and that is also what keeps the page from republishing everybody else's
writing onto one surface it does not own; the friendly edit is real and it will arrive, so it is
refused rather than merely not done. It also stops on a row whose link is not on the host its wire
is named after, on a row with no date, on a wire with no feed URL or no note, and on the
vocabulary of a league table in the room's own copy &mdash; **nothing there is ranked and no
site's activity is added up**, because a board showing which of our sites had been busiest would
turn publishing into a race between our own people. The timer that keeps that board current,
`tools/daily-arrivals.sh`, commits **only** `data/arrivals.json` and `the-feed.html`, and refuses
unless the tree is on main and those two files are already clean &mdash; so it can never catch a
session mid-edit, which is the lesson `notes-backup-daily` learned the hard way in the Knowledge
System. A failed push is non-fatal and reported: the commit stays local and a session sorts it out,
because a timer that rebases unattended is a timer resolving conflicts nobody is watching.
`pull-arrivals.py` is the half that touches
the network and is kept out of the pre-deploy sequence with `check-jukebox.py` for it; it refuses
a feed that is not RSS 2.0 rather than guessing at Atom, on the grounds that a silent mis-parse
would put a half-empty board on the street and a refusal the day a sibling changes format is the
thing worth having.
`make-garden.py` **does not hold the garden's roster and neither does its data file** &mdash;
which sites exist, in what order, with what names and addresses is read out of `data/arrivals.json`,
the same list The Feed runs on, whose order is stimpunks.org's own feeds page. So a bed cannot be
invented, a site we publish cannot be quietly left out, and re-sorting the garden would mean
overruling a decision made somewhere else. It refuses a bed it has no drawing for and two beds
sharing one, which is `make-og.py`'s refusal for `make-og.py`'s reason; **a drawing whose argument
is not written out in words**, because the habits of growth are the whole point of those pictures
and a claim only sighted readers get is not a claim this site may make; a bed with nobody credited;
a count of what a site holds, because that is wrong within the week and a garden measured by volume
is an inventory; the vocabulary of ranking our own sites; **a date**, which is what would turn this
room into The Feed; and a link inside a note pointing somewhere that is neither ours nor that bed's
own site. It also **walks every coordinate of every green element and refuses one drawn below the
soil line**: `check-contrast.py` put the two greens at 1.38 and 2.14 against the earth, and because
they are only 1.55 apart from each other no brown clears 3:1 against both at once &mdash; so the
palette splits at the soil line the way a plant does, green above and pale below, and the rule is
enforced rather than remembered. It was broken on purpose first, with a stem two pixels under and a
leaf circle whose edge dipped below; it caught both.
**And the garden next door is not a back door around that roster.** Autistic Realms and More
Realms are Helen Edgar's own sites, so they cannot be beds &mdash; the only way to plant one would
have been to write it into `data/arrivals.json`, which would put it on The Feed as one of *our*
wires and claim her work as ours. They are through the ivy instead, and the two refusals now face
each other: a bed that is **not** on the roster is refused, a plot that **is** on it is refused,
and no edit to the garden's own data file moves a site across. A plot must name whose it is and
must say **what of it is already in this garden** &mdash; without that line the section is a list
of a friend's websites on a page about ours; with it, it is the other half of every `with` line in
the beds, which say who helped us. Its drawing **stops where the ivy runs**: the same coordinate
walker with the ink filter taken off, because we do not get to draw the ground of somebody else's
garden, which is also why nothing over there casts a shadow while everything in the beds does.
That boundary was a woven fence for an afternoon and it is ivy because **Helen asked**, and she
was right about more than the picture: a fence says kept out and ivy says this is as far as we
can see. The stars in it are glimmers rather than a sky &mdash; the room is still midday and
nothing ambient was added to the page.
`make-zibaldone.py` refuses **a quotation longer than thirty words** &mdash; the number is in the
tool and the room prints it, because a quote bank is the shape of page that turns into
republishing somebody's book one reasonable-looking entry at a time, and "we quote lightly" is
not a thing a page can promise and not enforce. It refuses **a song**, structurally rather than
by care: music publishing enforces on quotation where prose publishing shrugs, and nothing
musical is hosted anywhere on this street. **The first thing that check ever refused was a false
positive** &mdash; the word *song* matched Whitman's *Song of Myself* &mdash; and the pattern was
narrowed rather than the poem excepted. It refuses a quotation with no **printing** in its source
field, because a title is not a source and these texts differ between printings; one with no
record of **how it was checked and when**, which is `make-sweetgrass.py`'s rule about not letting
an unchecked quotation sit among checked ones looking identical; and a public domain claim that
does not clear seventy years **for the translator as well as the author**, since a translation is
a copyrightable work of its own. It refuses **a quotation set in the hand** &mdash; the room
varies the face per entry, which is what was asked for, and a passage in a handwriting face is an
access failure wearing atmosphere. It refuses a drawing it has not got and two entries sharing
one, a margin note carrying a quotation mark, an emoji in the line that says what a quotation is
*for*, and the vocabulary of ranking. **Nothing in that room is ranked, counted or voted on**: a
quote bank is exactly the shape of thing that grows a leaderboard.

`make-guild.py` refuses a job with no estimate of how long it takes &mdash; the street's oldest
promise arriving at a job board, where the cost is a walk rather than a runtime &mdash; refuses a
room it has no marker drawing for, which is `make-og.py`'s refusal for `make-og.py`'s reason,
refuses a room with no job in it at all, so a new room cannot ship without one, refuses an answer
the answer box would not accept, and **refuses the vocabulary of scoring**: a board is exactly the
shape of thing that grows a score, and a score beside a walking tour of a Disabled people's site
turns a wander into a workload. **The first thing it ever refused was a false positive** &mdash;
"a book it points at" is the verb &mdash; and the pattern was narrowed rather than given an
exception, which is the lesson `check-counts.py` learned by refusing "no two rooms alike" on its
own first run.
`check-quests.py` reads the published HTML and never the data file, because a checker that
re-derived the answer from the generator's own source would only be testing that Python is
deterministic. It is there for every moment *after* the generator runs, when a generated line in a
committed file gets edited by hand &mdash; the `frame-src` shape exactly. **It found a bug in
itself on its first run**: it sliced each marker at the next `</details>`, the markers' own hints
*are* `<details>`, and it reported eighteen missing escapes that were all present.

`check-print.py` and `check-gentle.py` stop if they cannot find a Chrome to render with, rather
than passing a claim they did not test.

Three tools need something *installed* — a Chrome or Chromium, which they all drive headless.
Point them elsewhere with `CHECK_PRINT_BROWSER=`, `MAKE_OG_BROWSER=` and `CHECK_GENTLE_BROWSER=`.

`check-print.py` renders a real PDF and checks both halves of the zine room's claim: one sheet,
and "in black and white", the latter by reading the inks out of the PDF against an allowlist.
Borders keep their own colour — the reset covers backgrounds, text and shadows — which is why
the two near-neutral border tints are on that list.

`make-og.py` renders each share card and reads the layout back out of the same run, so "it fits
in 1200×630" is measured rather than eyeballed once and assumed forever. A longer title is
enough to push a word off the edge, and the crop lands in somebody else's timeline.

## The share cards

A pasted link gets unfurled into a card, and for most people that card is the only part of the
street they ever see. **There is no card template.** There is one per room, and they
contradict each other exactly as `love.css` §5–§15 do — the street's collides six typefaces,
the zine's is a ransom note, the quantum room's is a mono face over interference fringes, The
Chappell's is gold neon under a rose window, the campground's is a routed park sign with a
stream along the foot and **no ambient layer at all**, because the field has none, the
arcade's is a marquee of bulbs over a pixel face with Esmx standing beside it, and the burrow's is
the only one made of **two grounds** — lamplit earth above, a band of lit plaster along the foot,
which is the inversion that room is built on; the plain
rooms get a quiet one. One template would
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
