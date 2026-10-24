# CLAUDE.md — Stimpunks.World

Guidance for Claude Code working in this repository. `README.md` covers what the site is and
how to run the tools; this file covers the things a session gets wrong.

## Who is working here

**Two people commit to this street: Ryan Boren and Helen Edgar** (GitHub: `ryanboren` and
`AutisticRealms`), from 2026-09-26. Each works through their own Claude. **Find out who is at the
keyboard before anything else**: the session's git user says so, and `git config user.name` does
too. If neither settles it, ask.

**Helen can change anything here. This is her world to change too.** That was Ryan's call on
2026-09-26, and it goes further than the Faery Yurt. This file is written mostly from Ryan's side,
so read it with that in mind:

  · **"Ask Helen", "Helen's call" and "Helen has the final say"** are about decisions that belong
    to her. When Helen is at the keyboard, asking her *is* asking Helen. Her own room is hers to
    redesign, and nothing written about the yurt below binds her.
  · **"Ryan's call"** records a decision already made and why. Helen may change one. When a change
    reverses something this file or `DECISIONS.md` records, say so before doing it, and say so in
    the commit and the changelog, so the other person meets the change written down rather than in
    a diff. Do not refuse.
  · **The rules the tools enforce hold for both of them**: attribution, contrast, the dial, consent
    for every photograph and voice, nobody counted. A tool that refuses is not waiting for
    permission from the other person. Fix the cause, whoever you are working for.

**Both of them work straight on `main`, one at a time.** They agree between themselves, outside
this repository, whose turn it is. Everybody else sends pull requests from a fork: see below the list. A push to `main` deploys to stimpunks.world within a minute or two, and nothing reviews it
first. So:

  1. **`git pull` before touching anything**, even when you think nobody else has pushed. Ryan's
     laptop runs a scheduled task that commits and pushes the Feed's boards every morning
     (`tools/daily-arrivals.sh`).
  2. **Run `tools/check-all.sh` before every commit.** It runs every generator and every checker
     in the one order that works and stops at the first refusal. On a clean tree it changes
     nothing. If files change, they are generated files catching up with a source: commit them
     with the change that caused them. **When only notes have changed** (DECISIONS.md, README.md,
     CLAUDE.md, SECURITY.md), it runs only the checkers that read them, in seconds, and says so;
     it finds those readers by name in `tools/`, and runs everything if a generator is one of them
     (Ryan, 2026-10-24). `--full` runs everything anyway. The full run prints how long every step
     took and ends with the slowest, so a speed-up starts from a measurement. check-gentle,
     check-contrast-live and check-focus run side by side (a `+` joins them in `STEPS`), because
     each only reads and keeps its own probe file and Chrome profile; never join a step that
     writes, and a new checker that renders pages lists them without dotfiles, as those three do. Do not add a file
     to `NOTES` that any generator reads, and do not make the quick path guess about any other
     change: a page, a data file or a stylesheet can change a room nobody touched.
  3. **Commit and push when you stop.** Work left uncommitted blocks the other person's turn, and
     it blocks the morning's arrivals task, which refuses to run over anybody's edits.
  4. **Never hand-merge a generated file.** If a pull conflicts in `feed.xml`, `sitemap.xml`,
     `llms.txt`, `cb-rooms.json`, a share card in `og/`, `data/og-prints.json`, or anything between
     `:begin` and `:end` markers, take either side, finish the merge in the sources, and run `tools/check-all.sh` to
     regenerate them.
  5. **A new changelog entry goes at the top, with its own id**, even when the other person already
     wrote one that day. A feed reader never shows an edited entry again.

**ANYBODY ELSE WORKS THROUGH A FORK AND A PULL REQUEST.** Ryan's call, 2026-10-13, with The
Sandbox, whose steps (and `CONTRIBUTING.md`, written from the same data by `tools/make-sandbox.py`)
say how: fork, `tools/setup.sh`, Claude, a branch, `tools/check-all.sh`, `gh pr create`. **If the
git user is neither Ryan nor Helen, you are working for a contributor**: never push to
`Stimpunks/Stimpunks-Love` or to `main`, work on a branch of their fork, run `tools/check-all.sh`
before every commit, and send the change as a pull request. Everything in this file binds them as it
binds Ryan and Helen. The calls it says are somebody's (Helen's yurt, an imported room's owner, a
decision recorded as Ryan's) are asked in the pull request, never made in it. They have no
Knowledge System mirror, so a glossary slug is checked on the live site, where a redirect still
counts as a failure. **Whoever merges a pull request pulls `main` and runs `tools/check-all.sh`
straight after**, because a merge made on GitHub can leave a generated file behind its sources and
the merge has already deployed; and a pull request that conflicts in a generated file is finished
by rule 4, never by hand.

**What a machine needs**: Python 3 and Google Chrome for everything (the render checks, the print
check, the icons and the share cards all drive Chrome headless), and Node for the preview server in
`.claude/launch.json`. Only for particular jobs: `cwebp` and `ffmpeg` when a new JPEG arrives
(`make-webp.py`), `ffprobe` when a recording does, and Pillow for `intake-collection.py`. The Stimpunks Knowledge System mirror that this file keeps
mentioning is on Ryan's machine only. On any other machine, check a glossary slug or a stimpunks.org
page on the live site, and remember that a redirect there counts as a failure. The one tool that
reads the mirror, `make-coworking.py`, says the mirror is missing and carries on.

**Helen's contributions are under the site's licence, CC BY-SA 4.0.** She accepted that on
2026-09-26, and `LICENSE` says so. The exclusions still apply to what she brings: photographs,
recordings of voices, and borrowed names.

## The rule that matters most: do not tidy this site

**There is no single design system here and there must not become one.** Every room on this
street is its own unrelated visual world — plus a subroom behind one of the doors, and a
campground past the treeline at the end of the street with a yurt pitched on it.

**AND DO NOT COUNT THEM.** Ryan's call, 2026-09-20: the number of storefronts is going to grow
well past anything worth writing down, so no page, comment, tool string or doc here states how
many rooms, doors, worlds, share cards, pages or typefaces there are. This is not tidiness — a
total is a fact about the site that lives in a dozen places and is updated in one. **Adding the
Arcade proved it in the same commit that added it:** `love.css` went on saying "the six doors
are all outlined boxes" and "the street is six shopfronts shoulder to shoulder", and this file
went on saying there were "ten card designs", all three stale the moment the Arcade opened
and none of them caught by anything. `tools/check-counts.py` refuses them now. Write what
is *true however many there are* — "no two rooms alike", "one card per room", "every page". The instinct
to harmonise — one type scale, one palette, shared component classes across rooms — is the
correct instinct on every other Stimpunks site and is **destructive here**. `love.css` is
deliberately a small shared base (§1–§4) followed by ten sections that duplicate each other's
ideas in different clothes. That duplication is the product.

If a change would make two rooms look more alike, it is probably wrong. Ask first.

**A SUBROOM IS THE HARDEST CASE AND THE ANSWER IS THE SAME.** The Chappell (§12) hangs off Pink
Pony Club and shares nothing with it — the dancefloor is flat hot pink, cream Shrikhand and ten
small white cards inside one cream tray; the chapel is votive indigo, gold Monoton and thirteen
free-standing arches on the bare ground. "It is only a subroom, it should match its parent" is
the most reasonable-sounding sentence the tidying instinct has ever produced here, and it is
wrong for exactly the reason every other version of it is wrong. It got its own share card too,
which is where the shortcut would have been invisible.

**AN AREA IS THE SAME CASE WEARING BETTER CLOTHES.** The Campgrounds (§13) is cold blue spruce,
bone lettering routed like a park sign, and marker posts standing on bare ground. The Faery Yurt
(§14) is the first thing pitched on it and is candlelit brown, old serifs and soft bordered
cards. **"An area should look like an area" is the subroom excuse with a promotion**, and it is
more persuasive than the original because an area really does sound like the kind of thing that
has a house style. It does not. The contrast between the cold field and the warm tent *is* the
door — you walk in out of the night air — and flattening either one deletes the only thing that
makes the arrival mean anything. A share card each, for the same reason.

**THE YURT IS HELEN EDGAR'S AND IS NOT OURS TO REDESIGN.** The palette, the three typefaces,
the drawings, the twelve book spines, the glimmer window and every line of its copy came from a
mockup she built and sent on 2026-09-20. This repo added its own plumbing — the dial,
self-hosted faces, the consent record behind the photograph — and changed **exactly one
colour**, because her smallest grey failed WCAG on every ground it sat on. That change is
written up beside `--tallow-3` in §2, in `check-contrast.py`, in the changelog and in the liner
notes, because "we altered a contributor's design" is a thing that has to be visible in four
places rather than implied in a diff. Do not change a second thing of her design without asking her.
The street's conventions are not her design, and since 2026-09-30 they arrive without asking: see the
next paragraph but one.
**Maintenance is the one standing exception, and it is narrow:** Helen approved any needed
maintenance on 2026-09-23 — fixes that change nothing a visitor can see, like the width and height
now on her two photographs. It is not licence to redesign. Anything that changes how her room looks
or reads is still hers to decide, and maintenance done there goes in the changelog like the rest.

**THE STREET'S CONVENTIONS REACH EVERYBODY'S OWN SPACE, AND THAT IS PART OF BEING A CITIZEN HERE.**
Ryan's call, 2026-09-30, after Helen said yes to the guest CB in the Faery Yurt and said she does not
need to approve future additions. Every personal space on the street (the Faery Yurt, a room brought
in by `tools/import-room.py`, anybody's room from Your Room) takes the world's conventions as they
develop, without asking first: the dial, the sign-off, the job marker, the radio and the guest bar,
the fractal switch, a pebble bowl, whatever comes next. **Somebody who does not like a convention
brings it to the Town Hall**, where conventions are talked over from time to time, and a convention
can change there; it is not refused room by room. **What this does not cover is the room itself**:
its palette, faces, drawings and words stay its owner's, and a convention wears either its own
clothes (the radio, the guest bar) or the room's own ink (the job marker, the sign-off), never a new
look laid over the room. Each arrival still goes in the changelog. `your-room.html` says so to anybody
asking for a room. **In an imported room, a convention is added by the street's own tools or outside the
`import:<slug>` markers**, so a re-import keeps it.

**A ROOM WITH A GAME IN IT IS THE NEWEST VERSION OF THE SAME ARGUMENT.** The Arcade (§15) is
grape carpet, a cabinet of hard blocks, a screen that is a different black from the
room around it, and a pixel face nothing else on the street sets. "The Playhouse already has the
toys, so the arcade should look like the Playhouse" is the subroom excuse holding a joystick.
That room is saturated primary blue, bunting and a checkerboard floor; this is a coin-op at
midnight. They have nothing to do with each other and that is the door.

**THE ARCADE IS A ROOM WHOSE PAGES ARE SUPPOSED TO LOOK ALIKE, AND IT IS THE ONLY ONE.** The
foyer and each cabinet's page share the carpet, the marquee bulbs, the cabinet build and the
pixel face, because that is what an arcade is: machines with one body and different things
behind the glass. **The worlds here are the SCREENS** — a flat dark field and a kelp bay have
nothing to do with each other. Do not "fix" the similarity, and do not cite it as licence to
harmonise two actual rooms; it is the one place on this street where shared chrome is the
subject rather than the failure. The chrome lives on `.arcade` and the card hook is a separate
class per page (`room-arcade`, `game-quill`, `game-otter`), so the thing that styles and the
thing that unfurls are never the same word and no ordering inside a `class` attribute decides
which card a page gets.

**AND A GAME GETS ITS OWN PAGE BECAUSE IT NEEDS ITS OWN CARD.** Both games shared `arcade.html`
for about an hour, which meant a link to the otter game unfurled as a picture of a porcupine —
`make-og.py`'s whole reason for existing, happening inside one room. A new cabinet gets a page, a
card design that is its own screen, an entry in `make-sitemap.py`'s order, and its refusals
written on it rather than in the foyer. The foyer states only what is true of every machine.

**AN ID WITH TWO OWNERS IS A SILENT BUG, AND `check-ids.py` IS WHY.** `getElementById` returns
the first match and never complains, so the failure lands somewhere else. Two on one afternoon:
the pebbling cabinet gave the player's sprite the same id as the drawing in its own `<defs>` and
the game threw on the first line of `start()`; and the Faery Yurt had been carrying **seven**
elements with `id="yurt-says"` since the nook shipped, because the generator emitted a live
region inside every tile — six of them dead markup that never received a word, and nothing
anywhere said so. The tool checks both directions: no id twice on a page, and no script asking
by name for an id that no page loading it has.

**THE PEBBLING CABINET IS NOT THE PEBBLING GAME, AND THE REASON IS A LICENCE.** Helen Edgar and
Ryan Boren published *Penguin Pebbling*, a thirty-card game, in 2026; it lives at
penguinpebbling.app and is **CC BY-NC-SA 4.0**. This site is **CC BY-SA 4.0** with no
non-commercial clause. An adaptation of that deck would carry NC onto a page that cannot hold
it, share-alike means it could not be quietly absorbed, and relicensing is not ours alone to do
— half the authorship and all the artwork are Helen's. So `penguin-pebbling.html` is built on
the **locution** (Amythest Schaber's, documented by Stimpunks in 2022, written up by Helen at
Autistic Realms in 2023) and takes nothing from the deck: no cards, no prompts, no artwork, no
five-locution structure. **Do not merge them, and do not add a card to that cabinet.** The deck
is linked and credited as the separate, better thing it is.

**AND THAT CABINET REFUSES A COUNT.** No tally of what you gave, no total, no streak, and the
neighbours bring you things on their own clock whether or not you have ever given them anything
— which is the difference between pebbling and trading, built as a timer rather than as a
reward. A number beside a practice that is explicitly not about volume would quietly make it
about volume. Nothing to fix here; something to protect.

**THE ARCADE'S OTTER CABINET CARRIES A CLAIM THAT CAN BE BROKEN BY A KINDNESS.** Otterly Adorbs
is built on Helen Edgar's *Stimpunks Solidarity and Otters* and on Star Stuff's zine No. 58,
*The Stone You Keep*, and that zine **refuses "rest so you can produce" in as many words** — the
otter is not recharging in order to forage better tomorrow. So **floating fills nothing**: no
meter, no stamina, no bonus afterwards, and the cabinet says so out loud. The obvious, friendly,
well-meant improvement — *let floating restore something, it feels good to be rewarded* — would
put a sentence on this page that another of our pages spends a spread refusing. Do not add it.
The same goes for ranking the other otters (there is no standard otter), for rounding the clam's
6-to-88 range into something tidier, and for making the stone compulsory (some otters never use
one, and the ones who do keep their teeth). Every one of those numbers is in `otterly.js` beside
the paper it came from.

**AND IT FOLLOWS THE ZINE'S CORRECTION, NOT OUR OWN CHANGELOG.** stimpunks.org's week-28
changelog describes the otter keeping "a favorite stone tucked in a pouch of skin" and returning
to it "again and again". Zine No. 58 went to the primary and found that the lifelong favourite
rock in an armpit pouch traces to popular retellings; what Hall & Schaller support is a stone
kept and reused across successive food items **within a bout of feeding**. The game does the
second thing. When two of our own pages disagree, the one that checked wins.

**ESMX IS OURS *AND* KAYA OLDAKER IS STILL CREDITED — BOTH HALVES.** Stimpunks commissioned Esmx
the Porkypine and holds the IP. An earlier draft of the Arcade said the opposite ("our mascot
and not ours"), borrowing the framing from starstuff.earth's Quillery, which said Kaya's artwork
was "not ours to redraw stroke for stroke". **Star Stuff corrected that page on 2026-09-20**,
the day this room caught it: it now says Stimpunks commissioned Esmx and holds the rights, and it
keeps the wrong sentence on the page as a correction rather than quietly swapping it. The lesson
still stands for the next sibling page you borrow from: **a sibling site's framing is a claim to
check, not a source**, and the wrong sentence here had already travelled one site before anybody
asked who paid for the drawing. What survives the correction is the credit: Kaya's name is on the drawing's own
markup, in the room, and in the liner notes, because holding the rights to a commission is not a
reason to stop naming the hand that drew it. The Esmx in the cabinet is redrawn rather than
pasted in — **not** a permissions matter but a room-consistency one, plus the fact that our own
licence asks for variants rather than merely allowing them.

**THE SECOND WARM BROWN ROOM IS THE HARDEST CASE SO FAR, HARDER THAN THE SUBROOM.** The
Latibulum (§16) is a burrow under the hill: candlelight, earth tones, wood, soft furnishings,
somewhere to go when you have had enough of being findable. So is the Faery Yurt. Every earlier
version of this temptation had a structural excuse attached — *it is only a subroom*, *an area
should look like an area* — and this one does not need an excuse, because **the two rooms
genuinely are about the same feeling**. "They are both cosy, so they should feel the same" is the
first version of this argument that sounds like taste rather than tidying, and it is the same
mistake. What keeps them apart is structural and has to stay that way:

  · **the yurt reads cream on dark all the way down. Almost every word in the burrow sits dark on
    a lit plaster wall**, with the earth ground left over around it. Two rooms lit by the same
    kind of light, inverted. That inversion is the room, which is why its share card is the only
    one on the street made of two grounds.
  · the yurt is a pitched column of canvas with lights strung across the top. The burrow is dug
    into a hill: round door, arches, thick walls, one low lamp, and no sky in it anywhere.
  · the yurt sets high-contrast italic serifs. The burrow sets a planed slab and a rounded sans,
    because a smial is carpentry and a yurt is calligraphy.

Flatten any one of those and you have two rooms doing the same thing twice, which is worse than
either of them doing it once.

**AND THE SUBROOM BEHIND THAT ONE SHARES ITS NAME, ITS COLOUR, AND NOTHING ELSE.** The Den (§18)
is Graceland's Jungle Room — Elvis Presley's den, green shag, carved wood, a fieldstone waterfall,
and in 1976 a recording studio, which is where his last two albums came from. **This is the
hardest version of the subroom problem on the street**: The Chappell at least did not sound like
Pink Pony Club, and these two are literally both called the Jungle Room and are both green. What
keeps them apart is structural and has to stay that way:

  · **upstairs the green is the DARKNESS** and the light falls down through a canopy, with every
    word cream on that dark. **Down here the room is BROWN** — panelled, lamplit at knee height,
    no daylight anywhere — the carpet is the brightest thing in it, and the track list is set
    **dark on the green**. Same hue, opposite job, which is why its share card is a wall with a
    slab of shag along the foot while its parent's is a field under a roof of leaves.
  · upstairs is outdoors and open and has no straight edge in it. This is low, closed and
    rectangular, full of carved frames with the corners notched out of them.
  · upstairs sets a serif whose strokes swell as they curve. This sets a slab with no contrast in
    it at all, because one is a botanical plate and the other is a record sleeve from 1976.

**AND ITS GENERATOR ENFORCES THE OPPOSITE CHECK TO ITS PARENT'S, ON PURPOSE.** `make-jungle.py`
refuses a runtime; `make-den.py` refuses a track without one. That is not a contradiction to tidy
up — a live camera has no length to give, a song does, and both tools are keeping the same
promise: say what somebody is pressing before they press it. **Do not make them agree.**

**THE DOOR IN IS AN EASTER EGG AND IS NOT HIDDEN.** No storefront on the street; the way in is a
quiet line at the foot of the Jungle Room, the Chappell's shape turned right down. But `.den-door`
is an ordinary focusable link with real text, in the tab order, at full size, and the page is in
`make-sitemap.py`'s order like every other. **On a Disabled people's site a secret only a sighted
mouse user can find is not a secret, it is an exclusion.** Subtle means visually quiet. It never
means `display: none`, a one-pixel target, or anything a screen reader cannot reach.

**THE OTHER KIND OF EASTER EGG IS A ROOM YOU HAVE TO KNOW THE ADDRESS OF, AND IT IS UNLISTED, NOT
HIDDEN.** Ryan, 2026-10-07: rooms "not listed in the changelog, the feeds, the sitemap, the
teleporter, or anywhere. You have to know the URL to get to them." That reverses `make-sitemap.py`'s
refusal of a page outside its walking order, for **a page that says so on its own `<body>` with
`data-unlisted`** and for nothing else; every other page is still refused. **There is no list of
them, on purpose**: this site publishes its whole root, so a list in `data/` would be one public
file naming them all. Every tool asks the page through `tools/unlisted.py`: the sitemap, `llms.txt`
and `cb-rooms.json` (so the teleporter, the #tags and the search) leave it out, the guild gives it
no marker, Now Playing no line, and the sign-off's Where am I? opens the map with no flag.
**It keeps all the usual amenities, kept quiet** (Ryan, the same day, reversing a first build that
gave it World only: "This room needs in room chat more than any other"). `cb.js` makes the page a
room by its own word (`quietHere()`, which needs no list and so cannot wait on one or fail with it),
opens the radio on This room there, and writes no #tag into a spot, because a #tag is the address.
**And a quiet room can also be locked**: the cabin's CB is the administrators' (Ryan, the same day),
so both its pages are in `MOD_ROOMS` with the administrator role, say `data-cb="mods"
data-cb-role="administrator"`, and `make-secret-cabin.py` refuses them if the pages and the server
disagree; `make-town-hall.py` leaves a name in `MOD_ROOMS` that is a quiet room to that tool.
**The server keeps it in**: `QUIET_ROOMS` in `netlify/cb/lib.mjs` sends a host's beacon there only
to radios tuned to that room's channel (`shapeBeacons`' `tuned`, which `/cb/channel` and
`/cb/beacon` pass) and never lists the room on Who's online; Be seen here and the call already
answer only a radio seen there. `check-unlisted.py` refuses `QUIET_ROOMS` unless it is exactly the
pages that say `data-unlisted`, and `lib.test.mjs` was broken on purpose both ways. **The friendly
edit is to put the quiet room on Who's online "so people can find each other"**; that is the
listing the room exists not to have. The rest is
`tools/check-unlisted.py`, which reads everything a visitor, crawler or agent follows (every listed
page, the changelog, the sitemap, `llms.txt`, `cb-rooms.json`, the search index, the feed, robots,
the manifest, `.well-known/`, every stylesheet and script) and refuses an unlisted page's address or
name in any of it, and refuses one without noindex. **So `love.css`'s comments never name one**,
and its sections say UNLISTED instead. **No changelog entry, and a commit message that names no
room**, because the `update-logs` rotation can summarise commit messages in public. What it keeps:
a share card each (a shared link still unfurls), the dial, the sign-off, the fractal window, and
**the Den's rule**: an address is the same for everybody who is told it, so everything inside works
by keyboard and screen reader. **What it is not: secret.** The repository is public, the site links
to it and serves its own source, so `data/`, `tools/` and this file name them. A door with no path
to it, not a lock. A room's channel is any radio's that names it, and naming it is knowing the
address, which is the way in.

**THE FIRST ONE IS A CABIN BEHIND A DOOR MARKED E, AND THE WORD IS THE ADDRESS.** `the-secret-cabin.html`
is the door; the password takes you to a second unlisted page whose filename is the word (Ryan's
call), so **the door holds only the word's SHA-256** (`e-door.js`), builds the address from what was
typed, and `make-secret-cabin.py` refuses the word anywhere on the door. It is a ritual, not a lock,
and the guild's codes are the precedent: do not harden it. **The words are printed as given and the
cabin names nobody as their author** (Ryan's call), the brief's included. **Outside is light shaped
by a letter**: grey woods, a shut door, and the inside's light getting out through the E, round the
door, and thrown on the leaves. **Inside is out of focus**: every light a soft disc, as from under a
blanket, which is what holds it off the Faery Yurt and every other warm room (§102 lists them).
**The candles flicker, and there are a lot of them** (Ryan: "We want flicker. And lots of
candles."), which this street usually refuses: here it is held under the flash line instead. A
flame dims by a tenth of itself at most, wobbles no faster than two and a half times a second and
never in step, and the tool reads that out of `candles.js` and works it out against WCAG's line.
They flicker at MAX by themselves and at any setting after Let the candles flicker, the Arcade's
rule; **making them flicker at Regular unasked would change what Regular means**, which is Ryan's
call and not this room's. The whole of its paragraph is drawn, wine, weed, snacks and all, and the
drawing carries no word. Its record player plays whole albums off their artists' own
channels, each runtime the tracks added up, and `check-jukebox.py` checks every song.

**AND THE WRITERS ARE NAMED ON EVERY CUT, because Presley wrote none of those songs.** A room
where the performer's name is the entire draw is exactly where crediting only the voice would
pass unnoticed, which is the thing this site keeps attribution for. Every id there was resolved
against YouTube and checked on its own watch page, **and matched against the released runtime**,
because searching any of those titles turns up alternate takes on the same official channels and a
room arguing *these are the records that came out of that carpet* cannot hand somebody a rehearsal.

**A VIEWING ROOM FULL OF SOMEBODY ELSE'S CAMERAS IS WHERE THE RUNTIME RULE INVERTS.** The Jungle
Room (§17) carries the nature live cams off our own Watering Hole Hangs events page, in that
page's own groups and that page's own order, which is not ours to re-sort. **Every other
press-to-play control on this street says how long it runs before the press** — that number is
what lets somebody decide, and `make-latibulum.py` refuses a track without one. A live camera has
no runtime. The obvious fix, storing the length of whichever stream happens to be up today, puts
a number on the page that is wrong tomorrow and authoritative-looking in the meantime, so
`make-jungle.py` **refuses a cam that has one**. The label says it runs until you close it, and
the room states out loud that the picture may be darkness, rain, an empty waterhole or a cam
between streams. Do not add a runtime field back; the two tools are making the same promise.

**AND PLAYING IS NOT THE SAME PERMISSION AS EMBEDDING, which nothing here knew until that room.**
`love-embed.js` validates an id and builds an iframe; it cannot know the owner has switched
embedding off, so the frame loads and shows a refusal where the picture should be. That is
make-chappell.py's button-that-never-becomes-a-video arriving through a door no checker watched.
Two cams are like that: they get a way out to YouTube, **dressed as a door rather than as a
window**, because pretending a link is a screen is precisely the broken thing. `check-jukebox.py`
reads `playableInEmbed` off the same fetch as the status now, for every facade on the street.
**And a cam can simply be dead on our own published events page** — it renders nothing, the room
names it in its own copy, and the entry stays in the data file with the date. **Do not pick a new
id from here**; that is a curation decision on stimpunks.org. When a replacement arrives from
there, *check it before it goes up* — status, `playableInEmbed`, and that the title and channel
still match — and write what was measured into a `replaced` note on the entry, because a
replacement nobody checked is the original bug with a fresh id on it. **A replacement can also
come back as a link rather than a screen**, which is what happened to the Critter Cam: it plays,
and its channel has embedding off, so no id from that channel would come out differently. Do not
assume a working replacement is an embeddable one; the two are separate permissions and the
check is one line. The room's count of dead
cams is generated, **and so is the grammar of the sentence around it**: the first version
generated the number and left the tail plural, which is a hand-typed total wearing a disguise.

**EVERY GALLERY IN THE JUNGLE ROOM HAS A SCREEN OF ITS OWN.** Ryan, 2026-10-19: the street's racks and shared screens, keeping the leaf for every cam, with a screen in each gallery so that putting a cam up never means scrolling back to the top of the room. `make-jungle.py` writes each gallery's screen (`jr-<slug>`, nothing of its own on it, shipped hidden, a low gap in the leaves until a cam goes up), its now-showing line and way back, and the gallery's cams as a `<details>` that ships open, an *Up on the screen* button under every leaf and none on a door; it refuses the room without `rack.js`. **The cards keep their full-size leaves**: a small leaf beside its words was tried the same morning for a shorter rack, and Ryan found the picture too small to watch. The friendly edits are that smaller card again, and one screen for the whole room, which is the scroll back to the top.

**THE THIRD GREEN THING ON THE STREET, AND THE FIELD IS THE ONE TO WATCH.** The Campgrounds is
night-blue under nothing: a bare field, sky still on it, posts standing alone on open ground,
lettering routed flat like a park sign. The Jungle Room is night-green under a **roof**: light
arriving only where the leaves let it, nothing standing alone because everything overlaps
something, and a face whose strokes swell as they turn. You are outside in one and inside the
other. "They are both green, so they should feel the same" is the subroom excuse in a poncho.

**THE PUNK CLUB DOES NOT STROBE AND THAT IS THE ROOM'S WHOLE POINT, NOT A GAP IN IT.** Club Chronic
(§20) has no ambient layer at any setting. It looks like the campgrounds' rule and it is a
different one: the field is still because quiet is what it is *for*; this room is still because
**the one obvious ambient effect a punk club has can cause seizures.** A room whose argument is
*come in as you are* cannot have a light in it that puts somebody on the floor. The room states
this on its own door policy so nobody "finishes" it later. **Do not add a flicker, a flash, a
strobe or a pulsing bulb**, at MAX or anywhere else.

**AND IT SAYS A LOUD ROOM IS AN ACCESS BARRIER**, in the room, about itself. That sentence is load
bearing: this site is a Disabled people's organisation writing about a scene built out of volume,
crowding and stairs, and the version that celebrates the gig without naming who cannot get into it
is the inspiration framing we exist to refuse.

**THE ZINE TABLE IS THE ROOM THIS COLLAPSES INTO.** Both punk, both photocopied, both paper. The
zine is **one sheet you hold**, cut with scissors, scattered at angles, and the page IS the paper.
The club is **a hundred rectangles pasted onto a black wall**, flat, overlapping, layered like
sediment — and its marker is written OVER the paper rather than being it. Condensed display face
because a flyer crams a bill onto one sheet; typewriter and handwriting belong to the zine. If a
change makes the club's paper start behaving like the zine's page, it is wrong.

**THE RACK'S SELECTION IS STAR STUFF'S AND THE NOTES ARE OURS, DELIBERATELY BOTH.** The six racks
come from *It Take a Joyful Sound*; every note in our room was written for our room. Copying that
page's prose would make an argument a reader can only follow by having read the other site — the
same reason `make-readings.py` refuses to lift the glossary. **Credit the selection loudly, link
the essay, write your own words.**

**AND `make-club.py` HOLDS BOTH HALVES OF THE RUNTIME RULE AT ONCE**, which nothing here had needed
before: it **requires** a runtime on every song and **refuses** one on either playlist. A song has
a length; a list somebody keeps adding to does not, and today's total is wrong next week and
authoritative meanwhile. Do not "fix" the inconsistency — it is `make-den.py` and `make-jungle.py`
in one file, and both promises are the same promise.

**THE STAGE DROPS THE NEEDLE SOMEWHERE RANDOM AND THE ROOM REFUSES THE WORD SHUFFLE.** Ryan asked
whether the playlist could be set to shuffle; it cannot, and that was measured rather than
remembered. `shuffle=1` is inert, `index=` is inert on both the `videoseries` and the
`listType=playlist` form, and **only `/embed/<id>?list=` moves the starting point**, which then
plays on in order. **The first pass of that measurement read the posters and would have reported
`index=` as working** — the poster is the playlist's first entry whatever the player then does — so
all of it was re-checked with muted autoplay. That is the Playhouse's 0×0 iframe again: the DOM was
right and the screen was wrong. **The friendly edit is to call it shuffle anyway**, and the second
one is to reach for the IFrame Player API's `setShuffle`, which needs YouTube's own script and
therefore a `script-src` loosening on the one site whose whole mechanism is not reaching a third
party until somebody presses. Neither.

**AND THE ONLY LEVER TAKES AN ID, SO THAT FILE MIRRORS SOMEBODY ELSE'S LIST AND THE MIRROR DRIFTS
BY DESIGN.** A song added to the playlist cannot be picked until somebody runs `pull-club.py`
again; a song removed becomes a start point the list no longer has. Neither is visible on the page
and `pull-club.py --check` is the only thing that sees either — the cost was stated before it was
paid and it is Ryan's call, 2026-09-22. **The obvious continuation token is the wrong one**: a
playlist page carries two, and the video list's — the only one that pages the songs — is buried
inside a `commandExecutorCommand` while the section list's sits at the tidy, obvious path. Taking
the obvious one mirrored a hundred rows of nearly four hundred **and reported success**, because a
short list is not an error anywhere. **A START POINT IS A VIDEO RATHER THAN A POSITION**, which is
why repeats are dropped: nine of those songs really are in the playlist twice, each with its own
`setVideoId`, and `/embed/<id>?list=` opens at the first occurrence whichever one you meant. **And
`club.js` builds nothing** — it rewrites `data-embed-src` before the press reaches the document, so
`love-embed.js` stays the only thing on this site that builds a frame. Its listener is in the
capture phase on the document and the builder's is in the bubble phase, which is what makes the
order reliable rather than a race between script tags; make it a bubble listener and it breaks
silently. **It was on the button until the rack took the YouTube deck as its screen
(2026-09-29)**: `rack.js` puts the plate back as new markup, a listener on the old button does not
come with it, and the press after a record came off the stage played from the top. It fails back to
the top of the list, never to nothing.

**AND THE THIRD DECK ON THAT STAGE IS A DOOR, BECAUSE QOBUZ PUBLISHES NO EMBED.** This is the
purest version of *playing is not the same permission as embedding* the street has met, because
**the frame works**: no `X-Frame-Options`, no `frame-ancestors`, nothing for any checker here to
catch. What renders is a catalogue teaser — a TRY FOR FREE button, the cover mosaic, one *Listen on
Qobuz* button, and a track list whose rows are plain text with **no play control on any of them** —
and Qobuz's own share dialog offers no embed code, which is as close to an authoritative answer as
that question has. A link dressed as a window promises the one action it cannot do, so it is shaped
like a door: **no aspect ratio**, because a 16:9 plate *is* the shape of a player, and dashed where
every facade in that room is solid. The Jungle Room gives its link-outs 16/9 only because they
stand in a grid of screens and must line up with them; a stage has no such grid. **No origin was
added and the CSP did not move**, because nothing frames it — and nothing reaches Qobuz until
somebody follows the link, which is a stronger promise than the facade makes rather than a weaker
one. **Do not "finish" it into an embed**; the embed is what was tried first.

**AND THE DECK BESIDE IT IS THE SAME LESSON WITH THE OPPOSITE ANSWER, WRITTEN BY THE SERVICE.**
Apple Music publishes an embed, so it is a screen — and Apple states both permissions itself, on two
hosts: `music.apple.com`, where the playlist actually lives and the address anybody will hand you,
refuses every frame with **both** `X-Frame-Options: DENY` and `frame-ancestors 'none'`, while
`embed.music.apple.com` omits `frame-ancestors` entirely. **The host a person browses is the one
that refuses; the embed host is the one to frame**, and handing this site the browsing URL would
produce a blank box with the reason only in a console. Signed out it plays **ninety-second
previews** — measured across three songs by three artists, all reporting 1:30, because real songs do
not all happen to be ninety seconds long — and the deck says so. **Its player is styled from the
container**, never the button, and takes no aspect ratio: Apple's is 450px of artwork, transport and
scrolling list, and 16:9 crops the list off. **It also loads slowly**, showing a grey placeholder
with a music glyph for about ten seconds before it initialises; that is Apple's loading state and
not a fault to fix.

**ADDING IT COST A COPY OF THE ORIGINS LIST RATHER THAN ADDING ONE.** `make-club.py` held its own
two-item tuple, commented as three places on purpose, and it **would have refused a deck the browser
was perfectly willing to frame**. It reads `love-embed.js` now like `make-csp.py` and
`make-sweetgrass.py`. The rule is unchanged and is now true in one more file: **adding a service is
one edit in that array and a re-run of `make-csp.py`**, and never a hand edit to `_headers`.

**TIDAL IS THE SIXTH FRAMED ORIGIN, AND APPLE'S SPLIT AGAIN.** Ryan, 2026-10-10, for the records in
Kristina Brooke's Words, Bud, Beats. `tidal.com` sends `frame-ancestors 'self'`; `embed.tidal.com`
refuses nothing, so the embed host is the one in `ORIGINS`. **Signed out it plays a preview of no
fixed length**: a minute of one song, thirty seconds of two others (measured), then a Sign up screen.
So a TIDAL button says *preview* and never a number, the importer refuses one that does not, and Now
Playing repeats it. It played under the street's real headers, which delegate it neither `autoplay`
nor `encrypted-media`, so it is two presses, as Spotify and Apple are. Its player loads Datadog in
one session in ten, which the privacy page says. **The street uses its square layout**
(`?layout=gridify`), because the strip layout's times run into each other at a record sleeve's
width, and the button carries `data-embed-shape="square"`, which `love-embed.js` turns into
`facade--square` on the shell: the rule that a button's classes do not survive the press, solved
once in §4 rather than in every room. **Only a track becomes a player**, because an album or a
playlist has no runtime. `check-jukebox.py` asks the embed page, which answers 404 for a track that
has gone and carries the full length in seconds, and fails a button whose runtime disagrees. **The
local test that counts sends the real headers**: the dev server sends none, so it was served from
`_headers` by a scratch server before anything was believed.

**THE CHAPPELL HAS A CHANCEL NOW, AND IT IS WHERE THE RUNTIME RULE MET A ROOM BUILT ON THE OPPOSITE
PROMISE.** That room's consent banner said *every button says how long the thing is before you press
it* — the sentence the whole room is organised around, because a twenty-three minute concert sits
beside three-minute videos. A playlist cannot say how long, so adding one **made a published
sentence false**, and the banner was rewritten to say which kind of button does which rather than
the playlist being given a number. `make-chappell.py` now **requires** a runtime on every track and
**refuses** one on the playlist, which is the pair of rules `make-club.py` already holds, arriving
in a room whose whole organising promise is the half it has to break.
**The share card said it too**, and that is the trap worth remembering: `make-og.py` builds the card
from **`og:description`**, not from `<meta name="description">`, and the two sit one line apart — the
first fix landed on the wrong tag and looked like it had worked. **No random start here**, Ryan's
call: thirteen videos were put in an order, and opening in the middle of a running order somebody
chose would be overruling them, where a five-hundred-track list nobody finishes is a different case.
**And it is a chancel rather than a fourteenth niche** — same ground, gold, serif and glass, so it
measures nothing new; size and solitude are what make it the east end. If it ever takes a colour of
its own, this room has started having two of everything.

**THE DANCEFLOOR HAS DECKS, AND ONE OF THEM FAILED FOR A REASON NOTHING HERE CAN SEE.** Pink Pony
Club's jukebox is ten single tracks off our own published page; the decks are whole playlists off
our own channel, put on and left running. Queercore's embed rendered YouTube's *Video unavailable*
plate, because **the playlist's position 1 was a dead video** — its own page hid it among thirteen
unavailable entries and the embed did not. Diagnosed with a control rather than assumed: the plain
embed failed twice, the same playlist started at its first *visible* video played, a second playlist
framed identically played, and the first five visible videos all answered OK and `playableInEmbed`
true, so **the order was the fault and not the videos**. It was **not** worked around by storing a
good starting id — that id drifts, and it would have hidden a playlist still opening on a dead video
for anybody reaching it on YouTube. It was held, nothing rendered, and Ryan removed the dead entry
the same day; re-checked the same way, header 83→82 and hidden 13→12, and it plays. **The episode
stays in `data/jukebox.json` because the lesson has no other home: a playlist can be perfectly
healthy and still fail to embed because of what sits at the top of it**, and nothing in this repo
can see it — `love-embed.js` only checks the origin, and `check-jukebox.py` says in its own source
that a playlist is not one video. **`held` is the Jungle Room's dark cam on a dancefloor**, and
`make-jukebox.py` refuses a hold with no reason and a tray with everything held.

**AND THAT ROOM WAS DESCRIBING THE CHAPPELL'S OLD PROMISE.** It said *every button in there says how
long the thing runs before you press it* — true until the chancel, whose whole point is that it
cannot say. **Nothing caught it, because it is a claim about one room living in another room's
copy**, and no generator owns that. **When a room's promise changes, look for the rooms that
describe it**: a subroom is written about by its parent, the campgrounds by its pitches, and none of
those sentences are in the tool that changed. **`mission.html` is the densest page of these**, and
no tool reads it: every aim names the room that keeps it and what that room promises, so a room
that changes its promise checks the Mission too. Broadside No. 2, the manifesto, makes the same
kind of claims about the whole street, and it proved the point the day it was written: sheet No. 1
had been saying every play button gives a runtime, which playlists and live cams cannot.

**EVERY FRAMED ORIGIN IS WRITTEN IN ONE PLACE: `love-embed.js`'s `ORIGINS` array.** The browser
gets it because `make-csp.py` reads that array and builds `frame-src` from it; the build refuses a
bad URL early because the room generators read the same array. **Adding a service is one edit
there and a re-run of `make-csp.py`.**

**IT USED TO BE THREE HAND-KEPT COPIES AND THE THIRD ONE WAS INVISIBLE.** The list lived in
`_headers`, in `love-embed.js`, and in a string literal inside `make-csp.py` — and `_headers`' CSP
line is *generated by that literal*. So adding videopress.com to `_headers` by hand looked right,
was confirmed in the file, and was put back by the next run of the tool, silently. **The dev
server serves no headers at all**, so the room worked locally and the live site refused the frame;
Ryan found it by pressing the button. **Never hand-edit a generated line** — and when something has
to agree in several places, make the others read it rather than restate it.

**THREE KINDS OF NAME IN `love.css` ARE LAST-WINS AND SILENT, and `check-classes.py` now refuses
all three.** A class claimed by two rooms. A section number used twice. **And a custom property
declared twice in one `:root`** — which shipped: the Hermitage took `--leaf` for its green and
`--sky` for its daylight, and both were already there (`--leaf` is The Chappell's *gold leaf*,
`--sky` is the pebbling shore's overcast), so a gold room rendered green and a grey sky rendered
blue in two rooms nobody had reason to reopen. The identical collision had already been caught in
the contrast checker's own Python and fixed only there, because Python fails loudly and CSS does
not fail at all. **When a name collides, look for the same collision in every file that holds
names.**

**`check-contrast.py` IS A LIST OF PAIRS SOMEBODY WROTE DOWN. `check-contrast-live.py` IS THE
PAGE.** The second exists because the first was blind three times, and every one was found by a
person looking rather than by a tool: a link colour nobody ever *decided*, so there was no pair
to hold; a decided colour that **lost the cascade** to a rule written before the component had
a second child; and three bean-bag hexes that had never rendered at all. Same shape every time
— **the colour that renders is not the colour that was written down** — and nothing that reads
a stylesheet as text can see any of it. The new tool renders every page and walks every piece
of text against the ground it actually sits on, which is what `check-gentle.py` already does
for motion.

**IT IS NOT A REPLACEMENT AND MUST NOT BECOME ONE.** The pair list is the record of what
somebody looked at and decided, with the reasoning beside each entry, and it holds what the
renderer cannot see: the ambient composites (the rose window, the mirrorball, the scanline are
fixed layers *behind* the content and are not in the DOM path), ornament that carries no text,
and any colour no page renders yet. **The renderer declines rather than guesses**: about a
sixth of this site's text stands on a `linear-gradient` with no background-colour under it —
the Doomscroll's newsprint, The Den's shag — and its first run reported 222 pieces of pale text
as near-black on near-black by falling through to the body. Unmeasurable is a different answer
from failing. **Both tools, or neither.**

**IT FOUND THE SKIP LINK IN TWENTY-ONE ROOMS ON ITS FIRST GOOD RUN.** `.skip` carries its own
yellow ground and its own near-black ink at (0,1,0), and every room sets `.room-x a` at (0,2,0)
— so the first control a keyboard user meets took each room's link colour on a yellow box:
1.26 in the chapel, 1.10 in the arcade, **1.00 on every plain room**. Nobody had ever seen it,
because it sits at `left:-9999px` until focus and nobody screenshots a focused skip link. It
carries `!important` now for the reason §2's `[hidden]` guard does: shared furniture that every
room out-specifies by accident, in rooms nobody is thinking about.

**AND A DEAD DECLARATION IS NOT HARMLESS WHEN SOMETHING ELSE IS CHECKING AGAINST IT.**
`--bag-1/2/3` sat in `:root` referenced by nothing, because the Hermitage's chairs take their
colour inline out of `data/hermitage.json` and `.bag` reads `var(--bag)`, singular. The pair
list had been testing those dead values — lighter than the page's by a long way — so every run
passed while two chairs were under the bar. **When a colour lives in a data file, the pair must
be read from the data file.**

**EVERY COLOUR IN `:root` IS MEASURED OR NAMED WITH A REASON**, and `check-contrast.py` refuses
otherwise. Ornament that carries no text and is not required to understand anything is exempt via
`ORNAMENT`, **with its measurement written into the entry** — the stained glass at 1.75–2.46, the
campground's post at 1.48, Helen's shelf plank at 1.38, each one a decision somebody can find
rather than an oversight. A flat colour nothing ever appears on goes in `VIA_COMPOSITE` instead,
because the composite above it is the stricter test. **Do not add a colour to either list to make
the tool quiet**; the lists are the record of what was looked at.

**AND A RENAME IS STILL SCOPED — THIS WAS THE THIRD TIME.** Fixing the `--leaf` collision, a
file-wide replace in `make-og.py` rewrote The Chappell's card and the shore's card, which use those
names legitimately. Reverted. The rule is in this file twice now because writing it down did not
stop it happening: **rename inside the section that owns the name, then check every other use.**

**`[hidden]` LOSES TO ANY CLASS THAT SETS `display`, AND NOTHING WARNS.** The browser's rule is
specificity (0,1,0), which every ordinary class rule ties with and then wins by coming later in
`love.css`. A script switching an element off does nothing, the script looks broken, and the
stylesheet is the one lying. **It happened three times in the Hermitage's campfire** — the way-out
link, the play button, and then the entire off panel, which sat beside a running video announcing
that the set was off. The first two were patched one selector at a time, which is precisely why the
third survived. **The guard is `[hidden] { display: none !important; }` in §2 and it is global.** Do
not patch this per component again.

**AND STATE THAT IS ONLY WRITTEN ON ONE PATH WILL BE FOUND WRONG ON THE OTHER.** The same panel was
updated only by the code that does *not* play, so retuning while the set was on left it naming the
previous programme. What it says is derived from the tuned channel on both paths now. When two code
paths can reach the same piece of UI, render it from the state rather than writing it on the way
past.

**ONE SHARED SET, AND TUNING IS NOT PLAYING.** The Hermitage's campfire (§19) is a room — rug,
three chairs, coffee table, one television — and the set keeps two things apart that a dial invites
you to merge. **While it is off, previous and next are silent**: the screen names the channel and
its runtime and nothing is fetched, so the whole listing can be walked without a request leaving
the page. **Once it is playing, tuning changes the picture**, because by then the visitor has asked
for a television. Do not "simplify" that into one behaviour in either direction: always-silent
means pressing play twelve times, and always-playing breaks the street's oldest promise. **And the
dial names the channel it is about to tune to AND how long that one runs** — a next button that
only says "next" is the one place this design can quietly stop saying how long before the press.
**The channel that cannot be embedded is in the running order and not skipped**, and reaching it
turns the screen into a door.

**A FACADE IS TWO ELEMENTS AND A CLASS ON THE BUTTON DOES NOT SURVIVE THE PRESS.** `love-embed.js`
replaces the `<button>` with `<div class="facade">` and *that is the whole class list* — anything
the button was wearing is gone. So **the pressed state has to be styled from the container**, which
is what the Pebble Board already does (`.pb-card .facade iframe`, §21). Swaying Sweetgrass did it
the other way and shipped two faults in one press: the portrait clip came out landscape and
letterboxed because its class had evaporated, and — worse — **the fire's players rendered at 0×0
while the audio played**, because `align-items: flex-start` on that column stopped the *div* from
stretching and the iframe inside is absolutely positioned, so it contributes no size. Ryan found
the second one by pressing a button. Two rules follow: **default a facade's container to stretch
and let the BUTTON opt out** (`button.facade`, never `.facade`), and **do not fix this by carrying
the button's classes over in `love-embed.js`** — `.pb-play` is button chrome and would leak
`display: flex` and `border: 0` onto a room you are not working on.

**AND "THE IFRAME EXISTS" IS NOT THE CHECK.** Both faults passed an inspection that confirmed one
press produced one iframe at the right URL with the right referrer policy, because that is a
question about the DOM and this is a question about paint. **Measure the rendered box**: a player
whose shell is 0×0, or whose ratio is upside down, is a page that looks like it worked.

**love-embed.js IS THE ONLY PLACE THAT BUILDS A YOUTUBE IFRAME, and it is exposed on purpose.**
The set retunes, which the press-to-play plate never had to do, but two copies of those attributes
is one copy that gets a `referrerpolicy` fixed and one that does not, silently, in the
security-relevant half of that file. One builder, two callers. Do not inline a second one.

**AND IT IS THE ONLY THING THAT TALKS TO A PLAYER, WITHOUT YOUTUBE'S SCRIPT.** Ryan, 2026-09-28,
for watch-togethers: `@34:12` in a CB message is a button that moves the film on the reader's own
page there. `frameUrl` adds `enablejsapi=1&origin=` to every youtube-nocookie frame, and the
player answers postMessage from the page: `listening` gets its time, state, title and
`isLive` back, and `seekTo` moves it. **That is the IFrame Player API's own protocol spoken
from our side, so `www.youtube.com/iframe_api` is never loaded and `script-src` does not move.**
Measured before it was built, in a frame on the dev server. `loveEmbed.where()` and `seek()`
use the film that is playing, or else the one that played last. `seek()` skips live videos,
and so does `where()` unless asked `where({ live: true })`, which only Add my spot and Host this
film ask (Ryan, 2026-10-17, reversing "they skip live cameras" so a screening of a live video can
be announced): **a live spot is `@live in “the video” at #the-room`, a live beacon says `live`
with no place or length, Catch up beside it gets the play button ready, and there is no Follow**,
because nothing in a live video can be kept in step. They **never press play**: a jump moves your place, and whether it plays stays yours. Nothing
moves anybody's film but their own press. **Add my spot writes `@34:12 in “the film” at
#the-room`, and a stamp that names a room or a film moves nothing anywhere else.** A bare stamp
dropped from one room used to move whatever was playing in another. Ryan found that by trying it
from several rooms. `cb.js` reads what each stamp names off the whole message before
`streetLinks` splits it round addresses and #tags, so `isStamp` must stay the one test both
passes share. **The room's link carries the spot as `#spot=2052&film=…`**, which is a fragment
and never reaches any server. On arrival `arrive()` in `cb.js` finds that film's own play button
by title prefix. **So do Follow, Catch up and a pressed @time now, through one `readyFilm()`** (Ryan,
2026-09-29, after people pressed Follow, missed the sentence and hunted a rack of lookalike titles):
it opens the rack, sets the start, scrolls the button into view, puts the keyboard on it and marks it
(`data-cb-ready`, a `currentColor` ring in §4 only where the browser shows no `:focus-visible`), and
if the radio covers it, makes the radio Small for now and lifts the film clear. **On a rack card
whose screen button is shown, the keyboard goes on that button instead** (`screenButtonFor`; Ryan,
2026-10-17: Enter played the film small in its card, and people then put it on the screen too and
had it playing twice), with the start still on the card's play button, where `rack.js` reads it,
and `rack.js` now plays a card's film in one place at a time. **A host's beacon
carries the video's id** (`where().id`, `cleanVideo` in `lib.mjs`), which finds the button exactly;
a stamp in a message still matches by title. The radio's answer line sits under the readout now,
not under the message box, and an answer to something under Watching together (Catch up, Follow, Host
this film, Screen a video) sits under that part (`tellFilm`), except while the radio is Small, which shows
only the channel. Our facades name the film and then its channel. It sets `data-embed-start`,
opens any `<details>` round it, focuses it, and says so on the radio, and **it presses nothing**.
`withStart()` in `love-embed.js` turns that into YouTube's `start=`, so the building stays in that
file, **on a single video, or a list whose address names the film it opens on** (`/embed/<id>?list=`):
`start=` on `/embed/videoseries` lands that far into whichever film comes first, and a mix is refused. A film with no button of its own gets a sentence saying what to do instead, never a guess.
The Picture House's big-screen button reads the start off its own card's play button, and
`cb.js` knows nothing about big screens. A room with a second way to play a film does the same:
read `data-embed-start` from the facade beside it, and pass it through `loveEmbed.withStart`.

**A HOST'S BEACON IS THE CB'S, AND IT IS SENT FROM INSIDE `listen()` AND NOWHERE ELSE.** Host
this film (`setHosting` in `cb.js`) keeps no timer of its own. `hostTick` runs on each listen and
posts to `/cb/beacon` only when the film plays, pauses, jumps more than three seconds or changes,
or `BEAT` has passed. So "closed is off" holds without a second rule: folding drops the hosting
and sends nothing, and the beacon goes quiet. `netlify/cb/lib.mjs` keeps every beacon in one blob
(`beacons`) with the boards' conditional write, one per room, **replaced and never appended**. A
beacon not heard for `BEACON_FRESH` is shown to nobody and dropped by the next write, and
`lib.test.mjs` races fifteen hosts like the boards. **`/cb/channel` returns every beacon and the
server's clock**, so the radio finds its own room's host without saying where it is. Do not
"optimise" that into a `?room=` on the listen: it would tell us where every listener is, every
four seconds. **The hosts list is not a live region, and it updates rows in place**, because
redrawing every four seconds threw the keyboard off Catch up. **It is Hosting now, under Watching together**,
not in the readout, where a host's line under the messages read as the newest message (Ryan, 2026-10-19).

**A SONG IN AN ALBUM IS A FILM IN A LIST, AND FOLLOW KEEPS PACE WITH THE LIST.** Helen hosted the Coltrane
and Hartman album at the Hermitage, 2026-10-20, Ryan followed, and his stopped at the end of every song:
each song is a film of its own, Follow took every new one for a film to get ready, and for a moderator's
hosting `plateFor` puts that one song on the page's first screen alone, the television there, where it ends. **The beacon carries the
list now** (`list`, `cleanList` in `lib.mjs`, never a mix, since each listener's `RD…` is their own), and
`love-embed.js`'s `where()` gives the list, its ids, the place in it, `paused` and `ended`. A song apart at
the turn, the one behind gets there by itself (`atTurn`); anywhere else, `loveEmbed.toEntry` moves the list
with YouTube's own `loadPlaylist` or `cuePlaylist`, film and place in one message; before anything has
started, `readyFilm` puts `data-embed-entry` on the list's own button and the press opens
`/embed/<film>?list=` at the place. **A list turning is believed only once the film the player names is the
one at the place it says it is at** (`TURN` in `love-embed.js`): measured on the live site, it names the next
place at once and goes on giving the last film's title, clock at 0:00, for about half a second, so a host's
beacon sent then told everybody the album had gone back to the start. Nothing is sent or judged while
`turning`. **Only a pause (`paused`) ends Follow now**: a film that ended first waits for the host, and a
next film that would not start is played, said once if it still will not. The friendly edit is to let
`plateFor` take a list's song "because the host is a moderator"; that is the fault this fixed. **A list's
address is written by its room's generator, never by `frame()`, so it must carry `autoplay=1` there**
(`&rel=0` as `frame()` has it): without it YouTube only cues the list (playerState 5) and the visitor presses
play again inside the player, which the Hermitage's records, Club Chronic, Pink Pony Club, the Chappell and
the Lagoon did until 2026-10-20, measured with and without it under the real headers.

**A MODERATOR CAN SCREEN A VIDEO WITH NO CARD FOR IT, AND EVERYBODY ELSE GETS ITS PLATE, NEVER THE
FILM.** Ryan, 2026-10-04, for screening in a room without building a rack first. **Screen a video** on
the radio shows to the base on a page with a `[data-rack-screen]`; `videoOf` in `cb.js` keeps only the id
and a `t=`, `loveEmbed.frame` builds the frame, and `loveRack.put` in `rack.js` puts it on the page's
**first** screen the way a card's second press does, way back included. It sends nothing. Hosting it is the
ordinary beacon, which now carries `length`. On a follower's page `readyFilm` finds no button for that id
and `plateFor` puts an unpressed `button.facade` on their first screen saying how long it runs and who put
it up, so nothing reaches YouTube until they press it. **The plate is only for a beacon whose `base` the
server set from the pass.** A beacon's `video` is whatever its sender says, so do not widen that to every
host: it would let anybody signed on put any video on somebody's screen. **A set you tune takes one
too** (2026-10-05): the Hermitage's television, Looming Rocks' stage and the rave's big screen each write
`window.loveSet` in their own file and their own words (`hermitage.js`, `looming.js`, `rave.js`), because
those files are separate on purpose; keep them that way rather than sharing one. On every set a moderator's
video plays because they pressed, a follower's set goes dark with the video tuned on its own panel and its
own play button has the keyboard, and the set's controls are the way back. The Hermitage and Looming Rocks
tune their own channel or act when the video is one of theirs. **The rave always cues it alone**, because a
mix cannot start at a place in its first video (`withStart` refuses a mix) and a follower must start where
the host is; its cue says the video may flash, and the warning above that screen says a CB video may flash
too, keeping the clause `make-rave.py` reads. `firstScreen` in `cb.js` puts a rack's screen and a set
behind one face (`play`, `ready`, `back`). And
`arrive()` runs from `tuneIn` once the radio exists: run from `start()`, it met a null radio on every page
where `call.js` had to load first, and a spot's room link did nothing there.

**EVERY ROOM HAS A CHANNEL, AND ONLY THAT ONE TELLS US WHERE ANYBODY IS.** Ryan, 2026-09-28: the
radio tunes to World (the `channel` blob, as it always was) or to this room (`room-talk-<tag>`, the
same log as each place on the Slake). `readTuned` / `updateTuned` in `lib.mjs` pick the blob,
and listen, transmit and moderate each take an optional room. World sends no room at all, and it is
where a radio starts. **A room listen waits for `cb-rooms.json`**, because the 404 answers every
address, and its first build sent `?room=no-such-room` before the list said it was no room. The
server only checks a tag's shape, so a tag that is no room is a channel nobody can reach, swept once
its 48 hours are up. The choice is remembered in `love-cb` as `band`. A room with a promise about sending
nothing already sets `data-cb="off"`, so no new opt-out is needed.

**A ROOM'S CALL IS 8x8's JITSI AS A SERVICE, AND THE CB IS THE ONLY WAY IN.** Ryan, 2026-09-28:
one call per room, the base as the only moderator, and recording and transcription for the base
only. JaaS lets nobody join without an RS256 token signed with our private key
(`CB_JAAS_KID`, `CB_JAAS_KEY` in Netlify), and `callToken` in `lib.mjs` signs one for one handle
and one room (`stimpunks-<tag>`, never `*`). **It is the only thing on the site given the
camera, the microphone or a shared screen.** `Permissions-Policy` in `_headers` names `8x8.vc`
for those three, **and `self`, which it must**: a browser hands a frame only what its page
already has, so the first version, which left `self` out on purpose, ran every call in Chrome
with no camera, no microphone and no screen (Jitsi's "user denied permission", no prompt ever
shown; measured 2026-10-07, fixed the same day). `self` is the door, not a permission any page of
ours uses. `make-csp.py` refuses the header if it delegates to an origin `ORIGINS` does not
frame, or gives the three to anything but `self` and `CALL` in `love-embed.js`, which is also
the one allow list carrying them, **and refuses any script we serve that calls `getUserMedia` or
`getDisplayMedia`**, which is where the promise that no page of ours asks lives now. **A
permission the frame needs has to be on the page first**: the other features in that header
without `self` (autoplay, encrypted-media, picture-in-picture, accelerometer) are off inside
every frame too, measured the same day, and YouTube plays after one press regardless. **The frame is built by
`love-embed.js`, which `cb.js` loads on the first press if the page lacks it**: do not build a
second iframe in `cb.js`. The window is not the radio, so folding the radio leaves the call up;
leaving the page hangs up. Every call arrives muted on Jitsi's pre-join screen. That screen asks
the browser for the devices so it can show a preview, and that is 8x8's, not a fault. **EVERY CAVENDISH DOOR OPENS A ROOM OF ITS OWN, AND `make-coworking.py` WRITES THEM.** Ryan,
2026-09-28: Proton goes, and every door and suite in `data/coworking.json` has a `page`, which is a
room, and the tool writes its generated parts, meaning its words, light list or norms, call
panel and credits, from the same data the door is built from. Each room dresses those parts in its
own §-section under its own `prefix`, the job marker's rule: shared markup shape, no shared look.
`callroom.js` finds a call panel by its `data-call*` attributes and decides between signed on,
guest and CB-only. The tool reads which rooms are public from `PUBLIC_CALLS` in `lib.mjs`, and
refuses a door with no room, any Proton link, a room with no way back through its door, and a
call panel naming another room. **The Events Room (§71) is a lighthouse's watch room lit by one
column from the hatch, the Operations Room (§72) is a plant room under one caged lamp whose
cage stripes everything, the Editorial Room (§73) is a light table in a dark studio, the proofs
lit from beneath and the only light there is, the Watering Hole (§74) is a pan in the Namib at
noon, every shadow straight under its thing, the Campfire (§75) is a fire in a clearing at night,
the one room lit from its own centre, every shadow pointing away, and the Cave (§76) is a tunnel in
glacier ice, lit by nothing in it, the daylight coming through the ice itself as blue**; each one's collisions are in its section. A room's generated list
items take the word in `item`, so the markup says light or entry and not a shared name. **A
suite's rack is built from its `rack` entry**: cams by id out of `data/jungle.json`, never
restated, refused if dark, link-only or given a runtime, and videos with their own measured
runtime, or read by key from the room that owns them (`videos_from`, as the Campfire reads the fire
pit's fires). `check-jukebox.py` checks the videos and leaves the cams to the Jungle Room. Every room behind one house must be its
own world, and the next one to be tempted to match its neighbour is the one to stop.

**BE SEEN HERE IS THE SLAKE'S SWITCH IN EVERY ROOM, AND WHO IS IN A CALL COMES FROM 8x8.** Ryan,
2026-09-29, after requests for presence, especially before joining a call. `beSeen` / `unseen` in
`lib.mjs` are the Slake's record in another drawer (`room-here/<tag>/<visit>.<time>.<role>.<handle>`),
asked by `/cb/here` from inside `listen()` and nowhere else, and **it was one switch both ways**: a
radio that is not seen was told nothing, until Who's online (below). **Handles only, alphabetical, and no number** (Ryan's call:
the no-headcount rule holds). **Remembered in `love-cb` as `seen`** once pressed, which reverses the
Slake's never-remembered rule for rooms only, Ryan's call. **Who is in a room's call is JaaS's
participant webhook** (`/cb/call-events`, `callEvent`), so it is everybody in it, guests included,
Ryan's call over showing only the people who chose to be seen; it is shown only to a radio seen in
that room, and `roomAllows()` guards both halves in the base's rooms. The webhook needs
`CB_JAAS_EVENTS_SECRET` (the endpoint's secret as the console shows it, `whsec_` and all) and
refuses everything without a good `X-Jaas-Signature`; `jaasSigned` is tested against 8x8's own
worked example. It keeps a name, a moderator flag, a time and a hashed id per person and **never the
email 8x8 sends**. **The call line only appears once the server says 8x8 is telling it
(`callHeard`)**, so an empty list is never a guess. The public calls' notice says a guest's name is
shown, because it is generated in `make-coworking.py`. **The room's own call panel says who is in the call
too**, in a `[data-call-who]` line both generators write, hidden until `cb.js` fills it from the same
answer under the same rule; the room dresses it, and a guest with no radio never sees it. **The call window has the same line**, under its bar and
above 8x8's Join button, which we cannot write into: `call.js` builds it hidden and exposes it as
`loveCall.whoLine(tag)`, and never asks for the list itself.

**WHO'S ONLINE IS BE SEEN HERE, STREET-WIDE, AND IT REVERSED TWO RULES ON PURPOSE.** Ryan,
2026-10-07: "Folks are wanting to know who's around and are having a hard time connecting right now."
A **Who's online** button beside World and This room lists everybody seen in a room, with their rooms,
for **anybody signed on, seen or not** (`whoSeen` in `lib.mjs`, `/cb/online`). That reverses the rule
above that a radio not seen is told nothing, and the CB's refusal of a list of who is on; both were
Ryan's calls, and so is this one, chosen over listing only people who opted in. **It also widened what
Be seen here means for everybody who had already pressed it**, which is why the privacy page says so
in as many words and the switch's own line says it puts you on the list. What it keeps: **only people
who pressed Be seen here**; **names alphabetical and no number** (that rule was not reversed);
**CLAIMED from the pass**, as a `.acct` mark in the seen record's key, because an unclaimed handle is
anybody's; a room the asker may not enter left out, and somebody seen only there on nobody else's
list; nothing stored for it and nothing recording who looked. It is asked only from `listen()` while
its panel is open, and the panel is not a live region and keeps the keyboard on its link. **@ in the
Teleport matches parts of handles from the same list**, client-side, so the letters are never sent;
that handling sits outside the search block `check-teleport.py` keeps identical. **Let people find
me lived for one afternoon** (a claimed-only, symmetric, whole-name search) and was taken out when
this arrived: two switches meaning nearly the same thing is worse than one. A `.find` key from that
afternoon still parses as claimed, so a leftover is swept. **The Slake keeps its own rule**: its
switch only ever said "out here", and nothing on it joins this list.

**WHO'S ONLINE ALSO NAMES EVERY ROOM WHOSE CALL HAS SOMEBODY IN IT, AND ONLY THE ROOM.** Ryan,
2026-10-13, after user testing, with **a name on the list opening that person's profile** (the peek a
handle on the channel opens, drawn under the list). `callsOn` in `lib.mjs` reads the call records under
`whoSeen`'s rules (`roomAllows`, never a quiet room) and `/cb/online` sends the tags with `callHeard`, so
an empty list is never a guess. **The friendly edit is to put the names in**, so people can see who is
in a call before they walk over; who is in a call is still shown only in its room, to radios seen there,
and widening that is Ryan's call, written in `privacy.html#calls` first. No number either.

**A CHAT STATUS SAYS WHETHER SOMEBODY WANTS TO BE TALKED TO, AND BE SEEN HERE STAYS WHAT IT IS.** Ryan's ask,
2026-10-24, after Discord's Online, Idle, Do Not Disturb and Invisible: Be seen here is already Online and Invisible, a
room at a time, so the radio did not grow Discord's selector. What it grew is the interaction badges, **come say hi** (a
green circle), **people i know** (a yellow triangle) and **not right now** (a red square), in the Cavendish Space
Project's cards' own words, which are CC0: chosen at the foot of Who's around (`chatMake` in `cb.js`), kept in one blob,
`chat-status`, holding each claimed person's pet key and badge and nothing about when (`setChatStatus` in `lib.mjs`,
`/cb/chat-status`), and shown beside a claimed name on Who's online and Also seen here (`withChatStatus`), under the name
on a profile, and at the top of a conversation before anybody writes; your own rides back on `/cb/unread`, so it needs no
request of its own. **It is a sign and never a lock**, and **it starts as none**. `tools/check-chat-status.py` holds the
cards' words, no default, no time, no idle and no lock. **The friendly edits are an Idle worked out from a quiet
keyboard, a status that runs out, a default of come say hi, refusing messages to somebody red, and red holding
your own notifications as Do Not Disturb does** (Ryan's call, the same day, keeping them separate): the first two
publish somebody's attention, the third chooses for them, and the fourth turns a sign into a lock, which the cards say it
is not (somebody red may still come to you, and you can answer); the fifth is the notification switches' job, device by
device. **Its first deploy named the picker `chatMake` and its redraw `chatShown`**, which were the chat page's own
Channels list: the later assignment won silently and /chat lost its channels until the rename (`chatStatusMake` and
the rest), so `check-ids.py` now refuses a method assigned twice in any script. `DECISIONS.md` has what is open.

**FOLLOWING A LINK NO LONGER HANGS UP YOUR CALL.** Ryan's ask and choice, 2026-10-24: every room is a page and a page
that goes takes its call, so a #tag on the channel hung up the call you were in. **While a call is open in the page,
anything in the radio that would leave it opens in a new tab and says so** (`callUp`, `leavesPage`, `goPage` and
`tabTold` in `cb.js`: a link anywhere in the radio's shadow root, the teleporter, Take to the forums, and from the radio's
own window the page it came from), and the guest bar's teleporter does the same for a guest; **every other way off the
page asks the browser's Leave site? first** (`guarding` in `call.js`, listened for only between a call opening in a page
and its leaving, never in the call's own window, because a page that listens for leaving is kept out of the
back-forward cache). A link that stays on the page is not leaving. `tools/check-call-links.py` holds it, and refuses a
`location.href` in `cb.js` outside `goPage` and a `beforeunload` anywhere but `call.js`. **The friendly edit is a new tab
for every link "to be safe"**, which piles up tabs, each with its own radio, for everybody never in a call, and leaves
the room's own links and Back still hanging up.

**THE WORLD CALL IS THE WORLD ROOM'S CALL.** Ryan, 2026-10-13: **Join World call**,
under Who's around, opens one call for the whole street from any page, for anybody signed on and never a
guest. `WORLD_CALL` in `lib.mjs` is the name (`stimpunks-world` at 8x8), `cb.js` keeps a copy, and
`make-sitemap.py` refuses the two if they differ. **Since 2026-10-18 `world.html` is the World room and its
own call is the World call on purpose** (below); until then the tool refused that page. Its window is `call.js`'s one window (`loveCall.openRoom()` says which call is in it),
so each radio button asks after its own call. **Who is in it is shown only to people seen in the World
room**, as any room's call is shown to people seen there; nobody else is shown before they join. **In a page it does not follow you between rooms**: every room is a page, and a page that goes takes its
call window with it. The friendly edit is to rejoin by itself on the next page, which drops you out and
back in on every move and opens a call nobody pressed for.

**THE WORLD ROOM IS EVERY ROOM IN A LIST, AND ITS CHANNEL AND CALL ARE THE WORLD'S.** Ryan's brief and
calls, 2026-10-18. `world.html` hangs off the Garden, past its spider (§119): knowledge gardens and our garden
spider, webs connecting gardens around the world, Ryan's look after a first draft as a 1996 web directory. The
spider's web is strung between every room, each room a garden on it, lit by a dawn arriving level from one edge
along the silk, with no ground; its collisions are in §119, and **the Garden is the one to watch**: midday,
light down through leaves onto beds in the ground. **The spider is the Garden's, drawn in this room's inks, and
says nothing here**, because in the Garden it is the careful guide to `/ask/`. **The web and the gardens are
`tools/make-world.py`'s**, the web between `world:web` markers from a fixed seed (the card lifts it), the gardens
between `world:directory` markers, from `cb-rooms.json` (names, order, never a quiet
room), each page's own og:description, and the part of the Map it stands on, read off `map.html` (a room behind
a room the Map does not draw takes its parent's part, from `data/map.json`), so a new room or area needs no edit
here; it runs after `make-sitemap.py`, and a part of the Map it does not know stops the build. **What is live is
`world.js` asking `/cb/world`** (`worldIndex` in `lib.mjs`) every half minute while the page is in front: who is
seen in each room (Who's online's rules), whether its call has somebody in it and never who, and the time of
each channel's latest message today, never its words, which is the one new thing it shows and
`privacy.html#world` says so. **MOST ACTIVE REVERSES THE NO-HEADCOUNT RULE FOR THIS ONE ORDER**, Ryan's call:
the server counts the people seen in each room and in its call (somebody in both once) and sends `busiest`, an
order, never the numbers; the Mission says it is the one place the street counts people. **The friendly edits
are a number of people beside a room, a number of rooms active, and a visitor counter**, and `make-world.py`
refuses each; it also refuses `world.js` storing anything but `love-world` (the reader's filter and order). **Its own
channel is World and its own call is the World call**: `worldHere()` in `cb.js` tunes the radio there to World
and hides This room and Join this room's call, `readTuned`/`updateTuned` read and write a room named
`WORLD_CALL` as World's channel, and `make-sitemap.py` holds the page (`data-world`), `cb.js` and `lib.mjs` to
each other. The search index skips the directory (`www-dir`), as it skips the Map's model.

**A CALL FOLLOWS YOU BY GOING INTO A WINDOW OF ITS OWN.** Ryan, 2026-10-13: **Pop out** on a signed-on
call's window opens `call-window.html` in a browser window, which asks for the call afresh (you join again:
a frame cannot move between windows) and holds it while you walk the street in the first. **It is a
window, not a room** (`tools/windows.py`): no sitemap, card, job marker or sign-off, each tool saying why,
and every other check holds it like a page; never `data-unlisted`, because the radio has to name it.
`call.js` holds the whole of it: which call is in the fragment, so it never reaches a server, and the
window and every radio talk over one `BroadcastChannel` (`love-call`) and nothing else: the window says
which call it holds, a radio asks when it starts, and Leave from a radio asks the window to hang up and
close. **Still one call at a time**: a second Pop out replaces the first in the same named window, and
joining a call in a page hangs up the windowed one. **Show the call window** finds it with `window.open('',
name)`, which loads nothing, and closes the blank window a browser makes when there is none. The window
has no radio (`data-cb="off"`), so no who-is-in-the-call line. The browser pane in this app opens a pop-up
in the same tab, so test the two sides in two tabs there, or in a real browser.

**THE RADIO IS IN PARTS, EACH UNDER A REAL HEADING** (Ryan, 2026-10-13, after people could not tell where
they were), **and since 2026-10-23 the channel comes straight after where you are** (Ryan's order, after Who's
around, Unreads and Events had pushed it too far down): Where you are (the room's name in the largest words on
the radio, `hereShown`, and nothing else), Channel, Messages, In this channel (On the channel as, Be seen here,
Bring my familiar, the room's call and what is on now, under the heading the chat page uses), Who's around,
Unreads, Events, Watching together (only there while something in it is, `filmShown`), You (Profile, Account,
their trays and Sign off, Ryan's asks of 2026-10-19 after losing where an open Profile began) and Your radio.
The chat page keeps its own arrangement, with its channels down the left and no Where you are.
**PROFILE'S SECTIONS START FOLDED, AND EACH IS READ ONLY WHEN IT IS OPENED** (Ryan's choice, 2026-10-19,
over a table of contents): `pfSection` makes each heading an h3 holding a button with `aria-expanded`,
`pfOpen` runs that section's loader, `setPets` reloads only the open ones, and anything outside a section
that would reload it asks `pfShown` first, so a folded section costs no request. **A new Profile section
is a `pfSection` with its loader**, never a heading appended straight to the tray. Which are open is not
kept anywhere.
**ACCOUNT IS WHAT YOU ARE SIGNED ON AS, PROFILE IS WHAT YOU SHOW** (Ryan's ask, 2026-10-19): Your username
(claiming, the password, recovery, Delete my account) and Forget me left Profile for the Account tray
(`setAccount`, `acctPanel`), and every sentence that said claim it above or in Profile says under Account,
in `cb.js`, `forum.js`, `quest.js`, the booths, the shelters, the Community Center's claiming steps, the
moderators' room, the privacy page, the guide and `data/quests.json`. A new line about claiming says
Account.
**A long tray ends in its own Close** (`footClose`: Profile, Account, Themes, Notifications, the stickers and Your
messages), which closes it and puts the view and the keyboard back on the button that opened it; a tray
drawn afresh on each opening (stickers, the Notifications body) draws its foot again too. `part()` in
`cb.js` makes them, and `cb-guide.html#parts` lists them in order: **a new control goes into the part it
belongs to, and a new part is a row in that table.** The headings are `h2`s in the shadow root, so a
screen reader moves between them; Small shows none of them. Do not flatten it back into one column to
save height.

**A call's window and the `Mover` live in `call.js`, not `cb.js`**, because a public room's guest
must never download the radio. `cb.js` loads `call.js` before it builds the radio. `call.js` reads
the `love-cb` pass and never writes it. `/cb/call` signs a guest token, never a moderator, only for
`PUBLIC_CALLS` in `lib.mjs`, and only under a name the guest typed. `/cb/call-settings` is JaaS's
SETTINGS_PROVISIONING webhook: it answers lobby on, `WAIT_FOR_APPROVAL`, for exactly those rooms.
It does nothing until it is registered in the JaaS console, and until then a guest walks straight
in. **The radio and the call move with one `Mover`** in `call.js`: drag the bar, or Move plus the
arrows, with Home back to the corner. Do not give either window its own copy. Anything that changes
a window's size places it again at once, as well as through the `ResizeObserver`, because a hidden
tab never delivers that. **Everybody in a call may share a file** (`'file-upload': true` in `callToken`, guests included; Ryan's call, 2026-09-29): it goes to 8x8 and never to us, and the privacy page says 8x8 publishes no retention for it. **Downloading one needs `blob:` in `frame-src`**: Jitsi saves a file through a `blob:` link inside its frame, Firefox and Safari check that against our page's `frame-src`, and without it the download was refused without a word while Chrome, which does not ask, saved it. It is in `make-csp.py` beside its reason; it admits no origin. **THE CB'S CHANNEL TAKES PICTURES, AND THEY ARE THE CHANNEL'S, NOT THE STREET'S** (Ryan, 2026-09-29): none of the street's photograph rules apply, because they never go onto a page. What does apply: a picture is part of its message and is deleted when the message goes (`droppedImages` in transmit and moderate, `sweepImages` hourly, an unsent upload within the hour); `redraw()` in `cb.js` re-encodes it on a canvas before it leaves the browser, and `putImage` refuses a file still carrying Exif, XMP, a Photoshop/IPTC block or PNG text chunks, because GPS in a photo from home is the sender's address; **WebKit's canvas writes an Exif and a Photoshop block of its own** (every iPhone browser and Safari: the server refused every iPhone picture until 2026-10-18), so `bare()` keeps only the blocks a JPEG needs to be drawn, measured in a WKWebView; it has no public URL (fetched from `/cb/image` with the pass, shown as a `blob:`, which is the one thing `img-src` adds); and it is bound to its room by `roomAllows`. A description is offered and never required. SVG is refused, because it can carry script. **Shared video in a call is Jitsi's `!disableThirdPartyRequests` and nothing else**, so that
switch must stay off. It also gates analytics, gravatar and Giphy, and `callSrc` turns those off
by name; all four keys are on Jitsi's `configWhitelist`, and a key that isn't there does nothing
from an address. **8x8's
own pages answer scripts with 429**, so check them in a browser. **Netlify's box turned the first real key's line breaks
into spaces**, and Node refuses a PEM like that (`ERR_OSSL_UNSUPPORTED`). The function threw, and
the radio could only say the call could not be opened. `tidyPem` rebuilds any pasted key from its
armour and base64, and a key that still cannot be read switches calls off rather than leaving a
button that fails. Check a key's *shape* with `netlify env:get` piped into a script that prints
counts, never the key. **Follow the host exists, and it is each viewer's
switch** (Ryan, 2026-09-28, after Jitsi's shared video turned out to give only the host a
volume). `followTick` in `cb.js` plays, pauses and moves the reader's own film to the host's,
from beacons the radio already hears, and **the reader's own pause or play ends it**. That is
what keeps breaks possible. Do not make it start by itself, remember it, or let a host switch it
on for anybody. A host whose jumps move everybody who did not ask is forced sync, and still
Ryan's call. The Follow button wears `.cb-catch` for its look, so the click handler asks for
`.cb-follow` first; asked the other way round, Follow was a Catch up.

**EVERY OBJECT IN THAT SCENE IS CARRIED BY ITS OUTLINE.** The bright chairs each measured under 2.3
against the rug — a chair you cannot pick out of the carpet, which is the Jungle Room's canopy
arriving as upholstery — so the outline is measured against the rug on one side and the fill on the
other. The television is the one exception; it separates from the rug by itself. **And the coffee
table carries no text at all**: body copy on that wood is 3.29 dark and 4.20 pale, under the bar
both ways, so the sentence lives on the page and only self-grounding controls sit on the wood.

**A RENAME IS SCOPED TO A SECTION, NEVER TO THE FILE.** `check-classes.py` refused `.telly`,
`.dials` and `.tuner` in turn, all of them The Latibulum's — and the repair, run across the whole
stylesheet, rewrote the burrow's own selectors and left its page wearing a class with no rule
anywhere. **That is the one thing that tool deliberately does not check**, so nothing said a word.
Restore from the last commit rather than patching a bad patch.

**AND THE SECTION NUMBERS ARE LOAD-BEARING.** This room was added as §20 when §20 was already
Print, sitting between §18 and §19, so every cross-reference by number had two places to land and
the refusal messages read "§20 and §20" like a display bug. `check-classes.py` refuses a duplicate
or out-of-order number now. A new room goes before the cross-cutting sections at the end **and
renumbers them**.

**A HERBARIUM IS WHERE A GUESS LOOKS MOST LIKE A DETERMINATION, WHICH IS WHY NOTHING ON IT IS
NAMED TO SPECIES.** The Hermitage's workshop (§19) presses nine sheets and not one carries a Latin
binomial. A sheet's one claim to authority is its name, so a binomial typed from memory reads as
*determined* when it was guessed — the exact fabrication this site spends a page arguing against,
in the format most likely to be believed. **The check that enforces it was rewritten after it
leaked:** a list of Latin endings missed *Taraxacum officinale*, then two more after widening, and
each widening moved it closer to firing on ordinary prose. **The shape is the check now** — one
capitalised word plus one lowercase word is refused unless the second word is in `PLAIN` — which
catches every binomial rather than the anticipated ones. Add to `PLAIN` on purpose when a name like
*fern frond* arrives; do not go back to guessing at suffixes. **And there is no sunflower sheet**,
although sunflowers grow outside that door: we have no page about them, so there is nothing to
press, and the table says so out loud rather than quietly including one.

**EACH BENCH REFUSES SOMETHING DIFFERENT, AND THE THIRD ONE REFUSES A DESTINATION.** A herbarium
sheet with no page of ours is a plant somebody liked. A solar item with no runtime breaks the
room's own promise. **And an entry on the Star Stuff table whose link does not point at
starstuff.earth is refused**, because a bench with somebody's name on it holding something else is
a mis-filed thing that reads as a claim. Three of the herbarium's sheets cite pieces on that third
table, which is what a workshop with three benches in one room is *for*.

**OUR PAGES NAME AUTHORS FAR MORE OFTEN THAN THEY LINK BOOKS**, and that is now a known trap in
this repo: two ids in `data/hermitage.json` — *Care Work* and Griffith's *Electrify* — had to be
resolved against Open Library's search because our own pages cite the work without ever linking
the edition. The first time, the id was written from memory and pointed at a different book. **When
a title has no link in the mirror, resolve it and record that you did**; do not fill the gap from
memory because the rest of the file is sourced.

**THE FIRST DAYLIT ROOM IS THE ONE THAT CANNOT BE DARKENED.** The Solarpunk Hermitage (§19) is
Ryan's pitch and the only world here lit by morning. Every other room is a dark ground with light
applied to it; this is a lit ground with things standing in it, and **a cabin that runs on the sun
and reads as midnight is an argument against itself.** The instinct to bring it into line with the
street's night palette is the harmonising instinct with a better disguise than usual, because
every neighbour really is dark. It also makes the campground's own promise work twice in opposite
directions: out of the cold dusk into a lit tent at pitch 01, and out of the same dusk into full
sun at pitch 03.

**AND THE CAVE INSIDE IT IS THE FOURTH WARM ENCLOSED ROOM ON THIS STREET.** After the Faery Yurt,
The Latibulum and The Den — so *"it is a cosy reading nook, it should feel like the other cosy
places"* is the Latibulum argument arriving a **second** time, which is exactly when it stops
sounding wrong. Three things keep it apart and all three are structural:

  · the other three are each lit by **one flickering source in the dark**. This is **evenly lit at
    reading brightness**, which is what the panels on the roof are *for*, and the candles are
    ornaments on a room that does not need them.
  · the other three are canvas, earth and panelling. This is **textile** — heavy curtain, no wood,
    no carpentry, no straight edge in it but the shelves.
  · you reach the others out of the cold. **You reach this one out of full daylight, and it is
    darker than where you came from.**

**THE THREE ZONES ARE DAVID THORNBURG'S AND ARE NAMED AS HIS.** Cave, campfire and watering hole
are the primordial learning spaces from *From the Campfire to the Holodeck*, documented on our own
glossary. Taking a framework's shape without its author's name is precisely the failure this site
keeps attribution for. **There is a fourth, Life**, and the room says out loud that it is not in
there — it is the door you came in by. The pitch's argument is **Betsy Selvam's**: lone wolfing is
being alone *well* rather than being left out, and she is credited by name rather than folded into
our "we", like Helen.

**THE SHELF REQUIRES A BORROW LINK AND DOES NOT REQUIRE A BUY LINK.** `make-hermitage.py` refuses a
book without one. Our library page says knowledge is infrastructure and access to it is mutual aid;
a shelf that could only tell you where to *buy* would be a shop with an argument painted on it. Every
title is one stimpunks.org already argues from, and carries the citing page, read out of the mirror's
frontmatter. **One id in that file was assembled from memory and pointed at a different book** — in
the file whose own header forbids exactly that — so every link in it has now been requested and
answered, and the episode is written into the data rather than quietly fixed.

**AND ITS CAMPFIRE REFUSES A DOC WITHOUT A RUNTIME, WHICH IS make-jungle.py INVERTED ON PURPOSE.**
A live camera has no length to give; a film does. Same promise, opposite check, and **they must not
be made to agree.** One of Ryan's twelve plays and cannot be embedded, so it is a **door rather than
a screen** and is shaped like one — a link dressed as a window is the broken thing, because the one
action it promises is the one it cannot do.

**THE LAPTOP FRAMES THIS SITE INSIDE THIS SITE, AND THAT COST A SECURITY HEADER.** `frame-ancestors`
was `'none'`, which forbids this site being framed by **anybody, itself included**; it is `'self'`
now and `X-Frame-Options` is `SAMEORIGIN`. Protection against every other origin is unchanged and
this is the only loosening in the policy — do not widen it further. The frame **still waits to be
pressed**, for a different reason than the jukebox facades: nothing third-party is involved, but a
copy of the street loading itself unasked is a second dial under the first, every font twice, and a
screen reader walking the whole site again. **And it refuses to nest** — `hermitage.js` says *one
screen is enough* when it finds itself already in a frame, because the third laptop is not a joke,
it is a page that will not stop loading.

**A SIGN IS NOT THE ROOM IT POINTS AT, AND THE CAMPGROUND'S BOARD IS WHERE THAT GETS TESTED.**
Each taken pitch carries a small drawing — the Faery Yurt sat against the trees, the Solarpunk
Hermitage on its wheels. **They are the FIELD's drawings and not the pitches'**, which is the only
reason two of them may sit on one board without this area growing the house style it exists to
refuse: both are drawn in the field's inks — spruce and bark masses, moss for every line, **weight
rather than tint carrying the hierarchy** — because you are looking at them across cold ground at
night. What separates them is **one lit colour each, doing opposite things**: the yurt *emits*
(candle out of the crown, out of the doorway, onto the grass; round, soft, strung with lights) and
the hermitage *catches* (nothing glows but one window, the moon on its panels, three sunflowers, an
aerial). **And that window is a SCREEN rather than a flame**, because lone wolfing is choosing the
reach rather than being unreachable — a candle there would have been a nicer picture and a
different idea. Draw the next pitch the same way and **do not give it either of those two lights;
they are taken.** An open plot gets no drawing at all: what is pitched is what you can see from
here. Nothing in any of them moves at any setting, the yurt's own twinkling lights included —
this is the field's picture of the tent and not the tent.

**EVERY HOME ON THE CAMPGROUNDS NAMES ITS NEIGHBOURS, AND THE BOARD IS THE LIST.** Helen Edgar's ask,
2026-10-17, with Jess's Bough House at pitch 05 (§117): `tools/make-neighbours.py` reads the campgrounds' board and
writes, between `neighbours` markers in every pitch whose sign names a person rather than Stimpunks, a line linking
every other such home by its name and whose it is. A new person's pitch on the board is a new name on every
neighbour's line on the next run of `check-all.sh`; the tool refuses a home without the markers and markers on a page
that is not one. **Do not keep the list by hand**, which is how somebody gets left off. It is a convention, so it is a
plain paragraph in the room's own ink. **Between pitches 01, 05 and 03 is a pond** (`li.glade`, not a pitch, so the
map, the card and this tool do not read it): swing seats, a pet playground and pebble paths to all three doors, every
pitch staying where it stands, Helen's call. The Hermitage stays furthest from the street; moving it onto the bank is
Ryan's call. **The Bough House is the only room up off the ground**: dark words on silvered planks against an autumn
sky, so it is not one more brown warm room beside the yurt, and its sign's light on the board is the fifth, the last
sun still on the top of the tree.

**THE EMERGENT FUTURE WORLDS MEETS MOUNTAIN MAN IS DAVID'S, AT THE SUMMIT OVER THE FIELD, AND IT IS THE
FIRST HOME OFF THE MAIN CAMPSITE.** Helen Edgar's relay of David's brief, 2026-10-18 (§118,
`the-mountain-cabin.html`, `tools/make-mountain-cabin.py`, `mountain-man.js`): a log cabin on a mountain with a
lake through the windows, which open onto his photographs; a fire; a lounge; warm and cosy meets smart-home
modern, LED strips that change colour, a big screen and speakers with his playlist on it; an oil diffuser; one
switch for all of it; one wolf inside and the pack outside under a full moon, with a button to hear them; coffee
and cups; crisps, sweets and Skittles; then geothermal like Ryan's hermitage is solar, a hot spring outside, a
cable car up so Ryan, Helen and Jess can visit, and wolves outside. **The board carries it as a pitch in the summit
state** (`pitch--summit`, first on the board, `pitch__no` THE SUMMIT): `make-map.py` draws a state it reads as a
peak over the field, `make-neighbours.py` reads it as a home like any other, and the card and the poster read the
sign like every pitch's. **The light is the visitor's to choose, and that is what holds it off every warm room**:
the fire is behind the glass of a modern stove and is not what lights the room, the walls are lit by strips in a
colour the visitor picks, and the page's ground is the blue-charcoal of a smart home at night, never brown; the
brief said it must not become the yurt with a lake, and the ground is where that is kept. The window is the cold
half, a lake under a full moon with the pack on the warm ground, which no other interior has. **Nothing moves
before the switch is pressed and §118 holds no keyframe, animation or transition**: the fire's sway, the wisps and
the colour drift are the script's, after a press, at Regular and MAX, still at Gentle with the words the same;
the drift runs only at MAX, only asked, three seconds a colour, round the cabin's four colours and the whole rainbow, and
nothing flashes. The diffuser's seven oils are Helen's list, named on the page and in the script's `SCENTS`, which the tool
holds together, and no scent is ever said to do anything. **The howl is arithmetic**,
three oscillator voices under `MAX_GAIN`, which the tool refuses above 0.2, no recording and nothing fetched.
**The photographs go up only with their records** in `data/polaroids.json` (on_wall false, `elsewhere` naming the
page), and until then the window says it is waiting for David's pictures; the tool refuses an id with no record or
no file, and never fills the window from anywhere else. **He is credited as David Gray-Hammond, he/they**, as Helen passed on, and the
rainbow sweets are named once as Skittles with Mars Wrigley's mark in the liner notes. **The spring is water and
the tool refuses the cure** (Stay Frosty's rule, warm); **the wolves are the mountain's and the tool refuses a
threat**, and nobody counts, feeds or names them. On the board its light is the sixth, FAR: one lit window so high
it sits among the stars, the strips' colour and not a flame's. A seventh pitch needs a seventh light.

**AND A PITCH CAN BE TAKEN WITH NOTHING BEHIND IT.** `.pitch--raising` is a solid post, a sign, a
drawing and no link. A campground has that state and a website usually pretends it does not; the
alternative was publishing a room before it was a room. The drawing of Helen's yurt is **ours and
says so in the liner notes** — the field's sign for her pitch, which changes nothing on her page —
for the same reason the one colour of hers this repo changed is written down in four places.

**THE SIXTH FLAME-LIT-LOOKING ROOM, AND THE LIGHT IS NOT A FLAME.** Swaying Sweetgrass (§25) is
pitch 02: a meadow left alone, one accessible path, a clearing with a fire pit in it. By now
*"they are all warm, they should feel the same"* has arrived so many times — the Faery Yurt, The
Latibulum, The Den, the Hermitage's cave, The Mopery — that it stops sounding like tidying and
starts sounding like taste, and **this room has an actual fire in it**, which is the best cover
the argument has ever had. What keeps it out is physics rather than palette:

  · every one of those rooms is lit FROM INSIDE IT, and every object in them has a lit face and a
    shadow side. Here the sun is low, a hundred feet off and **behind** everything, so nothing has
    a lit face at all — the blades glow because the light is coming THROUGH them. Transmitted
    light, not reflected: that is why the greens go yellow and the ground stays dark, and the
    whole palette falls out of it.
  · those rooms are enclosed and full of furniture. **There is no furniture in a meadow.** The
    only built things are the path and the fire ring, and you go a long way through nothing.
  · those rooms are **brown**. This is green-gold, which is a different warmth entirely. If the
    greens in here ever go brown at the edges this has become the yurt with more grass in it.

**AND THE FIRE IS PAINTED IN THE ROOM'S OWN TWO GOLDS ON PURPOSE.** Giving the flame an orange of
its own would have made this a flame-lit room by the back door, after all that. It is a small
object in the middle distance that you walk to; it is not what the page is lit by. Do not give it
a colour nothing else in the room has.

**AND THE PIT HAS A REAL FIRE IN IT NOW, WHICH DOES NOT UNDO THAT.** Ryan, 2026-09-28: a
playlist of real campfires, on one plate the width of the clearing, the one press there with no
runtime (`make-sweetgrass.py` holds make-club.py's pair: required on every recording, refused on
the list, and it refuses a list that does not say what it `opens` on). **The plate is soil and
seed and shows no poster**, so the fire's orange only ever appears inside a frame somebody pressed
for. A poster, or a plate in a flame colour, would make this a flame-lit room by the back door.
The channel sells those videos for sleep and focus; the tool refuses that vocabulary in our note. **The fires in
that playlist are a rack under the plate** (2026-09-29, `rack.js`'s pattern): each burns where it
stands or goes up on the fire, each carries a runtime, and our notes on them are swept like the
fire's. They live in `hearth.fires` in `data/sweetgrass.json` and **the Campfire at Cavendish
Coworking reads them from there** (`videos_from`), because it says it takes its fires from this pit.
The plate rule is `.swg-glass button.facade`; aimed at the whole hearth it would make every card's
Play a 16:9 plate.

**IT IS ALSO THE FOURTH GREEN THING, and the Jungle Room is the one to watch.** That room is
night-green UNDER A ROOF: light falls down and lands in patches, and nothing stands alone because
everything overlaps something. This is open, and the light arrives sideways at eye level. You are
inside in one and outside in the other.

**A ROOM MAY REFUSE TO SERVE SOMETHING IT IS ALLOWED TO SERVE, AND THIS ONE DOES.** Ryan's brief
pointed at twenty-one chapters of *Braiding Sweetgrass* read aloud on YouTube. They are uploaded
by The Anarchist Audio Library and are an unauthorised reading of a book that is in copyright —
Milkweed, 2013, Kimmerer living, publishing, and narrating the real audiobook herself. **Every one
plays and every one embeds, so nothing in the machinery would have stopped them**: `love-embed.js`
only asks whether an id is well formed, `check-jukebox.py` only asks whether a video works. The
thing that stops them is the room's own argument — the honorable harvest, never take the first,
never take more than you need, ask — which a page cannot make while serving somebody's whole book
off its own surface. So they were **doors and not screens**, labelled as what they were, with a
borrow link beside them, and the fire itself is Kimmerer in her own voice on authorised channels.
Ryan's call, 2026-09-21, once the provenance was put to him: keep both. **YouTube stopped serving
every one of them by 2026-10-08, and on 2026-10-10 Ryan had them taken off quietly**: nothing on
the page says they were there and the changelog does not mention them (DECISIONS.md is the
record). What sits beside the book now is Google Play Books' preview of the authorised audiobook,
which Kimmerer narrates, as one press over the borrow link. `make-sweetgrass.py` **refuses a
`readings` list and anything on the uploader's channel** (`_refused_channel`), because the
friendly edit is a real one and it will arrive: somebody finds the book read aloud again
somewhere else and puts it back because the preview stops partway. **Do not put a
sentence on the page about the readings**; quiet was the call.

**THE 21-STRAND TEACHING IS SOMEBODY'S AND THE VIDEO DOES NOT SAY WHOSE.** Seven generations
behind, seven sacred laws, seven ahead. It was matched to its source rather than guessed at — the
transcript was opened and read against the words — and it is *Sweet Grass Teaching*, published by
Shawenim Abinoojii Inc., at 0:53, which was already in Ryan's own field-guide list. No name in the
description, none on the channel, none at the end. **So the page credits the organisation and says
out loud that the Elder is unnamed there**, which is the herbarium's refusal to guess at a
binomial applied to a person. Do not fill that gap from anywhere. **And `make-sweetgrass.py` counts
the bundles**: three of exactly seven, refused otherwise. That is the opposite of
`check-counts.py`'s rule and for the opposite reason — a count that belongs to somebody else is a
fact to protect, not a total that goes stale.

**NOTHING ON THAT PAGE TEACHES SWEETGRASS.** Six teachings from Indigenous organisations and
nations, Ryan's selection, each linked and credited with one line of ours saying what it is about.
No retelling, and nothing anywhere instructing anybody how to harvest, braid or burn it. That is
`make-readings.py`'s rule about the glossary, in a room where getting it wrong would be worse.

**AND THE ROOM CARRIES A CORRECTION TO OUR OWN GLOSSARY, near the top rather than in a footnote.**
Our Nature and Place-Based Education entries attribute *reciprocal ethical unity* to Barry Lopez
and he never wrote the phrase; Star Stuff's zine No. 72 read the essay. This room quotes from
those very pages, so it says so where somebody reading the quotations will see it. **When two of
our own pages disagree, the one that checked wins** — the otter cabinet's rule, arriving in a room
built out of the pages that were wrong.

**THREE OF ITS FOUR PASSAGES WERE CHECKED AND ONE COULD NOT BE, AND THE DIFFERENCE IS PUBLISHED.**
The sheaf, the braid of stories and "becoming indigenous to a place" are verbatim in the mirror.
The Cajete and goldenrod passage is on no page of ours and could not be confirmed against the book
from here — archive.org's search-inside unreachable, Google Books rate-limiting every attempt — so
it is published on Ryan's word and the liner notes say which is which. **Do not let an unchecked
quotation sit among checked ones looking identical.**

**RYAN'S OWN VIDEO IS IN THERE AND IT IS NOT SWEETGRASS.** Ten seconds of backlit bunchgrass in
his front yard, already published by us on the Nature entry under the line about immediate contact
with the outdoors — which is the argument, not a bolt-on: place-based means the ground you are
standing on rather than the sacred meadow somewhere else. **The plant is not named to species**,
for the herbarium's reason. VideoPress is the third origin this street will frame and it lives in
`love-embed.js`'s `ORIGINS` array, which `make-csp.py` and `make-sweetgrass.py` both read;
**adding a service is one edit there and a re-run of `make-csp.py`.**

**AND THE FIELD'S SIGN FOR IT NEEDED A THIRD KIND OF LIGHT.** The yurt *emits* and the hermitage
*catches*, and both are taken. This one is **carried**: fireflies low in the grass, many small
lights and no source you could point at. The fire is not drawn lit, because from the treeline the
grass is taller than the clearing and what you can see from there is what gets drawn — so the sign
shows the path going in and a thread of smoke. A fourth pitch needs a fourth light; three are gone. (Brew and Stew, pitch 04, took the fourth: grown, in the logs themselves.)

**THE FIRST COLD ENCLOSED ROOM, AND IT IS THE FIFTH WARM-LOOKING ONE.** The Mopery (§22) is a
dark academia library with candles the whole way along every top shelf, which makes it another
room on this street lit by flame — it joins the Faery Yurt, The Latibulum, The Den and the
Hermitage's cave. *"They are all candlelit, so they should feel the same"* is the Latibulum
argument arriving a **third** time, and by now it sounds like taste rather than tidying. What
keeps it apart is one physical fact, and it has to stay:

  · in every one of those the light **reaches the walls** — canvas, plaster, panelling and
    curtain all go amber. **Here the walls stay blue-black stone**, because that is what a candle
    actually does: it lights about a foot of a very large room. Cosy is what those rooms are.
    This is being let into a building after everybody has gone home. **If the greys in here ever
    warm up at the edges, this has become the yurt with a bigger bookshelf.**
  · the yurt sets Cormorant Garamond, which is high-contrast, clean and cut yesterday. This sets
    **IM Fell English, which was punched** — Fell's Oxford types with the ink spread and the
    battered counters left in. Two warm serif rooms kept apart at the stroke rather than at the
    palette, which is the only place it holds.

**AND ONE SCAN IS SHOWN WHILE ANOTHER IS ONLY POINTED AT, one line of metadata apart.** The
Library of Congress's facsimile of *The Raven* in Poe's hand carries **"reproduction prohibited
without permission"** along the foot of its own first leaf — a 1949 Yale exhibition printing —
and loc.gov answers a script with a bot check rather than with its rights statement, so that
notice is the only rights information anybody here has read. It is linked and **not copied**.
The 1865 Tyndale printing Ryan found is published by the Internet Archive under the **Public
Domain Mark 1.0**, so three of its leaves are in the room. The poem is free in both; the
*objects* are not the same object. **Do not copy the facsimile because the other scan was fine.**

**DORÉ'S PLATES ARE PLACED BY US AND THE PAGE SAYS SO.** The 1884 edition printed the poem
straight through and put the twenty-six engravings after it, each captioned with the lines it
illustrates; here each plate stands at the lines its own caption quotes. That is a reading
decision rather than a reproduction, so it is stated rather than left for a visitor to assume.
**And the captions are verbatim, including where they disagree with our text** — that edition
reads "'T is some visiter" and "Be that *word* our sign of parting" where ours does not, which
is how the mismatch was found in the first place. Two printings of one poem are not one text.
Do not "correct" a caption to match the poem underneath it.

**A DECK THAT ANSWERS IS THE ONE THING THAT ROOM CANNOT BECOME.** The Oracle Deck (§23) asks a
question on every card and `make-oracle.py` refuses one that does not end in a question mark,
plus the whole vocabulary of prediction. There are no reversals, no spread, no positions and no
reading of several cards together — **nothing that could be assembled into a statement about
somebody's life.** A deck on a Disabled people's site that told somebody how their life was
going to go would be doing the thing the rest of these pages exist to refuse, in the one room
dark enough to get away with it, and **it would arrive as a friendly edit from somebody who
thought a question was a bit thin.** It is the pebbling cabinet's refusal of a tally wearing a
cloak. The whole deck is face up on the page too: drawing moves a copy. Nothing is behind the
dice, because a room that made somebody gamble to reach its contents has put its contents behind
chance.

**AND THAT DECK MAKES ONE RIGHTS STATEMENT, WHICH IS WHY IT HAS ONE SOURCE.** Every plate is a
public domain work in the Metropolitan Museum's Open Access collection, released CC0, and the
tool refuses an object page anywhere else — make-hermitage.py's starstuff.earth rule. A deck
assembled out of thirteen different rights statements is a deck nobody can check. **CC0 asks for
nothing and every card names its artist anyway**, which is this street's habit rather than
anybody's requirement.

**THE DOOMSCROLL'S BAR IS PUBLIC DOMAIN *EVERYWHERE*, NOT IN THE UNITED STATES.** §24 refuses a
poem whose author has been dead seventy years or less, checked against the current year rather
than a date in the file. **It already cost the scroll its best opening item:** Eliot's *The
Hollow Men* is free in America and will not be in much of Europe until the 2030s, and a site
that serves everybody cannot publish a whole poem on a technicality that holds in one country.
*The Darkling Thrush* is off it for the other reason — Wikisource's page for it names no
printing and says so itself, and these poems differ between printings, so a text nobody can
trace is the one thing a scroll built out of dates cannot carry. **The date is when it went
public and not when it was written**, which for a third of that scroll is decades apart, and the
tool sorts on it rather than trusting the order in the file.

**AND THE ZINE TABLE IS THE ROOM THE SCROLL COLLAPSES INTO.** Both are ink on paper, which makes
this the closest call on the street. The zine is a **photocopy** — stark white, pure black, cut
with scissors, scattered at angles, and the page *is* the sheet. This is **foxed newsprint**,
warm and grey, one unbroken roll with nothing cut and nothing rotated, lying on a dark desk you
can see the edges of. The blackletter sets the masthead and **nothing else** — never a headline,
never a line of a poem, because eighteen lines of blackletter is an access failure wearing
atmosphere, and this is the room most likely to talk itself into one. If that paper ever goes
white, the two rooms have become one.

**ALL THREE POPUPS ARE CLONES OF MARKUP THAT IS ALREADY ON THE PAGE.** Not renderings of
`data-` attributes: one copy of every book's note and every poem's text in the document, so a
shelf cannot disagree with its own popup. With scripts off, each room's `<noscript>` unhides
them — the library becomes a catalogue and **the doomscroll becomes more itself**, a very long
scroll you keep going down. Do not "simplify" these back into data attributes.

**AND A COLOUR NOBODY CHOSE LEAVES NO TRACE FOR THE CONTRAST CHECKER TO FIND.** The Doomscroll
declared a link colour for its provenance line and nowhere else, so every other link on that
pale scroll fell through to the base stylesheet's `a` — a pink picked for a near-black street,
measuring about 2.4 on newsprint. `check-contrast.py` holds a pair for every colour somebody
**decided on**; an inherited one was never decided, so there was nothing to hold a pair for and
the run passed while a paragraph of links was illegible. **Ryan found it by looking at the
page.** A pale room on a dark street has to state its own link colour, at the room, rather than
on the components that happened to get one — which is the same shape of hole `[hidden]` left in
the Hermitage, patched per component three times before anybody moved it to §2.

**A DECORATIVE ROTATION IS INDISTINGUISHABLE FROM A TILT.** The deck's cut rule had a lozenge
made of a square turned 45°, and `check-gentle.py` reported it as decoration outranking
somebody's Gentle setting — correctly, because the computed matrix is all that tool can see. It
is clipped out of a square now. Same call `arcade.js` made when it moved its sprites with
`left`/`top` rather than `transform`: **when a tool can only see one thing, do not ask it to
take your word for something else.**

**A CLASS NAME IS GLOBAL AND A SECTION HEADER IS A COMMENT.** This is the structural hole under
the whole architecture, and it stayed open until The Latibulum fell in it: that room shipped four
names another room already had — `.scrawl` (the zine's margin hand), `.shelf` (the yurt's
bookshelf), `.knob` (the Arcade's speed control) and `.tagline` (the street's masthead). **Only
one was visible.** The burrow's trail line came out in Rock Salt, which is how anybody noticed;
the other three were silently inheriting a wood gradient, a button's border and `display: flex`
from rooms on the other side of the file. `check-classes.py` refuses a class claimed by two
rooms' sections and — the half that catches `.tagline`, where the stylesheet is innocent and the
markup is not — a page wearing a name another room claimed. **It found three leaks that predate
it**, including the Faery Yurt's tagline. When it refuses, rename the newcomer; do not settle it
with a longer selector, because two rooms sharing a name and deciding it by specificity is still
two rooms sharing a name.

**THE BURROW'S SHELF IS NOT A CHECKLIST AND MUST NOT BECOME ONE.** Stretch, flap, fidget,
meditate, stim dance, body scan, eat, drink, pee — lifted from our own Bodymind Break — and not
one of them is a button. The obvious improvement is to let somebody tick them off, and it would
put a scoreboard next to a bodymind break, which is the thing the break is a break from. It is
the pebbling cabinet's refusal of a tally arriving in a room with no game in it.

**AND THE WIRELESS IS NOT SELF-HOSTED, WHICH IS A DECISION RATHER THAN AN OVERSIGHT.** Adriel
Jeremiah Wool gave Stimpunks permission to use *Ocean Waves* however we like. It is still a
press-to-play facade, because a permission is not a reason to take a copy of somebody's
seventy-four-minute composition off its own shelf, and because "nothing musical is hosted here"
is a sentence this site says in three places. If Ryan wants it hosted, that is one file in
`audio/`, a rewired button, a changed sentence in README and llms.txt, and a licence note saying
the recording is Adriel's and carries no onward licence — a decision, not a detail. Ask first.

**THE ONE TIDY ROOM IS A COSTUME AND NOT A CONCESSION.** The Adventurer's Guild (§26) is a job
board: manila, printer's ink, hairline rules, ruled rows, a class in the margin, a stamp. Square
corners, no gradient, no shadow, nothing rotated, nothing overlapping. **It is the only room here
that is filed**, and that is the joke rather than a crack in the argument — a street whose whole
architecture is that nothing matches, with one room in it where somebody has put everything in
order. It is a bureaucracy, not a house style, and it cannot spread: the moment anywhere else
starts looking orderly the joke has become a system. **Do not let anything in that section grow a soft
edge**; the instant it does, the sheet has become a place, and the Hermitage already is one.

**IT IS THE SECOND DAYLIT ROOM AND THE SECOND PALE GROUND, AND BOTH NEIGHBOURS ARE ONE EDIT AWAY.**
The Solarpunk Hermitage has a **sun** in it — a direction, warmth, shadows falling away from it,
sunflowers at the door. The guild has **no light source at all**: it is lit the way a photocopy of
a document is lit, evenly, from nowhere, and nothing in it casts anything. The Doomscroll is **one
unbroken roll** of foxed grey newsprint with nothing cut and nothing ruled, lying on a dark desk;
the guild is manila and is **made of rules**. If that paper ever warms to grey, or anything in
there ever picks up a glow, two rooms have become one.

**AND A PALE ROOM DECLARES ITS OWN LINK COLOUR, AT THE ROOM.** `.room-guild a` exists because the
Doomscroll shipped without it the day before: that page declared a link colour for one line and
every other link fell through to the base stylesheet's `a`, a pink chosen for a near-black street,
at about 2.4 on paper — and `check-contrast.py` had nothing to hold a pair for, because an
inherited colour was never *decided*. Any pale room added here has to make that decision once,
where the room is, rather than on whichever components happened to get one.

**EVERY ROOM HAS A MARKER AND NO TWO MARKERS ARE ALIKE, WHICH IS THE WHOLE RULE ARRIVING THROUGH A
MECHANISM.** `make-guild.py` holds one drawing per room and **refuses a room it has no drawing
for** — make-og.py's refusal, for make-og.py's reason. The failure mode of guessing is not a
crash, it is one shared glyph appearing quietly in every room on the street, which is the
harmonising instinct arriving through plumbing. What *is* shared is the behaviour: `.quest*` lives
in §4 with `.facade`, because every page wears one and a name has to be global to do that, and
**the panel borrows the room's own ink and ground** rather than bringing colours with it, so
opening a marker can never introduce a pair nobody measured. Each drawing is held against the
floor it lies on at the **body-text threshold**, which is the Jungle Room's quills rule: WCAG does
not reach a graphic, and a marker you cannot pick out of the floor is a control you cannot use.
**The Playhouse is the one that lost to its own floor** — that room reaches for yellow and yellow
on its blue is 3.88, so the block is white at 5.08.

**THE MARKER IS A `<details>` AND THE WAY OUT OF A QUESTION IS ANOTHER ONE.** The code, the hints
and the "give me the answer" escape all work with scripts off; `quest.js` only adds the answer
box, which **ships hidden** so a page without JavaScript shows no dead control. **Do not
"simplify" the escape into a scripted panel** — it is the only thing on that board guaranteeing
nobody is stuck, and `check-quests.py` refuses an escape that is not a `<details>` for exactly
that reason. **Discreet means visually quiet and nothing else**: every marker is a full-size
target in the tab order with a real name on it, which is The Den's door rule. And **every marker
is on the floor of its room**, said out loud on the board, because a different depth in every room
would make finding one a test of eyesight and of a mouse rather than a walk between rooms.

**THE MARKER IS NEVER THE PLAY BUTTON, and the brief's own example starts from one.** Three
reasons, any one enough: `love-embed.js` replaces a pressed facade with a bare
`<div class="facade">`, so anything the button was wearing evaporates — the fault that shipped
Swaying Sweetgrass's players at 0×0; a play button that also does a second thing hands a popup to
somebody who only wanted the song; and gating a quest behind a press puts it behind consenting to
a third-party frame, which is the consent this street spends a mechanism protecting. So the George
Jones job is a spindle adapter on the den floor and its **question** is what makes you read the
tile.

**NOTHING ON THAT BOARD IS SCORED AND THE TOOL REFUSES THE VOCABULARY.** No total, no percentage,
no streak, no rank you climb, nothing that expires. **A job board is exactly the shape of thing
that grows a score**, and a score beside a walking tour of a Disabled people's site would quietly
turn a wander into a workload — the pebbling cabinet's refusal of a tally, arriving in the room
most likely to talk itself out of it, and it will arrive as a friendly edit from somebody who
thinks a board looks bare without a progress bar. **The difficulty class is how far you walk**,
enumerated in the tool and defined by geography, so it says nothing whatever about the person
doing it. **The first thing that check ever refused was a false positive** — "a book it points at"
is the verb — and the pattern was narrowed rather than excepted, which is check-counts.py's own
first-run lesson happening twice.

**BADGES ARE JOBS THAT GO TOGETHER, WORKED OUT EVERY TIME AND KEPT NOWHERE.** Ryan's call, 2026-10-14,
after requests for something like merit badges, Open Badges and achievements, "I don't want to gamify or
credentialize too much", and **it reverses the board's refusal of the word**: `make-guild.py` still refuses
badge and achievement in a JOB's own words, and sweeps a badge's for ranking, rarity, unlocking, counting and
credentials instead. A badge is `badges` in `data/quests.json` (`all` or `any` of its jobs), worked out from the
stamps by `quest.js` and from a Profile by `cb.js`, so there is nothing to count, rank or lose but the jobs.
**The friendly edits are a count of badges, a bar filling toward one, a rare or secret one, a badge for every
job, a badge beside a name on Who's online, and an Open Badges export**; each is the score this board refuses,
or the credential Ryan did not want. A badge stamps its done jobs the way the board does and never says how many
are left. **A posted badge never asks for more** (`asks_more()`, checked against `git show HEAD`), because
somebody who had it would lose it, so a new room goes into a new badge or none, and a `for` names its rooms
rather than saying every one of something. **No badge sends anybody to a room for resting in** (`REST` in
`make-guild.py`): rest is owed and a badge is earned. Each badge has its own drawing, paths only, so the radio
draws it from `guild-jobs.json` with `createElementNS`, never from markup. **The job markers never mention
badges**: they stand in every room, including the ones whose own tools refuse the word.

**TWO BADGES ARE THE SHELTERS', AND ONE OF THEM CAN NEVER BE PUBLIC.** Ryan, later on 2026-10-14: Rescue
Ranger for rescuing any animal, Pet Parent for adopting one (`from: rescues` and `from: pets`). Neither adds a
record. **Nothing on the street knows who rescued an animal**, which the shelters promise, so Rescue Ranger is
worked out from `love-rescues` in the rescuer's own browser (`rescuedHere()` in `quest.js` and in `cb.js`, read,
never written, never sent, refused by `make-guild.py` otherwise) and is shown on the board and in their own
Profile and nowhere else. **The friendly edit is to put it on the public profile**, which needs the server to
keep who rescued what: a reversal of a privacy promise and Ryan's call, not a badge's. Pet Parent comes from the
pets in a Profile: the board learns it as yes or no from its one `/cb/jobs` read, and somebody else's profile
shows it only when their pets are shown, because a profile's badges come only from what it already shows. **The
shelters' own pages never mention a badge**; `make-rescue.py` refuses the word there.

**PATCHES FOR THE BATTLE JACKET ARE EACH THEIR ROOM'S, AND ONE FUNCTION DRAWS THEM ALL.** Ryan's brief,
2026-10-14: patches scattered about the street and on counters in shops, sewn on a battle jacket kept and shown
in Profile, and sent as stickers. `data/patches.json` says what each is made of (paths and lines of text, in
millimetres, in its own room's inks by name and lettered in its room's face); `tools/make-patches.py` writes that
into `patches.js` and then **runs `patches.js` under Node to write each room's patch**, so a patch in its room,
on the jacket and on a sticker is one string from one function. Never hand-edit between `patch:<id>` markers or
`patches:data` / `patch:ids`. **A new patch is an entry in the data, a pair of `patch:<id>` markers in its room**
(outside that room's own generated markers), and a run. The tool holds lettering to 4.5 against its patch,
refuses a colour or a face `love.css` does not declare, words that run off the patch, two patches alike, and a
price, count or rarity: **a patch in a shop says it is free to take**, because nothing here is for sale but the
honesty box, and a collection that tells you how much of it you are missing is a tally. **`love.js` loads
`patches.js` on a page with a patch**, so no room's own script list changes. **The jacket is the fourth thing kept
under a person** (`patches/<pet key>`, which patches, sorted, nothing about when; nothing lists a patch's takers),
taken only by a patch's own button, signed on; Forget me and deleting the username take every patch off, and
**Show my battle jacket on the CB** is claimed only. The jacket sews them on in the street's order, and if they
will not fit, every patch shrinks by the same amount. **The friendly edits are a count ("4 of 7 patches"), a
limited patch, and a patch for sale**; each is refused, and the first is the Mission's progress bar.
**The whole jacket is a sticker too** (Ryan, 2026-10-16): `jacketSticker` in `lib.mjs` copies which patches
are sewn on when it is sent, so a sent jacket never changes, and it is refused with nothing sewn on.
**Download in Profile is `saveDrawing` in `cb.js`**, for avatars, pets, badges, patches and the jacket: it
copies the drawing on screen with every computed colour written in and its typefaces put inside it as
`data:` URLs, then draws it to a PNG, falling back to the SVG where a browser will not. Measured under the
real headers: `font-src 'self'` does not reach a face inside an SVG drawn as an image, so **do not add
`data:` to `font-src`** for it, and do not send a drawing to a server to be rendered.

**THE JOBS ARE THE THIRD THING KEPT UNDER A PERSON, AND ONLY ONCE SOMEBODY SWITCHES IT ON.** Keep my jobs in my
Profile, on the board, ships hidden, shows only on a page with a pass in `love-cb`, and starts off; `quest.js`
reads `love-cb` and never writes it, and sends to `/cb/jobs` and nowhere else, which `make-guild.py` reads the
file for. The record is `jobs/<pet key>`: **which jobs, sorted, and nothing about when**, because a list of times
is a record of somebody's days; `keepJobs` writing anything else is refused, and every id is checked against
`QUEST_IDS`, which `make-guild.py` writes between `quest:ids` markers in `lib.mjs` (never hand-edit them).
Switching it off, Forget me and deleting the username delete it; **Show my jobs on the CB** is claimed only,
the pets' rule. The board asks `/cb/jobs` once on arrival when signed on, to know whether keeping is on, and
`DECISIONS.md` leaves open whether that should wait for a press. The filter (Every job, Not done, Done) hides
rows and never says how many.

**PROFILE CARDS ARE THE FIFTH THING KEPT UNDER A PERSON, AND WHATEVER IS FILLED IN IS SHOWN.** Ryan, 2026-10-17,
after requests for profiles more like Discord's. Pressing a handle on the channel or a name on Who's online opens a
`<dialog>` (`peek()` in `cb.js`, `.pf-*` in `cb.css`): the card on the left, drawn by `profile.js`, and on the right,
where Discord has Board, Activity and Wishlist, tabs (the ARIA pattern) for Avatars, Pets, Badges and jobs and Battle
jacket, each still behind its own switch. **Ryan's calls: every part Discord's editor has, shown once written on a
claimed username only with no switch (the worn avatar's rule), and NO DATE**: "Member since" invites ranking who has
been here longest, and `tools/make-profile.py` refuses a date in `profile.js` and a time in `lib.mjs`'s profile part.
Every choice is checked against `PROFILE_KEYS`, which that tool writes between `profile:keys` markers out of `call.js`'s
SCHEMES, `cb-themes.js`'s drawings and `profile.js`'s DECORATIONS and FACES (never hand-edit them), refusing a theme
whose seven colours `love.css` lacks, a face it does not declare and a decoration with no drawing. **A card wears a
theme by `loveProfile.dress()`**, which lays `--cb-<theme>-<part>` over the seven `--cb-*` on the element, so a card
only ever uses pairs `CB_ROLES` already holds for every theme; **Amber's seven are `--cb-amber-<part>` in `love.css`,
aliases of the bare names as `:root` has them**, because on the radio's host the bare names are the viewer's own theme.
A banner and a nameplate are a theme's drawing on its own case (every avatar carries its own ground), a decoration is
drawn in the card's own inks so it brings no colour nobody measured, and a face sets the name and nothing else. The
nameplate is copied to one blob, `profiles-plates` (`withPlates`), the worn avatar's arrangement, raced fifteen at once
in `lib.test.mjs`, and taken out first when a card goes. A quiet room cannot be a favourite: naming it would list it.
The editor's preview is `inert`, and on a phone it is a sticky strip above the choices, the Dress-Up Den's rule. **The
friendly edits are a Member since line, a count of anything, an uploaded banner or avatar picture** (which would bring
the photograph rules onto the CB), **and a switch that starts off "for privacy"**, which would hide what people wrote to
be shown. **A moderator can clear one card from the desk** (Ryan's call, 2026-10-18, for a card that breaks the
covenant, which until then could only go with the whole username): `clearCard` on `/cb/account/admin`, base pass only and
after the desk's `isMod` refusal, runs `clearProfile` in `lib.mjs`, which is `forgetProfile` (nameplate off first) and
leaves the username, its password, pets, avatars, jobs and patches. `tools/make-accounts.py` lets the desk do exactly
find, reset, delete and clearCard, and refuses `clearProfile` writing anything: **the friendly edit is a note of who
cleared whose card and when**, which would be a record of moderation kept against a person that the privacy page does
not mention.

**A PROFILE CAN HAVE A FRAME AND AN EFFECT, AFTER DISCORD'S, AND THE EFFECT'S PASS IS THE ONE DRAWING THAT CROSSES
WORDS.** Ryan, 2026-10-18. Both are chosen from `profile.js`'s own lists (FRAMES, EFFECTS, written into `PROFILE_KEYS`
by `make-profile.py`, each refused without its drawing), and `loveProfile.surround()` puts them on a `.pf-stage` round
the profile's sheet or the editor's card, wearing the card's theme, so both are drawn only in that theme's seven inks,
**with exceptions, each between its own `effect:<key>` markers and held to one source of inks there.** **The Black
Leather Lagoon effect** (Ryan, 2026-10-18, after the room and The Cramps) is drawn in that room's own declared `--lag-*`
inks, and its credit must name The Cramps, Lux Interior and Poison Ivy and say nobody real is drawn: their world, not
them, Ryan's call over drawing the two of them. **Otters in the kelp** (Ryan, the same day) is drawn in the Kelp Forest
theme's declared `--cb-kelp-*` inks, because an otter needs a brown no card's seven can be relied on for; its credit must
name Helen Edgar's Stimpunks Solidarity and Otters and Star Stuff's The Stone You Keep, as the Arcade's otter cabinet
does, and it keeps that cabinet's rules (`otterly.js`): floating fills nothing, no otter is ranked, no two otters hold
paws, and nobody keeps a stone in a pouch, each refused as a word in its code, its credit and its theme's line. **Flying
Fairy** (Ryan, 2026-10-19) is drawn in the Fairy Lights theme's declared `--cb-fairy-*` inks, because its faeries are the
Faery Yurt's own, in that room's colours, five skins and seven hairs among them, redrawn as elements because
`yurt-garden.js` writes them as markup with literal colours; its credit must name Helen Edgar and her Faery Yurt, and an
ink named in a list is read as one named on its own. **Howling Wolf, Starward Dreaming, Leaping Dolphins and Autumn
Falls** (Ryan, 2026-10-19) are each drawn in a palette of their own, `--pfx-<name>-*` declared in `love.css` and measured
in `check-contrast.py` on its own scene's ground (`PFX_ORNAMENT`), because a full moon, firelight, a sunset and children's
skins are colours no card's seven can be relied on for, and a starry night in the Daylight theme would be a day; they are
nobody else's work, so they need no credit. **Starward Dreaming's flames are held under the flash line**, the cabin's
candles' rule: each sways on its own time out of `SW_FLICKER`, never under four tenths of a second a half-sway and no two
alike, and `cb-fx-sw-flicker` dims a flame by a tenth at most. The friendly edit is a faster flicker "so the fire looks
real"; the brief said flicker, and the sway is how this street says it. **Cloud City** (Ryan, 2026-10-23, for the test
user Rando Calrissian's profile) is drawn in the Cloud City theme's declared `--cb-cloud-*` inks, randocloud.cloud's
palette and a sunset over a sea of cloud, and keeps the games' rule: the city, its cloud cars and its sunset, nobody from
the films, its credit naming Lucasfilm, and `make-profile.py` refusing the films' people and things by name in its code,
its credit and the theme's line; the friendly edit is a caped figure on the deck. **A further such effect is a block of its own and
an entry in `EFFECT_INKS`**, never a widening of another's block, and
everything outside the blocks stays in the card's seven. `make-profile.py` holds all of it, and refuses a literal colour
anywhere in `profile.js`. A
**frame** is a band of the theme's case round all four sides, outside the profile, each side drawn once longer than a
profile can be (the radio's sides' rule) and a corner covering the cut. An **effect** has a **still part** along the
edges and in the banner, where no sentence is, and a **pass** that crosses the whole profile from time to time, **words
included: Ryan's call, reversing the radio's refusal of a drawing over the words, for profiles only** (the radio itself
still keeps every drawing to its trims, sides and dividers). What holds is the dial: **the pass is drawn only under
`:host([data-motion="on"])`**, MAX GLITTER or Let my theme move, and `make-profile.py` refuses `.pf-fx__pass` shown, or
an effect moving, anywhere else, **so a profile standing still never has a drawing sitting on a word.** The friendly
edit is to show the pass still at Regular "so the effect is not bare"; that is a butterfly parked on somebody's bio.
Each pass fades in and out over about a second, travels in its own container units (`cqw`, `cqh`), so a profile that
grows draws nothing again, and nothing in it flashes. The contrast checkers cannot hold a word with something crossing
it, and Ryan chose it knowing that.

**PROFILE SETS ARE A CARD'S LOOK UNDER A NAME, AND THEY NEVER HOLD ITS WORDS.** A request from our community, 2026-10-19
(Otters, Halloween, Fairy Lights): save, update and switch between favourite sets of profile settings, by mood, room or what
is on. A set is the seven drawn choices in `LOOK` in `lib.mjs` (theme, banner, decoration, frame, effect, face, nameplate) and
which avatar is worn, or none; `profile-sets/<pet key>` holds each one's id, name, look and avatar and nothing about when,
beside the card, claimed only, in Profile under the card (`drawProfileSets` in `cb.js`). **The server reads every set off the
card as saved and the avatar as worn** (`cardAsIs`), never off what a page sends, so a set only holds what was on a card;
wearing one (`wearProfileSet`) lays the look over the card, keeps its words, and wears the set's avatar or takes the worn one
off. **Nothing records which set is worn**: `shapeProfileSet` works it out by comparing, and sets are shown to nobody.
`make-profile.py` refuses a set built with anything else, the sets' code naming the card's words, and Forget me or deleting
the username leaving them; Clear my card and a moderator clearing a card leave them, because a look is only choices off the
street's own lists. **The friendly edits are a bio and pronouns in a set "so Halloween can have a spooky bio"**, which puts old
words back on a card by a press, **a set shown on a profile**, and **sets switching by themselves by room or by date**, which
changes somebody's card while they are not looking; `DECISIONS.md` has them as open, each Ryan's call first.

**THE COMMUNITY DIRECTORY IS OPT-IN, AND IT NEVER COUNTS ANYBODY.** Ryan's ask, 2026-10-23: `directory.html` (paperwork
beside the chat page and the forums, in the reader's own CB theme, `directory.js` and `directory.css`) lists everybody who
ticked **Show my profile in the community directory** on their card (`listed`, off until ticked, saved with Save my card),
for anybody signed on (`/cb/directory`, `communityDirectory` in `lib.mjs`): the worn avatar, the username, BASE from the
moderators' list, pronouns, a **tagline** (one line of 100 characters, new on every card) and the nameplate, alphabetical,
and a name opens the profile through `loveRadioPeek`. A line is copied into one blob, `profiles-directory` (`showInDirectory`,
by pet key, the nameplates' arrangement), under the username the pass is for, and `forgetProfile` takes it out first, so
Clear my card, a moderator's clearCard, Forget me and deleting the username all take somebody out. The line on the page and
in the editor's preview is one function, `profile.js`'s `listing()`. `tools/make-profile.py` (`check_directory`) holds it.
**The friendly edits are a count at the top, a joined date, a switch that starts on "so the directory is not empty", and
setting each name in its card's face**: the first two are the headcount and the member-since ranking the street refuses on
its public surfaces (the desk's directory is the backend, where Ryan said numbers are fine), the third lists people who
never chose it, and the card's face is for the card and nothing else. `DECISIONS.md` has what is still open.

**PROPS ARE THE SEVENTH THING KEPT UNDER A PERSON, AND NOTHING GOES UP UNTIL ITS PERSON SAYS YES.** Ryan, 2026-10-18,
after the forums' Props & Gratitude: a **Props** tab in every profile (last of the tabs), where anybody signed on reads
the props somebody confirmed and anybody with a **claimed** username (`forumReader`) writes them one, a sentence or a
short paragraph of thanks. A prop **waits**, read only by its person, in **Your props** in Profile, and by its writer,
until its person presses **Confirm** (onto the tab) or **Reject** (deleted, nobody told). **The tab is shut until its
person switches Show my props on the CB on**, claimed only, the other tabs' rule, and while it is shut nobody can give
them props. The Props part of `lib.mjs` keeps one blob per person (`props/<pet key>`: open, waiting, up), each prop its
words, its writer's handle, BASE if so, an id and the forums' `authorMark` (`by`), **which never leaves the server**
(`shapeProp`), so a name deleted and claimed again cannot take back its old owner's props. **One waiting from each
writer per person**; the owner takes any prop off, the writer takes theirs back, the base takes down what is up and
never sees what waits. `tools/check-props.py` refuses a time in that part, a prop kept with more, the mark in an answer,
a writer who is not claimed, anything but `confirmProp` putting a prop on a tab, Forget me or deleting the username
leaving props, and a count in the radio's props code. **The friendly edits are a number on the tab** (the headcount the
street refuses, wearing a thank-you), **a date on each prop**, and **letting props go up unconfirmed "so nobody has to
wait"**. **Props arriving can notify their person** (the same evening): **When somebody gives me props**, the fifth push
switch, off until switched on; `notifyProps` in `lib.mjs`, called by `/cb/props/of` once a prop waits, tells only devices
switched on as that claimed username, says who wrote it and its first words under the words switch, **never how many
wait, and never tells the writer anything**. Pressing it opens `/#cb=props`, where `arrive()` in `cb.js` has the radio
open Profile at Your props (`toProps`, for that page only). The friendly edit is a count in the notification ("3 props
waiting"), which is the number on the tab arriving by push. `DECISIONS.md` has what is still open.

**DIRECT MESSAGES ARE THE CB'S, CLAIMED AT BOTH ENDS, AND NO MODERATOR CAN READ ONE.** Ryan's calls, 2026-10-18, as
our community moves off Discord: messages between two people, in a **Messages** part on the radio between Channel and
Watching together (`dmMake` in `cb.js`), the Direct messages part of `lib.mjs`, `/cb/dm` and `/cb/dm/reports`.
**Claimed usernames only, at both ends** (`forumReader`), because an unclaimed handle is anybody's; a person is
`dmKey`, the folded name and when it was claimed, so a name claimed again after its owner deleted it reaches nothing
of theirs. **Let people message me is off until switched on**, and **the first message waits**, its sender able to
write nothing more until it is answered (which accepts it), accepted, or rejected (emptied, nobody told): props' rule.
A conversation already going goes on whatever the switch says. **Every message goes 48 hours after it was sent**, by
`LIFE` and not by `onAir()`, which still keeps the channel's old midnight for what was sent before `LIFE_FROM`;
**who talked to whom is not kept past the last message between them**, so the next message after two quiet days
asks again. **A block is the blocker's own record, by the name blocked (`petKey`)**, so it holds through a re-claim;
it empties the conversation for both and answers the blocked person `'closed'`, the same words as a switch that is
off, so nothing ever says "blocked". **Not end-to-end encrypted**, and `privacy.html#messages` says so in those
words. **A report is the one way a message reaches a moderator**: one message, copied with who reported it and a
note onto the desk in the Moderators' room (`desk.js`), kept until closed or thirty days, even if either username
is deleted. Forget me and deleting the username delete everything else, for both people. `tools/check-messages.py`
holds all of it, and refuses a count, a receipt, "seen", "typing", a timer or browser storage in the radio's
Messages code. **The friendly edits are an unread number, read receipts, a typing indicator, a moderator's way
into a conversation "for safety", and the radio listening for messages while the part is shut** "so nothing is
missed"; the notification switch (*When somebody messages me*, `notifyDm`) is how somebody is told. **A conversation's messages are the channel's** (Ryan's ask,
2026-10-20): `dmMsg` draws `.cb-msg` with React and the dots (`moreMenu`, shared with the channel's
`moreFor`), stickers and reactions are the channel's (`dmSticker`, `reactDm` with `toggleReaction`), and
both wait, like pictures, until the conversation is accepted; `check-messages.py` holds that. Nothing in a
conversation goes to the forums. **A picture can be pasted** into either box (`pastedPicture`), into the
same preview and redraw. **A conversation
takes pictures once it is accepted, and a request never does** (Ryan's call, 2026-10-19, after somebody could not send
him a screenshot privately): `putDmImage` and `sendDm` refuse one until the conversation is open, so nobody's first
contact with you is a picture. It is the channel's picture otherwise (the one redraw, `pictureCheck` shared with
`putImage`), kept under `dm-img/`, which the channel's own sweep never lists, and served by `getDmImage` only to the two
people and only while a message holds it; `updateConv` deletes what a write let go of, and Forget me and the sweep the
rest. A reported picture is copied onto the desk, shown there only after **Show the picture**, and goes with its report.
The friendly edit is a picture in the request "so people can explain what they want"; it is the first contact the rule
exists to keep words. The open questions, safeguarding first, are in `DECISIONS.md`.

**EVENTS ARE THE CB'S, SCHEDULED BY ANYBODY SIGNED ON, AND AN EVENT NAMES WHO IS INTERESTED AND NEVER HOW MANY.**
Ryan's ask and calls, 2026-10-23, after Discord's Scheduled Events: the Events part of `netlify/cb/lib.mjs` (one blob,
`events`), `/cb/events`, `cb-events-start` every five minutes, an Events part on the radio after Unreads and Events at the
top of the chat page's channels, which opens in the middle at `#events` (`evMake`, `chatViewEvents` in `cb.js`).
**Every event is in a channel, World or a room, and `seesEvent` asks `roomAllows`**, so an event in a Town Hall room or a
staff category is theirs; **a room that keeps to itself has none**, because an event is listed and announced outside it.
Its maker (by `authorMark`, never sent) or any moderator changes or cancels it. **It starts and ends by the clock**, with no
status kept, and a one-off goes from the blob within the hour after it ends; **a repeating one keeps to its maker's wall
clock in its maker's zone** (`eventStarts`, `wallToUtc`), kept with it, across summer time, and every time on the radio is
the reader's own. Two notifications, each off until switched on (`events`, an event you are interested in starting, and
`scheduled`, a new one on World or in a room you follow), through `wants()` and `followsRoom()`. The chat page's `#events`
means no room may be called `events.html`, which `make-chat.py` refuses. `tools/check-events.py` holds the rest. **The
friendly edits are Discord's "12 Interested"**, the headcount the street refuses wearing an RSVP, **a time of when somebody
said they were interested**, a record of somebody's days, **and an event in a quiet room "kept inside it"**, which names
its address on a list; `DECISIONS.md` has what is still open, a cover picture first.

**THE FANFARE FOLLOWS THE DIAL AND THE WORDS NEVER DO.** Gentle says its piece and adds nothing,
Regular chimes, MAX chimes properly and throws sparks that rise once and fade. The sentences are
identical at all three, because a fanfare is decoration and **Gentle takes away the wobble, never
the words**. **Nothing flashes or strobes at any setting** — Club Chronic's rule — and the sparks
move with a translate rather than a rotation, because rotation and skew are all `check-gentle.py`
can read and a checker must not be asked to take a room's word for something.

**THE DEV SERVER DROPS THE QUERY STRING AND NETLIFY DOES NOT, WHICH IS THE `_headers` TRAP RUNNING
BACKWARDS.** A marker's hand-it-in link is `adventurers-guild.html?code=SPINDLE`, which puts the
word in the box. `npx serve` answers that with a clean-URL redirect to `/adventurers-guild` **and
throws the query away**, so the prefill looks broken locally while working in production —
Netlify serves the file as-is with the query intact. The last time this repository met the gap it
went the other way (the frame worked locally and was refused live) and the lesson written down was
that the dev server is not the site. It is the same lesson: **check the clean URL,
`/adventurers-guild?code=SPINDLE`, which `serve` does not rewrite**, before concluding the prefill
is broken. Do not "fix" it by moving the code into a hash fragment or into storage; the query
string is correct and it is the dev server that is lying.

**THE CODE IS NOT A SECRET AND THE TOOL SAYS SO WHERE IT COMPUTES THE CHECKSUM.** Every code is
printed in plain text in the markup of a public page; that is the mechanism. The board holds a
checksum only so that View Source on the *board* is not a spoiler sheet for every room at once.
There is no security here and none is wanted. Do not "harden" it.

**AND `check-quests.py` READS THE PUBLISHED HTML, NEVER THE DATA FILE.** A checker that re-derived
the answer from the generator's own source would only be testing that Python is deterministic. It
exists for every moment *after* the generator runs, when a generated line sitting in a committed
file gets edited by hand — the `frame-src` shape exactly. **It found a bug in itself on its first
run**: it sliced each marker at the next `</details>`, the markers' own hints *are* `<details>`,
and it reported eighteen missing escapes that were all present. Break a checker on purpose before
believing it.

**THE YURT'S CANDLE STUB IS OURS AND IS WRITTEN DOWN IN THE LINER NOTES.** Ryan's call,
2026-09-21, so that Helen Edgar's pitch is not the one room on the street with no job in it. It is
drawn in her own declared colours and it is the **second** thing this repository has put into her
room on its own initiative, after the one colour. It is in the credits rather than only in a diff
for the same reason that colour is in four places, and **Helen has the final say on whether it
stays.** Street conventions no longer need asking (2026-09-30, above); anything else of hers still does.

**THE BED IS BUILT AND IT HAS TWO DOORS, WHICH IS A FIRST HERE.** The Healing Checkpoint (§31) is
room 429, the guild's guest room, and it is **also a shopfront on the street**. That is the whole
argument rather than a convenience: a room saying **rest is owed rather than earned** cannot be
reachable only by walking through the place that hands out the work, because then it is
structurally something you get to *after* the jobs. The front door is on the street, where somebody
arrives at it having done nothing; the guild's unattended counter is the back stair. **No job sends
you to it.** The Nap Ministry and Tricia Hersey are credited in the room's own copy rather than in a
footnote, which is what the guild promised while the bed was still an absence.

**AND THE LIGHT COMES UP OUT OF THE FLOOR, which is the only separation that room has and the only
one it needs.** Every other world here is lit from somewhere else and no two from the same place —
above through leaves, from one side at desk height, from behind at a hundred feet, through a mask
in front of a lamp, from directly overhead, from nowhere at all. In 429 every top surface is dark,
every underside carries a rim, the shadows run **up** the walls, and the room gets lighter towards
your feet. By now *"they are all somewhere to rest, they should feel the same"* has arrived six
times — the Faery Yurt, The Latibulum, The Den, the Hermitage's cave, The Mopery — and every one of
those is **lit by a flame you could put your hand over**. There is no flame in here; the light is
under water and you could put your hand *in* it. They are brown, amber or candle-gold, and **there
is no warm ground in this room at all**, only one warm ink. **Its own other door is its exact
opposite**: the guild is manila, square, ruled, hairlined and casts nothing, and there is not a
straight edge in the checkpoint anywhere. A board and an inn share a building and nothing else.

**IT REFUSES INSTRUMENTAL REST, AND THAT REFUSAL IS THE ROOM.** `make-checkpoint.py` sweeps its own
data **and the published page** for the vocabulary of rent — earn, deserve, recharge, productive,
bounce back, so you can — with `make-guild.py`'s negation window, so the room can still say out loud
that it will not. The otter cabinet already holds this line for one game; here the whole street says
it. **The friendly edit arrives from somebody being kind**, because every wellness page on the
internet is written the other way round and one encouraging sentence would turn rest from a thing
owed into an investment. **Nothing in the room is counted and nothing is stored** — no total, no
streak, no visits, no local storage, one link above a board that *does* keep a list in your browser,
because a checkpoint that remembered you would be keeping a record of how often you needed one. It
restores nothing either: you are not a health bar, and there is no hard part on the other side.

**AND ITS TALLY CHECK WAS COPIED WRONG AND CAUGHT ITSELF ON THE FIRST RUN.** `make-guild.py` had
already narrowed `points` — *"a book it points at"* is the verb — and this tool reproduced the flat
version from the identical shortcut. What refused it was **save point**, which is what a healing
checkpoint *is*. The narrowed pattern was taken over rather than the phrase excepted, which is
`check-counts.py`'s first-run lesson arriving a fourth time.

**EVERY TOY MAKES A NOISE, AND `make-toys.py` REFUSES ONE THAT DOES NOT.** Ryan, 2026-09-21:
six of them shipped silent for an hour, and in a room where nine other things answer out loud
**the quiet ones read as faulty rather than as quiet.** A missing noise is not an error anywhere.
Each toy's sound is its own, short, affirmative, synthesised here, and no two alike — nor alike
to any of the sound board's keys, which are the other synthesised things in the room. **The off
switch's noise comes AFTER the silence**, which is the only order that makes sense for that
button: it stops everything and then says so, and its copy says that it will.

**AND A NOTE IS A FACTORY RATHER THAN A SOUND, WHICH IS THE WHOLE REASON THE ECHO WORKS.** It is
called once to *choose* — the stim box's next step up the scale, which handset, which yell — and
hands back a function that plays exactly that choice. `sound()` keeps that function, so the echo
replays the same noise instead of the next one along, and a yell echoes as **that** person's
yell rather than a fresh draw. A note that played directly would make the echo advance the scale
it was echoing, and nothing would look wrong. Measured: two stim presses give 659 then 784, two
echoes give 784 twice, and the next stim press resumes at 880. **The board goes through the same
helper**, so the last noise means the last noise rather than the last noise made by a toy.

**STYLING BY ELEMENT IS A RULE THAT CANNOT SEE WHAT IT WILL HIT.** `.toy--orange span` was
written when a tile held one span. The answer readouts arrived later, also spans, and that rule
is (0,2,0) against `.toy__said` at (0,1,0) — so **four tiles rendered near-black text on a
near-black panel at 1.00:1** and three more at 1.28 to 1.48, in colours nobody chose for them.
The blurb has a name now and every fill rule is scoped to it. If a component grows a second
child, every element selector already pointed at it.

**AND `check-contrast.py` PASSED THE WHOLE TIME, BECAUSE IT HOLDS PAIRS SOMEBODY WROTE DOWN AND
NOT PAIRS THAT RENDER.** The pair was declared correctly — cream on near-black — and lost the
cascade, which a list of colours cannot see. **That is the second time in one day the pair list
was blind**: the first was an inherited link colour nobody ever decided, and this was a decided
colour that never applied. Both were found by a person looking at the page. The only thing that
sees either is a sweep of the *rendered* page, walking every text node against the ground it
actually sits on — which is what `check-gentle.py` already does for motion and nothing does for
colour.

**A VERIFICATION THAT SHARES AN ASSUMPTION WITH THE FIX IS NOT A VERIFICATION.** The rescope was
a regex expecting one space before `span`; `.toy--green  span` had two and was missed — and the
grep that checked the work carried the same assumption, so it reported clean. **Break the check
differently from the fix**, which is `make-polaroids.py`'s lesson about scanning the wrong
attribute, arriving in a sed command.

**A CONTROL THAT GIVES NO SIGN OF HAVING WORKED IS BROKEN, WHATEVER THE MARKUP SAYS.** The
Playhouse answered into one live region at the top of the page, which is off the screen by the
time anybody has scrolled to the toys — let alone to the sound board underneath them. **Ryan
pressed the buttons he had just asked for and thought they were faulty**, and he built the room.
Nothing caught it because every check anybody ran, ours included, was reading the box: the
handler fired, the text was correct, the live region updated, and the person pressing saw
nothing at all. **This is the 0×0 iframe again in a different shape** — the DOM was right and the
screen was wrong — and it is the reason "measure what the visitor can see" has to mean the
visitor's viewport and not the document.

So every toy answers **on the tile you pressed**, and the sound board answers in one strip
**directly under the keys**, because a key is about a hundred pixels wide and a sentence does not
fit on one. One readout at a time: whichever control spoke last holds it, and the previous one
is cleared, so it always reads as *this* control answering rather than a page filling up with
old replies. **Every readout is `aria-hidden` and `#playhouse-says` is still the only live region
on the page**, because hearing the same sentence twice is worse than hearing it once. They ship
`hidden`, so a page with no JavaScript shows no empty boxes — which only holds because §2's
`[hidden]` guard carries `!important`. **Anything added to this room that answers in words needs
a readout where the hand is; the box at the top is the narration, not the feedback.**

**EVERY TOY IN THE PLAYHOUSE IS AN IDEA WEARING A COSTUME, AND THE LINE UNDER THE TILE NAMES
THE IDEA.** Ryan's call, 2026-09-21, filling the blank column beside the house rules: six more
toys, and each one a real entry from our own glossary rather than a gag with nothing behind it.
Echolalia, the double empathy problem, safe food, spoon theory, infodumping. **The slugs were
checked against the Knowledge System mirror and not fetched live**, because on stimpunks.org a
301 is a failure rather than a pass and a live fetch will happily confirm a page that does not
exist; *curb cut effect* was dropped for being in our posts and not in the glossary, which is
the same test that dropped four candidates a year earlier. **A toy is not an explainer**: the
tile does the thing, the line says where the thing came from, and nothing teaches, quizzes or
asks a visitor to demonstrate that they have understood.

**AND THE CREDIT IS ON THE FACE OF THE TILE, WHICH `make-toys.py` ENFORCES.** Damian Milton on
the telephone, Christine Miserandino on the spoon drawer. A credit recorded in a data file and
not in the copy is a credit nobody reads, which on this site is the one habit that was kept when
the other three were dropped.

**THE SPOON DRAWER HANDS OUT THE SENTENCES AND NOT THE SPOONS**, and the difference is the whole
point. Miserandino invented spoons to explain a limit to somebody across a table; a drawer of
infinite spoons would quietly delete the limit while looking generous, which is a friendlier
version of the thing her essay exists to refuse. It hands you things you can say. **Nothing in
that room is counted** — the stim box says "nobody is counting" as a joke about counting, and
the tool refuses the scoring vocabulary on any other tile, because the joke does not survive a
second toy repeating it with a straight face.

**AN ARIA-LIVE REGION DOES NOT ANNOUNCE TEXT IT ALREADY HOLDS, AND TWO TOYS THERE EXIST TO
REPEAT THEMSELVES.** The echo says the last thing again; the safe food tin says the same
sentence forever. Written the obvious way, both are **silent to the one reader who most needs
them** while looking perfectly correct on screen — a failure with no symptom at all for anybody
watching. `speak()` in love.js clears the region and sets it back on the next tick, which is
what makes a repeat a change. Any future control whose output can equal its previous output has
this bug until it uses that helper.

**AN HTML ENTITY IS RIGHT IN THE BLURB AND WRONG IN A PAYLOAD, AND NOTHING IN THE DATA FILE
SHOWS WHICH IS WHICH.** `what` is written into the markup as HTML, so `&mdash;` there is an em
dash. Everything in `make-toys.py`'s `CARRIES` becomes a `data-` attribute that love.js writes
with `textContent`, so `&ldquo;` there arrives on the page as five literal characters. **The
spoon drawer shipped its first draft that way**, looking correct in the file and like a markup
leak in the room. The tool refuses an entity in a payload field now.

**THE TILE IS NOT ALWAYS THE BUTTON.** The double empathy telephone has two handsets, so its
tile is a `<div>` and the controls inside it are the buttons — a button cannot be nested in a
button, and the alternative was one control pretending to be two. It is the only toy on that
wall with more than one thing to press, and **it never says which account was right**, because
the whole idea is that neither was wrong.

**TEN TILES, TEN FILLS, NONE REPEATED, AND THE TOOL REFUSES A FILL CLAIMED TWICE.** It caught
one on its first run: the newcomer had taken `.toy--violet`, which the word clock has owned
since the room opened, and the two rules would have sat in one section with the last one winning
in silence. **That is `check-classes.py`'s collision arriving INSIDE a section, where that tool
deliberately does not look.** The newcomer was renamed. When a name collides, look for the same
collision in every file that holds names — and now also inside the one section you are editing.

**AND THE ROOM HAD THREE LIVE CONTRAST FAILURES THAT NOTHING COULD SEE.** `.room-play a` was
yellow, which is right on the near-black boxes, and every link on that page is either on the
blue ground or inside a WHITE card: the house-rules links measured **1.31**, the quest marker's
hand-in link **3.88**, on a page that has been published since the street opened.
`check-contrast.py` holds a pair for every colour somebody **decided on**, and an inherited one
was never decided, so there was nothing to hold a pair for — **the exact hole the Doomscroll
left, found again in an older room, and found by looking at the page rather than by a tool.**
The room decides at each ground it actually has now. A room that adds a link to a ground it has
not decided a colour for is repeating this.

**TODAY'S SECRET WORD IS SAID BY THE TOYS, AND `make-toys.py` REFUSES ONE THEY NEVER SAY.** Pee-Wee's
Playhouse's bit (whenever anybody says it, everybody screams), credited on the sign along with Groucho
Marx's *You Bet Your Life*, which had one first. The first draft said Paul Reubens made it up.
The word changes at the visitor's midnight, out of a rota in `data/toys.json`, and when Chairy,
the clock, the telephone or the infodump says it the scream goes on the end of that sentence. So a
word on the rota has to be one the room actually says, matched with the pattern `love.js` uses. A
word the toys never say only screams when somebody presses the sign, which is not the joke. The
scream is words first at every setting, and only MAX makes the sign jump. **Nothing is counted**:
no tally of screams, no streak of days. It is the next object in this room likely to grow one.

**THE SOUND BOARD'S BOTTOM ROW IS NOT A FEELINGS CHART, AND THAT IS WHY IT HAS NO FACES ON
IT.** Ryan's brief, 2026-09-21: a 3×3 board of stimmy noise keys with a row of mood keys along
the bottom that toggle between happy, sad and angry. The obvious drawing for a mood key is a
face, it is the first thing anybody sketches, and **a row of happy/sad/angry faces on a
Disabled people's site is the emotion flashcard** — the thing autistic self-advocates spend
their lives being drilled with. What a mood is here is the shape of a NOISE: a hum that lifts,
a hum that sags, a hum with a buzz in it. Each mood is a word, a drawn waveform and a sound,
three channels and not one of them a face, and the room says so in its own copy rather than
leaving it as an absence somebody helpfully fills in later. **Do not add a face, an emoji or an
expression to that row**, and do not ask anybody to match, name or perform an emotion. A sad
noise is a perfectly good thing to want, which the room also says out loud.

**AND NOTHING ON IT IS COUNTED**, which is the pebbling cabinet's refusal of a tally and the
guild's refusal of a score, arriving on the object most likely to grow one: a board of nine
keys is exactly the shape of thing somebody gives a press counter. No total, no streak, no
memory between visits. The stim box one object over counts its own presses as a joke about
counting and that is the room's whole point; the board does not get to borrow the joke.

**A FLOURISH PER KEY, REFUSED IF TWO KEYS SHARE ONE.** Ryan asked for a different visual
fanfare on each button at MAX GLITTER, so a shared one is not a shortcut, it is the thing not
being done — make-og.py's refusal and make-guild.py's, arriving a third time. Rings, bubbles,
falling hairlines, a burst thrown outward, widening bars, darts, flat arcs, a stretching coil,
confetti. All MAX only, all clipped to their own key, all moved with a translate or a scale
because **rotation and skew are all check-gentle.py can read** — arcade.js's call and
quest.js's. Nothing flashes and nothing strobes, which is Club Chronic's rule holding in the
loudest room on the street.

**THREE FILES HAVE TO AGREE ABOUT EVERY KEY AND NONE OF THEM IS NEAR THE OTHERS**, so
`make-soundboard.py` reads all three and refuses: the markup is in `playhouse.html`, the noise
is a `voice('click', …)` in `love.js`, the key colour and the flourish are rules in `love.css`.
A key whose voice is missing is not an error anywhere — it is make-chappell.py's typo that
never becomes a video, arriving in a room where the press IS the content. A key whose flourish
is missing is quietly ordinary at MAX, which nobody would notice because nobody screenshots
MAX. **And every key says what it sounds like in words**, into the room's live region on the
press, because a board made of sounds is the one thing on this street that can lock somebody
out completely.

**RED WAS THE OBVIOUS COLOUR FOR ANGRY AND IT MEASURES 3.06 ON THE MOOD KEYS' NEAR-BLACK.**
Angry is orange. That is worth knowing next time: the mood this room would least like to make
illegible is the one whose obvious colour fails, and the mood ink is on the WORD as well as on
the line, so these are body-text pairs rather than graphics ones.

**A MEDIA BLOCK WRITTEN ABOVE THE RULES IT OVERRIDES LOSES EXACTLY THE DECLARATIONS THE BASE
RULE ALSO SETS, AND KEEPS THE REST.** A new failure shape for this file, and it renders as a
layout nobody wrote: the board's phone block sat before `.stimpad`, so `flex-flow: row wrap`
and the blurb's font size lost to the base rule while `flex: 1 1 100%` — which the base rule
does not set — went through. Half a breakpoint. **It looked like a cache problem and it was
source order.** The block is last in the section now. The board itself is three across where
there is room and one column on a phone, because a third of 375px is about seventy pixels of
text column and the first draft set every blurb one word to a line; **hiding the words to keep
the grid would have been the lite-version mistake arriving through a breakpoint**, so the grid
gave way instead. The sentence saying what shape it is is generated and carries its own caveat.

**THE ORDERLY ROOM HAS A SECOND ONE NOW, AND THAT IS THE HARDEST COLLAPSE ON THE STREET SINCE
THE DEN.** The Feed (§27) is a dark station concourse with a split-flap arrivals board standing in
it for every site we run. It is **made of ruled rows**, it is square, nothing in it is rotated and
nothing overlaps — which is the Adventurer's Guild's description word for word, in the room whose
own section says its tidiness *cannot spread: the moment anywhere else starts looking orderly the
joke has become a system.* A second orderly room is what spreading looks like, so the separation
cannot be the layout, because the layout really is the same:

  · **the guild has NO LIGHT SOURCE AND NO DEPTH.** It is lit the way a photocopy of a document is
    lit — evenly, from nowhere — and nothing in it casts anything. This room is **nothing but
    light and depth**: one source per board, inside it, every object separated from every other by
    a shadow, and the boards standing on legs rather than lying on the page.
  · the guild is a **document** and this is a **machine**. A clerk filed that; an engineer bolted
    this together and switched it on. *Orderly* is not one joke — a bureaucracy being orderly and a
    mechanism being orderly are different subjects, and only one of the two is allowed to be dark.
  · and the guild is **pale**. This is the far end of the street's own night.

If anything in here loses its shadow, or the boards ever sit flat on the page, the two rooms have
become one and **it is this one that moves**.

**AND THE LIGHT IS A THIRD KIND OF TRANSMITTED LIGHT, because a neighbour already owns the idea.**
Swaying Sweetgrass is lit *through* a translucent body — the sun a hundred feet off and behind,
diffuse, no edges, nothing with a lit face. This is lit through an **aperture**: a hard light a
finger's width behind a mask, so every letter has a crisp edge, every flap throws a hairline
shadow, and the enamel between the letters stays dead. Diffuse transmission against masked
transmission. **If the edges in here ever go soft this has become the meadow with a timetable in
it.** It is also the one room whose **furniture is darker than the room** — a carcass is the
darkest thing in the hall and the brightest thing in it at once — which is why its share card is
drawn as an object standing on a floor.

**THE BOARD IS A SNAPSHOT AND SAYS SO, WHICH IS make-jungle.py's REFUSED RUNTIME UPSIDE DOWN.**
None of those hosts sends an `Access-Control-Allow-Origin` header, so the page cannot read a feed,
and the ways round it are a proxy we do not run and a third-party reader we would be handing our
visitors to without asking. So `pull-arrivals.py` reads the feeds, `make-arrivals.py` draws the
board, and every plate carries the minute its own wire was read — **generated from the same file
the rows come out of.** A live camera has no length to give and publishing one would be a number
that goes quietly wrong; a board *has* a time it was set, so leaving that off would be the
identical fault the other way up. **Do not make this room pretend to be live**, and do not take
the plates' times off it. **The hall's own line saying when the whole board was set, the sentence
counting its wires and rows, and the section "How this board is set, and what it will not do"
came off on 2026-10-23, Ryan's call: dry hedging that distracted from the page.** The refusals
that section described are still in the tool; the friendly edit now runs the other way, which is
putting the explanation back, and it is not wanted on the page.

**A ROW IS A TITLE, A DATE AND A DESTINATION, AND THE TOOL REFUSES A SUMMARY FIELD RATHER THAN
IGNORING IT.** A departures board does not read you the contents of the train. That is the
metaphor doing the ethical work: a room that pasted in everybody's opening lines would be
republishing other people's writing onto one surface it does not own, which is the opposite of
sending somebody to them. **The friendly edit is real and it will arrive** — the rows look bare,
somebody helpfully pastes the excerpts back, and the board has become a reader. It is
`make-sweetgrass.py`'s refusal of a reading marked `screen`, in a room where the rows would look
better for the change.

**NOTHING THERE IS RANKED AND NO SITE'S ACTIVITY IS ADDED UP.** No busiest, no quietest, no
rows-per-week, nothing saying which of our sites has been getting on with it. A board that showed
that would turn publishing into a race between our own people, most of whom are Disabled and
several of whom are one person — the pebbling cabinet's refusal of a tally, arriving *between*
sites rather than inside a game, and it is exactly the feature somebody would add to make the hall
feel alive. The vocabulary is refused in the room's own copy with `make-guild.py`'s negation
window, so the room can still say that it does not rank anything. **The running order is
stimpunks.org's own**, off its published feeds page, and re-sorting it here — alphabetically, or by
whose wire was newest — would be this room overruling a decision made somewhere else, which is the
Jungle Room's rule about its cams. **And this street is on its own board**, fetched over the
network like every other wire, because a board that listed every sibling and left itself off would
be claiming to be the station rather than a platform in it.

**THE SEAM THROUGH THE MIDDLE OF THE LETTERS HAD TO GO TWICE, AND THE REASON IS STRUCTURAL.** A
real Solari flap splits straight through the glyphs, so that is what it was: one near-black
hairline at 50%. On the share card the row lettered NEVER **read as a word struck through**. Two
solid faces with a lit fold between them fixed the card and then failed worse on a phone, where a
destination wraps to three lines and 50% of a tall row lands inside somebody's second line. **A
real board's rows are one line of fixed-width characters and cannot wrap; ours carry the titles
people actually gave their pages.** There is no proportion of a row that is not inside a sentence,
so the lower leaf sits at the **foot** of the flap, where no width can push it into a word.
Authentic and misread is worse than slightly stylised and legible.

**TWO TOOLS, AND ONLY ONE OF THEM TOUCHES THE NETWORK.** `pull-arrivals.py` reads the feeds and is
kept out of the pre-deploy sequence with `check-jukebox.py`, because a build that cannot run on a
train is a build that stops being run; `make-arrivals.py` needs nothing but the file. **Do not
merge them.** And `make-arrivals.py` is **not** `make-feed.py`: that one builds `feed.xml`, this
site's own feed, and the room is named after its object precisely so a search for one never lands
on the other.

**THE SOURCE IS UP THE HILL BEHIND THE FEED, AND IT IS WHERE EVERY WIRE STARTS.** Ryan's ask,
2026-10-23: a subroom carrying every GitHub commit feed on stimpunks.org's feeds page. §123 is
white travertine terraces under a warm spring at noon, one pool per repository, every commit a
deposit, because travertine is laid down a thin skin at a time by the water that runs over it.
**It shares the subject with its parent and nothing else**: The Feed is a dark machine indoors,
square and ruled; **nothing on the hill is straight**, no rule, no square corner on a pool, and
the pools step to one side and the other so none lines up with the one above. If a ruled line or
a dark ground appears in §123 it has become the concourse with a view. `pull-source.py` reads
GitHub, `make-the-source.py` draws, and **the springs are stimpunks.org's, in its order**, checked
against the mirror's feeds page. **A deposit names every hand the commit names**, its author and
anybody its Co-Authored-By lines credit, which is very often Claude, because attribution is the
habit this street kept loudest; where GitHub names no author (an address not on an account) it
says somebody GitHub does not name, and **an email address is never read**. **The morning timers'
commits are left off** by the data's `skip` pattern, which the tool checks against every subject
`tools/daily-*.sh` commits under: a new timer whose subject it misses would put a dozen machine
commits on the hill and the channel every morning. Nothing is ranked and nobody's commits are
counted. `daily-arrivals.sh` re-reads both rooms each morning and owns four paths now.

**AND THE TWO ROOMS' CB CHANNELS HEAR EACH ARRIVAL, FROM A BOT ON THE SERVER.** Ryan's ask, the same
day, after Discord's feed bots. `runFeedBot` in `netlify/cb/lib.mjs`, every quarter of an hour
(`cb-feed-bot.mjs`), reads every wire and spring from the server, where CORS does not apply, and
says each new item on `the-feed`'s or `the-source`'s channel as a message from the room, marked
**BOT** (`feed` on the message, `shapeFeed`, `feedCard` in `cb.js`, built as elements and never as
Markdown). **Which feeds it reads is written into `lib.mjs` by the rooms' own generators**, between
`feed-bot:the-feed` and `feed-bot:the-source` markers, out of the same data files the boards are
drawn from: never hand-edit them, and a wire added to a board is on its channel at the next build.
**Its first reading of a feed says nothing; nothing is said twice**, because what it read is
written with the boards' conditional write before anything is said (`lib.test.mjs` races fifteen);
a feed whose every id changed with nothing newer is remembered in silence; and **it never pushes
a person's message off** (`keepBot`: its own oldest go first, thirty of its own at most). Its
names are nobody's username (`botWord`), nobody can edit what it says, and only the base takes it
off. **Following the room by name tells a device about each arrival; Follow every room does
not** (`notifyWire`, which asks `followsRoom` with every room taken out), so those two rooms keep
their own Follow switch on the radio even while every room is followed (`BOT_ROOMS` in `cb.js`,
which `make-the-source.py` holds to `FEED_NAMES`). It is not counted in the office's messages a
day. **The friendly edits are a summary or the commit's whole message in the bot's post, telling
everybody who follows every room, and the boards reading the bot's store "so they are live"**; the
first is The Feed's refused summary, the second a phone full of commits nobody asked for, and the
third undoes the reason each plate says when it was read, which is Ryan's call.

**A ROOM WHOSE CONTENTS ARE OTHER PEOPLE'S ROOMS IS THE FIRST PAGE HERE THAT POINTS OUTWARD.**
The Garden (§28) is through a gate in the wall: our knowledge garden as a place you can walk, with
**one bed for every site we publish** and every bed linking straight out, because each of those is
already its own room and a shopfront promising a room you never arrive in would be the street lying
about its own architecture. So it is an opening rather than a premises, and it is the one place on
a night street where the sun is up. **The two rooms it collapses into are the other two daylit
ones, and the separation is physics rather than palette:** the Hermitage's light lands on a warm
plaster *wall*, with everything standing in front of it and the shadows falling sideways off a low
sun; the Guild has *no light source at all*, lit like a photocopy, with nothing casting anything;
here the sun is overhead and has come down **through leaves**, so every pale surface is tinted
green and every shadow is small, hard and directly underneath the thing that made it. **And the
palest thing in the room is not the ground** — a limewashed board is brighter than the path it lies
on, where both neighbours put their panels darker than their paper.

**AND SOMEBODY ELSE'S GARDEN GOES THROUGH THE IVY, NEVER INTO A BED.** Autistic Realms and
More Realms are **Helen Edgar's own sites**, and a bed is a site *we* publish. The only way to
plant one of hers would have been to write it into `data/arrivals.json` — which would put it on
The Feed as one of our wires and **claim her work as ours** in the one file this room may not
invent anything in. So the two refusals in `make-garden.py` face each other: a bed that is *not*
on the roster is refused, and a plot that *is* on it is refused. **A plot must name whose it is
and must say what of it is already in this garden** — without that line the section is a list of
a friend's websites on a page about ours; with it, it is the other half of every `with` line in
the beds, which say who helped *us*. And **the drawing stops where the ivy runs**: a bed shows
its soil and most of them show what is under it, and we do not get to draw the roots of somebody
else's garden, which is also why **nothing over there casts a shadow** although everything in the
beds does — the sun has not moved, the floor is past the ivy. The friendly edit that will arrive
is *these look like beds, they should be beds*; it is the subroom excuse holding somebody else's
deeds.

**AND THE BOUNDARY IS IVY BECAUSE HELEN SAID SO, WHICH IS THE THIRD THING SHE HAS DECIDED HERE.**
It shipped as a woven fence and she asked for winding ivy and stars instead — her call,
2026-09-22, on a drawing of her own gardens — and **she was right about more than the picture: a
fence says KEPT OUT and ivy says THIS IS AS FAR AS WE CAN SEE.** What that line marks is the edge
of what *we* know, never the edge of where anybody may go, which is the opposite reading and the
only correct one on a page about somebody else's work. It is written down in `make-garden.py`, in
`data/garden.json`, in the room, in the changelog and in the liner notes for the reason the one
colour of hers this repo ever changed is written in four places — except that this one runs the
other way, and a correction *from* a contributor is worth recording at least as loudly as one we
made to her. **The stars are glimmers and not a sky**: this room is midday and stays midday,
nothing is lit by them, and no ambient layer was added to the page, so the street's one daylit
garden is not quietly turned into a night one. Do not "finish" them into a starfield, and do not
put the fence back.

**THE ROSTER IS NOT IN THAT ROOM'S DATA FILE AND MUST NOT BE MOVED INTO IT.** Which sites exist, in
what order, under what names and at what addresses is read out of `data/arrivals.json` — the same
list The Feed runs on, whose order is stimpunks.org's own published feeds page. So a bed cannot be
invented here, a site cannot be quietly left out, and re-sorting the garden would be this room
overruling a decision made somewhere else, which is the Jungle Room's rule about its cams arriving
where the temptation is stronger because a garden looks like a thing you would arrange by eye.
`data/garden.json` holds nothing but our own writing.

**AND THE FEED IS THE ROOM IT COULD COLLAPSE INTO, because both list every site we run.** The
division is structural, not tonal: **a board is a timetable** — a title, a date, a destination and
the minute it was set — and **a garden is a planting plan**: what a site is for, whose hands are in
it, and nothing that changes when somebody publishes. That is why `make-garden.py` touches no
network, has no pull step beside it, and **refuses a date in a bed**. It also refuses a count of
what a site holds, for the staleness reason rather than the tally one, and the vocabulary of
ranking our own sites, because a league table of our own projects is a race between our own people.

**THE DRAWINGS ARE TOLD APART BY FORM, WHICH IS THE CAMPGROUND'S GRAMMAR INVERTED ON PURPOSE.** Out
in the field every pitch gets **one lit colour** of its own — the yurt emits, the hermitage
catches, the meadow carries — and that grammar runs out at about the fourth pitch, because there
are not many kinds of light. There are as many kinds of growth as you like: a rhizome, an umbel, a
plant with no chlorophyll in it, a frame with seedlings under glass, a runner, a dry seed head, a
scramble, a tendril, each saying something true about its site. **Every habit is also written out
in a sentence beside its bed**, because the drawings are aria-hidden decoration and a claim only
sighted readers get is not a claim this site may make; the tool refuses a bed without that
sentence, and refuses two beds that share a drawing.

**AND ITS PALETTE SPLITS AT THE SOIL LINE, WHICH IS THE FIRST TIME A CONTRAST FAILURE HAD NO
PALETTE FIX.** `check-contrast.py` put the two greens at **1.38 and 2.14** against the earth, and
because the greens are only 1.55 apart from each other **no brown clears 3:1 against both of them
at once** — so nothing could be re-coloured and the drawings changed instead: green above the line,
pale below it, every root, rhizome, mycelial thread, spilled seed and blanched shoot in the path's
own colour, which is also what a shoot looks like before it reaches the light. `make-garden.py`
**walks every coordinate of every green element and refuses one that crosses the line**, because
the next drawing will be added by somebody who has not read this paragraph. It was broken on
purpose first — a stem two pixels under and a leaf circle whose *edge* dipped below — and it caught
both, which is `check-quests.py`'s lesson about believing a checker.

**IT SETS NO DISPLAY FACE AT ALL, AND THAT IS THE ROOM'S ONE CLAIM ABOUT TYPE.** Every other world
on this street has something that shouts — a woodtype, a condensed grotesque, a fat slab, a
blackletter, a pixel face — and a garden has no signage in it, only labels. Faustina sets the
garden's own name and the label on every bed in the same breath, Mulish carries the notes, and the
loud things in the room are the plants. **Do not give it a display face**; the quiet is the design.

**THE GARDEN SPIDER IS AN ORB WEAVER AND NOT A MASCOT, and its panel is careful in our own words
rather than in softer ones.** A spider is a guide to the garden and never a replacement for it, its
best answer is an entrance, it can be wrong, and every trail it puts somebody on ends at a page a
person wrote — all of that is quoted from our own `/ask/` page, with the ethics pages linked beside
it and a way to reach a human instead. **The friendly edit here is the one that trims the caveats
to make the button look better**, on a page recommending a generative tool, which is precisely
where this organisation cannot afford to sound like everybody else.

**A QUOTE BANK IS THE MOST DANGEROUS SHAPE OF PAGE ON THIS STREET, AND THE DANGER HAS NO MOMENT
ANYBODY COULD CATCH.** The Zibaldone (§29) was asked for by somebody in the community &mdash; quotes
for any state of mind &mdash; and is built as a commonplace book, which our own glossary has had an
entry for since 2022. **Nobody ever decides to republish a book.** They add one good line, then
another, each individually reasonable, and a year later the page *is* the work instead of pointing
at it. The same drift runs through attribution: the first entry carries a full citation, the tenth
carries a surname, the fiftieth carries the sentence with nobody's name on it. Neither drift has a
moment somebody could have caught, so neither is left to care. `make-zibaldone.py` **refuses a
quotation over thirty words**, the number lives in the tool, and the room prints it &mdash; because
*we quote lightly* is not a thing a page can promise and not enforce. **Do not raise the limit.**

**AND IT REFUSES A SONG, WHICH IS THE ONE REFUSAL NOTHING ELSE HERE WOULD HAVE MADE.** Ryan's reply
to the person who asked, 2026-09-22: song lyric reproduction is an intellectual property minefield
in the US. Music publishing enforces on quotation where prose publishing shrugs, the licensing is
separate from the recording, and one line is a far larger fraction of a song than of a novel. This
street says in three places that **nothing musical is hosted here**, and a quote bank is exactly
where that promise would be broken in the way that looked most harmless &mdash; a good line, fully
credited, from a record somebody loves. **The first thing that check ever refused was a false
positive:** the word *song* matched Whitman's *Song of Myself*, and the pattern was narrowed rather
than the poem excepted. That is `check-counts.py`'s first-run lesson and `make-guild.py`'s, arriving
a third time. What is left is the vocabulary that only ever describes a recording.

**A TITLE IS NOT A SOURCE, AND THE DICKINSON IS THE PROOF.** Every line names the **printing** it
came from and says how it was checked and when, because these texts differ between printings &mdash;
The Doomscroll dropped a poem over exactly this. That Dickinson line is in the **Second** Series of
1891, edited by Todd and Higginson, not the first, and the only thing that found that out was
reading the title page above the poem instead of remembering. **The Thoreau is the other proof:**
the version everybody quotes has somebody marching to a beat and he wrote neither word. Public
domain lines were grepped out of the transcription each card names. **A line still in copyright comes
in one of two ways, and the tool refuses it without one**: read off one of our own published pages
(`read_on`), or read in the book itself by a person the card names, at a page it gives (`read_by`,
`at`). The second is Ryan's call of 2026-10-14, reversing "our own pages only" when Betsy sent in
lines still in copyright and none was on a page of ours. **Lines sent in and not yet read wait in
`waiting`, which is never printed**, each with what reading it has to settle; Claude cannot read an
in-copyright book from here, so those wait for a person. A line sent in names who sent it
(`brought`), with their say-so.

**AND A TRANSLATION HAS TO CLEAR THE PUBLIC DOMAIN TOO, which this repository had not met before.**
`make-doomscroll.py`'s test is the author dead more than seventy years, everywhere rather than in one
country. A translation is a copyrightable work of its own, so **a Roman emperor in a modern English
is a modern book** &mdash; which is why the *Meditations* there is Meric Casaubon's 1634 and why he
is credited on the card. **Seneca is not in that room at all and the data file says why:** our own
glossary quotes him on words becoming works, that wording is a modern translation the entry does not
name, and the public domain one does not read that way. A gap somebody has already checked is worth
more than a line nobody can place. Do not fill it from memory.

**THERE ARE NO FACES IN THAT ROOM, AND THAT IS THE WHOLE ANSWER TO "ANY STATE OF MIND".** The
obvious build is a grid of moods you pick from and the obvious drawing for a mood is a face, which
on a Disabled people's site is **the emotion flashcard** autistic people spend their childhoods
being drilled with. The Playhouse settled this for its sound board; the answer here is the same.
Each card says what it is *for* in a sentence about a **situation**, and the tool refuses an emoji
in that field. **Nothing there is ranked, counted or voted on** either &mdash; a quote bank is
exactly the shape of thing that grows a leaderboard, and one would turn the page meant to meet
somebody where they are into a popularity contest between other people's grief. The pebbling
cabinet's refusal of a tally, arriving where the friendly edit is most obviously an improvement.

**THE FACE VARIES PER ENTRY AND THE HAND NEVER CARRIES A QUOTATION.** Ryan asked for layout and font
play per entry, so there are three text faces chosen by era. **Kalam is the hand, it writes margins
and labels, and the tool refuses a quotation set in it:** a passage in a handwriting face is an
access failure wearing atmosphere, which is the lesson The Doomscroll's blackletter already carries.
**The margin note is ours and the tool refuses a quotation mark in it**, because margins that could
hold quotations would quietly become a second, uncited quote bank running down the side of the cited
one, and nobody would ever see it happen.

**EVERY OTHER PAPER ROOM ON THIS STREET IS PRINTED AND THIS ONE IS WRITTEN.** That is the separation
and there is no other one available, because this street already has a great deal of ink on paper.
The Mopery is a cold **building** you stand up in, with type punched into the page by a press, and
its books belong to an institution. The Doomscroll is **one unbroken machine-set roll** of cold grey
newsprint with nothing cut and nothing rotated &mdash; the closest call, and the fold is the whole
difference: this is **bound leaves**, with a gutter, a verso and a recto. The zine table is a
**photocopy** made in a hundred copies to give away; this is one copy and nothing in it was cut out.
And where the guild is lit like a photocopy and the garden's light has come through leaves, **this
is the one room lit by something in the room with you** &mdash; a lamp on the left at desk height,
which is why the paper has a tooth, why every sheet throws its shadow down and right, and why the
fold has a gradient in it. **If that paper ever goes grey, or the fold ever goes, two rooms have
become one.**

**THE SLIP IS TASL PLUS THE THREE FIELDS A QUOTATION ALSO NEEDS, AND IT SENDS NOTHING ANYWHERE.**
Creative Commons' Title, Author, Source, Licence is the right skeleton for a reused photograph, where
the thing you point at is one file at one address. A quotation comes out of a *work*, in a
*printing*, and the person copying it found it *somewhere else again* &mdash; and that last field is
the one that matters most, because **most misquotations in circulation were copied in good faith off
a page that had already got them wrong.** There is no form action and no endpoint: the button
composes a block of text to the clipboard and the person decides where it goes. Collecting our
community's words to a server nobody told them about is the consent this street spends a mechanism
protecting, arriving as a form. **The slip's fields are generated from the same list the entries are
checked against**, so the day somebody adds a field to an entry cannot be the day the form stops
asking for it.

**AND `:where()` DOES NOT CONJURE A RESET, WHICH COST THIS ROOM SEVEN TILTED LEAVES.** §3's gentle
reset names `.tilt-a` to `.tilt-d` and nothing else &mdash; it is a reset for the shared tilt
classes, not for the word `transform`. Scoping a room's own rotation with `:where()` guarantees it
cannot be **out-ranked**; it does nothing about there being no rule to outrank it. `check-gentle.py`
found all seven still lying at their pasted angles at Gentle, which is the Faery Yurt's windowsill
exactly. **A room that tilts anything writes its own reset beside the rule that tilts it.**

**THE HARDEST COLLAPSE ON THIS STREET IS NOT A SUBROOM, IT IS TWO STOREFRONTS THAT ARE BOTH
HOLES IN THE GROUND.** The Rabbit Hole (§30) and The Latibulum have the same floor plan. Every
earlier version of this temptation came with a structural excuse attached — *it is only a
subroom*, *an area should look like an area*, *they are both cosy* — and this one needs no excuse,
because the two rooms are literally the same object. What keeps them apart is that **the burrow is
somewhere you arrive and the hole is somewhere you keep going**, and it has to stay structural:

  · the burrow has a floor, walls, furniture, a lamp at knee height and a shelf. It is
    horizontal, it is at rest, and almost every word in it sits **dark on lit plaster**. The hole
    has no floor, no wall to lean on and **no furniture whatsoever** — it is vertical, the light
    is above and behind you, there is less of it the further down you read, and every word is
    **pale on the dark**.
  · **the burrow is earth and is BROWN. There is no brown in the hole at all** — it is wet slate.
    If those greys ever warm up at the edges the two rooms have become one, and it is the newer
    one that moves.
  · the burrow is lamplit and the hole is **daylit, from one end, badly**. A candle lights a foot
    of a large room; this lights less of one the further in you go. That also keeps it off The
    Mopery, which is the other cold blue-black room and is a *building* you stand up in.

**A GROUND THAT DARKENS DOWN THE DOCUMENT IS A NEW SHAPE AND IT REFINED THE ZIBALDONE'S RULE.**
That room puts a flat `background-color` under its gradient and picks the **darker** end; this one
picks the **lightest**. Not an inconsistency: in both cases the flat colour is the **worse case for
the type standing on it**, which is the actual rule, and one room sets dark type on pale paper
while the other sets pale type on a dark wall. And because this gradient runs the height of the
*document* rather than of a sheet, the colour under a word depends on how far somebody has
scrolled — which no flat value can honestly stand in for — so **every block that carries text sits
on a flat panel of its own** and the wash carries nothing but the header's lines.

**A ROOM BUILT OUT OF ONE SONG DOES NOT GET THE SONG'S WORDS, AND A TOOL HOLDS THAT LINE.** Our
own glossary entry prints the whole lyric; this room prints none of it. The reasoning is already
written down for the Zibaldone — Ryan's call, 2026-09-22 — and the street says in three places
that nothing musical is hosted here. **The friendly edit is real and it will arrive:** a room
whose spine is one song, whose source page has the words on it already, and whose headings are
phrases from it, reads *thin* without them, and whoever pastes them back will be right about the
page and wrong about everything else. So `make-rabbit-hole.py` refuses a lyric field **and any
value shaped like verse** — several short hand-broken lines, which is what a lyric looks like in
a JSON string and what a sentence never does. A heading that is a phrase of hers is credited to
her where it stands. **Do not put the words back.**

**THE ENGRAVINGS ARE SHOWN BECAUSE THEIR SCANS SAY SO, WHICH IS THE MOPERY'S TEST AGAIN.** Six of
Tenniel's 1865 cuts: published 1865, artist died 1914, out of copyright everywhere, and every
file used carries an **explicit public domain statement** — exactly what the Library of Congress
facsimile in the Mopery did not have and the reason that one is still a door rather than a
window. **The 1865 edition captioned none of its illustrations**, so unlike that room's Doré
plates there is nothing printed to quote: every word beside an engraving here is ours, and which
one sits beside which paragraph is **our reading, stated on the page**. The tool refuses a plate
with no sentence of ours, no rights page, or no file on disk. **And the two drawings in that room
that are ours are abstract on purpose** — a shaft of rings and an engraver's block, no figures in
either — because the engravings further down are somebody else's line and a drawing of our own
beside them would only be a worse copy of it. That is also why the share card is the shaft and
not one of the cuts.

**AN HTML ENTITY DOES NOT SURVIVE `.upper()`, AND THAT IS A THIRD SHAPE OF THE SAME BUG.**
`&rsquo;` in a string that gets uppercased for a small-caps line came out as `&RSQUO;` and
rendered as five literal characters. `data/toys.json` already carries this lesson for a `data-`
attribute written with `textContent`; this is the same fault arriving through a string method.
Write the character, which uppercases to itself.

**THE FIRST MID-GREY ROOM, AND THE GREY IS THE WHOLE SEPARATION.** The Foundry (§32) is a type
foundry: a grey iron workshop under a dirty sawtooth roof with a bench in it where any words on
this street can be set in any face on it. Every other world here is **either a night ground with
light applied to it or a sheet of paper with the room cropped away**; this is the middle, the
colour of the metal, and the only pale object in it is one proof. It is also the one room whose
CONTENT is the typefaces, which makes the four paper rooms the obvious collapse and each is held
off by something structural: the Mopery is a cold **building** whose type is impressed into the
page, the guild is manila lit like a photocopy from nowhere, the Doomscroll is one unbroken roll
of warm foxed newsprint, and the Zibaldone is **bound leaves** with a gutter and a fold. If the
floor ever goes near-black it has joined the night rooms; if the page ever becomes the paper it
has joined the paper ones. **A FURNACE WAS THE OBVIOUS BUILD AND WOULD HAVE MADE IT THE SEVENTH
WARM ROOM.** North light is what a workshop was actually built for — the glazing faces *away*
from the sun so the work has no glare on it — so nothing in there has a lit face, and the only
warm value is brass, which is a metal rather than a light.

**NOTHING ABOUT A TYPEFACE IN THAT ROOM WAS TYPED, AND THE FIRST PULL FOUND A FALSE CLAIM IN
THREE PUBLISHED PLACES.** `pull-foundry.py` reads each family's own record out of
github.com/google/fonts and cross-checks the licence against the directory it lives in;
`make-foundry.py` needs nothing but that file, and **they must not be merged** —
pull-arrivals.py's rule. **Four of these families are Apache 2.0 rather than OFL** — Permanent
Marker, Rock Salt, Special Elite and Ultra — and love.css's §1 comment, the liner notes twice and
the Mopery's generated credit line all said every one of them was OFL. A licence nobody has
checked since the file was added is a claim rather than a fact.

**AND ADDING A FONT USED TO FALSIFY A NEIGHBOUR SILENTLY.** The Mopery's nook says its picker
holds every typeface on this street and llms.txt says the poem can be set in any face on it;
**eighteen were missing** by the time anybody counted, because adding a file to `fonts/` and
adding an `<option>` two rooms away are two edits and only one is obviously required. That picker
is **generated** now from the same record the Foundry's shelves are built from, and
`check-faces.py` reads **every such list's published markup** — never the generators — in both
directions, The Open Notebook's sticker drawer included since 2026-10-12. Do not add an option by hand;
that is what went wrong.

**AN ITALIC IS A SECOND ALPHABET AND A SLANT IS THE ROMAN PUSHED OVER, AND THE ROOM SHOWS YOU
RATHER THAN TELLING YOU.** The italic is offered **only where fonts/ holds an italic file**,
because the browser answers a request for one it has not got by inventing it: nothing looks
broken and the room has told a lie about somebody's typeface. Measured, not assumed — on Cardo,
`oblique 12deg` renders at the roman's 676px against the real italic's 660px. **THE SLANT IS
`font-style` AND NEVER A TRANSFORM**, and there is no transform anywhere in §32, because
`check-gentle.py` reads skew out of the computed matrix and cannot be asked to tell a leaning
page from a leaning letter. **A WEIGHT IS OFFERED WHERE THE DRAWINGS DIFFER, WHICH IS NOT THE
SAME QUESTION AS WHETHER THE BYTES DO** — and this room asked the wrong one from the day it
opened. Most of these families are variable fonts declared against one file, so the bench grouped
each family's variants by the sha of that file and kept one. **Identical bytes, different
outlines:** the browser instances the file's own weight axis at every declaration, so the rule
threw away bolds that work — measured out of one file at 64px, Cinzel's 700 lays down 68% more
ink than its 400, Work Sans' 45%, Space Grotesk's 41% — and the room printed a line saying it
held one weight for families the street sets at two. **`check-weights.py` renders the published
picker and refuses two offerings that come out the same**, which is the check the sha was
standing in for; it also refuses a weight love.css does not declare and a declared weight the
bench is keeping in a drawer, which is how Nunito's 700 was found missing from
`fonts/_sources.json` entirely. **Advance width alone cannot decide it** — Courier Prime and
Space Mono are monospaced, so their 400 and 700 share an advance to the hundredth of a pixel
while the bold lays down about 40% more ink — so it measures ink and advance and calls two the
same only when both match. Do not put the sha back, and do not widen the thresholds.

**IT IS THE ONE ROOM WHERE SOMEBODY ELSE PICKS THE COLOUR OF THE TEXT.** Four ink and paper
pairs, each printing its **own measured ratio on its own control**, and the tool refuses one
under 4.5:1. **There is no colour picker and there is not going to be one.** **THE LIGHT MOVED
RATHER THAN THE PALETTE**: the north light began as a fixed full-height wash, which composites
the floor to `#596267` and puts the room's link brass at 3.14 and its fine print at 3.34 — and,
being fixed, could put that ground under *any* paragraph depending on how far somebody had
scrolled, which is The Rabbit Hole's problem again. It is absolute and 340px tall now. **A light
that follows the viewport is not a light, it is a veil in front of the reader.**

**NOTHING THERE DESCRIBES A TYPEFACE, AND THAT IS A REFUSAL.** A line of appreciation beside
every family would be inventing type history at scale in the format most likely to be believed —
the herbarium's refusal to guess at a binomial, arriving where there is one to write for every
face. What it says is who drew it, what licence it travels under and **which room here sets it**,
and that last claim is checked against love.css rather than trusted. **The proof prints and the
room does not**, carrying a colophon with the designer's name on it, because printing somebody's
typeface is exactly where the credit should travel — verified by rendering the PDF and finding
one page with two fonts embedded. And **nothing is counted**: not the faces, not the proofs, and
there is no ranking of one designer's work against another's.

**THE PAGE ABOUT THE NAME IS THE FIRST THING THAT HAD TO BE KEPT APART FROM THE FRONT PAGE.**
Danny the Street (§33) is the road surface seen from directly above, under one sodium lamp, at
four in the morning: no walls, no door, no furniture, nothing standing up in it anywhere. Every
earlier version of this problem had two rooms in it; this is a room and the page it hangs off,
and **both of them are a street at night.** What keeps them apart is where you are standing.
§5 is seen from the pavement, at eye level, looking INTO lit windows, with a typeface per
shopfront and everything in it standing up. This is a plan, with one typeface and **one hue** —
because low-pressure sodium is effectively a single wavelength, so under it nothing has a colour
of its own, only a brightness. That is also what holds it off the seven warm rooms, which are
every one of them lit by a flame or by the sun and full of things that keep their own colours.
**If a second hue ever appears in §33 the lamp has been changed for a different kind of lamp**,
and the argument goes with it. The campgrounds is the other outdoor night and has the sky in it;
under a lamp you cannot see up at all.

**AND THE CREDIT IT CARRIES WAS ONLY EVER IN A MARQUEE, which is a thing to remember about every
other credit here.** The front page has said DANNY IS THE STREET since it opened, in a scrolling
band that is `aria-hidden` because it scrolls and is decoration — so on a site whose two
surviving careful habits are contrast and attribution, **the one place the architecture was
credited could not be reached by a screen reader.** It is a paragraph under the dial now, in
text. Nothing of DC's is reproduced on that page: no panels, no artwork, no dialogue, and
**every drawing on it and on its card is of a road**, which is a thing nobody owns. The comics
write Danny as *he* in 1990's vocabulary and the television version is genderqueer; **ours takes
they/them** — Ryan's call, 2026-09-22 — which is a decision about this site rather than a
correction of anybody's canon, and the page says so rather than leaving it to be noticed. One
quotation, chased to the original: uproxx.com renders its article text through JavaScript, so it
was read against the Internet Archive's capture and **the page publishes which**, because an
unchecked quotation must not sit among checked ones looking identical. An unsourced origin story
for the character that is still in circulation was left off on purpose, which is the herbarium's
refusal to guess at a binomial arriving in a fandom.

**THE STREET HAS AN EDGE AT EACH END NOW, AND THE SECOND AREA IS THE FIRST ONE'S HARDEST CASE.**
The Outskirts (§34) is past the last streetlight where the campgrounds is past the treeline, and
*"an area should look like an area"* has already been refused here once &mdash; with the extra trap
that **both areas are outdoors, at night, with signs standing on bare ground and nothing built**.
What keeps them apart is physics and has to stay:

  · **the campgrounds is lit by NOTHING.** An open field with the sky still on it, everything
    evenly dim, nothing casting anything, and you can see all the way to the treeline. **The
    Outskirts is lit by HEADLIGHTS** &mdash; one low, level, close beam from off the page, so every
    sign has a bright face and no back and the road goes black an inch past it. It is not dark
    because it is empty; it is dark because you have no light.
  · a campground sign is **routed** into wood by a machine and maintained by somebody. A sign out
    here was **painted** by whoever owned the premises, once, and has been in the weeds since.
    Alfa Slab One against Bowlby One SC, which is where that difference actually lives.
  · the field is **cold** &mdash; spruce, lichen, a moon-coloured link. Out here the only colours
    are the beam and the paint. **Nothing in The Outskirts is blue.**

**AND IT IS NOT DANNY THE STREET**, which is the other road on this site: that page is a road seen
from **directly above** under sodium, one hue and no shadows because nothing in it stands up. This
is a road seen from **on** it, at eye level, with things standing at the side. Same subject,
opposite position &mdash; one has a horizon and one has a plan.

**AND NOTHING OUT THERE WAS SENT OUT THERE. THIS IS THE ONE THING THE AREA GOT WRONG ON ITS FIRST
DAY.** The Outskirts shipped carrying the ordinary real-world reading of an edge-of-town: premises
that *were never going to get planning permission*, a line about out-of-town being *where everything
gets pushed that a town has decided is not respectable*, and a Covenstead described as a group *the
town would rather not think about*. Ryan caught it, 2026-09-22, and the objection is structural
rather than a matter of taste: **our town is stimpunks.world and it accepts everybody, so it has no
outside to push anybody to.** A street that rearranges itself for whoever turns up cannot also have
a wrong side of it. The framing was imported from real towns, where it is true, into the one place
on this site whose entire premise contradicts it — and it arrived sounding sympathetic, which is why
it got past everything.

**The road is a direction and not a verdict.** What is down these turnings is there because that is
where it is: a fort stands in a field, a screen stands in water, and neither is in exile. When the
next turning is built, *this is where the disreputable ends up and we are the disreputable* will
present itself again as the obvious and rather flattering thing to say. **Out is not the same as out
of favour**, and there is no group on this site that anybody here would rather not think about. The
words this area actually wants are about **hours and room** — things that keep their own time and
want space around them — never about being unwelcome somewhere else.

**THE VENUE ON THAT ROAD IS LIT FROM THE GROUND UP, AND NOTHING ELSE HERE IS.** Looming Rocks
Amphitheatre (§38) is turning 03: floods stand on the ground and point UP the rock, so a face is
brightest at its foot and goes dark towards the top, and there is nothing overhead at all. **That is
the exact inverse of Sithen**, one turning back, lit by a full moon from directly above — and of
**the Lagoon**, two turnings back, flat frontal light across water at eye level. Three rooms on one
road, three directions of light, and vertical was the one nobody had taken. It earns the road rather
than the campsite by Helen's test: crowds, volume and staying out late is what The Outskirts is for.

**AND WHAT GLOWS IS NOT THE LAMP.** The lichen fluoresces — it takes light you cannot see and gives
back light you can — which is **emission rather than reflection**, and the third kind of transmitted
light on this street after Swaying Sweetgrass (through grass blades) and The Feed (through a mask).
The lamps are violet; what comes back is cyan-green. **That green is the pair to watch**: the
Lagoon's acid is a *yellow*-green one turning along the same road, and the two are far apart in blue
on purpose. If this ever warms towards yellow, two music rooms on one road have started sharing a
colour.

**THE STAGE IS THE HERMITAGE'S SET AND KEEPS ITS PROMISES, WHICH ARE THE STREET'S.** While the stage
is dark, **tuning is silent** and nothing is fetched; once something is playing, tuning changes the
picture. The desk names the act it is about to move to **and how long that one runs**, before the
press — and that matters more here than at the campfire, because **these are full concerts**, the
shortest nearly an hour. `looming.js` is a separate file from `hermitage.js` **on purpose**: the two
sets look alike and are not the same object, and a shared widget would be the harmonising instinct
arriving through a script tag. What is shared is `love-embed.js`, still the only thing here that
builds a YouTube iframe. The running order is a `<details>` and works with scripts off.

**A REFUSAL COPIED FROM ANOTHER ROOM DID NOT SURVIVE THE MOVE, AND THAT IS THE LESSON.** The
herbarium catches a guessed binomial with a shape test — one capitalised word, one lowercase word —
which works there because that page is **short labels**. Run over prose it matches the start of
nearly every sentence, and its first run here refused *Rocks that*, *Once something* and *Ferrell
sings*. Excepting those phrases would have been the mistake this repo has written down three times.
**It is a shape IN A PLACE now**: sentence starts are ignored, and it only reads sentences that are
about lichen at all. **Verified in both directions** — a real binomial in a lichen sentence is
caught, a band name in a note is not. When you carry a check between rooms, carry its *assumptions*
too and test the negative case.

**AND THE ROOM STOPPED EXPLAINING WHICH HALF OF ITSELF WAS INVENTED.** A first draft had a section
headed *what the rocks are, and which half of that is made up*, carefully separating the sentient
rocks from the real fluorescence. Ryan cut it, 2026-09-22: **this is a street named after a
genderqueer, shape-shifting road, and a disclaimer explaining that the sentient rocks are fiction is
a page apologising for being the thing it is.** The rule that survives is narrower and still
matters: **say what belongs to somebody else.** The real venue is named, credited and disclaimed in
the credits, because that is a city's property and a real place — which is a different job from
hedging your own lore. **The guard stayed even though the paragraph went**, and that is the shape to
copy: a check does not need a paragraph on the page to be worth having.

**SITE HOUSEKEEPING DOES NOT GO IN THE FICTION. IT GOES IN THE CHANGELOG.** When Covenstead moved
off this road, the area got a section headed *One that moved*, explaining that a third turning had
existed and where it went. Ryan cut it, 2026-09-22: **it was housekeeping that had just changed,
posed as permanent town history.** A road is a place. It does not carry a note about its own edit
history, any more than a real one carries a sign saying which shop used to be at number 3 — and a
page that did would be re-dated every time anything moved. `changelog.html` exists precisely so the
rooms do not have to remember. The same sentence got trimmed out of the section below it, where
"which was not true when the area opened and will not stay true" was the same instinct in miniature.

**THE TEST IS WHETHER IT WOULD STILL BE TRUE IN A YEAR.** *A board here can stand lit with no road
behind it* is a fact about how this road works and stays true. *There used to be a third turning* is
a fact about a Tuesday. The first belongs on the page; the second belongs in the log. This is not the
same as the street's habit of writing down corrections — **a correction to something we published is
owed to the reader and stays**, which is why the Napa framing, the reciprocal-ethical-unity mix-up
and the ivy are all still on their pages. The difference is whether a reader is being told something
about the subject or something about our week.

**A SIGN WITH NO ROAD BEHIND IT IS LIT AND SAYS SO.** Sithen and Covenstead are named and not
built, which is the campgrounds' `.pitch--raising` state arriving on a road. **The post is dashed
and the words are NOT dimmed**, and that is the whole care in the rule: a board you cannot read is
not a subtler board, it is a broken one. They are not links, not disabled controls and not hidden
&mdash; The Den's door rule, one area over.

**THE ROOM AT THE FIRST TURNING IS A MUSIC ROOM WITH A RACK OF RECORDS IN IT, AND SO IS CLUB
CHRONIC.** Black Leather Lagoon (§35) is the hardest collapse since The Den: both dark, both an
appreciation over a rack, both holding `make-club.py`'s pair of runtime rules. The separation is
structural:

  · **Club Chronic is a WALL.** Flat, frontal, no light source anywhere in it, no depth &mdash; a
    hundred rectangles of paper pasted onto black and layered like sediment. **This room has a
    HORIZON**: one bright rectangle standing out in the water and every object lit off it, with
    nothing behind. If the water ever goes flat, or the screen stops being the only light, they
    have become one room and **it is this one that moves**.
  · the club's **paper is the subject**. There is no paper in here at all.
  · Anton against Chivo, and **the type is the front line**: the obvious face for a monster bill is
    a **condensed gothic**, which is exactly the face the one room this must not resemble has owned
    since it opened. The obvious choice would have borrowed it.

**AND IT IS NOT ENID'S ROOM**, the other black-walled room with loud colour in it: that is an
interior, flat-lit, no modelling, many hues at once. This is outdoors, one light, two inks, and
almost entirely distance.

**THE LAGOON DOES NOT FLICKER AND THAT IS THE POINT, NOT A GAP.** A drive-in screen is a flickering
object &mdash; nearly its definition &mdash; and building one without the flicker took more work
than building one with it. Club Chronic's strobe rule, arriving in the room whose subject matter
asks for a flicker on every line. The room states it on its own door policy so nobody finishes it
later. **Do not add a flicker, a flash or a rolling scanline**, at MAX or anywhere else.

**AND CREEPSTER SETS THE TITLE AND NOTHING ELSE, EVER.** A dripping poster face is an access
failure the moment it carries a sentence &mdash; the Doomscroll's blackletter rule, in the room most
likely to talk itself out of it, because every inch of the subject is asking for it.

**THE YEAR ON A RECORD IS THE RECORD'S AND NOT THE UPLOAD'S, AND THE UPLOAD WILL TELL YOU
OTHERWISE.** Every id in that rack is an auto-generated upload off the band's own artist channel,
and each one carries a `Released on` line giving the date of **the reissue that was licensed**
&mdash; 1984 for most of that rack, which is a compilation, and 2014 for three. Trusting it would
have printed **1984 beside a 1978 single**, in the one field a reader has no way of checking. The
years were resolved separately against MusicBrainz and `make-lagoon.py` refuses a song without one.
**A tenth song was dropped rather than published with a year nobody had checked.**

**AND A THIRD PERMISSION EXISTS, WHICH NOTHING HERE KNEW.** A song in that rack answered
`LOGIN_REQUIRED` rather than `OK`: age-gated, so it plays perfectly for a signed-in adult and
renders a refusal inside our frame for everybody else. That is **neither a dead video nor an
embedding permission** &mdash; `love-embed.js` would have built the frame and `playableInEmbed` is
not the question. *Playing is not the same permission as embedding* arriving a third time:
**playing is not the same permission as playing without an account**, on a street whose whole
promise is that nothing is asked of a visitor before the press. Age-gating can also be switched on
after the fact, and when it is, the button still looks perfect.

**AND NOT ONE LINE OF ANY OF THOSE SONGS IS ON THAT PAGE.** `make-lagoon.py` refuses a note shaped
like verse, which is `make-rabbit-hole.py`'s rule in the room that needs it most: a page built out
of **one band**, whose words are half of why anybody loves them, is exactly where this street's
promise would be broken in the way that looked most affectionate. It also **refuses a ranked rack**
&mdash; no best, no greatest, no countdown &mdash; because a rack of one band's records is the
shape of thing that grows a league table, which is the pebbling cabinet's tally in a leather
jacket. The records are in the order they were made and that is the only ordering in the room.

**THE NAPA SHOW IS TOLD WITHOUT THE JOKE, AND THE JOKE IS THE STANDARD TELLING.** That 1978 free
concert at a state psychiatric hospital is almost always written up as *you cannot tell the
lunatics from the band* &mdash; psychiatric patients as the punchline that certifies how wild
somebody else is. We are a Disabled people's organisation. The room says what it will stand behind
and **leaves the gap visible**: whether anybody in that room had a good evening is not ours to
narrate, we were not there, and every account in circulation is somebody else's. **Do not fill that
gap with a nice sentence.**

**IT IS ALSO THE ONE ROOM BUILT ON SOMETHING NO PAGE OF OURS ARGUES**, which is unusual here and is
why the sources are named on the page rather than assumed. Most rooms dress up something
stimpunks.org already says; this one had nothing to dress.

**AND RANK III STOPPED SAYING "PAST THE TREELINE", WHICH IS THE SENTENCE-IN-ANOTHER-ROOM PROBLEM
AGAIN.** A class defined by geography cannot name one edge and mean both. **Not a fourth class:**
IV would encode a false ordering, because the field and the road are opposite directions rather
than different distances. That sentence lived in `make-guild.py`, in `data/quests.json`, in the
guild's own house rules, on its share card and in `llms.txt` &mdash; and **none of those is in the
file that changed**. When an area is added, look for the rooms that describe the street's shape.

**THE SECOND TURNING OFF THAT ROAD DODGES THREE COLLAPSES AT ONCE, WHICH IS A FIRST.** Sithen
(§36) is a fairy fort, and a faerie mound is **structurally The Latibulum** (a burrow under a hill),
**thematically the Faery Yurt** (already the fae room, and Helen's) and **narratively The Rabbit
Hole** (you go under and the inside is bigger). No room here has had to get out of the way of three
at once, and they are all the same move: warm interior, underground, lit by one small flame.

**THE ANSWER IS THAT IT DOES NOT GO IN, AND THAT IS THE DESIGN RATHER THAN AN UNFINISHED STAGE.** A
fairy fort is an **outdoor object** — a ring of bank and thorn standing in a field — and the inside
is precisely the part the tradition is careful never to show you. There is no interior here and no
flame. **If a door is ever opened it becomes a subroom with its own world**, the way The Den hangs
off the Jungle Room; it does not become this page with rooms added to it. The refusal also carries
the argument: half those rules are about **hospitality as a trap**, so a room that insisted you come
in and accept what is offered would be doing the thing it spends the page describing.

**AND THERE IS NO GREEN IN IT ANYWHERE, which is what holds it off the campgrounds.** That is the
likeliest collapse by a long way — both are cold, outdoors, at night, on open ground. The field is
blue-green: spruce, lichen, moss. **Grass under a full moon has a brightness and not a colour**, so
every value in §36 sits on one grey-violet line. The other separation is structural: the campgrounds
is an **open field** with posts standing about in it and the sky on it, and this is **one object**
that you circle. If a green ever appears in that section it has become the campgrounds with a hedge,
and it is this room that moves. **Moonlight is also from directly overhead** where the road outside
is lit from one low angle, which is why nothing in here has The Outskirts' single bright edge.

**THE TWO NOVEL SERIES ARE CREDITED AS THE POINTER AND NOTHING IS DRAWN FROM THEM.** Ryan's call,
2026-09-22. Laurell K. Hamilton's *Merry Gentry* books and Seanan McGuire's *October Daye* books are
why the turning exists, are named and linked in the room, and contribute **no court, character,
politics, cosmology or line**. Those are living authors' invented worlds. `make-sithen.py` refuses a
rule whose source names either series or either author, because **the friendly edit is a real one
and it will arrive: the folklore is thin in exactly the places a novel is rich**, so the most useful
material lying around is the one thing this room may not pick up. The Fandom wikis are not a source
either, and for a sharper reason than the licence — they are fan-written descriptions of somebody's
invented world, which is the format most likely to be lifted without anybody noticing.

**AND "KNOWE" IS DELIBERATELY NOT IN THAT GUARD.** It is a genuine Scots word for a knoll, older
than any novel that uses it, and refusing it would be the tool handing a living author a word that
is not theirs — the mirror image of the mistake it exists to prevent. **A guard against borrowing
names the borrower, not the vocabulary.**

**THE NAME WAS CHECKED, AND THAT IS WHY IT SURVIVED.** Scottish Gaelic *sìthean*, a hillock
inhabited by fairies, with a dictionary citation behind it. One of those two series uses this exact
spelling for the fae court, so a room taking the name while claiming to owe the books nothing would
have been advertising a debt it does not otherwise have. The word is older than both, and the room
says so rather than leaving it to be assumed either way.

**THE PAGE IS IN TWO HALVES AND SAYS WHICH IS WHICH, because a reader cannot tell them apart by
tone.** The documented half is earthworks and a motorway and is checkable. The folklore half is
traditional and every rule names its source. **Everything under *what it is like* is ours**, written
for this room and never claimed to be in the tradition. That reading is the reason the room is on
this site: the fae taboos are a catalogue of consequential rules nobody will state out loud, where
breaking one is punished and no one explains, which is the ordinary weather of neurotypical
convention for a great many autistic people.

**AND NOTHING ON IT TELLS ANYBODY HOW TO BEHAVE.** The tool refuses the vocabulary of advice in the
second person — no *you should*, no *try to*, no *learn to*, no *practise*. **A page about unwritten
rules that ended in tips for following them would be a social skills curriculum with thorns on it**,
which is the thing this organisation exists to refuse, arriving in the room best placed to get away
with it. The pattern is narrow and second-person only, for check-counts.py's first-run reason.

**ITS BODY FACE IS PLAIN ON PURPOSE AND THAT IS A REFUSAL.** A fae room is under constant pressure
to set its text in something uncial, and that is the Doomscroll's blackletter problem arriving in a
hill: atmosphere paid for out of somebody's ability to read the page. Italiana takes the headings
and is **the only thin face on this street**; Literata carries everything else with no atmosphere at
all, because the argument is that rules like these are never written down plainly, so the one place
they *are* written plainly ought to look like it means it.

**COVENSTEAD IS ON THE STREET AND IT USED TO BE TURNING 03, AND THE MOVE IS THE MOST USEFUL THING
IN THIS SECTION.** Ryan's call, 2026-09-22. The reasoning is about what each area is FOR, and it is
the test to apply to anything placed in either from now on:

  · **the campgrounds** are for people who want to be somewhat apart from each other, at peace in
    nature, with the street still in reach.
  · **The Outskirts** is for night revelry in crowds, and for anybody who wants to be as far off as
    they can get.
  · **a covenstead is neither.** It is a group that meets REGULARLY, which wants a premises with a
    door on a street where people already are.

**Helen Edgar's observation sharpened it** — that everything out on that road could sit on the
campsite if it had planning permission — which is worth keeping as the question to ask: *would this
be just as happy on the campsite?* If yes, it is probably not an Outskirts room.

**IT CHANGED WORLDS WHEN IT MOVED, AND THAT IS THE PART TO COPY.** It was not relocated with the
same paint on it. Out there it was a dark kitchen lit by several lamps that did not match — the only
room on the street lit by more than one source. On the street it is **daylit, warm and domestic: one
window, mid-afternoon, limewash and the good china out**. A room that moved between areas and kept
its stylesheet would be telling you the areas do not mean anything.

**AND THE ARGUMENT MOVED WITH IT RATHER THAN BEING DROPPED.** The device carrying *several people
who do not match, meeting anyway* is now **the china**. Nobody's cup is anybody else's cup. **That
is load bearing: if the crockery is ever made to match, the room has lost its subject and kept its
wallpaper.**

**THREE PALE ROOMS ALREADY EXISTED AND THE LIGHT IS WHAT TELLS THEM APART.** The Hermitage is a
**landscape** under low morning sun with the shadows falling away and solar infrastructure on it;
the Garden is **midday from overhead through leaves**, outdoors, everything tinted green; the Guild
has **no light source at all** and is lit like a photocopy. This is an **interior with one window in
the side of it**, so the light arrives from one side and lands in a patch. **Its wall is warm and
slightly pink where both the other daylit rooms are green-white** — if this limewash ever cools
towards green it has become the garden with furniture in it. It is also not **The Latibulum**, the
street's other dark-on-lit-plaster room: that is a burrow with no daylight anywhere in it and one
lamp at knee height.

**A REPAINT LEAVES DEAD var() BEHIND AND NOTHING WARNS.** Replacing this room's palette orphaned the
job marker, which went on stroking `--cov-tallow` after that name stopped existing — and **CSS drops
an unknown custom property and paints nothing**, so the kettle rendered with no line at all. Not an
error anywhere; `check-contrast.py` had nothing to say because the pair was gone rather than wrong.
**When a room is repainted, grep the old names** — markers, card CSS and generator drawings all sit
outside the section you are editing.

**TWO ROOMS IN THAT AREA HOLD OPPOSITE RULES ABOUT THE SAME VOCABULARY, ON PURPOSE.**
`make-sithen.py` **refuses advice** — that room is a catalogue of unwritten rules and must not tell
anybody how to follow them. `make-covenstead.py` **refuses an order** — this room is explicitly
about counsel that stayed counsel. *Rede* is Middle English for advice, and the best-known couplet
has been in circulation since 1964 without hardening into a code somebody can be expelled for
breaking, which is the rarer thing running the other way on a site whose readers have met a great
many rules dressed as guidance. **Do not make those two tools agree.** They are make-jungle.py and
make-den.py's runtime pair, arriving in ethics.

**THE RULE OF THREE IS ARGUED ABOUT INSIDE THE TRADITION AND THE ROOM REFUSES TO SETTLE IT.** It is
not a universal article of faith: there are Wiccans who read it as an over-elaboration on the Rede
and others who consider it a modern innovation built on Christian morality. **A page stating it
flat, as *the* witch law, would be deciding a live argument inside somebody else's religion on their
behalf, from the outside, in passing, for atmosphere** — and the flattened version is always the one
that travels. The tool refuses a tenet marked contested that does not say what is contested about
it, because an empty flag is worse than none.

**PRATCHETT'S WORDS ARE ON THAT PAGE AND THEY ARE THE POINT OF IT.** First Sight and Second
Thoughts are his, and **the sentences that define them ARE the tenets**, the way the Rede's couplet
is. The room shipped its first draft naming the concepts and linking out for the words — on the
reasoning that they are quoted properly elsewhere on our own sites and this surface had no business
holding them — and **that was too cautious and it gutted the room**: it described the thing instead
of showing it, and sent a reader somewhere else for what the page was about. Ryan's call,
2026-09-22. Short attributed quotation in commentary is ordinary practice. **What is not optional is
the attribution**: every quotation names its author, its work and its year and links to the edition.

**AND THE ROOM SETS ITS OWN CAP RATHER THAN BORROWING THE ZIBALDONE'S.** That room is a **quote
bank**, where the danger is drift — nobody decides to republish a book, they add one good line at a
time until the page is the work — so thirty words is right there and it prints the number. This room
quotes a handful of named passages the commentary is *about*, and the sentence defining First Sight
runs to thirty-five words: a cap that cut it in half would be pedantry dressed as rigour. Sixty fits
a defining sentence and refuses a scene. **The long exchange the shorter lines come out of runs to
several hundred words and stays a link**, because our own philosophy page is the better thing to
read and is there to be linked rather than raided. Raise that number on purpose, in the data file,
with the reason written down — never to fit one passage.

**NOBODY IS INITIATED AND NOTHING IS COUNTED.** No degrees, no levels, no test at the door, no
record of how often somebody came. A place people come back to cannot also keep a register of how
often they needed to — the pebbling cabinet's refusal of a tally, arriving in the room shaped most
like a membership.

**AND ITS TYPE IS ORDINARY ON PURPOSE.** The witches this room is partly built on are practical,
domestic and unglamorous, so a page about that set in something carved, uncial or gothic would be
arguing against itself in the typeface. **It is not the Garden's move** — that room sets no display
face at all because a garden has labels and no signage. This one *has* one and has deliberately
picked a plain one, which is a different claim: not *there is no signage here* but *the sign is the
same as everybody else's.*

**THE LIGHT IN DEAD TIRED SOCIETY IS OUTSIDE THE ROOM AND NOBODY SITS IN IT.** §40 is peer
support for the burnt out, in a borrowed room after hours with the big lights off and the door
left ajar. The only light is a corridor's strip lights through the gap, lying on the floor as one
hard wedge, and **every word on the page stays in the shade** — `--dts-hall` is drawn and never
carries text, and it is in `ORNAMENT` at 14.8 because the reason is not contrast: masking is
performing under a light, and this is the room where nothing has to. **There are no panels
either**, because a box darker than the room is The Feed's claim. If anything in there is ever lit
to make it "pop", the room has lost the one thing it is about. The collisions are structural: the
Latibulum is for burnouts too but is a burrow for being unfindable ALONE, brown, dark on lit
plaster; the Healing Checkpoint's light comes UP out of the floor, soft, where this one lies flat
with a hard edge; Covenstead is a group meeting with side-light too, but daylit all over and it
sets its words IN its patch; and **the Mopery is the collision the NAME invites**, because Dead
Poets Society is the film dark academia is named after — so no candle, no book, no stone, no
tweed, and nothing old. The corridor's tubes do not flicker, for Club Chronic's reason.

**THE NAME IS THE ONLY THING TAKEN FROM THE FILM.** *Dead Poets Society* (1989, Peter Weir, Tom
Schulman) — no line, no scene, no character, no still, no motto. `make-dead-tired.py` refuses its
characters, its school and its two famous lines outright, with no negation window, because the
most famous parts of a living writer's screenplay are the most tempting to borrow for atmosphere.
The standing orders decline to stand on a desk, which is a joke about being told to stand up for
yourself and describes nothing.

**IT REFUSES ADVICE, RESILIENCE AND A TALLY, AND IT SKIPS BLOCKQUOTES TO DO IT.** A burnout page is
exactly the shape of thing that fills up with tips, and every one is homework for the person least
able to do it; resilience is the praise that got most of us there. Both are refused in the room's
own voice with the negation window. **The sweep skips quotations**, which is where it parts from
`make-checkpoint.py`: the NeuroHub line on the justice sensitivity peg and our own ecology page are
the sharpest things anybody has said *against* resilience, and a quotation criticising a word has
to be allowed to contain it. Do not "tidy" that by sweeping everything. Do not add a recovery
timeline, a before-and-after, or a check-in that remembers anybody.

**THE PAGE IS NOT A MEETING AND SAYS SO.** No times, no sign-up, no chat link, no facilitator,
because none exists; it points at the community and at mutual aid. When the society is real it gets
one paragraph and one link — see DECISIONS.md. **Do not dress the page up as a meeting before there
is one**: a broken promise costs most in the room for people with nothing left to spend on it.

**PASSING IS A WHOLE TURN, AND THE BUTTON SAYS SO BY BEING FIRST AND THE SAME SIZE.** The talking
piece ships `hidden`, sends nothing, keeps nothing, and putting it down empties the box. Its answer
is on the piece you pressed. Lexend carries every word that is read because it was drawn against
reading fatigue; Goudy is the society's charter face and is never set as a sentence.

**A ROOM'S BASE `p` RULE OUTRANKS ITS OWN COMPONENTS, AND IT HAPPENED HERE ON DAY ONE.**
`.dead-tired p` is (0,1,1) and quietly set the est. line, the over-line and the trail at body size,
because every component class is (0,1,0) — the Playhouse's `.toy--orange span`, arriving as a font
size. It is `.dead-tired :where(p, li)` now, which is (0,1,0) and loses to anything written after
it. Found by looking at the page; no checker reads a font size.

**LAUGHINGSTOCK IS LIT FROM BEHIND YOU, AND ONLY WHAT A COMIC SAID STANDS IN THE LIGHT.** §41 is a
comedy cellar seen from the back of the house: one follow spot in the lighting box over the
audience's heads throws one hard-edged pool onto a brick wall, and every shadow falls straight
back onto the brick. **The comics' own lines are the only words ever set in `--ls-spot`**, dark ink
in an oval of it with their name underneath; everything of ours &mdash; the write-up, our context for
each line, the house rules &mdash; is out in the dark with the audience. That is the write-up's
argument made structural (*controlling the frame*), and it is **Dead Tired Society's rule turned
inside out one door along**: there nobody sits in the light because masking is performing under
one; here exactly one person stands in it, because they chose to and they are holding the mic.
**Do not put a word of ours in the light to make it "pop."** The collisions are structural: Club
Chronic is the other club with a stage and is a wall with no light in it at all; Black Leather
Lagoon's bright shape is the SOURCE, in front of you, where this one's is where the light LANDS;
and **the brick is red and not brown**, because a browned brick wall lamplit at knee height is The
Den with a microphone in it. The neon does not flicker, for Club Chronic's reason; the only motion
is the water on the stool going sparkling at MAX, with a translate. **Nobody is drawn on the stage**:
the only people on it are the comics in their own sets, and we do not draw their bodies for them.

**THE FRIENDLY EDIT IN THAT ROOM IS "BRAVE", AND THE TOOL REFUSES IT.** Somebody being kind about a
room full of disabled comics reaches for brave, courageous, inspiring or overcoming before anything
else, and one sentence of it turns the page into the thing the page is about &mdash; the write-up says
in as many words that disabled comedians are not inspiring for being on stage. `make-laughingstock.py`
sweeps our own voice with the negation window so the house rules can still say nobody is. **It is
narrowed rather than excepted**: bare *inspiration* is allowed because *inspiration exploitation*
is our own glossary entry and *the inspiration column* is the write-up's phrase for the trap; what
is refused is calling somebody it. **It skips blockquotes and anything in curly quotes**, which in
that room is exactly the comics' lines, so "I suffer from people" is allowed to say suffer, **and it
skips set titles**, which are the comic's or the channel's &mdash; one of them says HANDICAP. It also
refuses a headliner and any ranking: a comedy bill runs opener to closer as a matter of trade, and
the bill is in our playlist's own order with nobody bigger than anybody else.

**THE LINES IN THE LIGHT CAME FROM OUR WRITE-UP AND SAY NOTHING ABOUT WHICH SET.** Every one was
checked word for word against the mirror's copy of the post; the post does not say which special
each line is from, and neither does the room. **Do not attribute a line to a set** without watching
it &mdash; that is the jukebox's guessed mapping at a comedy club. **And our post states the premise of
Josh Blue's Botox bit as fact** (developed for cerebral palsy, then redirected to cosmetics); the
room's context line for it deliberately does not, and the post is stimpunks.org's to correct, not
this repo's.

**THE BILL IS A MIRROR OF THE PLAYLIST AND SAYS SO.** It is read off the playlist page (last on
2026-10-03, with `yt-dlp --flat-playlist -J`), in that playlist's order, and a set added to the
playlist is on the stage the next time somebody
puts the whole night on and not on the bill until somebody reads the playlist again. The room prints
the date under the bill. `make-laughingstock.py` holds `make-club.py`'s pair &mdash; a runtime required
on every set and refused on the playlist &mdash; and the playlist id is one of YouTube's new short
ones (`PLUGzxgyttDkE`, thirteen characters), which **was verified to embed and to play by pressing
play inside the frame**, not by reading the poster. The playlist's first entry is on the bill,
which is the one row that decides whether the whole night embeds at all. **Since 2026-10-03 the bill is
a rack and the whole night is its screen** (rack.js, Ryan's ask). It can also run AHEAD of the playlist:
a set marked `"playlist": false` is on the bill and not in the whole night, and the line under the bill
naming it is generated from that flag. When the playlist has the set, take the flag off; do not leave
the bill claiming a gap that has closed. **A note never says longest, shortest or newest**, and the tool
refuses it: Freak Accident's "the longest set on the bill" went false the day a longer one went on.

**THE LIGHTBULB PICTURE HOUSE KEEPS ITS HOUSE LIGHTS UP, AND NOTHING IN IT IS BLUE.** §42 is a
picture house where every screening is a relaxed screening: lit ALL OVER by bare bulbs in brass
sconces, so the ground is lit velvet rather than black and there is no projector beam, because a
beam only shows in the dark. That is the separation from every room with a bright rectangle in the
dark &mdash; the Lagoon's screen in black water, Laughingstock's pool on a brick wall in a dark house.
**Laughingstock is the one to watch**: also red, also a room you face something lit in. If the
house lights here ever go down, it has become that room with a screen in it.

**NO BLUE, ENFORCED BY READING THE PALETTE.** A lightbulb theater in a neurodiversity room, lit
blue, is Light It Up Blue &mdash; the awareness campaign our own Acceptance entry quotes autistic
people refusing, with Amy Sequenzia's line about "all the pretty blue lights" on the page.
`make-picture-house.py` reads every `--lph-` colour in `:root` and every literal colour in §42 and
refuses a blue or cyan hue, because *nothing in this building is blue* is a published sentence one
nice-looking colour could falsify. The ornament is the gold infinity (Autistic UK's, from Au) and
never the rainbow one, which has blue in it. **Do not add a blue, and do not add a puzzle piece**;
the tool also refuses the vocabulary of awareness in our voice with the negation window, skipping
the quotation, the film titles and anything in curly quotes, because several of those films use
person-first language about themselves and that is their call.

**EVERY CARD ON THE RACK SAYS WHAT IS IN ITS FILM BEFORE THE PRESS**, beside the runtime and for the
runtime's reason: a panic attack, sustained bullying with unwanted contact, two jokes about suicide,
a sponsor segment. The tool refuses a card with no `content` key; **null is a real answer that
means somebody looked**, and a missing key means nobody did. **The lines were written from the
films, not the titles**: fourteen from their captions (yt-dlp's auto-subs; YouTube's own timedtext
endpoint now returns nothing without a session token), one from its maker's description and our
Autism Pathway, whose captions were rate-limited. **No maker's pronouns appear on the rack** and the
tool refuses one, because not one film states them. A card is a mirror of the playlist and drifts
by design; the room prints the date. Every screen has a rack now, and **every rack is a `<details>`
that ships OPEN**: shut, its cards have no layout, so `check-contrast-live.py` and `check-focus.py`
would pass a page they never measured. Do not flip the default to make the page shorter.

**CAPTIONS ARE ON BY DEFAULT, AND THAT WAS TESTED FRAMED.** Every frame here uses `data-embed-src`
with `cc_load_policy=1`, which `love-embed.js` builds unchanged. It was verified by framing a
single film and a playlist from a page on the dev server and seeing captions come up; **loading an
embed URL on its own gives Error 153 for every video** and proves nothing, which is
`check-jukebox.py`'s old lesson arriving at a new parameter.

**SCREEN THREE IS EVERY CAMPFIRE, NEWEST FIRST, AND ITS RACK IS BUILT FROM THE CAMPFIRES, NOT THE
FILMS.** Ryan's brief, 2026-09-28. `campfire` in `data/picture-house.json` is one entry per Campfire
Learn Together, each naming the post we wrote for it and the films that session watched, in its
order; `make-picture-house.py` refuses campfires out of date order (new ones go at the TOP of the
playlist and of the data), a post the mirror does not have at that address and title, and a campfire
with no films and no `off_screen` reason. **A campfire whose film cannot be on a YouTube playlist
stays in the data** (Vimeo, or made private since) and is listed under the rack, so the screen does
not pass for the whole record. **Which films a session watched is read from its post, not from its
links**: a campfire post links songs, credits and further reading, and only the ones it says the
room watched are carded. Several cards could only be written from descriptions because YouTube
answered 429 all day; `_campfire` says which, and they are worth re-carding from captions later.
**Pronouns are written round here too**, even where our own post uses them for a speaker, for the
same reason as Screen One: no film states them. **Every card also has a second press that plays its film on its
rack's screen** (`rack.js`, which builds nothing and calls `loveEmbed.frameUrl`). It ships
hidden, moves focus to the screen's now-showing line so the film does not start out of sight, and
the way back restores the screen's unpressed plate rather than playing the programme.

**THAT RACK IS THE PATTERN FOR RACKS NOW, AND IT IS A BEHAVIOUR RATHER THAN A LOOK.** Ryan's call,
2026-09-28: fold-away racks whose cards play in place or on the room's own screen are how racks
work here from now on, and applying it to existing rooms is his call after he has lived with it
(DECISIONS.md lists the candidates). **The friendly edit is to copy the Picture House's cards**
into the next room, and that is the harmonising instinct arriving through a component: what
travels is the behaviour, exactly as `.facade` and `.quest` travel, and every room dresses the
rack, the cards and both buttons in its own section. **The behaviour is `rack.js` now**, moved
out of `picture-house.js` when the Hang Suites took the pattern (2026-09-28). It finds a screen, its
now-showing line, its way back, a card and a card's second button by `data-rack-*` attributes and
never by class, so the Picture House keeps its `lph-` classes and every other room its own. It
keeps every rule above: runtime on the button, hidden until the script runs, focus to a
now-showing line, the way back restores the plate without playing, the frame from `loveEmbed`, and
the rack a `<details>` that ships open. A room whose screen is a set you tune already holds the
rule that tuning is not playing; the pattern meets that rule, it does not overrule it.

**FOUR MORE TURNINGS, AND EACH ONE TOOK A LIGHT THE ROAD DID NOT HAVE.** 2026-09-23, Ryan's call. The
road already had the Lagoon's screen in front of you, Sithen's moon overhead and Looming Rocks' floods
from the ground up. **Dance, Punks** (§43) is lit by what people WEAR — a glow at head height per
headset, moving with them. **The Small Hours** (§44) is a lit ROOM seen from outside in the dark.
**The Repeater** (§45) is lit by NOTHING NEAR IT — everything is a silhouette against skyglow, light
that has bounced off cloud from every other lit thing on the road. **Nothing For Sale** (§46) is the
road's own light turned inward: everybody's headlights at once, so everything throws one shadow per
car. **A fifth turning needs a fifth light; these are taken.** Each passes Helen's test (it would not
be as happy on the campsite) and none is out there because it was sent there.

  · **The disco's three channels are ONE playlist started in three places**, because
    `/embed/<id>?list=` is the only lever the embed has (Club Chronic measured it). The room says
    so and `make-dance-punks.py` refuses the word shuffle. **Its channel inks are held 1.5:1 apart
    from EACH OTHER in brightness** so they are three headsets in greyscale — red/green/blue fails
    that for the commonest colour blindness. The bar is ours and the page prints it. **The copy says
    "three" in several places**, so the tool refuses a fourth channel until the sentences change.
  · **Dead Tired Society is the diner's collision**: same tubes, opposite side of the glass. There
    you sit in the dark and the light is in the corridor; here the light is inside and you are out
    in the car park. **The sign does not read the visitor's clock** — the first draft did, and a
    diner for people up at odd hours is the last place that should notice the hour. The tool refuses
    the page asking for the time, sleep advice in our voice, and closing time.
  · **The Repeater's sky is WARM on purpose.** Navy would be the campgrounds. Overcast lit from below
    by a town is a dull warm grey in life too. **Its open line is synthesised noise that sends
    nothing and listens to nothing**; `MAX_GAIN` in `repeater.js` is refused above 0.2, and the tool
    refuses a form, a fetch, storage or the microphone anywhere in the room. **The dial's pre-paint
    snippet uses localStorage on every page**, so that one exact snippet is cut before the sweep and
    nothing else is.
  · **Nothing For Sale's tables are only things of ours that their own pages say are free**, checked
    in the mirror. **Our mutual aid grants are NOT on a table** — they have an application, limits
    and a waiting list, and "take what you need" would promise what they cannot do. It is **Sithen's
    hospitality trap inverted**: taking puts nobody in anybody's debt, and the tool refuses the
    vocabulary of obligation, including *pay it forward*. **Its charity check refused the room's own
    sentence explaining charity on its first run** and was narrowed to the words that sort people
    — the deserving, the needy, the less fortunate — rather than excepted.

**TWO ATTRIBUTIONS WERE WRONG IN THE FIRST DRAFT AND BOTH WERE CAUGHT BY LOOKING, NOT REMEMBERING.**
The crayons passage in our Sleep entry is **Sarah Kurchak's** (Open Library), and the name typed from
memory was a different Autistic writer's; our entry links the book without naming its author, which is
the Hermitage's shelf lesson again. And **the Autistic Rhizome was named by DGH Neurodivergent
Consultancy**, not Helen Edgar — our Shared-Signal Space entry cites Helen's article on it, our Autistic
Rhizome entry shows who named it. **That article's own address now serves a holding page** and the
Internet Archive has only a redirect, so the room links our entry and names the consultancy, not a
person: no byline we could read names one. **Our glossary entry still links the dead page**; that is
stimpunks.org's to fix. **Syncopate is Apache 2.0**, and two credits said OFL until the pull caught it.

**THE SMALL HOURS HAS THE ONE SONG ON THIS STREET PRINTED IN FULL, AND THAT IS PERMISSION, NOT
QUOTATION.** "Up All Night", Josephmooon, lyrics by Ronan Boren, a Stimpunk — a song about Autistic
insomnia that Stimpunks helped produce and holds permission to distribute with its lyrics (Ryan,
2026-09-23). **Every other room's lyric refusals stand**, and DECISIONS.md's quoting policy still governs
everything else. `make-small-hours.py` refuses a lyric without a permission record naming what, who,
how, when, by whom and the licence; **the words are excluded from CC BY-SA in `LICENSE`**, because
permission to distribute is not permission to relicense. The lyricist's spelling is kept, not tidied.
**Do not read this as the lyric rule relaxing.** A second song needs its own permission, recorded.

**AND THE JUKEBOX STREAMS FROM THE BAND'S OWN SITE, SO "NOTHING MUSICAL IS HOSTED HERE" IS STILL TRUE.**
That needed a second origin list: **`love-embed.js`'s `AUDIO_ORIGINS`**, beside `ORIGINS`, read by
`make-csp.py` into `media-src` (path included — tighter than a host) and by `make-small-hours.py` at
build time. Without a `media-src` the policy falls back to `'self'` and every button presses and plays
nothing, silently — **and the dev server serves no headers, so that failure is invisible locally.**
Check the live site after a deploy. Audio players are built by `love-embed.js` like frames are, pause
each other so only one plays, and sit in a `.facade--audio` shell that §4 keeps off 16:9. **Every
runtime was measured off the file with ffprobe**, not read off the band's player widget.

**THE DINER'S PLACEMAT KEEPS NOTHING, AND THE FRIENDLY EDIT IS "SAVE YOUR DRAWING".** Every table at
The Small Hours has a paper placemat and crayons (Ryan's ask, 2026-09-24, for the Kurchak passage under
the menu). The house rule says nothing is kept, so the placemat is not kept either: no storage, no gallery
of other people's placemats, no count of what was coloured. **Take it home** is a download to the
visitor's own device, which is theirs rather than ours, and `make-small-hours.py` refuses `small-hours.js`
if it ever stores, sends or reads the clock. **The list of part names under it is the way in for anybody
without a pointer**, so the tool refuses a drawn part with no name and a name with no part; the drawing is
in the tool and the names are in the data, keyed alike. The wax is one canvas under the print and the
print is an SVG over it that ignores the pointer, which is how crayon goes over the lines and the lines
still show. The crayon inks are §2 custom properties, read by the script with `getComputedStyle` because a
canvas cannot take a `var()`, and the tool refuses one `love.css` does not declare. Do not give the
crayon you are holding a lift or a wobble: nothing in §44 moves.

**THE REBELLION RAVE ROOM IS THE ONE ROOM WITH A STROBE, AND IT REVERSES CLUB CHRONIC'S RULE FOR THAT
ROOM ONLY.** Turning 08 (§68), Ryan's brief, 2026-09-27: an old aircraft hangar by the airstrip, taken over
by the sensory seekers, because some of us stim with strobes, lasers and flicker devices. **The reversal is
an opt-in and nothing else**, and every piece of it is a sentence on the page that `make-rave.py` holds:

  · **the warning is above the rig, and the rig ships `hidden`.** The ante-chamber comes first on the page
    because it comes first in the building. It gives the Epilepsy Society's figures (3 to 30 a second the
    common trigger range, 16 to 25 the most likely) and the HSE's four a second for a club, read off that
    charity's page, not from memory.
  · **two presses.** The first opens a question that names the rate; only yes starts it. Escape, both
    Stop buttons, a hidden tab and `pagehide` stop everything, and **coming back to the tab does not
    restart it**: a strobe that resumed by itself is one nobody asked for this time. Nothing is stored.
  · **the knob starts at four and stops at eleven**, `MAX_RATE` in `rave.js` and the range's `max` must
    agree, and past eleven is refused. Past four is past the HSE's figure and the knob says so as it turns.
    Four to eleven is Ryan's call, settled 2026-09-27, and so is keeping the fan-posted Tomorrowland film.
  · **the flash is white**, because a saturated red flash is the worst there is; `--rr-strobe` is
    refused with any hue. **It lands on the hangar picture and never on a word**, unless the visitor takes
    the rig full screen, which is a third choice of theirs.
  · **the dial does not switch the rig, in either direction** (the Arcade's rule), so the beams and the
    flash are driven from one `requestAnimationFrame` loop in `rave.js` rather than CSS, which §3 takes
    away at Gentle. **Do not add a keyframe or transition to §68**: CSS animation there would be the rig
    starting unasked. The beams rotate inside their own `<svg>`, where a transform is part of the picture.
  · **no claim of safety or of treatment** in the room's voice: no rate is safe for somebody
    photosensitive, and the room links a flicker device while repeating nothing its maker says flicker does.

**AND THE SENTENCE THAT SAID IT HELD EVERYWHERE HAD TO CHANGE.** The Adventurer's Guild's house rules
said Club Chronic's rule "holds everywhere on this street"; that line names the rave now. Every other
room's promise that nothing in *it* flashes is about that room and still true. **When a room reverses a
street-wide rule, grep every page for the rule** — `strobe` and `flash` — because the claims live in the
rooms that repeat it, not in the room that changed. The dial's own line, *nothing moves, flashes, or plays
until you say so*, stays true only because of the opt-in; that is the sentence to protect.

**THE FESTIVAL FILMS HAVE THEIR OWN STROBES IN THEM, AND THE ROOM SAYS SO ABOVE THE SCREEN**, because a page
cannot reach inside another site's player. `make-rave.py` refuses the page without that sentence. The
screen is the Hermitage's set (silent while dark); a channel is a **mix** (one video, then `RD` + its id,
Big Steep's rule, with the video's runtime) or a **playlist** (no runtime, and its position 1 as `opens`,
Queercore's lesson). **The Tomorrowland film is a fan channel's mix, not the festival's**, and the note
beside it says so; its channel's own name contains *Best*, which the ranking sweep skips as the channel's
words. Every channel was pressed inside a frame and played, 2026-09-27.

**THE LIGHT IS LIGHT YOU SEE IN THE AIR**, beams caught along their length by haze, and the strobe is light
in time. That is the road's fifth light, and it is taken. **Dance, Punks is the collision**: outdoors,
silent, lit steadily by what people wear. If anything in the hangar ever glows steadily at head height it
has become the airstrip with a roof on.

**THE COOLDOWN ROOM (§69) IS BEHIND THE ANTE-CHAMBER AND IS LIT BY A VENDING MACHINE**, one steady pale panel
at the side of a small soft room. It shares nothing with the hangar, which runs the long way: immense,
black, steel and beams against small, soft, upholstered and still. **It is one more room for resting in,
and the light is what holds it off the others**: every one of those is lit by a flame, a lamp, a corridor
or from under water, and there is no flame and no brown here. The Doom Scoop's cabinet lights *down* into
its tubs in a closed parlour; this lights *out* across a room people sit in. `make-cooldown.py` refuses a
snack that does not say what is in it and how it feels (the runtime rule at a vending machine), a price or
anything owed (Nothing For Sale's rule), a verdict on food or anything a snack is supposed to *do* for a
body, a maker who is a business, and a script that keeps, sends or sounds anything. **Every snack and maker
is this road's own**, a first name and a place, never a brand. Its first two refusals were false positives,
*Cucumber Coins* and *the fuel pumps*, and both patterns were narrowed rather than excepted.

**THE MUD ROOM (§70) IS A MULTI-USER DUNGEON WITH NOBODY TO FIGHT, AND ONE USER SO FAR.** Ryan's brief,
2026-09-27, after an Ultima Online retrospective: a non-violent graphical MUD for exploring and learning.
The shop is a boot room; out of its back door is **the Slake**, a tidal estuary of places, things and
residents in `data/mud.json`, built by `tools/make-mud.py` and played by `mud.js`, with a multi-user half
on the CB built the same day. What was settled and what is open is in `DECISIONS.md`.

  · **THE GUIDEBOOK IS THE GAME.** The tool writes every place, thing, person and way on as a book at the
    foot of the page, and `mud.js` reads that markup, clones from it and closes the book. With scripts
    off the book is the game and its ways on are links. Do not give `mud.js` a data file of its own:
    the day the game and the book are two copies is the day they disagree.
  · **NOBODY TO FIGHT AND NOTHING COUNTED**, and the tool sweeps the data and the room for both
    vocabularies with the negation window. UO is built on combat and skills that rise with use, and an
    exploring game is exactly the shape of thing that grows a percentage explored. **The friendly edits
    are "N of M places found" and a trophy for finishing**; the map is a record of where you went, not a
    total. Its first run refused the room's own history of TinyMUD discarding combat, and the window was
    taught *discard* rather than the sentence cut.
  · **THE TIDE TURNS WHEN YOU WAIT, AND ONLY SOMEWHERE DRY.** Nothing runs on a clock: the street's
    oldest promise made into weather. The tool refuses a way onto the mud that ignores the tide, a ferry
    at low water, **a way on with no way back, and a place with no walk home at any tide it can be
    reached at**, because the noticeboard says SAY HOME AND YOU ARE HOME. A dark place still has words
    without the lantern: the light adds to what is there and never unlocks the only words there are.
  · **EVERY RESIDENT IS DOING SOMETHING OUR GLOSSARY HAS AN ENTRY FOR**, says its name the second time you
    talk to them, linked, and no two point at the same entry. The slugs are checked against the mirror
    when it is here. **Nothing teaches and nothing tests**: the Playhouse's rule that a toy is not an
    explainer, arriving where the brief says *learning*. Ottilie's entry is in Helen Edgar's words and the
    liner notes say so. **Nothing out there is a field guide**, Mycelium Munchies' rule on a saltmarsh.
  · **THE LIGHT IS THE SKY LYING IN THE MUD**: overcast, from everywhere, and the brightest thing below
    the horizon is the water because it is holding the sky. The collisions are in §70's comment: the
    **Arcade** (a cabinet, a screen and a pixel face; this has none), the **404's fog** (no distance;
    this is the longest view on the street), the **Healing Checkpoint** (a glow under water; nothing here
    emits), and the **Rabbit Hole** (wet slate; these greys are olive, the colour of mud). **The Slake's
    map is not the street's model**: it has no scale and shows only where you have walked.
  · **THE MULTI-USER HALF IS THE CB, AND SEEING IS THE SAME SWITCH AS BEING SEEN.** Four functions
    (`cb-mud-here`, `-say`, `-leave`, `-moderate`) on `netlify/cb/lib.mjs`, with every place named in
    `MUD_PLACES` there and `make-mud.py` refusing data that disagrees. **Presence is in the KEY**, one
    empty blob per visit (`mud-here/<place>/<visit>.<time>.<role>.<handle>`), so one listing answers
    who is where with no reads and no shared blob to race on; its write is the one unconditional write
    the test store allows. Moving REPLACES the record, so where somebody has been is never a trail.
    **Others are never on the map**, the answer has no count in it, names come alphabetically, and the
    tide stays each player's own. Each place's talk is the channel's own `updateLog`, fifty and each gone
    after 48 hours. **The friendly edits are a who's-online list, a headcount, and everybody's footprints on
    the map**: each is the list of who is out there that the room refuses. The street's radio has a
    Who's online now (Ryan, 2026-10-07); the Slake does not, and nobody on it appears there. `mud.js` may read `love-cb`
    and never write it, and send to `/cb/mud/` through one `call()`; the tool reads the file for
    exactly that. **The concurrency test never races more than a log keeps**: while a channel kept ten,
    its first run raced fifteen and reported the five it had pushed off as lost writes.
  · **`classList.toggle(name, undefined)` FLIPS THE CLASS**, it does not clear it. The map's first render
    drew every way between places for a visitor who had seen one, because an `&&` chain came out
    `undefined`. It is `!!(...)` now. Any toggle whose force can be undefined has this bug.

**`check-jukebox.py` COULD NOT RUN FROM THE DAY LAUGHINGSTOCK OPENED UNTIL THIS ONE.** That room's data
has `acts` (comics and their lines) beside `sets` (videos), the `acts` branch came first, and the run
refused on the first comic. `sets` is tested first now. **When a checker's shapes are told apart by
which key a file has, a file with two known keys is read as whichever comes first** — order those
branches from most specific to least, and run the checker after adding a room rather than assuming.

**SAMEFOOD CAFE IS THE ONE ROOM WHERE NOTHING TOUCHES UNLESS YOU WANT IT TO, AND THE TOOL WALKS IT.** §47 is a café seen
from directly above the table, under one even overhead light that is the same at every hour, so every
object sits in its own soft ring of shade (`box-shadow` with a spread and no offset). Every food on the
plate is in its own well with room round it, and `make-samefood.py` walks every coordinate of the
drawing and refuses anything within a gap of anything else — `make-garden.py`'s soil-line walker for
this room's line. **Nothing in §47 may overlap anything**: no negative margin, nothing positioned over
something else, no rotation. **Every plate on the page is the same plate** — one component for the
dishes, the book and every tray — which is **Covenstead inverted**: there nobody's cup matches and that
is its subject; here the sameness is. If the plates ever start to differ, it has become Covenstead with
a menu. The other collisions: Danny the Street is the other plan view and under sodium nothing has a
colour, where this lamp keeps every food exactly its own colour; the Garden is also overhead but
through leaves, green and dappled; the Guild is the other orderly pale room and casts nothing.

**SEPARATION IS OFFERED, NEVER IMPOSED.** Ryan, 2026-09-23: *"Personally, I don't mind my food
touching. Ronan and my brother like everything separated."* So the house's divided plate and its
ramekins are walked strictly — that is the offer to whoever needs things apart — but **a bowl is one
dish, drawn the way its person eats it, and its parts may touch**: the green onions float among Ryan's
noodles. The walker keeps a bowl's contents inside its wall and does not check them against each other.
Do not "fix" that into a gap; a room that made everybody's food separate would be correcting the people
who do not mind, which is the thing the room refuses in the other direction. **THE HOUSE DEFAULTS TO STRUCTURE, SEPARATION AND PREDICTABILITY, AND ACCOMMODATES EVERY GUEST
INDIVIDUALLY** — Ryan, 2026-09-23: *"You are never regarded as fussy, picky, or too much. You are just
quietly and professionally accommodated."* **No one's rules impose on someone else.** A regular may
carry `asks`, their own way of being served, and the tool checks an ask only against that person's
food: Ronan has red things in a ramekin of their own, so his ketchup is refused anywhere but one, and
Ryan's red apples are free. **The first draft made Ronan's way a house rule and refused red
everywhere**; that was the room imposing one guest's way on every other guest, which is the exact
thing it exists to refuse, and it will be the friendly edit again — somebody will want a "nice
consistent rule". An ask the tool does not know is refused rather than ignored. Each tray
may carry a **samefood of the moment** in a bowl, and it must be an item already on that person's tray,
because it is theirs and not ours to pick.

**THE MENU CHANGES ONLY WHEN SOMEBODY ASKS.** Ryan's call, 2026-09-23: the first draft said the menu
could never change, and he loosened it — the kitchen **knows its patrons**, keeps what each regular
has the way they have it, and is ready for their seasonal changes, **because samefoods have seasons**: they carry somebody for a while, get put down, come
back. So no surprise dish and nothing taken off because somebody else got bored, but a regular or a
newcomer asking is how a dish arrives. Do not tighten it back into "never"; a samefood is a comfort,
not a sentence. **And no magic**: an earlier line made it a magic kitchen that could make any samefood
there is, and Ryan took it out the same day — the point is attention to people, not a trick.
**Today's special is "your favourite", and it does not rotate.** Ryan asked whether it should cycle
through the regulars' favourites; a special that names one regular's dish each day puts that person
above the others for a day and makes the line read differently tomorrow, in a room that defaults to
predictability. "Your favourite" is the same promise to every guest at once. If it ever rotates,
that is Ryan's call to reverse, and the rotation must not rank anybody.

**THE REGULARS' TRAYS ARE THEIR WORDS AND THE TOOL DOES NOT SWEEP THEM.** Lowercase stays lowercase and
nothing is glossed, sorted, merged or counted — **two regulars list coffee, and the friendly edit is to
say so**; that is a tally across other people's dinners and the tool refuses the vocabulary. A regular
takes no key but name, items, given, date and moment. **Every food in the window names the tray it is off**, so
when somebody asks for their list to come down the build stops until the drawing lets go of it too —
`make-polaroids.py`'s withdrawal rule. The room refuses the vocabulary of correcting a plate (picky,
one bite, healthy, hungry enough) with the negation window, and skips the book's own subtitle, which
says *Picky Eaters* and is its author's to say. **Two of its quotations are from the book and were read
off our glossary, not a copy**; the room says so beside them.

**THE COLLECTION COLLECTION IS THE ONLY ROOM LIT BY MORE THAN ONE KIND OF LIGHT, AND NO TWO LAMPS IN
IT MAY BE ALIKE.** §48 is a dark gallery with no house lights: every collection stands in a cabinet of
its own under a lamp its owner chose for the thing it lights &mdash; daylight over Ryan's inks because a
warm bulb lies about an ink's colour, a strip inside his perfume cupboard's door because light spoils
perfume. **The house brings the furniture and the owner brings the light.** Covenstead used to be the
multi-lamp room and gave it up when it moved onto the street, so this is a light nobody is using rather
than one taken back. `make-collection.py` refuses two cabinets with the same lamp: **if two ever share
one, this has become The Feed with shelves** &mdash; every board there has the same light because a
station is a system, and a collection is not. A lamp is lit only when its cabinet has something in it,
**an unchosen lamp is not drawn at all**, and an empty cabinet's label is never dimmed (The Outskirts'
dashed-post rule). The next lamp goes into `LAMPS` with the reason it suits the thing it lights, and a
colour of its own in §2 measured in `ORNAMENT`.

**EVERY WORD IS ON A LABEL OR ON THE BARE DARK, NEVER IN A LAMP'S LIGHT, AND THE GLOW NEVER TOUCHES A
PHOTOGRAPH.** The glow lives on the case's `::before`, behind everything in the case. A lamp's colour
laid over somebody's picture of an ink would change the ink, which is the one thing the lamp was chosen
not to do, so the tool refuses a filter, blend or fade that reaches `.cc-photo` &mdash; the polaroid
wall's no-filter promise, which is not waived because the thing in the picture is a pen. **An opaque
bed inside a case hides the lamp** (the writing box's velvet shipped that way for an hour): anything
standing between the `::before` and the things has to be partly see-through.

**THIS ROOM DESCRIBES THINGS SO PEOPLE DO NOT HAVE TO, WHICH IS THE POLAROID WALL INVERTED ON
PURPOSE.** Ryan's brief, 2026-09-23: having to title, describe and caption every picture would stop
him ever sending one. The wall promises *we will not describe you in our words* because a description
of a person is theirs; **a description of a pen is not a description of anybody, and it is work**, so
here Claude writes the title, alt and caption and every cabinet's label says so. **Do not "fix" that
by making owners write their own**, and do not stop saying who wrote them. When photographs arrive:

  1. they go in `collection/inbox/` and `python3 tools/intake-collection.py <cabinet>` takes them in
     &mdash; orientation baked in **before** the tag goes, every byte of metadata stripped, never
     cropped, the original moved to `collection/inbox/taken/`. **Never commit anything under
     `collection/inbox/`**: those originals still carry GPS. It is gitignored for that reason.
  2. **look at each file** (Read shows it) and fill the stub: `title`, `alt`, `caption`,
     `words: "claude"`, `described_on`, and `nobody_in_it` / `nothing_says_where` set to true **only
     after looking at the whole frame**. A person in it goes through `data/polaroids.json` instead; an
     address, post, or a view somebody could place means it does not go up and the owner is told.
  3. **name no maker, model, ink or scent from what a thing looks like.** A name on a label reads as a
     determination and is a guess &mdash; the herbarium's binomial rule, in a room where everything is
     sold on its name. Lettering legible **in the photograph** is transcribed into `reads` and may then
     be used; the owner's own name for a thing goes in `named` with `named_by`. `MAKERS` is short and
     says so; the rule covers what it cannot catch.
  4. run `make-webp.py`, then `make-collection.py`, `make-og.py` (the card's drawing shows which lamps
     are lit) and the checks.

**NOTHING IN THAT ROOM IS COUNTED, PRICED, VALUED OR CALLED RARE.** A cabinet with a number beside it
is an inventory, and a list of what people own with prices beside it is a list for somebody else to
shop from &mdash; which is also why nothing may say where anybody lives. The sweep runs with the
negation window and **skips a capital in mid-sentence as a name, because its first refusal was Devon
Price**; the pattern was narrowed by shape rather than the name excepted.

**THE OTHER CABINETS WERE RELAYED, AND ONE OF THEM IS HELEN'S.** Norah and her husband, Chelsea and Helen
were named by Ryan in the brief; each cabinet says it was relayed and **stays empty until its owner
sends something**. Their lamps are theirs to choose and the furniture is the house's guess. **Do not
fill any of them from memory, from our other pages, or from photographs of theirs published
elsewhere**, and remember the Faery Yurt's rule: a cabinet in Helen's name is a new thing about her,
so what goes in it is her call. See DECISIONS.md.

**THE KITCHEN IS THE ONE ROOM DRAWN CUT THROUGH THE MIDDLE, AND EVERYTHING IN IT TOUCHES.** Vital
Plant Living (§50) is a plant-based kitchen: build your own bowl or wrap out of **Ryan's own pantry**,
the list he cooks from at home, or start from a combo on the board, each on a flavour base off his list;
copy it to the clipboard and take it shopping. Every other room is seen at eye level, as a plan or as a
model; **this one is a section** — the bowl, the wraps and the pots on the shelf are all cut open, every
layer sits on the one under it, and the sauce runs into the rice. **It is Samefood Cafe exactly
inverted**: a plan where nothing on a plate touches anything, a few doors along, and the house rules
send anybody who needs their food apart there by name. If anything in §50 ever sits in a well of its own
with room round it, it has become Samefood Cafe with the lid off, and it is this room that moves. The
other collisions are structural: the Garden also shows what is under its soil, but that is beds in the
ground outdoors, one per site and each linking out, where these are pots of ingredients on a kitchen
shelf; the plant rooms (Jungle, Sweetgrass, Hermitage) are each a *light*, and a section is a diagram with
no light in it; the Guild is also lit from nowhere, and is pale, square, ruled and filed where this is
saturated, round and piled. **The decor is the larder**: `make-vital.py` refuses a pot on the shelf that
is not in the pantry.

**THE NAME WAS CHANGED ON PURPOSE AND THE ROOM SAYS WHY, NEAR THE TOP.** It was briefed as Ital Plant
Livity, and both words are Rastafari's. Ryan's call, 2026-09-24: Rastafari has been a big influence on
him, and the room takes the plain-English name, because **this kitchen is not Ital** — the pantry has
three salts, MSG, soy sauce and things out of packets, which many people who keep Ital avoid — and because
how Ital is kept varies from person to person, which is not ours to settle from outside (Covenstead's
Rule of Three reason). What the room says about Ital was read against Wikipedia's article, not
remembered. **The menu never calls a dish Ital and the tool refuses it**; the stereo keeps the word
because it is in the songs' own titles. **No red in the room's own clothes**: a turmeric wall with green
leaves and a red accent is the Rastafari tricolour, on the page that decided not to wear the name.
Links are beetroot; the one red is a food ink, and a chili may be red. **Do not "finish" the name back to
Ital, and do not give the room a red.**

**THE PANTRY IS RYAN'S AND IS WRITTEN AS HE GAVE IT; THE COMBOS ARE OURS AND CANNOT LEAVE IT.** His
spellings stay (*Herbs de Provence*, *Babaganoush*); a line that held several things is split, rice is
three rices by his own correction, and a thing listed twice is in the builder once. The supplements at
the foot of his list are **not** on the menu — a restaurant serving B12 would be giving advice about
eating. Every combo is assembled out of the pantry and stands on a base from his list, and
`make-vital.py` refuses one that brings in anything else. **Nothing on the board is authentic, exotic,
ethnic, healthy, a superfood or counted**, refused in our voice with the negation window; where a combo is
thinking about a dish usually made with something the pantry does not keep, its note says so (pinto,
not kidney beans). "Vital" means alive and never optimised — the friendly edit is a line about what a
bowl does for your body, and every menu on the internet is written that way. **The tool's first refusal
was a sentence of ours**, the credits line naming "authenticity" with its "refuses" out of the window's
reach; rewritten, not excepted.

**`hidden = false` DOES NOT UNHIDE AN SVG.** `hidden` is an HTMLElement property; on an `<svg>` it is an
expando, the attribute stays, §2's `[hidden]` guard wins with `!important`, and the drawing renders at
0×0 while the DOM holds every shape — the 0×0 iframe in a new costume. `vital.js` uses
`removeAttribute('hidden')`. Any script that ships an SVG `hidden` has this bug until it does the same.

**A PLAYLIST HAS AN EMBEDDING PERMISSION OF ITS OWN, AND NOTHING HERE COULD SEE IT.** The stereo's
playlist rendered *This video is unavailable* in every frame — both hosts, both embed forms, and started
at a song that plays — while every song on it framed alone played and the Laughingstock playlist beside it
played. `check-jukebox.py` said all eighteen were `OK` and `playableInEmbed`, **correctly**, because
that is a fact about each video and this was a setting on the list: *allow embedding* was off on the
playlist, and when Ryan switched it on (2026-09-24) **it kept resetting to off**, so the door is the room's standing state rather than a stopgap, until it sticks. **That is Queercore's lesson with a different cause** —
there a dead video at the top, here the list's own setting — and the control that told them apart is
the same: frame the videos alone, frame a known-good list, frame this list started mid-way. Until a press
inside a frame plays, `data/vital.json` holds the playlist as `frame: "door"` with `door_why` saying what
was measured, the page shows it as a link shaped like a door, and **every song is its own press** either
way, so the stereo plays whatever state the list is in. Flip it to `screen` only after pressing play
inside a frame, not after reading the poster.

**THE RING IS ON THE BOX, NOT THE PILL.** Each thing you can tick is a pill with a checkbox in it, and the
first draft drew the focus ring on the pill with `:has()` and switched the box's off — more visible, and
invisible to `check-focus.py`, which measures the outline of the element that has focus. It counted 170
controls "drawn some way other than an outline" and could say nothing about any of them. The ring is on
the box now, and turns pale on a ticked, dark pill. **When a tool can only see one thing, do not ask it to
take your word for another** — arcade.js's call, arriving at a focus ring.

**THE KITCHEN'S TELLY IS THE DOOM SCOOP'S MACHINE WITH A MONTH IN IT.** Ryan, 2026-10-01: the last
month of videos and shorts from plant-based cooks he listed, refilled daily, older ones rotated out.
`tools/pull-vital-rack.py` reads each cook's `UULF` and `UUSH` feeds (derived from `channel_id` in
`data/vital-rack.json`, read off the channel's own page) and asks each new video's watch page once;
`make-vital.py --rack` redraws only the telly, so the timer never touches the rest of the page or the
liner notes; `tools/daily-vital.sh` is the third script on the morning task, committing two paths as
`daily vital telly refill`. **The cooks are Ryan's and the videos are nobody's choice**, and the room
says nobody here watched them first. `make-vital.py` refuses a row older than the month, a row
carrying a description or a count, a screen with no runtime and a door with no reason. **The titles
are the cooks' and are not swept**, which matters more here than anywhere: cooking titles say high
protein and what a dish does for you, beside a house rule of ours that says nobody in here does. The
friendly edit is to sweep them, or to drop the videos whose titles say it; the sentence beside the
telly is the answer instead. It sits after the stereo so Now Playing's line for the room stays put.

**THE OPEN NOTEBOOK IS RYAN'S PIECE IN FULL, AND THE PIECE IS HIS VOICE, NOT OURS.** §91, Ryan's brief,
2026-10-03: a journaling shopfront led by his own *Bullet Journaling + Junk Journaling + Interstitial
Journaling*, which he gave to the street in full (his copyright, under the site's licence). It is set by
hand between `onb:piece` markers, word for word as Notion served it, with one change the page says out
loud: each list of YouTube videos became a taped line in the margin, in the bullet journal's own mark for
migrated (›), pointing at its shelf in the collection. `make-open-notebook.py` refuses a YouTube address
left in the piece, a migrated line with no shelf, and a byline without his name and the original's
address, and **does not sweep the piece for our refusals**: Helen's rule that somebody's writing is never
folded into our "we" holds for Ryan too. **The questions are our Infodumplings write-up's, word for
word**, re-read out of the mirror's copy of that post on every build (the Town Hall's rule: re-copy,
never loosen). **There is nowhere to answer them, on purpose**: the tool refuses a form, an input, a
textarea or anything editable outside the job marker, a select anywhere but the sticker drawer, and any
script but `love.js`, `love-embed.js`, `rack.js`, `quest.js` and `notebook-stickers.js`. The friendly edit
to a journaling room is a habit tracker, or a box that remembers what you wrote, and then the notebook is
ours instead of yours.

**THE STICKER DRAWER NARROWED THAT RULE, ON RYAN'S ASK, AND ONLY AS FAR AS IT HAD TO.** Ryan's brief,
2026-10-12: day and month stickers by name for a PixCut S1 (Liene's sticker printer and cutter), any face on
the street, three sizes, the week or the year on one sheet or one name to a sheet, as many to a sheet as will
go. It needs a face picker and a script, so the room now has one `<select>` and `notebook-stickers.js`, and
`make-open-notebook.py` refuses that script if it stores, sends or writes markup from a string. **Neither
takes a word**, so the room still has nowhere to write. **Every number is in `data/open-notebook.json`** and
is written twice, into the sentences and onto the drawer's data- attributes the script reads: change
`gap_mm` there, never in the script. **The face picker is generated from `data/foundry-faces.json`** and
`check-faces.py` reads it in both directions, like the Mopery's and the Foundry's. **Liene's figures were
read, not remembered** (4 × 7 in paper, 100 × 170 mm printable, 300 dpi, the app phone-only, a PNG with no
background cut round directly), and a sheet is a transparent PNG the paper's size with a pHYs chunk and the
face's credit in iTXt. **Ryan printed sheets the same day and they worked**, so the gap and inset are right
for the machine as it is. **The pictures (the weather, the moon) are drawn in the tool**, carried in the page
as a hidden SVG and turned into Path2D by the script, and the tool refuses a picture with no drawing and a
drawing with no picture; they are never turned on their side, because a sideways moon is a different phase,
and the moon is the northern hemisphere's. **The word's size is worked out across every word, number and
year any sheet carries**, which is what makes one face and size one sticker whichever sheet it comes off; a
new list with a deeper or taller mark than the rest shrinks every word in that face, so say so when adding
one.
A whole year rarely fits at Large, and the sheet says which size it fits at: that is geometry, not a packing
bug, and the fix is never to shrink the stickers on one sheet, because one face and size is one sticker
whichever sheet it comes off. **`web-share` is `(self)` in `_headers` for this drawer alone** (Ryan's call,
2026-10-12): Share hands a sheet to the device's own share sheet, where Save Image puts it in a phone's
photos for the app to pick. `make-csp.py` holds it to self and refuses any script outside `SHARERS` that
calls `navigator.share`; another room that wants it is one line there, on purpose. Share needs a fresh
press, so every sheet's file is drawn in the background as soon as its preview is up.

**ITS LIGHT IS EVERY HOUR AT ONCE.** The notebook has lain open under a window since first light, so the
window's patch from every hour lies on the page together, dawn blue from the left to dusk rose from the
right, each with its time: interstitial journaling's log of the actual shape of the day, as a light. It
is drawn and never moves. **The Zibaldone is the collision**: bound leaves with a gutter, one lamp at desk
height, other people's words; this is one page with no fold, a dot grid, and your own shorthand. If a
gutter or a lamp ever appears in §91 it has become the Zibaldone with tape on it, and it is this room that
moves. Covenstead is one window at one moment; this is the same window all day. **The dot grid is the
body's `::before`, never its background**, because `check-contrast-live.py` declines text on a background
image, and a page of unmeasured text is a page of unmeasured text. Doto, Óliver Lalan's, sets headings
only, in its rounded black: letters made of the page's own dots. Its square cut is a pixel face, and
pixels are the Arcade's.

**THE MONTHLY LOG IS THE KITCHEN'S TELLY WITH JOURNALING CHANNELS ON IT.** `pull-notebook-month.py` is
`pull-vital-rack.py`'s reading, kept in step by hand; `make-open-notebook.py --month` redraws only the
log; `tools/daily-notebook.sh` is the fourth script on the morning task, committing two paths as `daily
open notebook refill`, which update-logs' AUTOMATED pattern names. **It parts from the cooks' puller in one
place**: some journaling channels are all shorts, so an empty or missing list of either kind is an empty
shelf, and only a channel with nothing in either is refused. The titles are the channels' and are not
swept; some of them sell journaling as productivity, beside a sentence of ours saying the companion line
is the piece's. **One empty laptop serves both racks**, the collection and the log. **A coverage test
against a time kept to the minute needs a minute of slack**: without it the first fill said every short
feed fell a few seconds short of the month. `make-vital.py`'s copy has none and showed the same notes on
its first morning; they heal by the second.

**LEARNING LARGE IS A GLASSHOUSE AT NIGHT, AND NOTHING IN IT IS GREEN.** §92, Ryan's brief, 2026-10-03:
learning, making and knowledge gardening with generative AI, the weight on our spiky profiles and how
they complement each other, material pulled from our AI hub (stimpunks.org/ai/ and the pages it maps),
and a rack of the latest month from AI channels he listed. **His tagline is the sub-line and is
credited as his.** The lamps are the old red and blue grow lamps: two narrow spikes of colour, built to
give a leaf the two colours it takes in, so the light itself is a spiky profile matched to a leaf's,
and under it a leaf has no green to give back. **`make-learning-large.py` refuses a green hue** in the
`--ll-` colours or anywhere in §92, the Picture House's palette check for a reason of physics rather
than politics. The friendly edit is "make the seedlings green, they are plants". Where the red and
the blue land together the light is magenta, and a shadow comes out red on one side and blue on the
other: **that split is only ever in a shadow, never on a letter**, because misregistered type is Now
Playing's. The roof glass is a mirror at night and the room says what that is worth knowing about any
tool that talks back. Its collisions are in §92; Mycelium Munchies is the one to watch, and if the
magenta ever loses its blue it has become that room's heat lamps.

**EVERY QUOTATION IS WORDS ON ONE OF OUR PAGES, CHECKED AGAINST THE MIRROR WORD FOR WORD**, the Town
Hall's rule: when our page changes, re-copy the quotation, never loosen the check. Somebody else's
words on our page carry the work they come from and say they were read on our page rather than in the
original, the Community Library's rule, because nobody read the originals for this room. The cap is
in the data file (Covenstead's reason, not the Zibaldone's). The practices are our Competency Networks
page's and the propagation bench is our AI Collaboration page's Knowledge System diagram, both word for
word and in order; which part of the glasshouse each step happens in is ours, and the middle stage is
the only one lit, because that page puts AI in the middle of the process. **The order check finds each
step after the one before it**: "conversations" turns up in that page's prose before the diagram, and
the first draft, comparing positions found anywhere, refused a correct diagram. **A model's peaks and
troughs are our pages' and never a claim of ours**: every line names the page that says it, and a line
with no page is refused.

**THE ROOM REFUSES A MODEL GIVEN A MIND, AND THE SALES PITCH.** Our sentences are swept, with the
negation window, for a model that thinks, knows, understands, feels, wants or cares, for an AI friend,
teammate or employee, and for superpower, magic, revolutionary, game-changer, 10x and their kin;
superpower twice over, because it is also the word the autism-as-superpower framing uses on Autistic
people. Our AI Collaboration page names anthropomorphisation as one of its two biggest guardrails, and
**the friendly edit in an AI room is a warm sentence about the model understanding you.** Nothing is
drawn as the machine and nobody is drawn at all: no robot, no brain, no face, no sparkle, and the tool
refuses the sparkles, robot and brain emoji anywhere outside the rack. **THERE IS NO CHAT BOX, AND THE
TOOL MAKES SURE**: How this site is made says nothing a visitor does here is sent to an AI, and an AI
room is the one most likely to grow one. It refuses a form, an input, a textarea, a select or anything
editable outside the job marker, any script but `love.js`, `love-embed.js`, `rack.js` and `quest.js`,
and any `fetch`, XHR, EventSource or WebSocket on the page.

**THE SOWING LOG IS THIS STREET'S OWN, OUT OF ITS CHANGELOG.** Every entry names a changelog id and
`holds` words that entry has, and is refused if either has gone; it is fixed in
`data/learning-large.json`, never by editing the changelog. It says most of what came up wrong was
Claude's, because How this site is made says Claude does most of the building, and it quotes that
page's line about checkers and people, checked against `design.html` on every build. It is a record of
how things get caught, not of whose fault they were, and the tally sweep holds that line. A new
episode worth adding goes in with its id and its words.

**THE RACK IS THE NOTEBOOK'S LOG IN A GLASSHOUSE.** `pull-large-month.py` is `pull-notebook-month.py`'s
reading, kept in step by hand; `make-learning-large.py --month` redraws only the rack;
`tools/daily-large.sh` is the fifth script on the morning task, committing
`data/learning-large-month.json`, `learning-large.html` **and `now-playing.html`** as `daily learning
large refill`, which update-logs' AUTOMATED pattern names from the same evening. **It owns the poster
because the room has nothing to press but the rack**, so the poster's line for it is the rack's first
video, which moves whenever the first channel in Ryan's list puts something up: the Doom Scoop's
arrangement, with the scoop's timer reprinting the poster first and this one after. **The titles are
the channels' and are not swept**, which matters more here than anywhere: these are channels about the
AI industry, and their titles sell models and talk about them as if they were people, beside a room
whose guardrails say neither. The sentence beside the rack says the guardrails are ours. One bench
screen serves the whole rack.

**HEY, GOOD COOKIN' IS A COMMUNITY KITCHEN, AND NOBODY OWES ANYTHING IN IT.** §93, Ryan's brief,
2026-10-04: come if you are hungry for food or for knowledge, nobody is turned away, no paying and no
volunteering, cafeteria-style self-service with sit-down seating and a communication badge placard on
every table, an omnivorous menu with plenty of vegan and vegetarian, wheelchair access at the line and
the seating, cooking classes, and a rack of the last month from cooking channels he listed. **His
welcome, the placards and their three rules are in the room word for word** (`welcome`, `placards` and
`rules` in `data/hey-good-cookin.json`). `tools/make-hey-good-cookin.py` refuses the vocabulary of
anything owed (pay it forward, donation, pay what you can, earning a meal), of sorting the people who
eat (needy, less fortunate, deserving, the homeless) and of asking at the door (proof, ID, sign-in,
register, referral), with the negation window: Nothing For Sale's rule, in the room that feeds people.
The friendly edits are a jar by the trays and a volunteer rota on the wall.

**EVERY DISH CARD'S ALLERGEN LINE IS WORKED OUT FROM ITS INGREDIENTS, NEVER TYPED BESIDE THEM.** One list
of words per allergen, for the FDA's nine (read off fda.gov, 2026-10-04) and gluten, which barley and
rye carry as well as wheat, with phrases read first so oat milk is not milk and peanut butter is not
butter. The card says it both ways round (*Contains soy. No gluten.*), because somebody with coeliac
disease and somebody with an allergy each read for their own word. **It refuses** a vegan dish with
anything from an animal in it, stock included; a vegetarian dish with meat, fish, gelatin or parmesan,
which is made with calf rennet; and a meat dish that does not name its animal, or whose animal and
ingredients disagree, **which caught the smoked-turkey collards cooked in chicken stock on its first
run**. A sauce is spelled out on the card rather than named, because *barbecue sauce* cannot be checked
for anchovy. **Do not add an allergens field to the data**: that is the two lines that can disagree.

**PLENTY OF VEGAN, AND THE VEGAN PAN IS FIRST.** More than half the line is vegan or vegetarian, every
station has a vegan dish, and on the hot line's week the vegan pan is first every day and the same size,
Big Steep's rule for its alcohol-free pour. No calorie counts, and the tool refuses healthy, guilt-free,
cheat, superfood and picky in our voice. Nothing is certified halal or kosher and the room says so;
every animal is named so people can choose.

**THE PLACARDS ARE THE ONLY GREEN, YELLOW AND RED IN THE ROOM.** On a table a colour means a placard, so
the tool refuses any other green, yellow, orange or red in an `--hgc-` colour or in §93, and the three
placard colours anywhere but a rule whose selector says placard or a `data-placard` group in the
drawing. Every placard carries its shape and its word: circle, triangle, square, as on our Interaction
Badges page (which says Autism Network International first developed the badges) and on Cavendish
Cards' badge maker, which Ryan's brief links. **The drawing keeps the house rules**: the tool refuses a
red placard on a large table, and a red placard on a 4-top while a 2-top stands empty, in the hall it
draws, and refuses a table drawn under the placard station.

**THE LIGHT IS DAYLIGHT THROUGH STEAMED-UP WINDOWS**, soft, and the only sharp light is where a drop has
run down the glass; the line is heated from underneath, in hot water, so there is no lamp over the food.
The collisions are in §93 and the ones to watch are the Directors' frosted pane (keep the runs), Samefood
Cafe (no divided tray anywhere, because a cafeteria tray with compartments is Samefood's plate) and the
Community Center's clear north window (keep the glass fogged: a view out is that room's). Nothing moves; the
friendly edit is steam rising off the drawing at MAX, which is Vital Plant Living's flourish.

**EVERY MEASUREMENT OF THE LINE IS THE 2010 ADA STANDARDS', READ ON THE ACCESS BOARD'S PAGE**, each linked
to its section. The standard asks for one seat in twenty and the room builds every seat to it, so there
is no wheelchair table. **The classes say how long, what they are like and that they can be done sitting
down**, and a class cooking anything from an animal names FoodSafety.gov's temperature for it, which the
tool works out from the class's own words. FoodSafety.gov and USDA refuse a script, so the chart was read
in a browser. No sign-up, no register, no grade, no certificate.

**THE NAME PLAYS ON HANK WILLIAMS'S 1951 TITLE AND THE TOOL REFUSES THE WORDS THAT FOLLOW IT**, which are
a lyric, anywhere on the page and with no negation window. The friendly edit is finishing the joke.

**THE RACK IS LEARNING LARGE'S IN A KITCHEN.** `pull-cookin-month.py` is `pull-large-month.py`'s reading,
kept in step by hand; `make-hey-good-cookin.py --month` redraws only the rack; `tools/daily-cookin.sh` is
the sixth script on the morning task, committing `data/hey-good-cookin-month.json`, `hey-good-cookin.html`
and `now-playing.html` as `daily good cookin refill`, which update-logs' AUTOMATED pattern names from the
same night. **YouTube's feeds answered 404 for every channel for some hours the night it was built**,
Learning Large's included, while the channels' own pages answered; the puller refused and wrote nothing,
which is right, and the morning timers do the same on a morning like that. The titles are the channels'
and are not swept.

**AND A SCREENSHOT OF A SCROLLED LONG PAGE CAN COME BACK BLANK WHILE THE PAGE IS FINE.** The browser
pane's capture goes blank after a scroll or two, and headless Chrome's `--screenshot` of a URL with an
`#anchor` does too, on Learning Large and Vital Plant Living as much as here: a blank capture is not a
blank page. Check with `read_page` or JavaScript, or render the page headless in one window as tall as
the page, with no scroll, and crop. This room nearly lost its shadows to a capture fault.

**PEKOE AND PURRS IS A CAT CAFÉ, AND ITS CATS ARE THE SHELTER'S, READ WHEN THE ROOM OPENS.** §94, Ryan's
brief, 2026-10-04: coffee, tea and tea sandwiches, and cats from the rescue waiting for adoption, roaming,
to press, to pick up for your lap, and to see there when you look down at your lap and your table.
`purrs.js` makes one fetch, the public `GET /cb/shelter?kind=cat` the shelter pages make, and
`tools/make-pekoe.py` refuses it a second, a POST, storage, a CB pass, `innerHTML` or a transform. **The
café keeps no list of cats of its own**: the friendly edit is a few house cats so the room is never empty,
and that is a cat the shelter does not have. Adopting stays at Rescue A Cat; each cat's card links to
`rescue-a-cat.html#animal-<id>`, which `shelter.js` writes and lands on, and the tool checks it still does.
Cats are drawn by `animals.js`, which now draws a cat `bare` (no torch pool) and `curled` asleep on a lap:
one file, so a cat is the same cat in the shelter, the café and its adopter's Profile. **Where a cat sits is
its shelter mood's business** (`moods` in `data/pekoe.json`, keyed on CAT_MOODS read out of `lib.mjs`),
**never its markings**: a cat with three legs gets to the top of the tree, and the tool refuses
`purrs.js` reading `.mark` at all. **A cat whose mood is in `left_alone` is never picked up**, and the tool
refuses the list without "alone". More perches than SHELTER_KEEP plus three, none overlapping. **They
wander by themselves at MAX GLITTER only**, silently; toys move them at every setting, with words on the
toy, Plural Mural's rule. **Every mug is the same teal mug**, which is what keeps it off Covenstead's
mismatched china, and the tool refuses a drink giving its vessel a colour. The menu reads **Hey, Good
Cookin's allergen engine** by importing it (two phrases, eggless mayonnaise and cashew cream cheese, were
added there), and every drink's caffeine is **worked out from its ingredients**, refused if nothing in it
says. **The telly has nothing of its own on it**; its rack is Ryan's pick of films from other cat cafés,
titles the channels' and not swept, each measured off its watch page and in `check-jukebox.py`. The
light is a window at every height, cut to the size of a cat; its collisions are in §94, and Rescue A Cat,
the dark room every cat here came from, is the one it must never look like.

**BREW AND STEW IS PITCH 04, AND NOBODY LIT IT.** §95, Ryan's brief, 2026-10-04: a woodland tea room in a
cabin on the Campgrounds, herbal teas, vegan soups and breads, arrangements to take to your table, cosy
and mystical, with Pekoe and Purrs' look at your table. **The Faery Yurt is on the same field and owns
warm candlelight in the woods**, so this cabin is lit by foxfire, the light growing in its own logs, moss
and mushrooms, cool and shadowless, and **there is no flame in it**: the stove is shut iron, warmth and no
light. `tools/make-brew-and-stew.py` refuses candles, lanterns, lamps and fairy lights in the room's voice,
with the negation window; **the friendly edit is a candle on every table**, and it makes this the yurt with
soup. **Its ground is heather because Sweetgrass next door owns dark olive.** Everything is vegan, checked
with Hey, Good Cookin's engine, and every tea's caffeine with Pekoe and Purrs' (both imported; the two
engines gained phrases and tisane words for it). **Nothing is a remedy and nothing was foraged**: herbal tea
is sold as a cure for everything, and a tea room in a wood is where a menu starts telling people what to
pick. Mycelium Munchies' foraging list is not imported because it refuses "in the woods", this room's
address. **The look at your table is `table.js` now**, by data attributes, rack.js's precedent: the second
room to take a pattern moves it into one file, and `purrs.js` only adds the cat on your lap through
`loveTable.add`. A video on a rack can be `held`, with a sentence saying why, and `check-jukebox.py` skips
it: one of Ryan's ten is held because it looks like a re-upload of another on the same rack, and that is
his to decide. **On the Campgrounds' board this is the fourth light, grown**: in the logs themselves,
lighting nothing round it. A fifth pitch needs a fifth light.

**WHERE THE BUILDINGS STOP THERE IS OPEN GROUND, AND NONE OF IT IS A SHOPFRONT.** Ryan's brief, 2026-10-05,
"Outdoors on the Street": the Run, the Truck Stop, the Green and the Pile, side by side and next door to each
other. On the front page they are a fence with a gate into each (`.openground`, `.lotgate--*` in §5), not doors
in the row, for the Garden gate's reason: none of them is a premises. `make-map.py` reads the gates off the fence
and lays the lots flat down one side of the road (`mm-plot`), because a lot has nothing standing on it and they
are next door to each other; `make-now-playing.py` knows them as the open ground. Every page links its
neighbours through a gate. **No sentence counts them**: a fifth lot is a gate on the fence and a line in
`make-sitemap.py`'s ORDER, and nothing else should need to change. Each is its own world and the collisions are
in its section; the three porches are drawn three ways on purpose, because the obvious edit is one porch.

**PAST THE CAMPGROUNDS' WOOD THERE IS LAND, AND IT IS THE FOURTH AREA: NATURE'S CONTRIBUTION (§104).** Ryan's
brief, 2026-10-11, after Brock, Roehrdanz, Beringer et al., "Balancing land use for conservation, agriculture, and
renewable energy" (Nature Communications 17, 3623, 2026), which is **CC BY 4.0** and quoted with its credit and the
licence's link under every quotation. Its places complement and sustain each other and the street, and
`data/natures-contribution.json` says what each one gives and where it goes; `make-natures-contribution.py` refuses
an offering that goes nowhere. **The wood stays unmapped**: the campgrounds has always said so, and now says where the
one track through it comes out; the map draws a pencil line saying "the wood, not drawn" and nothing else. **The guild's
class III widened rather than growing a IV**, for the reason III was never split: a class that counted how far past an
edge you went would rank the edges. **Some of the land is left to wildlife outright**, and the page says so out loud,
because the paper says biodiversity can fare poorly on shared ground; the friendly edit is "share everything, it is
more efficient", and the paper this land is built on says otherwise. **Cannabis leaves only through licensed
dispensaries and never through the honesty box**, which nobody watches and so cannot ask an age, and **nothing leaves
the sanctuary but its manure**: both are refusals in the tool. The light is an afternoon under broken cloud, the
shadows on the fields are the clouds', and you stand in one at the stile; the collisions are in §104. The fingerpost's
arms are read by `make-map.py` like the pitches, state and all: an arm with nothing behind it yet is `--raising`, a
solid sign with no link and words never dimmed. **`tools/natures.py` is the area's shared plumbing and holds no colour,
class or drawing**: the marker swap, the anchored sweep, and the two rack shapes (picked videos, and a channel list's
month refilled by `tools/pull-nature-month.py`), each written with the room's own prefix and dressed in its own
section, because rack.js finds its parts by data- attributes and never by class.

**ALL NEEDS MET (§105) HAS NO HUE ANYWHERE, AND THE TOOL CHECKS EVERY COLOUR.** Ryan's brief, 2026-10-11: a wildlife
preserve and a sanctuary for disabled and abandoned animals. It is seen on the keepers' night round through a viewer
that sees warmth, because a torch wakes everybody, so every resident is white with their own warmth and the night is
black, and heat has no colour: `make-all-needs-met.py` refuses any `--anm-` colour or literal in §105 whose red, green
and blue differ, and links are underlined because nothing else can say link there. **The friendly edit is a
false-colour palette**, purple to orange, which would make the warmth a decoration and put the room beside Learning
Large's red and blue lamps. **No crosshair on the viewer**: the instrument a crosshair belongs to is a scope. The
residents are ours and fictional, each with how they came, how they get about and what they like; the tool refuses
pity and inspiration (Laughingstock's rule, where it is most likely to be broken kindly), a resident for sale or for
meat, a Latin name or a field guide among the wild neighbours, and a tally of animals saved. Its rack is a month of
fourteen channels Ryan listed, refilled by `tools/daily-sanctuary.sh`. **`tools/pull-nature-month.py` falls back to a
list's own page when its feed will not answer**: YouTube answered 404 and 500 at random, per request, the evening it
was built, for lists that answered 200 a minute later, so a feed is asked again slowly and then read off its
playlist page, each new id dated off its own watch page until one is older than the month, and an id whose channel
is not the list's is skipped. The titles are the channels' and are not swept.

**BRIGHTER DAYS (§106) REFUSES A PERCENTAGE OF SHADE, AND THE JALAPEÑOS ON LESS WATER.** Ryan's brief, 2026-10-11:
agrivoltaics powering the land and much of the street, after Star Stuff's Two Peppers. Two numbers travel with those
peppers and both are wrong in the friendly direction: seventy or eighty per cent shade is not in the paper (Barron-Gafford
et al., Nature Sustainability, 2019; read in its accepted manuscript at OSTI because the journal wants a login), and the
jalapeños lost 65 per cent less water *through their leaves* on the same watering, which "less water" quietly turns into
a different finding. `make-brighter-days.py` refuses both, and checks the zine's sentences word for word against the
local Star-Stuff repository. The light is noon, shared: a hard white line along every panel's top, the shade straight
under every row, and the page's ground is the panels' deep glass with the cells' grid on the body's `::before`.

**GENTLE HELP (§107) IS A HARM-REDUCTION PAGE, AND ITS TOOL HOLDS THAT IN THREE PLACES.** Ryan's brief, 2026-10-11:
cannabis with companion plants, strains with THC, CBD and CBN and terpenes, harm reduction from our Addiction and
Harm Reduction entries, Chelsea's work at a dispensary and his own neuromuscular disease. `make-gentle-help.py` refuses
**a medical claim in our voice** (Ryan's body's answer is said as his, and our Addiction entry's two unsourced
sentences, "neuroprotectant" and "safest active ingredient", are not repeated), **a label for people** (addict,
stoner, junkie), and **a CBN figure**: Leafly publishes none, so the column says "not published" rather than
guessing, the herbarium's rule in a lab report. The strains' figures are Leafly's lab medians, one page each, and the
page says beside them that sativa, indica and hybrid track the chemistry poorly (Smith et al., PLOS ONE 2022; Schwabe
and McGlaughlin 2019) and that Colorado labels read high (Schwabe et al., PLOS ONE 2023), all CC BY and checked word
for word. **A companion plant's effect is the grower's guide's** (A Pot for Pot sells grow kits), beside LSU's
"research mostly does not back companion-planting claims"; the guide's reason for lemon balm, hiding the smell from the
neighbours, is left out. **Read every author's first name off the paper's record**: this room had "Vincent Johnson"
for Vanessa Johnson for an hour, expanded from an initial. The light comes through the hoop house's own skin, pale and
even; Learning Large is the same building inside out.

**ALL TOGETHER NOW FARMS (§108) IS LIT BY TWO LIGHTS, AND NO OTHER ROOM IS.** Ryan's brief, 2026-10-11: mixed
farming, agroforestry, the Three Sisters, sheep, goats and chickens, Farming While Beige's month. The sun is going down
on one side and the full moon coming up on the other, so everything is warm on its west side and silver on its east;
the sky runs between them on the body's `::before` over a flat `--atn-sky`, and every ink on it is held against both
ends. `make-all-together-now.py` refuses **raw milk** in our voice (the CDC and Colorado's statute are quoted on the
page), **the Three Sisters retold** (the planting is described and credited to the Onondaga Nation's own book and the
Oneida Indian Nation, and the story is theirs; the tool refuses the story's figures by name and the page without both
links), and **a USDA practice missing, out of order or unaccounted for**: forest farming is not done, because the
wood is the campgrounds' and unmapped, and its card says so with a dashed edge rather than being left off. Farming
While Beige's month is `pull-nature-month.py farm`, on the morning task as `tools/daily-farm.sh`.

**THE DAIRY (§109) IS BEHIND THE FARM, AND ITS MENU CANNOT CLAIM A CROP THE LAND DOES NOT GROW.** Ryan's brief: a café
whose menu is every edible offering in the area, all pasteurised. Every pantry line names its place and a word,
`make-the-dairy.py` looks for that word in the place's own data file, and anything bought in (salt, baking soda) is
listed as bought in. Dishes go through **Hey, Good Cookin's `check_dish`** and drinks through **Pekoe and Purrs'
caffeine**, imported, not copied: goat's and sheep's milk, cheese and yogurt were taught to both engines (they read as
goat meat and an unsettled drink before). The light is bounced off white glaze and casts nothing; the green band at
hand height and the food are the only colours. The area's table of what goes where must agree with the menu: meat goes
to the dairy as well as the box.

**THE HONESTY BOX (§110) IS THE ONE STALL WITH PRICES, AND IT IS ON THE STREET.** Ryan's two answers: a shopfront in
the row, selling by honesty box. Every item has a price in dollars and cents (the story's, and the board says they
change with the season), and `make-the-honesty-box.py` refuses an item its place does not send to the box in
`data/natures-contribution.json`, so the board and the area's table cannot disagree; **cannabis** of any kind, because a
box nobody watches cannot ask an age (the page must say 21); anything from **the sanctuary**; **raw milk**; meat that
does not name its animal; and the door gone from `index.html`. The friendly edits are a free shelf (the tool refuses the
word) and a raw-milk fridge. Its light is one white lamp under the eave, in full colour, which keeps it off Danny the
Street's sodium; Nothing For Sale is the other roadside table and has no prices and everybody's headlights.

**WIDE-SPREAD CHAOS GARDENS (§111) IS A WINDY DAY, AND ITS DRAWING IS THROWN.** Ryan's brief: an ornamental and food
garden by chaos gardening. The drawing is scattered out of a fixed seed in `make-wide-spread-chaos.py` (the same garden
every build), and everything leans one way by geometry, never a transform. The tool refuses **a noxious weed in the
mix** (Colorado State University Extension's four: chicory, dame's rocket, oxeye daisy, yellow toadflax), **a claim of
nativeness** in our voice (The Conversation's article, CC BY-ND, quoted as written, says cheap mixes claim it falsely),
a Latin name, and a food the café says comes from here that the mix lacks. A clear sky with no cloud is what holds it
off the land it stands on, whose shadows are the clouds'.

**THE RUN (§96) IS PAINTED IN A DOG'S COLOURS, AND THE TOOL READS EVERY ONE.** Dogs have two kinds of cone (Neitz,
Geist and Jacobs, 1989), so every `--run-` colour must be a blue, a yellow or a grey, and `make-the-run.py` refuses
any other hue and any literal colour in §96. **The shadows are the grass's own yellow, never blue**: blue shadows
on snow are Rescue A Dog's, and that room is where these dogs came from and the one the Run must never look like.
**The dogs keep their coats**, because a dog is the same dog in the shelter, here and in its adopter's Profile
(`animals.js` draws a dog `bare` now, without the snow). **The ball is blue** on Siniscalchi's advice to the press,
which the room says is advice and not a finding. **Nobody gives a command**: the friendly edit to a dog park is
sit, stay and good boy, and a room about compliance is the one this organisation refuses; the vocabulary is
refused with the negation window. The dog telly's titles sell calm and anti-anxiety in the channels' words and
are not swept; the room's own sentences are. One channel is live, so it has no runtime, the Jungle Room's rule.

**`roam.js` IS THE CAFÉ'S CATS AND THE RUN'S DOGS, AND IT IS THE THIRD SHARED PATTERN.** When a pattern is
taken up a second time it moves into one file (rack.js, table.js), so the shelter list, the perches by mood, the card, the toys,
the one animal with you and wandering at MAX moved out of `purrs.js`. **Each room passes its own words to
`window.loveRoam({...})`** and keeps its own look; `purrs.js` keeps only the lap, `run.js` only the bed beside your
chair (a kept perch, so nobody else is put there). `make-pekoe.py`'s `check_roam()` holds the file to its
promises and `make-the-run.py` calls it too: one fetch, to `/cb/shelter?kind=` a kind that is cat or dog, nothing
stored, nothing sent, markings never read. Checked in the browser with the live shelter list stubbed in.

**A PET YOU ADOPTED CAN BE LET OUT IN ITS KIND'S ROOM, AND THE ROOM NEVER SAYS WHOSE.** Ryan's ask, 2026-10-23:
your adopted cats into Pekoe and Purrs and your dogs onto the Run (`RELEASE_ROOMS` in `lib.mjs`; a small animal has no
room yet). **`release.js` is the one file both rooms use**, written once because two rooms took it at once: each room's
tool writes its part from the data's `release` through `make-pekoe.py`'s `release_block`, in the room's words and
classes, and `check_release()` holds the file to one fetch, to `/cb/release`, `love-cb` read and never written, and
roam.js told by a `love-released` event. **roam.js still asks for nothing else**: the pets out ride on the shelter's
own public answer (`outIn`, each marked `out`), and their card says they have a home where a waiting animal's links to
the shelter. The copy kept while a pet is out is one blob per kind (`out-cat`, `out-dog`): its looks, place, mood and
name beside the pet key, in the order they went out, nothing about when; renaming and the base taking a name off reach
it, and Forget me and deleting the username call every pet home through `forgetPets`. **The shelter's animals and the
pets out share `SHELTER_KEEP`**, which is what keeps the perch promise true without new perches: letting one out is
refused when the room is full, and if the shelter fills later the last pet out waits outside (`outIn` trims it), never
an animal waiting for a home. `RELEASE_EACH` keeps a room from being one person's. `make-rescue.py` holds the server's
half. **The friendly edits are the owner's name on the card "so people can say hello", a pet out for good "so the room
is never empty"** (that is a house cat, which the café refuses), **and a count of pets out**; the first is a public
link between a person and their pet that `privacy.html#pets-out` does not make, and Ryan's call first.

**THE RUN'S TREAT TIN IS THE TRUCK STOP'S TREAT TRUCK, AND THE ASPCA'S LIST LIVES IN THE DOGS' ROOM.**
`poisoned()` in `make-the-run.py` reads a treat's ingredients for every heading on the ASPCA's page of people foods
to keep from pets, and `make-truckin-food-court.py` imports it. The page does not mention peanut butter or
xylitol together, so nothing here says it does: every treat's peanut butter is "plain", and the tool asks for that
word.

**TRUCKIN' FOOD COURT (§97) HAS NO PRICES, AND THE LIGHT COMES THROUGH THE AWNINGS.** Our Third Places entry asks
for a place that provides community without being required to buy stuff, so the tool refuses a price, a currency
sign and anything owed (Hey, Good Cookin's list, imported). Every truck leads with a vegan item. **Every item's
allergens are the community kitchen's engine**, which learned that a baguette is wheat (three bánh mì were being
told they had no gluten) and that oat flour is oats; caffeine is Pekoe and Purrs' words, and a cold drink is only
caffeine-free when every part of it is on a short plain list. **The oral rehydration solution is the WHO's, to the
gram**, and the tool refuses a card off Table 1's four figures; nobody at the hatch asks why. The name borrows a
word from Robert Crumb and the Grateful Dead, credited, and the song's famous line is refused with no negation
window. Familjen Grotesk was cut here to Latin and Vietnamese in one file, because Google splits them and the
bánh mì board needs đồ chua in the same face. The guild's marker asks what anything costs, so the sweep skips the
marker. **Its awnings' stripes are the street's only stripes of light** since the Community Center's blind came
down (2026-10-23): keep them a colour each, outdoors, with no dark between them.

**THE GREEN (§98) IS JUST AFTER THE RAIN, AND NOTHING ON IT CASTS A SHADOW.** No sun, so no shadow anywhere, on
the page or in the drawing, and `make-the-green.py` refuses `box-shadow`, a colour named for shade or the sun, and
sunshine in our voice; every card holds the sky along its top edge instead (`--grn-sheen`). **The Garden is the
collision**: it is midday there through leaves. **The boardwalk is built to ABA 1017**, read on the Access Board's
page, and the trailhead sign gives every figure 1017.10 asks for; the tool refuses one outside the standard.
Nothing on the trail is counted (no steps, no laps, a stop's name and never a number out of a total), nothing is
for anybody's mental health, nothing is named in Latin (the herbarium's shape test) and nothing is foraged. Both
quotations are our Nature page's, re-read against the mirror on every build.

**THE GREEN'S SECOND RACK IS A SEARCH, AND NOBODY CHOSE EVEN THE CHANNELS.** Ryan, 2026-10-07: the latest videos
from a YouTube search for cities and towns making room for green, daily. Every other daily rack reads channels
somebody picked; `tools/pull-green-latest.py` reads YouTube's results page (its `ytInitialData`), one search per
topic in `data/the-green-latest.json`. **YouTube no longer sorts a search by upload date**: the old `sp=CAI%3D`
answers in relevance order, measured the same day, so each search asks for *this week* (`CAISBAgDEAE%3D`) and
newest is worked out from each watch page's `publishDate`, never from "3 days ago". **The rules are the
puller's and `make-the-green.py` imports them** (`WEEK`, `RACK`, `LEFT_OFF`, `carries`), so the tool that chooses
and the tool that refuses cannot disagree: a title must carry its search's `has` words, the video must play here,
nothing its channel filed under Gaming or Music (this week's solarpunk was a video game), one per channel, no
title twice, and each search takes a turn. **The friendly edits are dropping the title gate because a good video
missed it, and calling the rack curated**; the first makes the rack whatever a search mentions, the second is a
claim nobody made. `make-the-green.py --latest` redraws only `grn:latest`; `tools/daily-green.sh` is the seventh
script on the morning task, committing two paths as `daily green refill`, and does **not** own `now-playing.html`
because the poster's line is Ryan's pick, which comes first on the page. The titles are the channels' and are not
swept. **If the results page stops carrying `ytInitialData`, the puller refuses and yesterday's rack stands**;
teach it the new page by hand, never on a timer.

**THE PILE (§99) IS A JUNK PLAYGROUND, AND NOTHING ON IT IS FOR ANYTHING.** Our Play page says play is learning
and the room quotes it, but it never sells play by an outcome (skills, development, readiness), because the
Playwork Principles say play is freely chosen, personally directed and intrinsically motivated; it refuses a
score, an instruction and a verdict on risk. **The light has no colour, and all the colour is tempera**; the den
is roofed in bubble wrap and every bubble throws a ring on the sand. **Every part on Ryan's list has its own
drawing** in `make-the-pile.py`, refused if missing, and `pile.js` puts a copy of it on what you made, painted
through `--paint`. Rubik Wet Paint sets the name and nothing else. **The Playhouse is the collision**: glossy
primaries and bunting indoors. Wikipedia's two articles disagree on the year of Emdrup, 1940 or 1943, and the room
says so rather than choosing. The child NPR quoted on our Play page is not named here.

**A QUIET PINT (§100) IS MADE LIKE McANALLY'S, AND THE ARCHITECTURE IS TAKEN WHILE THE WORLD IS NOT.** Ryan's
brief, 2026-10-05: a pub on the street in homage to the Dresden Files, with the passages from the books that
describe it. The room keeps what the books build (thirteen of everything, windows at the pavement, mirrors, carved
columns, a low ceiling with fans, a player piano and no screens, a shut wood stove, ale never cold, lemonade with
lemonade ice) and takes nothing of the invented world: no wizard drinks here, nothing is magic, and Mac is quoted but
never drawn or written into the room. `tools/make-a-quiet-pint.py` sweeps the house's own voice for that world
outside the section that quotes Butcher and the credits, Sithen's rule about living authors. **The brief linked the
fan wiki and nothing is drawn from it**, for Sithen's reason. **Butcher is quoted, never retold**: each quotation
names its book and pages and links its Open Library record, under a cap and a total in the data file. The words were
read off Ryan's Kindle copies and the page says so; they were not checked against print.

**THE THIRTEENS ARE BUTCHER'S AND THE TOOL COUNTS THEM**, Swaying Sweetgrass's rule for a count that belongs to
somebody else; `check-counts.py` does not mind, because tables are not rooms. **No two of anything are alike and none
stand in a row**, which the tool refuses, because the books call the pub *a study in deliberate asymmetry*. The
friendly edit is to tidy it. **And asymmetry is not obstruction**: the tool walks the plan on a four-inch grid from
the door and refuses any table with no way to it 36 inches wide (403.5.1), a bar with no low stretch (904.4.1), a
ramp narrower than the steps or steeper than 1:12 (405), and beams under 80 inches (307.4). **The pub parts from the
books in three places and says so on the page**: a ramp beside the steps, the fans up between the beams, and your
order fetched or brought, whichever you say, nobody asking why. Those are access barriers in a room otherwise built
round the people in it, which is the room's whole reading of McAnally's: a radical third place, in our own Third
Places page's words, which are checked against the mirror on every build.

**THE DRAWING IS THE PLAN SEEN FROM A SEAT.** The pub is a one-point perspective projection of the same data the plan
and the table cards are written from, so moving a table moves it in the picture, on the plan and in the words, and a
table's facts (back to a wall, out of sight of the door, by the stove, in a patch of light) are worked out from the
plan rather than typed. What stands at the south end is behind the seat and is clipped from the view, not from the
plan. **The light is the street's, passed round by mirrors**: every mirror says where its light lands, and nothing is
lit warm, which is what keeps the browns muted and the room off The Den. The collisions are in §100.

**EVERY PINT IS ALCOHOL-FREE FIRST, IN THE SAME GLASS**: both pours are one drawing, so nobody can tell from across
the room which one anybody has. Big Steep's words for pressure and health are read out of `make-big-steep.py` with
`ast`, because that tool runs as a script and cannot be imported. **Its `rounds?` was narrowed to the round somebody
buys**, after it refused the pub's round tables; narrowed, not excepted. **Nothing behind the bar has a screen**, and
the tool refuses a frame, a video, a YouTube facade or a rack; the friendly edit is a telly over the bar with a rack of
pub films. **The player piano's rolls are a strip, not a screen** (Ryan, 2026-10-06): recordings of real piano rolls on
Wikimedia Commons, each public domain on its own page, played through `love-embed.js`'s audio builder from the
MP3 Commons makes of every file, so Safari plays them, nothing musical is hosted here, and nothing is fetched until a
roll is pressed. Commons' transcode path is in `AUDIO_ORIGINS`, which the tool reads. **Every composer died more
than seventy years ago, counted against the current year**, the Doomscroll's bar, so a roll of a 1920s song whose
writer died in the 1960s is refused even though it is public domain in the United States. **A file is not a roll
because Commons says "piano roll" near it**: several are notation software playing sheet music, and the data file
says they were left off. How each recording was made is said only where its Commons page says it. **`table.js` gained an optional
`data-table-tell`**, the sentence an order says, which `pint.js` sets for fetching or having it brought; the other
rooms never set it. **The pub's sweep anchors its negation window** to the word it excuses: written the old way,
*nobody lights a lamp.* excused *A lamp is lit on every table.* in the next sentence. The other rooms' sweeps are still
the old way.

**THE MAP IS THE ONE PAGE THAT SHOWS EVERY OTHER PAGE, AND NOTHING ON IT IS PAINTED.** `map.html`
(§49) is the whole street as a model in white card on a cutting mat: shopfronts on both sides of a
pencilled road, rooms behind rooms standing behind them, the garden's gate halfway down, the
campground's field off the top of the board past the treeline and the road out off the bottom past the
last streetlight. **Every building is one white card, on purpose**: a model that painted each building
in its room's colours would be a swatch book saying the rooms belong to one set, which is the
harmonising instinct arriving as a legend. **If a building on the model ever takes its room's colour,
the model has started describing the rooms instead of pointing at them.** The collisions are
structural: Danny the Street is the road ITSELF, straight down, under sodium, nothing standing up;
this is a MODEL of it, at an angle from standing height over a table, in daylight, everything standing
up and throwing a shadow. Samefood Cafe is the other thing seen over a table, straight down under an
even light; here the lamp is off to the upper right and every shadow falls down and to the left.
**Scale is the one thing no room has**, and no room should get it.

**IT HAS NO COORDINATES AND THAT IS THE MAINTENANCE PLAN.** `tools/make-map.py` reads the shopfronts
off index.html's row of doors, in order, alternating sides; the pitches off campgrounds.html's board
and the turnings off the-outskirts.html's signs, with their states; the gate goes halfway down however
long the street is. The layout is a CSS grid that flows, so a new shopfront makes the street longer
and nothing has to be put anywhere. **`data/map.json` holds only what the front page does not show**
— rooms behind rooms, the guild's back stair to 429, names too long to letter, and the pages pinned
to the mat's edge rather than built. **It refuses** a page in the sitemap's walking order with no place
on the model, a page placed twice, a room behind a room whose parent does not link to it, and a stale
entry. So: a new shopfront needs no map edit at all, only a re-run; a new room behind a room needs one
line in `data/map.json`. **Do not add coordinates, and do not hand-edit between the map markers.**

**WHICH END IS WHICH IS A DECISION THE MAP MADE, and it is Ryan's to change.** The front page lists
both edges at its foot, so nothing said which end the stoop is at. The model puts the treeline end at
the top with the stoop just inside it and the far end at the bottom, because "the far end" is what the
street's own copy calls the Outskirts' end. Flipping it is one edit in the generator's row order.

**WHERE AM I? IS THE ONLY SIGN-OFF LINK THAT DIFFERS PER PAGE, AND IT IS STILL WRITTEN ONCE.**
`tools/signoff.py` sends every page to `map.html#at-<its own filename>`, every place on the model
carries that id, and `:target` puts a flag on it saying *you came from here*. No script, no referrer,
nothing stored. The table on the model is the page you are on and always says *you are here* —
`:where(:target)` keeps the two rules level so the later one wins. **An id on the model is the
address of a page's place**, which is why make-map.py refuses a page placed twice.

**ON A PHONE BOTH SIDES OF THE ROAD ARE KEPT.** Folding the street into one column would make the map
a list of shopfronts, which is the front page. The lane narrows and every piece of card takes its
side's width; a room behind a room stands under the one you go through, stepped in from the board's
edge rather than off it, because a room pushed off the side of a phone is a room nobody can reach.

**THE ROAD IS ITS OWN LAYER, NOT THE LIST'S BACKGROUND.** As a gradient on the grid it made
`check-focus.py` measure every ring on the board against the pencil kerb, correctly, because a tool
reading a gradient cannot know which stop is under which link. The road is a `::before` strip now and
the buildings stand on plain board, which is what they actually stand on. **No transform anywhere in
§49**: the top and side of every building are clipped rectangles, not skews.

**THE ABOUT PAGE'S FILM IS A CLAUDE MOTION FILM, AND THE MP4 IS AN EXPORT OF IT, NOT ITS SOURCE.**
Ryan, 2026-10-15, for people shown the street who say they do not get it. `about.html` is paperwork
(`room-plain`, first of the credits in the sitemap, pinned on the map, no job marker), linked under the
front page's tagline and from the sign-off. The film's source is a Motion artifact on claude.ai
(https://claude.ai/artifact/FEuuhNaKmQxWmU4qSM5C6L, private to whoever it is shared with): each scene
is code in that artifact's store, the doors are `window.UI.DOORS` in its `shared.js`, lifted from §5's
door rules, and the names are set from this repo's own font files, uploaded there as assets. **A
change is made there and exported again**, then `video/about.mp4` is re-encoded from the export with
no audio and no metadata, and `video/about-poster.webp` re-cut from it. **The list under the video is
the film in words and changes with it**, the liner notes' entry names every face in it, and
`design.html#ai` says the film is code too. It is silent because nothing musical is hosted here: do
not add Motion's score. It is a `<video controls preload="none">`, which `make-now-playing.py` now
counts as a player, and `data/now-playing.json` leaves the page off the bill with its reason. **It shows
some doors and counts none**, and must not.

**THE CB IS THE ONLY SERVER-SIDE CODE ON THIS SITE, AND IT GOT IN ON NARROW TERMS.** A chat
channel patterned after citizens band radio (Ryan's brief, 2026-09-24): five Netlify Functions in
`netlify/functions/` sharing `netlify/cb/lib.mjs`, one JSON blob in Netlify Blobs holding the latest
fifty messages, each deleted 48 hours after it was sent. **`privacy.html` was rewritten before a line of it
was built**, and every sentence there is enforced in `lib.mjs`: no IP address stored (Netlify's own
`rateLimit` in each function's config counts addresses and never hands them over, so do not "improve"
it by keeping a list), **nothing a person types is ever logged** — no `console.log` of a handle,
message, password or pass, not even while debugging — and a pass is an HMAC keyed by the current
password, so **rotating is changing `CB_PASSWORD` and redeploying** and there is no list of passes
anywhere. `connect-src` is `'self'` and must not go further: a realtime service elsewhere would be a
third party every signed-on visitor talked to on every page. Both passwords live in Netlify's
environment, never in the repo.

**FIFTY MESSAGES, EACH FOR 48 HOURS FROM WHEN IT WAS SENT, AND NO MIDNIGHT ANY MORE.** Ryan,
2026-10-18: "Since we have people in timezones all over the world", reversing ten messages gone at
midnight in Colorado, which cleared the channel in the middle of somebody's afternoon. `KEEP` and
`LIFE` in `lib.mjs`, and `onAir()` decides on every read and every write, so a message is gone at
48 hours whether or not the sweep has run; the sweep (`sweepLog`, still in `cb-midnight.mjs`, whose
name is older than the rule) rewrites a log with the same conditional write a message goes out
with, and deletes it only once nothing in it is left. World, every room's channel and every place
on the Slake share it, as they always shared the day. **Everything sent before `LIFE_FROM`
(2026-10-19 00:00 in Colorado) went at that midnight**, the promise it was sent under; the test for
it can come out any time after that date. **The radio's times say the day** (`dayAgo`, `clock`,
`sentAt` in `cb.js`) because a message can be two days old, in the reader's own day, and so do the
World room's last busy time and a forum copy that spans days. The friendly edit is a midnight
"so the channel starts the day clean", which is the timezone problem again.

**NOBODY WHO HAS NOT SIGNED ON EVER DOWNLOADS `cb.js`, AND THEY GET `guest.js` INSTEAD.** Ryan,
2026-09-30: a guest CB for everybody not signed on, to bring people into the community and remind a
member who signed off where to turn the radio back on. It is the radio's bar in the radio's clothes
(its own shadow root, `cb.css`), **folded until pressed**, with the teleporter and a panel saying
what the CB is, that you join with an invite on `join.html`, and where the front desk is. **It knows nothing about the channel and must not**: no count of who is on, no hint of what
is said, or it is a window into the channel for people who are not on it. It keeps only
`love-cb-guest = "open"` while its panel is left open, and the list of rooms is fetched only when the
teleporter opens. `love.js` loads it exactly where the radio would come, so `data-cb="off"` pages
and frames get neither. **The Faery Yurt shipped with `data-cb-guest="off"` and Helen said yes the next
day** (2026-09-30), which is where the conventions rule above came from; `data-cb-guest="off"` still
works in `love.js` for a room that has a reason of its own, like `data-cb="off"`. **Its teleporter is a copy of the radio's**, because the radio's is in
`cb.js`: change one, change both. **It signs on in place** (Ryan, 2026-09-30): the front desk's form and
its `love-cb` shape, then `window.loveRadio()` from `love.js`, so the radio arrives under every rule
`love.js` applies to a page and nothing is decided in `guest.js`. `love.js` injects it only when a pass is
already in `localStorage`, never inside a frame (the Hermitage's laptop frames this site), and never
on a page whose `<body>` says `data-cb="off"` or `data-cb="here"`. **The Healing Checkpoint is `off`,
Ryan's call**, because it promises it writes nothing down about you, and `make-checkpoint.py` refuses
the page without the attribute. The Community Center is `here` because it loads `cb.js` itself. **When
a floating thing reached every room, the rooms' own promises had to be narrowed**: "nothing is stored,
nothing is sent" became "the cabinets store nothing and send nothing", "nothing is fetched until you
press" became "nothing is fetched from YouTube until you press". **A new room scopes its promises to
its own objects** and does not say anything about the whole page that the radio would make untrue.

**THE RADIO LIVES IN A SHADOW ROOT, AND THAT IS THE SKIP LINK'S LESSON APPLIED IN ADVANCE.** Every room
styles `.room-x a`, `.room-x p` and buttons at (0,2,0), and a panel appended to `<body>` in every room
meets all of them at once, in rooms nobody is thinking about when they change the radio. Inside the
shadow root only `cb.css` applies. **The colours are still §2's `--cb-*`**, because custom properties
on `:root` inherit across the boundary, which keeps them in `check-contrast.py`'s coverage check. It
keeps its own clothes in every room, the dial's precedent. **Its colour schemes are the visitor's, not a
room's** (Ryan, 2026-10-17, from a request): Colours under Your radio picks one, kept in `love-cb` as
`scheme`, and the default, Match my device, is High contrast, Daylight or Amber from the device's own
settings. `call.js`'s `schemeFor` is the one place that decides and puts `data-scheme` on the radio's,
the call window's and (by a copy in `guest.js`) the guest bar's host; `cb.css` lays
`--cb-<scheme>-<part>` over the seven `--cb-*` there. **A new scheme is seven colours in §2, a block in
`cb.css`, an entry in `SCHEMES` and in `check-contrast.py`'s `CB_SCHEMES`**, which holds every pair the
amber set makes and High contrast at 7:1. The friendly edit is a scheme that takes the room's colours;
no room dresses the radio. **The worlds are Ryan's list of 2026-10-17** ("a really personal and fun
experience, with lots of theme options"), each with a drawing under the bar, at the foot, along every divider
between parts and down both sides outside the box (on a rail of the theme's case, because its inks are
measured on that case and not on the room behind), from `cb-themes.js`, loaded only when one is on, every ink a token held as ornament in `check-contrast.py`
(`CB_ORNAMENT`), and each its own shape and display face for the radio's name and headings only;
**every sentence stays in Atkinson Hyperlegible**. **A theme's drawing is the one thing on the radio
that moves**, reversing "nothing on it moves at any setting" for the trims only: at MAX GLITTER by
itself, or after Let my theme move (`love-cb`'s `motion`), the candles' rule; `call.js` writes it as
`data-motion` on the host and follows the dial. **Nothing on it moves or lights up when a message
lands**: a receive lamp is an alert with the sound off. **A side is drawn once, longer than the radio can be, and never because the radio grew**: a message arriving
must not start a drawing again. The Mover keeps the radio that much further from the window's edge
(`mover.margin`, measured off the sides), and below 460px the sides are left off. The friendly edits are a
drawing behind the words (it goes in a trim, a side or a divider's groove; a profile's effect is the one exception,
Ryan's call, and only while drawings move) and a theme that flashes. **The Winamp skins** (Ryan, 2026-10-17) are a fourth group, each
credited in `call.js` to whoever its own readme in the Winamp Skin Museum names, or saying it names nobody
(an email address is not published); **no skin's bitmap and no game's character or mark is drawn**, and Kuki's
readme asks that nothing of the Cube be republished. **The GeoCities pages** (the same day) are a fifth group, after
homepages in Restorativland's GeoCities archive: each credited as the page names its maker and otherwise by
title and address, never an email or anything about anybody's life, and nothing on them used or anybody on
them drawn, the child whose drawings fill mansnhomepage above all. **Ryan's favourite games** (the same day) are a
sixth group: each a game's palette and the shapes of its world, with **no character, logo, emblem or symbol of
any game drawn** (no Triforce, no Aperture logo, no wolf medallion, no Eye), its studio and its trade mark's owner
named. Skyrim's snow falls with `art-fall`, a translate down, and Cloud City's cloud cars hold station with `art-hover`,
forward and back and never round a loop, the only new motions. Shadow of Mordor's
**rune medallions** are after the game's runes (Ryan's ask) and every mark is assembled in `rune()` from a
stave, branches, a crescent, prongs and dots, so none is the game's and none a Tengwar or Cirth letter;
down a side each medallion is turned back upright about its own centre. The radio's name never draws past 1.1 of its size in a
theme's face, because the bar is full. **It never claims what it has not
heard** — it says *tuning in* until the first listen answers and *no signal* when one fails, because
"nobody has said anything" is a statement about the channel and only a reply can make it true. It
also never counts: no people on the channel, no number of anything new (what is new is marked, below).

**A ROOM ON THE STREET IS A LINK ON THE CHANNEL, AND A LINK OFF IT SAYS SO.** Ryan, 2026-09-25, so somebody
can drop a room for somebody else to join them in. **#rooms are Discord's way, Ryan's call**: the
message carries `#the-den` and every radio shows "#The Den", linked, out of `/cb-rooms.json`, which
`make-sitemap.py` writes from every page's own `<title>` in walking order, so a new room is a tag the
day it is in ORDER and a room's tag is its filename. **Renaming a file breaks the tag in every
message still on the channel that day**, which is one reason to rename rarely. The list is fetched
once, on the radio's first listen, never while folded; until it arrives a #tag is the words somebody
typed, and a #word that is no room stays a word. The completion list is the ARIA combobox pattern:
Enter picks while it is open and transmits while it is shut, Escape leaves that # alone, and the
screen reader hears the room under the arrow and never how many there are. `streetLinks` in `cb.js` turns only this street's
own addresses into paths, checked character by character and never as HTML. **Every other
`http(s)://` address is a link too since 2026-09-29, Ryan's call, reversing the street-only rule**,
but it is built so the old reason still holds: the channel is a stranger's words reaching the page,
so a link off the street must never look like one on it. `awayUrl` parses it with `URL()` and wants
http or https, a dotted host and no name or password (`stimpunks.world@elsewhere` stays words, whole,
rather than half a link to the street); it opens in a new tab with `noopener noreferrer nofollow
ugc`, its words are what was typed, and `↗ host` after it is the host as `URL()` spells it, so a
lookalike shows its punycode. **A link's words can differ from its address since 2026-10-19, Ryan's
ask, reversing "a Markdown `[text](url)` stays as typed"**, and the old reason still holds: a
`[words](address)` link off the street is `awayLink` with those words, so `↗ host` is after them, and
one on the street is a path checked as `streetLinks` checks one. **Words that are an address, or
shaped like one (`paypal.com`), are not made a link** (`addressy` in `cb.js`): it stays as typed and its
address is linked as a bare one is. **Unless every site the words name is the link's own** (Ryan, 2026-10-22, after
`[Chat — Stimpunks.World](https://stimpunks.world/chat)` stayed raw): naming the site a link goes to disguises nothing,
and a word naming any other site still keeps the whole link as typed. The friendly edit is to drop the host after the words "because the
words say where it goes"; the host is the only thing a stranger cannot dress up. The house norms and
the privacy page say so. And **the log never
scrolls under a reader**: it used to jump to the bottom on every listen, so scrolling up was undone
four seconds later. It follows the newest message only when something new arrived and the log was
already at the bottom, or when you transmitted.

**AN @MENTION IS DRAWN AS A NAME, AND THE MESSAGE SAYS WHICH NAMES.** Ryan's ask, 2026-10-19: @ in
the message box opens the # list's combobox for people (`token`, `peopleFor` in `cb.js`): the channel's
senders, the handles its messages mention and Who's online, asked once, alphabetical, never you, and
never on a stamp (`@34:12` is digits). The radio sends `at`, the handles it means, and `channelMentions`
in `lib.mjs` keeps only those `mentions()` finds in the words, at most `MENTION_MAX`, worked out again on
an edit; `markAt` draws them, and your own handle, as buttons that open the profile, yours filled. **It
is not who gets told**: a notification still asks `mentions()` of each device's handle. The friendly
edits are a highlight on the whole message, a sound when you are mentioned, and a list of your mentions;
the first two are the receive lamp the radio refuses, and the third is a record kept against a person.

**A ROLE CAN BE CALLED WITH AN @, AND NOBODY IS EVER TOLD WHO HOLDS IT.** Ryan's ask, 2026-10-23: `@moderator`,
`@director`, `@board` and `@administrator`, on a channel, in the forums, and in Tasks and the office. **Who may call
which is `ROLE_ANYBODY` in `lib.mjs`**, Ryan's call the same day: anybody claimed calls @moderator (asking for help),
the base calls all four (`mentionableRoles`). `roleMentions` keeps on a message, an edit or a post only what the sender's own pass may call and
the words name, as `roles`, never what a page sends; `tellDevices` and `notifyForum` tell a device only when its pass
holds the role now and may go there (`roomAllows`, `forumAllows`, never a quiet room), with `as` naming the role, under
When somebody @mentions me; Tasks and the office put it in the Notifications of everybody on Tasks who holds it
(`taskConcerns`). The radio, `links.js` and `forum.js` offer the roles the server says (`mention`) first in the @ list
and draw a called role with nothing to press. **A role's word is nobody's username** (`roleWord` in `checkHandle`,
`joinAccount` and `claimAccount`), and `mentions()` never reads one as a handle. `tools/check-push.py` holds it. **The
friendly edits are the role's people in the @ list "so you know who you are calling", a count of who was told, and
`@moderators` as an alias**: the first two publish who holds which role, which is not ours to publish, and the third
makes a word in a sentence ring people. **A member's @moderator also leaves a note on the desk** (Ryan's call, the
same day): `noteModCall` in `lib.mjs`, from `cb-transmit`, `cb-edit` and `cb-forum`, keeps who, when, where and the
words in one blob (`mod-calls`), never for the base, a quiet room or a room or category only some may enter, and
`/cb/mod-calls` lets the base read and close them in `desk.js` (closing deletes, nothing records who closed it, thirty
days at most), the reports' arrangement. The friendly edit is a note of who answered a call, which is a record of
moderation kept against a person. `DECISIONS.md` has what is open.

**A PICTURE IS SHOWN BEFORE IT GOES** (Ryan's ask, 2026-10-19): `picPending`/`picReady` in `cb.js` put
the redrawn blob, which is exactly what is sent, above the box with the file's name, for the channel and
for Messages alike. It is a `blob:` address that goes with the picture.

**THE CHAT PAGE IS THE RADIO DOCKED INTO A PAGE, AND IT CHANGES NOTHING FOR THE RADIO ANYWHERE ELSE.** Ryan's ask,
2026-10-22: a Discord-style page for the rooms' channels. `chat.html` says `data-cb-chat`, and `cb.js` (`inChat`) puts the
radio into `[data-cb-dock]` at Full rather than over the page, adds a Channels part down the left (`chatMake`), and makes
the channel picked the radio's room (`chatRoom`, through `hereRoom`, `herePath` and `tunedRoom`), so Be seen here and the
call follow it. **Conversations are in the list too, under Direct messages, and the one picked takes the channel's place in
the middle** (Ryan's ask, the same day): the Messages part stands after the channel in the middle column, shown only while a
conversation is picked (`chatViewDm`), the channel's messages are not marked read while it is covered (`readTick`), and the
list of conversations is asked from `listen()` at most every `NEWS_EVERY` (`chatDmTick`), never on a timer of its own. A
conversation is never in the address, because the address goes into the browser's history. The channel's pick lives only
in the address's `#`; `save()` writes back `CHAT_OWN` (size, folded, where it sits,
World or This room, popped) as they are stored, so the chat page never resizes or retunes the radio on another page. The
groups: Community (World, the Community Center, Community Care, Coping, Pets, Show Your Work and Cavendish's rooms out of
`data/coworking.json`), Staff (MOD_ROOMS with their roles, and the categories `forumRooms` marks `locked`), and **every room
but Staff's and World under each of its tags**, Community's too (Ryan's asks, 2026-10-24, replacing the one World group). `tools/make-chat.py` writes them onto
the page and refuses a quiet room there, because the page is public. **ROOM TAGS ARE `data/room-tags.json`**: the tags in
the order their groups come (Ryan's first, Music to Make/build, in his order and words; the rest added the same day so every
room has one that is true of it), what each means, and every room's, keyed by filename. A room is in every group it is tagged, so
`chatShown` marks the first of a room's links for the keyboard and `chatRove` takes the first shown. **A new room needs its
tags before `make-chat.py` will run**, Community's rooms included (Ryan, the same morning: they are in Community and
under their tags too); a Staff room is refused one, because a tag group is listed for anybody and a Staff room only for a
pass that can go in, and so is World, the whole street's channel.
**Music and videos are held to the Now Playing bill both ways**: tagged music or videos means something to press and play,
and a room on the bill has one of the two. The friendly edits are tagging a room for what it is near rather than what it is,
piling tags on a room "so more people find it", and a count beside a group. **The friendly
edits are a second chat in a file of its own** (two copies of the message log, which drift), **saving the chat page's
layout into `love-cb`**, and **listening to every channel at once for live dots**: the dots are Unreads', which asks
nothing new, and a listen per channel would tell us where everybody is reading.

**THE RADIO CAN GO INTO A WINDOW OF ITS OWN, `cb-window.html`, AND ONLY ONE RADIO LISTENS.** Ryan's ask,
2026-10-19: "a popout for the CB like the video player, keeping currently selected size". Pop out, under
Your radio, opens it as big as the radio is and at its size; − and + there resize the window
(`fitWindow`). Every other page gets the folded bar (`showStub`: Show it, Bring it back), which sends
nothing; they talk over the `love-cb-window` BroadcastChannel, `love-cb` keeps `popped` while it is
out, and a page whose window does not answer within a moment-and-a-half takes the radio back. **The
radio there is about the window it came from** (`streetDoc`, read through `window.opener`, same site):
`herePath`, `offList`, `quietHere`, `pageName` and `mayHere` read that page, so This room, Be seen here,
the call and the teleporter follow you, `whereNow` retunes when it moves, links in the radio open there
(`goStreet`), a page with `data-cb="off"` is no room to it, and a call goes straight into the call's own
window (`loveCall.popOut`). **@times and Catch up run in that page's cb.js** (`loveCbFilms.jump`, which is
`jumpHere`), because the film is there; **Host this film and Follow stay with the radio in the page**, and
Follow is not offered in the window. It is a window (`tools/windows.py`), never a room. The browser pane
in this app opens a pop-up in the same tab, so test it in real Chrome over CDP with `userGesture: true`.

**SPEAK NEW MESSAGES ALOUD WAS SILENT FROM 2026-10-18 TO 2026-10-19**, because `show()` kept the channel
in `this.onAir`, which is also the voice's speaking flag, so the queue never started. The list is
`this.aired` now. **Two meanings, one name, no error**: grep a property before reusing it. **Read aloud**,
under a message's three dots (Ryan's ask, 2026-10-21, the channel's and a conversation's), reads that one
message now through the same queue as a `read` item (`readAloud`, `spokenText`), switch on or off, under
the voice's rules: `localVoice()` only, and the squelch following the dial. It hushes what was being said
first, and `hush()` moves `this.gen` on, so an utterance cut off can never end the one after it.

**WHAT IS NEW TO YOU IS MARKED, NEVER COUNTED, AND THE SERVER KEEPS WHAT YOU READ.** Ryan's ask and calls,
2026-10-20, reversing "no badge, no unread count" and "nothing lights up when a message lands" for a mark:
a dot in the button's own ink (`markNew`, "something new" to a screen reader) on World, This room, Your
messages and a conversation, and the **Unreads** part (`newsShown`) listing World, the rooms followed and
conversations. **What you read is on the server, per claimed username** (`newFor`, `markRead`, `reads/` under
the dmKey, a time per channel and conversation, dropped at 48 hours), Ryan's choice over each browser keeping
its own; **Follow this room is in love-cb**, and so is **Follow every room** (`followAll`, Norah's ask, 2026-10-21):
every room `cb-rooms.json` and the forums give the radio, later ones included and never a quiet room, with the rooms
followed one by one kept for when it goes off. The friendly edit is to write every tag into `follow`, which misses
the next room to open and runs past `FOLLOW_MAX`. The channels' newest times are one map, `channel-latest`, kept by
`noteLatest` in `cb-transmit`, so the radio learns what is new in This room without saying where it is. The
radio asks `/cb/unread` from `listen()` at most every `NEWS_EVERY`, and reports a channel read only when its
newest message is at the foot of the log. Never a room that keeps to itself; Forget me and deleting the
username delete the record. **The friendly edits are a number beside the dot, a dot on the icon, a sound,
and the tab's title changing**; each is the count or the alert the street still refuses. DECISIONS.md has
what is still open.

**A REPLY POINTS AT A MESSAGE AND KEEPS NOTHING OF IT.** Ryan's ask, 2026-10-21: **Reply**, a curved arrow between
React and the dots, on the channel's messages and an accepted conversation's, opens a bar above the box (`reBar`,
`replyStart`, `dmReplyStart` in `cb.js`) with whose message and its first words; Cancel reply or Escape lets it go and
keeps the words. A message carries `re`, the id of the one it answers (`replyTo` in `lib.mjs`), which `cb-transmit`
looks for inside the same conditional write the reply goes out with, and `sendDm` inside the conversation's, and
refuses with `gone: 're'` when it has gone. **Nothing else of the message answered is kept**: every radio draws the
quote (`drawRe`, `reWords`) from what is on the channel now, so an edit changes it, Take off takes it, and its 48 hours
end it, after which the reply says it answered a message no longer on the channel. The quote sits on row 1 of the
message's grid, above the name, and first in its markup, so the live region reads who it answers first. **When somebody
replies to me** is the `replies` push kind: `notifyMessage` takes the message answered as `to`, found by transmit and
never kept, and tells only a device that is its sender by `canEdit`'s rule, never in a room that keeps to itself. The
friendly edits are **a copy of the quoted words "so the quote survives"**, which keeps words past their message and past
Take off, and **a reply that notifies by default**, which is a switch somebody did not switch on. A forum copy does not
yet carry which message a reply answered.

**A REACTION NAMES WHO AND NEVER SAYS HOW MANY.** Ryan, 2026-09-30: React on a message opens a fixed
set (`REACTIONS` in `lib.mjs`, copied in `cb.js`: change both), pressed again to take yours back
(`toggleReaction`, `/cb/react`, the channel's conditional write, raced fifteen at once in
`lib.test.mjs`). `shape()` sends each reaction as `{ emoji, name, who }`, handles alphabetical, and the
radio draws the names. **The friendly edit is a number beside the heart**, and it is the headcount the
street refuses. The line under a message is `aria-live="off"` inside the log, so a reaction landing is
not announced as a message, and it is redrawn only when it changes, keeping the keyboard where it was.
**Any other emoji is allowed and only an emoji** (Ryan, the same evening): a page cannot open the system
emoji picker, so the picker types into a box, and `reactionOf` takes exactly one grapheme made only of
emoji parts with a pictograph, flag or keycap in it; `REACT_KINDS` caps different reactions per
message. The chalkboard's "no reactions" is the board's rule and still holds.

**TAKE OFF IS ON YOUR OWN MESSAGES TOO, AND `canTakeOff` IN `lib.mjs` IS THE ONE PLACE THAT DECIDES.**
Ryan, 2026-10-08. `/cb/moderate` takes a message off for the base, or for whoever sent it: the handle on
the message, folded, with no record of who sent what kept for it. **A CLAIMED message comes off only for a
claimed pass and a BASE message only for the base**, so a deleted username signed on as again with the
community password cannot reach back to the morning. Clear stays the base's, and the function asks
`roomAllows` now, which it never did. `Radio.prototype.mine` in `cb.js` copies the rule only to draw the
button; change both. Nothing marks where a message was, as with the base's: it goes as if its 48 hours were up.

**EDIT IS ON YOUR OWN MESSAGES, AND THE BASE GETS NO FURTHER THAN ITS OWN.** Ryan, 2026-10-18. `/cb/edit`
(`editMessage` in `lib.mjs`) replaces a message's words and adds `edited`, the time of the latest edit; the
handle, marks, `t`, picture, sticker and reactions stay, so it still goes 48 hours after it was SENT.
**`canEdit` is `canTakeOff` without the base's reach**: taking any message down is the base's, putting words in
somebody's mouth is nobody's. `Radio.prototype.mayEdit` in `cb.js` copies it to draw the button; change both.
**The words it replaces are not kept anywhere**, and the friendly edit is an edit history "for transparency":
the mark is what says it changed. An edit tells only somebody it newly @mentions (`notifyEdit`, the forum's
rule), and a copy taken to the forums carries `edited`, which is why "copied exactly as they were sent" now
reads "as they are on the channel". The edit box opens in the words' place in the log with `aria-live="off"`;
Up in an empty message box edits your newest message.

**A MESSAGE IS 2,000 CHARACTERS AND BASIC MARKDOWN, DRAWN AS ELEMENTS AND NEVER AS HTML.** Ryan,
2026-09-29. `MESSAGE_MAX` and `cleanMessage` in `lib.mjs` keep a message's lines (the Slake, the
chalkboard and the bowls keep `TEXT_MAX`'s 280 and one line). `md()` in `cb.js` builds every piece
with `el()` and `textContent`, so nothing typed becomes markup. **A link is `streetLinks`' or a
`[words](address)` one (`mdLinks`), and `# heading` is a heading** (`#` and a space, so `#the-den` is
still a room, h3 to h6 because the radio's parts are h2s). `kept()` keeps a street address, a
`[words](address)` link and a stamp with what it names out of the emphasis pass, because an underscore in a path or an asterisk in a film's
title would otherwise break the link or the jump. **A message now has `li` inside it**, and the
pass that drops messages gone from the channel read those as messages and emptied every list; it
asks for `:scope > li`. Anything else walking the log must ask the same way. **On a phone Return makes
a new line and the button sends** (feedback from our community, 2026-10-19: a phone's keyboard has no Shift and Enter):
every box that sends on Enter asks `sendKey()` in `cb.js` and takes its hint from `enterHint()`, Ctrl or Cmd and Enter
sends everywhere, and on a touch screen the box starts four lines tall at 16px, because iOS zooms into anything smaller.
Copy writes the words as typed and sends nothing. Size is − and + on the bar (Ryan, 2026-10-17: a panel to reach Small
was a step too much), stepping Icon, Small, Normal, Large, Full (2026-10-19 added the two ends),
and Move is a six-dot grip; both are icons, because the bar is full.

**THE TELEPORTER IS WHERE "CH 19" WAS, AND IT SENDS NOTHING.** Ryan, 2026-09-26: the channel number
was decoration, so the bar's readout became a button that opens a filterable list of every room on
the street, out of the same `/cb-rooms.json` as the #tags, and goes there. Going is ordinary
navigation: nothing reaches the channel and nobody learns where you went. It hides while folded,
like − and +, because folded sends nothing and the list is a fetch. **The bar is full**: CB,
Teleport, the grip, − and + and Fold away fit on one row in every theme (2026-10-17), with six
pixels to spare in the tightest at desktop width and none at 360px, where the bar's spaces close
up, because the grip and − and + are 32px icons and a theme's name is set no larger than 1.1 times. A theme with a wider face, or another thing on the bar, wraps the row,
which the bar allows on a phone and should not need anywhere else: measure every theme.

**IT SEARCHES NAMES AND DESCRIPTIONS, AND NOBODY KEEPS A KEYWORD LIST.** Helen Edgar's asks,
2026-10-01: "fire" finds The Campfire (inside a word of a name), and a keyword finds the rooms it
is about. `findRooms` looks in each room's `about`, which `make-sitemap.py` copies off the page's
own `<meta name="description">`. **A word no description uses finds nothing** ("music" does not, on
the day it shipped); the fix is the room's description saying what the room is, never a hand-kept
thesaurus or keyword list, which was tried and measured: "play" caught every playlist and "call"
caught "called". Rooms found by name come first, then by description, each in walking order. **The
search is in `cb.js`, `guest.js` and `finder.js` character for character**, and
`tools/check-teleport.py` refuses them apart and runs Helen's asks against the list. **`finder.js` is
the search box on the front page and the Map, and only there** (Helen asked for a search bar at the
top; Ryan's call, 2026-10-01): a bar on every page would be furniture laid over every world, and the
teleporter already searches from every page. Each page dresses it in its own section (`finder` in
§5, `mm-find` in §49); the script finds its parts by `data-finder*` and sets no colour. **It also searches
every page's words** (Ryan, 2026-10-01, "add site search"), out of `search-index.json`, which
`tools/make-search-index.py` writes off each page's `<main>` after `make-sitemap.py`. **Not Pagefind**:
its WebAssembly needs `'wasm-unsafe-eval'` in `script-src`, its index churns in every morning commit,
and both machines would need it. **A `<blockquote>` is filed apart and shown by its credit, never its
words**, because a snippet is a trimming machine and this site keeps attribution to stop that. The
regions the morning timers rewrite are in `DAILY` in that tool: **a new timer that rewrites part of a
page adds its markers there**, or the index is stale by breakfast. The Small Hours' lyric is left out
and the tool checks the words, not just the class. The #tag completion still uses
`roomsFor`, which only matches from the start of a name, on purpose: `#den` should not offer The
Garden.

**SMALL IS STILL ON, AND FOLDED IS OFF.** Ryan, 2026-09-25, watching a film at the Hermitage's
campfire with the radio over the screen: small is the bar and the newest message, clamped, listening
exactly as full size does. It is the same log with the older messages hidden, so the live region
still reads what arrives. **Do not merge small into folded** to save a button: folded sending nothing
is a promise on the privacy page, and small exists precisely because somebody wanted to keep hearing.
Nothing lights up when a message lands in either size.

**ICON IS SMALLER THAN SMALL AND STILL ON; FULL IS THE WHOLE WINDOW.** Ryan, 2026-10-19, both the
same morning. **Icon** is the radio as a CB set drawn on its own case (`radioIcon()` in `cb.js`: the
aerial, a readout saying 19, a knob and the handset on its coiled cord, in the scheme's steel, glass
and amber, so every scheme's icon is that scheme's). It listens, so hosting, following and Be seen
here carry on, but it shows nothing and the log is off the page, so a screen reader hears nothing new
(Speak new messages aloud still speaks), and the guide says Small is the size for keeping an ear on
the channel. **The friendly edits are an unread dot on the icon and making the icon folded**: the
first is the receive lamp the radio refuses, the second takes away the one size that keeps a hosted
film going with the radio out of the way. Pressing it opens Small; it drags, because it is a button
marked `data-drag`, which the Mover (`call.js`) now lets drag and presses itself on a tap, since the
bar holds the pointer and the button's own click never arrives. **Full** fills the window less
`EDGE`, does not move (`mover.still`), hides Move and the theme's sides (there is no outside for them),
and sits at z-index 88, **under** a room's call window, so a call is never lost behind it. On a window
at least 1000px wide the parts stand in three columns, each scrolling by itself, left to right in the
order they come top to bottom everywhere else (where you are and the channel, wide; then Messages to Events;
then the rest, since 2026-10-23, and a column with nothing in it is not drawn): `part()` puts them in `.cb-col` wrappers that are
`display: contents` at every other size, and the groove is `.cb-sec--after` rather than
`.cb-sec + .cb-sec`, because a part's neighbour may be in another column. **A scheme that styles the
groove targets `.cb-sec.cb-sec--after`.** The Mover change also fixed a press on Move's own dots,
which hit the drawing inside the button and did nothing, drag or tap, until then.

**OPEN IS ON AND CLOSED IS OFF, AND THAT IS ONE FUNCTION.** `Radio.prototype.tune` is the only place
that decides whether the radio makes requests: open *and* `document.visibilityState === 'visible'`.
Folded or in a background tab it sends nothing, which is both the brief's "if the CB is closed you
get nothing" and the whole of the cost control. **The browser pane in this app reports `hidden` when
the pane is not showing**, so a radio that seems to have stopped listening in a test may be obeying
that rule. Do not add a second timer anywhere else in the file.

**NOTIFICATIONS REVERSED "NO ALERTS", AND THE RADIO STILL LISTENS ONLY WHILE IT IS OPEN.** Ryan, 2026-10-18, after
requests "especially for staff": Web Push, so a device is told with the site closed; the things that can notify (an
@ mention, a message in a room the device follows, a call starting in a room it follows or the World call, every
message on World, and, the same evening, props given to a claimed username), each off until switched on; anybody signed on; and the message's first `PUSH_WORDS` characters, which
each device can switch off. **"Open is on and closed is off" is still the radio's rule**: notifications come from the
server when a message is sent (`notifyMessage` from `cb-transmit`, `notifyCall` from `cb-call-events` when a call
goes from nobody to somebody, `notifyProps` from `cb-props-of`), never from a radio listening in the background. **One record per device in one blob**
(`push-devices`, the worn avatar's arrangement, raced fifteen at once in `lib.test.mjs`): the push address and its keys,
the handle, the pass's kind and **a hash of the pass, never the pass**. Before a device is told anything, the pass its
handle would have now is made again (`issuePass`, `issueAccountPass`), checked against the hash and read by `readPass()`,
so a changed password, a claim, a reset, a deletion or somebody off the moderators' list stops their notifications with
nothing to remember, and `roomAllows()` decides every private room. **Encryption and VAPID are `node:crypto`, no
dependency**, and `encryptPush` matches RFC 8291's worked example byte for byte in the tests; the key is `CB_PUSH_KEY`
in Netlify (a raw P-256 private key, base64url), and without it nothing offers notifications. **The server posts only
to `PUSH_HOSTS`**, anchored patterns for Google's, Mozilla's, Apple's and Microsoft's push services, so a request cannot
choose where it posts. **A call's notification never says who joined**: who is in a call is shown only in its room
(`privacy.html#calls`), and widening that is still Ryan's call. **A quiet room tells only its followers**, so a mention
there tells nobody, because a notification is the room announced outside. Nobody is told about their own message.
`cb-sw.js` is the street's one service worker: it shows a notification and opens its room, and `tools/check-push.py`
refuses a fetch listener, a cache, storage or imported code in it, and any script but `cb.js` asking the browser for
notifications. Signing off, Switch off on this device, Forget me and deleting the username delete a device's record. **The
friendly edits are an unread count, a badge on the radio or the tab, and the radio listening in a background tab "to
notify sooner"**: the first two are the counts the street refuses, the third breaks the radio's own rule. **Everything,
and anything added later** (feedback from our community and Ryan's call, 2026-10-19, World included) is a switch `all`
that turns on every kind and every kind added after it, so **every notifier asks `wants()`, never a switch by name**, and
`check-push.py` refuses one that does: a kind read directly would stay off for somebody who chose everything. A new kind
is an entry in `PUSH_KINDS` and in the radio's `NOTIFY_KINDS`; it leaves the words and the rooms followed alone.
**Follow every room** (`everyRoom`, Norah's ask, 2026-10-21) is not a kind: a device follows every room its pass can go
into, later ones included, and **every notifier asks `followsRoom()`, never `w.rooms`**, which `check-push.py` refuses,
because `followsRoom()` is what keeps a room that keeps to itself out of every room: announcing one to everybody would
name its address. The friendly edits are folding it into Everything, and letting it take in the quiet rooms.

**THE MANIFEST'S DISPLAY IS `minimal-ui`, SO AN iPHONE NOTIFIES ONLY FROM iOS 26.** Ryan's call, 2026-10-20, when people
began adding the street to their Docks and Home Screens. An iPhone or iPad notifies only as a Home Screen web app, and iOS
ignores `minimal-ui`, so before iOS 26 the street is saved as a Safari bookmark; from iOS 26 every site added to the Home
Screen opens as a web app (WebKit's Safari 26 notes), so it notifies. **It stays `minimal-ui` because a Mac's Add to Dock
shows back and forward only when the manifest is not `standalone`**, and the cb-guide, the privacy page and the radio's
own line say iOS 26 or later. The friendly edit is `standalone` "so older iPhones get notifications", which takes the
Dock's back button away. **The manifest's `id` is `/`**, what Chrome had already worked out from `start_url`, so every
install made before it was written is the same app; a new id is a new app. `tools/make-icons.py` writes the manifest's
icons and refuses either changing, and renders `badge-96.png`, the heart alone, because Android draws a notification's
badge from its transparency and `icon-192` came out a plain square. **An installed app on iOS, iPadOS or a Mac's Dock keeps
its storage apart from Safari's**, so the CB pass, the dial and `love-rescues` start afresh there (`cb-guide.html#installed`);
Chrome's and Edge's share the browser's. **There is no offline page**, because `cb-sw.js` has no fetch handler and is
registered only by Notify me: one would need a service worker for every visitor, which is Ryan's call.

**`onlyIfMatch: undefined` IS NOT A CONDITIONAL WRITE, IT IS AN UNCONDITIONAL ONE.** Netlify's local
Blobs emulator sends no etag on a read, so the first draft's compare-and-swap quietly wrote without a
version, and fifteen people transmitting at once came out as three messages, every one told it had
worked. `versioned()` takes the version off a listing on both sides of the read when the read has none,
and the code never writes without one. **The emulator's conditional write is also not atomic**, so
concurrency cannot be tested against it at all: the logic was tested against an in-memory store whose
check-and-write is atomic, with `node --experimental-test-module-mocks`, down both etag paths. Test it
that way again after touching `updateChannel`.

**THE TOWN HALL'S PRIVATE ROOMS ARE LOCKED ON THE SERVER, AND THE PAGE ONLY KEEPS QUIET.** Ryan,
2026-09-29: the Town Hall (§77) has a Fishbowl for anybody on the CB and rooms for our directors,
board and moderators, which anybody can walk into and whose CB only shows for the base. **`MOD_ROOMS`
in `netlify/cb/lib.mjs` is the one list**, and `roomAllows()` is asked by every function that touches
a room: listening and transmitting (403), hosting, the call (no token), and **the beacons in
everybody's listen**, which are filtered so a film hosted in the board room is not news to the
street. `lib.test.mjs` races it and was broken on purpose. `data-cb="mods"` on a page's `<body>`
stops `love.js` loading the radio for anybody whose stored pass is not the base's, and `cb.js`
checks again, but **that is the page keeping quiet, not the lock**: never move the gate into the
client. `tools/make-town-hall.py` reads `MOD_ROOMS` and `PUBLIC_CALLS` and refuses a room whose
`for` disagrees, a private page without `data-cb="mods"`, and a call panel without
`data-call-mods`, which `callroom.js` reads, and a room page that does not say Ryan's own line for it. **The Fishbowl (§78) is a glass bowl of water on a sunny sill**, the one room lit by refraction: the sun bent through the water into bright lines, dark ink on the pale water, and a ring of stones inside with one gap kept open; its collisions are in its section. **The Directors' room (§79) is lit only through the frosted pane in its door**, soft and edgeless, the name backwards on the glass; it lists the directors off stimpunks.org/about/ in that page's order and titles, from `people` in `data/town-hall.json`, and the tool refuses an anchor the mirror's About page no longer has. **The Board room (§80) is one long table with the same lamp at every seat**, the Collection Collection's rule inverted on purpose: there no two lamps may be alike, here none may differ. It lists the board off the Board & Governance page, and carries the Governance & Ethics section of the Accountability page **word for word, from `governance` in the data**, every sentence and link looked for in the mirror's section on every build. **When that page changes, re-copy the section; never loosen the check.** A link on it that goes nowhere is left off with a note, not repointed by guess. **The Moderators' room (§81) is above the street at night, lit only by the shopfronts' colours on its ceiling**, side by side and never mixed, which is what holds it off the Repeater's blended skyglow; the radio on its desk is drawn off. **ROLES ARE BUILT, AND THE LIST IS NOT IN THIS REPO.** `CB_MODS` in Netlify's environment is JSON,
handle to roles (`moderator` implied; `board`, `director`, `administrator`); `readMods()` reads it on
every request, folds handles (NFKC, case, spaces), and **refuses the whole list over one bad role or two
entries that fold alike**, because a list read as less than was meant is a silent lockout. **A missing
or unreadable list fails closed**: no MOD sign-on, no base pass, nothing into a private room, while the
community CB goes on. `signOn()` gives the MOD password only to a listed handle and refuses the community
password for one; `readPass()` re-checks both ways every time, so a removal or a new role needs no new
pass. `MOD_ROOMS` is a map from room to the list of roles it takes (the Board room takes board and director, Ryan's call, because directors join board meetings) and `roomAllows()` is still the only place that decides. **`STRICT_ROOMS` are the rooms the administrator key does not open**: Executive Session (§82), the board role only, because an executive session is the board without staff; the page says `data-cb-strict` and the panel `data-call-strict`, and the tool refuses a page that disagrees with the server. Its light is the EXIT sign over the shut door, and it never flickers;
pages carry `data-cb-role` and `data-call-mods`, each a space-separated list of roles, and the roles a radio keeps in `love-cb` are
only the last ones `/cb/channel` told it, for the page to keep quiet by. **Never log `CB_MODS`**, and
never put a real role list in a test or a doc: who holds which role is not ours to publish.

**SINCE 2026-10-21 `CB_MODS` IS ONLY THE BREAK-GLASS LIST, AND ADMINISTRATORS KEEP EVERYBODY ELSE'S ROLES AT THE
DESK.** Ryan's ask and calls: the roles a small system provisioned in the Moderators' room (the desk's Roles part,
`desk.js`, `/cb/roles`) by administrators, with two names on the break-glass list in Netlify's settings so nobody can be
locked out. The stored roles are one blob, `roles`: each name's handle, roles, who changed it last and when, and nothing
more (Ryan's call). **`readMods()` reads `CB_MODS` first** (its entries `fixed`, never changed or outranked from the
desk) and adds the stored roles as this instance last loaded them; `loadMods()` reads them at most every
`MODS_FRESH` (30 seconds), and **every exported async function that takes `mods` loads them itself when it is not
handed them**, so a request, a webhook and the hourly run never read half a list; the sync ones that rely on an earlier
load are named in `tools/check-roles.py`. Fail closed both ways: an unreadable `CB_MODS` locks everything, as before;
stored roles that cannot be read leave the break-glass list alone (`partial`). **Board is given or taken only by
somebody on the board or the break-glass list** (`boardEditor`), because an administrator who could make themselves
board would walk into Executive Session; nobody is left without an administrator. **A pass of the other kind from the
list's is now an ordinary username's, never more, and carries `swap`** (`readPass`), the pass signing on again would
give, which `/cb/channel` hands the radio (`takeSwap` in `cb.js`), so a role given or taken needs no signing off;
it is never swapped while the list is `partial`. A new kind of role is still a change to `ROLES` and the code that reads
it. The friendly edits are **a history of who changed whose roles**, which is the record of moderation kept against a
person the street refuses, and **letting administrators give board "to save a step"**.

**THE BRASS TACKS BOARD IS THE CB'S TOO, AND IT IS WHAT THE CB DOES NOT FORGET.** Ryan, 2026-09-30:
posts meant to persist, read by anybody, posted only by a moderator with their username public on the
post; the author edits, any moderator takes a post down (`addBrass`, `editBrass`, `removeBrass`); a feed
of its own (`brass-feed.mjs`, `/brass-tacks.xml`); pictures allowed. **Markdown is read once, on the
server (`parseBrass`), into nodes**, and `brass.js` builds them with `textContent` while `brassHtml`
builds the feed's escaped HTML: one reader, no HTML from anything typed, and `tools/make-brass.py`
refuses `innerHTML` and its relatives in `brass.js`. The friendly edit is a Markdown library and
`innerHTML`, which is a script on a page everybody reads the day a moderator's pass is stolen. **A
picture goes through the radio's one redraw** (`window.loveRedraw`, cb.js), needs a description and the
moderator's yes for everybody recognisable in it, lives under `brass-img/` so the channel's sweep never
touches it, and is public, because the board is. **It is on The Feed as a second wire of this street** (`of: love` in `data/arrivals.json`), which the
Garden skips because it plants one bed per site; it may be empty (`empty_ok`) and its titles are typed
(`typed_titles`), so neither an empty board nor a `<` in a title stops the morning's board. It is street furniture beside the Pebble Board, a plate
in the street's orange, and its own world is a verdigris wall of brass plates (§90). Plural Mural's
chalkboard is the community's and forgets in a week; this is the moderators' and keeps.

**THE NOTICE IS ONE LINE FROM OUR MODERATORS, AND IT IS THE CB'S TOO.** Ryan's ask, 2026-10-23: a
public notice along the top of the street's front page, the Community Center, the forums and the
office's dashboard, put up, changed and taken down at the desk in the Moderators' room (`/cb/notice`,
the notice part of `lib.mjs`, `notice.js`, `notice.css`), with sparkle and a fanfare at MAX GLITTER.
**One blob, one notice**: its words, and who put it up or took it down last and when, which only the
desk is told (`shapeNotice` sends the pages the words). One line of the board's Markdown
(`cleanNotice`, `NOTICE_MAX`), built by `markdown.js`. **The first notice came with the site**
(`NOTICE_FIRST`, Ryan's words), served while the blob does not exist; any change at the desk writes
the blob, and taking one down writes that there is none, so the first never comes back by itself.
**It wears the CB's clothes in a shadow root of its own**, cb.css and notice.css, the seven `--cb-*`
and no colour of its own: on a page of its own the radio's scheme, or call.js's, or the device's (a
third copy of `schemeFor('auto')`, beside guest.js's), and inside the forums and the office theirs.
**Nothing on it moves below MAX.** At MAX stars twinkle along its rims and a fanfare plays once, on
arriving or when the dial is turned up, never in a hidden tab: herald's horns, notes out of their
bells and a wave of sparks along the rims. **The fanfare makes no sound**, because a notice arrives
unpressed. Nothing flashes, nothing turns, and nothing crosses a word: the banner clips what tries.
`tools/check-notice.py` holds all of it, and refuses a slot or a `loveNotice.into` anywhere
`privacy.html#notice` does not name. **The friendly edits are a sound with the fanfare, the sparkle
at Regular "so it is not bare", and a notice on every page**: the first breaks the street's oldest
promise, the second the dial, and the third is the floating thing that made every room narrow its
promises. **A visitor can put it away** (Ryan's call, the same day): `love-notice` in their own
browser holds the notice's id, `noticeId`, a hash of the words, so it stays away on every page until
a new notice goes up, changing a letter counts as new, and the key clears itself once its notice is
gone; the desk's drawings are previews and remember nothing. **The friendly edit is an id per press
of Put it up, or a time in the id**, which would bring a notice back for everybody when a moderator
puts the same words up again, and say when.

**I NEED A BODYMIND BREAK IS FURNITURE, AND IT ASKS BEFORE IT STOPS ANYTHING.** Helen Edgar's idea and Ryan's
answer, 2026-10-24, after Cavendish Space's button: a calm screen over any page (`bodymind-break.js`,
`bodymind-break.css`, §2's `--bbr-*`), a far treeline in mist, a few words, crisis lines and the Help page (Helen's
ask the same day), and a forest film and Monterey Bay Aquarium's live jelly cam on plates (the jellies Helen's ask, after which she called the break done: the friendly edit now is a third thing on it). The button is in the dial's box (`love.js` builds it, never on a
`data-cb="off"` page or in a frame), under Where you are on the radio, and as **Break** on the folded radio's bar and the
guest bar, where Bodymind break wrapped the row; `love.js` holds the loader and `cb.js` a copy for its own window. Its
own colours, not a room's and not the radio's theme, because a room's colours are what somebody is getting away
from. **Nothing on it moves at any setting, MAX GLITTER included; it keeps and sends nothing; the forest is a frame
apart** (`loveEmbed.frame(id, title, null, true)`: no enablejsapi, untracked, so a host's beacon never announces it);
**and it pauses nothing by itself**: it offers Pause it (`loveEmbed.quiet()`, and any `<audio>`/`<video>`), because
somebody may have the Latibulum's ocean waves on on purpose. The radio reads nothing aloud while it is up
(`breakUp()` in `speak`). `tools/make-bodymind-break.py` writes the film out of `data/bodymind-break.json` and holds
every one of those. **The friendly edits are a breathing circle or drifting leaves "so it is not so empty", pausing
the page automatically, the break in the room's colours, and a sentence saying what the forest will do for you**
(its description sells it for sleep and focus); Helen asked for a blank screen, and a break that decided for you
is not one.

**A LOW-STIMULATION MODE IS THE ONE TIME EVERY ROOM LOOKS ALIKE, AND ONLY BECAUSE THE VISITOR ASKED.** The proposal of
2026-10-24: "Feeling overwhelmed? Escape to a low-stimulation mode." Warm Light, Cool Dark, Plant Green and Red Light,
four buttons love.js puts in the dial's box (and the bodymind break offers), laid over every room's colours and the CB's
themes. **It does not reverse "do not tidy this site"; it is the dial's argument again**: the rooms stay unrelated
worlds, and a visitor who has had enough can hold all of them at once in a few quiet colours, the way the dial makes
loudness a thing the visitor holds. A mode is `html[data-low]`, kept under `love-low` and put on **before the first
paint by the snippet in every page's head** (so `make-csp.py` rehashes it; a mode that arrived after paint would flash a
room at the person who asked not to see one), and a mode is Gentle too, without touching `love-intensity`. love.css §3
does the rest: each mode's six colours (§2's `--lsm-*`, every pair in `check-contrast.py`), a generated remap pointing
every `--cb-*`, `--bbr-*`, `--fx-*`, `--bj-*` and `--pfx-*` at them so every shadow root follows with no script (Tasks'
tag and status colours left alone), and **the street's one cascade layer**, `low-stimulation`, whose `!important`
outranks every room's: ground, ink, link, line, no background picture, nothing moving, drawings and players through
`--low-filter`, **and a picture (`<img>`) never filtered**, the polaroid wall's promise, which `make-polaroids.py` held against the first build. `call.js` puts `data-low` on the
radio's host so cb.css puts the theme's drawing away; a familiar stands still. `tools/make-low-stimulation.py` writes
the remap and holds all of it. **The friendly edits are a mode as a room's own look "since it looks so calm", a mode
switched on by itself for a device that asks for reduced motion, a fifth mode that is a theme rather than an escape,
and fonts swapped in a mode** (the proposal was colours; that is Ryan's call). A room whose argument is a colour (the
Picture House's "nothing in this building is blue") is overridden too, by the visitor's choice, and `DECISIONS.md` has
that open.

**PLURAL MURAL'S CHALKBOARD IS THE CB'S, AND IT IS THE ONE PUBLIC THING THE CB HOLDS.** Helen Edgar's
idea, after the board at her floatation tank place. Ryan's call, 2026-09-25: **anybody reads it, only a CB
pass writes on it, and a note stays seven days**, thirty at most. Those two differences from the channel
are the whole of what the privacy page's section on it says, and the box you write in repeats the first
one above itself. So **do not "tidy" it into the channel's rules**, and do not widen it the other way: no
reply threads, no reactions, no count. `chalk.js` reads `love-cb` and never writes it; signing on is the
radio's job. It reads the board once on load and once after writing, with no polling, because a board is
not a channel. Every read carries `x-robots-tag: noindex`. **It stands on the pavement, not on the wall**,
which is why it may carry words when the wall may not; the notes are set in the room's plain face, never
a chalk hand, because they are other people's words. `updateChalk` shares `versioned()` with the channel.
Touch either one and run the fifteen-at-once test again against an atomic in-memory store, down both
etag paths. The invariant is **no write told it worked is missing**; with no etag on reads, some of the
fifteen may be told busy, and that was true of the channel before the board existed.

**THE PEBBLE BOWLS ARE THE CHALKBOARD'S RULES IN A ROOM, AND THE ROOMS ARE NAMED ONCE.** Helen
Edgar's idea, 2026-09-26, on a visit to the Hermitage: somewhere by the door to leave a penguin
pebble, and a basket of the host's own things to take. Ryan's calls: anybody sees what is in a
bowl, only a CB pass leaves one, a pebble stays a week, and the Hermitage and the Faery Yurt have
one each. **`PEBBLE_ROOMS` in `netlify/cb/lib.mjs` is the list**, and `make-pebbles.py` reads it and
refuses a page it does not name, so a bowl cannot be on a page the server refuses. The bowl is
**§4 layout with no colour**, like the job marker, and each room dresses it in its own section.
**The basket is filled by its host and nobody else**: an empty one says it is waiting, rather than
being filled by somebody guessing what the host likes. **Leaving a pebble is the only footprint**:
there is no "I was here", because a list of who came by is a visitor log and the Hermitage says in
its own copy that nothing in there will ask you to say hello. Nothing is counted, and a pebble is
given rather than traded, which is the pebbling cabinet's line. The board store is shared with the
chalkboard now (`readNotes`, `updateNotes`, `sweepNotes`), and **`netlify/cb/lib.test.mjs` is the
fifteen-at-once test, committed at last**, run first by `tools/check-all.sh`; it was broken on
purpose and caught a lost write in all four cases. In the Faery Yurt the bowl is the third thing this
repository has put into Helen's room, and the first she asked for. The fractal window's switch is the fourth,
and the second she asked for.

**PANDO CALRISSIAN'S COUNT IS THE TREE'S, AND IT COUNTS WATER, NEVER WATERERS.** Ryan,
2026-09-30, after the grow-a-tree game in our Discord's Collaborative Nonsense channels: a community
tree on the street (§84) that grows as it is watered, with a count that never expires. **That reversed
the Mission's "nothing is counted"**, and Ryan chose to narrow it rather than drop the number: the
Mission and Broadside No. 2 say *nobody* is counted now, and `tools/make-pando.py` refuses the old
sentence on either. What the narrowing keeps is the reason for the old rule. **The blob is a number
and a time and nothing else**: `waterTree` in `lib.mjs` writes exactly `{ water, wet }`, the tool
refuses it writing anything more, and `lib.test.mjs` checks the keys. So there is no per-person total,
no leaderboard, no streak, no milestone and no target, and the friendly edits are *thank whoever
watered last* and *we reached a thousand!*; both are refused. **Only a CB pass waters, and the ground
soaks for a minute after anybody's watering** (`PANDO_SOAK`), which is the whole tree's wait on
purpose: a per-person wait would need a record of who watered when. A name goes near the tree only
as a note on its fence, which is the chalkboard's store and week (`readFence`, `updateFence`). **The
grove is drawn in `pando.js` from the count alone**, a sucker per watering from one root, so everybody
sees the same grove, and nothing in it moves at any setting. The share card lifts the header's drawing
and never the live grove, which would go on showing an old number. **The light is a sun that has
already set**, the pink band above the earth's shadow catching the tops; its collisions are in §84.
It moved off the Directors' room's ground before it opened: same hex to the digit. **Catch-a-cat was
not this shape**, because it keeps who caught what and how many; it became Rescue A Cat, below, where
the only per-person list is in the rescuer's own browser.

**A USERNAME CAN BE CLAIMED, AND `readPass` IS ASYNC BECAUSE OF IT.** Ryan, 2026-09-30: Account (in Profile
until 2026-10-19) on the radio claims the handle you are on as, with a password of your own; no email; a recovery code shown
once; the moderators reset or delete one by name from a desk in the Moderators' room (`desk.js`,
`/cb/account/admin`), and **there was no list of everybody**, for moderators or anybody, until the
moderators' directory (2026-10-22, below). A claimed
username signs on with its own password and **the community password is refused for it**, the
`CB_MODS` mechanism; its pass is `cb2.acct.<handle>.<v>.<sig>`, signed with the community password (so
rotating it still signs everybody off) and **refused once the account's version moves**, which is how
a password change, a reset or a deletion signs every device off. So **every pass is checked against the
store**, and `readPass` and `signOn` are async: every CB function awaits them now, and a new one must.
An account is the username, a salted scrypt hash of the password and of the recovery code, when it was
claimed, a version and a lock (five wrong passwords, fifteen minutes), filed under `acctKey`, a plain
hash of the folded name. Deleting it deletes its pets. **A moderator can move onto a password of their own** (Ryan, the
same evening, starting with himself): signed on with the MOD password, Account claims the handle, the
MOD password is then refused for it, and its pass is `cb2.base`, signed with the MOD password. **The
account holds no role**: roles are still read off `CB_MODS` on every request, so taking somebody off
the list leaves an ordinary claimed username, and an unreadable list gives nobody the base.
`accountAnswer()` is the one place that decides which pass a claimed username gets. **The desk will
not reset or delete a moderator's username** (`isMod`), because a reset code would let one moderator
sign on as another with the other's roles, Executive Session included; a moderator with neither
password nor recovery code is taken off the list for a moment, reset as an ordinary username, and put
back. No shared password can be taken as a personal one (`ownPassword`). `tools/make-accounts.py` refuses a console call anywhere in `netlify/`,
anything but `accountDirectory` listing `acct/`, a desk action beyond its list, an account field beyond those,
an email address kept unsealed or read by anything but its owner's Account and the reset email, and
Account losing Delete my account or its second press. **A claimed username was marked CLAIMED on the
channel, like BASE** (Ryan, the same evening), and **the mark went on 2026-10-21**, when every username
became claimed: `make-accounts.py` refuses it in `cb.js`, `forum.js`, `profile.js` and `cb.css`. The
server still keeps `claimed` on a message, because Take off and Edit read it: `cb-transmit` sets it from
`who.account` and never from the request, and `shape()` keeps it off a BASE message. **Page scripts
read the pass once when they load**, so a room left open while somebody claims says *this username has
been signed off* on its next press, and a reload fixes it.

**THE MODERATORS' DESK LISTS EVERYBODY, AND CAN KICK, TIME OUT AND BAN.** Ryan's ask and calls,
2026-10-22, after moderators asked for it for safeguarding: what we could tell at a glance if we were
all in one room, the way Discord lists a server's members. **It reverses "there is no list of
everybody"** for the desk and nowhere else, and **numbers are fine there**, Ryan's call that the rule
against counting people is about the street's public surfaces (the Mission says so). `accountDirectory`
in `lib.mjs` is the one thing that lists `acct/`, for the desk's `directory` action and a base pass:
each name is its handle, whether it is a moderator's, whether it is barred now, and the rooms it is
seen in **from `whoSeen` with the moderator's pass**, so only Be seen here counts as seen and a quiet
room is never named; and the count of names and of names seen. A name opens its profile through
`loveRadioPeek`. **Kick** moves the account's version (`kickAccount`); **time out** and **ban** move it
and set `bar: { until }` (a time, or 0 until lifted), and **nothing else: not who, not why**. `readPass`
refuses every pass while a bar holds (`barredNow`), so a time out is the whole CB, reading included,
not Discord's read-only one, which would need every writing function to ask; `signOn` and
`recoverAccount` say a username is barred **only after the right password or code**, so the front desk
tells nobody else, and signing on after a time out takes the ended bar off. None of the three reaches a
moderator's username (`isMod`). `make-accounts.py` holds all of it. **The friendly edits are a "joined"
date beside each name** (the member-since ranking the profile cards refuse), **calling everybody not
seen "offline"** (they may be on the CB unseen), **a note of who banned whom and why** (a record of
moderation kept against a person, Ryan's call and `privacy.html#bars` first), and **the list or its
count anywhere but the desk**. `DECISIONS.md` has what is still open.

**THE STARTER PASSWORD IS RETIRED, EVERYBODY JOINS WITH AN INVITE, AND EVERY USERNAME IS CLAIMED.**
Ryan's brief and calls, 2026-10-21: invite codes in place of the starter password, made and deleted at the
desk in the Moderators' room (`/cb/invites`, `desk.js`); an invite's link, `join.html#invite=<code>`, opens
the joining page (`join.js`, `join.css`, the CB's clothes in a shadow root, `/cb/join`), where somebody
chooses a username and a password of their own and is on with a claimed username from their first minute;
**the starter password retired at once** (Ryan chose that over keeping it as a standing invite, knowing
stimpunks.org's join page needs an invite link before anybody new can get in), so `signOn` refuses it with
`STARTER_GONE`; **a pass from a shared password (`cb1`) is read only by `/cb/account`, for claiming**
(`readPass(…, { unclaimed: true })`), and the radio builds no radio for one, only `claimFirst()` in
`cb.js`, which claims and then brings the radio; `/cb/channel` and `/cb/here` answer such a pass 403
(`sharedPass`), not 401, so a tab still running the old `cb.js` says "no signal" rather than forgetting
the one pass that can still claim. **A moderator's username takes the moderators' password and no
invite** (`joinAccount`), the moderators' password signs nobody on (it answers `{ claim }` and the page
sends them to the joining page), and **joining fails closed** without a readable `CB_MODS`, so an invite
cannot claim a moderator's name. **An invite is its id, code, note, maker, when made, when it runs out,
how many uses it may have and how many it has had**: a use is reserved before the claim and given back
if the claim fails (`lib.test.mjs` races fifteen at a five-use invite), and **nothing records who joined
with which invite**. The friendly edits are "invited by" on a profile and a list of who used an invite;
each is a register of our community by sponsor. **AN EMAIL ADDRESS IS OPTIONAL AND IS FOR ONE THING**,
reversing "no email" (Ryan's choice of how, the same day: the team mailbox, over a mail service of its own
and over moderators sending codes by hand): sealed with the office's key (`recoveryBox`), offered only
while `emailOn()` (both office keys), shown to its owner and nobody else, moderators included, and used
only by `mailResetCode`, which puts a reset code in the office's outbox (`acct-outbox`, ahead of the
mailings) for the team mailbox's script to send; the code works an hour, one per username a quarter of an
hour, signs nobody off until used, the front desk answers the same whether or not the address matches,
the outbox forgets it once sent, and `officeMailIn` never files it with a contact. **The script needed no
change**: it sends whatever the outbox hands it and reports each id. What it keeps is its Sent folder,
which `privacy.html#recovery-email` says. `tools/make-accounts.py` holds all of it. **Every sentence
that said claim it if you like, the starter password or an unclaimed handle was rewritten**: the Community
Center's Getting started, the front desk, the guest bar, the CB guide, the privacy page, the Town Hall's
call panels (`make-town-hall.py`) and the desk. A new sentence about getting on the CB says invite.

**THE SHELTERS KNOW THEIR ANIMALS AND NOT THEIR PEOPLE, AND YOUR PETS ARE KEPT UNDER YOU.** Ryan, 2026-09-30: catch-a-cat renamed Rescue A Cat (§87), then adoption, a Pets tray in the CB,
a list of everybody ever adopted kept for good, and Rescue A Dog (§88), all the same evening. Animals
turn up at random, the first pass to press brings one in and names them, and **nothing records who
rescued**: the ones you rescued are in your own browser (`love-rescues`, which replaced a day-old
`love-cats` and moves it across). **An animal stays in the shelter until adopted** (Ryan's call,
reversing Claude's one-week rule); a full shelter leaves the next one outside. **Adopting is the one
place the street keeps something under a person**, and Ryan said he was fine with it: pets are filed
under `petKey`, a plain hash of the folded handle, **never keyed by the community password**, which
would lose everybody's pets the day it changed. **An unclaimed handle is not an account**, so anybody who signs
on with it sees its pets, and the tray says so; once claimed, only its password reaches them. **Pets can be shown off** (Ryan, 2026-09-30): a **sticker** is a copy of one of the sender's own
pets (`stickerOf`, found server-side, exactly kind, coat, marks and name, nothing pointing back) that
lives and dies with its message; **pressing a handle on the channel** shows that person's pets
(`/cb/pets/of`, a POST so no handle is in a URL) only if they switched **Show my pets on the CB** on,
which needs a claimed username; `shown/<pet key>` holds only when, and Forget Me and deleting the
account delete it. The answer never tells not-shown from unclaimed from nobody, and shown pets carry
no dates. `make-rescue.py` holds all of it. **A pet can be renamed once adopted** (Ryan, 2026-09-30, `renamePet`): in the person's pets and
on the forever list, which keeps the name it came in under as `first`, set once, so the rescuer's
naming is never written over; unnaming clears both. **Forget Me is under Account, asks twice, and
deletes the record**; the animals stay on the forever list, which never knew who adopted them.
**Adoption files in three places and loses nothing**: the shelter's conditional write picks the one
adopter and moves the animal to `leaving` with its pet key; `finishAdoptions` copies it into the pets
and the month's forever list, skipping ids already there, and only then clears it; `lib.test.mjs` stops
it halfway twice. **One mechanism, no shared clothes**: `shelter.js` reads `data-shelter` and
`data-prefix` off `<main>`, `animals.js` draws both kinds for the rooms and the tray, and each room
dresses the cards in its own section. `tools/make-rescue.py` refuses a rescuer or adopter anywhere an
answer can reach, a rarity, a look `animals.js` cannot draw, pets under a raw handle or the password, a
tray without Forget Me's second press, and any storage but `love-rescues`. **The cats are lit by eyeshine
at night and the dogs by a low winter sun on snow**, so the two rooms doing the same thing look nothing
alike; their collisions are in §87 and §88.

**RESCUE SMALL ANIMALS IS THE THIRD SHELTER, AND THE SPECIES IS IN THE COAT.** Ryan, 2026-09-30:
rabbits, rats, mice, hamsters, gerbils, guinea pigs, chinchillas, ferrets and hedgehogs, in one
shelter (§89), kind `small`, ids starting `s` (`ANIMAL_ID`). A coat is `species-colour`, three per
species, so every species is equally likely and no animal is drawn in a coat it does not come in; the
server gives every animal a `words.noun` (cat, dog, or the species) and **every sentence that used to
say cat or dog asks for the noun**. `make-rescue.py` reads coat keys with one hyphen, and its first
run read none of them and passed every drawing check without making one, so it now refuses a kind it
read fewer than two coats for. **The light is the day through the cracks between the floorboards,
seen only where it lands**, and every animal is drawn standing in a strip of it; its collisions are
in §89. Birds and reptiles may come later; `DECISIONS.md` has the open question.

**COUNT ME IN HAS A CHAIRLIFT, AND THE LIFT IS THE SAME SIZE AS THE STAIR.** Ryan, 2026-09-30, the
counting game (§86): a number to a step, never two in a row, a wrong number back to one and **nobody
named**, and the highest step kept, which is the first record on the street to beat and belongs to
nobody (Ryan's call, a reversal of part of the narrowed aim; the Mission names it). Then, the same
afternoon: *"Add a chairlift to the stairs so everyone can join."* **The lift asks the stair for the
next step instead of sending a number** (`climb('lift', …)`), so it needs no sums or typing and can never
send anybody back, and it counts exactly the same. `tools/make-stair.py` refuses the lift's button
wearing any class but the step's, the lift sending a number, the lift not being one of the two ways
up, and the vocabulary of blame, because **every counting bot announces who ruined it** and that is
the friendly edit here. **A number at or below the step is somebody behind, not somebody wrong**, so
a stale page costs nobody anything; only a number that skips ahead sends the stair back. The mark is
the fridge's (`fridgeMark`). Eau de nil over a dark gloss dado, because the pale greys were the
Doomscroll's, the Rabbit Hole's and the Mopery's; its collisions are in §86.

**THE FRIDGE OF SIGHS KEEPS SENTENCES FOR GOOD, AND THAT IS ONLY SIMPLE BECAUSE NO WORD IS ANYBODY'S.**
Ryan, 2026-09-30, the sentence builder from the same Discord channels (§85): a CB pass puts up one
word, nobody puts up two in a row, a stop finishes the sentence, and finished sentences are kept for
good. **A sentence with a handle on every word would be a list of names kept forever**; one with none
is the community's. So `putWord` is given a mark and never a handle, a finished sentence is exactly
`{ id, text, t }`, and **the mark is the one trace of a person**: an HMAC of the folded handle keyed by
the community password (`fridgeMark`), for the last word only, replaced by the next, never in any
answer. `tools/make-fridge.py` refuses each of those changing, a function answer carrying `last`, and
`fridge.js` knowing what a handle is. The friendly edits are *show who said each word, like Discord*
and *thank whoever finished it*. **The door files into the drawer copy-first**: `fileFridge` appends
to the month's drawer skipping ids already there, then takes those ids off the door, so a stop
between the two leaves a sentence in both for a moment and never in neither; `lib.test.mjs` stops one
halfway on purpose. **It was going to be a composing stick and is not**, because the Foundry sets
words in type; and **it is turquoise because Vital Plant Living's wall is turmeric**, the other
kitchen. Its light is the window behind you, reflected in the enamel; its collisions are in §85.

**THE FRACTAL WINDOW IS IN EVERY ROOM'S SIGN-OFF, AND IT CANNOT HEAR THE MUSIC.** Ryan, 2026-09-27:
a visualizer to switch on in rooms that play music, then in every room, following the Arcade: it runs
at every setting, starts only when pressed, and has its own speed control (Slow at Gentle, Steady
otherwise). **It is not synced to anything and cannot be**: a page may not read audio out of another
site's frame, and the band's host behind The Small Hours sends no `Access-Control-Allow-Origin`
(measured). The switch and the window both say so. Do not "finish" it with the IFrame Player API
(YouTube's own script, a `script-src` loosening) or with screen or microphone capture
(`make-csp.py` refuses any script of ours that asks for either, and the Repeater refuses the
microphone).

  · **the limit is the feature.** `fractal.js` lets no pixel change relative luminance faster than
    `RATE_L` or linear (R − G − B) faster than `RATE_E` per second, whatever the fractal wants, so a
    flash takes most of a second and WCAG 2.3.1 allows three. **Played without it, most rooms flash
    at Quick**, which `tools/fractal.test.mjs` shows every run: it counts flashes in the painted bytes
    with its own arithmetic, for every recipe, and fails an unlimited strobe to prove it still counts.
    Do not raise the rates to make Quick feel quicker, and do not move any drawing outside
    `Picture.frame`, where the limit is.
  · **one engine, a recipe per room.** `data/fractals.json` names the kind and which of the room's own
    `:root` hexes it is drawn in; `tools/fractals.py` writes it onto the switch and refuses a page with
    no entry, an unknown key, a colour love.css does not declare as a hex, and two rooms with the same
    picture. A new room needs a recipe before `make-signoff.py` will run. **The frame is furniture**
    (§2's `--fx-*`, a shadow root, the radio's precedent); **the picture is the room's**.
  · **nothing is fetched until the press**: love.js unhides the switch and injects `fractal.js` on the
    first click. It stores nothing. The canvas is `aria-hidden` and the window describes its own
    picture in words built from the recipe.
  · **Stay Frosty is `off`, with its reason in the data**: it says on its page that there is nothing
    to press and nothing moves. Flipping it is one line, and the flip goes in the changelog.
  · **the Faery Yurt has it because Helen said yes** (relayed by Ryan, 2026-09-27). It shipped `off`
    waiting for her, under the rule about her room; its recipe is drawn only in her declared colours.
    If she changes her mind, it goes back to `off` with her reason.

**THE COMMUNITY CENTER IS A WINDOW SEAT IN NORTH LIGHT, AND NOTHING IS LAID OVER ITS WORDS.** Ryan's call,
2026-10-23, after a request from our community for a softer look: biophilic, low-stimulation, a sense of
refuge. §51 is sage lime plaster with one big window facing north onto a hillside and a deep seat built into
the bay under it, drawn at the top of the page (the lede says it in words). **It replaced a painted
block hall in sun through a venetian blind**: hard diagonal bars behind every paragraph, a mortar grid,
every heading on a strip of black felt, orange stacking chairs. Stripes behind words strain some readers
however soft, so **the ground under every word is flat `--ctr-plaster` with no stripe, grid or texture**,
headings are the rounded face in the room's ink with a line of the cushion's wool under them, and the pale
ash desk, pigeonholes and map are each carried by their `--ctr-grain` edge. It leans on Terrapin Bright
Green's *14 Patterns of Biophilic Design* (Browning, Ryan and Clancy, 2014), credited in the room: a view of a
living hillside, prospect, refuge, diffuse light, lime, ash and wool. **North light means no sun lands
anywhere**, so **Covenstead is the collision** (one window, one warm patch on pink limewash): if a patch of
sun or a warm plaster ever appears here, it is this room that moves. The Foundry is the other north light
(grey iron, sky only), the Community Library the other sky in a window (many, high), the Garden the other
green daylight (through leaves onto you), the Latibulum the other refuge (a burrow, one lamp, brown); the
rest are in §51. **Nothing moves at any setting**, and the friendly edits are a sunbeam across the seat,
swaying grass at MAX, and the blinds put back "for character". **The job marker is a leaf from the plant on
the sill** and keeps its id, `community-letter`, because kept jobs and the board's stamps are filed under it.
**Varela Round sets the name and headings, in the case they are written in, and never a sentence; Radio
Canada carries what is read.** The house norms are ours,
point at [our covenant](https://stimpunks.org/covenant/) rather than restating it, and say out loud that
a handle proves nothing and BASE is the one mark that is checked.

**THE COMMUNITY CENTER IS WHERE PEOPLE GET STARTED, AND IT NAMES NO OTHER CHAT.** Ryan, 2026-10-18,
reversing the meeting hall of 2026-09-29: the community uses Stimpunks.World and its forums for everything,
so the room no longer mentions Stoat or Discord. It opens with **Getting started**, Ryan's draft: ask to
join on stimpunks.org's Community page, which gives you an **invite** (the starter password until
2026-10-21), open its link, choose a username and a password of your own on the joining page, keep the
recovery code, then quests. **The steps name the joining page's own labels and buttons**, and the note for
somebody still on the starter password names the radio's (Claim and the username), so a change to those
labels in `join.js` or `claimFirst` is a change to that list. **Other pages send people to `community-center.html#getting-started`**, never to a
meeting hall: the guest bar, the CB guide, the Sandbox's box and the Fishbowl's call panel. The channel is
still for what forgets in 48 hours and the forums for what needs longer. stoat.chat stays out of
`ORIGINS`: it sends `X-Frame-Options: SAMEORIGIN`.

**THE COMMUNITY SERVICE BOARD IS A ROOM FULL OF SENTENCES ABOUT OTHER ROOMS, SO EVERY ONE IS HELD.**
The sorter on the Community Center's wall has a slot for every room that takes something in: what
it takes, what it asks of you, how to send it. That is the "claim about one room living in another
room's copy" shape at its most concentrated — a board of other rooms' terms — so **each slot names,
in `holds`, the words on its room's published page that carry those terms**, and `make-community.py`
reads the page and refuses if they have gone. When a room changes what it asks for, change its slot
and its `holds` together; do not delete the `holds` to make the tool quiet. **It is a sorter and not
a noticeboard** because the Pebble Board is the street's cork. **Nothing on it sends anything and the
CB is not a route**: every slot uses a way its room already offers, listed once in `routes`. A new
room that takes submissions gets a slot here, with an anchor on its own heading for the slot to point
at and the words it promises in `holds`.

**THREE NUMBERS AND ONE CREDIT IN THAT ROOM WERE WRITTEN FROM MEMORY AND ALL FOUR WERE WRONG.** Two
ornament notes in `check-contrast.py` gave ratios that had not been measured (1.14 and 1.13; they are
1.21 and 1.19), a third said the desk edge was 5.27 when it measured 4.44 and failed, and the Radio
Canada designers typed into the room's credits named a studio that did not draw it. `pull-foundry.py`
and the pair list caught every one. **Measure before a number goes in a note, and read a designer off
the record.** The habit this site keeps attribution for applies to the numbers in its own tools as well.

**THE DOPAMINE DRESS-UP DEN IS HELEN EDGAR'S IDEA, AND NOBODY'S BODY IS DRAWN IN IT.** §52 is a
boutique for dopamine dressing (Ryan's brief from Helen's suggestion, 2026-09-25): a wooden valet stand
and rails round a lavender wall, and you mix an outfit on the stand in any print and any colours. **The
obvious build is a paper doll, and a doll is a body** (one size, one shape, one skin, one gender, handed
to everybody who walks in), so the clothes hang on a knob, two bars and a base, and whoever wears them is
you. `make-dressup.py` holds every cut and every print tile itself and refuses a garment it cannot draw,
a cut whose markup names a body part, and a look with somebody's name on it and not their words. **Do not
add a figure, a mannequin, a skin tone or a size.** Laughingstock's rule, in the room whose whole shape
invites breaking it. **Since 2026-10-14 a bodymind somebody drew at the Bodymind Booth next door can be walked in and
dressed** (Ryan's call); the Den still draws no body of its own, and the booth's paragraph below says why
that is the same rule rather than its reversal.

**THE LIGHT IS SUN TAKEN APART BY A CRYSTAL, and white light is why.** Most of it comes in white so every
cloth looks like itself: a room for choosing colours cannot have a coloured lamp, which is the Collection's
reason for daylight over Ryan's inks. The rest lands on the wall as small rainbows. That is dispersion,
and nobody else has it. **Vital Plant Living is the collision to watch**: the other saturated room you
build something in. It is a *section* with no light and no pattern; this is a *front view* of clothes
hung up, and pattern is the subject. If the clothes are ever drawn cut open, or the prints go flat, it has
become the kitchen with a wardrobe. Covenstead (one warm patch) and the Community Center (no sun at all,
sage plaster) are the other side-lit interiors; if the rainbows pool or fade to an even wash, or the wall
warms, it moves.
**Its prefix is `dd-` and its copy never says "the Den" alone**, which the tool refuses unless the words
link to the-den.html, because The Den is Graceland's.

**EVERY GARMENT SAYS HOW IT FEELS AND HOW IT COMES OFF, AND EVERY RAIL COMES IN ALL BLACK.** Both are
refusals in the tool. The first is our glossary's own definition (colours, textures and styles) and
Ryan's field guide: all his outerwear has a means of escape, and the knot on fisherman pants is not
everybody's, so every other bottom half does up without one. The second is our Dress Codes entry: a school
banned black clothing for mental health reasons, and **a room that told people colour was the cure would be
that dress code with a nicer name.** The friendly edits are "brighten up", "ditch the black" and "wear
colour to boost your mood". The sweep refuses brain-chemistry claims, sizes and bodies, gendered rails,
fashion rules, othering words (exotic, tribal, harem pants, costume) and rating, in our voice, with the
negation window. **Helen's look was relayed** and its witchy prints are the house's guess. She has the
final say, as she does on the yurt. Crocs are on the rail at Ryan's ask, and the liner notes say the name
is Crocs, Inc.'s. **It takes looks from our community, in words and never as a
photograph** (the stand has no body to put a photograph on), under *A look of your own*, with a slot on the
service board holding those terms. An arriving look is a `looks` entry with `whose`, `given` and `as_given`;
"somebody in our community" is a name. A garment it needs that no rail has gets drawn and hung up,
with its feel and fastening lines, rather than approximated.

**A PATTERN IS PARAMETERISED BY CUSTOM PROPERTIES ON THE `<pattern>` ELEMENT.** One pattern per slot;
the colourway rides on it as `--c1..--c6` (inks cycled) and `--g`/`--f1..--f5` (ground and figures), and
the tile's children inherit them, so `dressup.js` never writes a colour and love.css fills each slot with
`url(#dd-p-slot)`. A figure print uses `--f`, never `--c`, or a two-ink colourway draws its dots in the
ground colour and they vanish. **On a phone the stand is sticky at the top of the rails** (the wrapper is
`display: contents` so the drawing can stick for the whole fitting): the rails are longer than a phone is
tall, and a pick that changes a drawing three screens away is the Playhouse's unseen answer again.

**THE BODYMIND BOOTH (§113) IS WHERE BODIES ARE DRAWN, AND NOBODY IS HANDED ONE.** Ryan, 2026-10-14, from a
proposal written after somebody in our community hoped for characters to dress one day (the booth credits
"our community" and names nobody). The Den refused a paper doll because the house would be handing everybody
one body; the booth answers that objection rather than overruling it: **it opens on somebody drawn at random,
the page ships with nothing checked, and `make-bodymind.py` refuses the vocabulary of a starting body**
(normal, default, average, standard). **The friendly edit is a sensible default body** "so the booth does not
look random"; it is the doll again. The bodymind walks next door in the address, after the #; `try-on.js`
puts the Den's rails on it, and the Den still draws no body of its own.

  · **`avatar.js` IS THE ONLY THING THAT DRAWS AN AVATAR**, animals.js's rule for people: the booth, the Den,
    Profile, Who's online and stickers all call it. **Every garment is worked out from the body it is on**,
    shoulders, middle, hips, height and pose, so **a garment added to the Den's rails now needs a body drawing
    in `BODY_WEAR` in avatar.js, on its feet and sitting down**, or `tools/avatar.test.mjs` refuses it (it
    puts every garment on a body in every pose, varies every choice, and fails a NaN). The stand's cuts are
    read out of make-dressup.py itself, so the stand an avatar wears is the Den's stand.
  · **THREE FILES AGREE ABOUT EVERY CHOICE AND THE TOOL WRITES TWO OF THEM.** `data/bodymind.json` says what
    can be chosen; `make-bodymind.py` writes the lists between the `avatar:data` markers in avatar.js and the
    `avatar:keys` markers in `netlify/cb/lib.mjs`. **Never hand-edit between them.** `clean()` in avatar.js and
    `cleanLook()` in lib.mjs hold the same rules, and the test races them over thousands of random looks,
    good and bad, including `__proto__` and `constructor` keys, which an own-property check is what stops.
  · **WHAT YOU ALWAYS HAVE WITH YOU IS PART OF YOU, NOT CLOTHES.** Chairs, canes, hearing aids, masks, AAC
    devices and prosthetics are chosen in the booth, the tool refuses an aid that shares a key with a garment,
    and nothing put on next door takes one off. A cane, crutches and a walker are refused in a chair (both
    checkers) rather than drawn leaning on nothing.
  · **AN AVATAR IS A LIST OF CHOICES, NEVER A PICTURE.** No camera, no upload, no canvas: the tool refuses
    `getUserMedia`, a file input and `getContext` in booth.js and try-on.js. **The friendly edit is "upload a
    photo for your avatar"**, which brings the polaroid wall's consent rules, EXIF and withdrawal into the CB.
  · **NOTHING DESCRIBES A BODY FOR SOMEBODY ELSE.** Every drawing is aria-hidden; the booth reads your own
    choices back to you while you build (`words()`), and everywhere else an avatar is heard only as what its
    owner wrote. **The friendly edit is an alt text generated from the choices**; it is the polaroid wall's
    "we will not describe you in our words", broken by a machine.
  · **AVATARS ARE THE SECOND THING KEPT UNDER A PERSON**, under `petKey`, deleted by Forget me and by deleting
    the username. **Wearing one needs a claimed username**, and what is worn is copied into one blob,
    `avatars-worn`, so Who's online reads one blob rather than one per person; `withAvatars()` shows it beside
    a claimed name only, with the mark from the pass, and taking it off, deleting it, Forget me and deleting the
    username take it out of that blob *first*. `lib.test.mjs` races fifteen keeps and was broken on purpose.
  · **A PROFILE SHOWS THE WORN AVATAR, AND THE REST ONLY ON THE OWNER'S SAY.** Pressing a name on Who's
    online or a handle on the channel opens their profile, whose Avatars tab shows the worn avatar first and large
    (`/cb/avatars/of`, `shownAvatars()`), and every avatar in it opens in the radio's one lightbox
    (`avatarBox`, sharing `lboxMake` with pictures). The others need **Show my avatars on the CB**
    (`avshown/<pet key>`, claimed only, the pets' switch). **The friendly edit is to show them all**, because
    a profile looks bare with one; that publishes avatars people kept for themselves. The answer never says
    whether somebody has avatars they have not shown.
  · **EVERY AVATAR CARRIES ITS OWN GROUND**: a bodymind the booth's curtain (`--bmb-curtain`), the stand the
    Den's wall (`--dd-wall`), the way an animal is drawn on the ground it was found on. In the Den the bodymind
    is framed in the Den's ink, a picture hung on the wall rather than the wall changing colour.
  · **`dressup.js` STILL KEEPS AND SENDS NOTHING.** It exposes `window.loveDressUp` (what is on the rails, and a
    way to put a look back) and dispatches `love-dressed`; `try-on.js` is the file that keeps, and says so. Do
    not move the keeping into dressup.js to save a file: make-dressup.py's refusal of `fetch` there is the
    Den's promise.
  · **YOUR STRIP IS `strip.js`, IN THE BOOTH, THE DEN AND FANTASY FANCY DRESS, AND IT ONLY READS** (Ryan,
    2026-10-20, so somebody walking into either room on their own can bring back what they kept): one GET of
    `/cb/avatars` on a press, each room passing `window.loveStrip` its own parts and classes and saying what a
    frame does there. `make-bodymind.py` refuses a POST in it, because Fantasy Fancy Dress keeps nothing. Which
    avatar is being changed rides the address both ways through the curtain (`avatar=`), so Keep the changes
    in the Den still changes that one. **The way through to Fantasy Fancy Dress is a curtained doorway**, drawn
    by `make-dressup.py` in the Den's own inks inside the one link with its button, and `make-fancy-dress.py`
    refuses the door without both.
  · **THE LIGHT IS TWO STRIP LIGHTS A HAND'S WIDTH AWAY, AND NO FLASH**, because a booth's flash is the strobe.
    Every plate has its rims lit both sides; the collisions are in §113, and **All Together Now Farms** (the
    other two-light room, two colours on two sides of a field) and **the Den next door** are the ones to watch.

**CHIMERA OBSCURA (§120) MAKES ONE CREATURE OUT OF TWO ANIMALS, AND NOTHING IN IT CALLS AN AI.** Ryan's brief,
2026-10-18, after Norah asked for an otteraccoon, built on the chimeras on stimpunks.org's About page (Becky
Hicks's Bearmouse, Pandillo and Bunnybadger, which hang on its wall under CC BY-SA 4.0 with her yes). Not called
Randimals: our friends' company makes plush combined animals, and its characters' names are theirs.
  · **IT IS A PARTS BUILDER, BECAUSE THAT IS HOW THE ABOUT PAGE'S CHIMERAS ARE MADE**: one animal's body, with the
    head, ears, mouth, arms, feet, tail, back, colours and markings from it or another. `chimera.js` draws every chimera on
    the street, each part fitted to the body it lands on, from the shelf `tools/make-chimera-obscura.py` writes
    between its `chimera:data` markers out of `data/chimera-obscura.json` (never hand-edit them), and
    `tools/chimera.test.mjs` draws every pair with every part from either. **A new animal is one data entry with
    every part**; the tool refuses one missing a part, and the test refuses one that cannot be drawn with another.
    **A new kind of part** (a nose, an ear, a back, a marking) is a drawing in `chimera.js` and a word in the tool's
    lists, which refuse a kind with no drawing.
  · **ARMS AND FEET BECAME PARTS AFTER CHIMERAS WERE KEPT, SO THEY DEFAULT TO THE BODY'S** (`defaults_to` in the
    data). `clean()` and `cleanChimera()` let them be missing, `uncode()` reads an address without them, and
    `code()` leaves them out when they are the body's, so every chimera kept or linked before has the same address
    now. **A later part gets a `defaults_to` too**; one without it would make every kept chimera unreadable.
  · **THE FALLBACK IS REQUEST, THEN DRAW.** Ryan offered to exempt one page from design.html's "Nothing you do here
    is sent to an AI" and chose this instead: an animal the shelf lacks is asked for in the Sandbox's suggestion
    box (`sandbox.html#suggest-chimera`, which `suggest.js` opens filled in) and drawn in a later session, as code,
    for everybody. **The friendly edit is a live AI drawing "so nobody has to wait"**: it breaks that sentence and
    Stimpunks' art policy, which rules out AI-made finished illustrations and art in the style of an artist.
  · **A CHIMERA IS A LIST OF CHOICES, NEVER A PICTURE**, avatar.js's rule: `clean()` takes exactly its parts, each an
    animal on the shelf, and it travels in the address as `#chimera=` and the parts. **`chimera.js` builds elements
    with createElementNS** (`draw()`) and a string only at build time (`svg()`), so no page writes a chimera with
    innerHTML and the radio can show one; the tool refuses markup from a string in `chimera-obscura.js`.
  · **CHIMERAS ARE THE SIXTH THING KEPT UNDER A PERSON**, after pets, avatars, jobs, patches and profile cards, and
    only when somebody presses **Keep it in my Profile** in the room. The avatars' arrangement: `chimeras/<pet key>`
    holding each one's parts and name and **nothing about when** (the tool refuses a time in `keepChimera`), 24 at
    most, `cleanChimera()` in `lib.mjs` agreeing with `clean()` in `chimera.js` (the test races them), a sticker
    found by id among the sender's own (`chimeraSticker`), and **Show my chimeras on the CB**, claimed only, as
    `chshown/<pet key>`. Forget me and deleting the username delete both, and `make-chimera-obscura.py` refuses
    either losing that. On the radio a chimera carries its own ground, the table's white (`draw({ ground: true })`),
    so a dark theme never swallows its outline; its words are which animal gave which part, and its name is its
    maker's.
  · **SUGGESTED NAMES ARE CHECKED, EVERY ONE.** The body's animal, then the animal that gave the most other parts;
    the tool refuses a suggestion that is a Randimals character's name (their shop's list, in the data file) or
    carries a slur. **"Coon", the obvious end of "raccoon", is a racial slur**, so raccoon's end is "accoon" and
    otter plus raccoon is an otteraccoon. **Porkypine is a name Randimals and Stimpunks made together**, so it is
    never refused. Pandillo is the name Chelsea chose and is used for exactly her pairing. A typed name is its
    maker's.
  · **NOTHING HERE IS A FREAK SHOW, A QUIZ OR A COUNT.** Bodies made of unexpected parts were exhibited as freaks,
    and the people exhibited were mostly disabled, so the room's voice never calls a chimera a monster, a mutant, a
    mistake or wrong; it never says which animal you are or calls anything a spirit animal; and it never counts
    combinations, rarity or what anybody made. Each is a sweep with the negation window.
  · **THE LIGHT IS A CAMERA OBSCURA'S**: matte black walls and a lens in the roof throwing daylight onto a round
    white table, where the chimera is the picture. **The Editorial Room is the one to watch**: its light comes up
    through a table, flat and even, with no picture in it. If the table ever lights evenly to its rim, it has
    become the light table. Nothing moves until you press something; at MAX a new chimera comes into focus as a
    blur clearing, a filter and never a transform. Nothing makes a sound.

**A CHIMERA CAN FOLLOW YOU AS A FAMILIAR, AND IT RESTS ONLY WHERE THERE ARE NO WORDS.** A suggestion from our
community after Castle Crashers' animal orbs; Ryan's calls, 2026-10-19: loose in the room rather than on the radio,
still below MAX, crossing words only while moving, resting off text, no stats or count. **`familiar.js` is the one file
that keeps one and draws every familiar on a page**, yours and the visitors', in the browser under `love-familiar`
(parts, name, sayings, which kept chimera, whether it may move, where in the *window* it was put down and where it was
when you left the last page, never which room), and it sends nothing. Take it with you in Chimera Obscura and Take it
with me in Profile hand it over through `loveFamiliar.take()`, so `chimera-obscura.js` and `cb.js` still store
nothing; `love.js` loads it only when the key holds one, never in a frame, a window or a page that says
`data-cb="off"`. **It is placed in the page, not the window**, and rests only where `busy()` finds no text, control,
meaningful picture, player, shadow host (other familiars included) or `[data-familiar-avoid]`; `busy()` walks down from
the body and skips any part nowhere near, which took a check on the changelog from 122 ms to 10. **Everything that
moves one by itself asks `mayMove()`** (MAX GLITTER, or Let it move by itself, the candles' rule), a glide and a speech
bubble ask `mayGlide()` (never at Gentle), and they move with left and top. `make-chimera-obscura.py` refuses each
promise broken.

**OTHER PEOPLE'S FAMILIARS COME ON THE RADIO, AND ONLY BOTH WAYS.** Ryan, the same evening: "let other people see what
Chimeras are in the room". **Bring my familiar**, under Be seen here, claimed only and off until pressed, sends a copy
(parts, name, sayings) to `/cb/familiar`, kept in one blob, `familiars-out`, the worn avatar's arrangement;
`withFamiliars()` adds it to the people seen in a room on `/cb/here`'s answer, so a familiar is seen only where its
person is seen and only by people seen there. `cb.js` hands them to `loveFamiliar.visitors()` (in the page the radio
came from, when it is popped out) and leaves out your own handle; the copy follows the familiar (taking another changes
it, Send it home, Forget me and deleting the username take it in), and a folded radio sends nothing by itself.
`lib.test.mjs` races fifteen and was broken on purpose. **The friendly edits are a familiar on Who's online, and a
list of everybody's familiars**: the first widens Be seen here past the room, which is Ryan's call and
`privacy.html#chimeras` first.

**A CHIMERA HAS SAYINGS, ITS MAKER'S WORDS.** Up to `CHIMERA_SAYINGS` lines of `CHIMERA_SAYING_MAX` characters, written
on the bench beside its name or in Profile under *Its name and sayings*, kept with the chimera (`cleanChimeraSayings`),
shown under it in profiles, said when its familiar is pressed, and now and then in a speech bubble while it may move by
itself, only where the bubble covers no words, aria-hidden because the press says the same thing. A sticker carries
none. **The friendly edit is a stock of sayings the house writes for every chimera**; a familiar with none says nothing.
A moderator cannot clear one yet (`DECISIONS.md`).

**CHIMERA COZIES ARE A FAMILIAR'S OWN SPOT, AND EACH IS ITS ROOM'S.** `tools/make-cozies.py` draws a cozy between
`cozy` markers in each room listed in `data/cozies.json`, in that room's declared inks, refusing a colour of its own, a
word, a transform and two rooms alike: the job marker's rule. A cozy taller than a cushion (the Hermitage's egg chair,
in front of the campfire's screen, outlined in `--furrow` because every object on that rug is) gives its height and
where a familiar sits in it in the tool's `SHAPE` (written as `data-familiar-seat`), and a room that lays its things out
down the middle takes `"side": "center"`. A familiar in a cozy draws its light in (`is-seated`) so the cozy shows. `.cozy` in §4 is layout only, a box with a familiar's height
of clear air over the drawing; familiar.js sits a familiar in a free cozy in the window (`data-familiar-cozy`), one to a
cozy, and at MAX (or when let) one in the window goes to a free cozy that comes into it (`seekCozy`, asked after a scroll and on
every `recheck`). **The radio resizes nothing on the page**, so `recheck` also runs every few seconds while the tab is in
front, and `busy()` reads a size-less shadow host by the boxes inside it: that is what keeps a familiar out from under the
radio and lets one find a cozy the radio stopped covering. **The friendly edit is one cushion drawing for every room.** A new cozy is
an entry, a drawing in that room's own inks, and a pair of markers where the room has a little space.

**WALKING THROUGH THE DOOR IS DRAWN, NOT A VIEW TRANSITION.** At MAX (or when let), yours walks in from where it was in
the window when you left the last page, and visitors walk in from the window's edge and out to it. Cross-document view
transitions were the other way, and they would need the familiar on the new page before its first paint, which means a
render-blocking script on every page; the familiar is drawn by a script that loads after it.

**COMMUNITY CARE (§122) IS THE ROOM FOR ASKING, AND ITS CHANNEL IS THE ONLY WAY TO ASK IN IT.** Ryan's brief,
2026-10-22: our mutual aid and care room, whose channel on the CB is where people ask for mutual aid, peer support
and any other help, under Community on the chat page (`COMMUNITY` in `tools/make-chat.py`). Its page is built from
three pages of ours (Community Care, our glossary's Peer Support, Tuesday Ferguson's Tapping the Radical Roots of Peer
Support) by `tools/make-community-care.py` out of `data/community-care.json`, which checks every quotation against
the mirror word for word (the Town Hall's rule: when our page changes, re-copy, never loosen) and credits bell hooks
and Larry Mitchell with no work, because our page names none. **It refuses sorting the people who ask, debt, a means
test and a tally** in the room's own voice with the negation window, skipping blockquotes; **the page without its
paragraph saying the channel is not a crisis line**, before the first heading; and **a form or a box anywhere on the
page**: the friendly edit is a request form "so people do not have to sign on", which sends somebody's need to a
server nobody told them about. **The Foundation's grants are named and linked and promised nothing**: the tool holds
"scheduled grant rounds" and "urgent/emergency funding" against the mirror's grants page, and the room never says
whether they are open, which goes stale by the month. **The world is everybody's umbrellas tied into one roof, in the
rain**, after our page's umbrella and its photograph of umbrellas strung over a street: no sun, no colour laid on the
ground, every word on the dry paving under it. **The Truck Stop is the one to watch** (coloured canvas over a sunny
lot), and if the sun ever comes out in here it is this room that moves; the other collisions are in §122. The tool
draws the roof and refuses an umbrella untied, two alike touching and four in a rainbow's order, because the ties
are the room. Its lines about the rooms next door carry `holds`, the service board's rule.

**SHOW YOUR WORK (§124) IS A GARAGE WITH THE DOOR ROLLED UP, AND ITS BENCH HOLDS ONLY WHAT ITS MAKER TURNED OVER.**
Ryan's brief, 2026-10-23: a room led by our show your work philosophy and how we practise it, its channel under
Community on the chat page, used to show the work of folks in our community in public, with the forums' Show your
work as the longer-term, longer-form place for it. `tools/make-show-your-work.py` builds it out of
`data/show-your-work.json` from four pages of ours (Show Your Work, the Infodumplings post Show Your Work, One Card at
a Time, Default to Open, Scenius), every quotation checked against the mirror word for word; Austin Kleon's book is in
copyright, so its lines are short and the long passages stay on our page. **Three places, three lengths of time**: the
channel for today, the forum for the write-up and the conversation (how long each keeps things is read out of
`lib.mjs`'s `LIFE` and the category's `keep` in `data/forum.json`, never typed), and **the bench**, for as long as
its maker likes. **Turning a card over is the consent**, our post's line: every piece on the bench names whose it is
as they asked to be named, who said yes and on what day, where it lives and the state it is in, says whose words
describe it (`maker` or `ours`), and comes down the moment its maker asks, deleted, not hidden. **Nobody puts
anybody else's work up**, however much they love it, and that includes Helen's work and sites, which are hers to
turn over. The bench started with two unfinished things of our own, Cavendish Cards and this street, the way our
Infodumplings post put the deck on the table; a card's `checked` names words in the work's own repository under
`~/Documents/GitHub/`, read there when present, so a card cannot go on calling a deck a starter draft after it stops
being one. **A card can carry a photograph under the polaroid wall's rules** (Ryan's call, the same evening): its
`photo` names a record in `data/polaroids.json`, never a file, marked off Enid's wall with this page in `elsewhere`,
so `make-polaroids.py` walks the bench like every other page and holds it to consent, alt text in the maker's words,
no camera data, no filter and withdrawal as deletion; a photograph of a thing names the work as its `subject`, Isha
Snow's collages' precedent. The tool refuses a `photo` with no record, a record that does not name this page, and an
`<img>` that is no card's photograph. **Shown whole, never `object-fit: cover`**, which would be cropping somebody's
work. **The tool refuses a ranking, a
count, a pitch, calling anybody a genius, gifted or a savant, and marking** in the room's voice with the negation
window, skipping blockquotes and a maker's own words; **the friendly edits are a featured piece or a work of the month,
a heart under every card, and an upload box "so people can put their own work up"**, which is a stranger's file on a
page everybody reads with nobody having said yes. **The light is the day coming in level off the street through a
door as wide as the wall, from behind you**, running out before the back wall, so nothing on the page casts a shadow
you can see; **Dead Tired Society is the one to watch** (a corridor's wedge through a gap, nobody in it), and the
other collisions are in §124. Cabin Sketch, a typeface drawn as its own working drawing, sets the name and headings
and nothing at reading size. The way in for the bench is however people already talk to us, the service board's
route, and its slot holds the room's words.

**BREAKER BREAKER (§125) IS LIT BY MARKER LAMPS ALONE, AND THE LAMPS ARE THE LAW'S COLOURS, NOT OURS.** Ryan's brief,
2026-10-24: a room for CB radios, CB slang, CB history and trucking, with a rack of Dale Watson's trucking records and
Convoy, saying how the CB shaped our CB chat and why the word citizen matters, with NeuroTribes on amateur radio.
`tools/make-breaker-breaker.py` builds it out of `data/breaker-breaker.json`. **The world is night on the interstate
from the driver's seat of a rig in a convoy**, drawn in perspective with every lamp where the law puts it on a real
rig (three in a row at the middle as high as it goes, more at the corners and along the sides, amber at the front and
sides, red at the back), and **the tool refuses any other colour in the drawing**; every box on the page is outlined
in amber dots and left dark inside, the way a dressed-up trailer is outlined in chicken lights. **The Repeater is the
one to watch**, the street's other radio: there everything is a silhouette against a sky lit from below; here the sky
is as dark as the road and every shape is drawn dot to dot by its own lamps. If a glow ever comes up behind the
convoy, it is this room that moves; the other collisions are in §125. **Nothing blinks**: the tool refuses a keyframe,
an animation or a transition in §125, because a hazard flasher is the first thing a room of lamps would grow. **The
slang is Wikipedia's list in our words, and the phrases on it that name people unkindly are in `left_off` and refused
anywhere in the room**; the friendly edit is to fill the board out with the rest of the list. **The records are whole
albums played as lists, every song on the back of its sleeve with its own button** (the cabin behind the door marked
E's rule, so Follow and Catch up can find a song), each record's year, label and track lengths read off MusicBrainz,
never the upload's Released on line (the first record plays Red River's 2014 reissue of Koch's 1998), and every song
on the artist's own channel; `check-jukebox.py` knows the file by its `slang` key. **Not a line of any song is on the
page**, Convoy above all, a story told in CB talk: the tool refuses verse-shaped values and the song's best-known line
by pattern. **Every sentence about our CB is held** (`from_the_cb`'s `holds`, against `cb-guide.html`, `cb.js` and
`lib.mjs`), the Community Center's service-board rule: when the radio changes, the tool stops until this room says
what the radio now does. Silberman's passage is read on our Written Communication page and checked against it word
for word. **Convoy's second life in 2022, as the anthem of the Freedom Convoy, is left off the page** on purpose
(`_convoy_left_off` in the data): the room is about the record of 1975 and the craze round it, and Ryan's call the
same day was to leave it off. The friendly edit is a line about it "for completeness", which reverses that call. Racing Sans One sets the name and headings, Titillium Web everything read.

**COPING (§126) IS THE EYE OF THE STORM, AND THE STORM STAYS IN SIGHT.** Ryan's brief, 2026-10-24: a room that synthesizes
and summarizes three pages of our Regulation and Coping hub, Seeds of Cope, The Science of Cope and Cope Is Not an Insult,
its channel under Community on the chat page, and **Dead Tired Society out of Community** so the two do not compete (it is
still under its tags, Coping and Calm). `tools/make-coping.py` builds it out of `data/coping.json`. **The world is our
pages' own words**: seeds you can plant ahead of time or grab in a storm, and micro-worlds of safety inside hostile
terrain. Clear sky straight up, a wall of cloud all the way round, the dry floor of the eye in the sun, and the storm's
slate at both edges of a wide window, on the body's `::before` and never under a word, because coping is not denial: the
storm is still there. **Community Care is the one to watch**, the other weather room and next door: rain, no sun, one
roof of umbrellas. If rain ever falls on the floor of the eye, it is this room that moves; the rest are in §126. **The sun
is overhead, so it lands on the top edge of everything**: a gold line on every heading, slip and door, never a lit side.
**Every word that is not a quotation is our summary**, and every quotation, the cope map, the words to borrow, the doors'
group names and the works the science page names are held against the mirror word for word. The tool sweeps our words
for **grit, the sneer, misreading, anything clinical, a tally and toxic positivity**, skipping blockquotes, the
`cop-quoted` figures and anything in curly quotes, and refuses the page without its paragraph, before the first heading,
saying it is not clinical advice and not a crisis line, with our page's line about danger. **The doors are this room's
drawings, never the rooms'**: each stands alone on the floor of the eye in `--cop-*` inks, told apart by its form (the
campground board's rule), grouped under Seeds of Cope's own "If you're …" words, and each carries `holds`, words that
room's page still says. A new door is one data entry and, if it needs a new form, one drawing in `DOORS`. **Nothing in
the eye moves by itself at any setting, MAX GLITTER included**, and the tool refuses a keyframe, an animation or a
transition in §126. **The friendly edits are a breathing circle, a mood tracker or check-in that remembers you, a
streak, a "you've got this", and the doors painted in their rooms' colours**; the last brings colours nobody measured
here and makes the eye a swatch book of the street. The Science of Cope leans on Polyvagal Theory, which is disputed;
the room keeps it in our page's voice and `DECISIONS.md` has it open, because the correction is stimpunks.org's to make
first. Funnel Display sets the name and headings, Funnel Sans everything read: one family, because a room for steadying
yourself does not change its voice between the sign and the page.

**PETS (§127) IS THE FLOOR AT THE END OF THE DAY, AND THE LAMP IS NEVER SWITCHED ON.** Ryan's brief, 2026-10-24: a Pets
room, its channel under Community on the chat page (`COMMUNITY` in `tools/make-chat.py`), saying how important
co-regulating with pets is for many Autistic people and for humans in general, because mammalian co-regulation is a
thing, and linking every Pets room, presented as doors. `tools/make-pets.py` builds it out of `data/pets.json`. **The
world is co-regulation made into a room**: down on the floor with a dog and a cat asleep on the rug and a rabbit by the
skirting board, the window going dark, and nobody switching the lamp on, because getting up would mean moving somebody.
So the lamp is drawn, its switch lies on the floor, and **the tool refuses the lamp wearing the light's or the words'
inks**; the friendly edit is the lamp lit "so it is cosy", which makes this one more lamplit room, and every lamplit
room is the collision §127 lists. **The light is the sky's, going**, through one low window, soft, level, from the
left: a line of it down the window side of every heading, slip and flap, never on a top. **The doors are pet flaps**,
this room's drawings and never the rooms', told apart by form and sized for whoever uses them, and **every room tagged
`pets` in `data/room-tags.json` must have one**: a new pets room cannot build until it has a flap here. Each flap and
every sentence about your own animals carries `holds` on the pages it describes. **Most quotations are other
people's words our glossary quotes** (Trauma Geek, NDConnection, Helen Edgar, Julie Bjelland, Midwest FurFest, a video
on body doubling), each credited to who wrote it and said to be read on our page, and checked against the mirror word
for word; NDConnection's lines about mammals are Polyvagal Theory's, disputed, and kept in its voice as Coping keeps
its own. **The friendly edits are a sentence about what a pet does for your health (oxytocin, cortisol, blood
pressure, therapy), the best pets for Autistic people, a count of who has pets, and a wagging tail at MAX**; the tool
sweeps our words for the first three with the negation window and refuses a keyframe, an animation or a transition in
§127. Coiny sets the name and headings, Zen Maru Gothic everything read.

**PLURAL MURAL'S WALL TURNS OVER BY ITSELF AT MAX GLITTER AND NOWHERE ELSE, AND THE BRIEF ASKED FOR
MORE.** §54 is an end wall on the street that repaints itself because the street is Danny's (Ryan's
brief, 2026-09-25: murals that dissolve into the next every few minutes). A picture that changes
without being asked is ambient change, and Regular is motion on hover and focus only, so at Gentle
and Regular the wall holds still until somebody turns it over (a dissolve at Regular, a swap at
Gentle, because §3 takes the transition away) and **every mural is in words in the list under the
wall at every setting**. `mural.js` reads the dial on every tick, turns over every three minutes at
MAX only, never in a hidden tab, and **speaks only when somebody pressed something**. The hold is a
MAX control and stores nothing. **Do not wire the timer to Regular**; if Ryan wants the magic at the
default setting that is a change to the dial's own definition and his call, not a room's.

**THE MURALS ARE THE HOUSE'S PAINT, AND THE SHADOW IS THE ONE THING THAT STAYS.** `make-mural.py` holds
every drawing and refuses: a mural with no words for what it shows (the wall is aria-hidden), no
credit, **painted words under 4.5 against every colour they cross** (lettering is decoration in
WCAG's terms and the first thing anybody reads), two murals on one ground, an `<image>`, href or
url() in a drawing (a photograph of a real mural is a copy of its painter's work), a name with no
`as_given`, and the vocabulary of a vote (`like` narrowed to `likes`/`liked`, before its first run
this time). **Proposals come in words and the house paints them**, the Dress-Up Den's rule; nobody
real is painted on the wall, and the service board holds the room's terms. The light is a low sun
**behind you**, square on, so every mural is at full colour and the lamppost's shadow lies up the wall
over whichever is painted. **The Hermitage is the collision to watch** (low sun, warm wall) and its
shadows fall sideways; Laughingstock is lit from behind you onto a wall too and is one hard pool in a
dark cellar. **Every word is on the road, never on the wall.** A new mural is an entry in
`data/mural.json` and a drawing in `DRAW` with its `ground`, `letter` and `under`.

**NOW PLAYING IS A PAGE OF SENTENCES ABOUT OTHER ROOMS, AND THE ONE CLAIM MOST LIKELY TO CHANGE IS
READ, NEVER WRITTEN.** §53 is a screenprinted bill pasted round a poster column on the pavement beside
the Pebble Board (Ryan's brief, 2026-09-25): every room with something in it to press and play, and
what each one puts on first. `tools/make-now-playing.py` reads **each room's published page** and takes
the first facade, set channel or headset after the point `after` names, with its title and runtime as
that room prints them, so a room re-sorting its rack changes the poster on the next run and nothing in
`data/now-playing.json` has to be remembered. Our line about each room carries `holds`, the Community
Center's rule. **It finds the venues by looking**: a page with something to press that is not on the
bill stops the build, and so does a venue with nothing left to press. It must run **after** the room
generators, because it reads what they wrote. **A new shape of player** (anything that is not a
facade, a `data-runs` list item or a `dp-tune`) is invisible to it until `PLAYABLE` learns it, which
is why the check runs in both directions.

**BESIDE THE BOARD AND NOT ON IT.** The glass holds what people brought, and §21 says it is the second
body with different things behind glass and not a licence for a third; a generated listing is not a
pebble. The Community Center was the other candidate and its wall already carries the service board,
a board of sentences about other rooms; a second one would make the hall the street's directory. The
column is street furniture in the street's clothes, round where the others are square, pointed or
arched, and its hover goes **darker** because the street's pink on `--ink-3` is 2.76.

**NOTHING ON THE POSTER PLAYS, NOTHING IS COUNTED, AND THERE IS NO HEADLINER.** The tool refuses a
facade, frame or audio element on the page, and sweeps our own words for top billing and for a count,
with the negation window. A gig poster is exactly the object that prints one act biggest, and here that
ranks our own rooms on a sheet that belongs to all of them. **The order is the sitemap's walking order**
and there is no other. Where a room plays a whole list, the poster says what the room's button says
(runs until you stop it, starts somewhere random) and, where `then` names the room's own bill, what that
bill shows first. **It does not guess what a playlist opens on**; that is Club Chronic's lesson.

**INK OVERLAPS HERE, NOT PAPER, AND THERE IS NO BLACK.** Club Chronic is a hundred flyers pasted over
each other on a black wall, and the paper is its subject; the zine is black toner on white. This is one
sheet through two transparent screens, and `--np-both` is the multiply of `--np-red` and `--np-cobalt`
(measured: exactly `#241721`), which is the ink every word is in, because every word is printed on both.
The two inks alone carry no word. **The misregistered fringe is on display type only**; on a paragraph it
would be the Doomscroll's blackletter problem. If the sheet ever becomes several sheets, or its darkest
value becomes a black, it has collapsed into one of those two rooms.

**THE COMMUNITY LIBRARY IS THE SECOND LIBRARY ON THE STREET, AND THE MOPERY IS ITS NIGHT.** §55 is
our Library in this street's clothes, led by a celebration of the public library (Ryan's brief,
2026-09-25): a public reading room at eleven in the morning, windows set high over the shelving,
**and the sky in every one of them.** That is the whole separation and it is structural: every
other interior here is lit by something you cannot see out of -- candle, lamp, corridor, blind, one
window's patch, the floor -- and a library was built round its windows. The Mopery is a building
you are let into after everybody has gone home, blue-black stone the candles never reach, an
institution's books; this is opening hours, every wall lit, everybody's books, **and no flame
anywhere, the desk lamp not even drawn.** If a candle ever appears in §55 it has become the Mopery
at lunchtime, and it is this room that moves. Covenstead and the Community Center are the other
daylit interiors and both are lit from one side, one into a warm patch and one by a low north window with
a seat in it; here the windows are many and high and the light lands in no patch. **The only riot is the spines**, which carry no word.

**L-SPACE HAS NOTHING STRAIGHT IN IT AND NOTHING LIT, AND OOOK IS NOT A LIBRARY.** §56 is behind the
library, §57 behind that, and the map draws a room behind a room behind a room now (`make-map.py`'s
`behind_lot`). L-space is the shelving with enough weight in the middle that every line bends into
the well, deep violet, no floor or lamp, one cotton string for every link; **the Rabbit Hole is the
collapse to watch** (both are threads you keep following), and it is a vertical grey shaft daylit
from one end. **The obvious build of a Discworld room reached through L-space is the Library of
Unseen University, which is the Mopery with an ape in it**, so Oook is not in the Library at all:
it is the world the Librarian looks after the books of, a disc on four elephants on a turtle, in
his colours, rust and banana. If the rust ever dulls to brown or a candle appears, it has joined
The Den and the yurt. Nothing in any of the three moves at any setting.

**THE LIBRARIAN IS NOT DRAWN ANYWHERE ON THIS SITE, AND NEITHER IS ANY PICTURE OF HIM.** The
paintings are their painters' and our Library page's photographs carry NC and ND licences this
site's CC BY-SA cannot. **The friendly edit is a lovely orangutan in the corner**; the room says out
loud that he is up in the shelves and would rather you did not stare. The Disc is ours, and a world
on a turtle is older than Pratchett. **Discworld is a trade mark and the credit says so.**

**EVERY QUOTATION IN THOSE ROOMS WAS READ OFF OUR OWN LIBRARY PAGE, NOT OFF THE BOOK, AND EACH ONE
SAYS SO UNDER ITS WORDS.** Two have no source on that page at all (Octavia Butler's, John Waters')
and are there on its word, visibly. `make-library.py` writes them from `data/library.json` into
the rooms and the liner notes, and refuses a quotation over the cap in the data file (forty, for
Covenstead's reason rather than the Zibaldone's: the long Guards! Guards! passage stays on our page,
linked), one with no line about how it was checked, a lyric (**the Linda Lindas' line is on our
page and is refused here**), and an address on stimpunks.org without its trailing slash. **And it
refuses the graphic novel by id:** our Library page cites the 1989 novel and links Open Library's
record for the 2000 graphic adaptation (OL21372059W, a 122-page Gollancz edition with Briggs and
Higgins on it). That was found by asking the record rather than trusting the link, which is the
Hermitage's shelf lesson again; the novel is OL453735W, and stimpunks.org's page is that site's
to correct. **Ranganathan's five laws are Wikipedia's wording**, and the room says the 1931
printing was not checked. Broken on purpose first; all four caught.

**CAVENDISH COWORKING IS HENRY CAVENDISH'S HOUSE, AND EVERY DOOR IN IT IS SHUT.** §58 is a Georgian
house after his library in Bedford Square, green throughout, with a shut and unlocked mahogany door
onto each of our calls (Ryan's brief, 2026-09-25: the Operations and Editorial meetings are open to
the world, and many people refuse to use Discord). **It opened the same afternoon as a glass office
with every door propped wide, and Ryan corrected it: transparency does not mean an open floor plan and
always-open doors.** Openness here is that anybody can read what is behind each door and when, that
the rules apply to the people who run the house (Cavendish signed his own library's register), and
that nothing is locked. `make-coworking.py` refuses the open-plan vocabulary in the room's voice, with
the negation window, because the glass office is the friendly edit that will come back. **The blinds
are down and you can see through them**: the house's mahogany blinds were lined with green
transparent canvas (Jungnickel and McCormmach), which is the light. **Every fact about his houses is
from their *Cavendish: The Experimental Life*, ch. 11**, read 2026-09-25, and the drawing is ours and
not a picture of his house; do not add a detail from memory. **The Den is the collision**: panelled,
green in it, but its walls are brown, its green is the carpet and it has no daylight; here the walls
are green, the wood is only in the doors, and the light is day. The Jungle Room and the campgrounds
are the near-black greens; the Mopery is the other old-letters room and is stone after dark; the
Community Library has the sky in its windows. **If a door is ever drawn open, or the wall goes
near-black, it has lost its argument.** Caslon for display and text, because it is his century's.

**THE CALL IS IN THE ROOM BEHIND THE DOOR, AND PROTON HAS GONE.** Until 2026-09-28 each door was a
Proton Meet link; Proton cannot be framed (its `frame-ancestors` names only Proton's own apps), so the
call was off site. Each door opens a room of ours now, with a JaaS call in a window on the page, and
`make-coworking.py` refuses Proton on the page and on any room behind it. **Every line on a
door is our events page's, word for word**, re-read from the mirror on every build, in that page's
order; when the events page changes, re-copy the line, never loosen the check. It also refuses the
events page's own closing line (*open to Stimpunks Discord community members*), which was true until
this room and is the friendly edit that will arrive. **The Events door opens the room our recurring
events meet in**, confirmed by Ryan. **Since 2026-10-23 stimpunks.org's event pages name Stimpunks.World and
no longer Discord** (Ryan's ask): the recurring events point to the Events Room and the meetings to the
Operations and Editorial Rooms, still for community members, Ryan's call, though their calls take a guest
through the lobby. None of the lines this tool copies onto the doors changed. **The Hang Suites upstairs are
Ryan's words** (Cave, Campfire, Watering Hole, each with its norms), not the events page's, so they are
not re-read against it; the tool refuses a suite with hours (that is a meeting), one with no norms, and
the section without David Thornburg's name, because caves, campfires and watering holes are his.
`coworking.js` reads the visitor's clock and time zone to write the same hour underneath, and the tool
refuses it if it ever stores, sends or listens; the Central line is what a page with no script shows.

**LOOMING ROCKS IS FOR OUTDOOR MUSIC AND THE LIVE ROOM IS FOR INDOOR MUSIC, AND THEIR TOOLS HOLD
OPPOSITE RULES ON PURPOSE.** Ryan, 2026-09-25: Looming Rocks stopped being a Red Rocks room and
became the room for outdoor music in general, in the same message as ten Austin City Limits links.
Nine of those were the television series, **taped indoors**, and one was a festival set in Zilker
Park. So every act carries `at` and `outdoors`, and `make-looming.py` **refuses an act not played
outdoors**, because the room prints "every one of them played outdoors". The nine went to a new
room the same afternoon, and `make-live-room.py` **refuses a session not played indoors**.
make-jungle.py and make-den.py's runtime pair, arriving as a fact about where. **Do not make them
agree**, and check a description for where a set was played before it goes in either one: KEXP films
sessions away from its studio too.

**THE LIVE ROOM (§59) IS THE ONLY LIGHT ON THE STREET THAT ARRIVES DOUBLED.** You are in a dim
control room, over the desk, looking through studio glass: two panes set out of parallel, so
everything lit in the live room is drawn twice, the second time faint and lower. One red lamp over
the window, lit and steady, which does not flash at any setting (Club Chronic's rule). Each session
is a **channel strip**, with its name in Just Another Hand on a strip of masking tape and everything
else in B612. The hand never carries a sentence. The collisions are structural:
**The Small Hours** is a lit room seen through glass from the dark, but there you are outside in a
car park looking through one plate window you could walk through, and here you are inside a sealed
building with the glass doubled between two of its rooms. **The Den** is the street's other studio,
and you are in the room with the band: brown panelling and shag. **There is no wood and no carpet in
§59**; if a panel ever goes brown it has become The Den with a desk. **The Feed** is the other dark
room of machines, lit from inside each board through a mask, amber, in rows; nothing here gives off
light but the lamp, the strips stand in columns, and there is no amber. Nobody is drawn in the live
room, Laughingstock's rule.

**A STRIP SAYS NOTHING THE VIDEO'S OWN DESCRIPTION DOES NOT.** Every date, venue, player and
host on the desk was read off the video's description, and the first draft of the notes had to be
cut back: a band called a trio from memory when the upload lists no line-up, a duet in the
Hall of Fame episode that was really a separate clip, and three sentences about how a set
*sounded* from somebody who had not watched it. **Describe what the description shows**: who
played, who hosted, how many songs, what is cut. `make-live-room.py` also refuses a superlative
about the desk (the oldest, the longest), because it goes false the day another studio arrives.
**The Stevie Ray Vaughan upload is titled a full concert and has six songs cut**, and its strip
says so beside the runtime, because a runtime is only honest if you know what it is the runtime of.
**A studio with no sessions is refused**: a studio is named on the page in words until somebody sends a session from it.

**THE DESK IS A RACK UNDER THE GLASS, AND UNDER THE DESK IS THE STUDIOS' OWN MONTH, WHICH NOBODY CHOSE.**
Ryan, 2026-10-15. Every strip can go up on the glass (`rack.js`), each studio's desk is a `<details>` that
ships open, and the glass has nothing of its own on it, so it ships hidden. Under the desk,
`data/live-room-month.json`: the last month off each studio's own channel, videos and shorts, filled by
`tools/pull-live-month.py` on the morning timer (`tools/daily-live.sh`, the tenth script, `daily live room
refill`) and redrawn by `make-live-room.py --month`, which refuses a month channel that is not a studio on
the desk. **The indoors rule is the desk's**: nothing on a watch page says where a video was played, so the
month says out loud that nobody has checked, and **its strips carry no tape, because tape means a person
patched it in.** The friendly edits are tape on the month, which claims a choice nobody made, and keeping
only KEXP's "Full Performance" uploads: **Ryan's call, 2026-10-15, is every upload, songs and shorts
included**, so do not add a title gate to shorten KEXP's month. **The puller
reads a channel's list page past its first hundred when the morning's feed does not join on to what an
earlier morning covered**, because KEXP puts up more in three days than a feed carries. **And by
2026-10-15 YouTube served a channel's upload lists (UULF, UUSH) with their rows as `lockupViewModel` and
`shortsLockupViewModel` and their continuation as `continuationItemViewModel`**, while a PL playlist still
came as `playlistVideoRenderer` the same night (`pull-club.py --check` read it). A walk that knows only the
old shape reads nothing and calls the list empty, which is a short list and not an error anywhere, so
`row_id()` takes all three and a full first page with no token found is read as a list that stopped short.

**THE BROADSHEET BROADSIDE (§60) IS A PRESS WITH NO PRESS IN IT, AND THAT IS WHAT HOLDS IT OFF THE
FOUNDRY.** Ryan's brief, 2026-09-25: a broadsheet press printing broadsides like whysheet.press,
*Manifestos and Mementos Served Across Your Bow*, with an introduction to this street first. A
broadside is two things, a sheet posted up and the side of a warship, and the room is the second: a
tarred hull in the Nelson chequer seen from a boat at the waterline, with **a sheet of paper in every
open port where a gun would be**. The Foundry is a grey iron workshop whose subject is the type and
you stand at its bench; here no workshop is drawn at all, the press is inside the hull, and the
subject is what comes out of a port. **Now Playing** is the other public sheet and its two inks
overprint into a third; the broadside's two inks print flat on white and never overlap. **The
Doomscroll** calls itself a broadside in its own comments and is a grey roll that never ends; a
broadside has four edges and a back. **The light is the sea's**: sun thrown back up off the water in
broken dashes low on the hull, which no other room has. **No gun is drawn on that ship and nothing
is fired**, because a broadside going off is a flash, which is Club Chronic's rule on a gun deck, and
because a shot across the bow is the one that is meant to miss. If anybody "finishes" the ship with
cannon, it has become a room about firing at people.

**THE SHEET IS THE STIMPUNKS BROADSIDE METHOD, NOT A DESIGN OF OURS, AND ITS NUMBERS ARE NOT
PREFERENCES.** Read off stimpunks.org's print notes (`fieldguide/design/print/` in the mirror): ink on
white in both media, so the screen is a preview of the paper; borders rather than backgrounds for
anything that must survive the print dialog; two spot inks per sheet darkened until they clear on
white, **no two sheets sharing a pair**, because the pair is what tells sheets apart face down in a
stack; Atkinson Hyperlegible and a mono for the apparatus; **no display serif on the paper**, which is
why Bodoni Moda names the ship and never touches a sheet; the phone breakpoint under 700px, because
print media queries resolve against the page box. The page is whysheet.press's, 208 × 277 mm at
9 / 7 / 7, the largest that fits A4 and Letter. `make-broadside.py` refuses a sheet that is not two
sides, a claim line over a dozen words, more than one quotation a side, an ink under AA on white,
a shared pair, a sheet with no moment, **a link whose words are not its address** (a link on paper is
an underline that goes nowhere, so §129 also stops the street's print rule writing it out twice), and
**an order to the reader**, narrowly second person: a sheet says what we hold and never what you
must do. It writes the type credit out of `data/foundry-faces.json` and the licence out of the sheet's
record, so neither can be left off the paper.

**§129 LETS A COLOUR SURVIVE THE PRINT RESET IN EXACTLY ONE PLACE, AND check-print.py IS WHY THAT IS
SAFE.** The universal rule forces every word black because this street's grounds are dark and drop
out; a sheet's ground is already white paper, so its inks are restored at higher specificity with
`!important`, on the sheet and nowhere else. `check-print.py` renders any `room-broadside` page to a
real PDF and refuses anything but **two pages per sheet** in `data/broadside.json` and any ink not on
the sheet's own record. **Its first run found Chrome painting the page margins in its dark canvas,
`#121212`**, because the page says `color-scheme: dark` and the reset only reaches elements; §129 sets
the scheme light on paper for that page. Other dark rooms probably print the same margin, and nobody
has looked. ****It then printed two blank pages in Ryan's own browser while printing clean here**, because
he was signed on to the CB: the radio's host is a block at the foot of `<body>`, it sat on the
street's letter page, and moving from that page to the sheets' named page forces a break. A browser
extension's injected box is the same shape. So the whole document is on the sheets' page, every
child of `<body>` but `<main>` is hidden on paper, no side breaks *before* itself, `.cb-host` is
hidden on paper site-wide, and `check-print.py` prints the room a second time with a stray block at
each end of `<body>` (the old rules failed it at four pages). **A headless render has no extensions
and nobody signed in; test the document you did not write, too.** **The minimum height is two millimetres under the page box on purpose**, for the Stimpunks
method's 0.4mm-onto-a-third-page reason, and a side that overruns spills onto a third page rather than
clipping, which is what makes the page count the check. **The sheets are CC0 and the room is
CC BY-SA**, Ryan's call of 2026-09-25, and `LICENSE` says which is which. `make-broadside.py`
writes each licence's own sentence rather than one for all of them: CC0 asks for nothing, so its
line cannot say "keep this on it" the way BY-SA's must, and a licence the tool has no words for is
refused.

**THE DOOM SCOOP IS THE DOOMSCROLL'S NAME AND SUBJECT, AND IT MUST NEVER BE PAPER.** §61 is daily news,
usually bad (Ryan's brief, 2026-09-26): an ice cream parlour after closing, a tub in the lit dipping
cabinet for every morning of the last week. **The obvious way to dress a news room is newsprint, and
newsprint is the Doomscroll**, one door-name away. So there is no paper, no masthead, no column rule and
no blackletter anywhere in §61, and the argument is the opposite of that room's: the scroll has no end
and the scoop has a bottom. **The light is the cabinet's tube, which exists to keep things cold**, falling
straight down into the tubs; no pink (Pink Pony Club), no amber or split-flap (The Feed, the other room a
timer fills every morning), one tube rather than a lamp per case (the Collection Collection), and light
from above where the Healing Checkpoint's comes up out of water. **Every morning is a flavour and the
flavour is the weekday**, so a tub keeps its colour as it ages; how scraped out it is says its age and
nothing about how much is in it. Nothing moves at any setting.

**A WEEK AND THEN IT IS GONE, AND THE TOOL REFUSES AN ARCHIVE.** `pull-doom-scoop.py` drops the eighth
morning and `make-doom-scoop.py` refuses a scoop older than that. The friendly edit is a back-issues
rack; that turns the room into the scroll it exists to refuse. **An edition is five to five Mountain
time** because the laptop's 06:10 timer is 05:10 Mountain on Central time, and an edition must have
closed before the timer that fills it runs. Mountain is the street's clock (the CB's too). The pull
works out every scoop's morning again from its publication time on every run, so moving the cut moves
every row.

**NOBODY WATCHES THESE FIRST, AND THE ROOM SAYS SO.** It is the one list of facades on this street that
no person chose video by video. What the puller asks each new video's watch page, once, is
`playabilityStatus`, `playableInEmbed` and `lengthSeconds`: embedding off or age-gated is a **door**, live
or not out yet is `pending` and asked again, anything else not OK is `gone` and not drawn. **A scoop is an
id, a title, a channel, a time and a length**, and the tool refuses a description, a thumbnail or any
count of views, likes or subscribers: The Feed's refused summary and the pebbling cabinet's refused tally
in one rule. **The headlines are quoted as written**, capitals, emoji and all, and the sweep for ranking
words skips them, because they are the channels' words. Do not tidy a headline. **Every tub has
a screen of its own** (Ryan, 2026-09-29), `rack.js`'s pattern: any screen scoop in the tub plays
where it hangs or goes up there. A morning is not a list anybody can put on whole, so the screen
has **nothing of its own on it**: it ships `hidden` with `tabindex="-1"`, `rack.js` unhides it and
puts the keyboard back on it when a video comes off, and a tub with no screen scoops gets none. A
short goes up upright because its button carries `data-rack-shape="tall"`, which the screen wears
while it is on. The tubs behind the newest still ship shut, which is this room's lid and older than
the rack rule; the markup inside them is the same as the open one's, so the checkers measure it.

**A FEED CARRIES FIFTEEN AND SOME CHANNELS POST MORE THAN THAT IN A DAY.** `covered` records, per source,
the stretches the feeds were read all the way through, and a tub whose window a source's coverage does not
span says so on that source. Generated, never typed. **The sources are Ryan's**, in his groups and order;
a new one is an entry in `data/doom-scoop.json` with the `feed` for the exact list he linked (`UULF` for a
channel's /videos, `UUSH` for /shorts, a `PL` id for a playlist) and a `shape`, and its channel id read
off the channel's own page. Ground News and meidasnews.com publish no feed and one answers a machine
with a bot check, so they are doors on the counter; **do not scrape past a bot check.**

**THE TIMER IS `tools/daily-scoop.sh`, RUN BY THE SAME TASK AS `daily-arrivals.sh`, AND THEY STAY TWO
SCRIPTS** so one room's failing feed never leaves the other unset. It owns `data/doom-scoop.json`,
`the-doom-scoop.html` and `now-playing.html` (the poster reads what the cabinet puts on first, so it moves
every morning), and commits as `daily doom scoop edition`. The header drawing does not know what day it
is, so the share card does not change every morning. `check-jukebox.py` knows the file as `scoops`.

**THE THIRD AREA IS UNDER THE STREET, AND IT IS FOR WHAT NEEDS THINGS TO STAY THE SAME.** Arlesglad
Caverns (§62), Ryan's brief, 2026-09-26: a natural cavern down a lift by the stoop, with the stair
beside it. The test for placing anything there is Helen's test turned downward: *would this be just
as happy up on the street, with a clock and weather?* If yes, it is not a caverns room. The brief,
the per-room refusals and the open questions are in `DECISIONS.md`; read them before building a
room down there. **Buoyant Bodyminds waits on Helen**, Ryan's call: her floatation tank place is
where the Plural Mural chalkboard came from.

  · **the lift is drawn first and is the same size as the stair**, and the area's board is its
    panel: one button per room, top to bottom. An unlit button is a room not open yet, and it is
    the campgrounds' raising state in a lift: **dashed ring, words not dimmed, not a link.**
  · **the only light is the handrail**: one strip at hand height along the route, so the rock is lit
    in a band where the path goes. Every notice has the rail along its FOOT, never a bright edge
    down the left, which is the Outskirts' verge. **The only colour in the passage is the light**;
    the rooms off it bring their own. There is no brown in §62, which is what holds it off The
    Latibulum, and no daylight from the top, which is what holds it off The Rabbit Hole.
  · **down is a direction and not a verdict.** Nothing is down there because it was hidden or sent,
    which is the Outskirts' first-day mistake in darker clothes; *underground* never means *out of
    sight* in that area's copy.
  · **the name is Carlsbad Caverns plus ARLES plus glad**, and ARLES is a design METHOD, not a
    visual system, which is why an area can carry its name on a street whose first rule is that it
    has no design system. **No room is mapped onto the ladder's rungs**, and nothing borrows the look
    of an ARLES poster or deck. Carlsbad is a real national park, named and disclaimed.
  · **Stay Frosty's 68°F is the Park Service's**, off nps.gov/cave's weather page: the Big Room
    averages 56°F and moves with the seasons, the lowest point holds a constant 68°F. So Stay
    Frosty is at the BOTTOM. A first draft of the brief called 68 thermostat-warm and swapped in a
    Colorado cave's 54 before anybody read the page for the cave the name plays on: **when a number
    comes with a namesake, read the namesake's number.**
  · **Syne's figures are small old-style ones**, and B1 on a lift button read as B with a subscript,
    so every level number is in Rethink Sans and Syne sets names only. On the card too.
  · **the guild's class III names all three ways off the street** and did not grow a IV: down is
    not even along the street, so there is no distance to put it at. The sentence lives in
    `make-guild.py`, `data/quests.json`, the guild's house rules and `llms.txt`'s intro in
    `make-sitemap.py`, and every one of them had to change.
  · **on the map it is a smaller board at the foot of the model**, with a lift head on the stoop row
    that jumps down to it. The model flows in one column, so "beside the mat" could not hold at every
    width. `make-map.py` reads the levels off the lift panel like the pitches and turnings; a room
    that opens down there needs its level's `h3` to link and nothing else.

**GLOW GO GEE GAWS IS LEVEL B3, IN EVERY COLOUR GLOW COMES IN.** §67, Ryan's brief, 2026-09-26, and
his call the same day **reversing two of Claude's picks**: it was to glow orange only, to stay off
Looming Rocks' and the Lagoon's greens, with blue ruled out as Light It Up Blue. *"Light It Up Blue
shouldn't take blue away from us, and other rooms shouldn't limit what this room does."* So §67 is
not measured against other rooms by hue, and **the Lightbulb Picture House's no-blue rule is that
room's own argument, not a street-wide one**. What keeps §67 its own world is **the kind of light**:
every toy starts dark, is charged on a press, and gives the light back until it has none, which no
other room has. `tools/make-glow.py` refuses a green that is not the longest fade and a red or
orange that is not among the shortest (checked; the middle order is the room's and it says so),
a colour missing from the shelves, a glow stick with a fade (it is chemistry, bent once), a
keyframe in §67, and selling. Its break test found `\b\$\d` can never match, because `$` is not a
word character; a price is its own pattern now. **At Gentle a toy stays lit for its time and
darkens in one step**, because §3 takes transitions away and an instant fade would be a blackout.

**BIG STEEP FERMENTABLES IS LEVEL B1, AND EVERY RULE IN IT IS ABOUT THE PEOPLE WHO DO NOT DRINK.**
§66, Ryan's brief, 2026-09-26 ("try our house styles"), built by `tools/make-big-steep.py` out of
`data/big-steep.json`. **Every pour says how strong it is before the pour** (the runtime rule for a
drink), and **every house style comes as two pours with the alcohol-free one FIRST and the SAME
SIZE**, Dead Tired Society's passing rule: the tool refuses a style whose first pour has alcohol in
it, and §66 styles the two boxes identically on purpose. **Do not make the alcohol-free box smaller,
paler or second.** Alcohol-free means at most 0.05% for a dealcoholised beer or wine, and the room
says a faint trace can stay; **kombucha is never quite zero**, so its fermented pour gives a ceiling
and says it varies, and its alcohol-free pour is the tea unfermented. The tool refuses pressure
(rounds, one more, drinking games, being drunk as the fun part), **"mocktail" and "virgin"**, which
make an alcohol-free drink an imitation, health claims (kombucha is sold on its gut), a count of
drinks, and **wood**: the vessels are glass and steel on bare rock, which keeps it off the brown
rooms and a row of oak barrels. The light comes **through the drinks** from lamps behind the racks;
the Chappell's stained glass is the collision, and that is fixed colour in a window of a building.
**Nothing moves**: the first friendly edit to a brewery is a glass filling up. Its break test found
the tool crashing on a missing strength rather than refusing it; it refuses on the data first now.
**Its cellar videos are somebody else's cellars and say so**, Ryan's brief, 2026-09-27 ("not an exact
fit, but they'll do"): barrels, wood and fire, none of which is in §66, so the room presents them as
other places to leave on. Runtimes are MEASURED (the speakeasy's title says 4 hours and its
description 5; it runs 4:46:57). **The speakeasy plays into a YouTube mix (`list=RD` + its own id)**,
Ryan's call after it was first dropped: a list YouTube builds on the fly, so the label gives the
first video's runtime, then says the mix has none and is unchecked. `make-big-steep.py` refuses a mix
that is not RD plus the video's own id, because a label describing the wrong list is the broken
thing. Their descriptions sell them for sleep and focus; none of that is copied. **Since 2026-10-19
they are a rack under the screen in the rock** (`rack.js`, Ryan's ask): a dark pane in the racks'
steel with nothing of its own on it, shipped hidden, never lit, because the room's light comes only
through the drinks. A video whose channel switches embedding off is a door (`how: "link"` with a
`door_why`), and the tool refuses a door with a mix.

**MYCELIUM MUNCHIES IS LEVEL B2, A MUSHROOM FARM WITH A RESTAURANT AT THE END OF IT.** §65, Ryan's
brief, 2026-09-26, built by `tools/make-mycelium.py` out of `data/mycelium.json`. **Vital Plant
Living is the collision**: that kitchen is a section with no light, everything touching, and you
build your own; this is seen straight on across a pass, lit only by **heat lamps**, red and
electric, and the kitchen composes every dish. There is no wood in §65 (the brown rooms), and the
lamps are red because heat lamps are. (They were first kept red to leave orange to Glow Go Gee Gaws,
the level below; Ryan's call gave that room every glow colour the same day.)

  · **nothing here is a field guide**, the most dangerous friendly edit on the street: a sentence
    about how a mushroom looks beside one about where it grows is one step from somebody eating
    what they found. Every look is written as it is on this farm's shelves, every mushroom was
    grown here, and the tool refuses the vocabulary of foraging and identification.
  · **nothing is named in Latin** (a list of genera plus the binomial shape) and **nothing is a
    supplement**: lion's mane is sold as a brain booster, which here is the cure framing on a
    plate, so brains, focus, memory, nerves, immunity, energy and medicine are refused, and so is
    "magic". The wood wide web is not stated as fact.
  · **everything on a plate was grown here and every crop reaches a plate**; the three house
    specialities are exactly the brief's; **every dish says what is in it**, the runtime rule for a
    kitchen; nothing is served raw.
  · **Derek Sarno's rack is make-club.py's pair and the Doom Scoop's quoting rule**, Ryan's brief,
    2026-09-26: his whole *Mushroom Masterclass* playlist on one press with no runtime, and the most
    recent videos in it, each with one, **chosen by UPLOAD DATE and not playlist position**, because
    the playlist is not in date order (its first thirty entries ran 2018 to 2023). The rack drifts by
    design and prints the date it was read; re-read with `yt-dlp --flat-playlist -J` and each id's
    `upload_date`, `playable_in_embed`, `age_limit` and `channel_id`. **His titles are quoted as
    written and the sweeps skip them**; one title in the playlist says "brain boosting" and is from
    2021, not in the rack. **North Spore is the one shop linked from the room**, plain, no query
    string, and its guide is a growing guide specifically: their site has a foraging section, and
    the room links around it.
  · **the rack shipped without `love-embed.js` on the page**, so every button pressed and did
    nothing, and no checker saw it: the markup was perfect. `make-now-playing.py`, which already
    reads every page for things to press, now refuses a real facade tag on a page that does not
    load the script. Its first run matched `&lt;div class="facade"&gt;` in the changelog's prose
    and was narrowed to real tags.
  · **the one quotation is ours**, from *The Mycelial Worldview Is Punk*, checked against the
    mirror word for word when the mirror is present. Its first run refused "scored", the cooking
    verb, and the pattern was narrowed rather than the word excepted.

**STAY FROSTY IS THE BOTTOM OF THE CAVERNS AND THE ROOM WHERE NOTHING CHANGES.** §63, level B5,
the first room open down there. A quiet place to chill, literally: **chill as in calm, not cold**,
at the Park Service's 68°F for Carlsbad's lowest point, which lives once in `data/stay-frosty.json`
and is written by `tools/make-stay-frosty.py` into the room AND onto its plate on the caverns' lift
panel. **Do not type that number anywhere**; put a `frosty:temp` or `frosty:short` marker pair there
instead, and the tool refuses any other degree on the room's page.

  · **the light is reflected, in points.** Every other rest room on this street is lit by a flame,
    by a spring under the floor or by a corridor's wedge. Nothing here emits anything: the rail is
    up the slope and what reaches the bottom is its reflection in every bead of damp. **The only
    warm value in the room is `var(--cav-rail)`**, used only where the rail's own light would land,
    the glints and the links. If a glow ever gathers anywhere in §63 it has become a room with a
    lamp in it. It is not the passage above either: that is a warm-grey BAND, this is cool wet
    POINTS.
  · **it is not for anything, and the friendly edit is a kind one.** Every cool quiet room on the
    internet says what the cold will do for you. The tool sweeps the room with the checkpoint's
    negation window for rest as an investment, **cold as a treatment** (plunges, ice baths, cryo,
    biohacking, resets, boosts, calming your nervous system) and medical claims. Do not add a line
    about what the room does for a body.
  · **nothing to press, nothing moves, nothing makes a sound, no clock**, and all four are sentences
    on the page, so the tool refuses a button (the guild's marker cut out first), a player, a frame,
    a timer, a script of its own, and any `animation`, `transition`, `@keyframes` or `transform` in
    its section of `love.css`. **The CB stays upstairs** with `data-cb="off"`, the Healing
    Checkpoint's mechanism, because a squelch is a sound. The room counts and keeps nothing, scoped
    to the room, because the dial remembers its setting street-wide.
  · **one face, Geologica, for every word**: a room of one temperature does not change its voice
    between the sign and the page, and its figures are full-height, which matters in the one room
    built round a number.

**STAY BREEZY IS THE ROOM BEHIND STAY FROSTY, AND IT IS ITS OPPOSITE ON PURPOSE.** §64, Ryan's,
2026-09-26, in his own words on the page: *"Even in a 68°F room, I need a fan blowing on me."* A
hall full of fans, synthesised in the browser by `stay-breezy.js` out of `data/stay-breezy.json`,
built by `tools/make-stay-breezy.py`. **A subroom shares nothing with its parent, and here that runs
backwards**: Frosty is dark, cool, wet, lit by reflections in points, with nothing to press and no
sound; Breezy is pale, warm, dry, lit by a lamp under every ceiling fan, and made of controls. If
§64 ever goes dark or cool it has become Frosty with a fan in it; if §63 ever hums, the reverse.
The number in Ryan's quotation is a `frosty:f` marker filled by `make-stay-frosty.py`.

  · **every fan says what it feels like and what it sounds like, in words, before you switch it
    on.** A fan has no runtime to give, like a live cam, so its sound is what it says instead. The
    tool refuses a fan without both sentences, and two fans that would sound the same.
  · **the lamp is below the blades, which is an access rule.** A lamp above turning blades throws a
    flickering shadow, Club Chronic's strobe through a light fitting. The tool reads the drawings'
    coordinates and refuses a ceiling fan whose lamp is not under its hub, and refuses any keyframe
    in §64 that animates a light or a colour.
  · **Gentle stops the blades and keeps the fan.** The sound is what the visitor switched on; the
    turn is decoration, and §3's reset stops it. The words on each card are identical at every
    setting. The blades turn inside each fan's `<svg>` about a hub the tool writes on the group.
  · **the hall has a ceiling, and it is shared**: `MAX_GAIN` is refused above 0.2 (the Repeater's),
    and the running fans divide it rather than add to it, so more fans make the hall fuller and
    never louder, which is a sentence on the page. **A fan keeps going in another tab**, like a fan.
  · **no fan is named for who made it**, and **none is for anything**: the tool refuses a short
    list of makers and the vocabulary of sleep, focus and treatment. *You do not need a reason to
    love a fan* is the room's line; the friendly edit is "great for sleep".
  · **it keeps one thing, your usual, and never plays it by itself.** Ryan's call, 2026-09-26:
    under `love-breezy` in the visitor's own browser, the speed on each fan, the fan on the table
    and the fans last switched on. Loading the page puts the speeds and the table back SILENTLY;
    the sound only comes from *Switch on my usual*, whose line names every fan and speed before the
    press. The tool refuses any other key, any other storage, and a `privacy.html` that does not
    list `love-breezy`. **Do not make the usual start on load**: that is autoplay with a nicer
    name, on the street whose oldest promise is that nothing plays until you press.
  · **the room of your own has a door**: switching anything on in there switches the hall's fans
    off, and a hall fan switches your room's off, and both say so. The table's fan is chosen from
    the floor's table fans and copies that fan's own tile, so the two cannot describe it
    differently.

**THE 404 IS A WORLD WITH NO ADDRESS, AND THREE TOOLS NAME IT RATHER THAN SKIP IT.** `404.html`
(§39) is fog: lit from every side at once, so nothing casts a shadow and distance is carried by
paleness alone — which is what holds it off the Guild, lit from nowhere with no depth. Netlify
serves it at any URL nobody built, so it has **no canonical, no Open Graph, `noindex`, and every
path starts with a slash** — a relative `love.css` at `/a/b/c` would be answered by this page and
refused by nosniff. `make-og.py`, `make-sitemap.py` and `make-guild.py` exempt it **by name**, so
every other page still refuses to ship without a card, a sitemap entry and a marker. **The render
probes load from `file://`, where `/love.css` is the root of the disk**, so they rewrite
root-absolute paths against the repository; without that they measured an unstyled page, and an
unstyled page passes everything. **And Netlify folds capitals and a trailing space back to the
right page** while the dev server, on a case-insensitive disk, cannot show you either way — the
first draft of that page said a capital would land you there. Measure against the live host.

**THE FOCUS RING IS A ROOM DECISION, LIKE THE LINK COLOUR.** §2's yellow ring was chosen for a
near-black street, and on every pale ground it was nearly invisible — 1.01 on the Guild's manila.
Nothing caught it for the reason nothing caught the Doomscroll's links: a colour nobody decided
has no pair to hold. **So every room with a pale ground, or a pale card or dark panel inside it,
sets `outline-color` in its own section, in an ink it already uses**, and the dial keeps its
yellow with `!important` because it is always a dark box. **Do not make one street-wide ring to
fix a pale room**; that is the harmonising instinct wearing an accessibility badge.
`check-focus.py` is the only thing that sees this — a ring is neither a text pair nor a text
node — and it measures a gradient at every stop, so it can be stricter than the page but never
kinder. **A new room or a new pale card in an old room runs it.**

**EVERY PAGE SIGNS OFF, AND THE SIGN-OFF IS NOT THE PAVEMENT.** Ryan asked, 2026-09-23, for the
front page's footer on every page and a way back to the top. The pavement stays the street's: the
Guild's section already records that a shared footer "would be the one piece of the street's own
look reaching into a world". What every page gets instead is `.signoff` — §4 furniture that is
**layout and nothing else, no colour, no face, no ground**, so it arrives in each room's own ink
and link colour the way a job marker does. The links live once, in `tools/signoff.py`; the front
page's pavement takes the same list between markers, so the two cannot disagree. **Back to top is
`href="#top"` with `<body id="top">`**, so the jump also moves the keyboard's starting point; no
smooth scroll, because the dial exists so nothing moves a view unasked. **A room whose floor is not
the ground its links were chosen for dresses the line in its own section** — the Zibaldone's links
are rubric for paper and it lies on a dark desk, 1.07 before it was given the paper's own colours.
It does not print. **Do not style `.signoff` in §4 to make it look nicer**; the moment it has a
colour of its own it is the pavement again.

**THE MACHINE-READABLE FILES ARE CLAIMS, SO THEY ARE GENERATED FROM WHAT THEY DESCRIBE.** Each
page's JSON-LD is built by `tools/structured.py` from that page's own title, description and
canonical — structured data is what an agent quotes without checking, and it must never say what
the page does not. The licence sits on the WebSite node and not on each page, because the
photographs are excluded from it. `make-agent-files.py` computes the skill's sha256 from the file
and refuses a catalogue entry for a file that is not there. **Only IANA-registered relations** go in
the catalogue and the Link header: `api-catalog` is registered, `sitemap`, `security` and
`agent-skills` are not, and Star Stuff published a correction for using two of them. **The
SKILL.md is prose about this site and obeys the site's rules** — `check-counts.py` reads it, so it
cannot state how many rooms there are either. Edit it, then re-run `make-agent-files.py`, or the
published digest is a lie.

**AN IMAGE IS CONVERTED ONLY WHEN THE MEASUREMENT SAYS SO, AND SOME STAY JPEG ON PURPOSE.**
`make-webp.py` finds, per file, the lowest WebP quality whose luminance SSIM against the source
reaches 0.98, and swaps only if that saves at least 10%. Most of Doré's and Tenniel's engravings
stayed JPEG: fine hatching is what lossy formats are worst at, and at matching fidelity WebP was no
smaller. `data/webp.json` records every decision with its numbers, so **do not "finish the job" by
converting the kept ones** — that would be a bigger or a softer file, chosen by format rather than
by result. **SSIM is on luminance, and the first run is why:** measured in RGB, WebP's half-resolution
colour held small saturated thumbnails under 0.98 even at quality 100, the tool concluded they
could not be converted, and the one real waste on the street — thumbnails stored at 1280px and
drawn at 170 — survived it. That run deleted JPEGs under the wrong rule and was reverted. **WebP and
not AVIF** because AVIF needs a `<picture>` round every image, which changes the markup rooms style
— the Pebble Board's 4:3 fix depends on the image being the play button's direct child. The share
cards and icons stay PNG: unfurlers and iOS do not reliably read anything else.

**This applies hardest to the things nobody looks at.** `og/` holds a share card per page and
there is **a card design per room, not one shared** — the place a template would have been the obvious
choice is exactly the place the rule matters, because a card is not on any page and nobody
opens a PNG in review. `make-og.py` builds each card from the page's own body class with
`love.css` attached and lifts the h1 verbatim, so a room's card cannot drift from the room and
a new room **refuses to build** rather than inheriting somebody else's face.

**A ROOM SOMEBODY BUILT WITH THEIR OWN AI COMES IN THROUGH `tools/import-room.py`, AND IT IS
THEIRS.** Your Room hands out a prompt; their AI builds one self-contained page ending in a
`FOR THE STREET` comment in a fixed `Key: value` shape, and the importer reads it, holds the page to
the street's rules and writes nothing without `--go`. Four things are not obvious:

  · **it refuses rather than fixes**, with every reason at once, because the fix belongs in the
    artifact where the person can see it. The one exception loses nothing: a literal hex that is one
    of the room's own declared colours becomes `var()` of it. Do not teach it to repair anything else.
  · **it leaves the share card, the job marker and the Now Playing line to a person on purpose**, and
    `check-all.sh` stops until they exist. The friendly edit is a card template for imported rooms;
    that is the one place "a card design per room" would quietly stop being true.
  · **everything it writes is between `import:<slug>` markers and is replaced whole on re-import**,
    which is how iterating with their AI works. A change to an imported room belongs in their
    artifact, not between the markers; dressing its plain door means moving it out of them first.
    Importing the same artifact twice changes nothing, and that was tested.
  · **it asks `check-contrast-live.py`'s own probe for every pair by patching the probe's source**, so
    there is one probe rather than two. If that probe changes shape the importer refuses; update the
    patch, do not copy the probe. Its pairs land in `data/rooms/<slug>.json`, labelled as measured by
    the import rather than chosen by a person, and `check-contrast.py` reads them.

  · **a photograph goes into the space the room left for it**, never into the artifact. The page
    marks a space with `data-photo="name"`; the photograph gets an entry `<slug>-<name>` in
    `data/polaroids.json` (on_wall false, `elsewhere` naming the page) and its file in `photos/`,
    stripped of metadata; the import then puts it in, with the record's alt text. Until
    2026-09-29 the importer refused any room waiting for a photograph, although the prompt told
    people to leave a space and send it, and Isha Snow's NeuroHome, the first room to arrive, did
    exactly that. Ryan's call that day: make it easy. **`sips` writes an EXIF block when it
    resizes**; save through Pillow instead. The same day it stopped refusing `:root[data-intensity]`
    (it is `html`) and a room's own `color-scheme`, which the street works out anyway.

A room made with an AI is credited as one, in the room and in the liner notes, because
`design.html` says that is how we treat our own.

**THE SANDBOX'S MAKER IS NAMED IN ITS CREDITS AND NOWHERE ELSE, AT THEIR ASK** (relayed by Ryan,
2026-10-13). The room's own credits and its liner-notes entry name them; nothing else does, and
nothing else may: not a changelog entry, a job, a page of ours, a doc, a code comment or a commit
message. Their artifact says `Named: in the credits only`, which `import-room.py` honours in
everything it writes and remembers across re-imports. **The friendly edit is calling it
their room by name**, because every other imported room here is called its maker's: write "The
Sandbox", "the room" or "its maker" instead. The first commit of the room named them, before they asked; it is history now.

**A ROOM CAN LEAVE A SPACE FOR SOMETHING OF THE STREET'S, AND THE SANDBOX LEFT TWO.** The Sandbox
(§112, 2026-10-13) holds `data-street="suggestions"` inside its suggestion box and
`data-street="contribute"` after it: the import's spaces for things of the street's, the way
`data-photo` is a space for a photograph. Whatever the maker put in one is its fallback; the street's tool,
named in `STREET_SPACES` in `import-room.py`, writes between `<!-- street:<name>:begin -->` markers
on every run of `check-all.sh`, and a re-import carries that over and loads the space's scripts.
`tools/make-sandbox.py` fills both from `data/sandbox.json` and writes `CONTRIBUTING.md` from the
same steps, so the page and the repository cannot tell anybody two different ways in. Its CSS is a
`/* street:sandbox:board */` block straight after the room's section, **in its `--sb-` colours and
nothing else** (the tool refuses any other), with `sbs-` classes so no name of the room's can meet one
of ours. **A space the next version leaves out stops the build**, rather than the box being put
somewhere its maker did not choose; the copy of the artifact with the spaces in it is the one to
import, and they have to keep them. The same import fixed a false positive: `id="main"` on `<main>` itself, which the tool
writes there anyway, is no longer refused.

**THE SUGGESTION BOX IS THE BRASS TACKS BOARD TURNED ROUND.** Ryan, 2026-10-13: anybody reads it,
anybody signed on to the CB drops in a suggestion, a feature request or a bug report with their
handle on it, and a moderator answers, done or not doing, **always with a reply** and their own
username. `addSuggestion`, `answerSuggestion` and `removeSuggestion` in `lib.mjs`, `/cb/suggestions`;
the BASE and CLAIMED marks come from the pass, and taking one down is `canTakeOff`, the CB's rule for
a message. The Markdown is `parseBrass`'s, built on the page by **`markdown.js`, which moved out of
`brass.js` when the box became its second user** (the rack.js rule), and `make-brass.py` and
`make-sandbox.py` both refuse innerHTML in it. A full box refuses rather than pushing the oldest
out. No pictures, because a screenshot of a bug is a picture of somebody's screen; no feed;
`noindex` on every answer; nothing counted. **The friendly edits are a vote button, a count of what
is open, and a screenshot upload**, and each needs a decision of Ryan's written into
`privacy.html#suggestions` first. **A security problem is not for the box**, which says so and points
at SECURITY.md.

**THE FORUMS ARE THE CB'S, FOR WHAT NEEDS LONGER THAN TWO DAYS, AND ONLY A CLAIMED USERNAME READS THEM.** Ryan's
brief, 2026-10-18, after Discourse, so the CB and the forums together are where our community is, for everything. `forum.html`
is paperwork beside the CB guide (pinned on the map, no job marker), and the forums are drawn by `forum.js` in a shadow
root with `cb.css` and `forum.css`, so they **wear the reader's own radio theme, or one chosen for the forums alone**
(`love-forum`): `forum.css` uses the CB's seven colours and nothing else, so no pair is new. The server is the forums
section of `netlify/cb/lib.mjs` and `/cb/forum`: one blob per topic, one index per category (a cache the hourly sweep
repairs), every write conditional, and a version on each topic so an older summary never overwrites a newer one.
**Categories are `data/forum.json`**, written between `forum:categories` markers in `lib.mjs` by `tools/make-forum.py`
(never hand-edit them): each has a keep (`1 week`, `3 months`, `6 months`, `never`, counted from the last post, Ryan's
call, worked out on every read so changing it changes every topic in it), `see` and `start` as CB_MODS roles, and
`strict` for the Executive Session rule. **A category somebody cannot see is never sent to them**, and `forumReader`
refuses everything but a claimed username first. **Every post carries `by`, a hash of the folded name and when it was
claimed (`since`, which `readPass` now returns), and it never leaves the server**: it is how a name deleted and claimed
again by somebody else cannot edit the old owner's posts. **A link on a line of its own is previewed by `safeGet`, once,
when the post is made**: public addresses only (checked in `safeLookup` as the connection is made, every redirect
again), five seconds, no pictures, and never on reading; a YouTube video keeps its length and is a press-to-play button
built by `loveEmbed.frame`, or a door. **Take to the forums on the radio only ticks**: the ids go in the address after
a `#`, and `cbTranscript` copies the messages off the channel itself, so nobody can quote somebody into saying
anything; each sender takes theirs back out under `canTakeOff`; never out of a quiet room, and out of a private room
only into a category no wider than it. Ryan's call: anybody's messages, under the house norm of asking first. **The
friendly edits are a reply count, a view count, unread numbers, a fetched preview image, and the radio sending the
messages' words itself**; each is refused by `make-forum.py` or by the privacy page. `DECISIONS.md` has what is still open.

**A WIKI IS THE ONE PLACE A MODERATOR EDITS SOMEBODY ELSE'S WORDS, AND ONLY THE PAGE.** Ryan, 2026-10-19: support
docs as living documents, in a Wiki category kept for good, where moderators and above edit any of them. A category's
`wiki` in `data/forum.json` names the roles; `forumEditor` in `lib.mjs` is the only way `editPost` reaches past a post's
author, and only to a topic's **first** post, the page. Every reply, in the Wiki too, stays its writer's, the channel's
rule that putting words in somebody's mouth is nobody's. A page says who edited it last (`editedBy`, kept on the post and
shown wherever the post goes), goes only with its whole topic so a reply never becomes the page, and `make-forum.py`
refuses a wiki not kept for good, because an edit does not move a topic's clock. **The friendly edit is letting
moderators edit any post "to fix typos"**; the tool refuses `editPost` asking for a role itself. The pages live in the
forums, not in this repository, so a change to a feature changes its Wiki page there.

**TEAM DOCS IS THE SECOND WIKI, AND A CATEGORY CAN STAND IN ANOTHER NOW.** Ryan's ask, 2026-10-20, moving the team's
documents out of Google Docs: Team Docs (staff, moderators and above, kept for good, `wiki`) holding Field Guide, Notes,
Meeting Minutes and Templates. **A subcategory is its parent's in everything but its name, words and what it holds**:
`make-forum.py` copies the group, keep, roles, strict and wiki down and refuses a subcategory that sets its own, so nobody
is ever sent a subcategory of a category they cannot read. `topics: false` is a shelf (Team Docs, Meeting Minutes), which
`startTopic` and a move refuse. **Meeting Minutes' years are made by the server, not listed** (`years` in the data,
`forumCategories(now)` in `lib.mjs`, on the street's clock), so a year is there on the first of January with nothing to
edit and no generated file that changes with the date: **pass `now` to `forumCat` and `forumCatsFor`**, and never read
`FORUM_CATEGORIES` for what exists, which is only the listed ones. **Templates are topics** in a category marked
`templates` (`forumTemplates`), after the Drive's templates folder; using one copies its title and words in the browser,
a pinned one is the read-me, and nothing records who used which. **A picture in the words is `![words](pic:<id>)`**,
placed by `placePictures` in `shapePost` only when the post holds that picture, so `parseBrass` is unchanged and no
picture from anywhere else is ever shown; markdown.js draws it through a `pic` hook a page passes. **The friendly edits
are a template list kept in the data "so it is versioned", a subcategory with roles wider than its parent's, and taking
a picture's address from outside the post "so people can link one"**; the first stops the team keeping its own
templates, the other two break the forums' oldest promises. **A wiki's page may be 150,000 characters and every other post
20,000** (`bodyMost`, Ryan's call the same day, so board minutes with their transcript go up whole); a reply is never a
page, and `make-forum.py` refuses `replyTopic` reaching the long limit.

**GRANTMAKING IS NOTION'S GRANTS TABLE, AS TAGGED TOPICS IN A WIKI, NOT A DATABASE.** Ryan's ask, 2026-10-22, after
"replicating Notion's databases and tables is a big build": every grant round is a topic tagged `grant-round`, Grantmaking
keeps topics for good and is a wiki for the directors and board (`data/forum.json`), so each can add their name to a
round's Approvals line as the table's multi-select let them, and a **Grant Round** template in Templates carries the tag.
**Tags** are `tags` on a topic (`cleanForumTags`, five at most, lower case and hyphens), set when it starts, by a
template, or by `retagTopic` (its starter, a wiki's editors, a moderator), and `forumCategory(…, tag)` filters by one;
`tagsOf` lists a category's tags and **never how many carry each**, which `make-forum.py` holds. **`importTopic`** brought
the table's pages in (`~/Documents/GitHub/Stimpunks-Work/notion-grants-import/`): moderators only, at the page's own time
and under the username that made it (its mark that account's as claimed now, as `importTaskComment`'s is), the page id kept
on the topic so a re-run changes it rather than doubling it, one edited here left alone, one taken down here kept down
(`forum-gone`), refused where the category's keep would let it go at once, and **telling nobody**, so the function never
sends `import` to `notifyForum`. The friendly edits are **a count beside each tag**, **a structured Approvals field with an
Approve button**, which is the database build Ryan chose not to make, and **announcing the import**. **Grantmaking names
applicants and is not sealed the way the office is**: `privacy.html#forums` says so, and a later round could link its
people's grant requests with `[[grant:…]]` instead of naming them, which is Ryan's call.

**TASKS ARE THE TEAM'S TO-DO LIST, MOVED FROM ESPOCRM IN STAGES, AND NUMBERS BESIDE THINGS ARE FINE IN THEM.** Ryan's
brief, 2026-10-20: EspoCRM costs $45 a month and is not part of the street, so its tasks come here, iteratively: the
tasks and their list first, then a board and saved filters, then recurring tasks, then a timeline, all done. `tasks.html` (paperwork
beside the forums, in the CB's colours through a shadow root, `tasks.css` the CB's seven tokens only), `tasks.js`,
`/cb/tasks`, the Tasks section at the end of `lib.mjs`, `data/tasks.json` (who reads them, and EspoCRM's own statuses,
priorities and tags, written between `tasks:settings` markers by `tools/make-tasks.py`; never hand-edit them). **Directors,
the board and administrators only** (`tasksAllow`; the board since 2026-10-22, Ryan's call), and a task is assigned only to somebody who could read it (`taskPeople`, from
`CB_MODS`). **One blob holds every task**, the Brass Tacks Board's arrangement, and a change sends only the fields it
changes, laid over the task as it is now, so two directors changing different things both keep theirs. **A task brought
from EspoCRM keeps EspoCRM's id**, so bringing tasks again changes them rather than doubling them: the import can run at
every stage until the cut-over. **The list's filters and order live in the address and nothing is kept in the browser**,
which `privacy.html#tasks` says. **Ryan's call, the same day: the street's rule against numbers beside things does not
apply to tasks or to backend tools**, so the list says how many match and how many each filter choice would show; the
rule still holds in every room and in the forums, and a tool that refuses a count there is right. **The board is the
list drawn as columns** (`#/board`, the same filters and address), by status (`board_hides` in the data leaves Canceled
off until ticked), priority or person, each column with its count; **a card moves by dragging or by its own Move to**,
which is how a keyboard, a screen reader and a phone move it, so the friendly edit, dropping Move to because dragging
works, locks them out. **Saved filters are each director's own, on the server**: `task-views/<pet key>`, each an id, a
name and an address and nothing about when, shown to nobody else, deleted by Forget me and by deleting the username;
`make-tasks.py` refuses a saved filter kept with more, or either deletion leaving them. **Recurring tasks make their
own tasks, as EspoCRM's did** (`task-recurs`, `makeRecurring` in `lib.mjs`): on its `next` day, by the street's
Colorado clock (`today()`), a switched-on one makes a task starting `startAfter` and due `dueAfter` days later, its
name's `{week}` (ISO), `{year}` (that week's year when the name has a week) and `{month}` filled in, and moves its day
on (`recurAfter`; a monthly one keeps its day of the month, `day`). `cb-recur.mjs` runs it hourly and opening the list
runs it too. **A made task carries `recur` and `on` and no maker**, and that pair is how it is never made twice, which
`lib.test.mjs` races fifteen at once; missed days are each made (up to `TASK_CATCH_UP`), but **switched on again, one
starts from its next day still to come**, because switched off was asked to make nothing. **One brought from EspoCRM
arrives switched off**, so nothing is made twice while EspoCRM is still making its own; switching EspoCRM's off and
ours on was the cut-over, made on 2026-10-20 with Ryan's go, so recurring tasks are made here and nowhere else now: **do not switch EspoCRM's back on** while ours are on. How often one can come round is `repeats` in `data/tasks.json`. **A checklist in a description ticks in place** (Ryan's ask,
the same evening, after EspoCRM's): `parseBrass(body, { boxes: true })` marks `- [ ]` and `- [x]` items as boxes, for
tasks only, so the forums, the board and the suggestion box still show `[ ]` as words; `markdown.js` draws a box
read-only unless the page passes `box`. `tickTask` changes one line of the description, and only where the reader and
a plain scan of the lines agree on every box (`taskBoxes`) and the box's words are the ones the page saw, so a tick can
never land on another box; `make-tasks.py` holds both guards. The friendly edit is matching a box by its number alone.
**The timeline is the list drawn across days** (`#/timeline`, after EspoCRM's calendar timeline), a row per person and a
bar per task from its start to its due day, under the list's filters, address and saved filters; a timeline saved on
this week keeps no day in its address, so it is always this week. Every bar says its days in words, and a day is never
narrower than a short word (the box scrolls sideways instead); the friendly edit is cutting names short to fit.
**A task is somebody's when it is assigned to them or they are also on it** (Ryan, the same evening: "When we think about
task ownership, we include Assigned to and Also on it"), so **Whose** (`whoOf`, `owns` in `tasks.js`) matches both, every
view opens on Mine, and the timeline puts a task in every owner's row, ALSO ON IT where they are not the assignee. An
address with no `who` is Mine and `who=all` is everybody's. The board's columns by person stay by assignee, because a
move there changes who it is assigned to. The friendly edit is a filter by assignee alone, which hides Norah from her
own tasks. **Tags have colours by family** (Ryan's ask, the same evening): `colours` and `tag_colours` in
`data/tasks.json`, the dataviz method's first seven categorical slots in its fixed order, declared in `love.css` as
`--cb-task-<colour>` and `-dark` with black and white inks, every fill and ink pair in `check-contrast.py`.
`tasks.js` measures the reader's radio case to pick the light or dark steps (`toneNow`, `data-tone`). A timeline bar is
filled with its first coloured tag and striped along its foot when it has more than one colour, and a legend says
which tags wear which. **The friendly edit is a colour for every tag**: past eight, nobody can tell them apart, and
`make-tasks.py` refuses a ninth. **A status is a pill after Notion's** (Ryan's ask, 2026-10-21): `status_colours` in
`data/tasks.json`, Notion's pale fill, its dark ink and a dot in its stronger shade, `--cb-status-<colour>`, `-ink` and
`-dot` in `love.css`, one step for every theme, the ink pairs in `check-contrast.py` and the dots in `ORNAMENT`.
**Started is Notion's light blue for In progress, because Norah and Chelsea key off it**, and `make-tasks.py` refuses
Started in any other colour: the friendly edit is a tidier palette. The list's **Whose** column is Assigned to and Also on
it together, alphabetical, and sorts by what the cell says (`whoseOf`). **Sorting on it cannot put a task under one
person**, so the list has **Group by** (`group=` in the address and in saved filters, `groupsOf`, after Notion's By
assignee, Ryan's ask the same day): Whose and Tags put a task under each person or tag it has, the rest once, Nobody and
No tags last. The friendly edit is a Whose column on the board; a card in several columns has no single Move to.

**A TASK'S CHANGES ARE ITS ACTIVITY, AND NEWS TO WHOEVER THEY CONCERN BUT WHOEVER MADE THEM.** Ryan's ask,
2026-10-21, after EspoCRM's stream and notifications and Notion's inbox. `noteTask` in `lib.mjs`, called after
`saveTask`, `tickTask`, `removeTask` and `makeRecurring` write, turns a change into an event (who, when, the task's id and
name then, its kind and `taskChanges`, each field from and to) kept in `task-activity/<task id>` (deleted with the task)
and put in the `task-inbox/<pet key>` of everybody `taskConcerns` names: assignee and also-on-it before and after,
the task's maker, and anybody newly @mentioned in its description (`mentions()`), **never the person who made the change,
and only somebody `taskPeople` still names**. A description's change is `{ field: 'body' }`, never its words; an
EspoCRM import is nobody's change and makes none; a recurring task's task is an event under nobody's name. A list keeps
30 days and 200 entries, read and unread, shown to nobody else; Forget me and deleting the username delete it, and
`make-tasks.py` holds each of those. **Due and overdue are worked out on reading, never kept.** The list says how many
are unread, which tasks may (Ryan's call of 2026-10-20). The friendly edits are **the description's old words in the
activity** "so a change can be undone", **telling the person their own change**, and **a notification for every read**
of a task; the first keeps what privacy.html says is not kept. **Push for tasks is `tasks` in `PUSH_KINDS`** (Ryan's ask,
the same evening): `notifyTask`, called from `noteTask` only after an entry is in its person's list, tells their own devices
with the switch on (or Everything) while the device's pass can still read tasks (`tasksAllow`), never the person who made
the change, with the task's name only under the words switch and never a description's words; the radio offers the switch
only on a base pass, and `cb-sw.js` opens the task (`/tasks.html#/t/<id>`, or Notifications for a deleted one).
`make-tasks.py` holds all of it. The friendly edit is **an unread count in the notification**; Tasks has one, a push does not.
**Tasks from Notion come in the way EspoCRM's did** (Ryan's ask, 2026-10-21, when Notion was still being used a few
weeks after the last sync to EspoCRM): `saveTask` takes `notion`, a page's 32-hex id, which brings one over again rather
than twice, makes no activity, and stays deleted once deleted here (`TASKS_GONE` holds either kind of id). **Notion says
when a page was made and nothing about who made it or when it was finished**, so a Notion import sends `by: null` and
`done: null` and the task page says who and when nowhere, with a link to the page in Notion instead; the friendly edit is
the importer's name and today, which are both wrong. **A Notion page its recurring templates made is not brought** when
Tasks has that recurring task, because EspoCRM's copy of the same day is already here; the importer matches by name and
day and reports where the two disagree rather than changing either. Notion's rows are read through the connector in Claude
(no API key), and the importer and how to run it are in `~/Documents/GitHub/Stimpunks-Work/notion-tasks-import/`.
**Their comments come in too** (Ryan's ask, the same evening): `importTaskComment` (`comment-import` on `/cb/tasks`) keeps
Notion's id for each (`notion`, never sent to a page, which shows only `from: 'notion'`), its writer as a username and its
time, sorts it among the task's comments by that time, mends it when brought again unless edited here, and keeps its id in
`TASKS_GONE` once deleted here; its mark is that username's as claimed now, so its writer can edit it. It is nobody's
change: no activity, no notification, and `talk` only moves forward. **A task brought from EspoCRM has no Notion id**, so
its page is found by name and due day (the nearest within three days for a name Notion repeats); the importer's
`comments.mjs` takes our task id with each comment. **Leave out a comment naming an applicant or a member of the public**,
as the descriptions do: Tasks is not sealed.

**TASKS AND THE OFFICE EACH HAVE A FEED, AFTER NOTION'S, AND IT KEEPS NOTHING.** Ryan's ask, 2026-10-21: a
reverse-chronological feed with previews you can act on. Tasks' is a fourth view (`#/feed`) beside the list, board and
timeline, with their filters, saved filters and address; the office's (`#/feed`) shows grant requests and cases, and
contacts when ticked. **The page orders and filters the lists it already loads, newest change first, and asks
`view=feed&ids=` for one page of cards** (`taskFeed`, `officeFeed`, `FEED_PAGE`, `OFFICE_FEED_PAGE`): each whole, and a
task with its latest changes. Both must ask `tasksAllow`/`officeAllow` first and write nothing, which `make-tasks.py` and
`make-office.py` hold. A card changed there (ticked, completed, moved) is redrawn where it stands, never sent to the top
under the hand that changed it, and keeps the keyboard by a name its parts carry (`data-keep`), because disabling a box
while it saves takes the focus away. A description shows its first few blocks with **More** for the rest, never the rest
hidden under the first, where a box could be reached and not seen. The friendly edits are **a feed of everybody's
activity kept as its own record** (the activity is per task already, and an office log of who changed what is a record
about people that privacy.html does not mention), and **email in the office's feed**: the office keeps only the
dashboard's newest twenty (`office-mail-recent`, 2026-10-22), which is not a feed's worth, and a longer index is Ryan's call.

**A TASK HAS COMMENTS, AFTER ESPOCRM'S STREAM POSTS AND NOTION'S COMMENTS, AND THEIR WORDS STAY IN THEM.** Ryan's ask,
2026-10-21. `task-comments/<task id>` (`commentTask`, `editTaskComment`, `removeTaskComment`, `taskComments` in `lib.mjs`),
oldest first, each its Markdown words, its writer, when, `edited`, and **the forums' `authorMark`, which never leaves the
server**: only the writer edits a comment, so a name deleted and claimed again cannot, and the writer or an administrator
deletes one (`me.admin` tells the page). **A comment is in the activity and in Notifications as `kind: 'commented'` with
the comment's id and never its words**, told to everybody on the task, its maker, anybody who commented before (`why:
'commented'`, last in `TASK_WHY`) and anybody it @mentions; an edit is in nobody's activity and tells only somebody it
newly @mentions, the forums' rule. A task keeps `talk`, when it was last commented on, which the Feed orders by and which
is not `edited`. A comment's address is `#/t/<task>/c/<comment>` (`taskHref`), which opens the task on it, from
Notifications and from a push. `make-tasks.py` holds all of it. The friendly edits are **a comment's words in its
notification or its push** "so you can read it without opening Tasks", which copies the words where deleting the comment
cannot reach them, **an edit history**, and **letting any director edit anybody's comment**.
**The office's contacts, grant requests, cases and mailings take comments too** (Ryan, the same day: "pretty much
everything in The Office should allow comments"), **and so do its templates and filed emails** (the same evening): the
same rules, **sealed** in `office-comments/<record id>` through `updateSealed` (`commentOffice`, `editOfficeComment`,
`removeOfficeComment`, `officeComments`, `commentable()` telling a record by the first letter of its id). **An email goes
by `email-` and its Gmail id**, because a Gmail id is hex and says nothing about what it is (a contact's id can be hex
too), so a bare Gmail id is never taken for anything; its page is `#/m/<Gmail id>`. A record's delete deletes them, and an
email that goes with its only contact (`forgetContactMail`) takes its comments too. A template has a page of its own now
(`#/templates/<id>`, `view=template`), where its comments are. **They are told in Tasks' Notifications**
(`noteOfficeComment`, through `tellTaskPeople`, the one loop that writes a person's list and then tells their devices),
because the office's readers are Tasks' readers; that list is not sealed, so **an office entry carries `what` and `rec`,
the record's kind and id, and never its name**, and neither does its push. **Both pages draw comments with `comments.js`**
(`window.loveComments`: `section`, `box`, `latest`), the rack.js rule for a pattern's second taker: it sets no colour and
asks no server itself; each page passes its prefix, its words and its own `ask`. A third page with comments uses it too.
The friendly edit is **a record's name in its office notification** "so you know which grant request", which carries
sealed data into an unsealed list.

**[[ LINKS A TOPIC, A TASK OR A RECORD OF THE OFFICE, AND A LINK NEVER CARRIES A NAME.** Ryan's ask, 2026-10-21, after Notion's links and backlinks: `links.js` is the `[[` menu on every box that takes words (Tasks' descriptions and comments via `comments.js`, the office's notes and descriptions, the forums' composer, and the radio's message, DM and edit boxes, which load it on demand), each page asking its own function by POST (`action: 'links'`; the radio's `/cb/links`), and a pick puts `[[kind:id]]` in the words: task, topic, grant, case or contact. **Ryan's calls: linking is allowed everywhere and the name is shown only to people who could open it**, so `parseBrass(…, { refs: true })` reads a token into a `ref` node and `nameRefs` names every one in an answer for its reader (`resolveLinks`: `tasksAllow`, `forumAllows`, `officeAllow`, otherwise `{ shut }`, never whether it exists), and Tasks', the office's and the forums' functions answer through `answer()`, never `json(200, …)`; the radio draws chat tokens itself and asks `/cb/links` for names. **Chats leave no backlink, and a chat message is not a link target**: Linked from is kept by the store writers (`linksBefore`/`linksAfter` in `updateList`, `updateDoc` and `updateSealed`, `dropLinksFrom` for deletes outside them), from tasks, their comments, forum posts, contacts, grant requests, cases and office comments only, the office's in the sealed `office-backlinks`, and `backlinksTo` shows a reader only sources they could open. `tools/check-links.py` holds it. The friendly edits are **the name in the token "so the words read well when copied"**, which puts a grantee's name in a public topic, **backlinks from the channel**, which keeps a trace of a chat past its 48 hours, and **a backlink count**, which the forums refuse. `DECISIONS.md` has what is still open. **`links.js` also holds the @ list (`loveLinks.people`) and the drawing of a mention (`loveLinks.mentions`)** for Tasks and the office (Ryan's ask, the same evening), which had neither, and the forums' drawing moved there with them; the radio keeps its own (`markAt` in `cb.js`), in its own file. Tasks offer and draw `taskPeople()`, the office the same list sent as `me.people`, and **the office draws mentions only in comments**, because a description or notes tell nobody and a drawn name would say they were told. A mention opens the profile through `window.loveRadioPeek`.

**EVERY MARKDOWN BOX IN THE FORUMS, TASKS AND THE OFFICE HAS A FORMATTING TOOLBAR, AND THE BOX STAYS PLAIN TEXT.**
Requests from our community, 2026-10-22, most of whom are uncomfortable with Markdown and with link syntax above all; Ryan
chose a toolbar over a visual editor, and the forums, Tasks and the office over the radio. `format.js` (`loveFormat.toolbar`)
puts word buttons over a textarea (Bold, Italic, Link, List, Numbered, Checklist where the box takes boxes, Quote, Heading,
Code), Ctrl or Cmd with B, I and K, a link form for highlighted words, and an address pasted over highlighted words making a
link; every change goes in through `execCommand('insertText')` so Undo takes it back, and the ARIA toolbar pattern keeps it
one tab stop. **The friendly edit is a contenteditable editor "so people see bold as bold"**: it would need our Markdown to
survive a round trip through HTML (tables, checklists, `[[links]]`, @mentions, placed pictures), and `check-links.py` refuses
contenteditable in `format.js`. Mail templates are plain text and get no toolbar.

**A TASK'S, A GRANT REQUEST'S OR A CASE'S NAME IN ITS LIST SHOWS A PREVIEW ON HOVER OR FOCUS, AND `preview.js` IS THE ONE FILE.** Norah's ask, 2026-10-21. `window.lovePreview({ p, box })` makes one card per page, and each list hands every name it watches its own `read(id)` (the feed's `view=feed&ids=`, kept by when the record last changed, never in the browser) and `draw`. It keeps WCAG 1.4.13: Escape puts it away until the pointer or the keyboard leaves that name, the pointer can move onto it, and it stays until they leave; a touch shows nothing. **It is `aria-hidden` and nothing on it can be pressed or reached** (`still()` makes markdown.js's links words and its boxes disabled), because the record's page is one press away with all of it and a screen reader would otherwise hear a description at every row. `make-tasks.py` holds it. The friendly edits are **buttons on the preview** ("Mark it completed from the hover"), which makes it something a keyboard has to get into, and **showing it on touch**, where a tap is the way in. **The forums' bar has Tasks and Office only when `/cb/forum`'s `me` says the pass reaches them** (`tasksAllow`, `officeAllow`), and Tasks' and the office's bars have Forums.

**THE OFFICE IS ESPOCRM'S CONTACTS, AND THEN ITS GRANT REQUESTS AND CASES, AND IT IS SEALED.** Ryan's brief and calls,
2026-10-20, after tasks: move the rest of EspoCRM here in stages so it can be switched off; directors, the board (since
2026-10-22) and administrators only (`officeAllow` is `tasksAllow`); encrypted at rest; nothing recording who reads; and stimpunks.org's forms posting
here through a secret-keyed intake at the cut-over. `office.html` (paperwork beside tasks, in the CB's colours through a
shadow root, `office.css` the CB's seven tokens only), `office.js`, `/cb/office`, the office section at the end of
`lib.mjs`, `tools/make-office.py`. **Every record is sealed with AES-256-GCM under `CB_OFFICE_KEY`** (32 bytes,
base64url, in Netlify and nowhere else) by `seal`, written only by `updateSealed`, and **without the key the office is
shut**, never open in the clear; `make-office.py` refuses a write past `updateSealed`, a fixed nonce, the key read
anywhere but `officeKey`, and a value for it in any file. **Losing the key loses the office**: Ryan keeps a copy of it
somewhere of his own, and changing it means unsealing everything with the old key first. **Most of these people never
signed on to the street, so nothing about them is ever logged** (the function, the office's code and its page), and **a
search never goes into the address**, which goes into the browser's history; only the list's order does. **A contact
brought from EspoCRM keeps EspoCRM's id** and arrives through `importContacts`, two hundred to a sealed write, which
leaves alone one changed here (`edited`) and one deleted here (`office-gone`), so it can run again until the cut-over.
**Its importer reads EspoCRM's API itself** and prints counts and ids only, so nobody's details pass through a
conversation; it lives outside the repository with the tasks importer. **The friendly edits are a search kept in the
address "so it can be shared", a log line for debugging an import, and a second, unsealed copy "for speed"**; each puts
somebody's details where privacy.html#office says they are not. **Grant requests are the office's second record**
(Ryan's ask, the same evening): `office-grants`, sealed beside the contacts, each in a pipeline and at a stage of it,
**the pipelines and stages EspoCRM's own, word for word, in `data/office.json`**, which `make-office.py` writes between
`office:settings` markers in `lib.mjs` (never hand-edit them). **The status follows the stage, and the day it was decided
follows the status** (`settleGrant`): set when it moves to Granted or Denied without one, cleared when it moves back. A
request links its contact by our id, chosen on the page by the contact's email; an import finds it by EspoCRM's id for the
contact (`contactEspo`). A list (filters in the address, a search not) says how many and what they come to, and a board
by stage moves a card by dragging or by Move to. EspoCRM's stage history was not brought over. **A function name in
`lib.mjs` is shared with the whole file**: the first draft's `settle` met the forums' and Node refused the file, which is
the good outcome; a `const` would have done the same, a `var` would not. **Cases are the third record** (`office-cases`): connection
requests and volunteer applications, EspoCRM's types, statuses (each saying whether it is open) and priorities in
`data/office.json`. **A case keeps EspoCRM's number, and the blob keeps `top`, the highest number ever given**, so a new
case takes the next and a deleted one's number never comes back; the friendly edit is numbering by the highest still
there. **Closing a case here sets the day it closed, and an import never does**, because a hundred of EspoCRM's closed
cases have none and today would be a day nobody closed them. The boards of grant requests and cases are one helper,
`columnBoard` in `office.js`.

**STIMPUNKS.ORG'S FORMS COME IN THROUGH THE OFFICE'S INTAKE, AND EVERY ENTRY IS SIGNED.** Ryan, 2026-10-20, stopping the
EspoCRM audition the same evening: `/cb/office/intake` (`cb-office-intake.mjs`, `officeIntake` in `lib.mjs`) takes one
WPForms entry at a time from the **Stimpunks WPForms to the Office** plugin on stimpunks.org's server. The plugin lives in
`~/Documents/GitHub/Stimpunks-Work/stimpunks-wpforms-office/` (a folder with its zip, not a repository; its tests are
`php tests/run.php`), and the EspoCRM plugin beside it is kept as it was installed. **The signature is an HMAC-SHA256
of `t.body` under `CB_OFFICE_INTAKE_KEY`**, in `X-Stimpunks-Signature: t=…,v1=<hex>`, good for five minutes, checked
before the body is read as anything; the key is in Netlify, in stimpunks.org's wp-config.php and in 1Password, and is
never sent. **What each form makes is the office's** (`intake` in `data/office.json`: a name prefix, and a pipeline and
amount or a case type), so the plugin only says which type a form is. The person is found by email or added (an existing
contact keeps their name and takes the newest phone, `editedBy` the form), and a record is never made twice for one
entry (`form`). A phone or email the office cannot read, and the address and payment handles a contact has no field
for, go in the description, so nothing sent is lost. **An import from EspoCRM leaves alone what a form already brought**
(a contact by email, a record by its form entry), for the last sweep of EspoCRM after the switch. The friendly edits are
**a bearer token instead of the signature**, which puts the key in every request and every log that ever records one,
**the plugin deciding names and amounts**, which is two places to change, and **a log line to debug an entry**.

**A JOIN ENTRY MAKES ITS ONBOARDING TASK FROM A TASKS TEMPLATE, AND THE TASK CARRIES A NAME AND LINKS, NEVER ANSWERS.**
Ryan's brief, 2026-10-22, to make onboarding a new community member less manual (the forum's Onboard Community Member
guide was every step by hand). **Tasks has templates** (`task-templates`, `saveTaskTemplate` and its kin in `lib.mjs`,
`#/templates` in `tasks.js`): a name and description that can hold `TASK_FILL_INS` (`{name}`, and `{contact}`, `{case}`
and `{grant}`, which are links and so go in a description, never a name), priority, tags, who, and days after it is made.
Tasks starts with `TASK_TEMPLATE_SEED`, written from `data/tasks.json` with fixed ids, read only while the blob does not
exist, so a seeded template changed or deleted in Tasks stays as it was left. **A form type in `data/office.json`'s intake
may name `task`**, a seeded template's id (`make-office.py` refuses any other): once `officeIntake` has made the record,
`makeFromTemplate` makes the task under nobody's name (`by: null`, `tpl`, the `formed` event), filling `{name}` with the
person's name and the link fill-ins with `[[contact:…]]` and `[[case:…]]`, so the contact and the record list it under
Linked from. It is made only with the record, so a resend makes neither twice, and a deleted template is said on the
record. **The Join form (`community`, WPForms 85366) makes a Join Request case**, the office's copy of the entry. It is
mapped in the plugin's `stimpunks_office_forms` option on stimpunks.org (1.2.0, installed 2026-10-22 through WordPress.com's
plugin upload, the option set through WPVibe), not in wp-config.php, which on WordPress.com needs SFTP; the forms
mapped before it are still in wp-config.php, which wins a clash, and the key is only ever there. The friendly edits are **putting their answers in the task
"so it is all in one place"** (Tasks is not sealed; the guide already said keep their details out of the task), **making
`makeFromTemplate` a page's to call**, and **a template naming somebody in the data** (who onboards is chosen in Tasks).
**Write to them in Gmail takes a mailing template** (`contactWrites`, filled on the server for the contact, a grant
request's fill-ins from their newest): Gmail opens with the words in its address, and the office still sends nothing.
It is on the join request's page too (`officeCase`'s `write`), for its contact. **`{invite}` is a CB invite's link, made
on a press** (Ryan's ask, 2026-10-23): a template with it is filled with everything else and waits, and **Make their
invite** runs `writeInvite` (the `write-invite` action), which makes one `OFFICE_INVITE` (one use, thirty days, a note
naming nobody) through `makeInvite` and fills its link in; only then does the Gmail link open. Each press makes a new one,
**looking at a page makes none**, and **nothing writes down whom an invite was for**, on the invite, the contact or the join
request, the invites' rule; a mailing refuses a template with `{invite}`. `make-accounts.py` holds that only the desk and
`writeInvite` make invites, and `make-office.py` the mailing's refusal. The friendly edits are **reusing one invite per
contact "to save invites"**, which writes down whom it was for, and **making the invite when the page opens**.

**THE MEMBER MAP IS ON THE COMMUNITY CENTER'S WALL, AND IT COUNTS PEOPLE BY PLACE, NEVER BY NAME.** Ryan's brief,
2026-10-22: move the member map off Google My Maps into Stimpunks.World. **Ryan's call over one pin per place: "We like
knowing how many folks are in each place"**, so the map shows how many of us are in each place, and the Mission says the
street counts people there too. One blob, `member-map`, holds one pin per member who gave a place (id, place, country,
latitude, longitude, and for Google's a key), never a name; `memberMap` shows every place once with how many, never an id;
which join request a pin came from is the case's `pin`, sealed. **The world is drawn, never fetched**: Natural Earth's land
(`data/world-land.json`, written by `tools/pull-world-land.py`, kept out of `check-all.sh` because it needs the network),
projected by `tools/make-member-map.py` into `netlify/cb/world.mjs` and the page's SVG (never hand-edit either), and the
tool runs the Python and the JS projection on the same points. `member-map.js` draws the pins and the list from
`/cb/member-map`; `/cb/member-map.svg` is the whole map as an image for stimpunks.org's Individuals page, in its own inks.
**A place is looked up on Nominatim from the server, at a director's press, and only its words are sent** (`mapFind`); a
place within `MAP_NEAR_KM` of one on the map joins it unless the director keeps it apart. The friendly edits are **map
tiles** (a third party asked by every visitor), **a name or a link on a pin**, and **geocoding in the browser**.
**It zooms** (Ryan's question, 2026-10-23: "Can I zoom in on this map?"): buttons under the sheet (Zoom in, Zoom out,
Whole world, and West, North, South, East), a double press, a pinch, Ctrl or Cmd with the wheel, and a drag once zoomed.
**The pins keep their size on the screen while the world grows under them**, which is what pulls a crowded place apart,
and the closest is a unit of the map sixteen pixels wide on any screen. The first zoom asks for `member-map-detail.json`,
our own file, which `make-member-map.py` projects from `data/world-detail.json` (the land finer with its holes, and Natural
Earth's lakes, borders and state lines, from the same pull tool). **It jumps rather than glides, at every setting**: the
tool refuses an animation frame, a timer or a transition moving it, and a zoom button or a way to move it lost from the
page. The friendly edits are **a smooth glide** (motion the dial never asked for), **pins that grow as you zoom** (the
crowding again), and **tiles for the close-up**.

**THE TEAM MAILBOX FILES ITS EMAIL WITH OUR CONTACTS IN THE OFFICE, AND ONLY THAT EMAIL LEAVES GMAIL.** Ryan's choice,
2026-10-20 (a script in the mailbox over a bookmarklet, and the whole email over a line about it): `/cb/office/mail`
(`cb-office-mail.mjs`, the email part of the office section of `lib.mjs`) takes one email at a time from **Stimpunks Gmail
to the Office**, a Google Apps Script in `~/Documents/GitHub/Stimpunks-Work/stimpunks-gmail-office/` (installed in the team
mailbox, not a repository; its tests are `node tests/run.mjs`), signed as the intake is, through the same `hmacSigned`,
under a key of its own, `CB_OFFICE_MAIL_KEY`. **The script is never given an address to find mail by** (a mailing's outbox, below, is the one exception): `addresses` answers a keyed hash
of each contact's (`mailHash`), it sends an email only when somebody on it matches and never on the mailbox's own address,
and `officeMailIn` checks again and keeps nothing of an email with no contact on it. An email is one sealed blob
(`office-mail/<Gmail id>`) filed on each of its contacts in a sealed index (`office-mail-of/<contact>`), whole but for
attachments, which stay in Gmail as names and sizes; deleting one from the office keeps its Gmail id in `office-mail-gone`
so it is never filed again, and deleting a contact deletes the emails filed only on them. **Writing is Gmail's**: the office
opens the thread and Gmail's compose window under the mailbox the email came from. The friendly edits are **giving the
script every contact's address "so it can match"**, which puts the contact list in a Google project, **filing every email
"in case they become a contact"**, which is strangers' mail, **attachments**, which are where people's documents are, and
**sending from the office**, which needs the office to hold a Google credential.
**Somebody new is added by a Gmail label, chosen by a person** (Ryan's choice, 2026-10-20, over a bookmarklet): the
script hands every thread labelled **Office** (or `LABEL`) to `officeMailContact` (`{ action: 'contact' }`), the sender
of its first email, or whoever we sent it to, then sends the thread and remembers it as a `DONE_<thread>` Script
property, so it keeps read-only access to Gmail. `officeMailContact` adds only the name and address off the email, as
`MAIL_BY`, finds somebody already here by address, never makes the mailbox one, and answers only whether it made a
contact; `make-office.py` holds all three. **An email already kept gains a contact who joins it later**
(`officeMailIn` merges `contacts`), so deleting the first contact cannot leave the second pointing at nothing. The
friendly edit is **adding everybody who writes in**, which files newsletters and strangers' mail; the label is the
person's choice of who belongs in the office.
**The dashboard shows the newest email and the mailbox's counts** (Ryan's ask, 2026-10-22, **reversing "an index of recent
mail the office does not keep"** for the dashboard alone). `office-mail-recent` (`noteRecentMail`, `dropRecentMail`) is a
sealed list of the `MAIL_RECENT_KEEP` newest emails filed, by when each was sent: Gmail's id, when, the subject, whether we
sent it and its contacts, never an address or its text. An email deleted here or let go with its contact leaves it, and a
backfill of older mail leaves a full list alone. **It shipped empty**, because only mail filed after it went on it, and a
quiet mailbox left Newest Email saying none; `seedRecentMail` fills it from every contact's own list, merged with what it
holds, when the dashboard finds it missing and each night as a repair. Once an hour the script counts the mailbox (`counts_`, `COUNTED` in its
Script properties) and sends `{ action: 'counts' }` to `officeMailCounts`: unread conversations in the inbox, and the
emails in, out and with a contact in the seven days before it counted and the seven before. A pair is `null` when two weeks
hold more than `COUNT_THREADS` threads, so the dashboard says *not counted* rather than showing a smaller number. It needed
no new Google permission, and the script's log says only that it counted. `make-office.py` holds the list's fields, both
forgettings and the counts as whole numbers. The friendly edits are **the newest email from anybody, not just contacts**,
which is strangers' mail leaving Gmail, **an address on the dashboard "to save a click"**, and **counts per person on the
team** ("who answered most"), which is a record kept against a person.

**THE DASHBOARD AND REPORTS ARE WORKED OUT FROM THE RECORDS EVERY TIME, AND KEEP NOTHING.** Ryan's brief, 2026-10-21:
`officeDashboard` and `officeReports` in `lib.mjs` (`view=dashboard`, `view=reports`), EspoCRM's nine reports by their own
names, and sentences office.js builds from the same numbers, never written by an AI (Ryan's call). **Charts are SVG built
with `createElementNS`, drawn at the width they are shown at**, in the tasks' tag colours (`--cb-task-*`, the dataviz
method's slots, light or dark by the case's measured tone): a pipeline keeps its colour on every chart, every bar says its
number, and every chart has its numbers in a table under it, because several radio themes' cases are close to a series
colour. The friendly edits are **a chart with no table**, **a colour per bar**, and **a summary written by a model** "so it
reads better"; the last sends the office's data somewhere Ryan chose it would not go. **Two things are kept rather than
worked out, because nothing else remembers them**: a sealed line a night (`officeNightly`, from `cb-office-daily.mjs` at
05:50 UTC, late evening in Colorado), counts only, since a record keeps no history of its stages; and the CB's messages a
day (`countMessage` from `cb-transmit`, `channel-days`), three numbers, World, the rooms and `MOD_ROOMS`, **with no handle,
no room and no words**, so a quiet room is never named. Both keep 400 days. The friendly edits are **a count per room**
("which rooms are busy"), which names a quiet room and is the World room's busiest order turned into numbers, and **counting
direct messages**; each is Ryan's call and `privacy.html#day-counts` first. Each pipeline has its own cap
(`dashboard.active_cap`, Ryan's answer after the first live reading added both pipelines against one cap).
**The dashboard is the office's first page** (Ryan's ask, 2026-10-21): `office.html` and any address the router does not
know open it, and `dashboardView` writes `#/dashboard` into the address so it has one; **the contacts are at `#/contacts`**,
so a link meaning the contacts list says that, never `#/`. **Its Newest includes the forum topics posted to last** (the same
day), from `forumLatest` for whoever is reading, so a category they cannot read is never there; `make-office.py` refuses
the dashboard reading the forums any other way. **And the newest email filed**, from `office-mail-recent` (the team
mailbox's paragraph, above). **And, first, the latest form entries** (Ryan's ask, 2026-10-23): the grant requests and
cases carrying a WPForms entry number, the highest first, each named by `form` in `data/office.json`'s intake (the
form's title on stimpunks.org, which `make-office.py` requires of every type), worked out and kept nowhere. The friendly
edit is calling a gap in the numbers a missed entry: spam and the forms the office takes nothing from skip numbers too.

**QUICKBOOKS IS READ AND NEVER WRITTEN, AND ITS TOKENS NEVER LEAVE THE SERVER.** Ryan's choice, 2026-10-21: an Intuit app
of ours (`CB_QB_CLIENT_ID`, `CB_QB_CLIENT_SECRET` in Netlify), connected from the dashboard by a director. `qbConnect` keeps a
sealed state and hands back Intuit's address; Intuit sends them back to `/cb/office/quickbooks` (`cb-office-qb.mjs`), and
`qbCallback` keeps the tokens sealed in `office-qb` only for that state, unused and under ten minutes old. `officeQuickBooks`
(each night from `cb-office-daily.mjs`, and on Read the books now) refreshes the access token, **keeping whatever refresh
token Intuit hands back**, and keeps the last `QB_DAYS` of money in and this year's profit and loss, sealed, replacing the last
read. A deposit line linked to a payment or a receipt already listed is not counted again (`moved`), and the report is read
by its groups' names, never by row position, because Intuit's newer Reports API orders rows as it likes and leaves an empty
value as `""`. **Netlify adds a request's query to a function's relative `Location`** (measured live, not in `netlify dev`),
so the office page arrives with Intuit's used code after a `?`, and office.js's `replaceState` drops it from the address. `qbStatus` is the only answer about it and never carries a token or the company's id. **Intuit's redirect URI
must be exactly `https://stimpunks.world/cb/office/quickbooks`**, so a deploy preview cannot connect. The friendly edits are
**a memo or an email kept "for context"**, **writing to the books** (an invoice from a grant request, say), and **a token in
the page "to call Intuit from the browser"**; each is Ryan's call and `privacy.html#quickbooks` first. `make-office.py` holds it.

**GIVEBUTTER IS READ WITH A KEY, WRITTEN IN ONE WAY ON A DIRECTOR'S PRESS, AND NOBODY WHO GAVE IS KEPT.** Ryan's ask, 2026-10-21:
`officeGivebutter` (each night from `cb-office-daily.mjs`, and on Read Givebutter now) reads the last `GB_MONTHS` of
gifts, every recurring plan and every campaign from `api.givebutter.com` with `CB_GIVEBUTTER_KEY`, and keeps them sealed in
`office-givebutter`, replacing the last read. **A gift keeps its day, amount, payout, campaign, whether recurring and
whether it went through (`gbGift`), and never a name, email, phone, address or message**: Givebutter lets somebody give
anonymously, its API does not say which gifts were, and the dashboard counts without names, so `make-office.py` refuses a
gift kept with more and the part reading a donor field at all. **Each page is asked for by number with the same filters**
(`gbList`), never by following `links.next`, which a paginator may write without the filters, and a list longer than
`GB_PAGES` pages is refused rather than half read. A key Givebutter issues can also write, so it is secret in Netlify. The
friendly edits are **donor names on the newest gifts** "like QuickBooks has", which names somebody who chose not to be, and
**a donor leaderboard**; each is Ryan's call and `privacy.html#givebutter` first. The Givebutter connector in Claude is how
its numbers were explored, never how the site reads them.
**The one write is our mailing lists, from a join request** (Ryan, 2026-10-23: "a director's press sends the name, email
and the lists they said yes to", reversing "never written", with `privacy.html#givebutter-lists` written first). A case's
form type in `data/office.json`'s intake may name `lists`, each the Join form's question word for word and the Givebutter
tag for that list (Members, Newsletter Mailing List, read off the account's own tags); `caseLists` reads the join request's
own answers, and **Add them to Givebutter's lists** on its page runs `gbJoin` (the `gb-join` action), which sends `POST
/v1/contacts` exactly the contact's first and last name, their email, the tags they said yes to and `email_subscription`,
and nothing else. Givebutter matches somebody already there by email and **adds** tags, removing none (its Contact Tags
page), so a second press changes nothing. The case keeps `gb`, which tags and when, sealed. `make-office.py` refuses a second
write anywhere in the Givebutter part, `gbJoin` reading more of the case than its answers, a call to it from anywhere but that
action (never when a form arrives), and the privacy section gone. The friendly edits are **sending on arrival** "to save a
press", which puts every spam entry on our lists, **sending their profile or city "so Givebutter has the whole picture"**,
and **taking somebody off a list from the office**, which is a second kind of write and Ryan's call first.

**OUR MEMBERS PAGE IS WRITTEN IN ONE WAY, ON A DIRECTOR'S SECOND PRESS, AND THE LINE IS BUILT FROM WORDS ALONE.** Ryan's
ask, 2026-10-23: "Add to the Members page on the join request, previewed and editable, written to stimpunks.org with an
application password", with `privacy.html#members-page` written first. stimpunks.org's Individuals page (85372) lists our
members in one WordPress list block, a line each. A case's form type in `data/office.json`'s intake may name `members`: that
page, its address and the Join form's two questions for the words and the website, word for word. `caseListing` reads the join
request's answers (the name from its own name, never an email address) and the panel shows them in boxes to tidy, with How it
will look under them. **Check the Members page** runs `listingLook` (`listing-look`), which reads the page and says whose line
it goes after and whether that name is on it; **Add them to the Members page** runs `listingAdd` (`listing-add`), which reads it
again, **refuses a page changed since the look**, a name already on it and a WordPress user who cannot save unfiltered HTML
(WordPress would strip other blocks as it saved), and writes the page back with one `wp:list-item` added before the list's end
and every other byte as it was. The case keeps `listed`, when. **It writes as one WordPress user of `WP_SITE`, with an
application password in `CB_WP_USER` and `CB_WP_APP_PASSWORD`**, read once in `wpAuth`, and asks that page and its own user's
capabilities and nothing else; `listingLine` escapes every word, so nothing typed on the public form becomes markup on
stimpunks.org, and the panel's preview links only to http or https. `make-office.py`'s `check_members` holds all of it. The
friendly edits are **adding on arrival** "to save a press", which publishes every spam entry, **rebuilding the page's list from
the office's own records**, which overwrites every line somebody edited on stimpunks.org, **HTML in the words "so links work"**,
and **taking somebody off the page from the office**, a second kind of write and Ryan's call first. The name shown is the answer
to the form's `name` question for that page (`Name for the Members page (optional)`, `Organization Name`), once the form asks it.

**OUR ORGANIZATIONS PAGE IS THE MEMBERS PAGE'S PRESS WITH A LOGO, AND THE LOGO GOES WITH ITS CAMERA DATA OFF.** Ryan's ask,
2026-10-23, `privacy.html#organizations-page` first. stimpunks.org's Organizations page (85410) holds one rounded group block per
organization on a pale ground; `organizations` on the Join form's intake names the page, the questions for its words, website and
logo, and the six grounds, by slug and in words. **Check the Organizations page** runs `orgLook` (`org-look`): it reads the page,
picks the ground used least lately, says whether the name or website is on it, and fetches the logos the form kept, **only from
WPForms' own uploads on stimpunks.org (`ORG_LOGO`), following no redirect and never with the application password**, each through
`bareImage`, which takes off what a camera or phone writes (JPEG APPn but JFIF, ICC and Adobe, comments; PNG's text, time and Exif
chunks; WebP's EXIF and XMP), checked again by `carriesMetadata`, and sent to the page as base64 to show from a `blob:`. **Add it to
the Organizations page** runs `orgAdd` (`org-add`): the page's checks, then the chosen logo fetched and stripped again on the server
(never bytes from the page) into the media library with its alt text, then one block from `orgHtml` after the page's last
organization; the case keeps `orgListed`, when. `check_orgs` in `make-office.py` holds all of it. The friendly edits are **taking the
logo from the page "since it already has it"**, which lets a page upload anything, **fetching a logo from wherever the form's answer
points**, and **a colour picker for the ground**, which brings a colour nobody measured onto stimpunks.org.

**A MAILING SENDS, AFTER A DIRECTOR HAS SEEN EVERY EMAIL, AND THE OFFICE STILL SENDS NOTHING ITSELF.** Ryan's choice,
2026-10-20, over Gmail drafts read and sent by hand: templates (`office-templates`, fill-ins in `FILL_INS`, an unknown one
refused by `unknownFillIns`), a preview of every email filled in and everybody left out with the reason (`stageMail`,
which leaves out no contact, no address and `noEmail`, and with `since` every request submitted before that day),
and `sendMailing`, which refuses unless the template's stamp, the day and the grant requests are the ones the preview showed, sent only from office.js's second press naming everybody. The team
mailbox's script asks `/cb/office/mail` for the **outbox** on every run, **the one answer anywhere that hands it an
address**, sends each with `MailApp` (scope `script.send_mail`, nothing more), one email to each person, and reports it
(`mailSentFor`); `SENT_<id>` in its Script properties is set the moment one goes, so a run cut off before reporting never
sends it twice, and Google's daily limit leaves the rest waiting. **An email sent or stopped keeps only whose and when**
(`settled`): its address and words go, and the email itself comes back as one of the mailbox's, filed on its contact.
`make-office.py` holds each of those. The friendly edits are **a BCC to the whole stage** (one email showing nobody's
address is the reason for one each), **a mailing that skips the preview**, **sending to somebody who asked not to be
emailed "just this once"**, and **the office keeping a Google login** to send by itself.

**PICTURES, FILES AND @MENTIONS CAME THE SAME EVENING, AND EACH REVERSED A LINE ABOVE IT.** Ryan, 2026-10-18, reversing
"words only" and "no notifications" for the forums. **A picture goes through `window.loveRedraw`, the radio's one
redraw** (forum.js draws no canvas of its own), and `putForumUpload` refuses one still carrying camera data **and a
picture sent as a file** (`picturish`), which would keep its GPS. A file is one of `FORUM_FILE_TYPES`, checked by its
first bytes (`fileKind`), never a page, a script, an SVG, an archive or a document with macros, 5 MB at most, and goes
as it is, which the privacy page says. An upload waits under `forum-up/`, marked with its writer's `authorMark` so only
they can attach it, and is swept after a day; a post's own are copied to `forum-file/<topic>/<id>` **before** the topic is
written, so no post holds a file that is not there, and are deleted when the post, the topic or an edit lets go of
them. **They have no public address**: `/cb/forum/file` serves one only to a reader `forumFile` finds can read the topic
now and a post in which holds it, so moving a topic moves who can fetch them; a file is sent as
`application/octet-stream`, `attachment`, sandboxed, and forum.js only saves it, never opens it. **@mentions** draw from
the topic's people, anybody claimed on Who's online (`/cb/online`, asked once when an @ is first typed, the
teleporter's precedent), and since 2026-10-22 whoever started or last posted in a topic the reader can read, plus for
Tasks' readers everybody Tasks can assign (`forumPeople`, `view=people`, asked once; Ryan's report: a new topic offered
nobody). Names the reader can see already, never a list of every username; a post keeps `at`, the handles `mentions()` finds in its words, so a page can draw them as
names; **Mentions** is worked out from the posts on every read (`forumMentions`) and kept nowhere; and `notifyForum`
tells only a device with **When somebody @mentions me** on, whose pass can read the category now, and after an edit only
about a mention that is new. **The friendly edits now are a notification for every reply, a list of your
notifications kept on the server, an unread count beside Mentions, and a picture fetched from a link**: the first two are
records kept against a person, the third a count, the fourth a request on somebody's behalf to a site they never chose.
**And `image/*` is written in two halves in forum.js**, because `make-forum.py` strips comments with a regex that reads a
slash and a star as one; a refusal from that tool about code that is plainly there is that.

**A POLL IS THE ONE PLACE THE FORUMS COUNT, AND A SEALED BALLOT KEEPS NOBODY'S PICK.** Norah's ask, Ryan's calls,
2026-10-22, reversing the forums' tally rule for polls alone (the Mission says the street counts people in two places
now). A topic can open with a poll (`cleanPoll` in `startTopic`; `votePoll`, `closePoll`, `shapePoll` in `lib.mjs`),
or have one added later by whoever may change its tags (`addPoll`, Ryan's ask the same day, never over a poll that is
there, whose votes it would throw away), of a kind chosen then and never changed. **A show of hands** keeps each voter's mark, handle and picks and names who
picked what, live; a vote can be changed or taken back. **A sealed ballot** keeps a tally and, apart from it, the
ballots cast (`ballotOf`, a hash of the topic and the voter's mark, so different in every poll), sorted, and nothing
else (`sealVote`): so a sealed vote is never changed, goes after a second press in `forum.js`, **sends nobody a number,
moderators included, until it closes** (`shapePoll` returns first), and stays shut once its results are out, because
votes after them would tell by subtraction who picked what. Results stay in the poll's own order with no winner marked;
`forum.js` puts a number beside votes only between `poll:begin` and `poll:end`, and a list says only POLL.
`tools/make-forum.py` holds each of those. **The friendly edits are a running turnout on a sealed ballot, letting a
sealed vote change "by keeping who picked what", results sorted with the winner on top, a list of who has not voted,
and a count anywhere else in the forums "now that polls have one".**

**EVERY FORUM CATEGORY IS A ROOM ON THE CB, AND ITS READERS ARE ITS ONLY LIST.** Ryan's ask and calls, 2026-10-21:
the radio's This room follows the category being read, so a category's page, a topic in it and a new topic started in it
(`#/new?c=`, or `from=` a category's room) tune to `forum-<slug>` (`FORUM_ROOM` in `lib.mjs`), and the forums' home,
Latest, Mentions, Search and anything the forums refused are The forums' own `forum`. **A category is a room in every
way**: its channel, Be seen here, its call (`stimpunks-forum-<slug>`), Follow this room, Unreads, notifications and
hosting. **A subcategory is its top category's room** (`forumRoomOf`), so all of Team Docs, years and all, is one, and
`forumRoom` refuses a subcategory's tag and one that names no category. **Who may enter is `forumAllows`**: `roomAllows`
hands a `forum-` tag to it before anything else, so a claimed username and the category's roles out of
`data/forum.json` are the one list, and every function that asks `roomAllows` locks a staff category's room exactly as
the forums lock its topics; an unclaimed handle hears no category's channel (Ryan's call). `lockedRoom` treats a staff
category's room as one of the base's for the office's day counts and for copying out (`narrowerThan`). **`forum.js` says
where the page is** on `<body>` (`placeRadio`: `data-forum-room`, `data-forum-room-name`, only for a category the server
sent) and fires `love-forum-room`; `cb.js` reads it in `forumHere()`, and **`whereNow()` runs on the page now, not only in
the radio's own window**, retuning, moving Be seen here and stopping hosting when the room changes. **A category's room is
not in `cb-rooms.json`**, which is public: `/cb/rooms` (`forumRooms`, its own endpoint because `cb.js` never talks to
`/cb/forum`) tells a claimed pass the rooms it may enter, and `mergeRooms` puts them after The forums in the radio's
list, so #tags, the teleporter, Who's online and Unreads name a category only to its readers; a notification about one
carries its own `place` for `cb-sw.js`; the World room folds a category's people, call and latest message into The
forums' line; and a category's room cannot be a profile's favourite room. Its address already has a fragment, so a room
link to it carries no `#spot=` (`roomHref`). **`tools/make-forum.py` holds it**: the prefix and the name the same in
`lib.mjs`, `cb.js` and `forum.js`; no page, `MOD_ROOMS`, `QUIET_ROOMS`, `PEBBLE_ROOMS` or `PUBLIC_CALLS` name shaped like
a category's room; and a category's `as` (Directors, Board) taking exactly its Town Hall room's roles and strictness, so
those two lists cannot drift. **The friendly edits are category rooms in `cb-rooms.json`** "so the teleporter lists
them for everybody", which names a staff category to the whole street, **a public category's channel open to an
unclaimed handle**, and **a channel for every subcategory or year**; each reverses one of Ryan's calls.

**GOING BACK IN TASKS, THE OFFICE AND THE FORUMS IS ONE STEP, AND IT IS `steps.js`'S.** Norah's ask, put by Ryan on
2026-10-21, with the scroll his: each app draws its views by the address after the #, so the browser's Back, Forward and
the link above every view (`.tk-back`, `.of-back`, `.fm-back`, a slot outside the view that each app dresses) go back one
view, to where you were in it once it has drawn: the keyboard on the link you followed, held at the height it had, or the
page's own height for anything outside the view (the forums' side list sticks). Every route starts `step.arrive()` and
ends `step.land(done)`; filters go into the address by `step.replace()`, never `history.replaceState`, which drops the
step; a view's old fixed link is `step.up()`, shown only when it was opened on its own; and Save, Cancel, Send and Delete
are `step.go()` or `step.leave()`, which go back when the step behind is where they go and otherwise take the form's
place, so Back never lands on a finished form. A list that pages (`Show more`, Older topics) keeps how far it went with
`step.keep()` and shows it again. **The tab's history holds a key, how far down and the address behind, never a word**
(`clean()`), because a name there is the office's search in the address again; the link back's words and the link
followed are in the page's memory. `tools/check-steps.py` holds it. The friendly edits are smooth scrolling, a view's
title kept in the history "so the link back can say it after a reload", and a back link that always goes to the list.

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
   untouched. Re-verified on 2026-09-20 in The Chappell: thirteen facades, zero external
   requests on load, one press produced one iframe at the right id and left twelve alone. If you touch `love-embed.js`, re-check it in the network panel rather than
   reasoning about it. **The audio room's sequence control is the one place where one press
   starts several files**, which is still consented playback because the visitor asked for the
   sequence — but only as long as the label says how many passages and how long *before* the
   press. If you change that control, the label is the part that keeps the claim true. The
   superposition buttons themselves still make no sound at all: collapsing is a measurement,
   not a play. **The Arcade is the third shape of this claim and the strictest:** nothing on that
   playfield moves until the coin goes in, and the cabinet makes **no sound at all, ever, at any
   setting** — a promise the room states in its own copy, so adding one blip to it turns a design
   decision into a false sentence on a published page.
2. **"Clashing is not the same as illegible."** `tools/check-contrast.py`, one pair per
   text-and-ground combination on the street. It found
   two real failures the first time it ran — white body copy on the Playhouse blue at 4.17, and
   the word clock's copy on violet at 3.36 — both of which would have shipped. It has since
   caught two more in a design that arrived from outside this repo: Helen's `#8a7462` at 4.30 /
   3.85 / 3.43 on the yurt's three grounds, carrying five different labels, and her fourth book
   spine at 3.74. **Add a pair to that file whenever you add a colour to a room** — and when a
   room has an ambient layer, add the composite ground as well, because the flat background is
   not what the type sits on. The Arcade brought two more of those: `#0F1F24`, what the screen
   becomes under its own scanline and the *lighter* of the two grounds the playfield makes, and
   `#2D1C25`, the carpet under the cabinet's glow — dimming one grey there to test the file
   failed the composite harder than the flat colour every time. **The Jungle Room brought its own
   pair of those and one lesson about decoration:** its shafts of light land where they land, so
   every ink is held against the lit ground as well as the dark one — and the canopy of leaves
   across the top of that page measured **2.18** against the ground behind it, a smudge with no
   telling one leaf from another. WCAG does not reach ambient decoration; measure it anyway,
   because a canopy nobody can make out is not a canopy. **Its eight quills are in the
   list too:** WCAG 1.4.3 does not reach a graphic, but a quill you cannot pick out of the
   background is a control you cannot use, and they are held to the body threshold so nobody has
   to remember later which bar applied. Each quill also carries a *name* said out loud on
   contact, because colour is never the only channel here. A checker that does not know about
   the new colour passes silently, which is worse than no checker.
3. **"Gentle takes away the wobble, never the words."** There is no content behind an intensity
   level. Do not add any. **The Adventurer's Guild is where that claim met a reward, and the
   reward gave way rather than the claim:** handing in a quest code says exactly the same
   sentences at Gentle, Regular and MAX, and only the noise and the sparks change. A
   fanfare is decoration. A completion that told somebody *less* at Gentle would be the
   lite-version mistake wearing a party hat. `tools/check-gentle.py` now measures both halves on every page at all
   three settings. The global reset is safe because it carries `!important`; **the
   tilts are not**, because every room resets its own and CSS does not warn when a decorative
   selector out-specifies one — it just renders the louder rule. That nearly shipped on Enid's
   wall (`.polaroid-wall .polaroid:nth-child(even)` at (0,3,0) against a reset at (0,2,1); it is
   `:where()`-scoped now), and it *had* shipped in the Faery Yurt, whose windowsill was still
   rotating at Gentle a day after the room went up. **Scope a tilt with `:where()` so it cannot
   climb above the reset**, and when this refuses, add the reset rather than an exception.
   **The Arcade is where this rule met a game, and the game gave way rather than the rule.** The
   dial governs that room's decoration; the game's speed is a *second* control the player holds,
   defaulting to Slow at Gentle and offering all three settings at every dial position. Do not
   wire the game to the dial — a Gentle that hands somebody a different game is the "lite
   version" mistake with a joystick on it. And **`arcade.js` moves everything with `left`/`top`
   rather than `transform`, deliberately**, because rotation and skew in the computed matrix are
   all `check-gentle.py` can see: a game hidden behind a transform would be asking that checker
   to take the room's word for something. The two transforms in the room are the sprite's
   centring translate and its `scaleX(-1)` turn — both layout, and both visible to the tool.
   Keep it that way. **The otter cabinet holds the same line the hard way:** a twirl and a
   somersault are runs of *drawn frames*, not a rotation applied to one of them, and the angled
   poses are rotated inside their own `<svg>`, where a transform is part of the picture.
   Rotating the sprite would have been three lines and would have made the room's own comment
   false.

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

`make-yurt-sound.py` builds the Faery Yurt's six sound tiles and their credits from
`data/yurt-sound.json` — one marker pair per tile, so the silent tiles stay Helen's own markup.
It **measures each runtime off the file** rather than trusting the data, because every
press-to-play control here says how long before the press and a hand-kept number goes quietly
wrong. **It also sweeps every audio file in the repo, not just its own.** That is the bigger
lesson: three audio tools each guarded the files their own data named, and recordings sat
in `audio/` for an afternoon carrying the iPad, the OS build, a timestamp to the second and a
voice-memo UUID, because they belonged to no tool's patch. Three guards with a hole between them
is a hole. **A voice identifies a person as surely as a face does** — a name and a consent date
are required, and the site says whose voice it is out loud on the press rather than only filing
it in the liner notes.

`make-yurt-yarn.py` draws the Faery Yurt's phonograph and builds the rack under it from
`data/yurt-yarn.json`, Helen's ask on 2026-10-13. **A song that dies on somebody else's playlist is
replaced on the rack, never on the playlist**: AURORA's copy on Helen's answered UNPLAYABLE, so the
card plays the visualiser on AURORA's own channel and the entry carries `replaced` (the old id, the
day, what was measured, and the sentence the card says out loud), because the whole yarn still
reaches the dead copy until Helen swaps it on YouTube. When she has, read the playlist again and take
`replaced` off. **The phonograph is drawn only in colours her room already had**, and its record is
the one thing in it that turns, at MAX and nowhere else: the tool refuses a §14 rule turning it under
any other selector, because the dial's line in her room says MAX turns the record and nothing else
moves. The shine on the record does not turn; light does not go round with a record.

`make-chairy.py` builds what Chairy says from `data/chairy.json`, where **every saying carries the page
it came from**, read out of the Knowledge System mirror's own frontmatter rather than typed. Two of the
28 are **not ours and say so when Chairy speaks them**: "Nothing About Us Without Us" is a motto of the
self-advocacy movement, and "Design for Real Life" is Meyer and Wachter-Boettcher's book. A talking
chair passing a movement slogan off as a house line is the exact failure this site argues against.

`make-polaroids.py` builds Enid's wall and **enforces the promises on `polaroids.html` rather
than trusting them**: no alt text, no named subject, no consent date, or any EXIF still on the
file, and it refuses. **It refuses a filter too** — that page promises we will not "Crop you.
Filter you.", the Faery Yurt's mockup arrived with a sepia wash over its portrait, and a promise
made to everybody is not waived by the person in the picture asking for it, because the next
photo would arrive under a rule already bent once. A frame, a shadow or a mat goes *around* a
picture; a filter is done *to* it. Every photograph wears `class="photo"` so the check has
something exact to look for — **the first version scanned only the classes on the `<img>` and
sailed past `.portrait-frame img { filter: … }`, which is the shape it actually arrives in.
Break a checker on purpose before believing it.** Since the Faery Yurt hangs one of these photographs in Helen's own room,
it also **walks every page rather than only the wall** — the consent record and the publication
being in two different places is precisely where a withdrawal gets half-honoured. A photo
published anywhere with no entry is a refusal; a photo hung outside the wall whose entry does
not list that page is a refusal; a file in `photos/` with no record at all is a refusal. Delete
a withdrawn entry and the tool stops until every page has let go of it. The photographs are **excluded from the site's CC BY-SA licence** and that
exclusion is load-bearing — CC BY-SA cannot be revoked, so a photo published under it could not
be taken back after somebody withdrew, and "it comes down when you say so" would be a promise
the licence contradicted. Withdrawal is deletion, not a hidden flag. **Young people who are doing the work and have said yes THEMSELVES are published and
credited like anybody else** — a rule that kept teenage volunteers and self-advocates off the
page would hand the credit for their own activities to the adults beside them, which is
the thing this organisation exists to refuse. The consent has to be the young person's own;
a parent's does not substitute for it, and withdrawal works for them exactly as it does
for everybody. Too young to give that consent themselves and we do not publish it at all.
**This superseded a flat no-children rule on 2026-09-21** — Ryan's call, after that rule
would have pulled a named teenage volunteer's own photograph off a board she consented to.

`make-readings.py` builds the audio room from `data/readings.json` and prints every passage as
text whether or not its recording exists — the words are the room, and an argument you can only
follow by hearing it is an audio-only requirement. **Do not lift readings from the glossary**: that
entry is mostly curation, and its explanation belongs to Murray, Lawson and Lesser, to the
questionnaire's authors, and to Helen Edgar. The passages here were written for this room so that
nothing recorded is anyone else's to clear.

`make-chappell.py` builds The Chappell's arcade from `data/chappell.json` **and the credits page
with it** — one data file, one tool, both surfaces moving together, the same contract
`make-yells.py` has. Its ids were read off the playlist page's own data and cross-checked
against the watch page's playlist panel; titles, channels and runtimes came from YouTube and not
from memory. It **refuses an id that is not a YouTube id**, because `love-embed.js` validates
before building an iframe and returns *quietly* — a typo is not an error anywhere, it is a button
a reader presses and presses that never becomes a video. It also **refuses a track with no
runtime**: every label in that room says how long before the press, which is the same promise the
audio room's sequence control makes, and a blank one would look like a design choice rather than
a bug. The playlist header says fifteen and thirteen render; YouTube hides private and deleted
entries from everyone but the owner, so thirteen is what plays and the discrepancy is written
down in the data file rather than rounded off.

`make-latibulum.py` builds the burrow's wireless and its television out of `data/latibulum.json`
— a third facade file, because the ids came from a third place and a merged file would leave one
`_source` sentence covering work it never saw. It refuses the same things `make-chappell.py` does
and one more: **a slot with no markers, or markers with no slot.** The two objects are built
differently — a wireless has a grille and a tuning scale, a television has an aerial and two
dials — so each has its own marker pair rather than being rendered from one loop, which makes it
possible to add a track nothing renders or to delete an object and leave a track pointing at a
hole. **Two facades is exactly the size at which somebody decides a list is not worth a tool**,
and it is why both of them are in `check-jukebox.py` as well.

`make-jungle.py` builds The Jungle Room's viewing galleries out of `data/jungle.json` — a fourth
facade file, because the cams came from a fourth place: an events page we publish and do not
otherwise touch from this repo. It refuses everything the other three do, and **a runtime**, for
the reason above. It also refuses a group with no markers in the page, markers for a group the
data does not have, and **a group whose every cam is dark**, which would render as a heading over
nothing. The count of dead cams in the room's own copy is generated rather than typed, for the
reason `check-counts.py` exists: a cam dying should not need somebody to remember a paragraph.

`make-og.py` refuses a page whose body class it has no card for — it refused the Arcade until
that room had a design of its own, which is exactly what it is for — refuses a card whose content
does not fit 1200×630 — Chrome reports the layout back out of the same run that takes the
picture, so the fit is measured rather than assumed — **and it skips descendants of a clipping
`<svg>`**, because the Jungle Room's canopy hangs its leaves off both sides of a band that cuts
them off, so their boxes run past the edge while no ink does. That exclusion reads the computed
overflow rather than assuming it, which is what keeps it a statement about paint; it is the same
narrow carve-out `check-gentle.py` makes for transforms inside a drawing — and **cannot write an `og:image` without
an `og:image:alt`**, because text baked into an image is text nobody can hear. Writing it also
turned up two grounds the rooms had always had and the contrast checker had never named: the
Pink Pony Club's cream headline is 3.01:1 on flat hot pink and **2.64 over its own mirrorball
glow**, which is a live failure of the room's own claim. The card leaves the glow off until
that is decided; see the note at the foot of `check-contrast.py`. **Do not resolve it by
deleting the note.**

**TWO MACS DRAW THE SAME CARD DIFFERENTLY, SO `make-og.py` KEEPS THE COMMITTED ONE WHEN NOTHING
THAT DECIDES IT HAS CHANGED.** Same Chrome on macOS 27.0 and on Helen's 26.5.1 differed on the soft
edges of letters on every card, so each person's run rewrote the whole street. A pixel tolerance was
built first and measured: anti-aliasing moves a thin stroke's core about ten levels, and a contrast fix
to that stroke's ink moves it twenty-odd, so any tolerance that passes the first swallows the second.
**So the card's print is what decides it**: its markup, every computed style except custom properties,
and the bytes of every font family and file it asks for, recorded in `data/og-prints.json` with the
picture's own hash. Same print and the same picture on disk keeps the committed card; anything else is
redrawn. **Do not put custom properties back in the print** (every one in `:root` reaches every card, so
one colour edit redrew the street), **and do not replace it with a pixel tolerance.** The two Macs only
agree while they run the same Chrome.

`make-feed.py` stops if a changelog `<h2>` has no id, because that id is the feed item's permalink
and a feed whose guids move republishes every old entry into somebody's reader as if it were new.
`make-sitemap.py` stops if an HTML file exists that is not in its page order — so a new room
cannot be published unlisted. `make-csp.py` stops if the pre-paint snippet has drifted between
pages, because **a stale CSP hash does not warn**: the browser silently refuses the snippet and
every reader who asked for Gentle gets flashed the loud version instead. That is precisely the
failure the dial exists to prevent, arriving through the security header.

`check-jukebox.py` asks YouTube whether all twenty-three tracks — both lists — still play, and is the one tool kept out
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
