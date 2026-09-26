# Stimpunks.World

**One street, no two rooms alike, rooms behind rooms, and an edge at each end &mdash; a campground
past the treeline, a road out of town past the last streetlight.** A Stimpunks
Foundation site, and the loud one.

Live at **[stimpunks.world](https://stimpunks.world/)** since 2026-09-23, and at stimpunks.love from
2026-09-19 until then; the old domain stays registered and 301s path-for-path.

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
map.html              The whole street as a white card model on a cutting mat. Built from the street
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
dead-tired-society.html  Peer support for the burnt out. Big lights off, door ajar, nobody sitting in the light
laughingstock.html    A comedy club down a ramp. Disabled comics on their own terms; only their lines stand in the light
lightbulb-picture-house.html  Two screens of neurodiversity films, a rack with a card for each. House lights up; nothing is blue
samefood-cafe.html    A café for samefoods and safe foods, seen from above the table. Nothing on a plate touches anything
collection-collection.html  A dark gallery of our people's collections, a lamp per cabinet and no two alike. The house describes the photos
vital-plant-living.html  A plant-based kitchen drawn cut through the middle. Build a bowl or wrap from a real pantry and copy it
community-center.html A painted block hall, blinds half open. House norms and the front desk for the CB
dopamine-dress-up-den.html  Helen's idea: a boutique for dopamine dressing. Mix an outfit on a valet stand; nobody's body is drawn
your-room.html        The storefront with nothing in it: empty on purpose, terms written down
now-playing.html      A poster column beside the Pebble Board. What every room puts on first, read off the rooms
plural-mural.html     An end wall that repaints itself, because the street is Danny's. By itself at MAX only; propose one in words
cavendish-coworking.html Henry Cavendish's house: a shut, unlocked door onto each of our calls. Proton Meet links, never frames
community-library.html  A public reading room with the sky in its windows. Free to all; our collections on the front desk
l-space.html          Behind it: every library at once, bent by the weight of books. Nothing straight; a ball of string
oook.html             And behind that: a Discworld homage in the Librarian's colours. He is not drawn
broadsheet-broadside.html  A press in the side of a ship. Broadsides printed both sides, ink on white, one to pin up and one to hand over
the-garden.html       The knowledge garden. One bed per site we publish, each linking out
campgrounds.html      The field past the treeline. Marker posts, no ambient layer, ever
faery-yurt.html       Pitch 01. Helen Edgar's candlelit yurt; her design, not ours
solarpunk-hermitage.html  Pitch 03. A cabin on wheels, and the one room the sun is up in
the-outskirts.html    The road past the last streetlight. Hand-painted signs, lit by headlights
black-leather-lagoon.html  Turning 01. A drive-in screen in black water; an appreciation of The Cramps
dance-punks.html      Turning 04. A silent disco on an old airstrip, lit only by the headsets
small-hours.html      Turning 05. An all-night diner seen from the car park; Josephmooon on the jukebox, crayons and a placemat
repeater.html         Turning 06. A radio mast on the ridge; shared-signal space and a line left open
nothing-for-sale.html Turning 07. A free market in a ring of headlights. Solidarity, not charity
liner-notes.html      Who made this noise
changelog.html        What changed, and when. Every Stimpunks site publishes one
love.css              Shared base (§1–§4) then one self-contained world per room (§5 on)
love.js               The dial, the toys, the superposition panel
love-embed.js         The press-to-play facade
cb.js                 The CB's radio and the front desk. Loaded only once signed on
chalk.js              Plural Mural's chalkboard, which is the CB's too: anybody reads it, a CB pass writes on it
cb.css                The radio's own sheet, inside its shadow root. No room can reach it
cb-rooms.json         The rooms the CB knows by #tag, in walking order. Written by make-sitemap.py
netlify/functions/    The CB's functions: sign on, listen, transmit, moderate, the hourly sweep, and the
                      chalkboard's read, write and rub-out
netlify/cb/lib.mjs    What they share, and every promise the privacy page makes about the channel and the board
package.json          Only there for the CB: the one library its functions need. Not a build step
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
data/map.json         The rooms behind rooms, and nothing else the map cannot read off the street
data/garden.json      What grows on each site. The roster is read out of arrivals.json
data/zibaldone.json   The quote bank. Every line names its printing and how it was checked
data/rabbit-hole.json The shaft's presses, its engravings and its trail. No lyrics, refused
data/checkpoint.json  Room 429's quotations, its Retry-After slips and its way out
data/dead-tired.json  The pegs by the door: what wore us out, one line from somebody who wrote about it, one of ours
data/laughingstock.json  The stage, the bill and the lines in the light. Every set names its comics and its runtime
data/picture-house.json  The two screens and the rack. Every card says who made it, how long, and what is in it
data/samefood.json    The table in the window, the menu, the book on the counter, and the regulars' trays as they gave them
data/collection.json  The cabinets, their lamps, the photographs in them and who described each one. Nothing counted or priced
data/dance-punks.json The disco's three channels: where each starts in one crate, and in what colour
data/small-hours.json The diner's quotations, its menu, Up All Night with its permission, the jukebox, and the placemat's crayons and part names
data/repeater.json    The Repeater's two lines of ours and the log's cards, none of which counts anything
data/nothing-for-sale.json  The lay-by's tables, each a free thing of ours, and the headlights, none alike
data/library.json     Every quotation in the library, L-space and Oook, with how it was checked; the desk and the threads
data/community.json   The community service board: a slot for every room that takes something in, and the words each one holds its room to
data/broadside.json   The press's sheets, both sides of each, with their two spot inks. No two sheets share a pair
dance-punks.js        The headset. Tuning is silent while it is off; it asks love-embed.js for the frame
small-hours.js        The whole-album buttons, and the placemat: colour in, scribble, take it home. Stores and sends nothing
repeater.js           The open line: quiet noise made in the browser. Nothing sent, nothing listened to
quest.js              The job markers, and the guild's board. Works with scripts off
zibaldone.js          The attribution slip. Composes a block of text; sends nothing anywhere
checkpoint.js         Room 429's copy buttons, which ship hidden. The slips work without it
dead-tired.js         The talking piece. Pass is a whole turn; what you type goes nowhere and is not kept
broadside.js          The press's print buttons, which ship hidden. Printing the page prints every sheet without it
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
python3 tools/make-sitemap.py      # sitemap.xml, llms.txt and the CB's cb-rooms.json, from the pages' own heads
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
python3 tools/make-map.py          # the model on map.html, from the doors, the board and the signs; refuses an unmapped page
python3 tools/make-guild.py        # the job board, a marker in every room, and the credits
python3 tools/make-arrivals.py     # The Feed's arrival boards; draws what pull-arrivals.py read
python3 tools/make-garden.py       # The Garden's beds and credits; roster and order from arrivals.json
python3 tools/make-zibaldone.py    # The Zibaldone's leaves and its attribution slip, and the credits
python3 tools/make-rabbit-hole.py  # The Rabbit Hole's presses, engravings and trail, and the credits
python3 tools/make-checkpoint.py   # Room 429's quotations, slips and way out, and the credits
python3 tools/make-dead-tired.py   # Dead Tired Society's pegs by the door, and the credits
python3 tools/make-laughingstock.py # Laughingstock's stage, its bill and the lines in the light, and the credits
python3 tools/make-picture-house.py # The Lightbulb Picture House's screens and rack, and the credits; refuses a blue
python3 tools/make-samefood.py     # Samefood Cafe's table, menu, counter and trays, and the credits; refuses anything that touches
python3 tools/make-collection.py   # The Collection Collection's gallery, cabinets and credits; refuses metadata, a filter, or two lamps alike
python3 tools/make-vital.py        # Vital Plant Living's shelf, builder, board, counter and stereo; refuses a combo off the pantry, or Ital on the menu
python3 tools/make-community.py    # The Community Center's service board; refuses a slot whose room has stopped saying what it repeats
python3 tools/make-dressup.py      # the Dress-Up Den's stand, rails and looks, and the credits; refuses a size, a gendered rail, or no all-black colourway
python3 tools/make-mural.py        # Plural Mural's wall and its list; refuses a mural with no words, painted words under 4.5, a photograph, or a vote
python3 tools/make-coworking.py    # Cavendish Coworking's doors, from our events page's own words; refuses a line the page has dropped, a door with no password, or a frame
python3 tools/make-live-room.py     # The Live Room's desk, a channel strip per session, and the credits; refuses a set played outside, or a studio with nothing on it
python3 tools/make-broadside.py    # The Broadsheet Broadside's sheets, both sides; refuses a third side, a long claim line, a shared ink pair, a link that is not its address, or an order to the reader
python3 tools/make-covenstead.py   # Covenstead's tenets and quotations; refuses a tenet written as an order, a contested one that does not say why, or membership
python3 tools/make-lagoon.py       # Black Leather Lagoon's rack and credits; refuses a ranked rack, a note shaped like verse, or a song with no year
python3 tools/make-looming.py      # Looming Rocks' stage and running order; refuses an act not played outdoors, a named lichen, or a ranked bill
python3 tools/make-sithen.py       # Sithen's rules and their sources; refuses advice, or anything drawn from the two novel series
python3 tools/make-library.py      # the library's, L-space's and Oook's quotations, the front desk and the threads; refuses a long passage, a lyric, or the graphic novel
python3 tools/make-dance-punks.py  # the disco's channels and credits; refuses a runtime, shuffle, or two inks alike in greyscale
python3 tools/make-small-hours.py  # the diner's menu, quotations, record, jukebox and placemat; refuses a lyric with no permission, or a placemat that keeps anything
python3 tools/make-repeater.py     # the Repeater's log and quotations; refuses anything that sends, stores or listens
python3 tools/make-nothing-for-sale.py # the lay-by's tables; refuses a price, charity's categories, and a debt
python3 tools/make-foundry.py      # The Foundry's bench, its shelves and its proof
python3 tools/make-now-playing.py  # the bill on the poster column, read off every room's own page; after the rooms, so it reads what they wrote
python3 tools/make-signoff.py      # the sign-off line on every page, and the pavement's links on the front one
python3 tools/make-structured.py   # each page's JSON-LD, built from its own head
python3 tools/make-agent-files.py  # /.well-known/api-catalog and the agent skills index, digest computed
python3 tools/make-webp.py         # JPEGs to WebP where that is measurably worth it; run it before the generators when adding an image
python3 tools/make-og.py           # the share cards, and the og:image tags that point at them
python3 tools/make-icons.py        # favicon.ico, the touch icon and the manifest's icons, all from favicon.svg
python3 tools/make-security.py     # /.well-known/security.txt; refuses from 30 days before it expires
python3 tools/check-contrast.py    # every pair against WCAG; exits 1 on a failure
python3 tools/check-print.py       # renders each zine page to PDF, and the press; exits 1 if a zine is not one sheet or a broadside not two pages
python3 tools/check-gentle.py      # every page at all three dial settings; exits 1 on a leak
python3 tools/check-contrast-live.py # every piece of text on every page, as rendered
python3 tools/check-focus.py       # every focus ring on every page, against the ground it is drawn on
python3 tools/check-headings.py    # refuses a page that skips a heading level, or has other than one h1
python3 tools/check-counts.py      # refuses a sentence that says how many rooms there are
python3 tools/check-ids.py         # refuses a repeated id, and one no page actually has
python3 tools/check-classes.py     # refuses a class two rooms claim, or a page wears wrongly
python3 tools/check-quests.py      # refuses a code a room and the board disagree about
python3 tools/check-faces.py       # refuses a typeface either room about type has lost
python3 tools/check-weights.py     # refuses a weight on the Foundry's bench that renders the same as another, or one love.css does not declare
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
python3 tools/pull-club.py         # mirrors Club Chronic's playlist ids into data/club.json
python3 tools/pull-club.py --check # reports drift between that mirror and the live playlist
```

And one that is **not a tool you run by hand at all**, listed here only so nobody goes looking for
it in the sequence above: `tools/daily-arrivals.sh` is the single command the **arrivals-board-daily**
scheduled task runs each morning. It pulls, redraws, gates, **commits and pushes** — so it does not
belong in a pre-deploy checklist, where it would quietly publish from whatever laptop ran it.
The task's prompt is tracked here, at `.claude/scheduled-tasks/arrivals-board-daily/SKILL.md`, and
that copy is the source of truth: edit it, then `tools/install-scheduled-task.sh --go` to install it
(no flag reports drift and writes nothing). Its commit subject, `daily arrivals board reset`, is
load-bearing — the Knowledge System's `update-logs` skips it by that exact string.

**`tools/check-all.sh` runs every one of them, in the order that works, and stops at the first
refusal**; it is the command to run before every commit, and on a clean tree it changes nothing.
The list above is for reading, and it was five tools behind the directory when the script was
written, which is why the script is the list. Run them all before a deploy. They **refuse** rather than guess: `make-sitemap.py` stops if a page
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
jukebox makes, `make-club.py` stops on a start point that is not a YouTube id, on one stored twice, on a set of
them attached to a playlist whose frame cannot use one, and on a set carrying no date &mdash; the
stage starts its YouTube playlist at a random one of those ids because **the embed cannot shuffle
and cannot take a position**, which was measured rather than assumed: `shuffle=1` and `index=` are
both inert and only `/embed/<id>?list=` moves the starting point, so the file holds ids rather than
a count and those ids **drift**, which is what the date and `pull-club.py --check` are for.
It reads the framed origins out of `love-embed.js` rather than keeping its own list &mdash; that copy
was removed when Apple Music became the fourth origin, because a hand-kept copy of a generated list
is the `_headers` trap in miniature. It also stops on a deck that is **both a door and a screen**, on a door carrying start points, and
on a deck with no note &mdash; the Qobuz playlist is a door because **Qobuz publishes no embed**, and
the trap is that framing it works perfectly and renders a catalogue page with no play control on it.
`make-chappell.py` stops on an id that is not a YouTube id — which love-embed.js
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

`make-dead-tired.py` refuses **advice in the second person**, **the vocabulary of bouncing back**
and **a tally**, all in the room's own voice and all with the negation window, so the room can say
that it gives no tips, praises nobody for resilience and counts nothing. A burnout page is exactly
the shape of thing that fills up with ways to recover, and every one of them is homework handed to
the person least able to do it. **It skips blockquotes when it sweeps**, which is the one place it
parts from `make-checkpoint.py`: two of the lines on those pegs are the sharpest things anybody has
said *against* resilience, and a quotation criticising a word has to be allowed to contain it. It
refuses the film the name is a play on beyond its name &mdash; characters, school and its two famous
lines, outright &mdash; a quotation over thirty words or without an author, work and link, a peg
whose `entry` is not one of our own glossary entries, and a peg with no drawing, two sharing one, or
a drawing not also said in words.

`make-laughingstock.py` refuses **the vocabulary of inspiration** in the room&rsquo;s own voice &mdash;
brave, courageous, inspiring, an inspiration, overcoming, suffers from &mdash; and **a headliner or a
ranking**, both with the negation window, so the house rules can still say that nobody is called
brave and nobody headlines. The write-up the room is built on says it in as many words: disabled
comedians are not inspiring for being on stage, they are comics who happen to be disabled. It is
narrowed rather than excepted &mdash; bare *inspiration* is allowed, because *inspiration
exploitation* is one of our own glossary entries &mdash; and it **reads the house and nothing in the
light**: the comics&rsquo; own lines are the only blockquotes in that room and are skipped, so that
&ldquo;I suffer from people&rdquo; is allowed to say suffer. It holds `make-club.py`&rsquo;s pair of runtime
rules, refuses a set that does not name its comics, and refuses a line over thirty words or with no
context of ours beside it.

`make-picture-house.py` refuses **a blue anywhere in the room's palette** &mdash; it reads the
`--lph-` colours in `:root` and every literal colour in its own section &mdash; because a lightbulb
theater in a neurodiversity room, lit blue, is Light It Up Blue, and the page says nothing in the
building is blue. It refuses **the vocabulary of awareness** in our own voice (puzzle pieces, cure,
suffers from, functioning labels, *person with autism*), skipping the quotation, the film titles
and anything in curly quotes; **a card with no `content` key**, because every card says what is in
its film before the press and a missing key means nobody looked; **a pronoun for any maker**,
because not one of those films says what theirs are; and `make-club.py`&rsquo;s runtime pair.

`make-samefood.py` **walks every coordinate of the drawing of the table and refuses two foods on
the divided plate that touch** &mdash; a food within a gap of its well's wall or of a different food,
an object whose ring of shade meets the plate's &mdash; because the café defaults to structure,
separation and predictability, and the next drawing will be added by somebody who has not read this.
**It does not separate anybody who does not want separating**: pieces of one food may touch, and each
regular's bowl is their dish the way they eat it. A regular may carry **asks**, their own way of being
served, and the tool checks an ask only against that person's food &mdash; Ronan has red things in a
ramekin of their own, so his ketchup is refused anywhere else and nobody else's is &mdash; because the
house accommodates every guest individually and no one's rules impose on someone else. A path's control points count as if they were on the curve, so the check can
be stricter than the picture and never kinder. It refuses **the vocabulary of correcting somebody's
plate** in our own voice (picky, fussy, one bite, healthy, junk food, hungry enough, sneaking
vegetables in), with the negation window so the room can say nobody in it is a picky eater, and
skipping quotations, titles and the book's own subtitle; **a tally**, above all one across the trays,
because two regulars list the same drink and somebody will want to say so; **advice about eating**;
**a regular with any key but name, items, given and date**, since every other key is the start of
sorting other people's dinners; **a food in the window that is not on somebody's tray exactly as
written**, so a list that comes down takes its food off the plate too; a quotation over thirty words
or without a record of how it was checked; and a book with no library link. The regulars' own words
are not swept: they are theirs.

**Photographs of people's collections come in through `tools/intake-collection.py`**, which is
the one tool here that exists to take work off somebody: drop phone photographs in
`collection/inbox/` (gitignored) and run `python3 tools/intake-collection.py ryan-pens`. It turns
each one the right way up *before* the orientation tag goes, strips EXIF, GPS, XMP and everything
else a phone writes, shrinks it without cropping, moves the original to `collection/inbox/taken/`
(still gitignored, because it still carries its location) and writes a **stub** into
`data/collection.json` with every descriptive field empty. Then somebody &mdash; in practice Claude,
looking at each file &mdash; writes the title, alt and caption and says they looked at the whole frame.
`make-collection.py` **refuses the stub until then**, so nothing goes up undescribed. It also refuses
any metadata left on a file (stricter than `make-polaroids.py`: XMP and IPTC as well as EXIF); a
photograph nobody has said has **no person in it and nothing that says where it was taken**; **a
maker's name in words Claude wrote** unless it is legible in the photograph and transcribed into
`reads` &mdash; the herbarium's refusal to guess at a binomial, in a room where everything is sold on
its name; value, price, rarity and count in the room's voice and in every description, with the
negation window and with mid-sentence capitals skipped as names (its first refusal was Devon Price);
a filter, blend or fade reaching a photograph; a full cabinet with no lamp, and **two cabinets with
the same lamp**; a file with no entry and an entry with no file. Then run `make-webp.py`, which
decides per photograph whether WebP earns its place.

`make-community.py` builds the Community Center's service board out of `data/community.json`:
a slot for every room that takes something in from our community, saying what it takes, what it
asks and how to send it. **A slot repeats another room's terms, so it is held to them**: each one
names, in `holds`, the words on that room's published page that carry those terms, and the tool
reads the page and refuses if they have gone. The board cannot go on promising what the room has
stopped promising. It also refuses a route no room offers, a form or an input, and the vocabulary
of a score, with a negation window so the board can still say out loud that nothing is ranked.

`make-dressup.py` builds the Dopamine Dress-Up Den out of `data/dressup.json`, and **the drawings of every
garment and every print live in the tool**, so it refuses a garment or print it cannot draw rather than
putting nothing on the stand. It **refuses a garment that does not say how it feels and how it comes off**,
a set of colourways with no all-black one, an ink `love.css` does not declare, a look with somebody's name
on it and not their words, and a cut that names a body part: **nobody's body is drawn**, the clothes hang
on a valet stand. It sweeps the room's own copy, with the negation window, for the vocabulary of bodies
and sizes, gendered rails, fashion rules, brain chemistry, othering and rating, and refuses the bare name
*The Den*, which is Graceland's room behind the Jungle Room. `dressup.js` reads every cut, print and
colourway off the page; the tool refuses it if it ever stores, sends or reads the dial.

`make-vital.py` builds Vital Plant Living out of `data/vital.json`, **where the pantry is Ryan's own**,
the list he cooks from at home, written down as he gave it. It **refuses a combo that brings in
anything the pantry does not keep**, and one that stands on none of the flavour bases off his list,
so the board cannot quietly serve something the kitchen has not got; **refuses an item with no look**,
because the failure is a thing somebody ticked that never appears in the drawing of their bowl;
refuses a pot on the shelf that is not in the pantry, and two pots drawn alike; holds
`make-club.py`'s pair of runtime rules for the stereo; and **refuses the word Ital anywhere on the
menu**, because the room was briefed under that name and renamed, Ryan's call, 2026-09-24: this
kitchen cooks with salt, MSG and processed food, and how Ital is kept is not ours to settle. It
also refuses authentic, exotic and ethnic, and the vocabulary of wellness and of counting, in the
room's own voice, with the negation window. **Its first refusal was a sentence of ours**: the
credits line listing what the tool refuses said "the vocabulary of … authenticity" with the
"refuses" too far back for the window, and the sentence was rewritten rather than excepted.
`vital.js` reads every item, shape and ink off the page and keeps no copy; the copy button puts a
plain-text ticket on the visitor's own clipboard and nothing is stored or sent.

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

**The CB does not run on that server.** `serve` serves files and nothing else, so `/cb/*`
answers 404 there and the radio says it has no signal. Everything the CB does is a handful of Netlify
Functions in `netlify/functions/`, and they run under `netlify dev` (after `npm install`) or on
the live site. They need two environment variables set in Netlify, never in this repository:
`CB_PASSWORD`, the shared password, and `CB_MOD_PASSWORD`, the base station's, each at least
eight characters. **Rotating the password is changing `CB_PASSWORD` and redeploying**: every
pass is an HMAC keyed by it, so the redeploy signs everybody off at once and there is nothing
else to clear. Nothing on the channel survives midnight, Colorado time, whatever you do.
**The chalkboard on Plural Mural is the one exception, and it is public**: Helen Edgar's idea,
and Ryan's call on 2026-09-25 that anybody can read it and a note stays seven days. A pass is
needed to write. `privacy.html` has its own section on it, and every read asks search engines
not to keep it.

## Attribution

Text, markup and design are [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
The typefaces keep their own SIL Open Font License; the songs keep their own copyright and
**nothing musical is hosted here**. See `LICENSE` and `liner-notes.html`.
