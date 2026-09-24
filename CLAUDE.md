# CLAUDE.md — Stimpunks.World

Guidance for Claude Code working in this repository. `README.md` covers what the site is and
how to run the tools; this file covers the things a session gets wrong.

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
places rather than implied in a diff. Do not change a second thing without asking her.
**Maintenance is the one standing exception, and it is narrow:** Helen approved any needed
maintenance on 2026-09-23 — fixes that change nothing a visitor can see, like the width and height
now on her two photographs. It is not licence to redesign. Anything that changes how her room looks
or reads is still hers to decide, and maintenance done there goes in the changelog like the rest.

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
`love-embed.js` stays the only thing on this site that builds a frame. The listener is on the
button and the builder's is on the document, which is what makes the order reliable rather than a
race between script tags; move it and it breaks silently. It fails back to the top of the list,
never to nothing.

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
those sentences are in the tool that changed.

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
off its own surface. So they are **doors and not screens**, labelled as what they are, with a
borrow link beside them, and the fire itself is Kimmerer in her own voice on authorised channels.
Ryan's call, 2026-09-21, once the provenance was put to him: keep both. `make-sweetgrass.py`
refuses a reading marked `screen`, **because the friendly edit is a real one and it will arrive** —
the doors look broken next to the presses, somebody flips one word, and the page starts doing the
thing it spends a paragraph refusing. It also refuses a talk on the readings' channel and a
reading on a talk's, because those ids arrived looking identical and the channel is all that ever
told them apart.

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
shows the path going in and a thread of smoke. A fourth pitch needs a fourth light; three are gone.

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
stays.** Do not add a third thing without asking her.

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
board, every plate carries the minute its own wire was read and the hall carries the minute the
board was set — **both generated from the same file the rows come out of.** A live camera has no
length to give and publishing one would be a number that goes quietly wrong; a board *has* a time
it was set, so leaving that off would be the identical fault the other way up. **Do not make this
room pretend to be live**, and do not take the times off it.

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
domain lines were grepped out of the transcription each card names; contemporary ones were read off
our own published pages, which is the only footing they stand on.

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
`check-faces.py` reads **both rooms' published markup** — never the generators — in both
directions. Do not add an option by hand; that is what went wrong.

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

**THE BILL IS A MIRROR OF THE PLAYLIST AND SAYS SO.** It was read off the playlist page on 2026-09-23,
in that playlist's order, and a set added to the playlist is on the stage the next time somebody
puts the whole night on and not on the bill until somebody reads the playlist again. The room prints
the date under the bill. `make-laughingstock.py` holds `make-club.py`'s pair &mdash; a runtime required
on every set and refused on the playlist &mdash; and the playlist id is one of YouTube's new short
ones (`PLUGzxgyttDkE`, thirteen characters), which **was verified to embed and to play by pressing
play inside the frame**, not by reading the poster. The playlist's first entry is on the bill,
which is the one row that decides whether the whole night embeds at all.

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
by design; the room prints the date. Screen Two has no rack yet and the house rules say so &mdash;
open in DECISIONS.md.

**CAPTIONS ARE ON BY DEFAULT, AND THAT WAS TESTED FRAMED.** Every frame here uses `data-embed-src`
with `cc_load_policy=1`, which `love-embed.js` builds unchanged. It was verified by framing a
single film and a playlist from a page on the dev server and seeing captions come up; **loading an
embed URL on its own gives Error 153 for every video** and proves nothing, which is
`check-jukebox.py`'s old lesson arriving at a new parameter.

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

