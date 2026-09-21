#!/usr/bin/env python3
"""Build the share card for every page, one visual world per room.

A link to this site gets unfurled into a card by whatever pasted it, and the
card is the only part of the street most people ever see. Left to a default,
that card is a grey rectangle with a favicon in it -- which for a site whose
entire argument is that the rooms refuse to share a look would be the blandest
possible misrepresentation of it.

SO THERE IS NO TEMPLATE. There is one per room, and they are allowed to
contradict each other exactly as love.css's room sections do. The street's card
collides six typefaces on purpose; the zine's is a photocopied ransom note; the
quantum room's is a mono face over interference fringes; the plain rooms get a
quiet one because their job is to hold a list. A card that looked like another
room's card would be the harmonising instinct arriving through the back door,
in the one asset nobody reviews because nobody sees it in the repo.

THE CARDS ARE RENDERED WITH THE SITE'S OWN STYLESHEET, not a copy of it. Each
card is a scrap of markup on `<body class="{the page's own body class}">` with
love.css attached, so a room's card cannot drift from the room: change the
Playhouse's h1 and its card changes with it. The only CSS here is the 1200x630
box itself, which belongs to the card rather than to any room.

WHAT IS LIFTED FROM THE PAGE rather than typed again: the h1's markup verbatim
(so the zine keeps its per-word ransom spans and the street keeps its two-part
wordmark), the og:description, and the canonical. A card cannot say something
the page does not.

IT REFUSES on a page whose body class it does not know. A new room needs a card
designed for it, and the failure mode of guessing -- quietly falling back to the
plain card -- would give the new room somebody else's face and nobody would
notice, because the card is not on the page. The Chappell is the proof: it is a
SUBROOM, the place where inheriting the parent's card would have looked most
reasonable, and it got its own. The Faery Yurt is the second proof: it is the
FIRST PITCH IN A NEW AREA, where "the area should have a look" would have been
the excuse, and the field it stands on is cold blue while it is candlelit brown.

IT ALSO REFUSES on a card whose content does not fit the box. Chrome reports the
layout back out of the same run that takes the screenshot, so "it fits" is
measured rather than eyeballed once and assumed forever. A longer title is
enough to push a word off the edge, and a clipped card looks like a bug in
somebody else's timeline rather than a bug here.

EVERY CARD GETS ALT TEXT, and the tool will not write an og:image without one.
Text baked into an image is text nobody can hear, on a site that exists to say
so. The alt describes the card and quotes the words drawn on it, because both
halves are what a sighted reader gets from the unfurl.
"""
import html
import os
import re
import shutil
import struct
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "og"
W, H = 1200, 630

CANDIDATES = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
]


def find_browser():
    for c in [os.environ.get("MAKE_OG_BROWSER"), *CANDIDATES,
              shutil.which("google-chrome-stable"), shutil.which("chromium"),
              shutil.which("chrome")]:
        if c and Path(c).exists():
            return c
    raise SystemExit(
        "REFUSING: no Chrome or Chromium found, so the cards cannot be rendered.\n"
        "Point at one with MAKE_OG_BROWSER=/path/to/chrome, or install one.\n"
        "check-print.py needs the same binary."
    )


