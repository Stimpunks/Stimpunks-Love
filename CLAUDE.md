# CLAUDE.md — Stimpunks.Love

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

**A ROOM WITH A GAME IN IT IS THE NEWEST VERSION OF THE SAME ARGUMENT.** The Arcade (§15) is
room seven: grape carpet, a cabinet of hard blocks, a screen that is a different black from the
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
and not ours"), borrowing the framing from starstuff.earth's Quillery, which says Kaya's artwork
"is not ours to redraw stroke for stroke". **That sibling page is wrong about the ownership and
has not been corrected** — do not copy its framing, and raise it with Ryan rather than editing
another repo. What survives the correction is the credit: Kaya's name is on the drawing's own
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

**THE FIRST DAYLIT ROOM IS THE ONE THAT CANNOT BE DARKENED.** The Solarpunk Hermitage (§20) is
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
   level. Do not add any. `tools/check-gentle.py` now measures both halves on every page at all
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
the licence contradicted. Withdrawal is deletion, not a hidden flag. **We do not publish
photographs of children.**

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
