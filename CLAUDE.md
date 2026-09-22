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

**THE BED IS NOT BUILT AND THE BOARD SAYS SO.** A guild is an inn as well as a board. When the
room over it exists it will be about **rest as something owed rather than earned**, which means it
will owe a great deal to The Nap Ministry and Tricia Hersey and must credit them in its own copy
rather than in a footnote — and it will be its own visual world, not a quieter guild. A bedroom
that looked like the job board would make rest look like an administrative category, which is the
precise thing that argument exists to refuse.

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