# ── The box ──────────────────────────────────────────────────────────────────
# Everything a card needs that is NOT a room's business: the 1200x630 frame, the
# padding, and the footer. Every card but the street's signs itself -- the
# street's wordmark IS the signature -- and each one signs in its own room's
# hand, which is this site's whole argument compressed into one line of type.
CARD_CSS = f"""
html, body {{ width: {W}px; height: {H}px; margin: 0; padding: 0; overflow: hidden; }}
body {{ display: flex; flex-direction: column; min-height: 0; position: relative; }}
.og {{
  flex: 1 1 auto; min-height: 0; position: relative; z-index: 1;
  display: flex; flex-direction: column; justify-content: center;
  padding: 50px 60px; gap: 26px;
}}
.og > * {{ margin: 0 !important; }}
/* Nothing on a card shrinks. With the default flex-shrink, a lede two lines too
   long squeezed its own box instead of growing it, the box still measured 630
   tall, and the fit check below waved through a card whose last line had been
   sliced off. Overflow has to be allowed to happen before it can be measured. */
.og > *, .og-top, .og-bottom {{ flex: 0 0 auto; }}

/* A card is read at a third of this size in a timeline, so everything on it is
   set larger than the room sets it. That is not a different design; it is the
   same design at the distance it is actually looked at. */
.og-lede {{ font-size: 31px; line-height: 1.38; max-width: 860px; }}
.og-foot {{ font-size: 20px; letter-spacing: 1px; }}

/* street — six faces arguing, which IS the page */
.og--street {{ gap: 30px; }}
.og--street .wordmark {{ font-size: 116px; }}
.og--street .tagline {{ max-width: 1070px; gap: 10px 22px; }}
.og--street .tagline .t1, .og--street .tagline .t2 {{ font-size: 37px; }}
.og--street .tagline .t3 {{ font-size: 31px; }}
.og--street .tagline .t4 {{ font-size: 40px; }}
.og--street .tagline .t5 {{ font-size: 24px; }}
.og--street .tagline .t6 {{ font-size: 44px; }}
.og--street .og-foot {{ font-family: 'Bungee', sans-serif; color: #c8bfe0; font-size: 18px; }}

/* pony — mirrorball, cream on hot pink */
.og--pony {{ gap: 30px; }}
.og--pony .og-head {{ display: flex; align-items: center; gap: 30px; }}
.og--pony .mirrorball {{ width: 122px; height: 122px; }}
.og--pony h1 {{ font-size: 96px; margin: 0 !important; }}
.og--pony .og-lede {{ color: #2b0a1c; font-weight: 500; max-width: 830px; }}
.og--pony .og-foot {{ font-family: 'Shrikhand', sans-serif; color: #FFF3E6;
  text-shadow: 4px 4px 0 #2b0a1c; letter-spacing: 0; font-size: 28px; }}

/* zine — the ransom note, then typewriter */
.og--zine {{ gap: 32px; }}
.og--zine .ransom {{ max-width: 1080px; gap: 10px 14px; }}
.og--zine .ransom .r1 {{ font-size: 94px; }}
.og--zine .ransom .r2 {{ font-size: 82px; }}
.og--zine .ransom .r3 {{ font-size: 86px; }}
.og--zine .ransom .r4 {{ font-size: 76px; }}
.og--zine .ransom .r5 {{ font-size: 92px; }}
.og--zine .og-lede {{ font-family: 'Courier Prime', monospace; font-size: 28px; max-width: 900px; }}
.og--zine .og-foot {{ font-family: 'Special Elite', sans-serif; color: #2e2a22;
  letter-spacing: 0; font-size: 22px; }}

/* quantum — mono over interference, the fringe as the footer */
.og--quantum {{ gap: 26px; }}
.og--quantum h1 {{ font-size: 124px; margin: 0 !important; }}
.og--quantum .og-lede {{ font-family: 'Instrument Serif', serif; font-style: italic;
  font-size: 38px; line-height: 1.22; color: #d8d4ff; max-width: 900px; }}
.og--quantum .fringe {{ height: 92px; }}
.og--quantum .fringe span {{ bottom: 31px; font-size: 25px; letter-spacing: 2px; }}

/* enid — black walls, the sticker wall under the name */
.og--enid {{ gap: 26px; }}
.og--enid h1 {{ font-size: 92px; margin: 0 !important; }}
.og--enid .og-lede {{ color: #ece8f5; max-width: 880px; font-size: 29px; }}
.og--enid .stickers {{ margin: 0 !important; max-width: 1080px; gap: 14px; }}
.og--enid .stickers a {{ font-size: 21px; padding: 12px 20px; }}
.og--enid .stickers .s3, .og--enid .stickers .s7 {{ font-size: 24px; }}
.og--enid .stickers .s5 {{ font-size: 18px; }}
/* #b9b5c9, not the #7d7a8c the room uses for the same size of aside: that grey
   clears 4.5:1 on the flat black wall and only there. The card's footer sits in
   the bottom-left corner, which is where the green half of the glow peaks, and
   over it the grey falls to 3.22. The room already has this line in its
   top-right corner over the violet half, at 3.39. */
.og--enid .og-foot {{ font-family: 'Special Elite', sans-serif; color: #b9b5c9;
  letter-spacing: 0; font-size: 21px; }}

/* play — bunting above, checkerboard floor below, both lifted from the room */
.og--play {{ gap: 32px; }}
.og--play h1 {{ font-size: 106px; margin: 0 !important; }}
.og--play .og-lede {{ color: #fff; font-weight: 500; max-width: 1010px; font-size: 33px; }}

/* chappell — rhinestone Vatican: gold Monoton under the rose window, and the
   stained glass as the footer. THE ONLY CARD BESIDES THE PONY'S WHOSE ROOM HAS
   AN AMBIENT LAYER OVER ITS HEADLINE, and the one that gets to keep it: the
   pony's cream falls to 2.64 over its own glow, this room's gold measures 6.73
   over the brightest part of the rose window, and both numbers are in
   check-contrast.py. Margin is why the rays stay on, not taste. */
.og--chappell {{ gap: 24px; }}
/* align-self, because .og is a flex column and the plate would otherwise
   stretch the full 1080px into an altar frontal. It is a nameplate in the
   room, so it is a nameplate here. */
.og--chappell .nameplate {{ font-size: 21px; letter-spacing: 4px; padding: 9px 20px;
  align-self: flex-start; }}
.og--chappell h1 {{ font-size: 60px; line-height: 1.12; max-width: 1030px; margin: 0 !important; }}
.og--chappell .og-lede {{ font-family: 'Instrument Serif', serif; font-size: 34px;
  line-height: 1.3; color: #EFE4FF; max-width: 950px; }}
.og-glass {{
  position: relative; height: 96px;
  display: flex; align-items: center; justify-content: center;
}}
.og-glass .niche__glass {{
  position: absolute; inset: 0; height: 96px; margin: 0;
  border-bottom: 0; border-top: 4px solid var(--leaf);
}}
.og-glass span {{
  position: relative; background: var(--glass); border: 2px solid var(--leaf);
  border-radius: 30px; padding: 9px 24px;
  font-family: 'Bungee', sans-serif; font-size: 20px; color: var(--leaf); letter-spacing: 1px;
}}

/* campgrounds — a routed park sign at a gate, and the stream along the foot.
   The one card in the set with nothing glowing behind it, because the field has
   nothing glowing in it. */
.og--camp {{ gap: 22px; justify-content: space-between; padding: 52px 60px 0; }}
.og--camp .og-top {{ display: flex; flex-direction: column; gap: 20px; }}
.og--camp .trailmark {{ font-size: 21px; letter-spacing: 2px; }}
.og--camp h1 {{ font-size: 92px; margin: 0 !important; }}
.og--camp .og-lede {{ color: #C6D2C4; max-width: 980px; font-size: 30px; }}
.og--camp .og-foot {{ font-family: 'Alfa Slab One', serif; color: #8FAE88;
  letter-spacing: 1px; font-size: 21px; }}
/* The stream bleeds to the card's edges. `.og > *` pins every child to margin 0
   with !important, so this has to out-specify it rather than out-shout it. */
.og--camp .stream {{ margin: 0 -60px !important; }}
.og--camp .stream svg {{ height: 120px; }}

/* yurt — the tent at night: fairy lights across the top, the smoke hole, and
   Helen's italic serif on her own canvas. IT KEEPS THE AMBIENT LAYER THAT SITS
   BEHIND ITS HEADLINE, and it keeps it for the reason the pony's lost its: the ember
   crown makes a #31231A ground and every ink on this card is measured against
   that in check-contrast.py, so the glow is margin rather than nerve. */
.og--yurt {{ width: 100%; padding: 30px 60px 44px; gap: 22px; }}
.og--yurt .lights {{ padding: 0 40px; }}
.og--yurt .lights span {{ width: 10px; height: 10px; }}
.og--yurt .og-head {{ display: flex; align-items: center; gap: 34px; }}
.og--yurt .crown {{ flex: 0 0 auto; width: 176px; margin: 0; }}
.og--yurt h1 {{ font-size: 104px; margin: 0 !important; }}
.og--yurt .og-lede {{ font-family: 'Crimson Pro', serif; color: #C2AC91; max-width: 1000px; }}
.og--yurt .og-foot {{ font-family: 'Caveat', cursive; color: #A4907B;
  letter-spacing: 0; font-size: 30px; }}

/* arcade — the cabinet, sideways: the marquee bulbs along the top, the name in
   the room's pixel face, and Esmx standing beside it with a full mane. THE ONE
   CARD THAT IS MOSTLY A DRAWING, because this is the only room whose subject is
   a character rather than an argument, and a share card for a game that showed
   no one playing it would be a poster for the wrong thing. */
.og--arcade {{ flex-direction: row; align-items: center; gap: 44px; padding: 44px 58px; }}
.og--arcade .og-top {{ flex: 1 1 auto; display: flex; flex-direction: column; gap: 20px; min-width: 0; }}
.og--arcade .arc-eyebrow {{ font-size: 17px; line-height: 1.6; }}
.og--arcade h1 {{ font-size: 57px; line-height: 1.22; margin: 0 !important; }}
.og--arcade .og-lede {{ color: #B9C6D6; font-size: 27px; line-height: 1.42; max-width: 700px; }}
.og--arcade .og-foot {{ font-family: 'Press Start 2P', monospace; color: #4BF0C6;
  letter-spacing: 0; font-size: 14px; line-height: 1.7; }}
/* Esmx is absolutely positioned inside the playfield in the room. On a card
   there is no playfield, so the sprite goes back to being an ordinary picture. */
.og--arcade .sprite {{ position: static; transform: none; flex: 0 0 auto; width: 326px; }}
/* Sixteen bulbs at the room's size leave a 326px strip stranded in the middle
   of a 1200px card. The marquee is the full width of a cabinet, so it is the
   full width of this. */
.room-arcade .bulbs {{ gap: 30px; padding: 17px 16px; }}
.room-arcade .bulbs span {{ width: 15px; height: 15px; }}

/* latibulum — under the hill, and THE ONLY CARD IN THE SET MADE OF TWO GROUNDS:
   the earth at the top with the lamp pool on it, and a band of lit plaster
   along the foot carrying dark type. That inversion is the room's whole
   structure rather than a flourish on its card — it is the thing that keeps a
   warm brown burrow from being the Faery Yurt, whose card is cream on dark all
   the way down — so the card that left it out would be describing a different
   room. The lamp pool is the room's own gradient at its own strength; every ink
   on the earth here is measured against the #453620 it composites to, in
   check-contrast.py, which is why it stays on. */
.room-latibulum {{ background-image:
  radial-gradient(ellipse 820px 430px at 33% 36%, rgba(240,195,107,.16), transparent 72%); }}
.og--burrow {{ gap: 26px; padding: 46px 60px; }}
.og--burrow .eyebrow {{ font-size: 20px; letter-spacing: 3px; margin: 0 !important; }}
.og--burrow .og-head {{ display: flex; align-items: center; gap: 42px; }}
/* The round door is the room's one drawing and it is lifted from the page, the
   same way the campground's stream and the yurt's crown are. It is centred in
   its own column on the page; on a card it stands beside the name. */
.og--burrow .roundel {{ flex: 0 0 auto; width: 214px; margin: 0 !important; }}
.og--burrow h1 {{ font-size: 94px; line-height: 1; margin: 0 !important; }}
.og--burrow .og-lede {{ font-family: 'Nunito', sans-serif; color: #C9B99F; max-width: 1010px; }}
.og-plaster {{
  flex: 0 0 auto; height: 108px; display: flex; align-items: center;
  justify-content: space-between; gap: 30px; padding: 0 60px;
  background: linear-gradient(180deg, var(--plaster), var(--plaster-2));
  border-top: 3px solid #A8906C;
}}
.og-plaster b {{ font-family: 'Bree Serif', serif; font-weight: 400; font-size: 33px; color: var(--umber); }}
.og-plaster span {{ font-family: 'Nunito', sans-serif; font-size: 21px; color: var(--umber-2); letter-spacing: 1px; }}

/* jungle — THE ONLY CARD ON THIS STREET WITH A ROOF ON IT. The canopy is
   lifted whole from the page rather than redrawn, the same way the campground's
   stream and the burrow's round door are, so the card cannot come to disagree
   with the room about what is over your head. Under it the ground carries the
   room's own light shaft at the room's own strength -- the #232E1A every ink
   here is measured against in check-contrast.py -- and one leaf-shaped
   aperture, which is the shape every screen in the room is cut to. */
.room-jungle {{ background-image:
  linear-gradient(196deg, transparent 0, rgba(245,208,107,.10) 44px, rgba(245,208,107,.10) 78px, transparent 132px),
  radial-gradient(ellipse 900px 420px at 40% 0, rgba(245,208,107,.12), transparent 70%);
  background-position: 22% 0, 50% 0; background-repeat: no-repeat; }}
/* TOP-ALIGNED, and the only card here that is: the roof has to be at the top
   edge rather than centred with everything else, so this one lays out from the
   top and spaces itself. */
.og--jungle {{ gap: 26px; padding: 0 60px 44px; justify-content: flex-start; }}
/* The band carries NO ground of its own — the leaves are drawn straight onto
   the card, so there is no rectangle whose edge can show. And it is WIDER than
   the column rather than pulled sideways by margins: `width: 100%` resolves
   against the padding box, so a negative right margin moved nothing and left a
   visible step 60px in from the right edge of the card. */
.og--jungle .canopy-roof {{ height: 138px; width: calc(100% + 120px) !important; margin: 0 -60px !important; }}
.og--jungle .og-head {{ display: flex; align-items: center; gap: 46px; }}
.og--jungle .eyebrow {{ font-size: 19px; letter-spacing: 4px; margin: 0 !important; }}
.og--jungle h1 {{ font-size: 88px; line-height: 1; margin: 0 !important; }}
.og--jungle .og-lede {{ font-family: 'Cabin', sans-serif; color: #BFD6AC; max-width: 780px; }}
.og--jungle .og-aperture {{
  flex: 0 0 auto; width: 250px; aspect-ratio: 16 / 11;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px;
  background: #041209; border-radius: 68px 8px 68px 8px;
  box-shadow: inset 0 0 0 2px rgba(87,160,92,.55), inset 0 0 70px rgba(0,0,0,.85);
}}
.og--jungle .og-aperture b {{
  font-family: 'Cabin', sans-serif; font-weight: 700; font-size: 21px;
  letter-spacing: 4px; color: var(--sun);
}}
.og--jungle .og-aperture i {{ width: 16px; height: 16px; border-radius: 50%; background: var(--heliconia); }}
.og--jungle .og-foot {{ font-family: 'Cabin', sans-serif; font-weight: 700; color: #57A05C; letter-spacing: 3px; }}

/* quill — THE SCREEN, where the arcade's own card is the cabinet from outside.
   Two cards for one room's machines have to differ from each other as well as
   from the foyer's, or the split that gave them their own cards has bought
   nothing. This one is the flat dark field with Esmx on it and loose quills
   drifting past. */
.og--quill {{ justify-content: space-between; padding: 52px 60px 56px; position: relative; z-index: 1; }}
.og--quill .og-top {{ flex: 0 0 auto; display: flex; flex-direction: column; gap: 18px; }}
.og--quill h1 {{ font-size: 62px; line-height: 1.2; margin: 0 !important; }}
.og--quill .og-lede {{ color: #B9C6D6; font-size: 26px; line-height: 1.42; max-width: 640px; }}
.og--quill .og-foot {{ font-family: 'Press Start 2P', monospace; color: #4BF0C6; letter-spacing: 0; font-size: 14px; }}
.game-quill .og-scene {{ position: absolute; inset: 0; pointer-events: none; z-index: 0; }}
.game-quill .sprite {{ position: absolute; left: 78%; top: 56%; width: 300px; }}
.game-quill .og-quill {{ position: absolute; width: 46px; transform: translate(-50%, -50%); }}
.game-quill .og {{ background: none; }}
.game-quill {{ background: var(--crt); background-image: repeating-linear-gradient(0deg, transparent 0 4px, rgba(255,255,255,.035) 4px 8px); }}

/* otter — the water, which no other card on this street has. Same cabinet,
   nothing behind the glass in common. */
.og--otter {{ justify-content: space-between; padding: 52px 60px 56px; position: relative; z-index: 1; }}
.og--otter .og-top {{ flex: 0 0 auto; display: flex; flex-direction: column; gap: 18px; }}
.og--otter h1 {{ font-size: 58px; line-height: 1.2; margin: 0 !important; }}
.og--otter .og-lede {{ color: #F0D6B4; font-size: 26px; line-height: 1.42; max-width: 660px; }}
.og--otter .og-foot {{ font-family: 'Press Start 2P', monospace; color: #7ABF5A; letter-spacing: 0; font-size: 14px; }}
.game-otter .og-scene {{ position: absolute; inset: 0; pointer-events: none; z-index: 0; }}
.game-otter .otter {{ position: absolute; left: 79%; top: 27%; width: 290px; }}
.game-otter .otter .pose[data-pose="float"] {{ visibility: visible; }}
.game-otter .og-waterline {{ position: absolute; left: 0; right: 0; top: 18%; height: 4px; background: #7ABF5A; opacity: .5; }}
.game-otter .og-frond {{ position: absolute; bottom: 0; width: 84px; transform: translateX(-50%); }}
.game-otter .og {{ background: none; }}
.game-otter {{ background-image: repeating-linear-gradient(0deg, transparent 0 4px, rgba(255,255,255,.035) 4px 8px), linear-gradient(180deg, var(--shoal) 0 44%, var(--bay) 100%); }}

/* pebble — THE ONLY PALE CARD ON THIS STREET. Every other one here is dark,
   because every other room is; this screen is a shore under overcast, so the
   card inverts and sets its type dark on light. Gold on a pale sky measures
   1.9 and was never an option, which is how the inversion got decided rather
   than chosen. */
.og--pebble {{ justify-content: space-between; padding: 52px 60px 56px; position: relative; z-index: 1; }}
.og--pebble .og-top {{ flex: 0 0 auto; display: flex; flex-direction: column; gap: 18px; }}
.og--pebble h1 {{ font-size: 50px; line-height: 1.24; color: #1E2833; text-shadow: none; margin: 0 !important; }}
.og--pebble .og-lede {{ color: #1E2833; font-size: 26px; line-height: 1.42; max-width: 660px; }}
.og--pebble .og-foot {{ font-family: 'Press Start 2P', monospace; color: #1E2833; letter-spacing: 0; font-size: 14px; }}
.game-pebble {{
  background-image:
    repeating-linear-gradient(0deg, transparent 0 4px, rgba(0,0,0,.05) 4px 8px),
    linear-gradient(180deg, var(--sky) 0 40%, var(--sea) 40% 52%, var(--shingle) 52% 100%);
}}
.game-pebble .og {{ background: none; }}
.game-pebble .og-scene {{ position: absolute; inset: 0; pointer-events: none; z-index: 0; }}
.game-pebble .peng {{ position: absolute; left: 78%; top: 88%; width: 190px; }}
.game-pebble .peng .pose[data-pose="stand"] {{ visibility: visible; }}
.game-pebble .og-nest {{ position: absolute; width: 230px; transform: translate(-50%, -100%); }}

/* plain — the four pages with a job rather than a vibe. Quiet, but pinned to
   the frame at both ends rather than floating in the middle of it: an empty
   card reads as unfinished, which is a different thing from restrained. */
.og--plain {{ justify-content: space-between; padding: 54px 60px 58px; }}
.og--plain .og-top {{ display: flex; flex-direction: column; gap: 16px; }}
.og--plain .og-bottom {{ display: flex; flex-direction: column; gap: 24px; }}
.og--plain h1 {{ font-size: 88px; margin: 0 !important; }}
.og--plain .og-kicker {{ font-family: 'Bungee', sans-serif; font-size: 20px;
  letter-spacing: 3px; color: #00D4FF; margin: 0 !important; }}
.og--plain .og-lede {{ color: #c8bfe0; max-width: 1000px; }}
.og--plain .og-rule {{ width: 210px; height: 9px; background: #FF2D95; }}
"""