**THE CB IS THE ONLY SERVER-SIDE CODE ON THIS SITE, AND IT GOT IN ON NARROW TERMS.** A chat
channel patterned after citizens band radio (Ryan's brief, 2026-09-24): five Netlify Functions in
`netlify/functions/` sharing `netlify/cb/lib.mjs`, one JSON blob in Netlify Blobs holding the latest
ten messages, deleted at midnight Colorado time. **`privacy.html` was rewritten before a line of it
was built**, and every sentence there is enforced in `lib.mjs`: no IP address stored (Netlify's own
`rateLimit` in each function's config counts addresses and never hands them over, so do not "improve"
it by keeping a list), **nothing a person types is ever logged** — no `console.log` of a handle,
message, password or pass, not even while debugging — and a pass is an HMAC keyed by the current
password, so **rotating is changing `CB_PASSWORD` and redeploying** and there is no list of passes
anywhere. `connect-src` is `'self'` and must not go further: a realtime service elsewhere would be a
third party every signed-on visitor talked to on every page. Both passwords live in Netlify's
environment, never in the repo.

**NOBODY WHO HAS NOT SIGNED ON EVER DOWNLOADS `cb.js`.** `love.js` injects it only when a pass is
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
keeps its own clothes in every room, the dial's precedent, and **nothing on it moves or lights up at
any setting**: a receive lamp is an alert with the sound off. **It never claims what it has not
heard** — it says *tuning in* until the first listen answers and *no signal* when one fails, because
"nobody has said anything" is a statement about the channel and only a reply can make it true. It
also never counts: no people on the channel, no unread number.

**OPEN IS ON AND CLOSED IS OFF, AND THAT IS ONE FUNCTION.** `Radio.prototype.tune` is the only place
that decides whether the radio makes requests: open *and* `document.visibilityState === 'visible'`.
Folded or in a background tab it sends nothing, which is both the brief's "if the CB is closed you
get nothing" and the whole of the cost control. **The browser pane in this app reports `hidden` when
the pane is not showing**, so a radio that seems to have stopped listening in a test may be obeying
that rule. Do not add a second timer anywhere else in the file.

**`onlyIfMatch: undefined` IS NOT A CONDITIONAL WRITE, IT IS AN UNCONDITIONAL ONE.** Netlify's local
Blobs emulator sends no etag on a read, so the first draft's compare-and-swap quietly wrote without a
version, and fifteen people transmitting at once came out as three messages, every one told it had
worked. `versioned()` takes the version off a listing on both sides of the read when the read has none,
and the code never writes without one. **The emulator's conditional write is also not atomic**, so
concurrency cannot be tested against it at all: the logic was tested against an in-memory store whose
check-and-write is atomic, with `node --experimental-test-module-mocks`, down both etag paths. Test it
that way again after touching `updateChannel`.

**THE COMMUNITY CENTER IS LIT BY SUN THROUGH A VENETIAN BLIND, AND IT IS THE ONLY COOL PALE GROUND.**
§51: painted powder-blue block at ten in the morning, the light chopped into hard diagonal bars,
stacking chairs, a letterboard over the door, the front desk. **Covenstead is the collision**: the other
daylit interior with light from one side, where it lands in one warm patch on pink limewash. If this
light ever pools into a patch, or the paint warms, it has become Covenstead with a noticeboard, and it is
this room that moves. It is **Dead Tired Society's building in the morning** — there, one hard wedge from
a corridor and every word in the shade; here, every word on the lit wall. The bars are soft (1.33
between the bands) because a hard stripe behind a paragraph is something some readers cannot read
through, and the flat ground under every word is `--ctr-shade`, the darker band. **Varela Round sets
the letterboard and never a sentence; Radio Canada carries what is read.** The house norms are ours,
point at [our covenant](https://stimpunks.org/covenant/) rather than restating it, and say out loud that
a handle proves nothing and BASE is the one mark that is checked.

**THREE NUMBERS AND ONE CREDIT IN THAT ROOM WERE WRITTEN FROM MEMORY AND ALL FOUR WERE WRONG.** Two
ornament notes in `check-contrast.py` gave ratios that had not been measured (1.14 and 1.13; they are
1.21 and 1.19), a third said the desk edge was 5.27 when it measured 4.44 and failed, and the Radio
Canada designers typed into the room's credits named a studio that did not draw it. `pull-foundry.py`
and the pair list caught every one. **Measure before a number goes in a note, and read a designer off
the record.** The habit this site keeps attribution for applies to the numbers in its own tools as well.

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