# Chrome hands the layout back out of the same run that takes the picture. A
# card that overflows is a card with a word sliced off in somebody's timeline.
#
# IT MEASURES EVERY ELEMENT, not the card's outer box. The first version checked
# the container and the page's scroll size, and both are blind here: the card is
# a flex item pinned to 630px and the page clips at the frame, so a description
# long enough to push two lines past the bottom edge grew the text INSIDE a box
# that never changed size, and the check passed on a card that was visibly cut.
# getBoundingClientRect reports where a thing was actually laid out whether or
# not an ancestor clipped it, which is the only measurement that answers the
# question being asked.
FIT_JS = f"""
document.fonts.ready.then(function () {{
  var bad = [];
  document.querySelectorAll('body *').forEach(function (el) {{
    var r = el.getBoundingClientRect();
    if (!r.width && !r.height) return;              // nothing drawn, nothing to clip
    // INSIDE A CLIPPING <svg>, A RECT IS GEOMETRY AND NOT INK. An outermost
    // <svg> establishes a viewport and clips to it, so a shape whose box runs
    // past the edge paints nothing there -- which is how the Jungle Room's
    // canopy is drawn: leaves hanging off both sides of the band, cut by the
    // band. Measuring those is measuring a coordinate rather than a picture,
    // and it failed that card on the first run for a crop that does not exist.
    // The <svg> ITSELF is still measured, and so is any descendant of an svg
    // that has been told NOT to clip -- read off the computed style rather than
    // assumed, so this stays a statement about what is painted.
    var clip = el.closest('svg');
    if (clip && clip !== el && getComputedStyle(clip).overflow.indexOf('hidden') === 0) return;
    var n = String(el.getAttribute('data-fit') || el.className.baseVal ||
                   el.className || el.tagName.toLowerCase()).split(' ')[0];
    if (r.right > {W} + 0.5 || r.bottom > {H} + 0.5 || r.left < -0.5 || r.top < -0.5)
      bad.push(n + ' runs to ' + [r.left, r.top, r.right, r.bottom].map(Math.round).join(','));
    // NOT scrollHeight against clientHeight: half the faces on this street are
    // set with a line-height below 1, so their glyph boxes are legitimately
    // taller than their line boxes and every card failed. Where the ink lands is
    // the question, and the rect above is what answers it.
  }});
  var m = document.createElement('meta');
  m.id = 'og-fit';
  m.setAttribute('content', bad.length
    ? 'OVERFLOW: ' + bad.slice(0, 4).join('; ') + (bad.length > 4 ? '; +' + (bad.length - 4) + ' more' : '')
    : 'ok');
  document.head.appendChild(m);
}});
"""


# ── The cards ────────────────────────────────────────────────────────────────
# One function per room. They are allowed to share nothing, and mostly do not.
# Each returns (ambient markup, card markup, alt text). `p` is the page.

def card_street(p):
    return (
        '<div class="sparkle" aria-hidden="true"></div>',
        f'<div class="og og--street" data-fit="card">'
        f'{p["h1"]}{p["tagline"]}'
        f'<p class="og-foot" data-fit="footer">ONE STREET · NO TWO ROOMS ALIKE · A FIELD PAST THE TREELINE</p>'
        f'</div>',
        "A night-black card scattered with small coloured sparks. “stimpunks” in "
        "white block capitals with pink and cyan offset shadows, “.love” below it "
        "in hot pink script, and six taglines each set in a different typeface: "
        "Queer without fear. Interdependent and here. Divergent and proud. Living "
        "out loud. Plucky pluralism, for human organisms. Becoming and belonging, "
        "with ribald songing. Along the bottom: one street, no two rooms alike, a field "
        "past the treeline.",
    )


def card_pony(p):
    # THE ONLY CARD THAT LEAVES ITS ROOM'S AMBIENT LAYER OFF, and not for taste.
    # The room's headline is cream on hot pink, which measures 3.01:1 flat -- it
    # clears WCAG's 3:1 for large text by four thousandths. The mirrorball glow
    # is a conic sweep of rgba(255,243,230,.16) over that same pink, and at the
    # bright end of a ray the ground goes to #FF5AA6, where cream measures 2.64
    # and the room's own claim stops being true. That is a fault in the room
    # rather than in the card, and it is the room's to fix; what the card can do
    # is not ship a second copy of it. The mirrorball disc stays, so the room is
    # still recognisable. Put the rays back when the headline has margin.
    return (
        "",
        f'<div class="og og--pony" data-fit="card">'
        f'<div class="og-head"><div class="mirrorball" aria-hidden="true"></div>{p["h1"]}</div>'
        f'<p class="og-lede">{p["desc"]}</p>'
        f'<p class="og-foot" data-fit="footer">stimpunks.love</p>'
        f'</div>',
        f"A flat hot pink card. A mirrorball beside "
        f"“{p['h1text']}” in cream script with a dark red shadow, then the line: "
        f"{p['desc_plain']} Signed stimpunks.love.",
    )


def card_zine(p):
    return (
        '<div class="grain" aria-hidden="true"></div>',
        f'<div class="og og--zine" data-fit="card">'
        f'{p["h1"]}'
        f'<p class="og-lede">{p["desc"]}</p>'
        f'<p class="og-foot" data-fit="footer">stimpunks.love · photocopied at 2am · free, always</p>'
        f'</div>',
        f"A photocopied grey-white card with visible scanner grain. “{p['h1text']}” "
        f"as a ransom note — every word a different typeface, some pasted on blocks "
        f"of yellow, black, cyan and red, each at its own angle. Under it, in "
        f"typewriter type: {p['desc_plain']} Along the bottom: stimpunks.love, "
        f"photocopied at 2am, free, always.",
    )


def card_quantum(p):
    return (
        '<div class="glow" aria-hidden="true"></div>',
        f'<div class="og og--quantum" data-fit="card">'
        f'{p["h1"]}'
        f'<p class="og-lede">{p["desc"]}</p>'
        f'<div class="fringe" data-state="open" aria-hidden="true"><span>stimpunks.love</span></div>'
        f'</div>',
        f"A near-black card ruled with fine cyan and violet interference fringes. "
        f"“{p['h1text']}” in a large cyan terminal face, split at the edges into "
        f"pink and green. Below it in italic serif: {p['desc_plain']} A band of "
        f"overlapping interference patterns runs along the foot with stimpunks.love "
        f"across it.",
    )


def card_enid(p):
    return (
        '<div class="glow" aria-hidden="true"></div>',
        f'<div class="og og--enid" data-fit="card">'
        f'{p["h1"]}'
        f'<p class="og-lede">{p["desc"]}</p>'
        f'{p["stickers"]}'
        f'<p class="og-foot" data-fit="footer">stimpunks.love · knock first</p>'
        f'</div>',
        f"A black card washed with violet and green at opposite corners. "
        f"“{p['h1text']}” in a hollow, striped display face in green, then the line: "
        f"{p['desc_plain']} Below, a row of crooked stickers in pink, green, yellow, "
        f"cyan, violet, orange and red reading AUTISTIC, DISABLED, monotropic, QUEER, "
        f"neuroqueer, STIMMING, not a phase. Along the bottom: stimpunks.love, knock first.",
    )


def card_play(p):
    return (
        '<div class="bunting" aria-hidden="true"></div>',
        f'<div class="og og--play" data-fit="card">'
        f'{p["h1"]}'
        f'<p class="og-lede">{p["desc"]}</p>'
        f'</div>'
        f'<div class="floor" data-fit="floor"><span>stimpunks.love</span></div>',
        f"A bright blue card. A strip of red, yellow, green and violet bunting along "
        f"the top; “{p['h1text']}” in a fat rounded yellow face with a hard black "
        f"shadow; then in white: {p['desc_plain']} A black-and-white checkerboard "
        f"floor across the bottom with stimpunks.love on a black tag.",
    )


def card_chappell(p):
    return (
        '<div class="glow" aria-hidden="true"></div>',
        f'<div class="og og--chappell" data-fit="card">'
        f'<p class="nameplate">THE CHAPPELL</p>'
        f'{p["h1"]}'
        f'<p class="og-lede">{p["desc"]}</p>'
        f'</div>'
        f'<div class="og-glass" data-fit="glass">'
        f'<div class="niche__glass" aria-hidden="true"></div><span>stimpunks.love</span>'
        f'</div>',
        f"A near-black indigo card lit from the top by a violet rose window with "
        f"thin gold rays fanning out of it. A small gold plate reading THE CHAPPELL, "
        f"then \u201c{p['h1text']}\u201d in a gold neon-marquee face, and below it in "
        f"serif: {p['desc_plain']} A band of stained glass in ruby, gold, sapphire, "
        f"emerald and amethyst runs along the foot, with stimpunks.love on a gold-"
        f"edged tag across it.",
    )


def card_camp(p):
    # NO AMBIENT MARKUP, deliberately, and it is the only one. Every other card
    # here opens with a sparkle, a grain, a glow or a run of bunting. The
    # campgrounds page has no ambient layer at any dial setting -- that is the
    # whole argument for the area existing -- so putting one on its card would
    # be the card promising quiet in a picture that is not quiet.
    return (
        "",
        f'<div class="og og--camp" data-fit="card">'
        f'<div class="og-top">'
        f'<p class="trailmark">OFF THE STREET · PAST THE TREELINE · NO GATE, NO BELL</p>'
        f'{p["h1"]}'
        f'<p class="og-lede">{p["desc"]}</p>'
        f'</div>'
        f'<p class="og-foot" data-fit="footer">PITCH 01 · PITCH 02 · PITCH 03 · stimpunks.love</p>'
        f'{p["stream"]}'
        f'</div>',
        f"A cold, dark blue-green card with nothing moving on it. Small green "
        f"capitals reading off the street, past the treeline, no gate, no bell, "
        f"then \u201c{p['h1text']}\u201d in a heavy bone-white slab face like a "
        f"routed park sign, and under it: {p['desc_plain']} Lower down, in the "
        f"same slab face: pitch 01, pitch 02, pitch 03, stimpunks.love. Along the "
        f"foot, a drawing of a stream winding across the card with three stones "
        f"in it.",
    )


def card_yurt(p):
    return (
        "",
        f'<div class="yurt og og--yurt" data-fit="card">'
        f'{p["lights"]}'
        f'<div class="og-head">{p["crown"]}{p["h1"]}</div>'
        f'<p class="og-lede">{p["desc"]}</p>'
        f'<p class="og-foot" data-fit="footer">a pitch in the campgrounds · stimpunks.love</p>'
        f'</div>',
        f"A warm near-black card lit amber from the top, with a row of twelve "
        f"small gold and orange fairy-light bulbs strung across it. Below them a "
        f"line drawing of a yurt\u2019s crown \u2014 a lit ring with five roof poles "
        f"fanning down from it \u2014 beside \u201c{p['h1text']}\u201d in large cream "
        f"italic serif capitals. Under that: {p['desc_plain']} Along the bottom, "
        f"handwritten: a pitch in the campgrounds, stimpunks.love.",
    )


def card_arcade(p):
    # The mane is drawn FULL here and it is the markup's own default rainbow,
    # not a colour picked for the card: arcade.js only ever overwrites those
    # twelve fills with what a player actually walked into, so a card that shows
    # them is showing the room's own idea of a finished Esmx rather than a
    # dressed-up one. Nothing here is a second copy of the drawing.
    return (
        p["bulbs"],
        f'<div class="og og--arcade" data-fit="card">'
        f'<div class="og-top">'
        f'<p class="arc-eyebrow">ROOM 07 · THERE IS NO COIN SLOT</p>'
        f'{p["h1"]}'
        f'<p class="og-lede">{p["desc"]}</p>'
        f'<p class="og-foot" data-fit="footer">QUILL DRIFT · OTTERLY ADORBS · NO SCORE · stimpunks.love</p>'
        f'</div>'
        f'{p["esmx"]}'
        f'</div>',
        f"A dark grape card with a row of gold and pink marquee bulbs along the "
        f"top. On the left, small grey pixel capitals reading room 07, there is "
        f"no coin slot, then \u201c{p['h1text']}\u201d in a large "
        f"gold pixel face with a hard black shadow, and under it: "
        f"{p['desc_plain']} Along the foot, in mint: Quill Drift, "
        f"Otterly Adorbs, no score, stimpunks.love. On the right stands Esmx the "
        f"Porkypine \u2014 a pink pig-porcupine with a green snout and belly, an "
        f"earring in one ear and a chunk missing from the other \u2014 with a full "
        f"rainbow mane of twelve spikes trailing back off their shoulders.",
    )


def card_quill(p):
    # The three loose quills are DRAWN HERE and not lifted, and that is the one
    # place this file retypes a shape. The quills on the playfield do not exist
    # in the page: arcade.js makes them when somebody presses start, so there is
    # nothing to lift. Esmx is lifted, mane and all.
    q = ('<svg class="og-quill" viewBox="0 0 40 100" style="left:%s;top:%s"><polygon points="9,97 29,93 22,4" '
         'fill="%s" stroke="#0B0413" stroke-width="2.4" stroke-linejoin="round"/></svg>')
    scene = ('<div class="og-scene" aria-hidden="true">'
             + q % ("62%", "26%", "#FFD93D") + q % ("50%", "72%", "#49D8FF")
             + q % ("88%", "82%", "#FF7AC8") + p["esmx"] + '</div>')
    return (
        scene,
        f'<div class="og og--quill" data-fit="card">'
        f'<div class="og-top">{p["h1"]}<p class="og-lede">{p["desc"]}</p></div>'
        f'<p class="og-foot" data-fit="footer">A CABINET IN THE ARCADE · NO TIMER · NO SCORE · stimpunks.love</p>'
        f'</div>',
        f"A flat near-black screen ruled with faint scanlines. \u201c{p['h1text']}\u201d in a "
        f"large gold pixel face, and under it: {p['desc_plain']} Along the foot, in mint: a "
        f"cabinet in the Arcade, no timer, no score, stimpunks.love. On the right stands Esmx "
        f"the Porkypine \u2014 a pink pig-porcupine with a green snout and belly, an earring in "
        f"one ear and a chunk missing from the other \u2014 with a full rainbow mane. Three "
        f"loose quills in gold, blue and pink drift across the screen around them.",
    )


def card_otter(p):
    frond = ('<svg class="og-frond" viewBox="0 0 40 300" style="left:%s;height:%s"><path d="M20 300 '
             'C 6 230, 32 190, 18 130 C 8 86, 28 50, 20 4" fill="none" stroke="#6FB050" stroke-width="7" '
             'stroke-linecap="round"/><path d="M20 250 q16 -12 20 2 M20 180 q-16 -12 -20 2 '
             'M20 110 q16 -12 20 2 M20 56 q-16 -12 -20 2" fill="none" stroke="#7ABF5A" stroke-width="5" '
             'stroke-linecap="round"/></svg>')
    scene = ('<div class="og-scene" aria-hidden="true"><div class="og-waterline"></div>'
             + frond % ("64%", "62%") + frond % ("80%", "50%") + frond % ("94%", "66%")
             + p["otter"] + '</div>')
    return (
        p["ottdefs"] + scene,
        f'<div class="og og--otter" data-fit="card">'
        f'<div class="og-top">{p["h1"]}<p class="og-lede">{p["desc"]}</p></div>'
        f'<p class="og-foot" data-fit="footer">NOBODY HAS TO WATCH · stimpunks.love</p>'
        f'</div>',
        f"A kelp bay seen from the side, ruled with faint scanlines: lighter green-blue water "
        f"above a pale green waterline, darker below, and three kelp stipes rising from the "
        f"bottom. \u201c{p['h1text']}\u201d in a large gold pixel face, and under it: "
        f"{p['desc_plain']} Along the foot, in green: nobody has to watch, "
        f"stimpunks.love. On the right a sea otter floats on its back at the surface, "
        f"pale belly up and paws on its chest.",
    )


def card_pebble(p):
    # The nest is drawn here because pebbling.js builds the ring at runtime and
    # there is nothing in the page to lift. The penguin IS lifted, drawing and
    # defs both.
    ring = '<ellipse cx="50" cy="58" rx="40" ry="17" fill="none" stroke="#1E2833" stroke-width="3"/>'
    import math as _m
    for _k in range(9):
        _a = _m.pi * 2 * (_k / 9)
        ring += (f'<ellipse cx="{50 + _m.cos(_a) * 40:.1f}" cy="{58 + _m.sin(_a) * 17:.1f}" '
                 'rx="8" ry="6" fill="#A69C90" stroke="#1E2833" stroke-width="2.6"/>')
    for _i, _f in enumerate(("#E8A874", "#6FBFA4", "#EDE9E2")):
        ring += (f'<ellipse cx="{34 + _i * 16}" cy="60" rx="7" ry="5.5" fill="{_f}" '
                 'stroke="#1E2833" stroke-width="2.4"/>')
    scene = ('<div class="og-scene" aria-hidden="true">'
             f'<svg class="og-nest" viewBox="0 0 100 80" style="left:64%;top:93%">{ring}</svg>'
             + p["peng"] + '</div>')
    return (
        p["pengdefs"] + scene,
        f'<div class="og og--pebble" data-fit="card">'
        f'<div class="og-top">{p["h1"]}<p class="og-lede">{p["desc"]}</p></div>'
        f'<p class="og-foot" data-fit="footer">NOTHING IS COUNTED · stimpunks.love</p>'
        f'</div>',
        f"A pale card: an overcast sky over a band of grey-blue sea over a shingle beach, ruled "
        f"with faint scanlines. \u201c{p['h1text']}\u201d in a large dark pixel face \u2014 the only "
        f"card on this site that sets its type dark on light \u2014 and under it: {p['desc_plain']} "
        f"Along the foot: nothing is counted, stimpunks.love. On the right "
        f"a penguin stands beside a nest made of a ring of stones, with a broken shell, a piece of "
        f"sea glass and a pale pebble inside it.",
    )


def card_latibulum(p):
    # NO AMBIENT MARKUP, and for the opposite reason to the campground's. That
    # field has no ambient layer to draw; this room's lamp IS the ground rather
    # than a thing floating over it, so it belongs to the body in CARD_CSS and
    # not to a div. The one drawing on the card is the door, lifted whole.
    return (
        "",
        f'<div class="og og--burrow" data-fit="card">'
        f'<p class="eyebrow">A DOOR ON THE STREET \u00b7 A HILL BEHIND IT</p>'
        f'<div class="og-head">{p["roundel"]}'
        f'<div>{p["h1"]}<p class="og-lede">{p["desc"]}</p></div>'
        f'</div>'
        f'</div>'
        f'<div class="og-plaster" data-fit="wall">'
        f'<b>A burrow of belonging for burnouts.</b><span>stimpunks.love</span>'
        f'</div>',
        f"A dark earth-brown card lit by a low lamp. Small capitals reading a door "
        f"on the street, a hill behind it, then a drawing of a round green door in "
        f"a wooden frame with a brass knob in the middle of it, and beside it "
        f"\u201c{p['h1text']}\u201d in a soft cream slab serif with the line: "
        f"{p['desc_plain']} Along the whole foot of the card, a band of lamplit "
        f"plaster carrying, in dark brown: A burrow of belonging for burnouts. "
        f"stimpunks.love.",
    )


def card_jungle(p):
    # The canopy goes INSIDE the card rather than behind it, because it is the
    # roof and a roof is the first thing you are under rather than a texture you
    # are over. Every other room's ambient layer is a wash; this one is a thing.
    return (
        "",
        f'<div class="og og--jungle" data-fit="card">'
        f'{p["canopy"]}'
        f'<p class="eyebrow">A DOOR ON THE STREET \u00b7 A CANOPY BEHIND IT</p>'
        f'<div class="og-head">'
        f'<div>{p["h1"]}<p class="og-lede">{p["desc"]}</p></div>'
        f'<div class="og-aperture"><i></i><b>LIVE</b></div>'
        f'</div>'
        f'<p class="og-foot" data-fit="footer">NO RUNTIME \u00b7 NOTHING ENDS \u00b7 stimpunks.love</p>'
        f'</div>',
        f"A deep wet-green card with a band of overlapping dark leaves hanging "
        f"across the top of it and one shaft of pale gold light coming down "
        f"through them. Small magenta capitals reading a door on the street, a "
        f"canopy behind it, then \u201c{p['h1text']}\u201d in a large cream serif "
        f"whose strokes swell as they curve, and under it: {p['desc_plain']} To "
        f"the right, a leaf-shaped aperture cut out of the dark \u2014 two pointed "
        f"corners and two round ones \u2014 with an orange dot and the word LIVE in "
        f"it. Along the foot, in green capitals: no runtime, nothing ends, "
        f"stimpunks.love.",
    )


def card_plain(p):
    return (
        "",
        f'<div class="og og--plain" data-fit="card">'
        f'<div class="og-top">'
        f'<p class="og-kicker">STIMPUNKS.LOVE</p>'
        f'<div class="og-rule" aria-hidden="true"></div>'
        f'</div>'
        f'<div class="og-bottom">{p["h1"]}<p class="og-lede">{p["desc"]}</p></div>'
        f'</div>',
        f"A dark indigo card, deliberately quiet. Small cyan capitals reading "
        f"stimpunks.love above a short pink rule, then “{p['h1text']}” in yellow "
        f"block capitals, and the line: {p['desc_plain']}",
    )


CARDS = {
    "street":       card_street,
    "room-pony":    card_pony,
    "room-zine":    card_zine,
    "room-quantum": card_quantum,
    "room-enid":    card_enid,
    "room-play":    card_play,
    "room-chappell": card_chappell,
    "room-arcade":  card_arcade,
    "game-quill":   card_quill,
    "game-otter":   card_otter,
    "game-pebble":  card_pebble,
    "campgrounds":  card_camp,
    "room-yurt":    card_yurt,
    "room-latibulum": card_latibulum,
    "room-jungle":  card_jungle,
    "room-plain":   card_plain,
}


# ── Reading the pages ────────────────────────────────────────────────────────

def field(src, pat, flags=re.S):
    m = re.search(pat, src, flags)
    return m.group(1).strip() if m else ""


def read_page(path):
    src = path.read_text()
    body = field(src, r'<body[^>]*class="([^"]+)"')
    h1 = field(src, r"(<h1\b.*?</h1>)")
    desc = field(src, r'<meta property="og:description" content="([^"]*)"')
    canon = field(src, r'<link rel="canonical" href="([^"]+)"')
    room = next((c for c in body.split() if c in CARDS), None)
    return {
        "file": path.name,
        "stem": path.stem,
        "body": body,
        "room": room,
        "h1": h1,
        "h1text": re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", h1))).strip(),
        "desc": desc,
        "desc_plain": html.unescape(desc),
        "canonical": canon,
        "src": src,
        "path": path,
    }


def main():
    browser = find_browser()
    pages = [read_page(p) for p in sorted(ROOT.glob("*.html"))]

    unknown = [(p["file"], p["body"]) for p in pages if not p["room"]]
    if unknown:
        raise SystemExit(
            "REFUSING: no card is designed for these pages' rooms:\n  "
            + "\n  ".join(f"{f}  (body class=\"{b}\")" for f, b in unknown)
            + "\n\nA new room needs a card of its own, written in this file beside the "
            "others.\nDo not let it fall back to the plain one: the card is the "
            "only part\nof a room most people see, and it would wear somebody else's "
            "face silently."
        )

    thin = [p["file"] for p in pages if not (p["h1"] and p["desc"] and p["canonical"])]
    if thin:
        raise SystemExit(
            f"REFUSING: h1, og:description or canonical missing on: {', '.join(thin)}.\n"
            "The card is built out of the page's own words; it cannot invent them."
        )

    # og:image has to be absolute, and the site's own origin is already written
    # down once in every page's canonical. Taking it from there rather than from
    # a constant in this file means one fewer place for the domain to be stale.
    origins = {p["canonical"].split("/")[0] + "//" + p["canonical"].split("/")[2]
               for p in pages}
    if len(origins) != 1:
        raise SystemExit(
            "REFUSING: the pages disagree about what site they are on:\n  "
            + "\n  ".join(sorted(origins))
            + "\nog:image must be absolute, so the wrong origin is a card that never loads."
        )
    base = origins.pop()

    # Some rooms build their card out of something the page already holds --
    # lifted whole rather than retyped, for the same reason the h1 is: a card
    # that repeats the page in its own words is a card that can come to
    # disagree. The campground's stream and the yurt's crown and fairy lights
    # are drawings rather than lists, and the rule is the same for a drawing.
    lifted = {}
    for key, page, pat in (
        ("tagline",  "index.html",        r'(<ul class="tagline">.*?</ul>)'),
        ("stickers", "enids-room.html",   r'(<ul class="stickers">.*?</ul>)'),
        ("stream",   "campgrounds.html",  r'(<div class="stream".*?</div>)'),
        ("lights",   "faery-yurt.html",   r'(<div class="lights".*?</div>)'),
        ("crown",    "faery-yurt.html",   r'(<div class="crown".*?</svg>\s*</div>)'),
        ("esmx",     "quill-drift.html",  r'(<svg class="sprite".*?</svg>)'),
        ("bulbs",    "arcade.html",       r'(<div class="bulbs".*?</div>)'),
        ("roundel",  "latibulum.html",    r'(<div class="roundel".*?</svg>\s*</div>)'),
        ("canopy",   "jungle-room.html",  r'(<svg class="canopy-roof".*?</svg>)'),
        ("otter",    "otterly-adorbs.html", r'(<div class="otter" id="otter".*?</div>\s*</div>)'),
        ("ottdefs",  "otterly-adorbs.html", r'(<svg width="0" height="0".*?</defs></svg>)'),
        ("peng",     "penguin-pebbling.html", r'(<div class="peng" id="peng-you".*?</div>\s*</div>)'),
        ("pengdefs", "penguin-pebbling.html", r'(<svg width="0" height="0".*?</defs></svg>)'),
    ):
        lifted[key] = field((ROOT / page).read_text(), pat)
        if not lifted[key]:
            raise SystemExit(
                f"REFUSING: the {key} list is gone from {page}, and that room's card "
                "is built\nout of it. Redesign the card on purpose rather than "
                "letting it render empty."
            )

    OUT.mkdir(exist_ok=True)
    built, failed = [], []

    with tempfile.TemporaryDirectory(dir=ROOT) as tmp:
        tmpdir = Path(tmp)
        (tmpdir / "card.css").write_text(CARD_CSS)
        for p in pages:
            p.update(lifted)
            ambient, card, alt = CARDS[p["room"]](p)
            doc = (
                '<!DOCTYPE html>\n<html lang="en" data-intensity="regular">\n<head>\n'
                '<meta charset="utf-8">\n'
                '<link rel="stylesheet" href="../love.css">\n'
                '<link rel="stylesheet" href="card.css">\n'
                f"</head>\n<body class=\"{p['body']}\">\n{ambient}\n{card}\n"
                f"<script>{FIT_JS}</script>\n</body>\n</html>\n"
            )
            html_path = tmpdir / f"{p['stem']}.html"
            html_path.write_text(doc)
            png = OUT / f"{p['stem']}.png"

            proc = subprocess.run(
                [browser, "--headless=new", "--disable-gpu", "--no-sandbox",
                 "--hide-scrollbars", "--force-device-scale-factor=1",
                 "--force-color-profile=srgb",
                 f"--window-size={W},{H}",
                 "--virtual-time-budget=5000",
                 f"--screenshot={png}", "--dump-dom", html_path.as_uri()],
                check=True, capture_output=True, timeout=180,
            )
            fit = field(proc.stdout.decode("utf-8", "replace"),
                        r'<meta id="og-fit" content="([^"]*)"')
            if not png.exists():
                raise SystemExit(f"REFUSING: Chrome produced no image for {p['file']}.")
            raw = png.read_bytes()
            w, h = struct.unpack(">II", raw[16:24])
            if (w, h) != (W, H):
                raise SystemExit(
                    f"REFUSING: {png.name} came out {w}x{h}, not {W}x{H}. Every "
                    "unfurler\ncrops to its own aspect ratio from the size it is given."
                )
            if not fit:
                raise SystemExit(
                    f"REFUSING: {p['file']}'s card did not report whether it fits.\n"
                    "The measurement is the only reason to trust the picture; a card\n"
                    "that skipped it is a card nobody checked."
                )
            ok = fit == "ok"
            (failed if not ok else built).append((p, alt, fit))
            print(f"{'ok  ' if ok else 'FAIL'} {p['room']:<13} {png.name:<22} "
                  f"{len(raw)//1024:>4} KB  {'' if ok else fit}")

    if failed:
        print(
            f"\n{len(failed)} card(s) do not fit {W}x{H}. Shorten the page's "
            "og:description or\nits h1 — or give that room's card more room in "
            "CARD_CSS. Do not ship a clipped\ncard: the crop lands in somebody "
            "else's timeline, where it reads as our bug."
        )
        sys.exit(1)

    # ── Write the tags back into the pages ───────────────────────────────────
    # Alt first, then the image: the tool has no way to emit one without the
    # other, which is the point. Existing tags are removed rather than edited so
    # a card that changed shape cannot leave a stale width behind.
    for p, alt, _ in built:
        src = p["src"]
        src = re.sub(r'^[ \t]*<meta (?:property="og:image[^"]*"|name="twitter:card")'
                     r'[^>]*>\n', "", src, flags=re.M)
        url = f"{base}/og/{p['stem']}.png"
        tags = (
            f'<meta property="og:image" content="{url}">\n'
            f'<meta property="og:image:type" content="image/png">\n'
            f'<meta property="og:image:width" content="{W}">\n'
            f'<meta property="og:image:height" content="{H}">\n'
            f'<meta property="og:image:alt" content="{html.escape(alt, quote=True)}">\n'
            f'<meta name="twitter:card" content="summary_large_image">\n'
        )
        anchor = re.search(r'<meta property="og:url" content="[^"]*">\n', src)
        if not anchor:
            raise SystemExit(f"REFUSING: {p['file']} has no og:url to hang the card on.")
        src = src[:anchor.end()] + tags + src[anchor.end():]
        p["path"].write_text(src)

    rooms = len({p["room"] for p, _, _ in built})
    print(f"\n{len(built)} cards at {W}x{H}, {rooms} rooms, "
          f"{len(built)} pages tagged with an image and its alt text.")


if __name__ == "__main__":
    main()
